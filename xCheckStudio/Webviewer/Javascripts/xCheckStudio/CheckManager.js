var comparisonCheckManager;
var sourceAComplianceCheckManager;
var sourceBComplianceCheckManager;

function CheckManager() {
    this.Name = name;

    this.CheckComponentsGroups = {};
    this.SourceANotCheckedComponents = [];
    this.SourceBNotCheckedComponents = [];
    this.SourceANotMatchedComponents = [];
    this.SourceBNotMatchedComponents = [];


    CheckManager.prototype.restore = function (checkManagerData) {
        for (var property in checkManagerData.CheckComponentsGroups) {
            if (checkManagerData.CheckComponentsGroups.hasOwnProperty(property)) {
                var componentGroupData = checkManagerData.CheckComponentsGroups[property];
                var checkComponentGroup = new CheckComponentGroup(componentGroupData.ComponentClass);
                checkComponentGroup.restore(componentGroupData);

                this.CheckComponentsGroups[componentGroupData.ComponentClass] = checkComponentGroup;
            }
        }
        this.SourceANotCheckedComponents =checkManagerData.SourceANotCheckedComponents;
        this.SourceBNotCheckedComponents = checkManagerData.SourceBNotCheckedComponents;
        this.SourceANotMatchedComponents = checkManagerData.SourceANotMatchedComponents;
        this.SourceBNotMatchedComponents = checkManagerData.SourceBNotMatchedComponents;

    }

    CheckManager.prototype.performCheck = function (sourceProperties1,
        sourceProperties2,
        checkCaseType,
        comparisonCheck,
        interfaceObject) {

        if (comparisonCheck) {
            this.checkDataSources(sourceProperties1, sourceProperties2, checkCaseType);
        }
        else {
            this.checkDataSourceForCompliance(sourceProperties1, checkCaseType, interfaceObject);
        }
    }

    CheckManager.prototype.checkDataSourceForCompliance = function (sourceProperties,
        checkCaseType,
        interfaceObject) {

        for (var i = 0; i < sourceProperties.length; i++) {
            var sourceComponentProperties = sourceProperties[i];

            // check if this property is checked or not, in Source A

            if ((interfaceObject.SourceType.toLowerCase() === "xml" ||
                interfaceObject.SourceType.toLowerCase() === "rvm") &&
                !interfaceObject._modelTree.isComponentSelected(sourceComponentProperties)) {
                     //source A not checked
                     if(this.SourceANotCheckedComponents.indexOf(sourceComponentProperties) === -1)
                     {
                         this.SourceANotCheckedComponents.push(sourceComponentProperties);
                     }
                continue;
            }
            else if (interfaceObject.SourceType.toLowerCase() === "xls" &&
                !interfaceObject.excelReader.excelModelBrowser.isComponentSelected(sourceComponentProperties)) {
                     //source A not checked
                     if(this.SourceANotCheckedComponents.indexOf(sourceComponentProperties) === -1)
                     {
                         this.SourceANotCheckedComponents.push(sourceComponentProperties);
                     }
                continue;
            }

            // check if component class exists in checkcase
            if (!checkCaseType.componentGroupExists(sourceComponentProperties.MainComponentClass)) {
                //source A not matched
                if(this.SourceANotMatchedComponents.indexOf(sourceComponentProperties) === -1)
                {
                    this.SourceANotMatchedComponents.push(sourceComponentProperties);
                }
                continue;
            }

            // get check case group
            var checkCaseGroup = checkCaseType.getComponentGroup(sourceComponentProperties.MainComponentClass);

            // check if component exists in checkCaseGroup
            if (!checkCaseGroup.componentClassExists(sourceComponentProperties.SubComponentClass)) {
                //source A not matched
                if(this.SourceANotMatchedComponents.indexOf(sourceComponentProperties) === -1)
                {
                    this.SourceANotMatchedComponents.push(sourceComponentProperties);
                }
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
                //source A not matched
                if(this.SourceANotMatchedComponents.indexOf(sourceAComponentProperties) === -1)
                {
                    this.SourceANotMatchedComponents.push(sourceAComponentProperties);
                }
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

                    var propertyName = property.Name;
                    var propertyValue = property.Value;
                    var result = this.checkComplianceRule(checkCaseMappingProperty, propertyValue);

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

    CheckManager.prototype.checkComplianceRule = function (checkCaseMappingProperty, propertyValue) {
        var result = true;

        if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.None) {

        }
        else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Must_Have_Value) {
            if (propertyValue === undefined || propertyValue === "") {
                result = false;
            }
        }
        else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Should_Be_Number) {
            if (isNaN(propertyValue) || propertyValue === "") {
                result = false;
            }
        }
        else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Should_Not_Be_Number) {
            if (!isNaN(propertyValue) && propertyValue !== "") {
                result = false;
            }
        }
        else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Should_Be_Text) {
            if (!(/^[a-z]+$/i.test(propertyValue))) {
                result = false;
            }
        }
        else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Should_Not_Be_Text) {
            if (/^[a-z]+$/i.test(propertyValue) || propertyValue === "") {
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
                    result = false;
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
        else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Should_Not_Start_With) {
            var ruleArray = checkCaseMappingProperty.RuleString.split("-");
            if (ruleArray.length < 2) {
                result = false;
            }
            else {
                var prefix = ruleArray[1];
                result = !propertyValue.startsWith(prefix);
            }
        }
        else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Should_Not_End_With) {
            var ruleArray = checkCaseMappingProperty.RuleString.split("-");
            if (ruleArray.length < 2) {
                result = false;
            }
            else {
                var prefix = ruleArray[1];
                result = !propertyValue.endsWith(prefix);
            }
        }
        else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Should_Not_Contain) {
            var ruleArray = checkCaseMappingProperty.RuleString.split("-");
            if (ruleArray.length < 2) {
                result = false;
            }
            else {
                var substring = ruleArray[1];

                if (propertyValue.indexOf(substring) !== -1) {
                    result = false;
                }
            }
        }
        else if (checkCaseMappingProperty.Rule === ComplianceCheckRulesEnum.Not_Equal_To) {
            var ruleArray = checkCaseMappingProperty.RuleString.split("-");
            if (ruleArray.length < 2) {
                result = false;
            }
            else {
                var prefix = ruleArray[1];
                result = !(propertyValue === prefix);
            }
        }

        return result;
    }

    CheckManager.prototype.checkDataSources = function (sourceAProperties,
        sourceBProperties,
        checkCaseType) {

        var comparedSourceBComponents = [];

        // compare checked properties from source A with corresponding source B properties
        for (var i = 0; i < sourceAProperties.length; i++) {
            var sourceAComponentProperties = sourceAProperties[i];

            // check if this property is checked or not, in Source A
            if ((xCheckStudioInterface1.SourceType.toLowerCase() === "xml" || xCheckStudioInterface1.SourceType.toLowerCase() === "rvm") &&
                !xCheckStudioInterface1._modelTree.isComponentSelected(sourceAComponentProperties)) {
                    //source A not checked
                    if(this.SourceANotCheckedComponents.indexOf(sourceAComponentProperties) === -1)
                      {
                          this.SourceANotCheckedComponents.push(sourceAComponentProperties);
                      }
                continue;
            }
            else if (xCheckStudioInterface1.SourceType.toLowerCase() === "xls" &&
                !xCheckStudioInterface1.excelReader.excelModelBrowser.isComponentSelected(sourceAComponentProperties)) {
                      //source A not checked
                      if(this.SourceANotCheckedComponents.indexOf(sourceAComponentProperties) === -1)
                      {
                          this.SourceANotCheckedComponents.push(sourceAComponentProperties);
                      }
                continue;
            }        

            // componentMatchFound flag
            var componentMatchFound = false;
            var checkComponentGroup = undefined;
            var checkCaseComponentClass= undefined;

            // check corresponding component in source B
            for (var j = 0; j < sourceBProperties.length; j++) {
                var sourceBComponentProperties = sourceBProperties[j];

                // check if component class exists in checkcase for Source A
                if (!checkCaseType.componentGroupExists(sourceAComponentProperties.MainComponentClass, sourceBComponentProperties.MainComponentClass)) {
                    continue;
                }

                // create or get check component group
                checkComponentGroup = this.getCheckComponentGroup(sourceAComponentProperties.MainComponentClass + "-" + sourceBComponentProperties.MainComponentClass);
                if (!checkComponentGroup) {
                    continue;
                }

                // check if component class exists in checkcase in both sources
                if (!checkCaseType.componentGroupExists(sourceAComponentProperties.MainComponentClass, sourceBComponentProperties.MainComponentClass)) {
                    continue;
                }

                // get check case group
                var checkCaseGroup = checkCaseType.getComponentGroup(sourceAComponentProperties.MainComponentClass, sourceBComponentProperties.MainComponentClass);

                // check if component exists in checkCaseGroup
                if (!checkCaseGroup.componentClassExists(sourceAComponentProperties.SubComponentClass, sourceBComponentProperties.SubComponentClass)) {
                    continue;
                }
                // get check case component
                checkCaseComponentClass = checkCaseGroup.getComponentClass(sourceAComponentProperties.SubComponentClass, sourceBComponentProperties.SubComponentClass);

                if (!this.isComponentMatch(sourceAComponentProperties, sourceBComponentProperties)) {
                    //source A not matched
                    if(this.SourceANotMatchedComponents.indexOf(sourceAComponentProperties) === -1)
                    {
                        this.SourceANotMatchedComponents.push(sourceAComponentProperties);
                    }
                    continue;
                }
                
                // mark this source B proerty compoent as matched
                comparedSourceBComponents.push(sourceBComponentProperties);

                // set componentMatchFound flag to true
                componentMatchFound = true;

                // create checkcomponent object
                var checkComponent = new CheckComponent(sourceAComponentProperties.Name,
                    sourceBComponentProperties.Name,
                    sourceAComponentProperties.SubComponentClass)
                checkComponentGroup.AddCheckComponent(checkComponent);

                for (var k = 0; k < checkCaseComponentClass.MappingProperties.length; k++) {
                    // get check case mapping property object
                    var checkCaseMappingProperty = checkCaseComponentClass.MappingProperties[k];

                    var checkProperty = this.checkProperties(checkCaseMappingProperty, sourceAComponentProperties, sourceBComponentProperties);
                    if (!checkProperty) {
                        continue;
                    }
                    checkComponent.AddCheckProperty(checkProperty);
                }

                break;
            }

            // if component match not found 
            if (!componentMatchFound) {
                var checkComponent = this.getNoMatchComponent(sourceAComponentProperties, checkCaseComponentClass, true);

                if(checkComponentGroup === undefined)
                {
                    checkComponentGroup =  this.getCheckComponentGroup(sourceAComponentProperties.MainComponentClass);
                }
                if (!checkComponentGroup) {
                    continue;
                }

                checkComponentGroup.AddCheckComponent(checkComponent);
            }
        }

        // compare checked properties from source B with corresponding source A properties
        for (var i = 0; i < sourceBProperties.length; i++) {
            var sourceBComponentProperties = sourceBProperties[i];

            // check if this component is already compared. If yes, then do nothing
            var componentCompared = false;
            for (var comparedComponentIndex = 0; comparedComponentIndex < comparedSourceBComponents.length; comparedComponentIndex++) {
                if (comparedSourceBComponents[comparedComponentIndex] === sourceBComponentProperties) {
                    componentCompared = true;
                    break;
                }
            }
            if (componentCompared) {
                continue;
            }

            // check if this property is checked or not in SOurce BG
            if ((xCheckStudioInterface2.SourceType.toLowerCase() === "xml" || xCheckStudioInterface2.SourceType.toLowerCase() === "rvm") &&
                !xCheckStudioInterface2._modelTree.isComponentSelected(sourceBComponentProperties)) {
                    //source B not checked
                    if(this.SourceBNotCheckedComponents.indexOf(sourceBComponentProperties) === -1)
                    {
                        this.SourceBNotCheckedComponents.push(sourceBComponentProperties);
                    }
                continue;
            }
            else if (xCheckStudioInterface2.SourceType.toLowerCase() === "xls" &&
                !xCheckStudioInterface2.excelReader.excelModelBrowser.isComponentSelected(sourceBComponentProperties)) {
                    //source B not checked
                    if(this.SourceBNotCheckedComponents.indexOf(sourceBComponentProperties) === -1)
                {
                    this.SourceBNotCheckedComponents.push(sourceBComponentProperties);
                }
                continue;
            }

        

            var componentMatchFound = false;
            var checkComponentGroup = undefined;
            var checkCaseComponentClass = undefined;

            for (var j = 0; j < sourceAProperties.length; j++) {
                var sourceAComponentProperties = sourceAProperties[j];

                // check if component class exists in checkcase for Source B
                if (!checkCaseType.componentGroupExists(sourceAComponentProperties.MainComponentClass, sourceBComponentProperties.MainComponentClass)) {
                    continue;
                }

                // create or get check component group
                checkComponentGroup = this.getCheckComponentGroup(sourceAComponentProperties.MainComponentClass + "-" + sourceBComponentProperties.MainComponentClass);
                if (!checkComponentGroup) {
                    continue;
                }

                // check if component class exists in checkcase
                if (!checkCaseType.componentGroupExists(sourceAComponentProperties.MainComponentClass, sourceBComponentProperties.MainComponentClass)) {
                    continue;
                }
                // get check case group for both sources
                var checkCaseGroup = checkCaseType.getComponentGroup(sourceAComponentProperties.MainComponentClass, sourceBComponentProperties.MainComponentClass);

                // check if component exists in checkCaseGroup
                if (!checkCaseGroup.componentClassExists(sourceAComponentProperties.SubComponentClass, sourceBComponentProperties.SubComponentClass)) {
                    continue;
                }
                // get check case component
                checkCaseComponentClass = checkCaseGroup.getComponentClass(sourceAComponentProperties.SubComponentClass, sourceBComponentProperties.SubComponentClass);

                // check if components are match
                if (!this.isComponentMatch(sourceAComponentProperties, sourceBComponentProperties)) {
                    // source A componenet is not checked and source b component is checked
                    // both components are not match
                    // push source b component to src B not matched array 
                    if(this.SourceBNotMatchedComponents.indexOf(sourceBComponentProperties) === -1)
                    {
                        this.SourceBNotMatchedComponents.push(sourceBComponentProperties);
                    }
                    continue;
                }

                if(this.SourceANotCheckedComponents.indexOf(sourceAComponentProperties) !== -1)
                {
                   var index = this.SourceANotCheckedComponents.indexOf(sourceAComponentProperties);
                   this.SourceANotCheckedComponents.splice(index, 1);
                }
                // source A componenet is not checked and source b component is checked
                // both components are match
                // remove src A component from src A not checked array
                componentMatchFound = true;

                // create checkcomponent object
                var checkComponent = new CheckComponent(sourceAComponentProperties.Name,
                    sourceBComponentProperties.Name,
                    sourceAComponentProperties.SubComponentClass)
                checkComponentGroup.AddCheckComponent(checkComponent);

                for (var k = 0; k < checkCaseComponentClass.MappingProperties.length; k++) {
                    // get check case mapping property object
                    var checkCaseMappingProperty = checkCaseComponentClass.MappingProperties[k];

                    var checkProperty = this.checkProperties(checkCaseMappingProperty, sourceAComponentProperties, sourceBComponentProperties);
                    if (!checkProperty) {
                        continue;
                    }
                    checkComponent.AddCheckProperty(checkProperty);
                }

                break;
            }

            // if component match not found 
            if (!componentMatchFound) {
                var checkComponent = this.getNoMatchComponent(sourceBComponentProperties, checkCaseComponentClass, false);
                if (checkComponentGroup === undefined) {
                    checkComponentGroup = this.getCheckComponentGroup(sourceBComponentProperties.MainComponentClass);
                }
                if (!checkComponentGroup) {
                    continue;
                }

                checkComponentGroup.AddCheckComponent(checkComponent);
            }
        }
    }

    CheckManager.prototype.getNoMatchComponent = function (sourceComponentProperties,
        checkCaseComponentClass,
        sourceAComponent) {

        var checkComponent;
        if (sourceAComponent) {
            checkComponent = new CheckComponent(sourceComponentProperties.Name,
                "",
                sourceComponentProperties.SubComponentClass);


            // if (checkCaseComponentClass !== undefined &&
            //     checkCaseComponentClass.MappingProperties !== undefined) {
            //     for (var k = 0; k < checkCaseComponentClass.MappingProperties.length; k++) {
            //         // get check case mapping property object
            //         var checkCaseMappingProperty = checkCaseComponentClass.MappingProperties[k];
            //         if (sourceComponentProperties.propertyExists(checkCaseMappingProperty.SourceAName)) {
            //             var property = sourceComponentProperties.getProperty(checkCaseMappingProperty.SourceAName);

            //             var checkProperty = new CheckProperty(property.Name,
            //                 property.Value,
            //                 undefined,
            //                 undefined,
            //                 "No Match",
            //                 undefined,
            //                 undefined);

            //             checkProperty.performCheck = false;
            //             checkComponent.AddCheckProperty(checkProperty);
            //         }
            //     }
            // }
            // else {
            for (var k = 0; k < sourceComponentProperties.properties.length; k++) {
                var property = sourceComponentProperties.properties[k];

                var checkProperty = new CheckProperty(property.Name,
                    property.Value,
                    undefined,
                    undefined,
                    "No Match",
                    undefined,
                    undefined);

                checkProperty.performCheck = false;
                checkComponent.AddCheckProperty(checkProperty);
            }
            //}
        }
        else {
            checkComponent = new CheckComponent("",
                sourceComponentProperties.Name,
                sourceComponentProperties.SubComponentClass);

            // if (checkCaseComponentClass !== undefined &&
            //     checkCaseComponentClass.MappingProperties !== undefined) {
            //     for (var k = 0; k < checkCaseComponentClass.MappingProperties.length; k++) {
            //         // get check case mapping property object
            //         var checkCaseMappingProperty = checkCaseComponentClass.MappingProperties[k];
            //         if (sourceComponentProperties.propertyExists(checkCaseMappingProperty.SourceBName)) {
            //             var property = sourceComponentProperties.getProperty(checkCaseMappingProperty.SourceBName);

            //             var checkProperty = new CheckProperty(undefined,
            //                 undefined,
            //                 property.Name,
            //                 property.Value,
            //                 "No Match",
            //                 undefined,
            //                 undefined);

            //             checkProperty.performCheck = false;
            //             checkComponent.AddCheckProperty(checkProperty);
            //         }
            //     }
            // }
            // else {
            for (var k = 0; k < sourceComponentProperties.properties.length; k++) {
                var property = sourceComponentProperties.properties[k];

                var checkProperty = new CheckProperty(undefined,
                    undefined,
                    property.Name,
                    property.Value,
                    "No Match",
                    undefined,
                    undefined);


                checkProperty.performCheck = false;
                checkComponent.AddCheckProperty(checkProperty);
            }
            //}

        }



        checkComponent.Status = "No Match";
        return checkComponent;
    }

    CheckManager.prototype.checkProperties = function (checkCaseMappingProperty,
        sourceAComponentProperties,
        sourceBComponentProperties) {
        // // get check case mapping property object
        // var checkCaseMappingProperty = checkCaseComponentClass.MappingProperties[k];

        var property1Name;
        var property2Name;
        var property1Value;
        var property2Value;
        var severity;
        var performCheck;
        var description;
        if (sourceAComponentProperties.propertyExists(checkCaseMappingProperty.SourceAName)) {
            if (sourceBComponentProperties.propertyExists(checkCaseMappingProperty.SourceBName)) {
                var property1 = sourceAComponentProperties.getProperty(checkCaseMappingProperty.SourceAName);
                var property2 = sourceBComponentProperties.getProperty(checkCaseMappingProperty.SourceBName);

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
                var property1 = sourceAComponentProperties.getProperty(checkCaseMappingProperty.SourceAName);

                property1Name = property1.Name;
                property2Name = checkCaseMappingProperty.SourceBName;
                property1Value = property1.Value;;
                property2Value = "";
                severity = "Error";
                performCheck = false;

                description = "Property match not found.";
            }
        }
        else if (sourceBComponentProperties.propertyExists(checkCaseMappingProperty.SourceBName)) {
            var property2 = sourceBComponentProperties.getProperty(checkCaseMappingProperty.SourceBName);

            property1Name = checkCaseMappingProperty.SourceAName;
            property2Name = property2.Name;
            property1Value = "";
            property2Value = property2.Value;
            severity = "Error";
            performCheck = false;

            description = "Property match not found.";
        }
        // if (sourceAComponentProperties.propertyExists(checkCaseMappingProperty.SourceAName) &&
        //     sourceBComponentProperties.propertyExists(checkCaseMappingProperty.SourceBName)) {

        //     var property1 = sourceAComponentProperties.getProperty(checkCaseMappingProperty.SourceAName);
        //     var property2 = sourceBComponentProperties.getProperty(checkCaseMappingProperty.SourceBName);

        //     property1Name = property1.Name;
        //     property2Name = property2.Name;
        //     property1Value = property1.Value;
        //     property2Value = property2.Value;

        //     // If both properties (Source A and Source B properties) do not have values, 
        //     // show  'No Value' severity
        //     if ((property1Value === undefined || property1Value === "") &&
        //         (property2Value === undefined || property2Value === "")) {
        //         severity = "No Value";
        //         performCheck = false;
        //         description = "Both properties have no values.";
        //     }
        //     else if ((property1Value === undefined || property1Value === "") ||
        //         (property2Value === undefined || property2Value === "")) {
        //         // If anyone of the properties has no value, then show 'Error'.
        //         severity = "Error";
        //         performCheck = false;

        //         description = "One of the properties have no value.";
        //     }
        //     else {
        //         severity = checkCaseMappingProperty.Severity;
        //         performCheck = true;

        //         description = "Property check performed";
        //     }
        // }
        // else {
        //     property1Name = checkCaseMappingProperty.SourceAName;
        //     property2Name = checkCaseMappingProperty.SourceBName;
        //     property1Value = "";
        //     property2Value = "";
        //     severity = "Error";
        //     performCheck = false;

        //     description = "Property match not found.";
        // }

        if (checkCaseMappingProperty.Comment) {
            description += "<br>" + checkCaseMappingProperty.Comment;
        }


        if (property1Name === undefined && property2Name === undefined) {
            return undefined;
        }
        var checkProperty = new CheckProperty(property1Name,
            property1Value,
            property2Name,
            property2Value,
            severity,
            performCheck,
            description);

        return checkProperty;
    }

    CheckManager.prototype.getCheckComponentGroup = function (mainComponentClass) {
        var checkComponentGroup;
        if (this.CheckComponentsGroups &&
            mainComponentClass in this.CheckComponentsGroups) {
            checkComponentGroup = this.CheckComponentsGroups[mainComponentClass];
        }
        else {
            checkComponentGroup = new CheckComponentGroup(mainComponentClass);
            this.CheckComponentsGroups[mainComponentClass] = checkComponentGroup;
        }
        // if (!checkComponentGroup) {
        //     continue;
        // }

        return checkComponentGroup;
    }

    CheckManager.prototype.isComponentMatch = function (sourceAComponentProperties,
        sourceBComponentProperties) {

        if (sourceAComponentProperties.Name === sourceBComponentProperties.Name) {


            if (sourceAComponentProperties.MainComponentClass.toLowerCase() === "pipingnetworksegment" &&
                sourceBComponentProperties.MainComponentClass.toLowerCase() === "pipingnetworksegment") {
                var sourceASource = sourceAComponentProperties.getProperty('Source');
                var sourceADestination = sourceAComponentProperties.getProperty('Destination');
                var sourceAOwnerId = sourceAComponentProperties.getProperty('OwnerId');

                var sourceBSource = sourceBComponentProperties.getProperty('Source');
                var sourceBDestination = sourceBComponentProperties.getProperty('Destination');
                var sourceBOwnerId = sourceBComponentProperties.getProperty('OwnerId');
                if (sourceASource !== undefined &&
                    sourceADestination !== undefined &&
                    sourceAOwnerId !== undefined &&
                    sourceBSource !== undefined &&
                    sourceBDestination !== undefined &&
                    sourceBOwnerId !== undefined &&
                    sourceASource.Value === sourceBSource.Value &&
                    sourceADestination.Value === sourceBDestination.Value &&
                    sourceAOwnerId.Value === sourceBOwnerId.Value) {
                    return true;
                }
                else
                {
                    return false;
                }

            }
            else if (sourceAComponentProperties.MainComponentClass.toLowerCase() === "equipment" &&
                     sourceBComponentProperties.MainComponentClass.toLowerCase() === "equipment") {

                var sourceAOwnerHandle = sourceAComponentProperties.getProperty('Handle');
                var sourceBOwnerHandle = sourceBComponentProperties.getProperty('Handle');
                if (sourceAOwnerHandle !== undefined &&
                    sourceBOwnerHandle !== undefined &&
                    sourceAOwnerHandle.Value === sourceBOwnerHandle.Value) {
                    return true;
                }
                else
                {
                    return false;
                }
            }

            return true;
        }

        return false;
    }
}


