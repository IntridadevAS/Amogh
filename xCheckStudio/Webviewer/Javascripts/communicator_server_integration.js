var Communicator;
(function (Communicator) {
    var ServiceBroker = /** @class */ (function () {
        function ServiceBroker(endpoint) {
            this._endpoint = endpoint;
        }
        ServiceBroker.prototype.request = function (serviceRequest) {
            var _this = this;
            var request = new XMLHttpRequest();
            request.open("POST", this._endpoint + "/service");
            request.setRequestHeader("Access-Control-Allow-Origin", "*");
            request.setRequestHeader("Access-Control-Allow-Methods", "POST");
            request.setRequestHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers");
            request.timeout = 60000;
            var promise = new Promise(function (resolve, reject) {
                request.onreadystatechange = function () {
                    if (request.readyState == 4) {
                        if (request.status == 200) {
                            resolve(_this._parseServerSuccessResponse(request.responseText));
                        }
                        else {
                            reject(_this._parseServerError(request));
                        }
                    }
                };
                request.send(_this._encodeServiceRequest(serviceRequest));
            });
            return promise;
        };
        ServiceBroker.prototype._encodeServiceRequest = function (serviceRequest) {
            var requestObject = {};
            switch (serviceRequest.getServiceClass()) {
                case Communicator.ServiceClass.CSR_Session:
                    requestObject["class"] = "csr_session";
                    break;
                case Communicator.ServiceClass.SSR_Session:
                    requestObject["class"] = "ssr_session";
                    break;
            }
            requestObject.params = {};
            var modelSearchDirectories = serviceRequest.getModelSearchDirectories();
            if (modelSearchDirectories.length > 0) {
                requestObject.params["modelSearchDirectories"] = modelSearchDirectories;
            }
            var model = serviceRequest.getModel();
            if (model !== null) {
                requestObject.params["model"] = model;
            }
            var readyEndpoint = serviceRequest.getReadyEndpoint();
            if (readyEndpoint !== null) {
                requestObject.params["readyEndpoint"] = readyEndpoint;
            }
            var statusEndpoint = serviceRequest.getStatusEndpoint();
            if (statusEndpoint !== null) {
                requestObject.params["statusEndpoint"] = statusEndpoint;
            }
            var disconnectEndpoint = serviceRequest.getDisconnectEndpoint();
            if (disconnectEndpoint !== null) {
                requestObject.params["disconnectEndpoint"] = disconnectEndpoint;
            }
            var statusUpdateFrequency = serviceRequest.getStatusUpdateFrequency();
            if (statusUpdateFrequency !== 0) {
                requestObject.params["statusUpdateFrequency"] = statusUpdateFrequency.toString();
            }
            var sessionToken = serviceRequest.getSessionToken();
            if (sessionToken !== null) {
                requestObject.params["sessionToken"] = sessionToken;
            }
            return JSON.stringify(requestObject);
        };
        ServiceBroker.prototype._parseServerSuccessResponse = function (responseText) {
            var serviceResponse = new Communicator.ServiceResponse();
            var jsonResponse = JSON.parse(responseText);
            serviceResponse._setIsOk(jsonResponse.result == "ok");
            if (serviceResponse.getIsOk()) {
                serviceResponse._setServiceId(jsonResponse.serviceId);
                var protocols = Object.keys(jsonResponse.endpoints);
                var endpoints = serviceResponse.getEndpoints();
                for (var i = 0; i < protocols.length; i++) {
                    endpoints[Communicator.ServiceProtocol[protocols[i].toUpperCase()]] = jsonResponse.endpoints[protocols[i]];
                }
            }
            else {
                serviceResponse._setReason(jsonResponse.reason);
            }
            return serviceResponse;
        };
        ServiceBroker.prototype._parseServerError = function (request) {
            request; // unreferenced
            var serviceResponse = new Communicator.ServiceResponse();
            serviceResponse._setIsOk(false);
            serviceResponse._setReason("Server error encountered when trying to connect to: " + this._endpoint);
            return serviceResponse;
        };
        return ServiceBroker;
    }());
    Communicator.ServiceBroker = ServiceBroker;
})(Communicator || (Communicator = {}));
var Communicator;
(function (Communicator) {
    var ServiceClass;
    (function (ServiceClass) {
        ServiceClass[ServiceClass["CSR_Session"] = 0] = "CSR_Session";
        ServiceClass[ServiceClass["SSR_Session"] = 1] = "SSR_Session";
    })(ServiceClass = Communicator.ServiceClass || (Communicator.ServiceClass = {}));
    var ServiceRequest = /** @class */ (function () {
        function ServiceRequest(serviceClass) {
            if (serviceClass === void 0) { serviceClass = ServiceClass.CSR_Session; }
            this._serviceClass = ServiceClass.CSR_Session;
            this._modelSearchDirectories = [];
            this._model = null;
            this._readyEndpoint = null;
            this._statusEndpoint = null;
            this._disconnectEndpoint = null;
            this._statusUpdateFrequency = 0;
            this._sessionToken = null;
            this._serviceClass = serviceClass;
        }
        ServiceRequest.prototype.setServiceClass = function (serviceClass) {
            this._serviceClass = serviceClass;
        };
        ServiceRequest.prototype.getServiceClass = function () {
            return this._serviceClass;
        };
        ServiceRequest.prototype.addModelSearchDirectory = function (modelSearchDirectory) {
            this._modelSearchDirectories.push(modelSearchDirectory);
        };
        ServiceRequest.prototype.getModelSearchDirectories = function () {
            return this._modelSearchDirectories.slice();
        };
        ServiceRequest.prototype.getModel = function () {
            return this._model;
        };
        ServiceRequest.prototype.setModel = function (model) {
            this._model = model;
        };
        ServiceRequest.prototype.getReadyEndpoint = function () {
            return this._readyEndpoint;
        };
        ServiceRequest.prototype.setReadyEndpoint = function (readyEndpoint) {
            this._readyEndpoint = readyEndpoint;
        };
        ServiceRequest.prototype.getStatusEndpoint = function () {
            return this._statusEndpoint;
        };
        ServiceRequest.prototype.setStatusEndpoint = function (statusEndpoint) {
            this._statusEndpoint = statusEndpoint;
        };
        ServiceRequest.prototype.getDisconnectEndpoint = function () {
            return this._disconnectEndpoint;
        };
        ServiceRequest.prototype.setDisconnectEndpoint = function (disconnectEndpoint) {
            this._disconnectEndpoint = disconnectEndpoint;
        };
        ServiceRequest.prototype.getStatusUpdateFrequency = function () {
            return this._statusUpdateFrequency;
        };
        ServiceRequest.prototype.setStatusUpdateFrequency = function (statusUpdateFrequency) {
            this._statusUpdateFrequency = statusUpdateFrequency;
        };
        ServiceRequest.prototype.getSessionToken = function () {
            return this._sessionToken;
        };
        ServiceRequest.prototype.setSessionToken = function (sessionToken) {
            this._sessionToken = sessionToken;
        };
        return ServiceRequest;
    }());
    Communicator.ServiceRequest = ServiceRequest;
})(Communicator || (Communicator = {}));
var Communicator;
(function (Communicator) {
    var ServiceProtocol;
    (function (ServiceProtocol) {
        ServiceProtocol[ServiceProtocol["WS"] = 0] = "WS";
        ServiceProtocol[ServiceProtocol["WSS"] = 1] = "WSS";
        ServiceProtocol[ServiceProtocol["HTTP"] = 2] = "HTTP";
        ServiceProtocol[ServiceProtocol["HTTPS"] = 3] = "HTTPS";
    })(ServiceProtocol = Communicator.ServiceProtocol || (Communicator.ServiceProtocol = {}));
    var ServiceResponse = /** @class */ (function () {
        function ServiceResponse() {
            this._isOk = false;
            this._reason = null;
            this._serviceId = null;
            this._endpoints = {};
        }
        ServiceResponse.prototype.getIsOk = function () {
            return this._isOk;
        };
        ServiceResponse.prototype.getReason = function () {
            return this._reason;
        };
        ServiceResponse.prototype.getServiceId = function () {
            return this._serviceId;
        };
        ServiceResponse.prototype.getEndpoints = function () {
            return this._endpoints;
        };
        /** @hidden */
        ServiceResponse.prototype._setIsOk = function (isOk) {
            this._isOk = isOk;
        };
        /** @hidden */
        ServiceResponse.prototype._setReason = function (reason) {
            this._reason = reason;
        };
        /** @hidden */
        ServiceResponse.prototype._setServiceId = function (serviceId) {
            this._serviceId = serviceId;
        };
        /** @hidden */
        ServiceResponse.prototype._addEndpoint = function (protocol, endpoint) {
            this._endpoints[protocol] = endpoint;
        };
        return ServiceResponse;
    }());
    Communicator.ServiceResponse = ServiceResponse;
})(Communicator || (Communicator = {}));
