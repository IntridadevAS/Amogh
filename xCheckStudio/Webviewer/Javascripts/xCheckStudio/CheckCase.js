
const CheckCaseOperations = {
  checkCaseSelectElement: null,
  getCheckCaseSelectElement: function () {
    if (this.checkCaseSelectElement) {
      return this.checkCaseSelectElement;
    }

    this.checkCaseSelectElement = document.getElementById("checkCaseSelect");

    return this.checkCaseSelectElement;
  },

  getCheckCaseSelectValue: function () {
    if (!this.checkCaseSelectElement) {
      return null;
    }

    return this.checkCaseSelectElement.value;
  },

  setCheckCaseSelectValue: function (value) {
    if (!this.checkCaseSelectElement) {
      return;
    }

    this.checkCaseSelectElement.value = value;
  },

  loadCheckCases: function () {
    return new Promise(function (resolve) {
      // this new project to be created

      let checkCaseSelectElement = CheckCaseOperations.getCheckCaseSelectElement();
      checkCaseSelectElement.onchange = function () {
        if (this.value === "AutoSelect") {
          checkCaseManager = undefined;

          // // disable controls
          // disableControlsOnLoad();

          return;
        }

        checkCaseSelected = true;
        var fileName;
        for (
          var i = 0;
          i < checkCaseFilesData.CheckCaseFileDataList.length;
          i++
        ) {
          var checkCaseFileData = checkCaseFilesData.CheckCaseFileDataList[i];
          if (checkCaseFileData.CheckCaseName === this.value) {
            fileName = checkCaseFileData.FileName;
            break;
          }
        }
        if (fileName === undefined) {
          return;
        }

        // read check case data from XML checkcase data file
        checkCaseManager = new CheckCaseManager();
        checkCaseManager.readCheckCaseData(fileName);
      };

      // read check cases files list
      checkCaseFilesData = new CheckCaseFilesData();
      checkCaseFilesData.readCheckCaseFiles().then(function (result) {
        return resolve(result);
      });
    });
  },

  filterCheckCases: function (loadAll) {
    var fileName;
    let checkCaseSelectElement = this.getCheckCaseSelectElement();

    if (loadAll || Object.keys(SourceManagers).length === 0) {
      var selectedCheckCase = this.getCheckCaseSelectValue();

      checkCaseFilesData.FilteredCheckCaseDataList = [];
      checkCaseFilesData.populateCheckCases();

      if (selectedCheckCase) {
        this.setCheckCaseSelectValue(selectedCheckCase);
        // checkCaseSelect.value = selectedCheckCase;
      }
    } else {
      // get all loaded source types
      var allSourceTypes = [];
      for (var tabId in SourceManagers) {
        allSourceTypes.push(SourceManagers[tabId].SourceType);
      }

      var loadedSourceOccCountList = xCheckStudio.Util.getArrayElementOccCount(
        allSourceTypes
      );

      if (checkCaseFilesData.FilteredCheckCaseDataList.length > 0) {
        var dummyList = [];
        for (
          var i = 0;
          i < checkCaseFilesData.FilteredCheckCaseDataList.length;
          i++
        ) {
          var checkCaseFileData =
            checkCaseFilesData.FilteredCheckCaseDataList[i];

          var sourceOccCountList = xCheckStudio.Util.getArrayElementOccCount(
            checkCaseFileData.SourceTypes
          );

          var validCheckCase = false;
          for (var source in loadedSourceOccCountList) {
            if (!(source in sourceOccCountList)) {
              validCheckCase = false;
              break;
            }

            var countInLoadeSources = loadedSourceOccCountList[source];
            var countInCheckCase = sourceOccCountList[source];

            if (countInLoadeSources <= countInCheckCase) {
              validCheckCase = true;
            } else {
              validCheckCase = false;
              break;
            }
          }

          if (validCheckCase) {
            dummyList.push(checkCaseFileData);
          }
        }

        checkCaseFilesData.FilteredCheckCaseDataList = dummyList;
      } else {
        checkCaseFilesData.FilteredCheckCaseDataList = [];
        for (
          var i = 0;
          i < checkCaseFilesData.CheckCaseFileDataList.length;
          i++
        ) {
          var checkCaseFileData = checkCaseFilesData.CheckCaseFileDataList[i];

          var sourceOccCountList = xCheckStudio.Util.getArrayElementOccCount(
            checkCaseFileData.SourceTypes
          );

          var validCheckCase = false;
          for (var source in loadedSourceOccCountList) {
            if (!(source in sourceOccCountList)) {
              validCheckCase = false;
              break;
            }

            var countInLoadeSources = loadedSourceOccCountList[source];
            var countInCheckCase = sourceOccCountList[source];

            if (countInLoadeSources <= countInCheckCase) {
              validCheckCase = true;
            } else {
              validCheckCase = false;
              break;
            }
          }

          if (validCheckCase) {
            checkCaseFilesData.FilteredCheckCaseDataList.push(
              checkCaseFileData
            );
          }
        }
      }

      // remove all options from check case select input
      var selectedCheckCase = this.getCheckCaseSelectValue();
      checkCaseSelectElement.options.length = 0;

      // add new check case options to check case select input
      for (
        var i = 0;
        i < checkCaseFilesData.FilteredCheckCaseDataList.length;
        i++
      ) {
        var checkCaseData = checkCaseFilesData.FilteredCheckCaseDataList[i];

        checkCaseSelectElement.options.add(
          new Option(checkCaseData.CheckCaseName, checkCaseData.CheckCaseName)
        );
      }

      checkCaseSelectElement.options.add(
        new Option("AutoSelect", "AutoSelect")
      );
      if (selectedCheckCase.toLowerCase() === "autoselect") {
        if (checkCaseSelectElement.options.length === 2) {
          this.setCheckCaseSelectValue(checkCaseSelectElement.options[0].value);
          //   checkCaseSelect.value = checkCaseSelect.options[0].value;
          checkCaseSelectElement.dispatchEvent(new Event("change"));
        } else {
          this.setCheckCaseSelectValue("AutoSelect");
          //   checkCaseSelect.value = "AutoSelect";
        }
      } else {
        // checkCaseSelect.value = selectedCheckCase;
        this.setCheckCaseSelectValue(selectedCheckCase);
        for (
          var i = 0;
          i < checkCaseFilesData.CheckCaseFileDataList.length;
          i++
        ) {
          var checkCaseFileData = checkCaseFilesData.CheckCaseFileDataList[i];
          if (checkCaseFileData.CheckCaseName === selectedCheckCase) {
            fileName = checkCaseFileData.FileName;
            break;
          }
        }
      }

      if (fileName !== undefined) {
        checkCaseManager = new CheckCaseManager();
        checkCaseManager.readCheckCaseData(fileName);
      }
    }
  },

  selectCheckCase: function (checkCaseName, addIfNotExists, checkCaseInfo) {
    let optionExists = this.checkCaseOptionExists(checkCaseName);
    if (!optionExists && addIfNotExists) {
        this.addCheckCaseOption(checkCaseName);
    }

    this.setCheckCaseSelectValue(checkCaseName);

    // init checkcaseManager
    checkCaseManager = new CheckCaseManager();
    checkCaseManager.CheckCase = JSON.parse(checkCaseInfo.checkCaseData).CheckCase;
  },

  checkCaseOptionExists: function (checkCaseName) {
    let checkCaseSelectElement = this.getCheckCaseSelectElement();
    for (i = 0; i < checkCaseSelectElement.length; ++i) {
      if (checkCaseSelectElement.options[i].value == checkCaseName) {
        return true;
      }
    }

    return false;
  },

  addCheckCaseOption: function(checkCaseName){
    let checkCaseSelectElement = this.getCheckCaseSelectElement();
    checkCaseSelectElement.options.add(
        new Option(checkCaseName, checkCaseName)
      );
  }
};

