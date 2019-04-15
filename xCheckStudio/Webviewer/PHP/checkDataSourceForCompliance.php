<?php

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
    "Should_Not_Be_Text"=>"14",
);

$SourceProperties = json_decode($_POST['SourceProperties'],true);
$SourceType = $_POST['SourceType'];
$CheckCaseType = json_decode($_POST['CheckCaseType'],true);
$SelectedComponents = json_decode($_POST['SelectedCompoents'],true);
$IdentifierProperties = json_decode($_POST['IdentifierProperties'],true);
$CheckCaseData = json_decode($_POST['CheckCaseData'],true);

// var_dump($CheckCaseData);
$CheckComponentsGroups = array();

for($index = 0; $index < count($SourceProperties) ; $index++)
{
    $sourceComponentProperties = $SourceProperties[$index];

    // check if this property is checked or not, in Source A
    if ((strtolower($SourceType) === "xml" ||
        strtolower($SourceType) === "rvm"||
        strtolower($SourceType) === "sldasm" ||
        strtolower($SourceType) === "sldprt") &&
        !isComponentSelected($sourceComponentProperties))
        {
            continue;
        }
    else if(strtolower($SourceType) === "xls" &&
            !isComponentSelected($sourceComponentProperties))
        {
            continue;
        }

    // check if component class exists in checkcase
    if(!isComponentGroupExists($sourceComponentProperties['MainComponentClass'], NULL))
    {
        continue;
    }
    
    // get check case group
    $checkCaseGroup = getComponentGroup($sourceComponentProperties['MainComponentClass'], NULL);

    // check if component exists in checkCaseGroup
    // if(!componentClassExists($sourceComponentProperties['SubComponentClass'], NULL, $sourceComponentProperties['MainComponentClass'])){
    //     continue;
    // }
    // echo componentClassExists($sourceComponentProperties['SubComponentClass'], NULL, $checkCaseGroup, $sourceComponentProperties['MainComponentClass']);
    if(!componentClassExists($sourceComponentProperties['SubComponentClass'], NULL, $checkCaseGroup, $sourceComponentProperties['MainComponentClass'])){
        continue;
    }
    
    // get check case component
    $checkCaseComponentClass = getComponentClass($sourceComponentProperties['SubComponentClass'], NULL, $checkCaseGroup, $sourceComponentProperties['MainComponentClass']);
    
    $checkComponentGroup;
    if(!empty($CheckComponentsGroups) &&
        array_key_exists($sourceComponentProperties['MainComponentClass'], $CheckComponentsGroups))
        {
            $checkComponentGroup = $CheckComponentsGroups[$sourceComponentProperties['MainComponentClass']];
        }
    else{
        $checkComponentGroup = new CheckComponentGroup($sourceComponentProperties['MainComponentClass']);
        $CheckComponentsGroups[$sourceComponentProperties['MainComponentClass']] = $checkComponentGroup;
    }

    if(!$checkComponentGroup)
    {
        continue;
    }

    $checkComponent = new CheckComponent($sourceComponentProperties['Name'],
                                    "",
                                    $sourceComponentProperties['SubComponentClass'],
                                    $sourceComponentProperties['NodeId'],
                                    "");

    $checkComponentGroup->AddCheckComponent($checkComponent);

   // var_dump($checkCaseComponentClass['MappingProperties']);
   if(strtolower($checkCaseGroup['SourceAName']) == strtolower($sourceComponentProperties['MainComponentClass']))
    {
        for($propertiesIndex = 0; $propertiesIndex < count($checkCaseComponentClass['MappingProperties']); $propertiesIndex++)
        {
              // get check case mapping property object
              $checkCaseMappingProperty = $checkCaseComponentClass['MappingProperties'][$propertiesIndex];
              if(propertyExists($checkCaseMappingProperty['SourceAName'], $checkCaseGroup))
              {
                  $property = getProperty($checkCaseMappingProperty['SourceAName'], $checkCaseGroup);
                 //  var_dump($property);
                  $propertyName = $property['Name'];
                  $propertyValue = $property['Value'];
                 //  echo $propertyValue;
                  $result = checkComplianceRule($checkCaseMappingProperty, $propertyValue);
                //   echo $result;
                $performCheck = true;

                $checkProperty = new CheckProperty($propertyName,
                                                    $propertyValue,
                                                    "",
                                                    "",
                                                    $checkCaseMappingProperty['Severity'],
                                                    $performCheck,
                                                    $checkCaseMappingProperty['Comment']);
                $checkProperty->Result = $result;

                $checkComponent->AddCheckProperty($checkProperty);
              }
        }
    }


    // var_dump($CheckComponentsGroups);
}

