<?php
require_once 'Utility.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $InvokeFunction = trim($_POST["InvokeFunction"], " ");
    switch ($InvokeFunction) {
        case "Update":
            Update();
            break;
        default:
            echo "No Function Found!";
    }
}


/* 
   Updates User Properties to temp checkspace DB
*/
function Update()
{
    if (
        !isset($_POST['ProjectName']) ||
        !isset($_POST['CheckName']) ||
        !isset($_POST['ComponentTable']) ||
        !isset($_POST['PropertyTable']) ||
        !isset($_POST['PropertyData'])
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
        $componentTable = $_POST['ComponentTable'];
        $propertyTable = $_POST['PropertyTable'];
        $propertyData = json_decode($_POST['PropertyData'],true);

        $tempDBPath = getCheckDatabasePath($projectName, $checkName);
        $tempDBh = new PDO("sqlite:$tempDBPath") or die("cannot open the database");

        // begin the transaction
        $tempDBh->beginTransaction();

        // ischecked can have values 'true' or 'false'
        $command = 'CREATE TABLE IF NOT EXISTS '. $componentTable. '(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT NOT NULL,
                mainclass TEXT,
                subclass TEXT,
                nodeid INTEGER,
                ischecked TEXT,
                parentid INTEGER,
                componentid INTEGER
              )';         
        $tempDBh->exec($command); 

        // create properties table
        $command = 'CREATE TABLE IF NOT EXISTS ' .  $propertyTable . '(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT NOT NULL,
            format TEXT,
            value TEXT,                
            ownercomponent INTEGER NOT NULL,
            userdefined INTEGER default 0
        )';
        $tempDBh->exec($command);

        $newComponentIds = array();
        foreach ($propertyData as $nodeId => $nodeData) {
            // var_dump($nodeData);
            // continue;
            $componentId = NULL;

            if (array_key_exists ( "component" , $nodeData)) {
                // Component is already there
                $componentId = $nodeData["component"];
                
                $name = $nodeData["name"];
                $category = $nodeData["category"];
                $componentClass = $nodeData["componentClass"];
                
                if ($name !== NULL) {                   
                    $command = $tempDBh->prepare("UPDATE '$componentTable' SET name=? WHERE id=?");
                    $command->execute(array($name, $componentId));                         
                }
                if ($category !== NULL) {                  
                    // $category = $nodeData["category"];
                    if ($category == "") {
                        $category = NULL;
                    }                   
                   
                    $command = $tempDBh->prepare("UPDATE '$componentTable' SET mainclass=? WHERE id=?");
                    $command->execute(array($category, $componentId));    
                }
                if ($componentClass !== NULL) {
                    // $componentClass = $componentClass;
                    if ($componentClass == "") {
                        $componentClass = NULL;
                    }
                    $command = $tempDBh->prepare("UPDATE '$componentTable' SET subclass=? WHERE id=?");
                    $command->execute(array($componentClass, $componentId)); 
                }
            } else {
                    // new component
                    $qry = 'INSERT INTO ' . $componentTable . '(name,  mainclass, subclass, nodeid, parentid) VALUES(?,?,?,?,?) ';

                    $values = array(
                        $nodeData["name"],
                        $nodeData["category"],
                        $nodeData["componentClass"],
                        $nodeId,
                        $nodeData["parent"]
                    );
    
                    $stmt = $tempDBh->prepare($qry);
                    $stmt->execute($values);
               
               
                // get component id for recently added row
                $qry = 'SELECT id FROM ' . $componentTable . ' where rowid=' . $tempDBh->lastInsertId();
                $stmt =  $tempDBh->query($qry);
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $componentId  = $row['id'];  
                    $newComponentIds[$componentId ] = $nodeId;                
                    break;
                }               
            }
            if ($componentId == NULL) {
                continue;
            }

            $properties = $nodeData["properties"];
            for ($i = 0; $i < count($properties); $i++) {
                $property = $properties[$i];
                $name = $property["property"];
                $value = $property["value"];

                $action = $property["action"];

                if (strtolower($action) == "add") {
                    $insertPropertyQuery = 'INSERT INTO ' .  $propertyTable . '(name, format, value,  ownercomponent, userdefined) VALUES(?,?,?,?,?) ';
                    $propertyValues = array(
                        $name,
                        "String",
                        $value,
                        $componentId,
                        1
                    );

                    $stmt = $tempDBh->prepare($insertPropertyQuery);
                    $stmt->execute($propertyValues);
                } else if (strtolower($action) == "remove") {
                    $query =  "Delete from " . $propertyTable . " where ownercomponent=" . $componentId . " and userdefined=1 and name='" . $name . "';";
                    $stmt = $tempDBh->prepare($query);
                    $stmt->execute();
                } else if (strtolower($action) == "update") {
                    $command = $tempDBh->prepare("UPDATE '$propertyTable' SET name=?, value=? WHERE ownercomponent=? and name=?");
                    $command->execute(array($name, $value, $componentId, $property["oldProperty"]));
                }
            }
        }

        // commit update
        $tempDBh->commit();
        $tempDBh = null; //This is how you close a PDO connection
    } catch (Exception $e) {
        echo json_encode(array(
            "Msg" =>  "fail",            
            "MsgCode" => 0
        ));
        return;
    }

    echo json_encode(array(
        "Msg" =>  "Success",
        "Data" => array("newComponentIds" => $newComponentIds),
        "MsgCode" => 1
    ));
}
