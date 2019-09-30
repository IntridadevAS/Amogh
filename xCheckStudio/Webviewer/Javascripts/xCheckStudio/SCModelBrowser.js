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
    this.InitEvents();

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
        var dataField;
        var width;
        var dataType;
        var visible = true
        if (i === ModelBrowserColumns3D.Select) {
            continue;
        }
        else if (i === ModelBrowserColumns3D.Component) {
            caption = ModelBrowserColumnNames3D.Component;
            dataField = ModelBrowserColumnNames3D.Component.replace(/\s/g, '');
            width = "40%";
            // dataType = "string";
        }
        else if (i === ModelBrowserColumns3D.MainClass) {
            caption = ModelBrowserColumnNames3D.MainClass;
            dataField = ModelBrowserColumnNames3D.MainClass.replace(/\s/g, '');
            width = "30%";
            // dataType = "string";
        }
        else if (i === ModelBrowserColumns3D.SubClass) {
            caption = ModelBrowserColumnNames3D.SubClass;
            dataField = ModelBrowserColumnNames3D.SubClass.replace(/\s/g, '');
            width = "30%";
            // dataType = "string";
        }
        else if (i === ModelBrowserColumns3D.NodeId) {
            caption = ModelBrowserColumnNames3D.NodeId;
            dataField = ModelBrowserColumnNames3D.NodeId.replace(/\s/g, '');
            width = "0%";
            visible = false;
            // dataType = "number";
        }
        else if (i === ModelBrowserColumns3D.Parent) {
            caption = ModelBrowserColumnNames3D.Parent;
            dataField = ModelBrowserColumnNames3D.Parent.replace(/\s/g, '');
            width = "0%";
            visible = false;
            // dataType = "number";
        }

        columnHeader["caption"] = caption;
        columnHeader["dataField"] = dataField;
        // columnHeader["dataType"] = dataType;
        columnHeader["width"] = width;

        if(visible == false) {
            columnHeader["visible"] = visible;
        }
        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}

SCModelBrowser.prototype.InitEvents = function () {
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
};

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

    tableRowContent[ModelBrowserColumnNames3D.Component.replace(/\s/g, '')] = nodeData.Name;
    tableRowContent[ModelBrowserColumnNames3D.MainClass.replace(/\s/g, '')] = (nodeData.MainComponentClass != undefined ? nodeData.MainComponentClass : "");
    tableRowContent[ModelBrowserColumnNames3D.SubClass.replace(/\s/g, '')] = (nodeData.SubComponentClass != undefined ? nodeData.SubComponentClass : "");
    tableRowContent[ModelBrowserColumnNames3D.NodeId.replace(/\s/g, '')] = (nodeData.NodeId != undefined ? nodeData.NodeId : "");
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
        var model = this.Webviewer.model;
        var children = model.getNodeChildren(nodeId);

        if (children.length > 0) {

            this.addComponentRow(nodeId, parentNode);

            for (var i = 0; i < children.length; i++) {
                var child = children[i];

                this.addModelBrowserComponent(child, nodeId);
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
            height: "100%",
            width: "100%",
            allowColumnResizing : true,
            // focusedRowEnabled: true,
            filterRow: {
                visible: true
            },
            selection: {
                mode: "multiple",
                recursive: true
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
            }
        });
    });
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

SCModelBrowser.prototype.isAssemblyNode = function (nodeId) {
    var nodeType = this.Webviewer.model.getNodeType(nodeId);
    if (nodeType == Communicator.NodeType.AssemblyNode) {
        return true;
    }
    else {
        return false;
    }
};

//to create collapsible table rows in model browser
//https://jsfiddle.net/y4Mdy/1372/
SCModelBrowser.prototype.CreateGroup = function (group_name) {
    var _this = this;

    var imageClass = group_name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    imageClass = imageClass.replace(/\s/g, '');
    imageClass = imageClass.replace("^", "");

    // Create Button(Image)
    $('td.' + group_name).prepend("<img class='" + imageClass + " button_closed'> ");
    // Add Padding to Data
    $('tr.' + group_name).each(function () {
        //var first_td = $(this).children('td').first();
        var collapsibleButtonTd = $(this).find("td:eq(1)");

        var padding_left = parseInt($(collapsibleButtonTd).css('padding-left'));
        $(collapsibleButtonTd).css('padding-left', String(padding_left + 25) + 'px');
    });
    this.RestoreGroup(group_name);

    // Tie toggle function to the button
    $('img.' + imageClass).click(function () {
        _this.ToggleGroup(group_name);
    });
}

