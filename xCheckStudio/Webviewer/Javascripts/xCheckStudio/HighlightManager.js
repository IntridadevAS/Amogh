var SuccessColor = "#70db70";
var ErrorColor = "#ff4d4d";
var WarningColor = "#ffff99";
var NoMatchColor ="#ccccff";
var NoValueColor = "#f2f2f2";

function HighlightManager(viewer) {
    
    this.Viewer = viewer;  
   
    this.componentIdVsComponentData = {};
    this.nodeIdVsComponentData = {};

    HighlightManager.prototype.getNodeIdFromComponentIdentifier = function (componentIdentifier) {

        if (componentIdentifier === this._selectedComponentId) {
            return undefined;
        }

        if (!(componentIdentifier in this.componentIdVsComponentData)) {
            return undefined;
        }

        this._selectedComponentId = componentIdentifier;

        var component_data = this.componentIdVsComponentData[componentIdentifier];
        var nodeId = component_data.NodeId;

        return nodeId;
    }

    HighlightManager.prototype.changeComponentColor = function (componentIdentifier,
                                                                componentRow, 
                                                                status) {

        var nodeId = this.getNodeIdFromComponentIdentifier(componentIdentifier);
        if (nodeId === undefined) {
            return;
        }

        var color;
        if (status.toLowerCase() === ("OK").toLowerCase()) {
            color = SuccessColor;
        }
        else if (status.toLowerCase() === ("Error").toLowerCase()) {
            color = ErrorColor;
        }
        else if (status.toLowerCase() === ("Warning").toLowerCase()) {
            color = WarningColor;
        }
        else if (status.toLowerCase() === ("No Match").toLowerCase()) {
            color = NoMatchColor;
        }
        else if (status.toLowerCase() === ("No Value").toLowerCase()) {
            color = NoValueColor;
        }
        else {
            return;
        }

        // set nodes face and line colors
        var rgbColor = xCheckStudio.Util.hexToRgb(color);
        var communicatorColor = new Communicator.Color(rgbColor.r, rgbColor.g, rgbColor.b);
        this.Viewer.model.setNodesFaceColor([nodeId], communicatorColor);
        this.Viewer.model.setNodesLineColor([nodeId], communicatorColor);

        // set the component row color in main review table
        //componentRow.style.backgroundColor =  xCheckStudio.Util.rgbToHex(color.r, color.g, color.b);     
        componentRow.style.backgroundColor =   color;
    }

    HighlightManager.prototype.highlightNodeInViewer = function (nodeId) {
        this.Viewer.selectionManager.selectNode(nodeId);
        this.Viewer.view.fitNodes([nodeId]);
    }
}