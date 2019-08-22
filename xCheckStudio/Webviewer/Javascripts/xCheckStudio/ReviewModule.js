function setUserName() {
    var pierrediv = document.getElementById("pierre");
    pierrediv.innerHTML = (JSON.parse(localStorage.getItem('userinfo'))).username;
}

function setProjectName() {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var powerplantdiv = document.getElementById("powerplant");
    powerplant.innerHTML = projectinfo.projectname;
}

function executeContextMenuClicked(key, options, _this) {
    if (key === "menuItem") {
        if(options.items[key].name == "Accept") {
            onAcceptClick(_this); 
        }
        else {
            onUnAcceptClick(_this); 
        }
    }
    if (key === "menuItem2") {
        if(options.items[key].name == "Restore") {
            onRestoreTranspose(_this);
        }
    }
    else if (key === "lefttoright" || key === "righttoleft") {
        onTransposeClick(key, _this);
        
    }
    else if (key === "freeze") {
    }
    else if (key === "reference") {
        onReferenceClick(_this);
    }
}

function acceptAllCategories() {
    var tab = this.currentlyOpenedTab;
    if (this.currentlyOpenedTab == "ComparisonTabPage") {
        comparisonReviewManager.toggleAcceptAllComparedComponents('acceptAllCategoriesFromComparisonTab');
    }
    else if (this.currentlyOpenedTab == "SourceAComplianceTabPage") {
        sourceAComplianceReviewManager.toggleAcceptAllComparedComponents('acceptAllCategoriesFromComplianceATab');
    }
    else if (this.currentlyOpenedTab == "SourceBComplianceTabPage") {
        sourceBComplianceReviewManager.toggleAcceptAllComparedComponents('acceptAllCategoriesFromComplianceBTab');
    }
}

function resetAllCategories() {
    var tab = this.currentlyOpenedTab;
    if (this.currentlyOpenedTab == "ComparisonTabPage") {
        comparisonReviewManager.toggleAcceptAllComparedComponents('rejectAllCategoriesFromComparisonTab');
    }
    else if (this.currentlyOpenedTab == "SourceAComplianceTabPage") {
        sourceAComplianceReviewManager.toggleAcceptAllComparedComponents('rejectAllCategoriesFromComplianceATab');
    }
    else if (this.currentlyOpenedTab == "SourceBComplianceTabPage") {
        sourceAComplianceReviewManager.toggleAcceptAllComparedComponents('rejectAllCategoriesFromComplianceBTab');
    }
}

function populateCheckResults(comparisonCheckGroups,
    sourceAComplianceCheckGroups,
    sourceBComplianceCheckGroups,
    sourceAComponentsHierarchy,
    sourceBComponentsHierarchy,
    sourceAComplianceHierarchy,
    sourceBComplianceHierarchy) {
    if (!comparisonCheckGroups &&
        !sourceAComplianceCheckGroups &&
        !sourceBComplianceCheckGroups) {
        return;
    }
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    $.ajax({
        url: 'PHP/SourceViewerOptionsReader.php',
        type: "POST",
        async: true,
        data: {
            'ProjectName': projectinfo.projectname,
            'CheckName': checkinfo.checkname
        },
        success: function (msg) {
            var viewerOptions = JSON.parse(msg);

            var sourceAViewerOptions = undefined;
            var sourceAClassWiseComponents = undefined;
            if (viewerOptions['SourceAContainerId'] === undefined ||
                viewerOptions['SourceAEndPointUri'] === undefined) {
                // this ajax call is synchronous

                // get class wise properties for excel and other 1D datasources
               
                $.ajax({
                    url: 'PHP/ClasswiseComponentsReader.php',
                    type: "POST",
                    async: false,
                    data: {
                         'Source': "SourceA",
                         'ProjectName': projectinfo.projectname ,
                         'CheckName': checkinfo.checkname
                        },
                    success: function (msg) {
                        if (msg != 'fail') {
                            sourceAClassWiseComponents = JSON.parse(msg);
                        }
                    }
                });
            }
            else {
                sourceAViewerOptions = [viewerOptions['SourceAContainerId'], viewerOptions['SourceAEndPointUri']];
            }

            var sourceBViewerOptions = undefined;
            var sourceBClassWiseComponents = undefined;
            if (viewerOptions['SourceBContainerId'] === undefined ||
                viewerOptions['SourceBEndPointUri'] === undefined) {
                // this ajax call is synchronous

                // get class wise properties for excel and other 1D datasources
                $.ajax({
                    url: 'PHP/ClasswiseComponentsReader.php',
                    type: "POST",
                    async: false,
                    data: {
                        'Source': "SourceB",
                        'ProjectName': projectinfo.projectname,
                        'CheckName': checkinfo.checkname
                    },
                    success: function (msg) {
                        if (msg != 'fail' && msg != "") {
                            sourceBClassWiseComponents = JSON.parse(msg);
                        }
                    }
                });
            }
            else {
                sourceBViewerOptions = [viewerOptions['SourceBContainerId'], viewerOptions['SourceBEndPointUri']];
            }


            if (comparisonCheckGroups) {
                loadComparisonData(comparisonCheckGroups,
                    sourceAViewerOptions,
                    sourceBViewerOptions,
                    sourceAClassWiseComponents,
                    sourceBClassWiseComponents,
                    sourceAComponentsHierarchy,
                    sourceBComponentsHierarchy);
            }

            if (sourceAComplianceCheckGroups) {
                loadSourceAComplianceData(sourceAComplianceCheckGroups,
                    sourceAViewerOptions,
                    sourceAClassWiseComponents,
                    sourceAComplianceHierarchy,);
            }

            if (sourceBComplianceCheckGroups) {
                loadSourceBComplianceData(sourceBComplianceCheckGroups,
                    sourceBViewerOptions,
                    sourceBClassWiseComponents,
                    sourceBComplianceHierarchy);
            }

            // make buttons collapsible
            setButtonsCollapsible();

            if (comparisonCheckGroups) {
                openCheckResultTab('ComparisonTabPage');
            }
            else if (sourceAComplianceCheckGroups) {
                openCheckResultTab('SourceAComplianceTabPage');
            }
            else if (sourceBComplianceCheckGroups) {
                openCheckResultTab('SourceBComplianceTabPage');
            }
        }
    });
}

