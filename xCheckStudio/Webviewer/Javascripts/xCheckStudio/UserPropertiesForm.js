/*
UserProperties Form Class
*/
function UserPropertiesForm(id) {
    this.Id = id;

    this.Active = false;

    this.PropertiesGrid = null;
    this.RowInserting = false;

    this.UpdatedRowsData = {};
}

UserPropertiesForm.prototype.GetHtmlElementId = function () {
    return "userPropertiesForm" + this.Id;
}

UserPropertiesForm.prototype.Open = function () {
    if (model.views[this.Id].activeTableView.toLowerCase() !== "list view" &&
        model.views[this.Id].activeTableView.toLowerCase() !== "groups view") {
        return;
    }

    this.Active = true;

    var userPropertiesForm = document.getElementById(this.GetHtmlElementId());
    userPropertiesForm.style.display = "block";
    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(userPropertiesForm,
        document.getElementById("userPropertiesFormCaptionBar" + this.Id));

    this.Init();
}

UserPropertiesForm.prototype.Clear = function () {
    var gridContainer = document.getElementById("userPropertiesGrid" + this.Id);
    var parent = gridContainer.parentElement;

    //remove html element which holds grid
    //devExtreme does not have destroy method. We have to remove the html element and add it again to create another table
    $("#userPropertiesGrid" + this.Id).dxDataGrid("dispose");
    $("#userPropertiesGrid" + this.Id).remove();

    //Create and add div with same id to add grid again
    var gridContainerDiv = document.createElement("div")
    gridContainerDiv.id = "userPropertiesGrid" + this.Id;
    var styleRule = ""
    styleRule = "height: 180px; overflow:hidden";
    gridContainerDiv.setAttribute("style", styleRule);
    parent.appendChild(gridContainerDiv);
}

