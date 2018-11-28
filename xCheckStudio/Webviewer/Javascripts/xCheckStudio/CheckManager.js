function CheckManager(complianceCheck) {
    this.Name = name;
    this.ComplianceCheck = complianceCheck;

    this.CheckComponentsGroups = {};

    CheckManager.prototype.performCheck = function () {
        // perform property check
        //checkManager = new CheckManager(complianceCheck);

        if (!complianceCheck) {
            if (xCheckStudioInterface1 === undefined ||
                xCheckStudioInterface1 === undefined) {
                alert("Property check can't be performed.")
                return;
            }


            this.checkDataSources(xCheckStudioInterface1.sourceProperties,
                                  xCheckStudioInterface2.sourceProperties);
        }
        else {
            var sourceProperties;
            if (xCheckStudioInterface1 !== undefined &&
                xCheckStudioInterface1._firstViewer._params.containerId === activeViewerContainer.id) {
                sourceProperties = xCheckStudioInterface1.sourceProperties;
            }
            else if (xCheckStudioInterface2 !== undefined &&
                xCheckStudioInterface2._firstViewer._params.containerId === activeViewerContainer.id) {
                sourceProperties = xCheckStudioInterface2.sourceProperties;
            }
            if (sourceProperties === undefined) {
                return;
            }

            this.checkDataSourceForCompliance(sourceProperties);
        }


        // populate review table 
        reviewManager = new ReviewManager(this);
        reviewManager.populateReviewTables();

        // add event handler for collapsible rows
        var collapsibleRows = document.getElementsByClassName("collapsible");
        for (var i = 0; i < collapsibleRows.length; i++) {
            collapsibleRows[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.display === "block") {
                    content.style.display = "none";
                } else {
                    content.style.display = "block";
                }
            });
        }
    }

    CheckManager.prototype.checkDataSourceForCompliance = function (sourceProperties) {

        for (var i = 0, sourcePropertiesCollection = sourceProperties; i < sourcePropertiesCollection.length; i++) {
            var sourceComponentProperties = sourcePropertiesCollection[i];

            // get check case for comparison to perform
            var checkCase = checkCaseManager.CheckCases[0];

            // check if component class exists in checkcase
            if (!checkCase.componentGroupExists(sourceComponentProperties.MainComponentClass)) {
                continue;
            }

            // get check case group
            var checkCaseGroup = checkCase.getComponentGroup(sourceComponentProperties.MainComponentClass);

            // check if component exists in checkCaseGroup
            if (!checkCaseGroup.componentClassExists(sourceComponentProperties.SubComponentClass)) {
                continue;
            }
            // get check case component
            var checkCaseComponentClass = checkCaseGroup.getComponentClass(sourceComponentProperties.SubComponentClass);

            var checkComponentGroup;
            if (this.CheckComponentsGroups &&
                sourceComponentProperties.MainComponentClass in this.CheckComponentsGroups) {
                checkComponentGroup = this.CheckComponentsGroups[sourceComponentProperties.MainComponentClass];
            }
            else {
                checkComponentGroup = new CheckComponentGroup(sourceComponentProperties.MainComponentClass);
                this.CheckComponentsGroups[sourceComponentProperties.MainComponentClass] = checkComponentGroup;
            }
            if (!checkComponentGroup) {
                continue;
            }

            var checkComponent = new CheckComponent(sourceComponentProperties.Name,
                undefined,
                sourceComponentProperties.SubComponentClass)
            checkComponentGroup.AddCheckComponent(checkComponent);

            for (var k = 0; k < checkCaseComponentClass.MappingProperties.length; k++) {
                // get check case mapping property object
                var checkCaseMappingProperty = checkCaseComponentClass.MappingProperties[k];

                if (sourceComponentProperties.propertyExists(checkCaseMappingProperty.SourceAName)) {
                    var property = sourceComponentProperties.getProperty(checkCaseMappingProperty.SourceAName);

                    propertyName = property.Name;
                    propertyValue = property.Value;
                    result = true;
                    // if (propertyValue === undefined || propertyValue === "") {
                    //     severity = "No Value";
                    // }
                    // else {
                    // check rule
                    if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.None) {

                    }
                    else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Must_Have_Value) {
                        if (propertyValue === undefined || propertyValue === "") {
                            result = false;
                        }
                    }
                    else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Should_Be_Number) {
                        if (isNaN(propertyValue)) {
                            result = false;
                        }
                    }
                    else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Should_Start_With) {
                        var ruleArray = checkCaseMappingProperty.RuleString.split("-");
                        if (ruleArray.length < 2) {
                            result = false;
                        }
                        else {
                            var prefix = ruleArray[1];
                            result = propertyValue.startsWith(prefix);
                        }
                    }
                    else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Should_Contain) {
                        var ruleArray = checkCaseMappingProperty.RuleString.split("-");
                        if (ruleArray.length < 2) {
                            result = false;
                        }
                        else {
                            var substring = ruleArray[1];

                            if (propertyValue.indexOf(substring) === -1) {
                                result = value;
                            }
                        }
                    }
                    else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Equal_To) {
                        var ruleArray = checkCaseMappingProperty.RuleString.split("-");
                        if (ruleArray.length < 2) {
                            result = false;
                        }
                        else {
                            var prefix = ruleArray[1];
                            result = propertyValue === prefix;
                        }
                    }
                    else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Should_End_With) {
                        var ruleArray = checkCaseMappingProperty.RuleString.split("-");
                        if (ruleArray.length < 2) {
                            result = false;
                        }
                        else {
                            var prefix = ruleArray[1];
                            result = propertyValue.endsWith(prefix);                            
                        }
                    }
                    //}


                    performCheck = true;
                    var checkProperty = new CheckProperty(propertyName,
                        propertyValue,
                        "",
                        "",
                        checkCaseMappingProperty.Severity,
                        performCheck,
                        checkCaseMappingProperty.Comment);

                    checkProperty.Result = result;

                    checkComponent.AddCheckProperty(checkProperty);
                }
            }
        }
    }

    CheckManager.prototype.checkDataSources = function (source1Properties, source2Properties) {

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

            var componentMatchFound = false;

            for (var j = 0, source2PropertiesCollection = source2Properties; j < source2PropertiesCollection.length; j++) {
                var source2ComponentProperties = source2PropertiesCollection[j];

                if (source1ComponentProperties.Name === source2ComponentProperties.Name &&
                    source1ComponentProperties.MainComponentClass === source2ComponentProperties.MainComponentClass &&
                    source1ComponentProperties.SubComponentClass === source2ComponentProperties.SubComponentClass) {


                    // if component is PipingNetworkSegment, check if source and destination properties are same
                    // because they may have same tag names
                    if (source1ComponentProperties.MainComponentClass === "PipingNetworkSegment") {
                        var source1Source = source1ComponentProperties.getProperty('Source');
                        var source1Destination = source1ComponentProperties.getProperty('Destination');
                        var source1OwnerId = source1ComponentProperties.getProperty('OwnerId');
                        var source2Source = source2ComponentProperties.getProperty('Source');
                        var source2Destination = source2ComponentProperties.getProperty('Destination');
                        var source2OwnerId = source2ComponentProperties.getProperty('OwnerId');

                        if (source1Source === undefined ||
                            source1Destination === undefined ||
                            source2Source === undefined ||
                            source2Destination === undefined ||
                            source1OwnerId === undefined ||
                            source2OwnerId === undefined ||
                            source1Source.Value !== source2Source.Value ||
                            source1Destination.Value !== source2Destination.Value ||
                            source1OwnerId.Value !== source2OwnerId.Value) {
                            continue;
                        }
                    }

                    componentMatchFound = true;

                    var checkComponent = new CheckComponent(source1ComponentProperties.Name,
                        source2ComponentProperties.Name,
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
                        var description;

                        if (source1ComponentProperties.propertyExists(checkCaseMappingProperty.SourceAName) &&
                            source2ComponentProperties.propertyExists(checkCaseMappingProperty.SourceBName)) {

                            var property1 = source1ComponentProperties.getProperty(checkCaseMappingProperty.SourceAName);
                            var property2 = source2ComponentProperties.getProperty(checkCaseMappingProperty.SourceBName);

                            property1Name = property1.Name;
                            property2Name = property2.Name;
                            property1Value = property1.Value;
                            property2Value = property2.Value;

                            // If both properties (Source A and Source B properties) do not have values, 
                            // show  'No Value' severity
                            if ((property1Value === undefined || property1Value === "") &&
                                (property2Value === undefined || property2Value === "")) {
                                severity = "No Value";
                                performCheck = false;
                                description = "Both properties have no values.";
                            }
                            else if ((property1Value === undefined || property1Value === "") ||
                                (property2Value === undefined || property2Value === "")) {
                                // If anyone of the properties has no value, then show 'Error'.
                                severity = "Error";
                                performCheck = false;

                                description = "One of the properties have no value.";
                            }
                            else {
                                severity = checkCaseMappingProperty.Severity;
                                performCheck = true;

                                description = "Property check performed";
                            }
                        }
                        else {
                            property1Name = checkCaseMappingProperty.SourceAName;
                            property2Name = checkCaseMappingProperty.SourceBName;
                            property1Value = "";
                            property2Value = "";
                            severity = "Error";
                            performCheck = false;

                            description = "Property match not found.";
                        }

                        var checkProperty = new CheckProperty(property1Name,
                            property1Value,
                            property2Name,
                            property2Value,
                            severity,
                            performCheck,
                            description);

                        checkComponent.AddCheckProperty(checkProperty);
                    }

                    break;
                }
            }

            // if component match not found 
            if (!componentMatchFound) {
                var checkComponent = new CheckComponent(source1ComponentProperties.Name,
                    "",
                    source1ComponentProperties.SubComponentClass)


                for (var k = 0; k < checkCaseComponentClass.MappingProperties.length; k++) {
                    // get check case mapping property object
                    var checkCaseMappingProperty = checkCaseComponentClass.MappingProperties[k];
                    if (source1ComponentProperties.propertyExists(checkCaseMappingProperty.SourceAName)) {
                        var property1 = source1ComponentProperties.getProperty(checkCaseMappingProperty.SourceAName);
                        property1Name = property1.Name;
                        property1Value = property1.Value;

                        var checkProperty = new CheckProperty(property1Name,
                            property1Value,
                            undefined,
                            undefined,
                            "",
                            undefined,
                            undefined);

                        checkComponent.AddCheckProperty(checkProperty);
                    }
                }

                checkComponent.Status = "No Match";
                checkComponentGroup.AddCheckComponent(checkComponent);
            }
        }

        // check all source2 component match
        for (var i = 0, source2PropertiesCollection = source2Properties; i < source2PropertiesCollection.length; i++) {
            var source2ComponentProperties = source2PropertiesCollection[i];

            // get check case for comparison to perform
            var checkCase = checkCaseManager.CheckCases[0];

            // check if component class exists in checkcase
            if (!checkCase.componentGroupExists(source2ComponentProperties.MainComponentClass)) {
                continue;
            }
            // get check case group
            var checkCaseGroup = checkCase.getComponentGroup(source2ComponentProperties.MainComponentClass);

            // check if component exists in checkCaseGroup
            if (!checkCaseGroup.componentClassExists(source2ComponentProperties.SubComponentClass)) {
                continue;
            }
            // get check case component
            var checkCaseComponentClass = checkCaseGroup.getComponentClass(source2ComponentProperties.SubComponentClass);

            var checkComponentGroup;
            if (this.CheckComponentsGroups &&
                source2ComponentProperties.MainComponentClass in this.CheckComponentsGroups) {
                checkComponentGroup = this.CheckComponentsGroups[source2ComponentProperties.MainComponentClass];
            }
            else {
                checkComponentGroup = new CheckComponentGroup(source2ComponentProperties.MainComponentClass);
                this.CheckComponentsGroups[source2ComponentProperties.MainComponentClass] = checkComponentGroup;
            }
            if (!checkComponentGroup) {
                continue;
            }

            var componentMatchFound = false;

            for (var j = 0, source1PropertiesCollection = source1Properties; j < source1PropertiesCollection.length; j++) {
                var source1ComponentProperties = source1PropertiesCollection[j];

                if (source2ComponentProperties.Name === source1ComponentProperties.Name &&
                    source2ComponentProperties.MainComponentClass === source1ComponentProperties.MainComponentClass &&
                    source2ComponentProperties.SubComponentClass === source1ComponentProperties.SubComponentClass) {


                    // if component is PipingNetworkSegment, check if source and destination properties are same
                    // because they may have same tag names
                    if (source2ComponentProperties.MainComponentClass === "PipingNetworkSegment") {

                        var source2Source = source2ComponentProperties.getProperty('Source');
                        var source2Destination = source2ComponentProperties.getProperty('Destination');
                        var source2OwnerId = source2ComponentProperties.getProperty('OwnerId');

                        var source1Source = source1ComponentProperties.getProperty('Source');
                        var source1Destination = source1ComponentProperties.getProperty('Destination');
                        var source1OwnerId = source1ComponentProperties.getProperty('OwnerId');

                        if (source1Source === undefined ||
                            source1Destination === undefined ||
                            source2Source === undefined ||
                            source2Destination === undefined ||
                            source1OwnerId === undefined ||
                            source2OwnerId === undefined ||
                            source1Source.Value !== source2Source.Value ||
                            source1Destination.Value !== source2Destination.Value ||
                            source1OwnerId.Value !== source2OwnerId.Value) {
                            continue;
                        }
                    }

                    componentMatchFound = true;
                    break;
                }
            }

            // if component match not found 
            if (!componentMatchFound) {
                var checkComponent = new CheckComponent("",
                    source2ComponentProperties.Name,
                    source2ComponentProperties.SubComponentClass)

                for (var k = 0; k < checkCaseComponentClass.MappingProperties.length; k++) {
                    // get check case mapping property object
                    var checkCaseMappingProperty = checkCaseComponentClass.MappingProperties[k];
                    if (source2ComponentProperties.propertyExists(checkCaseMappingProperty.SourceAName)) {
                        var property2 = source2ComponentProperties.getProperty(checkCaseMappingProperty.SourceAName);
                        property2Name = property2.Name;
                        property2Value = property2.Value;

                        var checkProperty = new CheckProperty(undefined,
                            undefined,
                            property2Name,
                            property2Value,
                            "",
                            undefined,
                            undefined);

                        checkComponent.AddCheckProperty(checkProperty);
                    }
                }

                checkComponent.Status = "No Match";
                checkComponentGroup.AddCheckComponent(checkComponent);
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

    this.Status = "OK";
    this.CheckProperties = [];

    CheckComponent.prototype.AddCheckProperty = function (property) {
        this.CheckProperties.push(property);

        if (!property.PerformCheck) {
            // if (property.Severity.toLowerCase() === ("No Value").toLowerCase() &&
            //     this.Status.toLowerCase() !== ("Error").toLowerCase() &&
            //     this.Status.toLowerCase() !== ("Warning").toLowerCase()) {
            //     this.Status = "No Value";
            // }
            // else
            if (property.Severity.toLowerCase() === ("Error").toLowerCase()) {
                this.Status = "Error";
            }
        }
        else {
            if (!property.Result) {
                if (property.Severity.toLowerCase() === ("Error").toLowerCase()) {
                    this.Status = "Error";
                }
                else if (property.Severity.toLowerCase() === ("Warning").toLowerCase() &&
                    this.Status.toLowerCase() !== ("Error").toLowerCase()) {
                    this.Status = "Warning";
                }
            }

        }
    }

    CheckComponent.prototype.getCheckProperty = function (sourceAPropertyName, 
                                                          sourceBPropertyName,
                                                          complianceCheck) {
        for (var i = 0; i < this.CheckProperties.length; i++) {
            if (this.CheckProperties[i].SourceAName === sourceAPropertyName) {
                if (!complianceCheck) {
                    if (this.CheckProperties[i].SourceBName !== sourceBPropertyName) {
                        continue;
                    }
                }

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
    performCheck,
    description) {
    this.SourceAName = sourceAName;
    this.SourceAValue = sourceAValue;
    this.SourceBName = sourceBName;
    this.SourceBValue = sourceBValue;

    this.Result = sourceAValue === sourceBValue;

    this.Severity = severity;

    this.PerformCheck = performCheck;

    this.Description = description;
}


