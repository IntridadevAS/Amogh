var ValidFileFormats = ["xml", "xls", "rvm", "att", "sldasm", "dwg", "sldprt", "rvt", "rfa"];
var ValidDataSources = ["xml", "xls", "rvm", "sldasm", "dwg", "sldprt", "rvt", "rfa"];
var SourceFiles = {
    "rvm": ["att"]
};

var xCheckStudio;
(function (xCheckStudio) {
    var UploadManager;
    (function (UploadManager) {

        function validateSource(fileExtension, files) {

            // get other complementery source files list
            var otherSourceFiles;
            if (fileExtension in SourceFiles) {
                otherSourceFiles = SourceFiles[fileExtension];
            }
            else 
            {
                return true;
            }

            if (files.length > 0) 
            {
                for(var i = 0; i <otherSourceFiles.length; i++ )
                {
                    var otherFile = otherSourceFiles[i];

                    var found = false;
                    for (var j = 0; j < files.length; j++) 
                    {
                        var file = files[j];
                        var fileExtension = xCheckStudio.Util.getFileExtension(file.name).toLowerCase();
                        if(otherFile === fileExtension)
                        {
                            found = true;
                            break;
                        }
                    }       
                    
                    if(!found)
                    {
                        return false;
                    }
                }               
            }
            else
            {
                return false;
            }

            return true;
        }      
       UploadManager.validateSource = validateSource;

        function getSourceData(files) {


            // if (files.length > 0) {

            //     for (var i = 0; i < files.length; i++) {
            //         var file = files[i];

            //         var fileExtension = xCheckStudio.Util.getFileExtension(file.name);
            //         fileExtension = fileExtension.toLowerCase();

            //         if (ValidDataSources.indexOf(fileExtension) > -1) {
            //             // valid datasource found
            //             return file;
            //         }
            //     }
            // }

            // return undefined;
        }
        UploadManager.getSourceData = getSourceData;

    })(UploadManager = xCheckStudio.UploadManager || (xCheckStudio.UploadManager = {}));
})(xCheckStudio || (xCheckStudio = {}));