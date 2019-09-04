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
        var headerText;
        if (i === ModelBrowserColumns1D.Select) {
            continue;
        }
        else if (i === ModelBrowserColumns1D.Component) {
            headerText = ModelBrowserColumnNames1D.Component;
            key = ModelBrowserColumnNames1D.Component.replace(/\s/g, '');
            width = "25%";
        }
        else if (i === ModelBrowserColumns1D.MainClass) {
            headerText = ModelBrowserColumnNames1D.MainClass;
            key = ModelBrowserColumnNames1D.MainClass.replace(/\s/g, '');
            width = "25%";
        }
        else if (i === ModelBrowserColumns1D.SubClass) {
            headerText = ModelBrowserColumnNames1D.SubClass;
            key = ModelBrowserColumnNames1D.SubClass.replace(/\s/g, '');
            width = "25%";
        }
        else if (i === ModelBrowserColumns1D.Description) {
            headerText = ModelBrowserColumnNames1D.Description;
            key = ModelBrowserColumnNames1D.Description.replace(/\s/g, '');
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

ExcelModeBrowser.prototype.CreateModelBrowser = function () {
    if (this.SheetData !== null) {
        var _this = this;


        var columnHeaders = this.CreateHeaders();

        tableData = [];

        //add each sheet to model browser 
        // iterate over sheets from excel file
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
                        tableData.push(tableRowContent);
                    }
                }
            }
        }

        this.LoadModelBrowserTable(this, columnHeaders, tableData);

        // // maintain first row as selected row by default
        // var modelBrowserTableRows = this.GetModelBrowserDataRows();;                
        // this.SelectionManager.HighlightBrowserRow(modelBrowserTableRows[0]);
        // this.ShowSelectedSheetData(modelBrowserTableRows[0]);       

        // var modelBrowserHeaderTable = this.GetModelBrowserHeaderTable();
        // modelBrowserHeaderTable.style.position = "fixed"
        // modelBrowserHeaderTable.style.width = "543px";

        // var modelBrowserDataTable = this.GetModelBrowserDataTable();
        // modelBrowserDataTable.style.position = "static"
        // modelBrowserDataTable.style.width = "556px";
        // modelBrowserDataTable.style.margin = "47px 0px 0px 0px"
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


ExcelModeBrowser.prototype.LoadModelBrowserTable = function (_this, columnHeaders, tableData) {
    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;
    $(function () {
        //var table = JSON.stringify(tableData);
        var isFiredFromCheckbox = false;
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
                            _this.ShowSelectedSheetData(ui.row.element[0]);

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
                        
                        var rowData = _this.GetDataFromSelectedRow(ui.rowIndex, containerDiv);
                        _this.SelectionManager.HandleSelectFormCheckBox(ui.row[0], ui.state, rowData);

                        // load corresponding sheet in viewr and highlight corrsponding row
                        _this.ShowSelectedSheetData(ui.row[0]);
                    }
                },
                {
                    name: "Resizing"
                }
            ]
        });
    });
}

// ExcelModeBrowser.prototype.LoadModelBrowserTable = function (_this, columnHeaders, tableData, viewerContainer) {

//     $(function () {
//         var db = {
//             loadData: filter => {
//                 console.debug("Filter: ", filter);
//                 let ComponentClass = (filter.ComponentClass || "").toLowerCase();
//                 let name = (filter.Name || "").toLowerCase();
//                 let Category = (filter.MainComponentClass || "").toLowerCase();
//                 let Description = (filter.Description || "").toLowerCase();
//                 let dmy = parseInt(filter.dummy, 10);
//                 this.recalculateTotals = true;
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
//             onDataLoaded: function (args) {
//             },
//             rowClick: function (args) {

//                 _this.SelectionManager.HighlightBrowserRow(args.event.currentTarget);              

//                 _this.ShowSelectedSheetData(args.event.currentTarget);               
//             }
//         });

//     });

//     var container = document.getElementById(viewerContainer.replace("#", ""));
//     container.style.width = "556px"
//     container.style.height = "364px"
//     container.style.margin = "0px"
//     container.style.overflowX = "hide";
//     container.style.overflowY = "scroll";
//     container.style.padding = "0";
// };

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

    if ($(containerDiv).data("igGrid") != null) {
        $(containerDiv).igGrid("destroy");
    }

    $(function () {
        //var table = JSON.stringify(tableData);
        //var isFiredFromCheckbox = false;
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
                        _this.SelectionManager.HandleRowSelectInViewer(ui.row.element[0], _this.ModelBrowserContainer, _this.ViewerContainer);
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
    });
}

// ExcelModeBrowser.prototype.LoadSheetDataTable = function (columnHeaders, 
//                                                           tableData, 
//                                                           viewerContainer) {
//     var _this = this;

