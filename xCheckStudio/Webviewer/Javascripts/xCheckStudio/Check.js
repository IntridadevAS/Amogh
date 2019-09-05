function onCheckButtonClick() {

    showBusyIndicator();

    setTimeout(function () {
        sourceAComplianceCheckManager = undefined;
        sourceBComplianceCheckManager = undefined;
        comparisonCheckManager = undefined;

        var checkCaseSelect = document.getElementById("checkCaseSelect");
        if (checkCaseSelect.value === "None") {
            // hide busy spinner
            busySpinner.classList.remove('show');
            //alert("Please select check case from list.")
            alert('Please select check case from list.');
            hideBusyIndicator();
            return;
        }

        // check if any check case type is selected
        var comparisonSwitch = document.getElementById('comparisonSwitch');
        var complianceSwitch = document.getElementById('complianceSwitch');

        // check if one of the check switch is on
        if (!comparisonSwitch.checked &&
            !complianceSwitch.checked) {
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
        var totalChecksTobePerformed = 3;

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
        performSourceAComplianceCheck(complianceSwitch,
            checkcase,
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

        // perform source b compliance check                      
        performSourceBComplianceCheck(complianceSwitch,
            checkcase,
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

    }, 1000);   
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

function performSourceAComplianceCheck(complianceCB, checkcase, dataSourceOrderMaintained) {

    return new Promise((resolve) => {
        if (!("a" in SourceManagers) ||
            !complianceCB.checked) {
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

function performSourceBComplianceCheck(complianceCB, checkcase, dataSourceOrderMaintained) {
    return new Promise((resolve) => {
        if (!("b" in SourceManagers) ||
            !complianceCB.checked) {
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

function reviewResults() {
    saveData();
    window.location = "module2.html";
    //window.location = "reviewPage.html";
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

