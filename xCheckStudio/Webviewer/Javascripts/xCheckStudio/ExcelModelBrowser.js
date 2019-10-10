function ExcelModeBrowser(modelBrowserContainer,
    viewerContainer,
    sheetData,
    selectedComponents) {

    // call super constructor
    ModelBrowser.call(this, modelBrowserContainer);

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
        else if(i == ModelBrowserColumns1D.RowKey) {
            caption = ModelBrowserColumnNames1D.RowKey;
            dataField = ModelBrowserColumnNames1D.RowKey.replace(/\s/g, '');
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

ExcelModeBrowser.prototype.CreateModelBrowser = function () {
    if (this.SheetData !== null) {
        var _this = this;


        var columnHeaders = this.CreateHeaders();

        tableData = [];

        //add each sheet to model browser 
        // iterate over sheets from excel file
        var rowKey = 1;
        for (var sheet in this.SheetData) {
            var mainComponentClass = sheet;
            var mainComponentStyleClass = mainComponentClass + "_" + this.ModelBrowserContainer;
            var styleList = undefined;
            var componentStyleClass = this.getComponentstyleClass(mainComponentStyleClass);

            //add sheet names as 1st parent(collapsible row)
            // this.addComponentRow(styleList, componentStyleClass, rowData);
            var parentMainClassStyleList = componentStyleClass;

            //iterate over each component class in sheet

            for (var component in this.SheetData[mainComponentClass]) {
                styleList = parentMainClassStyleList;
                var subComponentClass = component;
                var subComponentStyleClass = subComponentClass + "_" + this.ModelBrowserContainer;
                componentStyleClass = this.getComponentstyleClass(subComponentStyleClass);

                //add component class as second level parent(collapsible row)
                //iterate over each component having same component class 
                var children = this.SheetData[mainComponentClass][subComponentClass];
                for (i = 0; i < children.length; i++) {
                    if (styleList !== undefined) {
                        styleList = styleList + " " + componentStyleClass;
                    }
                    else {
                        styleList = componentStyleClass;
                    }
                    var child = children[i];
                    var name = child.Name;
                    //var rowData = [];

                    //if component name or main component class is undefined then only add compoment row to model browser
                    if (name !== undefined &&
                        mainComponentClass !== undefined) {

                        tableRowContent = {};
                        // var checkBox = document.createElement("INPUT");
                        // checkBox.setAttribute("type", "checkbox");
                        // // checkBox.checked = false;  
                        // checkBox.checked = _this.SelectionManager.IsComponentChecked(name, mainComponentClass, subComponentClass);

                        // // select component check box state change event
                        // checkBox.onchange = function () {
                        //     _this.SelectionManager.HandleSelectFormCheckBox(this);
                        // }

                        //tableRowContent[columnHeaders[0].name] = checkBox;
                        tableRowContent[ModelBrowserColumnNames1D.Component.replace(/\s/g, '')] = name;
                        tableRowContent[ModelBrowserColumnNames1D.MainClass.replace(/\s/g, '')] = mainComponentClass;
                        tableRowContent[ModelBrowserColumnNames1D.SubClass.replace(/\s/g, '')] = subComponentClass;

                        var description = "";
                        for (var j = 0; j < child.properties.length; j++) {
                            var childProperties = child.properties[j];
                            if (childProperties["Name"] === "Description") {

                                description = childProperties["Value"];
                                break;
                            }
                        }
                        tableRowContent[ModelBrowserColumnNames1D.Description.replace(/\s/g, '')] = description;
                        tableRowContent[ModelBrowserColumnNames1D.RowKey.replace(/\s/g, '')] = rowKey;
                        tableData.push(tableRowContent);
                        rowKey++;
                    }
                }
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
    // while (this.NodeGroups.includes(componentStyleClass)) {
    //     componentStyleClass += "-" + this.revisedRandId();
    // }
    return componentStyleClass;
}

ExcelModeBrowser.prototype.revisedRandId = function () {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
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

ExcelModeBrowser.prototype.Clear = function () {   
    var containerDiv = "#" + this.ModelBrowserContainer;

    var browserContainer = document.getElementById(this.ModelBrowserContainer);
    var parent = browserContainer.parentElement;

    //remove html element which holds grid
    $(containerDiv).remove();

    //Create and add div with same id to add grid again
    //devExtreme does not have destroy method. We have to remove the html element and add it again to create another table
    var browserContainerDiv = document.createElement("div")
    browserContainerDiv.id = this.ModelBrowserContainer;
    var styleRule = ""
    styleRule = "position: relative";
    browserContainerDiv.setAttribute("style", styleRule);
    parent.appendChild(browserContainerDiv);
    
     // clear count
     this.GetItemCountDiv().innerHTML = "";
}

ExcelModeBrowser.prototype.LoadModelBrowserTable = function (_this, columnHeaders, tableData) {
    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;

    $(function () {
        $(containerDiv).dxDataGrid({
            dataSource: tableData,
            keyExpr: "RowKey",
            columns: columnHeaders,
            columnAutoWidth: true,
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            height: "100%",
            width: "100%",
            allowColumnResizing : true,
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
            onInitialized: function(e) {
                _this.ShowItemCount(tableData.length);
            },
            onSelectionChanged: function (e) {
                if(e.currentSelectedRowKeys.length > 0) {
                    for(var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        rows = e.component.getVisibleRows();
                        var rowIndex = e.component.getRowIndexByKey(e.currentSelectedRowKeys[i])
                        var  row = e.component.getRowElement(rowIndex);
                        _this.SelectionManager.HandleSelectFormCheckBox(row[0], "on", rows[rowIndex].data);
                    }
                }
                else {
                    for(var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        rows = e.component.getVisibleRows();
                        var rowIndex = e.component.getRowIndexByKey(e.currentDeselectedRowKeys[i])
                        var  row = e.component.getRowElement(rowIndex);
                        _this.SelectionManager.HandleSelectFormCheckBox(row[0], "off", rows[rowIndex].data);
                    }
                }
            },
            onRowClick: function(e) {
                _this.SelectionManager.HighlightBrowserRow(e, e.key, _this.ModelBrowserContainer);
                _this.ShowSelectedSheetData(e.rowElement[0]);
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


