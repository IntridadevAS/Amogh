function ComparisonCheckResultsTable(mainReviewTableContainer) {


    this.MainReviewTableContainer = mainReviewTableContainer;
    this.CurrentTableId;
    this.CheckTableIds = {};
}

ComparisonCheckResultsTable.prototype.CreateAccordion = function () {
    var parentTable = document.getElementById(this.MainReviewTableContainer);

    var _this = this;
    var data = this.CreateAccordionData();
    for (var i = 0; i < data.length; i++) {
        var div = document.createElement("DIV");
        div.setAttribute('data-options', "dxTemplate: { name: '" + data[i]["template"] + "' }")
        div.id = data[i]["template"];
        var datagridDiv = document.createElement("DIV");
        datagridDiv.id = data[i]["template"].replace(/\s/g, '') + "_" + this.MainReviewTableContainer;
        div.append(datagridDiv);
        parentTable.append(div);
    }

    $("#" + this.MainReviewTableContainer).dxAccordion({
        collapsible: true,
        dataSource: data,
        deferRendering: false,
        selectedIndex: -1,
        onSelectionChanged: function (e) {
            if (e.addedItems.length > 0) {
                _this.CurrentTableId = e.addedItems[0]["template"].replace(/\s/g, '') + "_" + _this.MainReviewTableContainer;
            }
        },
        itemTitleTemplate: function(itemData, itemIndex, itemElement) {
            var btn = $('<div>')
            $(btn).data("index", itemIndex)
                .dxButton({
                icon: "chevrondown",
                width: "38px",
                height: "30px",
                onClick: function (e) {
                    e.jQueryEvent.stopPropagation();
                    var isOpened = e.element.parent().next().parent().hasClass("dx-accordion-item-opened")
                    if(!isOpened) {
                        $("#" + _this.MainReviewTableContainer).dxAccordion("instance").expandItem(e.element.data("index"));
                    }
                    else {
                        $("#" + _this.MainReviewTableContainer).dxAccordion("instance").collapseItem(e.element.data("index"));
                    }
                    
                }
            }).css("float", "right").appendTo(itemElement);

            btn.css("position", "absolute");  
            btn.css("right", " 10px");
            btn.css("top", " 5px");
            btn.css("border", "none");
            btn.css("background", "black");



            itemElement.append("<h1 style = 'width:320px; font-size: 15px; text-align: center;color: white;'>" + itemData.title + "</h1>");

        },
        onItemTitleClick: function(e){
            e.event.stopPropagation();
        },
        onItemClick: function(e) {
            e.event.stopPropagation();
        }
    });
}

ComparisonCheckResultsTable.prototype.ExpandAccordionScrollToRow = function (row, groupName) {

    var accordion = $("#" + this.MainReviewTableContainer).dxAccordion("instance");
    var mainReviewTableContainer = document.getElementById(this.MainReviewTableContainer);

    // scroll to table
    var accordionIndex = this.GetAccordionIndex(groupName)
    if (accordionIndex >= 0) {
        accordion.expandItem(Number(accordionIndex)).then(function (result) {
            mainReviewTableContainer.scrollTop = row.offsetTop - row.offsetHeight;
        });
    }
    else {
        mainReviewTableContainer.scrollTop = row.offsetTop - row.offsetHeight;
    }
}

