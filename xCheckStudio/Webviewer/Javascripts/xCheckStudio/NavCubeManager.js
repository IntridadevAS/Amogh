function hideNavigationCube(viewer) {
    if (!viewer) {
        return;
    }

    // create nav cube
    var navCube = viewer.view.getNavCube();
    navCube.disable();
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

var toggleNavCube = function (viewer) {
    if (!viewer) {
        return;
    }

    // create nav cube
    var navCube = viewer.view.getNavCube();

    if (navCube.getEnabled()) {
        navCube.disable();
    }
    else {
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
}