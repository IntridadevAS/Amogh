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
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            $.ajax({
                data:
                {
                    'Source': sourceId,
                    'fileName': fileNameWithoutExt,
                    'dataSourceType': '3D',
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname
                },
                type: "POST",
                url: "PHP/GetSourceFilePath.php"
            }).done(function (uri) {
                if (uri !== 'fail') {

                    // uri contains SCS file path, so load
                    xCheckStudio.Util.fileExists(uri).then(function (success) {
                        if (success) {

                            var fileExtension = xCheckStudio.Util.getFileExtension(fileNames[0]).toLowerCase();
                            // if (viewerContainer === "viewerContainer1") {
                            var sourceManager = createSourceManager(fileNames[0],
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
                    if (formId) {
                        document.getElementById(formId).reset();
                    }

                    return resolve(false);
                }

            });

            //return resolve(true);
        });
    },

    loadExcelModel: function (fileExtension,
        files,
        sourceId,
        viewerContainer,
        modelTreeContainer) {
        return new Promise((resolve) => {
            // var fileExtensionA;
            // var fileExtensionB;

            // fileExtensionA = xCheckStudio.Util.getFileExtension(sourceAFileName).toUpperCase();
            // if (sourceBFileName !== undefined) {
            //     fileExtensionB = xCheckStudio.Util.getFileExtension(sourceBFileName).toUpperCase();
            // }

            // if (checkCaseManager && checkCaseManager.CheckCase && checkCaseSelected) {
            //     var sourceAType;
            //     var sourceBType;
            //     for (var i = 0; i < checkCaseManager.CheckCase.CheckTypes.length; i++) {
            //         var checkType = checkCaseManager.CheckCase.CheckTypes[i];
            //         if (checkType.Name.toLowerCase() === "comparison") {
            //             sourceAType = checkType.SourceAType;
            //             sourceBType = checkType.SourceBType;
            //             break;
            //         }
            //         else if (checkType.Name.toLowerCase() === "compliance") {
            //             sourceAType = checkType.SourceAType;
            //             break;
            //         }
            //     }

            //     if (viewerContainer === "viewerContainer1") {
            //         if (checkType.Name.toLowerCase() === "comparison" && (sourceAType || sourceBType)) {
            //             if (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
            //                 sourceBType.toLowerCase() !== fileExtension.toLowerCase()) {
            //                 alert("Data source type doesn't match with check case.");
            //                 return false;
            //             }
            //         }
            //         else {
            //             if (sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
            //                 alert("Data source type doesn't match with check case.");
            //                 return false;
            //             }
            //         }

            //     }
            //     else if (viewerContainer === "viewerContainer2") {
            //         if (checkType.Name.toLowerCase() === "comparison" && (sourceAType || sourceBType)) {
            //             if ((sourceAType.toLowerCase() !== sourceBType.toLowerCase()) && (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
            //                 sourceBType.toLowerCase() !== fileExtension.toLowerCase())) {
            //                 alert("Data source type doesn't match with check case.");
            //                 return false;
            //             }
            //             else if (fileExtensionA == fileExtensionB && sourceAType !== sourceBType) {
            //                 if (sourceAType.toLowerCase() == fileExtensionA.toLowerCase() && fileExtension == fileExtensionA.toLowerCase()) {
            //                     alert("Data source type doesn't match with check case.");
            //                     return false;
            //                 }
            //                 else if (sourceBType.toLowerCase() == fileExtensionA.toLowerCase() && fileExtension == fileExtensionB.toLowerCase()) {
            //                     alert("Data source type doesn't match with check case.");
            //                     return false;
            //                 }
            //             }
            //             else if (sourceAType == sourceBType && fileExtensionA !== fileExtensionB) {
            //                 alert("Data source type doesn't match with check case.");
            //                 return false;
            //             }
            //         }
            //         else {
            //             if (sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
            //                 alert("Data source type doesn't match with check case.");
            //                 return false;
            //             }
            //         }
            //     }
            // }
            // else if (checkCaseManager && !checkCaseSelected) {
            //     getCheckCase(fileExtension, viewerContainer);

            // }   

            // read and load data
            var file = files[0];
            let fileName = file.name;
            var fileExtension = xCheckStudio.Util.getFileExtension(fileName);

            var sourceManager = createSourceManager(fileName, fileExtension, viewerContainer, modelTreeContainer);
            SourceManagers[sourceId] = sourceManager;
            sourceManager.LoadData(file).then(function (result) {
                return resolve(true);
            });

            // readExcelDataSource(file[0],
            //                     viewerContainer,
            //                     modelTreeContainer);
            //return true;
        });
    },

    loadDBModel: function (fileExtension,
        files,
        sourceId,
        viewerContainer,
        modelTreeContainer) {

        // var sourceAType;
        // var sourceBType;

        // var fileExtensionA;
        // var fileExtensionB;
        // fileExtensionA = xCheckStudio.Util.getFileExtension(sourceAFileName).toUpperCase();
        // if (sourceBFileName !== undefined) {
        //     fileExtensionB = xCheckStudio.Util.getFileExtension(sourceBFileName).toUpperCase();
        // }

        // if (checkCaseManager && checkCaseManager.CheckCase && checkCaseSelected) {
        //     var sourceAType;
        //     var sourceBType;
        //     for (var i = 0; i < checkCaseManager.CheckCase.CheckTypes.length; i++) {
        //         var checkType = checkCaseManager.CheckCase.CheckTypes[i];
        //         if (checkType.Name.toLowerCase() === "comparison") {
        //             sourceAType = checkType.SourceAType;
        //             sourceBType = checkType.SourceBType;
        //             break;
        //         }
        //         else if (checkType.Name.toLowerCase() === "compliance") {
        //             sourceAType = checkType.SourceAType;
        //             break;
        //         }
        //     }

        //     if (viewerContainer === "viewerContainer1") {
        //         if (checkType.Name.toLowerCase() === "comparison" && (sourceAType || sourceBType)) {
        //             if (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
        //                 sourceBType.toLowerCase() !== fileExtension.toLowerCase()) {
        //                 alert("Data source type doesn't match with check case.");
        //                 return false;
        //             }
        //         }
        //         else {
        //             if (sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
        //                 alert("Data source type doesn't match with check case.");
        //                 return false;
        //             }
        //         }

        //     }
        //     else if (viewerContainer === "viewerContainer2") {
        //         if (checkType.Name.toLowerCase() === "comparison" && (sourceAType || sourceBType)) {
        //             if ((sourceAType.toLowerCase() !== sourceBType.toLowerCase()) && (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
        //                 sourceBType.toLowerCase() !== fileExtension.toLowerCase())) {
        //                 alert("Data source type doesn't match with check case.");
        //                 return false;
        //             }
        //             else if (fileExtensionA == fileExtensionB && sourceAType !== sourceBType) {
        //                 if (sourceAType.toLowerCase() == fileExtensionA.toLowerCase() && fileExtension == fileExtensionA.toLowerCase()) {
        //                     alert("Data source type doesn't match with check case.");
        //                     return false;
        //                 }
        //                 else if (sourceBType.toLowerCase() == fileExtensionA.toLowerCase() && fileExtension == fileExtensionB.toLowerCase()) {
        //                     alert("Data source type doesn't match with check case.");
        //                     return false;
        //                 }
        //             }
        //             else if (sourceAType == sourceBType && fileExtensionA !== fileExtensionB) {
        //                 alert("Data source type doesn't match with check case.");
        //                 return false;
        //             }
        //         }
        //         else {
        //             if (sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
        //                 alert("Data source type doesn't match with check case.");
        //                 return false;
        //             }
        //         }
        //     }
        // }
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
                            
                            var sourceManager = createSourceManager(fileName, fileExtension, viewerContainer, modelTreeContainer);
                            SourceManagers[sourceId] = sourceManager;
                            sourceManager.LoadData(uri).then(function (result) {
                          
                            });

                            // readDbDataSource(uri,
                            //     files[0].name,
                            //     viewerContainer,
                            //     modelTreeContainer);
                        
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
    }
}