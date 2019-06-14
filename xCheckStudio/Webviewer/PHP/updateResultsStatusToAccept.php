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


if($tabletoupdate == "comparison") {
    updateComponentComparisonStatusInReview();
}
else if($tabletoupdate == "comparisonDetailed") {
    updatePropertyComparisonStatusInReview();
}
else if($tabletoupdate == "category") {
    updateCategoryComparisonStatusInReview();
}
else if($tabletoupdate == "complianceSourceA" || $tabletoupdate == "complianceSourceB") {
    updateComponentComplianceStatusInReview();
}
else if($tabletoupdate == "ComplianceADetailedReview" || $tabletoupdate == "ComplianceBDetailedReview") {
    updatePropertyComplianceStatusInReview();
}
else if($tabletoupdate == "categoryComplianceA" || $tabletoupdate == "categoryComplianceB") {
    updateCategoryComplianceStatusInReview();
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

    if($tabletoupdate == "ComplianceADetailedReview" && $sourcePropertyName !== '') {
        $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET severity=? WHERE ownerComponent=? AND name=?');
        $command->execute(array($status, $componentid, $sourcePropertyName));
        $value = $dbh->query("SELECT status FROM SourceAComplianceCheckComponents WHERE id= $componentid;");
        $originalStatusOfComponent = $value->fetch();
        if(strpos($originalStatusOfComponent['status'], '*') == false) {
            $changedStatusOfComponents = $originalStatusOfComponent['status'] . "*";
            $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents SET status=? WHERE id=?');
            $command->execute(array($changedStatusOfComponents, $componentid));
        }
    }
       
    else if($tabletoupdate == "ComplianceBDetailedReview" && $sourcePropertyName !== '') {
        $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET severity=? WHERE ownerComponent=? AND name=?');
        $command->execute(array($status, $componentid, $sourcePropertyName));
        $value = $dbh->query("SELECT status FROM SourceBComplianceCheckComponents WHERE id= $componentid;");
        $originalStatusOfComponent = $value->fetch();
        if(strpos($originalStatusOfComponent['status'], '*') == false) {
            $changedStatusOfComponents = $originalStatusOfComponent['status'] . "*";
            $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents SET status=? WHERE id=?');
            $command->execute(array($changedStatusOfComponents, $componentid));
        }
    }
      
    // $sth = $dbh->prepare('SELECT status from ComparisonCheckComponents WHERE ownerComponent= :componentid');
    // $sth->bindValue(':componentid', $componentid, PDO::PARAM_STR);
    // $sth->execute();
    
    

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
        $command = $dbh->prepare('UPDATE SourceAComplianceCheckComponents  SET status=? WHERE ownerGroup=? AND status!=?');
        $command->execute(array($status, $groupid, $dontChangeOk));

        $components = $dbh->query("SELECT * FROM SourceAComplianceCheckComponents  WHERE ownerGroup= $groupid;");
        if($components) 
        {            
            while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
            {
                if($comp['status'] !== $dontChangeOk) {
                    $command = $dbh->prepare('UPDATE SourceAComplianceCheckProperties SET severity=? WHERE ownerComponent=? AND severity!=?');
                    $command->execute(array($status, $comp['id'], $dontChangeOk));
                }
            }
        }
    }
    else if($tabletoupdate == "categoryComplianceB") {
        $command = $dbh->prepare('UPDATE SourceBComplianceCheckComponents  SET status=? WHERE ownerGroup=? AND status!=?');
        $command->execute(array($status, $groupid, $dontChangeOk));

        $components = $dbh->query("SELECT * FROM SourceBComplianceCheckComponents  WHERE ownerGroup= $groupid;");
        if($components) 
        {            
            while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
            {
                if($comp['status'] !== $dontChangeOk) {
                    $command = $dbh->prepare('UPDATE SourceBComplianceCheckProperties SET severity=? WHERE ownerComponent=? AND severity!=?');
                    $command->execute(array($status, $comp['id'], $dontChangeOk));
                }
            }
        }
    }

    

    $dbh->commit();
    $dbh = null;
}

?>

   