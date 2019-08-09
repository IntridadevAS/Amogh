<?php
    require_once 'Utility.php';
    if(!isset($_POST['Source']) || !isset($_POST['ProjectName']) || !isset($_POST['CheckName']) ||)
    {
        echo 'fail';
        return;
    }
    
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
    $excludeFile = "../Projects/".$projectName."/".$projectName.".db";
    $exclude[] = $excludeFile;
    deleteFilesFromDirectory();

function deleteAll($str) {
    //It it's a file.
    if (is_file($str)) {
        //Attempt to delete it.
        return unlink($str);
    }
    //If it's a directory.
    elseif (is_dir($str)) {
        //Get a list of the files in this directory.
        $scan = glob(rtrim($str,'/').'/*');
        //Loop through the list of files.
        foreach($scan as $index=>$path) {
            //Call our recursive function.
            deleteAll($path);
        }
    }
}
 
//call our function


function deleteFilesFromDirectory() {
    $source = $_POST['Source'];
    global $projectName;
    if(strtolower($source) == "both") {
        $folderpath = "../Projects/".$projectName."/SourceA";
        deleteAll($folderpath);

        $folderpath = "../Projects/".$projectName."/SourceB";
        deleteAll($folderpath);
    }
    else if(strtolower($source) == "sourcea") {
        $folderpath = "../Projects/".$projectName."/SourceA";
        deleteAll($folderpath);
    }
    else if(strtolower($source) == "sourceb") {
        $folderpath = "../Projects/".$projectName."/SourceB";
        deleteAll($folderpath);
    }
    
}
//The name of the folder.

?>