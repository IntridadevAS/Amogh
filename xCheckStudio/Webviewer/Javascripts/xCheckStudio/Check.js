function onCheckButtonClick() {
    // var busySpinner = document.getElementById("divLoading");
    // busySpinner.className = 'show';

    sourceAComplianceCheckManager = undefined;
    sourceBComplianceCheckManager = undefined;
    comparisonCheckManager = undefined;

    var checkCaseSelect = document.getElementById("checkCaseSelect");
    if (checkCaseSelect.value === "None") {
        // hide busy spinner
        busySpinner.classList.remove('show');
        //alert("Please select check case from list.")
        OnShowToast('Please select check case from list.');
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
        OnShowToast('No selected check type found.</br>Please select check type.');
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
     
    // var occurrenceIndexList = ;
    // for(var tab in SourceManagers)
    // {
    //     var index = checkCaseManager.indexOf(SourceManagers[tab].SourceType);
    // }

    //var checkPerformed = false;  
    var checkcase = new CheckCase("");
    checkcase.CheckTypes = checkCaseManager.CheckCase.CheckTypes;

    // perform comparison check
    var comparisonPerformed = performComparisonCheck(comparisonSwitch,
        checkcase,
        dataSourceOrderMaintained);

    // perform source a compliance check                      
    var sourceACompliancePerformed = performSourceAComplianceCheck(complianceSwitch, 
        checkcase,
        dataSourceOrderMaintained);

    // perform source b compliance check                      
    var sourceBCompliancePerformed = performSourceBComplianceCheck(complianceSwitch, 
        checkcase,
        dataSourceOrderMaintained);


    // if  source a compliance check is not performed, then delete the comparison result tables from project database if already exists.
    if (!comparisonPerformed) {
        deleteCheckResultsFromDB("Comparison").then(function (result) {

        });
    }

    // if comparison check is not performed, then delete the comparison result tables from project database if already exists.
    if (!sourceACompliancePerformed) {
        deleteCheckResultsFromDB("SourceACompliance").then(function (result) {

        });
    }
   
    // if source b compliance check is not performed, then delete the comparison result tables from project database if already exists.
    if (!sourceBCompliancePerformed) {
        deleteCheckResultsFromDB("SourceBCompliance").then(function (result) {

        });
    }

    // hide busy spinner
    //busySpinner.classList.remove('show');
    if (!comparisonPerformed &&
        !sourceACompliancePerformed &&
        !sourceBCompliancePerformed) {
        return;
    }

    if (confirm("Check complete. View results?")) {
        reviewResults();
    }
    else {
        cancelCheckResults();
    }
    //document.getElementById("checkcompletealert").style.display = "block";
}

function performComparisonCheck(comparisonCB, checkcase, dataSourceOrderMaintained) {

    var checkPerformed = false;
    if (!comparisonCB.checked) {
        return;
    }

    // var sourceAModelBrowser = sourceManager1.GetModelBrowser();
    // var sourceBModelBrowser = sourceManager2.GetModelBrowser();
    // if (!sourceAModelBrowser || !sourceBModelBrowser) {
    //     OnShowToast('Comparison check can not be performed.');
    //     return;
    // }

    // // check if there are no selected components
    // if (sourceAModelBrowser.GetSelectedComponents().length === 0 &&
    //     sourceBModelBrowser.GetSelectedComponents().length === 0) {
    //     //alert("Comparison check can not be performed.\nNo selected components found for both data sources.");
    //     OnShowToast('Comparison check can not be performed.</br>No selected components found for both data sources.');
    //     return;
    // }

    var checkType = checkcase.getCheckType("Comparison");

    if (!comparisonCheckManager) {
        comparisonCheckManager = new CheckManager();
        comparisonCheckManager.performCheck(checkType,
            true,
            undefined,
            dataSourceOrderMaintained);

        checkPerformed = true;
    }

    return checkPerformed
}

function performSourceAComplianceCheck(complianceCB, checkcase, dataSourceOrderMaintained) {

    if (!("a" in SourceManagers) ||
        !complianceCB.checked) {
        return;
    }

    //if (sourceManager1 && complianceSourceACB.classList.contains("state1")) {

    var checkType = undefined;
    var studioInterface = undefined;
   
    // var orderMaintained = true;
    // if (("a" in SourceManagers) &&
    //     ("b" in SourceManagers)) {
    //     if (SourceManagers["a"].SourceType.toLowerCase() === checkCaseType.SourceBType.toLowerCase() &&
    //         SourceManagers["b"].SourceType.toLowerCase() === checkCaseType.SourceAType.toLowerCase()) {
    //         orderMaintained = false;
    //     }
    // }

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
        OnShowToast('Compliance check can not be performed.');
        return false;
    }

    // var sourceAModelBrowser = sourceManager1.GetModelBrowser();
    // if (!sourceAModelBrowser) {
    //     OnShowToast('Compliance check can not be performed.');
    //     return false;
    // }


    // if (sourceAModelBrowser.GetSelectedComponents().length === 0) {
    //     OnShowToast('Compliance check can not be performed.</br>No selected components found for data source A.');
    //     return false;
    // }
    else {
        if (!sourceAComplianceCheckManager) {
            sourceAComplianceCheckManager = new CheckManager();
            sourceAComplianceCheckManager.performCheck(checkType,
                false,
                studioInterface,
                dataSourceOrderMaintained);

            return true;
        }
    }
    //}

    return false;
}

function performSourceBComplianceCheck(complianceCB, checkcase, dataSourceOrderMaintained) {
    if (!("b" in SourceManagers) ||
        !complianceCB.checked) {
        return;
    }
    
    //if (sourceManager2 && complianceSourceBCB.classList.contains("state1")) {
        var checkType = undefined;
        var studioInterface = undefined;
      
        // var orderMaintained = true;
        // if (("a" in SourceManagers) &&
        //     ("b" in SourceManagers)) {
        //     if (SourceManagers["a"].SourceType.toLowerCase() === checkCaseType.SourceBType.toLowerCase() &&
        //         SourceManagers["b"].SourceType.toLowerCase() === checkCaseType.SourceAType.toLowerCase()) {
        //         orderMaintained = false;
        //     }
        // }

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
            OnShowToast('Compliance check can not be performed.');
            return false;
        }

        // var sourceBModelBrowser = sourceManager2.GetModelBrowser();
        // if (!sourceBModelBrowser) {
        //     OnShowToast('Compliance check can not be performed.');
        //     return false;
        // }


        // if (sourceBModelBrowser.GetSelectedComponents().length === 0) {
        //     //alert("Compliance check on Source A can not be performed.\nNo selected components found.");
        //     OnShowToast('Compliance check can not be performed.</br>No selected components found for data source B.');
        //     return false;
        // }
        else {
            if (!sourceBComplianceCheckManager) {
                sourceBComplianceCheckManager = new CheckManager();
                sourceBComplianceCheckManager.performCheck(checkType,
                    false,
                    studioInterface,
                    dataSourceOrderMaintained);

                return true;
            }
        }
    //}

    return false;
}

function cancelCheckResults() {
    sourceAComplianceCheckManager = undefined;
    sourceBComplianceCheckManager = undefined;
    comparisonCheckManager = undefined;

    //document.getElementById("checkcompletealert").style.display = "none";
}

function reviewResults() {
    saveData();
    window.location = "module2.html";
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

