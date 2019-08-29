var explodeManagers = {};
function ExplodeManager(webViewer) {

    this.WebViewer = webViewer;
    ExplodeManager.prototype.Start = function () {
        if (!this.WebViewer) {
            return;
        }

        var _this = this;

        var slider;
        var outputFiled;
        var overlayField;
        if (this.WebViewer._params.containerId === "visualizerA") {
            slider = document.getElementById("explodeSlider1");
            outputFiled = document.getElementById("explodeValue1");
            overlayField = document.getElementById("explodeOverlay1");
        }
        else if (this.WebViewer._params.containerId === "visualizerB") {
            slider = document.getElementById("explodeSlider2");
            outputFiled = document.getElementById("explodeValue2");
            overlayField = document.getElementById("explodeOverlay2");
        }
        else if (this.WebViewer._params.containerId === "visualizerC") {
            slider = document.getElementById("explodeSlider3");
            outputFiled = document.getElementById("explodeValue3");
            overlayField = document.getElementById("explodeOverlay3");
        }
        else if (this.WebViewer._params.containerId === "visualizerD") {
            slider = document.getElementById("explodeSlider4");
            outputFiled = document.getElementById("explodeValue4");
            overlayField = document.getElementById("explodeOverlay4");
        }

        if (!slider ||
            !outputFiled ||
            !overlayField) {
            return;
        }

        overlayField.style.display = "block";
        // overlayField.style.right = "10px";
        // overlayField.style.bottom = "45%";

        outputFiled.innerHTML = slider.value;

        slider.oninput = function () {
            _this.onExplodeValueChanged(this.value);
        }
    }  

    ExplodeManager.prototype.Stop = function () {

        if (!this.WebViewer) {
            return;
        }
        var explodeManager = this.WebViewer.getExplodeManager();
        if (explodeManager.getActive()) {
            explodeManager.stop();
        }

        var slider;
        var overlayField;
        if (this.WebViewer._params.containerId === "visualizerA") {
            slider = document.getElementById("explodeSlider1");
            overlayField = document.getElementById("explodeOverlay1");
        }
        else if (this.WebViewer._params.containerId === "visualizerB") {
            slider = document.getElementById("explodeSlider2");
            overlayField = document.getElementById("explodeOverlay2");
        }
        else if (this.WebViewer._params.containerId === "visualizerC") {
            slider = document.getElementById("explodeSlider3");            
            overlayField = document.getElementById("explodeOverlay3");
        }
        else if (this.WebViewer._params.containerId === "visualizerD") {
            slider = document.getElementById("explodeSlider4");            
            overlayField = document.getElementById("explodeOverlay4");
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
        if (this.WebViewer._params.containerId === "visualizerA") {
            outputFiled = document.getElementById("explodeValue1");
        }
        else if (this.WebViewer._params.containerId === "visualizerB") {
            outputFiled = document.getElementById("explodeValue2");
        }
        else if (this.WebViewer._params.containerId === "visualizerC") {
            outputFiled = document.getElementById("explodeValue3");
        }
        else if (this.WebViewer._params.containerId === "visualizerD") {
            outputFiled = document.getElementById("explodeValue4");
        }
        if (!outputFiled) {
            return;
        }
        outputFiled.innerHTML = value;

        if (this.WebViewer) {
            var explodeManager = this.WebViewer.getExplodeManager();
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

    var explodeManager = new ExplodeManager(currentViewer);
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