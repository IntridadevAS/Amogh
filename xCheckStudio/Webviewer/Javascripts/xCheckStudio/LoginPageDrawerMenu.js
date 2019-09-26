var LoginPageDrawerMenu = {

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
                    hoverStateEnabled: false,
                    focusStateEnabled: false,
                    activeStateEnabled: false,
                    width: 200,
                    elementAttr: { class: "dx-theme-accent-as-background-color" },
                    selectionMode: "single",
                    onSelectionChanged: function (e) {
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
        text: "Version Info",
        //icon: "public/symbols/InfoMenu.svg",
        click: function () {
            menu.onVersionInfoClicked();
        }
    },
    {
        id: 2,
        text: "Help",
        //icon: "public/symbols/Group 99.svg",
        click: function () {
            menu.onHelpClicked();
        }
    },
    {
        id: 3,
        text: "FAQs",
        // icon: "public/symbols/check.png",
        click: function () {
            menu.onFAQsClicked();
        }
    },
    {
        id: 4,
        text: "What's New",
        // icon: "public/symbols/prep.png",
        click: function () {
            menu.onWhatsNewClicked();
        }
    },
    {
        id: 5,
        text: "Exit",
        //icon: "public/symbols/closeWin.svg",
        click: function () {
            menu.onExitClicked();
        }
    }
];

let menu = {
    onVersionInfoClicked: function () {

    },
    onHelpClicked: function () {

    },
    onFAQsClicked: function () {

    },
    onWhatsNewClicked: function () {

    },
    onExitClicked: function () {
        var overlay = document.getElementById("exitOverlay");
        var popup = document.getElementById("exitPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";


        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    },
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

function swapIcon() {
    var menuIcon = document.getElementById("menuIcon").src
    if (menuIcon.includes("MenuRound.svg")) {
        document.getElementById("menuIcon").src = "public/symbols/Backward Arrow.png";
    }
    else {
        document.getElementById("menuIcon").src = "public/symbols/MenuRound.svg";
    }
}

function cancelExit() {
    var overlay = document.getElementById("exitOverlay");
    var popup = document.getElementById("exitPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function exit() {
    onclosewindow();
}
