<?php
if(!isset($_POST['tabletoupdate']))
{
 echo 'fail';
 return;
}

session_start();

// get project name
$projectName = NULL;
if(isset($_SESSION['ProjectName']))
{
 $projectName =  $_SESSION['ProjectName'];              
}
else
{
 echo 'fail';
 return;
}	

$tabletoupdate = $_POST['tabletoupdate'];

switch ($tabletoupdate) {
    case "comparison":
        updateComponentComparisonStatusInReview();
        break;
    case "comparisonDetailed":
        updatePropertyComparisonStatusInReview();
        break;
    case "category":
        updateCategoryComparisonStatusInReview();
        break;
    case "complianceSourceA":
        updateComponentComplianceStatusInReview()();
        break;
    case "complianceSourceB":
        updateComponentComplianceStatusInReview()();
        break;
    case "ComplianceADetailedReview":
        updatePropertyComplianceStatusInReview();
        break;
    case "ComplianceBDetailedReview":
        updatePropertyComplianceStatusInReview();
        break;
    case "categoryComplianceA":
        updateCategoryComplianceStatusInReview();
        break;
    case "categoryComplianceB":
        updateCategoryComplianceStatusInReview();
        break;
    case "acceptAllCategoriesFromComparisonTab":
        updateStatusOfAllComparisonCategories();
        break;
    case "acceptAllCategoriesFromComplianceATab":
        updateStatusOfAllComplianceACategories();
        break;
    case "acceptAllCategoriesFromComplianceBTab":
        updateStatusOfAllComplianceBCategories();
        break;
    case "rejectAllCategoriesFromComparisonTab":
        updateStatusOfAllComparisonCategoriesToOriginal();
        break;
    case "rejectAllCategoriesFromComplianceATab":
        updateStatusOfAllComplianceACategoriesToOriginal();
        break;
    case "rejectAllCategoriesFromComplianceBTab":
        updateStatusOfAllComplianceBCategoriesToOriginal();
        break;
    case "rejectComponentFromComparisonTab":
        rejectAcceptStatusComparisonComponent();
        break;
    case "rejectPropertyFromComparisonTab":
        rejectAcceptStatusComparisonProperty();
        break;
    case "rejectCategoryFromComparisonTab":
        rejectAcceptStatusComparisonCategory();
        break;
    case "rejectComponentFromComplianceATab":
        rejectAcceptStatusComplianceAComponent();
        break;
    case "rejectPropertyFromComplianceATab":
        rejectAcceptStatusComplianceAProperty();
        break;
    case "rejectCategoryFromComplianceATab":
        rejectAcceptStatusComplianceACategory();
        break;
    case "rejectComponentFromComplianceBTab":
        rejectAcceptStatusComplianceBComponent();
        break;
    case "rejectPropertyFromComplianceBTab":
        rejectAcceptStatusComplianceBProperty();
        break;
    case "rejectCategoryFromComplianceBTab":
        rejectAcceptStatusComplianceBCategory();
        break;
    default:
        break;
}

function updateComponentComparisonStatusInReview() {
    global $projectName;
    $componentid = $_POST['componentid']; 
 //global $SourceDataSheets;

    $dbh;
    try{
    
        // open database
        $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $status = 'ACCEPTED';
        $dontChangeOk = 'OK';
        $dbh->beginTransaction();

        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=? AND status!=?');
        $command->execute(array($status, $componentid, $dontChangeOk));

        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET severity=? WHERE ownerComponent=? AND severity!=?');
        $command->execute(array($status, $componentid, $dontChangeOk));


        $dbh->commit();
        $dbh = null; 

    }
    catch(Exception $e) {
        echo "fail"; 
        return;
    }
}

function updatePropertyComparisonStatusInReview() {
    if(!isset($_POST['sourceAPropertyName']) ||
    !isset($_POST['sourceBPropertyName']))
    {
        echo 'fail';
        return;
    }

    global $projectName;
    $componentid = $_POST['componentid']; 
    $sourceAPropertyName = $_POST['sourceAPropertyName'];
    $sourceBPropertyName = $_POST['sourceBPropertyName'];
    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'ACCEPTED';
    $dbh->beginTransaction();

    if($sourceAPropertyName !== '') {
        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET severity=? WHERE ownerComponent=? AND sourceAName=?');
        $command->execute(array($status, $componentid, $sourceAPropertyName));
    }
       
    else if($sourceBPropertyName !== '') {
        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET severity=? WHERE ownerComponent=? AND sourceBName=?');
        $command->execute(array($status, $componentid, $sourceBPropertyName));
    }
      
    // $sth = $dbh->prepare('SELECT status from ComparisonCheckComponents WHERE ownerComponent= :componentid');
    // $sth->bindValue(':componentid', $componentid, PDO::PARAM_STR);
    // $sth->execute();
    $value = $dbh->query("SELECT status FROM ComparisonCheckComponents WHERE id= $componentid;");
    $originalStatusOfComponent = $value->fetch();
    if(strpos($originalStatusOfComponent['status'], '*') == false) {
        $changedStatusOfComponents = $originalStatusOfComponent['status'] . "*";
        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
        $command->execute(array($changedStatusOfComponents, $componentid));
    }
    

    $dbh->commit();
    $dbh = null; 
}

