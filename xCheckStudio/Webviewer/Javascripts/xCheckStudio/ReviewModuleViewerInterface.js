
var ReviewModuleViewerInterface = function (viewerOptions,
    componentIdVsComponentData,
    nodeIdVsComponentData,
    reviewManager) {

    this.ViewerOptions = viewerOptions;
    this.selectedNodeId = null;
    this.selectedComponentId = null;

    this.ComponentIdVsComponentData = componentIdVsComponentData;
    this.NodeIdVsComponentData = nodeIdVsComponentData;
    this.ComponentIdStatusData = {};

    this.ReviewManager = reviewManager;

    ReviewModuleViewerInterface.prototype.setupViewer = function (width, height) {

        // create and start viewer
        var viewer = new Communicator.WebViewer({
            containerId: viewerOptions[0], //"myContainer",          
            endpointUri: viewerOptions[1], //"uploads/scs/bearingassembly.scs"	
        });

        viewer.start();
        this.Viewer = viewer;
        this.bindEvents(viewer);
        this.setViewerBackgroundColor();

        var viewerContainer = document.getElementById(viewerOptions[0]);
        viewerContainer.style.width = width;//"550px"
        viewerContainer.style.height = height;//"250px"
        // create highlight manager
        this.highlightManager = new HighlightManager(viewer, this.ComponentIdVsComponentData, this.NodeIdVsComponentData);
    }

    ReviewModuleViewerInterface.prototype.highlightComponentsfromResult = function () {
        for (var componentId in this.ComponentIdStatusData) {
            if (this.ComponentIdStatusData.hasOwnProperty(componentId)) {

                var status = this.ComponentIdStatusData[componentId][1];

                // set the component row color in main review table     
                var hexColor = xCheckStudio.Util.getComponentHexColor(status);
                if (hexColor === undefined) {
                    continue;
                }

                this.highlightManager.changeComponentColorInViewer(componentId, status);
            }
        }
    }

    ReviewModuleViewerInterface.prototype.unHighlightAll = function () {
        var _this = this;

        _this.highlightManager.setViewOrientation(Communicator.ViewOrientation.Front);
        _this.selectedNodeId = undefined;
        _this.selectedComponentId = undefined;
        // highlight corresponding component in another viewer
        if (_this.ViewerOptions[0] === "viewerContainer1" &&
            _this.ReviewManager.SourceBReviewModuleViewerInterface !== undefined) {
            _this.ReviewManager.SourceBReviewModuleViewerInterface.unHighlightComponent();

            _this.ReviewManager.SourceBReviewModuleViewerInterface.highlightManager.setViewOrientation(Communicator.ViewOrientation.Front);

            _this.ReviewManager.SourceBReviewModuleViewerInterface.selectedNodeId = undefined;
            _this.ReviewManager.SourceBReviewModuleViewerInterface.selectedComponentId = undefined;
        }
        else if (_this.ViewerOptions[0] === "viewerContainer2" &&
            _this.ReviewManager.SourceAReviewModuleViewerInterface !== undefined) {
            _this.ReviewManager.SourceAReviewModuleViewerInterface.unHighlightComponent();

            _this.ReviewManager.SourceAReviewModuleViewerInterface.highlightManager.setViewOrientation(Communicator.ViewOrientation.Front);

            _this.ReviewManager.SourceAReviewModuleViewerInterface.selectedNodeId = undefined;
            _this.ReviewManager.SourceAReviewModuleViewerInterface.selectedComponentId = undefined;
        }

        // restore highlightcolor of selected row in main review table
        if (_this.ReviewManager.SelectedComponentRow) {
            _this.ReviewManager.RestoreBackgroundColor(_this.ReviewManager.SelectedComponentRow);
            _this.ReviewManager.SelectedComponentRow = undefined;
        }
    }

    ReviewModuleViewerInterface.prototype.bindEvents = function (viewer) {

        var _this = this;

        viewer.setCallbacks({
            firstModelLoaded: function () {
                viewer.view.fitWorld();

                _this.highlightComponentsfromResult();
            },
            selectionArray: function (selections) {
                if (selections.length === 0
                    && _this.selectedNodeId) {
                    _this.unHighlightAll();
                    return;
                }

                for (var _i = 0, selections_1 = selections; _i < selections_1.length; _i++) {
                    var selection = selections_1[_i];

                    var sel = selection.getSelection();

                    if (_this.selectedNodeId !== sel.getNodeId()) {
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
            this.unHighlightComponent();
            return;
        }

        this.selectedNodeId = nodeId;

        this.highlightManager.highlightNodeInViewer(nodeId);
    };

    ReviewModuleViewerInterface.prototype.unHighlightComponent = function () {
        this.highlightManager.clearSelection();
        this.selectedNodeId = undefined;
    }

    ReviewModuleViewerInterface.prototype.onSelection = function (selectionEvent) {
        var selection = selectionEvent.getSelection();
        if (selection.isNodeSelection()) {
            this.selectedNodeId = selection.getNodeId();
            var model = this.Viewer.model;
            if (model.isNodeLoaded(this.selectedNodeId)) {
                // If we selected a body, then get the assembly node that holds it (loadSubtreeFromXXX() works on assembly nodes)
                if (model.getNodeType(this.selectedNodeId) === Communicator.NodeType.BodyInstance ||
                    model.getNodeType(this.selectedNodeId) === Communicator.NodeType.Unknown) {
                    var parent_1 = model.getNodeParent(this.selectedNodeId);
                    if (parent_1 !== null) {
                        this.selectedNodeId = parent_1;
                        this.highlightManager.highlightNodeInViewer(parent_1);
                    }
                }

                if (model.getNodeType(this.selectedNodeId) !== Communicator.NodeType.BodyInstance ||
                    model.getNodeType(this.selectedNodeId) !== Communicator.NodeType.Unknown) {
                    let data = this.highlightManager.NodeIdVsComponentData[this.selectedNodeId];
                    if (data != undefined) {

                        var componentIdentifier = data["Name"];
                        if (data.MainComponentClass === "PipingNetworkSegment") {
                            componentIdentifier += "_" + data["Source"] + "_" + data["Destination"] + "_" + data["OwnerId"];
                        }
                        else  if (data.MainComponentClass.toLowerCase() === "equipment") {
                            componentIdentifier += "_" + data["OwnerHandle"] ;
                        }

                        if (this.selectedComponentId === data.NodeId) {
                            return;
                        }

                        // highlight corresponding component in review table 
                        this.HighlightReviewComponent(data);

                        // highlight corresponding component in another viewer
                        if (this.ViewerOptions[0] === "viewerContainer1" &&
                            this.ReviewManager.SourceBReviewModuleViewerInterface !== undefined) {
                            this.ReviewManager.SourceBReviewModuleViewerInterface.highlightComponent(componentIdentifier);
                        }
                        else if (this.ViewerOptions[0] === "viewerContainer2" &&
                            this.ReviewManager.SourceAReviewModuleViewerInterface !== undefined) {
                            this.ReviewManager.SourceAReviewModuleViewerInterface.highlightComponent(componentIdentifier);
                        }
                    }
                    else {
                        //this.unHighlightComponent();
                        this.unHighlightAll();
                    }
                }
            }
            else {
                this.unHighlightComponent();
                this.unHighlightAll();
            }
        }
    };

    ReviewModuleViewerInterface.prototype.HighlightReviewComponent = function (componentData) {
        var componentsGroupName = componentData["MainComponentClass"];
        var mainReviewTableContainer = document.getElementById(this.ReviewManager.MainReviewTableContainer);
        if (!mainReviewTableContainer) {
            return;
        }

        var doc = mainReviewTableContainer.getElementsByClassName("collapsible");
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
                            if (childRowColumns[0].innerHTML === componentData.Name) {
                                var componentIdentifier = componentData.Name;
                                var rowIdentifier = childRowColumns[0].innerHTML

                                if (componentData.MainComponentClass === "PipingNetworkSegment") {

                                    componentIdentifier += "_" + componentData.Source + "_" + componentData.Destination + "_" + componentData.OwnerId;
                                    rowIdentifier += "_" + childRowColumns[childRowColumns.length -3].innerHTML + "_"
                                        + childRowColumns[childRowColumns.length -1].innerHTML + "_" + childRowColumns[childRowColumns.length -1].innerHTML;

                                    if (rowIdentifier !== componentIdentifier) {
                                        continue;                                                                 
                                    }
                                }
                                else if (componentData.MainComponentClass.toLowerCase() === "equipment") {
                                    componentIdentifier += "_" + componentData.OwnerHandle;
                                    rowIdentifier += "_" + childRowColumns[childRowColumns.length -1].innerHTML;
                                    if (rowIdentifier !== componentIdentifier) {
                                        continue;
                                    }
                                }

                                if (this.ReviewManager.SelectedComponentRow) {
                                    this.ReviewManager.RestoreBackgroundColor(this.ReviewManager.SelectedComponentRow);
                                }

                                this.ReviewManager.ChangeBackgroundColor(childRow)
                                this.ReviewManager.populateDetailedReviewTable(childRow);
                                this.ReviewManager.SelectedComponentRow = childRow;

                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}

