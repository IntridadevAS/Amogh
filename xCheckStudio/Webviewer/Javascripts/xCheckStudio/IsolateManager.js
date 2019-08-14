function IsolateManager(webviewer)
{
    this.Webviewer = webviewer; 
    
    this.IsolatedNodes = [];
}


IsolateManager.prototype.Isolate = function (nodes) {
    return new Promise((resolve) => {
         var _this = this;

          this.Webviewer.view.isolateNodes(nodes).then(function () {
               
                _this.IsolatedNodes = nodes;
                
                return resolve(nodes);
          });
    });
}

/* This methode is called from right click context menu item 'Isolate' where
   viewer on which right click is performed is 'currentViewer'*/
function isolate() {
    if (!currentViewer) {
        return;
    }

    var selectionManager = currentViewer.selectionManager;
   
    var selectedNodes = [];
    selectionManager.each(function (selectionItem) {
        if (selectionItem.isNodeSelection()) {
            selectedNodes.push(selectionItem._nodeId);
        }
    });

     // perform isolate
     var isolateManager = new IsolateManager(currentViewer);
     isolateManager.Isolate(selectedNodes).then(function (affectedNodes) {

     });
}