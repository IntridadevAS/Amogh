function ComparisonCheckResultsTable(mainReviewTableContainer) {


    this.MainReviewTableContainer = mainReviewTableContainer;
    this.CurrentTableId;
    this.CheckTableIds = {};
}

ComparisonCheckResultsTable.prototype.CreateCheckGroupButton = function (groupId, componentClass) {

    // var btn = document.createElement("BUTTON");
    // var att = document.createAttribute("groupId");
    // att.value = groupId;
    // btn.setAttributeNode(att);       // Create a <button> element
    // btn.className = "collapsible";
    // var t = document.createTextNode(componentClass);       // Create a text node
    // btn.appendChild(t);

    var btn = document.createElement("BUTTON");
    btn.className = "accordion";
    btn.style.justifyContent = "center";
    var t = document.createTextNode(componentClass);       // Create a text node
    btn.appendChild(t);
    return btn;
}

ComparisonCheckResultsTable.prototype.CreateMainTableHeaders = function (sources) {
    var columnHeaders = [];
    for (var i = 1; i < Object.keys(ComparisonColumns).length; i++) {
        columnHeader = {};
        var caption;
        var dataField;
        var width;
        var visible = true
        if (i === ComparisonColumns.Select) {
            continue;
        }
        else if (i === ComparisonColumns.SourceAName) {
            caption = sources[0];
            dataField = ComparisonColumnNames.SourceAName;
            width = "35%";
        }
        else if (i === ComparisonColumns.SourceBName) {
            caption = sources[1];
            dataField = ComparisonColumnNames.SourceBName;
            width = "35%";
        }
        else if (i === ComparisonColumns.Status) {
            caption = "Status";
            dataField = ComparisonColumnNames.Status;
            width = "30%";
        }
        else if (i === ComparisonColumns.SourceANodeId) {
            caption = "SourceANodeId";
            dataField = ComparisonColumnNames.SourceANodeId;
            visible = false;
            width = "0%";
        }
        else if (i === ComparisonColumns.SourceBNodeId) {
            caption = "SourceBNodeId";
            dataField = ComparisonColumnNames.SourceBNodeId;
            visible = false;
            width = "0%";
        }
        else if (i === ComparisonColumns.ResultId) {
            caption = "ID";
            dataField = ComparisonColumnNames.ResultId;
            visible = false;
            width = "0%";
        }
        else if (i === ComparisonColumns.GroupId) {
            caption = "groupId";
            dataField = ComparisonColumnNames.GroupId;
            visible = false;
            width = "0%";
        }

        columnHeader["caption"] = caption;
        columnHeader["dataField"] = dataField;
        // columnHeader["dataType"] = "string";
        columnHeader["width"] = width;

        if(visible == false) {
            columnHeader["visible"] = visible;
        }
        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}

ComparisonCheckResultsTable.prototype.CreateTableData = function (checkComponents,
    groupId,
    mainClass) {

    var _this = this;
    var tableData = [];
    for (var componentId in checkComponents) {

        component = checkComponents[componentId];

        tableRowContent = {};

        tableRowContent[ComparisonColumnNames.SourceAName] = component.sourceAName;
        tableRowContent[ComparisonColumnNames.SourceBName] = component.sourceBName;
        tableRowContent[ComparisonColumnNames.Status] = component.status;
        tableRowContent[ComparisonColumnNames.SourceANodeId] = component.sourceANodeId;
        tableRowContent[ComparisonColumnNames.SourceBNodeId] = component.sourceBNodeId;
        tableRowContent[ComparisonColumnNames.ResultId] = component.id;
        tableRowContent[ComparisonColumnNames.GroupId] = component.ownerGroup;

        tableData.push(tableRowContent);

        model.checks["comparison"]["reviewManager"].MaintainNodeIdVsCheckComponent(component, mainClass);
    }

    return tableData;
}

ComparisonCheckResultsTable.prototype.highlightMainReviewTableFromCheckStatus = function (containerId) {
    var mainReviewTableContainer = document.getElementById(containerId);
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var mainReviewTableRows = mainReviewTableContainer.children[0].getElementsByTagName("tr");

    for (var i = 2; i < mainReviewTableRows.length; i++) {
        var currentRow = mainReviewTableRows[i];
        if (currentRow.cells.length < 3) {
            return;
        }
        var status = currentRow.cells[ComparisonColumns.Status].innerText;
        model.checks["comparison"]["selectionManager"].ChangeBackgroundColor(currentRow, status);
    }
}


ComparisonCheckResultsTable.prototype.populateReviewTable = function () {
    // var _this = this;
    var ComparisonTableData = model.checks["comparison"]["reviewManager"].ComparisonCheckManager;
    var parentTable = document.getElementById(this.MainReviewTableContainer);

    if (!("results" in ComparisonTableData)) {
        return;
    }
    // for (var key in ComparisonTableData) {
    //     if (!ComparisonTableData.hasOwnProperty(key)) {
    //         continue;
    //     }

    var checkGroups = ComparisonTableData["results"];
    for (var groupId in checkGroups) {
        if (!checkGroups.hasOwnProperty(groupId)) {
            continue;
        }

        // get check group
        var componentsGroup = checkGroups[groupId];
        if (componentsGroup.components.length === 0) {
            continue;
        }

        // create check group button
        var btn = this.CreateCheckGroupButton(groupId, componentsGroup.componentClass);
        parentTable.appendChild(btn);

        var div = document.createElement("DIV");
        div.className = "content scrollable";
        div.id = componentsGroup.componentClass.replace(/\s/g, '') + "_" + this.MainReviewTableContainer;
        div.style.display = "none";
        parentTable.appendChild(div);

        // create column headers
        var columnHeaders = this.CreateMainTableHeaders(ComparisonTableData.sources);

        // create table data
        var tableData = this.CreateTableData(componentsGroup.components, groupId, componentsGroup.componentClass);

        var id = "#" + div.id;

        // Create table for category results
        this.LoadReviewTableData(columnHeaders, tableData, id);
        // .then(function() {
        //     // highlight table rows as per their severity status
        //     _this.highlightMainReviewTableFromCheckStatus(div.id);

        //     // Add category check results count 
        //     model.checks["comparison"]["reviewManager"].AddTableContentCount(div.id);

        // maintain table ids
        this.CheckTableIds[groupId] = id;
        // });
    }
    //}
}

ComparisonCheckResultsTable.prototype.LoadReviewTableData = function (columnHeaders,
    tableData,
    containerDiv) {
    var _this = this;

    $(function () {
        $(containerDiv).dxDataGrid({
            dataSource: tableData,
            keyExpr: ComparisonColumnNames.ResultId,
            columns: columnHeaders,
            columnAutoWidth: true,
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            allowColumnResizing : true,
            filterRow: {
                visible: true
            },
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always",
                recursive: true
            }, 
            paging: { enabled: false },
            onContentReady: function(e) {
                _this.highlightMainReviewTableFromCheckStatus(containerDiv.replace("#", ""));
                model.checks["comparison"]["reviewManager"].AddTableContentCount(containerDiv.replace("#", ""));
                if(model.getCurrentSelectionManager().HighlightedComponentRowIndex && 
                model.getCurrentSelectionManager().HighlightedCheckComponentRow.rowIndex == -1) {
                    var rowIndex = model.getCurrentSelectionManager().HighlightedComponentRowIndex;
                    model.getCurrentSelectionManager().HighlightedCheckComponentRow = e.component.getRowElement(rowIndex)[0];
                    model.getCurrentSelectionManager().HighlightedComponentRowIndex = undefined;
                }
            },
            onCellPrepared: function(e) {
                if(e.rowType == "header"){  
                    e.cellElement.css("text-align", "center"); 
                    e.cellElement.css("color", "black");
                    e.cellElement.css("font-weight", "bold");   
                 }  
            },
            onInitialized: function(e) {
                // initialize the context menu
                var reviewComparisonContextMenuManager = new ReviewComparisonContextMenuManager(model.checks["comparison"]["reviewManager"]);
                reviewComparisonContextMenuManager.InitComponentLevelContextMenu(containerDiv);
            },
            onSelectionChanged: function (e) {
                if(e.currentSelectedRowKeys.length > 0) {
                    for(var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        var rowIndex = e.component.getRowIndexByKey(e.currentSelectedRowKeys[i])
                        var  row = e.component.getRowElement(rowIndex);
                        model.checks["comparison"]["selectionManager"].HandleCheckComponentSelectFormCheckBox(row[0], "on");
                    }
                }
                else {
                    for(var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        var rowIndex = e.component.getRowIndexByKey(e.currentDeselectedRowKeys[i])
                        var  row = e.component.getRowElement(rowIndex);
                        model.checks["comparison"]["selectionManager"].HandleCheckComponentSelectFormCheckBox(row[0], "off");
                    }
                }
            },
            onRowClick: function(e) {
                var id = containerDiv.replace("#", "");
                _this.CurrentTableId = id;
                model.checks["comparison"]["selectionManager"].MaintainHighlightedRow(e.rowElement[0]);
                model.checks["comparison"]["reviewManager"].OnCheckComponentRowClicked(e.data, id);
            },
            // onRowPrepared: function(e) {
            //     if(e.isSelected) {
            //         _this.SelectionManager.ApplyHighlightColor(e.rowElement[0])
            //     }
            // }
        });
    });

    var container = document.getElementById(containerDiv.replace("#", ""));
    container.style.margin = "0px"
    container.style.padding = "0";

};

