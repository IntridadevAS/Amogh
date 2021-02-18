function GroupView1D(
    id,
    modelBrowserContainer,
    components,
    allData,
    viewerContainer) {
    // call super constructor
    GroupView.call(
        this,
        id,
        modelBrowserContainer,
        components
    );
    this.AllData = allData;
    this.ViewerContainer = viewerContainer;

    this.GALoadedMainClass = null;
    this.HighlightedGARow = null;
    this.HighlightedComponentRow = null;
    this.HighlightedComponentRowKey = null;
    // this.Components = components;

    this.ExistingColumnNames = [];
    // this.Headers = [];
    // this.TableData = [];

    // this.GroupedData = {};

    // this.GroupViewTableInstance;
    // this.GroupViewGrid = null;
    // this.GroupViewTree = null;

    // this.SelectedRows = {};
    // this.HighlightedRow = {};

    this.KeyVsTableItems = {};
    this.IdVsTableItems = {};
    this.GroupKeysVsDataItems = {};

    // this.AvoidTableEvents = false;
    // this.AvoidViewerEvents = false;

    // var _this = this;
    // this.ViewerCallbackMap = {
    //     selectionArray: function (selections) {
    //         if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.Group ||
    //             _this.AvoidViewerEvents) {
    //             return;
    //         }

    //         _this.OnSelectionFromViewer(selections);
    //     }
    // };

    // // // this.GroupProperties;
    // this.GroupTemplate = null;

    this.UndefinedHidden = false;

    // this.ActiveGroupViewType = "Group";
    this.RowWiseColors = {};
    this.GARowWiseColors = {};
    this.HighlightActive = false;

    this.GADataTable = null;
    // // this is for datachange view tree list only
    // this.RootNodeId = null;
    // this.IdVsParentNodeIds = {};

    // this.DataChangeGroupViewActive = false;
    // this.DatabaseViewActive = false;
    // this.RevisionCheckResults = null;
    // this.CurrentDataChangeTemplate = null;
    // this.DataChangeHighlightColors = {
    //     "property change": "#f9ffc7",
    //     "new item": "#c9ffcf",
    //     "deleted item": "#fad9d7",
    //     "ga new item" : "#74B741",
    //     // "ga deleted item " : "#FF0000", // for now, we don't see any deleted item in ga so can't color
    //     "ga property change" : "#fff729"
    // }
    // this.DisplayTablesForm = null;
    // this.ExcludeMembers = false;
    // this.Flat = false;
}
// assign GroupView's method to this class
GroupView1D.prototype = Object.create(GroupView.prototype);
GroupView1D.prototype.constructor = GroupView1D;

/*--------------------------------------------------------------------*/
// GET FUNCTIONS
/*--------------------------------------------------------------------*/
GroupView1D.prototype.IsPropertyInGroupProperties = function (property) {
    var groupProperties = this.GetGroupTemplateProperties();
    if (groupProperties === null) {
        return false;
    }

    if (this.IsHighlightByPropertyView()) {
        for (var i = 0; i < groupProperties.length; i++) {
            var groupProperty = groupProperties[i];
            if (groupProperty.Name == property) {
                return true;
            }
        }
    }
    else if (this.IsPropertyGroupView()) {
        if (groupProperties.indexOf(property) !== -1) {
            return true;
        }
    }
    else if (this.IsDataChangeHighlightView()) {
    }

    return false;
}

GroupView1D.prototype.GetSelectedIds = function () {
    var selectedIds = [];

    let rowsData = null;
    if (this.GroupViewTree) {
        rowsData = this.GroupViewTree.getSelectedRowsData();
    }
    else if (this.GroupViewGrid) {
        rowsData = this.GroupViewGrid.getSelectedRowsData();
    }

    if (rowsData) {
        for (let i = 0; i < rowsData.length; i++) {
            selectedIds.push(Number(rowsData[i].Id));
        }
    }

    return selectedIds;
}

GroupView1D.prototype.GetSelectedComponents = function () {
    var selectedIds = this.GetSelectedIds();

    var selected = {};
    for (var i = 0; i < selectedIds.length; i++) {
        var id = selectedIds[i];
        selected[id] = this.Components[id];
    }

    return selected;
}

GroupView1D.prototype.GetSelectedComponentIds = function () {
    return this.GetSelectedIds();
}

// GroupView1D.prototype.GetGroupTemplateProperties = function () {
//     if (this.GroupTemplate &&
//         ("properties" in this.GroupTemplate)) {
//         return this.GroupTemplate.properties;
//     }

//     return null;
// }

/*--------------------------------------------------------------------*/
// SET FUNCTIONS
/*--------------------------------------------------------------------*/


/*--------------------------------------------------------------------*/
// OPERATIONS
/*--------------------------------------------------------------------*/
GroupView1D.prototype.SaveTableView = function () {
    // if (!this.GroupViewGrid ||
    //     !this.GroupTemplate) {
    //     return;
    // }

    // this.GroupTemplate['visibleColumns'] = [];
    // var columns = this.GroupViewGrid.getVisibleColumns();
    // for (var i = 0; i < columns.length; i++) {
    //     var column = columns[i];
    //     if (column.type === "selection" ||
    //         column.type === "groupExpand" ||
    //         (("dataField" in column) && column.dataField.toLowerCase() === "componentname")) {
    //         continue;
    //     }

    //     this.GroupTemplate['visibleColumns'].push(column.dataField);
    // }
}

GroupView1D.prototype.OnGroupTemplateChanged = function (groupName) {
    this.Clear();
    if (!groupName ||
        groupName.toLowerCase() === "clear") {
        return;
    }

    if (this.IsHighlightByPropertyView()) {
        if (!(groupName in model.propertyHighlightTemplates)) {
            return;
        }
        // this.GroupProperties = model.propertyHighlightTemplates[groupName].properties;
        this.GroupTemplate = model.propertyHighlightTemplates[groupName];
    }
    else if (this.IsPropertyGroupView()) {
        if (!(groupName in model.propertyGroups)) {
            return;
        }
        // this.GroupProperties = model.propertyGroups[groupName].properties;
        this.GroupTemplate = model.propertyGroups[groupName];
    }
    else if (this.IsDataChangeHighlightView()) {
        if (!(groupName in model.dataChangeHighlightTemplates)) {
            return;
        }

        // init display tables form
        this.DisplayTablesForm = new DisplayTablesForm(this.Id);

        this.LoadDataChangeView(model.dataChangeHighlightTemplates[groupName]);
        return;
    }

    this.ExistingColumnNames = [];
    this.Headers = [];
    var column = {};
    column["caption"] = "Item";
    column["dataField"] = "componentName";
    column["visible"] = true;
    column["showInColumnChooser"] = false;
    this.Headers.push(column);

    column = {};
    column["caption"] = "Id";
    column["dataField"] = "Id";
    column["visible"] = false;
    column["showInColumnChooser"] = false;
    this.Headers.push(column);

    // get table data
    this.TableData = [];
    this.GenerateTableDataForGroupByProperty();
    if (this.TableData === undefined ||
        this.TableData.length === 0) {
        return;
    }

    // Load table
    this.LoadTable();
}

