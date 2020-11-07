<?php
require_once 'Utility.php';

if(!isset($_POST['ActionToPerform']) || !isset($_POST['CheckName']) || !isset($_POST['ProjectName']))
{
 echo 'fail';
 return;
}

$projectName = $_POST['ProjectName'];
$checkName = $_POST['CheckName'];
$actionToPerform = $_POST['ActionToPerform'];

switch ($actionToPerform) {
    case "acceptComparisonComponent":
        acceptComparisonComponent();
        break;

    case "acceptComparisonProperty":
        acceptComparisonProperty();
        break;

    case "acceptComparisonCategory":
        acceptComparisonCategory();
        break;

    case "acceptComplianceSourceAComponent":
    case "acceptComplianceSourceBComponent":
    case "acceptComplianceSourceCComponent":
    case "acceptComplianceSourceDComponent":
        acceptComplianceComponent();
        break;

    case "acceptComplianceSourceAProperty":
    case "acceptComplianceSourceBProperty":
    case "acceptComplianceSourceCProperty":
    case "acceptComplianceSourceDProperty":
        acceptComplianceProperty();
        break;

    case "acceptComplianceSourceACategory":
    case "acceptComplianceSourceBCategory":
    case "acceptComplianceSourceCCategory":
    case "acceptComplianceSourceDCategory":
        acceptComplianceCategory();
        break;

    case "unAcceptComparisonComponent":
        unAcceptComponent();
        break;

    case "unAcceptComparisonProperty":
        unAcceptComparisonProperty();
        break;

    case "unAcceptComparisonCategory":
        unAcceptComparisonCategory();
        break;
        
    case "unAcceptComplianceSourceAComponent":
    case "unAcceptComplianceSourceBComponent":
    case "unAcceptComplianceSourceCComponent":
    case "unAcceptComplianceSourceDComponent":
        unAcceptComplianceComponent();
        break;

    case "unAcceptComplianceSourceAProperty":
    case "unAcceptComplianceSourceBProperty":
    case "unAcceptComplianceSourceCProperty":
    case "unAcceptComplianceSourceDProperty":
        unAcceptComplianceProperty();
        break;

    case "unAcceptComplianceSourceACategory":
    case "unAcceptComplianceSourceBCategory":
    case "unAcceptComplianceSourceCCategory":
    case "unAcceptComplianceSourceDCategory":
        unAcceptComplianceCategory();
        break;

    default:
        break;
}

