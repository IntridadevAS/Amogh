function SelectGroupsForm(id) {
    this.Id = id;

    this.Active = false;

    //this.DefineGroupsGrid;
    this.GroupSelect;
    //this.NameTextBox;
}

SelectGroupsForm.prototype.GetHtmlElementId = function () {
    return "selectGroupsForm" + this.Id;
}

SelectGroupsForm.prototype.Open = function () {
    this.Active = true;

    var selectGroupsForm = document.getElementById(this.GetHtmlElementId());
    selectGroupsForm.style.display = "block";
    selectGroupsForm.style.top = "calc( 50% - 141px)";    
    selectGroupsForm.style.left = "calc( 50% - 225px)";   

    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(selectGroupsForm,
        document.getElementById("selectGroupsFormCaptionBar" + this.Id));

    this.Init();
}

SelectGroupsForm.prototype.Close = function () {
    this.Active = false;

    var selectGroupsForm = document.getElementById(this.GetHtmlElementId());
    selectGroupsForm.style.display = "none";
}

SelectGroupsForm.prototype.Init = function () {
    var _this = this;

    this.PopulateGroups();

    // Create btns    
    document.getElementById("selectGroupsFormApplyBtn" + this.Id).onclick = function () {
        _this.OnApply();
    }

    document.getElementById("selectGroupsFormCloseBtn" + this.Id).onclick = function () {
        _this.Close();
    };
}

SelectGroupsForm.prototype.PopulateGroups = function () {
    var _this = this;
    var groups = [];

    var propertyGroups = model.propertyGroups;
     for (var groupName in propertyGroups) {
         groups.push(groupName);
     }

    this.GroupSelect = $("#selectGroupsFormTypeDL" + this.Id).dxSelectBox({
        items: groups,
    }).dxSelectBox("instance");
}


SelectGroupsForm.prototype.OnApply = function () {

    if (this.GroupSelect) {
        var selectedGroup = this.GroupSelect.option("value");

    var propertyGroups = model.propertyGroups;
    if (selectedGroup in propertyGroups) {
        var groupingProperties = model.propertyGroups[selectedGroup].properties;
    }

    }
    // templateName = this.NameTextBox.option("value");

    // var group = {
    //     "name": templateName,
    //     "properties": groupingProperties
    // };
    //var groupsSDA = document.getElementById("groupsAction" + _this.Id);
}