GroupView1D.prototype.GenerateTableDataForGroupByProperty = function () {

    for (let id in this.Components) {
        var component = this.Components[id];

        var rowData = {};
        rowData["componentName"] = component.Name;
        rowData["Id"] = Number(component.ID);
        rowData["_mainClass"] = component.MainComponentClass;
        rowData["_subClass"] = component.SubComponentClass;

        for (var i = 0; i < component.properties.length; i++) {
            var property = component.properties[i];

            var columnDataField = property.Name.replace(/\s/g, '');
            rowData[columnDataField] = property.Value;

            if (this.ExistingColumnNames.indexOf(property.Name) === -1 &&
                !this.IsPropertyInGroupProperties(property.Name)) {
                var column = {};
                column["caption"] = property.Name;
                column["dataField"] = columnDataField;

                column["visible"] = false;
                if (("visibleColumns" in this.GroupTemplate) &&
                    this.GroupTemplate.visibleColumns.indexOf(columnDataField) !== -1) {
                    column["visible"] = true;
                }

                this.Headers.push(column);
                this.ExistingColumnNames.push(property.Name)
            }
        }

        this.TableData.push(rowData);
    }
}

GroupView1D.prototype.LoadTable = function () {
    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;

    var groupProperties = this.GetGroupTemplateProperties();
    if (!groupProperties ||
        groupProperties.length === 0) {
        return;
    }

    var filter = [];
    if (this.IsHighlightByPropertyView()) {

        filter = this.GetFilter();

        var currentGroupIndex = 0;
        for (var i = 0; i < groupProperties.length; i++) {
            var groupProperty = groupProperties[i];
            if (this.ExistingColumnNames.indexOf(groupProperty.Name) === -1) {
                column = {};
                column["caption"] = groupProperty.Name;

                var dataField = groupProperty.Name.replace(/\s/g, '');
                column["dataField"] = dataField;

                column["visible"] = false;
                if (("visibleColumns" in this.GroupTemplate) &&
                    this.GroupTemplate.visibleColumns.indexOf(dataField) !== -1) {
                    column["visible"] = true;
                }

                column["groupIndex"] = currentGroupIndex;
                this.Headers.push(column);

                if (!groupProperty.Operator ||
                    groupProperty.Operator.toLowerCase() === "and") {
                    currentGroupIndex = 1;
                }
                else {
                    currentGroupIndex++;
                }

                this.ExistingColumnNames.push(groupProperty.Name);
            }
        }
    }
    else if (this.IsPropertyGroupView()) {

        for (var i = 0; i < groupProperties.length; i++) {
            var groupProperty = groupProperties[i];

            if (this.ExistingColumnNames.indexOf(groupProperty) === -1) {

                column = {};
                column["caption"] = groupProperty;

                var dataField = groupProperty.replace(/\s/g, '');
                column["dataField"] = dataField;

                column["visible"] = false;
                if (("visibleColumns" in this.GroupTemplate) &&
                    this.GroupTemplate.visibleColumns.indexOf(dataField) !== -1) {
                    column["visible"] = true;
                }

                column["groupIndex"] = i;
                this.Headers.push(column);

                this.ExistingColumnNames.push(groupProperty);
            }
        }
    }

    // set value NULL to properties which donot belong to component
    for (var i = 0; i < this.TableData.length; i++) {
        var rowData = this.TableData[i];

        for (var j = 0; j < this.ExistingColumnNames.length; j++) {
            var columnField = this.ExistingColumnNames[j].replace(/\s/g, '');
            if (!(columnField in rowData)) {
                rowData[columnField] = "NULL";
            }
        }
    }

    var loadingBrowser = true;
    this.GroupViewGrid = $(containerDiv).dxDataGrid({
        columns: this.Headers,
        dataSource: this.TableData,
        keyExpr: "Id",
        height: "100%",
        width: "100%",
        columnAutoWidth: true,
        allowColumnResizing: true,
        columnResizingMode: 'widget',
        showBorders: true,
        showRowLines: true,
        paging: { enabled: false },
        grouping: {
            autoExpandAll: true,
        },
        groupPanel: {
            visible: false,
            allowColumnDragging: false
        },
        selection: {
            mode: "multiple",
            showCheckBoxesMode: "always",
        },
        scrolling: {
            mode: "standard",
            rowRenderingMode: 'standard'
        },
        filterRow: {
            visible: true
        },
        columnChooser: {
            enabled: false,
            allowSearch: true,
            mode: "select",
            title: "Property Columns",
        },
        summary: {
            groupItems: [{
                column: "componentName",
                summaryType: "count",
                displayFormat: "Count: {0}",
                alignByColumn: true
            }],
            totalItems: []
        },
        headerFilter: {
            visible: true
        },
        filterValue: filter,
        onContentReady: function (e) {
            if (!loadingBrowser) {
                return;
            }
            loadingBrowser = false;

            _this.CacheItems(e.component.getVisibleRows());

            _this.ShowItemCount(e.component.getDataSource().totalCount());

            e.component.option("grouping.autoExpandAll", false);
        },
        onInitialized: function (e) {
            model.views[_this.Id].tableViewInstance = e.component;
            model.views[_this.Id].tableViewWidget = "datagrid";
        },
        onSelectionChanged: function (e) {
            if (_this.AvoidTableEvents) {
                return;
            }

            // disable events
            _this.AvoidViewerEvents = true;

            if (e.currentSelectedRowKeys.length > 0) {
                for (var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                    var rowKey = e.currentSelectedRowKeys[i];
                    var rowIndex = e.component.getRowIndexByKey(rowKey);
                    if (rowIndex === -1) {
                        e.component.byKey(rowKey).done(function (dataObject) {
                            var Id = dataObject.Id;
                            _this.SelectedRows[rowKey] = Id;
                        });
                    }
                    else {
                        var visibleRows = e.component.getVisibleRows();
                        var Id = visibleRows[rowIndex].data.Id;

                        _this.SelectedRows[rowKey] = Id;
                    }
                }
            }
            else if (e.currentDeselectedRowKeys.length > 0) {
                for (var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                    // var rowKey = Number(e.currentDeselectedRowKeys[i]);
                    var rowKey = e.currentDeselectedRowKeys[i];

                    if (rowKey in _this.SelectedRows) {
                        delete _this.SelectedRows[rowKey];
                    }
                }
                // //now manage selection in viewer
                // _this.Webviewer.selectionManager.clear();
                // for (var rowKey in _this.SelectedRows) {
                //     _this.Webviewer.selectionManager.selectNode(Number(_this.SelectedRows[rowKey]),
                //         Communicator.SelectionMode.Add);
                // }
                // }
            }

            if (model.views[_this.Id].editUserPropertiesForm.Active) {
                model.views[_this.Id].editUserPropertiesForm.LoadData();
            }

            // enable events
            _this.AvoidViewerEvents = false;
        },
        onRowClick: function (e) {
            if (e.rowType !== "data") {
                return;
            }

            _this.HighlightInGroupViewTable(e.rowElement[0], e.key);
            _this.HighlightInGA(e.data);

            // open property callout
            SourceManagers[_this.Id].OpenPropertyCalloutByCompId(e.data.Id);

            // if (Object.keys(_this.HighlightedRow).length > 0) {
            //     var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
            //     if (oldRowKey === e.key) {
            //         return;
            //     }

            //     _this.UnHighlightRow();
            // }

            // _this.HighlightRow(e.key, e.data.NodeId);
        },
        onDisposing: function (e) {
            // save table view
            _this.SaveTableView();

            model.views[_this.Id].tableViewInstance = null;
            model.views[_this.Id].tableViewWidget = null;

            _this.GroupViewGrid = null;

            _this.SelectedRows = {};
            // _this.HighlightedRow = {};

            _this.KeyVsTableItems = {};
            _this.IdVsTableItems = {};
            _this.GroupKeysVsDataItems = {};

            _this.UndefinedHidden = false;
            _this.RowWiseColors = {};

            if (_this.HighlightActive) {
                // _this.ResetViewerColors();
                // change icon of btn
                document.getElementById("highlightSelectionBtn" + _this.Id).style.backgroundImage = "url(../../public/symbols/Highlight%20Selection-Off.svg)";
            }
            _this.HighlightActive = false;

            _this.ExistingColumnNames = [];
            _this.HighlightedComponentRow = null;
            _this.HighlightedComponentRowKey = null;

            // discard the viewer table
            if (_this.GADataTable) {
                _this.DisposeGAGrid(_this.ViewerContainer);
            }
        },
        onRowPrepared: function (e) {
            if (e.rowType == "group") {
                var rowElement = e.rowElement[0];

                for (var i = 0; i < e.rowElement[0].children.length; i++) {
                    var childElement = e.rowElement[0].children[i];
                    if (childElement.classList.contains("dx-group-cell")) {
                        var resultArray = childElement.innerText.split(":");
                        if (resultArray.length >= 2) {

                            var resArray = resultArray[1].split("(");

                            var displayText = null;
                            if (resArray[0].trim() === "") {
                                var displayText = resultArray[0] + ": UNASSIGNED";
                            }
                            else if (resArray[0].trim() === "NULL") {
                                var displayText = resultArray[0] + ": UNDEFINED";
                            }
                            if (displayText !== null) {
                                if (resultArray.length >= 3) {
                                    displayText += "(Count:" + resultArray[2];
                                }
                                childElement.innerText = displayText;
                            }
                        }
                    }
                }
            }
            else if (e.rowType === "data") {
                // set row colors
                if (e.key in _this.RowWiseColors) {
                    e.rowElement[0].cells[0].style.backgroundColor = _this.RowWiseColors[e.key];
                }
            }
        },
        onContextMenuPreparing: function (e) {
            if (e.row.rowType === "data") {
                e.items = [
                    {
                        text: "Properties",
                        onItemClick: function () {
                            let rowsData = e.component.getSelectedRowsData();
                            if (rowsData.length === 0) {
                                return;
                            }

                            SourceManagers[_this.Id].PropertyCallout.Open();
                            SourceManagers[_this.Id].OpenPropertyCalloutByCompId(rowsData[0].Id);
                            // _this.ContextMenu.OnMenuItemClicked("properties", rowsData[0]);
                        }
                    },
                    {
                        text: "Reference",                       
                        onItemClick: function () {
                            _this.OnReferenceClicked();
                        }
                    },
                ]
            }
            else if (e.row.rowType === "group") {
                e.items = [{
                    text: "Select All",
                    onItemClick: function () {
                        if (_this.IsHighlightByPropertyView()) {
                            _this.OnPropertyHighlightGroupSelectClicked(e.row.key, true);
                        }
                        else if (_this.IsPropertyGroupView()) {
                            _this.OnGroupSelectClicked(e.row.key, true);
                        }
                        else if (_this.IsDataChangeHighlightView()) {
                        }
                    }
                },
                {
                    text: "DeSelect All",
                    onItemClick: function () {
                        if (_this.IsHighlightByPropertyView()) {
                            _this.OnPropertyHighlightGroupSelectClicked(e.row.key, false);
                        }
                        else if (_this.IsPropertyGroupView()) {
                            _this.OnGroupSelectClicked(e.row.key, false);
                        }
                        else if (_this.IsDataChangeHighlightView()) {
                        }
                    }
                },                
                ]
            }
            else if (e.row.rowType === "header") {
                e.items = [
                    {
                        text: "Edit Columns",
                        onItemClick: function () {
                            e.component.showColumnChooser();
                        }
                    },
                    {
                        text: _this.UndefinedHidden ? "Show Undefined" : "Hide Undefined",
                        disabled: (_this.IsHighlightByPropertyView() || _this.IsDataChangeHighlightView()),
                        onItemClick: function () {

                            if (!_this.UndefinedHidden) {
                                var filterValue = [];
                                for (var i = 0; i < _this.GroupTemplate.properties.length; i++) {
                                    filterValue.push(["!", [_this.GroupTemplate.properties[i], "=", "NULL"]]);
                                    if (i < (_this.GroupTemplate.properties.length - 1)) {
                                        filterValue.push("and");
                                    }
                                }
                                if (filterValue.length > 0) {
                                    e.component.filter(filterValue);
                                }
                            }
                            else {
                                e.component.clearFilter();
                            }

                            _this.UndefinedHidden = !_this.UndefinedHidden;
                        }
                    },
                    {
                        text: "Summary",
                        items: [
                            {
                                text: "Sum",
                                onItemClick: function () {

                                    _this.AddGroupSummary(e, "sum", "Total: {0}");
                                    _this.AddGlobalSummary(e, "sum", "Total: {0}");
                                }
                            },
                            {
                                text: "Count",
                                onItemClick: function () {
                                    _this.AddGroupSummary(e, "count", "Count: {0}");
                                    _this.AddGlobalSummary(e, "count", "Count: {0}");
                                }
                            },
                            {
                                text: "Max",
                                disabled: true,
                                onItemClick: function () {
                                    _this.AddGroupSummary(e, "max", "Max: {0}");
                                    _this.AddGlobalSummary(e, "max", "Max: {0}");
                                }
                            },
                            {
                                text: "Min",
                                onItemClick: function () {
                                    _this.AddGroupSummary(e, "min", "Min: {0}");
                                    _this.AddGlobalSummary(e, "min", "Min: {0}");
                                }
                            },
                            {
                                text: "Avg",
                                onItemClick: function () {
                                    _this.AddGroupSummary(e, "avg", "Avg: {0}");
                                    _this.AddGlobalSummary(e, "avg", "Avg: {0}");
                                }
                            }
                        ],
                        onItemClick: function () {

                        }
                    }]
            }
        }
    }).dxDataGrid("instance");
}

