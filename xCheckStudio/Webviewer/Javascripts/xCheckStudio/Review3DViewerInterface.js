/* 3D viewer interface */
function Review3DViewerInterface(viewerOptions,
    componentIdVsComponentData,
    nodeIdVsComponentData,
    source,
    dataSourceId) {

    // call super constructor
    ReviewViewerInterface.call(this, viewerOptions,
        componentIdVsComponentData,
        nodeIdVsComponentData,
        source);

    this.DataSourceId = dataSourceId;

    this.KeepOriginalColors = false;
}
// assign SelectionManager's method to this class
Review3DViewerInterface.prototype = Object.create(ReviewViewerInterface.prototype);
Review3DViewerInterface.prototype.constructor = Review3DViewerInterface;


Review3DViewerInterface.prototype.Is3DViewer = function () {
    return true;
}

Review3DViewerInterface.prototype.setupViewer = function (width, height) {

    // create and start viewer
    var viewer = new Communicator.WebViewer({
        containerId: this.ViewerOptions[0], //"myContainer",          
        endpointUri: this.ViewerOptions[1], //"uploads/scs/bearingassembly.scs"	
    });

    viewer.start();
    this.Viewer = viewer;
    this.bindEvents(viewer);

    var viewerContainer = document.getElementById(this.ViewerOptions[0]);
    viewerContainer.style.width = width;//"550px"
    viewerContainer.style.height = height;//"250px"
    // create highlight manager
    this.highlightManager = new HighlightManager(viewer, this.ComponentIdVsComponentData, this.NodeIdVsComponentData);
}

Review3DViewerInterface.prototype.bindEvents = function (viewer) {

    var _this = this;

    viewer.setCallbacks({
        firstModelLoaded: function () {
            viewer.view.fitWorld();
            viewer.resizeCanvas();
            _this.setViewerBackgroundColor();

            // create nav cube
            showNavigationCube(viewer);
            showAxisTriad(viewer);

            _this.highlightComponentsfromResult();

            //activate context menu            
            var ids = _this.GetControlIds();

            _this.ReviewViewerContextMenu = new ViewerContextMenu(viewer, ids);
            _this.ReviewViewerContextMenu.Init();

            model.checks[model.currentCheck]["reviewManager"].RestoreViewsAndTags(_this, _this.DataSourceId);
        },
        selectionArray: function (selections) {
            if (selections.length === 0
                && _this.selectedNodeId) {
                _this.unHighlightAll();
                return;
            }

            for (var i = 0; i < selections.length; i++) {
                var selection = selections[i];
                //var sel = selection.getSelection();

                _this.onSelection(selection);
            }
        },
    });

    window.onresize = function () {
        viewer.resizeCanvas();
    };
};

Review3DViewerInterface.prototype.GetControlIds = function () {
    var ids = {};
    if (this.Viewer._params.containerId === "compare1") {

        var explode = {};
        explode["slider"] = "explodeSlider1"
        explode["output"] = "explodeValue1";
        explode["overlay"] = "explodeOverlay1";
        ids["explode"] = explode;

        var translucency = {};
        translucency["slider"] = "translucencySlider1"
        translucency["output"] = "translucencyValue1";
        translucency["overlay"] = "translucencyOverlay1";
        ids["translucency"] = translucency;
    }
    else if (this.Viewer._params.containerId === "compare2") {

        var explode = {};
        explode["slider"] = "explodeSlider2"
        explode["output"] = "explodeValue2";
        explode["overlay"] = "explodeOverlay2";
        ids["explode"] = explode;

        var translucency = {};
        translucency["slider"] = "translucencySlider2"
        translucency["output"] = "translucencyValue2";
        translucency["overlay"] = "translucencyOverlay2";
        ids["translucency"] = translucency;
    }
    else if (this.Viewer._params.containerId === "compare3") {
        var explode = {};
        explode["slider"] = "explodeSlider3"
        explode["output"] = "explodeValue3";
        explode["overlay"] = "explodeOverlay3";
        ids["explode"] = explode;

        var translucency = {};
        translucency["slider"] = "translucencySlider3"
        translucency["output"] = "translucencyValue3";
        translucency["overlay"] = "translucencyOverlay3";
        ids["translucency"] = translucency;
    }
    else if (this.Viewer._params.containerId === "compare4") {
        var explode = {};
        explode["slider"] = "explodeSlider4"
        explode["output"] = "explodeValue4";
        explode["overlay"] = "explodeOverlay4";
        ids["explode"] = explode;

        var translucency = {};
        translucency["slider"] = "translucencySlider4"
        translucency["output"] = "translucencyValue4";
        translucency["overlay"] = "translucencyOverlay4";
        ids["translucency"] = translucency;
    }
    else if (this.Viewer._params.containerId === "compliance1") {
        var explode = {};
        explode["slider"] = "explodeSlider5"
        explode["output"] = "explodeValue5";
        explode["overlay"] = "explodeOverlay5";
        ids["explode"] = explode;

        var translucency = {};
        translucency["slider"] = "translucencySlider5"
        translucency["output"] = "translucencyValue5";
        translucency["overlay"] = "translucencyOverlay5";
        ids["translucency"] = translucency;
    }

    return ids;
}

