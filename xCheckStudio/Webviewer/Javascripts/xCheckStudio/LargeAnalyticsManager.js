function LargeAnalyticsManager() {

    this.ComparisonTotalItemsChecked = 0;
    this.ComparisonErrorsCount = 0;
    this.ComparisonOKCount = 0;
    this.ComparisonWarningsCount = 0;
    this.ComparisonTotalItemsCount = 0;
    this.ComparisonTotalItemsNotChecked = 0;
    this.ComparisonNoMatchCount = 0;
    this.ComparisonUndefinedCount = 0;
    this.ComparisonOKATCount = 0;
    this.TotalItemsLoaded = 0;

    this.SourceAComplianceTotalItemsChecked = 0;
    this.SourceAComplianceErrorsCount = 0;
    this.SourceAComplianceOKCount = 0;
    this.SourceAComplianceWarningsCount = 0;
    this.SourceAComplianceUndefinedCount = 0;
    this.SourceAComplianceTotalItemsLoaded = 0;
    this.SourceANotSelectedComps = 0;
    this.SourceATotalItemsLoaded = 0;
    this.SourceAOKATCount = 0;

    this.SourceBComplianceTotalItemsChecked = 0;
    this.SourceBComplianceErrorsCount = 0;
    this.SourceBComplianceOKCount = 0;
    this.SourceBComplianceWarningsCount = 0;
    this.SourceBComplianceUndefinedCount = 0;
    this.SourceBComplianceTotalItemsLoaded = 0;
    this.SourceBNotSelectedComps = 0;
    this.SourceBTotalItemsLoaded = 0
    this.SourceBOKATCount = 0;
}

LargeAnalyticsManager.prototype.populateLargeAnalyticsComparisonCharts = function () {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    var _this = this;
    $.ajax({
        url: 'PHP/AnalyticsDataReader.php',
        type: "POST",
        async: true,
        data: { 
            'CheckType': 'Comparison',
            'ProjectName': projectinfo.projectname,
            'CheckName': checkinfo.checkname
        },
        success: function (msg) {
            if (msg != 'fail') {
                var checkResults = JSON.parse(msg);


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
                var sourceATotalComponentsCount = 0;
                var sourceBTotalComponentsCount = 0;
                var checkGroupsInfo = 0;

                var sourceANotSelectedComponents;
                var sourceBNotSelectedComponents;

                if ("okCount" in checkResults) {
                    okCount = parseInt(checkResults["okCount"]);
                }

                if ("okACount" in checkResults) {
                    okACount = parseInt(checkResults["okACount"]);
                }

                if ("okTCount" in checkResults) {
                    okTCount = parseInt(checkResults["okTCount"]);
                }

                if ("okATCount" in checkResults) {
                    OkATCount = parseInt(checkResults["okATCount"]);
                }

                if ("errorCount" in checkResults) {
                    errorsCount = parseInt(checkResults["errorCount"]);
                }

                if ("warningCount" in checkResults) {
                    warningsCount = parseInt(checkResults["warningCount"]);
                }

                if ("nomatchCount" in checkResults) {
                    noMatchCount = parseInt(checkResults["nomatchCount"]);
                }

                if ("undefinedCount" in checkResults) {
                    undefinedCount = parseInt(checkResults["undefinedCount"]);
                }

                if ("sourceASelectedCount" in checkResults) {
                    sourceASelectedCount = parseInt(checkResults["sourceASelectedCount"]);
                }

                if ("sourceBSelectedCount" in checkResults) {
                    sourceBSelectedCount = parseInt(checkResults["sourceBSelectedCount"]);
                }

                if ("sourceATotalComponentsCount" in checkResults) {
                    sourceATotalComponentsCount = parseInt(checkResults["sourceATotalComponentsCount"]);
                }

                if ("sourceBTotalComponentsCount" in checkResults) {
                    sourceBTotalComponentsCount = parseInt(checkResults["sourceBTotalComponentsCount"]);
                }

                if ("CheckGroupsInfo" in checkResults) {
                    checkGroupsInfo = checkResults["CheckGroupsInfo"];
                }

                if ("SourceANotSelectedComps" in checkResults) {
                    sourceANotSelectedComponents = checkResults["SourceANotSelectedComps"];
                }

                if ("SourceBNotSelectedComps" in checkResults) {
                    sourceBNotSelectedComponents = checkResults["SourceBNotSelectedComps"];
                }
                totalItemsChecked = sourceASelectedCount + sourceBSelectedCount;
                totalItemsLoaded = sourceATotalComponentsCount + sourceBTotalComponentsCount
                totalItemsNotChecked = totalItemsLoaded - totalItemsChecked;
                _this.ComparisonOKATCount = okACount + okTCount + OkATCount;

                _this.ComparisonTotalItemsChecked = totalItemsChecked;
                _this.ComparisonErrorsCount = errorsCount;
                _this.ComparisonWarningsCount = warningsCount;
                _this.ComparisonOKCount = okCount;
                _this.TotalItemsLoaded = totalItemsLoaded;
                _this.ComparisonTotalItemsNotChecked = totalItemsNotChecked;
                _this.ComparisonNoMatchCount = noMatchCount;
                _this.ComparisonUndefinedCount = undefinedCount;

                 
                //add data to summary
                if(SeveritybuttonActive) {
                    _this.setSeveritySummary('Comparison');
                }
                else if(InfoButtonActive) {
                    _this.setInfoSummary('Comparison');
                }
                 
                // draw pie charts

                if(PieChartActive) {
                    // _this.ShowPieChartDiv();
                    if(SeveritybuttonActive) {
                        _this.drawComparisonSeverityPieCharts(okCount,
                            warningsCount,
                            errorsCount,
                            totalItemsChecked);
                    }
                    else if(InfoButtonActive) {
                        _this.drawComparisonInfoPieCharts(noMatchCount,
                            undefinedCount,
                            totalItemsNotChecked,
                            totalItemsLoaded);
                    } 
                }

                // //  draw bar chart (total 1)
                if(BarChartActive) {
                    // _this.ShowBarChartDiv();
                    if(SeveritybuttonActive) {
                        _this.createSeverityBarCharts(checkGroupsInfo);
                    }
                    else if(InfoButtonActive) {
                        _this.createInfoBarCharts(checkGroupsInfo);
                    }               
                }

                _this.drawLineChart(checkGroupsInfo);
            }
        }
    });
}

