
var xCheckStudio;
(function (xCheckStudio) {
    var ComponentIdentificationManager;
    (function (ComponentIdentificationManager) {

        // XML data source
        ComponentIdentificationManager.XMLSourceNameProperty = "Intrida Data/Title";
        ComponentIdentificationManager.XMLSourceMainClassProperty = "Intrida Data/MainComponentClass";
        ComponentIdentificationManager.XMLSourceSubComponentClassProperty = "Intrida Data/SubComponentClass";

        // // for XML  pipingnetworksegment components
        // ComponentIdentificationManager.XMLPipingNWSegSourceProperty = "Intrida Data/Source";
        // ComponentIdentificationManager.XMLPipingNWSegDestinationProperty = "Intrida Data/Destination";
        // ComponentIdentificationManager.XMLPipingNWSegOwnerProperty = "Intrida Data/OwnerId";       

        // RVM data source
        ComponentIdentificationManager.RVMSourceNameProperty = "Intrida Data/Name";
        ComponentIdentificationManager.RVMSourceMainClassProperty = "Intrida Data/Type";
        ComponentIdentificationManager.RVMSourceSubComponentClassProperty = "Intrida Data/Type";

         // Excel data source
         ComponentIdentificationManager.XLSSourceNameProperty = "Name";
         ComponentIdentificationManager.XLSSourceMainClassProperty = "MainComponentClass";
         ComponentIdentificationManager.XLSSourceSubComponentClassProperty = "ComponentClass";

         // SolidWorks data source
         ComponentIdentificationManager.SLDSourceNameProperty = "SW-File Name(File Name)";
         ComponentIdentificationManager.SLDSourceMainClassProperty = "Component Class";
         ComponentIdentificationManager.SLDSourceSubComponentClassProperty = "Component Class";

         // SolidWorks part data source
         ComponentIdentificationManager.SLDPRTNameProperty = "SW-File Name(File Name)";
         ComponentIdentificationManager.SLDPRTMainClassProperty = "Component Class";
         ComponentIdentificationManager.SLDPRTSubComponentClassProperty = "Component Class";

         // Excel data source
         ComponentIdentificationManager.RVTSourceNameProperty = "Name";
         ComponentIdentificationManager.RVTSourceMainClassProperty = "TYPE";
         ComponentIdentificationManager.RVTSourceSubComponentClassProperty = "TYPE";

        function getComponentIdentificationProperties(fileExtension, mainComponentClass) {
            var properties;
            if (fileExtension.toLowerCase() === "xml") {

                properties = {};
                properties['name'] = ComponentIdentificationManager.XMLSourceNameProperty;
                properties['mainCategory'] = ComponentIdentificationManager.XMLSourceMainClassProperty;
                properties['subClass'] = ComponentIdentificationManager.XMLSourceSubComponentClassProperty;

                // if (mainComponentClass !== undefined) {
                //     if (mainComponentClass.toLowerCase() === "pipingnetworksegment") {
                //         properties['source'] = ComponentIdentificationManager.XMLPipingNWSegSourceProperty;
                //         properties['destination'] = ComponentIdentificationManager.XMLPipingNWSegDestinationProperty;
                //         properties['ownerId'] = ComponentIdentificationManager.XMLPipingNWSegOwnerProperty;
                //     }                    
                // }
            }
            else if (fileExtension.toLowerCase() === "rvt") {

                properties = {};
                properties['name'] = ComponentIdentificationManager.RVTSourceNameProperty;
                properties['mainCategory'] = ComponentIdentificationManager.RVTSourceMainClassProperty;
                properties['subClass'] = ComponentIdentificationManager.RVTSourceSubComponentClassProperty;

                // if (mainComponentClass !== undefined) {
                //     if (mainComponentClass.toLowerCase() === "pipingnetworksegment") {
                //         properties['source'] = ComponentIdentificationManager.XMLPipingNWSegSourceProperty;
                //         properties['destination'] = ComponentIdentificationManager.XMLPipingNWSegDestinationProperty;
                //         properties['ownerId'] = ComponentIdentificationManager.XMLPipingNWSegOwnerProperty;
                //     }                    
                // }
            }
            else if (fileExtension.toLowerCase() === "rvm") {
                properties = {
                    'name': ComponentIdentificationManager.RVMSourceNameProperty,
                    'mainCategory': ComponentIdentificationManager.RVMSourceMainClassProperty,
                    'subClass': ComponentIdentificationManager.RVMSourceSubComponentClassProperty
                };
            }
            else if (fileExtension.toLowerCase() === "xls") {
                properties = {
                    'name': ComponentIdentificationManager.XLSSourceNameProperty,
                    'mainCategory': ComponentIdentificationManager.XLSSourceMainClassProperty,
                    'subClass': ComponentIdentificationManager.XLSSourceSubComponentClassProperty
                };
            }
            else if (fileExtension.toLowerCase() === "sldasm") {
                properties = {
                    'name': ComponentIdentificationManager.SLDSourceNameProperty,
                    'mainCategory': ComponentIdentificationManager.SLDSourceMainClassProperty,
                    'subClass': ComponentIdentificationManager.SLDSourceSubComponentClassProperty
                };
            }
            else if (fileExtension.toLowerCase() === "sldprt") {
                properties = {
                    'name': ComponentIdentificationManager.SLDPRTNameProperty,
                    'mainCategory': ComponentIdentificationManager.SLDPRTMainClassProperty,
                    'subClass': ComponentIdentificationManager.SLDPRTSubComponentClassProperty
                };
            }

            return properties;
        }
        ComponentIdentificationManager.getComponentIdentificationProperties = getComponentIdentificationProperties;


    })(UploadManager = xCheckStudio.ComponentIdentificationManager || (xCheckStudio.ComponentIdentificationManager = {}));
})(xCheckStudio || (xCheckStudio = {}));