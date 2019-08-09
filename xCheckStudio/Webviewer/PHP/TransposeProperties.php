<?php



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
    $componentid = $_POST['componentid']; 
    global $projectName;
    global $checkName;
    global $transposeType;

    $sourceAPropertyName = $_POST['sourceAPropertyName'];
    $sourceBPropertyName = $_POST['sourceBPropertyName'];

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbh->beginTransaction();

    if($sourceAPropertyName !== '') {
        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET transpose=? WHERE ownerComponent=? AND sourceAName=?');
        $command->execute(array($transposeType, $componentid, $sourceAPropertyName));
    }
    else if($sourceBPropertyName !== '') {
        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET transpose=? WHERE ownerComponent=? AND sourceBName=?');
        $command->execute(array($transposeType, $componentid, $sourceBPropertyName));
    }

    $value = $dbh->query("SELECT status FROM ComparisonCheckComponents WHERE id= $componentid;");
    $originalStatusOfComponent = $value->fetch();
    if(strpos($originalStatusOfComponent['status'], '(T)') == false) {
        $changedStatusOfComponents = $originalStatusOfComponent['status'] . "(T)";
        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
        $command->execute(array($changedStatusOfComponents, $componentid));
    }

    $dbh->commit();
    
    $dbh->beginTransaction(); 

    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $index = 0;
    $toBecompstatus = $transposeType;
    $propertyAccepted = false;
    while($index < count($statusChanged)) {
        if($statusChanged[$index]['transpose'] !== null) {
            $index++;
            continue;
        }
        else if(($statusChanged[$index]['severity'] == 'OK' || $statusChanged[$index]['severity'] == 'No Value') && $statusChanged[$index]['transpose'] == null) {
            $index++;
            continue;
        }
        else {
            if($statusChanged[$index]['accepted'] != 'false') {
                $toBecompstatus = $transposeType;
                $propertyAccepted = true;
            }
            else {
                $toBecompstatus = null;
                $propertyAccepted = false;
            }
            $index++;
        }
    }

    if($toBecompstatus !== null  && $propertyAccepted == true) {
        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET transpose=? WHERE id=?');
        $command->execute(array($toBecompstatus, $componentid));
        echo 'OK(A)(T)';
    }
    else if($toBecompstatus !== null) {
        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET transpose=? WHERE id=?');
        $command->execute(array($toBecompstatus, $componentid));
        echo 'OK(T)';
    }

    $dbh->commit();
    $dbh = null; 
}

