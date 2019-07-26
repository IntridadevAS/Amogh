var translucensyManager;
function TranslucensyManager() {
    this.ChangedComponents = [];


    TranslucensyManager.prototype.Start()
    {
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

        overlayField.style.bottom = "30px";
        overlayField.style.display = "block";
        outputFiled.innerHTML = slider.value;


        slider.oninput = function () {
            
            _this.onTranslucencyValueChanged(this.value)

        }
    }

    TranslucensyManager.prototype.onTranslucencyValueChanged(value)
    {
        outputFiled.innerHTML = value;
        if (currentViewer) {
            var selectionManager = currentViewer.selectionManager;
            var selectedNodes = [];
            selectionManager.each(function (selectionItem) {
                if (selectionItem.isNodeSelection()) {
                    selectedNodes.push(selectionItem._nodeId);
                }
            });

            currentViewer.model.setNodesOpacity(selectedNodes, Number(value));
        }
    }

    TranslucensyManager.prototype.Stop()
    {
        if (currentViewer) {          

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
            slider.value = 0;
            overlayField.style.display = "none";
        }
    }
}

function startTranslucensy() {
    translucensyManager = new TranslucensyManager();
    translucensyManager.Start();
}

function stopTranslucensy() {
    if(!translucensyManager)
    {
        return;
    }

    translucensyManager.Stop();
    translucensyManager = undefined;
}

// function setNodeOpacityToTranslucencySlider(selectedNodeId, viewerContainer) {
//     if (!selectedNodeId ||
//         !currentViewer) {
//         return;
//     }

//     var overlayField;
//     var slider;
//     if (viewerContainer === "viewerContainer1") {
//         overlayField = document.getElementById("translucencyOverlay1");
//         slider = document.getElementById("translucencySlider1");
//     }
//     else if (viewerContainer === "viewerContainer2") {
//         overlayField = document.getElementById("translucencyOverlay2");
//         slider = document.getElementById("translucencySlider2");
//     }

//     if (!overlayField ||
//         !slider) {
//         return;
//     }

//     currentViewer.model.getNodesOpacity([selectedNodeId]).then(function (transparencies) {
//         if (transparencies.lenght === 0) {
//             return;
//         }

//         slider.value = transparencies[0];
//     });
// }