let UploadManager = {
    loadDataSource: function (event,
        dataSource,
        formId) {

        // var modal = document.getElementById('projectselectiondialogModal');
        // modal.style.display = "none";

        let selectedFiles = document.getElementById(dataSource).files;
        let selectedFilesCount = selectedFiles.length;
        if (selectedFilesCount == 0) {
            document.getElementById(formId).reset();
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "PHP/GetSourceData.php", true);
        xhr.onload = function (data) {
            if (data.target.response === "undefined") {
                //OnShowToast('Valid data source not found');
                alert('Valid data source not found');
                return;
            }
            else {
                // addTabHeaders(modelTreeContainer, data.target.response);
                //var fileExtension = xCheckStudio.Util.getFileExtension(data.target.response).toLowerCase();
                var fileName = data.target.response;

                // add next available source
                var addedSource = controller.addNewFile(fileName);

                UploadManager.upload(fileName,
                    formId,
                    addedSource);
                // uploadAndLoadModel(fileExtension,
                //     data.target.response,
                //     viewerContainer,
                //     modelTreeContainer,
                //     dataSource,
                //     formId,
                //     event.target.files);
            }
        };
        var formData = new FormData(document.getElementById(formId));
        xhr.send(formData);
    },


    upload: function (fileName,
        formId,
        addedSource) {
        var fileExtension = xCheckStudio.Util.getFileExtension(fileName).toLowerCase();

        // var busySpinner = document.getElementById("divLoading");
        // busySpinner.className = 'show';

        if (xCheckStudio.Util.isSource3D(fileExtension)) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "PHP/UploadSource.php", true);
            xhr.onload = function (event) {
                if (event.target.response !== "fail") {

                    // load model
                    LoadManager.loadModel(fileName,
                        addedSource.id,
                        addedSource.visualizer.id,
                        addedSource.tableData.id,
                        formId).then(function () {

                        });
                }

                // busySpinner.classList.remove('show')
            };
            var formData = new FormData(document.getElementById(formId));
            formData.append('Source', addedSource.id);

            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
            formData.append('ProjectName', projectinfo.projectname);
            formData.append('CheckName', checkinfo.checkname);
            formData.append('ConvertToSCS', "true");

            xhr.send(formData);
        }
        else if (xCheckStudio.Util.isSource1D(fileExtension)) {

        }
    },

    // uploadAndLoadModel: function (fileExtension,
    //     fileName, viewerContainer, modelTreeContainer, dataSource, formId, files) {
    //     if (fileExtension.toLowerCase() === "xml" ||
    //         fileExtension.toLowerCase() === "rvm" ||
    //         fileExtension.toLowerCase() === "sldasm" ||
    //         fileExtension.toLowerCase() === "dwg" ||
    //         fileExtension.toLowerCase() === "sldprt" ||
    //         fileExtension.toLowerCase() === "rvt" ||
    //         fileExtension.toLowerCase() === "rfa" ||
    //         fileExtension.toLowerCase() === "ifc" ||
    //         fileExtension.toLowerCase() === "step" ||
    //         fileExtension.toLowerCase() === "stp" ||
    //         fileExtension.toLowerCase() === "ste" ||
    //         fileExtension.toLowerCase() === "json" ||
    //         fileExtension.toLowerCase() === "igs" ||
    //         fileExtension.toLowerCase() === "xls") {
    //         var busySpinner = document.getElementById("divLoading");
    //         busySpinner.className = 'show';

    //         var xhr = new XMLHttpRequest();
    //         xhr.open("POST", "uploads/uploadfiles.php", true);
    //         xhr.onload = function (event) {
    //             if (fileExtension.toLowerCase() === "json") {
    //                 if (loadDbDataSource(fileExtension,
    //                     files,
    //                     viewerContainer,
    //                     modelTreeContainer)) {

    //                     hideLoadButton(modelTreeContainer);
    //                 }
    //             }
    //             else if (fileExtension.toLowerCase() === "xls") {
    //                 if (loadExcelDataSource(fileExtension,
    //                     files,
    //                     viewerContainer,
    //                     modelTreeContainer)) {
    //                     hideLoadButton(modelTreeContainer);
    //                 }
    //             }
    //             else {
    //                 loadModel(fileName,
    //                     viewerContainer,
    //                     modelTreeContainer, formId);
    //             }


    //             busySpinner.classList.remove('show')
    //         };
    //         var formData = new FormData(document.getElementById(formId));
    //         formData.append('viewerContainer', viewerContainer);

    //         var convertToSCS = 'true';
    //         if (fileExtension.toLowerCase() === "json" ||
    //             fileExtension.toLowerCase() === "xls") {
    //             convertToSCS = 'false';
    //         }
    //         var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    //         var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    //         formData.append('ConvertToSCS', convertToSCS);
    //         formData.append('ProjectName', projectinfo.projectname);
    //         formData.append('CheckName', checkinfo.checkname);
    //         xhr.send(formData);

    //     }
    // }
}