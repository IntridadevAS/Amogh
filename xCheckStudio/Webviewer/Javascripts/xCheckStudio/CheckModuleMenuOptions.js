function enableMenuOptions() {
    // on isolate
    document.getElementById("isolate").onclick = function () {
        if (currentTabId in SourceManagers) {
            var sourceManager = SourceManagers[currentTabId];
            if (!sourceManager.CheckViewerContextMenu) {
                return;
            }

            sourceManager.CheckViewerContextMenu.OnIsolateClicked();
        }
    }

    // on isolate
    document.getElementById("show").onclick = function () {
        if (currentTabId in SourceManagers) {
            var sourceManager = SourceManagers[currentTabId];
            if (!sourceManager.CheckViewerContextMenu) {
                return;
            }

            sourceManager.CheckViewerContextMenu.OnShowAllClicked();
        }
    }

    // on isolate
    document.getElementById("hide").onclick = function () {
        if (currentTabId in SourceManagers) {
            var sourceManager = SourceManagers[currentTabId];
            if (!sourceManager.CheckViewerContextMenu) {
                return;
            }

            sourceManager.CheckViewerContextMenu.OnHideClicked();
        }
    }
}