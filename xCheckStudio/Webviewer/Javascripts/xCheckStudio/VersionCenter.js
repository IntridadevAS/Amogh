window.onload = function()
{
    // create current version card
    var versionData = {};
    var userInfo = JSON.parse(localStorage.getItem('userinfo'));
    versionData["id"] = "currentVersion";
    versionData["name"] = "Current";
    versionData["description"] = "";
    versionData["userAlias"] = userInfo.alias;
    versionData["createdOn"] = "";    

    window.parent.createVersionCard(versionData);
}

function onClose() {
    window.parent.closeVersioningForm();
}

function onCreateVersion() {
    window.parent.showCreateVersionForm();
}