GroupView1D.prototype.CacheItems = function (rows) {
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];

        if (row.rowType === "group") {
            this.KeyVsTableItems[row.key] = {
                "rowType": "group",
                "groupIndex": row.groupIndex,
                "values": row.values
            };
        }
        else if (row.rowType === "data") {
            this.IdVsTableItems[row.data.Id] = row.key;
            this.KeyVsTableItems[row.key] = {
                "item": row.data.componentName,
                "id": row.data.Id
            };

            var groupProperties = this.GetGroupTemplateProperties();
            if (groupProperties === null) {
                continue;
            }
            if (this.IsHighlightByPropertyView()) {

                var traversedGroupProperties = [];
                var groupKey = [];
                for (var j = 0; j < groupProperties.length; j++) {
                    var groupProperty = groupProperties[j];

                    var groupPropertyField = groupProperty.Name.replace(/\s/g, '');
                    if (traversedGroupProperties.indexOf(groupPropertyField) === -1) {
                        traversedGroupProperties.push(groupPropertyField);

                        if (groupPropertyField in row.data) {
                            groupKey.push(row.data[groupPropertyField]);
                        }
                        else {
                            groupKey.push("");
                        }

                        this.KeyVsTableItems[row.key][groupPropertyField] = groupKey[groupKey.length - 1];
                    }
                }

                if (!(groupKey in this.GroupKeysVsDataItems)) {
                    this.GroupKeysVsDataItems[groupKey] = [];
                }
                this.GroupKeysVsDataItems[groupKey].push(row.key);
            }
            else if (this.IsPropertyGroupView()) {
                var groupKey = [];
                for (var j = 0; j < groupProperties.length; j++) {
                    var groupPropertyField = groupProperties[j].replace(/\s/g, '');
                    this.KeyVsTableItems[row.key][groupPropertyField] = row.data[groupProperties[j]];
                    groupKey.push(row.data[groupPropertyField]);
                }

                if (!(groupKey in this.GroupKeysVsDataItems)) {
                    this.GroupKeysVsDataItems[groupKey] = [];
                }
                this.GroupKeysVsDataItems[groupKey].push(row.key);
            }
        }
    }
}

