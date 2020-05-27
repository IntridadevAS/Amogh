function DefinePropertyHighlightsForm(id) {
    this.Id = id;

    this.Active = false;

    this.PropertyHighlightTemplateGrid;
    this.PropertyHighlightTemplateSelect;
    this.NameTextBox;
}

DefinePropertyHighlightsForm.prototype.GetHtmlElementId = function () {
    return "definePropertyHighlightForm" + this.Id;
}

DefinePropertyHighlightsForm.prototype.Open = function () {
    this.Active = true;

    var definePropertyHighlightForm = document.getElementById(this.GetHtmlElementId());
    definePropertyHighlightForm.style.display = "block";

    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(definePropertyHighlightForm,
        document.getElementById("definePropertyHighlightFormCaptionBar" + this.Id));

    this.Init();
}

DefinePropertyHighlightsForm.prototype.Close = function () {
    this.Active = false;

    var definePropertyHighlightForm = document.getElementById(this.GetHtmlElementId());
    definePropertyHighlightForm.style.display = "none";
}

DefinePropertyHighlightsForm.prototype.Init = function () {
    var _this = this;

    this.PopulateTemplateGrid();

    this.PopulatePropertyHighlightTemplates();

    this.NameTextBox = $("#definePropertyHighlightFormNameBox" + this.Id).dxTextBox({
        placeholder: "Enter Name..."
    }).dxTextBox("instance");

    // Create btns    
    document.getElementById("definePropertyHighlightFormApplyBtn" + this.Id).onclick = function () {
        _this.OnApply();
    }

    document.getElementById("definePropertyHighlightFormCloseBtn" + this.Id).onclick = function () {
        _this.Close();
    };

    // On add
    document.getElementById("definePropertyHighlightFormAdd" + this.Id).onclick = function () {
        if (_this.PropertyHighlightTemplateGrid) {
            _this.PropertyHighlightTemplateGrid.addRow();
            _this.PropertyHighlightTemplateGrid.deselectAll();
        }
    }

    // On Clear
    document.getElementById("definePropertyHighlightFormClear" + this.Id).onclick = function () {
        if (_this.PropertyHighlightTemplateGrid) {

            var selectedRowKeys = _this.PropertyHighlightTemplateGrid.getSelectedRowKeys();

            var totalRowsToRemove = selectedRowKeys.length;
            for (var i = 0; i < totalRowsToRemove; i++) {
                var rowIndex = _this.PropertyHighlightTemplateGrid.getRowIndexByKey(selectedRowKeys[i]);
                if (rowIndex > -1) {
                    _this.PropertyHighlightTemplateGrid.deleteRow(rowIndex);
                    _this.PropertyHighlightTemplateGrid.refresh(true);
                }
            }
        }
    }

    // On delete template
    document.getElementById("deletePropertyHighlightBtn" + this.Id).onclick = function () {
        if (_this.PropertyHighlightTemplateSelect) {
            var selectedTemplate = _this.PropertyHighlightTemplateSelect.option("value");
            if (selectedTemplate.toLowerCase() === "name") {
                return;
            }

            var propertyHighlightTemplates = model.propertyHighlightTemplates;
            if (selectedTemplate in propertyHighlightTemplates) {
                delete propertyHighlightTemplates[selectedTemplate];

                _this.PopulatePropertyHighlightTemplates();
                _this.PopulateTemplateGrid();

                DevExpress.ui.notify("Property highlight template '" + selectedTemplate + "'" + " deleted.");
            }
        }
    }
}

DefinePropertyHighlightsForm.prototype.PopulateTemplateGrid = function () {
    var _this = this;

    var allData = this.GetAllSourceProperties();

    var rowsData = [];
    if (_this.PropertyHighlightTemplateSelect) {
        var selectedTemplate = _this.PropertyHighlightTemplateSelect.option("value");
        var propertyHighlightTemplates = model.propertyHighlightTemplates;
        if (selectedTemplate in propertyHighlightTemplates) {
            var properties = propertyHighlightTemplates[selectedTemplate].properties;
            for (var i = 0; i < properties.length; i++) {

                var property = properties[i];
                rowsData.push({
                    "Name": property.Name,
                    "Value": property.Value,
                    "Operator": property.Operator,
                    "Color": property.Color
                });
            }
        }
    }

    // Create grid        
    var columns = [];

    var column = {};
    column["caption"] = "Name";
    column["dataField"] = "Name";
    column["width"] = "30%";
    column["visible"] = true;
    column["validationRules"] = [{ type: "required" }]
    column["lookup"] = {
        "dataSource": allData["properties"],
        valueExpr: "Name",
        displayExpr: "Name"
    };
    columns.push(column);

    column = {};
    column["caption"] = "Value";
    column["dataField"] = "Value";
    column["width"] = "30%";
    column["visible"] = true;
    // column["validationRules"] = [{ type: "required" }]
    column["lookup"] = {
        dataSource: function (options) {
            return {
                store: allData["values"],
                filter: options.data ? ["Name", "=", options.data.Name] : null
            };
        },
        valueExpr: "Value",
        displayExpr: "Value"
    };
    columns.push(column);

    column = {};
    column["caption"] = "Operator";
    column["dataField"] = "Operator";
    column["width"] = "20%";
    column["visible"] = true;
    column["lookup"] = { "dataSource": ["+", "AND"] }
    column["alignment"] = "center";
    columns.push(column);

    column = {};
    column["caption"] = "Color";
    column["dataField"] = "Color";
    column["width"] = "20%";
    column["visible"] = true;
    column["alignment"] = "center";
    column["editCellTemplate"] = colorPickerEditCellTemplate,
    column["cellTemplate"] = colorPickerCellTemplate,
    columns.push(column);

    var loadingBrowser = true;
    this.PropertyHighlightTemplateGrid = $("#definePropertyHighlightGrid" + this.Id).dxDataGrid({
        columns: columns,
        dataSource: rowsData,
        allowColumnResizing: true,
        columnResizingMode: 'widget',
        showBorders: true,
        showRowLines: true,
        paging: { enabled: false },
        // filterRow: {
        //     visible: true
        // },
        selection: {
            mode: "multiple",
            showCheckBoxesMode: "always",
        },
        scrolling: {
            mode: "virtual"
        },
        editing: {
            mode: "cell",
            allowUpdating: true,
            // refreshMode: "reshape",
            texts: {
                confirmDeleteMessage: ""
            },
        },
        onContentReady: function (e) {
            if (!loadingBrowser) {
                return;
            }
            loadingBrowser = false;
        },
        onSelectionChanged: function (e) {

        },
        onRowInserted: function (e) {
            // e.component.cellValue(e.component.getRowIndexByKey(e.key), "Operator", "+")
        },
        onRowRemoved: function (e) {

        },
        onRowUpdating(e) {

        },
        onEditorPreparing: function (e) {
            if (e.parentType !== "dataRow" ||
                e.type === "selection") {
                return;
            }
            // if ((e.dataField && e.dataField.toLowerCase() === "operator")) {
            //     e.editorOptions.disabled = true;
            // }
        },
    }).dxDataGrid("instance");
}

