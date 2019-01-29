function AnalyticsManager() {
    this.ComparisonResultArray = [];
    this.ComplianceResultArrayForSourceA = [];
    this.ComplianceResultArrayForSourceB = [];

    AnalyticsManager.prototype.drawPieCharts = function (type, tabName) {
        if (this.ComparisonResultArray.length > 0) {
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
                // totalItemsChecked += components.length;
                for (var i = 0; i < components.length; i++) {
                    currentComponent = components[i];
                    if(currentComponent.SourceAName !== "")
                    {
                        totalItemsChecked += 1;
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
                    if(currentComponent.SourceBName !== "")
                    {
                        totalItemsChecked += 1;
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
            }
            //add data to summary
            document.getElementById("a37").innerText = totalItemsChecked;
            document.getElementById("a18").innerText = errorsCount;
            document.getElementById("a13").innerText = warningsCount;
            document.getElementById("a6").innerText = okCount;


            //Add comparison check data for project health(severity chart)
            var checkResultArray = localStorage.CheckResultArray;
            if (checkResultArray === undefined) {
                checkResultArray = {};
                var temp = [errorsCount, warningsCount, okCount];
                checkResultArray[Date.now()] = temp;
                localStorage.setItem("CheckResultArray", JSON.stringify(checkResultArray));
            }
            else {
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
             fixedPercent =  parseFloat((percent).toFixed(1))
            document.getElementById("a40").innerText = fixedPercent + "%";
            valueArray.push(fixedPercent);
            this.ComparisonResultArray.push(valueArray);

            var valueArray = [];
            valueArray.push("");
            complementryPercent = 100 - fixedPercent;
            complementryPercent=  parseFloat((complementryPercent).toFixed(1))
            valueArray.push(complementryPercent);
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
             fixedPercent =  parseFloat((percent).toFixed(1))
            document.getElementById("a30").innerText = fixedPercent + "%";
            valueArray.push(fixedPercent);
            this.ComparisonResultArray.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            complementryPercent = 100 - fixedPercent;
             complementryPercent=  parseFloat((complementryPercent).toFixed(1))
            valueArray.push(complementryPercent);
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
             fixedPercent =  parseFloat((percent).toFixed(1))
            document.getElementById("a10").innerText = fixedPercent + "%";
            valueArray.push(fixedPercent);
            this.ComparisonResultArray.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            complementryPercent = 100 - fixedPercent;
             complementryPercent=  parseFloat((complementryPercent).toFixed(1))
            valueArray.push(complementryPercent);
            this.ComparisonResultArray.push(valueArray);
            colorsArray = ["#98DE32", "#EDEDED"];

            getData(this.ComparisonResultArray);
            drawPieChart(dataTable, "", group5_pie, colorsArray)
        }

        if (typeof SourceAComplianceData !== 'undefined' && type === "compliance" && tabName === "ComplianceAPieChartTab") {
            if (this.ComplianceResultArrayForSourceA.length > 0) {
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
             fixedPercent =  parseFloat((percent).toFixed(1))
            document.getElementById("a40_Apie").innerText = fixedPercent + "%";
            valueArray.push(fixedPercent);
            this.ComplianceResultArrayForSourceA.push(valueArray);

            var valueArray = [];
            valueArray.push("");
            complementryPercent = 100 - fixedPercent;
             complementryPercent=  parseFloat((complementryPercent).toFixed(1))
            valueArray.push(complementryPercent);
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
             fixedPercent =  parseFloat((percent).toFixed(1))
            document.getElementById("a30_Apie").innerText = fixedPercent + "%";
            valueArray.push(fixedPercent);
            this.ComplianceResultArrayForSourceA.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            complementryPercent = 100 - fixedPercent;
             complementryPercent=  parseFloat((complementryPercent).toFixed(1))
            valueArray.push(complementryPercent);
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
             fixedPercent =  parseFloat((percent).toFixed(1))
            document.getElementById("a10_Apie").innerText = fixedPercent + "%";
            valueArray.push(fixedPercent);
            this.ComplianceResultArrayForSourceA.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            complementryPercent = 100 - fixedPercent;
             complementryPercent=  parseFloat((complementryPercent).toFixed(1))
            valueArray.push(complementryPercent);
            this.ComplianceResultArrayForSourceA.push(valueArray);
            colorsArray = ["#98DE32", "#EDEDED"];

            getData(this.ComplianceResultArrayForSourceA);
            drawPieChart(dataTable, "", SourceACompliance_pie5, colorsArray)
        }
        if (typeof SourceBComplianceData !== 'undefined' && type === "compliance" && tabName === "ComplianceBPieChartTab") {
            if (this.ComplianceResultArrayForSourceB.length > 0) {
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
             fixedPercent =  parseFloat((percent).toFixed(1))
            document.getElementById("a40_Bpie").innerText = fixedPercent + "%";
            valueArray.push(fixedPercent);
            this.ComplianceResultArrayForSourceB.push(valueArray);

            var valueArray = [];
            valueArray.push("");
            complementryPercent = 100 - fixedPercent;
             complementryPercent=  parseFloat((complementryPercent).toFixed(1))
            valueArray.push(complementryPercent);
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
             fixedPercent =  parseFloat((percent).toFixed(1))
            document.getElementById("a30_Bpie").innerText = fixedPercent + "%";
            valueArray.push(fixedPercent);
            this.ComplianceResultArrayForSourceB.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            complementryPercent = 100 - fixedPercent;
             complementryPercent=  parseFloat((complementryPercent).toFixed(1))
            valueArray.push(complementryPercent);
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
             fixedPercent =  parseFloat((percent).toFixed(1))
            document.getElementById("a10_Bpie").innerText = fixedPercent + "%";
            valueArray.push(fixedPercent);
            this.ComplianceResultArrayForSourceB.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            complementryPercent = 100 - fixedPercent;
             complementryPercent=  parseFloat((complementryPercent).toFixed(1))
            valueArray.push(complementryPercent);
            this.ComplianceResultArrayForSourceB.push(valueArray);
            colorsArray = ["#98DE32", "#EDEDED"];

            getData(this.ComplianceResultArrayForSourceB);
            drawPieChart(dataTable, "", SourceBCompliance_pie5, colorsArray)
        }
    }

    AnalyticsManager.prototype.drawInfoPieCharts = function (type, tabName) {
        if (this.ComparisonResultArray.length > 0) {
            this.ComparisonResultArray = [];
        }
        var totalItemsCount = 0;;
        var totalItemsChecked = 0;
        var totalItemsNotChecked = 0;
        var noMatchCount = 0;

        if (typeof ComparisonCheckData !== 'undefined' && type === "comparison" && typeof AnalyticsData !== 'undefined') {
            var componentGroupsArray = ComparisonCheckData.CheckComponentsGroups;
            for (var componentGroup in componentGroupsArray) {
                var components = componentGroupsArray[componentGroup].Components
                // totalItemsChecked += components.length;
                for (var i = 0; i < components.length; i++) {
                    currentComponent = components[i];
                    if (currentComponent.Status.toLowerCase() === "no match") {
                        noMatchCount++;
                    }
                    if(currentComponent.SourceAName !== "")
                    {
                        totalItemsChecked += 1;
                    }
                    if(currentComponent.SourceBName !== "")
                    {
                        totalItemsChecked += 1;
                    }
                }
            }

            totalItemsCount = AnalyticsData.SourceATotalItemCount + AnalyticsData.SourceBTotalItemCount;
            totalItemsNotChecked = totalItemsCount - totalItemsChecked;
            // if(totalItemsNotChecked < 0)
            // {
            //     totalItemsNotChecked = 0;
            // }
            //add data to summary
            document.getElementById("a37Info").innerText = totalItemsCount;
            document.getElementById("a18Info").innerText = totalItemsNotChecked ;
            document.getElementById("a13Info").innerText = noMatchCount;

            //Add comparison check data for project health(Info chart)
            var checkResultArrayForInfo = localStorage.CheckResultArrayInfo;
            if (checkResultArrayForInfo === undefined) {
                checkResultArrayForInfo = {};
                var temp = [totalItemsNotChecked, noMatchCount];
                checkResultArrayForInfo[Date.now()] = temp;
                localStorage.setItem("CheckResultArrayInfo", JSON.stringify(checkResultArrayForInfo));
            }
            else {
                StorageData = localStorage.CheckResultArrayInfo;
                StorageArray = JSON.parse(StorageData);
                var temp = [totalItemsNotChecked, noMatchCount];
                StorageArray[Date.now()] = temp;
                localStorage.setItem("CheckResultArrayInfo", JSON.stringify(StorageArray));
            }

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Value");
            this.ComparisonResultArray.push(titleArray);
            var valueArray = [];
            valueArray.push("No Match");

            var percent = noMatchCount * 100 / totalItemsChecked;
             fixedPercent =  parseFloat((percent).toFixed(1))
            document.getElementById("a40Info").innerText = fixedPercent + "%";
            document.getElementById("a40Info").style.color = "#AFD3C5";
            valueArray.push(fixedPercent);
            this.ComparisonResultArray.push(valueArray);

            var valueArray = [];
            valueArray.push("");
            complementryPercent = 100 - fixedPercent;
             complementryPercent=  parseFloat((complementryPercent).toFixed(1))
            valueArray.push(complementryPercent);
            this.ComparisonResultArray.push(valueArray);
            getData(this.ComparisonResultArray);
            colorsArray = ["#AFD3C5", "#EDEDED"]
            drawPieChart(dataTable, "", group2_pieInfo, colorsArray)

            this.ComparisonResultArray = [];

            var titleArray = [];
            titleArray.push("Name");
            titleArray.push("Value");
            this.ComparisonResultArray.push(titleArray);
            var valueArray = [];
            valueArray.push("Not Checked");
            var percent = totalItemsNotChecked * 100 / totalItemsCount;
             fixedPercent =  parseFloat((percent).toFixed(1))
            document.getElementById("a10Info").innerText = fixedPercent + "%";
            document.getElementById("a10Info").style.color = "#839192";
            valueArray.push(fixedPercent);
            this.ComparisonResultArray.push(valueArray);
            var valueArray = [];
            valueArray.push("");
            complementryPercent = 100 - fixedPercent;
             complementryPercent=  parseFloat((complementryPercent).toFixed(1))
            valueArray.push(complementryPercent);
            this.ComparisonResultArray.push(valueArray);
            colorsArray = ["#839192", "#EDEDED"];

            getData(this.ComparisonResultArray);
            drawPieChart(dataTable, "", group5_pieInfo, colorsArray)
        }

    }

    AnalyticsManager.prototype.drawInfoBarCharts = function (type, tabName) {
        if (this.ComparisonResultArray.length > 0) {
            this.ComparisonResultArray = []
        }

        var totalItemsCheckedForDataSource = 0;
        var noMatchCountForDataSource = 0;

        var totalItemsChecked = 0;

        var titleArray = [];


        if (typeof ComparisonCheckData !== 'undefined' && type === "comparison") {
            titleArray = [];
            titleArray.push("Name");
            titleArray.push("No Match");
            titleArray.push("Not Checked");
            this.ComparisonResultArray.push(titleArray);

            var componentGroupsArray = ComparisonCheckData.CheckComponentsGroups;
            for (var componentGroup in componentGroupsArray) {
                var components = componentGroupsArray[componentGroup].Components
                // totalItemsChecked += components.length;
                totalItemsCheckedForDataSource += components.length;
                var valueArray = [];
                valueArray.push(componentGroup);

                var noMatchCount = 0;
                var notCheckedCount = 0;
                var classwiseCheckedItemsCount = 0;

                for (var i = 0; i < components.length; i++) {
                    currentComponent = components[i];
                    if (currentComponent.Status.toLowerCase() === "no match") {
                        noMatchCount++;
                    }
                    if(currentComponent.SourceAName !== "")
                    {
                        totalItemsChecked += 1;
                        classwiseCheckedItemsCount +=1;
                    }
                    if(currentComponent.SourceBName !== "")
                    {
                        totalItemsChecked += 1;
                        classwiseCheckedItemsCount +=1;
                    }
                }

                noMatchCountForDataSource += noMatchCount;
                var componentGroupName = componentGroup.split("-");
                var sourceAcomponentGroupCount = AnalyticsData.SourceAClasswiseComponents[componentGroupName[0]];
                var sourceBcomponentGroupCount = AnalyticsData.SourceBClasswiseComponents[componentGroupName[1]];
                var classWiseTotalItems = sourceAcomponentGroupCount + sourceBcomponentGroupCount;
                var classWiseTotalNotCheckedItems = classWiseTotalItems - classwiseCheckedItemsCount;
                if(classWiseTotalNotCheckedItems < 0)
                {
                    classWiseTotalNotCheckedItems =0;
                }
                valueArray.push(noMatchCount);
                valueArray.push(classWiseTotalNotCheckedItems);
                this.ComparisonResultArray.push(valueArray);
            }

            var totalItemsCount = AnalyticsData.SourceATotalItemCount + AnalyticsData.SourceBTotalItemCount;
            var totalItemsNotChecked = totalItemsCount - totalItemsChecked;
            document.getElementById("a37Info").innerText = totalItemsCount;
            document.getElementById("a18Info").innerText = totalItemsNotChecked;
            document.getElementById("a13Info").innerText = noMatchCountForDataSource;


            getData(this.ComparisonResultArray);
            colorsArray = ["#AFD3C5", "#839192"];
            drawBarChart(dataTable, "", group2_barInfo, colorsArray);
        }
        
    }

    AnalyticsManager.prototype.drawBarCharts = function (type, tabName) {
        if (this.ComparisonResultArray.length > 0) {
            this.ComparisonResultArray = []
        }

        var totalItemsCheckedForDataSource = 0;
        var errorsCountForDataSource = 0;
        var warningsCountForDataSource = 0;
        var okCountForDataSource = 0;

        var totalItemsChecked = 0;
        // var okCount = 0;
        // var errorsCount = 0;
        // var warningsCount = 0;

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
                // totalItemsChecked += components.length;
                totalItemsCheckedForDataSource += components.length;
                var valueArray = [];
                valueArray.push(componentGroup);

                var okCount = 0;
                var errorsCount = 0;
                var warningsCount = 0;

                for (var i = 0; i < components.length; i++) {
                    currentComponent = components[i];
                    if(currentComponent.SourceAName !== "")
                    {
                        totalItemsChecked += 1;
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
                    if(currentComponent.SourceBName !== "")
                    {
                        totalItemsChecked += 1;
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

                errorsCountForDataSource += errorsCount;
                okCountForDataSource += okCount;
                warningsCountForDataSource += warningsCount;
                // document.getElementById("a37").innerText = totalItemsChecked;
                // document.getElementById("a18").innerText = errorsCount;
                // document.getElementById("a13").innerText = warningsCount;
                // document.getElementById("a6").innerText = okCount;

                valueArray.push(errorsCount);
                valueArray.push(warningsCount);
                valueArray.push(okCount);
                this.ComparisonResultArray.push(valueArray);
            }

            document.getElementById("a37").innerText = totalItemsChecked;
            document.getElementById("a18").innerText = errorsCountForDataSource;
            document.getElementById("a13").innerText = warningsCountForDataSource;
            document.getElementById("a6").innerText = okCountForDataSource;


            getData(this.ComparisonResultArray);
            colorsArray = ["#F43742", "#F8C13B", "#98DE32"];
            drawBarChart(dataTable, "", group2_bar, colorsArray);
        }

        if (typeof SourceAComplianceData !== 'undefined' && type === "compliance" && tabName === "ComplianceABarChartTab") {

            if (this.ComplianceResultArrayForSourceA.length > 0) {
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
                // totalItemsChecked += components.length;
                totalItemsCheckedForDataSource += components.length;

                var okCount = 0;
                var errorsCount = 0;
                var warningsCount = 0;

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

                // document.getElementById("a37").innerText = totalItemsChecked;
                // document.getElementById("a18").innerText = errorsCount;
                // document.getElementById("a13").innerText = warningsCount;
                // document.getElementById("a6").innerText = okCount;

                errorsCountForDataSource += errorsCount;
                okCountForDataSource += okCount;
                warningsCountForDataSource += warningsCount;

                valueArray.push(errorsCount);
                valueArray.push(warningsCount);
                valueArray.push(okCount);
                this.ComplianceResultArrayForSourceA.push(valueArray);
            }

            document.getElementById("a37").innerText = totalItemsCheckedForDataSource;
            document.getElementById("a18").innerText = errorsCountForDataSource;
            document.getElementById("a13").innerText = warningsCountForDataSource;
            document.getElementById("a6").innerText = okCountForDataSource;

            getData(this.ComplianceResultArrayForSourceA);
            colorsArray = ["#F43742", "#F8C13B", "#98DE32"];
            drawBarChart(dataTable, "Source A", SourceACompliance_bar, colorsArray);
        }
        if (typeof SourceBComplianceData !== 'undefined' && type === "compliance" && tabName === "ComplianceBBarChartTab") {
            if (this.ComplianceResultArrayForSourceB.length > 0) {
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
                // totalItemsChecked += components.length;
                totalItemsCheckedForDataSource += components.length;

                var okCount = 0;
                var errorsCount = 0;
                var warningsCount = 0;

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

                errorsCountForDataSource += errorsCount;
                okCountForDataSource += okCount;
                warningsCountForDataSource += warningsCount;

                // document.getElementById("a37").innerText = totalItemsChecked;
                // document.getElementById("a18").innerText = errorsCount;
                // document.getElementById("a13").innerText = warningsCount;
                // document.getElementById("a6").innerText = okCount;

                valueArray.push(errorsCount);
                valueArray.push(warningsCount);
                valueArray.push(okCount);
                this.ComplianceResultArrayForSourceB.push(valueArray);
            }

            document.getElementById("a37").innerText = totalItemsCheckedForDataSource;
            document.getElementById("a18").innerText = errorsCountForDataSource;
            document.getElementById("a13").innerText = warningsCountForDataSource;
            document.getElementById("a6").innerText = okCountForDataSource;

            getData(this.ComplianceResultArrayForSourceB);
            colorsArray = ["#F43742", "#F8C13B", "#98DE32"];
            drawBarChart(dataTable, "Source B", SourceBCompliance_bar, colorsArray);
        }
    }

    AnalyticsManager.prototype.drawLineCharts = function () {
        if (this.ComparisonResultArray.length > 0) {
            this.ComparisonResultArray = [];
        }
        checkResultArray = localStorage.CheckResultArray;
        checkResultObject = JSON.parse(checkResultArray);
        titleArray = [];
        titleArray.push("Name");
        titleArray.push("Error");
        titleArray.push("Ok");
        titleArray.push("Warning");
        
        this.ComparisonResultArray.push(titleArray);

        var counter = 1;
        for (var checkObject in checkResultObject) {
            var valueArray = [];
            var currentCheckObject = checkResultObject[checkObject];
            valueArray.push("C_" + counter);
            counter++;

            valueArray.push(currentCheckObject[0]);
            valueArray.push(currentCheckObject[2]);
            valueArray.push(currentCheckObject[1]);
            
            this.ComparisonResultArray.push(valueArray);
        }

        getData(this.ComparisonResultArray);
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

    AnalyticsManager.prototype.drawInfoLineCharts = function () {
        if (this.ComparisonResultArray.length > 0) {
            this.ComparisonResultArray = [];
        }
        checkResultArrayForInfo = localStorage.CheckResultArrayInfo;
        checkResultObject = JSON.parse(checkResultArrayForInfo);
        titleArray = [];
        titleArray.push("Name");
        titleArray.push("Not Checked");
        titleArray.push("No match");
        this.ComparisonResultArray.push(titleArray);

        var counter = 1;
        for (var checkObject in checkResultObject) {
            var valueArray = [];
            var currentCheckObject = checkResultObject[checkObject];
            valueArray.push("C_" + counter);
            counter++;

            valueArray.push(currentCheckObject[0]);
            valueArray.push(currentCheckObject[1]);
            this.ComparisonResultArray.push(valueArray);
        }

        getData(this.ComparisonResultArray);
        document.getElementById("InfoTab").style.display = "block";
        if (document.getElementById("InfoTabLineChart") !== null) {
            document.getElementById("InfoTabLineChart").innerHTML = "";
        }

        colorsArray = ["#AFD3C5", "#839192"];
        // if(LineChart.id !== undefined)
        // {
        drawLineChart(dataTable, "", "InfoTabLineChart", colorsArray)
        // }
        // else{
        //     drawLineChart(dataTable, "", LineChart.container.id, colorsArray)
        // }

    }
}