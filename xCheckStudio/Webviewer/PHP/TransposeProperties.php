<?php
require_once 'Utility.php';


$projectName = $_POST['ProjectName'];
$checkName = $_POST['CheckName'];
$transposeType = $_POST['transposeType'];
$transposeLevel = $_POST['transposeLevel'];

if($transposeType == 'restoreProperty' && $transposeLevel == 'propertyLevel') {
     RestorePropertyTranspose();
}
else if($transposeType == 'restoreComponent' && $transposeLevel == 'componentLevel') {
     RestoreComponentTranspose();
}
else if($transposeType == 'restoreCategory' && $transposeLevel == 'categorylevel') {
    RestoreCategoryTranspose();
}
else if($transposeLevel == 'propertyLevel') {
    TransposeProperties();
}
else if($transposeLevel == 'componentLevel') {
    TransposeComponents();
}
else if($transposeLevel == 'categorylevel') {
    TransposeCategories();
}

function TransposeProperties() {
    global $projectName;
    global $checkName;
    global $transposeType;

    $componentid = $_POST['componentid']; 
    $selectedPropertyIds = json_decode($_POST['propertyIds']); 
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'Missing Property(s)');

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
    $results = array();
    $dbh->beginTransaction();

    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $properties = $command->fetchAll(PDO::FETCH_ASSOC);

    // $propertyIdIndex = 0;

    for($i = 0; $i < count($selectedPropertyIds); $i++) {
        for($j = 0; $j < count($properties); $j++) {
            if($j == $selectedPropertyIds[$i] && 
               $properties[$j]["accepted"] == "false" && 
               !in_array($properties[$j]["severity"], $dontChangeOk)) {
                $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET transpose=? WHERE id=?');
                $command->execute(array($transposeType, $properties[$j]["id"]));
            }         
        }
    }

    $command = $dbh->prepare("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?");
    $command->execute(array($componentid));
    $properties = $command->fetchAll(PDO::FETCH_ASSOC);

    $isPropertyTransposed = false;
    $isPropertyAccepted = false;
    for($i = 0; $i < count($properties); $i++) {
        if($properties[$i]["transpose"] !== null) {
            $isPropertyTransposed = true;
        }
        else if($properties[$i]["accepted"] == "true") {
            $isPropertyAccepted = true;
        }
    }

    $status = getWorstSeverityForComponent($properties);
    if($isPropertyAccepted) {
        $status = $status . "(A)";
    }

    if($isPropertyTransposed) {
        $status = $status . "(T)";
    }


    $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET status=? WHERE id=?");
    $command->execute(array($status, $componentid)); 

    $command = $dbh->prepare("SELECT * FROM ComparisonCheckComponents WHERE id=?");
    $command->execute(array($componentid));
    $comp = $command->fetchAll(PDO::FETCH_ASSOC);

    $results[$componentid] = $comp[0];
    $results[$componentid]["properties"] = $properties;

    // update dataset properties
    $sourceCompIds = json_decode($_POST['sourceCompIds'], true);
    $sourceProps = json_decode($_POST['sourceProps'], true);
    if (array_key_exists("a", $sourceCompIds)) {
        $compId = $sourceCompIds["a"];
        for ($i = 0; $i < count($sourceProps); $i++) {
            $sourceProp = $sourceProps[$i];
            if (array_key_exists("a", $sourceProp)) {;
                $command = $dbh->prepare("UPDATE SourceAProperties SET value=? WHERE name=? AND ownercomponent=?");
                $command->execute(array($sourceProp["transposedValue"],  $sourceProp["a"], $compId));
            }
        }
    }
    if (array_key_exists("b", $sourceCompIds)) {
        $compId = $sourceCompIds["b"];
        for ($i = 0; $i < count($sourceProps); $i++) {
            $sourceProp = $sourceProps[$i];
            if (array_key_exists("b", $sourceProp)) {;
                $command = $dbh->prepare("UPDATE SourceBProperties SET value=? WHERE name=? AND ownercomponent=?");
                $command->execute(array($sourceProp["transposedValue"],  $sourceProp["b"], $compId));
            }
        }
    }
    if (array_key_exists("c", $sourceCompIds)) {
        $compId = $sourceCompIds["c"];
        for ($i = 0; $i < count($sourceProps); $i++) {
            $sourceProp = $sourceProps[$i];
            if (array_key_exists("c", $sourceProp)) {;
                $command = $dbh->prepare("UPDATE SourceCProperties SET value=? WHERE name=? AND ownercomponent=?");
                $command->execute(array($sourceProp["transposedValue"],  $sourceProp["c"], $compId));
            }
        }
    }
    if (array_key_exists("d", $sourceCompIds)) {
        $compId = $sourceCompIds["d"];
        for ($i = 0; $i < count($sourceProps); $i++) {
            $sourceProp = $sourceProps[$i];
            if (array_key_exists("d", $sourceProp)) {;
                $command = $dbh->prepare("UPDATE SourceDProperties SET value=? WHERE name=? AND ownercomponent=?");
                $command->execute(array($sourceProp["transposedValue"],  $sourceProp["d"], $compId));
            }
        }
    }

    $dbh->commit();
    $dbh = null; 
    echo json_encode($results);
}

