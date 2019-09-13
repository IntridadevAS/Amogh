function ReviewViewerInterface(viewerOptions,
    componentIdVsComponentData,
    nodeIdVsComponentData,
    reviewManager) {

    this.ViewerOptions = viewerOptions;
    this.selectedNodeId = null;
    this.selectedComponentId = null;

    this.ComponentIdVsComponentData = componentIdVsComponentData;
    this.NodeIdVsComponentData = nodeIdVsComponentData;
    this.NodeIdStatusData = {};

    this.ReviewManager = reviewManager;
    this.SelectedComponentRowFromSheetA;
    this.SelectedComponentRowFromSheetB;

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

ReviewViewerInterface.prototype.IsComparisonReviewManager = function () {
    if (this.ReviewManager.MainReviewTableContainer == "ComparisonMainReviewCell") {
        return true;
    }
    return false;
}

ReviewViewerInterface.prototype.IsComplianceReviewManager = function () {
    if (this.ReviewManager.MainReviewTableContainer.includes("Compliance")) {
        return true;
    }
    return false;
}

ReviewViewerInterface.prototype.GetComparisonCheckComponentData = function (reviewTableRow) {
    var _this = this;
    var SourceA = reviewTableRow.cells[ComparisonColumns.SourceAName].innerText;
    var SourceB = reviewTableRow.cells[ComparisonColumns.SourceBName].innerText;
    var rowData = {};
    var ContainerDiv = this.ReviewManager.GetReviewTableId(reviewTableRow);
    $(function () {
        var data = $("#" + ContainerDiv).data("igGrid").dataSource.dataView();
        for (var id in data) {
            if (data[id].SourceA.trim() == SourceA.trim() &&
                data[id].SourceB.trim() == SourceB.trim()) {
                rowData['Status'] = data[id].Status;
                rowData['SourceBName'] = data[id].SourceB;
                rowData['SourceAName'] = data[id].SourceA;
                rowData['ResultId'] = data[id].ID;
                rowData['GroupId'] = data[id].groupId;
                rowData['SourceANodeId'] = data[id].SourceANodeId;
                rowData['SourceBNodeId'] = data[id].SourceBNodeId;
                break;
            }
        }
    });
    return rowData;
}

ReviewViewerInterface.prototype.GetComplianceCheckComponentData = function (reviewTableRow) {
    var SourceA = reviewTableRow.cells[ComplianceColumns.SourceName].innerText;
    var rowData = {};
    var ContainerDiv = this.ReviewManager.GetReviewTableId(reviewTableRow);
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

/* 3D viewer interface */
function Review3DViewerInterface(viewerOptions,
    componentIdVsComponentData,
    nodeIdVsComponentData,
    reviewManager) {
    // call super constructor
    ReviewViewerInterface.call(this, viewerOptions,
        componentIdVsComponentData,
        nodeIdVsComponentData,
        reviewManager);
}
// assign SelectionManager's method to this class
Review3DViewerInterface.prototype = Object.create(ReviewViewerInterface.prototype);
Review3DViewerInterface.prototype.constructor = Review3DViewerInterface;


Review3DViewerInterface.prototype.Is3DViewer = function() {
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
    this.setViewerBackgroundColor();

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

            // create nav cube
            showNavigationCube(viewer);

            _this.highlightComponentsfromResult();
        },
        selectionArray: function (selections) {
            if (selections.length === 0
                && _this.selectedNodeId) {
                _this.unHighlightAll();
                return;
            }

            for (var i = 0; i < selections.length; i++) {
                var selection = selections[i];
                var sel = selection.getSelection();

                _this.onSelection(selection);

                // if translucency control is on
                if (viewer._params.containerId in translucencyManagers) {
                    translucencyManagers[viewer._params.containerId].ComponentSelected(_this.selectedNodeId);
                }
            }
        },

        contextMenu: function (position) {

            currentViewer = viewer;
            _this.menu(event.clientX, event.clientY);
        },
    });

    window.onresize = function () {
        viewer.resizeCanvas();
    };
};

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

Review3DViewerInterface.prototype.highlightComponentsfromResult = function () {

    for (var id in this.NodeIdStatusData) {
        var component = this.NodeIdStatusData[id];
        this.ChangeComponentColor(component, false, undefined);
    }
}

