<?php
    require_once 'Utility.php';

    if(!isset($_POST['currentSource']) ||
       !isset($_POST['typeofReference'])||
       !isset($_POST['component'])||
       !isset($_POST['projectName']) ||
       !isset($_POST['checkName']) ||
       !isset($_POST['referenceData']))
    {
        echo 'fail';
        return;
    }
        
    // get project name
    $projectName = $_POST['projectName'];
    $checkName = $_POST['checkName'];
    AddReference($projectName);
    function AddReference($projectName)
    {
        $dbh;
        try{ 
            $currentSource = $_POST['currentSource']
            $tableName = $currentSource."_References";
 
            $tableName = $_POST['ReferenceTable'];
            $typeofReference = $_POST['typeofReference'];
            $component = $_POST['component'];
            $referenceData =$_POST['referenceData'];

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