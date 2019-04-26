<?php

    function getProjectDatabasePath($projectName)
    {
        $dbPath = "../Projects/".$projectName."/".$projectName.".db";
        return $dbPath;
    }

    function tableExists($dbh, $tableName)
    {
        $results = $dbh->query("SELECT *FROM $tableName;");
        if($results) 
        {
            //var_dump($results);
            return true;
        }      

        return false;
    }
?>