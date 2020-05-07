function ViewerContextMenu(webViewer, ids) {

    this.WebViewer = webViewer;
    this.Controls = ids;

    this.TranslucencyManager;
    this.ExplodeManager;

    this.NavCubeVisible = true;

    this.MenuItems;
}

ViewerContextMenu.prototype.GetControls = function () {
    var _this = this;
    this.MenuItems = [
        {
            text: "Hide",
            icon: "public/symbols/Hide.svg",
            click: function () {
                _this.OnHideClicked();
            }
        },
        {
            text: "Isolate",
            icon: "public/symbols/Isolate.svg",
            click: function () {
                _this.OnIsolateClicked();
            }
        },
        {
            text: "Area Select",
            icon: this.active? "public/symbols/Single Select.svg" : "public/symbols/Box Select.svg",
            active: false,
            click: function () {
                _this.OnAreaSelectClicked(this);
            }
        },
        {
            text: "Model Views",
            icon: "public/symbols/ModelView.svg",
            click: function () {
                _this.OnModelViewsClicked();
            }
        },
        {
            text: "Translucency",
            icon: "public/symbols/Transparency.svg",
            active: false,
            click: function () {
                if (!this.active) {
                    _this.OnStartTranslucencyClicked();
                }
                else {
                    _this.OnStopTranslucencyClicked();
                }

                this.active = !this.active;
            }
        },
        {
            text: "Zoom To Fit",
            icon: "public/symbols/ZoomFit.svg",
            click: function () {
                _this.OnZoomToFitClicked();
            }
        },
        {
            text: "Set Defaults",
            icon: "public/symbols/Set Defaults.svg",
            click: function () {
                _this.OnSetDefaultsClicked();
            }
        }
    ];

    return this.MenuItems;
}

ViewerContextMenu.prototype.OnAreaSelectClicked = function (itemData) {
    if (!itemData.active) {
        this.WebViewer.operatorManager.set(Communicator.OperatorId.AreaSelect, 1);
        itemData.text = "Select";
        itemData.icon = "public/symbols/Single Select.svg";
    }
    else {
        this.WebViewer.operatorManager.set(Communicator.OperatorId.Select, 1);
        itemData.text = "Area Select";
        itemData.icon = "public/symbols/Box Select.svg";
    }

    itemData.active = !itemData.active;
}

ViewerContextMenu.prototype.OnModelViewsClicked = function () {
    if (model.views) {
        closeAnyOpenMenu();
        model.views[model.currentTabId].displayMenu.ModelViewsMenu.Open();
    }
    else {
        if (model.currentCheck === "comparison") {
            // Close other menus open
            closeAnyOpenMenu();
            // for (var id in model.checks[model.currentCheck].menus) {
            //     var menus = model.checks[model.currentCheck].menus[id];
            //     for (var menuName in menus) {
            //         var menu = menus[menuName];
            //         if (menu.Active) {
            //             menu.Close();
            //             menu.HideAllOpenViewForms();
            //         }
            //     }
            // }

            var viewerId;
            switch (this.WebViewer._params.containerId) {
                case "compare1":
                    viewerId = "a";
                    break;
                case "compare2":
                    viewerId = "b";
                    break;
                case "compare3":
                    viewerId = "c";
                    break;
                case "compare4":
                    viewerId = "d";
                    break;
            }

            if (viewerId) {
                model.checks[model.currentCheck].menus[viewerId].ModelViewsMenu.Open();
                var sourceName;
                // if (model.currentCheck === "comparison") {
                if (viewerId == "a") {
                    sourceName = model.checks[model.currentCheck].reviewManager.ComparisonCheckManager.sources[0];
                }
                else if (viewerId == "b") {
                    sourceName = model.checks[model.currentCheck].reviewManager.ComparisonCheckManager.sources[1];
                }
                else if (viewerId == "c") {
                    sourceName = model.checks[model.currentCheck].reviewManager.ComparisonCheckManager.sources[2];
                }
                else if (viewerId == "d") {
                    sourceName = model.checks[model.currentCheck].reviewManager.ComparisonCheckManager.sources[3];
                }
                // }

                if (sourceName) {
                    DevExpress.ui.notify(
                        "Hovering menus enabled for " + "'" + sourceName + "'",
                        "success",
                        1500);
                }
            }
        }
        else if (model.currentCheck === "compliance") {
            model.checks[model.currentCheck].menus["a"].ModelViewsMenu.Open();

            var sourceName = model.checks[model.currentCheck].reviewManager.ComplianceCheckManager.source;
            DevExpress.ui.notify(
                "Hovering menus enabled for " + "'" + sourceName + "'",
                "success",
                1500);
        }
    }
}

ViewerContextMenu.prototype.OnZoomToFitClicked = function () {
    this.WebViewer.view.fitWorld();
}

ViewerContextMenu.prototype.OnSetDefaultsClicked = function () {
}


