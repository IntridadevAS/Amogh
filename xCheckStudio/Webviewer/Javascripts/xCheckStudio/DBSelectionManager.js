function DBSelectionManager(selectedComponents) {
     // call super constructor
     SelectionManager.call(this);

     this.SelectedCompoents = selectedComponents !== undefined ? selectedComponents : [];

     this.SelectedDBRow;
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

DBSelectionManager.prototype.HighlightBrowserRow = function (row) {
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

DBSelectionManager.prototype.HighlightDBRow = function (row) {
     if (this.SelectedDBRow === row) {
          return false;
     }

     if (this.SelectedDBRow) {
          for (var j = 0; j < this.SelectedDBRow.cells.length; j++) {
               cell = this.SelectedDBRow.cells[j];
               cell.style.backgroundColor = "#ffffff"
          }
     }

     //row.style.backgroundColor = "#B2BABB";
     for (var j = 0; j < row.cells.length; j++) {
          cell = row.cells[j];
          cell.style.backgroundColor = "#B2BABB";
     }

     this.SelectedDBRow = row;

     return true;
}

/* 
  This function 
*/
DBSelectionManager.prototype.HandleRowSelectInViewer = function (thisRow,
     modelBrowserContainer,
     viewerContainer) {

     if (!this.HighlightDBRow(thisRow)) {
          return;
     }

     var sheetData = $("#" + viewerContainer).data("igGrid").dataSource.dataView();
     if (sheetData.length === 0) {
          return;
     }

     // get identifier column names
     var identifierColumns = {};

     var firstRow = sheetData[0];
     for (var column in firstRow) {
          if (column.toLowerCase() === "component class" ||
               column.toLowerCase() === "componentclass") {
               identifierColumns["componentClass"] = column;
          }
          else if (column.toLowerCase() === "name") {
               identifierColumns["name"] = column;
          }
          else if (column.toLowerCase() === "tagnumber" &&
               !("name" in identifierColumns)) {
               identifierColumns["name"] = column;
          }
          else if (column.toLowerCase() === "description") {
               identifierColumns["description"] = column;
          }

          // if (identifierColumns.length === 3) {
          //     break;
          // }
     }

     if (!identifierColumns.name === undefined ||
          identifierColumns.componentClass === undefined) {
          return;
     }


     // get model browser all rows data
     var modelBrowserData = $("#" + modelBrowserContainer).data("igGrid").dataSource.dataView();
     if (modelBrowserData.length === 0) {
          return;
     }

     //        // find the row to be highlighted in viewer
     var selectedRowData = sheetData[thisRow.rowIndex];
     var name = selectedRowData[identifierColumns.name];
     var subClass = selectedRowData[identifierColumns.componentClass];

     //     var name = thisRow.cells[ModelBrowserColumns1D.Component].innerText.trim();
     //     //var mainClass = thisRow.cells[ModelBrowserColumns1D.MainClass].innerText.trim();
     //     var subClass = thisRow.cells[ModelBrowserColumns1D.SubClass].innerText.trim();

     for (var i = 0; i < modelBrowserData.length; i++) {
          var rowData = modelBrowserData[i];
          // var nameColumnIndex;
          // if (identifierColumns.Name !== undefined) {
          //     nameColumnIndex = identifierColumns.Name;
          // }
          // else if (identifierColumns.Tagnumber !== undefined) {
          //     nameColumnIndex = identifierColumns.Tagnumber;
          // }
          if (name === rowData[ModelBrowserColumnNames1D.Component.replace(/\s/g, '')] &&
               subClass === rowData[ModelBrowserColumnNames1D.SubClass.replace(/\s/g, '')]) {

               var row = $("#" + modelBrowserContainer).igGrid("rowAt", i);

               // highlight row in model browser     
               this.HighlightBrowserRow(row);

               //    // scroll to selected row    
               //    modelBrowserTable.focus();
               //    modelBrowserTable.parentNode.parentNode.scrollTop = row.offsetTop - row.offsetHeight;

               break;
          }
     }
}