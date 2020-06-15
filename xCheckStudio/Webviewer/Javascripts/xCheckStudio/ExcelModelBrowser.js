function ExcelModeBrowser(id,
    modelBrowserContainer,
    viewerContainer,
    sheetData,
    selectedComponents) {

    // call super constructor
    ModelBrowser.call(this, id, modelBrowserContainer);

    this.ViewerContainer = viewerContainer;
    this.SheetData = sheetData;

    // selectiion manager
    this.SelectionManager = new ExcelSelectionManager(selectedComponents);

    this.LoadedSheet;
}

// assign ModelBrowser's method to this class
ExcelModeBrowser.prototype = Object.create(ModelBrowser.prototype);
ExcelModeBrowser.prototype.constructor = ExcelModeBrowser;

ExcelModeBrowser.prototype.CreateHeaders = function () {
    var columnHeaders = [];
    for (var i = 0; i < Object.keys(ModelBrowserColumns1D).length; i++) {
        columnHeader = {};
        var caption;
        var visible = true;
        var dataField;
        var width;
        if (i === ModelBrowserColumns1D.Select) {
            continue;
        }
        else if (i === ModelBrowserColumns1D.Component) {
            caption = ModelBrowserColumnNames1D.Component;
            dataField = ModelBrowserColumnNames1D.Component.replace(/\s/g, '');
            width = "40%";
        }
        else if (i === ModelBrowserColumns1D.MainClass) {
            caption = ModelBrowserColumnNames1D.MainClass;
            dataField = ModelBrowserColumnNames1D.MainClass.replace(/\s/g, '');
            width = "30%";
        }
        else if (i === ModelBrowserColumns1D.SubClass) {
            caption = ModelBrowserColumnNames1D.SubClass;
            dataField = ModelBrowserColumnNames1D.SubClass.replace(/\s/g, '');
            width = "30%";
        }
        else if (i === ModelBrowserColumns1D.Description) {
            caption = ModelBrowserColumnNames1D.Description;
            dataField = ModelBrowserColumnNames1D.Description.replace(/\s/g, '');
            width = "0%";
            visible =  false;
        }
        else if(i == ModelBrowserColumns1D.ComponentId) {
            caption = ModelBrowserColumnNames1D.ComponentId;
            dataField = ModelBrowserColumnNames1D.ComponentId.replace(/\s/g, '');
            width = "0%";
            visible =  false;
        }

        columnHeader["caption"] = caption;
        columnHeader["dataField"] = dataField;
        // columnHeader["dataType"] = "string";
        columnHeader["width"] = width;
        if(visible == false) {
            columnHeader["visible"] = visible;
        }
        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}

ExcelModeBrowser.prototype.CreateModelBrowser = function (sourceProperties) {
    if(sourceProperties !== null) {
        var _this = this;

        var columnHeaders = this.CreateHeaders();
        tableData = [];
        
        for(var componentId in sourceProperties) {
            var component = sourceProperties[componentId];
            if(component.MainComponentClass !== undefined && component.Name != undefined) {
                tableRowContent = {};
                tableRowContent[ModelBrowserColumnNames1D.Component.replace(/\s/g, '')] = component.Name;
                tableRowContent[ModelBrowserColumnNames1D.MainClass.replace(/\s/g, '')] = component.MainComponentClass;
                tableRowContent[ModelBrowserColumnNames1D.SubClass.replace(/\s/g, '')] = component.SubComponentClass;
                var description = "";
                for (var j = 0; j < component.properties.length; j++) {
                    var properties = component.properties[j];
                    if (properties["Name"] === "Description") {

                        description = properties["Value"];
                        break;
                    }
                }
                tableRowContent[ModelBrowserColumnNames1D.Description.replace(/\s/g, '')] = description;
                tableRowContent[ModelBrowserColumnNames1D.ComponentId.replace(/\s/g, '')] = component.ID;
                tableData.push(tableRowContent);
            }
        }

        this.LoadModelBrowserTable(this, columnHeaders, tableData);
    } 
};

ExcelModeBrowser.prototype.GetModelBrowserHeaderTable = function () {
    var modelBrowserData = document.getElementById(this.ModelBrowserContainer);
    return modelBrowserData.children[0];
}

ExcelModeBrowser.prototype.GetModelBrowserDataTable = function () {
    var modelBrowserData = document.getElementById(this.ModelBrowserContainer);
    return modelBrowserData.children[1];
}

ExcelModeBrowser.prototype.GetModelBrowserDataRows = function () {
    var modelBrowserDataTable = this.GetModelBrowserDataTable();

    return modelBrowserDataTable.getElementsByTagName("tr");
}

ExcelModeBrowser.prototype.getComponentstyleClass = function (componentName) {
    var componentStyleClass = componentName.replace(" ", "");
    componentStyleClass = componentStyleClass.replace(":", "");
    componentStyleClass = componentStyleClass.replace(".", "");
    componentStyleClass = componentStyleClass.replace("/", "");
   
    return componentStyleClass;
}

ExcelModeBrowser.prototype.GetSelectedComponents = function () {
    return this.SelectionManager.GetSelectedComponents();
}

ExcelModeBrowser.prototype.AddSelectedComponent = function (checkedComponent) {
    this.SelectionManager.AddSelectedComponent(checkedComponent);
}

ExcelModeBrowser.prototype.ClearSelectedComponent = function () {
    this.SelectionManager.ClearSelectedComponent();
}

ExcelModeBrowser.prototype.SelectedCompoentExists = function (componentRow) {
    return this.SelectionManager.SelectedCompoentExists(componentRow);
}

ExcelModeBrowser.prototype.ApplyHighlightColor = function (row) {
    // row.style.backgroundColor = "#B2BABB";
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = "#B2BABB"
    }
}