ViewerContextMenu.prototype.DisableMenuItems = function (items) {
    for (var i = 0; i < items.length; i++) {
        for (var j = 0; j < this.MenuItems.length; j++) {
            var menuItem = this.MenuItems[j];
            if (menuItem.text.toLowerCase() === items[i].toLowerCase()) {
                menuItem["disabled"] = true;
            }
        }
    }
}

ViewerContextMenu.prototype.ShowMenu = function (x, y) {

    var _this = this;
    if (!this.MenuItems) {
        this.GetControls();
    }

    var contextMenuDiv = document.getElementById("contextMenu");

    $("#contextMenu").dxList({
        dataSource: _this.MenuItems,
        hoverStateEnabled: true,
        focusStateEnabled: true,
        activeStateEnabled: false,
        width: 200,
        elementAttr: { class: "dx-theme-accent-as-background-color" },
        selectionMode: "single",
        onSelectionChanged: function (e) {
            if (e.component._selection.getSelectedItems().length > 0) {
                e.addedItems[0].click(e);
                e.component._selection.deselectAll();
            }
        },
        onContentReady(e) {
            contextMenuDiv.style.display = "block";

            var itemHeight = e.element[0].getElementsByClassName("dx-list-item").item(0).offsetHeight;
            const itemCount = e.component.option("items").length;
            e.component.option("height", itemHeight * itemCount);
        }
    });

    // position the context menu
    var menuHeight = contextMenuDiv.offsetHeight;
    var menuWidth = contextMenuDiv.offsetWidth;

    var viewerContainer = document.getElementById(this.WebViewer._params.containerId);

    // get mouse X position relative to viewerContainer
    var viewerX = x - $("#" + this.WebViewer._params.containerId).offset().left;

    // get mouse Y position relative to viewerContainer
    var viewerY = y - $("#" + this.WebViewer._params.containerId).offset().top;

    // adjust x
    if ((viewerContainer.offsetWidth - viewerX) < menuWidth) {
        x = x - menuWidth;
    }

    // adjust y
    if ((viewerContainer.offsetHeight - viewerY) < menuHeight) {
        y = y - menuHeight;
    }

    contextMenuDiv.style.top = y + "px";
    contextMenuDiv.style.left = x + "px";

    // close context menu, if mouse click is done outside
    document.onclick = function (e) {
        if (e.target.id !== 'contextMenu') {
            contextMenuDiv.style.display = 'none';
        }
    };


    return;
    ///////////////////
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
        item.onclick = function () {
            _this.OnStartExplodeClicked();
        }
        itemGroup.appendChild(item);
    }
    else {
        item = document.createElement("li");
        item.id = "stopExplode";
        item.innerText = "Stop Explode";
        item.onclick = function () {
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
        item.onclick = function () {
            _this.OnStartTranslucencyClicked();
        }
        itemGroup.appendChild(item);
    }
    else {
        item = document.createElement("li");
        item.id = "stopTranslucency";
        item.innerText = "Stop Translucency";
        item.onclick = function () {
            _this.OnStopTranslucencyClicked();
        }
        itemGroup.appendChild(item);
    }
    contextMenuDiv.appendChild(itemGroup);

    // 4th group
    item = document.createElement("hr");
    contextMenuDiv.appendChild(item);

    itemGroup = document.createElement("ul");
    itemGroup.id = "items";

    item = document.createElement("li");
    item.id = "changeBackground";
    item.innerText = "Change Background";
    item.onclick = function () {
        _this.OnChangeBackgroundClicked();
    }
    itemGroup.appendChild(item);
    contextMenuDiv.appendChild(itemGroup);

    contextMenuDiv.style.display = "block";

    // position the context menu
    var menuHeight = contextMenuDiv.offsetHeight;
    var menuWidth = contextMenuDiv.offsetWidth;

    var viewerContainer = document.getElementById(this.WebViewer._params.containerId);

    // get mouse X position relative to viewerContainer
    var viewerX = x - $("#" + this.WebViewer._params.containerId).offset().left;

    // get mouse Y position relative to viewerContainer
    var viewerY = y - $("#" + this.WebViewer._params.containerId).offset().top;

    // adjust x
    if ((viewerContainer.offsetWidth - viewerX) < menuWidth) {
        x = x - menuWidth;
    }

    // adjust y
    if ((viewerContainer.offsetHeight - viewerY) < menuHeight) {
        y = y - menuHeight;
    }

    contextMenuDiv.style.top = y + "px";
    contextMenuDiv.style.left = x + "px";

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

        if (model.currentTabId) {
            this.HideInCheck(selectedItem._nodeId);
        }
        else {
            this.HideInReview();
        }
    }
}

ViewerContextMenu.prototype.HideInCheck = function (nodeId) {
    // get highlighted row 
    var sourceManager = SourceManagers[model["currentTabId"]]
    // var row = sourceManager.ModelTree.SelectionManager.HighlightedComponentRow; 
    var selectedRows = [];

    var nodeList = sourceManager.ModelTree.GetNodeChildren(nodeId);
    nodeList.push(nodeId);
    //Add nodeId to hidden elements list
    sourceManager.HandleHiddenNodeIdsList(true, nodeList)

    if (nodeList.length > 0) {
        selectedRows = sourceManager.ModelTree.GetSelectedRowsFromNodeIds(sourceManager.HiddenNodeIds);
    }
    //Grey out the text of hidden element rows
    sourceManager.ModelTree.HighlightHiddenRows(true, selectedRows);
}

