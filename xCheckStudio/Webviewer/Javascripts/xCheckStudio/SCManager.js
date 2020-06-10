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
    
    this.IncludeMemberItemsSwitch;
    this.ListTypeSwitch;
    this.GroupTemplateSelect;
    this.GroupHighlightSwitch;
    this.HighlightSelectionBtn;
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
    else if (activeTableView === GlobalConstants.TableView.Group) {
        return model.views[this.Id].groupView;
    }

    return null;
};

SCManager.prototype.GetViewerContainerID = function () {
    return this.ViewerOptions.containerId;
}

SCManager.prototype.LoadData = function (selectedComponents, visibleItems, loadFromSaved = false) {

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
                currentView.dataDefinitionMenu = new DataDefinitionMenu(_this.Id);              
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

                if (!loadFromSaved) {
                    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(_this.SourceType);
                    var rootNodeId = viewer.model.getAbsoluteRootNode();
                    _this.ReadProperties(rootNodeId, identifierProperties, undefined).then(function (res) {
                        if (res) {
                            if (Object.keys(_this.SourceProperties).length > 0) {
                                _this.HasProperties = true;

                                _this.ModelTree.AddComponentTable(_this.SourceProperties);

                                if (!isDataVault()) {
                                    _this.AddComponentsToDB();
                                }
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
                            // init list view switches
                            _this.InitListViewSwitches();

                            if (!isDataVault()) {
                                // Init group view
                                model.views[_this.Id].groupView = new GroupView(
                                    _this.Id,
                                    _this.ViewerOptions.modelTree,
                                    _this.AllComponents,
                                    viewer);
                                // init group view controls
                                _this.InitGroupViewControls();
                            }

                            // Init isolatemanager
                            model.views[_this.Id].isolateManager = new IsolateManager(viewer);

                            // Init table views action menu
                            _this.InitViewActionMenu();   
                        }

                        // create property callout
                        _this.PropertyCallout = new PropertyCallout(_this.Id);
                        _this.PropertyCallout.Init();

                        return resolve(true);
                    });
                }
                else
                {
                    // restore the node id vs component list when saved data is loaded.
                    _this.RestoreNodeIdVsCompList();
                }
                //activate context menu            
                var ids = _this.GetControlIds();

                _this.CheckViewerContextMenu = new ViewerContextMenu(viewer, ids);
                _this.CheckViewerContextMenu.Init();

                if (loadFromSaved) {
                    return resolve(true);
                }
             },
            modelLoadFailure: function () {
                return resolve(false);
            }
        });
    });
};

SCManager.prototype.RestoreNodeIdVsCompList = function () {
    var _this = this;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    $.ajax({
        data: {
            "InvokeFunction": "GetNodeIdVsComponentId",
            'SourceId': _this.Id,
            'ProjectName': projectinfo.projectname,
            'CheckName': checkinfo.checkname
        },
        type: "POST",
        url: "PHP/ProjectManager.php"
    }).done(function (msg) {
        var result = JSON.parse(msg);
        if (result.MsgCode !== 1) {
            return;
        }

        _this.NodeIdvsComponentIdList = result.Data;
    });
}

SCManager.prototype.GetNodeIdByCompId = function (compId) {
    var nodeId = xCheckStudio.Util.getKeyByValue(this.NodeIdvsComponentIdList, compId);
    if (!nodeId) {
        return null;
    }

    return Number(nodeId);
}

SCManager.prototype.GetCompIdByNodeId = function (nodeId) {    
    if (nodeId in this.NodeIdvsComponentIdList) {
        return Number(this.NodeIdvsComponentIdList[nodeId]);
    }

    return null;
}

SCManager.prototype.OpenTableViewsMenu = function () {
    var _this = this;

    var mainBtn = document.getElementById("tableViewAction" + this.Id);
    mainBtn.classList.add("openSDAMenu");
    mainBtn.children[0].src = "public/symbols/CloseBlack.svg";

    var dataBrowserSDA = document.getElementById("dataBrowserAction" + _this.Id);
    dataBrowserSDA.classList.add("showSDA");
    dataBrowserSDA.onclick = function () {
        if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.DataBrowser) {
            var selectedNodeIds = _this.GetCurrentTable().GetSelectedNodeIds();

            _this.ModelTree.AddComponentTable(_this.SourceProperties, selectedNodeIds);

            _this.CloseTableViewsMenu();

            if (!isDataVault()) {
                // hide group view controls
                _this.ShowGroupViewControls(false);
            }
        }
    }

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

    var groupsSDA = document.getElementById("groupsAction" + _this.Id);
    if (!isDataVault()) {
        groupsSDA.classList.add("showSDA");
        groupsSDA.onclick = function () {
            if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.Group) {             
                model.views[_this.Id].groupView.Show();

                model.views[_this.Id].activeTableView = GlobalConstants.TableView.Group;

                _this.CloseTableViewsMenu();

                // show group view controls
                _this.ShowGroupViewControls(true);
            }
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
    }
}

