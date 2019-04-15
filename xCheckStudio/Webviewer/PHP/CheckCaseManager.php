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

        foreach ($checkCaseElement->childNodes AS $checkTypeElement) {
            //print $checkTypeElement->nodeName . " = " . $checkTypeElement->nodeValue . "<br>";
                if( $checkTypeElement->nodeName !="Check")
                {
                    continue;
                }

                
                $checkTypeName = $checkTypeElement->attributes()->type;
                $sourceAType = $checkTypeElement.->attributes()->sourceType;
                $sourceBType = NULL;

                if ($sourceAType  == NULL) {
                    $sourceAType = $checkTypeElement->attributes()->sourceAType;
                    $sourceBType = $checkTypeElement->attributes()->sourceBType;
                }

                $checkType = new CheckType($checkTypeName, $sourceAType, $sourceBType);

                

                foreach ($checkTypeElement->childNodes AS $componentGroupElement) {
                    if ($componentGroupElement->nodeName != "ComponentGroup") {
                        continue;
                    }

                     // ComponentGroup object
                    $sourceAGroupName = NULL;
                    $sourceBGroupName = NULL;
                    $sourceAGroupName = $componentGroupElement->attributes()->name;
                    if ($sourceAGroupName == NULL) {
                        $sourceAGroupName = $componentGroupElement->attributes()->sourceAGroupName;
                        $sourceBGroupName = $componentGroupElement->attributes()->sourceBGroupName;
                    }

                    $checkCaseComponentGroup = new CheckCaseComponentGroup($sourceAGroupName, $sourceBGroupName);
                    
                        foreach ($componentGroupElement->childNodes AS $componentElement) {
                                if ($componentElement->nodeName != "ComponentClass") {
                                    continue;
                                }

                                // Component object
                                $sourceAClassName = NULL;
                                $sourceBClassName = NULL;
                                $sourceAClassName = $componentElement->attributes()->name;
                                if ($sourceAClassName == NULL) {
                                    $sourceAClassName = $componentElement->attributes()->sourceAComponentClass;
                                    $sourceBClassName = $componentElement->attributes()->sourceBComponentClass;
                                }
                                $checkCaseComponentClass = new CheckCaseComponentClass($sourceAClassName, $sourceBClassName);

                                
                                foreach ($componentElement->childNodes AS $propertyElement) {
                                    if (strtolower($propertyElement->nodeName) === "matchwith") {
                                                    
                                        $sourceAMatchProperty = $propertyElement->attributes()->sourceAPropertyname;
                                        $sourceBMatchProperty = $propertyElement->attributes()->sourceBPropertyname;
            
                                        if ( $sourceAMatchProperty !== NULL &&
                                             $sourceBMatchProperty !== NULL) {
                                                $checkCaseComponentClass->MatchwithProperties[$sourceAMatchProperty ] =  $sourceBMatchProperty;
                                        }
                                    }
                                    else if (strtolower($propertyElement->nodeName) === "property") {

                                        $sourceAProperty = $propertyElement->attributes()->name;
                                        $sourceBProperty = NULL;
                                        $rule = NULL;
                                        if ($sourceAProperty === NULL) {
                                            $sourceAProperty = $propertyElement->attributes()->sourceAName;
                                            $sourceBProperty = $propertyElement->attributes()->sourceBName;
                                        }
                                        else {
                                            $rule = $propertyElement->attributes()->rule;
                                        }
                                        $severity =  $propertyElement->attributes()->severity;
                                        $comment =  $propertyElement->attributes()->comment;
            
                                        // create mapping property object 
                                        $checkCaseMappingProperty = new CheckCaseMappingProperty($sourceAProperty,
                                            $sourceBProperty,
                                            $severity,
                                            $rule,
                                            $comment);
                                        $checkCaseComponentClass->addMappingProperty($checkCaseMappingProperty);
                                    }
                                }

                                $checkCaseComponentGroup->addComponent($checkCaseComponentClass);
                        }
                        
                        $checkType->addComponentGroup($checkCaseComponentGroup);
                }

                $checkCase->addCheckType($checkType);
          }

            //this.addCheckCase(checkCase);
            $this->CheckCase = $checkCase;
            //postData();
    }

    // function postData = function () {
    //     $.ajax({
    //         url: 'PHP/CheckCaseDataWriter.php',
    //         type: "POST",
    //         async: true,
    //         data: { "ComponentClassesData": JSON.stringify(this.CheckCase) },
    //         success: function (data) {
    //             // alert("success");
    //         }
    //     });

    // }
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