ViewerContextMenu.prototype.HideInReview = function () {
    var checkComponentRows = [];
    var row = model.getCurrentSelectionManager().GetHighlightedRow();
    if (!row) {
        return;
    }
    checkComponentRows.push(row);

    // get viewerInterface on which "hide" is called
    var viewerInterface = this.GetViewerInterface();

    viewerInterface.StoreHiddenResultId(checkComponentRows);

    var rows = [];
    for (var i = 0; i < checkComponentRows.length; i++) {
        var dataGrid = $(checkComponentRows[i]["tableId"]).dxDataGrid("instance");
        var rowIndex = dataGrid.getRowIndexByKey(checkComponentRows[i]["rowKey"]);
        var row = dataGrid.getRowElement(rowIndex)[0];
        rows.push(row);
    }
    model.checks[model.currentCheck]["reviewTable"].HighlightHiddenRows(true, rows);
}

ViewerContextMenu.prototype.GetViewerInterface = function () {
    var viewerContainer = this.WebViewer._params["containerId"];

    if (model.currentCheck == "comparison") {
        if (viewerContainer == model.checks[model.currentCheck].sourceAViewer.ViewerOptions[0]) {
            return model.checks[model.currentCheck].sourceAViewer;
        }

        if (viewerContainer == model.checks[model.currentCheck].sourceBViewer.ViewerOptions[0]) {
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

    // maintain hidden elements
    if (model.currentTabId &&
        model.currentTabId in SourceManagers) {
        var sourceManager = SourceManagers[model.currentTabId];
        sourceManager.HiddenNodeIds = [];

        var allNodeIds = Object.keys(sourceManager.NodeIdvsComponentIdList);
        for (var i = 0; i < Object.keys(allNodeIds).length; i++) {
            var nodeId = Number(allNodeIds[i]);
            if (!selectedNodes.includes(nodeId)) {
                sourceManager.HiddenNodeIds.push(nodeId);
            }
        }

        //Grey out the text of hidden element rows
        var selectedRows = sourceManager.ModelTree.GetSelectedRowsFromNodeIds(sourceManager.HiddenNodeIds);
        sourceManager.ModelTree.HighlightHiddenRows(true, selectedRows);

        // unhighlight the hidden rows made visible
        selectedRows = sourceManager.ModelTree.GetSelectedRowsFromNodeIds(selectedNodes);
        sourceManager.ModelTree.HighlightHiddenRows(false, selectedRows);
    }
}

ViewerContextMenu.prototype.OnShowAllClicked = function () {
    if (!this.WebViewer) {
        return;
    }

    var _this = this;
    this.WebViewer.model.setNodesVisibility([this.WebViewer.model.getAbsoluteRootNode()], true).then(function () {
        _this.WebViewer.view.fitWorld();
    });

    if (model.currentTabId) {
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

ViewerContextMenu.prototype.OnChangeBackgroundClicked = function () {
    openBackgroundColorPallete(this.WebViewer);
}

function openBackgroundColorPallete(viewer) {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("changeBGPopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "220px";
    popup.style.height = "110px";

    popup.style.top = ((window.innerHeight / 2) - 110) + "px";
    popup.style.left = ((window.innerWidth / 2) - 55) + "px";

    popup.style.padding = "5px";

    var verticalGradient = viewer.view.getBackgroundColor();

    document.getElementById("bottomColor").value = xCheckStudio.Util.rgbToHex(verticalGradient.bottom.r, verticalGradient.bottom.g, verticalGradient.bottom.b);
    document.getElementById("topColor").value = xCheckStudio.Util.rgbToHex(verticalGradient.top.r, verticalGradient.top.g, verticalGradient.top.b);

    document.getElementById("changeBGDefaultButton").onclick = function () {

        document.getElementById("topColor").value = "#000000";
        document.getElementById("bottomColor").value = "#F8F9F9";

        var backgroundTopColor = xCheckStudio.Util.hexToRgb("#000000");
        var backgroundBottomColor = xCheckStudio.Util.hexToRgb("#F8F9F9");
        viewer.view.setBackgroundColor(backgroundTopColor, backgroundBottomColor);
    }

    document.getElementById("changeBGOkButton").onclick = function () {

        var backgroundTopColor = xCheckStudio.Util.hexToRgb(document.getElementById("topColor").value);
        var backgroundBottomColor = xCheckStudio.Util.hexToRgb(document.getElementById("bottomColor").value);
        viewer.view.setBackgroundColor(backgroundTopColor, backgroundBottomColor);
    };

    document.getElementById("changeBGCancelButton").onclick = function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("changeBGPopup");

        overlay.style.display = 'none';
        popup.style.display = 'none';
    };
}
