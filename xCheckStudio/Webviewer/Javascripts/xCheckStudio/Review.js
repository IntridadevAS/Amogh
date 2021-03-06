var checkResults;
var comparisons;
var compliances;
var sourceAComparisonHierarchy = undefined;
var sourceBComparisonHierarchy = undefined;
var sourceCComparisonHierarchy = undefined;
var sourceDComparisonHierarchy = undefined;


var comparisonReviewManager;
var complianceReviewManager;

function initReviewModule() {
    return new Promise((resolve) => {

        loadCheckSpaceInReviewPage().then(function (result) {
            if (!result) {
                return resolve(false);
            }
            checkResults = result.Data;
            processCheckResults();

            // load comments in comment callout
            if ("checkspaceComments" in checkResults &&
                checkResults["checkspaceComments"].length > 0) {
                for (var i = 0; i < checkResults["checkspaceComments"].length; i++) {                  
                    let commentData = xCheckStudio.Util.tryJsonParse(checkResults["checkspaceComments"][i]);

                    commentsCallout.ShowComment(commentData);
                }
            }

            // markup views, annotations and bookmarks
            if (checkResults.reviewTagsAndViews) {
                let tagsAndViews = xCheckStudio.Util.tryJsonParse(checkResults.reviewTagsAndViews);
                //tags
                if (tagsAndViews.annotations) {
                    model.annotations = tagsAndViews.annotations;
                }
                model.annotations["comparison"]["a"] = {};
                model.annotations["comparison"]["b"] = {};
                model.annotations["comparison"]["c"] = {};
                model.annotations["comparison"]["d"] = {};
                model.annotations["compliance"]["a"] = {};
                model.annotations["compliance"]["b"] = {};
                model.annotations["compliance"]["c"] = {};
                model.annotations["compliance"]["d"] = {};

                //bookmarks
                if (tagsAndViews.bookmarks) {
                    model.bookmarks = tagsAndViews.bookmarks;
                }
                model.bookmarks["comparison"]["a"] = {};
                model.bookmarks["comparison"]["b"] = {};
                model.bookmarks["comparison"]["c"] = {};
                model.bookmarks["comparison"]["d"] = {};
                model.bookmarks["compliance"]["a"] = {};
                model.bookmarks["compliance"]["b"] = {};
                model.bookmarks["compliance"]["c"] = {};
                model.bookmarks["compliance"]["d"] = {};

                //markupviews
                if (tagsAndViews.markupViews) {
                    model.markupViews = tagsAndViews.markupViews;
                }
                model.markupViews["comparison"]["a"] = {};
                model.markupViews["comparison"]["b"] = {};
                model.markupViews["comparison"]["c"] = {};
                model.markupViews["comparison"]["d"] = {};
                model.markupViews["compliance"]["a"] = {};
                model.markupViews["compliance"]["b"] = {};
                model.markupViews["compliance"]["c"] = {};
                model.markupViews["compliance"]["d"] = {};
            }
            return resolve(true);
        });
    });
}

function processCheckResults() {
    // initialize the check data
    model.files = {};
    if ("sourceInfo" in checkResults) {
        var sourceInfo = checkResults["sourceInfo"];

        // 1st source
        if ("sourceAFileName" in sourceInfo &&
            sourceInfo["sourceAFileName"]) {
            var file = {};
            file["id"] = "a";
            file["fileName"] = sourceInfo["sourceAFileName"];
            file["compliance"] = false;
            file["sourceType"] = sourceInfo["sourceAType"];

            model.files[file.id] = file;
        }

        // 2nd source
        if ("sourceBFileName" in sourceInfo &&
            sourceInfo["sourceBFileName"]) {
            var file = {};
            file["id"] = "b";
            file["fileName"] = sourceInfo["sourceBFileName"];
            file["compliance"] = false;
            file["sourceType"] = sourceInfo["sourceBType"];

            model.files[file.id] = file;
        }

        // 3rd source
        if ("sourceCFileName" in sourceInfo &&
            sourceInfo["sourceCFileName"]) {
            var file = {};
            file["id"] = "c";
            file["fileName"] = sourceInfo["sourceCFileName"];
            file["compliance"] = false;
            file["sourceType"] = sourceInfo["sourceCType"];

            model.files[file.id] = file;
        }

        // 4th source
        if ("sourceDFileName" in sourceInfo &&
            sourceInfo["sourceDFileName"]) {
            var file = {};
            file["id"] = "d";
            file["fileName"] = sourceInfo["sourceDFileName"];
            file["compliance"] = false;
            file["sourceType"] = sourceInfo["sourceDType"];

            model.files[file.id] = file;
        }
    }

    for (var key in checkResults) {
        if (!checkResults.hasOwnProperty(key)) {
            continue;
        }

        if (key == 'Comparisons') {
            comparisons = checkResults[key];
        }
        else if (key == 'Compliances') {
            compliances = checkResults[key];

            // set compliance true/false for sources
            for (var i = 0; i < compliances.length; i++) {
                var compliance = compliances[i];

                for (var sourceId in model.files) {
                    var file = model.files[sourceId];
                    if (file.fileName === compliance.source) {
                        file["compliance"] = true;
                    }
                }
            }
        }
        else if (key == 'SourceAComparisonComponentsHierarchy') {
            sourceAComparisonHierarchy = checkResults[key];
        }
        else if (key == 'SourceBComparisonComponentsHierarchy') {
            sourceBComparisonHierarchy = checkResults[key];
        }
        else if (key == 'SourceCComparisonComponentsHierarchy') {
            sourceCComparisonHierarchy = checkResults[key];
        }
        else if (key == 'SourceDComparisonComponentsHierarchy') {
            sourceDComparisonHierarchy = checkResults[key];
        }
    }
}

