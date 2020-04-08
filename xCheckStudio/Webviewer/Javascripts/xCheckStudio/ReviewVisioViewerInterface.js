/* Visio viewer interface */
function ReviewVisioViewerInterface(viewerOptions,
    componentIdVsComponentData,
    nodeIdVsComponentData,
    source) {

    // call super constructor
    ReviewViewerInterface.call(this,
        viewerOptions,
        componentIdVsComponentData,
        nodeIdVsComponentData,
        source);

    this.Id;
    this.SelectedSVGElement;
}

// assign ReviewViewerInterface's method to this class
ReviewVisioViewerInterface.prototype = Object.create(ReviewViewerInterface.prototype);
ReviewVisioViewerInterface.prototype.constructor = ReviewVisioViewerInterface;

ReviewVisioViewerInterface.prototype.IsVisioViewer = function () {
    return true;
}

ReviewVisioViewerInterface.prototype.setupViewer = function (id, isCompliance = false) {
    var _this = this;

    if (isCompliance) {
        this.Id = "svgComplianceViewer_" + id;
    }
    else {
        this.Id = "svgComparisonViewer_" + id;
    }

    this.Destroy();

    var objectElement = document.createElement("object");
    objectElement.id = this.Id;
    objectElement.setAttribute("type", "image/svg+xml");
    objectElement.setAttribute("data", this.ViewerOptions[1]);
    
    objectElement.style.width = "100%";
    objectElement.style.height = "100%";
    objectElement.style.background = "gray";

    document.getElementById(this.ViewerOptions[0]).appendChild(objectElement);


    objectElement.addEventListener('load', function () {
        _this.SvgPanZoomControl = svgPanZoom("#" + _this.Id, {
            zoomEnabled: true,
            controlIconsEnabled: true
        });

        // highlight components
        _this.HighlightComponentsfromResult();
    });
}

ReviewVisioViewerInterface.prototype.HighlightComponentsfromResult = function () {

    for (var id in this.NodeIdStatusData) {
        var component = this.NodeIdStatusData[id];
        this.ChangeComponentColor(component);
    }
}

ReviewVisioViewerInterface.prototype.ChangeComponentColor = function (component) {
    var status = component.Status;
    //var nodeId = component.NodeId;
    if (status !== null) {
        this.ChangeComponentColorInViewer(component);
    }

    var children = component.Children;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        this.ChangeComponentColor(child);
    }
}

ReviewVisioViewerInterface.prototype.ChangeComponentColorInViewer = function (component) {    
        
    nodeIdString = component.NodeId;
    var hexColor = xCheckStudio.Util.getComponentHexColor(component, false, undefined);
    if (hexColor === undefined) {
        return;
    }
    
    // get the inner DOM of *.svg
    var objectElement = document.getElementById(this.Id);
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

                // if (!path.hasAttribute("originalstroke-width")) {
                //     path.setAttribute("originalstroke-width", path.getAttribute("stroke-width"))
                // }

                path.setAttribute("stroke", hexColor);
                // path.setAttribute("stroke-width", "2");
            }

            break;
        }
    }    
}

ReviewVisioViewerInterface.prototype.Destroy = function () {
    var element = document.getElementById(this.Id);
    if (element) {
        element.parentNode.removeChild(element);
    }
}

ReviewVisioViewerInterface.prototype.highlightComponent = function (viewerContainer,
    sheetName,
    CurrentReviewTableRowData,
    nodeIdString) {
   
    this.unHighlightComponent();

    if (!nodeIdString) {   
        return;
    }

    this.selectedNodeId = nodeIdString;

    this.highlightNodeInViewer(nodeIdString);
};

ReviewVisioViewerInterface.prototype.unHighlightComponent = function () {

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

/* 
   This function 
*/
ReviewVisioViewerInterface.prototype.highlightNodeInViewer = function (nodeId) {

    // get the inner DOM of *.svg
    var objectElement = document.getElementById(this.Id);
    var svgDoc = objectElement.contentDocument;

    // get the inner element by id
    var tags = svgDoc.getElementsByTagName("title");
    for (var i = 0; i < tags.length; i++) {
        if (tags[i].textContent == nodeId) {
            // tags[i].parentElement.addEventListener("mousedown", function () {

            // if (this.SelectedSVGElement) {
            //     var paths = this.SelectedSVGElement.getElementsByTagName("path");
            //     for (var j = 0; j < paths.length; j++) {
            //         var path = paths[j];
            //         if (path.hasAttribute("originalstroke")) {
            //             path.setAttribute("stroke", path.getAttribute("originalstroke"));
            //         }
            //         if (path.hasAttribute("originalstroke-width")) {
            //             path.setAttribute("stroke-width", path.getAttribute("originalstroke-width"));
            //         }
            //     }
            // }

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

            // this.ZoomOnElement(this.SelectedSVGElement, objectElement);
            // }, false);

            break;
        }
    }
};