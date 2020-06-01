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
        case "ReadVaultData":
            ReadVaultData();
            break;
        case "DeleteVaultData":
            DeleteVaultData();
            break;
        case "GetDataFromVault":
            GetDataFromVault();
            break;
        case "CopyDataToCheckSpace":
            CopyDataToCheckSpace();
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
        !isset($_POST['replace']) ||
        !isset($_POST['checkName']) ||
        !isset($_POST['fromVault']) ||
        !isset($_POST['scsPath'])
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
    $checkName = $_POST['checkName'];
    $fromVault = $_POST['fromVault'];
    
    // version 2
    $scsPath = $_POST['scsPath'];
    if ($scsPath === null) {       
        echo json_encode(array(
            "Msg" =>  "Target file not found.",
            "MsgCode" => -2
        ));
        return;
    }

    
    $targetDir = getDataVaultDirectoryPath($projectName) . "/" . $fileName . "_" . $version;  
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
    
    $scsFileName = basename($scsPath);

     // copy file from from dir to target dir
     copy(
        $scsPath,
        $targetDir . "/" . $scsFileName
    );

    // add dataset entry to db
    addDatasetToDB(
        $projectName,
        $fileName,
        $fileType,
        $description,
        $version,
        $userName,
        $replace,
        $scsFileName
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
    // // version 1;
    // $fromDirectory = null;
    // if ($fromVault === "true") {
    //     switch ($srcId) {
    //         case "a":
    //             $fromDirectory =  getVaultSourceAPath($projectName);
    //             break;
    //         case "b":
    //             $fromDirectory =  getVaultSourceBPath($projectName);
    //             break;
    //         case "c":
    //             $fromDirectory =  getVaultSourceCPath($projectName);
    //             break;
    //         case "d":
    //             $fromDirectory =  getVaultSourceDPath($projectName);
    //             break;
    //     }
    // } else if ($checkName !== null) {
    //     switch ($srcId) {
    //         case "a":
    //             $fromDirectory =  getCheckSourceAPath($projectName, $checkName);
    //             break;
    //         case "b":
    //             $fromDirectory =  getCheckSourceBPath($projectName, $checkName);
    //             break;
    //         case "c":
    //             $fromDirectory =  getCheckSourceCPath($projectName, $checkName);
    //             break;
    //         case "d":
    //             $fromDirectory =  getCheckSourceDPath($projectName, $checkName);
    //             break;
    //     }
    // }  
    // if ($fromDirectory === null) {
    //     echo json_encode(array(
    //         "Msg" =>  "Temp source directory not found.",
    //         "MsgCode" => -2
    //     ));
    //     return;
    // }

    // $targetDir = getDataVaultDirectoryPath($projectName) . "/" . $fileName . "_" . $version;  
    // if (!file_exists($targetDir)) {
    //     mkdir($targetDir, 0777, true);
    // }

    // // copy .scs file from from directory to target dir
    // $targetFile = null;
    // foreach (glob($fromDirectory . '/*.scs') as $scsFile) {       
    //     $p = pathinfo($scsFile);
    //     $targetFile = $p['filename'] . "." . $p['extension'];
    // }
    // if ($targetFile === null) {
    //     echo $fromDirectory;
    //     echo json_encode(array(
    //         "Msg" =>  "Target file not found.",
    //         "MsgCode" => -2
    //     ));
    //     return;
    // }

    // // move file from from dir to target dir
    // copy(
    //     $fromDirectory . "/" . $targetFile,
    //     $targetDir . "/" . $targetFile
    // );

    // // add dataset entry to db
    // addDatasetToDB(
    //     $projectName,
    //     $fileName,
    //     $fileType,
    //     $description,
    //     $version,
    //     $userName,
    //     $replace,
    //     $targetFile
    // );

    // // add components from dataset to db
    // addComponentsToVaultDB(
    //     $projectName,
    //     $fileName,
    //     $version
    // );

    // echo json_encode(array(
    //     "Msg" =>  "success",
    //     "MsgCode" => 1
    // ));
    // return;
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
    $replace,
    $scsFile
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
                dateModified Text,
                scsFile Text
            )';
    $projectDbh->exec($command);

    if (strtolower($replace) === "true") {
        $query = "Delete from DataVault where name='" . $fileName . "' and version='" . $version . "';";
        $stmt = $projectDbh->prepare($query);
        $stmt->execute();
    }
    
    $qry = 'INSERT INTO DataVault(name, type, description, version, addedBy, dateAdded, scsFile) VALUES(?,?,?,?,?,?,?) ';
    $stmt = $projectDbh->prepare($qry);
    $stmt->execute(
        array(
            $fileName,
            $fileType,
            $description,
            $version,
            $userName,
            date("Y-m-d h:i:sa"),
            $scsFile
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

    echo json_encode(array(
        "Msg" =>  "success",
        "MsgCode" => 1
    ));
}

function ReadVaultData(){
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

    $projectDBPath = getProjectDatabasePath($projectName);
    $projectDbh = new PDO("sqlite:$projectDBPath") or die("cannot open the database");

    // begin the transaction
    $projectDbh->beginTransaction();
   
    $results = $projectDbh->query("SELECT *FROM DataVault;");    

    $data = array();
    if ($results) {
        while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
            array_push($data, array(
                "id" => $record['id'],
                "name" => $record['name'],
                "type" => $record['type'],
                "description" => $record['description'],
                "version" => $record['version'],
                "addedBy" => $record['addedBy'],
                "dateAdded" => $record['dateAdded'],
                "modifiedBy" => $record['modifiedBy'],
                "dateModified" => $record['dateModified'],
                "scsFile" => $record['scsFile']
            ));
        }
    }

    $projectDbh->commit();
    $projectDbh = null; //This is how you close a PDO connection        

    echo json_encode(array(
        "Msg" =>  "success",
        "Data" => $data,
        "MsgCode" => 1
    ));
}

