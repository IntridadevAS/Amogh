function SmallAnalyticsManager(analyticsData) {
    this.AnalyticsData = analyticsData;
}

SmallAnalyticsManager.prototype.populateComparisonAnalytics = function () {

    var comparisonData = this.AnalyticsData[activeResultType];

    var totalItemsChecked = 0;
    var errorsCount = 0;
    var warningsCount = 0;
    var okCount = 0;
    var okACount = 0;
    var okTCount = 0;
    var OkATCount = 0;
    var noMatchCount = 0;
    var undefinedCount = 0;
    var sourceASelectedCount = 0;
    var sourceBSelectedCount = 0;
    var sourceCSelectedCount = 0;
    var sourceDSelectedCount = 0;
    var sourceATotalComponentsCount = 0;
    var sourceBTotalComponentsCount = 0;
    var sourceCTotalComponentsCount = 0;
    var sourceDTotalComponentsCount = 0;
    var checkGroupsInfo = 0;

    var sourceANotSelectedComponents;
    var sourceBNotSelectedComponents;

    if ("okCount" in comparisonData) {
        okCount = parseInt(comparisonData["okCount"]);
    }

    if ("okACount" in comparisonData) {
        okACount = parseInt(comparisonData["okACount"]);
    }

    if ("okTCount" in comparisonData) {
        okTCount = parseInt(comparisonData["okTCount"]);
    }

    if ("okATCount" in comparisonData) {
        OkATCount = parseInt(comparisonData["okATCount"]);
    }

    if ("errorCount" in comparisonData) {
        errorsCount = parseInt(comparisonData["errorCount"]);
    }

    if ("warningCount" in comparisonData) {
        warningsCount = parseInt(comparisonData["warningCount"]);
    }

    if ("nomatchCount" in comparisonData) {
        noMatchCount = parseInt(comparisonData["nomatchCount"]);
    }

    if ("undefinedCount" in comparisonData) {
        undefinedCount = parseInt(comparisonData["undefinedCount"]);
    }

    if ("sourceASelectedCount" in comparisonData) {
        sourceASelectedCount = parseInt(comparisonData["sourceASelectedCount"]);
    }

    if ("sourceBSelectedCount" in comparisonData) {
        sourceBSelectedCount = parseInt(comparisonData["sourceBSelectedCount"]);
    }

    if ("sourceCSelectedCount" in comparisonData) {
        sourceCSelectedCount = parseInt(comparisonData["sourceCSelectedCount"]);
    }

    if ("sourceDSelectedCount" in comparisonData) {
        sourceDSelectedCount = parseInt(comparisonData["sourceDSelectedCount"]);
    }

    if ("sourceATotalComponentsCount" in comparisonData) {
        sourceATotalComponentsCount = parseInt(comparisonData["sourceATotalComponentsCount"]);
    }

    if ("sourceBTotalComponentsCount" in comparisonData) {
        sourceBTotalComponentsCount = parseInt(comparisonData["sourceBTotalComponentsCount"]);
    }

    if ("sourceCTotalComponentsCount" in comparisonData) {
        sourceCTotalComponentsCount = parseInt(comparisonData["sourceCTotalComponentsCount"]);
    }

    if ("sourceDTotalComponentsCount" in comparisonData) {
        sourceDTotalComponentsCount = parseInt(comparisonData["sourceDTotalComponentsCount"]);
    }

    if ("CheckGroupsInfo" in comparisonData) {
        checkGroupsInfo = comparisonData["CheckGroupsInfo"];
    }

    if ("SourceANotSelectedComps" in comparisonData) {
        sourceANotSelectedComponents = comparisonData["SourceANotSelectedComps"];
    }

    if ("SourceBNotSelectedComps" in comparisonData) {
        sourceBNotSelectedComponents = comparisonData["SourceBNotSelectedComps"];
    }

    if ("SourceCNotSelectedComps" in comparisonData) {
        sourceCNotSelectedComponents = comparisonData["SourceCNotSelectedComps"];
    }

    if ("SourceDNotSelectedComps" in comparisonData) {
        sourceDNotSelectedComponents = comparisonData["SourceDNotSelectedComps"];
    }

    totalItemsChecked = sourceASelectedCount + sourceBSelectedCount + sourceCSelectedCount + sourceDSelectedCount;
    totalItemsLoaded = sourceATotalComponentsCount + sourceBTotalComponentsCount + sourceCTotalComponentsCount + sourceDTotalComponentsCount;
    totalItemsNotChecked = totalItemsLoaded - totalItemsChecked;

    this.AnalyticsData[activeResultType]['TotalItemsChecked'] = totalItemsChecked;
    this.AnalyticsData[activeResultType]['TotalItemsLoaded'] = totalItemsLoaded;
    this.AnalyticsData[activeResultType]['TotalItemsNotChecked'] = totalItemsNotChecked;
    this.AnalyticsData[activeResultType]['OKATCount'] = Number(okACount) + Number(okTCount) + Number(OkATCount);

    if (PieChartActive) {
        this.ShowPieChartDiv();
        this.drawComparisonPieCharts(okCount,
            warningsCount,
            errorsCount,
            noMatchCount,
            undefinedCount,
            totalItemsNotChecked,
            totalItemsChecked,
            totalItemsLoaded);
    }

    // //  draw bar chart (total 1)
    if (BarChartActive) {
        this.ShowBarChartDiv();
        if (SeveritybuttonActive) {
            this.createSeverityBarCharts(checkGroupsInfo);
        }
        else if (InfoButtonActive) {
            this.CreateInfoBarCharts(checkGroupsInfo);
        }
    }

}

