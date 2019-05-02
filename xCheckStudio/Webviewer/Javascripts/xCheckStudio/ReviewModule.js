function setUserName() {
    $.ajax({
        data: { 'variable': 'name' },
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
        data: { 'variable': 'projectname' },
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
                        if (msg != 'fail') {
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

    // var sourceViewerOptions = undefined;
    // if(viewerOptions['SourceAContainerId'] !== undefined &&
    //    viewerOptions['SourceAEndPointUri'] !== undefined)
    // {
    //         sourceViewerOptions = [viewerOptions['SourceAContainerId'], viewerOptions['SourceAEndPointUri']];
    // }

    sourceAComplianceReviewManager = new ComplianceReviewManager(complianceCheckGroups,
        sourceViewerOptions,
        sourceAClassWiseComponents,
        'SourceAComplianceMainReviewCell',
        'SourceAComplianceDetailedReviewCell',
        'SourceAComplianceDetailedReviewComment');

    // populate review table
    sourceAComplianceReviewManager.populateReviewTable();

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
}

function loadComparisonData(comparisonCheckGroups, 
                            sourceAViewerOptions, 
                            sourceBViewerOptions,
                            sourceAClassWiseComponents,
                            sourceBClassWiseComponents)
{
    // var sourceAViewerOptions = undefined;
    // var sourceAClasswiseData = undefined;
    // if(viewerOptions['SourceAContainerId'] !== undefined &&
    //    viewerOptions['SourceAEndPointUri'] !== undefined)
    // {
    //     sourceAViewerOptions = [viewerOptions['SourceAContainerId'], viewerOptions['SourceAEndPointUri']];
    // }        

    // var sourceBViewerOptions = undefined;
    // var sourceBClasswiseData = undefined;
    // if(viewerOptions['SourceBContainerId'] !== undefined &&
    //     viewerOptions['SourceBEndPointUri'] !== undefined)
    // {
    //     sourceBViewerOptions = [viewerOptions['SourceBContainerId'], viewerOptions['SourceBEndPointUri']];
    // }
    

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

// function getClassWiseComponents() 
// {
//     return new Promise(function (resolve, reject) 
//     {

//          // get class wise properties for excel and other 1D datasources
//          $.ajax({
//             url: 'PHP/ClasswiseComponentsReader.php',
//             type: "POST",
//             async: true,
//             data: {'Source' : "SourceA"},
//             success: function (msg) 
//             {
//                 if(msg != 'fail')                
//                 {
//                     var sourceAClassWiseComps = JSON.parse(msg);
//                 }

            
//                 // get class wise properties for excel and other 1D datasources
//                 $.ajax({
//                     url: 'PHP/ClasswiseComponentsReader.php',
//                     type: "POST",
//                     async: true,
//                     data: {'Source' : "SourceB"},
//                     success: function (msg1) 
//                     {
//                         if(msg1 != 'fail')                
//                         {
//                             var sourceBClassWiseComps = JSON.parse(msg1);
//                         }


//                         return resolve(true);
//                     }
//                 });

//             }//,
//             // error: function () 
//             // {
//             //     return resolve(true);
//             // }
//         });
//     });
// }