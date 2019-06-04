<?php
    
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
            $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();
            
            $results = $dbh->query("SELECT *FROM  DatasourceInfo;");     

            $data = array();
            while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
            {
                $data = array('sourceAFileName' => $record['sourceAFileName'], 
                             'sourceBFileName'=> $record['sourceBFileName'], 
                             'sourceAType'=>$record['sourceAType'], 
                             'sourceBType'=>$record['sourceBType']);                                 
            }

            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection                 
                            
            return  $data;
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        } 
    }
?>