function DeleteVaultData()
{
    if (
        !isset($_POST['ProjectName']) ||
        !isset($_POST['DataToDelete'])
    ) {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));
        return;
    }
    $projectName = $_POST['ProjectName'];
    $DataToDelete = json_decode($_POST['DataToDelete'],true);
   
    $projectDBPath = getProjectDatabasePath($projectName);
    $projectDbh = new PDO("sqlite:$projectDBPath") or die("cannot open the database");

    // begin the transaction
    $projectDbh->beginTransaction();    

    for ($i = 0; $i < count($DataToDelete); $i++) {
        $name =  $DataToDelete[$i]['name'];
        $version = $DataToDelete[$i]['version'];

        // remove from DB
        $query = "Delete from DataVault where name='" . $name . "' and version='" . $version . "';";
        $stmt = $projectDbh->prepare($query);
        $stmt->execute();

        //remove dir from vault
        $dataDir = getDataVaultDirectoryPath($projectName) . "/" . $name . "_" . $version; 
        deleteDirectory($dataDir);
    }    

    $projectDbh->commit();
    $projectDbh = null; //This is how you close a PDO connection        

    echo json_encode(array(
        "Msg" =>  "success",       
        "MsgCode" => 1
    ));
}

function GetDataFromVault(){
    if (
        !isset($_POST['projectName'])||     
        !isset($_POST['fileName']) ||
        !isset($_POST['version'])
    ) {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));
        return;
    }
    $projectName = $_POST['projectName'];  
    $fileName = $_POST['fileName'];
    $version = $_POST['version'];
    
    $dataDir = getDataVaultDirectoryPath($projectName) . "/" . $fileName . "_" . $version; 
    
    $targetFile = null;
    foreach (glob($dataDir . '/*.scs') as $scsFile) {       
        $p = pathinfo($scsFile);
        $targetFile = $p['filename'] . "." . $p['extension'];
    }
    
    // get all components from DB  
    $allComponentsStr = readAllComponents($dataDir);
    // $dbFile = $dataDir . "/Data.db";
    // $dbh = new PDO("sqlite:$dbFile") or die("cannot open the database");

    // // begin the transaction
    // $dbh->beginTransaction();
   
    // $results = $dbh->query("SELECT *FROM allComponents;");

    // $allComponentsStr = null;
    // if ($results) {
    //     while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
    //         $allComponentsStr = $record['value'];
    //         break;
    //     }
    // }

    // $dbh->commit();
    // $dbh = null; //This is how you close a PDO connection        

    echo json_encode(array(
        "Msg" =>  "success",
        "Data" => array(
            "scsFile" => $dataDir."/".$targetFile,
            "allComponents" => $allComponentsStr
        ),            
        "MsgCode" => 1
    ));
}

function CopyDataToCheckSpace()
{
    if (
        !isset($_POST['projectName']) ||
        !isset($_POST['checkName']) ||
        !isset($_POST['fileName']) ||
        !isset($_POST['version']) ||
        !isset($_POST['srcId'])
    ) {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));
        return;
    }

    $projectName = $_POST['projectName'];
    $checkName = $_POST['checkName'];
    $fileName = $_POST['fileName'];
    $version = $_POST['version'];
    $srcId = $_POST['srcId'];

    $dataDir = getDataVaultDirectoryPath($projectName) . "/" . $fileName . "_" . $version;

    // Copy scs file to checkspace
    $targetFile = null;
    foreach (glob($dataDir . '/*.scs') as $scsFile) {
        $p = pathinfo($scsFile);
        $targetFile = $p['filename'] . "." . $p['extension'];
    }
    $sourcePath = $dataDir . "/" . $targetFile;

    // upload directory
    $uploadDirectory = null;
    switch ($srcId) {
        case "a":
            $uploadDirectory =  getCheckSourceAPath($projectName, $checkName);
            break;
        case "b":
            $uploadDirectory =  getCheckSourceBPath($projectName, $checkName);
            break;
        case "c":
            $uploadDirectory =  getCheckSourceCPath($projectName, $checkName);
            break;
        case "d":
            $uploadDirectory =  getCheckSourceDPath($projectName, $checkName);
            break;
    }
    if ($uploadDirectory === NULL) {
        echo json_encode(array(
            "Msg" =>  "failed",
            "MsgCode" => 0
        ));
        return;
    }
    $targetPath = $uploadDirectory . "/" . $targetFile;

    // copy file from vault dir to checkspace dir
    copy($sourcePath, $targetPath);

    // get all components from DB  
    $allComponentsStr = readAllComponents($dataDir);

    echo json_encode(array(
        "Msg" =>  "success",
        "Data" => array(
            "scsFile" => $targetPath,
            "allComponents" => $allComponentsStr
        ),
        "MsgCode" => 1
    ));
}

function readAllComponents($dataDir)
{
    // get all components from DB  
    $dbFile = $dataDir . "/Data.db";
    $dbh = new PDO("sqlite:$dbFile") or die("cannot open the database");

    // begin the transaction
    $dbh->beginTransaction();

    $results = $dbh->query("SELECT *FROM allComponents;");

    $allComponentsStr = null;
    if ($results) {
        while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
            $allComponentsStr = $record['value'];
            break;
        }
    }

    $dbh->commit();
    $dbh = null; //This is how you close a PDO connection   

    return $allComponentsStr;
}