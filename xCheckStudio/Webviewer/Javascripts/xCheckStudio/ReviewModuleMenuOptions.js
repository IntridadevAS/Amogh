function enableMenuOptions() {
    // on isolate
    document.getElementById("isolate").onclick = function () {

        var currentCheck = model.checks[model.currentCheck];
        if (model.currentCheck === "comparison") {
            if (currentCheck.sourceAViewer &&
                currentCheck.sourceAViewer.ViewerOptions) {
                ReviewMenuOptions.isolateSelectedComponents(currentCheck.sourceAViewer.Viewer);
            }
            if (currentCheck.sourceBViewer &&
                currentCheck.sourceBViewer.ViewerOptions) {
                ReviewMenuOptions.isolateSelectedComponents(currentCheck.sourceBViewer.Viewer);
            }
            if (currentCheck.sourceCViewer &&
                currentCheck.sourceCViewer.ViewerOptions) {
                ReviewMenuOptions.isolateSelectedComponents(currentCheck.sourceCViewer.Viewer);
            }
            if (currentCheck.sourceDViewer &&
                currentCheck.sourceDViewer.ViewerOptions) {
                ReviewMenuOptions.isolateSelectedComponents(currentCheck.sourceDViewer.Viewer);
            }
        }
        else if (model.currentCheck === "compliance") {
            if (currentCheck.viewer &&
                currentCheck.viewer.ViewerOptions) {
                ReviewMenuOptions.isolateSelectedComponents(currentCheck.viewer.Viewer);
            }
        }
    }

    // on show all
    document.getElementById("show").onclick = function () {
        var currentCheck = model.checks[model.currentCheck];
        if (model.currentCheck === "comparison") {
            if (currentCheck.sourceAViewer &&
                currentCheck.sourceAViewer.ViewerOptions) {
                ReviewMenuOptions.showAll(currentCheck.sourceAViewer.Viewer);
            }
            if (currentCheck.sourceBViewer &&
                currentCheck.sourceBViewer.ViewerOptions) {
                ReviewMenuOptions.showAll(currentCheck.sourceBViewer.Viewer);
            }
            if (currentCheck.sourceCViewer &&
                currentCheck.sourceCViewer.ViewerOptions) {
                ReviewMenuOptions.showAll(currentCheck.sourceCViewer.Viewer);
            }
            if (currentCheck.sourceDViewer &&
                currentCheck.sourceDViewer.ViewerOptions) {
                ReviewMenuOptions.showAll(currentCheck.sourceDViewer.Viewer);
            }
        }
        else if (model.currentCheck === "compliance") {
            if (currentCheck.viewer &&
                currentCheck.viewer.ViewerOptions) {
                ReviewMenuOptions.showAll(currentCheck.viewer.Viewer);
            }
        }
    }

    // on hide
    document.getElementById("hide").onclick = function () {
        var currentCheck = model.checks[model.currentCheck];
        if (model.currentCheck === "comparison") {
            if (currentCheck.sourceAViewer &&
                currentCheck.sourceAViewer.ViewerOptions) {
                ReviewMenuOptions.hide(currentCheck.sourceAViewer.Viewer);
            }
            if (currentCheck.sourceBViewer &&
                currentCheck.sourceBViewer.ViewerOptions) {
                ReviewMenuOptions.hide(currentCheck.sourceBViewer.Viewer);
            }
            if (currentCheck.sourceCViewer &&
                currentCheck.sourceCViewer.ViewerOptions) {
                ReviewMenuOptions.hide(currentCheck.sourceCViewer.Viewer);
            }
            if (currentCheck.sourceDViewer &&
                currentCheck.sourceDViewer.ViewerOptions) {
                ReviewMenuOptions.hide(currentCheck.sourceDViewer.Viewer);
            }
        }
        else if (model.currentCheck === "compliance") {
            if (currentCheck.viewer &&
                currentCheck.viewer.ViewerOptions) {
                ReviewMenuOptions.hide(currentCheck.viewer.Viewer);
            }
        }
    }

     // on properties
     document.getElementById("properties").onclick = function () {
         alert("need to implement.");
     }

     // on clearData
     document.getElementById("clearData").onclick = function () {
        alert("need to implement.");
    }

    // on saveProgress
    document.getElementById("saveProgress").onclick = function () {
        alert("need to implement.");
    }

    // on history
    document.getElementById("history").onclick = function () {
        alert("need to implement.");
    }

    // on checkInfo
    document.getElementById("checkInfo").onclick = function () {
        alert("need to implement.");
    }
}

var ReviewMenuOptions =
{
    isolateSelectedComponents: function (viewer) {
        if (!viewer) {
            return;
        }

        var selectionManager = viewer.selectionManager;

        var selectedNodes = [];
        selectionManager.each(function (selectionItem) {
            if (selectionItem.isNodeSelection()) {
                selectedNodes.push(selectionItem._nodeId);
            }
        });

        // perform isolate
        var isolateManager = new IsolateManager(viewer);
        isolateManager.Isolate(selectedNodes).then(function (affectedNodes) {

        });
    },

    showAll: function (viewer) {
        if (!viewer) {
            return;
        }

        viewer.model.setNodesVisibility([viewer.model.getAbsoluteRootNode()], true).then(function () {
            viewer.view.fitWorld();
        });
    },

    hide: function (viewer) {
        var results = viewer.selectionManager.getResults();

        var map = {};
        for (var i = 0; i < results.length; i++) {
            var selectedItem = results[i];
            map[selectedItem._nodeId] = false;
        }

        viewer.model.setNodesVisibilities(map);
    }
};