Review3DViewerInterface.prototype.unHighlightAll = function () {
    var _this = this;

    //_this.highlightManager.setViewOrientation(Communicator.ViewOrientation.Front);
    _this.selectedNodeId = undefined;
    _this.selectedComponentId = undefined;
    // highlight corresponding component in another viewer
    if (_this.ViewerOptions[0] === "viewerContainer1") {
        if (_this.ReviewManager.SourceBReviewViewerInterface !== undefined) {
            _this.ReviewManager.SourceBReviewViewerInterface.unHighlightComponent();

            _this.ReviewManager.SourceBReviewViewerInterface.selectedNodeId = undefined;
            _this.ReviewManager.SourceBReviewViewerInterface.selectedComponentId = undefined;
        }
        else if (_this.SelectedComponentRowFromSheetB !== undefined) {
            // reset color of row
            var rowIndex = _this.SelectedComponentRowFromSheetB.rowIndex;
            obj = Object.keys(_this.ReviewManager.checkStatusArrayB)
            var status = _this.ReviewManager.checkStatusArrayB[obj[0]][rowIndex]
            _this.ReviewManager.SelectionManager.ChangeBackgroundColor(_this.SelectedComponentRowFromSheetB, status);
            _this.SelectedComponentRowFromSheetB = undefined;
        }
    }
    else if (_this.ViewerOptions[0] === "viewerContainer2") {
        if (_this.ReviewManager.SourceAReviewViewerInterface !== undefined) {
            _this.ReviewManager.SourceAReviewViewerInterface.unHighlightComponent();

            _this.ReviewManager.SourceAReviewViewerInterface.selectedNodeId = undefined;
            _this.ReviewManager.SourceAReviewViewerInterface.selectedComponentId = undefined;
        }
        else if (_this.SelectedComponentRowFromSheetA !== undefined) {
            // reset color of row
            var rowIndex = _this.SelectedComponentRowFromSheetA.rowIndex;
            obj = Object.keys(_this.ReviewManager.checkStatusArrayA)
            var status = _this.ReviewManager.checkStatusArrayA[obj[0]][rowIndex]
            _this.ReviewManager.SelectionManager.ChangeBackgroundColor(_this.SelectedComponentRowFromSheetA, status);
            _this.SelectedComponentRowFromSheetA = undefined;
        }
    }

    // restore highlightcolor of selected row in main review table
    if (_this.ReviewManager.SelectionManager.HighlightedCheckComponentRow) {
        _this.ReviewManager.SelectionManager.RemoveHighlightColor(_this.ReviewManager.SelectionManager.HighlightedCheckComponentRow);
        _this.ReviewManager.SelectionManager.HighlightedCheckComponentRow = undefined;

        var parentTable = document.getElementById(_this.ReviewManager.DetailedReviewTableContainer);
        if (parentTable !== undefined) {
            parentTable.innerHTML = '';
        }
    }
}

Review3DViewerInterface.prototype.onSelection = function (selectionEvent) {
    var selection = selectionEvent.getSelection();

    if (!selection.isNodeSelection() ||
        this.selectedNodeId === selection.getNodeId()) {
        return;
    }

    this.selectedNodeId = selection.getNodeId();
    var model = this.Viewer.model;
    if (!model.isNodeLoaded(this.selectedNodeId)) {
        this.unHighlightComponent();
        this.unHighlightAll();

        return;
    }

    // select valid node
    this.SelectValidNode();

    if (!this.selectedNodeId ||
        model.getNodeType(this.selectedNodeId) === Communicator.NodeType.BodyInstance ||
        model.getNodeType(this.selectedNodeId) === Communicator.NodeType.Unknown) {
        return;
    }

    // get check component id
    var checkComponentData = undefined;
    if (this.ViewerOptions[0] === "viewerContainer1") {

        if (this.ReviewManager.SourceANodeIdvsCheckComponent !== undefined &&
            this.selectedNodeId in this.ReviewManager.SourceANodeIdvsCheckComponent) {
            checkComponentData = this.ReviewManager.SourceANodeIdvsCheckComponent[this.selectedNodeId];

            // // highlight component in second viewer
            // if (this.ReviewManager.SourceBReviewModuleViewerInterface &&
            //     checkComponentData['SourceBNodeId'] in this.ReviewManager.SourceBNodeIdvsCheckComponent) {
            //     this.ReviewManager.SourceBReviewModuleViewerInterface.highlightComponent(checkComponentData['SourceBNodeId']);
            // }
        }
        else if (this.ReviewManager.SourceNodeIdvsCheckComponent !== undefined &&
            this.selectedNodeId in this.ReviewManager.SourceNodeIdvsCheckComponent) {
            checkComponentData = this.ReviewManager.SourceNodeIdvsCheckComponent[this.selectedNodeId];
        }
    }
    else if (this.ViewerOptions[0] === "viewerContainer2") {
        if (this.ReviewManager.SourceBNodeIdvsCheckComponent !== undefined &&
            this.selectedNodeId in this.ReviewManager.SourceBNodeIdvsCheckComponent) {
            checkComponentData = this.ReviewManager.SourceBNodeIdvsCheckComponent[this.selectedNodeId];

            // // highlight component in first viewer
            // if (this.ReviewManager.SourceAReviewModuleViewerInterface &&
            //     checkComponentData['SourceANodeId'] in this.ReviewManager.SourceANodeIdvsCheckComponent) {
            //     this.ReviewManager.SourceAReviewModuleViewerInterface.highlightComponent(checkComponentData['SourceANodeId']);
            // }
        }
        else if (this.ReviewManager.SourceNodeIdvsCheckComponent !== undefined &&
            this.selectedNodeId in this.ReviewManager.SourceNodeIdvsCheckComponent) {
            checkComponentData = this.ReviewManager.SourceNodeIdvsCheckComponent[this.selectedNodeId];
        }
    }

    if (!checkComponentData) {
        return;
    }

       var reviewRow = this.GetReviewComponentRow(checkComponentData);
    if(!reviewRow)
    {
        this.unHighlightComponent();
        this.unHighlightAll();

        return;
    }

    // component group id which is container div for check components table of given row
    var containerDiv = this.ReviewManager.GetReviewTableId(reviewRow);

    var data = $("#" + containerDiv).data("igGrid").dataSource.dataView();
    var rowData = data[reviewRow.rowIndex];

    this.ReviewManager.OnCheckComponentRowClicked(rowData, containerDiv); 

    var reviewTable = this.ReviewManager.GetReviewTable(reviewRow);
    this.ReviewManager.SelectionManager.ScrollToHighlightedCheckComponentRow(reviewTable, 
                                                                             reviewRow, 
                                                                             this.ReviewManager.MainReviewTableContainer);          
};

