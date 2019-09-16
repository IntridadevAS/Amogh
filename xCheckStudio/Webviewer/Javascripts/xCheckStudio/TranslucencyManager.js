var translucencyManagers = {};
function TranslucencyManager(viewers,
    selectedNodes,
    controls) {
    this.ChangedComponents = {};
    this.Viewers = viewers;

    this.SelectedNodes = selectedNodes;
   
    this.Controls = controls;
    this.Slider = document.getElementById(controls["slider"]);
    this.OutputFiled = document.getElementById(controls["output"]);
    this.OverlayField = document.getElementById(controls["overlay"]);

    /* this iscomparison argument is valid, only when the translucency is activated for components selected in 
    */
    TranslucencyManager.prototype.Start = function () {
        if (this.Viewers.length === 0 ||
            !this.Slider ||
            !this.OutputFiled ||
            !this.OverlayField) {
            return;
        }

        this.OverlayField.style.display = "block";
        this.OutputFiled.innerHTML = this.Slider.value;
        
        var _this = this;
        this.Slider.oninput = function () {

            for (var i = 0; i < _this.Viewers.length; i++) {
                _this.onTranslucencyValueChanged(_this.Viewers[i], this.value);

            }
        }
    }

    TranslucencyManager.prototype.ShowTranslucencyValue = function (value) {     
        if (!this.OutputFiled) {
            return;
        }

        this.OutputFiled.innerHTML = value;
    }

    TranslucencyManager.prototype.onTranslucencyValueChanged = function (viewer, value) {

        // show translucency value
        this.ShowTranslucencyValue(value);

        if (viewer) {

            var selectedNodes = [];
            if (this.SelectedNodes &&
                viewer._params.containerId in this.SelectedNodes) {
                selectedNodes = this.SelectedNodes[viewer._params.containerId];
            }
            else {
                var selectionManager = viewer.selectionManager;
                selectionManager.each(function (selectionItem) {
                    if (selectionItem.isNodeSelection()) {
                        selectedNodes.push(selectionItem._nodeId);
                    }
                });
            }

            // maintain changed components
            for (var i = 0; i < selectedNodes.length; i++) {
                var selectedNode = selectedNodes[i];

                if (viewer._params.containerId in this.ChangedComponents) {
                    this.ChangedComponents[viewer._params.containerId][selectedNode] = Number(value);
                }
                else {
                    var changedNodes = {};
                    changedNodes[selectedNode] = Number(value);
                    this.ChangedComponents[viewer._params.containerId] = changedNodes;
                }
            }

            viewer.model.setNodesOpacity(selectedNodes, Number(value));
        }
    }

    TranslucencyManager.prototype.Stop = function () {
        if (this.Viewers.length > 0) {

            // reset opacity for changed components
            this.ResetTranslucensy();

            if (!this.Slider ||
                !this.OverlayField) {
                return;
            }

            this.Slider.value = 1;
            this.OverlayField.style.display = "none";
        }
    }

    TranslucencyManager.prototype.ResetTranslucensy = function () {
        if (this.Viewers.length === 0) {
            return;
        }

        for (var i = 0; i < this.Viewers.length; i++) {
            var viewer = this.Viewers[i];
            if (!(viewer._params.containerId in this.ChangedComponents)) {
                continue;
            }

            var changedNodes = Object.keys(this.ChangedComponents[viewer._params.containerId]);
            var nodes = [];
            for (var ii = 0; ii < changedNodes.length; ii++) {
                nodes.push(Number(changedNodes[ii]));
            }

            // reset opacity
            viewer.model.resetNodesOpacity(nodes);
        }

        // clear the changed components object
        this.ChangedComponents = {};
    }

    /* This method will be called only when the translucency is activated from viewer and 
    any component is viewer is selected*/
    TranslucencyManager.prototype.ComponentSelected = function (nodeId) {
        if (this.Viewers.length === 0) {
            return;
        }

        if (!this.Slider ||
            !this.OutputFiled) {
            return;
        }

        if (this.Viewers[0]._params.containerId in this.ChangedComponents &&
            nodeId in this.ChangedComponents[this.Viewers[0]._params.containerId]) {
            // set values
            this.Slider.value = this.ChangedComponents[this.Viewers[0]._params.containerId][nodeId];
        }
        else {
            // set values
            this.Slider.value = 1;
        }

        this.OutputFiled.innerHTML = this.Slider.value;
    }
}

function translucencyActive() {
    if (Object.keys(translucencyManagers).length > 0) {
        return true;
    }

    return false;
}

function activateTranslucencyInCurrentViewer() {
    if (currentViewer &&
        !(currentViewer._params.containerId in translucencyManagers) &&
        !("both" in translucencyManagers)) {
        return true;
    }

    return false;
}

function stopAllTranslucency() {

    for (var key in translucencyManagers) {
        translucencyManagers[key].Stop();
        delete translucencyManagers[key];
    }
}
