
function onDropFiles(event, viewerContainer, modelTreeContainer) {
    event.currentTarget.classList.remove('dropzone');
    
    let items = event.dataTransfer.items;

    if (event.currentTarget.id === "dropZone1") {
        viewerContainer = "viewerContainer1";
        dropZoneId = "dropZone1";
        modelTreeContainer = "modelTree1";
    }
    else if (event.currentTarget.id === "dropZone2") {
        viewerContainer = "viewerContainer2";
        dropZoneId = "dropZone2";
        modelTreeContainer = "modelTree2";
    }
    else {
        return;
    }    


    event.preventDefault();
    for (let i = 0; i < items.length; i++) {
        let item = items[i].webkitGetAsEntry();

       
        if (item.isFile) {
            var mainFileName = item.name;
            var fileExtension = xCheckStudio.Util.getFileExtension(mainFileName).toLowerCase();

            // if data source is Excel file
            if (fileExtension.toLowerCase() === "xls") {
                if (loadExcelDataSource(fileExtension,
                    items[0].getAsFile(),                    
                    viewerContainer,
                    modelTreeContainer)) {

                    manageControlsOnDatasourceLoad(mainFileName,
                        viewerContainer,
                        modelTreeContainer);
                    return;
                }
            }

            var uploadFormData = new FormData();
            uploadFormData.append('files[]', items[0].getAsFile());
            uploadFiles(uploadFormData, mainFileName, viewerContainer, modelTreeContainer);
        }
        else if (item.isDirectory) {

            traverse_directory(item).then(function (fileEntries) {
                //alert('traverse done');
                var uploadFormData = new FormData();

                for (var j = 0; j < fileEntries.length; j++) {
                    uploadFormData.append('files[]', fileEntries[j]);
                }

                var mainFileName = getMainFileName(item, dropZoneId);
                uploadFiles(uploadFormData, mainFileName, viewerContainer, modelTreeContainer);
            });
        }
    }   
}

function uploadFiles(uploadFormData, mainFileName, viewerContainer, modelTreeContainer) {

    // show busy loader
    var busySpinner = document.getElementById("divLoading");
    if (busySpinner !== undefined) {
        busySpinner.className = 'show';
    }

    $.ajax({
        url: "uploads/uploadDirectory.php",
        type: "POST",
        data: uploadFormData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (ret) {
            //alert(ret);
            convertDataSource(mainFileName, viewerContainer, modelTreeContainer);

            // // hide busy spinner
            // busySpinner.classList.remove('show');
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            // hide busy spinner
            busySpinner.classList.remove('show');
        }
    });
}