ReviewViewerInterface.prototype.unHighlightComponent = function () {

    this.selectedNodeId = undefined;
    this.highlightManager.clearSelection();
    this.Viewer.view.fitWorld();
    // this.Viewer.view.setViewOrientation(Communicator.ViewOrientation.Front, Communicator.DefaultTransitionDuration);

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
        if (child.SubClass.toLowerCase() in this.DontColorComponents) {
            var dontColorComponent = this.DontColorComponents[child.SubClass.toLowerCase()];
            if (child.MainClass.toLowerCase() === dontColorComponent["mainClass"] &&
                component.MainClass.toLowerCase() === dontColorComponent["parentMainClass"]) {
                continue;
            }
        }

        // take care of color overriding from status components
        var overrideColorWithSeverityPreference = false;
        if (component.MainClass.toLowerCase() in this.OverrideSeverityColorComponents) {
            var overrideSeverityColorComponent = this.OverrideSeverityColorComponents[component.MainClass.toLowerCase()];
            if (overrideSeverityColorComponent.includes(child.MainClass.toLowerCase())) {
                overrideColorWithSeverityPreference = true;
            }
        }

        this.ChangeComponentColor(child, overrideColorWithSeverityPreference, component);
    }
}

Review3DViewerInterface.prototype.highlightComponent = function (nodeIdString) {

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

Review3DViewerInterface.prototype.IsNodeInCheckResults = function (node) {

    var nodeIdvsCheckComponent;
    // if comparison
    if (this.ViewerOptions[0] === "viewerContainer1") {
        nodeIdvsCheckComponent = this.ReviewManager.SourceANodeIdvsCheckComponent;
    }
    else if (this.ViewerOptions[0] === "viewerContainer2") {
        nodeIdvsCheckComponent = this.ReviewManager.SourceBNodeIdvsCheckComponent;
    }

    // if compliance
    if (!nodeIdvsCheckComponent &&
        this.ReviewManager.SourceNodeIdvsCheckComponent) {
        nodeIdvsCheckComponent = this.ReviewManager.SourceNodeIdvsCheckComponent;
    }

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
Review3DViewerInterface.prototype.GetReviewComponentRow = function (checkcComponentData) {
    var componentsGroupName = checkcComponentData["MainClass"];
    var mainReviewTableContainer = document.getElementById(this.ReviewManager.MainReviewTableContainer);
    if (!mainReviewTableContainer) {
        return undefined;
    }

    var doc = mainReviewTableContainer.getElementsByClassName("collapsible");
    for (var i = 0; i < doc.length; i++) {

        if (doc[i].innerHTML !== componentsGroupName) {
            continue;
        }
        var nextSibling = doc[i].nextSibling;

        var siblingCount = nextSibling.childElementCount;
        for (var j = 0; j < siblingCount; j++) {
            var child = doc[i].nextSibling.children[j];
            var childRows = child.getElementsByTagName("tr");
            for (var k = 2; k < childRows.length; k++) {

                var childRow = childRows[k];
                var childRowColumns = childRow.getElementsByTagName("td");
                var data = $("#" + componentsGroupName).data("igGrid").dataSource.dataView();
                var rowData = data[childRow.rowIndex];
                var checkComponentId;

                checkComponentId = rowData.ID;
                // if (childRowColumns.length === Object.keys(ComparisonColumns).length) {
                //     checkComponentId = childRowColumns[ComparisonColumns.ResultId].innerText
                // }
                // else if (childRowColumns.length === Object.keys(ComplianceColumns).length) {
                //     checkComponentId = childRowColumns[ComplianceColumns.ResultId].innerText
                // }
                // else {
                //     continue;
                // }

                //var checkComponentId = childRowColumns[ComparisonColumns.ResultId].innerText
                if (checkComponentId == checkcComponentData["Id"]) {

                    // // open collapsible area
                    // if (nextSibling.style.display != "block") {
                    //     nextSibling.style.display = "block";
                    // }

                    // if (this.ReviewManager.SelectionManager.HighlightedCheckComponentRow) {
                    //     this.ReviewManager.SelectionManager.RemoveHighlightColor(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow);
                    // }

                    // // highlight selected row
                    // this.ReviewManager.SelectionManager.ApplyHighlightColor(childRow)
                    // this.ReviewManager.populateDetailedReviewTable(childRow);
                    // this.ReviewManager.SelectionManager.HighlightedCheckComponentRow = childRow;

                    // // scroll to row                           
                    // var reviewTable = this.ReviewManager.GetReviewTable(childRow);
                    // reviewTable.scrollTop = childRow.offsetTop - childRow.offsetHeight;
                    // reviewTable.parentElement.parentElement.scrollTop = reviewTable.offsetTop;

                    //break;
                    return childRow;
                }
            }
        }
        //}
    }

    return undefined;
}

function Review1DViewerInterface(reviewManager, 
    sourceAComponents, 
    sourceBComponents) {
    // call super constructor
    ReviewViewerInterface.call(this, null, null, null, reviewManager);
    this.ActiveSheetName = ""; 
    this.SourceAComponents = sourceAComponents;
    this.SourceBComponents = sourceBComponents;
    this.checkStatusArrayA = {};
    this.checkStatusArrayB = {};

    if(this.ReviewManager.ComparisonCheckManager) {
        this.CheckManager = this.ReviewManager.ComparisonCheckManager
    } 
    else {
        this.CheckManager = this.ReviewManager.ComplianceCheckManager
    }    
    
    this.ComparisonManager;
    this.ComplianceManager;
}
// assign SelectionManager's method to this class
Review1DViewerInterface.prototype = Object.create(ReviewViewerInterface.prototype);
Review1DViewerInterface.prototype.constructor = Review1DViewerInterface;

Review1DViewerInterface.prototype.Is1DViewer = function() {
    return true;
}

Review1DViewerInterface.prototype.IsFirstViewer = function (viewerContainer) {
    if (viewerContainer === "#viewerContainer1") {
        return true;
    }

    return false;
}
Review1DViewerInterface.prototype.IsSecondViewer = function (viewerContainer) {
    if (viewerContainer === "#viewerContainer2") {
        return true;
    }

    return false;
}

Review1DViewerInterface.prototype.FirstViewerExists = function () {
    if (document.getElementById("viewerContainer1").innerHTML !== "") {
        return true;
    }

    return false;
}

Review1DViewerInterface.prototype.LoadSelectedSheetDataInViewer = function (viewerContainer,
    sheetName,
    CurrentReviewTableRowData) {

    this.ActiveSheetName = sheetName;
    this.ComparisonManager = this.IsComparisonReviewManager();
    this.ComplianceManager = this.IsComplianceReviewManager();
    // get class wise components                                                                                    
    var classWiseComponents = this.GetClasswiseComponentsBySheetName(viewerContainer, sheetName);
    if (!classWiseComponents) {
        return;
    }

    // current sheet in viewer
    var currentlyLoadedSheet = this.GetCurrentSheetInViewer(viewerContainer);

    //check if sheet is already loaded       
    if (sheetName === currentlyLoadedSheet) {
        if (this.ComparisonManager && CurrentReviewTableRowData.Status === "No Match") {
            if (viewerContainer === "viewerContainer1" &&
            CurrentReviewTableRowData.SourceAName === "") {
                if (this.SelectedComponentRowFromSheetA) {
                    this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayA,
                        this.SelectedComponentRowFromSheetA);
                }

                return;
            }
            else if (viewerContainer === "viewerContainer2" &&
            CurrentReviewTableRowData.SourceBName === "") {

                if (this.SelectedComponentRowFromSheetB) {
                    this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayB, 
                        this.SelectedComponentRowFromSheetB);
                }

                return;
            }
        }

        this.HighlightRowInSheetData(CurrentReviewTableRowData, viewerContainer);
        return;
    }

    if (classWiseComponents !== {}) {
        var componentProperties;
        for (var componentId in classWiseComponents) {
            componentProperties = classWiseComponents[componentId];
            break;
        }

        if (componentProperties === undefined) {
            return;
        }

        var column = {};
        columnHeaders = [];

        for (var i = 0; i < componentProperties.length; i++) {
            var compProperty = componentProperties[i];

            columnHeader = {};

            columnHeader["headerText"] = compProperty['name'];
            columnHeader["key"] = compProperty['name'];
            var type;
            if (compProperty['format'].toLowerCase() === "string") {
                type = "string";
            }
            else if (compProperty['format'].toLowerCase() === "number") {
                type = "number";
            }
            else {
                continue;
            }

            columnHeader["dataType"] = type;
            columnHeader["width"] = "90";
            columnHeaders.push(columnHeader);

            //tagnumber is for instruments XLS data sheet
            if (Object.keys(column).length <= 3) {
                if (compProperty['name'] === "ComponentClass" ||
                    compProperty['name'] === "Name" ||
                    compProperty['name'] === "Description" ||
                    compProperty['name'] === "Tagnumber") {
                    column[compProperty['name']] = i;
                }
            }
        }

        tableData = [];
        for (var componentId in classWiseComponents) {
            var component = classWiseComponents[componentId];

            tableRowContent = {};
            for (var i = 0; i < component.length; i++) {
                var compProperty = component[i];

                // get property value
                tableRowContent[compProperty['name']] = compProperty['value'];
            }

            tableData.push(tableRowContent);
        }


        // if (CurrentReviewTableRow.tagName.toLowerCase() !== "tr") {
        //     return;
        // }

        if (viewerContainer === "viewerContainer1") {
            this.checkStatusArrayA = {};
            this.SelectedComponentRowFromSheetA = undefined;

            this.LoadSheetTableData(columnHeaders, tableData, "#viewerContainer1", CurrentReviewTableRowData, column, sheetName);
            this.HighlightRowInSheetData(CurrentReviewTableRowData, "viewerContainer1");

            // keep track of currently loaded sheet data
            this.ReviewManager.SourceAViewerCurrentSheetLoaded = sheetName;
        }
        else if (viewerContainer === "viewerContainer2") {
            this.checkStatusArrayB = {};
            this.SelectedComponentRowFromSheetB = undefined;

            this.LoadSheetTableData(columnHeaders, tableData, "#viewerContainer2", CurrentReviewTableRowData, column, sheetName);
            this.HighlightRowInSheetData(CurrentReviewTableRowData, "viewerContainer2");

            // keep track of currently loaded sheet data
            this.ReviewManager.SourceBViewerCurrentSheetLoaded = sheetName;
        }
    }
};