GroupView1D.prototype.HighlightInGroupViewTable = function (row, rowKey) {
    if (row === null) {
        let rowIndex = this.GroupViewGrid.getRowIndexByKey(rowKey);
        if (rowIndex !== -1) {
            row = this.GroupViewGrid.getRowElement(rowIndex)[0];
        }
    }

    if (row === null ||
        this.HighlightedComponentRow === row) {
        return;
    }

    var selectedRows = this.GroupViewGrid.getSelectedRowKeys("all");

    if (this.HighlightedComponentRow &&
        !selectedRows.includes(this.HighlightedComponentRowKey)) {
        if (this.HighlightedComponentRow.rowElement)
            this.RemoveHighlightColor(this.HighlightedComponentRow.rowElement[0]);
        else {
            this.RemoveHighlightColor(this.HighlightedComponentRow);
        }
    }

    // highlight new row  
    if (!selectedRows.includes(rowKey)) {
        if (row.rowElement)
            this.ApplyHighlightColor(row.rowElement[0]);
        else {
            this.ApplyHighlightColor(row);
        }
    }

    this.HighlightedComponentRow = row;
    this.HighlightedComponentRowKey = rowKey;
}

GroupView1D.prototype.HighlightInGA = function (rowData) {
    if (!("componentName" in rowData) ||
        !("_mainClass" in rowData) ||
        !("_subClass" in rowData)) {
        return;
    }
    var _this = this;

    var mainClassName = rowData["_mainClass"].trim();

    if (this.GALoadedMainClass !== mainClassName) {
        var mainComponentClassData = this.AllData[mainClassName];
        var components = [];

        if (mainComponentClassData !== {}) {
            for (var subComponentClass in mainComponentClassData) {
                for (var i = 0; i < mainComponentClassData[subComponentClass].length; i++) {
                    components.push(mainComponentClassData[subComponentClass][i]);
                }
            }
            if (!components ||
                components.length === 0) {
                return;
            }

            var columnHeaders = [];
            let traversedProperties = [];
            
            var tableData = [];
            for (var i = 0; i < components.length; i++) {

                var component = components[i];

                var tableRowContent = {};
                tableRowContent["_componentName"] = component.Name;
                tableRowContent["_Id"] = Number(component.ID);
                tableRowContent["_mainClass"] = component.MainComponentClass;
                tableRowContent["_subClass"] = component.SubComponentClass;

                var properties = component.properties;

                for (var j = 0; j < properties.length; j++) {
                    let index = traversedProperties.indexOf(properties[j].Name.replace(/\s/g, ''));
                    if (index === -1) {
                        let columnHeader = {};
                        columnHeader["caption"] = properties[j].Name;
                        columnHeader["dataField"] = properties[j].Name.replace(/\s/g, '');
                        columnHeader["dataType"] = "string";
                        columnHeader["width"] = "100px";
                        columnHeaders.push(columnHeader);

                        index = traversedProperties.push(properties[j].Name.replace(/\s/g, '')) - 1;
                    }

                    tableRowContent[columnHeaders[index].dataField] = properties[j].Value;
                }
                tableData.push(tableRowContent);
            }

            this.LoadGATable(columnHeaders, tableData).then(function () {
                _this.HighlightRowInGA(rowData["Id"]);
            });
            this.GALoadedMainClass = mainClassName;
        }
    }
    else {
        this.HighlightRowInGA(rowData["Id"]);
    }
}

