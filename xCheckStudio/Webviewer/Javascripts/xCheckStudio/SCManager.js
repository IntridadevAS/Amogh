function SCManager(id, 
    sourceName,
    sourceType,
    viewerOptions) {

    // call super constructor
    SourceManager.call(this, id, sourceName, sourceType);

    // Object.defineProperty(SCManager.prototype, 'constructor', {
    //     value: SCManager,
    //     enumerable: false, // so that it does not appear in 'for in' loop
    //     writable: true
    // });

    // this.SourceType = sourceType;  
    this.ViewerOptions = viewerOptions;
    this.NodeIdArray = [];
    this.SelectedNodeId = null;
    this.NodeIdvsComponentIdList = {};
    this.HiddenNodeIds = [];

    this.CheckViewerContextMenu;
}

// inherit from parent
SCManager.prototype = Object.create(SourceManager.prototype);
SCManager.prototype.constructor = SCManager;

SCManager.prototype.Is3DSource = function () {
    return true;
};

SCManager.prototype.GetViewerContainerID = function () {
    return this.ViewerOptions.containerId;
}

SCManager.prototype.LoadData = function (selectedComponents, visibleItems) {

    var _this = this;

    return new Promise((resolve) => {

        // create and start viewer
        var viewer = new Communicator.WebViewer({
            containerId: _this.ViewerOptions.containerId,
            endpointUri: _this.ViewerOptions.endpointUri,
            model: _this.ViewerOptions.model
        });
        viewer.start();

        _this.Webviewer = viewer;        

        viewer.setCallbacks({
            firstModelLoaded: function () {
                viewer.view.fitWorld();
                viewer.resizeCanvas();

                // set viewer's background color
                _this.SetViewerBackgroundColor();

                // restore hidden nodes
                if (_this.HiddenNodeIds.length > 0) {
                    // hide all
                    var map = {};
                    map[viewer.model.getAbsoluteRootNode()] = false;
                    viewer.model.setNodesVisibilities(map);

                    // set visible items
                    map = {};
                    for (var i = 0; i < visibleItems.length; i++) {
                        var node = visibleItems[i];
                        map[node] = true;
                    }
                    viewer.model.setNodesVisibilities(map);
                }

                // register viewer evenets
                _this.BindEvents(viewer);

                // show navigation cube
                showNavigationCube(viewer);

                // construct model tree
                _this.ModelTree = new SCModelBrowser(_this.Id,
                    _this.ViewerOptions.modelTree,
                    viewer,
                    _this.SourceType,
                    selectedComponents);


                _this.CreateNodeIdArray(viewer.model.getAbsoluteRootNode());

                // // show busy spinner
                // var busySpinner = document.getElementById("divLoading");
                // busySpinner.className = 'show';

                var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(_this.SourceType);
                var rootNodeId = viewer.model.getAbsoluteRootNode();
                _this.ReadProperties(rootNodeId, identifierProperties, undefined).then(function (res) {
                    if (res) {
                        _this.ModelTree.addModelBrowser(_this.SourceProperties);

                        _this.AddComponentsToDB();
                    }

                    return resolve(true);
                });

                //activate context menu            
                var ids = _this.GetControlIds();

                _this.CheckViewerContextMenu = new ViewerContextMenu(viewer, ids);
                _this.CheckViewerContextMenu.Init();
             },
            modelLoadFailure: function () {
                return resolve(false);
            }
        });
    });
};

