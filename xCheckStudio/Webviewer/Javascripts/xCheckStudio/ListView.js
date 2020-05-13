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
}
// assign ModelBrowser's method to this class
ListView.prototype = Object.create(ModelBrowser.prototype);
ListView.prototype.constructor = ListView;

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
    var tableData = this.CreateTableData(rootNode, -1, flat);
    if (!flat) {
        this.TableData = [tableData];
    }

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
            dataSource: _this.TableData,
            itemsExpr: "items",
            dataStructure: "tree",
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
                if (e.rowType !== "data") {
                    return;
                }

                if (SourceManagers[_this.Id].HiddenNodeIds.includes(e.data.NodeId)) {
                    var selectedRows = [e.rowElement[0]];
                    _this.HighlightHiddenRows(true, selectedRows);
                }
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

    if (item.parentKey != 0) {
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
        if (!flat) {
            rowData["items"].push(childRowData);
        }
        // else {
        //     this.TableData.push(childRowData);
        // }
    }

    return rowData;
};

ListView.prototype.GetRowData = function (nodeId, parentNode) {
    //var _this = this;
    if (!(nodeId in this.Components)) {
        return null;
    }

    // if (flat) {
    //     parentNode = -1;
    // }

    //add node properties to model browser table
    var nodeData = this.Components[nodeId];

    tableRowContent = {};

    tableRowContent[ModelBrowserColumnNames3D.Component] = nodeData.Name;
    tableRowContent[ModelBrowserColumnNames3D.MainClass] = (nodeData.MainComponentClass != undefined ? nodeData.MainComponentClass : "");
    tableRowContent[ModelBrowserColumnNames3D.SubClass] = (nodeData.SubComponentClass != undefined ? nodeData.SubComponentClass : "");
    tableRowContent[ModelBrowserColumnNames3D.NodeId] = (nodeData.NodeId != undefined ? nodeData.NodeId : "");
    tableRowContent["parent"] = parentNode;

    return tableRowContent;
    // this.TableData.push(tableRowContent);
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