<?php
    if(!isset($_POST['ProjectName']))
    {
        echo 'fail';
        return;
    }
    $projectName = $_POST['ProjectName'];

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
                             'sourceBType'=>$record['sourceBType'], 
                             'orderMaintained'=>$record['orderMaintained']);                                 
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