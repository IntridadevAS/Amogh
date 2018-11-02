/// <reference path="../hoops_web_viewer.d.ts"/>
var Example;
(function (Example) {
    var Ui;
    (function (Ui) {
        var ViewOrientationBar = /** @class */ (function () {
            function ViewOrientationBar(elementId, viewer) {
                this._transitionDuration = Communicator.DefaultTransitionDuration;
                this._elementId = elementId;
                this._viewer = viewer;
                this._createElements();
            }
            ViewOrientationBar.prototype._createElements = function () {
                var _this = this;
                var containerElement = document.getElementById(this._elementId);
                var label = document.createElement("span");
                label.innerHTML = "View Orientation: ";
                containerElement.appendChild(label);
                containerElement.appendChild(this._createButton("Front", Communicator.ViewOrientation.Front));
                containerElement.appendChild(this._createButton("Back", Communicator.ViewOrientation.Back));
                containerElement.appendChild(this._createButton("Left", Communicator.ViewOrientation.Left));
                containerElement.appendChild(this._createButton("Right", Communicator.ViewOrientation.Right));
                containerElement.appendChild(this._createButton("Top", Communicator.ViewOrientation.Top));
                containerElement.appendChild(this._createButton("Bottom", Communicator.ViewOrientation.Bottom));
                containerElement.appendChild(this._createButton("Iso", Communicator.ViewOrientation.Iso));
                label = document.createElement("span");
                label.innerHTML = "Duration: ";
                containerElement.appendChild(label);
                var durationControl = document.createElement("input");
                durationControl.id = "durationControl";
                durationControl.type = "number";
                durationControl.min = "0";
                durationControl.value = this._transitionDuration.toString();
                durationControl.step = "1";
                containerElement.appendChild(durationControl);
                durationControl.onchange = function () {
                    _this._transitionDuration = parseInt(durationControl.value, 10);
                };
            };
            ViewOrientationBar.prototype._createButton = function (name, orientation) {
                var _this = this;
                var button = document.createElement("button");
                button.innerHTML = name;
                button.onclick = function () {
                    _this._viewer.view.setViewOrientation(orientation, _this._transitionDuration);
                };
                return button;
            };
            return ViewOrientationBar;
        }());
        Ui.ViewOrientationBar = ViewOrientationBar;
    })(Ui = Example.Ui || (Example.Ui = {}));
})(Example || (Example = {}));
