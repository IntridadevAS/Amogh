<?php
        include 'Utility.php';       
        if(!isset($_POST['CheckName']) || !isset($_POST['ProjectName']))
        {
            echo 'fail';
            return;
        }
        
        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];
        // $sourceAComponents = array();
        // $sourceBComponents = array();
        $sourceAComparisonComponentsHierarchy = array();
        $sourceBComparisonComponentsHierarchy = array();
        $sourceAComplianceComponentsHierarchy = array();
        $sourceBComplianceComponentsHierarchy = array();
        $comparisonResult = readComparisonCheckData();

        $sourceAComplianceResult = readComplianceCheckData('SourceAComplianceCheckGroups',
                                                            'SourceAComplianceCheckComponents',
                                                            'SourceAComplianceCheckProperties');

        $sourceBComplianceResult = readComplianceCheckData('SourceBComplianceCheckGroups',
                                                           'SourceBComplianceCheckComponents',
                                                           'SourceBComplianceCheckProperties');

        $data = readDataSourceInfo();
        
       // getSourceComponents();

        // var_dump($sourceBComponents);

        $results = array();
        if($comparisonResult != NULL)
        {
            $results['Comparison'] = $comparisonResult;
            
            // create component hierarchy
            createComparisonComponentsHierarchy();
            if($sourceAComparisonComponentsHierarchy !== null) {
                $results['SourceAComparisonComponentsHierarchy'] = $sourceAComparisonComponentsHierarchy;
            }
            if($sourceBComparisonComponentsHierarchy !== null) {
                $results['SourceBComparisonComponentsHierarchy'] = $sourceBComparisonComponentsHierarchy;
            }
        }
        
        if($sourceAComplianceResult != NULL)
        {
            $results['SourceACompliance'] = $sourceAComplianceResult;
            
             // create component hierarchy
             $sourceAComplianceComponentsHierarchy = createComplianceComponentsHierarchy($sourceAComplianceResult,                                                  
                                                 true);
            if($sourceAComplianceComponentsHierarchy !== null)
            {
                $results['SourceAComplianceComponentsHierarchy'] = $sourceAComplianceComponentsHierarchy;
            }
        }                    

        if($sourceBComplianceResult != NULL)
        {
            $results['SourceBCompliance'] = $sourceBComplianceResult;
            // create component hierarchy
            $sourceBComplianceComponentsHierarchy = createComplianceComponentsHierarchy($sourceBComplianceResult,                                                 
                                                false);
            if($sourceBComplianceComponentsHierarchy !== null)
            {
                $results['SourceBComplianceComponentsHierarchy'] = $sourceBComplianceComponentsHierarchy;
            }
        }        

        echo json_encode($results);
       
        
        function isDataSource3D($sourceExt) {
            $is3D = true;

            $validSources = array("xml","XML","rvm","RVM", "sldasm", "SLDASM","DWG", "dwg", "sldprt", 
            "SLDPRT", "rvt", "rfa", "IFC", "STEP", "STE", "STP", "ifc", "step", "stp", "ste", "IGS", "igs");
               // open database
               if(in_array($sourceExt, $validSources) == false) {
                    $is3D = false;
               }
               return $is3D;
        }

        function readComplianceCheckData($checkGroupTable,
                                         $CheckComponentsTable,
                                         $CheckPropertiesTable)
        {
            global $projectName;           
            global $checkName;
            try
            {   
                // open database
                $dbPath = getCheckDatabasePath($projectName, $checkName);         
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
            global $checkName;
            
            try
            {   
                // open database
                $dbPath = getCheckDatabasePath($projectName, $checkName);
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
                                $changedStatus = 'OK(A)';
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

                            if($componentRow['transpose'] == 'lefttoright' || 
                               $componentRow['transpose'] == 'righttoleft') {
                                $changedStatus = 'OK(T)';
                            }

                            $componentValues = array('id'=>$componentRow['id'], 
                                            'sourceAName'=>$componentRow['sourceAName'],  
                                            'sourceBName'=>$componentRow['sourceBName'],
                                            'subComponentClass'=>$componentRow['subComponentClass'],
                                            'status'=>$changedStatus,
                                            'sourceANodeId'=>$componentRow['sourceANodeId'],
                                            'sourceBNodeId'=>$componentRow['sourceBNodeId'],
                                            'ownerGroup'=>$componentRow['ownerGroup'],                                                        
                                            'transpose' => $componentRow['transpose'],
                                            'accepted' => $componentRow['accepted']); 

                            $componentId = $componentRow['id'];

                            $componentStatus = 'OK';
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
                                        else {
                                            $changedStatus = $propertyRow['severity'];
                                            if(($propertyRow['severity'] == 'Error' || $propertyRow['severity'] == 'No Match') && $componentValues['status'] == 'OK(A)' && $propertyRow['transpose'] == null) {
                                                $componentValues['status'] = $componentRow['status'];
                                            }
                                        }
                                    
                                    
                                        
                                    if($propertyRow['transpose'] == 'lefttoright') {
                                        // $sourceBValue = $sourceAValue;
                                        $changedStatus = 'OK(T)';
                                        if($componentValues['status'] == 'OK(A)')
                                            $componentValues['status'] = 'OK(A)(T)';
                                    }
                                    else if($propertyRow['transpose'] == 'righttoleft') {
                                        // $sourceAValue = $sourceBValue;
                                        $changedStatus = 'OK(T)';
                                        if($componentValues['status'] == 'OK(A)')
                                            $componentValues['status'] = 'OK(A)(T)';
                                    }
                                    else {
                                        if(($propertyRow['severity'] == 'Error' || $propertyRow['severity'] == 'No Match') && 
                                        ($componentValues['status'] == 'OK(T)' || $componentValues['status'] == 'OK(A)(T)')) {
                                            if($propertyRow['accepted'] == 'true') {
                                                $componentValues['status'] = 'OK(A)(T)';
                                            }
                                            else if(!strpos($componentRow['status'], '(T)')) {
                                                $componentValues['status'] = $componentRow['status'] . "(T)";
                                            } 
                                            else if(($propertyRow['accepted'] == 'false') && ($componentValues['status'] == 'OK(T)' || $componentValues['status'] == 'OK(A)(T)'))  {
                                                    $componentValues['status'] = $componentRow['status'] ;        
                                            }   
                                        }
                                    }
                                    
                                    if($changedStatus !== 'OK(T)' && $changedStatus !== 'OK') {
                                        $isPropertyStatusOk = false;
                                    }
                                    else {
                                        if($changedStatus == 'OK(T)') {  $componentStatus = 'OK(T)'; }
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
            global $checkName;
            $dbh;
            try
            {        
                // open database
                $dbPath = getCheckDatabasePath($projectName, $checkName);

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

        function createComparisonComponentsHierarchy() {       
            global $sourceAComparisonComponentsHierarchy;
            global $sourceBComparisonComponentsHierarchy;
            global $comparisonResult;
            global $projectName;
            global $checkName;
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            $dbh->beginTransaction();           

            if($comparisonResult != NULL)
            {                
                    $traversedNodes = [];
                    for($index = 1 ; $index <= count($comparisonResult); $index++) {
                        $group = $comparisonResult[$index];
                    
                        foreach($group['components'] as $key =>  $value) {                     
                        
                            // $compIndex = $value['id'];
                            $status = $value['status'];                           
                            $sourceANodeId = $value['sourceANodeId'];                          

                            $comp = traverseRecursivelyForComparison($dbh, $sourceANodeId, $traversedNodes, true);
                            
                            if($comp !== NULL && 
                               !array_key_exists($comp['NodeId'], $sourceAComparisonComponentsHierarchy)) {
                            
                                array_push($sourceAComparisonComponentsHierarchy, $comp);
                            }
                        }
                    }
               
                    $traversedNodes = [];
                    for($index = 1 ; $index <= count($comparisonResult); $index++) {
                        $group = $comparisonResult[$index];
            
                        foreach($group['components'] as $key =>  $value) {
                            // $compIndex = $value['id'];
                            $status = $value['status'];                            
                            $sourceBNodeId = $value['sourceBNodeId'];                        
                     
                            $comp = traverseRecursivelyForComparison($dbh, $sourceBNodeId, $traversedNodes, false);                     
                                         
                            if($comp !== NULL && 
                               !array_key_exists($comp['NodeId'], $sourceBComparisonComponentsHierarchy)) {
                                array_push($sourceBComparisonComponentsHierarchy, $comp);
                            }
                        }
                    }
                }          

            $dbh->commit();
        }

        function traverseRecursivelyForComparison($dbh, 
                                     $nodeId, 
                                     &$traversedNodes, 
                                     $isSourceA)
        {
            global $projectName;

            if($nodeId == null)
            {
                return NULL;
            }
            if($traversedNodes != null &&
               in_array($nodeId, $traversedNodes))
            {               
                return NULL;
            }              
            array_push($traversedNodes, $nodeId);           

            $component = [];
            $component["NodeId"] = $nodeId;
            $component["accepted"] = '';
            $component["transpose"] = '';
            $component["Children"] = [];
            $component["Status"] = '';
            
            $componentsTable = NULL;
            $nodeIdAttribute = NULL;
            if($isSourceA) {
                $componentsTable = "SourceAComponents";
                $nodeIdAttribute ="sourceANodeId";
            }
            else {
                $componentsTable = "SourceBComponents";
                $nodeIdAttribute ="sourceBNodeId";                    
            }

            // read component main class and subclass
            $compStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where nodeid =$nodeId"); 
            $compRow = $compStmt->fetch(\PDO::FETCH_ASSOC);
            $component["MainClass"] = $compRow['mainclass'];
            $component["SubClass"] = $compRow['subclass'];

            // read an additional info
            $stmt = $dbh->query("SELECT * FROM  ComparisonCheckComponents where ".$nodeIdAttribute." =$nodeId");
            $comparisonComponentRow = $stmt->fetch(\PDO::FETCH_ASSOC);            
            if(!$comparisonComponentRow)
            {
                return NULL;
            }

            $component["accepted"] = $comparisonComponentRow['accepted'];
            $component["transpose"] = $comparisonComponentRow['transpose'];
            $component["Status"] =  $comparisonComponentRow['status'];

            $childrenStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where parentid =$nodeId"); 
            while ($childRow = $childrenStmt->fetch(\PDO::FETCH_ASSOC)) 
            {               
                $childComponent = traverseRecursivelyForComparison($dbh, $childRow['nodeid'], $traversedNodes, $isSourceA);

                if($childComponent !== NULL)
                {
                    array_push($component["Children"], $childComponent);
                }
            }

            return $component;                   
        }    

        function createComplianceComponentsHierarchy($complianceResult,                                                     
                                                     $isSourceA)
        {            
            //global $sourceAComplianceComponentsHierarchy;
            global $projectName;            
            global $checkName;
            if($complianceResult === NULL)
            { 
                return;
            }
            $componentsHierarchy =  array();
            try
            {   
                // open database
                $dbPath = getCheckDatabasePath($projectName, $checkName);            
                $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
   
                // begin the transaction
                $dbh->beginTransaction();

                $traversedNodes = [];
                for($index = 1 ; $index <= count($complianceResult); $index++) {
                    $group = $complianceResult[$index];

                    foreach($group['components'] as $key =>  $value) {
                        $status = $value['status'];                           
                        $nodeId = $value['nodeId'];   

                        $comp = traverseRecursivelyForCompliance($dbh, 
                                                                 $nodeId, 
                                                                 $traversedNodes, 
                                                                 $isSourceA); 
                                                                 
                        if($comp !== NULL && 
                        !array_key_exists($comp['NodeId'], $componentsHierarchy)) 
                        {                    
                            array_push($componentsHierarchy, $comp);
                        }
                    }
                }

                // commit update
                $dbh->commit();
                $dbh = null; //This is how you close a PDO connection

                return  $componentsHierarchy;
            }                
            catch(Exception $e) 
            {        
                echo "fail"; 
                return NULL;
            }    
        }
        
        function traverseRecursivelyForCompliance($dbh, 
                                                    $nodeId, 
                                                    &$traversedNodes, 
                                                    $isSourceA)
        {
            global $projectName;
            global $checkName;
            if($nodeId == null)
            {
                return NULL;
            }
            if($traversedNodes != null &&
               in_array($nodeId, $traversedNodes))
            {               
                return NULL;
            }              
            array_push($traversedNodes, $nodeId);           

            $component = [];
            $component["NodeId"] = $nodeId;
            $component["accepted"] = '';         
            $component["Children"] = [];
            $component["Status"] = '';
            
            $componentsTable = NULL;
            $nodeIdAttribute = NULL;
            if($isSourceA) {
                $componentsTable = "SourceAComponents";      
                $complianceComponentsTable = "SourceAComplianceCheckComponents";     
            }
            else {
                $componentsTable = "SourceBComponents";                         
                $complianceComponentsTable = "SourceBComplianceCheckComponents";        
            }

            // read component main class and subclass
            $compStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where nodeid =$nodeId"); 
            $compRow = $compStmt->fetch(\PDO::FETCH_ASSOC);
            $component["MainClass"] = $compRow['mainclass'];
            $component["SubClass"] = $compRow['subclass'];

            // read an additional info
            $stmt = $dbh->query("SELECT * FROM  ".$complianceComponentsTable." where nodeId =$nodeId");
            $complianceComponentRow = $stmt->fetch(\PDO::FETCH_ASSOC);            
            if(!$complianceComponentRow)
            {
                return NULL;
            }
            $component["accepted"] = $complianceComponentRow['accepted'];           
            $component["Status"] =  $complianceComponentRow['status'];

            $childrenStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where parentid =$nodeId"); 
            while ($childRow = $childrenStmt->fetch(\PDO::FETCH_ASSOC)) 
            {               
                $childComponent = traverseRecursivelyForCompliance($dbh, $childRow['nodeid'], $traversedNodes, $isSourceA);

                if($childComponent !== NULL)
                {
                    array_push($component["Children"], $childComponent);
                }
            }

            return $component;                   
        } 
?>