UserPropertiesForm.prototype.LoadData = function () {
    this.UpdatedRowsData = {};

    var _this = this;
    var rowsData = [];

    // Create grid        
    var columns = [];

    var column = {};
    column["caption"] = "Id";
    column["dataField"] = "Id";
    column["visible"] = false;
    columns.push(column);

    column = {};
    column["caption"] = "Name";
    column["dataField"] = "Name";
    column["width"] = "50%";
    column["visible"] = true;
    column["validationRules"] = [{ type: "required" }]
    columns.push(column);

    column = {};
    column["caption"] = "Default Value";
    column["dataField"] = "DefaultValue";
    column["width"] = "50%";
    column["visible"] = true;
    columns.push(column);

    var loadingBrowser = true;
    this.AvoidTableEvents = false;
    // this.AlreadyRowsData = {};

    var allProperties = SourceManagers[this.Id].GetAllSourceProperties();
    var allPropertiesU = allProperties.map(function (value) { return value.toUpperCase(); });

    this.PropertiesGrid = $("#userPropertiesGrid" + this.Id).dxDataGrid({
        columns: columns,
        dataSource: rowsData,
        allowColumnResizing: true,
        columnResizingMode: 'widget',
        showBorders: true,
        showRowLines: true,
        paging: { enabled: false },
        filterRow: {
            visible: false
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

            // if (e.component.getDataSource().totalCount() === 0) {
            //     return;
            // }

            // var items = e.component.getDataSource().items();
            // for (var i = 0; i < items.length; i++) {
            //     var item = items[i];
            //     _this.AlreadyRowsData[item.Name] = {
            //         "property": item.Name,
            //         "value": item.DefaultValue ? item.DefaultValue : "",
            //     };
            // }                             
        },
        onRowInserting: function (e) {
            _this.AvoidTableEvents = true;

            // check if property with same already exists in data set but with
            // with different case. If yes, then restrict user to have property name
            // in same case
            var eleIndex = allPropertiesU.indexOf(e.data.Name.toUpperCase())
            if (eleIndex !== -1) {
                e.data.Name = allProperties[eleIndex];
            }

            // if(e.data.Name in  _this.UpdatedRowsData ||
            //    e.data.Name in  _this.AlreadyRowsData)
            // {
            //     alert("Duplicate Property.");
            //     e.data.Name = null;
            //     e.cancel = true;
            // }
            if (e.data.Name in _this.UpdatedRowsData) {
                alert("Duplicate Property.");
                e.data.Name = null;
                e.cancel = true;
            }

            e.component.refresh();

            _this.AvoidTableEvents = false;
        },
        onRowInserted: function (e) {
            _this.AvoidTableEvents = true;

            _this.UpdatedRowsData[e.data.Name] = {
                "property": e.data.Name,
                "value": e.data.DefaultValue ? e.data.DefaultValue : "",
                "action": "add"
            };

            _this.AvoidTableEvents = false;
        },
        onRowRemoved: function (e) {
            if (e.data.Name in _this.UpdatedRowsData) {
                delete _this.UpdatedRowsData[e.data.Name];
            }

            // _this.UpdatedRowsData[e.data.Name] = {
            //     "property": e.data.Name,
            //     "value": e.data.DefaultValue ? e.data.DefaultValue : "",
            //     "action": "remove"
            // };   
        },
        onRowUpdating(e) {
            _this.AvoidTableEvents = true;

            if (e.oldData.Name in _this.UpdatedRowsData) {
                if ("Name" in e.newData) {
                    // check if property with same already exists in data set but with
                    // with different case. If yes, then restrict user to have property name
                    // in same case
                    var eleIndex = allPropertiesU.indexOf(e.newData.Name.toUpperCase())
                    if (eleIndex !== -1) {
                        e.newData.Name = allProperties[eleIndex];
                        e.component.refresh();
                    }
                    // if ((e.newData.Name in _this.UpdatedRowsData ||
                    //     e.newData.Name in _this.AlreadyRowsData) &&
                    //     e.newData.Name !== e.oldData.Name )  {
                    //     alert("Duplicate Property.");
                    //     e.newData.Name = e.oldData.Name;
                    //     e.cancel = true;
                    //     e.component.refresh();
                    //     return;
                    // }
                    if ((e.newData.Name in _this.UpdatedRowsData) &&
                        e.newData.Name !== e.oldData.Name) {
                        alert("Duplicate Property.");
                        e.newData.Name = e.oldData.Name;
                        e.cancel = true;
                        e.component.refresh();
                        return;
                    }

                    _this.UpdatedRowsData[e.newData.Name] = {
                        "property": e.newData.Name,
                        "value": e.oldData.DefaultValue ? e.oldData.DefaultValue : "",
                        "action": _this.UpdatedRowsData[e.oldData.Name].action
                    };
                    delete _this.UpdatedRowsData[e.oldData.Name];
                }
                else if ("DefaultValue" in e.newData) {
                    _this.UpdatedRowsData[e.oldData.Name]["value"] = e.newData.DefaultValue ? e.newData.DefaultValue : "";
                }
            }
            // else if (e.oldData.Name in _this.AlreadyRowsData) {
            //     if ("Name" in e.newData) {
            //         // check if property with same already exists in data set but with
            //         // with different case. If yes, then restrict user to have property name
            //         // in same case
            //         var eleIndex = allPropertiesU.indexOf(e.newData.Name.toUpperCase())
            //         if (eleIndex !== -1) {
            //             e.newData.Name = allProperties[eleIndex];
            //             e.component.refresh();
            //         }
            //         if ((e.newData.Name in _this.UpdatedRowsData ||
            //             e.newData.Name in _this.AlreadyRowsData) &&
            //             e.newData.Name !== e.oldData.Name )  {
            //             alert("Duplicate Property.");
            //             e.newData.Name = e.oldData.Name;
            //             e.cancel = true;
            //             e.component.refresh();
            //             return;
            //         }

            //         _this.UpdatedRowsData[e.newData.Name] = {
            //             "oldProperty": e.oldData.Name,
            //             "property": e.newData.Name,
            //             "value": e.oldData.DefaultValue ? e.oldData.DefaultValue : "",
            //             "action": "update"
            //         };
            //     }
            //     else if ("DefaultValue" in e.newData) {
            //         _this.UpdatedRowsData[e.oldData.Name] = {
            //             "oldProperty": e.oldData.Name,
            //             "property": e.oldData.Name,
            //             "value": e.newData.DefaultValue ? e.newData.DefaultValue : "",
            //             "action": "update"
            //         };
            //     }
            // }

            _this.AvoidTableEvents = false;
        },
        // onRowValidating: function (e) {
        //     // if (e.isValid && e.newData.Login === "Administrator") {
        //     //     e.isValid = false;
        //     //     e.errorText = "Your cannot log in as Administrator";
        //     // }           
        // }       
    }).dxDataGrid("instance");
}

