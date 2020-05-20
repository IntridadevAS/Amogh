
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
        // Close other menus open
        closeAnyOpenMenu();

        this.Open();
    }
}

DisplayMenu.prototype.Open = function () {
    this.Active = true;
    model.views[this.Id].activeMenu = this;

    var element = document.getElementById("displayMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
}

DisplayMenu.prototype.Close = function () {
    this.Active = false;
    model.views[this.Id].activeMenu = null;

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
                menu.MarkupMenu.Open();
                menu.Hide();
            }
        },
        {
            id: 2,
            Title: "BookMarks",
            ImageSrc: "public/symbols/Bookmarks.svg",
            click: function (e, menu) {
                menu.BookmarkMenu.Open();
                menu.Hide();
            }
        },
        {
            id: 3,
            Title: "Tags",
            ImageSrc: "public/symbols/Tags.svg",
            click: function (e, menu) {
                menu.TagsMenu.Open(e, menu);
                menu.Hide();
            }
        },
        {
            id: 4,
            Title: "Model Views",
            ImageSrc: "public/symbols/ModelView.svg",
            click: function (e, menu) {
                menu.ModelViewsMenu.Open();
                menu.Hide();
            }
        },
        {
            id: 5,
            Title: "Close",
            ImageSrc: "public/symbols/Close.svg",
            click: function (e, menu) {
                menu.Close();
            }
        }
    ];
}

function closeAnyOpenMenu() {
    if (model.views[model.currentTabId].activeMenu) {
        model.views[model.currentTabId].activeMenu.Close();
    }
    // if (model.views[model.currentTabId].displayMenu.Active) {
    //     model.views[model.currentTabId].displayMenu.Close();
    // }
    // if (model.views[model.currentTabId].displayMenu.MarkupMenu.Active) {
    //     model.views[model.currentTabId].displayMenu.MarkupMenu.Close();
    // }
    // if (model.views[model.currentTabId].displayMenu.MarkupMenu.ShapesMenu.Active) {
    //     model.views[model.currentTabId].displayMenu.MarkupMenu.ShapesMenu.Close();
    // }
    // if (model.views[model.currentTabId].displayMenu.BookmarkMenu.Active) {
    //     model.views[model.currentTabId].displayMenu.BookmarkMenu.Close();
    // }
    // if (model.views[model.currentTabId].displayMenu.TagsMenu.Active) {
    //     model.views[model.currentTabId].displayMenu.TagsMenu.Close();
    // }
    // if (model.views[model.currentTabId].displayMenu.ModelViewsMenu.Active) {
    //     model.views[model.currentTabId].displayMenu.ModelViewsMenu.Close();
    // }
    // if (model.views[model.currentTabId].displayMenu.ModelViewsMenu.DisplayStylesMenu.Active) {
    //     model.views[model.currentTabId].displayMenu.ModelViewsMenu.DisplayStylesMenu.Close();
    // }
    // if (model.views[model.currentTabId].displayMenu.ModelViewsMenu.SectioningMenu.Active) {
    //     model.views[model.currentTabId].displayMenu.ModelViewsMenu.SectioningMenu.Close();
    // }
    // if (model.views[model.currentTabId].displayMenu.ModelViewsMenu.MeasureMenu.Active) {
    //     model.views[model.currentTabId].displayMenu.ModelViewsMenu.MeasureMenu.Close();
    // }

    // // 
    // if (model.views[model.currentTabId].dataDefinitionMenu.Active) {
    //     model.views[model.currentTabId].dataDefinitionMenu.Close();
    // }
}