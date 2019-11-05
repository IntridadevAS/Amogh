function enableMenuOptions() {
    // on show All
    document.getElementById(MenuBar.ShowAllBtn).onclick = function () {
        if (model.currentTabId in SourceManagers) {
            var sourceManager = SourceManagers[model.currentTabId];
            if (!sourceManager.CheckViewerContextMenu) {
                return;
            }

            sourceManager.CheckViewerContextMenu.OnShowAllClicked();
        }
    }

    // on reload data
    document.getElementById(MenuBar.ReloadDataBtn).onclick = function () {
        alert("Not Handled");
    }

    // on clear data
    document.getElementById(MenuBar.ClearDataBtn).onclick = function () {
        alert("Not Handled");
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

    // on save progress
    document.getElementById(MenuBar.SaveProgressBtn).onclick = function () {
        CheckModule.onSaveProgress(false);
    }

    // on navigation cube
    document.getElementById(MenuBar.NavCubeBtn).onclick = function () {
        if (model.currentTabId in SourceManagers) {
            var sourceManager = SourceManagers[model.currentTabId];
            if (sourceManager.Is3DSource()) {
                toggleNavCube(sourceManager.Webviewer);
            }
        }
    }
}