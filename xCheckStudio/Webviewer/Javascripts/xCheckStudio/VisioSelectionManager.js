function VisioSelectionManager(nodeIdvsSelectedComponents) {
    // call super constructor
    SelectionManager.call(this);

    // restore selected components on load project
    this.NodeIdvsSelectedComponents = nodeIdvsSelectedComponents;    
    this.SelectedCompoents = [];

    this.SelectedSVGElements = [];    
}
// assign SelectionManager's method to this class
VisioSelectionManager.prototype = Object.create(SelectionManager.prototype);
VisioSelectionManager.prototype.constructor = VisioSelectionManager;

/* 
   This function 
*/
VisioSelectionManager.prototype.OnComponentRowClicked = function (
    row,
    sourceId,
    id,
    rowKey,  
    childShapes, 
    highlightInView = true) {

    // check if row is already highlighted
    if (this.HighlightedComponentRowKey === rowKey) {
        return;
    }

    console.log("Highlight table row-start");
    this.HighlightSelectedRow(rowKey, row, sourceId);
    console.log("Highlight table row-end");
 
    if (highlightInView === true) {       
        
        // var objectElement = document.getElementById("svgViewerObject" + sourceId);
        // var svgDoc = objectElement.contentDocument;
        // let svg  = svgDoc.getElementsByTagName("svg")[0];
        // svg.removeAttribute("viewBox");

        var svgPanZoomControl = SourceManagers[model.currentTabId].SvgPanZoomControl;    
        svgPanZoomControl.resize();
        svgPanZoomControl.fit();
        svgPanZoomControl.center();   

        console.log("Highlight GA elements-start");
        this.HighlightInView(rowKey, id, sourceId, childShapes);
        console.log("Highlight GA elements-end");

        // console.log("Draw highlight rect-start");
        // // draw highlight rectangle around selected items.
        // this.DrawHighlightRectangle();
        // console.log("Draw highlight rect-end");

        this.ZoomFitToSelect(sourceId);
        // var svgPanZoomControl = SourceManagers[sourceId].SvgPanZoomControl;
        // svgPanZoomControl.fit();
        // svgPanZoomControl.center();
        // svgPanZoomControl.zoom(1);
    }    
}