function RestorePropertyTranspose() {
    global $projectName;
    global $checkName;
    $transposeType = null;

    $componentid = $_POST['componentid']; 
    $selectedPropertyIds = json_decode($_POST['propertyIds']); 
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'Missing Property(s)');

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
    $results = array();
    $dbh->beginTransaction();

    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $properties = $command->fetchAll(PDO::FETCH_ASSOC);

    $propertyIdIndex = 0;

    for($i = 0; $i < count($selectedPropertyIds); $i++) {
        for($j = 0; $j < count($properties); $j++) {
            if($j == $selectedPropertyIds[$i]) {
                    $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET transpose=? WHERE id=?');
                    $command->execute(array($transposeType, $properties[$j]["id"]));
            }
            else {
                continue;
            }
        }
    }

    $command = $dbh->prepare("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?");
    $command->execute(array($componentid));
    $properties = $command->fetchAll(PDO::FETCH_ASSOC);

    $isPropertyTransposed = false;
    $isPropertyAccepted = false;
    for($i = 0; $i < count($properties); $i++) {
        if($properties[$i]["transpose"] !== null) {
            $isPropertyTransposed = true;
        }
        else if($properties[$i]["accepted"] == "true") {
            $isPropertyAccepted = true;
        }
    }

    $status = getWorstSeverityForComponent($properties);
    if($isPropertyAccepted) {
        $status = $status . "(A)";
    }

    if($isPropertyTransposed) {
        $status = $status . "(T)";
    }


    $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET status=? WHERE id=?");
    $command->execute(array($status, $componentid)); 

    $command = $dbh->prepare("SELECT * FROM ComparisonCheckComponents WHERE id=?");
    $command->execute(array($componentid));
    $comp = $command->fetchAll(PDO::FETCH_ASSOC);

    $results[$componentid] = $comp[0];
    $results[$componentid]["properties"] = $properties;

    // update dataset properties
    $sourceCompIds = json_decode($_POST['sourceCompIds'], true);
    $sourceProps = json_decode($_POST['sourceProps'], true);
    if (array_key_exists("a", $sourceCompIds)) {
        $compId = $sourceCompIds["a"];
        for ($i = 0; $i < count($sourceProps); $i++) {
            $sourceProp = $sourceProps[$i];
            if (array_key_exists("aName", $sourceProp)) {;
                $command = $dbh->prepare("UPDATE SourceAProperties SET value=? WHERE name=? AND ownercomponent=?");
                $command->execute(array($sourceProp["aValue"],  $sourceProp["aName"], $compId));
            }
        }
    }
    if (array_key_exists("b", $sourceCompIds)) {
        $compId = $sourceCompIds["b"];
        for ($i = 0; $i < count($sourceProps); $i++) {
            $sourceProp = $sourceProps[$i];
            if (array_key_exists("bName", $sourceProp)) {;
                $command = $dbh->prepare("UPDATE SourceBProperties SET value=? WHERE name=? AND ownercomponent=?");
                $command->execute(array($sourceProp["bValue"],  $sourceProp["bName"], $compId));
            }
        }
    }
    if (array_key_exists("c", $sourceCompIds)) {
        $compId = $sourceCompIds["c"];
        for ($i = 0; $i < count($sourceProps); $i++) {
            $sourceProp = $sourceProps[$i];
            if (array_key_exists("cName", $sourceProp)) {;
                $command = $dbh->prepare("UPDATE SourceCProperties SET value=? WHERE name=? AND ownercomponent=?");
                $command->execute(array($sourceProp["cValue"],  $sourceProp["cName"], $compId));
            }
        }
    }
    if (array_key_exists("d", $sourceCompIds)) {
        $compId = $sourceCompIds["d"];
        for ($i = 0; $i < count($sourceProps); $i++) {
            $sourceProp = $sourceProps[$i];
            if (array_key_exists("dName", $sourceProp)) {;
                $command = $dbh->prepare("UPDATE SourceDProperties SET value=? WHERE name=? AND ownercomponent=?");
                $command->execute(array($sourceProp["dValue"],  $sourceProp["dName"], $compId));
            }
        }
    }

    $dbh->commit();
    $dbh = null; 
    echo json_encode($results);   
}

