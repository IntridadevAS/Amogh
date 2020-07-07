let Analytics = {
    AnalyticsData : {},

    ShowSmallAnalytics: function (parentContainer, analyticsContainerId) {
        var _this = this;

        parentContainer.style.display = "none";
        document.getElementById(analyticsContainerId).style.display = "block";

        // if(Object.keys(this.AnalyticsData).length > 0) {
        //     _this.LoadSmallAnalytics(analyticsContainerId);
        // }
        // else {
        this.GetAnalyticsData().then(function () {
            _this.LoadSmallAnalytics(analyticsContainerId);
        });
        // }
    },

    ShowLargeAnalytics: function () {
        var _this = this;
        var modal = document.getElementById(Comparison.LargeAnalyticsContainer);
        modal.style.display = "block";

        // if(Object.keys(this.AnalyticsData).length > 0) {
        //     _this.LoadLargeAnalytics();
        // }
        // else {
        this.GetAnalyticsData().then(function () {
            _this.LoadLargeAnalytics();
        });
        // }
    },
    
    GetAnalyticsData : function() {
        var _this = this;
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        return new Promise((resolve) => {
            //get comparison results
            let comparisonCheckData = null;
            if ("Comparisons" in checkResults &&
                checkResults["Comparisons"].length > 0) {
                comparisonCheckData = checkResults["Comparisons"][0];
            }

            $.ajax({
                url: 'PHP/AnalyticsDataReader.php',
                type: "POST",
                async: true,
                data: { 
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname
                },
                success : function(msg) {
                    var analyticsData = JSON.parse(msg);

                    // update not checked comps
                    if ("comparison" in analyticsData &&
                        comparisonCheckData !== null) {

                        var comparisonData = analyticsData["comparison"];
                        var checkResults = comparisonCheckData.results;
                        var sources = comparisonCheckData.sources;

                        var sourceANotChecked = Number(comparisonData.sourceATotalComponentsCount) - Number(comparisonData.sourceASelectedCount);
                        var sourceBNotChecked = Number(comparisonData.sourceBTotalComponentsCount) - Number(comparisonData.sourceBSelectedCount);
                        var sourceCNotChecked = 0;
                        var sourceDNotChecked = 0;
                        if (sources.length > 2) {
                            sourceCNotSelected = Number(comparisonData.sourceCTotalComponentsCount) - Number(comparisonData.sourceCSelectedCount);
                        }
                        if (sources.length > 3) {
                            sourceDNotSelected = Number(comparisonData.sourceDTotalComponentsCount) - Number(comparisonData.sourceDSelectedCount);
                        }

                        // var checkResults = model.checks["comparison"].reviewManager.ComparisonCheckManager.results;
                        // var sources = model.checks["comparison"].reviewManager.ComparisonCheckManager.sources;

                        for (var groupId in checkResults) {
                            var group = checkResults[groupId];
                            for (var checkCompId in  group.components) {
                                var checkComponent = group.components[checkCompId];

                                // source a
                                if (sourceANotChecked > 0 &&
                                    checkComponent.sourceAName &&
                                    checkComponent.sourceAName != "" &&
                                    checkComponent.sourceAId in comparisonData.NotSelectedCompsData["a"]) {
                                    sourceANotChecked -= 1;
                                }

                                // source b
                                if (sourceBNotChecked > 0 &&
                                    checkComponent.sourceBName &&
                                    checkComponent.sourceBName != "" &&
                                    checkComponent.sourceBId in comparisonData.NotSelectedCompsData["b"]) {
                                    sourceBNotChecked -= 1;
                                }

                                // source c
                                if (sources.length > 2 &&
                                    sourceCNotChecked > 0 &&
                                    checkComponent.sourceCName &&
                                    checkComponent.sourceCName != "" &&
                                    checkComponent.sourceCId in comparisonData.NotSelectedCompsData["c"]) {
                                    sourceCNotChecked -= 1;
                                }

                                // source d
                                if (sources.length > 3 &&
                                    sourceDNotChecked > 0 &&
                                    checkComponent.sourceDName &&
                                    checkComponent.sourceDName != "" &&
                                    checkComponent.sourceDId in comparisonData.NotSelectedCompsData["d"]) {
                                    sourceDNotChecked -= 1;
                                }
                            }
                        }

                        analyticsData["comparison"]["sourceANotChecked"] = sourceANotChecked;
                        analyticsData["comparison"]["sourceBNotChecked"] = sourceBNotChecked;
                        analyticsData["comparison"]["sourceCNotChecked"] = sourceCNotChecked;
                        analyticsData["comparison"]["sourceDNotChecked"] = sourceDNotChecked;
                    }

                    _this.AnalyticsData = analyticsData;
                    return resolve(true);
                }
            });
        });
    },

    LoadSmallAnalytics : function(analyticsContainerId) {
        var currentCheck = GetCurrentCheck();
        if(analyticsContainerId.includes("comparison")) {
            document.getElementById("IFrameSmallAnalyticsComparison").contentWindow.LoadAnalyticsContent(this.AnalyticsData, currentCheck);
        }
        else {
            document.getElementById("IFrameSmallAnalyticsCompliance").contentWindow.LoadAnalyticsContent(this.AnalyticsData, currentCheck);
        }
        // this.InitAnalyticsContextMenu("#" + analyticsContainerId);
    },

    LoadLargeAnalytics : function() {
        var currentCheck = GetCurrentCheck();
        document.getElementById("IFramelargeAnalytics").contentWindow.LoadAnalyticsContent(this.AnalyticsData, currentCheck);
    },

    ShowAnalytics: function (selected) {
        let parent = selected.parentNode;
    
        if (selected.id == Comparison.AnalyticsButton && model.selectedComparisons.length > 0) {
          if (!parent.classList.contains("maximize")) {
            this.ShowSmallAnalytics(parent, Comparison.SmallAnalyticsContainer);
          }
          else {
            this.ShowLargeAnalytics();
          }
        }
        else if (selected.id == Compliance.AnalyticsButton && model.selectedCompliance) {
          if (!parent.classList.contains("maximize")) {
            this.ShowSmallAnalytics(parent, Compliance.SmallAnalyticsContainer);
          }
          else {
            this.ShowLargeAnalytics();
          }
        }
    },

    GetSubClassMappingForHighlightedRow: function() {
        var highlightedRow = model.checks[model.currentCheck].selectionManager.HighlightedCheckComponentRow;
        var dataGrid = $(highlightedRow.tableId).dxDataGrid("instance");
        var data = dataGrid.getDataSource().items();
        var rowIndex = dataGrid.getRowIndexByKey(highlightedRow["rowKey"]);
        var rowData = data[rowIndex];
        var subClass;
        var component = model.getCurrentReviewManager().GetCheckComponent(rowData.groupId, rowData.ID);
        if(rowData.status == 'No Match') {
            if(component.sourceASubComponentClass !== null) {
                subClass = component.sourceASubComponentClass;
            }
            else if(component.sourceBSubComponentClass !== null) {
                subClass = component.sourceBSubComponentClass;
            }
            else if(component.sourceCSubComponentClass !== null) {
                subClass = component.sourceCSubComponentClass;
            }
            else if(component.sourceDSubComponentClass !== null) {
                subClass = component.sourceDSubComponentClass;
            }
        }
        else {
            if(model.currentCheck.includes("comparison")) {
                subClass = rowData.ClassMappingInfo.split(":");
                subClass = subClass[1].trim();
            }
            else {
                subClass = component.subComponentClass;
            }
           
        }

        if(subClass) {
            return subClass;
        }

        return undefined;
    },

    GetActiveCategory: function() {
        var expandedItem;
        if(model.currentCheck == 'comparison') {
          expandedItem = $("#" + Comparison.MainReviewContainer).dxAccordion("instance").option("selectedItem");
        }
        else {
          expandedItem = $("#" + Compliance.MainReviewContainer).dxAccordion("instance").option("selectedItem");
        }
        
        if(expandedItem) {
          return expandedItem.title;
        }
  
        return undefined;
    },

    GetSubClassAnalyticsData :   function() {
        var ComponentAnalytics = {};
        var subclassMapping = GetSubClassMappingForHighlightedRow();
        var highlightedRow = model.checks[model.currentCheck].selectionManager.HighlightedCheckComponentRow;
        var dataGrid = $(highlightedRow.tableId).dxDataGrid("instance");
        var data = dataGrid.getDataSource().items();

        for(var rowIndex in data) {
            var rowData = data[rowIndex];

            var component = model.getCurrentReviewManager().GetCheckComponent(rowData.groupId, rowData.ID);
            var subClass = "";
            if(rowData.status == 'No Match') {
                var component = model.getCurrentReviewManager().GetCheckComponent(rowData.groupId, rowData.ID);
                if(component.sourceASubComponentClass !== null) {
                    subClass = component.sourceASubComponentClass;
                }
                else if(component.sourceBSubComponentClass !== null) {
                    subClass = component.sourceBSubComponentClass;
                }
                else if(component.sourceCSubComponentClass !== null) {
                    subClass = component.sourceCSubComponentClass;
                }
                else if(component.sourceDSubComponentClass !== null) {
                    subClass = component.sourceDSubComponentClass;
                }
            }
            else {
                if(model.currentCheck.includes("comparison")) {
                    subClass = rowData.ClassMappingInfo.split(":");
                    subClass = subClass[1].trim();
                }
                else {
                    subClass = component.subComponentClass;
                }
            }

            if(subclassMapping == subClass) {
                var component = model.getCurrentReviewManager().GetCheckComponent(rowData.groupId, rowData.ID);
                var properties = component.properties;

                var componentName = "";

                if(component.sourceAName != null) {
                    componentName = component.sourceAName;
                }
                if(component.sourceBName != null) {
                    if(componentName != "") {
                        componentName = componentName + " & " + component.sourceBName;
                    }
                    else {
                        componentName = component.sourceBName;
                    }
                }
                if(component.sourceCName != null) {
                    if(componentName != "") {
                        componentName = componentName + " & " + component.sourceCName;
                    }
                    else {
                        componentName = component.sourceCName;
                    }
                }
                if(component.sourceDName != null) {
                    if(componentName != "") {
                        componentName = componentName + " & " + component.sourceDName;
                    }
                    else {
                        componentName = component.sourceDName;
                    }
                }

                var analyticsData = this.GetPropertyAnalytics(properties);

                if(componentName == "") {
                    componentName = component.name;
                }
                ComponentAnalytics[componentName] = analyticsData;
            }
        }

        return ComponentAnalytics;
    },

    GetComponentAnalyticsData : function() {
        var highlightedRow = model.checks[model.currentCheck].selectionManager.HighlightedCheckComponentRow;
        var dataGrid = $(highlightedRow.tableId).dxDataGrid("instance");
        var data = dataGrid.getDataSource().items();
        var rowIndex = dataGrid.getRowIndexByKey(highlightedRow["rowKey"]);
        var rowData = data[rowIndex];
        var component = model.getCurrentReviewManager().GetCheckComponent(rowData.groupId, rowData.ID);
        var properties = component.properties;

        var componentName = "";

        if(component.sourceAName != null) {
            componentName = component.sourceAName;
        }
        if(component.sourceBName != null) {
            if(componentName != "") {
                componentName = componentName + " & " + component.sourceBName;
            }
            else {
                componentName = component.sourceBName;
            }
        }
        if(component.sourceCName != null) {
            if(componentName != "") {
                componentName = componentName + " & " + component.sourceCName;
            }
            else {
                componentName = component.sourceCName;
            }
        }
        if(component.sourceDName != null) {
            if(componentName != "") {
                componentName = componentName + " & " + component.sourceDName;
            }
            else {
                componentName = component.sourceDName;
            }
        }

        var analyticsData = this.GetPropertyAnalytics(properties);

        return [componentName, analyticsData];

    },

    GetPropertyAnalytics : function(properties) {
        var error = 0;
        var warning = 0;
        var ok = 0;
        var missing = 0;
        var undefinedItems = 0;
        var okat = 0;

        for(var i = 0; i < properties.length; i++) {
            if(properties[i].severity.toLowerCase().includes("error")) {
                error++;
            }
            else if(properties[i].severity.toLowerCase().includes("warning")) {
                warning++;
            }
            else if(properties[i].severity.toLowerCase().includes("ok")) {
                ok++;
            }
            else {
                missing++;
            }

            if(properties[i].severity.toLowerCase() == 'ok(a)' || properties[i].severity.toLowerCase() == 'ok(t)') {
                okat++;
            }
        }

        return {"Error" : error, "Warning" : warning, "OK" : ok, "No Match" : missing, "undefined Item": undefinedItems, "okAT" : okat}
    }



}

