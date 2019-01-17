
var xCheckStudio;
(function (xCheckStudio) {
    var ComponentIdentificationManager;
    (function (ComponentIdentificationManager) {

        // XML data source
        ComponentIdentificationManager.XMLSourceNameProperty = "Intrida Data/Name";
        ComponentIdentificationManager.XMLSourceMainClassProperty = "Intrida Data/MainComponentClass";
        ComponentIdentificationManager.XMLSourceSubComponentClassProperty = "Intrida Data/SubComponentClass";

        ComponentIdentificationManager.XMLPipingNWSegSourceProperty = "Intrida Data/Source";
        ComponentIdentificationManager.XMLPipingNWSegDestinationProperty = "Intrida Data/Destination";
        ComponentIdentificationManager.XMLPipingNWSegOwnerProperty = "Intrida Data/OwnerId";


        // RVM data source
        ComponentIdentificationManager.RVMSourceNameProperty = "Intrida Data/Name";
        ComponentIdentificationManager.RVMSourceMainClassProperty = "Intrida Data/Type";
        ComponentIdentificationManager.RVMSourceSubComponentClassProperty = "Intrida Data/Type";

         // Excel data source
         ComponentIdentificationManager.XLSSourceNameProperty = "Name";
         ComponentIdentificationManager.XLSSourceMainClassProperty = "Category";
         ComponentIdentificationManager.XLSSourceSubComponentClassProperty = "ComponentClass";

        function getComponentIdentificationProperties(fileExtension) {
            var properties;
            if (fileExtension.toLowerCase() === "xml") {

                properties = {
                    'name':ComponentIdentificationManager.XMLSourceNameProperty,
                    'mainCategory':ComponentIdentificationManager.XMLSourceMainClassProperty,
                    'subClass': ComponentIdentificationManager.XMLSourceSubComponentClassProperty,
                    'source': ComponentIdentificationManager.XMLPipingNWSegSourceProperty,
                    'destination': ComponentIdentificationManager.XMLPipingNWSegDestinationProperty,
                    'ownerId': ComponentIdentificationManager.XMLPipingNWSegOwnerProperty
                };
            }
            else if (fileExtension.toLowerCase() === "rvm") {
                properties = {
                    'name':ComponentIdentificationManager.RVMSourceNameProperty,
                    'mainCategory':ComponentIdentificationManager.RVMSourceMainClassProperty,
                    'subClass': ComponentIdentificationManager.RVMSourceSubComponentClassProperty
                };
            }
            else if (fileExtension.toLowerCase() === "xls") {
                properties = {
                    'name':ComponentIdentificationManager.XLSSourceNameProperty,
                    'mainCategory':ComponentIdentificationManager.XLSSourceMainClassProperty,
                    'subClass': ComponentIdentificationManager.XLSSourceSubComponentClassProperty
                };
            }

            return properties;
        }
        ComponentIdentificationManager.getComponentIdentificationProperties = getComponentIdentificationProperties;


    })(UploadManager = xCheckStudio.ComponentIdentificationManager || (xCheckStudio.ComponentIdentificationManager = {}));
})(xCheckStudio || (xCheckStudio = {}));