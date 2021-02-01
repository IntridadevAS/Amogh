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

    //this.PopulateTemplateGrid();

    this.PopulateGroups();

    // this.NameTextBox = $("#defineGroupsFormNameBox" + this.Id).dxTextBox({
    //     placeholder: "Enter Name..."
    // }).dxTextBox("instance");

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
        // value: "New",
        // onValueChanged: function (data) {
        //     if (data.value.toLowerCase() !== "new") {
        //         _this.NameTextBox.option("value", data.value);
        //         _this.NameTextBox.option("disabled", true);
        //     }
        //     else {
        //         _this.NameTextBox.option("value", "");
        //         _this.NameTextBox.option("disabled", false);
        //         // return;
        //     }
            
        //     //_this.PopulateTemplateGrid();
        // }

    }).dxSelectBox("instance");
}


SelectGroupsForm.prototype.OnApply = function () {
    // var templateName = this.NameTextBox.option("value");
    // if (!templateName ||
    //     templateName === "") {
    //     alert("Please enter name for template to save.");
    //     return;
    // }

    if (this.GroupSelect) {
        var selectedGroup = this.GroupSelect.option("value");
    
    // var rows = this.DefineGroupsGrid.getVisibleRows();
    // if (rows.length === 0) {
    //     alert("No data to save.");
    //     return;
    // }
    var propertyGroups = model.propertyGroups;
    if (selectedGroup in propertyGroups) {
        var groupingProperties = model.propertyGroups[selectedGroup].properties;
    }
    // var groupingProperties = [];
    // for (var i = 0; i < _this.GroupSelect.option("value")..length; i++) {
    //     var row = rows[i];
    //     groupingProperties.push(row.data.Name);
    // }
    }
    // templateName = this.NameTextBox.option("value");

    // var group = {
    //     "name": templateName,
    //     "properties": groupingProperties
    // };
    //var groupsSDA = document.getElementById("groupsAction" + _this.Id);
}