LargeAnalyticsManager.prototype.populateLargeAnalyticsComplianceACharts = function () {

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    var _this = this;
    $.ajax({
        url: 'PHP/AnalyticsDataReader.php',
        type: "POST",
        async: true,
        data: { 
            'CheckType': 'SourceACompliance',
            'ProjectName': projectinfo.projectname,
            'CheckName': checkinfo.checkname
        },
        success: function (msg) {
            if (msg != 'fail') {
                var checkResults = JSON.parse(msg);
                var totalItemsChecked = 0;
                var errorsCount = 0;
                var warningsCount = 0;
                var okCount = 0;
                var undefinedCount = 0;
                var noMatchCount = 0;
                var okACount = 0;
                var okTCount = 0;
                var OkATCount = 0;
                var sourceASelectedCount = 0;                  
                var sourceATotalComponentsCount = 0;                  
                var checkGroupsInfo = 0;

                var sourceANotSelectedComponents;

                if ("okCount" in checkResults) {
                    okCount = parseInt(checkResults["okCount"]);
                }

                if ("okACount" in checkResults) {
                    okACount = parseInt(checkResults["okACount"]);
                }

                if ("okTCount" in checkResults) {
                    okTCount = parseInt(checkResults["okTCount"]);
                }

                if ("okATCount" in checkResults) {
                    OkATCount = parseInt(checkResults["okATCount"]);
                }

                if ("errorCount" in checkResults) {
                    errorsCount = parseInt(checkResults["errorCount"]);
                }

                if ("warningCount" in checkResults) {
                    warningsCount = parseInt(checkResults["warningCount"]);
                }

                if ("undefinedCount" in checkResults) {
                    undefinedCount = parseInt(checkResults["undefinedCount"]);
                }

                if ("sourceASelectedCount" in checkResults) {
                    sourceASelectedCount = parseInt(checkResults["sourceASelectedCount"]);
                }                 

                if ("sourceATotalComponentsCount" in checkResults) {
                    sourceATotalComponentsCount = parseInt(checkResults["sourceATotalComponentsCount"]);
                }      
                
                if ("CheckGroupsInfo" in checkResults) {
                    checkGroupsInfo = checkResults["CheckGroupsInfo"];
                }

                if ("SourceANotSelectedComps" in checkResults) {
                    sourceANotSelectedComponents = checkResults["SourceANotSelectedComps"];
                }
               
                totalItemsChecked = sourceASelectedCount;                 

                _this.SourceAComplianceTotalItemsChecked = totalItemsChecked;
                _this.SourceAComplianceErrorsCount = errorsCount;
                _this.SourceAComplianceWarningsCount= warningsCount;
                _this.SourceAComplianceOKCount  = okCount;
                _this.SourceAComplianceUndefinedCount = undefinedCount;
                _this.SourceANotSelectedComps = sourceATotalComponentsCount - totalItemsChecked;
                _this.SourceATotalItemsLoaded = sourceATotalComponentsCount;
                _this.SourceAOKATCount = okACount + okTCount + OkATCount;


            //add data to summary
            if(SeveritybuttonActive) {
                _this.setSeveritySummary('complianceA');
            }
            else if(InfoButtonActive) {
                _this.setInfoSummary('complianceA');
            }
                            
            // draw pie charts

            if(PieChartActive) {
            // _this.ShowPieChartDiv();
                if(SeveritybuttonActive) {
                    _this.drawComparisonSeverityPieCharts(okCount,
                        warningsCount,
                        errorsCount,
                        totalItemsChecked);
                }
                else if(InfoButtonActive) {
                    _this.drawComparisonInfoPieCharts(noMatchCount,
                        undefinedCount,
                        _this.SourceANotSelectedComps,
                        totalItemsLoaded);
                } 
            }

            // //  draw bar chart (total 1)
            if(BarChartActive) {
                // _this.ShowBarChartDiv();
                if(SeveritybuttonActive) {
                    _this.createSeverityBarCharts(checkGroupsInfo);
                }
                else if(InfoButtonActive) {
                    _this.createInfoBarCharts(checkGroupsInfo);
                }               
            }

            _this.drawLineChart(checkGroupsInfo);

            }
        }
    });
}

