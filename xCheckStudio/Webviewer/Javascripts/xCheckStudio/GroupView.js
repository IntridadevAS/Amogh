function GroupView(
    id,
    modelBrowserContainer,
    components,
    viewer) {
    // call super constructor
    ModelBrowser.call(this, id, modelBrowserContainer);

    this.Components = components;
    this.Webviewer = viewer;

    this.ExistingColumnNames = [];
    this.Headers = [];
    this.TableData = [];

    this.GroupedData = {};

    this.GroupViewTableInstance;
    this.GroupViewGrid = null;

    this.SelectedRows = {};
    this.HighlightedRow = {};

    this.KeyVsTableItems = {};
    this.NodeIdVsTableItems = {};
    this.GroupKeysVsDataItems = {};

    this.AvoidTableEvents = false;
    this.AvoidViewerEvents = false;

    var _this = this;
    this.ViewerCallbackMap = {
        selectionArray: function (selections) {
            if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.Group ||
                _this.AvoidViewerEvents) {
                return;
            }

            _this.OnSelectionFromViewer(selections);
        }
    };

    // this.GroupProperties;
    this.GroupTemplate;

    this.UndefinedHidden = false;

    this.IsHighlightByPropertyActive = false;
    this.RowWiseColors = {};
    this.HighlightActive = false;
}
// assign ModelBrowser's method to this class
GroupView.prototype = Object.create(ModelBrowser.prototype);
GroupView.prototype.constructor = GroupView;

GroupView.prototype.UpdateComponents = function (componentsData) {
    var needsUpdate = false;

    var sourceManager = SourceManagers[this.Id];
    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceManager.SourceType);
    var nameProperty = identifierProperties.name.replace("Intrida Data/", "");
    var categoryProperty = identifierProperties.mainCategory.replace("Intrida Data/", "");
    var classProperty = identifierProperties.subClass.replace("Intrida Data/", "");
    for (var nodeId in componentsData) {
        var componentData = componentsData[nodeId];

        // Update all components from this class
        if (nodeId in this.Components) {
            var component = this.Components[nodeId];
            if (componentData.name &&
                component.Name !== componentData.name) {
                component.Name = componentData.name;

                needsUpdate = true;
            }
            if (componentData.category) {
                component.MainComponentClass = componentData.category;

                needsUpdate = true;
            }
            if (componentData.componentClass) {
                component.SubComponentClass = componentData.componentClass;

                needsUpdate = true;
            }

            // add properties to components
            for (var i = 0; i < componentData.properties.length; i++) {
                var prop = componentData.properties[i];
               
                if (prop.action.toLowerCase() === "add") {
                    var genericPropertyObject = new GenericProperty(prop.property, "String", prop.value, true);
                    component.addProperty(genericPropertyObject);
                }
                else if (prop.action.toLowerCase() === "remove") {
                    if (prop.property.toLowerCase() === categoryProperty.toLowerCase()) {
                        component.MainComponentClass = null;
                        needsUpdate = true;
                    }
                    if (prop.property.toLowerCase() === classProperty.toLowerCase()) {
                        component.SubComponentClass = null;
                        needsUpdate = true;
                    }

                    component.removeProperty(prop.property);
                }
                else if (prop.action.toLowerCase() === "update") {
                    if (prop.oldProperty.toLowerCase() === categoryProperty.toLowerCase()) {
                        if (prop.property.toLowerCase() !== categoryProperty.toLowerCase()) {
                            component.MainComponentClass = null;
                        }
                        else {
                            component.MainComponentClass = prop.value;
                        }

                        needsUpdate = true;
                    }
                    if (prop.oldProperty.toLowerCase() === classProperty.toLowerCase()) {
                        if (prop.property.toLowerCase() !== classProperty.toLowerCase()) {
                            component.SubComponentClass = null;
                        }
                        else {
                            component.SubComponentClass = prop.value;
                        }
                        needsUpdate = true;
                    }                
                    component.updateProperty(prop.oldProperty, prop.property, prop.value)                   
                }
            }
        }

        // Update SourceProperty components from SCManager which are shown in modelbrowser        
        sourceManager.SourceProperties[nodeId] = this.Components[nodeId];
    }

    // Sourcemanagers all components as well
    sourceManager.AllComponents = this.Components;
}

GroupView.prototype.Show = function () {
    this.Clear();

    document.getElementById("tableHeaderName" + this.Id).innerText = GlobalConstants.TableView.Group;
}

GroupView.prototype.GetGroupTemplateProperties = function () {
    if (this.GroupTemplate &&
        ("properties" in this.GroupTemplate)) {
        return this.GroupTemplate.properties;
    }

    return null;
}

