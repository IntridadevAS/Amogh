
function hideNavCube() {
    if (!currentViewer) {
        return;
    }

    hideNavigationCube(currentViewer);
}

function hideNavigationCube(viewer) {
    if (!viewer) {
        return;
    }

    // create nav cube
    var navCube = viewer.view.getNavCube();
    navCube.disable();
}


var showNavCube = function () {
    if (!currentViewer) {
        return;
    }

    showNavigationCube(currentViewer);
}


var showNavigationCube = function (viewer) {
    if (!viewer) {
        return;
    }

    // create nav cube
    var navCube = viewer.view.getNavCube();
    navCube.enable();
    // resize nav cube
    var overlayManager = viewer.getOverlayManager();
    overlayManager.setViewport(Communicator.BuiltinOverlayIndex.NavCube,
        Communicator.OverlayAnchor.UpperRightCorner,
        0,
        Communicator.OverlayUnit.ProportionOfCanvas,
        0,
        Communicator.OverlayUnit.ProportionOfCanvas,
        100,
        Communicator.OverlayUnit.Pixels,
        100,
        Communicator.OverlayUnit.Pixels);
}