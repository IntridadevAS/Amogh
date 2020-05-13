function SCManager(id, 
    sourceName,
    sourceType,
    viewerOptions) {

    // call super constructor
    SourceManager.call(this, id, sourceName, sourceType);  
   
    this.ViewerOptions = viewerOptions;
    this.NodeIdArray = [];
    this.SelectedNodeId = null;
    this.NodeIdvsComponentIdList = {};
    this.HiddenNodeIds = [];

    this.CheckViewerContextMenu;

    this.HasProperties = false;

    // These are the properties from metadata or properties of
    // Components which don't have category and component class
    this.Properties = {};

    // These are the all components from the datasource
    this.AllComponents = {};

    this.PropertyCallout;    

    // this.DataBrowserSDA;
    // this.ListViewSDA;
    // this.GroupsSDA;
    this.IncludeMemberItemsSwitch;
    this.ListTypeSwitch;
}

// inherit from parent
SCManager.prototype = Object.create(SourceManager.prototype);
SCManager.prototype.constructor = SCManager;

SCManager.prototype.Is3DSource = function () {
    return true;
};

SCManager.prototype.GetCurrentTable = function () {
    var activeTableView = model.views[this.Id].activeTableView;
    if (activeTableView === GlobalConstants.TableView.DataBrowser) {
        return this.ModelTree;
    }
    else if (activeTableView === GlobalConstants.TableView.List) {
        return model.views[this.Id].listView;
    }
    else if (activeTableView === GlobalConstants.TableView.Groups) {
        return null;
    }

    return null;
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

                // init display menu class
                var currentView = model.views[_this.Id];
                currentView.displayMenu = new DisplayMenu(_this.Id);               
                currentView.annotationOperator = new Example.AnnotationOperator(
                    viewer);
                currentView.annotationOperatorId = viewer.registerCustomOperator( currentView.annotationOperator);                       
             
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
                showAxisTriad(viewer);

                // construct model tree
                _this.ModelTree = new SCModelBrowser(_this.Id,
                    _this.ViewerOptions.modelTree,
                    viewer,
                    _this.SourceType,
                    selectedComponents);

                _this.CreateNodeIdArray(viewer.model.getAbsoluteRootNode());

                var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(_this.SourceType);
                var rootNodeId = viewer.model.getAbsoluteRootNode();
                _this.ReadProperties(rootNodeId, identifierProperties, undefined).then(function (res) {
                    if (res) {
                        if (Object.keys(_this.SourceProperties).length > 0) {
                            _this.HasProperties = true;

                            _this.ModelTree.AddComponentTable(_this.SourceProperties);

                            _this.AddComponentsToDB();
                        }
                        else {

                            _this.ModelTree.AddModelBrowser();
                        }

                        model.views[_this.Id].activeTableView = GlobalConstants.TableView.DataBrowser;

                        // Init list view
                        model.views[_this.Id].listView = new ListView(
                            _this.Id,
                            _this.ViewerOptions.modelTree,
                            _this.AllComponents,
                            viewer);

                        // Init table views action menu
                        _this.InitViewActionMenu();

                        // init list view switches
                        _this.InitListViewSwitches();
                    }

                     // create property callout
                     _this.PropertyCallout = new PropertyCallout(_this.Id);
                     _this.PropertyCallout.Init();

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

SCManager.prototype.OpenTableViewsMenu = function () {
    var _this = this;

    var mainBtn = document.getElementById("tableViewAction" + this.Id);
    mainBtn.classList.add("openSDAMenu");
    mainBtn.children[0].src = "public/symbols/CloseBlack.svg";

    var dataBrowserSDA = document.getElementById("dataBrowserAction" + _this.Id);
    dataBrowserSDA.classList.add("showSDA");
    dataBrowserSDA.onclick = function () {
        if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.DataBrowser) {
            _this.ModelTree.AddComponentTable(_this.SourceProperties);

            _this.CloseTableViewsMenu();
        }
    }

    var listViewSDA = document.getElementById("listviewAction" + _this.Id);
    listViewSDA.classList.add("showSDA");
    listViewSDA.onclick = function () {
        if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.List) {
            model.views[_this.Id].listView.Show();

            _this.CloseTableViewsMenu();
        }
    }

    var groupsSDA = document.getElementById("groupsAction" + _this.Id);
    groupsSDA.classList.add("showSDA");
    groupsSDA.onclick = function () {
        if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.Groups) {
            model.views[_this.Id].activeTableView = GlobalConstants.TableView.Groups;

            _this.CloseTableViewsMenu();
        }
    }
}