GroupView.prototype.OnGroupTemplateChanged = function (groupName) {
    if (!groupName) {
        return;
    }

    if (groupName.toLowerCase() === "clear") {
        this.Clear();
        return;
    }

    if (this.IsHighlightByPropertyActive === true) {
        if (!(groupName in model.propertyHighlightTemplates)) {
            return;
        }
        // this.GroupProperties = model.propertyHighlightTemplates[groupName].properties;
        this.GroupTemplate = model.propertyHighlightTemplates[groupName];
    }
    else {
        if (!(groupName in model.propertyGroups)) {
            return;
        }
        // this.GroupProperties = model.propertyGroups[groupName].properties;
        this.GroupTemplate = model.propertyGroups[groupName];
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
    column["caption"] = "NodeId";
    column["dataField"] = "NodeId";
    column["visible"] = false;
    column["showInColumnChooser"] = false;
    this.Headers.push(column);

    this.TableData = [];

    // if (this.IsHighlightByPropertyActive) {
    //     this.GenerateTableDataForHighlightByProperty();
    // }
    // else {
    this.GenerateTableDataForGroupByProperty();
    // }

    if (this.TableData === undefined ||
        this.TableData.length === 0) {
        return;
    }

    // Load table
    this.LoadTable();
}

GroupView.prototype.GenerateTableDataForGroupByProperty = function () {


    for (var nodeId in this.Components) {
        var component = this.Components[nodeId];

        var rowData = {};
        rowData["componentName"] = component.Name;
        rowData["NodeId"] = Number(component.NodeId);
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

GroupView.prototype.IsPropertyInGroupProperties = function (property) {
    var groupProperties = this.GetGroupTemplateProperties();
    if (groupProperties === null) {
        return false;
    }

    if (this.IsHighlightByPropertyActive) {
        for (var i = 0; i < groupProperties.length; i++) {
            var groupProperty = groupProperties[i];
            if (groupProperty.Name == property) {
                return true;
            }
        }
    }
    else {
        if (groupProperties.indexOf(property) !== -1) {
            return true;
        }
    }

    return false;
}

GroupView.prototype.LoadTable = function () {
    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;

    this.Clear();
    
    var groupProperties = this.GetGroupTemplateProperties();   
    if (!groupProperties ||
        groupProperties.length === 0) {
        return;
    }

    var filter = [];
    if (this.IsHighlightByPropertyActive) {

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
    else {

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
        keyExpr: "NodeId",
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

            // enable events
            _this.InitEvents();
        },
        onSelectionChanged: function (e) {
            if (_this.AvoidTableEvents) {
                return;
            }

            // disable events
            _this.AvoidViewerEvents = true;

            if (e.currentSelectedRowKeys.length > 0) {
                    for (var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        // var rowKey = Number(e.currentSelectedRowKeys[i]);
                        var rowKey = e.currentSelectedRowKeys[i];
                        var rowIndex = e.component.getRowIndexByKey(rowKey);
                        if (rowIndex === -1) {
                            e.component.byKey(rowKey).done(function (dataObject) {
                                var nodeId = Number(dataObject.NodeId);
                                _this.SelectedRows[rowKey] = nodeId;
                                _this.Webviewer.selectionManager.selectNode(nodeId, Communicator.SelectionMode.Add);
                            });
                        }
                        else {
                            var visibleRows = e.component.getVisibleRows();
                            var nodeId = Number(visibleRows[rowIndex].data.NodeId);

                            _this.SelectedRows[rowKey] = nodeId;

                            _this.Webviewer.selectionManager.selectNode(nodeId, Communicator.SelectionMode.Add);
                        }
                    }               
            }
            else if (e.currentDeselectedRowKeys.length > 0) {
                // if (e.currentDeselectedRowKeys.length === e.component.getDataSource().totalCount()) {
                //     // expand all
                //     e.component.expandAll();

                for (var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                    // var rowKey = Number(e.currentDeselectedRowKeys[i]);
                    var rowKey = e.currentDeselectedRowKeys[i];

                    if (rowKey in _this.SelectedRows) {
                        delete _this.SelectedRows[rowKey];
                    }
                }
                //now manage selection in viewer
                _this.Webviewer.selectionManager.clear();
                for (var rowKey in _this.SelectedRows) {
                    _this.Webviewer.selectionManager.selectNode(Number(_this.SelectedRows[rowKey]),
                        Communicator.SelectionMode.Add);
                }
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

            if (Object.keys(_this.HighlightedRow).length > 0) {
                var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                if (oldRowKey === e.key) {
                    return;
                }

                // var oldRowKey = Object.keys(_this.HighlightedRow)[0];
                var rowIndex = e.component.getRowIndexByKey(oldRowKey);
                var rowElement = e.component.getRowElement(rowIndex)[0];
                // if (oldRowKey in _this.SelectedRows) {
                //     // _this.SetRowColor(rowElement, GlobalConstants.TableRowSelectedColor);
                // }
                // else {
                    _this.SetRowColor(rowElement, GlobalConstants.TableRowNormalColor);

                    if (_this.HighlightActive &&
                        (oldRowKey in _this.RowWiseColors)) {
                        rowElement.cells[0].style.backgroundColor = _this.RowWiseColors[oldRowKey];
                    }
                // }
                delete _this.HighlightedRow[oldRowKey];
            }

            _this.HighlightedRow[e.key] = Number(e.data.NodeId);

            // var rowIndex = e.component.getRowIndexByKey(Number(e.key));
            var rowIndex = e.component.getRowIndexByKey(e.key);
            var rowElement = e.component.getRowElement(rowIndex)[0];
            _this.SetRowColor(rowElement, GlobalConstants.TableRowHighlightedColor);

            // disable events
            _this.AvoidViewerEvents = true;

            if (!(e.key in _this.SelectedRows)) {
                //now manage selection in viewer
                _this.Webviewer.selectionManager.clear();
                for (var rowKey in _this.SelectedRows) {
                    _this.Webviewer.selectionManager.selectNode(
                        Number(_this.SelectedRows[rowKey]),
                        Communicator.SelectionMode.Add);
                }

                _this.Webviewer.selectionManager.selectNode(
                    Number(e.data.NodeId),
                    Communicator.SelectionMode.Add);
            }
            _this.Webviewer.view.fitNodes([Number(e.data.NodeId)]);

            // property callout                
            if (e.data.NodeId in _this.Components) {
                SourceManagers[_this.Id].OpenPropertyCallout(_this.Components[e.data.NodeId].Name, e.data.NodeId);
            }

            // enable events
            _this.AvoidViewerEvents = false;
        },
        onDisposing: function (e) {
            // save table view
            _this.SaveTableView();

            // disable events
            _this.TerminateEvents();

            model.views[_this.Id].tableViewInstance = null;
            model.views[_this.Id].tableViewWidget = null;

            _this.Webviewer.selectionManager.clear();

            _this.GroupViewGrid = null;

            _this.SelectedRows = {};
            _this.HighlightedRow = {};

            _this.KeyVsTableItems = {};
            _this.NodeIdVsTableItems = {};
            _this.GroupKeysVsDataItems = {};

            _this.UndefinedHidden = false;
            _this.RowWiseColors = {};

            if (_this.HighlightActive) {
                _this.ResetViewerColors();
            }
            _this.HighlightActive = false;

            _this.ExistingColumnNames = [];
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
                if (SourceManagers[_this.Id].HiddenNodeIds.includes(Number(e.data.NodeId))) {
                    var selectedRows = [e.rowElement[0]];
                    _this.HighlightHiddenRows(true, selectedRows);
                }

                // set row colors
                if (e.key in _this.RowWiseColors) {
                    e.rowElement[0].cells[0].style.backgroundColor = _this.RowWiseColors[e.key];
                    // _this.SetRowColor(e.rowElement[0], _this.RowWiseColors[e.key]);                    
                    // e.rowElement[0].style.color = "white";
                }
            }
        },
        onContextMenuPreparing: function (e) {
            if (e.row.rowType === "data") {
                e.items = [
                    {
                        text: "Hide",
                        onItemClick: function () {
                            _this.OnHideClicked();
                        }
                    },
                    {
                        text: "Isolate",
                        onItemClick: function () {
                            _this.OnIsolateClicked();
                        }
                    },
                    {
                        text: "Show",
                        onItemClick: function () {
                            _this.OnShowClicked();
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
                        if (_this.IsHighlightByPropertyActive) {
                            _this.OnPropertyHighlightGroupSelectClicked(e.row.key, true);
                        }
                        else {
                            _this.OnGroupSelectClicked(e.row.key, true);
                        }
                    }
                },
                {
                    text: "DeSelect All",
                    onItemClick: function () {
                        if (_this.IsHighlightByPropertyActive) {
                            _this.OnPropertyHighlightGroupSelectClicked(e.row.key, false);
                        }
                        else {
                            _this.OnGroupSelectClicked(e.row.key, false);
                        }
                    }
                },
                {
                    text: "Hide",
                    onItemClick: function () {
                        if (_this.IsHighlightByPropertyActive) {
                            _this.OnPropertyHighlightGroupShowClicked(e.row.key, false);
                        }
                        else {
                            _this.OnGroupShowClicked(e.row.key, false);
                        }
                    }
                },
                {
                    text: "Isolate",
                    onItemClick: function () {
                        model.views[_this.Id].isolateManager.IsolatedNodes = [];
                        if (_this.IsHighlightByPropertyActive) {
                            _this.OnPropertyHighlightGroupIsolateClicked(e.row.key);
                        }
                        else {
                            _this.OnGroupIsolateClicked(e.row.key);
                        }
                    }
                },
                {
                    text: "Show",
                    onItemClick: function () {
                        if (_this.IsHighlightByPropertyActive) {
                            _this.OnPropertyHighlightGroupShowClicked(e.row.key, true);
                        }
                        else {
                            _this.OnGroupShowClicked(e.row.key, true);
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
                        disabled: _this.IsHighlightByPropertyActive,                     
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

GroupView.prototype.OnReferenceClicked = function () {
    var title = model.views[this.Id].fileName;
    ReferenceManager.showReferenceDiv(title);
}

GroupView.prototype.SaveTableView = function () {
    if (!this.GroupViewGrid ||
        !this.GroupTemplate) {
        return;
    }

    this.GroupTemplate['visibleColumns'] = [];
    var columns = this.GroupViewGrid.getVisibleColumns();
    for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        if (column.type === "selection" ||
            column.type === "groupExpand" ||
            (("dataField" in column) && column.dataField.toLowerCase() === "componentname")) {
            continue;
        }

        this.GroupTemplate['visibleColumns'].push(column.dataField);
    }
}

GroupView.prototype.AddGlobalSummary = function (e, summaryType, displayFormat) {  
    var globalSummaryItems = e.component.option("summary.totalItems");
   
    var found = false;
    for (var i = 0; i < globalSummaryItems.length; i++) {
        var globalSummaryItem = globalSummaryItems[i];
        if (globalSummaryItem.column === e.column.dataField &&
            globalSummaryItem.summaryType === summaryType) {
            globalSummaryItems.splice(i, 1);
            found = true;
            break;
        }
    }

    if (found === false) {
        var summaryDefinition = {
            column: e.column.dataField,
            summaryType: summaryType,
            displayFormat: displayFormat,
            showInGroupFooter: true,
            alignByColumn: true
        };
        globalSummaryItems.push(summaryDefinition);
    }

    e.component.option("summary.totalItems", globalSummaryItems);
}

GroupView.prototype.AddGroupSummary = function(e, summaryType, displayFormat){
    var groupSummaryItems = e.component.option("summary.groupItems");  

    // check if summary already exists for column
    var found = false;
    for (var i = 0; i < groupSummaryItems.length; i++) {
        var groupSummaryItem = groupSummaryItems[i];
        if (groupSummaryItem.column === e.column.dataField &&
            groupSummaryItem.summaryType === summaryType) {
            groupSummaryItems.splice(i, 1);
            found = true;
            break;
        }
    }
   
    if (found === false) {
        var summaryDefinition = {
            column: e.column.dataField,
            summaryType: summaryType,
            displayFormat: displayFormat,
            showInGroupFooter: true,
            alignByColumn: true
        };

        groupSummaryItems.push(summaryDefinition);
    }

    e.component.option("summary.groupItems", groupSummaryItems);    
}

GroupView.prototype.CacheItems = function (rows) {
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
            this.NodeIdVsTableItems[row.data.NodeId] = row.key;
            this.KeyVsTableItems[row.key] = {
                "item": row.data.componentName,
                "nodeId": row.data.NodeId
            };

            var groupProperties = this.GetGroupTemplateProperties();
            if (groupProperties === null) {
                continue;
            }
            if (this.IsHighlightByPropertyActive) {

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
            else {
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

GroupView.prototype.GetFilter = function () {
    var groupProperties = this.GetGroupTemplateProperties();
    if (groupProperties === null) {
        return null;
    }

    var filter = [];
    if (groupProperties === null || 
        groupProperties.length > 0) {
        filter[0] = [];
    }

    for (var i = 0; i < groupProperties.length; i++) {
        var groupProperty = groupProperties[i];

        var filterCondition = [groupProperty.Name.replace(/\s/g, ''), "=", groupProperty.Value];
        filter[filter.length - 1].push(filterCondition);

        if (!groupProperty.Operator ||
            groupProperty.Operator.toLowerCase() === "and") {
            filter.push("or", []);
        }
        else {
            filter[filter.length - 1].push("and");
        }
    }

    return filter;
}

GroupView.prototype.InitEvents = function () {
    this.Webviewer.setCallbacks(this.ViewerCallbackMap);
}

GroupView.prototype.TerminateEvents = function () {
    this.Webviewer.unsetCallbacks(this.ViewerCallbackMap);
}

GroupView.prototype.HighlightHiddenRows = function (isHide, selectedRows) {

    for (var i = 0; i < selectedRows.length; i++) {
        var selectedRow = selectedRows[i];

        for (var j = 0; j < selectedRow.cells.length; j++) {
            var cell = selectedRow.cells[j];
            if (isHide) {
                cell.style.color = "#b3b5b5";
            }
            else {
                cell.style.color = "black";
            }
        }
    }
}

GroupView.prototype.HighlightHiddenRowsFromNodeIds = function (isHide, nodeIds) {
    // var selectedNodeIds =  this.GetSelectedNodes();
    var selectedRows = this.GetSelectedRowsFromNodeIds(nodeIds);
    this.HighlightHiddenRows(isHide, selectedRows);
}

GroupView.prototype.GetSelectedRowsFromNodeIds = function (selectedNodeIds) {
    var selectedRows = [];

    for (var i = 0; i < selectedNodeIds.length; i++) {
        var nodeId = Number(selectedNodeIds[i]);
        if (!(nodeId in this.NodeIdVsTableItems)) {
            continue;
        }
        var rowKey = this.NodeIdVsTableItems[nodeId];
        var rowIndex = this.GroupViewGrid.getRowIndexByKey(rowKey);

        if (rowIndex !== -1) {
            var row = this.GroupViewGrid.getRowElement(rowIndex);
            selectedRows.push(row[0]);
        }
    }

    return selectedRows;
}

GroupView.prototype.ShowAllHiddenRows = function () {
    var sourceManager = SourceManagers[this.Id];
    this.HighlightHiddenRowsFromNodeIds(false, sourceManager.HiddenNodeIds)

    sourceManager.HiddenNodeIds = [];
}


GroupView.prototype.GetSelectedNodeIds = function () {
    return Object.values(this.SelectedRows);
}

GroupView.prototype.GetSelectedComponents = function () {
    var selectedNodeIds = this.GetSelectedNodes();

    var selected = {};
    for (var i = 0; i < selectedNodeIds.length; i++) {
        var nodeId = selectedNodeIds[i];
        selected[nodeId] = this.Components[nodeId];
    }

    return selected;
}

GroupView.prototype.GetSelectedComponentIds = function () {
    var nodeIds = this.GetSelectedNodeIds();
    var selectedCompIds = [];

    var sourceManager = SourceManagers[this.Id];
    for (var i = 0; i < nodeIds.length; i++) {
        var nodeId = nodeIds[i];

        selectedCompIds.push(sourceManager.GetCompIdByNodeId(nodeId));
    }

    return selectedCompIds;
}

GroupView.prototype.SetRowColor = function (row, color) {
    row.style.backgroundColor = color;
}

GroupView.prototype.OnSelectionFromViewer = function (selections) {
    for (var i = 0; i < selections.length; i++) {
        var selection = selections[i];
        var sel = selection.getSelection();

        var selectedNodeId = sel.getNodeId();

        if (!(selectedNodeId in this.NodeIdVsTableItems)) {

            // disable events
            this.AvoidViewerEvents = true;

            // reset selection in viewer
            this.Webviewer.selectionManager.clear();
            for (var rowKey in this.SelectedRows) {
                this.Webviewer.selectionManager.selectNode(Number(this.SelectedRows[rowKey]),
                    Communicator.SelectionMode.Add);
            }

            selectedNodeId = this.SelectValidNode(selectedNodeId);

            // enable events again
            this.AvoidViewerEvents = false;

            if (selectedNodeId === null ||
                !(selectedNodeId in this.NodeIdVsTableItems)) {
                continue;
            }
        }

        var rowKey = this.NodeIdVsTableItems[selectedNodeId];

        this.GoToRow(rowKey);
    }
}

GroupView.prototype.SelectValidNode = function (nodeId) {
    nodeId = this.Webviewer.model.getNodeParent(nodeId);
    if (nodeId === null) {
        return null;
    }

    if (nodeId in this.NodeIdVsTableItems) {
        // disable events
        this.AvoidViewerEvents = true;

        this.Webviewer.selectionManager.selectNode(nodeId, Communicator.SelectionMode.Add);

        // enable events
        this.AvoidViewerEvents = false;

        return nodeId;
    }
    // else {
    return this.SelectValidNode(nodeId);
    // }

    // return null;
}

GroupView.prototype.GoToRow = function (rowKey) {
    var _this = this;

    var rowData = _this.KeyVsTableItems[rowKey];

    // expand group
    if (this.IsHighlightByPropertyActive) {
        for (var key in this.GroupKeysVsDataItems) {
            if (this.GroupKeysVsDataItems[key].indexOf(rowKey) !== -1) {
                this.OpenGroup(key.split(",")).then(function (result) {

                    // select row
                    _this.SelectRow(rowKey);
                });
            }
        }
    }
    else {
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
                _this.GroupViewGrid.expandRow(key);
            }
        }

        // select row
        _this.SelectRow(rowKey);
    }
}

GroupView.prototype.SelectRow = function (rowKey) {
    var _this = this;

    if (!_this.GroupViewGrid.isRowSelected(rowKey)) {
        _this.AvoidTableEvents = true;
        _this.GroupViewGrid.selectRows([rowKey], true).then(function () {
            _this.GroupViewGrid.navigateToRow(rowKey);
            _this.AvoidTableEvents = false;
        });

        var rowData = _this.KeyVsTableItems[rowKey];
        _this.SelectedRows[rowKey] = rowData.nodeId;
    }

    // _this.GroupViewGrid.navigateToRow(rowKey);
}

GroupView.prototype.GetSelectedNodes = function () {
    var selectedNodes = [];
    for (var rowKey in this.SelectedRows) {
        selectedNodes.push(Number(this.SelectedRows[rowKey]));
    }

    return selectedNodes;
}

GroupView.prototype.OpenGroup = function (rowKey) {
    var _this = this;

    return new Promise((resolve) => {
        var allPromises = []
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

GroupView.prototype.OnPropertyHighlightGroupSelectClicked = function (rowKey, select) {
    var _this = this;

    this.OpenGroup(rowKey).then(function (result) {

        for (var key in _this.GroupKeysVsDataItems) {
            var keyArray = key.split(",");

            if (keyArray.length < rowKey.length) {
                continue;
            }

            var groupFound = true;
            for (var i = 0; i < rowKey.length; i++) {
                if (keyArray[i] !== rowKey[i]) {
                    groupFound = false;
                    break;
                }
            }

            if (groupFound) {
                if (select) {
                    _this.GroupViewGrid.selectRows(_this.GroupKeysVsDataItems[key], true);
                }
                else {
                    _this.GroupViewGrid.deselectRows(_this.GroupKeysVsDataItems[key]);
                }
            }
        }
    });
}

GroupView.prototype.OnPropertyHighlightGroupShowClicked = function (rowKey, show) {
    var _this = this;

    this.OpenGroup(rowKey).then(function (result) {

        for (var key in _this.GroupKeysVsDataItems) {
            var keyArray = key.split(",");

            if (keyArray.length < rowKey.length) {
                continue;
            }

            var groupFound = true;
            for (var i = 0; i < rowKey.length; i++) {
                if (keyArray[i] !== rowKey[i]) {
                    groupFound = false;
                    break;
                }
            }

            if (groupFound) {
                var dataRowKeys = _this.GroupKeysVsDataItems[key];
                var nodeIds = [];
                for (var i = 0; i < dataRowKeys.length; i++) {
                    if ("nodeId" in _this.KeyVsTableItems[dataRowKeys[i]]) {
                        nodeIds.push(Number(_this.KeyVsTableItems[dataRowKeys[i]].nodeId));
                    }
                }
                _this.SetNodesVisibility(nodeIds, show);

                // Handle hidden elements nodeIds list 
                SourceManagers[_this.Id].HandleHiddenNodeIdsList(!show, nodeIds);

                //Grey out the text of hidden element rows
                _this.HighlightHiddenRowsFromNodeIds(!show, nodeIds);
            }
        }
    });
}

GroupView.prototype.OnPropertyHighlightGroupIsolateClicked = function (rowKey) {
    var _this = this;

    this.OpenGroup(rowKey).then(function (result) {

        for (var key in _this.GroupKeysVsDataItems) {
            var keyArray = key.split(",");

            if (keyArray.length < rowKey.length) {
                continue;
            }

            var groupFound = true;
            for (var i = 0; i < rowKey.length; i++) {
                if (keyArray[i] !== rowKey[i]) {
                    groupFound = false;
                    break;
                }
            }

            if (groupFound) {
                var dataRowKeys = _this.GroupKeysVsDataItems[key];
                var nodeIds = [];
                for (var i = 0; i < dataRowKeys.length; i++) {
                    if ("nodeId" in _this.KeyVsTableItems[dataRowKeys[i]]) {
                        nodeIds.push(Number(_this.KeyVsTableItems[dataRowKeys[i]].nodeId));
                    }
                }
                _this.IsolateNodes(nodeIds, true);
            }
        }
    });
}

GroupView.prototype.OnGroupSelectClicked = function (rowKey, select) {
    var _this = this;

    // return new Promise((resolve) => {

    this.GroupViewGrid.expandRow(rowKey).then(function (refa) {
        var parentRowKey = rowKey;

        var groupProperties = _this.GetGroupTemplateProperties(); 
        if (groupProperties === null) {
            return;
        }

        if (parentRowKey.length === groupProperties.length) {
            if (parentRowKey in _this.GroupKeysVsDataItems) {
                if (select) {
                    _this.GroupViewGrid.selectRows(_this.GroupKeysVsDataItems[parentRowKey], true);
                }
                else {
                    _this.GroupViewGrid.deselectRows(_this.GroupKeysVsDataItems[parentRowKey]);
                }
            }

            // return  resolve(true);
        }
        else {

            var rows = _this.GroupViewGrid.getVisibleRows();
            if (!rows || rows.length === 0) {
                // return resolve(true);
                return;
            }

            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.rowType !== "group" ||
                    ((parentRowKey.length + 1) !== row.key.length)) {
                    continue;
                }

                var isChild = true;
                for (var j = 0; j < parentRowKey.length; j++) {
                    if (parentRowKey[j] !== row.key[j]) {
                        isChild = false;
                        break;
                    }
                }
                if (isChild) {
                    _this.OnGroupSelectClicked(row.key, select);
                }
            }

            // return resolve(true);
        }
    });
    // });
}

GroupView.prototype.OnGroupShowClicked = function (rowKey, show) {
    var _this = this;

    this.GroupViewGrid.expandRow(rowKey).then(function (refa) {
        var parentRowKey = rowKey;
       
        var groupProperties = _this.GetGroupTemplateProperties();
        if (groupProperties === null) {
            return;
        }
        if (parentRowKey.length === groupProperties.length) {
            if (parentRowKey in _this.GroupKeysVsDataItems) {

                var dataRowKeys = _this.GroupKeysVsDataItems[parentRowKey];
                var nodeIds = [];
                for (var i = 0; i < dataRowKeys.length; i++) {
                    if ("nodeId" in _this.KeyVsTableItems[dataRowKeys[i]]) {
                        nodeIds.push(Number(_this.KeyVsTableItems[dataRowKeys[i]].nodeId));
                    }
                }
                _this.SetNodesVisibility(nodeIds, show);

                // Handle hidden elements nodeIds list 
                SourceManagers[_this.Id].HandleHiddenNodeIdsList(!show, nodeIds);

                //Grey out the text of hidden element rows
                _this.HighlightHiddenRowsFromNodeIds(!show, nodeIds);
            }

        }
        else {

            var rows = _this.GroupViewGrid.getVisibleRows();
            if (!rows || rows.length === 0) {
                return;
            }

            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.rowType !== "group" ||
                    ((parentRowKey.length + 1) !== row.key.length)) {
                    continue;
                }

                var isChild = true;
                for (var j = 0; j < parentRowKey.length; j++) {
                    if (parentRowKey[j] !== row.key[j]) {
                        isChild = false;
                        break;
                    }
                }
                if (isChild) {
                    _this.OnGroupShowClicked(row.key, show);
                }
            }
        }
    });
}

GroupView.prototype.OnGroupIsolateClicked = function (rowKey) {
    var _this = this;

    this.GroupViewGrid.expandRow(rowKey).then(function (refa) {
        var parentRowKey = rowKey;

        var groupProperties = _this.GetGroupTemplateProperties();
        if (groupProperties === null) {
            return;
        }
        if (parentRowKey.length === groupProperties.length) {
            if (parentRowKey in _this.GroupKeysVsDataItems) {

                var dataRowKeys = _this.GroupKeysVsDataItems[parentRowKey];
                var nodeIds = [];
                for (var i = 0; i < dataRowKeys.length; i++) {
                    if ("nodeId" in _this.KeyVsTableItems[dataRowKeys[i]]) {
                        nodeIds.push(Number(_this.KeyVsTableItems[dataRowKeys[i]].nodeId));
                    }
                }
                _this.IsolateNodes(nodeIds, true);
            }
        }
        else {
            var rows = _this.GroupViewGrid.getVisibleRows();
            if (!rows || rows.length === 0) {
                return;
            }

            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.rowType !== "group" ||
                    ((parentRowKey.length + 1) !== row.key.length)) {
                    continue;
                }

                var isChild = true;
                for (var j = 0; j < parentRowKey.length; j++) {
                    if (parentRowKey[j] !== row.key[j]) {
                        isChild = false;
                        break;
                    }
                }
                if (isChild) {
                    _this.OnGroupIsolateClicked(row.key);
                }
            }
        }
    });
}

GroupView.prototype.OnHideClicked = function () {
    if (!this.Webviewer) {
        return;
    }

    var selectedNodeIds = this.GetSelectedNodes();
    if (!selectedNodeIds ||
        selectedNodeIds.length === 0) {
        return;
    }

    this.SetNodesVisibility(selectedNodeIds, false);

    // Handle hidden elements nodeIds list 
    SourceManagers[this.Id].HandleHiddenNodeIdsList(true, selectedNodeIds);

    //Grey out the text of hidden element rows
    this.HighlightHiddenRowsFromNodeIds(true, selectedNodeIds);
}

GroupView.prototype.OnIsolateClicked = function () {
    if (!this.Webviewer) {
        return;
    }

    var selectedNodeIds = this.GetSelectedNodes();
    if (!selectedNodeIds ||
        selectedNodeIds.length === 0) {
        return;
    }

    this.IsolateNodes(selectedNodeIds, false);
}

GroupView.prototype.IsolateNodes = function (selectedNodeIds, add) {
    // perform isolate      
    model.views[this.Id].isolateManager.Isolate(selectedNodeIds, add).then(function (affectedNodes) {

    });

    // maintain hidden elements
    // if (model.currentTabId in SourceManagers) {
    var sourceManager = SourceManagers[this.Id];
    sourceManager.HiddenNodeIds = [];

    var allNodeIds = Object.keys(this.NodeIdVsTableItems);
    for (var i = 0; i < Object.keys(allNodeIds).length; i++) {
        var nodeId = Number(allNodeIds[i]);
        if (!selectedNodeIds.includes(nodeId)) {
            sourceManager.HiddenNodeIds.push(nodeId);
        }
    }

    //Grey out the text of hidden element rows
    this.HighlightHiddenRowsFromNodeIds(true, sourceManager.HiddenNodeIds);

    // unhighlight the hidden rows made visible
    this.HighlightHiddenRowsFromNodeIds(false, model.views[this.Id].isolateManager.IsolatedNodes);
}

GroupView.prototype.OnShowClicked = function () {
    if (!this.Webviewer) {
        return;
    }

    var selectedNodeIds = this.GetSelectedNodes();
    if (!selectedNodeIds ||
        selectedNodeIds.length === 0) {
        return;
    }

    this.SetNodesVisibility(selectedNodeIds, true);

    // Handle hidden elements nodeIds list 
    SourceManagers[this.Id].HandleHiddenNodeIdsList(false, selectedNodeIds);

    //Grey out the text of hidden element rows
    this.HighlightHiddenRowsFromNodeIds(false, selectedNodeIds);
}

GroupView.prototype.SetNodesVisibility = function (nodeIds, visible) {
    var map = {};
    for (var i = 0; i < nodeIds.length; i++) {
        var nodeId = nodeIds[i];
        map[nodeId] = visible;
    }

    this.Webviewer.model.setNodesVisibilities(map);
}

GroupView.prototype.GetGroupColor = function (groupKey) {

    var color = {
        parentColor: null,
        color: null
    };
    var groupProperties = this.GetGroupTemplateProperties();
    if (groupProperties === null) {
        return;
    }
    var groupPropertiesOrder = [];
    for (var j = 0; j < groupProperties.length; j++) {
        var groupProperty = groupProperties[j];
        if (groupPropertiesOrder.indexOf(groupProperty.Name) === -1) {
            groupPropertiesOrder.push(groupProperty.Name);
        }
    }

    var groupKeyArray = groupKey.split(",");
    // for(var i = 0; i < groupKeyArray.length; i++)
    // {
    for (var j = 0; j < groupProperties.length; j++) {
        var groupProperty = groupProperties[j];

        var index = groupPropertiesOrder.indexOf(groupProperty.Name);
        if (index === -1) {
            continue;
        }

        if (groupKeyArray[index] === groupProperty.Value) {
            if (index === groupKeyArray.length - 1 ||
                !groupProperty.Operator ||
                groupProperty.Operator.toLowerCase() === "and") {
                color.color = groupProperty.Color ? groupProperty.Color : null;
                break;
            }
            else {
                color.parentColor = groupProperty.Color;
            }
        }
    }

    if (color.color !== null) {
        return color.color;
    }
    return color.parentColor;
}

GroupView.prototype.ResetViewerColors = function () {
    this.Webviewer.model.resetNodesColor(this.Webviewer.model.getAbsoluteRootNode());
}

GroupView.prototype.Highlight = function(){
    this.GroupViewGrid.expandAll();

    for (var groupKey in this.GroupKeysVsDataItems) {
        var color = this.GetGroupColor(groupKey);
        if (!color) {
            continue;
        }

        for (var i = 0; i < this.GroupKeysVsDataItems[groupKey].length; i++) {
            var rowKey = this.GroupKeysVsDataItems[groupKey][i];
            var rowIndex = this.GroupViewGrid.getRowIndexByKey(rowKey);
            var rowElement = this.GroupViewGrid.getRowElement(rowIndex)[0];
            // this.SetRowColor(rowElement, color);
            rowElement.cells[0].style.backgroundColor = color;

            this.RowWiseColors[rowKey] = color;

            // set nodes face and line colors from status of compoentns
            var nodeId = Number(this.KeyVsTableItems[rowKey].nodeId);

            var rgbColor = xCheckStudio.Util.hexToRgb(color);
            var communicatorColor = new Communicator.Color(rgbColor.r, rgbColor.g, rgbColor.b);
            this.Webviewer.model.setNodesFaceColor([nodeId], communicatorColor);
            this.Webviewer.model.setNodesLineColor([nodeId], communicatorColor);            
        }
    }
}

GroupView.prototype.UnHighlight = function () {
    this.GroupViewGrid.expandAll();

    for (var rowKey in this.RowWiseColors) {       
        var rowIndex = this.GroupViewGrid.getRowIndexByKey(rowKey);
        var rowElement = this.GroupViewGrid.getRowElement(rowIndex)[0];

        if (rowKey in this.SelectedRows) {
            // this.SetRowColor(rowElement, GlobalConstants.TableRowSelectedColor);
            rowElement.cells[0].style.backgroundColor = GlobalConstants.TableRowSelectedColor;
        }
        else {
            // this.SetRowColor(rowElement, GlobalConstants.TableRowNormalColor);
            rowElement.cells[0].style.backgroundColor = GlobalConstants.TableRowNormalColor;
        }       
    }
    this.RowWiseColors = {};
}

GroupView.prototype.ApplyPropertyHighlightColor = function () {
    if (this.GroupViewGrid === null) {
        return;
    }

    if (this.IsHighlightByPropertyActive) {

        if (this.HighlightActive) {            
            this.HighlightActive = false;

            this.ResetViewerColors();
            this.UnHighlight();

            // change icon of btn
            document.getElementById("highlightSelectionBtn" + this.Id).src ="public/symbols/Highlight Selection-Off.svg";
        }
        else {
            this.HighlightActive = true;

            // set one color to entire model
            var rootNode = this.Webviewer.model.getAbsoluteRootNode();
            var communicatorColor = new Communicator.Color(255, 255, 255);
            this.Webviewer.model.setNodesFaceColor([rootNode], communicatorColor);
            this.Webviewer.model.setNodesLineColor([rootNode], communicatorColor);

            this.Highlight();

            // change icon of btn
            document.getElementById("highlightSelectionBtn" + this.Id).src ="public/symbols/Highlight Selection-On.svg";
        }
    }
}