function convertDataSource(mainFileName, viewerContainer, modelTreeContainer) {
    var formData = new FormData();
    formData.append("MainFile", mainFileName);

    // show busy loader
    var busySpinner = document.getElementById("divLoading");

    $.ajax({
        url: "uploads/convertDatasource.php",
        type: "POST",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (ret) {
            //alert(ret);

            if (loadModel(mainFileName, viewerContainer, modelTreeContainer)) {

                manageControlsOnDatasourceLoad(mainFileName,
                    viewerContainer, 
                    modelTreeContainer);

                // //alert("Model Loaded");   
                // hideLoadButton(modelTreeContainer);

                // if (viewerContainer === "viewerContainer1") {
                //     sourceAFileName = mainFileName;

                //     // enable source a controls
                //     // enable check all CB for source A
                //     var component = document.querySelector('.module1 .group1 .checkallswitch .toggle-KJzr');
                //     if (component.classList.contains("disabledbutton")) {
                //         component.classList.remove('disabledbutton');
                //     }

                //     // diable compliance CB for source A
                //     component = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
                //     if (component.classList.contains("disabledbutton")) {
                //         component.classList.remove('disabledbutton');
                //     }

                //     // enable check button
                //     component = document.getElementById('checkButton');
                //     if (component.classList.contains("disabledbutton")) {
                //         component.classList.remove('disabledbutton');
                //     }

                //     // enable info  button
                //     component = document.getElementById('infobtn');
                //     if (component.classList.contains("disabledbutton")) {
                //         component.classList.remove('disabledbutton');
                //     }

                //     // enable source B, load button
                //     component = document.getElementById('createbtnB');
                //     if (component.classList.contains("disabledbutton")) {
                //         component.classList.remove('disabledbutton');
                //     }

                //     // enable drop zone for source B
                //     enableDropZone("dropZone2");

                //     // disable load button for souece a
                //     component = document.getElementById('createbtnA');
                //     addClass(component, 'disabledbutton');   
                // }
                // else if (viewerContainer === "viewerContainer2") {
                //     sourceBFileName = mainFileName;

                //     // enable source b controls
                //     // enable source a controls
                //     // enable check all CB for source A
                //     var component = document.querySelector('.module1 .group2 .checkallswitch .toggle-KJzr2');
                //     if (component.classList.contains("disabledbutton")) {
                //         component.classList.remove('disabledbutton');
                //     }

                //     // diable compliance CB for source A
                //     component = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
                //     if (component.classList.contains("disabledbutton")) {
                //         component.classList.remove('disabledbutton');
                //     }

                //     // enable comparison switch
                //     component = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
                //     if (component.classList.contains("disabledbutton")) {
                //         component.classList.remove('disabledbutton');
                //     }

                //     // enable info  button
                //     component = document.getElementById('infobtn');
                //     if (component.classList.contains("disabledbutton")) {
                //         component.classList.remove('disabledbutton');
                //     }

                //     // disble load button for souece b
                //     component = document.getElementById('createbtnB');
                //     addClass(component, 'disabledbutton');        
                // }

            }
            else {

            }

            // hide busy spinner
            if (busySpinner !== undefined) {
                busySpinner.classList.remove('show');
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            // hide busy spinner
            if (busySpinner !== undefined) {
                busySpinner.classList.remove('show');
            }
        }
    });
    return false;
}

function manageControlsOnDatasourceLoad(mainFileName,
                                        viewerContainer, 
                                        modelTreeContainer) {
    hideLoadButton(modelTreeContainer);

    if (viewerContainer === "viewerContainer1") {
        sourceAFileName = mainFileName;

        // enable source a controls
        // enable check all CB for source A
        var component = document.querySelector('.module1 .group1 .checkallswitch .toggle-KJzr');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // diable compliance CB for source A
        component = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // enable check button
        component = document.getElementById('checkButton');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // enable info  button
        component = document.getElementById('infobtn');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // enable source B, load button
        component = document.getElementById('createbtnB');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // enable drop zone for source B
        enableDropZone("dropZone2");

        // disable load button for souece a
        component = document.getElementById('createbtnA');
        addClass(component, 'disabledbutton');
    }
    else if (viewerContainer === "viewerContainer2") {
        sourceBFileName = mainFileName;

        // enable source b controls
        // enable source a controls
        // enable check all CB for source A
        var component = document.querySelector('.module1 .group2 .checkallswitch .toggle-KJzr2');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // diable compliance CB for source A
        component = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // enable comparison switch
        component = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // enable info  button
        component = document.getElementById('infobtn');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // disble load button for souece b
        component = document.getElementById('createbtnB');
        addClass(component, 'disabledbutton');
    }
}

function getMainFileName(item, dropZoneId) {
    // get main file name
    var mainFileName = item.name;
    //var dropZoneId = dropzone.id;

    // get source extensiom
    if (checkCaseManager !== undefined &&
        checkCaseManager.CheckCase !== undefined &&
        checkCaseManager.CheckCase.CheckTypes !== undefined &&
        checkCaseManager.CheckCase.CheckTypes.length > 0) {

        var sourceType;
        if (dropZoneId === "dropZone1") {
            sourceType = checkCaseManager.CheckCase.CheckTypes[0].SourceAType;
        }
        else if (dropZoneId === "dropZone2") {
            for (var j = 0; j < checkCaseManager.CheckCase.CheckTypes.length; j++) {
                if (checkCaseManager.CheckCase.CheckTypes[j].SourceBType !== undefined &&
                    checkCaseManager.CheckCase.CheckTypes[j].SourceBType !== "") {
                    sourceType = checkCaseManager.CheckCase.CheckTypes[0].SourceBType;
                    break;
                }
            }
        }
    }
    if (sourceType === undefined) {
        return undefined;
    }
    mainFileName = mainFileName + "." + sourceType;

    return mainFileName;
}

function getAsFile(fileEntry) {
    return new Promise((resolve) => {

        fileEntry.file(function (file) {
            resolve(file);
        });
    });
}

function getFilesFromEntries(fileEntries) {
    var fileObjects = [];
    var counter = 0;
    return new Promise((resolve) => {
        for (var i = 0; i < fileEntries.length; i++) {
            var entry = fileEntries[i];
            if (entry.isFile) {
                getAsFile(entry).then(function (file) {
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
}

function traverse_directory(entry) {
    let reader = entry.createReader();
    //var fileObjects =[];
    // Resolved when the entire directory is traversed
    return new Promise((resolve_directory) => {
        var iteration_attempts = [];
        (function read_entries() {
            // According to the FileSystem API spec, readEntries() must be called until
            // it calls the callback with an empty array.  Seriously??
            reader.readEntries((entries) => {
                getFilesFromEntries(entries).then(function (fileObjects) {
                    resolve_directory(Promise.all(fileObjects));
                });
            });
        })();
    });
}

function enableDropZone(dropZoneId) {
    let dropzone = document.getElementById(dropZoneId);

    dropzone.addEventListener("dragover", function (event) {
        event.preventDefault();
        dropzone.classList.add('dropzone');
    }, false);

    dropzone.ondragleave = e => {
        dropzone.classList.remove('dropzone');
    }   
}

