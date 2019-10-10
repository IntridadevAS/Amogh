function onClose() {
    window.parent.closeReference();
}

function onCancel() {
    onClose();
}

function onShowReferenceSelection() {
    window.parent.showReferenceSelection();
}