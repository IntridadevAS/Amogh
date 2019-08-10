var translucencyManagers = {};
function TranslucencyManager() {
    this.ChangedComponents = {};


    TranslucencyManager.prototype.Start = function () {
        if (!currentViewer) {
            return;
        }

        var _this = this;

        var slider;
        var outputFiled;
        var overlayField;

        if (currentViewer._params.containerId === "viewerContainer1") {
            slider = document.getElementById("translucencySlider1");
            outputFiled = document.getElementById("translucencyValue1");
            overlayField = document.getElementById("translucencyOverlay1");
        }
        else if (currentViewer._params.containerId === "viewerContainer2") {
            slider = document.getElementById("translucencySlider2");
            outputFiled = document.getElementById("translucencyValue2");
            overlayField = document.getElementById("translucencyOverlay2");
        }

        if (!slider ||
            !outputFiled ||
            !overlayField) {
            return;
        }

        overlayField.style.right = "10px";
        overlayField.style.bottom = "45%";
        // overlayField.style.bottom = "30px";
        overlayField.style.display = "block";
        outputFiled.innerHTML = slider.value;

        //slider.value = 1;
        slider.oninput = function () {

            _this.onTranslucencyValueChanged(this.value)

        }
    }

    TranslucencyManager.prototype.onTranslucencyValueChanged = function (value) {
        var outputFiled;
        if (currentViewer._params.containerId === "viewerContainer1") {            
            outputFiled = document.getElementById("translucencyValue1");            
        }
        else if (currentViewer._params.containerId === "viewerContainer2") {         
            outputFiled = document.getElementById("translucencyValue2");            
        }       
        if(!outputFiled)
        {
            return;
        }

        outputFiled.innerHTML = value;
        
        if (currentViewer) {
            var selectionManager = currentViewer.selectionManager;
            var selectedNodes = [];
            selectionManager.each(function (selectionItem) {
                if (selectionItem.isNodeSelection()) {
                    selectedNodes.push(selectionItem._nodeId);
                }
            });

               // maintain changed components
               for(var i = 0; i <selectedNodes.length; i++)
               {
                   var selectedNode = selectedNodes[i];                  
                   this.ChangedComponents[selectedNode] = Number(value) ;                
               }

            currentViewer.model.setNodesOpacity(selectedNodes, Number(value));         
        }
    }

    TranslucencyManager.prototype.Stop = function () {
        if (currentViewer) {

            // reset opacity for changed components
            this.ResetTranslucensy();

            var slider;
            var overlayField;
            if (currentViewer._params.containerId === "viewerContainer1") {
                slider = document.getElementById("translucencySlider1");
                overlayField = document.getElementById("translucencyOverlay1");
            }
            else if (currentViewer._params.containerId === "viewerContainer2") {
                slider = document.getElementById("translucencySlider2");
                overlayField = document.getElementById("translucencyOverlay2");
            }
            if (!slider || !overlayField) {
                return;
            }
           
            slider.value = 1;
            overlayField.style.display = "none";
        }
    }

    TranslucencyManager.prototype.ResetTranslucensy = function () {
        if (!currentViewer) {
            return;
        }      

        var changedNodes = Object.keys(this.ChangedComponents);
        var nodes = [];
        for(var i = 0; i <changedNodes.length; i++)
       {
          nodes.push( Number(changedNodes[i]));
       } 
       
        // reset opacity
        currentViewer.model.resetNodesOpacity(nodes);

        // clear the changed components object
        this.ChangedComponents = {};
    }

    TranslucencyManager.prototype.ComponentSelected = function (nodeId) {
        if (!currentViewer) {
            return;
        }

        var slider;
        var outputFiled;
        if (currentViewer._params.containerId === "viewerContainer1") {
            slider = document.getElementById("translucencySlider1");
            outputFiled = document.getElementById("translucencyValue1");
        }
        else if (currentViewer._params.containerId === "viewerContainer2") {
            slider = document.getElementById("translucencySlider2");
            outputFiled = document.getElementById("translucencyValue2");
        }

        if (!slider ||
            !outputFiled) {
            return;
        }

        if (nodeId in this.ChangedComponents) {
            // set values
            slider.value = this.ChangedComponents[nodeId];           
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
        translucencyActive()) {
        return;
    }

    if (explodeActive()) {
        alert("Please stop explode before activating translucency.");
        return;
    }

    var translucencyManager = new TranslucencyManager();
    translucencyManager.Start();

    translucencyManagers[currentViewer._params.containerId] = translucencyManager;    
}

function stopTranslucency() {
    if (!currentViewer ||
        !(currentViewer._params.containerId in translucencyManagers))
    {
        return;
    }

    translucencyManagers[currentViewer._params.containerId].Stop();
    delete translucencyManagers[currentViewer._params.containerId]; 
}

function translucencyActive()
{
    if (currentViewer &&
        (currentViewer._params.containerId in translucencyManagers)) {
        return true;
    } 

    return false;
}