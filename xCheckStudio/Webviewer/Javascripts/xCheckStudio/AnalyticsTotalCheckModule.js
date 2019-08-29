function populateAnalyticsData(checkResults) {
    for (var key in checkResults) {

        if (!checkResults.hasOwnProperty(key)) {
            continue;
        }

        if (key == 'Comparison') {
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
                                            sourceBComplianceCheckGroups);

    // draw pie and bar charts 
    if (comparisonCheckGroups) {
        analyticsManager.populateComparisonAnalyticsData();
    }

    else if (sourceAComplianceCheckGroups) {
        analyticsManager.populateSourceAComplianceAnalyticsData();
    }

    else if (sourceBComplianceCheckGroups) {
        analyticsManager.populateSourceBComplianceAnalyticsData();
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

function PopulateComparisonChartData()
{
    var _currentFill = "#707070"; // red
    $svg = $("#ID1_A1_Group_21");
    $($svg).attr('style', "fill:"+_currentFill); 
}

function ShowSeveritySummary() {
    var summary = document.getElementById("Summary");
    summary.style.display = "block";
}

function RemoveSummaryOverlay() {
    var infoSummary = document.getElementById("Summary");
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