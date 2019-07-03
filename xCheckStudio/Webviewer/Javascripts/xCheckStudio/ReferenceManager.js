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

        document.getElementById("addWebAddressBtn").onclick = function()
        {
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

        // restore references
        this.RestoreReferences();
    }

    ReferenceManager.prototype.RestoreReferences = function()
    {
        var typeOfRow = this.SelectedComponentRow[0].offsetParent.offsetParent.offsetParent.id;
        if (typeOfRow == "ComparisonMainReviewTbody") {
            // get component id
            var checkComponentId = this.SelectedComponentRow[0].cells[5].innerText;

            // get already existing referemce data
            $.ajax({
                url: 'PHP/GetReference.php',
                type: "POST",
                async: true,
                data: {
                    'ReferenceTable': "ComparisonCheckReferences",
                    'Component': checkComponentId
                },
                success: function (msg) {
                    if (msg != 'fail') {
                        var referenceData = JSON.parse(msg);

                        for(var key in referenceData)
                        {
                            var reference = referenceData[key];

                            if('webAddress' in reference)
                            {
                                var referenceList = document.getElementById("webAddressList");
                                var listItem = document.createElement('li');
                                listItem.innerText = reference["webAddress"];
        
                                referenceList.appendChild(listItem);
                             
                                listItem.onclick = function()
                                {
                                    window.open(this.innerText);
                                }
                            }
                            else if('document' in reference)
                            {

                            }
                            else if('pic' in reference)
                            {

                            }
                            else if('users' in reference)
                            {

                            }
                        }
                    }
                }
            });
        }
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
        var webAddressString = document.getElementById("webAddressInput").value;
        
        var typeOfRow = this.SelectedComponentRow[0].offsetParent.offsetParent.offsetParent.id;
        if(typeOfRow == "ComparisonMainReviewTbody") 
        {
            // get component id
            var checkComponentId = this.SelectedComponentRow[0].cells[5].innerText;

            $.ajax({
                url: 'PHP/AddReference.php',
                type: "POST",
                async: true,
                data: {'ReferenceTable' : "ComparisonCheckReferences", 
                       'TypeofReference': "WebAddress",
                       'Component': checkComponentId,
                       'referenceData': webAddressString},
                success: function (msg) {
                    if(msg != 'fail')
                    {
                        var referenceList = document.getElementById("webAddressList");
                        var listItem = document.createElement('li');
                        listItem.innerText = msg;

                        referenceList.appendChild(listItem);
                     
                        listItem.onclick = function()
                        {
                            window.open(this.innerText);
                        }
                    }
                }                
            });
        }       
    }

    ReferenceManager.prototype.AddWebAddress = function () {

        var _this = this;

        this.ToggleNewReferenceDropdown();

        document.getElementById("addAddressOverlay").style.display = "block";
        document.getElementById("addAddressPopup").style.display = "block";

        document.getElementById("addAddress").onclick = function () 
        {
            _this.ProcessWebAddress();

            document.getElementById("addAddressOverlay").style.display = "none";
            document.getElementById("addAddressPopup").style.display = "none";

            document.getElementById("webAddressInput").value = "";
        }

        document.getElementById("CancelAddAddress").onclick = function () {
            document.getElementById("addAddressOverlay").style.display = "none";
            document.getElementById("addAddressPopup").style.display = "none";
            
            document.getElementById("webAddressInput").value = "";
        }
    }

    ReferenceManager.prototype.AddDocumet = function () {
        var _this = this;

        this.ToggleNewReferenceDropdown();

        document.getElementById("addDocumentOverlay").style.display = "block";
        document.getElementById("addDocumentPopup").style.display = "block";
        
        document.getElementById("UploadRefernceDocumentBtn").onclick = function()
        {
            _this.UploadRefernceDocument();
        }

        document.getElementById("CancelAddDocument").onclick = function () {
            document.getElementById("addDocumentOverlay").style.display = "none";
            document.getElementById("addDocumentPopup").style.display = "none";
        }
    }

    ReferenceManager.prototype.UploadRefernceDocument = function () {
        
        var referenceDataDir = undefined;
        var typeOfRow = this.SelectedComponentRow[0].offsetParent.offsetParent.offsetParent.id;
        if(typeOfRow == "ComparisonMainReviewTbody") 
        {
            referenceDataDir = "ComparisonCheckReferenceData";
        }
        if(referenceDataDir === undefined)
        {
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "PHP/UploadReferenceDoc.php", true);
        xhr.onload = function (event) {
         
            if(event.target.response !== "fail")
            {
                var referenceList = document.getElementById("documentList");
                var listItem = document.createElement('li');
                listItem.innerText = event.target.response;

                referenceList.appendChild(listItem);
             
                listItem.onclick = function()
                {
                    alert(this.innerText);
                }
            }

            document.getElementById("UploadReferenceDocForm").reset();
        };
        var formData = new FormData(document.getElementById("UploadReferenceDocForm"));
        formData.append('ReferenceDataDir', referenceDataDir);
        xhr.send(formData);
    }

    ReferenceManager.prototype.AddPicture = function () {
        this.ToggleNewReferenceDropdown();
    }

    ReferenceManager.prototype.AddUser = function () {
        this.ToggleNewReferenceDropdown();
    }
}