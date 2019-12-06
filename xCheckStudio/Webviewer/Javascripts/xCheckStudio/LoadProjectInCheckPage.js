function loadCheckSpaceInCheckPage() {
    initCheckSpace().then(function (result) {
        if (!result) {
            return;
        }

        model.loadSavedCheckspace = true;

        // load checkspace
        loadCheckSpaceForCheck(result.Data);
    });
}

function initCheckSpace() {
    return new Promise((resolve) => {
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        $.ajax({
            data: {
                'InvokeFunction': "InitTempCheckSpaceDB",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname,
                'Context' : "Check"
            },
            async: false,
            type: "POST",
            url: "PHP/ProjectLoadManager.php"
        }).done(function (msg) {
            var message = JSON.parse(msg);
            if (message.MsgCode === 1) {
                return resolve(message);
            }

            return resolve(undefined);
        });
    });
}

function loadCheckSpaceForCheck(data) {

    if (!("controlStates" in data)) {
        return;
    }

    var controlStates = data["controlStates"];
  
    // restore comparison switch state
    if ("comparisonSwith" in controlStates &&
        controlStates["comparisonSwith"].toLowerCase() === 'true') {

        var comparisonCB = document.getElementById('comparisonSwitch');
        comparisonCB.checked = true;
    }

    // get array of datasets allowed by checkcase
    if (data.checkCaseInfo) {
        var checkCaseData = JSON.parse(data.checkCaseInfo.checkCaseData);
        model.checkcaseSupportedTypes = Object.values(checkCaseData.CheckCase.SourceTypes);
    }

    // maintaint the dataset types
    var sourceViewerOptions = data["sourceViewerOptions"];
    if (sourceViewerOptions) {
        var datasetTypes = [];
        for (var srcId in sourceViewerOptions) {
            datasetTypes.push(sourceViewerOptions[srcId]["sourceType"]);
        }
        model.datasetTypes = datasetTypes;
    }

    // load data sets 
    loadDataSets(data);
    
    // hide add new data source button  
    // if( model.checkcaseSupportedTypes.length === Object.keys(data.sourceViewerOptions).length)
    // {
    //     viewTabs.hideAddTab();   
    // }
}

function loadDataSets(data) {
    // return new Promise((resolve) => {
    if (!("checkCaseInfo" in data) ||
        !("sourceViewerOptions" in data)) {
        return;
    }
    var checkCaseInfo = data["checkCaseInfo"];
    var viewerOptions = data["sourceViewerOptions"];
   
    viewPanels.addFilesPanel.classList.add("hide");

    // get selected check case name
    var checkCaseName;
    if (checkCaseInfo) {
        if ('checkCaseData' in checkCaseInfo) {
            var checkCaseManager = JSON.parse(checkCaseInfo['checkCaseData']);

            if ('CheckCase' in checkCaseManager) {
                var checkCase = checkCaseManager['CheckCase'];
                if ('Name' in checkCase) {
                    checkCaseName = checkCase['Name'];
                }
            }
        }
    }

    for (var srcId in viewerOptions) {
        var viewerOption = viewerOptions[srcId];
        loadDataSource(viewerOption, data, checkCaseName);
    }   
}

