function ListView(
    id,
    modelBrowserContainer,
    components,
    viewer) {
    // call super constructor
    ModelBrowser.call(this, id, modelBrowserContainer);

    this.Components = components;
    this.Webviewer = viewer;

    this.Headers = [];
    this.TableData = [];

    this.ListViewTableInstance;

    this.SelectedRows = {};
    this.HighlightedRow = {};

    this.KeyVsTableItems = {};
    this.NodeIdVsTableItems = {};
    var _this = this;

    this.AvoidTableEvents = false;
    this.AvoidViewerEvents = false;
    this.ViewerCallbackMap = {
        selectionArray: function (selections) {
            if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.List ||
                _this.AvoidViewerEvents) {
                return;
            }

            _this.OnSelectionFromViewer(selections);
        }
    };

    this.UpdateRequiredRows = {};

    this.CurrentRowId = 0;
}
// assign ModelBrowser's method to this class
ListView.prototype = Object.create(ModelBrowser.prototype);
ListView.prototype.constructor = ListView;

ListView.prototype.UpdateComponents = function (componentsData) {
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

                    component.removeProperty(prop.oldProperty);
                   
                    var genericPropertyObject = new GenericProperty(prop.property, "String", prop.value, true);
                    component.addProperty(genericPropertyObject);
                }
            }
        }

        // Update SourceProperty components from SCManager which are shown in modelbrowser        
        sourceManager.SourceProperties[nodeId] = this.Components[nodeId];
    }

    // Sourcemanagers all components as well
    sourceManager.AllComponents = this.Components;

    if (needsUpdate) {
        for (var rowKey in this.SelectedRows) {
            var rowIndex = this.ListViewTableInstance.getRowIndexByKey(Number(rowKey));
            if (rowIndex === -1) {
                this.UpdateRequiredRows[rowKey] = {
                    nodeId: this.SelectedRows[rowKey],
                    data: componentsData[this.SelectedRows[rowKey]]
                };
            }
            else {
                var component = this.Components[this.SelectedRows[rowKey]];
                this.ListViewTableInstance.cellValue(rowIndex, 0, component.Name);
                this.ListViewTableInstance.cellValue(rowIndex, 1, component.MainComponentClass);
                this.ListViewTableInstance.cellValue(rowIndex, 2, component.SubComponentClass);
            }
        }

        this.ListViewTableInstance.saveEditData();
    }
}

ListView.prototype.Show = function () {
    this.Headers = [];
    this.TableData = [];

    var flat = false;
    if (SourceManagers[this.Id].ListTypeSwitch &&
        SourceManagers[this.Id].ListTypeSwitch.option("value")) {
        flat = true;
    }

    // Create Headers
    this.CreateHeaders();

    // Create Table data
    var rootNode = this.Webviewer.model.getAbsoluteRootNode();
    
    this.CurrentRowId = 1;
    var tableData = this.CreateTableData(rootNode, -1, flat);
    if (!flat) {
        this.TableData = [tableData];
    }
    this.CurrentRowId = 1;

    if (this.Headers === undefined ||
        this.Headers.length === 0 ||
        this.TableData === undefined ||
        this.TableData.length === 0) {
        return;
    }

    // Load table
    this.LoadTable();

    // set active table view type
    model.views[this.Id].activeTableView = GlobalConstants.TableView.List;
}

ListView.prototype.CreateHeaders = function () {
    for (var i = 0; i < Object.keys(ListViewColumns3D).length; i++) {
        var columnHeader = {};
        var caption;
        var width = "0%";
        var visible = true;
        switch (i) {
            case ListViewColumns3D.Select:
                continue;
                break;
            case ListViewColumns3D.Component:
                width = "40%";
                caption = ListViewColumnNames3D.Component;
                break;
            case ListViewColumns3D.MainClass:
                width = "30%";
                caption = ListViewColumnNames3D.MainClass;
                break;
            case ListViewColumns3D.SubClass:
                width = "30%";
                caption = ListViewColumnNames3D.SubClass;
                break;
            case ListViewColumns3D.NodeId:
                visible = false;
                caption = ListViewColumnNames3D.NodeId;
                break;
            case ListViewColumns3D.Parent:
                visible = false;
                caption = ListViewColumnNames3D.Parent;
                break;
        }
        columnHeader["caption"] = caption;
        columnHeader["dataField"] = caption.replace(/\s/g, '');;
        columnHeader["width"] = width;
        columnHeader["visible"] = visible;
        this.Headers.push(columnHeader);
    }
}

