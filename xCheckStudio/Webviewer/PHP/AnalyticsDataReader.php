<?php
    require_once 'Utility.php';
    if(!isset($_POST['CheckName']) || !isset($_POST['ProjectName']) )
    {
        echo 'fail';
        return;
    }

     // get project name
     $projectName = $_POST['ProjectName'];
     $checkName = $_POST['CheckName'];

    $values = readAnalyticsData();    
    if($values != 'fail')
    {
        echo json_encode($values);
    }
    else 
    {
        echo 'fail';        
    }

    function readAnalyticsData()
    { 
        $checkComponentTable = NULL;   
        $sourceASelectedCompTable = NULL;
        $sourceBSelectedCompTable = NULL;
        $sourceCSelectedCompTable = NULL;
        $sourceCSelectedCompTable = NULL;
   
        $sourceAComponentsTable = NULL;
        $sourceBComponentsTable = NULL;
        $sourceCComponentsTable = NULL;
        $sourceDComponentsTable = NULL;
   
        $sourceAnotSelectedCompsTable = NULL;
        $sourceBnotSelectedCompsTable = NULL;
        $sourceCnotSelectedCompsTable = NULL;
        $sourceDnotSelectedCompsTable = NULL;
   
        $checkGroupsTable = NULL;

        $analyticsResults = array();
        $comparisonResults = getComparisonAnalyticsDataCount();

        $complianceAResults = getComplianceAnalyticsData('SourceAComplianceCheckComponents', "SourceAComplianceCheckGroups", 
                            'SourceASelectedComponents', 'SourceAComponents', "SourceANotSelectedComponents");

        $complianceBResults = getComplianceAnalyticsData('SourceBComplianceCheckComponents', "SourceBComplianceCheckGroups", 
                            'SourceBSelectedComponents', 'SourceBComponents', "SourceBNotSelectedComponents");

        $complianceCResults = getComplianceAnalyticsData('SourceCComplianceCheckComponents', "SourceCComplianceCheckGroups", 
                            'SourceCSelectedComponents', 'SourceCComponents', "SourceCNotSelectedComponents");

        $complianceDResults = getComplianceAnalyticsData('SourceDComplianceCheckComponents', "SourceDComplianceCheckGroups", 
                            'SourceDSelectedComponents', 'SourceDComponents', "SourceDNotSelectedComponents");

        
        if($comparisonResults) {
            $analyticsResults['comparison'] = $comparisonResults;
        }

        if($complianceAResults) {
            $analyticsResults['complianceA'] = $complianceAResults;
        }

        if($complianceBResults) {
            $analyticsResults['complianceB'] = $complianceBResults;
        }

        if($complianceCResults) {
            $analyticsResults['complianceC'] = $complianceCResults;
        }

        if($complianceDResults) {
            $analyticsResults['complianceD'] = $complianceDResults;
        }


        return $analyticsResults; 
    }

    function getComparisonAnalyticsDataCount() {
        global $projectName;
        global $checkName;

        $checkGroupsTable = "ComparisonCheckGroups";

        $checkComponentTable = 'ComparisonCheckComponents';
        
        $sourceASelectedCompTable = 'SourceASelectedComponents';
        $sourceBSelectedCompTable = 'SourceBSelectedComponents';
        $sourceCSelectedCompTable = 'SourceCSelectedComponents';
        $sourceDSelectedCompTable = 'SourceDSelectedComponents';

        $sourceAComponentsTable = 'SourceAComponents';
        $sourceBComponentsTable = 'SourceBComponents';
        $sourceCComponentsTable = 'SourceCComponents';
        $sourceDComponentsTable = 'SourceDComponents';

        $sourceAnotSelectedCompsTable = "SourceANotSelectedComponents";
        $sourceBnotSelectedCompsTable = "SourceBNotSelectedComponents";
        $sourceCnotSelectedCompsTable = "SourceCNotSelectedComponents";
        $sourceDnotSelectedCompsTable = "SourceDNotSelectedComponents";
        $comparisonDataSources = 2;
        
        //$dbh;
        try
        {      

            // open database
            $mainDbPath = getCheckDatabasePath($projectName, $checkName);
            $mainDbh = new PDO("sqlite:$mainDbPath") or die("cannot open the database"); 
            // begin the transaction
            $mainDbh->beginTransaction(); 

            //check if table exists
            $results = $mainDbh->query("SELECT * FROM $checkComponentTable where id='1';");
            if($results === FALSE) {
                return;
            }

            //get datasourceInfo to check how many datasources were loaded
            $results = $mainDbh->query("SELECT *FROM  DatasourceInfo;");     
                
            $data = array();
            while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
            {
                if($record['sourceCFileName'] !== NULL) {
                    $comparisonDataSources++;
                }
                if($record['sourceDFileName'] !== NULL) {
                    $comparisonDataSources++;
                }
            }

            // get ok components count
            $okCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='OK';");                
            if($results)
            {
                $okCount = $results->fetchColumn();
            }

             // get okA components count
            $okACount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='OK(A)';");                
            if($results)
            {
                $okACount = $results->fetchColumn();
            }

            // get okT components count
            $okTCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='OK(T)';");                
            if($results)
            {
                $okTCount = $results->fetchColumn();
            }

            // get okAT components count
            $okATCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='OK(A)(T)';");                
            if($results)
            {
                $okATCount = $results->fetchColumn();
            }


            // get error components count
            $errorCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Error';");     
            if($results)
            {
                $errorCount = $results->fetchColumn();
            }

            // get errorA components count
            $errorA = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Error(A)';");     
            if($results)
            {
                $errorA = $results->fetchColumn();
            }

            // get errorT components count
            $errorT = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Error(T)';");     
            if($results)
            {
                $errorT = $results->fetchColumn();
            }

            // get errorAT components count
            $errorAT = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Error(A)(T)';");     
            if($results)
            {
                $errorAT = $results->fetchColumn();
            }

            // get Warning components count
            $warningCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Warning';");     
            if($results)
            {             
                $warningCount = $results->fetchColumn();
            }

            // get Warning components count
            $warningA = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Warning(A)';");     
            if($results)
            {             
                $warningA = $results->fetchColumn();
            }

            // get Warning components count
            $warningT = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Warning(T)';");     
            if($results)
            {             
                $warningT = $results->fetchColumn();
            }

            // get Warning components count
            $warningAT = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Warning(A)(T)';");     
            if($results)
            {             
                $warningAT = $results->fetchColumn();
            }
            
           
            // get No Match components count
            $nomatchCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='No Match';");     
            if($results)
            {
                $nomatchCount = $results->fetchColumn();
            }

            $undefinedCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='undefined';");     
            if($results)
            {
                $undefinedCount = $results->fetchColumn();
            }

            // get spource A selected components count
            $sourceASelectedCount =  0;

            if( $sourceASelectedCompTable != NULL)
            {
                $results =  $mainDbh->query("SELECT COUNT(*) FROM  $sourceASelectedCompTable;");     
                if($results)
                {
                    $sourceASelectedCount = $results->fetchColumn();
                }
            }

            // get spource A selected components count
            $sourceBSelectedCount =  0;
            if( $sourceBSelectedCompTable != NULL)
            {
                $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceBSelectedCompTable;");     
                if($results)
                {
                    $sourceBSelectedCount = $results->fetchColumn();
                }
            }

            // get spource A selected components count
            $sourceCSelectedCount =  0;
            if( $sourceCSelectedCompTable != NULL)
            {
                $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceCSelectedCompTable;");     
                if($results)
                {
                    $sourceCSelectedCount = $results->fetchColumn();
                }
            }

            // get spource A selected components count
            $sourceDSelectedCount =  0;
            if( $sourceDSelectedCompTable != NULL)
            {
                $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceDSelectedCompTable;");     
                if($results)
                {
                    $sourceDSelectedCount = $results->fetchColumn();
                }
            }

            // get source A total components
            $sourceATotalComponentsCount =  0;
            if($sourceAComponentsTable != NULL)
            {
                $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceAComponentsTable;");     
                if($results)
                {
                    $sourceATotalComponentsCount = $results->fetchColumn();
                }
            }
           
            // get source A total components
            $sourceBTotalComponentsCount =  0;
            if($sourceBComponentsTable != NULL)
            {
                $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceBComponentsTable;");     
                if($results)
                {
                    $sourceBTotalComponentsCount = $results->fetchColumn();
                }
            }

            // get source A total components
            $sourceCTotalComponentsCount =  0;
            if($sourceCComponentsTable != NULL)
            {
                $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceCComponentsTable;");     
                if($results)
                {
                    $sourceCTotalComponentsCount = $results->fetchColumn();
                }
            }

                        // get source A total components
            $sourceDTotalComponentsCount =  0;
            if($sourceDComponentsTable != NULL)
            {
                $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceDComponentsTable;");     
                if($results)
                {
                    $sourceDTotalComponentsCount = $results->fetchColumn();
                }
            }

            // read class wise check results counts
            $checkGroups = array();
            $groupWiseSubClassInfo = array();
            $oks = 0;
            $okAs = 0;
            $okTs = 0;
            $okTAs = 0;
            $okATs = 0;
            $errors = 0;
            $warnings = 0;
            $noMatches = 0;
            $undefinedItem = 0;
            $groups = $mainDbh->query("SELECT DISTINCT ownerGroup FROM $checkComponentTable;");                
            if($groups)
            {
                while ($group = $groups->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $ownerGroupId = $group['ownerGroup'];

                    $groupNameResults = $mainDbh->query("SELECT componentClass FROM   $checkGroupsTable where id=$ownerGroupId;");   
                    if($groupNameResults)
                    {
                        $undefinedComponents = $mainDbh->query("SELECT * FROM $checkComponentTable where status='undefined';");

                        $groupName= $groupNameResults->fetchColumn();

                        // ok components
                        $okResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='OK';");       
                        if( $okResults)
                        {
                            $oks = $okResults->fetchColumn();
                        }

                        // OK(A) components
                        $okAResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='OK(A)';");       
                        if( $okAResults)
                        {
                            $okAs = $okAResults->fetchColumn();
                        }

                        // OK(T) components
                        $okTResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='OK(T)';");       
                        if( $okTResults)
                        {
                            $okTs = $okTResults->fetchColumn();
                        }

                        // OK(A)(T) components
                        // OK(T) components
                        $okATResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='OK(A)(T)';");       
                        if( $okATResults)
                        {
                            $okATs = $okATResults->fetchColumn();
                        }

 
                         // Error components
                         $errorResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='Error';");       
                         if( $errorResults)
                         {
                             $errors = $errorResults->fetchColumn();
                         }

                         $errorACount = 0;
                         $results = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND status=?;");  
                         $results->execute(array($ownerGroupId, 'Error(A)'));              
                         $errorACount = $results->fetchColumn();
                         
                         $errorTCount = 0;
                         $results = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND status=?;");  
                         $results->execute(array($ownerGroupId, 'Error(T)'));              
                         $errorTCount = $results->fetchColumn();
                         
                         $errorATCount = 0;
                         $results = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND status=?;");  
                         $results->execute(array($ownerGroupId, 'Error(A)(T)'));              
                         $errorATCount = $results->fetchColumn();

                        // Warning components
                        $warningResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='Warning';");       
                        if( $warningResults)
                        {
                            $warnings = $warningResults->fetchColumn();
                        }

                        $warningACount = 0;
                        $results = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND status=?;");  
                        $results->execute(array($ownerGroupId, 'Warning(A)'));              
                        $warningACount = $results->fetchColumn();
        
                        $warningTCount = 0;
                        $results = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND status=?;");  
                        $results->execute(array($ownerGroupId, 'Warning(T)'));              
                        $warningTCount = $results->fetchColumn();
        
                        $warningATCount = 0;
                        $results = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND status=?;");  
                        $results->execute(array($ownerGroupId, 'Warning(A)(T)'));              
                        $warningATCount = $results->fetchColumn();

                         // Warning components
                         $nomatchResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='No Match';");       
                         if( $nomatchResults)
                         {
                             $noMatches = $nomatchResults->fetchColumn();
                         }    

                        $undefinedItem = 0;
                        $classArray = explode("-", $groupName);
                        if($undefinedComponents && $groupName !== 'Undefined') {
                            while ($comp = $undefinedComponents->fetch(\PDO::FETCH_ASSOC)) 
                            {
                                if($comp['sourceAMainClass'] == $classArray[0]) {
                                    $undefinedItem++;
                                }
                                else if($comp['sourceBMainClass'] == $classArray[1]) {
                                    $undefinedItem++;
                                }
                                else if($comparisonDataSources > 2 && $comp['sourceCMainClass'] == $classArray[2]) {
                                    $undefinedItem++;
                                }
                                else if($comparisonDataSources > 3 && $comp['sourceDMainClass'] == $classArray[3]) {
                                    $undefinedItem++;
                                }
                            }
                        }
                        else {
                             $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='undefined';");     
                             if($results)
                             {
                                 $undefinedItem = $results->fetchColumn();
                             }
                        }

                        $subClassStatistics = getSubClassWiseComparisonData($checkComponentTable, $ownerGroupId, $mainDbh);
                                                
                        $okAT = $okAs + $okTs +$okATs;
                        $totalErrors = $errors + $errorACount + $errorTCount + $errorATCount;
                        $totalWarnings = $warnings + $warningACount + $warningTCount + $warningATCount;
                         // keep track of check groups and corresponding stastics
                         $checkGroups[$groupName] =   array('OK'=>$oks, 'Error'=>$totalErrors, 'Warning'=>$totalWarnings, 'No Match'=>$noMatches, 'undefined Item'=>$undefinedItem, 'okATCount'=>$okAT);
                         $groupWiseSubClassInfo[$groupName] = $subClassStatistics;
                    }
                }              
            }

            // read source a class wise not checked item count
            $SourceAClassWiseNotSelectedComps = array();            
            if($sourceAnotSelectedCompsTable)
            {
                $groups = $mainDbh->query("SELECT DISTINCT mainClass FROM $sourceAnotSelectedCompsTable;");                
                if($groups)
                {
                    while ($group = $groups->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $mainClass = $group['mainClass'];
                      
                        $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceAnotSelectedCompsTable where mainClass='$mainClass';");     
                        if($results)
                        {
                            $sourceAnotSelectedCompsCount = 0;
                            $sourceAnotSelectedCompsCount = $results->fetchColumn();
                            $SourceAClassWiseNotSelectedComps[$mainClass] = array();

                            $SourceAClassWiseNotSelectedComps[$mainClass]["TotalIemsNotSelected"] =  $sourceAnotSelectedCompsCount;

                            $components = $mainDbh->query("SELECT * FROM  $sourceAnotSelectedCompsTable where mainClass='$mainClass';");
                            while($comp = $components->fetch(\PDO::FETCH_ASSOC)) {
                                $subclass = $comp['subClass'];

                                $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceAnotSelectedCompsTable where subClass='$subclass';"); 
                                if($results  && !array_key_exists($subclass, $SourceAClassWiseNotSelectedComps[$mainClass])) {
                                    $SourceAClassWiseNotSelectedComps[$mainClass][$subclass] = $results->fetchColumn();
                                } 
                            }
                        }
                    }
                }
            }               
           

            // read source b class wise not checked item count          
            $SourceBClassWiseNotSelectedComps = array();
            if($sourceBnotSelectedCompsTable)
            {
                $groups = $mainDbh->query("SELECT DISTINCT mainClass FROM $sourceBnotSelectedCompsTable;");                
                if($groups)
                {
                    while ($group = $groups->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $mainClass = $group['mainClass'];
                      
                        $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceBnotSelectedCompsTable where mainClass='$mainClass';");     
                        if($results)
                        {
                            $sourceBnotSelectedCompsCount = 0;
                            $sourceBnotSelectedCompsCount = $results->fetchColumn();
                            $SourceBClassWiseNotSelectedComps[$mainClass] = array();

                            $SourceBClassWiseNotSelectedComps[$mainClass]["TotalIemsNotSelected"] =  $sourceBnotSelectedCompsCount;

                            $components = $mainDbh->query("SELECT * FROM  $SourceBClassWiseNotSelectedComps where mainClass='$mainClass';");
                            while($comp = $components->fetch(\PDO::FETCH_ASSOC)) {
                                $subclass = $comp['subClass'];

                                $results = $mainDbh->query("SELECT COUNT(*) FROM  $SourceBClassWiseNotSelectedComps where subClass='$subclass';"); 
                                if($results  && !array_key_exists($subclass, $SourceBClassWiseNotSelectedComps[$mainClass])) {
                                    $SourceBClassWiseNotSelectedComps[$mainClass][$subclass] = $results->fetchColumn();
                                } 
                            }
                        }
                    }
                }
            }
                          
             // read source b class wise not checked item count          
             $SourceCClassWiseNotSelectedComps = array();
             if($sourceCnotSelectedCompsTable)
             {
                 $groups = $mainDbh->query("SELECT DISTINCT mainClass FROM $sourceCnotSelectedCompsTable;");                
                 if($groups)
                 {
                     while ($group = $groups->fetch(\PDO::FETCH_ASSOC)) 
                     {
                         $mainClass = $group['mainClass'];
                       
                         $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceCnotSelectedCompsTable where mainClass='$mainClass';");     
                         if($results)
                         {
                             $sourceCnotSelectedCompsCount = 0;
                             $sourceCnotSelectedCompsCount = $results->fetchColumn();
                             $SourceCClassWiseNotSelectedComps[$mainClass] = array();

                             $SourceCClassWiseNotSelectedComps[$mainClass]["TotalIemsNotSelected"] =  $sourceCnotSelectedCompsCount;
                             $components = $mainDbh->query("SELECT * FROM  $SourceCClassWiseNotSelectedComps where mainClass='$mainClass';");
                             while($comp = $components->fetch(\PDO::FETCH_ASSOC)) {
                                $subclass = $comp['subClass'];

                                $results = $mainDbh->query("SELECT COUNT(*) FROM  $SourceCClassWiseNotSelectedComps where subClass='$subclass';"); 
                                if($results && !array_key_exists($subclass, $SourceCClassWiseNotSelectedComps[$mainClass])) {
                                    $SourceCClassWiseNotSelectedComps[$mainClass][$subclass] = $results->fetchColumn();
                                } 
                             }
                         }
                     }
                 }
             }          

              // read source b class wise not checked item count          
            $SourceDClassWiseNotSelectedComps = array();
            if($sourceDnotSelectedCompsTable)
            {
                $groups = $mainDbh->query("SELECT DISTINCT mainClass FROM $sourceDnotSelectedCompsTable;");                
                if($groups)
                {
                    while ($group = $groups->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $mainClass = $group['mainClass'];
                      
                        $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceDnotSelectedCompsTable where mainClass='$mainClass';");     
                        if($results)
                        {
                            $sourceDnotSelectedCompsCount = 0;
                            $sourceDnotSelectedCompsCount = $results->fetchColumn();
                            $SourceDClassWiseNotSelectedComps[$mainClass] = array();

                            $SourceDClassWiseNotSelectedComps[$mainClass]["TotalIemsNotSelected"] =  $sourceDnotSelectedCompsCount;
                            $components = $mainDbh->query("SELECT * FROM  $SourceDClassWiseNotSelectedComps where mainClass='$mainClass';");
                             while($comp = $components->fetch(\PDO::FETCH_ASSOC)) {
                                $subclass = $comp['subClass'];

                                $results = $mainDbh->query("SELECT COUNT(*) FROM  $SourceDClassWiseNotSelectedComps where subClass='$subclass';"); 
                                if($results && !array_key_exists($subclass, $SourceDClassWiseNotSelectedComps[$mainClass])) {
                                    $SourceDClassWiseNotSelectedComps[$mainClass][$subclass] = $results->fetchColumn();
                                } 
                             }
                        }
                    }
                }
            }    
            
            
            $versionInfo = getVersioningInfo($checkComponentTable);
           
            // commit update
            $mainDbh->commit();           
            $mainDbh = null; //This is how you close a PDO connection    

            $totalErrorCount = $errorCount + $errorA + $errorT + $errorAT;
            $totalWarningCount =  $warningCount + $warningA + $warningT + $warningAT;

            $okCount *=$comparisonDataSources;
            $totalErrorCount *= $comparisonDataSources;
            $warningCount *= $comparisonDataSources;

            return array("okCount" =>$okCount, 
                        "errorCount" =>$totalErrorCount,
                        "warningCount" =>$totalWarningCount,
                        "nomatchCount" =>$nomatchCount,
                        "okACount" =>$okACount,
                        "okTCount" =>$okTCount,
                        "okATCount" => $okATCount,
                        "undefinedCount" =>$undefinedCount,
                        "sourceASelectedCount" =>$sourceASelectedCount,
                        "sourceBSelectedCount" =>$sourceBSelectedCount,
                        "sourceCSelectedCount" =>$sourceCSelectedCount,
                        "sourceDSelectedCount" =>$sourceDSelectedCount,
                        "sourceATotalComponentsCount" => $sourceATotalComponentsCount,
                        "sourceBTotalComponentsCount" => $sourceBTotalComponentsCount,
                        "sourceCTotalComponentsCount" => $sourceCTotalComponentsCount,
                        "sourceDTotalComponentsCount" => $sourceDTotalComponentsCount,
                        "CheckGroupsInfo" => $checkGroups,
                        "GroupWiseSubClassInfo" => $groupWiseSubClassInfo,
                        "Versioning" => $versionInfo,
                        "SourceANotSelectedComps" =>$SourceAClassWiseNotSelectedComps,
                        "SourceBNotSelectedComps"=>$SourceBClassWiseNotSelectedComps,
                        "SourceCNotSelectedComps" =>$SourceCClassWiseNotSelectedComps,
                        "SourceDNotSelectedComps" =>$SourceDClassWiseNotSelectedComps);
        }
        catch(Exception $e) 
        {        
             return "fail"; 
            //echo 'Message: ' .$e->getMessage();             
        }
    }

    function getSubClassWiseComparisonData($checkComponentTable, $ownerGroupId)
    {
        global $projectName;
        global $checkName;
        
        try {

            // open database
            $mainDbPath = getCheckDatabasePath($projectName, $checkName);
            $mainDbh = new PDO("sqlite:$mainDbPath") or die("cannot open the database"); 
            // begin the transaction
            $mainDbh->beginTransaction(); 

            $components = $mainDbh->query("SELECT * FROM  $checkComponentTable where ownerGroup=$ownerGroupId;");
            $subClassStatistics = array();  
            while($comp = $components->fetch(\PDO::FETCH_ASSOC)) {
                $okcomponents = 0;
                $Errorcomponents = 0;
                $Warningcomponents = 0;
                $noMatchcomponents = 0;

                if($comp['status'] == 'No Match') {
                    $class;
                    $subComponentClassColumn;
                    $sourceASubClass = $comp['sourceASubComponentClass'];
                    $sourceBSubClass = $comp['sourceBSubComponentClass'];
                    $sourceCSubClass = $comp['sourceCSubComponentClass'];
                    $sourceDSubClass = $comp['sourceDSubComponentClass'];

                    if($sourceASubClass !== NULL) {
                        $class = $sourceASubClass;
                        $subComponentClassColumn = 'sourceASubComponentClass';
                    }
                    else if($sourceBSubClass !== NULL) {
                        $class = $sourceBSubClass;
                        $subComponentClassColumn = 'sourceBSubComponentClass';
                    }
                    else if($sourceCSubClass !== NULL) {
                        $class = $sourceCSubClass;
                        $subComponentClassColumn = 'sourceCSubComponentClass';
                    }
                    else if($sourceDSubClass !== NULL) {
                        $class = $sourceDSubClass;
                        $subComponentClassColumn = 'sourceDSubComponentClass';
                    }

                    if(!array_key_exists($class, $subClassStatistics)) {
                        $subClassStatistics[$class] = array('OK'=>0, 'Error'=>0, 'Warning'=>0, 'No Match'=>0);
                    }

                    $okcount = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND $subComponentClassColumn=? AND status=?;");
                    $okcount->execute(array($ownerGroupId, $class, 'OK'));
                    $okcomponents = $okcount->fetchColumn();

                    $subClassStatistics[$class]['OK'] = $okcomponents;

                    $okcount = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND classMappingInfo=? AND status IN ('OK(A)', 'OK(T)', 'OK(A)(T)');");
                    $okcount->execute(array($ownerGroupId, $class));
                    $okATcomponents = $okcount->fetchColumn();

                    $subClassStatistics[$class]['OKAT'] = $okATcomponents;

                    $Errorcount = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND $subComponentClassColumn=? AND status=?;");
                    $Errorcount->execute(array($ownerGroupId, $class, 'Error'));
                    $Errorcomponents = $Errorcount->fetchColumn();

                    $subClassStatistics[$class]['Error'] = $Errorcomponents;

                    $Warningcount = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND $subComponentClassColumn=? AND status=?;");
                    $Warningcount->execute(array($ownerGroupId, $class, 'Warning'));
                    $Warningcomponents = $Warningcount->fetchColumn();

                    $subClassStatistics[$class]['Warning'] = $Warningcomponents;

                    $noMatchcount = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND $subComponentClassColumn=? AND status=?;");
                    $noMatchcount->execute(array($ownerGroupId, $class, 'No Match'));
                    $noMatchcomponents = $noMatchcount->fetchColumn();

                    $subClassStatistics[$class]['No Match'] = $noMatchcomponents;

                }
                else {
                    $class = $comp['classMappingInfo'];
                    if($class == NULL) {
                        continue;
                    }

                    $className = trim(explode(":", $class)[1]);

                    if(!array_key_exists($className, $subClassStatistics)) {
                        $subClassStatistics[$className] = array('OK'=>0, 'Error'=>0, 'Warning'=>0, 'No Match'=>0);
                    }

                    $okcount = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND classMappingInfo=? AND status IN ('OK', 'OK(A)', 'OK(T)', 'OK(A)(T)');");
                    $okcount->execute(array($ownerGroupId, $class));
                    $okcomponents = $okcount->fetchColumn();

                    $subClassStatistics[$className]['OK'] = $okcomponents;

                    $okcount = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND classMappingInfo=? AND status IN ('OK(A)', 'OK(T)', 'OK(A)(T)');");
                    $okcount->execute(array($ownerGroupId, $class));
                    $okATcomponents = $okcount->fetchColumn();

                    $subClassStatistics[$className]['OKAT'] = $okATcomponents;

                    $Errorcount = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND classMappingInfo=? AND status IN ('Error', 'Error(A)', 'Error(T)', 'Error(A)(T)');");
                    $Errorcount->execute(array($ownerGroupId, $class));
                    $Errorcomponents = $Errorcount->fetchColumn();

                    $subClassStatistics[$className]['Error'] = $Errorcomponents;

                    $Warningcount = $mainDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup=? AND classMappingInfo=? AND status IN ('Warning', 'Warning(A)', 'Warning(T)', 'Warning(A)(T)');");
                    $Warningcount->execute(array($ownerGroupId, $class));
                    $Warningcomponents = $Warningcount->fetchColumn();

                    $subClassStatistics[$className]['Warning'] = $Warningcomponents;
                    $subClassStatistics[$className]['No Match'] = $noMatchcomponents;
                }
            }

            $mainDbh->commit();           
            $mainDbh = null; //This is how you close a PDO connection    

            return $subClassStatistics;
        }
        catch(Exception $e) {

        }
    }

    function getVersioningInfo($checkComponentTable) {
        global $projectName;
        global $checkName;
        
        try {

            // open database
            $mainDbPath = getCheckDatabasePath($projectName, $checkName);
            $mainDbh = new PDO("sqlite:$mainDbPath") or die("cannot open the database"); 
            // begin the transaction
            $mainDbh->beginTransaction(); 

            $query =  "select *from Versions;";      
            $stmt = $mainDbh->query($query);
            $versionInfo = array();

            if($stmt) {
                $versions = $stmt->fetchAll(PDO::FETCH_ASSOC);

                for($i = 0; $i < count($versions); $i++) {
                    $versionName = $versions[$i]['name'];
                    $versionDbhPath = getVersionDatabasePath($projectName, $checkName, $versionName);
                    $versionDbh = new PDO("sqlite:$versionDbhPath") or die("cannot open the database");
    
                    $versionDbh->beginTransaction(); 
    
                    // get ok components count
                    $okCount = 0;
                    $results = $versionDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where status=?;");  
                    $results->execute(array('OK'));              
                    $okCount = $results->fetchColumn();
    
                    // get okA components count
                    $okACount = 0;
                    $results = $versionDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where status=?;");  
                    $results->execute(array('OK(A)'));              
                    $okACount = $results->fetchColumn();
    
    
                    // get okT components count
                    $okTCount = 0;
                    $results = $versionDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where status=?;");  
                    $results->execute(array('OK(T)'));              
                    $okTCount = $results->fetchColumn();
    
                    // get okAT components count
                    $okATCount = 0;
                    $results = $versionDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where status=?;");  
                    $results->execute(array('OK(A)(T)'));              
                    $okATCount = $results->fetchColumn();
    
    
                    // get error components count
                    $errorCount = 0;
                    $results = $versionDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where status=?;");  
                    $results->execute(array('Error'));              
                    $errorCount = $results->fetchColumn();
    
                    $errorACount = 0;
                    $results = $versionDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where status=?;");  
                    $results->execute(array('Error(A)'));              
                    $errorACount = $results->fetchColumn();
    
                    $errorTCount = 0;
                    $results = $versionDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where status=?;");  
                    $results->execute(array('Error(T)'));              
                    $errorTCount = $results->fetchColumn();
    
                    $errorATCount = 0;
                    $results = $versionDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where status=?;");  
                    $results->execute(array('Error(A)(T)'));              
                    $errorATCount = $results->fetchColumn();
    
                    // get Warning components count
                    $warningCount = 0;
                    $results = $versionDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where status=?;");  
                    $results->execute(array('Warning'));              
                    $warningCount = $results->fetchColumn();
    
                    $warningACount = 0;
                    $results = $versionDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where status=?;");  
                    $results->execute(array('Warning(A)'));              
                    $warningACount = $results->fetchColumn();
    
                    $warningTCount = 0;
                    $results = $versionDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where status=?;");  
                    $results->execute(array('Warning(T)'));              
                    $warningTCount = $results->fetchColumn();
    
                    $warningATCount = 0;
                    $results = $versionDbh->prepare("SELECT COUNT(*) FROM $checkComponentTable where status=?;");  
                    $results->execute(array('Warning(A)(T)'));              
                    $warningATCount = $results->fetchColumn();
    
                    $oks =  $okCount + $okACount + $okTCount + $okATCount;
                    $errors = $errorCount + $errorACount + $errorTCount + $errorATCount;
                    $warnings = $warningCount + $warningACount + $warningTCount + $warningATCount;
    
                    $versionInfo[$versionName] = array('OK'=>$oks, 'Error'=>$errors, 'Warning'=>$warnings);
    
                    $versionDbh->commit();           
                    $versionDbh = null; //This is how you close a PDO connection   
                }
            }

            $mainDbh->commit();           
            $mainDbh = null; //This is how you close a PDO connection   
            
            return $versionInfo;

        }
        catch(Exception $e) {

        }
    }

    function getComplianceAnalyticsData($checkComponentTable, $checkGroupsTable, $sourceSelectedCompTable, $sourceComponentsTable, $sourcenotSelectedCompsTable) {
        global $projectName;
        global $checkName;
        //$dbh;
        try
        {      

            // open database
            $mainDbPath = getCheckDatabasePath($projectName, $checkName);
            $mainDbh = new PDO("sqlite:$mainDbPath") or die("cannot open the database"); 
            // begin the transaction
            $mainDbh->beginTransaction(); 

            //check if table exists
            $results = $mainDbh->query("SELECT * FROM $checkComponentTable where id='1';");
            if($results === FALSE) {
                return;
            }
            // get ok components count
            $okCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='OK';");                
            if($results)
            {
                $okCount = $results->fetchColumn();
            }

            // get error components count
            $errorCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Error';");     
            if($results)
            {
                $errorCount = $results->fetchColumn();
            }

            $errorA = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Error(A)';");     
            if($results)
            {
                $errorA = $results->fetchColumn();
            }

            // get Warning components count
            $warningCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Warning';");     
            if($results)
            {             
                $warningCount = $results->fetchColumn();
            }

            // get Warning components count
            $warningA = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Warning(A)';");     
            if($results)
            {             
                $warningA = $results->fetchColumn();
            }
           
            // get No Match components count
            $nomatchCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='No Match';");     
            if($results)
            {
                $nomatchCount = $results->fetchColumn();
            }

            $undefinedCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='undefined';");     
            if($results)
            {
                $undefinedCount = $results->fetchColumn();
            }

            // get spource selected components count
            $sourceSelectedComp =  0;
            if( $sourceSelectedCompTable != NULL)
            {
                $results =  $mainDbh->query("SELECT COUNT(*) FROM  $sourceSelectedCompTable;");     
                if($results)
                {
                    $sourceSelectedComp = $results->fetchColumn();
                }
            }

            // get source total components
            $sourceTotalComponentsCount =  0;
            if($sourceComponentsTable != NULL)
            {
                $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourceComponentsTable;");     
                if($results)
                {
                    $sourceTotalComponentsCount = $results->fetchColumn();
                }
            }

            // read class wise check results counts
            $checkGroups = array();
            $groupWiseSubClassInfo = array();
            $oks = 0;
            $okAs = 0;
            $okTs = 0;
            $okTAs = 0;
            $okATs = 0;
            $errors = 0;
            $errorACount = 0;
            $warnings = 0;
            $warningACount = 0;
            $noMatches = 0;
            $undefinedItem = 0;
            $groups = $mainDbh->query("SELECT DISTINCT ownerGroup FROM $checkComponentTable;");                
            if($groups)
            {
                while ($group = $groups->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $ownerGroupId = $group['ownerGroup'];

                    $groupNameResults = $mainDbh->query("SELECT componentClass FROM   $checkGroupsTable where id=$ownerGroupId;");     
                    if($groupNameResults)
                    {
                        $undefinedComponents = $mainDbh->query("SELECT * FROM $checkComponentTable where status='undefined';");

                        $groupName= $groupNameResults->fetchColumn();

                        // ok components
                        $okResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='OK';");       
                        if( $okResults)
                        {
                            $oks = $okResults->fetchColumn();
                        }

                        // OK(A) components
                        $okAResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='OK(A)';");       
                        if( $okAResults)
                        {
                            $okAs = $okAResults->fetchColumn();
                        }

                        // OK(T) components
                        $okTResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='OK(T)';");       
                        if( $okTResults)
                        {
                            $okTs = $okTResults->fetchColumn();
                        }

                        // OK(T)(A) components
                        $okTAResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='OK(T)(A)';");       
                        if( $okTAResults)
                        {
                            $okTAs = $okTAResults->fetchColumn();
                        }

                        // OK(A)(T) components
                        // OK(T) components
                        $okATResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='OK(A)(T)';");       
                        if( $okATResults)
                        {
                            $okATs = $okATResults->fetchColumn();
                        }

 
                         // Error components
                         $errorResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='Error';");       
                         if( $errorResults)
                         {
                             $errors = $errorResults->fetchColumn();
                         }

                         // Error components
                         $errorResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='Error(A)';");       
                         if( $errorResults)
                         {
                             $errorACount = $errorResults->fetchColumn();
                         }

                        // Warning components
                        $warningResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='Warning';");       
                        if( $warningResults)
                        {
                            $warnings = $warningResults->fetchColumn();
                        }

                        // Warning components
                        $warningResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='Warning(A)';");       
                        if( $warningResults)
                        {
                            $warningACount = $warningResults->fetchColumn();
                        }

                         // Warning components
                         $nomatchResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='No Match';");       
                         if( $nomatchResults)
                         {
                             $noMatches = $nomatchResults->fetchColumn();
                         }    
                         

                        $undefinedItem = 0;
                        $undefinedComponents = $mainDbh->query("SELECT * FROM $checkComponentTable where status='undefined';");

                        if($undefinedComponents && $groupName !== 'Undefined') {
                            while ($comp = $undefinedComponents->fetch(\PDO::FETCH_ASSOC)) 
                            {
                                if($comp['mainComponentClass'] == $groupName) {
                                    $undefinedItem++;
                                }
                            }
                        }
                        else {
                             $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='undefined';");     
                             if($results)
                             {
                                 $undefinedItem = $results->fetchColumn();
                             }
                        }

                        $components = $mainDbh->query("SELECT * FROM   $checkComponentTable where ownerGroup=$ownerGroupId;");
                        $subClassStatistics = array();  
                        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
                        {
                            $sourceSubClass = $comp['subComponentClass'];

                            if(!array_key_exists($sourceSubClass, $subClassStatistics)) {
                                $subClassStatistics[$sourceSubClass] = array('OK'=>0, 'Error'=>0, 'Warning'=>0, 'No Match'=>0, 'OKAT'=>0);
                            }

                            $status = strtolower($comp['status']);

                            $subClassOkCount = (int)$subClassStatistics[$sourceSubClass]['OK'];
                            $subClassOkATCount = (int)$subClassStatistics[$sourceSubClass]['OKAT'];
                            $subClassErrorCount = (int)$subClassStatistics[$sourceSubClass]['Error'];
                            $subClassWarningCount = (int)$subClassStatistics[$sourceSubClass]['Warning'];
                            $subClassNoMatchCount = (int)$subClassStatistics[$sourceSubClass]['No Match'];

                            if(strpos($status, 'ok') !== false) {
                                $subClassOkCount++;
                                $subClassStatistics[$sourceSubClass]['OK'] = $subClassOkCount;
                            }
                            else if(strpos($status, 'error') !== false) {
                                $subClassErrorCount++;
                                $subClassStatistics[$sourceSubClass]['Error'] = $subClassErrorCount;
                            }
                            else if(strpos($status, 'warning') !== false) {
                                $subClassWarningCount++;
                                $subClassStatistics[$sourceSubClass]['Warning'] = $subClassWarningCount;
                            }
                            else if(strpos($status, 'no match') !== false || strpos($status, 'missing item(s)') !== false) {
                                $subClassNoMatchCount++;
                                $subClassStatistics[$sourceSubClass]['No Match'] = $subClassNoMatchCount;
                            }

                            if($status == 'OK(A)' || $status == "OK(T)" || $status == 'OK(A)(T)') {
                                $subClassOkATCount++;
                                $subClassStatistics[$sourceSubClass]['OKAT'] = $subClassOkATCount;
                            }
                        }
                        
                        // $okAT = $okAs + $okTs +$okATs;
                        
                         // keep track of check groups and corresponding stastics
                         $checkGroups[$groupName] =   array('OK'=>$oks, 'Error'=>$errors + $errorACount, 'Warning'=>$warnings + $warningACount, 'No Match'=>$noMatches, 'undefined Item'=>$undefinedItem);
                         $groupWiseSubClassInfo[$groupName] = $subClassStatistics;
                    }
                }              
            }

            // read source a class wise not checked item count
            $SourceClassWiseNotSelectedComps = array();            
            if($sourcenotSelectedCompsTable)
            {
                $groups = $mainDbh->query("SELECT DISTINCT mainClass FROM $sourcenotSelectedCompsTable;");                
                if($groups)
                {
                    while ($group = $groups->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $mainClass = $group['mainClass'];
                      
                        $results = $mainDbh->query("SELECT COUNT(*) FROM  $sourcenotSelectedCompsTable where mainClass='$mainClass';");     
                        if($results)
                        {
                            $sourcenotSelectedCompsCount = 0;
                            $sourcenotSelectedCompsCount = $results->fetchColumn();
                           
                            $SourceClassWiseNotSelectedComps[$mainClass] =  $sourcenotSelectedCompsCount;
                        }
                    }
                }
            }               
           
            $versionInfo = getVersioningInfo($checkComponentTable);
            // commit update
            $mainDbh->commit();           
            $mainDbh = null; //This is how you close a PDO connection    

            return array("okCount" =>$okCount, 
                        "errorCount" =>$errorCount + $errorA,
                        "warningCount" =>$warningCount + $warningA,
                        "nomatchCount" =>$nomatchCount,
                        "okACount" =>$okAs,
                        "okTCount" =>$okTs,
                        "okATCount" => $okATs + $okTAs,
                        "undefinedCount" =>$undefinedCount,
                        "sourceSelectedCount" =>$sourceSelectedComp,
                        "sourceTotalComponentsCount" => $sourceTotalComponentsCount,
                        "CheckGroupsInfo" => $checkGroups,
                        "GroupWiseSubClassInfo" => $groupWiseSubClassInfo,
                        "Versioning" => $versionInfo,
                        "SourceNotSelectedComps" =>$SourceClassWiseNotSelectedComps);
        }
        catch(Exception $e) 
        {        
             return "fail"; 
            //echo 'Message: ' .$e->getMessage();             
        }
    }

    
?>