<?php
$fileName = $_POST['XMLFileName'];
$rootFilePath = $_SERVER['DOCUMENT_ROOT']; 
$rootFilePath = str_replace('\\', '/', $rootFilePath);

$objDOM = new DOMDocument();

//Load xml file into DOMDocument variable
$objDOM->load( $rootFilePath. '/configurations/'. $fileName);

//Find Tag element "config" and return the element to variable $node
$checkCaseElements = $objDOM->getElementsByTagName("CheckCase");

if(count($checkCaseElements)< 0 )
{
    echo NULL;
    return;
}

$ComplianceCheckRulesArray = array(
    "None"=> "1",
    "Must_Have_Value"=> "2",
    "Should_Start_With"=> "3",
    "Should_Contain"=>"4",
    "Should_Be_Number" =>"5",
    "Equal_To"=>"6",
    "Should_End_With"=>"7",
    "Should_Not_Start_With"=>"8",
    "Should_Not_End_With"=>"9",
    "Should_Not_Contain"=>"10",
    "Not_Equal_To"=>"11",
    "Should_Not_Be_Number"=>"12",
    "Should_Be_Text"=>"13",
    "Should_Not_Be_Text"=>"14");

$checkCaseElement = $checkCaseElements[0];

// CheckCase object
$checkcaseName = $checkCaseElement->getAttribute('name');

$checkCase = new CheckCase($checkcaseName);

$CheckCase ;
//children of checkCaseElement i.e. checks
$checkTypeElements = $checkCaseElement->getElementsByTagName("Check");

foreach($checkTypeElements as $checkTypeElement)
{
    
    $checkTypeName = $checkTypeElement->getAttribute('type');
    $sourceAType = $checkTypeElement->getAttribute('sourceType');
    $sourceBType = NULL;
    
    if($sourceAType == NULL)
    {
        $sourceAType = $checkTypeElement->getAttribute('sourceAType');
        $sourceBType = $checkTypeElement->getAttribute('sourceBType');
    }

    $checkType = new CheckType($checkTypeName, $sourceAType, $sourceBType);

    $componentGroupElements = $checkTypeElement->getElementsByTagName("ComponentGroup");
    
    foreach($componentGroupElements as $componentGroupElement)
    {
        // ComponentGroup object
        $sourceAGroupName = $componentGroupElement->getAttribute('name');
        $sourceBGroupName = NULL;

        if($sourceAGroupName == NULL)
        {
            $sourceAGroupName = $componentGroupElement->getAttribute('sourceAGroupName');
            $sourceBGroupName = $componentGroupElement->getAttribute('sourceBGroupName');
        }

        $checkCaseComponentGroup = new checkCaseComponentGroup($sourceAGroupName, $sourceBGroupName);

        $componentElements = $componentGroupElement->getElementsByTagName("ComponentClass");
       
        foreach($componentElements as $componentElement)
        {
            // Component object
            $sourceAClassName = $componentElement->getAttribute('name');
            $sourceBClassName = NULL;
            if($sourceAClassName == NULL)
            {
                $sourceAClassName = $componentElement->getAttribute('sourceAComponentClass');
                $sourceBClassName = $componentElement->getAttribute('sourceBComponentClass');
            }

            $checkCaseComponentClass = new CheckCaseComponentClass($sourceAClassName, $sourceBClassName);

            $propertyElements = $componentElement->getElementsByTagName("Matchwith");

            foreach($propertyElements as $propertyElement)
            {
                $sourceAMatchProperty = $propertyElement->getAttribute('sourceAPropertyname');
                $sourceBMatchProperty = $propertyElement->getAttribute('sourceBPropertyname');

                if ($sourceAMatchProperty != NULL &&
                $sourceBMatchProperty != NULL &&
                !(in_array($sourceAMatchProperty, $checkCaseComponentClass->MatchwithProperties))) {
                    $checkCaseComponentClass->MatchwithProperties[$sourceAMatchProperty] =  $sourceBMatchProperty;
                }
            }

            $propertyElements = $componentElement->getElementsByTagName("Property");

            foreach($propertyElements as $propertyElement)
            {
                $sourceAProperty = $propertyElement->getAttribute("name");
                $sourceBProperty = NULL;
                $rule = NULL;
                if ($sourceAProperty == NULL) {
                    $sourceAProperty = $propertyElement->getAttribute("sourceAName");
                    $sourceBProperty = $propertyElement->getAttribute("sourceBName");
                }
                else {
                    $rule = $propertyElement->getAttribute("rule");
                }

                $severity = $propertyElement->getAttribute("severity");
                $comment = $propertyElement->getAttribute("comment");

                // create mapping property object 
                $checkCaseMappingProperty = new CheckCaseMappingProperty($sourceAProperty,
                                                                        $sourceBProperty,
                                                                        $severity,
                                                                        $rule,
                                                                        $comment);
                //var_dump($checkCaseMappingProperty);
                
                $checkCaseComponentClass->addMappingProperty($checkCaseMappingProperty);
            }

            $checkCaseComponentGroup->addComponent($checkCaseComponentClass);
        }
        
        $checkType->addComponentGroup($checkCaseComponentGroup);

    }

    $checkCase->addCheckType($checkType);
}

