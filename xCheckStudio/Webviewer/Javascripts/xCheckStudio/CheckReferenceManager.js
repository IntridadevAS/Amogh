
let ReferenceManager = {
    selectedReference: undefined,
    showReferenceDiv: function () {

        // get selected component ids
        var componentIds = ReferenceManager.getComponentIds();
        if (componentIds.length === 0) {
            return;
        }

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        // add reference
        $.ajax({
            url: 'PHP/GetReferences.php',
            type: "POST",
            async: true,
            data: {
                'currentSource': model.currentTabId,
                'components': JSON.stringify(componentIds),
                'projectName': projectinfo.projectname,
                'checkName': checkinfo.checkname
            },
            success: function (msg) {
                if (msg != 'fail') {
                    var references = JSON.parse(msg);
                    for (source in references) {
                        ReferenceManager.loadWebAddresses(references[source]['webAddress']);
                        ReferenceManager.loadDocuments(references[source]['document']);
                        ReferenceManager.loadImages(references[source]['image']);
                        ReferenceManager.loadComments(references[source]['comment']);
                    }                  

                    // show div
                    var overlay = document.getElementById("referenceOverlay");
                    var popup = document.getElementById("referencePopup");

                    overlay.style.display = 'block';
                    popup.style.display = 'block';

                    popup.style.width = "585px";
                    popup.style.height = "569px";

                    popup.style.top = ((window.innerHeight / 2) - 290) + "px";
                    popup.style.left = ((window.innerWidth / 2) - 257) + "px";

                }
            }
        });


    },

    loadWebAddresses: function (webAddresses) {
        if (webAddresses.length === 0) {
            return;
        }

        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        var webAddressList = referenceIFrame.contentDocument.getElementById("webAddressList");
        if (!webAddressList) {
            return;
        }

        for (var i = 0; i < webAddresses.length; i++) {
            var webAddress = webAddresses[i];
            var listItem = referenceIFrame.contentDocument.createElement('li');
            listItem.innerText = webAddress;
            webAddressList.appendChild(listItem);

            listItem.onclick = function () {

                // select this list item
                ReferenceManager.select(this);

                const BrowserWindow = require('electron').remote.BrowserWindow;
                win = new BrowserWindow({ title: 'xCheckStudio', frame: true, icon: 'public/symbols/XcheckLogoIcon.png' });
                win.loadURL(this.innerText);
                win.show();
            }

            listItem.onmouseover = function () {
                ReferenceManager.Highlight(this);
            }

            listItem.onmouseout = function () {
                ReferenceManager.UnHighlight(this);
            }
        }
    },

    loadDocuments: function (documents) {
        if (documents.length === 0) {
            return;
        }

        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        var documentList = referenceIFrame.contentDocument.getElementById("documentList");
        if (!documentList) {
            return;
        }

        for (var i = 0; i < documents.length; i++) {
            var doc = documents[i];
            var listItem = referenceIFrame.contentDocument.createElement('li');
            listItem.innerText = doc;
            documentList.appendChild(listItem);

            listItem.onclick = function () {
                // select this list item
                ReferenceManager.select(this);

                var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

                const BrowserWindow = require('electron').remote.BrowserWindow;
                const path = require("path");

                win = new BrowserWindow({ title: 'xCheckStudio', frame: true, show: true, icon: 'public/symbols/XcheckLogoIcon.png' });

                var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, this.innerText);
                win.loadURL(docUrl);
            }

            listItem.onmouseover = function () {
                ReferenceManager.Highlight(this);
            }

            listItem.onmouseout = function () {
                ReferenceManager.UnHighlight(this);
            }
        }
    },

    loadImages: function (images) {
        if (images.length === 0) {
            return;
        }

        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        var imageList = referenceIFrame.contentDocument.getElementById("imageList");
        if (!imageList) {
            return;
        }


        for (var i = 0; i < images.length; i++) {
            var image = images[i];

            var listItem = referenceIFrame.contentDocument.createElement('li');
            listItem.innerText = image;
            imageList.appendChild(listItem);

            listItem.onclick = function () {
                // select this list item
                ReferenceManager.select(this);

                var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

                const BrowserWindow = require('electron').remote.BrowserWindow;
                const path = require("path");

                win = new BrowserWindow({ title: 'xCheckStudio', frame: true, show: true, icon: 'public/symbols/XcheckLogoIcon.png' });
                var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, this.innerText);
                win.loadURL(docUrl);
            }

            listItem.onmouseover = function () {
                ReferenceManager.Highlight(this);
            }

            listItem.onmouseout = function () {
                ReferenceManager.UnHighlight(this);
            }
        }
    },

    loadComments: function (comments) {
        if (comments.length === 0) {
            return;
        }

        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        var commentsList = referenceIFrame.contentDocument.getElementById("commentsList");
        if (!commentsList) {
            return;
        }

        for (var i = 0; i < comments.length; i++) {
            var comment = comments[i];

            var listItem = referenceIFrame.contentDocument.createElement('li');
            listItem.innerText = comment;
            commentsList.appendChild(listItem);

            listItem.onclick = function () {
                ReferenceManager.select(this);
            }

            listItem.onmouseover = function () {
                ReferenceManager.Highlight(this);
            }

            listItem.onmouseout = function () {
                ReferenceManager.UnHighlight(this);
            }
        }
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

        // get selected component ids
        var componentIds = ReferenceManager.getComponentIds();
        if (componentIds.length === 0) {
            return;
        }

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        // add reference
        $.ajax({
            url: 'PHP/AddReference.php',
            type: "POST",
            async: true,
            data: {
                'currentSource': model.currentTabId,
                'typeofReference': "WebAddress",
                'components': JSON.stringify(componentIds),
                'referenceData': value,
                'projectName': projectinfo.projectname,
                'checkName': checkinfo.checkname
            },
            success: function (msg) {
                if (msg != 'fail') {

                    var referenceIFrame = document.getElementById("referenceIFrame");
                    if (!referenceIFrame) {
                        return;
                    }

                    var webAddressList = referenceIFrame.contentDocument.getElementById("webAddressList");
                    if (!webAddressList) {
                        return;
                    }

                    var listItem = referenceIFrame.contentDocument.createElement('li');
                    listItem.innerText = msg;
                    webAddressList.appendChild(listItem);

                    listItem.onclick = function () {

                        // select this list item
                        ReferenceManager.select(this);

                        const BrowserWindow = require('electron').remote.BrowserWindow;
                        win = new BrowserWindow({ title: 'xCheckStudio', frame: true, icon: 'public/symbols/XcheckLogoIcon.png' });
                        win.loadURL(this.innerText);
                        win.show();
                    }

                    listItem.onmouseover = function () {
                        ReferenceManager.Highlight(this);
                    }

                    listItem.onmouseout = function () {
                        ReferenceManager.UnHighlight(this);
                    }
                }
            }
        });
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
            ReferenceManager.addDocumet();
        }
        else if (referenceType.toLowerCase() === "image") {
            ReferenceManager.addImage();
        }
        else if (referenceType.toLowerCase() === "comment") {
            ReferenceManager.addComment(value);
        }
        else if (referenceType.toLowerCase() === "itemlink") {

        }
    },

    Highlight: function (item) {
        item.style.backgroundColor = "#808080";
    },

    UnHighlight: function (item) {
        if (item === ReferenceManager.selectedReference) {
            return;
        }
        item.style.backgroundColor = "rgba(71,71,71,1)";
    },

    addDocumet: function () {
        ReferenceManager.uploadRefernceDocument();
    },

    uploadRefernceDocument: function () {

        // get selected component ids
        var componentIds = ReferenceManager.getComponentIds();
        if (componentIds.length === 0) {
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "PHP/UploadReferenceDoc.php", true);
        xhr.onload = function (event) {

            if (event.target.response === "fail") {
                alert("Adding Document reference failed.");
                return;
            }
            else if (event.target.response === 'invalid file type') {
                alert("invalid file type");
                return;
            }

            var referenceIFrame = document.getElementById("referenceIFrame");
            if (!referenceIFrame) {
                return;
            }

            var documentList = referenceIFrame.contentDocument.getElementById("documentList");
            if (!documentList) {
                return;
            }

            var listItem = referenceIFrame.contentDocument.createElement('li');
            listItem.innerText = event.target.response;
            documentList.appendChild(listItem);

            listItem.onclick = function () {
                // select this list item
                ReferenceManager.select(this);

                var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

                const BrowserWindow = require('electron').remote.BrowserWindow;
                const path = require("path");

                win = new BrowserWindow({ title: 'xCheckStudio', frame: true, show: true, icon: 'public/symbols/XcheckLogoIcon.png' });

                var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, this.innerText);
                win.loadURL(docUrl);
            }

            listItem.onmouseover = function () {
                ReferenceManager.Highlight(this);
            }

            listItem.onmouseout = function () {
                ReferenceManager.UnHighlight(this);
            }
        };
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        var addReferenceIFrame = document.getElementById("addReferenceIFrame");
        if (!addReferenceIFrame) {
            return;
        }
        var uploadFileForm = addReferenceIFrame.contentDocument.getElementById("uploadFileForm");
        if (!uploadFileForm) {
            return;
        }
        var formData = new FormData(uploadFileForm);
        formData.append('currentSource', model.currentTabId);
        formData.append('components', JSON.stringify(componentIds));
        formData.append('typeofReference', "Document");
        formData.append('projectName', projectinfo.projectname);
        formData.append('checkName', checkinfo.checkname);
        xhr.send(formData);
    },

    addImage: function () {
        ReferenceManager.uploadRefernceImage();
    },

    uploadRefernceImage: function () {

        // get selected component ids
        var componentIds = ReferenceManager.getComponentIds();
        if (componentIds.length === 0) {
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "PHP/UploadReferenceDoc.php", true);
        xhr.onload = function (event) {

            // document.getElementById("UploadReferenceDocForm").reset();
            if (event.target.response === "fail") {
                alert("Adding Image reference failed.");
                return;
            }
            else if (event.target.response === 'invalid file type') {
                alert("invalid file type");
                return;
            }


            var referenceIFrame = document.getElementById("referenceIFrame");
            if (!referenceIFrame) {
                return;
            }

            var imageList = referenceIFrame.contentDocument.getElementById("imageList");
            if (!imageList) {
                return;
            }

            var listItem = referenceIFrame.contentDocument.createElement('li');
            listItem.innerText = event.target.response;
            imageList.appendChild(listItem);

            listItem.onclick = function () {
                // select this list item
                ReferenceManager.select(this);

                var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

                const BrowserWindow = require('electron').remote.BrowserWindow;
                const path = require("path");

                win = new BrowserWindow({ title: 'xCheckStudio', frame: true, show: true, icon: 'public/symbols/XcheckLogoIcon.png' });
                var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, this.innerText);
                win.loadURL(docUrl);
            }

            listItem.onmouseover = function () {
                ReferenceManager.Highlight(this);
            }

            listItem.onmouseout = function () {
                ReferenceManager.UnHighlight(this);
            }
        };
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        var addReferenceIFrame = document.getElementById("addReferenceIFrame");
        if (!addReferenceIFrame) {
            return;
        }
        var uploadFileForm = addReferenceIFrame.contentDocument.getElementById("uploadFileForm");
        if (!uploadFileForm) {
            return;
        }
        var formData = new FormData(uploadFileForm);
        formData.append('currentSource', model.currentTabId);
        formData.append('components', JSON.stringify(componentIds));
        formData.append('typeofReference', "Image");
        formData.append('projectName', projectinfo.projectname);
        formData.append('checkName', checkinfo.checkname);
        xhr.send(formData);



        /////////////////////////////
        // var _this = this;

        // var referenceDataDir = undefined;
        // var referenceTable = undefined;
        // var checkComponentId = undefined;
        // var typeOfRow = this.SelectedComponentRow[0].offsetParent.offsetParent.offsetParent.id;
        // if (typeOfRow == "ComparisonMainReviewTbody") {
        //     referenceDataDir = "ComparisonCheckReferenceData";
        //     referenceTable = "ComparisonCheckReferences";

        //     // get component id
        //     checkComponentId = this.SelectedComponentRow[0].cells[5].innerText;
        // }
        // else if (typeOfRow == "SourceAComplianceMainReviewTbody") {
        //     referenceDataDir = "SourceAComplianceCheckReferenceData";
        //     referenceTable = "SourceAComplianceCheckReferences";

        //     // get component id
        //     checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
        // }
        // else if (typeOfRow == "SourceBComplianceMainReviewTbody") {
        //     referenceDataDir = "SourceBComplianceCheckReferenceData";
        //     referenceTable = "SourceBComplianceCheckReferences";

        //     // get component id
        //     checkComponentId = this.SelectedComponentRow[0].cells[3].innerText;
        // }

        // if (referenceDataDir === undefined ||
        //     referenceTable === undefined ||
        //     checkComponentId === undefined) {
        //     return;
        // }

        // var xhr = new XMLHttpRequest();
        // xhr.open("POST", "PHP/UploadReferenceDoc.php", true);
        // xhr.onload = function (event) {

        //     document.getElementById("UploadReferencePicForm").reset();
        //     if (event.target.response === "fail") {
        //         alert("Adding Picture reference failed.");
        //         return;
        //     }

        //     var referenceList = document.getElementById("pictureList");
        //     var listItem = document.createElement('li');
        //     listItem.innerText = event.target.response;

        //     referenceList.appendChild(listItem);

        //     listItem.onclick = function () {
        //         _this.OnPictureReferenceSelected(this);
        //     }

        //     listItem.onmouseover = function () {
        //         _this.Highlight(this);
        //     }

        //     listItem.onmouseout = function () {
        //         _this.UnHighlight(this);
        //     }

        //     _this.CloseAddReferncePictureOverlay();
        // };
        // var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        // var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        // var formData = new FormData(document.getElementById("UploadReferencePicForm"));
        // formData.append('ReferenceDataDir', referenceDataDir);
        // formData.append('ReferenceTable', referenceTable);
        // formData.append('Component', checkComponentId);
        // formData.append('TypeofReference', "Picture");
        // formData.append('ProjectName', projectinfo.projectname);
        // formData.append('CheckName', checkinfo.checkname);
        // xhr.send(formData);
    },

    getComponentIds: function () {
        var componentIds = [];
        if (model.currentTabId in SourceManagers) {
            var sourceManager = SourceManagers[model.currentTabId];
            var selectionManager = sourceManager.ModelTree.SelectionManager;
            if (!selectionManager) {
                return;
            }
            componentIds = selectionManager.GetSelectedComponentIds();
        }

        return componentIds;
    },

    addComment: function (value) {

        ReferenceManager.processComment(value);

        if ("referenceType" in localStorage) {
            localStorage.removeItem('referenceType');
        }
    },

    processComment: function (value) {
        // get selected component ids
        var componentIds = ReferenceManager.getComponentIds();
        if (componentIds.length === 0) {
            return;
        }

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        // add reference
        $.ajax({
            url: 'PHP/AddReference.php',
            type: "POST",
            async: true,
            data: {
                'currentSource': model.currentTabId,
                'typeofReference': "Comment",
                'components': JSON.stringify(componentIds),
                'referenceData': value,
                'projectName': projectinfo.projectname,
                'checkName': checkinfo.checkname
            },
            success: function (msg) {
                if (msg != 'fail') {

                    var referenceIFrame = document.getElementById("referenceIFrame");
                    if (!referenceIFrame) {
                        return;
                    }

                    var commentsList = referenceIFrame.contentDocument.getElementById("commentsList");
                    if (!commentsList) {
                        return;
                    }

                    var listItem = referenceIFrame.contentDocument.createElement('li');
                    listItem.innerText = msg;
                    commentsList.appendChild(listItem);

                    listItem.onclick = function () {
                        ReferenceManager.select(this);
                    }

                    listItem.onmouseover = function () {
                        ReferenceManager.Highlight(this);
                    }

                    listItem.onmouseout = function () {
                        ReferenceManager.UnHighlight(this);
                    }
                }
            }
        });
    },

    select: function (item) {
        if (ReferenceManager.selectedReference) {
            ReferenceManager.selectedReference.style.backgroundColor = "rgba(71,71,71,1)";
        }

        ReferenceManager.selectedReference = item;
        ReferenceManager.selectedReference.style.backgroundColor = "#808080";
    },

    deleteReference: function () {
        if (!ReferenceManager.selectedReference) {
            return;
        }

        // get selected component ids       
        var componentIds = ReferenceManager.getComponentIds();
        if (componentIds.length === 0) {
            return;
        }

        var typeofReference;
        if (ReferenceManager.selectedReference.offsetParent.id === "webAddressList") {
            typeofReference = "WebAddress";
        }
        else if (ReferenceManager.selectedReference.offsetParent.id === "documentList") {
            typeofReference = "Document";
        }
        else if (ReferenceManager.selectedReference.offsetParent.id === "imageList") {
            typeofReference = "Image";
        }
        else if (ReferenceManager.selectedReference.offsetParent.id === "commentsList") {
            typeofReference = "Comment";
        }
        else {
            return;
        }

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        // add reference
        $.ajax({
            url: 'PHP/RemoveReference.php',
            type: "POST",
            async: true,
            data: {
                'currentSource': model.currentTabId,
                'typeofReference': typeofReference,
                'components': JSON.stringify(componentIds),
                'referenceData': ReferenceManager.selectedReference.innerText,
                'projectName': projectinfo.projectname,
                'checkName': checkinfo.checkname
            },
            success: function (msg) {
                if (msg != 'fail') {

                    ReferenceManager.selectedReference.parentNode.removeChild(ReferenceManager.selectedReference);
                    ReferenceManager.selectedReference = undefined;
                    // var referenceIFrame = document.getElementById("referenceIFrame");
                    // if (!referenceIFrame) {
                    //     return;
                    // }

                    // var webAddressList = referenceIFrame.contentDocument.getElementById("webAddressList");
                    // if (!webAddressList) {
                    //     return;
                    // }

                    // var listItem = referenceIFrame.contentDocument.createElement('li');
                    // listItem.innerText = msg;
                    // webAddressList.appendChild(listItem);

                    // listItem.onclick = function () {

                    //     // select this list item
                    //     ReferenceManager.select(this);

                    //     const BrowserWindow = require('electron').remote.BrowserWindow;
                    //     win = new BrowserWindow({ title: 'xCheckStudio', frame: true, icon: 'public/symbols/XcheckLogoIcon.png' });
                    //     win.loadURL(this.innerText);
                    //     win.show();
                    // }

                    // listItem.onmouseover = function () {
                    //     ReferenceManager.Highlight(this);
                    // }

                    // listItem.onmouseout = function () {
                    //     ReferenceManager.UnHighlight(this);
                    // }
                }
            }
        });
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