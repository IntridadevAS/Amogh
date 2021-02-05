function DefineListForm(id) {
    this.Id = id;

    this.Active = false;

    this.DefineGroupsGrid;
    this.GroupSelect;
    this.NameTextBox;
    this.DescriptionTextBox;
    this.UpdatedRowsData = {};
}

DefineListForm.prototype.GetHtmlElementId = function () {
    return "defineListForm" + this.Id;
}

DefineListForm.prototype.Open = function () {
    this.Active = true;

    var defineListForm = document.getElementById(this.GetHtmlElementId());
    defineListForm.style.display = "block";
    defineListForm.style.top = "calc( 50% - 141px)";    
    defineListForm.style.left = "calc( 50% - 225px)";   

    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(defineListForm,
        document.getElementById("defineListFormCaptionBar" + this.Id));

    this.Init();
}

DefineListForm.prototype.Close = function () {
    this.Active = false;

    var defineListForm = document.getElementById(this.GetHtmlElementId());
    defineListForm.style.display = "none";
}

DefineListForm.prototype.Init = function () {
    var _this = this;

  //  this.PopulateTemplateGrid();

    this.PopulateLists();

    this.NameTextBox = $("#defineListFormNameBox" + this.Id).dxTextBox({
        placeholder: "Enter Name..."
    }).dxTextBox("instance");

    this.DescriptionTextBox = $("#defineListFormDescriptionBox" + this.Id).dxTextBox({
        placeholder: "Enter Description..."
    }).dxTextBox("instance");

    // Create btns    
    document.getElementById("defineListFormApplyBtn" + this.Id).onclick = function () {
        _this.OnApplyListView();
    }

    document.getElementById("defineListFormCloseBtn" + this.Id).onclick = function () {
        _this.Close();
    };

    // On add
    // document.getElementById("defineListFormAdd" + this.Id).onclick = function () {
    //     if (_this.DefineGroupsGrid) {
    //         _this.DefineGroupsGrid.addRow();
    //         _this.DefineGroupsGrid.deselectAll();
    //     }
    // }

    // On Clear
    // document.getElementById("defineListFormClear" + this.Id).onclick = function () {
    //     if (_this.DefineGroupsGrid) {

    //         var selectedRowKeys = _this.DefineGroupsGrid.getSelectedRowKeys();

    //         var totalRowsToRemove = selectedRowKeys.length;
    //         for (var i = 0; i < totalRowsToRemove; i++) {
    //             var rowIndex = _this.DefineGroupsGrid.getRowIndexByKey(selectedRowKeys[i]);
    //             if (rowIndex > -1) {
    //                 _this.DefineGroupsGrid.deleteRow(rowIndex);
    //                 _this.DefineGroupsGrid.refresh(true);
    //             }
    //         }
    //     }
    // }

    // On delete group
    // document.getElementById("deleteGroupBtn" + this.Id).onclick = function () {
    //     if (_this.GroupSelect) {
    //         var selectedGroup = _this.GroupSelect.option("value");
    //         if (selectedGroup.toLowerCase() === "name") {
    //             return;
    //         }

    //         var propertyGroups = model.propertyGroups;
    //         if (selectedGroup in propertyGroups) {
    //             delete propertyGroups[selectedGroup];                
                
    //             _this.PopulateGroups();
    //             _this.PopulateTemplateGrid();

    //             var sourceManager = SourceManagers[_this.Id];
    //             let groupViewType = sourceManager.GroupHighlightTypeSelect.option("value");
    //             if (groupViewType.toLowerCase() === "group") {
    //                 sourceManager.GroupTemplateSelect.option("items", ["Clear"].concat(Object.keys(model.propertyGroups)));
    //             }

    //             DevExpress.ui.notify("Group '" + selectedGroup + "'" + " deleted.");
    //         }
    //     }
    // }
}

DefineListForm.prototype.PopulateLists = function () {
    var _this = this;
    var lists = [
        "Clear"
    ];

    var propertyList = model.propertyList;
    for (var viewName in propertyList) {
        lists.push(viewName);
    }

    this.GroupSelect = $("#defineListFormTypeDL" + this.Id).dxSelectBox({
        items: lists,
        value: "Clear",
        onValueChanged: function (data) {
            model.views[_this.Id].listView.OnListViewTemplateChanged(data.value);
        }

    }).dxSelectBox("instance");
}


