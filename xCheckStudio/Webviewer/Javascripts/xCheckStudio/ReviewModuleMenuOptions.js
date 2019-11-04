function enableMenuOptions() {

    // on re check
    document.getElementById(MenuBar.ReCheckBtn).onclick = function () {
        alert("Not Handled");
    }

    // on show all
    document.getElementById(MenuBar.ShowAllBtn).onclick = function () {
        var currentCheck = model.checks[model.currentCheck];
        if (model.currentCheck === "comparison") {
            if (currentCheck.sourceAViewer &&
                currentCheck.sourceAViewer.ViewerOptions) {
                ReviewMenuOptions.showAll(currentCheck.sourceAViewer.Viewer);
                currentCheck.sourceAViewer.ShowHiddenRows();
            }
            if (currentCheck.sourceBViewer &&
                currentCheck.sourceBViewer.ViewerOptions) {
                ReviewMenuOptions.showAll(currentCheck.sourceBViewer.Viewer);
                currentCheck.sourceBViewer.ShowHiddenRows();
            }
            if (currentCheck.sourceCViewer &&
                currentCheck.sourceCViewer.ViewerOptions) {
                ReviewMenuOptions.showAll(currentCheck.sourceCViewer.Viewer);
                currentCheck.sourceCViewer.ShowHiddenRows();
            }
            if (currentCheck.sourceDViewer &&
                currentCheck.sourceDViewer.ViewerOptions) {
                ReviewMenuOptions.showAll(currentCheck.sourceDViewer.Viewer);
                currentCheck.sourceDViewer.ShowHiddenRows();
            }
        }
        else if (model.currentCheck === "compliance") {
            if (currentCheck.viewer &&
                currentCheck.viewer.ViewerOptions) {
                ReviewMenuOptions.showAll(currentCheck.viewer.Viewer);
                currentCheck.viewer.ShowHiddenRows();
            }
        }
    }

    // on history
    document.getElementById(MenuBar.HistoryBtn).onclick = function () {
        alert("Not Handled");
    }

    // on units
    document.getElementById(MenuBar.UnitsBtn).onclick = function () {
        alert("Not Handled");
    }

    // on check info
    document.getElementById(MenuBar.CheckInfoBtn).onclick = function () {
        alert("Not Handled");
    }

    // on save 
    document.getElementById(MenuBar.SaveProgressBtn).onclick = function () {
        ReviewModule.onSaveProgress();
    }

    // on reset
    document.getElementById(MenuBar.ResetBtn).onclick = function () {
        alert("Not Handled");
    }

    // on navigation cube
    document.getElementById(MenuBar.NavCubeBtn).onclick = function () {
        
        if (model.currentCheck in model.checks) {
            var check = model.checks[model.currentCheck];
            if (model.currentCheck === "comparison") {
                if (check.sourceAViewer &&
                    check.sourceAViewer.Is3DViewer()) {
                    toggleNavCube(check.sourceAViewer.Viewer);
                }
                if (check.sourceBViewer &&
                    check.sourceBViewer.Is3DViewer()) {
                    toggleNavCube(check.sourceBViewer.Viewer);
                }
                if (check.sourceCViewer &&
                    check.sourceCViewer.Is3DViewer()) {
                    toggleNavCube(check.sourceCViewer.Viewer);
                }
                if (check.sourceDViewer &&
                    check.sourceDViewer.Is3DViewer()) {
                    toggleNavCube(check.sourceDViewer.Viewer);
                }
            }
            else if (model.currentCheck === "compliance") {
                if (check.viewer &&
                    check.viewer.Is3DViewer()) {
                    toggleNavCube(check.viewer.Viewer);
                }
            }
        }
    }   
}

var ReviewMenuOptions =
{
    showAll: function (viewer) {
        if (!viewer) {
            return;
        }

        viewer.model.setNodesVisibility([viewer.model.getAbsoluteRootNode()], true).then(function () {
            viewer.view.fitWorld();
        });
    },
};