<?php
        include 'CheckComponents.php';
        include 'CheckResultsWriter.php';
        require_once 'Utility.php';

        if(!isset($_POST['CheckCaseType']) ||
            !isset($_POST['SourceASelectedComponents'] )||
            !isset($_POST['SourceBSelectedComponents'] ) ||
            !isset($_POST['SourceCSelectedComponents'] )||
            !isset($_POST['SourceDSelectedComponents'] ) ||
            !isset($_POST['dataSourceOrderInCheckCase'] ) ||
            !isset($_POST['ProjectName']) ||
            !isset($_POST['CheckName']) )
        {
            echo 'fail';
            return;
        }
        
        $dataSourceOrderInCheckCase = json_decode($_POST['dataSourceOrderInCheckCase'] , true);
        
        $SourceASelectedComponents = json_decode($_POST['SourceASelectedComponents'],true);
        $SourceBSelectedComponents = json_decode($_POST['SourceBSelectedComponents'],true); 
        $SourceCSelectedComponents = json_decode($_POST['SourceCSelectedComponents'],true);
        $SourceDSelectedComponents = json_decode($_POST['SourceDSelectedComponents'],true); 

        $CheckCaseType = json_decode($_POST['CheckCaseType'],true);

        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];

        // get source components and thier properties from database
        $SourceAComponents = array();
        $SourceBComponents = array();   
        $SourceCComponents = array();
        $SourceDComponents = array();

        $SourceAProperties = array();
        $SourceBProperties = array();
        $SourceCProperties = array();
        $SourceDProperties = array();

        $CheckComponentsGroups = array();

        $SourceANotCheckedComponents = array();
        $SourceBNotCheckedComponents = array();
        $SourceCNotCheckedComponents = array();
        $SourceDNotCheckedComponents = array();

        // read source wise components and thier properties
        getSourceComponents();  
       
        // perform comparison check on components
        checkDataSources(count($dataSourceOrderInCheckCase));        

        // write check result to database
        writeComparisonResultsToDB();   

        //echo json_encode($CheckComponentsGroups);
        echo "success";
        function checkDataSources($totalSources) 
        {
            if($totalSources < 2 || 
               $totalSources > 4)
            {
                echo "fail";
                return;
            }

            // all source components
            global $SourceAComponents;
            global $SourceBComponents;
            global $SourceCComponents;
            global $SourceDComponents;
            
            // all source properties
            global $SourceAProperties;
            global $SourceBProperties;               
            global $SourceCProperties;
            global $SourceDProperties;

            // all source selected components
            global $SourceASelectedComponents;
            global $SourceBSelectedComponents;
            global $SourceCSelectedComponents;
            global $SourceDSelectedComponents;

            global $SourceANotCheckedComponents;
            global $SourceBNotCheckedComponents;
            global $SourceCNotCheckedComponents;
            global $SourceDNotCheckedComponents;

            global $dataSourceOrderInCheckCase;

            // perform comparison in context of source a components
            foreach ($SourceAComponents as $mainClass => $currentComponents)
            {
                // check if mainclass is mapped
                $groupMapped = isGroupMapped($mainClass,  $dataSourceOrderInCheckCase['a']);

                for($i = 0; $i < count($currentComponents); $i++)
                {
                    $sourceAComponent = $currentComponents[$i];

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

                    // check if mainclass is mapped
                    // if not mapped, then component will go to 'Undefined' group
                    if(!$groupMapped)
                    {
                        addUndefinedComponent($sourceAComponent, 1);
                        continue;
                    }

                    // check if subclass is mapped or not
                    // if not mapped, then component will go to 'Undefined' group
                    // get all component group mappings for this mainclass (there may be a 
                    // mainclass mapped multiple times in xml config file )
                    $isClassMapped = false;
                    $allMappedGroups = getAllGroupMapped($mainClass, $dataSourceOrderInCheckCase['a']);
                    for($mappedGroupIndex = 0; $mappedGroupIndex < count($allMappedGroups); $mappedGroupIndex++)
                    {
                        $mappedGroup = $allMappedGroups[$mappedGroupIndex];   
                        if(isClassMapped($sourceAComponent['subclass'],                                
                        $mappedGroup,
                        $dataSourceOrderInCheckCase['a']))
                        {
                            $isClassMapped = true;
                            break;
                        }
                    }
                    if(!$isClassMapped)
                    {
                        addUndefinedComponent($sourceAComponent, 1);
                        continue;
                    }

                    // check for group match in other sources
                    $sourceAClassNameAttribute = getSourceClassNameProperty("a");                     
                    $sourceBGroupNameAttribute = getSourceGroupNameProperty("b");   
                    $sourceCGroupNameAttribute = NULL;
                    $sourceDGroupNameAttribute = NULL;
                    if($totalSources > 2)
                    {
                        $sourceCGroupNameAttribute = getSourceGroupNameProperty("c");
                    }
                    if($totalSources > 3)
                    {
                        $sourceDGroupNameAttribute = getSourceGroupNameProperty("d");
                    }
                   
                    $groupWiseMatechedComponents = array();
                    $isUndefinedComponent = true;
                    for($mappedGroupIndex = 0; $mappedGroupIndex < count($allMappedGroups); $mappedGroupIndex++)
                    {
                        $mappedGroup = $allMappedGroups[$mappedGroupIndex];       
                        if(!isClassMapped($sourceAComponent['subclass'],                                
                                         $mappedGroup,
                                         $dataSourceOrderInCheckCase['a']))
                        {
                           continue;
                        }  

                        $mappedClasses = $mappedGroup['ComponentClasses'];

                        $classWiseMatechedComponents = array();                     

                        for($classIndex = 0; $classIndex < count($mappedClasses); $classIndex++)
                        {
                            $mappedClass = $mappedClasses[$classIndex];       
                            if (strtolower($mappedClass[$sourceAClassNameAttribute]) != strtolower($sourceAComponent['subclass']) ||
                                count($mappedClass['MatchwithProperties']) === 0) { 
                                continue;
                            }
                            $isUndefinedComponent = false;

                            // maintain matched components array
                            $matchedComponentArray = array("a" => $sourceAComponent);
                            $matchedComponentArray["classMapping"] = $mappedClass;

                            /* 
                                -> Source B <-
                                => find the matching component in source B
                            */                    
                            $sourceBMatchedComponent = getMatchingComponentInOtherSource($sourceAComponent, 
                                                                                        $SourceBComponents,
                                                                                        $SourceAProperties,
                                                                                        $SourceBProperties,
                                                                                        $sourceBGroupNameAttribute,
                                                                                        $mappedGroup,
                                                                                        $mappedClass,
                                                                                        $dataSourceOrderInCheckCase['a'],
                                                                                        $dataSourceOrderInCheckCase['b']); 
                            if($sourceBMatchedComponent)
                            {
                                $matchedComponentArray["b"] = $sourceBMatchedComponent;
                            }


                            if($totalSources > 2)
                            {
                                /* 
                                    -> Source C <-
                                    => find the matching component in source C
                                */                                                
                                $sourceCMatchedComponent =  getMatchingComponentInOtherSource($sourceAComponent, 
                                                                                                $SourceCComponents,
                                                                                                $SourceAProperties,
                                                                                                $SourceCProperties,
                                                                                                $sourceCGroupNameAttribute,
                                                                                                $mappedGroup,
                                                                                                $mappedClass,
                                                                                                $dataSourceOrderInCheckCase['a'],
                                                                                                $dataSourceOrderInCheckCase['c']); 

                                if($sourceCMatchedComponent)
                                {
                                    $matchedComponentArray["c"] = $sourceCMatchedComponent;
                                }
                            }

                            // for source d check
                            if($totalSources > 3)
                            {
                                /* 
                                    -> Source D <-
                                    => find the matching component in source D
                                */                                                
                                $sourceDMatchedComponent =  getMatchingComponentInOtherSource($sourceAComponent, 
                                                                                                $SourceDComponents,
                                                                                                $SourceAProperties,
                                                                                                $SourceDProperties,
                                                                                                $sourceDGroupNameAttribute,
                                                                                                $mappedGroup,
                                                                                                $mappedClass,
                                                                                                $dataSourceOrderInCheckCase['a'],
                                                                                                $dataSourceOrderInCheckCase['d']); 

                                if($sourceDMatchedComponent)
                                {
                                    $matchedComponentArray["d"] = $sourceDMatchedComponent;
                                }
                            }

                            array_push( $classWiseMatechedComponents, $matchedComponentArray);    
                        }

                        $groupMatchedComponents = array();
                        $groupMatchedComponents ['matchObject'] = $classWiseMatechedComponents;
                        $groupMatchedComponents ['groupMapping'] = $mappedGroup;   
                        array_push( $groupWiseMatechedComponents, $groupMatchedComponents);                        
                    }
  
                    if($isUndefinedComponent)                    
                    {
                        addUndefinedComponent($sourceAComponent, 1);
                    }
                    else
                    {
                        for($matchedComponentIndex = 0; $matchedComponentIndex < count($groupWiseMatechedComponents); $matchedComponentIndex++)
                        {
                            $groupWiseMatechedComponent = $groupWiseMatechedComponents[$matchedComponentIndex];
                            $mappingGroup = $groupWiseMatechedComponent['groupMapping'];
                            $matchObject = $groupWiseMatechedComponent['matchObject'];
                            if( count($matchObject) === 0)
                            {
                                continue;
                            }

                            // check if it is 'no match' for all class mapping
                            // if yes, then show only one no match component
                            $isAllNoMatch = true;
                            $classMappingInfo = NULL;
                            for($matchedObjectIndex = 0; $matchedObjectIndex < count($matchObject); $matchedObjectIndex++)
                            {
                                $classwiseMatchObjects = $matchObject[$matchedObjectIndex];   
                                
                                $checkCaseComponentClass = $classwiseMatchObjects["classMapping"];
                                if($classMappingInfo != NULL)
                                {
                                    $classMappingInfo = $classMappingInfo. ", ". getClassMappingInfo($checkCaseComponentClass, $totalSources);
                                }
                                else
                                {
                                    $classMappingInfo = getClassMappingInfo($checkCaseComponentClass, $totalSources);
                                }

                                $srcBComponent = NULL;
                                $srcCComponent = NULL;
                                if(array_key_exists('b', $classwiseMatchObjects) || 
                                   ( $totalSources > 2 && array_key_exists('c', $classwiseMatchObjects)) ||
                                   ( $totalSources > 3 && array_key_exists('d', $classwiseMatchObjects)) )
                                {
                                    $isAllNoMatch  = false;
                                    break;
                                }                               
                            }
                            if($isAllNoMatch)
                            {
                                // no match component                                
                                $noMatchComponent = getNoMatchComponent ($sourceAComponent,
                                                                        $SourceAProperties,
                                                                        1,
                                                                        $classMappingInfo);
                                
                                $groupName = $mappingGroup["SourceAName"]."-".$mappingGroup["SourceBName"];
                                if($totalSources > 2)
                                {
                                    $groupName = $groupName ."-". $mappingGroup["SourceCName"];
                                }
                                if($totalSources > 3)
                                {
                                    $groupName = $groupName ."-". $mappingGroup["SourceDName"];
                                }

                                $componentGroup = getCheckComponentGroup($groupName);                   
                                $componentGroup->AddCheckComponent($noMatchComponent); 

                            }
                            else
                            {
                                for($matchedObjectIndex = 0; $matchedObjectIndex < count($matchObject); $matchedObjectIndex++)
                                {
                                    $classwiseMatchObjects = $matchObject[$matchedObjectIndex];
                                    
                                    $srcBComponent = NULL;
                                    $srcCComponent = NULL;
                                    $srcDComponent = NULL;
                                    if(array_key_exists('b', $classwiseMatchObjects))
                                    {
                                        $srcBComponent = $classwiseMatchObjects['b'];
                                    }
                                    
                                    if($totalSources > 2 && 
                                       array_key_exists('c', $classwiseMatchObjects))
                                    {
                                        $srcCComponent = $classwiseMatchObjects['c'];
                                    }

                                    if($totalSources > 3 && 
                                       array_key_exists('d', $classwiseMatchObjects))
                                    {
                                        $srcDComponent = $classwiseMatchObjects['d'];
                                    }


                                    // neglect no match component here
                                    if($totalSources > 3 && 
                                        $srcBComponent === NULL && 
                                        $srcCComponent === NULL && 
                                        $srcDComponent === NULL)
                                    {                                        
                                        continue;
                                    }     
                                    else if($totalSources > 2 && 
                                        $srcBComponent === NULL && 
                                        $srcCComponent === NULL)
                                    {                                        
                                        continue;
                                    } 
                                    else if($totalSources === 2 && 
                                        $srcBComponent === NULL)
                                    {                                        
                                        continue;
                                    }    

                                    $srcAComponent = $classwiseMatchObjects['a'];
                                    $checkCaseComponentClass = $classwiseMatchObjects["classMapping"];
                                    if($totalSources === 2)
                                    {
                                        compareComponentsFor2Sources($srcAComponent,
                                            $srcBComponent,                                            
                                            $SourceAProperties,
                                            $SourceBProperties,                                           
                                            $mappingGroup,
                                            $checkCaseComponentClass,
                                            $dataSourceOrderInCheckCase);
                                    }
                                    else if($totalSources === 3)
                                    {
                                            compareComponentsFor3Sources($srcAComponent,
                                                $srcBComponent,
                                                $srcCComponent,
                                                $SourceAProperties,
                                                $SourceBProperties,
                                                $SourceCProperties,
                                                $mappingGroup,
                                                $checkCaseComponentClass,
                                                $dataSourceOrderInCheckCase);
                                    }
                                    else if($totalSources === 4)
                                    {
                                        compareComponentsFor4Sources($srcAComponent,
                                                $srcBComponent,
                                                $srcCComponent,
                                                $srcDComponent,
                                                $SourceAProperties,
                                                $SourceBProperties,
                                                $SourceCProperties,
                                                $SourceDProperties,
                                                $mappingGroup,
                                                $checkCaseComponentClass,
                                                $dataSourceOrderInCheckCase);
                                    }
                                }
                            }                     
                        }
                    }
                }
            }


            // perform comparison in context of source b components
            foreach ($SourceBComponents as $mainClass => $currentComponents)
            {
                // check if mainclass is mapped
                $groupMapped = isGroupMapped($mainClass,  $dataSourceOrderInCheckCase['b']);

                for($i = 0; $i < count($currentComponents); $i++)
                {
                    $sourceBComponent = $currentComponents[$i];

                    // check is component is selected or not for performing check
                    if(!isComponentSelected($sourceBComponent, $SourceBSelectedComponents)) 
                    {                            
                        //source A component not checked    
                        $compKey = $sourceBComponent['id'];                            
                        if(!array_key_exists($compKey, $SourceBNotCheckedComponents))
                        {
                            $SourceBNotCheckedComponents[$compKey] = $sourceBComponent;                                                   
                        }

                        continue;
                    }

                    // check if mainclass is mapped
                    // if not mapped, then component will go to 'Undefined' group
                    if(!$groupMapped)
                    {
                        addUndefinedComponent($sourceBComponent, 2);
                        continue;
                    }

                    // check if subclass is mapped or not
                    // if not mapped, then component will go to 'Undefined' group
                    // get all component group mappings for this mainclass (there may be a 
                    // mainclass mapped multiple times in xml config file )
                    $isClassMapped = false;
                    $allMappedGroups = getAllGroupMapped($mainClass, $dataSourceOrderInCheckCase['b']);
                    for($mappedGroupIndex = 0; $mappedGroupIndex < count($allMappedGroups); $mappedGroupIndex++)
                    {
                        $mappedGroup = $allMappedGroups[$mappedGroupIndex];   
                        if(isClassMapped($sourceBComponent['subclass'],                                
                        $mappedGroup,
                        $dataSourceOrderInCheckCase['b']))
                        {
                            $isClassMapped = true;
                            break;
                        }
                    }
                    if(!$isClassMapped)
                    {
                        addUndefinedComponent($sourceBComponent, 2);
                        continue;
                    }

                    // check for group match in other sources
                    $sourceBClassNameAttribute = getSourceClassNameProperty("b"); 
                    $sourceAGroupNameAttribute = getSourceGroupNameProperty("a");
                    $sourceCGroupNameAttribute = NULL;
                    $sourceDGroupNameAttribute = NULL;
                    if($totalSources > 2)
                    {
                        $sourceCGroupNameAttribute = getSourceGroupNameProperty("c");
                    }
                    if($totalSources > 3)
                    {
                        $sourceDGroupNameAttribute = getSourceGroupNameProperty("d");
                    }

                    $groupWiseMatechedComponents = array();
                    $isUndefinedComponent = true;
                    for($mappedGroupIndex = 0; $mappedGroupIndex < count($allMappedGroups); $mappedGroupIndex++)
                    {
                        $mappedGroup = $allMappedGroups[$mappedGroupIndex];       
                        if(!isClassMapped($sourceBComponent['subclass'],                                
                                         $mappedGroup,
                                         $dataSourceOrderInCheckCase['b']))
                        {
                           continue;
                        }  

                        $mappedClasses = $mappedGroup['ComponentClasses'];
                        

                        $classWiseMatechedComponents = array();                     

                        for($classIndex = 0; $classIndex < count($mappedClasses); $classIndex++)
                        {
                            $mappedClass = $mappedClasses[$classIndex];       
                            if (strtolower($mappedClass[$sourceBClassNameAttribute]) != strtolower($sourceBComponent['subclass']) ||
                                count($mappedClass['MatchwithProperties']) === 0) { 
                                continue;
                            }
                            $isUndefinedComponent = false;

                            $matchedComponentArray = array("b" => $sourceBComponent);
                            $matchedComponentArray["classMapping"] = $mappedClass;

                            /* 
                                -> Source A <-
                                => find the matching component in source A
                            */                                               
                            $sourceAMatchedComponent = getMatchingComponentInOtherSource($sourceBComponent, 
                                                                                        $SourceAComponents,
                                                                                        $SourceBProperties,
                                                                                        $SourceAProperties,                           
                                                                                        $sourceAGroupNameAttribute,
                                                                                        $mappedGroup,
                                                                                        $mappedClass,
                                                                                        $dataSourceOrderInCheckCase['b'],
                                                                                        $dataSourceOrderInCheckCase['a']); 
                            if($sourceAMatchedComponent)
                            {
                                $matchedComponentArray["a"] = $sourceAMatchedComponent;
                            }
                            
                            if($totalSources > 2)
                            {
                                /* 
                                    -> Source C <-
                                    => find the matching component in source C
                                */ 
                                $sourceCMatchedComponent =  getMatchingComponentInOtherSource($sourceBComponent, 
                                                                                                $SourceCComponents,
                                                                                                $SourceBProperties,
                                                                                                $SourceCProperties,
                                                                                                $sourceCGroupNameAttribute,
                                                                                                $mappedGroup,
                                                                                                $mappedClass,
                                                                                                $dataSourceOrderInCheckCase['b'],
                                                                                                $dataSourceOrderInCheckCase['c']);  
                                if($sourceCMatchedComponent)
                                {
                                    $matchedComponentArray["c"] = $sourceCMatchedComponent;
                                }
                            }

                            if($totalSources > 3)
                            {
                                /* 
                                    -> Source D <-
                                    => find the matching component in source D
                                */ 
                                $sourceDMatchedComponent =  getMatchingComponentInOtherSource($sourceBComponent, 
                                                                                                $SourceDComponents,
                                                                                                $SourceBProperties,
                                                                                                $SourceDProperties,
                                                                                                $sourceDGroupNameAttribute,
                                                                                                $mappedGroup,
                                                                                                $mappedClass,
                                                                                                $dataSourceOrderInCheckCase['b'],
                                                                                                $dataSourceOrderInCheckCase['d']);  
                                if($sourceDMatchedComponent)
                                {
                                    $matchedComponentArray["d"] = $sourceDMatchedComponent;
                                }
                            }

                            // check if source a component is selected or not
                            // if it is selected, that means this curent source B 
                            // component comparison is already performed, so discard this                            
                            if($sourceAMatchedComponent !== NULL &&
                               isComponentSelected($sourceAMatchedComponent, $SourceASelectedComponents)) 
                            { 
                                continue; 
                            }                       
                    
                            array_push( $classWiseMatechedComponents, $matchedComponentArray);    
                        }

                        $groupMatchedComponents = array();
                        $groupMatchedComponents ['matchObject'] = $classWiseMatechedComponents;
                        $groupMatchedComponents ['groupMapping'] = $mappedGroup;   
                        array_push( $groupWiseMatechedComponents, $groupMatchedComponents);                        
                    }
  
                    if($isUndefinedComponent)                    
                    {
                        addUndefinedComponent($sourceBComponent, 2);
                    }
                    else
                    {
                        for($matchedComponentIndex = 0; $matchedComponentIndex < count($groupWiseMatechedComponents); $matchedComponentIndex++)
                        {
                            $groupWiseMatechedComponent = $groupWiseMatechedComponents[$matchedComponentIndex];
                            $mappingGroup = $groupWiseMatechedComponent['groupMapping'];
                            $matchObject = $groupWiseMatechedComponent['matchObject'];
                            if( count($matchObject) === 0)
                            {
                                continue;
                            }

                            // check if it is 'no match' for all class mapping
                            // if yes, then show only one no match component
                            $isAllNoMatch = true;
                            $classMappingInfo = NULL;
                            for($matchedObjectIndex = 0; $matchedObjectIndex < count($matchObject); $matchedObjectIndex++)
                            {
                                $classwiseMatchObjects = $matchObject[$matchedObjectIndex];
                                $checkCaseComponentClass = $classwiseMatchObjects["classMapping"];
                                if($classMappingInfo != NULL)
                                {
                                    $classMappingInfo = $classMappingInfo. ", ". getClassMappingInfo($checkCaseComponentClass, $totalSources);
                                }
                                else
                                {
                                    $classMappingInfo = getClassMappingInfo($checkCaseComponentClass, $totalSources);
                                }

                                if(array_key_exists('a', $classwiseMatchObjects) || 
                                ($totalSources > 2 && array_key_exists('c', $classwiseMatchObjects)) ||
                                ($totalSources > 3 && array_key_exists('d', $classwiseMatchObjects)))
                                {
                                    $isAllNoMatch  = false;
                                    break;
                                }                               
                            }
                            if($isAllNoMatch)
                            {
                                // no match component                                
                                $noMatchComponent = getNoMatchComponent ($sourceBComponent,
                                                                        $SourceBProperties,
                                                                        2,
                                                                        $classMappingInfo);
                                
                                $groupName = $mappingGroup["SourceAName"]."-".$mappingGroup["SourceBName"];
                                if($totalSources > 2)
                                {
                                    $groupName = $groupName ."-". $mappingGroup["SourceCName"];
                                }
                                if($totalSources > 3)
                                {
                                    $groupName = $groupName ."-". $mappingGroup["SourceDName"];
                                }

                                $componentGroup = getCheckComponentGroup($groupName);   
                                $componentGroup->AddCheckComponent($noMatchComponent); 

                            }
                            else
                            {
                                for($matchedObjectIndex = 0; $matchedObjectIndex < count($matchObject); $matchedObjectIndex++)
                                {
                                    $classwiseMatchObjects = $matchObject[$matchedObjectIndex];
                                    
                                    $srcAComponent = NULL;
                                    $srcCComponent = NULL;
                                    $srcDComponent = NULL;
                                    if(array_key_exists('a', $classwiseMatchObjects))
                                    {
                                        $srcAComponent = $classwiseMatchObjects['a'];
                                    }
                                    if($totalSources > 2 && 
                                       array_key_exists('c', $classwiseMatchObjects))
                                    {
                                        $srcCComponent = $classwiseMatchObjects['c'];
                                    }
                                    if($totalSources > 3 && 
                                       array_key_exists('d', $classwiseMatchObjects))
                                    {
                                        $srcDComponent = $classwiseMatchObjects['d'];
                                    }

                                     // neglect no match component here
                                     if($totalSources > 3 && 
                                        $srcAComponent === NULL && 
                                        $srcCComponent === NULL && 
                                        $srcDComponent === NULL)
                                    {                                        
                                        continue;
                                    }     
                                    else if($totalSources > 2 && 
                                        $srcAComponent === NULL && 
                                        $srcCComponent === NULL)
                                    {                                        
                                        continue;
                                    } 
                                    
                                    $srcBComponent = $classwiseMatchObjects['b'];
                                    $checkCaseComponentClass = $classwiseMatchObjects["classMapping"];
                                    
                                    if($totalSources === 2)
                                    {
                                        compareComponentsFor2Sources($srcAComponent,
                                            $srcBComponent,                                            
                                            $SourceAProperties,
                                            $SourceBProperties,                                           
                                            $mappingGroup,
                                            $checkCaseComponentClass,
                                            $dataSourceOrderInCheckCase);
                                    }
                                    else if($totalSources === 3)
                                    {
                                        compareComponentsFor3Sources($srcAComponent,
                                                $srcBComponent,
                                                $srcCComponent,
                                                $SourceAProperties,
                                                $SourceBProperties,
                                                $SourceCProperties,
                                                $mappingGroup,
                                                $checkCaseComponentClass,
                                                $dataSourceOrderInCheckCase);
                                    }
                                    else if($totalSources === 4)
                                    {
                                        compareComponentsFor4Sources($srcAComponent,
                                        $srcBComponent,
                                        $srcCComponent,
                                        $srcDComponent,
                                        $SourceAProperties,
                                        $SourceBProperties,
                                        $SourceCProperties,
                                        $SourceDProperties,
                                        $mappingGroup,
                                        $checkCaseComponentClass,
                                        $dataSourceOrderInCheckCase);
                                    }                                   
                                }
                            }                     
                        }
                    }
                }
            }


            if($totalSources > 2)
            {
                // perform comparison in context of source c components
                foreach ($SourceCComponents as $mainClass => $currentComponents)
                {
                    // check if mainclass is mapped
                    $groupMapped = isGroupMapped($mainClass,  $dataSourceOrderInCheckCase['c']);

                    for($i = 0; $i < count($currentComponents); $i++)
                    {
                        $sourceCComponent = $currentComponents[$i];

                        // check is component is selected or not for performing check
                        if(!isComponentSelected($sourceCComponent, $SourceCSelectedComponents)) 
                        {                            
                            //source A component not checked    
                            $compKey = $sourceCComponent['id'];                            
                            if(!array_key_exists($compKey, $SourceCNotCheckedComponents))
                            {
                                $SourceCNotCheckedComponents[$compKey] = $sourceCComponent;                                                   
                            }

                            continue;
                        }

                        // check if mainclass is mapped
                        // if not mapped, then component will go to 'Undefined' group
                        if(!$groupMapped)
                        {
                            addUndefinedComponent($sourceCComponent, 3);
                            continue;
                        }

                        // check if subclass is mapped or not
                        // if not mapped, then component will go to 'Undefined' group
                        // get all component group mappings for this mainclass (there may be a 
                        // mainclass mapped multiple times in xml config file )
                        $isClassMapped = false;
                        $allMappedGroups = getAllGroupMapped($mainClass, $dataSourceOrderInCheckCase['c']);
                        for($mappedGroupIndex = 0; $mappedGroupIndex < count($allMappedGroups); $mappedGroupIndex++)
                        {
                            $mappedGroup = $allMappedGroups[$mappedGroupIndex];   
                            if(isClassMapped($sourceCComponent['subclass'],                                
                            $mappedGroup,
                            $dataSourceOrderInCheckCase['c']))
                            {
                                $isClassMapped = true;
                                break;
                            }
                        }
                        if(!$isClassMapped)
                        {
                            addUndefinedComponent($sourceCComponent, 3);
                            continue;
                        }

                        // check for group match in other sources
                        $sourceCClassNameAttribute = getSourceClassNameProperty("c"); 
                        $sourceAGroupNameAttribute = getSourceGroupNameProperty("a");
                        $sourceBGroupNameAttribute = getSourceGroupNameProperty("b");
                        $sourceDGroupNameAttribute = getSourceGroupNameProperty("d");

                        $groupWiseMatechedComponents = array();
                        $isUndefinedComponent = true;
                        for($mappedGroupIndex = 0; $mappedGroupIndex < count($allMappedGroups); $mappedGroupIndex++)
                        {
                            $mappedGroup = $allMappedGroups[$mappedGroupIndex];       
                            if(!isClassMapped($sourceCComponent['subclass'],                                
                                            $mappedGroup,
                                            $dataSourceOrderInCheckCase['c']))
                            {
                                continue;
                            }  

                            $mappedClasses = $mappedGroup['ComponentClasses'];

                            $classWiseMatechedComponents = array();                     

                            for($classIndex = 0; $classIndex < count($mappedClasses); $classIndex++)
                            {
                                $mappedClass = $mappedClasses[$classIndex];       
                                if (strtolower($mappedClass[$sourceCClassNameAttribute]) != strtolower($sourceCComponent['subclass']) ||
                                    count($mappedClass['MatchwithProperties']) === 0) { 
                                    continue;
                                }
                                $isUndefinedComponent = false;

                                $matchedComponentArray = array("c" => $sourceCComponent);
                                $matchedComponentArray["classMapping"] = $mappedClass;

                                /* 
                                    -> Source A <-
                                    => find the matching component in source A
                                */ 
                                $sourceAMatchedComponent = getMatchingComponentInOtherSource($sourceCComponent, 
                                                                                        $SourceAComponents,
                                                                                        $SourceCProperties,
                                                                                        $SourceAProperties,
                                                                                        $sourceAGroupNameAttribute,
                                                                                        $mappedGroup,
                                                                                        $mappedClass,
                                                                                        $dataSourceOrderInCheckCase['c'],
                                                                                        $dataSourceOrderInCheckCase['a']); 

                                if($sourceAMatchedComponent)
                                {
                                    $matchedComponentArray["a"] = $sourceAMatchedComponent;
                                }

                                /* 
                                    -> Source B <-
                                    => find the matching component in source B
                                */
                                $sourceBMatchedComponent = getMatchingComponentInOtherSource($sourceCComponent, 
                                                                                            $SourceBComponents,
                                                                                            $SourceCProperties,
                                                                                            $SourceBProperties,
                                                                                            $sourceBGroupNameAttribute,
                                                                                            $mappedGroup,
                                                                                            $mappedClass,
                                                                                            $dataSourceOrderInCheckCase['c'],
                                                                                            $dataSourceOrderInCheckCase['b']); 
                                if($sourceBMatchedComponent)
                                {
                                    $matchedComponentArray["b"] = $sourceBMatchedComponent;
                                }  
                                
                                // for source d check
                                if($totalSources > 3)
                                {
                                    /* 
                                        -> Source D <-
                                        => find the matching component in source D
                                    */                                                
                                    $sourceDMatchedComponent =  getMatchingComponentInOtherSource($sourceCComponent, 
                                                                                                    $SourceDComponents,
                                                                                                    $SourceCProperties,
                                                                                                    $SourceDProperties,
                                                                                                    $sourceDGroupNameAttribute,
                                                                                                    $mappedGroup,
                                                                                                    $mappedClass,
                                                                                                    $dataSourceOrderInCheckCase['c'],
                                                                                                    $dataSourceOrderInCheckCase['d']); 

                                    if($sourceDMatchedComponent)
                                    {
                                        $matchedComponentArray["d"] = $sourceDMatchedComponent;
                                    }
                                }

                                // check if source a or souce b components are selected or not
                                // if they are either selected, that means this curent source c
                                // component comparison is already performed, so discard this                            
                                if(($sourceAMatchedComponent !== NULL &&
                                    isComponentSelected($sourceAMatchedComponent, $SourceASelectedComponents)) || 
                                    ($sourceBMatchedComponent !== NULL &&
                                    isComponentSelected($sourceBMatchedComponent, $SourceBSelectedComponents))) 
                                { 
                                    continue; 
                                }                          

                                array_push( $classWiseMatechedComponents, $matchedComponentArray);    
                            }

                            $groupMatchedComponents = array();
                            $groupMatchedComponents ['matchObject'] = $classWiseMatechedComponents;
                            $groupMatchedComponents ['groupMapping'] = $mappedGroup;   
                            array_push( $groupWiseMatechedComponents, $groupMatchedComponents);                        
                        }
        
                        if($isUndefinedComponent)                    
                        {
                            addUndefinedComponent($sourceCComponent, 3);
                        }
                        else
                        {
                            for($matchedComponentIndex = 0; $matchedComponentIndex < count($groupWiseMatechedComponents); $matchedComponentIndex++)
                            {
                                $groupWiseMatechedComponent = $groupWiseMatechedComponents[$matchedComponentIndex];
                                $mappingGroup = $groupWiseMatechedComponent['groupMapping'];
                                $matchObject = $groupWiseMatechedComponent['matchObject'];
                                if( count($matchObject) === 0)
                                {
                                    continue;
                                }

                                // check if it is 'no match' for all class mapping
                                // if yes, then show only one no match component
                                $isAllNoMatch = true;
                                $classMappingInfo = NULL;
                                for($matchedObjectIndex = 0; $matchedObjectIndex < count($matchObject); $matchedObjectIndex++)
                                {
                                    $classwiseMatchObjects = $matchObject[$matchedObjectIndex];
                                    $checkCaseComponentClass = $classwiseMatchObjects["classMapping"];
                                    if($classMappingInfo != NULL)
                                    {
                                        $classMappingInfo = $classMappingInfo. ", ".getClassMappingInfo($checkCaseComponentClass, $totalSources);
                                    }
                                    else
                                    {
                                        $classMappingInfo = getClassMappingInfo($checkCaseComponentClass, $totalSources);
                                    }

                                    if(array_key_exists('a', $classwiseMatchObjects) || 
                                        array_key_exists('b', $classwiseMatchObjects) || 
                                        array_key_exists('d', $classwiseMatchObjects)) 
                                    {
                                        $isAllNoMatch  = false;
                                        break;
                                    }                        
                                }
                                if($isAllNoMatch)
                                {
                                    // no match component                                
                                    $noMatchComponent = getNoMatchComponent ($sourceCComponent,
                                                                            $SourceCProperties,
                                                                            3,
                                                                            $classMappingInfo);
                                    
                                    $groupName = $mappingGroup["SourceAName"]."-".$mappingGroup["SourceBName"];
                                    if($totalSources > 2)
                                    {
                                        $groupName = $groupName ."-". $mappingGroup["SourceCName"];
                                    }
                                    if($totalSources > 3)
                                    {
                                        $groupName = $groupName ."-". $mappingGroup["SourceDName"];
                                    }
    
                                    $componentGroup = getCheckComponentGroup($groupName);                      
                                    $componentGroup->AddCheckComponent($noMatchComponent); 

                                }
                                else
                                {
                                    for($matchedObjectIndex = 0; $matchedObjectIndex < count($matchObject); $matchedObjectIndex++)
                                    {
                                        $classwiseMatchObjects = $matchObject[$matchedObjectIndex];
                                        
                                        $srcAComponent = NULL;
                                        $srcBComponent = NULL;
                                        $srcDComponent = NULL;
                                        if(array_key_exists('a', $classwiseMatchObjects))
                                        {
                                            $srcAComponent = $classwiseMatchObjects['a'];
                                        }
                                        if(array_key_exists('b', $classwiseMatchObjects))
                                        {
                                            $srcBComponent = $classwiseMatchObjects['b'];
                                        }
                                        if($totalSources > 3 && 
                                           array_key_exists('d', $classwiseMatchObjects))
                                        {
                                            $srcDComponent = $classwiseMatchObjects['d'];
                                        }
                                        if( $srcAComponent === NULL && 
                                            $srcBComponent === NULL &&
                                            $srcCComponent === NULL)
                                        {
                                            // neglect no match component here
                                            continue;
                                        }

                                        $srcCComponent = $classwiseMatchObjects['c'];
                                        $checkCaseComponentClass = $classwiseMatchObjects["classMapping"];

                                        if($totalSources === 3)
                                        {
                                            compareComponentsFor3Sources($srcAComponent,
                                                    $srcBComponent,
                                                    $srcCComponent,
                                                    $SourceAProperties,
                                                    $SourceBProperties,
                                                    $SourceCProperties,
                                                    $mappingGroup,
                                                    $checkCaseComponentClass,
                                                    $dataSourceOrderInCheckCase);
                                        }
                                        else if($totalSources === 4)
                                        {
                                            compareComponentsFor4Sources($srcAComponent,
                                                                        $srcBComponent,
                                                                        $srcCComponent,
                                                                        $srcDComponent,
                                                                        $SourceAProperties,
                                                                        $SourceBProperties,
                                                                        $SourceCProperties,
                                                                        $SourceDProperties,
                                                                        $mappingGroup,
                                                                        $checkCaseComponentClass,
                                                                        $dataSourceOrderInCheckCase);
                                        }
                                    }
                                }                     
                            }
                        }
                    }
                }   
            }     
            
            if($totalSources > 3)
            {
                // perform comparison in context of source c components
                foreach ($SourceDComponents as $mainClass => $currentComponents)
                {
                    // check if mainclass is mapped
                    $groupMapped = isGroupMapped($mainClass,  $dataSourceOrderInCheckCase['d']);

                    for($i = 0; $i < count($currentComponents); $i++)
                    {
                        $sourceDComponent = $currentComponents[$i];

                        // check is component is selected or not for performing check
                        if(!isComponentSelected($sourceDComponent, $SourceDSelectedComponents)) 
                        {                            
                            //source A component not checked    
                            $compKey = $sourceDComponent['id'];                            
                            if(!array_key_exists($compKey, $SourceDNotCheckedComponents))
                            {
                                $SourceDNotCheckedComponents[$compKey] = $sourceDComponent;                                                   
                            }

                            continue;
                        }

                        // check if mainclass is mapped
                        // if not mapped, then component will go to 'Undefined' group
                        if(!$groupMapped)
                        {
                            addUndefinedComponent($sourceDComponent, 4);
                            continue;
                        }

                        // check if subclass is mapped or not
                        // if not mapped, then component will go to 'Undefined' group
                        // get all component group mappings for this mainclass (there may be a 
                        // mainclass mapped multiple times in xml config file )
                        $isClassMapped = false;
                        $allMappedGroups = getAllGroupMapped($mainClass, $dataSourceOrderInCheckCase['d']);
                        for($mappedGroupIndex = 0; $mappedGroupIndex < count($allMappedGroups); $mappedGroupIndex++)
                        {
                            $mappedGroup = $allMappedGroups[$mappedGroupIndex];   
                            if(isClassMapped($sourceDComponent['subclass'],                                
                            $mappedGroup,
                            $dataSourceOrderInCheckCase['d']))
                            {
                                $isClassMapped = true;
                                break;
                            }
                        }
                        if(!$isClassMapped)
                        {
                            addUndefinedComponent($sourceDComponent, 4);
                            continue;
                        }

                        // check for group match in other sources
                        $sourceDClassNameAttribute = getSourceClassNameProperty("d"); 
                        $sourceAGroupNameAttribute = getSourceGroupNameProperty("a");
                        $sourceBGroupNameAttribute = getSourceGroupNameProperty("b");
                        $sourceCGroupNameAttribute = getSourceGroupNameProperty("c");

                        $groupWiseMatechedComponents = array();
                        $isUndefinedComponent = true;
                        for($mappedGroupIndex = 0; $mappedGroupIndex < count($allMappedGroups); $mappedGroupIndex++)
                        {
                            $mappedGroup = $allMappedGroups[$mappedGroupIndex];       
                            if(!isClassMapped($sourceDComponent['subclass'],                                
                                            $mappedGroup,
                                            $dataSourceOrderInCheckCase['d']))
                            {
                                continue;
                            }  

                            $mappedClasses = $mappedGroup['ComponentClasses'];

                            $classWiseMatechedComponents = array();                     

                            for($classIndex = 0; $classIndex < count($mappedClasses); $classIndex++)
                            {
                                $mappedClass = $mappedClasses[$classIndex];       
                                if (strtolower($mappedClass[$sourceDClassNameAttribute]) != strtolower($sourceDComponent['subclass']) ||
                                    count($mappedClass['MatchwithProperties']) === 0) { 
                                    continue;
                                }
                                $isUndefinedComponent = false;

                                $matchedComponentArray = array("d" => $sourceDComponent);
                                $matchedComponentArray["classMapping"] = $mappedClass;

                                /* 
                                    -> Source A <-
                                    => find the matching component in source A
                                */ 
                                $sourceAMatchedComponent = getMatchingComponentInOtherSource($sourceDComponent, 
                                                                                        $SourceAComponents,
                                                                                        $SourceDProperties,
                                                                                        $SourceAProperties,
                                                                                        $sourceAGroupNameAttribute,
                                                                                        $mappedGroup,
                                                                                        $mappedClass,
                                                                                        $dataSourceOrderInCheckCase['d'],
                                                                                        $dataSourceOrderInCheckCase['a']); 

                                if($sourceAMatchedComponent)
                                {
                                    $matchedComponentArray["a"] = $sourceAMatchedComponent;
                                }

                                /* 
                                    -> Source B <-
                                    => find the matching component in source B
                                */
                                $sourceBMatchedComponent = getMatchingComponentInOtherSource($sourceDComponent, 
                                                                                            $SourceBComponents,
                                                                                            $SourceDProperties,
                                                                                            $SourceBProperties,
                                                                                            $sourceBGroupNameAttribute,
                                                                                            $mappedGroup,
                                                                                            $mappedClass,
                                                                                            $dataSourceOrderInCheckCase['d'],
                                                                                            $dataSourceOrderInCheckCase['b']); 
                                if($sourceBMatchedComponent)
                                {
                                    $matchedComponentArray["b"] = $sourceBMatchedComponent;
                                }  
                                
                                // for source c check
                                // if($totalSources > 3)
                                // {
                                /* 
                                    -> Source D <-
                                    => find the matching component in source D
                                */                                                
                                $sourceCMatchedComponent =  getMatchingComponentInOtherSource($sourceDComponent, 
                                                                                                $SourceCComponents,
                                                                                                $SourceDProperties,
                                                                                                $SourceCProperties,
                                                                                                $sourceCGroupNameAttribute,
                                                                                                $mappedGroup,
                                                                                                $mappedClass,
                                                                                                $dataSourceOrderInCheckCase['d'],
                                                                                                $dataSourceOrderInCheckCase['c']); 

                                if($sourceCMatchedComponent)
                                {
                                    $matchedComponentArray["c"] = $sourceCMatchedComponent;
                                }
                                // }

                                // check if source a or souce b components are selected or not
                                // if they are either selected, that means this curent source c
                                // component comparison is already performed, so discard this                            
                                if(($sourceAMatchedComponent !== NULL &&
                                    isComponentSelected($sourceAMatchedComponent, $SourceASelectedComponents)) || 
                                    ($sourceBMatchedComponent !== NULL &&
                                    isComponentSelected($sourceBMatchedComponent, $SourceBSelectedComponents))|| 
                                    ($sourceCMatchedComponent !== NULL &&
                                    isComponentSelected($sourceCMatchedComponent, $SourceCSelectedComponents))) 
                                { 
                                    continue; 
                                }                          

                                array_push( $classWiseMatechedComponents, $matchedComponentArray);    
                            }

                            $groupMatchedComponents = array();
                            $groupMatchedComponents ['matchObject'] = $classWiseMatechedComponents;
                            $groupMatchedComponents ['groupMapping'] = $mappedGroup;   
                            array_push( $groupWiseMatechedComponents, $groupMatchedComponents);                        
                        }
        
                        if($isUndefinedComponent)                    
                        {
                            addUndefinedComponent($sourceDComponent, 4);
                        }
                        else
                        {
                            for($matchedComponentIndex = 0; $matchedComponentIndex < count($groupWiseMatechedComponents); $matchedComponentIndex++)
                            {
                                $groupWiseMatechedComponent = $groupWiseMatechedComponents[$matchedComponentIndex];
                                $mappingGroup = $groupWiseMatechedComponent['groupMapping'];
                                $matchObject = $groupWiseMatechedComponent['matchObject'];
                                if( count($matchObject) === 0)
                                {
                                    continue;
                                }

                                // check if it is 'no match' for all class mapping
                                // if yes, then show only one no match component
                                $isAllNoMatch = true;
                                $classMappingInfo = NULL;
                                for($matchedObjectIndex = 0; $matchedObjectIndex < count($matchObject); $matchedObjectIndex++)
                                {
                                    $classwiseMatchObjects = $matchObject[$matchedObjectIndex];
                                    $checkCaseComponentClass = $classwiseMatchObjects["classMapping"];
                                    if($classMappingInfo != NULL)
                                    {
                                        $classMappingInfo = $classMappingInfo. ", ".getClassMappingInfo($checkCaseComponentClass, $totalSources);
                                    }
                                    else
                                    {
                                        $classMappingInfo = getClassMappingInfo($checkCaseComponentClass, $totalSources);
                                    }

                                    if(array_key_exists('a', $classwiseMatchObjects) || 
                                        array_key_exists('b', $classwiseMatchObjects) || 
                                        array_key_exists('c', $classwiseMatchObjects))
                                    {
                                        $isAllNoMatch  = false;
                                        break;
                                    }                        
                                }
                                if($isAllNoMatch)
                                {
                                    // no match component                                
                                    $noMatchComponent = getNoMatchComponent ($sourceDComponent,
                                                                            $SourceDProperties,
                                                                            4,
                                                                            $classMappingInfo);
                                    
                                    $groupName = $mappingGroup["SourceAName"]."-".$mappingGroup["SourceBName"];
                                    if($totalSources > 2)
                                    {
                                        $groupName = $groupName ."-". $mappingGroup["SourceCName"];
                                    }
                                    if($totalSources > 3)
                                    {
                                        $groupName = $groupName ."-". $mappingGroup["SourceDName"];
                                    }
    
                                    $componentGroup = getCheckComponentGroup($groupName);                      
                                    $componentGroup->AddCheckComponent($noMatchComponent); 

                                }
                                else
                                {
                                    for($matchedObjectIndex = 0; $matchedObjectIndex < count($matchObject); $matchedObjectIndex++)
                                    {
                                        $classwiseMatchObjects = $matchObject[$matchedObjectIndex];
                                        
                                        $srcAComponent = NULL;
                                        $srcBComponent = NULL;
                                        $srcCComponent = NULL;
                                        if(array_key_exists('a', $classwiseMatchObjects))
                                        {
                                            $srcAComponent = $classwiseMatchObjects['a'];
                                        }
                                        if(array_key_exists('b', $classwiseMatchObjects))
                                        {
                                            $srcBComponent = $classwiseMatchObjects['b'];
                                        }
                                        if(array_key_exists('c', $classwiseMatchObjects))
                                        {
                                            $srcCComponent = $classwiseMatchObjects['c'];
                                        }
                                        if( $srcAComponent === NULL && 
                                            $srcBComponent === NULL &&
                                            $srcCComponent === NULL)
                                        {
                                            // neglect no match component here
                                            continue;
                                        }

                                        $srcDComponent = $classwiseMatchObjects['d'];
                                        $checkCaseComponentClass = $classwiseMatchObjects["classMapping"];
                         
                                        compareComponentsFor4Sources($srcAComponent,
                                                                    $srcBComponent,
                                                                    $srcCComponent,
                                                                    $srcDComponent,
                                                                    $SourceAProperties,
                                                                    $SourceBProperties,
                                                                    $SourceCProperties,
                                                                    $SourceDProperties,
                                                                    $mappingGroup,
                                                                    $checkCaseComponentClass,
                                                                    $dataSourceOrderInCheckCase);
                                       
                                    }
                                }                     
                            }
                        }
                    }
                }   
            } 
        }


        function addUndefinedComponent($component, $sourceLoadOrder)
        {
            // undefined component
            $undefinedComponent = getUndefinedComponent ($component, $sourceLoadOrder);
            $undefinedCheckComponentGroup =  getCheckComponentGroup("Undefined");                   
            $undefinedCheckComponentGroup->AddCheckComponent($undefinedComponent);
        }
        

        function getMatchingComponentInOtherSource($firstComponent, 
                                                $secondComponentsCollection,
                                                $firstSourceProperties,
                                                $secondSourceProperties,
                                                $secondComponentGroupNameAttribute,
                                                $mappedGroup,
                                                $mappedClass,
                                                $firstSourceOrderInCheckCase,
                                                $secondSourceOrderInCheckcase)
        {
            
            if(array_key_exists($mappedGroup[$secondComponentGroupNameAttribute], $secondComponentsCollection))
            {
                $secondComponentsList = $secondComponentsCollection[$mappedGroup[$secondComponentGroupNameAttribute]];

                for($secondComponentIndex = 0; $secondComponentIndex < count($secondComponentsList); $secondComponentIndex++)
                {
                    $secondComponent = $secondComponentsList[$secondComponentIndex];

                    if(areClassesMapped($firstComponent['subclass'], 
                                $secondComponent['subclass'], 
                                $mappedClass,
                                $firstSourceOrderInCheckCase,
                                $secondSourceOrderInCheckcase))
                    {                                       
                            if(isComponentMatch ($firstComponent,
                                                 $secondComponent,
                                                 $firstSourceProperties,
                                                 $secondSourceProperties,
                                                 $mappedClass['MatchwithProperties'],
                                                 $firstSourceOrderInCheckCase,
                                                 $secondSourceOrderInCheckcase)) 
                            {
                                return  $secondComponent;                                                                                
                            }
                            else
                            {
                                // // this is no match component
                                // $isNoMatchComponent = true;
                            }                                        
                    }
                    else
                    {
                        // // this is no match component
                        // $isNoMatchComponent = true;
                    }
                }
            }
            else 
            {
                // this is no match component
                // $isNoMatchComponent = true;
            }

            return NULL;
        }

        
        function compareComponentsFor2Sources($srcAComponent,
                                            $srcBComponent,                                            
                                            $sourceAProperties,
                                            $sourceBProperties,                                           
                                            $mappingGroup,
                                            $checkCaseComponentClass,
                                            $dataSourceOrderInCheckCase)
        {
            if( $srcAComponent !== NULL &&
                $srcBComponent !== NULL)
            {
                // a-b
                $checkComponent = compareComponents($srcAComponent,
                                                $srcBComponent,  
                                                NULL, 
                                                NULL, 
                                                $sourceAProperties,
                                                $sourceBProperties,  
                                                NULL, 
                                                NULL,
                                                $checkCaseComponentClass,
                                                $dataSourceOrderInCheckCase['a'],
                                                $dataSourceOrderInCheckCase['b'],
                                                NULL,
                                                NULL,
                                                2);

                $componentGroup =  getCheckComponentGroup($mappingGroup["SourceAName"]."-".$mappingGroup["SourceBName"]);                   
                $componentGroup->AddCheckComponent($checkComponent); 
            }
        }

        function compareComponentsFor4Sources($srcAComponent,
                                            $srcBComponent,
                                            $srcCComponent,
                                            $srcDComponent,
                                            $sourceAProperties,
                                            $sourceBProperties,
                                            $sourceCProperties,
                                            $sourceDProperties,
                                            $mappingGroup,
                                            $checkCaseComponentClass,
                                            $dataSourceOrderInCheckCase)
        {

            $componentGroup =  getCheckComponentGroup($mappingGroup["SourceAName"]."-".$mappingGroup["SourceBName"]."-".$mappingGroup["SourceCName"]."-".$mappingGroup["SourceDName"]);                   
            if( $srcAComponent !== NULL &&
                $srcBComponent !== NULL && 
                $srcCComponent !== NULL &&
                $srcDComponent !== NULL)
            {
                // a-b-c-d
                $checkComponent = compareComponents($srcAComponent,
                            $srcBComponent,  
                            $srcCComponent, 
                            $srcDComponent, 
                            $sourceAProperties,
                            $sourceBProperties,  
                            $sourceCProperties, 
                            $sourceDProperties,
                            $checkCaseComponentClass,
                            $dataSourceOrderInCheckCase['a'],
                            $dataSourceOrderInCheckCase['b'],
                            $dataSourceOrderInCheckCase['c'],
                            $dataSourceOrderInCheckCase['d'],
                            4);
                $componentGroup->AddCheckComponent($checkComponent); 
            }
            else if( $srcAComponent !== NULL &&
                    $srcBComponent !== NULL && 
                    $srcCComponent !== NULL)
            {
                // a-b-c
                $checkComponent = compareComponents($srcAComponent,
                                                    $srcBComponent,  
                                                    $srcCComponent, 
                                                    NULL, 
                                                    $sourceAProperties,
                                                    $sourceBProperties,  
                                                    $sourceCProperties,  
                                                    NULL,
                                                    $checkCaseComponentClass,
                                                    $dataSourceOrderInCheckCase['a'],
                                                    $dataSourceOrderInCheckCase['b'],
                                                    $dataSourceOrderInCheckCase['c'],
                                                    NULL,
                                                    4);
                $checkComponent->Status = "Missing Item(s)";                            
                $componentGroup->AddCheckComponent($checkComponent); 
            }
            else if( $srcAComponent !== NULL &&
                    $srcBComponent !== NULL && 
                    $srcDComponent !== NULL)
            {
                // a-b-d
                $checkComponent = compareComponents($srcAComponent,
                                                    $srcBComponent,
                                                    NULL,   
                                                    $srcDComponent,                                                     
                                                    $sourceAProperties,
                                                    $sourceBProperties,  
                                                    NULL, 
                                                    $sourceDProperties,  
                                                    $checkCaseComponentClass,
                                                    $dataSourceOrderInCheckCase['a'],
                                                    $dataSourceOrderInCheckCase['b'],
                                                    NULL,
                                                    $dataSourceOrderInCheckCase['d'],                                                    
                                                    4);
                $checkComponent->Status = "Missing Item(s)";                            
                $componentGroup->AddCheckComponent($checkComponent); 
            }
            else if( $srcAComponent !== NULL &&
                    $srcCComponent !== NULL && 
                    $srcDComponent !== NULL)
            {
                // a-c-d
                $checkComponent = compareComponents($srcAComponent,
                                                    NULL,
                                                    $srcCComponent,    
                                                    $srcDComponent,                                                     
                                                    $sourceAProperties,                                                   
                                                    NULL, 
                                                    $sourceCProperties,  
                                                    $sourceDProperties,  
                                                    $checkCaseComponentClass,
                                                    $dataSourceOrderInCheckCase['a'],                                                    
                                                    NULL,
                                                    $dataSourceOrderInCheckCase['c'],
                                                    $dataSourceOrderInCheckCase['d'],                                                    
                                                    4);
                $checkComponent->Status = "Missing Item(s)";                            
                $componentGroup->AddCheckComponent($checkComponent); 
            }
            else if( $srcAComponent !== NULL &&
            $srcBComponent !== NULL)
            {
                // a-b
                $checkComponent = compareComponents($srcAComponent,
                                                    $srcBComponent,
                                                    NULL,
                                                    NULL,                                                    
                                                    $sourceAProperties,                                                   
                                                    $sourceBProperties,  
                                                    NULL,
                                                    NULL,  
                                                    $checkCaseComponentClass,
                                                    $dataSourceOrderInCheckCase['a'],                                                    
                                                    $dataSourceOrderInCheckCase['b'],
                                                    NULL,
                                                    NULL,                                                      
                                                    4);
                $checkComponent->Status = "Missing Item(s)";                            
                $componentGroup->AddCheckComponent($checkComponent);
            }
            else if( $srcAComponent !== NULL &&
            $srcCComponent !== NULL)
            {
                // a-c
                $checkComponent = compareComponents($srcAComponent,                                                    
                                                    NULL,
                                                    $srcCComponent,
                                                    NULL,                                                    
                                                    $sourceAProperties, 
                                                    NULL,
                                                    $sourceCProperties,  
                                                    NULL,  
                                                    $checkCaseComponentClass,
                                                    $dataSourceOrderInCheckCase['a'],                                                                                                        
                                                    NULL,
                                                    $dataSourceOrderInCheckCase['c'],
                                                    NULL,                                                      
                                                    4);
                $checkComponent->Status = "Missing Item(s)";                            
                $componentGroup->AddCheckComponent($checkComponent);
            }
            else if( $srcAComponent !== NULL &&
            $srcDComponent !== NULL)
            {
                // a-d
                $checkComponent = compareComponents($srcAComponent,                                                    
                                                    NULL,                                                   
                                                    NULL,
                                                    $srcDComponent,                                                    
                                                    $sourceAProperties,
                                                    NULL,
                                                    NULL,                                                     
                                                    $sourceDProperties,  
                                                    $checkCaseComponentClass,
                                                    $dataSourceOrderInCheckCase['a'],                                                                                                        
                                                    NULL,
                                                    NULL, 
                                                    $dataSourceOrderInCheckCase['d'],                                                                                                        
                                                    4);
                $checkComponent->Status = "Missing Item(s)";                            
                $componentGroup->AddCheckComponent($checkComponent);
            }
            else if( $srcBComponent !== NULL &&
            $srcCComponent !== NULL && 
            $srcDComponent !== NULL)
            {
                // b-c-d
                $checkComponent = compareComponents(NULL,                                                   
                                                    $srcBComponent,                                                    
                                                    $srcCComponent,
                                                    $srcDComponent,                                                    
                                                    NULL,
                                                    $sourceBProperties,                                                   
                                                    $sourceCProperties,                                       
                                                    $sourceDProperties,  
                                                    $checkCaseComponentClass,                                                                                                                                                            
                                                    NULL,
                                                    $dataSourceOrderInCheckCase['b'],
                                                    $dataSourceOrderInCheckCase['c'],
                                                    $dataSourceOrderInCheckCase['d'],                                                                                                        
                                                    4);
                $checkComponent->Status = "Missing Item(s)";                            
                $componentGroup->AddCheckComponent($checkComponent);
            }
            else if( $srcBComponent !== NULL &&
            $srcCComponent !== NULL)
            {
                // b-c
                $checkComponent = compareComponents(NULL,                                                   
                                                    $srcBComponent,                                                    
                                                    $srcCComponent,
                                                    NULL,                                                   
                                                    NULL,
                                                    $sourceBProperties,                                                   
                                                    $sourceCProperties,                                       
                                                    NULL,
                                                    $checkCaseComponentClass,                                                                                                                                                            
                                                    NULL,
                                                    $dataSourceOrderInCheckCase['b'],
                                                    $dataSourceOrderInCheckCase['c'],
                                                    NULL,                                                                                                       
                                                    4);
                $checkComponent->Status = "Missing Item(s)";                            
                $componentGroup->AddCheckComponent($checkComponent);
            }
            else if( $srcBComponent !== NULL &&
                $srcDComponent !== NULL)
            {
                // b-d
                $checkComponent = compareComponents(NULL,                                                   
                                                    $srcBComponent,                                                    
                                                    NULL,
                                                    $srcDComponent,                                                    
                                                    NULL,
                                                    $sourceBProperties,                                                   
                                                    NULL,                                       
                                                    $sourceDProperties,  
                                                    $checkCaseComponentClass,                                                                                                                                                            
                                                    NULL,
                                                    $dataSourceOrderInCheckCase['b'],
                                                    NULL,
                                                    $dataSourceOrderInCheckCase['d'],                                                                                                        
                                                    4);
                $checkComponent->Status = "Missing Item(s)";                            
                $componentGroup->AddCheckComponent($checkComponent);
            }
            else if( $srcCComponent !== NULL &&
                $srcDComponent !== NULL)
            {
                // c-d
                $checkComponent = compareComponents(NULL,                                                   
                                                    NULL,                                                       
                                                    $srcCComponent,
                                                    $srcDComponent,                                                    
                                                    NULL,
                                                    NULL,                                                   
                                                    $sourceCProperties,                                       
                                                    $sourceDProperties,  
                                                    $checkCaseComponentClass,                                                                                                                                                            
                                                    NULL,
                                                    NULL,   
                                                    $dataSourceOrderInCheckCase['c'],
                                                    $dataSourceOrderInCheckCase['d'],                                                                                                        
                                                    4);
                $checkComponent->Status = "Missing Item(s)";                            
                $componentGroup->AddCheckComponent($checkComponent);
            }           
        }


        function compareComponentsFor3Sources($srcAComponent,
                                            $srcBComponent,
                                            $srcCComponent,
                                            $sourceAProperties,
                                            $sourceBProperties,
                                            $sourceCProperties,
                                            $mappingGroup,
                                            $checkCaseComponentClass,
                                            $dataSourceOrderInCheckCase)
        {
            if( $srcAComponent !== NULL &&
                $srcBComponent !== NULL && 
                $srcCComponent !== NULL)
            {
                // a-b-c
                $checkComponent = compareComponents($srcAComponent,
                                                $srcBComponent,  
                                                $srcCComponent, 
                                                NULL, 
                                                $sourceAProperties,
                                                $sourceBProperties,  
                                                $sourceCProperties, 
                                                NULL,
                                                $checkCaseComponentClass,
                                                $dataSourceOrderInCheckCase['a'],
                                                $dataSourceOrderInCheckCase['b'],
                                                $dataSourceOrderInCheckCase['c'],
                                                NULL,
                                                3);

                $componentGroup =  getCheckComponentGroup($mappingGroup["SourceAName"]."-".$mappingGroup["SourceBName"]."-".$mappingGroup["SourceCName"]);                   
                $componentGroup->AddCheckComponent($checkComponent); 
            }
            else if($srcAComponent !== NULL && 
                    $srcBComponent !== NULL )
            {
                // a-b
                $checkComponent = compareComponents($srcAComponent,
                                                    $srcBComponent,  
                                                    NULL, 
                                                    NULL, 
                                                    $sourceAProperties,
                                                    $sourceBProperties,  
                                                    NULL, 
                                                    NULL,
                                                    $checkCaseComponentClass,
                                                    $dataSourceOrderInCheckCase['a'],
                                                    $dataSourceOrderInCheckCase['b'],
                                                    NULL,
                                                    NULL,
                                                    3);
                $checkComponent->Status = "Missing Item(s)";

                $componentGroup =  getCheckComponentGroup($mappingGroup["SourceAName"]."-".$mappingGroup["SourceBName"]."-".$mappingGroup["SourceCName"]);                   
                $componentGroup->AddCheckComponent($checkComponent); 
            }
            else if( $srcAComponent !== NULL && 
                     $srcCComponent !== NULL)
            {
                // a-c
                $checkComponent = compareComponents($srcAComponent,
                                                    NULL,  
                                                    $srcCComponent, 
                                                    NULL, 
                                                    $sourceAProperties,
                                                    NULL,  
                                                    $sourceCProperties, 
                                                    NULL,
                                                    $checkCaseComponentClass,
                                                    $dataSourceOrderInCheckCase['a'],
                                                    NULL,
                                                    $dataSourceOrderInCheckCase['c'],
                                                    NULL,
                                                    3);
                $checkComponent->Status = "Missing Item(s)";

                $componentGroup =  getCheckComponentGroup($mappingGroup["SourceAName"]."-".$mappingGroup["SourceBName"]."-".$mappingGroup["SourceCName"]);                   
                $componentGroup->AddCheckComponent($checkComponent); 
            }
            else if( $srcBComponent !== NULL && 
                     $srcCComponent !== NULL)
            {
                // b-c                             
                $checkComponent = compareComponents(NULL,
                                                    $srcBComponent,  
                                                    $srcCComponent, 
                                                    NULL,                                         
                                                    NULL, 
                                                    $sourceBProperties, 
                                                    $sourceCProperties, 
                                                    NULL,
                                                    $checkCaseComponentClass,                                        
                                                    NULL,
                                                    $dataSourceOrderInCheckCase['b'],
                                                    $dataSourceOrderInCheckCase['c'],
                                                    NULL,
                                                    3);
                $componentGroup =  getCheckComponentGroup($mappingGroup["SourceAName"]."-".$mappingGroup["SourceBName"]."-".$mappingGroup["SourceCName"]);                   
                $componentGroup->AddCheckComponent($checkComponent); 
            }
        }

        function getSourceClassNameProperty($srcId)
        {
            global $dataSourceOrderInCheckCase;

            $sourceClassNameAttribute;
            $sourceOrder = $dataSourceOrderInCheckCase[$srcId];
            if($sourceOrder === 1)
            {
                $sourceClassNameAttribute = 'SourceAName';
            }
            else if($sourceOrder === 2)
            {
                $sourceClassNameAttribute = 'SourceBName';
            }
            else if($sourceOrder === 3)
            {
                $sourceClassNameAttribute = 'SourceCName';
            }
            else if($sourceOrder === 4)
            {
                $sourceClassNameAttribute = 'SourceDName';
            }

            return $sourceClassNameAttribute;
        }

        function getSourceGroupNameProperty($srcId)
        {
            global $dataSourceOrderInCheckCase;

            $groupNameAttribute = NULL;
            $sourceOrder = $dataSourceOrderInCheckCase[$srcId];
            if($sourceOrder === 1)
            {
                $groupNameAttribute = "SourceAName";
            }
            else if($sourceOrder === 2)
            {
                $groupNameAttribute = "SourceBName";
            }
            else if($sourceOrder === 3)
            {
                $groupNameAttribute = "SourceCName";
            }
            else if($sourceOrder === 4)
            {
                $groupNameAttribute = "SourceDName";
            }

            return $groupNameAttribute;
        }

        function getSourcePropertyNameProperty($srcId)
        {
            global $dataSourceOrderInCheckCase;
            $sourceOrder = $dataSourceOrderInCheckCase[$srcId];
            
            $propertyAttributeName = NULL;
            if($sourceOrder === 1)
            {
                $propertyAttributeName = 'SourceAName';
            }
            else if($sourceOrder === 2)
            {
                $propertyAttributeName = 'SourceBName';
            }
            else if($sourceOrder === 3)
            {
                $propertyAttributeName = 'SourceCName';
            }
            else if($sourceOrder === 4)
            {
                $propertyAttributeName = 'SourceDName';
            }

            return $propertyAttributeName;
        }

        function compareComponents($firstSourceComponent,
                                    $secondSourceComponent,  
                                    $thirdSourceComponent, 
                                    $fourthSourceComponent, 
                                    $firstSourceProperties,
                                    $secondSourceProperties,  
                                    $thirdSourceProperties, 
                                    $fourthSourceProperties,
                                    $checkCaseComponentClass,
                                    $firstSourceOrderInCheckcase,
                                    $secondSourceOrderInCheckcase,
                                    $thirdSourceOrderInCheckcase,
                                    $fourthSourceOrderInCheckcase,
                                    $totalSources) 
        {

            $aId = NULL;
            $aName = NULL;
            $aSubclass = NULL;
            $aNodeId = NULL;
            $bId = NULL;
            $bName = NULL;
            $bSubclass = NULL;
            $bNodeId = NULL;
            $cId = NULL;
            $cName = NULL;
            $cSubclass = NULL;
            $cNodeId = NULL;
            $dId = NULL;
            $dName = NULL;
            $dSubclass = NULL;
            $dNodeId = NULL; 
           
            if($firstSourceComponent !== NULL && 
               $firstSourceProperties !== NULL)
            {
                $aId  = $firstSourceComponent['id'];
                $aName = $firstSourceComponent["name"];
                $aSubclass = $firstSourceComponent["subclass"];               

                if(isset($firstSourceComponent['nodeid']))
                {
                    $aNodeId = $firstSourceComponent['nodeid'];                        
                }
            }

            if($secondSourceComponent !== NULL && 
               $secondSourceProperties !== NULL)
            {
                $bId  = $secondSourceComponent['id'];
                $bName = $secondSourceComponent["name"];
                $bSubclass = $secondSourceComponent["subclass"];               

                if(isset($secondSourceComponent['nodeid']))
                {
                    $bNodeId = $secondSourceComponent['nodeid'];                        
                }
            }

            if($thirdSourceComponent !== NULL && 
               $thirdSourceProperties !== NULL)
            {
                $cId  = $thirdSourceComponent['id'];
                $cName = $thirdSourceComponent["name"];
                $cSubclass = $thirdSourceComponent["subclass"];               

                if(isset($thirdSourceComponent['nodeid']))
                {
                    $cNodeId = $thirdSourceComponent['nodeid'];                        
                }
            }

            if($fourthSourceComponent !== NULL && 
               $fourthSourceProperties !== NULL)
            {
                $dId  = $fourthSourceComponent['id'];
                $dName = $fourthSourceComponent["name"];
                $dSubclass = $fourthSourceComponent["subclass"];               

                if(isset($fourthSourceComponent['nodeid']))
                {
                    $dNodeId = $fourthSourceComponent['nodeid'];                        
                }
            }

            // get class mapping info
            $classMappingInfo = getClassMappingInfo($checkCaseComponentClass, $totalSources);

            $checkComponent = new CheckComponent($aName,
                                                $bName,
                                                $cName,
                                                $dName,
                                                $aSubclass,
                                                $bSubclass,
                                                $cSubclass,
                                                $dSubclass,
                                                $aNodeId,
                                                $bNodeId,
                                                $cNodeId,
                                                $dNodeId,
                                                $aId,
                                                $bId,
                                                $cId,
                                                $dId,
                                                $classMappingInfo);

             compareProperties($checkComponent,
                                $checkCaseComponentClass['MappingProperties'], 
                                $firstSourceComponent, 
                                $secondSourceComponent,
                                $thirdSourceComponent, 
                                $fourthSourceComponent,
                                $firstSourceProperties,
                                $secondSourceProperties,
                                $thirdSourceProperties,
                                $fourthSourceProperties,
                                $firstSourceOrderInCheckcase,
                                $secondSourceOrderInCheckcase,
                                $thirdSourceOrderInCheckcase,
                                $fourthSourceOrderInCheckcase,
                                $totalSources);

            return $checkComponent;
        }

        function compareProperties ($checkComponent,
                                  $checkCaseMappingProperties, 
                                  $firstSourceComponent, 
                                  $secondSourceComponent,
                                  $thirdSourceComponent, 
                                  $fourthSourceComponent,
                                  $firstSourceProperties,
                                  $secondSourceProperties,
                                  $thirdSourceProperties,
                                  $fourthSourceProperties,
                                  $firstSourceOrderInCheckcase,
                                  $secondSourceOrderInCheckcase,
                                  $thirdSourceOrderInCheckcase,
                                  $fourthSourceOrderInCheckcase,
                                  $totalSources)
        {            
            $checkCasePropSourceA = NULL;
            $checkCasePropSourceB = NULL;
            $checkCasePropSourceC = NULL;
            $checkCasePropSourceD = NULL;
            
            // first source
            $srcAPropertyAttribute = getSourcePropertyNameProperty("a");
            $srcBPropertyAttribute = getSourcePropertyNameProperty("b");
            $srcCPropertyAttribute = NULL;
            $srcDPropertyAttribute = NULL;
            if($totalSources > 2)
            {
                $srcCPropertyAttribute = getSourcePropertyNameProperty("c");
            }
            if($totalSources > 3)
            {
                $srcDPropertyAttribute = getSourcePropertyNameProperty("d");
            }

            $firstPropertiesLowerCase = array();
            if($firstSourceComponent !== NULL && $firstSourceProperties !== NULL)
            {
                $firstComponentProperties =  $firstSourceProperties[$firstSourceComponent['id']];
                // get key array in case insestive manner
                // only keys are in lower case
                $firstPropertiesLowerCase = array_change_key_case($firstComponentProperties, CASE_LOWER);
            }

            $secondPropertiesLowerCase = array();            
            if($secondSourceComponent !== NULL && $secondSourceProperties !== NULL)
            {
                $secondComponentProperties =  $secondSourceProperties[$secondSourceComponent['id']];
                // get key array in case insestive manner
                // only keys are in lower case
                $secondPropertiesLowerCase = array_change_key_case($secondComponentProperties, CASE_LOWER);       
            }

            $thirdPropertiesLowerCase = array();   
            if($thirdSourceComponent !== NULL && $thirdSourceProperties !== NULL)
            {
                $thirdComponentProperties =  $thirdSourceProperties[$thirdSourceComponent['id']];
                // get key array in case insestive manner
                // only keys are in lower case      
                $thirdPropertiesLowerCase = array_change_key_case($thirdComponentProperties, CASE_LOWER);    
            }

            $fourthPropertiesLowerCase = array();   
            if($fourthSourceComponent !== NULL && $fourthSourceProperties !== NULL)
            {
                $fourthComponentProperties =  $fourthSourceProperties[$fourthSourceComponent['id']];
                // get key array in case insestive manner
                // only keys are in lower case      
                $fourthPropertiesLowerCase = array_change_key_case($fourthComponentProperties, CASE_LOWER);    
            }


            for ($k = 0; $k < count($checkCaseMappingProperties); $k++) 
            {
                // get check case mapping property object
                $checkCaseMappingProperty = $checkCaseMappingProperties[$k];
               
                
                $checkCasePropSourceA = strtolower($checkCaseMappingProperty[$srcAPropertyAttribute]);   
                $checkCasePropSourceB = strtolower($checkCaseMappingProperty[$srcBPropertyAttribute]);
                $checkCasePropSourceC  = NULL;
                if($totalSources > 2)
                {
                    $checkCasePropSourceC = strtolower($checkCaseMappingProperty[$srcCPropertyAttribute]);  
                }
                if($totalSources > 3)
                {
                    $checkCasePropSourceD = strtolower($checkCaseMappingProperty[$srcDPropertyAttribute]);  
                }

                // $fourthPropertiesLowerCase = array_change_key_case($fourthComponentProperties, CASE_LOWER);    
                if($checkCasePropSourceA === NULL)
                {
                    return;
                }

                $property1Name =  NULL;
                $property1Value =  NULL;
                $property2Name = NULL;
                $property2Value = NULL;
                $property3Name = NULL;
                $property3Value = NULL;
                $property4Name = NULL;
                $property4Value = NULL;

                $severity = NULL;
                $performCheck = true;

                // get first source property
                if ($checkCasePropSourceA !== NULL && 
                    array_key_exists($checkCasePropSourceA, $firstPropertiesLowerCase)) 
                {                    
                    $property1 = $firstPropertiesLowerCase[$checkCasePropSourceA];
                    $property1Name = $property1['name'];
                    $property1Value = $property1["value"];
                }               
                    
                // get second source property
                if ($checkCasePropSourceB !== NULL &&
                        array_key_exists($checkCasePropSourceB, $secondPropertiesLowerCase)) 
                {                    
                    $property2 =$secondPropertiesLowerCase[$checkCasePropSourceB];
                    $property2Name = $property2['name'];                   
                    $property2Value = $property2["value"];
                }
                
                // get third source property
                if ($checkCasePropSourceC !== NULL &&
                    array_key_exists($checkCasePropSourceC, $thirdPropertiesLowerCase)) 
                {
                    $property3 =$thirdPropertiesLowerCase[$checkCasePropSourceC];
                    $property3Name = $property3['name'];                   
                    $property3Value = $property3["value"];
                }

                 // get third source property
                 if ($checkCasePropSourceD !== NULL &&
                 array_key_exists($checkCasePropSourceD, $fourthPropertiesLowerCase)) 
                {
                    $property4 =$fourthPropertiesLowerCase[$checkCasePropSourceD];
                    $property4Name = $property4['name'];                   
                    $property4Value = $property4["value"];
                }

                if($totalSources === 2)
                {
                    // compare properties
                    if($checkCasePropSourceA !== NULL &&
                       $checkCasePropSourceB !== NULL)
                    {
                        if (($property1Name == NULL || 
                            $property1Value == "") &&
                            ($property2Name == NULL || 
                            $property2Value == "")) 
                        {
                            $severity = "No Value";
                            $performCheck = false;                    
                        }
                        else 
                        {
                            if($property1Value == $property2Value) 
                            {
                                $severity = "OK";
                            }
                            else 
                            {
                                $severity = $checkCaseMappingProperty['Severity'];
                            }

                            $performCheck = true;                  
                        }
                    }
                    else 
                    {
                        // one/all of the (second and third dataset)properties not mapped
                        $severity = "Error";
                        $performCheck = false;        
                    }
                }
                else if($totalSources === 3)
                {
                    // compare properties
                    if($checkCasePropSourceA !== NULL &&
                    $checkCasePropSourceB !== NULL && 
                    $checkCasePropSourceC !== NULL)
                    {
                        if (($property1Name == NULL || 
                            $property1Value == "") &&
                            ($property2Name == NULL || 
                            $property2Value == "") ||
                            ($property3Name == NULL || 
                            $property3Value == "")) 
                        {
                            $severity = "No Value";
                            $performCheck = false;                    
                        }
                        else 
                        {
                            if($property1Value == $property2Value && 
                            $property1Value == $property3Value) 
                            {
                                $severity = "OK";
                            }
                            else 
                            {
                                $severity = $checkCaseMappingProperty['Severity'];
                            }

                            $performCheck = true;                  
                        }
                    }
                    else 
                    {
                        // one/all of the (second and third dataset)properties not mapped
                        $severity = "Error";
                        $performCheck = false;        
                    }
                }
                else if($totalSources === 4)
                {
                    // compare properties
                    if($checkCasePropSourceA !== NULL &&
                    $checkCasePropSourceB !== NULL && 
                    $checkCasePropSourceC !== NULL &&
                    $checkCasePropSourceD !== NULL)
                    {
                        if (($property1Name == NULL || 
                            $property1Value == "") &&
                            ($property2Name == NULL || 
                            $property2Value == "") ||
                            ($property3Name == NULL || 
                            $property3Value == "") ||
                            ($property4Name == NULL || 
                            $property4Value == "")) 
                        {
                            $severity = "No Value";
                            $performCheck = false;                    
                        }
                        else 
                        {
                            if($property1Value == $property2Value && 
                            $property1Value == $property3Value &&
                            $property1Value == $property4Value) 
                            {
                                $severity = "OK";
                            }
                            else 
                            {
                                $severity = $checkCaseMappingProperty['Severity'];
                            }

                            $performCheck = true;                  
                        }
                    }
                    else 
                    {
                        // one/all of the (second and third dataset)properties not mapped
                        $severity = "Error";
                        $performCheck = false;        
                    }
                }

                $description =  $checkCaseMappingProperty['Comment'];

                $checkProperty = new CheckProperty( $property1Name,
                                                    $property1Value,
                                                    $property2Name,
                                                    $property2Value,
                                                    $property3Name,
                                                    $property3Value,
                                                    $property4Name,
                                                    $property4Value,
                                                    $severity,
                                                    $performCheck,
                                                    $description,
                                                    NULL);
                
                $checkComponent->AddCheckProperty($checkProperty);
           }  
        }

        function getClassMappingInfo($checkCaseComponentClass, $totalSources)
        {

            if($totalSources < 2 )
            {
                return NULL;
            }

            $classMappingInfo = "Class: ";

            $sourceAClassNameAttribute = getSourceClassNameProperty('a');
            $className = $checkCaseComponentClass[$sourceAClassNameAttribute];
            $classMappingInfo =  $classMappingInfo. $className;

            $sourceBClassNameAttribute = getSourceClassNameProperty('b');
            $className = $checkCaseComponentClass[$sourceBClassNameAttribute];
            $classMappingInfo =  $classMappingInfo. "- ".$className;

            if($totalSources > 2 )
            {
                $sourceCClassNameAttribute = getSourceClassNameProperty('c');
                $className = $checkCaseComponentClass[$sourceCClassNameAttribute];
                $classMappingInfo =  $classMappingInfo. "- ".$className;
            }

            if($totalSources > 3 )
            {
                $sourceDClassNameAttribute = getSourceClassNameProperty('d');
                $className = $checkCaseComponentClass[$sourceDClassNameAttribute];
                $classMappingInfo =  $classMappingInfo. "- ".$className;
            }

            return $classMappingInfo;
        }

        function getNoMatchComponent ($sourceComponent,
                                      $sourceProperties,
                                      $sourceLoadOrder,
                                      $classMappingInfo) 
        {
            $aId = NULL;
            $aName = NULL;
            $aSubclass = NULL;
            $aNodeId = NULL;
            $bId = NULL;
            $bName = NULL;
            $bSubclass = NULL;
            $bNodeId = NULL;
            $cId = NULL;
            $cName = NULL;
            $cSubclass = NULL;
            $cNodeId = NULL;
            $dId = NULL;
            $dName = NULL;
            $dSubclass = NULL;
            $dNodeId = NULL;
            if($sourceLoadOrder === 1)
            {
                $aId  = $sourceComponent['id'];
                $aName = $sourceComponent["name"];
                $aSubclass = $sourceComponent["subclass"];               

                if(isset($sourceComponent['nodeid']))
                {
                    $aNodeId = $sourceComponent['nodeid'];                        
                }
            }
            else if($sourceLoadOrder === 2)
            {
                $bId  = $sourceComponent['id'];
                $bName = $sourceComponent["name"];
                $bSubclass = $sourceComponent["subclass"];               

                if(isset($sourceComponent['nodeid']))
                {
                    $bNodeId = $sourceComponent['nodeid'];                        
                }
            }
            else if($sourceLoadOrder === 3)
            {
                $cId  = $sourceComponent['id'];
                $cName = $sourceComponent["name"];
                $cSubclass = $sourceComponent["subclass"];               

                if(isset($sourceComponent['nodeid']))
                {
                    $cNodeId = $sourceComponent['nodeid'];                        
                }
            }
            else if($sourceLoadOrder === 4)
            {
                $dId  = $sourceComponent['id'];
                $dName = $sourceComponent["name"];
                $dSubclass = $sourceComponent["subclass"];               

                if(isset($sourceComponent['nodeid']))
                {
                    $dNodeId = $sourceComponent['nodeid'];                        
                }
            }
            $checkComponent = new CheckComponent($aName,
                                                 $bName,
                                                 $cName,
                                                 $dName,
                                                 $aSubclass,
                                                 $bSubclass,
                                                 $cSubclass,
                                                 $dSubclass,
                                                 $aNodeId,
                                                 $bNodeId,
                                                 $cNodeId,
                                                 $dNodeId,
                                                 $aId,
                                                 $bId,
                                                 $cId,
                                                 $dId,
                                                 $classMappingInfo);

            $sourceComponentProperties =  $sourceProperties[$sourceComponent['id']];

            foreach ($sourceComponentProperties as $name => $property) 
            {   
                
                $aPropertyName = NULL;
                $aPropertyValue = NULL;
                $bPropertyName = NULL;
                $bPropertyValue = NULL;
                $cPropertyName = NULL;
                $cPropertyValue = NULL;
                $dPropertyName = NULL;
                $dPropertyValue = NULL;
                
                if($sourceLoadOrder === 1)
                {
                    $aPropertyName = $property["name"];
                    $aPropertyValue = $property["value"];
                }
                else if($sourceLoadOrder === 2)
                {
                    $bPropertyName = $property["name"];
                    $bPropertyValue = $property["value"];
                }
                else if($sourceLoadOrder === 3)
                {
                    $cPropertyName = $property["name"];
                    $cPropertyValue = $property["value"];
                }
                else if($sourceLoadOrder === 4)
                {
                    $dPropertyName = $property["name"];
                    $dPropertyValue = $property["value"];
                }

                $checkProperty = new CheckProperty( $aPropertyName,
                                                    $aPropertyValue,
                                                    $bPropertyName,
                                                    $bPropertyValue,
                                                    $cPropertyName,
                                                    $cPropertyValue,
                                                    $dPropertyName,
                                                    $dPropertyValue,
                                                    "No Match",
                                                    NULL,
                                                    NULL,
                                                    NULL);


                $checkProperty->PerformCheck = false;
                $checkComponent->AddCheckProperty($checkProperty);
            }  

            $checkComponent->Status = "No Match";
            return $checkComponent;
        }

        function isComponentMatch ($firstComponent,
                                   $secondComponent,
                                   $firstSourceProperties,
                                   $secondSourceProperties,
                                   $matchwithProperties,
                                   $firstSourceOrderInCheckCase,
                                   $secondSourceOrderInCheckCase) 
        {  
            $firstSourceMatchWithAttribute;
            if($firstSourceOrderInCheckCase === 1)
            {
                $firstSourceMatchWithAttribute = 'sourceA';
            }
            else if($firstSourceOrderInCheckCase === 2)
            {
                $firstSourceMatchWithAttribute = 'sourceB';
            }
            else if($firstSourceOrderInCheckCase === 3)
            {
                $firstSourceMatchWithAttribute = 'sourceC';
            }
            else if($firstSourceOrderInCheckCase === 4)
            {
                $firstSourceMatchWithAttribute = 'sourceD';
            }
            else
            {
                return false;
            }    
            
            $secondSourceMatchWithAttribute;
            if($secondSourceOrderInCheckCase === 1)
            {
                $secondSourceMatchWithAttribute = 'sourceA';
            }
            else if($secondSourceOrderInCheckCase === 2)
            {
                $secondSourceMatchWithAttribute = 'sourceB';
            }
            else if($secondSourceOrderInCheckCase === 3)
            {
                $secondSourceMatchWithAttribute = 'sourceC';
            }
            else if($secondSourceOrderInCheckCase === 4)
            {
                $secondSourceMatchWithAttribute = 'sourceD';
            }
            else
            {
                return false;
            }  

            for ($matchwithPropertyIndex = 0;  $matchwithPropertyIndex < count($matchwithProperties); $matchwithPropertyIndex++) 
            {    
                $matchwithProperty = $matchwithProperties[$matchwithPropertyIndex];

                $firstMatchwithPropertyName = strtolower($matchwithProperty[$firstSourceMatchWithAttribute]);
                $secondMatchwithPropertyName = strtolower($matchwithProperty[$secondSourceMatchWithAttribute]);

                $firstComponentProperties =  $firstSourceProperties[$firstComponent['id']];
                $secondComponentProperties =  $secondSourceProperties[$secondComponent['id']];

                // get key array in case insestive manner
                // only keys are in lower case
                $firstComponentPropertiesLowerCase =array_change_key_case($firstComponentProperties, CASE_LOWER);
                $secondComponentPropertiesLowerCase =array_change_key_case($secondComponentProperties, CASE_LOWER);                           

                if (!array_key_exists($firstMatchwithPropertyName, $firstComponentPropertiesLowerCase) ||
                    !array_key_exists($secondMatchwithPropertyName, $secondComponentPropertiesLowerCase))
                {
                    return false;
                }                          

                $firstMatchwithProperty = $firstComponentPropertiesLowerCase[$firstMatchwithPropertyName];
                $secondMatchwithProperty = $secondComponentPropertiesLowerCase[$secondMatchwithPropertyName];
                

                if ($firstMatchwithProperty['value'] == $secondMatchwithProperty['value']) 
                {
                    return true;
                }
            }

            return false; 

            // foreach ($matchwithProperties as $key => $matchwithProperty) 
            // {    

            //     // $sourceAMatchwithPropertyName = $key;
            //     // $sourceBMatchwithPropertyName = $value;

            //     if($orderMaintained == 'true')
            //     {
            //         $sourceAMatchwithPropertyName = $key;
            //         $sourceBMatchwithPropertyName = $value;
            //     }  
            //     else
            //     {
            //         $sourceAMatchwithPropertyName = $value;
            //         $sourceBMatchwithPropertyName = $key;
            //     }     

            //     $sourceAMatchwithPropertyName =  strtolower($sourceAMatchwithPropertyName);
            //     $sourceBMatchwithPropertyName =  strtolower($sourceBMatchwithPropertyName);

            //     $sourceAComponentProperties =  $SourceAProperties[$sourceAComponent['id']];
            //     $sourceBComponentProperties =  $SourceBProperties[$sourceBComponent['id']];

            //     // get key array in case insestive manner
            //     // only keys are in lower case
            //     $sourceAPropertiesLowerCase =array_change_key_case($sourceAComponentProperties, CASE_LOWER);
            //     $sourceBPropertiesLowerCase =array_change_key_case($sourceBComponentProperties, CASE_LOWER);                           

            //     if (!array_key_exists($sourceAMatchwithPropertyName, $sourceAPropertiesLowerCase) ||
            //         !array_key_exists($sourceBMatchwithPropertyName, $sourceBPropertiesLowerCase))
            //     {
            //         return false;
            //     }                          

            //     $sourceAMatchwithProperty = $sourceAPropertiesLowerCase[$sourceAMatchwithPropertyName];
            //     $sourceBMatchwithProperty = $sourceBPropertiesLowerCase[$sourceBMatchwithPropertyName];
                

            //     if ($sourceAMatchwithProperty['value'] != $sourceBMatchwithProperty['value']) 
            //     {
            //         return false;
            //     }
            // }

            // return true; 
        }

        function getClassMapped($firstClassName, 
                               $secondClassName, 
                               $checkCaseGroup,
                               $firstSourceOrderInCheckCase,
                               $secondSourceOrderInCheckCase)
        {   
            $firstClassNameAttribute;
            if($firstSourceOrderInCheckCase === 1)
            {
                $firstClassNameAttribute = 'SourceAName';
            }
            else if($firstSourceOrderInCheckCase === 2)
            {
                $firstClassNameAttribute = 'SourceBName';
            }
            else if($firstSourceOrderInCheckCase === 3)
            {
                $firstClassNameAttribute = 'SourceCName';
            }
            else if($firstSourceOrderInCheckCase === 4)
            {
                $firstClassNameAttribute = 'SourceDName';
            }
            else
            {
                return false;
            }    
            
            $secondClassNameAttribute;
            if($secondSourceOrderInCheckCase === 1)
            {
                $secondClassNameAttribute = 'SourceAName';
            }
            else if($secondSourceOrderInCheckCase === 2)
            {
                $secondClassNameAttribute = 'SourceBName';
            }
            else if($secondSourceOrderInCheckCase === 3)
            {
                $secondClassNameAttribute = 'SourceCName';
            }
            else if($secondSourceOrderInCheckCase === 4)
            {
                $secondClassNameAttribute = 'SourceDName';
            }
            else
            {
                return false;
            }   

            $componentClasses = $checkCaseGroup['ComponentClasses'];
            for($classIndex = 0; $classIndex < count($componentClasses); $classIndex++)
            {
                $componentClass = $componentClasses[$classIndex];         

                if (strtolower($componentClass[$firstClassNameAttribute]) === strtolower($firstClassName) &&
                    strtolower($componentClass[$secondClassNameAttribute]) == strtolower($secondClassName)) {
                    return $componentClass;
                }

            }

            return NULL;  
        }

        function isClassMapped($className,                                
                                $checkCaseGroup,
                                $sourceOrderInCheckCase)
        {   
            $classNameAttribute;
            if($sourceOrderInCheckCase === 1)
            {
                $classNameAttribute = 'SourceAName';
            }
            else if($sourceOrderInCheckCase === 2)
            {
                $classNameAttribute = 'SourceBName';
            }
            else if($sourceOrderInCheckCase === 3)
            {
                $classNameAttribute = 'SourceCName';
            }
            else if($sourceOrderInCheckCase === 4)
            {
                $classNameAttribute = 'SourceDName';
            }
            else
            {
                return false;
            }    

            $componentClasses = $checkCaseGroup['ComponentClasses'];
            for($classIndex = 0; $classIndex < count($componentClasses); $classIndex++)
            {
                $componentClass = $componentClasses[$classIndex];         

                if (strtolower($componentClass[$classNameAttribute]) === strtolower($className)) {
                    return true;
                }
            }

            return false;  
        }

        function areClassesMapped($firstClassName, 
                               $secondClassName, 
                               $componentClass,
                               $firstSourceOrderInCheckCase,
                               $secondSourceOrderInCheckCase)
        {   
            $firstClassNameAttribute;
            if($firstSourceOrderInCheckCase === 1)
            {
                $firstClassNameAttribute = 'SourceAName';
            }
            else if($firstSourceOrderInCheckCase === 2)
            {
                $firstClassNameAttribute = 'SourceBName';
            }
            else if($firstSourceOrderInCheckCase === 3)
            {
                $firstClassNameAttribute = 'SourceCName';
            }
            else if($firstSourceOrderInCheckCase === 4)
            {
                $firstClassNameAttribute = 'SourceDName';
            }
            else
            {
                return false;
            }    
            
            $secondClassNameAttribute;
            if($secondSourceOrderInCheckCase === 1)
            {
                $secondClassNameAttribute = 'SourceAName';
            }
            else if($secondSourceOrderInCheckCase === 2)
            {
                $secondClassNameAttribute = 'SourceBName';
            }
            else if($secondSourceOrderInCheckCase === 3)
            {
                $secondClassNameAttribute = 'SourceCName';
            }
            else if($secondSourceOrderInCheckCase === 4)
            {
                $secondClassNameAttribute = 'SourceDName';
            }
            else
            {
                return false;
            }   

            // $componentClasses = $checkCaseGroup['ComponentClasses'];
            // for($classIndex = 0; $classIndex < count($componentClasses); $classIndex++)
            // {
            //     $componentClass = $componentClasses[$classIndex];         

            if (strtolower($componentClass[$firstClassNameAttribute]) == strtolower($firstClassName) &&
                strtolower($componentClass[$secondClassNameAttribute]) == strtolower($secondClassName)) {
                return true;
            }

            // }

            return false;  
        }       
        
        function getCheckComponentGroup ($groupName) 
        {
            global $CheckComponentsGroups;
            $checkComponentGroup;

            if ($CheckComponentsGroups  != NULL&&
                array_key_exists($groupName, $CheckComponentsGroups)) {
                    
                    $checkComponentGroup =$CheckComponentsGroups[$groupName];
            }
            else {
                $checkComponentGroup = new CheckComponentGroup($groupName);
                $CheckComponentsGroups[$groupName] = $checkComponentGroup;
            }
                
            return $checkComponentGroup;
        }
        

        function getUndefinedComponent ($sourceComponent, $dataSourceIndex) 
        {

            $aId = NULL;
            $aName = NULL;
            $aSubclass = NULL;
            $aNodeId = NULL;
            $bId = NULL;
            $bName = NULL;
            $bSubclass = NULL;
            $bNodeId = NULL;
            $cId = NULL;
            $cName = NULL;
            $cSubclass = NULL;
            $cNodeId = NULL;
            $dId = NULL;
            $dName = NULL;
            $dSubclass = NULL;
            $dNodeId = NULL;

            $properties;
            if($dataSourceIndex === 1)
            {
               $aId =  $sourceComponent['id'];
               $aName = $sourceComponent["name"];
               $aSubclass =  $sourceComponent["subclass"];

                $aNodeId = NUll;
                if(isset($sourceComponent['nodeid']))
                {
                    $aNodeId = $sourceComponent['nodeid'];
                }

                global $SourceAProperties;
                $properties = $SourceAProperties;
            }
            else if($dataSourceIndex === 2)
            {
                $bId =  $sourceComponent['id'];
                $bName = $sourceComponent["name"];
                $bSubclass =  $sourceComponent["subclass"];
 
                 $bNodeId = NUll;
                 if(isset($sourceComponent['nodeid']))
                 {
                     $bNodeId = $sourceComponent['nodeid'];
                 }

                 global $SourceBProperties;
                 $properties = $SourceBProperties;
            }
            else if($dataSourceIndex === 3)
            {
                $cId =  $sourceComponent['id'];
                $cName = $sourceComponent["name"];
                $cSubclass =  $sourceComponent["subclass"];
 
                 $cNodeId = NUll;
                 if(isset($sourceComponent['nodeid']))
                 {
                     $cNodeId = $sourceComponent['nodeid'];
                 }

                 global $SourceCProperties;
                 $properties = $SourceCProperties;
            }
            else if($dataSourceIndex === 4)
            {
                $dId =  $sourceComponent['id'];
                $dName = $sourceComponent["name"];
                $dSubclass =  $sourceComponent["subclass"];
 
                 $dNodeId = NUll;
                 if(isset($sourceComponent['nodeid']))
                 {
                    $dNodeId = $sourceComponent['nodeid'];
                 }

                 global $SourceDProperties;
                 $properties = $SourceDProperties;
            }

            $checkComponent = new CheckComponent($aName,
                                                $bName,
                                                $cName,
                                                $dName,
                                                $aSubclass,
                                                $bSubclass,
                                                $cSubclass,
                                                $dSubclass,
                                                $aNodeId,
                                                $bNodeId,
                                                $cNodeId,
                                                $dNodeId,
                                                $aId,
                                                $bId,
                                                $cId,
                                                $dId,
                                                NULL);

            $componentProperties =  $properties[$sourceComponent['id']];            
            foreach ($componentProperties as $name => $property) 
            {   
                $aPropertyName = NULL;
                $aPropertyValue = NULL;
                $bPropertyName = NULL;
                $bPropertyValue = NULL;
                $cPropertyName = NULL;
                $cPropertyValue = NULL;
                $dPropertyName = NULL;
                $dPropertyValue = NULL;
                
                if($dataSourceIndex === 1)
                {
                    $aPropertyName = $property["name"];
                    $aPropertyValue = $property["value"];
                }
                else if($dataSourceIndex === 2)
                {
                    $bPropertyName = $property["name"];
                    $bPropertyValue = $property["value"];
                }
                else if($dataSourceIndex === 3)
                {
                    $cPropertyName = $property["name"];
                    $cPropertyValue = $property["value"];
                }
                else if($dataSourceIndex === 4)
                {
                    $dPropertyName = $property["name"];
                    $dPropertyValue = $property["value"];
                }

                $checkProperty = new CheckProperty( $aPropertyName,
                                                    $aPropertyValue,
                                                    $bPropertyName,
                                                    $bPropertyValue,
                                                    $cPropertyName,
                                                    $cPropertyValue,
                                                    $dPropertyName,
                                                    $dPropertyValue,
                                                    "undefined",
                                                    NULL,
                                                    NULL,
                                                    NULL);

                $checkProperty->PerformCheck = false;
                $checkComponent->AddCheckProperty($checkProperty);
            }          

            $checkComponent->Status = "undefined";
            return $checkComponent;
        }

        function getAllGroupMapped($groupName, $sourceOrderInCheckCase){          
            
            $groupNameAttribute;
            if($sourceOrderInCheckCase === 1)
            {
                $groupNameAttribute = 'SourceAName';
            }
            else if($sourceOrderInCheckCase === 2)
            {
                $groupNameAttribute = 'SourceBName';
            }
            else if($sourceOrderInCheckCase === 3)
            {
                $groupNameAttribute = 'SourceCName';
            }
            else if($sourceOrderInCheckCase === 4)
            {
                $groupNameAttribute = 'SourceDName';
            }
            else
            {
                return false;
            }

            global $CheckCaseType;
            $checkcaseGroups = $CheckCaseType['ComponentGroups'];

            $mappedGroups = array();
            for($index = 0; $index < count($checkcaseGroups); $index++)
            {
                $checkcaseGroup = $checkcaseGroups[$index];

                 if (strtolower($checkcaseGroup[$groupNameAttribute]) == strtolower($groupName)) {
                    array_push($mappedGroups, $checkcaseGroup);
                }
            }
        
            return $mappedGroups;
        }

        function isGroupMapped($groupName, $sourceOrderInCheckCase){          
            
            $groupNameAttribute;
            if($sourceOrderInCheckCase === 1)
            {
                $groupNameAttribute = 'SourceAName';
            }
            else if($sourceOrderInCheckCase === 2)
            {
                $groupNameAttribute = 'SourceBName';
            }
            else if($sourceOrderInCheckCase === 3)
            {
                $groupNameAttribute = 'SourceCName';
            }
            else if($sourceOrderInCheckCase === 4)
            {
                $groupNameAttribute = 'SourceDName';
            }
            else
            {
                return false;
            }

            global $CheckCaseType;
            $checkcaseGroups = $CheckCaseType['ComponentGroups'];
           
            for($index = 0; $index < count($checkcaseGroups); $index++)
            {
                $checkcaseGroup = $checkcaseGroups[$index];

                 if (strtolower($checkcaseGroup[$groupNameAttribute]) == strtolower($groupName)) {
                 return true;
                }
            }
        
            return false;
        }

        // get source components
        function getSourceComponents()
        {
            $projectName = $_POST['ProjectName'];
            $checkName = $_POST['CheckName'];
            
            global $SourceAComponents;
            global $SourceBComponents;
            global $SourceCComponents;
            global $SourceDComponents;
            
            global $SourceAProperties;
            global $SourceBProperties;                
            global $SourceCProperties;
            global $SourceDProperties;

            try{   
                    // open database
                    $dbPath = getCheckDatabasePath($projectName, $checkName);
                    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

                    // begin the transaction
                    $dbh->beginTransaction();
                        
                    // fetch source A components
                    $compsObj = readSourceComponents($dbh, "SourceAComponents", "SourceAProperties");
                    $SourceAComponents = $compsObj["components"];
                    $SourceAProperties = $compsObj["properties"];
                    
                    // fetch source B components
                    $compsObj = readSourceComponents($dbh, "SourceBComponents", "SourceBProperties");
                    $SourceBComponents = $compsObj["components"];
                    $SourceBProperties = $compsObj["properties"];

                    // fetch source C components
                    $compsObj = readSourceComponents($dbh, "SourceCComponents", "SourceCProperties");
                    $SourceCComponents = $compsObj["components"];
                    $SourceCProperties = $compsObj["properties"];

                    // fetch source D components
                    $compsObj = readSourceComponents($dbh, "SourceDComponents", "SourceDProperties");
                    $SourceDComponents = $compsObj["components"];
                    $SourceDProperties = $compsObj["properties"];      
                    
                    // commit update
                    $dbh->commit();
                    $dbh = null; //This is how you close a PDO connection
                }                
                catch(Exception $e) {        
                    echo "fail"; 
                    return;
                }                
        }         
         
        function readSourceComponents($dbh, $componentsTable, $propertiesTable)
        {
            $components = array();
            $properties = array();

            // fetch source components in group of mainclasses            
            $mainClasses = $dbh->query("SELECT DISTINCT mainclass FROM  $componentsTable;");
            if($mainClasses)
            {
                while ($mainClass = $mainClasses->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $stmt = $dbh->query("SELECT *FROM ".$componentsTable." where mainclass='".$mainClass['mainclass']."';");
                    if($stmt)
                    {
                        $components[$mainClass['mainclass']] = array();

                        while ($component = $stmt->fetch(\PDO::FETCH_ASSOC)) 
                        {
                            $componentData = array('id'=>$component['id'], 
                                            'name'=>$component['name'],  
                                            'mainclass'=>$component['mainclass'], 
                                            'subclass'=>$component['subclass']);
                            if (array_key_exists("nodeid",$component))
                            {
                                $componentData["nodeid"] =  $component['nodeid'];                               
                            } 
                            
                            array_push( $components[$mainClass['mainclass']], $componentData);

                            // fetch source Properties
                            $propertiesList = array();
                            $stmt1 =  $dbh->query('SELECT *FROM '.$propertiesTable.' where ownercomponent='.$component['id']);
                        
                            while ($propertyRow = $stmt1->fetch(\PDO::FETCH_ASSOC)) 
                            {
                                $values = array('name' => $propertyRow['name'], 
                                'value' =>$propertyRow['value'], 
                                'ownercomponent' =>$propertyRow['ownercomponent']);
                                
                                $propertiesList[$propertyRow['name']] = $values;                                                                             
                            }
                            $properties[$component['id']] =  $propertiesList;
                        }
                    }
                }
            }

            return array('components' => $components, 'properties' => $properties);
        }
       
        function isComponentSelected($component, $SelectedComponents){
           
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
        
?>