UserPropertiesForm.prototype.Init = function () {
    var _this = this;

    this.LoadData();

    // Create btns
    document.getElementById("userPropertiesPropogateBtn" + this.Id).onclick = function () {

    }

    document.getElementById("userPropertiesApplyBtn" + this.Id).onclick = function () {

        if (_this.PropertiesGrid.hasEditData() === true) {
            _this.PropertiesGrid.saveEditData().then(() => {
                _this.OnApply();
            });
        }
        else {
            _this.OnApply();
        }
    }

    document.getElementById("userPropertiesCloseBtn" + this.Id).onclick = function () {
        _this.Close();
    };

    // On add properties
    document.getElementById("userPropertiesFormAdd" + this.Id).onclick = function () {
        if (_this.PropertiesGrid) {
            _this.PropertiesGrid.addRow();
            _this.PropertiesGrid.deselectAll();
        }
    }

    // On Clear properties
    document.getElementById("userPropertiesFormClear" + this.Id).onclick = function () {
        if (_this.PropertiesGrid) {

            var selectedRowKeys = _this.PropertiesGrid.getSelectedRowKeys();

            var totalRowsToRemove = selectedRowKeys.length;
            for (var i = 0; i < totalRowsToRemove; i++) {
                var rowIndex = _this.PropertiesGrid.getRowIndexByKey(selectedRowKeys[i]);
                if (rowIndex > -1) {
                    _this.PropertiesGrid.deleteRow(rowIndex);
                    _this.PropertiesGrid.refresh(true);
                }
            }
        }
    }
}

UserPropertiesForm.prototype.Close = function () {
    this.Active = false;

    var userPropertiesForm = document.getElementById(this.GetHtmlElementId());
    userPropertiesForm.style.display = "none";

    this.UpdatedRowsData = {};

    this.Clear();
}

UserPropertiesForm.prototype.UpdateToDB = function (data, sourceType) {
    let _this = this;

    return new Promise(function (resolve) {
        let sourceManager = SourceManagers[_this.Id];

        // Add properties in DB
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            data: {
                'PropertyData': JSON.stringify(data),
                'ComponentTable': sourceManager.GetComponentsTableName(),
                'PropertyTable': sourceManager.GetPropertiesTableName(),
                'InvokeFunction': 'Update',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname,
                "SourceType": sourceType
            },
            type: "POST",
            url: "PHP/UserProperties.php"
        }).done(function (msg) {
            var object = xCheckStudio.Util.tryJsonParse(msg);
            if (object === null ||
                object.MsgCode !== 1) {
                return resolve(null);
            }

            // for (var compId in object.Data.newComponentIds) {
            //     var nodeId = object.Data.newComponentIds[compId];
            //     sourceManager.NodeIdvsComponentIdList[nodeId] = compId;
            // }

            _this.UpdatedRowsData = {};

            _this.Clear();
            _this.LoadData();

            DevExpress.ui.notify("Properties updated successfully.");

            return resolve(object.Data);
        });
    });
}

/*
  UserProperties Form Class for 3D datasets
*/
function UserPropertiesForm3D(id) {
    // call super constructor
    UserPropertiesForm.call(this, id);

    // this.Id = id;

    // this.Active = false;

    // this.PropertiesGrid = null;
    // this.RowInserting = false;

    // this.UpdatedRowsData = {};

    this.AvoidTableEvents = false;
}
// assign UserPropertiesForm's methods to this class
UserPropertiesForm3D.prototype = Object.create(UserPropertiesForm.prototype);
UserPropertiesForm3D.prototype.constructor = UserPropertiesForm3D;


