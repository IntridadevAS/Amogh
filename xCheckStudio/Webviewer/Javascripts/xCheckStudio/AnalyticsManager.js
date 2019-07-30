function AnalyticsManager(comparisonCheckGroups, 
                        sourceAComplianceCheckGroups, 
                        sourceBComplianceCheckGroups) {

    this.ComparisonCheckGroups = comparisonCheckGroups;
    this.SourceAComplianceCheckGroups = sourceAComplianceCheckGroups;
    this.SourceBComplianceCheckGroups = sourceBComplianceCheckGroups

    var ComparisonTotalItemsChecked = 0;
    var ComparisonErrorsCount = 0;
    var ComparisonOKCount = 0;
    var ComparisonWarningsCount = 0;
    
    var ComparisonTotalItemsCount = 0;
    var ComparisonTotalItemsNotChecked = 0;
    var ComparisonNoMatchCount = 0;
    var ComparisonUndefinedCount = 0;

    var SourceAComplianceTotalItemsChecked = 0;
    var SourceAComplianceErrorsCount = 0;
    var SourceAComplianceOKCount = 0;
    var SourceAComplianceWarningsCount = 0;

    var SourceBComplianceTotalItemsChecked = 0;
    var SourceBComplianceErrorsCount = 0;
    var SourceBComplianceOKCount = 0;
    var SourceBComplianceWarningsCount = 0;

    
    AnalyticsManager.prototype.setSeveritySummary = function (checkType) 
    {

        var comparisonTotalItemsChecked;
        var comparisonErrorsCount;
        var comparisonOKCount ;
        var comparisonWarningsCount;
        
        this.clearSeveritySummary();

        if (checkType.toLowerCase() == "comparison") {
             comparisonTotalItemsChecked = this.ComparisonTotalItemsChecked;
             comparisonErrorsCount = this.ComparisonErrorsCount;
             comparisonOKCount = this.ComparisonOKCount;
             comparisonWarningsCount = this.ComparisonWarningsCount;    
        }
        else if (checkType.toLowerCase() == "sourceacompliance") {
       
            comparisonTotalItemsChecked = this.SourceAComplianceTotalItemsChecked;
            comparisonErrorsCount = this.SourceAComplianceErrorsCount;
            comparisonOKCount = this.SourceAComplianceOKCount;
            comparisonWarningsCount = this.SourceAComplianceWarningsCount; 
        }
        else if (checkType.toLowerCase() == "sourcebcompliance") {

            comparisonTotalItemsChecked = this.SourceBComplianceTotalItemsChecked;
            comparisonErrorsCount = this.SourceBComplianceErrorsCount;
            comparisonOKCount = this.SourceBComplianceOKCount;
            comparisonWarningsCount = this.SourceBComplianceWarningsCount; 
        }
        else
        {
            return;
        }

        if (comparisonTotalItemsChecked == undefined &&
            comparisonErrorsCount == undefined &&
            comparisonWarningsCount == undefined &&
            comparisonOKCount == undefined) {
            
            comparisonTotalItemsChecked = "";
            comparisonErrorsCount = "";
            comparisonWarningsCount = "";
            comparisonOKCount = "";
        }
        
        document.getElementById("a37").innerText = comparisonTotalItemsChecked;
        document.getElementById("a18").innerText = comparisonErrorsCount;
        document.getElementById("a13").innerText = comparisonWarningsCount;
        document.getElementById("a6").innerText = comparisonOKCount;
    } 

    AnalyticsManager.prototype.clearSeveritySummary = function () 
    {
       
        document.getElementById("a37").innerText = "";
        document.getElementById("a18").innerText = "";
        document.getElementById("a13").innerText = "";
        document.getElementById("a6").innerText = "";
    }

    AnalyticsManager.prototype.setNonSeveritySummary = function () {

        var comparisonTotalItemsCount = this.ComparisonTotalItemsCount;
        var comparisonTotalItemsNotChecked = this.ComparisonTotalItemsNotChecked;
        var comparisonNoMatchCount = this.ComparisonNoMatchCount;
        var comparisonUndefinedCount = this.ComparisonUndefinedCount;

        this.clearNonSeveritySummary();

        if (comparisonTotalItemsCount == undefined &&
            comparisonTotalItemsNotChecked == undefined &&
            comparisonNoMatchCount == undefined && 
            comparisonUndefinedCount == undefined) {

            comparisonTotalItemsCount = "";
            comparisonTotalItemsNotChecked = "";
            comparisonNoMatchCount = "";
            comparisonUndefinedCount = "";
        }

        document.getElementById("a37Info").innerText = comparisonTotalItemsCount;
        document.getElementById("a18Info").innerText = comparisonTotalItemsNotChecked;
        document.getElementById("a13Info").innerText = comparisonNoMatchCount;
        document.getElementById("a20Info").innerText = comparisonUndefinedCount;
    }

    AnalyticsManager.prototype.clearNonSeveritySummary = function () {
        document.getElementById("a37Info").innerText = "";
        document.getElementById("a18Info").innerText = "";
        document.getElementById("a13Info").innerText = "";
        document.getElementById("a20Info").innerText = "";
    }

    AnalyticsManager.prototype.populateComparisonAnalyticsData = function () {
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var object = JSON.parse(projectinfo);
        var _this = this;
        $.ajax({
            url: 'PHP/AnalyticsDataReader.php',
            type: "POST",
            async: true,
            data: { 
                'CheckType': 'Comparison',
                'ProjectName': object.projectname
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
                 
                    _this.ComparisonTotalItemsChecked = totalItemsChecked;
                    _this.ComparisonErrorsCount = errorsCount;
                    _this.ComparisonWarningsCount = warningsCount;
                    _this.ComparisonOKCount = okCount;
                     
                    //add data to summary
                    _this.setSeveritySummary('Comparison');
                     
                    // draw pie charts
                    _this.drawComparisonPieCharts(okCount,
                        warningsCount,
                        errorsCount,
                        totalItemsChecked);

                    // draw info pie charts
                    _this.drawInfoPieCharts('comparison',
                        sourceATotalComponentsCount,
                        sourceBTotalComponentsCount,
                        noMatchCount,
                        undefinedCount,
                        totalItemsChecked);

                    //  draw bar chart (total 1)
                    _this.drawBarCharts("comparison", checkGroupsInfo);

                    // draw comparison  info bar charts (total 1)
                    _this.drawInfoBarCharts("comparison",
                        checkGroupsInfo,
                        sourceANotSelectedComponents,
                        sourceBNotSelectedComponents);

                    // draw severity line chart
                    _this.drawLineCharts(errorsCount, okCount, warningsCount);

                }
            }
        });
    }

    AnalyticsManager.prototype.populateSourceAComplianceAnalyticsData = function () {

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var object = JSON.parse(projectinfo);
        var _this = this;
        $.ajax({
            url: 'PHP/AnalyticsDataReader.php',
            type: "POST",
            async: true,
            data: { 
                'CheckType': 'SourceACompliance',
                'ProjectName': object.projectname
            },
            success: function (msg) {
                if (msg != 'fail') {
                    var checkResults = JSON.parse(msg);
                    var totalItemsChecked = 0;
                    var errorsCount = 0;
                    var warningsCount = 0;
                    var okCount = 0;
                   
                    var sourceASelectedCount = 0;                  
                    var sourceATotalComponentsCount = 0;                  
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

                      // //add data to summary
                      if (! _this.ComparisonCheckGroups) 
                      {
                        _this.setSeveritySummary('SourceACompliance');                          
                      }

                    // draw pie charts
                    _this.drawSourceACompliancePieCharts(okCount,
                        warningsCount,
                        errorsCount,
                        totalItemsChecked);

                    // draw source A compliance bar charts (total 1)
                    _this.drawBarCharts("SourceACompliance", checkGroupsInfo);
                }
            }
        });
    }

    AnalyticsManager.prototype.populateSourceBComplianceAnalyticsData = function () {

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var object = JSON.parse(projectinfo);

        var _this = this;
        $.ajax({
            url: 'PHP/AnalyticsDataReader.php',
            type: "POST",
            async: true,
            data: { 
                'CheckType': 'SourceBCompliance',
                'ProjectName': object.projectname
            },
            success: function (msg) {
                if (msg != 'fail') {
                    var checkResults = JSON.parse(msg);
                    var totalItemsChecked = 0;
                    var errorsCount = 0;
                    var warningsCount = 0;
                    var okCount = 0;

                    var sourceBSelectedCount = 0;
                    var checkGroupsInfo = 0;

                    if ("okCount" in checkResults) {
                        okCount = parseInt(checkResults["okCount"]);
                    }

                    if ("errorCount" in checkResults) {
                        errorsCount = parseInt(checkResults["errorCount"]);
                    }

                    if ("warningCount" in checkResults) {
                        warningsCount = parseInt(checkResults["warningCount"]);
                    }

                    if ("sourceBSelectedCount" in checkResults) {
                        sourceBSelectedCount = parseInt(checkResults["sourceBSelectedCount"]);
                    }


                    if ("CheckGroupsInfo" in checkResults) {
                        checkGroupsInfo = checkResults["CheckGroupsInfo"];
                    }

                    totalItemsChecked = sourceBSelectedCount;

                    _this.SourceBComplianceTotalItemsChecked = totalItemsChecked;
                    _this.SourceBComplianceErrorsCount = errorsCount;
                    _this.SourceBComplianceWarningsCount  = warningsCount;
                    _this.SourceBComplianceOKCount = okCount;

                    //add data to summary
                    if (!_this.ComparisonCheckGroups &&
                        !_this.SourceAComplianceCheckGroups) {
                        _this.setSeveritySummary('SourceBCompliance');
                    }                 


                    // draw pie charts
                    _this.drawSourceBCompliancePieCharts(okCount,
                        warningsCount,
                        errorsCount,
                        totalItemsChecked);

                    // draw source A compliance bar charts (total 1)
                    _this.drawBarCharts("SourceBCompliance", checkGroupsInfo);
                }
            }
        });
    }

    AnalyticsManager.prototype.drawSourceBCompliancePieCharts = function (okCount,
        warningsCount,
        errorsCount,
        totalItemsChecked) {

        // draw pie chart for Errors 
        var errorDiv = document.getElementById('SourceBCompliance_pie2');
        var colorsArray = ["#F43742", "#EDEDED"];
        this.drawPieChart("Error",
            errorsCount,
            totalItemsChecked,
            SourceBCompliance_pie2,
            colorsArray,
            "a40_Bpie");

        // draw pie chart for Warnings
        var warningDiv = document.getElementById('SourceBCompliance_pie4');
        colorsArray = ["#F8C13B", "#EDEDED"];
        this.drawPieChart("Warning",
            warningsCount,
            totalItemsChecked,
            SourceBCompliance_pie4,
            colorsArray,
            'a30_Bpie');

        // draw pie chart for Oks
        var okDiv = document.getElementById('SourceBCompliance_pie5');
        colorsArray = ["#98DE32", "#EDEDED"];
        this.drawPieChart("OK",
            okCount,
            totalItemsChecked,
            SourceBCompliance_pie5,
            colorsArray,
            'a10_Bpie');
    }

    AnalyticsManager.prototype.drawSourceACompliancePieCharts = function (okCount,
        warningsCount,
        errorsCount,
        totalItemsChecked) {

        // draw pie chart for Errors 
        //var errorDiv = document.getElementById('SourceACompliance_pie2');
        var colorsArray = ["#F43742", "#EDEDED"];
        this.drawPieChart("Error",
            errorsCount,
            totalItemsChecked,
            SourceACompliance_pie2,
            colorsArray,
            "a40_Apie");

        // draw pie chart for Warnings
        var warningDiv = document.getElementById('SourceACompliance_pie4');
        colorsArray = ["#F8C13B", "#EDEDED"];
        this.drawPieChart("Warning",
            warningsCount,
            totalItemsChecked,
            SourceACompliance_pie4,
            colorsArray,
            'a30_Apie');

        // draw pie chart for Oks
        var okDiv = document.getElementById('SourceACompliance_pie5');
        colorsArray = ["#98DE32", "#EDEDED"];
        this.drawPieChart("OK",
            okCount,
            totalItemsChecked,
            SourceACompliance_pie5,
            colorsArray,
            'a10_Apie');

    }

    AnalyticsManager.prototype.drawComparisonPieCharts = function (okCount,
        warningsCount,
        errorsCount,
        totalItemsChecked) {

        // draw pie chart for Errors 
        var errorDiv = document.getElementById('group2_pie');
        var colorsArray = ["#F43742", "#EDEDED"];
        this.drawPieChart("Error",
            errorsCount,
            totalItemsChecked,
            errorDiv,
            colorsArray,
            "a40");

        // draw pie chart for Warnings
        var warningDiv = document.getElementById('group4_pie');
        colorsArray = ["#F8C13B", "#EDEDED"];
        this.drawPieChart("Warning",
            warningsCount,
            totalItemsChecked,
            warningDiv,
            colorsArray,
            'a30');

        // draw pie chart for Oks
        var okDiv = document.getElementById('group5_pie');
        colorsArray = ["#98DE32", "#EDEDED"];
        this.drawPieChart("OK",
            okCount,
            totalItemsChecked,
            okDiv,
            colorsArray,
            'a10');
    }

    AnalyticsManager.prototype.drawPieChart = function (mainChartItem,
        itemCount,
        totalItemCount,
        div,
        colorsArray,
        percentageDiv) {

        var resultArray = [];

        titleArray = [];
        titleArray.push("Name");
        titleArray.push("Value");
        resultArray.push(titleArray);

        var percent = itemCount * 100 / totalItemCount;
        var fixedPercent = parseFloat((percent).toFixed(1));

        document.getElementById(percentageDiv).innerText = fixedPercent + "%";

        var valueArray = [];
        valueArray.push(mainChartItem);
        valueArray.push(fixedPercent);
        resultArray.push(valueArray);

        complementryPercent = 100 - fixedPercent;
        if (complementryPercent < 0) {
            complementryPercent = 0;
        }
        complementryPercent = parseFloat((complementryPercent).toFixed(1));

        valueArray = [];
        valueArray.push("");
        valueArray.push(complementryPercent);
        resultArray.push(valueArray);

        //colorsArray = ["#98DE32", "#EDEDED"];

        var dataTable = getData(resultArray);
        drawPieChart(dataTable, "", div, colorsArray);
    }

    AnalyticsManager.prototype.drawInfoPieCharts = function (type,
        sourceATotalComponentsCount,
        sourceBTotalComponentsCount,
        noMatchCount, undefinedCount,
        totalItemsChecked) {
      
        if (type === "comparison") {
         
            var totalItemsCount = sourceATotalComponentsCount + sourceBTotalComponentsCount;
            var totalItemsNotChecked = totalItemsCount - totalItemsChecked;
            if (totalItemsNotChecked < 0) {
                totalItemsNotChecked = 0;
            }
           
            //add data to summary
            document.getElementById("a37Info").innerText = totalItemsCount;
            document.getElementById("a18Info").innerText = totalItemsNotChecked;
            document.getElementById("a13Info").innerText = noMatchCount;
            document.getElementById("a20Info").innerText = undefinedCount;

             this.ComparisonTotalItemsCount = totalItemsCount;
             this.ComparisonTotalItemsNotChecked = totalItemsNotChecked;
             this.ComparisonNoMatchCount = noMatchCount;
             this.ComparisonUndefinedCount = undefinedCount;

            // draw pie chart for No Match 
            var noMatchDiv = document.getElementById('group2_pieInfo');
            var colorsArray = ["#AFD3C5", "#EDEDED"];
            this.drawPieChart("No Match",
                noMatchCount,
                totalItemsChecked,
                noMatchDiv,
                colorsArray,
                'a40Info');
            document.getElementById("a40Info").style.color = "#AFD3C5";

             // draw pie chart for undefined items
            var undefinedItemsDiv = document.getElementById('group4_pieInfo');
            var colorsArray = ["#aebcd2", "#EDEDED"];
            this.drawPieChart("Undefined",
                undefinedCount,
                totalItemsChecked,
                undefinedItemsDiv,
                colorsArray,
                'a30Info');
            document.getElementById("a30Info").style.color = "#aebcd2";

            // draw pie chart for not checked
            var notCheckedDiv = document.getElementById('group5_pieInfo');
            colorsArray = ["#839192", "#EDEDED"];;
            this.drawPieChart("Not Checked",
                totalItemsNotChecked,
                totalItemsCount,
                notCheckedDiv,
                colorsArray,
                'a10Info');
            document.getElementById("a10Info").style.color = "#839192";            
        }
    }

    AnalyticsManager.prototype.drawInfoBarCharts = function (type,
        checkGroupsInfo,
        sourceANotSelectedComponents,
        sourceBNotSelectedComponents) {
      
        if (type === "comparison") {
            var resultArray = [];

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("No Match");
            titleArray.push("Undefined Item");
            titleArray.push("Not Checked");
            resultArray.push(titleArray);

            for (var groupName in checkGroupsInfo) {
                var groupNameArray = groupName.split('-');

                var SourceANotSelectedCount = 0;
                var SourceBNotSelectedCount = 0;
                if (groupNameArray.length == 2) {
                    var sourceAClassName = groupNameArray[0];
                    var sourceBClassName = groupNameArray[1];

                    if (sourceAClassName in sourceANotSelectedComponents) {
                        SourceANotSelectedCount = parseInt(sourceANotSelectedComponents[sourceAClassName]);
                    }

                    if (sourceBClassName in sourceBNotSelectedComponents) {
                        SourceBNotSelectedCount = parseInt(sourceBNotSelectedComponents[sourceBClassName]);
                    }
                }
                else if (groupNameArray.length == 1) {
                    sourceAClassName = groupNameArray[0];

                    if (sourceAClassName in sourceANotSelectedComponents) {
                        SourceANotSelectedCount = parseInt(sourceANotSelectedComponents[sourceAClassName]);
                    }
                }
                else {
                    continue;
                }

                var totalNotSelected = SourceANotSelectedCount + SourceBNotSelectedCount;

                var statistics = checkGroupsInfo[groupName];
                var nomatchCount = parseInt(statistics['No Match']);
                var undefinedItems = parseInt(statistics['undefined Item']);

                var valueArray = [];
                valueArray.push(groupName);
                valueArray.push(nomatchCount);
                valueArray.push(undefinedItems);
                valueArray.push(totalNotSelected);
                resultArray.push(valueArray);
            }           

            var dataTable = getData(resultArray);
            var colorsArray = ["#AFD3C5", "#aebcd2"];
            drawBarChart(dataTable, "", group2_barInfo, colorsArray);
        }

    }

    AnalyticsManager.prototype.drawBarCharts = function (type,
        checkGroupsInfo) {

        if (type === "comparison") {

            var resultsArray = [];

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Error");
            titleArray.push("Warning");
            titleArray.push("Ok");
            resultsArray.push(titleArray);

            for (var groupName in checkGroupsInfo) {
                var statistics = checkGroupsInfo[groupName];
                var errorCount = parseInt(statistics['Error']);
                //var nomatchCount  = parseInt(statistics['No Match']);
                var okCount = parseInt(statistics['OK']);
                var warningCount = parseInt(statistics['Warning']);

                var valueArray = [];
                valueArray.push(groupName);
                valueArray.push(errorCount);
                valueArray.push(warningCount);
                valueArray.push(okCount);
                resultsArray.push(valueArray);
            }

            var dataTable = getData(resultsArray);
            colorsArray = ["#F43742", "#F8C13B", "#98DE32"];
            drawBarChart(dataTable, "", group2_bar, colorsArray);
        }

        if (type.toLowerCase() === "sourceacompliance") {
            var resultsArray = [];

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Error");
            titleArray.push("Warning");
            titleArray.push("Ok");
            resultsArray.push(titleArray);

            for (var groupName in checkGroupsInfo) {
                var statistics = checkGroupsInfo[groupName];
                var errorCount = parseInt(statistics['Error']);
                //var nomatchCount  = parseInt(statistics['No Match']);
                var okCount = parseInt(statistics['OK']);
                var warningCount = parseInt(statistics['Warning']);

                var valueArray = [];
                valueArray.push(groupName);
                valueArray.push(errorCount);
                valueArray.push(warningCount);
                valueArray.push(okCount);
                resultsArray.push(valueArray);
            }


            var dataTable = getData(resultsArray);
            colorsArray = ["#F43742", "#F8C13B", "#98DE32"];
            drawBarChart(dataTable, "", SourceACompliance_bar, colorsArray);
        }
        if (type.toLowerCase() === "sourcebcompliance") {


            var resultsArray = [];

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Error");
            titleArray.push("Warning");
            titleArray.push("Ok");
            resultsArray.push(titleArray);

            for (var groupName in checkGroupsInfo) {
                var statistics = checkGroupsInfo[groupName];
                var errorCount = parseInt(statistics['Error']);
                //var nomatchCount  = parseInt(statistics['No Match']);
                var okCount = parseInt(statistics['OK']);
                var warningCount = parseInt(statistics['Warning']);

                var valueArray = [];
                valueArray.push(groupName);
                valueArray.push(errorCount);
                valueArray.push(warningCount);
                valueArray.push(okCount);
                resultsArray.push(valueArray);
            }


            var dataTable = getData(resultsArray);
            colorsArray = ["#F43742", "#F8C13B", "#98DE32"];
            drawBarChart(dataTable, "", SourceBCompliance_bar, colorsArray);
        }
    }

    AnalyticsManager.prototype.drawLineCharts = function (errorCount, 
                                                        okCount, warningCount) 
    {
        if(!this.ComparisonCheckGroups)
        {
            return;
        }
        // if (this.ComparisonResultArray.length > 0) {
        //     this.ComparisonResultArray = [];
        // }
        // checkResultArray = localStorage.CheckResultArray;
        //checkResultObject = JSON.parse(checkResultArray);
        var resultsArray =[];

        var titleArray = [];
        titleArray.push("Name");
        titleArray.push("Error");
        titleArray.push("Ok");
        titleArray.push("Warning");

       resultsArray.push(titleArray);

       var valueArray = [];
       valueArray.push("Check1");
       valueArray.push(errorCount);
       valueArray.push(okCount);
       valueArray.push(warningCount);

       resultsArray.push(valueArray);

        // var counter = 1;
        // for (var checkObject in checkResultObject) {
        //     var valueArray = [];
        //     var currentCheckObject = checkResultObject[checkObject];
        //     valueArray.push("C_" + counter);
        //     counter++;

        //     valueArray.push(currentCheckObject[0]);
        //     valueArray.push(currentCheckObject[2]);
        //     valueArray.push(currentCheckObject[1]);

        //     resultsArray.push(valueArray);
        // }

        var dataTable =  getData(resultsArray);
        document.getElementById("SeverityTab").style.display = "block";
        if (document.getElementById("LineChart") !== null) {
            document.getElementById("LineChart").innerHTML = "";
        }

        colorsArray = ["#F43742", "#98DE32", "#F8C13B"];
        // if(LineChart.id !== undefined)
        // {
        drawLineChart(dataTable, "", "LineChart", colorsArray)
        // }
        // else{
        //     drawLineChart(dataTable, "", LineChart.container.id, colorsArray)
        // }

    }

    AnalyticsManager.prototype.drawInfoLineCharts = function (notCheckedCount,
        noMatchCount, undefinedCount) {

        if (!this.ComparisonCheckGroups) {
            return;
        }

        var resultsArray = [];

        titleArray = [];
        titleArray.push("Name");
        titleArray.push("Not Checked");
        titleArray.push("No match");
        titleArray.push("Undefined");
        resultsArray.push(titleArray);

        var valueArray = [];
        valueArray.push("Check1");
        valueArray.push(notCheckedCount);
        valueArray.push(noMatchCount);
        valueArray.push(undefinedCount);
        resultsArray.push(valueArray);

        var dataTable = getData(resultsArray);
        document.getElementById("InfoTab").style.display = "block";
        if (document.getElementById("InfoTabLineChart") !== null) {
            document.getElementById("InfoTabLineChart").innerHTML = "";
        }

        colorsArray = ["#AFD3C5", "#839192", "#aebcd2"];
        // if(LineChart.id !== undefined)
        // {
        drawLineChart(dataTable, "", "InfoTabLineChart", colorsArray)
        // }
        // else{
        //     drawLineChart(dataTable, "", LineChart.container.id, colorsArray)
        // }
    }
}