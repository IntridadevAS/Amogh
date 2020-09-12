<?php
$fileName = $_POST['XMLFileName'];
//$rootFilePath = $_SERVER['DOCUMENT_ROOT']; 
//$rootFilePath = str_replace('\\', '/', $rootFilePath);

$objDOM = new DOMDocument();

//Load xml file into DOMDocument variable
$objDOM->load( '../configurations/'. $fileName);

//Find Tag element "config" and return the element to variable $node
$checkCaseElements = $objDOM->getElementsByTagName("CheckCase");

if(count($checkCaseElements)< 0 )
{
    echo NULL;
    return;
}

$checkCaseElement = $checkCaseElements[0];

// CheckCase object
$checkcaseName = $checkCaseElement->getAttribute('name');

$sourceTypes = array();
if($checkCaseElement->hasAttribute ("sourceA"))
{
    $sourceTypes["sourceA"] = $checkCaseElement->getAttribute('sourceA');   
}
if($checkCaseElement->hasAttribute ("sourceB"))
{
    $sourceTypes["sourceB"] = $checkCaseElement->getAttribute('sourceB');       
}
if($checkCaseElement->hasAttribute ("sourceC"))
{
    $sourceTypes["sourceC"] = $checkCaseElement->getAttribute('sourceC');   
}
if($checkCaseElement->hasAttribute ("sourceD"))
{
    $sourceTypes["sourceD"] = $checkCaseElement->getAttribute('sourceD');   
}

$checkCase = new CheckCase($checkcaseName, $sourceTypes);

$CheckCase ;
//children of checkCaseElement i.e. checks
$checkTypeElements = $checkCaseElement->getElementsByTagName("Check");