UserPropertiesForm3D.prototype.OnApply = function () {
    var _this = this;
    if (_this.PropertiesGrid) {

        var properties = Object.values(_this.UpdatedRowsData);
        if (properties.count === 0) {
            return;
        }

        var selectedNodeIds = [];
        if (model.views[_this.Id].activeTableView.toLowerCase() === "list view") {
            selectedNodeIds = model.views[_this.Id].listView.GetSelectedNodeIds();
        }
        else if (model.views[_this.Id].activeTableView.toLowerCase() === "groups view") {
            selectedNodeIds = model.views[_this.Id].groupView.GetSelectedNodeIds();
        }
        if (!selectedNodeIds || selectedNodeIds.length === 0) {
            return;
        }

        var sourceManager = SourceManagers[_this.Id];
        var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceManager.SourceType);
        var nameProperty = "";
        var categoryProperty = "";
        var classProperty = "";
        if (identifierProperties !== null) {
            nameProperty = identifierProperties.name.replace("Intrida Data/", "");
            categoryProperty = identifierProperties.mainCategory.replace("Intrida Data/", "");
            classProperty = identifierProperties.subClass.replace("Intrida Data/", "");
        }

        var data = {};
        var alreadyExistingProps = {};
        for (var i = 0; i < selectedNodeIds.length; i++) {
            var nodeId = selectedNodeIds[i];

            data[nodeId] = {};

            // add properties against nodeid data
            //before check if any one of the properties already exists
            //data[nodeId]["properties"] = properties;            
            data[nodeId]["properties"] = [];

            var componentObj = sourceManager.AllComponents[nodeId];
            for (var propIndex = 0; propIndex < properties.length; propIndex++) {
                var prop = properties[propIndex];
                if (componentObj.propertyExists(prop.property)) {
                    if (!(componentObj.Name in alreadyExistingProps)) {
                        alreadyExistingProps[componentObj.Name] = [];
                    }

                    alreadyExistingProps[componentObj.Name].push(prop.property);
                }
                else {
                    data[nodeId]["properties"].push(prop);
                }
            }
            if (data[nodeId]["properties"].length === 0) {
                delete data[nodeId];
                continue;
            }

            data[nodeId]["newComponent"] = false;
            if (sourceManager.NodeIdvsComponentIdList[nodeId]) {
                // Properties to already existing component
                data[nodeId]["component"] = sourceManager.GetCompIdByNodeId(nodeId);
            }
            else {
                // new component
                data[nodeId]["newComponent"] = true;
            }

            // Properties to new component
            var name = null;
            var category = null;
            var componentClass = null;
            for (var j = 0; j < data[nodeId]["properties"].length; j++) {
                var propData = data[nodeId]["properties"][j];

                if (propData.action.toLowerCase() === "add") {

                    if (propData.property.toLowerCase() === nameProperty.toLowerCase()) {
                        name = propData.value;
                    }

                    if (propData.property.toLowerCase() === categoryProperty.toLowerCase()) {
                        category = propData.value;
                    }

                    if (propData.property.toLowerCase() === classProperty.toLowerCase()) {
                        componentClass = propData.value;
                    }
                }
            }

            if ((!name || name == "") &&
                !sourceManager.NodeIdvsComponentIdList[nodeId]) {
                name = sourceManager.GetNodeName(nodeId);
            }
            data[nodeId]["name"] = name;
            data[nodeId]["category"] = category;
            data[nodeId]["componentClass"] = componentClass;
            data[nodeId]["parent"] = sourceManager.GetNodeParent(nodeId);
        }

        // if alreadyExistingProps
        if (Object.keys(alreadyExistingProps).length > 0) {
            var msg = "Duplicate properties found. Will not be considered for corresponding components.\n\n";
            for (var key in alreadyExistingProps) {
                for (var i = 0; i < alreadyExistingProps[key].length; i++) {
                    msg += "\t" + key + " : " + alreadyExistingProps[key][i] + "\n";
                }
            }

            alert(msg);
        }
        if (Object.keys(data).length === 0) {
            _this.Clear();
            _this.LoadData();
            return;
        }

        // Update components in tables
        if (model.views[_this.Id].activeTableView.toLowerCase() === "list view") {
            model.views[_this.Id].listView.UpdateComponents(data);
        }
        else if (model.views[_this.Id].activeTableView.toLowerCase() === "groups view") {
            model.views[_this.Id].groupView.UpdateComponents(data);
        }

        // update to DB
        _this.UpdateToDB(data, "3D").then(function (result) {
            if (!result) {
                return;
            }

            for (var compId in result.newComponentIds) {
                var nodeId = result.newComponentIds[compId];
                sourceManager.NodeIdvsComponentIdList[nodeId] = compId;
            }
        });
        // var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        // var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        // $.ajax({
        //     data: {
        //         'PropertyData': JSON.stringify(data),
        //         'ComponentTable': sourceManager.GetComponentsTableName(),
        //         'PropertyTable': sourceManager.GetPropertiesTableName(),
        //         'InvokeFunction': 'Update',
        //         'ProjectName': projectinfo.projectname,
        //         'CheckName': checkinfo.checkname,
        //         "SourceType" : "3D"
        //     },
        //     type: "POST",
        //     url: "PHP/UserProperties.php"
        // }).done(function (msg) {
        //     var object = xCheckStudio.Util.tryJsonParse(msg);
        //     if (object === null ||
        //         object.MsgCode !== 1) {
        //         return;
        //     }

        //     for (var compId in object.Data.newComponentIds) {
        //         var nodeId = object.Data.newComponentIds[compId];
        //         sourceManager.NodeIdvsComponentIdList[nodeId] = compId;
        //     }

        //     _this.UpdatedRowsData = {};

        //     _this.Clear();
        //     _this.LoadData();

        //     DevExpress.ui.notify("Properties updated successfully.");
        // });
    }
}