function TransposeComponents() {
    global $projectName;
    global $checkName;
    $selectedGroupIdsVsResultsIds = (object) json_decode($_POST['selectedGroupIdsVsResultsIds'], true);
    global $transposeType;

    $dbh = null;
    try{
    
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'Missing Property(s)', 'Missing Item(s)');
        $results = array();
        $dbh->beginTransaction();

        $srcComps = [];
        foreach ($selectedGroupIdsVsResultsIds as $groupid => $components) {
            $componentsArray = array();
            for($i=0; $i < count($components); $i++){
                $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET transpose=? WHERE id=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($transposeType, $components[$i]));                

                $command = $dbh->prepare('SELECT * FROM ComparisonCheckComponents WHERE id=?');
                $command->execute(array($components[$i]));
                $comp = $command->fetchAll(PDO::FETCH_ASSOC);

                $resultComponent = array();
                $resultComponent["component"] = $comp[0];               
                
                // get orginal component ids             
                $compData = array();
                if ($comp[0]["sourceAId"] !== null) {
                    $compData["a"] = array(
                        "id" => $comp[0]["sourceAId"],
                        "properties" => array()
                    );
                }
                if($comp[0]["sourceBId"] !== null)
                {
                    $compData["b"] =  array(
                        "id" => $comp[0]["sourceBId"],
                        "properties" => array()
                    );
                }
                if($comp[0]["sourceCId"] !== null)
                {
                    $compData["c"] = array(
                        "id" => $comp[0]["sourceCId"],
                        "properties" => array()
                    );
                }
                if($comp[0]["sourceDId"] !== null)
                {
                    $compData["d"] =  array(
                        "id" => $comp[0]["sourceDId"],
                        "properties" => array()
                    );
                }

                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
                $command->execute(array($components[$i]));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);                

                $resultProperties = array();

                $index = 0;
                while($index < count($properties)) { 

                    if($properties[$index]['accepted'] == 'false') {
                        $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET transpose=? WHERE id=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                        $command->execute(array($transposeType, $properties[$index]['id']));
                    }

                    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE id=?');
                    $command->execute(array($properties[$index]['id']));
                    $property = $command->fetchAll(PDO::FETCH_ASSOC);
                            
                    array_push($resultProperties, $property[0]);

                    $transposeFrom = $property[0]["transpose"];
                    if ($property[0]["transpose"] !== null) {
                        $transposeFrom = strtolower($transposeFrom);

                        $transposedValue = null;
                        if ($transposeFrom === "fromdatasource1") {
                            $transposedValue = $property[0]["sourceAValue"];
                        } else if ($transposeFrom === "fromdatasource2") {
                            $transposedValue = $property[0]["sourceBValue"];
                        } else if ($transposeFrom === "fromdatasource3") {
                            $transposedValue = $property[0]["sourceCValue"];
                        } else if ($transposeFrom === "fromdatasource4") {
                            $transposedValue = $property[0]["sourceDValue"];
                        }

                        if ($transposedValue !== null) {
                            if (array_key_exists("a", $compData)) {
                                array_push($compData["a"]["properties"], array("name" => $property[0]["sourceAName"], "value" => $transposedValue));
                            }
                            if (array_key_exists("b", $compData)) {
                                array_push($compData["b"]["properties"], array("name" => $property[0]["sourceBName"], "value" => $transposedValue));
                            }
                            if (array_key_exists("c", $compData)) {
                                array_push($compData["c"]["properties"], array("name" => $property[0]["sourceCName"], "value" => $transposedValue));
                            }
                            if (array_key_exists("d", $compData)) {
                                array_push($compData["d"]["properties"], array("name" => $property[0]["sourceDName"], "value" => $transposedValue));
                            }
                        }
                    }

                    $index++;
                }   
                $resultComponent["component"]["properties"] = $resultProperties;
                
                // maintain main dataset component data
                array_push($srcComps, $compData);

                $isPropertyTransposed = false;
                $isPropertyAccepted = false;
                for($j = 0; $j < count($resultProperties); $j++) {
                    if($resultProperties[$j]["transpose"] !== null) {
                        $isPropertyTransposed = true;
                    }
                    else if($resultProperties[$j]["accepted"] == "true") {
                        $isPropertyAccepted = true;
                    }
                }

                $status = getWorstSeverityForComponent($resultProperties);
                if($isPropertyAccepted) {
                    $status = $status . "(A)";
                }

                if($isPropertyTransposed) {
                    $status = $status . "(T)";
                }


                $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET status=? WHERE id=?");
                $command->execute(array($status, $components[$i])); 

                $resultComponent["component"]["status"] = $status;
                $componentsArray[$components[$i]] = $resultComponent;
            }

            $results[$groupid] = $componentsArray;
        }

        // update dataset properties
         UpdateDatasetProperties($srcComps, $dbh);
        
        $dbh->commit();
        $dbh = null;
        echo json_encode($results);
    }
    catch(Exception $e) {
        echo "fail"; 
        return;
    }
}