Review1DViewerInterface.prototype.LoadSheetTableData = function (columnHeaders,
    tableData,
    viewerContainer,
    CurrentReviewTableRowData,
    column,
    sheetName) {

    var _this = this;
    if (viewerContainer === "#viewerContainer1" || viewerContainer === "#viewerContainer2") {
        $(function () {
            if(_this.ComparisonManager) {
                height = "270px";
            }
            else if(_this.ComplianceManager) {
                height = "450px";
            }
            
            $(viewerContainer).igGrid({
                width: "100%",
                height: height,
                columns: columnHeaders,
                autofitLastColumn: false,
                autoGenerateColumns: false,
                dataSource : tableData,
                responseDataKey: "results",
                fixedHeaders : true,
                autoCommit: true,
                features: [
                    {
                        name: "Selection",
                        mode: 'row',
                        multipleSelection: false,
                        rowSelectionChanging : function(evt, ui) {
                            _this.OnViewerRowClicked(ui.row.element[0], viewerContainer);
                        }
                    },
                ]
            });

        });

        _this.highlightSheetRowsFromCheckStatus(viewerContainer, CurrentReviewTableRowData, column, sheetName);
    }

    var container = document.getElementById(viewerContainer.replace("#", ""));
    container.style.margin = "0px";
    container.style.top = "0px"

};