ExcelModeBrowser.prototype.RemoveHighlightColor = function (row) {
    // row.style.backgroundColor = "#ffffff";
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = "#ffffff"
    }
}

// ExcelModeBrowser.prototype.Clear = function () {   
//     var containerDiv = "#" + this.ModelBrowserContainer;

//     var browserContainer = document.getElementById(this.ModelBrowserContainer);
//     var parent = browserContainer.parentElement;

//     //remove html element which holds grid
//     $(containerDiv).remove();

//     //Create and add div with same id to add grid again
//     //devExtreme does not have destroy method. We have to remove the html element and add it again to create another table
//     var browserContainerDiv = document.createElement("div")
//     browserContainerDiv.id = this.ModelBrowserContainer;
//     var styleRule = ""
//     styleRule = "position: relative";
//     browserContainerDiv.setAttribute("style", styleRule);
//     parent.appendChild(browserContainerDiv);
    
//      // clear count
//      this.GetItemCountDiv().innerHTML = "";
// }

ExcelModeBrowser.prototype.LoadModelBrowserTable = function (_this, columnHeaders, tableData) {
    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;
    var loadingBrower = true;
    $(function () {
        $(containerDiv).dxDataGrid({
            dataSource: tableData,
            keyExpr: ModelBrowserColumnNames1D.ComponentId,
            columns: columnHeaders,
            columnAutoWidth: true,
            columnResizingMode: 'widget',
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            height: "100%",
            width: "100%",
            allowColumnResizing : true,
            hoverStateEnabled: true,
            // focusedRowEnabled: true,
            filterRow: {
                visible: true
            },
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always",
                recursive: true
            }, 
            paging: { enabled: false },
            onContentReady: function (e) {
                if(loadingBrower && _this.SelectionManager.ComponentIdvsSelectedComponents)
                {
                    e.component.selectRows(Object.keys(_this.SelectionManager.ComponentIdvsSelectedComponents));
                }
                loadingBrower = false;

                // show table view action button
                document.getElementById("tableViewAction" + _this.Id).style.display = "block";
            },  
            onInitialized: function (e) {
                model.views[_this.Id].tableViewInstance = e.component;
                model.views[_this.Id].tableViewWidget = "datagrid";

                // initialize the context menu
                var modelBrowserContextMenu = new ModelBrowserContextMenu();
                modelBrowserContextMenu.Init(_this);

                _this.ShowItemCount(tableData.length);

                document.getElementById("tableHeaderName" + _this.Id).innerText = GlobalConstants.TableView.DataBrowser;
            },
            onSelectionChanged: function (e) {
                if(e.currentSelectedRowKeys.length > 0) {
                    for(var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        rows = e.component.getVisibleRows();
                        var rowIndex = e.component.getRowIndexByKey(e.currentSelectedRowKeys[i])
                        var  row = e.component.getRowElement(rowIndex);
                        _this.SelectionManager.SelectComponent(row[0], "on", rows[rowIndex].data);
                    }
                }
                else {
                    for(var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        rows = e.component.getVisibleRows();
                        var rowIndex = e.component.getRowIndexByKey(e.currentDeselectedRowKeys[i])
                        var  row = e.component.getRowElement(rowIndex);
                        _this.SelectionManager.SelectComponent(row[0], "off", rows[rowIndex].data);
                    }
                }
            },
            onRowClick: function (e) {
                _this.SelectionManager.HighlightBrowserRow(e, e.key, _this.ModelBrowserContainer);
                _this.ShowSelectedSheetData(e.rowElement[0]);

                //property call out
                SourceManagers[_this.Id].OpenPropertyCalloutByCompId(e.data.ComponentId);
            },
            onDisposing:function(e){
                model.views[_this.Id].tableViewInstance = null;  
                model.views[_this.Id].tableViewWidget = null;
            }
        });
    });
}

