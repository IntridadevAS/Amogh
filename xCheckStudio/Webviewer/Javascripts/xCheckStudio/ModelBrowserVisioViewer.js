function ModelBrowserVisioViewer(id,
    source,
    viewerOptions) {

    this.Id = id;
    this.Source = source;
    this.ViewerOptions = viewerOptions;

    this.Viewer;
    // this.selectedNodeId;

    this.SVGViewerId;
    this.SelectedSVGElements = [];

    this.SvgPanZoomControl = null;
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
    objectElement.style.background = "white";

    document.getElementById(this.ViewerOptions[0]).appendChild(objectElement);


    objectElement.addEventListener('load', function () {
        _this.SvgPanZoomControl = svgPanZoom("#" + _this.SVGViewerId, {
            zoomEnabled: true,
            controlIconsEnabled: true
        });

        // highlight components
        _this.HighlightComponentsfromResult();

         // bind events
         _this.BindEvents();
    });
}

ModelBrowserVisioViewer.prototype.BindEvents = function () {
    var _this = this;

    // GA selection    
    var objectElement = document.getElementById(this.SVGViewerId);
    var svgDoc = objectElement.contentDocument;

    var tags = svgDoc.getElementsByTagName("title");
    for (var i = 0; i < tags.length; i++) {
        _this.BindSelection(tags[i]);
    }
};

ModelBrowserVisioViewer.prototype.BindSelection = function (tag) {
    var _this = this;
    function onSelect() {
        _this.OnSelection(tag.textContent, this);
    }

    tag.parentElement.onclick = onSelect;
}

ModelBrowserVisioViewer.prototype.OnSelection = function (id, svgElement) {
    let browser = this.GetBrowser();
    if (!browser ||
        !(id in browser.NodeIdvsCheckComponent)) {
        return;
    }

    // highlight in current viewer
    let checkComponent = browser.NodeIdvsCheckComponent[id];
    let rowData = {};
    rowData["Category"] = checkComponent["MainClass"];
    rowData["Class"] = checkComponent["SubClass"];
    rowData["GroupId"] = checkComponent["GroupId"];
    rowData["Item"] = checkComponent["Name"];
    rowData["NodeId"] = checkComponent["NodeId"];
    rowData["ResultId"] = checkComponent["ResultId"];
    rowData["Status"] = checkComponent["Status"]

    browser.HighlightInViewer(rowData);

    if (!browser) {
        return;
    }

    browser.HighlightBrowserComponentRow(id, true);
}

ModelBrowserVisioViewer.prototype.HighlightComponentsfromResult = function () {

    var objectElement = document.getElementById(this.SVGViewerId);
    var svgDoc = objectElement.contentDocument;

    var elements = Array.prototype.slice.apply(svgDoc.getElementsByTagName("path"));
    elements = elements.concat(Array.prototype.slice.apply(svgDoc.getElementsByTagName("circle")));
    elements = elements.concat(Array.prototype.slice.apply(svgDoc.getElementsByTagName("ellipse")));
    elements = elements.concat(Array.prototype.slice.apply(svgDoc.getElementsByTagName("rect")));
    elements = elements.concat(Array.prototype.slice.apply(svgDoc.getElementsByTagName("line")));
    elements = elements.concat(Array.prototype.slice.apply(svgDoc.getElementsByTagName("polygon ")));
    elements = elements.concat(Array.prototype.slice.apply(svgDoc.getElementsByTagName("polyline ")));  
    for (let i = 0; i < elements.length; i++) {
        let elem = elements[i];
        // elem.setAttribute("originalstroke", elem.getAttribute("stroke"));       
        elem.setAttribute("stroke", "#000");
    }

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

            let svgElem = tags[i].parentElement;

            var elements = Array.prototype.slice.apply(svgElem.getElementsByTagName("path"));
            elements = elements.concat(Array.prototype.slice.apply(svgElem.getElementsByTagName("circle")));
            elements = elements.concat(Array.prototype.slice.apply(svgElem.getElementsByTagName("ellipse")));
            elements = elements.concat(Array.prototype.slice.apply(svgElem.getElementsByTagName("rect")));
            elements = elements.concat(Array.prototype.slice.apply(svgElem.getElementsByTagName("line")));
            elements = elements.concat(Array.prototype.slice.apply(svgElem.getElementsByTagName("polygon ")));
            elements = elements.concat(Array.prototype.slice.apply(svgElem.getElementsByTagName("polyline ")));

            for (var j = 0; j < elements.length; j++) {
                var element = elements[j];

                // if (!path.hasAttribute("originalstroke")) {
                element.setAttribute("originalstroke", hexColor)
                // }

                element.setAttribute("stroke", hexColor);
            }

            break;
        }
    }
}

ModelBrowserVisioViewer.prototype.HighlightComponent = function (allIds) {

    this.UnHighlightComponent();

    // if (!nodeIdString) {
    //     return;
    // }

    // this.selectedNodeId = nodeIdString;

    this.HighlightNodeInViewer(allIds);

    this.ZoomFitToSelect();
};