SCManager.prototype.CloseTableViewsMenu = function () {
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

SCManager.prototype.InitViewActionMenu = function () {
    var _this = this;

    document.getElementById("tableViewAction" + this.Id).onclick = function () {       
        if (this.classList.contains("openSDAMenu")) {
            _this.CloseTableViewsMenu();
        }
        else {
            _this.OpenTableViewsMenu();
        }      
        
        // var dataBrowserSDA = document.getElementById("dataBrowserAction" + _this.Id);
        // if (dataBrowserSDA.classList.contains("showSDA")) {
        //     dataBrowserSDA.classList.remove("showSDA");
        // }
        // else {
        //     dataBrowserSDA.classList.add("showSDA");
        //     dataBrowserSDA.onclick = function () {
        //         _this.ModelTree.AddComponentTable(_this.SourceProperties);
                
        //         dataBrowserSDA.classList.remove("showSDA");
        //         listViewSDA.classList.remove("showSDA");
        //         groupsSDA.classList.remove("showSDA");
        //     }
        // }

        // var listViewSDA = document.getElementById("listviewAction" + _this.Id);
        // if (listViewSDA.classList.contains("showSDA")) {
        //     listViewSDA.classList.remove("showSDA");
        // }
        // else {
        //     listViewSDA.classList.add("showSDA");
        //     listViewSDA.onclick = function () {
        //         model.views[_this.Id].listView.Show();
                
        //         dataBrowserSDA.classList.remove("showSDA");
        //         listViewSDA.classList.remove("showSDA");
        //         groupsSDA.classList.remove("showSDA");
        //     }
        // }

        // var groupsSDA = document.getElementById("groupsAction" + _this.Id);
        // if (groupsSDA.classList.contains("showSDA")) {
        //     groupsSDA.classList.remove("showSDA");
        // }
        // else {
        //     groupsSDA.classList.add("showSDA");
        //     groupsSDA.onclick = function () {
        //         model.views[_this.Id].activeTableView = GlobalConstants.TableView.Groups;
               
        //         dataBrowserSDA.classList.remove("showSDA");
        //         listViewSDA.classList.remove("showSDA");
        //         groupsSDA.classList.remove("showSDA");
        //     }
        // }
    }
    // $(function () {
    //     DevExpress.config({
    //         floatingActionButtonConfig: {
    //             icon: "public/symbols/Table Views.svg",
    //             position: {
    //                 my: "right bottom",
    //                 at: "right bottom",
    //                 of: "#tableContainer" + _this.Id,
    //                 offset: "-5 -5"
    //             }
    //         }
    //     });

    //     _this.DataBrowserSDA = $("#dataBrowserAction" + _this.Id).dxSpeedDialAction({
    //         hint: "Data Browser",
    //         icon: "public/symbols/Browser Icon-Black.svg",   
    //         // index : 1,        
    //         onClick: function () {
    //             _this.ModelTree.AddComponentTable(_this.SourceProperties);
    //         }
    //     }).dxSpeedDialAction("instance");

    //     _this.ListViewSDA = $("#listviewAction" + _this.Id).dxSpeedDialAction({
    //         hint: "List",
    //         icon: "public/symbols/FlatView-Black.svg",
    //         // index : 2,
    //         onClick: function () {
    //             model.views[_this.Id].listView.Show();
    //         }
    //     }).dxSpeedDialAction("instance");

    //     _this.GroupsSDA = $("#groupsAction" + _this.Id).dxSpeedDialAction({
    //         hint: "Groups",
    //         icon: "public/symbols/Groups-Black.svg",   
    //         // index : 3,  
    //         onClick: function () {
    //             model.views[this.Id].activeTableView = GlobalConstants.TableView.Groups;
    //         }
    //     }).dxSpeedDialAction("instance");
    // });
}

SCManager.prototype.InitListViewSwitches = function () { 
    var _this = this;
    this.IncludeMemberItemsSwitch = $("#includeMemberItemsSwitch" + this.Id).dxSwitch({
        value: false,
        disabled: true,
        switchedOffText: "Exclude",
        switchedOnText: "Include",
        onValueChanged: function (e) {
            if (model.views[_this.Id].listView.ListViewTableInstance) {
            model.views[_this.Id].listView.ListViewTableInstance.option("selection.recursive", e.value);
            }
        }
    }).dxSwitch("instance");

    this.ListTypeSwitch = $("#listTypeSwitch" + this.Id).dxSwitch({
        value: false,
        disabled: true,
        switchedOffText: "Nested",
        switchedOnText: "Flat",
        onValueChanged: function (e) {
            model.views[_this.Id].listView.Show();
        }
    }).dxSwitch("instance");
}

SCManager.prototype.ShowListViewFloatingMenu = function (show) {
    // if (this.DataBrowserSDA) {
    //     this.DataBrowserSDA.option("visible", show);
    // }
    // if (this.ListViewSDA) {
    //     this.ListViewSDA.option("visible", show);
    // }
    // if (this.GroupsSDA) {
    //     this.GroupsSDA.option("visible", show);
    // }
}

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
            if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.DataBrowser) {
                return;
            }

            for (var _i = 0; _i < selections.length; _i++) {
                var selection = selections[_i];

                var sel = selection.getSelection();

                if (_this.SelectedNodeId !== sel.getNodeId()) {
                   
                    if(_this.HasProperties)
                    {
                        _this.SelectComponentRow(selection);
                    }
                    else
                    {
                        _this.SelectBrowserItem(selection);
                    }
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

SCManager.prototype.SelectComponentRow = function (selectionEvent) {
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
            this.ModelTree.HighlightComponentRow(this.SelectedNodeId);

            //property callout
            this.OpenPropertyCallout(undefined, this.SelectedNodeId);
        }
    }
};

