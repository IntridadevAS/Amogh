var explodeManagers = {};
function ExplodeManager(webViewer, controls) {

    this.WebViewer = webViewer;
    this.Controls = controls;

    this.Slider = document.getElementById(controls["slider"]);
    this.OutputFiled = document.getElementById(controls["output"]);
    this.OverlayField = document.getElementById(controls["overlay"]);

    ExplodeManager.prototype.Start = function () {
        if (!this.WebViewer ||
            !this.Slider ||
            !this.OutputFiled ||
            !this.OverlayField) {
            return;
        }

        this.OverlayField.style.display = "block";
        this.OutputFiled.innerHTML = this.Slider.value;
        
        var _this = this;
        this.Slider.oninput = function () {
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

        if (!this.Slider ||
            !this.OverlayField) {
            return;
        }

        this.Slider.value = 0;
        this.OverlayField.style.display = "none";
    }

    ExplodeManager.prototype.onExplodeValueChanged = function (value) {
        if (!this.OutputFiled) {
            return;
        }
        this.OutputFiled.innerHTML = value;

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

function explodeActive() {
    if (currentViewer &&
        (currentViewer._params.containerId in explodeManagers)) {
        return true;
    }

    return false;
}