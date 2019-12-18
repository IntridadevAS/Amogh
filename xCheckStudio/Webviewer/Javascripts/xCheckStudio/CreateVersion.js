function onClose() {
    window.parent.closeCreateVersionForm();
}

function onCreateVersion()
{
    var versionName = document.getElementById("versionName").value;
    if(!versionName || versionName == "")
    {
        window.parent.showAlertForm("Version name can't be empty.");
        return;
    }

    var versionDescription = document.getElementById("versionDescription").value;
    var versionComments = document.getElementById("versionComments").value;
    var versionData = {
        "name" : versionName,
        "description" : versionDescription,
        "comments" : versionComments
    };

    window.parent.createVersion(versionData);
}