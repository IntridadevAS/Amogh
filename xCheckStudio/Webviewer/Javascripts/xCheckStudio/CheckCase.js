
function loadCheckCases() {
    // this new project to be created
    var checkCaseSelect = document.getElementById("checkCaseSelect");
    checkCaseSelect.onchange = function () {
        if (this.value === "AutoSelect") {
            // checkCaseManager = undefined;

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

function filterCheckCases(sourceType) {
    if(!(model.currentTabId in SourceManagers))
    {
        return;
    }

    var fileName;
    var dummylist = [];
    var checkCaseSelect = document.getElementById("checkCaseSelect");

    if (sourceType === undefined) {

        checkCaseFilesData.FilteredCheckCaseDataList = [];
        checkCaseFilesData.populateCheckCases();
    }
    else {

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

///////////////////////
        // var fileExtensionA;
        // var fileExtensionB;
        // if (sourceAFileName !== undefined) {
        //     fileExtensionA = xCheckStudio.Util.getFileExtension(sourceAFileName).toUpperCase();
        // }
        // if (sourceBFileName !== undefined) {
        //     fileExtensionB = xCheckStudio.Util.getFileExtension(sourceBFileName).toUpperCase();

        // }        
        
        // // if (viewerContainer == "viewerContainer1") {
        //     if (currentTabId === "a")
        //     {
        //         checkCaseFilesData.FilteredCheckCaseDataList = [];
        //         for (var i = 0; i < checkCaseFilesData.CheckCaseFileDataList.length; i++) {
        //             var checkCaseFileData = checkCaseFilesData.CheckCaseFileDataList[i];
        //             if (checkCaseFileData.SourceTypes.includes(sourceType)) {
        //                 checkCaseFilesData.FilteredCheckCaseDataList.push(checkCaseFileData);
        //             }
        //         }
        //     }
        //     else if(currentTabId === "b" || 
        //             currentTabId === "c" || 
        //             currentTabId === "d")
        //     {
        //         for (var i = 0; i < checkCaseFilesData.FilteredCheckCaseDataList.length; i++) {
                 
        //             var checkCaseFileData = checkCaseFilesData.FilteredCheckCaseDataList[i];
        //             var count = checkCaseFileData.SourceTypes.filter(x => x == sourceType).length;
                 
        //             if (fileExtensionA == fileExtensionB) {
        //                 if (count >= 2)
        //                     dummylist.push(checkCaseFileData);
        //             }
        //             else if (checkCaseFileData.SourceTypes.includes(sourceType)) {
        //                 dummylist.push(checkCaseFileData);
        //             }
        //         }
        //         checkCaseFilesData.FilteredCheckCaseDataList = [];
        //         checkCaseFilesData.FilteredCheckCaseDataList = dummylist;
        //     }
        //}

        // else if (viewerContainer == "viewerContainer2") {
        //     if (fileExtensionA !== undefined) {
        //         for (var i = 0; i < checkCaseFilesData.FilteredCheckCaseDataList.length; i++) {
        //             var checkCaseFileData = checkCaseFilesData.FilteredCheckCaseDataList[i];
        //             var count = checkCaseFileData.SourceTypes.filter(x => x == sourceType).length;
        //             if (fileExtensionA == fileExtensionB) {
        //                 if (count >= 2)
        //                     dummylist.push(checkCaseFileData);
        //             }
        //             else if (checkCaseFileData.SourceTypes.includes(sourceType)) {
        //                 dummylist.push(checkCaseFileData);
        //             }
        //         }
        //     }
        //     else {
        //         checkCaseFilesData.FilteredCheckCaseDataList = [];
        //         for (var i = 0; i < checkCaseFilesData.CheckCaseFileDataList.length; i++) {
        //             var checkCaseFileData = checkCaseFilesData.CheckCaseFileDataList[i];
        //             var count = checkCaseFileData.SourceTypes.filter(x => x == sourceType).length;
        //             if (fileExtensionA == fileExtensionB) {
        //                 if (count >= 2)
        //                     dummylist.push(checkCaseFileData);
        //             }
        //             else if (checkCaseFileData.SourceTypes.includes(sourceType)) {
        //                 dummylist.push(checkCaseFileData);
        //             }
        //         }
        //     }
        //     checkCaseFilesData.FilteredCheckCaseDataList = [];
        //     checkCaseFilesData.FilteredCheckCaseDataList = dummylist;
        // }

        // remove all options from check case select input
        checkCaseSelect.options.length = 0;
        // for (var i = checkCaseSelect.length - 1; i >= 0; i--) {
        //     checkCaseSelect.remove(i);
        // }

        // add new check case options to check case select input        
        for (var i = 0; i < checkCaseFilesData.FilteredCheckCaseDataList.length; i++) {
            var checkCaseData = checkCaseFilesData.FilteredCheckCaseDataList[i];

            checkCaseSelect.options.add(new Option(checkCaseData.CheckCaseName, checkCaseData.CheckCaseName));
        }
        checkCaseSelect.options.add(new Option("AutoSelect", "AutoSelect"));

        // for (var i = 0; i < checkCaseSelect.options.length; i++) {
        //     var checkCaseOption = checkCaseSelect.options[i];
        //     checkCaseOption.className = "casesppidvspdm";
        // }


        for (var i = 0; i < checkCaseFilesData.CheckCaseFileDataList.length; i++) {
            var checkCaseFileData = checkCaseFilesData.CheckCaseFileDataList[i];
            if (checkCaseFileData.CheckCaseName === checkCaseSelect.value) {
                fileName = checkCaseFileData.FileName;
                break;
            }
        }

        if (fileName !== undefined) {
            checkCaseManager = new CheckCaseManager();
            checkCaseManager.readCheckCaseData(fileName);
        }
    }
}
