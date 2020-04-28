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
    var AnnotationOperatorBase = /** @class */ (function (_super) {
        __extends(AnnotationOperatorBase, _super);
        function AnnotationOperatorBase(viewer, 
            annotationRegistry,
            onAnnotationAdded) {
            var _this = _super.call(this) || this;
            _this._previousAnchorPlaneDragPoint = null;
            _this._activeMarkup = null;
            _this._viewer = viewer;
            // _this._annotationRegistry = annotationRegistry;
            _this.callbacks = {};
            return _this;
        }
        AnnotationOperatorBase.prototype._startDraggingAnnotation = function (annotation, downPosition) {
            this._activeMarkup = annotation;
            this._previousAnchorPlaneDragPoint = this._getDragPointOnAnchorPlane(downPosition);
        };
        AnnotationOperatorBase.prototype._selectAnnotation = function (selectPoint) {
            var markup = this._viewer.markupManager.pickMarkupItem(selectPoint);
            if (markup) {
                this._activeMarkup = markup;
                this._previousAnchorPlaneDragPoint = this._getDragPointOnAnchorPlane(selectPoint);
                return true;
            }
            else {
                return false;
            }
        };
        AnnotationOperatorBase.prototype.onMouseMove = function (event) {
            if (this._activeMarkup) {
                var currentAnchorPlaneDragPoint = this._getDragPointOnAnchorPlane(event.getPosition());
                var dragDelta = void 0;
                if (currentAnchorPlaneDragPoint !== null && this._previousAnchorPlaneDragPoint !== null) {
                    dragDelta = Communicator.Point3.subtract(currentAnchorPlaneDragPoint, this._previousAnchorPlaneDragPoint);
                }
                else {
                    dragDelta = Communicator.Point3.zero();
                }
                var newAnchorPos = this._activeMarkup.getTextBoxAnchor().add(dragDelta);
                this._activeMarkup.setTextBoxAnchor(newAnchorPos);
                this._previousAnchorPlaneDragPoint = currentAnchorPlaneDragPoint;
                this._viewer.markupManager.refreshMarkup();
                event.setHandled(true);
            }
        };
        AnnotationOperatorBase.prototype.onMouseUp = function (event) {
            event; // unreferenced
            this._activeMarkup = null;
            this._previousAnchorPlaneDragPoint = null;
        };
        AnnotationOperatorBase.prototype._getDragPointOnAnchorPlane = function (screenPoint) {
            if (this._activeMarkup === null) {
                return null;
            }
            var anchor = this._activeMarkup.getLeaderLineAnchor();
            var camera = this._viewer.view.getCamera();
            var normal = Communicator.Point3.subtract(camera.getPosition(), anchor).normalize();
            var anchorPlane = Communicator.Plane.createFromPointAndNormal(anchor, normal);
            var raycast = this._viewer.view.raycastFromPoint(screenPoint);
            if (raycast === null) {
                return null;
            }
            var intersectionPoint = Communicator.Point3.zero();
            if (anchorPlane.intersectsRay(raycast, intersectionPoint)) {
                return intersectionPoint;
            }
            else {
                return null;
            }
        };
        return AnnotationOperatorBase;
    }(Communicator.Operator.Operator));
    Example.AnnotationOperatorBase = AnnotationOperatorBase;
})(Example || (Example = {}));
