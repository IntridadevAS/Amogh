function hide() {
    if (currentViewer) {

        var results = currentViewer.selectionManager.getResults();

        var map = {};
        for (var i = 0; i < results.length; i++) {
            var selectedItem = results[i];
            map[selectedItem._nodeId] = false;           
        }

        currentViewer.model.setNodesVisibilities(map);
    }
}

function showAll() {

    if (!currentViewer) {
        return;
    }

    currentViewer.model.setNodesVisibility([currentViewer.model.getAbsoluteRootNode()], true).then(function () {
        currentViewer.view.fitWorld();        
    });    
}