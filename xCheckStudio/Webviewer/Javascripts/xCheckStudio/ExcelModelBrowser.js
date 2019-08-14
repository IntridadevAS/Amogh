function ExcelModeBrowser(modelBrowserContainer,
    sheetData,
    selectedComponents) {

    // call super constructor
    ModelBrowser.call(this, modelBrowserContainer);

    this.SheetData = sheetData;    
   
    this.SelectedComponentRowFromSheet;
    
    // selectiion manager
    this.SelectionManager = new ExcelSelectionManager(selectedComponents);
}

// assign ModelBrowser's method to this class
ExcelModeBrowser.prototype = Object.create(ModelBrowser.prototype);
ExcelModeBrowser.prototype.constructor = ExcelModeBrowser;

ExcelModeBrowser.prototype.CreateModelBrowserTable = function () {
    if (this.SheetData !== null) {
        var _this = this;


        columnHeaders = [];

        for (var i = 0; i < 4; i++) {
            columnHeader = {};
            var temp = {};
            if (i === 0) {
                temp["title"] = "";
                temp["name"] = "checkbox";
                temp["width"] = "20";
                columnHeaders.push(temp);
            }
            var title;
            if (i === 0) {
                name = "Name";
                title = "Item";
                width = "40";
            }
            else if (i === 1) {
                name = "Category";
                title = "Category";
                width = "100";
            }
            else if (i === 2) {
                name = "ComponentClass";
                title = "Item Class";
                width = "100";
            }
            else if (i === 3) {
                name = "Description";
                title = "Description";
                width = "100";
            }
            columnHeader["name"] = name;
            columnHeader["title"] = title;
            columnHeader["type"] = "text";
            columnHeader["width"] = width;
            columnHeaders.push(columnHeader);
        }

        tableData = [];

        //add each sheet to model browser 
        // iterate over sheets from excel file
        for (var sheet in this.SheetData) {
            var mainComponentClass = sheet;
            var mainComponentStyleClass = mainComponentClass + "_" + this.ModelBrowserContainer;
            var styleList = undefined;
            var componentStyleClass = this.getComponentstyleClass(mainComponentStyleClass);
            //set  row data 
            // var rowData = [];
            // rowData.push(mainComponentClass);
            // rowData.push("");
            // rowData.push("");
            // rowData.push("");

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
                        var checkBox = document.createElement("INPUT");
                        checkBox.setAttribute("type", "checkbox");
                        // checkBox.checked = false;  
                        checkBox.checked = _this.SelectionManager.IsComponentChecked(name, mainComponentClass, subComponentClass);

                        // select component check box state change event
                        checkBox.onchange = function () {
                            _this.SelectionManager.HandleSelectFormCheckBox(this);
                        }

                        tableRowContent[columnHeaders[0].name] = checkBox;
                        tableRowContent[columnHeaders[1].name] = name;
                        tableRowContent[columnHeaders[2].name] = mainComponentClass;
                        tableRowContent[columnHeaders[3].name] = subComponentClass;

                        var description = "";
                        for (var j = 0; j < child.properties.length; j++) {
                            var childProperties = child.properties[j];
                            if (childProperties["Name"] === "Description") {

                                description = childProperties["Value"];
                                break;
                            }
                        }
                        tableRowContent[columnHeaders[4].name] = description;
                        tableData.push(tableRowContent);
                    }
                }
            }
        }

        var viewerContainer = "#" + this.ModelBrowserContainer;
        this.LoadModelBrowserTable(this, columnHeaders, tableData, viewerContainer);

        // maintain first row as selected row by default
        var modelBrowserTableRows = this.GetModelBrowserDataRows();;                
        this.SelectionManager.HandleRowSelect(modelBrowserTableRows[0]);
        this.ShowSelectedSheetData(modelBrowserTableRows[0]);       
         
        var modelBrowserHeaderTable = this.GetModelBrowserHeaderTable();
        modelBrowserHeaderTable.style.position = "fixed"
        modelBrowserHeaderTable.style.width = "543px";

        var modelBrowserDataTable = this.GetModelBrowserDataTable();
        modelBrowserDataTable.style.position = "static"
        modelBrowserDataTable.style.width = "556px";
        modelBrowserDataTable.style.margin = "47px 0px 0px 0px"
    }

};

ExcelModeBrowser.prototype.GetModelBrowserHeaderTable = function()
{
    var modelBrowserData = document.getElementById(this.ModelBrowserContainer);
    return modelBrowserData.children[0];
}

ExcelModeBrowser.prototype.GetModelBrowserDataTable = function()
{
    var modelBrowserData = document.getElementById(this.ModelBrowserContainer);
    return modelBrowserData.children[1];
}