VisioSelectionManager.prototype.ZoomFitToSelect = function (sourceId) {
    if (this.SelectedSVGElements.length === 0) {
        return;
    }
    let svg = this.SelectedSVGElements[0].ownerSVGElement;
    svg.removeAttribute("viewBox");

    var svgPanZoomControl = SourceManagers[sourceId].SvgPanZoomControl;
    svgPanZoomControl.resize();
    svgPanZoomControl.fit();
    svgPanZoomControl.center();
    svgPanZoomControl.zoom(1);

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

        var vbb = svgPanZoomControl.getSizes().viewBox;
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
        var scale = 0.5;

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

// VisioSelectionManager.prototype.DrawHighlightRectangle = function () {
//     if (this.SelectedSVGElements.length === 0) {
//         return;
//     }

//     // get min x, min y and max x and max y to draw bounding rectangle
//     let minX = null;
//     let minY = null;
//     let maxX = null;
//     let maxY = null;
//     for (let i = 0; i < this.SelectedSVGElements.length; i++) {
//         let svgElement = this.SelectedSVGElements[i];

//         var bbox = svgElement.getBBox();

//         // Transform 
//         // var pt = svgElement.ownerSVGElement.createSVGPoint();
//         // pt.x = bbox.x;
//         // pt.y = bbox.y;
//         // let ctm = svgElement.getCTM()
//         // pt = pt.matrixTransform(ctm);

//         // if (minX === null ||
//         //     minX > pt.x) {
//         //     minX = pt.x
//         // }

//         // if (minY === null ||
//         //     minY > pt.y) {
//         //     minY = pt.y
//         // }

//         // if (maxX === null ||
//         //     maxX < (pt.x + bbox.width)) {
//         //     maxX = pt.x + bbox.width;
//         // }

//         // if (maxY === null ||
//         //     maxY < (pt.y + bbox.height)) {
//         //     maxY = pt.y + bbox.height;
//         // }

//         // draw bounding rectangle   
//         var selRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
//         selRectangle.setAttribute('class', "highlightRectangle");
//         selRectangle.setAttribute('x', bbox.x);
//         selRectangle.setAttribute('y', bbox.y);
//         selRectangle.setAttribute('width', bbox.width);
//         selRectangle.setAttribute('height', bbox.height);
//         selRectangle.style.fill = "orange";
//         selRectangle.style.opacity = 0.25;

//         svgElement.appendChild(selRectangle);
//     }

//     // if (minX !== null && minY !== null &&
//     //     maxX !== null && maxY !== null) {
//     //     // draw bounding rectangle   
//     //     var selRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
//     //     // selRectangle.setAttribute('id', "highlightRectangle");
//     //     selRectangle.setAttribute('x', minX);
//     //     selRectangle.setAttribute('y', minY);
//     //     selRectangle.setAttribute('width', maxX - minX);
//     //     selRectangle.setAttribute('height', maxY - minY);
//     //     selRectangle.style.fill = "orange";
//     //     selRectangle.style.opacity = 0.25;

//     //     this.SelectedSVGElements[0].parentElement.appendChild(selRectangle);
//     //     // this.SelectedSVGElements[0].ownerSVGElement.getElementById("SContent").appendChild(selRectangle);

//     //     // var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
//     //     // g.setAttribute('id', 'highlightRectangle');
//     //     // g.setAttribute('class', 'svg-pan-zoom_viewport');
//     //     // g.appendChild(selRectangle)

//     //     // this.SelectedSVGElements[0].ownerSVGElement.appendChild(g);
//     // }
// }

VisioSelectionManager.prototype.HighlightSelectedRow = function (rowKey, row, sourceId) {
    
    var treeInstance = SourceManagers[sourceId].ModelTree.TreeInstance;
    var selectedRows = treeInstance.getSelectedRowKeys("all");

    if (!selectedRows.includes(this.HighlightedComponentRowKey)) {        
        if (treeInstance) {
            var index = treeInstance.getRowIndexByKey(this.HighlightedComponentRowKey);
            if (index !== -1) {
                var rowElement = treeInstance.getRowElement(index);
                this.RemoveHighlightColor(rowElement[0]);
            }
        }
    }

    // highlight new row  
    if (!selectedRows.includes(rowKey)) {
        if (row)
            this.ApplyHighlightColor(row);
        else {
            this.ApplyHighlightColor(row);
        }
    }

    this.HighlightedComponentRowKey = rowKey;
}

/* 
   This function
*/
VisioSelectionManager.prototype.HighlightInView = function (
    rowKey,
    id,
    sourceId,
    childShapes,
    clearOld = true) {

    // unhighlight the old selections
    if (clearOld) {
        this.UnHighlightSelection();
    }

    // if valid id, then highlight the item
    if (id) {
        // get the inner DOM of *.svg
        var objectElement = document.getElementById("svgViewerObject" + sourceId);
        var svgDoc = objectElement.contentDocument;

        // get the inner element by id
        var tags = svgDoc.getElementsByTagName("title");
        for (var i = 0; i < tags.length; i++) {
            if (tags[i].textContent == id) {

                this.SelectedSVGElements.push(tags[i].parentElement);

                this.HighlightGAElement(tags[i].parentElement);

                // this.ZoomOnElement(tags[i].parentElement, objectElement);

                break;
            }
        }
    }   
   
    if (rowKey === null) {
        return;
    }

    // iterate and highlight children components
    var treeInstance = SourceManagers[sourceId].ModelTree.TreeInstance;
    let treeNode = treeInstance.getNodeByKey(rowKey);
    if (treeNode &&
        treeNode.hasChildren) {

        for (let i = 0; i < treeNode.children.length; i++) {
            let child = treeNode.children[i];
            this.HighlightInView(
                child.key,
                child.data.ID,
                sourceId,
                child.data.childShapes,
                false
            );
        }
    }
};

VisioSelectionManager.prototype.HighlightGAElement = function (svgElement) {
    var elements = Array.prototype.slice.apply(svgElement.getElementsByTagName("path"));
    elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("circle")));
    elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("ellipse")));
    elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("rect")));
    elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("line")));
    elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("polygon ")));
    elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("polyline ")));  

    for (var j = 0; j < elements.length; j++) {
        var elem = elements[j];
        // if (elem.tagName.toLowerCase() === "title") {
        //     continue;
        // }

        if (!elem.hasAttribute("originalstroke")) {
            elem.setAttribute("originalstroke", elem.getAttribute("stroke"))
        }

        if (!elem.hasAttribute("originalstroke-width")) {
            elem.setAttribute("originalstroke-width", elem.getAttribute("stroke-width"))
        }

        elem.setAttribute("stroke", "red");
        elem.setAttribute("stroke-width", "2");
    }


    // var paths = svgElement.getElementsByTagName("path");
    // for (var j = 0; j < paths.length; j++) {
    //     var path = paths[j];

    //     if (!path.hasAttribute("originalstroke")) {
    //         path.setAttribute("originalstroke", path.getAttribute("stroke"))
    //     }

    //     if (!path.hasAttribute("originalstroke-width")) {
    //         path.setAttribute("originalstroke-width", path.getAttribute("stroke-width"))
    //     }

    //     path.setAttribute("stroke", "red");
    //     path.setAttribute("stroke-width", "2");
    // }

    // svgElement.style.outline = "2px solid green";
    // svgElement.style.outlineOffset = "10px";
}