ComparisonCheckResultsTable.prototype.CreateAccordionData = function () {
    var ComparisonTableData = model.getCurrentReviewManager().ComparisonCheckManager;
    var checkGroups = ComparisonTableData["results"];

    var data = [];
    var undefinedGroupId;
    for (var groupId in checkGroups) {
        var dataObject = {};
        if (!checkGroups.hasOwnProperty(groupId)) {
            continue;
        }

        // get check group
        var componentsGroup = checkGroups[groupId];
        if (componentsGroup.components.length === 0) {
            continue;
        }

        // undefined group should be last in table
        if (componentsGroup.componentClass.toLowerCase() == "undefined") {
            undefinedGroupId = groupId;
            continue;
        }

        dataObject["template"] = componentsGroup.componentClass;
        dataObject["title"] = componentsGroup.componentClass;

        data.push(dataObject);
    }

    if (undefinedGroupId) {
        var dataObject = {};
        var componentsGroup = model.getCurrentReviewManager().GetCheckGroup(undefinedGroupId);
        dataObject["template"] = componentsGroup.componentClass;
        dataObject["title"] = componentsGroup.componentClass;

        data.push(dataObject);
    }
    return data;
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
        else if (i === ComparisonColumns.SourceAId) {
            caption = "SourceAId";
            dataField = ComparisonColumnNames.SourceAId;
            visible = false;
            width = "0%";
        }
        else if (i === ComparisonColumns.SourceBId) {
            caption = "SourceBId";
            dataField = ComparisonColumnNames.SourceBId;
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

        if (visible == false) {
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
        tableRowContent[ComparisonColumnNames.SourceAId] = component.sourceAId;
        tableRowContent[ComparisonColumnNames.SourceBId] = component.sourceBId;
        tableRowContent[ComparisonColumnNames.ResultId] = component.id;
        tableRowContent[ComparisonColumnNames.GroupId] = component.ownerGroup;

        tableData.push(tableRowContent);

        model.getCurrentReviewManager().MaintainNodeIdVsCheckComponent(component, mainClass);
    }

    return tableData;
}

ComparisonCheckResultsTable.prototype.highlightMainReviewTableFromCheckStatus = function (containerId) {
    var dataGrid = $(containerId).dxDataGrid("instance");
    var mainReviewTableRows = dataGrid.getVisibleRows();

    for (var i = 0; i < mainReviewTableRows.length; i++) {
        var currentRow = dataGrid.getRowElement(mainReviewTableRows[i].rowIndex);
        if (currentRow[0].cells.length < 3) {
            return;
        }
        var status = dataGrid.cellValue(mainReviewTableRows[i].rowIndex, ComparisonColumns.Status)
        model.getCurrentSelectionManager().ChangeBackgroundColor(currentRow[0], status);
    }
}


ComparisonCheckResultsTable.prototype.populateReviewTable = function () {
    // var _this = this;
    var ComparisonTableData = model.getCurrentReviewManager().ComparisonCheckManager;

    if (!("results" in ComparisonTableData)) {
        return;
    }

    // 
    var data = [];

    this.CreateAccordion();
    var checkGroups = ComparisonTableData["results"];
    var undefinedGroupId;
    for (var groupId in checkGroups) {
        if (!checkGroups.hasOwnProperty(groupId)) {
            continue;
        }

        // get check group
        var componentsGroup = checkGroups[groupId];
        if (componentsGroup.components.length === 0) {
            continue;
        }


        // undefined group should be last in table
        if (componentsGroup.componentClass.toLowerCase() == "undefined") {
            undefinedGroupId = groupId;
            continue;
        }

        this.CreateTable(groupId, componentsGroup);
    }

    // Add undefined category last
    if (undefinedGroupId) {
        var componentsGroup = model.getCurrentReviewManager().GetCheckGroup(undefinedGroupId);
        this.CreateTable(undefinedGroupId, componentsGroup);
    }
}

ComparisonCheckResultsTable.prototype.CreateTable = function (groupId, componentsGroup) {

    var ComparisonTableData = model.getCurrentReviewManager().ComparisonCheckManager;

    // create column headers
    var columnHeaders = this.CreateMainTableHeaders(ComparisonTableData.sources);

    // create table data
    var tableData = this.CreateTableData(componentsGroup.components, groupId, componentsGroup.componentClass);

    var id = "#" + componentsGroup.componentClass.replace(/\s/g, '') + "_" + this.MainReviewTableContainer;

    // Create table for category results
    this.LoadReviewTableData(columnHeaders, tableData, id);

    // maintain table ids
    this.CheckTableIds[groupId] = id;
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
            allowColumnResizing: true,
            hoverStateEnabled: true,
            filterRow: {
                visible: true
            },
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always",
                recursive: true
            },
            paging: { enabled: false },
            onContentReady: function (e) {
                _this.highlightMainReviewTableFromCheckStatus(containerDiv);
                model.getCurrentReviewManager().AddTableContentCount(containerDiv.replace("#", ""));
                model.getCurrentSelectionManager().UpdateHighlightedCheckComponent(e.component);
            },
            onCellPrepared: function (e) {
                if (e.rowType == "header") {
                    e.cellElement.css("text-align", "center");
                    e.cellElement.css("color", "black");
                    e.cellElement.css("font-weight", "bold");
                }
            },
            onInitialized: function (e) {
                // initialize the context menu
                var reviewComparisonContextMenuManager = new ReviewComparisonContextMenuManager(model.getCurrentReviewManager());
                reviewComparisonContextMenuManager.InitComponentLevelContextMenu(containerDiv);
            },
            onSelectionChanged: function (e) {
                if (e.currentSelectedRowKeys.length > 0) {
                    for (var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        var rowIndex = e.component.getRowIndexByKey(e.currentSelectedRowKeys[i])
                        var row = e.component.getRowElement(rowIndex);
                        model.checks["comparison"]["selectionManager"].HandleCheckComponentSelectFormCheckBox(row[0], containerDiv, "on");
                    }
                }
                else {
                    for (var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        var rowIndex = e.component.getRowIndexByKey(e.currentDeselectedRowKeys[i])
                        var row = e.component.getRowElement(rowIndex);
                        model.checks["comparison"]["selectionManager"].HandleCheckComponentSelectFormCheckBox(row[0], containerDiv, "off");
                    }
                }
            },
            onRowClick: function (e) {
                var id = containerDiv.replace("#", "");
                _this.CurrentTableId = id;
                model.checks["comparison"]["selectionManager"].MaintainHighlightedRow(e.rowElement[0], containerDiv);
                model.checks["comparison"]["reviewManager"].OnCheckComponentRowClicked(e.data, id);
            }
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


    //Destroy accordion
    $("#" + this.MainReviewTableContainer).dxAccordion("dispose");

    document.getElementById(this.MainReviewTableContainer).innerHTML = "";
}

