function ModelBrowserContextMenuManager() {
      // call super constructor
      ContextMenuManager.call(this);

      this.ModelBrowser;

      //this.IsolatedNodes = [];
      this.IsolateManager;
}

// inherit from parent
ModelBrowserContextMenuManager.prototype = Object.create(ContextMenuManager.prototype);
ModelBrowserContextMenuManager.prototype.constructor = ModelBrowserContextMenuManager;

ModelBrowserContextMenuManager.prototype.Init = function (modelBrowser) {

      var _this = this;
      this.ModelBrowser = modelBrowser;

      $("#" + this.ModelBrowser.ModelBrowserContainer).contextMenu({
            className: 'contextMenu_style',
            selector: '.jsgrid-row, .jsgrid-alt-row',
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
                              "showAll": {
                                    name: "Show All",
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

ModelBrowserContextMenuManager.prototype.HaveSCOperations = function () {
      if (!this.ModelBrowser ||
            !this.ModelBrowser.Webviewer ||
            !this.ModelBrowser.SelectionManager) {
            return false;
      }

      return true;
}

ModelBrowserContextMenuManager.prototype.OnMenuItemClicked = function (key, options) {
      if (key.toLowerCase() === "isolate") {
            this.OnIsolateClicked();
      }
      else if (key.toLowerCase() === "showall") {
            this.OnShowAllClicked();
      }
      else if (key.toLowerCase() === "starttranslucency") {
            this.OnStartTranslucencyClicked();
      }
      else if (key.toLowerCase() === "stoptranslucency") {
            this.OnStopTranslucencyClicked();
      }
}

ModelBrowserContextMenuManager.prototype.OnIsolateClicked = function () {
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

ModelBrowserContextMenuManager.prototype.OnShowAllClicked = function () {
      if (!this.ModelBrowser ||
            !this.ModelBrowser.Webviewer ||
            !this.IsolateManager ||
            this.IsolateManager.length === 0) {
            return;
      }

      var _this = this;

      var model = this.ModelBrowser.Webviewer.model;
      model.setNodesVisibility([model.getAbsoluteRootNode()], true).then(function () {
            _this.ModelBrowser.Webviewer.view.fitWorld();

            _this.IsolateManager.IsolatedNodes = [];
      });
}

ModelBrowserContextMenuManager.prototype.OnStartTranslucencyClicked = function () {
      if (!this.ModelBrowser ||
            !this.ModelBrowser.Webviewer) {
            return;
      }

      var nodeIds = this.GetSelectedNodes();
      if (!nodeIds ||
            nodeIds.length === 0) {
            return;
      }

      var sliderId;
      var viewer = this.ModelBrowser.Webviewer;
      if (viewer._params.containerId === "viewerContainer1") {
            sliderId = "translucencySlider1";
      }
      else if (viewer._params.containerId === "viewerContainer2") {
            sliderId = "translucencySlider2";
      }
      if (!sliderId) {
            return;
      }
      
      var selectedNodes = {};
      selectedNodes[viewer._params.containerId] = nodeIds;   
      var translucencyManager = new TranslucencyManager([viewer], selectedNodes, sliderId);
      translucencyManager.Start();
      
      translucencyManagers[viewer._params.containerId] = translucencyManager;
}

ModelBrowserContextMenuManager.prototype.OnStopTranslucencyClicked = function () {
      var viewer = this.ModelBrowser.Webviewer;
      var viewerId = viewer._params.containerId
      if (!(viewerId in translucencyManagers))
      {
          return;
      }
  
      translucencyManagers[viewerId].Stop();
      delete translucencyManagers[viewerId]; 
}

ModelBrowserContextMenuManager.prototype.GetSelectedNodes = function () {
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
            var nodeId = Number(selectedComponentRow.cells[modelBrowserNodeIdColumn].textContent.trim());

            if (nodeId !== NaN) {
                  nodeIds.push(nodeId);
            }
      }

     return nodeIds;
}