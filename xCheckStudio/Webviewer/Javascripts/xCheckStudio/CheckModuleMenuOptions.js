function enableMenuOptions(disabledItems) {

    if (disabledItems.indexOf(MenuBar.ShowAllBtn) === -1) {
        // on show All
        document.getElementById(MenuBar.ShowAllBtn).onclick = function () {
            if (model.views[model.currentTabId] !== null) {
                model.views[model.currentTabId].viewerContextMenu.OnShowAllClicked();
            }
        }
    }
    else {
        document.getElementById(MenuBar.ShowAllBtn).style.opacity = 0.2;
    }

    if (disabledItems.indexOf(MenuBar.ReloadDataBtn) === -1) {
        // on reload data
        document.getElementById(MenuBar.ReloadDataBtn).onclick = function () {
            var overlay = document.getElementById("uiBlockingOverlay");
            var popup = document.getElementById("resetDataPopup");

            overlay.style.display = 'block';
            popup.style.display = 'block';

            popup.style.width = "581px";
            popup.style.height = "154px";

            popup.style.top = ((window.innerHeight / 2) - 139) + "px";
            popup.style.left = ((window.innerWidth / 2) - 290) + "px";
        }
    }
    else {
        document.getElementById(MenuBar.ReloadDataBtn).style.opacity = 0.2;
    }

    if (disabledItems.indexOf(MenuBar.ClearDataBtn) === -1) {
        // on clear data
        document.getElementById(MenuBar.ClearDataBtn).onclick = function () {
            var overlay = document.getElementById("uiBlockingOverlay");
            var popup = document.getElementById("clearAllDataPopup");

            overlay.style.display = 'block';
            popup.style.display = 'block';

            popup.style.width = "581px";
            popup.style.height = "154px";

            popup.style.top = ((window.innerHeight / 2) - 139) + "px";
            popup.style.left = ((window.innerWidth / 2) - 290) + "px";
        }
    }
    else {
        document.getElementById(MenuBar.ClearDataBtn).style.opacity = 0.2;
    }

    if (disabledItems.indexOf(MenuBar.RevisionBtn) === -1) {
        // on Revision
        document.getElementById(MenuBar.RevisionBtn).onclick = function () {
            alert("Not Handled");
        }
    }
    else {
        document.getElementById(MenuBar.RevisionBtn).style.opacity = 0.2;
    }

    if (disabledItems.indexOf(MenuBar.DisplayBtn) === -1) {
        // on Display
        document.getElementById(MenuBar.DisplayBtn).onclick = function () {
            if (!model.currentTabId ||
                !model.currentTabId in model.views) {
                return;
            }

            if (!model.views[model.currentTabId].displayMenu) {
                return;
            }

            model.views[model.currentTabId].displayMenu.Toggle();
        }
    }
    else {
        document.getElementById(MenuBar.DisplayBtn).style.opacity = 0.2;
    }

    if (disabledItems.indexOf(MenuBar.CheckInfoBtn) === -1) {
        // on check info
        document.getElementById(MenuBar.CheckInfoBtn).onclick = function () {
            alert("Not Handled");
        }
    }
    else {
        document.getElementById(MenuBar.CheckInfoBtn).style.opacity = 0.2;
    }

    if (disabledItems.indexOf(MenuBar.SaveProgressBtn) === -1) {
        // on save progress
        document.getElementById(MenuBar.SaveProgressBtn).onclick = function () {
            var overlay = document.getElementById("uiBlockingOverlay");
            var popup;
            if (isDataVault()) {
                popup = document.getElementById("saveVaultPopup");
            }
            else {
                popup = document.getElementById("saveDataPopup");
            }

            overlay.style.display = 'block';
            popup.style.display = 'block';

            popup.style.width = "581px";
            popup.style.height = "154px";

            popup.style.top = ((window.innerHeight / 2) - 139) + "px";
            popup.style.left = ((window.innerWidth / 2) - 290) + "px";
        }
    }
    else {
        document.getElementById(MenuBar.SaveProgressBtn).style.opacity = 0.2;
    }

    if (disabledItems.indexOf(MenuBar.NavCubeBtn) === -1) {
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
    else {
        document.getElementById(MenuBar.NavCubeBtn).style.opacity = 0.2;
    }

}

function cancelClearAllData() {
    hideClearAllDataForm();
}

function clearAllData() {
    removeAllDataSourcesFromDB().then(function (result) {

        while (model.activeTabs > 0) {
            var tabToDelete = document.getElementById("tab_" + model.currentTabId)
            viewTabs.deleteTab(tabToDelete);
        }

        // show all available checkcases
        filterCheckCases(true);

        hideClearAllDataForm();
    });
}

function hideClearAllDataForm() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("clearAllDataPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}


function removeAllDataSourcesFromDB() {
    return new Promise((resolve) => {
        // clean up all temporary files and variables
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "RemoveAllSources",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                return resolve(true);
            }
        });
    });
}

function cancelResetData() {
    hideResetDataForm();
}

function resetData() {
    hideResetDataForm();

    localStorage.setItem("dataVaultEnable", "false");
    if(vaultEnable === true)
    {
        localStorage.setItem("dataVaultEnable", "true");
    }

    // reload check page
    window.location.href = "checkPage.html";
}

function hideResetDataForm() {
    var overlay = document.getElementById("uiBlockingOverlay");
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
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("saveDataPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function cancelSaveVault() {
    hideSaveVaultForm();
}

function hideSaveVaultForm() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("saveVaultPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}