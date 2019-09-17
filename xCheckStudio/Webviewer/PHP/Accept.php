<?php
require_once 'Utility.php';

if(!isset($_POST['tabletoupdate']) || !isset($_POST['CheckName']) || !isset($_POST['ProjectName']))
{
 echo 'fail';
 return;
}

$projectName = $_POST['ProjectName'];
$checkName = $_POST['CheckName'];
$tabletoupdate = $_POST['tabletoupdate'];

switch ($tabletoupdate) {
    case "comparison":
        acceptComparisonComponent();
        break;
    case "comparisonDetailed":
        acceptComparisonProperty();
        break;
    case "category":
        acceptComparisonCategory();
        break;
    case "complianceSourceA":
        acceptComplianceComponent();
        break;
    case "complianceSourceB":
        acceptComplianceComponent();
        break;
    case "ComplianceADetailedReview":
        acceptComplianceProperty();
        break;
    case "ComplianceBDetailedReview":
        acceptComplianceProperty();
        break;
    case "categoryComplianceA":
        acceptComplianceCategory();
        break;
    case "categoryComplianceB":
        acceptComplianceCategory();
        break;
    case "acceptAllCategoriesFromComparisonTab":
        acceptAllComparison();
        break;
    case "acceptAllCategoriesFromComplianceATab":
        acceptAllComplianceA();
        break;
    case "acceptAllCategoriesFromComplianceBTab":
        acceptAllComplianceB();
        break;
    case "rejectAllCategoriesFromComparisonTab":
        unAcceptAllComparison();
        break;
    case "rejectAllCategoriesFromComplianceATab":
        unAcceptAllComplianceA();
        break;
    case "rejectAllCategoriesFromComplianceBTab":
        unAcceptAllComplianceB();
        break;
    case "rejectComponentFromComparisonTab":
        unAcceptComponent();
        break;
    case "rejectPropertyFromComparisonTab":
        unAcceptComparisonProperty();
        break;
    case "rejectCategoryFromComparisonTab":
        unAcceptComparisonCategory();
        break;
    case "rejectComponentFromComplianceATab":
        unAcceptComplianceAComponent();
        break;
    case "rejectPropertyFromComplianceATab":
        unAcceptComplianceAProperty();
        break;
    case "rejectCategoryFromComplianceATab":
        unAcceptComplianceACategory();
        break;
    case "rejectComponentFromComplianceBTab":
        unAcceptComplianceBComponent();
        break;
    case "rejectPropertyFromComplianceBTab":
        unAcceptComplianceBProperty();
        break;
    case "rejectCategoryFromComplianceBTab":
        unAcceptComplianceBCategory();
        break;
    default:
        break;
}

function acceptComparisonComponent() {
    global $projectName;
    global $checkName;
    $componentid = $_POST['componentid']; 
 //global $SourceDataSheets;

    $dbh;
    try{
    
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $status = 'true';
        $dontChangeOk = 'OK';
        $dontChangeNoValue = 'No Value';
        $dbh->beginTransaction();

        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=? WHERE id=? AND status!=?');
        $command->execute(array($status, $componentid, $dontChangeOk));

       
        $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
        $command->execute(array($componentid));
        $transposed = $command->fetchAll(PDO::FETCH_ASSOC);
        $index = 0;
        while($index < count($transposed)) { 
            if($transposed[$index]['transpose'] == null) {
                $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET accepted=? WHERE id=? AND severity!=? AND severity!=?');
                $command->execute(array($status, $transposed[$index]['id'], $dontChangeOk, $dontChangeNoValue));
        
            }
            $index++;
        }
  
        $dbh->commit();
        $dbh = null; 

    }
    catch(Exception $e) {
        echo "fail"; 
        return;
    }
}