function populateCheckResults(comparison,
    compliance,
    sourceAComponentsHierarchy,
    sourceBComponentsHierarchy,
    sourceCComponentsHierarchy,
    sourceDComponentsHierarchy,
    dataSourceId) {
    if (!comparison &&
        !compliance) {
        return;
    }

    // show busy indicator
    showBusyIndicator();

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
            var viewerOptions = xCheckStudio.Util.tryJsonParse(msg);
           
            var classWiseComponents = {};
            if (viewerOptions['a']['endPointUri'] === undefined) {

                // get class wise properties for excel and other 1D datasources               
                $.ajax({
                    url: 'PHP/ClasswiseComponentsReader.php',
                    type: "POST",
                    async: false,
                    data: {
                        'Source': "SourceA",
                        'ProjectName': projectinfo.projectname,
                        'CheckName': checkinfo.checkname
                    },
                    success: function (msg) {
                        if (msg != 'fail') {
                            classWiseComponents['a'] = sourceAClassWiseComponents = xCheckStudio.Util.tryJsonParse(msg);
                        }
                    }
                });
            }

            if (viewerOptions['b']['endPointUri'] === undefined) {
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
                            classWiseComponents['b'] = xCheckStudio.Util.tryJsonParse(msg);
                        }
                    }
                });
            }

            if (('c' in viewerOptions) && viewerOptions['c']['endPointUri'] === undefined) {
                // this ajax call is synchronous

                // get class wise properties for excel and other 1D datasources
                $.ajax({
                    url: 'PHP/ClasswiseComponentsReader.php',
                    type: "POST",
                    async: false,
                    data: {
                        'Source': "SourceC",
                        'ProjectName': projectinfo.projectname,
                        'CheckName': checkinfo.checkname
                    },
                    success: function (msg) {
                        if (msg != 'fail' && msg != "") {
                            classWiseComponents['c'] = xCheckStudio.Util.tryJsonParse(msg);
                        }
                    }
                });
            }

            if (('d' in viewerOptions) && viewerOptions['d']['endPointUri'] === undefined) {
                // this ajax call is synchronous

                // get class wise properties for excel and other 1D datasources
                $.ajax({
                    url: 'PHP/ClasswiseComponentsReader.php',
                    type: "POST",
                    async: false,
                    data: {
                        'Source': "SourceD",
                        'ProjectName': projectinfo.projectname,
                        'CheckName': checkinfo.checkname
                    },
                    success: function (msg) {
                        if (msg != 'fail' && msg != "") {
                            classWiseComponents['d'] = xCheckStudio.Util.tryJsonParse(msg);
                        }
                    }
                });
            }

            if (comparison) {
                loadComparisonData(comparison,
                    viewerOptions['a'],
                    viewerOptions['b'],
                    viewerOptions['c'],
                    viewerOptions['d'],
                    classWiseComponents['a'],
                    classWiseComponents['b'],
                    classWiseComponents['c'],
                    classWiseComponents['d'],
                    sourceAComponentsHierarchy,
                    sourceBComponentsHierarchy,
                    sourceCComponentsHierarchy,
                    sourceDComponentsHierarchy);
            }

            if (compliance) {

                for (var source in viewerOptions) {
                    var viewerOption = viewerOptions[source];
                    if (viewerOption.source === compliance.source) {
                        loadComplianceData(compliance,
                            viewerOption,
                            classWiseComponents[source],
                            dataSourceId);

                        break;
                    }
                }

            }

            // hide busy indicator
            hideBusyIndicator();
        }
    });
}

