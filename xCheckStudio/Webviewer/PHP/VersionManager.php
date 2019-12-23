<?php
    require_once 'Utility.php';

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $InvokeFunction = trim($_POST["InvokeFunction"], " ");
        switch ($InvokeFunction) {
            case "CreateVersion":
                CreateVersion();
                break; 
            case "ReadVersions":
                ReadVersions();
                break;         
            case "SetFavourite":
                SetFavourite();
                break;    
            case "DeleteVersion":
                DeleteVersion();
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

            // create/copy version db
            $checkspaceDir = getCheckDirectoryPath($projectName, $checkName);
            $versionsDir = $checkspaceDir."/Versions";
            if(!file_exists( $versionsDir))
            {
                mkdir($versionsDir, 0777, true);
            }
            $versionDBPath = $versionsDir."/".$versionData['name'].".db";
            copy( $dBPath , $versionDBPath);
           

            // delete versions table from version db
            $versionDbh = new PDO("sqlite:$versionDBPath") or die("cannot open the database");         

            // begin the transaction
            $versionDbh->beginTransaction();
                       
            // drop table if exists
            $command = 'DROP TABLE IF EXISTS Versions;';
            $versionDbh->exec($command);

             // commit update
             $versionDbh->commit();            
             $versionDbh = null; //This is how you close a PDO connection   

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

    function ReadVersions()
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

            $dBPath = getCheckDatabasePath($projectName, $checkName);  

            // open database             
            $dbh = new PDO("sqlite:$dBPath") or die("cannot open the database");       
           
            // begin the transaction
            $dbh->beginTransaction();

            $query =  "select *from Versions;";      
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
            echo json_encode(array("Msg" =>  "Versions not found.",
            "Data" => array(),
            "MsgCode" => 1));  

           }

           return;
        }
        catch(Exception $e) 
        {       
           
        } 

        echo json_encode(array("Msg" =>  "Failed to create version.",
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
            
            $versionId = $_POST['versionId'];	
            $favorite = $_POST['favorite'];  

            $dBPath = getCheckDatabasePath($projectName, $checkName);  

            // open database             
            $dbh = new PDO("sqlite:$dBPath") or die("cannot open the database");       
           
            // begin the transaction
            $dbh->beginTransaction();

            $query = "UPDATE Versions SET IsFav=? WHERE id=?";
            $response = $dbh->prepare($query)->execute([$favorite, $versionId]);                  

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

    function DeleteVersion()
    {
        if(!isset( $_POST['ProjectName']) ||
        !isset( $_POST['CheckName']) ||
        !isset( $_POST['versionId']))
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
            
            $versionId = $_POST['versionId'];	           

            $dBPath = getCheckDatabasePath($projectName, $checkName);  

            // open database             
            $dbh = new PDO("sqlite:$dBPath") or die("cannot open the database");       
           
            // begin the transaction
            $dbh->beginTransaction();

            $query =  "Delete from Versions where id='". $versionId."';"; 
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

        echo json_encode(array("Msg" =>  "Failed to delete version.",
        "MsgCode" => 0));
    }
?>