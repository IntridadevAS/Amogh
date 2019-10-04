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
    
    var ContainerDiv = model.checks[model.currentCheck]["reviewTable"].CurrentTableId;
    
    // var data = $("#" + ContainerDiv).data("igGrid").dataSource.dataView();
    var dataGrid = $("#" + ContainerDiv).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();
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
    // var data = $("#" + ContainerDiv).data("igGrid").dataSource.dataView();
    var dataGrid = $("#" + ContainerDiv).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();
        for (var id in data) {
            if (data[id].SourceA.trim() == SourceA.trim()) {
                return data[id];               
            }
       }
    

    return undefined;
}

ReviewViewerInterface.prototype.ResizeViewer = function () {    
}

ReviewViewerInterface.prototype.HighlightMatchedComponent = function(containerDiv, rowData) {
    
    var sheetName = containerDiv.replace("#", "");
    sheetName = sheetName.split('_')[0];

    if(model.currentCheck == "comparison") {
        if(model.checks[model.currentCheck].sourceAViewer) {
            var viewerInterface = model.checks[model.currentCheck].sourceAViewer;
            if(viewerInterface !== this) {
                if(viewerInterface.ViewerOptions) {
                    viewerInterface.highlightComponent(rowData[ComparisonColumnNames.SourceANodeId]);
                }
                else {
                    var result = sheetName.split('-');
                    viewerInterface.ShowSheetDataInViewer(Comparison.ViewerAContainer, result[0], rowData)
                }
            }
        }
        if(model.checks[model.currentCheck].sourceBViewer) {
            var viewerInterface = model.checks[model.currentCheck].sourceBViewer;
            if(viewerInterface !== this) {
                if(viewerInterface.ViewerOptions) {
                    viewerInterface.highlightComponent(rowData[ComparisonColumnNames.SourceBNodeId]);
                }
                else {
                    var result = sheetName.split('-');
                    viewerInterface.ShowSheetDataInViewer(Comparison.ViewerBContainer, result[1], rowData)
                }
            }
        }
        if(model.checks[model.currentCheck].sourceCViewer) {
            var viewerInterface = model.checks[model.currentCheck].sourceCViewer;
            if(viewerInterface !== this) {
                if(viewerInterface.ViewerOptions) {
                    viewerInterface.highlightComponent(rowData[ComparisonColumnNames.SourceCNodeId]);
                }
                else {
                    var result = sheetName.split('-');
                    viewerInterface.ShowSheetDataInViewer(Comparison.ViewerCContainer, result[2], rowData)
                }
            }
        }
        if(model.checks[model.currentCheck].sourceDViewer) {
            var viewerInterface = model.checks[model.currentCheck].sourceDViewer;
            if(viewerInterface !== this) {
                if(viewerInterface.ViewerOptions) {
                    viewerInterface.highlightComponent(rowData[ComparisonColumnNames.SourceDNodeId]);
                }
                else {
                    var result = sheetName.split('-');
                    viewerInterface.ShowSheetDataInViewer(Comparison.ViewerDContainer, result[3], rowData)
                }
            }
        }
    }
}
