
var xCheckStudio;
(function (xCheckStudio) {
    var xCheckStudioInterface = /** @class */ (function () {

        function xCheckStudioInterface(sourceType) {
            this.SourceType = sourceType;

            this._selectedNodeId = null;
            //this._selectedComponentId = null;
            this.nodeIdArray = [];
            // this.componentIdVsComponentData = {};
            // this.nodeIdVsComponentData = {};
            this.sourceProperties = {};

            this.excelReader = undefined;
            this.db_reader = undefined;

            this.NodeIdvsComponentIdList ={}
        }

        xCheckStudioInterface.prototype.readExcelFileData = function (file, containerId, viewerContainer) {
            this.excelReader = new ExcelReader(this.SourceType);
            this.excelReader.ReadFileData(file, containerId, viewerContainer);
            this.sourceProperties = this.excelReader.sourceProperties;
        }

        xCheckStudioInterface.prototype.readDbFileData = function (Db_data, containerId, viewerContainer)
        {
            this.db_reader = new DBReader(this.SourceType);
            this.db_reader.ReadDBData(Db_data, containerId, viewerContainer);
            this.sourceProperties = this.db_reader.sourceProperties;
        }

        xCheckStudioInterface.prototype.getClassWiseComponents = function () {
            var classwiseComponents = {};
            var mainCategoryPropertyName = "MainComponentClass";
            for (var i = 0; i < this.sourceProperties.length; i++) {
                var property = this.sourceProperties[i];
                if (property[mainCategoryPropertyName] in classwiseComponents) {
                    // increment count of checked components for this main category
                    classwiseComponents[property[mainCategoryPropertyName]] += 1;
                }
                else {
                    // add checked components count for this main category
                    classwiseComponents[property[mainCategoryPropertyName]] = 1;
                }
            }


            return classwiseComponents;
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

            var excelSheetParentContainer = document.getElementById("dataSourceViewer");
            for (var i = 0; i < excelSheetParentContainer.childElementCount; i++) {
                currentChild = excelSheetParentContainer.children[i];
                if (currentChild.className === "viewdatagraphics") {
                    currentChild.style.display = "none";
                }
            }

            _this._firstViewer = viewer;

            // construct model tree
            _this._modelTree = new xCheckStudio.Ui.ModelTree(viewerOptions.modelTree, viewer, this.SourceType);

            // register viewer evenets
            _this._bindEvents(viewer, isFirstViewer);

            // set viewer's background color
            _this.setViewerBackgroundColor();
        }

        xCheckStudioInterface.prototype.setViewerBackgroundColor = function () {
            var backgroundTopColor = xCheckStudio.Util.hexToRgb("#000000");
            var backgroundBottomColor = xCheckStudio.Util.hexToRgb("#F8F9F9");

            this._firstViewer.view.setBackgroundColor(backgroundTopColor, backgroundBottomColor);

            // set back face visibility
            this._firstViewer.view.setBackfacesVisible(true);
        }

        xCheckStudioInterface.prototype._bindEvents = function (viewer, isFirstViewer) {

            var _this = this;

            viewer.setCallbacks({
                firstModelLoaded: function () {
                    viewer.view.fitWorld(); 
                    _this.createNodeIdArray(viewer.model.getAbsoluteRootNode());

                   // show busy spinner
                    var busySpinner = document.getElementById("divLoading");
                    busySpinner.className = 'show';

                    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(_this.SourceType);
                    _this.RootNodeId = viewer.model.getAbsoluteRootNode();
                    _this.readProperties(_this.RootNodeId, identifierProperties, undefined);                    
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

                contextMenu: function (position) {
                    //alert("contextMenu: " + position.x + ", " + position.y);                
                    // _this.menu(position.x, position.y);
                    if (currentViewer === undefined) {
                        currentViewer = viewer;
                    }
                    
                    _this.menu(event.clientX, event.clientY);
                }
            });

            // viewer operators            
            //_this.registerViewerOperators(isFirstViewer);
        };

        xCheckStudioInterface.prototype.menu = function (x, y) {
            var i = document.getElementById("menu").style;
            i.top = y + "px";
            i.left = x + "px";
            i.visibility = "visible";
            i.opacity = "1";
        }

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
                if (selection.getNodeId() === this._selectedNodeId) {
                    return;
                }

                this._selectedNodeId = selection.getNodeId();
                var model = this._firstViewer.model;

                if (!model.isNodeLoaded(this._selectedNodeId)) {
                    return;
                }

                // If we selected a body, then get the assembly node that holds it (loadSubtreeFromXXX() works on assembly nodes)
                if (model.getNodeType(this._selectedNodeId) === Communicator.NodeType.BodyInstance) {

                    while (model.getNodeType(this._selectedNodeId) === Communicator.NodeType.BodyInstance) {
                        var parent_1 = model.getNodeParent(this._selectedNodeId);                        

                        if (parent_1 !== null &&
                            (model.getNodeType(parent_1) === Communicator.NodeType.AssemblyNode ||
                            model.getNodeType(parent_1) === Communicator.NodeType.Part ||
                            model.getNodeType(parent_1) === Communicator.NodeType.PartInstance)) {
                            this._selectedNodeId = parent_1;
                            // select this node
                            this._firstViewer.selectPart(parent_1);
                        }
                        else {
                            break;
                        }
                    }
                }

                if (model.getNodeType(this._selectedNodeId) !== Communicator.NodeType.BodyInstance) {
                    // highlight corresponding component in model browser table
                    this._modelTree.HighlightModelBrowserRow(this._selectedNodeId);
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

        xCheckStudioInterface.prototype.getPropertyValue = function (propertyCollectionObject, propertyToSearch) {

            for (var key in propertyCollectionObject) {
                if (key.toLowerCase() === propertyToSearch.toLowerCase()) {
                    return propertyCollectionObject[key];
                }
            }

            return undefined;
        }
      

        xCheckStudioInterface.prototype.readProperties = function (nodeId, identifierProperties, parentNodeId) {
            var _this = this;
            if (nodeId !== null &&
                (_this._firstViewer.model.getNodeType(nodeId) === Communicator.NodeType.AssemblyNode ||
                    _this._firstViewer.model.getNodeType(nodeId) === Communicator.NodeType.Part ||
                    _this._firstViewer.model.getNodeType(nodeId) === Communicator.NodeType.PartInstance)
                /*&& xCheckStudioInterface != null*/) {

                if (_this._firstViewer.model.isNodeLoaded(nodeId)) {

                    _this._firstViewer.model.getNodeProperties(nodeId).then(function (nodeProperties) {
                        if (nodeProperties != null &&
                            Object.keys(nodeProperties).length > 0 &&
                            identifierProperties !== undefined) {
                            var name = _this._firstViewer.model.getNodeName(nodeId)
                            
                            var mainComponentClass = _this.getPropertyValue(nodeProperties, identifierProperties.mainCategory);
                            var name = _this.getPropertyValue(nodeProperties, identifierProperties.name);
                            if(name == undefined)
                                name = _this._firstViewer.model.getNodeName(nodeId)
                            var subComponentClass = _this.getPropertyValue(nodeProperties, identifierProperties.subClass);

                            if (mainComponentClass !== undefined &&
                                name !== undefined &&
                                subComponentClass !== undefined) {                            

                                // create generic properties object
                                var genericPropertiesObject = new GenericComponent(name,
                                                                                   mainComponentClass,
                                                                                   subComponentClass,                                  
                                                                                   nodeId,
                                                                                   parentNodeId);

                                // add component class as generic property
                                var componentClassPropertyObject = new GenericProperty("ComponentClass", 
                                                                                       "String", 
                                                                                       subComponentClass);
                                genericPropertiesObject.addProperty(componentClassPropertyObject);

                                // iterate node properties and add to generic properties object
                                for (var key in nodeProperties) {
                                    var genericPropertyObject = new GenericProperty(key, "String", nodeProperties[key]);
                                    genericPropertiesObject.addProperty(genericPropertyObject);
                                }

                                // add genericProperties object to sourceproperties collection
                                _this.sourceProperties[nodeId] = (genericPropertiesObject);

                                // // keep track of component vs node id
                                // var componentIdentifier = name

                                // var componentNodeData = new ComponentNodeData(name,
                                //     mainComponentClass,
                                //     subComponentClass,                                    
                                //     nodeId);                               
                    
                                // _this.componentIdVsComponentData[componentIdentifier] = componentNodeData;
                                // _this.nodeIdVsComponentData[nodeId] = componentNodeData;
                             }
                            // else if (name !== undefined) {

                            //     var componentNodeData = new ComponentNodeData(name,
                            //         "",
                            //         "",                                   
                            //         nodeId);

                            //     // keep track of component vs node id
                            //     var componentIdentifier = name
                            //     _this.componentIdVsComponentData[componentIdentifier] = componentNodeData;
                            //     _this.nodeIdVsComponentData[nodeId] = componentNodeData;
                            // }
                        }

                        var children = _this._firstViewer.model.getNodeChildren(nodeId);
                        if (children.length > 0)
                        {
                            for (var i = 0, children_1 = children; i < children_1.length; i++) 
                            {
                                var child = children_1[i];

                                if (child !== null &&
                                    (_this._firstViewer.model.getNodeType(child) === Communicator.NodeType.AssemblyNode ||
                                    _this._firstViewer.model.getNodeType(child) === Communicator.NodeType.Part ||
                                    _this._firstViewer.model.getNodeType(child) === Communicator.NodeType.PartInstance))
                                {
                                    _this.readProperties(child, identifierProperties, nodeId)
                                }
                            }
                        }

                        if (_this.nodeIdArray.indexOf(nodeId) != -1) {
                            _this.nodeIdArray.splice(_this.nodeIdArray.indexOf(nodeId), 1);
                        }
                         if (_this.nodeIdArray.length == 0) 
                         {
                            _this._modelTree.addModelBrowser(_this._firstViewer.model.getAbsoluteRootNode(), undefined); 
                            
                            // add components to database
                            _this.addComponentsToDB();
                        }
                    });
                }
            }

        };

        xCheckStudioInterface.prototype.addComponentsToDB = function () {

            var _this = this;

            var source = undefined;
            if( this._firstViewer._params.containerId.toLowerCase() == "viewercontainer1")
            {
                source = "SourceA"
            }
            else if( this._firstViewer._params.containerId.toLowerCase()== "viewercontainer2")
            {
                source = "SourceB"
            }         

            $.ajax({
                data: { 'Components': JSON.stringify( this.sourceProperties), 'Source' : source, 'DataSourceType' : '3D' },
                type: "POST",
                url: "PHP/AddComponentsToDB.php"
               }).done(function (msg) {
                if (msg !== 'fail') 
                {
                    _this.NodeIdvsComponentIdList =  JSON.parse(msg);
                }
                // remove busy spinner
                var busySpinner = document.getElementById("divLoading");
                busySpinner.classList.remove('show')
            });

        }

        xCheckStudioInterface.prototype.getModelBrowser = function () {
            if (this._modelTree !== undefined) {
                return this._modelTree;
            }
            else if (this.excelReader !== undefined &&
                this.excelReader.excelModelBrowser !== undefined) {
                return this.excelReader.excelModelBrowser;
            }
            else if(this.db_reader !== undefined && this.db_reader.dbmodelbrowser !== undefined)
            {
                return this.db_reader.dbmodelbrowser;
            }

            return undefined;
        }

        return xCheckStudioInterface;
    }());
    xCheckStudio.xCheckStudioInterface = xCheckStudioInterface;
})(xCheckStudio || (xCheckStudio = {}));


