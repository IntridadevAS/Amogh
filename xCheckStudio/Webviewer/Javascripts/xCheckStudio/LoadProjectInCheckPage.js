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
            var message = xCheckStudio.Util.tryJsonParse(msg);           
            if (message !== null && 
                message.MsgCode === 1) {
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
        var checkCaseData = xCheckStudio.Util.tryJsonParse(data.checkCaseInfo.checkCaseData);
        if (checkCaseData !== null &&
            checkCaseData.CheckCase &&
            checkCaseData.CheckCase.SourceTypes) {
            model.checkcaseSupportedTypes = Object.values(checkCaseData.CheckCase.SourceTypes);
        }
    }  
    
    // restore property groups
    let propertyGroups = xCheckStudio.Util.tryJsonParse(data.propertyGroups);
    model.propertyGroups = propertyGroups;

    // restore highlight property templates 
    let propertyHighlightTemplates = xCheckStudio.Util.tryJsonParse(data.highlightPropertyTemplates);
    model.propertyHighlightTemplates = propertyHighlightTemplates;

    // restore data change highlight templates 
    if (data.dataChangeHighlightTemplates) {
        let dataChangeHighlightTemplates = xCheckStudio.Util.tryJsonParse(data.dataChangeHighlightTemplates);
        model.dataChangeHighlightTemplates = dataChangeHighlightTemplates;
    }

    // load data sets 
    loadDataSets(data);

    if ("checkspaceComments" in data &&
        data["checkspaceComments"].length > 0) {
            for(var i = 0;  i < data["checkspaceComments"].length; i++)
            {
                var commentData = xCheckStudio.Util.tryJsonParse(data["checkspaceComments"][i]);
                if (commentData !== null) {
                    commentsCallout.ShowComment(commentData);
                }
            }
    }   

    // restore db conenction info
    if (data.dbConnectionInfo) {
        let dbConnectionInfo = xCheckStudio.Util.tryJsonParse(data.dbConnectionInfo);
        model.dbConnectionInfo = dbConnectionInfo;
    }
}

function loadDataSets(data) {
   
    var checkCaseInfo = data["checkCaseInfo"];    

    // get selected check case name
    var checkCaseName;
    if (checkCaseInfo) {
        if ('checkCaseData' in checkCaseInfo) {
            let checkCaseManager = xCheckStudio.Util.tryJsonParse(checkCaseInfo['checkCaseData']);
            if (checkCaseManager !== null &&
                'CheckCase' in checkCaseManager) {
                var checkCase = checkCaseManager['CheckCase'];
                if ('Name' in checkCase) {
                    checkCaseName = checkCase['Name'];
                }
            }
        }
    }

    var viewerOptions = data["sourceViewerOptions"];
    if (viewerOptions && 
        Object.keys(viewerOptions).length > 0) {
        
        viewPanels.addFilesPanel.classList.add("hide");

        for (var srcId in viewerOptions) {
            var viewerOption = viewerOptions[srcId];
            loadDataSource(viewerOption, data, checkCaseName, srcId, checkCaseInfo);
        }
    }
    else {
      checkCaseFilesData.populateCheckCases();

      // select checkcase
      CheckCaseOperations.selectCheckCase(
        checkCaseName ? checkCaseName : "AutoSelect",
        true,
        checkCaseInfo
      );      
    }
}