SCManager.prototype.InitListViewSwitches = function () { 
    var _this = this;
    this.IncludeMemberItemsSwitch = $("#includeMemberItemsSwitch" + this.Id).dxSwitch({
        value: false,
        // disabled: true,
        visible: false,
        switchedOffText: "Exclude",
        switchedOnText: "Include",
        onValueChanged: function (e) {
            if (model.views[_this.Id].listView.ListViewTableInstance) {
                model.views[_this.Id].listView.ListViewTableInstance.option("selection.recursive", e.value);
                model.views[_this.Id].listView.OnIncludeMembers(e.value);
            }
        }
    }).dxSwitch("instance");

    this.ListTypeSwitch = $("#listTypeSwitch" + this.Id).dxSwitch({
        value: false,
        // disabled: true,
        visible: false,
        switchedOffText: "Nested",
        switchedOnText: "Flat",
        onValueChanged: function (e) {
            model.views[_this.Id].listView.Show();
        }
    }).dxSwitch("instance");
}

SCManager.prototype.InitGroupViewControls = function(){
    var _this = this;

    var groups = ["Clear"];    
    groups = groups.concat(Object.keys(model.propertyGroups));
    this.GroupTemplateSelect = $("#groupTemplateSelect" + this.Id).dxSelectBox({
        items: groups,
        value: "Clear",
        visible: false,
        onValueChanged: function (data) {
            model.views[_this.Id].groupView.OnGroupTemplateChanged(data.value);
        }

    }).dxSelectBox("instance");

    this.GroupHighlightSwitch = $("#groupHighlightSwitch" + this.Id).dxSwitch({
        value: false,
        visible: false,
        switchedOffText: "Group",
        switchedOnText: "Highlight",
        onValueChanged: function (e) {

            model.views[_this.Id].groupView.IsHighlightByPropertyActive = e.value;
            if (e.value === false) {
                _this.GroupTemplateSelect.option("items", ["Clear"].concat(Object.keys(model.propertyGroups)));
            }
            else {
                _this.GroupTemplateSelect.option("items", ["Clear"].concat(Object.keys(model.propertyHighlightTemplates)));
            }

            model.views[_this.Id].groupView.Clear();
        }
    }).dxSwitch("instance");

    this.HighlightSelectionBtn = document.getElementById("highlightSelectionBtn" + this.Id);
    this.HighlightSelectionBtn.onclick = function(){
        model.views[_this.Id].groupView.ApplyPropertyHighlightColor();
    }
}

SCManager.prototype.ShowGroupViewControls = function (show) {
    this.GroupTemplateSelect.option("visible", show);
    this.GroupHighlightSwitch.option("visible", show);
    if (show) {
        this.HighlightSelectionBtn.style.display = "block";
    }
    else {
        this.HighlightSelectionBtn.style.display = "none";
    }

    this.GroupTemplateSelect.option("value", null);
}

