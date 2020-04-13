let UploadManager = {
    formId: "uploadDatasourceForm",
    createFileUploader: function () {
        $("#file-uploader").dxFileUploader({
            multiple: true,
            accept: ".xml,.XML,.rvm,.RVM,.att,.ATT,.xls,.XLS,.SLDASM,.sldasm," +
             ".DWG,.dwg,.DXF,.dxf,.DWF,.dwf,.DWFX,.dwfx,.sldprt,.SLDPRT,"+
             ".rvt,.rfa,.RVT,.RFA,.IFC,.STEP,.stp,.ste,.json,.igs,.IGS,"+
             ".VSD,.vsd,.VSDX,.vsdx," +
             ".JT,.jt,.PRT,.prt,.MF1,.mf1,.ARC,.arc,.UNV,.unv,.PKG,.pkg," +
             ".MODEL,.model,.SESSION,.session,.DLV,.dlv,.EXP,.exp," +
             ".CATDrawing, .catdrawing, .CATPart, .catpart, .CATProduct, .catproduct, .CATShape, .catshape, .CGR, .cgr"+
             ".3DXML, .3dxml, .OBJ, .obj, .NEU, .neu, .PRT, .prt, .XAS, .xas, .XPR, .xpr" +
             ".IPT, .ipt, .IAM, .iam, .ASM, .asm, .PAR, .par, .PWD, .pwd, .PSM, .psm" + 
             ".3DS, .3ds, .U3D, .u3d, .SAT, .sat, .SAB, .sab",
            width: "100%",
            height: "100%",
            value: [],
            uploadMode: "useForm",
            labelText: "",
            showFileList: false,
            onInitialized: function (e) {
                var dropArea = document.getElementById(UploadManager.formId);
                dropArea.addEventListener("drop", UploadManager.dropHandler, false);
                dropArea.addEventListener("dragover", UploadManager.doNothing, false);
            },
            onValueChanged: function (e) {
                viewPanels.addFilesPanel.classList.add("hide");
                // add next available source
                var addedSource = controller.addNewFile("");
                var form = document.getElementById(UploadManager.formId)
                var formData = new FormData(form);
                UploadManager.loadDataSource(e.value, formData, addedSource);
            }
        });
    },

    dropHandler: function (event) {
        UploadManager.doNothing(event);
        var filelist = event.dataTransfer.files;


        if (!filelist) return;  // if null, exit now  
        var filecount = filelist.length;  // get number of dropped files  

        viewPanels.addFilesPanel.classList.add("hide");

        // add next available source
        var addedSource = controller.addNewFile("");

        var form = document.getElementById(UploadManager.formId)
        var formData = new FormData(form);

        var input = event.dataTransfer.items[0].webkitGetAsEntry();
        if (filecount > 0) {
            if (input.isDirectory) {
                //show busy spinner
                showBusyIndicator();

                var item = input;
                UploadManager.getFilesInDirectory(item).then(function (fileEntries) {

                    // // validate dataset, if checkspace is loaded from saved data
                    // if (model.loadSavedCheckspace) {
                    //     if (!UploadManager.validateSourceFromDirDragDrop(fileEntries, item.name)) {                            
                    //         showNotValidDatasourcePrompt();

                    //         //hide busy spinner
                    //         hideBusyIndicator();

                    //         // delete tabdata
                    //         model.activeTabs--;
                    //         controller.deleteTabData(addedSource.id);
                    //         viewTabs.showAddTab();
                    //         viewPanels.showAddPanel();

                    //         return;
                    //     }
                    // }
                    // else
                    // {   
                    // validate dataset for selected checkspace                     
                    if (checkCaseManager && checkCaseManager.CheckCase) {
                        if (!UploadManager.validateSourceFromDirDragDropForSelectedCheckspace(fileEntries, item.name)) {
                            showNotValidDatasource1Prompt();

                            //hide busy spinner
                            hideBusyIndicator();

                            // delete tabdata
                            model.activeTabs--;
                            controller.deleteTabData(addedSource.id);
                            viewTabs.showAddTab();
                            viewPanels.showAddPanel();

                            return;
                        }
                    }
                    //}

                    UploadManager.createFormDataAndUpload(formData, fileEntries, addedSource, item)
                });
            }
            else if (input.isFile) {
                let items = event.dataTransfer.items;
                formData.delete("files[]");
                for (let i = 0; i < items.length; i++) {
                    formData.append("files[]", items[i].getAsFile());
                }

                UploadManager.loadDataSource(filelist, formData, addedSource);
            }
        }
    },

    // validateSourceFromDirDragDrop: function (allFiles, dirName) {
    //     // get the main source file name
    //     var mainFileName = undefined;
    //     for (var i = 0; i < allFiles.length; i++) {
    //         var fileEntry = allFiles[i];
    //         var name = xCheckStudio.Util.getFileNameWithoutExtension(fileEntry.name);
    //         if (dirName === name) {
    //             mainFileName = fileEntry.name;
    //             break;
    //         }
    //     }
    //     if (!mainFileName) {
    //         return false;
    //     }

    //     if (!UploadManager.validateDataSetForSavedCheckSpace(mainFileName)) {            
    //         return false;
    //     }

    //     return true;
    // },

    validateSourceFromDirDragDropForSelectedCheckspace: function (allFiles, dirName) {
        // get the main source file name
        var mainFileName = undefined;
        for (var i = 0; i < allFiles.length; i++) {
            var fileEntry = allFiles[i];
            var name = xCheckStudio.Util.getFileNameWithoutExtension(fileEntry.name);
            if (dirName === name) {
                mainFileName = fileEntry.name;
                break;
            }
        }
        if (!mainFileName) {
            return false;
        }

        if (!UploadManager.validateDataSetForSelectedCheckSpace(mainFileName)) {
            return false;
        }

        return true;
    },

    doNothing: function (event) {
        event.stopPropagation();
        event.preventDefault();
    },

    createFormDataAndUpload: function (formData, fileEntries, addedSource, fileItem) {
        formData.delete("files[]");
        for (var j = 0; j < fileEntries.length; j++) {
            formData.append('files[]', fileEntries[j]);
        }

        formData.append('Source', addedSource.id);
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        formData.append('ProjectName', projectinfo.projectname);
        formData.append('CheckName', checkinfo.checkname);

        var mainFileName = UploadManager.getMainFileName(fileItem);

        viewTabs.createTab(addedSource);
        viewPanels.showPanel(addedSource.viewPanel);
        viewTabs.addTab.classList.remove("selectedTab");

        UploadManager.uploadFilesFromFolder(formData, mainFileName, addedSource);
    },

    getAsFile: function (fileEntry) {
        return new Promise((resolve) => {

            fileEntry.file(function (file) {
                resolve(file);
            });
        });
    },

    getFilesInDirectory: function (entry) {
        let reader = entry.createReader();
        var fileObjects = [];
        var fileEntries = [];
        // Resolved when the entire directory is traversed
        return new Promise((resolve_directory) => {
            (function read_entries() {
                // According to the FileSystem API spec, readEntries() must be called until
                // it calls the callback with an empty array.  Seriously??
                reader.readEntries((entries) => {
                    //Call read_entries untill readEntries() gives empty array and append new entries to our (fileEntries) array
                    if (!entries.length) {
                        UploadManager.getFilesFromEntries(fileEntries).then(function (fileObjects) {
                            resolve_directory(Promise.all(fileObjects));
                        });
                    } else {
                        fileEntries = fileEntries.concat(UploadManager.toArray(entries));
                        read_entries();
                    }
                });
            })();
        });
    },

    toArray: function (list) {
        return Array.prototype.slice.call(list || [], 0);
    },

    getFilesFromEntries: function (fileEntries) {
        var fileObjects = [];
        var counter = 0;
        return new Promise((resolve) => {
            for (var i = 0; i < fileEntries.length; i++) {
                var entry = fileEntries[i];
                if (entry.isFile) {
                    UploadManager.getAsFile(entry).then(function (file) {
                        fileObjects.push(file);
                        counter++;
                        if (counter === fileEntries.length) {
                            resolve(fileObjects);
                        }
                    });
                }
                else {
                    counter++;
                    if (counter === fileEntries.length) {
                        resolve(fileObjects);
                    }
                }
            }
        });
    },

    getMainFileName: function (item) {
        // get main file name
        var mainFileName = item.name;
        return mainFileName;
    },

    uploadFilesFromFolder: function (uploadFormData, mainFileName, addedSource) {

        $.ajax({
            url: "uploads/uploadDirectory.php",
            type: "POST",
            data: uploadFormData,
            cache: false,
            contentType: false,
            processData: false,
            success: function (ret) {
                UploadManager.convertDataSource(mainFileName, uploadFormData, addedSource);

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                // hide busy spinner
                busySpinner.classList.remove('show');
            }
        });
    },

    convertDataSource: function (mainFileName, formData, addedSource) {
        formData.append("MainFile", mainFileName);

        $.ajax({
            url: "uploads/convertDatasource.php",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function (ret) {
                if (ret === 'fail') {
                    return;
                }

                var tab = document.getElementById("tab_" + addedSource.id);
                tab.children[0].innerText = ret;
                tab.children[1].setAttribute("data-tooltip", ret);

                var fileExtension = xCheckStudio.Util.getFileExtension(ret).toLowerCase();
                addedSource.fileName = ret;
                addedSource.type = fileExtension;

                if (xCheckStudio.Util.isSource3D(fileExtension)) {
                    var fileNames = [];
                    fileNames.push(ret);
                    //load model
                    LoadManager.load3DModel(fileNames,
                        addedSource.id,
                        addedSource.visualizer.id,
                        addedSource.tableData.id,
                        UploadManager.formId).then(function () {
                            // filter check case
                            filterCheckCases(false);

                            //hide busy spinner
                            hideBusyIndicator();
                        });
                }
                else if (xCheckStudio.Util.isSourceVisio(fileExtension)) {
                    var fileNames = [];
                    fileNames.push(ret);
                    //load model
                    LoadManager.loadVisioModel(fileNames,
                        addedSource.id,
                        addedSource.visualizer.id,
                        addedSource.tableData.id,
                        UploadManager.formId).then(function () {
                            // filter check case
                            filterCheckCases(false);

                            //hide busy spinner
                            hideBusyIndicator();
                        });
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                // hide busy spinner
                hideBusyIndicator();
            }
        });
        return false;
    },

    loadDataSource: function (selectedFiles,
        formData, addedSource) {

        //show busy spinner
        showBusyIndicator();

        //let selectedFiles = document.getElementById(dataSource).files;
        let selectedFilesCount = selectedFiles.length;
        if (selectedFilesCount == 0) {
            document.getElementById(UploadManager.formId).reset();
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "PHP/GetSourceData.php", true);
        xhr.onload = function (data) {

            var sourceArray = JSON.parse(data.target.response);

            if (!sourceArray ||
                sourceArray.length === 0) {
                //OnShowToast('Valid data source not found');
                alert('Valid data source not found');

                //hide busy spinner
                hideBusyIndicator();

                // delete tabdata
                model.activeTabs--;
                controller.deleteTabData(addedSource.id);
                viewTabs.showAddTab();
                viewPanels.showAddPanel();

                return;
            }
            else {
                // // if checkspace is loaded from saved data, then validate the data set types                        
                // if (model.loadSavedCheckspace) {
                //     if (!UploadManager.validateDataSetForSavedCheckSpace(sourceArray[0])) {
                //         showNotValidDatasourcePrompt();

                //         //hide busy spinner
                //         hideBusyIndicator();

                //         // delete tabdata
                //         model.activeTabs--;
                //         controller.deleteTabData(addedSource.id);
                //         viewTabs.showAddTab();  
                //         viewPanels.showAddPanel();                      

                //         return;
                //     }
                // }
                // else {
                // validate datset for selected checkcase
                if (checkCaseManager && checkCaseManager.CheckCase) {
                    if (!UploadManager.validateDataSetForSelectedCheckSpace(sourceArray[0])) {
                        showNotValidDatasource1Prompt();

                        //hide busy spinner
                        hideBusyIndicator();

                        // delete tabdata
                        model.activeTabs--;
                        controller.deleteTabData(addedSource.id);
                        viewTabs.showAddTab();
                        viewPanels.showAddPanel();

                        return;
                    }
                }
                //}

                //var fileName = sourceArray[0];
                var fileName = "";
                for (var i = 0; i < sourceArray.length; i++) {

                    if (i === sourceArray.length - 1) {
                        fileName += sourceArray[i];
                    }
                    else {
                        fileName += sourceArray[i] + ", ";
                    }
                }

                addedSource.fileName = fileName;
                addedSource.type = xCheckStudio.Util.getFileExtension(fileName).toLowerCase();;

                //Create tab header and Show panel for selected tab
                viewTabs.createTab(addedSource);
                viewPanels.showPanel(addedSource.viewPanel);
                viewTabs.addTab.classList.remove("selectedTab");

                UploadManager.upload(sourceArray,
                    formData,
                    addedSource,
                    selectedFiles);
            }
        };

        xhr.send(formData);
    },

    validateDataSetForSelectedCheckSpace: function (currentSource) {
        var supportedTypes = [];
        for (var key in checkCaseManager.CheckCase.SourceTypes) {
            supportedTypes.push(checkCaseManager.CheckCase.SourceTypes[key].toLowerCase());
        }

        var allLoadedTypes = [];
        var currentSourceType = xCheckStudio.Util.getFileExtension(currentSource).toLowerCase();
        allLoadedTypes.push(currentSourceType);

        for (var id in model.views) {
            var view = model.views[id];
            if (!view.used ||
                !view.type ||
                view.type === "") {
                continue;
            }

            allLoadedTypes.push(view.type.toLowerCase());
        }

        // get type wise count for loaded datasets
        var loadedTypeOccuCounts = xCheckStudio.Util.getArrayElementOccCount(allLoadedTypes);

        // get type wise count for supported datasets
        var supportedypeOccuCounts = xCheckStudio.Util.getArrayElementOccCount(supportedTypes);

        for (var type in loadedTypeOccuCounts) {
            if (!(type in supportedypeOccuCounts)) {
                return false;
            }


            var loadCnt = loadedTypeOccuCounts[type];
            var allowedCnt = supportedypeOccuCounts[type];
            if (loadCnt > allowedCnt) {
                return false;
            }
        }

        return true;
    },

    // validateDataSetForSavedCheckSpace: function (currentSource) {
    //     var allLoadedTypes = [];
    //     var currentSourceType = xCheckStudio.Util.getFileExtension(currentSource).toLowerCase();
    //     allLoadedTypes.push(currentSourceType);

    //     for (var id in model.views) {
    //         var view = model.views[id];
    //         if (!view.used ||
    //             !view.type ||
    //             view.type === "") {
    //             continue;
    //         }

    //         allLoadedTypes.push(view.type.toLowerCase());
    //     }

    //     // get type wise count for loaded datasets
    //     var loadedTypeOccuCounts = xCheckStudio.Util.getArrayElementOccCount(allLoadedTypes);

    //     // get type wise count for supported datasets
    //     var supportedypeOccuCounts = xCheckStudio.Util.getArrayElementOccCount(model.datasetTypes);

    //     for (var type in loadedTypeOccuCounts) {
    //         if (!(type in supportedypeOccuCounts)) {
    //             return false;
    //         }


    //         var loadCnt = loadedTypeOccuCounts[type];
    //         var allowedCnt = supportedypeOccuCounts[type];
    //         if (loadCnt > allowedCnt) {
    //             return false;
    //         }
    //     }

    //     return true;
    // },

    upload: function (fileNames,
        formData,
        addedSource,
        files) {
        var fileExtension = xCheckStudio.Util.getFileExtension(fileNames[0]).toLowerCase();

        if (xCheckStudio.Util.isSource3D(fileExtension) ||
            xCheckStudio.Util.isSourceDB(fileExtension) ||
            xCheckStudio.Util.isSourceVisio(fileExtension)) {

            UploadManager.uploadSource(fileExtension, formData, addedSource.id).then(function (result) {

                if (xCheckStudio.Util.isSource3D(fileExtension)) {

                    // load model
                    LoadManager.load3DModel(fileNames,
                        addedSource.id,
                        addedSource.visualizer.id,
                        addedSource.tableData.id,
                        UploadManager.formId).then(function () {
                            // filter check case
                            filterCheckCases(false);

                            //hide busy spinner
                            hideBusyIndicator();
                        });
                }
                else if (xCheckStudio.Util.isSourceDB(fileExtension)) {
                    LoadManager.loadDBModel(fileExtension,
                        files,
                        addedSource.id,
                        addedSource.visualizer.id,
                        addedSource.tableData.id).then(function () {
                            // filter check case
                            filterCheckCases(false);

                            //hide busy spinner
                            hideBusyIndicator();
                        });
                }
                else if (xCheckStudio.Util.isSourceVisio(fileExtension)) {
                    // load model
                    LoadManager.loadVisioModel(fileNames,
                        addedSource.id,
                        addedSource.visualizer.id,
                        addedSource.tableData.id,
                        UploadManager.formId).then(function () {
                            // filter check case
                            filterCheckCases(false);

                            //hide busy spinner
                            hideBusyIndicator();
                        });
                }
            });
        }
        else if (xCheckStudio.Util.isSource1D(fileExtension)) {

            if (xCheckStudio.Util.isSourceExcel(fileExtension)) {
                LoadManager.loadExcelModel(fileExtension,
                    files,
                    addedSource.id,
                    addedSource.visualizer.id,
                    addedSource.tableData.id).then(function () {
                        // filter check case
                        filterCheckCases(false);

                        //hide busy spinner
                        hideBusyIndicator();
                    });
            }
        }
    },

    uploadSource: function (fileExtension,
        formData,
        sourceId) {
        return new Promise((resolve) => {

            var xhr = new XMLHttpRequest();
            xhr.open("POST", "PHP/UploadSource.php", true);
            xhr.onload = function (event) {
                if (event.target.response !== "fail") {

                    return resolve(true);
                }

                return resolve(false);
            };

            // var formData = new FormData(document.getElementById(formId));
            formData.append('Source', sourceId);

            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
            formData.append('ProjectName', projectinfo.projectname);
            formData.append('CheckName', checkinfo.checkname);

            var convertToScs = "false";
            var convertToSVG = "false";
            if (xCheckStudio.Util.isSource3D(fileExtension)) {
                convertToScs = "true";
            }            
            else if (xCheckStudio.Util.isSourceVisio(fileExtension)) {
                convertToSVG = "true";
            }

            formData.append('ConvertToSCS', convertToScs);
            formData.append('ConvertToSVG', convertToSVG);

            xhr.send(formData);
        });
    }
}

function showNotValidDatasourcePrompt() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("notValidDatasetPopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

function onNotValidDataSourceOk() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("notValidDatasetPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';

}

function showNotValidDatasource1Prompt() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("notValidDataset1Popup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

function onNotValidDataSource1Ok() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("notValidDataset1Popup");

    overlay.style.display = 'none';
    popup.style.display = 'none';

}