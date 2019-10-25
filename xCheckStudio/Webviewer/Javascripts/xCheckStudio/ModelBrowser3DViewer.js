function ModelBrowser3DViewer(id,
    source,
    viewerOptions) {

    this.Id = id;
    this.Source = source;
    this.ViewerOptions = viewerOptions;

    this.Viewer;
    this.selectedNodeId;
}

ModelBrowser3DViewer.prototype.GetBrowser = function () {
    var browser = model.checks[model.currentCheck]["modelBrowsers"][this.Source];
    return browser["browser"];
}

ModelBrowser3DViewer.prototype.setupViewer = function (width, height) {

    // create and start viewer
    var viewer = new Communicator.WebViewer({
        containerId: this.ViewerOptions[0], //"myContainer",          
        endpointUri: this.ViewerOptions[1], //"uploads/scs/bearingassembly.scs"	
    });

    viewer.start();
    this.Viewer = viewer;
    this.bindEvents(viewer);
    this.setViewerBackgroundColor();

    var viewerContainer = document.getElementById(this.ViewerOptions[0]);
    viewerContainer.style.width = width;
    viewerContainer.style.height = height;
}

ModelBrowser3DViewer.prototype.bindEvents = function (viewer) {

    var _this = this;

    viewer.setCallbacks({
        firstModelLoaded: function () {
            viewer.view.fitWorld();
            viewer.resizeCanvas();

            // create nav cube
            showNavigationCube(viewer);

            // highlight components
            _this.HighlightComponentsfromResult();
        },
        selectionArray: function (selections) {
            if (selections.length === 0
                && _this.selectedNodeId) {
                _this.UnHighlightAll();
                return;
            }

            for (var i = 0; i < selections.length; i++) {
                var selection = selections[i];
                _this.onSelection(selection);
            }
        },
    });

    window.onresize = function () {
        viewer.resizeCanvas();
    };
};

ModelBrowser3DViewer.prototype.setViewerBackgroundColor = function () {
    var backgroundTopColor = xCheckStudio.Util.hexToRgb("#000000");
    var backgroundBottomColor = xCheckStudio.Util.hexToRgb("#F8F9F9");

    this.Viewer.view.setBackgroundColor(backgroundTopColor, backgroundBottomColor);

    // set back face visibility
    this.Viewer.view.setBackfacesVisible(true);
}

ModelBrowser3DViewer.prototype.HighlightComponent = function (nodeIdString) {

    var nodeId = Number(nodeIdString);
    if (!nodeIdString ||
        nodeId === NaN) {
        this.UnHighlightComponent();
        return;
    }

    this.selectedNodeId = nodeId;

    this.HighlightNodeInViewer(nodeId);
};

ModelBrowser3DViewer.prototype.UnHighlightComponent = function () {

    this.selectedNodeId = undefined;
    this.ClearSelection();
    //     this.Viewer.view.fitWorld();
}

ModelBrowser3DViewer.prototype.HighlightNodeInViewer = function (nodeId) {
    this.Viewer.selectionManager.selectNode(nodeId);
    this.Viewer.view.fitNodes([nodeId]);
}

ModelBrowser3DViewer.prototype.ClearSelection = function () {
    this.Viewer.selectionManager.clear();
}

ModelBrowser3DViewer.prototype.UnHighlightAll = function () {
}

ModelBrowser3DViewer.prototype.onSelection = function (selectionEvent) {
    var selection = selectionEvent.getSelection();

    if (!selection.isNodeSelection() ||
        this.selectedNodeId === selection.getNodeId()) {
        return;
    }

    this.selectedNodeId = selection.getNodeId();
    var model3D = this.Viewer.model;
    if (!model3D.isNodeLoaded(this.selectedNodeId)) {
        this.UnHighlightComponent();
        this.UnHighlightAll();

        return;
    }

    // select valid node
    this.SelectValidNode();

    if (!this.selectedNodeId ||
        model3D.getNodeType(this.selectedNodeId) === Communicator.NodeType.BodyInstance ||
        model3D.getNodeType(this.selectedNodeId) === Communicator.NodeType.Unknown) {
        return;
    }


    var browser = this.GetBrowser();
    if (browser) {
        browser.HighlightBrowserComponentRow(this.selectedNodeId, true);
    }
};

ModelBrowser3DViewer.prototype.SelectValidNode = function () {
    if (this.IsNodeInCheckResults(this.selectedNodeId)) {
        return;
    }

    var model = this.Viewer.model;
    while (this.selectedNodeId) {
        this.selectedNodeId = model.getNodeParent(this.selectedNodeId);

        if (this.IsNodeInCheckResults(this.selectedNodeId)) {
            this.HighlightNodeInViewer(this.selectedNodeId);
            break;
        }
    }
}

ModelBrowser3DViewer.prototype.IsNodeInCheckResults = function (node) {

    var nodeIdvsCheckComponent = this.GetBrowser().NodeIdvsCheckComponent;

    if (!nodeIdvsCheckComponent) {
        return false;
    }

    if (node in nodeIdvsCheckComponent) {
        return true;
    }

    return false;
}

ModelBrowser3DViewer.prototype.HighlightComponentsfromResult = function () {

    var browser = this.GetBrowser();

    for (var id in browser.Components) {
        var component = browser.Components[id];
        this.ChangeComponentColor(component, false, undefined);
    }
}

ModelBrowser3DViewer.prototype.ChangeComponentColor = function (component, override, parentComponent) {
    var status = component.Status;

    if (status !== null) {
        this.ColorComponent(component, override, parentComponent);
    }

    var children = component.Children;
    for (var id in children) {
        var child = children[id];

        // take care of don't color components
        if (child.SubClass.toLowerCase() in DontColorComponents) {
            var dontColorComponent = DontColorComponents[child.SubClass.toLowerCase()];
            if (child.MainClass.toLowerCase() === dontColorComponent["mainClass"] &&
                component.MainClass.toLowerCase() === dontColorComponent["parentMainClass"]) {
                continue;
            }
        }

        // take care of color overriding from status components
        var overrideColorWithSeverityPreference = false;
        if (component.MainClass.toLowerCase() in OverrideSeverityColorComponents) {
            var overrideSeverityColorComponent = OverrideSeverityColorComponents[component.MainClass.toLowerCase()];
            if (overrideSeverityColorComponent.includes(child.MainClass.toLowerCase())) {
                overrideColorWithSeverityPreference = true;
            }
        }

        this.ChangeComponentColor(child, overrideColorWithSeverityPreference, component);
    }
}

ModelBrowser3DViewer.prototype.ColorComponent = function (component, override, parentComponent) {

    nodeIdString = component.NodeId;
    var hexColor = xCheckStudio.Util.getComponentHexColor(component, override, parentComponent);
    if (hexColor === undefined) {
        return;
    }

    var nodeId = Number(nodeIdString);
    if (nodeId === undefined ||
        isNaN(nodeId)) {
        return;
    }

    // set nodes face and line colors from status of compoentns
    var rgbColor = xCheckStudio.Util.hexToRgb(hexColor);
    var communicatorColor = new Communicator.Color(rgbColor.r, rgbColor.g, rgbColor.b);
    this.Viewer.model.setNodesFaceColor([nodeId], communicatorColor);
    this.Viewer.model.setNodesLineColor([nodeId], communicatorColor);
}