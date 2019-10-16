function ViewerContextMenu(webViewer, ids) {

    this.WebViewer = webViewer;
    this.Controls = ids;

    this.TranslucencyManager;
    this.ExplodeManager;

    this.NavCubeVisible = true;
}

ViewerContextMenu.prototype.ShowMenu = function (x, y) {

    var _this = this;

    var contextMenuDiv = document.getElementById("contextMenu");
    contextMenuDiv.innerHTML = "";

    // 1st group
    var itemGroup = document.createElement("ul");
    itemGroup.id = "items";

    var item = document.createElement("li");
    item.id = "hide";
    item.innerText = "Hide";
    item.onclick =
    function () {
        _this.OnHideClicked();
    }
    itemGroup.appendChild(item);

    item = document.createElement("li");
    item.id = "isolate";
    item.innerText = "Isolate";
    item.onclick = function () {
        _this.OnIsolateClicked();
    }
    itemGroup.appendChild(item);

    item = document.createElement("li");
    item.id = "showAll";
    item.innerText = "Show All";
    item.onclick = function () {
        _this.OnShowAllClicked();
    }
    itemGroup.appendChild(item);

    contextMenuDiv.appendChild(itemGroup);

    item = document.createElement("hr");
    contextMenuDiv.appendChild(item);    

    // 2nd group
    itemGroup = document.createElement("ul");
    itemGroup.id = "items";
    if (!this.ExplodeManager) {
        item = document.createElement("li");
        item.id = "startExplode";
        item.innerText = "Start Explode";
        item.onclick =  function () {
             _this.OnStartExplodeClicked();
        }
        itemGroup.appendChild(item);
    }
    else {
        item = document.createElement("li");
        item.id = "stopExplode";
        item.innerText = "Stop Explode";
        item.onclick =  function () {
            _this.OnStopExplodeClicked();
        }
        itemGroup.appendChild(item);
    }
    contextMenuDiv.appendChild(itemGroup);

    item = document.createElement("hr");
    contextMenuDiv.appendChild(item);

    // 3rd group
    itemGroup = document.createElement("ul");
    itemGroup.id = "items";

    if (!this.TranslucencyManager) {
        item = document.createElement("li");
        item.id = "startTranslucency";
        item.innerText = "Start Translucency";
        item.onclick =  function () {
            _this.OnStartTranslucencyClicked();
        }
        itemGroup.appendChild(item);
    }
    else {
        item = document.createElement("li");
        item.id = "stopTranslucency";
        item.innerText = "Stop Translucency";
        item.onclick =  function () {
            _this.OnStopTranslucencyClicked();
        }
        itemGroup.appendChild(item);
    }
    contextMenuDiv.appendChild(itemGroup);

    contextMenuDiv.style.top = y + "px";
    contextMenuDiv.style.left = x + "px";
    contextMenuDiv.style.display = "block";

    // close context menu, if mouse click is done outside
    document.onclick = function (e) {
        if (e.target.id !== 'contextMenu') {            
            contextMenuDiv.style.display = 'none';
        }
    };  
   
}

ViewerContextMenu.prototype.Init = function () {

    var _this = this;
    this.WebViewer.setCallbacks({
        contextMenu: function (position) {          
            _this.ShowMenu(event.clientX, event.clientY);
        }
    });
}

ViewerContextMenu.prototype.OnStartExplodeClicked = function () {
    if (!this.WebViewer) {
        return;
    }

    if (this.TranslucencyManager) {
        alert("Please stop translucency before activating explode.");
        return;
    }

    this.ExplodeManager = new ExplodeManager(this.WebViewer, this.Controls["explode"]);
    this.ExplodeManager.Start();    
}

ViewerContextMenu.prototype.OnStopExplodeClicked = function () {

    if (!this.WebViewer ||
        !this.ExplodeManager) {
        return;
    }

    this.ExplodeManager.Stop();
    this.ExplodeManager = undefined;
}