function loadComparisonData(comparisonCheckGroups,
    sourceAViewerOptions,
    sourceBViewerOptions,
    sourceCViewerOptions,
    sourceDViewerOptions,
    sourceAClassWiseComponents,
    sourceBClassWiseComponents,
    sourceCClassWiseComponents,
    sourceDClassWiseComponents,
    sourceAComponentsHierarchy,
    sourceBComponentsHierarchy,
    sourceCComponentsHierarchy,
    sourceDComponentsHierarchy) {

    // make viewers enable
    enableViewers(comparisonCheckGroups.sources);

    comparisonReviewManager = new ComparisonReviewManager(comparisonCheckGroups,
        sourceAViewerOptions,
        sourceBViewerOptions,
        sourceCViewerOptions,
        sourceDViewerOptions,
        sourceAClassWiseComponents,
        sourceBClassWiseComponents,
        sourceCClassWiseComponents,
        sourceDClassWiseComponents,
        Comparison.MainReviewContainer,
        Comparison.DetailInfoContainer,
        sourceAComponentsHierarchy,
        sourceBComponentsHierarchy,
        sourceCComponentsHierarchy,
        sourceDComponentsHierarchy);

    comparisonReviewManager.loadDatasources();

    // set current view
    model.currentView = comparisonReviewManager;

    // set comparison data

    // review manager
    var comparisonData = model.checks["comparison"];
    comparisonData["reviewManager"] = comparisonReviewManager;

    // selection manager
    var selectionManager = new ReviewComparisonSelectionManager();
    comparisonData["selectionManager"] = selectionManager;

    // comparison main table    
    var checkResultsTable = new ComparisonCheckResultsTable(Comparison.MainReviewContainer);
    checkResultsTable.populateReviewTable();
    comparisonData["reviewTable"] = checkResultsTable;

    // comparison detailed info table
    var checkPropertiesTable = new ComparisonCheckPropertiesTable(Comparison.DetailInfoContainer)
    comparisonData["detailedInfoTable"] = checkPropertiesTable;

    //Save ComponentId Vs ComponentData
    var componentIdVsComponentData = this.GetComponentIdVsComponentData(checkResults.sourceAComponents);
    comparisonData["SourceAcomponentIdVsComponentData"] = componentIdVsComponentData;

    var componentIdVsComponentData = this.GetComponentIdVsComponentData(checkResults.sourceBComponents);
    comparisonData["SourceBcomponentIdVsComponentData"] = componentIdVsComponentData;

    if (checkResults.sourceCComponents) {
        var componentIdVsComponentData = this.GetComponentIdVsComponentData(checkResults.sourceCComponents);
        comparisonData["SourceCcomponentIdVsComponentData"] = componentIdVsComponentData;
    }

    if (checkResults.sourceDComponents) {
        var componentIdVsComponentData = this.GetComponentIdVsComponentData(checkResults.sourceDComponents);
        comparisonData["SourceDcomponentIdVsComponentData"] = componentIdVsComponentData;
    }

    // property callout
    var propertyCallout = new PropertyCallout("comparison");
    propertyCallout.Init();
    comparisonData["PropertyCallout"] = propertyCallout;

    // Menus
    menus = comparisonData["menus"];
    if (comparisonData["sourceAViewer"] &&
        comparisonData["sourceAViewer"].Is3DViewer()) {
        var id = "comparison";
        var viewerId = "a";
        var menusA = menus[viewerId];
        menusA["DisplayMenu"] = new DisplayMenu(id, viewerId, viewerId);
        menusA["MarkupMenu"] = new MarkupMenu(id, viewerId, viewerId);
        menusA["BookmarkMenu"] = new BookmarkMenu(id, viewerId, viewerId);
        menusA["TagsMenu"] = new TagsMenu(id, viewerId, viewerId);
        menusA["ModelViewsMenu"] = new ModelViewsMenu(id, viewerId, viewerId);

        menusA["ShapesMenu"] = new ShapesMenu(id, viewerId, viewerId);
        menusA["DisplayStylesMenu"] = new DisplayStylesMenu(id, viewerId, viewerId);
        menusA["SectioningMenu"] = new SectioningMenu(id, viewerId, viewerId);
        menusA["MeasureMenu"] = new MeasureMenu(id, viewerId, viewerId);
    }
    if (comparisonData["sourceBViewer"] &&
        comparisonData["sourceBViewer"].Is3DViewer()) {
        var id = "comparison";
        var viewerId = "b";
        var menusB = menus[viewerId];
        menusB['DisplayMenu'] = new DisplayMenu(id, viewerId, viewerId);
        menusB["MarkupMenu"] = new MarkupMenu(id, viewerId, viewerId);
        menusB["BookmarkMenu"] = new BookmarkMenu(id, viewerId, viewerId);
        menusB["TagsMenu"] = new TagsMenu(id, viewerId, viewerId);
        menusB["ModelViewsMenu"] = new ModelViewsMenu(id, viewerId, viewerId);

        menusB["ShapesMenu"] = new ShapesMenu(id, viewerId, viewerId);
        menusB["DisplayStylesMenu"] = new DisplayStylesMenu(id, viewerId, viewerId);
        menusB["SectioningMenu"] = new SectioningMenu(id, viewerId, viewerId);
        menusB["MeasureMenu"] = new MeasureMenu(id, viewerId, viewerId);
    }
    if (comparisonData["sourceCViewer"] &&
        comparisonData["sourceCViewer"].Is3DViewer()) {
        var id = "comparison";
        var viewerId = "c";
        var menusC = menus[viewerId];
        menusC['DisplayMenu'] = new DisplayMenu(id, viewerId, viewerId);
        menusC["MarkupMenu"] = new MarkupMenu(id, viewerId, viewerId);
        menusC["BookmarkMenu"] = new BookmarkMenu(id, viewerId, viewerId);
        menusC["TagsMenu"] = new TagsMenu(id, viewerId, viewerId);
        menusC["ModelViewsMenu"] = new ModelViewsMenu(id, viewerId, viewerId);

        menusC["ShapesMenu"] = new ShapesMenu(id, viewerId, viewerId);
        menusC["DisplayStylesMenu"] = new DisplayStylesMenu(id, viewerId, viewerId);
        menusC["SectioningMenu"] = new SectioningMenu(id, viewerId, viewerId);
        menusC["MeasureMenu"] = new MeasureMenu(id, viewerId, viewerId);
    }
    if (comparisonData["sourceDViewer"] &&
        comparisonData["sourceDViewer"].Is3DViewer()) {
        var id = "comparison";
        var viewerId = "d";
        var menusD = menus[viewerId];
        menusD['DisplayMenu'] = new DisplayMenu(id, viewerId, viewerId);
        menusD["MarkupMenu"] = new MarkupMenu(id, viewerId, viewerId);
        menusD["BookmarkMenu"] = new BookmarkMenu(id, viewerId, viewerId);
        menusD["TagsMenu"] = new TagsMenu(id, viewerId, viewerId);
        menusD["ModelViewsMenu"] = new ModelViewsMenu(id, viewerId, viewerId);

        menusD["ShapesMenu"] = new ShapesMenu(id, viewerId, viewerId);
        menusD["DisplayStylesMenu"] = new DisplayStylesMenu(id, viewerId, viewerId);
        menusD["SectioningMenu"] = new SectioningMenu(id, viewerId, viewerId);
        menusD["MeasureMenu"] = new MeasureMenu(id, viewerId, viewerId);
    }    
}

