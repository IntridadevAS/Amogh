function EditUserPropertiesForm(id) {
    this.Id = id;

    this.Active = false;

    this.PropertiesGrid;

    this.UpdatedRowsData = {};

    this.ClearUserPropertiesForm = new ClearUserPropertiesForm(id);
}

EditUserPropertiesForm.prototype.GetHtmlElementId = function () {
    return "editUserPropertiesForm" + this.Id;
}

EditUserPropertiesForm.prototype.Open = function () {
    this.Active = true;

    var editUserPropertiesForm = document.getElementById(this.GetHtmlElementId());
    editUserPropertiesForm.style.display = "block";

    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(editUserPropertiesForm,
        document.getElementById("editUserPropertiesFormCaptionBar" + this.Id));

    this.Init();
}

EditUserPropertiesForm.prototype.Close = function () {
    this.Active = false;

    var editUserPropertiesForm = document.getElementById(this.GetHtmlElementId());
    editUserPropertiesForm.style.display = "none";

    this.UpdatedRowsData = {};
}

EditUserPropertiesForm.prototype.Init = function () {
    var _this = this;

    this.LoadData();

    // Create btns
    document.getElementById("editUserPropertiesClearBtn" + this.Id).onclick = function () {
        _this.OnClear();
    }

    document.getElementById("editUserPropertiesApplyBtn" + this.Id).onclick = function () {
        _this.OnApply();
    }

    document.getElementById("editUserPropertiesCloseBtn" + this.Id).onclick = function () {
        _this.Close();
    };
}

EditUserPropertiesForm.prototype.OnClear = function () {
    // var selectedRowsData = this.PropertiesGrid.getSelectedRowsData();
    // var properties = [];

    // var visibleColumns = this.PropertiesGrid.getVisibleColumns();
    // for (var i = 0; i < selectedRowsData.length; i++) {
    //     var rowData = selectedRowsData[i];

    //     for (var prop in rowData) {
    //         if (prop.toLowerCase() === "item" ||
    //             prop.toLowerCase() === "nodeid") {
    //             continue;
    //         }

    //         var columnIndex = this.PropertiesGrid.getVisibleColumnIndex(prop)
    //         if (columnIndex === -1) {
    //             continue;
    //         }
    //         var propName = visibleColumns[columnIndex].caption;
    //         if (properties.indexOf(propName) === -1) {
    //             properties.push(propName);
    //         }
    //     }
    // }

    this.ClearUserPropertiesForm.Open();
}

EditUserPropertiesForm.prototype.OnApply = function () {
    var _this = this
    var sourceManager = SourceManagers[_this.Id];

    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceManager.SourceType);
    var nameProperty = identifierProperties.name.replace("Intrida Data/", "");
    var categoryProperty = identifierProperties.mainCategory.replace("Intrida Data/", "");
    var classProperty = identifierProperties.subClass.replace("Intrida Data/", "");

    var data = {};
    for (var nodeId in this.UpdatedRowsData) {
        var properties = this.UpdatedRowsData[nodeId];

        data[nodeId] = {};
        data[nodeId]["properties"] = [];
        data[nodeId]["component"] = sourceManager.NodeIdvsComponentIdList[nodeId];

        var name = null;
        var category = null;
        var componentClass = null;
        for (var property in properties) {
            var value = properties[property];

            if (property.toLowerCase() === nameProperty.toLowerCase()) {
                name = value;
            }
            if (property.toLowerCase() === categoryProperty.toLowerCase()) {
                category = value;
            }
            if (property.toLowerCase() === classProperty.toLowerCase()) {
                componentClass = value;
            }

            data[nodeId]["properties"].push({
                "property": property,
                "oldProperty": property,
                "value": value ? value : "",
                "action": "update"
            });
        }

        data[nodeId]["name"] = name;
        data[nodeId]["category"] = category;
        data[nodeId]["componentClass"] = componentClass;
        data[nodeId]["parent"] = null;
    }

    // Update components in tables
    model.views[_this.Id].listView.UpdateComponents(data);

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    $.ajax({
        data: {
            'PropertyData': JSON.stringify(data),
            'ComponentTable': sourceManager.GetComponentsTableName(),
            'PropertyTable': sourceManager.GetPropertiesTableName(),
            'InvokeFunction': 'Update',
            'ProjectName': projectinfo.projectname,
            'CheckName': checkinfo.checkname
        },
        type: "POST",
        url: "PHP/UserProperties.php"
    }).done(function (msg) {
        var object = JSON.parse(msg);
        if (object.MsgCode !== 1) {
            // failed
            return;
        }

        _this.UpdatedRowsData = {};
        DevExpress.ui.notify("Properties updated successfully.");
    });
}

