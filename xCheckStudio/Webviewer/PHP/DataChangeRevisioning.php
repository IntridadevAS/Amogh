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
            case "ReadRevisionComponents":
                 ReadRevisionComponents();
                 break;
            case "CheckRevisions":
                CheckRevisions();
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

            $query = null;
            if ($dataSourceType) {
                $query =  "select *from DataChangeRevisions where dataSourceType=\"" . $dataSourceType . "\" COLLATE NOCASE;";
            } else {
                $query =  "select *from DataChangeRevisions;";
            }
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

    function ReadRevisionComponents()
    {
        if (
            !isset($_POST['ProjectName']) ||
            !isset($_POST['CheckName']) ||
            !isset($_POST['revisionData'])
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
                $revisionData = json_decode($_POST['revisionData'], true);

                $checkspaceDir = getCheckDirectoryPath($projectName, $checkName);

                $data = ReadComponents($checkspaceDir, $revisionData);
                echo json_encode(array(
                    "Msg" =>  "success",
                    "Data" => $data,
                    "MsgCode" => 1
                ));
        } 
        catch (Exception $e) {
            echo json_encode(array(
                "Msg" =>  "Failed",
                "MsgCode" => 0
            ));

            return;
        }        
    }

    function ReadComponents($checkspaceDir, $revisionData)
    {
        $data = null;
        try {
            $revisionDb = $checkspaceDir .
                "/Revisions/" .
                $revisionData["dataSourceName"] .
                "/" .
                $revisionData["revisionName"] .
                "-" .
                strtolower($revisionData["dataSourceType"]) .
                ".db";

            if (file_exists($revisionDb)) {
                // open database             
                $dbh = new PDO("sqlite:$revisionDb") or die("cannot open the database");

                // begin the transaction
                $dbh->beginTransaction();

                $query =  "select *from Components;";
                $stmt = $dbh->query($query);
                if ($stmt) {
                    $components = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    for ($i = 0; $i < count($components); $i++) {
                        $data = $components[$i]['value'];
                        break;
                    }
                }

                // commit update
                $dbh->commit();
                $dbh = null; //This is how you close a PDO connection                   
            }
        } catch (Exception $e) {
        }

        return $data;
    }

    function CheckRevisions()
    {
        if (
            !isset($_POST['ProjectName']) ||
            !isset($_POST['CheckName']) ||
            !isset($_POST['sourceRevisionData']) ||
            !isset($_POST['targetRevisionData']) ||
            !isset($_POST['options']) ||
            !isset($_POST['components']) ||
            !isset($_POST['isTargetNewer'])
        )
        {
            echo json_encode(array(
                "Msg" =>  "Invalid input.",
                "MsgCode" => 0
            ));

            return;
        }

        try
        {
            // get project name
            $projectName = $_POST['ProjectName'];
            $checkName = $_POST['CheckName'];
            $sourceRevisionData = json_decode($_POST['sourceRevisionData'], true);
            $targetRevisionData = json_decode($_POST['targetRevisionData'], true);
            $components = json_decode($_POST['components'], true);
            $isTargetNewer = strtolower($_POST['isTargetNewer']);

            $options = json_decode($_POST['options'], true);
            $matchwiths = $options["matchwith"];
            $listby = $options["listby"];
            if (
                count($matchwiths) === 0 ||
                !$listby
            )
            {
                echo json_encode(array(
                    "Msg" =>  "Invalid Options",
                    "MsgCode" => 0
                ));

                return;
            }

            $checkspaceDir = getCheckDirectoryPath($projectName, $checkName);

            // get source components
            $srcComponents = null;          
            if(strtolower($sourceRevisionData["revisionName"]) === "current")
            {
                $srcComponents = $components["source"];
            }
            else 
            {
                $srcComponentsStr = ReadComponents($checkspaceDir, $sourceRevisionData);
                if (!$srcComponentsStr)
                {
                    echo json_encode(array(
                        "Msg" =>  "Failed",
                        "MsgCode" => 0
                    ));
    
                    return;
                }
                $srcComponents = json_decode($srcComponentsStr, true);
            }

            // get target components
            $targetComponents = null;
            if (strtolower($targetRevisionData["revisionName"]) === "current")
            {
                $targetComponents = $components["target"];
            }
            else
            {
                $targetComponentsStr = ReadComponents($checkspaceDir, $targetRevisionData);
                if (!$targetComponentsStr)
                {
                    echo json_encode(array(
                        "Msg" =>  "Failed",
                        "MsgCode" => 0
                    ));

                    return;
                }

                $targetComponents = json_decode($targetComponentsStr, true);
            }

            if (
                !$srcComponents ||
                !$targetComponents
            )
            {
                echo json_encode(array(
                    "Msg" =>  "Invalid Components",
                    "MsgCode" => 0
                ));

                return;
            }


            $checkResult = array();
            // check from target to source
            foreach ($targetComponents as $nodeId => $component)
            {
                // check if component is having properties            
                if (
                    !array_key_exists("properties", $component) ||
                    count($component["properties"]) === 0
                )
                {
                    // if component doesn't have properties and check can't
                    // be performed, so this we will be added as new item
                    if (!array_key_exists("Undefined", $checkResult))
                    {
                        $checkResult["Undefined"] =  array();
                    }

                    $newItem = array();
                    $newItem["target"] = $component;

                    $newItem["status"] = "New Item";
                    if ($isTargetNewer === "false")
                    {
                        $newItem["status"] = "Deleted Item";
                    }

                    array_push($checkResult["Undefined"], $newItem);

                    continue;
                }

                // check if all match with properties exist 
                // in target item. If not, then it is new item
                $skipThis = false;
                for ($i = 0; $i < count($matchwiths); $i++)
                {
                    $matchwith = $matchwiths[$i];
                    $prop = GetProperty($component, $matchwith["target"]);
                    if ($prop === null)
                    {
                        $newItem = array();
                        $newItem["target"] = $component;
                        $newItem["status"] = "New Item";
                        if ($isTargetNewer === "false")
                        {
                            $newItem["status"] = "Deleted Item";
                        }

                        // check if list by property exists
                        $prop = GetProperty($component, $listby);
                        if ($prop === null)
                        {
                            if (!array_key_exists("Undefined", $checkResult))
                            {
                                $checkResult["Undefined"] =  array();
                            }
                            array_push($checkResult["Undefined"], $newItem);
                        }
                        else
                        {
                            if (!array_key_exists($prop["Value"], $checkResult))
                            {
                                $checkResult[$prop["Value"]] =  array();
                            }
                            array_push($checkResult[$prop["Value"]], $newItem);
                        }

                        $skipThis = true;
                        break;
                    }
                }
                if ($skipThis === true)
                {
                    continue;
                }

                // check in source revision
                $foundMatch = false;
                foreach ($srcComponents as $nodeId => $srcComponent)
                {
                    if (CheckMatch($component, $srcComponent, $matchwiths))
                    {
                        $newItem = array();
                        $newItem["target"] = $component;
                        $newItem["source"] = $srcComponent;
                                                
                        $newItem["checkProperties"] = array();
                        $status = "No Change";
                        for($propIndex = 0; $propIndex < count($component["properties"]); $propIndex++)
                        {
                            $targetProp = $component["properties"][$propIndex];
                            
                            $sourceProp = GetProperty($srcComponent, $targetProp["Name"]);
                            if($sourceProp === null)
                            {

                                // $status = "Property Change";
                                if ($status === "No Change")
                                {
                                    $status = "New Property";
                                    if ($isTargetNewer === "false")
                                    {
                                        $status = "Deleted Property";
                                    }
                                }
                                else if (($status === "New Property" && $isTargetNewer === "false") ||
                                    ($status === "Deleted Property" && $isTargetNewer === "true")
                                )
                                {
                                    $status = "New/Deleted Property";
                                }
                                else if ($status === "Changed Property")
                                {
                                    $status = "New/Changed Property";
                                    if ($isTargetNewer === "false")
                                    {
                                        $status = "Deleted/Changed Property";
                                    }
                                }
                                else if (($status === "New/Changed Property" && $isTargetNewer === "false") ||
                                    ($status === "Deleted/Changed Property" && $isTargetNewer === "true")
                                )
                                {
                                    $status = "New/Deleted/Changed Property";
                                }
                                
                                $propStatus = "New Property";
                                if ($isTargetNewer === "false")
                                {
                                    $propStatus = "Deleted Property";
                                }
                                array_push($newItem["checkProperties"], array(
                                    "targetName" => $targetProp["Name"],
                                    "targetValue" => $targetProp["Value"],
                                    "status" => $propStatus
                                ));
                            }
                            else
                            {
                                if ($targetProp["Value"] === $sourceProp["Value"])
                                {
                                    array_push($newItem["checkProperties"], array(
                                        "targetName" => $targetProp["Name"],
                                        "targetValue" => $targetProp["Value"],
                                        "sourceName" => $sourceProp["Name"],
                                        "sourceValue" => $sourceProp["Value"],
                                        "status" => "No Change"
                                    ));
                                }
                                else
                                {
                                // $status = "Changed Property";
                                    if (strpos($status, "Changed") === false)
                                    {
                                        if ($status === "No Change")
                                        {
                                            $status = "Changed Property";
                                        }
                                        else if ($status === "New Property")
                                        {
                                            $status = "New/Changed Property";
                                        }
                                        else if ($status === "Deleted Property")
                                        {
                                            $status = "Deleted/Changed Property";
                                        }
                                        else if ($status === "New/Deleted Property")
                                        {
                                            $status = "New/Deleted/Changed Property";
                                        }
                                    }
                                    array_push($newItem["checkProperties"], array(
                                        "targetName" => $targetProp["Name"],
                                        "targetValue" => $targetProp["Value"],
                                        "sourceName" => $sourceProp["Name"],
                                        "sourceValue" => $sourceProp["Value"],
                                        "status" => "Changed Property"
                                    ));
                                }
                            }
                        }

                        // check for additional properties in source which are not in target
                        for ($propIndex = 0; $propIndex < count($srcComponent["properties"]); $propIndex++)
                        {
                            $sourceProp = $srcComponent["properties"][$propIndex];

                            $targetProp = GetProperty($component, $sourceProp["Name"]);
                            if ($targetProp === null)
                            {
                                // $status = "Property Change";
                                if ($status === "No Change")
                                {
                                    $status = "Deleted Property";
                                    if ($isTargetNewer === "false")
                                    {
                                        $status = "New Property";
                                    }
                                }
                                else if (($status === "New Property" && $isTargetNewer === "true") ||
                                    ($status === "Deleted Property" && $isTargetNewer === "false")
                                )
                                {
                                    $status = "New/Deleted Property";
                                }
                                else if ($status === "Changed Property")
                                {
                                    $status = "Deleted/Changed Property";
                                    if ($isTargetNewer === "false")
                                    {
                                        $status = "New/Changed Property";
                                    }
                                }
                                else if (($status === "New/Changed Property" && $isTargetNewer === "true") ||
                                    ($status === "Deleted/Changed Property" && $isTargetNewer === "false")
                                )
                                {
                                    $status = "New/Deleted/Changed Property";
                                }

                                $propStatus = "Deleted Property";
                                if ($isTargetNewer === "false")
                                {
                                    $propStatus = "New Property";
                                }

                                array_push($newItem["checkProperties"], array(
                                    "sourceName" => $sourceProp["Name"],
                                    // "sourceValue" => $sourceProp["Value"],
                                    "sourceValue" => "NULL", // NULL because the target is not having this property, so show NULL.
                                    "status" => $propStatus
                                ));
                                    // }
                            }
                        }

                        $newItem["status"] = $status;

                        // check if list by property exists
                        $prop = GetProperty($component, $listby);
                        if ($prop === null)
                        {
                            if (!array_key_exists("Undefined", $checkResult))
                            {
                                $checkResult["Undefined"] =  array();
                            }
                            array_push($checkResult["Undefined"], $newItem);
                        }
                        else
                        {
                            if (!array_key_exists($prop["Value"], $checkResult))
                            {
                                $checkResult[$prop["Value"]] =  array();
                            }
                            array_push($checkResult[$prop["Value"]], $newItem);
                        }

                        $foundMatch = true;
                        break;
                    }
                }
                if ($foundMatch === false)
                {
                    // new item
                    $newItem = array();
                    $newItem["target"] = $component;
                    $newItem["status"] = "New Item";
                    if ($isTargetNewer === "false")
                    {
                        $newItem["status"] = "Deleted Item";
                    }
                    $prop = GetProperty($component, $listby);
                    if ($prop === null)
                    {
                        if (!array_key_exists(
                            "Undefined",
                            $checkResult
                        ))
                        {
                            $checkResult["Undefined"] =  array();
                        }
                        array_push($checkResult["Undefined"],
                            $newItem
                        );
                    }
                    else
                    {
                        if (!array_key_exists($prop["Value"], $checkResult))
                        {
                            $checkResult[$prop["Value"]] =  array();
                        }
                        array_push($checkResult[$prop["Value"]], $newItem);
                    }
                }
            }

            // check from source to target
            foreach ($srcComponents as $nodeId => $srcComponent)
            {
                // check if component is having properties            
                if (
                    !array_key_exists("properties", $srcComponent) ||
                    count($srcComponent["properties"]) === 0
                )
                {
                    // if component doesn't have properties and check can't
                    // be performed, so this we will be added as deleted item
                    if (!array_key_exists("Undefined", $checkResult))
                    {
                        $checkResult["Undefined"] =  array();
                    }

                    $item = array();
                    $item["source"] = $srcComponent;
                    $item["status"] = "Deleted Item";
                    if ($isTargetNewer === "false")
                    {
                        $item["status"] = "New Item";
                    }

                    array_push($checkResult["Undefined"], $item);

                    continue;
                }

                // check if all match with properties exist 
                // in source item. If not, then it is deleted item
                $skipThis = false;
                for ($i = 0; $i < count($matchwiths); $i++)
                {
                    $matchwith = $matchwiths[$i];
                    $prop = GetProperty($srcComponent, $matchwith["target"]);
                    if ($prop === null)
                    {
                        $newItem = array();
                        $newItem["source"] = $srcComponent;
                        $newItem["status"] = "Deleted Item";
                        if ($isTargetNewer === "false")
                        {
                            $newItem["status"] = "New Item";
                        }

                        // check if list by property exists
                        $prop = GetProperty($srcComponent, $listby);
                        if ($prop === null)
                        {
                            if (!array_key_exists("Undefined",
                                $checkResult
                            ))
                            {
                                $checkResult["Undefined"] =  array();
                            }
                            array_push($checkResult["Undefined"], $newItem);
                        }
                        else
                        {
                            if (!array_key_exists($prop["Value"], $checkResult))
                            {
                                $checkResult[$prop["Value"]] =  array();
                            }
                            array_push($checkResult[$prop["Value"]], $newItem);
                        }

                        $skipThis = true;
                        break;
                    }
                }
                if ($skipThis === true)
                {
                    continue;
                }

                // check in target revision
                $foundMatch = false;
                foreach ($targetComponents as $nodeId => $targetComponent)
                {
                    if (CheckMatch($targetComponent, $srcComponent, $matchwiths))
                    {
                        $foundMatch = true;
                        break;
                    }
                }
                if ($foundMatch === false)
                {
                    // new item
                    $newItem = array();
                    $newItem["source"] = $srcComponent;
                    $newItem["status"] = "Deleted Item";
                    if ($isTargetNewer === "false")
                    {
                        $newItem["status"] = "New Item";
                    }

                    $prop = GetProperty($srcComponent, $listby);
                    if ($prop === null)
                    {
                        if (!array_key_exists(
                            "Undefined",
                            $checkResult
                        ))
                        {
                            $checkResult["Undefined"] =  array();
                        }
                        array_push(
                            $checkResult["Undefined"],
                            $newItem
                        );
                    }
                    else
                    {
                        if (!array_key_exists($prop["Value"], $checkResult))
                        {
                            $checkResult[$prop["Value"]] =  array();
                        }
                        array_push($checkResult[$prop["Value"]], $newItem);
                    }
                }
            }
        }
        catch (Exception $e)
        {
        }

        echo json_encode(array(
            "Msg" =>  "Success",
            "Data" => $checkResult,
            "MsgCode" => 1
        ));
    }

    function CheckMatch($fromComponent, $toComponent, $matchwiths)
    {
        $match = false;
        for ($i = 0; $i < count($matchwiths); $i++)
        {
            $matchwith = $matchwiths[$i];
            $targetProp = GetProperty($fromComponent, $matchwith["target"]);
            $sourceProp = GetProperty($toComponent, $matchwith["source"]);

            if ($targetProp["Value"] === $sourceProp["Value"])
            {
                $match = true;
            }
            else
            {
                $match = false;
                break;
            }
        }

        return $match;
    }

    function GetProperty($component, $property)
    {
        $properties = $component["properties"];
        for ($i = 0; $i < count($properties); $i++)
        {
            if (strtolower($properties[$i]["Name"]) === strtolower($property))
            {
                return $properties[$i];
            }
        }

        return null;
    }

    // function WriteDataChangeTemplateConfig()
    // {

    //     if (
    //         !isset($_POST['ProjectName']) ||
    //         !isset($_POST['CheckName']) ||
    //         !isset($_POST['configData'])
    //     ) {
    //         echo json_encode(array(
    //             "Msg" =>  "Invalid input.",
    //             "MsgCode" => 0
    //         ));

    //         return;
    //     }

    //     try {
    //         // get project name
    //         $projectName = $_POST['ProjectName'];
    //         $checkName = $_POST['CheckName'];
    //         $configData = json_decode($_POST['configData'], true);

    //         $checkspaceDir = getCheckDirectoryPath($projectName, $checkName);
    //         $configFile = $checkspaceDir . "/Revisions/config.json";

    //         $file = fopen($configFile, "w") or die("Unable to open file!");
    //         fwrite($file, json_encode($configData, JSON_PRETTY_PRINT));
    //         fclose($file);
    //     } catch (Exception $e) {
    //         echo json_encode(array(
    //             "Msg" =>  "Failed",
    //             "MsgCode" => 0
    //         ));
    //         return;
    //     }

    //     echo json_encode(array(
    //         "Msg" =>  "Success",
    //         "MsgCode" => 1
    //     ));
    // }

    // function ReadDataChangeTemplateConfig()
    // {

    //     if (
    //         !isset($_POST['ProjectName']) ||
    //         !isset($_POST['CheckName'])
    //     ) {
    //         echo json_encode(array(
    //             "Msg" =>  "Invalid input.",
    //             "MsgCode" => 0
    //         ));

    //         return;
    //     }

    //     $configData = null;
    //     try {
    //         // get project name
    //         $projectName = $_POST['ProjectName'];
    //         $checkName = $_POST['CheckName'];

    //         $checkspaceDir = getCheckDirectoryPath($projectName, $checkName);
    //         $configFile = $checkspaceDir . "/Revisions/config.json";

    //         if (file_exists($configFile)) {
    //             $configData = file_get_contents($configFile);
    //         }
    //     } catch (Exception $e) {
    //         echo json_encode(array(
    //             "Msg" =>  "Failed",
    //             "MsgCode" => 0
    //         ));
    //         return;
    //     }

    //     echo json_encode(array(
    //         "Msg" =>  "Success",
    //         "Data" => $configData,
    //         "MsgCode" => 1
    //     ));
    // }