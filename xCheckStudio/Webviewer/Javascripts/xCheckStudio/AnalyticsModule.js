
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

    analyticsManager = new AnalyticsManager(comparisonCheckGroups, 
                                            sourceAComplianceCheckGroups, 
                                            sourceBComplianceCheckGroups);

    // draw pie and bar charts 
    if (comparisonCheckGroups) {
        analyticsManager.populateComparisonAnalyticsData();
    }

    if (sourceAComplianceCheckGroups) {
        analyticsManager.populateSourceAComplianceAnalyticsData();
    }

    if (sourceBComplianceCheckGroups) {
        analyticsManager.populateSourceBComplianceAnalyticsData();
    }

    //load severity line chart 
    document.getElementById("SeverityTab").style.display = "block";

    //load comparison pie chart by default
    var currentDiv = document.getElementById("compare");
    currentDiv.style.fontSize = "22px";
    currentDiv.style.color = "rgba(51, 51, 51, 1.0)";
    var otherDiv = document.getElementById("compliance");
    otherDiv.style.fontSize = "18px";
    otherDiv.style.color = "rgba(153, 153, 153, 1.0)";

    document.getElementById("ComparisonTab").style.display = "block";
    document.getElementById("PieChartTab").style.display = "block";

    
    if (!comparisonCheckGroups) {
        $("#compare").addClass("disable");
        openCheckResultTab('ComplianceTab');
        var tab = document.getElementById("ComplianceTab");
        tab.click();
    }

    if (!sourceAComplianceCheckGroups &&
        !sourceBComplianceCheckGroups) {
        $("#compliance").addClass("disable");
    }
}

function getData(newData) {
    var dataTable = new google.visualization.DataTable();
    var numRows = newData.length;
    var numCols = newData[0].length;
    for (var i = 0; i < numCols; i++) {
        dataTable.addColumn(typeof (newData[1][i]), newData[0][i]);
    }
    for (var i = 1; i < numRows; i++) {
        dataTable.addRow(newData[i]);
    }

    return dataTable;
}

function openCheckResultTab(tabName) {

    var tabs = document.getElementsByClassName("AnalyticsResultsContainerTab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }
    tabs = document.getElementsByClassName("AnalyticsChartContainerTab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }

    document.getElementById(tabName).style.display = "block";

    if (tabName === "ComparisonTab") {
        var currentDiv = document.getElementById("compare");
        currentDiv.style.fontSize = "22px";
        currentDiv.style.color = "rgba(51, 51, 51, 1.0)";
        var otherDiv = document.getElementById("compliance");
        otherDiv.style.fontSize = "18px";
        otherDiv.style.color = "rgba(153, 153, 153, 1.0)";

        document.getElementById("PieChartTab").style.display = "block";
        //analyticsManager.drawPieCharts("comparison");

        //add data to summary
        analyticsManager.setSeveritySummary ('Comparison');               
    }
    else if (tabName === "ComplianceTab") {

        // this removes the severity and non-severity line charts which are
        // only present for comparison for now
        tabs = document.getElementsByClassName("AnalyticsProjectHealthTab");
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].style.display = "none";
        }

        var currentDiv = document.getElementById("compliance");
        currentDiv.style.fontSize = "22px";
        currentDiv.style.color = "rgba(51, 51, 51, 1.0)";
        var otherDiv = document.getElementById("compare");
        otherDiv.style.fontSize = "18px";
        otherDiv.style.color = "rgba(153, 153, 153, 1.0)";

        document.getElementById("ComplianceATab").style.display = "block";
        document.getElementById("ComplianceAPieChartTab").style.display = "block";

        var currentTab = document.getElementById("ComplianceATab");
        var parentTab = currentTab.parentElement;

        sourceAButton = parentTab.getElementsByClassName("ComplianceA");
        sourceAButton[0].style.backgroundColor = "red";

        sourceBButton = parentTab.getElementsByClassName("ComplianceB");
        sourceBButton[0].style.backgroundColor = "white";

        //analyticsManager.drawPieCharts("compliance", "ComplianceAPieChartTab");
        //add data to summary
        analyticsManager.setSeveritySummary ('SourceACompliance');       
    }
    else if (tabName === "ComparisonTabInfo") {
        var currentDiv = document.getElementById("compareInfo");
        currentDiv.style.fontSize = "22px";
        currentDiv.style.color = "rgba(51, 51, 51, 1.0)";
        var otherDiv = document.getElementById("complianceInfo");
        otherDiv.style.fontSize = "18px";
        otherDiv.style.color = "rgba(153, 153, 153, 1.0)";

        document.getElementById("PieChartTabInfo").style.display = "block";
        //analyticsManager.drawInfoPieCharts("comparison");

        //add data to summary
        analyticsManager.setNonSeveritySummary();               
    }
}


