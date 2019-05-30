<?php
    
    if(!isset($_POST['CheckType']))
    {
        echo 'fail';
        return;
    }

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

    $values =readAnalyticsData();    
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

        $sourceAComponentsTable = NULL;
        $sourceBComponentsTable = NULL;

        $sourceAnotSelectedCompsTable = NULL;
        $sourceBnotSelectedCompsTable = NULL;

        $checkGroupsTable = NULL;
        if(strtolower($_POST['CheckType']) === 'comparison' )
        {
            $checkGroupsTable = "ComparisonCheckGroups";

            $checkComponentTable = 'ComparisonCheckComponents';
           
            $sourceASelectedCompTable = 'SourceASelectedComponents';
            $sourceBSelectedCompTable = 'SourceBSelectedComponents';

            $sourceAComponentsTable = 'SourceAComponents';
            $sourceBComponentsTable = 'SourceBComponents';

            $sourceAnotSelectedCompsTable = "SourceANotSelectedComponents";
            $sourceBnotSelectedCompsTable = "SourceBNotSelectedComponents";
        }
        else if(strtolower($_POST['CheckType']) === 'sourceacompliance')
        {
            $checkGroupsTable = "SourceAComplianceCheckGroups";

            $checkComponentTable ='SourceAComplianceCheckComponents';

            $sourceASelectedCompTable = 'SourceASelectedComponents';  
            
            $sourceAComponentsTable = 'SourceAComponents';

            $sourceAnotSelectedCompsTable = "SourceANotSelectedComponents";
        }
        else if(strtolower($_POST['CheckType']) === 'sourcebcompliance')
        {          
            $checkGroupsTable = "SourceBComplianceCheckGroups";

            $checkComponentTable ='SourceBComplianceCheckComponents';

            $sourceBSelectedCompTable = 'SourceBSelectedComponents';

            $sourceBComponentsTable = 'SourceBComponents';

            $sourceBnotSelectedCompsTable = "SourceBNotSelectedComponents";
        }
        else 
        {
            return 'fail';
        }
      
        global $projectName;
        $dbh;
        try
        {  
            //session_start();
            if(!isset($_SESSION['LoadProject'] ))
            {
               echo "fail";
               return NULL;                
            }
            $loadProjectString = $_SESSION['LoadProject'];

            $loadProject = false;
            if(strtolower($loadProjectString) === 'true')
            {
                $loadProject = true;   
            }           

            // open database
            $mainDbPath = "../Projects/".$projectName."/".$projectName.".db";
            $mainDbh = new PDO("sqlite:$mainDbPath") or die("cannot open the database"); 
            // begin the transaction
            $mainDbh->beginTransaction(); 
          
            $dbh = NULL;
            if(!$loadProject)
           {
                $dbPath = "../Projects/".$projectName."/CheckResults_temp.db";
                $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
                // begin the transaction          
                $dbh->beginTransaction();            
           }
           else
           {
                $dbh = $mainDbh;
           }

            // get ok components count
            $okCount = 0;
            $results = $dbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='OK';");                
            if($results)
            {
                $okCount = $results->fetchColumn();
            }

            // get error components count
            $errorCount = 0;
            $results = $dbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Error';");     
            if($results)
            {
                $errorCount = $results->fetchColumn();
            }

            // get Warning components count
            $warningCount = 0;
            $results = $dbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='Warning';");     
            if($results)
            {             
                $warningCount = $results->fetchColumn();
            }
           
            // get No Match components count
            $nomatchCount = 0;
            $results = $dbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='No Match';");     
            if($results)
            {
                $nomatchCount = $results->fetchColumn();
            }

            $undefinedCount = 0;
            $results = $dbh->query("SELECT COUNT(*) FROM $checkComponentTable where status='undefined';");     
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

            // read class wise check results counts
            $checkGroups = array();
            $groups = $dbh->query("SELECT DISTINCT ownerGroup FROM $checkComponentTable;");                
            if($groups)
            {
                while ($group = $groups->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $ownerGroupId = $group['ownerGroup'];

                    $groupNameResults = $dbh->query("SELECT componentClass FROM   $checkGroupsTable where id=$ownerGroupId;");     
                    if($groupNameResults)
                    {
                        $groupName= $groupNameResults->fetchColumn();

                        // ok components
                        $oks = 0;
                        $okResults = $dbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='OK';");       
                        if( $okResults)
                        {
                            $oks = $okResults->fetchColumn();
                        }

                         // Error components
                         $errors = 0;
                         $errorResults = $dbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='Error';");       
                         if( $errorResults)
                         {
                             $errors = $errorResults->fetchColumn();
                         }

                        // Warning components
                        $warnings = 0;
                        $warningResults = $dbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='Warning';");       
                        if( $warningResults)
                        {
                            $warnings = $warningResults->fetchColumn();
                        }

                         // Warning components
                         $noMatches = 0;
                         $nomatchResults = $dbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='No Match';");       
                         if( $nomatchResults)
                         {
                             $noMatches = $nomatchResults->fetchColumn();
                         }    
                         
                         $undefinedItem = 0;
                         $results = $dbh->query("SELECT COUNT(*) FROM $checkComponentTable where ownerGroup= $ownerGroupId AND status='undefined';");     
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
                $groups = $dbh->query("SELECT DISTINCT mainClass FROM $sourceAnotSelectedCompsTable;");                
                if($groups)
                {
                    while ($group = $groups->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $mainClass = $group['mainClass'];
                      
                        $results = $dbh->query("SELECT COUNT(*) FROM  $sourceAnotSelectedCompsTable where mainClass='$mainClass';");     
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
                $groups = $dbh->query("SELECT DISTINCT mainClass FROM $sourceBnotSelectedCompsTable;");                
                if($groups)
                {
                    while ($group = $groups->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $mainClass = $group['mainClass'];
                      
                        $results = $dbh->query("SELECT COUNT(*) FROM  $sourceBnotSelectedCompsTable where mainClass='$mainClass';");     
                        if($results)
                        {
                            $sourceBnotSelectedCompsCount = 0;
                            $sourceBnotSelectedCompsCount = $results->fetchColumn();

                            $SourceBClassWiseNotSelectedComps[$mainClass] =  $sourceBnotSelectedCompsCount;
                        }
                    }
                }
            }               
           
            // commit update
            $mainDbh->commit();           
            $mainDbh = null; //This is how you close a PDO connection    
            if(!$loadProject)
            {
                $dbh->commit();
                $dbh = null; //This is how you close a PDO connection                 
            }
                            
            // for comparison checks, single DB record is for 2 components ( one from Source A 
            // and another from Source B)
            if(strtolower($_POST['CheckType']) === 'comparison' )
            {
                $okCount *=2;
                $errorCount *= 2;
                $warningCount *= 2;
            }

            return array("okCount" =>$okCount, 
                        "errorCount" =>$errorCount,
                        "warningCount" =>$warningCount,
                        "nomatchCount" =>$nomatchCount,
                        "undefinedCount" =>$undefinedCount,
                        "sourceASelectedCount" =>$sourceASelectedCount,
                        "sourceBSelectedCount" =>$sourceBSelectedCount,
                        "sourceATotalComponentsCount" => $sourceATotalComponentsCount,
                        "sourceBTotalComponentsCount" => $sourceBTotalComponentsCount,
                        "CheckGroupsInfo" => $checkGroups,
                        "SourceANotSelectedComps" =>$SourceAClassWiseNotSelectedComps,
                        "SourceBNotSelectedComps"=>$SourceBClassWiseNotSelectedComps);
        }
        catch(Exception $e) 
        {        
             return "fail"; 
            //echo 'Message: ' .$e->getMessage();             
        } 
    }
    
?>