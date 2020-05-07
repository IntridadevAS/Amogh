/// <reference path="../hoops_web_viewer.d.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Example;
(function (Example) {
    var AnnotationOperator = /** @class */ (function (_super) {
        __extends(AnnotationOperator, _super);
        function AnnotationOperator() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._annotationCount = 1;
            return _this;
        }
        AnnotationOperator.prototype.onMouseDown = function (event) {
            var _this = this;
            var downPosition = event.getPosition();
            if (!this._selectAnnotation(downPosition)) {
                var config = new Communicator.PickConfig(Communicator.SelectionMask.Face);
                this._viewer.view.pickFromPoint(downPosition, config).then(function (selectionItem) {
                    var selectionPosition = selectionItem.getPosition();
                    if (selectionPosition) {
                        var annotationMarkup = new Example.AnnotationMarkup(_this._viewer, selectionPosition, "Annotation " + _this._annotationCount++);
                        var markupHandle = _this._viewer.markupManager.registerMarkup(annotationMarkup);
                        // _this._annotationRegistry[markupHandle] = annotationMarkup;
                        _this.callbacks.annotationAdded(markupHandle, annotationMarkup);

                        _this._startDraggingAnnotation(annotationMarkup, downPosition);
                    }
                });
            }
        };

        AnnotationOperator.prototype.setCallbacks = function (callbacks) {
            var _this = this;
            _this.callbacks = callbacks;
        }

        return AnnotationOperator;
    }(Example.AnnotationOperatorBase));
    Example.AnnotationOperator = AnnotationOperator;
})(Example || (Example = {}));
