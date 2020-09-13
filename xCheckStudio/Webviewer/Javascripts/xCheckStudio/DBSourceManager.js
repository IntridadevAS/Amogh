function DBSourceManager(id,
  sourceName,
  sourceType,
  viewerContainer,
  modelBrowsercontainer) {

  this.ModelBrowsercontainer = modelBrowsercontainer;
  this.ViewerContainer = viewerContainer;  

  // call super constructor
  SourceManager.call(this, id, sourceName, sourceType);

  this.PropertyCallout;
}

// assign SourceManager's method to this class
DBSourceManager.prototype = Object.create(SourceManager.prototype);
DBSourceManager.prototype.constructor = DBSourceManager;

// get functions
DBSourceManager.prototype.GetCurrentTable = function () {
  var activeTableView = model.views[this.Id].activeTableView;
  if (activeTableView === GlobalConstants.TableView.DataBrowser) {
    return this.GetModelBrowser;
  }
  else if (activeTableView === GlobalConstants.TableView.List) {
    // return model.views[this.Id].listView;
  }
  else if (activeTableView === GlobalConstants.TableView.Group) {
    return model.views[this.Id].groupView;
  }

  return null;
}

DBSourceManager.prototype.Is1DSource = function () {
  return true;
};

DBSourceManager.prototype.GetAllSourceProperties = function () {

  var allProperties = [];
  let allComponents = this.SourceProperties;
  for (var componentId in allComponents) {
    var component = allComponents[componentId];
    if (component.properties.length > 0) {
      for (var i = 0; i < component.properties.length; i++) {
        var property = component.properties[i];
        if (allProperties.indexOf(property.Name) === -1) {
          allProperties.push(property.Name);
        }
      }
    }
  }

  return allProperties;
}

DBSourceManager.prototype.GetAllSourcePropertiesWithValues = function () {
  // var sourceManager = SourceManagers[this.Id];
  var traversedProperties = [];

  var allProperties = {};
  var allvalues = {};
  // if (sourceManager.Is3DSource()) {
  // var allComponents = sourceManager.AllComponents;
  var allComponents = this.SourceProperties;

  for (var nodeId in allComponents) {
    var component = allComponents[nodeId];
    if (component.properties.length > 0) {
      for (var i = 0; i < component.properties.length; i++) {
        var property = component.properties[i];

        if (traversedProperties.indexOf(property.Name) === -1) {
          traversedProperties.push(property.Name);

          allProperties[JSON.stringify({ "Name": property.Name })] = { "Name": property.Name };
        }

        var valueObj = {
          "Name": property.Name,
          "Value": property.Value
        };

        var valueObjStr = JSON.stringify(valueObj);

        if (!(valueObjStr in allvalues)) {
          allvalues[valueObjStr] = valueObj;
        }
      }
    }
  }
  // }

  traversedProperties = [];
  return {
    properties: allProperties,
    values: allvalues
  };
}

DBSourceManager.prototype.ClearSource = function () {
  this.ModelTree.Clear();

  // clear viewer
  var containerDiv = "#" + this.ViewerContainer;
  var viewerContainer = document.getElementById(this.ViewerContainer);
  var parent = viewerContainer.parentElement;

  //remove html element which holds grid
  $(containerDiv).remove();

  //Create and add div with same id to add grid again
  //devExtreme does not have destroy method. We have to remove the html element and add it again to create another table
  var viewerContainerDiv = document.createElement("div")
  viewerContainerDiv.id = this.ViewerContainer;
  viewerContainerDiv.className = "tempContainer";
  // var styleRule = ""
  // styleRule = "position: relative";
  // viewerContainerDiv.setAttribute("style", styleRule);
  parent.appendChild(viewerContainerDiv);
}

DBSourceManager.prototype.LoadData = function (uri, connectionInfo = null) {
  var _this = this;
  return new Promise((resolve) => {

    // read data
    var dbReader = new DBReader();
    dbReader.ReadDBData(uri, connectionInfo).then(function (result) {
      if (!result) {
        return resolve(true);
      }

      _this.SourceProperties = result;

      _this.AddComponentsToDB(_this.ViewerContainer);

      //add model Browser Table
      _this.ModelTree = new DBModelBrowser(_this.Id,
        _this.ModelBrowsercontainer,
        _this.ViewerContainer,
        dbReader.DBData);

      _this.ModelTree.CreateModelBrowser(_this.SourceProperties);

      // Init Property Callout
      _this.InitPropertyCallout();

      // Init table views action menu
      _this.InitViewActionMenu();

      // Init group view
      _this.InitGroupView(dbReader.DBData);

      // init data definition menu
      _this.InitDataDefinitionMenu();

      return resolve(true);
    });
  });
}

