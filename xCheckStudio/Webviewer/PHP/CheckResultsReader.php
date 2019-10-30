<?php
        include 'Utility.php';       
        if(!isset($_POST['CheckName']) || !isset($_POST['ProjectName']))
        {
            echo 'fail';
            return;
        }
        
        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];
      
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

        $results = array();

        $datasourceInfo = readDataSourceInfo();
        if($datasourceInfo != NULL)
        {
            $results['sourceInfo'] = $datasourceInfo;
        }
       // getSourceComponents();

        // var_dump($sourceBComponents);
        // source A components
        $sourceAComponents = readComponents("a");
        if($sourceAComponents)
        {
            $results['sourceAComponents'] = $sourceAComponents;
        }

        // source b components
        $sourceBComponents = readComponents("b");  
        if($sourceBComponents)
        {
            $results['sourceBComponents'] = $sourceBComponents;
        }   
               
        if($comparisonResult != NULL)
        {            
            //$results['Comparison'] = $comparisonResult;
            $results['Comparisons'] = array();
            $comparison = array();
            $comparison["sources"] = array($datasourceInfo["sourceAFileName"],$datasourceInfo["sourceBFileName"]);
            $comparison["results"] = $comparisonResult;
            array_push($results['Comparisons'], $comparison);

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
            if(! array_key_exists("Compliances", $results))
            {
                $results['Compliances'] = array();
            }

            $compliance = array();
            $compliance["source"] = $datasourceInfo["sourceAFileName"];
            $compliance["results"] = $sourceAComplianceResult;            
            
             // create component hierarchy
             $sourceAComplianceComponentsHierarchy = createComplianceComponentsHierarchy($sourceAComplianceResult,                                                  
                                                 true);
            if($sourceAComplianceComponentsHierarchy !== null)
            {               
                $compliance['ComponentsHierarchy'] = $sourceAComplianceComponentsHierarchy;
            }

            array_push($results['Compliances'], $compliance);
        }                    

        if($sourceBComplianceResult != NULL)
        {
            if(! array_key_exists("Compliances", $results))
            {
                $results['Compliances'] = array();
            }

            $compliance = array();
            $compliance["source"] = $datasourceInfo["sourceBFileName"];
            $compliance["results"] = $sourceBComplianceResult;

            // $results['SourceBCompliance'] = $sourceBComplianceResult;
            // create component hierarchy
            $sourceBComplianceComponentsHierarchy = createComplianceComponentsHierarchy($sourceBComplianceResult,                                                 
                                                false);
            if($sourceBComplianceComponentsHierarchy !== null)
            {
                // $results['SourceBComplianceComponentsHierarchy'] = $sourceBComplianceComponentsHierarchy;
                $compliance['ComponentsHierarchy'] = $sourceBComplianceComponentsHierarchy;
            }

            array_push($results['Compliances'], $compliance);
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
                                            'sourceId'=>$componentRow['sourceId'],
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
                                            'sourceASubComponentClass'=>$componentRow['sourceASubComponentClass'],
                                            'sourceBSubComponentClass'=>$componentRow['sourceBSubComponentClass'],
                                            'status'=>$changedStatus,
                                            'sourceANodeId'=>$componentRow['sourceANodeId'],
                                            'sourceBNodeId'=>$componentRow['sourceBNodeId'],
                                            'sourceAId'=>$componentRow['sourceAId'],
                                            'sourceBId'=>$componentRow['sourceBId'],
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
                                    
                                        
                                    if($propertyRow['transpose'] == 'lefttoright' || $propertyRow['transpose'] == 'righttoleft') {
                                        $changedStatus = 'OK(T)';
                                        if($componentValues['status'] == 'OK(A)') {
                                            $componentValues['status'] = 'OK(A)(T)';
                                        }
                                        else if(strpos($componentValues['status'], '(T)') == false) {
                                            $componentValues['status'] =  $componentRow['status'] . "(T)";
                                        }
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
            global $datasourceInfo;

            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            $dbh->beginTransaction();           

            if($comparisonResult != NULL)
            {                
                    
                    if(isDataSource3D($datasourceInfo["sourceAType"]))
                    {
                        $traversedNodes = [];
                        for($index = 1 ; $index <= count($comparisonResult); $index++) {
                            $group = $comparisonResult[$index];
                        
                            foreach($group['components'] as $key =>  $value) {                     
                            
                                // $compIndex = $value['id'];
                                $status = $value['status'];                           
                                $sourceANodeId = $value['sourceANodeId'];                          

                                $comp = traverseRecursivelyFor3DComparison($dbh, $sourceANodeId, $traversedNodes, true);
                                
                                if($comp !== NULL && 
                                !array_key_exists($comp['NodeId'], $sourceAComparisonComponentsHierarchy)) {                                
                                    $sourceAComparisonComponentsHierarchy[$comp['NodeId']] = $comp;                                
                                }
                            }
                        }
                    }
                    else
                    {
                        // 1D data source                       
                        $sourceAComparisonComponentsHierarchy  = traverseRecursivelyFor1DComparison($dbh, true);
                        
                    }
                
                    if(isDataSource3D($datasourceInfo["sourceBType"]))
                    {
                        $traversedNodes = [];
                        for($index = 1 ; $index <= count($comparisonResult); $index++) {
                            $group = $comparisonResult[$index];
                
                            foreach($group['components'] as $key =>  $value) {                           
                                $status = $value['status'];                            
                                $sourceBNodeId = $value['sourceBNodeId'];

                                $comp = traverseRecursivelyFor3DComparison($dbh, $sourceBNodeId, $traversedNodes, false);                     
                            
                                if($comp !== NULL && 
                                !array_key_exists($comp['NodeId'], $sourceBComparisonComponentsHierarchy)) {                                
                                    $sourceBComparisonComponentsHierarchy[$comp['NodeId']] = $comp;                                
                                }
                            }
                        }
                    }
                    else
                    {
                        // 1D data source
                        $sourceBComparisonComponentsHierarchy  = traverseRecursivelyFor1DComparison($dbh, false);
                    }                
                }          

            $dbh->commit();
        }

        function traverseRecursivelyFor1DComparison($dbh,                                                                         
                                     $isSourceA)
        {  
            $componentsTable = NULL;
            $idAttribute = NULL;            
            if($isSourceA) {
                $componentsTable = "SourceAComponents";      
                $idAttribute = "sourceAId";        
            }
            else {
                $componentsTable = "SourceBComponents";                               
                $idAttribute = "sourceBId";
            }

            // read component main class and subclass
            $components = [];

            $compStmt = $dbh->query("SELECT * FROM  ".$componentsTable); 
            if($compStmt) 
            {               
                while ($compRow = $compStmt->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $component = array();  
                    $component["Id"] = $compRow['id'];
                    $component["Name"] = $compRow['name'];
                    $component["MainClass"] = $compRow['mainclass'];
                    $component["SubClass"] = $compRow['subclass'];       
                    
                     // read an additional info
                    $stmt = $dbh->query("SELECT * FROM  ComparisonCheckComponents where ".$idAttribute." = ". $component['Id']);
                    $comparisonComponentRow = $stmt->fetch(\PDO::FETCH_ASSOC);            
                    if(!$comparisonComponentRow)
                    {
                        $component["ResultId"] =  NULL;
                        $component["GroupId"]  = NULL;
                        $component["accepted"] = NULL;
                        $component["transpose"] = NULL;
                        $component["Status"] =  "Not Checked";
                    }
                    else
                    {
                        $component["ResultId"] =  $comparisonComponentRow['id'];
                        $component["GroupId"]  = $comparisonComponentRow['ownerGroup'];
                        $component["accepted"] = $comparisonComponentRow['accepted'];
                        $component["transpose"] = $comparisonComponentRow['transpose'];
                        $component["Status"] =  $comparisonComponentRow['status'];
                    }

                    $components[$compRow['id']] = $component;
                }
            }     
            
            return $components;
        }

        function traverseRecursivelyFor3DComparison($dbh, 
                                     $nodeId, 
                                     &$traversedNodes, 
                                     $isSourceA)
        {      
            // global $projectName;

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
            $component["Name"] = $compRow['name'];
            $component["MainClass"] = $compRow['mainclass'];
            $component["SubClass"] = $compRow['subclass'];

            // read an additional info
            $stmt = $dbh->query("SELECT * FROM  ComparisonCheckComponents where ".$nodeIdAttribute." =$nodeId");
            $comparisonComponentRow = $stmt->fetch(\PDO::FETCH_ASSOC);            
            if(!$comparisonComponentRow)
            {
                $component["Id"] =  NULL;
                $component["GroupId"]  = NULL;
                $component["accepted"] = NULL;
                $component["transpose"] = NULL;
                $component["Status"] =  "Not Checked";
            }
            else
            {
                $component["Id"] =  $comparisonComponentRow['id'];
                $component["GroupId"]  = $comparisonComponentRow['ownerGroup'];
                $component["accepted"] = $comparisonComponentRow['accepted'];
                $component["transpose"] = $comparisonComponentRow['transpose'];
                $component["Status"] =  $comparisonComponentRow['status'];
            }

            // traverse child if any
            $childrenStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where parentid =$nodeId"); 
            while ($childRow = $childrenStmt->fetch(\PDO::FETCH_ASSOC)) 
            {               
                $childComponent = traverseRecursivelyFor3DComparison($dbh, $childRow['nodeid'], $traversedNodes, $isSourceA);

                if($childComponent !== NULL)
                {
                    array_push($component["Children"], $childComponent);
                }
            }          
           
            // traverse parent, if any
            $parentComponent = NULL;
            $parentNode = $compRow['parentid'];
            $parentStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where nodeid =".$parentNode);
           
            while ($parentRow = $parentStmt->fetch(\PDO::FETCH_ASSOC)) 
            {    
                $parentComponent = traverseRecursivelyFor3DComparison($dbh, $parentRow['nodeid'], $traversedNodes, $isSourceA);

                if($parentComponent !== NULL)
                {
                    array_push($parentComponent["Children"], $component);
                }
                
                break;
            }

            if($parentComponent != NULL)
            {
                return $parentComponent;
            }

            return $component;                   
        }    

        function createComplianceComponentsHierarchy($complianceResult,                                                     
                                                     $isSourceA)
        {            
            //global $sourceAComplianceComponentsHierarchy;
            global $projectName;            
            global $checkName;
            global $datasourceInfo;

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

                if(($isSourceA && isDataSource3D($datasourceInfo["sourceAType"])) || 
                  (!$isSourceA && isDataSource3D($datasourceInfo["sourceBType"])))
                {                   
                    $traversedNodes = [];
                    for($index = 1 ; $index <= count($complianceResult); $index++) {
                        $group = $complianceResult[$index];

                        foreach($group['components'] as $key =>  $value) {
                            $status = $value['status'];                           
                            $nodeId = $value['nodeId'];   

                            $comp = traverseRecursivelyFor3DCompliance($dbh, 
                                                                    $nodeId, 
                                                                    $traversedNodes, 
                                                                    $isSourceA); 
                                                                    
                            if($comp !== NULL && 
                            !array_key_exists($comp['NodeId'], $componentsHierarchy)) 
                            {   
                                $componentsHierarchy[$comp['NodeId']] =  $comp;          
                            
                            }
                        }
                    }
                }
                else
                {
                    // 1D data source
                    $componentsHierarchy = traverseRecursivelyFor1DCompliance($dbh, $isSourceA);
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
        
        function traverseRecursivelyFor1DCompliance($dbh,                                                                         
                                     $isSourceA)
        {  
            $componentsTable = NULL;
            $complianceComponentsTable = NULL;
            $idAttribute = "sourceId";            
            if($isSourceA) {
                $componentsTable = "SourceAComponents";      
                $complianceComponentsTable = "SourceAComplianceCheckComponents";     
            }
            else {
                $componentsTable = "SourceBComponents";
                $complianceComponentsTable = "SourceBComplianceCheckComponents";     
            }

            // read component main class and subclass
            $components = [];

            $compStmt = $dbh->query("SELECT * FROM  ".$componentsTable); 
            if($compStmt) 
            {               
                while ($compRow = $compStmt->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $component = array();  
                    $component["Id"] = $compRow['id'];
                    $component["Name"] = $compRow['name'];
                    $component["MainClass"] = $compRow['mainclass'];
                    $component["SubClass"] = $compRow['subclass'];       
                    
                     // read an additional info
                    $stmt = $dbh->query("SELECT * FROM  ".$complianceComponentsTable." where ".$idAttribute." = ". $component['Id']);
                    $complianceComponentRow = $stmt->fetch(\PDO::FETCH_ASSOC);            
                    if(!$complianceComponentRow)
                    {
                        $component["ResultId"] =  NULL;
                        $component["GroupId"]  = NULL;
                        $component["accepted"] = NULL;                        
                        $component["Status"] =  "Not Checked";
                    }
                    else
                    {
                        $component["ResultId"] =  $complianceComponentRow['id'];
                        $component["GroupId"]  = $complianceComponentRow['ownerGroup'];
                        $component["accepted"] = $complianceComponentRow['accepted'];                        
                        $component["Status"] =  $complianceComponentRow['status'];
                    }

                    $components[$compRow['id']] = $component;
                }
            }     
            
            return $components;
        }

        function traverseRecursivelyFor3DCompliance($dbh, 
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
            $component["Name"] = $compRow['name'];
            $component["MainClass"] = $compRow['mainclass'];
            $component["SubClass"] = $compRow['subclass'];

            // read an additional info
            $stmt = $dbh->query("SELECT * FROM  ".$complianceComponentsTable." where nodeId =$nodeId");
            $complianceComponentRow = $stmt->fetch(\PDO::FETCH_ASSOC);            
            if(!$complianceComponentRow)
            {
                $component["accepted"] = NULL;
                $component["Status"] =  "Not Checked";
            }
            else
            {
                $component["Id"] =  $complianceComponentRow['id'];
                $component["GroupId"]  = $complianceComponentRow['ownerGroup'];
                $component["CompId"] =  $complianceComponentRow['sourceId'];
                $component["accepted"] = $complianceComponentRow['accepted'];           
                $component["Status"] =  $complianceComponentRow['status'];
            }
            // traverse children, if any
            $childrenStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where parentid =$nodeId"); 
            while ($childRow = $childrenStmt->fetch(\PDO::FETCH_ASSOC)) 
            {               
                $childComponent = traverseRecursivelyFor3DCompliance($dbh, $childRow['nodeid'], $traversedNodes, $isSourceA);

                if($childComponent !== NULL)
                {
                    array_push($component["Children"], $childComponent);
                }
            }

            // traverse parent, if any
            $parentComponent = NULL;
            $parentNode = $compRow['parentid'];
            $parentStmt = $dbh->query("SELECT * FROM  ".$componentsTable." where nodeid =".$parentNode);
            
            while ($parentRow = $parentStmt->fetch(\PDO::FETCH_ASSOC)) 
            {    
                $parentComponent = traverseRecursivelyFor3DCompliance($dbh, $parentRow['nodeid'], $traversedNodes, $isSourceA);

                if($parentComponent !== NULL)
                {
                    array_push($parentComponent["Children"], $component);
                }
                
                break;
            }

            if($parentComponent != NULL)
            {
                return $parentComponent;
            }

            return $component;                   
        } 

        function readComponents($source)
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

                if($source === "a") {
                    $componentsTable = "SourceAComponents";                   
                }
                else if($source === "b") {
                    $componentsTable = "SourceBComponents";                       
                }
                else if($source === "c") {                             
                }
                else if($source === "d") {                    
                }
    
                // read component main class and subclass
                $compStmt = $dbh->query("SELECT * FROM  ".$componentsTable.";"); 
                $result = null;
                if($compStmt)
                {
                    $result = $compStmt->fetchAll(PDO::FETCH_ASSOC);
                }
                
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
?>