ExcelModeBrowser.prototype.GetModelBrowserDataRows = function()
{   
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


ExcelModeBrowser.prototype.LoadModelBrowserTable = function (_this, columnHeaders, tableData, viewerContainer) {

    $(function () {
        var db = {
            loadData: filter => {
                console.debug("Filter: ", filter);
                let ComponentClass = (filter.ComponentClass || "").toLowerCase();
                let name = (filter.Name || "").toLowerCase();
                let Category = (filter.MainComponentClass || "").toLowerCase();
                let Description = (filter.Description || "").toLowerCase();
                let dmy = parseInt(filter.dummy, 10);
                this.recalculateTotals = true;
                return $.grep(tableData, row => {
                    return (!ComponentClass || row.ComponentClass.toLowerCase().indexOf(ComponentClass) >= 0)
                        && (!name || row.Name.toLowerCase().indexOf(name) >= 0)
                        && (!Category || row.MainComponentClass.toLowerCase().indexOf(Category) >= 0)
                        && (!Description || row.Description.toLowerCase().indexOf(Description) >= 0)
                        && (isNaN(dmy) || row.dummy === dmy);
                });
            }
        };

        $(viewerContainer).jsGrid({
            height: "364px",
            width: "556px",
            filtering: true,
            sorting: true,
            autoload: true,
            controller: db,
            data: tableData,
            fields: columnHeaders,
            margin: "0px",
            checked: true,
            onRefreshed: function (config) {
                _this.AddTableContentCount(this._container.context.id);

            },
            onDataLoaded: function (args) {
            },
            rowClick: function (args) {

                _this.SelectionManager.HandleRowSelect(args.event.currentTarget);              

                 _this.ShowSelectedSheetData(args.event.currentTarget);               
            }
        });

    });

    var container = document.getElementById(viewerContainer.replace("#", ""));
    container.style.width = "556px"
    container.style.height = "364px"
    container.style.margin = "0px"
    container.style.overflowX = "hide";
    container.style.overflowY = "scroll";
    container.style.padding = "0";
};

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

ExcelModeBrowser.prototype.LoadSheetDataTable = function (_this, columnHeaders, tableData, viewerContainer) {

    $(function () {

        $(viewerContainer).jsGrid({
            width: "570px",
            height: "380px",
            sorting: true,
            autoload: true,
            data: tableData,
            fields: columnHeaders,
            margin: "0px",
            onRefreshed: function (config) {
                var excelSheetParentContainer = document.getElementById("dataSourceViewer");
                for (var i = 0; i < excelSheetParentContainer.childElementCount; i++) {
                    currentChild = excelSheetParentContainer.children[i];
                    if (currentChild.className === "viewdatagraphics") {
                        currentChild.style.display = "none";
                    }
                }
            },
            rowClick: function (args) {
                _this.SelectionManager.HandleRowSelectInViewer(args.event.currentTarget);
            }
        });

    });

    var container = document.getElementById(viewerContainer.replace("#", ""));
    container.style.width = "570px"
    container.style.height = "380px"
    container.style.overflowX = "scroll";
    container.style.overflowY = "scroll";
};

ExcelModeBrowser.prototype.HighlightRowInSheetData = function (thisRow) {
    var viewerContainerData;
    if (this.ModelBrowserContainer === "modelTree1") {
        viewerContainerData = document.getElementById("viewerContainer1")
    }
    else if (this.ModelBrowserContainer === "modelTree2") {
        viewerContainerData = document.getElementById("viewerContainer2")
    }
    if (viewerContainerData != undefined) {
        var containerChildren = viewerContainerData.children;
        var sheetHeadersTable = containerChildren[0].getElementsByTagName("table")[0];
        var sheetDataTable = containerChildren[1].getElementsByTagName("table")[0];

        var columnHeaders = sheetHeadersTable.getElementsByTagName("th");
        var dataRows = sheetDataTable.getElementsByTagName("tr");
        var identifierColumns = {};
        for (var i = 0; i < columnHeaders.length; i++) {
            columnHeader = columnHeaders[i];
            if (columnHeader.innerHTML.trim() === "Component Class" ||
                columnHeader.innerHTML.trim() === "Name" ||
                columnHeader.innerHTML.trim() === "Tagnumber" ||
                columnHeader.innerHTML.trim() === "Description") {
                identifierColumns[columnHeader.innerHTML.trim().replace(" ", "")] = i;
            }
            if (Object.keys(identifierColumns).length === 3) {
                break;
            }
        }
        for (var i = 0; i < dataRows.length; i++) {
            var dataRow = dataRows[i];

            var nameColumnIndex;
            if (identifierColumns.Name !== undefined) {
                nameColumnIndex = identifierColumns.Name;
            }
            else if (identifierColumns.Tagnumber !== undefined) {
                nameColumnIndex = identifierColumns.Tagnumber;
            }
            if (thisRow.cells[1].innerText === dataRow.cells[nameColumnIndex].innerText &&
                thisRow.cells[3].innerText === dataRow.cells[identifierColumns.ComponentClass].innerText) {
                if (this.SelectedComponentRowFromSheet) {
                    for (var j = 0; j < this.SelectedComponentRowFromSheet.cells.length; j++) {
                        cell = this.SelectedComponentRowFromSheet.cells[j];
                        cell.style.backgroundColor = "#ffffff"
                    }
                }

                for (var j = 0; j < dataRow.cells.length; j++) {
                    cell = dataRow.cells[j];
                    cell.style.backgroundColor = "#B2BABB"
                }

                this.SelectedComponentRowFromSheet = dataRow;

                // scroll to selected row
                sheetDataTable.focus();
                sheetDataTable.parentNode.parentNode.scrollTop = dataRow.offsetTop - dataRow.offsetHeight;

                break;
            }
        }
    }
}

ExcelModeBrowser.prototype.ShowSelectedSheetData = function (browserRow) {

    var currentSheetName = browserRow.cells[2].innerText.trim();
    var mainComponentClasses = Object.keys(this.SheetData);

    if (mainComponentClasses.indexOf(currentSheetName) === -1) {
        currentSheetName = browserRow.cells[1].innerText.trim();
    }

    var viewerContainerData;
    if (this.ModelBrowserContainer === "modelTree1") {
        viewerContainerData = document.getElementById("viewerContainer1")
    }
    else if (this.ModelBrowserContainer === "modelTree2") {
        viewerContainerData = document.getElementById("viewerContainer2")
    }

    if (viewerContainerData.childElementCount > 1 && 
        viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === currentSheetName) {
        
        this.HighlightRowInSheetData(browserRow);
        return;
    }

    var mainComponentClasseData = this.SheetData[currentSheetName];
    var properties = [];

    if (Object.keys(mainComponentClasseData).length > 0) {
        if (viewerContainerData.childElementCount > 1) {
            for (var subComponentClass in mainComponentClasseData) {
                if (viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === subComponentClass) {
                    this.HighlightRowInSheetData(browserRow);
                    return;
                }
            }
        }
    }

    if (mainComponentClasseData !== {}) {
        if (browserRow.cells[1].innerText !== "" && browserRow.cells[2].innerText !== "") {
            for (var subComponentClass in mainComponentClasseData) {
                for (var i = 0; i < mainComponentClasseData[subComponentClass].length; i++) {
                    properties.push(mainComponentClasseData[subComponentClass][i]);
                }
            }

            columnHeaders = [];
            var sheetProperties;
            if (mainComponentClasseData[currentSheetName] !== undefined) {
                sheetProperties = mainComponentClasseData[currentSheetName][0]["properties"];
            }
            else {
                for (var subComponent in mainComponentClasseData) {
                    if (mainComponentClasseData[subComponent][0].Name === browserRow.cells[1].innerText.trim()) {
                        sheetProperties = mainComponentClasseData[subComponent][0].properties;
                    }
                    if (sheetProperties === undefined) {
                        for (var j = 0; j < mainComponentClasseData[subComponent].length; j++) {
                            if (mainComponentClasseData[subComponent][j].Name === browserRow.cells[1].innerText.trim()) {
                                sheetProperties = mainComponentClasseData[subComponent][0].properties;
                            }
                        }

                    }
                }
            }

            var column = {};
            for (var i = 0; i < sheetProperties.length; i++) {
                columnHeader = {};
                if (sheetProperties[i].Name === "ComponentClass") {
                    columnHeader["title"] = "Component Class";
                }
                else {
                    columnHeader["title"] = sheetProperties[i].Name;
                }

                columnHeader["name"] = sheetProperties[i].Name;

                columnHeader["type"] = "text";
                columnHeader["width"] = "100";
                columnHeaders.push(columnHeader);
                if (Object.keys(column).length <= 3) {
                    if (sheetProperties[i].Name === "ComponentClass" || sheetProperties[i].Name === "Name" || sheetProperties[i].Name === "Description") {
                        column[sheetProperties[i].Name] = i;
                    }
                }
            }

            tableData = [];
            for (var i = 0; i < properties.length; i++) {
                tableRowContent = {};
                property = properties[i].properties;
                for (var j = 0; j < property.length; j++) {
                    tableRowContent[columnHeaders[j].name] = property[j].Value;
                }
                tableData.push(tableRowContent);

            }


            if (this.ModelBrowserContainer === "modelTree1") {
                _this = this;
                _this.LoadSheetDataTable(_this, columnHeaders, tableData, "#viewerContainer1");
                _this.HighlightRowInSheetData(browserRow);
            }
            else if (this.ModelBrowserContainer === "modelTree2") {
                _this = this;
                _this.LoadSheetDataTable(_this, columnHeaders, tableData, "#viewerContainer2");
                _this.HighlightRowInSheetData(browserRow);
            }
        }
    }
}