function openProjectHealthTab(tabName) {
    var tabs = document.getElementsByClassName("AnalyticsProjectHealthTab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }
    var tabs = document.getElementsByClassName("AnalyticsResultsContainerTab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }
    var tabs = document.getElementsByClassName("AnalyticsChartContainerTab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }


    document.getElementById(tabName).style.display = "block";
    if (tabName === "SeverityTab") {
        var currentDiv = document.getElementById("severity1");
        currentDiv.style.fontSize = "22px";
        currentDiv.style.color = "rgba(51, 51, 51, 1.0)";
        var otherDiv = document.getElementById("info");
        otherDiv.style.fontSize = "18px";
        otherDiv.style.color = "rgba(153, 153, 153, 1.0)";

        document.getElementById("compare").style.display = "block";
        document.getElementById("compliance").style.display = "block";
        document.getElementById("ComparisonTab").style.display = "block";
        document.getElementById("blocksummarySeverity").style.display = "block";
        document.getElementById("compareInfo").style.display = "none";
        document.getElementById("complianceInfo").style.display = "none";
        document.getElementById("blocksummaryInfo").style.display = "none";

        document.getElementById("SeverityTab").style.display = "block";

        openCheckResultTab("ComparisonTab");

        analyticsManager.drawLineCharts(analyticsManager.ComparisonErrorsCount,
            analyticsManager.ComparisonOKCount,
            analyticsManager.ComparisonWarningsCount);
    }

    if (tabName === "InfoTab") {
        var currentDiv = document.getElementById("info");
        currentDiv.style.fontSize = "22px";
        currentDiv.style.color = "rgba(51, 51, 51, 1.0)";
        var otherDiv = document.getElementById("severity1");
        otherDiv.style.fontSize = "18px";
        otherDiv.style.color = "rgba(153, 153, 153, 1.0)";

        document.getElementById("compare").style.display = "none";
        document.getElementById("compliance").style.display = "none";
        document.getElementById("ComparisonTab").style.display = "none";
        document.getElementById("blocksummarySeverity").style.display = "none";
        document.getElementById("compareInfo").style.display = "block";
        document.getElementById("complianceInfo").style.display = "block";
        document.getElementById("blocksummaryInfo").style.display = "block";

        var currentDiv = document.getElementById("compareInfo");
        currentDiv.style.fontSize = "22px";
        currentDiv.style.color = "rgba(51, 51, 51, 1.0)";
        var otherDiv = document.getElementById("complianceInfo");
        otherDiv.style.fontSize = "18px";
        otherDiv.style.color = "rgba(153, 153, 153, 1.0)";

        var currentTab = document.getElementById("PieChartTabInfo");
        var parentTab = currentTab.parentElement;

        barChartDiv = parentTab.getElementsByClassName("rectanglecopy16")[0];
        pieChartDiv = parentTab.getElementsByClassName("rectanglecopy15")[0];
        barChartDiv.src = "/images/Analytics/01-1-rectangle-copy-16@2x.png"
        pieChartDiv.src = "/images/Analytics/01-1-rectangle-copy-15@2x.png"

        parentTab.getElementsByClassName("piechart")[0].style.color = "rgba(255, 255, 255, 1.0)";
        parentTab.getElementsByClassName("barchart")[0].style.color = "rgba(153, 151, 152, 1.0)";

        document.getElementById("ComparisonTabInfo").style.display = "block";
        document.getElementById("PieChartTabInfo").style.display = "block";

        //analyticsManager.drawInfoPieCharts("comparison");
        document.getElementById("InfoTab").style.display = "block";
        analyticsManager.drawInfoLineCharts(analyticsManager.ComparisonTotalItemsNotChecked,
            analyticsManager.ComparisonNoMatchCount, analyticsManager.ComparisonUndefinedCount);

        //add data to summary
        analyticsManager.setNonSeveritySummary();                
    }
}