GroupView1D.prototype.LoadGATable = function (
    columnHeaders,
    tableData) {

    var _this = this;
    var containerDiv = "#" + this.ViewerContainer;

    return new Promise(function (resolve) {
        $(function () {

            let loading = true;
            _this.GADataTable = $(containerDiv).dxDataGrid({
                dataSource: tableData,
                columns: columnHeaders,
                showBorders: true,
                showRowLines: true,
                allowColumnResizing: true,
                hoverStateEnabled: true,
                height: "100%",
                width: "100%",
                filterRow: {
                    visible: true
                },
                scrolling: {
                    mode: "standard"
                },
                paging: { enabled: false },
                onContentReady: function (e) {
                    if (loading !== true) {
                        return;
                    }
                    loading = false;

                    if (_this.HighlightActive) {
                        var data = e.component.getDataSource().items();
                        for (var i = 0; i < data.length; i++) {
                            var dataRow = data[i];
                            if (dataRow["_Id"] in _this.RowWiseColors) {

                                let color = _this.RowWiseColors[dataRow["_Id"]]
                                var row = e.component.getRowElement(i);
                                row[0].style.backgroundColor = color;

                                _this.GARowWiseColors[dataRow["_Id"]] = color;
                            }
                        }
                    }

                    return resolve(true);
                },
                onRowClick: function (e) {
                    _this.HandleRowSelectInViewer(
                        e.data
                    );

                    // open property callout
                    SourceManagers[_this.Id].OpenPropertyCalloutByCompId(e.data._Id);
                },
                onRowPrepared: function (e) {
                    if (e.rowType === "data" &&
                        _this.HighlightedGARow !== e.rowElement[0]) {
                        // set row colors
                        if (e.data["_Id"] in _this.GARowWiseColors) {
                            e.rowElement[0].style.backgroundColor = _this.GARowWiseColors[e.data["_Id"]];                           
                        }
                    }
                },
                onDisposing: function (e) {
                    _this.GADataTable = null;
                    _this.HighlightedGARow = null;
                    _this.GALoadedMainClass = null;
                    
                    _this.GARowWiseColors = {};
                }
            }).dxDataGrid("instance");
        });
    });
}

/* 
  This function 
*/
GroupView1D.prototype.HandleRowSelectInViewer = function (
    rowData
) {

    // highlight group view table row
    this.HighlightRowInGA(rowData["_Id"])

    // highlight GA row    
    this.GoToRow(rowData["_Id"]);    
}

GroupView1D.prototype.HighlightRowInGA = function (compId) {
    if (!this.GADataTable) {
        return;
    }

    // get GA data rows
    var data = this.GADataTable.getDataSource().items();
    if (data.length === 0) {
        return;
    }

    // let name = rowData["componentName"];
    // let subClass = rowData["_subClass"];
    // let id = rowData["Id"];
    for (var i = 0; i < data.length; i++) {
        var dataRow = data[i];
        if (compId === dataRow["_Id"]) {
            var row = this.GADataTable.getRowElement(i);

            if (this.HighlightGARow(row[0])) {
                this.GADataTable.getScrollable().scrollToElement(row[0])
            }

            break;
        }
    }
}

GroupView1D.prototype.HighlightGARow = function (row) {
    if (this.HighlightedGARow === row) {
        return false;
    }

    if (this.HighlightedGARow) {
        if (this.HighlightActive) {
            let items = this.GADataTable.getDataSource().items();
            let item = items[this.HighlightedGARow.rowIndex];
            if (item["_Id"] in this.GARowWiseColors) {
                this.HighlightedGARow.style.backgroundColor = this.GARowWiseColors[item["_Id"]];
            }
        }
        else {
            this.RemoveHighlightColor(this.HighlightedGARow);
        }
        // for (var j = 0; j < this.HighlightedGARow.cells.length; j++) {
        //     cell = this.HighlightedGARow.cells[j];
        //     cell.style.backgroundColor = "#ffffff"
        // }
    }

    this.ApplyHighlightColor(row);
    //row.style.backgroundColor = "#B2BABB";
    // for (var j = 0; j < row.cells.length; j++) {
    //     cell = row.cells[j];
    //     cell.style.backgroundColor = "#B2BABB";
    // }

    this.HighlightedGARow = row;

    return true;
}

GroupView1D.prototype.ApplyPropertyHighlightColor = function () {
    if ((this.GroupViewGrid === null ||
        !this.IsHighlightByPropertyView()) &&
        (!this.IsDataChangeHighlightView() ||
            !this.DataChangeGroupViewActive)
    ) {
        return;
    }

    if (this.HighlightActive) {
        this.HighlightActive = false;

        this.ResetGARowColors();

        if (this.IsHighlightByPropertyView()) {
            this.UnHighlight();
        }

        // change icon of btn
        document.getElementById("highlightSelectionBtn" + this.Id).style.backgroundImage = "url(../../public/symbols/Highlight%20Selection-Off.svg)";
    }
    else {
        this.HighlightActive = true;

        // // set one color to entire model
        // var rootNode = this.Webviewer.model.getAbsoluteRootNode();
        // var communicatorColor = new Communicator.Color(255, 255, 255);
        // this.Webviewer.model.setNodesFaceColor([rootNode], communicatorColor);
        // this.Webviewer.model.setNodesLineColor([rootNode], communicatorColor);

        if (this.IsHighlightByPropertyView()) {
            this.Highlight();
        }
        else if (this.IsDataChangeHighlightView()) {
            // this.HighlightGAByDataChangeColors();
        }

        // change icon of btn
        document.getElementById("highlightSelectionBtn" + this.Id).style.backgroundImage = "url(../../public/symbols/Highlight%20Selection-On.svg)";
    }
}

GroupView1D.prototype.Highlight = function () {
    this.GroupViewGrid.expandAll();

    let keys = {};
    // highlight in group view table
    for (var groupKey in this.GroupKeysVsDataItems) {
        var color = this.GetGroupColor(groupKey);
        if (!color) {
            continue;
        }

        for (var i = 0; i < this.GroupKeysVsDataItems[groupKey].length; i++) {
            var rowKey = this.GroupKeysVsDataItems[groupKey][i];
            var rowIndex = this.GroupViewGrid.getRowIndexByKey(rowKey);
            var rowElement = this.GroupViewGrid.getRowElement(rowIndex)[0];

            rowElement.cells[0].style.backgroundColor = color;

            this.RowWiseColors[rowKey] = color;

            keys[rowKey] = color;
        }
    }

    // apply highlight colors in GA tables         
    if (this.GADataTable) {
        let gaData = this.GADataTable.getDataSource().items();
        if (!gaData ||
            gaData.length === 0) {
            return;
        }
        for (let j = 0; j < gaData.length; j++) {
            let data = gaData[j];

            if (!(data["_Id"] in keys)) {
                continue;
            }

            let color = keys[data["_Id"]];

            var rowElement = this.GADataTable.getRowElement(j);

            if (rowElement) {
                rowElement[0].style.backgroundColor = color;
                
                this.GARowWiseColors[data["_Id"]] = color;
            }
        }
    }
}

