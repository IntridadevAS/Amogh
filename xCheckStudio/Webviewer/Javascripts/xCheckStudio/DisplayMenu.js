
function DisplayMenu(id) {
    this.Id = id;

    this.Active = false;
    this.MarkupMenu = new MarkupMenu(id);
    this.BookmarkMenu = new BookmarkMenu(id);
    this.TagsMenu = new TagsMenu(id);
    this.ModelViewsMenu = new ModelViewsMenu(id);
    this.ViewsOpen = false;
}

DisplayMenu.prototype.Toggle = function () {
    if (!this.Active) {
    //     this.Close();
    // }
    // else {
        this.Open();
    }
}

DisplayMenu.prototype.Open = function () {
    this.Active = true;

    var element = document.getElementById("displayMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
}

DisplayMenu.prototype.Close = function () {
    this.Active = false;

    this.Hide();
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
                e.addedItems[0].click(e);
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
    _this = this;
    return controls = [
        {
            id: 1,
            Title: "Markup",
            ImageSrc: "public/symbols/Markup.svg",
            click: function () {
                _this.MarkupMenu.Open();
                _this.Hide();
            }
        },
        {
            id: 2,
            Title: "BookMarks",
            ImageSrc: "public/symbols/Bookmarks.svg",
            click: function () {
                _this.BookmarkMenu.Open();
                _this.Hide();
            }
        },        
        {
            id: 3,
            Title: "Tags",
            ImageSrc: "public/symbols/Tags.svg",
            click: function () {
                _this.TagsMenu.Open();
                _this.Hide();
            }
        },
        {
            id: 4,
            Title: "Model Views",
            ImageSrc: "public/symbols/ModelView.svg",
            click: function () {
                _this.ModelViewsMenu.Open();
                _this.Hide();
            }
        },
        {
            id: 5,
            Title: "Close",
            ImageSrc: "public/symbols/Close.svg",
            click: function () {
                _this.Close();
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