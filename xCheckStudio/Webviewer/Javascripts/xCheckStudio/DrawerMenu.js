var DrawerMenu = {

    create: function (hiddenItems, disableItems) {
        this.drawer = $("#drawer").dxDrawer({
            opened: false,
            // height: "100%",
            closeOnOutsideClick: false,
            openedStateMode: "overlap",
            position: "left",
            revealMode: "expand",            
            template: function () {
                var $list = $("<div>").addClass("panel-list");
                hideMenuItems(hiddenItems);
                disableMenuItems(disableItems);               
                  
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
            onOptionChanged: function (e) {
                if (e.value === true) {
                    drawerOpened = !drawerOpened;
                }
                else {
                    drawerOpened = false;
                }
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
        Title: "Search",
        ImageSrc: "public/symbols/Search.svg",
        click: function () {
            menu.onSearchClick();
        }
    },
    {
        id: 2,
        Title: "Studio Modes",
        ImageSrc: "public/symbols/UserMode.svg",
        click: function () {
            menu.onStudioModesClick();
        }
    },
    {
        id: 3,
        Title: "Home",
        ImageSrc: "public/symbols/home.png",
        click: function () {
            menu.onHomeClick();
        }
    },
    {
        id: 4,
        Title: "Projects",
        ImageSrc: "public/symbols/projects.png",
        click: function () {
            if (window.location.pathname.toLowerCase().includes("landingpage.html")) {
                menu.onProjectsClickedDirectOpen();
            }
            else {
                menu.onProjectsClicked();
            }      
        }
    },
    {
        id: 5,
        Title: "Check",
        ImageSrc: "public/symbols/check.png",
        click: function () {
            menu.onCheckClicked();
        }
    },
    {
        id: 6,
        Title: "Review",
        ImageSrc: "public/symbols/Review_Module_Icon.svg",       
        click: function () {
            menu.onReviewClicked();
        }
    },
    {
        id: 7,
        Title: "Comments",
        ImageSrc: "public/symbols/Comments.svg",
        click: function () {
            menu.onCommentsClicked();
        }
    },
    {
        id: 8,
        Title: "Data Definitions",
        ImageSrc: "public/symbols/Properties.svg",
        click: function () {
            menu.onDataDefinitionsClicked();
        }
    },
    {
        id: 9,
        Title: "Reports",
        ImageSrc: "public/symbols/Reports.svg",
        click: function () {
            menu.onReportsClicked();
        }
    },
    {
        id: 10,
        Title: "Output",
        ImageSrc: "public/symbols/Output.svg",
        click: function () {
            menu.onOutputClicked();
        }
    },
    {
        id: 11,
        Title: "Preferences",
        ImageSrc: "public/symbols/Preferences.svg",
        click: function () {
            menu.onPreferencesClicked();
        }
    },
    {
        id: 12,
        Title: "Help",
        ImageSrc: "public/symbols/Help.svg",
        click: function () {
            menu.onHelpClicked();
        }
    },
    {
        id: 13,
        Title: "Sign Out",
        ImageSrc: "public/symbols/SignOut.svg",
        click: function () {
            menu.onSignOutClicked();
        }
    }
];

let menu = {

     onSearchClick: function () {
        console.log("Seacrh not implemented");
    },

    onStudioModesClick: function () {
        console.log("Studio Modes not implemented");
    },

    onReviewClicked: function () {
        swapIcon();
        DrawerMenu.drawer.hide();

        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("goToReviewPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    },

    onCommentsClicked: function () {
        swapIcon();
        DrawerMenu.drawer.hide();

        commentsCallout.Toggle();
    },

    onDataDefinitionsClicked: function () {
        model.views[model.currentTabId].dataDefinitionMenu.Open();
    },

    onPreferencesClicked: function () {
        console.log("Preferences not implemented");
    },

    onHomeClick: function () {
        swapIcon();
        DrawerMenu.drawer.hide();
        var overlay = document.getElementById("uiBlockingOverlay");

        var popup;

        if( (typeof isDataVault) !== "undefined"  && isDataVault() === true)
        {
            popup = document.getElementById("returnHomeFromVaultPopup");
        }
        else
        {
            popup = document.getElementById("returnHomePopup");
        }        

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    },

    onProjectsClickedDirectOpen: function() {
        window.location = "projectsPage.html";
    },

    onProjectsClicked: function () {
        swapIcon();
        // DrawerMenu.drawer.hide();
        var overlay = document.getElementById("uiBlockingOverlay");

        var popup;
        if( (typeof isDataVault) !== "undefined"  && isDataVault() === true){
            popup = document.getElementById("returnToProjectCenterFromVaultPopup");
        }
        else {
            popup = document.getElementById("returnProjectCenterPopup");
        }         

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    },

    onCheckClicked: function () {
        swapIcon();
        DrawerMenu.drawer.hide();
        var overlay = document.getElementById("uiBlockingOverlay");
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
        swapIcon();
        DrawerMenu.drawer.hide();
        var overlay = document.getElementById("uiBlockingOverlay");
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
        swapIcon();
        DrawerMenu.drawer.hide();
        const shell = require('electron').shell;
        shell.openExternal("https://www.intrida.com/");
    },

    onSettingsClicked: function () {
        swapIcon();
        DrawerMenu.drawer.hide();
    },

    onOutputClicked: function () {
        swapIcon();
        DrawerMenu.drawer.hide();
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("outputPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

    },

    onReportsClicked: function () {
        swapIcon();
        DrawerMenu.drawer.hide();
    },

    onSignOutClicked: function () {
        swapIcon();
        DrawerMenu.drawer.hide();
        var overlay = document.getElementById("uiBlockingOverlay");

        var popup;
        if( (typeof isDataVault) !== "undefined"  && isDataVault() === true){
            popup = document.getElementById("signOutFromVaultPopup");
        }
        else {
            popup = document.getElementById("signOutPopup");
        }                   

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "155px";
        popup.style.overflow = "hidden";

        popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    },

    onSignOutAllUsersClicked: function (){
        swapIcon();
        DrawerMenu.drawer.hide();
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("signOutAllUsersPopup");

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
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup;
    if( (typeof isDataVault) !== "undefined"  && isDataVault() === true){
        popup = document.getElementById("returnHomeFromVaultPopup");
    }
    else {
        popup = document.getElementById("returnHomePopup");
    }

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
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup;
    if( (typeof isDataVault) !== "undefined"  && isDataVault() === true){
        popup = document.getElementById("returnToProjectCenterFromVaultPopup");
    }
    else {
        popup = document.getElementById("returnProjectCenterPopup");
    }     

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
    var overlay = document.getElementById("uiBlockingOverlay");
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
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup;
    if( (typeof isDataVault) !== "undefined"  && isDataVault() === true){
        popup = document.getElementById("signOutFromVaultPopup");
    }
    else {
        popup = document.getElementById("signOutPopup");
    } 

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function signOut(callbackFunction) {
    if (callbackFunction) {
        callbackFunction().then(function (result) {
            onLogoutUser("No").then(function (status) {
                if (status) {
                    window.location.href = "index.html";
                }
            });
        });
    }
    else {
        onLogoutUser("No").then(function (status) {
            if (status) {
                window.location.href = "index.html";
            }
        });
    }
}

function cancelSignOutAllUsers() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("signOutAllUsersPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function signOutAllUsers(callbackFunction) {
    if (callbackFunction) {
        callbackFunction().then(function (result) {
            onLogoutUser("Yes").then(function (status) {
                var overlay = document.getElementById("uiBlockingOverlay");
                var popup = document.getElementById("signOutAllUsersPopup");

                overlay.style.display = 'none';
                popup.style.display = 'none';
            });
        });
    }
    else {
        onLogoutUser("Yes").then(function (status) {
                var overlay = document.getElementById("uiBlockingOverlay");
                var popup = document.getElementById("signOutAllUsersPopup");

                overlay.style.display = 'none';
                popup.style.display = 'none';
        });
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

function cancelReturnCheck() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("returnCheckPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function closeOutpuToOverlay() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("outputPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function returnCheck(callbackFunction) {
    if (callbackFunction) {
        callbackFunction();
    }

    window.location = "checkPage.html";
}

function hideMenuItems(items) {
    var disabledMenuItem=[];
    // create drawer menu
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    if (userinfo.permission.toLowerCase() === 'reviewer') {
        disabledMenuItem = ["check", "output", "reports"];
    }

    if (userinfo.type.toLowerCase() !== 'admin') {
        disabledMenuItem.push("prep");
        disabledMenuItem.push("sign out all users");
    }

    var mergedArrayWithoutDuplicates = items.concat(disabledMenuItem.filter(seccondArrayItem => !items.includes(seccondArrayItem)));

    for (var i = 0; i < mergedArrayWithoutDuplicates.length; i++) {
        for (var j = 0; j < menuItems.length; j++) {
            var menuItem = menuItems[j];
            if (menuItem.Title.toLowerCase() === mergedArrayWithoutDuplicates[i].toLowerCase()) {               
                menuItem["visible"] = false;
            }
        }
    }
}

function disableMenuItems(items) {
    var disabledMenuItem=[];
    // create drawer menu
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    if (userinfo.permission.toLowerCase() === 'reviewer') {
        disabledMenuItem = ["check", "output", "reports"];
    }

    if (userinfo.type.toLowerCase() !== 'admin') {
        disabledMenuItem.push("prep");
        disabledMenuItem.push("sign out all users");
    }

    var mergedArrayWithoutDuplicates = items.concat(disabledMenuItem.filter(seccondArrayItem => !items.includes(seccondArrayItem)));

    for (var i = 0; i < mergedArrayWithoutDuplicates.length; i++) {
        for (var j = 0; j < menuItems.length; j++) {
            var menuItem = menuItems[j];
            if (menuItem.Title.toLowerCase() === mergedArrayWithoutDuplicates[i].toLowerCase()) {
                menuItem["disabled"] = true;               
            }
        }
    }
}

function cancelGotoReview() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("goToReviewPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function gotoReview(callbackFunction) {
    if (callbackFunction) {
        callbackFunction();
    }

    window.location = "reviewPage.html";
}