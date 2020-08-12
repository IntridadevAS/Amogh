function VisioViewerContextMenu(id) {
    this.Id = id;

    var _this = this;
    this.OnShowMenu = function (event) {
        _this.ShowMenu(event.screenX, event.screenY);
    }
    this.OnHideMenu = function(event) {
        _this.HideMenu(event);
    }
}

VisioViewerContextMenu.prototype.ShowMenu = function (x, y) {
    var _this = this;
    var menuItems = this.GetControls();

    var contextMenuDiv = document.getElementById("contextMenu");

    $("#contextMenu").dxList({
        dataSource: menuItems,
        hoverStateEnabled: true,
        focusStateEnabled: true,
        activeStateEnabled: false,
        width: 200,
        elementAttr: { class: "dx-theme-accent-as-background-color" },
        selectionMode: "single",
        onSelectionChanged: function (e) {
            if (e.component._selection.getSelectedItems().length > 0) {
                e.addedItems[0].click(e, _this);
                e.component._selection.deselectAll();
            }
        },
        onContentReady(e) {
            contextMenuDiv.style.display = "block";

            var itemHeight = e.element[0].getElementsByClassName("dx-list-item").item(0).offsetHeight;
            const itemCount = e.component.option("items").length;
            e.component.option("height", itemHeight * itemCount);
        }
    });

    // position the context menu
    var menuHeight = contextMenuDiv.offsetHeight;
    var menuWidth = contextMenuDiv.offsetWidth;

    var viewerContainer = document.getElementById("svgViewerObject" + this.Id);

    // get position relative to viewerContainer
    var viewerX = x - $("#visualizer" + this.Id.toUpperCase()).offset().left;  
    var viewerY = y - $("#visualizer" + this.Id.toUpperCase()).offset().top;
    // var viewerX = x - viewerContainer.parentElement.offsetLeft;
    // var viewerY = y - viewerContainer.parentElement.offsetTop;

    // adjust x
    if ((viewerContainer.offsetWidth - viewerX) < menuWidth) {
        x = x - menuWidth;
    }
    // adjust y
    if ((viewerContainer.offsetHeight - viewerY) < menuHeight) {
        y = y - menuHeight;
    }

    contextMenuDiv.style.top = y + "px";
    contextMenuDiv.style.left = x + "px";
}

VisioViewerContextMenu.prototype.HideMenu = function (e) {
    if (e.target.id !== 'contextMenu') {
        var contextMenuDiv = document.getElementById("contextMenu");
        contextMenuDiv.style.display = 'none';
    }
}

VisioViewerContextMenu.prototype.Init = function (activate) {
    var objectElement = document.getElementById("svgViewerObject" + this.Id);

    if (activate === true) {
        objectElement.contentDocument.addEventListener("contextmenu", this.OnShowMenu);

        objectElement.contentDocument.addEventListener("click", this.OnHideMenu);
        document.addEventListener("click", this.OnHideMenu);
    }
    else {
        objectElement.contentDocument.removeEventListener("contextmenu", this.OnShowMenu);

        objectElement.contentDocument.removeEventListener("click", this.OnHideMenu);
        document.removeEventListener("click", this.OnHideMenu);
    }
}

VisioViewerContextMenu.prototype.GetControls = function () {
    return [
        {
            text: "Zoom To Fit",
            icon: "public/symbols/ZoomFit.svg",
            click: function (e, menu) {
                menu.OnZoomToFitClicked();
            }
        }
    ];
}

VisioViewerContextMenu.prototype.OnZoomToFitClicked = function () {
    var objectElement = document.getElementById("svgViewerObject" + this.Id);
    let svg = objectElement.contentDocument.getElementsByTagName("svg")[0];
    if (svg.getAttribute("viewBox") !== null) {
        svg.removeAttribute("viewBox");
        return;
    }
        
    var svgPanZoomControl = SourceManagers[this.Id].SvgPanZoomControl;   
    svgPanZoomControl.fit();
    svgPanZoomControl.center();
    svgPanZoomControl.zoom(1);
}