SCManager.prototype.SelectBrowserItem = function (selectionEvent) {
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

        this.ModelTree.HighlightComponentRow(this.SelectedNodeId);

        //property callout
        this.OpenPropertyCallout(undefined, this.SelectedNodeId);
    }
}

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
                    // Object.keys(nodeProperties).length > 0 &&
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
                        _this.SourceProperties[nodeId] = genericPropertiesObject;
                    }
                    else {
                        // create generic properties object
                        var genericPropertiesObject = new GenericComponent(name,
                            undefined,
                            undefined,
                            nodeId,
                            parentNodeId);
                        for (var key in nodeProperties) {
                            var genericPropertyObject = new GenericProperty(key, "String", nodeProperties[key]);
                            genericPropertiesObject.addProperty(genericPropertyObject);
                        }
                        _this.Properties[nodeId] = genericPropertiesObject;
                    }

                    // all components
                    var dataComponentObject = new GenericComponent(name,
                        mainComponentClass,
                        subComponentClass,
                        nodeId,
                        parentNodeId);
                    for (var key in nodeProperties) {
                        var prop = new GenericProperty(key, "String", nodeProperties[key]);
                        dataComponentObject.addProperty(prop);
                    }
                    _this.AllComponents[nodeId] = dataComponentObject;
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

SCManager.prototype.OpenPropertyCallout = function (componentName, nodeId) {
    var _this = this;

    var sourceProperties = this.SourceProperties;
    if (nodeId in sourceProperties) {

        // properties
        var properties = []
        for (var i = 0; i < sourceProperties[nodeId].properties.length; i++) {
            var property = {};
            property["Name"] = sourceProperties[nodeId].properties[i].Name;
            property["Value"] = sourceProperties[nodeId].properties[i].Value;
            properties.push(property);

        }

        // references
        var componentId = this.NodeIdvsComponentIdList[nodeId];
        ReferenceManager.getReferences([componentId]).then(function (references) {
            var referencesData = [];
            var commentsData = [];
            // var index = 0;
            if (references && _this.Id in references) {
                if ("webAddress" in references[_this.Id]) {
                    for (var i = 0; i < references[_this.Id]["webAddress"].length; i++) {
                        // index++;

                        var referenceData = {};
                        // referenceData["id"] = index;
                        referenceData["Value"] = references[_this.Id]["webAddress"][i];
                        referenceData["Type"] = "Web Address";

                        referencesData.push(referenceData);
                    }
                }

                if ("image" in references[_this.Id]) {
                    for (var i = 0; i < references[_this.Id]["image"].length; i++) {
                        // index++;

                        var referenceData = {};
                        // referenceData["id"] = index;
                        referenceData["Value"] = references[_this.Id]["image"][i];
                        referenceData["Type"] = "Image";

                        referencesData.push(referenceData);
                    }
                }

                if ("document" in references[_this.Id]) {
                    for (var i = 0; i < references[_this.Id]["document"].length; i++) {
                        // index++;

                        var referenceData = {};
                        // referenceData["id"] = index;
                        referenceData["Value"] = references[_this.Id]["document"][i];
                        referenceData["Type"] = "Document";

                        referencesData.push(referenceData);
                    }
                }

                if ("comment" in references[_this.Id]) {
                    for (var i = 0; i < references[_this.Id]["comment"].length; i++) {
                        commentsData.push(JSON.parse(references[_this.Id]["comment"][i]));
                    }
                }
            }

            // if (properties.length > 0) {

                if (!componentName) {
                    componentName = _this.SourceProperties[nodeId].Name;
                }

                _this.PropertyCallout.Update(componentName,
                    componentId,
                    properties,
                    referencesData,
                    commentsData);
            // }
        });
    }
    else if (nodeId in this.Properties) {
        // properties
        var properties = []
        for (var i = 0; i < this.Properties[nodeId].properties.length; i++) {
            var property = {};
            property["Name"] = this.Properties[nodeId].properties[i].Name;
            property["Value"] = this.Properties[nodeId].properties[i].Value;
            properties.push(property);

        }

        this.PropertyCallout.Update(componentName,
            undefined,
            properties,
            undefined,
            undefined);
    }
    else
    {
        this.PropertyCallout.Update(componentName,
            undefined,
            undefined,
            undefined,
            undefined);
    }
}

