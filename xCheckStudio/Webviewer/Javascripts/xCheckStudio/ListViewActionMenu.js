
function ListViewActionMenu(id) {
    this.Id = id;

    this.Active = false;
    model.views[this.Id].selectGroupsForm = new SelectGroupsForm(this.Id);
    model.views[this.Id].selectPropertyHighlightsForm = new SelectPropertyHighlightsForm(this.Id);
}

ListViewActionMenu.prototype.GetHtmlElementId = function () {
    return "listViewActionMenu" + this.Id;
}

ListViewActionMenu.prototype.Open = function () {
    closeAnyOpenMenu();
    
    this.Active = true;
    model.views[this.Id].activeMenu = this;

    var element = document.getElementById(this.GetHtmlElementId());
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
}

ListViewActionMenu.prototype.Close = function () {
    this.Active = false;
    model.views[this.Id].activeMenu = null;

    this.Hide();

    // close other open forms
    this.CloseOpenForm(null);
}


ListViewActionMenu.prototype.Hide = function () {
    var element = document.getElementById(this.GetHtmlElementId());
    element.setAttribute('style', 'display:none');
}

ListViewActionMenu.prototype.ShowMenu = function () {

    var _this = this;
     $("#" + _this.GetHtmlElementId()).dxList({
        dataSource: _this.GetControls(),
        hoverStateEnabled: true,
        focusStateEnabled: true,
        activeStateEnabled: false,
        elementAttr: { class: "dx-theme-accent-as-background-color" },
        selectionMode: "single",
        itemTemplate: function (data, index) {
            var result = $("<div>").addClass("listViewActionMenuItem");

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

ListViewActionMenu.prototype.GetControls = function () {
    return controls = [
        {
            id: 1,
            Title: "Group by Property",
            ImageSrc: "public/symbols/Property Groups.svg",
            click: function (e, menu) {
                menu.OnSelectGroups();
            }
        },
        {
            id: 2,
            Title: "Highlight by Property",
            ImageSrc: "public/symbols/Property Highlight.svg",
            click: function (e, menu) {
                menu.OnSelectPropertyHighlight();
            }
        },
        {
            id: 3,
            Title: "Data Change Highlight",
            ImageSrc: "public/symbols/Data Change Highlight.svg",
            click: function (e, menu) {
            }
        },
        {
            id: 4,
            Title: "Saved Tables",
            ImageSrc: "public/symbols/Saved Table Views.svg",
            click: function (e, menu) {
            }
        },
        {
            id: 5,
            Title: "Return to List",
            ImageSrc: "public/symbols/MenuReturn.svg",
            click: function (e, menu) {
            }
        },
        {
            id: 6,
            Title: "Close",
            ImageSrc: "public/symbols/Close.svg",
            click: function (e, menu) {
                menu.Close();
            }
        }
    ];
}

ListViewActionMenu.prototype.OnSelectGroups= function () {
    if (model.views[this.Id].selectGroupsForm.Active) {
        model.views[this.Id].selectGroupsForm.Close();
    }
    else {
        // close other open forms
        this.CloseOpenForm(model.views[this.Id].selectGroupsForm);
        
        model.views[this.Id].selectGroupsForm.Open();
    }     
}

ListViewActionMenu.prototype.OnSelectPropertyHighlight= function () {
    if (model.views[this.Id].selectPropertyHighlightsForm.Active) {
        model.views[this.Id].selectPropertyHighlightsForm.Close();
    }
    else {
        // close other open forms
        this.CloseOpenForm(model.views[this.Id].selectPropertyHighlightsForm);
        
        model.views[this.Id].selectPropertyHighlightsForm.Open();
    }     
}

ListViewActionMenu.prototype.CloseOpenForm = function (currentForm) {
    if (currentForm !== model.views[this.Id].selectGroupsForm &&
        model.views[this.Id].selectGroupsForm.Active) {
        model.views[this.Id].selectGroupsForm.Close();
    }
    else if (currentForm !== model.views[this.Id].selectPropertyHighlightsForm &&
        model.views[this.Id].selectPropertyHighlightsForm.Active) {
        model.views[this.Id].selectPropertyHighlightsForm.Close();
    }
}