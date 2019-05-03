<?php
    
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

    $values =readCheckCaseInfo();
    if($values != 'fail')
    {
        echo json_encode($values);
    }
    else 
    {
        echo 'fail';        
    }

    function readCheckCaseInfo()
    {      
        global $projectName;

        $dbh;
        try
        {        
            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();
            
            $results = $dbh->query("SELECT *FROM CheckCaseInfo;");     

            while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
            {
                return array('checkCaseData' => $record['checkCaseData']);                                 
            }

            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection                 
                            
            return;
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        } 
    }
?>