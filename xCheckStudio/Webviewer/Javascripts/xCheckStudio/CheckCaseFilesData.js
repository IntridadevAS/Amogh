var CheckCaseFilesData = function () {
    this.ComplianceCheckDataList = [];
    this.NonComplianceCheckData = [];

    CheckCaseFilesData.prototype.addComplianceCheckFileData = function (checkCaseFileData) {
        this.ComplianceCheckDataList.push(checkCaseFileData);
    }

    CheckCaseFilesData.prototype.addNonComplianceCheckFileData = function (checkCaseFileData) {
        this.NonComplianceCheckData.push(checkCaseFileData);
    }

    CheckCaseFilesData.prototype.readCheckCases = function () {
        var _this = this;
        var fileList = checkCaseFiles;
        if (fileList.length == 0) {
            return;
        }

        var filesPending = fileList.length;

        for (var i = 0; i < fileList.length; i++) {
            var checkCaseFileName = fileList[i];

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    var fileData = _this.readCheckCaseFileData(this);

                    var complianceCheckAttribute = fileData[0];
                    if (complianceCheckAttribute !== null &&
                        complianceCheckAttribute !== undefined) {

                        var filePathArray = this.responseURL.split("/");
                        if(filePathArray.length ==0)
                        {
                            return;
                        }
                        var fileName = filePathArray[filePathArray.length -1];
                        var checkCaseFileData = new CheckCaseFileData(fileName, fileData[1]);
                        if (complianceCheckAttribute.toLowerCase() === "true") {
                            checkCaseFilesData.addComplianceCheckFileData(checkCaseFileData);
                        }
                        else if (complianceCheckAttribute.toLowerCase() === "false") {
                            checkCaseFilesData.addNonComplianceCheckFileData(checkCaseFileData);
                        }
                    }

                    filesPending--;
                    if (filesPending == 0) {
                        _this.populateCheckCases();
                    }
                }


            };

            //xhttp.open("GET", "configurations/XML_2_XML_Datamapping.xml", true);
            xhttp.open("GET", "configurations/" + checkCaseFileName + ".xml", true);
            xhttp.send();
        }
    }

    CheckCaseFilesData.prototype.populateCheckCases = function () {
        var checkCaseSelect = document.getElementById("checkCaseSelect");

        for (var i = checkCaseSelect.length - 1; i >= 0; i--) {
            checkCaseSelect.remove(i);
        }

        checkCaseSelect.options
        var checkDataList;
        if (complianceCheck) {
            checkDataList = this.ComplianceCheckDataList;
        }
        else {
            checkDataList = this.NonComplianceCheckData
        }

        // add None option
        checkCaseSelect.options.add(new Option("None", "None"));

        for (var i = 0; i < checkDataList.length; i++) {
            var checkData = checkDataList[i];

            checkCaseSelect.options.add(new Option(checkData.CheckCaseName, checkData.CheckCaseName));
        }
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

        var checkCaseType = checkCaseElement.getAttribute("complianceCheck");
        var checkCaseName = checkCaseElement.getAttribute("name");

        return [checkCaseType, checkCaseName]
    }
}

var CheckCaseFileData = function (fileName, checkCaseName) {
    this.FileName = fileName;
    this.CheckCaseName = checkCaseName;
}