function GetComponentIdVsComponentData(sourceComponents) {
    var componentIdVsComponentData = {};
    for (var i = 0; i < sourceComponents.length; i++) {
        var component = sourceComponents[i];
        componentIdVsComponentData[Number(component.id)] = component;
    }

    return componentIdVsComponentData;
}

function loadComplianceData(compliance,
    viewerOptions,
    classWiseComponents,
    dataSourceId) {

    complianceReviewManager = new ComplianceReviewManager(compliance,
        viewerOptions,
        classWiseComponents,
        Compliance.MainReviewContainer,
        Compliance.DetailInfoContainer,
        undefined,
        dataSourceId);

    complianceReviewManager.loadDatasource(Compliance.ViewerContainer);

    // set current view
    model.currentView = complianceReviewManager;

    // set compliance data

    // review manager
    var complianceData = model.checks["compliance"];
    complianceData["dataSourceId"] = dataSourceId;
    complianceData["reviewManager"] = complianceReviewManager;

    // selection manager    
    var selectionManager = new ReviewComplianceSelectionManager();
    complianceData["selectionManager"] = selectionManager;

    // compliance main table    
    var checkResultsTable = new ComplianceCheckResultsTable(Compliance.MainReviewContainer);
    checkResultsTable.populateReviewTable();
    complianceData["reviewTable"] = checkResultsTable;

    // compliance detailed info table
    var checkPropertiesTable = new ComplianceCheckPropertiesTable(Compliance.DetailInfoContainer);
    complianceData["detailedInfoTable"] = checkPropertiesTable;

    // save componentId vs ComponentData 
    var componentIdVsComponentData;
    if (model.selectedCompliance.id == "a") {
        componentIdVsComponentData = this.GetComponentIdVsComponentData(checkResults.sourceAComponents);
    }
    else if (model.selectedCompliance.id == "b") {
        componentIdVsComponentData = this.GetComponentIdVsComponentData(checkResults.sourceBComponents);
    }
    else if (model.selectedCompliance.id == "c") {
        componentIdVsComponentData = this.GetComponentIdVsComponentData(checkResults.sourceCComponents);
    }
    else if (model.selectedCompliance.id == "d") {
        componentIdVsComponentData = this.GetComponentIdVsComponentData(checkResults.sourceDComponents);
    }

    complianceData["ComponentIdVsComponentData"] = componentIdVsComponentData;

    // property callout
    var propertyCallout = new PropertyCallout("compliance");
    propertyCallout.Init();
    complianceData["PropertyCallout"] = propertyCallout;

    // Menus    
    if (("viewer" in complianceData) &&
         complianceData["viewer"].Is3DViewer()) {

        var id = "compliance";
        // var viewerId = null;
        // for (var srcId in model.files) {
        //     if (model.files[srcId].fileName === viewerOptions.source) {
        //         viewerId = srcId;
        //         break;
        //     }
        // }
        if (dataSourceId) {
            var menus = complianceData["menus"]["a"];
            menus['DisplayMenu'] = new DisplayMenu(id, dataSourceId, "a");
            menus["MarkupMenu"] = new MarkupMenu(id, dataSourceId, "a");
            menus["BookmarkMenu"] = new BookmarkMenu(id, dataSourceId, "a");
            menus["TagsMenu"] = new TagsMenu(id, dataSourceId, "a");
            menus["ModelViewsMenu"] = new ModelViewsMenu(id, dataSourceId, "a");

            menus["ShapesMenu"] = new ShapesMenu(id, dataSourceId, "a");
            menus["DisplayStylesMenu"] = new DisplayStylesMenu(id, dataSourceId, "a");
            menus["SectioningMenu"] = new SectioningMenu(id, dataSourceId, "a");
            menus["MeasureMenu"] = new MeasureMenu(id, dataSourceId, "a");
        }
    }
}

function getDataSourceFiles() {
    for (var key in checkResults) {
        if (!checkResults.hasOwnProperty(key)) {
            continue;
        }
        if (key == 'sourceInfo') {
            return checkResults["sourceInfo"];
        }
    }
}