DefinePropertyHighlightsForm.prototype.PopulatePropertyHighlightTemplates = function () {
    var _this = this;
    var propertyHighlightTemplatesAll = [
        "New"
    ];

    var propertyHighlightTemplates = model.propertyHighlightTemplates;
    for (var templateName in propertyHighlightTemplates) {
        propertyHighlightTemplatesAll.push(templateName);
    }

    this.PropertyHighlightTemplateSelect = $("#definePropertyHighlightFormTypeDL" + this.Id).dxSelectBox({
        items: propertyHighlightTemplatesAll,
        value: "New",
        onValueChanged: function (data) {
            if (data.value.toLowerCase() !== "new") {
                _this.NameTextBox.option("value", data.value);
                _this.NameTextBox.option("disabled", true);
            }
            else {
                _this.NameTextBox.option("value", "");
                _this.NameTextBox.option("disabled", false);               
            }

            _this.PopulateTemplateGrid();
        }

    }).dxSelectBox("instance");
}

DefinePropertyHighlightsForm.prototype.OnApply = function () {
    var rows = this.PropertyHighlightTemplateGrid.getVisibleRows();

    var templateProperties = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        templateProperties.push({
            Name: row.data.Name,
            Value: row.data.Value,
            Operator: row.data.Operator,
            Color: row.data.Color
        });
    }

    var templateName = this.NameTextBox.option("value");

    var template = {
        "name": templateName,
        "properties": templateProperties
    };

    model.propertyHighlightTemplates[templateName] = template;

    var sourceManager = SourceManagers[this.Id];
    if (sourceManager.GroupHighlightSwitch.option("value") === true) {
        sourceManager.GroupTemplateSelect.option("items", ["Clear"].concat(Object.keys(model.propertyHighlightTemplates)));
    }

    // Reset controls
    this.NameTextBox.option("value", "");     
    this.PopulatePropertyHighlightTemplates();
    this.PopulateTemplateGrid();

    DevExpress.ui.notify("Property highlight template '" + templateName + "' created successfully.");
}

DefinePropertyHighlightsForm.prototype.GetAllSourceProperties = function () {
    var sourceManager = SourceManagers[this.Id];

    var traversedProperties = [];
    var traversedValues = {};

    var allProperties = [];
    var allvalues = [];
    if (sourceManager.Is3DSource()) {
        var allComponents = sourceManager.AllComponents;

        for (var nodeId in allComponents) {
            var component = allComponents[nodeId];
            if (component.properties.length > 0) {
                for (var i = 0; i < component.properties.length; i++) {
                    var property = component.properties[i];

                    if (traversedProperties.indexOf(property.Name) === -1) {
                        traversedProperties.push(property.Name);

                        allProperties.push({
                            "Name": property.Name
                        });
                    }

                    if (!(property.Name in allvalues)) {
                        allvalues[property.Name] = [];
                        traversedValues[property.Name] = [];
                    }

                    if (traversedValues[property.Name].indexOf(property.Value) === -1) {
                        allvalues[property.Name].push({
                            "Name": property.Name,
                            "Value": property.Value
                        });

                        traversedValues[property.Name].push(property.Value);
                    }
                }
            }
        }
    }

    traversedProperties = [];
    return {
        properties: allProperties,
        values: [].concat.apply([], Object.values(allvalues))        
    };
}

var colorPickerEditCellTemplate = function (cellElement, cellInfo) {
    var color = cellInfo.value;

    $("<div/>").dxColorBox({
        value: color,
        onValueChanged: function(e) {           
            cellInfo.setValue(e.value);
        }
    }).appendTo(cellElement);
};

var colorPickerCellTemplate = function (cellElement, cellInfo) {
    var color = cellInfo.value;
    cellElement.css("background-color", color);
}