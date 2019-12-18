<?php
    require_once 'Utility.php';

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $InvokeFunction = trim($_POST["InvokeFunction"], " ");
        switch ($InvokeFunction) {
            case "CreateVersion":
                CreateVersion();
                break;                       
            default:
            echo json_encode(array("Msg" =>  "Function not found.",
            "MsgCode" => 0));;
        }
    }

    function CreateVersion()
    {

        if(!isset( $_POST['ProjectName']) ||
        !isset( $_POST['CheckName']) ||
        !isset($_POST['VersionData']))
        {
            echo json_encode(array("Msg" =>  "Invalid input.",
            "MsgCode" => 0));  
    
            return;
        }
        
        try
        {    
            // get project name
            $projectName = $_POST['ProjectName'];	
            $checkName = $_POST['CheckName'];     
            $versionData = json_decode($_POST['VersionData'], true);            

            $dBPath = getCheckDatabasePath($projectName, $checkName);  

            // open database             
            $dbh = new PDO("sqlite:$dBPath") or die("cannot open the database");       
            // begin the transaction
            $dbh->beginTransaction();

            $query =  "select name from Versions where name=\"". $versionData['name']."\" COLLATE NOCASE;";      
            $stmt = $dbh->query($query);

            if( $stmt )
            {
                $count=0;                
                while($row = $stmt->fetch(\PDO::FETCH_ASSOC))
                {
                    $count = $count+1;
                }
                if ($count != 0)
                {
                    echo json_encode(array("Msg" =>  "Version '". $versionData['name']."' already exists.",                       
                                "MsgCode" => 0)); 
                                
                    $dbh->commit();
                    $dbh = null; //This is how you close a PDO connection
                    return;
                }
            }

            $command = 'CREATE TABLE IF NOT EXISTS Versions(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,
            description TEXT,
            comments TEXT,
            createdById TEXT,
            createdByAlias TEXT,
            createdOn TEXT,
            IsFav INTEGER       
            )';               
            $dbh->exec($command);   

            $insertStmt = $dbh->prepare("INSERT INTO Versions(name, 
                                        description, 
                                        comments,
                                        createdById, 
                                        createdByAlias,
                                        createdOn, 
                                        IsFav) VALUES(?,?,?,?,?,?,?)");            
            
            $insertStmt->execute(array($versionData['name'], 
                                    $versionData['description'], 
                                    $versionData['comments'],
                                    $versionData['createdBy'], 
                                    $versionData['userAlias'],
                                    $versionData['createdOn'],
                                    $versionData['IsFav']));            

            $versionData ["id"] = $dbh->lastInsertId();

            // commit update
            $dbh->commit();            
            $dbh = null; //This is how you close a PDO connection   

            
            echo json_encode(array("Msg" =>  "success",
            "Data" => $versionData,
            "MsgCode" => 1));  
            return;
        }
        catch(Exception $e) 
        {       
           
        } 

        echo json_encode(array("Msg" =>  "Failed to create version.",
        "MsgCode" => 0));          
    }
?>