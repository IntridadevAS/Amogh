function VisioSelectionManager(nodeIdvsSelectedComponents) {
    // call super constructor
    SelectionManager.call(this);

    // restore selected components on load project
    this.NodeIdvsSelectedComponents = nodeIdvsSelectedComponents;    
    this.SelectedCompoents = [];

    this.SelectedSVGElement;    
}
// assign SelectionManager's method to this class
VisioSelectionManager.prototype = Object.create(SelectionManager.prototype);
VisioSelectionManager.prototype.constructor = VisioSelectionManager;

/* 
   This function 
*/
VisioSelectionManager.prototype.HandleRowSelect = function (row, sourceId, nodeId, containerDiv) {

    // check if row is already highlighted
    if (this.HighlightedComponentRow === row) {
        return;
    }

    // unhighlight old row
    var treeList = $("#" + containerDiv).dxTreeList("instance");
    var selectedRows = treeList.getSelectedRowKeys("all");

    if (this.HighlightedComponentRow &&
        !selectedRows.includes(this.HighlightedComponentRowKey)) {
        if (this.HighlightedComponentRow.rowElement)
            this.RemoveHighlightColor(this.HighlightedComponentRow.rowElement[0]);
        else {
            this.RemoveHighlightColor(this.HighlightedComponentRow);
        }
    }

    // highlight new row  
    if (!selectedRows.includes(nodeId)) {
        if (row.rowElement)
            this.ApplyHighlightColor(row.rowElement[0]);
        else {
            this.ApplyHighlightColor(row);
        }
    }
    this.HighlightedComponentRow = row;
    this.HighlightedComponentRowKey = nodeId;

    if (nodeId) {
        this.BrowserItemClick(nodeId, sourceId);
    }
}

/* 
   This function 
*/
VisioSelectionManager.prototype.BrowserItemClick = function (nodeId, sourceId) {

    // get the inner DOM of *.svg
    var objectElement = document.getElementById("svgViewerObject" + sourceId);
    var svgDoc = objectElement.contentDocument;

    // get the inner element by id
    var tags = svgDoc.getElementsByTagName("title");
    for (var i = 0; i < tags.length; i++) {
        if (tags[i].textContent == nodeId) {
            // tags[i].parentElement.addEventListener("mousedown", function () {

            if (this.SelectedSVGElement) {
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

            this.ZoomOnElement(this.SelectedSVGElement, objectElement);
            // }, false);

            break;
        }
    }
};

/* 
   This function 
*/
VisioSelectionManager.prototype.ZoomOnElement = function (selected, svgDoc) {
    // var bb = selected.getBBox();
    // var vbb = this.SvgPanZoomControl.getSizes().viewBox;
    // var x = vbb.width / 2 - bb.x - bb.width / 2;
    // var y = vbb.height / 2 - bb.y - bb.height / 2;
    // var rz = this.SvgPanZoomControl.getSizes().realZoom;
    // var zoom = vbb.width / bb.width;
    // this.SvgPanZoomControl.panBy({ x: x * rz, y: y * rz });
    // this.SvgPanZoomControl.zoom(zoom);
}

/* 
   This function is called when checkbox from the model browser table is checked or unchecked
*/
VisioSelectionManager.prototype.HandleSelectFormCheckBox = function (currentRow,
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
        if (!this.SelectedComponentNodeIds.includes(componentData.Name)) {
            this.SelectedComponentNodeIds.push(componentData.Name);
        }
    }
    else if (checkBoxState === "off" &&
        this.SelectedCompoentExists(componentData)) {
        this.RemoveFromselectedCompoents(componentData);

        // restore color        
        this.RemoveHighlightColor(currentRow);

        // maintain selected rows
        if (this.SelectedComponentNodeIds.includes(componentData.Name)) {
            var index = this.SelectedComponentNodeIds.indexOf(componentData.Name);
            if (index !== -1) {
                this.SelectedComponentNodeIds.splice(index, 1);
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