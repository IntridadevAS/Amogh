<?php

    if(!isset($_POST['ReferenceTable']) ||
       !isset($_POST['TypeofReference'])||
       !isset($_POST['Component'])||
       !isset($_POST['ProjectName']) ||
       !isset($_POST['referenceData']))
    {
        echo 'fail';
        return;
    }
        
    // get project name
    $projectName = $_POST['ProjectName'];

    AddReference($projectName);
    function AddReference($projectName)
    {
        $dbh;
        try{
            $tableName = $_POST['ReferenceTable'];
            $typeofReference = $_POST['TypeofReference'];
            $component = $_POST['Component'];
            $referenceData =$_POST['referenceData'];

            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();

          
            $command = 'CREATE TABLE IF NOT EXISTS '. $tableName. '(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                webAddress TEXT,
                document TEXT,
                pic TEXT,
                users TEXT,
                parentComponent INTEGER NOT NULL    
              )';         
            $dbh->exec($command);              
           
            $parentComponent = (int)$component;
            switch($typeofReference)
            {
                case "WebAddress":
                    $qry = 'INSERT INTO '.$tableName. '(webAddress, parentComponent) VALUES(?,?) '; 
                    $stmt = $dbh->prepare($qry);
                    $stmt->execute( array($referenceData,  $parentComponent));                     
                    break;
                case "Document":
                
                    break;
                case "Picture":
                    
                    break;
                case "User":
                    
                    break;           
            }            

            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection  
            
            echo $referenceData;
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        } 
    }

?>