function ModelBrowserContextMenu() {
      // // call super constructor
      // ContextMenuManager.call(this);

      this.ModelBrowser;

      //this.IsolatedNodes = [];
      this.IsolateManager;
}

// // inherit from parent
// ModelBrowserContextMenu.prototype = Object.create(ContextMenuManager.prototype);
// ModelBrowserContextMenu.prototype.constructor = ModelBrowserContextMenu;

// ModelBrowserContextMenu.prototype.Init = function (x,y) {

//       var radialMenuParent = document.getElementById("radialMenuParent");
//       radialMenuParent.style.left = x;
//       radialMenuParent.style.left = y;

//       // create the radial menu
//       $("#radialMenu").igRadialMenu({
//             width: "300px",
//             height: "300px",
//             items:
//                   [
//                         {
//                               name: "button1",
//                               header: "Bold",
//                               //iconUri: "http://igniteui.com/images/samples/radial-menu/Bold.png",
//                               click: function () { toggleBold(); }
//                         },
//                         {
//                               name: "button2",
//                               header: "Italic",
//                               //iconUri: "http://igniteui.com/images/samples/radial-menu/Italic.png",
//                               click: function () { toggleItalic(); }
//                         },
//                   ]
//       });
// }

ModelBrowserContextMenu.prototype.Init = function (modelBrowser) {

      var _this = this;
      this.ModelBrowser = modelBrowser;

      $("#" + this.ModelBrowser.ModelBrowserContainer).contextMenu({
            className: 'contextMenu_style',
            selector: 'tr',
            // selector: '.jsgrid-row, .jsgrid-alt-row',
            build: function ($triggerElement, e) {
                  return {
                        callback: function (key, options) {
                              _this.OnMenuItemClicked(key, options);
                        },
                        items: {
                              "isolate": {
                                    name: "Isolate",
                                    visible: function () {
                                          if (_this.HaveSCOperations()) {
                                                return true;
                                          }

                                          return false;
                                    }
                              },
                              "hide": {
                                    name: "Hide",
                                    visible: function () {
                                          if (_this.HaveSCOperations()) {
                                                return true;
                                          }

                                          return false;
                                    }
                              },
                              "show": {
                                    name: "Show",
                                    visible: function () {
                                          if (_this.HaveSCOperations()) {
                                                return true;
                                          }

                                          return false;
                                    }
                              },
                              "startTranslucency": {
                                    name: "Start Translucency",
                                    visible: function () {
                                          if (_this.HaveSCOperations()) {
                                                return true;
                                          }

                                          return false;
                                    }
                              },
                              "stopTranslucency": {
                                    name: "Stop Translucency",
                                    visible: function () {
                                          if (_this.HaveSCOperations()) {
                                                return true;
                                          }

                                          return false;
                                    }
                              }
                        }
                  };
            }
      });
}

ModelBrowserContextMenu.prototype.HaveSCOperations = function () {
      if (!this.ModelBrowser ||
            !this.ModelBrowser.Webviewer ||
            !this.ModelBrowser.SelectionManager) {
            return false;
      }

      return true;
}

ModelBrowserContextMenu.prototype.OnMenuItemClicked = function (key, options) {
      if (key.toLowerCase() === "isolate") {
            this.OnIsolateClicked();
      }
      else if (key.toLowerCase() === "hide") {
            this.OnHideClicked();
      }
      else if (key.toLowerCase() === "show") {
            this.OnShowClicked();
      }
      else if (key.toLowerCase() === "starttranslucency") {
            this.OnStartTranslucencyClicked();
      }
      else if (key.toLowerCase() === "stoptranslucency") {
            this.OnStopTranslucencyClicked();
      }
}

ModelBrowserContextMenu.prototype.OnIsolateClicked = function () {
      if (!this.ModelBrowser ||
            !this.ModelBrowser.Webviewer) {
            return;
      }

      var nodeIds = this.GetSelectedNodes();
      if (!nodeIds ||
            nodeIds.length === 0) {
            return;
      }

      // perform isolate
      this.IsolateManager = new IsolateManager(this.ModelBrowser.Webviewer);
      this.IsolateManager.Isolate(nodeIds).then(function (affectedNodes) {

      });
}

