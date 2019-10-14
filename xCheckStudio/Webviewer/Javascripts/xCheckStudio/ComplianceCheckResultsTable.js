function ComplianceCheckResultsTable(mainReviewTableContainer) {
    this.MainReviewTableContainer = mainReviewTableContainer;
    this.CurrentTableId;
    this.CheckTableIds = {};
}

ComplianceCheckResultsTable.prototype.CreateCheckGroupButton = function (componentClass) {

    var btn = document.createElement("BUTTON");
    btn.className = "accordion";
    btn.style.justifyContent = "center";
    var t = document.createTextNode(componentClass);       // Create a text node
    btn.appendChild(t);

    return btn;
}

ComplianceCheckResultsTable.prototype.CreateTableData = function (CheckComponents,
    groupId,
    mainClass) {

    // var _this = this;
    var tableData = [];

    for (var componentId in CheckComponents) {
        if (!CheckComponents.hasOwnProperty(componentId)) {
            continue;
        }
        // for (var j = 0; j < componentsGroup.CheckComponents.length; j++) {

        component = CheckComponents[componentId];

        tableRowContent = {};
        tableRowContent[ComplianceColumnNames.SourceName] = component.name;
        tableRowContent[ComplianceColumnNames.Status] = component.status;
        tableRowContent[ComplianceColumnNames.NodeId] = component.nodeId;
        tableRowContent[ComplianceColumnNames.ResultId] = component.id;
        tableRowContent[ComplianceColumnNames.GroupId] = groupId;

        tableData.push(tableRowContent);

        // maintain track of check components
        if (component.nodeId) {
            model.getCurrentReviewManager().SourceNodeIdvsCheckComponent[component.nodeId] = {
                "Id": component.id,
                "SourceAName": component.name,
                "MainClass": mainClass,
                "SourceANodeId": component.nodeId
            };

            model.getCurrentReviewManager().SourceComponentIdvsNodeId[component.id] = component.nodeId;
        }
    }

    return tableData;
}