$json_data = json_encode($CheckComponentsGroups);

echo $json_data;

function isComponentSelected($componentProperties){
    global $IdentifierProperties;
    global $SelectedComponents;

    for($index = 0; $index < count($SelectedComponents); $index++)
    {
        $component = $SelectedComponents[$index];
        if($componentProperties['Name'] == $component[$IdentifierProperties['name']] &&
           $componentProperties['MainComponentClass'] == $component[$IdentifierProperties['mainCategory']] && 
           $componentProperties['SubComponentClass'] == $component[$IdentifierProperties['subClass']]){
                if($component['NodeId'])
                {
                    if($component['NodeId'] == $componentProperties['NodeId'])
                    {
                        return true;
                    }
                }
                else{
                    return true;
                }
           }
    }
    return false;
}

function isComponentGroupExists($sourceAGroupName, $sourceBGroupName){
    global $CheckCaseType;
    for($index = 0; $index < count($CheckCaseType['ComponentGroups']); $index++)
    {
         // check for source A only
         if ($sourceBGroupName == NULL &&
            strtolower($CheckCaseType['ComponentGroups'][$index]['SourceAName']) == strtolower($sourceAGroupName)) {
         return true;
        }
        // check for source B only
        if ($sourceAGroupName == NULL &&
            strtolower($CheckCaseType['ComponentGroups'][$index]['SourceBName']) == strtolower($sourceBGroupName)) {
        return true;
        }

        // check for both sources
        if (strtolower($CheckCaseType['ComponentGroups'][$index]['SourceAName']) == strtolower($sourceAGroupName) &&
        strtolower($CheckCaseType['ComponentGroups'][$index]['SourceBName']) == strtolower($sourceBGroupName)) {
        return true;
        }
    }

    return false;
}

function getComponentGroup($sourceAGroupName, $sourceBGroupName){
    global $CheckCaseType;
    for($index = 0; $index < count($CheckCaseType['ComponentGroups']); $index++)
    {
         // check for source A only
         if ($sourceBGroupName == NULL &&
            strtolower($CheckCaseType['ComponentGroups'][$index]['SourceAName']) == strtolower($sourceAGroupName)) {
         return $CheckCaseType['ComponentGroups'][$index];
        }
        // check for source B only
        if ($sourceAGroupName == NULL &&
            strtolower($CheckCaseType['ComponentGroups'][$index]['SourceBName']) == strtolower($sourceBGroupName)) {
        return $CheckCaseType['ComponentGroups'][$index];
        }

        // check for both sources
        if (strtolower($CheckCaseType['ComponentGroups'][$index]['SourceAName']) == strtolower($sourceAGroupName) &&
        strtolower($CheckCaseType['ComponentGroups'][$index]['SourceBName']) == strtolower($sourceBGroupName)) {
        return $CheckCaseType['ComponentGroups'][$index];
        }
    }

    return NULL;
}

