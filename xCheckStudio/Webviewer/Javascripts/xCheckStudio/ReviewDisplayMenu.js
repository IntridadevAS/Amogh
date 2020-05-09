
function DisplayMenu(id, viewerId) {
    this.Id = id;
    this.ViewerId = viewerId;

    // call super constructor
    HoveringMenu.call(this, id, viewerId);

    this.Active = false;
    this.ViewsOpen = false;
}

// inherit from parent
DisplayMenu.prototype = Object.create(HoveringMenu.prototype);
DisplayMenu.prototype.constructor = DisplayMenu;

DisplayMenu.prototype.Toggle = function () {
    if (!this.Active) {
        // Close other menus open
        closeAnyOpenMenu();
        // for (var id in model.checks[model.currentCheck].menus) {
        //     var menus = model.checks[model.currentCheck].menus[id];
        //     for (var menuName in menus) {
        //         var menu = menus[menuName];
        //         if (menu.Active) {
        //             menu.Close();
        //             menu.HideAllOpenViewForms();
        //         }
        //     }
        // }
        
        this.Open();
        return true;
    }
    return false;
}

DisplayMenu.prototype.Open = function () {
    this.Active = true;

    var element = document.getElementById("displayMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
    this.RegisterOnClick();
}

DisplayMenu.prototype.Close = function () {
    this.Active = false;

    this.Hide();
    this.UnRegisterOnClick();
}

DisplayMenu.prototype.Hide = function () {
    var element = document.getElementById("displayMenu" + this.Id);
    element.setAttribute('style', 'display:none');
}

DisplayMenu.prototype.ShowMenu = function () {

    var _this = this;
    $("#displayMenu" + this.Id).dxList({
        dataSource: _this.GetControls(),
        hoverStateEnabled: true,
        focusStateEnabled: true,
        activeStateEnabled: false,
        elementAttr: { class: "dx-theme-accent-as-background-color" },
        selectionMode: "single",
        itemTemplate: function (data, index) {
            var result = $("<div>").addClass("displayMenuItem");

            $("<img>").attr({
                "src": data.ImageSrc,
                style: "width: 25px; height: 25px;"
            }).appendTo(result);

            return result;
        },
        onSelectionChanged: function (e) {
            if (e.component._selection.getSelectedItems().length > 0) {
                e.addedItems[0].click(e, _this);
                e.component._selection.deselectAll();
            }
        },
        onContentReady: function (e) {
            var listitems = e.element.find('.dx-item');
            var tooltip = $("#menuTooltip" + _this.Id).dxTooltip({
                position: "right"
            }).dxTooltip('instance');
            listitems.on('dxhoverstart', function (args) {
                tooltip.content().text($(this).data().dxListItemData.Title);
                tooltip.show(args.target);
            });

            listitems.on('dxhoverend', function () {
                tooltip.hide();
            });
        }
    });
}

DisplayMenu.prototype.GetControls = function () {
    // _this = this;
    return controls = [
        {
            id: 1,
            Title: "Markup",
            ImageSrc: "public/symbols/Markup.svg",
            click: function (e, menu) {
                menu.GetMarkupMenu().Open();
                menu.Hide();
            }
        },
        {
            id: 2,
            Title: "BookMarks",
            ImageSrc: "public/symbols/Bookmarks.svg",
            click: function (e, menu) {
                menu.GetBookmarkMenu().Open();
                menu.Hide();
            }
        },
        {
            id: 3,
            Title: "Tags",
            ImageSrc: "public/symbols/Tags.svg",
            click: function (e, menu) {
                menu.GetTagsMenu().Open();
                menu.Hide();
            }
        },
        {
            id: 4,
            Title: "Model Views",
            ImageSrc: "public/symbols/ModelView.svg",
            click: function (e, menu) {
                menu.GetModelViewsMenu().Open();
                menu.Hide();
            }
        },
        {
            id: 5,
            Title: "Close",
            ImageSrc: "public/symbols/Close.svg",
            click: function (e, menu) {
                menu.Close();

                // Close open views and Measures form
                menu.HideAllOpenViewForms();
            }
        }
    ];
}

function DragElement(elmnt, draggableArea) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (draggableArea) {
        // if present, the header is where you move the DIV from:
        draggableArea.onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}