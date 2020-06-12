
let ReferenceManager = {
    selectedReference: undefined,
    componentIds: {},
    showReferenceDiv: function (ids, title) {
        ReferenceManager.componentIds = ids;

        if (!ReferenceManager.componentIds) {
            return;
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

        // set title
        ReferenceManager.setTitle(title);
        // var referenceIFrame = document.getElementById("referenceIFrame");
        // if (!referenceIFrame) {
        //     return;
        // }

        // var sourceTitle = referenceIFrame.contentDocument.getElementById("sourceTitle");
        // if (!sourceTitle) {
        //     return;
        // }
        // sourceTitle.innerText = title;

        // restore references
        for (var src in ReferenceManager.componentIds) {

            // get selected component ids
            var componentIds = ReferenceManager.componentIds[src];
            if (componentIds.length === 0) {
                continue;
            }

            // var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            // var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            // // add reference
            // $.ajax({
            //     url: 'PHP/GetReferences.php',
            //     type: "POST",
            //     async: true,
            //     data: {
            //         'currentSource': src,
            //         'components': JSON.stringify(componentIds),
            //         'projectName': projectinfo.projectname,
            //         'checkName': checkinfo.checkname
            //     },
            //     success: function (msg) {
            //         if (msg != 'fail') {
            var references = ReferenceManager.getReferences(componentIds, src);
            // ReferenceManager.getReferences(componentIds, src).then(function (references) {
            if (references) {
                for (source in references) {
                    ReferenceManager.loadWebAddresses(source, references[source]['webAddress']);
                    ReferenceManager.loadDocuments(source, references[source]['document']);
                    ReferenceManager.loadImages(source, references[source]['image']);
                    ReferenceManager.loadComments(source, references[source]['comment']);
                }
            }

            // })
        }
        //         }
        //     });
        // }
    },

    getReferences: function (componentIds, src) {
        var references;
        // return new Promise((resolve) => {
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
            // add reference
            $.ajax({
                url: 'PHP/GetReferences.php',
                type: "POST",
                async: false,
                data: {
                    'currentSource': src,
                    'components': JSON.stringify(componentIds),
                    'projectName': projectinfo.projectname,
                    'checkName': checkinfo.checkname
                },
                success: function (msg) {
                    if (msg != 'fail') {
                         references = JSON.parse(msg);
                        // return resolve(references);                        
                    }

                    // return resolve(undefined);
                }
            });
        // });
        return references;
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

    loadWebAddresses: function (currentSource, webAddresses) {
        if (webAddresses.length === 0) {
            return;
        }

        for (var i = 0; i < webAddresses.length; i++) {
            var webAddress = webAddresses[i];
            ReferenceManager.showWebAddress(currentSource, webAddress);
        }
    },

    loadDocuments: function (currentSource, documents) {
        if (documents.length === 0) {
            return;
        }

        for (var i = 0; i < documents.length; i++) {
            var doc = documents[i];
            ReferenceManager.showDocument(currentSource, doc);
        }
    },

    loadImages: function (currentSource, images) {
        if (images.length === 0) {
            return;
        }

        for (var i = 0; i < images.length; i++) {
            var image = images[i];
            ReferenceManager.showImage(currentSource, image);
        }
    },

    loadComments: function (currentSource, comments) {
        if (comments.length === 0) {
            return;
        }

        for (var i = 0; i < comments.length; i++) {
            var comment = comments[i];
            ReferenceManager.showComment(currentSource, JSON.parse(comment));
        }
    },

    closeReferenceDiv: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("referencePopup");
        overlay.style.display = 'none';
        popup.style.display = 'none';

        // reset component Ids
        ReferenceManager.componentIds = {};
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

        if (!ReferenceManager.componentIds) {
            return;
        }

        for (var src in ReferenceManager.componentIds) {
            ReferenceManager.processWebAddress(src, ReferenceManager.componentIds[src], value);
        }
    },

    processWebAddress: function (currentSource, ids, value) {
        if (ids.length === 0) {
            return;
        }

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        // add reference
        $.ajax({
            url: 'PHP/AddReference.php',
            type: "POST",
            async: false,
            data: {
                'currentSource': currentSource,
                'typeofReference': "WebAddress",
                'components': JSON.stringify(ids),
                'referenceData': value,
                'projectName': projectinfo.projectname,
                'checkName': checkinfo.checkname
            },
            success: function (msg) {
                if (msg != 'fail') {

                    ReferenceManager.showWebAddress(currentSource, msg);
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
        if (!ReferenceManager.componentIds) {
            return;
        }

        for (var src in ReferenceManager.componentIds) {
            if (ReferenceManager.componentIds[src].length === 0) {
                continue;
            }

            ReferenceManager.uploadRefernceDocument(src, ReferenceManager.componentIds[src]);
        }
    },

    uploadRefernceDocument: function (currentSource, ids) {

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "PHP/UploadReferenceDoc.php", false);
        xhr.onload = function (event) {

            if (event.target.response === "fail") {
                alert("Adding Document reference failed.");
                return;
            }
            else if (event.target.response === 'invalid file type') {
                alert("invalid file type");
                return;
            }

            ReferenceManager.showDocument(currentSource, event.target.response);
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
        formData.append('currentSource', currentSource);
        formData.append('components', JSON.stringify(ids));
        formData.append('typeofReference', "Document");
        formData.append('projectName', projectinfo.projectname);
        formData.append('checkName', checkinfo.checkname);
        xhr.send(formData);
    },

    addImage: function () {
        if (!ReferenceManager.componentIds) {
            return;
        }

        for (var src in ReferenceManager.componentIds) {
            if (ReferenceManager.componentIds[src].length === 0) {
                continue;
            }

            ReferenceManager.uploadRefernceImage(src, ReferenceManager.componentIds[src]);
        }
    },

    uploadRefernceImage: function (currentSource, ids) {

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "PHP/UploadReferenceDoc.php", false);
        xhr.onload = function (event) {

            if (event.target.response === "fail") {
                alert("Adding Image reference failed.");
                return;
            }
            else if (event.target.response === 'invalid file type') {
                alert("invalid file type");
                return;
            }

            ReferenceManager.showImage(currentSource, event.target.response);
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
        formData.append('currentSource', currentSource);
        formData.append('components', JSON.stringify(ids));
        formData.append('typeofReference', "Image");
        formData.append('projectName', projectinfo.projectname);
        formData.append('checkName', checkinfo.checkname);
        xhr.send(formData);
    },

    addComment: function (value) {

        if (!ReferenceManager.componentIds) {
            return;
        }

        for (var src in ReferenceManager.componentIds) {
            if (ReferenceManager.componentIds[src].length === 0) {
                continue;
            }
            
            ReferenceManager.processComment(src, ReferenceManager.componentIds[src], value);
        }
        if ("referenceType" in localStorage) {
            localStorage.removeItem('referenceType');
        }
    },

    processComment: function (currentSource, ids, value) {

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

         //create reference data
         var referenceData = {};
         referenceData["value"] = value;
 
         // get user info 
         var userinfo = JSON.parse(localStorage.getItem('userinfo'));
         referenceData["user"] = userinfo.alias;
 
        referenceData["date"] = ReferenceManager.getCurrentDate();

        // add reference
        $.ajax({
            url: 'PHP/AddReference.php',
            type: "POST",
            async: false,
            data: {
                'currentSource': currentSource,
                'typeofReference': "Comment",
                'components': JSON.stringify(ids),
                'referenceData': JSON.stringify(referenceData),
                'projectName': projectinfo.projectname,
                'checkName': checkinfo.checkname
            },
            success: function (msg) {
                if (msg != 'fail') {
                    var commentData = JSON.parse(msg);
                    ReferenceManager.showComment(currentSource, commentData);
                }
            }
        });
    },
    
    processCommentForComponentIds: function (value, componentIds, currentSource) {
        return new Promise((resolve) => {

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
                async: false,
                data: {
                    'currentSource': currentSource,
                    'typeofReference': "Comment",
                    'components': JSON.stringify(componentIds),
                    'referenceData': JSON.stringify(referenceData),
                    'projectName': projectinfo.projectname,
                    'checkName': checkinfo.checkname
                },
                success: function (msg) {
                    if (msg != 'fail') {
                        var commentData = JSON.parse(msg);

                        return resolve(commentData);
                    }

                    return resolve(undefined);
                }
            });
        });
    },

    select: function (item) {
        if (ReferenceManager.selectedReference) {
            // ReferenceManager.selectedReference.style.backgroundColor = "rgba(71,71,71,1)";
            ReferenceManager.selectedReference.style.border = "";
        }

        ReferenceManager.selectedReference = item;
        // ReferenceManager.selectedReference.style.backgroundColor = "#808080";
        ReferenceManager.selectedReference.style.border = "1px solid aliceblue";
    },

    deleteReference: function () {
        if (!ReferenceManager.selectedReference) {
            return;
        }

        if (!ReferenceManager.componentIds) {
            return;
        }

        var referenceText = ReferenceManager.selectedReference.innerText;
        var components;
        var currentSource;
        if (referenceText.includes(checkResults.sourceInfo["sourceAFileName"])) {
            referenceText = referenceText.replace(checkResults.sourceInfo["sourceAFileName"] + " : ", "");
            components = ReferenceManager.componentIds["a"];
            currentSource = "a";
        }
        else if (referenceText.includes(checkResults.sourceInfo["sourceBFileName"])) {
            referenceText = referenceText.replace(checkResults.sourceInfo["sourceBFileName"] + " : ", "");
            components = ReferenceManager.componentIds["b"];
            currentSource = "b";
        }
        else if (referenceText.includes(checkResults.sourceInfo["sourceCFileName"])) {
            referenceText = referenceText.replace(checkResults.sourceInfo["sourceCFileName"] + " : ", "");
            components = ReferenceManager.componentIds["c"];
            currentSource = "c";
        }
        else if (referenceText.includes(checkResults.sourceInfo["sourceDFileName"])) {
            referenceText = referenceText.replace(checkResults.sourceInfo["sourceDFileName"] + " : ", "");
            components = ReferenceManager.componentIds["d"];
            currentSource = "d";
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
        // else if (ReferenceManager.selectedReference.offsetParent.id === "commentsList") {
        //     typeofReference = "Comment";

        //     var comment = ReferenceManager.selectedReference.getElementsByTagName("h3")[0].textContent;
        //     var user = ReferenceManager.selectedReference.getElementsByTagName("p")[0].textContent;
        //     var date = ReferenceManager.selectedReference.getElementsByTagName("p")[1].textContent;

        //     referenceText = JSON.stringify({
        //         "value": comment,
        //         "user": user,
        //         "date": date
        //     });
        // }
        else {
            return;
        }

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        // add reference
        $.ajax({
            url: 'PHP/RemoveReference.php',
            type: "POST",
            async: false,
            data: {
                'currentSource': currentSource,
                'typeofReference': typeofReference,
                'components': JSON.stringify(components),
                'referenceData': referenceText,
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

    showWebAddress: function (currentSource, webAddress) {
        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        var webAddressList = referenceIFrame.contentDocument.getElementById("webAddressList");
        if (!webAddressList) {
            return;
        }

        var listItem = referenceIFrame.contentDocument.createElement('li');
        if (currentSource === "a") {
            listItem.innerText = checkResults.sourceInfo["sourceAFileName"] + " : " + webAddress;
        }
        else if (currentSource === "b") {
            listItem.innerText = checkResults.sourceInfo["sourceBFileName"] + " : " + webAddress;
        }
        else if (currentSource === "c") {
            listItem.innerText = checkResults.sourceInfo["sourceCFileName"] + " : " + webAddress;
        }
        else if (currentSource === "d") {
            listItem.innerText = checkResults.sourceInfo["sourceDFileName"] + " : " + webAddress;
        }

        webAddressList.appendChild(listItem);
        
        listItem.onclick = function () {
             // select this list item
             ReferenceManager.select(this);
        }
        
        listItem.ondblclick = function () {
           
            var value = this.innerText.replace(checkResults.sourceInfo["sourceAFileName"] + " : ", "");
            value = value.replace(checkResults.sourceInfo["sourceBFileName"] + " : ", "");
            if (checkResults.sourceInfo["sourceCFileName"]) {
                value = value.replace(checkResults.sourceInfo["sourceCFileName"] + " : ", "");
            }
            if (checkResults.sourceInfo["sourceDFileName"]) {
                value = value.replace(checkResults.sourceInfo["sourceDFileName"] + " : ", "");
            }

            const BrowserWindow = require('electron').remote.BrowserWindow;
            win = new BrowserWindow({ title: 'xCheckStudio', frame: true, icon: 'public/symbols/XcheckLogoIcon.png' });
            win.loadURL(value);
            win.show();
        }

        listItem.onmouseover = function () {
            ReferenceManager.Highlight(this);
        }

        listItem.onmouseout = function () {
            ReferenceManager.UnHighlight(this);
        }

    },

    showDocument: function (currentSource, doc) {

        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        var documentList = referenceIFrame.contentDocument.getElementById("documentList");
        if (!documentList) {
            return;
        }

        var listItem = referenceIFrame.contentDocument.createElement('li');
        if (currentSource === "a") {
            listItem.innerText = checkResults.sourceInfo["sourceAFileName"] + " : " + doc;
        }
        else if (currentSource === "b") {
            listItem.innerText = checkResults.sourceInfo["sourceBFileName"] + " : " + doc;
        }
        else if (currentSource === "c") {
            listItem.innerText = checkResults.sourceInfo["sourceCFileName"] + " : " + doc;
        }
        else if (currentSource === "d") {
            listItem.innerText = checkResults.sourceInfo["sourceDFileName"] + " : " + doc;
        }

        documentList.appendChild(listItem);

        listItem.onclick = function () {
            // select this list item
            ReferenceManager.select(this);
        }

        listItem.ondblclick = function () {

            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));           
            
            var value = this.innerText.replace(checkResults.sourceInfo["sourceAFileName"] + " : ", "");
            value = value.replace(checkResults.sourceInfo["sourceBFileName"] + " : ", "");
            if (checkResults.sourceInfo["sourceCFileName"]) {
                value = value.replace(checkResults.sourceInfo["sourceCFileName"] + " : ", "");
            }
            if (checkResults.sourceInfo["sourceDFileName"]) {
                value = value.replace(checkResults.sourceInfo["sourceDFileName"] + " : ", "");
            }

            const path = require("path");         
            var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, value);

            var fileExtension = xCheckStudio.Util.getFileExtension(value);
            if (fileExtension.toLowerCase() === "doc" ||
                fileExtension.toLowerCase() === "docx" ||
                fileExtension.toLowerCase() === "xls" ||
                fileExtension.toLowerCase() === "xlsx" ||
                fileExtension.toLowerCase() === "ppt" ||
                fileExtension.toLowerCase() === "pptx" ||
                fileExtension.toLowerCase() === "csv" ||
                fileExtension.toLowerCase() === "txt") {
               
                const { shell } = require('electron');
                const { ipcRenderer } = require("electron");

                var executed = false;
                ipcRenderer.on("download complete", (event, file) => {
                    if (executed === true) {
                        // this is to avoid issue when "download complete" gets called multiple times    
                        return;
                    }

                    shell.openExternal(file);
                    executed = true;
                });
                ipcRenderer.send("download", {
                    url: docUrl
                }); 

            }   
            else
            {
                const BrowserWindow = require('electron').remote.BrowserWindow;
                win = new BrowserWindow({ title: 'xCheckStudio', frame: true, show: true, icon: 'public/symbols/XcheckLogoIcon.png' });
                const PDFWindow = require('electron-pdf-window');
                PDFWindow.addSupport(win);
                win.loadURL(docUrl);
            }                     
        }

        listItem.onmouseover = function () {
            ReferenceManager.Highlight(this);
        }

        listItem.onmouseout = function () {
            ReferenceManager.UnHighlight(this);
        }

    },

    showImage: function (currentSource, image) {
        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        var imageList = referenceIFrame.contentDocument.getElementById("imageList");
        if (!imageList) {
            return;
        }

        var listItem = referenceIFrame.contentDocument.createElement('li');
        if (currentSource === "a") {
            listItem.innerText = checkResults.sourceInfo["sourceAFileName"] + " : " + image;
        }
        else if (currentSource === "b") {
            listItem.innerText = checkResults.sourceInfo["sourceBFileName"] + " : " + image;
        }
        else if (currentSource === "c") {
            listItem.innerText = checkResults.sourceInfo["sourceCFileName"] + " : " + image;
        }
        else if (currentSource === "d") {
            listItem.innerText = checkResults.sourceInfo["sourceDFileName"] + " : " + image;
        }

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

            var value = this.innerText.replace(checkResults.sourceInfo["sourceAFileName"] + " : ", "");
            value = value.replace(checkResults.sourceInfo["sourceBFileName"] + " : ", "");
            if (checkResults.sourceInfo["sourceCFileName"]) {
                value = value.replace(checkResults.sourceInfo["sourceCFileName"] + " : ", "");
            }
            if (checkResults.sourceInfo["sourceDFileName"]) {
                value = value.replace(checkResults.sourceInfo["sourceDFileName"] + " : ", "");
            }

            var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, value);
            win.loadURL(docUrl);
        }

        listItem.onmouseover = function () {
            ReferenceManager.Highlight(this);
        }

        listItem.onmouseout = function () {
            ReferenceManager.UnHighlight(this);
        }
    },

    showComment: function (currentSource, commentData) {
        var referenceIFrame = document.getElementById("referenceIFrame");
        if (!referenceIFrame) {
            return;
        }

        // var commentsList = referenceIFrame.contentDocument.getElementById("commentsList");
        // if (!commentsList) {
        //     return;
        // }

        // var card = document.createElement("Div");
        // card.className = "commentCard";

        // var dataContainer = document.createElement("Div");
        // dataContainer.className = "commentContainer";

        // var commentValue = document.createElement("h3");
        // var bold = document.createElement("b");        
        // if (currentSource === "a") {
        //     bold.textContent = checkResults.sourceInfo["sourceAFileName"] + " : " + commentData.value;
        // }
        // else if (currentSource === "b") {
        //     bold.textContent = checkResults.sourceInfo["sourceBFileName"] + " : " + commentData.value;
        // }
        // else if (currentSource === "c") {
        //     bold.textContent = checkResults.sourceInfo["sourceCFileName"] + " : " + commentData.value;
        // }
        // else if (currentSource === "d") {
        //     bold.textContent = checkResults.sourceInfo["sourceDFileName"] + " : " + commentData.value;
        // }

        // commentValue.appendChild(bold);
        // dataContainer.appendChild(commentValue);

        // var userValue = document.createElement("p");
        // userValue.textContent = commentData.user;
        // dataContainer.appendChild(userValue);

        // var timeValue = document.createElement("p");
        // timeValue.textContent = commentData.date;
        // dataContainer.appendChild(timeValue);

        // card.appendChild(dataContainer);

        // commentsList.appendChild(card);

        // card.onclick = function () {
        //     // select this list item
        //     ReferenceManager.select(this);
        // }

        // card.ondblclick = function () {            
        // }



        // card.onmouseover = function () {
        //     ReferenceManager.Highlight(this);
        // }

        // card.onmouseout = function () {
        //     ReferenceManager.UnHighlight(this);
        // }
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