DBSourceManager.prototype.RestoreData = function (classWiseComponents, selectedComponents) {

  var dbReader = new DBReader();
  this.SourceProperties = dbReader.RestoreDBData(classWiseComponents, this.SourceType);

  //add model Browser Table
  this.ModelTree = new DBModelBrowser(this.Id,
    this.ModelBrowsercontainer,
    this.ViewerContainer,
    dbReader.DBData,
    selectedComponents);
  this.ModelTree.CreateModelBrowser(this.SourceProperties);

  // Init Property Callout
  this.InitPropertyCallout();

  // Init table views action menu
  this.InitViewActionMenu();

  // Init group view
  this.InitGroupView(dbReader.DBData);

  // init data definition menu
  this.InitDataDefinitionMenu();
}

DBSourceManager.prototype.InitDataDefinitionMenu = function () {
  model.views[this.Id].dataDefinitionMenu = new DataDefinitionMenu(this.Id);
}

DBSourceManager.prototype.InitGroupView = function (dbData) {
  model.views[this.Id].groupView = new GroupView1D(
    this.Id,
    this.ModelBrowsercontainer,
    this.SourceProperties,
    dbData,
    this.ViewerContainer);

  this.InitGroupViewControls();
}


DBSourceManager.prototype.InitGroupViewControls = function () {
  var _this = this;

  var groups = ["Clear"];
  groups = groups.concat(Object.keys(model.propertyGroups));
  this.GroupTemplateSelect = $("#groupTemplateSelect" + this.Id).dxSelectBox({
    items: groups,
    value: "Clear",
    visible: false,
    onValueChanged: function (data) {
      model.views[_this.Id].groupView.OnGroupTemplateChanged(data.value);
    }

  }).dxSelectBox("instance");

  // group view type select box
  let groupTypes = ["Group", "Highlight", "Data Change Highlight"];
  this.GroupHighlightTypeSelect = $("#groupHighlightTypeSelect" + this.Id).dxSelectBox({
    items: groupTypes,
    visible: false,
    value: groupTypes[0],
    itemTemplate: function (data) {
      return "<div class='custom-item' title='" + data + "'>" + data + "</div>";
    },
    onValueChanged: function (e) {
      model.views[_this.Id].groupView.ActiveGroupViewType = e.value;

      if (e.value === "Group") {
          _this.GroupTemplateSelect.option("items", ["Clear"].concat(Object.keys(model.propertyGroups)));
      }
      else if (e.value === "Highlight") {
          _this.GroupTemplateSelect.option("items", ["Clear"].concat(Object.keys(model.propertyHighlightTemplates)));                
      }
      else if (e.value === "Data Change Highlight") {
          _this.GroupTemplateSelect.option("items", ["Clear"].concat(Object.keys(model.dataChangeHighlightTemplates)));
      }

      model.views[_this.Id].groupView.Clear();
    }
  }).dxSelectBox("instance");

  // highlight selections btn
  this.HighlightSelectionBtn = document.getElementById("highlightSelectionBtn" + this.Id);
  this.HighlightSelectionBtn.onclick = function () {
    model.views[_this.Id].groupView.ApplyPropertyHighlightColor();
  }

  //Group Database View Btn
  this.GroupDatabaseViewBtn = document.getElementById("databaseViewBtn" + this.Id);
  this.GroupDatabaseViewBtn.onclick = function () {
    model.views[_this.Id].groupView.OnGroupDatabaseViewClick();
  }
}

DBSourceManager.prototype.InitPropertyCallout = function () {
  this.PropertyCallout = new PropertyCallout(this.Id);
  this.PropertyCallout.Init();
}

DBSourceManager.prototype.AddComponentsToDB = function () {

  var _this = this;
  var source = undefined;
  if (this.ViewerContainer.toLowerCase() == "visualizera") {
    source = "SourceA"
  }
  else if (this.ViewerContainer.toLowerCase() == "visualizerb") {
    source = "SourceB"
  }
  else if (this.ViewerContainer.toLowerCase() == "visualizerc") {
    source = "SourceC"
  }
  else if (this.ViewerContainer.toLowerCase() == "visualizerd") {
    source = "SourceD"
  }

  var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
  var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
  $.ajax({
    data: {
      'Components': JSON.stringify(this.SourceProperties),
      'Source': source,
      'DataSourceType': '1D',
      'ProjectName': projectinfo.projectname,
      'CheckName': checkinfo.checkname
    },
    type: "POST",
    url: "PHP/AddComponentsToDB.php"
  }).done(function (data) {
    // var result = xCheckStudio.Util.tryJsonParse(data);   
  });

}