function CheckComponentGroup(componentClass) {
    this.ComponentClass = componentClass;

    this.Components = [];
    CheckComponentGroup.prototype.AddCheckComponent = function (Component) {
        this.Components.push(Component);
    }

    CheckComponentGroup.prototype.restore = function (componentGroupData) {
        //this.ComponentClass = componentGroupData.ComponentClass;
        for (var i = 0; i < componentGroupData.Components.length; i++) {
            var componentData = componentGroupData.Components[i];

            var checkComponent = new CheckComponent(componentData.SourceAName,
                componentData.SourceBName,
                componentData.SubComponentClass);

            checkComponent.restore(componentData);
            this.Components.push(checkComponent);
        }
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

    CheckComponent.prototype.restore = function (componentData) {

        // if (componentData.Status.toLowerCase() === "no match") {
        //     // if component data having status as No match, there is no need 
        //     // restore properties for this component
        //     this.Status = "No Match";
        //     return;
        // }

        for (var i = 0; i < componentData.CheckProperties.length; i++) {
            var checkPropertyData = componentData.CheckProperties[i];

            var checkProperty = new CheckProperty(checkPropertyData.SourceAName,
                checkPropertyData.SourceAValue,
                checkPropertyData.SourceBName,
                checkPropertyData.SourceBValue,
                checkPropertyData.Severity,
                checkPropertyData.PerformCheck,
                checkPropertyData.Description);

            checkProperty.Result = checkPropertyData.Result;
            this.AddCheckProperty(checkProperty);
        }

        if (componentData.Status.toLowerCase() === "no match") {
            // if component data having status as No match, there is no need 
            // restore properties for this component
            this.Status = "No Match";
        }
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


