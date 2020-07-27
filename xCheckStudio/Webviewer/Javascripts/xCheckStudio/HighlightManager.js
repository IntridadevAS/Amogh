var SuccessColor = "#c9ffcf";
var ErrorColor = "#fad9d7";
var HoopsViewerSuccessColor = "#74b741";
var HoopsViewerErrorColor = "#FF0000";
var HoopsViewerWarningColor = "#fff729";
var WarningColor = "#f9ffc7";
var NoMatchColor = "#dddbff"
var NoValueColor = "#f2f2f2";
var AcceptedColor = "#e8ffeb";
var PropertyAcceptedColor = "#ffff99";
var SelectedRowColor = "#e6e8e8";
var HiddenElementTextColor = "#b3b5b5";
var MissingItemsColor = "#dddbff";

function HighlightManager(viewer,
    componentIdVsComponentData,
    nodeIdVsComponentData) {

    this.Viewer = viewer;

    this.ComponentIdVsComponentData = componentIdVsComponentData
    this.NodeIdVsComponentData = nodeIdVsComponentData;
    
    HighlightManager.prototype.changeComponentColorInViewer = function (component, override, parentComponent) {    
        
        nodeIdString = component.NodeId;
        var hexColor = xCheckStudio.Util.getComponentHexColor(component, override, parentComponent);
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
    }

    HighlightManager.prototype.setViewOrientation = function (orienatation) {
        this.Viewer.view.setViewOrientation(orienatation, Communicator.DefaultTransitionDuration);
    }
}