Review1DViewerInterface.prototype.highlightSheetRowsFromCheckStatus = function (viewerContainer, reviewTableRowData, column, sheetName) {
    // var reviewTableElement = reviewTableRow.parentElement;
    // var reviewTableRows = reviewTableElement.getElementsByTagName("tr");

    var groupId = reviewTableRowData.GroupId;
    var checkGroup = this.CheckManager["CheckGroups"][groupId];
    var checkGroupComponents = checkGroup.CheckComponents;

    var id = viewerContainer.replace("#", "");
    var currentSheetDataTable = document.getElementById(id);
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var currentSheetRows = currentSheetDataTable.children[0].getElementsByTagName("tr");

    var checkStatusArray = {};
    for (var componentId in checkGroupComponents)
    {
        var CurrentReviewTableRowData = checkGroupComponents[componentId];
        for (var j = 1; j < currentSheetRows.length; j++) {
            currentSheetRow = currentSheetRows[j];
            var componentName;
            if (column['Name'] !== undefined) {
                componentName = currentSheetRow.cells[column['Name']].innerText;
            }
            else if (column['Tagnumber'] !== undefined) {
                componentName = currentSheetRow.cells[column['Tagnumber']].innerText;
            }

            var sourceComponentNames = {
                SourceAName: CurrentReviewTableRowData.SourceAName,
                SourceBName: CurrentReviewTableRowData.SourceBName
            }

            if (sourceComponentNames.SourceAName !== "" && sourceComponentNames.SourceAName === componentName) {
                var color = this.ReviewManager.SelectionManager.GetRowHighlightColor(CurrentReviewTableRowData.Status);
                for (var j = 0; j < currentSheetRow.cells.length; j++) {
                    cell = currentSheetRow.cells[j];
                    cell.style.backgroundColor = color;
                }
                checkStatusArray[currentSheetRow.rowIndex] = CurrentReviewTableRowData.Status;
                break;
            }
            else if (sourceComponentNames.SourceBName !== "" && sourceComponentNames.SourceBName === componentName) {
                var color = this.ReviewManager.SelectionManager.GetRowHighlightColor(CurrentReviewTableRowData.Status);
                for (var j = 0; j < currentSheetRow.cells.length; j++) {
                    cell = currentSheetRow.cells[j];
                    cell.style.backgroundColor = color;
                }
                checkStatusArray[currentSheetRow.rowIndex] = CurrentReviewTableRowData.Status;
                break;
            }
        }
    }

    if (viewerContainer === "#viewerContainer1") {
        this.checkStatusArrayA = {};
        this.checkStatusArrayA[sheetName] = checkStatusArray;
    }
    else if (viewerContainer === "#viewerContainer2") {
        this.checkStatusArrayB = {};
        this.checkStatusArrayB[sheetName] = checkStatusArray;
    }
}

