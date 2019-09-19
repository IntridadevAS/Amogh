let UploadManager = {

    createFileUploader : function () {
            $("#file-uploader").dxFileUploader({
            multiple: true,
            accept: ".xml,.XML,.rvm,.RVM,.att,.ATT,.xls,.XLS,.SLDASM,.sldasm, .DWG, .dwg, .sldprt, .SLDPRT, .rvt, .rfa, .RVT, .RFA, .IFC, .STEP, .stp, .ste, .json, .igs, .IGS",
            width:"1882px",
            height: "872px",
            value: [],
            uploadMode: "useForm",
            labelText: "",
            showFileList: false,
            onInitialized: function(e) {
                console.log(e);
            },
            onValueChanged: function(e) {
                viewPanels.addFilesPanel.classList.add("hide");
                UploadManager.loadDataSource(e.value, 'uploadDatasourceForm');
            }
        });
    },
   
    loadDataSource: function (selectedFiles,
        formId) {

        //show busy spinner
        showBusyIndicator();
        
        //let selectedFiles = document.getElementById(dataSource).files;
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
                    addedSource,
                    selectedFiles);              
            }
        };
        var formData = new FormData(document.getElementById(formId));
        xhr.send(formData);
    },


    upload: function (fileName,
        formId,
        addedSource,
        files) {
        var fileExtension = xCheckStudio.Util.getFileExtension(fileName).toLowerCase();                

        if (xCheckStudio.Util.isSource3D(fileExtension) ||
            xCheckStudio.Util.isSourceDB(fileExtension)) {

            UploadManager.uploadSource(fileExtension, formId, addedSource.id).then(function (result) {

                if (xCheckStudio.Util.isSource3D(fileExtension)) {

                    // load model
                    LoadManager.load3DModel(fileName,
                        addedSource.id,
                        addedSource.visualizer.id,
                        addedSource.tableData.id,
                        formId).then(function () {
                            // filter check case
                            filterCheckCases(fileExtension);

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
                            filterCheckCases(fileExtension);

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
                        filterCheckCases(fileExtension);

                        //hide busy spinner
                        hideBusyIndicator();
                    });
            }
        }
    },

    uploadSource: function (fileExtension,
                            formId, 
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

            var formData = new FormData(document.getElementById(formId));
            formData.append('Source', sourceId);

            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
            formData.append('ProjectName', projectinfo.projectname);
            formData.append('CheckName', checkinfo.checkname);
            
            var convertToScs = "false";
            if (xCheckStudio.Util.isSource3D(fileExtension)) {
                convertToScs = "true";
            }
            formData.append('ConvertToSCS', convertToScs);

            xhr.send(formData);            
        });
    }
}