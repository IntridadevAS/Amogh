var CheckModule = {
    onSaveProgress: function (silent) {

        return new Promise((resolve) => {

            try {

                if (Object.keys(SourceManagers).length === 0) {
                    showNoDataToSavePrompt();
                    return resolve(false);
                }

                showBusyIndicator();

                // create project DB
                this.createCheckSpaceDBonSave().then(function (result) {
                    if (result) {

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
                    else {

                        if (!silent) {
                            showFailedToSavePrompt();
                        }
                        // remove busy spinner        
                        hideBusyIndicator();

                        return resolve(false);
                    }
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
                    'hiddenItems': JSON.stringify(hiddenItems)
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

    // saveComponentsToCheckSpaceDB: function () {
    //     var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    //     var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    //     $.ajax({
    //         url: 'PHP/ProjectManager.php',
    //         type: "POST",
    //         async: false,
    //         data:
    //         {
    //             'InvokeFunction': "SaveComponents",
    //             'ProjectName': projectinfo.projectname,
    //             'CheckName': checkinfo.checkname
    //         },
    //         success: function (msg) {
    //         }
    //     });
    // },

    createCheckSpaceDBonSave: function () {
        return new Promise((resolve) => {
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            $.ajax({
                url: 'PHP/ProjectManager.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "CreateCheckSpaceDBonSave",
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname
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

        //var sourceACheckAllSwitchOn = 'false';
        // if (sourceACheckAllCB.classList.contains("state2")) {
        //     sourceACheckAllSwitchOn = 'true';
        // }
        //var sourceBCheckAllSwitchOn = 'false';
        // if (sourceBCheckAllCB.classList.contains("state2")) {
        //     sourceBCheckAllSwitchOn = 'true';
        // }

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
        // controlStatesArray['SourceACheckAllSwitch'] = sourceACheckAllSwitchOn;
        // controlStatesArray['SourceBCheckAllSwitch'] = sourceBCheckAllSwitchOn;       

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

        // var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        // var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        var viewerOptionsObject = {};
        for (var srcId in SourceManagers) {
            var sourceManager = SourceManagers[srcId];
            if (!sourceManager.Is3DSource()) {
                continue;
            }

            var viewerOptions = [];
            viewerOptions.push(sourceManager.Webviewer._params.endpointUri);

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
            // // write viewer options data to data base
            // $.ajax({
            //     url: 'PHP/ProjectManager.php',
            //     type: "POST",
            //     async: false,
            //     data:
            //     {
            //         'InvokeFunction': "SaveVieweroptions",
            //         "SourceViewerOptions": JSON.stringify(viewerOptions),
            //         "SourceViewerOptionsTable": tableName,
            //         'ProjectName': projectinfo.projectname,
            //         'CheckName': checkinfo.checkname
            //     },
            //     success: function (msg) {
            //     }
            // });
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

            // // write source a selected components
            // $.ajax({
            //     url: 'PHP/ProjectManager.php',
            //     type: "POST",
            //     async: false,
            //     data:
            //     {
            //         'InvokeFunction': "SaveSelectedComponents",
            //         "selectedComponentsTableName": tableName,
            //         "nodeIdvsComponentIdList": JSON.stringify(nodeIdvsComponentIdList),
            //         "selectedComponents": JSON.stringify(selectedCompoents),
            //         "ProjectName": projectinfo.projectname,
            //         'CheckName': checkinfo.checkname
            //     },
            //     success: function (msg) {
            //     }
            // });
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

            // // write not selected components
            // $.ajax({
            //     url: 'PHP/ProjectManager.php',
            //     type: "POST",
            //     async: false,
            //     data:
            //     {
            //         'InvokeFunction': "SaveNotSelectedComponents",
            //         "notSelectedComponentsTable": notSelectedComponentsTable,
            //         "selectedComponents": JSON.stringify(selectedCompoents),
            //         "componentsTable": componentsTable,
            //         "ProjectName": projectinfo.projectname,
            //         'CheckName': checkinfo.checkname
            //     },
            //     success: function (msg) {
            //     }
            // });
        }

        return notSelectedComponentsObject;
        // if (sourceManager1) {
        //     var selectedCompoents = sourceManager1.ModelTree.GetSelectedComponents();

        //     // write source a selected components
        //     $.ajax({
        //         url: 'PHP/ProjectManager.php',
        //         type: "POST",
        //         async: false,
        //         data:
        //         {
        //             'InvokeFunction': "SaveNotSelectedComponents",
        //             "notSelectedComponentsTable": "SourceANotSelectedComponents",
        //             "selectedComponents": JSON.stringify(selectedCompoents),
        //             "componentsTable": "SourceAComponents",
        //             "ProjectName": projectinfo.projectname,
        //             'CheckName': checkinfo.checkname
        //         },
        //         success: function (msg) {
        //         }
        //     });
        // }

        // // write source Bselected components
        // if (sourceManager2) {
        //     var selectedCompoents = sourceManager2.ModelTree.GetSelectedComponents();

        //     // write source a selected components
        //     $.ajax({
        //         url: 'PHP/ProjectManager.php',
        //         type: "POST",
        //         async: false,
        //         data:
        //         {
        //             'InvokeFunction': "SaveNotSelectedComponents",
        //             "notSelectedComponentsTable": "SourceBNotSelectedComponents",
        //             "selectedComponents": JSON.stringify(selectedCompoents),
        //             "componentsTable": "SourceBComponents",
        //             "ProjectName": projectinfo.projectname,
        //             'CheckName': checkinfo.checkname
        //         },
        //         success: function (msg) {
        //         }
        //     });
        // }
    },
}


function onNoDataToSaveOk() {
    var overlay = document.getElementById("noDataToSaveOverlay");
    var popup = document.getElementById("noDataToSavePopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function showNoDataToSavePrompt() {
    var overlay = document.getElementById("noDataToSaveOverlay");
    var popup = document.getElementById("noDataToSavePopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

// function onSavedDataOk() {
//     var overlay = document.getElementById("savedDataOverlay");
//     var popup = document.getElementById("savedDataPopup");

//     overlay.style.display = 'none';
//     popup.style.display = 'none';
// }

// function showSavedDataPrompt() {
//     var overlay = document.getElementById("savedDataOverlay");
//     var popup = document.getElementById("savedDataPopup");

//     overlay.style.display = 'block';
//     popup.style.display = 'block';

//     popup.style.width = "581px";
//     popup.style.height = "155px";
//     popup.style.overflow = "hidden";

//     popup.style.top = ((window.innerHeight / 2) - 139) + "px";
//     popup.style.left = ((window.innerWidth / 2) - 290) + "px";
// }

function onFailedToSaveOk() {
    var overlay = document.getElementById("failedToSaveOverlay");
    var popup = document.getElementById("failedToSavePopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function showFailedToSavePrompt() {
    var overlay = document.getElementById("failedToSaveOverlay");
    var popup = document.getElementById("failedToSavePopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}