SCManager.prototype.GetControlIds = function () {
    var ids = {};
    if (this.Webviewer._params.containerId === "visualizerA") {

        var explode = {};
        explode["slider"] = "explodeSlider1"
        explode["output"] = "explodeValue1";
        explode["overlay"] = "explodeOverlay1";
        ids["explode"] = explode;

        var translucency = {};
        translucency["slider"] = "translucencySlider1"
        translucency["output"] = "translucencyValue1";
        translucency["overlay"] = "translucencyOverlay1";
        ids["translucency"] = translucency;
    }
    else if (this.Webviewer._params.containerId === "visualizerB") {

        var explode = {};
        explode["slider"] = "explodeSlider2"
        explode["output"] = "explodeValue2";
        explode["overlay"] = "explodeOverlay2";
        ids["explode"] = explode;

        var translucency = {};
        translucency["slider"] = "translucencySlider2"
        translucency["output"] = "translucencyValue2";
        translucency["overlay"] = "translucencyOverlay2";
        ids["translucency"] = translucency;
    }
    else if (this.Webviewer._params.containerId === "visualizerC") {
        var explode = {};
        explode["slider"] = "explodeSlider3"
        explode["output"] = "explodeValue3";
        explode["overlay"] = "explodeOverlay3";
        ids["explode"] = explode;

        var translucency = {};
        translucency["slider"] = "translucencySlider3"
        translucency["output"] = "translucencyValue3";
        translucency["overlay"] = "translucencyOverlay3";
        ids["translucency"] = translucency;
    }
    else if (this.Webviewer._params.containerId === "visualizerD") {
        var explode = {};
        explode["slider"] = "explodeSlider4"
        explode["output"] = "explodeValue4";
        explode["overlay"] = "explodeOverlay4";
        ids["explode"] = explode;

        var translucency = {};
        translucency["slider"] = "translucencySlider4"
        translucency["output"] = "translucencyValue4";
        translucency["overlay"] = "translucencyOverlay4";
        ids["translucency"] = translucency;
    }

    return ids;
}

SCManager.prototype.ClearSource = function () {

    this.ModelTree.Clear();

    // clear viewer
    document.getElementById(this.GetViewerContainerID()).innerHTML = "";
}

SCManager.prototype.SetViewerBackgroundColor = function () {
    var backgroundTopColor = xCheckStudio.Util.hexToRgb("#000000");
    var backgroundBottomColor = xCheckStudio.Util.hexToRgb("#F8F9F9");

    this.Webviewer.view.setBackgroundColor(backgroundTopColor, backgroundBottomColor);

    // set back face visibility
    this.Webviewer.view.setBackfacesVisible(true);
}

SCManager.prototype.BindEvents = function (viewer) {

    var _this = this;

    viewer.setCallbacks({
        selectionArray: function (selections) {
            for (var _i = 0; _i < selections.length; _i++) {
                var selection = selections[_i];

                var sel = selection.getSelection();

                if (_this.SelectedNodeId !== sel.getNodeId()) {
                    _this.OnSelection(selection);
                }
            }
        },
    });
};

SCManager.prototype.menu = function (x, y) {
    var i = document.getElementById("menu").style;
    i.top = y + "px";
    i.left = x + "px";
    i.visibility = "visible";
    i.opacity = "1";
}

SCManager.prototype.OnSelection = function (selectionEvent) {
    var selection = selectionEvent.getSelection();
    if (selection.isNodeSelection()) {
        if (selection.getNodeId() === this.SelectedNodeId) {
            return;
        }

        this.SelectedNodeId = selection.getNodeId();
        var model = this.Webviewer.model;

        if (!model.isNodeLoaded(this.SelectedNodeId)) {
            return;
        }

        // select valid node
        this.SelectValidNode();
        if (!this.SelectedNodeId) {
            return;
        }

        if (model.getNodeType(this.SelectedNodeId) !== Communicator.NodeType.BodyInstance) {

            // highlight corresponding component in model browser table
            this.ModelTree.HighlightModelBrowserRow(this.SelectedNodeId);
        }
    }
};

SCManager.prototype.HandleHiddenNodeIdsList = function (isHide, nodeList) {

    for (var i = 0; i < nodeList.length; i++) {
        var nodeId = nodeList[i];
        var index = this.HiddenNodeIds.indexOf(nodeId);
        if (isHide) {
            if (index < 0) {
                this.HiddenNodeIds.push(nodeId);
            }
        }
        else {
            // If show is clicked, remove nodeId from list of hidden elements list
            if (index > -1) {
                this.HiddenNodeIds.splice(index, 1);
            }
        }
    }
}

SCManager.prototype.SelectValidNode = function () {

    if (this.SelectedNodeId in this.SourceProperties) {
        return;
    }

    var model = this.Webviewer.model;
    while (this.SelectedNodeId) {
        this.SelectedNodeId = model.getNodeParent(this.SelectedNodeId);

        if (this.SelectedNodeId in this.SourceProperties) {
            // select this node
            this.Webviewer.selectPart(this.SelectedNodeId);

            break;
        }
    }
}

