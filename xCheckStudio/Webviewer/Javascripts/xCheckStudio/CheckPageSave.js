var CheckModule = {
    onSaveProgress: function (silent) {

        return new Promise((resolve) => {

            try {               
                showBusyIndicator();

                // save all
                CheckModule.saveAll().then(function (res) {
                    if (res) {
                        if (!silent) {
                            //showSavedDataPrompt();
                        }
                        // remove busy spinner        
                        hideBusyIndicator();

                        return resolve(true);
                    }

                    if (!silent) {
                        showFailedToSavePrompt();
                    }

                    // remove busy spinner        
                    hideBusyIndicator();

                    return resolve(false);
                });              
            }
            catch (error) {
                console.log(error.message);
            }
            finally {
            }

        });
    },

    saveAll: function () {
        return new Promise((resolve) => {
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            // control states data
            var controlStatesArray = this.getControlStates();

            // data source info
            var dataSourceInfo = this.getDataSourceInfo();

            // get viewer options
            var viewerOptions = this.getSourceViewerOptions();

            // get selected components
            var selectedComponents = this.getSelectedComponents();

            // get not selected components
            var notSelectedComponents = this.getNotSelectedComponents();

            // get hidden items
            var hiddenItems = this.getHiddenItems();

            // get markup views
            var markupViews = this.getMarkupViews();

            // get bookmark views
            var bookmarkViews = this.getBookmarkViews();

            // get bookmark views
            var annotations = this.getAnnotations();

            // get all components
            var allComponents = this.getAllComponents();

            // Save group templates
            // before you save group templates, update the group template 
            // with visible columns, if  current table view is group view
            for (var srcId in SourceManagers) {
                if (model.views[srcId].activeTableView === GlobalConstants.TableView.Group) {
                    model.views[srcId].groupView.SaveTableView();
                }
            }
            // get all property groups
            var propertyGroups = this.getPropertyGroups();
            // get all highlight by property templates
            var highlightPropertyTemplates = this.getHighlightPropertyTemplates();

            // data change highlight templates
            var dataChangeHighlightTemplates = this.getDataChangeHighlightTemplates();

            // db connection info
            var dbConnectionInfo = this.getDBConnectionInfo();

            $.ajax({
                url: 'PHP/ProjectManager.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "SaveAll",
                    'Context': "check",
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname,
                    'checkModuleControlState': JSON.stringify(controlStatesArray),
                    'dataSourceInfo': JSON.stringify(dataSourceInfo),
                    'viewerOptions': JSON.stringify(viewerOptions),
                    'selectedComponents': JSON.stringify(selectedComponents),
                    'notSelectedComponents': JSON.stringify(notSelectedComponents),
                    'hiddenItems': JSON.stringify(hiddenItems),
                    'markupViews': JSON.stringify(markupViews),
                    'bookmarkViews': JSON.stringify(bookmarkViews),
                    'annotations': JSON.stringify(annotations),
                    "allComponents": JSON.stringify(allComponents),
                    "propertyGroups": JSON.stringify(propertyGroups),
                    "highlightPropertyTemplates": JSON.stringify(highlightPropertyTemplates),
                    "dataChangeHighlightTemplates": JSON.stringify(dataChangeHighlightTemplates),
                    "dbConnectionInfo":  JSON.stringify(dbConnectionInfo)
                },
                success: function (msg) {
                    if (msg != 'fail') {
                        return resolve(true);
                    }

                    return resolve(false);
                }
            });
        });
    },

    onSaveVault: function (sourceManager, version, description) {
        return new Promise((resolve) => {

            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var userinfo = JSON.parse(localStorage.getItem('userinfo'));

            this.datasetAlreadyExistInVault(projectinfo.projectname, sourceManager.SourceName, version).then(function (result) {
                if (result && result.MsgCode === -1) {

                    showReplaceVaultDataSetDialog().then(function (result) {
                        if (result.buttonText.toLowerCase() === "cancel") {
                            return resolve([false]);
                        }
                        else if (result.buttonText.toLowerCase() === "version") {
                            //second false is to whether close the description-version prompts
                            return resolve([false, false]);
                        }
                        else if (result.buttonText.toLowerCase() === "replace") {

                            showMergeDataDialog().then(function(res){

                                var mergeData = "false";
                                if (res.buttonText.toLowerCase() === "yes") {
                                    mergeData = "true";
                                }
                                DataVault.saveDataToVault(projectinfo, userinfo, sourceManager, version, description, "true", mergeData).then(function (res) {
                                    return resolve([res]);
                                });
                            });                            
                        }
                        else {
                            return resolve([false]);
                        }
                    });
                }
                else if (result && result.MsgCode !== 1) {
                    return resolve([false]);
                }
                else if (!result || result.MsgCode === 1) {
                    DataVault.saveDataToVault(projectinfo, userinfo, sourceManager, version, description, "false", "false").then(function (res) {
                        return resolve([res]);
                    });
                }
            });
        });
    },    

    datasetAlreadyExistInVault(projectname, sourceName, version) {
        return new Promise((resolve) => {
            $.ajax({
                url: 'PHP/DataVault.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "CheckIfDataSetAlreadyExists",
                    'ProjectName': projectname,
                    'fileName': sourceName,
                    'version': version
                },
                success: function (msg) {
                    var message = xCheckStudio.Util.tryJsonParse(msg);                   
                    return resolve(message);
                }
            });
        });
    },

    getPropertyGroups: function () {
        var propertyGroups = {};
        propertyGroups = model.propertyGroups;

        return propertyGroups;
    },

    getHighlightPropertyTemplates: function () {
        return model.propertyHighlightTemplates;
    },

    getDataChangeHighlightTemplates: function () {        
        return model.dataChangeHighlightTemplates;
    },

    getDBConnectionInfo: function () {        
        return model.dbConnectionInfo;
    },

    getAllComponents: function () {

        var allComponents = {};
        for (var srcId in SourceManagers) {
            var sourceManager = SourceManagers[srcId];
            if (!sourceManager.Is3DSource()) {
                continue;
            }

            var tableName = "AllComponents" + srcId;

            allComponents[tableName] = sourceManager.AllComponents;
        }

        return allComponents;
    },

    getHiddenItems: function () {
        var hiddentItems = {};
        var visibleItems = {};
        for (var srcId in SourceManagers) {
            var sourceManager = SourceManagers[srcId];
            if (sourceManager.Is3DSource()) {

                var hiddenComponents = {};
                var visibleComponents = {};
                for (var node in sourceManager.NodeIdvsComponentIdList) {
                    var compId = sourceManager.NodeIdvsComponentIdList[node];
                    var nodeId = Number(node);
                    if (sourceManager.HiddenNodeIds.includes(nodeId)) {
                        hiddenComponents[nodeId] = compId;
                    }
                    else {
                        visibleComponents[nodeId] = compId;
                    }
                }

                hiddentItems[srcId] = hiddenComponents;
                visibleItems[srcId] = visibleComponents;
            }
        }
        if (Object.keys(hiddentItems).length === 0) {
            return undefined;
        }

        var hiddenComponentsObject = { "hiddenComponents": JSON.stringify(hiddentItems), "visibleComponents": JSON.stringify(visibleItems) };
        return hiddenComponentsObject;
    },

    getMarkupViews: function () {
        var views = {};
        for (var srcId in SourceManagers) {
            var sourceManager = SourceManagers[srcId];
            if (!sourceManager.Is3DSource()) {
                continue;
            }

            views[srcId] = sourceManager.SerializeMarkupViews();
        }

        return views;
    },

    getBookmarkViews: function () {
        var views = {};
        for (var srcId in SourceManagers) {
            var sourceManager = SourceManagers[srcId];
            if (!sourceManager.Is3DSource()) {
                continue;
            }

            views[srcId] = sourceManager.SerializeBookmarkViews();
        }

        return views;
    },

    getAnnotations: function () {
        var annotations = {};
        for (var srcId in SourceManagers) {
            var sourceManager = SourceManagers[srcId];
            if (!sourceManager.Is3DSource()) {
                continue;
            }

            annotations[srcId] = sourceManager.SerializeAnnotations();
        }

        return annotations;
    },

    getControlStates: function () {
        // control states
        var comparisonCB = document.getElementById('comparisonSwitch');
        // var complianceCB = document.getElementById('complianceSwitch');      

        var comparisonSwitchOn = 'false';
        if (comparisonCB.checked) {
            comparisonSwitchOn = 'true';
        }

        var sourceAComplianceSwitchOn = 'false';
        var sourceBComplianceSwitchOn = 'false';
        var sourceCComplianceSwitchOn = 'false';
        var sourceDComplianceSwitchOn = 'false';
        if (("a" in model.views) && model.views["a"].complianceSwitchChecked) {
            sourceAComplianceSwitchOn = 'true';
        }
        if (("b" in model.views) && model.views["b"].complianceSwitchChecked) {
            sourceBComplianceSwitchOn = 'true';
        }
        if (("c" in model.views) && model.views["c"].complianceSwitchChecked) {
            sourceCComplianceSwitchOn = 'true';
        }
        if (("d" in model.views) && model.views["d"].complianceSwitchChecked) {
            sourceDComplianceSwitchOn = 'true';
        }

        var controlStatesArray = {};
        controlStatesArray['comparisonSwithOn'] = comparisonSwitchOn;
        controlStatesArray['sourceAComplianceSwitchOn'] = sourceAComplianceSwitchOn;
        controlStatesArray['sourceBComplianceSwitchOn'] = sourceBComplianceSwitchOn;
        controlStatesArray['sourceCComplianceSwitchOn'] = sourceCComplianceSwitchOn;
        controlStatesArray['sourceDComplianceSwitchOn'] = sourceDComplianceSwitchOn;
        controlStatesArray['selectedDataSetTab'] = model.currentTabId;
        if (checkCaseManager && checkCaseManager.CheckCase) {
            controlStatesArray['selectedCheckCase'] = checkCaseManager.CheckCase.Name;
        }
        else {
            controlStatesArray['selectedCheckCase'] = "AutoSelect";
        }

        return controlStatesArray;
    },

    getDataSourceInfo: function () {

        var sourceAType;
        var sourceAFileName;
        if ("a" in SourceManagers) {
            var sourceManager = SourceManagers["a"];
            sourceAType = sourceManager.SourceType;
            sourceAFileName = sourceManager.SourceName;

        }

        var sourceBType;
        var sourceBFileName;
        if ("b" in SourceManagers) {
            var sourceManager = SourceManagers["b"];
            sourceBType = sourceManager.SourceType;
            sourceBFileName = sourceManager.SourceName;

        }

        var sourceCType;
        var sourceCFileName;
        if ("c" in SourceManagers) {
            var sourceManager = SourceManagers["c"];
            sourceCType = sourceManager.SourceType;
            sourceCFileName = sourceManager.SourceName;

        }

        var sourceDType;
        var sourceDFileName;
        if ("d" in SourceManagers) {
            var sourceManager = SourceManagers["d"];
            sourceDType = sourceManager.SourceType;
            sourceDFileName = sourceManager.SourceName;
        }

        // check if data source order load order is maintained
        var dataSourceOrderMaintained = true;
        if (checkCaseManager && checkCaseManager.CheckCase) {
            var sourceTypesFromCheckCase = checkCaseManager.CheckCase.SourceTypes;
            if ((("a" in SourceManagers) &&
                ("sourceA" in sourceTypesFromCheckCase)) &&
                (("b" in SourceManagers) &&
                    ("sourceA" in sourceTypesFromCheckCase))) {
                if (SourceManagers["a"].SourceType.toLowerCase() !== sourceTypesFromCheckCase["sourceA"].toLowerCase() ||
                    SourceManagers["b"].SourceType.toLowerCase() !== sourceTypesFromCheckCase["sourceB"].toLowerCase()) {
                    dataSourceOrderMaintained = false;
                }
            }
        }

        var dataSourceInfo = {};
        dataSourceInfo["SourceAFileName"] = sourceAFileName;
        dataSourceInfo["SourceBFileName"] = sourceBFileName;
        dataSourceInfo["SourceCFileName"] = sourceCFileName;
        dataSourceInfo["SourceDFileName"] = sourceDFileName;
        dataSourceInfo["SourceAType"] = sourceAType;
        dataSourceInfo["SourceBType"] = sourceBType;
        dataSourceInfo["SourceCType"] = sourceCType;
        dataSourceInfo["SourceDType"] = sourceDType;
        dataSourceInfo["orderMaintained"] = dataSourceOrderMaintained;

        return dataSourceInfo;
    },

    getSourceViewerOptions: function () {
      
        var viewerOptionsObject = {};
        for (var srcId in SourceManagers) {
            var sourceManager = SourceManagers[srcId];
            var viewerOptions = [];
            if (sourceManager.Is3DSource()) {

                let fileName = xCheckStudio.Util.getFileNameWithExtension(sourceManager.Webviewer._params.endpointUri);
                viewerOptions.push(fileName);
            }
            else if (sourceManager.IsSVGSource()) {
                let fileName = xCheckStudio.Util.getFileNameWithExtension(sourceManager.ViewerOptions.endpointUri);
                viewerOptions.push(fileName);
            }
            else {
                continue;
            }

            var tableName;
            if (srcId === GlobalConstants.SourceAId) {
                tableName = GlobalConstants.SourceAViewerOptionsTable;
            }
            else if (srcId === GlobalConstants.SourceBId) {
                tableName = GlobalConstants.SourceBViewerOptionsTable;
            }
            else if (srcId === GlobalConstants.SourceCId) {
                tableName = GlobalConstants.SourceCViewerOptionsTable;
            }
            else if (srcId === GlobalConstants.SourceDId) {
                tableName = GlobalConstants.SourceDViewerOptionsTable;
            }
            else {
                continue;
            }

            viewerOptionsObject[tableName] = viewerOptions;
        }

        return viewerOptionsObject;
    },

    getSelectedComponents: function () {

        var selectedComponentsObject = {};
        for (var srcId in SourceManagers) {
            var sourceManager = SourceManagers[srcId];

            var selectedCompoents = sourceManager.ModelTree.GetSelectedComponents();
            var nodeIdvsComponentIdList = sourceManager.NodeIdvsComponentIdList;

            var tableName;
            if (srcId === GlobalConstants.SourceAId) {
                tableName = GlobalConstants.SourceASelectedComponentsTable;
            }
            else if (srcId === GlobalConstants.SourceBId) {
                tableName = GlobalConstants.SourceBSelectedComponentsTable;
            }
            else if (srcId === GlobalConstants.SourceCId) {
                tableName = GlobalConstants.SourceCSelectedComponentsTable;
            }
            else if (srcId === GlobalConstants.SourceDId) {
                tableName = GlobalConstants.SourceDSelectedComponentsTable;
            }
            else {
                continue;
            }

            selectedComponentsObject[tableName] = {
                "selectedCompoents": selectedCompoents,
                "nodeIdvsComponentIdList": nodeIdvsComponentIdList
            };
        }

        return selectedComponentsObject;
    },

    getNotSelectedComponents: function () {

        var notSelectedComponentsObject = {};

        for (var srcId in SourceManagers) {
            var sourceManager = SourceManagers[srcId];

            var selectedComponents = sourceManager.ModelTree.GetSelectedComponents();

            var componentsTable;
            var notSelectedComponentsTable;
            if (srcId === GlobalConstants.SourceAId) {
                notSelectedComponentsTable = GlobalConstants.SourceANotSelectedComponentsTable;
                componentsTable = GlobalConstants.SourceAComponentsTable;
            }
            else if (srcId === GlobalConstants.SourceBId) {
                notSelectedComponentsTable = GlobalConstants.SourceBNotSelectedComponentsTable;
                componentsTable = GlobalConstants.SourceBComponentsTable;
            }
            else if (srcId === GlobalConstants.SourceCId) {
                notSelectedComponentsTable = GlobalConstants.SourceCNotSelectedComponentsTable;
                componentsTable = GlobalConstants.SourceCComponentsTable;
            }
            else if (srcId === GlobalConstants.SourceDId) {
                notSelectedComponentsTable = GlobalConstants.SourceDNotSelectedComponentsTable;
                componentsTable = GlobalConstants.SourceDComponentsTable;
            }
            else {
                continue;
            }

            notSelectedComponentsObject[notSelectedComponentsTable] = {
                "selectedComponents": selectedComponents,
                "componentsTable": componentsTable
            };
        }

        return notSelectedComponentsObject;
    },
}


