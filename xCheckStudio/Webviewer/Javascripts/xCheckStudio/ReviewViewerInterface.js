function ReviewViewerInterface(viewerOptions,
    componentIdVsComponentData,
    nodeIdVsComponentData,
    source) {

    this.ViewerOptions = viewerOptions;
    this.selectedNodeId = null;   
    this.HiddenResultIdVsTableId = {};

    this.ComponentIdVsComponentData = componentIdVsComponentData;
    this.NodeIdVsComponentData = nodeIdVsComponentData;
    this.NodeIdStatusData = {};

    this.DataSource = source;
    
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

ReviewViewerInterface.prototype.IsVisioViewer = function () {
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

ReviewViewerInterface.prototype.highlightComponent = function (viewerContainer,
    sheetName,
    CurrentReviewTableRowData,
    nodeIdString) {

}


ReviewViewerInterface.prototype.GetComparisonCheckComponentData = function (reviewTableRow, containerDiv) {

    // var SourceA = reviewTableRow.cells[ComparisonColumns.SourceAName].innerText;
    // var SourceB = reviewTableRow.cells[ComparisonColumns.SourceBName].innerText;  
    // var SourceC = reviewTableRow.cells[ComparisonColumns.SourceCName].innerText;
    // var SourceD = reviewTableRow.cells[ComparisonColumns.SourceDName].innerText;  
    
    var dataGrid = $(containerDiv).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();
    return data[reviewTableRow.rowIndex];
    // for (var id in data) {
    //     if (data[id].SourceA == SourceA &&
    //         data[id].SourceB == SourceB &&
    //         data[id].SourceC == SourceC &&
    //         data[id].SourceD == SourceD) {

    //         return data[id];           
    //     }
    // }
    
    // return undefined;
}

ReviewViewerInterface.prototype.GetComplianceCheckComponentData = function (reviewTableRow, containerDiv) {
    var SourceA = reviewTableRow.cells[ComplianceColumns.SourceName].innerText;   
    
    var dataGrid = $(containerDiv).dxDataGrid("instance");
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
  
    if(model.currentCheck == "comparison") {
        if(model.checks[model.currentCheck].sourceAViewer) {
            var viewerInterface = model.checks[model.currentCheck].sourceAViewer;
            if(viewerInterface !== this) {               
                var sheetName = model.getCurrentReviewManager().GetSheetName(rowData, Comparison.ViewerAContainer);
                viewerInterface.highlightComponent(Comparison.ViewerAContainer, sheetName, rowData, rowData[ComparisonColumnNames.SourceANodeId]);
            }
        }
        if (model.checks[model.currentCheck].sourceBViewer) {
            var viewerInterface = model.checks[model.currentCheck].sourceBViewer;
            if (viewerInterface !== this) {
                var sheetName = model.getCurrentReviewManager().GetSheetName(rowData, Comparison.ViewerBContainer);
                viewerInterface.highlightComponent(Comparison.ViewerBContainer, sheetName, rowData, rowData[ComparisonColumnNames.SourceBNodeId]);
            }
        }
        if (model.checks[model.currentCheck].sourceCViewer) {
            var viewerInterface = model.checks[model.currentCheck].sourceCViewer;
            if (viewerInterface !== this) {
                var sheetName = model.getCurrentReviewManager().GetSheetName(rowData, Comparison.ViewerCContainer);
                viewerInterface.highlightComponent(Comparison.ViewerCContainer, sheetName, rowData, rowData[ComparisonColumnNames.SourceCNodeId]);
            }
        }
        if (model.checks[model.currentCheck].sourceDViewer) {
            var viewerInterface = model.checks[model.currentCheck].sourceDViewer;
            if (viewerInterface !== this) {
                var sheetName = model.getCurrentReviewManager().GetSheetName(rowData, Comparison.ViewerDContainer);
                viewerInterface.highlightComponent(Comparison.ViewerDContainer, sheetName, rowData, rowData[ComparisonColumnNames.SourceDNodeId]);
            }
        }
    }
}

ReviewViewerInterface.prototype.StoreHiddenResultId = function(selectedComponentRows) {
    if(model.currentCheck == "comparison") {
        for (var i = 0; i < selectedComponentRows.length; i++) {
            var selectedRow = selectedComponentRows[i];

            var dataGrid = $(selectedRow["tableId"]).dxDataGrid("instance");
            var rowsData = dataGrid.getDataSource().items();
            
            var rowIndex = dataGrid.getRowIndexByKey(selectedRow["rowKey"]);
            var rowData = rowsData[rowIndex];
                // source A
                if(model.checks[model.currentCheck].sourceAViewer) {
                    var viewerInterface = model.checks[model.currentCheck].sourceAViewer;
                    if(viewerInterface == this) {
                        if (rowData.SourceANodeId !== "" && rowData.SourceANodeId !== null) { 
                            viewerInterface.HiddenResultIdVsTableId[Number(rowData.ID)] = selectedRow["tableId"];            
                        }
                    }
                }

                // source B
                if(model.checks[model.currentCheck].sourceBViewer) {
                    var viewerInterface = model.checks[model.currentCheck].sourceBViewer;
                    if(viewerInterface == this) {
                        if (rowData.SourceBNodeId !== "" && rowData.SourceBNodeId !== null) {       
                            viewerInterface.HiddenResultIdVsTableId[Number(rowData.ID)] = selectedRow["tableId"];           
                        }
                    }
                }

                
            // source C
            if (model.checks[model.currentCheck].sourceCViewer) {
                var viewerInterface = model.checks[model.currentCheck].sourceCViewer;
                if (viewerInterface == this) {
                    if (rowData.SourceCNodeId !== "" &&
                        rowData.SourceCNodeId !== null) {
                        viewerInterface.HiddenResultIdVsTableId[Number(rowData.ID)] = selectedRow["tableId"];
                    }
                }
            }

            // source D
            if (model.checks[model.currentCheck].sourceDViewer) {
                var viewerInterface = model.checks[model.currentCheck].sourceDViewer;
                if (viewerInterface == this) {
                    if (rowData.SourceDNodeId !== "" &&
                        rowData.SourceDNodeId !== null) {
                        viewerInterface.HiddenResultIdVsTableId[Number(rowData.ID)] = selectedRow["tableId"];
                    }
                }
            }
        }
    }
    else {
        if(model.checks[model.currentCheck].viewer) {
            var viewerInterface = model.checks[model.currentCheck].viewer;
            if(viewerInterface == this) {
                for (var i = 0; i < selectedComponentRows.length; i++) {
                    var selectedRow = selectedComponentRows[i];

                    var dataGrid = $(selectedRow["tableId"]).dxDataGrid("instance");
                    var rowsData = dataGrid.getDataSource().items();

                    var rowIndex = dataGrid.getRowIndexByKey(selectedRow["rowKey"]);
                    var rowData = rowsData[rowIndex];
                    if (rowData.NodeId !== "" && rowData.NodeId !== null) {       
                        viewerInterface.HiddenResultIdVsTableId[Number(rowData.ID)] = selectedRow["tableId"];           
                    }
                }
            }
        }
    }      
}

ReviewViewerInterface.prototype.RemoveHiddenResultId = function(selectedComponentRows) {    
    for (var i = 0; i < selectedComponentRows.length; i++) {
        var selectedRow = selectedComponentRows[i];

        var dataGrid = $(selectedRow["tableId"]).dxDataGrid("instance");
        var rowsData = dataGrid.getDataSource().items(); 

        var rowIndex = dataGrid.getRowIndexByKey(selectedRow["rowKey"]);
        var rowData = rowsData[rowIndex];
        // source A
        if(model.checks[model.currentCheck].sourceAViewer) {
            var viewerInterface = model.checks[model.currentCheck].sourceAViewer;
            if(viewerInterface == this) {
                if (rowData.SourceANodeId !== "" && rowData.SourceANodeId !== null) { 
                    delete model.checks[model.currentCheck].sourceAViewer.HiddenResultIdVsTableId[rowData.ID];            
                }
            }
        }

        // source B
        if(model.checks[model.currentCheck].sourceBViewer) {
            var viewerInterface = model.checks[model.currentCheck].sourceBViewer;
            if(viewerInterface == this) {
                if (rowData.SourceBNodeId !== "" && rowData.SourceBNodeId !== null) {       
                    delete model.checks[model.currentCheck].sourceBViewer.HiddenResultIdVsTableId[rowData.ID];           
                }
            }
        }
    }
}

ReviewViewerInterface.prototype.CheckIfMatchedElementIsHidden = function(key) {
    var isHidden = false;

    var currentCheck = model.checks[model.currentCheck];
    if(this == currentCheck.sourceAViewer) {
        if(currentCheck.sourceBViewer) {
            if(Object.keys(currentCheck.sourceBViewer.HiddenResultIdVsTableId).includes(key)) {
                isHidden = true;
            }
        }
        if(currentCheck.sourceCViewer) {
            if(Object.keys(currentCheck.sourceCViewer.HiddenResultIdVsTableId).includes(key)) {
                isHidden = true;
            }
        }
        if(currentCheck.sourceDViewer) {
            if(Object.keys(currentCheck.sourceDViewer.HiddenResultIdVsTableId).includes(key)) {
                isHidden = true;
            }
        }
    }

    if(this == currentCheck.sourceBViewer) {
        if(currentCheck.sourceAViewer) {
            if(Object.keys(currentCheck.sourceAViewer.HiddenResultIdVsTableId).includes(key)) {
                isHidden = true;
            }
        }
        if(currentCheck.sourceCViewer) {
            if(Object.keys(currentCheck.sourceCViewer.HiddenResultIdVsTableId).includes(key)) {
                isHidden = true;
            }
        }
        if(currentCheck.sourceDViewer) {
            if(Object.keys(currentCheck.sourceDViewer.HiddenResultIdVsTableId).includes(key)) {
                isHidden = true;
            }
        }
    }

    if(this == currentCheck.sourceCViewer) {
        if(currentCheck.sourceAViewer) {
            if(Object.keys(currentCheck.sourceAViewer.HiddenResultIdVsTableId).includes(key)) {
                isHidden = true;
            }
        }
        if(currentCheck.sourceBViewer) {
            if(Object.keys(currentCheck.sourceBViewer.HiddenResultIdVsTableId).includes(key)) {
                isHidden = true;
            }
        }
        if(currentCheck.sourceDViewer) {
            if(Object.keys(currentCheck.sourceDViewer.HiddenResultIdVsTableId).includes(key)) {
                isHidden = true;
            }
        }
    }

    if(this == currentCheck.sourceDViewer) {
        if(currentCheck.sourceAViewer) {
            if(Object.keys(currentCheck.sourceAViewer.HiddenResultIdVsTableId).includes(key)) {
                isHidden = true;
            }
        }
        if(currentCheck.sourceBViewer) {
            if(Object.keys(currentCheck.sourceBViewer.HiddenResultIdVsTableId).includes(key)) {
                isHidden = true;
            }
        }
        if(currentCheck.sourceCViewer) {
            if(Object.keys(currentCheck.sourceCViewer.HiddenResultIdVsTableId).includes(key)) {
                isHidden = true;
            }
        }
    }

    return isHidden;
}

ReviewViewerInterface.prototype.ShowHiddenRows = function() {
    var checkComponentRows = [];
    var currentCheck = model.checks[model.currentCheck];
    if(model.currentCheck == "comparison") {
        if(currentCheck.sourceAViewer && this == currentCheck.sourceAViewer) {
            var hiddenResultIdsSourceA = currentCheck.sourceAViewer.HiddenResultIdVsTableId;

            for(var hiddenObj in hiddenResultIdsSourceA) {
                var isHidden = this.CheckIfMatchedElementIsHidden(hiddenObj);
                if(!isHidden) {
                    var dataGrid = $(hiddenResultIdsSourceA[hiddenObj]).dxDataGrid("instance");
                    var rowsData = dataGrid.getVisibleRows(); 
                    for(var i = 0; i < rowsData.length; i++) {
                        if(hiddenObj == rowsData[i].key) {
                            checkComponentRows.push(dataGrid.getRowElement(rowsData[i].rowIndex)[0]);
                            break;
                        }
                    }
                }
                delete currentCheck.sourceAViewer.HiddenResultIdVsTableId[hiddenObj];
            }
            currentCheck["reviewTable"].HighlightHiddenRows(false, checkComponentRows);
        } 
        
        if(currentCheck.sourceBViewer && this == currentCheck.sourceBViewer) {
            var hiddenResultIdsSourceB = currentCheck.sourceBViewer.HiddenResultIdVsTableId;

            for(var hiddenObj in hiddenResultIdsSourceB) {
                var isHidden = this.CheckIfMatchedElementIsHidden(hiddenObj);
                if(!isHidden) {
                    var dataGrid = $(hiddenResultIdsSourceB[hiddenObj]).dxDataGrid("instance");
                    var rowsData = dataGrid.getVisibleRows(); 
                    for(var i = 0; i < rowsData.length; i++) {
                        if(hiddenObj == rowsData[i].key) {
                            checkComponentRows.push(dataGrid.getRowElement(rowsData[i].rowIndex)[0]);
                            break;
                        }
                    }
                }
                delete currentCheck.sourceBViewer.HiddenResultIdVsTableId[hiddenObj];
            }
            currentCheck["reviewTable"].HighlightHiddenRows(false, checkComponentRows);
        }   
    }
    else {
        var hiddenResultIdsSource = currentCheck.viewer.HiddenResultIdVsTableId;

        for(var hiddenObj in hiddenResultIdsSource) {
            var dataGrid = $(hiddenResultIdsSource[hiddenObj]).dxDataGrid("instance");
            var rowsData = dataGrid.getVisibleRows(); 
            for(var i = 0; i < rowsData.length; i++) {
                if(hiddenObj == rowsData[i].key) {
                    checkComponentRows.push(dataGrid.getRowElement(rowsData[i].rowIndex)[0]);
                    break;
                }
            }
            delete currentCheck.viewer.HiddenResultIdVsTableId[hiddenObj];
        }
        currentCheck["reviewTable"].HighlightHiddenRows(false, checkComponentRows);
    }
}
