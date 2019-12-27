function LoadAnalyticsContent(analyticsData, currentCheck) {

    HighLightButtonsOnPieChartClick(); 
    InitAnalyticsContextMenu();
    analyticsManager = new SmallAnalyticsManager(analyticsData);

    if(currentCheck['check'] == 'comparison') {
        openChartComparison();
    }
    else {
        var currentcompliance = currentCheck['selectedCheck'].id;
        if(currentcompliance == 'a') 
        {
            activeResultType = 'complianceA';
        }
        else if(currentcompliance == 'b') 
        {
            activeResultType = 'complianceB';
        }
        else if(currentcompliance == 'c') 
        {
            activeResultType = 'complianceC';
        }
        else if(currentcompliance == 'd') 
        {
            activeResultType = 'complianceD';
        }

        OpenComplianceChart(activeResultType);
    }
}

function InitAnalyticsContextMenu() {
    $("#Small").contextMenu({
        selector: ".bg",
        className: 'contextMenu_style',
        build: function ($triggerElement, e) {
            return {
                callback: function (key, options) {
                    ExecuteAnalyticsContextMenu(key);
                },
                items: {
                    "totalCheck" : {
                        name: "Total Check",
                    },
                    "category":
                    {
                        name: "Category",
                    },
                    "subClassCheck" : {
                        name: "Class"
                    },
                    "property": {
                        name: "Property",
                    }
                }
            }
        }
    });
}

function ExecuteAnalyticsContextMenu(key) {
    switch(key) {
        case "category" :
            AnalyticsType = key;
            onCategoryAnalyticsClick();
            break;
        case "totalCheck" : 
            AnalyticsType = key;
            onTotalCheckAnalyticsClick();
            break;
        case "subClassCheck" :
            AnalyticsType = key;
            onSubClassAnalyticsClick();
            break;
            
    }
}

function onCategoryAnalyticsClick() {
    ActiveCategory = window.parent.GetActiveCategory();

    if(ActiveCategory == undefined) {
        return;
    }
    
    if(activeResultType == "comparison") {
        analyticsManager.populateComparisonCategoryAnalytics();
    }
    else {
        analyticsManager.populateComplianceCategoryAnalytics(activeResultType)
    }
}

function onTotalCheckAnalyticsClick() {
    if(activeResultType == "comparison") {
        openChartComparison();
    }
    else {
        OpenComplianceChart(activeResultType);
    }
}

function onSubClassAnalyticsClick() {
    var classMappingInfo = window.parent.GetSubClassMappingForHighlightedRow();
}

function HideAnalyticsViewer() {
    // var reviewDoc = window.frameElement.ownerDocument;
    window.parent.ShowModelViewer();
    window.parent.resizeCanvas();
}

function ShowLargeAnalytics() {
    window.parent.ShowLargeAnalytics();
}

function ShowSeveritySummary() {
    var summary = document.getElementById("Summary");
    summary.style.display = "block";
    var summaryData;
    switch(AnalyticsType) {
        case 'category' : 
            summaryData = analyticsManager.getSeveritySummaryForCategory();
            break;

        case 'totalCheck' :
            summaryData = analyticsManager.getSeveritySummary();
            break;
    }

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
    var infoSummary;
    switch(AnalyticsType) {
        case 'category' : 
            infoSummary = analyticsManager.getInfoSummaryForCategory();
            break;

        case 'totalCheck' :
            infoSummary = analyticsManager.getInfoSummary();
            break;
    }

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

function HighlightButtonsOnBarChartClick() {
    document.getElementById('ID1').style.backgroundColor = "rgba(33,37,63,0)";
    document.getElementById('ID2').style.backgroundColor = "rgba(143, 144, 145, 1)";
    document.getElementById("SeverityChartButton").style.fill = "rgba(83, 84, 85, 1)";
    document.getElementById("InfoChartButton").style.fill = "rgba(255,255,255,1)";
}

function onBarChartsClick() {
    BarChartActive = true;
    PieChartActive = false;
    ExecuteAnalyticsContextMenu(AnalyticsType);
    HighlightButtonsOnBarChartClick();  
}

function openComplianceOverlay() {
    document.getElementById("ID2_A1_Group_21").style.backgroundColor = "rgba(143, 144, 145, 1)";
    document.getElementById("ID1_A1_Group_22").style.backgroundColor = "rgba(33,37,63,0)";
    var overlay = document.getElementById("Compliance_DataSet_Selection");
    overlay.style.display="block";
}

function HighLightButtonsOnPieChartClick() {
    document.getElementById('ID2').style.backgroundColor = "rgba(33,37,63,0)";
    document.getElementById('ID1').style.backgroundColor = "rgba(143, 144, 145, 1)";
    document.getElementById("SeverityChartButton").style.fill = "rgba(83, 84, 85, 1)";
    document.getElementById("InfoChartButton").style.fill = "rgba(83, 84, 85, 1)";
}

function onPieChartsClick() {
    PieChartActive = true;
    BarChartActive = false;

    ExecuteAnalyticsContextMenu(AnalyticsType);
    HighLightButtonsOnPieChartClick();    
}

function openChartComparison() {
    activeResultType = "comparison";
    
    document.getElementById("ID2_A1_Group_21").style.backgroundColor = "rgba(33,37,63,0)";
    document.getElementById("ID1_A1_Group_22").style.backgroundColor = "rgba(143, 144, 145, 1)";

    analyticsManager.populateComparisonAnalytics();
}

function OpenComplianceChart(resultType) {
    activeResultType = resultType;
    document.getElementById("ID2_A1_Group_21").style.backgroundColor = "rgba(143, 144, 145, 1)";
    document.getElementById("ID1_A1_Group_22").style.backgroundColor = "rgba(33,37,63,0)";
    analyticsManager.populateComplianceAnalytics(activeResultType);
}

function OnSeverityChartsClicked() {
    SeveritybuttonActive = true;
    InfoButtonActive = false;

    var SeverityChartButton = document.getElementById("SeverityChartButton");
    SeverityChartButton.style.fill = "rgba(83, 84, 85, 1)";

    var InfoChartButton = document.getElementById("InfoChartButton");
    InfoChartButton.style.fill = "rgba(255,255,255,1)";

    ExecuteAnalyticsContextMenu(AnalyticsType);
}

function OnInfoChartsClicked() {
    SeveritybuttonActive = false;
    InfoButtonActive = true;

    var SeverityChartButton = document.getElementById("SeverityChartButton");
    SeverityChartButton.style.fill = "rgba(255,72,71,1)";

    var InfoChartButton = document.getElementById("InfoChartButton");
    InfoChartButton.style.fill = "rgba(83, 84, 85, 1)";

    ExecuteAnalyticsContextMenu(AnalyticsType);
}