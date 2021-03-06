function onCheckButtonClick() {

    showBusyIndicator();

    setTimeout(function () {
        // check if comparison or compliance is selected at least for one datasource   
        if (!checkTypeSelected()) {
            return;
        }

        // check if items are selected
        if (!componentSelected()) {
            return;
        }

        // check if valid checkcase is selected        
        if (!validCheckcaseSelected()) {
            return;
        }

        // var sourceAComplianceCheckManager = undefined;
        // var sourceBComplianceCheckManager = undefined;
        // comparisonCheckManager = undefined;

        // check if any check case type is selected
        var comparisonSwitch = document.getElementById('comparisonSwitch');

        // check if data sequence is correct to perform comparison
        if (comparisonSwitch.checked) {
            if ("d" in SourceManagers) {
                if (!("a" in SourceManagers) ||
                    !("b" in SourceManagers) ||
                    !("c" in SourceManagers)) {
                    alert("Dataset sequence error.\nPlease reload your datasets to perform comparison check.");
                    hideBusyIndicator();
                    return;
                }
            }
            else if ("c" in SourceManagers) {
                if (!("a" in SourceManagers) ||
                    !("b" in SourceManagers)) {
                    alert("Dataset sequence error.\nPlease reload your datasets to perform comparison check.");
                    hideBusyIndicator();
                    return;
                }
            }
            else if ("b" in SourceManagers) {
                if (!("a" in SourceManagers)) {
                    alert("Dataset sequence error.\nPlease reload your datasets to perform comparison check.");
                    hideBusyIndicator();
                    return;
                }
            }
            else {
                alert("Dataset sequence error.\nPlease reload your datasets to perform comparison check.");
                hideBusyIndicator();
                return;
            }
        }

        //var checkPerformed = false;  
        var checkcase = new CheckCase("");
        checkcase.CheckTypes = checkCaseManager.CheckCase.CheckTypes;

        var checksCount = 0;
        var totalChecksTobePerformed = getTotalChecksTobePerformed();

        deleteAllCheckResults().then(function () {
            // read source components
            getSourceComponents().then(function (srcComponents) {
                if (!srcComponents) {
                    // hide busy spinner
                    hideBusyIndicator();
                    return;
                }

                // perform comparison check
                performComparisonCheck(comparisonSwitch,
                    checkcase,
                    srcComponents).then(function (result) {

                        if (!result) {
                            deleteCheckResultsFromDB("Comparison").then(function (res) {

                            });
                        }

                        checksCount++;
                        if (checksCount === totalChecksTobePerformed) {
                            onCheckCompleted();
                        }
                    });

                // perform source a compliance check      
                if (model.views["a"].used &&
                    model.views["a"].complianceSwitchChecked) {
                    performComplianceCheck(checkcase, "a", srcComponents["a"]).then(function (result) {
                        if (!result) {
                            deleteCheckResultsFromDB("SourceACompliance").then(function (res) {

                            });
                        }

                        checksCount++;
                        if (checksCount === totalChecksTobePerformed) {
                            onCheckCompleted();
                        }
                    });
                }

                // perform source b compliance check       
                if (model.views["b"].used &&
                    model.views["b"].complianceSwitchChecked) {
                    performComplianceCheck(checkcase, "b", srcComponents["b"]).then(function (result) {
                        if (!result) {
                            deleteCheckResultsFromDB("SourceBCompliance").then(function (res) {

                            });
                        }

                        checksCount++;
                        if (checksCount === totalChecksTobePerformed) {
                            onCheckCompleted();
                        }
                    });
                };

                // perform source c compliance check       
                if (model.views["c"].used &&
                    model.views["c"].complianceSwitchChecked) {
                    performComplianceCheck(checkcase, "c", srcComponents["c"]).then(function (result) {
                        if (!result) {
                            deleteCheckResultsFromDB("SourceCCompliance").then(function (res) {

                            });
                        }

                        checksCount++;
                        if (checksCount === totalChecksTobePerformed) {
                            onCheckCompleted();
                        }
                    });
                };

                // perform source d compliance check       
                if (model.views["d"].used &&
                    model.views["d"].complianceSwitchChecked) {
                    performComplianceCheck(checkcase, "d", srcComponents["d"]).then(function (result) {
                        if (!result) {
                            deleteCheckResultsFromDB("SourceDCompliance").then(function (res) {

                            });
                        }

                        checksCount++;
                        if (checksCount === totalChecksTobePerformed) {
                            onCheckCompleted();
                        }
                    });
                };

            });

        });
    }, 1000);
}

