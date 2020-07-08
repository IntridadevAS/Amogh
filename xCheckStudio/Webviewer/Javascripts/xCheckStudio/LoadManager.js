let LoadManager = {

    load3DModel: function (fileNames,
        sourceId,
        viewerContainer,
        modelTreeContainer,
        formId) {

        return new Promise((resolve) => {

            var fileName = fileNames[0];           
            
            // get SCS file path and load model into viewer
            var fileNameWithoutExt = undefined;
            if (fileName.includes(".")) {
                fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
            }
            else {
                fileNameWithoutExt = fileName;
            }

            // if multiple xml files are selected for loading
            if (fileNames.length > 1) {
                fileNameWithoutExt = "source";
            }

            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));           
            var checkName = null;
            var isVault = null;
            if (isDataVault()) {
                isVault = "true";
                checkName = null;
            }
            else {
                var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
                checkName = checkinfo.checkname;
                isVault = "false";
            }

            var xhr = $.ajax({
                data:
                {
                    'Source': sourceId,
                    'fileName': fileNameWithoutExt,
                    'dataSourceType': '3D',
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkName,
                    "isDataVault": isVault
                },
                type: "POST",
                url: "PHP/GetSourceFilePath.php"
            }).done(function (uri) {
                console.log("Abort disabled for load..");
                enableAbortBusyIndicator(onAbortXHR, false);
                
                if (uri !== 'fail') {

                    // uri contains SCS file path, so load
                    xCheckStudio.Util.fileExists(uri).then(function (success) {
                        if (success) {

                            var fileExtension = xCheckStudio.Util.getFileExtension(fileNames[0]).toLowerCase();
                            // if (viewerContainer === "viewerContainer1") {
                            var fileName = "";
                            for (var i = 0; i < fileNames.length; i++) {
                                if (i === fileNames.length - 1) {
                                    fileName += fileNames[i];
                                }
                                else {
                                    fileName += fileNames[i] + ", ";
                                }
                            }
                            var sourceManager = createSourceManager(sourceId,
                                fileName,
                                fileExtension,
                                viewerContainer,
                                modelTreeContainer,
                                uri);
                            SourceManagers[sourceId] = sourceManager;
                            sourceManager.LoadData().then(function (result) {
                                return resolve(result);
                            });
                        }
                        else {
                            if (formId) {
                                document.getElementById(formId).reset();
                            }
                            alert("File not found to load.");

                            return resolve(false);
                        }
                    });
                }
                else {
                    if (formId) {
                        document.getElementById(formId).reset();
                    }


                    return resolve(false);
                }

            }).fail(function () {
                console.log("Aborted load");
                console.log("Abort disabled for load..");
                enableAbortBusyIndicator(onAbortXHR, false);
                return resolve(false);
            });           

            var onAbortXHR = function () {
                if (xhr !== null) {
                    xhr.abort();
                }
            }
           
            console.log("Abort enabled for load..");
            enableAbortBusyIndicator(onAbortXHR, true);
        });
    },

    loadExcelModel: function (fileExtension,
        files,
        sourceId,
        viewerContainer,
        modelTreeContainer) {
        return new Promise((resolve) => {          

            // read and load data
            var file = files[0];
            let fileName = file.name;
            //var fileExtension = xCheckStudio.Util.getFileExtension(fileName);

            var sourceManager = createSourceManager(sourceId, fileName, fileExtension, viewerContainer, modelTreeContainer);
            SourceManagers[sourceId] = sourceManager;
            sourceManager.LoadData(file).then(function (result) {
                return resolve(true);
            });           
        });
    },

    loadDBModel: function (fileExtension,
        files,
        sourceId,
        viewerContainer,
        modelTreeContainer) {
       
        return new Promise((resolve) => {
            var fileName = files[0].name.substring(0, files[0].name.lastIndexOf('.'));

            var fileNameWithoutExt = undefined;
            if (fileName.includes(".")) {
                fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
            }
            else {
                fileNameWithoutExt = fileName;
            }
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            $.ajax({
                data: {'Source': sourceId,
                    'fileName': fileNameWithoutExt,
                    'dataSourceType': '1D',
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname},
                type: "POST",
                url: "PHP/GetSourceFilePath.php"
            }).done(function (uri) {
                
                if (uri !== 'fail') {
                  
                    xCheckStudio.Util.fileExists(uri).then(function (success) {
                       
                        if (success) {
                            
                            var sourceManager = createSourceManager(sourceId, files[0].name, fileExtension, viewerContainer, modelTreeContainer);
                            SourceManagers[sourceId] = sourceManager;
                            sourceManager.LoadData(uri).then(function (result) {
                          
                          });                          
                        
                        return resolve(true);
                        }
                        else {
                            document.getElementById(formId).reset();
                            alert("File not found to load.");
                            
                            return resolve(false);
                        }
                    });
                }
                else {
                    document.getElementById(formId).reset();
                    return resolve(false);
                }
            });           
        });
    },

    loadVisioModel: function(fileNames,
        sourceId,
        viewerContainer,
        modelTreeContainer,
        formId)
    {
        return new Promise((resolve) => {

            var fileName = fileNames[0];           
            
            // get SCS file path and load model into viewer
            var fileNameWithoutExt = undefined;
            if (fileName.includes(".")) {
                fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
            }
            else {
                fileNameWithoutExt = fileName;
            }

            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            // var checkName
            // var isVault = null;
            // if (isDataVault()) {
            //     isVault = "true";
            //     checkName = null;
            // }
            // else {
            //     var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
            //     checkName = checkinfo.checkname;
            //     isVault = "false";
            // }

            $.ajax({
                data: {'Source': sourceId,
                    'fileName': fileNameWithoutExt,
                    'dataSourceType': 'Visio',
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname,
                    "isDataVault" : "false" },
                type: "POST",
                url: "PHP/GetSourceFilePath.php"
            }).done(function (uri) {
                
                if (uri !== 'fail') {
                  
            // uri contains SCS file path, so load
                    xCheckStudio.Util.fileExists(uri).then(function (success) {
                        if (success) {

                            var fileExtension = xCheckStudio.Util.getFileExtension(fileNames[0]).toLowerCase();
                            // if (viewerContainer === "viewerContainer1") {
                            // var fileName = "";
                            // for (var i = 0; i < fileNames.length; i++) {
                            //     if (i === fileNames.length - 1) {
                            //         fileName += fileNames[i];
                            //     }
                            //     else {
                            //         fileName += fileNames[i] + ", ";
                            //     }
                            // }
                            var sourceManager = createSourceManager(sourceId,
                                fileName,
                                fileExtension,
                                viewerContainer,
                                modelTreeContainer,
                                uri);
                            SourceManagers[sourceId] = sourceManager;
                            sourceManager.LoadData().then(function (result) {
                                return resolve(true);
                            });                            
                        }
                        else {
                            if (formId) {
                                document.getElementById(formId).reset();
                            }
                            alert("File not found to load.");

                            return resolve(false);
                        }
                    });
                }
                else {
                    document.getElementById(formId).reset();
                    return resolve(false);
                }
            });

        });
    }
}