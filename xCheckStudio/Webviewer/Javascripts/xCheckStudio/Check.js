function onCheckButtonClick() {

    showBusyIndicator();

    setTimeout(function () {
        // check if comparison or compliance is selected at least for one datasource
        var continueCheck = false;
        var comparisonCB = document.getElementById('comparisonSwitch');
        if (comparisonCB.checked) {
            continueCheck = true;
        }
        if (!continueCheck) {
            for (var src in model.views) {
                var view = model.views[src];
                if (view.used &&
                    view.complianceSwitchChecked) {
                    continueCheck = true;
                    break;
                }
            }

            if (!continueCheck) {
                showNoCheckTypePrompt();
                // hide busy spinner
                hideBusyIndicator();
                return;
            }
        }

        // check if items are selected
        var itemsSelected = false;
        for (var srcId in SourceManagers) {
            if (SourceManagers[srcId].ModelTree.GetSelectedComponents().length > 0) {
                itemsSelected = true;
                break;
            }
        }
        if (!itemsSelected) {
            showSelectItemsPrompt();
            
            // hide busy spinner
            hideBusyIndicator();

            return;
        }

        sourceAComplianceCheckManager = undefined;
        sourceBComplianceCheckManager = undefined;
        comparisonCheckManager = undefined;

        var checkCaseSelect = document.getElementById("checkCaseSelect");
        if (checkCaseSelect.value.toLowerCase() === "autoselect") {

            if (checkCaseSelect.options.length === 1) {
                showNotValidCheckcasePrompt();
            }
            else {
                showSelectValidCheckCasePrompt();
            }

            // hide busy spinner
            hideBusyIndicator();
            return;
        }

        // check if any check case type is selected
        var comparisonSwitch = document.getElementById('comparisonSwitch');

        // check if one of the check switch is on
        if (!comparisonSwitch.checked &&
            !complianceChecked()) {
            // hide busy spinner
            //busySpinner.classList.remove('show');
            alert('No selected check type found.</br>Please select check type.');
            hideBusyIndicator();
            return;
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

        //var checkPerformed = false;  
        var checkcase = new CheckCase("");
        checkcase.CheckTypes = checkCaseManager.CheckCase.CheckTypes;

        var checksCount = 0;
        var totalChecksTobePerformed = getTotalChecksTobePerformed();

        // perform comparison check
        performComparisonCheck(comparisonSwitch,
            checkcase,
            dataSourceOrderMaintained).then(function (result) {
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
            performSourceAComplianceCheck(checkcase,
                dataSourceOrderMaintained).then(function (result) {
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
            performSourceBComplianceCheck(checkcase,
                dataSourceOrderMaintained).then(function (result) {
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

    }, 1000);
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
    document.getElementById("Check_Complete").style.display = "block";
}

function performComparisonCheck(comparisonCB, checkcase, dataSourceOrderMaintained) {

    return new Promise((resolve) => {
        //var checkPerformed = false;
        if (!comparisonCB.checked) {
            return resolve(false);
        }

        var checkType = checkcase.getCheckType("Comparison");

        if (!comparisonCheckManager) {
            comparisonCheckManager = new CheckManager();
            comparisonCheckManager.performCheck(checkType,
                true,
                undefined,
                dataSourceOrderMaintained).then(function (result) {
                    return resolve(result);
                });

            //checkPerformed = true;
        }

        //return checkPerformed
    });
}

function performSourceAComplianceCheck(checkcase, dataSourceOrderMaintained) {

    return new Promise((resolve) => {
        if (!("a" in SourceManagers)) {
            return resolve(false);
        }

        var checkType = undefined;
        var studioInterface = undefined;

        // get check type
        studioInterface = SourceManagers["a"];
        if (dataSourceOrderMaintained) {
            checkType = checkcase.getCheckType("ComplianceSourceA");
            if (!checkType) {
                checkType = checkcase.getCheckType("Compliance");
            }
        }
        else {
            checkType = checkcase.getCheckType("ComplianceSourceB");
            if (!checkType) {
                checkType = checkcase.getCheckType("Compliance");
            }
        }

        if (!checkType ||
            !studioInterface) {
            alert('Compliance check can not be performed.');
            return resolve(false);
        }

        if (!sourceAComplianceCheckManager) {
            sourceAComplianceCheckManager = new CheckManager();
            sourceAComplianceCheckManager.performCheck(checkType,
                false,
                studioInterface,
                dataSourceOrderMaintained).then(function (result) {
                    return resolve(result);
                });
        }
    });
}

function performSourceBComplianceCheck(checkcase, dataSourceOrderMaintained) {
    return new Promise((resolve) => {
        if (!("b" in SourceManagers)) {
            return resolve(false);
        }

        var checkType = undefined;
        var studioInterface = undefined;

        studioInterface = SourceManagers["b"];
        if (dataSourceOrderMaintained) {
            checkType = checkcase.getCheckType("ComplianceSourceB");
            if (!checkType) {
                checkType = checkcase.getCheckType("Compliance");
            }
        }
        else {
            checkType = checkcase.getCheckType("ComplianceSourceA");
            if (!checkType) {
                checkType = checkcase.getCheckType("Compliance");
            }
        }

        if (!checkType ||
            !studioInterface) {
            alert('Compliance check can not be performed.');
            return resolve(false);
        }

        if (!sourceBComplianceCheckManager) {
            sourceBComplianceCheckManager = new CheckManager();
            sourceBComplianceCheckManager.performCheck(checkType,
                false,
                studioInterface,
                dataSourceOrderMaintained).then(function (result) {
                    return resolve(result);
                });
        }
    });
}

function cancelCheckResults() {
    sourceAComplianceCheckManager = undefined;
    sourceBComplianceCheckManager = undefined;
    comparisonCheckManager = undefined;

    document.getElementById("Check_Complete").style.display = "none";
}

function reviewResults(callbackFunction) {
    //saveData();

    CheckModule.onSaveProgress(true).then(function (result) {
        if (callbackFunction) {
            callbackFunction();
        }

        window.location = "reviewPage.html";
    });
}

function deleteCheckResultsFromDB(checkType) {
    return new Promise((resolve) => {

        var functionToInvoke = undefined;
        if (checkType.toLowerCase() === "comparison") {
            functionToInvoke = "DeleteComparisonResults";
        }
        else if (checkType.toLowerCase() === "sourceacompliance") {
            functionToInvoke = "DeleteSourceAComplianceResults";
        }
        else if (checkType.toLowerCase() === "sourcebcompliance") {
            functionToInvoke = "DeleteSourceBComplianceResults";
        }

        if (functionToInvoke === undefined) {
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
    var overlay = document.getElementById("notValidCheckcaseOverlay");
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
    var overlay = document.getElementById("notValidCheckcaseOverlay");
    var popup = document.getElementById("notValidCheckcasePopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';

}

function showNoCheckTypePrompt() {
    var overlay = document.getElementById("noCheckTypeOverlay");
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
    var overlay = document.getElementById("noCheckTypeOverlay");
    var popup = document.getElementById("noCheckTypePopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function showSelectValidCheckCasePrompt() {
    var overlay = document.getElementById("selectValidCheckcaseOverlay");
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
    var overlay = document.getElementById("selectValidCheckcaseOverlay");
    var popup = document.getElementById("selectValidCheckcasePopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function showSelectItemsPrompt() {
    var overlay = document.getElementById("selectItemsOverlay");
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
    var overlay = document.getElementById("selectItemsOverlay");
    var popup = document.getElementById("selectItemsPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}