function onNoDataToSaveOk() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("noDataToSavePopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function showNoDataToSavePrompt() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("noDataToSavePopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

function onFailedToSaveOk() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("failedToSavePopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function showFailedToSavePrompt() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("failedToSavePopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

function showReplaceVaultDataSetDialog() {

    return new Promise((resolve) => {

        $(function () {
            var replaceVaultDataSetDialog = DevExpress.ui.dialog.custom({
                title: "Save Data",
                messageHtml: "This version of the dataset already exists in vault<br>Replace the existing version or Use another version.",
                buttons: [{
                    text: "Cancel",
                    onClick: function (e) {
                        return { buttonText: e.component.option("text") }
                    }
                },
                {
                    text: "Version",
                    onClick: function (e) {
                        return { buttonText: e.component.option("text") }
                    }
                },
                {
                    text: "Replace",
                    onClick: function (e) {
                        return { buttonText: e.component.option("text") }
                    }
                },
                ]
            });

            replaceVaultDataSetDialog.show().done(function (dialogResult) {
                return resolve(dialogResult);
            });
        })
    });
}

function showMergeDataDialog() {

    return new Promise((resolve) => {

        $(function () {
            var mergeDataDialog = DevExpress.ui.dialog.custom({
                title: "Merge Data",
                messageHtml: "Merge database?",
                buttons: [{
                    text: "Yes",
                    onClick: function (e) {
                        return { buttonText: e.component.option("text") }
                    }
                },
                {
                    text: "No",
                    onClick: function (e) {
                        return { buttonText: e.component.option("text") }
                    }
                }
                ]
            });

            mergeDataDialog.show().done(function (dialogResult) {
                return resolve(dialogResult);
            });
        })
    });
}