// var comparisonCheckGroups = undefined;
var comparisons;
var compliances;
// var sourceAComplianceCheckGroups = undefined;
// var sourceBComplianceCheckGroups = undefined;
var sourceAComparisonHierarchy = undefined;
var sourceBComparisonHierarchy = undefined;
// var sourceAComplianceHierarchy = undefined;
// var sourceBComplianceHierarchy = undefined;


var comparisonReviewManager;
var complianceReviewManager;

function initReviewModule() {
    // // set project name
    // setProjectName();

    // // set user name
    // setUserName();
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    // read  check data
    $.ajax({
        url: 'PHP/CheckResultsReader.php',
        type: "POST",
        async: true,
        data: {
            'ProjectName': projectinfo.projectname,
            'CheckName': checkinfo.checkname
        },
        success: function (msg) {
            var checkResults = JSON.parse(msg);

            // var comparisonCheckGroups = undefined;
            // var sourceAComplianceCheckGroups = undefined;
            // var sourceBComplianceCheckGroups = undefined;
            // var sourceAComparisonHierarchy = undefined;
            // var sourceBComparisonHierarchy = undefined;
            // var sourceAComplianceHierarchy = undefined;
            // var sourceBComplianceHierarchy = undefined;

            // initialize the check data
            model.files = {};
            if ("sourceInfo" in checkResults) {
                var sourceInfo = checkResults["sourceInfo"];

                // 1st source
                if ("sourceAFileName" in sourceInfo) {
                    var file = {};
                    file["id"] = "a";
                    file["fileName"] = sourceInfo["sourceAFileName"];
                    file["compliance"] = false;
                    file["sourceType"] = sourceInfo["sourceAType"];

                    model.files[file.id] = file;
                }

                // 2nd source
                if ("sourceBFileName" in sourceInfo) {
                    var file = {};
                    file["id"] = "b";
                    file["fileName"] = sourceInfo["sourceBFileName"];
                    file["compliance"] = false;
                    file["sourceType"] = sourceInfo["sourceBType"];

                    model.files[file.id] = file;
                }
            }

            for (var key in checkResults) {
                if (!checkResults.hasOwnProperty(key)) {
                    continue;
                }

                if (key == 'Comparisons') {
                    comparisons = checkResults[key];
                    // comparisonCheckGroups = new CheckGroups();
                    // comparisonCheckGroups.restore(checkResults[key], false);
                }
                else if(key == 'Compliances')
                {
                    compliances = checkResults[key];

                    // set compliance true/false for sources
                    for (var i = 0; i < compliances.length; i++) {
                        var compliance = compliances[i];

                        for (var sourceId in model.files) {
                            var file = model.files[sourceId];
                            if(file.fileName === compliance.source)
                            {
                                file["compliance"] = true;
                            }
                        }
                    }
                }
                // else if (key == 'SourceACompliance') {
                //     sourceAComplianceCheckGroups = new CheckGroups();
                //     sourceAComplianceCheckGroups.restore(checkResults[key], true);

                //     model.files["a"].compliance = true;
                // }
                // else if (key == 'SourceBCompliance') {
                //     sourceBComplianceCheckGroups = new CheckGroups();
                //     sourceBComplianceCheckGroups.restore(checkResults[key], true);

                //     model.files["b"].compliance = true;
                // }
                else if (key == 'SourceAComparisonComponentsHierarchy') {
                    sourceAComparisonHierarchy = checkResults[key];
                }
                else if (key == 'SourceBComparisonComponentsHierarchy') {
                    sourceBComparisonHierarchy = checkResults[key];
                }
                // else if (key == 'SourceAComplianceComponentsHierarchy') {
                //     sourceAComplianceHierarchy = checkResults[key];
                // }
                // else if (key == 'SourceBComplianceComponentsHierarchy') {
                //     sourceBComplianceHierarchy = checkResults[key];
                // }
            }            
        },
        error: function (error) {
            //alert('error; ' + eval(error));
        }
    });
}

