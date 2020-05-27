function DefineGroupsForm(id) {
    this.Id = id;

    this.Active = false;

    this.DefineGroupsGrid;
    this.GroupSelect;
    this.NameTextBox;
}

DefineGroupsForm.prototype.GetHtmlElementId = function () {
    return "defineGroupsForm" + this.Id;
}

DefineGroupsForm.prototype.Open = function () {
    this.Active = true;

    var defineGroupsForm = document.getElementById(this.GetHtmlElementId());
    defineGroupsForm.style.display = "block";

    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(defineGroupsForm,
        document.getElementById("defineGroupsFormCaptionBar" + this.Id));

    this.Init();
}

DefineGroupsForm.prototype.Close = function () {
    this.Active = false;

    var defineGroupsForm = document.getElementById(this.GetHtmlElementId());
    defineGroupsForm.style.display = "none";
}

DefineGroupsForm.prototype.Init = function () {
    var _this = this;

    this.PopulateTemplateGrid();

    this.PopulateGroups();

    this.NameTextBox = $("#defineGroupsFormNameBox" + this.Id).dxTextBox({
        placeholder: "Enter Name..."
    }).dxTextBox("instance");

    // Create btns    
    document.getElementById("defineGroupsFormApplyBtn" + this.Id).onclick = function () {
        _this.OnApply();
    }

    document.getElementById("defineGroupsFormCloseBtn" + this.Id).onclick = function () {
        _this.Close();
    };

    // On add
    document.getElementById("defineGroupsFormAdd" + this.Id).onclick = function () {
        if (_this.DefineGroupsGrid) {
            _this.DefineGroupsGrid.addRow();
            _this.DefineGroupsGrid.deselectAll();
        }
    }

    // On Clear
    document.getElementById("defineGroupsFormClear" + this.Id).onclick = function () {
        if (_this.DefineGroupsGrid) {

            var selectedRowKeys = _this.DefineGroupsGrid.getSelectedRowKeys();

            var totalRowsToRemove = selectedRowKeys.length;
            for (var i = 0; i < totalRowsToRemove; i++) {
                var rowIndex = _this.DefineGroupsGrid.getRowIndexByKey(selectedRowKeys[i]);
                if (rowIndex > -1) {
                    _this.DefineGroupsGrid.deleteRow(rowIndex);
                    _this.DefineGroupsGrid.refresh(true);
                }
            }
        }
    }

    // On delete group
    document.getElementById("deleteGroupBtn" + this.Id).onclick = function () {
        if (_this.GroupSelect) {
            var selectedGroup = _this.GroupSelect.option("value");
            if (selectedGroup.toLowerCase() === "name") {
                return;
            }

            var propertyGroups = model.propertyGroups;
            if (selectedGroup in propertyGroups) {
                delete propertyGroups[selectedGroup];                
                
                _this.PopulateGroups();
                _this.PopulateTemplateGrid();

                DevExpress.ui.notify("Group '" + selectedGroup + "'" + " deleted.");
            }
        }
    }
}

DefineGroupsForm.prototype.PopulateGroups = function () {
    var _this = this;
    var groups = [
        "New"
    ];

    var propertyGroups = model.propertyGroups;
    for (var groupName in propertyGroups) {
        groups.push(groupName);
    }

    this.GroupSelect = $("#defineGroupsFormTypeDL" + this.Id).dxSelectBox({
        items: groups,
        value: "New",
        onValueChanged: function (data) {
            if (data.value.toLowerCase() !== "new") {
                _this.NameTextBox.option("value", data.value);
                _this.NameTextBox.option("disabled", true);
            }
            else {
                _this.NameTextBox.option("value", "");
                _this.NameTextBox.option("disabled", false);
                // return;
            }
            
            _this.PopulateTemplateGrid();
        }

    }).dxSelectBox("instance");
}

DefineGroupsForm.prototype.PopulateTemplateGrid = function () {    
    var _this = this;

    var allProperties = this.GetAllSourceProperties();

    var rowsData = [];
    if (_this.GroupSelect) {
        var selectedGroup = _this.GroupSelect.option("value");
        var propertyGroups = model.propertyGroups;
        if (selectedGroup in propertyGroups) {
            var properties = propertyGroups[selectedGroup].properties;
            for (var i = 0; i < properties.length; i++) {
                
                rowsData.push({
                    "Name": properties[i],
                    "Operator": "+"
                });
            }
        }
    }

    // Create grid        
    var columns = [];

    var column = {};
    column["caption"] = "Name";
    column["dataField"] = "Name";
    column["width"] = "50%";
    column["visible"] = true;
    column["validationRules"] = [{ type: "required" }]
    column["lookup"] = { "dataSource": allProperties }
    columns.push(column);

    column = {};
    column["caption"] = "Operator";
    column["dataField"] = "Operator";
    column["width"] = "50%";
    column["visible"] = true;
    column["alignment"] = "center";
    columns.push(column);

    var loadingBrowser = true;   

    this.DefineGroupsGrid = $("#defineGroupsGrid" + this.Id).dxDataGrid({
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
            e.component.cellValue(e.component.getRowIndexByKey(e.key), "Operator", "+")
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
            if ((e.dataField && e.dataField.toLowerCase() === "operator")) {
                e.editorOptions.disabled = true;
            }
        },
    }).dxDataGrid("instance");
}

DefineGroupsForm.prototype.OnApply = function () {
    var rows = this.DefineGroupsGrid.getVisibleRows();

    var groupingProperties = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        groupingProperties.push(row.data.Name);
    }

    groupName = this.NameTextBox.option("value");

    var group = {
        "name": groupName,
        "properties": groupingProperties
    };

    model.propertyGroups[groupName] = group;

    var sourceManager = SourceManagers[this.Id];
    if (sourceManager.GroupHighlightSwitch.option("value") === false) {
        SourceManagers[this.Id].GroupTemplateSelect.option("items", ["Clear"].concat(Object.keys(model.propertyGroups)));
    }
    
    // Reset controls
    this.NameTextBox.option("value", "");     
    this.PopulateGroups();
    this.PopulateTemplateGrid();

    DevExpress.ui.notify("Group '" + groupName + "' created successfully.");
}

DefineGroupsForm.prototype.GetAllSourceProperties = function () {
    var sourceManager = SourceManagers[this.Id];

    var allProperties = [];
    if (sourceManager.Is3DSource()) {
        var allComponents = sourceManager.AllComponents;

        for (var nodeId in allComponents) {
            var component = allComponents[nodeId];
            if (component.properties.length > 0) {
                for (var i = 0; i < component.properties.length; i++) {
                    var property = component.properties[i];
                    if (allProperties.indexOf(property.Name) === -1) {
                        allProperties.push(property.Name);
                    }
                }
            }
        }
    }

    return allProperties;
}