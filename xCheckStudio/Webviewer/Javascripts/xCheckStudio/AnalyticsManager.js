function AnalyticsManager() {
    this.ComparisonResultArray = [];
    this.ComplianceResultArrayForSourceA = [];
    this.ComplianceResultArrayForSourceB = [];

    AnalyticsManager.prototype.drawPieCharts = function(type, tabName){
        if(this.ComparisonResultArray.length > 0)
        {
            this.ComparisonResultArray = [];
        }
        
        var totalItemsChecked = 0;
        var errorsCount = 0;
        var warningsCount = 0;
        var okCount = 0;

        if (typeof ComparisonCheckData !== 'undefined' && type === "comparison") {
            var componentGroupsArray = ComparisonCheckData.CheckComponentsGroups;
            for (var componentGroup in componentGroupsArray) {
                var components = componentGroupsArray[componentGroup].Components
                totalItemsChecked += components.length;
                for (var i = 0; i < components.length; i++) {
                    currentComponent = components[i];
                    if (currentComponent.Status.toLowerCase() === "ok") {
                        okCount++;
                    }
                    if (currentComponent.Status.toLowerCase() === "error") {
                        errorsCount++;
                    }
                    if (currentComponent.Status.toLowerCase() === "warning") {
                        warningsCount++;
                    }
                }
            }

            //add data to summary
            document.getElementById("a37").innerText = totalItemsChecked;
            document.getElementById("a18").innerText = errorsCount;
            document.getElementById("a13").innerText = warningsCount;
            document.getElementById("a6").innerText = okCount;

            
            //Add comparison check data for project health(severity chart)
            var checkResultArray = localStorage.CheckResultArray;
            if(checkResultArray === undefined)
            {
                checkResultArray = {};
                var temp = [errorsCount, warningsCount, okCount];
                checkResultArray[Date.now()] = temp;
                localStorage.setItem("CheckResultArray", JSON.stringify(checkResultArray));
            }
            else{
                StorageData = localStorage.CheckResultArray;
                StorageArray = JSON.parse(StorageData);
                // if(Object.keys(StorageArray).length >= 10)
                // {
                //     var firstElement = Object.keys(StorageArray)[0];
                //     delete StorageArray[firstElement];
                // }
                var temp = [errorsCount, warningsCount, okCount];
                StorageArray[Date.now()] = temp;
                localStorage.setItem("CheckResultArray", JSON.stringify(StorageArray));
            }

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Value");
            this.ComparisonResultArray.push(titleArray);
            var valueArray = [];
            valueArray.push("Error");

            var percent = errorsCount * 100 / totalItemsChecked;
            document.getElementById("a40").innerText = Math.round(percent) + "%";
            valueArray.push(percent);
            this.ComparisonResultArray.push(valueArray);

            var valueArray = [];
            valueArray.push("");
            valueArray.push(100 - percent);
            this.ComparisonResultArray.push(valueArray);
            getData(this.ComparisonResultArray);
            colorsArray = ["#F43742", "#EDEDED"]
            drawPieChart(dataTable, "", group2_pie, colorsArray)

            this.ComparisonResultArray = [];

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Value");
            this.ComparisonResultArray.push(titleArray);
            var valueArray = [];
            valueArray.push("Warning");
            var percent = warningsCount * 100 / totalItemsChecked;
            document.getElementById("a30").innerText = Math.round(percent) + "%";
            valueArray.push(percent);
            this.ComparisonResultArray.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            valueArray.push(100 - percent);
            this.ComparisonResultArray.push(valueArray);
            colorsArray = ["#F8C13B", "#EDEDED"]
            getData(this.ComparisonResultArray);
            drawPieChart(dataTable, "", group4_pie, colorsArray)

            this.ComparisonResultArray = [];

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Value");
            this.ComparisonResultArray.push(titleArray);
            var valueArray = [];
            valueArray.push("Ok");
            var percent = okCount * 100 / totalItemsChecked;
            document.getElementById("a10").innerText = Math.round(percent) + "%";
            valueArray.push(percent);
            this.ComparisonResultArray.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            valueArray.push(100 - percent);
            this.ComparisonResultArray.push(valueArray);
            colorsArray = ["#98DE32", "#EDEDED"] ;     

            getData(this.ComparisonResultArray);
            drawPieChart(dataTable, "", group5_pie, colorsArray)
        }
        
        if (typeof SourceAComplianceData !== 'undefined' && type === "compliance"  && tabName === "ComplianceAPieChartTab" ) {
            if(this.ComplianceResultArrayForSourceA.length > 0)
            {
                this.ComplianceResultArrayForSourceA = [];
            }

            var componentGroupsArray = SourceAComplianceData.CheckComponentsGroups;
            for (var componentGroup in componentGroupsArray) {
                var components = componentGroupsArray[componentGroup].Components
                totalItemsChecked += components.length;
                for (var i = 0; i < components.length; i++) {
                    currentComponent = components[i];
                    if (currentComponent.Status.toLowerCase() === "ok") {
                        okCount++;
                    }
                    if (currentComponent.Status.toLowerCase() === "error") {
                        errorsCount++;
                    }
                    if (currentComponent.Status.toLowerCase() === "warning") {
                        warningsCount++;
                    }
                }
            }
           
            //add data to summary
            document.getElementById("a37").innerText = totalItemsChecked;
            document.getElementById("a18").innerText = errorsCount;
            document.getElementById("a13").innerText = warningsCount;
            document.getElementById("a6").innerText = okCount;

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Value");
            this.ComplianceResultArrayForSourceA.push(titleArray);
            var valueArray = [];
            valueArray.push("Error");

            var percent = errorsCount * 100 / totalItemsChecked;
            document.getElementById("a40_Apie").innerText = Math.round(percent) + "%";
            valueArray.push(percent);
            this.ComplianceResultArrayForSourceA.push(valueArray);

            var valueArray = [];
            valueArray.push("");
            valueArray.push(100 - percent);
            this.ComplianceResultArrayForSourceA.push(valueArray);
            getData(this.ComplianceResultArrayForSourceA);
            colorsArray = ["#F43742", "#EDEDED"]
            drawPieChart(dataTable, "", SourceACompliance_pie2, colorsArray)

            this.ComplianceResultArrayForSourceA = [];

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Value");
            this.ComplianceResultArrayForSourceA.push(titleArray);
            var valueArray = [];
            valueArray.push("Warning");
            var percent = warningsCount * 100 / totalItemsChecked;
            document.getElementById("a30_Apie").innerText = Math.round(percent) + "%";
            valueArray.push(percent);
            this.ComplianceResultArrayForSourceA.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            valueArray.push(100 - percent);
            this.ComplianceResultArrayForSourceA.push(valueArray);
            colorsArray = ["#F8C13B", "#EDEDED"]
            getData(this.ComplianceResultArrayForSourceA);
            drawPieChart(dataTable, "", SourceACompliance_pie4, colorsArray)

            this.ComplianceResultArrayForSourceA = [];

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Value");
            this.ComplianceResultArrayForSourceA.push(titleArray);
            var valueArray = [];
            valueArray.push("Ok");
            var percent = okCount * 100 / totalItemsChecked;
            document.getElementById("a10_Apie").innerText = Math.round(percent) + "%";
            valueArray.push(percent);
            this.ComplianceResultArrayForSourceA.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            valueArray.push(100 - percent);
            this.ComplianceResultArrayForSourceA.push(valueArray);
            colorsArray = ["#98DE32", "#EDEDED"] ;     

            getData(this.ComplianceResultArrayForSourceA);
            drawPieChart(dataTable, "", SourceACompliance_pie5, colorsArray)
        }
        if (typeof SourceBComplianceData !== 'undefined' && type === "compliance" && tabName === "ComplianceBPieChartTab" ) {
            if(this.ComplianceResultArrayForSourceB.length > 0)
            {
                this.ComplianceResultArrayForSourceB = [];
            }

            var componentGroupsArray = SourceBComplianceData.CheckComponentsGroups;
            for (var componentGroup in componentGroupsArray) {
                var components = componentGroupsArray[componentGroup].Components
                totalItemsChecked += components.length;
                for (var i = 0; i < components.length; i++) {
                    currentComponent = components[i];
                    if (currentComponent.Status.toLowerCase() === "ok") {
                        okCount++;
                    }
                    if (currentComponent.Status.toLowerCase() === "error") {
                        errorsCount++;
                    }
                    if (currentComponent.Status.toLowerCase() === "warning") {
                        warningsCount++;
                    }
                }
            }

            //add data to summary
            document.getElementById("a37").innerText = totalItemsChecked;
            document.getElementById("a18").innerText = errorsCount;
            document.getElementById("a13").innerText = warningsCount;
            document.getElementById("a6").innerText = okCount;

            
            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Value");
            this.ComplianceResultArrayForSourceB.push(titleArray);
            var valueArray = [];
            valueArray.push("Error");

            var percent = errorsCount * 100 / totalItemsChecked;
            document.getElementById("a40_Bpie").innerText = Math.round(percent) + "%";
            valueArray.push(percent);
            this.ComplianceResultArrayForSourceB.push(valueArray);

            var valueArray = [];
            valueArray.push("");
            valueArray.push(100 - percent);
            this.ComplianceResultArrayForSourceB.push(valueArray);
            getData(this.ComplianceResultArrayForSourceB);
            colorsArray = ["#F43742", "#EDEDED"]
            drawPieChart(dataTable, "", SourceBCompliance_pie2, colorsArray)

            this.ComplianceResultArrayForSourceB = [];

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Value");
            this.ComplianceResultArrayForSourceB.push(titleArray);
            var valueArray = [];
            valueArray.push("Warning");
            var percent = warningsCount * 100 / totalItemsChecked;
            document.getElementById("a30_Bpie").innerText = Math.round(percent) + "%";
            valueArray.push(percent);
            this.ComplianceResultArrayForSourceB.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            valueArray.push(100 - percent);
            this.ComplianceResultArrayForSourceB.push(valueArray);
            colorsArray = ["#F8C13B", "#EDEDED"]
            getData(this.ComplianceResultArrayForSourceB);
            drawPieChart(dataTable, "", SourceBCompliance_pie4, colorsArray)

            this.ComplianceResultArrayForSourceB = [];

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Value");
            this.ComplianceResultArrayForSourceB.push(titleArray);
            var valueArray = [];
            valueArray.push("Ok");
            var percent = okCount * 100 / totalItemsChecked;
            document.getElementById("a10_Bpie").innerText = Math.round(percent) + "%";
            valueArray.push(percent);
            this.ComplianceResultArrayForSourceB.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            valueArray.push(100 - percent);
            this.ComplianceResultArrayForSourceB.push(valueArray);
            colorsArray = ["#98DE32", "#EDEDED"] ;     

            getData(this.ComplianceResultArrayForSourceB);
            drawPieChart(dataTable, "", SourceBCompliance_pie5, colorsArray)
        }
    }

    AnalyticsManager.prototype.drawBarCharts = function(type, tabName){
        if(this.ComparisonResultArray.length > 0)
        {
            this.ComparisonResultArray = []
        }
        
        var totalItemsChecked = 0;
        var errorsCount = 0;
        var warningsCount = 0;
        var okCount = 0;

        var titleArray = [];
        

        if (typeof ComparisonCheckData !== 'undefined' && type === "comparison") {
            titleArray = [];
            titleArray.push("Name");
            titleArray.push("Error");
            titleArray.push("Warning");
            titleArray.push("Ok");
            this.ComparisonResultArray.push(titleArray);

            var componentGroupsArray = ComparisonCheckData.CheckComponentsGroups;
            for (var componentGroup in componentGroupsArray) {
                var components = componentGroupsArray[componentGroup].Components
                totalItemsChecked += components.length;
                var valueArray = [];
                valueArray.push(componentGroup);
                for (var i = 0; i < components.length; i++) {
                    currentComponent = components[i];
                    if (currentComponent.Status.toLowerCase() === "ok") {
                        okCount++;
                    }
                    if (currentComponent.Status.toLowerCase() === "error") {
                        errorsCount++;
                    }
                    if (currentComponent.Status.toLowerCase() === "warning") {
                        warningsCount++;
                    }
                }

                document.getElementById("a37").innerText = totalItemsChecked;
                document.getElementById("a18").innerText = errorsCount;
                document.getElementById("a13").innerText = warningsCount;
                document.getElementById("a6").innerText = okCount;

                valueArray.push(errorsCount);
                valueArray.push(warningsCount);
                valueArray.push(okCount);
                this.ComparisonResultArray.push(valueArray);
            }
            
            getData(this.ComparisonResultArray);
            colorsArray = ["#F43742", "#F8C13B", "#98DE32"];
            drawBarChart(dataTable, "", group2_bar, colorsArray);
        }
        
        if (typeof SourceAComplianceData !== 'undefined' && type === "compliance" && tabName === "ComplianceABarChartTab") {
            
            if(this.ComplianceResultArrayForSourceA.length > 0)
            {
                this.ComplianceResultArrayForSourceA = [];
            }

            titleArray = [];
            titleArray.push("Name");
            titleArray.push("Error");
            titleArray.push("Warning");
            titleArray.push("Ok");
            this.ComplianceResultArrayForSourceA.push(titleArray);

            var componentGroupsArray = SourceAComplianceData.CheckComponentsGroups;
            for (var componentGroup in componentGroupsArray) {
                var components = componentGroupsArray[componentGroup].Components
                totalItemsChecked += components.length;
                var valueArray = [];
                valueArray.push(componentGroup);
                for (var i = 0; i < components.length; i++) {
                    currentComponent = components[i];
                    if (currentComponent.Status.toLowerCase() === "ok") {
                        okCount++;
                    }
                    if (currentComponent.Status.toLowerCase() === "error") {
                        errorsCount++;
                    }
                    if (currentComponent.Status.toLowerCase() === "warning") {
                        warningsCount++;
                    }
                }

                document.getElementById("a37").innerText = totalItemsChecked;
                document.getElementById("a18").innerText = errorsCount;
                document.getElementById("a13").innerText = warningsCount;
                document.getElementById("a6").innerText = okCount;

                valueArray.push(errorsCount);
                valueArray.push(warningsCount);
                valueArray.push(okCount);
                this.ComplianceResultArrayForSourceA.push(valueArray);
            }

            getData(this.ComplianceResultArrayForSourceA);
            colorsArray = ["#F43742", "#F8C13B", "#98DE32"];
            drawBarChart(dataTable, "Source A", SourceACompliance_bar, colorsArray);
        }
        if (typeof SourceBComplianceData !== 'undefined' && type === "compliance" && tabName === "ComplianceBBarChartTab") {
            if(this.ComplianceResultArrayForSourceB.length > 0)
            {
                this.ComplianceResultArrayForSourceB = [];
            }
            
            titleArray = [];
            titleArray.push("Name");
            titleArray.push("Error");
            titleArray.push("Warning");
            titleArray.push("Ok");
            this.ComplianceResultArrayForSourceB.push(titleArray);

            var componentGroupsArray = SourceBComplianceData.CheckComponentsGroups;
            for (var componentGroup in componentGroupsArray) {
                var components = componentGroupsArray[componentGroup].Components
                totalItemsChecked += components.length;
                var valueArray = [];
                valueArray.push(componentGroup);
                for (var i = 0; i < components.length; i++) {
                    currentComponent = components[i];
                    if (currentComponent.Status.toLowerCase() === "ok") {
                        okCount++;
                    }
                    if (currentComponent.Status.toLowerCase() === "error") {
                        errorsCount++;
                    }
                    if (currentComponent.Status.toLowerCase() === "warning") {
                        warningsCount++;
                    }
                }

                document.getElementById("a37").innerText = totalItemsChecked;
                document.getElementById("a18").innerText = errorsCount;
                document.getElementById("a13").innerText = warningsCount;
                document.getElementById("a6").innerText = okCount;

                valueArray.push(errorsCount);
                valueArray.push(warningsCount);
                valueArray.push(okCount);
                this.ComplianceResultArrayForSourceB.push(valueArray);
            }


            getData(this.ComplianceResultArrayForSourceB);
            colorsArray = ["#F43742", "#F8C13B", "#98DE32"];
            drawBarChart(dataTable, "Source B", SourceBCompliance_bar, colorsArray);
        }
    }

    AnalyticsManager.prototype.drawLineCharts = function(){
        if(this.ComparisonResultArray.length > 0)
        {
            this.ComparisonResultArray = [];
        }
        checkResultArray = localStorage.CheckResultArray;
        checkResultObject = JSON.parse(checkResultArray);
        titleArray = [];
        titleArray.push("Name");
        titleArray.push("Error");
        titleArray.push("Warning");
        titleArray.push("Ok");
        this.ComparisonResultArray.push(titleArray);

        var counter = 1;
        for(var checkObject in checkResultObject)
        {
            var valueArray = [];
            var currentCheckObject = checkResultObject[checkObject];
            valueArray.push("C_"+counter);
            counter++;

            valueArray.push(currentCheckObject[0]);
            valueArray.push(currentCheckObject[1]);
            valueArray.push(currentCheckObject[2]);
            this.ComparisonResultArray.push(valueArray);
        }

        getData(this.ComparisonResultArray);
        document.getElementById("SeverityTab").style.display = "block";
        if(document.getElementById("LineChart") !== null)
        {
            document.getElementById("LineChart").innerHTML = "";
        }
        
        colorsArray = ["#F43742", "#F8C13B", "#98DE32"];
        // if(LineChart.id !== undefined)
        // {
            drawLineChart(dataTable, "", LineChart, colorsArray)
        // }
        // else{
        //     drawLineChart(dataTable, "", LineChart.container.id, colorsArray)
        // }
        
    }
}