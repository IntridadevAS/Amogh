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

        checkedComponent['Name'] = componentData.component;
        checkedComponent['MainComponentClass'] = componentData.mainClass;
        checkedComponent['ComponentClass'] = componentData.subClass;
        checkedComponent['NodeId'] = componentData.nodeId;

        this.SelectedCompoents.push(checkedComponent);

         // highlight selected row         
         this.ApplyHighlightColor(currentRow);

        // maintain selected rows
        if (!this.SelectedComponentRows.includes(currentRow)) {
            this.SelectedComponentRows.push(currentRow);
        }
    }
    else if (this.SelectedCompoentExists(componentData)) {
        this.RemoveFromselectedCompoents(componentData);

        // restore color        
         this.RemoveHighlightColor(currentRow);

        // maintain selected rows
        if (this.SelectedComponentRows.includes(currentRow)) {
            var index = this.SelectedComponentRows.indexOf(currentRow);
            if (index !== -1) {
                this.SelectedComponentRows.splice(index, 1);
            }
        }
    }
   
    if(!componentData.children ||
        componentData.children.length === 0)
    {
        return;
    }

    // expand current row
    $(containerDiv).igTreeGrid( "expandRow", componentData.nodeId, function(){
        
    });

    // traverse children
    for(var i = 0; i < componentData.children.length; i++)
    {
        var childComponent = componentData.children[i];      
        

        var childRow = $(containerDiv).igTreeGrid( "rowById", childComponent.nodeId);

        if (checkBoxState === "on") {
            $(containerDiv).igTreeGridSelection("selectRowById", childComponent.nodeId);
        }
        else {
            $(containerDiv).igTreeGridSelection("deselectRowById", childComponent.nodeId);
        }

        this.HandleSelectFormCheckBox(childRow[0], checkBoxState, childComponent, containerDiv);
    }

   
    // /////////////
    // var currentTable = currentRow.parentElement;
    // if (currentTable.tagName.toLowerCase() !== 'tbody') {
    //     return;
    // }

    // var currentComponentCell = currentRow.cells[1];

    // var currentClassList = currentRow.classList;
    // var styleToCheck = "";
    // for (var i = 0; i < currentClassList.length; i++) {
    //     var styleClass = currentClassList[i];
    //     if (styleClass.includes("jsgrid")) {
    //         continue;
    //     }

    //     if (styleToCheck == "") {
    //         styleToCheck = styleClass;
    //     }
    //     else {
    //         styleToCheck += " " + styleClass;
    //     }
    // }

    // var currentRowClassList = currentComponentCell.classList;
    // var hasChild = false;
    // for (var i = 0; i < currentRowClassList.length; i++) {
    //     var styleClass = currentRowClassList[i];
    //     if (styleClass.includes("jsgrid")) {
    //         continue;
    //     }

    //     hasChild = true;
    //     if (styleToCheck == "") {
    //         styleToCheck = styleClass;
    //     }
    //     else {
    //         styleToCheck += " " + styleClass;
    //     }
    // }

    // // select the child component rows
    // if (hasChild) {
    //     for (var i = 0; i < currentTable.rows.length; i++) {

    //         var row = currentTable.rows[i];
    //         if (row === currentRow) {
    //             continue;
    //         }

    //         var rowClassList = row.classList;
    //         var rowStyleCheck = "";
    //         for (var j = 0; j < rowClassList.length; j++) {
    //             var styleClass = rowClassList[j];
    //             if (styleClass.includes("jsgrid")) {
    //                 continue;
    //             }

    //             if (rowStyleCheck == "") {
    //                 rowStyleCheck = styleClass;
    //             }
    //             else {
    //                 rowStyleCheck += " " + styleClass;
    //             }
    //         }

    //         // if (row.className === styleToCheck) {
    //         if (rowStyleCheck === styleToCheck) {

    //             var checkBox = row.cells[0].children[0];
    //             if (checkBox.checked === currentCheckBox.checked) {
    //                 continue;
    //             }

    //             checkBox.checked = currentCheckBox.checked;
    //             this.HandleSelectFormCheckBox(checkBox);

    //             if (checkBox.checked) {
    //                 // highlight selected row
    //                 this.ApplyHighlightColor(row);
    //             }
    //             else {
    //                 // unhighlight selected row
    //                 this.RemoveHighlightColor(row);
    //             }
    //         }
    //     }
    // }
}

/* 
   This function checks if component corresponding to input row in model browser is selected or not
*/
SCSelectionManager.prototype.SelectedCompoentExists = function (componentData) {
    for (var i = 0; i < this.SelectedCompoents.length; i++) {
        var component = this.SelectedCompoents[i];
        if (component['Name'] === componentData.component &&
            component['MainComponentClass'] === componentData.mainClass &&
            component['ComponentClass'] === componentData.subClass) {
            if ("NodeId" in component) {
                if (component["NodeId"] === componentData.nodeId) {
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
        if (component['Name'] === componentData.component &&
            component['MainComponentClass'] === componentData.mainClass &&
            component['ComponentClass'] === componentData.subClass) {

            if ("NodeId" in component) {
                if (component["NodeId"] === componentData.nodeId) {
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
SCSelectionManager.prototype.HandleRowSelect = function (row, viewer, nodeId) {

    // check if row is already highlighted
    if (this.HighlightedComponentRow === row) {
        return;
    }

    // unhighlight old row
    if (this.HighlightedComponentRow &&
        !this.SelectedComponentRows.includes(this.HighlightedComponentRow)) {
        this.RemoveHighlightColor(this.HighlightedComponentRow);
    }

    // highlight new row  
    if (!this.SelectedComponentRows.includes(row)) {
        this.ApplyHighlightColor(row);        
    }
    this.HighlightedComponentRow = row;
     
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