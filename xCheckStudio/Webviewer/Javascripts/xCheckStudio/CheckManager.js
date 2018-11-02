function CheckManager() {
    this.Name = name;

    this.ComponentsGroups = {};

    CheckManager.prototype.checkDataSources = function (source1Properties, source2Properties) {
        // var source1Properties = xCheckStudioInterface1.sourceProperties;
        // var source2Properties = xCheckStudioInterface2.sourceProperties;

        var parentTable = document.getElementById("comparisonTable");

        for (var i = 0, source1PropertiesCollection = source1Properties; i < source1PropertiesCollection.length; i++) {
            var source1ComponentProperties = source1PropertiesCollection[i];

            var componentGroup;
            if (this.ComponentsGroups &&
                source1ComponentProperties.MainComponentClass in this.ComponentsGroups) {
                componentGroup = this.ComponentsGroups[source1ComponentProperties.MainComponentClass];
            }
            else {
                componentGroup = new ComponentGroup(source1ComponentProperties.MainComponentClass);
                this.ComponentsGroups[source1ComponentProperties.MainComponentClass] = componentGroup;
            }
            if (!componentGroup) {
                continue;
            }

            for (var j = 0, source2PropertiesCollection = source2Properties; j < source2PropertiesCollection.length; j++) {
                var source2ComponentProperties = source2PropertiesCollection[j];

                if (source1ComponentProperties.Name === source2ComponentProperties.Name &&
                    source1ComponentProperties.MainComponentClass === source2ComponentProperties.MainComponentClass) {
                    var checkComponent = new CheckComponent(source1ComponentProperties.Name, 
                                                            source2ComponentProperties.Name, 
                                                            source1ComponentProperties.SubComponentClass )
                    componentGroup.AddCheckComponent(checkComponent);

                    for (var k = 0; k < source1ComponentProperties.properties.length; k++) {
                        var property1 = source1ComponentProperties.properties[k];

                        for (var l = 0; l < source2ComponentProperties.properties.length; l++) {
                            var property2 = source2ComponentProperties.properties[l];

                            if (property1.Name === property2.Name) {
                                var checkProperty = new CheckProperty(property1.Name,
                                    property1.Value,
                                    property2.Name,
                                    property2.Value);


                                checkComponent.AddCheckProperty(checkProperty);
                            }
                        }

                    }

                    break;
                }
            }
        }
    }
}

// function ComponentGroups(componentClass) {
//     this.ComponentClass = componentClass;

//     this.ComponentGroups;
// }

function ComponentGroup(componentClass) {
    this.ComponentClass = componentClass;

    this.Components = [];
    ComponentGroup.prototype.AddCheckComponent = function (Component) {
        this.Components.push(Component);
    }
}

function CheckComponent(sourceAName,
    sourceBName,
    subComponentClass) {
    this.SourceAName = sourceAName;
    this.SourceBName = sourceBName;
    this.SubComponentClass = subComponentClass

    this.Status;
    this.CheckProperties = [];
    CheckComponent.prototype.AddCheckProperty = function (property) {
        this.CheckProperties.push(property);
    }
}

function CheckProperty(sourceAName,
    sourceAValue,
    sourceBName,
    sourceBValue) {
    this.SourceAName = sourceAName;
    this.SourceAValue = sourceAValue;
    this.SourceBName = sourceBName;
    this.SourceBValue = sourceBValue;

    this.Result = sourceAValue === sourceBValue;
}