ListView.prototype.LoadTable = function () {

    // var loadingBrower = true;
    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;

    this.Clear("treelist");

    // set selection mode
    var selectionAttribute = {
        mode: "multiple",
        recursive: false,
    };
    if (SourceManagers[_this.Id].IncludeMemberItemsSwitch) {
        if (SourceManagers[_this.Id].IncludeMemberItemsSwitch.option("value")) {
            selectionAttribute = {
                mode: "multiple",
                recursive: true,
            };
        }
    }

    $(function () {
        _this.ListViewTableInstance = $(containerDiv).dxTreeList({
            columns: _this.Headers,
            // dataSource: _this.TableData,
            dataSource: {
                key: "rowId",
                load: function () {
                    return _this.TableData;
                },
                update: function (key, values) {
                    var item = findItem(_this.TableData, key);
                    if (item) {
                        Object.assign(item, values);
                    }
                }
            },
            // itemsExpr: "items",
            // dataStructure: "tree",
            dataStructure: "tree",
            keyExpr: "rowId",
            itemsExpr: "items",
            parentIdExpr: "Parent_ID",
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
            paging: {
                pageSize: 50
            },
            selection: selectionAttribute,
            onContentReady: function (e) {
                _this.CacheItems(e.component.getDataSource().items());

                // initialize the context menu
                var modelBrowserContextMenu = new ModelBrowserContextMenu(true);
                modelBrowserContextMenu.Init(_this);
                _this.ShowItemCount(e.component.getDataSource().totalCount());
            },
            onInitialized: function (e) {
                model.views[_this.Id].tableViewInstance = e.component;

                document.getElementById("tableHeaderName" + _this.Id).innerText = GlobalConstants.TableView.List;

                // enable list view switches
                if (SourceManagers[_this.Id].IncludeMemberItemsSwitch) {
                    SourceManagers[_this.Id].IncludeMemberItemsSwitch.option("disabled", false);
                }
                if (SourceManagers[_this.Id].ListTypeSwitch) {
                    SourceManagers[_this.Id].ListTypeSwitch.option("disabled", false);
                }

                // enable events
                _this.InitEvents();
            },           
            onSelectionChanged: function (e) {
                if (_this.AvoidTableEvents) {
                    return;
                }

                if (e.currentSelectedRowKeys.length > 0) {
                    for (var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        var rowKey = Number(e.currentSelectedRowKeys[i]);
                        var rowIndex = e.component.getRowIndexByKey(rowKey);
                        var visibleRows = e.component.getVisibleRows();
                        var nodeId = visibleRows[rowIndex].data.NodeId;

                        _this.SelectedRows[rowKey] = nodeId;

                        _this.Webviewer.selectionManager.selectNode(nodeId, Communicator.SelectionMode.Add);
                    }
                }
                else if (e.currentDeselectedRowKeys.length > 0) {
                    for (var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        var rowKey = Number(e.currentDeselectedRowKeys[i]);

                        if (rowKey in _this.SelectedRows) {
                            delete _this.SelectedRows[rowKey];

                            //now manage selection in viewer
                            _this.Webviewer.selectionManager.clear();
                            for (var rowKey in _this.SelectedRows) {
                                _this.Webviewer.selectionManager.selectNode(_this.SelectedRows[rowKey],
                                    Communicator.SelectionMode.Add);
                            }
                        }
                    }
                }

                if (model.views[_this.Id].userPropertiesForm.Active) {
                    model.views[_this.Id].userPropertiesForm.LoadData();
                }

                if(model.views[_this.Id].editUserPropertiesForm.Active)
                {
                    model.views[_this.Id].editUserPropertiesForm.LoadData();
                }
            },
            onRowClick: function (e) {
                if (Object.keys(_this.HighlightedRow).length > 0) {

                    var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
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

                _this.HighlightedRow[e.key] = e.data.NodeId;

                var rowIndex = e.component.getRowIndexByKey(Number(e.key));
                var rowElement = e.component.getRowElement(rowIndex)[0];
                _this.SetRowColor(rowElement, GlobalConstants.TableRowHighlightedColor);

                if (!(e.key in _this.SelectedRows)) {
                    //now manage selection in viewer
                    _this.Webviewer.selectionManager.clear();
                    for (var rowKey in _this.SelectedRows) {
                        _this.Webviewer.selectionManager.selectNode(
                            _this.SelectedRows[rowKey],
                            Communicator.SelectionMode.Add);
                    }

                    _this.Webviewer.selectionManager.selectNode(
                        e.data.NodeId,
                        Communicator.SelectionMode.Add);
                }
                _this.Webviewer.view.fitNodes([e.data.NodeId]);
            },
            onRowPrepared: function (e) {                
                if (_this.AvoidTableEvents ||
                    e.rowType !== "data") {
                    return;
                }

                if (SourceManagers[_this.Id].HiddenNodeIds.includes(e.data.NodeId)) {
                    var selectedRows = [e.rowElement[0]];
                    _this.HighlightHiddenRows(true, selectedRows);
                }

                // Updated row
                _this.AvoidTableEvents = true;
                if (e.key in _this.UpdateRequiredRows) {
                    var updateData = _this.UpdateRequiredRows[e.key];
                    var component = _this.Components[updateData.nodeId];
                   
                    e.component.cellValue(e.rowIndex, 0, component.Name);
                    e.component.cellValue(e.rowIndex, 1, component.MainComponentClass);
                    e.component.cellValue(e.rowIndex, 2, component.SubComponentClass);

                    delete _this.UpdateRequiredRows[e.key];
                    e.component.saveEditData();
                }
                _this.AvoidTableEvents = false;
                
            },
            onDisposing: function (e) {
                // enable events
                _this.TerminateEvents();

                model.views[_this.Id].tableViewInstance = null;

                _this.Webviewer.selectionManager.clear();

                _this.ListViewTableInstance = null;

                _this.SelectedRows = {};
                _this.HighlightedRow = {};

                _this.KeyVsTableItems = {};
                _this.NodeIdVsTableItems = {};
            }
        }).dxTreeList("instance");
    });
}

ListView.prototype.CacheItems = function (items) {
    for (var i = 0; i < items.length; i++) {
        this.IterateDataSourceRecursively(items[i]);
    }
}

ListView.prototype.IterateDataSourceRecursively = function (item) {

    this.NodeIdVsTableItems[item.data.NodeId] = item.key;
    this.KeyVsTableItems[item.key] = {
        "category": item.data.Category,
        "class": item.data.Class,
        "item": item.data.Item,
        "nodeId": item.data.NodeId,
        "parentKey": item.data.parentId,
        "hasChildren": item.hasChildren
    };

    if (item.hasChildren) {
        for (var i = 0; i < item.children.length; i++) {
            this.IterateDataSourceRecursively(item.children[i]);
        }
    }
}

ListView.prototype.SetRowColor = function (row, color) {
    row.style.backgroundColor = color;
}

ListView.prototype.InitEvents = function () {
    this.Webviewer.setCallbacks(this.ViewerCallbackMap);
}

ListView.prototype.TerminateEvents = function () {
    this.Webviewer.unsetCallbacks(this.ViewerCallbackMap);
}

ListView.prototype.OnSelectionFromViewer = function (selections) {
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
                this.Webviewer.selectionManager.selectNode(this.SelectedRows[rowKey],
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

ListView.prototype.GoToRow = function (rowKey) {
    var _this = this;

    _this.AvoidTableEvents = true;

    var itemHierarchy = [];
    _this.GetItemHierarchy(rowKey, itemHierarchy);
    itemHierarchy.reverse();

    var allPromises = [];
    for (var i = 0; i < itemHierarchy.length; i++) {
        var key = itemHierarchy[i];
        if (!_this.ListViewTableInstance.isRowExpanded(key)) {
            allPromises.push(_this.ListViewTableInstance.expandRow(key));
        }
    }

    Communicator.Util.waitForAll(allPromises);
    if (!_this.ListViewTableInstance.isRowSelected(rowKey)) {
        _this.ListViewTableInstance.selectRows([rowKey], true);
        _this.SelectedRows[rowKey] = _this.KeyVsTableItems[rowKey].nodeId;
    }

    _this.ListViewTableInstance.navigateToRow(rowKey);

    _this.AvoidTableEvents = false;
}

ListView.prototype.GetItemHierarchy = function (rowKey, itemHierarchy) {
    itemHierarchy.push(rowKey);

    var item = this.KeyVsTableItems[rowKey];

    if (item.parentKey && item.parentKey != 0) {
        this.GetItemHierarchy(item.parentKey, itemHierarchy);
    }
}

ListView.prototype.SelectValidNode = function (nodeId) {
    nodeId = this.Webviewer.model.getNodeParent(nodeId);
    if (nodeId === null) {
        return null;
    }

    if (nodeId in this.NodeIdVsTableItems) {
        this.Webviewer.selectionManager.selectNode(nodeId, Communicator.SelectionMode.Add);
        return nodeId;
    }
    else {
        this.SelectValidNode(nodeId);
    }

    return null;
}

ListView.prototype.CreateTableData = function (nodeId, parentNode, flat) {

    if (nodeId === null) {
        return null;
    }

    var rowData = this.GetRowData(nodeId, parentNode);
    if (!rowData) {
        return null;
    }

    if (!flat) {
        rowData["items"] = [];
    }
    else {
        this.TableData.push(rowData);
    }

    var children = this.Webviewer.model.getNodeChildren(nodeId);
    for (var i = 0; i < children.length; i++) {
        var childRowData = this.CreateTableData(children[i], nodeId, flat);
        if (!flat && childRowData) {
            rowData["items"].push(childRowData);
        }        
    }

    return rowData;
};

ListView.prototype.GetRowData = function (nodeId, parentNode) {
    //var _this = this;
    if (!(nodeId in this.Components)) {
        return null;
    }

    //add node properties to model browser table
    var nodeData = this.Components[nodeId];

    tableRowContent = {};

    tableRowContent[ModelBrowserColumnNames3D.Component] = nodeData.Name;
    tableRowContent[ModelBrowserColumnNames3D.MainClass] = (nodeData.MainComponentClass != undefined ? nodeData.MainComponentClass : "");
    tableRowContent[ModelBrowserColumnNames3D.SubClass] = (nodeData.SubComponentClass != undefined ? nodeData.SubComponentClass : "");
    tableRowContent[ModelBrowserColumnNames3D.NodeId] = (nodeData.NodeId != undefined ? nodeData.NodeId : "");
    tableRowContent["parent"] = parentNode;
    tableRowContent["rowId"] = this.CurrentRowId;
    this.CurrentRowId++;
    
    return tableRowContent;
}

ListView.prototype.GetSelectedNodeIds = function () {
    return Object.values(this.SelectedRows);
}

ListView.prototype.GetSelectedRowsFromNodeIds = function (selectedNodeIds) {
    var selectedRows = [];
    var treeList = $("#" + this.ModelBrowserContainer).dxTreeList("instance");

    for (var i = 0; i < selectedNodeIds.length; i++) {
        var nodeId = Number(selectedNodeIds[i]);
        if (!(nodeId in this.NodeIdVsTableItems)) {
            continue;
        }
        var rowKey = this.NodeIdVsTableItems[nodeId];
        var rowIndex = treeList.getRowIndexByKey(rowKey);

        if (rowIndex !== -1) {
            var row = treeList.getRowElement(rowIndex);
            selectedRows.push(row[0]);
        }
    }
    return selectedRows;
}

ListView.prototype.HighlightHiddenRowsFromNodeIds = function (isHide, nodeIds) {
    var selectedRows = this.GetSelectedRowsFromNodeIds(nodeIds);
    this.HighlightHiddenRows(isHide, selectedRows);
}

ListView.prototype.HighlightHiddenRows = function (isHide, selectedRows) {

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

ListView.prototype.ShowAllHiddenRows = function () {
    var sourceManager = SourceManagers[this.Id];
    this.HighlightHiddenRowsFromNodeIds(false, sourceManager.HiddenNodeIds)
    sourceManager.HiddenNodeIds = [];
}

ListView.prototype.GetAllSelectedRowNodeIds = function () {
    var selectedNodeIds = [];
    if (this.ListViewTableInstance) {
        var selectedRowsData = this.ListViewTableInstance.getSelectedRowsData()
        for (var i = 0; i < selectedRowsData.length; i++) {
            selectedNodeIds.push(selectedRowsData[i].NodeId);
        }
    }

    return selectedNodeIds;
}

ListView.prototype.GetSelectedComponents = function () {
    var selectedNodeIds = this.GetSelectedNodeIds();

    var selected = {};
    for (var i = 0; i < selectedNodeIds.length; i++) {
        var nodeId = selectedNodeIds[i];
        selected[nodeId] = this.Components[nodeId];
    }

    return selected;
}

function findItem(items, key, withIndex) {
    var item;
    for (var i = 0; i < items.length; i++) {
        item = items[i];
        if (item["rowId"] === key) {
            return withIndex ? { item, items, index: i } : item;
        }
        item = item.items && findItem(item.items, key, withIndex);
        if (item) {
            return item;
        }
    }
}