ComplianceCheckResultsTable.prototype.CreateMainTableHeaders = function (source) {
    var columnHeaders = [];
    for (var i = 1; i < Object.keys(ComplianceColumns).length; i++) {
        columnHeader = {};
        var caption;
        var dataField;
        var visible = true;
        if (i === ComplianceColumns.SourceName) {
            caption = source;
            dataField = ComplianceColumnNames.SourceName;
        }
        else if (i === ComplianceColumns.Status) {
            caption = "Status";
            dataField = ComplianceColumnNames.Status;
            hidden = false;
        }
        else if (i === ComplianceColumns.NodeId) {
            caption = "NodeId";
            dataField = ComplianceColumnNames.NodeId;
            visible = false;
        }
        else if (i === ComplianceColumns.ResultId) {
            caption = "ID";
            dataField = ComplianceColumnNames.ResultId;
            visible = false;
        }
        else if (i === ComplianceColumns.GroupId) {
            caption = "groupId";
            dataField = ComplianceColumnNames.GroupId;
            visible = false;
        }

        columnHeader["caption"] = caption;
        columnHeader["dataField"] = dataField;
        // columnHeader["dataType"] = "string";
        if(visible == false) {
            columnHeader["visible"] = visible;
        }
        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}

ComplianceCheckResultsTable.prototype.populateReviewTable = function () {
    var ComplianceData = model.getCurrentReviewManager().ComplianceCheckManager;

    // //Clear Review table data
    // this.Destroy();

    if (!("results" in ComplianceData)) {
        return;
    }
    var checkGroups = ComplianceData["results"];
    var undefinedGroupId;
    for (var groupId in checkGroups) {
        if (!checkGroups.hasOwnProperty(groupId)) {
            continue;
        }

        var componentsGroup = checkGroups[groupId];
        if (componentsGroup.components.length === 0) {
            continue;
        }

        if(componentsGroup.componentClass.toLowerCase() == "undefined") {
            undefinedGroupId = groupId;
            continue;
        }

        this.CreateTable(groupId, componentsGroup);
    }
    // Add undefined category last
    if(undefinedGroupId) {
        var componentsGroup = model.checks["compliance"]["reviewManager"].GetCheckGroup(undefinedGroupId);
        this.CreateTable(undefinedGroupId, componentsGroup);
    }
}

ComplianceCheckResultsTable.prototype.CreateTable = function(groupId, componentsGroup) {
    var parentTable = document.getElementById(this.MainReviewTableContainer);
    var ComplianceData = model.getCurrentReviewManager().ComplianceCheckManager;

    var btn = this.CreateCheckGroupButton(componentsGroup.componentClass);
    parentTable.appendChild(btn);

    var div = document.createElement("DIV");
    div.className = "content scrollable";
    div.id = componentsGroup.componentClass.replace(/\s/g, '') + "_" + this.MainReviewTableContainer;
    div.style.display = "none";
    parentTable.appendChild(div);

    var columnHeaders = this.CreateMainTableHeaders(ComplianceData.source);

    var tableData = this.CreateTableData(componentsGroup.components, groupId, componentsGroup.componentClass);;

    var id = "#" + div.id;
    this.LoadReviewTableData(columnHeaders, tableData, id);
    // this.highlightMainReviewTableFromCheckStatus(div.id);

    // maintain table ids
    this.CheckTableIds[groupId] = id;
}

ComplianceCheckResultsTable.prototype.highlightMainReviewTableFromCheckStatus = function (containerId) {
    var mainReviewTableContainer = document.getElementById(containerId);
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var mainReviewTableRows = mainReviewTableContainer.children[0].getElementsByTagName("tr");

    for (var i = 2; i < mainReviewTableRows.length; i++) {
        var currentRow = mainReviewTableRows[i];
        if (currentRow.cells.length === 1) {
            return;
        }
        var status = currentRow.cells[ComplianceColumns.Status].innerHTML;
        model.getCurrentSelectionManager().ChangeBackgroundColor(currentRow, status);
    }
}

ComplianceCheckResultsTable.prototype.LoadReviewTableData = function (columnHeaders, tableData, viewerContainer) {
    var _this = this;

    $(function () {
        $(viewerContainer).dxDataGrid({
            dataSource: tableData,
            keyExpr: ComparisonColumnNames.ResultId,
            columns: columnHeaders,
            columnAutoWidth: true,
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            allowColumnResizing : true,
            hoverStateEnabled: true,
            // focusedRowEnabled: true,
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
                _this.highlightMainReviewTableFromCheckStatus(viewerContainer.replace("#", ""));
                model.checks["compliance"]["reviewManager"].AddTableContentCount(viewerContainer.replace("#", ""));
                model.getCurrentSelectionManager().UpdateHighlightedCheckComponent(e.component);
            },
            onInitialized: function(e) {
                // initialize the context menu
                var reviewComplianceContextMenuManager = new ReviewComplianceContextMenuManager(model.getCurrentReviewManager());
                reviewComplianceContextMenuManager.InitComponentLevelContextMenu(viewerContainer);
            },
            onCellPrepared: function(e) {
                if(e.rowType == "header"){  
                    e.cellElement.css("text-align", "center"); 
                    e.cellElement.css("color", "black");
                    e.cellElement.css("font-weight", "bold");   
                 }  
            },
            onSelectionChanged: function (e) {
                if(e.currentSelectedRowKeys.length > 0) {
                    for(var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        var rowIndex = e.component.getRowIndexByKey(e.currentSelectedRowKeys[i])
                        var  row = e.component.getRowElement(rowIndex);
                        model.getCurrentSelectionManager().HandleCheckComponentSelectFormCheckBox(row[0], "on");
                    }
                }
                else {
                    for(var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        var rowIndex = e.component.getRowIndexByKey(e.currentDeselectedRowKeys[i])
                        var  row = e.component.getRowElement(rowIndex);
                        model.getCurrentSelectionManager().HandleCheckComponentSelectFormCheckBox(row[0], "off");
                    }
                }
            },
            onRowClick: function(e) {
                var id = viewerContainer.replace("#", "");
                _this.CurrentTableId = id;
                model.getCurrentSelectionManager().MaintainHighlightedRow(e.rowElement[0]);
                model.getCurrentReviewManager().OnCheckComponentRowClicked(e.data, id)
            },
        });
    });
};

