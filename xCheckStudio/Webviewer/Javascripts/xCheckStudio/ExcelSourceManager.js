function ExcelSourceManager(id,
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
ExcelSourceManager.prototype = Object.create(SourceManager.prototype);
ExcelSourceManager.prototype.constructor = ExcelSourceManager;


ExcelSourceManager.prototype.Is1DSource = function () {
  return true;
};

ExcelSourceManager.prototype.LoadData = function (file) {
  var _this = this;
  return new Promise((resolve) => {

    // read data
    var excelReader = new ExcelReader();
    excelReader.ReadFileData(file).then(function (properties) {
      _this.SourceProperties = properties;

      // add data to data base
      _this.AddComponentsToDB();

      //add model Browser Table
      _this.ModelTree = new ExcelModeBrowser(_this.Id,
        _this.ModelBrowsercontainer,
        _this.ViewerContainer,
        excelReader.SheetData);
      _this.ModelTree.CreateModelBrowser(_this.SourceProperties);

      // create property callout
      _this.PropertyCallout = new PropertyCallout(_this.Id);
      _this.PropertyCallout.Init();

      return resolve(true);
    });

  });
}

ExcelSourceManager.prototype.RestoreData = function (classWiseComponents, selectedComponents) {

  //this.excelReader = new ExcelReader(this.SourceType, this.checkType, this.SelectedComponents);
  var excelReader = new ExcelReader();
  this.SourceProperties = excelReader.RestoreSheetData(classWiseComponents);

  //add model Browser Table
  this.ModelTree = new ExcelModeBrowser(this.Id,
    this.ModelBrowsercontainer,
    this.ViewerContainer,
    excelReader.SheetData,
    selectedComponents);
  this.ModelTree.CreateModelBrowser(this.SourceProperties);
}

ExcelSourceManager.prototype.ClearSource = function () {
  this.ModelTree.Clear();

  // clear viewer
  var containerDiv = "#" + this.ViewerContainer;

  var viewerContainer = document.getElementById(this.ViewerContainer);
  var parent = viewerContainer.parentElement;

  //remove html element which holds grid
  //devExtreme does not have destroy method. We have to remove the html element and add it again to create another table
  $(containerDiv).remove();

  //Create and add div with same id to add grid again
  var viewerContainerDiv = document.createElement("div")
  viewerContainerDiv.id = this.ViewerContainer;
  viewerContainerDiv.className = "tempContainer";
  // var styleRule = ""
  // // styleRule = "position: relative";
  // viewerContainerDiv.setAttribute("style", styleRule);
  parent.appendChild(viewerContainerDiv);
}

ExcelSourceManager.prototype.AddComponentsToDB = function () {
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
    _this.ComponentIdVsData = JSON.parse(data);
  });
}

ExcelSourceManager.prototype.GetViewerContainerID = function () {
  return this.ViewerContainer;
}

ExcelSourceManager.prototype.OpenPropertyCallout = function (componentId) {
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

    if (properties.length > 0) {
      _this.PropertyCallout.Update(component.Name,
        componentId,
        properties,
        referencesData,
        commentsData);
    }
  });
}