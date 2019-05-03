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

    $values =readDataSourceInfo();
    if($values != 'fail')
    {
        echo json_encode( $values);
    }
    else 
    {
        echo 'fail';        
    }

    function readDataSourceInfo()
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
            
            $results = $dbh->query("SELECT *FROM  DatasourceInfo;");     

            while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
            {
                return array('sourceAFileName' => $record['sourceAFileName'], 
                             'sourceBFileName'=> $record['sourceBFileName'], 
                             'sourceAType'=>$record['sourceAType'], 
                             'sourceBType'=>$record['sourceBType']);                                 
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