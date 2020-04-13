function SCSelectionManager(nodeIdvsSelectedComponents) {
    // call super constructor
    SelectionManager.call(this);

    // restore selected components on load project
    this.NodeIdvsSelectedComponents = nodeIdvsSelectedComponents;
    this.SelectedCompoents = [];
}
// assign SelectionManager's method to this class
SCSelectionManager.prototype = Object.create(SelectionManager.prototype);
SCSelectionManager.prototype.constructor = SCSelectionManager;

/* 
   This function is called when checkbox from the model browser table is checked or unchecked
*/
SCSelectionManager.prototype.SelectComponent = function (currentRow,
    checkBoxState,
    componentData,
    containerDiv) {

    // maintain track of selected/deselected components
    if (checkBoxState === "on" &&
        !this.SelectedCompoentExists(componentData)) {

        var checkedComponent = {};

        checkedComponent['Name'] = componentData[ModelBrowserColumnNames3D.Component];
        checkedComponent['MainComponentClass'] = componentData[ModelBrowserColumnNames3D.MainClass];
        checkedComponent['ComponentClass'] = componentData[ModelBrowserColumnNames3D.SubClass];
        checkedComponent['NodeId'] = componentData[ModelBrowserColumnNames3D.NodeId];

        this.SelectedCompoents.push(checkedComponent);

        // highlight selected row         
        this.ApplyHighlightColor(currentRow);

        // maintain selected rows
        if (!this.SelectedComponentNodeIds.includes(componentData.NodeId)) {
            this.SelectedComponentNodeIds.push(componentData.NodeId);
        }
    }
    else if (checkBoxState === "off" && 
    this.SelectedCompoentExists(componentData)) {
        this.RemoveFromselectedCompoents(componentData);

        // restore color        
        this.RemoveHighlightColor(currentRow);

        // maintain selected rows
        if (this.SelectedComponentNodeIds.includes(componentData.NodeId)) {
            var index = this.SelectedComponentNodeIds.indexOf(componentData.NodeId);
            if (index !== -1) {
                this.SelectedComponentNodeIds.splice(index, 1);
            }
        }
    }
}

SCSelectionManager.prototype.SelectBrowserItem = function (currentRow,
    checkBoxState,
    itemData,
    containerDiv) {

    if (checkBoxState === "on" &&
        !this.SelectedBrowserItemExists(itemData)) {

        var checkedComponent = {};

        checkedComponent['Name'] = itemData["Name"];      
        checkedComponent['NodeId'] = itemData["NodeId"];

        this.SelectedCompoents.push(checkedComponent);

        // highlight selected row         
        this.ApplyHighlightColor(currentRow);

        // maintain selected rows
        if (!this.SelectedComponentNodeIds.includes(itemData.NodeId)) {
            this.SelectedComponentNodeIds.push(itemData.NodeId);
        }
    }
    else if (checkBoxState === "off" &&
        this.SelectedBrowserItemExists(itemData)) {
        this.RemoveFromselectedBrowserItems(itemData);

        // restore color        
        this.RemoveHighlightColor(currentRow);

        // maintain selected rows
        if (this.SelectedComponentNodeIds.includes(itemData.NodeId)) {
            var index = this.SelectedComponentNodeIds.indexOf(itemData.NodeId);
            if (index !== -1) {
                this.SelectedComponentNodeIds.splice(index, 1);
            }
        }
    }
}

/* 
   This function checks if component corresponding to input row in model browser is selected or not
*/
SCSelectionManager.prototype.SelectedCompoentExists = function (componentData) {
    for (var i = 0; i < this.SelectedCompoents.length; i++) {
        var component = this.SelectedCompoents[i];
        if (component['Name'] === componentData[ModelBrowserColumnNames3D.Component] &&
            component['MainComponentClass'] === componentData[ModelBrowserColumnNames3D.MainClass] &&
            component['ComponentClass'] === componentData[ModelBrowserColumnNames3D.SubClass]) {
            if ("NodeId" in component) {
                if (component["NodeId"] === componentData[ModelBrowserColumnNames3D.NodeId]) {
                    return true;
                }
            }
            else {
                return true;
            }
        }
    }

    return false;
}

/* 
   This function removes selected component from selected components list
*/
SCSelectionManager.prototype.RemoveFromselectedCompoents = function (componentData) {
    for (var i = 0; i < this.SelectedCompoents.length; i++) {
        var component = this.SelectedCompoents[i];
        if (component['Name'] === componentData[ModelBrowserColumnNames3D.Component] &&
            component['MainComponentClass'] === componentData[ModelBrowserColumnNames3D.MainClass] &&
            component['ComponentClass'] === componentData[ModelBrowserColumnNames3D.SubClass]) {

            if ("NodeId" in component) {
                if (component["NodeId"] === componentData[ModelBrowserColumnNames3D.NodeId]) {
                    this.SelectedCompoents.splice(i, 1);
                }
            }
            else {
                this.SelectedCompoents.splice(i, 1);
            }

            // this.selectedCompoents.splice(i, 1);
            break;
        }
    }
}

