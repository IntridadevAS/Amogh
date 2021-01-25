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
    this.CategoryClassHidden = false;
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

    this.Flat = true;
    this.ExcludeMembers = false;
    this.UndefinedHidden = false;
    _this.ContextMenu = null;
}
// assign ModelBrowser's method to this class
ListView.prototype = Object.create(ModelBrowser.prototype);
ListView.prototype.constructor = ListView;

ListView.prototype.UpdateComponents = function (componentsData) {
    var needsUpdate = false;

    var sourceManager = SourceManagers[this.Id];
    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceManager.SourceType);
    var nameProperty = "";
    var categoryProperty = "";
    var classProperty = "";
    if (identifierProperties !== null) {
        nameProperty = identifierProperties.name.replace("Intrida Data/", "");
        categoryProperty = identifierProperties.mainCategory.replace("Intrida Data/", "");
        classProperty = identifierProperties.subClass.replace("Intrida Data/", "");
    }

    for (var nodeId in this.Components) {
        var component = this.Components[nodeId];

        var rowData = {};
        rowData["componentName"] = component.Name;
        rowData["NodeId"] = Number(component.NodeId);
        for (var i = 0; i < component.properties.length; i++) {
            var property = component.properties[i];

            var columnDataField = property.Name.replace(/\s/g, '');
            rowData[columnDataField] = property.Value;

            if (this.ExistingColumnNames.indexOf(property.Name) === -1) {
                var column = {};
                column["caption"] = property.Name;
                column["dataField"] = columnDataField;
                column["visible"] = false;
                // if (("visibleColumns" in this.GroupTemplate) &&
                //     this.GroupTemplate.visibleColumns.indexOf(columnDataField) !== -1) {
                //     column["visible"] = true;
                // }

                this.Headers.push(column);
                this.ExistingColumnNames.push(property.Name)
            }
        }

        this.TableData.push(rowData);
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

ListView.prototype.Show = function (selectedComps) {
    this.Headers = [];
    this.TableData = [];
    this.ExistingColumnNames = [];
    // Create Headers
    this.CreateHeaders();

    // Create Table data
    var rootNode = this.Webviewer.model.getAbsoluteRootNode();

    this.CurrentRowId = 1;
    var tableData = this.CreateTableData(rootNode, -1, this.Flat);
    if (!this.Flat) {
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
    this.LoadTable(selectedComps);

    // set active table view type
    model.views[this.Id].activeTableView = GlobalConstants.TableView.List;
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

    var rowData = {};
    rowData["Item"] = nodeData.Name;
    rowData["Category"] = nodeData.MainComponentClass;
    rowData["Class"] = nodeData.SubComponentClass;
    rowData["NodeId"] = Number(nodeData.NodeId);
    for (var i = 0; i < nodeData.properties.length; i++) {
        var property = nodeData.properties[i];

        var columnDataField = property.Name.replace(/\s/g, '');
        rowData[columnDataField] = property.Value;

        if (this.ExistingColumnNames.indexOf(property.Name) === -1) {
            var column = {};
            column["caption"] = property.Name;
            column["dataField"] = columnDataField;
            column["visible"] = false;

            this.Headers.push(column);
            this.ExistingColumnNames.push(property.Name)
        }
    }
    rowData["rowId"] = this.CurrentRowId;
    //tableRowContent["rowId"] = this.CurrentRowId;
    this.CurrentRowId++;

    return rowData;
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
            // case ListViewColumns3D.Parent:
            //     visible = false;
            //     caption = ListViewColumnNames3D.Parent;
            //     break;
        }
        columnHeader["caption"] = caption;
        columnHeader["dataField"] = caption.replace(/\s/g, '');;
        columnHeader["width"] = width;
        columnHeader["visible"] = visible;
        columnHeader["showInColumnChooser"] = false;
        this.Headers.push(columnHeader);
    }
}

