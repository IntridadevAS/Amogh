<?php
    require_once 'Utility.php';
    if(!isset( $_POST['currentSource']) ||
       !isset( $_POST['components']) ||
       !isset($_POST['projectName']) ||
       !isset($_POST['checkName']) ||
       !isset( $_POST['typeofReference']))
    {
        echo 'fail';
        return;
    }
  
    $projectName = $_POST['projectName'];
    $checkName = $_POST['checkName'];
    $supportedFiles = array(
        "pdf",
        "PDF",
        "txt",
        "TXT",
        "xml",
        "XML",
        "jpg",
        "JPG",
        "jpeg",
        "JPEG",
        "jpe",
        "JPE",
        "bmp",
        "BMP",
        "gif",
        "GIF",
        "tif",
        "TIF",
        "png",
        "PNG",
        "xls",
        "XLS",
        "xlsx",
        "XLSX",
        "doc",
        "DOC",
        "docx",
        "DOCX",
        "xlsm",
        "XLSM",
        "csv",
        "CSV",
        "svg",
        "SVG",
        "ppt",
        "PPT",
        "pptx",
        "PPTX"
       );

    $ext = pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION);
    if(in_array($ext, $supportedFiles) == false)
	{
        echo 'invalid file type';
        return;
    }    

    // construct destination path
    $currentSource =  $_POST['currentSource'];
    $webViewerDirectory = dirname ( __DIR__ );
    $target_dir = $webViewerDirectory."/Projects/".$projectName."/CheckSpaces/".$checkName."/".$currentSource."_referenceData";  
    
    // create target directory if not exists
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    $target_file = $target_dir."/".basename($_FILES["file"]["name"]);

    // Check if file already exists
    if (!file_exists($target_file)) 
    {
        move_uploaded_file($_FILES["file"]["tmp_name"], $target_file);
        // echo $currentSource."_referenceData"."/".basename($target_file);;
        // return;        
    } 

    if (!file_exists($target_file)) 
    {
        echo "fail";
        return;
    }

    // if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) 
    // {
    $dataToSave = $currentSource."_referenceData"."/".basename($target_file);        
    if(AddDocumentReference($projectName, $checkName, $dataToSave))
    {
        echo $dataToSave;
    }
    else
    {
        echo "fail"; 
    }        
    // }
    //  else 
    // {
    //     echo "fail 64";
    // }

   
    function AddDocumentReference($projectName, $checkName, 
                                  $referenceData)
    {
        $dbh;
        try{
            $currentSource =  $_POST['currentSource'];
            $tableName = $currentSource."_References";             
            $components = json_decode($_POST['components'],false);        
            $typeofReference = $_POST['typeofReference'];

            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();

          
            $command = 'CREATE TABLE IF NOT EXISTS '. $tableName. '(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                webAddress TEXT,
                document TEXT,
                pic TEXT,
                comment TEXT,
                component INTEGER NOT NULL    
              )';         
            $dbh->exec($command);                      
 
            switch($typeofReference)
            {
                case "Document":

                    for($i = 0; $i< count($components); $i++)
                    {
                        $component = $components[$i];
                        $qry = 'INSERT INTO '.$tableName. '(document, component) VALUES(?,?) '; 
                        $stmt = $dbh->prepare($qry);
                        $stmt->execute( array($referenceData,  $component));      
                    }

                   
                    break;
                case "Image":
                    for($i = 0; $i< count($components); $i++)
                    {
                        $component = $components[$i];
                        $qry = 'INSERT INTO '.$tableName. '(pic, component) VALUES(?,?) '; 
                        $stmt = $dbh->prepare($qry);
                        $stmt->execute( array($referenceData,  $component));      
                    }                  
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