function acceptComparisonProperty() {
    if(!isset($_POST['sourceAPropertyName']) ||
    !isset($_POST['sourceBPropertyName']))
    {
        echo 'fail';
        return;
    }

    global $projectName;
    global $checkName;
    $componentid = $_POST['componentid']; 
    $sourceAPropertyName = $_POST['sourceAPropertyName'];
    $sourceBPropertyName = $_POST['sourceBPropertyName'];
    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'true';
    $dbh->beginTransaction();

    if($sourceAPropertyName !== '') {
        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET accepted=? WHERE ownerComponent=? AND sourceAName=?');
        $command->execute(array($status, $componentid, $sourceAPropertyName));
    }
       
    else if($sourceBPropertyName !== '') {
        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET accepted=? WHERE ownerComponent=? AND sourceBName=?');
        $command->execute(array($status, $componentid, $sourceBPropertyName));
    }
      
    // $sth = $dbh->prepare('SELECT status from ComparisonCheckComponents WHERE ownerComponent= :componentid');
    // $sth->bindValue(':componentid', $componentid, PDO::PARAM_STR);
    // $sth->execute();
    $value = $dbh->query("SELECT status FROM ComparisonCheckComponents WHERE id= $componentid;");
    $originalStatusOfComponent = $value->fetch();
    if(strpos($originalStatusOfComponent['status'], '(A)') == false) {
        $changedStatusOfComponents = $originalStatusOfComponent['status'] . "(A)";
        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
        $command->execute(array($changedStatusOfComponents, $componentid));
    }

    $dbh->commit();

    $dbh->beginTransaction(); 

    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $index = 0;
    $toBecompstatus = 'true';
    $propertyTransposed = false;
    while($index < count($statusChanged)) {
        if($statusChanged[$index]['accepted'] == 'true') {
            $index++;
            continue;
        }
        else if(($statusChanged[$index]['severity'] == 'OK' || 
        $statusChanged[$index]['severity'] == 'No Value') 
        && $statusChanged[$index]['accepted'] == 'false') {
            $index++;
            continue;
        }
        else {
            if($statusChanged[$index]['transpose'] != null) {
                $toBecompstatus = 'true';
                $propertyTransposed = true;
            }
            else {
                $toBecompstatus = 'false';
                $propertyTransposed = false;
                break;
            }
            $index++;
        }
    }

    if($toBecompstatus == 'true' && $propertyTransposed == true) {
        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=? WHERE id=?');
        $command->execute(array($toBecompstatus, $componentid));
        echo 'OK(A)(T)';
    }
    else if($toBecompstatus == 'true') {
        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=? WHERE id=?');
        $command->execute(array($toBecompstatus, $componentid));
        echo 'OK(A)';
    }

    $dbh->commit();
    $dbh = null; 
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
    $dontChangeOk = 'OK';
    $dontChangeNoValue = 'No Value';

    $dbh->beginTransaction();

    $command = $dbh->prepare('UPDATE ComparisonCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
    $command->execute(array($categoryStatus, $groupid, $dontChangeOk));


    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=? WHERE ownerGroup=? AND status!=?');
    $command->execute(array($status, $groupid, $dontChangeOk));

    $components = $dbh->query("SELECT * FROM ComparisonCheckComponents WHERE ownerGroup= $groupid;");
    if($components) 
    {            
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
            if($comp['status'] !== $dontChangeOk) {
                $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET accepted=? WHERE ownerComponent=? AND severity!=? AND severity!=?');
                $command->execute(array($status, $comp['id'], $dontChangeOk, $dontChangeNoValue));
            }
        }
    }

    $dbh->commit();
    $dbh = null;
}

function acceptComplianceComponent() {
    global $projectName;
    global $checkName;
    $componentid = $_POST['componentid']; 
    global $tabletoupdate;
 //global $SourceDataSheets;

    $dbh;
    try{
    
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $status = 'true';
        $dontChangeOk = 'OK';
        $dbh->beginTransaction();

        if($tabletoupdate == "complianceSourceA") {
            $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET accepted=? WHERE id=? AND status!=?');
            $command->execute(array($status, $componentid, $dontChangeOk));
    
            $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET accepted=? WHERE ownerComponent=? AND severity!=?');
            $command->execute(array($status, $componentid, $dontChangeOk));
        }
        else if($tabletoupdate == "complianceSourceB") {
            $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET accepted=? WHERE id=? AND status!=?');
            $command->execute(array($status, $componentid, $dontChangeOk));
    
            $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET accepted=? WHERE ownerComponent=? AND severity!=?');
            $command->execute(array($status, $componentid, $dontChangeOk));
        }



        $dbh->commit();
        $dbh = null; 

    }
    catch(Exception $e) {
        echo "fail"; 
        return;
    }
}