VisioSelectionManager.prototype.UnHighlightSelection = function () {
    if (this.SelectedSVGElements.length > 0) {
        for (let i = 0; i < this.SelectedSVGElements.length; i++) {
            this.UnHighlightGAElement(this.SelectedSVGElements[i]);
        }

        // remove the highlight rectangle               
        let svg = this.SelectedSVGElements[0].ownerSVGElement;
        let elements = svg.getElementsByClassName('highlightRectangle');
        // var element = svg.getElementById('highlightRectangle');
        for (let j = 0; j < elements.length; j++) {
            let element = elements[j];
            if (element) {
                element.parentElement.removeChild(element);
                j--;
            }
        }

        this.SelectedSVGElements = [];
    }
}

VisioSelectionManager.prototype.UnHighlightGAElement = function (svgElement) {
    var elements = Array.prototype.slice.apply(svgElement.getElementsByTagName("path"));
    elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("circle")));
    elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("ellipse")));
    elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("rect")));
    elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("line")));
    elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("polygon ")));
    elements = elements.concat(Array.prototype.slice.apply(svgElement.getElementsByTagName("polyline ")));  

    for (var j = 0; j < elements.length; j++) {
        var elem = elements[j];
        // if (elem.tagName.toLowerCase() === "title") {
        //     continue;
        // }

        if (elem.hasAttribute("originalstroke")) {
            elem.setAttribute("stroke", elem.getAttribute("originalstroke"));
        }
        if (elem.hasAttribute("originalstroke-width")) {
            elem.setAttribute("stroke-width", elem.getAttribute("originalstroke-width"));
        }
    }

    // var paths = svgElement.getElementsByTagName("path");
    // for (var j = 0; j < paths.length; j++) {
    //     var path = paths[j];
    //     if (path.hasAttribute("originalstroke")) {
    //         path.setAttribute("stroke", path.getAttribute("originalstroke"));
    //     }
    //     if (path.hasAttribute("originalstroke-width")) {
    //         path.setAttribute("stroke-width", path.getAttribute("originalstroke-width"));
    //     }
    // }

    // svgElement.style.outline = "";
    // svgElement.style.outlineOffset = "";
}


