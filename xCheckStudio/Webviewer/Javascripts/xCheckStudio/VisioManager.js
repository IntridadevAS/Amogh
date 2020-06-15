function VisioManager(id,
    sourceName,
    sourceType,
    viewerOptions) {

    // call super constructor
    SourceManager.call(this, id, sourceName, sourceType);

    this.ViewerOptions = viewerOptions;

    this.PropertiesText;
    this.NodeIdvsComponentIdList;

    this.SelectedSVGElement;

    this.SvgPanZoomControl;
}

// inherit from parent
VisioManager.prototype = Object.create(SourceManager.prototype);
VisioManager.prototype.constructor = VisioManager;

VisioManager.prototype.IsSVGSource = function () {
    return true;
};

VisioManager.prototype.GetViewerContainerID = function () {
    return this.ViewerOptions.containerId;
}

VisioManager.prototype.LoadData = function (selectedComponents) {

    var _this = this;
    return new Promise((resolve) => {

        var objectElement = document.createElement("object");
        objectElement.id = "svgViewerObject" + _this.Id;
        objectElement.setAttribute("type", "image/svg+xml");
        objectElement.setAttribute("data", _this.ViewerOptions.endpointUri);
        // iframeElement.setAttribute("src", "svgContainer.html");

        objectElement.style.width = "100%";
        objectElement.style.height = "100%";
        objectElement.style.background = "white";

        document.getElementById(_this.GetViewerContainerID()).appendChild(objectElement);

        objectElement.addEventListener('load', function () {
            _this.SvgPanZoomControl = svgPanZoom("#svgViewerObject" + _this.Id, {
                // zoomEnabled: true,
                // controlIconsEnabled: true
            });
        });

        _this.ModelTree = new VisioModelBrowser(_this.Id,
            _this.ViewerOptions.modelTree,
            _this.SourceType,
            selectedComponents);

        // create property callout
        _this.PropertyCallout = new PropertyCallout(_this.Id);
        _this.PropertyCallout.Init();

        _this.ReadProperties().then(function (result) {
            if (result) {
                _this.ModelTree.AddComponentTable(_this.SourceProperties);

                _this.AddComponentsToDB();

                _this.BindEvents();
            }

            return resolve(true);
        });
    });
};

VisioManager.prototype.ReadProperties = function () {
    var _this = this;
    return new Promise((resolve) => {

        var name = xCheckStudio.Util.getFileNameWithoutExtension(_this.ViewerOptions.endpointUri);

        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", name + ".xml", true);
        xhttp.send();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                _this.PropertiesText = this.responseText

                var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(_this.SourceType);
                if (identifierProperties === undefined) {
                    return resolve(undefined);
                }

                var xmlText = this.responseText;

                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(xmlText, "application/xml");

                var diagramElements = xmlDoc.getElementsByTagName("Diagram");
                if (diagramElements.length < 0) {
                    return;
                }

                var diagramElement = diagramElements[0];

                var pageElements = diagramElement.getElementsByTagName("Page");

                for (var pageKey = 0; pageKey < pageElements.length; pageKey++) {
                    var pageElement = pageElements[pageKey];
                    var shapeElements = pageElement.getElementsByTagName("Shape");
                    for (var shapeKey = 0; shapeKey < shapeElements.length; shapeKey++) {

                        var shapeElement = shapeElements[shapeKey];
                        _this.ReadShapeProperties(shapeElement, identifierProperties);
                    }
                }

                return resolve(true);
            }
        };
    });
}

VisioManager.prototype.ReadShapeProperties = function (shapeElement, identifierProperties) {

    var _this = this;

    var propertyElements = shapeElement.getElementsByTagName("Property");

    // get component name
    var name = this.GetPropertyValue(propertyElements, identifierProperties.name);
    if (name == undefined || mainComponentClass === "") {
        name = shapeElement.getAttribute("name");
    }

    // get main component class
    var mainComponentClass = this.GetPropertyValue(propertyElements, identifierProperties.mainCategory);

    // get sub component class
    var subComponentClass = this.GetPropertyValue(propertyElements, identifierProperties.subClass);

    if ((name !== undefined && name !== "") &&
        (mainComponentClass !== undefined && mainComponentClass !== "") &&
        (subComponentClass !== undefined && mainComponentClass !== "")) {

        // get owner     
        var owner = this.GetPropertyValue(propertyElements, identifierProperties.owner);
        // temporary
        if (owner &&
            owner.indexOf("/") === 0) {
            owner = owner.slice(1);
        }

        var nameU = shapeElement.getAttribute("nameU");

        // create generic properties object
        var componentObject = new GenericComponent(name,
            mainComponentClass,
            subComponentClass,
            nameU,
            owner);

        // iterate node properties and add to generic properties object
        for (var propertyKey = 0; propertyKey < propertyElements.length; propertyKey++) {
            var propertyElement = propertyElements[propertyKey];

            var propName = propertyElement.getAttribute("name");
            var propValue = propertyElement.getAttribute("value");

            var propertyObject = new GenericProperty(propName, "String", propValue);
            componentObject.addProperty(propertyObject);
        }

        // add genericProperties object to sourceproperties collection
        this.SourceProperties[Object.keys(this.SourceProperties).length + 1] = componentObject;

        this.PropertyCallout;
    }

    var childShapeElements = shapeElement.getElementsByTagName("Shape");
    for (var childShapeKey = 0; childShapeKey < childShapeElements.length; childShapeKey++) {
        var childShapeElement = childShapeElements[childShapeKey];
        this.ReadShapeProperties(childShapeElement, identifierProperties);;
    }
}

