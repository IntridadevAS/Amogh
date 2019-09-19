/* 3D viewer interface */
function Review3DViewerInterface(viewerOptions,
    componentIdVsComponentData,
    nodeIdVsComponentData) {
    // call super constructor
    ReviewViewerInterface.call(this, viewerOptions,
        componentIdVsComponentData,
        nodeIdVsComponentData);
}
// assign SelectionManager's method to this class
Review3DViewerInterface.prototype = Object.create(ReviewViewerInterface.prototype);
Review3DViewerInterface.prototype.constructor = Review3DViewerInterface;


Review3DViewerInterface.prototype.Is3DViewer = function () {
    return true;
}

Review3DViewerInterface.prototype.setupViewer = function (width, height) {

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
    viewerContainer.style.width = width;//"550px"
    viewerContainer.style.height = height;//"250px"
    // create highlight manager
    this.highlightManager = new HighlightManager(viewer, this.ComponentIdVsComponentData, this.NodeIdVsComponentData);
}

Review3DViewerInterface.prototype.bindEvents = function (viewer) {

    var _this = this;

    viewer.setCallbacks({
        firstModelLoaded: function () {
            viewer.view.fitWorld();
            viewer.resizeCanvas();

            // create nav cube
            showNavigationCube(viewer);

            _this.highlightComponentsfromResult();

            //activate context menu            
            var ids = _this.GetControlIds();

            _this.ReviewViewerContextMenu = new ViewerContextMenu(viewer, ids);
            _this.ReviewViewerContextMenu.Init();
        },
        selectionArray: function (selections) {
            if (selections.length === 0
                && _this.selectedNodeId) {
                _this.unHighlightAll();
                return;
            }

            for (var i = 0; i < selections.length; i++) {
                var selection = selections[i];
                //var sel = selection.getSelection();

                _this.onSelection(selection);
            }
        },
    });

    window.onresize = function () {
        viewer.resizeCanvas();
    };
};

