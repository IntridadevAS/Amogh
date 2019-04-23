<?php
            include 'CheckComponents.php';

            if(!isset($_POST['CheckCaseType']) ||
               !isset($_POST['SelectedCompoents'] ) ||
               !isset($_POST['ContainerId'] ))
            {
                echo 'fail';
                return;
            }
            
            session_start();
    
            // get project name
            $projectName = NULL;
            if(isset($_SESSION['projectname']))
            {
                $projectName =  $_SESSION['projectname'];              
            }
            else
            {
                echo 'fail';
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
                "Should_Not_Be_Text"=>"14",
            );

        // $SourceProperties = json_decode($_POST['SourceProperties'],true);
        // $SourceType = $_POST['SourceType'];
        $CheckCaseType = json_decode($_POST['CheckCaseType'],true);
        $SelectedComponents = json_decode($_POST['SelectedCompoents'],true);
        $ContainerId = $_POST['ContainerId'] ;
        $Source= NULL;
        if( $ContainerId =='viewerContainer1')
        {
            $Source="SourceA";
        }
        else if($ContainerId == 'viewerContainer2')
        {
            $Source="SourceB";
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
        $SourceComponents= array();      
        $SourceProperties= array();
        getSourceComponents();           
        //var_dump(  $SourceComponents);
        // var_dump( $SourceProperties);
        // return;

        performComplianceCheck();
        var_dump( $CheckComponentsGroups);

        // get source components
        function getSourceComponents()
        {
            global $projectName;
            global $SourceComponents;           
            global $SourceProperties;                  
            global $Source;
            try{   
                // open database
                $dbPath = "../Projects/".$projectName."/".$projectName.".db";
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
                       
                           if($selectedComponent['NodeId'])
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

        function startsWith($haystack, $needle) {
            // search backwards starting from haystack length characters from the end
            return $needle === ''
              || strrpos($haystack, $needle, -strlen($haystack)) !== false;
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
                        $compKey = $sourceComponent['id'];// ."_".$sourceComponent['mainclass']."_".$sourceComponent['subclass'];                            
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
                        //array_push($SourceANotMatchedComponents, $sourceComponent);
                    }
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
                        //array_push($SourceANotMatchedComponents, $sourceComponent);
                    }
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
                        //array_push($SourceANotMatchedComponents, $sourceComponent);
                    }
                    continue;
                }

                $checkComponent = new CheckComponent($sourceComponent['name'],
                                                     "",
                                                    $sourceComponent['subclass'],
                                                    $sourceComponent['nodeid'],
                                                    "");

                $checkComponentGroup->AddCheckComponent($checkComponent);

                if(strtolower($checkCaseGroup['SourceAName']) == strtolower($sourceComponent['mainclass']))
                {
                    $sourceComponentProperties =  $SourceProperties[$sourceComponent['id']];

                    for($propertiesIndex = 0; $propertiesIndex < count($checkCaseComponentClass['MappingProperties']); $propertiesIndex++)
                    {                       
                        // get check case mapping property object
                        $checkCaseMappingProperty = $checkCaseComponentClass['MappingProperties'][$propertiesIndex];
                        $mappingPropertyName = $checkCaseMappingProperty['SourceAName'];
                        if (!array_key_exists($mappingPropertyName, $sourceComponentProperties))
                        {
                           continue;
                        }

                        // if(propertyExists($checkCaseMappingProperty['SourceAName'], $checkCaseGroup, $sourceComponent))
                        // {
                            $property = $sourceComponentProperties[$mappingPropertyName];
                            //$property = getProperty($checkCaseMappingProperty['SourceAName'], $checkCaseGroup, $sourceComponent);
                            $propertyName = $property['name'];
                            $propertyValue = $property["value"];
                            $result = checkComplianceRule($checkCaseMappingProperty, $propertyValue);
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
            }



//////////////////////////////////////////////////////////////////////////////////////
// performComplianceCheck();


// function performComplianceCheck(){
//     global $SourceProperties;
//     global $SourceType;
//     global $CheckCaseType;
//     global $CheckComponentsGroups;

//     $SourceANotCheckedComponents = array();
//     $SourceBNotCheckedComponents = array();
//     $SourceANotMatchedComponents = array();
//     $SourceBNotMatchedComponents = array();

//     $componentsList = restoreProperties ($SourceProperties) ;
//     for($index = 0; $index < count($componentsList) ; $index++)
//     {
//         $sourceComponent = $componentsList[$index];
//         // check if this property is checked or not, in Source A
//         if ((strtolower($SourceType) === "xml" ||
//             strtolower($SourceType) === "rvm"||
//             strtolower($SourceType) === "sldasm" ||
//             strtolower($SourceType) === "sldprt") &&
//             !isComponentSelected($sourceComponent))
//             {
//                 if(!isset($SourceANotCheckedComponents[$sourceComponent->id]))
//                 {
//                     array_push($SourceANotCheckedComponents, $sourceComponent);
//                 }
//                 continue;
//             }
//         else if(strtolower($SourceType) === "xls" &&
//                 !isComponentSelected($sourceComponent))
//             {
//                 if(!isset($SourceANotCheckedComponents[$sourceComponent->id]))
//                 {
//                     array_push($SourceANotCheckedComponents, $sourceComponent);
//                 }
//                 continue;
//             }

//         // check if component class exists in checkcase
//         if(!isComponentGroupExists($sourceComponent->MainComponentClass, NULL))
//         {
//             //source A not matched
//             if(!isset($SourceANotMatchedComponents[$sourceComponent->id]))
//                 {
//                     array_push($SourceANotMatchedComponents, $sourceComponent);
//                 }
//             continue;
//         }
        
//         // get check case group
//         $checkCaseGroup = getComponentGroup($sourceComponent->MainComponentClass, NULL);

//         // check if component exists in checkCaseGroup
//         if(!componentClassExists($sourceComponent->SubComponentClass, NULL, $checkCaseGroup, $sourceComponent->MainComponentClass)){
//             //source A not matched
//             if(!isset($SourceANotMatchedComponents[$sourceComponent->id]))
//             {
//                 array_push($SourceANotMatchedComponents, $sourceComponent);
//             }
//             continue;
//         }
        
//         // get check case component
//         $checkCaseComponentClass = getComponentClass($sourceComponent->SubComponentClass, NULL, $checkCaseGroup, $sourceComponent->MainComponentClass);
        
//         $checkComponentGroup;
//         if(!empty($CheckComponentsGroups) &&
//             array_key_exists($sourceComponent->MainComponentClass, $CheckComponentsGroups))
//             {
//                 $checkComponentGroup = $CheckComponentsGroups[$sourceComponent->MainComponentClass];
//             }
//         else{
//             $checkComponentGroup = new CheckComponentGroup($sourceComponent->MainComponentClass);
//             $CheckComponentsGroups[$sourceComponent->MainComponentClass] = $checkComponentGroup;
//         }

//         if(!$checkComponentGroup)
//         {
//             //source A not matched
//             if(!isset($SourceANotMatchedComponents[$sourceComponent->id]))
//             {
//                 array_push($SourceANotMatchedComponents, $sourceComponent);
//             }
//             continue;
//         }

//         $checkComponent = new CheckComponent($sourceComponent->Name,
//                                         "",
//                                         $sourceComponent->SubComponentClass,
//                                         $sourceComponent->NodeId,
//                                         "");

//         $checkComponentGroup->AddCheckComponent($checkComponent);

//     if(strtolower($checkCaseGroup['SourceAName']) == strtolower($sourceComponent->MainComponentClass))
//         {
//             for($propertiesIndex = 0; $propertiesIndex < count($checkCaseComponentClass['MappingProperties']); $propertiesIndex++)
//             {
//                 // get check case mapping property object
//                 $checkCaseMappingProperty = $checkCaseComponentClass['MappingProperties'][$propertiesIndex];
//                 if(propertyExists($checkCaseMappingProperty['SourceAName'], $checkCaseGroup, $sourceComponent))
//                 {
//                     $property = getProperty($checkCaseMappingProperty['SourceAName'], $checkCaseGroup, $sourceComponent);
//                     $propertyName = $property->Name;
//                     $propertyValue = $property->Value;
//                     $result = checkComplianceRule($checkCaseMappingProperty, $propertyValue);
//                     $performCheck = true;

//                     $checkProperty = new CheckProperty($propertyName,
//                                                         $propertyValue,
//                                                         "",
//                                                         "",
//                                                         $checkCaseMappingProperty['Severity'],
//                                                         $performCheck,
//                                                         $checkCaseMappingProperty['Comment']);
//                     $checkProperty->Result = $result;

//                     $checkComponent->AddCheckProperty($checkProperty);
//                 }
//             }
//         }
//     }

   
//     $projectDBPath = getCurrentProjectDBPath();

//     if(strtolower($_POST['ContainerId']) == "viewercontainer1")
//     {
//         addComplianceACheckResultToDataBase($CheckComponentsGroups, $projectDBPath);
//     }
//     else if(strtolower($_POST['ContainerId']) == "viewercontainer2")
//     {
//         addComplianceBCheckResultToDataBase($CheckComponentsGroups, $projectDBPath);
//     }
//     $json_data = json_encode($CheckComponentsGroups);
//     echo $json_data;
// }


// function getCurrentProjectDBPath(){
//     session_start();
//     $projectName;
//     if(isset($_SESSION['projectname']))
//     {
//         $projectName = $_SESSION['projectname'];
//         // echo $projectName;
//     }

//     $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
//     $query =  "SELECT path from Projects WHERE projectname='". $projectName."';";        

//     $result = $dbh->query($query)->fetch();
//     $Path = $result['path'];

//     return $Path;
// }

// function addComplianceACheckResultToDataBase($CheckComponentsGroups, $projectDBPath){

//     $dbh = new PDO("sqlite:../".$projectDBPath) or die("cannot open the database");
    
//     //check if table exists
//     $table_name = 'SourceAComplianceCheckData'; 
//     $tableExists = "SELECT 1 FROM " . $table_name . " LIMIT 1";
//     $tableExists = $dbh->query($tableExists);

//     if($tableExists)
//     {
//         $result = "DELETE from " . $table_name;
//         $result = $dbh->query($result);
//     }

//     try{
//         $commands = ['CREATE TABLE IF NOT EXISTS SourceAComplianceCheckData (
//             class_id   INTEGER PRIMARY KEY AUTOINCREMENT,
//             component_class TEXT NOT NULL UNIQUE,
//             classwise_check_data TEXT NOT NULL
//           )'];
    
//             foreach ($commands as $command) {
//                 $dbh->exec($command);
//             }
    
//         foreach ($CheckComponentsGroups as $MainComponentClass=>$componentGroup)
//         {
//             $$MainComponentClass = $MainComponentClass;
//             $classwise_check_data = json_encode($componentGroup);
        
//             $query = 'INSERT INTO SourceAComplianceCheckData (component_class, classwise_check_data) VALUES (?, ?)';
//             $stmt = $dbh->prepare($query);
//             $stmt->execute(array( $MainComponentClass, $classwise_check_data));  
//             // var_dump($componentGroup);
//         }
           
//         // $dbh->exec($query);
        
//         $dbh = null;
//         }
//         catch(Exception $e) {
//             echo 'Message: ' .$e->getMessage();
//             return;
//         } 
   
// }

// function addComplianceBCheckResultToDataBase($CheckComponentsGroups, $projectDBPath){

//     $dbh = new PDO("sqlite:../".$projectDBPath) or die("cannot open the database");

//     $table_name = 'SourceBComplianceCheckData'; 
//     $tableExists = "SELECT 1 FROM " . $table_name . " LIMIT 1";
//     $tableExists = $dbh->query($tableExists);

//     if($tableExists)
//     {
//         $result = "DELETE from " . $table_name;
//         $result = $dbh->query($result);
//     }

//     try{    
//     $commands = ['CREATE TABLE IF NOT EXISTS SourceBComplianceCheckData (
//         class_id   INTEGER PRIMARY KEY AUTOINCREMENT DEFAULT 0,
//         component_class TEXT NOT NULL UNIQUE,
//         classwise_check_data TEXT NOT NULL
//       )'];

//         foreach ($commands as $command) {
//             $dbh->exec($command);
//         }

//     foreach ($CheckComponentsGroups as $MainComponentClass=>$componentGroup)
//     {
//         $$MainComponentClass = $MainComponentClass;
//         $classwise_check_data = json_encode($componentGroup);
    
//         $query = 'INSERT INTO SourceBComplianceCheckData  (component_class, classwise_check_data) VALUES (?, ?)';
//         $stmt = $dbh->prepare($query);
//         $stmt->execute(array( $MainComponentClass, $classwise_check_data));  
//         // var_dump($componentGroup);
//     }
       
//     // $dbh->exec($query);
    
//     $dbh = null;
//     }
//     catch(Exception $e) {
//         echo 'Message: ' .$e->getMessage();
//         return;
//     } 
// }


// function addComplianceCheckResultToDataBase($CheckComponentsGroups){
//     global $CheckCaseType;
//     try{
//     $dbh = new PDO("sqlite:../Projects/Project_2/Project_2.db") or die("cannot open the database");
//     $commands = ['CREATE TABLE IF NOT EXISTS Compliance_Check_Result_Table (
//         check_id   INTEGER PRIMARY KEY AUTOINCREMENT,
//         check_type TEXT NOT NULL,
//         check_data TEXT NOT NULL,
//         check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
//       )'];

//         foreach ($commands as $command) {
//             $dbh->exec($command);
//         }

//     $check_type = $CheckCaseType['Name'];
//     $check_data = json_encode($CheckComponentsGroups);
//     $check_time = date('m/d/Y h:i:s a', time());
    
//    // $query = "INSERT INTO Compliance_Check_Result_Table VALUES ('.NULL.','.$check_type.','.$check_data.','.$check_time.')";
//     $query = 'INSERT INTO Compliance_Check_Result_Table  (check_type, check_data, check_time) VALUES (?, ?, ?)';
//     $stmt = $dbh->prepare($query);
//     $stmt->execute(array( $check_type, $check_data, $check_time));     
//     // $dbh->exec($query);
    
//     $dbh = null;
//     }
//     catch(Exception $e) {
//         echo 'Message: ' .$e->getMessage();
//         return;
//     } 
// }


// function isComponentSelected($componentProperties){
//     global $SelectedComponents;
//     for($index = 0; $index < count($SelectedComponents); $index++)
//     {
//         $component = $SelectedComponents[$index];
//        if($componentProperties->Name == $component['Name'] &&
//            $componentProperties->MainComponentClass == $component['MainComponentClass'] && 
//            $componentProperties->SubComponentClass == $component['ComponentClass']){
//                 if($component['NodeId'])
//                 {
//                     if($component['NodeId'] == $componentProperties->NodeId)
//                     {
//                         return true;
//                     }
//                 }
//                 else{
//                     return true;
//                 }
//            }
//     }
//     return false;
// }

// function isComponentGroupExists($sourceAGroupName, $sourceBGroupName){
//     global $CheckCaseType; 
   
//     for($index = 0; $index < count($CheckCaseType['ComponentGroups']); $index++)
//     {
//          // check for source A only
//          if ($sourceBGroupName == NULL &&
//             strtolower($CheckCaseType['ComponentGroups'][$index]['SourceAName']) == strtolower($sourceAGroupName)) {
//          return true;
//         }
//         // check for source B only
//         if ($sourceAGroupName == NULL &&
//             strtolower($CheckCaseType['ComponentGroups'][$index]['SourceBName']) == strtolower($sourceBGroupName)) {
//         return true;
//         }

//         // check for both sources
//         if (strtolower($CheckCaseType['ComponentGroups'][$index]['SourceAName']) == strtolower($sourceAGroupName) &&
//         strtolower($CheckCaseType['ComponentGroups'][$index]['SourceBName']) == strtolower($sourceBGroupName)) {
//         return true;
//         }
//     }
//     return false;
// }

// function getComponentGroup($sourceAGroupName, $sourceBGroupName){
//     global $CheckCaseType;
//     for($index = 0; $index < count($CheckCaseType['ComponentGroups']); $index++)
//     {
//          // check for source A only
//          if ($sourceBGroupName == NULL &&
//             strtolower($CheckCaseType['ComponentGroups'][$index]['SourceAName']) == strtolower($sourceAGroupName)) {
//          return $CheckCaseType['ComponentGroups'][$index];
//         }
//         // check for source B only
//         if ($sourceAGroupName == NULL &&
//             strtolower($CheckCaseType['ComponentGroups'][$index]['SourceBName']) == strtolower($sourceBGroupName)) {
//         return $CheckCaseType['ComponentGroups'][$index];
//         }

//         // check for both sources
//         if (strtolower($CheckCaseType['ComponentGroups'][$index]['SourceAName']) == strtolower($sourceAGroupName) &&
//         strtolower($CheckCaseType['ComponentGroups'][$index]['SourceBName']) == strtolower($sourceBGroupName)) {
//         return $CheckCaseType['ComponentGroups'][$index];
//         }
//     }

//     return NULL;
// }

// // $componentGroupName : main component class 
// function componentClassExists($sourceAClassName, $sourceBClassName, $checkCaseGroup, $componentGroupName){
//     $componentClasses = $checkCaseGroup['ComponentClasses'];      
//     for($classIndex = 0; $classIndex < count($componentClasses); $classIndex++)
//     {
//         return false;
//     }

//     $componentClasses = $checkCaseGroup['ComponentClasses'];                    
//     for($classIndex = 0; $classIndex < count($componentClasses); $classIndex++)
//     {        
//             $componentClass = $componentClasses[$classIndex];
//             if ($sourceAClassName == NULL &&
//             $sourceBClassName != NULL &&
//             strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) {
//                 return true;
//             }
            
//             if ($sourceBClassName == NULL &&
//                 $sourceAClassName != NULL &&
//                 strtolower($componentClass['SourceAName']) == strtolower($sourceAClassName)) {
            
//                 return true;
//             }

//             if ($sourceAClassName != NULL &&
//                 $sourceBClassName != NULL &&
//                 strtolower($componentClass['SourceAName']) == strtolower($sourceAClassName) &&
//                 strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) {
//                 return true;
//             }
//         }
//         else{
//             continue;
//         }
//     }
//     return false;
// }

// function getComponentClass($sourceAClassName, $sourceBClassName, $checkCaseGroup, $componentGroupName){
//     $componentClasses = $checkCaseGroup['ComponentClasses'];                    
//     for($classIndex = 0; $classIndex < count($componentClasses); $classIndex++)
//     {
//         if(strtolower($checkCaseGroup['SourceAName']) == strtolower($componentGroupName))
//         {
//             $componentClass = $componentClasses[$classIndex];

//             if ($sourceAClassName == NULL &&
//             $sourceBClassName != NULL &&
//             strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) {
//                 return $componentClass;
//             }
            
//             if ($sourceBClassName == NULL &&
//                 $sourceAClassName != NULL &&
//                 strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName)) {
                    
//                 return $componentClass;
//             }

//             if ($sourceAClassName != NULL &&
//                 $sourceBClassName != NULL &&
//                 strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName) &&
//                 strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) {
//                 return $componentClass;
//             }
//         }
//         else{
//             continue;
//         }
//     }
//     return NULL;
// }

// class CheckComponentGroup{
//     var $ComponentClass;

//     var $Components = array();

//     function __construct( $par1 ) {
//         $this->ComponentClass = $par1;
//      }

//      function AddCheckComponent($Component){
//         array_push($this->Components, $Component);
//      }
// }

// class CheckComponent{
//     var $SourceAName;
//     var $SourceBName;
//     var $SubComponentClass;

//     var $Status;
//     var $CheckProperties;

//     var $SourceANodeId;
//     var $SourceBNodeId;

//     function __construct( $sourceAName,
//                         $sourceBName,
//                         $subComponentClass,
//                         $sourceANodeId,
//                         $sourceBNodeId ) 
//     {
//         $this->SourceAName = $sourceAName;
//         $this->SourceBName = $sourceBName; 
//         $this->SubComponentClass = $subComponentClass;

//         $this->Status = "OK";
//         $this->CheckProperties = array();

//         $this->SourceANodeId = $sourceANodeId;
//         $this->SourceBNodeId = $sourceBNodeId;
//      }

//      function AddCheckProperty($property){
//         array_push($this->CheckProperties, $property);

//         if(!$property->PerformCheck)
//         {
//             if(strtolower($property->Severity) == strtolower("Error"))
//             {
//                 $this->Status = "Error";
//             }
//         }
//         else{
//             if(!$property->Result)
//             {
//                 if(strtolower($property->Severity) == strtolower("Error"))
//                 {
//                     $this->Status = "Error";
//                 }
//                 else if(strtolower($property->Severity) == strtolower("Warning") &&
//                         strtolower($this->Status) != strtolower("Error")){
//                             $this->Status = "Warning";
//                 }
//             }
//         }
//      }



// }

// class CheckProperty{

//     var $SourceAName;
//     var $SourceAValue ;
//     var $SourceBName ;
//     var $SourceBValue ;
//     var $Result;
//     var $Severity;
//     var $PerformCheck;
//     var $Description;

//     function __construct( $sourceAName,
//                             $sourceAValue,
//                             $sourceBName,
//                             $sourceBValue,
//                             $severity,
//                             $performCheck,
//                             $description ) 
//         {
//             $this->SourceAName = $sourceAName;
//             $this->SourceAValue = $sourceAValue;
//             $this->SourceBName = $sourceBName;
//             $this->SourceBValue = $sourceBValue;
//             $this->Result = $sourceAValue == $sourceBValue;
//             $this->Severity = $severity;
//             $this->PerformCheck = $performCheck;
//             $this->Description = $description;
//         }



// }

// function propertyExists($propertyName, $checkCaseGroup, $sourceComponent){
//     // global $sourceComponent;
//     if(strtolower($checkCaseGroup['SourceAName']) == strtolower($sourceComponent->MainComponentClass))
//     {
//         $componentProperties = $sourceComponent->properties;
//         // var_dump($componentProperties);
//         for($index = 0; $index < count($componentProperties); $index++)
//         {
//             if(strtolower($componentProperties[$index]->Name) == strtolower($propertyName))
//             {
//                 return true;
//             }
//         }
//         return false;
//     }
// }

// function getProperty($propertyName, $checkCaseGroup, $sourceComponent){
//     // global $sourceComponent;
//     if(strtolower($checkCaseGroup['SourceAName']) == strtolower($sourceComponent->MainComponentClass))
//     {
//         $componentProperties = $sourceComponent->properties;
//         // var_dump($componentProperties);
//         for($index = 0; $index < count($componentProperties); $index++)
//         {
//             if(strtolower($componentProperties[$index]->Name) == strtolower($propertyName))
//             {
//                 return $componentProperties[$index];
//             }
//         }
//         return NULL;
//     }
// }

// function startsWith($haystack, $needle) {
//     // search backwards starting from haystack length characters from the end
//     return $needle === ''
//       || strrpos($haystack, $needle, -strlen($haystack)) !== false;
// }

// function endsWith($value,$postfix,$case=true) {
//     if($case){return (strcmp(substr($value, strlen($value) - strlen($postfix)),$postfix)===0);}
//     return (strcasecmp(substr($value, strlen($value) - strlen($postfix)),$postfix)===0);
// }

// function checkComplianceRule($checkCaseMappingProperty, $propertyValue)
// {
//     global $ComplianceCheckRulesArray;
//     $result = true;  
//     if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['None'])
//     {
        
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Must_Have_Value']){
//         if($propertyValue === NULL || empty($propertyValue))
//         {
//             $result = 0;
//         }
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Be_Number']){
//         if($propertyValue == NULL || empty($propertyValue))
//         {
//             $result = 0;
//         }
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Not_Be_Number']){
//         if($propertyValue == NULL || empty($propertyValue))
//         {
//             $result = 0;
//         }
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Be_Text']){
//         if($propertyValue == NULL || empty($propertyValue))
//         {
//             $result = 0;
//         }
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Not_Be_Text']){
//         if($propertyValue == NULL || empty($propertyValue))
//         {
//             $result = 0;
//         }
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Start_With']){
//         if($propertyValue == NULL || empty($propertyValue))
//         {
//             $result = 0;
//         }
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Contain']){
//         if($propertyValue == NULL || empty($propertyValue))
//         {
//             $result = 0;
//         }
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Equal_To']){
//         $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
//         if(count($ruleArray) < 2)
//         {
//             $result = 0;
//         }
//         else{
//             $prefix = $ruleArray[1];
//             $result = ($propertyValue == $prefix);
//         }
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_End_With']){
//         $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
//         if(count($ruleArray) < 2)
//         {
//             $result = 0;
//         }
//         else{
//             $prefix = $ruleArray[1];
//             $result = endsWith($propertyValue, $prefix);
//         }
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Not_Start_With']){
//         $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
//         if(count($ruleArray) < 2)
//         {
//             $result = 0;
//         }
//         else{
//             $prefix = $ruleArray[1];
//             $result = !startsWith($propertyValue, $prefix);
//         }
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Not_End_With']){
//         $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
//         if(count($ruleArray) < 2)
//         {
//             $result = 0;
//         }
//         else{
//             $prefix = $ruleArray[1];
//             $result = !endsWith($propertyValue, $prefix);
//         }
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Should_Not_Contain']){
//         $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
//         if(count($ruleArray) < 2)
//         {
//             $result = 0;
//         }
//         else{
//             $substring = $ruleArray[1];
        
//             if(strpos($propertyValue, $substring) != false)
//             {
//                 $result = 0;
//             }
//         }
//     }
//     else if($checkCaseMappingProperty['Rule'] == $ComplianceCheckRulesArray['Not_Equal_To']){
//         $ruleArray = explode("-",$checkCaseMappingProperty['RuleString']);
//         if(count($ruleArray) < 2)
//         {
//             $result = 0;
//         }
//         else{
//             $subString = $ruleArray[1];
//             $result = !($propertyValue == $subString);
//         }
//     }

//     return $result;
        
// }


// function restoreProperties ($ComponentsList) 
// {
//         $Components = array();
//         foreach($ComponentsList as $key => $value) 
//         {

//         $component = new GenericComponent( $value->Name, 
//         $value->MainComponentClass, 
//         $value->SubComponentClass, 
//         $value->NodeId);

//         foreach($value->properties as $propertyKey => $propertyValue) {
//         $property = new GenericProperty($propertyValue->Name, $propertyValue->Format, $propertyValue->Value);
//         $component->addProperty( $property );
//         } 
//         array_push ( $Components, $component ) ;
//         }

       
//         return $Components;
// }

// // classes
// class GenericComponent
// {
// var $Name; 
// var $MainComponentClass; 
// var $SubComponentClass;
// var $NodeId; 

// var $properties = array(); 
// // constructor
// public function __construct($name, $mainComponentClass, $subComponentClass, $nodeId) {
//         $this->Name = $name;
//         $this->MainComponentClass = $mainComponentClass;
//         $this->SubComponentClass = $subComponentClass;
//         $this->NodeId = $nodeId;
// }

// public function addProperty($genericProperty) {

//         // returns number of elements in an array
//         return array_push ( $this->properties, $genericProperty ) ;
// }

// public function propertyExists($propertyName) {

//         for ($i = 0; $i < count($this->properties); $i++) { 
//         if ( strtolower($this->properties[$i]->Name) === strtolower($propertyName)) {
//         return true;
//         }
//         }

//         return false;
// }

// public function getProperty($propertyName) {

//         for ($i = 0; $i < count($this->properties); $i++) { 
//         if ( strtolower($this->properties[$i]->Name) === strtolower($propertyName)) {
//         return $this->properties[$i];
//         }
//         }

//         return NULL;
//     } 
// }

// class GenericProperty
// { 
//         var $Name ; 
//         var $Format ; 
//         var $Value ; 

//         // constructor
//         public function __construct($name, $format, $value) {
//         $this->Name = str_replace("world","", $name); 
//         $this->Format = $format;
//         $this->Value = $value; 
//         }
// }
?>