VisioSelectionManager.prototype.SelectFromGA = function (
    key,  
    id,
    sourceId,
    svgElement) {
    var _this = this;

    // highlight in GA
    this.HighlightInView(
        key,
        id,
        sourceId,
        null);
    // // draw highlight rectangle around selected items.
    // this.DrawHighlightRectangle();

    // // unhighlight old selection
    // this.UnHighlightSelection();

    // this.SelectedSVGElements.push(svgElement);
    // this.HighlightGAElement(svgElement);

    // highlight in table   
    var treeInstance = SourceManagers[model.currentTabId].ModelTree.TreeInstance;
    if (treeInstance) {
        var index = treeInstance.getRowIndexByKey(key);
        if (index !== -1) {
            var rowElement = treeInstance.getRowElement(index);
            if (this.HighlightedComponentRowKey === key) {
                return;
            }
            this.HighlightSelectedRow(key, rowElement[0], model.currentTabId);
            treeInstance.navigateToRow(key);
        }
        else {
            // open row
            SourceManagers[model.currentTabId].ModelTree.OpenRow(key).then(function (res) {

                // now try to get rowindex
                var index = treeInstance.getRowIndexByKey(key);
                if (index !== -1) {
                    var rowElement = treeInstance.getRowElement(index);
                    if (_this.HighlightedComponentRowKey === key) {
                        return;
                    }
                    _this.HighlightSelectedRow(key, rowElement[0], model.currentTabId);
                    treeInstance.navigateToRow(key);
                }
            });
        }
    }
}
  
