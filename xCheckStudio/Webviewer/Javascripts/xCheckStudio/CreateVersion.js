function onClose() {
    window.parent.closeCreateVersionForm();
}

function onCreateVersion()
{
    var versionName = document.getElementById("versionName").value;
    if(!versionName || versionName == "")
    {
        window.parent.showAlertForm("Revision name can't be empty.");
        return;
    }

    var versionDescription = document.getElementById("versionDescription").value;
    var versionComments = document.getElementById("versionComments").value;

    var versionCard = document.getElementById("createVersionButtons");
    var newFav = 0;
    if (versionCard.classList.contains("favorite")) {
        newFav = 1;        
    }   

    var versionData = {
        "name" : versionName,
        "description" : versionDescription,
        "comments" : versionComments,
        "IsFav" : newFav
    };
    
    window.parent.createVersion(versionData);
}

function setVersionFavorite() {
    var versionCard = document.getElementById("createVersionButtons");
    if (!versionCard.classList.contains("favorite")) {
        versionCard.classList.add("favorite");
    }
    else {
        versionCard.classList.remove("favorite");
    }
}