var xCheckStudio;
(function (xCheckStudio) {
    var Util;
    (function (Util) {
        
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        
        function getFileExtension(filename) {
        return filename.split('.').pop();
        }
        Util.getFileExtension = getFileExtension;
       
        function fileExists(fileURL){

            var http = new XMLHttpRequest();
        
            http.open('HEAD', fileURL, false);
            http.send();
        
            return http.status != 404;        
        }
        Util.fileExists = fileExists;
       
        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }
        Util.rgbToHex = rgbToHex;

        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (result !== null) {
                var r = parseInt(result[1], 16);
                var g = parseInt(result[2], 16);
                var b = parseInt(result[3], 16);
                return new Communicator.Color(r, g, b);
            }
            return Communicator.Color.black();
        }
        Util.hexToRgb = hexToRgb;
        function getCameraPlaneIntersectionPoint(camera, point, view) {
            var target = camera.getTarget();
            var normal = Communicator.Point3.subtract(camera.getPosition(), target).normalize();
            var plane = Communicator.Plane.createFromPointAndNormal(target, normal);
            var ray = view.raycastFromPoint(point);
            if (ray === null) {
                return null;
            }
            var intersectionPoint = Communicator.Point3.zero();
            if (plane.intersectsRay(ray, intersectionPoint))
                return intersectionPoint;
            else
                return null;
        }
        Util.getCameraPlaneIntersectionPoint = getCameraPlaneIntersectionPoint;
        function pointInTriangle2d(p, p0, p1, p2) {
            var A = 1 / 2 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
            var sign = A < 0 ? -1 : 1;
            var s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
            var t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;
            return s > 0 && t > 0 && (s + t) < 2 * A * sign;
        }
        Util.pointInTriangle2d = pointInTriangle2d;
        function closestPointOnLine2d(point, p1, p2) {
            var v1 = Communicator.Point2.subtract(p2, p1);
            var v1length = v1.length();
            var U = ((point.x - p1.x) * (p2.x - p1.x)) + ((point.y - p1.y) * (p2.y - p1.y));
            U /= v1length * v1length;
            v1.scale(U);
            return Communicator.Point2.add(p1, v1);
        }
        Util.closestPointOnLine2d = closestPointOnLine2d;
        function pointOnLineSegment2d(point, p1, p2, tolerance) {
            var closestPoint = closestPointOnLine2d(point, p1, p2);
            var distance = Communicator.Point2.distance(point, closestPoint);
            if (distance <= tolerance) {
                var lo_x = Math.min(p1.x, p2.x);
                var hi_x = Math.max(p1.x, p2.x);
                var lo_y = Math.min(p1.y, p2.y);
                var hi_y = Math.max(p1.y, p2.y);
                if (closestPoint.x < lo_x)
                    return false;
                if (closestPoint.x > hi_x)
                    return false;
                if (closestPoint.y < lo_y)
                    return false;
                if (closestPoint.y > hi_y)
                    return false;
                return true;
            }
            else
                return false;
        }
        Util.pointOnLineSegment2d = pointOnLineSegment2d;
        function removeAllChildren(element) {
            while (element.firstChild)
                element.removeChild(element.firstChild);
        }
        Util.removeAllChildren = removeAllChildren;
        function getParameterByName(name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.search);
            if (results === null)
                return null;
            else
                return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
        function getRendererType() {
            var val = getParameterByName("viewer");
            if (val === "ssr")
                return Communicator.RendererType.Server;
            else
                return Communicator.RendererType.Client;
        }
        Util.getRendererType = getRendererType;
    })(Util = xCheckStudio.Util || (xCheckStudio.Util = {}));
})(xCheckStudio || (xCheckStudio = {}));