EditUserPropertiesForm.prototype.LoadData = function () {
    var _this = this;

    var columnNames = [];
    var columns = [];
    var rowsData = [];

    var column = {};
    column["caption"] = "Item";
    column["dataField"] = "Item";
    column["width"] = "100px";
    column["visible"] = true;
    column["fixed"] = true;
    column["fixedPosition"] = "left";
    columns.push(column);

    column = {};
    column["caption"] = "NodeId";
    column["dataField"] = "NodeId";;
    column["visible"] = false;
    columns.push(column);


    var selected = model.views[this.Id].listView.GetSelectedComponents();
    for (var nodeId in selected) {
        var selectedComp = selected[nodeId];

        var rowData = {};
        rowData["Item"] = selectedComp.Name;
        rowData["NodeId"] = nodeId;

        for (var i = 0; i < selectedComp.properties.length; i++) {
            var property = selectedComp.properties[i];
            if (!property.UserDefined) {
                continue;
            }

            if (columnNames.indexOf(property["Name"]) === -1) {
                columnNames.push(property["Name"]);

                var column = {};
                column["caption"] = property["Name"];
                column["dataField"] = property["Name"].replace(/\s/g, '');
                column["width"] = "80px";
                column["visible"] = true;
                columns.push(column);
            }

            rowData[property["Name"].replace(/\s/g, '')] = property["Value"];
        }

        rowsData.push(rowData);
    }

    for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        for (var j = 0; j < rowsData.length; j++) {
            var rowData = rowsData[j];

            if (!(column["dataField"] in rowData)) {
                rowData[column["dataField"]] = "NULL";
            }
        }
    }

    var loadingBrowser = true;
    this.UpdatedRowsData = {};
    this.PropertiesGrid = $("#editUserPropertiesGrid" + this.Id).dxDataGrid({
        columns: columns,
        dataSource: rowsData,
        allowColumnResizing: true,
        columnResizingMode: 'widget',
        showBorders: true,
        showRowLines: true,
        paging: { enabled: false },
        filterRow: {
            visible: true
        },
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
        // onRowInserted: function (e) {

        // },
        // onRowRemoved: function (e) {

        // },
        onRowUpdating(e) {
            var nodeId = e.oldData.NodeId;
            if (!(nodeId in _this.UpdatedRowsData)) {
                _this.UpdatedRowsData[e.oldData.NodeId] = {};
            }

            for (var prop in e.newData) {
                _this.UpdatedRowsData[e.oldData.NodeId][prop] = e.newData[prop];
            }
        },
        onEditorPreparing: function (e) {
            if (e.parentType !== "dataRow" ||
                e.type === "selection") {
                return;
            }
            if ((e.dataField && e.dataField.toLowerCase() === "item") ||
                (e.value && e.value.toLowerCase() === "null")) {
                e.editorOptions.disabled = true;
            }
        },
        onContextMenuPreparing: function (e) {
            if (e.row.rowType === "header") {
                e.items = [{
                    text: "Remove",
                    onItemClick: function () {                        
                        _this.OnRemovePropertyForAll(e.columnIndex, e.column.caption);
                    }
                }];
            }
        }
    }).dxDataGrid("instance");
}