DefineListForm.prototype.OnApplyListView = function () {
    var _this = this
   
    var templateName = this.NameTextBox.option("value");
    if (!templateName ||
        templateName === "") {
        alert("Please enter name for view to save.");
        return;
    }

    var editUserPropertiesForm = model.views[_this.Id].listView;
    var selectedRowsData = editUserPropertiesForm.ListViewTableInstance.getSelectedRowsData();
    var properties = [];

    var visibleColumns = editUserPropertiesForm.ListViewTableInstance.getVisibleColumns();
    for (var i = 0; i < selectedRowsData.length; i++) {
        var rowData = selectedRowsData[i];

        for (var prop in rowData) {
            if (prop.toLowerCase() === "item" ||
                prop.toLowerCase() === "nodeid") {
                continue;
            }

            var columnIndex = editUserPropertiesForm.ListViewTableInstance.getVisibleColumnIndex(prop)
            if (columnIndex === -1) {
                continue;
            }
            var propName = visibleColumns[columnIndex].caption;
            if (properties.indexOf(propName) === -1) {
                properties.push(propName);
            }
        }
    }
 
    var group = {
        "name": templateName,
        "properties": properties
    };

    var sourceManager = SourceManagers[this.Id];
  
      
    var listViewSDA = document.getElementById("listviewAction" + _this.Id);
    listViewSDA.classList.add("showSDA");
    listViewSDA.onclick = function () {
        if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.List) {
            var selectedComps = _this.GetCurrentTable().GetSelectedComponents();
            if (selectedComps.constructor === Object) {
                selectedComps = Object.values(selectedComps);
            }

            model.views[_this.Id].listView.Show(selectedComps);

            _this.CloseTableViewsMenu();
            
            if (!isDataVault()) {
                // hide group view controls
                _this.ShowGroupViewControls(false);
            }
        }
    }

    // Reset controls
    this.NameTextBox.option("value", "");   

}


DefineListForm.prototype.CloseTableViewsMenu = function () {
    var _this = this;

    var mainBtn = document.getElementById("tableViewAction" + this.Id);
    mainBtn.classList.remove("openSDAMenu");
    mainBtn.children[0].src = "public/symbols/Table Views.svg";

    var dataBrowserSDA = document.getElementById("dataBrowserAction" + _this.Id);
    dataBrowserSDA.classList.remove("showSDA");

    var listViewSDA = document.getElementById("listviewAction" + _this.Id);
    listViewSDA.classList.remove("showSDA");

    var groupsSDA = document.getElementById("groupsAction" + _this.Id);
    groupsSDA.classList.remove("showSDA");
}

DefineListForm.prototype.PopulateTemplateGrid = function () {    
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
    column["caption"] = "Id";
    column["dataField"] = "Id";;
    column["visible"] = false;
    columns.push(column);
    // Create grid        

    var selected;
    if (model.views[_this.Id].activeTableView.toLowerCase() === "list view") {
        selected = model.views[this.Id].listView.GetSelectedComponents();
    }

    for (var id in selected) {
        var selectedComp = selected[id];

        var rowData = {};
        rowData["Item"] = selectedComp.Name;
        rowData["Id"] = id;

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
    this.PropertiesGrid = $("#defineListGrid" + this.Id).dxDataGrid({
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
        onRowUpdating(e) {
            var id = e.oldData.Id;
            if (!(id in _this.UpdatedRowsData)) {
                _this.UpdatedRowsData[id] = {};
            }

            for (var prop in e.newData) {
                _this.UpdatedRowsData[id][prop] = e.newData[prop];
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
            if (e.row.rowType === "header" &&
                e.column.type !== "selection") {
                e.items = [
                    {
                        text: "Edit",
                        disabled: (e.column.dataField.toLowerCase() === "item" || e.column.dataField.toLowerCase() === "Id"),
                        onItemClick: function () {
                            _this.OnEditPropertyForAll(e.columnIndex, e.column.caption);
                        }
                    },
                    {
                        text: "Remove",
                        disabled: (e.column.dataField.toLowerCase() === "item" || e.column.dataField.toLowerCase() === "Id"),
                        onItemClick: function () {
                            _this.OnRemovePropertyForAll(e.columnIndex, e.column.caption);
                        }
                    }
                ];
            }
        }
    }).dxDataGrid("instance");
}

DefineListForm.prototype.OnApply = function () {
    var viewName = this.NameTextBox.option("value");
    var viewDescription = this.DescriptionTextBox.option("value");
    if (!viewName ||
        viewName === "") {
        alert("Please enter name for view to save.");
        return;
    }

    var rows = this.DefineGroupsGrid.getVisibleRows();
    if (rows.length === 0) {
        alert("No data to save.");
        return;
    }

    var groupingProperties = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        groupingProperties.push(row.data.Name);
    }

    // templateName = this.NameTextBox.option("value");

    var group = {
        "name": viewName,
        "properties": groupingProperties
    };

    model.propertyGroups[viewName] = group;

    var sourceManager = SourceManagers[this.Id];
    let groupViewType = sourceManager.GroupHighlightTypeSelect.option("value");
    if (groupViewType.toLowerCase() === "group") {
        SourceManagers[this.Id].GroupTemplateSelect.option("items", ["Clear"].concat(Object.keys(model.propertyGroups)));
    }
    
    // Reset controls
    this.NameTextBox.option("value", "");     
    this.PopulateGroups();
    this.PopulateTemplateGrid();

    DevExpress.ui.notify("Group template '" + templateName + "' created successfully.");
}

// DefineListForm.prototype.GetAllSourceProperties = function () {
//     var sourceManager = SourceManagers[this.Id];

//     var allProperties = [];
//     if (sourceManager.Is3DSource()) {
//         var allComponents = sourceManager.AllComponents;

//         for (var nodeId in allComponents) {
//             var component = allComponents[nodeId];
//             if (component.properties.length > 0) {
//                 for (var i = 0; i < component.properties.length; i++) {
//                     var property = component.properties[i];
//                     if (allProperties.indexOf(property.Name) === -1) {
//                         allProperties.push(property.Name);
//                     }
//                 }
//             }
//         }
//     }

//     return allProperties;
// }