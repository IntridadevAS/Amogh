<?php

    if(!isset($_POST['ReferenceDataDir']))
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
        echo "fail";
        return;        
    }

    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) 
    {
        echo basename( $_FILES["fileToUpload"]["name"]);
    }
     else 
    {
        echo "fail";
    }
?>