ViewerContextMenu.prototype.OnHideClicked = function () {
    if (this.WebViewer) {

        var results = this.WebViewer.selectionManager.getResults();

        var map = {};
        for (var i = 0; i < results.length; i++) {
            var selectedItem = results[i];
            map[selectedItem._nodeId] = false;
        }

        this.WebViewer.model.setNodesVisibilities(map);

        if(model.currentTabId) {
            this.HideInCheck(selectedItem._nodeId);
        }
        else {
            this.HideInReview();
        }
    }
}

ViewerContextMenu.prototype.HideInCheck = function(nodeId) {
    // get highlighted row 
    var sourceManager = SourceManagers[model["currentTabId"]]
    // var row = sourceManager.ModelTree.SelectionManager.HighlightedComponentRow; 
    var selectedRows = [];

    var nodeList = sourceManager.ModelTree.GetNodeChildren(nodeId);
    nodeList.push(nodeId);
    //Add nodeId to hidden elements list
    sourceManager.HandleHiddenNodeIdsList(true, nodeList)

    if(nodeList.length > 1) {
        selectedRows = sourceManager.ModelTree.GetSelectedRowsFromNodeIds(sourceManager.HiddenNodeIds);
    }
    //Grey out the text of hidden element rows
    sourceManager.ModelTree.HighlightHiddenRows(true, selectedRows);

}

ViewerContextMenu.prototype.HideInReview = function() {
    var checkComponentRows = [];
        var row = model.getCurrentSelectionManager().HighlightedCheckComponentRow;
        checkComponentRows.push(row);

        var containerId = model.getCurrentReviewTable().CurrentTableId;

        // get viewerInterface on which "hide" is called
        var viewerInterface = this.GetViewerInterface();

        viewerInterface.StoreHiddenResultId(containerId, checkComponentRows);
        model.getCurrentReviewTable().HighlightHiddenRows(true, checkComponentRows);
}

ViewerContextMenu.prototype.GetViewerInterface = function() {
    var viewerContainer = this.WebViewer._params["containerId"];

    if(model.currentCheck == "comparison") {
        if(viewerContainer == model.checks[model.currentCheck].sourceAViewer.ViewerOptions[0]) {
            return model.checks[model.currentCheck].sourceAViewer;
        }
    
        if(viewerContainer == model.checks[model.currentCheck].sourceBViewer.ViewerOptions[0]) {
            return model.checks[model.currentCheck].sourceBViewer;
        }
    }
    else {
        return model.checks[model.currentCheck].viewer;
    }
   
}

ViewerContextMenu.prototype.OnIsolateClicked = function () {
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


ViewerContextMenu.prototype.OnShowAllClicked = function () {
    if (!this.WebViewer) {
        return;
    }

    var _this = this;
    this.WebViewer.model.setNodesVisibility([this.WebViewer.model.getAbsoluteRootNode()], true).then(function () {
        _this.WebViewer.view.fitWorld();
    });

    if(model.currentTabId) {
        // Remove all nodeIds from list (Showing all) and show all rows
        var sourceManager = SourceManagers[model.currentTabId];
        sourceManager.ModelTree.ShowAllHiddenRows();
    }
    else {
        var viewerInterface = this.GetViewerInterface();
        viewerInterface.ShowHiddenRows();
    }
}


ViewerContextMenu.prototype.OnStartTranslucencyClicked = function () {
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
    // var sliderId = getSliderId(this.WebViewer._params.containerId);
    // if (!sliderId) {
    //     return;
    // }

    this.TranslucencyManager = new TranslucencyManager([this.WebViewer], undefined, this.Controls["translucency"]);
    this.TranslucencyManager.Start();
}

ViewerContextMenu.prototype.OnStopTranslucencyClicked = function () {
    if (!this.WebViewer ||
        !this.TranslucencyManager) {
        return;
    }

    this.TranslucencyManager.Stop();

    this.TranslucencyManager = undefined;
}

ViewerContextMenu.prototype.ActivateTranslucency = function () {
    if (!this.TranslucencyManager) {
        return true;
    }

    return false;
}

ViewerContextMenu.prototype.ExplodeActive = function () {
    if (this.ExplodeManager) {
        return true;
    }

    return false;
}