function populateComparisonModelBrowser(comparison) {

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
            var viewerOptions = xCheckStudio.Util.tryJsonParse(msg);

            // make viewers enable
            enableViewers(comparison.sources);

            // create accordion
            createModelBrowserAccordion(comparison.sources, Comparison.MainReviewContainer);

            let projectInfo = xCheckStudio.Util.getProjectInfo();
            let checkspaceInfo = xCheckStudio.Util.getCheckspaceInfo();
            let checkspacePath = "../Projects/" + projectInfo.projectname + "/CheckSpaces/" + checkspaceInfo.checkname;

            for (var i = 0; i < comparison.sources.length; i++) {

                if (i === 0 && checkResults.sourceInfo.sourceAFileName === comparison.sources[i]) {
                    var source = checkResults.sourceInfo.sourceAFileName;                    

                    if (viewerOptions['a']['endPointUri'] !== undefined) {
                        
                        // viewer options
                        let pathToDataset = checkspacePath + "/SourceA/" + viewerOptions['a']["endPointUri"];
                        let options = ["compare1", pathToDataset];

                        if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(viewerOptions['a']["source"]))) {
                            // model browser
                            var modelBrowser = new ReviewComparison3DModelBrowser("a", source, comparison);
                            modelBrowser.AddModelBrowser(checkResults.SourceAComparisonComponentsHierarchy);

                            // viewer                           
                            var viewerInterface = new ModelBrowser3DViewer("a", source, options);
                            viewerInterface.setupViewer(550, 280);
                          
                            // selection manager
                            var selectionManager = new ReviewModelBrowserSelectionManager();

                            var browserComponents = {};
                            browserComponents["browser"] = modelBrowser;
                            browserComponents["viewer"] = viewerInterface;
                            browserComponents["selectionManager"] = selectionManager;

                            var comparisonData = model.checks["comparison"];
                            comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceAFileName] = browserComponents;
                        }
                        else if (xCheckStudio.Util.isSourceVisio(xCheckStudio.Util.getFileExtension(viewerOptions['a']["source"]))) {
                            // model browser
                            var modelBrowser = new ReviewComparisonVisioModelBrowser("a", source, comparison);
                            modelBrowser.AddModelBrowser(checkResults.SourceAComparisonComponentsHierarchy);

                            // viewer                          
                            var viewerInterface = new ModelBrowserVisioViewer("a", source, options);
                            viewerInterface.setupViewer(false);

                            // selection manager
                            var selectionManager = new ReviewModelBrowserSelectionManager();

                            var browserComponents = {};
                            browserComponents["browser"] = modelBrowser;
                            browserComponents["viewer"] = viewerInterface;
                            browserComponents["selectionManager"] = selectionManager;
                        
                            var comparisonData = model.checks["comparison"];
                            comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceAFileName] = browserComponents;
                        }
                    }
                    else {
                        // get class wise properties for excel and other 1D datasources               
                        $.ajax({
                            url: 'PHP/ClasswiseComponentsReader.php',
                            type: "POST",
                            async: false,
                            data: {
                                'Source': "SourceA",
                                'ProjectName': projectinfo.projectname,
                                'CheckName': checkinfo.checkname
                            },
                            success: function (msg) {
                                if (msg != 'fail') {
                                    var sourceAClassWiseComponents = xCheckStudio.Util.tryJsonParse(msg);

                                    // model browser
                                    var modelBrowser = new ReviewComparison1DModelBrowser("a", source, comparison);
                                    modelBrowser.AddModelBrowser(checkResults.SourceAComparisonComponentsHierarchy);

                                    var comparisonData = model.checks["comparison"];

                                    // viewer
                                    var viewerInterface = new ModelBrowser1DViewer("a", source, sourceAClassWiseComponents, "compare1");
                                    // comparisonData["sourceAViewer"] = viewerInterface;     

                                    // selection manager
                                    var selectionManager = new ReviewModelBrowserSelectionManager();

                                    var browserComponents = {};
                                    browserComponents["browser"] = modelBrowser;
                                    browserComponents["viewer"] = viewerInterface;
                                    browserComponents["selectionManager"] = selectionManager;

                                    var comparisonData = model.checks["comparison"];
                                    comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceAFileName] = browserComponents;
                                }
                            }
                        });
                    }
                }
                else if (i === 1 && checkResults.sourceInfo.sourceBFileName === comparison.sources[i]) {
                    var source = checkResults.sourceInfo.sourceBFileName;

                    if (viewerOptions['b']['endPointUri'] !== undefined) {
                        
                        // viewer options
                        let pathToDataset = checkspacePath + "/SourceB/" + viewerOptions['b']["endPointUri"];
                        let options = ["compare2", pathToDataset];

                        if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(viewerOptions['b']["source"]))) {
                            // model browser
                            var modelBrowser = new ReviewComparison3DModelBrowser("b", source, comparison);
                            modelBrowser.AddModelBrowser(checkResults.SourceBComparisonComponentsHierarchy);

                            // viewer                           
                            var viewerInterface = new ModelBrowser3DViewer("b", source, options);
                            viewerInterface.setupViewer(550, 280);

                            // selection manager
                            var selectionManager = new ReviewModelBrowserSelectionManager();

                            var browserComponents = {};
                            browserComponents["browser"] = modelBrowser;
                            browserComponents["viewer"] = viewerInterface;
                            browserComponents["selectionManager"] = selectionManager;

                            var comparisonData = model.checks["comparison"];
                            comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceBFileName] = browserComponents;
                        }
                        else if (xCheckStudio.Util.isSourceVisio(xCheckStudio.Util.getFileExtension(viewerOptions['b']["source"]))) {
                            // model browser
                            var modelBrowser = new ReviewComparisonVisioModelBrowser("b", source, comparison);
                            modelBrowser.AddModelBrowser(checkResults.SourceBComparisonComponentsHierarchy);

                            // viewer                           
                            var viewerInterface = new ModelBrowserVisioViewer("b", source, options);
                            viewerInterface.setupViewer(false);

                            // selection manager
                            var selectionManager = new ReviewModelBrowserSelectionManager();

                            var browserComponents = {};
                            browserComponents["browser"] = modelBrowser;
                            browserComponents["viewer"] = viewerInterface;
                            browserComponents["selectionManager"] = selectionManager;

                            var comparisonData = model.checks["comparison"];
                            comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceBFileName] = browserComponents;
                        }
                    }
                    else {
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
                                if (msg != 'fail') {
                                    var sourceBClassWiseComponents = xCheckStudio.Util.tryJsonParse(msg);

                                    // model browser
                                    var modelBrowser = new ReviewComparison1DModelBrowser("b", source, comparison);
                                    modelBrowser.AddModelBrowser(checkResults.SourceBComparisonComponentsHierarchy);

                                    // viewer
                                    var viewerInterface = new ModelBrowser1DViewer("b", source, sourceBClassWiseComponents, "compare2");

                                    // selection manager
                                    var selectionManager = new ReviewModelBrowserSelectionManager();

                                    var browserComponents = {};
                                    browserComponents["browser"] = modelBrowser;
                                    browserComponents["viewer"] = viewerInterface;
                                    browserComponents["selectionManager"] = selectionManager;

                                    var comparisonData = model.checks["comparison"];
                                    comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceBFileName] = browserComponents;
                                }
                            }
                        });
                    }
                }
                else if (i === 2 && checkResults.sourceInfo.sourceCFileName === comparison.sources[i]) {
                    var source = checkResults.sourceInfo.sourceCFileName;

                    if (viewerOptions['c']['endPointUri'] !== undefined) {
                        
                        // viewer options
                        let pathToDataset = checkspacePath + "/SourceC/" + viewerOptions['c']["endPointUri"];
                        let options = ["compare3", pathToDataset];

                        if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(viewerOptions['c']["source"]))) {
                            // model browser
                            var modelBrowser = new ReviewComparison3DModelBrowser("c", source, comparison);
                            modelBrowser.AddModelBrowser(checkResults.SourceCComparisonComponentsHierarchy);

                            // viewer                            
                            var viewerInterface = new ModelBrowser3DViewer("c", source, options);
                            viewerInterface.setupViewer(550, 280);

                            // selection manager
                            var selectionManager = new ReviewModelBrowserSelectionManager();

                            var browserComponents = {};
                            browserComponents["browser"] = modelBrowser;
                            browserComponents["viewer"] = viewerInterface;
                            browserComponents["selectionManager"] = selectionManager;

                            var comparisonData = model.checks["comparison"];
                            comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceCFileName] = browserComponents;
                        }
                        else if (xCheckStudio.Util.isSourceVisio(xCheckStudio.Util.getFileExtension(viewerOptions['c']["source"]))) {
                            // model browser
                            var modelBrowser = new ReviewComparisonVisioModelBrowser("c", source, comparison);
                            modelBrowser.AddModelBrowser(checkResults.SourceCComparisonComponentsHierarchy);

                            // viewer                          
                            var viewerInterface = new ModelBrowserVisioViewer("c", source, options);
                            viewerInterface.setupViewer(false);

                            // selection manager
                            var selectionManager = new ReviewModelBrowserSelectionManager();

                            var browserComponents = {};
                            browserComponents["browser"] = modelBrowser;
                            browserComponents["viewer"] = viewerInterface;
                            browserComponents["selectionManager"] = selectionManager;

                            var comparisonData = model.checks["comparison"];
                            comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceCFileName] = browserComponents;
                        }
                    }
                    else {
                        // get class wise properties for excel and other 1D datasources               
                        $.ajax({
                            url: 'PHP/ClasswiseComponentsReader.php',
                            type: "POST",
                            async: false,
                            data: {
                                'Source': "SourceC",
                                'ProjectName': projectinfo.projectname,
                                'CheckName': checkinfo.checkname
                            },
                            success: function (msg) {
                                if (msg != 'fail') {
                                    var sourceCClassWiseComponents = xCheckStudio.Util.tryJsonParse(msg);

                                    // model browser
                                    var modelBrowser = new ReviewComparison1DModelBrowser("c", source, comparison);
                                    modelBrowser.AddModelBrowser(checkResults.SourceCComparisonComponentsHierarchy);

                                    // viewer
                                    var viewerInterface = new ModelBrowser1DViewer("c", source, sourceCClassWiseComponents, "compare3");

                                    // selection manager
                                    var selectionManager = new ReviewModelBrowserSelectionManager();

                                    var browserComponents = {};
                                    browserComponents["browser"] = modelBrowser;
                                    browserComponents["viewer"] = viewerInterface;
                                    browserComponents["selectionManager"] = selectionManager;

                                    var comparisonData = model.checks["comparison"];
                                    comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceCFileName] = browserComponents;
                                }
                            }
                        });
                    }
                }
                else if (i === 3 && checkResults.sourceInfo.sourceDFileName === comparison.sources[i]) {
                    var source = checkResults.sourceInfo.sourceDFileName;

                    if (viewerOptions['d']['endPointUri'] !== undefined) {

                        // viewer options
                        let pathToDataset = checkspacePath + "/SourceD/" + viewerOptions['d']["endPointUri"];
                        let options = ["compare4", pathToDataset];

                        if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(viewerOptions['d']["source"]))) {
                            // model browser
                            var modelBrowser = new ReviewComparison3DModelBrowser("d", source, comparison);
                            modelBrowser.AddModelBrowser(checkResults.SourceDComparisonComponentsHierarchy);

                            // viewer                           
                            var viewerInterface = new ModelBrowser3DViewer("d", source, options);
                            viewerInterface.setupViewer(550, 280);

                            // selection manager
                            var selectionManager = new ReviewModelBrowserSelectionManager();

                            var browserComponents = {};
                            browserComponents["browser"] = modelBrowser;
                            browserComponents["viewer"] = viewerInterface;
                            browserComponents["selectionManager"] = selectionManager;

                            var comparisonData = model.checks["comparison"];
                            comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceDFileName] = browserComponents;
                        }
                        else if (xCheckStudio.Util.isSourceVisio(xCheckStudio.Util.getFileExtension(viewerOptions['d']["source"]))) {
                            // model browser
                            var modelBrowser = new ReviewComparisonVisioModelBrowser("d", source, comparison);
                            modelBrowser.AddModelBrowser(checkResults.SourceDComparisonComponentsHierarchy);

                            // viewer                           
                            var viewerInterface = new ModelBrowserVisioViewer("d", source, options);
                            viewerInterface.setupViewer(false);

                            // selection manager
                            var selectionManager = new ReviewModelBrowserSelectionManager();

                            var browserComponents = {};
                            browserComponents["browser"] = modelBrowser;
                            browserComponents["viewer"] = viewerInterface;
                            browserComponents["selectionManager"] = selectionManager;

                            var comparisonData = model.checks["comparison"];
                            comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceDFileName] = browserComponents;
                        }
                    }
                    else {
                        // get class wise properties for excel and other 1D datasources               
                        $.ajax({
                            url: 'PHP/ClasswiseComponentsReader.php',
                            type: "POST",
                            async: false,
                            data: {
                                'Source': "SourceD",
                                'ProjectName': projectinfo.projectname,
                                'CheckName': checkinfo.checkname
                            },
                            success: function (msg) {
                                if (msg != 'fail') {
                                    var sourceDClassWiseComponents = xCheckStudio.Util.tryJsonParse(msg);

                                    // model browser
                                    var modelBrowser = new ReviewComparison1DModelBrowser("d", source, comparison);
                                    modelBrowser.AddModelBrowser(checkResults.SourceDComparisonComponentsHierarchy);

                                    // viewer
                                    var viewerInterface = new ModelBrowser1DViewer("d", source, sourceDClassWiseComponents, "compare4");

                                    // selection manager
                                    var selectionManager = new ReviewModelBrowserSelectionManager();

                                    var browserComponents = {};
                                    browserComponents["browser"] = modelBrowser;
                                    browserComponents["viewer"] = viewerInterface;
                                    browserComponents["selectionManager"] = selectionManager;

                                    var comparisonData = model.checks["comparison"];
                                    comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceDFileName] = browserComponents;
                                }
                            }
                        });
                    }
                }
            }
        }
    });
}

