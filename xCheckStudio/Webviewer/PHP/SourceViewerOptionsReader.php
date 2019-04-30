<?php

        include 'Utility.php';

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

        // get project database path
        $DBPath = getProjectDatabasePath($projectName);

       $viewerOptions = readViwerOptions();
       echo json_encode( $viewerOptions );

        function readViwerOptions()
        {
            global $DBPath ;
            try
            {                   
                //$dbPath = "../Projects/".$projectName."/".$projectName.".db";
                $dbh = new PDO("sqlite:$DBPath") or die("cannot open the database");       
     
                // begin the transaction
                $dbh->beginTransaction();

                $sourceViewerOptions = array();
                // read sourceAViewerOptions
                $sourceAViewerOptions = $dbh->query("SELECT *FROM SourceAViewerOptions;");
                if($sourceAViewerOptions) 
                {
                    while ($viewerOptions = $sourceAViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $sourceViewerOptions['SourceAContainerId'] = $viewerOptions['containerId'];
                        $sourceViewerOptions['SourceAEndPointUri'] = $viewerOptions['endpointUri'];
                        break;
                    }
                }
                else
                {
                    // table doesn't exist
                }

                 // read sourceAViewerOptions
                 $sourceBViewerOptions = $dbh->query("SELECT *FROM SourceBViewerOptions;");
                 if($sourceBViewerOptions) 
                 {
                    while ($viewerOptions = $sourceBViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $sourceViewerOptions['SourceBContainerId'] = $viewerOptions['containerId'];
                        $sourceViewerOptions['SourceBEndPointUri'] = $viewerOptions['endpointUri'];
                        break;
                    }
                 }
                 else
                 {
                     // table doesn't exist
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