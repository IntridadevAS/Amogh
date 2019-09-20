var ReviewDrawerMenu = {

    create: function () {
        this.drawer = $("#drawer").dxDrawer({
            opened: false,
            height: "50%",
            closeOnOutsideClick: true,
            openedStateMode: "overlap",
            position: "left",
            revealMode: "expand",
            template: function () {
                var $list = $("<div>").addClass("panel-list");

                return $list.dxList({
                    dataSource: navigation,
                    hoverStateEnabled: false,
                    focusStateEnabled: false,
                    activeStateEnabled: false,
                    width: 200,
                    elementAttr: { class: "dx-theme-accent-as-background-color" },
                    selectionMode: "single",
                    onSelectionChanged: function (e) {
                        //$("#view").load( e.addedItems[0].filePath + ".html" );
                        e.addedItems[0].click();
                    },
                });
            }
        }).dxDrawer("instance");

        var _this = this;
        document.getElementById("mainMenu").onclick = function () {
            _this.drawer.toggle();
        }
    },

    onProjectsClicked: function () {

        var overlay = document.getElementById("returnProjectCenterOverlay");
        var popup = document.getElementById("returnProjectCenterPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";
    },

    onCheckClicked: function () {

    },

    onPREPClicked: function () {

        var overlay = document.getElementById("returnPREPOverlay");
        var popup = document.getElementById("returnPREPPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";
    },

    onHelpClicked: function () {
    },

    onSettingsClicked: function () {
    },

    onSignOutClicked: function () {

        var overlay = document.getElementById("signOutOverlay");
        var popup = document.getElementById("signOutPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";
        // if (confirm("You will be signed out.\nAre you sure?")) {
        //    localStorage.removeItem("userinfo");
        //    window.location.href = "index.html";
        // }
    },
    onHomeClick: function () {

        var overlay = document.getElementById("returnHomeOverlay");
        var popup = document.getElementById("returnHomePopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";
    }
}

var navigation = [
    {
        id: 1,
        text: "Home",
        click: function () {
            ReviewDrawerMenu.onHomeClick();
        }
    },
    {
        id: 2,
        text: "Projects",
        click: function () {
            ReviewDrawerMenu.onProjectsClicked();
        }
    },
    {
        id: 3,
        text: "Check",
        click: function () {
            ReviewDrawerMenu.onCheckClicked();
        }
    },
    {
        id: 4,
        text: "Prep",
        click: function () {
            ReviewDrawerMenu.onPREPClicked();
        }
    },
    {
        id: 5,
        text: "Help",
        click: function () {
            ReviewDrawerMenu.onHelpClicked();
        }
    },
    {
        id: 6,
        text: "Settings",
        click: function () {
            ReviewDrawerMenu.onSettingsClicked();
        }
    },
    {
        id: 7,
        text: "Sign Out",
        click: function () {
            ReviewDrawerMenu.onSignOutClicked();
        }
    }
];

function cancelReturnHome() {
    var overlay = document.getElementById("returnHomeOverlay");
    var popup = document.getElementById("returnHomePopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function returnHome() {
    window.location = "landingPage.html";
}

function cancelReturnProjectCenter() {
    var overlay = document.getElementById("returnProjectCenterOverlay");
    var popup = document.getElementById("returnProjectCenterPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function returnProjectCenter() {
    window.location = "projectsPage.html";
}

function cancelReturnPREP() {
    var overlay = document.getElementById("returnPREPOverlay");
    var popup = document.getElementById("returnPREPPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function returnToPREP() {
    window.location = "prephomepage.html";
}


function cancelSignOut() {
    var overlay = document.getElementById("signOutOverlay");
    var popup = document.getElementById("signOutPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function signOut() {
    onLogoutUser().then(function (status) {
        if (status) {
            window.location.href = "index.html";
        }
    });
}