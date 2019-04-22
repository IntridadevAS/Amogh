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
            //var_dump($CheckComponentsGroups);
            //var_dump($SourceANotMatchedComponents);

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
                                    //array_push($properties, $values2);
                                    //$properties = array_merge($properties, $values2);                                            
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
                                    //array_push($properties, $values2);
                                    //$properties = array_merge($properties, $values2);                                            
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
                            $compKey = $sourceAComponent['name'] ."_".$sourceAComponent['mainclass']."_".$sourceAComponent['subclass'];                            
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

                                $compKey = $sourceAComponent['name'] ."_".$sourceAComponent['mainclass']."_".$sourceAComponent['subclass'];
                                //source A not matched
                                if(!isset($SourceANotMatchedComponents[$compKey]))
                                {
                                    $SourceANotMatchedComponents[$compKey] = $sourceAComponent;                                                      
                                }
                                continue;
                            }

                            // mark this source B proerty compoent as matched
                            array_push( $comparedSourceBComponents, $sourceBComponent);
                            
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
                    
                    $compKey = $sourceBComponent["name"]."_".$sourceBComponent["mainclass"]."_".$sourceBComponent["subclass"];
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
                        $compKey = $sourceBComponent['name'] ."_".$sourceBComponent['mainclass']."_".$sourceBComponent['subclass'];
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
                                            
                        $compKey1 = $sourceAComponent["name"]."_".$sourceAComponent["mainclass"]."_".$sourceAComponent["subclass"];
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

                            // if (!$sourceAComponent->propertyExists($sourceAMatchwithPropertyName) ||
                            //     !$sourceBComponent->propertyExists($sourceBMatchwithPropertyName)) 
                            //     {
                            //         return false;
                            //     }

                            $sourceAMatchwithProperty = $sourceAComponentProperties[$sourceAMatchwithPropertyName];
                            $sourceBMatchwithProperty = $sourceBComponentProperties[$sourceBMatchwithPropertyName];
                            // $sourceAMatchwithProperty = $sourceAComponent->getProperty($sourceAMatchwithPropertyName);
                            // $sourceBMatchwithProperty = $sourceBComponent->getProperty($sourceBMatchwithPropertyName);

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
            

            //////////////////////////////////////////////////////////////////////////

    //         function checkDataSources($SourceAComponents, $SourceBComponents) {

    //             // global $SourceAProperties;
    //             // global $SourceBProperties;
    //             global $SourceAType;
    //             global $SourceBType;
    //             global $SourceASelectedComponents;
    //             global $SourceBSelectedComponents;

    //             global $CheckComponentsGroups ;

    //             global $SourceANotCheckedComponents;
    //             global $SourceBNotCheckedComponents;
    //             global $SourceANotMatchedComponents;
    //             global $SourceBNotMatchedComponents;

    //             global $SourceAIdentifierProperties;
    //             global $SourceBIdentifierProperties;

    //         //var comparedSourceBComponents = [];
    //         $comparedSourceBComponents = array();           

    //         // compare checked properties from source A with corresponding source B properties
    //         for ($i = 0; $i < count($SourceAComponents); $i++) {
    //             $sourceAComponent = $SourceAComponents[$i];

    //             // check if this property is checked or not, in Source A
    //             if ((strtolower($SourceAType) === "xml" ||
    //                 strtolower($SourceAType) === "rvm" ||
    //                 strtolower($SourceAType) === "sldasm" ||
    //                 strtolower($SourceAType) === "sldprt" ) &&
    //                 !isComponentSelected($sourceAComponent, $SourceASelectedComponents,  $SourceAIdentifierProperties)) {
    //                     //source A not checked    
    //                     $compKey = $sourceAComponent->Name."_".$sourceAComponent->MainComponentClass."_".$sourceAComponent->SubComponentClass;
    //                     if(!isset($SourceANotCheckedComponents[$compKey]))
    //                     {
    //                         $SourceANotCheckedComponents[$compKey] = $sourceAComponent;
    //                         //array_push($SourceANotCheckedComponents, $sourceAComponent);                     
    //                     }

    //                 continue;
    //             }
    //             else if (strtolower($SourceAType) === "xls" &&
    //                     !isComponentSelected($sourceAComponent, $SourceASelectedComponents,  $SourceAIdentifierProperties)) {
    //                     //source A not checked
    //                     $compKey = $sourceAComponent->Name."_".$sourceAComponent->MainComponentClass."_".$sourceAComponent->SubComponentClass;
    //                     if(!isset($SourceANotCheckedComponents[$compKey]))
    //                     {
    //                         $SourceANotCheckedComponents[$compKey] = $sourceAComponent;
    //                         //array_push($SourceANotCheckedComponents, $sourceAComponent);
    //                     }
    //                 continue;
    //             }        

    //             // componentMatchFound flag
    //             $componentMatchFound = false;
    //             $checkComponentGroup;
    //             $checkCaseComponentClass;
    //             $componentGroupMapped = false;

    //             // check corresponding component in source B
    //             for ($j = 0; $j <  count($SourceBComponents); $j++) {
    //                 $sourceBComponent = $SourceBComponents[$j];

    //                 // check if component class exists in checkcase for Source A
    //                 if (!isComponentGroupExists($sourceAComponent->MainComponentClass, $sourceBComponent->MainComponentClass)) {
    //                     continue;
    //                 }
                
    //                 // get check case group
    //                 $checkCaseGroup = getComponentGroup($sourceAComponent->MainComponentClass, $sourceBComponent->MainComponentClass);

    //                 // check if component exists in checkCaseGroup
    //                 if (!componentClassExists($sourceAComponent->SubComponentClass, 
    //                                           $sourceBComponent->SubComponentClass,
    //                                           $checkCaseGroup, 
    //                                           $sourceAComponent->MainComponentClass,
    //                                           $sourceBComponent->MainComponentClass)) {
                                            
    //                                         if (componentClassExists($sourceAComponent->SubComponentClass, 
    //                                             NULL, 
    //                                             $checkCaseGroup, 
    //                                             $sourceAComponent->MainComponentClass,
    //                                             NULL)) {
                                                                            
    //                                             $checkComponentGroup = getCheckComponentGroup($sourceAComponent->MainComponentClass . "-" . $sourceBComponent->MainComponentClass);
    //                                             $componentGroupMapped = true;
    //                                         }
                                            

    //                     continue;
    //                 }

    //                 // get check case component
    //                 $checkCaseComponentClass = getComponentClass($sourceAComponent->SubComponentClass, 
    //                                                              $sourceBComponent->SubComponentClass,
    //                                                              $checkCaseGroup, 
    //                                                              $sourceAComponent->MainComponentClass,
    //                                                              $sourceBComponent->MainComponentClass);

    //                 //component
    //                 $componentGroupMapped = true;

    //                 // create or get check component group
    //                 $checkComponentGroup = getCheckComponentGroup($sourceAComponent->MainComponentClass . "-" . $sourceBComponent->MainComponentClass);
    //                 if ($checkComponentGroup == NULL) {
    //                     continue;
    //                 }     

    //                // var_dump($checkCaseComponentClass);
    //                 if (!isComponentMatch($sourceAComponent, 
    //                                       $sourceBComponent,
    //                                       $checkCaseComponentClass['MatchwithProperties'])) {

    //                     $compKey = $sourceAComponent->Name."_".$sourceAComponent->MainComponentClass."_".$sourceAComponent->SubComponentClass;
    //                     //source A not matched
    //                     if(!isset($SourceANotCheckedComponents[$compKey]))
    //                     {
    //                         $SourceANotMatchedComponents[$compKey] = $sourceAComponent;
    //                         //array_push($SourceANotMatchedComponents, $sourceAComponent);                       
    //                     }
    //                     continue;
    //                 }
                                        
    //                 // mark this source B proerty compoent as matched
    //                 array_push( $comparedSourceBComponents, $sourceBComponent);
                    
    //                 // set componentMatchFound flag to true
    //                 $componentMatchFound = true;

    //                 // create checkcomponent object
    //                 $checkComponent = new CheckComponent($sourceAComponent['name'],
    //                                                     $sourceBComponent['name'],
    //                                                     $sourceAComponent['subclass'],
    //                                                     $sourceAComponent['nodeid'],
    //                                                     $sourceBComponent['nodeid']);
                    
    //                 $checkComponentGroup->AddCheckComponent($checkComponent);

    //                 for ($k = 0; $k < count($checkCaseComponentClass['MappingProperties']); $k++) {
    //                     // get check case mapping property object
    //                     $checkCaseMappingProperty = $checkCaseComponentClass['MappingProperties'][$k];

    //                     $checkProperty = checkProperties($checkCaseMappingProperty, $sourceAComponent, $sourceBComponent);
    //                     if ($checkProperty == NULL) {
    //                         continue;
    //                     }

    //                     $checkComponent->AddCheckProperty($checkProperty);                
    //                 }

    //                 break;
    //             }

    //             // if component match not found 
    //             if (!$componentMatchFound && $componentGroupMapped) {
    //                 $checkComponent = getNoMatchComponent($sourceAComponent, $checkCaseComponentClass, true);

    //                 if($checkComponentGroup == NULL)
    //                 {
    //                     $checkComponentGroup =  getCheckComponentGroup($sourceAComponent->MainComponentClass);
    //                 }
    //                 if ($checkComponentGroup == NULL) {
    //                     continue;
    //                 }

    //                 $checkComponentGroup->AddCheckComponent($checkComponent);
    //             }
    //         }            

    //         // compare checked properties from source B with corresponding source A properties
    //         for ($i = 0; $i < count($SourceBComponents); $i++) {
    //             $sourceBComponent = $SourceBComponents[$i];

    //             // check if this component is already compared. If yes, then do nothing
    //             $componentCompared = false;              
                
    //             $compKey = $sourceBComponent->Name."_".$sourceBComponent->MainComponentClass."_".$sourceBComponent->SubComponentClass;
    //             if(isset($comparedSourceBComponents[$compKey]))
    //             {
    //                 $componentCompared = true;
    //                 break;
    //             }
    //             if ($componentCompared) {
    //                 continue;
    //             }

    //             // check if this property is checked or not in SOurce BG
    //             if ((strtolower($SourceBType) === "xml" ||
    //                 strtolower($SourceBType) === "rvm" ||
    //                 strtolower($SourceBType) === "sldasm" ||
    //                 strtolower($SourceBType) === "sldprt") &&
    //                 !isComponentSelected($sourceBComponent, $SourceBSelectedComponents,  $SourceBIdentifierProperties)) {
    //                     //source B not checked                       
    //                     if( !isset($SourceBNotCheckedComponents[$compKey]))
    //                     {
    //                         $SourceBNotCheckedComponents[$compKey]= $sourceBComponent;
    //                         //array_push( $SourceBNotCheckedComponents, $sourceBComponent);                   
    //                     }
    //                 continue;
    //             }
    //             else if ( strtolower($SourceBType) === "xls"&&
    //                     !isComponentSelected($sourceBComponent, $SourceBSelectedComponents,  $SourceBIdentifierProperties)) {
    //                     //source B not checked
    //                     if( !isset($SourceBNotCheckedComponents[$compKey]))
    //                     {
    //                         $SourceBNotCheckedComponents[$compKey]= $sourceBComponent;
    //                         //array_push( $SourceBNotCheckedComponents, $sourceBComponent);                   
    //                     }
    //                 continue;
    //             }        

    //             $componentMatchFound = false;
    //             $checkComponentGroup = NULL;
    //             $checkCaseComponentClass = NULL;
    //             $componentGroupMapped = false;

    //             for ($j = 0; $j < count($SourceAComponents); $j++) {
    //                 $sourceAComponent = $SourceAComponents[$j];

    //                 // check if component class exists in checkcase for Source B
    //                 if (!isComponentGroupExists($sourceAComponent->MainComponentClass, $sourceBComponent->MainComponentClass)) {
    //                     continue;
    //                 }
                
    //                 // get check case group for both sources
    //                 $checkCaseGroup = getComponentGroup($sourceAComponent->MainComponentClass, $sourceBComponent->MainComponentClass);
            
    //                 // check if component exists in checkCaseGroup
    //                 if (!componentClassExists($sourceAComponent->SubComponentClass, 
    //                                            $sourceBComponent->SubComponentClass,
    //                                            $checkCaseGroup, 
    //                                            $sourceAComponent->MainComponentClass,
    //                                            $sourceBComponent->MainComponentClass)) {
                        
    //                     if (componentClassExists(NULL, 
    //                                             $sourceBComponent->SubComponentClass, 
    //                                             $checkCaseGroup, 
    //                                             NULL,
    //                                             $sourceBComponent->MainComponentClass)) {
    //                         $checkComponentGroup = getCheckComponentGroup($sourceAComponent->MainComponentClass . "-" . $sourceBComponent->MainComponentClass);
    //                         $componentGroupMapped = true;
    //                     }

    //                     continue;
    //                 }

    //                 // get check case component
    //                 $checkCaseComponentClass = getComponentClass($sourceAComponent->SubComponentClass, 
    //                                                               $sourceBComponent->SubComponentClass,
    //                                                               $checkCaseGroup, 
    //                                                               $sourceAComponent->MainComponentClass,
    //                                                               $sourceBComponent->MainComponentClass);

    //                 $componentGroupMapped  =  true;
    //                 // create or get check component group
    //                 $checkComponentGroup = getCheckComponentGroup($sourceAComponent->MainComponentClass . "-" . $sourceBComponent->MainComponentClass);
    //                 if ($checkComponentGroup == NULL) {
    //                     continue;
    //                 }

    //                 //var_dump($checkCaseComponentClass);
    //                 // check if components are match
    //                 if (!isComponentMatch($sourceAComponent, 
    //                                       $sourceBComponent,
    //                                       $checkCaseComponentClass['MatchwithProperties'])) {
    //                     // source A componenet is not checked and source b component is checked
    //                     // both components are not match
    //                     // push source b component to src B not matched array                         
    //                     if(!isset($SourceBNotMatchedComponents[$compKey]))
    //                     {
    //                         $SourceBNotMatchedComponents[$compKey] = $sourceBComponent;
    //                         //array_push($SourceBNotMatchedComponents, $sourceBComponent);                    
    //                     }
    //                     continue;
    //                 }
                                        
    //                 $compKey1 = $sourceAComponent->Name."_".$sourceAComponent->MainComponentClass."_".$sourceAComponent->SubComponentClass;
    //                 if(isset($SourceANotCheckedComponents[$compKey1]))
    //                 {
    //                     unset($SourceANotCheckedComponents[$compKey1]);

    //                 // $index = $SourceANotCheckedComponents.indexOf($sourceAComponent);
    //                 // array_splice($SourceANotCheckedComponents, $index,1 );               
    //                 }

    //                 // source A componenet is not checked and source b component is checked
    //                 // both components are match
    //                 // remove src A component from src A not checked array
    //                 $componentMatchFound = true;

    //                 // create checkcomponent object
    //                 $checkComponent = new CheckComponent($sourceAComponent->Name,
    //                     $sourceBComponent->Name,
    //                     $sourceAComponent->SubComponentClass,
    //                     $sourceAComponent->NodeId,
    //                     $sourceBComponent->NodeId);
    //                 $checkComponentGroup->AddCheckComponent($checkComponent);

    //                 for ($k = 0; $k < count($checkCaseComponentClass['MappingProperties']); $k++) {
    //                     // get check case mapping property object
    //                     $checkCaseMappingProperty = $checkCaseComponentClass['MappingProperties'][$k];

    //                     $checkProperty = checkProperties($checkCaseMappingProperty, $sourceAComponent, $sourceBComponent);
    //                     if ($checkProperty == NULL) {
    //                         continue;
    //                     }
    //                     $checkComponent->AddCheckProperty($checkProperty);
    //                 }

    //                 break;
    //             }

    //             // if component match not found 
    //             if (!$componentMatchFound && $componentGroupMapped) {
    //                 $checkComponent = getNoMatchComponent($sourceBComponent, $checkCaseComponentClass, false);
    //                 if ($checkComponentGroup === NULL) {
    //                     $checkComponentGroup = getCheckComponentGroup($sourceBComponent->MainComponentClass);
    //                 }
    //                 if ($checkComponentGroup == NULL) {
    //                     continue;
    //                 }

    //                 $checkComponentGroup->AddCheckComponent($checkComponent);
    //             }
    //         }

    //         //var_dump($CheckComponentsGroups);
    //     }

    //     function isComponentSelected($componentProperties, $SelectedComponents, $IdentifierProperties){
           
    //         for($index = 0; $index < count($SelectedComponents); $index++)
    //         {
    //             $component = $SelectedComponents[$index];              
    //             if($componentProperties->Name == $component[$IdentifierProperties['name']] &&
    //                $componentProperties->MainComponentClass == $component[$IdentifierProperties['mainCategory']] && 
    //                $componentProperties->SubComponentClass == $component[$IdentifierProperties['subClass']]){
                       
    //                        if($component['NodeId'])
    //                     {                          
    //                         if($component['NodeId'] == $componentProperties->NodeId)
    //                         {                               
    //                             return true;
    //                         }                           
    //                     }
    //                     else{                           
    //                         return true;
    //                     }
    //             }                    
                   
    //         }

    //         return false;
    //     }

    //     function isComponentGroupExists($sourceAGroupName, $sourceBGroupName){
    //         global $CheckCaseType;
    //         for($index = 0; $index < count($CheckCaseType['ComponentGroups']); $index++)
    //         {
    //              // check for source A only
    //              if ($sourceBGroupName == NULL &&
    //                 strtolower($CheckCaseType['ComponentGroups'][$index]['SourceAName']) == strtolower($sourceAGroupName)) {
    //              return true;
    //             }
    //             // check for source B only
    //             if ($sourceAGroupName == NULL &&
    //                 strtolower($CheckCaseType['ComponentGroups'][$index]['SourceBName']) == strtolower($sourceBGroupName)) {
    //             return true;
    //             }
        
    //             // check for both sources
    //             if (strtolower($CheckCaseType['ComponentGroups'][$index]['SourceAName']) == strtolower($sourceAGroupName) &&
    //             strtolower($CheckCaseType['ComponentGroups'][$index]['SourceBName']) == strtolower($sourceBGroupName)) {
    //             return true;
    //             }
    //         }
        
    //         return false;
    //     }

    //     function getComponentGroup($sourceAGroupName, $sourceBGroupName){
    //         global $CheckCaseType;
    //         for($index = 0; $index < count($CheckCaseType['ComponentGroups']); $index++)
    //         {
    //              // check for source A only
    //              if ($sourceBGroupName == NULL &&
    //                 strtolower($CheckCaseType['ComponentGroups'][$index]['SourceAName']) == strtolower($sourceAGroupName)) {
    //              return $CheckCaseType['ComponentGroups'][$index];
    //             }
    //             // check for source B only
    //             if ($sourceAGroupName == NULL &&
    //                 strtolower($CheckCaseType['ComponentGroups'][$index]['SourceBName']) == strtolower($sourceBGroupName)) {
    //             return $CheckCaseType['ComponentGroups'][$index];
    //             }
        
    //             // check for both sources
    //             if (strtolower($CheckCaseType['ComponentGroups'][$index]['SourceAName']) == strtolower($sourceAGroupName) &&
    //             strtolower($CheckCaseType['ComponentGroups'][$index]['SourceBName']) == strtolower($sourceBGroupName)) {
    //             return $CheckCaseType['ComponentGroups'][$index];
    //             }
    //         }
        
    //         return NULL;
    //     }
        
    //     // $componentGroupName : main component class 
    //     function componentClassExists($sourceAClassName, 
    //                                   $sourceBClassName, 
    //                                   $checkCaseGroup, 
    //                                   $sourceAcomponentGroupName,
    //                                   $sourceBcomponentGroupName){               

    //         $componentClasses = $checkCaseGroup['ComponentClasses'];                    
    //         for($classIndex = 0; $classIndex < count($componentClasses); $classIndex++)
    //         {
                
    //                 $componentClass = $componentClasses[$classIndex];

    //                 if ($sourceAClassName == NULL &&
    //                    $sourceBClassName != NULL &&
    //                 strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) {
    //                     return true;
    //                 }
                    
    //                 if ($sourceBClassName == NULL &&
    //                     $sourceAClassName != NULL &&
    //                     strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName)) {
                    
    //                     return true;
    //                 }

    //                 if ($sourceAClassName != NULL &&
    //                     $sourceBClassName != NULL &&
    //                     strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName) &&
    //                     strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) {
    //                     return true;
    //                 }

    //         }
    //         return false;  
    //     }

    //     function getComponentClass($sourceAClassName, 
    //                                 $sourceBClassName, 
    //                                 $checkCaseGroup, 
    //                                 $sourceAcomponentGroupName,
    //                                 $sourceBcomponentGroupName){

    //                 if(strtolower($checkCaseGroup['SourceAName']) != strtolower($sourceAcomponentGroupName) ||
    //                    strtolower($checkCaseGroup['SourceBName']) != strtolower($sourceBcomponentGroupName))
    //                 {
    //                     return false;
    //                 }

    //         $componentClasses = $checkCaseGroup['ComponentClasses'];                    
    //         for($classIndex = 0; $classIndex < count($componentClasses); $classIndex++)
    //         {
    //             // if(strtolower($checkCaseGroup['SourceAName']) == strtolower($componentGroupName))
    //             // {
    //                 $componentClass = $componentClasses[$classIndex];
        
    //                 if ($sourceAClassName == NULL &&
    //                 $sourceBClassName != NULL &&
    //                 strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) {
    //                     return $componentClass;
    //                 }
                    
    //                 if ($sourceBClassName == NULL &&
    //                     $sourceAClassName != NULL &&
    //                     strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName)) {
                            
    //                     return $componentClass;
    //                 }
        
    //                 if ($sourceAClassName != NULL &&
    //                     $sourceBClassName != NULL &&
    //                     strtolower($componentClass['SourceAName']) === strtolower($sourceAClassName) &&
    //                     strtolower($componentClass['SourceBName']) == strtolower($sourceBClassName)) {
    //                     return $componentClass;
    //                 }
    //             // }
    //             // else{
    //             //     continue;
    //             // }
    //         }
    //         return NULL;
    //     }

    //     function getCheckComponentGroup ($mainComponentClass) {
    //        global $CheckComponentsGroups;
    //         $checkComponentGroup;

    //         if ($CheckComponentsGroups  != NULL&&
    //             array_key_exists($mainComponentClass, $CheckComponentsGroups)) {
                    
    //                 $checkComponentGroup =$CheckComponentsGroups[$mainComponentClass];
    //         }
    //         else {
    //             $checkComponentGroup = new CheckComponentGroup($mainComponentClass);
    //             $CheckComponentsGroups[$mainComponentClass] = $checkComponentGroup;
    //         }
                
    //         return $checkComponentGroup;
    //     }

    //     class CheckComponentGroup{
    //         var $ComponentClass;
        
    //         var $Components = array();
        
    //         function __construct( $par1 ) {
    //             $this->ComponentClass = $par1;
    //          }
        
    //          function AddCheckComponent($Component){
    //             array_push($this->Components, $Component);
    //          }
    //     }
        
    //     class CheckComponent{
    //         var $SourceAName;
    //         var $SourceBName;
    //         var $SubComponentClass;
        
    //         var $Status;
    //         var $CheckProperties;
        
    //         var $SourceANodeId;
    //         var $SourceBNodeId;
        
    //         function __construct( $sourceAName,
    //                             $sourceBName,
    //                             $subComponentClass,
    //                             $sourceANodeId,
    //                             $sourceBNodeId ) 
    //         {
    //             $this->SourceAName = $sourceAName;
    //             $this->SourceBName = $sourceBName; 
    //             $this->SubComponentClass = $subComponentClass;
        
    //             $this->Status = "OK";
    //             $this->CheckProperties = array();
        
    //             $this->SourceANodeId = $sourceANodeId;
    //             $this->SourceBNodeId = $sourceBNodeId;
    //          }
        
    //          function AddCheckProperty($property){
    //             array_push($this->CheckProperties, $property);
        
    //             if(!$property->PerformCheck)
    //             {
    //                 if(strtolower($property->Severity) == strtolower("Error"))
    //                 {
    //                     $this->Status = "Error";
    //                 }
    //             }
    //             else{
    //                 if(!$property->Result)
    //                 {
    //                     if(strtolower($property->Severity) == strtolower("Error"))
    //                     {
    //                         $this->Status = "Error";
    //                     }
    //                     else if(strtolower($property->Severity) == strtolower("Warning") &&
    //                             strtolower($this->Status) != strtolower("Error")){
    //                                 $this->Status = "Warning";
    //                     }
    //                 }
    //             }
    //          }
        
        
        
    //     }
        
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

    //     function isComponentMatch ($sourceAComponent,
    //                                $sourceBComponent,
    //                                $matchwithProperties) {

    //         if (count($matchwithProperties) == 0) {
    //         return false;
    //         }           

    //         //echo $matchwithProperties;
    //         // var_dump("MatchWith Properties Count: ".count($matchwithProperties) );
    //         // var_dump("MatchWith Properties : ");
    //         //var_dump(json_encode($matchwithProperties));
    //         foreach ($matchwithProperties as $key => $value) { 
    //             // echo "Key  :  ".$key."      ";
    //             // echo "value  :  ".$value."      ";

    //             $sourceAMatchwithPropertyName = $key;
    //             $sourceBMatchwithPropertyName = $value;

    //             if (!$sourceAComponent->propertyExists($sourceAMatchwithPropertyName) ||
    //                 !$sourceBComponent->propertyExists($sourceBMatchwithPropertyName)) {
    //                     return false;
    //                }
    
    //                $sourceAMatchwithProperty = $sourceAComponent->getProperty($sourceAMatchwithPropertyName);
    //                $sourceBMatchwithProperty = $sourceBComponent->getProperty($sourceBMatchwithPropertyName);

    //                if ($sourceAMatchwithProperty->Value != $sourceBMatchwithProperty->Value) {
    //                    return false;
    //                 }
    //         }

    //         return true; 
    //   }

    //     function checkProperties ($checkCaseMappingProperty,
    //                               $sourceAComponent,
    //                               $sourceBComponent) {
    //             // // get check case mapping property object
    //             // var checkCaseMappingProperty = checkCaseComponentClass.MappingProperties[k];

    //             $property1Name = NULL;
    //             $property2Name= NULL;
    //             $property1Value= NULL;
    //             $property2Value= NULL;
    //             $severity= NULL;
    //             $performCheck;
    //             $description ="";
    //             if ($sourceAComponent->propertyExists($checkCaseMappingProperty['SourceAName'])) {
    //                 if ($sourceBComponent->propertyExists($checkCaseMappingProperty['SourceBName'])) {
    //                     $property1 = $sourceAComponent->getProperty($checkCaseMappingProperty['SourceAName']);
    //                     $property2 = $sourceBComponent->getProperty($checkCaseMappingProperty['SourceBName']);

    //                     $property1Name = $property1->Name;
    //                     $property2Name = $property2->Name;
    //                     $property1Value = $property1->Value;
    //                     $property2Value = $property2->Value;

    //                     // If both properties (Source A and Source B properties) do not have values, 
    //                     // show  'No Value' severity
    //                     if (($property1Value == NULL || $property1Value == "") &&
    //                         ($property2Value == NULL || $property2Value == "")) {
    //                         $severity = "No Value";
    //                         $performCheck = false;                    
    //                     }
    //                     else if (($property1Value == NULL || $property1Value == "") ||
    //                         ($property2Value == NULL || $property2Value == "")) {
    //                         // If anyone of the properties has no value, then show 'Error'.
    //                         $severity = "Error";
    //                         $performCheck = false;                    
    //                     }
    //                     else {
    //                         $severity = $checkCaseMappingProperty['Severity'];
    //                         $performCheck = true;                  
    //                     }
    //                 }
    //                 else {
    //                     $property1 = $sourceAComponent->getProperty($checkCaseMappingProperty['SourceAName']);

    //                     $property1Name = $property1->Name;
    //                     $property2Name = "";
    //                     $property1Value = $property1->Value;;
    //                     $property2Value = "";
    //                     $severity = "Error";
    //                     $performCheck = false;               
    //                 }
    //             }
    //             else if ($sourceBComponent->propertyExists($checkCaseMappingProperty['SourceBName'])) {
                    
    //                 $property2 = $sourceBComponent->getProperty($checkCaseMappingProperty['SourceBName']);

    //                 $property1Name = "";
    //                 $property2Name = $property2->Name;
    //                 $property1Value = "";
    //                 $property2Value = $property2->Value;
    //                 $severity = "Error";
    //                 $performCheck = false;
    //             }
                
    //             if ($checkCaseMappingProperty['Comment']) {
    //                 $description =  $description . $checkCaseMappingProperty['Comment'];
    //             }

    //             if ($property1Name == NULL && $property2Name == NULL) {
    //                 return NULL;
    //             }
    //             $checkProperty = new CheckProperty($property1Name,
    //                 $property1Value,
    //                 $property2Name,
    //                 $property2Value,
    //                 $severity,
    //                 $performCheck,
    //                 $description);

    //             return $checkProperty;
    //         }

    //             function getNoMatchComponent ($sourceComponent, $checkCaseComponentClass, $sourceAComponent) 
    //             {
    //             $checkComponent;
    //             if ($sourceAComponent) {
    //                 $checkComponent = new CheckComponent($sourceComponent->Name,
    //                                                     "",
    //                                                     $sourceComponent->SubComponentClass,
    //                                                     $sourceComponent->NodeId,
    //                                                     NULL);

                
    //                 for ($k = 0; $k < count($sourceComponent->properties); $k++) {
    //                     $property = $sourceComponent->properties[$k];

    //                     $checkProperty = new CheckProperty($property->Name,
    //                         $property->Value,
    //                         NULL,
    //                         NULL,
    //                         "No Match",
    //                         NULL,
    //                         NULL);

    //                     $checkProperty->PerformCheck = false;
    //                     $checkComponent->AddCheckProperty($checkProperty);
    //                 }
    //                 //}
    //             }
    //             else {
    //                 $checkComponent = new CheckComponent("",
    //                     $sourceComponent->Name,
    //                     $sourceComponent->SubComponentClass,
    //                     NULL,
    //                     $sourceComponent->NodeId);

                
    //                 for ($k = 0; $k < count($sourceComponent->properties); $k++) {
    //                     $property = $sourceComponent->properties[$k];

    //                     $checkProperty = new CheckProperty(NULL,
    //                         NULL,
    //                         $property->Name,
    //                         $property->Value,
    //                         "No Match",
    //                         NULL,
    //                         NULL);


    //                     $checkProperty->PerformCheck = false;
    //                     $checkComponent->AddCheckProperty($checkProperty);
    //                 }           

    //             }

    //             $checkComponent->Status = "No Match";
    //             return $checkComponent;
    //         }
           
    //         function restoreProperties ($ComponentsList) 
    //         {
    //             $Components = array();
    //             foreach($ComponentsList as $key => $value) {

    //                 $component = new GenericComponent( $value->Name, 
    //                                                    $value->MainComponentClass, 
    //                                                    $value->SubComponentClass, 
    //                                                    $value->NodeId);

    //                 foreach($value->properties as $propertyKey => $propertyValue) {
    //                     $property = new GenericProperty($propertyValue->Name, $propertyValue->Format, $propertyValue->Value);
    //                     $component->addProperty( $property );
    //                 }    
                    
    //                 array_push ( $Components, $component ) ;
    //               }

    //               return $Components;
    //         }

    //             // classes
    //             class GenericComponent
    //         {
    //             var $Name; 
    //             var $MainComponentClass; 
    //             var $SubComponentClass;
    //             var $NodeId; 

    //             var $properties = array(); 
    //             // constructor
    //             public function __construct($name, $mainComponentClass, $subComponentClass, $nodeId) {
    //                 $this->Name = $name;
    //                 $this->MainComponentClass = $mainComponentClass;
    //                 $this->SubComponentClass = $subComponentClass;
    //                 $this->NodeId = $nodeId;
    //             }

    //             public function addProperty($genericProperty) {

    //                 // returns number of elements in an array
    //                 return array_push ( $this->properties, $genericProperty ) ;
    //             }
                
    //             public function propertyExists($propertyName) {

    //                 for ($i = 0; $i < count($this->properties); $i++) {           
    //                     if ( strtolower($this->properties[$i]->Name) ===  strtolower($propertyName)) {
    //                         return true;
    //                     }
    //                 }

    //                 return false;
    //             }

    //             public function getProperty($propertyName) {

    //                 for ($i = 0; $i < count($this->properties); $i++) {           
    //                     if ( strtolower($this->properties[$i]->Name) ===  strtolower($propertyName)) {
    //                         return $this->properties[$i];
    //                     }
    //                 }

    //                 return NULL;
    //             }   
    //         }

            // class GenericProperty
            // {            
            //     var $Name ;  
            //     var $Format ;  
            //     var $Value ;  

            //     // constructor
            //     public function __construct($name, $format, $value) {
            //         $this->Name = str_replace("world","", $name);                  
            //         $this->Format = $format;
            //         $this->Value = $value;                    
            //     }
            // }
?>

