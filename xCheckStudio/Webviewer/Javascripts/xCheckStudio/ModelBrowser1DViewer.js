function ModelBrowser1DViewer(id,
    source,
    sourceComponents,
    viewerContainer) {
    this.Id = id;
    this.Source = source;
    this.SourceComponents = sourceComponents;
    this.ViewerContainer = viewerContainer;

    // properties which can be used to identify names   

    this.IdentifierProperties = {};

    this.SelectedRow = {};
    this.ComponentStatusList = {};

    this.CurrentSheet;
    this.GridInstance;

    // this.ModelBrowserComponent;
}

ModelBrowser1DViewer.prototype.GetSelectionManager = function () {
    var browser = model.checks["comparison"]["modelBrowsers"][this.Source];
    return browser["selectionManager"];
}

ModelBrowser1DViewer.prototype.GetBrowser = function () {
    var browser = model.checks["comparison"]["modelBrowsers"][this.Source];
    return browser["browser"];
}

ModelBrowser1DViewer.prototype.HighlightComponent = function (componentRowData, componentStatusList) {
    if (this.CurrentSheet === componentRowData.Category) {
        this.HighlightRow(componentRowData.Item, componentRowData.Class);
        return;
    }

    if (!(componentRowData.Category in this.SourceComponents)) {
        return;
    }

    // this.ModelBrowserComponent = componentRowData;

    // current sheet
    this.CurrentSheet = componentRowData.Category;

    // check component vs status
    this.ComponentStatusList = componentStatusList;

    this.SelectedRow = {};

    var sheetComponents = this.SourceComponents[componentRowData.Category];

    // read identifier properties
    for (var componentId in sheetComponents) {
        var component = sheetComponents[componentId];
        for (var i = 0; i < component.length; i++) {
            var property = component[i];
            if (property.name.toLowerCase() === "component class" ||
                property.name.toLowerCase() === "componentclass") {
                this.IdentifierProperties["componentClass"] = property.name;
            }
            else if (property.name.toLowerCase() === "name") {
                this.IdentifierProperties["name"] = property.name;
            }
            else if (property.name.toLowerCase() === "tagnumber" &&
                !("name" in identifierColumns)) {
                this.IdentifierProperties["name"] = property.name;
            }
            else if (property.name.toLowerCase() === "description") {
                this.IdentifierProperties["description"] = property.name;
            }
        }

        break;
    }
    if (this.IdentifierProperties.name === undefined ||
        this.IdentifierProperties.componentClass === undefined) {
        return;
    }

    // create headers
    var columnHeaders = [];
    for (var componentId in sheetComponents) {
        var component = sheetComponents[componentId];

        for (var i = 0; i < component.length; i++) {
            var property = component[i];

            var columnHeader = {};

            columnHeader["caption"] = property['name'];
            columnHeader["dataField"] = property['name'];
            var type;
            if (property['format'].toLowerCase() === "string") {
                type = "string";
            }
            else if (property['format'].toLowerCase() === "number") {
                type = "number";
            }
            else {
                continue;
            }

            columnHeader["dataType"] = type;
            columnHeader["width"] = "90";
            columnHeaders.push(columnHeader);
        }

        break;
    }

    // create table data
    var tableData = [];
    for (var componentId in sheetComponents) {
        var component = sheetComponents[componentId];

        var rowContent = {};
        for (var i = 0; i < component.length; i++) {
            var property = component[i];

            // get property value
            rowContent[property['name']] = property['value'];
        }

        tableData.push(rowContent);
    }

    // load table
    this.LoadSheetTableData(columnHeaders, tableData, componentRowData);
}

ModelBrowser1DViewer.prototype.Destroy = function () {
    this.ActiveSheetName = undefined;
    var containerDiv = "#" + this.ViewerContainer;
    var viewerContainerElement = document.getElementById(this.ViewerContainer);
    var parent = viewerContainerElement.parentElement;
  
    $(containerDiv).remove();
  
    var viewerContainerDiv = document.createElement("div")
    viewerContainerDiv.id = this.ViewerContainer;
    viewerContainerDiv.className = "tempContainer";
  
    parent.appendChild(viewerContainerDiv); 
  }

