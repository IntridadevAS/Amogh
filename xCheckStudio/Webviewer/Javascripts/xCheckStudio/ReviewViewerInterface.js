function ReviewViewerInterface(viewerOptions,
    componentIdVsComponentData,
    nodeIdVsComponentData) {

    this.ViewerOptions = viewerOptions;
    this.selectedNodeId = null;
    this.selectedComponentId = null;

    this.ComponentIdVsComponentData = componentIdVsComponentData;
    this.NodeIdVsComponentData = nodeIdVsComponentData;
    this.NodeIdStatusData = {};

    // this.ReviewManager = reviewManager;
    // this.SelectedComponentRowFromSheetA;
    // this.SelectedComponentRowFromSheetB;

    this.DontColorComponents = {
        "centerline": {
            "mainClass": "component",
            "parentMainClass": "pipingnetworksegment"
        }
    };

    this.OverrideSeverityColorComponents = {
        "pipingnetworksystem": ["pipingnetworksegment"],
        "pipe": ["bran"],
        "hvac": ["bran"],
        "equi": ["cone", "cyli", "dish"]
    };

    this.ReviewViewerContextMenu;
}

ReviewViewerInterface.prototype.Is3DViewer = function () {
    return false;
}

ReviewViewerInterface.prototype.Is1DViewer = function () {
    return false;
}

ReviewViewerInterface.prototype.bindEvents = function () { }

ReviewViewerInterface.prototype.setViewerBackgroundColor = function () { }

ReviewViewerInterface.prototype.highlightComponentsfromResult = function () { }

ReviewViewerInterface.prototype.unHighlightAll = function () { }

ReviewViewerInterface.prototype.onSelection = function (selectionEvent) { }

ReviewViewerInterface.prototype.unHighlightComponent = function () { }

ReviewViewerInterface.prototype.menu = function (x, y) { }

ReviewViewerInterface.prototype.ChangeComponentColor = function (component, override, parentComponent) { }

ReviewViewerInterface.prototype.highlightComponent = function (nodeIdString) { }


ReviewViewerInterface.prototype.GetComparisonCheckComponentData = function (reviewTableRow) {

    var SourceA = reviewTableRow.cells[ComparisonColumns.SourceAName].innerText;
    var SourceB = reviewTableRow.cells[ComparisonColumns.SourceBName].innerText;
    
    var ContainerDiv = model.getCurrentReviewManager().GetReviewTableId(reviewTableRow);
    
    var data = $("#" + ContainerDiv).data("igGrid").dataSource.dataView();
    for (var id in data) {
        if (data[id].SourceA.trim() == SourceA.trim() &&
            data[id].SourceB.trim() == SourceB.trim()) {

            return data[id];           
        }
    }
    
    return undefined;
}

ReviewViewerInterface.prototype.GetComplianceCheckComponentData = function (reviewTableRow) {
    var SourceA = reviewTableRow.cells[ComplianceColumns.SourceName].innerText;
    
    var ContainerDiv = model.getCurrentReviewManager().GetReviewTableId(reviewTableRow);
    var data = $("#" + ContainerDiv).data("igGrid").dataSource.dataView();
        for (var id in data) {
            if (data[id].SourceA.trim() == SourceA.trim()) {
                return data[id];               
            }
       }
    

    return undefined;
}

ReviewViewerInterface.prototype.ResizeViewer = function () {    
}
