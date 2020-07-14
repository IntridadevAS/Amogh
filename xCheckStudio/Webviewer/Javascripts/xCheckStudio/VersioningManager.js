let VersioningManager = {

    showRevisioningForm: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("versionHistoryPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        document.getElementById('versionHistoryIFrame').src = "src/prompts/Version_Center.html";

        popup.style.width = "1196px";
        popup.style.height = "430px";

        popup.style.top = ((window.innerHeight / 2) - 214) + "px";
        popup.style.left = ((window.innerWidth / 2) - 597) + "px";
    },

    closeVersioningForm: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("versionHistoryPopup");
        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    showCreateVersionForm: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("createVersionPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        document.getElementById('createVersionIFrame').src = "src/prompts/Create_New_Version.html";

        popup.style.width = "581px";
        popup.style.height = "544px";

        popup.style.top = ((window.innerHeight / 2) - 274) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    },

    closeCreateVersionForm: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("createVersionPopup");

        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    createVersion: function (versionData) {
        var userInfo = JSON.parse(localStorage.getItem('userinfo'));
        versionData["createdBy"] = userInfo.userid;
        versionData["userAlias"] = userInfo.alias;
        versionData["createdOn"] = xCheckStudio.Util.getCurrentDateTime();
       
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        $.ajax({
            data: {
                'InvokeFunction': 'CreateVersion',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname,
                'VersionData': JSON.stringify(versionData)
            },
            type: "POST",
            url: "PHP/VersionManager.php"
        }).done(function (msg) {
            var object = JSON.parse(msg);
            if (object.MsgCode !== 1) {
                showAlertForm(object.Msg);
                return;
            }
            VersioningManager.createVersionCard(object.Data, true);
        });
    },

    restoreVersions: function () {
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        $.ajax({
            data: {
                'InvokeFunction': 'ReadVersions',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            type: "POST",
            url: "PHP/VersionManager.php"
        }).done(function (msg) {
            var object = JSON.parse(msg);
            if (object.MsgCode !== 1) {
                showAlertForm(object.Msg);
                return;
            }

            var versions = object.Data;
            for (var i = 0; i < versions.length; i++) {
                var versionData = versions[i];
                versionData["userAlias"] = versionData["createdByAlias"];
                VersioningManager.createVersionCard(versionData, false);
            }


            // create current version card
            var versionData = {};
            var userInfo = JSON.parse(localStorage.getItem('userinfo'));
            versionData["id"] = "currentVersion";
            versionData["name"] = "Current";
            versionData["description"] = "";
            versionData["userAlias"] = userInfo.alias;
            versionData["createdOn"] = "";

            VersioningManager.createVersionCard(versionData, false);
        });
    },

    createVersionCard: function (versionData, createNewVersion) {
        var versionHistoryIFrame = document.getElementById("versionHistoryIFrame");
        if (!versionHistoryIFrame) {
            return;
        }

        let newDiv = versionHistoryIFrame.contentDocument.createElement('DIV');
        newDiv.classList.add('versionCard');

        if (versionData["id"] !== "currentVersion") {
            if (versionData.IsFav == '1') {
                newDiv.classList.add('favorite');
            }
        }

        // newDiv.classList.add('checkSpaceFlag');
        newDiv.setAttribute("id", versionData.id);
        // newDiv.setAttribute("onmouseenter", "checkView.hoverCheck(this)");
        // newDiv.setAttribute("onmouseleave", "checkView.leaveCheck(this)");
        // newDiv.setAttribute("onclick", "showEnterCheckForm(this)");
        // if (check.checkisfavourite === "1") {
        //   newDiv.classList.add('favorite');
        // }
        let htmlInner = `<div class="versionCardInfo">`
        htmlInner += `<p style="padding:4px">Created On: ${versionData.createdOn}</p>`;
        htmlInner += `<p style="padding:4px">Created By: ${versionData.userAlias}</p>`;
        htmlInner += `<p style="padding:4px">${versionData.description}</p>`;
        htmlInner += `<ul>`;
        /*for (li of check.datasets) {
          htmlInner += `<li>${li}</li>`
        }*/
        htmlInner += "</ul></div>"
        htmlInner += `<div class='versionCardTitle'><h2>${versionData.name}<h2>`;
        // htmlInner += `<p>${check.checkstatus}</p></div>`
        htmlInner += `</div>`

        var userinfo = JSON.parse(localStorage.getItem('userinfo'));
        if (versionData["id"] !== "currentVersion" &&
            (userinfo.permission.toLowerCase() === "checker" ||
                userinfo.permission.toLowerCase() === "admin")) {

            htmlInner += `<div class="versionButtons">`;
            htmlInner += `<div class="star" onclick="setFavoriteVersion(${versionData.id})"></div>`;

            htmlInner += `<div class="btnSymbol hiddenBtn" onclick="deleteVersion(${versionData.id});">\
                    <img src="../../public/symbols/TrashDelete.svg">\
                  </div>`;

            htmlInner += `</div>`
        }

        newDiv.innerHTML = htmlInner;
        var versionCardContainer = versionHistoryIFrame.contentDocument.getElementById("versionCardContainer");
        if (createNewVersion) {
            versionCardContainer.insertBefore(newDiv, versionCardContainer.childNodes[versionCardContainer.childNodes.length - 1]);
        }
        else {
            versionCardContainer.appendChild(newDiv);
        }

        // update scroll position
        versionCardContainer.scrollTop = versionCardContainer.scrollHeight;

        if (document.getElementById('createVersionIFrame').contentWindow.onClose) {
            document.getElementById('createVersionIFrame').contentWindow.onClose();
        }
    },

    setFavoriteVersion: function (versionId) {
        // var obj = model.projectChecks.find(obj => obj.checkid == checkID);
        // if (obj === undefined) {
        //     console.log("No check found to mark as favourite");
        //     return;
        // }
        var versionCard = document.getElementById("versionHistoryIFrame").contentDocument.getElementById(versionId);
        var newFav = 0;
        if (!versionCard.classList.contains("favorite")) {
            newFav = 1;
            versionCard.classList.add("favorite");
        }
        else {
            versionCard.classList.remove("favorite");
        }

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            data: {
                'InvokeFunction': 'SetFavourite',
                'versionId': versionId,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname,
                'favorite': newFav
            },
            type: "POST",
            url: "PHP/VersionManager.php"
        }).done(function (msg) {           
        });
    },

    deleteVersion: function (versionId) {
        

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            data: {
                'InvokeFunction': 'DeleteVersion',
                'versionId': versionId,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname                
            },
            type: "POST",
            url: "PHP/VersionManager.php"
        }).done(function (msg) {
            var object = JSON.parse(msg);
            if (object.MsgCode !== 1) {
                showAlertForm(object.Msg);
                return;
            }

            var versionCard = document.getElementById("versionHistoryIFrame").contentDocument.getElementById(versionId);
            versionCard.parentNode.removeChild(versionCard);
        });
    }
}