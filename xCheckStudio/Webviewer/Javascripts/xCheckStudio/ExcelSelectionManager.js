function ExcelSelectionManager(selectedComponentIds) {
     // call super constructor
     SelectionManager.call(this);

     this.SelectedComponentIds = selectedComponentIds? Object.keys(selectedComponentIds) : [];
     this.SelectedCompoents = [];

     this.SelectedSheetRow;
}

// assign SelectionManager's method to this class
ExcelSelectionManager.prototype = Object.create(SelectionManager.prototype);
ExcelSelectionManager.prototype.constructor = ExcelSelectionManager;

ExcelSelectionManager.prototype.SelectComponent = function (currentRow, 
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
          checkedComponent['ComponentId'] = componentData[ModelBrowserColumnNames1D.ComponentId];


          this.SelectedCompoents.push(checkedComponent);

          // highlight selected row
          this.ApplyHighlightColor(currentRow);

          // maintain selected rows
          if (!this.SelectedComponentIds.includes(componentData.ComponentId)) {
               this.SelectedComponentIds.push(componentData.ComponentId);
          }
     }
     else if (checkBoxState === "off" && this.SelectedCompoentExists(componentData)) {
          this.RemoveFromselectedCompoents(componentData);

          // restore color
          this.RemoveHighlightColor(currentRow);

          // maintain selected rows
          if (this.SelectedComponentIds.includes(componentData.ComponentId)) {
               var index = this.SelectedComponentIds.indexOf(componentData.ComponentId);
               if (index !== -1) {
                    this.SelectedComponentIds.splice(index, 1);
               }
          }
     }
}

ExcelSelectionManager.prototype.SelectedCompoentExists = function (componentData) {
     for (var i = 0; i < this.SelectedCompoents.length; i++) {
          var component = this.SelectedCompoents[i];
          if (component['Name'] === componentData[ModelBrowserColumnNames1D.Component] &&
          component['MainComponentClass'] === componentData[ModelBrowserColumnNames1D.MainClass] &&
          component['ComponentClass'] === componentData[ModelBrowserColumnNames1D.SubClass] &&
          component['Description'] == componentData[ModelBrowserColumnNames1D.Description] &&
          component['ComponentId'] == componentData[ModelBrowserColumnNames1D.ComponentId]) {
               return true;
          }
     }

     return false;
}

ExcelSelectionManager.prototype.RemoveFromselectedCompoents = function (componentData) {
     for (var i = 0; i < this.SelectedCompoents.length; i++) {
          var component = this.SelectedCompoents[i];
          if (component['Name'] === componentData[ModelBrowserColumnNames1D.Component] &&
          component['MainComponentClass'] === componentData[ModelBrowserColumnNames1D.MainClass] &&
          component['ComponentClass'] === componentData[ModelBrowserColumnNames1D.SubClass] &&
          component['Description'] == componentData[ModelBrowserColumnNames1D.Description] &&
          component['ComponentId'] == componentData[ModelBrowserColumnNames1D.ComponentId]) {

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

ExcelSelectionManager.prototype.HighlightBrowserRow = function (row, key, containerDiv) {
     if (this.HighlightedComponentRow === row) {
          return;
     }

     var dataGrid = $("#" + containerDiv).dxDataGrid("instance");
     var selectedRows = dataGrid.getSelectedRowKeys("all");

     if (this.HighlightedComponentRow &&
          !selectedRows.includes(this.HighlightedComponentRowKey)) {
          if(this.HighlightedComponentRow.rowElement)
               this.RemoveHighlightColor(this.HighlightedComponentRow.rowElement[0]);
          else {
               this.RemoveHighlightColor(this.HighlightedComponentRow);
          }
     }

     // highlight new row  
     if(!selectedRows.includes(key)) {
          if(row.rowElement)
               this.ApplyHighlightColor(row.rowElement[0]);
          else {
               this.ApplyHighlightColor(row);
          }
     }

     this.HighlightedComponentRow = row;
     this.HighlightedComponentRowKey = key;
}

/* 
  This function 
*/
ExcelSelectionManager.prototype.HandleRowSelectInViewer = function (
     thisRow,
     modelBrowserContainer,
     viewerContainer) {

     if (!this.HighlightSheetRow(thisRow)) {
          return;
     }

     var dataGrid = $("#" + viewerContainer).dxDataGrid("instance");
     var sheetData = dataGrid.getDataSource().items();

     // get identifier properties
     var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(SourceManagers[model.currentTabId].SourceType);
     if (identifierProperties === null ||
          !identifierProperties.name ||
          !identifierProperties.subClass) {
          return;
     }

     // get model browser all rows data
     var modelBrowserDataGrid = $("#" + modelBrowserContainer).dxDataGrid("instance");
     var modelBrowserData = modelBrowserDataGrid.getDataSource().items();
     if (modelBrowserData.length === 0) {
          return;
     }

     //        // find the row to be highlighted in viewer
     var selectedRowData = sheetData[thisRow.rowIndex];
     var name = selectedRowData[identifierProperties.name];
     var subClass = selectedRowData[identifierProperties.subClass];


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

               if (viewerContainer.toLowerCase() === "visualizera") {
                    SourceManagers["a"].OpenPropertyCalloutByCompId(rowData.ComponentId);
               }
               else if (viewerContainer.toLowerCase() === "visualizerb") {
                    SourceManagers["b"].OpenPropertyCalloutByCompId(rowData.ComponentId);
               }
               else if (viewerContainer.toLowerCase() === "visualizerc") {
                    SourceManagers["c"].OpenPropertyCalloutByCompId(rowData.ComponentId);
               }
               else if (viewerContainer.toLowerCase() === "visualizerd") {
                    SourceManagers["d"].OpenPropertyCalloutByCompId(rowData.ComponentId);
               }

               break;
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

     //row.style.backgroundColor = "#B2BABB";
     for (var j = 0; j < row.cells.length; j++) {
          cell = row.cells[j];
          cell.style.backgroundColor = "#B2BABB";
     }

     this.SelectedSheetRow = row;

     return true;
}

ExcelSelectionManager.prototype.GetSelectedComponentIds = function () {
     // if (!(model.currentTabId in SourceManagers)) {
     //      return;
     // }
     // var sourceManager = SourceManagers[model.currentTabId];
     var selectedCompoents = this.GetSelectedComponents();

     var componentIds = [];
     for (var i = 0; i < selectedCompoents.length; i++) {
          var selectedComponent = selectedCompoents[i];
          componentIds.push(Number(selectedComponent["ComponentId"]));
     }   
    
     return componentIds;
}