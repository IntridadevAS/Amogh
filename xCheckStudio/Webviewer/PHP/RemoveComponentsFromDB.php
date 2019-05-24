<?php
    if(!isset($_POST['Source']))
    {
        echo 'fail';
        return;
    }
    session_start();
    
    // get project name
    $projectName = NULL;
    if(isset($_SESSION['projectname']))
    {
        $projectName =  $_SESSION['projectname'];              
    }
    else
    {
        echo 'fail';
        return;
    }

    removeComponentsFromDB();

    function removeComponentsFromDB()
    {
        $dbh;
        try{
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            $dbh->beginTransaction();

            // drop table if exists
            if(strtolower($source) == "sourcea")
            {
                $componentsTableName = "SourceAComponents";
                $propertiesTableName = "SourceAProperties";

                $command = 'DROP TABLE IF EXISTS '. $componentsTableName. ';';
                $dbh->exec($command);

                $command = 'DROP TABLE IF EXISTS '. $propertiesTableName. ';';
                $dbh->exec($command);
            }
            else if(strtolower($source) == "sourceb")
            {
                $componentsTableName = "SourceBComponents";
                $propertiesTableName = "SourceBProperties";

                $command = 'DROP TABLE IF EXISTS '. $componentsTableName. ';';
                $dbh->exec($command);

                $command = 'DROP TABLE IF EXISTS '. $propertiesTableName. ';';
                $dbh->exec($command);
            }
            else if(strtolower($source) == "both")
            {
                $componentsATableName = "SourceAComponents";
                $propertiesATableName = "SourceAProperties";
                $componentsBTableName = "SourceBComponents";
                $propertiesBTableName = "SourceBProperties";

                $command = 'DROP TABLE IF EXISTS '. $componentsATableName. ';';
                $dbh->exec($command);

                $command = 'DROP TABLE IF EXISTS '. $propertiesATableName. ';';
                $dbh->exec($command);

                $command = 'DROP TABLE IF EXISTS '. $componentsBTableName. ';';
                $dbh->exec($command);

                $command = 'DROP TABLE IF EXISTS '. $propertiesBTableName. ';';
                $dbh->exec($command);
            }
            $dbh->commit();
            $dbh = null;        
        }
        catch(Exception $e) {        
            echo "fail"; 
            return;
        } 
    }
?>