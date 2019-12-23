window.onload = function () {
    window.parent.restoreVersions();
}

function onClose() {
    window.parent.closeVersioningForm();
}

function onCreateVersion() {
    window.parent.showCreateVersionForm();
}

function setFavoriteVersion(versionId) {
    event.stopPropagation();

    window.parent.setFavoriteVersion(versionId);
}

function deleteVersion(versionId)
{
    event.stopPropagation();

    window.parent.deleteVersion(versionId);
}