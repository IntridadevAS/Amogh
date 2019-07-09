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

$transposeType = $_POST['transposeType'];
$transposeLevel = $_POST['transposeLevel'];

if($transposeLevel == 'propertyLevel') {
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
    global $transposeType;

    $sourceAPropertyName = $_POST['sourceAPropertyName'];
    $sourceBPropertyName = $_POST['sourceBPropertyName'];

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

    $value = $dbh->query("SELECT status FROM ComparisonCheckComponents WHERE id= $componentid;");
    $originalStatusOfComponent = $value->fetch();
    if(strpos($originalStatusOfComponent['status'], '(T)') == false) {
        $changedStatusOfComponents = $originalStatusOfComponent['status'] . "(T)";
        $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET status=? WHERE id=?');
        $command->execute(array($changedStatusOfComponents, $componentid));
    }

    $dbh->commit();
}


function TransposeComponentProperties() {
    global $projectName;
    $componentid = $_POST['componentid']; 
    global $transposeType;

    $dbh;
    try{
    
        // open database
        $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        $dontChangeOk = 'OK';
        $dbh->beginTransaction();

        $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=? AND severity!=?');
        $command->execute(array($componentid, $dontChangeOk));
        $properties = $command->fetchAll(PDO::FETCH_ASSOC);
        $index = 0;
        while($index < count($properties)) {
            if($properties[$index]['severity'] !== "No Value") {
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

function transposePropertiesCategoryLevel() {
    if(!isset($_POST['groupid'])) {
        echo 'fail';
        return;
    }

    global $projectName;
    $groupid = $_POST['groupid'];
    global $transposeType;

    $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
    $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

    $categoryStatus = 'OK(T)';
    $status = 'true';
    $dontChangeOk = 'OK';

    $dbh->beginTransaction();

    $command = $dbh->prepare('UPDATE ComparisonCheckGroups SET categoryStatus=? WHERE id=? AND categoryStatus!=?');
    $command->execute(array($categoryStatus, $groupid, $dontChangeOk));


    $command = $dbh->prepare('UPDATE ComparisonCheckComponents SET transpose=? WHERE ownerGroup=? AND status!=?');
    $command->execute(array($transposeType, $groupid, $dontChangeOk));

    $components = $dbh->query("SELECT * FROM ComparisonCheckComponents WHERE ownerGroup= $groupid;");
    if($components) 
    {            
        while ($comp = $components->fetch(\PDO::FETCH_ASSOC)) 
        {
            $command = $dbh->prepare('SELECT * FROM ComparisonCheckProperties WHERE ownerComponent=? AND severity!=?');
            $command->execute(array($comp['id'], $dontChangeOk));
            $properties = $command->fetchAll(PDO::FETCH_ASSOC);
            $index = 0;
            while($index < count($properties)) {
                if($properties[$index]['severity'] !== "No Value") {
                    $command = $dbh->prepare('UPDATE ComparisonCheckProperties SET transpose=? WHERE id=? AND severity!=?');
                    $command->execute(array($transposeType, $properties[$index]['id'], $dontChangeOk));
                }
                $index++;
            }
        }
    }

    $dbh->commit();
    $dbh = null;
}

?>