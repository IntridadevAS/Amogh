function onClose() {
    window.parent.closeCreateRevisionForm();
}

function onCreateRevision()
{
    var revisionName = document.getElementById("revisionName").value;
    if(!revisionName || revisionName == "")
    {
        window.parent.showAlertForm("Revision name can't be empty.");
        return;
    }

    var revisionDescription = document.getElementById("revisionDescription").value;
    var revisionComments = document.getElementById("revisionComments").value;

    var revisionCard = document.getElementById("createVersionButtons");
    var newFav = 0;
    if (revisionCard.classList.contains("favorite")) {
        newFav = 1;        
    }   

    var revisionData = {
        "name" : revisionName,
        "description" : revisionDescription,
        "comments" : revisionComments,
        "IsFav" : newFav
    };
    
    window.parent.createRevision(revisionData);
}

function setRevisionFavorite() {
    var revisionCard = document.getElementById("createVersionButtons");
    if (!revisionCard.classList.contains("favorite")) {
        revisionCard.classList.add("favorite");
    }
    else {
        revisionCard.classList.remove("favorite");
    }
}