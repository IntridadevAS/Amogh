<?php
    require_once 'Utility.php';
    if(!isset($_POST['ProjectName']) || !isset($_POST['CheckName']))
    {
        echo 'fail';
        return;
    }
        
    // get project name
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
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
        global $checkName;
        $dbh;
        try
        {        
            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            if(CheckIfFileExists($dbPath) === false){
                echo "fail"; 
                return;
            }
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