GroupView1D.prototype.UnHighlight = function () {
    this.GroupViewGrid.expandAll();

    for (var rowKey in this.RowWiseColors) {
        var rowIndex = this.GroupViewGrid.getRowIndexByKey(rowKey);
        var rowElement = this.GroupViewGrid.getRowElement(rowIndex)[0];

        if (rowKey in this.SelectedRows) {
            rowElement.cells[0].style.backgroundColor = GlobalConstants.TableRowSelectedColor;
        }
        else {
            rowElement.cells[0].style.backgroundColor = GlobalConstants.TableRowNormalColor;
        }
    }
    this.RowWiseColors = {};
}

GroupView1D.prototype.ResetGARowColors = function () {
    if (!this.GADataTable ||
        Object.keys(this.GARowWiseColors).length === 0) {
        return;
    }

    let gaData = this.GADataTable.getDataSource().items();
    if (!gaData ||
        gaData.length === 0) {
        return;
    }

    for (let j = 0; j < gaData.length; j++) {
        let data = gaData[j];

        if (!(data["_Id"] in this.GARowWiseColors)) {
            continue;
        }

        var rowElement = this.GADataTable.getRowElement(j);

        if (rowElement) {
            rowElement[0].style.backgroundColor = GlobalConstants.TableRowNormalColor;;
        }
    }

    this.GARowWiseColors = {};
}

GroupView1D.prototype.GoToRow = function (rowKey) {
    var _this = this;

    var rowData = _this.KeyVsTableItems[rowKey];

    // expand group
    if (this.IsHighlightByPropertyView()) {
        for (var key in this.GroupKeysVsDataItems) {
            if (this.GroupKeysVsDataItems[key].indexOf(rowKey) !== -1) {
                this.OpenGroup(key.split(",")).then(function (result) {

                    // highlight row    
                    _this.HighlightInGroupViewTable(null, rowKey);               
                    // if (Object.keys(_this.HighlightedRow).length > 0) {
                    //     var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                    //     if (oldRowKey === rowKey) {
                    //         return;
                    //     }

                    //     _this.UnHighlightRow();
                    // }

                    // _this.HighlightRow(rowKey, nodeId);
                    _this.GroupViewGrid.navigateToRow(rowKey);
                });
            }
        }
    }
    else if (this.IsPropertyGroupView()) {
        var groupProperties = _this.GetGroupTemplateProperties();
        if (groupProperties === null) {
            return;
        }

        var groupKeys = [];
        for (var i = 0; i < groupProperties.length; i++) {
            var prop = groupProperties[i]
            if (prop in rowData) {
                var propValue = rowData[prop];
                if (!propValue) {
                    propValue = "";
                }

                if (i === 0 && (propValue in _this.KeyVsTableItems)) {
                    groupKeys.push(_this.KeyVsTableItems[propValue].values);
                }
                else {
                    groupKeys.push(_this.KeyVsTableItems[groupKeys[i - 1] + "," + propValue].values);
                }
            }
        }

        for (var i = 0; i < groupKeys.length; i++) {
            var key = groupKeys[i];

            if (!_this.GroupViewGrid.isRowExpanded(key)) {
                _this.GroupViewGrid.expandRow(key).then(function (res) {
                    // highlight row     
                    _this.HighlightInGroupViewTable(null, rowKey);                     
                    // if (Object.keys(_this.HighlightedRow).length > 0) {
                    //     var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                    //     if (oldRowKey === rowKey) {
                    //         return;
                    //     }

                    //     _this.UnHighlightRow();
                    // }

                    // _this.HighlightRow(rowKey, nodeId);
                    _this.GroupViewGrid.navigateToRow(rowKey);
                });
            }
            else {
                if (i === groupKeys.length - 1) {
                    // highlight row                   
                    _this.HighlightInGroupViewTable(null, rowKey);
                    // if (Object.keys(_this.HighlightedRow).length > 0) {
                    //     var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                    //     if (oldRowKey === rowKey) {
                    //         return;
                    //     }

                    //     _this.UnHighlightRow();
                    // }

                    // _this.HighlightRow(rowKey, nodeId);
                    _this.GroupViewGrid.navigateToRow(rowKey);
                }
            }
        }
    }
    else if (this.IsDataChangeHighlightView()) {

        // if (id in _this.IdVsParentNodeIds) {
        //     let path = [id];
        //     let parent = _this.IdVsParentNodeIds[id];
        //     while (parent !== null) {
        //         path.push(parent);

        //         if (parent in _this.IdVsParentNodeIds) {
        //             parent = _this.IdVsParentNodeIds[parent];
        //         }
        //         else {
        //             parent = null;
        //         }
        //     }
        //     path = path.reverse();

        //     for (var i = 0; i < path.length; i++) {
        //         let key = path[i];

        //         if (!_this.GroupViewTree.isRowExpanded(key)) {
        //             _this.GroupViewTree.expandRow(key).then(function (res) {
        //                 // highlight row                   
        //                 if (Object.keys(_this.HighlightedRow).length > 0) {
        //                     var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
        //                     if (oldRowKey === rowKey) {
        //                         return;
        //                     }

        //                     _this.UnHighlightRow();
        //                 }

        //                 _this.HighlightRow(rowKey, nodeId);
        //                 _this.GroupViewTree.navigateToRow(rowKey);
        //             });
        //         }
        //         else {
        //             if (i === path.length - 1) {
        //                 // highlight row                   
        //                 if (Object.keys(_this.HighlightedRow).length > 0) {
        //                     var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
        //                     if (oldRowKey === rowKey) {
        //                         return;
        //                     }

        //                     _this.UnHighlightRow();
        //                 }

        //                 _this.HighlightRow(rowKey, nodeId);
        //                 _this.GroupViewTree.navigateToRow(rowKey);
        //             }
        //         }
        //     }
        // }
    }
}

