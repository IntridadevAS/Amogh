function ExcelSelectionManager(selectedComponents) {
     // call super constructor
     SelectionManager.call(this);

     this.SelectedCompoents = selectedComponents !== undefined ? selectedComponents : [];

     this.SelectedSheetRow;
}

// assign SelectionManager's method to this class
ExcelSelectionManager.prototype = Object.create(SelectionManager.prototype);
ExcelSelectionManager.prototype.constructor = ExcelSelectionManager;

ExcelSelectionManager.prototype.HandleSelectFormCheckBox = function (currentCheckBox) {

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

ExcelSelectionManager.prototype.SelectedCompoentExists = function (componentRow) {
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

ExcelSelectionManager.prototype.RemoveFromselectedCompoents = function (componentRow) {
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
ExcelSelectionManager.prototype.GetSelectedComponents = function () {
     return this.SelectedCompoents;
}

/* 
   This function 
*/
ExcelSelectionManager.prototype.AddSelectedComponent = function (checkedComponent) {
     this.SelectedCompoents.push(checkedComponent);
}

/* 
   This function 
*/
ExcelSelectionManager.prototype.ClearSelectedComponent = function () {
     this.SelectedCompoents = [];
}

/* 
   This function 
*/
ExcelSelectionManager.prototype.IsComponentChecked = function (componentName,
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

ExcelSelectionManager.prototype.HighlightBrowserRow = function (row) {
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

/* 
  This function 
*/
ExcelSelectionManager.prototype.HandleRowSelectInViewer = function (thisRow, modelBrowserContainer) {

     if(!this.HighlightSheetRow(thisRow))
     {
          return;
     }

     var viewerContainerData;
     if (modelBrowserContainer === "modelTree1") {
          viewerContainerData = document.getElementById("visualizerA")
     }
     else if (modelBrowserContainer === "modelTree2") {
          viewerContainerData = document.getElementById("visualizerB")
     }

     if (!viewerContainerData) {
          return
     }

     var containerChildren = viewerContainerData.children;
     var columnHeaders = containerChildren[0].getElementsByTagName("th");

     // get identifier property names
     var identifierColumns = {};
     for (var i = 0; i < columnHeaders.length; i++) {
          columnHeader = columnHeaders[i];
          if (columnHeader.innerHTML.trim() === "Component Class" ||
               columnHeader.innerHTML.trim() === "Name" ||
               columnHeader.innerHTML.trim() === "Tagnumber" ||
               columnHeader.innerHTML.trim() === "Description") {
               identifierColumns[columnHeader.innerHTML.trim().replace(" ", "")] = i;
          }
          if (Object.keys(identifierColumns).length === 3) {
               break;
          }
     }

     var modelBrowserData = document.getElementById(modelBrowserContainer);
     var modelBrowserTable = modelBrowserData.children[1].getElementsByTagName("table")[0];;
     var modelBrowserRowsData = modelBrowserTable.getElementsByTagName("tr");

     for (var i = 0; i < modelBrowserRowsData.length; i++) {
          rowData = modelBrowserRowsData[i];

          if (rowData.cells.length > 1) {
               var nameColumnIndex;
               if (identifierColumns.Name !== undefined) {
                    nameColumnIndex = identifierColumns.Name;
               }
               else if (identifierColumns.Tagnumber !== undefined) {
                    nameColumnIndex = identifierColumns.Tagnumber;
               }

               if (thisRow.cells[nameColumnIndex].innerText === rowData.cells[1].innerText &&
                    thisRow.cells[identifierColumns.ComponentClass].innerText === rowData.cells[3].innerText) {

                    // highlight row in model browser     
                    this.HighlightBrowserRow(rowData);                   

                    // scroll to selected row    
                    modelBrowserTable.focus();
                    modelBrowserTable.parentNode.parentNode.scrollTop = rowData.offsetTop - rowData.offsetHeight;

               }
          }
     }
}

ExcelSelectionManager.prototype.HighlightSheetRow = function (row) {
     if (this.SelectedSheetRow === row) {
          return false;
     }

     if (this.SelectedSheetRow) {
          for (var j = 0; j < this.SelectedSheetRow.cells.length; j++) {
               cell = this.SelectedSheetRow.cells[j];
               cell.style.backgroundColor = "#ffffff"
          }
     }

     for (var j = 0; j < row.cells.length; j++) {
          cell = row.cells[j];
          cell.style.backgroundColor = "#B2BABB"
     }

     this.SelectedSheetRow = row;

     return true;
}