function acceptComparisonComponent() {    
    global $projectName;
    global $checkName;
    $selectedGroupIdsVsResultsIds = (object) json_decode($_POST['selectedGroupIdsVsResultsIds'], true);
    $dbh = null;
    try{
    
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $status = 'true';

        $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', ' ', 'Missing Property(s)');
        $dbh->beginTransaction();

        $results = array();
        foreach ($selectedGroupIdsVsResultsIds as $groupid => $components) {
            $componentsArray = array();
            for($i=0; $i < count($components); $i++){
                $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET accepted=? WHERE id=?");
                $command->execute(array($status, $components[$i]));                

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

                    if($properties[$index]['transpose'] == null) {

                        $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET accepted=? WHERE id=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                        $command->execute(array($status, $properties[$index]['id']));

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
                for($k = 0; $k < count($resultProperties); $k++) {
                    if($resultProperties[$k]["transpose"] !== null) {
                        $isPropertyTransposed = true;
                    }
                    else if($resultProperties[$k]["accepted"] == "true") {
                        $isPropertyAccepted = true;
                    }
                }
            
                $worststatus = getWorstSeverityForComponent($resultProperties, $comp[0], true);
                if($isPropertyAccepted) {
                    $worststatus = $worststatus . "(A)";
                }
            
                if($isPropertyTransposed) {
                    $worststatus = $worststatus . "(T)";
                }

                $resultComponent["component"]["status"] = $worststatus;

                $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
                $command->execute(array($worststatus, $components[$i]));

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

function acceptComparisonProperty() {

    global $projectName;
    global $checkName;
    $componentid = $_POST['componentid']; 
    $selectedPropertyIds = json_decode($_POST['propertyIds']); 

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'true';
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'No Match', ' ', 'Missing Property(s)');
    $results = array();
    $dbh->beginTransaction();

    $command = $dbh->prepare("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?");
    $command->execute(array($componentid));
    $properties = $command->fetchAll(PDO::FETCH_ASSOC);

    $propertyIdIndex = 0;
    $isPropertyTransposed = false;
    $isPropertyAccepted = false;

    for($i = 0; $i < count($selectedPropertyIds); $i++) {
        for($j = 0; $j < count($properties); $j++) {
            if($j == $selectedPropertyIds[$i]) {
                if(!in_array($properties[$j]["severity"], $dontChangeOk) && $properties[$j]["transpose"] == null) {
                    $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET accepted=? WHERE id=?");
                    $command->execute(array($status, $properties[$j]["id"]));
                    break;
                }
            }
            else {
                continue;
            }
        }
    }

    $command = $dbh->prepare("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?");
    $command->execute(array($componentid));
    $properties = $command->fetchAll(PDO::FETCH_ASSOC);

    for($i = 0; $i < count($properties); $i++) {
        if($properties[$i]["transpose"] !== null) {
            $isPropertyTransposed = true;
        }
        else if($properties[$i]["accepted"] == "true") {
            $isPropertyAccepted = true;
        }
    }

    $command = $dbh->prepare("SELECT * FROM ComparisonCheckComponents WHERE id=?");
    $command->execute(array($componentid));
    $component = $command->fetchAll(PDO::FETCH_ASSOC);

    $status = getWorstSeverityForComponent($properties, $component[0], true);
    if($isPropertyAccepted) {
        $status = $status . "(A)";
    }

    if($isPropertyTransposed) {
        $status = $status . "(T)";
    }


    $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET status=? WHERE id=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
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

function acceptComparisonCategory() {
    if(!isset($_POST['groupid'])) {
        echo 'fail';
        return;
    }

    global $projectName;
    global $checkName;
    $groupid = $_POST['groupid'];

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'ACCEPTED';
    $status = 'true';
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'Missing Property(s)', '', 'No Match');
    $transpose = null;
    $componentsArray = array();
    $results = array();

    $dbh->beginTransaction();

    $command = $dbh->prepare("UPDATE ComparisonCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($categoryStatus, $groupid));


    $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET accepted=? WHERE ownerGroup=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($status, $groupid));

    $components = $dbh->query("SELECT * FROM ComparisonCheckComponents WHERE ownerGroup= $groupid;");
    if($components) 
    {            
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
            $resultComponent = array();
            $resultComponent["component"] = $comp;

            if(!in_array($comp['status'],  $dontChangeOk)) {
                // $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET accepted=? WHERE ownerComponent=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                // $command->execute(array($status, $comp['id']));

                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
                $command->execute(array($comp['id']));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);

                $index = 0;

                $resultProperties = array();

                while($index < count($properties)) { 

                    if($properties[$index]['transpose'] == null) {

                        $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET accepted=? WHERE id=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                        $command->execute(array($status, $properties[$index]['id']));

                    }

                    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE id=?');
                    $command->execute(array($properties[$index]['id']));
                    $property = $command->fetchAll(PDO::FETCH_ASSOC);
        
                    array_push($resultProperties, $property[0]);                    
                    $index++;
                }   
                // $resultComponent["component"]["properties"] = $resultProperties;


                // $resultProperties = $properties;

                $isPropertyTransposed = false;
                $isPropertyAccepted = false;
                for($i = 0; $i < count($resultProperties); $i++) {
                    if($resultProperties[$i]["transpose"] !== null) {
                        $isPropertyTransposed = true;
                    }
                    else if($resultProperties[$i]["accepted"] == "true") {
                        $isPropertyAccepted = true;
                    }
                }
            
                $worststatus = getWorstSeverityForComponent($resultProperties, $comp, true);
                if($isPropertyAccepted) {
                    $worststatus = $worststatus . "(A)";
                }
            
                if($isPropertyTransposed) {
                    $worststatus = $worststatus . "(T)";
                }

                $resultComponent["component"]["status"] = $worststatus;
 

                $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
                $command->execute(array($worststatus, $comp['id']));
                
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

function acceptComplianceComponent() {
    global $projectName;
    global $checkName;
    $selectedGroupIdsVsResultsIds = (object) json_decode($_POST['selectedGroupIdsVsResultsIds'], true);
    global $actionToPerform;

    $dbh = null;
    try{
    
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $status = 'true';
        $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'Missing Property(s)', ' ');
        $results = array();

        if($actionToPerform == "acceptComplianceSourceAComponent") {

            $CheckComponentsTable = "SourceAComplianceCheckComponents";
            $CheckPropertiesTable = "SourceAComplianceCheckProperties";
        }
        else if($actionToPerform == "acceptComplianceSourceBComponent") {

            $CheckComponentsTable = "SourceBComplianceCheckComponents";
            $CheckPropertiesTable = "SourceBComplianceCheckProperties";
        }
        else if($actionToPerform == "acceptComplianceSourceCComponent") {

            $CheckComponentsTable = "SourceCComplianceCheckComponents";
            $CheckPropertiesTable = "SourceCComplianceCheckProperties";
        }
        else if($actionToPerform == "acceptComplianceSourceDComponent") {

            $CheckComponentsTable = "SourceDComplianceCheckComponents";
            $CheckPropertiesTable = "SourceDComplianceCheckProperties";
        }

        $dbh->beginTransaction();
        foreach ($selectedGroupIdsVsResultsIds as $groupid => $components) {
            $componentsArray = array();

            for($i=0; $i < count($components); $i++){
                $command = $dbh->prepare("UPDATE $CheckComponentsTable SET accepted=? WHERE id=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($status, $components[$i]));

                $command = $dbh->prepare("UPDATE $CheckComponentsTable SET status=? WHERE id=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array('OK(A)', $components[$i]));

                $command = $dbh->prepare("SELECT * FROM $CheckComponentsTable WHERE id=?");
                $command->execute(array($components[$i]));
                $comp = $command->fetchAll(PDO::FETCH_ASSOC);

                $resultComponent = array();
                $resultComponent["component"] = $comp[0];

                $resultProperties = array();
        
                $command = $dbh->prepare("UPDATE $CheckPropertiesTable SET accepted=? WHERE ownerComponent=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($status, $components[$i]));

                $command = $dbh->prepare("SELECT * FROM $CheckPropertiesTable WHERE ownerComponent=?");
                $command->execute(array($components[$i]));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $resultProperties = $properties;

                $resultComponent["component"]["properties"] = $resultProperties;

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

function acceptComplianceProperty() {
    global $projectName;
    global $checkName;
    global $actionToPerform;

    $componentid = $_POST['componentid']; 
    $selectedPropertyIds = json_decode($_POST['propertyIds']); 

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'true';
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'Missing Property(s)', ' ');
    $results = array();

    $dbh->beginTransaction();

    if($actionToPerform == "acceptComplianceSourceAProperty") {
        $componentTableName = 'SourceAComplianceCheckComponents';
        $propertiesTableName = 'SourceAComplianceCheckProperties';  
    }
    else if($actionToPerform == "acceptComplianceSourceBProperty") {
        $componentTableName = 'SourceBComplianceCheckComponents';
        $propertiesTableName = 'SourceBComplianceCheckProperties'; 
    }
    else if($actionToPerform == "acceptComplianceSourceCProperty") {
        $componentTableName = 'SourceCComplianceCheckComponents';
        $propertiesTableName = 'SourceCComplianceCheckProperties'; 
    }
    else if($actionToPerform == "acceptComplianceSourceDProperty") {
        $componentTableName = 'SourceDComplianceCheckComponents';
        $propertiesTableName = 'SourceDComplianceCheckProperties'; 
    }

    $command = $dbh->prepare("SELECT * FROM $propertiesTableName WHERE ownerComponent=?");
    $command->execute(array($componentid));
    $properties = $command->fetchAll(PDO::FETCH_ASSOC);

    $propertyIdIndex = 0;

    for($i = 0; $i < count($selectedPropertyIds); $i++) {
        for($j = 0; $j < count($properties); $j++) {
            if($j == $selectedPropertyIds[$i]) {
                if(!in_array($properties[$j]["severity"], $dontChangeOk)) {
                    $command = $dbh->prepare("UPDATE $propertiesTableName SET accepted=? WHERE id=?");
                    $command->execute(array($status, $properties[$j]["id"]));
                    break;
                }
            }
            else {
                continue;
            }
        }
    }
  
    $command = $dbh->prepare("SELECT * FROM $propertiesTableName WHERE ownerComponent=?");
    $command->execute(array($componentid));
    $properties = $command->fetchAll(PDO::FETCH_ASSOC);

    $isPropertyAccepted = false;

    for($i = 0; $i < count($properties); $i++) {
        if($properties[$i]["accepted"] == "true") {
            $isPropertyAccepted = true;
        }
    }

    $command = $dbh->prepare("SELECT * FROM $componentTableName WHERE id=?");
    $command->execute(array($componentid));
    $component = $command->fetchAll(PDO::FETCH_ASSOC);

    $worstSeverity = getWorstSeverityForComponent($properties, $component[0], true);
    if($isPropertyAccepted) {
        $worstSeverity = $worstSeverity . "(A)";
    }

    $command = $dbh->prepare("UPDATE $componentTableName SET status=? WHERE id=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($worstSeverity, $componentid)); 

    if($worstSeverity == 'OK(A)') {
        $command = $dbh->prepare("UPDATE $componentTableName SET accepted=? WHERE id=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
        $command->execute(array($status, $componentid));     
    }

    $command = $dbh->prepare("SELECT * FROM $componentTableName WHERE id=?");
    $command->execute(array($componentid));
    $comp = $command->fetchAll(PDO::FETCH_ASSOC);

    $results[$componentid] = $comp[0];
    $results[$componentid]["properties"] = $properties;

    $dbh->commit();
    $dbh = null; 

    echo json_encode($results);
}

function acceptComplianceCategory() {
    if(!isset($_POST['groupid'])) {
        echo 'fail';
        return;
    }

    global $projectName;
    global $checkName;
    $groupid = $_POST['groupid'];
    global $actionToPerform;

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'ACCEPTED';
    $status = 'true';
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'Missing Property(s)', ' ');
    $transpose = null;
    $componentsArray = array();
    $results = array();

    if($actionToPerform == "acceptComplianceSourceACategory") {

        $CheckComponentsTable = "SourceAComplianceCheckComponents";
        $CheckPropertiesTable = "SourceAComplianceCheckProperties";
        $command = $dbh->prepare("UPDATE SourceAComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
        $command->execute(array($categoryStatus, $groupid)); 
    }
    else if($actionToPerform == "acceptComplianceSourceBCategory") {

        $CheckComponentsTable = "SourceBComplianceCheckComponents";
        $CheckPropertiesTable = "SourceBComplianceCheckProperties";
        $command = $dbh->prepare("UPDATE SourceBComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
        $command->execute(array($categoryStatus, $groupid)); 
    }
    else if($actionToPerform == "acceptComplianceSourceCategory") {

        $CheckComponentsTable = "SourceCComplianceCheckComponents";
        $CheckPropertiesTable = "SourceCComplianceCheckProperties";
        $command = $dbh->prepare("UPDATE SourceCComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
        $command->execute(array($categoryStatus, $groupid)); 
    }
    else if($actionToPerform == "acceptComplianceSourceDCategory") {

        $CheckComponentsTable = "SourceDComplianceCheckComponents";
        $CheckPropertiesTable = "SourceDComplianceCheckProperties";
        $command = $dbh->prepare("UPDATE SourceDComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
        $command->execute(array($categoryStatus, $groupid)); 
    }

    $dbh->beginTransaction();


    $command = $dbh->prepare("UPDATE $CheckComponentsTable SET accepted=? WHERE ownerGroup=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($status, $groupid));

    $command = $dbh->prepare("UPDATE $CheckComponentsTable SET status=? WHERE ownerGroup=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array('OK(A)', $groupid));

    $components = $dbh->query("SELECT * FROM $CheckComponentsTable WHERE ownerGroup= $groupid;");
    if($components) 
    {            
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
            $resultComponent = array();
            $resultComponent["component"] = $comp;

            if($comp['status'] !== $dontChangeOk) {
                $command = $dbh->prepare("UPDATE $CheckPropertiesTable SET accepted=? WHERE ownerComponent=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($status, $comp['id']));

                $command = $dbh->prepare("SELECT * FROM $CheckPropertiesTable WHERE ownerComponent=?");
                $command->execute(array($comp['id']));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $resultProperties = $properties;

                $resultComponent["component"]["properties"] = $resultProperties;
            }

            $componentsArray[$comp['id']] = $resultComponent;
        }

        $results[$groupid] = $componentsArray;
    }

    $dbh->commit();
    $dbh = null;

    echo json_encode($results);
}

function unAcceptComponent() {
    $statusArray = array();
    global $projectName;
    global $checkName;
    $selectedGroupIdsVsResultsIds = (object) json_decode($_POST['selectedGroupIdsVsResultsIds'], true);
    $status = "false";

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbh->beginTransaction();
    $results = array();
    foreach ($selectedGroupIdsVsResultsIds as $groupid => $components) {
        $componentsArray = array();
        for($i=0; $i < count($components); $i++){
            $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET accepted=? WHERE id=?");
            $command->execute(array($status, $components[$i]));                

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

                if($properties[$index]['transpose'] == null) {
                    $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET accepted=? WHERE id=?");
                    $command->execute(array($status, $properties[$index]['id']));
                }

                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE id=?');
                $command->execute(array($properties[$index]['id']));
                $property = $command->fetchAll(PDO::FETCH_ASSOC);
    
                array_push($resultProperties, $property[0]);                    
                $index++;
            }  
            
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
        
            $worststatus = getWorstSeverityForComponent($resultProperties, $comp[0], false);
            if($isPropertyAccepted) {
                $worststatus = $worststatus . "(A)";
            }
        
            if($isPropertyTransposed) {
                $worststatus = $worststatus . "(T)";
            }
        
            $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
            $command->execute(array($worststatus, $components[$i]));

            $resultComponent["component"]["properties"] = $resultProperties;
            $resultComponent["component"]["status"] = $worststatus;

            $componentsArray[$components[$i]] = $resultComponent;
        }

        $results[$groupid] = $componentsArray;
    }

    $dbh->commit();
    $dbh = null;

    echo json_encode($results);
}

function unAcceptComparisonProperty() {
    global $projectName;
    global $checkName;
    $componentid = $_POST['componentid']; 
    $selectedPropertyIds = json_decode($_POST['propertyIds']); 

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'false';
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'Missing Property(s)', ' ');
    $results = array();
    $dbh->beginTransaction();

    $command = $dbh->prepare("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?");
    $command->execute(array($componentid));
    $properties = $command->fetchAll(PDO::FETCH_ASSOC);

    $propertyIdIndex = 0;

    for($i = 0; $i < count($selectedPropertyIds); $i++) {
        for($j = 0; $j < count($properties); $j++) {
            if($j == $selectedPropertyIds[$i]) {
                if(!in_array($properties[$j]["severity"], $dontChangeOk) && $properties[$j]["transpose"] == null) {
                    $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET accepted=? WHERE id=?");
                    $command->execute(array($status, $properties[$j]["id"]));
                    break;
                }
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

    $command = $dbh->prepare("SELECT * FROM ComparisonCheckComponents WHERE id=?");
    $command->execute(array($componentid));
    $component = $command->fetchAll(PDO::FETCH_ASSOC);

    $worststatus = getWorstSeverityForComponent($properties, $component[0], false);
    if($isPropertyAccepted) {
        $worststatus = $worststatus . "(A)";
    }

    if($isPropertyTransposed) {
        $worststatus = $worststatus . "(T)";
    }

    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=?, status=? WHERE id=?');
    $command->execute(array($status, $worststatus, $componentid));


    $command = $dbh->prepare("SELECT * FROM ComparisonCheckComponents WHERE id=?");
    $command->execute(array($componentid));
    $comp = $command->fetchAll(PDO::FETCH_ASSOC);

    $results[$componentid] = $comp[0];
    $results[$componentid]["properties"] = $properties;

    $dbh->commit();
    $dbh = null;

    echo json_encode($results);
}

function unAcceptComparisonCategory() {
    global $projectName;
    global $checkName;
    $groupid = $_POST['groupid'];

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'UNACCEPTED';
    $status = 'false';
    $dontChangeOk = array('OK', 'OK(T)', 'No Value', 'Missing Property(s)', ' ', 'No Match');
    $transpose = null;
    $componentsArray = array();
    $results = array();

    $dbh->beginTransaction();

    $command = $dbh->prepare("UPDATE ComparisonCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($categoryStatus, $groupid));


    $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET accepted=? WHERE ownerGroup=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($status, $groupid));

    $components = $dbh->query("SELECT * FROM ComparisonCheckComponents WHERE ownerGroup= $groupid;");
    if($components) 
    {            
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
            $resultComponent = array();
            $resultComponent["component"] = $comp;

            if(!in_array($comp['status'],  $dontChangeOk)) {
                $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET accepted=? WHERE ownerComponent=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($status, $comp['id']));

                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
                $command->execute(array($comp['id']));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $resultProperties = $properties;

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
            
                $worststatus = getWorstSeverityForComponent($properties, $comp, false);
                if($isPropertyAccepted) {
                    $worststatus = $worststatus . "(A)";
                }
            
                if($isPropertyTransposed) {
                    $worststatus = $worststatus . "(T)";
                }
            
                $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=?, status=? WHERE id=?');
                $command->execute(array($status, $worststatus,  $comp['id']));

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

function unAcceptComplianceComponent() {

    global $projectName;
    global $checkName;
    $selectedGroupIdsVsResultsIds = (object) json_decode($_POST['selectedGroupIdsVsResultsIds'], true);
    global $actionToPerform;

    $dbh;
    try{
    
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $status = 'false';
        $dontChangeOk = array('OK', 'OK(T)', 'No Value', 'Missing Property(s)', ' ');
        $results = array();

        if($actionToPerform == "unAcceptComplianceSourceAComponent") {

            $CheckComponentsTable = "SourceAComplianceCheckComponents";
            $CheckPropertiesTable = "SourceAComplianceCheckProperties";
        }
        else if($actionToPerform == "unAcceptComplianceSourceBComponent") {

            $CheckComponentsTable = "SourceBComplianceCheckComponents";
            $CheckPropertiesTable = "SourceBComplianceCheckProperties";
        }
        else if($actionToPerform == "unAcceptComplianceSourceCComponent") {

            $CheckComponentsTable = "SourceCComplianceCheckComponents";
            $CheckPropertiesTable = "SourceCComplianceCheckProperties";
        }
        else if($actionToPerform == "unAcceptComplianceSourceDComponent") {

            $CheckComponentsTable = "SourceDComplianceCheckComponents";
            $CheckPropertiesTable = "SourceDComplianceCheckProperties";
        }

        $dbh->beginTransaction();
        foreach ($selectedGroupIdsVsResultsIds as $groupid => $components) {
            $componentsArray = array();

            for($i=0; $i < count($components); $i++){
                $command = $dbh->prepare("UPDATE $CheckComponentsTable SET accepted=? WHERE id=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($status, $components[$i]));
               
                $command = $dbh->prepare("SELECT * FROM $CheckComponentsTable WHERE id=?");
                $command->execute(array($components[$i]));
                $comp = $command->fetchAll(PDO::FETCH_ASSOC);

                $resultProperties = array();
        
                $command = $dbh->prepare("UPDATE $CheckPropertiesTable SET accepted=? WHERE ownerComponent=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($status, $components[$i]));

                $command = $dbh->prepare("SELECT * FROM $CheckPropertiesTable WHERE ownerComponent=?");
                $command->execute(array($components[$i]));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $resultProperties = $properties;

                $worststatus = getWorstSeverityForComponent($resultProperties, $comp[0], false);

                $command = $dbh->prepare("UPDATE $CheckComponentsTable SET status=? WHERE id=?");
                $command->execute(array($worststatus, $components[$i]));  
               
                $command = $dbh->prepare("SELECT * FROM $CheckComponentsTable WHERE id=?");
                $command->execute(array($components[$i]));
                $comp = $command->fetchAll(PDO::FETCH_ASSOC);

                $resultComponent = array();
                $resultComponent["component"] = $comp[0];


                $resultComponent["component"]["properties"] = $resultProperties;

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

function unAcceptComplianceProperty() {
    global $projectName;
    global $checkName;
    global $actionToPerform;
    $componentid = $_POST['componentid']; 
    $selectedPropertyIds = json_decode($_POST['propertyIds']); 

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'false';
    $dontChangeOk = array('OK', 'OK(T)', 'No Value', 'OK(A)(T)', 'Missing Property(s)', ' ');
    $results = array();

    $dbh->beginTransaction();

    if($actionToPerform == "unAcceptComplianceSourceAProperty") {
        $componentTableName = 'SourceAComplianceCheckComponents';
        $propertiesTableName = 'SourceAComplianceCheckProperties';  
    }
    else if($actionToPerform == "unAcceptComplianceSourceBProperty") {
        $componentTableName = 'SourceBComplianceCheckComponents';
        $propertiesTableName = 'SourceBComplianceCheckProperties'; 
    }
    else if($actionToPerform == "unAcceptComplianceSourceCProperty") {
        $componentTableName = 'SourceCComplianceCheckComponents';
        $propertiesTableName = 'SourceCComplianceCheckProperties'; 
    }
    else if($actionToPerform == "unAcceptComplianceSourceDProperty") {
        $componentTableName = 'SourceDComplianceCheckComponents';
        $propertiesTableName = 'SourceDComplianceCheckProperties'; 
    }

    $command = $dbh->prepare("SELECT * FROM $propertiesTableName WHERE ownerComponent=?");
    $command->execute(array($componentid));
    $properties = $command->fetchAll(PDO::FETCH_ASSOC);

    $propertyIdIndex = 0;

    for($i = 0; $i < count($selectedPropertyIds); $i++) {
        for($j = 0; $j < count($properties); $j++) {
            if($j == $selectedPropertyIds[$i]) {
                if(!in_array($properties[$j]["severity"], $dontChangeOk)) {
                    $command = $dbh->prepare("UPDATE $propertiesTableName SET accepted=? WHERE id=?");
                    $command->execute(array($status, $properties[$j]["id"]));
                    break;
                }
            }
            else {
                continue;
            }
        }
    }


    $command = $dbh->prepare("SELECT * FROM $propertiesTableName WHERE ownerComponent=?");
    $command->execute(array($componentid));
    $properties = $command->fetchAll(PDO::FETCH_ASSOC);

    $isPropertyAccepted = false;
    for($i = 0; $i < count($properties); $i++) {
        if($properties[$i]["accepted"] == "true") {
            $isPropertyAccepted = true;
        }
    }

    $command = $dbh->prepare("SELECT * FROM $componentTableName WHERE id=?");
    $command->execute(array($componentid));
    $component = $command->fetchAll(PDO::FETCH_ASSOC);

    $worstSeverity = getWorstSeverityForComponent($properties, $component[0], false);
    if($isPropertyAccepted) {
        $worstSeverity = $worstSeverity . "(A)";
    }

    $command = $dbh->prepare("UPDATE $componentTableName SET status=? WHERE id=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($worstSeverity, $componentid)); 

    $command = $dbh->prepare("UPDATE $componentTableName SET accepted=? WHERE id=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($status, $componentid));     

    $command = $dbh->prepare("SELECT * FROM $componentTableName WHERE id=?");
    $command->execute(array($componentid));
    $comp = $command->fetchAll(PDO::FETCH_ASSOC);

    $results[$componentid] = $comp[0];
    $results[$componentid]["properties"] = $properties;

    $dbh->commit();
    $dbh = null; 

    echo json_encode($results);
}

function unAcceptComplianceCategory() {
    global $projectName;
    global $checkName;
    $groupid = $_POST['groupid'];
    global $actionToPerform;

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'UNACCEPTED';
    $status = 'false';
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'Missing Property(s)', ' ');
    $transpose = null;
    $componentsArray = array();
    $results = array();

    if($actionToPerform == "unAcceptComplianceSourceACategory") {

        $CheckComponentsTable = "SourceAComplianceCheckComponents";
        $CheckPropertiesTable = "SourceAComplianceCheckProperties";
        $command = $dbh->prepare("UPDATE SourceAComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
        $command->execute(array($categoryStatus, $groupid)); 
    }
    else if($actionToPerform == "unAcceptComplianceSourceBCategory") {

        $CheckComponentsTable = "SourceBComplianceCheckComponents";
        $CheckPropertiesTable = "SourceBComplianceCheckProperties";
        $command = $dbh->prepare("UPDATE SourceBComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
        $command->execute(array($categoryStatus, $groupid)); 
    }
    else if($actionToPerform == "unAcceptComplianceSourceCCategory") {

        $CheckComponentsTable = "SourceCComplianceCheckComponents";
        $CheckPropertiesTable = "SourceCComplianceCheckProperties";
        $command = $dbh->prepare("UPDATE SourceCComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
        $command->execute(array($categoryStatus, $groupid)); 
    }
    else if($actionToPerform == "unAcceptComplianceSourceDCategory") {

        $CheckComponentsTable = "SourceDComplianceCheckComponents";
        $CheckPropertiesTable = "SourceDComplianceCheckProperties";
        $command = $dbh->prepare("UPDATE SourceDComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
        $command->execute(array($categoryStatus, $groupid)); 
    }

    $dbh->beginTransaction();


    $command = $dbh->prepare("UPDATE $CheckComponentsTable SET accepted=? WHERE ownerGroup=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
    $command->execute(array($status, $groupid));

    $components = $dbh->query("SELECT * FROM $CheckComponentsTable WHERE ownerGroup= $groupid;");
    if($components) 
    {            
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
            // if($comp['status'] !== $dontChangeOk) {
                $command = $dbh->prepare("UPDATE $CheckPropertiesTable SET accepted=? WHERE ownerComponent=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($status, $comp['id']));

                $command = $dbh->prepare("SELECT * FROM $CheckPropertiesTable WHERE ownerComponent=?");
                $command->execute(array($comp['id']));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $resultProperties = $properties;

                $worststatus = getWorstSeverityForComponent($resultProperties, $comp, false);

                $command = $dbh->prepare("UPDATE $CheckComponentsTable SET status=? WHERE id=?");
                $command->execute(array($worststatus, $comp['id'])); 

                $command = $dbh->prepare("SELECT * FROM $CheckComponentsTable WHERE id=?");
                $command->execute(array($comp['id']));
                $component = $command->fetchAll(PDO::FETCH_ASSOC);

                $resultComponent = array();
                $resultComponent["component"] = $component[0];
                
                $resultComponent["component"]["properties"] = $resultProperties;
            // }

            $componentsArray[$comp['id']] = $resultComponent;
        }

        $results[$groupid] = $componentsArray;
    }

    $dbh->commit();
    $dbh = null;

    echo json_encode($results);
}

function getWorstSeverityForComponent($properties, $component,  $isAccept) {
    $worstSeverity = "OK";

    if($component['accepted'] == true && $component['status'] == "Missing Item(s)") {
        return $worstSeverity . '(A)';
    }
    
    for($j = 0; $j < count($properties); $j++) {
        if($properties[$j]["severity"] !== "OK" && $properties[$j]["severity"] !== "No Value") {
            if($properties[$j]["accepted"] == "true" || (isset($properties[$j]["transpose"]) && $properties[$j]["transpose"]!== null)) {
                continue;
            }
            else {
                if(strtolower($properties[$j]["severity"]) == "error") {
                    $worstSeverity = $properties[$j]["severity"];
                }
                else if(strtolower($properties[$j]["severity"]) == "warning" && strtolower($worstSeverity) !== "error") {
                    $worstSeverity = $properties[$j]["severity"];
                }
                else if(strtolower($properties[$j]["severity"]) == "no match" && 
                (strtolower($worstSeverity) !== "error" && strtolower($worstSeverity) !== "warning")) {
                    $worstSeverity = $properties[$j]["severity"];
                }
                else if(!$isAccept && strtolower($properties[$j]["severity"]) == "missing property(s)" && 
                (strtolower($worstSeverity) !== "error" && strtolower($worstSeverity) !== "warning" && strtolower($worstSeverity) !== "no match")) {
                    $worstSeverity = "Missing Item(s)";
                }
            }
        }
    }

    return $worstSeverity;
}

?>

   