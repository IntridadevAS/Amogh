function populateSmallAnalyticsData(checkResults, container) {
    for (var key in checkResults) {

        if (!checkResults.hasOwnProperty(key)) {
            continue;
        }

        if (key == 'Comparisons') {
            comparisonCheckGroups = true;
        }
        else if (key == 'Compliances') {
            sourceAComplianceCheckGroups = true;
            sourceBComplianceCheckGroups = true;
        }
    }

    analyticsManager = new SmallAnalyticsManager(comparisonCheckGroups, 
                                            sourceAComplianceCheckGroups, 
                                            sourceBComplianceCheckGroups,
                                            container);

    // draw pie and bar charts 
    if (comparisonCheckGroups) {
        analyticsManager.populateComparisonAnalyticsData();
        activeResultType = "comparison";
    }

    else if (sourceAComplianceCheckGroups) {
        analyticsManager.populateSourceAComplianceAnalyticsData();
        activeResultType = "complianceA";
    }

    else if (sourceBComplianceCheckGroups) {
        analyticsManager.populateSourceBComplianceAnalyticsData();
        activeResultType = "complianceB"
    }
}

function ShowModelViewer() {
    var reviewDoc = window.frameElement.ownerDocument;
    reviewDoc.getElementById("analyticsSmall").style.display = "none";
    var currentView = window.parent.getCurrentView();
    if(currentView.MainReviewTableContainer.includes("comparison")) {
        reviewDoc.getElementById("comparisonVisualizerA").style.display = "grid";
    }
    else {
        reviewDoc.getElementById("complianceVisualizerA").style.display = "grid";
    }
    window.parent.resizeCanvas();
}

function ShowLargeAnalytics() {
    var reviewDoc = window.frameElement.ownerDocument;
    var modal = reviewDoc.getElementById('maximizeViewerContainer');
    // When the user clicks the button, open the modal 
    modal.style.display = "block";
}

function PopulateComparisonChartData()
{
    var _currentFill = "#707070"; // red
    $svg = $("#ID1_A1_Group_21");
    $($svg).attr('style', "fill:"+_currentFill); 
}

function ShowSeveritySummary() {
    var summary = document.getElementById("Summary");
    summary.style.display = "block";
    var summaryData = analyticsManager.getSeveritySummary(activeResultType);

    var Total_items_checked_div = document.getElementById("ID37");
    Total_items_checked_div.innerHTML = summaryData.TotalItemsChecked;

    var Items_with_errors_div = document.getElementById("ID18");
    Items_with_errors_div.innerHTML = summaryData.ErrorsCount;

    var Items_with_warnings_div = document.getElementById("ID13");
    Items_with_warnings_div.innerHTML = summaryData.WarningCount;

    var Items_OK_div = document.getElementById("ID6_A3_Text_11");
    Items_OK_div.innerHTML = summaryData.OKCount;

    var Total_items_matched_div = document.getElementById("ID37_A3_Text_12");
    Total_items_matched_div.innerHTML = summaryData.TotalItemsMatched;

    var ok_A_T_Count_div = document.getElementById("ID6");
    ok_A_T_Count_div.innerHTML = summaryData.oKATCount;
}

function ShowInfoSummary() {
    var summary = document.getElementById("SummaryInfo");
    summary.style.display = "block";

    var infoSummary = analyticsManager.getInfoSummary(activeResultType);

    var Total_items_loaded_div = document.getElementById("checkedItemCount");
    Total_items_loaded_div.innerHTML = infoSummary.TotalItemsLoaded;

    var Items_with_nomatch_div = document.getElementById("count_no_match");
    Items_with_nomatch_div.innerHTML = infoSummary.noMatchCount;

    var Items_with_undefined_div = document.getElementById("count_undefined");
    Items_with_undefined_div.innerHTML = infoSummary.undefinedCount;

    var Items_notChecked_div = document.getElementById("ID37_A3_Text_12_1");
    Items_notChecked_div.innerHTML = infoSummary.TotalItemsNotChecked;
}

function RemoveSeveritySummaryOverlay() {
    var Summary = document.getElementById("Summary");
    Summary.style.display = "none";
}

function RemoveInfoSummaryOverlay() {
    var infoSummary = document.getElementById("SummaryInfo");
    infoSummary.style.display = "none";
}

