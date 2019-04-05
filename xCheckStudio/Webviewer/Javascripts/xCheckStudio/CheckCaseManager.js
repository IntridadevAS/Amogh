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
            var sourceBType = undefined;

            if (sourceAType === undefined ||
                sourceAType === null) {
                sourceAType = checkTypeElement.getAttribute("sourceAType");
                sourceBType = checkTypeElement.getAttribute("sourceBType");
            }

            var checkType = new CheckType(checkTypeName, sourceAType, sourceBType);

            //if (sourceAType === "XLS" && sourceBType === "XML") {
            for (var componentGroupIndex = 0; componentGroupIndex < checkTypeElement.children.length; componentGroupIndex++) {
                var componentGroupElement = checkTypeElement.children[componentGroupIndex];
                if (componentGroupElement.localName != "ComponentGroup") {
                    continue;
                }

                // ComponentGroup object
                var sourceAGroupName = undefined;
                var sourceBGroupName = undefined;
                sourceAGroupName = componentGroupElement.getAttribute("name");
                if (!sourceAGroupName) {
                    sourceAGroupName = componentGroupElement.getAttribute("sourceAGroupName");
                    sourceBGroupName = componentGroupElement.getAttribute("sourceBGroupName");
                }

                var checkCaseComponentGroup = new CheckCaseComponentGroup(sourceAGroupName, sourceBGroupName);

                for (var j = 0; j < componentGroupElement.children.length; j++) {
                    var componentElement = componentGroupElement.children[j];
                    if (componentElement.localName != "ComponentClass") {
                        continue;
                    }

                    // Component object
                    var sourceAClassName = undefined;
                    var sourceBClassName = undefined;
                    sourceAClassName = componentElement.getAttribute("name");
                    if (!sourceAClassName) {
                        sourceAClassName = componentElement.getAttribute("sourceAComponentClass");
                        sourceBClassName = componentElement.getAttribute("sourceBComponentClass");
                    }
                    var checkCaseComponentClass = new CheckCaseComponentClass(sourceAClassName, sourceBClassName);

                    for (var k = 0; k < componentElement.children.length; k++) {
                        var propertyElement = componentElement.children[k];

                        if (propertyElement.localName.toLowerCase() === "matchwith") {
                            //checkCaseComponentClass.SourceAMatchwithProperty = propertyElement.getAttribute("sourceAPropertyname");
                            //checkCaseComponentClass.SourceBMatchwithProperty = propertyElement.getAttribute("sourceBPropertyname");

                            var sourceAMatchProperty = propertyElement.getAttribute("sourceAPropertyname");
                            var sourceBMatchProperty = propertyElement.getAttribute("sourceBPropertyname");

                            if (sourceAMatchProperty !== undefined &&
                                sourceBMatchProperty !== undefined &&
                                !(sourceAMatchProperty in checkCaseComponentClass.MatchwithProperties)) {
                                    checkCaseComponentClass.MatchwithProperties[sourceAMatchProperty] =  sourceBMatchProperty;
                            }
                        }
                        else if (propertyElement.localName.toLowerCase() === "property") {

                            var sourceAProperty = propertyElement.getAttribute("name");
                            var sourceBProperty = undefined;
                            var rule = undefined;
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
                            checkCaseComponentClass.addMappingProperty(checkCaseMappingProperty);
                        }
                    }

                    checkCaseComponentGroup.addComponent(checkCaseComponentClass);
                }

                checkType.addComponentGroup(checkCaseComponentGroup);
            }

            checkCase.addCheckType(checkType);
        }

        //this.addCheckCase(checkCase);
        this.CheckCase = checkCase;
        this.postData();
    }

    CheckCaseManager.prototype.postData = function () {
        $.ajax({
            url: 'PHP/CheckCaseDataWriter.php',
            type: "POST",
            async: true,
            data: { "ComponentClassesData": JSON.stringify(this.CheckCase) },
            success: function (data) {
                // alert("success");
            }
        });

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

    CheckType.prototype.componentGroupExists = function (sourceAGroupName, sourceBGroupName) {
        for (var i = 0; i < this.ComponentGroups.length; i++) {
            // check for source A only
            if (sourceBGroupName === undefined &&
                this.ComponentGroups[i].SourceAName.toLowerCase() === sourceAGroupName.toLowerCase()) {
                return true;
            }

            // check for source B only
            if (sourceAGroupName === undefined &&
                this.ComponentGroups[i].SourceBName.toLowerCase() === sourceBGroupName.toLowerCase()) {
                return true;
            }


            // check for both sources
            if (this.ComponentGroups[i].SourceAName.toLowerCase() === sourceAGroupName.toLowerCase() &&
                this.ComponentGroups[i].SourceBName.toLowerCase() === sourceBGroupName.toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    CheckType.prototype.getComponentGroup = function (sourceAGroupName, sourceBGroupName) {
        for (var i = 0; i < this.ComponentGroups.length; i++) {

            // check for source A only
            if (sourceBGroupName === undefined &&
                this.ComponentGroups[i].SourceAName.toLowerCase() === sourceAGroupName.toLowerCase()) {
                return this.ComponentGroups[i];
            }

            // check for source B only
            if (sourceAGroupName === undefined &&
                this.ComponentGroups[i].SourceBName.toLowerCase() === sourceBGroupName.toLowerCase()) {
                return this.ComponentGroups[i];
            }

            // check for both sources
            if (this.ComponentGroups[i].SourceAName.toLowerCase() === sourceAGroupName.toLowerCase() &&
                this.ComponentGroups[i].SourceBName.toLowerCase() === sourceBGroupName.toLowerCase()) {
                return this.ComponentGroups[i];
            }
        }

        return undefined;
    }
}

function CheckCaseComponentGroup(sourceAName, sourceBName) {
    //this.Name = name;
    this.SourceAName = sourceAName;
    this.SourceBName = sourceBName;

    this.ComponentClasses = [];

    CheckCaseComponentGroup.prototype.addComponent = function (componentClass) {
        this.ComponentClasses.push(componentClass);
    }

    CheckCaseComponentGroup.prototype.componentClassExists = function (sourceAClassName, sourceBClassName) {
        for (var i = 0; i < this.ComponentClasses.length; i++) {
            if (sourceAClassName === undefined &&
                sourceBClassName !== undefined &&
                this.ComponentClasses[i].SourceBName.toLowerCase() === sourceBClassName.toLowerCase()) {
                return true;
            }
            
            if (sourceBClassName === undefined &&
                sourceAClassName !== undefined &&
                this.ComponentClasses[i].SourceAName.toLowerCase() === sourceAClassName.toLowerCase()) {
                return true;
            }

            if (sourceAClassName !== undefined &&
                sourceBClassName !== undefined &&
                this.ComponentClasses[i].SourceAName.toLowerCase() === sourceAClassName.toLowerCase() &&
                this.ComponentClasses[i].SourceBName.toLowerCase() === sourceBClassName.toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentGroup.prototype.getComponentClass = function (sourceAClassName, sourceBClassName) {
        for (var i = 0; i < this.ComponentClasses.length; i++) {

            if (sourceBClassName === undefined &&
                this.ComponentClasses[i].SourceAName.toLowerCase() === sourceAClassName.toLowerCase()) {
                return this.ComponentClasses[i];
            }

            if (sourceAClassName !== undefined &&
                sourceBClassName !== undefined &&
                this.ComponentClasses[i].SourceAName.toLowerCase() === sourceAClassName.toLowerCase() &&
                this.ComponentClasses[i].SourceBName.toLowerCase() === sourceBClassName.toLowerCase()) {
                return this.ComponentClasses[i];
            }
        }

        return undefined;
    }
}

function CheckCaseComponentClass(sourceAName, sourceBName) {
    //this.ClassName = className;
    this.SourceAName = sourceAName;
    this.SourceBName = sourceBName;

    //this.SourceAMatchwithProperty;
    //this.SourceBMatchwithProperty;
    this.MatchwithProperties={};

    this.MappingProperties = [];

    CheckCaseComponentClass.prototype.addMappingProperty = function (mappingProperty) {
        this.MappingProperties.push(mappingProperty);
    }

    CheckCaseComponentClass.prototype.propertyExists = function (sourceApropertyName, sourceBpropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceAName.toLowerCase() === sourceApropertyName.toLowerCase() &&
                this.MappingProperties[i].SourceBName.toLowerCase() === sourceBpropertyName.toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentClass.prototype.sourceAPropertyExists = function (sourceApropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceAName.toLowerCase() === sourceApropertyName.toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentClass.prototype.sourceBPropertyExists = function (sourceBpropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceBName.toLowerCase() === sourceBpropertyName.toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentClass.prototype.getProperty = function (sourceApropertyName, sourceBpropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceAName.toLowerCase() === sourceApropertyName.toLowerCase() &&
                this.MappingProperties[i].SourceBName.toLowerCase() === sourceBpropertyName.toLowerCase()) {
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

