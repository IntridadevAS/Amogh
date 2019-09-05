function DBModelBrowser(modelBrowserContainer,
    viewerContainer,
    dbData,
    selectedComponents) {

    // call super constructor
    ModelBrowser.call(this, modelBrowserContainer);
    this.ViewerContainer = viewerContainer;

    this.DBData = dbData;

    this.SelectedComponentRowFromDB;

    this.SelectionManager = new DBSelectionManager(selectedComponents);

    this.LoadedComponentClass
}

// assign ModelBrowser's method to this class
DBModelBrowser.prototype = Object.create(ModelBrowser.prototype);
DBModelBrowser.prototype.constructor = DBModelBrowser;

DBModelBrowser.prototype.CreateHeaders = function()
    {
        var columnHeaders = [];
        for (var i = 0; i < Object.keys(ModelBrowserColumns1D).length; i++) {
            columnHeader = {};
            var headerText;
            if (i === ModelBrowserColumns1D.Select) {
                continue;
            }
            else if (i === ModelBrowserColumns1D.Component) {
                headerText = ModelBrowserColumnNames1D.Component;
                key = ModelBrowserColumnNames1D.Component.replace(/\s/g,'');
                width = "25%";
            }
            else if (i === ModelBrowserColumns1D.MainClass) {
                headerText = ModelBrowserColumnNames1D.MainClass;
                key = ModelBrowserColumnNames1D.MainClass.replace(/\s/g,'');
                width = "25%";
            }
            else if (i === ModelBrowserColumns1D.SubClass) {
                headerText = ModelBrowserColumnNames1D.SubClass;
                key = ModelBrowserColumnNames1D.SubClass.replace(/\s/g,'');
                width = "25%";
            }
            else if (i === ModelBrowserColumns1D.Description) 
            {
                headerText = ModelBrowserColumnNames1D.Description;
                key = ModelBrowserColumnNames1D.Description.replace(/\s/g,'');
                width = "25%";
            }            

            columnHeader["headerText"] = headerText;
            columnHeader["key"] = key;
            columnHeader["dataType"] = "string";
            columnHeader["width"] = width;
            columnHeaders.push(columnHeader);
        }

        return columnHeaders;
}

