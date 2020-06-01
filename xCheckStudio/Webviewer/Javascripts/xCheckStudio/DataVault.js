var vaultEnable = false;
const DataVault = {
    active: false,
    grid: null,
    toggle: function () {
        if (!this.active) {
            this.open();
        }
        else {
            this.close();
        }
    },

    open: function () {
        this.active = true;

        onToggleOverlayDisplay(true);
        document.getElementById("dataVaultOverlay").style.display = "block";

        document.getElementById("dataVaultOverlayCloseBtn").onclick = function () {
            DataVault.close();
        };

        //populate Data Vault Grid
        this.populateDataVaultGrid();

        // Enable vault switch
        $("#enableVaultSwitch").dxSwitch({
            value: vaultEnable,
            switchedOffText: "Disabled",
            switchedOnText: "Enabled",
            onValueChanged: function (e) {
                
                vaultEnable = e.value;
                if(e.value === true)
                {
                    showEnableVaultConfirm().then(function(result){
                        if (result.buttonText.toLowerCase() === "cancel") {
                            e.component.option("value", false);
                        }                        
                    });
                }                
            }
        }).dxSwitch("instance");

        // Make the DIV element draggable:
        xCheckStudio.Util.dragElement(document.getElementById("dataVaultOverlay"),
            document.getElementById("dataVaultOverlayCaptionBar"));
    },

    close: function () {
        this.active = false;

        onToggleOverlayDisplay(false);
        document.getElementById("dataVaultOverlay").style.display = "none";
    },

    onEnterVault: function () {
        var proj = model.currentProject;
        localStorage.setItem('projectinfo', JSON.stringify(proj));
        localStorage.setItem('checkinfo', "");

        localStorage.setItem('isDataVault', "true");

        if (vaultEnable === true) {
            localStorage.setItem('dataVaultEnable', "true");
        }
        else {
            localStorage.setItem('dataVaultEnable', "false");
        }

        window.location.href = "checkPage.html";
    },

    onDeleteData: function () {
        return new Promise((resolve) => {            
            
            showDeleteVaultDataConfirm().then(function(result){
                if (result.buttonText.toLowerCase() === "ok") {
                    DataVault.deleteData().then(function (res) {
                        return resolve(true);
                    });
                }
                else {
                    return resolve(true);
                }                       
            });            
        });
    },

    deleteData: function () {
        return new Promise((resolve) => {

            var dataToDelete = [];
            var selectedRowsData = DataVault.grid.getSelectedRowsData();
            if (selectedRowsData.length === 0) {
                return resolve(false);
            }
            for (var i = 0; i < selectedRowsData.length; i++) {
                var rowData = selectedRowsData[i];
                dataToDelete.push({
                    "name": rowData.Name,
                    "version": rowData.Version,
                });
            }

            $.ajax({
                url: 'PHP/DataVault.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "DeleteVaultData",
                    'ProjectName': model.currentProject.projectname,
                    'DataToDelete': JSON.stringify(dataToDelete)
                },
                success: function (msg) {
                    var message = JSON.parse(msg);
                    if (message.MsgCode !== 1) {
                        return resolve(false);
                    }

                    // delete rows from grid
                    var keys = DataVault.grid.getSelectedRowKeys();
                    for (var i = 0; i < keys.length; i++) {
                        var rowIndex = DataVault.grid.getRowIndexByKey(keys[i]);
                        if (rowIndex > -1) {
                            DataVault.grid.deleteRow(rowIndex);
                            DataVault.grid.refresh(true);
                        }
                    }

                    DevExpress.ui.notify("Data deleted successfully.");
                    return resolve(true);
                }
            });
        });
    },

    populateDataVaultGrid: function () {
        var _this = this;

        // Create grid        
        var columns = [];

        var column = {};
        column["caption"] = "Name";
        column["dataField"] = "Name";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Type";
        column["dataField"] = "Type";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Description";
        column["dataField"] = "Description";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Version";
        column["dataField"] = "Version";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Added By";
        column["dataField"] = "AddedBy";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Date Added";
        column["dataField"] = "DateAdded";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Modified By";
        column["dataField"] = "ModifiedBy";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Date Modified";
        column["dataField"] = "DateModified";
        column["width"] = "100px";
        columns.push(column);

        this.readDataFromVault().then(function (data) {
            var rowsData = [];
            if(data !== null)
            {
                for(var i = 0; i < data.length; i++)
                {
                    data[i] 
                    
                    var rowData = {};
                    rowData["Name"] = data[i]['name'];
                    rowData["Type"] = data[i]['type'];
                    rowData["Description"] = data[i]['description'];
                    rowData["Version"] = data[i]['version'];
                    rowData["AddedBy"] = data[i]['addedBy'];
                    rowData["DateAdded"] = data[i]['dateAdded'];
                    rowData["ModifiedBy"] = data[i]['modifiedBy'];
                    rowData["DateModified"] = data[i]['dateModified'];

                    rowsData.push(rowData);
                }
            }

            var loadingBrowser = true;
            DataVault.grid = $("#dataVaultOverlayGrid").dxDataGrid({
                columns: columns,
                dataSource: rowsData,
                width: "550px",
                height: "460px",
                allowColumnResizing: true,
                columnResizingMode: 'widget',
                showBorders: true,
                showRowLines: true,
                paging: { enabled: false },
                // filterRow: {
                //     visible: true
                // },
                selection: {
                    mode: "multiple",
                    showCheckBoxesMode: "always",
                },
                scrolling: {
                    mode: "virtual"
                },
                editing: {
                    mode: "cell",
                    allowUpdating: true,
                    // refreshMode: "reshape",
                    texts: {
                        confirmDeleteMessage: ""
                    },
                },
                onContentReady: function (e) {
                    if (!loadingBrowser) {
                        return;
                    }
                    loadingBrowser = false;
                },
            }).dxDataGrid("instance");

        });
    },    

    readDataFromVault: function(){
        
        return new Promise((resolve) => {            
            // var projectinfo = JSON.parse(model.currentProject);

            $.ajax({
                url: 'PHP/DataVault.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "ReadVaultData",
                    'ProjectName': model.currentProject.projectname
                },
                success: function (msg) {
                    var message = JSON.parse(msg);
                    if(message.MsgCode !== 1)
                    {
                        return resolve(null); 
                    }

                    return resolve(message.Data);
                }
            });
        });
    }
}

