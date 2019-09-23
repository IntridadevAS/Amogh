function populateAnalyticsData(checkResults, container) {
    for (var key in checkResults) {

        if (!checkResults.hasOwnProperty(key)) {
            continue;
        }

        if (key == 'Comparisons') {
            comparisonCheckGroups = true;
        }
        else if (key == 'SourceACompliance') {
            sourceAComplianceCheckGroups = true;
        }
        else if (key == 'SourceBCompliance') {
            sourceBComplianceCheckGroups = true;
        }
    }

    analyticsManager = new AnalyticsManager1(comparisonCheckGroups, 
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

    //load severity line chart 
    // document.getElementById("SeverityTab").style.display = "block";

    //load comparison pie chart by default
    // var currentDiv = document.getElementById("compare");
    // currentDiv.style.fontSize = "22px";
    // currentDiv.style.color = "rgba(51, 51, 51, 1.0)";
    // var otherDiv = document.getElementById("compliance");
    // otherDiv.style.fontSize = "18px";
    // otherDiv.style.color = "rgba(153, 153, 153, 1.0)";

    // document.getElementById("ComparisonTab").style.display = "block";
    // document.getElementById("PieChartTab").style.display = "block";

    
    // if (!comparisonCheckGroups) {
    //     $("#compare").addClass("disable");
    //     openCheckResultTab('ComplianceTab');
    //     var tab = document.getElementById("ComplianceTab");
    //     tab.click();
    // }

    // if (!sourceAComplianceCheckGroups &&
    //     !sourceBComplianceCheckGroups) {
    //     $("#compliance").addClass("disable");
    // }
}

function ShowModelViewer() {
    var reviewDoc = window.frameElement.ownerDocument;
    reviewDoc.getElementById("visualizerA").style.display = "grid";
    reviewDoc.getElementById("analyticsSmall").style.display = "none";
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

    var piediv = document.getElementById('ID2');
    piediv.style.backgroundColor = "rgba(33,37,63,0)";

    var bardiv = document.getElementById('ID1');
    bardiv.style.backgroundColor = "rgba(143, 144, 145, 1)";
}

function openComplianceOverlay() {
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
    var bardiv = document.getElementById('ID1');
    bardiv.style.backgroundColor = "rgba(33,37,63,0)";

    var piediv = document.getElementById('ID2');
    piediv.style.backgroundColor = "rgba(143, 144, 145, 1)";
}

function openChartComparison() {
    activeResultType = "comparison";

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

function OnSeveritySummaryClicked() {
    SeveritybuttonActive = true;
    InfoButtonActive = false;

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

function OnInfoSummaryClicked() {
    SeveritybuttonActive = false;
    InfoButtonActive = true;

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