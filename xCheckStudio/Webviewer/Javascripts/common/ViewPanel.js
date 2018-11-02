/// <reference path="../hoops_web_viewer.d.ts"/>
var Example;
(function (Example) {
    var Ui;
    (function (Ui) {
        var ViewPanel = /** @class */ (function () {
            function ViewPanel(elementId, viewer) {
                this._elementId = elementId;
                this._viewer = viewer;
                this._createElements();
                this._initEvents();
            }
            ViewPanel.prototype._createElements = function () {
                var _this = this;
                var containerElement = document.getElementById(this._elementId);
                var heading = document.createElement("div");
                heading.classList.add("example-div-block");
                heading.innerHTML = "Markup Views:";
                containerElement.appendChild(heading);
                var buttonDiv = document.createElement("div");
                buttonDiv.classList.add("example-div-block");
                var activateButton = document.createElement("button");
                activateButton.innerHTML = "Activate Selected";
                var deleteButton = document.createElement("button");
                deleteButton.innerHTML = "Delete Selected";
                containerElement.appendChild(buttonDiv);
                buttonDiv.appendChild(activateButton);
                buttonDiv.appendChild(deleteButton);
                activateButton.onclick = function () {
                    _this._activateSelectedView();
                };
                deleteButton.onclick = function () {
                    _this._deleteSelectedView();
                };
                this._viewSelect = document.createElement("select");
                this._viewSelect.size = 7;
                this._viewSelect.classList.add("example-panel-select-box");
                containerElement.appendChild(this._viewSelect);
            };
            ViewPanel.prototype._initEvents = function () {
                var _this = this;
                this._viewer.setCallbacks({
                    viewCreated: function (view) {
                        _this._onViewAdded(view);
                    },
                    viewLoaded: function (view) {
                        _this._onViewAdded(view);
                    },
                    viewDeleted: function (view) {
                        _this._onViewDeleted(view);
                    }
                });
            };
            ViewPanel.prototype._activateSelectedView = function () {
                var selectedView = this.getSelectedViewUniqueId();
                if (selectedView)
                    this._viewer.markupManager.activateMarkupViewWithPromise(selectedView);
            };
            ViewPanel.prototype._deleteSelectedView = function () {
                var currentChild = this._viewSelect.firstChild;
                while (currentChild) {
                    if (currentChild.selected) {
                        this._viewer.markupManager.deleteMarkupView(currentChild.value);
                        return;
                    }
                    currentChild = currentChild.nextSibling;
                }
            };
            ViewPanel.prototype._onViewAdded = function (view) {
                var option = document.createElement("option");
                option.text = view.getName();
                option.value = view.getUniqueId();
                this._viewSelect.add(option);
            };
            ViewPanel.prototype._onViewDeleted = function (view) {
                var currentChild = this._viewSelect.firstChild;
                var uniqueId = view.getUniqueId();
                while (currentChild) {
                    if (currentChild.value === uniqueId) {
                        this._viewSelect.removeChild(currentChild);
                        return;
                    }
                    currentChild = currentChild.nextSibling;
                }
            };
            ViewPanel.prototype.getSelectedViewUniqueId = function () {
                var currentChild = this._viewSelect.firstChild;
                while (currentChild) {
                    if (currentChild.selected) {
                        return currentChild.value;
                    }
                    currentChild = currentChild.nextSibling;
                }
                return null;
            };
            return ViewPanel;
        }());
        Ui.ViewPanel = ViewPanel;
    })(Ui = Example.Ui || (Example.Ui = {}));
})(Example || (Example = {}));