/* 
   This function 
*/
VisioSelectionManager.prototype.ZoomOnElement = function (selected, svgDoc) {   
    let svg = selected.ownerSVGElement;

    // if (svg.getAttribute("viewBox") !== null) {
    svg.removeAttribute("viewBox");
    //     return;
    // }

    var svgPanZoomControl = SourceManagers[model.currentTabId].SvgPanZoomControl;
    svgPanZoomControl.resize();
    svgPanZoomControl.fit();
    svgPanZoomControl.center();
    svgPanZoomControl.zoom(1);

    // the main SVG object and its current viewBox
    let element = selected;
    
    // var svg = document.querySelector('#my-main-svg');
    var bbox = element.getBBox();
    // var viewBox = svg.getAttribute('viewBox');
    var vbb = svgPanZoomControl.getSizes().viewBox;
    let vbox = [];
    vbox[0] = vbb.x;
    vbox[1] = vbb.y;
    vbox[2] = vbb.width;
    vbox[3] = vbb.height;
    // vbox = viewBox.split(' ');
    // vbox[0] = parseFloat(vbox[0]);
    // vbox[1] = parseFloat(vbox[1]);
    // vbox[2] = parseFloat(vbox[2]);
    // vbox[3] = parseFloat(vbox[3]);

    // the current center of the viewBox
    var cx = vbox[0] + vbox[2] / 2;
    var cy = vbox[1] + vbox[3] / 2;

    // element is the element I want to zoom to
    // var element = svg.querySelector('#my-element');

    // var matrix = element.getTransformToElement(svg);
    var matrix = element.getCTM()

    // the new center
    var newx = (bbox.x + bbox.width / 2) * matrix.a + matrix.e;
    var newy = (bbox.y + bbox.height / 2) * matrix.d + matrix.f;

    // the corresponding top left corner in the current scale
    var absolute_offset_x = vbox[0] + newx - cx;
    var absolute_offset_y = vbox[1] + newy - cy;

    // the new scale  
    // var scale = bbox.width * (matrix.a / vbox[2]) * 4.8; 
    var scale = 0.25;

    // var scaled_offset_x = absolute_offset_x + vbox[2] * (1 - scale) / 2;
    // var scaled_offset_y = absolute_offset_y + vbox[3] * (1 - scale) / 2;    
    var scaled_offset_x = absolute_offset_x + vbox[2] * (1 - scale) / 2;
    var scaled_offset_y = absolute_offset_y + vbox[3] * (1 - scale) / 2;
    var scaled_width = vbox[2] * scale;
    var scaled_height = vbox[3] * scale;
    // var scaled_width = bbox.width * scale;
    // var scaled_height = bbox.height * scale;

    svg.setAttribute("viewBox", "" +
        scaled_offset_x + " " +
        scaled_offset_y + " " +
        Math.abs(scaled_width) + " " +
        Math.abs(scaled_height));  

    // svgPanZoomControl.zoomAtPointBy(4, { x:scaled_offset_x , y: scaled_offset_y })
    // var zoom = vbox[2] / bbox.width;    
    // svgPanZoomControl.zoom(zoom);

    // svgPanZoomControl.pan({ x: 0, y: 0 });
    

    // var bbox = selected.getBBox();
  
    // // Calculate the centre of the group
    // var cx = bbox.x + bbox.width / 2;
    // var cy = bbox.y + bbox.height / 2;

    // // Transform cx,cy by the group's transform
    // var pt = selected.ownerSVGElement.createSVGPoint();
    // pt.x = cx;
    // pt.y = cy;

    // let ctm = selected.getCTM()
    // // let ctm = selected.getScreenCTM();
    // pt = pt.matrixTransform(ctm);    

    // var rz = svgPanZoomControl.getSizes().realZoom;
    // svgPanZoomControl.pan
    //     ({
    //         x: (svgPanZoomControl.getSizes().width / 2) - (pt.x * rz),
    //         y: (svgPanZoomControl.getSizes().height / 2) - (pt.y * rz)
    //     });
    // svgPanZoomControl.zoomAtPointBy(4, { x: pt.x, y: pt.y })

    // // draw bounding rectangle   
    // var selRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    // selRectangle.setAttribute('x', pt.x);
    // selRectangle.setAttribute('y', pt.y);
    // selRectangle.setAttribute('width', bbox.width);
    // selRectangle.setAttribute('height', bbox.height);
    // selRectangle.setAttribute('class', 'selRect');
    // selRectangle.style.fill = "orange";
    // selected.ownerSVGElement.appendChild(selRectangle);

    // 1
    // var vbb = svgPanZoomControl.getSizes().viewBox;
    // svgPanZoomControl.pan({ x: -(vbb.width - bbox.width) / 2, y: -(vbb.height - bbox.height) / 2 });
    

    // highlight item
    // selected.classList.add("highlightSVGItem");
    // let styleValue = selected.getAttribute("style");
    // if (styleValue) {
    //     styleValue += "; outline: 2px solid green;"
    //     styleValue += "outline-offset: 10px;"
    // }
    // else {
    //     styleValue = "outline: 2px solid green;";
    //     styleValue += "outline-offset: 10px;"
    // }
    // selected.setAttribute("style", styleValue);
    // var vbb = svgPanZoomControl.getSizes().viewBox;
    // var zoom = vbb.width / bbox.width;
    // svgPanZoomControl.zoom(zoom);

    // var vbb = svgPanZoomControl.getSizes().viewBox;
    // var x = vbb.width / 2 - absoluteCoords.x - bbox.width / 2;
    // var y = vbb.height / 2 - absoluteCoords.y - bbox.height / 2;
    // var rz = svgPanZoomControl.getSizes().realZoom;
    // var zoom = vbb.width / bbox.width;
    // svgPanZoomControl.panBy({ x: x * rz, y: y * rz });
    // svgPanZoomControl.zoom(zoom);

    // // var bb=$("#target")[0].getBBox();
    // // var vbb = svgPanZoomControl.getSizes().viewBox;
    // var vbb = svgPanZoomControl.getSizes();
    // var x = vbb.width / 2 - bb.x - bb.width / 2;
    // var y = vbb.height / 2 - bb.y - bb.height / 2;
    // // var rz = svgPanZoomControl.getSizes().realZoom;
    // // var zoom = vbb.width / bb.width;
    //  svgPanZoomControl.pan({ x: x, y: y });
    // // (bb.width - bb.width) / 2;
    // // (bb.height - bb.height) / 2;
    // // svgPanZoomControl.pan({ x: -bb.x, y: -bb.y});
    // // svgPanZoomControl.pan({ x: -(vbb.width - bb.width) / 2, y: -(vbb.height - bb.height) / 2 });

    // // svgPanZoomControl.zoom(zoom);
    // // svgPanZoomControl.zoomAtPoint(1, { x: (bb.x - bb.width / 2), y: (bb.y - bb.height / 2) })
    // // svgPanZoomControl.zoom(zoom);
}

