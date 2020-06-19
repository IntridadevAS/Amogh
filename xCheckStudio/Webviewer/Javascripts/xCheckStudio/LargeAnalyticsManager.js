function LargeAnalyticsManager(analyticsData) {
    this.AnalyticsData = analyticsData;
}

LargeAnalyticsManager.prototype.populateComparisonCharts = function () {

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

    // var sourceANotSelectedComponents;
    // var sourceBNotSelectedComponents;

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

    // if ("SourceANotSelectedComps" in comparisonData) {
    //     sourceANotSelectedComponents = comparisonData["SourceANotSelectedComps"];
    // }

    // if ("SourceBNotSelectedComps" in comparisonData) {
    //     sourceBNotSelectedComponents = comparisonData["SourceBNotSelectedComps"];
    // }

    // if ("SourceCNotSelectedComps" in comparisonData) {
    //     sourceCNotSelectedComponents = comparisonData["SourceCNotSelectedComps"];
    // }

    // if ("SourceDNotSelectedComps" in comparisonData) {
    //     sourceDNotSelectedComponents = comparisonData["SourceDNotSelectedComps"];
    // }
 
    totalItemsLoaded = sourceATotalComponentsCount + 
    sourceBTotalComponentsCount + 
    sourceCTotalComponentsCount + 
    sourceDTotalComponentsCount;
    totalItemsNotChecked = comparisonData["sourceANotChecked"] +
        comparisonData["sourceBNotChecked"] +
        comparisonData["sourceCNotChecked"] +
        comparisonData["sourceDNotChecked"];
    totalItemsChecked = totalItemsLoaded - totalItemsNotChecked;

    this.AnalyticsData[activeResultType]['TotalItemsChecked'] = totalItemsChecked;
    this.AnalyticsData[activeResultType]['TotalItemsLoaded'] = totalItemsLoaded;
    this.AnalyticsData[activeResultType]['TotalItemsNotChecked'] = totalItemsNotChecked;
    this.AnalyticsData[activeResultType]['OKATCount'] = Number(okACount) + Number(okTCount) + Number(OkATCount);

    //add data to summary
    if(SeveritybuttonActive) {
        this.setSeveritySummary();
    }
    else if(InfoButtonActive) {
        this.setInfoSummary();
    }
        
    // draw pie charts
    var totalOk = okCount + okACount + okTCount + OkATCount;
    if(PieChartActive) {
        if(SeveritybuttonActive) {
            this.drawComparisonSeverityPieCharts(totalOk,
                warningsCount,
                errorsCount,
                totalItemsChecked);
        }
        else if(InfoButtonActive) {
            this.drawComparisonInfoPieCharts(noMatchCount,
                undefinedCount,
                totalItemsNotChecked,
                totalItemsLoaded);
        } 
    }

    // //  draw bar chart (total 1)
    if(BarChartActive) {
        if(SeveritybuttonActive) {
            this.createSeverityBarCharts(checkGroupsInfo);
        }
        else if(InfoButtonActive) {
            this.createInfoBarCharts(checkGroupsInfo);
        }               
    }

    comparisonData['Versioning']["CurrentCheck"] = {'OK' : totalOk, 'Error' : errorsCount, 'Warning' : warningsCount};

    this.drawLineChart(comparisonData['Versioning']);
}

LargeAnalyticsManager.prototype.populateComplianceCharts = function (complianceType) {

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

    //add data to summary
    if (SeveritybuttonActive) {
        this.setSeveritySummary();
    }
    else if (InfoButtonActive) {
        this.setInfoSummary();
    }

    // draw pie charts
    var totalOk = okCount + okACount + okTCount + OkATCount;
    if (PieChartActive) {
        // _this.ShowPieChartDiv();
        if (SeveritybuttonActive) {
            this.drawComparisonSeverityPieCharts(totalOk,
                warningsCount,
                errorsCount,
                totalItemsChecked);
        }
        else if (InfoButtonActive) {
            this.drawComparisonInfoPieCharts(noMatchCount,
                undefinedCount,
                totalItemsNotChecked,
                totalItemsLoaded);
        }
    }

    // //  draw bar chart (total 1)
    if (BarChartActive) {
        // _this.ShowBarChartDiv();
        if (SeveritybuttonActive) {
            this.createSeverityBarCharts(checkGroupsInfo);
        }
        else if (InfoButtonActive) {
            this.createInfoBarCharts(checkGroupsInfo);
        }
    }

    complianceData['Versioning']["CurrentCheck"] = {'OK' : totalOk, 'Error' : errorsCount, 'Warning' : warningsCount};
    this.drawLineChart(complianceData['Versioning']);

}

