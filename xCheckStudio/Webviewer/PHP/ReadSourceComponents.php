<?php
require_once 'Utility.php';

getSourceComponents();

// get source components
function getSourceComponents()
{
    if (
        !isset($_POST['ProjectName']) ||
        !isset($_POST['CheckName'])
    ) {
        echo json_encode(array("Msg" =>  "Invalid input",
        "MsgCode" => 0)); 
        return;
    }


    try {
        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];

        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        // fetch source A components
        $compsAObj = readSourceComponents($dbh, "SourceAComponents", "SourceAProperties");

        // fetch source B components
        $compsBObj = readSourceComponents($dbh, "SourceBComponents", "SourceBProperties");

        // fetch source C components
        $compsCObj = readSourceComponents($dbh, "SourceCComponents", "SourceCProperties");

        // fetch source D components
        $compsDObj = readSourceComponents($dbh, "SourceDComponents", "SourceDProperties");

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection

        echo json_encode(array("Msg" =>  "success",
        "Data" =>array(
            'a' =>  $compsAObj,
            'b' =>  $compsBObj,
            'c' =>  $compsCObj,
            'd' =>  $compsDObj
        ),
        "MsgCode" => 1)); 
        return;
    } 
    catch (Exception $e) {
    }

    echo json_encode(array("Msg" =>  "Failed to read data.",
    "MsgCode" => 0)); 
}

function readSourceComponents($dbh, $componentsTable, $propertiesTable)
{
    $components = array();

    // fetch source components in group of mainclasses            
    $mainClasses = $dbh->query("SELECT DISTINCT mainclass FROM  $componentsTable;");
    if ($mainClasses) {
        while ($mainClass = $mainClasses->fetch(\PDO::FETCH_ASSOC)) {
            $mainClassVal = $mainClass['mainclass'];
            // $stmt = $dbh->query("select sourceComp.id, sourceComp.name, sourceComp.mainclass, sourceComp.subclass, sourceComp.nodeid, properties.name, properties.value, properties.ownercomponent from $componentsTable as sourceComp INNER JOIN $propertiesTable as properties ON sourceComp.id=properties.ownercomponent where sourceComp.mainclass = '$mainClassVal';");
            $stmt = $dbh->query("select sourceComp.id as compId, 
            sourceComp.name as compName, 
            sourceComp.mainclass as compMainClass, 
            sourceComp.subclass as compSubClass, 
            sourceComp.nodeid as compNodeId, 
            properties.name as propName, 
            properties.value as propValue, 
            properties.ownercomponent as propOwner 
            from $componentsTable as sourceComp INNER JOIN $propertiesTable as properties 
            ON sourceComp.id=properties.ownercomponent 
            where sourceComp.mainclass = '$mainClassVal';");

            if ($stmt) {
                $components[$mainClassVal] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        }
    }

    return $components;
}
