
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

         ComponentIdentificationManager.DBSourceNameProperty = "Name";
         ComponentIdentificationManager.DBSourceMainClassProperty = "MainComponentClass";
         ComponentIdentificationManager.DBSourceSubComponentClassProperty = "ComponentClass";

         // SolidWorks data source
         ComponentIdentificationManager.SLDSourceNameProperty = "SW-File Name(File Name)";
         ComponentIdentificationManager.SLDSourceMainClassProperty = "Component Class";
         ComponentIdentificationManager.SLDSourceSubComponentClassProperty = "Component Class";

         // SolidWorks part data source
         ComponentIdentificationManager.SLDPRTNameProperty = "SW-File Name(File Name)";
         ComponentIdentificationManager.SLDPRTMainClassProperty = "Component Class";
         ComponentIdentificationManager.SLDPRTSubComponentClassProperty = "Component Class";

         // RVT data source
         ComponentIdentificationManager.RVTSourceNameProperty = "Name";
         ComponentIdentificationManager.RVTSourceMainClassProperty = "TYPE";
         ComponentIdentificationManager.RVTSourceSubComponentClassProperty = "TYPE";

         // IGS data source
         ComponentIdentificationManager.IGSSourceNameProperty = "Name";
         ComponentIdentificationManager.IGSSourceMainClassProperty = "TYPE";
         ComponentIdentificationManager.IGSSourceSubComponentClassProperty = "TYPE";
         
        //IFC data source
        ComponentIdentificationManager.IFCSourceNameProperty = "Name";
        ComponentIdentificationManager.IFCSourceMainClassProperty = "TYPE";
        ComponentIdentificationManager.IFCSourceSubComponentClassProperty = "TYPE";

        //Step data source
        ComponentIdentificationManager.STEPSourceNameProperty = "Name";
        ComponentIdentificationManager.STEPSourceMainClassProperty = "TYPE";
        ComponentIdentificationManager.STEPSourceSubComponentClassProperty = "TYPE";

        //Ste data source
        ComponentIdentificationManager.STESourceNameProperty = "Name";
        ComponentIdentificationManager.STESourceMainClassProperty = "TYPE";
        ComponentIdentificationManager.STESourceSubComponentClassProperty = "TYPE";

        //Stp data source
        ComponentIdentificationManager.STPSourceNameProperty = "Name";
        ComponentIdentificationManager.STPSourceMainClassProperty = "TYPE";
        ComponentIdentificationManager.STPSourceSubComponentClassProperty = "TYPE";

         //Visio data source
         ComponentIdentificationManager.VisioSourceNameProperty = "VMD_<*>_NAME";
         ComponentIdentificationManager.VisioSourceMainClassProperty = "VMD_<*>_ACTTYP";
         ComponentIdentificationManager.VisioSourceSubComponentClassProperty = "VMD_<*>_ACTTYP";
         ComponentIdentificationManager.VisioOwnerProperty = "VMD_<*>_OWNER";

        function getComponentIdentificationProperties(fileExtension, mainComponentClass) {
            var properties;
            properties = {};
            var name = "";
            var mainCategory = "";
            var subClass = "";
            var owner = "";

            var extension = fileExtension.toLowerCase();
            switch(extension){
                case "xml":
                    name = ComponentIdentificationManager.XMLSourceNameProperty;
                    mainCategory = ComponentIdentificationManager.XMLSourceMainClassProperty;
                    subClass = ComponentIdentificationManager.XMLSourceSubComponentClassProperty;
                    break;
                case "rvt":
                    name = ComponentIdentificationManager.RVTSourceNameProperty;
                    mainCategory = ComponentIdentificationManager.RVTSourceMainClassProperty;
                    subClass = ComponentIdentificationManager.RVTSourceSubComponentClassProperty;
                    break;
                case "igs":
                    name = ComponentIdentificationManager.IGSSourceNameProperty;
                    mainCategory = ComponentIdentificationManager.IGSSourceMainClassProperty;
                    subClass = ComponentIdentificationManager.IGSSourceSubComponentClassProperty;
                    break;
                case "ifc":
                    name = ComponentIdentificationManager.IFCSourceNameProperty;
                    mainCategory = ComponentIdentificationManager.IFCSourceMainClassProperty;
                    subClass = ComponentIdentificationManager.IFCSourceSubComponentClassProperty;
                    break;
                case "step":
                    name = ComponentIdentificationManager.STEPSourceNameProperty;
                    mainCategory = ComponentIdentificationManager.STEPSourceMainClassProperty;
                    subClass = ComponentIdentificationManager.STEPSourceSubComponentClassProperty;
                    break;
                case "stp":
                    name = ComponentIdentificationManager.STPSourceNameProperty;
                    mainCategory = ComponentIdentificationManager.STPSourceMainClassProperty;
                    subClass = ComponentIdentificationManager.STPSourceSubComponentClassProperty;
                    break;
                case "ste":
                    name = ComponentIdentificationManager.STESourceNameProperty;
                    mainCategory = ComponentIdentificationManager.STESourceMainClassProperty;
                    subClass = ComponentIdentificationManager.STESourceSubComponentClassProperty;
                    break;
                case "rvm":
                    name = ComponentIdentificationManager.RVMSourceNameProperty;
                    mainCategory = ComponentIdentificationManager.RVMSourceMainClassProperty;
                    subClass = ComponentIdentificationManager.RVMSourceSubComponentClassProperty;
                    break;
                case "xls":
                    name = ComponentIdentificationManager.XLSSourceNameProperty;
                    mainCategory = ComponentIdentificationManager.XLSSourceMainClassProperty;
                    subClass = ComponentIdentificationManager.XLSSourceSubComponentClassProperty;
                    break;
                case "json":
                    name = ComponentIdentificationManager.DBSourceNameProperty;
                    mainCategory = ComponentIdentificationManager.DBSourceMainClassProperty;
                    subClass = ComponentIdentificationManager.DBSourceSubComponentClassProperty;
                    break;
                case "sldasm":
                    name = ComponentIdentificationManager.SLDSourceNameProperty;
                    mainCategory = ComponentIdentificationManager.SLDSourceMainClassProperty;
                    subClass = ComponentIdentificationManager.SLDSourceSubComponentClassProperty;
                    break;
                case "sldprt":
                    name = ComponentIdentificationManager.SLDPRTNameProperty;
                    mainCategory = ComponentIdentificationManager.SLDPRTMainClassProperty;
                    subClass = ComponentIdentificationManager.SLDPRTSubComponentClassProperty;
                    break;
                case "vsd":
                case "vsdx":
                    name = ComponentIdentificationManager.VisioSourceNameProperty;
                    mainCategory = ComponentIdentificationManager.VisioSourceMainClassProperty;
                    subClass = ComponentIdentificationManager.VisioSourceSubComponentClassProperty;
                    owner = ComponentIdentificationManager.VisioOwnerProperty;
                    break;
            }
            properties['name'] = name;        
            properties['mainCategory'] = mainCategory;
            properties['subClass'] = subClass;
            properties['owner'] = owner;
            return properties;
        }
        ComponentIdentificationManager.getComponentIdentificationProperties = getComponentIdentificationProperties;


    })(ComponentIdentificationManager = xCheckStudio.ComponentIdentificationManager || (xCheckStudio.ComponentIdentificationManager = {}));
})(xCheckStudio || (xCheckStudio = {}));