var ReferenceManager = function (selectedComponentRow) {
    this.SelectedComponentRow = selectedComponentRow;

    ReferenceManager.prototype.ShowReferenceDiv = function () {

        var _this = this;

        var overlay = document.getElementById("referenceOverlay");
        var popup = document.getElementById("referebcePopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        var closePopup = document.getElementById("referencePopupclose");
        closePopup.onclick = function () {
            _this.CloseReferenceDiv();
        }

        document.getElementById("addWebAddressBtn").onclick = function () {
            _this.AddWebAddress();
        }
        document.getElementById("addDocumentBtn").onclick = function () {
            _this.AddDocumet();
        }
        document.getElementById("addPictureBtn").onclick = function () {
            _this.AddPicture();
        }
        document.getElementById("addUserBtn").onclick = function () {
            _this.AddUser();
        }

        // clear all reference data
        this. ClearReferences();

        // restore references
        this.RestoreReferences();
    }

    ReferenceManager.prototype.ClearReferences = function () {
        document.getElementById("webAddressList").innerHTML = "";
        document.getElementById("documentList").innerHTML = "";
        document.getElementById("pictureList").innerHTML = "";
        document.getElementById("userList").innerHTML = "";
    }

    ReferenceManager.prototype.RestoreReferences = function () {
        var _this = this;

        var checkComponentId = undefined;
        var referenceTable = undefined;
       
        var typeOfRow = this.SelectedComponentRow[0].offsetParent.offsetParent.offsetParent.id;
        if (typeOfRow == "ComparisonMainReviewTbody") {
            // get component id
            var checkComponentId = this.SelectedComponentRow[0].cells[5].innerText;
            var referenceTable = "ComparisonCheckReferences";         
        }
        else if (typeOfRow == "SourceAComplianceMainReviewTbody") {
            referenceTable = "SourceAComplianceCheckReferences";
            checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
        }
        else if (typeOfRow == "SourceBComplianceMainReviewTbody") {
            referenceTable = "SourceBComplianceCheckReferences";
            checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
        }

        if (checkComponentId === undefined ||
            referenceTable === undefined) {
            return;
        }

        // get already existing referemce data
        $.ajax({
            url: 'PHP/GetReference.php',
            type: "POST",
            async: true,
            data: {
                'ReferenceTable': referenceTable,
                'Component': checkComponentId
            },
            success: function (msg) {
                if (msg != 'fail') {
                    var referenceData = JSON.parse(msg);

                    for (var key in referenceData) {
                        var reference = referenceData[key];

                        if ('webAddress' in reference) {
                            var referenceList = document.getElementById("webAddressList");
                            var listItem = document.createElement('li');
                            listItem.innerText = reference["webAddress"];

                            referenceList.appendChild(listItem);

                            listItem.onclick = function () {
                                window.open(this.innerText);
                            }

                            listItem.onmouseover = function () {
                                _this.Highlight(this);
                            }
                            
                            listItem.onmouseout = function () {
                                _this.UnHighlight(this);
                            }
                        }
                        else if ('document' in reference) {
                            var referenceList = document.getElementById("documentList");
                            var listItem = document.createElement('li');
                            listItem.innerText = reference["document"];

                            referenceList.appendChild(listItem);

                            listItem.onclick = function () {
                                _this.OnDocumentReferenceSelected(this);
                            }

                            listItem.onmouseover = function () {
                                _this.Highlight(this);
                            }
                            
                            listItem.onmouseout = function () {
                                _this.UnHighlight(this);
                            }
                        }
                        else if ('pic' in reference) {
                            var referenceList = document.getElementById("pictureList");
                            var listItem = document.createElement('li');
                            listItem.innerText = reference["pic"];

                            referenceList.appendChild(listItem);

                            listItem.onclick = function () {
                                _this.OnPictureReferenceSelected(this);
                            }

                            listItem.onmouseover = function () {
                                _this.Highlight(this);
                            }
                            
                            listItem.onmouseout = function () {
                                _this.UnHighlight(this);
                            }
                        }
                        else if ('users' in reference) {
                            var referenceList = document.getElementById("userList");
                            var listItem = document.createElement('li');
                            listItem.innerText = reference["users"];

                            referenceList.appendChild(listItem);

                            listItem.onclick = function () {
                                alert(this.innerText);
                            }

                            listItem.onmouseover = function () {
                                _this.Highlight(this);
                            }
                            
                            listItem.onmouseout = function () {
                                _this.UnHighlight(this);
                            }
                        }
                    }
                }
            }
        });
    }

    ReferenceManager.prototype.CloseReferenceDiv = function () {
        var overlay = document.getElementById("referenceOverlay");
        var popup = document.getElementById("referebcePopup");

        overlay.style.display = 'none';
        popup.style.display = 'none';
    }

    ReferenceManager.prototype.ToggleNewReferenceDropdown = function () {
        document.getElementById("newReferenceDropdown").classList.toggle("show");
    }

    ReferenceManager.prototype.ProcessWebAddress = function () {
        var _this = this;

        var webAddressString = document.getElementById("webAddressInput").value;

        // get component id
        var checkComponentId = undefined;
        var referenceTable = undefined;

        var typeOfRow = this.SelectedComponentRow[0].offsetParent.offsetParent.offsetParent.id;
        if (typeOfRow == "ComparisonMainReviewTbody") {
            referenceTable = "ComparisonCheckReferences";
            checkComponentId = this.SelectedComponentRow[0].cells[5].innerText;
        }
        else if (typeOfRow == "SourceAComplianceMainReviewTbody") {
            referenceTable = "SourceAComplianceCheckReferences";
            checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
        }
        else if (typeOfRow == "SourceBComplianceMainReviewTbody") {
            referenceTable = "SourceBComplianceCheckReferences";
            checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
        }

        if (checkComponentId === undefined ||
            referenceTable === undefined) {
            return;
        }

        // add reference
        $.ajax({
            url: 'PHP/AddReference.php',
            type: "POST",
            async: true,
            data: {
                'ReferenceTable': referenceTable,
                'TypeofReference': "WebAddress",
                'Component': checkComponentId,
                'referenceData': webAddressString
            },
            success: function (msg) {
                if (msg != 'fail') {
                    var referenceList = document.getElementById("webAddressList");
                    var listItem = document.createElement('li');
                    listItem.innerText = msg;

                    referenceList.appendChild(listItem);

                    listItem.onclick = function () {
                        window.open(this.innerText);
                    }

                    listItem.onmouseover = function () {
                        _this.Highlight(this);
                    }
                    
                    listItem.onmouseout = function () {
                        _this.UnHighlight(this);
                    }
                }
            }
        });
    }

    ReferenceManager.prototype.AddWebAddress = function () {

        var _this = this;

        this.ToggleNewReferenceDropdown();

        _this.ShowAddRefernceWebAddressOverlay();

        document.getElementById("addAddress").onclick = function () {
            _this.ProcessWebAddress();

            _this.CloseAddRefernceWebAddressOverlay();

            document.getElementById("webAddressInput").value = "";
        }

        document.getElementById("CancelAddAddress").onclick = function () {
            _this.CloseAddRefernceWebAddressOverlay();

            document.getElementById("webAddressInput").value = "";
        }
    }

    ReferenceManager.prototype.ShowAddRefernceWebAddressOverlay = function () {
        document.getElementById("addAddressOverlay").style.display = "block";
        document.getElementById("addAddressPopup").style.display = "block";
    }
    ReferenceManager.prototype.CloseAddRefernceWebAddressOverlay = function () {
        document.getElementById("addAddressOverlay").style.display = "none";
        document.getElementById("addAddressPopup").style.display = "none";
    }

    ReferenceManager.prototype.AddDocumet = function () {
        var _this = this;

        this.ToggleNewReferenceDropdown();

        _this.ShowAddRefernceDocumentOverlay();

        document.getElementById("UploadRefernceDocumentBtn").onclick = function () {
            _this.UploadRefernceDocument();
        }

        document.getElementById("CancelAddDocument").onclick = function () {
            _this.CloseAddRefernceDocumentOverlay();
        }
    }

    ReferenceManager.prototype.ShowAddRefernceDocumentOverlay = function () {
        document.getElementById("addDocumentOverlay").style.display = "block";
        document.getElementById("addDocumentPopup").style.display = "block";
    }
    ReferenceManager.prototype.CloseAddRefernceDocumentOverlay = function () {
        document.getElementById("addDocumentOverlay").style.display = "none";
        document.getElementById("addDocumentPopup").style.display = "none";
    }

    ReferenceManager.prototype.UploadRefernceDocument = function () {
        var _this = this;

        var referenceDataDir = undefined;
        var referenceTable = undefined;
        var checkComponentId = undefined;
        var typeOfRow = this.SelectedComponentRow[0].offsetParent.offsetParent.offsetParent.id;
        if (typeOfRow == "ComparisonMainReviewTbody") {
            referenceDataDir = "ComparisonCheckReferenceData";
            referenceTable = "ComparisonCheckReferences";
           
            // get component id
           checkComponentId = this.SelectedComponentRow[0].cells[5].innerText;
        }
        else if (typeOfRow == "SourceAComplianceMainReviewTbody") {
            referenceDataDir = "SourceAComplianceCheckReferenceData";
            referenceTable = "SourceAComplianceCheckReferences";

            // get component id
            checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
        }
        else if (typeOfRow == "SourceBComplianceMainReviewTbody") {
            referenceDataDir = "SourceBComplianceCheckReferenceData";
            referenceTable = "SourceBComplianceCheckReferences";
            
            // get component id
            checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
        }
        
        if (referenceDataDir === undefined ||
            referenceTable === undefined ||
            checkComponentId === undefined) {
            return;
        }     

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "PHP/UploadReferenceDoc.php", true);
        xhr.onload = function (event) {

            document.getElementById("UploadReferenceDocForm").reset();
            if (event.target.response === "fail") {
                alert("Adding Document reference failed.");
                return;
            }

            var referenceList = document.getElementById("documentList");
            var listItem = document.createElement('li');
            listItem.innerText = event.target.response;

            referenceList.appendChild(listItem);

            listItem.onclick = function () {
                _this.OnDocumentReferenceSelected(this);
            }

            listItem.onmouseover = function () {
                _this.Highlight(this);
            }
            
            listItem.onmouseout = function () {
                _this.UnHighlight(this);
            }
            
            _this.CloseAddRefernceDocumentOverlay();
        };
        var formData = new FormData(document.getElementById("UploadReferenceDocForm"));
        formData.append('ReferenceDataDir', referenceDataDir);
        formData.append('ReferenceTable', referenceTable);
        formData.append('Component', checkComponentId);
        formData.append('TypeofReference', "Document");
    
        xhr.send(formData);
    }

    ReferenceManager.prototype.AddPicture = function () {
        var _this = this;

        this.ToggleNewReferenceDropdown();

        _this.ShowAddReferncePictureOverlay();

        document.getElementById("UploadReferncePicBtn").onclick = function () {
            _this.UploadReferncePicture();
        }

        document.getElementById("CancelAddPic").onclick = function () {
            _this.CloseAddReferncePictureOverlay();
        }
    }

    ReferenceManager.prototype.UploadReferncePicture = function () {
        var _this = this;

        var referenceDataDir = undefined;
        var referenceTable = undefined;
        var checkComponentId = undefined;
        var typeOfRow = this.SelectedComponentRow[0].offsetParent.offsetParent.offsetParent.id;
        if (typeOfRow == "ComparisonMainReviewTbody") {
            referenceDataDir = "ComparisonCheckReferenceData";
            referenceTable = "ComparisonCheckReferences";

            // get component id
            checkComponentId = this.SelectedComponentRow[0].cells[5].innerText;
        }
        else if (typeOfRow == "SourceAComplianceMainReviewTbody") {
            referenceDataDir = "SourceAComplianceCheckReferenceData";
            referenceTable = "SourceAComplianceCheckReferences";

            // get component id
            checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
        }
        else if (typeOfRow == "SourceBComplianceMainReviewTbody") {
            referenceDataDir = "SourceBComplianceCheckReferenceData";
            referenceTable = "SourceBComplianceCheckReferences";
            
            // get component id
            checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
        }

        if (referenceDataDir === undefined ||
            referenceTable === undefined ||
            checkComponentId === undefined) {
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "PHP/UploadReferenceDoc.php", true);
        xhr.onload = function (event) {

            document.getElementById("UploadReferencePicForm").reset();
            if (event.target.response === "fail") {
                alert("Adding Picture reference failed.");
                return;
            }

            var referenceList = document.getElementById("pictureList");
            var listItem = document.createElement('li');
            listItem.innerText = event.target.response;

            referenceList.appendChild(listItem);

            listItem.onclick = function () {
                _this.OnPictureReferenceSelected(this);
            }

            listItem.onmouseover = function () {
                _this.Highlight(this);
            }
            
            listItem.onmouseout = function () {
                _this.UnHighlight(this);
            }

            _this.CloseAddReferncePictureOverlay();
        };
        var formData = new FormData(document.getElementById("UploadReferencePicForm"));
        formData.append('ReferenceDataDir', referenceDataDir);
        formData.append('ReferenceTable', referenceTable);
        formData.append('Component', checkComponentId);
        formData.append('TypeofReference', "Picture");
        xhr.send(formData);
    }

    ReferenceManager.prototype.ShowAddReferncePictureOverlay = function () {
        document.getElementById("addPictureOverlay").style.display = "block";
        document.getElementById("addPicturePopup").style.display = "block";
    }
    ReferenceManager.prototype.CloseAddReferncePictureOverlay = function () {
        document.getElementById("addPictureOverlay").style.display = "none";
        document.getElementById("addPicturePopup").style.display = "none";
    }

    ReferenceManager.prototype.AddUser = function () {
        this.ToggleNewReferenceDropdown();
    }

    ReferenceManager.prototype.OnDocumentReferenceSelected = function (item) {

        $.ajax({
            data: { 'variable': 'ProjectName' },
            type: "POST",
            url: "PHP/GetSessionVariable.php"
        }).done(function (msg) {
            if (msg !== 'fail') {
                window.open("Projects/" + msg + "/" + item.innerText);
            }
        });
    }

    ReferenceManager.prototype.OnPictureReferenceSelected = function (item) {

        $.ajax({
            data: { 'variable': 'ProjectName' },
            type: "POST",
            url: "PHP/GetSessionVariable.php"
        }).done(function (msg) {
            if (msg !== 'fail') {
                window.open("Projects/" + msg + "/" + item.innerText);
            }
        });
    }

    ReferenceManager.prototype.Highlight = function (item) {
        item.style.backgroundColor = "#ffe5e5";
    }

    ReferenceManager.prototype.UnHighlight = function (item) {
        item.style.backgroundColor = "white";
    }
}