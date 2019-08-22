<?php
require_once 'Utility.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $InvokeFunction = trim($_POST["InvokeFunction"], " ");
    switch ($InvokeFunction) {
        case "CreateCheckSpace":
            CreateCheckSpace();
            break;
        case "GetCheckSpaces":
            GetCheckSpaces();
            break;
        case "DeleteCheckSpace":
        DeleteCheckSpace();
            break;
        default:
            echo "No Function Found!";
    }
}

function CreateCheckSpace(){
    // get project name
    $UserId = trim($_POST["userid"], " ");      
    $projectName = $_POST['ProjectName'];
    $ProjectId = $_POST['ProjectId'];
    $CheckSpaceInfo = $_POST['CheckSpaceInfo'];
    $obj = json_decode($CheckSpaceInfo, true);
   
    $CheckName = $obj['checkName'];
    $CheckStatus = $obj['status'];
    $CheckConfiguration = $obj['config'];
    $CheckDescription = $obj['checkDescription'];
    $CheckComments = $obj['checkComments'];
    $CheckIsFavourite = $obj['checkisfavourite'];
    $CheckCreateDate = $obj['checkdate'];
    if (CheckIfCheckSpaceExists($projectName , $CheckName) == false)
    {
        try
        {
            $dbPath = getProjectDatabasePath($projectName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
            if( CreateCheckSpaceSchemaIfNot($dbh) == true)
            {
                $query = 'INSERT INTO CheckSpace (checkname,checkstatus,checkconfiguration,checkdescription,checkcomments,checkisfavourite,checkdate,projectid, userid) VALUES (?,?,?,?,?,?,?,?,?)';
                $stmt = $dbh->prepare($query);
                $stmt->execute(array( $CheckName, $CheckStatus, $CheckConfiguration, $CheckDescription, $CheckComments, $CheckIsFavourite, $CheckCreateDate, $ProjectId, $UserId));     
                $array = array(
                "checkid" => $dbh->lastInsertId(),
                "checkname" => $CheckName,
                "checkstatus" => $CheckStatus,
                "checkconfiguration" => $CheckConfiguration,
                "checkdescription" => $CheckDescription,
                "checkcomments" => $CheckComments,
                "checkisfavourite" => $CheckIsFavourite,
                "checkdate" => $CheckCreateDate,
                "projectid" => $ProjectId,
                "userid" => $UserId
                );
                echo json_encode($array);
                $dbh = null; //This is how you close a PDO connection
                mkdir(getCheckDirectoryPath($projectName, $CheckName), 0777, true);
                mkdir(getCheckSourceAPath($projectName, $CheckName), 0777, true);
                mkdir(getCheckSourceBPath($projectName, $CheckName), 0777, true);
                mkdir(getCheckSourceCPath($projectName, $CheckName), 0777, true);
                mkdir(getCheckSourceDPath($projectName, $CheckName), 0777, true);
                $database = new SQLite3(getCheckDatabasePath($projectName, $CheckName));	     
            }
        }
        catch(Exception $e) 
        {    
            $array = array(
                "checkid" => -1,
                );    
            echo json_encode($array);
            return;
        }
    }
    else{
        $array = array(
            "checkid" => 0,
            );    
        echo json_encode($array);
        return;
    }
}

function CheckIfCheckSpaceExists($projectName, $checkName){
    $dbh = new PDO("sqlite:".getProjectDatabasePath($projectName)) or die("cannot open the database");
    $query =  "select checkname from CheckSpace where checkname='". $checkName."' COLLATE NOCASE;";      
    $count=0;
    foreach ($dbh->query($query) as $row)
    {
        $count = $count+1;
        break;
    }
    $dbh = null;
    if ($count != 0){
        return true;
    }
    else{
        return false;
    }
}

function GetCheckSpaces(){
    // get project name
    $userid = trim($_POST["userid"], " ");
    $projectName = $_POST['ProjectName'];   
    $ProjectId = trim($_POST["ProjectId"], " ");   
    
    try
    {
        $dbPath = getProjectDatabasePath($projectName);;
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        CreateCheckSpaceSchemaIfNot($dbh);
        $query =  "select * from CheckSpace where userid=".$userid." and ProjectId=".$ProjectId;     
        $stmt = $dbh->query($query);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
        $dbh = null;
        return;
    }
    catch(Exception $e) 
    {        
        echo "Fail "; 
        return;
    }
}

function GetPublicCheckSpaces(){
    // get project name
    $userid = trim($_POST["userid"], " ");
    $projectName = $_POST['ProjectName'];   
    $ProjectId = trim($_POST["ProjectId"], " ");   
    
    try
    {
        $dbPath = getProjectDatabasePath($projectName);;
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
        CreateCheckSpaceSchemaIfNot($dbh);
        $query =  "select * from CheckSpace where userid=".$userid;
        $stmt = $dbh->query($query);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
        $dbh = null;
        return;
    }
    catch(Exception $e) 
    {        
        echo "Fail "; 
        return;
    }
}

function CreateCheckSpaceSchemaIfNot($dbh){
    try
    {
        $table_name = 'CheckSpace'; 
        $test = "SELECT 1 FROM " . $table_name . " LIMIT 1";
        $test = $dbh->query($test); //$db needs to be PDO instance

        if($test)
        {
            return true;
        }
        else
        {
            $dbh->beginTransaction();

            $command = "CREATE TABLE 'CheckSpace' (
                checkid	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                checkname	TEXT NOT NULL,
                checkstatus	TEXT NOT NULL,
                checkconfiguration	TEXT,
                checkdescription	TEXT,
                checkcomments	TEXT,
                checkisfavourite	TEXT,
                checkdate	TEXT NOT NULL,
                projectid	INTEGER NOT NULL,
                userid	INTEGER NOT NULL)";       
            $dbh->exec($command);    
            $dbh->commit();
        }
    }
    catch(Exception $e) 
    {        
        return false;
    }
    return true;   
}

function DeleteCheckSpace(){
    $CheckId = $_POST['CheckId'];
    $ProjectName = trim($_POST["ProjectName"], " ");
    $CheckName = trim($_POST["CheckName"], " ");
    if($CheckId == "")
    {
        echo "CheckId Id cannot be empty";
        return;
    }
    try{
        $dbh = new PDO("sqlite:".getProjectDatabasePath($ProjectName)) or die("cannot open the database");
        $query =  "Delete from CheckSpace where checkid='". $CheckId."';";      ;
        $stmt = $dbh->prepare($query);      
        $stmt->execute();
        echo $stmt->rowCount();
        $dbh = null;
        deleteFolder(getCheckDirectoryPath($ProjectName, $CheckName));
        return;
    }
    catch(Exception $e) {
        echo 'Message: ' .$e->getMessage();
        return;
    } 
}
?>