// $componentGroupName : main component class 
function componentClassExists($sourceAClassName, $sourceBClassName, $checkCaseGroup, $componentGroupName){
    // global $CheckCaseData;
    // global $CheckCaseType;

     if(strtolower($checkCaseGroup['SourceAName']) != strtolower($componentGroupName))
    {
        return false;
    }

    $componentClasses = $checkCaseGroup['ComponentClasses'];                    
    for($classIndex = 0; $classIndex < count($componentClasses); $classIndex++)
    {        
            $componentClass = $componentClasses[$classIndex];

            if ($sourceAClassName == NULL &&
            $sourceBClassName != NULL &&
            strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) {
                return true;
            }
            
            if ($sourceBClassName == NULL &&
                $sourceAClassName != NULL &&
                strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName)) {
            
                return true;
            }

            if ($sourceAClassName != NULL &&
                $sourceBClassName != NULL &&
                strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName) &&
                strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) {
                return true;
            }   
    }
    return false;   
}

function getComponentClass($sourceAClassName, $sourceBClassName, $checkCaseGroup, $componentGroupName){

    $componentClasses = $checkCaseGroup['ComponentClasses'];                    
    for($classIndex = 0; $classIndex < count($componentClasses); $classIndex++)
    {
        if(strtolower($checkCaseGroup['SourceAName']) == strtolower($componentGroupName))
        {
            $componentClass = $componentClasses[$classIndex];

            if ($sourceAClassName == NULL &&
            $sourceBClassName != NULL &&
            strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) {
                return $componentClass;
            }
            
            if ($sourceBClassName == NULL &&
                $sourceAClassName != NULL &&
                strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName)) {
                    
                return $componentClass;
            }

            if ($sourceAClassName != NULL &&
                $sourceBClassName != NULL &&
                strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName) &&
                strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) {
                return $componentClass;
            }
        }
        else{
            continue;
        }
    }
    return NULL;
}

class CheckComponentGroup{
    var $ComponentClass;

    var $Components = array();

    function __construct( $par1 ) {
        $this->ComponentClass = $par1;
     }

     function AddCheckComponent($Component){
        array_push($this->Components, $Component);
     }
}

class CheckComponent{
    var $SourceAName;
    var $SourceBName;
    var $SubComponentClass;

    var $Status;
    var $CheckProperties;

    var $SourceANodeId;
    var $SourceBNodeId;

    function __construct( $sourceAName,
                        $sourceBName,
                        $subComponentClass,
                        $sourceANodeId,
                        $sourceBNodeId ) 
    {
        $this->SourceAName = $sourceAName;
        $this->SourceBName = $sourceBName; 
        $this->SubComponentClass = $subComponentClass;

        $this->Status = "OK";
        $this->CheckProperties = array();

        $this->SourceANodeId = $sourceANodeId;
        $this->SourceBNodeId = $sourceBNodeId;
     }

     function AddCheckProperty($property){
        array_push($this->CheckProperties, $property);

        if(!$property->PerformCheck)
        {
            if(strtolower($property->Severity) == strtolower("Error"))
            {
                $this->Status = "Error";
            }
        }
        else{
            if(!$property->Result)
            {
                if(strtolower($property->Severity) == strtolower("Error"))
                {
                    $this->Status = "Error";
                }
                else if(strtolower($property->Severity) == strtolower("Warning") &&
                        strtolower($this->Status) != strtolower("Error")){
                            $this->Status = "Warning";
                }
            }
        }
     }



}

class CheckProperty{

    var $SourceAName;
    var $SourceAValue ;
    var $SourceBName ;
    var $SourceBValue ;
    var $Result;
    var $Severity;
    var $PerformCheck;
    var $Description;

    function __construct( $sourceAName,
                            $sourceAValue,
                            $sourceBName,
                            $sourceBValue,
                            $severity,
                            $performCheck,
                            $description ) 
        {
            $this->SourceAName = $sourceAName;
            $this->SourceAValue = $sourceAValue;
            $this->SourceBName = $sourceBName;
            $this->SourceBValue = $sourceBValue;
            $this->Result = $sourceAValue == $sourceBValue;
            $this->Severity = $severity;
            $this->PerformCheck = $performCheck;
            $this->Description = $description;
        }



}

