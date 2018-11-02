/// <reference path="../hoops_web_viewer.d.ts"/>
var Example;
(function (Example) {
    var Ui;
    (function (Ui) {
        var SelectionSet = /** @class */ (function () {
            function SelectionSet(elementId, viewer) {
                this._seletionId = 0;
                this._selectionCache = {};
                this._elementId = elementId;
                this._viewer = viewer;
                this._createElements();
            }
            SelectionSet.prototype._onSaveSelection = function () {
                var selectionManager = this._viewer.selectionManager;
                if (selectionManager.size() > 0) {
                    var selectionId = this._seletionId++;
                    this._selectionCache[selectionId] = selectionManager.exportSelectionData();
                    var option = document.createElement("option");
                    option.text = "Selection " + this._selectionList.length;
                    option.value = selectionId.toString();
                    this._selectionList.add(option);
                }
            };
            SelectionSet.prototype._onLoadSelection = function () {
                if (this._selectionList.length > 0) {
                    var selectionid = parseInt(this._selectionList.value, 10);
                    this._viewer.selectionManager.loadSelectionData(this._selectionCache[selectionid]);
                }
            };
            SelectionSet.prototype._createElements = function () {
                var _this = this;
                var container = document.getElementById(this._elementId);
                var wrapper = document.createElement("div");
                var buttonDiv = document.createElement("div");
                var saveSelection = document.createElement("button");
                saveSelection.innerHTML = "Save Selection";
                saveSelection.onclick = function () {
                    _this._onSaveSelection();
                };
                var loadSelection = document.createElement("button");
                loadSelection.innerHTML = "Load Selection";
                loadSelection.onclick = function () {
                    _this._onLoadSelection();
                };
                this._selectionList = document.createElement("select");
                this._selectionList.size = 5;
                this._selectionList.classList.add("example-panel-select-box");
                buttonDiv.appendChild(saveSelection);
                buttonDiv.appendChild(loadSelection);
                wrapper.appendChild(buttonDiv);
                wrapper.appendChild(this._selectionList);
                container.appendChild(wrapper);
            };
            return SelectionSet;
        }());
        Ui.SelectionSet = SelectionSet;
    })(Ui = Example.Ui || (Example.Ui = {}));
})(Example || (Example = {}));