LargeAnalyticsManager.prototype.createSeverityBarCharts = function(checkGroupsInfo) {

    var _this = this;
    
    var Severitydata = [];
    for(key in checkGroupsInfo) {
        var dataObject = {}
        dataObject["Category"] = key;
        dataObject["Error"] = parseInt(checkGroupsInfo[key]["Error"]);
        dataObject["Warning"] = parseInt(checkGroupsInfo[key]["Warning"]);
        dataObject["OK"] = parseInt(checkGroupsInfo[key]["OK"]);
        Severitydata.push(dataObject);
    }
   
    var colorsArray = ["#F43742", "#F8C13B", "#0FFF72"];

    $("#BarCharts").dxChart({
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
                wordWrap: "normal",
                textOverflow: 'ellipsis',
                displayMode: 'stagger'
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

LargeAnalyticsManager.prototype.createInfoBarCharts = function(checkGroupsInfo) {
    var _this = this;

    var Infodata = []
    for(key in checkGroupsInfo) {
        var dataObject = {}
        dataObject["Category"] = key;
        dataObject["No Match"] = parseInt(checkGroupsInfo[key]["No Match"]);
        dataObject["undefined"] = parseInt(checkGroupsInfo[key]["undefined Item"]);
        Infodata.push(dataObject);
    }

    var colorsArray = ["#dddbff", "#e7d7fa"]
    $("#BarCharts").dxChart({
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
                wordWrap: "normal",
                textOverflow: 'ellipsis',
                displayMode: 'stagger'
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

LargeAnalyticsManager.prototype.drawComparisonSeverityPieCharts = function (okCount,
    warningsCount,
    errorsCount,
    totalItemsChecked) {

    // if(this.Container == "AnalyticsContainer") {
        // draw pie chart for Errors 
        var colorsArray = ["#F43742", "#EDEDED"];
        this.drawPieChart("Error",
            errorsCount,
            totalItemsChecked,
            '#errorPie',
            colorsArray,
            "ID40_");
        document.getElementById("Errors").innerHTML = "Errors";
        document.getElementById("Errors").style.color = colorsArray[0];

        // draw pie chart for Warnings
        colorsArray = ["#F8C13B", "#EDEDED"];
        this.drawPieChart("Warning",
            warningsCount,
            totalItemsChecked,
            '#warningPie',
            colorsArray,
            'ID30_');
        document.getElementById("Warnings").innerHTML = "Warnings";
        document.getElementById("Warnings").style.color = colorsArray[0];

        // draw pie chart for Oks
        colorsArray = ["#0FFF72", "#EDEDED"];
        this.drawPieChart("OK",
            okCount,
            totalItemsChecked,
            '#okPie',
            colorsArray,
            'ID10_');
        document.getElementById("OK").innerHTML = "OK";
        document.getElementById("OK").style.color = colorsArray[0];
    // }
    // else if(this.Container == "MaximizedAnalytics") {

    // }
    
}

LargeAnalyticsManager.prototype.drawComparisonInfoPieCharts = function(noMatchCount,
    undefinedCount,
    totalItemsNotChecked,
    totalItemsLoaded) {
    // draw pie chart for not checked
    colorsArray = ["#0febee", "#EDEDED"];
    this.drawPieChart("Not Checked",
        totalItemsNotChecked,
        totalItemsLoaded,
        '#errorPie',
        colorsArray,
        'ID40_');
    document.getElementById("Errors").innerHTML = "Not Checked";
    document.getElementById("Errors").style.color = colorsArray[0];

    // draw pie chart for No Match
    var colorsArray = ["#0febee", "#EDEDED"];
    this.drawPieChart("No Match",
        noMatchCount,
        (totalItemsLoaded - totalItemsNotChecked),
        '#warningPie',
        colorsArray,
        'ID30_');
    document.getElementById("Warnings").innerHTML = "No Match";
    document.getElementById("Warnings").style.color = colorsArray[0];

    // draw pie chart for Undefined
    colorsArray = ["#0febee", "#EDEDED"];
    this.drawPieChart("Undefined",
        undefinedCount,
        (totalItemsLoaded - totalItemsNotChecked),
        '#okPie',
        colorsArray,
        'ID10_');
    document.getElementById("OK").innerHTML = "Undefined";
    document.getElementById("OK").style.color = colorsArray[0];
}

LargeAnalyticsManager.prototype.drawPieChart = function (mainChartItem,
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
            innerRadius: 1,
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
    errorDiv.style.color = colorsArray[0];
    errorDiv.innerHTML = "";
    errorDiv.innerHTML = fixedPercent + "%";
}

LargeAnalyticsManager.prototype.setSeveritySummary = function() {
    var totalItemsChecked = this.AnalyticsData[activeResultType]['TotalItemsChecked'];
    var ErrorsCount = this.AnalyticsData[activeResultType]['errorCount'];
    var OKCount = this.AnalyticsData[activeResultType]["okCount"];
    var WarningsCount = this.AnalyticsData[activeResultType]["warningCount"];
    var OKATCount = this.AnalyticsData[activeResultType]['OKATCount'];

    document.getElementById("ID37").innerHTML =  totalItemsChecked;
    document.getElementById("ID18").innerHTML =  ErrorsCount
    document.getElementById("ID6_A3_Text_49").innerHTML = OKCount;
    document.getElementById("ID13").innerHTML =  WarningsCount;    
    document.getElementById("ID37_A3_Text_50").innerHTML = Number(ErrorsCount) + Number(OKCount) + Number(WarningsCount);
    document.getElementById("ID6").innerHTML = OKATCount;
}

LargeAnalyticsManager.prototype.setInfoSummary = function(checkType) {

        document.getElementById("checkedItemCount").innerHTML =  this.AnalyticsData[activeResultType]['TotalItemsLoaded'];

        if(this.AnalyticsData[activeResultType]["nomatchCount"]) {
            document.getElementById("count_no_match").innerHTML =  this.AnalyticsData[activeResultType]["nomatchCount"];
        }
        else {
            document.getElementById("count_no_match").innerHTML = 0;
        }

        document.getElementById("count_undefined").innerHTML = this.AnalyticsData[activeResultType]["undefinedCount"];
        document.getElementById("ID37_A3_Text_12_1").innerHTML =  this.AnalyticsData[activeResultType]['TotalItemsNotChecked'];
}

LargeAnalyticsManager.prototype.drawLineChart =  function(checkGroupsInfo) {

    var _this = this;
    
    var Severitydata = [];

    var dataObject = {}
    dataObject["Version"] = 'Start';
    dataObject["Error"] = 0;
    dataObject["Warning"] = 0;
    dataObject["OK"] = 0;

    Severitydata.push(dataObject);

    for(key in checkGroupsInfo) {
        var dataObject = {}
        dataObject["Version"] = key;
        dataObject["Error"] = parseInt(checkGroupsInfo[key]["Error"]);
        dataObject["Warning"] = parseInt(checkGroupsInfo[key]["Warning"]);
        dataObject["OK"] = parseInt(checkGroupsInfo[key]["OK"]);
        Severitydata.push(dataObject);
    }
   
    var colorsArray = ["#F43742", "#F8C13B", "#0FFF72"];
    if(document.getElementById("line_charts").innerHTML.trim() != "") {
        $("#line_charts").dxChart("dispose");
    }
    $("#line_charts").dxChart({
        palette: colorsArray,
        dataSource: Severitydata,
        commonSeriesSettings: {
            argumentField: "Version",
            type: "line"
        },
        margin: {
            bottom: 20
        },
        argumentAxis: {
            valueMarginsEnabled: false,
            discreteAxisDivisionMode: "crossLabels",
            grid: {
                visible: false
            }
        },
        series: [
            { valueField: "Error", name: "Error" },
            { valueField: "Warning", name: "Warning" },
            { valueField: "OK", name: "OK" }
        ],
        legend: {
            visible: false
        },
        title: { 
            text: " ",
        },
        tooltip: {
            enabled: true,
            customizeTooltip: function (arg) {
                return {
                    text: arg.valueText
                };
            }
        }
    })
}