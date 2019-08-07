function ModelBrowserContextMenuManager() {
      // call super constructor
      ContextMenuManager.call(this);

      this.ModelBrowser;

      //this.IsolatedNodes = [];
      this.IsolateManager ;
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
                  //var selectedRow = $triggerElement;
                  // var accept = true;
                  // accept = chooseAction(selectedRow);
                  // var conditionalName = (accept) ? 'Accept' : 'Unaccept';
                  // highlightSelectedRowOnRightClick(selectedRow);
                  return {
                        callback: function (key, options) {
                              _this.OnMenuItemClicked(key, options);
                        },
                        items: {
                              "isolate": {
                                    name: "Isolate",
                              },
                              "showAll": {
                                    name: "Show All",
                              }
                        }
                  };
            }
      });

}

ModelBrowserContextMenuManager.prototype.OnMenuItemClicked = function (key, options) {
      if (key.toLowerCase() === "isolate") {
            this.OnIsolateClicked();
      }
      else if (key.toLowerCase() === "showall") {
            this.OnShowAllClicked();
      }
}

ModelBrowserContextMenuManager.prototype.OnIsolateClicked = function () {
      if (!this.ModelBrowser ||
            !this.ModelBrowser.Webviewer ||
            !this.ModelBrowser.SelectionManager) {
            return;
      }

      var _this = this;
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

      if (nodeIds === 0) {
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
      model.setNodesVisibility([model.getAbsoluteRootNode()], true).then(function(){
            _this.ModelBrowser.Webviewer.view.fitWorld();
            
            _this.IsolateManager.IsolatedNodes = [];
      });      
}