SmallAnalyticsManager.prototype.populateComplianceAnalytics = function (complianceType) {

    var complianceData = this.AnalyticsData[complianceType];

    var totalItemsChecked = 0;
    var errorsCount = 0;
    var warningsCount = 0;
    var okCount = 0;
    var undefinedCount = 0;
    var noMatchCount = 0;
    var okACount = 0;
    var okTCount = 0;
    var OkATCount = 0;
    var sourceSelectedCount = 0;
    var sourceTotalComponentsCount = 0;
    var checkGroupsInfo = 0;

    var sourceNotSelectedComponents;

    if ("okCount" in complianceData) {
        okCount = parseInt(complianceData["okCount"]);
    }

    if ("okACount" in complianceData) {
        okACount = parseInt(complianceData["okACount"]);
    }

    if ("okTCount" in complianceData) {
        okTCount = parseInt(complianceData["okTCount"]);
    }

    if ("okATCount" in complianceData) {
        OkATCount = parseInt(complianceData["okATCount"]);
    }

    if ("errorCount" in complianceData) {
        errorsCount = parseInt(complianceData["errorCount"]);
    }

    if ("warningCount" in complianceData) {
        warningsCount = parseInt(complianceData["warningCount"]);
    }

    if ("undefinedCount" in complianceData) {
        undefinedCount = parseInt(complianceData["undefinedCount"]);
    }

    if ("sourceSelectedCount" in complianceData) {
        sourceSelectedCount = parseInt(complianceData["sourceSelectedCount"]);
    }

    if ("sourceTotalComponentsCount" in complianceData) {
        sourceTotalComponentsCount = parseInt(complianceData["sourceTotalComponentsCount"]);
    }

    if ("CheckGroupsInfo" in complianceData) {
        checkGroupsInfo = complianceData["CheckGroupsInfo"];
    }

    if ("SourceNotSelectedComps" in complianceData) {
        sourceNotSelectedComponents = complianceData["SourceNotSelectedComps"];
    }

    totalItemsChecked = sourceSelectedCount;

    var sourceNotSelectedComps = sourceTotalComponentsCount - totalItemsChecked;
    var OKATCount = Number(okACount) + Number(okTCount) + Number(OkATCount);

    this.AnalyticsData[complianceType]['TotalItemsChecked'] = totalItemsChecked;
    this.AnalyticsData[complianceType]['TotalItemsNotChecked'] = sourceNotSelectedComps;
    this.AnalyticsData[complianceType]['TotalItemsLoaded'] = sourceTotalComponentsCount;
    this.AnalyticsData[complianceType]['OKATCount'] = OKATCount;



    // draw pie charts
    if (PieChartActive) {
        this.ShowPieChartDiv();
        this.drawCompliancePieCharts(okCount,
            warningsCount,
            errorsCount,
            noMatchCount,
            undefinedCount,
            sourceNotSelectedComps,
            totalItemsChecked,
            sourceTotalComponentsCount);
    }

    if (BarChartActive) {
        this.ShowBarChartDiv();
        if (SeveritybuttonActive) {
            this.createSeverityBarCharts(checkGroupsInfo);
        }
        else if (InfoButtonActive) {
            this.CreateInfoBarCharts(checkGroupsInfo);
        }
    }

}

SmallAnalyticsManager.prototype.ShowPieChartDiv = function () {
    var left = document.getElementById("left");
    left.style.display = "block";
    var right = document.getElementById("right");
    right.style.display = "block";
    var bar = document.getElementById("BarChart");
    bar.style.display = "none";
}

SmallAnalyticsManager.prototype.ShowBarChartDiv = function () {
    var bar = document.getElementById("BarChart");
    bar.style.display = "block";
    var left = document.getElementById("left");
    left.style.display = "none";
    var right = document.getElementById("right");
    right.style.display = "none";
}

