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
        var overlay = document.getElementById("resetDataOverlay");
        var popup = document.getElementById("resetDataPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "154px";

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    }

    // on clear data
    document.getElementById(MenuBar.ClearDataBtn).onclick = function () {
        var overlay = document.getElementById("clearAllDataOverlay");
        var popup = document.getElementById("clearAllDataPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "154px";

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
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
        var overlay = document.getElementById("saveDataOverlay");
        var popup = document.getElementById("saveDataPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "154px";

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
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

function cancelClearAllData() {
    hideClearAllDataForm();
}

function clearAllData() {
    hideClearAllDataForm();
}

function hideClearAllDataForm() {
    var overlay = document.getElementById("clearAllDataOverlay");
    var popup = document.getElementById("clearAllDataPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function cancelResetData() {
    hideResetDataForm();
}

function resetData() {
    hideResetDataForm();
}

function hideResetDataForm() {
    var overlay = document.getElementById("resetDataOverlay");
    var popup = document.getElementById("resetDataPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function cancelSaveData() {
    hideSaveDataForm();
}

function saveData() {
    CheckModule.onSaveProgress(false).then(function (result) {
        hideSaveDataForm();
    });
}

function hideSaveDataForm() {
    var overlay = document.getElementById("saveDataOverlay");
    var popup = document.getElementById("saveDataPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}