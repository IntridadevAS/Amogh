function AnalyticsManager1(comparisonCheckGroups, 
    sourceAComplianceCheckGroups, 
    sourceBComplianceCheckGroups) {

    this.ComparisonCheckGroups = comparisonCheckGroups;
    this.SourceAComplianceCheckGroups = sourceAComplianceCheckGroups;
    this.SourceBComplianceCheckGroups = sourceBComplianceCheckGroups;

    var ComparisonTotalItemsChecked = 0;
    var ComparisonErrorsCount = 0;
    var ComparisonOKCount = 0;
    var ComparisonWarningsCount = 0;
    
    var ComparisonTotalItemsCount = 0;
    var ComparisonTotalItemsNotChecked = 0;
    var ComparisonNoMatchCount = 0;
    var ComparisonUndefinedCount = 0;
    var TotalItemsLoaded = 0;

    var SourceAComplianceTotalItemsChecked = 0;
    var SourceAComplianceErrorsCount = 0;
    var SourceAComplianceOKCount = 0;
    var SourceAComplianceWarningsCount = 0;
    var SourceAComplianceUndefinedCount = 0;
    var SourceAComplianceTotalItemsLoaded = 0;
    var SourceANotSelectedComps = 0;
    var SourceATotalItemsLoaded = 0

    var SourceBComplianceTotalItemsChecked = 0;
    var SourceBComplianceErrorsCount = 0;
    var SourceBComplianceOKCount = 0;
    var SourceBComplianceWarningsCount = 0;
    var SourceBComplianceUndefinedCount = 0;
    var SourceBComplianceTotalItemsLoaded = 0;
    var SourceBNotSelectedComps = 0;
    var SourceBTotalItemsLoaded = 0
}

AnalyticsManager1.prototype.populateComparisonAnalyticsData = function () {
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

                _this.ComparisonTotalItemsChecked = totalItemsChecked;
                _this.ComparisonErrorsCount = errorsCount;
                _this.ComparisonWarningsCount = warningsCount;
                _this.ComparisonOKCount = okCount;
                _this.TotalItemsLoaded = totalItemsLoaded;
                _this.ComparisonTotalItemsNotChecked = totalItemsNotChecked;
                _this.ComparisonNoMatchCount = noMatchCount;
                _this.ComparisonUndefinedCount = undefinedCount;

                 
                //add data to summary
                // _this.setSeveritySummary('Comparison');
                 
                // draw pie charts

                if(PieChartActive) {
                    _this.ShowPieChartDiv();
                    _this.drawComparisonPieCharts(okCount,
                        warningsCount,
                        errorsCount,
                        noMatchCount,
                        undefinedCount,
                        totalItemsNotChecked,
                        totalItemsChecked,
                        totalItemsLoaded);
                }
               

                // draw info pie charts
                // _this.drawInfoPieCharts('comparison',
                //     sourceATotalComponentsCount,
                //     sourceBTotalComponentsCount,
                //     noMatchCount,
                //     undefinedCount,
                //     totalItemsChecked);

                // //  draw bar chart (total 1)
                if(BarChartActive) {
                    _this.ShowBarChartDiv();
                    if(SeveritybuttonActive) {
                        _this.createSeverityBarCharts(checkGroupsInfo);
                    }
                    else if(InfoButtonActive) {
                        _this.CreateInfoBarCharts(checkGroupsInfo);
                    }               
                }
                

                // // draw comparison  info bar charts (total 1)
                // _this.drawInfoBarCharts("comparison",
                //     checkGroupsInfo,
                //     sourceANotSelectedComponents,
                //     sourceBNotSelectedComponents);

                // // draw severity line chart
                // _this.drawLineCharts(errorsCount, okCount, warningsCount);

            }
        }
    });
}