DBModelBrowser.prototype.CreateModelBrowserTable = function () {

    if (!this.DBData) {
        return;
    }
    // var _this = this;

    var columnHeaders = this.CreateHeaders();

    // for (var i = 0; i < 4; i++) {
    //     columnHeader = {};
    //     var temp = {};
    //     if (i === 0) {
    //         temp["title"] = "";
    //         temp["name"] = "checkbox";
    //         temp["width"] = "20";
    //         columnHeaders.push(temp);
    //     }
    //     var title;
    //     if (i === 0) {
    //         name = "Name";
    //         title = "Item";
    //         width = "40";
    //     }
    //     else if (i === 1) {
    //         name = "Category";
    //         title = "Category";
    //         width = "100";
    //     }
    //     else if (i === 2) {
    //         name = "ComponentClass";
    //         title = "Item Class";
    //         width = "100";
    //     }
    //     else if (i === 3) {
    //         name = "Description";
    //         title = "Description";
    //         width = "100";
    //     }
    //     columnHeader["name"] = name;
    //     columnHeader["title"] = title;
    //     columnHeader["type"] = "text";
    //     columnHeader["width"] = width;
    //     columnHeaders.push(columnHeader);
    // }
   
    tableData = [];
    //add each sheet to model browser 
    // iterate over sheets from excel file
    // filename.split('.')[0]
    for (var component in this.DBData) {
        var mainComponentClass = component;
        var mainComponentStyleClass = mainComponentClass + "_" + this.ModelBrowserContainer;
        var styleList = undefined;
        var componentStyleClass = this.GetComponentstyleClass(mainComponentStyleClass);
        //set  row data 
        var rowData = [];
        rowData.push(mainComponentClass);
        rowData.push("");
        rowData.push("");
        rowData.push("");

        //add sheet names as 1st parent(collapsible row)
        // this.addComponentRow(styleList, componentStyleClass, rowData);
        var parentMainClassStyleList = componentStyleClass;

        //iterate over each component class in sheet
        for (var component in this.DBData[mainComponentClass]) {
            styleList = parentMainClassStyleList;
            var subComponentClass = component;
            var subComponentStyleClass = subComponentClass + "_" + this.ModelBrowserContainer;
            componentStyleClass = this.GetComponentstyleClass(subComponentStyleClass);

            //add component class as second level parent(collapsible row)
            //iterate over each component having same component class 
            var children = this.DBData[mainComponentClass][subComponentClass];
            for (i = 0; i < children.length; i++) {
                if (styleList !== undefined) {
                    styleList = styleList + " " + componentStyleClass;
                }
                else {
                    styleList = componentStyleClass;
                }
                var child = children[i];
                var name = child.Name;
                var rowData = [];

                //if component name or main component class is undefined then only add compoment row to model browser
                if (name !== undefined && mainComponentClass !== undefined) {

                    tableRowContent = {};
                    // var checkBox = document.createElement("INPUT");
                    // checkBox.setAttribute("type", "checkbox");
                    // //checkBox.checked = false;
                    // checkBox.checked = this.SelectionManager.IsComponentChecked(name, 
                    //                                                              mainComponentClass, 
                    //                                                              subComponentClass);
                    // checkBox.onchange = function () {
                    //     this.SelectionManager.HandleSelectFormCheckBox(this);                        
                    // }

                    //tableRowContent[columnHeaders[0].name] = checkBox;
                    tableRowContent[ModelBrowserColumnNames1D.Component.replace(/\s/g,'')] = name;
                    tableRowContent[ModelBrowserColumnNames1D.MainClass.replace(/\s/g,'')] = mainComponentClass;
                    tableRowContent[ModelBrowserColumnNames1D.SubClass.replace(/\s/g,'')] = subComponentClass;


                    var description = "";
                    for (var j = 0; j < child.properties.length; j++) {
                        var childProperties = child.properties[j];
                        if (childProperties["Name"] === "Description") {

                            description = childProperties["Value"];
                            break;
                        }
                    }
                    tableRowContent[ModelBrowserColumnNames1D.Description.replace(/\s/g,'')] = description;
                    tableData.push(tableRowContent);
                }
            }
        }
    }
    
    this.LoadModelBrowserTable(columnHeaders, tableData);

    // // maintain first row as selected row by default
    // var modelBrowserTableRows = this.GetModelBrowserDataRows();;                
    // this.SelectionManager.HandleRowSelect(modelBrowserTableRows[0]);
    // this.ShowSelectedDBData(modelBrowserTableRows[0]);   
   
  
    // var modelBrowserHeaderTable = this.GetModelBrowserHeaderTable();
    // modelBrowserHeaderTable.style.position = "fixed"
    // modelBrowserHeaderTable.style.width = "543px";

    // var modelBrowserDataTable = this.GetModelBrowserDataTable();
    // modelBrowserDataTable.style.position = "static"
    // modelBrowserDataTable.style.width = "556px";
    // modelBrowserDataTable.style.margin = "47px 0px 0px 0px"  
}

DBModelBrowser.prototype.GetModelBrowserHeaderTable = function()
{
    var modelBrowserData = document.getElementById(this.ModelBrowserContainer);
    return modelBrowserData.children[0];
}

DBModelBrowser.prototype.GetModelBrowserDataTable = function()
{
    var modelBrowserData = document.getElementById(this.ModelBrowserContainer);
    return modelBrowserData.children[1];
}

