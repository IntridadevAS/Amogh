<?php 
 require_once '../PHP/Utility.php';
// check if sourceA and sourceB paths are in session data
if(!isset($_POST['CheckName']) || 
!isset($_POST['ProjectName']))
{
 echo 'fail';
 return; 
}

$projectName = $_POST['ProjectName'];
$checkName = $_POST['CheckName'];

   $scriptParentDirectory = dirname ( __DIR__ );

var_dump($_FILES['files']);

if($_POST['Source'] == "a")
{
    $uploadDirectory =  getCheckSourceAPath($projectName, $checkName);    
}
else if($_POST['Source'] == "b")
{
    $uploadDirectory =  getCheckSourceBPath($projectName, $checkName);
}
else if($_POST['Source'] == "c")
{
    $uploadDirectory =  getCheckSourceCPath($projectName, $checkName);      
}
else if($_POST['Source'] == "d")
{
    $uploadDirectory =  getCheckSourceDPath($projectName, $checkName); 
}

if(isset($_FILES['files']['name'][0]))
{
    foreach($_FILES['files']['name'] as $keys => $values)
    {       
        $sourcePath = $_FILES["files"]["tmp_name"][$keys];
        $targetPath = $_FILES["files"]["name"][$keys];
     
        $UploadFolder= $uploadDirectory."/".$targetPath;    
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

