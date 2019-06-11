<?php
if(!isset($_POST['componentid']) ||
!isset($_POST['tabletoupdate']))
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

$componentid = $_POST['componentid']; 
$tabletoupdate = $_POST['tabletoupdate'];
$sourceAPropertyName = $_POST['sourceAPropertyName'];
$sourceBPropertyName = $_POST['sourceBPropertyName'];

if($tabletoupdate == "comparison") {
    updateComponentComparisonStatusInReview();
}
else if($tabletoupdate == "comparisonDetailed") {
    updatePropertyComparisonStatusInReview();
}


function updateComponentComparisonStatusInReview() {
    global $projectName;
    global $componentid;
    //global $SourceDataSheets;

    $dbh;
    try{
    
        // open database
        $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $status = 'ACCEPTED';
        $dbh->beginTransaction();

        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
        $command->execute(array($status, $componentid));

        $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET severity=? WHERE ownerComponent=?');
        $command->execute(array($status, $componentid));

        var_dump($componentid);
        var_dump($status);

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
    global $componentid;
    global $sourceAPropertyName;
    global $sourceBPropertyName;
    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    var_dump($sourceAPropertyName);
    var_dump($sourceBPropertyName);
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
        

    

    $dbh->commit();
    $dbh = null; 
}


?>

   