DBSourceManager.prototype.OpenPropertyCallout = function (compData) {
  this.OpenPropertyCalloutByCompId(compData.ComponentId);
}

DBSourceManager.prototype.OpenPropertyCalloutByCompId = function (componentId) {
  var _this = this;

  var component = _this.SourceProperties[componentId];

  // properties
  var properties = []
  for (var i = 0; i < component.properties.length; i++) {
    var property = {};
    property["Name"] = component.properties[i].Name;
    property["Value"] = component.properties[i].Value;
    properties.push(property);
  }

  // references                
  ReferenceManager.getReferences([componentId]).then(function (references) {
    var referencesData = [];
    var commentsData = [];
    var index = 0;
    if (references && _this.Id in references) {
      if ("webAddress" in references[_this.Id]) {
        for (var i = 0; i < references[_this.Id]["webAddress"].length; i++) {
          index++;

          var referenceData = {};
          // referenceData["id"] = index;
          referenceData["Value"] = references[_this.Id]["webAddress"][i];
          referenceData["Type"] = "Web Address";

          referencesData.push(referenceData);
        }
      }

      if ("image" in references[_this.Id]) {
        for (var i = 0; i < references[_this.Id]["image"].length; i++) {
          index++;

          var referenceData = {};
          // referenceData["id"] = index;
          referenceData["Value"] = references[_this.Id]["image"][i];
          referenceData["Type"] = "Image";

          referencesData.push(referenceData);
        }
      }

      if ("document" in references[_this.Id]) {
        for (var i = 0; i < references[_this.Id]["document"].length; i++) {
          index++;

          var referenceData = {};
          // referenceData["id"] = index;
          referenceData["Value"] = references[_this.Id]["document"][i];
          referenceData["Type"] = "Document";

          referencesData.push(referenceData);
        }
      }

      if ("comment" in references[_this.Id]) {
        for (var i = 0; i < references[_this.Id]["comment"].length; i++) {
          commentsData.push(JSON.parse(references[_this.Id]["comment"][i]));
        }
      }
    }

    // if (properties.length > 0) {
    _this.PropertyCallout.Update(component.Name,
      componentId,
      properties,
      referencesData,
      commentsData);
    // }
  });
}

DBSourceManager.prototype.InitViewActionMenu = function () {
  var _this = this;

  document.getElementById("tableViewAction" + this.Id).onclick = function () {
    if (this.classList.contains("openSDAMenu")) {
      _this.CloseTableViewsMenu();
    }
    else {
      _this.OpenTableViewsMenu();
    }
  }
}

DBSourceManager.prototype.OpenTableViewsMenu = function () {
  var _this = this;

  var mainBtn = document.getElementById("tableViewAction" + this.Id);
  mainBtn.classList.add("openSDAMenu");
  mainBtn.children[0].src = "public/symbols/CloseBlack.svg";

  var dataBrowserSDA = document.getElementById("dataBrowserAction" + _this.Id);
  dataBrowserSDA.classList.add("showSDA");
  dataBrowserSDA.onclick = function () {
    if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.DataBrowser) {
      var selectedIds = _this.GetCurrentTable().GetSelectedIds();

      _this.ModelTree.SelectionManager.SelectedComponentIds = selectedIds;
      _this.ModelTree.CreateModelBrowser(_this.SourceProperties);

      _this.CloseTableViewsMenu();

      if (!isDataVault()) {
        // hide group view controls
        _this.ShowGroupViewControls(false);
      }
    }
  }

  var listViewSDA = document.getElementById("listviewAction" + _this.Id);
  listViewSDA.classList.add("showSDA");
  listViewSDA.onclick = function () {
    // if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.List) {
    //   // var selectedIds = _this.GetCurrentTable().GetSelectedIds();
    //   // if (selectedComps.constructor === Object) {
    //   //     selectedComps = Object.values(selectedComps);
    //   // }

    //   // model.views[_this.Id].listView.Show(selectedComps);

      _this.CloseTableViewsMenu();

    //   if (!isDataVault()) {
    //     // hide group view controls
    //     _this.ShowGroupViewControls(false);
    //   }
    // }
  }

  var groupsSDA = document.getElementById("groupsAction" + _this.Id);
  if (!isDataVault()) {
    groupsSDA.classList.add("showSDA");
    groupsSDA.onclick = function () {
      if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.Group) {
        model.views[_this.Id].groupView.Show();

        model.views[_this.Id].activeTableView = GlobalConstants.TableView.Group;

        _this.CloseTableViewsMenu();

        // show group view controls
        _this.ShowGroupViewControls(true);
      }
    }
  }
}

DBSourceManager.prototype.CloseTableViewsMenu = function () {
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