SmallAnalyticsManager.prototype.drawCompliancePieCharts = function (okCount,
    warningsCount,
    errorsCount,
    noMatchCount,
    undefinedCount,
    totalItemsNotChecked,
    totalItemsChecked,
    totalItemsLoaded) {

    // draw pie chart for Errors 
    var colorsArray = ["#F43742", "#EDEDED"];
    this.drawPieChart("Error",
        errorsCount,
        totalItemsChecked,
        '#baseError',
        colorsArray,
        "errorPercentage");

    // draw pie chart for Warnings
    colorsArray = ["#F8C13B", "#EDEDED"];
    this.drawPieChart("Warning",
        warningsCount,
        totalItemsChecked,
        '#baseWarning',
        colorsArray,
        'warningPercentage');

    // draw pie chart for No Match
    var colorsArray = ["#0febee", "#EDEDED"];
    this.drawPieChart("No Match",
        noMatchCount,
        totalItemsLoaded,
        '#baseNoMatch',
        colorsArray,
        'noMatchPercentage');

    // draw pie chart for Oks
    colorsArray = ["#0FFF72", "#EDEDED"];
    this.drawPieChart("OK",
        okCount,
        totalItemsChecked,
        '#baseOk',
        colorsArray,
        'okPercentage');

    // draw pie chart for not checked
    colorsArray = ["#0febee", "#EDEDED"];
    this.drawPieChart("Not Checked",
        totalItemsNotChecked,
        totalItemsLoaded,
        '#baseNotChecked',
        colorsArray,
        'notCheckedPercentage');

    // draw pie chart for Undefined
    colorsArray = ["#0febee", "#EDEDED"];
    this.drawPieChart("Undefined",
        undefinedCount,
        totalItemsLoaded,
        '#baseUndefined',
        colorsArray,
        'undefinedPercentage');

}

SmallAnalyticsManager.prototype.drawComparisonPieCharts = function (okCount,
    warningsCount,
    errorsCount,
    noMatchCount,
    undefinedCount,
    totalItemsNotChecked,
    totalItemsChecked,
    totalItemsLoaded) {

    // if(this.Container == "AnalyticsContainer") {
    // draw pie chart for Errors 
    var colorsArray = ["#F43742", "#EDEDED"];
    this.drawPieChart("Error",
        errorsCount,
        totalItemsChecked,
        '#baseError',
        colorsArray,
        "errorPercentage");

    // draw pie chart for Warnings
    colorsArray = ["#F8C13B", "#EDEDED"];
    this.drawPieChart("Warning",
        warningsCount,
        totalItemsChecked,
        '#baseWarning',
        colorsArray,
        'warningPercentage');

    // draw pie chart for Oks
    colorsArray = ["#0FFF72", "#EDEDED"];
    this.drawPieChart("OK",
        okCount,
        totalItemsChecked,
        '#baseOk',
        colorsArray,
        'okPercentage');

    // draw pie chart for not checked
    colorsArray = ["#0febee", "#EDEDED"];
    this.drawPieChart("Not Checked",
        totalItemsNotChecked,
        totalItemsLoaded,
        '#baseNotChecked',
        colorsArray,
        'notCheckedPercentage');

    // draw pie chart for No Match
    var colorsArray = ["#0febee", "#EDEDED"];
    this.drawPieChart("No Match",
        noMatchCount,
        totalItemsLoaded,
        '#baseNoMatch',
        colorsArray,
        'noMatchPercentage');

    // draw pie chart for Undefined
    colorsArray = ["#0febee", "#EDEDED"];
    this.drawPieChart("Undefined",
        undefinedCount,
        totalItemsLoaded,
        '#baseUndefined',
        colorsArray,
        'undefinedPercentage');
    // }
    // else if(this.Container == "MaximizedAnalytics") {

    // }

}

SmallAnalyticsManager.prototype.drawPieChart = function (mainChartItem,
    itemCount,
    totalItemCount,
    chartDiv,
    colorsArray,
    percentageDiv) {

    var data = []

    data = [
        { "SeverityName": mainChartItem, "val": itemCount },
        { "SeverityName": "Other", "val": totalItemCount - itemCount },
    ];

    $(chartDiv).dxPieChart({
        type: "doughnut",
        palette: colorsArray,
        dataSource: data,
        startAngle: 90,
        innerRadius: 0.8,
        tooltip: {
            enabled: true,
            customizeTooltip: function (arg) {
                var percent = arg.percent * 100;
                var percentText = percent.toFixed(2);

                return {
                    text: arg.argumentText + " : " + percentText + "%"
                };
            }
        },
        legend: {
            visible: false
        },
        series: [{
            argumentField: "SeverityName",
            showInLegend: false
        }]
    });

    //  this.CreateSeverityTextDivs();
    var percent = itemCount * 100 / totalItemCount;
    var fixedPercent = parseFloat((percent).toFixed(1));

    var errorDiv = document.getElementById(percentageDiv);
    errorDiv.innerHTML = "";
    errorDiv.innerHTML = fixedPercent + "%";
}