ModelBrowser1DViewer.prototype.LoadSheetTableData = function (columnHeaders, tableData, componentRowData) {
    var _this = this;
    this.Destroy();

    $("#" + this.ViewerContainer).dxDataGrid({
        dataSource: tableData,
        columns: columnHeaders,
        showBorders: true,
        showRowLines: true,
        allowColumnResizing: true,
        height: "100%",
        // width: "100%",
        hoverStateEnabled: true,
        filterRow: {
            visible: true
        },
        scrolling: {
            mode: "standard"
        },
        paging: { enabled: false },
        onContentReady: function (e) {
            _this.GridInstance = e.component;
            _this.HighlightRow(componentRowData.Item, componentRowData.Class);
        },
        onRowClick: function (e) {
            var sheetComponents = _this.SourceComponents[_this.CurrentSheet];

            var rowData = {};
            for (var id in sheetComponents) {
                // var sheetComponent = sheetComponents[id];

                var sheetComponent = undefined;
                for (var i = 0; i < sheetComponents[id].length; i++) {
                    var property = sheetComponents[id][i];
                    if (property.name === _this.IdentifierProperties.name &&
                        e.data[_this.IdentifierProperties.name] === property.value) {
                        sheetComponent = sheetComponents[id];
                        break;
                    }
                }

                if (sheetComponent) {
                    for (var i = 0; i < sheetComponent.length; i++) {
                        var property = sheetComponent[i];

                        if (property.name === _this.IdentifierProperties.name) {
                            rowData["Item"] = property.value;
                        }
                        else if (property.name === _this.IdentifierProperties.componentClass) {
                            rowData["Class"] = property.value;
                        }
                    }

                    rowData["Category"] = _this.CurrentSheet;

                    break;
                }
            }

            if (rowData.Item && rowData.Category && rowData.Class) {
                _this.HighlightRow(rowData.Item, rowData.Class);
                _this.GetBrowser().HighlightComponent(rowData, true)
            }
        },
        onRowPrepared: function (e) {
            if (e.rowType !== "data") {
                return;
            }

            var status = _this.ComponentStatusList[e.data[_this.IdentifierProperties.name]]

            _this.GetSelectionManager().ChangeBackgroundColor(e.rowElement[0], status);
        }
    });
}

ModelBrowser1DViewer.prototype.HighlightRow = function (componentName, subClass) {
    if (!this.GridInstance) {
        return;
    }

    var rows = this.GridInstance.getVisibleRows();
    // get desired row
    var requiredRow;
    var rowData;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.data[this.IdentifierProperties.name] === componentName &&
            row.data[this.IdentifierProperties.componentClass] === subClass) {
            requiredRow = this.GridInstance.getRowElement(row.rowIndex);
            rowData = row;
            break;
        }
    }
    if (!requiredRow || !rowData) {
        return;
    }

    // highlight row
    this.HighlightSheetDataRow("#" + this.ViewerContainer, requiredRow[0], rowData);
}

ModelBrowser1DViewer.prototype.Destroy = function () {

    var containerDiv = "#" + this.ViewerContainer;
    var viewerContainerElement = document.getElementById(this.ViewerContainer);
    var parent = viewerContainerElement.parentElement;

    $(containerDiv).remove();

    var viewerContainerDiv = document.createElement("div")
    viewerContainerDiv.id = this.ViewerContainer;
    viewerContainerDiv.className = "tempContainer";

    parent.appendChild(viewerContainerDiv);
}

ModelBrowser1DViewer.prototype.ResizeViewer = function () {
    return false;
}

ModelBrowser1DViewer.prototype.HighlightSheetDataRow = function (viewerContainer, rowElement, rowData) {

    // if already selected row, then unhighlight
    // if (Object.keys(this.SelectedRow).length > 0) {
    this.UnhighlightSheetRow();
    this.SelectedRow = {};
    // }

    // maintain selected row
    this.SelectedRow = {
        "tableId": viewerContainer,
        "rowIndex": rowData.rowIndex
    };

    // highlight row
    this.GetSelectionManager().ApplyHighlightColor(rowElement);

    // scroll to row
    $(viewerContainer).dxDataGrid("instance").getScrollable().scrollTo({ top: rowElement.offsetTop - rowElement.offsetHeight });
}

ModelBrowser1DViewer.prototype.UnhighlightSheetRow = function () {
    if (Object.keys(this.SelectedRow).length === 0) {
        return;
    }

    var rowIndex = this.SelectedRow["rowIndex"];

    var gridInstance = $("#" + this.ViewerContainer).dxDataGrid("instance");

    var rowElement = gridInstance.getRowElement(rowIndex);
    var allRows = gridInstance.getVisibleRows();

    var rowData = allRows[rowIndex];
    var componentName = rowData.data[this.IdentifierProperties.name];

    if (componentName in this.ComponentStatusList) {
        var status = this.ComponentStatusList[componentName];


        this.GetSelectionManager().ChangeBackgroundColor(rowElement[0], status);
    }
    else {
        var color = "#fffff"
        for (var j = 0; j < rowElement[0].cells.length; j++) {
            cell = rowElement[0].cells[j];
            cell.style.backgroundColor = color;
        }
    }
}