EditUserPropertiesForm.prototype.OnRemovePropertyForAll = function (columnIndex, propertyName) {
    var _this = this;
    var items = _this.PropertiesGrid.getDataSource().items();

    var sourceManager = SourceManagers[_this.Id];

    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceManager.SourceType);
    var nameProperty = identifierProperties.name.replace("Intrida Data/", "");
    var categoryProperty = identifierProperties.mainCategory.replace("Intrida Data/", "");
    var classProperty = identifierProperties.subClass.replace("Intrida Data/", "");

    var data = {};
    for (var i = 0; i < items.length; i++) {
        var nodeId = items[i].NodeId;

        data[nodeId] = {};
        data[nodeId]["properties"] = [];
        data[nodeId]["component"] = sourceManager.NodeIdvsComponentIdList[nodeId];

        var name = null;
        var category = null;
        var componentClass = null;
        // for (var j = 0; j < selectedProperties.length; j++) {
        //     var property = selectedProperties[j];

        if (propertyName.toLowerCase() === nameProperty.toLowerCase()) {
            name = sourceManager.GetNodeName(nodeId);
        }
        if (propertyName.toLowerCase() === categoryProperty.toLowerCase()) {
            category = "";
        }
        if (propertyName.toLowerCase() === classProperty.toLowerCase()) {
            componentClass = "";
        }

        data[nodeId]["properties"].push({
            "property": propertyName,
            "action": "remove",
            "value": ""
        });
        // }

        data[nodeId]["name"] = name;
        data[nodeId]["category"] = category;
        data[nodeId]["componentClass"] = componentClass;
        data[nodeId]["parent"] = null;
    }

    // Update components in list view table
    model.views[_this.Id].listView.UpdateComponents(data);

    // Update components in editUserProperties table
    model.views[this.Id].editUserPropertiesForm.DeletePropertyColumn(propertyName);

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    $.ajax({
        data: {
            'PropertyData': JSON.stringify(data),
            'ComponentTable': sourceManager.GetComponentsTableName(),
            'PropertyTable': sourceManager.GetPropertiesTableName(),
            'InvokeFunction': 'Update',
            'ProjectName': projectinfo.projectname,
            'CheckName': checkinfo.checkname
        },
        type: "POST",
        url: "PHP/UserProperties.php"
    }).done(function (msg) {
        var object = JSON.parse(msg);
        if (object.MsgCode !== 1) {            
            return;
        }           
        
        DevExpress.ui.notify("Properties updated successfully.");
    });
}

EditUserPropertiesForm.prototype.GetSelectedComponents = function () {
    var selectedRowsData = this.PropertiesGrid.getSelectedRowsData();

    var selectedNodeIds = [];
    for (var i = 0; i < selectedRowsData.length; i++) {
        var rowData = selectedRowsData[i];
        selectedNodeIds.push(rowData["NodeId"]);
    }

    return selectedNodeIds;
}

EditUserPropertiesForm.prototype.DeletePropertyColumn = function (property) {     
        this.PropertiesGrid.deleteColumn(property);
}

EditUserPropertiesForm.prototype.UpdateComponents = function (properties, clearValues = false) {

    var selectedRowKeys = this.PropertiesGrid.getSelectedRowKeys();

    for (var i = 0; i < selectedRowKeys.length; i++) {
        var rowKey = selectedRowKeys[i];

        var rowIndex = this.PropertiesGrid.getRowIndexByKey(rowKey);
        if (rowIndex === -1) {
            continue;
        }

        for (var j = 0; j < properties.length; j++) {
            var cellValue = this.PropertiesGrid.cellValue(rowIndex, properties[j])
            if (cellValue.toLowerCase() === "null") {
                continue;
            }

            if (clearValues) {
                this.PropertiesGrid.cellValue(rowIndex, properties[j], "");
            }
            else {
                this.PropertiesGrid.cellValue(rowIndex, properties[j], "NULL");
            }
        }
    }   
}

// Clear User Properties Form
function ClearUserPropertiesForm(id) {
    this.Id = id;

    this.Active = false;

    this.PropertiesCB;
    this.PropertiesTagBox;
    this.ClearValuesCB;

    this.Properties;
}

ClearUserPropertiesForm.prototype.GetHtmlElementId = function () {
    return "clearUserPropertiesForm" + this.Id;
}

