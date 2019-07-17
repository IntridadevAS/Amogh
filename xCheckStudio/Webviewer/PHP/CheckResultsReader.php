<?php
        include 'Utility.php';       

        session_start();
            
        // get project name
        $projectName = NULL;
        if(isset($_SESSION['ProjectName']))
        {
            $projectName =  $_SESSION['ProjectName'];              
        }
        else
        {
            echo 'fail';
            return;              
        }	

        $sourceAComponents = array();
        $sourceBComponents = array();
        $sourceAComponentsHierarchy = array();
        $sourceBComponentsHierarchy = array();
        $comparisonResult = readComparisonCheckData();

        $sourceAComplianceResult = readComplianceCheckData('SourceAComplianceCheckGroups',
                                                            'SourceAComplianceCheckComponents',
                                                            'SourceAComplianceCheckProperties');

        $sourceBComplianceResult = readComplianceCheckData('SourceBComplianceCheckGroups',
                                                           'SourceBComplianceCheckComponents',
                                                           'SourceBComplianceCheckProperties');

        $data = readDataSourceInfo();

        
        getSourceComponents();

        // var_dump($sourceBComponents);
        createHierarchyStructureForComponents();

        $results = array();
        if($comparisonResult != NULL)
        {
            $results['Comparison'] = $comparisonResult;
        }
        
        if($sourceAComplianceResult != NULL)
        {
            $results['SourceACompliance'] = $sourceAComplianceResult;
        }                    

        if($sourceBComplianceResult != NULL)
        {
            $results['SourceBCompliance'] = $sourceBComplianceResult;
        }

        if($sourceAComponentsHierarchy !== null) {
            $results['sourceAComponentsHierarchy'] = $sourceAComponentsHierarchy;
        }
        if($sourceBComponentsHierarchy !== null) {
            $results['sourceBComponentsHierarchy'] = $sourceBComponentsHierarchy;
        }

        echo json_encode($results);


        function getSourceComponents()
        {
            global $projectName;
            global $sourceAComponents;
            global $sourceBComponents;
            global $data;
            try{   
                    // open database
                    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
                    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

                    // begin the transaction
                    $dbh->beginTransaction();
                    if(strtolower($data['sourceAType']) !== 'xls' || strtolower($data['sourceAType']) !== 'json') {
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
                                $sourceAComponents[$componentRow['id']] = $values2;    
                            
                        }   
                    } 
                                        
                    if(strtolower($data['sourceBType']) !== 'xls' || strtolower($data['sourceBType']) !== 'json') {
                        // fetch source B components
                        $stmt =  $dbh->query('SELECT *FROM SourceBComponents');
                        while ($componentRow = $stmt->fetch(\PDO::FETCH_ASSOC)) {

                                $values2 =array('id'=>$componentRow['id'], 'name'=>$componentRow['name'],  'mainclass'=>$componentRow['mainclass'], 'subclass'=>$componentRow['subclass']);
                                if (array_key_exists("nodeid",$componentRow))
                                {
                                    $values2["nodeid"] =  $componentRow['nodeid'];                               
                                }

                                $sourceBComponents[$componentRow['id']] =  $values2; 
                        }  
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
        
        function readComplianceCheckData($checkGroupTable,
                                         $CheckComponentsTable,
                                         $CheckPropertiesTable)
        {
            global $projectName;
            
            // //session_start();
            // if(!isset($_SESSION['LoadProject'] ))
            // {
            //    echo "fail";
            //    return NULL;                
            // }
            // $loadProject = $_SESSION['LoadProject'];

            // $dbPath = NULL;
            // if(strtolower($loadProject) === 'true')
            // {
            //     $dbPath = getProjectDatabasePath($projectName);   
            // }
            // else if(strtolower($loadProject) === 'false')
            // {                
            //     $dbPath = "../Projects/".$projectName."/CheckResults_temp.db";
            // }
            // else
            // {
            //     echo "fail";
            //     return NULL;    
            // }

            try
            {   
                // open database
                $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
                //$dbPath = "../Projects/".$projectName."/CheckResults_temp.db";
                //$dbPath = getProjectDatabasePath($projectName);
                $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
   
                // begin the transaction
                $dbh->beginTransaction();

                // get comparison check data
                $result = readComplianceCheckResults($dbh, 
                                            $checkGroupTable,
                                            $CheckComponentsTable,
                                            $CheckPropertiesTable);
             
                // commit update
                $dbh->commit();
                $dbh = null; //This is how you close a PDO connection

                return $result;
            }                
            catch(Exception $e) 
            {        
                echo "fail"; 
                return NULL;
            }    
            
            return NULL;
        }

        
        function readComparisonCheckData()
        {
            global $projectName;
            
            // //session_start();
            // if(!isset($_SESSION['LoadProject'] ))
            // {
            //    echo "fail";
            //    return NULL;                
            // }
            // $loadProject = $_SESSION['LoadProject'];

            // $dbPath = NULL;
            // if(strtolower($loadProject) === 'true')
            // {
            //     $dbPath = getProjectDatabasePath($projectName);   
            // }
            // else if(strtolower($loadProject) === 'false')
            // {                
            //     $dbPath = "../Projects/".$projectName."/CheckResults_temp.db";
            // }
            // else
            // {
            //     echo "fail";
            //     return NULL;    
            // }

            try
            {   
                // open database
                $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
                //$dbPath = getProjectDatabasePath($projectName);
                //$dbPath = "../Projects/".$projectName."/CheckResults_temp.db";
                $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
   
                // begin the transaction
                $dbh->beginTransaction();

                // get comparison check data
                $result = readComparisonCheckResults($dbh);
                
                // commit update
                $dbh->commit();
                $dbh = null; //This is how you close a PDO connection

                return $result;
            }                
            catch(Exception $e) 
            {        
                echo "fail"; 
                return NULL;
            }   
            
            return NULL;
        }

        function readComplianceCheckResults($dbh,
                                            $checkGroupTable,
                                            $CheckComponentsTable,
                                            $CheckPropertiesTable)
        {
            $complianceComponentGroups = array();
           
            // read components groups
            $checkGroupResults = $dbh->query("SELECT *FROM $checkGroupTable;");
            if($checkGroupResults) 
            {
               
                while ($groupRow = $checkGroupResults->fetch(\PDO::FETCH_ASSOC)) 
                {
                    
                    $complianceComponentGroups[$groupRow['id']] = array('id'=>$groupRow['id'], 
                                                                  'componentClass'=>$groupRow['componentClass'],  
                                                                  'componentCount'=>$groupRow['componentCount'],
                                                                  'categoryStatus' => $groupRow['categoryStatus']); 
                    
                    $groupId = $groupRow['id'];
                    // read components                                                                  
                    $checkComponentsResults = $dbh->query("SELECT *FROM $CheckComponentsTable where ownerGroup= $groupId;");
                    if($checkComponentsResults) 
                    {
                        $changedStatus;
                        $components =array();
                        while ($componentRow = $checkComponentsResults->fetch(\PDO::FETCH_ASSOC)) 
                        {
                            if($componentRow['accepted'] == 'true')
                                $changedStatus = 'ACCEPTED';
                            else 
                                $changedStatus = $componentRow['status'];

                            $componentValues = array('id'=>$componentRow['id'], 
                                            'name'=>$componentRow['name'],                                              
                                            'subComponentClass'=>$componentRow['subComponentClass'],
                                            'status'=>$changedStatus,
                                            'nodeId'=>$componentRow['nodeId'],
                                            'ownerGroup'=>$componentRow['ownerGroup']);                                                         

                            $componentId = $componentRow['id'];
                             // read properties                                                                  
                            $checkPropertiesResults = $dbh->query("SELECT *FROM $CheckPropertiesTable where ownerComponent=$componentId;");
                            if($checkPropertiesResults) 
                            {
                                $changedStatus;
                                $properties =array();
                                while ($propertyRow = $checkPropertiesResults->fetch(\PDO::FETCH_ASSOC)) 
                                {
                                    if($propertyRow['accepted'] == 'true')
                                        $changedStatus = 'ACCEPTED';
                                    else 
                                        $changedStatus = $propertyRow['severity'];

                                    $propertyValues = array('id'=>$propertyRow['id'], 
                                                            'name'=>$propertyRow['name'],  
                                                            'value'=>$propertyRow['value'],                                                            
                                                            'result'=>$propertyRow['result'],
                                                            'severity'=>$changedStatus,
                                                            'performCheck'=>$propertyRow['performCheck'],
                                                            'description'=>$propertyRow['description'],
                                                            'ownerComponent'=>$propertyRow['ownerComponent']); 
                    
                                    array_push($properties, $propertyValues);

                                }
                               
                                $componentValues["properties"] = $properties;
                            }
                            else
                            {
                                // ComparisonCheckProperties table doesn't exist
                                return NULL;
                                //return false;
                            }

                            $components[ $componentId ] =  $componentValues;                           
                        }

                         $complianceComponentGroups[$groupRow['id']]['components'] = $components;
                    }
                    else
                    {
                        // ComparisonCheckComponents table doesn't exist
                        return NULL;
                        //return false;
                    }
                }             
       
                return $complianceComponentGroups;              
                //return true;
            }
            else
            {
                // ComparisonCheckGroups table doesn't exist
                return NULL;
                //return false;
            }

            return NULL;
            //return false;
        }

        function readComparisonCheckResults($dbh)
        {
            $comparisonComponentGroups = array();
            // $comparisonComponents = array();
            // $comparisonProperties = array();

            // read components groups
            $checkGroupResults = $dbh->query("SELECT *FROM ComparisonCheckGroups;");
            if($checkGroupResults) 
            {
               
                while ($groupRow = $checkGroupResults->fetch(\PDO::FETCH_ASSOC)) 
                {
                    
                    $comparisonComponentGroups[$groupRow['id']] = array('id'=>$groupRow['id'], 
                                                                  'componentClass'=>$groupRow['componentClass'],  
                                                                  'componentCount'=>$groupRow['componentCount'],
                                                                  'categoryStatus' => $groupRow['categoryStatus']); 
                    
                    $groupId = $groupRow['id'];
                    // read components                                                                  
                    $checkComponentsResults = $dbh->query("SELECT *FROM ComparisonCheckComponents where ownerGroup= $groupId;");
                    if($checkComponentsResults) 
                    {
                        $changedStatus;
                        $components =array();
                        while ($componentRow = $checkComponentsResults->fetch(\PDO::FETCH_ASSOC)) 
                        {
                            if($componentRow['accepted'] == 'true')
                                $changedStatus = 'OK(A)';
                            else 
                                $changedStatus = $componentRow['status'];

                            if($componentRow['transpose'] == 'lefttoright' || $componentRow['transpose'] == 'righttoleft') {
                                $changedStatus = 'OK(T)';
                                // if(!strpos($changedStatus, '(T)')) {
                                //     $changedStatus = $changedStatus . '(T)';
                                // }
                            }

                            $componentValues = array('id'=>$componentRow['id'], 
                                            'sourceAName'=>$componentRow['sourceAName'],  
                                            'sourceBName'=>$componentRow['sourceBName'],
                                            'subComponentClass'=>$componentRow['subComponentClass'],
                                            'status'=>$changedStatus,
                                            'sourceANodeId'=>$componentRow['sourceANodeId'],
                                            'sourceBNodeId'=>$componentRow['sourceBNodeId'],
                                            'ownerGroup'=>$componentRow['ownerGroup'],                                                        
                                            'transpose' => $componentRow['transpose']); 

                            $componentId = $componentRow['id'];

                            $componentStatus = 'OK(T)';
                            $isPropertyStatusOk = true;
                             // read properties                                                                  
                            $checkPropertiesResults = $dbh->query("SELECT *FROM ComparisonCheckProperties where ownerComponent=$componentId;");
                            if($checkPropertiesResults) 
                            {
                                $changedStatus;
                                $properties =array();
                                while ($propertyRow = $checkPropertiesResults->fetch(\PDO::FETCH_ASSOC)) 
                                {
                                    $sourceAValue = $propertyRow['sourceAValue'];
                                    $sourceBValue = $propertyRow['sourceBValue'];
                                    if($propertyRow['accepted'] == 'true')
                                        $changedStatus = 'ACCEPTED';
                                    else 
                                        $changedStatus = $propertyRow['severity'];

                                    if($propertyRow['transpose'] == 'lefttoright') {
                                        $sourceBValue = $sourceAValue;
                                        $changedStatus = 'OK(T)';
                                        if($componentValues['status'] == 'OK(A)')
                                            $componentValues['status'] = 'OK(A)(T)';
                                    }
                                    else if($propertyRow['transpose'] == 'righttoleft') {
                                        $sourceAValue = $sourceBValue;
                                        $changedStatus = 'OK(T)';
                                        if($componentValues['status'] == 'OK(A)')
                                            $componentValues['status'] = 'OK(A)(T)';
                                    }
                                    else {
                                        if(($propertyRow['severity'] == 'Error' || $propertyRow['severity'] == 'No Match') && 
                                        $componentValues['status'] == 'OK(T)') {
                                             if(!strpos($componentRow['status'], '(T)')) {
                                                $componentValues['status'] = $componentRow['status'] . "(T)";
                                             }                                     
                                        }
                                    }
                                    
                                    if($changedStatus !== 'OK(T)' && $changedStatus !== 'OK') {
                                        $isPropertyStatusOk = false;
                                    }
                                    $propertyValues = array('id'=>$propertyRow['id'], 
                                                            'sourceAName'=>$propertyRow['sourceAName'],  
                                                            'sourceBName'=>$propertyRow['sourceBName'],
                                                            'sourceAValue'=>$sourceAValue,
                                                            'sourceBValue'=>$sourceBValue,
                                                            'result'=>$propertyRow['result'],
                                                            'severity'=>$changedStatus,
                                                            'performCheck'=>$propertyRow['performCheck'],
                                                            'description'=>$propertyRow['description'],
                                                            'ownerComponent'=>$propertyRow['ownerComponent'],
                                                            'transpose' => $propertyRow['transpose']); 
                    
                                    array_push($properties, $propertyValues);

                                }
                                if($isPropertyStatusOk == false) {
                                    $componentStatus = $componentValues['status'];
                                }
                                $componentValues['status'] = $componentStatus;
                                $componentValues["properties"] = $properties;
                            }
                            else
                            {
                                // ComparisonCheckProperties table doesn't exist
                                return NULL;
                                //return false;
                            }

                            $components[ $componentId ] =  $componentValues;                           
                        }                      

                        $comparisonComponentGroups[$groupRow['id']]['components'] = $components;
                    }
                    else
                    {
                        // ComparisonCheckComponents table doesn't exist
                        return NULL;
                        //return false;
                    }
                }             
       
               return $comparisonComponentGroups;
               
                //return true;
            }
            else
            {
                // ComparisonCheckGroups table doesn't exist
                return NULL;
                //return false;
            }

            return NULL;
            //return false;
        }

        function readDataSourceInfo() {      
            global $projectName;

            $dbh;
            try
            {        
                // open database
                $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
                $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

                // begin the transaction
                $dbh->beginTransaction();
                
                $results = $dbh->query("SELECT *FROM  DatasourceInfo;");     

                $data = array();
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $data = array('sourceAFileName' => $record['sourceAFileName'], 
                                'sourceBFileName'=> $record['sourceBFileName'], 
                                'sourceAType'=>$record['sourceAType'], 
                                'sourceBType'=>$record['sourceBType'], 
                                'orderMaintained'=>$record['orderMaintained']);                                 
                }

                // commit update
                $dbh->commit();
                $dbh = null; //This is how you close a PDO connection                 
                                
                return  $data;
            }
            catch(Exception $e) 
            {        
                echo "fail"; 
                return;
            } 
        }

        function createHierarchyStructureForComponents() {
            global $sourceAComponents;
            global $sourceBComponents;
            global $sourceAComponentsHierarchy;
            global $sourceBComponentsHierarchy;
            global $comparisonResult;
            global $projectName;
            
            $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // $sourceACompsWithHie=[];
            if($sourceAComponents != null && $comparisonResult != NULL) {
               
                $traversedNodes = [];
                for($index = 1 ; $index <= count($comparisonResult); $index++) {
                    $group = $comparisonResult[$index];
        
                    foreach($group['components'] as $key =>  $value) {
                        $compIndex = $value['id'];
                        $status = $value['status'];
                        $comp = $group['components'][$compIndex];
                        $sourceANodeId = $comp['sourceANodeId'];
                        $comp = traverseRecursively($dbh, $sourceANodeId, $traversedNodes, true);
                        if($comp && !array_key_exists($comp['NodeId'], $sourceAComponentsHierarchy)) {
                            array_push($sourceAComponentsHierarchy, $comp);
                        }
                    }
                }
            }

            $sourceBCompsWithHie=[];
            if($sourceBComponents !== null) {

                $traversedNodes = [];
                for($index = 1 ; $index <= count($comparisonResult); $index++) {
                    $group = $comparisonResult[$index];
        
                    foreach($group['components'] as $key =>  $value) {
                        $compIndex = $value['id'];
                        $status = $value['status'];
                        $comp = $group['components'][$compIndex];
                        $sourceBNodeId = $comp['sourceBNodeId'];
                        $dbh->beginTransaction();
                        $comp = traverseRecursively($dbh, $sourceBNodeId, $traversedNodes, false);
                        $dbh->commit();
                        // echo json_encode($comp);
                        if($comp && !array_key_exists($comp['NodeId'], $sourceBComponentsHierarchy)) {
                            array_push($sourceBComponentsHierarchy, $comp);
                        }
                    }
                }
            }
        }

        function traverseRecursively($dbh, $nodeId, $traversedNodes, $isSourceA)
        {
            global $projectName;

            if($nodeId != null) {
                if($traversedNodes != null) {
                    if(in_array($nodeId, $traversedNodes))
                    {
                        return;
                    }        
                }
               
                array_push($traversedNodes, $nodeId);
    
                $component = [];
                $component["NodeId"] = $nodeId;
                $component["accepted"] = '';
                $component["transpose"] = '';
                $component["Children"] = [];
                $component["Status"] = '';
                if($isSourceA) {
                    $children = $dbh->query("SELECT * FROM  SourceAComponents where parentid =$nodeId"); 
                    $comparisonComponent1 = $dbh->query("SELECT * FROM  ComparisonCheckComponents where sourceANodeId =$nodeId");
                    $comparisonComponent = $comparisonComponent1->fetch(\PDO::FETCH_ASSOC);
                    $component["accepted"] = $comparisonComponent['accepted'];
                    $component["transpose"] = $comparisonComponent['transpose'];
                    $component["Status"] = $comparisonComponent['status'];
                }
                else {
                    $children = $dbh->query("SELECT * FROM  SourceBComponents where parentid =$nodeId"); 
                    $comparisonComponent1 = $dbh->query("SELECT * FROM  ComparisonCheckComponents where sourceBNodeId =$nodeId");
                    $comparisonComponent = $comparisonComponent1->fetch(\PDO::FETCH_ASSOC);
                    $component["accepted"] = $comparisonComponent['accepted'];
                    $component["transpose"] = $comparisonComponent['transpose'];
                    $component["Status"] =  $comparisonComponent['status'];
                }
                
                while ($child = $children->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $childComponent = traverseRecursively($dbh, $child['nodeid'], $traversedNodes, $isSourceA);
                    array_push($component["Children"], $childComponent);
                }

                return $component;                   
            }    
        }
?>