function propertyExists($propertyName, $checkCaseGroup){
    global $sourceComponentProperties;
    if(strtolower($checkCaseGroup['SourceAName']) == strtolower($sourceComponentProperties['MainComponentClass']))
    {
        $componentProperties = $sourceComponentProperties['properties'];
        // var_dump($componentProperties);
        for($index = 0; $index < count($componentProperties); $index++)
        {
            if(strtolower($componentProperties[$index]['Name']) == strtolower($propertyName))
            {
                return true;
            }
        }
        return false;
    }
}

function getProperty($propertyName, $checkCaseGroup){
    global $sourceComponentProperties;

    if(strtolower($checkCaseGroup['SourceAName']) == strtolower($sourceComponentProperties['MainComponentClass']))
    {
        $componentProperties = $sourceComponentProperties['properties'];
        // var_dump($componentProperties);
        for($index = 0; $index < count($componentProperties); $index++)
        {
            if(strtolower($componentProperties[$index]['Name']) == strtolower($propertyName))
            {
                return $componentProperties[$index];
            }
        }
        return NULL;
    }
}

// $checkCaseMappingProperty = json_decode($_POST['checkCaseMappingProperty'],true);

// $result = checkComplianceRule($checkCaseMappingProperty, $_POST['propertyValue']);
// echo $result;

function startsWith($haystack, $needle) {
    // search backwards starting from haystack length characters from the end
    return $needle === ''
      || strrpos($haystack, $needle, -strlen($haystack)) !== false;
}

function endsWith($value,$postfix,$case=true) {
    if($case){return (strcmp(substr($value, strlen($value) - strlen($postfix)),$postfix)===0);}
    return (strcasecmp(substr($value, strlen($value) - strlen($postfix)),$postfix)===0);
}

function checkComplianceRule($checkCaseMappingProperty, $propertyValue){
    global $ComplianceCheckRulesArray;
    // echo($checkCaseMappingProperty['Rule']."-".$propertyValue ."---");
    $result = true;  
    if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['None'])
    {
        
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Must_Have_Value']){
        if($propertyValue === NULL || empty($propertyValue))
        {
            $result = 0;
        }
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Be_Number']){
        if($propertyValue == NULL || empty($propertyValue))
        {
            $result = 0;
        }
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Not_Be_Number']){
        if($propertyValue == NULL || empty($propertyValue))
        {
            $result = 0;
        }
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Be_Text']){
        if($propertyValue == NULL || empty($propertyValue))
        {
            $result = 0;
        }
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Not_Be_Text']){
        if($propertyValue == NULL || empty($propertyValue))
        {
            $result = 0;
        }
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Start_With']){
        if($propertyValue == NULL || empty($propertyValue))
        {
            $result = 0;
        }
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Contain']){
        if($propertyValue == NULL || empty($propertyValue))
        {
            $result = 0;
        }
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Equal_To']){
        $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
        if(count($ruleArray) < 2)
        {
            $result = 0;
        }
        else{
            $prefix = $ruleArray[1];
            $result = ($propertyValue == $prefix);
        }
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_End_With']){
        $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
        if(count($ruleArray) < 2)
        {
            $result = 0;
        }
        else{
            $prefix = $ruleArray[1];
            $result = endsWith($propertyValue, $prefix);
        }
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Not_Start_With']){
        $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
        if(count($ruleArray) < 2)
        {
            $result = 0;
        }
        else{
            $prefix = $ruleArray[1];
            $result = !startsWith($propertyValue, $prefix);
        }
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Not_End_With']){
        $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
        if(count($ruleArray) < 2)
        {
            $result = 0;
        }
        else{
            $prefix = $ruleArray[1];
            $result = !endsWith($propertyValue, $prefix);
        }
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Not_Contain']){
        $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
        if(count($ruleArray) < 2)
        {
            $result = 0;
        }
        else{
            $substring = $ruleArray[1];
        
            if(strpos($propertyValue, $substring) != false)
            {
                $result = 0;
            }
        }
    }
    else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Not_Equal_To']){
        $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
        if(count($ruleArray) < 2)
        {
            $result = 0;
        }
        else{
            $subString = $ruleArray[1];
            $result = !($propertyValue == $subString);
        }
    }

    return $result;
        
}

?>