ComparisonCheckResultsTable.prototype.GetDataForSelectedRow = function (rowIndex, containerDiv) {
    var dataGrid = $(containerDiv).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items(); 
    var rowData = data[rowIndex];
    return rowData;
}

ComparisonCheckResultsTable.prototype.Destroy = function () {

    for (var groupId in this.CheckTableIds) {
        var id = this.CheckTableIds[groupId];
        
        $(id).remove()
    }

    document.getElementById(this.MainReviewTableContainer).innerHTML = "";
}

ComparisonCheckResultsTable.prototype.UpdateGridData = function (selectedRow,
    tableContainer,
    changedStatus,
    populateDetailedTable) {
   
    var dataGrid = $(tableContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items(); 
    var rowData = data[selectedRow.rowIndex];
    rowData.Status = changedStatus;
    model.getCurrentSelectionManager().HighlightedComponentRowIndex = selectedRow.rowIndex;
    dataGrid.repaintRows(selectedRow.rowIndex);

    if (populateDetailedTable) {
        model.checks["comparison"]["detailedInfoTable"].populateDetailedReviewTable(rowData);    
    }
}

function ComparisonCheckPropertiesTable(detailedReviewTableContainer) {
    this.DetailedReviewTableContainer = detailedReviewTableContainer;
}

ComparisonCheckPropertiesTable.prototype.CreatePropertiesTableHeader = function (sources) {
    var columnHeaders = [];

    for (var i = 0; i < 3; i++) {
        columnHeader = {}
        var caption;
        var columns;
        var dataField;
        var width;
        // var dataType;
        if (i == 0) {
            var group = [];
            for (var j = 1; j < Object.keys(ComparisonPropertyColumns).length; j++) {
                var headerGroupComp = {}
                if (j === ComparisonPropertyColumns.SourceAName) {
                    caption = "Property";
                    dataField = ComparisonPropertyColumnNames.SourceAName;

                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";                    
                    // headerGroupComp["dataType"] = "string";
                    // headerGroupComp["width"] = "27%";

                    group[0] = headerGroupComp;
                }
                else if (j === ComparisonPropertyColumns.SourceAValue) {
                    caption = "Value";
                    dataField = ComparisonPropertyColumnNames.SourceAValue;
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[1] = headerGroupComp;
                }
            }
            caption = sources[0];
            dataField = null;
            columns = group;
        }

        if (i == 1) {
            var group = [];
            for (var j = 1; j < Object.keys(ComparisonPropertyColumns).length; j++) {
                var headerGroupComp = {}
                if (j === ComparisonPropertyColumns.SourceBValue) {
                    caption = "Value";
                    dataField = ComparisonPropertyColumnNames.SourceBValue;
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[0] = headerGroupComp;
                }
                else if (j === ComparisonPropertyColumns.SourceBName) {
                    caption = "Property";
                    dataField = ComparisonPropertyColumnNames.SourceBName;

                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[1] = headerGroupComp;
                }
            }
            caption = sources[1];
            dataField = null;
            columns = group;
        }

        if (i == 2) {
            caption = "Status";
            dataField = ComparisonPropertyColumnNames.Status;
            width = "20%";
            // dataType = "string";
            columns = []
        }

        columnHeader["caption"] = caption;
        if (dataField !== null) {
            columnHeader["dataField"] = dataField;
        }

        if (columns.length > 1 && columns !== undefined) {
            columnHeader["columns"] = columns;
        }

        columnHeader["width"] = width;
        // if (dataType)
        //     columnHeader["dataType"] = dataType;
        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}

ComparisonCheckPropertiesTable.prototype.CreateTableData = function (properties) {

    var property;
    var tableData = [];
    for (var propertyId in properties) {
        property = properties[propertyId];
        tableRowContent = {};
        tableRowContent[ComparisonPropertyColumnNames.SourceAName] = property.sourceAName;
        tableRowContent[ComparisonPropertyColumnNames.SourceAValue] = property.sourceAValue;
        tableRowContent[ComparisonPropertyColumnNames.SourceBValue] = property.sourceBValue;
        tableRowContent[ComparisonPropertyColumnNames.SourceBName] = property.sourceBName;
        tableRowContent[ComparisonPropertyColumnNames.Status] = property.severity;

        if (property.transpose == 'lefttoright' && property.severity !== 'No Value') {
            tableRowContent[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            tableRowContent[ComparisonPropertyColumnNames.SourceBValue] = property.sourceAValue;
        }
        else if (property.transpose == 'righttoleft' && property.severity !== 'No Value') {
            tableRowContent[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            tableRowContent[ComparisonPropertyColumnNames.SourceAValue] = property.sourceBValue;
        }

        model.checks["comparison"]["reviewManager"].detailedReviewRowComments[Object.keys(model.checks["comparison"]["reviewManager"].detailedReviewRowComments).length] = property.description;

        tableData.push(tableRowContent);
    }

    return tableData;
}

ComparisonCheckPropertiesTable.prototype.populateDetailedReviewTable = function (rowData) {
    // clear comment
    this.SetComment("");

    this.detailedReviewRowComments = {};

    var tableData = [];
    var columnHeaders = [];

    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    var component = model.getCurrentReviewManager().GetCheckComponent(groupId, componentId);

    var columnHeaders = this.CreatePropertiesTableHeader(model.getCurrentReviewManager().ComparisonCheckManager.sources);

    // show component class name as property in detailed review table    
    var tableData = this.CreateTableData(component.properties);

    this.LoadDetailedReviewTableData(columnHeaders, tableData);

}

ComparisonCheckPropertiesTable.prototype.LoadDetailedReviewTableData = function (columnHeaders, tableData) {
    var viewerContainer = "#" + this.DetailedReviewTableContainer;
    var _this = this;

    // var height =  document.getElementById("tableDataComparison").offsetHeight / 2 + "px";
    $(function () {
        $(viewerContainer).dxDataGrid({
            dataSource: tableData,
            columns: columnHeaders,
            columnAutoWidth: true,
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            allowColumnResizing : true,
            filterRow: {
                visible: true
            },
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always",
                recursive: true
            }, 
            scrolling: {
                mode : "standard"
            },
            paging: {
                enabled: false
            },
            onContentReady: function(e) {
                _this.highlightDetailedReviewTableFromCheckStatus(_this.DetailedReviewTableContainer)
            },
            onInitialized: function(e) {
                // initialize the context menu
                var reviewComparisonContextMenuManager = new ReviewComparisonContextMenuManager(model.checks["comparison"]["reviewManager"]);
                reviewComparisonContextMenuManager.InitPropertyLevelContextMenu(viewerContainer);
            },
            onCellPrepared: function(e) {
                if(e.rowType == "header"){  
                    e.cellElement.css("text-align", "center"); 
                    e.cellElement.css("color", "black");
                    e.cellElement.css("font-weight", "bold");   
                 }  
            },
            onSelectionChanged: function (e) {
                
            },
            onRowClick: function(e) {
                var comment = model.checks["comparison"]["reviewManager"].detailedReviewRowComments[e.rowIndex];
                var commentDiv = document.getElementById("ComparisonDetailedReviewComment");
                if (comment) {
                    commentDiv.innerHTML = "Comment : <br>" + comment;
                }
                else {
                    commentDiv.innerHTML = "Comment : <br>";
                }
            },
            // onRowPrepared: function(e) {
            //     if(e.isSelected) {
            //         _this.SelectionManager.ApplyHighlightColor(e.rowElement[0])
            //     }
            // }
        });
    });

    // var container = document.getElementById(viewerContainer.replace("#", ""));
    // container.style.margin = "0px";
};

ComparisonCheckPropertiesTable.prototype.highlightDetailedReviewTableFromCheckStatus = function (containerId) {
    var detailedReviewTableContainer = document.getElementById(containerId);
    if (detailedReviewTableContainer === null) {
        return;
    }
    if (detailedReviewTableContainer.children.length === 0) {
        return;
    }
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var detailedReviewTableRows = detailedReviewTableContainer.children[0].getElementsByTagName("tr");

    // skip header and filter textbox, hence i = 3
    for (var i = 3; i < detailedReviewTableRows.length; i++) {
        var currentRow = detailedReviewTableRows[i];
        if (currentRow.cells.length > 1) {
            var status = currentRow.cells[ComparisonPropertyColumns.Status].innerHTML;
            model.checks["comparison"]["selectionManager"].ChangeBackgroundColor(currentRow, status);
        }
    }
}

ComparisonCheckPropertiesTable.prototype.SetComment = function (comment) {
    // var commentDiv = document.getElementById("ComparisonDetailedReviewComment");
    // commentDiv.innerHTML = comment;
}

ComparisonCheckPropertiesTable.prototype.Destroy = function () {

    // var viewerContainer = "#" + this.DetailedReviewTableContainer;

    var containerDiv = "#" + this.DetailedReviewTableContainer;
    var viewerContainerElement = document.getElementById(this.DetailedReviewTableContainer);
    var parent = viewerContainerElement.parentElement;

    $(containerDiv).remove();

    var viewerContainerDiv = document.createElement("div")
    viewerContainerDiv.id = this.DetailedReviewTableContainer;

    parent.appendChild(viewerContainerDiv); 
}

ComparisonCheckPropertiesTable.prototype.GetDataForSelectedRow = function (rowIndex, containerDiv) {
    var dataGrid = $(containerDiv).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items(); 
    var rowData = data[rowIndex];
    return rowData;
}

ComparisonCheckPropertiesTable.prototype.UpdateGridData = function(rowIndex, property) {
    var detailInfoContainer =  model.checks[model.currentCheck]["detailedInfoTable"]["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items(); 
    var rowData = data[rowIndex];
    rowData[ComparisonPropertyColumnNames.Status] = property["severity"];
    
    if(property["severity"] !== "ACCEPTED") {
        if (property.transpose == "lefttoright") {
            rowData[ComparisonPropertyColumnNames.SourceBValue] = property["sourceAValue"];
            
        }
        else if (property.transpose == "righttoleft") {
            rowData[ComparisonPropertyColumnNames.SourceAValue] = property["sourceBValue"];
        }
        else if(property.transpose == null) {
            rowData[ComparisonPropertyColumnNames.SourceAValue] = property["sourceAValue"];
            rowData[ComparisonPropertyColumnNames.SourceBValue] = property["sourceBValue"];
        }
    }

    dataGrid.repaintRows(rowIndex);
}