SmallAnalyticsManager.prototype.getSeveritySummary = function () {

    var TotalItemsChecked = 0;
    var TotalItemsMatched = 0;
    var ErrorsCount = 0;
    var OKCount = 0;
    var WarningsCount = 0;
    var OkATCount = 0;

    TotalItemsChecked = this.AnalyticsData[activeResultType]['TotalItemsChecked'];
    ErrorsCount = this.AnalyticsData[activeResultType]['errorCount'];
    OKCount = this.AnalyticsData[activeResultType]["okCount"];
    WarningsCount = this.AnalyticsData[activeResultType]["warningCount"];
    TotalItemsMatched = Number(ErrorsCount) + Number(OKCount) + Number(WarningsCount);
    OkATCount = this.AnalyticsData[activeResultType]['OKATCount'];

    return {
        "TotalItemsChecked": TotalItemsChecked, "ErrorsCount": ErrorsCount, "OKCount": OKCount,
        "WarningCount": WarningsCount, "TotalItemsMatched": TotalItemsMatched, "oKATCount": OkATCount
    }
}

SmallAnalyticsManager.prototype.getInfoSummary = function (checkType) {

    var TotalItemsLoaded = 0;
    var TotalItemsNotChecked = 0;
    var noMatchCount = 0;
    var undefinedCount = 0;

    TotalItemsLoaded = this.AnalyticsData[activeResultType]['TotalItemsLoaded'];
    TotalItemsNotChecked = this.AnalyticsData[activeResultType]['TotalItemsNotChecked'];
    if(this.AnalyticsData[activeResultType]["nomatchCount"])
        noMatchCount = this.AnalyticsData[activeResultType]["nomatchCount"];
    undefinedCount = this.AnalyticsData[activeResultType]["undefinedCount"];

    return {
        "TotalItemsLoaded": TotalItemsLoaded, "TotalItemsNotChecked": TotalItemsNotChecked, "noMatchCount": noMatchCount,
        "undefinedCount": undefinedCount
    }
}

SmallAnalyticsManager.prototype.createSeverityBarCharts = function (checkGroupsInfo) {

    var _this = this;

    var Severitydata = [];
    for (key in checkGroupsInfo) {
        var dataObject = {}
        dataObject["Category"] = key;
        dataObject["Error"] = parseInt(checkGroupsInfo[key]["Error"]);
        dataObject["Warning"] = parseInt(checkGroupsInfo[key]["Warning"]);
        dataObject["OK"] = parseInt(checkGroupsInfo[key]["OK"]);
        Severitydata.push(dataObject);
    }

    var colorsArray = ["#F43742", "#F8C13B", "#0FFF72"];

    $("#BarChart").dxChart({
        dataSource: Severitydata,
        palette: colorsArray,
        commonSeriesSettings: {
            argumentField: "Category",
            type: "stackedBar"
        },
        series: [
            { valueField: "Error", name: "Error" },
            { valueField: "Warning", name: "Warning" },
            { valueField: "OK", name: "OK" }
        ],
        legend: {
            visible: false
        },
        argumentAxis: {
            label: {
                wordWrap: "Wrap",
                overlappingBehavior: "stagger"
            }
        },
        valueAxis: {
            title: {
                text: " "
            },
            position: "left"
        },
        tooltip: {
            enabled: true,
            location: "edge",
            customizeTooltip: function (arg) {
                return {
                    text: arg.argumentText
                };
            }
        }
    });
}

SmallAnalyticsManager.prototype.CreateInfoBarCharts = function (checkGroupsInfo) {
    var _this = this;

    var Infodata = []
    for (key in checkGroupsInfo) {
        var dataObject = {}
        dataObject["Category"] = key;
        dataObject["No Match"] = parseInt(checkGroupsInfo[key]["No Match"]);
        dataObject["undefined"] = parseInt(checkGroupsInfo[key]["undefined Item"]);
        Infodata.push(dataObject);
    }

    var colorsArray = ["#dddbff", "#e7d7fa"]
    $("#BarChart").dxChart({
        dataSource: Infodata,
        palette: colorsArray,
        commonSeriesSettings: {
            argumentField: "Category",
            type: "stackedBar"
        },
        series: [
            { valueField: "No Match", name: "No Match" },
            { valueField: "undefined", name: "undefined" }
        ],
        legend: {
            visible: false
        },
        argumentAxis: {
            label: {
                wordWrap: "Wrap",
                overlappingBehavior: "stagger"
            }
        },
        valueAxis: {
            title: {
                text: " "
            },
            position: "left"
        },
        tooltip: {
            enabled: true,
            location: "edge",
            customizeTooltip: function (arg) {
                return {
                    text: arg.argumentText
                };
            }
        }
    });
}