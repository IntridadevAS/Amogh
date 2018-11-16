function CheckManager() {
    this.Name = name;

    this.CheckComponentsGroups = {};

    CheckManager.prototype.checkDataSources = function (source1Properties, source2Properties) {
        // var source1Properties = xCheckStudioInterface1.sourceProperties;
        // var source2Properties = xCheckStudioInterface2.sourceProperties;

        //var parentTable = document.getElementById("comparisonTable");

        for (var i = 0, source1PropertiesCollection = source1Properties; i < source1PropertiesCollection.length; i++) {
            var source1ComponentProperties = source1PropertiesCollection[i];

            // get check case for comparison to perform
            var checkCase = checkCaseManager.CheckCases[0];

            // check if component class exists in checkcase
            if (!checkCase.componentGroupExists(source1ComponentProperties.MainComponentClass)) {
                continue;
            }
            // get check case group
            var checkCaseGroup = checkCase.getComponentGroup(source1ComponentProperties.MainComponentClass);

            // check if component exists in checkCaseGroup
            if (!checkCaseGroup.componentClassExists(source1ComponentProperties.SubComponentClass)) {
                continue;
            }
            // get check case component
            var checkCaseComponentClass = checkCaseGroup.getComponentClass(source1ComponentProperties.SubComponentClass);

            var checkComponentGroup;
            if (this.CheckComponentsGroups &&
                source1ComponentProperties.MainComponentClass in this.CheckComponentsGroups) {
                checkComponentGroup = this.CheckComponentsGroups[source1ComponentProperties.MainComponentClass];
            }
            else {
                checkComponentGroup = new CheckComponentGroup(source1ComponentProperties.MainComponentClass);
                this.CheckComponentsGroups[source1ComponentProperties.MainComponentClass] = checkComponentGroup;
            }
            if (!checkComponentGroup) {
                continue;
            }

            for (var j = 0, source2PropertiesCollection = source2Properties; j < source2PropertiesCollection.length; j++) {
                var source2ComponentProperties = source2PropertiesCollection[j];

                if (source1ComponentProperties.Name === source2ComponentProperties.Name &&
                    source1ComponentProperties.MainComponentClass === source2ComponentProperties.MainComponentClass &&
                    source1ComponentProperties.SubComponentClass === source2ComponentProperties.SubComponentClass) {                  
                       
                        // if component is PipingNetworkSegment, check if source and destination properties are same
                        // because they may have same tag names
                        if( source1ComponentProperties.MainComponentClass ==="PipingNetworkSegment")
                        {
                          var source1Source =  source1ComponentProperties.getProperty('Intrida Data/Source' );
                          var source1Destination =  source1ComponentProperties.getProperty('Intrida Data/Destination' );
                          var source1OwnerId =  source1ComponentProperties.getProperty('Intrida Data/OwnerId' );
                          var source2Source =  source2ComponentProperties.getProperty('Intrida Data/Source');
                          var source2Destination =  source2ComponentProperties.getProperty('Intrida Data/Destination');
                          var source2OwnerId =  source2ComponentProperties.getProperty('Intrida Data/OwnerId');

                          if(source1Source === undefined ||
                            source1Destination === undefined ||
                            source2Source === undefined ||
                            source2Destination === undefined ||
                            source1OwnerId === undefined ||
                            source2OwnerId === undefined ||
                            source1Source.Value !== source2Source.Value || 
                            source1Destination.Value !==  source2Destination.Value ||
                            source1OwnerId.Value !== source2OwnerId.Value)
                           {
                               continue;
                           }
                        }

                        var checkComponent = new CheckComponent(source1ComponentProperties.Name,
                        source2ComponentProperties.Name,
                        /*source1ComponentProperties.Identifier,*/
                        source1ComponentProperties.SubComponentClass)
                        checkComponentGroup.AddCheckComponent(checkComponent);

                    for (var k = 0; k < checkCaseComponentClass.MappingProperties.length; k++) {
                        // get check case mapping property object
                        var checkCaseMappingProperty = checkCaseComponentClass.MappingProperties[k];

                        var property1Name;
                        var property2Name;
                        var property1Value;
                        var property2Value;
                        var severity;
                        var performCheck;
                        if (source1ComponentProperties.propertyExists('Intrida Data/' + checkCaseMappingProperty.SourceAName) &&
                            source2ComponentProperties.propertyExists('Intrida Data/' + checkCaseMappingProperty.SourceBName)) {
                            var property1 = source1ComponentProperties.getProperty('Intrida Data/' + checkCaseMappingProperty.SourceAName);
                            var property2 = source2ComponentProperties.getProperty('Intrida Data/' + checkCaseMappingProperty.SourceBName);

                            property1Name = property1.Name;
                            property2Name = property2.Name;
                            property1Value = property1.Value;
                            property2Value = property2.Value;
                            severity = checkCaseMappingProperty.Severity;
                            performCheck = true;
                        }
                        else {
                            property1Name = checkCaseMappingProperty.SourceAName;
                            property2Name = checkCaseMappingProperty.SourceBName;
                            property1Value = "";
                            property2Value = "";
                            severity = "No Match";
                            performCheck = false;
                        }

                        var checkProperty = new CheckProperty(property1Name,
                            property1Value,
                            property2Name,
                            property2Value,
                            severity,
                            performCheck);

                        checkComponent.AddCheckProperty(checkProperty);
                    }

                    break;
                }
            }
        }
    }
}


function CheckComponentGroup(componentClass) {
    this.ComponentClass = componentClass;

    this.Components = [];
    CheckComponentGroup.prototype.AddCheckComponent = function (Component) {
        this.Components.push(Component);
    }
}

function CheckComponent(sourceAName,
    sourceBName,
   /* identifier,*/
    subComponentClass) {

    //this.Identifier = identifier;
    this.SourceAName = sourceAName;
    this.SourceBName = sourceBName;
    this.SubComponentClass = subComponentClass

    this.Status = "Success";
    this.CheckProperties = [];

    CheckComponent.prototype.AddCheckProperty = function (property) {
        this.CheckProperties.push(property);
        if (!property.Result) {
            if (property.Severity.toLowerCase() === ("Error").toLowerCase()) {
                this.Status = "Error";
            }
            else if (property.Severity.toLowerCase() === ("Warning").toLowerCase() &&
                this.Status.toLowerCase() !== ("Error").toLowerCase()) {
                this.Status = "Warning";
            }
        }
        else if (property.Severity.toLowerCase() === ("No Match").toLowerCase() &&
            this.Status.toLowerCase() !== ("Error").toLowerCase() &&
            this.Status.toLowerCase() !== ("Warning").toLowerCase()) {
            this.Status = "No Match";
        }
    }

    CheckComponent.prototype.getCheckProperty = function (sourceAPropertyName, sourceBPropertyName) {
        for (var i = 0; i < this.CheckProperties.length; i++) {   
            if (this.CheckProperties[i].SourceAName === sourceAPropertyName &&
                this.CheckProperties[i].SourceBName === sourceBPropertyName) {
                return this.CheckProperties[i];
            }
        }
      
        return undefined;
    }
}

function CheckProperty(sourceAName,
    sourceAValue,
    sourceBName,
    sourceBValue,
    severity,
    performCheck) {
    this.SourceAName = sourceAName;
    this.SourceAValue = sourceAValue;
    this.SourceBName = sourceBName;
    this.SourceBValue = sourceBValue;

    this.Result = sourceAValue === sourceBValue;

    this.Severity = severity;

    this.PerformCheck = performCheck;
}


