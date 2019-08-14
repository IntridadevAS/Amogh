function ExcelSelectionManager(selectedComponents) {
     // call super constructor
     SelectionManager.call(this);

     this.SelectedCompoents = selectedComponents !== undefined ? selectedComponents : [];  
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

     // var currentTable = currentRow.parentElement;
     // if (currentTable.tagName.toLowerCase() !== 'tbody') {
     //     return;
     // }

     //var currentComponentCell = currentRow.cells[1];
     //var currentRowStyle = currentComponentCell.className;

     //var currentClassList = currentRow.classList;
     // var currentClassName = currentRow.className;
     // var index = currentClassName.lastIndexOf(" ");

     // check/uncheck all child and further child rows
     // var styleToCheck = currentClassName + " " + currentRowStyle;

     //index 1 and 2 for class names from parent row
     // var styleToCheck = currentClassList[1] + " " + currentClassList[2] + " " + currentRowStyle;
     // for (var i = 0; i < currentTable.rows.length; i++) {

     //     var row = currentTable.rows[i];
     //     if (row === currentRow) {
     //         continue;
     //     }

     //     var rowClassList = row.classList;

     //     //index 1 and 2 for class names inherited from parent row 
     //     // rowClassList[rowClassList.length -1] is for class applied for current row
     //     var rowStyleCheck = rowClassList[1] + " " + rowClassList[2] + " " + rowClassList[rowClassList.length - 1];

     //     if (rowStyleCheck === styleToCheck) {

     //         var checkBox = row.cells[0].children[0];
     //         if (checkBox.checked === currentCheckBox.checked) {
     //             continue;
     //         }

     //         checkBox.checked = currentCheckBox.checked;
     //         this.HandleSelectFormCheckBox(checkBox);
     //     }
     // }
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

ExcelSelectionManager.prototype.HandleRowSelect = function (row) {
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

     //this.ShowSelectedSheetData(row)     
}

/* 
  This function 
*/
ExcelSelectionManager.prototype.HandleRowSelectInViewer = function (thisRow) {

     var viewerContainerData;
     if (this.ModelBrowserContainer === "modelTree1") {
          viewerContainerData = document.getElementById("viewerContainer1")
     }
     else if (this.ModelBrowserContainer === "modelTree2") {
          viewerContainerData = document.getElementById("viewerContainer2")
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

     var modelBrowserData = document.getElementById(this.ModelBrowserContainer);
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
                    if (this.SelectedComponentRow === rowData) {
                         return;
                    }

                    if (this.SelectedComponentRow) {
                         this.RemoveHighlightColor(this.SelectedComponentRow);
                    }

                    this.ApplyHighlightColor(rowData);
                    this.SelectedComponentRow = rowData;

                    if (this.SelectedComponentRowFromSheet) {
                         for (var j = 0; j < this.SelectedComponentRowFromSheet.cells.length; j++) {
                              cell = this.SelectedComponentRowFromSheet.cells[j];
                              cell.style.backgroundColor = "#ffffff"
                         }
                    }

                    for (var j = 0; j < thisRow.cells.length; j++) {
                         cell = thisRow.cells[j];
                         cell.style.backgroundColor = "#B2BABB"
                    }

                    this.SelectedComponentRowFromSheet = thisRow;

                    // scroll to selected row    
                    modelBrowserTable.focus();
                    modelBrowserTable.parentNode.parentNode.scrollTop = rowData.offsetTop - rowData.offsetHeight;

               }
          }
     }
}