function deleteAllCheckResults() {
    return new Promise((resolve) => {
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            url: 'PHP/ProjectManager.php',           
            type: "POST",
            async: true,
            data: {
                'InvokeFunction': "ClearAllCheckResultsFromTemp",
                "ProjectName": projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                return resolve(true);
            },
            error: function (error) {
                return resolve(false);
            }
        });
    });
}

function getSourceComponents() {

    return new Promise((resolve) => {

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            url: 'PHP/ReadSourceComponents.php',
            type: "POST",
            async: false,
            data: {
                "ProjectName": projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (data) {
                var result = xCheckStudio.Util.tryJsonParse(data);                
                if (result === null || result.MsgCode != 1) {
                    return resolve(undefined);
                }

                var allData = {};
                var sourceWiseComponents = result.Data;
                for (var src in sourceWiseComponents) {
                    var components = sourceWiseComponents[src];

                    var srcComponents = {};
                    var srcProperties = {};
                    var parseComponents = [];

                    for (var mainClass in components) {
                        srcComponents[mainClass] = [];

                        var mainClassComponents = components[mainClass];
                        for (var i = 0; i < mainClassComponents.length; i++) {
                            var component = mainClassComponents[i];

                            // components
                            if (!parseComponents.includes(component['compId'])) {
                                parseComponents.push(component['compId']);

                                var componentData = {};
                                componentData['id'] = component['compId'];
                                componentData['name'] = component['compName'];
                                componentData['mainclass'] = component['compMainClass'];
                                componentData['subclass'] = component['compSubClass'];

                                if ("compNodeId" in component) {
                                    componentData["nodeid"] = component['compNodeId'];
                                }

                                srcComponents[mainClass].push(componentData);
                            }

                            // properties
                            var propertyData = {
                                'name': component['propName'],
                                'value': component['propValue'],
                                'ownercomponent': component['propOwner']
                            };

                            if (!(component['compId'] in srcProperties)) {
                                srcProperties[component['compId']] = {};
                            }

                            srcProperties[component['compId']][component["propName"]] = propertyData;
                        }
                    }

                    allData[src] = {
                        'components': srcComponents,
                        'properties': srcProperties
                    };
                }

                return resolve(allData);
            },
            error: function (error) {
                return resolve(undefined);
            }
        });
    });
}

function validCheckcaseSelected() {
    var checkCaseSelectElement = CheckCaseOperations.getCheckCaseSelectElement();
    if (checkCaseSelectElement.value.toLowerCase() === "autoselect" ||
        !checkCaseManager ||
        !checkCaseManager.CheckCase) {

        if (checkCaseSelectElement.options.length === 1) {
            showNotValidCheckcasePrompt();
        }
        else {
            showSelectValidCheckCasePrompt();
        }

        // hide busy spinner
        hideBusyIndicator();

        return false;
    }

    return true
}

function componentSelected() {
    for (var srcId in SourceManagers) {
        if (SourceManagers[srcId].ModelTree.GetSelectedComponents().length > 0) {
            return true;
        }
    }

    showSelectItemsPrompt();

    // hide busy spinner
    hideBusyIndicator();

    return false;
}

function checkTypeSelected() {

    var comparisonCB = document.getElementById('comparisonSwitch');
    if (comparisonCB.checked) {
        return true;
    }
    for (var src in model.views) {
        var view = model.views[src];
        if (view.used &&
            view.complianceSwitchChecked) {
            return true;
        }
    }

    showNoCheckTypePrompt();

    // hide busy spinner
    hideBusyIndicator();

    return false;
}

function complianceChecked() {
    for (var id in model.views) {
        if (model.views[id].used &&
            model.views[id].complianceSwitchChecked) {
            return true;
        }
    }

    return false;
}

