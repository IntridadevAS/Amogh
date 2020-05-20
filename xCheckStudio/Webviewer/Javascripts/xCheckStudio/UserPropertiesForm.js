function UserPropertiesForm(id) {
    this.Id = id;

    this.Active = false;
    
    this.PropertiesGrid = null;
    this.RowInserting = false;

    this.UpdatedRowsData = {};
    this.AlreadyRowsData = {};
}

UserPropertiesForm.prototype.GetHtmlElementId = function () {
    return "userPropertiesForm" + this.Id;
}

UserPropertiesForm.prototype.Open = function () {
    this.Active = true;

    var userPropertiesForm = document.getElementById(this.GetHtmlElementId());
    userPropertiesForm.style.display = "block";
    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(userPropertiesForm,
        document.getElementById("userPropertiesFormCaptionBar" + this.Id));

    this.Init();
}

UserPropertiesForm.prototype.LoadData = function ()
{
    this.UpdatedRowsData = {};

    var _this = this;

    var selected = model.views[this.Id].listView.GetSelectedComponents();
    var selectedCompProps = [];
    for (var nodeId in selected) {       

        var props = {};
        for (var i = 0; i < selected[nodeId].properties.length; i++) {
            var property = selected[nodeId].properties[i];
            if (!property.UserDefined) {
                continue;
            }

            props[property["Name"]] = property["Value"];            
        }
        selectedCompProps.push(props);
    }

    var commonUncommon = commonDifferentProperties(selectedCompProps);
    var rowsData = [];
    if (commonUncommon != null) {
        for (var prop in commonUncommon.common) {
            var value = commonUncommon.common[prop];

            rowsData.push({
                "Name": prop,
                "DefaultValue": value
            });
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
    columns.push(column);

    column = {};
    column["caption"] = "Default Value";
    column["dataField"] = "DefaultValue";
    column["width"] = "50%";
    column["visible"] = true;
    columns.push(column);

    var loadingBrowser = true;
    this.AlreadyRowsData = {};

    this.PropertiesGrid = $("#userPropertiesGrid" + this.Id).dxDataGrid({
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

            if (e.component.getDataSource().totalCount() === 0) {
                return;
            }

            var items = e.component.getDataSource().items();
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                _this.AlreadyRowsData[item.Name] = {
                    "property": item.Name,
                    "value": item.DefaultValue ? item.DefaultValue : "",
                };
            }                             
        },
        onSelectionChanged: function(e) {
            var selectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);           
        },
        onRowInserted : function(e){
            _this.UpdatedRowsData[e.data.Name] = {
                "property": e.data.Name,
                "value": e.data.DefaultValue ? e.data.DefaultValue : "",
                "action": "add"
            };           
        },
        onRowRemoved : function(e){
            _this.UpdatedRowsData[e.data.Name] = {
                "property": e.data.Name,
                "value": e.data.DefaultValue ? e.data.DefaultValue : "",
                "action": "remove"
            };   
        },       
        onRowUpdating(e) {
            var s = _this.UpdatedRowsData;

            if (e.oldData.Name in _this.UpdatedRowsData) {
                if ("Name" in e.newData) {
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
            else if (e.oldData.Name in _this.AlreadyRowsData) {
                if ("Name" in e.newData) {
                    _this.UpdatedRowsData[e.newData.Name] = {
                        "oldProperty": e.oldData.Name,
                        "property": e.newData.Name,
                        "value": e.oldData.DefaultValue ? e.oldData.DefaultValue : "",
                        "action": "update"
                    };
                }
                else if ("DefaultValue" in e.newData) {
                    _this.UpdatedRowsData[e.oldData.Name] = {
                        "oldProperty": e.oldData.Name,
                        "property": e.oldData.Name,
                        "value": e.newData.DefaultValue ? e.newData.DefaultValue : "",
                        "action": "update"
                    };
                }
            }
        }       
    }).dxDataGrid("instance");
}

UserPropertiesForm.prototype.Init = function () {
    var _this = this;

    this.LoadData();

    // Create btns
    document.getElementById("userPropertiesPropogateBtn" + this.Id).onclick = function () {              
       
    }

    document.getElementById("userPropertiesApplyBtn" + this.Id).onclick = function () {
        _this.OnApply();
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

UserPropertiesForm.prototype.OnApply =  function(){
    var _this = this;
    if (_this.PropertiesGrid) {

        var properties = Object.values(_this.UpdatedRowsData);
        if (properties.count === 0) {
            return;
        }        

        var selectedNodeIds = model.views[_this.Id].listView.GetAllSelectedRowNodeIds();
        if (selectedNodeIds.length === 0) {
            return;
        }

        var sourceManager = SourceManagers[_this.Id];
        var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceManager.SourceType);
        var nameProperty = identifierProperties.name.replace("Intrida Data/", "");
        var categoryProperty = identifierProperties.mainCategory.replace("Intrida Data/", "");
        var classProperty =  identifierProperties.subClass.replace("Intrida Data/", "");
       
        var data = {};     
        for (var i = 0; i < selectedNodeIds.length; i++) {
            var nodeId = selectedNodeIds[i];

            data[nodeId] = {};
            data[nodeId]["properties"] = properties;
            if (sourceManager.NodeIdvsComponentIdList[nodeId]) {

                // Properties to already existing component
                data[nodeId]["component"] = sourceManager.NodeIdvsComponentIdList[nodeId];
            }
            
            // Properties to new component
            var name = null;
            var category = null;
            var componentClass = null;
            for (var j = 0; j < properties.length; j++) {
                var propData = properties[j];
                if (propData.action.toLowerCase() === "add" ||
                    propData.action.toLowerCase() === "update") {
                    if (propData.property.toLowerCase() === nameProperty.toLowerCase()) {
                        name = propData.value;
                    }
                    else if (("oldProperty") in propData &&
                        propData.oldProperty.toLowerCase() === nameProperty.toLowerCase()) {
                        name = SourceManagers[this.Id].GetNodeName(nodeId);
                    }

                    if (propData.property.toLowerCase() === categoryProperty.toLowerCase()) {
                        category = propData.value;
                    }
                    else if (("oldProperty") in propData &&
                        propData.oldProperty.toLowerCase() === categoryProperty.toLowerCase()) {
                        category = "";
                    }
                    if (propData.property.toLowerCase() === classProperty.toLowerCase()) {
                        componentClass = propData.value;
                    }
                    else if (("oldProperty") in propData &&
                        propData.oldProperty.toLowerCase() === classProperty.toLowerCase()) {
                        componentClass = "";
                    }
                }
                else if (propData.action.toLowerCase() === "remove") {
                    if (propData.property.toLowerCase() === nameProperty.toLowerCase()) {
                        name = sourceManager.GetNodeName(nodeId);
                    }
                    if (propData.property.toLowerCase() === categoryProperty.toLowerCase()) {
                        category = "";
                    }
                    if (propData.property.toLowerCase() === classProperty.toLowerCase()) {
                        componentClass = "";
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

            for (var compId in object.Data.newComponentIds) {
                var nodeId = object.Data.newComponentIds[compId];
                sourceManager.NodeIdvsComponentIdList[nodeId] = compId;

            }            

            for (var propName in _this.UpdatedRowsData) {
                var propData = _this.UpdatedRowsData[propName];
                if (propData.action.toLowerCase() !== "add") {
                    continue;
                }

                var propData = _this.UpdatedRowsData[propName];
                _this.AlreadyRowsData[propData.property] = {
                    "property": propData.property,
                    "value": propData.value ? propData.value : "",
                };
            }
           
            _this.UpdatedRowsData = {};
            DevExpress.ui.notify("Properties updated successfully.");    
        });
    }
}

UserPropertiesForm.prototype.Close = function () {
    this.Active = false;

    var userPropertiesForm = document.getElementById(this.GetHtmlElementId());
    userPropertiesForm.style.display = "none";

    this.UpdatedRowsData = {};
}


function commonDifferentProperties(objects) {
    if (objects.length === 0) {
        return null;
    }

    var common = JSON.parse(JSON.stringify(objects[0]));
    var unmatchedProps = {};
    for (var i = 1; i < objects.length; i++) {
        for (var prop in objects[i]) {
            checkProps(objects[i], common, prop);
        }
        for (var commProp in common) {
            checkProps(common, objects[i], commProp);
        }
    }
    return {
        "common": common,
        "notCommon": unmatchedProps
    };

    function checkProps(source, target, prop) {
        if (source.hasOwnProperty(prop)) {
            var val = source[prop];
            if (!target.hasOwnProperty(prop) || target[prop] !== val) {
                unmatchedProps[prop] = true;
                delete common[prop];
            }
        }
    }
}