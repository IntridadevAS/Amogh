function ComparisonCheckResultsTable(mainReviewTableContainer) {


    this.MainReviewTableContainer = mainReviewTableContainer;
    // this.CurrentTableId;
    this.CheckTableIds = {};
    this.ContextMenus = {};
}

ComparisonCheckResultsTable.prototype.CreateAccordion = function () {
    var _this = this;

    var parentTable = document.getElementById(_this.MainReviewTableContainer);

    var data = _this.CreateAccordionData();
    for (var i = 0; i < data.length; i++) {
        var div = document.createElement("DIV");
        div.setAttribute('data-options', "dxTemplate: { name: '" + data[i]["template"] + "' }");
        div.id = data[i]["template"];
        var datagridDiv = document.createElement("DIV");
        datagridDiv.id = _this.getTableId(data[i]["template"]);
        div.append(datagridDiv);
        parentTable.append(div);
    }

    $("#" + _this.MainReviewTableContainer).dxAccordion({
        collapsible: true,
        dataSource: data,
        deferRendering: false,
        selectedIndex: -1,       
        // onSelectionChanged: function (e) {
        //     if (e.addedItems.length > 0) {
        //         _this.CurrentTableId = _this.getTableId(e.addedItems[0]["template"]);
        //     }
        // },
        onItemRendered: function (e) {
            // initialize the context menu             
            var containerDiv = "#" + _this.getTableId(e.itemData["template"]);

            if (!(containerDiv in _this.ContextMenus)) {
                var reviewComparisonContextMenuManager = new ReviewComparisonContextMenuManager(model.getCurrentReviewManager());
                _this.ContextMenus[containerDiv] = reviewComparisonContextMenuManager;
            }
            e.itemElement[0].id = e.itemData["template"] + "_accordion";
            _this.ContextMenus[containerDiv].InitGroupLevelContextMenu(e.itemElement[0].id);
        },
        itemTitleTemplate: function (itemData, itemIndex, itemElement) {
            var btn = $('<div>')
            $(btn).data("index", itemIndex)
                .dxButton({
                    icon: "chevrondown",
                    width: "38px",
                    height: "30px",
                    onClick: function (e) {
                        e.event.stopPropagation();
                        var isOpened = e.element.parent().next().parent().hasClass("dx-accordion-item-opened")
                        if (!isOpened) {
                            $("#" + _this.MainReviewTableContainer).dxAccordion("instance").expandItem(e.element.data("index"));
                        }
                        else {
                            $("#" + _this.MainReviewTableContainer).dxAccordion("instance").collapseItem(e.element.data("index"));
                        }

                    }
                }).css("float", "right").appendTo(itemElement);

            btn[0].classList.add("accordionButton");

            itemElement.append("<h1 style = 'font-size: 15px; text-align: center;color: white;'>" + itemData.title + "</h1>");

        },
        onItemTitleClick: function (e) {
            e.event.stopPropagation();
        },
        onItemClick: function (e) {
            e.event.stopPropagation();
        }
    });
}

