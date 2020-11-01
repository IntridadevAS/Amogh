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
    this.SourceId = null;
    this.SelectedSVGElements = [];    

    this.ParenChildList = {};
    this.SvgPanZoomControl = null;
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
    this.SourceId = id;

    this.Destroy();

    var objectElement = document.createElement("object");
    objectElement.id = this.Id;
    objectElement.setAttribute("type", "image/svg+xml");
    objectElement.setAttribute("data", this.ViewerOptions[1]);
    
    objectElement.style.width = "100%";
    objectElement.style.height = "100%";
    objectElement.style.background = "white";

    document.getElementById(this.ViewerOptions[0]).appendChild(objectElement);


    objectElement.addEventListener('load', function () {
        _this.SvgPanZoomControl = svgPanZoom("#" + _this.Id, {
            zoomEnabled: true,
            // controlIconsEnabled: true
        });

        // highlight components
        _this.HighlightComponentsfromResult();

        // bind events
        _this.BindEvents();
    });
}

ReviewVisioViewerInterface.prototype.BindEvents = function () {
    var _this = this;

    // GA selection    
    var objectElement = document.getElementById(this.Id);
    var svgDoc = objectElement.contentDocument;

    var tags = svgDoc.getElementsByTagName("title");
    for (var i = 0; i < tags.length; i++) {
        _this.BindSelection(tags[i]);
    }
};

ReviewVisioViewerInterface.prototype.BindSelection = function (tag) {
    var _this = this;
    function onSelect() {
        _this.OnSelection(tag.textContent, this);
    }

    tag.parentElement.onclick = onSelect;
}

ReviewVisioViewerInterface.prototype.OnSelection = function (id, svgElement) {

    // get row data 
    let checkComponent = null;
    // let rowData = null;
    if (model.currentCheck.toLowerCase() === "comparison") {
        let reviewManager = model.checks["comparison"].reviewManager;

        checkComponent = null;
        if (this.SourceId === "a" &&
            reviewManager.SourceANodeIdvsCheckComponent &&
            id in reviewManager.SourceANodeIdvsCheckComponent) {
            checkComponent = reviewManager.SourceANodeIdvsCheckComponent[id];
        }
        else if (this.SourceId === "b" &&
            reviewManager.SourceBNodeIdvsCheckComponent &&
            id in reviewManager.SourceBNodeIdvsCheckComponent) {
            checkComponent = reviewManager.SourceBNodeIdvsCheckComponent[id];
        }
        else if (this.SourceId === "c" &&
            reviewManager.SourceCNodeIdvsCheckComponent &&
            id in reviewManager.SourceCNodeIdvsCheckComponent) {
            checkComponent = reviewManager.SourceCNodeIdvsCheckComponent[id];
        }
        else if (this.SourceId === "d" &&
            reviewManager.SourceDNodeIdvsCheckComponent &&
            id in reviewManager.SourceDNodeIdvsCheckComponent) {
            checkComponent = reviewManager.SourceDNodeIdvsCheckComponent[id];
        }

        if (checkComponent === null) {
            return;
        }
    }
    else if (model.currentCheck.toLowerCase() === "compliance") {
        let reviewManager = model.checks["compliance"].reviewManager;

        checkComponent = null;
        if (reviewManager.SourceNodeIdvsCheckComponent &&
            id in reviewManager.SourceNodeIdvsCheckComponent) {
            checkComponent = reviewManager.SourceNodeIdvsCheckComponent[id];
        }

        if (checkComponent === null) {
            return;
        }
    }
    else {
        return;
    }  

    let reviewRowData = this.GetReviewComponentRow(checkComponent);
    if (!reviewRowData) {
        return;
    }

    let reviewRow = reviewRowData["row"];

    // component group id which is container div for check components table of given row    
    let containerDiv = reviewRowData["tableId"];

    let dataGrid = $(containerDiv).dxDataGrid("instance");
    let data = dataGrid.getDataSource().items();
    let rowData = data[reviewRow.rowIndex];    

    // highlight in current viewer
    this.highlightComponent(
        null,
        null,
        rowData,
        null);

    // open property call out
    model.getCurrentReviewManager().OpenPropertyCallout(rowData);

    this.HighlightMatchedComponent(containerDiv, rowData);
}