VisioManager.prototype.GetPropertyValue = function (propertyElements, propertyToSearch) {

    var properties;
    if (propertyToSearch.includes("<*>")) {
        var properties = propertyToSearch.split("<*>");
    }

    for (var propertyKey = 0; propertyKey < propertyElements.length; propertyKey++) {
        var propertyElement = propertyElements[propertyKey];

        var propName = propertyElement.getAttribute("name").toLowerCase();
        if (properties && properties.length > 0) {
            var match = true;
            for (var i = 0; i < properties.length; i++) {
                if (propName.indexOf(properties[i].toLowerCase()) === -1) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return propertyElement.getAttribute("value"); s
            }

        }
        else if (propName === propertyToSearch.toLowerCase()) {
            return propertyElement.getAttribute("value");
        }
    }

    return undefined;
}

VisioManager.prototype.AddComponentsToDB = function () {
    console.log("start of AddComponentsToDB");
    var _this = this;

    var source = undefined;
    if (this.Id.toLowerCase() == "a") {
        source = "SourceA"
    }
    else if (this.Id.toLowerCase() == "b") {
        source = "SourceB"
    }
    else if (this.Id.toLowerCase() == "c") {
        source = "SourceC"
    }
    else if (this.Id.toLowerCase() == "d") {
        source = "SourceD"
    }


    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    $.ajax({
        data: {
            'Components': JSON.stringify(this.SourceProperties),
            'Source': source,
            'DataSourceType': '3D',
            'ProjectName': projectinfo.projectname,
            'CheckName': checkinfo.checkname
        },
        type: "POST",
        url: "PHP/AddComponentsToDB.php"
    }).done(function (msg) {
        if (msg !== 'fail') {
            _this.NodeIdvsComponentIdList = JSON.parse(msg);
        }


        console.log("End of AddComponentsToDB");
    });
}

VisioManager.prototype.GetControlIds = function () {
}

VisioManager.prototype.ClearSource = function () {

    this.ModelTree.Clear();

    // clear viewer
    document.getElementById(this.GetViewerContainerID()).innerHTML = "";
}

VisioManager.prototype.SetViewerBackgroundColor = function (color) {
    document.getElementById(this.GetViewerContainerID()).style.background = color;
}

VisioManager.prototype.BindEvents = function (viewer) {
    var _this = this;

    // GA selection    
    var objectElement = document.getElementById("svgViewerObject" + this.Id);
    var svgDoc = objectElement.contentDocument;

    var tags = svgDoc.getElementsByTagName("title");
    for (var i = 0; i < tags.length; i++) {
        _this.BindSelection(tags[i]);
    }
};

VisioManager.prototype.BindSelection = function (tag) {
    var _this = this;
    function onSelect() {
        _this.OnSelection(tag.textContent, this);
    }

    tag.parentElement.onclick = onSelect;
}

VisioManager.prototype.OnSelection = function (id, svgElement) {
    if (!(id in this.ModelTree.CompIdVsKey)) {
        return;
    }
    var key = this.ModelTree.CompIdVsKey[id];
    this.ModelTree.SelectionManager.SelectFromGA(key, svgElement);
};

VisioManager.prototype.menu = function (x, y) {

}

VisioManager.prototype.HandleHiddenNodeIdsList = function (isHide, nodeList) {
}

VisioManager.prototype.SelectValidNode = function () {

}

VisioManager.prototype.CreateNodeIdArray = function (nodeId) {

}

VisioManager.prototype.ResizeViewer = function () {

}