function setUserName() {
    $.ajax({
        data: { 'variable': 'Name' },
        type: "POST",
        url: "PHP/GetSessionVariable.php"
    }).done(function (msg) {
        if (msg !== 'fail') {
            var pierrediv = document.getElementById("pierre");
            if (msg != "" && pierrediv != null)
                pierrediv.innerHTML = msg;
        }
    });
}

function setProjectName() {
    $.ajax({
        data: { 'variable': 'ProjectName' },
        type: "POST",
        url: "PHP/GetSessionVariable.php"
    }).done(function (msg) {
        if (msg !== 'fail') {
            var powerplantdiv = document.getElementById("powerplant");
            if (msg != "" && powerplantdiv != null)
                powerplant.innerHTML = msg;
        }
    });
}

function acceptAllCategories() {
    var tab = this.currentlyOpenedTab;
    if(this.currentlyOpenedTab == "ComparisonTabPage") {
        comparisonReviewManager.toggleAcceptAllComparedComponents('acceptAllCategoriesFromComparisonTab');
    }
    else if(this.currentlyOpenedTab == "SourceAComplianceTabPage") {
        sourceAComplianceReviewManager.toggleAcceptAllComparedComponents('acceptAllCategoriesFromComplianceATab');
    }
    else if(this.currentlyOpenedTab == "SourceBComplianceTabPage") {
        sourceBComplianceReviewManager.toggleAcceptAllComparedComponents('acceptAllCategoriesFromComplianceBTab');
    }
}

function resetAllCategories() {
    var tab = this.currentlyOpenedTab;
    if(this.currentlyOpenedTab == "ComparisonTabPage") {
        comparisonReviewManager.toggleAcceptAllComparedComponents('rejectAllCategoriesFromComparisonTab');
    }
    else if(this.currentlyOpenedTab == "SourceAComplianceTabPage") {
        sourceAComplianceReviewManager.toggleAcceptAllComparedComponents('rejectAllCategoriesFromComplianceATab');
    }
    else if(this.currentlyOpenedTab == "SourceBComplianceTabPage") {
        sourceAComplianceReviewManager.toggleAcceptAllComparedComponents('rejectAllCategoriesFromComplianceBTab');
    }
}