function RestoreComponentTranspose() {
    $statusArray = array();
    global $projectName;
    global $checkName;
    $selectedGroupIdsVsResultsIds = (object) json_decode($_POST['selectedGroupIdsVsResultsIds'], true);
    $transposeType = null;


    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dontChangeOk = array('OK', 'OK(A)', 'No Value', 'Missing Property(s)', 'Missing Item(s)');
        $results = array();
        $dbh->beginTransaction();

        $srcComps = [];
        foreach ($selectedGroupIdsVsResultsIds as $groupid => $components) {
            $componentsArray = array();
            for($i=0; $i < count($components); $i++){
                $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET transpose=? WHERE id=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($transposeType, $components[$i]));                

                $command = $dbh->prepare('SELECT * FROM ComparisonCheckComponents WHERE id=?');
                $command->execute(array($components[$i]));
                $comp = $command->fetchAll(PDO::FETCH_ASSOC);

                $resultComponent = array();
                $resultComponent["component"] = $comp[0];
               
                 // get orginal component ids             
                 $compData = array();
                 if ($comp[0]["sourceAId"] !== null) {
                     $compData["a"] = array(
                         "id" => $comp[0]["sourceAId"],
                         "properties" => array()
                     );
                 }
                 if($comp[0]["sourceBId"] !== null)
                 {
                     $compData["b"] =  array(
                         "id" => $comp[0]["sourceBId"],
                         "properties" => array()
                     );
                 }
                 if($comp[0]["sourceCId"] !== null)
                 {
                     $compData["c"] = array(
                         "id" => $comp[0]["sourceCId"],
                         "properties" => array()
                     );
                 }
                 if($comp[0]["sourceDId"] !== null)
                 {
                     $compData["d"] =  array(
                         "id" => $comp[0]["sourceDId"],
                         "properties" => array()
                     );
                 }

                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
                $command->execute(array($components[$i]));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $index = 0;

                $resultProperties = array();

                while($index < count($properties)) {

                    if ($properties[$index]['transpose'] !== null) {
                        $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET transpose=? WHERE id=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                        $command->execute(array($transposeType, $properties[$index]['id']));


                        if (array_key_exists("a", $compData)) {
                            array_push($compData["a"]["properties"], array("name" => $properties[$index]["sourceAName"], "value" => $properties[$index]["sourceAValue"]));
                        }
                        if (array_key_exists("b", $compData)) {
                            array_push($compData["b"]["properties"], array("name" => $properties[$index]["sourceBName"], "value" => $properties[$index]["sourceBValue"]));
                        }
                        if (array_key_exists("c", $compData)) {
                            array_push($compData["c"]["properties"], array("name" => $properties[$index]["sourceCName"], "value" => $properties[$index]["sourceCValue"]));
                        }
                        if (array_key_exists("d", $compData)) {
                            array_push($compData["d"]["properties"], array("name" => $properties[$index]["sourceDName"], "value" => $properties[$index]["sourceDValue"]));
                        }
                    }

                    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE id=?');
                    $command->execute(array($properties[$index]['id']));
                    $property = $command->fetchAll(PDO::FETCH_ASSOC);
        
                    array_push($resultProperties, $property[0]); 
                    $index++;
                }   
                $resultComponent["component"]["properties"] = $resultProperties;

                // maintain main dataset component data
                array_push($srcComps, $compData);

                $isPropertyTransposed = false;
                $isPropertyAccepted = false;
                for($j = 0; $j < count($resultProperties); $j++) {
                    if($resultProperties[$j]["transpose"] !== null) {
                        $isPropertyTransposed = true;
                    }
                    else if($resultProperties[$j]["accepted"] == "true") {
                        $isPropertyAccepted = true;
                    }
                }

                $status = getWorstSeverityForComponent($resultProperties);
                if($isPropertyAccepted) {
                    $status = $status . "(A)";
                }

                if($isPropertyTransposed) {
                    $status = $status . "(T)";
                }


                $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET status=? WHERE id=?");
                $command->execute(array($status, $components[$i])); 

                $resultComponent["component"]["status"] = $status;
                $componentsArray[$components[$i]] = $resultComponent;
            }

            $results[$groupid] = $componentsArray;
        }

        // update dataset properties
        UpdateDatasetProperties($srcComps, $dbh);

        $dbh->commit();
        $dbh = null; 
        echo json_encode($results);
}