ReviewVisioViewerInterface.prototype.GetReviewComponentRow = function (checkComponentData) {
    var componentsGroupName = checkComponentData["MainClass"];

    var checkTableIds = model.getCurrentReviewTable().CheckTableIds;
    for (var groupId in checkTableIds) {
        if (!checkTableIds[groupId].toLowerCase().includes(componentsGroupName.toLowerCase())) {
            continue;
        }
    
        var dataGrid = $(checkTableIds[groupId]).dxDataGrid("instance");
        var rows = dataGrid.getVisibleRows();

        for (var i = 0; i < rows.length; i++) {
            if (rows[i].rowType !== "data") {
                continue;
            }

            var rowObj = rows[i];
            var rowData = rowObj.data              

            let checkComponentId = rowData.ID;
            if (checkComponentId == checkComponentData["Id"]) {
                var highlightedRow = model.getCurrentSelectionManager().GetHighlightedRow();
                if (highlightedRow) {

                    var grid = $(highlightedRow["tableId"]).dxDataGrid("instance");
                    var rowIndex = grid.getRowIndexByKey(highlightedRow["rowKey"]);
                    rowElement = grid.getRowElement(rowIndex)[0];

                    var data = grid.getDataSource().items();
                    var rowData = data[rowIndex];
                    model.getCurrentSelectionManager().RemoveHighlightColor(rowElement, rowData[ComparisonColumnNames.Status]);
                }


                var row = dataGrid.getRowElement(rowObj.rowIndex)

                //Expand Accordion and Scroll to Row
                model.getCurrentReviewTable().ExpandAccordionScrollToRow(row[0], checkComponentData.MainClass);

                // highlight selected row
                model.getCurrentSelectionManager().ApplyHighlightColor(row[0])
                model.getCurrentSelectionManager().SetHighlightedRow({
                    "tableId": checkTableIds[groupId],
                    "rowKey": checkComponentId
                });

                //break;
                return { "row": row[0], "tableId": checkTableIds[groupId] };
            }
        }
    }
}

ReviewVisioViewerInterface.prototype.HighlightComponentsfromResult = function () {

    var objectElement = document.getElementById(this.Id);
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

    let isOnload = true;
    for (var id in this.NodeIdStatusData) {
        var component = this.NodeIdStatusData[id];
        this.ChangeComponentColor(component, isOnload);
    }
}

ReviewVisioViewerInterface.prototype.ChangeComponentColor = function (component, isOnload) {
    var status = component.Status;

    // maintain parent child
    let parentChildList = [];
    if (component.NodeId !== null) {
        parentChildList.push(component.NodeId);
    }

    if (status !== null) {
        this.ChangeComponentColorInViewer(component);
    }

    var children = component.Children;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];       

        let parentChild = this.ChangeComponentColor(child, isOnload);        
        
        // maintain parent child        
        parentChildList = parentChildList.concat(parentChild);
    }

    // maintain parent child
    this.ParenChildList[component.Name] = parentChildList;    
    return parentChildList;
}