function populateComplianceModelBrowser(compliance) {

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
            var viewerOptions = xCheckStudio.Util.tryJsonParse(msg);

            if (model.selectedCompliance.id in viewerOptions) {
                var viewerOption = viewerOptions[model.selectedCompliance.id];
                if (viewerOption.source !== compliance.source) {
                    return;
                }

                // create accordion
                createModelBrowserAccordion([compliance.source], Compliance.MainReviewContainer, model.selectedCompliance.id);
              
                if (viewerOption['endPointUri'] !== undefined) {
                    let projectInfo = xCheckStudio.Util.getProjectInfo();
                    let checkspaceInfo = xCheckStudio.Util.getCheckspaceInfo();
                    let checkspacePath = "../Projects/" + projectInfo.projectname + "/CheckSpaces/" + checkspaceInfo.checkname;

                    let pathToDataset = checkspacePath;
                    if (model.selectedCompliance.id === "a") {
                        pathToDataset  += "/SourceA/";
                    }
                    else if (model.selectedCompliance.id === "b") {
                        pathToDataset  += "/SourceB/";
                    }
                    else if (model.selectedCompliance.id === "c") {
                        pathToDataset  += "/SourceC/";
                    }
                    else if (model.selectedCompliance.id === "d") {
                        pathToDataset  += "/SourceD/";
                    }
                    else {
                        return;
                    }
                    pathToDataset += viewerOption["endPointUri"];
                    var options = [Compliance.ViewerContainer, pathToDataset];

                    if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(viewerOption["source"]))) {

                        // model browser
                        var modelBrowser = new ReviewCompliance3DModelBrowser(model.selectedCompliance.id, compliance.source, compliance);
                        modelBrowser.AddModelBrowser(compliance.ComponentsHierarchy);

                        // viewer                        
                        var viewerInterface = new ModelBrowser3DViewer(model.selectedCompliance.id, compliance.source, options);
                        viewerInterface.setupViewer(550, 280);

                        // selection manager
                        var selectionManager = new ReviewModelBrowserSelectionManager();

                        var browserComponents = {};
                        browserComponents["browser"] = modelBrowser;
                        browserComponents["viewer"] = viewerInterface;
                        browserComponents["selectionManager"] = selectionManager;

                        var complianceData = model.checks["compliance"];
                        complianceData["modelBrowsers"][compliance.source] = browserComponents;
                    }
                    else if (xCheckStudio.Util.isSourceVisio(xCheckStudio.Util.getFileExtension(viewerOption["source"]))) {
                        // model browser
                        var modelBrowser = new ReviewComplianceVisioModelBrowser(model.selectedCompliance.id, compliance.source, compliance);
                        modelBrowser.AddModelBrowser(compliance.ComponentsHierarchy);

                         // viewer                        
                         var viewerInterface = new ModelBrowserVisioViewer(model.selectedCompliance.id, compliance.source, options);
                         viewerInterface.setupViewer(true);
 
                         // selection manager
                         var selectionManager = new ReviewModelBrowserSelectionManager();
 
                         var browserComponents = {};
                         browserComponents["browser"] = modelBrowser;
                         browserComponents["viewer"] = viewerInterface;
                         browserComponents["selectionManager"] = selectionManager;
 
                         var complianceData = model.checks["compliance"];
                         complianceData["modelBrowsers"][compliance.source] = browserComponents;
                    }
                }
                else {

                    var source;
                    if (model.selectedCompliance.id === "a") {
                        source = "SourceA";
                    }
                    else if (model.selectedCompliance.id === "b") {
                        source = "SourceB";
                    }
                    else if (model.selectedCompliance.id === "c") {
                        source = "SourceC";
                    }
                    else if (model.selectedCompliance.id === "d") {
                        source = "SourceD";
                    }
                    else {
                        return;
                    }

                    // get class wise properties for excel and other 1D datasources               
                    $.ajax({
                        url: 'PHP/ClasswiseComponentsReader.php',
                        type: "POST",
                        async: false,
                        data: {
                            'Source': source,
                            'ProjectName': projectinfo.projectname,
                            'CheckName': checkinfo.checkname
                        },
                        success: function (msg) {
                            if (msg != 'fail') {
                                var classWiseComponents = xCheckStudio.Util.tryJsonParse(msg);

                                // model browser
                                var modelBrowser = new ReviewCompliance1DModelBrowser(model.selectedCompliance.id, compliance.source, compliance);
                                modelBrowser.AddModelBrowser(compliance.ComponentsHierarchy);

                                // // viewer
                                var viewerInterface = new ModelBrowser1DViewer(model.selectedCompliance.id, compliance.source, classWiseComponents, Compliance.ViewerContainer);

                                // selection manager
                                var selectionManager = new ReviewModelBrowserSelectionManager();

                                var browserComponents = {};
                                browserComponents["browser"] = modelBrowser;
                                browserComponents["viewer"] = viewerInterface;
                                browserComponents["selectionManager"] = selectionManager;

                                var complianceData = model.checks["compliance"];
                                complianceData["modelBrowsers"][compliance.source] = browserComponents;
                            }
                        }
                    });
                }               
            }
        }
    });
}

