<?php

    include 'Utility.php';      

    if(!isset($_POST["ProjectName"]) || 
       !isset($_POST['CheckName']))
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
                    $sourceViewerOptions['a']  = array();
                    $sourceViewerOptions['b']  = array();
                   
                    $sourceViewerOptions['a']['source'] =  $record['sourceAFileName'];                   
                    $sourceViewerOptions['b']['source'] = $record['sourceBFileName'];  
                    
                    if($record['sourceCFileName'] != NULL)
                    {
                        $sourceViewerOptions['c']['source'] =  $record['sourceCFileName'];    
                    }
                    if($record['sourceDFileName'] != NULL)
                    {
                        $sourceViewerOptions['d']['source'] =  $record['sourceDFileName'];    
                    }
                }

                // read sourceAViewerOptions
                $sourceAViewerOptions = $dbh->query("SELECT *FROM SourceAViewerOptions;");
                if($sourceAViewerOptions) 
                {
                    while ($viewerOptions = $sourceAViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        // $sourceViewerOptions['a']  = array();
                        
                        $sourceViewerOptions['a']['endPointUri'] = $viewerOptions['endpointUri'];
                        // $sourceViewerOptions['a']['source'] =  $sourceA;
                        break;
                    }
                }
               

                 // read sourceBViewerOptions
                 $sourceBViewerOptions = $dbh->query("SELECT *FROM SourceBViewerOptions;");
                 if($sourceBViewerOptions) 
                 {
                    while ($viewerOptions = $sourceBViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        // $sourceViewerOptions['b']  = array();
                        
                        $sourceViewerOptions['b']['endPointUri'] = $viewerOptions['endpointUri'];
                        // $sourceViewerOptions['b']['source'] =  $sourceB;
                        break;
                    }
                 }

                 // source c                
                 $sourceCViewerOptions = $dbh->query("SELECT *FROM SourceCViewerOptions;");
                 if($sourceCViewerOptions) 
                 {
                    while ($viewerOptions = $sourceCViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $sourceViewerOptions['c']['endPointUri'] = $viewerOptions['endpointUri'];                       
                        break;
                    }
                 }

                 // source d
                 $sourceDViewerOptions = $dbh->query("SELECT *FROM SourceDViewerOptions;");
                 if($sourceDViewerOptions) 
                 {
                    while ($viewerOptions = $sourceDViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $sourceViewerOptions['d']['endPointUri'] = $viewerOptions['endpointUri'];                       
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