//to create collapsible table rows in model browser
//https://jsfiddle.net/y4Mdy/1372/
SCModelBrowser.prototype.ToggleGroup = function (group_name) {
    this.ToggleButton($('img.' + group_name));
    this.RestoreGroup(group_name);
    if (this.Webviewer._params.containerId === "visualizerA") {
        var groupName = group_name.split("");
        var length = groupName.length;
        var temp = "";
        for (var i = 0; i < length; i++) {
            if (i < length - 1) {
                temp += groupName[i];
            }
            else if (i == length - 1) {
                temp += "2";
            }
        }
    }
    else if (this.Webviewer._params.containerId === "visualizerB") {
        var groupName = group_name.split("");
        var length = groupName.length;
        var temp = "";
        for (var i = 0; i < length; i++) {
            if (i < length - 1) {
                temp += groupName[i];
            }
            else if (i == length - 1) {
                temp += "1";
            }
        }
        this.ToggleButton($('img.' + temp));
        this.RestoreGroup(temp);
    }
}

SCModelBrowser.prototype.OpenGroup = function (group_name,
    child_groupName) {
    var _this = this;
    if ($('img.' + group_name).hasClass('button_open')) {
        // Open everything
        $('tr.' + group_name).show();

        // Close subgroups that been closed
        $('tr.' + group_name).find('img.button_closed').each(function () {
            if (sub_group_name != child_groupName) {
                sub_group_name = $(this).attr('class').split(/\s+/)[0];
                //console.log(sub_group_name);
                _this.RestoreGroup(sub_group_name);
            }
        });
    }

    if ($('img.' + group_name).hasClass('button_closed')) {
        // Close everything
        $('tr.' + group_name).hide();
    }
}

//to create collapsible table rows in model browser
//https://jsfiddle.net/y4Mdy/1372/
SCModelBrowser.prototype.RestoreGroup = function (group_name) {
    var _this = this;
    if ($('img.' + group_name).hasClass('button_open')) {
        // Open everything
        $('tr.' + group_name).show();

        // Close subgroups that been closed
        $('tr.' + group_name).find('img.button_closed').each(function () {
            sub_group_name = $(this).attr('class').split(/\s+/)[0];
            //console.log(sub_group_name);
            _this.RestoreGroup(sub_group_name);
        });
    }

    if ($('img.' + group_name).hasClass('button_closed')) {
        // Close everything
        $('tr.' + group_name).hide();
    }
}

//to create collapsible table rows in model browser
//https://jsfiddle.net/y4Mdy/1372/
SCModelBrowser.prototype.ToggleButton = function (button) {
    $(button).toggleClass('button_open');
    $(button).toggleClass('button_closed');
}


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

SCModelBrowser.prototype.GetDataFromSelectedRow = function (rowKey,
    containerDiv,
    iterateChilds) {

    var record = $(containerDiv).igTreeGrid("findRecordByKey", rowKey);

    var rowData = {};
    rowData['component'] = record[ModelBrowserColumnNames3D.Component.replace(/\s/g, '')];
    rowData['mainClass'] = record[ModelBrowserColumnNames3D.MainClass.replace(/\s/g, '')];
    rowData['subClass'] = record[ModelBrowserColumnNames3D.SubClass.replace(/\s/g, '')];
    rowData['nodeId'] = record[ModelBrowserColumnNames3D.NodeId.replace(/\s/g, '')];

    if (iterateChilds && record.childData) {
        rowData['children'] = [];

        for (var i = 0; i < record.childData.length; i++) {
            var child = record.childData[i];

            var result = this.GetDataFromSelectedRow(child[ModelBrowserColumnNames3D.NodeId.replace(/\s/g, '')],
                containerDiv,
                iterateChilds);
            if (result) {
                rowData['children'].push(result);
            }
        }
    }

    return rowData;
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