<?php

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
$transposeType = $_POST['transposeType'];
$sourceAPropertyName = $_POST['sourceAPropertyName'];
$sourceBPropertyName = $_POST['sourceBPropertyName'];
Transpose();

function Transpose() {
    global $componentid;
    global $projectName;
    global $transposeType;
    global $sourceAPropertyName;
    global $sourceBPropertyName;

    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
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

    $dbh->commit();
}


?>