function getTotalChecksTobePerformed() {
    var count = 0;

    // check if any check case type is selected
    var comparisonSwitch = document.getElementById('comparisonSwitch');
    if (comparisonSwitch.checked) {
        count++;
    }

    // total compliance checks
    for (var id in model.views) {
        if (model.views[id].used &&
            model.views[id].complianceSwitchChecked) {
            count++;
        }
    }

    return count;
}

function onCheckCompleted() {
    hideBusyIndicator();

    showCheckCompletePrompt();
}

function showCheckCompletePrompt() {
    document.getElementById("uiBlockingOverlay").style.display = "block";
    document.getElementById("Check_Complete").style.display = "block";
}

function performComparisonCheck(comparisonCB, checkcase, srcComponents) {

    return new Promise((resolve) => {

        if (!comparisonCB.checked) {
            return resolve(false);
        }

        var checkType = checkcase.getCheckType("Comparison");

        // if (!comparisonCheckManager) {
        var comparisonCheckManager = new CheckManager();
        comparisonCheckManager.performCheck(checkType,
            true,
            undefined,
            srcComponents).then(function (result) {
                return resolve(result);
            });
        // }        
    });
}

function performComplianceCheck(checkcase, srcId, srcComponents) {
    return new Promise((resolve) => {
        if (!(srcId in SourceManagers)) {
            return resolve(false);
        }

        var studioInterface = SourceManagers[srcId];
        var checkType = undefined;

        var dataSourceOrderInCheckCase = getDataSourceOrderInCheckcase();
        var sourceOrderInCheckcase = dataSourceOrderInCheckCase[srcId];
        if (sourceOrderInCheckcase === 1) {
            checkType = checkcase.getCheckType("ComplianceSourceA");
        }
        else if (sourceOrderInCheckcase === 2) {
            checkType = checkcase.getCheckType("ComplianceSourceB");
        }
        else if (sourceOrderInCheckcase === 3) {
            checkType = checkcase.getCheckType("ComplianceSourceC");
        }
        else if (sourceOrderInCheckcase === 4) {
            checkType = checkcase.getCheckType("ComplianceSourceD");
        }
        if (!checkType) {
            checkType = checkcase.getCheckType("Compliance");
        }

        if (!checkType ||
            !studioInterface) {
            alert('Compliance check can not be performed.');
            return resolve(false);
        }

        // if (!sourceAComplianceCheckManager) {
        var complianceCheckManager = new CheckManager();
        complianceCheckManager.performCheck(checkType,
            false,
            studioInterface,
            srcComponents).then(function (result) {
                return resolve(result);
            });
        // }
    });
}

function cancelCheckResults() {
    document.getElementById("uiBlockingOverlay").style.display = "none";
    document.getElementById("Check_Complete").style.display = "none";
}

function reviewResults(callbackFunction) { 
    // hide check_complete prompt to avoid double clicking issue
    document.getElementById("Check_Complete").style.display = "none";
    
    SetCheckSpaceReviewStatus().then(function (res) {
        CheckModule.onSaveProgress(true).then(function (result) {            
           
            let allPromises = [];
            if (callbackFunction) {
                allPromises.push(callbackFunction());
            }

            // check in the checkspace
            let projInfo = xCheckStudio.Util.tryJsonParse(localStorage.getItem("projectinfo"));
            let checkinfo = xCheckStudio.Util.tryJsonParse(localStorage.getItem("checkinfo"));
            let userinfo = xCheckStudio.Util.tryJsonParse(localStorage.getItem("userinfo"));

            if (projInfo &&
                checkinfo &&
                userinfo) {
                    
                xCheckStudio.Util.waitUntilAllPromises(allPromises).then(function (res) {
                    CheckspaceCheckout.checkout(
                        projInfo.projectname,
                        checkinfo.checkid,
                        userinfo.userid
                    ).then(function (result) {
                        // var object = xCheckStudio.Util.tryJsonParse(msg);
                        if (result === null) {
                            showAlertForm('Failed to checkout checkspace');
                            return;
                        }
                        else if (result.MsgCode === -1) {
                            showAlertForm('Checkspace is in use by \'' + result.Data + '\'.');
                            return;
                        }
                        else if (result.MsgCode !== 1) {
                            showAlertForm('Failed to checkout checkspace');
                            return;
                        }

                        window.location = "reviewPage.html";
                    });
                });                
            }            
        });
    });
}

