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
                        if (ui.isHeader) {
                            var data = $(containerDiv).data("igGrid").dataSource.dataView();
                            if (data.length === 0) {
                                return;
                            }

                            for (var rowIndex in data) {
                               // var record = data[rowIndex];
                                
                                var index = parseInt(rowIndex);
                                if(index === NaN)
                                {
                                    continue;
                                }
                                //var rowKey = record.ig_pk;
                                var rowData =  _this.GetDataFromSelectedRow(rowIndex, containerDiv);
                                var row = $(containerDiv).igGrid("rowAt", index);
                                _this.SelectionManager.HandleSelectFormCheckBox(row, ui.state, rowData);
                            }
                        }
                        else {
                            var rowData = _this.GetDataFromSelectedRow(ui.rowIndex, containerDiv);
                            _this.SelectionManager.HandleSelectFormCheckBox(ui.row[0], ui.state, rowData);

                            // load corresponding sheet in viewr and highlight corrsponding row
                            _this.ShowSelectedSheetData(ui.row[0]);
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

                        _this.SelectionManager.HandleRowSelectInViewer(ui.row.element[0], _this.ModelBrowserContainer, _this.ViewerContainer);
                        return false;                       
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

ExcelModeBrowser.prototype.HighlightRowInSheetData = function (thisRow) {   
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

            var row = $("#" + this.ViewerContainer).igGrid("rowAt", i);

            if (this.SelectionManager.HighlightSheetRow(row)) {
                document.getElementById(this.ViewerContainer + "_table_scroll").scrollTop = row.offsetTop - row.offsetHeight;
            }

            break;
        }
    }
}

ExcelModeBrowser.prototype.ShowSelectedSheetData = function (browserRow) {

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
            
            columnHeader["headerText"] = firstComponentProperties[i].Name;
            columnHeader["key"] = firstComponentProperties[i].Name.replace(/\s/g, '');
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
                tableRowContent[columnHeaders[j].key] = properties[j].Value;
            }
            tableData.push(tableRowContent);
        }

     
        if (this.LoadedSheet !== currentSheetName) {
            this.LoadSheetDataTable(columnHeaders, tableData);
            this.LoadedSheet = currentSheetName;
        }

        this.HighlightRowInSheetData(browserRow);      
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