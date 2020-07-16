<?php
    require_once 'Utility.php';

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $InvokeFunction = trim($_POST["InvokeFunction"], " ");
        switch ($InvokeFunction) {
            case "CreateRevision":
                CreateRevision();
                break; 
            case "ReadRevisions":
                ReadRevisions();
                break;         
            case "SetFavourite":
                SetFavourite();
                break;    
            case "DeleteRevision":
                DeleteRevision();
                break;                                     
            default:
            echo json_encode(array("Msg" =>  "Function not found.",
            "MsgCode" => 0));;
        }
    }

    function CreateRevision()
    {

        if (
            !isset($_POST['ProjectName']) ||
            !isset($_POST['CheckName']) ||
            !isset($_POST['RevisionData'])
        ) {
            echo json_encode(array(
                "Msg" =>  "Invalid input.",
                "MsgCode" => 0
            ));

            return;
        }

        try {
            // get project name
            $projectName = $_POST['ProjectName'];
            $checkName = $_POST['CheckName'];
            $revisionData = json_decode($_POST['RevisionData'], true);

            $dBPath = getCheckDatabasePath($projectName, $checkName);

            // open database             
            $dbh = new PDO("sqlite:$dBPath") or die("cannot open the database");
            // begin the transaction
            $dbh->beginTransaction();

            // check if revision with same name for given datasource type exists
            $query =  "select name from DataChangeRevisions where name=\"" . $revisionData['name'] . "\" COLLATE NOCASE and dataSourceType=\"". $revisionData['dataSourceType'] ."\" COLLATE NOCASE;";
            $stmt = $dbh->query($query);
            if ($stmt) {
                $count = 0;
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $count = $count + 1;
                }
                if ($count != 0) {
                    echo json_encode(array(
                        "Msg" =>  "Revision '" . $revisionData['name'] . "' already exists.",
                        "MsgCode" => 0
                    ));

                    $dbh->commit();
                    $dbh = null; //This is how you close a PDO connection
                    return;
                }
            }
           
            $command = 'CREATE TABLE IF NOT EXISTS DataChangeRevisions(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,
                description TEXT,
                comments TEXT,
                createdById TEXT,
                createdByAlias TEXT,
                createdOn TEXT,
                IsFav INTEGER,
                dataSourceName TEXT,       
                dataSourceType TEXT)';
            $dbh->exec($command);

            $insertStmt = $dbh->prepare("INSERT INTO DataChangeRevisions(name, 
                                            description, 
                                            comments,
                                            createdById, 
                                            createdByAlias,
                                            createdOn, 
                                            IsFav,
                                            dataSourceName,
                                            dataSourceType) VALUES(?,?,?,?,?,?,?,?,?)");

            $insertStmt->execute(array(
                $revisionData['name'],
                $revisionData['description'],
                $revisionData['comments'],
                $revisionData['createdBy'],
                $revisionData['userAlias'],
                $revisionData['createdOn'],
                $revisionData['IsFav'],
                $revisionData['dataSourceName'],
                $revisionData['dataSourceType']
            ));

            $revisionData["id"] = $dbh->lastInsertId();


            // create/copy version db
            $checkspaceDir = getCheckDirectoryPath($projectName, $checkName);
            $revisionsDir = $checkspaceDir . "/Revisions/". $revisionData['dataSourceName'];
            if (!file_exists($revisionsDir)) {
                mkdir($revisionsDir, 0777, true);
            }
            $revisionDBPath = $revisionsDir . "/" . $revisionData['name']."-". $revisionData['dataSourceType'] . ".db";
            // copy( $dBPath , $versionDBPath);

            // delete versions table from version db
            $revisionDbh = new PDO("sqlite:$revisionDBPath") or die("cannot open the database");

            // begin the transaction
            $revisionDbh->beginTransaction();

            $componentsTable = "AllComponents".$revisionData['srcId'];
      
            if ($componentsTable !== null) {            

                // create table
                $command = 'DROP TABLE IF EXISTS ' . $componentsTable . ';';
                $revisionDbh->exec($command);

                // ischecked can have values 'true' or 'false'
                $command = 'CREATE TABLE Components(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        value TEXT NOT NULL
                    )';
                $revisionDbh->exec($command);

                $insertComponentStmt = $revisionDbh->prepare("INSERT INTO Components(value) VALUES(?)");

                $insertComponentStmt->execute(array($revisionData['allComponents']));
            }

            // commit update             
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection   
            $revisionDbh->commit();
            $revisionDbh = null; //This is how you close a PDO connection   

            echo json_encode(array(
                "Msg" =>  "success",
                "Data" => $revisionData,
                "MsgCode" => 1
            ));
            return;
        } catch (Exception $e) {
        }

        echo json_encode(array(
            "Msg" =>  "Failed to create revision.",
            "MsgCode" => 0
        ));
    }

    function ReadRevisions()
    {
        if(!isset( $_POST['ProjectName']) ||
        !isset( $_POST['CheckName']) ||
        !isset($_POST['dataSourceType']))
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
            $dataSourceType = $_POST['dataSourceType'];        

            $dBPath = getCheckDatabasePath($projectName, $checkName);  

            // open database             
            $dbh = new PDO("sqlite:$dBPath") or die("cannot open the database");       
           
            // begin the transaction
            $dbh->beginTransaction();

            $query =  "select *from DataChangeRevisions where dataSourceType=\"". $dataSourceType ."\" COLLATE NOCASE;";      
            $stmt = $dbh->query($query);

            // commit update
            $dbh->commit();            
            $dbh = null; //This is how you close a PDO connection   

            if($stmt)
           {
                echo json_encode(array("Msg" =>  "success",
                "Data" => $stmt->fetchAll(PDO::FETCH_ASSOC),
                "MsgCode" => 1));  
           } 
           else
           {
            echo json_encode(array("Msg" =>  "Revisions not found.",
            "Data" => array(),
            "MsgCode" => 1));  

           }

           return;
        }
        catch(Exception $e) 
        {       
           
        } 

        echo json_encode(array("Msg" =>  "Failed to read revisions.",
        "MsgCode" => 0));
    }

    function SetFavourite()
    {
        if(!isset( $_POST['ProjectName']) ||
        !isset( $_POST['CheckName']))
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
            
            $revisionId = $_POST['revisionId'];	
            $favorite = $_POST['favorite'];  

            $dBPath = getCheckDatabasePath($projectName, $checkName);  

            // open database             
            $dbh = new PDO("sqlite:$dBPath") or die("cannot open the database");       
           
            // begin the transaction
            $dbh->beginTransaction();

            $query = "UPDATE DataChangeRevisions SET IsFav=? WHERE id=?";
            $response = $dbh->prepare($query)->execute([$favorite, $revisionId]);                  

            // commit update
            $dbh->commit();            
            $dbh = null; //This is how you close a PDO connection   

            echo json_encode(array("Msg" =>  "Success",
            "Data" => $response,
            "MsgCode" => 1));  
            return;
        }
        catch(Exception $e) 
        {       
           
        } 

        echo json_encode(array("Msg" =>  "Failed to set favorite.",
        "MsgCode" => 0));
    }
    
    function DeleteRevision()
    {
        if(!isset( $_POST['ProjectName']) ||
        !isset( $_POST['CheckName']) ||
        !isset( $_POST['revisionId']))
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
            
            $revisionId = $_POST['revisionId'];	           

            $dBPath = getCheckDatabasePath($projectName, $checkName);  

            // open database             
            $dbh = new PDO("sqlite:$dBPath") or die("cannot open the database");       
           
            // begin the transaction
            $dbh->beginTransaction();

            // remove revision db first
          
            $query =  "select *from DataChangeRevisions where id='". $revisionId."';"; 
            $stmt = $dbh->query($query);
            if ($stmt) {
                $revisionName = null;
                $dataSourceName = null;
                $dataSourceType = null;
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $revisionName = $row['name'];
                    $dataSourceName = $row['dataSourceName'];
                    $dataSourceType = $row['dataSourceType'];
                    break;
                }

                if (
                    $revisionName !== null &&
                    $dataSourceName !== null &&
                    $dataSourceType !== null
                ) {
                    $checkspaceDir = getCheckDirectoryPath($projectName, $checkName);
                    $revisionsDir = $checkspaceDir . "/Revisions/" . $dataSourceName;
                    if (file_exists($revisionsDir)) {
                        $revisionDBPath = $revisionsDir . "/" . $revisionName . "-" . $dataSourceType . ".db";
                        if (file_exists($revisionDBPath)) {
                            unlink($revisionDBPath);
                        }
                    }
                }
            }          

            $query =  "Delete from DataChangeRevisions where id='". $revisionId."';"; 
            $stmt = $dbh->prepare($query);      
            $stmt->execute();          

            // commit update
            $dbh->commit();            
            $dbh = null; //This is how you close a PDO connection   

            echo json_encode(array("Msg" =>  "Success",
            "MsgCode" => 1));  
            return;
        }
        catch(Exception $e) 
        {       
           
        } 

        echo json_encode(array("Msg" =>  "Failed to delete revision.",
        "MsgCode" => 0));
    }