GroupView1D.prototype.OpenGroup = function (rowKey) {
    var _this = this;

    return new Promise((resolve) => {
        // var allPromises = []
        for (var key in this.GroupKeysVsDataItems) {
            var keyArray = key.split(",");
            if (keyArray.length < rowKey.length) {
                continue;
            }

            var expand = true;
            for (var i = 0; i < rowKey.length; i++) {
                if (keyArray[i] !== rowKey[i]) {
                    expand = false;
                    break;
                }
            }

            if (expand) {
                for (var i = 0; i < keyArray.length; i++) {
                    // if (!this.GroupViewGrid.isRowExpanded(keyArray.slice(0, i + 1))) {
                    this.GroupViewGrid.expandRow(keyArray.slice(0, i + 1)).then(function (result) {
                        return resolve(result);
                    });
                    // }
                }
            }
        }
    });
}

GroupView1D.prototype.LoadDataChangeView = function (template) {
    // if (!("source" in template) ||
    //     !("target" in template)) {
    //     return;
    // }
    let _this = this;
    // this.CurrentDataChangeTemplate = template;

    // // check if types are correct
    // let currentSourceType = SourceManagers[model.currentTabId].SourceType.toLowerCase();
    // if (template["source"]["id"].toLowerCase() !== "current" &&
    //     template["source"]["dataSourceType"].toLowerCase() !== currentSourceType) {
    //     alert("Selected template is not compatible with active dataset.")
    //     return;
    // }

    // if (template["target"]["id"].toLowerCase() !== "current" &&
    //     template["target"]["dataSourceType"].toLowerCase() !== currentSourceType) {
    //     alert("Selected template is not compatible with active dataset.")
    //     return;
    // }
    // let components = {
    //     "source": null,
    //     "target": null
    // };

    // // Source revision
    // let srcRevInfo = {};
    // if (template["source"]["id"].toLowerCase() === "current") {
    //     srcRevInfo["revisionName"] = "Current";
    //     components["source"] = SourceManagers[model.currentTabId].GetAllComponents();
    // }
    // else {
    //     srcRevInfo["revisionName"] = template["source"]["name"];
    //     srcRevInfo["dataSourceType"] = template["source"]["dataSourceType"];
    //     srcRevInfo["dataSourceName"] = template["source"]["dataSourceName"];
    // }

    // // target revision
    // let targetRevInfo = {};
    // if (template["target"]["id"].toLowerCase() === "current") {
    //     targetRevInfo["revisionName"] = "Current";
    //     components["target"] = SourceManagers[model.currentTabId].GetAllComponents();
    // }
    // else {
    //     targetRevInfo["revisionName"] = template["target"]["name"];
    //     targetRevInfo["dataSourceType"] = template["target"]["dataSourceType"];
    //     targetRevInfo["dataSourceName"] = template["target"]["dataSourceName"];
    // }
    // // get options
    // let options = null;
    // if ("options" in template) {
    //     options = template["options"];
    // }
    // if (options === null) {
    //     return;
    // }

    // // check if target revision is recent or not
    // let isTargetNewer = "true";
    let isTargetCurrent = false;
    if (template["target"]["id"].toLowerCase() === "current") {
        // isTargetNewer = "true";
        isTargetCurrent = true;
    }
    // else if (srcRevInfo["revisionName"] === "Current") {
    //     isTargetNewer = "false";
    // }
    // else {

    //     if (new Date(template.target.createdOn).getTime() >= new Date(template.source.createdOn).getTime()) {
    //         isTargetNewer = "true";
    //     }
    //     else {
    //         isTargetNewer = "false";
    //     }
    // }

    showBusyIndicator();
    this.CheckRevisions(template).then(function (checkResults) {
        hideBusyIndicator();
        if (!checkResults) {
            return;
        }
        _this.RevisionCheckResults = checkResults;

        showBusyIndicator();
        let headers = _this.CreateDataChangeViewHeaders();
        let tableData = _this.GetDataChangeViewRowsData(checkResults);
        hideBusyIndicator();

        _this.LoadDataChangeViewTable(
            headers,
            tableData,
            isTargetCurrent
        );
    });
}

GroupView1D.prototype.GetDataChangeViewRowsData = function (checkResults) {
    let tableData = [];
    for (let groupName in checkResults) {
        let group = checkResults[groupName];

        for (let i = 0; i < group.length; i++) {
            let item = group[i];

            let tableRowContent = {};
            tableRowContent["_Status"] = item._status;

            let itemData = null;
            if ("target" in item) {
                itemData = item["target"];
            }
         
            if (itemData) {
                tableRowContent["Item"] = itemData.Name;
                tableRowContent["Category"] = (itemData.MainComponentClass ? itemData.MainComponentClass : "");
                tableRowContent["Class"] = (itemData.SubComponentClass ? itemData.SubComponentClass : "");
                tableRowContent["Id"] = (itemData.ID !== undefined ? Number(itemData.ID) : "");
                // tableRowContent["ParentNodeId"] = ((itemData.ParentNodeId !== undefined && itemData.ParentNodeId !== null) ? Number(itemData.ParentNodeId) : -4);

                // if (this.RootNodeId === null) {
                //     this.RootNodeId = tableRowContent["ParentNodeId"]
                // }
                // else if (tableRowContent["ParentNodeId"] < this.RootNodeId) {
                //     this.RootNodeId = tableRowContent["ParentNodeId"]
                // }

                tableData.push(tableRowContent);

                // maintain NodeId Vs TableItems(rowkeys)
                this.IdVsTableItems[tableRowContent["Id"]] = tableRowContent["Id"];

                // // maintain NodeId Vs Parent NodeIds
                // this.NodeIdVsParentNodeIds[tableRowContent["NodeId"]] = tableRowContent["ParentNodeId"];
            }
        }
    }

    // let items = Object.values(tableData);
    // for (var i = 0; i < items.length; i++) {
    //     let item = items[i];
    //     if (!(item.ParentNodeId in tableData)) {
    //         item.ParentNodeId = this.RootNodeId;
    //     }
    // }

    return tableData;
}

GroupView1D.prototype.CreateDataChangeViewHeaders = function () {
    var columnHeaders = [];

    let columnHeader = {};
    columnHeader["caption"] = "Item";
    columnHeader["dataField"] = "Item";
    columnHeader["width"] = "25%";
    columnHeader["visible"] = true;
    columnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["caption"] = "Category";
    columnHeader["dataField"] = "Category";
    columnHeader["width"] = "25%";
    columnHeader["visible"] = true;
    columnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["caption"] = "Class";
    columnHeader["dataField"] = "Class";
    columnHeader["width"] = "25%";
    columnHeader["visible"] = true;
    columnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["caption"] = "Status";
    columnHeader["dataField"] = "_Status";
    columnHeader["width"] = "25%";
    columnHeader["visible"] = true;
    columnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["caption"] = "Id";
    columnHeader["dataField"] = "Id";
    columnHeader["visible"] = false;
    columnHeaders.push(columnHeader);

    // columnHeader = {};
    // columnHeader["caption"] = "ParentNodeId";
    // columnHeader["dataField"] = "ParentNodeId";
    // columnHeader["visible"] = false;
    // columnHeaders.push(columnHeader);

    return columnHeaders;
}