ComparisonCheckResultsTable.prototype.getTableId = function(tableName) {
    return tableName.replace(/\s/g, '') + "_" + this.MainReviewTableContainer;
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

ComparisonCheckResultsTable.prototype.GetAccordionData = function(groupName) {
    var accordion = $("#" + this.MainReviewTableContainer).dxAccordion("instance");
    var accordionItems = accordion.getDataSource().items();
    var accordionData;
    for (var i = 0; i < accordionItems.length; i++) {
        if (!accordionItems[i]["template"].includes(groupName)) {
            continue;
        }
        else {
            return accordionItems[i];
        }
    }

    return accordionData;
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
        dataObject["groupId"] = groupId;

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
            if (sources.length === 2) {
                width = "40%";
            }
            else if (sources.length === 3) {
                width = "26%";
            }
            else if (sources.length === 4) {
                width = "20%";
            }
        }
        else if (i === ComparisonColumns.SourceBName) {
            caption = sources[1];
            dataField = ComparisonColumnNames.SourceBName;
            if (sources.length === 2) {
                width = "40%";
            }
            else if (sources.length === 3) {
                width = "26%";
            }
            else if (sources.length === 4) {
                width = "20%";
            }
        }
        else if (i === ComparisonColumns.SourceCName) {

            caption = dataField = ComparisonColumnNames.SourceCName;   
            if (sources.length > 2) {
                caption = sources[2];
                dataField = ComparisonColumnNames.SourceCName;              
                if (sources.length === 3) {
                    width = "26%";
                }
                else if (sources.length === 4) {
                    width = "20%";
                }
            }
            else {
                visible = false;
            }
        }
        else if (i === ComparisonColumns.SourceDName) {
            caption = dataField = ComparisonColumnNames.SourceDName;   
            if (sources.length > 3) {
                caption = sources[3];
                dataField = ComparisonColumnNames.SourceDName;
                width = "20%";
            }
            else {
                visible = false;
            }
        }
        else if (i === ComparisonColumns.Status) {
            caption = "Status";
            dataField = ComparisonColumnNames.Status;
            width = "20%";
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
        else if (i === ComparisonColumns.SourceCNodeId) {
            caption = "SourceCNodeId";
            dataField = ComparisonColumnNames.SourceCNodeId;
            visible = false;
            width = "0%";
        }
        else if (i === ComparisonColumns.SourceDNodeId) {
            caption = "SourceDNodeId";
            dataField = ComparisonColumnNames.SourceDNodeId;
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
        else if (i === ComparisonColumns.SourceCId) {
            caption = "SourceCId";
            dataField = ComparisonColumnNames.SourceCId;
            visible = false;
            width = "0%";
        }
        else if (i === ComparisonColumns.SourceDId) {
            caption = "SourceDId";
            dataField = ComparisonColumnNames.SourceDId;
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
        else if(i === ComparisonColumns.ClassMappingInfo)
        {
            caption = ComparisonColumnNames.ClassMappingInfo;
            dataField = ComparisonColumnNames.ClassMappingInfo;
            visible = false;
            width = "0%"; 
        }

        columnHeader["caption"] = caption;
        columnHeader["dataField"] = dataField;        
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
        
        var cName = "";
        if(component.sourceCName)
        {
            cName = component.sourceCName;           
        }
        tableRowContent[ComparisonColumnNames.SourceCName] =cName;

        var dName = "";
        if(component.sourceDName)
        {
            dName = component.sourceDName;        
        }
        tableRowContent[ComparisonColumnNames.SourceDName] = dName;

        tableRowContent[ComparisonColumnNames.Status] = component.status;

        if(component.accepted == "true") {
            tableRowContent[ComparisonColumnNames.Status] = "OK(A)";
        }

        tableRowContent[ComparisonColumnNames.SourceANodeId] = component.sourceANodeId;
        tableRowContent[ComparisonColumnNames.SourceBNodeId] = component.sourceBNodeId;
        tableRowContent[ComparisonColumnNames.SourceCNodeId] = component.sourceCNodeId;
        tableRowContent[ComparisonColumnNames.SourceDNodeId] = component.sourceDNodeId;

        tableRowContent[ComparisonColumnNames.SourceAId] = component.sourceAId;
        tableRowContent[ComparisonColumnNames.SourceBId] = component.sourceBId;
        tableRowContent[ComparisonColumnNames.SourceCId] = component.sourceCId;
        tableRowContent[ComparisonColumnNames.SourceDId] = component.sourceDId;

        tableRowContent[ComparisonColumnNames.ResultId] = component.id;
        tableRowContent[ComparisonColumnNames.GroupId] = component.ownerGroup;

        tableRowContent[ComparisonColumnNames.ClassMappingInfo] = component.classMappingInfo;

        tableData.push(tableRowContent);

        model.getCurrentReviewManager().MaintainNodeIdVsCheckComponent(component, mainClass);
    }

    return tableData;
}

ComparisonCheckResultsTable.prototype.highlightMainReviewTableFromCheckStatus = function (containerId) {
    var dataGrid = $(containerId).dxDataGrid("instance");
    var mainReviewTableRows = dataGrid.getVisibleRows();
    var highlightedRowKey = "0";

    if(model.getCurrentSelectionManager().HighlightedCheckComponentRow)
        highlightedRowKey =  model.getCurrentSelectionManager().HighlightedCheckComponentRow["rowKey"];

    for (var i = 0; i < mainReviewTableRows.length; i++) {
        var reviewRow = mainReviewTableRows[i];
        var reviewRowElement = dataGrid.getRowElement(reviewRow.rowIndex);

        if(!reviewRow.isSelected && reviewRow.key !== highlightedRowKey) {
           
            // if (reviewRowElement[0].cells.length < 3) {
            //     return;
            // }    
            
            var status = reviewRow.data[ComparisonColumnNames.Status];
            model.getCurrentSelectionManager().ChangeBackgroundColor(reviewRowElement[0], status);
        }
        else if(reviewRow.key == highlightedRowKey) {           
            // if (currentRow[0].cells.length < 3) {
            //     return;
            // }
            model.getCurrentSelectionManager().ApplyHighlightColor(reviewRowElement[0]);
        }
    }
}


ComparisonCheckResultsTable.prototype.populateReviewTable = function () {
    var _this = this;
    var ComparisonTableData = model.getCurrentReviewManager().ComparisonCheckManager;

    if (!("results" in ComparisonTableData)) {
        return;
    }

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

        _this.CreateTable(groupId, componentsGroup);
    }

    // Add undefined category last
    if (undefinedGroupId) {
        var componentsGroup = model.getCurrentReviewManager().GetCheckGroup(undefinedGroupId);
        _this.CreateTable(undefinedGroupId, componentsGroup);
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

    // $(function () {
        $(containerDiv).dxDataGrid({
            dataSource: tableData,
            keyExpr: ComparisonColumnNames.ResultId,
            columns: columnHeaders,
            columnAutoWidth: true,
            columnResizingMode: 'widget',
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            allowColumnResizing: true,
            hoverStateEnabled: true,
            deferRendering: false,
            filterRow: {
                visible: true
            },
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always",                
            },
            paging: { enabled: false },
            onContentReady: function (e) {
                //_this.highlightMainReviewTableFromCheckStatus(containerDiv);
                model.getCurrentReviewManager().AddTableContentCount(containerDiv.replace("#", ""));
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
                if(!(containerDiv in _this.ContextMenus))
                {
                    var reviewComparisonContextMenuManager = new ReviewComparisonContextMenuManager(model.getCurrentReviewManager());
                    _this.ContextMenus[containerDiv] = reviewComparisonContextMenuManager;
                }

                _this.ContextMenus[containerDiv].ComponentTableContainer = containerDiv;
                _this.ContextMenus[containerDiv].InitComponentLevelContextMenu(containerDiv);                
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
                // _this.CurrentTableId = id;
                model.checks["comparison"]["selectionManager"].MaintainHighlightedRow(e.rowElement[0], containerDiv);
                model.checks["comparison"]["reviewManager"].OnCheckComponentRowClicked(e.data, id);
            },
            onRowPrepared: function (e) {
                if (e.rowType !== "data") {
                    return;
                }

                _this.AddTooltip(e);
                var highlightedRowKey;
                if (model.getCurrentSelectionManager().HighlightedCheckComponentRow) {
                    highlightedRowKey = model.getCurrentSelectionManager().HighlightedCheckComponentRow["rowKey"];
                }

                if (e.isSelected || e.key == highlightedRowKey) {
                    model.getCurrentSelectionManager().ApplyHighlightColor(e.rowElement[0]);
                }
                else {
                    var status = e.data["Status"];
                    model.getCurrentSelectionManager().ChangeBackgroundColor(e.rowElement[0], status);
                }
            }
        });
    // });

    // var container = document.getElementById(containerDiv.replace("#", ""));
    // container.style.margin = "0px"
    // container.style.padding = "0";

};

ComparisonCheckResultsTable.prototype.AddTooltip = function (e) {

    if (e.data.ClassMappingInfo) {
        for (var i = 0; i < e.rowElement[0].cells.length; i++) {
            var cell = e.rowElement[0].cells[i];
            cell.setAttribute("title", e.data.ClassMappingInfo);
        }
    }
}


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
            (selectedItems.length > 0 && 
             accordionItems[i]["template"] == selectedItems[0]["template"])) {
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

ComparisonCheckResultsTable.prototype.UpdateGridData = function (componentId,
    tableContainer,
    changedStatus,
    populateDetailedTable) {

    var dataGrid = $(tableContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();
    var rowIndex = dataGrid.getRowIndexByKey(componentId);
    var rowData = data[rowIndex];
    rowData.Status = changedStatus;

    dataGrid.repaintRows(rowIndex);

    if (populateDetailedTable) {
        model.checks["comparison"]["detailedInfoTable"].populateDetailedReviewTable(rowData, tableContainer.replace("#", ""));
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
    this.SelectedProperties = [];
}

ComparisonCheckPropertiesTable.prototype.CreatePropertiesTableHeader = function (sources) {
    var columnHeaders = [];

    for (var i = 0; i < 6; i++) {
        var columnHeader = {}
        var caption;
        var columns;
        var dataField;
        var width;
        var visible = true;

        // var dataType;
        if (i == 0) {
            var group = [];
            for (var j = 1; j < Object.keys(ComparisonPropertyColumns).length; j++) {
                var headerGroupComp = {}
                var visible = true;
                if (j === ComparisonPropertyColumns.SourceAName) {
                    caption = "Property";
                    dataField = ComparisonPropertyColumnNames.SourceAName;

                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[group.length] = headerGroupComp;
                }
                else if (j === ComparisonPropertyColumns.SourceAValue) {
                    caption = "Value";
                    dataField = ComparisonPropertyColumnNames.SourceAValue;
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[group.length] = headerGroupComp;
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

                    group[group.length] = headerGroupComp;
                }
                else if (j === ComparisonPropertyColumns.SourceBName) {
                    caption = "Property";
                    dataField = ComparisonPropertyColumnNames.SourceBName;

                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[group.length] = headerGroupComp;
                }
            }
            caption = sources[1];
            dataField = null;
            columns = group;
        }

        if (i == 2) {
            var group = [];
            for (var j = 1; j < Object.keys(ComparisonPropertyColumns).length; j++) {               
                
                if (j === ComparisonPropertyColumns.SourceCName) {
                    caption = "Property";
                    dataField = ComparisonPropertyColumnNames.SourceCName;

                    var headerGroupComp = {}
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[group.length] = headerGroupComp;
                }
                else if (j === ComparisonPropertyColumns.SourceCValue) {
                    caption = "Value";
                    dataField = ComparisonPropertyColumnNames.SourceCValue;
                    
                    var headerGroupComp = {}
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[group.length] = headerGroupComp;
                }              
            }
            caption = "SourceC";
            dataField = null;
            columns = group;
           
            if (sources.length < 3) {
                visible = false;
            }
            else {
                caption = sources[2];
            }
        }

        if (i == 3) {
            var group = [];
            for (var j = 1; j < Object.keys(ComparisonPropertyColumns).length; j++) {               
                
                if (j === ComparisonPropertyColumns.SourceDName) {
                    caption = "Property";
                    dataField = ComparisonPropertyColumnNames.SourceDName;

                    var headerGroupComp = {}
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[group.length] = headerGroupComp;
                }
                else if (j === ComparisonPropertyColumns.SourceDValue) {
                    caption = "Value";
                    dataField = ComparisonPropertyColumnNames.SourceDValue;
                    
                    var headerGroupComp = {}
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[group.length] = headerGroupComp;
                }              
            }
            caption = "SourceD";
            dataField = null;
            columns = group;
           
            if (sources.length < 4) {
                visible = false;
            }
            else {
                caption = sources[3];
            }
        }

        if (i == 4) {
            caption = "Status";
            dataField = ComparisonPropertyColumnNames.Status;
            width = "20%";           
            columns = []
        }

        if (i == 5) {
            caption = "ID";
            dataField = ComparisonPropertyColumnNames.PropertyId;
            visible = false;
        }

        columnHeader["caption"] = caption;
        if (dataField !== null) {
            columnHeader["dataField"] = dataField;
        }

        if(visible == false) {
            columnHeader["visible"] = visible;
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
        tableRowContent[ComparisonPropertyColumnNames.SourceCName] = property.sourceCName;
        tableRowContent[ComparisonPropertyColumnNames.SourceCValue] = property.sourceCValue;  
        tableRowContent[ComparisonPropertyColumnNames.SourceDValue] = property.sourceDValue;
        tableRowContent[ComparisonPropertyColumnNames.SourceDName] = property.sourceDName;

        // var cName = "";
        // var cValue = "";
        // if(property.sourceCName)
        // {
        //     cName = property.sourceCName;
        //     cValue = property.sourceCValue;
        // }
        // tableRowContent[ComparisonPropertyColumnNames.SourceCName] = cName;
        // tableRowContent[ComparisonPropertyColumnNames.SourceCValue] = cValue;       

        // var dName = "";
        // var dValue = "";
        // if(property.sourceDName)
        // {
        //     dName = property.sourceDName;
        //     dValue = property.sourceDValue;
        // }
        // tableRowContent[ComparisonPropertyColumnNames.SourceDValue] = dName;
        // tableRowContent[ComparisonPropertyColumnNames.SourceDName] = dValue;

        tableRowContent[ComparisonPropertyColumnNames.Status] = property.severity;
        if(property.accepted == "true") {
            tableRowContent[ComparisonPropertyColumnNames.Status] = 'ACCEPTED';
        }
        else if (property.transpose == 'FromDataSource1' && property.severity !== 'No Value') {
            tableRowContent[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            tableRowContent[ComparisonPropertyColumnNames.SourceBValue] = property.sourceAValue;
            tableRowContent[ComparisonPropertyColumnNames.SourceCValue] = property.sourceAValue;
            tableRowContent[ComparisonPropertyColumnNames.SourceDValue] = property.sourceAValue;
        }
        else if (property.transpose == 'FromDataSource2' && property.severity !== 'No Value') {
            tableRowContent[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            tableRowContent[ComparisonPropertyColumnNames.SourceAValue] = property.sourceBValue;
            tableRowContent[ComparisonPropertyColumnNames.SourceCValue] = property.sourceBValue;
            tableRowContent[ComparisonPropertyColumnNames.SourceDValue] = property.sourceBValue;
        }
        else if (property.transpose == 'FromDataSource3' && property.severity !== 'No Value') {
            tableRowContent[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            tableRowContent[ComparisonPropertyColumnNames.SourceAValue] = property.sourceCValue;
            tableRowContent[ComparisonPropertyColumnNames.SourceBValue] = property.sourceCValue;
            tableRowContent[ComparisonPropertyColumnNames.SourceDValue] = property.sourceCValue;
        }
        else if (property.transpose == 'FromDataSource4' && property.severity !== 'No Value') {
            tableRowContent[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            tableRowContent[ComparisonPropertyColumnNames.SourceAValue] = property.sourceDValue;
            tableRowContent[ComparisonPropertyColumnNames.SourceBValue] = property.sourceDValue;
            tableRowContent[ComparisonPropertyColumnNames.SourceCValue] = property.sourceDValue;
        }

        tableRowContent[ComparisonPropertyColumnNames.PropertyId] = propertyId

        model.getCurrentReviewManager().detailedReviewRowComments[Object.keys(model.getCurrentReviewManager().detailedReviewRowComments).length] = property.description;

        tableData.push(tableRowContent);
    }

    return tableData;
}

ComparisonCheckPropertiesTable.prototype.populateDetailedReviewTable = function (rowData, containerDiv) {
    //Clear earlier selection from detailed review table
    this.SelectedProperties = [];
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

    this.LoadDetailedReviewTableData(columnHeaders, tableData, containerDiv);

}

ComparisonCheckPropertiesTable.prototype.LoadDetailedReviewTableData = function (columnHeaders, tableData, containerDiv) {
    var viewerContainer = "#" + this.DetailedReviewTableContainer;
    var _this = this;

    this.Destroy();
    // var height =  document.getElementById("tableDataComparison").offsetHeight / 2 + "px";
    $(function () {
        $(viewerContainer).dxDataGrid({
            dataSource: tableData,
            keyExpr: ComparisonPropertyColumnNames.PropertyId,
            columns: columnHeaders,
            columnAutoWidth: true,
            columnResizingMode: 'widget',
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
                // initialize the context menu  
                // internal call from repaint rows gives containerId with # hence check
                if(!containerDiv.includes("#")) {
                    containerDiv = "#" + containerDiv;
                }

                // if(document.getElementById(_this.DetailedReviewTableContainer).style.display == "none") {
                //     document.getElementById(_this.DetailedReviewTableContainer).style.display = "block";
                // }
                
                if(!(containerDiv in model.getCurrentReviewTable().ContextMenus))
                {
                    var reviewComparisonContextMenuManager = new ReviewComparisonContextMenuManager(model.getCurrentReviewManager());
                    model.getCurrentReviewTable().ContextMenus[containerDiv] = reviewComparisonContextMenuManager;
                }

                model.getCurrentReviewTable().ContextMenus[containerDiv].InitPropertyLevelContextMenu(viewerContainer);       
                _this.highlightDetailedReviewTableFromCheckStatus(_this.DetailedReviewTableContainer);
            },
            onCellPrepared: function (e) {
                if (e.rowType == "header") {
                    e.cellElement.css("text-align", "center");
                    e.cellElement.css("color", "black");
                    e.cellElement.css("font-weight", "bold");
                }
            },
            onSelectionChanged: function (e) {
                if(e.currentSelectedRowKeys.length > 0) {
                    for(var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        _this.SelectedProperties.push(e.currentSelectedRowKeys[i]);
                    }
                }
                else {
                    for(var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        var index = _this.SelectedProperties.indexOf(e.currentDeselectedRowKeys[i]);
                        if (index > -1) {
                            _this.SelectedProperties.splice(index, 1);
                        }
                    }
                }
            },
            onRowClick: function (e) {
                model.getCurrentSelectionManager().MaintainHighlightedDetailedRow(e.rowElement[0], e.key);
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
        var detailedReviewTableRow = detailedReviewTableRows[i];
        var currentRow = dataGrid.getRowElement(detailedReviewTableRow.rowIndex);
        // if (currentRow[0].cells.length > 1) {
            //var status = dataGrid.cellValue(detailedReviewTableRows[i].rowIndex, ComparisonPropertyColumns.Status)
            var status = detailedReviewTableRow.data[ComparisonPropertyColumnNames.Status];
            model.getCurrentSelectionManager().ChangeBackgroundColor(currentRow[0], status);
        // }
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
    // viewerContainerDiv.style.display = "none";

    parent.appendChild(viewerContainerDiv);
}

ComparisonCheckPropertiesTable.prototype.GetDataForSelectedRow = function (rowIndex, containerDiv) {
    var dataGrid = $(containerDiv).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();
    var rowData = data[rowIndex];
    return rowData;
}

ComparisonCheckPropertiesTable.prototype.UpdateGridData = function (rowKey, property) {
    var detailInfoContainer = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();
    var rowIndex = dataGrid.getRowIndexByKey(rowKey);
    var rowData = data[rowIndex];
    rowData[ComparisonPropertyColumnNames.Status] = property["severity"];

    if (property["severity"] !== "ACCEPTED") {
        if (property.transpose == 'FromDataSource1') {
            rowData[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            rowData[ComparisonPropertyColumnNames.SourceBValue] = property.sourceAValue;
            rowData[ComparisonPropertyColumnNames.SourceCValue] = property.sourceAValue;
            rowData[ComparisonPropertyColumnNames.SourceDValue] = property.sourceAValue;
        }
        else if (property.transpose == 'FromDataSource2') {
            rowData[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            rowData[ComparisonPropertyColumnNames.SourceAValue] = property.sourceBValue;
            rowData[ComparisonPropertyColumnNames.SourceCValue] = property.sourceBValue;
            rowData[ComparisonPropertyColumnNames.SourceDValue] = property.sourceBValue;
        }
        else if (property.transpose == 'FromDataSource3') {
            rowData[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            rowData[ComparisonPropertyColumnNames.SourceAValue] = property.sourceCValue;
            rowData[ComparisonPropertyColumnNames.SourceBValue] = property.sourceCValue;
            rowData[ComparisonPropertyColumnNames.SourceDValue] = property.sourceCValue;
        }
        else if (property.transpose == 'FromDataSource4') {
            rowData[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            rowData[ComparisonPropertyColumnNames.SourceAValue] = property.sourceDValue;
            rowData[ComparisonPropertyColumnNames.SourceBValue] = property.sourceDValue;
            rowData[ComparisonPropertyColumnNames.SourceCValue] = property.sourceDValue;
        }
        else if (property.transpose == null) {
            rowData[ComparisonPropertyColumnNames.SourceAValue] = property["sourceAValue"];
            rowData[ComparisonPropertyColumnNames.SourceBValue] = property["sourceBValue"];
            rowData[ComparisonPropertyColumnNames.SourceCValue] = property["sourceCValue"];
            rowData[ComparisonPropertyColumnNames.SourceDValue] = property["sourceDValue"];
        }
    }

    dataGrid.repaintRows(rowIndex);
}
