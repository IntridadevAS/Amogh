function ComplianceCheckResultsTable(mainReviewTableContainer) {
    this.MainReviewTableContainer = mainReviewTableContainer;
    this.CurrentTableId;
    this.CheckTableIds = {};
    this.ContextMenus = {};
}

ComplianceCheckResultsTable.prototype.CreateAccordion = function () {
    var parentTable = document.getElementById(this.MainReviewTableContainer);

    var _this = this;
    var data = this.CreateAccordionData();
    for (var i = 0; i < data.length; i++) {
        var div = document.createElement("DIV");
        div.setAttribute('data-options', "dxTemplate: { name: '" + data[i]["template"] + "' }");
        div.id = data[i]["template"];
        var datagridDiv = document.createElement("DIV");
        let id = data[i]["template"] + "_" + this.MainReviewTableContainer;;
        id = xCheckStudio.Util.createValidHTMLId(id); 
        datagridDiv.id = id;
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
                let id = e.addedItems[0]["template"] + "_" + _this.MainReviewTableContainer;
                id = xCheckStudio.Util.createValidHTMLId(id);
                model.getCurrentReviewTable().CurrentTableId = id;
            }
        },
        itemTitleTemplate: function (itemData, itemIndex, itemElement) {
            // var btn = $('<div>')
            // $(btn).data("index", itemIndex)
            //     .dxButton({
            //         icon: "chevrondown",
            //         width: "38px",
            //         height: "30px",
            //         onClick: function (e) {
            //             e.event.stopPropagation();
            //             var isOpened = e.element.parent().next().parent().hasClass("dx-accordion-item-opened")
            //             if (!isOpened) {
            //                 $("#" + _this.MainReviewTableContainer).dxAccordion("instance").expandItem(e.element.data("index"));
            //             }
            //             else {
            //                 $("#" + _this.MainReviewTableContainer).dxAccordion("instance").collapseItem(e.element.data("index"));
            //             }

            //         }
            //     }).css("float", "right").appendTo(itemElement);

            // btn[0].classList.add("accordionButton");

            itemElement.append("<h1 style = 'font-size: 15px; text-align: center;color: white;'>" + itemData.title + "</h1>");

        },
        // onItemTitleClick: function (e) {
        //     e.event.stopPropagation();
        // },
        // onItemClick: function (e) {
        //     e.event.stopPropagation();
        // },        
        onItemContextMenu: function(e) {
            if (e.event.target.localName.toLowerCase() !== "h1") {
                return;
            }
            
            var containerDiv = "#" + _this.getTableId(e.itemData["template"]);
            if (!(containerDiv in _this.ContextMenus) && !e.itemData["template"].toLowerCase().includes("undefined")) {
                var reviewComplianceContextMenuManager = new ReviewComplianceContextMenuManager(model.getCurrentReviewManager());
                _this.ContextMenus[containerDiv] = reviewComplianceContextMenuManager;
            }
            if(!e.itemData["template"].toLowerCase().includes("undefined")) {
                _this.ContextMenus[containerDiv].InitGroupLevelContextMenu(e);
            }
        }
    });
}

ComplianceCheckResultsTable.prototype.getTableId = function (tableName) {
    let id = tableName + "_" + this.MainReviewTableContainer;
    id = xCheckStudio.Util.createValidHTMLId(id);
    return id;
}

