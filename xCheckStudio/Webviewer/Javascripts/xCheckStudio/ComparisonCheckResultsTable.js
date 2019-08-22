function ComparisonCheckResultsTable(reviewManager,
    mainReviewTableContainer) {

    
    this.MainReviewTableContainer = mainReviewTableContainer;
    this.ReviewManager = reviewManager;

    ComparisonCheckResultsTable.prototype.CreateCheckGroupButton = function(groupId, componentClass)
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

    ComparisonCheckResultsTable.prototype.CreateMainTableHeaders = function()
    {
        var columnHeaders = [];
        for (var i = 1; i < Object.keys(ComparisonColumns).length; i++) {
            columnHeader = {};
            var headerText;
            var hidden = false;
            if (i === ComparisonColumns.Select) {
                continue;
            }
            else if (i === ComparisonColumns.SourceAName) {
                headerText = 'SourceA';
                key = ComparisonColumnNames.SourceAName;
                hidden = false;
                width = "35%";
            }
            else if (i === ComparisonColumns.SourceBName) {
                headerText = "SourceB";
                key = ComparisonColumnNames.SourceBName;
                hidden = false;
                width = "35%";
            }
            else if (i === ComparisonColumns.Status) {
                headerText = "Status";
                key = ComparisonColumnNames.Status;
                hidden = false;
                width = "30%";
            }
            else if (i === ComparisonColumns.SourceANodeId) 
            {
                headerText = "SourceANodeId";
                key = ComparisonColumnNames.SourceANodeId;
                hidden = true;
                width = "0%";
            }
            else if (i === ComparisonColumns.SourceBNodeId) 
            {
                headerText = "SourceBNodeId";
                key = ComparisonColumnNames.SourceBNodeId;
                hidden = true;
                width = "0%";
            }
            else if (i === ComparisonColumns.ResultId) 
            {
                headerText = "ID";
                key = ComparisonColumnNames.ResultId;
                hidden = true;
                width = "0%";
            }
            else if (i === ComparisonColumns.GroupId) 
            {
                headerText = "groupId";
                key = ComparisonColumnNames.GroupId;
                hidden = true;
                width = "0%";
            }

            columnHeader["headerText"] = headerText;
            columnHeader["key"] = key;
            columnHeader["dataType"] = "string";
            columnHeader["hidden"] = hidden;
            // columnHeader["width"] = width;
            columnHeaders.push(columnHeader);
        }

        return columnHeaders;
    }

    ComparisonCheckResultsTable.prototype.CreateTableData =function(checkComponents, 
        groupId,
        mainClass)
    {

        var _this = this;
        var tableData = [];
            for (var componentId in checkComponents)
            {
 
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

            this.ReviewManager.MaintainNodeIdVsCheckComponent(component, mainClass);
        }

        return tableData;   
    }

    ComparisonCheckResultsTable.prototype.populateReviewTable = function () 
    {
         var ComparisonTableData = this.ReviewManager.ComparisonCheckManager;
         var parentTable = document.getElementById(this.MainReviewTableContainer);


        for (var key in ComparisonTableData) {
            if (!ComparisonTableData.hasOwnProperty(key)) {
                continue;
            }

            var checkGroups = ComparisonTableData[key];
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
                this.ReviewManager.highlightMainReviewTableFromCheckStatus(div.id);

                // Add category check results count 
                this.ReviewManager.AddTableContentCount(div.id);
            }
        }
    }

    ComparisonCheckResultsTable.prototype.RestoreBackgroundColorOfFilteredRows = function(filteredData) {
        for(var row = 2; row < filteredData.length; row++) {
            var status = this.ReviewManager.GetCellValue(filteredData[row], ComparisonColumns.Status);
            this.ReviewManager.SelectionManager.ChangeBackgroundColor(filteredData[row], status);            
        }
    }

    ComparisonCheckResultsTable.prototype.LoadReviewTableData = function (columnHeaders, tableData, containerDiv) {
        var _this = this;
       
        $(function () {
            var table = JSON.stringify(tableData);
            var isFiredFromCheckbox = false;
            $(containerDiv).igGrid({
                columns: columnHeaders,
                autofitLastColumn: false,
                autoGenerateColumns: false,
                dataSource : tableData,
                // dataSourceType: "json",
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
                        dataFiltered: function (evt, ui) {
                             var filteredData = evt.target.rows;
                            _this.RestoreBackgroundColorOfFilteredRows(filteredData);
                        }
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
                                var rowData = _this.GetDataForSelectedRow(ui.row.index, containerDiv);
                                _this.ReviewManager.SelectionManager.MaintainHighlightedRow(ui.row.element[0]); 
                                _this.ReviewManager.OnCheckComponentRowClicked(rowData, id)
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
                            _this.ReviewManager.SelectionManager.HandleCheckComponentSelectFormCheckBox(ui.row[0], ui.state);
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

    ComparisonCheckResultsTable.prototype.GetDataForSelectedRow = function(rowIndex, containerDiv) {
        var rowData = {};
        var rowIndex = rowIndex;
        $(function () {
        var data = $(containerDiv).data("igGrid").dataSource.dataView();
        var ResultId = data[rowIndex].ID;
        var GroupId = data[rowIndex].groupId;
        var SourceANodeId = data[rowIndex].SourceANodeId;
        var SourceBNodeId = data[rowIndex].SourceBNodeId;
        var Status = data[rowIndex].Status;
        var SourceBName = data[rowIndex].SourceB;
        var SourceAName = data[rowIndex].SourceA;

        rowData['Status'] = Status;
        rowData['SourceBName'] = SourceBName;
        rowData['SourceAName'] = SourceAName;
        rowData['ResultId'] = ResultId;
        rowData['GroupId'] = GroupId;
        rowData['SourceANodeId'] = SourceANodeId;
        rowData['SourceBNodeId'] = SourceBNodeId;
        });

        return rowData;
    }
}