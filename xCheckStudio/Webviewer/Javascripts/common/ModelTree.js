// <reference path="../hoops_web_viewer.d.ts"/>
// <reference path="../common/Example.ts"/>
var xCheckStudio;
(function (xCheckStudio) {
    var Ui;
    (function (Ui) {
        var ModelTree = /** @class */ (function () {
            function ModelTree(elementId, viewer) {
                this._size = new Communicator.Point2(250, 570);
                this._elementId = elementId;
                this._viewer = viewer;
                this._createElements();
                this._initEvents();
            }
            ModelTree.prototype._createElements = function () {
                var _this = this;
                var containerElement = document.getElementById(this._elementId);
                containerElement.style.width = this._size.x + "px";
                containerElement.style.height = this._size.y + "px";
                var heading = document.createElement("div");
                heading.classList.add("xCheckStudio-div-block");
                heading.innerHTML = "Model Tree:";
                containerElement.appendChild(heading);
                var navBox = document.createElement("div");
                navBox.classList.add("xCheckStudio-div-block");
                containerElement.appendChild(navBox);
                this._treeSelect = document.createElement("select");
                this._treeSelect.onchange = function () {
                    _this._onTreeSelectChange();
                };
                navBox.appendChild(this._treeSelect);
                this._childrenElement = document.createElement("ul");
                this._childrenElement.style.listStyleType = "none";
                this._childrenElement.style.fontSize = "12px";
                containerElement.appendChild(this._childrenElement);
            };
            ModelTree.prototype._initEvents = function () {
                var _this = this;
                this._viewer.setCallbacks({
                    assemblyTreeReady: function () {
                        _this.viewNode(_this._viewer.model.getAbsoluteRootNode());
                    },
                    selectionArray: function (selectionEvents) {
                        for (var _i = 0, selectionEvents_1 = selectionEvents; _i < selectionEvents_1.length; _i++) {
                            var selectionEvent = selectionEvents_1[_i];
                            var selection = selectionEvent.getSelection();
                            if (selection.isNodeSelection()) {
                                var nodeId = selection.getNodeId();
                                var model = _this._viewer.model;
                                if (model.isNodeLoaded(nodeId)) {
                                    _this.viewNode(nodeId);
                                }
                            }
                        }
                    }
                });
            };
            ModelTree.prototype._onTreeSelectChange = function () {
                // get selected tree element
                var selectedId = null;
                var currentChild = this._treeSelect.firstChild;
                while (currentChild) {
                    if (currentChild.selected) {
                        selectedId = parseInt(currentChild.value, 10);
                        break;
                    }
                    currentChild = currentChild.nextSibling;
                }
                this.viewNode(selectedId);
            };
            ModelTree.prototype.viewNode = function (nodeId) {
                if (nodeId !== null) {
                    var model = this._viewer.model;
                    var children = model.getNodeChildren(nodeId);
                    if (children.length > 0) {
                        this._clearElements();
                        this._fillSelect(nodeId);
                        this._treeSelect.value = nodeId.toString();
                        this._fillChildren(nodeId);
                    }
                    else {
                        this.viewNode(model.getNodeParent(nodeId));
                    }
                }
            };
            ModelTree.prototype.clearContent = function () {
                this._clearElements();
            };
            ModelTree.prototype._clearElements = function () {
                while (this._treeSelect.firstChild) {
                    this._treeSelect.removeChild(this._treeSelect.firstChild);
                }
                while (this._childrenElement.firstChild) {
                    this._childrenElement.removeChild(this._childrenElement.firstChild);
                }
            };
            ModelTree.prototype._fillSelect = function (nodeId) {
                var parent = this._viewer.model.getNodeParent(nodeId);
                if (parent === null) {
                    this._addSelectNode(nodeId, 0);
                    return 0;
                }
                else {
                    var level = this._fillSelect(parent) + 1;
                    this._addSelectNode(nodeId, level);
                    return level;
                }
            };
            ModelTree.prototype._addSelectNode = function (nodeId, level) {
                var name = "";
                for (var i = 0; i < level; i++) {
                    name += '.';
                }
                var option = document.createElement("option");
                option.value = nodeId.toString();
                option.text = name + this._viewer.model.getNodeName(nodeId);
                this._treeSelect.appendChild(option);
            };
            ModelTree.prototype._fillChildren = function (nodeId) {
                var children = this._viewer.model.getNodeChildren(nodeId);
                for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                    var child = children_1[_i];
                    if (this._viewer.model.getNodeType(child) == Communicator.NodeType.AssemblyNode ||
                        this._viewer.model.getNodeType(child) == Communicator.NodeType.PartInstance ||
                        this._viewer.model.getNodeType(child) == Communicator.NodeType.Part) {
                        this._addChildRow(child);

                    }
                }
            };
            ModelTree.prototype._addChildRow = function (nodeId) {
                var _this = this;
                var listItem = document.createElement("li");
                listItem.innerHTML = this._viewer.model.getNodeName(nodeId) || "unnamed";
                listItem.dataset["partId"] = nodeId.toString();
                listItem.style.cursor = "pointer";
                listItem.style.padding = "2px";
                var selection = this._viewer.selectionManager.getLast();
                if (selection && nodeId === selection.getNodeId()) {
                    listItem.style.fontWeight = "bold";
                }
                listItem.onclick = function () {
                    _this._listItemClick(nodeId);
                };
                this._childrenElement.appendChild(listItem);
            };
            ModelTree.prototype._listItemClick = function (nodeId) {
                this._viewer.selectPart(nodeId);
                this._viewer.view.fitNodes([nodeId]);
                if (this._viewer._params.containerId == "viewerContainer2") 
                {
                    xCheckStudioInterface1._modelTree._viewer.selectPart(nodeId);
                    xCheckStudioInterface1._firstViewer.view.fitNodes([nodeId]);
                }
                else if(this._viewer._params.containerId == "viewerContainer1")
                {
                    xCheckStudioInterface2._modelTree._viewer.selectPart(nodeId);
                    xCheckStudioInterface2._firstViewer.view.fitNodes([nodeId]);
                }
            };
            return ModelTree;
        }());
        Ui.ModelTree = ModelTree;
    })(Ui = xCheckStudio.Ui || (xCheckStudio.Ui = {}));
})(xCheckStudio || (xCheckStudio = {}));
