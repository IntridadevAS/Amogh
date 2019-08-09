function SCManager(sourceType,
    viewerOptions) {

    // call super constructor
    SourceManager.call(this, sourceType);

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
}

// inherit from parent
SCManager.prototype = Object.create(SourceManager.prototype);
SCManager.prototype.constructor = SCManager;

SCManager.prototype.IsSCSource = function () {
    return true;
};

SCManager.prototype.GetViewerContainerID = function () {
    return this.ViewerOptions.containerId;
}

SCManager.prototype.LoadData = function (selectedComponents) {

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

        // set viewer's background color
        _this.SetViewerBackgroundColor();


        viewer.setCallbacks({
            firstModelLoaded: function () {
                viewer.view.fitWorld();

                // register viewer evenets
                _this.BindEvents(viewer);

                // show navigation cube
                showNavigationCube(viewer);

                // construct model tree
                _this.ModelTree = new SCModelBrowser(_this.ViewerOptions.modelTree,
                    viewer,
                    _this.SourceType,
                    selectedComponents);


                _this.CreateNodeIdArray(viewer.model.getAbsoluteRootNode());

                // show busy spinner
                var busySpinner = document.getElementById("divLoading");
                busySpinner.className = 'show';

                var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(_this.SourceType);
                var rootNodeId = viewer.model.getAbsoluteRootNode();
                _this.ReadProperties(rootNodeId, identifierProperties, undefined);

                // hide view data graphics text on viewer conatainer
                var scViewerContainer = document.getElementById("dataSourceViewer");
                for (var i = 0; i < scViewerContainer.childElementCount; i++) {
                    var currentChild = scViewerContainer.children[i];
                    if (currentChild.className === "viewdatagraphics") {
                        currentChild.style.display = "none";
                    }
                }

                return resolve(true);

            },
            modelLoadFailure: function () {
                return resolve(false);
            }
        });
    });
};

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

                // if translucency control is on
                if(viewer._params.containerId in translucencyManagers)
                {
                    translucencyManagers[viewer._params.containerId].ComponentSelected(sel.getNodeId());
                }

                if (_this.SelectedNodeId !== sel.getNodeId()) {
                    _this.OnSelection(selection);
                }
            }
        },
        contextMenu: function (position) {
            if (currentViewer === undefined) {
                currentViewer = viewer;
            }

            _this.menu(event.clientX, event.clientY);
        }
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

        // If we selected a body, then get the assembly node that holds it (loadSubtreeFromXXX() works on assembly nodes)
        if (model.getNodeType(this.SelectedNodeId) === Communicator.NodeType.BodyInstance) {

            while (model.getNodeType(this.SelectedNodeId) === Communicator.NodeType.BodyInstance) {
                var parent = model.getNodeParent(this.SelectedNodeId);

                if (parent !== null &&
                    (model.getNodeType(parent) === Communicator.NodeType.AssemblyNode ||
                        model.getNodeType(parent) === Communicator.NodeType.Part ||
                        model.getNodeType(parent) === Communicator.NodeType.PartInstance)) {
                    this.SelectedNodeId = parent;
                    // select this node
                    this.Webviewer.selectPart(parent);
                }
                else {
                    break;
                }
            }
        }

        if (model.getNodeType(this.SelectedNodeId) !== Communicator.NodeType.BodyInstance) {
            // highlight corresponding component in model browser table
            this.ModelTree.HighlightModelBrowserRow(this._selectedNodeId);
        }

    }
};

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
                        _this.ReadProperties(child, identifierProperties, nodeId)
                    }
                }
            }

            if (_this.NodeIdArray.indexOf(nodeId) != -1) {
                _this.NodeIdArray.splice(_this.NodeIdArray.indexOf(nodeId), 1);
            }
            if (_this.NodeIdArray.length == 0) {
                _this.NodeIdArray = undefined;

                _this.ModelTree.addModelBrowser(_this.Webviewer.model.getAbsoluteRootNode(), undefined);
                if (checkCaseSelected) {
                    checkIsOrderMaintained(checkCaseManager.CheckCase.CheckTypes[0]);
                }
                // add components to database
                _this.AddComponentsToDB();
            }
        });
    }
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

    var _this = this;

    var source = undefined;
    if (this.Webviewer._params.containerId.toLowerCase() == "viewercontainer1") {
        source = "SourceA"
    }
    else if (this.Webviewer._params.containerId.toLowerCase() == "viewercontainer2") {
        source = "SourceB"
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
        // remove busy spinner
        var busySpinner = document.getElementById("divLoading");
        if (busySpinner.classList.contains('show'))
            busySpinner.classList.remove('show')
    });
}


function XMLSourceManager(sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, sourceType, viewerOptions);

}
// inherit from parent
XMLSourceManager.prototype = Object.create(SCManager.prototype);
XMLSourceManager.prototype.constructor = XMLSourceManager;

function RVMSourceManager(sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, sourceType, viewerOptions);
}
// inherit from parent
RVMSourceManager.prototype = Object.create(SCManager.prototype);
RVMSourceManager.prototype.constructor = RVMSourceManager;

function SolidWorksSourceManager(sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, sourceType, viewerOptions);
}
// inherit from parent
SolidWorksSourceManager.prototype = Object.create(SCManager.prototype);
SolidWorksSourceManager.prototype.constructor = SolidWorksSourceManager;


function DWGSourceManager(sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, sourceType, viewerOptions);
}
// inherit from parent
DWGSourceManager.prototype = Object.create(SCManager.prototype);
DWGSourceManager.prototype.constructor = DWGSourceManager;

function RVTSourceManager(sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, sourceType, viewerOptions);
}
// inherit from parent
RVTSourceManager.prototype = Object.create(SCManager.prototype);
RVTSourceManager.prototype.constructor = RVTSourceManager;

function IFCSourceManager(sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, sourceType, viewerOptions);
}
// inherit from parent
IFCSourceManager.prototype = Object.create(SCManager.prototype);
IFCSourceManager.prototype.constructor = IFCSourceManager;

function STEPSourceManager(sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, sourceType, viewerOptions);
}
// inherit from parent
STEPSourceManager.prototype = Object.create(SCManager.prototype);
STEPSourceManager.prototype.constructor = STEPSourceManager;

function IGSSourceManager(sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, sourceType, viewerOptions);
}
// inherit from parent
IGSSourceManager.prototype = Object.create(SCManager.prototype);
IGSSourceManager.prototype.constructor = IGSSourceManager;



