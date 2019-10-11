<?php

    require_once 'Utility.php';

    if(!isset($_POST['currentSource']) ||
    !isset($_POST['typeofReference'])||
    !isset($_POST['components'])||
    !isset($_POST['projectName']) ||
    !isset($_POST['checkName']) ||
    !isset($_POST['referenceData']))
    {
        echo 'fail';
        return;
    }     

    removeReference();

    function removeReference()
    {
        $dbh;
        try{ 
            $currentSource = $_POST['currentSource'];
            $tableName = $currentSource."_References"; 
            
            $typeofReference = $_POST['typeofReference'];
            $components = json_decode($_POST['components'],false);
            $referenceData =$_POST['referenceData'];         

            // get project name
            $projectName = $_POST['projectName'];
            $checkName = $_POST['checkName'];

            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();


            switch($typeofReference)
            {
                case "WebAddress":
                        for($i = 0; $i< count($components); $i++)
                        {
                            $component = $components[$i];
                            $query =  "Delete from ".$tableName." where component='". $component."' and webAddress='". $referenceData . "';"; 
                            $stmt = $dbh->prepare($query);      
                            $stmt->execute();
                        }
                                  
                    break;
                case "Document":
                        for($i = 0; $i< count($components); $i++)
                        {
                            $component = $components[$i];
                            $query =  "Delete from ".$tableName." where component='". $component."' and document='". $referenceData . "';"; 
                            $stmt = $dbh->prepare($query);      
                            $stmt->execute();
                        }
                    break;
                case "Image":
                        for($i = 0; $i< count($components); $i++)
                        {
                            $component = $components[$i];
                            $query =  "Delete from ".$tableName." where component='". $component."' and pic='". $referenceData . "';"; 
                            $stmt = $dbh->prepare($query);      
                            $stmt->execute();
                        }
                    break;
                case "Comment":
                        for($i = 0; $i< count($components); $i++)
                        {
                            $component = $components[$i];
                            $query =  "Delete from ".$tableName." where component='". $component."' and comment='". $referenceData . "';"; 
                            $stmt = $dbh->prepare($query);      
                            $stmt->execute();
                        }
                    break;           
            }         

           

             // commit update
             $dbh->commit();
             $dbh = null; //This is how you close a PDO connection  

        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        } 
    }

?>