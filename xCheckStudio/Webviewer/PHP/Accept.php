<?php
require_once 'Utility.php';

if(!isset($_POST['ActionToPerform']) || !isset($_POST['CheckName']) || !isset($_POST['ProjectName']))
{
 echo 'fail';
 return;
}

$projectName = $_POST['ProjectName'];
$checkName = $_POST['CheckName'];
$ActionToPerform = $_POST['ActionToPerform'];

switch ($ActionToPerform) {
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
        acceptComplianceComponent();
        break;

    case "acceptComplianceSourceAProperty":
    case "acceptComplianceSourceBProperty":
        acceptComplianceProperty();
        break;

    case "acceptComplianceSourceACategory":
    case "acceptComplianceSourceBCategory":
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
        unAcceptComplianceComponent();
        break;

    case "unAcceptComplianceSourceAProperty":
    case "unAcceptComplianceSourceBProperty":
        unAcceptComplianceProperty();
        break;

    case "unAcceptComplianceSourceACategory":
    case "unAcceptComplianceSourceBCategory":
        unAcceptComplianceCategory();
        break;

    default:
        break;
}

function acceptComparisonComponent() {
    global $projectName;
    global $checkName;
    $selectedGroupIdsVsResultsIds = (object) json_decode($_POST['selectedGroupIdsVsResultsIds'], true);
    $dbh;
    try{
    
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $status = 'true';

        $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
        $dbh->beginTransaction();

        $results = array();
        foreach ($selectedGroupIdsVsResultsIds as $groupid => $components) {
            $componentsArray = array();
            for($i=0; $i < count($components); $i++){
                $command = $dbh->prepare("UPDATE ComparisonCheckComponents SET accepted=? WHERE id=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
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
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
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
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
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

            if($comp['status'] !== $dontChangeOk) {
                $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET accepted=? WHERE ownerComponent=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($status, $comp['id']));

                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
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

function acceptComplianceComponent() {
    global $projectName;
    global $checkName;
    $selectedGroupIdsVsResultsIds = (object) json_decode($_POST['selectedGroupIdsVsResultsIds'], true);
    global $ActionToPerform;

    $dbh;
    try{
    
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $status = 'true';
        $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
        $results = array();

        if($ActionToPerform == "acceptComplianceSourceAComponent") {

            $CheckComponentsTable = "SourceAComplianceCheckComponents";
            $CheckPropertiesTable = "SourceAComplianceCheckProperties";
        }
        else if($ActionToPerform == "acceptComplianceSourceBComponent") {

            $CheckComponentsTable = "SourceBComplianceCheckComponents";
            $CheckPropertiesTable = "SourceBComplianceCheckProperties";
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
    global $ActionToPerform;
    $componentid = $_POST['componentid']; 
    $selectedPropertyIds = json_decode($_POST['propertyIds']); 

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'true';
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
    $results = array();

    $dbh->beginTransaction();

    if($ActionToPerform == "acceptComplianceSourceAProperty") {
        $componentTableName = 'SourceAComplianceCheckComponents';
        $propertiesTableName = 'SourceAComplianceCheckProperties';  
    }
    else if($ActionToPerform == "acceptComplianceSourceBProperty") {
        $componentTableName = 'SourceBComplianceCheckComponents';
        $propertiesTableName = 'SourceBComplianceCheckProperties'; 
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

    for($i = 0; $i < count($properties); $i++) {
        if(($properties[$i]["accepted"] == "true" && !in_array($properties[$i]["severity"], $dontChangeOk)) ||
         ($properties[$i]["accepted"] == "false" && in_array($properties[$i]["severity"], $dontChangeOk))) {
            if($i == (count($properties)-1)) {
                $command = $dbh->prepare("UPDATE $componentTableName SET accepted=? WHERE id=? AND status NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($status, $componentid));                
            }

            continue;
        }
        else {
            break;
        }
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
    global $ActionToPerform;

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'ACCEPTED';
    $status = 'true';
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
    $transpose = null;
    $componentsArray = array();
    $results = array();

    if($ActionToPerform == "acceptComplianceSourceACategory") {

        $CheckComponentsTable = "SourceAComplianceCheckComponents";
        $CheckPropertiesTable = "SourceAComplianceCheckProperties";
        $command = $dbh->prepare("UPDATE SourceAComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
        $command->execute(array($categoryStatus, $groupid)); 
    }
    else if($ActionToPerform == "acceptComplianceSourceBCategory") {

        $CheckComponentsTable = "SourceBComplianceCheckComponents";
        $CheckPropertiesTable = "SourceBComplianceCheckProperties";
        $command = $dbh->prepare("UPDATE SourceBComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
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

    // global $projectName;
    // global $checkName;
    // global $ActionToPerform;
    // $groupid = $_POST['groupid'];

    // $dbPath = getCheckDatabasePath($projectName, $checkName);
    // $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    // $categoryStatus = 'ACCEPTED';
    // $status = 'true';
    // $dontChangeOk = 'OK';
    // $componentTableName;
    // $propertiesTableName;
    // $dbh->beginTransaction();

    // if($ActionToPerform == "categoryComplianceA") {
    //     $componentTableName = 'SourceAComplianceCheckComponents';
    //     $propertiesTableName = 'SourceAComplianceCheckProperties'; 
    //     $command = $dbh->prepare('UPDATE SourceAComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
    //     $command->execute(array($categoryStatus, $groupid, $dontChangeOk)); 
    // }
    // else if($ActionToPerform == "categoryComplianceB") {
    //     $componentTableName = 'SourceBComplianceCheckComponents';
    //     $propertiesTableName = 'SourceBComplianceCheckProperties';
    //     $command = $dbh->prepare('UPDATE SourceBComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
    //     $command->execute(array($categoryStatus, $groupid, $dontChangeOk)); 
    // }

    //     $sql = "UPDATE ".$componentTableName." SET accepted=? WHERE ownerGroup=? AND status!=?";
    //     $sql1 = "UPDATE ".$propertiesTableName." SET accepted=? WHERE ownerComponent=? AND severity!=?";
    //     $command = $dbh->prepare($sql);
    //     $command->execute(array($status, $groupid, $dontChangeOk));

    //     $components = $dbh->query("SELECT * FROM $componentTableName  WHERE ownerGroup= $groupid;");
    //     if($components) 
    //     {            
    //         while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
    //         {
    //             if($comp['status'] !== $dontChangeOk) {
    //                 $command = $dbh->prepare($sql1);
    //                 $command->execute(array($status, $comp['id'], $dontChangeOk));
    //             }
    //         }
    //     }

    // $dbh->commit();
    // $dbh = null;
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
            $resultComponent["component"]["properties"] = $resultProperties;

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
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
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

    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=? WHERE id=?');
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

function unAcceptComparisonCategory() {
    global $projectName;
    global $checkName;
    $groupid = $_POST['groupid'];

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'UNACCEPTED';
    $status = 'false';
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
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

            if($comp['status'] !== $dontChangeOk) {
                $command = $dbh->prepare("UPDATE ComparisonCheckProperties SET accepted=? WHERE ownerComponent=? AND severity NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
                $command->execute(array($status, $comp['id']));

                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
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
    // $statusArray = array();
    // global $projectName;
    // global $checkName;
    // $groupid = $_POST['groupid'];

    // $dbPath = getCheckDatabasePath($projectName, $checkName);
    // $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    // $categoryStatus = 'UNACCEPTED';
    // $status = 'false';
    // $dontChangeOk = 'OK';
    // $compProps;

    // $dbh->beginTransaction();
   
    // $command = $dbh->prepare('UPDATE ComparisonCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
    // $command->execute(array($categoryStatus, $groupid, $dontChangeOk));

    // $command = $dbh->prepare('SELECT * FROM ComparisonCheckComponents WHERE ownerGroup=?');
    // $command->execute(array($groupid));
    // $allCom = $command->fetchAll(PDO::FETCH_ASSOC);
    // $index = 0;
    // while ($index < count($allCom)) 
    // {
    //     $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=? WHERE id=?');
    //     $command->execute(array($status, $allCom[$index]['id']));

    //     if(strpos($allCom[$index]['status'], '(A)') == true) {
    //         $allCom[$index]['status'] = str_replace("(A)", "", $allCom[$index]['status']);
    //         $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
    //         $command->execute(array($allCom[$index]['status'], $allCom[$index]['id']));
    //     }
        
    //     if($allCom[$index]['status'] !== $dontChangeOk) {
    //         $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
    //         $command->execute(array($allCom[$index]['id']));
    //         $compProps = $command->fetchAll(PDO::FETCH_ASSOC);
    //         $indexcompProp = 0;
    //         while ($indexcompProp < count($compProps)) 
    //         {
    //             $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET accepted=? WHERE id=?');
    //             $command->execute(array($status, $compProps[$indexcompProp]['id']));
    //             $indexcompProp++;
    //         }  
    //     }

    //     $index++;
    // }

    // $dbh->commit();

    // $dbh->beginTransaction();

    //     $command = $dbh->prepare('SELECT * FROM ComparisonCheckComponents WHERE ownerGroup=?');
    //     $command->execute(array($groupid));
    //     $allCom = $command->fetchAll(PDO::FETCH_ASSOC);
    //     $statusArray[0] = $allCom;

    //     $command = $dbh->prepare('SELECT * FROM ComparisonCheckComponents WHERE ownerGroup=?');
    //     $command->execute(array($groupid));
    //     $components1 = $command->fetchAll(PDO::FETCH_ASSOC);
    //     $noOfComp = 0;
    //     $propertiesArray = array();
    //     while($noOfComp < count($components1)) {
    //         $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
    //         $command->execute(array($components1[$noOfComp]['id']));
    //         $properties = $command->fetchAll(PDO::FETCH_ASSOC);
    //         $propertiesArray[$noOfComp] = $properties;
    //         $noOfComp++;
    //     }

    //     $statusArray[1] = $propertiesArray;
    // $dbh->commit();
        
    // $dbh = null;
    // echo json_encode($statusArray);
}

function unAcceptComplianceComponent() {

    global $projectName;
    global $checkName;
    $selectedGroupIdsVsResultsIds = (object) json_decode($_POST['selectedGroupIdsVsResultsIds'], true);
    global $ActionToPerform;

    $dbh;
    try{
    
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $status = 'false';
        $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
        $results = array();

        if($ActionToPerform == "unAcceptComplianceSourceAComponent") {

            $CheckComponentsTable = "SourceAComplianceCheckComponents";
            $CheckPropertiesTable = "SourceAComplianceCheckProperties";
        }
        else if($ActionToPerform == "unAcceptComplianceSourceBComponent") {

            $CheckComponentsTable = "SourceBComplianceCheckComponents";
            $CheckPropertiesTable = "SourceBComplianceCheckProperties";
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

function unAcceptComplianceProperty() {
    global $projectName;
    global $checkName;
    global $ActionToPerform;
    $componentid = $_POST['componentid']; 
    $selectedPropertyIds = json_decode($_POST['propertyIds']); 

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'false';
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
    $results = array();

    $dbh->beginTransaction();

    if($ActionToPerform == "unAcceptComplianceSourceAProperty") {
        $componentTableName = 'SourceAComplianceCheckComponents';
        $propertiesTableName = 'SourceAComplianceCheckProperties';  
    }
    else if($ActionToPerform == "unAcceptComplianceSourceBProperty") {
        $componentTableName = 'SourceBComplianceCheckComponents';
        $propertiesTableName = 'SourceBComplianceCheckProperties'; 
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
    global $ActionToPerform;

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'UNACCEPTED';
    $status = 'false';
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
    $transpose = null;
    $componentsArray = array();
    $results = array();

    if($ActionToPerform == "unAcceptComplianceSourceACategory") {

        $CheckComponentsTable = "SourceAComplianceCheckComponents";
        $CheckPropertiesTable = "SourceAComplianceCheckProperties";
        $command = $dbh->prepare("UPDATE SourceAComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
        $command->execute(array($categoryStatus, $groupid)); 
    }
    else if($ActionToPerform == "unAcceptComplianceSourceBCategory") {

        $CheckComponentsTable = "SourceBComplianceCheckComponents";
        $CheckPropertiesTable = "SourceBComplianceCheckProperties";
        $command = $dbh->prepare("UPDATE SourceBComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus NOT IN ( '" . implode($dontChangeOk, "', '") . "' )");
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

?>

   