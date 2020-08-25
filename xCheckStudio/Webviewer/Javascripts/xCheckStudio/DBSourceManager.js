function DBSourceManager(id,
  sourceName, 
  sourceType,
  viewerContainer,
  modelBrowsercontainer) {

  this.ModelBrowsercontainer = modelBrowsercontainer;
  this.ViewerContainer = viewerContainer;

  this.ComponentIdVsData;

  // call super constructor
  SourceManager.call(this, id, sourceName, sourceType);

  this.PropertyCallout;
}

// assign SourceManager's method to this class
DBSourceManager.prototype = Object.create(SourceManager.prototype);
DBSourceManager.prototype.constructor = DBSourceManager;

DBSourceManager.prototype.Is1DSource = function () {
  return true;
};

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
        
      _this.ModelTree.CreateModelBrowserTable(_this.SourceProperties);   
      
      // create property callout
      _this.PropertyCallout = new PropertyCallout(_this.Id);
      _this.PropertyCallout.Init();
      
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
  this.ModelTree.CreateModelBrowserTable(this.SourceProperties);
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
    var result = xCheckStudio.Util.tryJsonParse(data);
    _this.ComponentIdVsData = result;
  });

}

DBSourceManager.prototype.OpenPropertyCallout = function (compData) {
  this.OpenPropertyCalloutByCompId(compData.ComponentId);
}

DBSourceManager.prototype.OpenPropertyCalloutByCompId = function (componentId) {
  var _this = this;

  var component = _this.SourceProperties[componentId - 1];

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