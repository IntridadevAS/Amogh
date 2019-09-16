function SCSelectionManager(nodeIdvsSelectedComponents) {
    // call super constructor
    SelectionManager.call(this);

    // restore selected components on load project
    this.NodeIdvsSelectedComponents = nodeIdvsSelectedComponents;
    this.SelectedCompoents = [];

    if (nodeIdvsSelectedComponents) {
        for (var nodeId in this.NodeIdvsSelectedComponents) {
            var selectedComponent = this.NodeIdvsSelectedComponents[nodeId];
            var checkedComponent = {};
            checkedComponent['Name'] = selectedComponent['name'];
            checkedComponent['MainComponentClass'] = selectedComponent['mainClass'];
            checkedComponent['ComponentClass'] = selectedComponent['subClass'];
            checkedComponent["NodeId"] = selectedComponent['nodeId'];

            this.SelectedCompoents.push(checkedComponent);
        }
    }   
}
// assign SelectionManager's method to this class
SCSelectionManager.prototype = Object.create(SelectionManager.prototype);
SCSelectionManager.prototype.constructor = SCSelectionManager;

/* 
   This function is called when checkbox from the model browser table is checked or unchecked
*/
SCSelectionManager.prototype.HandleSelectFormCheckBox = function (currentRow, 
                                                                  checkBoxState, 
                                                                  componentData,
                                                                  containerDiv) {

    // var currentCell = currentCheckBox.parentElement;
    // if (currentCell.tagName.toLowerCase() !== 'td') {
    //     return;
    // }

    // var currentRow = currentCell.parentElement;
    // if (currentRow.tagName.toLowerCase() !== 'tr' ||
    //     currentRow.cells.length < 2) {
    //     return;
    // }

    // maintain track of selected/deselected components
    if (checkBoxState === "on" &&
         !this.SelectedCompoentExists(componentData)) {

        var checkedComponent = {};
        // checkedComponent['Name'] = currentRow.cells[modelBrowserComponentColumn].textContent.trim();
        // checkedComponent['MainComponentClass'] = currentRow.cells[modelBrowserMainClassColumn].textContent.trim();
        // checkedComponent['ComponentClass'] = currentRow.cells[modelBrowserSubClassColumn].textContent.trim();
        // checkedComponent["NodeId"] = currentRow.cells[modelBrowserNodeIdColumn].textContent.trim();

        checkedComponent['Name'] = componentData.Item;
        checkedComponent['MainComponentClass'] = componentData.Category;
        checkedComponent['ComponentClass'] = componentData.ItemClass;
        checkedComponent['NodeId'] = componentData.NodeId;

        this.SelectedCompoents.push(checkedComponent);

         // highlight selected row         
        //  this.ApplyHighlightColor(currentRow);

        // maintain selected rows
        if (!this.SelectedComponentNodeIds.includes(componentData.NodeId)) {
            this.SelectedComponentNodeIds.push(componentData.NodeId);
        }
    }
    else if (this.SelectedCompoentExists(componentData)) {
        this.RemoveFromselectedCompoents(componentData);

        // restore color        
        //  this.RemoveHighlightColor(currentRow);

        // maintain selected rows
        if (this.SelectedComponentNodeIds.includes(componentData.NodeId)) {
            var index = this.SelectedComponentNodeIds.indexOf(componentData.NodeId);
            if (index !== -1) {
                this.SelectedComponentNodeIds.splice(index, 1);
            }
        }
    }
   
    // if(!componentData.children ||
    //     componentData.children.length === 0)
    // {
    //     return;
    // }

    // expand current row
    // $(containerDiv).igTreeGrid( "expandRow", componentData.nodeId, function(){
        
    // });

    // traverse children
    // for(var i = 0; i < componentData.children.length; i++)
    // {
    //     var childComponent = componentData.children[i];      
        

    //     var childRow = $(containerDiv).igTreeGrid( "rowById", childComponent.nodeId);

    //     if (checkBoxState === "on") {
    //         $(containerDiv).igTreeGridSelection("selectRowById", childComponent.nodeId);
    //     }
    //     else {
    //         $(containerDiv).igTreeGridSelection("deselectRowById", childComponent.nodeId);
    //     }

    //     this.HandleSelectFormCheckBox(childRow[0], checkBoxState, childComponent, containerDiv);
    // }   
    
}

/* 
   This function checks if component corresponding to input row in model browser is selected or not
*/
SCSelectionManager.prototype.SelectedCompoentExists = function (componentData) {
    for (var i = 0; i < this.SelectedCompoents.length; i++) {
        var component = this.SelectedCompoents[i];
        if (component['Name'] === componentData.Item &&
            component['MainComponentClass'] === componentData.Category &&
            component['ComponentClass'] === componentData.ItemClass) {
            if ("NodeId" in component) {
                if (component["NodeId"] === componentData.NodeId) {
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
        if (component['Name'] === componentData.Item &&
            component['MainComponentClass'] === componentData.Category &&
            component['ComponentClass'] === componentData.ItemClass) {

            if ("NodeId" in component) {
                if (component["NodeId"] === componentData.NodeId) {
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
SCSelectionManager.prototype.HandleRowSelect = function (row, viewer, nodeId, containerDiv) {

    // check if row is already highlighted
    if (this.HighlightedComponentRow === row) {
        return;
    }

    // unhighlight old row
    if (this.HighlightedComponentRow &&
        !this.HighlightedComponentRow.isSelected) {
        if(this.HighlightedComponentRow.rowElement)
            this.RemoveHighlightColor(this.HighlightedComponentRow.rowElement[0]);
        else {
            var treeList = $("#" + containerDiv).dxTreeList("instance");
            var selectedRows = treeList.getSelectedRowKeys("all");
            if(!selectedRows.includes(this.HighlightedComponentRowKey)) {
                this.RemoveHighlightColor(this.HighlightedComponentRow);
            }
        }
    }

    // highlight new row  
    if (row.isSelected !== undefined && row.isSelected ==  false) {
        this.ApplyHighlightColor(row.rowElement[0]);        
    }
    else {
        var treeList = $("#" + containerDiv).dxTreeList("instance");
        var selectedRows = treeList.getSelectedRowKeys("all");
        if(!selectedRows.includes(nodeId)) {
            this.ApplyHighlightColor(row);
        }
    }
    this.HighlightedComponentRow = row;
    this.HighlightedComponentRowKey = nodeId;
     
    if (viewer && nodeId) {
        // var nodeId = row.cells[ModelBrowserColumns3D.NodeId].innerText
        // if (nodeId !== undefined) {
        this.BrowserItemClick(nodeId);
        // }
    }
}

/* 
   This function 
*/
SCSelectionManager.prototype.BrowserItemClick = function (nodeId) {
    
    if(!(currentTabId in SourceManagers))
    {
        return;
    }
    var sourceManager = SourceManagers[currentTabId];

    var nodeID = parseInt(nodeId)
    if (isNaN(nodeID)) {
        return;
    }   
   
    // keep track of graphically selected node
    sourceManager.SelectedNodeId = nodeID;
    sourceManager.Webviewer.selectPart(nodeID);
    sourceManager.Webviewer.view.fitNodes([nodeID]);
    // if (viewer._params.containerId === "visualizerA") {
    //     sourceManager1.SelectedNodeId = nodeID;
    // }
    // else if (viewer._params.containerId === "visualizerB") {
    //     sourceManager2.SelectedNodeId = nodeID;
    // }

    // viewer.selectPart(nodeID);
    // viewer.view.fitNodes([nodeID]);
};