DBModelBrowser.prototype.GetModelBrowserDataRows = function()
{   
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
        
        var containerDiv = "#" + this.ModelBrowserContainer;  

            $(function () {
                //var table = JSON.stringify(tableData);
                var isFiredFromCheckbox = false;
                $(containerDiv).igGrid({
                    columns: columnHeaders,
                    autofitLastColumn: false,
                    autoGenerateColumns: false,
                    dataSource : tableData,              
                    responseDataKey: "results",
                    autoCommit: true,
                    height: "100%",
                    width: "100%",
                    alternateRowStyles : false,
                    features: [
                        {
                            name: "Sorting",
                            sortingDialogContainment: "window"
                        },
                        {
                            name: "Filtering",
                            type: "local",
                            dataFiltered: function (evt, ui) {
                                //  var filteredData = evt.target.rows;
                                // _this.RestoreBackgroundColorOfFilteredRows(filteredData);
                            }
                        },
                        {
                            name: "Selection",
                            mode: 'row',
                            multipleSelection: true,
                            activation: true,
                            rowSelectionChanging: function (evt, ui) {

                                if (isFiredFromCheckbox) {
                                    isFiredFromCheckbox = false;
                                } else {
                                    _this.SelectionManager.HighlightBrowserRow(ui.row.element[0]);
                                    _this.ShowSelectedDBData(ui.row.element[0]);
                                    return false;
                                }

                            }
                        },
                        {
                            name: "RowSelectors",
                            enableCheckBoxes: true,
                            enableRowNumbering: false,
                            enableSelectAllForPaging: true, // this option is true by default
                            checkBoxStateChanging: function (evt, ui) {
                                //we use this variable as a flag whether the selection is coming from a checkbox
                                isFiredFromCheckbox = true;                          
                            },
                            checkBoxStateChanged: function (evt, ui) {

                                if (ui.isHeader) {

                                    var data = $(containerDiv).data("igGrid").dataSource.dataView();
                                    if (data.length === 0) {
                                        return;
                                    }

                                    for (var rowIndex in data) {
                                        // var record = data[rowIndex];

                                        var index = parseInt(rowIndex);
                                        if (index === NaN) {
                                            continue;
                                        }
                                        //var rowKey = record.ig_pk;
                                        var rowData = _this.GetDataFromSelectedRow(rowIndex, containerDiv);
                                        var row = $(containerDiv).igGrid("rowAt", index);
                                        _this.SelectionManager.HandleSelectFormCheckBox(row, ui.state, rowData);
                                    }
                                }
                                else {
                                    var rowData = _this.GetDataFromSelectedRow(ui.rowIndex, containerDiv);
                                    _this.SelectionManager.HandleSelectFormCheckBox(ui.row[0], ui.state, rowData);

                                    // load corresponding sheet in viewr and highlight corrsponding row
                                    _this.ShowSelectedDBData(ui.row[0]);
                                }
                            }
                        },
                        {
                            name: "Resizing"
                        }
                    ]    
                });
            });
    }

// DBModelBrowser.prototype.LoadModelBrowserTable = function (_this,
//     columnHeaders,
//     tableData,
//     viewerContainer) {

//     $(function () {
//         var db = {
//             loadData: filter => {
//                 console.debug("Filter: ", filter);
//                 let ComponentClass = (filter.ComponentClass || "").toLowerCase();
//                 let name = (filter.Name || "").toLowerCase();
//                 let Category = (filter.MainComponentClass || "").toLowerCase();
//                 let Description = (filter.Description || "").toLowerCase();
//                 let dmy = parseInt(filter.dummy, 10);
//                 // this.recalculateTotals = true;
//                 return $.grep(tableData, row => {
//                     return (!ComponentClass || row.ComponentClass.toLowerCase().indexOf(ComponentClass) >= 0)
//                         && (!name || row.Name.toLowerCase().indexOf(name) >= 0)
//                         && (!Category || row.MainComponentClass.toLowerCase().indexOf(Category) >= 0)
//                         && (!Description || row.Description.toLowerCase().indexOf(Description) >= 0)
//                         && (isNaN(dmy) || row.dummy === dmy);
//                 });
//             }
//         };

//         $(viewerContainer).jsGrid({
//             height: "364px",
//             width: "556px",
//             filtering: true,
//             sorting: true,
//             autoload: true,
//             controller: db,
//             data: tableData,
//             fields: columnHeaders,
//             margin: "0px",
//             checked: true,
//             onRefreshed: function (config) {
//                 _this.AddTableContentCount(this._container.context.id);

//             },
//             rowClick: function (args) {
     
//                 _this.SelectionManager.HandleRowSelect(args.event.currentTarget);  
//                 _this.ShowSelectedDBData(args.event.currentTarget);                
//             }
//         });

//     });

//     //add all rows to this.selectedComponents array
//     // this.addselectedRowsToArray(viewerContainer)


