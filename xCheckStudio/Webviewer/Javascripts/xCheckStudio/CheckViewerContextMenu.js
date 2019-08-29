function CheckViewerContextMenu(webViewer) {
    // call super constructor
    ContextMenuManager.call(this);

    this.WebViewer = webViewer;
    // this.ModelBrowser;

    // //this.IsolatedNodes = [];
    // this.IsolateManager;

    this.TranslucencyManager;
    this.ExplodeManager;
}

// inherit from parent
CheckViewerContextMenu.prototype = Object.create(ContextMenuManager.prototype);
CheckViewerContextMenu.prototype.constructor = CheckViewerContextMenu;

CheckViewerContextMenu.prototype.Init = function () {

    var _this = this;
    // this.ModelBrowser = modelBrowser;
    container = "#" + this.WebViewer._params.containerId;

    $(container).contextMenu({
        className: 'contextMenu_style',
        selector: 'div',
        // selector: '.jsgrid-row, .jsgrid-alt-row',
        build: function ($triggerElement, e) {
            return {
                callback: function (key, options) {
                    _this.OnMenuItemClicked(key, options);
                },
                items: {
                    "hide": {
                        name: "Hide"
                    },
                    "isolate": {
                        name: "Isolate"
                    },
                    "showAll": {
                        name: "Show All"
                    },
                    "showNavigationCube": {
                        name: "Show Navigation Cube"
                    },
                    "hideNavigationCube": {
                        name: "Hide Navigation Cube"
                    },
                    "startExplode": {
                        name: "Start Explode"
                    },
                    "stopExplode": {
                        name: "Stop Explode"
                    },
                    "startTranslucency": {
                        name: "Start Translucency"
                    },
                    "stopTranslucency": {
                        name: "Stop Translucency"
                    },                   
                }
            };
        }
    });
}

CheckViewerContextMenu.prototype.OnMenuItemClicked = function (key, options) {
    if (key.toLowerCase() === "hide") {
        this.OnHideClicked();
    }
    else if (key.toLowerCase() === "shownavigationcube") {
        showNavigationCube(this.WebViewer);
    }
    else if (key.toLowerCase() === "hidenavigationcube") {
        hideNavigationCube(this.WebViewer);
    }
    else if (key.toLowerCase() === "startexplode") {
        this.OnStartExplodeClicked();
    }
    else if (key.toLowerCase() === "stopexplode") {
        this.OnStopExplodeClicked();
    }
    else if (key.toLowerCase() === "isolate") {
        this.OnIsolateClicked();
    }
    else if (key.toLowerCase() === "showall") {
        this.OnShowAllClicked();
    }
    else if (key.toLowerCase() === "starttranslucency") {
        this.OnStartTranslucencyClicked();
    }
    else if (key.toLowerCase() === "stoptranslucency") {
        this.OnStopTranslucencyClicked();
    }
}

CheckViewerContextMenu.prototype.OnStartExplodeClicked = function () {
    if (!this.WebViewer ) {
        return;
    }

    if (this.TranslucencyManager) {
        alert("Please stop translucency before activating explode.");
        return;
    }

    this.ExplodeManager = new ExplodeManager(this.WebViewer);
    this.ExplodeManager.Start();

    //explodeManagers[currentViewer._params.containerId] = explodeManager;
}

CheckViewerContextMenu.prototype.OnStopExplodeClicked = function () {

    if (!this.WebViewer ||
        !this.ExplodeManager) {
        return;
    }

    this.ExplodeManager.Stop();
    this.ExplodeManager = undefined;
}

CheckViewerContextMenu.prototype.OnHideClicked = function()
{
    if (this.WebViewer) {

        var results = this.WebViewer.selectionManager.getResults();

        var map = {};
        for (var i = 0; i < results.length; i++) {
            var selectedItem = results[i];
            map[selectedItem._nodeId] = false;           
        }

        this.WebViewer.model.setNodesVisibilities(map);
    }
}

CheckViewerContextMenu.prototype.OnIsolateClicked = function () {
    if (!this.WebViewer) {
        return;
    }

    var selectionManager = this.WebViewer.selectionManager;

    var selectedNodes = [];
    selectionManager.each(function (selectionItem) {
        if (selectionItem.isNodeSelection()) {
            selectedNodes.push(selectionItem._nodeId);
        }
    });

    // perform isolate
    var isolateManager = new IsolateManager(this.WebViewer);
    isolateManager.Isolate(selectedNodes).then(function (affectedNodes) {

    });
}


CheckViewerContextMenu.prototype.OnShowAllClicked = function () {
    if (!this.WebViewer) {
        return;
    }

    var _this = this;
    this.WebViewer.model.setNodesVisibility([this.WebViewer.model.getAbsoluteRootNode()], true).then(function () {
        _this.WebViewer.view.fitWorld();        
    });   
}


CheckViewerContextMenu.prototype.OnStartTranslucencyClicked = function () {
    if (!this.WebViewer ||
        !this.ActivateTranslucency()) {
        alert("Can't activate translucency.");
        return;
    }

    if (this.ExplodeActive()) {
        alert("Please stop explode before activating translucency.");
        return;
    }

    // get slider id
    var sliderId = getSliderId(this.WebViewer._params.containerId);
    if (!sliderId) {
        return;
    }

    this.TranslucencyManager = new TranslucencyManager([this.WebViewer], undefined, sliderId);
    this.TranslucencyManager.Start();

    //translucencyManagers[currentViewer._params.containerId] = translucencyManager;
}

CheckViewerContextMenu.prototype.OnStopTranslucencyClicked = function () {
    if (!this.WebViewer ||
        !this.TranslucencyManager) {
        return;
    }

    this.TranslucencyManager.Stop();

    this.TranslucencyManager = undefined;
}

CheckViewerContextMenu.prototype.ActivateTranslucency = function () {
    if (!this.TranslucencyManager) {
        return true;
    }

    return false;
}

CheckViewerContextMenu.prototype.ExplodeActive = function () {
    if (this.ExplodeManager) {
        return true;
    }

    return false;
}