Review3DViewerInterface.prototype.ResizeViewer = function () {
    this.Viewer.resizeCanvas();
}

Review3DViewerInterface.prototype.setViewerBackgroundColor = function () {
    var backgroundTopColor = xCheckStudio.Util.hexToRgb("#000000");
    var backgroundBottomColor = xCheckStudio.Util.hexToRgb("#F8F9F9");

    this.Viewer.view.setBackgroundColor(backgroundTopColor, backgroundBottomColor);

    // set back face visibility
    this.Viewer.view.setBackfacesVisible(true);
}

Review3DViewerInterface.prototype.highlightComponentsfromResult = function (keepOriginalColors = false) {

    // set one neutral color to entire model
    if (keepOriginalColors === false) {
        this.KeepOriginalColors = false;

        var rootNode = this.Viewer.model.getAbsoluteRootNode();
        var communicatorColor = new Communicator.Color(255, 255, 255);
        this.Viewer.model.setNodesFaceColor([rootNode], communicatorColor);
        this.Viewer.model.setNodesLineColor([rootNode], communicatorColor);
    }
    else {
        this.KeepOriginalColors = true;
        this.Viewer.model.resetNodesColor(this.Viewer.model.getAbsoluteRootNode());
    }

    for (var id in this.NodeIdStatusData) {
        var component = this.NodeIdStatusData[id];
        this.ChangeComponentColor(component, false, undefined);
    }
}

Review3DViewerInterface.prototype.unHighlightAll = function () {

    // var reviewManager = model.getCurrentReviewManager();

    this.selectedNodeId = undefined;

    var sourceAReviewViewerInterface = model.checks["comparison"]["sourceAViewer"];
    var sourceBReviewViewerInterface = model.checks["comparison"]["sourceBViewer"];
    var sourceCReviewViewerInterface = model.checks["comparison"]["sourceCViewer"];
    var sourceDReviewViewerInterface = model.checks["comparison"]["sourceDViewer"];
    if (sourceAReviewViewerInterface) {
        sourceAReviewViewerInterface.unHighlightComponent();
    }
    if (sourceBReviewViewerInterface) {
        sourceBReviewViewerInterface.unHighlightComponent();
    }
    if (sourceCReviewViewerInterface) {
        sourceCReviewViewerInterface.unHighlightComponent();
    }
    if (sourceDReviewViewerInterface) {
        sourceDReviewViewerInterface.unHighlightComponent();
    }

    // restore highlightcolor of highlightedRow row in main review table
    var highlightedRow = model.getCurrentSelectionManager().GetHighlightedRow();
    if (!highlightedRow) {
        return;
    }

    if (highlightedRow) {
        var dataGrid = $(highlightedRow["tableId"]).dxDataGrid("instance");
        var rowIndex = dataGrid.getRowIndexByKey(highlightedRow["rowKey"]);
        rowElement = dataGrid.getRowElement(rowIndex)[0];

        var data = dataGrid.getDataSource().items();
        var rowData = data[rowIndex];

        model.getCurrentSelectionManager().RemoveHighlightColor(rowElement, rowData[ComparisonColumnNames.Status]);
        model.getCurrentSelectionManager().SetHighlightedRow(undefined);

        // clear detailed info table
        // var viewerContainer = "#" + reviewManager.DetailedReviewTableContainer;
        // clear previous grid
        model.getCurrentDetailedInfoTable().Destroy();
    }
}

