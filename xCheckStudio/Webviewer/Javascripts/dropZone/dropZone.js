
// function scanFiles(item, container) {
//     alert(item.name);
//     if (item.isDirectory) {
//         let directoryReader = item.createReader();

//         directoryReader.readEntries(function (entries) {
//             entries.forEach(function (entry) {
//                 scanFiles(entry);
//             });
//         });
//     }
// }

function onDropFiles(event, viewerContainer, modelTreeContainer ) {
    let items = event.dataTransfer.items;
    //var dropZoneId = dropzone.id;

    event.preventDefault();
    for (let i = 0; i < items.length; i++) {
        let item = items[i].webkitGetAsEntry();

        var mainFileName = getMainFileName(item, event.target.id);
        if (item.isFile) {
            //uploadFiles(items[0].getAsFile(), true);

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

                uploadFiles(uploadFormData, mainFileName, viewerContainer, modelTreeContainer);

            });
        }
    }

    event.target.classList.remove('dropzone');
}

function uploadFiles(uploadFormData, mainFileName, viewerContainer, modelTreeContainer) {

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
        }
    });
}

function convertDataSource(mainFileName, viewerContainer, modelTreeContainer) {
    var formData = new FormData();
    formData.append("MainFile", mainFileName);

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
                //alert("Model Loaded");   
                hideLoadButton(modelTreeContainer);

                // enable source a controls
                // diable check all CB for source A
                var component = document.querySelector('.module1 .group1 .checkallswitch .toggle-KJzr');
                if (component.classList.contains("disabledbutton")) {
                    component.classList.remove('disabledbutton');
                }

                // diable compliance CB for source A
                component = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
                if (component.classList.contains("disabledbutton")) {
                    component.classList.remove('disabledbutton');
                }

                // enable source B, load button
                component = document.getElementById('createbtnB');
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
            }
            else {
                
            }
        }
    });
    return false;
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

function setDropZone() {
    let dropzone = document.getElementById("dropZone1");

    dropzone.addEventListener("dragover", function (event) {
        event.preventDefault();
        dropzone.classList.add('dropzone');
    }, false);

    dropzone.ondragleave = e => {
        dropzone.classList.remove('dropzone');
    }

}

