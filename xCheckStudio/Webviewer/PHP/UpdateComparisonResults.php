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
    $changedStatusOfComponents = $originalStatusOfComponent['status'] . "*";
    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
    $command->execute(array($changedStatusOfComponents, $componentid));
    

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


?>

   