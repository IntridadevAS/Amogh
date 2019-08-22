let LoadManager = {

    loadModel: function (fileName,
        sourceId,
        viewerContainer,
        modelTreeContainer,
        formId) {

        return new Promise((resolve) => {
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

                            var fileExtension = xCheckStudio.Util.getFileExtension(fileName).toLowerCase();
                            // if (viewerContainer === "viewerContainer1") {
                            var sourceManager = createSourceManager(fileExtension,
                                viewerContainer,
                                modelTreeContainer,
                                uri);
                            SourceManagers[sourceId] = sourceManager;
                            sourceManager.LoadData().then(function (result) {

                            });

                            return resolve(true);
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

            return resolve(true);
        });
    },
}