function updateCategoryComparisonStatusInReview() {
    if(!isset($_POST['groupid'])) {
        echo 'fail';
        return;
    }

    global $projectName;
    $groupid = $_POST['groupid'];

    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'ACCEPTED';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();

    $command = $dbh->prepare('UPDATE ComparisonCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
    $command->execute(array($status, $groupid, $dontChangeOk));


    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE ownerGroup=? AND status!=?');
    $command->execute(array($status, $groupid, $dontChangeOk));

    $components = $dbh->query("SELECT * FROM ComparisonCheckComponents WHERE ownerGroup= $groupid;");
    if($components) 
    {            
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
            if($comp['status'] !== $dontChangeOk) {
                $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET severity=? WHERE ownerComponent=? AND severity!=?');
                $command->execute(array($status, $comp['id'], $dontChangeOk));
            }
        }
    }

    $dbh->commit();
    $dbh = null;
}

function updateComponentComplianceStatusInReview() {
    global $projectName;
    $componentid = $_POST['componentid']; 
    global $tabletoupdate;
 //global $SourceDataSheets;

    $dbh;
    try{
    
        // open database
        $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $status = 'ACCEPTED';
        $dontChangeOk = 'OK';
        $dbh->beginTransaction();

        if($tabletoupdate == "complianceSourceA") {
            $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET status=? WHERE id=? AND status!=?');
            $command->execute(array($status, $componentid, $dontChangeOk));
    
            $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET severity=? WHERE ownerComponent=? AND severity!=?');
            $command->execute(array($status, $componentid, $dontChangeOk));
        }
        else if($tabletoupdate == "complianceSourceB") {
            $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET status=? WHERE id=? AND status!=?');
            $command->execute(array($status, $componentid, $dontChangeOk));
    
            $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET severity=? WHERE ownerComponent=? AND severity!=?');
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

function updatePropertyComplianceStatusInReview() {
    global $projectName;
    global $tabletoupdate;
    $componentid = $_POST['componentid']; 

    if(isset($_POST['sourcePropertyName']))
        $sourcePropertyName = $_POST['sourcePropertyName'];
    else 
        return;

    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'ACCEPTED';
    $dbh->beginTransaction();

    if($tabletoupdate == "ComplianceADetailedReview") {
        $componentTableName = 'SourceAComplianceCheckComponents';
        $propertiesTableName = 'SourceAComplianceCheckProperties';  
    }
    else if($tabletoupdate == "ComplianceBDetailedReview") {
        $componentTableName = 'SourceBComplianceCheckComponents';
        $propertiesTableName = 'SourceBComplianceCheckProperties'; 
    }
    
    $sql = "UPDATE ". $propertiesTableName ." SET severity=? WHERE ownerComponent=? AND name=?";
    $sql1 = "UPDATE ". $componentTableName ." SET status=? WHERE id=?";
    $command = $dbh->prepare($sql);
    $command->execute(array($status, $componentid, $sourcePropertyName));
    $value = $dbh->query("SELECT status FROM $componentTableName WHERE id= $componentid;");
    $originalStatusOfComponent = $value->fetch();
    if(strpos($originalStatusOfComponent['status'], '*') == false) {
        $changedStatusOfComponents = $originalStatusOfComponent['status'] . "*";
        $command = $dbh->prepare($sql1);
        $command->execute(array($changedStatusOfComponents, $componentid));
    }

    $dbh->commit();
    $dbh = null; 
}

function updateCategoryComplianceStatusInReview() {
    if(!isset($_POST['groupid'])) {
        echo 'fail';
        return;
    }

    global $projectName;
    global $tabletoupdate;
    $groupid = $_POST['groupid'];

    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'ACCEPTED';
    $dontChangeOk = 'OK';
    $componentTableName;
    $propertiesTableName;
    $dbh->beginTransaction();

    if($tabletoupdate == "categoryComplianceA") {
        $componentTableName = 'SourceAComplianceCheckComponents';
        $propertiesTableName = 'SourceAComplianceCheckProperties'; 
        $command = $dbh->prepare('UPDATE SourceAComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
        $command->execute(array($status, $groupid, $dontChangeOk)); 
    }
    else if($tabletoupdate == "categoryComplianceB") {
        $componentTableName = 'SourceBComplianceCheckComponents';
        $propertiesTableName = 'SourceBComplianceCheckProperties';
        $command = $dbh->prepare('UPDATE SourceBComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
        $command->execute(array($status, $groupid, $dontChangeOk)); 
    }

        $sql = "UPDATE ".$componentTableName." SET status=? WHERE ownerGroup=? AND status!=?";
        $sql1 = "UPDATE ".$propertiesTableName." SET severity=? WHERE ownerComponent=? AND severity!=?";
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

function updateStatusOfAllComparisonCategories() {
    global $projectName;

    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'ACCEPTED';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();

    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE status!=?');
    $command->execute(array($status, $dontChangeOk));

    $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET severity=? WHERE severity!=?');
    $command->execute(array($status, $dontChangeOk));

    $dbh->commit();
    $dbh = null;
}

function updateStatusOfAllComplianceACategories() {
    global $projectName;

    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'ACCEPTED';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();

    $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET status=? WHERE status!=?');
    $command->execute(array($status, $dontChangeOk));

    $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET severity=? WHERE severity!=?');
    $command->execute(array($status, $dontChangeOk));

    $dbh->commit();
    $dbh = null;
}

function updateStatusOfAllComplianceBCategories() {
    global $projectName;

    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $status = 'ACCEPTED';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();

    $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET status=? WHERE status!=?');
    $command->execute(array($status, $dontChangeOk));

    $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET severity=? WHERE severity!=?');
    $command->execute(array($status, $dontChangeOk));

    $dbh->commit();
    $dbh = null;
}

function updateStatusOfAllComparisonCategoriesToOriginal() {
    global $projectName;

    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbPath1 = "../Projects/".$projectName."/".$projectName."_original.db";
    $dbh1 = new PDO("sqlite:$dbPath1") or die("cannot open the database"); 

    $status = 'ACCEPTED';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();
    $dbh1->beginTransaction();

    $components = $dbh->query("SELECT * FROM ComparisonCheckComponents");
    $originalComp = $dbh1->query("SELECT * FROM ComparisonCheckComponents");
    $allComp = $originalComp->fetchAll();
    $compCount = 0;
    if($components) 
    {            
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
                if($compCount < count($allComp)) {
                    $orgcomp = $allComp[$compCount]['status'];
                    if($allComp[$compCount]['id'] == $comp['id']) {
                        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
                        $command->execute(array($orgcomp, $comp['id']));
                    }
                }
                $compCount++;
        }
    }

    $componentsprops = $dbh->query("SELECT * FROM ComparisonCheckProperties");
    $originalCompprops = $dbh1->query("SELECT * FROM ComparisonCheckProperties");
    $allProps = $originalCompprops->fetchAll(PDO::FETCH_ASSOC);
    $propCount = 0;
    while ($comp1 = $componentsprops->fetch(\PDO::FETCH_ASSOC)) 
    { 
        if($propCount < count($allProps)) {
            $orgSeverity = $allProps[$propCount]['severity']; 
            if($allProps[$propCount]['id'] == $comp1['id']) {
                $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET severity=? WHERE id=?');
                $command->execute(array($orgSeverity, $comp1['id']));
            }
        }
        $propCount++;
    }

    $dbh->commit();
    $dbh1->commit();
    $dbh = null;
    $dbh1 = null;
}

function updateStatusOfAllComplianceACategoriesToOriginal() {
    global $projectName;

    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbPath1 = "../Projects/".$projectName."/".$projectName."_original.db";
    $dbh1 = new PDO("sqlite:$dbPath1") or die("cannot open the database"); 

    $status = 'ACCEPTED';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();
    $dbh1->beginTransaction();

    $components = $dbh->query("SELECT * FROM SourceAComplianceCheckComponents");
    $originalComp = $dbh1->query("SELECT * FROM SourceAComplianceCheckComponents");
    $allComp = $originalComp->fetchAll(PDO::FETCH_ASSOC);
    $compCount = 0;
    if($components) 
    {            
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
                if($compCount < count($allComp)) {
                    $orgcomp = $allComp[$compCount]['status'];
                    if($allComp[$compCount]['id'] == $comp['id']) {
                        $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET status=? WHERE id=?');
                        $command->execute(array($orgcomp, $comp['id']));
                    }
                }
                $compCount++;
        }
    }

    $componentsprops = $dbh->query("SELECT * FROM SourceAComplianceCheckProperties");
    $originalCompprops = $dbh1->query("SELECT * FROM SourceAComplianceCheckProperties");
    $allProps = $originalCompprops->fetchAll(PDO::FETCH_ASSOC);
    $propCount = 0;
    while ($comp1 = $componentsprops->fetch(\PDO::FETCH_ASSOC)) 
    { 
        if($propCount < count($allProps)) {
            $orgSeverity = $allProps[$propCount]['severity']; 
            if($allProps[$propCount]['id'] == $comp1['id']) {
                $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET severity=? WHERE id=?');
                $command->execute(array($orgSeverity, $comp1['id']));
            }
        }
        $propCount++;
    }

    $dbh->commit();
    $dbh1->commit();
    $dbh = null;
    $dbh1 = null;
}

function updateStatusOfAllComplianceBCategoriesToOriginal() {
    global $projectName;

    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbPath1 = "../Projects/".$projectName."/".$projectName."_original.db";
    $dbh1 = new PDO("sqlite:$dbPath1") or die("cannot open the database"); 

    $status = 'ACCEPTED';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();
    $dbh1->beginTransaction();

    $components = $dbh->query("SELECT * FROM SourceBComplianceCheckComponents");
    $originalComp = $dbh1->query("SELECT * FROM SourceBComplianceCheckComponents");
    $allComp = $originalComp->fetchAll(PDO::FETCH_ASSOC);
    $compCount = 0;
    if($components) 
    {            
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
                if($compCount < count($allComp)) {
                    $orgcomp = $allComp[$compCount]['status'];
                    if($allComp[$compCount]['id'] == $comp['id']) {
                        $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET status=? WHERE id=?');
                        $command->execute(array($orgcomp, $comp['id']));
                    }
                }
                $compCount++;
        }
    }

    $componentsprops = $dbh->query("SELECT * FROM SourceBComplianceCheckProperties");
    $originalCompprops = $dbh1->query("SELECT * FROM SourceBComplianceCheckProperties");
    $allProps = $originalCompprops->fetchAll(PDO::FETCH_ASSOC);
    $propCount = 0;
    while ($comp1 = $componentsprops->fetch(\PDO::FETCH_ASSOC)) 
    { 
        if($propCount < count($allProps)) {
            $orgSeverity = $allProps[$propCount]['severity']; 
            if($allProps[$propCount]['id'] == $comp1['id']) {
                $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET severity=? WHERE id=?');
                $command->execute(array($orgSeverity, $comp1['id']));
            }
        }
        $propCount++;
    }

    $dbh->commit();
    $dbh1->commit();
    $dbh = null;
    $dbh1 = null;
}

function rejectAcceptStatusComparisonComponent() {
    $statusArray = array();
    global $projectName;
    $componentid = $_POST['componentid']; 


    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbPath1 = "../Projects/".$projectName."/".$projectName."_original.db";
    $dbh1 = new PDO("sqlite:$dbPath1") or die("cannot open the database"); 

    $dbh->beginTransaction();
    $dbh1->beginTransaction();

    $components = $dbh->query("SELECT status FROM ComparisonCheckComponents WHERE id= $componentid;");
    $originalComp = $dbh1->query("SELECT status FROM ComparisonCheckComponents WHERE id= $componentid;");
    $originalstatus = $originalComp->fetch();
    $changedstatus = $components->fetch();

    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
    $command->execute(array($originalstatus['status'], $componentid));
    $statusArray[0] = $originalstatus['status'];

    // $componentsProps = $dbh->query("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent= $componentid;");
    $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $originalCompProps = $dbh1->query("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent= $componentid;");
    $allPropsOrg = $originalCompProps->fetchAll(PDO::FETCH_ASSOC);
    $allPropsChanged = $command->fetchAll(\PDO::FETCH_ASSOC);
    $propCount = 0;
    $changedPropCount = 0;
    while ($changedPropCount < count($allPropsChanged)) 
    { 
        if($propCount < count($allPropsOrg)) {
            $orgSeverity = $allPropsOrg[$propCount]['severity']; 
            if($allPropsOrg[$propCount]['id'] == $allPropsChanged[$changedPropCount]['id']) {
                $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET severity=? WHERE id=?');
                $command->execute(array($orgSeverity, $allPropsChanged[$changedPropCount]['id']));
            }
        }
        $propCount++;
        $changedPropCount++;
    }
    $statusArray[1] = $allPropsOrg;
    $dbh->commit();
    $dbh1->commit();
    $dbh = null;
    $dbh1 = null;

    echo json_encode($statusArray);
}

function rejectAcceptStatusComparisonProperty() {
    $statusArray = array();
    global $projectName;
    $componentid = $_POST['componentid']; 
    $sourceAPropertyName = $_POST['sourceAPropertyName'];
    $sourceBPropertyName = $_POST['sourceBPropertyName'];
    $toBecompstatus = " ";
    $originalstatus;


    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbPath1 = "../Projects/".$projectName."/".$projectName."_original.db";
    $dbh1 = new PDO("sqlite:$dbPath1") or die("cannot open the database"); 

    $dbh->beginTransaction();
    $dbh1->beginTransaction();

    if($sourceAPropertyName !== '') {    
        $command = $dbh1->prepare('SELECT severity FROM ComparisonCheckProperties WHERE ownerComponent=? AND sourceAName=?');
        $command->execute(array($componentid, $sourceAPropertyName));
        $originalstatus = $command->fetch();

        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET severity=? WHERE ownerComponent=? AND sourceAName=?');
        $command->execute(array($originalstatus['severity'], $componentid, $sourceAPropertyName));
    }
       
    else if($sourceBPropertyName !== '') {
        $command = $dbh1->prepare('SELECT severity FROM ComparisonCheckProperties WHERE ownerComponent=? AND sourceBName=?');
        $command->execute(array($componentid, $sourceBPropertyName));
        $originalstatus = $command->fetch();

        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET severity=? WHERE ownerComponent=? AND sourceBName=?');
        $command->execute(array($originalstatus['severity'], $componentid, $sourceBPropertyName));
    }

    $dbh->commit();
    $dbh1->commit();

    $dbh->beginTransaction();
    $dbh1->beginTransaction();

    $command = $dbh->prepare('SELECT severity FROM ComparisonCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $command = $dbh->prepare('SELECT status FROM ComparisonCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatus = $command->fetch();

    $command = $dbh1->prepare('SELECT status FROM ComparisonCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatusOrg = $command->fetch();

    $index = 0;
    while($index < count($statusChanged)) {
        if($statusChanged[$index]['severity'] == "ACCEPTED" && $componentstatus['status'] !== "ACCEPTED") {
            $toBecompstatus = $componentstatus['status'];
            break;
        } 
        else {
            if($componentstatus['status'] == "ACCEPTED") {
                $toBecompstatus = $componentstatusOrg['status'] . "*";
            }
            else 
            {
                $toBecompstatus = $componentstatusOrg['status'];
            }
        }
        $index++;
    }

    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
    $command->execute(array($toBecompstatus, $componentid));

    $dbh->commit();
    $dbh1->commit();

    $dbh = null;
    $dbh1 = null;

    $statusArray[0] = $toBecompstatus;
    $statusArray[1] = $originalstatus['severity'];
    echo json_encode($statusArray);
}

function rejectAcceptStatusComparisonCategory() {
    $statusArray = array();
    global $projectName;
    $groupid = $_POST['groupid'];

    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbPath1 = "../Projects/".$projectName."/".$projectName."_original.db";
    $dbh1 = new PDO("sqlite:$dbPath1") or die("cannot open the database"); 


    $status = 'UNACCEPTED';
    $dontChangeOk = 'OK';
    $compProps;

    $dbh->beginTransaction();
    $dbh1->beginTransaction();

    $command = $dbh->prepare('UPDATE ComparisonCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
    $command->execute(array($status, $groupid, $dontChangeOk));

    $command = $dbh1->prepare('SELECT * FROM ComparisonCheckComponents WHERE ownerGroup=?');
    $command->execute(array($groupid));
    $allCom = $command->fetchAll(PDO::FETCH_ASSOC);
    $index = 0;
    while ($index < count($allCom)) 
    {
        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
        $command->execute(array($allCom[$index]['status'], $allCom[$index]['id']));
        $index++;
    }

    $command = $dbh->prepare('SELECT * FROM ComparisonCheckComponents WHERE ownerGroup=?');
    $command->execute(array($groupid));
    $components = $command->fetchAll(PDO::FETCH_ASSOC);
    $indexcomp = 0;
    
    $statusArray[0] = $allCom;
    while ($indexcomp < count($components)) 
    {
        if($components[$indexcomp]['status'] !== $dontChangeOk) {
            $command = $dbh1->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
            $command->execute(array($components[$indexcomp]['id']));
            $compProps = $command->fetchAll(PDO::FETCH_ASSOC);
            $indexcompProp = 0;
            while ($indexcompProp < count($compProps)) 
            {
                $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET severity=? WHERE id=?');
                $command->execute(array($compProps[$indexcompProp]['severity'], $compProps[$indexcompProp]['id']));
                $indexcompProp++;
            }  
            $indexcomp++;      
        }
        
    }

    $command = $dbh->prepare('SELECT * FROM ComparisonCheckComponents WHERE ownerGroup=?');
    $command->execute(array($groupid));
    $components1 = $command->fetchAll(PDO::FETCH_ASSOC);
    $noOfComp = 0;
    $propertiesArray = array();
    while($noOfComp < count($components1)) {
        $command = $dbh1->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=?');
        $command->execute(array($components1[$noOfComp]['id']));
        $properties = $command->fetchAll(PDO::FETCH_ASSOC);
        $propertiesArray[$noOfComp] = $properties;
        $noOfComp++;
    }

    $statusArray[1] = $propertiesArray;

    $dbh->commit();
    $dbh1->commit();
    $dbh1 = null;
    $dbh = null;
    echo json_encode($statusArray);
}

function rejectAcceptStatusComplianceAComponent() {
    $statusArray = array();
    global $projectName;
    $componentid = $_POST['componentid']; 


    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbPath1 = "../Projects/".$projectName."/".$projectName."_original.db";
    $dbh1 = new PDO("sqlite:$dbPath1") or die("cannot open the database"); 

    $dbh->beginTransaction();
    $dbh1->beginTransaction();

    $components = $dbh->query("SELECT status FROM SourceAComplianceCheckComponents WHERE id= $componentid;");
    $originalComp = $dbh1->query("SELECT status FROM SourceAComplianceCheckComponents WHERE id= $componentid;");
    $originalstatus = $originalComp->fetch();
    $changedstatus = $components->fetch();

    $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET status=? WHERE id=?');
    $command->execute(array($originalstatus['status'], $componentid));
    $statusArray[0] = $originalstatus['status'];

    // $componentsProps = $dbh->query("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent= $componentid;");
    $command = $dbh->prepare('SELECT * FROM SourceAComplianceCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $originalCompProps = $dbh1->query("SELECT * FROM SourceAComplianceCheckProperties WHERE ownerComponent= $componentid;");
    $allPropsOrg = $originalCompProps->fetchAll(PDO::FETCH_ASSOC);
    $allPropsChanged = $command->fetchAll(\PDO::FETCH_ASSOC);
    $propCount = 0;
    $changedPropCount = 0;
    while ($changedPropCount < count($allPropsChanged)) 
    { 
        if($propCount < count($allPropsOrg)) {
            $orgSeverity = $allPropsOrg[$propCount]['severity']; 
            if($allPropsOrg[$propCount]['id'] == $allPropsChanged[$changedPropCount]['id']) {
                $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET severity=? WHERE id=?');
                $command->execute(array($orgSeverity, $allPropsChanged[$changedPropCount]['id']));
            }
        }
        $propCount++;
        $changedPropCount++;
    }
    $statusArray[1] = $allPropsOrg;
    $dbh->commit();
    $dbh1->commit();
    $dbh = null;
    $dbh1 = null;

    echo json_encode($statusArray);

}

function rejectAcceptStatusComplianceAProperty() {
    $statusArray = array();
    global $projectName;
    $componentid = $_POST['componentid']; 
    $sourcePropertyName = $_POST['sourcePropertyName'];
    $toBecompstatus = " ";
    $originalstatus;


    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbPath1 = "../Projects/".$projectName."/".$projectName."_original.db";
    $dbh1 = new PDO("sqlite:$dbPath1") or die("cannot open the database"); 

    $dbh->beginTransaction();
    $dbh1->beginTransaction();
 
        $command = $dbh1->prepare('SELECT severity FROM SourceAComplianceCheckProperties WHERE ownerComponent=? AND name=?');
        $command->execute(array($componentid, $sourcePropertyName));
        $originalstatus = $command->fetch();

        $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET severity=? WHERE ownerComponent=? AND name=?');
        $command->execute(array($originalstatus['severity'], $componentid, $sourcePropertyName));
    

    $dbh->commit();
    $dbh1->commit();

    $dbh->beginTransaction();
    $dbh1->beginTransaction();

    $command = $dbh->prepare('SELECT severity FROM SourceAComplianceCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $command = $dbh->prepare('SELECT status FROM SourceAComplianceCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatus = $command->fetch();

    $command = $dbh1->prepare('SELECT status FROM SourceAComplianceCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatusOrg = $command->fetch();

    $index = 0;
    while($index < count($statusChanged)) {
        if($statusChanged[$index]['severity'] == "ACCEPTED" && $componentstatus['status'] !== "ACCEPTED") {
            $toBecompstatus = $componentstatus['status'];
            break;
        } 
        else {
            if($componentstatus['status'] == "ACCEPTED") {
                $toBecompstatus = $componentstatusOrg['status'] . "*";
            }
            else 
            {
                $toBecompstatus = $componentstatusOrg['status'];
            }
        }
        $index++;
    }

    $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET status=? WHERE id=?');
    $command->execute(array($toBecompstatus, $componentid));

    $dbh->commit();
    $dbh1->commit();

    $dbh = null;
    $dbh1 = null;

    $statusArray[0] = $toBecompstatus;
    $statusArray[1] = $originalstatus['severity'];
    echo json_encode($statusArray);
}

function rejectAcceptStatusComplianceACategory() {
    $statusArray = array();
    global $projectName;
    $groupid = $_POST['groupid'];

    try{
        $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

        $dbPath1 = "../Projects/".$projectName."/".$projectName."_original.db";
        $dbh1 = new PDO("sqlite:$dbPath1") or die("cannot open the database"); 

        $status = 'UNACCEPTED';
        $dontChangeOk = 'OK';
        $compProps;

        $dbh->beginTransaction();
        $dbh1->beginTransaction();

        $command = $dbh->prepare('UPDATE SourceAComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
        $command->execute(array($status, $groupid, $dontChangeOk));

        $command = $dbh1->prepare('SELECT * FROM SourceAComplianceCheckComponents WHERE ownerGroup=?');
        $command->execute(array($groupid));
        $allCom = $command->fetchAll(PDO::FETCH_ASSOC);
        $index = 0;
        while ($index < count($allCom)) 
        {
            $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET status=? WHERE id=?');
            $command->execute(array($allCom[$index]['status'], $allCom[$index]['id']));
            $index++;
        }

        $command = $dbh->prepare('SELECT * FROM SourceAComplianceCheckComponents WHERE ownerGroup=?');
        $command->execute(array($groupid));
        $components = $command->fetchAll(PDO::FETCH_ASSOC);
        $indexcomp = 0;
        
        $statusArray[0] = $allCom;
        while ($indexcomp < count($components)) 
        {
            if($components[$indexcomp]['status'] !== $dontChangeOk) {
                $command = $dbh1->prepare('SELECT * FROM SourceAComplianceCheckProperties WHERE ownerComponent=?');
                $command->execute(array($components[$indexcomp]['id']));
                $compProps = $command->fetchAll(PDO::FETCH_ASSOC);
                $indexcompProp = 0;
                while ($indexcompProp < count($compProps)) 
                {
                    $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET severity=? WHERE id=?');
                    $command->execute(array($compProps[$indexcompProp]['severity'], $compProps[$indexcompProp]['id']));
                    $indexcompProp++;
                }  
                $indexcomp++;      
            }
            
        }

        $command = $dbh->prepare('SELECT * FROM SourceAComplianceCheckComponents WHERE ownerGroup=?');
        $command->execute(array($groupid));
        $components1 = $command->fetchAll(PDO::FETCH_ASSOC);
        $noOfComp = 0;
        $propertiesArray = array();
        while($noOfComp < count($components1)) {
            $command = $dbh1->prepare('SELECT * FROM SourceAComplianceCheckProperties WHERE ownerComponent=?');
            $command->execute(array($components1[$noOfComp]['id']));
            $properties = $command->fetchAll(PDO::FETCH_ASSOC);
            $propertiesArray[$noOfComp] = $properties;
            $noOfComp++;
        }

        $statusArray[1] = $propertiesArray;

        $dbh->commit();
        $dbh1->commit();
        $dbh = null;
        $dbh1 = null;
        echo json_encode($statusArray);
    }
    catch(Exception $e) {
        var_dump($e); 
        return;
    }
}


function rejectAcceptStatusComplianceBComponent() {
    $statusArray = array();
    global $projectName;
    $componentid = $_POST['componentid']; 


    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbPath1 = "../Projects/".$projectName."/".$projectName."_original.db";
    $dbh1 = new PDO("sqlite:$dbPath1") or die("cannot open the database"); 

    $dbh->beginTransaction();
    $dbh1->beginTransaction();

    $components = $dbh->query("SELECT status FROM SourceBComplianceCheckComponents WHERE id= $componentid;");
    $originalComp = $dbh1->query("SELECT status FROM SourceBComplianceCheckComponents WHERE id= $componentid;");
    $originalstatus = $originalComp->fetch();
    $changedstatus = $components->fetch();

    $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET status=? WHERE id=?');
    $command->execute(array($originalstatus['status'], $componentid));
    $statusArray[0] = $originalstatus['status'];

    // $componentsProps = $dbh->query("SELECT * FROM ComparisonCheckProperties WHERE ownerComponent= $componentid;");
    $command = $dbh->prepare('SELECT * FROM SourceBComplianceCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $originalCompProps = $dbh1->query("SELECT * FROM SourceBComplianceCheckProperties WHERE ownerComponent= $componentid;");
    $allPropsOrg = $originalCompProps->fetchAll(PDO::FETCH_ASSOC);
    $allPropsChanged = $command->fetchAll(\PDO::FETCH_ASSOC);
    $propCount = 0;
    $changedPropCount = 0;
    while ($changedPropCount < count($allPropsChanged)) 
    { 
        if($propCount < count($allPropsOrg)) {
            $orgSeverity = $allPropsOrg[$propCount]['severity']; 
            if($allPropsOrg[$propCount]['id'] == $allPropsChanged[$changedPropCount]['id']) {
                $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET severity=? WHERE id=?');
                $command->execute(array($orgSeverity, $allPropsChanged[$changedPropCount]['id']));
            }
        }
        $propCount++;
        $changedPropCount++;
    }
    $statusArray[1] = $allPropsOrg;
    $dbh->commit();
    $dbh1->commit();
    $dbh = null;
    $dbh1 = null;

    echo json_encode($statusArray);

}

function rejectAcceptStatusComplianceBProperty() {
    $statusArray = array();
    global $projectName;
    $componentid = $_POST['componentid']; 
    $sourcePropertyName = $_POST['sourcePropertyName'];
    $toBecompstatus = " ";
    $originalstatus;


    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $dbPath1 = "../Projects/".$projectName."/".$projectName."_original.db";
    $dbh1 = new PDO("sqlite:$dbPath1") or die("cannot open the database"); 

    $dbh->beginTransaction();
    $dbh1->beginTransaction();
 
        $command = $dbh1->prepare('SELECT severity FROM SourceBComplianceCheckProperties WHERE ownerComponent=? AND name=?');
        $command->execute(array($componentid, $sourcePropertyName));
        $originalstatus = $command->fetch();

        $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET severity=? WHERE ownerComponent=? AND name=?');
        $command->execute(array($originalstatus['severity'], $componentid, $sourcePropertyName));
    

    $dbh->commit();
    $dbh1->commit();

    $dbh->beginTransaction();
    $dbh1->beginTransaction();

    $command = $dbh->prepare('SELECT severity FROM SourceBComplianceCheckProperties WHERE ownerComponent=?');
    $command->execute(array($componentid));
    $statusChanged = $command->fetchAll(PDO::FETCH_ASSOC);

    $command = $dbh->prepare('SELECT status FROM SourceBComplianceCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatus = $command->fetch();

    $command = $dbh1->prepare('SELECT status FROM SourceBComplianceCheckComponents WHERE id=?');
    $command->execute(array($componentid));
    $componentstatusOrg = $command->fetch();

    $index = 0;
    while($index < count($statusChanged)) {
        if($statusChanged[$index]['severity'] == "ACCEPTED" && $componentstatus['status'] !== "ACCEPTED") {
            $toBecompstatus = $componentstatus['status'];
            break;
        } 
        else {
            if($componentstatus['status'] == "ACCEPTED") {
                $toBecompstatus = $componentstatusOrg['status'] . "*";
            }
            else 
            {
                $toBecompstatus = $componentstatusOrg['status'];
            }
        }
        $index++;
    }

    $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET status=? WHERE id=?');
    $command->execute(array($toBecompstatus, $componentid));

    $dbh->commit();
    $dbh1->commit();

    $dbh = null;
    $dbh1 = null;

    $statusArray[0] = $toBecompstatus;
    $statusArray[1] = $originalstatus['severity'];
    echo json_encode($statusArray);
}

function rejectAcceptStatusComplianceBCategory() {
    $statusArray = array();
    global $projectName;
    $groupid = $_POST['groupid'];

    try{
        $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

        $dbPath1 = "../Projects/".$projectName."/".$projectName."_original.db";
        $dbh1 = new PDO("sqlite:$dbPath1") or die("cannot open the database"); 

        $status = 'UNACCEPTED';
        $dontChangeOk = 'OK';
        $compProps;

        $dbh->beginTransaction();
        $dbh1->beginTransaction();

        $command = $dbh->prepare('UPDATE SourceBComplianceCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
        $command->execute(array($status, $groupid, $dontChangeOk));

        $command = $dbh1->prepare('SELECT * FROM SourceBComplianceCheckComponents WHERE ownerGroup=?');
        $command->execute(array($groupid));
        $allCom = $command->fetchAll(PDO::FETCH_ASSOC);
        $index = 0;
        while ($index < count($allCom)) 
        {
            $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET status=? WHERE id=?');
            $command->execute(array($allCom[$index]['status'], $allCom[$index]['id']));
            $index++;
        }

        $command = $dbh->prepare('SELECT * FROM SourceBComplianceCheckComponents WHERE ownerGroup=?');
        $command->execute(array($groupid));
        $components = $command->fetchAll(PDO::FETCH_ASSOC);
        $indexcomp = 0;
        
        $statusArray[0] = $allCom;
        while ($indexcomp < count($components)) 
        {
            if($components[$indexcomp]['status'] !== $dontChangeOk) {
                $command = $dbh1->prepare('SELECT * FROM SourceBComplianceCheckProperties WHERE ownerComponent=?');
                $command->execute(array($components[$indexcomp]['id']));
                $compProps = $command->fetchAll(PDO::FETCH_ASSOC);
                $indexcompProp = 0;
                while ($indexcompProp < count($compProps)) 
                {
                    $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET severity=? WHERE id=?');
                    $command->execute(array($compProps[$indexcompProp]['severity'], $compProps[$indexcompProp]['id']));
                    $indexcompProp++;
                }  
                $indexcomp++;      
            }
            
        }

        $command = $dbh->prepare('SELECT * FROM SourceBComplianceCheckComponents WHERE ownerGroup=?');
        $command->execute(array($groupid));
        $components1 = $command->fetchAll(PDO::FETCH_ASSOC);
        $noOfComp = 0;
        $propertiesArray = array();
        while($noOfComp < count($components1)) {
            $command = $dbh1->prepare('SELECT * FROM SourceBComplianceCheckProperties WHERE ownerComponent=?');
            $command->execute(array($components1[$noOfComp]['id']));
            $properties = $command->fetchAll(PDO::FETCH_ASSOC);
            $propertiesArray[$noOfComp] = $properties;
            $noOfComp++;
        }

        $statusArray[1] = $propertiesArray;

        $dbh->commit();
        $dbh1->commit();
        $dbh = null;
        $dbh1 = null;
        echo json_encode($statusArray);
    }
    catch(Exception $e) {
        var_dump($e); 
        return;
    }
}
?>

   