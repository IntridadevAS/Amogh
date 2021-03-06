function VisioModelBrowser(id,
    modelBrowserContainer,    
    sourceType,
    nodeIdvsSelectedComponents) {

    // call super constructor
    ModelBrowser.call(this, id, modelBrowserContainer);
    
    this.SourceType = sourceType;
    this.Components;         

    this.modelTreeRowData = [];
    this.ModelBrowserAddedNodes = [];

    this.NodeParentList = {};

    this.SelectionManager = new VisioSelectionManager(nodeIdvsSelectedComponents);

    this.TreeInstance = null;
    this.CompIdVsKey = {};
    this.ChildParentKeyList = {};
}

// assign ModelBrowser's method to this class
VisioModelBrowser.prototype = Object.create(ModelBrowser.prototype);
VisioModelBrowser.prototype.constructor = VisioModelBrowser;

VisioModelBrowser.prototype.AddComponentTable = function (components) {
    if (!components) {
        return;
    }
    
    // create table headers
    var headers = this.CreateHeaders();  
    if (headers === undefined ||
        headers.length === 0) {
        return;
    }

    // create data rows
    this.Components = components;
    for (var index in this.Components) {
        this.addComponentRow(this.Components[index], this.Components[index].ParentNodeId);
    }    
    if (this.modelTreeRowData === undefined ||
        this.modelTreeRowData.length === 0) {
        return;
    }

    // now adjust parents parents
    // Parent is null or parent node doesnt exist then make it root node
    // root value for tree list is -4
    for (let i = 0; i < this.modelTreeRowData.length; i++) {
        let rowData = this.modelTreeRowData[i];
        if (!(ModelBrowserColumnNamesVisio.Parent in rowData)) {
            continue;
        }

        let parent = rowData[ModelBrowserColumnNamesVisio.Parent];
        if (!parent ||
            !(this.ModelBrowserAddedNodes.includes(parent))) {
            rowData[ModelBrowserColumnNamesVisio.Parent] = -4;
        }
    }

    this.loadModelBrowserTable(headers);
};