ComplianceCheckResultsTable.prototype.GetDataForSelectedRow = function (rowIndex, containerDiv) {
    var dataGrid = $(containerDiv).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items(); 
    var rowData = data[rowIndex];
    return rowData;
}

ComplianceCheckResultsTable.prototype.Destroy = function () {

    for (var groupId in this.CheckTableIds) {
        var id = this.CheckTableIds[groupId];
        
        $(id).remove()
    }

    document.getElementById(this.MainReviewTableContainer).innerHTML = "";
}

ComplianceCheckResultsTable.prototype.HighlightHiddenRows = function(isHide, checkComponentsRows) {

    for (var i = 0; i < checkComponentsRows.length; i++) {
        var selectedRow = checkComponentsRows[i];

        for(var j = 0; j < selectedRow.cells.length; j++) {
            var cell = selectedRow.cells[j];
            if(isHide) {
                cell.style.color = HiddenElementTextColor;
            }
            else {
                cell.style.color = "black";
            }
        }
    }       
}

ComplianceCheckResultsTable.prototype.UpdateGridData = function (selectedRow,
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
            model.checks["compliance"]["detailedInfoTable"].populateDetailedReviewTable(rowData);    
        }
}

function ComplianceCheckPropertiesTable(detailedReviewTableContainer) {
    this.DetailedReviewTableContainer = detailedReviewTableContainer;
    // this.detailedReviewRowComments = reviewManager.detailedReviewRowComments;
}

ComplianceCheckPropertiesTable.prototype.CreatePropertiesTableHeader = function (source) {

    var columns = [];
    var columnHeader = {}
    var columnHeaders = [];
    for (var i = 1; i < Object.keys(CompliancePropertyColumns).length; i++) {
        var headerGroupComp = {}
        var caption;
        if (i === CompliancePropertyColumns.PropertyName) {
            caption = "Property";
            dataField = CompliancePropertyColumnNames.PropertyName;
        }
        else if (i === CompliancePropertyColumns.PropertyValue) {
            caption = "Value";
            dataField = CompliancePropertyColumnNames.PropertyValue;
        }
        else if (i === CompliancePropertyColumns.Status) {
            caption = "Status";
            dataField = CompliancePropertyColumnNames.Status;
        }

        headerGroupComp["caption"] = caption;
        headerGroupComp["dataField"] = dataField;
        headerGroupComp["width"] = "25%";    
        // headerGroupComp["dataType"] = "string";
        columns.push(headerGroupComp);
    }

    columnHeader["caption"] = source;
    columnHeader["columns"] = columns;

    columnHeaders.push(columnHeader)
    return columnHeaders;
}

ComplianceCheckPropertiesTable.prototype.addPropertyRowToDetailedTable = function (property, columnHeaders) {

    tableRowContent = {};
    tableRowContent[CompliancePropertyColumnNames.PropertyName] = property.name;
    tableRowContent[CompliancePropertyColumnNames.PropertyValue] = property.value;
    if (property.performCheck === "1" &&
        property.result === "1") {
        tableRowContent[ComparisonPropertyColumnNames.Status] = "OK";
    }
    else {
        tableRowContent[ComparisonPropertyColumnNames.Status] = property.severity;
    }
    return tableRowContent;
}


