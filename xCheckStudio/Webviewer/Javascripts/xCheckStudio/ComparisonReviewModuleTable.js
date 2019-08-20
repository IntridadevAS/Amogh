function ComparisonReviewModuleTable(comparisonReviewManager,
    mainReviewTableContainer) {

    this.ComparisonTableData = comparisonReviewManager.ComparisonCheckManager;
    this.MainReviewTableContainer = mainReviewTableContainer;
    this.comparisonReviewManager = comparisonReviewManager;

    ComparisonReviewModuleTable.prototype.CreateCheckGroupButton = function(groupId, componentClass)
    {
        
        var btn = document.createElement("BUTTON");
        var att = document.createAttribute("groupId");
        att.value = groupId;
        btn.setAttributeNode(att);       // Create a <button> element
        btn.className = "collapsible";
        var t = document.createTextNode(componentClass);       // Create a text node
        btn.appendChild(t);

        return btn;
    }

    ComparisonReviewModuleTable.prototype.CreateMainTableHeaders = function()
    {
        var columnHeaders = [];
        for (var i = 1; i < Object.keys(ComparisonColumns).length; i++) {
            columnHeader = {};
            var headerText;
            if (i === ComparisonColumns.Select) {
                continue;
            }
            else if (i === ComparisonColumns.SourceAName) {
                headerText = 'SourceA';
                key = ComparisonColumnNames.SourceAName;
                width = "35%";
            }
            else if (i === ComparisonColumns.SourceBName) {
                headerText = "SourceB";
                key = ComparisonColumnNames.SourceBName;
                width = "35%";
            }
            else if (i === ComparisonColumns.Status) {
                headerText = "Status";
                key = ComparisonColumnNames.Status;
                width = "30%";
            }
            else if (i === ComparisonColumns.SourceANodeId) 
            {
                headerText = "SourceANodeId";
                key = ComparisonColumnNames.SourceANodeId;
                width = "0%";
            }
            else if (i === ComparisonColumns.SourceBNodeId) 
            {
                headerText = "SourceBNodeId";
                key = ComparisonColumnNames.SourceBNodeId;
                width = "0%";
            }
            else if (i === ComparisonColumns.ResultId) 
            {
                headerText = "ID";
                key = ComparisonColumnNames.ResultId;
                width = "0%";
            }
            else if (i === ComparisonColumns.GroupId) 
            {
                headerText = "groupId";
                key = ComparisonColumnNames.GroupId;
                width = "0%";
            }

            columnHeader["headerText"] = headerText;
            columnHeader["key"] = key;
            columnHeader["dataType"] = "string";
            columnHeader["width"] = width;
            columnHeaders.push(columnHeader);
        }

        return columnHeaders;
    }

    ComparisonReviewModuleTable.prototype.CreateTableData =function(checkComponents, 
        groupId,
        mainClass)
    {

        var _this = this;
        var tableData = [];
            for (var componentId in checkComponents)
            {
            // if (!componentsGroup.CheckComponents.hasOwnProperty(componentId)) {
            //     continue;
            // }

            component = checkComponents[componentId];            

            tableRowContent = {};
               
            tableRowContent[ComparisonColumnNames.SourceAName] = component.SourceAName;
            tableRowContent[ComparisonColumnNames.SourceBName] = component.SourceBName;
            tableRowContent[ComparisonColumnNames.Status] = component.Status;
            tableRowContent[ComparisonColumnNames.SourceANodeId] = component.SourceANodeId;
            tableRowContent[ComparisonColumnNames.SourceBNodeId] = component.SourceBNodeId;
            tableRowContent[ComparisonColumnNames.ResultId] = component.ID;
            tableRowContent[ComparisonColumnNames.GroupId] = groupId;

            tableData.push(tableRowContent);

            this.comparisonReviewManager.MaintainNodeIdVsCheckComponent(component, mainClass);
        }

        return tableData;   
    }

    ComparisonReviewModuleTable.prototype.populateReviewTable = function () 
    {

         var parentTable = document.getElementById(this.MainReviewTableContainer);


        for (var key in this.ComparisonTableData) {
            if (!this.ComparisonTableData.hasOwnProperty(key)) {
                continue;
            }

            var checkGroups = this.ComparisonTableData[key];
            for (var groupId in checkGroups) {
                if (!checkGroups.hasOwnProperty(groupId)) {
                    continue;
                }

                // get check group
                var componentsGroup = checkGroups[groupId];                
                if (componentsGroup.CheckComponents.length === 0) {
                    continue;
                }

                // create check group button
                var btn = this.CreateCheckGroupButton(groupId, componentsGroup.ComponentClass);
                parentTable.appendChild(btn);

                var div = document.createElement("DIV");
                div.className = "content scrollable";
                div.id = componentsGroup.ComponentClass.replace(/\s/g, '');
                parentTable.appendChild(div);

                // create column headers
                var columnHeaders = this.CreateMainTableHeaders();

                // create table data
                var tableData = this.CreateTableData(componentsGroup.CheckComponents, groupId, componentsGroup.ComponentClass);               

                var id = "#" + div.id;

                // Create table for category results
                this.LoadReviewTableData(columnHeaders, tableData, id);      

                // highlight table rows as per their severity status
                this.comparisonReviewManager.highlightMainReviewTableFromCheckStatus(div.id);

                // Add category check results count 
                this.comparisonReviewManager.AddTableContentCount(div.id);
            }
        }
    }

    ComparisonReviewModuleTable.prototype.LoadReviewTableData = function (columnHeaders, tableData, containerDiv) {
        var _this = this;
       
        $(function () {
            var table = JSON.stringify(tableData);
            var isFiredFromCheckbox = false;
            $(containerDiv).igGrid({
                columns: columnHeaders,
                autofitLastColumn: false,
                autoGenerateColumns: false,
                dataSource : table,
                dataSourceType: "json",
                responseDataKey: "results",
                autoCommit: true,
                features: [
                    {
                        name: "Sorting",
                        sortingDialogContainment: "window"
                    },
                    {
                        name: "Filtering",
                        type: "local",
                    },
                    {
                        name: "Selection",
                        mode: 'row',
                        multipleSelection: true,
                        activation: true,
                        rowSelectionChanging : function(evt, ui) {
                            
                            if (isFiredFromCheckbox) {
                                isFiredFromCheckbox = false;
                            } else {
                                var id = containerDiv.replace("#", "");
                                _this.comparisonReviewManager.OnCheckComponentRowClicked(ui.row.element[0], id)
                                return false;
                            }
                            
                        }
                    },
                    {
                        name: "RowSelectors",
                        enableCheckBoxes: true,
                        enableRowNumbering: false,
                        enableSelectAllForPaging: true, // this option is true by default
                        checkBoxStateChanging: function (evt, ui) {
                            //we use this variable as a flag whether the selection is coming from a checkbox
                            isFiredFromCheckbox = true;                          
                        },
                        checkBoxStateChanged: function (evt, ui) {
                            _this.comparisonReviewManager.SelectionManager.HandleCheckComponentSelectFormCheckBox(ui.row[0], ui.state);
                        }
                    },
                    {
                        name: "Resizing"
                    },
                ]
    
            });
        });
        
        var container = document.getElementById(containerDiv.replace("#", ""));
        container.style.width = "578px"
        container.style.height = "202px"
        container.style.margin = "0px"
        container.style.overflowX = "hidden";
        container.style.overflowY = "scroll";
        container.style.padding = "0";

    };
}