function loadDataSource(
    viewerOption, 
    data, 
    checkCaseName, 
    srcId,
    checkCaseInfo) {

    if (!viewerOption.source ||
        !viewerOption.sourceType) {
        return;
    }

    var addedSource = controller.addNewFile(viewerOption.source, srcId);
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

        let projectInfo = xCheckStudio.Util.getProjectInfo();
        let checkspaceInfo = xCheckStudio.Util.getCheckspaceInfo();
        let checkspacePath = "../Projects/" + projectInfo.projectname + "/CheckSpaces/" + checkspaceInfo.checkname;
       
        
        let pathToDataset = checkspacePath;      
        if (addedSource.id === "a") {
            pathToDataset  += "/SourceA/";
        }
        else if (addedSource.id === "b") {
            pathToDataset += "/SourceB/";
        }
        else if (addedSource.id === "c") {
            pathToDataset += "/SourceC/";
        }
        else if (addedSource.id === "d") {
            pathToDataset += "/SourceD/";
        }        
        pathToDataset += viewerOption["endPointUri"];       

        xCheckStudio.Util.fileExists(pathToDataset).then(function (success) {
            if (success) {              

                var sourceManager = createSourceManager(addedSource.id, 
                    viewerOption.source,
                    fileExtension,
                    addedSource.visualizer.id,
                    addedSource.tableData.id,
                    pathToDataset);
                SourceManagers[addedSource.id] = sourceManager;

                // get hiddent components
                var hiddenItems = [];
                var hiddenComponents = data.hiddenComponents;
                if ("hiddenComponents" in hiddenComponents) {
                    var comps = xCheckStudio.Util.tryJsonParse(hiddenComponents["hiddenComponents"]);
                    if (comps !== null &&
                        addedSource.id in comps) {
                        for (var node in comps[addedSource.id]) {
                            hiddenItems.push(Number(node));
                        }
                    }
                }
                // get visible components
                var visibleItems = [];
                if ("visibleComponents" in hiddenComponents) {
                    var comps = xCheckStudio.Util.tryJsonParse(hiddenComponents["visibleComponents"]);
                    if (comps !== null &&
                        addedSource.id in comps) {
                        for (var node in comps[addedSource.id]) {
                            visibleItems.push(Number(node));
                        }
                    }
                }

                sourceManager.HiddenNodeIds = hiddenItems;

                sourceManager.LoadData(selectedComponents["NodeIdwiseSelectedComps"], visibleItems, true).then(function (result) {
                    CheckCaseOperations.filterCheckCases(false);

                  // restore views
                  if (data.markupViews[sourceManager.Id]) {
                    sourceManager.RestoreMarkupViews(
                      data.markupViews[sourceManager.Id]
                    );
                  }
                  if (data.bookmarkViews[sourceManager.Id]) {
                    sourceManager.RestoreBookmarkViews(
                      data.bookmarkViews[sourceManager.Id]
                    );
                  }
                  if (data.annotations[sourceManager.Id]) {
                    sourceManager.RestoreAnnotations(
                      data.annotations[sourceManager.Id]
                    );
                  }

                  // restore allcomponents
                  if (sourceManager.Id in data.allComponents) {
                    sourceManager.RestoreAllComponents(
                      data.allComponents[sourceManager.Id]
                    );
                  }

                  // select checkcase
                  CheckCaseOperations.selectCheckCase(
                    checkCaseName ? checkCaseName : "AutoSelect",
                    true,
                    checkCaseInfo
                  );                 

                  // triggere onchange manually
                  var checkCaseSelectElement = CheckCaseOperations.getCheckCaseSelectElement();
                  checkCaseSelectElement.dispatchEvent(new Event("change"));
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
      } else if (addedSource.id === GlobalConstants.SourceBId) {
        classWiseComponents = data["classWiseComponents"].SourceB;
      } else if (addedSource.id === GlobalConstants.SourceCId) {
        classWiseComponents = data["classWiseComponents"].SourceC;
      } else if (addedSource.id === GlobalConstants.SourceDId) {
        classWiseComponents = data["classWiseComponents"].SourceD;
      }

      var sourceManager = createSourceManager(
        addedSource.id,
        viewerOption.source,
        fileExtension,
        addedSource.visualizer.id,
        addedSource.tableData.id
      );
      SourceManagers[addedSource.id] = sourceManager;

      sourceManager.RestoreData(
        classWiseComponents,
        selectedComponents["NodeIdwiseSelectedComps"]
      );
      CheckCaseOperations.filterCheckCases(false);

      // select checkcase
      CheckCaseOperations.selectCheckCase(
        checkCaseName ? checkCaseName : "AutoSelect",
        true,
        checkCaseInfo
      );      

      // triggere onchange manually
      var checkCaseSelectElement = CheckCaseOperations.getCheckCaseSelectElement();
      checkCaseSelectElement.dispatchEvent(new Event("change"));
    } 
    else if (xCheckStudio.Util.isSourceVisio(fileExtension)) {
        
        let projectInfo = xCheckStudio.Util.getProjectInfo();
        let checkspaceInfo = xCheckStudio.Util.getCheckspaceInfo();
        let checkspacePath = "../Projects/" + projectInfo.projectname + "/CheckSpaces/" + checkspaceInfo.checkname;
       
        
        let pathToDataset = checkspacePath;      
        if (addedSource.id === "a") {
            pathToDataset  += "/SourceA/";
        }
        else if (addedSource.id === "b") {
            pathToDataset += "/SourceB/";
        }
        else if (addedSource.id === "c") {
            pathToDataset += "/SourceC/";
        }
        else if (addedSource.id === "d") {
            pathToDataset += "/SourceD/";
        }        
        pathToDataset += viewerOption["endPointUri"];   

        xCheckStudio.Util.fileExists(pathToDataset).then(function (success) {
            if (!success) {
                return;
            }

            var sourceManager = createSourceManager(addedSource.id, 
                viewerOption.source,
                fileExtension,
                addedSource.visualizer.id,
                addedSource.tableData.id,
                pathToDataset);
            SourceManagers[addedSource.id] = sourceManager;

            sourceManager.LoadData(selectedComponents["NodeIdwiseSelectedComps"]).then(function (result) {
                CheckCaseOperations.filterCheckCases(false);

                // select checkcase
                CheckCaseOperations.selectCheckCase(
                  checkCaseName ? checkCaseName : "AutoSelect",
                  true,
                  checkCaseInfo
                );
             

              // triggere onchange manually
              var checkCaseSelectElement = CheckCaseOperations.getCheckCaseSelectElement();
              checkCaseSelectElement.dispatchEvent(new Event("change"));
            });
        });
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