//     var container = document.getElementById(viewerContainer.replace("#", ""));
//     container.style.width = "556px"
//     container.style.height = "364px"
//     container.style.margin = "0px"
//     container.style.overflowX = "hide";
//     container.style.overflowY = "scroll";
//     container.style.padding = "0";
// }


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
    var mainclassname = browserRow.cells[ModelBrowserColumns1D.MainClass].innerText.trim();
    // var SubClassName = browserRow.cells[3].innerText.trim()
    // var viewerContainerData;
    // if (this.ModelBrowserContainer === "modelTree1") {
    //     viewerContainerData = document.getElementById("viewerContainer1")
    // }
    // else if (this.ModelBrowserContainer === "modelTree2") {
    //     viewerContainerData = document.getElementById("viewerContainer2")
    // }

    // if (viewerContainerData.childElementCount > 1 && 
    //     viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === mainclassname) {
    //     this.HighlightRowInDBData(browserRow);
    //     return;
    // }

    var mainComponentClassData = this.DBData[mainclassname];
    var components = [];

    // if (Object.keys(mainComponentClassData).length > 0) {
    //     if (viewerContainerData.childElementCount > 1) {
    //         for (var subComponentClass in mainComponentClassData) {
    //             if (viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === subComponentClass) {
    //                 this.HighlightRowInDBData(browserRow);
    //                 return;
    //             }
    //         }
    //     }
    // }

    if (mainComponentClassData !== {}) {
        // if (browserRow.cells[1].innerText !== "" && 
        //     browserRow.cells[2].innerText !== "") {
        for (var subComponentClass in mainComponentClassData) {
            for (var i = 0; i < mainComponentClassData[subComponentClass].length; i++) {
                components.push(mainComponentClassData[subComponentClass][i]);
            }
        }

        // var sheetProperties;
        // {
        //     for (var subComponent in mainComponentClassData) {
        //         if (mainComponentClassData[subComponent][0].Name === browserRow.cells[1].innerText.trim()) {
        //             sheetProperties = mainComponentClassData[subComponent][0].properties;
        //         }
        //         if (sheetProperties === undefined) {
        //             for (var j = 0; j < mainComponentClassData[subComponent].length; j++) {
        //                 if (mainComponentClassData[subComponent][j].Name === browserRow.cells[1].innerText.trim()) {
        //                     sheetProperties = mainComponentClassData[subComponent][0].properties;
        //                 }
        //             }

        //         }
        //     }
        // }

        var columnHeaders = [];
        var firstComponent = components[0];
        var firstComponentProperties = firstComponent.properties;

        //var column = {};
        for (var i = 0; i < firstComponentProperties.length; i++) {
            var columnHeader = {};


            columnHeader["headerText"] = firstComponentProperties[i].Name;
            columnHeader["key"] = firstComponentProperties[i].Name.replace(/\s/g, '');
            columnHeader["dataType"] = "string";
            columnHeader["width"] = "100px";

            columnHeaders.push(columnHeader);

            // if (firstComponentProperties[i].Name === "ComponentClass") {
            //     columnHeader["title"] = "Component Class";
            // }
            // else {
            //     columnHeader["title"] = firstComponentProperties[i].Name;
            // }

            // columnHeader["name"] = firstComponentProperties[i].Name;

            // columnHeader["type"] = "text";
            // columnHeader["width"] = "100";
            // columnHeaders.push(columnHeader);
            // if (Object.keys(column).length <= 3) {
            //     if (sheetProperties[i].Name === "ComponentClass" || sheetProperties[i].Name === "Name" || sheetProperties[i].Name === "Description") {
            //         column[sheetProperties[i].Name] = i;
            //     }
            // }
        }

        var tableData = [];
        for (var i = 0; i < components.length; i++) {
            var component = components[i];

            var tableRowContent = {};
            var property = component.properties;

            for (var j = 0; j < property.length; j++) {
                tableRowContent[columnHeaders[j].key] = property[j].Value;
            }
            tableData.push(tableRowContent);
        }


        // if (this.ModelBrowserContainer === "modelTree1") {
        // _this = this;
        if (this.LoadedComponentClass !== mainclassname) {
            this.LoadDBDataTable(columnHeaders, tableData);   
            this.LoadedComponentClass = mainclassname;        
        }
        this.HighlightRowInDBData(browserRow);
        // }
        // else if (this.ModelBrowserContainer === "modelTree2") {
        //     _this = this;
        //     _this.LoadDBDataTable(_this, columnHeaders, tableData, "#viewerContainer2");
        //     _this.HighlightRowInDBData(browserRow);
        // }
        //}
    }
}

