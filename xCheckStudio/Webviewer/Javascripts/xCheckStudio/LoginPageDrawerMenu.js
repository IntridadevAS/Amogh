var LoginPageDrawerMenu = {
    
    create: function (disableItems) {
        this.drawer = $("#drawer").dxDrawer({
            opened: false,
            height: "100%",
            closeOnOutsideClick: false,
            openedStateMode: "overlap",
            position: "left",
            revealMode: "expand",
            template: function () {
                var $list = $("<div>").addClass("panel-list");
                if (disableItems) {
                    disableMenuItems(disableItems);
                }
                
                // $list.mouseover(function () {
                //     this.style.opacity = 1;
                // });
                // $list.mouseout(function () {
                //     this.style.opacity = 0.2;
                // });

                return $list.dxList({
                    
                    dataSource: menuItems,
                    hoverStateEnabled: true,
                    focusStateEnabled: true,
                    activeStateEnabled: false,
                    width: "80px",
                    elementAttr: { class: "dx-theme-accent-as-background-color" },
                    selectionMode: "single",
                    itemTemplate: function(data, index) {
                        var result = $("<div>").addClass("menuItem");                
                       
                        $("<img>").attr({
                            "src": data.ImageSrc,
                             style: "width: 25px; height: 25px;"
                        }).appendTo(result);
                        $("<div>").text(data.Title).attr({                            
                            style: "white-space: initial;"
                        }).appendTo(result);
                                        
                        return result;                
                    },
                    onSelectionChanged: function (e) {
                        if (e.component._selection.getSelectedItems().length > 0)
                        {
                            e.addedItems[0].click(e);
                            e.component._selection.deselectAll();
                        }
                    },
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
        Title: "Version Info",
        ImageSrc: "public/symbols/VersionInfo.svg",
        click: function () {
            menu.onVersionInfoClicked();
        }
    },
    {
        id: 2,
        Title: "What's New",
        ImageSrc: "public/symbols/WhatsNew.svg",
        click: function () {
            menu.onWhatsNewClicked();
        }
    },
    {
        id: 3,
        Title: "FAQs",
        ImageSrc: "public/symbols/FAQ.svg",
        click: function () {
            menu.onFAQsClicked();
        }
    },
    {
        id: 4,
        Title: "Help",
        ImageSrc: "public/symbols/Help.svg",
        click: function () {
            menu.onHelpClicked();
        }
    },
    {
        id: 5,
        Title: "Exit",
        ImageSrc: "public/symbols/Exit.svg",
        click: function () {
            menu.onExitClicked();
        }
    }
];

let menu = {
    onVersionInfoClicked: function () {
        console.log("onVersionInfoClicked");
    },
    onHelpClicked: function () {
        console.log("onHelpClicked");
    },
    onFAQsClicked: function () {
        console.log("onFAQsClicked");
    },
    onWhatsNewClicked: function () {
        console.log("onWhatsNewClicked");
    },
    onExitClicked: function () {
        console.log("onExitClicked");
        var overlay = document.getElementById("uiBlockingOverlay");
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
            if (menuItem.Title.toLowerCase() === items[i].toLowerCase()) {
                menuItem["disabled"] = true;
            }
        }
    }
}

function swapIcon() {
    var menuIcon = document.getElementById("menuIcon").src
    if (menuIcon.includes("Menu.svg")) {
        document.getElementById("menuIcon").src = "public/symbols/Close.svg";
    }
    else {
        document.getElementById("menuIcon").src = "public/symbols/Menu.svg";
    }
}

function cancelExit() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("exitPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function exit() {
    onclosewindow();
}