ExcelModeBrowser.prototype.AddTableContentCount = function (containerId) {
    var modelBrowserData = document.getElementById(containerId);
    var modelBrowserDataTable = modelBrowserData.children[1];
    var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");

    var countBox;
    if (containerId === "modelTree1") {
        countBox = document.getElementById("SourceAComponentCount");
    }
    if (containerId === "modelTree2") {
        countBox = document.getElementById("SourceBComponentCount");
    }
    countBox.innerText = "Count: " + modelBrowserTableRows.length;
}


ExcelModeBrowser.prototype.LoadSheetDataTable = function (columnHeaders,
    tableData) {

    var _this = this;

    var containerDiv = "#" + this.ViewerContainer;

    return new Promise(function (resolve) {
        $(function () {

            $(containerDiv).dxDataGrid({
                dataSource: tableData,
                columns: columnHeaders,
                showBorders: true,
                showRowLines: true,
                allowColumnResizing : true,
                hoverStateEnabled: true,
                height: "100%",
                width: "100%",
                filterRow: {
                    visible: true
                },
                scrolling: {
                    mode: "standard"
                },
                paging: { enabled: false },
                onContentReady: function(e) {
                    return resolve(true);
                },
                onRowClick: function(e) {
                    _this.SelectionManager.HandleRowSelectInViewer(e.rowElement[0], _this.ModelBrowserContainer, _this.ViewerContainer);
                }

            });
        });
    
    });

}

ExcelModeBrowser.prototype.HighlightRowInSheetData = function (thisRow) {   
    var dataGrid = $("#" + this.ViewerContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();  
    

        if (data.length === 0) {
            return;
        }
    
        // get identifier column names
        var identifierColumns = {};
    
        var firstRow = data[0];
    
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
    
        if (identifierColumns.name === undefined ||
            identifierColumns.componentClass === undefined) {
            return;
        }
    
        // find the row to be highlighted in viewer
        var name = thisRow.cells[ModelBrowserColumns1D.Component].innerText.trim();
        //var mainClass = thisRow.cells[ModelBrowserColumns1D.MainClass].innerText.trim();
        var subClass = thisRow.cells[ModelBrowserColumns1D.SubClass].innerText.trim();
        
        for (var i = 0; i < data.length; i++) {
            var dataRow = data[i];
            if (name === dataRow[identifierColumns.name] &&
                subClass === dataRow[identifierColumns.componentClass]) {
    
                var row = dataGrid.getRowElement(i);

                if (this.SelectionManager.HighlightSheetRow(row[0])) {
                    dataGrid.getScrollable().scrollToElement(row[0])
                }
    
                break;
            }
        }
}

ExcelModeBrowser.prototype.ShowSelectedSheetData = function (browserRow) {

    var _this = this;
    var currentSheetName = browserRow.cells[ModelBrowserColumns1D.MainClass].innerText.trim();

    var mainComponentClasseData = this.SheetData[currentSheetName];
    var components = [];

    if (mainComponentClasseData !== {}) {       
        for (var subComponentClass in mainComponentClasseData) {
            for (var i = 0; i < mainComponentClasseData[subComponentClass].length; i++) {
                components.push(mainComponentClasseData[subComponentClass][i]);
            }
        }
        if (!components ||
            components.length === 0) {
            return;
        }
       
        var columnHeaders = [];
        var firstComponent = components[0];
        var firstComponentProperties = firstComponent.properties;
        for (var i = 0; i < firstComponentProperties.length; i++) {
            columnHeader = {};
            
            columnHeader["caption"] = firstComponentProperties[i].Name;
            columnHeader["dataField"] = firstComponentProperties[i].Name.replace(/\s/g, '');
            columnHeader["dataType"] = "string";
            columnHeader["width"] = "100px";

            columnHeaders.push(columnHeader);            
        }

        var tableData = [];
        for (var i = 0; i < components.length; i++) {

            var component = components[i];
            var tableRowContent = {};
            var properties = component.properties;

            for (var j = 0; j < properties.length; j++) {
                tableRowContent[columnHeaders[j].dataField] = properties[j].Value;
            }
            tableData.push(tableRowContent);
        }

     
        if (this.LoadedSheet !== currentSheetName) {
            this.LoadSheetDataTable(columnHeaders, tableData).then(function() {
                _this.HighlightRowInSheetData(browserRow);  
            });
            this.LoadedSheet = currentSheetName;
        }
        else {
            this.HighlightRowInSheetData(browserRow);  
        }
    }
}