SCManager.prototype.CreateNodeIdArray = function (nodeId) {
    var _this = this;
    if (nodeId !== null &&
        (_this.Webviewer.model.getNodeType(nodeId) === Communicator.NodeType.AssemblyNode ||
            _this.Webviewer.model.getNodeType(nodeId) === Communicator.NodeType.Part ||
            _this.Webviewer.model.getNodeType(nodeId) === Communicator.NodeType.PartInstance)) {
        this.NodeIdArray.push(nodeId);
        var children = _this.Webviewer.model.getNodeChildren(nodeId);
        if (children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                _this.CreateNodeIdArray(child);
            }
        }
    }
}

SCManager.prototype.ReadProperties = function (nodeId, identifierProperties, parentNodeId) {
    return new Promise((resolve) => {

        var _this = this;

        if (nodeId !== null &&
            _this.Webviewer.model.isNodeLoaded(nodeId) &&
            (_this.Webviewer.model.getNodeType(nodeId) === Communicator.NodeType.AssemblyNode ||
                _this.Webviewer.model.getNodeType(nodeId) === Communicator.NodeType.Part ||
                _this.Webviewer.model.getNodeType(nodeId) === Communicator.NodeType.PartInstance)) {

            _this.Webviewer.model.getNodeProperties(nodeId).then(function (nodeProperties) {

                if (nodeProperties != null &&
                    Object.keys(nodeProperties).length > 0 &&
                    identifierProperties !== undefined) {

                    // get component name
                    var name = _this.GetPropertyValue(nodeProperties, identifierProperties.name);
                    if (name == undefined) {
                        name = _this.Webviewer.model.getNodeName(nodeId)
                    }

                    // get main component class
                    var mainComponentClass = _this.GetPropertyValue(nodeProperties, identifierProperties.mainCategory);
                    if (_this.SourceType.toLowerCase() == "rvt" &&
                        mainComponentClass == undefined) {
                        mainComponentClass = _this.Webviewer.model.getNodeName(parentNodeId);
                    }

                    // get sub component class
                    var subComponentClass = _this.GetPropertyValue(nodeProperties, identifierProperties.subClass);
                    if (_this.SourceType.toLowerCase() == "rvt" &&
                        subComponentClass == undefined) {
                        subComponentClass = mainComponentClass
                    }

                    if (mainComponentClass !== undefined &&
                        name !== undefined &&
                        subComponentClass !== undefined) {

                        // create generic properties object
                        var genericPropertiesObject = new GenericComponent(name,
                            mainComponentClass,
                            subComponentClass,
                            nodeId,
                            parentNodeId);

                        // add component class as generic property
                        var componentClassPropertyObject = new GenericProperty("ComponentClass",
                            "String",
                            subComponentClass);

                        genericPropertiesObject.addProperty(componentClassPropertyObject);


                        if (_this.SourceType.toLowerCase() == "rvt") {
                            var elementName = new GenericProperty("Name",
                                "String",
                                name);

                            genericPropertiesObject.addProperty(elementName);
                        }

                        // iterate node properties and add to generic properties object
                        for (var key in nodeProperties) {
                            var genericPropertyObject = new GenericProperty(key, "String", nodeProperties[key]);
                            genericPropertiesObject.addProperty(genericPropertyObject);
                        }

                        // add genericProperties object to sourceproperties collection
                        _this.SourceProperties[nodeId] = (genericPropertiesObject);
                    }
                }

                var children = _this.Webviewer.model.getNodeChildren(nodeId);
                if (children.length > 0) {
                    for (var i = 0, children_1 = children; i < children_1.length; i++) {
                        var child = children_1[i];

                        if (child !== null &&
                            (_this.Webviewer.model.getNodeType(child) === Communicator.NodeType.AssemblyNode ||
                                _this.Webviewer.model.getNodeType(child) === Communicator.NodeType.Part ||
                                _this.Webviewer.model.getNodeType(child) === Communicator.NodeType.PartInstance)) {
                            _this.ReadProperties(child, identifierProperties, nodeId).then(function (res) {
                                return resolve(res);
                            });
                        }
                    }
                }

                if (_this.NodeIdArray.indexOf(nodeId) != -1) {
                    _this.NodeIdArray.splice(_this.NodeIdArray.indexOf(nodeId), 1);
                }
                if (_this.NodeIdArray.length == 0) {
                    _this.NodeIdArray = undefined;

                    // _this.ModelTree.addModelBrowser(_this.SourceProperties);

                    // _this.AddComponentsToDB();

                    return resolve(true);
                }                
            });
        }        
    });
};