function enableViewers(sources) {
    if (sources.length > 1) {
        document.getElementById("comparePanelA").style.width = "100%";
    }
    else {
        return;
    }

    if (sources.length === 2) {
        document.getElementById("comparePanelB").style.display = "block";
    }
    else if (sources.length === 3) {
        document.getElementById("comparePanelB").style.display = "block";
        document.getElementById("comparePanelC").style.display = "block";
        document.getElementById("comparePanelC").style.width = "200%";
    }
    else if (sources.length === 4) {
        document.getElementById("comparePanelB").style.display = "block";
        document.getElementById("comparePanelC").style.display = "block";        
        document.getElementById("comparePanelD").style.display = "block";

        document.getElementById("comparePanelC").style.width = "100%";
        document.getElementById("comparePanelD").style.width = "100%";
    }
}

function createModelBrowserAccordion(
    sources,
    container,
    sourceId = null
) {
    var parentTable = document.getElementById(container);

    var data = createAccordionData(sources, sourceId);
    for (var i = 0; i < data.length; i++) {
      
        var div = document.createElement("DIV");
        div.setAttribute('data-options', "dxTemplate: { name: '" + data[i]["template"] + "' }")
        div.id = data[i]["template"];
        var datagridDiv = document.createElement("DIV");

        datagridDiv.id = data[i]["template"].replace(/\W/g, '') + "_" + container;
        div.append(datagridDiv);
        parentTable.append(div);
    }

    $("#" + container).dxAccordion({
        collapsible: true,
        dataSource: data,
        deferRendering: false,
        selectedIndex: -1,
        onSelectionChanged: function (e) {

        },
        itemTitleTemplate: function (itemData, itemIndex, itemElement) {
            itemElement.append("<h1 style = 'font-size: 15px; text-align: center;color: white;'>" + itemData.title + "</h1>");
        },
    });
}