// SCManager.prototype.ShowListViewFloatingMenu = function (show) {
//     // if (this.DataBrowserSDA) {
//     //     this.DataBrowserSDA.option("visible", show);
//     // }
//     // if (this.ListViewSDA) {
//     //     this.ListViewSDA.option("visible", show);
//     // }
//     // if (this.GroupsSDA) {
//     //     this.GroupsSDA.option("visible", show);
//     // }
// }

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
                            subComponentClass,
                            true);

                        genericPropertiesObject.addProperty(componentClassPropertyObject);


                        if (_this.SourceType.toLowerCase() == "rvt") {
                            var elementName = new GenericProperty("Name",
                                "String",
                                name,
                                true);

                            genericPropertiesObject.addProperty(elementName);
                        }

                        // iterate node properties and add to generic properties object
                        for (var key in nodeProperties) {
                            var genericPropertyObject = new GenericProperty(key, "String", nodeProperties[key], false);
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
                            var genericPropertyObject = new GenericProperty(key, "String", nodeProperties[key], false);
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
                        var prop = new GenericProperty(key, "String", nodeProperties[key], false);
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

SCManager.prototype.OpenPropertyCalloutByCompId = function (componentId) {    
    var nodeId = this.GetNodeIdByCompId(componentId);

    if (nodeId in this.AllComponents) {
        var compData = this.AllComponents[nodeId];
        this.OpenPropertyCallout(compData.Name, nodeId);
    }
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
        var componentId = this.GetCompIdByNodeId(nodeId);

        if (isDataVault()) {
            if (!componentName) {
                componentName = _this.SourceProperties[nodeId].Name;
            }

            _this.PropertyCallout.Update(componentName,
                componentId,
                properties,
                [],
                []);
        }
        else {
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

                if (!componentName) {
                    componentName = _this.SourceProperties[nodeId].Name;
                }

                _this.PropertyCallout.Update(componentName,
                    componentId,
                    properties,
                    referencesData,
                    commentsData);
            });
        }
    }
    else if (nodeId in this.Properties ||
        nodeId in this.AllComponents) {

        var propertyCollection = [];
        if (nodeId in this.Properties) {
            propertyCollection = this.Properties[nodeId].properties;
        }
        else if (nodeId in this.AllComponents) {
            propertyCollection = this.AllComponents[nodeId].properties;
        }

        // properties
        var properties = []
        for (var i = 0; i < propertyCollection.length; i++) {
            var property = {};
            property["Name"] = propertyCollection[i].Name;
            property["Value"] = propertyCollection[i].Value;
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

SCManager.prototype.RestoreAllComponents = function (allComponentsStr) {
    var _this = this;

    var allComponents = JSON.parse(allComponentsStr);
    for (var nodeId in allComponents) {
        var component = allComponents[nodeId];

        // var nodeId = Number(component.NodeId);
        var parentNodeId = Number(component.ParentNodeId);
        var componentObj = new GenericComponent(component.Name,
            component.MainComponentClass,
            component.SubComponentClass,
            nodeId,
            parentNodeId);
        for (var j = 0; j < component.properties.length; j++) {
            var property = component.properties[j];
            var prop = new GenericProperty(property.Name, property.Format, property.Value, property.UserDefined);
            componentObj.addProperty(prop);
        }
        this.AllComponents[nodeId] = componentObj;

        if (component.properties.length > 0 &&
            component.MainComponentClass &&
            component.SubComponentClass) {
            // add genericProperties object to sourceproperties collection
            _this.SourceProperties[nodeId] = componentObj;
        }
    }

    // if (res) {
    if (Object.keys(_this.SourceProperties).length > 0) {
        _this.HasProperties = true;
        _this.ModelTree.AddComponentTable(_this.SourceProperties);
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
        _this.Webviewer);

    if (!isDataVault()) {

        // Init group view
        model.views[_this.Id].groupView = new GroupView(
            _this.Id,
            _this.ViewerOptions.modelTree,
            _this.AllComponents,
            _this.Webviewer);

        // init group view controls
        _this.InitGroupViewControls();
    }

    // Init isolatemanager
    model.views[_this.Id].isolateManager = new IsolateManager(_this.Webviewer);

    // Init table views action menu
    _this.InitViewActionMenu();

    // init list view switches
    _this.InitListViewSwitches();
    // }   

    // create property callout
    _this.PropertyCallout = new PropertyCallout(_this.Id);
    _this.PropertyCallout.Init();

    // return resolve(true);
}

SCManager.prototype.GetNodeName = function (nodeId) {
    return this.Webviewer.model.getNodeName(nodeId)
}

SCManager.prototype.GetNodeParent = function (nodeId) {
    return this.Webviewer.model.getNodeParent(nodeId)
}

SCManager.prototype.GetAllSourceProperties = function () {
    // var sourceManager = SourceManagers[this.Id];

    var allProperties = [];
    // if (sourceManager.Is3DSource()) {
    var allComponents = this.AllComponents;

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
    // }

    return allProperties;
}

SCManager.prototype.GetIncludeMember = function () {
    if (this.IncludeMemberItemsSwitch) {
        return this.IncludeMemberItemsSwitch.option("value");
    }

    return false;
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