ClearUserPropertiesForm.prototype.Open = function () {
    this.Active = true;
    // this.Properties = properties;

    var clearUserPropertiesForm = document.getElementById(this.GetHtmlElementId());
    clearUserPropertiesForm.style.display = "block";

    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(clearUserPropertiesForm,
        document.getElementById("clearUserPropertiesFormCaptionBar" + this.Id));

    this.Init();
}

ClearUserPropertiesForm.prototype.Close = function () {
    this.Active = false;

    var clearUserPropertiesForm = document.getElementById(this.GetHtmlElementId());
    clearUserPropertiesForm.style.display = "none";
}

ClearUserPropertiesForm.prototype.Init = function () {
    var _this = this;    

    this.LoadData();

    _this.PropertiesCB = $("#clearUserPropertiesCB" + this.Id).dxCheckBox({
        value: false,
        onValueChanged: function (data) {
            if (!_this.PropertiesTagBox) {
                return;
            }

            _this.PropertiesTagBox.option("disabled", !data.value);
        }
    }).dxCheckBox("instance");

    _this.ClearValuesCB = $("#clearUserPropertiesValuesCB" + this.Id).dxCheckBox({
        value: false,
        onValueChanged: function (data) {
            if (data.value) {

            }
            else {

            }
        }
    }).dxCheckBox("instance");

    // Handle btns   
    document.getElementById("clearUserPropertiesApplyBtn" + this.Id).onclick = function () {
        _this.OnApply();
    }

    document.getElementById("clearUserPropertiesCloseBtn" + this.Id).onclick = function () {
        _this.Close();
    };
}

ClearUserPropertiesForm.prototype.LoadData = function () {
    var _this = this;

    var editUserPropertiesForm = model.views[this.Id].editUserPropertiesForm;
    var selectedRowsData = editUserPropertiesForm.PropertiesGrid.getSelectedRowsData();
    var properties = [];

    var visibleColumns = editUserPropertiesForm.PropertiesGrid.getVisibleColumns();
    for (var i = 0; i < selectedRowsData.length; i++) {
        var rowData = selectedRowsData[i];

        for (var prop in rowData) {
            if (prop.toLowerCase() === "item" ||
                prop.toLowerCase() === "nodeid") {
                continue;
            }

            var columnIndex = editUserPropertiesForm.PropertiesGrid.getVisibleColumnIndex(prop)
            if (columnIndex === -1) {
                continue;
            }
            var propName = visibleColumns[columnIndex].caption;
            if (properties.indexOf(propName) === -1) {
                properties.push(propName);
            }
        }
    }

    var disabled = true;
    if (_this.PropertiesCB &&
        _this.PropertiesCB.option("value") === true) {
        disabled = false;
    }
    _this.PropertiesTagBox = $("#clearUserPropertiesTagBox" + this.Id).dxTagBox({
        items: properties,
        searchEnabled: true,
        hideSelectedItems: true,
        placeholder: "Select Properties...",
        disabled:  disabled
    }).dxTagBox("instance");
}

