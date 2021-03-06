
var xCheckStudio;
(function (xCheckStudio) {
    var ComponentIdentificationManager;
    (function (ComponentIdentificationManager) {

        var componentIdentifiers = null;
        readComponentIdentifiers().then(function (result) {
            componentIdentifiers = result;
        });

        function readComponentIdentifiers() {

            return new Promise((resolve) => {

                var xmlhttp = new XMLHttpRequest();
                var url = "configurations/ComponentIdentifiers.json";

                xmlhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var result = xCheckStudio.Util.tryJsonParse(this.responseText);                   
                        return resolve(result);
                    }
                };
                xmlhttp.open("GET", url, true);
                xmlhttp.send();
            });
        }

        function getComponentIdentificationProperties(fileExtension) {
            if (componentIdentifiers === null) {
                return null;
            }

            var extension = fileExtension.toLowerCase();

            let identifiers = Object.values(componentIdentifiers);
            for (var i = 0; i < identifiers.length; i++) {
                let identifier = identifiers[i];
                if (identifier.extensions.includes(extension)) {
                    identifier.name
                    var properties = {};

                    if ("name" in identifier) {
                        properties['name'] = identifier.name;
                    }
                    if ("category" in identifier) {
                        properties['mainCategory'] = identifier.category;
                    }
                    if ("componentClass" in identifier) {
                        properties['subClass'] = identifier.componentClass;
                    }
                    if ("owner" in identifier) {
                        properties['owner'] = identifier.owner;
                    }
                    if ("createVirtualParents" in identifier) {
                        properties['createVirtualParents'] = identifier.createVirtualParents;
                    }

                    return properties;
                }
            }

            return null;
        }
        ComponentIdentificationManager.getComponentIdentificationProperties = getComponentIdentificationProperties;


    })(ComponentIdentificationManager = xCheckStudio.ComponentIdentificationManager || (xCheckStudio.ComponentIdentificationManager = {}));
})(xCheckStudio || (xCheckStudio = {}));