function loadSourceAComplianceData(complianceCheckGroups,
    sourceViewerOptions,
    sourceAClassWiseComponents,
    sourceAComplianceHierarchy) {

    sourceAComplianceReviewManager = new ComplianceReviewManager(complianceCheckGroups,
        sourceViewerOptions,
        sourceAClassWiseComponents,
        'SourceAComplianceMainReviewCell',
        'SourceAComplianceDetailedReviewCell',
        'SourceAComplianceDetailedReviewComment',
         sourceAComplianceHierarchy);

    // populate review table
    sourceAComplianceReviewManager.populateReviewTable();
}

function loadSourceBComplianceData(complianceCheckGroups,
    sourceViewerOptions,
    sourceBClassWiseComponents,
    sourceBComplianceHierarchy) {    

    sourceBComplianceReviewManager = new ComplianceReviewManager(complianceCheckGroups,
        sourceViewerOptions,
        sourceBClassWiseComponents,
        'SourceBComplianceMainReviewCell',
        'SourceBComplianceDetailedReviewCell',
        'SourceBComplianceDetailedReviewComment',
         sourceBComplianceHierarchy);


    // populate review table
    sourceBComplianceReviewManager.populateReviewTable(); 

}

function loadComparisonData(comparisonCheckGroups,
    sourceAViewerOptions,
    sourceBViewerOptions,
    sourceAClassWiseComponents,
    sourceBClassWiseComponents,
    sourceAComponentsHierarchy,
    sourceBComponentsHierarchy) {

    comparisonReviewManager = new ComparisonReviewManager(comparisonCheckGroups,
        sourceAViewerOptions,
        sourceBViewerOptions,
        sourceAClassWiseComponents,
        sourceBClassWiseComponents,
        "ComparisonMainReviewCell",
        "ComparisonDetailedReviewCell",
        sourceAComponentsHierarchy,
        sourceBComponentsHierarchy);

}

function onHomeClick() {
    if (confirm("You will be redirected to the Home page.\nAre you sure?")) {
        window.location = "landingPage.html";
      }
}

function onSaveProject(event) {
    // var busySpinner = document.getElementById("divLoading");
    // busySpinner.className = 'show';
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    try {

        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveCheckResultsToCheckSpaceDB",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                alert("Saved check results.");
            }
        });
    }
    catch (error) {
        console.log(error.message);
    }
    finally {
        // // remove busy spinner        
        // busySpinner.classList.remove('show')
    }
}

function onReferenceClick(selectedRow) {
    var referenceManager = new ReferenceManager(selectedRow);
    referenceManager.ShowReferenceDiv();
}

function toggleReferenceDropdown() {
    document.getElementById("newReferenceDropdown").classList.toggle("show");
}