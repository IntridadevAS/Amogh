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
    
    totalItemsLoaded = sourceATotalComponentsCount + sourceBTotalComponentsCount + sourceCTotalComponentsCount + sourceDTotalComponentsCount;
    totalItemsNotChecked = comparisonData["sourceANotChecked"] +
        comparisonData["sourceBNotChecked"] +
        comparisonData["sourceCNotChecked"] +
        comparisonData["sourceDNotChecked"];
    totalItemsChecked = totalItemsLoaded - totalItemsNotChecked;
   

    this.AnalyticsData[activeResultType]['TotalItemsChecked'] = totalItemsChecked;
    this.AnalyticsData[activeResultType]['TotalItemsLoaded'] = totalItemsLoaded;
    this.AnalyticsData[activeResultType]['TotalItemsNotChecked'] = totalItemsNotChecked;
    this.AnalyticsData[activeResultType]['OKATCount'] = Number(okACount) + Number(okTCount) + Number(OkATCount);
    var totalOk = okCount + okACount + okTCount + OkATCount;

    if (PieChartActive) {
        this.ShowPieChartDiv();
        this.drawComparisonPieCharts(totalOk,
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

SmallAnalyticsManager.prototype.populateComparisonCategoryAnalytics = function() {
    var categoryWiseData = this.AnalyticsData[activeResultType].CheckGroupsInfo;
    var categoryData = categoryWiseData[ActiveCategory];

    var classArray = ActiveCategory.split("-");

    var totalItemsChecked = Number(categoryData["OK"]) + Number(categoryData["Warning"]) + Number(categoryData["Error"]) + 
    Number(categoryData["No Match"]) + Number(categoryData["undefined Item"]);

    this.AnalyticsData[activeResultType].CheckGroupsInfo[ActiveCategory]['TotalItemsChecked'] = totalItemsChecked;

    var sourceANotSelectedComponents = this.AnalyticsData[activeResultType]['SourceANotSelectedComps'];
    var sourceBNotSelectedComponents = this.AnalyticsData[activeResultType]['SourceBNotSelectedComps'];
    var sourceCNotSelectedComponents = this.AnalyticsData[activeResultType]['SourceCNotSelectedComps'];
    var sourceDNotSelectedComponents = this.AnalyticsData[activeResultType]['SourceDNotSelectedComps'];

    var sourceANotselected = 0;
    if(Object.keys(sourceANotSelectedComponents).length > 0) {
        if(sourceANotSelectedComponents[classArray[0]] !== undefined)
            sourceANotselected = sourceANotSelectedComponents[classArray[0]]['TotalIemsNotSelected'];
    }

    var sourceBNotselected = 0;
    if(Object.keys(sourceBNotSelectedComponents).length > 0) {
        if(sourceBNotSelectedComponents[classArray[1]] !== undefined)
        sourceBNotselected = sourceBNotSelectedComponents[classArray[1]]['TotalIemsNotSelected'];
    }

    var sourceCNotselected = 0;
    if(Object.keys(sourceCNotSelectedComponents).length > 0) {
        if(sourceCNotSelectedComponents[classArray[2]] !== undefined)
        sourceCNotselected = sourceCNotSelectedComponents[classArray[2]]['TotalIemsNotSelected'];
    }

    var sourceDNotselected = 0;
    if(Object.keys(sourceDNotSelectedComponents).length > 0) {
        if(sourceDNotSelectedComponents[classArray[3]] !== undefined)
        sourceDNotselected = sourceDNotSelectedComponents[classArray[3]]['TotalIemsNotSelected'];
    }


    var totalItemsNotChecked = Number(sourceANotselected) + Number(sourceBNotselected) +Number(sourceCNotselected) + Number(sourceDNotselected);
    this.AnalyticsData[activeResultType].CheckGroupsInfo[ActiveCategory]['TotalItemsNotChecked'] = totalItemsNotChecked;

    var totalItemsLoaded = totalItemsNotChecked + totalItemsChecked;
    this.AnalyticsData[activeResultType].CheckGroupsInfo[ActiveCategory]['TotalItemsLoaded'] = totalItemsLoaded;

    var totalOk = Number(categoryData["OK"]) + Number(categoryData["okATCount"]);
    if (PieChartActive) {
        this.ShowPieChartDiv();
        this.drawComparisonPieCharts(totalOk,
            categoryData["Warning"],
            categoryData["Error"],
            categoryData["No Match"],
            categoryData["undefined Item"],
            totalItemsNotChecked,
            totalItemsChecked,
            totalItemsLoaded);
    }

    var groupWiseSubClassInfo = this.AnalyticsData[activeResultType].GroupWiseSubClassInfo;
    var subClassInfo = groupWiseSubClassInfo[ActiveCategory];
    //  draw bar chart (total 1)
    if (BarChartActive) {
        this.ShowBarChartDiv();
        if (SeveritybuttonActive) {
            this.createSeverityBarCharts(subClassInfo);
        }
        else if (InfoButtonActive) {
            this.CreateInfoBarCharts(subClassInfo);
        }
    }
}

SmallAnalyticsManager.prototype.populateComparisonClassAnalytics = function(classMappingInfo) {
    var classInfo = this.AnalyticsData[activeResultType].GroupWiseSubClassInfo[ActiveCategory][classMappingInfo];
    var error =  classInfo['Error'];
    var ok = classInfo['OK'];
    var warning = classInfo['Warning'];
    var noMatch = classInfo['No Match'];
    var undefinedItems = 0;

    var totalItemsChecked = Number(ok) + Number(warning) + Number(error) + Number(noMatch) + Number(undefinedItems);
    this.AnalyticsData[activeResultType].GroupWiseSubClassInfo[ActiveCategory][classMappingInfo]['TotalItemsChecked'] = totalItemsChecked;

    var sourceANotSelectedComponents = this.AnalyticsData[activeResultType]['SourceANotSelectedComps'];
    var sourceBNotSelectedComponents = this.AnalyticsData[activeResultType]['SourceBNotSelectedComps'];
    var sourceCNotSelectedComponents = this.AnalyticsData[activeResultType]['SourceCNotSelectedComps'];
    var sourceDNotSelectedComponents = this.AnalyticsData[activeResultType]['SourceDNotSelectedComps'];

    var sourceANotselected = 0;
    if(Object.keys(sourceANotSelectedComponents).length > 0) {
        for(var i = 0; i < Object.keys(sourceANotSelectedComponents).length; i++) {
            var Class = Object.keys(sourceANotSelectedComponents)[i];
            if(classMappingInfo.includes(Class)) {
                sourceANotselected = sourceANotselected + sourceANotSelectedComponents[Class];
            }
        }
    }

    var sourceBNotselected = 0;
    if(Object.keys(sourceBNotSelectedComponents).length > 0) {
        for(var i = 0; i < Object.keys(sourceBNotSelectedComponents).length; i++) {
            var Class = Object.keys(sourceBNotSelectedComponents)[i];
            if(classMappingInfo.includes(Class)) {
                sourceBNotselected = sourceBNotselected + sourceBNotSelectedComponents[Class];
            }
        }
    }


    var sourceCNotselected = 0;
    if(Object.keys(sourceCNotSelectedComponents).length > 0) {
        for(var i = 0; i < Object.keys(sourceCNotSelectedComponents).length; i++) {
            var Class = Object.keys(sourceCNotSelectedComponents)[i];
            if(classMappingInfo.includes(Class)) {
                sourceCNotselected = sourceCNotselected + sourceCNotSelectedComponents[Class];
            }
        }
    }

    var sourceDNotselected = 0;
    if(Object.keys(sourceDNotSelectedComponents).length > 0) {
        for(var i = 0; i < Object.keys(sourceDNotSelectedComponents).length; i++) {
            var Class = Object.keys(sourceDNotSelectedComponents)[i];
            if(classMappingInfo.includes(Class)) {
                sourceDNotselected = sourceDNotselected + sourceDNotSelectedComponents[Class];
            }
        }
    }
    

    var totalItemsNotChecked = Number(sourceANotselected) + Number(sourceBNotselected) +Number(sourceCNotselected) + Number(sourceDNotselected);
    this.AnalyticsData[activeResultType].GroupWiseSubClassInfo[ActiveCategory][classMappingInfo]['TotalItemsNotChecked'] = totalItemsNotChecked;

    var totalItemsLoaded = totalItemsNotChecked + totalItemsChecked;
    this.AnalyticsData[activeResultType].GroupWiseSubClassInfo[ActiveCategory][classMappingInfo]['TotalItemsLoaded'] = totalItemsLoaded;


    if (PieChartActive) {
        this.ShowPieChartDiv();
        this.drawComparisonPieCharts(ok,
            warning,
            error,
            noMatch,
            undefinedItems,
            totalItemsNotChecked,
            totalItemsChecked,
            totalItemsLoaded);
    }
    var ComponentAnalytics = window.parent.GetSubClassAnalyticsData();
    //  draw bar chart (total 1)
    if (BarChartActive) {
        this.ShowBarChartDiv();
        if (SeveritybuttonActive) {
            this.createSeverityBarCharts(ComponentAnalytics);
        }
        else if (InfoButtonActive) {
            this.CreateInfoBarCharts(ComponentAnalytics);
        }
    }
}

SmallAnalyticsManager.prototype.populateCompariosonPropertyAnalytics = function(PropertyData) {
    var componentName = PropertyData[0];
    PropertyAnalyticsData = PropertyData[1];
    var error =  PropertyAnalyticsData['Error'];
    var ok = PropertyAnalyticsData['OK'];
    var warning = PropertyAnalyticsData['Warning'];
    var noMatch = PropertyAnalyticsData['No Match'];
    var undefinedItems = PropertyAnalyticsData['undefined Item'];

    var totalItemsChecked = Number(ok) + Number(warning) + Number(error) + Number(noMatch) + Number(undefinedItems);
    var totalItemsNotChecked = 0;
    var totalItemsLoaded = totalItemsChecked;

    if (PieChartActive) {
        this.ShowPieChartDiv();
        this.drawComparisonPieCharts(ok,
            warning,
            error,
            noMatch,
            undefinedItems,
            totalItemsNotChecked,
            totalItemsChecked,
            totalItemsLoaded);
    }
    //  draw bar chart (total 1)
    if (BarChartActive) {
        this.ShowBarChartDiv();
        this.CreatePropertyBarCharts(PropertyAnalyticsData, componentName);
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
        this.drawCompliancePieCharts(okCount + OKATCount,
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

SmallAnalyticsManager.prototype.populateComplianceCategoryAnalytics = function (complianceType) {

    var categoryWiseData = this.AnalyticsData[complianceType].CheckGroupsInfo;
    var categoryData = categoryWiseData[ActiveCategory];

    var totalItemsChecked = Number(categoryData["OK"]) + Number(categoryData["Warning"]) + Number(categoryData["Error"]) + 
    Number(categoryData["No Match"]) + Number(categoryData["undefined Item"]);

    this.AnalyticsData[complianceType].CheckGroupsInfo[ActiveCategory]['TotalItemsChecked'] = totalItemsChecked;

    var totalItemsNotChecked = 0;
    if(this.AnalyticsData[complianceType]['SourceNotSelectedComps'][ActiveCategory]) {
        totalItemsNotChecked = this.AnalyticsData[complianceType]['SourceNotSelectedComps'][ActiveCategory];
    }

    this.AnalyticsData[complianceType].CheckGroupsInfo[ActiveCategory]['TotalItemsNotChecked'] = totalItemsNotChecked;

    var totalItemsLoaded = totalItemsNotChecked + totalItemsChecked;
    this.AnalyticsData[complianceType].CheckGroupsInfo[ActiveCategory]['TotalItemsLoaded'] = totalItemsLoaded;

    if (PieChartActive) {
        this.ShowPieChartDiv();
        this.drawCompliancePieCharts(categoryData["OK"],
            categoryData["Warning"],
            categoryData["Error"],
            categoryData["No Match"],
            categoryData["undefined Item"],
            totalItemsNotChecked,
            totalItemsChecked,
            totalItemsLoaded);
    }

    var groupWiseSubClassInfo = this.AnalyticsData[complianceType].GroupWiseSubClassInfo;
    var subClassInfo = groupWiseSubClassInfo[ActiveCategory];
    //  draw bar chart (total 1)
    if (BarChartActive) {
        this.ShowBarChartDiv();
        if (SeveritybuttonActive) {
            this.createSeverityBarCharts(subClassInfo);
        }
        else if (InfoButtonActive) {
            this.CreateInfoBarCharts(subClassInfo);
        }
    }
}

SmallAnalyticsManager.prototype.populateComplianceClassAnalytics = function(classMappingInfo) {
    var classInfo = this.AnalyticsData[activeResultType].GroupWiseSubClassInfo[ActiveCategory][classMappingInfo];
    var error =  classInfo['Error'];
    var ok = classInfo['OK'];
    var warning = classInfo['Warning'];
    var noMatch = classInfo['No Match'];
    var undefinedItems = 0;

    var totalItemsChecked = Number(ok) + Number(warning) + Number(error) + Number(noMatch) + Number(undefinedItems);
    this.AnalyticsData[activeResultType].GroupWiseSubClassInfo[ActiveCategory][classMappingInfo]['TotalItemsChecked'] = totalItemsChecked;

    var sourceNotSelectedComponents = this.AnalyticsData[activeResultType]['SourceNotSelectedComps']; 

    totalItemsNotChecked = 0;
    if(Object.keys(sourceNotSelectedComponents).length > 0) {
        for(var i = 0; i < Object.keys(sourceNotSelectedComponents).length; i++) {
            var Class = Object.keys(sourceNotSelectedComponents)[i];
            if(classMappingInfo.includes(Class)) {
                totalItemsNotChecked = totalItemsNotChecked + sourceNotSelectedComponents[Class];
            }
        }
    }


    this.AnalyticsData[activeResultType].GroupWiseSubClassInfo[ActiveCategory][classMappingInfo]['TotalItemsNotChecked'] = totalItemsNotChecked;

    var totalItemsLoaded = totalItemsNotChecked + totalItemsChecked;
    this.AnalyticsData[activeResultType].GroupWiseSubClassInfo[ActiveCategory][classMappingInfo]['TotalItemsLoaded'] = totalItemsLoaded;


    if (PieChartActive) {
        this.ShowPieChartDiv();
        this.drawCompliancePieCharts(ok,
            warning,
            error,
            noMatch,
            undefinedItems,
            totalItemsNotChecked,
            totalItemsChecked,
            totalItemsLoaded);
    }
    var ComponentAnalytics = window.parent.GetSubClassAnalyticsData();
    //  draw bar chart (total 1)
    if (BarChartActive) {
        this.ShowBarChartDiv();
        if (SeveritybuttonActive) {
            this.createSeverityBarCharts(ComponentAnalytics);
        }
        else if (InfoButtonActive) {
            this.CreateInfoBarCharts(ComponentAnalytics);
        }
    }
}

SmallAnalyticsManager.prototype.populateCompliancePropertyAnalytics = function(PropertyData) {
    var componentName = PropertyData[0];
    PropertyAnalyticsData = PropertyData[1];
    var error =  PropertyAnalyticsData['Error'];
    var ok = PropertyAnalyticsData['OK'];
    var warning = PropertyAnalyticsData['Warning'];
    var noMatch = PropertyAnalyticsData['No Match'];
    var undefinedItems = PropertyAnalyticsData['undefined Item'];

    var totalItemsChecked = Number(ok) + Number(warning) + Number(error) + Number(noMatch) + Number(undefinedItems);
    var totalItemsNotChecked = 0;
    var totalItemsLoaded = totalItemsChecked;

    if (PieChartActive) {
        this.ShowPieChartDiv();
        this.drawCompliancePieCharts(ok,
            warning,
            error,
            noMatch,
            undefinedItems,
            totalItemsNotChecked,
            totalItemsChecked,
            totalItemsLoaded);
    }
    //  draw bar chart (total 1)
    if (BarChartActive) {
        this.ShowBarChartDiv();
        this.CreatePropertyBarCharts(PropertyAnalyticsData, componentName);
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
        totalItemsChecked,
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
        totalItemsChecked,
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
        totalItemsChecked,
        '#baseNoMatch',
        colorsArray,
        'noMatchPercentage');

    // draw pie chart for Undefined
    colorsArray = ["#0febee", "#EDEDED"];
    this.drawPieChart("Undefined",
        undefinedCount,
        totalItemsChecked,
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

SmallAnalyticsManager.prototype.getSeveritySummaryForCategory = function () {

    var TotalItemsChecked = 0;
    var TotalItemsMatched = 0;
    var ErrorsCount = 0;
    var OKCount = 0;
    var WarningsCount = 0;
    var OkATCount = 0;

    var categoryWiseData = this.AnalyticsData[activeResultType].CheckGroupsInfo;
    var categoryData = categoryWiseData[ActiveCategory];

    TotalItemsChecked = categoryData['TotalItemsChecked'];
    ErrorsCount = categoryData['Error'];
    OKCount = categoryData["OK"];
    WarningsCount = categoryData["Warning"];
    TotalItemsMatched = Number(ErrorsCount) + Number(OKCount) + Number(WarningsCount);
    OkATCount = this.AnalyticsData[activeResultType]['OKATCount'];

    return {
        "TotalItemsChecked": TotalItemsChecked, "ErrorsCount": ErrorsCount, "OKCount": OKCount,
        "WarningCount": WarningsCount, "TotalItemsMatched": TotalItemsMatched, "oKATCount": OkATCount
    }
}

SmallAnalyticsManager.prototype.getSeveritySummaryForClass = function (classMappingInfo) {

    var TotalItemsChecked = 0;
    var TotalItemsMatched = 0;
    var ErrorsCount = 0;
    var OKCount = 0;
    var WarningsCount = 0;
    var OkATCount = 0;

    var classInfo = this.AnalyticsData[activeResultType].GroupWiseSubClassInfo[ActiveCategory][classMappingInfo];

    TotalItemsChecked = classInfo['TotalItemsChecked'];
    ErrorsCount = classInfo['Error'];
    OKCount = classInfo["OK"];
    WarningsCount = classInfo["Warning"];
    TotalItemsMatched = Number(ErrorsCount) + Number(OKCount) + Number(WarningsCount);
    OkATCount = classInfo['OKAT'];

    return {
        "TotalItemsChecked": TotalItemsChecked, "ErrorsCount": ErrorsCount, "OKCount": OKCount,
        "WarningCount": WarningsCount, "TotalItemsMatched": TotalItemsMatched, "oKATCount": OkATCount
    }
}

SmallAnalyticsManager.prototype.getSeveritySummaryForProperties = function (PropertyData) {

    var TotalItemsChecked = 0;
    var TotalItemsMatched = 0;
    var ErrorsCount = 0;
    var OKCount = 0;
    var WarningsCount = 0;
    var OkATCount = 0;

    PropertyAnalyticsData = PropertyData[1];
    var ErrorsCount =  PropertyAnalyticsData['Error'];
    var OKCount = PropertyAnalyticsData['OK'];
    var WarningsCount = PropertyAnalyticsData['Warning'];
    var OkATCount = PropertyAnalyticsData['okAT'];
    var noMatchCount = PropertyAnalyticsData['No Match'];
    var undefinedCount = PropertyAnalyticsData['undefined Item'];

    var TotalItemsChecked = Number(OKCount) + Number(ErrorsCount) + Number(WarningsCount) + Number(noMatchCount) + Number(undefinedCount);
    TotalItemsMatched = Number(OKCount) + Number(WarningsCount) + Number(ErrorsCount);

    return {
        "TotalItemsChecked": TotalItemsChecked, "ErrorsCount": ErrorsCount, "OKCount": OKCount,
        "WarningCount": WarningsCount, "TotalItemsMatched": TotalItemsMatched, "oKATCount": OkATCount
    }
}


SmallAnalyticsManager.prototype.getInfoSummary = function () {

    var TotalItemsLoaded = 0;
    var TotalItemsNotChecked = 0;
    var noMatchCount = 0;
    var undefinedCount = 0;

    TotalItemsLoaded = this.AnalyticsData[activeResultType]['TotalItemsLoaded'];
    TotalItemsNotChecked = this.AnalyticsData[activeResultType]['TotalItemsNotChecked'];
    if(this.AnalyticsData[activeResultType]["nomatchCount"])
        noMatchCount = this.AnalyticsData[activeResultType]["nomatchCount"];
    if(this.AnalyticsData[activeResultType]["undefinedCount"])
        undefinedCount = this.AnalyticsData[activeResultType]["undefinedCount"];

    return {
        "TotalItemsLoaded": TotalItemsLoaded, "TotalItemsNotChecked": TotalItemsNotChecked, "noMatchCount": noMatchCount,
        "undefinedCount": undefinedCount
    }
}

SmallAnalyticsManager.prototype.getInfoSummaryForCategory = function () {

    var TotalItemsLoaded = 0;
    var TotalItemsNotChecked = 0;
    var noMatchCount = 0;
    var undefinedCount = 0;

    var categoryWiseData = this.AnalyticsData[activeResultType].CheckGroupsInfo;
    var categoryData = categoryWiseData[ActiveCategory];

    TotalItemsLoaded = categoryData['TotalItemsLoaded'];
    TotalItemsNotChecked = categoryData['TotalItemsNotChecked'];
    if(categoryData["No Match"])
        noMatchCount = categoryData["No Match"];
    undefinedCount = categoryData["undefined Item"];

    return {
        "TotalItemsLoaded": TotalItemsLoaded, "TotalItemsNotChecked": TotalItemsNotChecked, "noMatchCount": noMatchCount,
        "undefinedCount": undefinedCount
    }
}

SmallAnalyticsManager.prototype.getInfoSummaryForClass = function (classMappingInfo) {

    var TotalItemsLoaded = 0;
    var TotalItemsNotChecked = 0;
    var noMatchCount = 0;
    var undefinedCount = 0;

    var classInfo = this.AnalyticsData[activeResultType].GroupWiseSubClassInfo[ActiveCategory][classMappingInfo];

    TotalItemsLoaded = classInfo['TotalItemsLoaded'];
    TotalItemsNotChecked = classInfo['TotalItemsNotChecked'];
    if(classInfo["No Match"])
        noMatchCount = classInfo["No Match"];
    if(classInfo["undefined Item"])
        undefinedCount = classInfo["undefined Item"];

    return {
        "TotalItemsLoaded": TotalItemsLoaded, "TotalItemsNotChecked": TotalItemsNotChecked, "noMatchCount": noMatchCount,
        "undefinedCount": undefinedCount
    }
}

SmallAnalyticsManager.prototype.getInfoSummaryForProperties = function (PropertyData) {

    var TotalItemsLoaded = 0;
    var TotalItemsNotChecked = 0;
    var noMatchCount = 0;
    var undefinedCount = 0;

    PropertyAnalyticsData = PropertyData[1];

    var ErrorsCount =  PropertyAnalyticsData['Error'];
    var OKCount = PropertyAnalyticsData['OK'];
    var WarningsCount = PropertyAnalyticsData['Warning'];
    noMatchCount = PropertyAnalyticsData['No Match'];
    undefinedCount = PropertyAnalyticsData['undefined Item'];
   

    TotalItemsLoaded = Number(OKCount) + Number(WarningsCount) + Number(ErrorsCount) + Number(noMatchCount) + Number(undefinedCount);
   

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

SmallAnalyticsManager.prototype.CreatePropertyBarCharts = function(PropertyAnalyticsData, componentName) {
    var data = [];
    var dataObject = {};
    var colorsArray;
    var Series;
    if (SeveritybuttonActive) {
       colorsArray = ["#F43742", "#F8C13B", "#0FFF72"];
       dataObject = {
           "ComponentName" : componentName,
           "Error" : PropertyAnalyticsData['Error'],
           "Warning" : PropertyAnalyticsData['Warning'],
           "OK" : PropertyAnalyticsData['OK']
       };

       Series = [
            { valueField: "Error", name: "Error" },
            { valueField: "Warning", name: "Warning" },
            { valueField: "OK", name: "OK" }
        ];
    }
    else if (InfoButtonActive) {
        colorsArray = ["#dddbff", "#e7d7fa"];
        dataObject = {
            "ComponentName" : componentName,
            "No Match" : PropertyAnalyticsData['No Match'],
            "Undefined" : PropertyAnalyticsData['undefined Item'],
        };

        Series = [
            { valueField: "No Match", name: "No Match" },
            { valueField: "Undefined", name: "Undefined" }
        ];
    }

    data.push(dataObject);

    $("#BarChart").dxChart({
        dataSource: data,
        commonSeriesSettings: {
            argumentField: "ComponentName",
            type: "bar",
        },
        series: Series,
        palette : colorsArray,
        legend: {
            visible: false
        },
    });
}