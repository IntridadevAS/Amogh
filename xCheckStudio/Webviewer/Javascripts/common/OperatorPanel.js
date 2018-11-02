/// <reference path="../hoops_web_viewer.d.ts"/>
/// <reference path="../common/Example.ts"/>
var Example;
(function (Example) {
    var Ui;
    (function (Ui) {
        var OperatorPanel = /** @class */ (function () {
            function OperatorPanel(elementId, viewer) {
                this._elementId = elementId;
                this._viewer = viewer;
                this._createElements();
            }
            OperatorPanel.prototype.getSelectedActiveOperatorId = function () {
                return this._getSelectedOperatorId(this._activeOperatorSelect);
            };
            OperatorPanel.prototype.getSelectedCameraOperatorId = function () {
                return this._getSelectedOperatorId(this._cameraOperatorSelect);
            };
            OperatorPanel.prototype._createElements = function () {
                var containerElement = document.getElementById(this._elementId);
                var heading = document.createElement("div");
                heading.classList.add("example-div-block");
                heading.innerHTML = "Camera Operator:";
                containerElement.appendChild(heading);
                this._createCameraOperatorSelect();
                containerElement.appendChild(this._cameraOperatorSelect);
                heading = document.createElement("div");
                heading.classList.add("example-div-block");
                heading.innerHTML = "Active Operator:";
                containerElement.appendChild(heading);
                this._activeOperatorSelect = this._createActiveOperatorSelect();
                containerElement.appendChild(this._activeOperatorSelect);
            };
            OperatorPanel.prototype._createActiveOperatorSelect = function () {
                var _this = this;
                this._activeOperatorSelect = document.createElement("select");
                this._activeOperatorSelect.size = 5;
                this._activeOperatorSelect.classList.add("example-panel-select-box");
                this._activeOperatorSelect.appendChild(this._createOperatorOption("None", Communicator.OperatorId.None));
                this._activeOperatorSelect.appendChild(this._createOperatorOption("Select", Communicator.OperatorId.Select));
                this._activeOperatorSelect.appendChild(this._createOperatorOption("RedlineCircle", Communicator.OperatorId.RedlineCircle));
                this._activeOperatorSelect.appendChild(this._createOperatorOption("RedlineText", Communicator.OperatorId.RedlineText));
                this._activeOperatorSelect.appendChild(this._createOperatorOption("RedlineRectangle", Communicator.OperatorId.RedlineRectangle));
                this._activeOperatorSelect.appendChild(this._createOperatorOption("RedlinePolyline", Communicator.OperatorId.RedlinePolyline));
                this._activeOperatorSelect.appendChild(this._createOperatorOption("MeasureEdgeLength", Communicator.OperatorId.MeasureEdgeLength));
                this._activeOperatorSelect.appendChild(this._createOperatorOption("MeasureFaceFaceAngle", Communicator.OperatorId.MeasureFaceFaceAngle));
                this._activeOperatorSelect.appendChild(this._createOperatorOption("MeasureFaceFaceDistance", Communicator.OperatorId.MeasureFaceFaceDistance));
                this._activeOperatorSelect.appendChild(this._createOperatorOption("MeasurePointPointDistance", Communicator.OperatorId.MeasurePointPointDistance));
                this._activeOperatorSelect.onclick = function () {
                    var operatorId = _this._getSelectedOperatorId(_this._activeOperatorSelect);
                    if (operatorId !== null)
                        _this._viewer.operatorManager.set(operatorId, 1);
                };
                return this._activeOperatorSelect;
            };
            OperatorPanel.prototype._createCameraOperatorSelect = function () {
                var _this = this;
                this._cameraOperatorSelect = document.createElement("select");
                this._cameraOperatorSelect.size = 5;
                this._cameraOperatorSelect.classList.add("example-panel-select-box");
                this._cameraOperatorSelect.appendChild(this._createOperatorOption("Navigate", Communicator.OperatorId.Navigate));
                this._cameraOperatorSelect.appendChild(this._createOperatorOption("Walk", Communicator.OperatorId.Walk));
                this._cameraOperatorSelect.appendChild(this._createOperatorOption("Turntable", Communicator.OperatorId.Turntable));
                this._cameraOperatorSelect.onclick = function () {
                    var operatorId = _this._getSelectedOperatorId(_this._cameraOperatorSelect);
                    if (operatorId)
                        _this._viewer.operatorManager.set(operatorId, 0);
                };
                return this._cameraOperatorSelect;
            };
            OperatorPanel.prototype._createOperatorOption = function (name, value) {
                var option = document.createElement("option");
                option.text = name;
                option.value = value.toString();
                return option;
            };
            OperatorPanel.prototype._getSelectedOperatorId = function (select) {
                var currentChild = select.firstChild;
                while (currentChild) {
                    if (currentChild.selected) {
                        return parseInt(currentChild.value, 10);
                    }
                    currentChild = currentChild.nextSibling;
                }
                return null;
            };
            return OperatorPanel;
        }());
        Ui.OperatorPanel = OperatorPanel;
    })(Ui = Example.Ui || (Example.Ui = {}));
})(Example || (Example = {}));