Review3DViewerInterface.prototype.onSelection = function (selectionEvent) {
    var selection = selectionEvent.getSelection();

    if (!selection.isNodeSelection() ||
        this.selectedNodeId === selection.getNodeId()) {
        return;
    }

    this.selectedNodeId = selection.getNodeId();
    var model3D = this.Viewer.model;
    if (!model3D.isNodeLoaded(this.selectedNodeId)) {
        this.unHighlightComponent();
        this.unHighlightAll();

        return;
    }

    // select valid node
    this.SelectValidNode();

    if (!this.selectedNodeId ||
        model3D.getNodeType(this.selectedNodeId) === Communicator.NodeType.BodyInstance ||
        model3D.getNodeType(this.selectedNodeId) === Communicator.NodeType.Unknown) {
        return;
    }

    var reviewManager = model.getCurrentReviewManager();
    if (!reviewManager) {
        return;
    }

    // get check component id
    var checkComponentData = reviewManager.GetCheckComponetDataByNodeId(this.ViewerOptions[0], this.selectedNodeId);
    if (!checkComponentData) {
        return;
    }

    var reviewRowData = this.GetReviewComponentRow(checkComponentData);
    if (!reviewRowData) {
        this.unHighlightComponent();
        this.unHighlightAll();

        return;
    }
    var reviewRow = reviewRowData["row"];

    // component group id which is container div for check components table of given row    
    var containerDiv = reviewRowData["tableId"];

    var dataGrid = $(containerDiv).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();
    var rowData = data[reviewRow.rowIndex];
    // var rowData = reviewRowData["rowData"];

    this.HighlightMatchedComponent(containerDiv, rowData);

    model.getCurrentDetailedInfoTable().populateDetailedReviewTable(rowData, containerDiv.replace("#", ""));

    // open property callout
    reviewManager.OpenPropertyCallout(rowData);
};

Review3DViewerInterface.prototype.unHighlightComponent = function () {

    if (!this.selectedNodeId) {
        return;
    }

    this.selectedNodeId = undefined;
    this.highlightManager.clearSelection();
    this.Viewer.view.fitWorld();
}

Review3DViewerInterface.prototype.menu = function (x, y) {
    var i = document.getElementById("menu").style;
    i.top = y + "px";
    i.left = x + "px";
    i.visibility = "visible";
    i.opacity = "1";
}

Review3DViewerInterface.prototype.ChangeComponentColor = function (component, override, parentComponent) {
    var status = component.Status;
    //var nodeId = component.NodeId;
    if (status !== null) {
        this.highlightManager.changeComponentColorInViewer(component, override, parentComponent);
    }

    var children = component.Children;
    for (var id in children) {
        var child = children[id];

        // take care of don't color components
        if (child.SubClass &&
            child.SubClass.toLowerCase() in this.DontColorComponents) {
            var dontColorComponent = this.DontColorComponents[child.SubClass.toLowerCase()];
            if (child.MainClass.toLowerCase() === dontColorComponent["mainClass"] &&
                component.MainClass.toLowerCase() === dontColorComponent["parentMainClass"]) {
                continue;
            }
        }

        // take care of color overriding from status components
        var overrideColorWithSeverityPreference = false;
        if (component.MainClass &&
            component.MainClass.toLowerCase() in this.OverrideSeverityColorComponents) {
            var overrideSeverityColorComponent = this.OverrideSeverityColorComponents[component.MainClass.toLowerCase()];
            // If child component is not mapped (undefined) then child should carry parent component's color
            if (overrideSeverityColorComponent.includes(child.MainClass.toLowerCase()) && child.Status !== 'undefined') {
                overrideColorWithSeverityPreference = true;
            }
        }

        this.ChangeComponentColor(child, overrideColorWithSeverityPreference, component);
    }
}

