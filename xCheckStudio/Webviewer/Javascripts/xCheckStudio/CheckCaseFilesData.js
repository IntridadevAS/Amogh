var CheckCaseFilesData = function () {     

    this.CheckCaseFileDataList = [];
    CheckCaseFilesData.prototype.addCheckCaseFileData = function (checkCaseFileData) {
        this.CheckCaseFileDataList.push(checkCaseFileData);
    }

    // CheckCaseFilesData.prototype.readCheckCaseFiles = function () {
    //     var _this = this;
    //     var fileList = checkCaseFiles;
    //     if (fileList.length == 0) {
    //         return;
    //     }

    //     var filesPending = fileList.length;

    //     for (var i = 0; i < fileList.length; i++) {
    //         var checkCaseFileName = fileList[i];

    //         var xhttp = new XMLHttpRequest();
    //         xhttp.onreadystatechange = function () {
    //             if (this.readyState == 4 && this.status == 200) {
                    
    //                 var fileData = _this.readCheckCaseFileData(this);
    //                 if (fileData.length == 0) {
    //                     return;
    //                 }

    //                 var checkCaseName = fileData[0];

    //                 var filePathArray = this.responseURL.split("/");
    //                 if (filePathArray.length == 0) {
    //                     return;
    //                 }
                    
    //                 var fileName = filePathArray[filePathArray.length -1];


    //                 var checkCaseFileData = new CheckCaseFileData(fileName, checkCaseName);
    //                 _this.addCheckCaseFileData(checkCaseFileData);                                       

    //                 filesPending--;
    //                 if (filesPending == 0) {
    //                     _this.populateCheckCases();
    //                 }
    //             }
    //         };

    //         //xhttp.open("GET", "configurations/XML_2_XML_Datamapping.xml", true);
    //         xhttp.open("GET", "configurations/" + checkCaseFileName + ".xml", true);
    //         xhttp.send();
    //     }
    // }

     CheckCaseFilesData.prototype.readCheckCaseFiles = function (sourceAType, sourceBType, excludeNone) {
        this.CheckCaseFileDataList = [];
        var _this = this;
        var fileList = checkCaseFiles;
        if (fileList.length == 0) {
            return;
        }

        var filesPending = fileList.length;
        return new Promise(function (resolve) {
        try {
            for (var i = 0; i < fileList.length; i++) {
                var checkCaseFileName = fileList[i];

                var xhttp = new XMLHttpRequest();
                xhttp.open("GET", "configurations/" + checkCaseFileName + ".xml", true);
                xhttp.send();  

                xhttp.onreadystatechange = function () {
                        if (this.readyState == 4 && this.status == 200) {
                        
                            var fileData = _this.readCheckCaseFileData(this);
                            
                            if (fileData.length == 0) {
                                return;
                            }
        
                            var checkCaseName = fileData[0];
        
                            var filePathArray = this.responseURL.split("/");
                            if (filePathArray.length == 0) {
                                return;
                            }
                            if(sourceAType !== undefined && sourceAType.toLowerCase() == 'json')
                                sourceAType = 'DB';
                            if(sourceBType !== undefined && sourceBType.toLowerCase() == 'json')
                                sourceBType = 'DB';
                                                
                            var fileName = filePathArray[filePathArray.length -1];
                            var checkName = fileName.split(".");
        
                            if(sourceAType !== undefined && sourceBType == undefined && checkName[0].includes(sourceAType))
                            {
                                    var checkCaseFileData = new CheckCaseFileData(fileName, checkCaseName);
                                    _this.addCheckCaseFileData(checkCaseFileData);                         
                            }
                            else if(sourceAType == undefined && sourceBType !== undefined && checkName[0].includes(sourceBType))
                            {
                                    var checkCaseFileData = new CheckCaseFileData(fileName, checkCaseName);
                                    _this.addCheckCaseFileData(checkCaseFileData);                         
                            }
                            else if(sourceAType !== undefined && sourceBType !== undefined && checkName[0].includes(sourceAType) && checkName[0].includes(sourceBType)) {
                                if(sourceAType == sourceBType)
                                {
                                    var rgxp = new RegExp(sourceAType, "gi");
                                    var count = (checkName[0].match(rgxp).length);
                                    if(count >= 2)
                                    {
                                        var checkCaseFileData = new CheckCaseFileData(fileName, checkCaseName);
                                        _this.addCheckCaseFileData(checkCaseFileData);
                                    }
                                }
                                else
                                {
                                    var checkCaseFileData = new CheckCaseFileData(fileName, checkCaseName);
                                    _this.addCheckCaseFileData(checkCaseFileData);
                                }
                                
                            }
                            else if(sourceAType == undefined && sourceBType == undefined)
                            {
                                var checkCaseFileData = new CheckCaseFileData(fileName, checkCaseName);
                                _this.addCheckCaseFileData(checkCaseFileData);  
                            }
                            filesPending--;
                            if (filesPending == 0) {
                                _this.populateCheckCases(excludeNone);
                                return resolve(true);
                            }
                        }
                    }
                }; 
            }
            catch(err)
            {
                console.log(err);
                return resolve(false);
            }
        });
    }

    CheckCaseFilesData.prototype.populateCheckCases = function (excludeNone) {
        var checkCaseSelect = document.getElementById("checkCaseSelect");

        // remove old checkcase entries, if there are any
        for (var i = checkCaseSelect.length - 1; i >= 0; i--) {
            checkCaseSelect.remove(i);
        }
             
        // add None option
        if(excludeNone == undefined || excludeNone == false) {
            checkCaseSelect.options.add(new Option("None", "None"));
        }

        for (var i = 0; i < this.CheckCaseFileDataList.length; i++) {
            var checkCaseData = this.CheckCaseFileDataList[i];

            checkCaseSelect.options.add(new Option(checkCaseData.CheckCaseName, checkCaseData.CheckCaseName));
        }

        for (var i = 0; i < checkCaseSelect.options.length; i++) {
            var checkCaseOption = checkCaseSelect.options[i];
            checkCaseOption.className = "casesppidvspdm";
        }

        
        // var checkCaseFileName = getCheckCase();
        // if(checkCaseFileName !== undefined)
        //     checkCaseManager.readCheckCaseData(checkCaseFileName);
    }

    CheckCaseFilesData.prototype.readCheckCaseFileData = function (xml) {
        var xmlText = xml.responseText;

        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlText, "application/xml");

        var checkCaseElements = xmlDoc.getElementsByTagName("CheckCase");
        if (checkCaseElements.length < 0) {
            return;
        }

        var checkCaseElement = checkCaseElements[0];

        //var checkCaseType = checkCaseElement.getAttribute("complianceCheck");
        var checkCaseName = checkCaseElement.getAttribute("name");

        return [/*checkCaseType,*/ checkCaseName]
    }
}

var CheckCaseFileData = function (fileName, checkCaseName) {
    this.FileName = fileName;
    this.CheckCaseName = checkCaseName;
}