AnalyticsManager1.prototype.populateSourceAComplianceAnalyticsData = function () {

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
               
                var sourceASelectedCount = 0;                  
                var sourceATotalComponentsCount = 0;                  
                var checkGroupsInfo = 0;

                var sourceANotSelectedComponents;

                if ("okCount" in checkResults) {
                    okCount = parseInt(checkResults["okCount"]);
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
                _this.SourceANotSelectedComps = sourceANotSelectedComponents;
                _this.SourceATotalItemsLoaded = sourceATotalComponentsCount;

                  // //add data to summary
                //   if (! _this.ComparisonCheckGroups) 
                //   {
                //     _this.setSeveritySummary('SourceACompliance');                          
                //   }

                // draw pie charts

                if(PieChartActive) {
                    _this.ShowPieChartDiv();
                    _this.drawCompliancePieCharts(okCount,
                        warningsCount,
                        errorsCount,
                        noMatchCount,
                        undefinedCount,
                        sourceANotSelectedComponents,
                        totalItemsChecked,
                        sourceATotalComponentsCount);
                }

                if(BarChartActive) {
                    _this.ShowBarChartDiv();
                    if(SeveritybuttonActive) {
                        _this.createSeverityBarCharts(checkGroupsInfo);
                    }
                    else if(InfoButtonActive) {
                        _this.CreateInfoBarCharts(checkGroupsInfo);
                    }               
                }

                // draw source A compliance bar charts (total 1)
                // _this.drawBarCharts("SourceACompliance", checkGroupsInfo);
            }
        }
    });
}

AnalyticsManager1.prototype.populateSourceBComplianceAnalyticsData = function () {

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

                var sourceBSelectedCount = 0;
                var checkGroupsInfo = 0;
                var sourceBTotalComponentsCount = 0;         
                var sourceBNotSelectedComponents = 0;

                if ("okCount" in checkResults) {
                    okCount = parseInt(checkResults["okCount"]);
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
                _this.SourceBNotSelectedComps = sourceBNotSelectedComponents;
                _this.SourceBTotalItemsLoaded = sourceBTotalComponentsCount;



                //add data to summary
                // if (!_this.ComparisonCheckGroups &&
                //     !_this.SourceAComplianceCheckGroups) {
                //     _this.setSeveritySummary('SourceBCompliance');
                // }                 


                // draw pie charts

                if(PieChartActive) {
                    _this.ShowPieChartDiv();
                    _this.drawCompliancePieCharts(okCount,
                        warningsCount,
                        errorsCount,
                        noMatchCount,
                        undefinedCount,
                        sourceBNotSelectedComponents,
                        totalItemsChecked,
                        sourceBTotalComponentsCount);
                }

                if(BarChartActive) {
                    _this.ShowBarChartDiv();
                    if(SeveritybuttonActive) {
                        _this.createSeverityBarCharts(checkGroupsInfo);
                    }
                    else if(InfoButtonActive) {
                        _this.CreateInfoBarCharts(checkGroupsInfo);
                    }               
                }                
            }
        }
    });
}

AnalyticsManager1.prototype.ShowPieChartDiv = function() {
    var left = document.getElementById("left");
    left.style.display="block";
    var right = document.getElementById("right");
    right.style.display="block";
    var bar = document.getElementById("BarChart");
    bar.style.display="none";
}

AnalyticsManager1.prototype.ShowBarChartDiv = function() {
    var bar = document.getElementById("BarChart");
    bar.style.display="block";
    var left = document.getElementById("left");
    left.style.display="none";
    var right = document.getElementById("right");
    right.style.display="none";
}

