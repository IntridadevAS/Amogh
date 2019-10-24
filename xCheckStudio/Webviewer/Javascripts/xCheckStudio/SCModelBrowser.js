//var modelBrowserCheckColumn = 0;
//var modelBrowserComponentColumn = 1;
//var modelBrowserMainClassColumn = 2;
//var modelBrowserSubClassColumn = 3;
// var modelBrowserSourceColumn = 4;
// var modelBrowserDestinationColumn = 5;
// var modelBrowserOwnerColumn = 6;
//var modelBrowserNodeIdColumn = 4;

function SCModelBrowser(modelBrowserContainer,
    viewer,
    sourceType,
    nodeIdvsSelectedComponents) {

    // call super constructor
    ModelBrowser.call(this, modelBrowserContainer);

    this.Components;
    this.Webviewer = viewer;
    this.SourceType = sourceType;

    //this.NodeIdVsCellClassList = {};
    //this.NodeIdVsRowClassList = {};
    //this.modelTreeColumnHeaders = [];
    this.modelTreeRowData = [];

    this.ModelBrowserAddedNodes = [];
    this.NodeParentList = {};
    //this.NodeGroups = [];

    // this.CreateHeaders();
    //this.InitEvents();

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
        switch(i)
        {
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
/*Found Absolute Method on 23/10/2019. Can be removed later..RK
/*SCModelBrowser.prototype.InitEvents = function () {
    var _this = this;
    this.Webviewer.setCallbacks({
        assemblyTreeReady: function () {
        },
        selectionArray: function (selectionEvents) {
            for (var _i = 0, selectionEvents_1 = selectionEvents; _i < selectionEvents_1.length; _i++) {
                var selectionEvent = selectionEvents_1[_i];
                var selection = selectionEvent.getSelection();
                if (selection.isNodeSelection()) {
                    var nodeId = selection.getNodeId();
                    var model = _this.Webviewer.model;
                    if (model.isNodeLoaded(nodeId)) {
                    }
                }
            }
        }
    });
};*/

SCModelBrowser.prototype.revisedRandId = function () {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

SCModelBrowser.prototype.addComponentRow = function (nodeId, parentNode) {
    //var _this = this;
    if (!(nodeId in this.Components)) {
        return;
    }

    if (!this.ModelBrowserAddedNodes.includes(parentNode)) {
        parentNode = 0;
    }
    this.ModelBrowserAddedNodes.push(nodeId);

    this.NodeParentList[nodeId] = parentNode;
    // if (styleList !== undefined) {
    //     this.NodeIdVsRowClassList[nodeId] = styleList;
    // }

    //add node properties to model browser table
    var nodeData = this.Components[nodeId];


    tableRowContent = {};

    tableRowContent[ModelBrowserColumnNames3D.Component] = nodeData.Name;
    tableRowContent[ModelBrowserColumnNames3D.MainClass] = (nodeData.MainComponentClass != undefined ? nodeData.MainComponentClass : "");
    tableRowContent[ModelBrowserColumnNames3D.SubClass] = (nodeData.SubComponentClass != undefined ? nodeData.SubComponentClass : "");
    tableRowContent[ModelBrowserColumnNames3D.NodeId] = (nodeData.NodeId != undefined ? nodeData.NodeId : "");
    tableRowContent["parent"] = parentNode;

    this.modelTreeRowData.push(tableRowContent);
}

SCModelBrowser.prototype.SelectedCompoentExists = function (componentRow) {
    //return this.SelectionManager.SelectedCompoentExists(componentRow);
}

SCModelBrowser.prototype.addModelBrowser = function (components) {
    if (!components) {
        return;
    }

    this.Components = components;
    var headers = this.CreateHeaders();
    var rootNode = this.Webviewer.model.getAbsoluteRootNode();
    this.addModelBrowserComponent(rootNode, -1);    
    if (headers === undefined ||
        headers.length === 0 ||
        this.modelTreeRowData === undefined ||
        this.modelTreeRowData.length === 0) {
        return;
    }

    this.loadModelBrowserTable(headers);
};

SCModelBrowser.prototype.addModelBrowserComponent = function (nodeId, parentNode) {

    if (nodeId !== null) {
        var children = this.Webviewer.model.getNodeChildren(nodeId);
        if (children.length > 0) {
            this.addComponentRow(nodeId, parentNode);
            for (var i = 0; i < children.length; i++) {
                this.addModelBrowserComponent(children[i], nodeId);
            }
        }
    }

};

SCModelBrowser.prototype.Clear = function () {
    var containerDiv = "#" + this.ModelBrowserContainer;

    var browserContainer = document.getElementById(this.ModelBrowserContainer);
    var parent = browserContainer.parentElement;

    //remove html element which holds grid
    //devExtreme does not have destroy method. We have to remove the html element and add it again to create another table
    $(containerDiv).remove();

    //Create and add div with same id to add grid again
    var browserContainerDiv = document.createElement("div")
    browserContainerDiv.id = this.ModelBrowserContainer;
    var styleRule = ""
    styleRule = "position: relative";
    browserContainerDiv.setAttribute("style", styleRule);
    parent.appendChild(browserContainerDiv);
    // clear count
    this.GetItemCountDiv().innerHTML = "";
}

SCModelBrowser.prototype.loadModelBrowserTable = function (columnHeaders) {

    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;
    // this.Clear();
    $(function () {
        $(containerDiv).dxTreeList({
            dataSource: _this.modelTreeRowData,
            keyExpr: "NodeId",
            parentIdExpr: "parent",
            columns: columnHeaders,
            columnAutoWidth: true,
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            height: "100%",
            width: "100%",
            allowColumnResizing : true,
            hoverStateEnabled: true,
            // focusedRowEnabled: true,
            filterRow: {
                visible: true
            },
            scrolling: {
                mode: "virtual",
                rowRenderingMode: "virtual"
            },
            paging: {
                 pageSize: 50
            },
            selection: {
                mode: "multiple",
                recursive: true,
            },  
            onInitialized: function(e) {
                // initialize the context menu
                var modelBrowserContextMenu = new ModelBrowserContextMenu();
                modelBrowserContextMenu.Init(_this);
                _this.ShowItemCount(_this.modelTreeRowData.length);
            },
            onSelectionChanged: function (e) {
                var checkBoxStatus;
                var clickedCheckBoxRowKeys;
                if(e.currentSelectedRowKeys.length > 0) {
                    checkBoxStatus  = "on";
                    clickedCheckBoxRowKeys = e.currentSelectedRowKeys;
                }
                else {
                    checkBoxStatus = "off";
                    clickedCheckBoxRowKeys = e.currentDeselectedRowKeys;
                }
                _this.UpdateSelectionComponentFromCheckBox(clickedCheckBoxRowKeys, checkBoxStatus, e.component, containerDiv);
            },
            onRowClick: function(e) {
                _this.SelectionManager.HandleRowSelect(e, _this.Webviewer, e.data.NodeId, _this.ModelBrowserContainer);
            },
            onRowPrepared: function(e) {
                if(e.isSelected) {
                    _this.SelectionManager.ApplyHighlightColor(e.rowElement[0])
                }
                if(e.rowType == "data" && SourceManagers[model.currentTabId].HiddenNodeIds.includes(e.data.NodeId)) {
                    var selectedRows = [e.rowElement[0]];
                    _this.HighlightHiddenRows(true, selectedRows);
                }
            }
        });
    });
}


SCModelBrowser.prototype.GetSelectedRowsFromNodeIds = function(selectedNodeIds) {
    var selectedRows = [];
    var treeList = $("#" + this.ModelBrowserContainer).dxTreeList("instance");

    for(var i = 0; i < selectedNodeIds.length; i++) {
        var nodeId = Number(selectedNodeIds[i]);

        var  rowIndex = treeList.getRowIndexByKey(nodeId);

        if(rowIndex !== -1) {
            var row = treeList.getRowElement(rowIndex);
            selectedRows.push(row[0]);
        }
    }
    return selectedRows;
}

SCModelBrowser.prototype.HighlightHiddenRows = function(isHide, selectedRows) {
    for (var i = 0; i < selectedRows.length; i++) {
        var selectedRow = selectedRows[i];
        selectedRow.style.backgroundColor = "#b3b5b5";
        /*for(var j = 0; j < selectedRow.cells.length; j++) {
            var cell = selectedRow.cells[j];
            isHide ? cell.style.color = "#b3b5b5" : cell.style.color = "black";
        }*/
    }     
}

SCModelBrowser.prototype.ShowAllHiddenRows = function() {
    var selectedRows = [];
    var sourceManager = SourceManagers[model.currentTabId];
    var hiddenNodeIds = sourceManager.HiddenNodeIds;
    var treeList = $("#" + this.ModelBrowserContainer).dxTreeList("instance");

    for(var i = 0; i < hiddenNodeIds.length; i++) {
        var nodeId = Number(hiddenNodeIds[i]);      
        var  rowIndex = treeList.getRowIndexByKey(nodeId);
        if(rowIndex !== -1) {
            var row = treeList.getRowElement(rowIndex);
            selectedRows.push(row[0]);
        }
    }

    sourceManager.HiddenNodeIds = [];
    this.HighlightHiddenRows(false, selectedRows);
}

SCModelBrowser.prototype.UpdateSelectionComponentFromCheckBox = function(clickedCheckBoxRowKeys, 
                                                                        checkBoxStatus,
                                                                        componentObj, 
                                                                        containerDiv) {

    for(var i = 0; i < clickedCheckBoxRowKeys.length; i++) {
        // componentObj.expandRow(clickedCheckBoxRowKeys[i]);
        var nodeObj = componentObj.getNodeByKey(clickedCheckBoxRowKeys[i]);
        var  row = componentObj.getRowElement(componentObj.getRowIndexByKey(nodeObj.key));
        this.SelectionManager.HandleSelectFormCheckBox(row[0], checkBoxStatus, nodeObj.data, containerDiv);
        if(nodeObj.hasChildren) {
            var children = this.GetSelectedChildren(componentObj, nodeObj);
            for(var j = 0; j < children.length; j++) {
                row = componentObj.getRowElement(componentObj.getRowIndexByKey(children[j].key));
                this.SelectionManager.HandleSelectFormCheckBox(row[0], checkBoxStatus, children[j].data, containerDiv);
            }
        }
    }
}

SCModelBrowser.prototype.GetSelectedChildren = function(componentObj, node) {
    var children = []
    for(var i = 0; i < node.children.length; i++) {
        var child = node.children[i];
        if(child.hasChildren){
            var ChildrenComponents = this.GetSelectedChildren(componentObj, child);
            for(var j = 0; j < ChildrenComponents.length; j++) {
                children.push(ChildrenComponents[j]);
            }
        }
        children.push(child);
    }
    return children;
}

SCModelBrowser.prototype.GetNodeChildren = function(nodeId) {
    var nodeList = [];
    var treeList = $("#" + this.ModelBrowserContainer).dxTreeList("instance");
    var nodeObj = treeList.getNodeByKey(nodeId);
    var children = this.GetSelectedChildren(treeList, nodeObj);
    for(var i = 0; i < children.length; i++) {
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

SCModelBrowser.prototype.HighlightModelBrowserRow = function (selectedNodeId) {

    var path = {};
    path['path'] = [selectedNodeId];
    this.GetTopMostParentNode(selectedNodeId, path);
    // if (!topMostParent ||
    //     topMostParent === -1) {
    //     return;
    // }

    this.OpenHighlightedRow(path, selectedNodeId);

}

SCModelBrowser.prototype.GetSelectedComponents = function () {
    return this.SelectionManager.GetSelectedComponents();
}

SCModelBrowser.prototype.AddSelectedComponent = function (checkedComponent) {
    this.SelectionManager.AddSelectedComponent(checkedComponent);
}

SCModelBrowser.prototype.ClearSelectedComponent = function (checkedComponent) {
    this.SelectionManager.ClearSelectedComponent();
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
                _this.GetBrowserRowFromNodeId(selectedNodeId, _this.ModelBrowserContainer);
            });
        }
        else {
            if(i == nodeList.length-1) {
               this.GetBrowserRowFromNodeId(selectedNodeId, this.ModelBrowserContainer);
            }
        }
        
    }
}

SCModelBrowser.prototype.GetTopMostParentNode = function (rowKey, path) {
    // if(rowKey !== -1 &&
    //    !path['path'].includes(rowKey))
    // {
    //     path['path'].push(rowKey);
    // }

    if (rowKey in this.NodeParentList) {

        if (this.NodeParentList[rowKey] === 0) {
            return;
        }
        path['path'].push(this.NodeParentList[rowKey])

        this.GetTopMostParentNode(this.NodeParentList[rowKey], path);
        // if (!parent ||
        //     parent === -1) {
        //         return rowKey;
        // }        
    }
}

SCModelBrowser.prototype.GetBrowserRowFromNodeId = function (selectedNodeId, containerDiv) {

    var treeList = $("#" + containerDiv).dxTreeList("instance");

    //navigate scrollbar to specified row using key
    treeList.navigateToRow(selectedNodeId).done(function () {
        var rowIndex = treeList.getRowIndexByKey(selectedNodeId);
        row = treeList.getRowElement(rowIndex);
        _this.SelectionManager.HandleRowSelect(row[0], undefined, selectedNodeId, _this.ModelBrowserContainer);
    });
}