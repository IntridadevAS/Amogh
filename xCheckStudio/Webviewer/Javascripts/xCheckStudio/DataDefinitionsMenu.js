
function DataDefinitionMenu(id) {
    this.Id = id;

    this.Active = false;       

    model.views[this.Id].userPropertiesForm = new UserPropertiesForm(this.Id);
    model.views[this.Id].editUserPropertiesForm = new EditUserPropertiesForm(this.Id);
    model.views[this.Id].defineGroupsForm = new DefineGroupsForm(this.Id);
    model.views[this.Id].definePropertyHighlightsForm = new DefinePropertyHighlightsForm(this.Id);
}

DataDefinitionMenu.prototype.GetHtmlElementId = function () {
    return "dataDefinitionMenu" + this.Id;
}

DataDefinitionMenu.prototype.Open = function () {
    closeAnyOpenMenu();
    
    this.Active = true;
    model.views[this.Id].activeMenu = this;

    var element = document.getElementById(this.GetHtmlElementId());
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
}

DataDefinitionMenu.prototype.Close = function () {
    this.Active = false;
    model.views[this.Id].activeMenu = null;

    this.Hide();

    // close other open forms
    this.CloseOpenForm(null);
}


DataDefinitionMenu.prototype.Hide = function () {
    var element = document.getElementById(this.GetHtmlElementId());
    element.setAttribute('style', 'display:none');
}

DataDefinitionMenu.prototype.ShowMenu = function () {

    var _this = this;
     $("#" + _this.GetHtmlElementId()).dxList({
        dataSource: _this.GetControls(),
        hoverStateEnabled: true,
        focusStateEnabled: true,
        activeStateEnabled: false,
        elementAttr: { class: "dx-theme-accent-as-background-color" },
        selectionMode: "single",
        itemTemplate: function (data, index) {
            var result = $("<div>").addClass("dataDefinitionsMenuItem");

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

DataDefinitionMenu.prototype.GetControls = function () {
    //  _this = this;   
    return controls = [
        {
            id: 1,
            Title: "User Properties",
            ImageSrc: "public/symbols/User Properties.svg",
            click: function (e, menu) {
                menu.OnUserProperties();                
            }
        },
        {
            id: 2,
            Title: "Edit Properties",
            ImageSrc: "public/symbols/Edit Properties.svg",
            click: function (e, menu) {
                menu.OnEditUserProperties();
            }
        },
        {
            id: 3,
            Title: "Property Groups",
            ImageSrc: "public/symbols/Property Groups.svg",
            click: function (e, menu) {
                menu.OnDefineGroups();
            }
        },
        {
            id: 4,
            Title: "Property Highlight",
            ImageSrc: "public/symbols/Property Highlight.svg",
            click: function (e, menu) {
                menu.OnDefinePropertyHighlights();
            }
        },
        {
            id: 5,
            Title: "Data Change Highlight",
            ImageSrc: "public/symbols/Data Change Highlight.svg",
            click: function (e, menu) {
                menu.Close();
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

DataDefinitionMenu.prototype.OnUserProperties = function () {
    if (model.views[this.Id].userPropertiesForm.Active) {
        model.views[this.Id].userPropertiesForm.Close();
    }
    else {
        // close other open forms
        this.CloseOpenForm(model.views[this.Id].userPropertiesForm);

        model.views[this.Id].userPropertiesForm.Open();
    }      
}

DataDefinitionMenu.prototype.OnEditUserProperties = function () {
    if (model.views[this.Id].editUserPropertiesForm.Active) {
        model.views[this.Id].editUserPropertiesForm.Close();
    }
    else {
        // close other open forms
        this.CloseOpenForm(model.views[this.Id].editUserPropertiesForm);
      
        model.views[this.Id].editUserPropertiesForm.Open();
    }      
}

DataDefinitionMenu.prototype.OnDefineGroups= function () {
    if (model.views[this.Id].defineGroupsForm.Active) {
        model.views[this.Id].defineGroupsForm.Close();
    }
    else {
        // close other open forms
        this.CloseOpenForm(model.views[this.Id].defineGroupsForm);
        
        model.views[this.Id].defineGroupsForm.Open();
    }     
}

DataDefinitionMenu.prototype.OnDefinePropertyHighlights = function () {
    if (model.views[this.Id].definePropertyHighlightsForm.Active) {
        model.views[this.Id].definePropertyHighlightsForm.Close();
    }
    else {
        // close other open forms
        this.CloseOpenForm(model.views[this.Id].definePropertyHighlightsForm);
        
        model.views[this.Id].definePropertyHighlightsForm.Open();
    }
}

DataDefinitionMenu.prototype.CloseOpenForm = function (currentForm) {
    if (currentForm !== model.views[this.Id].userPropertiesForm &&
        model.views[this.Id].userPropertiesForm.Active) {
        model.views[this.Id].userPropertiesForm.Close();
    }
    else if (currentForm !== model.views[this.Id].editUserPropertiesForm &&
        model.views[this.Id].editUserPropertiesForm.Active) {
        model.views[this.Id].editUserPropertiesForm.Close();
    }
    else if (currentForm !== model.views[this.Id].defineGroupsForm &&
        model.views[this.Id].defineGroupsForm.Active) {
        model.views[this.Id].defineGroupsForm.Close();
    }
    else if (currentForm !== model.views[this.Id].definePropertyHighlightsForm &&
        model.views[this.Id].definePropertyHighlightsForm.Active) {
        model.views[this.Id].definePropertyHighlightsForm.Close();
    }
}