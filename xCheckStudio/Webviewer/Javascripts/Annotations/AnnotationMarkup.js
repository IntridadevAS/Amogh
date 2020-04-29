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
    var AnnotationMarkup = /** @class */ (function (_super) {
        __extends(AnnotationMarkup, _super);
        function AnnotationMarkup(viewer, anchorPoint, label) {
            var _this = _super.call(this) || this;
            _this._leaderLine = new Communicator.Markup.Shape.Line();
            _this._textBox = new Communicator.Markup.Shape.TextBox();
            _this._viewer = viewer;
            _this._leaderAnchor = anchorPoint.copy();
            _this._textBoxAnchor = anchorPoint.copy();
            _this._textBox.setTextString(label);
            _this._leaderLine.setStartEndcapType(Communicator.Markup.Shape.EndcapType.Arrowhead);

            _this.lineStrokColorOriginal = _this._leaderLine.getStrokeColor();
            _this.startEndCapColorOriginal = _this._leaderLine.getStartEndcapColor();
            _this.lineStrokWidthOriginal = _this._leaderLine.getStrokeWidth();
          
            var boxPortion = _this._textBox.getBoxPortion();
            _this.boxStrokeColorOriginal = boxPortion.getStrokeColor();
            _this.boxStrokeWidthOriginal =boxPortion.getStrokeWidth();
            
            var textPortion = _this._textBox.getTextPortion();
            _this.textStrokeColorOriginal = boxPortion.getStrokeColor();
            _this.textStrokeWidthOriginal =boxPortion.getStrokeWidth();

            return _this;
        }
        AnnotationMarkup.prototype.draw = function () {
            this._behindView = false;
            var view = this._viewer.view;
            var leaderPoint3d = view.projectPoint(this._leaderAnchor);
            var boxAnchor3d = view.projectPoint(this._textBoxAnchor);
            if (leaderPoint3d.z <= 0.0)
                this._behindView = true;
            if (boxAnchor3d.z <= 0.0)
                this._behindView = true;
            var leaderPoint2d = Communicator.Point2.fromPoint3(leaderPoint3d);
            var boxAnchor2d = Communicator.Point2.fromPoint3(boxAnchor3d);
            this._leaderLine.set(leaderPoint2d, boxAnchor2d);
            this._textBox.setPosition(boxAnchor2d);
            var renderer = this._viewer.markupManager.getRenderer();
            renderer.drawLine(this._leaderLine);
            renderer.drawTextBox(this._textBox);
        };
        AnnotationMarkup.prototype.hit = function (point) {
            var measurement = this._viewer.markupManager.getRenderer().measureTextBox(this._textBox);
            var position = this._textBox.getPosition();
            if (point.x < position.x)
                return false;
            if (point.x > position.x + measurement.x)
                return false;
            if (point.y < position.y)
                return false;
            if (point.y > position.y + measurement.y)
                return false;
            return true;
        };
        AnnotationMarkup.prototype.getLeaderLineAnchor = function () {
            return this._leaderAnchor.copy();
        };
        AnnotationMarkup.prototype.setLeaderLineAnchor = function (newAnchorPoint) {
            this._leaderAnchor.assign(newAnchorPoint);
        };

        AnnotationMarkup.prototype.getTextBoxAnchor = function () {
            return this._textBoxAnchor;
        };
        AnnotationMarkup.prototype.setTextBoxAnchor = function (newAnchorPoint) {
            this._textBoxAnchor.assign(newAnchorPoint);
        };
        AnnotationMarkup.prototype.setLabel = function (label) {
            this._textBox.setTextString(label);
        };
        AnnotationMarkup.prototype.getLabel = function () {
            return this._textBox.getTextString();
        };

        AnnotationMarkup.prototype.highlight = function () {
            var color = Communicator.Color.red();
            this.setLineStrokeColor(color);
            this.setStartEndCapColor(color);
            this.setLineStrokeWidth(this.lineStrokWidthOriginal + 1);

            this.setTextStrokeColor(color);
            this.setTextStrokeWidth(this.textStrokeWidthOriginal + 1);
            this.setBoxStrokeColor(color);
            this.setBoxStrokeWidth(this.boxStrokeWidthOriginal + 1);
        };

        AnnotationMarkup.prototype.unHighlight = function () {
            this.setLineStrokeColor(this.lineStrokColorOriginal);
            this.setStartEndCapColor(this.startEndCapColorOriginal);
            this.setLineStrokeWidth(this.lineStrokWidthOriginal);

            this.setTextStrokeColor(this.textStrokeColorOriginal);
            this.setTextStrokeWidth(this.textStrokeWidthOriginal);
            this.setBoxStrokeColor(this.boxStrokeColorOriginal);
            this.setBoxStrokeWidth(this.boxStrokeWidthOriginal);            
        };

        AnnotationMarkup.prototype.setTextStrokeColor = function (color) {
            var textPortion = this._textBox.getTextPortion();
            textPortion.setStrokeColor(color);
        };

        AnnotationMarkup.prototype.setTextStrokeWidth = function (width) {
            var textPortion = this._textBox.getTextPortion();
            textPortion.setStrokeWidth(width);
        }

        AnnotationMarkup.prototype.setBoxStrokeColor = function (color) {
            var boxPortion = this._textBox.getBoxPortion();
            boxPortion.setStrokeColor(color);
        };

        AnnotationMarkup.prototype.setBoxStrokeWidth = function (width) {
            var boxPortion = this._textBox.getBoxPortion();
            boxPortion.setStrokeWidth(width);
        }

        AnnotationMarkup.prototype.setLineStrokeColor = function (color) {
            this._leaderLine.setStrokeColor(color);
        };

        AnnotationMarkup.prototype.setStartEndCapColor = function (color) {
            this._leaderLine.setStartEndcapColor(color);
        }

        AnnotationMarkup.prototype.setLineStrokeWidth = function (width) {
            this._leaderLine.setStrokeWidth(width);
        };

        return AnnotationMarkup;
    }(Communicator.Markup.MarkupItem));
    Example.AnnotationMarkup = AnnotationMarkup;
})(Example || (Example = {}));