function acceptComplianceProperty() {
    global $projectName;
    global $checkName;
    global $tabletoupdate;
    $componentid = $_POST['componentid']; 

    if(isset($_POST['sourcePropertyName']))
        $sourcePropertyName = $_POST['sourcePropertyName'];
    else 
        return;

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'true';
    $dbh->beginTransaction();

    if($tabletoupdate == "ComplianceADetailedReview") {
        $componentTableName = 'SourceAComplianceCheckComponents';
        $propertiesTableName = 'SourceAComplianceCheckProperties';  
    }
    else if($tabletoupdate == "ComplianceBDetailedReview") {
        $componentTableName = 'SourceBComplianceCheckComponents';
        $propertiesTableName = 'SourceBComplianceCheckProperties'; 
    }
    
    $sql = "UPDATE ". $propertiesTableName ." SET accepted=? WHERE ownerComponent=? AND name=?";
    $sql1 = "UPDATE ". $componentTableName ." SET status=? WHERE id=?";
    $command = $dbh->prepare($sql);
    $command->execute(array($status, $componentid, $sourcePropertyName));
    $value = $dbh->query("SELECT status FROM $componentTableName WHERE id= $componentid;");
    $originalStatusOfComponent = $value->fetch();
    if(strpos($originalStatusOfComponent['status'], '(A)') == false) {
        $changedStatusOfComponents = $originalStatusOfComponent['status'] . "(A)";
        $command = $dbh->prepare($sql1);
        $command->execute(array($changedStatusOfComponents, $componentid));
    }

    $dbh->commit();

    $dbh->beginTransaction(); 
    $sql = 'SELECT * FROM ' . $propertiesTableName . ' WHERE ownerComponent=?';
    $command = $dbh->prepare($sql);
    $command->execute(array($componentid));
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $index = 0;
    $toBecompstatus = 'true';
    while($index < count($statusChanged)) {
        if($statusChanged[$index]['accepted'] == 'true') {
            $index++;
            continue;
        }
        else if($statusChanged[$index]['severity'] == 'OK' && $statusChanged[$index]['accepted'] == 'false') {
            $index++;
            continue;
        }
        else {
            $toBecompstatus = 'false';
            break;
        }
    }

    if($toBecompstatus == 'true') {
        $sql = 'UPDATE ' .  $componentTableName . ' SET accepted=? WHERE id=?';
        $command = $dbh->prepare($sql);
        $command->execute(array($toBecompstatus, $componentid));
        echo 'OK(A)';
    }

    $dbh->commit();
    $dbh = null; 
}