Review1DViewerInterface.prototype.OnViewerRowClicked = function (row, viewerContainer) {

    if ((this.IsFirstViewer(viewerContainer) &&
        row === this.SelectedComponentRowFromSheetA) ||
        (this.IsSecondViewer(viewerContainer) &&
            row === this.SelectedComponentRowFromSheetB)) {
        return;
    }

    // highlight sheet data row
    this.ReviewManager.SelectionManager.ApplyHighlightColor(row);

    // highlight check result component row
    this.HighlightRowInMainReviewTable(row, viewerContainer);

    // highlight corresponding component data in another viewer
    // if (this.ReviewManager.IsFirstViewer(viewerContainer)) {

    //     if (this.ReviewManager.SecondViewerExists() &&
    //         this.ReviewManager.SourceBComponentExists(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow)) {
    //         if (this.SourceBComponents !== undefined) {
    //             this.HighlightRowInSheetData(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow, "viewerContainer2");
    //         }
    //         else if (this.SourceBViewerData !== undefined) {
    //             this.HighlightComponentInGraphicsViewer(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow)
    //         }
    //     }

    //     //for "no match" case unhighlight component 
    //     if (!this.ReviewManager.SourceBComponentExists(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow)) {

    //         if (this.ReviewManager.SourceBReviewViewerInterface) {
    //             this.ReviewManager.SourceBReviewViewerInterface.unHighlightComponent();
    //         }
    //         if (this.ReviewManager.SelectedComponentRowFromSheetB) {
    //             this.unhighlightSelectedSheetRowInviewer(this.ReviewManager.checkStatusArrayB, this.ReviewManager.SelectedComponentRowFromSheetB)
    //         }

    //     }
    // }
    // else if (this.ReviewManager.IsSecondViewer(viewerContainer)) {
    //     if (this.ReviewManager.FirstViewerExists() &&
    //         this.ReviewManager.SourceAComponentExists(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow)) {

    //         if (this.SourceAComponents !== undefined) {
    //             this.HighlightRowInSheetData(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow, "viewerContainer1");
    //         }
    //         else if (this.SourceAViewerData !== undefined) {
    //             this.HighlightComponentInGraphicsViewer(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow)
    //         }
    //     }
    //     //for "no match" case unhighlight component 
    //     if (!this.ReviewManager.SourceAComponentExists(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow)) {
    //         if (this.ReviewManager.SourceAReviewViewerInterface) {
    //             this.ReviewManager.SourceAReviewViewerInterface.unHighlightComponent();
    //         }

    //         if (this.ReviewManager.SelectionManager.HighlightedCheckComponentRow) {
    //             this.unhighlightSelectedSheetRowInviewer(this.ReviewManager.checkStatusArrayA, this.ReviewManager.SelectedComponentRowFromSheetA)
    //         }
    //     }

    // }
}

/* This method returns the corresponding comparison 
   check result row for selected sheet row*/