ModelBrowserVisioViewer.prototype.ZoomFitToSelect = function () {
    if (this.SelectedSVGElements.length === 0) {
        return;
    }
    let svg = this.SelectedSVGElements[0].ownerSVGElement;
    svg.removeAttribute("viewBox");


    this.SvgPanZoomControl.resize();
    this.SvgPanZoomControl.fit();
    this.SvgPanZoomControl.center();
    this.SvgPanZoomControl.zoom(1);

    // get min x, min y and max x and max y to find exact center
    let minX = null;
    let minY = null;
    let maxX = null;
    let maxY = null;
    for (let i = 0; i < this.SelectedSVGElements.length; i++) {
        let svgElement = this.SelectedSVGElements[i];

        var bbox = svgElement.getBBox();

        var topLeftPt = svg.createSVGPoint();
        topLeftPt.x = bbox.x;
        topLeftPt.y = bbox.y;

        var rightBottomPt = svg.createSVGPoint();
        rightBottomPt.x = bbox.x + bbox.width;
        rightBottomPt.y = bbox.y + bbox.height;

        var matrix = svgElement.getCTM()
        // topLeftPt.x = topLeftPt.x * matrix.a + matrix.e;
        // topLeftPt.y = topLeftPt.y * matrix.d + matrix.f;

        // rightBottomPt.x = rightBottomPt.x * matrix.a + matrix.e;
        // rightBottomPt.y = rightBottomPt.y * matrix.d + matrix.f;

        topLeftPt = topLeftPt.matrixTransform(matrix);
        rightBottomPt = rightBottomPt.matrixTransform(matrix);

        // var rightBottomPt = svg.createSVGPoint();
        // rightBottomPt.x = topLeftPt.x + bbox.width;
        // rightBottomPt.y = topLeftPt.y + bbox.height;

        if (minX === null ||
            minX > topLeftPt.x) {
            minX = topLeftPt.x
        }

        if (minY === null ||
            minY > topLeftPt.y) {
            minY = topLeftPt.y
        }

        if (maxX === null ||
            maxX < rightBottomPt.x) {
            maxX = rightBottomPt.x;
        }

        if (maxY === null ||
            maxY < rightBottomPt.y) {
            maxY = rightBottomPt.y;
        }
    }

    if (minX !== null && minY !== null &&
        maxX !== null && maxY !== null) {

        var vbb = this.SvgPanZoomControl.getSizes().viewBox;
        let vbox = [];
        vbox[0] = vbb.x;
        vbox[1] = vbb.y;
        vbox[2] = vbb.width;
        vbox[3] = vbb.height;

        // the current center of the viewBox
        var cx = vbox[0] + vbox[2] / 2;
        var cy = vbox[1] + vbox[3] / 2;

        // // var matrix = element.getTransformToElement(svg);
        // var matrix = element.getCTM()

        // the new center
        let newx = minX + (maxX - minX);
        let newy = minY + (maxY - minY);
        // var newx = (bbox.x + bbox.width / 2) * matrix.a + matrix.e;
        // var newy = (bbox.y + bbox.height / 2) * matrix.d + matrix.f;

        // the corresponding top left corner in the current scale
        var absolute_offset_x = vbox[0] + newx - cx;
        var absolute_offset_y = vbox[1] + newy - cy;

        // the new scale  
        // var scale = bbox.width * (matrix.a / vbox[2]) * 4.8; 
        var scale = 0.25;

        var scaled_offset_x = absolute_offset_x + vbox[2] * (1 - scale) / 2;
        var scaled_offset_y = absolute_offset_y + vbox[3] * (1 - scale) / 2;
        var scaled_width = vbox[2] * scale;
        var scaled_height = vbox[3] * scale;

        svg.setAttribute("viewBox", "" +
            scaled_offset_x + " " +
            scaled_offset_y + " " +
            Math.abs(scaled_width) + " " +
            Math.abs(scaled_height));
    }
}

ModelBrowserVisioViewer.prototype.UnHighlightComponent = function () {

    // this.selectedNodeId = undefined;
    this.ClearSelection();
}

ModelBrowserVisioViewer.prototype.ClearSelection = function () {

    if (this.SelectedSVGElements.length === 0) {
        return;
    }

    for (let i = 0; i < this.SelectedSVGElements.length; i++) {
        let svgElement = this.SelectedSVGElements[i];

        var elements = Array.prototype.slice.apply(svgElement.getElementsByTagName("path"));
        elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("circle")));
        elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("ellipse")));
        elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("rect")));
        elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("line")));
        elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("polygon ")));
        elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("polyline ")));
        for (var j = 0; j < elements.length; j++) {
            var element = elements[j];
            if (element.hasAttribute("originalstroke")) {
                element.setAttribute("stroke", element.getAttribute("originalstroke"));
            }
            if (element.hasAttribute("originalstroke-width")) {
                element.setAttribute("stroke-width", element.getAttribute("originalstroke-width"));
            }
        }
    }

    this.SelectedSVGElements = [];
}

ModelBrowserVisioViewer.prototype.HighlightNodeInViewer = function (ids) {

    // get the inner DOM of *.svg
    var objectElement = document.getElementById(this.SVGViewerId);
    var svgDoc = objectElement.contentDocument;

    // get the inner element by id
    var tags = svgDoc.getElementsByTagName("title");
    for (var i = 0; i < tags.length; i++) {
        if (ids.indexOf(tags[i].textContent) !== -1) {
            let svgElement = tags[i].parentElement;
            this.SelectedSVGElements.push(svgElement);

            var elements = Array.prototype.slice.apply(svgElement.getElementsByTagName("path"));
            elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("circle")));
            elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("ellipse")));
            elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("rect")));
            elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("line")));
            elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("polygon ")));
            elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("polyline ")));

            for (var j = 0; j < elements.length; j++) {
                var element = elements[j];

                if (!element.hasAttribute("originalstroke")) {
                    element.setAttribute("originalstroke", element.getAttribute("stroke"))
                }

                if (!element.hasAttribute("originalstroke-width")) {
                    element.setAttribute("originalstroke-width", element.getAttribute("stroke-width"))
                }

                element.setAttribute("stroke", "red");
                element.setAttribute("stroke-width", "2");
            }

            // break;
        }
    }
};

ModelBrowserVisioViewer.prototype.Clear = function () {
    document.getElementById(this.GetViewerContainerID()).innerHTML = "";
}