function RestoreCategoryTranspose() {
    $statusArray = array();
    global $projectName;
    global $checkName;
    $groupid = $_POST['groupid'];
    $transposeType = null;

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'UNACCEPTED';
    $dontChangeOk = array('OK', 'OK(A)', 'No Value', 'ACCEPTED', 'No Match', 'Missing Property(s)', 'Missing Item(s)');
    $componentsArray = array();
    $results = array();

    $dbh->beginTransaction();

    $command = $dbh->prepare("UPDATE ComparisonCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($categoryStatus, $groupid));


    $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET transpose=? WHERE ownerGroup=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($transposeType, $groupid));

    // $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET transpose=? WHERE ownerGroup=? AND status=?');
    // $command->execute(array(null, $groupid, 'No Match'));

    $components = $dbh->query("SELECT * FROM ComparisonCheckComponents WHERE ownerGroup= $groupid;");
    if($components) 
    {   
        $srcComps = [];         
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
            $resultComponent = array();
            $resultComponent["component"] = $comp;

            if(!in_array($comp['status'],  $dontChangeOk)) {
                $command = $dbh->prepare("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($comp['id']));
               
                // get orginal component ids             
                $compData = array();
                if ($comp["sourceAId"] !== null) {
                    $compData["a"] = array(
                        "id" => $comp["sourceAId"],
                        "properties" => array()
                    );
                }
                if($comp["sourceBId"] !== null)
                {
                    $compData["b"] =  array(
                        "id" => $comp["sourceBId"],
                        "properties" => array()
                    );
                }
                if($comp["sourceCId"] !== null)
                {
                    $compData["c"] = array(
                        "id" => $comp["sourceCId"],
                        "properties" => array()
                    );
                }
                if($comp["sourceDId"] !== null)
                {
                    $compData["d"] =  array(
                        "id" => $comp["sourceDId"],
                        "properties" => array()
                    );
                }

                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $index = 0;
                while($index < count($properties)) {
                    $property = $properties[$index];

                    $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET transpose=? WHERE id=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                    $command->execute(array($transposeType, $property['id']));
                    
                    if (array_key_exists("a", $compData)) {
                        array_push($compData["a"]["properties"], array("name" => $property["sourceAName"], "value" => $property["sourceAValue"]));
                    }
                    if (array_key_exists("b", $compData)) {
                        array_push($compData["b"]["properties"], array("name" => $property["sourceBName"], "value" => $property["sourceBValue"]));
                    }
                    if (array_key_exists("c", $compData)) {
                        array_push($compData["c"]["properties"], array("name" => $property["sourceCName"], "value" => $property["sourceCValue"]));
                    }
                    if (array_key_exists("d", $compData)) {
                        array_push($compData["d"]["properties"], array("name" => $property["sourceDName"], "value" => $property["sourceDValue"]));
                    }

                    $index++;
                }
                // maintain main dataset component data
                array_push($srcComps, $compData);

                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
                $command->execute(array($comp['id']));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $resultProperties = $properties;

                $isPropertyTransposed = false;
                $isPropertyAccepted = false;
                for($j = 0; $j < count($resultProperties); $j++) {
                    if($resultProperties[$j]["transpose"] !== null) {
                        $isPropertyTransposed = true;
                    }
                    else if($resultProperties[$j]["accepted"] == "true") {
                        $isPropertyAccepted = true;
                    }
                }

                $status = getWorstSeverityForComponent($resultProperties);
                if($isPropertyAccepted) {
                    $status = $status . "(A)";
                }

                if($isPropertyTransposed) {
                    $status = $status . "(T)";
                }


                $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET status=? WHERE id=?");
                $command->execute(array($status, $comp['id'])); 

                $resultComponent["component"]["status"] = $status;
            }
            else {
                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
                $command->execute(array($comp['id']));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $resultProperties = $properties;
            }

            $resultComponent["component"]["properties"] = $resultProperties;
            $componentsArray[$comp['id']] = $resultComponent;
        }

        $results[$groupid] = $componentsArray;

        // update dataset properties      
        UpdateDatasetProperties($srcComps, $dbh);
    }

    $dbh->commit();
    $dbh = null;

    echo json_encode($results);

}