GroupView1D.prototype.LoadDataChangeViewTable = function (
    headers,
    tableData,
    isTargetCurrent
) {
    var _this = this;
    showBusyIndicator();
    this.DataChangeGroupViewActive = true;

    var loadingBrower = true;
    var containerDiv = "#" + _this.ModelBrowserContainer;

    let keyExpr = "Id";
    let parentIdExpr = "propertydoesntexist";
   
    $(function () {
        _this.GroupViewTree = $(containerDiv).dxTreeList({
            columns: headers,
            dataSource: tableData,
            // dataStructure: 'tree',
            keyExpr: keyExpr,
            parentIdExpr:parentIdExpr,
            rootValue: _this.RootNodeId,
            columnAutoWidth: true,
            columnResizingMode: 'widget',
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            height: "100%",
            width: "100%",
            allowColumnResizing: true,
            hoverStateEnabled: true,
            filterRow: {
                visible: true
            },
            scrolling: {
                mode: "standard"
            },
            selection: {
                mode: "multiple",
                recursive: true,
            },
            headerFilter: {
                visible: true
            },
            onContentReady: function (e) {
                if (loadingBrower === false) {
                    return;
                }
                loadingBrower = false;

                _this.ShowItemCount(e.component.getDataSource().totalCount());
                _this.ShowTargetName();

                hideBusyIndicator();
            },
            onInitialized: function (e) {
                model.views[_this.Id].tableViewInstance = e.component;
                model.views[_this.Id].tableViewWidget = "treelist";

                // if (isTargetCurrent === true) {
                //     // enable events                
                //     _this.InitEvents();
                // }
            },
            onSelectionChanged: function (e) {        
                if (model.views[_this.Id].editUserPropertiesForm.Active) {
                    model.views[_this.Id].editUserPropertiesForm.LoadData();
                }       
            },
            onRowClick: function (e) {
                if (e.rowType !== "data") {
                    return;
                }
                
                // open property callout
                SourceManagers[_this.Id].OpenPropertyCalloutByCompId(e.data.Id);
                // if (e.rowType !== "data" ||
                //     e.event.target.tagName.toLowerCase() === "span") {
                //     return;
                // }
                // if (Object.keys(_this.HighlightedRow).length > 0) {
                //     var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                //     if (oldRowKey === e.key) {
                //         return;
                //     }

                //     _this.UnHighlightRow();
                // }

                // _this.HighlightRow(e.key, e.data.NodeId, isTargetCurrent);
            },
            onRowPrepared: function (e) {
                if (e.rowType !== "data") {
                    return;
                }

                let color = null;
                if (e.data._Status.toLowerCase() === "new item") {
                    color = _this.DataChangeHighlightColors["new item"];
                }
                else if (e.data._Status.toLowerCase() === "deleted item") {
                    color = _this.DataChangeHighlightColors["deleted item"];
                }
                else if (e.data._Status.toLowerCase() === "changed property" ||
                    e.data._Status.toLowerCase() === "new property" ||
                    e.data._Status.toLowerCase() === "deleted property" ||
                    e.data._Status.toLowerCase() === "new/deleted property" ||
                    e.data._Status.toLowerCase() === "new/changed property" ||
                    e.data._Status.toLowerCase() === "deleted/changed property" ||
                    e.data._Status.toLowerCase() === "new/deleted/changed property") {
                    color = _this.DataChangeHighlightColors["property change"];
                }
                if (color) {
                    e.rowElement[0].cells[3].style.backgroundColor = color;
                    _this.RowWiseColors[e.key] = color;
                }
            },
            onContextMenuPreparing: function (e) {
                if (e.row.rowType === "data") {
                    e.items = [
                        {
                            text: "Properties",
                            onItemClick: function () {
                                let rowsData = e.component.getSelectedRowsData();
                                if (rowsData.length === 0) {
                                    return;
                                }

                                SourceManagers[_this.Id].PropertyCallout.Open();
                                SourceManagers[_this.Id].OpenPropertyCalloutByCompId(rowsData[0].Id);
                                // _this.ContextMenu.OnMenuItemClicked("properties", rowsData[0]);
                            }
                        },
                        {
                            text: "Reference",
                            onItemClick: function () {
                                _this.OnReferenceClicked();
                            }
                        },
                    ]
                }
                else if (e.row.rowType === "header") {
                    // e.items = [
                    //     {
                    //         text: _this.ExcludeMembers ? "Include Members" : "Exclude Members",
                    //         disabled: _this.Flat,
                    //         onItemClick: function () {
                    //             e.component.option("selection.recursive", _this.ExcludeMembers);
                    //             _this.ExcludeMembers = !_this.ExcludeMembers;                                
                    //         }
                    //     },
                    //     {
                    //         text: "Flat/Nested",
                    //         onItemClick: function () {
                    //             _this.Flat = !_this.Flat;
                    //             if (_this.Flat) {
                    //                 e.component.option("parentIdExpr", "notexistingproperty");
                    //             }
                    //             else {
                    //                 e.component.option("parentIdExpr", "ParentNodeId");
                    //             }
                    //         }
                    //     }
                    // ];
                }
            },
            onDisposing: function (e) {
                // disable events
                // _this.TerminateEvents();

                if (_this.HighlightActive) {
                    // _this.ResetViewerColors();
                    // change icon of btn
                    document.getElementById("highlightSelectionBtn" + _this.Id).src = "public/symbols/Highlight Selection-Off.svg";
                }
                _this.HighlightActive = false;

                model.views[_this.Id].tableViewInstance = null;
                model.views[_this.Id].tableViewWidget = null;

                // _this.Webviewer.selectionManager.clear();

                _this.GroupViewTree = null;

                _this.SelectedRows = {};
                _this.HighlightedRow = {};

                _this.IdVsTableItems = {};
                // _this.NodeIdVsParentNodeIds = {};

                _this.RowWiseColors = {};

                _this.ShowDatabaseViewer(false);
                _this.DataChangeGroupViewActive = false;

                _this.RevisionCheckResults = null;
                _this.CurrentDataChangeTemplate = null;

                _this.DisplayTablesForm = null;
                
                document.getElementById("revisionName" + _this.Id).innerText = "";

                _this.ExcludeMembers = false;
                _this.Flat = false;
            }
        }).dxTreeList("instance");
    });
}
