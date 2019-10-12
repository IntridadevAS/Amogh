<?php

    require_once 'Utility.php';

    if(!isset($_POST['currentSource']) ||   
    !isset($_POST['components'])||
    !isset($_POST['projectName']) ||
    !isset($_POST['checkName']))
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
            
            $components = json_decode($_POST['components'],false);             

            // get project name
            $projectName = $_POST['projectName'];
            $checkName = $_POST['checkName'];

            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();

            // web addresses
            $webAddressList = array();
            $webAddresses = $dbh->query("SELECT DISTINCT webAddress FROM ".$tableName." where component='".$components[0]."';");                
            if($webAddresses)
            {
                while ($webAddress = $webAddresses->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $value = $webAddress['webAddress'];

                    $validReference = true;
                    for($i = 1; $i< count($components); $i++)
                    {
                        $component = $components[$i];
                        $results =  $dbh->query("SELECT COUNT(*) FROM ".$tableName." where component='".$component."' and webAddress='". $value ."';"); 
                        if(!$results ||
                           $results->fetchColumn() <= 0)
                           {
                                $validReference = false;
                                break;
                           }                        
                    }  
                    if($validReference)
                    {
                        array_push($webAddressList, $value);                       
                    }                    
                }
            }

             // document
             $documentsList = array();
             $documents = $dbh->query("SELECT DISTINCT document FROM ".$tableName." where component='".$components[0]."';");                
             if($documents)
             {
                 while ($document = $documents->fetch(\PDO::FETCH_ASSOC)) 
                 {
                    $value = $document['document'];

                    $validReference = true;
                    for($i = 1; $i< count($components); $i++)
                    {
                        $component = $components[$i];
                        $results =  $dbh->query("SELECT COUNT(*) FROM ".$tableName." where component='".$component."' and document='". $value ."';"); 
                        if(!$results ||
                           $results->fetchColumn() <= 0)
                           {
                                $validReference = false;
                                break;
                           }                        
                    }  
                    if($validReference)
                    {
                        array_push($documentsList, $value);                       
                    }          
                 }
             }

            // image
            $imagesList = array();
            $images = $dbh->query("SELECT DISTINCT pic FROM ".$tableName." where component='".$components[0]."';");                
            if($images)
            {
                while ($image = $images->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $value = $image['pic'];

                    $validReference = true;
                    for($i = 1; $i< count($components); $i++)
                    {
                        $component = $components[$i];
                        $results =  $dbh->query("SELECT COUNT(*) FROM ".$tableName." where component='".$component."' and pic='". $value ."';"); 
                        if(!$results ||
                           $results->fetchColumn() <= 0)
                           {
                                $validReference = false;
                                break;
                           }                        
                    }  
                    if($validReference)
                    {
                        array_push($imagesList, $value);                       
                    }      
                }
            }

             // comments
             $commentsList = array();
             $comments = $dbh->query("SELECT DISTINCT comment FROM ".$tableName." where component='".$components[0]."';");                
             if($comments)
             {
                 while ($comment = $comments->fetch(\PDO::FETCH_ASSOC)) 
                 {
                    $value = $comment['comment'];

                    $validReference = true;
                    for($i = 1; $i< count($components); $i++)
                    {
                        $component = $components[$i];
                       
                        $results =  $dbh->query("SELECT COUNT(*) FROM ".$tableName." where component='".$component."' and comment='". $value ."';"); 
                        if(!$results ||
                           $results->fetchColumn() <= 0)
                           {                               
                                $validReference = false;
                                break;
                           }                             
                       
                    }  
                    if($validReference)
                    {
                        array_push($commentsList, $value);                       
                    }  
                 }
             }

            $res = array("webAddress" => $webAddressList,
            "document" => $documentsList,
            "image" => $imagesList,
            "comment" => $commentsList);          
             
            echo json_encode($res);

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