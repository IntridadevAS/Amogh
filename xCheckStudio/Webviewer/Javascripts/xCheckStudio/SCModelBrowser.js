function SCModelBrowser(id,
    modelBrowserContainer,
    viewer,
    sourceType,
    nodeIdvsSelectedComponents) {

    // call super constructor
    ModelBrowser.call(this, id, modelBrowserContainer);

    this.Components;
    this.Webviewer = viewer;
    this.SourceType = sourceType;

    this.modelTreeRowData = [];

    this.ModelBrowserAddedNodes = [];
    this.NodeParentList = {};

    // selectiion manager
    this.SelectionManager = new SCSelectionManager(nodeIdvsSelectedComponents);
}

// assign ModelBrowser's method to this class
SCModelBrowser.prototype = Object.create(ModelBrowser.prototype);
SCModelBrowser.prototype.constructor = SCModelBrowser;

SCModelBrowser.prototype.CreateHeaders = function () {
    var columnHeaders = [];
    for (var i = 0; i < Object.keys(ModelBrowserColumns3D).length; i++) {
        var columnHeader = {};
        var caption;
        var width = "0%";
        var visible = true;
        switch (i) {
            case ModelBrowserColumns3D.Select:
                continue;
                break;
            case ModelBrowserColumns3D.Component:
                width = "40%";
                caption = ModelBrowserColumnNames3D.Component;
                break;
            case ModelBrowserColumns3D.MainClass:
                width = "30%";
                caption = ModelBrowserColumnNames3D.MainClass;
                break;
            case ModelBrowserColumns3D.SubClass:
                width = "30%";
                caption = ModelBrowserColumnNames3D.SubClass;
                break;
            case ModelBrowserColumns3D.NodeId:
                visible = false;
                caption = ModelBrowserColumnNames3D.NodeId;
                break;
            case ModelBrowserColumns3D.Parent:
                visible = false;
                caption = ModelBrowserColumnNames3D.Parent;
                break;
        }
        columnHeader["caption"] = caption;
        columnHeader["dataField"] = caption.replace(/\s/g, '');;
        columnHeader["width"] = width;
        columnHeader["visible"] = visible;
        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}

SCModelBrowser.prototype.addComponentRow = function (nodeId, parentNode) {
    //var _this = this;
    if (!(nodeId in this.Components)) {
        return;
    }

    //add node properties to model browser table
    var nodeData = this.Components[nodeId];
    if (!nodeData.Name ||
        !nodeData.MainComponentClass ||
        !nodeData.SubComponentClass) {
        return;
    }

    if (!this.ModelBrowserAddedNodes.includes(parentNode)) {
        parentNode = -4;
    }
    this.ModelBrowserAddedNodes.push(nodeId);

    this.NodeParentList[nodeId] = parentNode;    

    // //add node properties to model browser table
    // var nodeData = this.Components[nodeId];

    tableRowContent = {};

    tableRowContent[ModelBrowserColumnNames3D.Component] = nodeData.Name;
    tableRowContent[ModelBrowserColumnNames3D.MainClass] = (nodeData.MainComponentClass != undefined ? nodeData.MainComponentClass : "");
    tableRowContent[ModelBrowserColumnNames3D.SubClass] = (nodeData.SubComponentClass != undefined ? nodeData.SubComponentClass : "");
    tableRowContent[ModelBrowserColumnNames3D.NodeId] = (nodeData.NodeId != undefined ? Number(nodeData.NodeId) : "");
    tableRowContent["parent"] = parentNode;

    this.modelTreeRowData.push(tableRowContent);
}

SCModelBrowser.prototype.SelectedCompoentExists = function (componentRow) {
    //return this.SelectionManager.SelectedCompoentExists(componentRow);
}

SCModelBrowser.prototype.AddComponentTable = function (components, selectedNodeIds = []) {
    if (!components) {
        return;
    }
    this.modelTreeRowData = [];

    this.Components = components;
    var headers = this.CreateHeaders();
    var rootNode = this.Webviewer.model.getAbsoluteRootNode();
    this.AddComponentTableComponent(rootNode, -1);
    if (headers === undefined ||
        headers.length === 0 ||
        this.modelTreeRowData === undefined ||
        this.modelTreeRowData.length === 0) {
        return;
    }

    this.loadModelBrowserTable(headers, selectedNodeIds);
};

SCModelBrowser.prototype.AddComponentTableComponent = function (nodeId, parentNode) {

    if (nodeId !== null) {
        var children = this.Webviewer.model.getNodeChildren(nodeId);
        // if (children.length > 0) {
            this.addComponentRow(nodeId, parentNode);
            for (var i = 0; i < children.length; i++) {
                this.AddComponentTableComponent(children[i], nodeId);
            }
        // }
    }
}

SCModelBrowser.prototype.loadModelBrowserTable = function (columnHeaders, selectedNodeIds) {

    var loadingBrower = true;
    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;
    this.Clear();
    $(function () {
        $(containerDiv).dxTreeList({
            dataSource: _this.modelTreeRowData,
            keyExpr: "NodeId",
            parentIdExpr: "parent",
            rootValue: -4,
            columns: columnHeaders,
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
            onContentReady: function (e) {
                if (loadingBrower === false) {
                    return;
                }
                loadingBrower = false;

                // Restore selections

                // if from saved data
                if (_this.SelectionManager.NodeIdvsSelectedComponents) {
                    e.component.selectRows(Object.keys(_this.SelectionManager.NodeIdvsSelectedComponents));

                    // clear as this is required only first time when data is being loaded from saved checkspace db
                    _this.SelectionManager.NodeIdvsSelectedComponents = {};
                }

                // if from other table views
                if (selectedNodeIds && selectedNodeIds.length > 0) {
                    e.component.selectRows(selectedNodeIds);
                }               
                
                // show table view action button
                document.getElementById("tableViewAction" + _this.Id).style.display = "block";
            },
            onInitialized: function (e) {                
                model.views[_this.Id].tableViewInstance = e.component;  
                model.views[_this.Id].tableViewWidget = "treelist";

                // initialize the context menu
                var modelBrowserContextMenu = new ModelBrowserContextMenu();
                modelBrowserContextMenu.Init(_this);
                _this.ShowItemCount(_this.modelTreeRowData.length);

                 // set active table view type
                model.views[_this.Id].activeTableView = GlobalConstants.TableView.DataBrowser;
                document.getElementById("tableHeaderName" + _this.Id).innerText = GlobalConstants.TableView.DataBrowser;
            },
            onSelectionChanged: function (e) {
                var checkBoxStatus;
                var clickedCheckBoxRowKeys;
                if (e.currentSelectedRowKeys.length > 0) {
                    checkBoxStatus = "on";
                    clickedCheckBoxRowKeys = e.currentSelectedRowKeys;
                }
                else {
                    checkBoxStatus = "off";
                    clickedCheckBoxRowKeys = e.currentDeselectedRowKeys;
                }
                _this.OnComponentSelected(clickedCheckBoxRowKeys,
                    checkBoxStatus,
                    e.component,
                    containerDiv);
            },
            onRowClick: function (e) {
                _this.SelectionManager.OnComponentRowClicked(e, _this.Webviewer, e.data.NodeId, _this.ModelBrowserContainer);

                // property call out      
                SourceManagers[_this.Id].OpenPropertyCallout(e.data.Item, e.data.NodeId);
            },
            onRowPrepared: function (e) {
                if (e.rowType !== "data") {
                    return;
                }

                if (e.isSelected) {
                    _this.SelectionManager.ApplyHighlightColor(e.rowElement[0])
                }

                if (_this.Id in SourceManagers) {
                    if (SourceManagers[_this.Id].HiddenNodeIds.includes(e.data.NodeId)) {
                        var selectedRows = [e.rowElement[0]];
                        _this.HighlightHiddenRows(true, selectedRows);
                    }
                }
            },
            onDisposing: function (e) {
                _this.SelectionManager.SelectedComponentIds = [];
                _this.SelectionManager.SelectedCompoents = [];
                _this.SelectionManager.HighlightedComponentRow = null;
                _this.SelectionManager.HighlightedComponentRowKey = null;

                model.views[_this.Id].tableViewInstance = null;  
                model.views[_this.Id].tableViewWidget = null;
            }
        });
    });
}

SCModelBrowser.prototype.GetSelectedRowsFromNodeIds = function (selectedNodeIds) {
    var selectedRows = [];
    var treeList = $("#" + this.ModelBrowserContainer).dxTreeList("instance");

    for (var i = 0; i < selectedNodeIds.length; i++) {
        var nodeId = Number(selectedNodeIds[i]);

        var rowIndex = treeList.getRowIndexByKey(nodeId);

        if (rowIndex !== -1) {
            var row = treeList.getRowElement(rowIndex);
            selectedRows.push(row[0]);
        }
    }
    return selectedRows;
}

SCModelBrowser.prototype.HighlightHiddenRowsFromNodeIds = function (isHide, nodeIds) {
    var selectedRows = this.GetSelectedRowsFromNodeIds(nodeIds);
    this.HighlightHiddenRows(isHide, selectedRows);
}

SCModelBrowser.prototype.HighlightHiddenRows = function (isHide, selectedRows) {

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

SCModelBrowser.prototype.ShowAllHiddenRows = function () {
    var selectedRows = [];
    var sourceManager = SourceManagers[this.Id];
    this.HighlightHiddenRowsFromNodeIds(false, sourceManager.HiddenNodeIds)
  
     sourceManager.HiddenNodeIds = [];   
}

SCModelBrowser.prototype.OnComponentSelected = function (clickedCheckBoxRowKeys,
    checkBoxStatus,
    componentObj,
    containerDiv) {

    for (var i = 0; i < clickedCheckBoxRowKeys.length; i++) {
        // componentObj.expandRow(clickedCheckBoxRowKeys[i]);
        var nodeObj = componentObj.getNodeByKey(clickedCheckBoxRowKeys[i]);
        var row = componentObj.getRowElement(componentObj.getRowIndexByKey(nodeObj.key));
        this.SelectionManager.SelectComponent(row[0], checkBoxStatus, nodeObj.data, containerDiv);
        if (nodeObj.hasChildren) {
            var children = this.GetSelectedChildren(componentObj, nodeObj);
            for (var j = 0; j < children.length; j++) {
                row = componentObj.getRowElement(componentObj.getRowIndexByKey(children[j].key));
                this.SelectionManager.SelectComponent(row[0], checkBoxStatus, children[j].data, containerDiv);
            }
        }
    }
}

SCModelBrowser.prototype.OnBrowserNodeSelected = function (clickedCheckBoxRowKeys,
    checkBoxStatus,
    rowComponent,
    containerDiv) {

    for (var i = 0; i < clickedCheckBoxRowKeys.length; i++) {
        var nodeObj = rowComponent.getNodeByKey(clickedCheckBoxRowKeys[i]);
        var row = rowComponent.getRowElement(rowComponent.getRowIndexByKey(nodeObj.key));
        this.SelectionManager.SelectBrowserItem(row[0], checkBoxStatus, nodeObj.data, containerDiv);       
    }
}

SCModelBrowser.prototype.GetSelectedChildren = function (componentObj, node) {
    var children = []
    for (var i = 0; i < node.children.length; i++) {
        var child = node.children[i];
        if (child.hasChildren) {
            var ChildrenComponents = this.GetSelectedChildren(componentObj, child);
            for (var j = 0; j < ChildrenComponents.length; j++) {
                children.push(ChildrenComponents[j]);
            }
        }
        children.push(child);
    }
    return children;
}

SCModelBrowser.prototype.GetNodeChildren = function (nodeId) {
    var nodeList = [];
    var treeList = $("#" + this.ModelBrowserContainer).dxTreeList("instance");
    var nodeObj = treeList.getNodeByKey(nodeId);
    var children = this.GetSelectedChildren(treeList, nodeObj);
    for (var i = 0; i < children.length; i++) {
        nodeList.push(children[i].key);
    }
    return nodeList;
}

SCModelBrowser.prototype.isAssemblyNode = function (nodeId) {
    var nodeType = this.Webviewer.model.getNodeType(nodeId);
    if (nodeType == Communicator.NodeType.AssemblyNode) {
        return true;
    }
    else {
        return false;
    }
};

SCModelBrowser.prototype.HighlightComponentRow = function (selectedNodeId) {

    var path = {};
    path['path'] = [selectedNodeId];
    this.GetTopMostParentNode(selectedNodeId, path);

    this.OpenHighlightedRow(path, selectedNodeId);
}

SCModelBrowser.prototype.GetSelectedComponents = function () {
    return this.SelectionManager.GetSelectedComponents();
}

SCModelBrowser.prototype.AddSelectedComponent = function (checkedComponent) {
    this.SelectionManager.AddSelectedComponent(checkedComponent);
}

SCModelBrowser.prototype.ClearSelectedComponent = function () {
    this.SelectionManager.ClearSelectedComponent();
}

SCModelBrowser.prototype.GetSelectedNodeIds = function () {
    return this.SelectionManager.SelectedComponentIds;
}

SCModelBrowser.prototype.OpenHighlightedRow = function (path, selectedNodeId) {

    _this = this;
    if (!('path' in path)) {
        return;
    }
    var nodeList = path['path'];
    nodeList = nodeList.reverse();

    var treeList = $("#" + this.ModelBrowserContainer).dxTreeList("instance")


    // expand tree if not expanded else select row using key
    for (var i = 0; i < nodeList.length; i++) {
        var node = nodeList[i];

        if (!treeList.isRowExpanded(node)) {
            treeList.expandRow(node).done(function () {
                _this.GetComponentRowFromNodeId(selectedNodeId, _this.ModelBrowserContainer);
            });
        }
        else {
            if (i == nodeList.length - 1) {
                this.GetComponentRowFromNodeId(selectedNodeId, this.ModelBrowserContainer);
            }
        }

    }
}

SCModelBrowser.prototype.GetTopMostParentNode = function (rowKey, path) {

    if (rowKey in this.NodeParentList) {

        if (this.NodeParentList[rowKey] === 0) {
            return;
        }
        path['path'].push(this.NodeParentList[rowKey])

        this.GetTopMostParentNode(this.NodeParentList[rowKey], path);
    }
}

SCModelBrowser.prototype.GetComponentRowFromNodeId = function (selectedNodeId, containerDiv) {

    var treeList = $("#" + containerDiv).dxTreeList("instance");

    //navigate scrollbar to specified row using key
    treeList.navigateToRow(selectedNodeId);
    // treeList.navigateToRow(selectedNodeId).done(function () {
    var rowIndex = treeList.getRowIndexByKey(selectedNodeId);
    row = treeList.getRowElement(rowIndex);
    _this.SelectionManager.OnComponentRowClicked(row[0], undefined, selectedNodeId, _this.ModelBrowserContainer);
    // });
}

SCModelBrowser.prototype.AddModelBrowser = function () {  
    this.modelTreeRowData =[];
    this.GetModelTreeData(this.Webviewer.model.getAbsoluteRootNode(), -1);
    if (this.modelTreeRowData.length === 0) {
        return;
    }

    // create headers
    var columnHeaders = [];

    var columnHeader = {};
    columnHeader["caption"] = "Name";
    columnHeader["dataField"] = "Name";
    columnHeader["width"] = "100%";
    columnHeader["visible"] = true;

    columnHeaders.push(columnHeader);

    var columnHeader = {};
    columnHeader["caption"] = "NodeId";
    columnHeader["dataField"] = "NodeId";
    columnHeader["width"] = "0%";
    columnHeader["visible"] = false;

    columnHeaders.push(columnHeader);

    var columnHeader = {};
    columnHeader["caption"] = "ParentNodeId";
    columnHeader["dataField"] = "ParentNodeId";
    columnHeader["width"] = "0%";
    columnHeader["visible"] = false;

    columnHeaders.push(columnHeader);

    // Load model browser tree    
    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;
    this.Clear();
    $(function () {
        var loadingBrowser = true;
        $(containerDiv).dxTreeList({
            dataSource: _this.modelTreeRowData,
            keyExpr: "NodeId",
            parentIdExpr: "ParentNodeId",
            columns: columnHeaders,
            columnAutoWidth: true,
            columnResizingMode: 'widget',
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            height: "100%",
            width: "100%",
            allowColumnResizing: true,
            hoverStateEnabled: true,
            // focusedRowEnabled: true,
            filterRow: {
                visible: true
            },
            scrolling: {
                mode: "standard"
            },
            paging: {
                pageSize: 50
            },
            selection: {
                mode: "multiple",
                recursive: true,
            },
            onContentReady: function (e) {
                if (loadingBrowser === false) {
                    return;
                }
                loadingBrowser = false;

                // show table view action button
                document.getElementById("tableViewAction" + _this.Id).style.display = "block";
            },
            onInitialized: function (e) {
                model.views[_this.Id].tableViewInstance = e.component;  
                model.views[_this.Id].tableViewWidget = "treelist";

                // initialize the context menu
                var modelBrowserContextMenu = new ModelBrowserContextMenu(false);
                modelBrowserContextMenu.Init(_this);
                
                _this.ShowItemCount(_this.modelTreeRowData.length);

                // set active table view type
                model.views[_this.Id].activeTableView = GlobalConstants.TableView.DataBrowser;
                document.getElementById("tableHeaderName" + _this.Id).innerText = GlobalConstants.TableView.DataBrowser;
            },
            onSelectionChanged: function (e) {
                var checkBoxStatus;
                var clickedCheckBoxRowKeys;
                if (e.currentSelectedRowKeys.length > 0) {
                    checkBoxStatus = "on";
                    clickedCheckBoxRowKeys = e.currentSelectedRowKeys;
                }
                else {
                    checkBoxStatus = "off";
                    clickedCheckBoxRowKeys = e.currentDeselectedRowKeys;
                }
                _this.OnBrowserNodeSelected(clickedCheckBoxRowKeys,
                    checkBoxStatus,
                    e.component,
                    containerDiv);
            },
            onRowClick: function (e) {
                _this.SelectionManager.OnBrowserRowClicked(e, _this.Webviewer, e.data.NodeId, _this.ModelBrowserContainer);

                 // property call out    
                 SourceManagers[_this.Id].OpenPropertyCallout(e.data.Name, e.data.NodeId);
            },
            onRowPrepared: function (e) {
            },
            onDisposing: function (e) {
                _this.SelectionManager.SelectedComponentIds = [];
                _this.SelectionManager.SelectedCompoents = [];
                _this.SelectionManager.HighlightedComponentRow = null;
                _this.SelectionManager.HighlightedComponentRowKey = null;
            }
        });
    });

}

SCModelBrowser.prototype.GetModelTreeData = function (nodeId, parentNodeId) {
    var name = this.Webviewer.model.getNodeName(nodeId)

    var data = {};
    data["Name"] = name;
    data["NodeId"] = nodeId;
    data["ParentNodeId"] = parentNodeId;
    this.modelTreeRowData.push(data);
    
    this.NodeParentList[nodeId] = parentNodeId;

    var children = this.Webviewer.model.getNodeChildren(nodeId);
    if (children.length > 0) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            this.GetModelTreeData(child, nodeId);
        }
    }
}

SCModelBrowser.prototype.GetModelStructure = function (nodeId, parentNodeId) {
    var name = this.Webviewer.model.getNodeName(nodeId)

    var structure = {};
    structure["name"] = name;
    structure["nodeId"] = nodeId;
    structure["parenNodeId"] = parentNodeId;
    structure["children"] = [];

    var children = this.Webviewer.model.getNodeChildren(nodeId);
    if (children.length > 0) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var childStructure = this.GetModelStructure(child, nodeId);

            structure["children"].push(childStructure);
        }
    }

    return structure;
}
