let DataChangeRevisioning = {
   
    IframeID : "DataChangeRevisioningIFrame",

    showForm: function () {
        if (!model.currentTabId) {
            return;
        }

        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("DataChangeRevisioningPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        document.getElementById(DataChangeRevisioning.IframeID).src = "src/prompts/DataChangeRevisioning.html";

        popup.style.width = "1196px";
        popup.style.height = "430px";

        popup.style.top = ((window.innerHeight / 2) - 214) + "px";
        popup.style.left = ((window.innerWidth / 2) - 597) + "px";
    },

    closeForm: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("DataChangeRevisioningPopup");
        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    showCreateRevisionForm: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("createRevisioningPopup");

        overlay.style.display = 'block';
        popup.style.display = 'block';

        document.getElementById('createRevisionIFrame').src = "src/prompts/Create_New_Revision.html";

        popup.style.width = "581px";
        popup.style.height = "544px";

        popup.style.top = ((window.innerHeight / 2) - 274) + "px";
        popup.style.left = ((window.innerWidth / 2) - 290) + "px";
    },

    closeCreateRevisioninForm: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById("createRevisioningPopup");

        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    createRevision: function (revisionData) {
        var userInfo = JSON.parse(localStorage.getItem('userinfo'));
        revisionData["createdBy"] = userInfo.userid;
        revisionData["userAlias"] = userInfo.alias;
        revisionData["createdOn"] = xCheckStudio.Util.getCurrentDateTime();
        revisionData["srcId"] = model.currentTabId;
        revisionData["dataSourceName"] = SourceManagers[model.currentTabId].SourceName;
        revisionData["dataSourceType"] = SourceManagers[model.currentTabId].SourceType.toLowerCase();
        revisionData["allComponents"] = JSON.stringify(SourceManagers[model.currentTabId].AllComponents);

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        $.ajax({
            data: {
                'InvokeFunction': 'CreateRevision',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname,
                'RevisionData': JSON.stringify(revisionData)
            },
            type: "POST",
            url: "PHP/DataChangeRevisioning.php"
        }).done(function (msg) {
            var object = JSON.parse(msg);
            if (object.MsgCode !== 1) {
                alert(object.Msg);
                return;
            }
            DataChangeRevisioning.createRevisionCard(object.Data, true);
        });
    },

    restoreRevisions: function () {

        let sourceType = SourceManagers[model.currentTabId].SourceType.toLowerCase();
        this.readRevisions(sourceType).then(function (revisions) {
            if (!revisions) {  
                alert("Error occurred while restoring revisions.");
                return;
            }

            // var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            // var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            // $.ajax({
            //     data: {
            //         'InvokeFunction': 'ReadRevisions',
            //         'ProjectName': projectinfo.projectname,
            //         'CheckName': checkinfo.checkname,
            //         'dataSourceType' : SourceManagers[model.currentTabId].SourceType.toLowerCase()               
            //     },
            //     type: "POST",
            //     url: "PHP/DataChangeRevisioning.php"
            // }).done(function (msg) {
            //     var object = JSON.parse(msg);
            //     if (object.MsgCode !== 1) {
            //         alert(object.Msg);
            //         return;
            //     }

            //     var revisions = object.Data;
            for (var i = 0; i < revisions.length; i++) {
                var revisionData = revisions[i];
                revisionData["userAlias"] = revisionData["createdByAlias"];
                DataChangeRevisioning.createRevisionCard(revisionData, false);
            }


            // create current version card
            var revisionData = {};
            var userInfo = JSON.parse(localStorage.getItem('userinfo'));
            revisionData["id"] = "currentVersion";
            revisionData["name"] = "Current";
            revisionData["description"] = "";
            revisionData["userAlias"] = userInfo.alias;
            revisionData["createdOn"] = "";

            DataChangeRevisioning.createRevisionCard(revisionData, false);
            // });
        })
    },

    readRevisions: function (dataSourceType) {

        return new Promise((resolve) => {

            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            $.ajax({
                data: {
                    'InvokeFunction': 'ReadRevisions',
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname,
                    'dataSourceType': dataSourceType
                },
                type: "POST",
                url: "PHP/DataChangeRevisioning.php"
            }).done(function (msg) {
                var object = JSON.parse(msg);
                if (object.MsgCode !== 1) {
                    // alert(object.Msg);
                    return resolve(null);
                }

                return resolve(object.Data);
            });
        });
    },

    readRevisionComponents: function (revisionInfo) {
        return new Promise((resolve) => {

            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            $.ajax({
                data: {
                    'InvokeFunction': 'ReadRevisionComponents',
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname,
                    'revisionData': JSON.stringify(revisionInfo)
                },
                type: "POST",
                url: "PHP/DataChangeRevisioning.php",
                async: false,
            }).done(function (msg) {
                var object = JSON.parse(msg);
                if (object.MsgCode !== 1) {
                    return resolve(null);
                }

                return resolve(JSON.parse(object.Data));
            });
        });
    },    

    readAllRevisionProperties: function (revisionInfo) {
        return new Promise((resolve) => {

            this.readRevisionComponents(revisionInfo).then(function (allComponents) {
                if (!allComponents) {
                    return resolve(null);
                }

                var allProperties = [];
                for (var nodeId in allComponents) {
                    var component = allComponents[nodeId];
                    if (component.properties &&
                        component.properties.length > 0) {
                        for (var i = 0; i < component.properties.length; i++) {
                            var property = component.properties[i];
                            if (allProperties.indexOf(property.Name) === -1) {
                                allProperties.push(property.Name);
                            }
                        }
                    }
                }

                return resolve(allProperties);
            });
        });
    },

    createRevisionCard: function (revisionData, createNewRevision) {
        var revisionIFrame = document.getElementById(DataChangeRevisioning.IframeID);
        if (!revisionIFrame) {
            return;
        }

        let newDiv = revisionIFrame.contentDocument.createElement('DIV');
        newDiv.classList.add('versionCard');

        if (revisionData["id"] !== "currentVersion") {
            if (revisionData.IsFav == '1') {
                newDiv.classList.add('favorite');
            }
        }
        
        newDiv.setAttribute("id", revisionData.id);
     
        let htmlInner = `<div class="versionCardInfo">`
        htmlInner += `<p style="padding:4px">Created On: ${revisionData.createdOn}</p>`;
        htmlInner += `<p style="padding:4px">Created By: ${revisionData.userAlias}</p>`;
        htmlInner += `<p style="padding:4px">${revisionData.description}</p>`;
        htmlInner += `<ul>`;
      
        htmlInner += "</ul></div>"
        htmlInner += `<div class='versionCardTitle'><h2>${revisionData.name}<h2>`;        
        htmlInner += `</div>`

        var userinfo = JSON.parse(localStorage.getItem('userinfo'));
        if (revisionData["id"] !== "currentVersion" &&
            (userinfo.permission.toLowerCase() === "checker" ||
                userinfo.permission.toLowerCase() === "admin")) {

            htmlInner += `<div class="versionButtons">`;
            htmlInner += `<div class="star" onclick="setFavoriteRevision(${revisionData.id})"></div>`;

            htmlInner += `<div class="btnSymbol hiddenBtn" onclick="deleteRevision(${revisionData.id});">\
                    <img src="../../public/symbols/TrashDelete.svg">\
                  </div>`;

            htmlInner += `</div>`
        }

        newDiv.innerHTML = htmlInner;
        var revisionCardContainer = revisionIFrame.contentDocument.getElementById("versionCardContainer");
        if (createNewRevision) {
            revisionCardContainer.insertBefore(newDiv, revisionCardContainer.childNodes[revisionCardContainer.childNodes.length - 1]);
        }
        else {
            revisionCardContainer.appendChild(newDiv);
        }

        // update scroll position
        revisionCardContainer.scrollTop = revisionCardContainer.scrollHeight;

        if (document.getElementById('createRevisionIFrame').contentWindow.onClose) {
            document.getElementById('createRevisionIFrame').contentWindow.onClose();
        }
    },

    setFavoriteRevision: function (revisionId) {
       
        var revisionCard = document.getElementById(DataChangeRevisioning.IframeID).contentDocument.getElementById(revisionId);
        var newFav = 0;
        if (!revisionCard.classList.contains("favorite")) {
            newFav = 1;
            revisionCard.classList.add("favorite");
        }
        else {
            revisionCard.classList.remove("favorite");
        }

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            data: {
                'InvokeFunction': 'SetFavourite',
                'revisionId': revisionId,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname,
                'favorite': newFav
            },
            type: "POST",
            url: "PHP/DataChangeRevisioning.php"
        }).done(function (msg) {           
        });
    },
   
    deleteRevision: function (revisionId) {        

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        $.ajax({
            data: {
                'InvokeFunction': 'DeleteRevision',
                'revisionId': revisionId,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname                
            },
            type: "POST",
            url: "PHP/DataChangeRevisioning.php"
        }).done(function (msg) {
            var object = JSON.parse(msg);
            if (object.MsgCode !== 1) {
                alert(object.Msg);
                return;
            }

            var revisionCard = document.getElementById(DataChangeRevisioning.IframeID).contentDocument.getElementById(revisionId);
            revisionCard.parentNode.removeChild(revisionCard);
        });
    }
}