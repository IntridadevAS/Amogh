// var comparisonCheckGroups = undefined;
var comparisons;
var sourceAComplianceCheckGroups = undefined;
var sourceBComplianceCheckGroups = undefined;
var sourceAComparisonHierarchy = undefined;
var sourceBComparisonHierarchy = undefined;
var sourceAComplianceHierarchy = undefined;
var sourceBComplianceHierarchy = undefined;

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
                else if (key == 'SourceACompliance') {
                    sourceAComplianceCheckGroups = new CheckGroups();
                    sourceAComplianceCheckGroups.restore(checkResults[key], true);

                    model.files["a"].compliance = true;
                }
                else if (key == 'SourceBCompliance') {
                    sourceBComplianceCheckGroups = new CheckGroups();
                    sourceBComplianceCheckGroups.restore(checkResults[key], true);

                    model.files["b"].compliance = true;
                }
                else if (key == 'SourceAComparisonComponentsHierarchy') {
                    sourceAComparisonHierarchy = checkResults[key];
                }
                else if (key == 'SourceBComparisonComponentsHierarchy') {
                    sourceBComparisonHierarchy = checkResults[key];
                }
                else if (key == 'SourceAComplianceComponentsHierarchy') {
                    sourceAComplianceHierarchy = checkResults[key];
                }
                else if (key == 'SourceBComplianceComponentsHierarchy') {
                    sourceBComplianceHierarchy = checkResults[key];
                }
            }
      
            // // populate check results
            // populateCheckResults(comparisonCheckGroups,
            //     sourceAComplianceCheckGroups,
            //     sourceBComplianceCheckGroups,
            //     sourceAComparisonHierarchy,
            //     sourceBComparisonHierarchy,
            //     sourceAComplianceHierarchy,
            //     sourceBComplianceHierarchy);

            // // load analytics data
            // document.getElementById("analyticsContainer").innerHTML = '<object type="text/html" data="analyticsModule.html" style="height: 100%; width: 100%" ></object>';            
        },
        error: function (error) {
            //alert('error; ' + eval(error));
        }
    });
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
            if (/*viewerOptions['SourceAContainerId'] === undefined ||*/
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
                sourceAViewerOptions = [/*viewerOptions['SourceAContainerId'],*/ viewerOptions['SourceAEndPointUri']];
            }

            var sourceBViewerOptions = undefined;
            var sourceBClassWiseComponents = undefined;
            if (/*viewerOptions['SourceBContainerId'] === undefined ||*/
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
                sourceBViewerOptions = [/*viewerOptions['SourceBContainerId'],*/ viewerOptions['SourceBEndPointUri']];
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

            // if (comparisonCheckGroups) {
            //     openCheckResultTab('ComparisonTabPage');
            // }
            // else if (sourceAComplianceCheckGroups) {
            //     openCheckResultTab('SourceAComplianceTabPage');
            // }
            // else if (sourceBComplianceCheckGroups) {
            //     openCheckResultTab('SourceBComplianceTabPage');
            // }
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
        //"comparisonMainTable",
        "comparisonMainContainer",
        "comparisonDetailInfoContainer",
        sourceAComponentsHierarchy,
        sourceBComponentsHierarchy);

}

function setButtonsCollapsible() {
    // add event handler for collapsible rows
    // var collapsibleRows = document.getElementsByClassName("collapsible");
    // for (var i = 0; i < collapsibleRows.length; i++) {
    //     collapsibleRows[i].addEventListener("click", function () {
    //         this.classList.toggle("active");
    //         var content = this.nextElementSibling;
    //         if (content.style.display === "block") {
    //             content.style.display = "none";
    //         } else {
    //             content.style.display = "block";
    //         }
    //     });
    // }

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