function populateCheckResults(comparisonCheckGroups,
    sourceAComplianceCheckGroups,
    sourceBComplianceCheckGroups) 
{
    if(!comparisonCheckGroups &&
      !sourceAComplianceCheckGroups &&
      !sourceBComplianceCheckGroups)
    {
        return;
    }
   
    $.ajax({
        url: 'PHP/SourceViewerOptionsReader.php',
        type: "POST",
        async: true,
        data: {},
        success: function (msg) {
            var viewerOptions = JSON.parse(msg);

            var sourceAViewerOptions = undefined;
            var sourceAClassWiseComponents = undefined;
            if(viewerOptions['SourceAContainerId'] === undefined ||
               viewerOptions['SourceAEndPointUri'] === undefined)
            {
                 // this ajax call is synchronous

                 // get class wise properties for excel and other 1D datasources
                 $.ajax({
                    url: 'PHP/ClasswiseComponentsReader.php',
                    type: "POST",
                    async: false,
                    data: {'Source' : "SourceA"},
                     success: function (msg) {
                         if (msg != 'fail') {
                             sourceAClassWiseComponents = JSON.parse(msg);
                         }
                     }
                 });
            }
            else
            {
                sourceAViewerOptions = [viewerOptions['SourceAContainerId'], viewerOptions['SourceAEndPointUri']];
            }

            var sourceBViewerOptions = undefined;
            var sourceBClassWiseComponents = undefined;
            if(viewerOptions['SourceBContainerId'] === undefined ||
               viewerOptions['SourceBEndPointUri'] === undefined)
            {
                // this ajax call is synchronous

                // get class wise properties for excel and other 1D datasources
                $.ajax({
                    url: 'PHP/ClasswiseComponentsReader.php',
                    type: "POST",
                    async: false,
                    data: {'Source' : "SourceB"},
                    success: function (msg) 
                    {
                        if (msg != 'fail' && msg != "") {
                            sourceBClassWiseComponents = JSON.parse(msg);
                        }
                    }
                });
            }
            else
            {
                sourceBViewerOptions = [viewerOptions['SourceBContainerId'], viewerOptions['SourceBEndPointUri']];
            }


            if (comparisonCheckGroups) 
            {
                loadComparisonData(comparisonCheckGroups, 
                                   sourceAViewerOptions, 
                                   sourceBViewerOptions,
                                   sourceAClassWiseComponents,
                                   sourceBClassWiseComponents);
            }

            if (sourceAComplianceCheckGroups) 
            {
                loadSourceAComplianceData(sourceAComplianceCheckGroups,
                                          sourceAViewerOptions,
                                          sourceAClassWiseComponents);
            }

            if (sourceBComplianceCheckGroups) 
            {
                loadSourceBComplianceData(sourceBComplianceCheckGroups, 
                                          sourceBViewerOptions,
                                          sourceBClassWiseComponents);
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
    sourceAClassWiseComponents) {   

    sourceAComplianceReviewManager = new ComplianceReviewManager(complianceCheckGroups,
        sourceViewerOptions,
        sourceAClassWiseComponents,
        'SourceAComplianceMainReviewCell',
        'SourceAComplianceDetailedReviewCell',
        'SourceAComplianceDetailedReviewComment');

    // populate review table
    sourceAComplianceReviewManager.populateReviewTable();
    if(comparisonReviewManager !== undefined)
        comparisonReviewManager.complianceA = sourceAComplianceReviewManager;

}

function loadSourceBComplianceData(complianceCheckGroups,
                                   sourceViewerOptions,
                                   sourceBClassWiseComponents) {

    // var sourceViewerOptions = undefined;
    // if(viewerOptions['SourceBContainerId'] !== undefined &&
    //     viewerOptions['SourceBEndPointUri'] !== undefined)
    // {
    //     sourceViewerOptions = [viewerOptions['SourceBContainerId'], viewerOptions['SourceBEndPointUri']];
    // }

    sourceBComplianceReviewManager = new  ComplianceReviewManager(complianceCheckGroups,
        sourceViewerOptions,
        sourceBClassWiseComponents,
        'SourceBComplianceMainReviewCell',
        'SourceBComplianceDetailedReviewCell',
        'SourceBComplianceDetailedReviewComment');


    // populate review table
    sourceBComplianceReviewManager.populateReviewTable();
    if(comparisonReviewManager !== undefined)
        comparisonReviewManager.complianceB = sourceBComplianceReviewManager;

}

function loadComparisonData(comparisonCheckGroups, 
                            sourceAViewerOptions, 
                            sourceBViewerOptions,
                            sourceAClassWiseComponents,
                            sourceBClassWiseComponents)
{      

    comparisonReviewManager = new ComparisonReviewManager(comparisonCheckGroups,
                                                          sourceAViewerOptions,
                                                          sourceBViewerOptions,
                                                          sourceAClassWiseComponents,
                                                          sourceBClassWiseComponents,
                                                          "ComparisonMainReviewCell",
                                                          "ComparisonDetailedReviewCell"/*,
                                                            undefined,
                                                            undefined,
                                                            undefined,
                                                            undefined*/);

    // populate review table
    comparisonReviewManager.populateReviewTable();     
}


function onSaveProject(event) {
    // var busySpinner = document.getElementById("divLoading");
    // busySpinner.className = 'show';

    try {

        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveCheckResultsToCheckSpaceDB"
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

function onReferenceClick(selectedRow)
{
    var referenceManager = new ReferenceManager(selectedRow);
    referenceManager.ShowReferenceDiv();    
}

 function sadsajkdhjlsak() 
{
    var webAddressString = document.getElementById("webAddressInput").value;
    alert(webAddressString);
}

function toggleDropdown() 
{
    document.getElementById("newReferenceDropdown").classList.toggle("show");
}