Review1DViewerInterface.prototype.GetCheckComponentForSheetRow = function (sheetDataRow, viewerContainer) {
    var containerId = viewerContainer.replace("#", "");
    var viewerContainerData = document.getElementById(containerId)

    if (!viewerContainerData) {
        return undefined;
    }

    var containerChildren = viewerContainerData.children;
    var columnHeaders = containerChildren[0].getElementsByTagName("th");
    var column = {};
    for (var i = 0; i < columnHeaders.length; i++) {
        columnHeader = columnHeaders[i];
        //tagnumber is for instruments XLS data sheet
        if (columnHeader.innerText.trim() === "ComponentClass" ||
            columnHeader.innerText.trim() === "Name" ||
            columnHeader.innerText.trim() === "Description" ||
            columnHeader.innerText.trim() === "Tagnumber") {
            column[columnHeader.innerText.trim()] = i;
        }
        if (Object.keys(column).length === 3) {
            break;
        }
    }

    var reviewTableId;

    if(this.ComparisonManager) {
        reviewTableId = "ComparisonMainReviewCell";
    }
    else if(this.ComplianceManager) {
        if (this.IsFirstViewer(viewerContainer))
        {
            reviewTableId = "SourceAComplianceMainReviewCell";
        }
        else{
            reviewTableId = "SourceBComplianceMainReviewCell";
        }
    }        

    var reviewTableData = document.getElementById(reviewTableId);
    var reviewTableRowsData = reviewTableData.getElementsByTagName("tr");

    for (var i = 0; i < reviewTableRowsData.length; i++) {
        reviewTableRow = reviewTableRowsData[i];
        if (reviewTableRow.cells.length === 0) {
            continue;
        }

        var componentName;
        if (column.Name !== undefined) {
            componentName = sheetDataRow.cells[column.Name].innerText;
        }
        else if (column.Tagnumber !== undefined) {
            componentName = sheetDataRow.cells[column.Tagnumber].innerText;
        }

        if(this.ComparisonManager) {
            if (componentName === reviewTableRow.cells[ComparisonColumns.SourceAName].innerText ||
                componentName === reviewTableRow.cells[ComparisonColumns.SourceBName].innerText) {
                var rowData = this.GetComparisonCheckComponentData(reviewTableRow);
                // var selectedComponentGroupId = reviewTableRow.cells[ComparisonColumns.GroupId].innerText
                this.highlightSheetRowsFromCheckStatus(viewerContainer, rowData, column, this.ActiveSheetName);
                return reviewTableRow;
            }
        }
        else if(this.ComplianceManager) {
            if(componentName === reviewTableRow.cells[ComplianceColumns.SourceName].innerText) {
                var rowData = this.GetComplianceCheckComponentData(reviewTableRow);
                this.highlightSheetRowsFromCheckStatus(viewerContainer, rowData, column, this.ActiveSheetName);
                return reviewTableRow;
            }    
        }    
    }

    return undefined;
}

Review1DViewerInterface.prototype.HighlightRowInMainReviewTable = function (sheetDataRow,
    viewerContainer) {

    var reviewTableRow = this.GetCheckComponentForSheetRow(sheetDataRow, viewerContainer);
    if (!reviewTableRow) {
        return;
    }

    // component group id which is container div for check components table of given row
    var containerDiv = this.ReviewManager.GetReviewTableId(reviewTableRow);
    var rowData;
    if(this.ComparisonManager) {
        rowData = this.GetComparisonCheckComponentData(reviewTableRow);
    }
    else if(this.ComplianceManager) {
        rowData = this.GetComplianceCheckComponentData(reviewTableRow);
    }

    this.ReviewManager.OnCheckComponentRowClicked(rowData, containerDiv);
    this.ReviewManager.SelectionManager.MaintainHighlightedRow(reviewTableRow);

    var reviewTable = this.ReviewManager.GetReviewTable(reviewTableRow);
    this.ReviewManager.SelectionManager.ScrollToHighlightedCheckComponentRow(reviewTable, reviewTableRow, this.ReviewManager.MainReviewTableContainer);
}

Review1DViewerInterface.prototype.GetClasswiseComponentsBySheetName = function (viewerContainer, sheetName) {

    if (viewerContainer === "viewerContainer1" &&
        sheetName in this.SourceAComponents) {
        return this.SourceAComponents[sheetName];
    }
    else if (viewerContainer === "viewerContainer2" &&
        sheetName in this.SourceBComponents) {
        return this.SourceBComponents[sheetName];

    }

    return undefined;
}

Review1DViewerInterface.prototype.GetCurrentSheetInViewer = function (viewerContainer) {

    if (viewerContainer === "viewerContainer1") {
        return this.ReviewManager.SourceAViewerCurrentSheetLoaded;
    }
    else if (viewerContainer === "viewerContainer2") {
        return this.ReviewManager.SourceBViewerCurrentSheetLoaded;
    }

    return undefined;
}

Review1DViewerInterface.prototype.unhighlightSelectedSheetRowInviewer = function (checkStatusArray,
    currentRow) {
    var rowIndex = currentRow.rowIndex;
    obj = Object.keys(checkStatusArray)
    var status = checkStatusArray[obj[0]][rowIndex]
    if (status !== undefined) {
        this.ReviewManager.SelectionManager.ChangeBackgroundColor(currentRow, status);
    }
    else {
        color = "#fffff"
        for (var j = 0; j < currentRow.cells.length; j++) {
            cell = currentRow.cells[j];
            cell.style.backgroundColor = color;
        }
    }
}