function RestoreProperty() {
    $componentid = $_POST['componentid']; 
    global $projectName;
    global $checkName;
    $transposeType = null;
    $originalstatus= "";
    $statusArray = array();
    $toBecompstatus = null;
    $sourceAPropertyName = $_POST['sourceAPropertyName'];
    $sourceBPropertyName = $_POST['sourceBPropertyName'];

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbh->beginTransaction();

    if($sourceAPropertyName !== '') {
        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET transpose=? WHERE ownerComponent=? AND sourceAName=?');
        $command->execute(array($transposeType, $componentid, $sourceAPropertyName));

        $command = $dbh->prepare('SELECT severity FROM ComparisonCheckProperties WHERE ownerComponent=? AND sourceAName=?');
        $command->execute(array($componentid, $sourceAPropertyName));
        $originalstatus = $command->fetch();
    }
    else if($sourceBPropertyName !== '') {
        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET transpose=? WHERE ownerComponent=? AND sourceBName=?');
        $command->execute(array($transposeType, $componentid, $sourceBPropertyName));

        $command = $dbh->prepare('SELECT severity FROM ComparisonCheckProperties WHERE ownerComponent=? AND sourceAName=?');
        $command->execute(array($componentid, $sourceAPropertyName));
        $originalstatus = $command->fetch();
    }

    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET transpose=? WHERE id=?');
    $command->execute(array($transposeType, $componentid));

    $dbh->commit();

    $dbh->beginTransaction();

    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $command = $dbh->prepare('SELECT transpose FROM ComparisonCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatus = $command->fetch();

    $command = $dbh->prepare('SELECT status FROM ComparisonCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatus1 = $command->fetch();

    $index = 0;
    $toBecompstatus = $componentstatus1['status'];
    while($index < count($statusChanged)) {
        if($statusChanged[$index]['transpose'] !== null && $componentstatus['transpose'] == null) {
            $toBecompstatus = $componentstatus1['status'];
            break;
        } 
        else {
            if($componentstatus['transpose'] !== null && strpos($componentstatus1['status'], '(T)') == false) {
                $toBecompstatus = $componentstatus1['status'] . "(T)";
            }
            else 
            {
                if($statusChanged[$index]['severity'] != 'OK' && $statusChanged[$index]['severity'] != 'OK(T)' && $statusChanged[$index]['severity'] != 'No Value' &&
                $statusChanged[$index]['accepted'] == 'false') {
                    if($statusChanged[$index]['transpose'] == null && strpos($componentstatus1['status'], '(T)') == true) {
                        $toBecompstatus = str_replace("(T)", "", $componentstatus1['status']);
                    }
                    else {
                        $toBecompstatus = $componentstatus1['status'];
                        break;
                    }
                }               
            }
        }
        $index++;
    }

    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
    $command->execute(array($toBecompstatus, $componentid));

    $dbh->commit();

    $dbh = null;

    $statusArray[0] = $toBecompstatus;
    $statusArray[1] = $originalstatus['severity'];
    echo json_encode($statusArray);    
}

function TransposeComponentProperties() {
    global $projectName;
    global $checkName;
    $componentid = $_POST['componentid']; 
    global $transposeType;

    $dbh;
    try{
    
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $dontChangeOk = 'OK';
        $dbh->beginTransaction();

        $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=? AND severity!=?');
        $command->execute(array($componentid, $dontChangeOk));
        $properties = $command->fetchAll(PDO::FETCH_ASSOC);
        $index = 0;
        while($index < count($properties)) {
            if($properties[$index]['severity'] !== "No Value" && $properties[$index]['accepted'] == 'false' && ($properties[$index]['sourceAName'] !== "" && $properties[$index]['sourceBName'] !== "")) {
                $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET transpose=? WHERE id=? AND severity!=?');
                $command->execute(array($transposeType, $properties[$index]['id'], $dontChangeOk));
            }
            $index++;
        }

        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET transpose=? WHERE id=? AND status!=?');
        $command->execute(array($transposeType, $componentid, $dontChangeOk));
       

        $dbh->commit();
        $dbh = null; 

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
    $componentid = $_POST['componentid']; 
    $transposeType = null;


    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbh->beginTransaction();

    // $acceptedStatus = 'false';

    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET transpose=? WHERE id=?');
    $command->execute(array($transposeType, $componentid));

    $components = $dbh->query("SELECT status FROM ComparisonCheckComponents WHERE id= $componentid;");
    $originalStatus = $components->fetch();

    if(strpos($originalStatus['status'], '(T)') == true) {
        $originalStatus['status'] = str_replace("(T)", "", $originalStatus['status']);
        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
        $command->execute(array($originalStatus['status'], $componentid));
    }

    $statusArray[0] = $originalStatus['status'];

    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $allProps = $command->fetchAll(\PDO::FETCH_ASSOC);
    $propCount = 0;
    while ($propCount < count($allProps)) 
    {
        if($allProps[$propCount]['transpose'] !== null) {
            $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET transpose=? WHERE id=?');
            $command->execute(array($transposeType, $allProps[$propCount]['id']));
        }
        $propCount++;
    }

    $originalCompProps = $dbh->query("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent= $componentid;");
    $allPropsOrg = $originalCompProps->fetchAll(PDO::FETCH_ASSOC);

    $statusArray[1] = $allPropsOrg;

    $dbh->commit();
    $dbh = null;

    echo json_encode($statusArray);
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