LargeAnalyticsManager.prototype.populateLargeAnalyticsComplianceBCharts = function () {

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    var _this = this;
    $.ajax({
        url: 'PHP/AnalyticsDataReader.php',
        type: "POST",
        async: true,
        data: { 
            'CheckType': 'SourceBCompliance',
            'ProjectName': projectinfo.projectname,
            'CheckName': checkinfo.checkname
        },
        success: function (msg) {
            if (msg != 'fail') {
                var checkResults = JSON.parse(msg);
                var totalItemsChecked = 0;
                var errorsCount = 0;
                var warningsCount = 0;
                var okCount = 0;
                var noMatchCount = 0;
                var undefinedCount = 0;
                var okACount = 0;
                var okTCount = 0;
                var OkATCount = 0;
                var sourceBSelectedCount = 0;
                var checkGroupsInfo = 0;
                var sourceBTotalComponentsCount = 0;         
                var sourceBNotSelectedComponents = 0;

                if ("okCount" in checkResults) {
                    okCount = parseInt(checkResults["okCount"]);
                }

                if ("okACount" in checkResults) {
                    okACount = parseInt(checkResults["okACount"]);
                }

                if ("okTCount" in checkResults) {
                    okTCount = parseInt(checkResults["okTCount"]);
                }

                if ("okATCount" in checkResults) {
                    OkATCount = parseInt(checkResults["okATCount"]);
                }

                if ("errorCount" in checkResults) {
                    errorsCount = parseInt(checkResults["errorCount"]);
                }

                if ("warningCount" in checkResults) {
                    warningsCount = parseInt(checkResults["warningCount"]);
                }

                if ("undefinedCount" in checkResults) {
                    undefinedCount = parseInt(checkResults["undefinedCount"]);
                }

                if ("sourceBSelectedCount" in checkResults) {
                    sourceBSelectedCount = parseInt(checkResults["sourceBSelectedCount"]);
                }


                if ("sourceBTotalComponentsCount" in checkResults) {
                    sourceBTotalComponentsCount = parseInt(checkResults["sourceBTotalComponentsCount"]);
                }      
                
                if ("CheckGroupsInfo" in checkResults) {
                    checkGroupsInfo = checkResults["CheckGroupsInfo"];
                }

                if ("SourceBNotSelectedComps" in checkResults) {
                    sourceBNotSelectedComponents = checkResults["SourceBNotSelectedComps"];
                }
               

                totalItemsChecked = sourceBSelectedCount;

                _this.SourceBComplianceTotalItemsChecked = totalItemsChecked;
                _this.SourceBComplianceErrorsCount = errorsCount;
                _this.SourceBComplianceWarningsCount  = warningsCount;
                _this.SourceBComplianceOKCount = okCount;
                _this.SourceBComplianceUndefinedCount = undefinedCount;
                _this.SourceBNotSelectedComps = sourceBTotalComponentsCount - totalItemsChecked;
                _this.SourceBTotalItemsLoaded = sourceBTotalComponentsCount;
                _this.SourceBOKATCount = okACount + okTCount + OkATCount;       

                //add data to summary
                if(SeveritybuttonActive) {
                    _this.setSeveritySummary('complianceB');
                }
                else if(InfoButtonActive) {
                    _this.setInfoSummary('complianceB');
                }
                                
                // draw pie charts

                if(PieChartActive) {
                // _this.ShowPieChartDiv();
                    if(SeveritybuttonActive) {
                        _this.drawComparisonSeverityPieCharts(okCount,
                            warningsCount,
                            errorsCount,
                            totalItemsChecked);
                    }
                    else if(InfoButtonActive) {
                        _this.drawComparisonInfoPieCharts(noMatchCount,
                            undefinedCount,
                            _this.SourceBNotSelectedComps,
                            totalItemsLoaded);
                    } 
                }

                // //  draw bar chart (total 1)
                if(BarChartActive) {
                    // _this.ShowBarChartDiv();
                    if(SeveritybuttonActive) {
                        _this.createSeverityBarCharts(checkGroupsInfo);
                    }
                    else if(InfoButtonActive) {
                        _this.createInfoBarCharts(checkGroupsInfo);
                    }               
                }

                _this.drawLineChart(checkGroupsInfo);
            }
        }
    });
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
                    text: arg.seriesName
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
                    text: arg.seriesName
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
        totalItemsLoaded,
        '#warningPie',
        colorsArray,
        'ID30_');
    document.getElementById("Warnings").innerHTML = "No Match";
    document.getElementById("Warnings").style.color = colorsArray[0];

    // draw pie chart for Undefined
    colorsArray = ["#0febee", "#EDEDED"];
    this.drawPieChart("Undefined",
        undefinedCount,
        totalItemsLoaded,
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

LargeAnalyticsManager.prototype.setSeveritySummary = function(checkType) {

    if (checkType.toLowerCase() == "comparison") {
        document.getElementById("ID37").innerHTML =  this.ComparisonTotalItemsChecked;
        document.getElementById("ID18").innerHTML =  this.ComparisonErrorsCount;
        document.getElementById("ID6_A3_Text_49").innerHTML = this.ComparisonOKCount;
        document.getElementById("ID13").innerHTML =  this.ComparisonWarningsCount;    
        document.getElementById("ID37_A3_Text_50").innerHTML = this.ComparisonErrorsCount + this.ComparisonOKCount + this.ComparisonWarningsCount;
        document.getElementById("ID6").innerHTML = this.ComparisonOKATCount;
   }
   else if(checkType.toLowerCase() == "compliancea") {
        document.getElementById("ID37").innerHTML = this.SourceAComplianceTotalItemsChecked;
        document.getElementById("ID18").innerHTML = this.SourceAComplianceErrorsCount;
        document.getElementById("ID6_A3_Text_49").innerHTML = this.SourceAComplianceOKCount;
        document.getElementById("ID13").innerHTML = this.SourceAComplianceWarningsCount;    
        document.getElementById("ID37_A3_Text_50").innerHTML = this.SourceAComplianceErrorsCount + this.SourceAComplianceOKCount + this.SourceAComplianceWarningsCount;
        document.getElementById("ID6").innerHTML = this.SourceAOKATCount;
   }
   else if(checkType.toLowerCase() == "complianceb") {
        document.getElementById("ID37").innerHTML = this.SourceBComplianceTotalItemsChecked;
        document.getElementById("ID18").innerHTML = this.SourceBComplianceErrorsCount;
        document.getElementById("ID6_A3_Text_49").innerHTML = this.SourceBComplianceOKCount;
        document.getElementById("ID13").innerHTML = this.SourceBComplianceWarningsCount;    
        document.getElementById("ID37_A3_Text_50").innerHTML = this.SourceBComplianceErrorsCount + this.SourceBComplianceOKCount + this.SourceBComplianceWarningsCount;
        document.getElementById("ID6").innerHTML = this.SourceBOKATCount;
    }
}

LargeAnalyticsManager.prototype.setInfoSummary = function(checkType) {

    if (checkType.toLowerCase() == "comparison") {
        document.getElementById("checkedItemCount").innerHTML =  this.TotalItemsLoaded;
        document.getElementById("count_no_match").innerHTML =  this.ComparisonNoMatchCount;
        document.getElementById("count_undefined").innerHTML = this.ComparisonUndefinedCount;
        document.getElementById("ID37_A3_Text_12_1").innerHTML =  this.ComparisonTotalItemsNotChecked;    
   }
   else if(checkType.toLowerCase() == "compliancea") {
        document.getElementById("checkedItemCount").innerHTML =  this.SourceATotalItemsLoaded;
        document.getElementById("count_no_match").innerHTML =  0;
        document.getElementById("count_undefined").innerHTML = this.SourceAComplianceUndefinedCount;
        document.getElementById("ID37_A3_Text_12_1").innerHTML =  this.SourceANotSelectedComps;    
   }
   else if(checkType.toLowerCase() == "complianceb") {
        document.getElementById("checkedItemCount").innerHTML =  this.SourceBTotalItemsLoaded;
        document.getElementById("count_no_match").innerHTML =  0;
        document.getElementById("count_undefined").innerHTML = this.SourceBComplianceUndefinedCount;
        document.getElementById("ID37_A3_Text_12_1").innerHTML =  this.SourceBNotSelectedComps;   
    }
}

LargeAnalyticsManager.prototype.drawLineChart =  function(checkGroupsInfo) {

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
    $("#line_charts").dxChart({
        palette: colorsArray,
        dataSource: Severitydata,
        commonSeriesSettings: {
            argumentField: "Category",
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