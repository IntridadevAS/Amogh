<?php

    include 'Utility.php';      

    if(!isset($_POST["ProjectName"]) || !isset($_POST['CheckName']))
    {
        echo "fail";
        return;
    }
    // get project database path
    //$DBPath = getProjectDatabasePath($projectName);

    $viewerOptions = readViwerOptions();
    echo json_encode( $viewerOptions );

        function readViwerOptions()
        {
            $projectName = $_POST['ProjectName'];
            $checkName = $_POST['CheckName'];
            //global $DBPath ;
            $DBPath = getCheckDatabasePath($projectName, $checkName);
            try
            {                   
                //$dbPath = "../Projects/".$projectName."/".$projectName.".db";
                $dbh = new PDO("sqlite:$DBPath") or die("cannot open the database");       
     
                // begin the transaction
                $dbh->beginTransaction();

                $sourceViewerOptions = array();
                
                // read sources
                $sourceA;
                $sourceB;
                $results = $dbh->query("SELECT *FROM  DatasourceInfo;");                     
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $sourceA = $record['sourceAFileName'];
                    $sourceB = $record['sourceBFileName'];                               
                }

                // read sourceAViewerOptions
                $sourceAViewerOptions = $dbh->query("SELECT *FROM SourceAViewerOptions;");
                if($sourceAViewerOptions) 
                {
                    while ($viewerOptions = $sourceAViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $sourceViewerOptions['a']  = array();
                        
                        $sourceViewerOptions['a']['endPointUri'] = $viewerOptions['endpointUri'];
                        $sourceViewerOptions['a']['source'] =  $sourceA;
                        break;
                    }
                }
               

                 // read sourceBViewerOptions
                 $sourceBViewerOptions = $dbh->query("SELECT *FROM SourceBViewerOptions;");
                 if($sourceBViewerOptions) 
                 {
                    while ($viewerOptions = $sourceBViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $sourceViewerOptions['b']  = array();
                        
                        $sourceViewerOptions['b']['endPointUri'] = $viewerOptions['endpointUri'];
                        $sourceViewerOptions['b']['source'] =  $sourceB;
                        break;
                    }
                 }
                
                                 
                // commit update
                $dbh->commit();
                $dbh = null; //This is how you close a PDO connection

                return $sourceViewerOptions;
            }                
            catch(Exception $e)
            {        
                echo "fail"; 
                return NULL;
            }  
            
            return NULL;
        }
?>