function CheckCaseManager() {
    this.CheckCase;

    //this.Ready = true;
    // CheckCaseManager.prototype.addCheckCase = function (checkCase) {
    //     this.CheckCases.push(checkCase);
    // }

    CheckCaseManager.prototype.readCheckCaseData = function (fileName) {
        var _this = this;

        // set ready flag to false, to hold the execution of dependent code

        //  _this.Ready = false;

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                _this.readCheckCaseXml(this);

                // set ready flag to true
                //_this.Ready = true;
                
                // notify that check case data ready is complete
                _this.onCheckCaseDataReadComplete();
            }
        };

        //xhttp.open("GET", "configurations/XML_2_XML_Datamapping.xml", true);
        xhttp.open("GET", "configurations/" + fileName, true);
        xhttp.send();
    }

    CheckCaseManager.prototype.onCheckCaseDataReadComplete = function () {

        // // perform property check
        // checkManager = new CheckManager(complianceCheck);
        // checkManager.performCheck();
    }

    CheckCaseManager.prototype.readCheckCaseXml = function (xml) {
        var xmlText = xml.responseText;

        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlText, "application/xml");

        var checkCaseElements = xmlDoc.getElementsByTagName("CheckCase");
        if (checkCaseElements.length < 0) {
            return;
        }

        // check case manager object
        // checkCaseManager = new CheckCaseManager();

        var checkCaseElement = checkCaseElements[0];

        // CheckCase object
        var checkCaseName = checkCaseElement.getAttribute("name");
        // var complianceCheck = checkCaseElement.getAttribute("complianceCheck");
        var checkCase = new CheckCase(checkCaseName/*, complianceCheck*/);

        //for (var i = 0; i < checkCaseElement.children.length; i++) {
        for (var checkTypeIndex = 0; checkTypeIndex < checkCaseElement.children.length; checkTypeIndex++) {
            var checkTypeElement = checkCaseElement.children[checkTypeIndex];
            if (checkTypeElement.localName != "Check") {
                continue;
            }

            var checkTypeName = checkTypeElement.getAttribute("type");
            var sourceAType = checkTypeElement.getAttribute("sourceType");
            var sourceBType;

            if (sourceAType === undefined ||
                sourceAType === null) {
                sourceAType = checkTypeElement.getAttribute("sourceAType");
                sourceBType = checkTypeElement.getAttribute("sourceBType");
            }

            var checkType = new CheckType(checkTypeName, sourceAType, sourceBType);

            if (sourceAType === "XLS" && sourceBType === "XML") {
                for (var componentGroupIndex = 0; componentGroupIndex < checkTypeElement.children.length; componentGroupIndex++) {
                    var componentGroupElement = checkTypeElement.children[componentGroupIndex];
                    if (componentGroupElement.localName != "ComponentGroup") {
                        continue;
                    }

                    // ComponentGroup object
                    var checkCaseComponentGroups = new CheckCaseComponentGroups(componentGroupElement.getAttribute("sourceAGroupName"), componentGroupElement.getAttribute("sourceBGroupName"));

                    for (var j = 0; j < componentGroupElement.children.length; j++) {
                        var componentElement = componentGroupElement.children[j];
                        if (componentElement.localName != "ComponentClass") {
                            continue;
                        }

                        // Component object
                        var checkCaseComponentClasses = new CheckCaseComponentClasses(componentElement.getAttribute("sourceAComponentClass"), componentElement.getAttribute("sourceBComponentClass"));

                        for (var k = 0; k < componentElement.children.length; k++) {
                            var propertyElement = componentElement.children[k];
                            if (propertyElement.localName != "Property") {
                                continue;
                            }

                            var sourceAProperty = propertyElement.getAttribute("name");
                            var sourceBProperty;
                            var rule;
                            if (sourceAProperty === undefined ||
                                sourceAProperty === null) {
                                sourceAProperty = propertyElement.getAttribute("sourceAName");
                                sourceBProperty = propertyElement.getAttribute("sourceBName");
                            }
                            else {
                                rule = propertyElement.getAttribute("rule");
                            }
                            var severity = propertyElement.getAttribute("severity");
                            var comment = propertyElement.getAttribute("comment");

                            // create mapping property object 
                            var checkCaseMappingProperty = new CheckCaseMappingProperty(sourceAProperty,
                                sourceBProperty,
                                severity,
                                rule,
                                comment);
                            checkCaseComponentClasses.addMappingProperty(checkCaseMappingProperty);
                        }

                        checkCaseComponentGroups.addComponent(checkCaseComponentClasses);
                    }

                    checkType.addComponentGroup(checkCaseComponentGroups);
                }
            }

            else if (sourceAType === sourceBType) {
                for (var componentGroupIndex = 0; componentGroupIndex < checkTypeElement.children.length; componentGroupIndex++) {
                    var componentGroupElement = checkTypeElement.children[componentGroupIndex];
                    if (componentGroupElement.localName != "ComponentGroup") {
                        continue;
                    }

                    // ComponentGroup object
                    var checkCaseComponentGroup = new CheckCaseComponentGroup(componentGroupElement.getAttribute("name"));

                    for (var j = 0; j < componentGroupElement.children.length; j++) {
                        var componentElement = componentGroupElement.children[j];
                        if (componentElement.localName != "ComponentClass") {
                            continue;
                        }

                        // Component object
                        var checkCaseComponentClass = new CheckCaseComponentClass(componentElement.getAttribute("name"));

                        for (var k = 0; k < componentElement.children.length; k++) {
                            var propertyElement = componentElement.children[k];
                            if (propertyElement.localName != "Property") {
                                continue;
                            }

                            var sourceAProperty = propertyElement.getAttribute("name");
                            var sourceBProperty;
                            var rule;
                            if (sourceAProperty === undefined ||
                                sourceAProperty === null) {
                                sourceAProperty = propertyElement.getAttribute("sourceAName");
                                sourceBProperty = propertyElement.getAttribute("sourceBName");
                            }
                            else {
                                rule = propertyElement.getAttribute("rule");
                            }

                            // if (complianceCheck.toLowerCase() == "true".toLowerCase()) {
                            //     sourceAProperty = propertyElement.getAttribute("name");
                            //     rule = propertyElement.getAttribute("rule");
                            // }
                            // else {
                            //     sourceAProperty = propertyElement.getAttribute("sourceAName");
                            //     sourceBProperty = propertyElement.getAttribute("sourceBName");
                            // }
                            var severity = propertyElement.getAttribute("severity");
                            var comment = propertyElement.getAttribute("comment");

                            // create mapping property object 
                            var checkCaseMappingProperty = new CheckCaseMappingProperty(sourceAProperty,
                                sourceBProperty,
                                severity,
                                rule,
                                comment);
                            checkCaseComponentClass.addMappingProperty(checkCaseMappingProperty);
                        }

                        checkCaseComponentGroup.addComponent(checkCaseComponentClass);
                    }

                    checkType.addComponentGroup(checkCaseComponentGroup);
                }
            }

            checkCase.addCheckType(checkType);
        }

        //this.addCheckCase(checkCase);
        this.CheckCase = checkCase;
    }
}

