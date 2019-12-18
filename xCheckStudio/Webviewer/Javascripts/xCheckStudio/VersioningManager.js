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
        versionData["IsFav"] = 0;

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
            VersioningManager.createVersionCard(object.Data);
        });
    },

    createVersionCard: function (versionData) {
        var versionHistoryIFrame = document.getElementById("versionHistoryIFrame");
        if (!versionHistoryIFrame) {
            return;
        }

        let newDiv = versionHistoryIFrame.contentDocument.createElement('DIV');
        newDiv.classList.add('versionCard');
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
        htmlInner += `<div class="versionButtons">`;
        htmlInner += `<div class="star" onclick="controller.setFavoriteCheck()"></div>`;
        // if (controller.permissions()) {
        //   htmlInner += `
        //       <div class="btnSymbol hiddenBtn" onclick="controller.editCheck();">\
        //         <img class="btnSymbol" src="../../public/symbols/infoMenu.svg">\
        //       </div>\
        //       <div class="btnSymbol hiddenBtn" onclick="deleteItems.init('check'});">\
        //         <img src="../../public/symbols/TrashDelete.svg">\
        //       </div>`;
        // }
        htmlInner += `</div>`
        newDiv.innerHTML = htmlInner;
        versionHistoryIFrame.contentDocument.getElementById("versionCardContainer").appendChild(newDiv);

        if (document.getElementById('createVersionIFrame').contentWindow.onClose) {
            document.getElementById('createVersionIFrame').contentWindow.onClose();
        }
    }
}