Review1DViewerInterface.prototype.HighlightRowInSheetData = function (CurrentReviewTableRowData, viewerContainer) {
    var containerId = viewerContainer.replace("#", "");
    var viewerContainerData = document.getElementById(containerId);

    if (viewerContainerData != undefined) {
        var containerChildren = viewerContainerData.children;
        // 0 index jsGrid header table
        var columnHeaders = containerChildren[0].getElementsByTagName("th");
        //1 index jsGrid table body
        var sheetDataTable = containerChildren[0];
        var sourceDataViewTableRows = sheetDataTable.getElementsByTagName("tr");
        var column = {};
        for (var i = 0; i < columnHeaders.length; i++) {
            columnHeader = columnHeaders[i];
            //tagnumber is for instruments XLS data sheet
            if (columnHeader.innerText.trim() === "ComponentClass" ||
                columnHeader.innerText.trim() === "Name" ||
                columnHeader.innerText.trim() === "Description" ||
                columnHeader.innerText.trim() === "Tagnumber") {
                column[columnHeader.innerText.trim()] = i;
            }
            if (Object.keys(column).length === 3) {
                break;
            }
        }
        for (var i = 0; i < sourceDataViewTableRows.length; i++) {
            currentRowInSourceTable = sourceDataViewTableRows[i];

            var componentName;
            if (column.Name !== undefined) {
                componentName = currentRowInSourceTable.cells[column.Name].innerText;
            }
            else if (column.Tagnumber !== undefined) {
                componentName = currentRowInSourceTable.cells[column.Tagnumber].innerText;
            }

            if(this.ComparisonManager) {
                if (CurrentReviewTableRowData.SourceAName === componentName ||
                    CurrentReviewTableRowData.SourceBName === componentName) {
                        this.HighlightComparisonViewerSheetDataRow(containerId, currentRowInSourceTable, containerChildren)
                        break;
                }
            }  
            else if(this.ComplianceManager) {
                if (CurrentReviewTableRowData.SourceName === componentName) {
                    this.HighlightComplianceViewerSheetDataRow(containerId, currentRowInSourceTable, containerChildren)
                    break;
                }
            }          

            // if (CurrentReviewTableRowData.SourceAName === componentName ||
            //     CurrentReviewTableRowData.SourceBName === componentName) {
            //     if (containerId === "viewerContainer1") {
            //         if (this.SelectedComponentRowFromSheetA) {
            //             this.ReviewManager.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayA, 
            //                 this.SelectedComponentRowFromSheetA);
            //         }

            //         this.SelectedComponentRowFromSheetA = currentRowInSourceTable;

            //         this.ReviewManager.SelectionManager.ApplyHighlightColor(this.SelectedComponentRowFromSheetA);

            //         var sheetDataTable1 = containerChildren[0];
            //         sheetDataTable1.focus();
            //         sheetDataTable1.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
            //     }
            //     if (containerId === "viewerContainer2") {

            //         if (this.SelectedComponentRowFromSheetB) {
            //             this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayB, this.SelectedComponentRowFromSheetB);
            //         }

            //         this.SelectedComponentRowFromSheetB = currentRowInSourceTable;

            //         this.ReviewManager.SelectionManager.ApplyHighlightColor(this.SelectedComponentRowFromSheetB);

            //         var sheetDataTable2 = containerChildren[0];
            //         sheetDataTable2.focus();
            //         sheetDataTable2.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
            //     }

            //     break;
            // }
        }
    }
}

Review1DViewerInterface.prototype.HighlightComparisonViewerSheetDataRow = function(containerId, currentRowInSourceTable, containerChildren) {
    if (containerId === "viewerContainer1") {
        if (this.SelectedComponentRowFromSheetA) {
            this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayA, 
                this.SelectedComponentRowFromSheetA);
        }

        this.SelectedComponentRowFromSheetA = currentRowInSourceTable;

        this.ReviewManager.SelectionManager.ApplyHighlightColor(this.SelectedComponentRowFromSheetA);

        var sheetDataTable1 = containerChildren[0];
        sheetDataTable1.focus();
        sheetDataTable1.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
    }
    if (containerId === "viewerContainer2") {

        if (this.SelectedComponentRowFromSheetB) {
            this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayB, this.SelectedComponentRowFromSheetB);
        }

        this.SelectedComponentRowFromSheetB = currentRowInSourceTable;

        this.ReviewManager.SelectionManager.ApplyHighlightColor(this.SelectedComponentRowFromSheetB);

        var sheetDataTable2 = containerChildren[0];
        sheetDataTable2.focus();
        sheetDataTable2.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
    }
}

Review1DViewerInterface.prototype.HighlightComplianceViewerSheetDataRow = function(containerId, currentRowInSourceTable, containerChildren) {
    if (containerId === "viewerContainer1") {
        if (this.SelectedComponentRowFromSheetA) {
            this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayA, 
                this.SelectedComponentRowFromSheetA);
        }
        this.SelectedComponentRowFromSheetA = currentRowInSourceTable;
        this.ReviewManager.SelectionManager.ApplyHighlightColor(this.SelectedComponentRowFromSheetA);
    }
    else if (containerId === "viewerContainer2") {
        if (this.SelectedComponentRowFromSheetB) {
            this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayB, 
                this.SelectedComponentRowFromSheetB);
        }
        this.SelectedComponentRowFromSheetB = currentRowInSourceTable;
        this.ReviewManager.SelectionManager.ApplyHighlightColor(this.SelectedComponentRowFromSheetB);
    }

    // if (!this.ReviewManager.SelectionManager.MaintainHighlightedRow(currentRowInSourceTable)) {
    //     return;
    // }

    var sheetDataTable = containerChildren[0];
    sheetDataTable.focus();
    sheetDataTable.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
}