function SetCheckSpaceReviewStatus() {
    return new Promise((resolve) => {
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            data: {
                'InvokeFunction': 'SetReviewStatus',
                'CheckId': checkinfo.checkid,
                'ProjectName': projectinfo.projectname,
                'Review': 1,
            },
            type: "POST",
            url: "PHP/CheckSpaceManager.php"
        }).done(function (msg) {
            if (msg === "true") {
                checkinfo.review = "1";
                localStorage.setItem("checkinfo", JSON.stringify(checkinfo));
                return resolve(true);
            }
            return resolve(false);
        });
    });
}

function deleteCheckResultsFromDB(checkType) {
    return new Promise((resolve) => {

        var functionToInvoke = null;
        if (checkType.toLowerCase() === "comparison") {
            functionToInvoke = "DeleteComparisonResults";
        }
        else if (checkType.toLowerCase() === "sourceacompliance") {
            functionToInvoke = "DeleteSourceAComplianceResults";
        }
        else if (checkType.toLowerCase() === "sourcebcompliance") {
            functionToInvoke = "DeleteSourceBComplianceResults";
        }
        else if (checkType.toLowerCase() === "sourceccompliance") {
            functionToInvoke = "DeleteSourceCComplianceResults";
        }
        else if (checkType.toLowerCase() === "sourcedcompliance") {
            functionToInvoke = "DeleteSourceDComplianceResults";
        }

        if (functionToInvoke === null) {
            return resolve(false);
        }
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            data: {
                'InvokeFunction': functionToInvoke,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            async: false,
            type: "POST",
            url: "PHP/ProjectManager.php"
        }).done(function (msg) {

            return resolve(true);
        });
    });
}

function showNotValidCheckcasePrompt() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("notValidCheckcasePopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

function onNotValidCheckcaseOk() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("notValidCheckcasePopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';

}

function showNoCheckTypePrompt() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("noCheckTypePopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

function onSelectCheckTypeOk() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("noCheckTypePopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function showSelectValidCheckCasePrompt() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("selectValidCheckcasePopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

function onSelectValidCheckCaseOk() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("selectValidCheckcasePopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function showSelectItemsPrompt() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("selectItemsPopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

function onSelectItemsOk() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("selectItemsPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function getDataSourceOrderInCheckcase() {
    var dataSourceOrderInCheckCase = {};
    var sourceTypesFromCheckCase = checkCaseManager.CheckCase.SourceTypes;
    var sourcesTraversed = [];
    for (var srcId in SourceManagers) {
        var sourceManager = SourceManagers[srcId];
        if ('sourceA' in sourceTypesFromCheckCase &&
            !sourcesTraversed.includes('sourceA') &&
            sourceTypesFromCheckCase['sourceA'].toLowerCase() === sourceManager.SourceType.toLowerCase()) {
            dataSourceOrderInCheckCase[srcId] = 1;
            sourcesTraversed.push('sourceA');
        }
        else if ('sourceB' in sourceTypesFromCheckCase &&
            !sourcesTraversed.includes('sourceB') &&
            sourceTypesFromCheckCase['sourceB'].toLowerCase() === sourceManager.SourceType.toLowerCase()) {
            dataSourceOrderInCheckCase[srcId] = 2;
            sourcesTraversed.push('sourceB');
        }
        else if ('sourceC' in sourceTypesFromCheckCase &&
            !sourcesTraversed.includes('sourceC') &&
            sourceTypesFromCheckCase['sourceC'].toLowerCase() === sourceManager.SourceType.toLowerCase()) {
            dataSourceOrderInCheckCase[srcId] = 3;
            sourcesTraversed.push('sourceC');
        }
        else if ('sourceD' in sourceTypesFromCheckCase &&
            !sourcesTraversed.includes('sourceD') &&
            sourceTypesFromCheckCase['sourceD'].toLowerCase() === sourceManager.SourceType.toLowerCase()) {
            dataSourceOrderInCheckCase[srcId] = 4;
            sourcesTraversed.push('sourceD');
        }
    }

    return dataSourceOrderInCheckCase;
}