function IsolateManager(webviewer)
{
    this.Webviewer = webviewer; 
    
    this.IsolatedNodes = [];
}


IsolateManager.prototype.Isolate = function (nodes, add) {
    return new Promise((resolve) => {
        var _this = this;

        if (add) {
            nodes = nodes.concat(this.IsolatedNodes);
        }
        _this.IsolatedNodes = nodes;
        this.Webviewer.view.isolateNodes(nodes).then(function () {          
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