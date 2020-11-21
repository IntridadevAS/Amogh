const DataVault = {
    grid: null,

    show: function () {
        document.getElementById("dataVaultOverlay").style.display = "block";

        DataVault.populateDataVaultGrid();

        document.getElementById("dataVaultCancelBtn").onclick = function () {
            DataVault.hide();
        }

        document.getElementById("dataVaultOKBtn").onclick = function () {
            DataVault.onOkClicked();
        }

        // Make the DIV element draggable:
        xCheckStudio.Util.dragElement(document.getElementById("dataVaultOverlay"),
            document.getElementById("dataVaultOverlayCaptionBar"));
    },

    hide: function () {
        document.getElementById("dataVaultOverlay").style.display = "none";
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

        column = {};
        column["caption"] = "scsFile";
        column["dataField"] = "scsFile";
        column["visible"] = false;
        columns.push(column);

        this.readDataFromVault().then(function (data) {
            var rowsData = [];
            if (data !== null) {
                for (var i = 0; i < data.length; i++) {
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
                    rowData["scsFile"] = data[i]['scsFile'];

                    rowsData.push(rowData);
                }
            }

            var loadingBrowser = true;
            DataVault.grid = $("#dataVaultOverlayGrid").dxDataGrid({
                columns: columns,
                dataSource: rowsData,
                width: "100%",
                height: "100%",
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
                }
            }).dxDataGrid("instance");

        });
    },

    readDataFromVault: function () {

        return new Promise((resolve) => {
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));

            $.ajax({
                url: 'PHP/DataVault.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "ReadVaultData",
                    'ProjectName': projectinfo.projectname
                },
                success: function (msg) {
                    var message = xCheckStudio.Util.tryJsonParse(msg);
                    if (message === null || message.MsgCode !== 1) {
                        return resolve(null);
                    }

                    return resolve(message.Data);
                }
            });
        });
    },

    onOkClicked: function () {
        var selectedItems = DataVault.grid.getSelectedRowsData();
        if (selectedItems.length === 0) {
            return;
        }
        if ((model.activeTabs + selectedItems.length) > 4) {
            alert("Maximum dataset limit is 4.");
            return;
        }
        DataVault.grid.clearSelection();
        DataVault.hide();

        viewPanels.addFilesPanel.classList.add("hide");

        if (isDataVault()) {
            DataVault.onLoadSelectedDataSetsInVault(selectedItems);
        }
        else {
            DataVault.onLoadSelectedDataSetsInCheckSpace(selectedItems);
        }
    },

    onLoadSelectedDataSetsInCheckSpace: function (selectedItems) {
        for (var i = 0; i < selectedItems.length; i++) {
            var selectedItem = selectedItems[i];
            
            // get current source id
            var srcId = controller.nextAvailableView();

            var addedSource = controller.addNewFile(selectedItem.Name);
            addedSource.type = selectedItem.Type.toLowerCase();

            //Create tab header and Show panel for selected tab
            viewTabs.createTab(addedSource);
            viewPanels.showPanel(addedSource.viewPanel);
            viewTabs.addTab.classList.remove("selectedTab");

            if (xCheckStudio.Util.isSource3D(selectedItem.Type)) {
                DataVault.load3DDataSetInCheckSpace(selectedItem, srcId, addedSource).then(function (status) {

                });
            }
        }
    },

    load3DDataSetInCheckSpace: function (selectedItem, srcId, addedSource) {
        return new Promise((resolve) => {
            DataVault.copyDataFromVaultToCheckspace(selectedItem.Name, selectedItem.Version, srcId).then(function (data) {
                if (data === null) {
                    return resolve(false);
                }

                DataVault.load3DDataSet(data, selectedItem, true, addedSource).then(function (status) {
                    return resolve(true);
                });
            });
        });
    },

    copyDataFromVaultToCheckspace: function (name, version, srcId) {
        return new Promise((resolve) => {
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));           

            $.ajax({
                url: 'PHP/DataVault.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "CopyDataToCheckSpace",
                    'projectName': projectinfo.projectname,
                    'checkName': checkinfo.checkname,
                    'fileName': name,
                    'version': version,
                    'srcId' : srcId
                },
                success: function (msg) {
                    var message = xCheckStudio.Util.tryJsonParse(msg);
                    if (message === null || message.MsgCode !== 1) {
                        return resolve(null);
                    }

                    return resolve(message.Data);
                }
            });
        });
    },

    onLoadSelectedDataSetsInVault: function (selectedItems) {

        for (var i = 0; i < selectedItems.length; i++) {
            var selectedItem = selectedItems[i];

            var addedSource = controller.addNewFile(selectedItem.Name);
            addedSource.type = selectedItem.Type.toLowerCase();

            //Create tab header and Show panel for selected tab
            viewTabs.createTab(addedSource);
            viewPanels.showPanel(addedSource.viewPanel);
            viewTabs.addTab.classList.remove("selectedTab");
            
            if (xCheckStudio.Util.isSource3D(selectedItem.Type)) {
                DataVault.load3DDataSetInVault(selectedItem, addedSource).then(function (status) {
                      
                });                
            }
        }
    },

    getDataFromVault: function (name, version) {
        return new Promise((resolve) => {
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));

            $.ajax({
                url: 'PHP/DataVault.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "GetDataFromVault",
                    'projectName': projectinfo.projectname,
                    'fileName': name,
                    'version': version
                },
                success: function (msg) {
                    var message = xCheckStudio.Util.tryJsonParse(msg);
                    if (message === null || message.MsgCode !== 1) {
                        return resolve(null);
                    }

                    return resolve(message.Data);
                }
            });
        });
    },

    load3DDataSetInVault: function (selectedItem, addedSource) {
        return new Promise((resolve) => {
            DataVault.getDataFromVault(selectedItem.Name, selectedItem.Version).then(function (data) {
                if (data === null) {
                    return resolve(false);
                }

                DataVault.load3DDataSet(data, selectedItem, false, addedSource).then(function (status) {
                    return resolve(true);
                });
            });
        });
    },

    load3DDataSet: function (data, selectedItem, addComponentsToDB, addedSource) {
        return new Promise((resolve) => {

            var path = data.scsFile;
            var allComponents = data.allComponents;

            // var addedSource = controller.addNewFile(selectedItem.Name);
            // addedSource.type = selectedItem.Type.toLowerCase();

            // //Create tab header and Show panel for selected tab
            // viewTabs.createTab(addedSource);
            // viewPanels.showPanel(addedSource.viewPanel);
            // viewTabs.addTab.classList.remove("selectedTab");

            var sourceManager = createSourceManager(addedSource.id,
                selectedItem.Name,
                addedSource.type,
                addedSource.visualizer.id,
                addedSource.tableData.id,
                path);
            SourceManagers[addedSource.id] = sourceManager;

            sourceManager.LoadData(undefined, undefined, true).then(function (result) {
                // use this to restore
                sourceManager.RestoreAllComponents(JSON.parse(allComponents));

                // use components to db
                if (addComponentsToDB === true) {
                    sourceManager.AddComponentsToDB();
                }

                return resolve(true);
            });
        });
    },

    onOutputToVaultClicked: function () {
        closeOutpuToOverlay();

        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("saveVaultPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "154px";

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    },

    saveDataToVault: function (
        projectinfo,
        userinfo,
        sourceManager,
        version,
        description,
        replace,
        mergeData
    ) {
        return new Promise((resolve) => {
          
            var fromVault = "true";
            var checkName = null
            if (!isDataVault()) {
                var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
                checkName =  checkinfo.checkname;
                fromVault = "false";
            }

            $.ajax({
                url: 'PHP/DataVault.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "SaveData",
                    'ProjectName': projectinfo.projectname,
                    'srcId': sourceManager.Id,
                    'fileName': sourceManager.SourceName,
                    'fileType': sourceManager.SourceType,
                    'userName': userinfo.username,
                    'version': version,
                    'description': description,
                    'sourceComponents': JSON.stringify(sourceManager.SourceProperties),
                    'allComponents': JSON.stringify(sourceManager.AllComponents),
                    'replace': replace,
                    'checkName' : checkName,
                    'fromVault' : fromVault,
                    'scsPath' : sourceManager.Webviewer._params.endpointUri,
                    'mergeData' : mergeData
                },
                success: function (msg) {
                    var message = xCheckStudio.Util.tryJsonParse(msg);
                    if (message === null || message.MsgCode !== 1) {
                        return resolve(false);
                    }

                    return resolve(true);
                }
            });
        });
    },

    onSaveToVaultClicked : function() {
        hideSaveVaultForm();
    
        if(model.currentTabId in SourceManagers) {
            var prompt = document.getElementById("saveToVaultPrompt");
            document.getElementById("uiBlockingOverlay").style.display = "block";
            prompt.style.display = "block";
            
            prompt.style.top = ((window.innerHeight / 2) - 60) + "px";
            prompt.style.left = ((window.innerWidth / 2) - 150) + "px";
    
            document.getElementById("saveToVaultDatasetName").innerText = SourceManagers[model.currentTabId].SourceName;
        }
    },

    onSaveToVaultOKClicked :function(){
        var description = vaultDataDescription.option("value");
        var version = vaultDataVersion.option("value");
        if (!version ||
          version === "") {
          alert("Version can't be empty.");
          return;
        }         
      
        if (model.currentTabId in SourceManagers) {
          var sourceManager = SourceManagers[model.currentTabId];
          CheckModule.onSaveVault(sourceManager, version, description).then(function (result) {             
            if (result.length > 1 && result[1] === false) {
              // don;t close the prompt
               return;
            }

            vaultDataVersion.option("value", "");
            vaultDataDescription.option("value", "");

            document.getElementById("uiBlockingOverlay").style.display = "none";
            document.getElementById("saveToVaultPrompt").style.display = "none";
          });
        }  
    }
}