ComplianceCheckPropertiesTable.prototype.populateDetailedReviewTable = function (rowData) {

    // var tableData = [];
    // var columnHeaders = [];

    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    var component = model.getCurrentReviewManager().GetCheckComponent(groupId, componentId);

    var columnHeaders = this.CreatePropertiesTableHeader(model.getCurrentReviewManager().ComplianceCheckManager.source);

    var tableData = [];
    for (var propertyId in component.properties) {
        property = component.properties[propertyId];

        //this.detailedReviewRowComments[Object.keys(this.detailedReviewRowComments).length] = property.Description;

        tableRowContent = this.addPropertyRowToDetailedTable(property, columnHeaders);
        tableData.push(tableRowContent);
    }

    var id = "#" + this.DetailedReviewTableContainer;
    this.LoadDetailedReviewTableData(columnHeaders, tableData, id);
    
}

ComplianceCheckPropertiesTable.prototype.LoadDetailedReviewTableData = function (columnHeaders, tableData, viewerContainer) {
    var _this = this;

    // clear previous grid
    // this.Destroy();
    $(function () {
        $(viewerContainer).dxDataGrid({
            dataSource: tableData,
            // keyExpr: ComparisonColumnNames.ResultId,
            columns: columnHeaders,
            columnAutoWidth: true,
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            allowColumnResizing : true,
            hoverStateEnabled: true,
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
                _this.highlightDetailedReviewTableFromCheckStatus(_this.DetailedReviewTableContainer);
            },
            onInitialized: function(e) {
                // initialize the context menu
                var reviewComplianceContextMenuManager = new ReviewComplianceContextMenuManager(model.getCurrentReviewManager());
                reviewComplianceContextMenuManager.InitPropertyLevelContextMenu(viewerContainer);
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
                model.checks["compliance"]["selectionManager"].MaintainHighlightedDetailedRow(e.rowElement[0]);
                // var comment = model.checks["compliance"]["reviewManager"].detailedReviewRowComments[e.rowIndex];
                // var commentDiv = document.getElementById("ComparisonDetailedReviewComment");
                // if (comment) {
                //     commentDiv.innerHTML = "Comment : <br>" + comment;
                // }
                // else {
                //     commentDiv.innerHTML = "Comment : <br>";
                // }
            },
            // onRowPrepared: function(e) {
            //     if(e.isSelected) {
            //         _this.SelectionManager.ApplyHighlightColor(e.rowElement[0])
            //     }
            // }
        });
    });

    var container = document.getElementById(viewerContainer.replace("#", ""));
    container.style.margin = "0px";
};

ComplianceCheckPropertiesTable.prototype.highlightDetailedReviewTableFromCheckStatus = function (containerId) {
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

    for (var i = 3; i < detailedReviewTableRows.length; i++) {
        var currentRow = detailedReviewTableRows[i];
        if (currentRow.cells.length < 2) {
            return;
        }
        var status = currentRow.cells[CompliancePropertyColumns.Status].innerHTML;
        model.getCurrentSelectionManager().ChangeBackgroundColor(currentRow, status);
    }
}

ComplianceCheckPropertiesTable.prototype.Destroy = function () {

    var containerDiv = "#" + this.DetailedReviewTableContainer;
    var viewerContainerElement = document.getElementById(this.DetailedReviewTableContainer);
    var parent = viewerContainerElement.parentElement;

    $(containerDiv).remove();

    var viewerContainerDiv = document.createElement("div")
    viewerContainerDiv.id = this.DetailedReviewTableContainer;

    parent.appendChild(viewerContainerDiv); 
}

ComplianceCheckPropertiesTable.prototype.UpdateGridData = function(rowIndex, property) {
    var detailInfoContainer =  model.checks[model.currentCheck]["detailedInfoTable"]["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items(); 
    var rowData = data[rowIndex];
    rowData[CompliancePropertyColumnNames.Status] = property["severity"];
    dataGrid.repaintRows(rowIndex);
}