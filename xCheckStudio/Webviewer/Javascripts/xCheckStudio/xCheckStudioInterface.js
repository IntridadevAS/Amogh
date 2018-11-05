
var xCheckStudio;
(function (xCheckStudio) 
{
    var xCheckStudioInterface = /** @class */ (function () 
    {   
        function xCheckStudioInterface() 
        {
            this._selectedNodeId = null;
        }
        //xCheckStudioInterface.prototype.start = function (viewerOptions) {
        //    var _this = this;
        //    xCheckStudio.createViewer(viewerOptions).then(function (viewer) {
        //        _this._viewer = viewer;
        //        _this._modelTree = new xCheckStudio.Ui.ModelTree("modelTree", _this._viewer);
        //        _this._bindEvents();
        //        _this._viewer.start();
		//		
		//		  var backgroundTopColor = xCheckStudio.Util.hexToRgb("#D1BDBD");
		//		  var backgroundBottomColor = xCheckStudio.Util.hexToRgb("#F8F9F9");
		//		  
		//		 _this._viewer.view.setBackgroundColor(backgroundTopColor, backgroundBottomColor);
        //    });
        //};
		
		 xCheckStudioInterface.prototype.setupViewer=function(viewerOptions, isFirstViewer)
		 {
			  var _this = this;
			  
			 var viewer = new Communicator.WebViewer({
                containerId: viewerOptions.containerId, //"myContainer",
                //endpointUri: "uploads/scs/"+file_name+".scs"
			    endpointUri: viewerOptions.endpointUri , //"uploads/scs/bearingassembly.scs"	
				model:viewerOptions.model
                });
		
	           viewer.start();	   
			    
						_this._firstViewer = viewer;
				                
                _this.sourceProperties=[];

                _this._modelTree = new xCheckStudio.Ui.ModelTree(viewerOptions.modelTree, viewer);
                _this._bindEvents(viewer, isFirstViewer);
				
				 var backgroundTopColor = xCheckStudio.Util.hexToRgb("#000000");
				 var backgroundBottomColor = xCheckStudio.Util.hexToRgb("#F8F9F9");
				  
				 viewer.view.setBackgroundColor(backgroundTopColor, backgroundBottomColor);
		 }
		 	        
		
        xCheckStudioInterface.prototype._bindEvents = function (viewer, isFirstViewer) {           
            
			var _this = this;
			
			viewer.setCallbacks({
				firstModelLoaded: function () {
                     viewer.view.fitWorld();

                    _this._modelTree.viewNode(viewer.model.getAbsoluteRootNode());
                    
                    _this.readProperties(viewer.model.getAbsoluteRootNode()); 
                    //_this._modelTree.setNodesVisible(_this._viewer.model.getAbsoluteRootNode(), false);
					//_this._viewer.SelectionManager.setNodeSelectionColor(Color.red());
                },
                selectionArray: function (selections) {
                    for (var _i = 0, selections_1 = selections; _i < selections_1.length; _i++) {
                        var selection = selections_1[_i];
                        _this._onSelection(selection);
                    }
                }
            });
			
            // viewer 1 operators            
            var frontButton ="Front";
            var backButton ="Back";
            var topButton ="Top";
            var bottomButton ="Bottom";
            var leftButton ="Left";
            var rightButton ="Right";
            var isoButton ="Iso";
            if(isFirstViewer)
            {
                frontButton = frontButton+"1";
                backButton = backButton+"1";
                topButton = topButton+"1";
                bottomButton = bottomButton+"1";
                leftButton = leftButton+"1";
                rightButton = rightButton+"1";
                isoButton = isoButton+"1";
            }
            else
            {
                frontButton = frontButton+"2";
                backButton = backButton+"2";
                topButton = topButton+"2";
                bottomButton = bottomButton+"2";
                leftButton = leftButton+"2";
                rightButton = rightButton+"2";
                isoButton = isoButton+"2";
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
		
        };        
       
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
                }
            }
        };

        xCheckStudioInterface.prototype.readProperties= function (nodeId)
        {
            var _this = this;
            if (nodeId !== null && 
                (_this._firstViewer.model.getNodeType(nodeId) === Communicator.NodeType.AssemblyNode ||
                _this._firstViewer.model.getNodeType(nodeId) === Communicator.NodeType.Part ||
                _this._firstViewer.model.getNodeType(nodeId) === Communicator.NodeType.PartInstance)
                /*&& xCheckStudioInterface != null*/)
            {

                if (_this._firstViewer.model.isNodeLoaded(nodeId)) 
               {
                if(_this._firstViewer.model.getNodeName(nodeId) == "905676")
                {
                     var hjdf=0;
                }

                    _this._firstViewer.model.getNodeProperties(nodeId).then(function(nodeProperties)
                  {
                    if(nodeProperties != null &&
                       Object.keys(nodeProperties).length > 0)
                    {
                        var mainComponentClass = nodeProperties["Intrida Data/MainComponentClass"];
                        var name = nodeProperties["Intrida Data/Name"];
                        var identifier = nodeProperties["Intrida Data/Identifier"];
                        var subComponentClass = nodeProperties["Intrida Data/SubComponentClass"];
                                              
                        var genericPropertiesObject = new GenericProperties(name, identifier, mainComponentClass, subComponentClass);

                        for (var key in nodeProperties) 
                        {
                             //console.log(key, nodeProperties[key]);
                             var genericPropertyObject = new GenericProperty(key, "String", nodeProperties[key]);
                              genericPropertiesObject.addProperty(genericPropertyObject);
                        }        
                        
                        _this.sourceProperties.push(genericPropertiesObject);
                    }
                    
                    var children = _this._firstViewer.model.getNodeChildren(nodeId);
                    if (children.length > 0) 
                    {
                        for (var i = 0, children_1 = children; i < children_1.length; i++)
                        {
                            var child = children_1[i];
                            _this.readProperties(child, xCheckStudioInterface);
                        }
                    }
                  });					
                }
           }           
        };

        return xCheckStudioInterface;
    }());
    xCheckStudio.xCheckStudioInterface = xCheckStudioInterface;
})(xCheckStudio || (xCheckStudio = {}));


