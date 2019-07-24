function onDropFiles(event) {
    event.currentTarget.classList.remove('dropzone');
    
    let items = event.dataTransfer.items;

    // if (event.currentTarget.id === "dropZone1") {
    //     viewerContainer = "viewerContainer1";
    //     dropZoneId = "dropZone1";
    //     modelTreeContainer = "modelTree1";
    // }
    // else if (event.currentTarget.id === "dropZone2") {
    //     viewerContainer = "viewerContainer2";
    //     dropZoneId = "dropZone2";
    //     modelTreeContainer = "modelTree2";
    // }
    // else {
    //     return;
    // }    


    event.preventDefault();
    for (let i = 0; i < items.length; i++) {
        let item = items[i].webkitGetAsEntry();

       
        if (item.isFile) {
            var mainFileName;
            if("att" != xCheckStudio.Util.getFileExtension(item.name).toLowerCase())
            {
                mainFileName = item.name;
            }
            var fileExtension = xCheckStudio.Util.getFileExtension(mainFileName).toLowerCase();

            var file = items[i].getAsFile();
                       
            // if data source is Excel file
            if (fileExtension.toLowerCase() === "xls") {               
                extractXLSAttributeData(file);
                break;
            }
            else
            {
                // var validSourceTypes = getValidSourceTypes();
                // if (!validSourceTypes ||
                //     validSourceTypes.length === 0) {
                //     alert("Please select data source mapping with valid source types.");
                //     document.getElementById("uploadDataSetForm").reset();
                //     return;
                // }
            
                // var path = document.getElementById("loadSourceInput").value;
                // var inputSourceType = path.split('.').pop();
                // if (!validSourceTypes.includes(inputSourceType.toLowerCase())) {
                //     alert("Please select data source mapping with valid source types.");
                //     document.getElementById("uploadDataSetForm").reset();
                //     return;
                // }

                var uploadFormData = new FormData();
                uploadFormData.append('dataSoures[]', file);
                uploadFormData.append('ValidSourceTypes', viewerContainer);
                uploadFiles(uploadFormData, mainFileName, viewerContainer, modelTreeContainer);
            }
        }
        else if (item.isDirectory) {

            traverse_directory(item).then(function (fileEntries) {
                //alert('traverse done');
                var uploadFormData = new FormData();

                for (var j = 0; j < fileEntries.length; j++) {
                    uploadFormData.append('files[]', fileEntries[j]);
                }

                uploadFormData.append('viewerContainer', viewerContainer);

                var mainFileName = getMainFileName(item, dropZoneId);                
                uploadFiles(uploadFormData, mainFileName, viewerContainer, modelTreeContainer);
            });
        }
    }   
}

function enableDropZone(dropZoneId) {
    let dropzone = document.getElementById(dropZoneId);

    dropzone.addEventListener("dragover", onDragOver, false);

    dropzone.addEventListener('dragleave',  onDragLeave, false);      
       
}

function disbleDropZone(dropZoneId) {
    let dropzone = document.getElementById(dropZoneId);

    dropzone.removeEventListener("dragover", onDragOver);

    dropzone.removeEventListener('dragleave',  onDragLeave);    
       
}

function onDragOver(event)
{
    event.preventDefault();
    event.target.classList.add('dropzone');
}
function onDragLeave(event)
{
    event.target.classList.remove('dropzone');
}
