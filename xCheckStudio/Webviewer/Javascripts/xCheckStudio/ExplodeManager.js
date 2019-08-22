var explodeManagers = {};
function ExplodeManager() {
    ExplodeManager.prototype.Start = function () {
        if (!currentViewer) {
            return;
        }

        var _this = this;

        var slider;
        var outputFiled;
        var overlayField;
        if (currentViewer._params.containerId === "visualizerA") {
            slider = document.getElementById("explodeSlider1");
            outputFiled = document.getElementById("explodeValue1");
            overlayField = document.getElementById("explodeOverlay1");
        }
        else if (currentViewer._params.containerId === "visualizerB") {
            slider = document.getElementById("explodeSlider2");
            outputFiled = document.getElementById("explodeValue2");
            overlayField = document.getElementById("explodeOverlay2");
        }

        if (!slider ||
            !outputFiled ||
            !overlayField) {
            return;
        }

        overlayField.style.display = "block";
        overlayField.style.right = "10px";
        overlayField.style.bottom = "45%";

        outputFiled.innerHTML = slider.value;

        slider.oninput = function () {
            _this.onExplodeValueChanged(this.value);
        }
    }

    ExplodeManager.prototype.Stop = function () {

        if (!currentViewer) {
            return;
        }
        var explodeManager = currentViewer.getExplodeManager();
        if (explodeManager.getActive()) {
            explodeManager.stop();
        }

        var slider;
        var overlayField;
        if (currentViewer._params.containerId === "visualizerA") {
            slider = document.getElementById("explodeSlider1");
            overlayField = document.getElementById("explodeOverlay1");
        }
        else if (currentViewer._params.containerId === "visualizerB") {
            slider = document.getElementById("explodeSlider2");
            overlayField = document.getElementById("explodeOverlay2");
        }
        if (!slider ||
            !overlayField) {
            return;
        }

        slider.value = 0;
        overlayField.style.display = "none";

    }

    ExplodeManager.prototype.onExplodeValueChanged = function (value) {

        // set value label
        var outputFiled;
        if (currentViewer._params.containerId === "visualizerA") {
            outputFiled = document.getElementById("explodeValue1");
        }
        else if (currentViewer._params.containerId === "visualizerB") {
            outputFiled = document.getElementById("explodeValue2");
        }
        if (!outputFiled) {
            return;
        }
        outputFiled.innerHTML = value;

        if (currentViewer) {
            var explodeManager = currentViewer.getExplodeManager();
            if (explodeManager.getActive()) {
                explodeManager.stop();
            }

            explodeManager.setMagnitude(Number(value));
            explodeManager.start().then(function () {

            });
        }
    }
}

function startExplode() {
    if (!currentViewer) {
        return;
    }

    if (translucencyActive()) {
        alert("Please stop translucency before activating explode.");
        return;
    }

    var explodeManager = new ExplodeManager();
    explodeManager.Start();

    explodeManagers[currentViewer._params.containerId] = explodeManager;
}

function stopExplode() {

    if (!currentViewer ||
        !(currentViewer._params.containerId in explodeManagers)) {
        return;
    }

    explodeManagers[currentViewer._params.containerId].Stop();
    delete explodeManagers[currentViewer._params.containerId];
}

function explodeActive()
{
    if (currentViewer &&
        (currentViewer._params.containerId in explodeManagers)) {
        return true;
    } 

    return false;
}