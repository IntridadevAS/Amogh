<?php
require_once '../PHP/Utility.php';
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $InvokeFunction = trim($_POST["InvokeFunction"], " ");
    switch ($InvokeFunction) {
        case "SaveData":
            SaveData();
            break;
        case "CheckIfDataSetAlreadyExists":
                CheckIfDataSetAlreadyExists();
                break;  
        case "ClearTempVaultData":
            ClearTempVaultData();
            break;  
                          
        default:
            echo "No Function Found!";
    }
}


function SaveData()
{
    if (
        !isset($_POST['ProjectName']) ||
        !isset($_POST['srcId']) ||
        !isset($_POST['fileName']) ||
        !isset($_POST['fileType']) ||
        !isset($_POST['userName']) ||
        !isset($_POST['version']) ||
        !isset($_POST['description']) ||
        !isset($_POST['sourceComponents']) ||
        !isset($_POST['allComponents']) ||
        !isset($_POST['replace'])
    ) {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));
        return;
    }

    $projectName = $_POST['ProjectName'];
    $srcId = $_POST['srcId'];
    $fileName = $_POST['fileName'];
    $fileType = $_POST['fileType'];
    $userName = $_POST['userName'];
    $version = $_POST['version'];
    $description = $_POST['description'];
    $replace = $_POST['replace'];
   
    $fromDirectory = null;
    switch ($srcId) {
        case "a":
            $fromDirectory =  getVaultSourceAPath($projectName);
            break;
        case "b":
            $fromDirectory =  getVaultSourceBPath($projectName);
            break;
        case "c":
            $fromDirectory =  getVaultSourceCPath($projectName);
            break;
        case "d":
            $fromDirectory =  getVaultSourceDPath($projectName);
            break;
    }
    if ($fromDirectory === null) {
        echo json_encode(array(
            "Msg" =>  "Temp source directory not found.",
            "MsgCode" => -2
        ));
        return;
    }

    $targetDir = getDataVaultDirectoryPath($projectName) . "/" . $fileName . "_" . $version;  
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    // copy .scs file from from directory to target dir
    $targetFile = null;
    foreach (glob($fromDirectory . '/*.scs') as $scsFile) {       
        $p = pathinfo($scsFile);
        $targetFile = $p['filename'] . "." . $p['extension'];
    }
    if ($targetFile === null) {
        echo $targetFile;
        echo json_encode(array(
            "Msg" =>  "Target file not found.",
            "MsgCode" => -2
        ));
        return;
    }

    // move file from from dir to target dir
    copy(
        $fromDirectory . "/" . $targetFile,
        $targetDir . "/" . $targetFile
    );

    // add dataset entry to db
    addDatasetToDB(
        $projectName,
        $fileName,
        $fileType,
        $description,
        $version,
        $userName,
        $replace
    );

    // add components from dataset to db
    addComponentsToVaultDB(
        $projectName,
        $fileName,
        $version
    );

    echo json_encode(array(
        "Msg" =>  "success",
        "MsgCode" => 1
    ));
    return;
}

function addComponentsToVaultDB(
    $projectName,
    $fileName,
    $version
) {
    $sourceComponents = $_POST['sourceComponents'];
    $allComponents = $_POST['allComponents'];

    $datasetDir = getDataVaultDirectoryPath($projectName) . "/" . $fileName . "_" . $version;

    $dbFile = $datasetDir . "/Data.db";
    if (file_exists($dbFile)) {
        unlink($dbFile);
    }

    // create data database           
    $database = new SQLite3($dbFile);

    // write source components to DB
    $dbh = new PDO("sqlite:$dbFile") or die("cannot open the database");

    $command = 'CREATE TABLE sourceComponents(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    value TEXT NOT NULL)';
    $dbh->exec($command);

    $insertQuery = 'INSERT INTO sourceComponents(value) VALUES(?) ';
    $values = array(json_encode($sourceComponents));

    $stmt = $dbh->prepare($insertQuery);
    $stmt->execute($values);

    // write all components to DB                
    $command = 'CREATE TABLE allComponents(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    value TEXT NOT NULL)';
    $dbh->exec($command);

    $insertQuery = 'INSERT INTO allComponents(value) VALUES(?) ';
    $values = array(json_encode($allComponents));

    $stmt = $dbh->prepare($insertQuery);
    $stmt->execute($values);

    $dbh = null;
}

function addDatasetToDB(
    $projectName,
    $fileName,
    $fileType,
    $description,
    $version,
    $userName,
    $replace
) {
    $projectDBPath = getProjectDatabasePath($projectName);
    $projectDbh = new PDO("sqlite:$projectDBPath") or die("cannot open the database");

    // begin the transaction
    $projectDbh->beginTransaction();

    $command = 'CREATE TABLE IF NOT EXISTS DataVault(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                description Text,
                version Text,
                addedBy Text,
                dateAdded Text,
                modifiedBy Text,
                dateModified Text
            )';
    $projectDbh->exec($command);

    if (strtolower($replace) === "true") {
        $query = "Delete from DataVault where name='" . $fileName . "' and version='" . $version . "';";
        $stmt = $projectDbh->prepare($query);
        $stmt->execute();
    }
    
    $qry = 'INSERT INTO DataVault(name, type, description, version, addedBy, dateAdded) VALUES(?,?,?,?,?,?) ';
    $stmt = $projectDbh->prepare($qry);
    $stmt->execute(
        array(
            $fileName,
            $fileType,
            $description,
            $version,
            $userName,
            date("Y-m-d h:i:sa")
        )
    );

    $projectDbh->commit();
    $projectDbh = null; //This is how you close a PDO connection        
}

function CheckIfDataSetAlreadyExists()
{
    if (
        !isset($_POST['ProjectName']) ||      
        !isset($_POST['fileName']) ||      
        !isset($_POST['version'])
    ) {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));
        return;
    }

    $projectName = $_POST['ProjectName'];  
    $fileName = $_POST['fileName'];  
    $version = $_POST['version'];

    $projectDBPath = getProjectDatabasePath($projectName);
    $projectDbh = new PDO("sqlite:$projectDBPath") or die("cannot open the database");

    // begin the transaction
    $projectDbh->beginTransaction();

    $query = "select name from DataVault where name=\"" . $fileName . "\" and version=\"" . $version . "\";";
    $count = 0;
    $stmt = $projectDbh->query($query);

    if ($stmt) {
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $count = $count + 1;
            break;
        }
    }

    // commit update
    $projectDbh->commit();
    $projectDbh = null; //This is how you close a PDO connection        

    if ($count != 0) {
        echo json_encode(array(
            "Msg" =>  "Dataset '" . $fileName . "' version: " . $version . " already exists.",
            "MsgCode" => -1
        ));

        return;
    }


    echo json_encode(array(
        "Msg" =>  "success",
        "MsgCode" => 1
    ));

    return;
}

function ClearTempVaultData()
{
    if (
        !isset($_POST['ProjectName'])
    ) {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));
        return;
    }
    $projectName = $_POST['ProjectName'];
    $tempVaultPath = getDataVaultDirectoryPath($projectName) . "/temp";
    
    deleteDirectory($tempVaultPath);
}
