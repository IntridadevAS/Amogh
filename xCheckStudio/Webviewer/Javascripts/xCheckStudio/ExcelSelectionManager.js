function ExcelSelectionManager(selectedComponents) {
     // call super constructor
     SelectionManager.call(this);

     this.SelectedCompoents = selectedComponents !== undefined ? selectedComponents : [];

     this.SelectedSheetRow;
}

// assign SelectionManager's method to this class
ExcelSelectionManager.prototype = Object.create(SelectionManager.prototype);
ExcelSelectionManager.prototype.constructor = ExcelSelectionManager;

ExcelSelectionManager.prototype.HandleSelectFormCheckBox = function (currentRow, 
     checkBoxState, 
     componentData) {

     // var currentCell = currentCheckBox.parentElement;
     // if (currentCell.tagName.toLowerCase() !== 'td') {
     //      return;
     // }

     // var currentRow = currentCell.parentElement;
     // if (currentRow.tagName.toLowerCase() !== 'tr' ||
     //      currentRow.cells.length < 2) {
     //      return;
     // }

     // maintain track of selected/deselected components
     if (checkBoxState === "on" &&
          !this.SelectedCompoentExists(componentData)) {

          var checkedComponent = {};
          checkedComponent['Name'] = componentData.component;
          checkedComponent['MainComponentClass'] = componentData.mainClass;
          checkedComponent['ComponentClass'] = componentData.subClass;
          checkedComponent['Description'] = componentData.description;

          // var checkedComponent = {
          //      'Name': currentRow.cells[1].textContent.trim(),
          //      'MainComponentClass': currentRow.cells[2].textContent.trim(),
          //      'ComponentClass': currentRow.cells[3].textContent.trim(),
          //      'Description': currentRow.cells[4].textContent.trim()
          // };

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
}

ExcelSelectionManager.prototype.SelectedCompoentExists = function (componentData) {
     for (var i = 0; i < this.SelectedCompoents.length; i++) {
          var component = this.SelectedCompoents[i];
          if (component['Name'] === componentData.component &&
               component['MainComponentClass'] === componentData.mainClass &&
               component['ComponentClass'] === componentData.subClass &&
               component['Description'] == componentData.description) {
               return true;
          }
     }

     return false;
}

ExcelSelectionManager.prototype.RemoveFromselectedCompoents = function (componentData) {
     for (var i = 0; i < this.SelectedCompoents.length; i++) {
          var component = this.SelectedCompoents[i];
          if (component['Name'] === componentData.component &&
               component['MainComponentClass'] === componentData.mainClass &&
               component['ComponentClass'] === componentData.subClass  &&
               component['Description'] === componentData.description) {

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
ExcelSelectionManager.prototype.HandleRowSelectInViewer = function (thisRow,
     modelBrowserContainer,
     viewerContainer) {

     if (!this.HighlightSheetRow(thisRow)) {
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


     for (var i = 0; i < modelBrowserData.length; i++) {
          var rowData = modelBrowserData[i];

          if (name === rowData[ModelBrowserColumnNames1D.Component.replace(/\s/g, '')] &&
               subClass === rowData[ModelBrowserColumnNames1D.SubClass.replace(/\s/g, '')]) {

               var row = $("#" + modelBrowserContainer).igGrid("rowAt", i);

               // highlight row in model browser     
               this.HighlightBrowserRow(row);

               // scroll to selected row                   
               document.getElementById(modelBrowserContainer+"_table_scroll").scrollTop = row.offsetTop - row.offsetHeight;

               break;
          }
     }

     // //////////////////////////////
     // var viewerContainerData;
     // if (modelBrowserContainer === "modelTree1") {
     //      viewerContainerData = document.getElementById("visualizerA")
     // }
     // else if (modelBrowserContainer === "modelTree2") {
     //      viewerContainerData = document.getElementById("visualizerB")
     // }

     // if (!viewerContainerData) {
     //      return
     // }

     // var containerChildren = viewerContainerData.children;
     // var columnHeaders = containerChildren[0].getElementsByTagName("th");

     // // get identifier property names
     // var identifierColumns = {};
     // for (var i = 0; i < columnHeaders.length; i++) {
     //      columnHeader = columnHeaders[i];
     //      if (columnHeader.innerHTML.trim() === "Component Class" ||
     //           columnHeader.innerHTML.trim() === "Name" ||
     //           columnHeader.innerHTML.trim() === "Tagnumber" ||
     //           columnHeader.innerHTML.trim() === "Description") {
     //           identifierColumns[columnHeader.innerHTML.trim().replace(" ", "")] = i;
     //      }
     //      if (Object.keys(identifierColumns).length === 3) {
     //           break;
     //      }
     // }

     // var modelBrowserData = document.getElementById(modelBrowserContainer);
     // var modelBrowserTable = modelBrowserData.children[1].getElementsByTagName("table")[0];;
     // var modelBrowserRowsData = modelBrowserTable.getElementsByTagName("tr");

     // for (var i = 0; i < modelBrowserRowsData.length; i++) {
     //      rowData = modelBrowserRowsData[i];

     //      if (rowData.cells.length > 1) {
     //           var nameColumnIndex;
     //           if (identifierColumns.Name !== undefined) {
     //                nameColumnIndex = identifierColumns.Name;
     //           }
     //           else if (identifierColumns.Tagnumber !== undefined) {
     //                nameColumnIndex = identifierColumns.Tagnumber;
     //           }

     //           if (thisRow.cells[nameColumnIndex].innerText === rowData.cells[1].innerText &&
     //                thisRow.cells[identifierColumns.ComponentClass].innerText === rowData.cells[3].innerText) {

     //                // highlight row in model browser     
     //                this.HighlightBrowserRow(rowData);                   

     //                // scroll to selected row    
     //                modelBrowserTable.focus();
     //                modelBrowserTable.parentNode.parentNode.scrollTop = rowData.offsetTop - rowData.offsetHeight;

     //           }
     //      }
     // }
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

     //row.style.backgroundColor = "#B2BABB";
     for (var j = 0; j < row.cells.length; j++) {
          cell = row.cells[j];
          cell.style.backgroundColor = "#B2BABB";
     }

     this.SelectedSheetRow = row;

     return true;
}