Review3DViewerInterface.prototype.highlightComponent = function (viewerContainer,
    sheetName,
    CurrentReviewTableRowData,
    nodeIdString) {

    var nodeId = Number(nodeIdString);
    if (!nodeIdString ||
        nodeId === NaN) {
        this.unHighlightComponent();
        return;
    }

    this.selectedNodeId = nodeId;

    this.highlightManager.highlightNodeInViewer(nodeId);
};

Review3DViewerInterface.prototype.SelectValidNode = function () {
    if (this.IsNodeInCheckResults(this.selectedNodeId)) {
        return;
    }

    var model = this.Viewer.model;
    while (this.selectedNodeId) {
        this.selectedNodeId = model.getNodeParent(this.selectedNodeId);

        if (this.IsNodeInCheckResults(this.selectedNodeId)) {
            this.highlightManager.highlightNodeInViewer(this.selectedNodeId);
            break;
        }
    }
}

Review3DViewerInterface.prototype.ChangeComponentColorOnStatusChange = function (
    checkComponent, 
    srcId,
    mainComponentClass = null) {

    var reviewManager = model.getCurrentReviewManager();
    if (!reviewManager) {
        return;
    }

    var sourceComponentData = reviewManager.GetComponentData(checkComponent, srcId);

    var isMainClassValue = false;

    for (var id in this.OverrideSeverityColorComponents) {
        var values = this.OverrideSeverityColorComponents[id];
        if (values.includes(sourceComponentData.MainClass.toLowerCase())) {
            isMainClassValue = true;
            break;
        }
    }

    if (isMainClassValue) {
        var parentNodeId = this.Viewer.model.getNodeParent(Number(sourceComponentData.NodeId));
        var parentComponentData;

        if (this.IsNodeInCheckResults(parentNodeId)) {
            var parentComponent = reviewManager.GetCheckComponetDataByNodeId(this.ViewerOptions[0], parentNodeId);

            var groupId = reviewManager.GetComparisonResultGroupId(parentComponent.MainClass);
            var comp = reviewManager.GetCheckComponent(groupId, parentComponent.Id);

            parentComponentData = reviewManager.GetComponentData(comp, srcId);
            if (parentComponentData.MainClass.toLowerCase() in this.OverrideSeverityColorComponents) {
                this.highlightManager.changeComponentColorInViewer(parentComponentData, false, undefined);
            }
        }

        var children = this.Viewer.model.getNodeChildren(parentNodeId);
        this.ChangeColorInViewer(children, parentComponentData, srcId);

    }
    else if (sourceComponentData.MainClass.toLowerCase() in this.OverrideSeverityColorComponents) {
        this.highlightManager.changeComponentColorInViewer(sourceComponentData, false, undefined);
        var children = this.Viewer.model.getNodeChildren(Number(sourceComponentData.NodeId));

        this.ChangeColorInViewer(children, sourceComponentData, srcId);
    }
    else {
        this.highlightManager.changeComponentColorInViewer(sourceComponentData, false, undefined);
    }
}

Review3DViewerInterface.prototype.ChangeColorInViewer = function (children, parentComponent, srcId) {
    var reviewManager = model.getCurrentReviewManager();
    if (!reviewManager) {
        return;
    }

    for (var i = 0; i < children.length; i++) {
        var checkComponent = reviewManager.GetCheckComponetDataByNodeId(this.ViewerOptions[0], children[i]);
        if (checkComponent) {

            var groupId = reviewManager.GetComparisonResultGroupId(checkComponent.MainClass);
            var comp = reviewManager.GetCheckComponent(groupId, checkComponent.Id);
            var sourceComponentData = reviewManager.GetComponentData(comp, srcId);

            overrideColorWithSeverityPreference = false;
            if (parentComponent) {
                if (parentComponent.MainClass.toLowerCase() in this.OverrideSeverityColorComponents) {
                    var overrideSeverityColorComponent = this.OverrideSeverityColorComponents[parentComponent.MainClass.toLowerCase()];
                    // If child component is not mapped (undefined) then child should carry parent component's color
                    if (overrideSeverityColorComponent.includes(sourceComponentData.MainClass.toLowerCase()) && sourceComponentData.Status !== 'undefined') {
                        overrideColorWithSeverityPreference = true;
                    }
                }
            }

            this.highlightManager.changeComponentColorInViewer(sourceComponentData, overrideColorWithSeverityPreference, parentComponent);
            var children1 = this.Viewer.model.getNodeChildren(Number(sourceComponentData.NodeId));
            this.ChangeColorInViewer(children1, sourceComponentData, srcId);
        }
    }
}


