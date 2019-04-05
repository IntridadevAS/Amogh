<?php 

session_start();
// check if sourceA and sourceB paths are in session data
if(!isset( $_SESSION["SourceAPath"]) ||
   !isset( $_SESSION["SourceBPath"]) ||
   !isset($_POST['viewerContainer']))
   {
       echo "fail";
       return;
   }

   $sourceADirectory =  $_SESSION["SourceAPath"];
   $sourceBDirectory =  $_SESSION["SourceBPath"];

   $scriptParentDirectory = dirname ( __DIR__ );

if(isset($_FILES['files']['name'][0]))
{
    foreach($_FILES['files']['name'] as $keys => $values)
    {       
        $sourcePath = $_FILES["files"]["tmp_name"][$keys];
        $targetPath = $_FILES["files"]["name"][$keys];
     
        if($_POST['viewerContainer'] == "viewerContainer1")
        {
            $UploadFolder= $scriptParentDirectory."/".$sourceADirectory."/".$targetPath;        
        }
        if($_POST['viewerContainer'] == "viewerContainer2")
        {
            $UploadFolder= $scriptParentDirectory."/".$sourceBDirectory."/".$targetPath;           
        }

        //$UploadFolder=__DIR__."/scs/".$targetPath;	
        
        if(move_uploaded_file($sourcePath, $UploadFolder))
        {
            echo 'Upload Successful.';
            echo "Source : ".$sourcePath;
            echo "Target : ".$targetPath;
            echo "Upload Folder : ".$UploadFolder;            
        }
    }
}
else
{
    echo "Error";
}