foreach($checkTypeElements as $checkTypeElement)
{
    
    $checkTypeName = $checkTypeElement->getAttribute('type');
    $sourceAType = $checkTypeElement->getAttribute('sourceType');
    $sourceBType = NULL;
    $sourceCType = NULL;
    $sourceDType = NULL;

    if($sourceAType == NULL)
    {
        $sourceAType = $checkTypeElement->getAttribute('sourceAType');
        $sourceBType = $checkTypeElement->getAttribute('sourceBType');

        if($checkTypeElement->hasAttribute ("sourceCType"))
        {
            $sourceCType =  $checkTypeElement->getAttribute('sourceCType');
        }

        if($checkTypeElement->hasAttribute ("sourceDType"))
        {
            $sourceDType =  $checkTypeElement->getAttribute('sourceDType');
        }
    }

    $checkType = new CheckType($checkTypeName, $sourceAType, $sourceBType, $sourceCType, $sourceDType);

    $componentGroupElements = $checkTypeElement->getElementsByTagName("ComponentGroup");
    
    foreach($componentGroupElements as $componentGroupElement)
    {
        // ComponentGroup object
        $sourceAGroupName = $componentGroupElement->getAttribute('name');
        $sourceBGroupName = NULL;
        $sourceCGroupName = NULL;
        $sourceDGroupName = NULL;

        if($sourceAGroupName == NULL)
        {
            $sourceAGroupName = $componentGroupElement->getAttribute('sourceAGroupName');
            $sourceBGroupName = $componentGroupElement->getAttribute('sourceBGroupName');

            if($componentGroupElement->hasAttribute ("sourceCGroupName"))
            {
                $sourceCGroupName =  $componentGroupElement->getAttribute('sourceCGroupName');
            }
            if($componentGroupElement->hasAttribute ("sourceDGroupName"))
            {
                $sourceDGroupName =  $componentGroupElement->getAttribute('sourceDGroupName');
            }
        }

        $checkCaseComponentGroup = new checkCaseComponentGroup($sourceAGroupName, $sourceBGroupName, $sourceCGroupName, $sourceDGroupName);

        $componentElements = $componentGroupElement->getElementsByTagName("ComponentClass");
       
        foreach($componentElements as $componentElement)
        {
            // Component object
            $sourceAClassName = $componentElement->getAttribute('name');
            $sourceBClassName = NULL;
            $sourceCClassName = NULL;
            $sourceDClassName = NULL;

            if($sourceAClassName == NULL)
            {
                $sourceAClassName = $componentElement->getAttribute('sourceAComponentClass');
                $sourceBClassName = $componentElement->getAttribute('sourceBComponentClass');

                if($componentElement->hasAttribute ("sourceCComponentClass"))
                {
                    $sourceCClassName =  $componentElement->getAttribute('sourceCComponentClass');
                }
                if($componentElement->hasAttribute ("sourceDComponentClass"))
                {
                    $sourceDClassName =  $componentElement->getAttribute('sourceDComponentClass');
                }
            }

            $checkCaseComponentClass = new CheckCaseComponentClass($sourceAClassName, $sourceBClassName, $sourceCClassName, $sourceDClassName);

            $propertyElements = $componentElement->getElementsByTagName("Matchwith");

            foreach($propertyElements as $propertyElement)
            {
                $sourceAMatchProperty = $propertyElement->getAttribute('sourceAPropertyname');
                $sourceBMatchProperty = $propertyElement->getAttribute('sourceBPropertyname');
                $sourceCMatchProperty = NULL;
                $sourceDMatchProperty = NULL;
                
                if($propertyElement->hasAttribute ("sourceCPropertyname"))
                {
                    $sourceCMatchProperty =  $propertyElement->getAttribute('sourceCPropertyname');
                }
                if($propertyElement->hasAttribute ("sourceDPropertyname"))
                {
                    $sourceDMatchProperty =  $propertyElement->getAttribute('sourceDPropertyname');
                }


                $matchWithProperty = array();
                $matchWithProperty["sourceA"] = $sourceAMatchProperty;
                $matchWithProperty["sourceB"] = $sourceBMatchProperty;
                $matchWithProperty["sourceC"] = $sourceCMatchProperty;
                $matchWithProperty["sourceD"] = $sourceDMatchProperty;
                array_push($checkCaseComponentClass->MatchwithProperties, $matchWithProperty);

                // if ($sourceAMatchProperty != NULL &&
                //     $sourceBMatchProperty != NULL &&
                //     !(in_array($sourceAMatchProperty, $checkCaseComponentClass->MatchwithProperties))) {

                //     $checkCaseComponentClass->MatchwithProperties[$sourceAMatchProperty] =  $sourceBMatchProperty;
                // }
            }

            $propertyElements = $componentElement->getElementsByTagName("Property");

            foreach($propertyElements as $propertyElement)
            {
                $sourceAProperty = $propertyElement->getAttribute("name");
                $sourceBProperty = NULL;
                $sourceCProperty = NULL;
                $sourceDProperty = NULL;

                $rule = NULL;
                if ($sourceAProperty == NULL) {
                    $sourceAProperty = $propertyElement->getAttribute("sourceAName");
                    $sourceBProperty = $propertyElement->getAttribute("sourceBName");

                    if($propertyElement->hasAttribute ("sourceCName"))
                    {
                        $sourceCProperty =  $propertyElement->getAttribute('sourceCName');
                    }
                    if($propertyElement->hasAttribute ("sourceDName"))
                    {
                        $sourceDProperty =  $propertyElement->getAttribute('sourceDName');
                    }
                }
                else {
                    $rule = $propertyElement->getAttribute("rule");
                }

                $severity = $propertyElement->getAttribute("severity");
                $comment = $propertyElement->getAttribute("comment");

                // create mapping property object 
                $checkCaseMappingProperty = new CheckCaseMappingProperty($sourceAProperty,
                                                                        $sourceBProperty,
                                                                        $sourceCProperty,
                                                                        $sourceDProperty,
                                                                        $severity,
                                                                        $rule,
                                                                        $comment);
                                
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
    var $SourceTypes = array();
    var $CheckTypes ;

    function __construct( $name, $sourceTypes) 
        {
            $this->Name = $name;
            $this->SourceTypes = $sourceTypes;
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
    var $SourceCType;
    var $SourceDType;

    var $ComponentGroups;

    function __construct( $name, $sourceAType, $sourceBType, $sourceCType, $sourceDType) 
        {
            $this->Name = $name;
            $this->SourceAType = $sourceAType;
            $this->SourceBType = $sourceBType;
            $this->SourceCType = $sourceCType;
            $this->SourceDType = $sourceDType;

            $this->ComponentGroups = array();
        }

    function addComponentGroup($componentGroup) {
            array_push($this->ComponentGroups,$componentGroup);
        }
}

class CheckCaseComponentGroup{

    var $SourceAName;
    var $SourceBName;
    var $SourceCName;
    var $SourceDName;

    var $ComponentClasses;

    function __construct( $sourceAName, $sourceBName, $sourceCName, $sourceDName) 
        {
            $this->SourceAName = $sourceAName;
            $this->SourceBName = $sourceBName;
            $this->SourceCName = $sourceCName;
            $this->SourceDName = $sourceDName;

            $this->ComponentClasses = array();
        }
    
    function addComponent($componentClass) {
        array_push($this->ComponentClasses,$componentClass);
    }
}

class CheckCaseComponentClass{

    var $SourceAName;
    var $SourceBName;
    var $SourceCName;
    var $SourceDName;

    var $MatchwithProperties;
    var $MappingProperties;

    function __construct( $sourceAName, $sourceBName, $sourceCName, $sourceDName) 
        {
            $this->SourceAName = $sourceAName;
            $this->SourceBName = $sourceBName;
            $this->SourceCName = $sourceCName;
            $this->SourceDName = $sourceDName;

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
    var $SourceCName;
    var $SourceDName;
    var $Severity;
    var $RuleString ;
    var $Comment ;
    var $Rule;

    public  function __construct( $sourceAName, $sourceBName, $sourceCName, $sourceDName, $severity, $ruleString, $comment) 
        {
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
  
            $this->SourceAName = $sourceAName;
            $this->SourceBName = $sourceBName;
            $this->SourceCName = $sourceCName;
            $this->SourceDName = $sourceDName;
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