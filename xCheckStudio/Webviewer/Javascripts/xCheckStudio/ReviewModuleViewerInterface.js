
var ReviewModuleViewerInterface = function (viewerOptions) {

    this.ViewerOptions = viewerOptions;
    this.selectedNodeId = null;
    this.selectedComponentId = null;

    ReviewModuleViewerInterface.prototype.setupViewer = function () {
        // create and start viewer
        var viewer = new Communicator.WebViewer({
            containerId: viewerOptions[0], //"myContainer",          
            endpointUri: viewerOptions[1], //"uploads/scs/bearingassembly.scs"	
        });

        viewer.start();
        // create highlight manager
        this.highlightManager = new HighlightManager(viewer);
        if (viewer._params.containerId === "viewerContainer2") {
            this.highlightManager.nodeIdVsComponentData = sourceBNodeIdVsComponentData;
            this.highlightManager.componentIdVsComponentData = sourceAComponentIdVsComponentData;           
        }
        else if (viewer._params.containerId === "viewerContainer1") {                    
            this.highlightManager.nodeIdVsComponentData = sourceANodeIdVsComponentData;
            this.highlightManager.componentIdVsComponentData = sourceAComponentIdVsComponentData;            
        }
       
        this.Viewer = viewer;
        this.bindEvents(viewer);
        this.setViewerBackgroundColor();
    }

    ReviewModuleViewerInterface.prototype.bindEvents = function (viewer) {

        var _this = this;

        viewer.setCallbacks({
            firstModelLoaded: function () {
                viewer.view.fitWorld();
            },
            selectionArray: function (selections) {
                for (var _i = 0, selections_1 = selections; _i < selections_1.length; _i++) {
                    var selection = selections_1[_i];

                    var sel = selection.getSelection();

                    if (_this._selectedNodeId !== sel.getNodeId()) {
                        _this.onSelection(selection);
                    }
                }
            },

        });
    };

    ReviewModuleViewerInterface.prototype.setViewerBackgroundColor = function () {
        var backgroundTopColor = xCheckStudio.Util.hexToRgb("#000000");
        var backgroundBottomColor = xCheckStudio.Util.hexToRgb("#F8F9F9");

        this.Viewer.view.setBackgroundColor(backgroundTopColor, backgroundBottomColor);
    }

    ReviewModuleViewerInterface.prototype.highlightComponent = function (componentIdentifier) {
        var nodeId = this.highlightManager.getNodeIdFromComponentIdentifier(componentIdentifier);
        if (nodeId === undefined) {
            return;
        }

        this.highlightManager.highlightNodeInViewer(nodeId);
        if (this.Viewer._params.containerId == "viewerContainer2") {
            reviewModuleViewerInterface1.highlightManager.highlightNodeInViewer(nodeId);
        }
        else if (this.Viewer._params.containerId == "viewerContainer1") {
            reviewModuleViewerInterface2.highlightManager.highlightNodeInViewer(nodeId);
        }
        

        this._selectedNodeId = nodeId;
    };

    ReviewModuleViewerInterface.prototype.onSelection = function (selectionEvent) {
        var selection = selectionEvent.getSelection();
        if (selection.isNodeSelection()) {
            this.selectedNodeId = selection.getNodeId();
            var model = this.Viewer.model;
            if (model.isNodeLoaded(this.selectedNodeId)) {
                // If we selected a body, then get the assembly node that holds it (loadSubtreeFromXXX() works on assembly nodes)
                if (model.getNodeType(this.selectedNodeId) === Communicator.NodeType.BodyInstance) {
                    var parent_1 = model.getNodeParent(this.selectedNodeId);
                    if (parent_1 !== null) {
                        this.selectedNodeId = parent_1;
                    }
                }

                if (model.getNodeType(this.selectedNodeId) !== Communicator.NodeType.BodyInstance) {
                    let data = this.highlightManager.nodeIdVsComponentData[this.selectedNodeId];
                    if (data != undefined) {
                        // if (checkManager != undefined) {
                        // get component identifier
                        var componentIdentifier = data["Name"];
                        if (data.MainComponentClass === "PipingNetworkSegment") {
                            componentIdentifier += "_" + data["Source"] + "_" + data["Destination"] + "_" + data["OwnerId"];
                        }
                        if (this.selectedComponentId === data.NodeId) {
                            return;
                        }

                        // highlight corresponding component in review table 
                        this.HighlightReviewComponent(data);

                        // highlight corresponding component in model browser table
                        // this._modelTree.HighlightModelBrowserRow(componentIdentifier);

                        if (this.Viewer._params.containerId == "viewerContainer2") {
                            this.highlightComponent(componentIdentifier);
                            //    xCheckStudioInterface1._modelTree.HighlightModelBrowserRow(componentIdentifier);
                        }
                        else if (this.Viewer._params.containerId == "viewerContainer1") {
                            this.highlightComponent(componentIdentifier);
                            //    xCheckStudioInterface2._modelTree.HighlightModelBrowserRow(componentIdentifier);
                        }
                    }
                }
            }
        }
    };

    ReviewModuleViewerInterface.prototype.HighlightReviewComponent = function (data) {
        var componentsGroupName = data["MainComponentClass"];
        var doc = document.getElementsByClassName("collapsible");
        for (var i = 0; i < doc.length; i++) {
            if (componentsGroupName.localeCompare(doc[i].innerHTML) == 0) {
                var nextSibling = doc[i].nextSibling;
                if (nextSibling.style.display != "block") {
                    nextSibling.style.display = "block";
                }
                var siblingCount = nextSibling.childElementCount;
                for (var j = 0; j < siblingCount; j++) {
                    var child = doc[i].nextSibling.children[j];
                    var childRows = child.getElementsByTagName("tr");
                    for (var k = 0; k < childRows.length; k++) {
                        
                        var childRow = childRows[k];
                        var childRowColumns = childRow.getElementsByTagName("td");
                        if (childRowColumns.length > 0) {
                            if (childRowColumns[0].innerHTML === data.Name) {
                                var componentIdentifier = data.Name;
                                var rowIdentifier = childRowColumns[0].innerHTML
                                if (data.MainComponentClass === "PipingNetworkSegment") {
                                    componentIdentifier += "_" + data.Source + "_" + data.Destination + "_" + data.OwnerId;
                                    rowIdentifier += "_" + childRowColumns[3].innerHTML + "_"
                                        + childRowColumns[4].innerHTML + "_" + childRowColumns[5].innerHTML;
                                    if (rowIdentifier === componentIdentifier) {
                                        if (reviewManager.SelectedComponentRow) {
                                            reviewManager.RestoreBackgroundColor(reviewManager.SelectedComponentRow);
                                        }
        
                                        reviewManager.ChangeBackgroundColor(childRow)
                                        reviewManager.populateDetailedReviewTable(childRow);
                                        reviewManager.SelectedComponentRow = childRow;
        
                                        break;
                                    }

                                }
                                if (reviewManager.SelectedComponentRow) {
                                    reviewManager.RestoreBackgroundColor(reviewManager.SelectedComponentRow);
                                }

                                reviewManager.ChangeBackgroundColor(childRow)
                                reviewManager.populateDetailedReviewTable(childRow);
                                reviewManager.SelectedComponentRow = childRow;
                            }
                        }
                    }
                }
            }
        }
    }
}

