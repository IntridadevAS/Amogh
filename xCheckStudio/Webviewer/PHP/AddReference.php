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
    
    
    AddReference();
 
    function AddReference()
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

          
            $command = 'CREATE TABLE IF NOT EXISTS '. $tableName. '(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                webAddress TEXT,
                document TEXT,
                pic TEXT,
                comment TEXT,
                component INTEGER NOT NULL       
              )';         
            $dbh->exec($command);              
           
            // $parentComponent = (int)$component;
            switch($typeofReference)
            {
                case "WebAddress":
                    for($i = 0; $i< count($components); $i++)
                    {
                        $component = $components[$i];
                        $qry = 'INSERT INTO '.$tableName. '(webAddress, component) VALUES(?,?) '; 
                        $stmt = $dbh->prepare($qry);
                        $stmt->execute( array($referenceData,  $component));      
                    }
                                  
                    break;
                case "Document":
                
                    break;
                case "Image":
                    
                    break;
                case "Comment":
                    for($i = 0; $i< count($components); $i++)
                    {
                        $component = $components[$i];
                        $qry = 'INSERT INTO '.$tableName. '(comment, component) VALUES(?,?) '; 
                        $stmt = $dbh->prepare($qry);
                        $stmt->execute( array($referenceData,  $component));      
                    }
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