function CheckCase(name/*, complianceCheck*/) {
    this.Name = name;
    //this.ComplianceCheck = complianceCheck;

    this.CheckTypes = [];

    CheckCase.prototype.addCheckType = function (checkType) {
        this.CheckTypes.push(checkType);
    }

    CheckCase.prototype.checkTypeExists = function (checkTypeName) {
        for (var i = 0; i < this.CheckTypes.length; i++) {
            if (this.CheckTypes[i].Name === checkTypeName) {
                return true;
            }
        }

        return false;
    }

    CheckCase.prototype.getCheckType = function (checkTypeName) {
        for (var i = 0; i < this.CheckTypes.length; i++) {
            if (this.CheckTypes[i].Name === checkTypeName) {
                return this.CheckTypes[i];
            }
        }

        return undefined;
    }
}

function CheckType(name,
    sourceAType,
    sourceBType) {
    this.Name = name;
    this.SourceAType = sourceAType;
    this.SourceBType = sourceBType;

    this.ComponentGroups = [];

    CheckType.prototype.addComponentGroup = function (componentGroup) {
        this.ComponentGroups.push(componentGroup);
    }

    CheckType.prototype.componentGroupExists = function (componentClass) {
        for (var i = 0; i < this.ComponentGroups.length; i++) {
            if (this.ComponentGroups[i].Name === componentClass) {
                return true;
            }
            else if(this.ComponentGroups[i].SourceAGroupName === componentClass || this.ComponentGroups[i].SourceBGroupName === componentClass)
            {
                return true;
            }
        }

        return false;
    }

    CheckType.prototype.getComponentGroup = function (componentClass) {
        for (var i = 0; i < this.ComponentGroups.length; i++) {
            if (this.ComponentGroups[i].Name === componentClass) {
                return this.ComponentGroups[i];
            }
            else if(this.ComponentGroups[i].SourceAGroupName === componentClass || this.ComponentGroups[i].SourceBGroupName === componentClass )
            {
                    return this.ComponentGroups[i];
            }
        }

        return undefined;
    }
}

function CheckCaseComponentGroup(name) {
    this.Name = name;

    this.ComponentClasses = [];

    CheckCaseComponentGroup.prototype.addComponent = function (componentClass) {
        this.ComponentClasses.push(componentClass);
    }

    CheckCaseComponentGroup.prototype.componentClassExists = function (className) {
        for (var i = 0; i < this.ComponentClasses.length; i++) {
            if (this.ComponentClasses[i].ClassName === className) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentGroup.prototype.getComponentClass = function (className) {
        for (var i = 0; i < this.ComponentClasses.length; i++) {
            if (this.ComponentClasses[i].ClassName === className) {
                return this.ComponentClasses[i];
            }
        }

        return undefined;
    }
}

function CheckCaseComponentClass(className) {
    this.ClassName = className;

    this.MappingProperties = [];

    CheckCaseComponentClass.prototype.addMappingProperty = function (mappingProperty) {
        this.MappingProperties.push(mappingProperty);
    }

    CheckCaseComponentClass.prototype.propertyExists = function (sourceApropertyName, sourceBpropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceAName === sourceApropertyName &&
                this.MappingProperties[i].SourceBName === sourceBpropertyName) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentClass.prototype.sourceAPropertyExists = function (sourceApropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceAName === sourceApropertyName) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentClass.prototype.sourceBPropertyExists = function (sourceBpropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceBName === sourceBpropertyName) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentClass.prototype.getProperty = function (sourceApropertyName, sourceBpropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceAName === sourceApropertyName &&
                this.MappingProperties[i].SourceBName === sourceBpropertyName) {
                return this.MappingProperties[i];
            }
        }

        return undefined;
    }
}

