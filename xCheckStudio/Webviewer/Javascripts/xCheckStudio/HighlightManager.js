var SuccessColor = "#c6f2cb";//"#70db70";
var MatchedColor = "#f2edc6";
var ErrorColor = "#fad9d7";//"#ff4d4d";
var HoopsViewerErrorColor = "#FF0000";
var WarningColor = "#f9ffc7";//"#ffff99";
var NoMatchColor = "#dddbff"//"#ccccff";
var NoValueColor = "#f2f2f2";
var AcceptedColor = "#cbf287";
var PropertyAcceptedColor = "#ffff99";
var TransposedColor = "#ace396";

function HighlightManager(viewer,
    componentIdVsComponentData,
    nodeIdVsComponentData) {

    this.Viewer = viewer;

    this.ComponentIdVsComponentData = componentIdVsComponentData
    this.NodeIdVsComponentData = nodeIdVsComponentData;

    // HighlightManager.prototype.getNodeIdFromComponentIdentifier = function (componentIdentifier) {

    //     // if (componentIdentifier === this._selectedComponentId) {
    //     //     return undefined;
    //     // }

    //     if (!(componentIdentifier in this.ComponentIdVsComponentData)) {
    //         return undefined;
    //     }

    //     this._selectedComponentId = componentIdentifier;

    //     var component_data = this.ComponentIdVsComponentData[componentIdentifier];
    //     var nodeId = component_data.NodeId;

    //     return nodeId;
    // }


    HighlightManager.prototype.changeComponentColorInViewer = function (nodeIdString,      
                                                                        status) {    
                                                                            
        var hexColor = xCheckStudio.Util.getComponentHexColor(status);
        if (hexColor === undefined) {
            return;
        }
       
        var nodeId = Number(nodeIdString);
        if (nodeId === undefined ||
            isNaN(nodeId)) {
            return;
        }
       

        // set nodes face and line colors from status of compoentns
        var rgbColor = xCheckStudio.Util.hexToRgb(hexColor);
        var communicatorColor = new Communicator.Color(rgbColor.r, rgbColor.g, rgbColor.b);
        this.Viewer.model.setNodesFaceColor([nodeId], communicatorColor);
        this.Viewer.model.setNodesLineColor([nodeId], communicatorColor);
    }

    HighlightManager.prototype.highlightNodeInViewer = function (nodeId) {
        this.Viewer.selectionManager.selectNode(nodeId);
        this.Viewer.view.fitNodes([nodeId]);
    }

    HighlightManager.prototype.clearSelection = function () {
        this.Viewer.selectionManager.clear();  
        //this._selectedComponentId = "";      
    }

    HighlightManager.prototype.setViewOrientation = function (orienatation) {
        this.Viewer.view.setViewOrientation(orienatation, Communicator.DefaultTransitionDuration);
    }
}