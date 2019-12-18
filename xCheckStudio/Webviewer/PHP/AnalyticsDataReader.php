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

            // get error components count
            $errorCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Error';");     
            if($results)
            {
                $errorCount = $results->fetchColumn();
            }

            // get Warning components count
            $warningCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Warning';");     
            if($results)
            {             
                $warningCount = $results->fetchColumn();
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

                        // Warning components
                        $warningResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='Warning';");       
                        if( $warningResults)
                        {
                            $warnings = $warningResults->fetchColumn();
                        }

                         // Warning components
                         $nomatchResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='No Match';");       
                         if( $nomatchResults)
                         {
                             $noMatches = $nomatchResults->fetchColumn();
                         }    
                         
                         $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='undefined';");     
                         if($results)
                         {
                             $undefinedItem = $results->fetchColumn();
                         }
                         // keep track of check groups and corresponding stastics
                         $checkGroups[$groupName] =   array('OK'=>$oks, 'Error'=>$errors, 'Warning'=>$warnings, 'No Match'=>$noMatches, 'undefined Item'=>$undefinedItem);
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
                           
                            $SourceAClassWiseNotSelectedComps[$mainClass] =  $sourceAnotSelectedCompsCount;
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

                            $SourceBClassWiseNotSelectedComps[$mainClass] =  $sourceBnotSelectedCompsCount;
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
 
                             $SourceCClassWiseNotSelectedComps[$mainClass] =  $sourceCnotSelectedCompsCount;
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

                            $SourceDClassWiseNotSelectedComps[$mainClass] =  $sourceDnotSelectedCompsCount;
                        }
                    }
                }
            }          
           
            // commit update
            $mainDbh->commit();           
            $mainDbh = null; //This is how you close a PDO connection    

            $okCount *=$comparisonDataSources;
            $errorCount *= $comparisonDataSources;
            $warningCount *= $comparisonDataSources;

            return array("okCount" =>$okCount, 
                        "errorCount" =>$errorCount,
                        "warningCount" =>$warningCount,
                        "nomatchCount" =>$nomatchCount,
                        "okACount" =>$okAs,
                        "okTCount" =>$okTs,
                        "okATCount" => $okATs + $okTAs,
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

            // get Warning components count
            $warningCount = 0;
            $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Warning';");     
            if($results)
            {             
                $warningCount = $results->fetchColumn();
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

                        // Warning components
                        $warningResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='Warning';");       
                        if( $warningResults)
                        {
                            $warnings = $warningResults->fetchColumn();
                        }

                         // Warning components
                         $nomatchResults = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='No Match';");       
                         if( $nomatchResults)
                         {
                             $noMatches = $nomatchResults->fetchColumn();
                         }    
                         
                         $results = $mainDbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='undefined';");     
                         if($results)
                         {
                             $undefinedItem = $results->fetchColumn();
                         }
                         // keep track of check groups and corresponding stastics
                         $checkGroups[$groupName] =   array('OK'=>$oks, 'Error'=>$errors, 'Warning'=>$warnings, 'No Match'=>$noMatches, 'undefined Item'=>$undefinedItem);
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
           
            // commit update
            $mainDbh->commit();           
            $mainDbh = null; //This is how you close a PDO connection    

            return array("okCount" =>$okCount, 
                        "errorCount" =>$errorCount,
                        "warningCount" =>$warningCount,
                        "nomatchCount" =>$nomatchCount,
                        "okACount" =>$okAs,
                        "okTCount" =>$okTs,
                        "okATCount" => $okATs + $okTAs,
                        "undefinedCount" =>$undefinedCount,
                        "sourceSelectedCount" =>$sourceSelectedComp,
                        "sourceTotalComponentsCount" => $sourceTotalComponentsCount,
                        "CheckGroupsInfo" => $checkGroups,
                        "SourceNotSelectedComps" =>$SourceClassWiseNotSelectedComps);
        }
        catch(Exception $e) 
        {        
             return "fail"; 
            //echo 'Message: ' .$e->getMessage();             
        }
    }
    
?>