ListView.prototype.LoadTable = function (selectedComps) {

    // var loadingBrower = true;
    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;

    this.Clear();

    // set selection mode
    var selectionAttribute = {
        mode: "multiple",
        recursive: true,
    };
    if (_this.ExcludeMembers === true) {
        selectionAttribute = {
            mode: "multiple",
            recursive: false,
        };
    }

    $(function () {
        var loadingBrowser = true;
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
            dataStructure: "tree",
            keyExpr: "rowId",
            itemsExpr: "items",
            // parentIdExpr: ListViewColumnNames3D.Parent,
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
            selection: selectionAttribute,
            headerFilter: {
                visible: true
            },
            columnChooser: {
                enabled: false,
                allowSearch: true,
                mode: "select",
                title: "Property Columns",
            },
            onContentReady: function (e) {
                if (!loadingBrowser) {
                    return;
                }
                loadingBrowser = false;

                _this.AvoidViewerEvents = true;
                _this.AvoidTableEvents = true;

                _this.CacheItems(e.component.getDataSource().items());

                // initialize the context menu
                _this.ContextMenu = new ModelBrowserContextMenu(true);
                _this.ContextMenu.ModelBrowser = _this;

                _this.ShowItemCount(e.component.getDataSource().totalCount());

                // restore selected components
                if (selectedComps && selectedComps.length > 0) {
                    var selectedNodes = [];
                    for (var i = 0; i < selectedComps.length; i++) {
                        selectedNodes.push(Number(selectedComps[i].NodeId));
                    }
                    _this.RestoreSelectionFromComponents(selectedNodes);
                }

                _this.AvoidViewerEvents = false;
                _this.AvoidTableEvents = false;
            },
            onInitialized: function (e) {
                model.views[_this.Id].tableViewInstance = e.component;
                model.views[_this.Id].tableViewWidget = "treelist";

                document.getElementById("tableHeaderName" + _this.Id).innerText = GlobalConstants.TableView.List;

                // enable events
                _this.InitEvents();
            },
            onSelectionChanged: function (e) {
                if (_this.AvoidTableEvents) {
                    return;
                }

                _this.AvoidViewerEvents = true;

                var includeMember = SourceManagers[_this.Id].GetIncludeMember();

                var selected;
                var rowKeys;
                if (e.currentSelectedRowKeys.length > 0) {
                    selected = true;
                    rowKeys = e.currentSelectedRowKeys;
                }
                else {
                    selected = false;
                    rowKeys = e.currentDeselectedRowKeys;
                }

                _this.OnSelectRecurcively(rowKeys, selected, includeMember);

                if (model.views[_this.Id].editUserPropertiesForm.Active) {
                    model.views[_this.Id].editUserPropertiesForm.LoadData();
                }

                _this.AvoidViewerEvents = false;
            },
            onRowClick: function (e) {
                if (e.event.target.tagName.toLowerCase() === "span") {
                    return;
                }

                _this.AvoidViewerEvents = true;

                _this.UnHighlightRow();

                _this.HighlightRow(e.key, e.data.NodeId);

                _this.AvoidViewerEvents = false;
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
            onContextMenuPreparing: function (e) {
                if (e.row.rowType === "header") {
                    e.items = [
                        {
                            text: _this.ExcludeMembers ? "Include Members" : "Exclude Members",
                            disabled: _this.Flat,
                            onItemClick: function () {
                                _this.ExcludeMembers = !_this.ExcludeMembers;

                                e.component.option("selection.recursive", !_this.ExcludeMembers);

                                _this.SelectedRows = {};
                                let rowKeys = e.component.getSelectedRowKeys();
                                _this.OnSelectRecurcively(rowKeys, true, !_this.ExcludeMembers);
                            }
                        },
                        {
                            text: "Flat/Nested",
                            onItemClick: function () {
                                _this.Flat = !_this.Flat;
                                _this.Show();
                            }
                        },
                        {
                            text: "Edit Columns",
                            onItemClick: function () {
                                e.component.showColumnChooser();
                            }
                        },
                        {
                            text: _this.CategoryClassHidden ? "Show Category/Class" : "Hide Category/Class",
                            onItemClick: function () {

                                if (!_this.CategoryClassHidden) {
                                    $(containerDiv).dxTreeList("columnOption", "Item", "width", "100%");
                                    $(containerDiv).dxTreeList("columnOption", "Category", "visible", false);
                                    $(containerDiv).dxTreeList("columnOption", "Class", "visible", false);
                                }
                                else {
                                    $(containerDiv).dxTreeList("columnOption", "Category", "visible", true);
                                    $(containerDiv).dxTreeList("columnOption", "Class", "visible", true);
                                    $(containerDiv).dxTreeList("columnOption", "Item", "width", "40%");
                                    $(containerDiv).dxTreeList("columnOption", "Category", "width", "30%");
                                    $(containerDiv).dxTreeList("columnOption", "Class", "width", "30%");
                                }
                                _this.CategoryClassHidden = !_this.CategoryClassHidden;
                            }
                        }
                    ];
                }
                else if (e.row.rowType === "data") {
                    e.items = [
                        {
                            text: "Hide",
                            icon: "public/symbols/Hide.svg",
                            visible: _this.Webviewer,
                            onItemClick: function () {
                                _this.ContextMenu.OnMenuItemClicked("hide");
                            }
                        },
                        {
                            text: "Isolate",
                            icon: "public/symbols/Isolate.svg",
                            visible: _this.Webviewer,
                            onItemClick: function () {
                                _this.ContextMenu.OnMenuItemClicked("isolate");
                            }
                        },
                        {
                            text: "Show",
                            visible: _this.Webviewer,
                            onItemClick: function () {
                                _this.ContextMenu.OnMenuItemClicked("show");
                            }
                        },
                        {
                            text: "Translucency",
                            icon: "public/symbols/Transparency.svg",
                            visible: _this.Webviewer,
                            onItemClick: function () {
                                _this.ContextMenu.OnMenuItemClicked("translucency");
                            }
                        },
                        {
                            text: "Properties",
                            onItemClick: function () {
                                let rowsData = e.component.getSelectedRowsData();
                                if (rowsData.length === 0) {
                                    return;
                                }

                                let compData = null;
                                if (_this.Webviewer) {
                                    compData = {
                                        "name": rowsData[0].Item,
                                        "nodeId": rowsData[0].NodeId
                                    };
                                }
                                else {
                                    compData = rowsData[0];
                                }
                                _this.ContextMenu.OnMenuItemClicked("properties", compData);
                            }
                        },
                        {
                            text: "Reference",
                            onItemClick: function () {
                                _this.ContextMenu.OnMenuItemClicked("reference");
                            }
                        }
                    ];
                }
            },
            onDisposing: function (e) {
                // disable events
                _this.TerminateEvents();

                model.views[_this.Id].tableViewInstance = null;
                model.views[_this.Id].tableViewWidget = null;

                _this.Webviewer.selectionManager.clear();

                _this.ListViewTableInstance = null;
                _this.UndefinedHidden = false;

                _this.SelectedRows = {};
                _this.HighlightedRow = {};

                _this.KeyVsTableItems = {};
                _this.NodeIdVsTableItems = {};

                // if active selection is not single select
                if (model.views[_this.Id].activeSelection !== "Single Select") {
                    _this.Webviewer.operatorManager.set(Communicator.OperatorId.Select, 1);
                    model.views[_this.Id].activeSelection = "Single Select";
                }

                _this.ExcludeMembers = false;
                _this.ContextMenu = null;
                _this.ExistingColumnNames = [];
            }
        }).dxTreeList("instance");
    });
}

