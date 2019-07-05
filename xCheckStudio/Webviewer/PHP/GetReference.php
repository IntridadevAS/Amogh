<?php

    if(!isset($_POST['ReferenceTable']) ||    
       !isset($_POST['Component']))
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

    GetReferenceData($projectName);
    function GetReferenceData($projectName)
    {
        $dbh;
        try{
            $tableName = $_POST['ReferenceTable'];          
            $component = $_POST['Component'];            

            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();
           
            $parentComponent = (int)$component;

            $referenceData= array();

            // fetch source A components
            $stmt =  $dbh->query('SELECT *FROM  '.$tableName.' where parentComponent='.$parentComponent.';');
            if($stmt)
            {
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $reference = array();
                    $reference['id'] = $row['id'];
                    if($row['webAddress'] !== NULL)
                    {
                        $reference['webAddress'] = $row['webAddress'];
                    }
                    if($row['document'] !== NULL)
                    {
                        $reference['document'] = $row['document'];
                    }
                    if($row['pic'] !== NULL)
                    {
                        $reference['pic'] = $row['pic'];
                    }
                    if($row['users'] !== NULL)
                    {
                        $reference['users'] = $row['users'];
                    }
                    
                    array_push($referenceData, $reference);

                }
            }

            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection             
           
            echo json_encode( $referenceData );            
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        } 
    }
?>