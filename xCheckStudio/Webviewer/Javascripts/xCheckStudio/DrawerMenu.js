var DrawerMenu = {

    create: function (disableItems) {
        this.drawer = $("#drawer").dxDrawer({
            opened: false,
            height: "50%",
            closeOnOutsideClick: false,
            openedStateMode: "overlap",
            position: "left",
            revealMode: "expand",
            template: function () {
                var $list = $("<div>").addClass("panel-list");
                if (disableItems) {
                    disableMenuItems(disableItems);
                }

                return $list.dxList({
                    dataSource: menuItems,
                    hoverStateEnabled: true,
                    focusStateEnabled: true,
                    activeStateEnabled: false,
                    width: 200,
                    elementAttr: { class: "dx-theme-accent-as-background-color" },
                    selectionMode: "single",
                    onSelectionChanged: function (e) {                       
                        if (e.component._selection.getSelectedItems().length > 0)
                        {
                            e.addedItems[0].click(e);
                            e.component._selection.deselectAll();
                        }
                    }
                });
            },
            closeOnOutsideClick: function(e) {
                if(drawerOpened === true) {
                    drawerOpened = false;
                    swapIcon();
                }
                return true;
            },
            onOptionChanged:function (e) {
                if(e.value === true) 
                    drawerOpened = !drawerOpened;
            },
        }).dxDrawer("instance");

        var _this = this;
        var drawerOpened = false;
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
        icon: "public/symbols/home.png",
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
        text: "Check",
        icon: "public/symbols/check.png",
        click: function () {
            menu.onCheckClicked();
        }
    },
    {
        id: 4,
        text: "Prep",
        icon: "public/symbols/prep.png",
        click: function () {
            menu.onPREPClicked();
        }
    },
    {
        id: 5,
        text: "Help",
        icon: "public/symbols/Group 99.svg",
        click: function () {
            menu.onHelpClicked();
        }
    },
    {
        id: 6,
        text: "Output",
        icon: "public/symbols/Output.png",
        click: function () {
            menu.onOutputClicked();
        }
    },
    {
        id: 7,
        text: "Reports",
        icon: "public/symbols/reports.png",
        click: function () {
            menu.onReportsClicked();
        }
    },
    {
        id: 8,
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

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    },

    onProjectsClicked: function () {
        var overlay = document.getElementById("returnProjectCenterOverlay");
        var popup = document.getElementById("returnProjectCenterPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    },

    onCheckClicked: function () {
        var overlay = document.getElementById("returnCheckOverlay");
        var popup = document.getElementById("returnCheckPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    },

    onPREPClicked: function () {
        var overlay = document.getElementById("returnPREPOverlay");
        var popup = document.getElementById("returnPREPPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    },

    onHelpClicked: function () {
    },

    onSettingsClicked: function () {
    },

    onOutputClicked: function () {
    },

    onReportsClicked: function () {
    },

    onSignOutClicked: function () {
        var overlay = document.getElementById("signOutOverlay");
        var popup = document.getElementById("signOutPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    }
}

function cancelReturnHome() {
    var overlay = document.getElementById("returnHomeOverlay");
    var popup = document.getElementById("returnHomePopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function returnHome(callbackFunction) {
    if (callbackFunction) {
        callbackFunction().then(function (result) {
            window.location = "landingPage.html";
        });
    }
    else {
        window.location = "landingPage.html";
    }
}

function cancelReturnProjectCenter() {
    var overlay = document.getElementById("returnProjectCenterOverlay");
    var popup = document.getElementById("returnProjectCenterPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function returnProjectCenter(callbackFunction) {
    if (callbackFunction) {
      callbackFunction().then(function (result) {
        window.location = "projectsPage.html";
      });
    }
    else {
        window.location = "projectsPage.html";
    }   
}

function cancelReturnPREP() {
    var overlay = document.getElementById("returnPREPOverlay");
    var popup = document.getElementById("returnPREPPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function returnToPREP(callbackFunction) {
    if (callbackFunction) {
        callbackFunction().then(function (result) {
            window.location = "prephomepage.html";
        });
    }
    else {
        window.location = "prephomepage.html";
    }
}

function cancelSignOut() {
    var overlay = document.getElementById("signOutOverlay");
    var popup = document.getElementById("signOutPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function signOut(callbackFunction) {
    if (callbackFunction) {
        callbackFunction().then(function (result) {
            onLogoutUser().then(function (status) {
                if (status) {
                    window.location.href = "index.html";
                }
            });
        });
    }
    else {
        onLogoutUser().then(function (status) {
            if (status) {
                window.location.href = "index.html";
            }
        });
    }
}

function swapIcon() {
    var menuIcon = document.getElementById("menuIcon").src
    if (menuIcon.includes("MenuRound.svg")) {
        document.getElementById("menuIcon").src = "public/symbols/Backward Arrow.png";
    }
    else {
        document.getElementById("menuIcon").src = "public/symbols/MenuRound.svg";
    }
}

function cancelReturnCheck() {
    var overlay = document.getElementById("returnCheckOverlay");
    var popup = document.getElementById("returnCheckPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function returnCheck(callbackFunction) {
    if (callbackFunction) {
        callbackFunction();
    }

    window.location = "checkPage.html";
}

function disableMenuItems(items) {
    for (var i = 0; i < items.length; i++) {
        for (var j = 0; j < menuItems.length; j++) {
            var menuItem = menuItems[j];
            if (menuItem.text.toLowerCase() === items[i].toLowerCase()) {
                menuItem["disabled"] = true;
            }
        }
    }
}