function TransposeCategories() {
    if(!isset($_POST['groupid'])) {
        echo 'fail';
        return;
    }

    global $projectName;
    global $checkName;
    $groupid = $_POST['groupid'];
    global $transposeType;

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'OK(T)';
    $status = 'true';
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'ACCEPTED', 'No Match', 'Missing Property(s)', 'Missing Item(s)');
    $componentsArray = array();
    $results = array();

    $dbh->beginTransaction();

    $command = $dbh->prepare("UPDATE ComparisonCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($categoryStatus, $groupid));


    $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET transpose=? WHERE ownerGroup=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($transposeType, $groupid));

    // $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET transpose=? WHERE ownerGroup=? AND status=?');
    // $command->execute(array(null, $groupid, 'No Match'));

    $components = $dbh->query("SELECT * FROM ComparisonCheckComponents WHERE ownerGroup= $groupid;");
    if($components) 
    {   
        $srcComps = [];         
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
            $resultComponent = array();
            $resultComponent["component"] = $comp;           
          
            if(!in_array($comp['status'],  $dontChangeOk)) {                
                
                // get orginal component ids             
                $compData = array();
                if ($comp["sourceAId"] !== null) {
                    $compData["a"] = array(
                        "id" => $comp["sourceAId"],
                        "properties" => array()
                    );
                }
                if($comp["sourceBId"] !== null)
                {
                    $compData["b"] =  array(
                        "id" => $comp["sourceBId"],
                        "properties" => array()
                    );
                }
                if($comp["sourceCId"] !== null)
                {
                    $compData["c"] = array(
                        "id" => $comp["sourceCId"],
                        "properties" => array()
                    );
                }
                if($comp["sourceDId"] !== null)
                {
                    $compData["d"] =  array(
                        "id" => $comp["sourceDId"],
                        "properties" => array()
                    );
                }

                $command = $dbh->prepare("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?");
                $command->execute(array($comp['id']));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $index = 0;
                while($index < count($properties)) {
                    $property = $properties[$index];
                    if($property["accepted"] == "false" && 
                       !in_array($property["severity"], $dontChangeOk)) {
                        $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET transpose=? WHERE id=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                        $command->execute(array($transposeType, $property['id']));

                        // $transposeFrom = $property["transpose"];
                        // if ($transposeFrom !== null) {
                        $transposeFrom = strtolower($transposeType);

                        $transposedValue = null;
                        if ($transposeFrom === "fromdatasource1") {
                            $transposedValue = $property["sourceAValue"];
                        } else if ($transposeFrom === "fromdatasource2") {
                            $transposedValue = $property["sourceBValue"];
                        } else if ($transposeFrom === "fromdatasource3") {
                            $transposedValue = $property["sourceCValue"];
                        } else if ($transposeFrom === "fromdatasource4") {
                            $transposedValue = $property["sourceDValue"];
                        }

                        if ($transposedValue !== null) {
                            if (array_key_exists("a", $compData)) {
                                array_push($compData["a"]["properties"], array("name" => $property["sourceAName"], "value" => $transposedValue));
                            }
                            if (array_key_exists("b", $compData)) {
                                array_push($compData["b"]["properties"], array("name" => $property["sourceBName"], "value" => $transposedValue));
                            }
                            if (array_key_exists("c", $compData)) {
                                array_push($compData["c"]["properties"], array("name" => $property["sourceCName"], "value" => $transposedValue));
                            }
                            if (array_key_exists("d", $compData)) {
                                array_push($compData["d"]["properties"], array("name" => $property["sourceDName"], "value" => $transposedValue));
                            }
                        }
                        // }
                    }
                    $index++;
                }
                // maintain main dataset component data
                array_push($srcComps, $compData);

                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
                $command->execute(array($comp['id']));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $resultProperties = $properties;

                $isPropertyTransposed = false;
                $isPropertyAccepted = false;
                for($j = 0; $j < count($resultProperties); $j++) {
                    if($resultProperties[$j]["transpose"] !== null) {
                        $isPropertyTransposed = true;
                    }
                    else if($resultProperties[$j]["accepted"] == "true") {
                        $isPropertyAccepted = true;
                    }
                }

                $worststatus = getWorstSeverityForComponent($resultProperties);
                if($isPropertyAccepted) {
                    $worststatus = $worststatus . "(A)";
                }

                if($isPropertyTransposed) {
                    $worststatus = $worststatus . "(T)";
                }


                $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET status=? WHERE id=?");
                $command->execute(array($worststatus, $comp['id'])); 

                $resultComponent["component"]["status"] = $worststatus;
            }
            else {
                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
                $command->execute(array($comp['id']));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $resultProperties = $properties;
            }

            $resultComponent["component"]["properties"] = $resultProperties;
            $componentsArray[$comp['id']] = $resultComponent;
        }

        $results[$groupid] = $componentsArray;

        // update dataset properties
        UpdateDatasetProperties($srcComps, $dbh);
    }

    $dbh->commit();
    $dbh = null;

    echo json_encode($results);
}

