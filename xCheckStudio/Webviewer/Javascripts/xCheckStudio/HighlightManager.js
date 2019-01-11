var SuccessColor = "#c6f2cb";//"#70db70";
var ErrorColor = "#fad9d7";//"#ff4d4d";
var WarningColor = "#f9ffc7";//"#ffff99";
var NoMatchColor = "#dddbff"//"#ccccff";
var NoValueColor = "#f2f2f2";

function HighlightManager(viewer,
    componentIdVsComponentData,
    nodeIdVsComponentData) {

    this.Viewer = viewer;

    this.ComponentIdVsComponentData = componentIdVsComponentData
    this.NodeIdVsComponentData = nodeIdVsComponentData;

    HighlightManager.prototype.getNodeIdFromComponentIdentifier = function (componentIdentifier) {

        if (componentIdentifier === this._selectedComponentId) {
            return undefined;
        }

        if (!(componentIdentifier in this.ComponentIdVsComponentData)) {
            return undefined;
        }

        this._selectedComponentId = componentIdentifier;

        var component_data = this.ComponentIdVsComponentData[componentIdentifier];
        var nodeId = component_data.NodeId;

        return nodeId;
    }


    HighlightManager.prototype.changeComponentColorInViewer = function (componentIdentifier,
        /*componentRow,*/
        status) {

        var hexColor = xCheckStudio.Util.getComponentHexColor(status);
        if (hexColor === undefined) {
            return;
        }

        var nodeId = this.getNodeIdFromComponentIdentifier(componentIdentifier);
        if (nodeId === undefined) {
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
}