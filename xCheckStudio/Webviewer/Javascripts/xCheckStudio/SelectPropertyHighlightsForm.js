function SelectPropertyHighlightsForm(id) {
    this.Id = id;
    this.Active = false;
    this.PropertyHighlightTemplateSelect;
}

SelectPropertyHighlightsForm.prototype.GetHtmlElementId = function () {
    return "selectPropertyHighlightForm" + this.Id;
}

SelectPropertyHighlightsForm.prototype.Open = function () {
    this.Active = true;

    var selectPropertyHighlightForm = document.getElementById(this.GetHtmlElementId());
    selectPropertyHighlightForm.style.display = "block";
    selectPropertyHighlightForm.style.top = "calc( 50% - 141px)";    
    selectPropertyHighlightForm.style.left = "calc( 50% - 275px)";  

    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(selectPropertyHighlightForm,
        document.getElementById("selectPropertyHighlightFormCaptionBar" + this.Id));

    this.Init();
}

SelectPropertyHighlightsForm.prototype.Close = function () {
    this.Active = false;

    var selectPropertyHighlightForm = document.getElementById(this.GetHtmlElementId());
    selectPropertyHighlightForm.style.display = "none";
}

SelectPropertyHighlightsForm.prototype.Init = function () {
    var _this = this;

    this.PopulatePropertyHighlightTemplates();

    // Create btns    
    document.getElementById("selectPropertyHighlightFormApplyBtn" + this.Id).onclick = function () {
            _this.OnApply();
    }

    document.getElementById("selectPropertyHighlightFormCloseBtn" + this.Id).onclick = function () {
        _this.Close();
    };
}

SelectPropertyHighlightsForm.prototype.PopulatePropertyHighlightTemplates = function () {
    var _this = this;
    var propertyHighlightTemplatesAll = [];

    var propertyHighlightTemplates = model.propertyHighlightTemplates;
    for (var templateName in propertyHighlightTemplates) {
        propertyHighlightTemplatesAll.push(templateName);
    }

    this.PropertyHighlightTemplateSelect = $("#selectPropertyHighlightFormTypeDL" + this.Id).dxSelectBox({
        items: propertyHighlightTemplatesAll,
    }).dxSelectBox("instance");
}

SelectPropertyHighlightsForm.prototype.OnApply = function () {
    _this = this;
    if (this.PropertyHighlightTemplateSelect) {
        var selectedPropertyHighlight = this.PropertyHighlightTemplateSelect.option("value");

        model.views[_this.Id].groupView.Show(GlobalConstants.GroupView.Highlight,selectedPropertyHighlight);

        model.views[_this.Id].activeTableView = GlobalConstants.TableView.Group;
        var sourceManager = SourceManagers[_this.Id];
        sourceManager.ShowGroupViewControls(true);
        model.views[_this.Id].groupView.ActiveGroupViewType = GlobalConstants.GroupView.Highlight;
        model.views[_this.Id].groupView.OnGroupTemplateChanged(selectedPropertyHighlight);
    }
}