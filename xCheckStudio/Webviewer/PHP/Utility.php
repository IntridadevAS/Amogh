<?php

    function getProjectDirectoryPath($projectName){
        $projectDirPath = "../Projects/".$projectName;
        return $projectDirPath;
    }

    function getProjectDatabasePath($projectName){
        $dbPath = getProjectDirectoryPath($projectName)."/Project.db";
        return $dbPath;
    }

    function getCheckDirectoryPath($projectName, $checkName){
        $checkDirPath = getProjectDirectoryPath($projectName)."/CheckSpaces/".$checkName;
        return $checkDirPath;
    }

    function getCheckDatabasePath($projectName, $checkName){
        $dbPath = getCheckDirectoryPath($projectName, $checkName)."/".$checkName."_temp.db";
        return $dbPath;
    }

    function getSavedCheckDatabasePath($projectName, $checkName) {
        $dbPath = getCheckDirectoryPath($projectName, $checkName)."/".$checkName.".db";
        return $dbPath;
    }

    function getCheckSourceAPath($projectName, $checkName) {
        $dbPath = getCheckDirectoryPath($projectName, $checkName)."/SourceA";
        return $dbPath;
    }

    function getCheckSourceBPath($projectName, $checkName){
        $dbPath = getCheckDirectoryPath($projectName, $checkName)."/SourceB";
        return $dbPath;
    }

    function getCheckSourceCPath($projectName, $checkName) {
        $dbPath = getCheckDirectoryPath($projectName, $checkName)."/SourceC";
        return $dbPath;
    }

    function getCheckSourceDPath($projectName, $checkName){
        $dbPath = getCheckDirectoryPath($projectName, $checkName)."/SourceD";
        return $dbPath;
    }

    function tableExists($dbh, $tableName) {
        $results = $dbh->query("SELECT * FROM $tableName;");
        if($results) 
        {
            //var_dump($results);
            return true;
        }      

        return false;
    }

    function deleteFolder($dir){
        $files = array_diff(scandir($dir), array('.','..')); 
        foreach ($files as $file) { 
            (is_dir("$dir/$file")) ? deleteFolder("$dir/$file") : unlink("$dir/$file"); 
        }
        return rmdir($dir);
    }

    function renameFolder($sourceDir, $destinationDir) {
        return rename( $sourceDir, $destinationDir) ;
    }

    function CopyFile($soureFilePath, $destinationFilePath){
        return copy($soureFilePath, $destinationFilePath);
    }

    function CheckIfFileExists($path){
        return file_exists($path);
    }

    function CopyDirRecursively($source, $dest) 
    { 
        // Simple copy for a file 
        if (is_file($source)) {
            // chmod($dest, 777);
            return copy($source, $dest); 
        } 

        // Make destination directory 
        if (!is_dir($dest)) { 
            mkdir($dest); 
        }

        // chmod($dest, 777);

        // Loop through the folder 
        $dir = dir($source); 
        while (false !== $entry = $dir->read()) { 
            // Skip pointers 
            if ($entry == '.' || $entry == '..') { 
                continue; 
            } 

            // Deep copy directories 
            if ($dest !== "$source/$entry") { 
                CopyDirRecursively("$source/$entry", "$dest/$entry"); 
            } 
        } 

        // Clean up 
        $dir->close(); 
        return true; 
    }
?>