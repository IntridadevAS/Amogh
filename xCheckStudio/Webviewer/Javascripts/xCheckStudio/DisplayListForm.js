function DisplayListForm(id) {
    this.Id = id;
    this.Active = false;
    this.displayNameTextBox;
    this.displayDescriptionTextBox;
   // this.UpdatedRowsData = {};
}

DisplayListForm.prototype.GetHtmlElementId = function () {
    return "displayListForm" + this.Id;
}

DisplayListForm.prototype.Open = function () {
    this.Active = true;

    var displayListForm = document.getElementById(this.GetHtmlElementId());
    displayListForm.style.display = "block";
    displayListForm.style.top = "calc( 50% - 141px)";    
    displayListForm.style.left = "calc( 50% - 225px)";   

    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(displayListForm,
        document.getElementById("displayListFormCaptionBar" + this.Id));

    this.Init();
}

DisplayListForm.prototype.Close = function () {
    this.Active = false;

    var displayListForm = document.getElementById(this.GetHtmlElementId());
    displayListForm.style.display = "none";
}

DisplayListForm.prototype.Init = function () {
    var _this = this;
    this.PopulateLists();
    this.displayNameTextBox = $("#displayListFormNameBox" + this.Id).dxTextBox({
        placeholder: "Enter Name..."
    }).dxTextBox("instance");

    this.displayDescriptionTextBox = $("#displayListFormDescriptionBox" + this.Id).dxTextBox({
        placeholder: "Enter Description..."
    }).dxTextBox("instance");

    // Create btns    
    document.getElementById("displayListFormApplyBtn" + this.Id).onclick = function () {
        _this.OnApply();
    }

    document.getElementById("displayListFormCloseBtn" + this.Id).onclick = function () {
        _this.Close();
    };

  // On delete View
  document.getElementById("deleteListBtn" + this.Id).onclick = function () {
    if (_this.GroupSelect) {
        var selectedGroup = _this.GroupSelect.option("value");
        if (selectedGroup.toLowerCase() === "name") {
            return;
        }

        var propertyGroups = model.propertyGroups;
        if (selectedGroup in propertyGroups) {
            delete propertyGroups[selectedGroup];                
            
            _this.PopulateLists();

            var sourceManager = SourceManagers[_this.Id];
           // let groupViewType = sourceManager.GroupHighlightTypeSelect.option("value");
          //  if (groupViewType.toLowerCase() === "group") {
                sourceManager.GroupTemplateSelect.option("items", ["Clear"].concat(Object.keys(model.propertyGroups)));
           // }

            DevExpress.ui.notify("List '" + selectedGroup + "'" + " deleted.");
        }
    }
}

}

DisplayListForm.prototype.PopulateLists = function () {
    var _this = this;
    var lists = [
        "Clear"
    ];

    var propertyList = model.propertyList;
    for (var viewName in propertyList) {
        lists.push(viewName);
    }

    this.GroupSelect = $("#displayListFormTypeDL" + this.Id).dxSelectBox({
        items: lists,
        value: "Clear",
        onValueChanged: function (data) {
           // model.views[_this.Id].listView.OnListViewTemplateChanged(data.value);
        }

    }).dxSelectBox("instance");
}

DisplayListForm.prototype.OnApplyListView = function () {
    var _this = this
   
    var templateName = this.displayNameTextBox.option("value");
    if (!templateName ||
        templateName === "") {
        alert("Please enter name for view to save.");
        return;
    }

    var editUserPropertiesForm = model.views[_this.Id].listView;
    var selectedRowsData = editUserPropertiesForm.ListViewTableInstance.getSelectedRowsData();
    var properties = [];

    var visibleColumns = editUserPropertiesForm.ListViewTableInstance.getVisibleColumns();
 //   for (var i = 0; i < selectedRowsData.length; i++) {
  //      var rowData = selectedRowsData[i];

        for (var prop in visibleColumns) {
            if (prop.toLowerCase() === "item" ||
                prop.toLowerCase() === "nodeid") {
                continue;
            }

            var columnIndex = editUserPropertiesForm.ListViewTableInstance.getVisibleColumnIndex(prop)
            if (columnIndex === -1) {
                continue;
            }
            var propName = visibleColumns[columnIndex].caption;
            if (properties.indexOf(propName) === -1) {
                properties.push(propName);
            }
        }
   // }
 
    var group = {
        "name": templateName,
        "properties": properties
    };

    var sourceManager = SourceManagers[this.Id];

    // Reset controls
    this.displayNameTextBox.option("value", "");   

}


DisplayListForm.prototype.CloseTableViewsMenu = function () {
    var _this = this;

    var mainBtn = document.getElementById("tableViewAction" + this.Id);
    mainBtn.classList.remove("openSDAMenu");
    mainBtn.children[0].src = "public/symbols/Table Views.svg";

    var dataBrowserSDA = document.getElementById("dataBrowserAction" + _this.Id);
    dataBrowserSDA.classList.remove("showSDA");

    var listViewSDA = document.getElementById("listviewAction" + _this.Id);
    listViewSDA.classList.remove("showSDA");

    var groupsSDA = document.getElementById("groupsAction" + _this.Id);
    groupsSDA.classList.remove("showSDA");
}

DisplayListForm.prototype.OnApply = function () {
    var _this = this
    var selectedGroup = _this.GroupSelect.option("value");
    if (selectedGroup.toLowerCase() === "clear") {
        return;
    }

    model.views[_this.Id].listView.OnListViewTemplateChanged(selectedGroup);
}