AnalyticsManager1.prototype.drawCompliancePieCharts = function (okCount,
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
        colorsArray = ["#F8C13B","#EDEDED"];
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
        colorsArray = ["#0FFF72","#EDEDED"];
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


AnalyticsManager1.prototype.drawComparisonPieCharts = function (okCount,
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


}

AnalyticsManager1.prototype.drawPieChart = function (mainChartItem,
    itemCount,
    totalItemCount,
    chartDiv,
    colorsArray,
    percentageDiv) {

        var data = []

        if(itemCount == 0) {
            data = [
                { "name": "Other", "value": totalItemCount - itemCount },
            ];

            colorsArray = ["#EDEDED"];
        }
        else {
            data = [
                { "name": mainChartItem, "value": itemCount },
                { "name": "Other", "value": totalItemCount - itemCount },
            ];
        }


        $(chartDiv).css('background-color', 'rgba(0,0,0,0)');
        $(function () {
            $(chartDiv).igDoughnutChart({
                width: "100%",
                height: "180px",
                innerExtent: 90,
                series:
                [{
                    name: "Error",
                    labelMemberPath: 'name',
                    valueMemberPath: "value",
                    dataSource: data,
                    showTooltip: true,
                    tooltipTemplate: "<div class='ui-chart-tooltip'><div class='bold'>${item.name}</div><div>Item count: <label class='bold'>${item.value}</label></div></div>",
                    startAngle: 270,
                    outlines: colorsArray,
                    brushes : colorsArray
                }]
            });
        });  

    //  this.CreateSeverityTextDivs();
    var percent = itemCount * 100 / totalItemCount;
    var fixedPercent = parseFloat((percent).toFixed(1));
    
    var errorDiv = document.getElementById(percentageDiv);
    errorDiv.innerHTML = "";
    errorDiv.innerHTML = fixedPercent + "%";
}

AnalyticsManager1.prototype.getSeverityInfo = function(checkType) {
    if (checkType.toLowerCase() == "comparison") {
        comparisonTotalItemsChecked = this.ComparisonTotalItemsChecked;
        comparisonErrorsCount = this.ComparisonErrorsCount;
        comparisonOKCount = this.ComparisonOKCount;
        comparisonWarningsCount = this.ComparisonWarningsCount;    
   }
}

AnalyticsManager1.prototype.createSeverityBarCharts = function(checkGroupsInfo) {

    var _this = this;
    
    var Severitydata = []
    for(key in checkGroupsInfo) {
        var dataObject = {}
        dataObject["category"] = key;
        if(checkGroupsInfo[key]["OK"] !== "0")
            dataObject["OK"] = checkGroupsInfo[key]["OK"];

        if(checkGroupsInfo[key]["Error"] !== "0")
            dataObject["Error"] = checkGroupsInfo[key]["Error"]
        
        if(checkGroupsInfo[key]["Warning"] !== "0")
            dataObject["Warning"] = checkGroupsInfo[key]["Warning"]

        Severitydata.push(dataObject);
    }
   
    var colorsArray = ["#0FFF72", "#F43742", "#F8C13B"]

    xAxis = { name: "xAxis", type: "categoryX", label: "category", gap: 0.5,  };
    yAxis = { name: "yAxis", type: "numericY", title: "Severity" };
    $("#BarChart").css('background-color', 'rgba(0,0,0,0)');
    $("#BarChart").igDataChart({
        dataSource: Severitydata,
        height: "50%",
        width: "50%",
        title: "Severity Chart",
        brushes: colorsArray,
        horizontalZoomable: true,
        verticalZoomable: true,
        windowResponse: "immediate",
        axes: [ xAxis, yAxis ],
        series: [{
            name: "Severity Chart",
            type: "stackedColumn",
            xAxis: "xAxis",
            yAxis: "yAxis",
            outline: "transparent",
            series: [
                _this.CreateStackedFragment("OK"),
                _this.CreateStackedFragment("Error"),
                _this.CreateStackedFragment("Warning"),
            ]
        }], 
    });
}

AnalyticsManager1.prototype.CreateInfoBarCharts = function(checkGroupsInfo) {
    var _this = this;

    xAxis = { name: "xAxis", type: "categoryX", label: "category", gap: 1,  };
    yAxis = { name: "yAxis", type: "numericY", title: "Severity" };
    var Infodata = []
    for(key in checkGroupsInfo) {
        var dataObject = {}
        dataObject["category"] = key;
        if(checkGroupsInfo[key]["No Match"] !== "0")
            dataObject["No Match"] = checkGroupsInfo[key]["No Match"];

        if(checkGroupsInfo[key]["undefined Item"] !== "0")
            dataObject["undefined"] = checkGroupsInfo[key]["undefined Item"]
        Infodata.push(dataObject);
    }

    var colorsArray = ["#dddbff", "#e7d7fa"]
    $("#BarChart").css('background-color', 'rgba(0,0,0,0)');
    $("#BarChart").igDataChart({
        dataSource: Infodata,
        height: "50%",
        width: "50%",
        title: "Info Chart",
        horizontalZoomable: true,
        verticalZoomable: true,
        brushes: colorsArray,
        windowResponse: "immediate",
        axes: [ xAxis, yAxis ],
        series: [{
            name: "Info Chart",
            type: "stackedColumn",
            xAxis: "xAxis",
            yAxis: "yAxis",
            outline: "transparent",
            series: [
                _this.CreateStackedFragment("No Match"),
                _this.CreateStackedFragment("undefined")
            ]
        }], 
    });
}

AnalyticsManager1.prototype.CreateStackedFragment = function(Severityname) {

    var stackFragment = {
        name: Severityname + "Fragment",
        title: Severityname,
        valueMemberPath: Severityname,
        type: "stackedFragment",
        showTooltip: true,
        tooltipTemplate: Severityname,
    };
    return stackFragment;
}