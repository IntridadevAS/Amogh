function populateLargeAnalyticsData(checkResults) {
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

    analyticsManager = new LargeAnalyticsManager();


    // draw pie and bar charts 
    if (comparisonCheckGroups) {
        activeResultType = "comparison";
        openChartComparison();
    }

    else if (sourceAComplianceCheckGroups) {
        activeResultType = "complianceA";
        OpenComplianceAChart();
    }

    else if (sourceBComplianceCheckGroups) {
        activeResultType = "complianceB";
        OpenComplianceBChart();
    }
}

function OpenAnalyticsCharts() {
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

function openComplianceOverlay() {
    document.getElementById("pie_A3_Group_12").style.backgroundColor = "rgba(33,37,63,0)";
    document.getElementById("bar_A3_Group_10").style.backgroundColor = "rgba(143, 144, 145, 1)";
    var overlay = document.getElementById("Compliance_DataSet_Selection");
    overlay.style.display="block";
}

function RemoveComplianceSourceSelectionOverlay() {
    var complianceSelection = document.getElementById("Compliance_DataSet_Selection");
    complianceSelection.style.display = "none";
}

function ShowBarChartDiv() {
    var bar = document.getElementById("BarCharts");
    bar.style.display="block";

    var pie = document.getElementById("charts");
    pie.style.display="none"; 
}

function ShowPieChartDiv() {
    var bar = document.getElementById("BarCharts");
    bar.style.display="none";

    var pie = document.getElementById("charts");
    pie.style.display="block"; 
}

function onBarChartClick() {
    BarChartActive = true;
    PieChartActive = false;
    document.getElementById("pie").style.backgroundColor = "rgba(33,37,63,0)";
    document.getElementById("bar").style.backgroundColor = "rgba(143, 144, 145, 1)";
    ShowBarChartDiv();
    OpenAnalyticsCharts();
}

function onPieChartClick() {
    BarChartActive = false;
    PieChartActive = true;
    document.getElementById("bar").style.backgroundColor = "rgba(33,37,63,0)";
    document.getElementById("pie").style.backgroundColor = "rgba(143, 144, 145, 1)";
    ShowPieChartDiv();
    OpenAnalyticsCharts();
}

function showSeveritySummaryDiv() {
    document.getElementById("compare_A3_Group_40").style.display = "block";
    document.getElementById("compare_A3_Group_41").style.display = "none";
}

function showInfoSummaryDiv() {
    document.getElementById("compare_A3_Group_41").style.display = "block";
    document.getElementById("compare_A3_Group_40").style.display = "none";
}

function onSeverityClick() {
    SeveritybuttonActive = true;
    InfoButtonActive = false;

    document.getElementById("Info").style.color = "rgba(255,255,255,1)"; 
    document.getElementById("infobtn").style.fill = "rgba(255,255,255,1)";

    document.getElementById("severitybtn").style.fill = "rgba(143, 144, 145, 1)";
    document.getElementById("Severity").style.color = "rgba(143, 144, 145, 1)";

    OpenAnalyticsCharts();
    showSeveritySummaryDiv();
}

function onInfoClick() {
    SeveritybuttonActive = false;
    InfoButtonActive = true;

    document.getElementById("severitybtn").style.fill = "rgba(255,72,71,1)";
    document.getElementById("Severity").style.color = "rgba(255,72,71,1)";
    
    document.getElementById("infobtn").style.fill = "rgba(143, 144, 145, 1)";
    document.getElementById("Info").style.color = "rgba(143, 144, 145, 1)";
    
    OpenAnalyticsCharts();
    showInfoSummaryDiv();
}

function openChartComparison() {
    activeResultType = "comparison";
    
    document.getElementById("pie_A3_Group_12").style.backgroundColor = "rgba(143, 144, 145, 1)";
    document.getElementById("bar_A3_Group_10").style.backgroundColor = "rgba(33,37,63,0)";

    if (comparisonCheckGroups) {
        analyticsManager.populateLargeAnalyticsComparisonCharts();
    }
}

function OpenComplianceAChart() {
    activeResultType = "complianceA";
    if (sourceAComplianceCheckGroups) {
        analyticsManager.populateLargeAnalyticsComplianceACharts();
    }
}

function OpenComplianceBChart() {
    activeResultType = "complianceB";

    if (sourceBComplianceCheckGroups) {
        analyticsManager.populateLargeAnalyticsComplianceBCharts();
    }
}