/* 
   This function checks if component corresponding to input row in model browser is selected or not
*/
SCSelectionManager.prototype.SelectedBrowserItemExists = function (itemData) {
    for (var i = 0; i < this.SelectedCompoents.length; i++) {
        var item = this.SelectedCompoents[i];
        if (item['Name'] === itemData["Name"] &&
            item['NodeId'] === itemData["NodeId"]) {
            return true;
        }
    }

    return false;
}

/* 
   This function removes selected component from selected components list
*/
SCSelectionManager.prototype.RemoveFromselectedBrowserItems = function (itemData) {
    for (var i = 0; i < this.SelectedCompoents.length; i++) {
        var item = this.SelectedCompoents[i];
        if (item['Name'] === itemData["Name"] &&
            item['NodeId'] === itemData["NodeId"]) {

            this.SelectedCompoents.splice(i, 1);

            break;
        }
    }
}

/* 
   This function 
*/
SCSelectionManager.prototype.GetSelectedComponents = function () {
    return this.SelectedCompoents;
}

/* 
   This function 
*/
SCSelectionManager.prototype.AddSelectedComponent = function (checkedComponent) {
    this.SelectedCompoents.push(checkedComponent);
}

/* 
   This function 
*/
SCSelectionManager.prototype.ClearSelectedComponent = function () {
    this.SelectedCompoents = [];
}

/* 
   This function 
*/
SCSelectionManager.prototype.OnComponentRowClicked = function (row, viewer, nodeId, containerDiv) {

    // check if row is already highlighted
    if (this.HighlightedComponentRow === row) {
        return;
    }

    // unhighlight old row
    var treeList = $("#" + containerDiv).dxTreeList("instance");
    var selectedRows = treeList.getSelectedRowKeys("all");

    if (this.HighlightedComponentRow &&
        !selectedRows.includes(this.HighlightedComponentRowKey)) {
        if (this.HighlightedComponentRow.rowElement)
            this.RemoveHighlightColor(this.HighlightedComponentRow.rowElement[0]);
        else {
            this.RemoveHighlightColor(this.HighlightedComponentRow);
        }
    }

    // highlight new row  
    if (!selectedRows.includes(nodeId)) {
        if (row.rowElement)
            this.ApplyHighlightColor(row.rowElement[0]);
        else {
            this.ApplyHighlightColor(row);
        }
    }
    this.HighlightedComponentRow = row;
    this.HighlightedComponentRowKey = nodeId;

    if (viewer && nodeId) {      
        this.HighlightInView(nodeId);        
    }
}

/* 
   This function 
*/
SCSelectionManager.prototype.OnBrowserRowClicked = function (row, viewer, nodeId, containerDiv) {
     // check if row is already highlighted
     if (this.HighlightedComponentRow === row) {
        return;
    }

    // unhighlight old row
    var treeList = $("#" + containerDiv).dxTreeList("instance");
    var selectedRows = treeList.getSelectedRowKeys("all");

    if (this.HighlightedComponentRow &&
        !selectedRows.includes(this.HighlightedComponentRowKey)) {
        if (this.HighlightedComponentRow.rowElement)
            this.RemoveHighlightColor(this.HighlightedComponentRow.rowElement[0]);
        else {
            this.RemoveHighlightColor(this.HighlightedComponentRow);
        }
    }

    // highlight new row  
    if (!selectedRows.includes(nodeId)) {
        if (row.rowElement)
            this.ApplyHighlightColor(row.rowElement[0]);
        else {
            this.ApplyHighlightColor(row);
        }
    }
    this.HighlightedComponentRow = row;
    this.HighlightedComponentRowKey = nodeId;

    if (viewer && nodeId) {      
        this.HighlightInView(nodeId);        
    }
}

/* 
   This function 
*/
SCSelectionManager.prototype.HighlightInView = function (nodeId) {

    if (!(model.currentTabId in SourceManagers)) {
        return;
    }
    var sourceManager = SourceManagers[model.currentTabId];

    var nodeID = parseInt(nodeId)
    if (isNaN(nodeID)) {
        return;
    }

    // keep track of graphically selected node
    sourceManager.SelectedNodeId = nodeID;
    sourceManager.Webviewer.selectPart(nodeID);
    sourceManager.Webviewer.view.fitNodes([nodeID]);    
};

/* 
   This function 
*/
SCSelectionManager.prototype.GetSelectedComponentIds = function () {

    if (!(model.currentTabId in SourceManagers)) {
        return;
    }
    var sourceManager = SourceManagers[model.currentTabId];

    var componentIds = [];
    var selectedCompoents = this.GetSelectedComponents();
    for (var i = 0; i < selectedCompoents.length; i++) {
        var selectedComponent = selectedCompoents[i];

        if (selectedComponent.NodeId in sourceManager.NodeIdvsComponentIdList) {

            var componentId = sourceManager.NodeIdvsComponentIdList[selectedComponent.NodeId];
            componentIds.push(componentId);
        }

    }

    return componentIds;
};