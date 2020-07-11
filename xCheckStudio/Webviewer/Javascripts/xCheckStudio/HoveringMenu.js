function HoveringMenu(id, viewerId, menuId) {
    this.Id = id;
    this.ViewerId = viewerId; 
    this.MenuId = menuId;
    this.Webviewer = this.GetWebviewer();
}


HoveringMenu.prototype.GetAdditionalControlIds = function () {
    if (this.Id.toLowerCase() === "comparison") {
        if (this.ViewerId == 'a') {
            return model.checks["comparison"].sourceAViewer.GetControlIds();
        }
        else if (this.ViewerId == 'b') {
            return model.checks["comparison"].sourceBViewer.GetControlIds();
        }
        else if (this.ViewerId == 'c') {
            return model.checks["comparison"].sourceCViewer.GetControlIds();
        }
        else if (this.ViewerId == 'd') {
            return model.checks["comparison"].sourceDViewer.GetControlIds();
        }
    }
    else if (this.Id.toLowerCase() === "compliance") {
        return model.checks["compliance"].viewer.GetControlIds();
    }

    return null;
}

HoveringMenu.prototype.RegisterOnClick = function () {
    if (this.Id.toLowerCase() === "comparison") {
        if (this.ViewerId !== "a" &&
            ("DisplayMenu" in model.checks[this.Id].menus["a"])) {
            document.getElementById("compare1").onclick = onViewerClicked;
        }
        if (this.ViewerId !== "b" &&
            ("DisplayMenu" in model.checks[this.Id].menus["b"])) {
            document.getElementById("compare2").onclick = onViewerClicked;
        }
        if (this.ViewerId !== "c" &&
            ("DisplayMenu" in model.checks[this.Id].menus["c"])) {
            document.getElementById("compare3").onclick = onViewerClicked;
        }
        if (this.ViewerId !== "d" &&
            ("DisplayMenu" in model.checks[this.Id].menus["d"])) {
            document.getElementById("compare4").onclick = onViewerClicked;
        }
    }
}

HoveringMenu.prototype.UnRegisterOnClick = function () {
    if (this.Id.toLowerCase() === "comparison") {
        if (this.ViewerId !== "a") {
            document.getElementById("compare1").onclick = null;
        }
        if (this.ViewerId !== "b") {
            document.getElementById("compare2").onclick = null;
        }
        if (this.ViewerId !== "c") {
            document.getElementById("compare3").onclick = null;
        }
        if (this.ViewerId !== "d") {
            document.getElementById("compare4").onclick = null;
        }
    }
}

HoveringMenu.prototype.GetWebviewer = function () {
    if (this.Id.toLowerCase() === "comparison") {
        if (this.ViewerId == 'a') {
            return model.checks["comparison"].sourceAViewer.Viewer;
        }
        else if (this.ViewerId == 'b') {
            return model.checks["comparison"].sourceBViewer.Viewer;
        }
        else if (this.ViewerId == 'c') {
            return model.checks["comparison"].sourceCViewer.Viewer;
        }
        else if (this.ViewerId == 'd') {
            return model.checks["comparison"].sourceDViewer.Viewer;
        }
    }
    else if (this.Id.toLowerCase() === "compliance") {
        return model.checks["compliance"].viewer.Viewer;
    }

    return null;
}

HoveringMenu.prototype.GetDisplayMenu = function () {
    return model.checks[this.Id].menus[this.MenuId].DisplayMenu;
}

HoveringMenu.prototype.GetMarkupMenu = function () {
    return model.checks[this.Id].menus[this.MenuId].MarkupMenu;
}

HoveringMenu.prototype.GetShapesMenu = function () {
    return model.checks[this.Id].menus[this.MenuId].ShapesMenu;
}

HoveringMenu.prototype.GetBookmarkMenu = function () {
    return model.checks[this.Id].menus[this.MenuId].BookmarkMenu;
}

HoveringMenu.prototype.GetTagsMenu = function () {
    return model.checks[this.Id].menus[this.MenuId].TagsMenu;
}

HoveringMenu.prototype.GetModelViewsMenu = function () {
    return model.checks[this.Id].menus[this.MenuId].ModelViewsMenu;
}

HoveringMenu.prototype.GetSectioningMenu = function () {
    return model.checks[this.Id].menus[this.MenuId].SectioningMenu;
}

HoveringMenu.prototype.GetMeasureMenu = function () {
    return model.checks[this.Id].menus[this.MenuId].MeasureMenu;
}

HoveringMenu.prototype.GetDisplayStylesMenu = function () {
    return model.checks[this.Id].menus[this.MenuId].DisplayStylesMenu;
}

HoveringMenu.prototype.HideViews = function () {
    model.checks[this.Id].viewsOpen = false;

    document.getElementById("markupViewsContainer" + this.Id).style.display = "none";
}

HoveringMenu.prototype.HideMeasureViews = function () {
    model.checks[this.Id].measuresOpen = false;

    document.getElementById("measureViewsContainer" + this.Id).style.display = "none";
}

HoveringMenu.prototype.HideAllOpenViewForms = function () {
    // update open view forms
    if (model.checks[this.Id].isViewsOpen()) {
        this.HideViews();
    }
    if (model.checks[this.Id].isMeasuresOpen()) {
        this.HideMeasureViews();
    }
}

function onViewerClicked() {
    var viewerId;
    if (this.id === "compare1") {
        viewerId = "a";
    }
    else if (this.id === "compare2") {
        viewerId = "b";
    }
    else if (this.id === "compare3") {
        viewerId = "c";
    }
    else if (this.id === "compare4") {
        viewerId = "d";
    }

    if (viewerId) {
        model.checks[model.currentCheck].menus[viewerId].DisplayMenu.Toggle();

        DevExpress.ui.notify(
            "Hovering menus enabled for " + "'" + model.files[viewerId].fileName + "'",
            "success",
            1500);
    }
}

function closeAnyOpenMenu() {
    // Close other menus open
    for (var id in model.checks[model.currentCheck].menus) {
        var menus = model.checks[model.currentCheck].menus[id];
        for (var menuName in menus) {
            var menu = menus[menuName];
            if (menu.Active) {
                menu.Close();
                menu.HideAllOpenViewForms();
            }
        }
    }
}