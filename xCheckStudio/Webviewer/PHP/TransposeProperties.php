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
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');

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
                if($properties[$j]["sourceAName"] !== '' && $properties[$j]["sourceBName"] !== '') {
                    $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET transpose=? WHERE id=?');
                    $command->execute(array($transposeType, $properties[$j]["id"]));
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

function RestoreProperty() {
    global $projectName;
    global $checkName;
    $transposeType = null;

    $componentid = $_POST['componentid']; 
    $selectedPropertyIds = json_decode($_POST['propertyIds']); 
    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');

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
        $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
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

                    if($properties[$index]['accepted'] == 'false' && ($properties[$index]['sourceAName'] !== "" && $properties[$index]['sourceBName'] !== "")) {

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

    $dontChangeOk = array('OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)');
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
    $dontChangeOk = 'OK';
    $compProps;

    $dbh->beginTransaction();
    $command = $dbh->prepare('UPDATE ComparisonCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
    $command->execute(array($categoryStatus, $groupid, $dontChangeOk));

    $command = $dbh->prepare('SELECT * FROM ComparisonCheckComponents WHERE ownerGroup=?');
    $command->execute(array($groupid));
    $allCom = $command->fetchAll(PDO::FETCH_ASSOC);
    $index = 0;
    while ($index < count($allCom)) 
    {
        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET transpose=? WHERE id=?');
        $command->execute(array($transposeType, $allCom[$index]['id']));

        if(strpos($allCom[$index]['status'], '(T)') == true) {
            $allCom[$index]['status'] = str_replace("(T)", "", $allCom[$index]['status']);
            $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
            $command->execute(array($allCom[$index]['status'], $allCom[$index]['id']));
        }
        
        if($allCom[$index]['status'] !== 'OK' ||  $allCom[$index]['status'] !== 'No Match') {
            $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
            $command->execute(array($allCom[$index]['id']));
            $compProps = $command->fetchAll(PDO::FETCH_ASSOC);
            $indexcompProp = 0;
            while ($indexcompProp < count($compProps)) 
            {
                $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET transpose=? WHERE id=?');
                $command->execute(array($transposeType, $compProps[$indexcompProp]['id']));
                $indexcompProp++;
            }  
        }
       
        $index++;
    }

    $dbh->commit();

    $dbh->beginTransaction();
        $command = $dbh->prepare('SELECT * FROM ComparisonCheckComponents WHERE ownerGroup=?');
        $command->execute(array($groupid));
        $allCom = $command->fetchAll(PDO::FETCH_ASSOC);
        $statusArray[0] = $allCom;

        $command = $dbh->prepare('SELECT * FROM ComparisonCheckComponents WHERE ownerGroup=?');
        $command->execute(array($groupid));
        $components1 = $command->fetchAll(PDO::FETCH_ASSOC);
        $noOfComp = 0;
        $propertiesArray = array();
        while($noOfComp < count($components1)) {
            $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
            $command->execute(array($components1[$noOfComp]['id']));
            $properties = $command->fetchAll(PDO::FETCH_ASSOC);
            $propertiesArray[$noOfComp] = $properties;
            $noOfComp++;
        }

    $statusArray[1] = $propertiesArray;
    $dbh->commit();
        
    $dbh = null;
    echo json_encode($statusArray);
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
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();

    $command = $dbh->prepare('UPDATE ComparisonCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
    $command->execute(array($categoryStatus, $groupid, $dontChangeOk));


    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET transpose=? WHERE ownerGroup=? AND status!=?');
    $command->execute(array($transposeType, $groupid, $dontChangeOk));

    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET transpose=? WHERE ownerGroup=? AND status=?');
    $command->execute(array(null, $groupid, 'No Match'));

    $components = $dbh->query("SELECT * FROM ComparisonCheckComponents WHERE ownerGroup= $groupid;");
    if($components) 
    {            
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
            if($comp['status'] !== 'No Match') {
                $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=? AND severity!=?');
                $command->execute(array($comp['id'], $dontChangeOk));
                $properties = $command->fetchAll(PDO::FETCH_ASSOC);
                $index = 0;
                while($index < count($properties)) {
                    if($properties[$index]['severity'] !== "No Value" && ($properties[$index]['sourceAName'] !== "" && $properties[$index]['sourceBName'] !== "")) {
                        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET transpose=? WHERE id=? AND severity!=?');
                        $command->execute(array($transposeType, $properties[$index]['id'], $dontChangeOk));
                    }
                    $index++;
                }
            }
        }
    }

    $dbh->commit();
    $dbh = null;
}

?>