function createAccordionData(sources, sourceId) {

    let generateSrcId = true;
    if (sourceId) {
        generateSrcId = false;
    }
    var data = [];
    for (var i = 0; i < sources.length; i++) {
        var source = sources[i];

        // get source id
        if (generateSrcId === true) {
            sourceId = i === 0 ? "a" : (i === 1 ? "b" : (i === 2 ? "c" : (i === 3 ? "d" : null)));
        }

        var dataObject = {};
        dataObject["template"] = source.replace(/\W/g, '') + "_" + sourceId;
        dataObject["title"] = source;

        data.push(dataObject);
    }

    return data;
}

function expandModelBrowserAccordion(groupName, container) {

    return new Promise(function (resolve) {

        var accordion = $(container).dxAccordion("instance");

        // scroll to table
        var accordionIndex = getAccordionIndex(groupName, container)
        if (accordionIndex >= 0) {
            accordion.expandItem(Number(accordionIndex)).then(function (result) {
                return resolve(true);
            });
        }
        else {
            return resolve(true);
        }
    });
}

function getAccordionIndex(groupName, container) {
    var accordion = $(container).dxAccordion("instance");
    var accordionItems = accordion.getDataSource().items();
    var index;
    var selectedItems = accordion._selection.getSelectedItemKeys();
    for (var i = 0; i < accordionItems.length; i++) {
        if (!accordionItems[i]["template"].includes(groupName.replace(/\W/g, '')) ||
            (selectedItems.length > 0 &&
                accordionItems[i]["template"] == selectedItems[0]["template"])) {
            continue;
        }

        return i;

    }
    return index;
}