VisioModelBrowser.prototype.CreateHeaders = function () {
    var columnHeaders = [];
    for (var i = 0; i < Object.keys(ModelBrowserColumnsVisio).length; i++) {
        var columnHeader = {};
        var caption;
        var width = "0%";
        var visible = true;
        switch(i)
        {
            case ModelBrowserColumnsVisio.Select:
                continue;
                break;
            case ModelBrowserColumnsVisio.Component:
                width = "40%";
                caption = ModelBrowserColumnNamesVisio.Component;
                break;
            case ModelBrowserColumnsVisio.MainClass:
                width = "30%";
                caption = ModelBrowserColumnNamesVisio.MainClass;
                break;
            case ModelBrowserColumnsVisio.SubClass:
                width = "30%";
                caption = ModelBrowserColumnNamesVisio.SubClass;
                break;  
            case ModelBrowserColumnsVisio.ID:
                visible = false;
                caption = ModelBrowserColumnNamesVisio.ID;
                break;           
            case ModelBrowserColumnsVisio.Parent:
                visible = false;
                caption = ModelBrowserColumnNamesVisio.Parent;
                break;
        }
        columnHeader["caption"] = caption;
        columnHeader["dataField"] = caption.replace(/\s/g, '');;
        columnHeader["width"] = width;
        columnHeader["visible"] = visible;
        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}

// VisioModelBrowser.prototype.AddComponentTableComponent = function (component, parentid) {    
//     this.addComponentRow(component, parentid);   
// };

VisioModelBrowser.prototype.addComponentRow = function (component, parentid) {

    // VSD Owner contains values starting with "/", so the dont match with component names
    if (parentid && 
        parentid.indexOf("/") === 0) {
        parentid = parentid.slice(1);
    }
   
    this.ModelBrowserAddedNodes.push(component.Name);     

    this.NodeParentList[component.Name] = parentid;

    tableRowContent = {};
    tableRowContent[ModelBrowserColumnNamesVisio.Component] = component.Name;
    tableRowContent[ModelBrowserColumnNamesVisio.MainClass] = (component.MainComponentClass != undefined ? component.MainComponentClass : "");
    tableRowContent[ModelBrowserColumnNamesVisio.SubClass] = (component.SubComponentClass != undefined ? component.SubComponentClass : "");
    tableRowContent[ModelBrowserColumnNamesVisio.ID] = component.NodeId;
    // if (this.ModelBrowserAddedNodes.includes(parentid)) {
    tableRowContent[ModelBrowserColumnNamesVisio.Parent] = parentid;
    // }
    // else {
    //     tableRowContent[ModelBrowserColumnNamesVisio.Parent] = null;
    // }

    // add child shapeids to row data
    if ("childShapes" in component.XData &&
        component.XData["childShapes"].length > 0) {
        tableRowContent["childShapes"] = component.XData["childShapes"];
    }

    this.modelTreeRowData.push(tableRowContent);

    this.CompIdVsKey[component.NodeId] = component.Name;
    this.ChildParentKeyList[component.Name] = parentid;
}

VisioModelBrowser.prototype.loadModelBrowserTable = function (columnHeaders) {
    var _this = this;
    var loadingBrower = true;
    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;
    
    $(function () {
        _this.TreeInstance = $(containerDiv).dxTreeList({
            dataSource: _this.modelTreeRowData,
            keyExpr: ModelBrowserColumnNamesVisio.Component,
            parentIdExpr: "parent",
            rootValue: -4,
            columns: columnHeaders,
            columnAutoWidth: true,
            columnResizingMode: 'widget',
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            height: "100%",
            width: "100%",
            allowColumnResizing : true,
            hoverStateEnabled: true,
            // focusedRowEnabled: true,
            filterRow: {
                visible: true
            },
            scrolling: {
                mode: "standard"          
            },
            paging: {
                 pageSize: 50
            },
            selection: {
                mode: "multiple",
                recursive: true,
            },
            onContentReady: function (e) {
                if (loadingBrower && _this.SelectionManager.NodeIdvsSelectedComponents) {
                    var rowKeys = [];
                    var selectedAll = Object.values(_this.SelectionManager.NodeIdvsSelectedComponents);
                    for (var i = 0; i < Object.values(_this.SelectionManager.NodeIdvsSelectedComponents).length; i++) {
                        var selected = selectedAll[i];
                        rowKeys.push(selected.name);
                    }

                    e.component.selectRows(rowKeys);
                }
                loadingBrower = false;

                // show table view action button
                document.getElementById("tableViewAction" + _this.Id).style.display = "block";
            },  
            onInitialized: function(e) {
                model.views[_this.Id].tableViewInstance = e.component; 
                model.views[_this.Id].tableViewWidget = "treelist";
                
                // // initialize the context menu
                // var modelBrowserContextMenu = new ModelBrowserContextMenu();
                // modelBrowserContextMenu.Init(_this);
                _this.ShowItemCount(_this.modelTreeRowData.length);

                document.getElementById("tableHeaderName" + _this.Id).innerText = GlobalConstants.TableView.DataBrowser;
            },
            onSelectionChanged: function (e) {
                var checkBoxStatus;
                var clickedCheckBoxRowKeys;
                if(e.currentSelectedRowKeys.length > 0) {
                    checkBoxStatus  = "on";
                    clickedCheckBoxRowKeys = e.currentSelectedRowKeys;
                }
                else {
                    checkBoxStatus = "off";
                    clickedCheckBoxRowKeys = e.currentDeselectedRowKeys;
                }
                _this.UpdateSelectionComponentFromCheckBox(clickedCheckBoxRowKeys, 
                    checkBoxStatus, 
                    e.component);
            },
            onRowClick: function (e) {
                console.log("Row clicked");
                if (e.event.target.tagName.toLowerCase() === "span") {
                    return;
                }

                console.log("componet clicked-Start");
                _this.SelectionManager.OnComponentRowClicked(
                    e.rowElement[0],
                    _this.Id,
                    e.data.ID,                   
                    e.key,
                    e.data.childShapes
                );
                console.log("componet clicked-End");

                // property call out               
                var sourceProperties = SourceManagers[_this.Id].SourceProperties;
                for (var index in sourceProperties) {
                    if (e.data.ID === sourceProperties[index].NodeId) {
                        // properties
                        var properties = []
                        for (var i = 0; i < sourceProperties[index].properties.length; i++) {
                            var property = {};
                            property["Name"] = sourceProperties[index].properties[i].Name;
                            property["Value"] = sourceProperties[index].properties[i].Value;
                            properties.push(property);
                        }

                        // references
                        var componentId = SourceManagers[_this.Id].NodeIdvsComponentIdList[e.data.NodeId];
                        ReferenceManager.getReferences([componentId]).then(function (references) {
                            var referencesData = [];
                            var commentsData = [];
                            var index = 0;
                            if (references && _this.Id in references) {
                                if ("webAddress" in references[_this.Id]) {
                                    for (var i = 0; i < references[_this.Id]["webAddress"].length; i++) {
                                        index++;

                                        var referenceData = {};
                                        // referenceData["id"] = index;
                                        referenceData["Value"] = references[_this.Id]["webAddress"][i];
                                        referenceData["Type"] = "Web Address";

                                        referencesData.push(referenceData);
                                    }
                                }

                                if ("image" in references[_this.Id]) {
                                    for (var i = 0; i < references[_this.Id]["image"].length; i++) {
                                        index++;

                                        var referenceData = {};
                                        // referenceData["id"] = index;
                                        referenceData["Value"] = references[_this.Id]["image"][i];
                                        referenceData["Type"] = "Image";

                                        referencesData.push(referenceData);
                                    }
                                }

                                if ("document" in references[_this.Id]) {
                                    for (var i = 0; i < references[_this.Id]["document"].length; i++) {
                                        index++;

                                        var referenceData = {};
                                        // referenceData["id"] = index;
                                        referenceData["Value"] = references[_this.Id]["document"][i];
                                        referenceData["Type"] = "Document";

                                        referencesData.push(referenceData);
                                    }
                                }

                                if ("comment" in references[_this.Id]) {
                                    for (var i = 0; i < references[_this.Id]["comment"].length; i++) {
                                        commentsData.push(xCheckStudio.Util.tryJsonParse(references[_this.Id]["comment"][i]));
                                    }
                                }
                            }

                            // if (properties.length > 0) {
                            SourceManagers[_this.Id].PropertyCallout.Update(e.data.Item,
                                componentId,
                                properties,
                                referencesData,
                                commentsData);
                            // }
                        });
                    }
                }
                // if (e.data.NodeId in sourceProperties) {


                // }
            },
            onRowPrepared: function (e) {
                // if (e.rowType !== "data") {
                //     return;
                // }               

                // if (e.isSelected) {
                //     _this.SelectionManager.ApplyHighlightColor(e.rowElement[0])
                // }

                // if (_this.Id in SourceManagers) {
                //     if (SourceManagers[_this.Id].HiddenNodeIds.includes(e.data.NodeId)) {
                //         var selectedRows = [e.rowElement[0]];
                //         _this.HighlightHiddenRows(true, selectedRows);
                //     }
                // }
            },
            onDisposing: function (e) {
                _this.TreeInstance = null;
                _this.CompIdVsKey = {};
                _this.ChildParentKeyList = {};

                model.views[_this.Id].viewerContextMenu.Init(false);
                model.views[_this.Id].viewerContextMenu = null;
                
                model.views[_this.Id].tableViewInstance = null;
                model.views[_this.Id].tableViewWidget = null;

                _this.ModelBrowserAddedNodes = [];
            }
        }).dxTreeList("instance");
    });
}

VisioModelBrowser.prototype.OpenRow = function (rowKey) {
    return new Promise((resolve) => {

        var hierarchy = { path: [rowKey] }
        this.getNodeHierarchy(rowKey, hierarchy);

        var allPromises = [];
        for (var i = 0; i < hierarchy.path.length; i++) {
            if (!this.TreeInstance.isRowExpanded(hierarchy.path[i])) {
                allPromises.push(this.TreeInstance.expandRow(hierarchy.path[i]));
            }
        }

        if (allPromises.length > 0) {
            for (var i = 0; i < allPromises.length; i++) {
                allPromises[i].catch(e => { return e; });
            }

            Promise.all(allPromises)
                .then(result => {
                    return resolve(result);
                })
                .catch(err => {
                    return resolve(err);
                });
        }
        else {
            return resolve(true)
        }
    });
}

VisioModelBrowser.prototype.getNodeHierarchy = function (rowKey, hierarchy) {
    if (rowKey in this.ChildParentKeyList) {
        hierarchy["path"].push(this.ChildParentKeyList[rowKey]);
    }
}

VisioModelBrowser.prototype.UpdateSelectionComponentFromCheckBox = function (clickedCheckBoxRowKeys,
    checkBoxStatus,
    componentObj) {

    for (var i = 0; i < clickedCheckBoxRowKeys.length; i++) {     

        var nodeObj = componentObj.getNodeByKey(clickedCheckBoxRowKeys[i]);
        var row = componentObj.getRowElement(componentObj.getRowIndexByKey(nodeObj.key));
        this.SelectionManager.SelectComponent(row[0], checkBoxStatus, nodeObj.data);

        if (nodeObj.hasChildren) {
            var children = this.GetSelectedChildren(componentObj, nodeObj);
           
            for (var j = 0; j < children.length; j++) {
                row = componentObj.getRowElement(componentObj.getRowIndexByKey(children[j].key));
                this.SelectionManager.SelectComponent(row[0], checkBoxStatus, children[j].data);
            }
        }
    }
}

VisioModelBrowser.prototype.GetSelectedChildren = function(componentObj, node) {
    var children = []
    for(var i = 0; i < node.children.length; i++) {
        var child = node.children[i];
        if(child.hasChildren){
            var ChildrenComponents = this.GetSelectedChildren(componentObj, child);
            for(var j = 0; j < ChildrenComponents.length; j++) {
                children.push(ChildrenComponents[j]);
            }
        }
        children.push(child);
    }
    return children;
}

VisioModelBrowser.prototype.Clear = function () {
    var containerDiv = "#" + this.ModelBrowserContainer;

    var browserContainer = document.getElementById(this.ModelBrowserContainer);
    var parent = browserContainer.parentElement;

    //remove html element which holds grid
    //devExtreme does not have destroy method. We have to remove the html element and add it again to create another table
    $(containerDiv).remove();

    //Create and add div with same id to add grid again
    var browserContainerDiv = document.createElement("div")
    browserContainerDiv.id = this.ModelBrowserContainer;
    var styleRule = ""
    styleRule = "position: relative";
    browserContainerDiv.setAttribute("style", styleRule);
    parent.appendChild(browserContainerDiv);
    
    // clear count
    this.GetItemCountDiv().innerHTML = "";
}

VisioModelBrowser.prototype.GetSelectedComponents = function () {
    return this.SelectionManager.GetSelectedComponents();
}