/* 
   This function is called when checkbox from the model browser table is checked or unchecked
*/
VisioSelectionManager.prototype.SelectComponent = function (currentRow,
    checkBoxState,
    componentData) {

    // maintain track of selected/deselected components
    if (checkBoxState === "on" &&
        !this.SelectedCompoentExists(componentData)) {

        var checkedComponent = {};

        checkedComponent["Name"] = componentData[ModelBrowserColumnNamesVisio.Component];
        checkedComponent["MainComponentClass"] = componentData[ModelBrowserColumnNamesVisio.MainClass];
        checkedComponent["ComponentClass"] = componentData[ModelBrowserColumnNamesVisio.SubClass];
        checkedComponent["NodeId"] = componentData[ModelBrowserColumnNamesVisio.ID];

        this.SelectedCompoents.push(checkedComponent);

        // highlight selected row         
        this.ApplyHighlightColor(currentRow);

        // maintain selected rows
        if (!this.SelectedComponentIds.includes(componentData.Name)) {
            this.SelectedComponentIds.push(componentData.Name);
        }
    }
    else if (checkBoxState === "off" &&
        this.SelectedCompoentExists(componentData)) {
        this.RemoveFromselectedCompoents(componentData);

        // restore color        
        this.RemoveHighlightColor(currentRow);

        // maintain selected rows
        if (this.SelectedComponentIds.includes(componentData.Name)) {
            var index = this.SelectedComponentIds.indexOf(componentData.Name);
            if (index !== -1) {
                this.SelectedComponentIds.splice(index, 1);
            }
        }
    }
}

/* 
   This function checks if component corresponding to input row in model browser is selected or not
*/
VisioSelectionManager.prototype.SelectedCompoentExists = function (componentData) {
    for (var i = 0; i < this.SelectedCompoents.length; i++) {
        var component = this.SelectedCompoents[i];
        if (component["Name"] === componentData[ModelBrowserColumnNamesVisio.Component] &&
            component["MainComponentClass"] === componentData[ModelBrowserColumnNamesVisio.MainClass] &&
            component["ComponentClass"] === componentData[ModelBrowserColumnNamesVisio.SubClass]) {
            if ("NodeId" in component) {
                if (component["NodeId"] === componentData[ModelBrowserColumnNamesVisio.ID]) {
                    return true;
                }
            }
            else {
                return true;
            }
        }
    }

    return false;
}

/* 
   This function removes selected component from selected components list
*/
VisioSelectionManager.prototype.RemoveFromselectedCompoents = function (componentData) {
    for (var i = 0; i < this.SelectedCompoents.length; i++) {
        var component = this.SelectedCompoents[i];
        if (component["Name"] === componentData[ModelBrowserColumnNamesVisio.Component] &&
            component["MainComponentClass"] === componentData[ModelBrowserColumnNamesVisio.MainClass] &&
            component["ComponentClass"] === componentData[ModelBrowserColumnNamesVisio.SubClass]) {

            if ("NodeId" in component) {
                if (component["NodeId"] === componentData[ModelBrowserColumnNamesVisio.NodeId]) {
                    this.SelectedCompoents.splice(i, 1);
                }
            }
            else {
                this.SelectedCompoents.splice(i, 1);
            }

            // this.selectedCompoents.splice(i, 1);
            break;
        }
    }
}

/* 
   This function 
*/
VisioSelectionManager.prototype.GetSelectedComponents = function () {
    return this.SelectedCompoents;
}