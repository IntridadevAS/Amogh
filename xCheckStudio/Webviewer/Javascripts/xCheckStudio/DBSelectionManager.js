function DBSelectionManager(selectedComponents) {
     // call super constructor
     SelectionManager.call(this);

     this.SelectedCompoents = selectedComponents !== undefined ? selectedComponents : [];

     this.SelectedDBRow;
}

// assign SelectionManager's method to this class
DBSelectionManager.prototype = Object.create(SelectionManager.prototype);
DBSelectionManager.prototype.constructor = DBSelectionManager;

DBSelectionManager.prototype.HandleSelectFormCheckBox = function (currentRow,
     checkBoxState,
     componentData) {

     // maintain track of selected/deselected components
     if (checkBoxState === "on" &&
          !this.SelectedCompoentExists(componentData)) {

          var checkedComponent = {};
          checkedComponent['Name'] = componentData[ModelBrowserColumnNames1D.Component];
          checkedComponent['MainComponentClass'] = componentData[ModelBrowserColumnNames1D.MainClass];
          checkedComponent['ComponentClass'] = componentData[ModelBrowserColumnNames1D.SubClass];
          checkedComponent['Description'] = componentData[ModelBrowserColumnNames1D.Description];

          this.SelectedCompoents.push(checkedComponent);

          // highlight selected row
          this.ApplyHighlightColor(currentRow);

     }
     else if (this.SelectedCompoentExists(componentData)) {
          this.RemoveFromselectedCompoents(componentData);

          // restore color
          this.RemoveHighlightColor(currentRow);
     }
}

DBSelectionManager.prototype.SelectedCompoentExists = function (componentData) {
     for (var i = 0; i < this.SelectedCompoents.length; i++) {
          var component = this.SelectedCompoents[i];
          if (component['Name'] === componentData[ModelBrowserColumnNames1D.Component] &&
               component['MainComponentClass'] === componentData[ModelBrowserColumnNames1D.MainClass] &&
               component['ComponentClass'] === componentData[ModelBrowserColumnNames1D.SubClass] &&
               component['Description'] == componentData[ModelBrowserColumnNames1D.Description]) {
               return true;
          }
     }

     return false;
}

DBSelectionManager.prototype.RemoveFromselectedCompoents = function (componentData) {
     for (var i = 0; i < this.SelectedCompoents.length; i++) {
          var component = this.SelectedCompoents[i];
          if (component['Name'] === componentData[ModelBrowserColumnNames1D.Component] &&
               component['MainComponentClass'] === componentData[ModelBrowserColumnNames1D.MainClass] &&
               component['ComponentClass'] === componentData[ModelBrowserColumnNames1D.SubClass] &&
               component['Description'] == componentData[ModelBrowserColumnNames1D.Description]) {

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

DBSelectionManager.prototype.HighlightBrowserRow = function (row, key, containerDiv) {
     if (this.HighlightedComponentRow === row) {
          return;
     }

     var dataGrid = $("#" + containerDiv).dxDataGrid("instance");
     var selectedRows = dataGrid.getSelectedRowKeys("all");

     if (this.HighlightedComponentRow &&
          !selectedRows.includes(this.HighlightedComponentRowKey)) {
          if (this.HighlightedComponentRow.rowElement)
               this.RemoveHighlightColor(this.HighlightedComponentRow.rowElement[0]);
          else {
               this.RemoveHighlightColor(this.HighlightedComponentRow);
          }
     }

     // highlight new row  

     if (!selectedRows.includes(key)) {
          if (row.rowElement)
               this.ApplyHighlightColor(row.rowElement[0]);
          else {
               this.ApplyHighlightColor(row);
          }
     }

     this.HighlightedComponentRow = row;
     this.HighlightedComponentRowKey = key;
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

     var dataGrid = $("#" + viewerContainer).dxDataGrid("instance");
     var sheetData = dataGrid.getDataSource().items();

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
     var modelBrowserDataGrid = $("#" + modelBrowserContainer).dxDataGrid("instance");
     var modelBrowserData = modelBrowserDataGrid.getDataSource().items();
     if (modelBrowserData.length === 0) {
          return;
     }

     // find the row to be highlighted in viewer
     var selectedRowData = sheetData[thisRow.rowIndex];
     var name = selectedRowData[identifierColumns.name];
     var subClass = selectedRowData[identifierColumns.componentClass];

     for (var i = 0; i < modelBrowserData.length; i++) {
          var rowData = modelBrowserData[i];

          if (name === rowData[ModelBrowserColumnNames1D.Component.replace(/\s/g, '')] &&
               subClass === rowData[ModelBrowserColumnNames1D.SubClass.replace(/\s/g, '')]) {

               var row = modelBrowserDataGrid.getRowElement(i);
               var key = modelBrowserDataGrid.getKeyByRowIndex(i);
               // highlight row in model browser     
               this.HighlightBrowserRow(row[0], key, modelBrowserContainer);

               // scroll to selected row                 
               modelBrowserDataGrid.getScrollable().scrollToElement(row[0])

               break;
          }
     }
}

DBSelectionManager.prototype.GetSelectedComponentIds = function () {
     if (!(model.currentTabId in SourceManagers)) {
          return;
     }
     var sourceManager = SourceManagers[model.currentTabId];
     var selectedCompoents = this.GetSelectedComponents();

     var componentIds = [];
     for (id in sourceManager.ComponentIdVsData) {
          var compData = sourceManager.ComponentIdVsData[id];

          for (var i = 0; i < selectedCompoents.length; i++) {
               var selectedComponent = selectedCompoents[i];
               if (selectedComponent.Name === compData.name &&
                    selectedComponent.MainComponentClass === compData.mainClass &&
                    selectedComponent.ComponentClass === compData.subClass) {
                    componentIds.push(id);
               }
          }
     }

     return componentIds;
}