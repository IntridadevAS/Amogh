var checkResults;
var comparisons;
var compliances;
var sourceAComparisonHierarchy = undefined;
var sourceBComparisonHierarchy = undefined;

var comparisonReviewManager;
var complianceReviewManager;

function initReviewModule() {
    return new Promise((resolve) => {
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
                checkResults = JSON.parse(msg);

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
                }

                return resolve(true);
            },
            error: function (error) {
                //alert('error; ' + eval(error));
                return resolve(false);
            }
        });
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

            // var sourceAViewerOptions = undefined;
            //var sourceAClassWiseComponents = undefined;
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
                            // sourceAClassWiseComponents = JSON.parse(msg);
                            classWiseComponents['a'] = sourceAClassWiseComponents = JSON.parse(msg);
                        }
                    }
                });
            }
            // else {
            //     sourceAViewerOptions = [viewerOptions['SourceAEndPointUri']];
            // }

            // var sourceBViewerOptions = undefined;
            //var sourceBClassWiseComponents = undefined;
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
                            // sourceBClassWiseComponents = JSON.parse(msg);
                            classWiseComponents['b'] = sourceAClassWiseComponents = JSON.parse(msg);
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
    sourceAClassWiseComponents,
    sourceBClassWiseComponents,
    sourceAComponentsHierarchy,
    sourceBComponentsHierarchy) {

    // make viewers enable
    enableViewers(comparisonCheckGroups.sources);

    comparisonReviewManager = new ComparisonReviewManager(comparisonCheckGroups,
        sourceAViewerOptions,
        sourceBViewerOptions,
        sourceAClassWiseComponents,
        sourceBClassWiseComponents,
        Comparison.MainReviewContainer,
        Comparison.DetailInfoContainer,
        sourceAComponentsHierarchy,
        sourceBComponentsHierarchy);

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

}


function populateModelBrowser(comparison) {

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
            createModelBrowserAccordion(comparison.sources);

            for (var i = 0; i < comparison.sources.length; i++) {
                if (checkResults.sourceInfo.sourceAFileName === comparison.sources[i]) {
                    var source = checkResults.sourceInfo.sourceAFileName;

                    if (viewerOptions['a']['endPointUri'] !== undefined) {

                        // model browser
                        var modelBrowser = new ReviewComparison3DModelBrowser("a", source, comparison);
                        modelBrowser.AddModelBrowser(checkResults.SourceAComparisonComponentsHierarchy);

                        // viewer
                        var options = ["compare1", viewerOptions['a']['endPointUri']];
                        var viewerInterface = new ModelBrowser3DViewer("a", source, options);
                        viewerInterface.setupViewer(550, 280);

                        // var viewerInterface = new Review3DViewerInterface(["compare1", viewerOptions['a']['endPointUri']],
                        //     undefined,
                        //     undefined,
                        //     source);
                        // viewerInterface.setupViewer(550, 280);

                        // selection manager
                        var selectionManager = new ReviewModelBrowserSelectionManager();

                        var browserComponents = {};
                        browserComponents["browser"] = modelBrowser;
                        browserComponents["viewer"] = viewerInterface;
                        browserComponents["selectionManager"] = selectionManager;

                        var comparisonData = model.checks["comparison"];
                        comparisonData["modelBrowsers"][checkResults.sourceInfo.sourceAFileName] = browserComponents;
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
            }

            // // make buttons collapsible
            // setButtonsCollapsible(Comparison.MainReviewContainer);
        }
    });
    // createModelBrowserAccordion(comparison.sources);   
}

// function setButtonsCollapsible(containerId) {

//     var container = document.getElementById(containerId);
//     var acc = container.getElementsByClassName("accordion");
//     var i;

//     for (i = 0; i < acc.length; i++) {
//         acc[i].addEventListener("click", function () {
//             this.classList.toggle("active");
//             var panel = this.nextElementSibling;
//             if (panel.style.display === "block") {
//                 panel.style.display = "none";
//             } else {
//                 panel.style.display = "block";
//             }
//         });
//     }
// }

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
    }
    else if (sources.length === 4) {
        document.getElementById("comparePanelB").style.display = "block";
        document.getElementById("comparePanelC").style.display = "block";
        document.getElementById("comparePanelD").style.display = "block";
    }
}

function createModelBrowserAccordion(sources) {
    var parentTable = document.getElementById(Comparison.MainReviewContainer);

    var data = createAccordionData(sources);
    for (var i = 0; i < data.length; i++) {
        var div = document.createElement("DIV");
        div.setAttribute('data-options', "dxTemplate: { name: '" + data[i]["template"] + "' }")
        div.id = data[i]["template"];
        var datagridDiv = document.createElement("DIV");
        // datagridDiv.id = data[i]["template"] + "_";
        datagridDiv.id = data[i]["template"].replace(/\W/g, '_') + "_" + Comparison.MainReviewContainer

        div.append(datagridDiv);
        parentTable.append(div);
    }

    $("#" + Comparison.MainReviewContainer).dxAccordion({
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
                            $("#" + Comparison.MainReviewContainer).dxAccordion("instance").expandItem(e.element.data("index"));
                        }
                        else {
                            $("#" + Comparison.MainReviewContainer).dxAccordion("instance").collapseItem(e.element.data("index"));
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
        dataObject["template"] = source;
        dataObject["title"] = source;

        data.push(dataObject);
    }

    return data;
}

function expandModelBrowserAccordion(groupName) {

    return new Promise(function (resolve) {

        var accordion = $("#" + Comparison.MainReviewContainer).dxAccordion("instance");

        // scroll to table
        var accordionIndex = getAccordionIndex(groupName)
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

function getAccordionIndex(groupName) {
    var accordion = $("#" + Comparison.MainReviewContainer).dxAccordion("instance");
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