Review3DViewerInterface.prototype.IsNodeInCheckResults = function (node) {

    var reviewManager = model.getCurrentReviewManager();

    var nodeIdvsCheckComponent = reviewManager.GetNodeIdvsComponentData(this.ViewerOptions[0]);

    if (!nodeIdvsCheckComponent) {
        return false;
    }

    if (node in nodeIdvsCheckComponent) {
        return true;
    }

    return false;
}

/* This function returns the comparison check 
    component row for given check component data */
Review3DViewerInterface.prototype.GetReviewComponentRow = function (checkComponentData) {
    var componentsGroupName = checkComponentData["MainClass"];
   
     // remove the special characters and whitespaces from componentgroup name
    // to have propert check in table ids
    let groupNameToSearch = xCheckStudio.Util.createValidHTMLId(componentsGroupName);

    var checkTableIds = model.getCurrentReviewTable().CheckTableIds;
    for (var groupId in checkTableIds) {
        if (!checkTableIds[groupId].toLowerCase().includes(groupNameToSearch.toLowerCase())) {
            continue;
        }
        // else {

        var dataGrid = $(checkTableIds[groupId]).dxDataGrid("instance");
        var rows = dataGrid.getVisibleRows();

        for (var i = 0; i < rows.length; i++) {
            if (rows[i].rowType == "data") {
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
        // }
    }

    return undefined;
}

Review3DViewerInterface.prototype.Destroy = function (viewerContainer) {
    document.getElementById(viewerContainer).innerHTML = "";
}

Review3DViewerInterface.prototype.SerializeViews = function (views) {
    var allViews = [];
    for (var viewName in views) {

        var viewId = views[viewName];
        var markupManager = this.Viewer.markupManager;
        var markupView = markupManager.getMarkupView(viewId);

        if (markupView) {
            allViews.push(markupView.toJson());
        }
    }

    return allViews;
}

Review3DViewerInterface.prototype.RestoreViews = function (viewsStr) {
    var markupManager = this.Viewer.markupManager;
    markupManager.loadMarkupData(xCheckStudio.Util.tryJsonParse(viewsStr)).then(function (result) {

    });

    return viewsStr;
};

Review3DViewerInterface.prototype.SerializeAnnotations = function (annotations) {
    var allAnnotations = [];
    for (var markupHandle in annotations) {
        var annotation = annotations[markupHandle];
        var leaderLineAnchor = annotation.getLeaderLineAnchor();
        var textboxAnchor = annotation.getTextBoxAnchor();
        var text = annotation.getLabel();

        allAnnotations.push({
            "text": text,
            "leaderLineAnchor": [leaderLineAnchor.x, leaderLineAnchor.y, leaderLineAnchor.z],
            "textboxAnchor": [textboxAnchor.x, textboxAnchor.y, textboxAnchor.z]
        });
    }

    return allAnnotations;
}

Review3DViewerInterface.prototype.RestoreAnnotations = function (annotationsStr) {
    var annotations = xCheckStudio.Util.tryJsonParse(annotationsStr);

    var restoredAnnotations = [];
    for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];

        var leaderLineAnchor = new Communicator.Point3(
            Number(annotation.leaderLineAnchor[0]),
            Number(annotation.leaderLineAnchor[1]),
            Number(annotation.leaderLineAnchor[2])
        );

        var annotationMarkup = new Example.AnnotationMarkup(this.Viewer, leaderLineAnchor, annotation.text);
        annotationMarkup.setTextBoxAnchor(new Communicator.Point3(
            Number(annotation.textboxAnchor[0]),
            Number(annotation.textboxAnchor[1]),
            Number(annotation.textboxAnchor[2])
        ));
        annotationMarkup.draw();
        var markupHandle = this.Viewer.markupManager.registerMarkup(annotationMarkup);

        restoredAnnotations[markupHandle] = annotationMarkup;        
    }
    return restoredAnnotations;    
}