$CheckCase = $checkCase;

echo json_encode($CheckCase);

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
}

class CheckType{
    var $Name ;
    var $SourceAType;
    var $SourceBType;

    var $ComponentGroups;

    function __construct( $name, $sourceAType, $sourceBType) 
        {
            $this->Name = $name;
            $this->SourceAType = $sourceAType;
            $this->SourceBType = $sourceBType;
            $this->ComponentGroups = array();
        }

    function addComponentGroup($componentGroup) {
            array_push($this->ComponentGroups,$componentGroup);
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
}

class CheckCaseMappingProperty
{

    var $SourceAName;
    var $SourceBName;
    var $Severity;
    var $RuleString ;
    var $Comment ;
    var $Rule;

    public  function __construct( $sourceAName, $sourceBName, $severity, $ruleString, $comment) 
        {
            global $ComplianceCheckRulesArray;          
  
            $this->SourceAName = $sourceAName;
            $this->SourceBName = $sourceBName;
            $this->Severity = $severity;
            $this->RuleString = $ruleString;
            $this->Comment = $comment;
            if($this->RuleString)
            {               

                if ($ruleString == NULL) 
                {                  
                    $this->Rule = $ComplianceCheckRulesArray['None'];
                }
                else if (strtolower($ruleString) === "must have value") 
                {
                     $this->Rule = $ComplianceCheckRulesArray['Must_Have_Value'];
                }
                else if (strtolower($ruleString) === "should be number") 
                {
                   $this->Rule =$ComplianceCheckRulesArray['Should_Be_Number'];
                }
                else if (strtolower($ruleString) === "should not be number") 
                {
                   $this->Rule = $ComplianceCheckRulesArray['Should_Not_Be_Number'];
                }
                else if (strtolower($ruleString) === "should be text") 
                {
                   $this->Rule = $ComplianceCheckRulesArray['Should_Be_Text'];
                }
                else if (strtolower($ruleString) === "should not be text") 
                {
                   $this->Rule = $ComplianceCheckRulesArray['Should_Not_Be_Text'];
                }
                else 
                {
                    $ruleArray = explode("-",$ruleString);
                    if (strtolower($ruleArray[0]) === "should start with") 
                    {
                       $this->Rule = $ComplianceCheckRulesArray['Should_Start_With'];
                    }
                    else if (strtolower($ruleArray[0]) === "should contain") 
                    {
                       $this->Rule = $ComplianceCheckRulesArray['Should_Contain'];
                    }
                    else if (strtolower($ruleArray[0]) === "equal to") 
                    {
                       $this->Rule = $ComplianceCheckRulesArray['Equal_To'];
                    }
                    else if (strtolower($ruleArray[0]) === "should end with") 
                    {
                       $this->Rule = $ComplianceCheckRulesArray['Should_End_With'];
                    }
                    else if (strtolower($ruleArray[0]) === "should not start with") 
                    {
                       $this->Rule = $ComplianceCheckRulesArray['Should_Not_Start_With'];
                    }
                    else if (strtolower($ruleArray[0]) === "should not end with") 
                    {
                       $this->Rule =$ComplianceCheckRulesArray['Should_Not_End_With'];
                    }
                    else if (strtolower($ruleArray[0]) === "should not contain") 
                    {
                       $this->Rule =$ComplianceCheckRulesArray['Should_Not_Contain'];
                    }
                    else if (strtolower($ruleArray[0]) === "not equal to") 
                    {
                       $this->Rule =$ComplianceCheckRulesArray['Not_Equal_To'];
                    }
                }
            }
        }
}

?>