function CheckCaseMappingProperty(sourceAName,
    sourceBName,
    severity,
    ruleString,
    comment) {
    this.SourceAName = sourceAName;
    this.SourceBName = sourceBName;
    this.Severity = severity;
    this.RuleString = ruleString;
    this.Comment = comment;
    if (this.RuleString) {
        if (ruleString === "") {
            this.Rule = ComplianceCheckRulesEnum.None;
        }
        else if (ruleString.toLowerCase() === "must have value") {
            this.Rule = ComplianceCheckRulesEnum.Must_Have_Value;
        }
        else if (ruleString.toLowerCase() === "should be number") {
            this.Rule = ComplianceCheckRulesEnum.Should_Be_Number;
        }
        else if (ruleString.toLowerCase() === "should not be number") {
            this.Rule = ComplianceCheckRulesEnum.Should_Not_Be_Number;
        }
        else if (ruleString.toLowerCase() === "should be text") {
            this.Rule = ComplianceCheckRulesEnum.Should_Be_Text;
        }
        else if (ruleString.toLowerCase() === "should not be text") {
            this.Rule = ComplianceCheckRulesEnum.Should_Not_Be_Text;
        }
        else {
            var ruleArray = ruleString.split("-");
            if (ruleArray[0].toLowerCase() === "should start with") {
                this.Rule = ComplianceCheckRulesEnum.Should_Start_With;
            }
            else if (ruleArray[0].toLowerCase() === "should contain") {
                this.Rule = ComplianceCheckRulesEnum.Should_Contain;
            }
            else if (ruleArray[0].toLowerCase() === "equal to") {
                this.Rule = ComplianceCheckRulesEnum.Equal_To;
            }
            else if (ruleArray[0].toLowerCase() === "should end with") {
                this.Rule = ComplianceCheckRulesEnum.Should_End_With;
            }
            else if (ruleArray[0].toLowerCase() === "should not start with") {
                this.Rule = ComplianceCheckRulesEnum.Should_Not_Start_With;
            }
            else if (ruleArray[0].toLowerCase() === "should not end with") {
                this.Rule = ComplianceCheckRulesEnum.Should_Not_End_With;
            }
            else if (ruleArray[0].toLowerCase() === "should not contain") {
                this.Rule = ComplianceCheckRulesEnum.Should_Not_Contain;
            }
            else if (ruleArray[0].toLowerCase() === "not equal to") {
                this.Rule = ComplianceCheckRulesEnum.Not_Equal_To;
            }
        }
    }
}


function CheckCaseComponentGroups(nameA, nameB) {
    this.SourceAGroupName = nameA;
    this.SourceBGroupName = nameB;

    this.ComponentClasses = [];

    CheckCaseComponentGroups.prototype.addComponent = function (componentClass) {
        this.ComponentClasses.push(componentClass);
    }

    CheckCaseComponentGroups.prototype.componentClassExists = function (className) {
        for (var i = 0; i < this.ComponentClasses.length; i++) {
            if (this.ComponentClasses[i].SourceAClassName === className || this.ComponentClasses[i].SourceBClassName === className) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentGroups.prototype.getComponentClass = function (className) {
        for (var i = 0; i < this.ComponentClasses.length; i++) {
            if (this.ComponentClasses[i].SourceAClassName === className || this.ComponentClasses[i].SourceBClassName === className) {
                return this.ComponentClasses[i];
            }
        }

        return undefined;
    }
}

function CheckCaseComponentClasses(classAName, classBName) {
    this.SourceAClassName = classAName;
    this.SourceBClassName = classBName;

    this.MappingProperties = [];

    CheckCaseComponentClasses.prototype.addMappingProperty = function (mappingProperty) {
        this.MappingProperties.push(mappingProperty);
    }

    CheckCaseComponentClasses.prototype.propertyExists = function (sourceApropertyName, sourceBpropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceAName === sourceApropertyName &&
                this.MappingProperties[i].SourceBName === sourceBpropertyName) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentClasses.prototype.sourceAPropertyExists = function (sourceApropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceAName === sourceApropertyName) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentClasses.prototype.sourceBPropertyExists = function (sourceBpropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceBName === sourceBpropertyName) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentClasses.prototype.getProperty = function (sourceApropertyName, sourceBpropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceAName === sourceApropertyName &&
                this.MappingProperties[i].SourceBName === sourceBpropertyName) {
                return this.MappingProperties[i];
            }
        }

        return undefined;
    }
}