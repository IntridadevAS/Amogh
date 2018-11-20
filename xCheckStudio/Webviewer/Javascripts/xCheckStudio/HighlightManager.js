function HighlightManager(viewer) {

    this.Viewer = viewer;

    this.SuccessColor = Communicator.Color.green();
    this.ErrorColor = Communicator.Color.red();
    this.WarningColor = Communicator.Color.yellow();
    this.NoMatchColor = Communicator.Color.blue();
    this.NoValueColor = Communicator.Color.white();
   
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

    HighlightManager.prototype.changeComponentColor = function (componentIdentifier, status) {

        var nodeId = this.getNodeIdFromComponentIdentifier(componentIdentifier);
        if (nodeId === undefined) {
            return;
        }

        var color;
        if (status.toLowerCase() === ("Success").toLowerCase()) {
            color = this.SuccessColor;
        }
        else if (status.toLowerCase() === ("Error").toLowerCase()) {
            color = this.ErrorColor;
        }
        else if (status.toLowerCase() === ("Warning").toLowerCase()) {
            color = this.WarningColor;
        }
        else if (status.toLowerCase() === ("No Match").toLowerCase()) {
            color = this.NoMatchColor;
        }
        else if (status.toLowerCase() === ("No Value").toLowerCase()) {
            color = this.NoValueColor;
        }
        else {
            return;
        }

        // set nodes face and line colors
        this.Viewer.model.setNodesFaceColor([nodeId], color);
        this.Viewer.model.setNodesLineColor([nodeId], color);
    }

    HighlightManager.prototype.highlightNodeInViewer = function (nodeId) {
        this.Viewer.selectionManager.selectNode(nodeId);
        this.Viewer.view.fitNodes([nodeId]);
    }
}