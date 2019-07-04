<?php

    if(!isset($_POST['ReferenceDataDir']) ||
       !isset( $_POST['ReferenceTable']) ||
       !isset( $_POST['Component']) ||
       !isset( $_POST['TypeofReference']))
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
    
    $supportedFiles = array("pdf","PDF","txt","TXT", "xml", "XML","jpg", "JPG", "jpeg", "JPEG", "jpe", "JPE", "bmp", "BMP", "gif", "GIF", "tif", "TIF", "png", "PNG");

    $ext = pathinfo($_FILES["fileToUpload"]["name"], PATHINFO_EXTENSION);
    if(in_array($ext, $supportedFiles) == false)
	{
        echo 'fail';
        return;
    }    

    $webViewerDirectory = dirname ( __DIR__ );
    $target_dir = $webViewerDirectory."/Projects/".$projectName."/".$_POST['ReferenceDataDir'];

    // create target directory if not exists
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    $target_file = $target_dir."/".basename($_FILES["fileToUpload"]["name"]);

    // Check if file already exists
    if (file_exists($target_file)) 
    {
        echo $_POST['ReferenceDataDir']."/".basename($target_file);
        return;        
    }

    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) 
    {
        $dataToSave = $_POST['ReferenceDataDir']."/".basename($target_file);
        if(AddDocumentReference($projectName, $dataToSave))
        {
            echo $dataToSave;
        }
        else
        {
            echo "fail"; 
        }        
    }
     else 
    {
        echo "fail";
    }

   
    function AddDocumentReference($projectName, 
                                  $referenceData)
    {
        $dbh;
        try{
            $tableName = $_POST['ReferenceTable'];            
            $component = $_POST['Component'];           
            $typeofReference = $_POST['TypeofReference'];

            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();

          
            $command = 'CREATE TABLE IF NOT EXISTS '. $tableName. '(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                webAddress TEXT,
                document TEXT,
                pic TEXT,
                users TEXT,
                parentComponent INTEGER NOT NULL    
              )';         
            $dbh->exec($command);              
           
            $parentComponent = (int)$component;                          
                
            switch($typeofReference)
            {
                case "Document":
                    $qry = 'INSERT INTO '.$tableName. '(document, parentComponent) VALUES(?,?) '; 
                    $stmt = $dbh->prepare($qry);
                    $stmt->execute( array($referenceData,  $parentComponent));     
                    break;
                case "Picture":
                    $qry = 'INSERT INTO '.$tableName. '(pic, parentComponent) VALUES(?,?) '; 
                    $stmt = $dbh->prepare($qry);
                    $stmt->execute( array($referenceData,  $parentComponent));     
                    break;                     
            }        

            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection  
            
            return true;
        }
        catch(Exception $e) 
        {        
            return false;             
        } 

        return false;  
    }
?>