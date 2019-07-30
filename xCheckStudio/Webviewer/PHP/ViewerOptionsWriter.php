<?php

    include 'Utility.php';

    if(!isset($_POST['SourceViewerOptions'] ) ||
       !isset($_POST['ProjectName']) ||
       !isset($_POST['SourceViewerOptionsTable'] ))
    {
        echo 'fails';
        return;
    }  
       
    $projectName = $_POST['ProjectName'];

    $SourceViewerOptions = json_decode($_POST['SourceViewerOptions'],true);
    $SourceViewerOptionsTable = $_POST['SourceViewerOptionsTable'];
      
    writeSourceViewerOptions($SourceViewerOptionsTable, $SourceViewerOptions);
       
    function writeSourceViewerOptions($viewerOptionsTable, $viewerOptions)
    {
        global $projectName;

        try
        {   
            // open database
            //$dbPath = getProjectDatabasePath($projectName);
            $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");       
 
            // begin the transaction
            $dbh->beginTransaction();             

            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '.$viewerOptionsTable. ';';
            $dbh->exec($command);

            $command = 'CREATE TABLE '.$viewerOptionsTable.'(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,                
                        containerId TEXT,
                        endpointUri TEXT)';            
            $dbh->exec($command);  

            $insertQuery = 'INSERT INTO '.$viewerOptionsTable.'(containerId, endpointUri) VALUES(?,?) ';                                        
            $values = array( $viewerOptions[0],  $viewerOptions[1]);          
         
            $insertStmt = $dbh->prepare($insertQuery);           
            $insertStmt->execute($values);  

            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection
        }                
        catch(Exception $e)
        {        
            echo "fail"; 
            return;
        }   
    }

?>