ReviewVisioViewerInterface.prototype.ChangeComponentColorInViewer = function (component, isOnload = false) {    
        
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

                if (isOnload === true) {
                    let strokeWidth = element.getAttribute("stroke-width");
                    element.setAttribute("stroke-width", strokeWidth * 3);
                }
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

ReviewVisioViewerInterface.prototype.highlightComponent = function (
    viewerContainer,
    sheetName,
    currentReviewTableRowData,
    nodeIdString) {

    this.UnHighlightComponent();

    // if (!nodeIdString) {
    //     return;
    // }

    // this.selectedNodeId = nodeIdString;  
    let componentName = null;
    if (this.SourceId === "a" &&
        currentReviewTableRowData.SourceA &&
        currentReviewTableRowData.SourceA !== "") {
        componentName = currentReviewTableRowData.SourceA;
    }
    else if (this.SourceId === "b" &&
        currentReviewTableRowData.SourceB &&
        currentReviewTableRowData.SourceB !== "") {
        componentName = currentReviewTableRowData.SourceB;
    }
    else if (this.SourceId === "c" &&
        currentReviewTableRowData.SourceC &&
        currentReviewTableRowData.SourceC !== "") {
        componentName = currentReviewTableRowData.SourceC;
    }
    else if (this.SourceId === "d" &&
        currentReviewTableRowData.SourceD &&
        currentReviewTableRowData.SourceD !== "") {
        componentName = currentReviewTableRowData.SourceD;
    }

    // let allIds = [];
    if (componentName in this.ParenChildList) {       
        let allIds = this.ParenChildList[componentName];
        this.HighlightNodeInViewer(allIds);

        // zoom fit to selection
        this.ZoomFitToSelect();
    }
};

ReviewVisioViewerInterface.prototype.ZoomFitToSelect = function () {
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

ReviewVisioViewerInterface.prototype.UnHighlightComponent = function () {

    if (this.SelectedSVGElements.length === 0) {
        return;
    }

    for (var i = 0; i < this.SelectedSVGElements.length; i++) {
        var svgElement = this.SelectedSVGElements[i];

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

/* 
   This function 
*/
ReviewVisioViewerInterface.prototype.HighlightNodeInViewer = function (ids) {

    // get the inner DOM of *.svg
    var objectElement = document.getElementById(this.Id);
    var svgDoc = objectElement.contentDocument;

    // get the inner element by id
    var tags = svgDoc.getElementsByTagName("title");
    for (var i = 0; i < tags.length; i++) {
        if (ids.indexOf(tags[i].textContent) !== -1) {
            let svgElement = tags[i].parentElement

            this.SelectedSVGElements.push(svgElement);

            // var paths = svgElement.getElementsByTagName("path");
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
        }
    }
};

ReviewVisioViewerInterface.prototype.ChangeComponentColorOnStatusChange = function (
    checkComponent, 
    srcId,
    mainComponentClass = null) {

    var reviewManager = model.getCurrentReviewManager();
    if (!reviewManager) {
        return;
    }

    // apply color to component
    var sourceComponentData = reviewManager.GetComponentData(checkComponent, srcId);
    this.ChangeComponentColorInViewer(sourceComponentData, false);

    // apply color to child components
    let componentName = null;
    let idVsComponentList = null;
    if (model.currentCheck === "comparison") {
        if (srcId === "a") {
            componentName = checkComponent.sourceAName;
            idVsComponentList = reviewManager.SourceANodeIdvsCheckComponent;
        }
        else if (srcId === "b") {
            componentName = checkComponent.sourceBName;
            idVsComponentList = reviewManager.SourceBNodeIdvsCheckComponent;
        }
        else if (srcId === "c") {
            componentName = checkComponent.sourceCName;
            idVsComponentList = reviewManager.SourceCNodeIdvsCheckComponent;
        }
        else if (srcId === "d") {
            componentName = checkComponent.sourceDName;
            idVsComponentList = reviewManager.SourceDNodeIdvsCheckComponent;
        }
    }
    else if (model.currentCheck === "comparison") {
        componentName = checkComponent.name;
        idVsComponentList = reviewManager.SourceNodeIdvsCheckComponent;
    }
    if (componentName === null ||
        idVsComponentList === null) {
        return;
    }

    let ids = null;
    if (componentName in this.ParenChildList) {
        ids = this.ParenChildList[componentName];
    }
    if (ids === null) {
        return;
    }

    for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        if (id === sourceComponentData.NodeId) {
            continue;
        }


        if (id in idVsComponentList &&
            idVsComponentList[id].status.toLowerCase() !== "undefined" &&
            idVsComponentList[id].status.toLowerCase() !== "not checked") {
            let component = idVsComponentList[id];

            var componentData = reviewManager.GetComponentData(component, srcId);
            this.ChangeComponentColorInViewer(componentData, false);
        }
    }
}
