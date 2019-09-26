function enableMenuOptions() {
    // on isolate
    document.getElementById("isolate").onclick = function () {
        if (model.currentTabId in SourceManagers) {
            var sourceManager = SourceManagers[model.currentTabId];
            if (!sourceManager.CheckViewerContextMenu) {
                return;
            }

            sourceManager.CheckViewerContextMenu.OnIsolateClicked();
        }
    }

    // on isolate
    document.getElementById("show").onclick = function () {
        if (model.currentTabId in SourceManagers) {
            var sourceManager = SourceManagers[model.currentTabId];
            if (!sourceManager.CheckViewerContextMenu) {
                return;
            }

            sourceManager.CheckViewerContextMenu.OnShowAllClicked();
        }
    }

    // on isolate
    document.getElementById("hide").onclick = function () {
        if (model.currentTabId in SourceManagers) {
            var sourceManager = SourceManagers[model.currentTabId];
            if (!sourceManager.CheckViewerContextMenu) {
                return;
            }

            sourceManager.CheckViewerContextMenu.OnHideClicked();
        }
    }
}