function loadDataSource(viewerOption, data, checkCaseName) {

    if (!viewerOption.source ||
        !viewerOption.sourceType) {
        return;
    }

    var addedSource = controller.addNewFile(viewerOption.source);
    restoreComplianceSwitchState(addedSource, data["controlStates"]);

    viewTabs.createTab(addedSource);
    viewPanels.showPanel(addedSource.viewPanel);

    // get selected components 
    var allSelectedComponents = data["selectedComponents"];
    var selectedComponents;
    if (addedSource.id === GlobalConstants.SourceAId) {
        selectedComponents = allSelectedComponents.SourceA;
    }
    else if (addedSource.id === GlobalConstants.SourceBId) {
        selectedComponents = allSelectedComponents.SourceB;
    }
    else if (addedSource.id === GlobalConstants.SourceCId) {
        selectedComponents = allSelectedComponents.SourceC;
    }
    else if (addedSource.id === GlobalConstants.SourceDId) {
        selectedComponents = allSelectedComponents.SourceD;
    }

    var fileExtension = xCheckStudio.Util.getFileExtension(viewerOption.source.toLowerCase());
    if (xCheckStudio.Util.isSource3D(fileExtension)) {

        xCheckStudio.Util.fileExists(viewerOption.endPointUri).then(function (success) {
            if (success) {              

                var sourceManager = createSourceManager(addedSource.id, 
                    viewerOption.source,
                    fileExtension,
                    addedSource.visualizer.id,
                    addedSource.tableData.id,
                    viewerOption.endPointUri);
                SourceManagers[addedSource.id] = sourceManager;

                // get hiddent components
                var hiddenItems = [];
                var hiddenComponents = data.hiddenComponents;
                if ("hiddenComponents" in hiddenComponents) {
                    var comps = JSON.parse(hiddenComponents["hiddenComponents"]);
                    if (addedSource.id in comps) {
                        for (var node in comps[addedSource.id]) {
                            hiddenItems.push(Number(node));
                        }
                    }
                }
                // get visible components
                var visibleItems = [];
                if ("visibleComponents" in hiddenComponents) {
                    var comps = JSON.parse(hiddenComponents["visibleComponents"]);
                    if (addedSource.id in comps) {
                        for (var node in comps[addedSource.id]) {
                            visibleItems.push(Number(node));
                        }
                    }
                }

                sourceManager.HiddenNodeIds = hiddenItems;

                sourceManager.LoadData(selectedComponents["NodeIdwiseSelectedComps"], visibleItems).then(function (result) {
                    filterCheckCases(false);

                    var checkCaseSelectElement = document.getElementById("checkCaseSelect");
                    if (checkCaseName) {
                        checkCaseSelectElement.value = checkCaseName;
                    }
                    else {
                        checkCaseSelectElement.value = "AutoSelect";
                    }

                    // triggere onchange manually
                    checkCaseSelectElement.dispatchEvent(new Event('change'));
                });

            }
        });
    }
    else if (xCheckStudio.Util.isSource1D(fileExtension)) {

        if (!("classWiseComponents" in data)) {
            return;
        }

        var classWiseComponents;      
        if (addedSource.id === GlobalConstants.SourceAId) {            
            classWiseComponents = data["classWiseComponents"].SourceA;
        }
        else if (addedSource.id === GlobalConstants.SourceBId) {            
            classWiseComponents = data["classWiseComponents"].SourceB;
        }
        else if (addedSource.id === GlobalConstants.SourceCId) {
            classWiseComponents = data["classWiseComponents"].SourceC;
        }
        else if (addedSource.id === GlobalConstants.SourceDId) {
            classWiseComponents = data["classWiseComponents"].SourceD;
        }      

        var sourceManager = createSourceManager(addedSource.id,
            viewerOption.source,
            fileExtension,
            addedSource.visualizer.id,
            addedSource.tableData.id);
        SourceManagers[addedSource.id] = sourceManager;

        sourceManager.RestoreData(classWiseComponents, selectedComponents["NodeIdwiseSelectedComps"]);  
        filterCheckCases(false);      
    }   
}

function restoreComplianceSwitchState(addedSource, controlStates) {
    if (addedSource.id === GlobalConstants.SourceAId &&
        controlStates.sourceAComplianceSwitch.toLowerCase() === "true") {
        addedSource.complianceSwitchChecked = true;
    }
    else if (addedSource.id === GlobalConstants.SourceBId &&
        controlStates.sourceBComplianceSwitch.toLowerCase() === "true") {
        addedSource.complianceSwitchChecked = true;
    }
    else if (addedSource.id === GlobalConstants.SourceCId &&
        controlStates.sourceCComplianceSwitch.toLowerCase() === "true") {
        addedSource.complianceSwitchChecked = true;
    }
    else if (addedSource.id === GlobalConstants.SourceDId &&
        controlStates.sourceDComplianceSwitch.toLowerCase() === "true") {
        addedSource.complianceSwitchChecked = true;
    }
}