function acceptComplianceCategory() {
    if(!isset($_POST['groupid'])) {
        echo 'fail';
        return;
    }

    global $projectName;
    global $checkName;
    global $tabletoupdate;
    $groupid = $_POST['groupid'];

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'ACCEPTED';
    $status = 'true';
    $dontChangeOk = 'OK';
    $componentTableName;
    $propertiesTableName;
    $dbh->beginTransaction();

    if($tabletoupdate == "categoryComplianceA") {
        $componentTableName = 'SourceAComplianceCheckComponents';
        $propertiesTableName = 'SourceAComplianceCheckProperties'; 
        $command = $dbh->prepare('UPDATE SourceAComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
        $command->execute(array($categoryStatus, $groupid, $dontChangeOk)); 
    }
    else if($tabletoupdate == "categoryComplianceB") {
        $componentTableName = 'SourceBComplianceCheckComponents';
        $propertiesTableName = 'SourceBComplianceCheckProperties';
        $command = $dbh->prepare('UPDATE SourceBComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
        $command->execute(array($categoryStatus, $groupid, $dontChangeOk)); 
    }

        $sql = "UPDATE ".$componentTableName." SET accepted=? WHERE ownerGroup=? AND status!=?";
        $sql1 = "UPDATE ".$propertiesTableName." SET accepted=? WHERE ownerComponent=? AND severity!=?";
        $command = $dbh->prepare($sql);
        $command->execute(array($status, $groupid, $dontChangeOk));

        $components = $dbh->query("SELECT * FROM $componentTableName  WHERE ownerGroup= $groupid;");
        if($components) 
        {            
            while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
            {
                if($comp['status'] !== $dontChangeOk) {
                    $command = $dbh->prepare($sql1);
                    $command->execute(array($status, $comp['id'], $dontChangeOk));
                }
            }
        }

    $dbh->commit();
    $dbh = null;
}

function acceptAllComparison() {
    global $projectName;
    global $checkName;
    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'ACCEPTED';
    $status = 'true';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();

    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=? WHERE status!=?');
    $command->execute(array($status, $dontChangeOk));

    $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET accepted=? WHERE severity!=?');
    $command->execute(array($status, $dontChangeOk));

    $dbh->commit();
    $dbh = null;
}

function acceptAllComplianceA() {
    global $projectName;
    global $checkName;
    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'true';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();

    $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET accepted=? WHERE status!=?');
    $command->execute(array($status, $dontChangeOk));

    $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET accepted=? WHERE severity!=?');
    $command->execute(array($status, $dontChangeOk));

    $dbh->commit();
    $dbh = null;
}

function acceptAllComplianceB() {
    global $projectName;
    global $checkName;
    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'true';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();

    $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET accepted=? WHERE status!=?');
    $command->execute(array($status, $dontChangeOk));

    $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET accepted=? WHERE severity!=?');
    $command->execute(array($status, $dontChangeOk));

    $dbh->commit();
    $dbh = null;
}

function unAcceptAllComparison() {
    global $projectName;
    global $checkName;
    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'false';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();


    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=? WHERE status!=?');
    $command->execute(array($status, $dontChangeOk));
                 
    $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET accepted=? WHERE severity!=?');
    $command->execute(array($status, $dontChangeOk));

    $command = $dbh->query('SELECT * FROM ComparisonCheckComponents');
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $index = 0;
    while($index < count($statusChanged)) {
        if(strpos($statusChanged[$index]['status'], '(A)') == true) {
            $toBecompstatus = str_replace("(A)", "", $statusChanged[$index]['status']);
            $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
            $command->execute(array($toBecompstatus, $statusChanged[$index]['id']));
        }
        $index++;
    }
           
    $dbh->commit();
    $dbh = null;
}

function unAcceptAllComplianceA() {
    global $projectName;
    global $checkName;
    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'false';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();


    $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET accepted=? WHERE status!=?');
    $command->execute(array($status, $dontChangeOk));
                 
    $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET accepted=? WHERE severity!=?');
    $command->execute(array($status, $dontChangeOk));

    $command = $dbh->query('SELECT * FROM SourceAComplianceCheckComponents');
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $index = 0;
    while($index < count($statusChanged)) {
        if(strpos($statusChanged[$index]['status'], '(A)') == true) {
            $toBecompstatus = str_replace("(A)", "", $statusChanged[$index]['status']);
            $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET status=? WHERE id=?');
            $command->execute(array($toBecompstatus, $statusChanged[$index]['id']));
        }
        $index++;
    }
           
    $dbh->commit();
    $dbh = null;
}

function unAcceptAllComplianceB() {
    global $projectName;
    global $checkName;
    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'false';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();


    $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET accepted=? WHERE status!=?');
    $command->execute(array($status, $dontChangeOk));
                 
    $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET accepted=? WHERE severity!=?');
    $command->execute(array($status, $dontChangeOk));
           

    $command = $dbh->query('SELECT * FROM SourceBComplianceCheckComponents');
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $index = 0;
    while($index < count($statusChanged)) {
        if(strpos($statusChanged[$index]['status'], '(A)') == true) {
            $toBecompstatus = str_replace("(A)", "", $statusChanged[$index]['status']);
            $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET status=? WHERE id=?');
            $command->execute(array($toBecompstatus, $statusChanged[$index]['id']));
        }
        $index++;
    }

    $dbh->commit();
    $dbh = null;
}

function unAcceptComponent() {
    $statusArray = array();
    global $projectName;
    global $checkName;
    $componentid = $_POST['componentid']; 


    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbh->beginTransaction();

    $acceptedStatus = 'false';

    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=? WHERE id=?');
    $command->execute(array($acceptedStatus, $componentid));

    $components = $dbh->query("SELECT status FROM ComparisonCheckComponents WHERE id= $componentid;");
    $originalStatus = $components->fetch();

    if(strpos($originalStatus['status'], '(A)') == true) {
        $originalStatus['status'] = str_replace("(A)", "", $originalStatus['status']);
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
        if($allProps[$propCount]['accepted'] == 'true') {
            $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET accepted=? WHERE id=?');
            $command->execute(array($acceptedStatus, $allProps[$propCount]['id']));
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

function unAcceptComparisonProperty() {
    $statusArray = array();
    global $projectName;
    global $checkName;
    $componentid = $_POST['componentid']; 
    $sourceAPropertyName = $_POST['sourceAPropertyName'];
    $sourceBPropertyName = $_POST['sourceBPropertyName'];
    $toBecompstatus = " ";
    $originalstatus;
    $acceptedStatus = 'false';

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 


    $dbh->beginTransaction();

    if($sourceAPropertyName !== '') {    
        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET accepted=? WHERE ownerComponent=? AND sourceAName=?');
        $command->execute(array($acceptedStatus, $componentid, $sourceAPropertyName));

        $command = $dbh->prepare('SELECT severity FROM ComparisonCheckProperties WHERE ownerComponent=? AND sourceAName=?');
        $command->execute(array($componentid, $sourceAPropertyName));
        $originalstatus = $command->fetch();
    }
       
    else if($sourceBPropertyName !== '') {
        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET accepted=? WHERE ownerComponent=? AND sourceBName=?');
        $command->execute(array($acceptedStatus, $componentid, $sourceBPropertyName));

        $command = $dbh->prepare('SELECT severity FROM ComparisonCheckProperties WHERE ownerComponent=? AND sourceBName=?');
        $command->execute(array($componentid, $sourceBPropertyName));
        $originalstatus = $command->fetch();
    }

    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=? WHERE id=?');
    $command->execute(array($acceptedStatus, $componentid));

    $dbh->commit();

    $dbh->beginTransaction();

    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $command = $dbh->prepare('SELECT accepted FROM ComparisonCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatus = $command->fetch();

    $command = $dbh->prepare('SELECT status FROM ComparisonCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatus1 = $command->fetch();

    $index = 0;
    $toBecompstatus = $componentstatus1['status'];
    while($index < count($statusChanged)) {
        if($statusChanged[$index]['accepted'] == "true" && $componentstatus['accepted'] !== "true") {
            $toBecompstatus = $componentstatus1['status'];
            break;
        } 
        else {
            if($componentstatus['accepted'] == "true" && strpos($componentstatus1['status'], '(A)') == false) {
                $toBecompstatus = $componentstatus1['status'] . "(A)";
            }
            else 
            {
                if($statusChanged[$index]['severity'] != 'OK' && $statusChanged[$index]['severity'] != 'OK(T)' && $statusChanged[$index]['severity'] != 'No Value') {
                    if($statusChanged[$index]['accepted'] == "false" && strpos($componentstatus1['status'], '(A)') == true) {
                        $toBecompstatus = str_replace("(A)", "", $componentstatus1['status']);
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

function unAcceptComparisonCategory() {
    $statusArray = array();
    global $projectName;
    global $checkName;
    $groupid = $_POST['groupid'];

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'UNACCEPTED';
    $status = 'false';
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
        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET accepted=? WHERE id=?');
        $command->execute(array($status, $allCom[$index]['id']));

        if(strpos($allCom[$index]['status'], '(A)') == true) {
            $allCom[$index]['status'] = str_replace("(A)", "", $allCom[$index]['status']);
            $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
            $command->execute(array($allCom[$index]['status'], $allCom[$index]['id']));
        }
        
        if($allCom[$index]['status'] !== $dontChangeOk) {
            $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
            $command->execute(array($allCom[$index]['id']));
            $compProps = $command->fetchAll(PDO::FETCH_ASSOC);
            $indexcompProp = 0;
            while ($indexcompProp < count($compProps)) 
            {
                $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET accepted=? WHERE id=?');
                $command->execute(array($status, $compProps[$indexcompProp]['id']));
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

function unAcceptComplianceAComponent() {
    $statusArray = array();
    global $projectName;
    global $checkName;
    $componentid = $_POST['componentid']; 
    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbh->beginTransaction();

    $acceptedStatus = 'false';

    $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET accepted=? WHERE id=?');
    $command->execute(array($acceptedStatus, $componentid));

    $components = $dbh->query("SELECT status FROM SourceAComplianceCheckComponents WHERE id= $componentid;");
    $originalStatus = $components->fetch();

    if(strpos($originalStatus['status'], '(A)') == true) {
        $originalStatus['status'] = str_replace("(A)", "", $originalStatus['status']);
        $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET status=? WHERE id=?');
        $command->execute(array($originalStatus['status'], $componentid));
    }

    $statusArray[0] = $originalStatus['status'];

    $command = $dbh->prepare('SELECT * FROM SourceAComplianceCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $allProps = $command->fetchAll(\PDO::FETCH_ASSOC);
    $propCount = 0;
    while ($propCount < count($allProps)) 
    {
        if($allProps[$propCount]['accepted'] == 'true') {
            $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET accepted=? WHERE id=?');
            $command->execute(array($acceptedStatus, $allProps[$propCount]['id']));
        }
        $propCount++;
    }

    $originalCompProps = $dbh->query("SELECT * FROM SourceAComplianceCheckProperties WHERE ownerComponent= $componentid;");
    $allPropsOrg = $originalCompProps->fetchAll(PDO::FETCH_ASSOC);

    $statusArray[1] = $allPropsOrg;

    $dbh->commit();
    $dbh = null;

    echo json_encode($statusArray);

}

function unAcceptComplianceAProperty() {
    $statusArray = array();
    global $projectName;
    global $checkName;
    $componentid = $_POST['componentid']; 
    $sourcePropertyName = $_POST['sourcePropertyName'];
    $toBecompstatus = " ";
    $originalstatus;
    $acceptedStatus = 'false';

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 


    $dbh->beginTransaction();

        $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET accepted=? WHERE ownerComponent=? AND name=?');
        $command->execute(array($acceptedStatus, $componentid, $sourcePropertyName));

        $command = $dbh->prepare('SELECT severity FROM SourceAComplianceCheckProperties WHERE ownerComponent=? AND name=?');
        $command->execute(array($componentid, $sourcePropertyName));
        $originalstatus = $command->fetch();

    $dbh->commit();

    $dbh->beginTransaction();

    $command = $dbh->prepare('SELECT * FROM SourceAComplianceCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $command = $dbh->prepare('SELECT accepted FROM SourceAComplianceCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatus = $command->fetch();

    $command = $dbh->prepare('SELECT status FROM SourceAComplianceCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatus1 = $command->fetch();

    $index = 0;
    while($index < count($statusChanged)) {
        if($statusChanged[$index]['accepted'] == "true" && $componentstatus['accepted'] !== "true") {
            $toBecompstatus = $componentstatus1['status'];
            break;
        } 
        else {
            if($componentstatus['accepted'] == "true" && strpos($componentstatus1['status'], '(A)') == false) {
                $toBecompstatus = $componentstatus1['status'] . "(A)";
            }
            else 
            {
                if($statusChanged[$index]['severity'] != 'OK' && $statusChanged[$index]['severity'] != 'OK(T)') {
                    if($statusChanged[$index]['accepted'] == "false" && strpos($componentstatus1['status'], '(A)') == true) {
                        $toBecompstatus =  str_replace("(A)", "", $componentstatus1['status']);
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

    $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET status=? WHERE id=?');
    $command->execute(array($toBecompstatus, $componentid));

    $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET accepted=? WHERE id=?');
    $command->execute(array($acceptedStatus, $componentid));

    $dbh->commit();

    $dbh = null;

    $statusArray[0] = $toBecompstatus;
    $statusArray[1] = $originalstatus['severity'];
    echo json_encode($statusArray);

}

function unAcceptComplianceACategory() {
    $statusArray = array();
    global $projectName;
    global $checkName;
    $groupid = $_POST['groupid'];

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'UNACCEPTED';
    $status = 'false';
    $dontChangeOk = 'OK';
    $compProps;

    $dbh->beginTransaction();
   
    $command = $dbh->prepare('UPDATE SourceAComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
    $command->execute(array($categoryStatus, $groupid, $dontChangeOk));

    $command = $dbh->prepare('SELECT * FROM SourceAComplianceCheckComponents WHERE ownerGroup=?');
    $command->execute(array($groupid));
    $allCom = $command->fetchAll(PDO::FETCH_ASSOC);
    $index = 0;
    while ($index < count($allCom)) 
    {
        $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET accepted=? WHERE id=?');
        $command->execute(array($status, $allCom[$index]['id']));

        if(strpos($allCom[$index]['status'], '(A)') == true) {
            $allCom[$index]['status'] = str_replace("(A)", "", $allCom[$index]['status']);
            $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET status=? WHERE id=?');
            $command->execute(array($allCom[$index]['status'], $allCom[$index]['id']));
        }
        
        $index++;
    }

    $dbh->commit();

    $dbh->beginTransaction();

    $command = $dbh->prepare('SELECT * FROM SourceAComplianceCheckComponents WHERE ownerGroup=?');
    $command->execute(array($groupid));
    $components = $command->fetchAll(PDO::FETCH_ASSOC);
    $indexcomp = 0;
    
    while ($indexcomp < count($components)) 
    {
        if($components[$indexcomp]['status'] !== $dontChangeOk) {
            $command = $dbh->prepare('SELECT * FROM SourceAComplianceCheckProperties WHERE ownerComponent=?');
            $command->execute(array($components[$indexcomp]['id']));
            $compProps = $command->fetchAll(PDO::FETCH_ASSOC);
            $indexcompProp = 0;
            while ($indexcompProp < count($compProps)) 
            {
                $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET accepted=? WHERE id=?');
                $command->execute(array($status, $compProps[$indexcompProp]['id']));
                $indexcompProp++;
            }  
            $indexcomp++;      
        }
    }

    $dbh->commit();


    $dbh->beginTransaction();

        $command = $dbh->prepare('SELECT * FROM SourceAComplianceCheckComponents WHERE ownerGroup=?');
        $command->execute(array($groupid));
        $allCom = $command->fetchAll(PDO::FETCH_ASSOC);
        $statusArray[0] = $allCom;

        $command = $dbh->prepare('SELECT * FROM SourceAComplianceCheckComponents WHERE ownerGroup=?');
        $command->execute(array($groupid));
        $components1 = $command->fetchAll(PDO::FETCH_ASSOC);
        $noOfComp = 0;
        $propertiesArray = array();
        while($noOfComp < count($components1)) {
            $command = $dbh->prepare('SELECT * FROM SourceAComplianceCheckProperties WHERE ownerComponent=?');
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


function unAcceptComplianceBComponent() {
    $statusArray = array();
    global $projectName;
    global $checkName;
    $componentid = $_POST['componentid']; 


    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbh->beginTransaction();

    $acceptedStatus = 'false';

    $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET accepted=? WHERE id=?');
    $command->execute(array($acceptedStatus, $componentid));

    $components = $dbh->query("SELECT status FROM SourceBComplianceCheckComponents WHERE id= $componentid;");
    $originalStatus = $components->fetch();

    if(strpos($originalStatus['status'], '(A)') == true) {
        $originalStatus['status'] = str_replace("(A)", "", $originalStatus['status']);
        $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET status=? WHERE id=?');
        $command->execute(array($originalStatus['status'], $componentid));
    }

    $statusArray[0] = $originalStatus['status'];

    $command = $dbh->prepare('SELECT * FROM SourceBComplianceCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $allProps = $command->fetchAll(\PDO::FETCH_ASSOC);
    $propCount = 0;
    while ($propCount < count($allProps)) 
    {
        if($allProps[$propCount]['accepted'] == 'true') {
            $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET accepted=? WHERE id=?');
            $command->execute(array($acceptedStatus, $allProps[$propCount]['id']));
        }
        $propCount++;
    }

    $originalCompProps = $dbh->query("SELECT * FROM SourceBComplianceCheckProperties WHERE ownerComponent= $componentid;");
    $allPropsOrg = $originalCompProps->fetchAll(PDO::FETCH_ASSOC);

    $statusArray[1] = $allPropsOrg;

    $dbh->commit();
    $dbh = null;

    echo json_encode($statusArray);

}

function unAcceptComplianceBProperty() {
    $statusArray = array();
    global $projectName;
    global $checkName;
    $componentid = $_POST['componentid']; 
    $sourcePropertyName = $_POST['sourcePropertyName'];
    $toBecompstatus = " ";
    $originalstatus;
    $acceptedStatus = 'false';

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 


    $dbh->beginTransaction();

        $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET accepted=? WHERE ownerComponent=? AND name=?');
        $command->execute(array($acceptedStatus, $componentid, $sourcePropertyName));

        $command = $dbh->prepare('SELECT severity FROM SourceBComplianceCheckProperties WHERE ownerComponent=? AND name=?');
        $command->execute(array($componentid, $sourcePropertyName));
        $originalstatus = $command->fetch();

    $dbh->commit();

    $dbh->beginTransaction();

    $command = $dbh->prepare('SELECT * FROM SourceBComplianceCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $command = $dbh->prepare('SELECT accepted FROM SourceBComplianceCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatus = $command->fetch();

    $command = $dbh->prepare('SELECT status FROM SourceBComplianceCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatus1 = $command->fetch();

    $index = 0;
    while($index < count($statusChanged)) {
        if($statusChanged[$index]['accepted'] == "true" && $componentstatus['accepted'] !== "true") {
            $toBecompstatus = $componentstatus1['status'];
            break;
        } 
        else {
            if($componentstatus['accepted'] == "true" && strpos($componentstatus1['status'], '(A)') == false) {
                $toBecompstatus = $componentstatus1['status'] . "(A)";
            }
            else 
            {
                if($statusChanged[$index]['severity'] != 'OK' && $statusChanged[$index]['severity'] != 'OK(T)') {
                    if($statusChanged[$index]['accepted'] == "false" && strpos($componentstatus1['status'], '(A)') == true) {
                        $toBecompstatus =  str_replace("(A)", "", $componentstatus1['status']);
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

    $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET status=? WHERE id=?');
    $command->execute(array($toBecompstatus, $componentid));

    $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET accepted=? WHERE id=?');
    $command->execute(array($acceptedStatus, $componentid));

    $dbh->commit();

    $dbh = null;

    $statusArray[0] = $toBecompstatus;
    $statusArray[1] = $originalstatus['severity'];
    echo json_encode($statusArray);
}

function unAcceptComplianceBCategory() {
    $statusArray = array();
    global $projectName;
    global $checkName;
    $groupid = $_POST['groupid'];

    $dbPath = getCheckDatabasePath($projectName, $checkName);
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'UNACCEPTED';
    $status = 'false';
    $dontChangeOk = 'OK';
    $compProps;

    $dbh->beginTransaction();
   
    $command = $dbh->prepare('UPDATE SourceBComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
    $command->execute(array($categoryStatus, $groupid, $dontChangeOk));

    $command = $dbh->prepare('SELECT * FROM SourceBComplianceCheckComponents WHERE ownerGroup=?');
    $command->execute(array($groupid));
    $allCom = $command->fetchAll(PDO::FETCH_ASSOC);
    $index = 0;
    while ($index < count($allCom)) 
    {
        $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET accepted=? WHERE id=?');
        $command->execute(array($status, $allCom[$index]['id']));

        if(strpos($allCom[$index]['status'], '(A)') == true) {
            $allCom[$index]['status'] =  str_replace("(A)", "", $allCom[$index]['status']);
            $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET status=? WHERE id=?');
            $command->execute(array($allCom[$index]['status'], $allCom[$index]['id']));
        }
        
        $index++;
    }

    $dbh->commit();

    $dbh->beginTransaction();

    $command = $dbh->prepare('SELECT * FROM SourceBComplianceCheckComponents WHERE ownerGroup=?');
    $command->execute(array($groupid));
    $components = $command->fetchAll(PDO::FETCH_ASSOC);
    $indexcomp = 0;
    
    while ($indexcomp < count($components)) 
    {
        if($components[$indexcomp]['status'] !== $dontChangeOk) {
            $command = $dbh->prepare('SELECT * FROM SourceBComplianceCheckProperties WHERE ownerComponent=?');
            $command->execute(array($components[$indexcomp]['id']));
            $compProps = $command->fetchAll(PDO::FETCH_ASSOC);
            $indexcompProp = 0;
            while ($indexcompProp < count($compProps)) 
            {
                $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET accepted=? WHERE id=?');
                $command->execute(array($status, $compProps[$indexcompProp]['id']));
                $indexcompProp++;
            }  
            $indexcomp++;      
        }
    }

    $dbh->commit();


    $dbh->beginTransaction();

        $command = $dbh->prepare('SELECT * FROM SourceBComplianceCheckComponents WHERE ownerGroup=?');
        $command->execute(array($groupid));
        $allCom = $command->fetchAll(PDO::FETCH_ASSOC);
        $statusArray[0] = $allCom;

        $command = $dbh->prepare('SELECT * FROM SourceBComplianceCheckComponents WHERE ownerGroup=?');
        $command->execute(array($groupid));
        $components1 = $command->fetchAll(PDO::FETCH_ASSOC);
        $noOfComp = 0;
        $propertiesArray = array();
        while($noOfComp < count($components1)) {
            $command = $dbh->prepare('SELECT * FROM SourceBComplianceCheckProperties WHERE ownerComponent=?');
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
?>

   