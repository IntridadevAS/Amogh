function DBModelBrowser(id,
    modelBrowserContainer,
    viewerContainer,
    dbData,
    selectedComponents) {

    // call super constructor
    ModelBrowser.call(this, id, modelBrowserContainer);
    this.ViewerContainer = viewerContainer;

    this.DBData = dbData;

    this.SelectedComponentRowFromDB;

    this.SelectionManager = new DBSelectionManager(selectedComponents);

    this.LoadedComponentClass
}

// assign ModelBrowser's method to this class
DBModelBrowser.prototype = Object.create(ModelBrowser.prototype);
DBModelBrowser.prototype.constructor = DBModelBrowser;

DBModelBrowser.prototype.CreateHeaders = function () {
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

DBModelBrowser.prototype.CreateModelBrowserTable = function (sourceProperties) {
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

        this.LoadModelBrowserTable(columnHeaders, tableData);
    } 
    // if (!this.DBData) {
    //     return;
    // }
    // // var _this = this;

    // var columnHeaders = this.CreateHeaders();

    // tableData = [];
    // //add each sheet to model browser 
    // // iterate over sheets from excel file
    // // filename.split('.')[0]
    // var rowKey = 1;
    // for (var component in this.DBData) {
    //     var mainComponentClass = component;
    //     var mainComponentStyleClass = mainComponentClass + "_" + this.ModelBrowserContainer;
    //     var styleList = undefined;
    //     var componentStyleClass = this.GetComponentstyleClass(mainComponentStyleClass);
    //     //set  row data 
    //     var rowData = [];
    //     rowData.push(mainComponentClass);
    //     rowData.push("");
    //     rowData.push("");
    //     rowData.push("");

    //     //add sheet names as 1st parent(collapsible row)
    //     // this.addComponentRow(styleList, componentStyleClass, rowData);
    //     var parentMainClassStyleList = componentStyleClass;

    //     //iterate over each component class in sheet
    //     for (var component in this.DBData[mainComponentClass]) {
    //         styleList = parentMainClassStyleList;
    //         var subComponentClass = component;
    //         var subComponentStyleClass = subComponentClass + "_" + this.ModelBrowserContainer;
    //         componentStyleClass = this.GetComponentstyleClass(subComponentStyleClass);

    //         //add component class as second level parent(collapsible row)
    //         //iterate over each component having same component class 
    //         var children = this.DBData[mainComponentClass][subComponentClass];
    //         for (i = 0; i < children.length; i++) {
    //             if (styleList !== undefined) {
    //                 styleList = styleList + " " + componentStyleClass;
    //             }
    //             else {
    //                 styleList = componentStyleClass;
    //             }
    //             var child = children[i];
    //             var name = child.Name;
    //             var rowData = [];

    //             //if component name or main component class is undefined then only add compoment row to model browser
    //             if (name !== undefined && mainComponentClass !== undefined) {

    //                 tableRowContent = {};
    //                 tableRowContent[ModelBrowserColumnNames1D.Component.replace(/\s/g, '')] = name;
    //                 tableRowContent[ModelBrowserColumnNames1D.MainClass.replace(/\s/g, '')] = mainComponentClass;
    //                 tableRowContent[ModelBrowserColumnNames1D.SubClass.replace(/\s/g, '')] = subComponentClass;


    //                 var description = "";
    //                 for (var j = 0; j < child.properties.length; j++) {
    //                     var childProperties = child.properties[j];
    //                     if (childProperties["Name"] === "Description") {

    //                         description = childProperties["Value"];
    //                         break;
    //                     }
    //                 }
    //                 tableRowContent[ModelBrowserColumnNames1D.Description.replace(/\s/g, '')] = description;
    //                 tableRowContent[ModelBrowserColumnNames1D.ComponentId.replace(/\s/g, '')] = rowKey;
    //                 tableData.push(tableRowContent);
    //                 rowKey++;
    //             }
    //         }
    //     }
    // }

    // this.LoadModelBrowserTable(columnHeaders, tableData);
}

DBModelBrowser.prototype.GetModelBrowserHeaderTable = function () {
    var modelBrowserData = document.getElementById(this.ModelBrowserContainer);
    return modelBrowserData.children[0];
}

DBModelBrowser.prototype.GetModelBrowserDataTable = function () {
    var modelBrowserData = document.getElementById(this.ModelBrowserContainer);
    return modelBrowserData.children[1];
}

DBModelBrowser.prototype.GetModelBrowserDataRows = function () {
    var modelBrowserDataTable = this.GetModelBrowserDataTable();

    return modelBrowserDataTable.getElementsByTagName("tr");
}

DBModelBrowser.prototype.GetComponentstyleClass = function (componentName) {
    var componentStyleClass = componentName.replace(" ", "");
    componentStyleClass = componentStyleClass.replace(":", "");
    componentStyleClass = componentStyleClass.replace(".", "");
    componentStyleClass = componentStyleClass.replace("/", "");

    return componentStyleClass;
}