ClearUserPropertiesForm.prototype.OnApply = function () {
    var _this = this
    var sourceManager = SourceManagers[_this.Id];

    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceManager.SourceType);
    var nameProperty = identifierProperties.name.replace("Intrida Data/", "");
    var categoryProperty = identifierProperties.mainCategory.replace("Intrida Data/", "");
    var classProperty = identifierProperties.subClass.replace("Intrida Data/", "");

    var editUserPropertiesForm = model.views[this.Id].editUserPropertiesForm;
    var selectedNodeIds = editUserPropertiesForm.GetSelectedComponents();
   
    var selectedProperties = this.PropertiesTagBox._selectedItems;
    if (this.PropertiesCB.option("value")) {        

        var data = {};
        for (var i = 0; i < selectedNodeIds.length; i++) {
            var nodeId = selectedNodeIds[i];

            data[nodeId] = {};
            data[nodeId]["properties"] = [];
            data[nodeId]["component"] = sourceManager.NodeIdvsComponentIdList[nodeId];

            var name = null;
            var category = null;
            var componentClass = null;
            for (var j = 0; j < selectedProperties.length; j++) {
                var property = selectedProperties[j];

                if (property.toLowerCase() === nameProperty.toLowerCase()) {
                    name = sourceManager.GetNodeName(nodeId);
                }
                if (property.toLowerCase() === categoryProperty.toLowerCase()) {
                    category = "";
                }
                if (property.toLowerCase() === classProperty.toLowerCase()) {
                    componentClass = "";
                }

                data[nodeId]["properties"].push({
                    "property": property,
                    "action": "remove",
                    "value": ""
                });
            }

            data[nodeId]["name"] = name;
            data[nodeId]["category"] = category;
            data[nodeId]["componentClass"] = componentClass;
            data[nodeId]["parent"] = null;
        }

        // Update components in list view table
        model.views[_this.Id].listView.UpdateComponents(data);

        // Update components in editUserProperties table
        model.views[this.Id].editUserPropertiesForm.UpdateComponents(selectedProperties);

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            data: {
                'PropertyData': JSON.stringify(data),
                'ComponentTable': sourceManager.GetComponentsTableName(),
                'PropertyTable': sourceManager.GetPropertiesTableName(),
                'InvokeFunction': 'Update',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            type: "POST",
            url: "PHP/UserProperties.php"
        }).done(function (msg) {
            var object = JSON.parse(msg);
            if (object.MsgCode !== 1) {
                // failed
                return;
            }           
            
            DevExpress.ui.notify("Properties updated successfully.");
        });
    }

    if (this.ClearValuesCB.option("value")) {
        var columns = editUserPropertiesForm.PropertiesGrid.getVisibleColumns();
        var allProperties = [];
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (column.type === "selection" ||
                column.caption.toLowerCase() === "item" ||
                column.caption.toLowerCase() === "nodeid") {
                continue;
            }

            if (this.PropertiesCB.option("value") &&
                selectedProperties.indexOf(column.caption) !== -1) {
                continue;
            }
            allProperties.push(column.caption);
        }

        var selectedProperties = this.PropertiesTagBox._selectedItems;

        var data = {};
        for (var i = 0; i < selectedNodeIds.length; i++) {
            var nodeId = selectedNodeIds[i];

            data[nodeId] = {};
            data[nodeId]["properties"] = [];
            data[nodeId]["component"] = sourceManager.NodeIdvsComponentIdList[nodeId];

            var name = null;
            var category = null;
            var componentClass = null;
            for (var j = 0; j < allProperties.length; j++) {
                var property = allProperties[j];

                if (property.toLowerCase() === nameProperty.toLowerCase()) {
                    name = sourceManager.GetNodeName(nodeId);
                }
                if (property.toLowerCase() === categoryProperty.toLowerCase()) {
                    category = "";
                }
                if (property.toLowerCase() === classProperty.toLowerCase()) {
                    componentClass = "";
                }

                data[nodeId]["properties"].push({
                    "property": property,
                    "oldProperty": property,
                    "action": "update",
                    "value": ""
                });
            }

            data[nodeId]["name"] = name;
            data[nodeId]["category"] = category;
            data[nodeId]["componentClass"] = componentClass;
            data[nodeId]["parent"] = null;
        }

        // Update components in list view table
        model.views[_this.Id].listView.UpdateComponents(data);

        // Update components in editUserProperties table
        model.views[this.Id].editUserPropertiesForm.UpdateComponents(allProperties, true);   
        
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            data: {
                'PropertyData': JSON.stringify(data),
                'ComponentTable': sourceManager.GetComponentsTableName(),
                'PropertyTable': sourceManager.GetPropertiesTableName(),
                'InvokeFunction': 'Update',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            type: "POST",
            url: "PHP/UserProperties.php"
        }).done(function (msg) {
            var object = JSON.parse(msg);
            if (object.MsgCode !== 1) {                
                return;
            }
            
            DevExpress.ui.notify("Properties updated successfully.");
        });
    }

    this.PropertiesTagBox.reset();
    this.LoadData();
}