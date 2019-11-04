var CheckModule = {
    onSaveProgress: function () {

        return new Promise((resolve) => {

        showBusyIndicator();

        try {

            // create project DB
            this.createCheckSpaceDBonSave().then(function (result) {
                if (result) {

                    // save components to checkspaceDB
                    CheckModule.saveComponentsToCheckSpaceDB();

                    // save control states
                    CheckModule.saveControlsState();

                    // save data source info
                    CheckModule.saveDataSourceInfo();

                    // save source viewer options
                    CheckModule.saveSourceViewerOptions();

                    // save selected components
                    CheckModule.saveSelectedComponents();

                    // save not selected components
                    CheckModule.saveNotSelectedComponents();

                    // save not references
                    CheckModule.saveReferences();

                     // save not references
                     CheckModule.saveHiddenItems();

                     // save check results
                     CheckModule.saveCheckResults();
                    
                     alert("Saved project information.");
                }
            });
        }
        catch (error) {
            console.log(error.message);
        }
        finally {
            // remove busy spinner        
            hideBusyIndicator();

            return resolve(true);
        }

        });
    },

    saveCheckResults: function () {

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveCheckResults",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
            }
        });
    }, 

    saveHiddenItems : function()
    {
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

                // for (var hiddenNode in sourceManager.HiddenNodeIds) {
                //     var compId = sourceManager.NodeIdvsComponentIdList[hiddenNode];
                //     hiddenComponents[hiddenNode] = compId;
                // }

                hiddentItems[srcId] = hiddenComponents;
                visibleItems[srcId] = visibleComponents;
            }
        }
        if (Object.keys(hiddentItems).length === 0) {
            return;
        }

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveHiddenItems",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname,
                'hiddenComponents': JSON.stringify(hiddentItems),
                'visibleComponents': JSON.stringify(visibleItems)
            },
            success: function (msg) {
            }
        });
    },

    saveReferences : function()
    {
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveReferences",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
            }
        });
    },

    saveComponentsToCheckSpaceDB: function () {
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveComponents",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
            }
        });
    },

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

    saveControlsState: function () {
        var controlStatesArray = this.getControlStates();

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax
            ({
                url: 'PHP/ProjectManager.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "SaveCheckModuleControlsState",
                    "comparisonSwithOn": controlStatesArray['ComparisonSwitch'],
                    "sourceAComplianceSwitchOn": controlStatesArray['SourceAComplianceSwitch'],
                    "sourceBComplianceSwitchOn": controlStatesArray['SourceBComplianceSwitch'],
                    "sourceCComplianceSwitchOn": controlStatesArray['SourceCComplianceSwitch'],
                    "sourceDComplianceSwitchOn": controlStatesArray['SourceDComplianceSwitch'],
                    "selectedDataSetTab": controlStatesArray['SelectedDataSetTab'],
                    "selectedCheckCase": controlStatesArray['SelectedCheckCase'],
                    // "sourceACheckAllSwitchOn": controlStatesArray['SourceACheckAllSwitch'],
                    // "sourceBCheckAllSwitchOn": controlStatesArray['SourceBCheckAllSwitch'],
                    "ProjectName": projectinfo.projectname,
                    'CheckName': checkinfo.checkname
                },
                success: function (msg) {

                },
                error: function (error) {
                    console.log(error)
                }
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
        controlStatesArray['ComparisonSwitch'] = comparisonSwitchOn;
        controlStatesArray['SourceAComplianceSwitch'] = sourceAComplianceSwitchOn;
        controlStatesArray['SourceBComplianceSwitch'] = sourceBComplianceSwitchOn;
        controlStatesArray['SourceCComplianceSwitch'] = sourceCComplianceSwitchOn;
        controlStatesArray['SourceDComplianceSwitch'] = sourceDComplianceSwitchOn;
        controlStatesArray['SelectedDataSetTab'] = model.currentTabId;
        controlStatesArray['SelectedCheckCase'] = checkCaseManager.CheckCase.Name;
        // controlStatesArray['SourceACheckAllSwitch'] = sourceACheckAllSwitchOn;
        // controlStatesArray['SourceBCheckAllSwitch'] = sourceBCheckAllSwitchOn;

        return controlStatesArray;
    },

    saveDataSourceInfo: function () {

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

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax
            ({
                url: 'PHP/ProjectManager.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "SaveDatasourceInfo",
                    "SourceAFileName": sourceAFileName,
                    "SourceBFileName": sourceBFileName,
                    "SourceCFileName": sourceCFileName,
                    "SourceDFileName": sourceDFileName,
                    "SourceAType": sourceAType,
                    "SourceBType": sourceBType,
                    "SourceCType": sourceCType,
                    "SourceDType": sourceDType,
                    "orderMaintained": dataSourceOrderMaintained,
                    "ProjectName": projectinfo.projectname,
                    'CheckName': checkinfo.checkname
                },
                success: function (msg) {

                },
                error: function (error) {
                    console.log(error)
                }
            });
    },

    saveSourceViewerOptions: function () {

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

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

            // write viewer options data to data base
            $.ajax({
                url: 'PHP/ProjectManager.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "SaveVieweroptions",
                    "SourceViewerOptions": JSON.stringify(viewerOptions),
                    "SourceViewerOptionsTable": tableName,
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname
                },
                success: function (msg) {
                }
            });
        }
    },

    saveSelectedComponents: function () {
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

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

            // write source a selected components
            $.ajax({
                url: 'PHP/ProjectManager.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "SaveSelectedComponents",
                    "selectedComponentsTableName": tableName,
                    "nodeIdvsComponentIdList": JSON.stringify(nodeIdvsComponentIdList),
                    "selectedComponents": JSON.stringify(selectedCompoents),
                    "ProjectName": projectinfo.projectname,
                    'CheckName': checkinfo.checkname
                },
                success: function (msg) {
                }
            });
        }

        // // write source a selected components
        // if (sourceManager1) {
        //     var selectedCompoents = sourceManager1.ModelTree.GetSelectedComponents();
        //     var nodeIdvsComponentIdList = sourceManager1.NodeIdvsComponentIdList;
        //     // write source a selected components
        //     $.ajax({
        //         url: 'PHP/ProjectManager.php',
        //         type: "POST",
        //         async: false,
        //         data:
        //         {
        //             'InvokeFunction': "SaveSelectedComponents",
        //             "selectedComponentsTableName": "SourceASelectedComponents",
        //             "nodeIdvsComponentIdList": JSON.stringify(nodeIdvsComponentIdList),
        //             "selectedComponents": JSON.stringify(selectedCompoents),
        //             "ProjectName": projectinfo.projectname,
        //             'CheckName': checkinfo.checkname
        //         },
        //         success: function (msg) {
        //         }
        //     });
        // }

        // // write source b selected components
        // if (sourceManager2) {
        //     var selectedCompoents = sourceManager2.ModelTree.GetSelectedComponents();
        //     var nodeIdvsComponentIdList = sourceManager2.NodeIdvsComponentIdList;
        //     // write source a selected components
        //     $.ajax({
        //         url: 'PHP/ProjectManager.php',
        //         type: "POST",
        //         async: false,
        //         data:
        //         {
        //             'InvokeFunction': "SaveSelectedComponents",
        //             "selectedComponentsTableName": "SourceBSelectedComponents",
        //             "nodeIdvsComponentIdList": JSON.stringify(nodeIdvsComponentIdList),
        //             "selectedComponents": JSON.stringify(selectedCompoents),
        //             "ProjectName": projectinfo.projectname,
        //             'CheckName': checkinfo.checkname
        //         },
        //         success: function (msg) {
        //         }
        //     });
        // }
    },

    saveNotSelectedComponents: function () {
        // write source a selected components
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        for (var srcId in SourceManagers) {
            var sourceManager = SourceManagers[srcId];

            var selectedCompoents = sourceManager.ModelTree.GetSelectedComponents();

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

            // write not selected components
            $.ajax({
                url: 'PHP/ProjectManager.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "SaveNotSelectedComponents",
                    "notSelectedComponentsTable": notSelectedComponentsTable,
                    "selectedComponents": JSON.stringify(selectedCompoents),
                    "componentsTable": componentsTable,
                    "ProjectName": projectinfo.projectname,
                    'CheckName': checkinfo.checkname
                },
                success: function (msg) {
                }
            });
        }

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
    }
}

