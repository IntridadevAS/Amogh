<?php

class CheckCaseManager {
    $CheckCase;

    function readCheckCaseData($fileName) {
      
        $doc = new DOMDocument();
        $doc->load( $fileName );

        // $xml=simplexml_load_file($fileName) or die("Error: Cannot load xml");
        readCheckCaseXml( $doc);
        ////////////////
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

    function readCheckCaseXml ($xml) {
        //var xmlText = xml.responseText;

        $checkCaseElements = $xml->getElementsByTagName( 'CheckCase');
        $checkCaseElement  = $checkCaseElements->item(0)
        
        // var parser = new DOMParser();
        // var xmlDoc = parser.parseFromString(xmlText, "application/xml");

        // var checkCaseElements = xmlDoc.getElementsByTagName("CheckCase");
        // if (checkCaseElements.length < 0) {
        //     return;
        // }

        // check case manager object
        // checkCaseManager = new CheckCaseManager();

        //$checkCaseElement = $checkCaseElements[0];

        // CheckCase object
        $checkCaseName = $checkCaseElement->attributes()->name
        $checkCase = new CheckCase($checkCaseName);

        // CheckCase object
        //var checkCaseName = checkCaseElement.getAttribute("name");
        // var complianceCheck = checkCaseElement.getAttribute("complianceCheck");
        //var checkCase = new CheckCase(checkCaseName/*, complianceCheck*/);

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

class CheckCase{
    var $Name;
    var $CheckTypes ;

    function __construct( $name) 
        {
            $this->Name = $name;
            $this->CheckTypes = array();
        }

      function addCheckType($checkType) {
            array_push($this->CheckTypes, $checkType);
        }

        function checkTypeExists  ($checkTypeName) {
            foreach ($this->CheckTypes as $key => $value)
            {
                if ($value->Name == $checkTypeName) {
                    return true;
                }
            }    
            return false;
        }
    
        function getCheckType ($checkTypeName) {
            foreach ($this->CheckTypes as $key => $value)
            {
                if ($value->Name == $checkTypeName) {
                    return $value;
                }
            }    
            return NULL;           
        }
}

class CheckType{
     $Name ;
     $SourceAType;
     $SourceBType;
     $ComponentGroups;

    function __construct( $name, $sourceAType, $sourceBType) 
        {
            $this->Name = $name;
            $this->SourceAType = $sourceAType;
            $this->SourceBType = $sourceBType;
            $this->ComponentGroups = array();
        }

        function addComponentGroup($componentGroup) {
            array_push($this->ComponentGroups, $componentGroup);
        }

        function componentGroupExists($sourceAGroupName, $sourceBGroupName) {
            foreach ($this->ComponentGroups as $key => $value)
            {
                // check for source A only
                if ($sourceBGroupName == NULL &&
                    strtolower($value->SourceAName) == strtolower($sourceAGroupName)) {
                    return true;
                }

                // check for source B only
                if ($sourceAGroupName == NULL &&
                    strtolower($value->SourceBName)  == strtolower($sourceBGroupName)) {
                    return true;
                }


                // check for both sources
                if ( strtolower($value->SourceAName) == strtolower($sourceAGroupName) &&
                     strtolower($value->SourceBName) == strtolower($sourceBGroupName)) {
                    return true;
                }               
            }    
            return false;
        }

        function getComponentGroup ($sourceAGroupName, $sourceBGroupName) {

            foreach ($this->ComponentGroups as $key => $value)
            {
                // check for source A only
                if ($sourceBGroupName == NULL &&
                    strtolower($value->SourceAName) == strtolower($sourceAGroupName)) {
                    return $value;
                }

                // check for source B only
                if ($sourceAGroupName == NULL &&
                    strtolower($value->SourceBName)  == strtolower($sourceBGroupName)) {
                    return $value;
                }


                // check for both sources
                if ( strtolower($value->SourceAName) == strtolower($sourceAGroupName) &&
                     strtolower($value->SourceBName) == strtolower($sourceBGroupName)) {
                    return $value;
                }               
            }    
            return NULL;
        }
}

class CheckCaseComponentGroup{

    var $SourceAName;
    var $SourceBName;

    var $ComponentClasses;

    function __construct( $sourceAName, $sourceBName) 
        {
            $this->SourceAName = $sourceAName;
            $this->SourceBName = $sourceBName;
            $this->ComponentClasses = array();
        }
    
    
    function addComponent($componentClass) {
        array_push($this->ComponentClasses,$componentClass);
    }

    function componentClassExists ($sourceAClassName, $sourceBClassName) {
        foreach ($this->ComponentClasses as $key => $value)
        {
            if ($sourceAClassName == NULL &&
                $sourceBClassName != NULL &&
                strtolower($value->SourceBName)== strtolower($sourceBClassName)) {
                return true;
                }

            if ($sourceBClassName == NULL &&
                $sourceAClassName != NULL &&
                strtolower($value->SourceAName) === strtolower($sourceAClassName)) {
                return true;
            }

            
            if ($sourceAClassName != NULL &&
                $sourceBClassName != NULL &&
                strtolower($value->SourceAName) === strtolower($sourceAClassName) &&
                strtolower($value->SourceBName) === strtolower($sourceBClassName)) {
                return true;
            }

        }

        return false;
    }

    function getComponentClass($sourceAClassName, $sourceBClassName) {

        foreach ($this->ComponentClasses as $key => $value)
        {
            if ($sourceAClassName == NULL &&
                $sourceBClassName != NULL &&
                strtolower($value->SourceBName)== strtolower($sourceBClassName)) {
                return $value;
                }

            if ($sourceBClassName == NULL &&
                $sourceAClassName != NULL &&
                strtolower($value->SourceAName) === strtolower($sourceAClassName)) {
                return $value;
            }

            
            if ($sourceAClassName != NULL &&
                $sourceBClassName != NULL &&
                strtolower($value->SourceAName) === strtolower($sourceAClassName) &&
                strtolower($value->SourceBName) === strtolower($sourceBClassName)) {
                return $value;
            }

        }

        return NULL;  
    }
}

class CheckCaseComponentClass{

    var $SourceAName;
    var $SourceBName;

    var $MatchwithProperties;
    var $MappingProperties;

    function __construct( $sourceAName, $sourceBName) 
        {
            $this->SourceAName = $sourceAName;
            $this->SourceBName = $sourceBName;
            $this->MatchwithProperties = array();
            $this->MappingProperties = array();
        }

        function addMappingProperty($mappingProperty) {
            array_push($this->MappingProperties, $mappingProperty);
        }

        function propertyExists ($sourceApropertyName, $sourceBpropertyName) {
            foreach ($this->MappingProperties as $key => $value)
            {
                if (strtolower($value->SourceAName) === strtolower($sourceApropertyName) &&
                    strtolower($value->SourceBName) === strtolower($sourceBpropertyName)) {
                        return true;
                }
            }    
    
            return false;
        }
    
        function sourceAPropertyExists  ($sourceApropertyName) {
            foreach ($this->MappingProperties as $key => $value)
            {
                if (strtolower($value->SourceAName) === strtolower($sourceApropertyName) ) {
                        return true;
                }
            }    
    
            return false;          
        }
    
        function sourceBPropertyExists  ($sourceBpropertyName) {
            foreach ($this->MappingProperties as $key => $value)
            {
                if (strtolower($value->SourceBName) === strtolower($sourceBpropertyName) ) {
                        return true;
                }
            }    
    
            return false;  
        }
    
        function getProperty ($sourceApropertyName, $sourceBpropertyName) {
            foreach ($this->MappingProperties as $key => $value)
            {
                if (strtolower($value->SourceAName) === strtolower($sourceApropertyName) &&
                    strtolower($value->SourceBName) === strtolower($sourceBpropertyName)) {
                        return $value;
                }
            }    
    
            return NULL;   
        }
}


class CheckCaseMappingProperty{

    var $SourceAName;
    var $SourceBName;
    var $Severity;
    var $RuleString ;
    var $Comment ;
    var $Rule;

    function __construct( $sourceAName, $sourceBName, $severity, $ruleString, $comment) 
        {
            global $ComplianceCheckRulesArray;
            $this->SourceAName = $sourceAName;
            $this->SourceBName = $sourceBName;
            $this->Severity = $severity;
            $this->RuleString = $ruleString;
            $this->Comment = $comment;
            if($this->RuleString)
            {
                if ($ruleString == NULL) {
                    $this->Rule = $ComplianceCheckRulesArray['None'];
                }
                else if (strtolower($ruleString) === "must have value") {
                   $this->Rule =  $ComplianceCheckRulesArray['Must_Have_Value'];
                }
                else if (strtolower($ruleString) === "should be number") {
                   $this->Rule = $ComplianceCheckRulesArray['Should_Be_Number'];
                }
                else if (strtolower($ruleString) === "should not be number") {
                   $this->Rule = $ComplianceCheckRulesArray['Should_Not_Be_Number'];
                }
                else if (strtolower($ruleString) === "should be text") {
                   $this->Rule = $ComplianceCheckRulesArray['Should_Be_Text'];
                }
                else if (strtolower($ruleString) === "should not be text") {
                   $this->Rule = $ComplianceCheckRulesArray['Should_Not_Be_Text'];
                }
                else {
                    $ruleArray = explode("-",$ruleString);
                    if (strtolower($ruleArray[0]) === "should start with") {
                       $this->Rule = $ComplianceCheckRulesArray['Should_Start_With'];
                    }
                    else if (strtolower($ruleArray[0]) === "should contain") {
                       $this->Rule = $ComplianceCheckRulesArray['Should_Contain'];
                    }
                    else if (strtolower($ruleArray[0]) === "equal to") {
                       $this->Rule = $ComplianceCheckRulesArray['Equal_To'];
                    }
                    else if (strtolower($ruleArray[0]) === "should end with") {
                       $this->Rule = $ComplianceCheckRulesArray['Should_End_With'];
                    }
                    else if (strtolower($ruleArray[0]) === "should not start with") {
                       $this->Rule = $ComplianceCheckRulesArray['Should_Not_Start_With'];
                    }
                    else if (strtolower($ruleArray[0]) === "should not end with") {
                       $this->Rule = $ComplianceCheckRulesArray['Should_Not_End_With'];
                    }
                    else if (strtolower($ruleArray[0]) === "should not contain") {
                       $this->Rule = $ComplianceCheckRulesArray['Should_Not_Contain'];
                    }
                    else if (strtolower($ruleArray[0]) === "not equal to") {
                       $this->Rule = $ComplianceCheckRulesArray['Not_Equal_To'];
                    }
                }
            }
        }
    }
?>