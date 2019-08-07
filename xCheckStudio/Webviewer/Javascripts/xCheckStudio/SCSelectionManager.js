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
SCSelectionManager.prototype.HandleSelectFormCheckBox = function (currentCheckBox) {

    var currentCell = currentCheckBox.parentElement;
    if (currentCell.tagName.toLowerCase() !== 'td') {
        return;
    }

    var currentRow = currentCell.parentElement;
    if (currentRow.tagName.toLowerCase() !== 'tr' ||
        currentRow.cells.length < 2) {
        return;
    }

    // maintain track of selected/deselected components
    if (currentCheckBox.checked &&
        !this.SelectedCompoentExists(currentRow)) {

        var checkedComponent = {};
        checkedComponent['Name'] = currentRow.cells[modelBrowserComponentColumn].textContent.trim();
        checkedComponent['MainComponentClass'] = currentRow.cells[modelBrowserMainClassColumn].textContent.trim();
        checkedComponent['ComponentClass'] = currentRow.cells[modelBrowserSubClassColumn].textContent.trim();
        checkedComponent["NodeId"] = currentRow.cells[modelBrowserNodeIdColumn].textContent.trim();

        this.SelectedCompoents.push(checkedComponent);

         // highlight selected row
         this.ChangeBackgroundColor(currentRow);

        // maintain selected rows
        if (!this.SelectedComponentRows.includes(currentRow)) {
            this.SelectedComponentRows.push(currentRow);
        }
    }
    else if (this.SelectedCompoentExists(currentRow)) {
        this.RemoveFromselectedCompoents(currentRow);

        // restore color
        this.RestoreBackgroundColor(currentRow);

        // maintain selected rows
        if (this.SelectedComponentRows.includes(currentRow)) {
            var index = this.SelectedComponentRows.indexOf(currentRow);
            if (index !== -1) {
                this.SelectedComponentRows.splice(index, 1);
            }
        }
    }

    var currentTable = currentRow.parentElement;
    if (currentTable.tagName.toLowerCase() !== 'tbody') {
        return;
    }

    var currentComponentCell = currentRow.cells[1];

    var currentClassList = currentRow.classList;
    var styleToCheck = "";
    for (var i = 0; i < currentClassList.length; i++) {
        var styleClass = currentClassList[i];
        if (styleClass.includes("jsgrid")) {
            continue;
        }

        if (styleToCheck == "") {
            styleToCheck = styleClass;
        }
        else {
            styleToCheck += " " + styleClass;
        }
    }

    var currentRowClassList = currentComponentCell.classList;
    var hasChild = false;
    for (var i = 0; i < currentRowClassList.length; i++) {
        var styleClass = currentRowClassList[i];
        if (styleClass.includes("jsgrid")) {
            continue;
        }

        hasChild = true;
        if (styleToCheck == "") {
            styleToCheck = styleClass;
        }
        else {
            styleToCheck += " " + styleClass;
        }
    }

    // select the child component rows
    if (hasChild) {
        for (var i = 0; i < currentTable.rows.length; i++) {

            var row = currentTable.rows[i];
            if (row === currentRow) {
                continue;
            }

            var rowClassList = row.classList;
            var rowStyleCheck = "";
            for (var j = 0; j < rowClassList.length; j++) {
                var styleClass = rowClassList[j];
                if (styleClass.includes("jsgrid")) {
                    continue;
                }

                if (rowStyleCheck == "") {
                    rowStyleCheck = styleClass;
                }
                else {
                    rowStyleCheck += " " + styleClass;
                }
            }

            // if (row.className === styleToCheck) {
            if (rowStyleCheck === styleToCheck) {

                var checkBox = row.cells[0].children[0];
                if (checkBox.checked === currentCheckBox.checked) {
                    continue;
                }

                checkBox.checked = currentCheckBox.checked;
                this.HandleSelectFormCheckBox(checkBox);

                if (checkBox.checked) {
                    // highlight selected row
                    this.ChangeBackgroundColor(row);
                }
                else {
                    // unhighlight selected row
                    this.RestoreBackgroundColor(row);
                }
            }
        }
    }
}

/* 
   This function checks if component corresponding to input row in model browser is selected or not
*/
SCSelectionManager.prototype.SelectedCompoentExists = function (componentRow) {
    for (var i = 0; i < this.SelectedCompoents.length; i++) {
        var component = this.SelectedCompoents[i];
        if (component['Name'] === componentRow.cells[1].textContent.trim() &&
            component['MainComponentClass'] === componentRow.cells[2].textContent.trim() &&
            component['ComponentClass'] === componentRow.cells[3].textContent.trim()) {
            if ("NodeId" in component) {
                if (component["NodeId"] === componentRow.cells[4].textContent.trim()) {
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
SCSelectionManager.prototype.RemoveFromselectedCompoents = function (componentRow) {
    for (var i = 0; i < this.SelectedCompoents.length; i++) {
        var component = this.SelectedCompoents[i];
        if (component['Name'] === componentRow.cells[1].textContent.trim() &&
            component['MainComponentClass'] === componentRow.cells[2].textContent.trim() &&
            component['ComponentClass'] === componentRow.cells[3].textContent.trim()) {

            if ("NodeId" in component) {
                if (component["NodeId"] === componentRow.cells[4].textContent.trim()) {
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
SCSelectionManager.prototype.HandleRowSelect = function (row, viewer) {
    //var row = args.event.currentTarget;

    // check if row is already highlighted
    if (this.HighlightedComponentRow === row) {
        return;
    }

    // unhighlight old row
    if (this.HighlightedComponentRow &&
        !this.SelectedComponentRows.includes(this.HighlightedComponentRow)) {
        this.RestoreBackgroundColor(this.HighlightedComponentRow);
    }

    // highlight new row  
    if(!this.SelectedComponentRows.includes(row))  
    {
        this.ChangeBackgroundColor(row);
    }
    this.HighlightedComponentRow = row;


    if (viewer) {
        var nodeId = row.cells[modelBrowserNodeIdColumn].innerText
        if (nodeId !== undefined) {
            this.BrowserItemClick(nodeId, viewer);
        }
    }
}

/* 
   This function 
*/
SCSelectionManager.prototype.BrowserItemClick = function (nodeId, viewer) {
    if (!viewer) {
        return;
    }

    var nodeID = parseInt(nodeId)
    if (isNaN(nodeID)) {
        return;
    }

    // keep track of graphically selected node
    if (viewer._params.containerId === "viewerContainer1") {
        sourceManager1.SelectedNodeId = nodeID;
    }
    else if (viewer._params.containerId === "viewerContainer2") {
        sourceManager2.SelectedNodeId = nodeID;
    }

    viewer.selectPart(nodeID);
    viewer.view.fitNodes([nodeID]);
};