var CheckCaseFilesData = function () {     

    this.CheckCaseFileDataList = [];
    this.FilteredCheckCaseDataList = [];
    CheckCaseFilesData.prototype.addCheckCaseFileData = function (checkCaseFileData) {
        this.CheckCaseFileDataList.push(checkCaseFileData);
    }

     CheckCaseFilesData.prototype.readCheckCaseFiles = function (sourceAType, sourceBType, excludeNone) {
        this.CheckCaseFileDataList = [];
        var _this = this;

        return new Promise(function (resolve) {
        try {
            var fileList = checkCaseFiles;
            if (fileList.length == 0) {
                return resolve(false);
            }
            var filesPending = fileList.length;

            for (var i = 0; i < fileList.length; i++) {
                var checkCaseFileName = fileList[i];

                var xhttp = new XMLHttpRequest();
                xhttp.open("GET", "configurations/" + checkCaseFileName + ".xml", true);
                xhttp.send();  

                xhttp.onreadystatechange = function () {
                        if (this.readyState == 4 && this.status == 200) {
                        
                            var fileData = _this.readCheckCaseFileData(this);
                            
                            if (fileData.length == 0) {
                                return resolve(false);
                            }
        
                            var checkCaseName = fileData[0];
                            var sourcetypes = fileData[1];
        
                            var filePathArray = this.responseURL.split("/");
                            if (filePathArray.length == 0) {
                                return resolve(false);
                            }

                            var fileName = filePathArray[filePathArray.length -1];
                           
                            var checkCaseFileData = new CheckCaseFileData(fileName, checkCaseName, sourcetypes);
                            _this.addCheckCaseFileData(checkCaseFileData);  

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

    CheckCaseFilesData.prototype.populateCheckCases = function () {
        var checkCaseSelect = document.getElementById("checkCaseSelect");

        // remove old checkcase entries, if there are any
        for (var i = checkCaseSelect.length - 1; i >= 0; i--) {
            checkCaseSelect.remove(i);
        }
             
        checkCaseSelect.options.add(new Option("None", "None"));

        for (var i = 0; i < this.CheckCaseFileDataList.length; i++) {
            var checkCaseData = this.CheckCaseFileDataList[i];

            checkCaseSelect.options.add(new Option(checkCaseData.CheckCaseName, checkCaseData.CheckCaseName));
        }

        for (var i = 0; i < checkCaseSelect.options.length; i++) {
            var checkCaseOption = checkCaseSelect.options[i];
            checkCaseOption.className = "casesppidvspdm";
        }
    }

    CheckCaseFilesData.prototype.readCheckCaseFileData = function (xml) {
        var xmlText = xml.responseText;
        var sourceTypes = [];
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlText, "application/xml");

        var checkCaseElements = xmlDoc.getElementsByTagName("CheckCase");
        if (checkCaseElements.length < 0) {
            return;
        }

        var checkCaseElement = checkCaseElements[0];
        var checkCaseName = checkCaseElement.getAttribute("name");
        var checkType = checkCaseElement.getElementsByTagName("Check");
        for(var type = 0; type < checkType.length; type++) { 
            if(checkType[type].getAttribute("sourceAType") && checkType[type].getAttribute("sourceBType"))
            {
                sourceTypes.push(checkType[type].getAttribute("sourceAType").toLowerCase());
                sourceTypes.push(checkType[type].getAttribute("sourceBType").toLowerCase());
            }
            if(checkType[type].getAttribute("sourceType")) {
                var sourceType = checkType[type].getAttribute("sourceType");
                if(!sourceTypes.includes(sourceType.toLowerCase())) {
                    sourceTypes.push(sourceType.toLowerCase());
                }
            }
        }

        return [checkCaseName, sourceTypes]
    }
}

var CheckCaseFileData = function (fileName, checkCaseName, sourceTypes) {
    this.FileName = fileName;
    this.CheckCaseName = checkCaseName;
    this.SourceTypes = sourceTypes;
}
