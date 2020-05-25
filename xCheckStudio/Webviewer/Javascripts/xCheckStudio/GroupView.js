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
    this.GroupViewGrid;

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

    this.GroupProperties;

    this.UndefinedHidden = false;
}
// assign ModelBrowser's method to this class
GroupView.prototype = Object.create(ModelBrowser.prototype);
GroupView.prototype.constructor = GroupView;

GroupView.prototype.Show = function () {
    this.Clear();

    document.getElementById("tableHeaderName" + this.Id).innerText = GlobalConstants.TableView.Group;
}

GroupView.prototype.OnGroupChanged = function (groupName) {
    if (!(groupName in model.views[this.Id].propertyGroups)) {
        return;
    }
    this.GroupProperties = model.views[this.Id].propertyGroups[groupName].properties;

    this.ExistingColumnNames = [];
    this.Headers = [];
    var column = {};
    column["caption"] = "Item";
    column["dataField"] = "componentName";
    // column["width"] = "150px";
    column["visible"] = true;
    column["showInColumnChooser"] = false;
    // column["fixed"] = true;
    // column["fixedPosition"] = "left";
    this.Headers.push(column);

    column = {};
    column["caption"] = "NodeId";
    column["dataField"] = "NodeId";
    // column["width"] = "20px";
    column["visible"] = false;
    column["showInColumnChooser"] = false;
    this.Headers.push(column);

    this.TableData = [];
    this.GenerateTableData();

    if (this.TableData === undefined ||
        this.TableData.length === 0) {
        return;
    }

    // Load table
    this.LoadTable();
}

GroupView.prototype.GenerateTableData = function () {


    for (var nodeId in this.Components) {
        var component = this.Components[nodeId];

        var rowData = {};
        rowData["componentName"] = component.Name;
        rowData["NodeId"] = component.NodeId;
        for (var i = 0; i < component.properties.length; i++) {
            var property = component.properties[i];
            rowData[property.Name] = property.Value;

            if (this.ExistingColumnNames.indexOf(property.Name) === -1 &&
                this.GroupProperties.indexOf(property.Name) === -1) {
                var column = {};
                column["caption"] = property.Name;
                column["dataField"] = property.Name.replace(/\s/g, '');
                column["visible"] = false;
                // column["width"] = "40px";
                this.Headers.push(column);
                this.ExistingColumnNames.push(property.Name)
            }
        }

        this.TableData.push(rowData);
    }
}

