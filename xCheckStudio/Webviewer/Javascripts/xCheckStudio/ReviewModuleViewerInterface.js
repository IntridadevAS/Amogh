var currentViewer;
var ReviewModuleViewerInterface = function (viewerOptions,
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

    this.DontColorComponents = {
        "centerline": {
            "mainClass": "component",
            "parentMainClass": "pipingnetworksegment"
        }
    };

    // format
    //  this.OverrideSeverityColorComponents = {
    //     "parent Component mainClass" :  ["child componet class 1",....., "child componet class n"]
    // }
    this.OverrideSeverityColorComponents = {
        "pipingnetworksystem": ["pipingnetworksegment"],
        "pipe": ["bran"],
        "hvac": ["bran"],
        "equi": ["cone", "cyli", "dish"]
    };

    ReviewModuleViewerInterface.prototype.setupViewer = function (width, height) {

        // create and start viewer
        var viewer = new Communicator.WebViewer({
            containerId: viewerOptions[0], //"myContainer",          
            endpointUri: viewerOptions[1], //"uploads/scs/bearingassembly.scs"	
        });

        viewer.start();
        this.Viewer = viewer;
        this.bindEvents(viewer);
        this.setViewerBackgroundColor();

        var viewerContainer = document.getElementById(viewerOptions[0]);
        viewerContainer.style.width = width;//"550px"
        viewerContainer.style.height = height;//"250px"
        // create highlight manager
        this.highlightManager = new HighlightManager(viewer, this.ComponentIdVsComponentData, this.NodeIdVsComponentData);
    }

    ReviewModuleViewerInterface.prototype.highlightComponentsfromResult = function () {

        for (var id in this.NodeIdStatusData) {
            var component = this.NodeIdStatusData[id];
            this.ChangeComponentColor(component, false, undefined);
        }
    }

    ReviewModuleViewerInterface.prototype.ChangeComponentColor = function (component, override, parentComponent) {
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

    ReviewModuleViewerInterface.prototype.unHighlightAll = function () {
        var _this = this;

        //_this.highlightManager.setViewOrientation(Communicator.ViewOrientation.Front);
        _this.selectedNodeId = undefined;
        _this.selectedComponentId = undefined;
        // highlight corresponding component in another viewer
        if (_this.ViewerOptions[0] === "viewerContainer1") {
            if (_this.ReviewManager.SourceBReviewModuleViewerInterface !== undefined) {
                _this.ReviewManager.SourceBReviewModuleViewerInterface.unHighlightComponent();

                _this.ReviewManager.SourceBReviewModuleViewerInterface.selectedNodeId = undefined;
                _this.ReviewManager.SourceBReviewModuleViewerInterface.selectedComponentId = undefined;
            }
            else if (_this.ReviewManager.SelectedComponentRowFromSheetB !== undefined) {
                // reset color of row
                var rowIndex = _this.ReviewManager.SelectedComponentRowFromSheetB.rowIndex;
                obj = Object.keys(_this.ReviewManager.checkStatusArrayB)
                var status = _this.ReviewManager.checkStatusArrayB[obj[0]][rowIndex]
                _this.ReviewManager.SelectionManager.ChangeBackgroundColor(_this.ReviewManager.SelectedComponentRowFromSheetB, status);
                _this.ReviewManager.SelectedComponentRowFromSheetB = undefined;
            }
        }
        else if (_this.ViewerOptions[0] === "viewerContainer2") {
            if (_this.ReviewManager.SourceAReviewModuleViewerInterface !== undefined) {
                _this.ReviewManager.SourceAReviewModuleViewerInterface.unHighlightComponent();

                _this.ReviewManager.SourceAReviewModuleViewerInterface.selectedNodeId = undefined;
                _this.ReviewManager.SourceAReviewModuleViewerInterface.selectedComponentId = undefined;
            }
            else if (_this.ReviewManager.SelectedComponentRowFromSheetA !== undefined) {
                // reset color of row
                var rowIndex = _this.ReviewManager.SelectedComponentRowFromSheetA.rowIndex;
                obj = Object.keys(_this.ReviewManager.checkStatusArrayA)
                var status = _this.ReviewManager.checkStatusArrayA[obj[0]][rowIndex]
                _this.ReviewManager.SelectionManager.ChangeBackgroundColor(_this.ReviewManager.SelectedComponentRowFromSheetA, status);
                _this.ReviewManager.SelectedComponentRowFromSheetA = undefined;
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

    ReviewModuleViewerInterface.prototype.bindEvents = function (viewer) {

        var _this = this;

        viewer.setCallbacks({
            firstModelLoaded: function () {
                viewer.view.fitWorld();

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
    };

    ReviewModuleViewerInterface.prototype.menu = function (x, y) {
        var i = document.getElementById("menu").style;
        i.top = y + "px";
        i.left = x + "px";
        i.visibility = "visible";
        i.opacity = "1";
    }

    ReviewModuleViewerInterface.prototype.setViewerBackgroundColor = function () {
        var backgroundTopColor = xCheckStudio.Util.hexToRgb("#000000");
        var backgroundBottomColor = xCheckStudio.Util.hexToRgb("#F8F9F9");

        this.Viewer.view.setBackgroundColor(backgroundTopColor, backgroundBottomColor);

        // set back face visibility
        this.Viewer.view.setBackfacesVisible(true);
    }

    ReviewModuleViewerInterface.prototype.highlightComponent = function (nodeIdString) {

        var nodeId = Number(nodeIdString);
        if (!nodeIdString ||
            nodeId === NaN) {
            this.unHighlightComponent();
            return;
        }

        this.selectedNodeId = nodeId;

        this.highlightManager.highlightNodeInViewer(nodeId);
    };

    ReviewModuleViewerInterface.prototype.unHighlightComponent = function () {

        this.selectedNodeId = undefined;
        this.highlightManager.clearSelection();
        this.Viewer.view.fitWorld();
        // this.Viewer.view.setViewOrientation(Communicator.ViewOrientation.Front, Communicator.DefaultTransitionDuration);

    }

    ReviewModuleViewerInterface.prototype.onSelection = function (selectionEvent) {
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
        this.ReviewManager.OnCheckComponentRowClicked(reviewRow, containerDiv); 

        var reviewTable = this.ReviewManager.GetReviewTable(reviewRow);
        this.ReviewManager.SelectionManager.ScrollToHighlightedCheckComponentRow(reviewTable, 
                                                                                 reviewRow, 
                                                                                 this.ReviewManager.MainReviewTableContainer);          
    };

    ReviewModuleViewerInterface.prototype.IsNodeInCheckResults = function (node) {

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

    ReviewModuleViewerInterface.prototype.SelectValidNode = function () {
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

    /* This function returns the comparison check 
    component row for given check component data */
    ReviewModuleViewerInterface.prototype.GetReviewComponentRow = function (checkcComponentData) {
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
                for (var k = 0; k < childRows.length; k++) {

                    var childRow = childRows[k];
                    var childRowColumns = childRow.getElementsByTagName("td");

                    var checkComponentId;
                    if (childRowColumns.length === Object.keys(ComparisonColumns).length) {
                        checkComponentId = childRowColumns[ComparisonColumns.ResultId].innerText
                    }
                    else if (childRowColumns.length === Object.keys(ComplianceColumns).length) {
                        checkComponentId = childRowColumns[ComplianceColumns.ResultId].innerText
                    }
                    else {
                        continue;
                    }

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

    // ReviewModuleViewerInterface.prototype.HighlightReviewComponent = function (checkcComponentData) {
    //     var componentsGroupName = checkcComponentData["MainClass"];
    //     var mainReviewTableContainer = document.getElementById(this.ReviewManager.MainReviewTableContainer);
    //     if (!mainReviewTableContainer) {
    //         return false;
    //     }

    //     var doc = mainReviewTableContainer.getElementsByClassName("collapsible");
    //     for (var i = 0; i < doc.length; i++) {
    //         // var result = doc[i].innerHTML.split("-");

    //         if (doc[i].innerHTML === componentsGroupName) {
    //             var nextSibling = doc[i].nextSibling;

    //             var siblingCount = nextSibling.childElementCount;
    //             for (var j = 0; j < siblingCount; j++) {
    //                 var child = doc[i].nextSibling.children[j];
    //                 var childRows = child.getElementsByTagName("tr");
    //                 for (var k = 0; k < childRows.length; k++) {

    //                     var childRow = childRows[k];
    //                     var childRowColumns = childRow.getElementsByTagName("td");

    //                     var checkComponentId;
    //                     if (childRowColumns.length === Object.keys(ComparisonColumns).length) {
    //                         checkComponentId = childRowColumns[ComparisonColumns.ResultId].innerText
    //                     }
    //                     else if (childRowColumns.length === Object.keys(ComplianceColumns).length) {
    //                         checkComponentId = childRowColumns[ComplianceColumns.ResultId].innerText
    //                     }
    //                     else {
    //                         continue;
    //                     }

    //                     //var checkComponentId = childRowColumns[ComparisonColumns.ResultId].innerText
    //                     if (checkComponentId == checkcComponentData["Id"]) {
    //                         // open collapsible area
    //                         if (nextSibling.style.display != "block") {
    //                             nextSibling.style.display = "block";
    //                         }

    //                         if (this.ReviewManager.SelectionManager.HighlightedCheckComponentRow) {
    //                             this.ReviewManager.SelectionManager.RemoveHighlightColor(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow);
    //                         }

    //                         // highlight selected row
    //                         this.ReviewManager.SelectionManager.ApplyHighlightColor(childRow)
    //                         this.ReviewManager.populateDetailedReviewTable(childRow);
    //                         this.ReviewManager.SelectionManager.HighlightedCheckComponentRow = childRow;

    //                         // scroll to row                           
    //                         var reviewTable = this.ReviewManager.GetReviewTable(childRow);
    //                         reviewTable.scrollTop = childRow.offsetTop - childRow.offsetHeight;
    //                         reviewTable.parentElement.parentElement.scrollTop = reviewTable.offsetTop;

    //                         //break;
    //                         return true;
    //                     }
    //                 }
    //             }
    //         }
    //     }

    //     return false;
    // }
}

