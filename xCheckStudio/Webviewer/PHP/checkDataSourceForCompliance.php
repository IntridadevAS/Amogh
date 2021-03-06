<?php
            include 'CheckComponents.php';
            include 'CheckResultsWriter.php';
            require_once 'Utility.php';
            if(!isset($_POST['CheckCaseType']) ||
               !isset($_POST['SelectedCompoents'] ) ||
               !isset($_POST['ProjectName']) ||
               !isset($_POST['CheckName']) ||
               !isset($_POST['SourceId'] )  ||
               !isset($_POST['SourceComponents'] ))
            {
                echo 'fail';
                return;
            }
            
            $projectName = $_POST['ProjectName'];
            $checkName = $_POST['CheckName'];
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
                "Should_Not_Be_Text"=>"14"
            );
    
        $CheckCaseType = json_decode($_POST['CheckCaseType'],true);
        $SelectedComponents = json_decode($_POST['SelectedCompoents'],true);
        $SourceId = $_POST['SourceId'] ;       
       
        $Source= NULL;
        $CheckGroupsTable = NULL;
        $CheckComponentsTable = NULL;
        $CheckPropertiesTable = NULL;

        $NotCheckedComponentsTable = NULL;       
        if( $SourceId =='a')
        {
            $Source="SourceA";

            $CheckGroupsTable = "SourceAComplianceCheckGroups";
            $CheckComponentsTable = "SourceAComplianceCheckComponents";
            $CheckPropertiesTable = "SourceAComplianceCheckProperties";

            $NotCheckedComponentsTable = "SourceAComplianceNotCheckedComponents";           
        }
        else if($SourceId == 'b')
        {
            $Source="SourceB";

            $CheckGroupsTable = "SourceBComplianceCheckGroups";
            $CheckComponentsTable = "SourceBComplianceCheckComponents";
            $CheckPropertiesTable = "SourceBComplianceCheckProperties";

            $NotCheckedComponentsTable = "SourceBComplianceNotCheckedComponents";
        }
        else if($SourceId == 'c')
        {
            $Source="SourceC";

            $CheckGroupsTable = "SourceCComplianceCheckGroups";
            $CheckComponentsTable = "SourceCComplianceCheckComponents";
            $CheckPropertiesTable = "SourceCComplianceCheckProperties";

            $NotCheckedComponentsTable = "SourceCComplianceNotCheckedComponents";            
        }
        else if($SourceId == 'd')
        {
            $Source="SourceD";

            $CheckGroupsTable = "SourceDComplianceCheckGroups";
            $CheckComponentsTable = "SourceDComplianceCheckComponents";
            $CheckPropertiesTable = "SourceDComplianceCheckProperties";

            $NotCheckedComponentsTable = "SourceDComplianceNotCheckedComponents";           
        }
        else 
        {
            echo 'fail';
            return;
        }

        $CheckComponentsGroups = array();

        $SourceNotCheckedComponents = array();       
        $SourceNotMatchedComponents = array();
       
        // get source components and thier properties from database
        $SourceComponentsObj = json_decode($_POST['SourceComponents'],true);        
        $SourceComponents= $SourceComponentsObj['components'];      
        $SourceProperties= $SourceComponentsObj['properties'];  
        //getSourceComponents();          
     
        performComplianceCheck();
      
        // // create temporary databse to store check results, if not created already
        // createTempDB();

        // write check result to database
        writeComplianceResultToDB($CheckGroupsTable, 
                                  $CheckComponentsTable,
                                  $CheckPropertiesTable);


        if( $SourceId == 'a')
        {
            writeSourceAComplianceCheckStatistics();
        }
        else if( $SourceId == 'b')
        {
            writeSourceBComplianceCheckStatistics();
        }  
        else if( $SourceId == 'c')
        {
            writeSourceCComplianceCheckStatistics();
        }
        else if( $SourceId == 'd')
        {
            writeSourceDComplianceCheckStatistics();
        }                                              

        // get source components
        function getSourceComponents()
        {
            global $projectName;
            global $checkName;
            global $SourceComponents;           
            global $SourceProperties;                  
            global $Source;
            try{   
                // open database
                $dbPath = getCheckDatabasePath($projectName, $checkName);
                $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
   
                // begin the transaction
                $dbh->beginTransaction();
                           
                $componentTableName = NULL;
                $propertiesTableName = NULL;

                if($Source=="SourceA")
                {
                    $componentTableName = 'SourceAComponents';
                    $propertiesTableName = 'SourceAProperties';
                }
                else if($Source=="SourceB")
                {
                    $componentTableName = 'SourceBComponents';
                    $propertiesTableName = 'SourceBProperties';
                }
                else if($Source=="SourceC")
                {
                    $componentTableName = 'SourceCComponents';
                    $propertiesTableName = 'SourceCProperties';
                }
                else if($Source=="SourceD")
                {
                    $componentTableName = 'SourceDComponents';
                    $propertiesTableName = 'SourceDProperties';
                }
                else
                {
                    return;
                }

                // fetch source components
                $stmt =  $dbh->query('SELECT *FROM '. $componentTableName.'');
                         
                while ($componentRow = $stmt->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $values2 =array('id'=>$componentRow['id'], 'name'=>$componentRow['name'],  'mainclass'=>$componentRow['mainclass'], 'subclass'=>$componentRow['subclass']);
                    if (array_key_exists("nodeid",$componentRow))
                    {
                        $values2["nodeid"] =  $componentRow['nodeid'];                               
                    }
  
                    //$values2 = array($row['name'],  $row['mainclass'], $row['subclass'], $row['nodeid']);
                    $SourceComponents[$componentRow['id']] = $values2;    
                              
                    // fetch source Properties
                    $properties = array();
                    $stmt1 =  $dbh->query('SELECT *FROM '.$propertiesTableName.' where ownercomponent='.$componentRow['id']);
                                 
                    while ($propertyRow = $stmt1->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $values2 = array('name' => $propertyRow['name'], 'value' =>$propertyRow['value'], 'ownercomponent' =>$propertyRow['ownercomponent']);
                                      
                        $properties[$propertyRow['name']] = $values2;                                                                                 
                    }
                        $SourceProperties[$componentRow['id']] =  $properties;
                }                    
                                   
                // commit update
                $dbh->commit();
                $dbh = null; //This is how you close a PDO connection
            }                
            catch(Exception $e) 
            {        
                echo "fail";                 
                return;
            }                
        } 

        function isComponentSelected($component, $SelectedComponents)
        {           
            for($index = 0; $index < count($SelectedComponents); $index++)
            {
                $selectedComponent = $SelectedComponents[$index];              
                if($component['name']              ==  $selectedComponent['Name'] &&
                   $component['mainclass']==  $selectedComponent['MainComponentClass'] && 
                   $component['subclass']  ==  $selectedComponent['ComponentClass']){
                       
                           if(isset($selectedComponent['NodeId']))
                        {                          
                            if($selectedComponent['NodeId'] == $component['nodeid'])
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
        function componentClassExists($sourceAClassName, 
                    $sourceBClassName, 
                    $checkCaseGroup, 
                    $sourceAcomponentGroupName,
                    $sourceBcomponentGroupName)
        {               

            $componentClasses = $checkCaseGroup['ComponentClasses'];                    
            for($classIndex = 0; $classIndex < count($componentClasses); $classIndex++)
            {

                $componentClass = $componentClasses[$classIndex];

                if ($sourceAClassName == NULL &&
                    $sourceBClassName != NULL &&
                    strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) 
                {
                    return true;
                }

                if ($sourceBClassName == NULL &&
                    $sourceAClassName != NULL &&
                    strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName)) 
                {
                    return true;
                }

                if ($sourceAClassName != NULL &&
                    $sourceBClassName != NULL &&
                    strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName) &&
                    strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) 
                {
                    return true;
                }

            }
            return false;  
        }

        
        function getComponentClass($sourceAClassName, 
                                $sourceBClassName, 
                                $checkCaseGroup, 
                                $sourceAcomponentGroupName,
                                $sourceBcomponentGroupName)
        {

            if(strtolower($checkCaseGroup['SourceAName']) != strtolower($sourceAcomponentGroupName) ||
                strtolower($checkCaseGroup['SourceBName']) != strtolower($sourceBcomponentGroupName))
            {
                 return false;
            }

            $componentClasses = $checkCaseGroup['ComponentClasses'];                    
            for($classIndex = 0; $classIndex < count($componentClasses); $classIndex++)
            {

            $componentClass = $componentClasses[$classIndex];

            if ($sourceAClassName == NULL &&
                $sourceBClassName != NULL &&
                 strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) 
                {
                    return $componentClass;
                }

            if ($sourceBClassName == NULL &&
            $sourceAClassName != NULL &&
            strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName)) 
            {
                return $componentClass;
            }

            if ($sourceAClassName != NULL &&
                $sourceBClassName != NULL &&
                strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName) &&
                strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) 
            {
                return $componentClass;
            }

            }

            return NULL;
        }

        function startsWith($stringValue, $subString) {
            // search backwards starting from haystack length characters from the end
            return $subString === ''
              || strrpos($stringValue, $subString, -strlen($stringValue)) !== false;
        }
        
        function endsWith($value,$postfix,$case=true) {
            if($case){return (strcmp(substr($value, strlen($value) - strlen($postfix)),$postfix)===0);}
            return (strcasecmp(substr($value, strlen($value) - strlen($postfix)),$postfix)===0);
        }
        
        function checkComplianceRule($checkCaseMappingProperty, $propertyValue)
        {          
            global $ComplianceCheckRulesArray;
            $result = true;  
           
            if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['None'])
            {
               
            }
            else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Must_Have_Value'])
            {
                if($propertyValue == NULL ||  empty($propertyValue))
                {
                    $result = false;
                }
            }
            else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Be_Number'])
            {               
                if($propertyValue == NULL ||
                   $propertyValue == "" ||
                   !is_numeric($propertyValue) )
                {
                    $result = false;
                }
            }
            else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Not_Be_Number'])
            {
                if(is_numeric($propertyValue) )
                {
                    $result = false;
                }               
            }
            else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Be_Text'])
            {              
                if ($propertyValue == NULL ||
                    $propertyValue == ""  ||
                    is_numeric($propertyValue))
                {
                    $result = false;
                }               
            }
            else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Not_Be_Text'])
            {
                if ($propertyValue != NULL  &&
                    !is_numeric($propertyValue))
                {
                    $result = false;
                }                
            }
            else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Start_With']){
                if($propertyValue == NULL )
                {
                    $result = false;
                }
                else
                {
                    $ruleArray = explode("-", $checkCaseMappingProperty['RuleString']);
                    if(count($ruleArray) < 2)
                    {
                        $result = false;
                    }
                    else{
                        $prefix = $ruleArray[1];
                        $result = startsWith($propertyValue, $prefix);
                    }
                }
            }
            else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Contain']){
                if($propertyValue == NULL)
                {
                    $result = false;
                }
                else
                {
                    $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
                    if(count($ruleArray) < 2)
                    {
                        $result = false;
                    }
                    else
                    {
                        $prefix = $ruleArray[1];
                        if(strpos($propertyValue, $prefix) === false)
                        {
                            $result = false;
                        }                    
                    }                
                }
            }
            else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Equal_To']){
                $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
                if(count($ruleArray) < 2)
                {
                    $result = false;
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
                    $result = false;
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
                    $result = false;
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
                    $result = false;
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
                    $result = false;
                }
                else{
                    $substring = $ruleArray[1];
                
                    if(strpos($propertyValue, $substring) != false)
                    {
                        $result = false;
                    }
                }
            }
            else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Not_Equal_To']){
                $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
                if(count($ruleArray) < 2)
                {
                    $result = false;
                }
                else{
                    $subString = $ruleArray[1];
                    $result = !($propertyValue == $subString);
                }
            }
        
            return $result;
                
        }

        function performComplianceCheck()
        {
            global $SourceComponents;
            global $SourceProperties;
            //global $SourceProperties;            
            global $CheckCaseType;
            global $CheckComponentsGroups;

            global $SelectedComponents;
            global $SourceNotCheckedComponents;            
            global $SourceNotMatchedComponents;

            foreach ($SourceComponents as $id => $sourceComponent)
            {
                // check is component is selected or not for performing check
                if(!isComponentSelected($sourceComponent, $SelectedComponents)) 
                {
                        
                        //source A component not checked    
                        $compKey = $sourceComponent['id'];
                        if(!array_key_exists($compKey, $SourceNotCheckedComponents))
                        {
                            $SourceNotCheckedComponents[$compKey] = $sourceComponent;                                                   
                        }
                        continue;
                }

                // check if component class exists in checkcase
                if(!isComponentGroupExists($sourceComponent['mainclass'], NULL))
                {
                    //source A not matched
                    $compKey = $sourceComponent['id'];
                    if(!array_key_exists($compKey, $SourceNotMatchedComponents))                   
                    {
                        $SourceNotMatchedComponents[$compKey] = $sourceComponent;                        
                    }

                    addUndefinedComponents($sourceComponent);
                    continue;
                }
                // get check case group
                $checkCaseGroup = getComponentGroup($sourceComponent['mainclass'], NULL);

                // check if component exists in checkCaseGroup            
                if(!componentClassExists($sourceComponent['subclass'], 
                                         NULL, 
                                         $checkCaseGroup, 
                                         $sourceComponent['mainclass'], 
                                         NULL))
                {
                    //source not matched
                    $compKey = $sourceComponent['id'];
                    if(!array_key_exists($compKey, $SourceNotMatchedComponents))                   
                    {
                        $SourceNotMatchedComponents[$compKey] = $sourceComponent;                        
                    }
                    addUndefinedComponents($sourceComponent);

                    continue;
                }
                // get check case component
                $checkCaseComponentClass = getComponentClass($sourceComponent['subclass'],
                                                             NULL, 
                                                             $checkCaseGroup, 
                                                             $sourceComponent['mainclass'],
                                                             NULL);

                $checkComponentGroup = NULL;
                if(!empty($CheckComponentsGroups) &&
                   array_key_exists($sourceComponent['mainclass'], $CheckComponentsGroups))
                {
                    $checkComponentGroup = $CheckComponentsGroups[$sourceComponent['mainclass']];
                }
                else
                {
                    $checkComponentGroup = new CheckComponentGroup($sourceComponent['mainclass']);
                    $CheckComponentsGroups[$sourceComponent['mainclass']] = $checkComponentGroup;
                }
                                                     
                if($checkComponentGroup == NULL)
                {
                    //source not matched
                    $compKey = $sourceComponent['id'];
                    if(!array_key_exists($compKey, $SourceNotMatchedComponents))                   
                    {
                        $SourceNotMatchedComponents[$compKey] = $sourceComponent;                        
                    }
                    continue;
                }

                $nodeId = NULL;
                if(isset($sourceComponent['nodeid']))
                {
                    $nodeId =$sourceComponent['nodeid'];
                }
                
                $id = NULL;
                if(isset($sourceComponent['id']))
                {
                    $id  = $sourceComponent['id'];
                }
                $checkComponent = new CheckComponent($sourceComponent['name'],
                                                     NULL,
                                                     NULL,
                                                     NULL,
                                                    $sourceComponent['mainclass'],
                                                     NULL,
                                                     NULL,
                                                     NULL,
                                                    $sourceComponent['subclass'],
                                                    NULL,
                                                    NULL,
                                                    NULL,
                                                    $nodeId ,
                                                    NULL,
                                                    NULL,
                                                    NULL,
                                                    $id,
                                                    NULL,
                                                    NULL,
                                                    NULL,
                                                    NULL);

                $checkComponentGroup->AddCheckComponent($checkComponent);

                if(strtolower($checkCaseGroup['SourceAName']) == strtolower($sourceComponent['mainclass']))
                {
                    $sourceComponentProperties =  $SourceProperties[$sourceComponent['id']];
                    $sourceComponentProperties = array_change_key_case($sourceComponentProperties, CASE_LOWER); 

                    if(is_array ($checkCaseComponentClass['MappingProperties']) || 
                       is_object ($checkCaseComponentClass['MappingProperties'])) 
                       {

                        for($propertiesIndex = 0; $propertiesIndex < count($checkCaseComponentClass['MappingProperties']); $propertiesIndex++)
                        {                       
                            // get check case mapping property object
                            $checkCaseMappingProperty = $checkCaseComponentClass['MappingProperties'][$propertiesIndex];
                            $mappingPropertyName = $checkCaseMappingProperty['SourceAName'];
                            if (!array_key_exists(strtolower($mappingPropertyName), $sourceComponentProperties))
                            {
                                continue;
                            }
                            
                            $property = $sourceComponentProperties[strtolower($mappingPropertyName)];
                                
                            $propertyName = $property['name'];
                            $propertyValue = $property["value"];
                            $result = checkComplianceRule($checkCaseMappingProperty, $propertyValue);
                            $severity = null;
                            if($result == true) {
                                $severity = "OK";
                            }
                            else {
                                $severity = $checkCaseMappingProperty['Severity'];
                            }

                            $performCheck = true;
            
                            $checkProperty = new CheckProperty($propertyName,
                                                                $propertyValue,
                                                                NULL,
                                                                NULL,
                                                                NULL,
                                                                NULL,
                                                                NULL,
                                                                NULL,
                                                                $severity,
                                                                $performCheck,
                                                                $checkCaseMappingProperty['Comment'],
                                                                $checkCaseMappingProperty['RuleString']);
                                                               
                            $checkProperty->Result = $result;
                        
                            $checkComponent->AddCheckProperty($checkProperty);
                        }
                    }
                    
                }
            } 
        }

        function addUndefinedComponents($sourceComponent) {
            global $SourceProperties;
            global $CheckComponentsGroups;

            $nodeId = NULL;
            if(isset($sourceComponent['nodeid']))
            {
                $nodeId =$sourceComponent['nodeid'];
            }

            $id = NULL;
            if(isset($sourceComponent['id']))
            {
                $id  = $sourceComponent['id'];
            }

            $checkComponent = new CheckComponent($sourceComponent['name'],
                                        NULL,
                                        NULL,
                                        NULL,
                                        $sourceComponent['mainclass'],
                                        NULL,
                                        NULL,
                                        NULL,
                                        $sourceComponent['subclass'],
                                        NULL,
                                        NULL,
                                        NULL,
                                        $nodeId ,
                                        NULL,
                                        NULL,
                                        NULL,
                                        $id,
                                        NULL,
                                        NULL,
                                        NULL,
                                        NULL);           

            if(!empty($CheckComponentsGroups) &&
                array_key_exists('Undefined', $CheckComponentsGroups))
            {
                $checkComponentGroup = $CheckComponentsGroups['Undefined'];
            }
            else
            {
                $checkComponentGroup = new CheckComponentGroup('Undefined');
                $CheckComponentsGroups['Undefined'] = $checkComponentGroup;
            }

            $sourceComponentProperties =  $SourceProperties[$sourceComponent['id']];
            
            foreach ($sourceComponentProperties as $name => $property) 
            {                       
                $checkProperty = new CheckProperty($property["name"],
                                                    $property["value"],
                                                    NULL,
                                                    NULL,
                                                    NULL,
                                                    NULL,
                                                    NULL,
                                                    NULL,
                                                    "undefined",
                                                    NULL,
                                                    NULL,
                                                    NULL);                      

                $checkProperty->PerformCheck = false;
                $checkComponent->AddCheckProperty($checkProperty);
            }    
            $checkComponent->Status = "undefined";
            $checkComponentGroup->AddCheckComponent($checkComponent);
        }

?>