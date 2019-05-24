<?php
    if(!isset($_POST['Source']))
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

    removeComponentsFromDB();

    function removeComponentsFromDB()
    {
        global $projectName;
        $dbh;
        try{
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
            $source = $_POST['Source']; 
            $dbh->beginTransaction();

            $command = "SELECT name FROM sqlite_master WHERE type ='table' AND name NOT LIKE 'sqlite_%'";
            $stmt = $dbh->query($command);
            $listOfTables = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // drop table if exists
            if(strtolower($source) == "sourcea")
            {
                foreach ($listOfTables as $tableName) 
                {
                    $name = $tableName["name"]; 
                    if($name !== "SourceAComponents" && $name !== "SourceAProperties")   
                    {
                        $command1 = 'DROP TABLE IF EXISTS '.$name. ';';
                        $out = $dbh->query($command1);
                    }                
                }
            }
            else if(strtolower($source) == "sourceb")
            {
                foreach ($listOfTables as $tableName) 
                {
                    $name = $tableName["name"]; 
                    if($name !== "SourceBComponents" && $name !== "SourceBProperties")       
                    {
                        $command1 = 'DROP TABLE IF EXISTS '.$name. ';';
                        $out = $dbh->query($command1);
                    } 
                }
            }
            else if(strtolower($source) == "both")
            {
                foreach ($listOfTables as $tableName) 
                {
                    $name = $tableName["name"];                   
                    $command1 = 'DROP TABLE IF EXISTS '.$name. ';';
                    $out = $dbh->query($command1);
                }
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