function populateCheckResults(comparison,
    compliance,
    sourceAComponentsHierarchy,
    sourceBComponentsHierarchy) {
    if (!comparison &&
        !compliance) {
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

            // var sourceAViewerOptions = undefined;
            //var sourceAClassWiseComponents = undefined;
            var classWiseComponents = {};
            if (viewerOptions['a'] === undefined) {
                
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
                            // sourceAClassWiseComponents = JSON.parse(msg);
                            classWiseComponents['a']  = sourceAClassWiseComponents = JSON.parse(msg);
                        }
                    }
                });
            }
            // else {
            //     sourceAViewerOptions = [viewerOptions['SourceAEndPointUri']];
            // }

            // var sourceBViewerOptions = undefined;
            //var sourceBClassWiseComponents = undefined;
            if (viewerOptions['b'] === undefined) {
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
                            // sourceBClassWiseComponents = JSON.parse(msg);
                            classWiseComponents['b']  = sourceAClassWiseComponents = JSON.parse(msg);
                        }
                    }
                });
            }
            // else {
            //     sourceBViewerOptions = [viewerOptions['SourceBEndPointUri']];
            // }


            if (comparison) {
                loadComparisonData(comparison,
                    viewerOptions['a'],
                    viewerOptions['b'],
                    classWiseComponents['a'],
                    classWiseComponents['b'],
                    sourceAComponentsHierarchy,
                    sourceBComponentsHierarchy);
            }

            if (compliance) {

                for(var source in viewerOptions)
                {
                    var viewerOption = viewerOptions[source];
                    if(viewerOption.source === compliance.source)
                    {
                        loadComplianceData(compliance,
                            viewerOption,
                            classWiseComponents[source]);

                        break;
                    }
                }
         
            }

            // if (sourceBComplianceCheckGroups) {
            //     loadSourceBComplianceData(sourceBComplianceCheckGroups,
            //         sourceBViewerOptions,
            //         sourceBClassWiseComponents,
            //         sourceBComplianceHierarchy);
            // }

            // make buttons collapsible
            setButtonsCollapsible();         
        }
    });
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
        "comparisonMainContainer",
        "comparisonDetailInfo",
        sourceAComponentsHierarchy,
        sourceBComponentsHierarchy);
    
    comparisonReviewManager.loadDatasources();

    // set current view
    model.currentView  = comparisonReviewManager;
    
    // set comparison data

    // review manager
    var comparisonData = model.checks["comparison"];
    comparisonData["reviewManager"]  = comparisonReviewManager;
    
    // selection manager
    var selectionManager = new ReviewComparisonSelectionManager();
    comparisonData["selectionManager"]  = selectionManager;
    
    // comparison main table    
    var checkResultsTable = new ComparisonCheckResultsTable("comparisonMainContainer");   
    checkResultsTable.populateReviewTable();
    comparisonData["reviewTable"]  = checkResultsTable;

    // comparison detailed info table
    var checkPropertiesTable = new ComparisonCheckPropertiesTable("comparisonDetailInfo")
    comparisonData["detailedInfoTable"]  = checkPropertiesTable;      
    
    // comparisonData["reviewManager"]  = comparisonReviewManager;
    // comparisonData["reviewManager"]  = comparisonReviewManager;
}

function loadComplianceData(compliance,
    viewerOptions,
    classWiseComponents) {

    complianceReviewManager = new ComplianceReviewManager(compliance,
        viewerOptions,
        classWiseComponents,
        'complianceMainContainer',
        'complianceDetailInfo',
        undefined);

    complianceReviewManager.loadDatasource(Compliance.ViewerContainer);

    // set current view
    model.currentView = complianceReviewManager;

    // set compliance data

    // review manager
    var complianceData = model.checks["compliance"];
    complianceData["reviewManager"] = complianceReviewManager;

    // selection manager    
    var selectionManager = new ReviewComplianceSelectionManager();
    complianceData["selectionManager"]  = selectionManager;

    // compliance main table    
    var checkResultsTable = new ComplianceCheckResultsTable("complianceMainContainer");
    checkResultsTable.populateReviewTable();
    complianceData["reviewTable"]  = checkResultsTable;

    // compliance detailed info table
    var checkPropertiesTable = new ComplianceCheckPropertiesTable("complianceDetailInfo");
    complianceData["detailedInfoTable"]  = checkPropertiesTable;  


}

function setButtonsCollapsible() {   

    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }
}