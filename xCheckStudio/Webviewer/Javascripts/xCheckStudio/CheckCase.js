
function loadCheckCases() {
    // this new project to be created
    var checkCaseSelect = document.getElementById("checkCaseSelect");
    checkCaseSelect.onchange = function () {
        if (this.value === "AutoSelect") {
            checkCaseManager = undefined;

            // // disable controls
            // disableControlsOnLoad();

            return;
        }

        //$("#checkCaseSelect option[value='AutoSelect']").prop("disabled", true);
        checkCaseSelected = true;
        var fileName;
        for (var i = 0; i < checkCaseFilesData.CheckCaseFileDataList.length; i++) {
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

        // // if valid check case is selected, then enable source A controls              
        // var component = document.getElementById('createbtnA');
        // if (component.classList.contains("disabledbutton")) {
        //     component.classList.remove('disabledbutton');
        // }

        // // enable drop zone for source A
        // enableDropZone("dropZone1");
    }

    // read check cases files list
    checkCaseFilesData = new CheckCaseFilesData();
    checkCaseFilesData.readCheckCaseFiles();
}

function filterCheckCases(loadAll) {    

    var fileName;
    var checkCaseSelect = document.getElementById("checkCaseSelect");

    if (loadAll || Object.keys(SourceManagers).length === 0) {
        var selectedCheckCase = checkCaseSelect.value;

        checkCaseFilesData.FilteredCheckCaseDataList = [];
        checkCaseFilesData.populateCheckCases();

        if (selectedCheckCase) {
            checkCaseSelect.value = selectedCheckCase;
        }
    }
    else {
        // if (!(model.currentTabId in SourceManagers)) {
        //     return;
        // }

        // get all loaded source types
        var allSourceTypes = [];
        for (var tabId in SourceManagers) {
            allSourceTypes.push(SourceManagers[tabId].SourceType);
        }

        var loadedSourceOccCountList = xCheckStudio.Util.getArrayElementOccCount(allSourceTypes);

        if (checkCaseFilesData.FilteredCheckCaseDataList.length > 0) {

            var dummyList = []
            for (var i = 0; i < checkCaseFilesData.FilteredCheckCaseDataList.length; i++) {
                var checkCaseFileData = checkCaseFilesData.FilteredCheckCaseDataList[i];

                var sourceOccCountList = xCheckStudio.Util.getArrayElementOccCount(checkCaseFileData.SourceTypes);
                
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
                    }
                    else {
                        validCheckCase = false;
                        break;
                    }
                }

                if (validCheckCase) {
                    dummyList.push(checkCaseFileData);
                }
            }

            checkCaseFilesData.FilteredCheckCaseDataList = dummyList;
        }
        else {
            checkCaseFilesData.FilteredCheckCaseDataList = [];
            for (var i = 0; i < checkCaseFilesData.CheckCaseFileDataList.length; i++) {
                var checkCaseFileData = checkCaseFilesData.CheckCaseFileDataList[i];

                var sourceOccCountList =  xCheckStudio.Util.getArrayElementOccCount(checkCaseFileData.SourceTypes);
                
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
                    }
                    else {
                        validCheckCase = false;
                        break;
                    }
                }

                if (validCheckCase) {
                    checkCaseFilesData.FilteredCheckCaseDataList.push(checkCaseFileData);
                }
            }
        }

        // remove all options from check case select input
        var selectedCheckCase = checkCaseSelect.value;
        checkCaseSelect.options.length = 0;
      
        // add new check case options to check case select input        
        for (var i = 0; i < checkCaseFilesData.FilteredCheckCaseDataList.length; i++) {
            var checkCaseData = checkCaseFilesData.FilteredCheckCaseDataList[i];

            checkCaseSelect.options.add(new Option(checkCaseData.CheckCaseName, checkCaseData.CheckCaseName));
        }
        checkCaseSelect.options.add(new Option("AutoSelect", "AutoSelect"));
        if (selectedCheckCase.toLowerCase() === "autoselect") {
            if (checkCaseSelect.options.length === 2) {
                checkCaseSelect.value = checkCaseSelect.options[0].value;
                checkCaseSelect.dispatchEvent(new Event('change'));
            }
            else{
                checkCaseSelect.value = "AutoSelect";
            }
        }
        else {
            checkCaseSelect.value = selectedCheckCase;
            for (var i = 0; i < checkCaseFilesData.CheckCaseFileDataList.length; i++) {
                var checkCaseFileData = checkCaseFilesData.CheckCaseFileDataList[i];
                if (checkCaseFileData.CheckCaseName === checkCaseSelect.value) {
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
}
