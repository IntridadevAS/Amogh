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

    this.LoadedComponentClass = null;

    this.ContextMenu = null;

    this.GADataTable = null;
}

// assign ModelBrowser's method to this class
DBModelBrowser.prototype = Object.create(ModelBrowser.prototype);
DBModelBrowser.prototype.constructor = DBModelBrowser;

DBModelBrowser.prototype.GetSelectedIds = function () {
    return this.SelectionManager.SelectedComponentIds;
}

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

DBModelBrowser.prototype.CreateModelBrowser = function (sourceProperties) {
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
                _this.ContextMenu = new ModelBrowserContextMenu();
                _this.ContextMenu.ModelBrowser = _this;

                _this.ShowItemCount(tableData.length);

                // set active table view type
                model.views[_this.Id].activeTableView = GlobalConstants.TableView.DataBrowser;

                document.getElementById("tableHeaderName" + _this.Id).innerText = GlobalConstants.TableView.DataBrowser;
            },
            onContentReady: function (e) {
                if(loadingBrower && _this.SelectionManager.SelectedComponentIds)
                {
                    e.component.selectRows(_this.SelectionManager.SelectedComponentIds);
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
                SourceManagers[_this.Id].OpenPropertyCalloutByCompId(e.data.ComponentId);                
            },
            onContextMenuPreparing: function (e) {
                if (e.row.rowType === "data") {
                    e.items = [ 
                        {
                            text: "Properties",
                            onItemClick: function () {
                                let rowsData = e.component.getSelectedRowsData();
                                if (rowsData.length === 0) {
                                    return;
                                }

                                _this.ContextMenu.OnMenuItemClicked("properties", rowsData[0]);
                            }
                        },                      
                        {
                            text: "Reference",                           
                            onItemClick: function () {
                                _this.ContextMenu.OnMenuItemClicked("reference");
                            }
                        }
                    ];
                }
            },
            onDisposing:function(e){
                model.views[_this.Id].tableViewInstance = null;  
                model.views[_this.Id].tableViewWidget = null;

                _this.SelectionManager.SelectedComponentIds = [];

                _this.ContextMenu = null;

                // discard the viewer table
                if (_this.GADataTable) {
                    _this.DisposeGAGrid(_this.ViewerContainer);
                }
            }
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
    // var identifierColumns = {};
    // var firstRow = data[0];
    var identifierColumns = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(SourceManagers[this.Id].SourceType);
    if (identifierColumns === null) {
        return;
    }
    // for (var column in firstRow) {
    //     if (column.toLowerCase() === "component class" ||
    //         column.toLowerCase() === "componentclass") {
    //         identifierColumns["componentClass"] = column;
    //     }
    //     else if (column.toLowerCase() === "name") {
    //         identifierColumns["name"] = column;
    //     }
    //     else if (column.toLowerCase() === "tagnumber" &&
    //         !("name" in identifierColumns)) {
    //         identifierColumns["name"] = column;
    //     }
    //     else if (column.toLowerCase() === "description") {
    //         identifierColumns["description"] = column;
    //     }
    // }
    if (!identifierColumns.name||
        !identifierColumns.subClass) {
        return;
    }

    // find the row to be highlighted in viewer
    var name = thisRow.cells[ModelBrowserColumns1D.Component].innerText.trim();
    var subClass = thisRow.cells[ModelBrowserColumns1D.SubClass].innerText.trim();

    for (var i = 0; i < data.length; i++) {
        var dataRow = data[i];

        if (name === dataRow[identifierColumns.name] &&
            subClass === dataRow[identifierColumns.subClass]) {

            var row = dataGrid.getRowElement(i);

            if (this.SelectionManager.HighlightDBRow(row[0])) {
                dataGrid.getScrollable().scrollToElement(row[0])
            }

            break;
        }
    }
}

DBModelBrowser.prototype.LoadDBDataTable = function (columnHeaders,
    tableData) {

    var containerDiv = "#" + this.ViewerContainer;
    var _this = this;
    return new Promise(function (resolve) {
        $(function () {
            _this.GADataTable = $(containerDiv).dxDataGrid({
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
                onRowClick: function (e) {
                    // console.log(e)
                    _this.SelectionManager.HandleRowSelectInViewer(e.rowElement[0], _this.ModelBrowserContainer, _this.ViewerContainer);
                },
                onDisposing: function (e) {
                    _this.GADataTable = null;
                    _this.LoadedComponentClass = null;
                }
            });
        });
    });
}

// DBModelBrowser.prototype.SelectedCompoentExists = function (componentRow) {
//     return this.SelectionManager.SelectedCompoentExists(componentRow);
// }

DBModelBrowser.prototype.GetSelectedComponents = function () {
    return this.SelectionManager.GetSelectedComponents();
}

DBModelBrowser.prototype.AddSelectedComponent = function (checkedComponent) {
    this.SelectionManager.AddSelectedComponent(checkedComponent);
}

DBModelBrowser.prototype.ClearSelectedComponent = function () {
    this.SelectionManager.ClearSelectedComponent();
}