Review3DViewerInterface.prototype.GetControlIds = function () {
    var ids = {};
    if (this.Viewer._params.containerId === "compare1") {

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
    else if (this.Viewer._params.containerId === "compare2") {

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
    else if (this.Viewer._params.containerId === "compare3") {
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
    else if (this.Viewer._params.containerId === "compare4") {
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
    else if (this.Viewer._params.containerId === "compliance1") {
        var explode = {};
        explode["slider"] = "explodeSlider5"
        explode["output"] = "explodeValue5";
        explode["overlay"] = "explodeOverlay5";
        ids["explode"] = explode;

        var translucency = {};
        translucency["slider"] = "translucencySlider5"
        translucency["output"] = "translucencyValue5";
        translucency["overlay"] = "translucencyOverlay5";
        ids["translucency"] = translucency;
    }

    return ids;
}

Review3DViewerInterface.prototype.ResizeViewer = function () {
    this.Viewer.resizeCanvas();
}

Review3DViewerInterface.prototype.setViewerBackgroundColor = function () {
    var backgroundTopColor = xCheckStudio.Util.hexToRgb("#000000");
    var backgroundBottomColor = xCheckStudio.Util.hexToRgb("#F8F9F9");

    this.Viewer.view.setBackgroundColor(backgroundTopColor, backgroundBottomColor);

    // set back face visibility
    this.Viewer.view.setBackfacesVisible(true);
}

Review3DViewerInterface.prototype.highlightComponentsfromResult = function () {

    for (var id in this.NodeIdStatusData) {
        var component = this.NodeIdStatusData[id];
        this.ChangeComponentColor(component, false, undefined);
    }
}

Review3DViewerInterface.prototype.unHighlightAll = function () {
    //var _this = this;

    var reviewManager = model.getCurrentReviewManager();
    //_this.highlightManager.setViewOrientation(Communicator.ViewOrientation.Front);
    this.selectedNodeId = undefined;
    this.selectedComponentId = undefined;

    var sourceAReviewViewerInterface = model.checks["comparison"]["sourceAViewer"];
    var sourceBReviewViewerInterface = model.checks["comparison"]["sourceBViewer"];

    // highlight corresponding component in another viewer
    if (this.ViewerOptions[0] === Comparison.ViewerAContainer) {
        if (sourceBReviewViewerInterface !== undefined) {
            sourceBReviewViewerInterface.unHighlightComponent();

            sourceBReviewViewerInterface.selectedNodeId = undefined;
            sourceBReviewViewerInterface.selectedComponentId = undefined;
        }
        else if (this.SelectedComponentRowFromSheetB !== undefined) {
            // reset color of row
            var rowIndex = this.SelectedComponentRowFromSheetB.rowIndex;
            obj = Object.keys(reviewManager.checkStatusArrayB)
            var status = reviewManager.checkStatusArrayB[obj[0]][rowIndex]
            model.getCurrentSelectionManager().ChangeBackgroundColor(this.SelectedComponentRowFromSheetB, status);
            this.SelectedComponentRowFromSheetB = undefined;
        }
    }
    else if (this.ViewerOptions[0] === Comparison.ViewerBContainer) {
        if (sourceAReviewViewerInterface !== undefined) {
            sourceAReviewViewerInterface.unHighlightComponent();

            sourceAReviewViewerInterface.selectedNodeId = undefined;
            sourceAReviewViewerInterface.selectedComponentId = undefined;
        }
        else if (this.SelectedSheetRow !== undefined) {

            // reset color of row
            var rowIndex = this.SelectedSheetRow.rowIndex;
            obj = Object.keys(reviewManager.checkStatusArrayA)
            var status = reviewManager.checkStatusArrayA[obj[0]][rowIndex]
            model.getCurrentSelectionManager().ChangeBackgroundColor(this.SelectedSheetRow, status);
            this.SelectedSheetRow = undefined;
        }
    }

    // restore highlightcolor of selected row in main review table
    if (model.getCurrentSelectionManager().HighlightedCheckComponentRow) {
        model.getCurrentSelectionManager().RemoveHighlightColor(model.getCurrentSelectionManager().HighlightedCheckComponentRow);
        model.getCurrentSelectionManager().HighlightedCheckComponentRow = undefined;

        // clear detailed info table
        var viewerContainer = "#" + reviewManager.DetailedReviewTableContainer;
        // clear previous grid
        if ($(viewerContainer).data("igGrid") != null) {
            $(viewerContainer).igGrid("destroy");
        }
    }
}

Review3DViewerInterface.prototype.onSelection = function (selectionEvent) {
    var selection = selectionEvent.getSelection();

    if (!selection.isNodeSelection() ||
        this.selectedNodeId === selection.getNodeId()) {
        return;
    }

    this.selectedNodeId = selection.getNodeId();
    var model3D = this.Viewer.model;
    if (!model3D.isNodeLoaded(this.selectedNodeId)) {
        this.unHighlightComponent();
        this.unHighlightAll();

        return;
    }

    // select valid node
    this.SelectValidNode();

    if (!this.selectedNodeId ||
        model3D.getNodeType(this.selectedNodeId) === Communicator.NodeType.BodyInstance ||
        model3D.getNodeType(this.selectedNodeId) === Communicator.NodeType.Unknown) {
        return;
    }

    var reviewManager = model.getCurrentReviewManager();

    // get check component id
    var checkComponentData = reviewManager.GetCheckComponetDataByNodeId(this.ViewerOptions[0], this.selectedNodeId);
    // if (this.ViewerOptions[0] === ViewerAContainer) {

    //     if (reviewManager.SourceANodeIdvsCheckComponent !== undefined &&
    //         this.selectedNodeId in reviewManager.SourceANodeIdvsCheckComponent) {
    //         checkComponentData = reviewManager.SourceANodeIdvsCheckComponent[this.selectedNodeId];
    //     }
    //     else if (reviewManager.SourceNodeIdvsCheckComponent !== undefined &&
    //         this.selectedNodeId in reviewManager.SourceNodeIdvsCheckComponent) {
    //         checkComponentData = reviewManager.SourceNodeIdvsCheckComponent[this.selectedNodeId];
    //     }
    // }
    // else if (this.ViewerOptions[0] === ViewerBContainer) {
    //     if (reviewManager.SourceBNodeIdvsCheckComponent !== undefined &&
    //         this.selectedNodeId in reviewManager.SourceBNodeIdvsCheckComponent) {
    //         checkComponentData = reviewManager.SourceBNodeIdvsCheckComponent[this.selectedNodeId];          
    //     }
    //     else if (reviewManager.SourceNodeIdvsCheckComponent !== undefined &&
    //         this.selectedNodeId in reviewManager.SourceNodeIdvsCheckComponent) {
    //         checkComponentData = reviewManager.SourceNodeIdvsCheckComponent[this.selectedNodeId];
    //     }
    // }

    if (!checkComponentData) {
        return;
    }

    var reviewRow = this.GetReviewComponentRow(checkComponentData);
    if (!reviewRow) {
        this.unHighlightComponent();
        this.unHighlightAll();

        return;
    }

    // component group id which is container div for check components table of given row
    var containerDiv = reviewManager.GetReviewTableId(reviewRow);

    var data = $("#" + containerDiv).data("igGrid").dataSource.dataView();
    var rowData = data[reviewRow.rowIndex];

    reviewManager.OnCheckComponentRowClicked(rowData, containerDiv);

    var reviewTable = reviewManager.GetReviewTable(reviewRow);
    model.getCurrentSelectionManager().ScrollToHighlightedCheckComponentRow(reviewTable,
        reviewRow,
        reviewManager.MainReviewTableContainer);
};

Review3DViewerInterface.prototype.unHighlightComponent = function () {

    this.selectedNodeId = undefined;
    this.highlightManager.clearSelection();
    this.Viewer.view.fitWorld();
    // this.Viewer.view.setViewOrientation(Communicator.ViewOrientation.Front, Communicator.DefaultTransitionDuration);

}

Review3DViewerInterface.prototype.menu = function (x, y) {
    var i = document.getElementById("menu").style;
    i.top = y + "px";
    i.left = x + "px";
    i.visibility = "visible";
    i.opacity = "1";
}

Review3DViewerInterface.prototype.ChangeComponentColor = function (component, override, parentComponent) {
    var status = component.Status;
    //var nodeId = component.NodeId;
    if (status !== null) {
        this.highlightManager.changeComponentColorInViewer(component, override, parentComponent);
    }

    var children = component.Children;
    for (var id in children) {
        var child = children[id];

        // take care of don't color components
        if (child.SubClass.toLowerCase() in this.DontColorComponents) {
            var dontColorComponent = this.DontColorComponents[child.SubClass.toLowerCase()];
            if (child.MainClass.toLowerCase() === dontColorComponent["mainClass"] &&
                component.MainClass.toLowerCase() === dontColorComponent["parentMainClass"]) {
                continue;
            }
        }

        // take care of color overriding from status components
        var overrideColorWithSeverityPreference = false;
        if (component.MainClass.toLowerCase() in this.OverrideSeverityColorComponents) {
            var overrideSeverityColorComponent = this.OverrideSeverityColorComponents[component.MainClass.toLowerCase()];
            if (overrideSeverityColorComponent.includes(child.MainClass.toLowerCase())) {
                overrideColorWithSeverityPreference = true;
            }
        }

        this.ChangeComponentColor(child, overrideColorWithSeverityPreference, component);
    }
}

Review3DViewerInterface.prototype.highlightComponent = function (nodeIdString) {

    var nodeId = Number(nodeIdString);
    if (!nodeIdString ||
        nodeId === NaN) {
        this.unHighlightComponent();
        return;
    }

    this.selectedNodeId = nodeId;

    this.highlightManager.highlightNodeInViewer(nodeId);
};

Review3DViewerInterface.prototype.SelectValidNode = function () {
    if (this.IsNodeInCheckResults(this.selectedNodeId)) {
        return;
    }

    var model = this.Viewer.model;
    while (this.selectedNodeId) {
        this.selectedNodeId = model.getNodeParent(this.selectedNodeId);

        if (this.IsNodeInCheckResults(this.selectedNodeId)) {
            this.highlightManager.highlightNodeInViewer(this.selectedNodeId);
            break;
        }
    }
}

Review3DViewerInterface.prototype.IsNodeInCheckResults = function (node) {

    var nodeIdvsCheckComponent;
    // if comparison
    if (this.ViewerOptions[0] === Comparison.ViewerAContainer) {
        nodeIdvsCheckComponent = model.getCurrentReviewManager().SourceANodeIdvsCheckComponent;
    }
    else if (this.ViewerOptions[0] === Comparison.ViewerBContainer) {
        nodeIdvsCheckComponent = model.getCurrentReviewManager().SourceBNodeIdvsCheckComponent;
    }

    // if compliance
    if (!nodeIdvsCheckComponent &&
        model.getCurrentReviewManager().SourceNodeIdvsCheckComponent) {
        nodeIdvsCheckComponent = model.getCurrentReviewManager().SourceNodeIdvsCheckComponent;
    }

    if (!nodeIdvsCheckComponent) {
        return false;
    }

    if (node in nodeIdvsCheckComponent) {
        return true;
    }

    return false;
}

/* This function returns the comparison check 
    component row for given check component data */
Review3DViewerInterface.prototype.GetReviewComponentRow = function (checkcComponentData) {
    var componentsGroupName = checkcComponentData["MainClass"];
    var mainReviewTableContainer = document.getElementById(model.getCurrentReviewManager().MainReviewTableContainer);
    if (!mainReviewTableContainer) {
        return undefined;
    }

    //var doc = mainReviewTableContainer.getElementsByClassName("collapsible");
    var doc = mainReviewTableContainer.getElementsByClassName("accordion");
    for (var i = 0; i < doc.length; i++) {

        if (doc[i].innerHTML !== componentsGroupName) {
            continue;
        }
        var nextSibling = doc[i].nextSibling;

        var siblingCount = nextSibling.childElementCount;
        for (var j = 0; j < siblingCount; j++) {
            var child = doc[i].nextSibling.children[j];
            var childRows = child.getElementsByTagName("tr");
            for (var k = 2; k < childRows.length; k++) {

                var childRow = childRows[k];
                // var childRowColumns = childRow.getElementsByTagName("td");
                var data = $("#" + componentsGroupName + "_" + model.getCurrentReviewManager().MainReviewTableContainer).data("igGrid").dataSource.dataView();
                var rowData = data[childRow.rowIndex];
                var checkComponentId;

                checkComponentId = rowData.ID;
                // if (childRowColumns.length === Object.keys(ComparisonColumns).length) {
                //     checkComponentId = childRowColumns[ComparisonColumns.ResultId].innerText
                // }
                // else if (childRowColumns.length === Object.keys(ComplianceColumns).length) {
                //     checkComponentId = childRowColumns[ComplianceColumns.ResultId].innerText
                // }
                // else {
                //     continue;
                // }

                //var checkComponentId = childRowColumns[ComparisonColumns.ResultId].innerText
                if (checkComponentId == checkcComponentData["Id"]) {

                    // open collapsible area
                    if (nextSibling.style.display != "block") {
                        nextSibling.style.display = "block";
                    }

                    if (model.getCurrentSelectionManager().HighlightedCheckComponentRow) {
                        model.getCurrentSelectionManager().RemoveHighlightColor(model.getCurrentSelectionManager().HighlightedCheckComponentRow);
                    }

                    // highlight selected row
                    model.getCurrentSelectionManager().ApplyHighlightColor(childRow)
                    model.getCurrentSelectionManager().HighlightedCheckComponentRow = childRow;

                    // scroll to table
                    mainReviewTableContainer.scrollTop = doc[i].offsetTop;

                    //break;
                    return childRow;
                }
            }
        }
        //}
    }

    return undefined;
}