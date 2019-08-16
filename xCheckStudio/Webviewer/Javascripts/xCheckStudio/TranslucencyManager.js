var translucencyManagers = {};
function TranslucencyManager(viewers,   
    selectedNodes,
    sliderId) {
    this.ChangedComponents = {};
    this.Viewers = viewers;
    
    this.SelectedNodes = selectedNodes;
    this.SliderId = sliderId;
    /* this iscomparison argument is valid, only when the translucency is activated for components selected in 
    */
    TranslucencyManager.prototype.Start = function () {
        if (this.Viewers.length === 0) {
            return;
        }

        var _this = this;

        var slider;
        var outputFiled;
        var overlayField;

        if (this.SliderId === "translucencySlider1") {          
            outputFiled = document.getElementById("translucencyValue1");
            overlayField = document.getElementById("translucencyOverlay1");
        }
        else if (this.SliderId === "translucencySlider2") {            
            outputFiled = document.getElementById("translucencyValue2");
            overlayField = document.getElementById("translucencyOverlay2");
        }
        
        slider = document.getElementById(this.SliderId);
        if (!slider ||
            !outputFiled ||
            !overlayField) {
            return;
        }

        overlayField.style.right = "10px";
        overlayField.style.bottom = "45%";
        overlayField.style.display = "block";
        outputFiled.innerHTML = slider.value;

        //slider.value = 1;
        slider.oninput = function () {

            for (var i = 0; i < _this.Viewers.length; i++) {
                _this.onTranslucencyValueChanged(_this.Viewers[i], this.value);

            }
        }
    }  

    TranslucencyManager.prototype.ShowTranslucencyValue = function (viewer, value) {
        var outputFiled;
        if (this.SliderId === "translucencySlider1") {          
            outputFiled = document.getElementById("translucencyValue1");
        }
        else if (this.SliderId === "translucencySlider2") {          
            outputFiled = document.getElementById("translucencyValue2");
        }
        if (!outputFiled) {
            return;
        }

        outputFiled.innerHTML = value;
    }

    TranslucencyManager.prototype.onTranslucencyValueChanged = function (viewer, value) {

        // show translucency value
        this.ShowTranslucencyValue(viewer, value);

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

            var slider;
            var overlayField;

                if (this.SliderId === "translucencySlider1")
                {
                    overlayField = document.getElementById("translucencyOverlay1");
                }
                else  if (this.SliderId === "translucencySlider2")
                {
                    overlayField = document.getElementById("translucencyOverlay2");
                }
                slider = document.getElementById(this.SliderId);
                

            if (!slider || !overlayField) {
                return;
            }

            slider.value = 1;
            overlayField.style.display = "none";
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

        var slider;
        var outputFiled;    
        if (this.SliderId === "translucencySlider1")
        {
            outputFiled = document.getElementById("translucencyValue1");
        }
        else  if (this.SliderId === "translucencySlider2")
        {
            outputFiled = document.getElementById("translucencyValue1");
        }
        slider = document.getElementById(this.SliderId);

        if (!slider ||
            !outputFiled) {
            return;
        }

        if (this.Viewers[0]._params.containerId in this.ChangedComponents &&
            nodeId in this.ChangedComponents[this.Viewers[0]._params.containerId]) {
            // set values
            slider.value = this.ChangedComponents[this.Viewers[0]._params.containerId][nodeId];
        }
        else {
            // set values
            slider.value = 1;
        }

        outputFiled.innerHTML = slider.value;
    }
}



function startTranslucency() {
    if (!currentViewer ||
        !activateTranslucencyInCurrentViewer()) {
        alert("Can't activate translucency.");
        return;
    }

    if (explodeActive()) {
        alert("Please stop explode before activating translucency.");
        return;
    }

    // get slider id
    var sliderId = getSliderId(currentViewer._params.containerId);
    if(!sliderId)
    {
        return;
    }

    var translucencyManager = new TranslucencyManager([currentViewer], undefined, sliderId);
    translucencyManager.Start();

    translucencyManagers[currentViewer._params.containerId] = translucencyManager;
}

function stopTranslucency() {

    if (!currentViewer ||
        !(currentViewer._params.containerId in translucencyManagers)) {
        return;
    }

    translucencyManagers[currentViewer._params.containerId].Stop();
    delete translucencyManagers[currentViewer._params.containerId];    
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

function getSliderId(viewerContainerId)
{
    if (viewerContainerId === "viewerContainer1") {
      return "translucencySlider1";        
    }
    else if (viewerContainerId === "viewerContainer2") {
        return "translucencySlider2";      
    }

    return undefined;
}