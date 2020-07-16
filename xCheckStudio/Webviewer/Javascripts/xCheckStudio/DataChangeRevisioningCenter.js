window.onload = function () {
    window.parent.restoreRevisions();
}

function onClose() {
    window.parent.closeDataChangeRevisioningForm();
}

function onCreateDataChangeRevision() {
    window.parent.showCreateRevisionForm();
}

function setFavoriteRevision(revisionId) {
    event.stopPropagation();

    window.parent.setFavoriteRevision(revisionId);
}

function deleteRevision(revisionId) {
    event.stopPropagation();

    window.parent.deleteRevision(revisionId);
}