ListView.prototype.HighlightRow = function (rowKey, nodeId) {
    var _this = this;

    _this.HighlightedRow[rowKey] = nodeId;

    var rowIndex = this.ListViewTableInstance.getRowIndexByKey(Number(rowKey));
    var rowElement = this.ListViewTableInstance.getRowElement(rowIndex)[0];
    _this.SetRowColor(rowElement, GlobalConstants.TableRowHighlightedColor);

    if (!(rowKey in _this.SelectedRows)) {
        //now manage selection in viewer
        _this.Webviewer.selectionManager.clear();
        for (var rowKey in _this.SelectedRows) {
            _this.Webviewer.selectionManager.selectNode(
                _this.SelectedRows[rowKey],
                Communicator.SelectionMode.Add);
        }

        _this.Webviewer.selectionManager.selectNode(
            nodeId,
            Communicator.SelectionMode.Add);
    }
    _this.Webviewer.view.fitNodes([nodeId]);

    // property callout                
    if (nodeId in _this.Components) {
        SourceManagers[_this.Id].OpenPropertyCallout({
            "name": _this.Components[nodeId].Name,
            "nodeId": nodeId
        });
    }
}

ListView.prototype.UnHighlightRow = function () {
    var _this = this;

    if (Object.keys(_this.HighlightedRow).length > 0) {

        var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
        var rowIndex = this.ListViewTableInstance.getRowIndexByKey(oldRowKey);
        var rowElement = this.ListViewTableInstance.getRowElement(rowIndex)[0];
        if (oldRowKey in _this.SelectedRows) {
            _this.SetRowColor(rowElement, GlobalConstants.TableRowSelectedColor);
        }
        else {
            _this.SetRowColor(rowElement, GlobalConstants.TableRowNormalColor);
        }
        delete _this.HighlightedRow[oldRowKey];
    }
}

