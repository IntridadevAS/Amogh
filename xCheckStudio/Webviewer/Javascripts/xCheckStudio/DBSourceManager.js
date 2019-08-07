function DBSourceManager(sourceType,
  viewerContainer,
  modelBrowsercontainer) {

  this.ModelBrowsercontainer = modelBrowsercontainer;
  this.ViewerContainer = viewerContainer;

  // call super constructor
  SourceManager.call(this, sourceType);
}

// assign SourceManager's method to this class
DBSourceManager.prototype = Object.create(SourceManager.prototype);
DBSourceManager.prototype.constructor = DBSourceManager;

DBSourceManager.prototype.IsDBSource = function () {
  return true;
};

DBSourceManager.prototype.LoadData = function (uri) {
  var _this = this;
  return new Promise((resolve) => {

    // read data
    var dbReader = new DBReader();
    dbReader.ReadDBData(uri).then(function (result) {
      if (!result) {
        return resolve(true);
      }

      _this.SourceProperties = result;

      _this.AddComponentsToDB(_this.ViewerContainer);

      //add model Browser Table
      _this.ModelTree = new DBModelBrowser(_this.ModelBrowsercontainer, dbReader.DBData);
      _this.ModelTree.CreateModelBrowserTable();     

      if (checkCaseSelected) {
        checkIsOrderMaintained(checkCaseManager.CheckCase.CheckTypes[0]);
      }

      // hide view data graphics text on viewer conatainer
      var dbViewerContainer = document.getElementById("dataSourceViewer");
      for (var i = 0; i < dbViewerContainer.childElementCount; i++) {
        var currentChild = dbViewerContainer.children[i];
        if (currentChild.className === "viewdatagraphics") {
          currentChild.style.display = "none";
        }
      }

      return resolve(true);
    });
  });
}

DBSourceManager.prototype.RestoreData = function (classWiseComponents, selectedComponents) {

  var dbReader = new DBReader();
  this.SourceProperties = dbReader.RestoreDBData(classWiseComponents);

  //add model Browser Table
  this.ModelTree = new DBModeBrowser(this.ModelBrowsercontainer,
    dbReader.DBData,
    selectedComponents);
  this.ModelTree.CreateModelBrowserTable();
}

DBSourceManager.prototype.AddComponentsToDB = function () {

  var source = undefined;
  if (this.ViewerContainer.toLowerCase() == "viewercontainer1") {
    source = "SourceA"
  }
  else if (this.ViewerContainer.toLowerCase() == "viewercontainer2") {
    source = "SourceB"
  }
  
  var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
  var object = JSON.parse(projectinfo);

  $.ajax({
    data: { 
      'Components': JSON.stringify(this.SourceProperties),
      'Source': source,
      'DataSourceType': '1D',
      'ProjectName': object.projectname
    },
    type: "POST",
    url: "PHP/AddComponentsToDB.php"
  }).done(function (data) {
    console.log(data);
    // remove busy spinner
    var busySpinner = document.getElementById("divLoading");
    if (busySpinner.classList.contains('show'))
      busySpinner.classList.remove('show')
  });

}