function showEnableVaultConfirm() {

    return new Promise((resolve) => {

        $(function () {
            var confirmDialog = DevExpress.ui.dialog.custom({
                title: "Enable Data Vault",
                messageHtml: "Enable Data vault for Project ‘"+ model.currentProject.projectname +"’?",
                buttons: [{
                    text: "Cancel",
                    onClick: function (e) {
                        return { buttonText: e.component.option("text") }
                    }
                },
                {
                    text: "OK",
                    onClick: function (e) {
                        return { buttonText: e.component.option("text") }
                    }
                }              
                ]
            });

            confirmDialog.show().done(function (dialogResult) {
                return resolve(dialogResult);
            });
        })
    });
}

function showDeleteVaultDataConfirm() {

    return new Promise((resolve) => {

        $(function () {
            var confirmDialog = DevExpress.ui.dialog.custom({
                title: "Delete Data",
                messageHtml: "Do you want to delete the selected dataset(s)?",
                buttons: [{
                    text: "Cancel",
                    onClick: function (e) {
                        return { buttonText: e.component.option("text") }
                    }
                },
                {
                    text: "OK",
                    onClick: function (e) {
                        return { buttonText: e.component.option("text") }
                    }
                }              
                ]
            });

            confirmDialog.show().done(function (dialogResult) {
                return resolve(dialogResult);
            });
        })
    });
}