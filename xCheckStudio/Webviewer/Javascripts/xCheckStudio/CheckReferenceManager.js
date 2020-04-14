
let ReferenceManager = {
    selectedReference: undefined,
    showReferenceDiv: function (title) {

        // get selected component ids
        var componentIds = ReferenceManager.getComponentIds();
        if (componentIds.length === 0) {
            return;
        }

        // set title
        ReferenceManager.setTitle(title);

        ReferenceManager.getReferences(componentIds).then(function (references) {
            if (references) {
                for (source in references) {
                    ReferenceManager.loadWebAddresses(references[source]['webAddress']);
                    ReferenceManager.loadDocuments(references[source]['document']);
                    ReferenceManager.loadImages(references[source]['image']);
                    ReferenceManager.loadComments(references[source]['comment']);
                }
            }

            // show div
            var overlay = document.getElementById("uiBlockingOverlay");
            var popup = document.getElementById("referencePopup");

            overlay.style.display = 'block';
            popup.style.display = 'block';

            popup.style.width = "585px";
            popup.style.height = "569px";

            popup.style.top = ((window.innerHeight / 2) - 290) + "px";
            popup.style.left = ((window.innerWidth / 2) - 257) + "px";
        });

        // var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        // var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        // // add reference
        // $.ajax({
        //     url: 'PHP/GetReferences.php',
        //     type: "POST",
        //     async: true,
        //     data: {
        //         'currentSource': model.currentTabId,
        //         'components': JSON.stringify(componentIds),
        //         'projectName': projectinfo.projectname,
        //         'checkName': checkinfo.checkname
        //     },
        //     success: function (msg) {
        //         if (msg != 'fail') {
        //             var references = JSON.parse(msg);
        //             for (source in references) {
        //                 ReferenceManager.loadWebAddresses(references[source]['webAddress']);
        //                 ReferenceManager.loadDocuments(references[source]['document']);
        //                 ReferenceManager.loadImages(references[source]['image']);
        //                 ReferenceManager.loadComments(references[source]['comment']);
        //             }

        //             // show div
        //             var overlay = document.getElementById("uiBlockingOverlay");
        //             var popup = document.getElementById("referencePopup");

        //             overlay.style.display = 'block';
        //             popup.style.display = 'block';

        //             popup.style.width = "585px";
        //             popup.style.height = "569px";

        //             popup.style.top = ((window.innerHeight / 2) - 290) + "px";
        //             popup.style.left = ((window.innerWidth / 2) - 257) + "px";

        //         }
        //     }
        // });


    },

    getReferences: function (componentIds) {
        return new Promise((resolve) => {
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
                        return resolve(references);
                    }

                    return resolve(undefined);
                }
            });
        });
    },

    setTitle : function(title)
    {
        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        var sourceTitle = referenceIFrame.contentDocument.getElementById("sourceTitle");
        if (!sourceTitle) {
            return;
        }
        sourceTitle.innerText = title;
    },

    loadWebAddresses: function (webAddresses) {
        if (webAddresses.length === 0) {
            return;
        }

        // var referenceIFrame = document.getElementById("referenceIFrame");
        // if (!referenceIFrame) {
        //     return;
        // }

        // var webAddressList = referenceIFrame.contentDocument.getElementById("webAddressList");
        // if (!webAddressList) {
        //     return;
        // }

        for (var i = 0; i < webAddresses.length; i++) {
            var webAddress = webAddresses[i];
            ReferenceManager.showWebAddress(webAddress);
            // var listItem = referenceIFrame.contentDocument.createElement('li');
            // listItem.innerText = webAddress;
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
    },

    loadDocuments: function (documents) {
        if (documents.length === 0) {
            return;
        }

        // var referenceIFrame = document.getElementById("referenceIFrame");
        // if (!referenceIFrame) {
        //     return;
        // }

        // var documentList = referenceIFrame.contentDocument.getElementById("documentList");
        // if (!documentList) {
        //     return;
        // }

        for (var i = 0; i < documents.length; i++) {
            var doc = documents[i];
            ReferenceManager.showDocument(doc);
            // var listItem = referenceIFrame.contentDocument.createElement('li');
            // listItem.innerText = doc;
            // documentList.appendChild(listItem);

            // listItem.onclick = function () {
            //     // select this list item
            //     ReferenceManager.select(this);              


            //     var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            //     var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            //     const BrowserWindow = require('electron').remote.BrowserWindow;
            //     const path = require("path");

            //     win = new BrowserWindow({ title: 'xCheckStudio', frame: true, show: true, icon: 'public/symbols/XcheckLogoIcon.png' });

            //     var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, this.innerText);
            //     win.loadURL(docUrl);
            // }

            // listItem.onmouseover = function () {
            //     ReferenceManager.Highlight(this);
            // }

            // listItem.onmouseout = function () {
            //     ReferenceManager.UnHighlight(this);
            // }
        }
    },

    loadImages: function (images) {
        if (images.length === 0) {
            return;
        }

        // var referenceIFrame = document.getElementById("referenceIFrame");
        // if (!referenceIFrame) {
        //     return;
        // }

        // var imageList = referenceIFrame.contentDocument.getElementById("imageList");
        // if (!imageList) {
        //     return;
        // }


        for (var i = 0; i < images.length; i++) {
            var image = images[i];
            ReferenceManager.showImage(image);
            // var listItem = referenceIFrame.contentDocument.createElement('li');
            // listItem.innerText = image;
            // imageList.appendChild(listItem);

            // listItem.onclick = function () {
            //     // select this list item
            //     ReferenceManager.select(this);

            //     var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            //     var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            //     const BrowserWindow = require('electron').remote.BrowserWindow;
            //     const path = require("path");

            //     win = new BrowserWindow({ title: 'xCheckStudio', frame: true, show: true, icon: 'public/symbols/XcheckLogoIcon.png' });
            //     var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, this.innerText);
            //     win.loadURL(docUrl);
            // }

            // listItem.onmouseover = function () {
            //     ReferenceManager.Highlight(this);
            // }

            // listItem.onmouseout = function () {
            //     ReferenceManager.UnHighlight(this);
            // }
        }
    },

    loadComments: function (comments) {
        if (comments.length === 0) {
            return;
        }

        // var referenceIFrame = document.getElementById("referenceIFrame");
        // if (!referenceIFrame) {
        //     return;
        // }

        // var commentsList = referenceIFrame.contentDocument.getElementById("commentsList");
        // if (!commentsList) {
        //     return;
        // }

        for (var i = 0; i < comments.length; i++) {
            var comment = comments[i];

            ReferenceManager.showComment(JSON.parse(comment));
            // var listItem = referenceIFrame.contentDocument.createElement('li');
            // listItem.innerText = comment;
            // commentsList.appendChild(listItem);

            // listItem.onclick = function () {
            //     ReferenceManager.select(this);
            // }

            // listItem.onmouseover = function () {
            //     ReferenceManager.Highlight(this);
            // }

            // listItem.onmouseout = function () {
            //     ReferenceManager.UnHighlight(this);
            // }
        }
    },

    closeReferenceDiv: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("referencePopup");
        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    showReferenceSelectionDiv: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("referenceSelectionPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "444px";
        popup.style.height = "401px";

        popup.style.top = ((window.innerHeight / 2) - 200) + "px";
        popup.style.left = ((window.innerWidth / 2) - 222) + "px";
    },

    closeReferenceSelectionDiv: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("referenceSelectionPopup");
        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    showInputReferenceDiv: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("addReferencePopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        popup.style.width = "581px";
        popup.style.height = "144px";

        popup.style.top = ((window.innerHeight / 2) - 74) + "px";
        popup.style.left = ((window.innerWidth / 2) - 301) + "px";
    },

    closeInputReferenceDiv: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
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
                    ReferenceManager.showWebAddress(msg);

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
        //item.style.backgroundColor = "#808080";
        item.style.border = "1px solid aliceblue";
    },

    UnHighlight: function (item) {
        if (item === ReferenceManager.selectedReference) {
            return;
        }
        //item.style.backgroundColor = "rgba(71,71,71,1)";
        item.style.border = "";
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

            ReferenceManager.showDocument(event.target.response);
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

            ReferenceManager.showImage(event.target.response);
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

        //create reference data
        var referenceData = {};
        referenceData["value"] = value;

        // get user info 
        var userinfo = JSON.parse(localStorage.getItem('userinfo'));
        referenceData["user"] = userinfo.alias;

        // var date = new Date();
        referenceData["date"] = ReferenceManager.getCurrentDate();

        // add reference
        $.ajax({
            url: 'PHP/AddReference.php',
            type: "POST",
            async: true,
            data: {
                'currentSource': model.currentTabId,
                'typeofReference': "Comment",
                'components': JSON.stringify(componentIds),
                'referenceData': JSON.stringify(referenceData),
                'projectName': projectinfo.projectname,
                'checkName': checkinfo.checkname
            },
            success: function (msg) {
                if (msg != 'fail') {

                    var commentData = JSON.parse(msg);
                    ReferenceManager.showComment(commentData);

                    // var referenceIFrame = document.getElementById("referenceIFrame");
                    // if (!referenceIFrame) {
                    //     return;
                    // }

                    // var commentsList = referenceIFrame.contentDocument.getElementById("commentsList");
                    // if (!commentsList) {
                    //     return;
                    // }

                    // var commentData = JSON.parse(msg);

                    // var card = document.createElement("Div");
                    // card.className = "commentCard";

                    // var dataContainer = document.createElement("Div");
                    // dataContainer.className = "commentContainer";

                    // var commentValue = document.createElement("h3");                    
                    // var bold = document.createElement("b");
                    // bold.textContent = commentData.value;                    
                    // commentValue.appendChild(bold);                    
                    // dataContainer.appendChild(commentValue);

                    // var userValue = document.createElement("p");
                    // userValue.textContent = commentData.userinfo.alias;    
                    // dataContainer.appendChild(userValue);

                    // var timeValue = document.createElement("p");
                    // timeValue.textContent = commentData.date;    
                    // dataContainer.appendChild(timeValue);

                    // card.appendChild(dataContainer);

                    // commentsList.appendChild(card);                  

                    // card.onclick = function () {                        
                    //     ReferenceManager.select(this);
                    // }

                    // card.onmouseover = function () {
                    //     ReferenceManager.Highlight(this);
                    // }

                    // card.onmouseout = function () {
                    //     ReferenceManager.UnHighlight(this);
                    // }
                }
            }
        });
    },

    select: function (item) {
        if (ReferenceManager.selectedReference) {
            ReferenceManager.selectedReference.style.border = "";
        }

        ReferenceManager.selectedReference = item;
        ReferenceManager.selectedReference.style.border = "1px solid aliceblue";
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
        var referenceData = ReferenceManager.selectedReference.innerText;
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

            var comment = ReferenceManager.selectedReference.getElementsByTagName("h3")[0].textContent;
            var user = ReferenceManager.selectedReference.getElementsByTagName("p")[0].textContent;
            var date = ReferenceManager.selectedReference.getElementsByTagName("p")[1].textContent;

            referenceData = JSON.stringify({
                "value": comment,
                "user": user,
                "date": date
            });
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
                'referenceData': referenceData,
                'projectName': projectinfo.projectname,
                'checkName': checkinfo.checkname
            },
            success: function (msg) {
                if (msg != 'fail') {

                    ReferenceManager.selectedReference.parentNode.removeChild(ReferenceManager.selectedReference);
                    ReferenceManager.selectedReference = undefined;
                }
            }
        });
    },

    showWebAddress: function (webAddress) {
        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        var webAddressList = referenceIFrame.contentDocument.getElementById("webAddressList");
        if (!webAddressList) {
            return;
        }

        var listItem = referenceIFrame.contentDocument.createElement('li');
        listItem.innerText = webAddress;
        webAddressList.appendChild(listItem);

        listItem.onclick = function () {
            // select this list item
            ReferenceManager.select(this);
        }

        listItem.ondblclick = function () {           
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
    },

    showDocument: function (doc) {
        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        var documentList = referenceIFrame.contentDocument.getElementById("documentList");
        if (!documentList) {
            return;
        }

        var listItem = referenceIFrame.contentDocument.createElement('li');
        listItem.innerText = doc;
        documentList.appendChild(listItem);

        listItem.onclick = function () {
            // select this list item
            ReferenceManager.select(this);
        }

        listItem.ondblclick = function () {           

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
    },

    showImage: function (image) {
        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        var imageList = referenceIFrame.contentDocument.getElementById("imageList");
        if (!imageList) {
            return;
        }

        var listItem = referenceIFrame.contentDocument.createElement('li');
        listItem.innerText = image;
        imageList.appendChild(listItem);

        listItem.onclick = function () {
            // select this list item
            ReferenceManager.select(this);
        }

        listItem.ondblclick = function () {          
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
    },

    showComment: function (commentData) {
        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        var commentsList = referenceIFrame.contentDocument.getElementById("commentsList");
        if (!commentsList) {
            return;
        }

        var card = document.createElement("Div");
        card.className = "commentCard";

        var dataContainer = document.createElement("Div");
        dataContainer.className = "commentContainer";

        var commentValue = document.createElement("h3");
        var bold = document.createElement("b");
        bold.textContent = commentData.value;
        commentValue.appendChild(bold);
        dataContainer.appendChild(commentValue);

        var userValue = document.createElement("p");
        userValue.textContent = commentData.user;
        dataContainer.appendChild(userValue);

        var timeValue = document.createElement("p");
        timeValue.textContent = commentData.date;
        dataContainer.appendChild(timeValue);

        card.appendChild(dataContainer);

        commentsList.appendChild(card);

        card.onclick = function () {
            // select this list item
            ReferenceManager.select(this);
        }

        card.ondblclick = function () {           
        }

        card.onmouseover = function () {
            ReferenceManager.Highlight(this);
        }

        card.onmouseout = function () {
            ReferenceManager.UnHighlight(this);
        }
    },

    getCurrentDate : function()
    {

        var days = ["Sunday", 
                    "Monday",
                    "Tuesday", 
                    "Wednesday", 
                    "Thursday", 
                    "Friday", 
                    "Saturday"];
        var months = ["January", 
                      "February", 
                      "March", 
                      "April", 
                      "May", 
                      "June", 
                      "July", 
                      "August", 
                      "September", 
                      "October", 
                      "November", 
                      "December"];
        
        var date = new Date();

        var currentDate = days[date.getDay()];
        currentDate += " " + months[date.getMonth()];
        currentDate += " " + date.getDate();
        currentDate += " " + date.getFullYear();
        currentDate += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        return currentDate;
    }
}