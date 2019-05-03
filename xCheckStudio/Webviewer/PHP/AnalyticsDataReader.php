<?php
    
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
        global $projectName;

        $dbh;
        try
        {        
            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();
            
            // get ok components count
            $okCount = 0;
            $results = $dbh->query("SELECT COUNT(*) FROM ComparisonCheckComponents where status='OK';");                
            if($results)
            {
                $okCount = $results->fetchColumn();
            }

            // get error components count
            $errorCount = 0;
            $results = $dbh->query("SELECT COUNT(*) FROM ComparisonCheckComponents where status='Error';");     
            if($results)
            {
                $errorCount = $results->fetchColumn();
            }

            // get Warning components count
            $warningCount = 0;
            $results = $dbh->query("SELECT COUNT(*) FROM ComparisonCheckComponents where status='Warning';");     
            if($results)
            {
             $warningCount = $results->fetchColumn();
            }
           
            // get No Match components count
            $nomatchCount = 0;
            $results = $dbh->query("SELECT COUNT(*) FROM ComparisonCheckComponents where status='No Match';");     
            if($results)
            {
                $nomatchCount = $results->fetchColumn();
            }

            // get spource A selected components count
            $sourceASelectedCount =  0;
            $results = $dbh->query("SELECT COUNT(*) FROM SourceASelectedComponents;");     
            if($results)
            {
                $sourceASelectedCount = $results->fetchColumn();
            }

            // get spource A selected components count
            $sourceBSelectedCount =  0;
            $results = $dbh->query("SELECT COUNT(*) FROM SourceBSelectedComponents;");     
            if($results)
            {
                $sourceBSelectedCount = $results->fetchColumn();
            }

            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection                 
                            
            return array("okCount" =>$okCount, 
                        "errorCount" =>$errorCount,
                        "warningCount" =>$warningCount,
                        "nomatchCount" =>$nomatchCount,
                        "sourceASelectedCount" =>$sourceASelectedCount,
                        "sourceBSelectedCount" =>$sourceBSelectedCount);
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        } 
    }
?>