ListView.prototype.RestoreSelectionFromComponents = function (selectedNodes) {
    var rootNode = this.ListViewTableInstance.getRootNode();

    this.Webviewer.selectionManager.clear();

    if (rootNode.hasChildren === true) {
        for (var i = 0; i < rootNode.children.length; i++) {
            this.RestoreSelectionRecurcively(selectedNodes, rootNode.children[i]);
        }
    }
}

ListView.prototype.RestoreSelectionRecurcively = function (selectedNodes, rowNode) {
    if (("data" in rowNode) &&
        ("NodeId" in rowNode.data)) {
        var index = selectedNodes.indexOf(rowNode.data.NodeId);
        if (index !== -1) {
            this.SelectedRows[rowNode.key] = rowNode.data.NodeId;

            this.ListViewTableInstance.selectRows([rowNode.key], true);
            this.Webviewer.selectionManager.selectNode(rowNode.data.NodeId, Communicator.SelectionMode.Add);
        }
    }

    if (rowNode.hasChildren) {
        for (var i = 0; i < rowNode.children.length; i++) {
            this.RestoreSelectionRecurcively(selectedNodes, rowNode.children[i]);
        }
    }
}

ListView.prototype.OnIncludeMembers = function (include) {
    var rowKeys = this.ListViewTableInstance.getSelectedRowKeys();

    this.SelectedRows = {};

    this.OnSelectRecurcively(rowKeys, true, include);
}

ListView.prototype.OnSelectRecurcively = function (rowKeys,
    selected,
    recursive) {
    if (!this.ListViewTableInstance) {
        return;
    }

    this.AvoidViewerEvents = true;
    this.AvoidTableEvents = true;

    for (var i = 0; i < rowKeys.length; i++) {
        var rowKey = Number(rowKeys[i]);
        this.SelectRecurcively(rowKey, selected, recursive);
    }

    // manage GA selection, if components are deselected from table
    if (selected === false) {
        this.Webviewer.selectionManager.clear();
        for (var rowKey in this.SelectedRows) {
            this.Webviewer.selectionManager.selectNode(this.SelectedRows[rowKey],
                Communicator.SelectionMode.Add);
        }
    }

    this.AvoidViewerEvents = false;
    this.AvoidTableEvents = false;
}