function getWorstSeverityForComponent($properties) {
    $worstSeverity = "OK";
    for($j = 0; $j < count($properties); $j++) {
        if ($properties[$j]["severity"] !== "OK" && $properties[$j]["severity"] !== "No Value") {
            if ($properties[$j]["accepted"] == "true" || $properties[$j]["transpose"]  !== null) {
                continue;
            }
            // else {
            if (strtolower($properties[$j]["severity"]) == "error") {
                $worstSeverity = $properties[$j]["severity"];
            } else if (strtolower($properties[$j]["severity"]) == "warning" && strtolower($worstSeverity) !== "error") {
                $worstSeverity = $properties[$j]["severity"];
            } else if (
                strtolower($properties[$j]["severity"]) == "no match" &&
                (strtolower($worstSeverity) !== "error" && strtolower($worstSeverity) !== "warning")
            ) {
                $worstSeverity = $properties[$j]["severity"];
            }
            // }
        }
    }

    return $worstSeverity;
}

function UpdateDatasetProperties($sourceComponents, $dbh)
{
    for ($i = 0; $i < count($sourceComponents); $i++) {
        $srcComp = $sourceComponents[$i];

        if (array_key_exists("a", $srcComp)) {
            $compId = $srcComp["a"]["id"];

            for ($j = 0; $j < count($srcComp["a"]["properties"]); $j++) {
                $sourceProp = $srcComp["a"]["properties"][$j];
                $command = $dbh->prepare("UPDATE SourceAProperties SET value=? WHERE name=? AND ownercomponent=?");
                $command->execute(array($sourceProp["value"],  $sourceProp["name"], $compId));
            }
        }
        if (array_key_exists("b", $srcComp)) {
            $compId = $srcComp["b"]["id"];

            for ($j = 0; $j < count($srcComp["b"]["properties"]); $j++) {
                $sourceProp = $srcComp["b"]["properties"][$j];
                $command = $dbh->prepare("UPDATE SourceBProperties SET value=? WHERE name=? AND ownercomponent=?");
                $command->execute(array($sourceProp["value"],  $sourceProp["name"], $compId));
            }
        }
        if (array_key_exists("c", $srcComp)) {
            $compId = $srcComp["c"]["id"];

            for ($j = 0; $j < count($srcComp["c"]["properties"]); $j++) {
                $sourceProp = $srcComp["c"]["properties"][$j];
                $command = $dbh->prepare("UPDATE SourceCProperties SET value=? WHERE name=? AND ownercomponent=?");
                $command->execute(array($sourceProp["value"],  $sourceProp["name"], $compId));
            }
        }
        if (array_key_exists("d", $srcComp)) {
            $compId = $srcComp["d"]["id"];

            for ($j = 0; $j < count($srcComp["d"]["properties"]); $j++) {
                $sourceProp = $srcComp["d"]["properties"][$j];
                $command = $dbh->prepare("UPDATE SourceDProperties SET value=? WHERE name=? AND ownercomponent=?");
                $command->execute(array($sourceProp["value"],  $sourceProp["name"], $compId));
            }
        }
    }
}

?>