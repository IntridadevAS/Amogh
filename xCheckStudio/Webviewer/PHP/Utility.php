<?php    
    $projectpath = getCheckDirectoryPath($projectname, $checkname);
    echo $projectpath;
    echo '\n';
    $projectpath = getCheckDatabasePath($projectname, $checkname);
    echo $projectpath;
    echo '\n';
    return;

    function getProjectDirectoryPath($projectName)
    {
        $projectDirPath = "../Projects/".$projectName;
        return $projectDirPath;
    }

    function getProjectDatabasePath($projectName)
    {

        $dbPath = getProjectDirectoryPath($projectName)."/Project.db";
        return $dbPath;
    }

    function getCheckDirectoryPath($projectName, $checkName)
    {
        $checkDirPath = getProjectDirectoryPath($projectName)."/CheckSpaces/".$checkName;
        return $checkDirPath;
    }

    function getCheckDatabasePath($projectName, $checkName)
    {
        $dbPath = getCheckDirectoryPath($projectName, $checkName)."/".$checkName."_temp.db";
        return $dbPath;
    }

    function tableExists($dbh, $tableName)
    {
        $results = $dbh->query("SELECT * FROM $tableName;");
        if($results) 
        {
            //var_dump($results);
            return true;
        }      

        return false;
    }
?>