SCManager.prototype.SerializeMarkupViews = function () {
    var currentView = model.views[this.Id];

    var markupData = this.SerializeViews(currentView.markupViews);
   
    return JSON.stringify(markupData);
};

SCManager.prototype.RestoreMarkupViews = function (viewsStr) {
    var markupManager = this.Webviewer.markupManager;
    markupManager.loadMarkupData(JSON.parse(viewsStr)).then(function(result){

    });
    var currentView = model.views[this.Id];
    var views = JSON.parse(JSON.parse(viewsStr)).views;
    for (var i = 0; i < views.length; i++) {
        currentView.markupViews[views[i].name] = views[i].uniqueId;
    }
};

SCManager.prototype.SerializeBookmarkViews = function () {
    var currentView = model.views[this.Id];

    var markupData = this.SerializeViews(currentView.bookmarks);
    // var allViews = [];
    // for (var viewName in currentView.bookmarks) {

    //     var viewId = currentView.bookmarks[viewName];
    //     var markupManager = this.Webviewer.markupManager;
    //     var markupView = markupManager.getMarkupView(viewId);

    //     allViews.push(markupView.toJson());
    // }

    // var markupData = {
    //     views: allViews
    // };
    return JSON.stringify(markupData);
};

SCManager.prototype.SerializeViews = function (views) {
    var allViews = [];
    for (var viewName in views) {

        var viewId = views[viewName];
        var markupManager = this.Webviewer.markupManager;
        var markupView = markupManager.getMarkupView(viewId);

        allViews.push(markupView.toJson());
    }

    var markupData = {
        views: allViews
    };

    return markupData;
}

SCManager.prototype.RestoreBookmarkViews = function (viewsStr) {
    var markupManager = this.Webviewer.markupManager;
    markupManager.loadMarkupData(JSON.parse(viewsStr)).then(function(result){

    });
    
    var currentView = model.views[this.Id];
    var views = JSON.parse(JSON.parse(viewsStr)).views;
    for (var i = 0; i < views.length; i++) {
        currentView.bookmarks[views[i].name] = views[i].uniqueId;
    }
};

SCManager.prototype.SerializeAnnotations = function () {
    var currentView = model.views[this.Id];

    var allAnnotations = [];
    for (var markupHandle in currentView.annotations) {
        var annotation = currentView.annotations[markupHandle];
        var leaderLineAnchor = annotation.getLeaderLineAnchor();
        var textboxAnchor = annotation.getTextBoxAnchor();
        var text = annotation.getLabel();

        allAnnotations.push({
            "text" : text,
            "leaderLineAnchor" : [leaderLineAnchor.x, leaderLineAnchor.y, leaderLineAnchor.z],
            "textboxAnchor" : [textboxAnchor.x, textboxAnchor.y, textboxAnchor.z]
        });
    }

    return allAnnotations;
}

SCManager.prototype.RestoreAnnotations = function (annotationsStr) {
    var annotations = JSON.parse(annotationsStr);
    for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];

        var leaderLineAnchor = new Communicator.Point3(
            Number(annotation.leaderLineAnchor[0]),
            Number(annotation.leaderLineAnchor[1]),
            Number(annotation.leaderLineAnchor[2])
        );

        var annotationMarkup = new Example.AnnotationMarkup(this.Webviewer, leaderLineAnchor, annotation.text);
        annotationMarkup.setTextBoxAnchor(new Communicator.Point3(
            Number(annotation.textboxAnchor[0]),
            Number(annotation.textboxAnchor[1]),
            Number(annotation.textboxAnchor[2])
        ));
        annotationMarkup.draw();
        var markupHandle = this.Webviewer.markupManager.registerMarkup(annotationMarkup);

        model.views[this.Id].annotations[markupHandle] = annotationMarkup;
    }

    model.views[this.Id].annotationOperator._annotationCount = annotations.length + 1;
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


function DWFSourceManager(id,  sourceName, sourceType, viewerOptions) {
    // call super constructor
    SCManager.call(this, id,  sourceName, sourceType, viewerOptions);
}
// inherit from parent
DWFSourceManager.prototype = Object.create(SCManager.prototype);
DWFSourceManager.prototype.constructor = DWFSourceManager;


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