DBModelBrowser.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#9999ff";
}

DBModelBrowser.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}

DBModelBrowser.prototype.HighlightRowInDBData = function (thisRow) {

    var data = $("#" + this.ViewerContainer).data("igGrid").dataSource.dataView();
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

            var row = $("#" + this.ViewerContainer).igGrid("rowAt", i);

            if (this.SelectionManager.HighlightDBRow(row)) {
                // scroll to selected row
                document.getElementById(this.ViewerContainer + "_table_scroll").scrollTop = row.offsetTop - row.offsetHeight;
            }

            break;
        }
    }
}

DBModelBrowser.prototype.LoadDBDataTable = function (columnHeaders,
    tableData) {

    var _this = this;

    var containerDiv = "#" + this.ViewerContainer;
    if ($(containerDiv).data("igGrid") != null) {
        $(containerDiv).igGrid("destroy");
    }


    $(containerDiv).igGrid({
        columns: columnHeaders,
        autofitLastColumn: false,
        autoGenerateColumns: false,
        dataSource: tableData,
        responseDataKey: "results",
        autoCommit: true,
        height: "100%",
        width: "100%",
        alternateRowStyles: false,
        features: [
            {
                name: "Selection",
                mode: 'row',
                multipleSelection: true,
                activation: true,
                rowSelectionChanging: function (evt, ui) {

                    // if (isFiredFromCheckbox) {
                    //     isFiredFromCheckbox = false;
                    // } else {
                        _this.SelectionManager.HandleRowSelectInViewer(ui.row.element[0], 
                                                     _this.ModelBrowserContainer, 
                                                     _this.ViewerContainer);
                    return false;
                    // }

                }
            },
            {
                name: "RowSelectors",
                enableCheckBoxes: false,
                enableRowNumbering: false,
                enableSelectAllForPaging: true, // this option is true by default              
            },
            {
                name: "Resizing"
            }
        ]
    });

    // $(function () {

    //     $(containerDiv).jsGrid({
    //         // width: "570px",
    //         // height: "380px",
    //         height: "100%",
    //         width: "100%",
    //         alternateRowStyles: false,
    //         sorting: true,
    //         autoload: true,
    //         data: tableData,
    //         fields: columnHeaders,
    //         margin: "0px",
    //         onRefreshed: function (config) {
    //             // var excelSheetParentContainer = document.getElementById("dataSourceViewer");
    //             // for (var i = 0; i < excelSheetParentContainer.childElementCount; i++) {
    //             //     currentChild = excelSheetParentContainer.children[i];
    //             //     if (currentChild.className === "viewdatagraphics") {
    //             //         currentChild.style.display = "none";
    //             //     }
    //             // }
    //         },
    //         rowClick: function (args) {
    //             _this.HighlightRowInModelBrowser(args.event.currentTarget)
    //         }
    //     });

    // });

    // var container = document.getElementById(viewerContainer.replace("#", ""));
    // container.style.width = "570px"
    // container.style.height = "380px"
    // container.style.overflowX = "scroll";
    // container.style.overflowY = "scroll";
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

DBModelBrowser.prototype.GetDataFromSelectedRow = function (rowIndex,
    containerDiv) {


    var data = $(containerDiv).data("igGrid").dataSource.dataView();
    if (data.length === 0) {
        return;
    }
    var record = data[rowIndex];
   
    var rowData = {};
    rowData['component'] = record[ModelBrowserColumnNames1D.Component.replace(/\s/g, '')];
    rowData['mainClass'] = record[ModelBrowserColumnNames1D.MainClass.replace(/\s/g, '')];
    rowData['subClass'] = record[ModelBrowserColumnNames1D.SubClass.replace(/\s/g, '')];
    rowData['description'] = record[ModelBrowserColumnNames1D.Description.replace(/\s/g, '')];

    return rowData;
}