ListView.prototype.SelectRecurcively = function (rowKey, selected, recursive) {
    var node = this.ListViewTableInstance.getNodeByKey(rowKey);
    if (selected) {
        this.SelectedRows[rowKey] = node.data.NodeId;

        this.Webviewer.selectionManager.selectNode(node.data.NodeId, Communicator.SelectionMode.Add);
    }
    else {
        if (rowKey in this.SelectedRows) {
            delete this.SelectedRows[rowKey];
        }
    }

    if (recursive === true && node.hasChildren === true) {
        for (var i = 0; i < node.children.length; i++) {
            // this.ListViewTableInstance.selectRows([node.children[i].key], true);
            this.SelectRecurcively(node.children[i].key, selected, recursive);
        }
    }
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
        "parentKey": item.parent.key,
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
    _this.AvoidViewerEvents = true;

    if (_this.Flat) {
        _this.UnHighlightRow();
        _this.HighlightRow(rowKey, _this.KeyVsTableItems[rowKey].nodeId);

        _this.ListViewTableInstance.navigateToRow(rowKey);
    }
    else {
        var itemHierarchy = [];
        _this.GetItemHierarchy(rowKey, itemHierarchy);
        itemHierarchy.reverse();

        // var allPromises = [];
        for (var i = 0; i < itemHierarchy.length; i++) {
            var key = itemHierarchy[i];
            if (!_this.ListViewTableInstance.isRowExpanded(key)) {
                // allPromises.push(_this.ListViewTableInstance.expandRow(key));
                _this.ListViewTableInstance.expandRow(key).done(function (res) {
                    _this.UnHighlightRow();
                    _this.HighlightRow(rowKey, _this.KeyVsTableItems[rowKey].nodeId);

                    _this.ListViewTableInstance.navigateToRow(key);

                });
            }
            else {
                if (key === rowKey) {
                    _this.UnHighlightRow();
                    _this.HighlightRow(rowKey, _this.KeyVsTableItems[rowKey].nodeId);
                }
                _this.ListViewTableInstance.navigateToRow(key);
            }
        }
    }


    // _this.UnHighlightRow();
    // _this.HighlightRow(rowKey, _this.KeyVsTableItems[rowKey].nodeId);
    // if (!_this.ListViewTableInstance.isRowSelected(rowKey)) {
    //     _this.ListViewTableInstance.selectRows([rowKey], true);
    //     _this.SelectedRows[rowKey] = _this.KeyVsTableItems[rowKey].nodeId;
    // }

    _this.AvoidTableEvents = false;
    _this.AvoidViewerEvents = false;
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

// ListView.prototype.GetAllSelectedRowNodeIds = function () {
//     var selectedNodeIds = [];
//     if (this.ListViewTableInstance) {
//         var selectedRowsData = this.ListViewTableInstance.getSelectedRowsData()
//         for (var i = 0; i < selectedRowsData.length; i++) {
//             selectedNodeIds.push(selectedRowsData[i].NodeId);
//         }
//     }

//     return selectedNodeIds;
// }

ListView.prototype.GetSelectedComponents = function () {
    var selectedNodeIds = this.GetSelectedNodeIds();

    var selected = {};
    for (var i = 0; i < selectedNodeIds.length; i++) {
        var nodeId = selectedNodeIds[i];
        selected[nodeId] = this.Components[nodeId];
    }

    return selected;
}

ListView.prototype.GetSelectedNodeIds = function () {
    return Object.values(this.SelectedRows);
}

ListView.prototype.GetSelectedComponentIds = function () {
    var nodeIds = this.GetSelectedNodeIds();
    var selectedCompIds = [];

    var sourceManager = SourceManagers[this.Id];
    for (var i = 0; i < nodeIds.length; i++) {
        var nodeId = nodeIds[i];

        selectedCompIds.push(sourceManager.GetCompIdByNodeId(nodeId));
    }

    return selectedCompIds;
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