function ExcelSourceManager(sourceName,
  sourceType,
  viewerContainer,
  modelBrowsercontainer) {

  this.ModelBrowsercontainer = modelBrowsercontainer;
  this.ViewerContainer = viewerContainer;

  // call super constructor
  SourceManager.call(this, sourceName, sourceType);
}


// assign SourceManager's method to this class
ExcelSourceManager.prototype = Object.create(SourceManager.prototype);
ExcelSourceManager.prototype.constructor = ExcelSourceManager;


ExcelSourceManager.prototype.IsExcelSource = function () {
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
      _this.ModelTree = new ExcelModeBrowser(_this.ModelBrowsercontainer, 
                                            _this.ViewerContainer, 
                                            excelReader.SheetData);
      _this.ModelTree.CreateModelBrowser();

      // check if data source loading order is maintained
      // if (checkCaseSelected) {
      //   checkIsOrderMaintained(checkCaseManager.CheckCase.CheckTypes[0]);
      // }

      // // hide view data graphics text on viewer conatainer
      // var excelViewerContainer = document.getElementById("dataSourceViewer");
      // for (var i = 0; i < excelViewerContainer.childElementCount; i++) {
      //   var currentChild = excelViewerContainer.children[i];
      //   if (currentChild.className === "viewdatagraphics") {
      //     currentChild.style.display = "none";
      //   }
      // }

      return resolve(true);

    });

  });
}

ExcelSourceManager.prototype.RestoreData = function (classWiseComponents, selectedComponents) {

  var excelReader = new ExcelReader();

  //this.excelReader = new ExcelReader(this.SourceType, this.checkType, this.SelectedComponents);
  var excelReader = new ExcelReader();
  this.SourceProperties = excelReader.RestoreSheetData(classWiseComponents);

  //add model Browser Table
  this.ModelTree = new ExcelModeBrowser(this.ModelBrowsercontainer,
    this.ViewerContainer, 
    excelReader.SheetData,
    selectedComponents);
    this.ModelTree.CreateModelBrowser();
}



ExcelSourceManager.prototype.AddComponentsToDB = function () {

  var source = undefined;
  if (this.ViewerContainer.toLowerCase() == "visualizera") {
    source = "SourceA"
  }
  else if (this.ViewerContainer.toLowerCase() == "visualizerb") {
    source = "SourceB"
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
    console.log(data);
    // // remove busy spinner
    // var busySpinner = document.getElementById("divLoading");
    // if (busySpinner.classList.contains('show'))
    //   busySpinner.classList.remove('show')

  });
}

ExcelSourceManager.prototype.GetViewerContainerID = function () {
  return this.ViewerContainer;
}

