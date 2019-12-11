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

        function getFileNameWithoutExtension(fileName) {
            return fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        }
        Util.getFileNameWithoutExtension = getFileNameWithoutExtension;

        function fileExists(fileURL) {

            return new Promise(function (resolve, reject) {
                try {
                    var request = new XMLHttpRequest();
                    request.open('HEAD', fileURL, true);
                    request.onreadystatechange = function () {
                        if (request.readyState === 4) {

                            if (this.status == 200) {
                                return resolve(true);
                            }
                            else {
                                return resolve(false);
                            }
                        }
                    };

                    request.send();
                }
                catch (err) {
                    return resolve(false);
                }
            });
        }
        Util.fileExists = fileExists;

        function isAccepted(component) {
            var accepted = false;

            if (component.accepted == 'true') {
                accepted = true;
            }
            return accepted;
        }

        function isTransposed(component) {
            var transposed = false;

            if (component.transpose === "FromDataSource1" ||
                component.transpose === "FromDataSource2" ||
                component.transpose === "FromDataSource3" ||
                component.transpose === "FromDataSource4") {
                transposed = true;
            }
            return transposed;
        }

        function getComponentHexColor(component, override, parentComponent) {
            status = component.Status;

            // this is for overriding colors for pipes and branches
            if (override && parentComponent) {
                if (parentComponent.Status.toLowerCase().includes("error")) {

                    if (parentComponent.accepted.toLowerCase() != 'true' && parentComponent.transpose == null) {
                        return HoopsViewerErrorColor;
                    }
                }
                else if (parentComponent.Status.toLowerCase().includes("warning")) {

                    if ((parentComponent.accepted.toLowerCase() != 'true' && parentComponent.transpose == null) &&
                        status.toLowerCase() !== "error") {
                        return HoopsViewerWarningColor;
                    }
                }
                else if (parentComponent.Status.toLowerCase().includes("no match")) {

                    if ((parentComponent.accepted.toLowerCase() != 'true' && parentComponent.transpose == null) &&
                        (status.toLowerCase() !== "error" ||
                            status.toLowerCase() !== "warning")) {

                        return NoMatchColor;
                    }
                }
            }

            // if component is mot mapped i.e. undefined, then 
            // don't override the parent's highlight color
            if (parentComponent &&
                status.toLowerCase() === "undefined" || status.toLowerCase() === "not checked") {
                return undefined;
            }

            // var color;
            if (status.toLowerCase().includes("ok")) {
                if (status.toLowerCase() == "ok(a)") {
                    return AcceptedColor;
                }
                else if (status.toLowerCase() == "ok(t)") {
                    return AcceptedColor;
                }
                else if (status.toLowerCase() == "ok(a)(t)") {
                    return AcceptedColor;
                }
                return SuccessColor;
            }
            else if (status.toLowerCase().includes("no match")) {
                if (parentComponent && (parentComponent.Status.toLowerCase().includes("error") ||
                    parentComponent.Status.toLowerCase().includes("ok") ||
                    parentComponent.Status.toLowerCase().includes("warning"))) {

                    if (parentComponent.Status.toLowerCase().includes("(a)") || parentComponent.Status.toLowerCase().includes("(t)")) {
                        return AcceptedColor;
                    }
                    else if (isAccepted(parentComponent)) {
                        return AcceptedColor;
                    }
                    else if (isTransposed(parentComponent)) {
                        return AcceptedColor;
                    }
                    else {
                        if (parentComponent.Status.toLowerCase() == "error") {
                            return HoopsViewerErrorColor;
                        }
                        else if (parentComponent.Status.toLowerCase() == "warning") {
                            return HoopsViewerWarningColor;
                        }
                        else if (parentComponent.Status.toLowerCase() == "ok") {
                            return SuccessColor;
                        }
                    }
                }
                else {
                    if (isAccepted(component)) {
                        return AcceptedColor;
                    }
                    else if (isTransposed(component)) {
                        return AcceptedColor;
                    }
                    else {
                        if (parentComponent && (parentComponent.Status.toLowerCase().includes("undefined"))) {
                            return NoMatchColor;
                        }
                        else {
                            return undefined;
                        }
                    }
                }
            }
            else if (status.toLowerCase().includes("error")) {
                if (status.toLowerCase().includes("(a)") || status.toLowerCase().includes("(t)")) {
                    return AcceptedColor;
                }
                else if (isAccepted(component)) {
                    return AcceptedColor;
                }
                else if (isTransposed(component)) {
                    return AcceptedColor;
                }
                else {
                    return HoopsViewerErrorColor;
                }
            }
            else if (status.toLowerCase().includes("warning")) {
                if (status.toLowerCase().includes("(a)") || status.toLowerCase().includes("(t)")) {
                    return AcceptedColor;
                }
                else if (isAccepted(component)) {
                    return AcceptedColor;
                }
                else if (isTransposed(component)) {
                    return AcceptedColor;
                }
                else {
                    return HoopsViewerWarningColor;
                }
            }
            else if (status.toLowerCase().includes("no value")) {
                if (status.toLowerCase().includes("(a)") || status.toLowerCase().includes("(t)")) {
                    return AcceptedColor;
                }
                else if (isAccepted(component)) {
                    return AcceptedColor;
                }
                else if (isTransposed(component)) {
                    return AcceptedColor;
                }
                else {
                    return NoValueColor;
                }
            }
            else if (status.toLowerCase() === "accepted(t)") {
                return AcceptedColor;
            }
            else if (status.toLowerCase() === "error(a)" ||
                status.toLowerCase() === "warning(a)" ||
                status.toLowerCase() === "no Match(a)" ||
                status.toLowerCase() === "no Value(a)") {
                return PropertyAcceptedColor;
            }
            else if (status.toLowerCase() === "error(t)" ||
                status.toLowerCase() === "warning(t)") {
                return PropertyAcceptedColor;
            }
            else if (status.includes("(A)(T)") || status.includes("(T)(A)")) {
                return PropertyAcceptedColor;
            }
            else if (status.toLowerCase() === "ok(t)") {
                return AcceptedColor;
            }
            else if (status.toLowerCase() === "ok(a)") {
                return AcceptedColor;
            }
            else {
                return "#ffffff";
            }
        }
        Util.getComponentHexColor = getComponentHexColor;


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

        // this check whether input source is 3D
        function isSource3D(fileExtension) {
            if (Sources3D.includes(fileExtension.toLowerCase())) {
                return true;
            }

            return false;
        }
        Util.isSource3D = isSource3D;

        // this check whether input source is 1D
        function isSource1D(fileExtension) {
            if (Sources1D.includes(fileExtension.toLowerCase())) {
                return true;
            }

            return false;
        }
        Util.isSource1D = isSource1D;

        // this check whether input source is 1D
        function isSourceExcel(fileExtension) {
            if (ExcelSources.includes(fileExtension.toLowerCase())) {
                return true;
            }

            return false;
        }
        Util.isSourceExcel = isSourceExcel;

        // this check whether input source is 1D
        function isSourceDB(fileExtension) {
            if (DBSources.includes(fileExtension.toLowerCase())) {
                return true;
            }

            return false;
        }
        Util.isSourceDB = isSourceDB;

        // this returns the element occurrence count in an array
        function getArrayElementOccCount(arr) {

            var arrayElementOccCount = {};
            for (var i = 0; i < arr.length; i++) {
                var element = arr[i];
                if (element in arrayElementOccCount) {
                    arrayElementOccCount[element] += 1;
                }
                else {
                    arrayElementOccCount[element] = 1;
                }
            }

            return arrayElementOccCount;
        }
        Util.getArrayElementOccCount = getArrayElementOccCount;

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

        function getCurrentDateTime() {
            var today = new Date();
            var date = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
            var time = today.getHours() + ":" + today.getMinutes();
            var dateTime = date + ' ' + time;
            return dateTime;
        }
        Util.getCurrentDateTime = getCurrentDateTime;
    })(Util = xCheckStudio.Util || (xCheckStudio.Util = {}));
})(xCheckStudio || (xCheckStudio = {}));