GroupView.prototype.LoadTable = function () {
    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;

    this.Clear();

    if (!this.GroupProperties ||
        this.GroupProperties.length === 0) {
        return;
    }

    // var columns = [];
  
    for (var i = 0; i < this.GroupProperties.length; i++) {
        var groupProperty = this.GroupProperties[i];
        
        column = {};
        column["caption"] = groupProperty;
        column["dataField"] = groupProperty.replace(/\s/g, '');
        column["visible"] = false;
        // column["width"] = "40px";
        column["groupIndex"] = i;
        this.Headers.push(column);
    }

    var loadingBrowser = true;
    this.GroupViewGrid = $(containerDiv).dxDataGrid({
        columns: this.Headers,
        dataSource: this.TableData,
        keyExpr: "NodeId",
        height: "100%",
        width: "100%",
        columnAutoWidth : true,
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
            mode : "select",
            title : "Property Columns",            
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
        onContentReady: function (e) {
            if (!loadingBrowser) {
                return;
            }
            loadingBrowser = false;

            _this.CacheItems(e.component.getVisibleRows());

            _this.ShowItemCount(e.component.getDataSource().totalCount());

            e.component.option("grouping.autoExpandAll", false);
            // e.component.option("scrolling.mode", "virtual");
            // e.component.option("scrolling.rowRenderingMode", "virtual");            
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
                    var visibleRows = e.component.getVisibleRows();
                    var nodeId = Number(visibleRows[rowIndex].data.NodeId);

                    _this.SelectedRows[rowKey] = nodeId;

                    _this.Webviewer.selectionManager.selectNode(nodeId, Communicator.SelectionMode.Add);
                }
            }
            else if (e.currentDeselectedRowKeys.length > 0) {
                for (var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                    // var rowKey = Number(e.currentDeselectedRowKeys[i]);
                    var rowKey = e.currentDeselectedRowKeys[i];

                    if (rowKey in _this.SelectedRows) {
                        delete _this.SelectedRows[rowKey];

                        //now manage selection in viewer
                        _this.Webviewer.selectionManager.clear();
                        for (var rowKey in _this.SelectedRows) {
                            _this.Webviewer.selectionManager.selectNode(Number(_this.SelectedRows[rowKey]),
                                Communicator.SelectionMode.Add);
                        }
                    }
                }
            }

            // enable events
            _this.AvoidViewerEvents = false;
        },
        onRowClick: function (e) {
            if (e.rowType !== "data") {
                return;
            }

            if (Object.keys(_this.HighlightedRow).length > 0) {

                // var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                var oldRowKey = Object.keys(_this.HighlightedRow)[0];
                var rowIndex = e.component.getRowIndexByKey(oldRowKey);
                var rowElement = e.component.getRowElement(rowIndex)[0];
                if (oldRowKey in _this.SelectedRows) {
                    _this.SetRowColor(rowElement, GlobalConstants.TableRowSelectedColor);
                }
                else {
                    _this.SetRowColor(rowElement, GlobalConstants.TableRowNormalColor);
                }
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

            // enable events
            _this.AvoidViewerEvents = false;
        },
        onDisposing: function (e) {
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

            _this.UndefinedHidden = false;
        },
        onRowPrepared: function (e) {
            if (e.rowType == "group") {
                var rowElement = e.rowElement[0];

                for (var i = 0; i < e.rowElement[0].children.length; i++) {
                    var childElement = e.rowElement[0].children[i];
                    if (childElement.classList.contains("dx-group-cell")) {
                        var resultArray = childElement.innerText.split(":");
                        if (resultArray.length === 2) {
                            if (resultArray[1].trim() === "") {
                                childElement.innerText = "Undefined";
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
                ]
            }
            else if (e.row.rowType === "group") {
                e.items = [{
                    text: "Select All",                   
                    onItemClick: function () {    
                        _this.OnGroupSelectClicked(e.row.key, true);
                    }
                },
                {
                    text: "DeSelect All",                   
                    onItemClick: function () {    
                        _this.OnGroupSelectClicked(e.row.key, false);
                    }
                },
                {
                    text: "Hide",
                    onItemClick: function () {
                        _this.OnGroupShowClicked(e.row.key, false);
                    }
                },
                {
                    text: "Isolate",
                    onItemClick: function () {
                        model.views[_this.Id].isolateManager.IsolatedNodes = [];
                        _this.OnGroupIsolateClicked(e.row.key);
                    }
                },
                {
                    text: "Show",
                    onItemClick: function () {
                        _this.OnGroupShowClicked(e.row.key, true);
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
                    disabled : true,
                    onItemClick: function () {
                          
                        if (!_this.UndefinedHidden) {
                            e.component.filter(["!", ["key", "=", undefined]]);
                        }
                        else {
                            e.component.clearFilter();
                        }

                        _this.UndefinedHidden = !_this.UndefinedHidden;
                    }
                },
                {
                    text: "Summary", 
                    items:[
                        {
                            text: "Sum", 
                            onItemClick: function () {  
                                var groupSummaryItems = e.component.option("summary.groupItems");
                                var globalSummaryItems = e.component.option("summary.totalItems");
                                
                                var summaryDefinition = {
                                    column: e.column.dataField,
                                    summaryType: "sum",
                                    displayFormat: "Total: {0}",
                                    showInGroupFooter: true,
                                    alignByColumn: true
                                };
                                groupSummaryItems.push(summaryDefinition);
                                globalSummaryItems.push(summaryDefinition);
                                e.component.option("summary.groupItems", groupSummaryItems);
                                e.component.option("summary.totalItems", globalSummaryItems);
                            } 
                        },
                        {
                            text: "Count", 
                            onItemClick: function () {                              
                                var groupSummaryItems = e.component.option("summary.groupItems");
                                var globalSummaryItems = e.component.option("summary.totalItems");
                                
                                var summaryDefinition = {
                                    column: e.column.dataField,
                                    summaryType: "count",
                                    displayFormat: "Count: {0}",
                                    showInGroupFooter: true,
                                    alignByColumn: true
                                };
                                groupSummaryItems.push(summaryDefinition);
                                globalSummaryItems.push(summaryDefinition);
                                e.component.option("summary.groupItems", groupSummaryItems);
                                e.component.option("summary.totalItems", globalSummaryItems);
                            } 
                        },
                        {
                            text: "Max", 
                            disabled : true,
                            onItemClick: function () {  
                                var groupSummaryItems = e.component.option("summary.groupItems");
                                var globalSummaryItems = e.component.option("summary.totalItems");
                                
                                var summaryDefinition = {
                                    column: e.column.dataField,
                                    summaryType: "max",
                                    displayFormat: "Max: {0}",
                                    valueFormat : "decimal",
                                    showInGroupFooter: true,
                                    alignByColumn: true
                                };
                                groupSummaryItems.push(summaryDefinition);
                                globalSummaryItems.push(summaryDefinition);
                                e.component.option("summary.groupItems", groupSummaryItems);
                                e.component.option("summary.totalItems", globalSummaryItems);
                            } 
                        },
                        {
                            text: "Min", 
                            onItemClick: function () {  
                                var groupSummaryItems = e.component.option("summary.groupItems");
                                var globalSummaryItems = e.component.option("summary.totalItems");
                                
                                var summaryDefinition = {
                                    column: e.column.dataField,
                                    summaryType: "min",
                                    displayFormat: "Min: {0}",
                                    valueFormat : "decimal",
                                    showInGroupFooter: true,
                                    alignByColumn: true
                                };
                                groupSummaryItems.push(summaryDefinition);
                                globalSummaryItems.push(summaryDefinition);
                                e.component.option("summary.groupItems", groupSummaryItems);
                                e.component.option("summary.totalItems", globalSummaryItems);
                            } 
                        },
                        {
                            text: "Avg",
                            onItemClick: function () {  
                                var groupSummaryItems = e.component.option("summary.groupItems");
                                var globalSummaryItems = e.component.option("summary.totalItems");
                                
                                var summaryDefinition = {
                                    column: e.column.dataField,
                                    summaryType: "avg",
                                    displayFormat: "Avg: {0}",
                                    valueFormat : "decimal",
                                    showInGroupFooter: true,
                                    alignByColumn: true
                                };
                                groupSummaryItems.push(summaryDefinition);
                                globalSummaryItems.push(summaryDefinition);
                                e.component.option("summary.groupItems", groupSummaryItems);
                                e.component.option("summary.totalItems", globalSummaryItems);
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

            var groupKey = [];
            for (var j = 0; j < this.GroupProperties.length; j++) {
                this.KeyVsTableItems[row.key][this.GroupProperties[j]] = row.data[this.GroupProperties[j]];
                groupKey.push(row.data[this.GroupProperties[j]]);
            }

            if (!(groupKey in this.GroupKeysVsDataItems)) {
                this.GroupKeysVsDataItems[groupKey] = [];
            }
            this.GroupKeysVsDataItems[groupKey].push(row.key);
        }
    }
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

GroupView.prototype.GetAllSelectedRowNodeIds = function () {
    var selectedNodeIds = [];
    if (this.GroupViewGrid) {
        var selectedRowsData = this.GroupViewGrid.getSelectedRowsData()
        for (var i = 0; i < selectedRowsData.length; i++) {
            selectedNodeIds.push(selectedRowsData[i].NodeId);
        }
    }

    return selectedNodeIds;
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
    else {
        this.SelectValidNode(nodeId);
    }

    return null;
}

GroupView.prototype.GoToRow = function (rowKey) {
    var _this = this;

    _this.AvoidTableEvents = true;

    var rowData = _this.KeyVsTableItems[rowKey];

    var groupKeys = [];
    for (var i = 0; i < this.GroupProperties.length; i++) {
        var prop = this.GroupProperties[i]
        if (prop in rowData) {
            var propValue = rowData[prop];
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

    if (!_this.GroupViewGrid.isRowSelected(rowKey)) {
        _this.GroupViewGrid.selectRows([rowKey], true).then(function () {
            _this.AvoidTableEvents = false;
        });
        _this.SelectedRows[rowKey] = rowData.nodeId;
    }

    _this.GroupViewGrid.navigateToRow(rowKey);
}

GroupView.prototype.GetSelectedNodes = function () {
    var selectedNodes = [];
    for (var rowKey in this.SelectedRows) {
        selectedNodes.push(Number(this.SelectedRows[rowKey]));
    }

    return selectedNodes;
}

GroupView.prototype.OnGroupSelectClicked = function (rowKey, select) {
    var _this = this;

    // return new Promise((resolve) => {

        this.GroupViewGrid.expandRow(rowKey).then(function (refa) {
            var parentRowKey = rowKey;

            if (parentRowKey.length === _this.GroupProperties.length) {
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

        if (parentRowKey.length === _this.GroupProperties.length) {
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

        if (parentRowKey.length === _this.GroupProperties.length) {
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

GroupView.prototype.IsolateNodes = function(selectedNodeIds, add)
{
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