/*
  UserProperties Form Class for 3D datasets
*/
function UserPropertiesForm1D(id) {
    // call super constructor
    UserPropertiesForm.call(this, id);

    // this.Id = id;

    // this.Active = false;

    // this.PropertiesGrid = null;
    // this.RowInserting = false;

    // this.UpdatedRowsData = {};

    this.AvoidTableEvents = false;
}
// assign UserPropertiesForm's methods to this class
UserPropertiesForm1D.prototype = Object.create(UserPropertiesForm.prototype);
UserPropertiesForm1D.prototype.constructor = UserPropertiesForm1D;

UserPropertiesForm1D.prototype.OnApply = function () {
    var _this = this;
    if (!_this.PropertiesGrid) {
        return;
    }

    var properties = Object.values(_this.UpdatedRowsData);
    if (properties.count === 0) {
        return;
    }

    var selectedIds = [];
    if (model.views[_this.Id].activeTableView.toLowerCase() === "list view") {
        // selectedIds = model.views[_this.Id].listView.GetSelectedIds();
    }
    else if (model.views[_this.Id].activeTableView.toLowerCase() === "groups view") {
        selectedIds = model.views[_this.Id].groupView.GetSelectedIds();
    }
    if (!selectedIds ||
        selectedIds.length === 0) {
        return;
    }

    var sourceManager = SourceManagers[_this.Id];
    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceManager.SourceType);
    var nameProperty = "";
    var categoryProperty = "";
    var classProperty = "";
    if (identifierProperties !== null) {
        nameProperty = identifierProperties.name.replace("Intrida Data/", "");
        categoryProperty = identifierProperties.mainCategory.replace("Intrida Data/", "");
        classProperty = identifierProperties.subClass.replace("Intrida Data/", "");
    }

    var data = {};
    var alreadyExistingProps = {};
    let allComponents = sourceManager.GetAllComponents();
    for (var i = 0; i < selectedIds.length; i++) {
        var id = selectedIds[i];

        data[id] = {};

        // add properties against id data
        //before check if any one of the properties already exists
        //data[id]["properties"] = properties;            
        data[id]["properties"] = [];

        var componentObj = allComponents[id];
        for (var propIndex = 0; propIndex < properties.length; propIndex++) {
            var prop = properties[propIndex];
            if (componentObj.propertyExists(prop.property)) {
                if (!(componentObj.Name in alreadyExistingProps)) {
                    alreadyExistingProps[componentObj.Name] = [];
                }

                alreadyExistingProps[componentObj.Name].push(prop.property);
            }
            else {
                data[id]["properties"].push(prop);
            }
        }
        if (data[id]["properties"].length === 0) {
            delete data[id];
            continue;
        }

        // data[id]["newComponent"] = false;
        // if (sourceManager.NodeIdvsComponentIdList[nodeId]) {
        // Properties to already existing component
        data[id]["component"] = id;
        // }
        // else {
        //     // new component
        //     data[nodeId]["newComponent"] = true;
        // }


        // Properties to new component
        var name = null;
        var category = null;
        var componentClass = null;
        for (var j = 0; j < data[id]["properties"].length; j++) {
            var propData = data[id]["properties"][j];

            if (propData.action.toLowerCase() === "add") {

                if (propData.property.toLowerCase() === nameProperty.toLowerCase()) {
                    name = propData.value;
                }

                if (propData.property.toLowerCase() === categoryProperty.toLowerCase()) {
                    category = propData.value;
                }

                if (propData.property.toLowerCase() === classProperty.toLowerCase()) {
                    componentClass = propData.value;
                }
            }
        }

        if (!name || name == "") {
            name = componentObj.Name;
        }
        data[id]["name"] = name;
        data[id]["category"] = category;
        data[id]["componentClass"] = componentClass;
        data[id]["parent"] = null;
    }

    // if alreadyExistingProps
    if (Object.keys(alreadyExistingProps).length > 0) {
        var msg = "Duplicate properties found. Will not be considered for corresponding components.\n\n";
        for (var key in alreadyExistingProps) {
            for (var i = 0; i < alreadyExistingProps[key].length; i++) {
                msg += "\t" + key + " : " + alreadyExistingProps[key][i] + "\n";
            }
        }

        alert(msg);
    }
    if (Object.keys(data).length === 0) {
        _this.Clear();
        _this.LoadData();
        return;
    }

    // Update components in tables
    if (model.views[_this.Id].activeTableView.toLowerCase() === "list view") {
        // model.views[_this.Id].listView.UpdateComponents(data);
    }
    else if (model.views[_this.Id].activeTableView.toLowerCase() === "groups view") {
        model.views[_this.Id].groupView.UpdateComponents(data);
    }

    // update to DB
    _this.UpdateToDB(data, "1D").then(function (result) {
        if (!result) {
            return;
        }

    });

    // // Add properties in DB
    // var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    // var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    // $.ajax({
    //     data: {
    //         'PropertyData': JSON.stringify(data),
    //         'ComponentTable': sourceManager.GetComponentsTableName(),
    //         'PropertyTable': sourceManager.GetPropertiesTableName(),
    //         'InvokeFunction': 'Update',
    //         'ProjectName': projectinfo.projectname,
    //         'CheckName': checkinfo.checkname,
    //         "SourceType" : "1D"
    //     },
    //     type: "POST",
    //     url: "PHP/UserProperties.php"
    // }).done(function (msg) {
    //     var object = xCheckStudio.Util.tryJsonParse(msg);
    //     if (object === null ||
    //         object.MsgCode !== 1) {
    //         return;
    //     }

    //     for (var compId in object.Data.newComponentIds) {
    //         var nodeId = object.Data.newComponentIds[compId];
    //         sourceManager.NodeIdvsComponentIdList[nodeId] = compId;
    //     }

    //     _this.UpdatedRowsData = {};

    //     _this.Clear();
    //     _this.LoadData();

    //     DevExpress.ui.notify("Properties updated successfully.");
    // });

    // var _this = this;
    // if (_this.PropertiesGrid) {

    //     var properties = Object.values(_this.UpdatedRowsData);
    //     if (properties.count === 0) {
    //         return;
    //     }

    //     var selectedNodeIds = [];
    //     if (model.views[_this.Id].activeTableView.toLowerCase() === "list view") {
    //         selectedNodeIds = model.views[_this.Id].listView.GetSelectedNodeIds();
    //     }
    //     else if (model.views[_this.Id].activeTableView.toLowerCase() === "groups view") {
    //         selectedNodeIds = model.views[_this.Id].groupView.GetSelectedNodeIds();
    //     }
    //     if (!selectedNodeIds || selectedNodeIds.length === 0) {
    //         return;
    //     }

    //     var sourceManager = SourceManagers[_this.Id];
    //     var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceManager.SourceType);
    //     var nameProperty = "";
    //     var categoryProperty = "";
    //     var classProperty = "";
    //     if (identifierProperties !== null) {
    //         nameProperty = identifierProperties.name.replace("Intrida Data/", "");
    //         categoryProperty = identifierProperties.mainCategory.replace("Intrida Data/", "");
    //         classProperty = identifierProperties.subClass.replace("Intrida Data/", "");
    //     }

    //     var data = {};
    //     var alreadyExistingProps = {};
    //     for (var i = 0; i < selectedNodeIds.length; i++) {
    //         var nodeId = selectedNodeIds[i];

    //         data[nodeId] = {};

    //         // add properties against nodeid data
    //         //before check if any one of the properties already exists
    //         //data[nodeId]["properties"] = properties;            
    //         data[nodeId]["properties"] = [];

    //         var componentObj = sourceManager.AllComponents[nodeId];
    //         for (var propIndex = 0; propIndex < properties.length; propIndex++) {
    //             var prop = properties[propIndex];
    //             if (componentObj.propertyExists(prop.property)) {
    //                 if (!(componentObj.Name in alreadyExistingProps)) {
    //                     alreadyExistingProps[componentObj.Name] = [];
    //                 }

    //                 alreadyExistingProps[componentObj.Name].push(prop.property);
    //             }
    //             else {
    //                 data[nodeId]["properties"].push(prop);
    //             }
    //         }
    //         if (data[nodeId]["properties"].length === 0) {
    //             delete data[nodeId];
    //             continue;
    //         }

    //         data[nodeId]["newComponent"] = false;
    //         if (sourceManager.NodeIdvsComponentIdList[nodeId]) {
    //             // Properties to already existing component
    //             data[nodeId]["component"] = sourceManager.GetCompIdByNodeId(nodeId);
    //         }
    //         else {
    //             // new component
    //             data[nodeId]["newComponent"] = true;
    //         }

    //         // Properties to new component
    //         var name = null;
    //         var category = null;
    //         var componentClass = null;
    //         for (var j = 0; j < data[nodeId]["properties"].length; j++) {
    //             var propData = data[nodeId]["properties"][j];

    //             if (propData.action.toLowerCase() === "add") {

    //                 if (propData.property.toLowerCase() === nameProperty.toLowerCase()) {
    //                     name = propData.value;
    //                 }

    //                 if (propData.property.toLowerCase() === categoryProperty.toLowerCase()) {
    //                     category = propData.value;
    //                 }

    //                 if (propData.property.toLowerCase() === classProperty.toLowerCase()) {
    //                     componentClass = propData.value;
    //                 }
    //             }
    //         }

    //         if ((!name || name == "") &&
    //             !sourceManager.NodeIdvsComponentIdList[nodeId]) {
    //             name = sourceManager.GetNodeName(nodeId);
    //         }
    //         data[nodeId]["name"] = name;
    //         data[nodeId]["category"] = category;
    //         data[nodeId]["componentClass"] = componentClass;
    //         data[nodeId]["parent"] = sourceManager.GetNodeParent(nodeId);
    //     }

    //     // if alreadyExistingProps
    //     if (Object.keys(alreadyExistingProps).length > 0) {
    //         var msg = "Duplicate properties found. Will not be considered for corresponding components.\n\n";
    //         for (var key in alreadyExistingProps) {
    //             for (var i = 0; i < alreadyExistingProps[key].length; i++) {
    //                 msg += "\t" + key + " : " + alreadyExistingProps[key][i] + "\n";
    //             }
    //         }

    //         alert(msg);
    //     }
    //     if (Object.keys(data).length === 0) {
    //         _this.Clear();
    //         _this.LoadData();
    //         return;
    //     }

    //     // Update components in tables
    //     if (model.views[_this.Id].activeTableView.toLowerCase() === "list view") {
    //         model.views[_this.Id].listView.UpdateComponents(data);
    //     }
    //     else if (model.views[_this.Id].activeTableView.toLowerCase() === "groups view") {
    //         model.views[_this.Id].groupView.UpdateComponents(data);
    //     }

    //     var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    //     var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    //     $.ajax({
    //         data: {
    //             'PropertyData': JSON.stringify(data),
    //             'ComponentTable': sourceManager.GetComponentsTableName(),
    //             'PropertyTable': sourceManager.GetPropertiesTableName(),
    //             'InvokeFunction': 'Update',
    //             'ProjectName': projectinfo.projectname,
    //             'CheckName': checkinfo.checkname
    //         },
    //         type: "POST",
    //         url: "PHP/UserProperties.php"
    //     }).done(function (msg) {
    //         var object = xCheckStudio.Util.tryJsonParse(msg);
    //         if (object === null ||
    //             object.MsgCode !== 1) {
    //             return;
    //         }

    //         for (var compId in object.Data.newComponentIds) {
    //             var nodeId = object.Data.newComponentIds[compId];
    //             sourceManager.NodeIdvsComponentIdList[nodeId] = compId;
    //         }

    //         _this.UpdatedRowsData = {};

    //         _this.Clear();
    //         _this.LoadData();

    //         DevExpress.ui.notify("Properties updated successfully.");
    //     });
    // }
}