function RemoveComplianceSourceSelectionOverlay() {
    var complianceSelection = document.getElementById("Compliance_DataSet_Selection");
    complianceSelection.style.display = "none";
}

function onBarChartsClick() {
    BarChartActive = true;
    PieChartActive = false;
    if(activeResultType == "comparison") {
        openChartComparison()
    }
    else if(activeResultType == "complianceA") {
        OpenComplianceAChart();
    }
    else if(activeResultType == "complianceB") {
        OpenComplianceBChart();
    }

    var bardiv = document.getElementById('ID1');
    bardiv.style.backgroundColor = "rgba(33,37,63,0)";

    var piediv = document.getElementById('ID2');
    piediv.style.backgroundColor = "rgba(143, 144, 145, 1)";
}

function openComplianceOverlay() {
    document.getElementById("ID2_A1_Group_21").style.backgroundColor = "rgba(143, 144, 145, 1)";
    document.getElementById("ID1_A1_Group_22").style.backgroundColor = "rgba(33,37,63,0)";
    var overlay = document.getElementById("Compliance_DataSet_Selection");
    overlay.style.display="block";
}

function onPieChartsClick() {
    PieChartActive = true;
    BarChartActive = false;
    if(activeResultType == "comparison") {
        openChartComparison()
    }
    else if(activeResultType == "complianceA") {
        OpenComplianceAChart();
    }
    else if(activeResultType == "complianceB") {
        OpenComplianceBChart();
    }

    var piediv = document.getElementById('ID2');
    piediv.style.backgroundColor = "rgba(33,37,63,0)";

    var bardiv = document.getElementById('ID1');
    bardiv.style.backgroundColor = "rgba(143, 144, 145, 1)";
}

function openChartComparison() {
    activeResultType = "comparison";
    
    document.getElementById("ID2_A1_Group_21").style.backgroundColor = "rgba(33,37,63,0)";
    document.getElementById("ID1_A1_Group_22").style.backgroundColor = "rgba(143, 144, 145, 1)";

    if (BarChartActive) {
        if (comparisonCheckGroups) {
            analyticsManager.populateComparisonAnalyticsData();
        }
    }
    if (PieChartActive) {
        if (comparisonCheckGroups) {
            analyticsManager.populateComparisonAnalyticsData();
        }
    }
}

function OpenComplianceAChart() {
    activeResultType = "complianceA";

    if (BarChartActive) {
        if (sourceAComplianceCheckGroups) {
            analyticsManager.populateSourceAComplianceAnalyticsData();
        }
    }
    if (PieChartActive) {
        if (sourceAComplianceCheckGroups) {
            analyticsManager.populateSourceAComplianceAnalyticsData();
        }
    }
}

function OnSeverityChartsClicked() {
    SeveritybuttonActive = true;
    InfoButtonActive = false;

    var SeverityChartButton = document.getElementById("SeverityChartButton");
    SeverityChartButton.style.fill = "rgba(83, 84, 85, 1)";

    var InfoChartButton = document.getElementById("InfoChartButton");
    InfoChartButton.style.fill = "rgba(255,255,255,1)";

    if(activeResultType == "comparison") {
        openChartComparison()
    }
    else if(activeResultType == "complianceA") {
        OpenComplianceAChart();
    }
    else if(activeResultType == "complianceB") {
        OpenComplianceBChart();
    }
}

function OnInfoChartsClicked() {
    SeveritybuttonActive = false;
    InfoButtonActive = true;

    var SeverityChartButton = document.getElementById("SeverityChartButton");
    SeverityChartButton.style.fill = "rgba(255,72,71,1)";

    var InfoChartButton = document.getElementById("InfoChartButton");
    InfoChartButton.style.fill = "rgba(83, 84, 85, 1)";

    if(activeResultType == "comparison") {
        openChartComparison()
    }
    else if(activeResultType == "complianceA") {
        OpenComplianceAChart();
    }
    else if(activeResultType == "complianceB") {
        OpenComplianceBChart();
    }
}

function OpenComplianceBChart() {
    activeResultType = "complianceB";

    if (BarChartActive) {
        if (sourceBComplianceCheckGroups) {
            analyticsManager.populateSourceBComplianceAnalyticsData();
        }
    }
    if (PieChartActive) {
        if (sourceBComplianceCheckGroups) {
            analyticsManager.populateSourceBComplianceAnalyticsData();
        }
    }
}