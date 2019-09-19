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

// ReviewViewerInterface.prototype.IsComparisonReviewManager = function () {
//     if (this.ReviewManager.MainReviewTableContainer == "ComparisonMainReviewCell") {
//         return true;
//     }
//     return false;
// }

// ReviewViewerInterface.prototype.IsComplianceReviewManager = function () {
//     if (this.ReviewManager.MainReviewTableContainer.includes("Compliance")) {
//         return true;
//     }
//     return false;
// }

ReviewViewerInterface.prototype.GetComparisonCheckComponentData = function (reviewTableRow) {

    var SourceA = reviewTableRow.cells[ComparisonColumns.SourceAName].innerText;
    var SourceB = reviewTableRow.cells[ComparisonColumns.SourceBName].innerText;
    // var rowData = {};

    var ContainerDiv = model.getCurrentReviewManager().GetReviewTableId(reviewTableRow);
    // $(function () {
    var data = $("#" + ContainerDiv).data("igGrid").dataSource.dataView();
    for (var id in data) {
        if (data[id].SourceA.trim() == SourceA.trim() &&
            data[id].SourceB.trim() == SourceB.trim()) {

            return data[id];
            // rowData['Status'] = data[id].Status;
            // rowData['SourceBName'] = data[id].SourceB;
            // rowData['SourceAName'] = data[id].SourceA;
            // rowData['ResultId'] = data[id].ID;
            // rowData['GroupId'] = data[id].groupId;
            // rowData['SourceANodeId'] = data[id].SourceANodeId;
            // rowData['SourceBNodeId'] = data[id].SourceBNodeId;
            // break;
        }
    }
    // });

    return undefined;
}

ReviewViewerInterface.prototype.GetComplianceCheckComponentData = function (reviewTableRow) {
    var SourceA = reviewTableRow.cells[ComplianceColumns.SourceName].innerText;
    var rowData = {};
    var ContainerDiv = model.getCurrentReviewManager().GetReviewTableId(reviewTableRow);
    $(function () {
        var data = $("#" + ContainerDiv).data("igGrid").dataSource.dataView();
        for (var id in data) {
            if (data[id].SourceA.trim() == SourceA.trim()) {
                rowData['Status'] = data[id].Status;
                rowData['SourceName'] = data[id].SourceA;
                rowData['ResultId'] = data[id].ID;
                rowData['GroupId'] = data[id].groupId;
                rowData['NodeId'] = data[id].NodeId;
            }
        }
    });

    return rowData;
}

ReviewViewerInterface.prototype.ResizeViewer = function () {    
}
