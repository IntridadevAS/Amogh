<?php
            include 'CheckComponents.php';
            include 'CheckResultsWriter.php';

            if(!isset($_POST['CheckCaseType']) ||
               !isset($_POST['SourceASelectedCompoents'] )||
               !isset($_POST['SourceBSelectedCompoents'] ))
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
          
            $CheckCaseType = json_decode($_POST['CheckCaseType'],true);
            $SourceASelectedComponents = json_decode($_POST['SourceASelectedCompoents'],true);
            $SourceBSelectedComponents = json_decode($_POST['SourceBSelectedCompoents'],true);
           
            $CheckComponentsGroups = array();

            $SourceANotCheckedComponents = array();
            $SourceBNotCheckedComponents = array();
            $SourceANotMatchedComponents = array();
            $SourceBNotMatchedComponents = array();          
          
            // get source components and thier properties from database
            $SourceAComponents= array();
            $SourceBComponents= array();            
            $SourceAProperties= array();
            $SourceBProperties= array();
            getSourceComponents();           

            // perform comparison check on components
            checkDataSources();

            // write check result to database
            writeComparisonResultToDB();            

            // write not checked components to database
            writeNotCheckedComponentsToDB($SourceANotCheckedComponents, "SourceANotCheckedComponents", $projectName);
            writeNotCheckedComponentsToDB($SourceBNotCheckedComponents, "SourceBNotCheckedComponents", $projectName);

            // write not matched components to database
            writeNotMatchedComponentsToDB($SourceANotMatchedComponents, "SourceANotMatchedComponents", $projectName);
            writeNotMatchedComponentsToDB($SourceBNotMatchedComponents, "SourceBNotMatchedComponents", $projectName);
           
            // get source components
            function getSourceComponents()
            {
                global $projectName;
                global $SourceAComponents;
                global $SourceBComponents;
                global $SourceAProperties;
                global $SourceBProperties;                

                try{   
                        // open database
                        $dbPath = "../Projects/".$projectName."/".$projectName.".db";
                        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
 
                        // begin the transaction
                        $dbh->beginTransaction();
                         
                        // fetch source A components
                        $stmt =  $dbh->query('SELECT *FROM SourceAComponents');
                       
                        while ($componentRow = $stmt->fetch(\PDO::FETCH_ASSOC)) 
                        {
                                $values2 =array('id'=>$componentRow['id'], 'name'=>$componentRow['name'],  'mainclass'=>$componentRow['mainclass'], 'subclass'=>$componentRow['subclass']);
                                if (array_key_exists("nodeid",$componentRow))
                                {
                                    $values2["nodeid"] =  $componentRow['nodeid'];                               
                                }

                                //$values2 = array($row['name'],  $row['mainclass'], $row['subclass'], $row['nodeid']);
                                $SourceAComponents[$componentRow['id']] = $values2;    
                            
                                // fetch source A Properties
                                $properties = array();
                                $stmt1 =  $dbh->query('SELECT *FROM SourceAProperties where ownercomponent='.$componentRow['id']);
                               
                                while ($propertyRow = $stmt1->fetch(\PDO::FETCH_ASSOC)) 
                                {
                                    $values2 = array('name' => $propertyRow['name'], 'value' =>$propertyRow['value'], 'ownercomponent' =>$propertyRow['ownercomponent']);
                                    
                                    $properties[$propertyRow['name']] = $values2;                                                                             
                                }
                                $SourceAProperties[$componentRow['id']] =  $properties;
                        }                       

                        // fetch source B components
                        $stmt =  $dbh->query('SELECT *FROM SourceBComponents');
                        while ($componentRow = $stmt->fetch(\PDO::FETCH_ASSOC)) {

                                $values2 =array('id'=>$componentRow['id'], 'name'=>$componentRow['name'],  'mainclass'=>$componentRow['mainclass'], 'subclass'=>$componentRow['subclass']);
                                if (array_key_exists("nodeid",$componentRow))
                                {
                                    $values2["nodeid"] =  $componentRow['nodeid'];                               
                                }

                                $SourceBComponents[$componentRow['id']] =  $values2; 
                            
                                // fetch source B Properties
                                $properties= array();
                                $stmt1 =  $dbh->query('SELECT *FROM SourceBProperties where ownercomponent='.$componentRow['id']);
                                while ($propertyRow = $stmt1->fetch(\PDO::FETCH_ASSOC))
                                {
                                    $values2 = array('name' => $propertyRow['name'], 'value' =>$propertyRow['value'], 'ownercomponent' =>$propertyRow['ownercomponent']);
                                    
                                    $properties[$propertyRow['name']] = $values2;                                                                          
                                }
                                $SourceBProperties[$componentRow['id']] =  $properties;
                        }            
                     
                        // commit update
                        $dbh->commit();
                        $dbh = null; //This is how you close a PDO connection
                    }                
                catch(Exception $e) {        
                    echo "fail"; 
                    return;
                }                
            }         
         

            function checkDataSources() 
            {

                global $SourceAComponents;
                global $SourceBComponents;
                global $SourceAProperties;
                global $SourceBProperties;

                global $SourceASelectedComponents;
                global $SourceBSelectedComponents;

                global $SourceANotCheckedComponents ;
                global $SourceBNotCheckedComponents;
                global $SourceANotMatchedComponents;
                global $SourceBNotMatchedComponents;

                foreach ($SourceAComponents as $id => $sourceAComponent)
                {

                    // check is component is selected or not for performing check
                    if(!isComponentSelected($sourceAComponent, $SourceASelectedComponents)) 
                    {
                            
                            //source A component not checked    
                            $compKey = $sourceAComponent['id'];                            
                            if(!array_key_exists($compKey, $SourceANotCheckedComponents))
                            {
                                $SourceANotCheckedComponents[$compKey] = $sourceAComponent;                                                   
                            }

                        continue;
                    }

                    // componentMatchFound flag
                    $componentMatchFound = false;
                    $checkComponentGroup;
                    $checkCaseComponentClass;
                    $componentGroupMapped = false;

                    foreach ($SourceBComponents as $id =>$sourceBComponent) 
                    {                    
                        // check if component class exists in checkcase for Source A
                        if (!isComponentGroupExists($sourceAComponent['mainclass'], $sourceBComponent['mainclass'])) 
                        {
                            continue;
                        }
                    
                        // get check case group
                        $checkCaseGroup = getComponentGroup($sourceAComponent['mainclass'], $sourceBComponent['mainclass']);

                        
                        // check if component exists in checkCaseGroup
                        if (!componentClassExists($sourceAComponent['subclass'], 
                                                $sourceBComponent['subclass'],
                                                $checkCaseGroup, 
                                                $sourceAComponent['mainclass'],
                                                $sourceBComponent['mainclass'])) 
                            {
                                            
                               if (componentClassExists($sourceAComponent['subclass'], 
                                                        NULL, 
                                                        $checkCaseGroup, 
                                                        $sourceAComponent['mainclass'],
                                                        NULL)) 
                                    {                                                                            
                                        $checkComponentGroup = getCheckComponentGroup($sourceAComponent['mainclass'] . "-" . $sourceBComponent['mainclass']);
                                        $componentGroupMapped = true;
                                    }                                            

                                    continue;
                            }

                            // get check case component
                            $checkCaseComponentClass = getComponentClass($sourceAComponent['subclass'], 
                                                                        $sourceBComponent['subclass'],
                                                                        $checkCaseGroup, 
                                                                        $sourceAComponent['mainclass'],
                                                                        $sourceBComponent['mainclass']);

                            //component
                            $componentGroupMapped = true;

                            // create or get check component group
                            $checkComponentGroup = getCheckComponentGroup($sourceAComponent['mainclass'] . "-" . $sourceBComponent['mainclass']);
                            if ($checkComponentGroup == NULL) {
                                continue;
                            }     

                        
                            if (!isComponentMatch($sourceAComponent, 
                                                  $sourceBComponent,
                                                  $checkCaseComponentClass['MatchwithProperties']))
                            {

                                $compKey = $sourceAComponent['id'];     
                                //source A not matched
                                if(!isset($SourceANotMatchedComponents[$compKey]))
                                {
                                    $SourceANotMatchedComponents[$compKey] = $sourceAComponent;                                                      
                                }
                                continue;
                            }

                            // mark this source B proerty compoent as matched
                            //array_push( $comparedSourceBComponents, $sourceBComponent);
                            $comparedSourceBComponents[$sourceBComponent['id']] =  $sourceBComponent;

                            // set componentMatchFound flag to true
                            $componentMatchFound = true;

                            // create checkcomponent object                      
                            $checkComponent = new CheckComponent($sourceAComponent['name'],
                                $sourceBComponent['name'],
                                $sourceAComponent['subclass'],
                                $sourceAComponent['nodeid'],
                                $sourceBComponent['nodeid']);

                            
                            $checkComponentGroup->AddCheckComponent($checkComponent);

                            for ($k = 0; $k < count($checkCaseComponentClass['MappingProperties']); $k++) {
                                // get check case mapping property object
                                $checkCaseMappingProperty = $checkCaseComponentClass['MappingProperties'][$k];
        
                                $checkProperty = checkProperties($checkCaseMappingProperty, $sourceAComponent, $sourceBComponent);
                                if ($checkProperty == NULL) {
                                    continue;
                                }
        
                                $checkComponent->AddCheckProperty($checkProperty);                
                            }
        
                            break;
                    }

                    // if component match not found 
                    if (!$componentMatchFound && $componentGroupMapped) {
                        $checkComponent = getNoMatchComponent($sourceAComponent, $checkCaseComponentClass, true);

                        if($checkComponentGroup == NULL)
                        {
                            $checkComponentGroup =  getCheckComponentGroup($sourceAComponent['mainclass']);
                        }
                        if ($checkComponentGroup == NULL) {
                            continue;
                        }

                        $checkComponentGroup->AddCheckComponent($checkComponent);
                    }
                }  
                
                
                // compare checked properties from source B with corresponding source A properties                
                foreach ($SourceBComponents as $id => $sourceBComponent) 
                {                   
                    // check if this component is already compared. If yes, then do nothing
                    $componentCompared = false;              
                    
                    $compKey = $sourceBComponent['id'];     
                    if(isset($comparedSourceBComponents[$compKey]))
                    {
                        $componentCompared = true;
                        break;
                    }
                    if ($componentCompared) 
                    {
                        continue;
                    }

                    // check is component is selected or not for performing check
                    if(!isComponentSelected($sourceBComponent, $SourceBSelectedComponents)) 
                    {
                        //source A component not checked    
                        $compKey = $sourceBComponent['id'];     
                        if(!isset($SourceBNotCheckedComponents[$compKey]))
                        {
                            $SourceBNotCheckedComponents[$compKey] = $sourceBComponent;                                                   
                        }
                        continue;
                    }                 

                    $componentMatchFound = false;
                    $checkComponentGroup = NULL;
                    $checkCaseComponentClass = NULL;
                    $componentGroupMapped = false;

                    foreach ($SourceAComponents as $id => $sourceAComponent)
                    {
                       // $sourceAComponent = $SourceAComponents[$j];

                        // check if component class exists in checkcase for Source B
                        if (!isComponentGroupExists($sourceAComponent["mainclass"], $sourceBComponent["mainclass"])) 
                        {
                            continue;
                        }
                    
                        // get check case group for both sources
                        $checkCaseGroup = getComponentGroup($sourceAComponent["mainclass"], $sourceBComponent["mainclass"]);
                
                        // check if component exists in checkCaseGroup
                        if (!componentClassExists($sourceAComponent["subclass"], 
                                                $sourceBComponent["subclass"],
                                                $checkCaseGroup, 
                                                $sourceAComponent["mainclass"],
                                                $sourceBComponent["mainclass"])) 
                        {
                            
                            if (componentClassExists(NULL, 
                                                    $sourceBComponent["subclass"], 
                                                    $checkCaseGroup, 
                                                    NULL,
                                                    $sourceBComponent["mainclass"])) 
                            {
                                $checkComponentGroup = getCheckComponentGroup($sourceAComponent["mainclass"] . "-" . $sourceBComponent["mainclass"]);
                                $componentGroupMapped = true;
                            }

                            continue;
                        }

                        // get check case component
                        $checkCaseComponentClass = getComponentClass($sourceAComponent["subclass"], 
                                                                    $sourceBComponent["subclass"],
                                                                    $checkCaseGroup, 
                                                                    $sourceAComponent["mainclass"],
                                                                    $sourceBComponent["mainclass"]);

                        $componentGroupMapped  =  true;
                        // create or get check component group
                        $checkComponentGroup = getCheckComponentGroup($sourceAComponent["mainclass"] . "-" . $sourceBComponent["mainclass"]);
                        if ($checkComponentGroup == NULL) 
                        {
                            continue;
                        }

                        //var_dump($checkCaseComponentClass);
                        // check if components are match
                        if (!isComponentMatch($sourceAComponent, 
                                            $sourceBComponent,
                                            $checkCaseComponentClass['MatchwithProperties'])) {
                            // source A componenet is not checked and source b component is checked
                            // both components are not match
                            // push source b component to src B not matched array                         
                            if(!isset($SourceBNotMatchedComponents[$compKey]))
                            {
                                $SourceBNotMatchedComponents[$compKey] = $sourceBComponent;                                                   
                            }
                            continue;
                        }
                                            
                        $compKey1 = $sourceAComponent['id'];     
                        if(isset($SourceANotCheckedComponents[$compKey1]))
                        {
                            unset($SourceANotCheckedComponents[$compKey1]);                                  
                        }

                        // source A componenet is not checked and source b component is checked
                        // both components are match
                        // remove src A component from src A not checked array
                        $componentMatchFound = true;

                        // create checkcomponent object
                        $checkComponent = new CheckComponent($sourceAComponent["name"],
                                                            $sourceBComponent["name"],
                                                            $sourceAComponent["subclass"],
                                                            $sourceAComponent["nodeid"],
                                                            $sourceBComponent["nodeid"]);
                        $checkComponentGroup->AddCheckComponent($checkComponent);

                        for ($k = 0; $k < count($checkCaseComponentClass['MappingProperties']); $k++) {
                            // get check case mapping property object
                            $checkCaseMappingProperty = $checkCaseComponentClass['MappingProperties'][$k];

                            $checkProperty = checkProperties($checkCaseMappingProperty, $sourceAComponent, $sourceBComponent);
                            if ($checkProperty == NULL) {
                                continue;
                            }
                            $checkComponent->AddCheckProperty($checkProperty);
                        }

                        break;
                    }

                    // if component match not found 
                    if (!$componentMatchFound && $componentGroupMapped) {
                        $checkComponent = getNoMatchComponent($sourceBComponent, $checkCaseComponentClass, false);
                        if ($checkComponentGroup === NULL) {
                            $checkComponentGroup = getCheckComponentGroup($sourceBComponent["mainclass"]);
                        }
                        if ($checkComponentGroup == NULL) {
                            continue;
                        }

                        $checkComponentGroup->AddCheckComponent($checkComponent);
                    }
                }
            }
          

            function checkProperties ($checkCaseMappingProperty,
                                        $sourceAComponent,
                                        $sourceBComponent) 
            {
                // get check case mapping property object
                // var checkCaseMappingProperty = checkCaseComponentClass.MappingProperties[k];
                global $SourceAProperties;
                global $SourceBProperties;

                $property1Name = NULL;
                $property2Name= NULL;
                $property1Value= NULL;
                $property2Value= NULL;
                $severity= NULL;
                $performCheck;
                $description ="";
               
                $sourceAComponentProperties =  $SourceAProperties[$sourceAComponent['id']];
                $sourceBComponentProperties =  $SourceBProperties[$sourceBComponent['id']];               

                if (array_key_exists($checkCaseMappingProperty['SourceAName'], $sourceAComponentProperties)) 
                {                    
                    if (array_key_exists($checkCaseMappingProperty['SourceBName'], $sourceBComponentProperties)) 
                    {
                        $property1 =$sourceAComponentProperties[$checkCaseMappingProperty['SourceAName']];
                        $property2 =$sourceBComponentProperties[$checkCaseMappingProperty['SourceBName']];

                        // $property1 = $sourceAComponent->getProperty($checkCaseMappingProperty['SourceAName']);
                        // $property2 = $sourceBComponent->getProperty($checkCaseMappingProperty['SourceBName']);

                        $property1Name = $property1['name'];
                        $property2Name = $property2['name'];
                        $property1Value = $property1["value"];
                        $property2Value = $property2["value"];

                        // If both properties (Source A and Source B properties) do not have values, 
                        // show  'No Value' severity
                        if (($property1Value == NULL || $property1Value == "") &&
                            ($property2Value == NULL || $property2Value == "")) 
                        {
                            $severity = "No Value";
                            $performCheck = false;                    
                        }
                        else if (($property1Value == NULL || $property1Value == "") ||
                                 ($property2Value == NULL || $property2Value == "")) 
                        {
                            // If anyone of the properties has no value, then show 'Error'.
                            $severity = "Error";
                            $performCheck = false;                    
                        }
                        else 
                        {
                            $severity = $checkCaseMappingProperty['Severity'];
                            $performCheck = true;                  
                        }
                    }
                    else 
                    {
                        $property1 =$sourceAComponentProperties[$checkCaseMappingProperty['SourceAName']];
                        //$property1 = $sourceAComponent->getProperty($checkCaseMappingProperty['SourceAName']);

                        $property1Name = $property1["name"];
                        $property2Name = "";
                        $property1Value = $property1["value"];
                        $property2Value = "";
                        $severity = "Error";
                        $performCheck = false;               
                    }
                }
                else if (array_key_exists($checkCaseMappingProperty['SourceBName'], $sourceBComponentProperties)) 
                {
                    $property2 =$sourceBComponentProperties[$checkCaseMappingProperty['SourceBName']];
                    //$property2 = $sourceBComponent->getProperty($checkCaseMappingProperty['SourceBName']);

                    $property1Name = "";
                    $property2Name = $property2["name"];
                    $property1Value = "";
                    $property2Value = $property2["value"];
                    $severity = "Error";
                    $performCheck = false;
                }

                if ($checkCaseMappingProperty['Comment']) 
                {
                    $description =  $description . $checkCaseMappingProperty['Comment'];
                }

                if ($property1Name == NULL && $property2Name == NULL) 
                {
                    return NULL;
                }
                
                $checkProperty = new CheckProperty($property1Name,
                                                $property1Value,
                                                $property2Name,
                                                $property2Value,
                                                $severity,
                                                $performCheck,
                                                $description);

                return $checkProperty;
            }

            
            function getNoMatchComponent ($sourceComponent, $checkCaseComponentClass, $sourceAComponent) 
            {
                $checkComponent;
                if ($sourceAComponent) 
                {
                    global $SourceAProperties;                  

                    $checkComponent = new CheckComponent($sourceComponent["name"],
                                                        "",
                                                        $sourceComponent["subclass"],
                                                        $sourceComponent["nodeid"],
                                                        NULL);

                    $sourceAComponentProperties =  $SourceAProperties[$sourceComponent['id']];
                
                    foreach ($sourceAComponentProperties as $name => $property) 
                    {                       
                        $checkProperty = new CheckProperty($property["name"],
                                                            $property["value"],
                                                            NULL,
                                                            NULL,
                                                            "No Match",
                                                            NULL,
                                                            NULL);

                        $checkProperty->PerformCheck = false;
                        $checkComponent->AddCheckProperty($checkProperty);
                    }               
                   
                }
                else 
                {
                    global $SourceBProperties;

                    $checkComponent = new CheckComponent("",
                                                        $sourceComponent["name"],
                                                        $sourceComponent["subclass"],
                                                        NULL,
                                                        $sourceComponent["nodeid"]);

                    $sourceBComponentProperties =  $SourceBProperties[$sourceComponent['id']];
                    foreach ($sourceBComponentProperties as $name => $property) 
                    {                       
                        $checkProperty = new CheckProperty(NULL,
                                                        NULL,
                                                        $property["name"],
                                                        $property["value"],
                                                        "No Match",
                                                        NULL,
                                                        NULL);


                        $checkProperty->PerformCheck = false;
                        $checkComponent->AddCheckProperty($checkProperty);
                    }           

                }

                $checkComponent->Status = "No Match";
                return $checkComponent;
            }

            function isComponentMatch ($sourceAComponent,
                                       $sourceBComponent,
                                       $matchwithProperties) 
                   {

                        global  $SourceAProperties;
                        global  $SourceBProperties;

                        if (count($matchwithProperties) == 0)
                         {
                            return false;
                         }           

                        foreach ($matchwithProperties as $key => $value) 
                        {                                            
                            $sourceAMatchwithPropertyName = $key;
                            $sourceBMatchwithPropertyName = $value;

                            $sourceAComponentProperties =  $SourceAProperties[$sourceAComponent['id']];
                            $sourceBComponentProperties =  $SourceBProperties[$sourceBComponent['id']];

                            if (!array_key_exists($sourceAMatchwithPropertyName, $sourceAComponentProperties) ||
                                !array_key_exists($sourceBMatchwithPropertyName, $sourceBComponentProperties))
                            {
                                return false;
                            }                          

                            $sourceAMatchwithProperty = $sourceAComponentProperties[$sourceAMatchwithPropertyName];
                            $sourceBMatchwithProperty = $sourceBComponentProperties[$sourceBMatchwithPropertyName];
                          

                            if ($sourceAMatchwithProperty['value'] != $sourceBMatchwithProperty['value']) 
                            {
                                return false;
                            }
                        }

                        return true; 
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
                        return NULL;
                }


            function getCheckComponentGroup ($mainComponentClass) 
            {
                global $CheckComponentsGroups;
                $checkComponentGroup;
    
                if ($CheckComponentsGroups  != NULL&&
                    array_key_exists($mainComponentClass, $CheckComponentsGroups)) {
                        
                        $checkComponentGroup =$CheckComponentsGroups[$mainComponentClass];
                }
                else {
                    $checkComponentGroup = new CheckComponentGroup($mainComponentClass);
                    $CheckComponentsGroups[$mainComponentClass] = $checkComponentGroup;
                }
                    
                return $checkComponentGroup;
            }

            // $componentGroupName : main component class 
            function componentClassExists($sourceAClassName, 
                                        $sourceBClassName, 
                                        $checkCaseGroup, 
                                        $sourceAcomponentGroupName,
                                        $sourceBcomponentGroupName){               

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

            function isComponentSelected($component, $SelectedComponents){
           
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
                
?>

