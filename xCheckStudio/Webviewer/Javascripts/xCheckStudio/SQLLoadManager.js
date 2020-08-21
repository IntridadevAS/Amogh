let SQLLoadManager = {
    formId: "connectToSQLForm",
    connectToSQLBtnId: "connectToSQLBtn",
    cancelLoadDataFromSQLId: "cancelLoadDataFromSQL",
    loadDataFromSQLBtnId: "loadDataFromSQLBtn",
    serverTypeSelectId: "serverTypeSelect",
    serverSelectId: "serverSelect",
    databaseInputId: "databaseInput",
    authenticationSelectId : "authenticationSelect",
    userNameInputId: "userNameInput",
    passwordInputId: "passwordInput",
    connectionStatusId : "connectionStatus",
    dbTablesTagBoxId : "dbTablesTagBox",
    serverTypeSelect: null,
    serverSelect: null,
    databaseInput: null,
    authenticationSelect : null,
    userNameInput: null,
    passwordInput: null,
    dbTablesTagBox : null,
    connectionStatus : false,   

    open: function () {
        document.getElementById("uiBlockingOverlay").style.display = "block";
        document.getElementById(this.formId).style.display = "block";

        this.init();
    },

    close: function () {
        document.getElementById("uiBlockingOverlay").style.display = "none";
        document.getElementById(this.formId).style.display = "none";

        // dispose controls
        this.dispose();
    },

    init: function () {

        // connect btn
        document.getElementById(this.connectToSQLBtnId).onclick = function () {
            SQLLoadManager.onConnectClicked();
        }

        // cancel load
        document.getElementById(this.cancelLoadDataFromSQLId).onclick = function () {
            SQLLoadManager.close();
        }

        // load btn
        document.getElementById(this.loadDataFromSQLBtnId).onclick = function () {
            SQLLoadManager.onLoadDataClicked();
        }

        // select server type
        let serverTypes = [
            {
                "label": "MS SQL Server",
                "value": "sqlsrv"
            },
            {
                "label": "My SQL",
                "value": "mysql"
            }
        ];
        this.serverTypeSelect = $("#" + this.serverTypeSelectId).dxSelectBox({
            dataSource: serverTypes,
            displayExpr: "label",
            valueExpr: "value",
            placeholder: "Select Server Type...",
            searchEnabled: true,
            onValueChanged: function (data) {
                // populate servers
                let serverType = null;
                if (data.value === "sqlsrv") {
                    serverType = "mssql";
                }
                else if (data.value === "mysql") {
                    serverType = "mysql";
                }   
                SQLLoadManager.serverSelect.option("dataSource", Object.keys(model.dbConnectionInfo[serverType]));

                SQLLoadManager.resetDbTablesTagBox();
                SQLLoadManager.resetConnectionStatus();
            }
        }).dxSelectBox("instance");

        // select server name
        let servers = [];        
        this.serverSelect = $("#" + this.serverSelectId).dxSelectBox({
            dataSource: servers,          
            placeholder: "Select Server Name...",
            searchEnabled: true,
            acceptCustomValue: true,
            onValueChanged: function (data) {
                // populate other input controls
                let serverType = SQLLoadManager.serverTypeSelect.option("value");              
                if (serverType === "sqlsrv") {
                    serverType = "mssql";
                }
                else if (serverType === "mysql") {
                    serverType = "mysql";
                }   
                if (serverType in model.dbConnectionInfo &&
                    data.value in model.dbConnectionInfo[serverType]) {
                    let connectionInfo = model.dbConnectionInfo[serverType][data.value];
                    SQLLoadManager.databaseInput.option("value", connectionInfo.database);
                    SQLLoadManager.userNameInput.option("value", connectionInfo.userName);
                }

                SQLLoadManager.resetDbTablesTagBox();
                SQLLoadManager.resetConnectionStatus();
            }
        }).dxSelectBox("instance");

        // database 
        this.databaseInput = $("#" + this.databaseInputId).dxTextBox({
            placeholder: "Enter Database Name...",
            onValueChanged: function (data) {
                SQLLoadManager.resetDbTablesTagBox();
                SQLLoadManager.resetConnectionStatus();
            }
        }).dxTextBox("instance");

        // authentication
        let authenticationModes = [
            "Windows Authentication",
            "SQL Server Authentication"
        ];
        this.authenticationSelect = $("#" + this.authenticationSelectId).dxSelectBox({
            dataSource: authenticationModes,
            value: "SQL Server Authentication",
            disabled: true, // untill we implement support for "Windows Authentication"
            placeholder: "Select Authentication Mode...",
            searchEnabled: true,
            onValueChanged: function (data) {
                SQLLoadManager.resetDbTablesTagBox();
                SQLLoadManager.resetConnectionStatus();
            }
        }).dxSelectBox("instance");

        // user name
        this.userNameInput = $("#" + this.userNameInputId).dxTextBox({
            placeholder: "Enter UserName...",
            onValueChanged: function (data) {
                SQLLoadManager.resetDbTablesTagBox();
                SQLLoadManager.resetConnectionStatus();
            }
        }).dxTextBox("instance");

        // password
        this.passwordInput = $("#" + this.passwordInputId).dxTextBox({
            mode: "password",
            placeholder: "Enter Password...",
            onValueChanged: function (data) {
                SQLLoadManager.resetDbTablesTagBox();
                SQLLoadManager.resetConnectionStatus();
            }
        }).dxTextBox("instance");

        // tables tagbox
        let tables = [];
        this.dbTablesTagBox = $("#" + this.dbTablesTagBoxId).dxTagBox({
            items: tables,
            // displayExpr: "table_name",
            // valueExpr: "table_name",
            searchEnabled: true,
            hideSelectedItems: true,
            placeholder: "Select Tables...",
            buttons: [{
                name: "selectDBTables",
                location: "after",
                options: {
                    icon: "public/symbols/Add-Filled.svg",
                    // stylingMode: "outlined",
                    type: "normal",
                    onClick: function (e) {
                        let totalItems = SQLLoadManager.dbTablesTagBox.option("items");
                        let value = SQLLoadManager.dbTablesTagBox.option("value");
                        if (!value ||
                            value.length !== totalItems.length) {
                            SQLLoadManager.dbTablesTagBox.option("value", totalItems);
                        }
                        else {
                            SQLLoadManager.dbTablesTagBox.option("value", []);
                        }
                    }
                }
            }]
        }).dxTagBox("instance");

    },

    resetDbTablesTagBox: function () {
        this.dbTablesTagBox.option("value", []);
        this.dbTablesTagBox.option("items", []);
    },

    resetConnectionStatus:function(){
        this.connectionStatus = false;

        document.getElementById(this.connectionStatusId).innerText = "";
        document.getElementById(this.connectionStatusId).style.color = "black";
    },

    onLoadDataClicked: function () {
        if (this.connectionStatus !== true) {
            return;
        }

        // show busy inbdicator
        showBusyIndicator();

        // get connection data
        let serverType = this.getServerType();
        let serverName = this.getServerName();
        let database = this.getDatabaseName();
        let userName = this.getUserName();
        let password = this.getPassword();
        let tables = this.getTables();
        if (serverType === null ||
            serverName === null ||
            database === null ||
            tables === null ||
            tables.length === 0) {
            alert("Insufficient connction info.");

            //hide busy spinner
            hideBusyIndicator();
            return;
        }
        let connectionInfo = {
            "serverType": serverType,
            "serverName": serverName,
            "database": database,
            "userName": userName,
            "password": password,
            "tables" : tables
        }

        let extension = null;
        if (serverType === "sqlsrv") {
            extension = "MSSQL";
        }
        else if (serverType === "mysql") {
            extension = "MYSQL";
        }
        else {
            return;
        }

        // create a tab
        let sourceName = database + "." + extension;        
        viewPanels.addFilesPanel.classList.add("hide");
        var addedSource = controller.addNewFile(sourceName);
        viewTabs.createTab(addedSource);
        viewPanels.showPanel(addedSource.viewPanel);
        viewTabs.addTab.classList.remove("selectedTab");

        // load data from sql sb
        var sourceManager = createSourceManager(
            addedSource.id,
            sourceName,
            extension.toLowerCase(),
            addedSource.visualizer.id,
            addedSource.tableData.id);
        SourceManagers[addedSource.id] = sourceManager;
        sourceManager.LoadData(null, connectionInfo).then(function (result) {
            // save this connection info
            delete connectionInfo["password"];
            delete connectionInfo["tables"];
            if (serverType === "sqlsrv") {
                model.dbConnectionInfo["mssql"][serverName] = connectionInfo;
            }
            else if (serverType === "mysql") {
                model.dbConnectionInfo["mysql"][serverName] = connectionInfo;
            }   

            // filter check case
            filterCheckCases(false);

            //hide busy spinner
            hideBusyIndicator();

            // close this form
            SQLLoadManager.close();
        });
    },

    getServerType: function () {
        let serverType = this.serverTypeSelect.option("value");
        if (!serverType ||
            serverType === "") {
            return null;
        }

        return serverType;
    },

    getServerName: function () {
        let serverName = this.serverSelect.option("value");
        if (!serverName ||
            serverName === "") {
            return null;
        }

        return serverName;
    },

    getDatabaseName: function () {
        let value = this.databaseInput.option("value");
        if (!value ||
            value === "") {
            return null;
        }

        return value;
    },

    getUserName: function () {
        let value = this.userNameInput.option("value");
        if (!value ||
            value === "") {
            return null;
        }

        return value;
    },

    getPassword: function () {
        let value = this.passwordInput.option("value");
        if (!value ||
            value === "") {
            return null;
        }

        return value;
    },

    getTables: function () {
        return this.dbTablesTagBox.option("value");
    },

    onConnectClicked : function () {
        let serverType = this.getServerType();
        if (serverType === null) {
            alert("Please select the server type.");
            return;
        }

        let serverName = this.getServerName();
        if (serverName === null) {
            alert("Please enter the server name.");
            return;
        }

        let database = this.getDatabaseName();
        if (database === null) {
            alert("Please enter the database name.");
            return;
        }

        let userName = this.getUserName();
        // if (userName === null) {
        //     alert("Please enter the user name.");
        //     return;
        // }

        let password = this.getPassword();
        // if (password === null) {
        //     alert("Please enter the database name.");
        //     return;
        // }
        // let serverType = this.serverTypeSelect.option("value");
        // if (!serverType ||
        //     serverType === "") {
        //     alert("Please select the server type.");
        //     return;
        // }

        // let serverName = this.serverSelect.option("value");
        // if (!serverName ||
        //     serverName === "") {
        //     alert("Please enter the server name.");
        //     return;
        // }

        // let database = this.databaseInput.option("value");
        // if (!database ||
        //     database === "") {
        //     alert("Please enter the database name.");
        //     return;
        // }

        // let userName = this.userNameInput.option("value");
        // if (!userName ||
        //     userName === "") {
        //     alert("Please enter the user name.");
        //     return;
        // }

        // let password = this.passwordInput.option("value");
        // if (!password ||
        //     password === "") {
        //     // alert("Please enter the password.");
        //     // return;
        //     password = null;
        // }

        this.testConnection(
            serverType,
            serverName,
            database,
            userName,
            password).then(function (result) {
                if (result.MsgCode === 1) {                    
                    SQLLoadManager.connectionStatus = true;

                    document.getElementById(SQLLoadManager.connectionStatusId).innerText = "Success";
                    document.getElementById(SQLLoadManager.connectionStatusId).style.color = "green";

                    // populate table names                    
                    SQLLoadManager.dbTablesTagBox.option("items", result.Data);
                }
                else {
                    SQLLoadManager.connectionStatus = false;

                    document.getElementById(SQLLoadManager.connectionStatusId).innerText = "Failed";
                    document.getElementById(SQLLoadManager.connectionStatusId).style.color = "red";

                    // clear table names
                    SQLLoadManager.resetDbTablesTagBox();
                    // SQLLoadManager.dbTablesTagBox.option("items", []);
                }
            });
    },

    testConnection : function (
        serverType,
        serverName,
        database,
        userName,
        password
    ) {
        return new Promise((resolve) => {
            var _this = this;

            $.ajax({
                url: 'PHP/PDOConnectionForDatabases.php',
                type: 'POST',
                data: ({
                    "InvokeFunction": "TestConnection",
                    "serverType": serverType,
                    "serverName": serverName,
                    "database": database,
                    "userName": userName,
                    "password": password
                }),
                async: false,
                success: function (msg) {
                    let result = xCheckStudio.Util.tryJsonParse(msg);
                   
                    return resolve(result);
                },
                error: function (xhr, status, error) {
                    return resolve(false);
                },
            });
        });
    },

    dispose: function () {
        this.connectionStatus = false;

        this.disposeServerTypeSelect();
        this.disposeServerSelect();
        this.disposeDatabaseInput();
        this.resetAuthenticationSelect();
        this.disposeUserNameInput();
        this.disposePasswordInput();
        this.disposeDbTablesTagBox();
        this.resetConnectionStatus();
    },

    resetAuthenticationSelect: function () {
        var ele = document.getElementById(this.authenticationSelectId);
        var parent = ele.parentElement;

        $("#" + this.authenticationSelectId).dxSelectBox("dispose");
        $("#" + this.authenticationSelectId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.authenticationSelectId;
        parent.appendChild(newDiv);
    },

    disposeServerTypeSelect: function () {
        var ele = document.getElementById(this.serverTypeSelectId);
        var parent = ele.parentElement;

        $("#" + this.serverTypeSelectId).dxSelectBox("dispose");
        $("#" + this.serverTypeSelectId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.serverTypeSelectId;
        parent.appendChild(newDiv);
    },

    disposeServerSelect: function () {
        var ele = document.getElementById(this.serverSelectId);
        var parent = ele.parentElement;

        $("#" + this.serverSelectId).dxSelectBox("dispose");
        $("#" + this.serverSelectId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.serverSelectId;
        parent.appendChild(newDiv);
    },

    disposeDatabaseInput: function () {
        var ele = document.getElementById(this.databaseInputId);
        var parent = ele.parentElement;

        $("#" + this.databaseInputId).dxTextBox("dispose");
        $("#" + this.databaseInputId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.databaseInputId;
        parent.appendChild(newDiv);
    },

    disposeUserNameInput: function () {
        var ele = document.getElementById(this.userNameInputId);
        var parent = ele.parentElement;

        $("#" + this.userNameInputId).dxTextBox("dispose");
        $("#" + this.userNameInputId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.userNameInputId;
        parent.appendChild(newDiv);
    },

    disposePasswordInput: function () {
        var ele = document.getElementById(this.passwordInputId);
        var parent = ele.parentElement;

        $("#" + this.passwordInputId).dxTextBox("dispose");
        $("#" + this.passwordInputId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.passwordInputId;
        parent.appendChild(newDiv);
    },

    disposeDbTablesTagBox: function () {
        var ele = document.getElementById(this.dbTablesTagBoxId);
        var parent = ele.parentElement;

        $("#" + this.dbTablesTagBoxId).dxTagBox("dispose");
        $("#" + this.dbTablesTagBoxId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.dbTablesTagBoxId;
        parent.appendChild(newDiv);
    },
}