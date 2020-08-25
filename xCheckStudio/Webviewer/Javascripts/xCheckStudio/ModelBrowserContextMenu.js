function ModelBrowserContextMenu(haveComponentOptions = true) {
      this.ModelBrowser;

      this.IsolateManager;

      this.HaveComponentOptions = haveComponentOptions;

      this.TranslucencyActive = false;
}

// ModelBrowserContextMenu.prototype.Init = function (modelBrowser) {

//       var _this = this;
//       this.ModelBrowser = modelBrowser;

//       $("#" + this.ModelBrowser.ModelBrowserContainer).contextMenu({
//             className: 'contextMenu_style',
//             selector: 'tr',           
//             build: function ($triggerElement, e) {
//                   return {
//                         callback: function (key, options) {
//                               _this.OnMenuItemClicked(key, options);
//                         },
//                         items: {                   
//                               "hide": {
//                                     name: "Hide",
//                                     icon: "hide",
//                                     visible: function () {
//                                           if (_this.HaveSCOperations()) {
//                                                 return true;
//                                           }

//                                           return false;
//                                     }
//                               },
//                               "isolate": {
//                                     name: "Isolate",
//                                     icon: "isolate",
//                                     visible: function () {
//                                           if (_this.HaveSCOperations()) {
//                                                 return true;
//                                           }

//                                           return false;
//                                     }
//                               },
//                               "show": {
//                                     name: "Show",
//                                     icon: "show",
//                                     visible: function () {
//                                           if (_this.HaveSCOperations()) {
//                                                 return true;
//                                           }

//                                           return false;
//                                     }
//                               },
//                               "modelViews": {
//                                     name: "Model Views",
//                                     icon: "modelViews",
//                                     visible: function () {
//                                           if (_this.HaveSCOperations()) {
//                                                 return true;
//                                           }

//                                           return false;
//                                     }
//                               },
//                               "translucency": {
//                                     name: "Translucency",
//                                     icon: "translucency",
//                                     visible: function () {
//                                           if (_this.HaveSCOperations()) {
//                                                 return true;
//                                           }

//                                           return false;
//                                     }
//                               },
//                               "reference": {
//                                     name: "Reference",
//                                     icon: "reference",
//                                     visible: function () {
//                                           if (_this.HaveComponentOptions) {
//                                                 return true;
//                                           }
//                                           return false;
//                                     }
//                               }
//                         }
//                   };
//             }
//       });
// }

ModelBrowserContextMenu.prototype.HaveSCOperations = function () {
      if (!this.ModelBrowser ||
            !this.ModelBrowser.Webviewer) {
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
      else if (key.toLowerCase() === "translucency") {

            if (!this.TranslucencyActive) {
                  this.OnStartTranslucencyClicked();
            }
            else {
                  this.OnStopTranslucencyClicked();
            }
      }
      else if (key.toLowerCase() === "reference") {
            this.OnReferenceClicked();
      }
      else if (key.toLowerCase() === "properties") {
            this.OnPropertiesClicked(options);
      }
}

ModelBrowserContextMenu.prototype.OnPropertiesClicked = function (data) {
      closeAnyOpenMenu();

      // property call out      
      SourceManagers[model.currentTabId].PropertyCallout.Open();
      SourceManagers[model.currentTabId].OpenPropertyCallout(data);
}

ModelBrowserContextMenu.prototype.OnReferenceClicked = function () {

      // var referenceManager = new ReferenceManager();
      // referenceManager.ShowReferenceDiv();
      var title = "";
      if (model.currentTabId in model.views) {
            title = model.views[model.currentTabId].fileName;
      }
      ReferenceManager.showReferenceDiv(title);
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

      // maintain hidden elements
      if (model.currentTabId in SourceManagers) {
            var sourceManager = SourceManagers[model.currentTabId];
            sourceManager.HiddenNodeIds = [];

            var allNodeIds = Object.keys(sourceManager.NodeIdvsComponentIdList);
            for (var i = 0; i < Object.keys(allNodeIds).length; i++) {
                  var nodeId = Number(allNodeIds[i]);
                  if (!nodeIds.includes(nodeId)) {
                        sourceManager.HiddenNodeIds.push(nodeId);
                  }
            }

            //Grey out the text of hidden element rows
            this.ModelBrowser.HighlightHiddenRowsFromNodeIds(true, sourceManager.HiddenNodeIds);
          
            // unhighlight the hidden rows made visible
            this.ModelBrowser.HighlightHiddenRowsFromNodeIds(false, nodeIds);            
      }
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

      var selectedNodeIds = this.ModelBrowser.GetSelectedNodeIds();

      // Handle hidden elements nodeIds list 
      SourceManagers[model.currentTabId].HandleHiddenNodeIdsList(true, selectedNodeIds);

      //Grey out the text of hidden element rows
      this.ModelBrowser.HighlightHiddenRowsFromNodeIds(true, selectedNodeIds);
      // //Get rows of selected node Ids to change text color 
      // var selectedRows = this.ModelBrowser.GetSelectedRowsFromNodeIds(selectedNodeIds);
      // //Grey out the text of hidden element rows
      // this.ModelBrowser.HighlightHiddenRows(true, selectedRows);
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

      var selectedNodeIds = this.ModelBrowser.GetSelectedNodeIds();
      // Handle hidden elements nodeIds list 
      SourceManagers[model.currentTabId].HandleHiddenNodeIdsList(false, selectedNodeIds);

      //Grey out the text of hidden element rows
      this.ModelBrowser.HighlightHiddenRowsFromNodeIds(false, selectedNodeIds);
      // //Get rows of selected node Ids to change text color 
      // var selectedRows = this.ModelBrowser.GetSelectedRowsFromNodeIds(selectedNodeIds);
      // //Grey out the text of hidden element rows
      // this.ModelBrowser.HighlightHiddenRows(false, selectedRows);
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
      this.TranslucencyActive = true;

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
      if (!(viewerId in translucencyManagers)) {
            return;
      }
      this.TranslucencyActive = false;

      translucencyManagers[viewerId].Stop();
      delete translucencyManagers[viewerId];
}

ModelBrowserContextMenu.prototype.GetSelectedNodes = function () {
      if (!this.ModelBrowser) {
            return;
      }
      var nodeIds = [];

      var treeList = $("#" + this.ModelBrowser.ModelBrowserContainer).dxTreeList("instance");
      var visibleRows = treeList.getVisibleRows();
      for (var i = 0; i < visibleRows.length; i++) {
            var row = visibleRows[i];
            if (!row.isSelected) {
                  continue;
            }

            nodeIds.push(row.data.NodeId);
      }

      return nodeIds;
}