<?php
        include 'Utility.php';       
        if(!isset($_POST['CheckName']) || 
           !isset($_POST['ProjectName']))
        {
            echo 'fail';
            return;
        }
        
        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];
      
        $sourceAComparisonComponentsHierarchy = array();
        $sourceBComparisonComponentsHierarchy = array(); 
        $sourceCComparisonComponentsHierarchy = array();
        $sourceDComparisonComponentsHierarchy = array();        
        
        $comparisonResult = readComparisonCheckData();

        $sourceAComplianceResult = readComplianceCheckData('SourceAComplianceCheckGroups',
                                                            'SourceAComplianceCheckComponents',
                                                            'SourceAComplianceCheckProperties');

        $sourceBComplianceResult = readComplianceCheckData('SourceBComplianceCheckGroups',
                                                           'SourceBComplianceCheckComponents',
                                                           'SourceBComplianceCheckProperties');

        $sourceCComplianceResult = readComplianceCheckData('SourceCComplianceCheckGroups',
                                                           'SourceCComplianceCheckComponents',
                                                           'SourceCComplianceCheckProperties');

        $sourceDComplianceResult = readComplianceCheckData('SourceDComplianceCheckGroups',
                                                           'SourceDComplianceCheckComponents',
                                                           'SourceDComplianceCheckProperties');

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

        // source c components
        $sourceCComponents = readComponents("c");  
        if($sourceCComponents)
        {
            $results['sourceCComponents'] = $sourceCComponents;
        }   

        // source c components
        $sourceDComponents = readComponents("d");  
        if($sourceDComponents)
        {
            $results['sourceDComponents'] = $sourceDComponents;
        }   
               
        if($comparisonResult != NULL)
        {            
            //$results['Comparison'] = $comparisonResult;
            $results['Comparisons'] = array();
            $comparison = array();
            $comparison["sources"] = array($datasourceInfo["sourceAFileName"], $datasourceInfo["sourceBFileName"]);
            
            if($datasourceInfo["sourceCFileName"] !== NULL)
            {
                array_push($comparison["sources"], $datasourceInfo["sourceCFileName"]);
            }
            if($datasourceInfo["sourceDFileName"] !== NULL)
            {
                array_push($comparison["sources"], $datasourceInfo["sourceDFileName"]);
            }
            
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
            if($sourceCComparisonComponentsHierarchy !== null) {
                $results['SourceCComparisonComponentsHierarchy'] = $sourceCComparisonComponentsHierarchy;
            }
            if($sourceDComparisonComponentsHierarchy !== null) {
                $results['SourceDComparisonComponentsHierarchy'] = $sourceDComparisonComponentsHierarchy;
            }
        }   

        // source a compliance
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
                                                 "a");
            if($sourceAComplianceComponentsHierarchy !== null)
            {               
                $compliance['ComponentsHierarchy'] = $sourceAComplianceComponentsHierarchy;
            }

            array_push($results['Compliances'], $compliance);
        }                    

        // source b compliance
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
                                                "b");
            if($sourceBComplianceComponentsHierarchy !== null)
            {                
                $compliance['ComponentsHierarchy'] = $sourceBComplianceComponentsHierarchy;
            }

            array_push($results['Compliances'], $compliance);
        }  
        
        // source c compliance
        if($sourceCComplianceResult != NULL)
        {
            if(! array_key_exists("Compliances", $results))
            {
                $results['Compliances'] = array();
            }

            $compliance = array();
            $compliance["source"] = $datasourceInfo["sourceCFileName"];
            $compliance["results"] = $sourceCComplianceResult;
         
            // create component hierarchy
            $sourceCComplianceComponentsHierarchy = createComplianceComponentsHierarchy($sourceCComplianceResult,                                                 
                                                "c");
            if($sourceCComplianceComponentsHierarchy !== null)
            {                
                $compliance['ComponentsHierarchy'] = $sourceCComplianceComponentsHierarchy;
            }

            array_push($results['Compliances'], $compliance);
        }

        // source d compliance
        if($sourceDComplianceResult != NULL)
        {
            if(! array_key_exists("Compliances", $results))
            {
                $results['Compliances'] = array();
            }

            $compliance = array();
            $compliance["source"] = $datasourceInfo["sourceDFileName"];
            $compliance["results"] = $sourceDComplianceResult;
         
            // create component hierarchy
            $sourceDComplianceComponentsHierarchy = createComplianceComponentsHierarchy($sourceDComplianceResult,                                                 
                                                "d");
            if($sourceDComplianceComponentsHierarchy !== null)
            {                
                $compliance['ComponentsHierarchy'] = $sourceDComplianceComponentsHierarchy;
            }

            array_push($results['Compliances'], $compliance);
        }

        // read checkcase info
        $checkcaseInfo = readCheckCaseInfo();
        $results['checkcaseInfo'] = $checkcaseInfo;

        echo json_encode($results);
       
        
        function readCheckCaseInfo()
        {      
            global $projectName;
            global $checkName;
            $dbh;
            try
            {        
                // open database
                $dbPath = getCheckDatabasePath($projectName, $checkName);
                if(CheckIfFileExists($dbPath) === false){
                    echo "fail"; 
                    return;
                }
                $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

                // begin the transaction
                $dbh->beginTransaction();
                
                $results = $dbh->query("SELECT *FROM CheckCaseInfo;");     

                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
                {
                    return array('checkCaseData' => $record['checkCaseData']);                                 
                }

                // commit update
                $dbh->commit();
                $dbh = null; //This is how you close a PDO connection                 
                                
                return;
            }
            catch(Exception $e) 
            {        
                echo "fail"; 
                return;
            } 
        }

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
                                            'ownerGroup'=>$componentRow['ownerGroup'],
                                            'accepted' => $componentRow['accepted']);                                                         

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
                                                            'ownerComponent'=>$propertyRow['ownerComponent'],
                                                            'rule'=>$propertyRow['rule']); 
                    
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

                            $componentValues = array('id'=> $componentRow['id'], 
                                            'sourceAName'=> $componentRow['sourceAName'],  
                                            'sourceBName'=> $componentRow['sourceBName'],
                                            'sourceCName'=> $componentRow['sourceCName'],  
                                            'sourceDName'=> $componentRow['sourceDName'],
                                            'sourceAMainClass'=> $componentRow['sourceAMainClass'],  
                                            'sourceBMainClass'=> $componentRow['sourceBMainClass'],
                                            'sourceCMainClass'=> $componentRow['sourceCMainClass'],  
                                            'sourceDMainClass'=> $componentRow['sourceDMainClass'],
                                            'sourceASubComponentClass'=>$componentRow['sourceASubComponentClass'],
                                            'sourceBSubComponentClass'=>$componentRow['sourceBSubComponentClass'],
                                            'sourceCSubComponentClass'=>$componentRow['sourceCSubComponentClass'],
                                            'sourceDSubComponentClass'=>$componentRow['sourceDSubComponentClass'],
                                            'status'=>$changedStatus,
                                            'sourceANodeId'=>$componentRow['sourceANodeId'],
                                            'sourceBNodeId'=>$componentRow['sourceBNodeId'],
                                            'sourceCNodeId'=>$componentRow['sourceCNodeId'],
                                            'sourceDNodeId'=>$componentRow['sourceDNodeId'],
                                            'sourceAId'=>$componentRow['sourceAId'],
                                            'sourceBId'=>$componentRow['sourceBId'],
                                            'sourceCId'=>$componentRow['sourceCId'],
                                            'sourceDId'=>$componentRow['sourceDId'],
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
                                                            'sourceCName'=>$propertyRow['sourceCName'],  
                                                            'sourceDName'=>$propertyRow['sourceDName'],
                                                            'sourceAValue'=>$sourceAValue,
                                                            'sourceBValue'=>$sourceBValue,
                                                            'sourceCValue'=>$propertyRow['sourceCValue'],  
                                                            'sourceDValue'=>$propertyRow['sourceDValue'],
                                                            'result'=>$propertyRow['result'],
                                                            'severity'=>$changedStatus,
                                                            'performCheck'=>$propertyRow['performCheck'],
                                                            'description'=>$propertyRow['description'],
                                                            'ownerComponent'=>$propertyRow['ownerComponent'],
                                                            'transpose' => $propertyRow['transpose'],
                                                            'accepted' => $propertyRow['accepted']); 
                    
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
                                'sourceCFileName' => $record['sourceCFileName'], 
                                'sourceDFileName'=> $record['sourceDFileName'],
                                'sourceAType'=>$record['sourceAType'], 
                                'sourceBType'=>$record['sourceBType'], 
                                'sourceCType'=>$record['sourceCType'], 
                                'sourceDType'=>$record['sourceDType'], 
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
            global $sourceCComparisonComponentsHierarchy;
            global $sourceDComparisonComponentsHierarchy;

            global $comparisonResult;
            global $projectName;
            global $checkName;         
            global $datasourceInfo;

            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            $dbh->beginTransaction();           

            if($comparisonResult != NULL)
            {                
                    
                    // source A
                    if(isDataSource3D($datasourceInfo["sourceAType"]))
                    {
                        $traversedNodes = [];
                        for($index = 1 ; $index <= count($comparisonResult); $index++) {
                            $group = $comparisonResult[$index];
                        
                            foreach($group['components'] as $key =>  $value) {                     
                            
                                // $compIndex = $value['id'];
                                $status = $value['status'];                           
                                $sourceANodeId = $value['sourceANodeId'];                          

                                $comp = traverseRecursivelyFor3DComparison($dbh, $sourceANodeId, $traversedNodes, "a");
                                
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
                        $sourceAComparisonComponentsHierarchy  = traverseRecursivelyFor1DComparison($dbh, "a");
                        
                    }
                
                    // source B
                    if(isDataSource3D($datasourceInfo["sourceBType"]))
                    {
                        $traversedNodes = [];
                        for($index = 1 ; $index <= count($comparisonResult); $index++) {
                            $group = $comparisonResult[$index];
                
                            foreach($group['components'] as $key =>  $value) {                           
                                $status = $value['status'];                            
                                $sourceBNodeId = $value['sourceBNodeId'];

                                $comp = traverseRecursivelyFor3DComparison($dbh, $sourceBNodeId, $traversedNodes, "b");                     
                            
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
                        $sourceBComparisonComponentsHierarchy  = traverseRecursivelyFor1DComparison($dbh, "b");
                    }      
                    
                     // source C
                     if(isDataSource3D($datasourceInfo["sourceCType"]))
                     {
                         $traversedNodes = [];
                         for($index = 1 ; $index <= count($comparisonResult); $index++) {
                             $group = $comparisonResult[$index];
                 
                             foreach($group['components'] as $key =>  $value) {                           
                                 $status = $value['status'];                            
                                 $sourceCNodeId = $value['sourceCNodeId'];
 
                                 $comp = traverseRecursivelyFor3DComparison($dbh, $sourceCNodeId, $traversedNodes, "c");                     
                             
                                 if($comp !== NULL && 
                                 !array_key_exists($comp['NodeId'], $sourceCComparisonComponentsHierarchy)) {                                
                                     $sourceCComparisonComponentsHierarchy[$comp['NodeId']] = $comp;                                
                                 }
                             }
                         }
                     }
                     else
                     {
                         // 1D data source
                         $sourceCComparisonComponentsHierarchy  = traverseRecursivelyFor1DComparison($dbh, "c");
                     } 

                      // source D
                    if(isDataSource3D($datasourceInfo["sourceDType"]))
                    {
                        $traversedNodes = [];
                        for($index = 1 ; $index <= count($comparisonResult); $index++) {
                            $group = $comparisonResult[$index];
                
                            foreach($group['components'] as $key =>  $value) {                           
                                $status = $value['status'];                            
                                $sourceDNodeId = $value['sourceDNodeId'];

                                $comp = traverseRecursivelyFor3DComparison($dbh, $sourceDNodeId, $traversedNodes, "d");                     
                            
                                if($comp !== NULL && 
                                !array_key_exists($comp['NodeId'], $sourceDComparisonComponentsHierarchy)) {                                
                                    $sourceDComparisonComponentsHierarchy[$comp['NodeId']] = $comp;                                
                                }
                            }
                        }
                    }
                    else
                    {
                        // 1D data source
                        $sourceDComparisonComponentsHierarchy  = traverseRecursivelyFor1DComparison($dbh, "d");
                    } 
                }          

            $dbh->commit();
        }

        function traverseRecursivelyFor1DComparison($dbh,                                                                         
                                     $source)
        {  
            $componentsTable = NULL;
            $idAttribute = NULL;            
            if($source === "a") {
                $componentsTable = "SourceAComponents";      
                $idAttribute = "sourceAId";        
            }
            else if($source === "b") {
                $componentsTable = "SourceBComponents";                               
                $idAttribute = "sourceBId";
            }
            else if($source === "c") {
                $componentsTable = "SourceCComponents";                               
                $idAttribute = "sourceCId";
            }
            else if($source === "d") {
                $componentsTable = "SourceDComponents";                               
                $idAttribute = "sourceDId";
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
                                     $source)
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
            if($source === "a") {
                $componentsTable = "SourceAComponents";
                $nodeIdAttribute ="sourceANodeId";
            }
            else if($source === "b") {
                $componentsTable = "SourceBComponents";
                $nodeIdAttribute ="sourceBNodeId";                    
            }
            else if($source === "c") {
                $componentsTable = "SourceCComponents";
                $nodeIdAttribute ="sourceCNodeId";                    
            }
            else if($source === "d") {
                $componentsTable = "SourceDComponents";
                $nodeIdAttribute ="sourceDNodeId";                    
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
                $childComponent = traverseRecursivelyFor3DComparison($dbh, $childRow['nodeid'], $traversedNodes, $source);

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
                $parentComponent = traverseRecursivelyFor3DComparison($dbh, $parentRow['nodeid'], $traversedNodes, $source);

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
                                                     $source)
        {   
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

                if(($source === "a" && isDataSource3D($datasourceInfo["sourceAType"])) || 
                  ($source === "b"  && isDataSource3D($datasourceInfo["sourceBType"])) ||
                  ($source === "c"  && isDataSource3D($datasourceInfo["sourceCType"])) ||
                  ($source === "d"  && isDataSource3D($datasourceInfo["sourceDType"])))
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
                                                                    $source); 
                                                                    
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
                    $componentsHierarchy = traverseRecursivelyFor1DCompliance($dbh, $source);
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
                                     $source)
        {  
            $componentsTable = NULL;
            $complianceComponentsTable = NULL;
            $idAttribute = "sourceId";            
            if($source === "a") {
                $componentsTable = "SourceAComponents";      
                $complianceComponentsTable = "SourceAComplianceCheckComponents";     
            }
            else  if($source === "b"){
                $componentsTable = "SourceBComponents";
                $complianceComponentsTable = "SourceBComplianceCheckComponents";     
            }
            else  if($source === "c"){
                $componentsTable = "SourceCComponents";
                $complianceComponentsTable = "SourceCComplianceCheckComponents";     
            }
            else  if($source === "d"){
                $componentsTable = "SourceDComponents";
                $complianceComponentsTable = "SourceDComplianceCheckComponents";     
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
                                                    $source)
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
            if($source === "a") {
                $componentsTable = "SourceAComponents";      
                $complianceComponentsTable = "SourceAComplianceCheckComponents";     
            }
            else  if($source === "b")  {
                $componentsTable = "SourceBComponents";                         
                $complianceComponentsTable = "SourceBComplianceCheckComponents";        
            }
            else  if($source === "c")  {
                $componentsTable = "SourceCComponents";                         
                $complianceComponentsTable = "SourceCComplianceCheckComponents";        
            }
            else  if($source === "d")  {
                $componentsTable = "SourceDComponents";                         
                $complianceComponentsTable = "SourceDComplianceCheckComponents";        
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
                $childComponent = traverseRecursivelyFor3DCompliance($dbh, $childRow['nodeid'], $traversedNodes, $source);

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
                $parentComponent = traverseRecursivelyFor3DCompliance($dbh, $parentRow['nodeid'], $traversedNodes, $source);

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
                    $componentsTable = "SourceCComponents";                          
                }
                else if($source === "d") {                 
                    $componentsTable = "SourceDComponents";   
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