ModelBrowserContextMenu.prototype.OnHideClicked = function () {
      if (!this.ModelBrowser ||
            !this.ModelBrowser.Webviewer) {
            return;
      }

      var nodeIds = this.GetSelectedNodes();
      if (!nodeIds ||
            nodeIds.length === 0) {
            return;
      }

      this.SetNodesVisibility(this.ModelBrowser.Webviewer, nodeIds, false);      
}

ModelBrowserContextMenu.prototype.SetNodesVisibility = function (viewer, nodeIds, visible) {
      var map = {};
      for (var i = 0; i < nodeIds.length; i++) {
            var nodeId = nodeIds[i];
            map[nodeId] = visible;
      }

      viewer.model.setNodesVisibilities(map);
}

ModelBrowserContextMenu.prototype.OnShowClicked = function () {
      if (!this.ModelBrowser ||
            !this.ModelBrowser.Webviewer) {
            return;
      }


      var nodeIds = this.GetSelectedNodes();
      if (!nodeIds ||
            nodeIds.length === 0) {
            return;
      }

      this.SetNodesVisibility(this.ModelBrowser.Webviewer, nodeIds, true);
      if (this.IsolateManager) {
            this.IsolateManager.IsolatedNodes = [];
      }     
}

ModelBrowserContextMenu.prototype.OnStartTranslucencyClicked = function () {
      if (!this.ModelBrowser ||
            !this.ModelBrowser.Webviewer) {
            return;
      }

      var nodeIds = this.GetSelectedNodes();
      if (!nodeIds ||
            nodeIds.length === 0) {
            return;
      }      
      
      var selectedNodes = {};
      selectedNodes[this.ModelBrowser.Webviewer._params.containerId] = nodeIds;   

      var ids = this.GetControlIds();

      var translucencyManager = new TranslucencyManager([this.ModelBrowser.Webviewer], selectedNodes, ids["translucency"]);
      translucencyManager.Start();
      
      translucencyManagers[this.ModelBrowser.Webviewer._params.containerId] = translucencyManager;
}

ModelBrowserContextMenu.prototype.GetControlIds = function () {
      var ids = {};
      if (this.ModelBrowser.Webviewer._params.containerId === "visualizerA") {
          
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
      else if (this.ModelBrowser.Webviewer._params.containerId === "visualizerB") {
          
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
      else if (this.ModelBrowser.Webviewer._params.containerId === "visualizerC") {
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
      else if (this.ModelBrowser.Webviewer._params.containerId === "visualizerD") {
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
  
      return ids;
  }

ModelBrowserContextMenu.prototype.OnStopTranslucencyClicked = function () {
      var viewer = this.ModelBrowser.Webviewer;
      var viewerId = viewer._params.containerId
      if (!(viewerId in translucencyManagers))
      {
          return;
      }
  
      translucencyManagers[viewerId].Stop();
      delete translucencyManagers[viewerId]; 
}

ModelBrowserContextMenu.prototype.GetSelectedNodes = function () {
      if (!this.ModelBrowser ||            
          !this.ModelBrowser.SelectionManager) {
            return;
      }
      var browserSelectionManager = this.ModelBrowser.SelectionManager;
      if (browserSelectionManager.SelectedComponentRows.length === 0) {
            return;
      }

      var nodeIds = [];
      for (var i = 0; i < browserSelectionManager.SelectedComponentRows.length; i++) {

            var selectedComponentRow = browserSelectionManager.SelectedComponentRows[i];
            var nodeId = Number(selectedComponentRow.cells[ModelBrowserColumns3D.NodeId].textContent.trim());

            if (nodeId !== NaN) {
                  nodeIds.push(nodeId);
            }
      }

     return nodeIds;
}