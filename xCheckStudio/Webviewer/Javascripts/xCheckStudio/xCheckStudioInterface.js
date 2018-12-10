
var xCheckStudio;
(function (xCheckStudio) {
    var xCheckStudioInterface = /** @class */ (function () {

        function xCheckStudioInterface(sourceType) {
            this.SourceType = sourceType;

            this._selectedNodeId = null;
            this._selectedComponentId = null;
            this.nodeIdArray = [];
            this.componentIdVsComponentData = {};
            this.nodeIdVsComponentData = {};
            this.sourceProperties = [];
            
            this.excelReader = new ExcelReader(sourceType);
        }

        xCheckStudioInterface.prototype.readExcelFileData = function (event, containerId){
            this.excelReader.ReadFileData(event, containerId);
            this.sourceProperties = this.excelReader.sourceProperties;
        }

        xCheckStudioInterface.prototype.setupViewer = function (viewerOptions, isFirstViewer) {
            var _this = this;

            // create and start viewer
            var viewer = new Communicator.WebViewer({
                containerId: viewerOptions.containerId, //"myContainer",
                //endpointUri: "uploads/scs/"+file_name+".scs"
                endpointUri: viewerOptions.endpointUri, //"uploads/scs/bearingassembly.scs"	
                model: viewerOptions.model
            });

            viewer.start();

            _this._firstViewer = viewer;

            // _this.sourceProperties = [];

            // construct model tree
            _this._modelTree = new xCheckStudio.Ui.ModelTree(viewerOptions.modelTree, viewer);

            // create highlight manager
            // _this.highlightManager = new HighlightManager(viewer);

            // register viewer evenets
            _this._bindEvents(viewer, isFirstViewer);

            // set viewer's background color
            _this.setViewerBackgroundColor();
        }

        xCheckStudioInterface.prototype.setViewerBackgroundColor = function () {
            var backgroundTopColor = xCheckStudio.Util.hexToRgb("#000000");
            var backgroundBottomColor = xCheckStudio.Util.hexToRgb("#F8F9F9");

            this._firstViewer.view.setBackgroundColor(backgroundTopColor, backgroundBottomColor);
        }

        xCheckStudioInterface.prototype._bindEvents = function (viewer, isFirstViewer) {

            var _this = this;

            viewer.setCallbacks({
                firstModelLoaded: function () {
                    viewer.view.fitWorld();
                    _this.createNodeIdArray(viewer.model.getAbsoluteRootNode());
                    _this.readProperties(viewer.model.getAbsoluteRootNode(), 0);

                },
                selectionArray: function (selections) {
                    for (var _i = 0, selections_1 = selections; _i < selections_1.length; _i++) {
                        var selection = selections_1[_i];

                        var sel = selection.getSelection();

                        if (_this._selectedNodeId !== sel.getNodeId()) {
                            _this._onSelection(selection);
                        }
                    }
                },

            });

            // viewer operators            
            _this.registerViewerOperators(isFirstViewer);
        };

        xCheckStudioInterface.prototype.registerViewerOperators = function (isFirstViewer) {
            var _this = this;
            // viewer operators            
            var frontButton = "Front";
            var backButton = "Back";
            var topButton = "Top";
            var bottomButton = "Bottom";
            var leftButton = "Left";
            var rightButton = "Right";
            var isoButton = "Iso";
            if (isFirstViewer) {
                frontButton = frontButton + "1";
                backButton = backButton + "1";
                topButton = topButton + "1";
                bottomButton = bottomButton + "1";
                leftButton = leftButton + "1";
                rightButton = rightButton + "1";
                isoButton = isoButton + "1";
            }
            else {
                frontButton = frontButton + "2";
                backButton = backButton + "2";
                topButton = topButton + "2";
                bottomButton = bottomButton + "2";
                leftButton = leftButton + "2";
                rightButton = rightButton + "2";
                isoButton = isoButton + "2";
            }

            var element = document.getElementById(frontButton);
            element.onclick = function () {
                _this._firstViewer.view.setViewOrientation(Communicator.ViewOrientation.Front, Communicator.DefaultTransitionDuration);
            };
            element = document.getElementById(backButton);
            element.onclick = function () {
                _this._firstViewer.view.setViewOrientation(Communicator.ViewOrientation.Back, Communicator.DefaultTransitionDuration);
            };
            element = document.getElementById(topButton);
            element.onclick = function () {
                _this._firstViewer.view.setViewOrientation(Communicator.ViewOrientation.Top, Communicator.DefaultTransitionDuration);
            };
            element = document.getElementById(bottomButton);
            element.onclick = function () {
                _this._firstViewer.view.setViewOrientation(Communicator.ViewOrientation.Bottom, Communicator.DefaultTransitionDuration);
            };
            element = document.getElementById(leftButton);
            element.onclick = function () {
                _this._firstViewer.view.setViewOrientation(Communicator.ViewOrientation.Left, Communicator.DefaultTransitionDuration);
            };
            element = document.getElementById(rightButton);
            element.onclick = function () {
                _this._firstViewer.view.setViewOrientation(Communicator.ViewOrientation.Right, Communicator.DefaultTransitionDuration);
            };
            element = document.getElementById(isoButton);
            element.onclick = function () {
                _this._firstViewer.view.setViewOrientation(Communicator.ViewOrientation.Iso, Communicator.DefaultTransitionDuration);
            };

        }

        xCheckStudioInterface.prototype._onSelection = function (selectionEvent) {
            var selection = selectionEvent.getSelection();
            if (selection.isNodeSelection()) {
                this._selectedNodeId = selection.getNodeId();
                var model = this._firstViewer.model;
                if (model.isNodeLoaded(this._selectedNodeId)) {
                    // If we selected a body, then get the assembly node that holds it (loadSubtreeFromXXX() works on assembly nodes)
                    if (model.getNodeType(this._selectedNodeId) === Communicator.NodeType.BodyInstance) {
                        var parent_1 = model.getNodeParent(this._selectedNodeId);
                        if (parent_1 !== null) {
                            this._selectedNodeId = parent_1;
                        }
                    }

                    // if (model.getNodeType(this._selectedNodeId) !== Communicator.NodeType.BodyInstance) {
                    //     let data = this.highlightManager.nodeIdVsComponentData[this._selectedNodeId];
                    //     if (data != undefined) {
                    //         if (checkManager != undefined) {
                    //             // get component identifier
                    //             var componentIdentifier = data["Name"];
                    //             if (data.MainComponentClass === "PipingNetworkSegment") {
                    //                 componentIdentifier += "_" + data["Source"] + "_" + data["Destination"] + "_" + data["OwnerId"];
                    //             }
                    //             if (this._selectedComponentId === data.NodeId) {
                    //                 return;
                    //             }

                    //             // highlight corresponding component in review table 
                    //             reviewManager.HighlightReviewComponent(data);

                    //             // highlight corresponding component in model browser table
                    //             this._modelTree.HighlightModelBrowserRow(componentIdentifier);

                    //             if (this._firstViewer._params.containerId == "viewerContainer2") {
                    //                 xCheckStudioInterface1.highlightComponent(componentIdentifier);
                    //                xCheckStudioInterface1._modelTree.HighlightModelBrowserRow(componentIdentifier);
                    //             }
                    //             else if (this._firstViewer._params.containerId == "viewerContainer1") {
                    //                 xCheckStudioInterface2.highlightComponent(componentIdentifier);
                    //                xCheckStudioInterface2._modelTree.HighlightModelBrowserRow(componentIdentifier);
                    //             }
                    //         }
                    //         else {
                    //             var componentIdentifier = data["Name"];
                    //             if (data.MainComponentClass === "PipingNetworkSegment") {
                    //                 componentIdentifier += "_" + data["Source"] + "_" + data["Destination"] + "_" + data["OwnerId"];
                    //             }
                    //             if (this._selectedComponentId === data.NodeId) {
                    //                 return;
                    //             }
                    //             this._modelTree.HighlightModelBrowserRow(componentIdentifier);
                    //         }
                    //     }
                    // }
                }
            }
        };


        xCheckStudioInterface.prototype.createNodeIdArray = function (nodeId) {
            var _this = this;
            if (nodeId !== null &&
                (_this._firstViewer.model.getNodeType(nodeId) === Communicator.NodeType.AssemblyNode ||
                    _this._firstViewer.model.getNodeType(nodeId) === Communicator.NodeType.Part ||
                    _this._firstViewer.model.getNodeType(nodeId) === Communicator.NodeType.PartInstance)
                /*&& xCheckStudioInterface != null*/) {
                this.nodeIdArray.push(nodeId);
                var children = _this._firstViewer.model.getNodeChildren(nodeId);
                if (children.length > 0) {
                    for (var i = 0, children_1 = children; i < children_1.length; i++) {
                        var child = children_1[i];
                        _this.createNodeIdArray(child);
                    }
                }
            }
        }

        xCheckStudioInterface.prototype.readProperties = function (nodeId) {
            var _this = this;
            if (nodeId !== null &&
                (_this._firstViewer.model.getNodeType(nodeId) === Communicator.NodeType.AssemblyNode ||
                    _this._firstViewer.model.getNodeType(nodeId) === Communicator.NodeType.Part ||
                    _this._firstViewer.model.getNodeType(nodeId) === Communicator.NodeType.PartInstance)
                /*&& xCheckStudioInterface != null*/) {

                if (_this._firstViewer.model.isNodeLoaded(nodeId)) {

                    _this._firstViewer.model.getNodeProperties(nodeId).then(function (nodeProperties) {
                        if (nodeProperties != null &&
                            Object.keys(nodeProperties).length > 0) {
                            var mainComponentClass = nodeProperties["Intrida Data/MainComponentClass"];
                            var name = nodeProperties["Intrida Data/Name"];
                            var subComponentClass = nodeProperties["Intrida Data/SubComponentClass"];

                            // check if source, destination and ownerid properties exists to uniquely identify
                            // PipingNetworkSegment
                            var source;
                            var destination;
                            var ownerId;
                            if ("Intrida Data/Source" in nodeProperties &&
                                "Intrida Data/Destination" in nodeProperties &&
                                "Intrida Data/OwnerId" in nodeProperties) {
                                source = nodeProperties["Intrida Data/Source"];
                                destination = nodeProperties["Intrida Data/Destination"];
                                ownerId = nodeProperties["Intrida Data/OwnerId"];
                            }

                            // create generic properties object
                            var genericPropertiesObject = new GenericProperties(name,
                                mainComponentClass,
                                subComponentClass,
                                source,
                                destination,
                                ownerId,
                                nodeId);

                            // add component class as generic property
                            var componentClassPropertyObject = new GenericProperty("ComponentClass", "String", subComponentClass);
                            genericPropertiesObject.addProperty(componentClassPropertyObject);

                            // iterate node properties and add to generic properties object
                            for (var key in nodeProperties) {
                                var genericPropertyObject = new GenericProperty(key, "String", nodeProperties[key]);
                                genericPropertiesObject.addProperty(genericPropertyObject);
                            }

                            // add genericProperties object to sourceproperties collection
                            _this.sourceProperties.push(genericPropertiesObject);

                            // keep track of component vs node id
                            var componentIdentifier = name

                            var componentNodeData = new ComponentNodeData(name,
                                mainComponentClass,
                                subComponentClass,
                                source,
                                destination,
                                ownerId,
                                nodeId);
                            if (source !== undefined &&
                                destination !== undefined &&
                                ownerId !== undefined) {
                                componentIdentifier = name + "_" + source + "_" + destination + "_" + ownerId;
                            }

                            _this.componentIdVsComponentData[componentIdentifier] = componentNodeData;
                            _this.nodeIdVsComponentData[nodeId] = componentNodeData;
                        }

                        var children = _this._firstViewer.model.getNodeChildren(nodeId);
                        if (children.length > 0) {
                            for (var i = 0, children_1 = children; i < children_1.length; i++) {
                                var child = children_1[i];

                                if (child !== null &&
                                    (_this._firstViewer.model.getNodeType(child) === Communicator.NodeType.AssemblyNode ||
                                        _this._firstViewer.model.getNodeType(child) === Communicator.NodeType.Part ||
                                        _this._firstViewer.model.getNodeType(child) === Communicator.NodeType.PartInstance)) {
                                    _this.readProperties(child)
                                }
                            }
                        }

                        if (_this.nodeIdArray.indexOf(nodeId) != -1) {
                            _this.nodeIdArray.splice(_this.nodeIdArray.indexOf(nodeId), 1);
                        }
                        if (_this.nodeIdArray.length == 0) {
                            _this._modelTree.addModelBrowserComponent(_this._firstViewer.model.getAbsoluteRootNode(), undefined);
                            for (var i = 0; i < _this._modelTree.NodeGroups.length; i++) {
                                _this._modelTree.CreateGroup(_this._modelTree.NodeGroups[i]);
                            }

                        }
                    });
                }
            }

        };

        // xCheckStudioInterface.prototype.highlightComponent = function (componentIdentifier) {
        //     var nodeId = this.highlightManager.getNodeIdFromComponentIdentifier(componentIdentifier);
        //     if (nodeId === undefined) {
        //         return;
        //     }

        //     this.highlightManager.highlightNodeInViewer(nodeId);

        //     this._selectedNodeId = nodeId;
        // };


        return xCheckStudioInterface;
    }());
    xCheckStudio.xCheckStudioInterface = xCheckStudioInterface;
})(xCheckStudio || (xCheckStudio = {}));