SCManager.prototype.GetPropertyValue = function (propertyCollectionObject, propertyToSearch) {

    for (var key in propertyCollectionObject) {
        if (key.toLowerCase() === propertyToSearch.toLowerCase()) {
            return propertyCollectionObject[key];
        }
    }

    return undefined;
}

SCManager.prototype.AddComponentsToDB = function () {

    console.log("start of AddComponentsToDB");
    var _this = this;

    var source = undefined;
    if (this.Webviewer._params.containerId.toLowerCase() == "visualizera") {
        source = "SourceA"
    }
    else if (this.Webviewer._params.containerId.toLowerCase() == "visualizerb") {
        source = "SourceB"
    }
    else if (this.Webviewer._params.containerId.toLowerCase() == "visualizerc") {
        source = "SourceC"
    }
    else if (this.Webviewer._params.containerId.toLowerCase() == "visualizerd") {
        source = "SourceD"
    }


    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    $.ajax({
        data: {
            'Components': JSON.stringify(this.SourceProperties),
            'Source': source,
            'DataSourceType': '3D',
            'ProjectName': projectinfo.projectname,
            'CheckName': checkinfo.checkname
        },
        type: "POST",
        url: "PHP/AddComponentsToDB.php"
    }).done(function (msg) {
        if (msg !== 'fail') {
            _this.NodeIdvsComponentIdList = JSON.parse(msg);
        }
        // // remove busy spinner
        // var busySpinner = document.getElementById("divLoading");
        // if (busySpinner.classList.contains('show'))
        //     busySpinner.classList.remove('show')

        console.log("End of AddComponentsToDB");
    });
}

SCManager.prototype.ResizeViewer = function () {
    this.Webviewer.resizeCanvas();
}

function XMLSourceManager(id, sourceName, sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, id,  sourceName, sourceType, viewerOptions);

}
// inherit from parent
XMLSourceManager.prototype = Object.create(SCManager.prototype);
XMLSourceManager.prototype.constructor = XMLSourceManager;

function RVMSourceManager(id,  sourceName, sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, id,  sourceName, sourceType, viewerOptions);
}
// inherit from parent
RVMSourceManager.prototype = Object.create(SCManager.prototype);
RVMSourceManager.prototype.constructor = RVMSourceManager;

function SolidWorksSourceManager(id,  sourceName, sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, id,  sourceName, sourceType, viewerOptions);
}
// inherit from parent
SolidWorksSourceManager.prototype = Object.create(SCManager.prototype);
SolidWorksSourceManager.prototype.constructor = SolidWorksSourceManager;


function DWGSourceManager(id,  sourceName, sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, id,  sourceName, sourceType, viewerOptions);
}
// inherit from parent
DWGSourceManager.prototype = Object.create(SCManager.prototype);
DWGSourceManager.prototype.constructor = DWGSourceManager;

function RVTSourceManager(id,  sourceName, sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, id,  sourceName, sourceType, viewerOptions);
}
// inherit from parent
RVTSourceManager.prototype = Object.create(SCManager.prototype);
RVTSourceManager.prototype.constructor = RVTSourceManager;

function IFCSourceManager(id,  sourceName, sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, id,  sourceName, sourceType, viewerOptions);
}
// inherit from parent
IFCSourceManager.prototype = Object.create(SCManager.prototype);
IFCSourceManager.prototype.constructor = IFCSourceManager;

function STEPSourceManager(id,  sourceName, sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, id,  sourceName, sourceType, viewerOptions);
}
// inherit from parent
STEPSourceManager.prototype = Object.create(SCManager.prototype);
STEPSourceManager.prototype.constructor = STEPSourceManager;

function IGSSourceManager(id,  sourceName, sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, id,  sourceName, sourceType, viewerOptions);
}
// inherit from parent
IGSSourceManager.prototype = Object.create(SCManager.prototype);
IGSSourceManager.prototype.constructor = IGSSourceManager;



