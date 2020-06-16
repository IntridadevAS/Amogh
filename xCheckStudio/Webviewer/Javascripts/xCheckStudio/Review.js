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
                    var commentData = JSON.parse(checkResults["checkspaceComments"][i]);
                    commentsCallout.ShowComment(commentData);
                }
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
    sourceDComponentsHierarchy) {
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
            var viewerOptions = JSON.parse(msg);

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
                            classWiseComponents['a'] = sourceAClassWiseComponents = JSON.parse(msg);
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
                            classWiseComponents['b'] = JSON.parse(msg);
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
                            classWiseComponents['c'] = JSON.parse(msg);
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
                            classWiseComponents['d'] = JSON.parse(msg);
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
                            classWiseComponents[source]);

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
        menusA["DisplayMenu"] = new DisplayMenu(id, viewerId);
        menusA["MarkupMenu"] = new MarkupMenu(id, viewerId);
        menusA["BookmarkMenu"] = new BookmarkMenu(id, viewerId);
        menusA["TagsMenu"] = new TagsMenu(id, viewerId);
        menusA["ModelViewsMenu"] = new ModelViewsMenu(id, viewerId);        
        
        menusA["ShapesMenu"] = new ShapesMenu(id, viewerId);
        menusA["DisplayStylesMenu"] = new DisplayStylesMenu(id, viewerId);
        menusA["SectioningMenu"] = new SectioningMenu(id, viewerId);
        menusA["MeasureMenu"] = new MeasureMenu(id, viewerId);
    }
    if (comparisonData["sourceBViewer"] &&
        comparisonData["sourceBViewer"].Is3DViewer()) {
        var id = "comparison";
        var viewerId = "b";
        var menusB = menus[viewerId];
        menusB['DisplayMenu'] = new DisplayMenu(id, viewerId);
        menusB["MarkupMenu"] = new MarkupMenu(id, viewerId);
        menusB["BookmarkMenu"] = new BookmarkMenu(id, viewerId);
        menusB["TagsMenu"] = new TagsMenu(id, viewerId);
        menusB["ModelViewsMenu"] = new ModelViewsMenu(id, viewerId);
       
        menusB["ShapesMenu"] = new ShapesMenu(id, viewerId);
        menusB["DisplayStylesMenu"] = new DisplayStylesMenu(id, viewerId);
        menusB["SectioningMenu"] = new SectioningMenu(id, viewerId);
        menusB["MeasureMenu"] = new MeasureMenu(id, viewerId);
    }
    if (comparisonData["sourceCViewer"] &&
        comparisonData["sourceCViewer"].Is3DViewer()) {
        var id = "comparison";
        var viewerId = "c";
        var menusC = menus[viewerId];
        menusC['DisplayMenu'] = new DisplayMenu(id, viewerId);
        menusC["MarkupMenu"] = new MarkupMenu(id, viewerId);
        menusC["BookmarkMenu"] = new BookmarkMenu(id, viewerId);
        menusC["TagsMenu"] = new TagsMenu(id, viewerId);
        menusC["ModelViewsMenu"] = new ModelViewsMenu(id, viewerId);
        
        menusC["ShapesMenu"] = new ShapesMenu(id, viewerId);
        menusC["DisplayStylesMenu"] = new DisplayStylesMenu(id, viewerId);
        menusC["SectioningMenu"] = new SectioningMenu(id, viewerId);
        menusC["MeasureMenu"] = new MeasureMenu(id, viewerId);
    }
    if (comparisonData["sourceDViewer"]  &&
        comparisonData["sourceDViewer"].Is3DViewer()) {
        var id = "comparison";
        var viewerId = "d";
        var menusD = menus[viewerId];
        menusD['DisplayMenu'] = new DisplayMenu(id, viewerId);
        menusD["MarkupMenu"] = new MarkupMenu(id, viewerId);
        menusD["BookmarkMenu"] = new BookmarkMenu(id, viewerId);
        menusD["TagsMenu"] = new TagsMenu(id, viewerId);
        menusD["ModelViewsMenu"] = new ModelViewsMenu(id, viewerId);
      
        menusD["ShapesMenu"] = new ShapesMenu(id, viewerId);
        menusD["DisplayStylesMenu"] = new DisplayStylesMenu(id, viewerId);
        menusD["SectioningMenu"] = new SectioningMenu(id, viewerId);
        menusD["MeasureMenu"] = new MeasureMenu(id, viewerId);
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
    classWiseComponents) {

    complianceReviewManager = new ComplianceReviewManager(compliance,
        viewerOptions,
        classWiseComponents,
        Compliance.MainReviewContainer,
        Compliance.DetailInfoContainer,
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
        var viewerId = "a";
        var menus = complianceData["menus"][viewerId];
        menus['DisplayMenu'] = new DisplayMenu(id, viewerId);
        menus["MarkupMenu"] = new MarkupMenu(id, viewerId);
        menus["BookmarkMenu"] = new BookmarkMenu(id, viewerId);
        menus["TagsMenu"] = new TagsMenu(id, viewerId);
        menus["ModelViewsMenu"] = new ModelViewsMenu(id, viewerId);
       
        menus["ShapesMenu"] = new ShapesMenu(id, viewerId);
        menus["DisplayStylesMenu"] = new DisplayStylesMenu(id, viewerId);
        menus["SectioningMenu"] = new SectioningMenu(id, viewerId);
        menus["MeasureMenu"] = new MeasureMenu(id, viewerId);
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
            var viewerOptions = JSON.parse(msg);

            // make viewers enable
            enableViewers(comparison.sources);

            // create accordion
            createModelBrowserAccordion(comparison.sources, Comparison.MainReviewContainer);

            for (var i = 0; i < comparison.sources.length; i++) {
                if (checkResults.sourceInfo.sourceAFileName === comparison.sources[i]) {
                    var source = checkResults.sourceInfo.sourceAFileName;

                    if (viewerOptions['a']['endPointUri'] !== undefined) {

                        if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(viewerOptions['a']["source"]))) {
                            // model browser
                            var modelBrowser = new ReviewComparison3DModelBrowser("a", source, comparison);
                            modelBrowser.AddModelBrowser(checkResults.SourceAComparisonComponentsHierarchy);

                            // viewer
                            var options = ["compare1", viewerOptions['a']['endPointUri']];
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
                            var options = ["compare1", viewerOptions['a']['endPointUri']];
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
                                    var sourceAClassWiseComponents = JSON.parse(msg);

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
                else if (checkResults.sourceInfo.sourceBFileName === comparison.sources[i]) {
                    var source = checkResults.sourceInfo.sourceBFileName;

                    if (viewerOptions['b']['endPointUri'] !== undefined) {

                        if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(viewerOptions['b']["source"]))) {
                            // model browser
                            var modelBrowser = new ReviewComparison3DModelBrowser("b", source, comparison);
                            modelBrowser.AddModelBrowser(checkResults.SourceBComparisonComponentsHierarchy);

                            // viewer
                            var options = ["compare2", viewerOptions['b']['endPointUri']];
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
                            var options = ["compare2", viewerOptions['b']['endPointUri']];
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
                                    var sourceBClassWiseComponents = JSON.parse(msg);

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
                else if (checkResults.sourceInfo.sourceCFileName === comparison.sources[i]) {
                    var source = checkResults.sourceInfo.sourceCFileName;

                    if (viewerOptions['c']['endPointUri'] !== undefined) {

                        if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(viewerOptions['c']["source"]))) {
                            // model browser
                            var modelBrowser = new ReviewComparison3DModelBrowser("c", source, comparison);
                            modelBrowser.AddModelBrowser(checkResults.SourceCComparisonComponentsHierarchy);

                            // viewer
                            var options = ["compare3", viewerOptions['c']['endPointUri']];
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
                            var options = ["compare3", viewerOptions['c']['endPointUri']];
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
                                    var sourceCClassWiseComponents = JSON.parse(msg);

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
                else if (checkResults.sourceInfo.sourceDFileName === comparison.sources[i]) {
                    var source = checkResults.sourceInfo.sourceDFileName;

                    if (viewerOptions['d']['endPointUri'] !== undefined) {

                        if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(viewerOptions['d']["source"]))) {
                            // model browser
                            var modelBrowser = new ReviewComparison3DModelBrowser("d", source, comparison);
                            modelBrowser.AddModelBrowser(checkResults.SourceDComparisonComponentsHierarchy);

                            // viewer
                            var options = ["compare4", viewerOptions['d']['endPointUri']];
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
                            var options = ["compare4", viewerOptions['d']['endPointUri']];
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
                                    var sourceDClassWiseComponents = JSON.parse(msg);

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
            var viewerOptions = JSON.parse(msg);

            for (var srcId in viewerOptions) {
                var viewerOption = viewerOptions[srcId];
                if (viewerOption.source !== compliance.source) {
                    continue;
                }

                // create accordion
                createModelBrowserAccordion([compliance.source], Compliance.MainReviewContainer);
              
                if (viewerOption['endPointUri'] !== undefined) {

                    if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(viewerOption["source"]))) {

                        // model browser
                        var modelBrowser = new ReviewCompliance3DModelBrowser(srcId, compliance.source, compliance);
                        modelBrowser.AddModelBrowser(compliance.ComponentsHierarchy);

                        // viewer
                        var options = [Compliance.ViewerContainer, viewerOption['endPointUri']];
                        var viewerInterface = new ModelBrowser3DViewer(srcId, compliance.source, options);
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
                        var modelBrowser = new ReviewComplianceVisioModelBrowser(srcId, compliance.source, compliance);
                        modelBrowser.AddModelBrowser(compliance.ComponentsHierarchy);

                         // viewer
                         var options = [Compliance.ViewerContainer, viewerOption['endPointUri']];
                         var viewerInterface = new ModelBrowserVisioViewer(srcId, compliance.source, options);
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
                    if (srcId === "a") {
                        source = "SourceA";
                    }
                    else if (srcId === "b") {
                        source = "SourceB";
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
                                var classWiseComponents = JSON.parse(msg);

                                // model browser
                                var modelBrowser = new ReviewCompliance1DModelBrowser(srcId, compliance.source, compliance);
                                modelBrowser.AddModelBrowser(compliance.ComponentsHierarchy);

                                // // viewer
                                var viewerInterface = new ModelBrowser1DViewer(srcId, compliance.source, classWiseComponents, Compliance.ViewerContainer);

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

function createModelBrowserAccordion(sources, container) {
    var parentTable = document.getElementById(container);

    var data = createAccordionData(sources);   
    for (var i = 0; i < data.length; i++) {
        var div = document.createElement("DIV");
        div.setAttribute('data-options', "dxTemplate: { name: '" + data[i]["template"] + "' }")        
        div.id = data[i]["template"].replace(/\W/g, '');        
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
            var btn = $('<div>')
            $(btn).data("index", itemIndex)
                .dxButton({
                    icon: "chevrondown",
                    width: "38px",
                    height: "30px",
                    onClick: function (e) {
                        e.jQueryEvent.stopPropagation();
                        var isOpened = e.element.parent().next().parent().hasClass("dx-accordion-item-opened")
                        if (!isOpened) {
                            $("#" + container).dxAccordion("instance").expandItem(e.element.data("index"));
                        }
                        else {
                            $("#" + container).dxAccordion("instance").collapseItem(e.element.data("index"));
                        }

                    }
                }).css("float", "right").appendTo(itemElement);

            btn[0].classList.add("accordionButton");

            itemElement.append("<h1 style = 'font-size: 15px; text-align: center;color: white;'>" + itemData.title + "</h1>");

        },
        onItemTitleClick: function (e) {
            e.event.stopPropagation();
        },
        onItemClick: function (e) {
            e.event.stopPropagation();
        }
    });
}

function createAccordionData(sources) {

    var data = [];
    for (var i = 0; i < sources.length; i++) {
        var source = sources[i];

        var dataObject = {};
        dataObject["template"] = source.replace(/\W/g, '');
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
        if (!accordionItems[i]["template"].includes(groupName) ||
            (selectedItems.length > 0 &&
                accordionItems[i]["template"] == selectedItems[0]["template"])) {
            continue;
        }

        return i;

    }
    return index;
}