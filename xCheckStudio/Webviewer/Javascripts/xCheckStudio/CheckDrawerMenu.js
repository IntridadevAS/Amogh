var CheckDrawerMenu = {

    create: function () {
        this.drawer = $("#drawer").dxDrawer({
            opened: false,
            height: "50%",
            closeOnOutsideClick: false,
            openedStateMode: "overlap",
            position: "left",
            revealMode: "expand",
            template: function () {
                var $list = $("<div>").addClass("panel-list");

                return $list.dxList({
                    dataSource: menuItems,
                    hoverStateEnabled: false,
                    focusStateEnabled: false,
                    activeStateEnabled: false,
                    width: 200,
                    elementAttr: { class: "dx-theme-accent-as-background-color" },
                    selectionMode: "single",
                    onSelectionChanged: function (e) {
                        //$("#view").load( e.addedItems[0].filePath + ".html" );
                        e.addedItems[0].click();
                    }
                });
            }
        }).dxDrawer("instance");

        var _this = this;
        document.getElementById("mainMenu").onclick = function () {
            swapIcon();
            _this.drawer.toggle();
        }
    },
}

var menuItems = [
    {
        id: 1,
        text: "Home",
        // icon: "public/symbols/check.png",
        click: function () {
            menu.onHomeClick();
        }
    },
    {
        id: 2,
        text: "Projects",
        icon: "public/symbols/projects.png",
        click: function () {
            menu.onProjectsClicked();
        }
    },
    {
        id: 3,
        text: "Prep",
        icon: "public/symbols/prep.png",
        click: function () {
            menu.onPREPClicked();
        }
    },
    {
        id: 4,
        text: "Help",
        // icon: "public/symbols/prep.png",
        click: function () {
            menu.onHelpClicked();
        }
    },
    {
        id: 5,
        text: "Settings",
        // icon: "public/symbols/prep.png",
        click: function () {
            menu.onSettingsClicked();
        }
    },
    {
        id: 6,
        text: "Sign Out",
        icon: "public/symbols/logout.png",
        click: function () {
            menu.onSignOutClicked();
        }
    }
];

let menu = {

    onHomeClick: function () {

        var overlay = document.getElementById("returnHomeOverlay");
        var popup = document.getElementById("returnHomePopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";
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
    }
}

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

function swapIcon() {
    var menuIcon = document.getElementById("menuIcon").src
    if (menuIcon.includes("MenuRound.svg")) {
        document.getElementById("menuIcon").src = "public/symbols/Backward Arrow.svg";
    }
    else {
        document.getElementById("menuIcon").src = "public/symbols/MenuRound.svg";
    }
}