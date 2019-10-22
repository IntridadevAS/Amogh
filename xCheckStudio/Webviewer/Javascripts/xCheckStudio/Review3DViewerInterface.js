/* 3D viewer interface */
function Review3DViewerInterface(viewerOptions,
    componentIdVsComponentData,
    nodeIdVsComponentData,
    source) {
    // call super constructor
    ReviewViewerInterface.call(this, viewerOptions,
        componentIdVsComponentData,
        nodeIdVsComponentData,
        source);
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
    
    var reviewManager = model.getCurrentReviewManager();
    
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

    // restore highlightcolor of highlightedRow row in main review table
    var highlightedRow = model.getCurrentSelectionManager().GetHighlightedRow();
    if (!highlightedRow) {
        return;
    }

    if (highlightedRow) {
        model.getCurrentSelectionManager().RemoveHighlightColor(highlightedRow["row"]);
        model.getCurrentSelectionManager().SetHighlightedRow(undefined);

        // clear detailed info table
        // var viewerContainer = "#" + reviewManager.DetailedReviewTableContainer;
        // clear previous grid
        model.getCurrentDetailedInfoTable().Destroy();
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
    //var resultViewer = model.getCurrentResultViewer(this.DataSource);
    if (!reviewManager) {
        var browser = model.getModelBrowser(this.DataSource);
        if (browser) {
            reviewRowData = browser.HighlightBrowserComponentRow(this.selectedNodeId);
        }

        return;
    }

    // get check component id
    var checkComponentData = reviewManager.GetCheckComponetDataByNodeId(this.ViewerOptions[0], this.selectedNodeId);
    if (!checkComponentData) {
        return;
    }

    var reviewRowData;
    // if (model.getCurrentReviewManager()) {
        reviewRowData = this.GetReviewComponentRow(checkComponentData);
    // }
    // else    
    // {
    //     var browser = model.getModelBrowser(this.DataSource);
    //     if(browser)
    //     {
    //         reviewRowData = browser.GetBrowserComponentRow(checkComponentData);
    //     }
    // }
    if (!reviewRowData) {
        this.unHighlightComponent();
        this.unHighlightAll();

        return;
    }
    var reviewRow = reviewRowData["row"];

    // component group id which is container div for check components table of given row    
    var containerDiv = reviewRowData["tableId"];

    var dataGrid = $(containerDiv).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();
    var rowData = data[reviewRow.rowIndex];

    this.HighlightMatchedComponent(containerDiv, rowData);

    model.getCurrentDetailedInfoTable().populateDetailedReviewTable(rowData, containerDiv.replace("#", ""));

    // scroll to rowElement
    // dataGrid.getScrollable().scrollTo(reviewRow.offsetTop - reviewRow.offsetHeight);
    // document.getElementById(model.getCurrentReviewManager().MainReviewTableContainer).scrollTop = reviewRow.offsetTop - reviewRow.offsetHeight
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

    var reviewManager = model.getCurrentReviewManager();    

    var nodeIdvsCheckComponent;
    if(reviewManager)
    {
        nodeIdvsCheckComponent = reviewManager.GetNodeIdvsComponentData(this.ViewerOptions[0]);
    }
    else
    {
        var browsers = model.getModelBrowsers();
        if (this.DataSource in browsers) {
            nodeIdvsCheckComponent = browsers[this.DataSource].NodeIdvsCheckComponent;
        }
    }

    // // if comparison
    // if (this.ViewerOptions[0] === Comparison.ViewerAContainer) {

    //     if (reviewManager) {
    //         nodeIdvsCheckComponent = reviewManager.SourceANodeIdvsCheckComponent;
    //     }
    //     else if (this.DataSource in browsers) {
    //         nodeIdvsCheckComponent = browsers[this.DataSource].NodeIdvsCheckComponent;
    //     }
    // }
    // else if (this.ViewerOptions[0] === Comparison.ViewerBContainer) {
    //     if (reviewManager) {
    //         nodeIdvsCheckComponent = reviewManager.SourceBNodeIdvsCheckComponent;
    //     }
    //     else if (this.DataSource in browsers) {
    //         nodeIdvsCheckComponent = browsers[this.DataSource].NodeIdvsCheckComponent;
    //     }
    // }

    // // if compliance
    // if (!nodeIdvsCheckComponent &&
    //     reviewManager.SourceNodeIdvsCheckComponent) {
    //     if (reviewManager) {
    //         nodeIdvsCheckComponent = reviewManager.SourceNodeIdvsCheckComponent;
    //     }
    //     else if (this.DataSource in browsers) {
    //         nodeIdvsCheckComponent = browsers[this.DataSource].NodeIdvsCheckComponent;
    //     }
    // }

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
Review3DViewerInterface.prototype.GetReviewComponentRow = function (checkComponentData) {
    var componentsGroupName = checkComponentData["MainClass"];
    // var mainReviewTableContainer = document.getElementById(model.getCurrentReviewManager().MainReviewTableContainer);
    // if (!mainReviewTableContainer) {
    //     return undefined;
    // }

    var checkTableIds = model.getCurrentReviewTable().CheckTableIds;
    for(var groupId in checkTableIds) {
        if (!checkTableIds[groupId].toLowerCase().includes(componentsGroupName.toLowerCase())) {
            continue;
        }
        else {

            var dataGrid =  $(checkTableIds[groupId]).dxDataGrid("instance");
            var rows = dataGrid.getVisibleRows();

            for(var i = 0; i < rows.length; i++) {
                if(rows[i].rowType == "data") {
                    var rowObj = rows[i];
                    var rowData = rowObj.data
                    var checkComponentId;

                    checkComponentId = rowData.ID;
                    if (checkComponentId == checkComponentData["Id"]) {
                        var highlightedRow = model.getCurrentSelectionManager().GetHighlightedRow();
                        if (highlightedRow) {
                            model.getCurrentSelectionManager().RemoveHighlightColor(highlightedRow["row"]);
                        }                        
                           
                        // highlight selected row
                        var row = dataGrid.getRowElement(rowObj.rowIndex)
                        model.getCurrentSelectionManager().ApplyHighlightColor(row[0])
                        model.getCurrentSelectionManager().SetHighlightedRow({
                            "row": row[0],
                            "tableId": checkTableIds[groupId],
                            "rowIndex": row[0].rowIndex
                        });  
                           
                        //Expand Accordion and Scroll to Row
                        model.getCurrentReviewTable().ExpandAccordionScrollToRow(row[0], checkComponentData.MainClass);

                        //break;
                        return {"row" : row[0], "tableId" : checkTableIds[groupId]};
                    }
                }
            }
        }
    }

    return undefined;
}

Review3DViewerInterface.prototype.Destroy = function (viewerContainer) {
    document.getElementById(viewerContainer).innerHTML = "";
}