DBModelBrowser.prototype.LoadModelBrowserTable = function (columnHeaders,
    tableData) {

    var _this = this;
    var loadingBrower = true;

    var containerDiv = "#" + this.ModelBrowserContainer;
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
            onInitialized: function (e) {
                model.views[_this.Id].tableViewInstance = e.component;
                model.views[_this.Id].tableViewWidget = "datagrid";
                
                // initialize the context menu
                var modelBrowserContextMenu = new ModelBrowserContextMenu();
                modelBrowserContextMenu.Init(_this);

                _this.ShowItemCount(tableData.length);

                document.getElementById("tableHeaderName" + _this.Id).innerText = GlobalConstants.TableView.DataBrowser;
            },
            onContentReady: function (e) {
                if(loadingBrower && _this.SelectionManager.ComponentIdvsSelectedComponents)
                {
                    e.component.selectRows(Object.keys(_this.SelectionManager.ComponentIdvsSelectedComponents));
                }
                loadingBrower = false;

                 // show table view action button
                 document.getElementById("tableViewAction" + _this.Id).style.display = "block";
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
            onRowClick: function(e) {
                // console.log(e)
                _this.SelectionManager.HighlightBrowserRow(e, e.key, _this.ModelBrowserContainer);
                _this.ShowSelectedDBData(e.rowElement[0]);

                //property call out
                SourceManagers[_this.Id].OpenPropertyCallout(e.data.ComponentId);                
            },
        });
    });
}

DBModelBrowser.prototype.AddTableContentCount = function (containerId) {
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

DBModelBrowser.prototype.ShowSelectedDBData = function (browserRow) {
    var _this = this;
    var mainclassname = browserRow.cells[ModelBrowserColumns1D.MainClass].innerText.trim();
    var mainComponentClassData = this.DBData[mainclassname];
    var components = [];

    
    if (mainComponentClassData !== {}) {
        for (var subComponentClass in mainComponentClassData) {
            for (var i = 0; i < mainComponentClassData[subComponentClass].length; i++) {
                components.push(mainComponentClassData[subComponentClass][i]);
            }
        }

        var columnHeaders = [];
        var firstComponent = components[0];
        var firstComponentProperties = firstComponent.properties;

        //var column = {};
        for (var i = 0; i < firstComponentProperties.length; i++) {
            var columnHeader = {};
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
            var property = component.properties;

            for (var j = 0; j < property.length; j++) {
                tableRowContent[columnHeaders[j].dataField] = property[j].Value;
            }
            tableData.push(tableRowContent);
        }

        if (this.LoadedComponentClass !== mainclassname) {
            this.LoadDBDataTable(columnHeaders, tableData).then(function() {
                _this.HighlightRowInDBData(browserRow);  
            });;
            this.LoadedComponentClass = mainclassname;
        }
        else {
            this.HighlightRowInDBData(browserRow);
        }    
    }
}

DBModelBrowser.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#9999ff";
}

DBModelBrowser.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}

DBModelBrowser.prototype.HighlightRowInDBData = function (thisRow) {

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

        // if (identifierColumns.length === 3) {
        //     break;
        // }
    }

    if (identifierColumns.name === undefined ||
        identifierColumns.componentClass === undefined) {
        return;
    }


    // find the row to be highlighted in viewer
    var name = thisRow.cells[ModelBrowserColumns1D.Component].innerText.trim();
    var subClass = thisRow.cells[ModelBrowserColumns1D.SubClass].innerText.trim();

    for (var i = 0; i < data.length; i++) {
        var dataRow = data[i];

        if (name === dataRow[identifierColumns.name] &&
            subClass === dataRow[identifierColumns.componentClass]) {

            var row = dataGrid.getRowElement(i);

            if (this.SelectionManager.HighlightDBRow(row[0])) {
                dataGrid.getScrollable().scrollToElement(row[0])
            }

            break;
        }
    }
}

// DBModelBrowser.prototype.Clear = function () {
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

//     // clear count
//     this.GetItemCountDiv().innerHTML = "";
// }

DBModelBrowser.prototype.LoadDBDataTable = function (columnHeaders,
    tableData) {

    var containerDiv = "#" + this.ViewerContainer;
    var _this = this;
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
                hoverStateEnabled: true,
                // focusedRowEnabled: true,
                filterRow: {
                    visible: true
                },
                onContentReady: function(e) {
                    return resolve(true);
                },
                selection: {
                    mode: "multiple",
                    showCheckBoxesMode: "always",
                    recursive: true
                }, 
                paging: { enabled: false },
                onRowClick: function(e) {
                    // console.log(e)
                    _this.SelectionManager.HandleRowSelectInViewer(e.rowElement[0], _this.ModelBrowserContainer, _this.ViewerContainer);
                },
            });
        });
    });
}

DBModelBrowser.prototype.SelectedCompoentExists = function (componentRow) {
    return this.SelectionManager.SelectedCompoentExists(componentRow);
}

DBModelBrowser.prototype.GetSelectedComponents = function () {
    return this.SelectionManager.GetSelectedComponents();
}

DBModelBrowser.prototype.AddSelectedComponent = function (checkedComponent) {
    this.SelectionManager.AddSelectedComponent(checkedComponent);
}

DBModelBrowser.prototype.ClearSelectedComponent = function () {
    this.SelectionManager.ClearSelectedComponent();
}