ComplianceCheckResultsTable.prototype.GetAccordionData = function (groupName) {
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

ComplianceCheckResultsTable.prototype.ExpandAccordionScrollToRow = function (row, groupName) {

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

ComplianceCheckResultsTable.prototype.CreateAccordionData = function () {
    var ComplianceTableData = model.checks["compliance"]["reviewManager"].ComplianceCheckManager;
    var checkGroups = ComplianceTableData["results"];

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
        var componentsGroup = model.checks["compliance"]["reviewManager"].GetCheckGroup(undefinedGroupId);
        dataObject["template"] = componentsGroup.componentClass;
        dataObject["title"] = componentsGroup.componentClass;

        data.push(dataObject);
    }
    return data;
}

ComplianceCheckResultsTable.prototype.GetAccordionIndex = function (groupName) {
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
        tableRowContent[ComplianceColumnNames.SourceId] = component.sourceId;
        tableRowContent[ComplianceColumnNames.ResultId] = component.id;
        tableRowContent[ComplianceColumnNames.GroupId] = groupId;

        if (component.accepted == "true") {
            tableRowContent[ComplianceColumnNames.Status] = "OK(A)";
        }

        tableData.push(tableRowContent);

        // maintain track of check components
        if (component.nodeId) {
            model.getCurrentReviewManager().SourceNodeIdvsCheckComponent[component.nodeId] = {
                "Id": component.id,
                "SourceAName": component.name,
                "MainClass": mainClass,
                "SourceANodeId": component.nodeId,
                "sourceId": component.sourceId,
                "status": component.status
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
        else if (i === ComplianceColumns.SourceId) {
            caption = "SourceId";
            dataField = ComplianceColumnNames.SourceId;
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
        if (visible == false) {
            columnHeader["visible"] = visible;
        }

        columnHeader["width"] = "50%";
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

    this.CreateAccordion();
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

        if (componentsGroup.componentClass.toLowerCase() == "undefined") {
            undefinedGroupId = groupId;
            continue;
        }

        this.CreateTable(groupId, componentsGroup);
    }
    // Add undefined category last
    if (undefinedGroupId) {
        var componentsGroup = model.checks["compliance"]["reviewManager"].GetCheckGroup(undefinedGroupId);
        this.CreateTable(undefinedGroupId, componentsGroup);
    }
}

ComplianceCheckResultsTable.prototype.CreateTable = function (groupId, componentsGroup) {
    var ComplianceData = model.getCurrentReviewManager().ComplianceCheckManager;

    var columnHeaders = this.CreateMainTableHeaders(ComplianceData.source);

    var tableData = this.CreateTableData(componentsGroup.components, groupId, componentsGroup.componentClass);;

    var id = componentsGroup.componentClass + "_" + this.MainReviewTableContainer;
    id = "#" + xCheckStudio.Util.createValidHTMLId(id);   
    this.LoadReviewTableData(columnHeaders, tableData, id);

    // maintain table ids
    this.CheckTableIds[groupId] = id;
}

ComplianceCheckResultsTable.prototype.LoadReviewTableData = function (columnHeaders, tableData, viewerContainer) {
    var _this = this;

    $(function () {
        $(viewerContainer).dxDataGrid({
            dataSource: tableData,
            keyExpr: ComplianceColumnNames.ResultId,
            columns: columnHeaders,
            columnAutoWidth: true,
            columnResizingMode: 'widget',
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            allowColumnResizing: true,
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
            onContentReady: function (e) {
                model.checks["compliance"]["reviewManager"].AddTableContentCount(viewerContainer.replace("#", ""));
            },
            onInitialized: function (e) {
                // initialize the context menu
                if (!(viewerContainer in _this.ContextMenus)) {
                    var reviewComplianceContextMenuManager = new ReviewComplianceContextMenuManager(model.getCurrentReviewManager());
                    _this.ContextMenus[viewerContainer] = reviewComplianceContextMenuManager;
                }

                _this.ContextMenus[viewerContainer].ComponentTableContainer = viewerContainer;
                _this.ContextMenus[viewerContainer].InitComponentLevelContextMenu(viewerContainer);
            },
            onCellPrepared: function (e) {
                if (e.rowType == "header") {
                    e.cellElement.css("text-align", "center");
                    e.cellElement.css("color", "black");
                    e.cellElement.css("font-weight", "bold");
                }
            },
            onSelectionChanged: function (e) {
                if (e.currentSelectedRowKeys.length > 0) {
                    for (var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        var rowIndex = e.component.getRowIndexByKey(e.currentSelectedRowKeys[i])
                        var row = e.component.getRowElement(rowIndex);
                        model.getCurrentSelectionManager().HandleCheckComponentSelectFormCheckBox(row[0], viewerContainer, "on");
                    }
                }
                else {
                    for (var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        var rowIndex = e.component.getRowIndexByKey(e.currentDeselectedRowKeys[i])
                        var row = e.component.getRowElement(rowIndex);
                        model.getCurrentSelectionManager().HandleCheckComponentSelectFormCheckBox(row[0], viewerContainer, "off");
                    }
                }
            },
            onRowClick: function (e) {
                var id = viewerContainer.replace("#", "");
                _this.CurrentTableId = id;
                model.getCurrentSelectionManager().MaintainHighlightedRow(e.rowElement[0], viewerContainer);
                model.getCurrentReviewManager().OnCheckComponentRowClicked(e.data, id);

                // property call out
                model.getCurrentReviewManager().OpenPropertyCallout(e.data);
            },
            onRowPrepared: function (e) {
                if (e.rowType !== "data") {
                    return;
                }

                var highlightedRowKey;
                if (model.getCurrentSelectionManager().HighlightedCheckComponentRow) {
                    highlightedRowKey = model.getCurrentSelectionManager().HighlightedCheckComponentRow["rowKey"];
                }

                if (e.key == highlightedRowKey) {
                    model.getCurrentSelectionManager().ApplyHighlightColor(e.rowElement[0]);
                }
                else {
                    var status = e.data["Status"];
                    model.getCurrentSelectionManager().ChangeBackgroundColor(e.rowElement[0], status);
                }
            }
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

    // destroy accordion

    $("#" + this.MainReviewTableContainer).dxAccordion("dispose");

    document.getElementById(this.MainReviewTableContainer).innerHTML = "";
}

ComplianceCheckResultsTable.prototype.HighlightHiddenRows = function (isHide, checkComponentsRows) {

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

ComplianceCheckResultsTable.prototype.UpdateGridData = function (componentId,
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
        var detailedInfoTable = model.checks["compliance"]["detailedInfoTable"];
        if (
          detailedInfoTable.CurrentComponent &&
          (detailedInfoTable.CurrentComponent.id !== rowData.ID ||
          detailedInfoTable.CurrentComponent.groupId !== rowData.groupId)
        ) {
          return;
        }

        detailedInfoTable.populateDetailedReviewTable(rowData, tableContainer.replace("#", ""));
    }
}

ComplianceCheckResultsTable.prototype.Refresh = function (tableIds) {
    for (var i = 0; i < tableIds.length; i++) {
        $(tableIds[i]).dxDataGrid("instance").refresh();
    }
}

ComplianceCheckResultsTable.prototype.GetComponentIds = function () {

    return new Promise((resolve) => {

        this.GetDataForSelectedRows().then(function (dataObjects) {
            if (!dataObjects ||
                dataObjects.length === 0) {
                return resolve(undefined);
            }


            var sourceIds = [];


            for (var i = 0; i < dataObjects.length; i++) {
                rowData = dataObjects[i];

                if (rowData[ComplianceColumnNames.SourceId] !== "" &&
                    rowData[ComplianceColumnNames.SourceId] !== null) {
                    sourceIds.push(Number(rowData[ComplianceColumnNames.SourceId]));
                }
            }

            var ids = {};
            ids[model.selectedCompliance.id] = sourceIds;
            return resolve(ids);
        });
    });
}

ComplianceCheckResultsTable.prototype.GetDataForSelectedRows = function () {

    return new Promise((resolve) => {

        var selectionManager = model.getCurrentSelectionManager();
        var selectedComponents = selectionManager.GetSelectedComponents();
        if (selectedComponents.length === 0) {
            return undefined;
        }

        var arr = [];

        for (var i = 0; i < selectedComponents.length; i++) {
            var selectedRow = selectedComponents[i];

            this.GetDataForSelectedRow(selectedRow).then(function (dataObject) {
                arr.push(dataObject);

                if (arr.length === selectedComponents.length) {
                    return resolve(arr);
                }
            });
        }
    });
}

ComplianceCheckResultsTable.prototype.GetDataForSelectedRow = function (selectedRow) {
    return new Promise((resolve) => {


        var dataGrid = $(selectedRow["tableId"]).dxDataGrid("instance");
        dataGrid.byKey(selectedRow["rowKey"]).done(function (dataObject) {
            return resolve(dataObject);
        }).fail(function (error) {
            return resolve(undefined);
        });

    });
}

function ComplianceCheckPropertiesTable(detailedReviewTableContainer) {
    this.DetailedReviewTableContainer = detailedReviewTableContainer;
    this.SelectedProperties = [];

    this.CurrentComponent = null;
}

ComplianceCheckPropertiesTable.prototype.CreatePropertiesTableHeader = function (source) {

    var columns = [];
    var columnHeader = {}
    var columnHeaders = [];
    for (var i = 1; i < Object.keys(CompliancePropertyColumns).length; i++) {
        var headerGroupComp = {}
        var visible = true;
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
        else if (i == CompliancePropertyColumns.Rule) {
            caption = "Condition";
            dataField = CompliancePropertyColumnNames.Rule;
        }
        else if (i === CompliancePropertyColumns.PropertyId) {
            caption = "ID";
            dataField = CompliancePropertyColumnNames.PropertyId;
            visible = false;
        }

        headerGroupComp["caption"] = caption;
        headerGroupComp["dataField"] = dataField;
        headerGroupComp["width"] = "25%";

        if (visible == false) {
            headerGroupComp["visible"] = visible;
        }
        // headerGroupComp["dataType"] = "string";
        columns.push(headerGroupComp);
    }

    columnHeader["caption"] = source;
    columnHeader["columns"] = columns;

    columnHeaders.push(columnHeader)
    return columnHeaders;
}

ComplianceCheckPropertiesTable.prototype.addPropertyRowToDetailedTable = function (property, columnHeaders, propertyId) {

    tableRowContent = {};
    tableRowContent[CompliancePropertyColumnNames.PropertyName] = property.name;
    tableRowContent[CompliancePropertyColumnNames.PropertyValue] = property.value;
    if (property.performCheck === "1" &&
        property.result === "1") {
        tableRowContent[CompliancePropertyColumnNames.Status] = "OK";
    }
    else {
        tableRowContent[CompliancePropertyColumnNames.Status] = property.severity;
    }

    if (property.accepted == "true") {
        tableRowContent[CompliancePropertyColumnNames.Status] = "ACCEPTED";
    }

    tableRowContent[CompliancePropertyColumnNames.PropertyId] = propertyId;
    tableRowContent[CompliancePropertyColumnNames.Rule] = property.rule;
    return tableRowContent;
}


ComplianceCheckPropertiesTable.prototype.populateDetailedReviewTable = function (rowData, containerDiv) {

    // if (
    //     this.CurrentComponent &&
    //     this.CurrentComponent.id === rowData.ID &&
    //     this.CurrentComponent.groupId === rowData.groupId
    //   ) {
    //     return;
    //   }
  
      this.Destroy();
      this.CurrentComponent = {
        id: rowData.ID,
        groupId: rowData.groupId,
      };   

    // var tableData = [];
    // var columnHeaders = [];
    //Clear earlier selection from detailed review table
    this.SelectedProperties = [];

    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    var component = model.getCurrentReviewManager().GetCheckComponent(groupId, componentId);

    var columnHeaders = this.CreatePropertiesTableHeader(model.getCurrentReviewManager().ComplianceCheckManager.source);

    var tableData = [];
    model.getCurrentReviewManager().detailedReviewRowComments = {};
    for (var propertyId in component.properties) {
        property = component.properties[propertyId];

        model.getCurrentReviewManager().detailedReviewRowComments[propertyId] = property.description;

        tableRowContent = this.addPropertyRowToDetailedTable(property, columnHeaders, propertyId);
        tableData.push(tableRowContent);
    }

    var id = "#" + this.DetailedReviewTableContainer;
    this.LoadDetailedReviewTableData(columnHeaders, tableData, id, containerDiv);

}

ComplianceCheckPropertiesTable.prototype.LoadDetailedReviewTableData = function (columnHeaders, tableData, viewerContainer, containerDiv) {
    var _this = this;

    // this.Destroy();

    $(function () {
        $(viewerContainer).dxDataGrid({
          dataSource: tableData,
          columns: columnHeaders,
          keyExpr: CompliancePropertyColumnNames.PropertyId,
          columnAutoWidth: true,
          columnResizingMode: "widget",
          wordWrapEnabled: false,
          showBorders: true,
          showRowLines: true,
          allowColumnResizing: true,
          hoverStateEnabled: true,
          filterRow: {
            visible: true,
          },
          selection: {
            mode: "multiple",
            showCheckBoxesMode: "always",
            recursive: true,
          },
          scrolling: {
            mode: "standard",
          },
          paging: {
            enabled: false,
          },
          onContentReady: function (e) {
            // initialize the context menu
            // internal call from repaint rows gives containerId with # hence check
            if (!containerDiv.includes("#")) {
              containerDiv = "#" + containerDiv;
            }

            if (!(containerDiv in model.getCurrentReviewTable().ContextMenus)) {
              var reviewComplianceContextMenuManager = new ReviewComplianceContextMenuManager(
                model.getCurrentReviewManager()
              );
              model.getCurrentReviewTable().ContextMenus[
                containerDiv
              ] = reviewComplianceContextMenuManager;
            }

            model
              .getCurrentReviewTable()
              .ContextMenus[containerDiv].InitPropertyLevelContextMenu(
                viewerContainer
              );
            _this.highlightDetailedReviewTableFromCheckStatus(
              _this.DetailedReviewTableContainer
            );
          },
          onCellPrepared: function (e) {
            if (e.rowType == "header") {
              e.cellElement.css("text-align", "center");
              e.cellElement.css("color", "black");
              e.cellElement.css("font-weight", "bold");
            }
          },
          onRowClick: function (e) {
            model.checks["compliance"][
              "selectionManager"
            ].MaintainHighlightedDetailedRow(e.rowElement[0]);

            if (
              e.data.PropertyId in
              model.getCurrentReviewManager().detailedReviewRowComments
            ) {
              let comment = model.getCurrentReviewManager()
                .detailedReviewRowComments[e.data.PropertyId];
              DevExpress.ui.notify(
                { message: comment, width: 500, left: 0 },
                "info",
                1500
              );
            }
          },
          onSelectionChanged: function (e) {
            if (e.currentSelectedRowKeys.length > 0) {
              for (var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                _this.SelectedProperties.push(e.currentSelectedRowKeys[i]);
              }
            } else {
              for (var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                var index = _this.SelectedProperties.indexOf(
                  e.currentDeselectedRowKeys[i]
                );
                if (index > -1) {
                  _this.SelectedProperties.splice(index, 1);
                }
              }
            }
          },
          onDisposing: function (e) {
            _this.CurrentComponent = null;
          },
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

ComplianceCheckPropertiesTable.prototype.UpdateGridData = function (rowKey, property) {
    var detailInfoContainer = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();
    var rowIndex = dataGrid.getRowIndexByKey(rowKey);
    var rowData = data[rowIndex];
    rowData[CompliancePropertyColumnNames.Status] = property["severity"];
    dataGrid.repaintRows(rowIndex);
}

ComplianceCheckPropertiesTable.prototype.Refresh = function () {
    $("#" + this.DetailedReviewTableContainer).dxDataGrid("instance").refresh();
}