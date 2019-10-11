function onClose() {
    window.parent.closeReference();
}

function onCancel() {
    onClose();
}

function onShowReferenceSelection() {
    window.parent.showReferenceSelection();
}

function onDeleteReference()
{
    window.parent.deleteReference();
}

window.onload = function () {
    $("#commentInput").dxTextArea({
        onChange: function (e) {
            localStorage.setItem("referenceType", "comment");
            window.parent.addReference(e.component.option('value'));
            e.component.reset();
        }
    });
}