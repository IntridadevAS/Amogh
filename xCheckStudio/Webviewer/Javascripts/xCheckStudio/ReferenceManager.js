
let ReferenceManager = {

    showReferenceDiv: function () {

        var overlay = document.getElementById("referenceOverlay");
        var popup = document.getElementById("referencePopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "585px";
        popup.style.height = "569px";

        popup.style.top = ((window.innerHeight / 2) - 290) + "px";
        popup.style.left = ((window.innerWidth / 2) - 257) + "px";
    },

    closeReferenceDiv: function () {
        var overlay = document.getElementById("referenceOverlay");
        var popup = document.getElementById("referencePopup");
        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    showReferenceSelectionDiv: function () {
        var overlay = document.getElementById("referenceSelectionOverlay");
        var popup = document.getElementById("referenceSelectionPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "444px";
        popup.style.height = "401px";

        popup.style.top = ((window.innerHeight / 2) - 200) + "px";
        popup.style.left = ((window.innerWidth / 2) - 222) + "px";
    },

    closeReferenceSelectionDiv: function () {
        var overlay = document.getElementById("referenceSelectionOverlay");
        var popup = document.getElementById("referenceSelectionPopup");
        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    showInputReferenceDiv: function () {
        var overlay = document.getElementById("addReferenceOverlay");
        var popup = document.getElementById("addReferencePopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "144px";

        popup.style.top = ((window.innerHeight / 2) - 74) + "px";
        popup.style.left = ((window.innerWidth / 2) - 301) + "px";
    },

    closeInputReferenceDiv: function () {
        var overlay = document.getElementById("addReferenceOverlay");
        var popup = document.getElementById("addReferencePopup");
        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    addWebAddress: function (value) {
        ReferenceManager.processWebAddress(value);
    },

    processWebAddress: function (value) {

        // var webAddressString = document.getElementById("webAddressInput").value;

        // // get component id
        // var checkComponentId = undefined;
        // var referenceTable = undefined;

        // var typeOfRow = this.SelectedComponentRow[0].offsetParent.offsetParent.offsetParent.id;
        // if (typeOfRow == "ComparisonMainReviewTbody") {
        //     referenceTable = "ComparisonCheckReferences";
        //     checkComponentId = this.SelectedComponentRow[0].cells[5].innerText;
        // }
        // else if (typeOfRow == "SourceAComplianceMainReviewTbody") {
        //     referenceTable = "SourceAComplianceCheckReferences";
        //     checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
        // }
        // else if (typeOfRow == "SourceBComplianceMainReviewTbody") {
        //     referenceTable = "SourceBComplianceCheckReferences";
        //     checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
        // }

        // if (checkComponentId === undefined ||
        //     referenceTable === undefined) {
        //     return;
        // }

        if(!(model.currentTabId in SourceManagers))
        {
            var selectionManager = SourceManagers[model.currentTabId].ModelTree.SelectionManager;
            if(!selectionManager)
            {
                return;
            }

            for(var i = 0; i < selectionManager.SelectedCompoents.length; i++)
            {
                var selectedCompoent = selectionManager.SelectedCompoents[i];
                
            }
        }

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        // add reference
        $.ajax({
            url: 'PHP/AddReference.php',
            type: "POST",
            async: true,
            data: {
                'currentSource': [model.currentTabId],
                'typeofReference': "WebAddress",
                'component': componentId,
                'referenceData': value,
                'projectName': projectinfo.projectname,
                'checkName': checkinfo.checkname
            },
            success: function (msg) {
                if (msg != 'fail') {
                    // var referenceList = document.getElementById("webAddressList");
                    // var listItem = document.createElement('li');
                    // listItem.innerText = msg;

                    // referenceList.appendChild(listItem);

                    // listItem.onclick = function () {
                    //     window.open(this.innerText);
                    // }

                    // listItem.onmouseover = function () {
                    //     _this.Highlight(this);
                    // }

                    // listItem.onmouseout = function () {
                    //     _this.UnHighlight(this);
                    // }
                }
            }
        });
        
        // var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        // var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        // // add reference
        // $.ajax({
        //     url: 'PHP/AddReference.php',
        //     type: "POST",
        //     async: true,
        //     data: {
        //         'ReferenceTable': referenceTable,
        //         'TypeofReference': "WebAddress",
        //         'Component': checkComponentId,
        //         'referenceData': webAddressString,
        //         'ProjectName': projectinfo.projectname,
        //         'CheckName': checkinfo.checkname
        //     },
        //     success: function (msg) {
        //         if (msg != 'fail') {
        //             // var referenceList = document.getElementById("webAddressList");
        //             // var listItem = document.createElement('li');
        //             // listItem.innerText = msg;

        //             // referenceList.appendChild(listItem);

        //             // listItem.onclick = function () {
        //             //     window.open(this.innerText);
        //             // }

        //             // listItem.onmouseover = function () {
        //             //     _this.Highlight(this);
        //             // }

        //             // listItem.onmouseout = function () {
        //             //     _this.UnHighlight(this);
        //             // }
        //         }
        //     }
        // });
    },
    addReference: function (value) {
        if (!("referenceType" in localStorage)) {
            return;
        }

        var referenceType = localStorage.getItem("referenceType");
        if (referenceType.toLowerCase() === "webaddress") {
            ReferenceManager.addWebAddress(value);
        }
        else if (referenceType.toLowerCase() === "document") {

        }
        else if (referenceType.toLowerCase() === "image") {

        }
        else if (referenceType.toLowerCase() === "itemlink") {

        }
    }
}

// var ReferenceManager = function (selectedComponentRow) {
//     this.SelectedComponentRow = selectedComponentRow;

//     ReferenceManager.prototype.ShowReferenceDiv = function () {

//         var overlay = document.getElementById("referenceOverlay");
//         var popup = document.getElementById("referencePopup");

//         overlay.style.display = 'block';
//         popup.style.display = 'block';

//         popup.style.width = "585px";
//         popup.style.height = "569px";

//         popup.style.top = ((window.innerHeight / 2) - 290) + "px";
//         popup.style.left = ((window.innerWidth / 2) - 257) + "px";
//         ////////////////////////////////////////////////////////////

//         // var _this = this;

//         // var overlay = document.getElementById("referenceOverlay");
//         // var popup = document.getElementById("referebcePopup");

//         // overlay.style.display = 'block';
//         // popup.style.display = 'block';

//         // var closePopup = document.getElementById("referencePopupclose");
//         // closePopup.onclick = function () {
//         //     _this.CloseReferenceDiv();
//         // }

//         // document.getElementById("addWebAddressBtn").onclick = function () {
//         //     _this.AddWebAddress();
//         // }
//         // document.getElementById("addDocumentBtn").onclick = function () {
//         //     _this.AddDocumet();
//         // }
//         // document.getElementById("addPictureBtn").onclick = function () {
//         //     _this.AddPicture();
//         // }
//         // document.getElementById("addUserBtn").onclick = function () {
//         //     _this.AddUser();
//         // }

//         // // clear all reference data
//         // this. ClearReferences();

//         // // restore references
//         // this.RestoreReferences();
//     }

//     ReferenceManager.prototype.ClearReferences = function () {
//         document.getElementById("webAddressList").innerHTML = "";
//         document.getElementById("documentList").innerHTML = "";
//         document.getElementById("pictureList").innerHTML = "";
//         document.getElementById("userList").innerHTML = "";
//     }

//     ReferenceManager.prototype.RestoreReferences = function () {
//         var _this = this;

//         var checkComponentId = undefined;
//         var referenceTable = undefined;

//         var typeOfRow = this.SelectedComponentRow[0].offsetParent.offsetParent.offsetParent.id;
//         if (typeOfRow == "ComparisonMainReviewTbody") {
//             // get component id
//             var checkComponentId = this.SelectedComponentRow[0].cells[5].innerText;
//             var referenceTable = "ComparisonCheckReferences";
//         }
//         else if (typeOfRow == "SourceAComplianceMainReviewTbody") {
//             referenceTable = "SourceAComplianceCheckReferences";
//             checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
//         }
//         else if (typeOfRow == "SourceBComplianceMainReviewTbody") {
//             referenceTable = "SourceBComplianceCheckReferences";
//             checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
//         }

//         if (checkComponentId === undefined ||
//             referenceTable === undefined) {
//             return;
//         }

//         // get already existing referemce data
//         var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
//         var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
//         $.ajax({
//             url: 'PHP/GetReference.php',
//             type: "POST",
//             async: true,
//             data: {
//                 'ReferenceTable': referenceTable,
//                 'Component': checkComponentId,
//                 'ProjectName': projectinfo.projectname,
//                 'CheckName': checkinfo.checkname
//             },
//             success: function (msg) {
//                 if (msg != 'fail') {
//                     var referenceData = JSON.parse(msg);

//                     for (var key in referenceData) {
//                         var reference = referenceData[key];

//                         if ('webAddress' in reference) {
//                             var referenceList = document.getElementById("webAddressList");
//                             var listItem = document.createElement('li');
//                             listItem.innerText = reference["webAddress"];

//                             referenceList.appendChild(listItem);

//                             listItem.onclick = function () {
//                                 window.open(this.innerText);
//                             }

//                             listItem.onmouseover = function () {
//                                 _this.Highlight(this);
//                             }

//                             listItem.onmouseout = function () {
//                                 _this.UnHighlight(this);
//                             }
//                         }
//                         else if ('document' in reference) {
//                             var referenceList = document.getElementById("documentList");
//                             var listItem = document.createElement('li');
//                             listItem.innerText = reference["document"];

//                             referenceList.appendChild(listItem);

//                             listItem.onclick = function () {
//                                 _this.OnDocumentReferenceSelected(this);
//                             }

//                             listItem.onmouseover = function () {
//                                 _this.Highlight(this);
//                             }

//                             listItem.onmouseout = function () {
//                                 _this.UnHighlight(this);
//                             }
//                         }
//                         else if ('pic' in reference) {
//                             var referenceList = document.getElementById("pictureList");
//                             var listItem = document.createElement('li');
//                             listItem.innerText = reference["pic"];

//                             referenceList.appendChild(listItem);

//                             listItem.onclick = function () {
//                                 _this.OnPictureReferenceSelected(this);
//                             }

//                             listItem.onmouseover = function () {
//                                 _this.Highlight(this);
//                             }

//                             listItem.onmouseout = function () {
//                                 _this.UnHighlight(this);
//                             }
//                         }
//                         else if ('users' in reference) {
//                             var referenceList = document.getElementById("userList");
//                             var listItem = document.createElement('li');
//                             listItem.innerText = reference["users"];

//                             referenceList.appendChild(listItem);

//                             listItem.onclick = function () {
//                                 alert(this.innerText);
//                             }

//                             listItem.onmouseover = function () {
//                                 _this.Highlight(this);
//                             }

//                             listItem.onmouseout = function () {
//                                 _this.UnHighlight(this);
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//     }

//     ReferenceManager.prototype.CloseReferenceDiv = function () {
//         var overlay = document.getElementById("referenceOverlay");
//         var popup = document.getElementById("referebcePopup");

//         overlay.style.display = 'none';
//         popup.style.display = 'none';
//     }

//     ReferenceManager.prototype.ToggleNewReferenceDropdown = function () {
//         document.getElementById("newReferenceDropdown").classList.toggle("show");
//     }

//     ReferenceManager.prototype.ShowAddRefernceWebAddressOverlay = function () {
//         document.getElementById("addAddressOverlay").style.display = "block";
//         document.getElementById("addAddressPopup").style.display = "block";
//     }
//     ReferenceManager.prototype.CloseAddRefernceWebAddressOverlay = function () {
//         document.getElementById("addAddressOverlay").style.display = "none";
//         document.getElementById("addAddressPopup").style.display = "none";
//     }

//     ReferenceManager.prototype.AddDocumet = function () {
//         var _this = this;

//         this.ToggleNewReferenceDropdown();

//         _this.ShowAddRefernceDocumentOverlay();

//         document.getElementById("UploadRefernceDocumentBtn").onclick = function () {
//             _this.UploadRefernceDocument();
//         }

//         document.getElementById("CancelAddDocument").onclick = function () {
//             _this.CloseAddRefernceDocumentOverlay();
//         }
//     }

//     ReferenceManager.prototype.ShowAddRefernceDocumentOverlay = function () {
//         document.getElementById("addDocumentOverlay").style.display = "block";
//         document.getElementById("addDocumentPopup").style.display = "block";
//     }
//     ReferenceManager.prototype.CloseAddRefernceDocumentOverlay = function () {
//         document.getElementById("addDocumentOverlay").style.display = "none";
//         document.getElementById("addDocumentPopup").style.display = "none";
//     }

//     ReferenceManager.prototype.UploadRefernceDocument = function () {
//         var _this = this;

//         var referenceDataDir = undefined;
//         var referenceTable = undefined;
//         var checkComponentId = undefined;
//         var typeOfRow = this.SelectedComponentRow[0].offsetParent.offsetParent.offsetParent.id;
//         if (typeOfRow == "ComparisonMainReviewTbody") {
//             referenceDataDir = "ComparisonCheckReferenceData";
//             referenceTable = "ComparisonCheckReferences";

//             // get component id
//             checkComponentId = this.SelectedComponentRow[0].cells[5].innerText;
//         }
//         else if (typeOfRow == "SourceAComplianceMainReviewTbody") {
//             referenceDataDir = "SourceAComplianceCheckReferenceData";
//             referenceTable = "SourceAComplianceCheckReferences";

//             // get component id
//             checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
//         }
//         else if (typeOfRow == "SourceBComplianceMainReviewTbody") {
//             referenceDataDir = "SourceBComplianceCheckReferenceData";
//             referenceTable = "SourceBComplianceCheckReferences";

//             // get component id
//             checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
//         }

//         if (referenceDataDir === undefined ||
//             referenceTable === undefined ||
//             checkComponentId === undefined) {
//             return;
//         }

//         var xhr = new XMLHttpRequest();
//         xhr.open("POST", "PHP/UploadReferenceDoc.php", true);
//         xhr.onload = function (event) {

//             document.getElementById("UploadReferenceDocForm").reset();
//             if (event.target.response === "fail") {
//                 alert("Adding Document reference failed.");
//                 return;
//             }

//             var referenceList = document.getElementById("documentList");
//             var listItem = document.createElement('li');
//             listItem.innerText = event.target.response;

//             referenceList.appendChild(listItem);

//             listItem.onclick = function () {
//                 _this.OnDocumentReferenceSelected(this);
//             }

//             listItem.onmouseover = function () {
//                 _this.Highlight(this);
//             }

//             listItem.onmouseout = function () {
//                 _this.UnHighlight(this);
//             }

//             _this.CloseAddRefernceDocumentOverlay();
//         };
//         var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
//         var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
//         var formData = new FormData(document.getElementById("UploadReferenceDocForm"));
//         formData.append('ReferenceDataDir', referenceDataDir);
//         formData.append('ReferenceTable', referenceTable);
//         formData.append('Component', checkComponentId);
//         formData.append('TypeofReference', "Document");
//         formData.append('ProjectName', projectinfo.projectname);
//         formData.append('CheckName', checkinfo.checkname);
//         xhr.send(formData);
//     }

//     ReferenceManager.prototype.AddPicture = function () {
//         var _this = this;

//         this.ToggleNewReferenceDropdown();

//         _this.ShowAddReferncePictureOverlay();

//         document.getElementById("UploadReferncePicBtn").onclick = function () {
//             _this.UploadReferncePicture();
//         }

//         document.getElementById("CancelAddPic").onclick = function () {
//             _this.CloseAddReferncePictureOverlay();
//         }
//     }

//     ReferenceManager.prototype.UploadReferncePicture = function () {
//         var _this = this;

//         var referenceDataDir = undefined;
//         var referenceTable = undefined;
//         var checkComponentId = undefined;
//         var typeOfRow = this.SelectedComponentRow[0].offsetParent.offsetParent.offsetParent.id;
//         if (typeOfRow == "ComparisonMainReviewTbody") {
//             referenceDataDir = "ComparisonCheckReferenceData";
//             referenceTable = "ComparisonCheckReferences";

//             // get component id
//             checkComponentId = this.SelectedComponentRow[0].cells[5].innerText;
//         }
//         else if (typeOfRow == "SourceAComplianceMainReviewTbody") {
//             referenceDataDir = "SourceAComplianceCheckReferenceData";
//             referenceTable = "SourceAComplianceCheckReferences";

//             // get component id
//             checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
//         }
//         else if (typeOfRow == "SourceBComplianceMainReviewTbody") {
//             referenceDataDir = "SourceBComplianceCheckReferenceData";
//             referenceTable = "SourceBComplianceCheckReferences";

//             // get component id
//             checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
//         }

//         if (referenceDataDir === undefined ||
//             referenceTable === undefined ||
//             checkComponentId === undefined) {
//             return;
//         }

//         var xhr = new XMLHttpRequest();
//         xhr.open("POST", "PHP/UploadReferenceDoc.php", true);
//         xhr.onload = function (event) {

//             document.getElementById("UploadReferencePicForm").reset();
//             if (event.target.response === "fail") {
//                 alert("Adding Picture reference failed.");
//                 return;
//             }

//             var referenceList = document.getElementById("pictureList");
//             var listItem = document.createElement('li');
//             listItem.innerText = event.target.response;

//             referenceList.appendChild(listItem);

//             listItem.onclick = function () {
//                 _this.OnPictureReferenceSelected(this);
//             }

//             listItem.onmouseover = function () {
//                 _this.Highlight(this);
//             }

//             listItem.onmouseout = function () {
//                 _this.UnHighlight(this);
//             }

//             _this.CloseAddReferncePictureOverlay();
//         };
//         var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
//         var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
//         var formData = new FormData(document.getElementById("UploadReferencePicForm"));
//         formData.append('ReferenceDataDir', referenceDataDir);
//         formData.append('ReferenceTable', referenceTable);
//         formData.append('Component', checkComponentId);
//         formData.append('TypeofReference', "Picture");
//         formData.append('ProjectName', projectinfo.projectname);
//         formData.append('CheckName', checkinfo.checkname);
//         xhr.send(formData);
//     }

//     ReferenceManager.prototype.ShowAddReferncePictureOverlay = function () {
//         document.getElementById("addPictureOverlay").style.display = "block";
//         document.getElementById("addPicturePopup").style.display = "block";
//     }
//     ReferenceManager.prototype.CloseAddReferncePictureOverlay = function () {
//         document.getElementById("addPictureOverlay").style.display = "none";
//         document.getElementById("addPicturePopup").style.display = "none";
//     }

//     ReferenceManager.prototype.AddUser = function () {
//         this.ToggleNewReferenceDropdown();
//     }

//     ReferenceManager.prototype.OnDocumentReferenceSelected = function (item) {
//         var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
//         window.open("Projects/" + projectinfo.projectname + "/" + item.innerText);
//     }

//     ReferenceManager.prototype.OnPictureReferenceSelected = function (item) {
//         var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
//         window.open("Projects/" + projectinfo.projectname + "/" + item.innerText);
//     }

//     ReferenceManager.prototype.Highlight = function (item) {
//         item.style.backgroundColor = "#ffe5e5";
//     }

//     ReferenceManager.prototype.UnHighlight = function (item) {
//         item.style.backgroundColor = "white";
//     }
// }