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
VisioSelectionManager.prototype.OnComponentRowClicked = function (
    row,
    sourceId,
    id,
    rowKey,
    containerDiv,
    highlightInView = true) {

    // check if row is already highlighted
    if (this.HighlightedComponentRowKey === rowKey) {
        return;
    }

    this.HighlightSelectedRow(rowKey, row, sourceId);
    // // unhighlight old row
    // var treeList = $("#" + containerDiv).dxTreeList("instance");
    // var selectedRows = treeList.getSelectedRowKeys("all");

    // if (!selectedRows.includes(this.HighlightedComponentRowKey)) {
    //     var treeInstance = SourceManagers[sourceId].ModelTree.TreeInstance;
    //     if (treeInstance) {
    //         var index = treeInstance.getRowIndexByKey(this.HighlightedComponentRowKey);
    //         if (index !== -1) {
    //             var rowElement = treeInstance.getRowElement(index);
    //             this.RemoveHighlightColor(rowElement[0]);                
    //         }
    //     }       
    // }

    // // highlight new row  
    // if (!selectedRows.includes(rowKey)) {
    //     if (row.rowElement)
    //         this.ApplyHighlightColor(row.rowElement[0]);
    //     else {
    //         this.ApplyHighlightColor(row);
    //     }
    // }

    // this.HighlightedComponentRowKey = rowKey;

    if (id && highlightInView === true) {
        this.HighlightInView(id, sourceId);
    }
}

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
VisioSelectionManager.prototype.HighlightInView = function (id, sourceId) {

    // get the inner DOM of *.svg
    var objectElement = document.getElementById("svgViewerObject" + sourceId);
    var svgDoc = objectElement.contentDocument;

    // get the inner element by id
    var tags = svgDoc.getElementsByTagName("title");
    for (var i = 0; i < tags.length; i++) {
        if (tags[i].textContent == id) {
            // tags[i].parentElement.addEventListener("mousedown", function () {

            if (this.SelectedSVGElement) {
                this.UnHighlightGAElement(this.SelectedSVGElement);
                // var paths = this.SelectedSVGElement.getElementsByTagName("path");
                // for (var j = 0; j < paths.length; j++) {
                //     var path = paths[j];
                //     if (path.hasAttribute("originalstroke")) {
                //         path.setAttribute("stroke", path.getAttribute("originalstroke"));
                //     }
                //     if (path.hasAttribute("originalstroke-width")) {
                //         path.setAttribute("stroke-width", path.getAttribute("originalstroke-width"));
                //     }
                // }
            }

            this.SelectedSVGElement = tags[i].parentElement;

            this.HighlightGAElement(this.SelectedSVGElement);
            // var paths = this.SelectedSVGElement.getElementsByTagName("path");
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

            this.ZoomOnElement(this.SelectedSVGElement, objectElement);
            // }, false);

            break;
        }
    }
};

VisioSelectionManager.prototype.HighlightGAElement = function (svgElement) {  
    var paths = svgElement.getElementsByTagName("path");
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
}

VisioSelectionManager.prototype.UnHighlightGAElement = function (svgElement) {
    var paths = svgElement.getElementsByTagName("path");
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

VisioSelectionManager.prototype.SelectFromGA = function (key, svgElement) {
    var _this = this;

    if (this.SelectedSVGElement) {
        this.UnHighlightGAElement(this.SelectedSVGElement);
    }

    this.SelectedSVGElement = svgElement;
    this.HighlightGAElement(this.SelectedSVGElement);

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
    var svgPanZoomControl = SourceManagers[model.currentTabId].SvgPanZoomControl;   
    svgPanZoomControl.fit();
    svgPanZoomControl.center();
    svgPanZoomControl.zoom(1);
    
    // var bb = selected.getBBox();
    // // var vbb = svgPanZoomControl.getSizes().viewBox;
    // // var x = vbb.width / 2 - bb.x - bb.width / 2;
    // // var y = vbb.height / 2 - bb.y - bb.height / 2;
    // // var rz = svgPanZoomControl.getSizes().realZoom;
    // // svgPanZoomControl.pan({ x: -x * rz, y: -y * rz });
   
    // // svgPanZoomControl.pan
    // //     ({
    // //         x: -(bb.x * rz) - (svgPanZoomControl.getSizes().width / 2),
    // //         y: -(bb.y * rz) - (svgPanZoomControl.getSizes().height / 2)
    // //     }); 

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