function ModelBrowserVisioViewer(id,
    source,
    viewerOptions) {

    this.Id = id;
    this.Source = source;
    this.ViewerOptions = viewerOptions;

    this.Viewer;
    this.selectedNodeId;

    this.SVGViewerId;
    this.SelectedSVGElement;
}


ModelBrowserVisioViewer.prototype.GetViewerContainerID = function () {
    return this.ViewerOptions[0];
}

ModelBrowserVisioViewer.prototype.GetBrowser = function () {
    var browser = model.checks[model.currentCheck]["modelBrowsers"][this.Source];
    return browser["browser"];
}

ModelBrowserVisioViewer.prototype.setupViewer = function (isCompliance) {
    var _this = this;

    if (isCompliance) {
        this.SVGViewerId = "svgComplianceViewer_" + this.Id;
    }
    else {
        this.SVGViewerId = "svgComparisonViewer_" + this.Id;
    }

    // this.Destroy();

    var objectElement = document.createElement("object");
    objectElement.id = this.SVGViewerId;
    objectElement.setAttribute("type", "image/svg+xml");
    objectElement.setAttribute("data", this.ViewerOptions[1]);
   
    objectElement.style.width = "100%";
    objectElement.style.height = "100%";
    objectElement.style.background = "gray";

    document.getElementById(this.ViewerOptions[0]).appendChild(objectElement);


    objectElement.addEventListener('load', function () {
        _this.SvgPanZoomControl = svgPanZoom("#" + _this.SVGViewerId, {
            zoomEnabled: true,
            controlIconsEnabled: true
        });

        // highlight components
        _this.HighlightComponentsfromResult();
    });
}

ModelBrowserVisioViewer.prototype.HighlightComponentsfromResult = function () {

    var browser = this.GetBrowser();

    for (var id in browser.Components) {
        var component = browser.Components[id];
        this.ChangeComponentColor(component);
    }
}

ModelBrowserVisioViewer.prototype.ChangeComponentColor = function (component) {
    var status = component.Status;

    if (status !== null) {
        this.ColorComponent(component);
    }

    var children = component.Children;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        this.ChangeComponentColor(child);
    }
}

ModelBrowserVisioViewer.prototype.ColorComponent = function (component) {

    nodeIdString = component.NodeId;
    var hexColor = xCheckStudio.Util.getComponentHexColor(component, false, undefined);
    if (hexColor === undefined) {
        return;
    }

    // get the inner DOM of *.svg
    var objectElement = document.getElementById(this.SVGViewerId);
    var svgDoc = objectElement.contentDocument;

    // get the inner element by id
    var tags = svgDoc.getElementsByTagName("title");
    for (var i = 0; i < tags.length; i++) {
        if (tags[i].textContent == nodeIdString) {

            this.SelectedSVGElement = tags[i].parentElement;

            var paths = this.SelectedSVGElement.getElementsByTagName("path");
            for (var j = 0; j < paths.length; j++) {
                var path = paths[j];

                if (!path.hasAttribute("originalstroke")) {
                    path.setAttribute("originalstroke", hexColor)
                }

                path.setAttribute("stroke", hexColor);

            }

            break;
        }
    }
}

ModelBrowserVisioViewer.prototype.HighlightComponent = function (nodeIdString) {

    this.UnHighlightComponent();

    if (!nodeIdString) {
        return;
    }

    this.selectedNodeId = nodeIdString;

    this.HighlightNodeInViewer(nodeIdString);
};

ModelBrowserVisioViewer.prototype.UnHighlightComponent = function () {

    this.selectedNodeId = undefined;
    this.ClearSelection();
}

ModelBrowserVisioViewer.prototype.ClearSelection = function () {

    if (!this.SelectedSVGElement) {
        return;
    }

    var paths = this.SelectedSVGElement.getElementsByTagName("path");
    for (var j = 0; j < paths.length; j++) {
        var path = paths[j];
        if (path.hasAttribute("originalstroke")) {
            path.setAttribute("stroke", path.getAttribute("originalstroke"));
        }
        if (path.hasAttribute("originalstroke-width")) {
            path.setAttribute("stroke-width", path.getAttribute("originalstroke-width"));
        }
    }
}

ModelBrowserVisioViewer.prototype.HighlightNodeInViewer = function (nodeId) {

    // get the inner DOM of *.svg
    var objectElement = document.getElementById(this.SVGViewerId);
    var svgDoc = objectElement.contentDocument;

    // get the inner element by id
    var tags = svgDoc.getElementsByTagName("title");
    for (var i = 0; i < tags.length; i++) {
        if (tags[i].textContent == nodeId) {

            this.SelectedSVGElement = tags[i].parentElement;

            var paths = this.SelectedSVGElement.getElementsByTagName("path");
            for (var j = 0; j < paths.length; j++) {
                var path = paths[j];

                if (!path.hasAttribute("originalstroke")) {
                    path.setAttribute("originalstroke", path.getAttribute("stroke"))
                }

                if (!path.hasAttribute("originalstroke-width")) {
                    path.setAttribute("originalstroke-width", path.getAttribute("stroke-width"))
                }

                path.setAttribute("stroke", "red");
                path.setAttribute("stroke-width", "2");
            }

            break;
        }
    }
};

ModelBrowserVisioViewer.prototype.Clear = function () {
    document.getElementById(this.GetViewerContainerID()).innerHTML = "";
}