function DBSelectionManager(selectedComponents) {
     // call super constructor
     SelectionManager.call(this);

     this.SelectedCompoents = selectedComponents !== undefined ? selectedComponents : [];
}

// assign SelectionManager's method to this class
DBSelectionManager.prototype = Object.create(SelectionManager.prototype);
DBSelectionManager.prototype.constructor = DBSelectionManager;

DBSelectionManager.prototype.HandleSelectFormCheckBox = function (currentCheckBox) {

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

          var checkedComponent = {
               'Name': currentRow.cells[1].textContent.trim(),
               'MainComponentClass': currentRow.cells[2].textContent.trim(),
               'ComponentClass': currentRow.cells[3].textContent.trim(),
               'Description': currentRow.cells[4].textContent.trim()
          };

          this.SelectedCompoents.push(checkedComponent);

          // highlight selected row
          this.ApplyHighlightColor(currentRow);

          // maintain selected rows
          if (!this.SelectedComponentRows.includes(currentRow)) {
               this.SelectedComponentRows.push(currentRow);
          }
     }
     else if (this.SelectedCompoentExists(currentRow)) {
          this.RemoveFromselectedCompoents(currentRow);

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
}

DBSelectionManager.prototype.SelectedCompoentExists = function (componentRow) {
     for (var i = 0; i < this.SelectedCompoents.length; i++) {
          var component = this.SelectedCompoents[i];
          if (component['Name'] === componentRow.cells[1].textContent.trim() &&
               component['MainComponentClass'] === componentRow.cells[2].textContent.trim() &&
               component['ComponentClass'] === componentRow.cells[3].textContent.trim() &&
               component['Description'] == componentRow.cells[4].textContent.trim()) {
               return true;
          }
     }

     return false;
}

DBSelectionManager.prototype.RemoveFromselectedCompoents = function (componentRow) {
     for (var i = 0; i < this.SelectedCompoents.length; i++) {
          var component = this.SelectedCompoents[i];
          if (component['Name'] === componentRow.cells[1].textContent.trim() &&
               component['MainComponentClass'] === componentRow.cells[2].textContent.trim() &&
               component['ComponentClass'] === componentRow.cells[3].textContent.trim() &&
               component['Description'] === componentRow.cells[4].textContent.trim()) {

               this.SelectedCompoents.splice(i, 1);
               break;
          }
     }
}

/* 
   This function 
*/
DBSelectionManager.prototype.GetSelectedComponents = function () {
     return this.SelectedCompoents;
}

/* 
   This function 
*/
DBSelectionManager.prototype.AddSelectedComponent = function (checkedComponent) {
     this.SelectedCompoents.push(checkedComponent);
}

/* 
   This function 
*/
DBSelectionManager.prototype.ClearSelectedComponent = function () {
     this.SelectedCompoents = [];
}

/* 
   This function 
*/
DBSelectionManager.prototype.IsComponentChecked = function (componentName,
     mainClass,
     subClass) {
     if (this.SelectedCompoents &&
          (mainClass in this.SelectedCompoents)) {
          var classWiseSelectedComps = this.SelectedCompoents[mainClass];

          for (var key in classWiseSelectedComps) {
               var comp = classWiseSelectedComps[key];
               if (componentName === comp["name"] &&
                    subClass === comp["subClass"]) {
                    return true;
               }
          }
     }

     return false;
}

DBSelectionManager.prototype.HandleRowSelect = function (row) {
     if (this.HighlightedComponentRow === row) {
          return;
     }

     if (this.HighlightedComponentRow &&
          !this.SelectedComponentRows.includes(this.HighlightedComponentRow)) {
          this.RemoveHighlightColor(this.HighlightedComponentRow);
     }

     // highlight new row  
     if (!this.SelectedComponentRows.includes(row)) {
          this.ApplyHighlightColor(row);
     }
     this.HighlightedComponentRow = row;
}