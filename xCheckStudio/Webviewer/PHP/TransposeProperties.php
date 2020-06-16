<?php
require_once 'Utility.php';


$projectName = $_POST['ProjectName'];
$checkName = $_POST['CheckName'];
$transposeType = $_POST['transposeType'];
$transposeLevel = $_POST['transposeLevel'];

if($transposeType == 'restoreProperty' && $transposeLevel == 'propertyLevel') {
     RestoreProperty();
}
else if($transposeType == 'restoreComponent' && $transposeLevel == 'componentLevel') {
     RestoreComponentLevelTranspose();
}
else if($transposeType == 'restoreCategory' && $transposeLevel == 'categorylevel') {
     RestoreCategoryLevelTranspose();
}
else if($transposeLevel == 'propertyLevel') {
    TransposeProperty();
}
else if($transposeLevel == 'componentLevel') {
    TransposeComponentProperties();
}
else if($transposeLevel == 'categorylevel') {
    transposePropertiesCategoryLevel();
}

function TransposeProperty() {
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

    $propertyIdIndex = 0;

    for($i = 0; $i < count($selectedPropertyIds); $i++) {
        for($j = 0; $j < count($properties); $j++) {
            if($j == $selectedPropertyIds[$i] && $properties[$j]["accepted"] == "false" && !in_array($properties[$j]["severity"], $dontChangeOk)) {
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

    $dbh->commit();
    $dbh = null; 
    echo json_encode($results);
}

function RestoreProperty() {
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

    $dbh->commit();
    $dbh = null; 
    echo json_encode($results);   
}

function TransposeComponentProperties() {
    global $projectName;
    global $checkName;
    $selectedGroupIdsVsResultsIds = (object) json_decode($_POST['selectedGroupIdsVsResultsIds'], true);
    global $transposeType;

    $dbh;
    try{
    
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'Missing Property(s)', 'Missing Item(s)');
        $results = array();
        $dbh->beginTransaction();

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
               
                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
                $command->execute(array($components[$i]));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $index = 0;

                $resultProperties = array();

                while($index < count($properties)) { 

                    if($properties[$index]['accepted'] == 'false') {

                        $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET transpose=? WHERE id=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                        $command->execute(array($transposeType, $properties[$index]['id']));

                    }

                    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE id=?');
                    $command->execute(array($properties[$index]['id']));
                    $property = $command->fetchAll(PDO::FETCH_ASSOC);
        
                    array_push($resultProperties, $property[0]);                    
                    $index++;
                }   
                $resultComponent["component"]["properties"] = $resultProperties;

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

        $dbh->commit();
        $dbh = null; 
        echo json_encode($results);

    }
    catch(Exception $e) {
        echo "fail"; 
        return;
    }
}

function RestoreComponentLevelTranspose() {
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
               
                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
                $command->execute(array($components[$i]));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $index = 0;

                $resultProperties = array();

                while($index < count($properties)) { 

                    if($properties[$index]['transpose'] !== null) {

                        $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET transpose=? WHERE id=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                        $command->execute(array($transposeType, $properties[$index]['id']));

                    }

                    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE id=?');
                    $command->execute(array($properties[$index]['id']));
                    $property = $command->fetchAll(PDO::FETCH_ASSOC);
        
                    array_push($resultProperties, $property[0]);                    
                    $index++;
                }   
                $resultComponent["component"]["properties"] = $resultProperties;

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

        $dbh->commit();
        $dbh = null; 
        echo json_encode($results);
}

function RestoreCategoryLevelTranspose() {
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
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
            $resultComponent = array();
            $resultComponent["component"] = $comp;

            if(!in_array($comp['status'],  $dontChangeOk)) {
                $command = $dbh->prepare("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($comp['id']));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $index = 0;
                while($index < count($properties)) {
                   
                    $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET transpose=? WHERE id=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                    $command->execute(array($transposeType, $properties[$index]['id']));
                    
                    $index++;
                }

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
    }

    $dbh->commit();
    $dbh = null;

    echo json_encode($results);

}

function transposePropertiesCategoryLevel() {
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
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
            $resultComponent = array();
            $resultComponent["component"] = $comp;

            if(!in_array($comp['status'],  $dontChangeOk)) {
                $command = $dbh->prepare("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?");
                $command->execute(array($comp['id']));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $index = 0;
                while($index < count($properties)) {
                    if($properties[$index]["accepted"] == "false" && !in_array($properties[$index]["severity"], $dontChangeOk)) {
                        $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET transpose=? WHERE id=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                        $command->execute(array($transposeType, $properties[$index]['id']));
                    }
                    $index++;
                }

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

?>