//     $(function () {

//         $(viewerContainer).jsGrid({
//             width: "570px",
//             height: "380px",
//             sorting: true,
//             autoload: true,
//             data: tableData,
//             fields: columnHeaders,
//             margin: "0px",
//             onRefreshed: function (config) {
//                 // var excelSheetParentContainer = document.getElementById("dataSourceViewer");
//                 // for (var i = 0; i < excelSheetParentContainer.childElementCount; i++) {
//                 //     currentChild = excelSheetParentContainer.children[i];
//                 //     if (currentChild.className === "viewdatagraphics") {
//                 //         currentChild.style.display = "none";
//                 //     }
//                 // }
//             },
//             rowClick: function (args) {
//                 _this.SelectionManager.HandleRowSelectInViewer(args.event.currentTarget, _this.ModelBrowserContainer);
//             }
//         });

//     });

//     var container = document.getElementById(viewerContainer.replace("#", ""));
//     container.style.width = "570px"
//     container.style.height = "380px"
//     container.style.overflowX = "scroll";
//     container.style.overflowY = "scroll";
// };

ExcelModeBrowser.prototype.HighlightRowInSheetData = function (thisRow) {
    var viewerContainerData;
    // if (this.ModelBrowserContainer === "modelTree1") {
    //     viewerContainerData = document.getElementById("visualizera")
    // }
    // else if (this.ModelBrowserContainer === "modelTree2") {
    //     viewerContainerData = document.getElementById("visualizerb")
    // }
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
    //var mainClass = thisRow.cells[ModelBrowserColumns1D.MainClass].innerText.trim();
    var subClass = thisRow.cells[ModelBrowserColumns1D.SubClass].innerText.trim();

    for (var i = 0; i < data.length; i++) {
        var dataRow = data[i];
        // var nameColumnIndex;
        // if (identifierColumns.Name !== undefined) {
        //     nameColumnIndex = identifierColumns.Name;
        // }
        // else if (identifierColumns.Tagnumber !== undefined) {
        //     nameColumnIndex = identifierColumns.Tagnumber;
        // }
        if (name === dataRow[identifierColumns.name] &&
            subClass === dataRow[identifierColumns.componentClass]) {

            var row = $("#" + this.ViewerContainer).igGrid("rowAt", i);

            if (this.SelectionManager.HighlightSheetRow(row)) {
                // scroll to selected row
                // sheetDataTable.focus();
                // sheetDataTable.parentNode.parentNode.scrollTop = row.offsetTop - row.offsetHeight;
            }

            break;
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // if (viewerContainerData != undefined) {
    //     var containerChildren = viewerContainerData.children;
    //     var sheetHeadersTable = containerChildren[0].getElementsByTagName("table")[0];
    //     var sheetDataTable = containerChildren[1].getElementsByTagName("table")[0];

    //     var columnHeaders = sheetHeadersTable.getElementsByTagName("th");
    //     var dataRows = sheetDataTable.getElementsByTagName("tr");
    //     var identifierColumns = {};
    //     for (var i = 0; i < columnHeaders.length; i++) {
    //         columnHeader = columnHeaders[i];
    //         if (columnHeader.innerHTML.trim() === "Component Class" ||
    //             columnHeader.innerHTML.trim() === "Name" ||
    //             columnHeader.innerHTML.trim() === "Tagnumber" ||
    //             columnHeader.innerHTML.trim() === "Description") {
    //             identifierColumns[columnHeader.innerHTML.trim().replace(" ", "")] = i;
    //         }
    //         if (Object.keys(identifierColumns).length === 3) {
    //             break;
    //         }
    //     }
    //     for (var i = 0; i < dataRows.length; i++) {
    //         var dataRow = dataRows[i];

    //         var nameColumnIndex;
    //         if (identifierColumns.Name !== undefined) {
    //             nameColumnIndex = identifierColumns.Name;
    //         }
    //         else if (identifierColumns.Tagnumber !== undefined) {
    //             nameColumnIndex = identifierColumns.Tagnumber;
    //         }
    //         if (thisRow.cells[1].innerText === dataRow.cells[nameColumnIndex].innerText &&
    //             thisRow.cells[3].innerText === dataRow.cells[identifierColumns.ComponentClass].innerText) {

    //             if (this.SelectionManager.HighlightSheetRow(dataRow)) {
    //                 // scroll to selected row
    //                 sheetDataTable.focus();
    //                 sheetDataTable.parentNode.parentNode.scrollTop = dataRow.offsetTop - dataRow.offsetHeight;
    //             }

    //             break;
    //         }
    //     }
    // }
}

ExcelModeBrowser.prototype.ShowSelectedSheetData = function (browserRow) {

    var currentSheetName = browserRow.cells[ModelBrowserColumns1D.MainClass].innerText.trim();
    //var mainComponentClasses = Object.keys(this.SheetData);

    // if (mainComponentClasses.indexOf(currentSheetName) === -1) {
    //     currentSheetName = browserRow.cells[1].innerText.trim();
    // }

    // var viewerContainerData;
    // if (this.ModelBrowserContainer === "modelTree1") {
    //     viewerContainerData = document.getElementById("visualizerA")
    // }
    // else if (this.ModelBrowserContainer === "modelTree2") {
    //     viewerContainerData = document.getElementById("visualizerB")
    // }

    // if (viewerContainerData.childElementCount > 1 && 
    //     viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === currentSheetName) {

    //     this.HighlightRowInSheetData(browserRow);
    //     return;
    // }

    var mainComponentClasseData = this.SheetData[currentSheetName];
    var components = [];

    // if (Object.keys(mainComponentClasseData).length > 0) {
    //     if (viewerContainerData.childElementCount > 1) {
    //         for (var subComponentClass in mainComponentClasseData) {
    //             if (viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === subComponentClass) {
    //                 this.HighlightRowInSheetData(browserRow);
    //                 return;
    //             }
    //         }
    //     }
    // }

    if (mainComponentClasseData !== {}) {
        // if (browserRow.cells[1].innerText !== "" && 
        //     browserRow.cells[2].innerText !== "") {
        for (var subComponentClass in mainComponentClasseData) {
            for (var i = 0; i < mainComponentClasseData[subComponentClass].length; i++) {
                components.push(mainComponentClasseData[subComponentClass][i]);
            }
        }
        if (!components ||
            components.length === 0) {
            return;
        }

        // var sheetProperties;
        // if (mainComponentClasseData[currentSheetName] !== undefined) {
        //     sheetProperties = mainComponentClasseData[currentSheetName][0]["properties"];
        // }
        // else {
        //     for (var subComponent in mainComponentClasseData) {
        //         if (mainComponentClasseData[subComponent][0].Name === browserRow.cells[1].innerText.trim()) {
        //             sheetProperties = mainComponentClasseData[subComponent][0].properties;
        //         }
        //         if (sheetProperties === undefined) {
        //             for (var j = 0; j < mainComponentClasseData[subComponent].length; j++) {
        //                 if (mainComponentClasseData[subComponent][j].Name === browserRow.cells[1].innerText.trim()) {
        //                     sheetProperties = mainComponentClasseData[subComponent][0].properties;
        //                 }
        //             }

        //         }
        //     }
        // }

        //var column = {};
        var columnHeaders = [];
        var firstComponent = components[0];
        var firstComponentProperties = firstComponent.properties;
        for (var i = 0; i < firstComponentProperties.length; i++) {
            columnHeader = {};
            // if (sheetProperties[i].Name === "ComponentClass") {
            //     columnHeader["title"] = "Component Class";
            // }
            // else {
            //     columnHeader["title"] = sheetProperties[i].Name;
            // }

            columnHeader["headerText"] = firstComponentProperties[i].Name;
            columnHeader["key"] = firstComponentProperties[i].Name.replace(/\s/g, '');
            columnHeader["dataType"] = "string";
            columnHeader["width"] = "100px";

            columnHeaders.push(columnHeader);
            // if (Object.keys(column).length <= 3) {
            //     if (sheetProperties[i].Name === "ComponentClass" || 
            //         sheetProperties[i].Name === "Name" ||
            //          sheetProperties[i].Name === "Description") {
            //         column[sheetProperties[i].Name] = i;
            //     }
            // }
        }

        var tableData = [];
        for (var i = 0; i < components.length; i++) {

            var component = components[i];
            var tableRowContent = {};
            var properties = component.properties;

            for (var j = 0; j < properties.length; j++) {
                tableRowContent[columnHeaders[j].key] = properties[j].Value;
            }
            tableData.push(tableRowContent);
        }


        // if (this.ModelBrowserContainer === "modelTree1") {
        //     _this = this;
        if (this.LoadedSheet !== currentSheetName) {
            this.LoadSheetDataTable(columnHeaders, tableData);
            this.LoadedSheet = currentSheetName;
        }

        this.HighlightRowInSheetData(browserRow);
        // }
        // else if (this.ModelBrowserContainer === "modelTree2") {
        //     _this = this;
        //     _this.LoadSheetDataTable(columnHeaders, tableData, "#visualizerB");
        //     _this.HighlightRowInSheetData(browserRow);
        // }
        //}
    }
}

ExcelModeBrowser.prototype.GetDataFromSelectedRow = function (rowIndex,
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