ComparisonCheckResultsTable.prototype.GetAccordionIndex = function (groupName) {
    var accordion = $("#" + this.MainReviewTableContainer).dxAccordion("instance");
    var accordionItems = accordion.getDataSource().items();
    var index;
    var selectedItems = accordion._selection.getSelectedItemKeys();
    for (var i = 0; i < accordionItems.length; i++) {
        if (!accordionItems[i]["template"].includes(groupName) ||
            (selectedItems.length > 0 && accordionItems[i]["template"] == selectedItems[0]["template"])) {
            continue;
        }
        else {
            return i;
        }
    }
    return index;
}

ComparisonCheckResultsTable.prototype.HighlightHiddenRows = function (isHide, checkComponentsRows) {

    for (var i = 0; i < checkComponentsRows.length; i++) {
        var selectedRow = checkComponentsRows[i];

        for (var j = 0; j < selectedRow.cells.length; j++) {
            var cell = selectedRow.cells[j];
            if (isHide) {
                cell.style.color = HiddenElementTextColor;
            }
            else {
                cell.style.color = "black";
            }
        }
    }
}

ComparisonCheckResultsTable.prototype.UpdateGridData = function (selectedRow,
    tableContainer,
    changedStatus,
    populateDetailedTable) {

    var dataGrid = $(tableContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();
    var rowData = data[selectedRow.rowIndex];
    rowData.Status = changedStatus;

    dataGrid.repaintRows(selectedRow.rowIndex);

    if (populateDetailedTable) {
        model.checks["comparison"]["detailedInfoTable"].populateDetailedReviewTable(rowData);
    }
}

ComparisonCheckResultsTable.prototype.GetComponentIds = function (gridId) {
    var selectionManager = model.getCurrentSelectionManager();
    var selectedComponents = selectionManager.GetSelectedComponents();
    if (selectedComponents.length === 0) {
        return undefined;
    }

    var dataGrid = $(gridId).dxDataGrid("instance");
    var rowsData = dataGrid.getDataSource().items();

    var sourceAIds = [];
    var sourceBIds = [];
    for (var i = 0; i < selectedComponents.length; i++) {
        var selectedRow = selectedComponents[i];

        var rowData = rowsData[selectedRow["rowIndex"]];
        // source A        
        if (rowData[ComparisonColumnNames.SourceAId] !== "" && rowData[ComparisonColumnNames.SourceAId] !== null) {
            sourceAIds.push(Number(rowData[ComparisonColumnNames.SourceAId]));
        }

        // source B        
        if (rowData[ComparisonColumnNames.SourceBId] !== "" && rowData[ComparisonColumnNames.SourceBId] !== null) {
            sourceBIds.push(Number(rowData[ComparisonColumnNames.SourceBId]));
        }
    }

    return {
        "a": sourceAIds,
        "b": sourceBIds
    };
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

        model.getCurrentReviewManager().detailedReviewRowComments[Object.keys(model.getCurrentReviewManager().detailedReviewRowComments).length] = property.description;

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
            allowColumnResizing: true,
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
                mode: "standard"
            },
            paging: {
                enabled: false
            },
            onContentReady: function (e) {
                _this.highlightDetailedReviewTableFromCheckStatus(_this.DetailedReviewTableContainer)
            },
            onInitialized: function (e) {
                // initialize the context menu
                var reviewComparisonContextMenuManager = new ReviewComparisonContextMenuManager(model.checks["comparison"]["reviewManager"]);
                reviewComparisonContextMenuManager.InitPropertyLevelContextMenu(viewerContainer);
            },
            onCellPrepared: function (e) {
                if (e.rowType == "header") {
                    e.cellElement.css("text-align", "center");
                    e.cellElement.css("color", "black");
                    e.cellElement.css("font-weight", "bold");
                }
            },
            onSelectionChanged: function (e) {

            },
            onRowClick: function (e) {
                model.getCurrentSelectionManager().MaintainHighlightedDetailedRow(e.rowElement[0]);
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

    var dataGrid = $("#" + containerId).dxDataGrid("instance");

    var detailedReviewTableRows = dataGrid.getVisibleRows();

    // skip header and filter textbox, hence i = 3
    for (var i = 0; i < detailedReviewTableRows.length; i++) {
        var currentRow = dataGrid.getRowElement(detailedReviewTableRows[i].rowIndex);
        if (currentRow[0].cells.length > 1) {
            var status = dataGrid.cellValue(detailedReviewTableRows[i].rowIndex, ComparisonPropertyColumns.Status)
            model.getCurrentSelectionManager().ChangeBackgroundColor(currentRow[0], status);
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

ComparisonCheckPropertiesTable.prototype.UpdateGridData = function (rowIndex, property) {
    var detailInfoContainer = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();
    var rowData = data[rowIndex];
    rowData[ComparisonPropertyColumnNames.Status] = property["severity"];

    if (property["severity"] !== "ACCEPTED") {
        if (property.transpose == "lefttoright") {
            rowData[ComparisonPropertyColumnNames.SourceBValue] = property["sourceAValue"];

        }
        else if (property.transpose == "righttoleft") {
            rowData[ComparisonPropertyColumnNames.SourceAValue] = property["sourceBValue"];
        }
        else if (property.transpose == null) {
            rowData[ComparisonPropertyColumnNames.SourceAValue] = property["sourceAValue"];
            rowData[ComparisonPropertyColumnNames.SourceBValue] = property["sourceBValue"];
        }
    }

    dataGrid.repaintRows(rowIndex);
}
