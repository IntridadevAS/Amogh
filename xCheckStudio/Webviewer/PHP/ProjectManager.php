<?php
require_once 'Utility.php';
require_once 'UserManagerUtility.php';
require_once 'GlobalConstants.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $InvokeFunction = trim($_POST["InvokeFunction"], " ");
    switch ($InvokeFunction) {
        case "CreateProject":
            CreateProject();
            break;
        // case "AddProjectToMainDB":
        //     AddProjectToMainDB();
        //     break;
        case "AddNewProjectToMainDB":
            AddNewProjectToMainDB();
            break;
        case "SetProjectAsFavourite":
            SetProjectAsFavourite();
            break;
        case "SetVaultEnable":
            SetVaultEnable();
            break;            
        case "UpdateProject":
            UpdateProject();
            break;
        case "DeleteProject":
            DeleteProject();
            break;
        case "GetProjects":
            GetProjects();
            break;
        case "ReadSelectedComponents":
            ReadSelectedComponents();
            break;
        case "ReadCheckModuleControlsState":
            ReadCheckModuleControlsState();
            break;
        case "DeleteComparisonResults":
            DeleteComparisonResults();
            break;
        case "DeleteSourceAComplianceResults":
            DeleteSourceAComplianceResults();
            break;
        case "DeleteSourceBComplianceResults":
            DeleteSourceBComplianceResults();
            break;
        case "DeleteSourceCComplianceResults":
            DeleteSourceCComplianceResults();
            break;
        case "DeleteSourceDComplianceResults":
            DeleteSourceDComplianceResults();
            break;
        case "SaveCheckCaseData":
            SaveCheckCaseData();
            break;
        case "CreateCheckSpaceDBonSave":
            CreateCheckSpaceDBonSave();
            break;
        case "ClearTemporaryCheckSpaceDB":
            ClearTemporaryCheckSpaceDB();
            break;
        case "RemoveSource":
            RemoveSource();
            break;
        case "RemoveAllSources":
            RemoveAllSources();
            break;
        case "RemoveSourceFromDirecory":
            RemoveSourceFromDirecory();
            break;
        case "CopyProject":
            CopyProject();
            break;
        case "SaveAll":
            SaveAll();
            break;
        case "GetNodeIdVsComponentId":
            GetNodeIdVsComponentId();
            break;
        default:
            echo "No Function Found!";
    }
}


function RemoveAllSources()
{
    if (
        !isset($_POST['ProjectName']) ||
        !isset($_POST['CheckName'])
    ) {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));

        return;
    }

    try {
        // get project name
        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];

        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        // delete component tables
        $command = 'DROP TABLE IF EXISTS SourceAComponents;';
        $dbh->exec($command);
        $command = 'DROP TABLE IF EXISTS SourceBComponents;';
        $dbh->exec($command);
        $command = 'DROP TABLE IF EXISTS SourceCComponents;';
        $dbh->exec($command);
        $command = 'DROP TABLE IF EXISTS SourceDComponents;';
        $dbh->exec($command);

        // delete properties tables
        $command = 'DROP TABLE IF EXISTS SourceAProperties;';
        $dbh->exec($command);
        $command = 'DROP TABLE IF EXISTS SourceBProperties;';
        $dbh->exec($command);
        $command = 'DROP TABLE IF EXISTS SourceCProperties;';
        $dbh->exec($command);
        $command = 'DROP TABLE IF EXISTS SourceDProperties;';
        $dbh->exec($command);

        //delete references
        $command = 'DROP TABLE IF EXISTS a_References;';
        $dbh->exec($command);
        $command = 'DROP TABLE IF EXISTS b_References;';
        $dbh->exec($command);
        $command = 'DROP TABLE IF EXISTS c_References;';
        $dbh->exec($command);
        $command = 'DROP TABLE IF EXISTS d_References;';
        $dbh->exec($command);

        // delete comparison results
        DeleteComparisonResults();

        // delete compliance results
        DeleteSourceAComplianceResults();
        DeleteSourceBComplianceResults();
        DeleteSourceCComplianceResults();
        DeleteSourceDComplianceResults();

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection                

        echo json_encode(array(
            "Msg" =>  "success",
            "MsgCode" => 1
        ));
        return;
    } catch (Exception $e) {
        echo json_encode(array(
            "Msg" =>  "Failed to remove all sources.",
            "MsgCode" => 0
        ));
        return;
    }
}

/*
    Remove Specific source
*/
function RemoveSource()
{
    if (
        !isset($_POST['ProjectName']) ||
        !isset($_POST['CheckName']) ||
        !isset($_POST['SourceId'])
    ) {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));

        return;
    }

    try {
        // get project name
        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];
        $sourceId = $_POST['SourceId'];

        $dbPath = getCheckDatabasePath($projectName, $checkName);

        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        // delete comparison results
        DeleteComparisonResults();

        $sourceComponentsTable = NULL;
        $sourcePropertiesTable = NULL;
        $refrenceTable = NULL;

        // delete compliance results
        if (strtolower($sourceId) === "a") {
            DeleteSourceAComplianceResults();

            $sourceComponentsTable = "SourceAComponents";
            $sourcePropertiesTable = "SourceAProperties";
            $refrenceTable = "a_References";
        } else if (strtolower($sourceId) === "b") {
            DeleteSourceBComplianceResults();

            $sourceComponentsTable = "SourceBComponents";
            $sourcePropertiesTable = "SourceBProperties";
            $refrenceTable = "b_References";
        } else if (strtolower($sourceId) === "c") {
            DeleteSourceCComplianceResults();

            $sourceComponentsTable = "SourceCComponents";
            $sourcePropertiesTable = "SourceCProperties";
            $refrenceTable = "c_References";
        } else if (strtolower($sourceId) === "d") {
            DeleteSourceDComplianceResults();

            $sourceComponentsTable = "SourceDComponents";
            $sourcePropertiesTable = "SourceDProperties";
            $refrenceTable = "d_References";
        }

        // delete source component and properties tables
        if ($sourceComponentsTable !== NULL) {
            $command = 'DROP TABLE IF EXISTS ' . $sourceComponentsTable . ';';
            $dbh->exec($command);
        }

        if ($sourcePropertiesTable !== NULL) {
            $command = 'DROP TABLE IF EXISTS ' . $sourcePropertiesTable . ';';
            $dbh->exec($command);
        }

        if ($refrenceTable !== NULL) {
            $command = 'DROP TABLE IF EXISTS ' . $refrenceTable . ';';
            $dbh->exec($command);
        }


        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection                

        echo json_encode(array(
            "Msg" =>  "success",
            "MsgCode" => 1
        ));
        return;
    } catch (Exception $e) {
        echo json_encode(array(
            "Msg" =>  "Failed to remove source.",
            "MsgCode" => 0
        ));
        return;
    }
}

function RemoveSourceFromDirecory()
{
    if (
        !isset($_POST['ProjectName']) ||
        !isset($_POST['CheckName']) ||
        !isset($_POST['SourceId'])
    ) {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));

        return;
    }
    try {
        // get project name
        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];
        $sourceId = $_POST['SourceId'];

        $sourcePath;
        // delete source files
        if (strtolower($sourceId) === "a") {
            $sourcePath = getCheckSourceAPath($projectName, $checkName);
        } else if (strtolower($sourceId) === "b") {
            $sourcePath = getCheckSourceBPath($projectName, $checkName);
        } else if (strtolower($sourceId) === "c") {
            $sourcePath = getCheckSourceCPath($projectName, $checkName);
        } else if (strtolower($sourceId) === "d") {
            $sourcePath = getCheckSourceDPath($projectName, $checkName);
        }

        deleteAllSourceInformation($sourcePath);
        echo json_encode(array(
            "Msg" =>  "success",
            "MsgCode" => 1
        ));
        return;
    } catch (Exception $e) {
        echo json_encode(array(
            "Msg" =>  "Failed to remove source.",
            "MsgCode" => 0
        ));
        return;
    }
}

function deleteAllSourceInformation($fileName)
{
    //It it's a file.
    if (is_file($fileName)) {
        //Attempt to delete it.
        return unlink($fileName);
    }
    //If it's a directory.
    elseif (is_dir($fileName)) {
        //Get a list of the files in this directory.
        $scan = glob(rtrim($fileName, '/') . '/*');
        //Loop through the list of files.
        foreach ($scan as $index => $path) {
            //Call our recursive function.
            deleteAllSourceInformation($path);
        }
    }
}

/* 
   Save all data
*/
function SaveAll()
{
    if (
        !isset($_POST['ProjectName']) ||
        !isset($_POST['CheckName']) ||
        !isset($_POST['Context'])
    ) {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));

        return;
    }

    // get project name
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];

    $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
    $tempDBPath = getCheckDatabasePath($projectName, $checkName);

    // create or rewrite the main check space db
    CreateCheckSpaceDBonSave();

    if (
        !file_exists($dbPath) ||
        !file_exists($tempDBPath)
    ) {
        echo json_encode(array(
            "Msg" =>  "DBs not found.",
            "MsgCode" => 0
        ));

        return;
    }

    $context = $_POST['Context'];

    try {
        // open database             
        $tempDbh = new PDO("sqlite:$tempDBPath") or die("cannot open the database");
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();
        $tempDbh->beginTransaction();

        // this will save all sources components, properties                       
        SaveComponentsFromTemp($tempDbh, $dbh, "SourceAComponents", "SourceAProperties");
        SaveComponentsFromTemp($tempDbh, $dbh, "SourceBComponents", "SourceBProperties");
        SaveComponentsFromTemp($tempDbh, $dbh, "SourceCComponents", "SourceCProperties");
        SaveComponentsFromTemp($tempDbh, $dbh, "SourceDComponents", "SourceDProperties");

        // save check case info 
        SaveCheckCaseInfoFromTemp($tempDbh, $dbh);

        // 'check' context save needs to be changed for viewer opttions
        if ($context === "check") {
            // save check module control state from temp check space db to main checkspace db
            SaveCheckModuleControlsState($dbh);

            // save loaded data sources information
            SaveDataSourceInfo($dbh);

            // save viewer related information            
            SaveVieweroptions($dbh);

            // save selected components
            SaveSelectedComponents($dbh);

            // save not selected components
            SaveNotSelectedComponents($dbh);

            // save hiddent items
            SaveHiddenItems($dbh);

            // save check result statistics
            if (!SaveCheckStatistics($tempDbh, $dbh)) {
                SaveCheckStatisticsFromTemp($tempDbh, $dbh);
            }

              // save markup views
              SaveMarkupViews($dbh);
              SaveBookmarkViews($dbh);
              SaveAnnotations($dbh);

            // Save all components
            SaveAllComponents($dbh);

            // save property goups
            SavePropertyGroups($dbh);

            // save highlight property templates
            SaveHighlightPropertyTemplates($dbh);
            
        } else {
            // save check module control state from temp check space db to main checkspace db
            SaveCheckModuleControlsStateFromTemp($tempDbh, $dbh);

            // save loaded data sources information
            SaveDataSourceInfoFromTemp($tempDbh, $dbh);

            // save viewer related information
            SaveVieweroptionsFromTemp($tempDbh, $dbh, "SourceAViewerOptions");
            SaveVieweroptionsFromTemp($tempDbh, $dbh, "SourceBViewerOptions");
            SaveVieweroptionsFromTemp($tempDbh, $dbh, "SourceCViewerOptions");
            SaveVieweroptionsFromTemp($tempDbh, $dbh, "SourceDViewerOptions");

            // save selected components
            SaveSelectedComponentsFromTemp($tempDbh, $dbh, "SourceASelectedComponents");
            SaveSelectedComponentsFromTemp($tempDbh, $dbh, "SourceBSelectedComponents");
            SaveSelectedComponentsFromTemp($tempDbh, $dbh, "SourceCSelectedComponents");
            SaveSelectedComponentsFromTemp($tempDbh, $dbh, "SourceDSelectedComponents");

            // // save not selected components
            SaveNotSelectedComponentsFromTemp($tempDbh, $dbh, "SourceANotSelectedComponents");
            SaveNotSelectedComponentsFromTemp($tempDbh, $dbh, "SourceBNotSelectedComponents");
            SaveNotSelectedComponentsFromTemp($tempDbh, $dbh, "SourceCNotSelectedComponents");
            SaveNotSelectedComponentsFromTemp($tempDbh, $dbh, "SourceDNotSelectedComponents");

            // save hiddent items
            SaveHiddenItemsFromTemp($tempDbh, $dbh);

            // save check result statistics
            SaveCheckStatisticsFromTemp($tempDbh, $dbh);   

            SavMarkupViewsFromTemp($tempDbh, $dbh);  
            SaveBookmarkViewsFromTemp($tempDbh, $dbh);  
            SaveAnnotationsFromTemp($tempDbh, $dbh);  

            SaveAllComponentsFromTemp($tempDbh, $dbh, "AllComponentsa");  
            SaveAllComponentsFromTemp($tempDbh, $dbh, "AllComponentsb");  
            SaveAllComponentsFromTemp($tempDbh, $dbh, "AllComponentsc");  
            SaveAllComponentsFromTemp($tempDbh, $dbh, "AllComponentsd");  

            SavePropertyGroupsFromTemp($tempDbh, $dbh);  

             // save highlight property templates
             SaveHighlightPropertyTemplatesFromTemp($tempDbh, $dbh); 
        }

        // comparison result tables table                               
        SaveComparisonGroupsFromTemp($tempDbh, $dbh);
        SaveComparisonComponentsFromTemp($tempDbh, $dbh);
        SaveComparisonPropertiesFromTemp($tempDbh, $dbh);
        SaveNotMatchedComponentsFromTemp($tempDbh, $dbh, "SourceANotMatchedComponents");
        SaveNotMatchedComponentsFromTemp($tempDbh, $dbh, "SourceBNotMatchedComponents");
        SaveNotMatchedComponentsFromTemp($tempDbh, $dbh, "SourceCNotMatchedComponents");
        SaveNotMatchedComponentsFromTemp($tempDbh, $dbh, "SourceDNotMatchedComponents");

        // source a compliance result tables table     
        SaveSourceAComplianceCheckGroupsFromTemp($tempDbh, $dbh);
        SaveSourceAComplianceCheckComponentsFromTemp($tempDbh, $dbh);
        SaveSourceAComplianceCheckPropertiesFromTemp($tempDbh, $dbh);

        // source b compliance result tables table     
        SaveSourceBComplianceCheckGroupsFromTemp($tempDbh, $dbh);
        SaveSourceBComplianceCheckComponentsFromTemp($tempDbh, $dbh);
        SaveSourceBComplianceCheckPropertiesFromTemp($tempDbh, $dbh);

        // source c compliance result tables table     
        SaveSourceCComplianceCheckGroupsFromTemp($tempDbh, $dbh);
        SaveSourceCComplianceCheckComponentsFromTemp($tempDbh, $dbh);
        SaveSourceCComplianceCheckPropertiesFromTemp($tempDbh, $dbh);

        // source d compliance result tables table     
        SaveSourceDComplianceCheckGroupsFromTemp($tempDbh, $dbh);
        SaveSourceDComplianceCheckComponentsFromTemp($tempDbh, $dbh);
        SaveSourceDComplianceCheckPropertiesFromTemp($tempDbh, $dbh);

        // save references                
        SaveReferencesFromTemp($tempDbh, $dbh, "a_References");
        SaveReferencesFromTemp($tempDbh, $dbh, "b_References");
        SaveReferencesFromTemp($tempDbh, $dbh, "c_References");
        SaveReferencesFromTemp($tempDbh, $dbh, "d_References");

        // save versions
        SaveVersionsFromTemp($tempDbh, $dbh);

        // save comments from temp
        SaveCheckspaceCommentsFromTemp($tempDbh, $dbh);      

        // commit update
        $dbh->commit();
        $tempDbh->commit();
        $dbh = null; //This is how you close a PDO connection                    
        $tempDbh = null; //This is how you close a PDO connection                        

        echo json_encode(array(
            "Msg" =>  "success",
            "MsgCode" => 1
        ));
        return;
    } catch (Exception $e) {
        echo json_encode(array(
            "Msg" =>  "Failed to save data.",
            "MsgCode" => 0
        ));
        return;
    }
}


function SaveComparisonPropertiesFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM ComparisonCheckProperties;");

    // delete table
    $command = 'DROP TABLE IF EXISTS ComparisonCheckProperties;';
    $dbh->exec($command);
    if ($selectResults) {

        $command = CREATE_COMPARISONPROPERTIES_TABLE;
        $dbh->exec($command);

        $insertStmt = $dbh->prepare(INSERT_ALLCOMPARISONPROPERTIESWITHID_TABLE);


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['sourceAName'],
                $row['sourceBName'],
                $row['sourceCName'],
                $row['sourceDName'],
                $row['sourceAValue'],
                $row['sourceBValue'],
                $row['sourceCValue'],
                $row['sourceDValue'],
                $row['result'],
                $row['severity'],
                $row['accepted'],
                $row['performCheck'],
                $row['description'],
                $row['ownerComponent'],
                $row['transpose']
            ));
        }
    }
}

function SaveComparisonGroupsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM ComparisonCheckGroups;");

    // delete table if exists
    $command = 'DROP TABLE IF EXISTS ComparisonCheckGroups;';
    $dbh->exec($command);

    if ($selectResults) {

        $command = 'CREATE TABLE ComparisonCheckGroups(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            componentClass TEXT NOT NULL,
            componentCount Integer, 
            categoryStatus TEXT NOT NULL)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO ComparisonCheckGroups(id, 
         componentClass, 
         componentCount, 
         categoryStatus) VALUES(?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['componentClass'],
                $row['componentCount'],
                $row['categoryStatus']
            ));
        }
    }
}

function SaveComparisonComponentsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM ComparisonCheckComponents;");

    // delete table, if exists
    $command = 'DROP TABLE IF EXISTS ComparisonCheckComponents;';
    $dbh->exec($command);
    if ($selectResults) {

        // $command = 'CREATE TABLE ComparisonCheckComponents(
        //     id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        //     sourceAName TEXT,
        //     sourceBName TEXT,
        //     sourceASubComponentClass TEXT,
        //     sourceBSubComponentClass TEXT,
        //     status TEXT,
        //     accepted TEXT,
        //     sourceANodeId TEXT,
        //     sourceBNodeId TEXT,
        //     sourceAId TEXT,
        //     sourceBId TEXT,
        //     ownerGroup INTEGER NOT NULL,
        //     transpose TEXT)';
        $command = CREATE_COMPARISONCOMPONETS_TABLE;
        $dbh->exec($command);

        //  $insertStmt = $dbh->prepare("INSERT INTO ComparisonCheckComponents(id, 
        //  sourceAName, 
        //  sourceBName, 
        //  sourceASubComponentClass, 
        //  sourceBSubComponentClass, 
        //  status,
        //  accepted,
        //  sourceANodeId,
        //  sourceBNodeId,
        //  sourceAId,
        //  sourceBId,
        //  ownerGroup,
        //  transpose) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $insertStmt = $dbh->prepare(INSERT_ALLCOMPARISONCOMPONETSWITHID_TABLE);


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['sourceAName'],
                $row['sourceBName'],
                $row['sourceCName'],
                $row['sourceDName'],
                $row['sourceAMainClass'],
                $row['sourceBMainClass'],
                $row['sourceCMainClass'],
                $row['sourceDMainClass'],
                $row['sourceASubComponentClass'],
                $row['sourceBSubComponentClass'],
                $row['sourceCSubComponentClass'],
                $row['sourceDSubComponentClass'],
                $row['status'],
                $row['accepted'],
                $row['sourceANodeId'],
                $row['sourceBNodeId'],
                $row['sourceCNodeId'],
                $row['sourceDNodeId'],
                $row['sourceAId'],
                $row['sourceBId'],
                $row['sourceCId'],
                $row['sourceDId'],
                $row['ownerGroup'],
                $row['transpose'],
                $row['classMappingInfo']
            ));
        }
    }
}

function ClearTemporaryCheckSpaceDB()
{
    if (
        !isset($_POST['ProjectName']) ||
        !isset($_POST['CheckName']) ||
        !isset($_POST['ProjectId'])
    ) {
        echo 'fail';
        return;
    }

    try {
        // get project name
        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];
        $projectId = $_POST['ProjectId'];

        $tempDBPath = getCheckDatabasePath($projectName, $checkName);
        if (file_exists($tempDBPath)) {
            unlink($tempDBPath);
        }       
    } catch (Exception $e) {
        echo "fail";
        return;
    }
}

// function deleteDirectory($dir)
// {
//     if (!file_exists($dir)) {
//         return true;
//     }

//     if (!is_dir($dir)) {
//         return unlink($dir);
//     }

//     foreach (scandir($dir) as $item) {
//         if ($item == '.' || $item == '..') {
//             continue;
//         }

//         if (!deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
//             return false;
//         }
//     }

//     return rmdir($dir);
// }

function CreateCheckSpaceDBonSave()
{
    // get project name
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
    try {
        $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
        if (file_exists($dbPath)) {
            unlink($dbPath);
        }

        // create project database          
        $database = new SQLite3($dbPath);
    } catch (Exception $e) {
        echo "fail";
        return;
    }

    echo "success";
    return;
}

/* 
   Save check versions
*/
function SaveVersionsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM Versions;");

    // create table
    $command = 'DROP TABLE IF EXISTS Versions;';
    $dbh->exec($command);

    if ($selectResults) {
        $command = 'CREATE TABLE IF NOT EXISTS Versions(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,
            description TEXT,
            comments TEXT,
            createdById TEXT,
            createdByAlias TEXT,
            createdOn TEXT,
            IsFav INTEGER       
            )';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO Versions(id, name, description, comments, createdById, 
         createdByAlias, createdOn, IsFav) VALUES(?,?,?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['description'],
                $row['comments'],
                $row['createdById'],
                $row['createdByAlias'],
                $row['createdOn'],
                $row['IsFav']
            ));
        }
    }
}

// Save checkspace comments
function SaveCheckspaceCommentsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM checkspaceComments;");
    if ($selectResults) {
        $command = 'DROP TABLE IF EXISTS checkspaceComments;';
        $dbh->exec($command);

        $command = 'CREATE TABLE IF NOT EXISTS checkspaceComments(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            comment TEXT     
          )';
        $dbh->exec($command);

        $insertReferenceStmt = $dbh->prepare("INSERT INTO checkspaceComments(id, comment) VALUES(?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertReferenceStmt->execute(array(
                $row['id'],
                $row['comment']
            ));
        }
    }
}

/* 
   Save references on components
*/
function SaveReferencesFromTemp($tempDbh, $dbh, $referenceTable)
{
    $selectResults = $tempDbh->query("SELECT * FROM " . $referenceTable . ";");

    // create table
    $command = 'DROP TABLE IF EXISTS ' . $referenceTable . ';';
    $dbh->exec($command);

    if ($selectResults) {
        $command = 'CREATE TABLE IF NOT EXISTS ' . $referenceTable . '(
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        webAddress TEXT,
        document TEXT,
        pic TEXT,
        comment TEXT,
        component INTEGER NOT NULL       
        )';
        $dbh->exec($command);

        $insertReferenceStmt = $dbh->prepare("INSERT INTO " . $referenceTable . "(id, webAddress, document, pic, comment, 
         component) VALUES(?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertReferenceStmt->execute(array(
                $row['id'],
                $row['webAddress'],
                $row['document'],
                $row['pic'],
                $row['comment'],
                $row['component']
            ));
        }
    }
}

/* 
   Save hidden items in model browser
*/
function SaveHiddenItemsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM hiddenComponents;");
    if ($selectResults) {
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS hiddenComponents;';
        $dbh->exec($command);

        $command = 'CREATE TABLE hiddenComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                hiddenComponents TEXT,
                visibleComponents TEXT)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO hiddenComponents(id, hiddenComponents, visibleComponents) VALUES(?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['hiddenComponents'],
                $row['visibleComponents']
            ));
        }
    }
}

function SaveHiddenItems($dbh)
{
    if (!isset($_POST['hiddenItems'])) {
        return false;
    }

    $hiddenItems = json_decode($_POST['hiddenItems'], true);

    if (
        !array_key_exists("hiddenComponents", $hiddenItems) ||
        !array_key_exists("visibleComponents", $hiddenItems)
    ) {
        return false;
    }

    $hiddenComponents = $hiddenItems['hiddenComponents'];
    $visibleComponents = $hiddenItems["visibleComponents"];

    try {
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS hiddenComponents;';
        $dbh->exec($command);

        $command = 'CREATE TABLE hiddenComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                hiddenComponents TEXT,
                visibleComponents TEXT)';
        $dbh->exec($command);

        $insertQuery = 'INSERT INTO hiddenComponents(hiddenComponents, visibleComponents) VALUES(?,?) ';
        $values = array($hiddenComponents, $visibleComponents);

        $stmt = $dbh->prepare($insertQuery);
        $stmt->execute($values);
    } catch (Exception $e) {
        return false;
    }

    return true;

    //////////////////////
    // if(!isset($_POST['hiddenComponents']) ||
    // !isset($_POST['ProjectName']) ||
    // !isset($_POST['CheckName']) ||
    // !isset($_POST["visibleComponents"]))
    // {
    //     echo 'fail';
    //     return;
    // }

    // $hiddenComponents = $_POST['hiddenComponents'];
    // $visibleComponents = $_POST["visibleComponents"];
    // $projectName = $_POST['ProjectName'];
    // $checkName = $_POST['CheckName'];

    // try
    // {   
    //     // open database
    //     $dbPath = getSavedCheckDatabasePath($projectName, $checkName);           
    //     $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

    //     // begin the transaction
    //     $dbh->beginTransaction();

    //     // SourceANotCheckedComponents table

    //     // drop table if exists
    //     $command = 'DROP TABLE IF EXISTS hiddenComponents;';
    //     $dbh->exec($command);

    //     $command = 'CREATE TABLE hiddenComponents(
    //             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
    //             hiddenComponents TEXT,
    //             visibleComponents TEXT)'; 
    //     $dbh->exec($command);

    //     $insertQuery = 'INSERT INTO hiddenComponents(hiddenComponents, visibleComponents) VALUES(?,?) ';
    //     $values = array($hiddenComponents, $visibleComponents);

    //     $stmt = $dbh->prepare($insertQuery);                    
    //     $stmt->execute($values);   

    //     // commit update
    //     $dbh->commit();
    //     $dbh = null; //This is how you close a PDO connection
    // }                
    // catch(Exception $e)
    // {        
    //     echo "fail"; 
    //     return;
    // }  
}

/* 
   Save Components and properties
*/
function SaveComponentsFromTemp($tempDbh, $dbh, $componentTable, $propertiesTable)
{
    $selectResults = $tempDbh->query("SELECT * FROM " . $componentTable . ";");

    // delete table
    $command = 'DROP TABLE IF EXISTS ' . $componentTable . ';';
    $dbh->exec($command);

    // delete table
    $command = 'DROP TABLE IF EXISTS ' . $propertiesTable . ';';
    $dbh->exec($command);

    if ($selectResults) {
        // ischecked can have values 'true' or 'false'
        $command = 'CREATE TABLE ' . $componentTable . '(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT NOT NULL,
            mainclass TEXT,
            subclass TEXT,
            nodeid INTEGER,
            ischecked TEXT,
            parentid INTEGER,
            componentid INTEGER
          )';
        $dbh->exec($command);

        $insertComponentStmt = $dbh->prepare("INSERT INTO " . $componentTable . "(id, name, mainclass, subclass, nodeid, 
         ischecked, parentid, componentid) VALUES(?,?,?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertComponentStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['mainclass'],
                $row['subclass'],
                $row['nodeid'],
                $row['ischecked'],
                $row['parentid'],
                $row['componentid']
            ));
        }

        // save properties
        $selectPropertiesResults = $tempDbh->query("SELECT * FROM " . $propertiesTable . ";");
        if ($selectPropertiesResults) {
            // create properties table
            $command = 'CREATE TABLE ' . $propertiesTable . '(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        name TEXT NOT NULL,
                        format TEXT,
                        value TEXT,                
                        ownercomponent INTEGER NOT NULL,
                        userdefined INTEGER default 0              
              )';
            $dbh->exec($command);

            $insertPropertiesStmt = $dbh->prepare("INSERT INTO  " . $propertiesTable . "(id, name, format, value, 
                      ownercomponent, userdefined) VALUES(?,?,?,?,?,?)");


            while ($row = $selectPropertiesResults->fetch(\PDO::FETCH_ASSOC)) {
                $insertPropertiesStmt->execute(array(
                    $row['id'],
                    $row['name'],
                    $row['format'],
                    $row['value'],
                    $row['ownercomponent'],
                    $row['userdefined']
                ));
            }
        }
    }
}

/* 
   Save viewer options
*/
function SaveVieweroptionsFromTemp($tempDbh, $dbh, $tableName)
{
    $selectResults = $tempDbh->query("SELECT * FROM " . $tableName . ";");
    if ($selectResults) {
        // create table
        // drop table if exists
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS ' . $tableName . ';';
        $dbh->exec($command);

        $command = 'CREATE TABLE ' . $tableName . '(
                   id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, 
                   endpointUri TEXT)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare('INSERT INTO ' . $tableName . '(id, endpointUri) VALUES(?,?) ');

        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['endpointUri']
            ));
        }
    }
}

function SaveVieweroptions($dbh)
{

    if (!isset($_POST["viewerOptions"])) {
        return;
    }

    try {

        $viewerOptions = json_decode($_POST['viewerOptions'], true);
        foreach ($viewerOptions as $sourceViewerOptionsTable => $sourceViewerOptions) {

            // // open database          
            // $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");                 

            // // begin the transaction
            // $dbh->beginTransaction();                     

            $command = 'CREATE TABLE ' . $sourceViewerOptionsTable . '(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,                    
                    endpointUri TEXT)';
            $dbh->exec($command);

            $insertStmt = $dbh->prepare("INSERT INTO " . $sourceViewerOptionsTable . "(endpointUri) VALUES(?)");
            $insertStmt->execute(array($sourceViewerOptions[0]));
        }
    } catch (Exception $e) {
        return false;
    }

    return true;

    //     if(!isset($_POST['ProjectName']) ||
    //     !isset($_POST['CheckName']) ||
    //     !isset($_POST['SourceViewerOptions']) ||
    //     !isset($_POST['SourceViewerOptionsTable']))
    //     {
    //         return;
    //     }

    //    // get project name
    //    $projectName = $_POST['ProjectName'];	
    //    $checkName = $_POST['CheckName'];

    //    $sourceViewerOptions = json_decode($_POST['SourceViewerOptions'],true);
    //    $sourceViewerOptionsTable = $_POST['SourceViewerOptionsTable'];

    //    $dbPath = getSavedCheckDatabasePath($projectName, $checkName);       
    //    if(!file_exists ($dbPath))
    //    { 
    //         echo 'fail';
    //         return;
    //    }       

    //    $dbh;
    // try
    // {        
    //     // open database          
    //     $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");                 

    //     // begin the transaction
    //     $dbh->beginTransaction();                     

    //     $command = 'CREATE TABLE '.$sourceViewerOptionsTable.'(
    //         id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,                    
    //         endpointUri TEXT)';            
    //         $dbh->exec($command);  

    //     $insertStmt = $dbh->prepare("INSERT INTO ".$sourceViewerOptionsTable."(endpointUri) VALUES(?)");
    //     $insertStmt->execute(array($sourceViewerOptions[0]));

    //     // commit update
    //     $dbh->commit();           
    //     $dbh = null; //This is how you close a PDO connection                   

    //     echo 'success';
    //     return;
    // }
    // catch(Exception $e) 
    // {        
    //     echo "fail"; 
    //     return;
    // } 
}

/* 
   Save checkcase info
*/
function SaveCheckCaseInfoFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM CheckCaseInfo");
    if ($selectResults) {

        $command = 'DROP TABLE IF EXISTS CheckCaseInfo;';
        $dbh->exec($command);

        $command = 'CREATE TABLE CheckCaseInfo(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    checkCaseData TEXT)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO CheckCaseInfo(id, checkCaseData) VALUES(?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['checkCaseData']
            ));
        }
    }
}

/*
   Save not selected components
*/
function SaveNotSelectedComponentsFromTemp($tempDbh, $dbh, $tableName)
{
    $selectResults = $tempDbh->query("SELECT * FROM " . $tableName . ";");
    if ($selectResults) {

        $command = 'DROP TABLE IF EXISTS ' . $tableName . ';';
        $dbh->exec($command);
        $command = 'CREATE TABLE ' . $tableName . '(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,
            mainClass TEXT,
            subClass TEXT,
            nodeId TEXT,
            mainTableId TEXT)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO " . $tableName . "(id, name, mainClass, subClass, nodeId ,mainTableId) VALUES(?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['mainClass'],
                $row['subClass'],
                $row['nodeId'],
                $row['mainTableId']
            ));
        }
    }
}

function SaveNotSelectedComponents($dbh)
{
    if (!isset($_POST['notSelectedComponents'])) {
        echo 'fail';
        return;
    }

    $notSelectedComponentsObject = json_decode($_POST['notSelectedComponents'], true);

    foreach ($notSelectedComponentsObject as $notSelectedComponentsTable => $componentsList) {
        if (
            !array_key_exists("selectedComponents", $componentsList) ||
            !array_key_exists("componentsTable", $componentsList)
        ) {
            continue;
        }

        $selectedComponents = $componentsList['selectedComponents'];
        $componentsTable = $componentsList['componentsTable'];

        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];
        $components = getSourceComponents($projectName, $checkName, $componentsTable);

        if ($components === NULL) {
            continue;
        }

        // echo "components : ";
        // var_dump($components);
        // echo "  ";

        $notCheckedComponents = array();
        foreach ($components as $id => $component) {
            // echo "component : ";
            // var_dump($component);
            // echo "  ";

            // echo "selectedComponents : ";
            // var_dump($selectedComponents);
            // echo "  ";      

            // return;
            // check is component is selected or not for performing check
            if (!isComponentSelected($component, $selectedComponents)) {

                //source A component not checked    
                $compKey = $component['id'];
                if (!array_key_exists($compKey, $notCheckedComponents)) {
                    $notCheckedComponents[$compKey] = $component;
                }

                //continue;
            }
        }

        writeNotCheckedComponentsToDB(
            $dbh,
            $notCheckedComponents,
            $notSelectedComponentsTable
        );
    }
}

function writeNotCheckedComponentsToDB(
    $dbh,
    $notCheckedComponents,
    $tableName
) {
    try {
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS ' . $tableName . ';';
        $dbh->exec($command);

        $command = 'CREATE TABLE ' . $tableName . '(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    name TEXT,
                    mainClass TEXT,
                    subClass TEXT,
                    nodeId TEXT,
                    mainTableId TEXT)';
        $dbh->exec($command);

        foreach ($notCheckedComponents as $key => $value) {
            $name = $value["name"];
            $mainclass = $value["mainclass"];
            $subclass =  $value["subclass"];

            $nodeId = NULL;
            if (array_key_exists("nodeid", $value)) {
                $nodeId = $value["nodeid"];
            }

            $mainTableId = $value["id"];

            $insertQuery = 'INSERT INTO ' . $tableName . '(name, mainClass, subClass, nodeId, mainTableId) VALUES(?,?,?,?,?) ';
            $values = array($name,  $mainclass, $subclass, $nodeId, $mainTableId);

            $insertStmt = $dbh->prepare($insertQuery);
            $insertStmt->execute($values);
        }
    } catch (Exception $e) {
        return false;
    }

    return true;
}

function isComponentSelected($component, $SelectedComponents)
{

    for ($index = 0; $index < count($SelectedComponents); $index++) {
        $selectedComponent = $SelectedComponents[$index];
        if (
            $component['name']              ==  $selectedComponent['Name'] &&
            $component['mainclass'] ==  $selectedComponent['MainComponentClass'] &&
            $component['subclass']  ==  $selectedComponent['ComponentClass']
        ) {

            if (isset($selectedComponent['NodeId'])) {
                if ($selectedComponent['NodeId'] == $component['nodeid']) {
                    return true;
                }
            } else {
                return true;
            }
        }
    }

    return false;
}

// get source components
function getSourceComponents($projectName, $checkName, $componentsTable)
{
    $components = array();

    try {
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        // fetch source omponents
        $stmt =  $dbh->query('SELECT *FROM ' . $componentsTable . ';');

        if ($stmt) {
            while ($componentRow = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $values2 = array('id' => $componentRow['id'], 'name' => $componentRow['name'],  'mainclass' => $componentRow['mainclass'], 'subclass' => $componentRow['subclass']);
                if (array_key_exists("nodeid", $componentRow)) {
                    $values2["nodeid"] =  $componentRow['nodeid'];
                }

                //$values2 = array($row['name'],  $row['mainclass'], $row['subclass'], $row['nodeid']);
                $components[$componentRow['id']] = $values2;
            }
        }

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection
    } catch (Exception $e) {
        //echo "fail"; 
        echo 'Message: ' . $e->getMessage();
        return NULL;
    }

    return $components;
}


function   SaveNotMatchedComponentsFromTemp($tempDbh, $dbh, $tableName)
{
    $selectResults = $tempDbh->query("SELECT * FROM " . $tableName . ";");

    // drop table if exists
    $command = 'DROP TABLE IF EXISTS ' . $tableName . ';';
    $dbh->exec($command);

    if ($selectResults) {

        $command = 'CREATE TABLE ' . $tableName . '(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,
                mainClass TEXT,
                subClass TEXT,
                nodeId TEXT,
                mainTableId TEXT)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare('INSERT INTO ' . $tableName . '(id, name, mainClass, subClass, nodeId, mainTableId) VALUES(?, ?, ?, ?, ?, ?) ');

        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['mainClass'],
                $row['subClass'],
                $row['nodeId'],
                $row['mainTableId']
            ));
        }
    }
}


// function SaveCheckModuleControlsStateToCheckSpaceDB($tempDbh, $dbh)
// {
//     $selectResults = $tempDbh->query("SELECT * FROM CheckModuleControlsState;");
//     if($selectResults) 
//     {

//         $command = 'DROP TABLE IF EXISTS CheckModuleControlsState;';
//         $command = 'CREATE TABLE CheckModuleControlsState(
//                     id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
//                     comparisonSwith TEXT,
//                     sourceAComplianceSwitch TEXT,
//                     sourceBComplianceSwitch TEXT,
//                     sourceACheckAllSwitch TEXT,
//                     sourceBCheckAllSwitch TEXT)';         
//         $dbh->exec($command);    

//         $insertStmt = $dbh->prepare("INSERT INTO CheckModuleControlsState(id, comparisonSwith, sourceAComplianceSwitch, sourceBComplianceSwitch, 
//         sourceACheckAllSwitch ,sourceBCheckAllSwitch) VALUES(?,?,?,?,?,?)");    

//         while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
//         {           
//             $insertStmt->execute(array($row['id'], 
//                                        $row['comparisonSwith'], 
//                                        $row['sourceAComplianceSwitch'],
//                                        $row['sourceBComplianceSwitch'], 
//                                        $row['sourceACheckAllSwitch'], 
//                                        $row['sourceBCheckAllSwitch']));
//         } 
//     }
// }

function SavMarkupViewsFromTemp($tempDbh, $dbh)
{

    $selectResults = $tempDbh->query("SELECT * FROM markupViews");
    if ($selectResults) {
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS markupViews;';
        $dbh->exec($command);

        $command = 'CREATE TABLE markupViews(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            a TEXT,
            b TEXT,
            c TEXT,
            d TEXT)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare('INSERT INTO markupViews(id, a, b, c, d) VALUES(?,?,?,?,?) ');

        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['a'],
                $row['b'],
                $row['c'],
                $row['d']
            ));
        }

        return true;
    }
    return false;
}

function SaveBookmarkViewsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM bookmarkViews");
    if ($selectResults) {
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS bookmarkViews;';
        $dbh->exec($command);

        $command = 'CREATE TABLE bookmarkViews(
    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
    a TEXT,
    b TEXT,
    c TEXT,
    d TEXT)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare('INSERT INTO bookmarkViews(id, a, b, c, d) VALUES(?,?,?,?,?) ');

        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['a'],
                $row['b'],
                $row['c'],
                $row['d']
            ));
        }

        return true;
    }
    return false;
}

function SaveAnnotationsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM annotations");
    if ($selectResults) {
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS annotations;';
        $dbh->exec($command);

        $command = 'CREATE TABLE annotations(
          id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
          a TEXT,
          b TEXT,
          c TEXT,
          d TEXT)';
        $dbh->exec($command);


        $insertStmt = $dbh->prepare('INSERT INTO annotations(id, a, b, c, d) VALUES(?,?,?,?,?) ');

        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['a'],
                $row['b'],
                $row['c'],
                $row['d']
            ));
        }

        return true;
    }


    return false;
}

function SaveAllComponentsFromTemp($tempDbh, $dbh, $table)
{
    $selectResults = $tempDbh->query("SELECT * FROM $table");
    if ($selectResults) {
        $command = 'DROP TABLE IF EXISTS ' . $table . ';';
        $dbh->exec($command);


        $command = 'CREATE TABLE ' . $table . '(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            value TEXT NOT NULL)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare('INSERT INTO ' . $table . '(id, value) VALUES(?,?) ');

        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['value']
            ));
        }


        return true;
    }
    return false;
}

function SaveHighlightPropertyTemplatesFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM highlightPropertyTemplates");
    if ($selectResults) {
        $command = 'DROP TABLE IF EXISTS highlightPropertyTemplates;';
        $dbh->exec($command);

        $command = 'CREATE TABLE highlightPropertyTemplates(
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        value TEXT NOT NULL)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare('INSERT INTO highlightPropertyTemplates(id, value) VALUES(?,?) ');

        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['value']
            ));
        }


        return true;
    }
    return false;
}  

function SavePropertyGroupsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM propertyGroups");
    if ($selectResults) {
        $command = 'DROP TABLE IF EXISTS propertyGroups;';
        $dbh->exec($command);

        $command = 'CREATE TABLE propertyGroups(
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        value TEXT NOT NULL)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare('INSERT INTO propertyGroups(id, value) VALUES(?,?) ');

        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['value']
            ));
        }


        return true;
    }
    return false;
}  

/* 
    Save check statistics
*/
function  SaveCheckStatisticsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM CheckStatistics");
    if ($selectResults) {

        $command = 'DROP TABLE IF EXISTS CheckStatistics;';
        $dbh->exec($command);

        $command = 'CREATE TABLE IF NOT EXISTS CheckStatistics(
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        comparisonOK TEXT ,
        comparisonError TEXT ,
        comparisonWarning TEXT ,
        comparisonNoMatch TEXT ,
        comparisonUndefined TEXT ,
        comparisonCheckGroupsInfo TEXT ,
        sourceAComplianceOK TEXT ,
        sourceAComplianceError TEXT ,
        sourceAComplianceWarning TEXT ,
        sourceAComplianceCheckGroupsInfo TEXT ,
        sourceBComplianceOK TEXT ,
        sourceBComplianceError TEXT ,
        sourceBComplianceWarning TEXT ,
        sourceBComplianceCheckGroupsInfo TEXT )';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO CheckStatistics(id,
        comparisonOK, 
        comparisonError, 
        comparisonWarning, 
        comparisonNoMatch,
        comparisonUndefined,
        comparisonCheckGroupsInfo, 
        sourceAComplianceOK, 
        sourceAComplianceError, 
        sourceAComplianceWarning, 
        sourceAComplianceCheckGroupsInfo,
        sourceBComplianceOK, 
        sourceBComplianceError, 
        sourceBComplianceWarning, 
        sourceBComplianceCheckGroupsInfo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['comparisonOK'],
                $row['comparisonError'],
                $row['comparisonWarning'],
                $row['comparisonNoMatch'],
                $row['comparisonUndefined'],
                $row['comparisonCheckGroupsInfo'],
                $row['sourceAComplianceOK'],
                $row['sourceAComplianceError'],
                $row['sourceAComplianceWarning'],
                $row['sourceAComplianceCheckGroupsInfo'],
                $row['sourceBComplianceOK'],
                $row['sourceBComplianceError'],
                $row['sourceBComplianceWarning'],
                $row['sourceBComplianceCheckGroupsInfo']
            ));
        }


        return true;
    }

    return false;
}

function  SaveCheckStatistics($tempDbh, $dbh)
{

    $comparisonOK = NULL;
    $comparisonError = NULL;
    $comparisonWarning = NULL;
    $comparisonNoMatch = NULL;
    $comparisonUndefined = NULL;
    $comparisonCheckGroupsInfo = NULL;

    $comparisonResults = $tempDbh->query("SELECT * FROM ComparisonCheckStatistics");
    if ($comparisonResults) {
        while ($row = $comparisonResults->fetch(\PDO::FETCH_ASSOC)) {
            $comparisonOK = $row['comparisonOK'];
            $comparisonError = $row['comparisonError'];
            $comparisonWarning = $row['comparisonWarning'];
            $comparisonNoMatch = $row['comparisonNoMatch'];
            $comparisonUndefined = $row['comparisonUndefined'];
            $comparisonCheckGroupsInfo = $row['comparisonCheckGroupsInfo'];
            break;
        }
    }

    $sourceAComplianceOK  = NULL;
    $sourceAComplianceError  = NULL;
    $sourceAComplianceWarning  = NULL;
    $sourceAComplianceCheckGroupsInfo  = NULL;
    $sourceAComplianceResults = $tempDbh->query("SELECT * FROM SourceAComplianceCheckStatistics");
    if ($sourceAComplianceResults) {
        while ($row = $sourceAComplianceResults->fetch(\PDO::FETCH_ASSOC)) {
            $sourceAComplianceOK = $row['sourceAComplianceOK'];
            $sourceAComplianceError = $row['sourceAComplianceError'];
            $sourceAComplianceWarning = $row['sourceAComplianceWarning'];
            $sourceAComplianceCheckGroupsInfo = $row['sourceAComplianceCheckGroupsInfo'];

            break;
        }
    }

    $sourceBComplianceOK  = NULL;
    $sourceBComplianceError  = NULL;
    $sourceBComplianceWarning  = NULL;
    $sourceBComplianceCheckGroupsInfo  = NULL;
    $sourceBComplianceResults = $tempDbh->query("SELECT * FROM SourceBComplianceCheckStatistics");
    if ($sourceBComplianceResults) {
        while ($row = $sourceBComplianceResults->fetch(\PDO::FETCH_ASSOC)) {
            $sourceBComplianceOK = $row['sourceBComplianceOK'];
            $sourceBComplianceError = $row['sourceBComplianceError'];
            $sourceBComplianceWarning = $row['sourceBComplianceWarning'];
            $sourceBComplianceCheckGroupsInfo = $row['sourceBComplianceCheckGroupsInfo'];

            break;
        }
    }


    if (
        $comparisonResults ||
        $sourceAComplianceResults ||
        $sourceBComplianceResults
    ) {


        $command = 'CREATE TABLE IF NOT EXISTS CheckStatistics(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            comparisonOK TEXT ,
            comparisonError TEXT ,
            comparisonWarning TEXT ,
            comparisonNoMatch TEXT ,
            comparisonUndefined TEXT ,
            comparisonCheckGroupsInfo TEXT ,
            sourceAComplianceOK TEXT ,
            sourceAComplianceError TEXT ,
            sourceAComplianceWarning TEXT ,
            sourceAComplianceCheckGroupsInfo TEXT ,
            sourceBComplianceOK TEXT ,
            sourceBComplianceError TEXT ,
            sourceBComplianceWarning TEXT ,
            sourceBComplianceCheckGroupsInfo TEXT )';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO CheckStatistics(comparisonOK, comparisonError, comparisonWarning, comparisonNoMatch,
        comparisonUndefined,comparisonCheckGroupsInfo, sourceAComplianceOK, sourceAComplianceError, sourceAComplianceWarning, sourceAComplianceCheckGroupsInfo,
        sourceBComplianceOK, sourceBComplianceError, sourceBComplianceWarning, sourceBComplianceCheckGroupsInfo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $insertStmt->execute(array(
            $comparisonOK,
            $comparisonError,
            $comparisonWarning,
            $comparisonNoMatch,
            $comparisonUndefined,
            $comparisonCheckGroupsInfo,
            $sourceAComplianceOK,
            $sourceAComplianceError,
            $sourceAComplianceWarning,
            $sourceAComplianceCheckGroupsInfo,
            $sourceBComplianceOK,
            $sourceBComplianceError,
            $sourceBComplianceWarning,
            $sourceBComplianceCheckGroupsInfo
        ));

        return true;
    }

    return false;
}

function SaveSourceDComplianceCheckGroupsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceDComplianceCheckGroups");

    $command = 'DROP TABLE IF EXISTS SourceDComplianceCheckGroups;';
    $dbh->exec($command);
    if ($selectResults) {
        $command = 'CREATE TABLE SourceDComplianceCheckGroups(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            componentClass TEXT NOT NULL,
            componentCount Integer,
            categoryStatus TEXT NOT NULL)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO SourceDComplianceCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['componentClass'],
                $row['componentCount'],
                $row['categoryStatus']
            ));
        }
    }
}

function SaveSourceDComplianceCheckComponentsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceDComplianceCheckComponents");
    if ($selectResults) {

        $command = 'DROP TABLE IF EXISTS SourceDComplianceCheckComponents;';
        $command = 'CREATE TABLE SourceDComplianceCheckComponents(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT, 
            mainComponentClass TEXT,               
            subComponentClass TEXT,
            status TEXT,
            accepted TEXT,
            nodeId TEXT,
            sourceId TEXT,
            ownerGroup INTEGER NOT NULL)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO SourceDComplianceCheckComponents(id, name, mainComponentClass, subComponentClass, status,
                                    accepted, nodeId, sourceId, ownerGroup) VALUES(?,?,?,?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['mainComponentClass'],
                $row['subComponentClass'],
                $row['status'],
                $row['accepted'],
                $row['nodeId'],
                $row['sourceId'],
                $row['ownerGroup']
            ));
        }
    }
}

function SaveSourceDComplianceCheckPropertiesFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceDComplianceCheckProperties");

    $command = 'DROP TABLE IF EXISTS SourceDComplianceCheckProperties;';
    $dbh->exec($command);
    if ($selectResults) {

        $command = 'CREATE TABLE SourceDComplianceCheckProperties(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,              
            value TEXT,
            result TEXT,
            severity TEXT,
            accepted TEXT,
            performCheck TEXT,
            description TEXT,
            ownerComponent INTEGER NOT NULL,
            rule TEXT)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO SourceDComplianceCheckProperties(id, name, value, result,
                                    severity, accepted, performCheck, description, ownerComponent, rule) VALUES(?,?,?,?,?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['value'],
                $row['result'],
                $row['severity'],
                $row['accepted'],
                $row['performCheck'],
                $row['description'],
                $row['ownerComponent'],
                $row['rule']
            ));
        }
    }
}

function SaveSourceCComplianceCheckGroupsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceCComplianceCheckGroups");

    $command = 'DROP TABLE IF EXISTS SourceCComplianceCheckGroups;';
    $dbh->exec($command);
    if ($selectResults) {
        $command = 'CREATE TABLE SourceCComplianceCheckGroups(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            componentClass TEXT NOT NULL,
            componentCount Integer,
            categoryStatus TEXT NOT NULL)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO SourceCComplianceCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['componentClass'],
                $row['componentCount'],
                $row['categoryStatus']
            ));
        }
    }
}

function SaveSourceCComplianceCheckComponentsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceCComplianceCheckComponents");

    $command = 'DROP TABLE IF EXISTS SourceCComplianceCheckComponents;';
    $dbh->exec($command);

    if ($selectResults) {
        $command = 'CREATE TABLE SourceCComplianceCheckComponents(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,
            mainComponentClass TEXT,                
            subComponentClass TEXT,
            status TEXT,
            accepted TEXT,
            nodeId TEXT,
            sourceId TEXT,
            ownerGroup INTEGER NOT NULL)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO SourceCComplianceCheckComponents(id, name, mainComponentClass, subComponentClass, status,
                                    accepted, nodeId, sourceId, ownerGroup) VALUES(?,?,?,?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['mainComponentClass'],
                $row['subComponentClass'],
                $row['status'],
                $row['accepted'],
                $row['nodeId'],
                $row['sourceId'],
                $row['ownerGroup']
            ));
        }
    }
}

function SaveSourceCComplianceCheckPropertiesFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceCComplianceCheckProperties");

    $command = 'DROP TABLE IF EXISTS SourceCComplianceCheckProperties;';
    $dbh->exec($command);
    if ($selectResults) {
        $command = 'CREATE TABLE SourceCComplianceCheckProperties(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,              
            value TEXT,
            result TEXT,
            severity TEXT,
            accepted TEXT,
            performCheck TEXT,
            description TEXT,
            ownerComponent INTEGER NOT NULL,
            rule TEXT)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO SourceCComplianceCheckProperties(id, name, value, result,
                                    severity, accepted, performCheck, description, ownerComponent, rule) VALUES(?,?,?,?,?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['value'],
                $row['result'],
                $row['severity'],
                $row['accepted'],
                $row['performCheck'],
                $row['description'],
                $row['ownerComponent'],
                $row['rule']
            ));
        }
    }
}

function SaveSourceBComplianceCheckGroupsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceBComplianceCheckGroups");

    $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckGroups;';
    $dbh->exec($command);
    if ($selectResults) {
        $command = 'CREATE TABLE SourceBComplianceCheckGroups(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            componentClass TEXT NOT NULL,
            componentCount Integer,
            categoryStatus TEXT NOT NULL)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO SourceBComplianceCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['componentClass'],
                $row['componentCount'],
                $row['categoryStatus']
            ));
        }
    }
}

function SaveSourceBComplianceCheckComponentsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceBComplianceCheckComponents");

    $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckComponents;';
    $dbh->exec($command);
    if ($selectResults) {

        $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckComponents;';
        $dbh->exec($command);

        $command = 'CREATE TABLE SourceBComplianceCheckComponents(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,       
            mainComponentClass TEXT,         
            subComponentClass TEXT,
            status TEXT,
            accepted TEXT,
            nodeId TEXT,
            sourceId TEXT,
            ownerGroup INTEGER NOT NULL)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO SourceBComplianceCheckComponents(id, name, mainComponentClass, subComponentClass, status,
                                    accepted, nodeId, sourceId, ownerGroup) VALUES(?,?,?,?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['mainComponentClass'],
                $row['subComponentClass'],
                $row['status'],
                $row['accepted'],
                $row['nodeId'],
                $row['sourceId'],
                $row['ownerGroup']
            ));
        }
    }
}

function SaveSourceBComplianceCheckPropertiesFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceBComplianceCheckProperties");

    $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckProperties;';
    $dbh->exec($command);
    if ($selectResults) {
        $command = 'CREATE TABLE SourceBComplianceCheckProperties(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,              
            value TEXT,
            result TEXT,
            severity TEXT,
            accepted TEXT,
            performCheck TEXT,
            description TEXT,
            ownerComponent INTEGER NOT NULL,
            rule TEXT)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO SourceBComplianceCheckProperties(id, name, value, result,
                                    severity, accepted, performCheck, description, ownerComponent, rule) VALUES(?,?,?,?,?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['value'],
                $row['result'],
                $row['severity'],
                $row['accepted'],
                $row['performCheck'],
                $row['description'],
                $row['ownerComponent'],
                $row['rule']
            ));
        }
    }
}

function SaveSourceAComplianceCheckGroupsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceAComplianceCheckGroups");

    $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckGroups;';
    $dbh->exec($command);

    if ($selectResults) {
        $command = 'CREATE TABLE SourceAComplianceCheckGroups(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            componentClass TEXT NOT NULL,
            componentCount Integer,
            categoryStatus TEXT NOT NULL)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO SourceAComplianceCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?, ?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['componentClass'],
                $row['componentCount'],
                $row['categoryStatus']
            ));
        }
    }
}

function SaveSourceAComplianceCheckComponentsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceAComplianceCheckComponents");

    $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckComponents;';
    $dbh->exec($command);

    if ($selectResults) {

        $command = 'CREATE TABLE SourceAComplianceCheckComponents(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT, 
            mainComponentClass TEXT,               
            subComponentClass TEXT,
            status TEXT,
            accepted TEXT,
            nodeId TEXT,
            sourceId TEXT,
            ownerGroup INTEGER NOT NULL)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO SourceAComplianceCheckComponents(id, name, mainComponentClass, subComponentClass, status,
                                    accepted, nodeId, sourceId, ownerGroup) VALUES(?,?,?,?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['mainComponentClass'],
                $row['subComponentClass'],
                $row['status'],
                $row['accepted'],
                $row['nodeId'],
                $row['sourceId'],
                $row['ownerGroup']
            ));
        }
    }
}

function SaveSourceAComplianceCheckPropertiesFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceAComplianceCheckProperties");

    $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckProperties;';
    $dbh->exec($command);
    if ($selectResults) {

        $command = 'CREATE TABLE SourceAComplianceCheckProperties(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,              
            value TEXT,
            result TEXT,
            severity TEXT,
            accepted TEXT,
            performCheck TEXT,
            description TEXT,
            ownerComponent INTEGER NOT NULL,
            rule TEXT)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO SourceAComplianceCheckProperties(id, name, value, result,
                                    severity, accepted, performCheck, description, ownerComponent, rule) VALUES(?,?,?,?,?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['value'],
                $row['result'],
                $row['severity'],
                $row['accepted'],
                $row['performCheck'],
                $row['description'],
                $row['ownerComponent'],
                $row['rule']
            ));
        }
    }
}

/*
|
|   write selected components
|
*/
function SaveSelectedComponentsFromTemp($tempDbh, $dbh, $tableName)
{
    $selectResults = $tempDbh->query("SELECT * FROM " . $tableName . ";");
    if ($selectResults) {
        // create table
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS ' . $tableName . ';';
        $dbh->exec($command);

        $command = 'CREATE TABLE ' . $tableName . '(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT NOT NULL,
            mainClass,
            subClass,
            nodeId INTEGER,
            mainComponentId INTEGER,
            componentId INTEGER
            )';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO " . $tableName . "(id, name, mainClass, subClass, 
                      nodeId, mainComponentId, componentId) VALUES(?,?,?,?,?,?,?)");


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['name'],
                $row['mainClass'],
                $row['subClass'],
                $row['nodeId'],
                $row['mainComponentId'],
                $row['componentId']
            ));
        }
    }
}

function SaveHighlightPropertyTemplates($dbh)
{
    if (!isset($_POST['highlightPropertyTemplates'])) {
        return false;
    }

    try {

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS highlightPropertyTemplates;';
        $dbh->exec($command);

        $command = 'CREATE TABLE highlightPropertyTemplates(
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        value TEXT NOT NULL)';
        $dbh->exec($command);

        $insertQuery = 'INSERT INTO highlightPropertyTemplates(value) VALUES(?) ';
        $values = array($_POST['highlightPropertyTemplates']);

        $stmt = $dbh->prepare($insertQuery);
        $stmt->execute($values);
    } catch (Exception $e) {
        return false;
    }

    return true;
}

function SavePropertyGroups($dbh)
{
    if (!isset($_POST['propertyGroups'])) {
        return false;
    }

    try {

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS propertyGroups;';
        $dbh->exec($command);

        $command = 'CREATE TABLE propertyGroups(
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        value TEXT NOT NULL)';
        $dbh->exec($command);

        $insertQuery = 'INSERT INTO propertyGroups(value) VALUES(?) ';
        $values = array($_POST['propertyGroups']);

        $stmt = $dbh->prepare($insertQuery);
        $stmt->execute($values);
    } catch (Exception $e) {
        return false;
    }

    return true;
}

function SaveAllComponents($dbh)
{
    if (!isset($_POST['allComponents'])) {
        return false;
    }

    try {
        $allComponents = json_decode($_POST['allComponents'], true);
        foreach ($allComponents as $table => $components) {

            // drop table if exists
            $command = 'DROP TABLE IF EXISTS ' . $table . ';';
            $dbh->exec($command);

            $command = 'CREATE TABLE ' . $table . '(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    value TEXT NOT NULL)';
            $dbh->exec($command);

            $insertQuery = 'INSERT INTO ' .  $table . '(value) VALUES(?) ';
            $values = array(json_encode($components));

            $stmt = $dbh->prepare($insertQuery);
            $stmt->execute($values);
        }
    } catch (Exception $e) {
        return false;
    }

    return true;
}


function SaveSelectedComponents($dbh)
{
    if (!isset($_POST['selectedComponents'])) {
        return false;
    }

    try {

        // $selectedComponentsTable = $_POST['selectedComponentsTableName'];       
        $selectedComponentsObject = json_decode($_POST['selectedComponents'], true);
        foreach ($selectedComponentsObject as $selectedComponentsTable => $componentsList) {
            if (!array_key_exists("selectedCompoents", $componentsList)) {
                continue;
            }

            $nodeIdvsComponentIdList = NULL;
            if (array_key_exists("nodeIdvsComponentIdList", $componentsList)) {
                $nodeIdvsComponentIdList = $componentsList['nodeIdvsComponentIdList'];
            }

            $selectedComponents = $componentsList['selectedCompoents'];


            // create selected components table

            // drop table if exists
            $command = 'DROP TABLE IF EXISTS ' . $selectedComponentsTable . ';';
            $dbh->exec($command);

            $command = 'CREATE TABLE ' . $selectedComponentsTable . '(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    name TEXT NOT NULL,
                    mainClass TEXT,
                    subClass TEXT,
                    nodeId INTEGER,
                    mainComponentId INTEGER,
                    componentId INTEGER
                    )';
            $dbh->exec($command);

            for ($index = 0; $index < count($selectedComponents); $index++) {
                $selectedComponent = $selectedComponents[$index];


                $name = $selectedComponent['Name'];
                $mainClass =  $selectedComponent['MainComponentClass'];
                $subClass = $selectedComponent['ComponentClass'];
                $nodeId = null;
                $componentId = null;
                if (isset($selectedComponent['NodeId'])) {
                    $nodeIdStr = $selectedComponent['NodeId'];
                    if (is_numeric($nodeIdStr))
                        $nodeId = (int) $nodeIdStr;
                    else
                        $nodeId = $nodeIdStr;
                }

                if (isset($selectedComponent['ComponentId'])) {
                    $componentId = (int) $selectedComponent['ComponentId'];
                }

                $mainCompId = null;
                if (
                    $nodeId !== NULL &&
                    $nodeIdvsComponentIdList &&
                    isset($nodeIdvsComponentIdList[$nodeId])
                ) {
                    $mainCompId = (int) $nodeIdvsComponentIdList[$nodeId];
                }

                $insertQuery = 'INSERT INTO ' .  $selectedComponentsTable . '(name, mainClass, subClass, nodeId, mainComponentId, componentId) VALUES(?,?,?,?,?,?) ';
                $values = array($name,  $mainClass, $subClass,  $nodeId, $mainCompId, $componentId);

                $stmt = $dbh->prepare($insertQuery);
                $stmt->execute($values);
            }
        }
    } catch (Exception $e) {
        return false;
    }

    return true;
    
}

/*
|
|   write data sources info
|
*/
function SaveDataSourceInfoFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM DatasourceInfo;");
    if ($selectResults) {

        $command = 'DROP TABLE IF EXISTS DatasourceInfo;';
        $dbh->exec($command);

        $command = 'CREATE TABLE DatasourceInfo(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            sourceAFileName TEXT,
            sourceBFileName TEXT,
            sourceCFileName TEXT,
            sourceDFileName TEXT,
            sourceAType TEXT,
            sourceBType TEXT,
            sourceCType TEXT,
            sourceDType TEXT,
            orderMaintained Text)';
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO DatasourceInfo(id, 
        sourceAFileName, 
        sourceBFileName, 
        sourceCFileName, 
        sourceDFileName,
        sourceAType,
        sourceBType, 
        sourceCType, 
        sourceDType, 
        orderMaintained) VALUES(?,?,?,?,?,?,?,?,?,?)");

        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
            $insertStmt->execute(array(
                $row['id'],
                $row['sourceAFileName'],
                $row['sourceBFileName'],
                $row['sourceCFileName'],
                $row['sourceDFileName'],
                $row['sourceAType'],
                $row['sourceBType'],
                $row['sourceCType'],
                $row['sourceDType'],
                $row['orderMaintained']
            ));
        }
    }
}

function SaveDatasourceInfo($dbh)
{

    if (!isset($_POST["dataSourceInfo"])) {
        return false;
    }

    $dataSourceInfo = json_decode($_POST['dataSourceInfo'], true);

    $sourceAName  = NULL;
    $sourceBName  = NULL;
    $sourceCName  = NULL;
    $sourceDName  = NULL;
    $sourceAType  = NULL;
    $sourceBType  = NULL;
    $sourceCType  = NULL;
    $sourceDType  = NULL;
    $orderMaintained  = 'true';

    if (array_key_exists("SourceAFileName", $dataSourceInfo)) {
        $sourceAName =  $dataSourceInfo['SourceAFileName'];
    }
    if (array_key_exists("SourceBFileName", $dataSourceInfo)) {
        $sourceBName =  $dataSourceInfo['SourceBFileName'];
    }
    if (array_key_exists("SourceCFileName", $dataSourceInfo)) {
        $sourceCName =  $dataSourceInfo['SourceCFileName'];
    }
    if (array_key_exists("SourceDFileName", $dataSourceInfo)) {
        $sourceDName =  $dataSourceInfo['SourceDFileName'];
    }

    if (array_key_exists("SourceAType", $dataSourceInfo)) {
        $sourceAType =  $dataSourceInfo['SourceAType'];
    }
    if (array_key_exists("SourceBType", $dataSourceInfo)) {
        $sourceBType =  $dataSourceInfo['SourceBType'];
    }
    if (array_key_exists("SourceCType", $dataSourceInfo)) {
        $sourceCType =  $dataSourceInfo['SourceCType'];
    }
    if (array_key_exists("SourceDType", $dataSourceInfo)) {
        $sourceDType =  $dataSourceInfo['SourceDType'];
    }

    if (array_key_exists("orderMaintained", $dataSourceInfo)) {
        $orderMaintained  = $dataSourceInfo['orderMaintained'];
    }

    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];

    //  $dbh;
    try {
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS DatasourceInfo;';
        $dbh->exec($command);

        $command = 'CREATE TABLE DatasourceInfo(
             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
             sourceAFileName TEXT,
             sourceBFileName TEXT,
             sourceCFileName TEXT,
             sourceDFileName TEXT,
             sourceAType TEXT,
             sourceBType TEXT,
             sourceCType TEXT,
             sourceDType TEXT,
             orderMaintained Text)';
        $dbh->exec($command);

        $insertQuery = 'INSERT INTO DatasourceInfo(sourceAFileName, 
         sourceBFileName, 
         sourceCFileName, 
         sourceDFileName, 
         sourceAType, 
         sourceBType, 
         sourceCType, 
         sourceDType, 
         orderMaintained) VALUES(?,?,?,?,?,?,?,?,?) ';
        $values = array(
            $sourceAName,
            $sourceBName,
            $sourceCName,
            $sourceDName,
            $sourceAType,
            $sourceBType,
            $sourceCType,
            $sourceDType,
            $orderMaintained
        );

        $stmt = $dbh->prepare($insertQuery);
        $stmt->execute($values);
    } catch (Exception $e) {
        return false;
    }

    return true;
}


function SaveMarkupViews($dbh)
{
    if (!isset($_POST["markupViews"])) {
        return false;
    }

    $markupViews = json_decode($_POST['markupViews'], true);

    $sourceAViews  = NULL;
    $sourceBViews  = NULL;
    $sourceCViews  = NULL;
    $sourceDViews  = NULL;

    if (array_key_exists("a", $markupViews)) {
        $sourceAViews =  json_encode($markupViews['a']);
    }
    if (array_key_exists("b", $markupViews)) {
        $sourceBViews =  json_encode($markupViews['b']);
    }
    if (array_key_exists("c", $markupViews)) {
        $sourceCViews =  json_encode($markupViews['c']);
    }
    if (array_key_exists("d", $markupViews)) {
        $sourceDViews =  json_encode($markupViews['d']);
    }
    
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];

    //  $dbh;
    try {
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS markupViews;';
        $dbh->exec($command);

        $command = 'CREATE TABLE markupViews(
             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
             a TEXT,
             b TEXT,
             c TEXT,
             d TEXT)';
        $dbh->exec($command);

        $insertQuery = 'INSERT INTO markupViews(a, 
         b, 
         c, 
         d) VALUES(?,?,?,?) ';
        $values = array(
            $sourceAViews,
            $sourceBViews,
            $sourceCViews,
            $sourceDViews
        );

        $stmt = $dbh->prepare($insertQuery);
        $stmt->execute($values);
    } catch (Exception $e) {
        return false;
    }

    return true;
}

function SaveBookmarkViews($dbh)
{
    if (!isset($_POST["bookmarkViews"])) {
        return false;
    }

    $bookmarkViews = json_decode($_POST['bookmarkViews'], true);

    $sourceAViews  = NULL;
    $sourceBViews  = NULL;
    $sourceCViews  = NULL;
    $sourceDViews  = NULL;

    if (array_key_exists("a", $bookmarkViews)) {
        $sourceAViews =  json_encode($bookmarkViews['a']);
    }
    if (array_key_exists("b", $bookmarkViews)) {
        $sourceBViews =  json_encode($bookmarkViews['b']);
    }
    if (array_key_exists("c", $bookmarkViews)) {
        $sourceCViews =  json_encode($bookmarkViews['c']);
    }
    if (array_key_exists("d", $bookmarkViews)) {
        $sourceDViews =  json_encode($bookmarkViews['d']);
    }
    
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];

    //  $dbh;
    try {
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS bookmarkViews;';
        $dbh->exec($command);

        $command = 'CREATE TABLE bookmarkViews(
             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
             a TEXT,
             b TEXT,
             c TEXT,
             d TEXT)';
        $dbh->exec($command);

        $insertQuery = 'INSERT INTO bookmarkViews(a, 
         b, 
         c, 
         d) VALUES(?,?,?,?) ';
        $values = array(
            $sourceAViews,
            $sourceBViews,
            $sourceCViews,
            $sourceDViews
        );

        $stmt = $dbh->prepare($insertQuery);
        $stmt->execute($values);
    } catch (Exception $e) {
        return false;
    }

    return true;
}

function SaveAnnotations($dbh)
{
    if (!isset($_POST["annotations"])) {
        return false;
    }

    $annotations = json_decode($_POST['annotations'], true);

    $sourceAannotations  = NULL;
    $sourceBannotations  = NULL;
    $sourceCannotations  = NULL;
    $sourceDannotations  = NULL;

    if (array_key_exists("a", $annotations)) {
        $sourceAannotations =  json_encode($annotations['a']);
    }
    if (array_key_exists("b", $annotations)) {
        $sourceBannotations =  json_encode($annotations['b']);
    }
    if (array_key_exists("c", $annotations)) {
        $sourceCannotations =  json_encode($annotations['c']);
    }
    if (array_key_exists("d", $annotations)) {
        $sourceDannotations =  json_encode($annotations['d']);
    }
    
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];

    //  $dbh;
    try {
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS annotations;';
        $dbh->exec($command);

        $command = 'CREATE TABLE annotations(
             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
             a TEXT,
             b TEXT,
             c TEXT,
             d TEXT)';
        $dbh->exec($command);

        $insertQuery = 'INSERT INTO annotations(a, 
         b, 
         c, 
         d) VALUES(?,?,?,?) ';
        $values = array(
            $sourceAannotations,
            $sourceBannotations,
            $sourceCannotations,
            $sourceDannotations
        );

        $stmt = $dbh->prepare($insertQuery);
        $stmt->execute($values);
    } catch (Exception $e) {
        return false;
    }

    return true;

}


/*
|
|   write check module controls state
|
*/
function SaveCheckModuleControlsStateFromTemp($tempDbh, $dbh)
{
    try {
        $selectResults = $tempDbh->query("SELECT * FROM CheckModuleControlsState;");
        if ($selectResults) {

            $command = 'DROP TABLE IF EXISTS CheckModuleControlsState;';
            $dbh->exec($command);

            $command = 'CREATE TABLE CheckModuleControlsState(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                comparisonSwith TEXT,
                sourceAComplianceSwitch TEXT,
                sourceBComplianceSwitch TEXT,
                sourceCComplianceSwitch TEXT,
                sourceDComplianceSwitch TEXT,
                selectedDataSetTab TEXT,
                selectedCheckCase TEXT)';
            $dbh->exec($command);

            $insertStmt = $dbh->prepare("INSERT INTO CheckModuleControlsState(id, 
            comparisonSwith, 
            sourceAComplianceSwitch, 
            sourceBComplianceSwitch, 
            sourceCComplianceSwitch,
            sourceDComplianceSwitch,
            selectedDataSetTab,
            selectedCheckCase) VALUES(?,?,?,?,?,?,?,?)");

            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
                $insertStmt->execute(array(
                    $row['id'],
                    $row['comparisonSwith'],
                    $row['sourceAComplianceSwitch'],
                    $row['sourceBComplianceSwitch'],
                    $row['sourceCComplianceSwitch'],
                    $row['sourceDComplianceSwitch'],
                    $row['selectedDataSetTab'],
                    $row['selectedCheckCase']
                ));
            }
        }
    } catch (Exception $e) {
        return false;
    }

    return true;
}

function SaveCheckModuleControlsState($dbh)
{

    if (!isset($_POST["checkModuleControlState"])) {
        return false;
    }

    $checkModuleControlState = json_decode($_POST['checkModuleControlState'], true);

    // if(!isset($_POST["comparisonSwithOn"]) ||
    // !isset($_POST["sourceAComplianceSwitchOn"]) ||
    // !isset($_POST["sourceBComplianceSwitchOn"]) ||
    // !isset($_POST["sourceCComplianceSwitchOn"]) ||
    // !isset($_POST["sourceDComplianceSwitchOn"]) ||
    // !isset($_POST["selectedDataSetTab"]) ||
    // !isset($_POST["selectedCheckCase"]))
    // {
    //      echo "fail"; 
    //      return;
    // }

    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
    // $dbh;
    try {
        //  // open database
        //  $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
        //  $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

        //  // begin the transaction
        //  $dbh->beginTransaction();

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS CheckModuleControlsState;';
        $dbh->exec($command);

        $command = 'CREATE TABLE CheckModuleControlsState(
             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
             comparisonSwith TEXT,
             sourceAComplianceSwitch TEXT,
             sourceBComplianceSwitch TEXT,
             sourceCComplianceSwitch TEXT,
             sourceDComplianceSwitch TEXT,
             selectedDataSetTab TEXT,
             selectedCheckCase TEXT)';
        $dbh->exec($command);

        $insertQuery = 'INSERT INTO CheckModuleControlsState(comparisonSwith, 
         sourceAComplianceSwitch, 
         sourceBComplianceSwitch, 
         sourceCComplianceSwitch, 
         sourceDComplianceSwitch, 
         selectedDataSetTab, 
         selectedCheckCase) VALUES(?,?,?,?,?,?,?) ';
        $values = array(
            $checkModuleControlState["comparisonSwithOn"],
            $checkModuleControlState["sourceAComplianceSwitchOn"],
            $checkModuleControlState["sourceBComplianceSwitchOn"],
            $checkModuleControlState["sourceCComplianceSwitchOn"],
            $checkModuleControlState["sourceDComplianceSwitchOn"],
            $checkModuleControlState["selectedDataSetTab"],
            $checkModuleControlState["selectedCheckCase"]
        );

        $stmt = $dbh->prepare($insertQuery);
        $stmt->execute($values);

        //  // commit update
        //  $dbh->commit();
        //  $dbh = null; //This is how you close a PDO connection                 
    } catch (Exception $e) {
        //  echo "fail"; 
        return false;
    }

    return true;
}

/*
|
|   write check case data(as JSON string)     
|
*/
function SaveCheckCaseData()
{
    if (!isset($_POST['CheckCaseManager'])) {
        echo 'fail';
        return;
    }
    $checkCaseData =  $_POST['CheckCaseManager'];

    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];

    $dbh;
    try {
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        // create CheckCaseInfo table

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS CheckCaseInfo;';
        $dbh->exec($command);

        $command = 'CREATE TABLE CheckCaseInfo(id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, checkCaseData TEXT)';
        $dbh->exec($command);

        $insertQuery = 'INSERT INTO CheckCaseInfo(checkCaseData) VALUES(?) ';
        $values = array($checkCaseData);

        $stmt = $dbh->prepare($insertQuery);
        $stmt->execute($values);

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection                 
    } catch (Exception $e) {
        echo "fail";
        return;
    }
}

/*
|
|   Deletes all tables which store comparison check results
|
*/
function DeleteComparisonResults()
{
    // get project name
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
    $dbh;
    try {
        // open database
        $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS ComparisonCheckComponents;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS ComparisonCheckGroups;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS ComparisonCheckProperties;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceANotSelectedComponents;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceBNotSelectedComponents;';
        $dbh->exec($command);

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection    
    } catch (Exception $e) {
        return "fail";
    }

    return "success";
}

/*
|
|   Deletes all tables which store source A compliance check results
|
*/
function DeleteSourceAComplianceResults()
{
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
    $dbh;
    try {
        // open database
        $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckComponents;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckGroups;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckProperties;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceAComplianceNotCheckedComponents;';
        $dbh->exec($command);

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection    
    } catch (Exception $e) {
        return "fail";
    }

    return "success";
}

/*
|
|   Deletes all tables which store source B compliance check results
|
*/
function DeleteSourceBComplianceResults()
{
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];

    $dbh;
    try {
        // open database
        $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckComponents;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckGroups;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckProperties;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceBComplianceNotCheckedComponents;';
        $dbh->exec($command);

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection    
    } catch (Exception $e) {
        return "fail";
    }

    return "success";
}

/*
|
|   Deletes all tables which store source C compliance check results
|
*/
function DeleteSourceCComplianceResults()
{
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];

    $dbh;
    try {
        // open database
        $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceCComplianceCheckComponents;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceCComplianceCheckGroups;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceCComplianceCheckProperties;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceCComplianceNotCheckedComponents;';
        $dbh->exec($command);

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection    
    } catch (Exception $e) {
        return "fail";
    }

    return "success";
}

/*
|
|   Deletes all tables which store source D compliance check results
|
*/
function DeleteSourceDComplianceResults()
{
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];

    $dbh;
    try {
        // open database
        $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceDComplianceCheckComponents;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceDComplianceCheckGroups;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceDComplianceCheckProperties;';
        $dbh->exec($command);

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceDComplianceNotCheckedComponents;';
        $dbh->exec($command);

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection    
    } catch (Exception $e) {
        return "fail";
    }

    return "success";
}

function ReadCheckModuleControlsState()
{
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
    $dbh;
    try {
        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        if (!CheckIfFileExists($dbPath)) {
            echo 'fail';
            return;
        }

        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        $results = $dbh->query("SELECT *FROM  CheckModuleControlsState;");

        $checkModuleControlsState = array();
        if ($results) {
            while ($record = $results->fetch(\PDO::FETCH_ASSOC)) {
                $checkModuleControlsState = array(
                    'comparisonSwith' => $record['comparisonSwith'],
                    'sourceAComplianceSwitch' => $record['sourceAComplianceSwitch'],
                    'sourceBComplianceSwitch' => $record['sourceBComplianceSwitch'],
                    'sourceCComplianceSwitch' => $record['sourceCComplianceSwitch'],
                    'sourceDComplianceSwitch' => $record['sourceDComplianceSwitch'],
                    'selectedDataSetTab' => $record['selectedDataSetTab'],
                    'selectedCheckCase' => $record['selectedCheckCase']
                );
                break;
            }
        }

        echo json_encode($checkModuleControlsState);

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection    
    } catch (Exception $e) {
        echo "Fail";
        return;
    }
}

function ReadSelectedComponents()
{
    if (!isset($_POST['source'])) {
        echo "fail";
        return;
    }
    $source = $_POST['source'];

    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
    $dbh;
    try {
        // open database
        $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        // begin the transaction
        $dbh->beginTransaction();

        $table;
        if (strtolower($source) === 'sourcea') {
            $table = "SourceASelectedComponents";
        } else if (strtolower($source) === 'sourceb') {
            $table = "SourceBSelectedComponents";
        } else if (strtolower($source) === 'sourcec') {
            $table = "SourceCSelectedComponents";
        } else if (strtolower($source) === 'sourced') {
            $table = "SourceDSelectedComponents";
        }

        $selectedComponents = ReadSelectedComponentsFromDB($dbh, $table);
        // // source a selected components
        // $sourceAIdwiseComponents = NULL;
        // $sourceANodeIdwiseComponents = [];
        // if(strtolower($source) === 'sourcea' || strtolower($source) === 'both')
        // {
        //     $results = $dbh->query("SELECT *FROM  SourceASelectedComponents;");     
        //     if($results)
        //     {
        //         while ($component = $results->fetch(\PDO::FETCH_ASSOC)) 
        //         {
        //             $comp = array('id'=>$component['id'], 
        //                         'name'=>$component['name'],  
        //                         'mainClass'=>$component['mainClass'],
        //                         'subClass'=>$component['subClass'],
        //                         'nodeId'=>$component['nodeId'],
        //                         'mainComponentId'=>$component['mainComponentId']);

        //             // id wise components
        //             $sourceAIdwiseComponents[$component['id']] = $comp;                       

        //             if($component['nodeId'] !== NULL)
        //             {                           
        //                 // node id wise components             
        //                 if(array_key_exists($component['nodeId'], $sourceANodeIdwiseComponents))
        //                 {
        //                     array_push($sourceANodeIdwiseComponents[$component['nodeId']], $comp );
        //                 }
        //                 else
        //                 {
        //                     $sourceANodeIdwiseComponents[$component['nodeId']] = array( $comp );
        //                 }


        //                 // $sourceANodeIdwiseComponents[$component['nodeId']] = array('id'=>$component['id'], 
        //                 //                                                     'name'=>$component['name'],  
        //                 //                                                     'mainClass'=>$component['mainClass'],
        //                 //                                                     'subClass'=>$component['subClass'],
        //                 //                                                     'nodeId'=>$component['nodeId'],
        //                 //                                                     'mainComponentId'=>$component['mainComponentId']); 
        //             }
        //             else
        //             {
        //                   // class wise components             
        //                   if(array_key_exists($component['mainClass'], $sourceANodeIdwiseComponents))
        //                   {
        //                       array_push($sourceANodeIdwiseComponents[$component['mainClass']], $comp );
        //                   }
        //                   else
        //                   {
        //                       $sourceANodeIdwiseComponents[$component['mainClass']] = array( $comp );
        //                   }

        //                 //  // class wise components                        
        //                 //  $sourceANodeIdwiseComponents[$component['mainClass']] = array('id'=>$component['id'], 
        //                 //  'name'=>$component['name'],  
        //                 //  'mainClass'=>$component['mainClass'],
        //                 //  'subClass'=>$component['subClass'],
        //                 //  'nodeId'=>$component['nodeId'],
        //                 //  'mainComponentId'=>$component['mainComponentId']); 
        //             }
        //         }    
        //     }
        // }

        // // source b selected components
        // $sourceBIdwiseComponents = [];
        // $sourceBNodeIdwiseComponents = [];
        // if(strtolower($source) === 'sourceb' || strtolower($source) === 'both')
        // {
        //     $results = $dbh->query("SELECT *FROM  SourceBSelectedComponents;");       
        //     if($results)
        //     {
        //         while ($component = $results->fetch(\PDO::FETCH_ASSOC)) 
        //         {
        //             $comp = array('id'=>$component['id'], 
        //                     'name'=>$component['name'],  
        //                     'mainClass'=>$component['mainClass'],
        //                     'subClass'=>$component['subClass'],
        //                     'nodeId'=>$component['nodeId'],
        //                     'mainComponentId'=>$component['mainComponentId']);

        //             // id wise components
        //             $sourceBIdwiseComponents[$component['id']] = $comp;     

        //             if($component['nodeId'] !== NULL)
        //             {
        //                  // node id wise components             
        //                  if(array_key_exists($component['nodeId'], $sourceBNodeIdwiseComponents))
        //                  {
        //                      array_push($sourceBNodeIdwiseComponents[$component['nodeId']], $comp );
        //                  }
        //                  else
        //                  {
        //                      $sourceBNodeIdwiseComponents[$component['nodeId']] = array( $comp );
        //                  }

        //                 // // node id wise components
        //                 // $sourceBNodeIdwiseComponents[$component['nodeId']] = array('id'=>$component['id'], 
        //                 //                                                     'name'=>$component['name'],  
        //                 //                                                     'mainClass'=>$component['mainClass'],
        //                 //                                                     'subClass'=>$component['subClass'],
        //                 //                                                     'nodeId'=>$component['nodeId'],
        //                 //                                                     'mainComponentId'=>$component['mainComponentId']); 
        //             }
        //             else
        //             {
        //                 // class wise components             
        //                 if(array_key_exists($component['mainClass'], $sourceBNodeIdwiseComponents))
        //                 {
        //                     array_push($sourceBNodeIdwiseComponents[$component['mainClass']], $comp );
        //                 }
        //                 else
        //                 {
        //                     $sourceBNodeIdwiseComponents[$component['mainClass']] = array( $comp );
        //                 }


        //                 //  // node id wise components
        //                 //  $sourceBNodeIdwiseComponents[$component['mainClass']] = array('id'=>$component['id'], 
        //                 //                                                                 'name'=>$component['name'],  
        //                 //                                                                 'mainClass'=>$component['mainClass'],
        //                 //                                                                 'subClass'=>$component['subClass'],
        //                 //                                                                 'nodeId'=>$component['nodeId'],
        //                 //                                                                 'mainComponentId'=>$component['mainComponentId']); 
        //             }
        //         }    
        //     }
        // }

        // $selectedComponents =array();

        // if( $sourceAIdwiseComponents !== NULL && 
        //     $sourceANodeIdwiseComponents !== NULL)
        // {
        //     $selectedComponents['SourceAIdwiseSelectedComps'] = $sourceAIdwiseComponents;
        //     $selectedComponents['SourceANodeIdwiseSelectedComps'] = $sourceANodeIdwiseComponents;
        // }

        // if( $sourceBIdwiseComponents !== NULL && 
        //     $sourceBNodeIdwiseComponents !== NULL)
        // {
        //     $selectedComponents['SourceBIDwiseSelectedComps'] = $sourceBIdwiseComponents;
        //     $selectedComponents['SourceBNodeIdwiseSelectedComps'] = $sourceBNodeIdwiseComponents;
        // }

        echo json_encode($selectedComponents);

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection    
    } catch (Exception $e) {
        return "fail";
        //return;
    }
}

function ReadSelectedComponentsFromDB($dbh, $table)
{
    $idwiseComponents = NULL;
    $nodeIdwiseComponents = [];

    $results = $dbh->query("SELECT *FROM  " . $table);
    if ($results) {
        while ($component = $results->fetch(\PDO::FETCH_ASSOC)) {
            $comp = array(
                'id' => $component['id'],
                'name' => $component['name'],
                'mainClass' => $component['mainClass'],
                'subClass' => $component['subClass'],
                'nodeId' => $component['nodeId'],
                'mainComponentId' => $component['mainComponentId'],
                'componentId' => $component['componentId']
            );

            // id wise components
            $idwiseComponents[$component['id']] = $comp;

            if ($component['nodeId'] !== NULL) {
                // node id wise components             
                if (array_key_exists($component['nodeId'], $nodeIdwiseComponents)) {
                    array_push($nodeIdwiseComponents[$component['nodeId']], $comp);
                } else {
                    $nodeIdwiseComponents[$component['nodeId']] = array($comp);
                }
            } else {
                // class wise components             
                if (array_key_exists($component['componentId'], $nodeIdwiseComponents)) {
                    array_push($nodeIdwiseComponents[$component['componentId']], $comp);
                } else {
                    $nodeIdwiseComponents[$component['componentId']] = array($comp);
                }
            }
        }
    }

    $selectedComponents = array();
    if (
        $idwiseComponents !== NULL &&
        $nodeIdwiseComponents !== NULL
    ) {
        $selectedComponents['IdwiseSelectedComps'] = $idwiseComponents;
        $selectedComponents['NodeIdwiseSelectedComps'] = $nodeIdwiseComponents;
    }

    return $selectedComponents;
}

function CopyProject()
{

    $source = getProjectDirectoryPath(trim($_POST["source"], " "));
    $dest = getProjectDirectoryPath(trim($_POST["projectname"], " "));
    $result = CopyDirRecursively($source, $dest);
    if (!$result) {
        echo json_encode(array(
            "Msg" =>  "Failed to copy project dir(s) and file(s).",
            "MsgCode" => 0
        ));
        return;
    }

    $result = CopyProjectToMainDB();
    if ($result["MsgCode"] != 1) {
        echo json_encode($result);
        return;
    }

    echo json_encode($result);
}

// /** 
//  * Copy a file, or recursively copy a folder and its contents 
//  * @param       string   $source    Source path 
//  * @param       string   $dest      Destination path 
//  * @return      bool     Returns TRUE on success, FALSE on failure 
//  */ 
// function CopyProjectDir($source, $dest) 
// { 
//     // Simple copy for a file 
//     if (is_file($source)) {
//         // chmod($dest, 777);
//         return copy($source, $dest); 
//     } 

//     // Make destination directory 
//     if (!is_dir($dest)) { 
//         mkdir($dest); 
//     }

//     // chmod($dest, 777);

//     // Loop through the folder 
//     $dir = dir($source); 
//     while (false !== $entry = $dir->read()) { 
//         // Skip pointers 
//         if ($entry == '.' || $entry == '..') { 
//             continue; 
//         } 

//         // Deep copy directories 
//         if ($dest !== "$source/$entry") { 
//             CopyProjectDir("$source/$entry", "$dest/$entry"); 
//         } 
//     } 

//     // Clean up 
//     $dir->close(); 
//     return true; 
// }

function CopyProjectToMainDB()
{

    try {
        $userid = trim($_POST["userid"], " ");
        $projectName = trim($_POST["projectname"], " ");
        $projectType = trim($_POST["projectType"], " ");
        $projectComments = trim($_POST["projectComments"], " ");
        $projectIsFavorite = trim($_POST["projectIsFavorite"], " ");
        $projectDescription = trim($_POST["projectDescription"], " ");
        $projectPath = trim($_POST["path"], " ");
        $projectStatus = trim($_POST["projectStatus"], " ");
        $projectCreatedDate = trim($_POST["projectCreatedDate"], " ");
        $projectModifiedDate = trim($_POST["projectModifiedDate"], " ");
        $vaultEnable = trim($_POST["vaultEnable"], " ");

        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");

        $query =  "select projectname from Projects where projectname=\"" . $projectName . "\" COLLATE NOCASE;";
        $count = 0;
        foreach ($dbh->query($query) as $row) {
            $count = $count + 1;
        }
        if ($count != 0) {
            return array(
                "Msg" =>  "Project '$projectName' already exists.",
                "MsgCode" => 0
            );
            $dbh = null; //This is how you close a PDO connection
            return;
        }

        // projectname is text column
        // userid is integer column
        // path is text column
        $query = 'INSERT INTO Projects (userid,
                                        projectname,
                                        type,
                                        comments,
                                        IsFavourite,
                                        description,
                                        path,
                                        status,
                                        createddate,
                                        modifieddate,
                                        vaultEnable) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
        $stmt = $dbh->prepare($query);

        $stmt->execute(array(
            $userid,
            $projectName,
            $projectType,
            $projectComments,
            $projectIsFavorite,
            $projectDescription,
            $projectPath,
            $projectStatus,
            $projectCreatedDate,
            $projectModifiedDate,
            $vaultEnable
        ));

        $insertedId = $dbh->lastInsertId();
        if (
            $insertedId != 0 &&
            $insertedId != -1
        ) {
            $array = array(
                "projectid" => $dbh->lastInsertId(),
                "projectname" => $projectName,
                "type" => $projectType,
                "comments" => $projectComments,
                "IsFavourite" => $projectIsFavorite,
                "description" => $projectDescription,
                "path" => $projectPath,
                "status" => $projectStatus,
                "createddate" => $projectCreatedDate,
                "vaultEnable" => $vaultEnable
            );

            $dbh = null;
            return array(
                "Msg" =>  "Success",
                "Data" => $array,
                "MsgCode" => 1
            );
        }
        // else
        // {
        //     $array = array(
        //         "projectid" => -1,
        //     );
        //     echo json_encode($array);
        // }

        // $dbh = null; //This is how you close a PDO connection
        // return;      
    } catch (Exception $e) {
        // //echo 'Message: ' .$e->getMessage();
        // $array = array(
        //     "projectid" => -1,
        // );
        // echo json_encode($array);
        // return;
    }

    $dbh = null;
    return array(
        "Msg" =>  "fail",
        "MsgCode" => 0
    );
}

/*
|
|   Creates new project in Main.db
|
*/
function CreateProject()
{
    $projectName = trim($_POST["projectName"], " ");
    if ($projectName == "") {
        echo "Project Name cannot be empty";
        return;
    }
    try {
        if (CheckIfProjectExists($projectName) == TRUE) {
            echo "Project with provided name already exists. Please try some other name.";
            return;
        }
    } catch (Exception $e) {
        echo 'Message: ' . $e->getMessage();
        return;
    }

    // Create project directory
    $path = "../Projects/" . $projectName;
    if (!file_exists($path)) {

        // create directory
        if (mkdir($path, 0777, true)) {
            // create project database           
            $database = new SQLite3($path . "/Project.db");
        }
    }

    // create data vault directory
    $vaultPath = "../Projects/" . $projectName."/DataVault";
    if (!file_exists($vaultPath)) {
        mkdir($vaultPath, 0777, true);        
    }

    echo "success";
}

/*
|
|   Checks whether project with provided name exists or not.
|   Retunrs TRUE if project exists
|   Retunrs FALSE if not
|
*/

function CheckIfProjectExists($projectName)
{
    $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
    $query =  "select projectname from Projects where projectname=\"" . $projectName . "\" COLLATE NOCASE;";
    $count = 0;
    foreach ($dbh->query($query) as $row) {
        $count = $count + 1;
    }
    $dbh = null; //This is how you close a PDO connection
    if ($count != 0) {
        return TRUE;
    } else {
        return FALSE;
    }
}

/*
|
|   Adds new project in Main.db. This is updated as per new design
|
*/
function AddNewProjectToMainDB()
{
    $userid = trim($_POST["userid"], " ");
    $projectName = trim($_POST["projectname"], " ");
    $path = trim($_POST["path"], " ");
    $projectDescription = trim($_POST["projectDescription"], " ");
    $projectType = trim($_POST["projectType"], " ");
    $projectStatus = trim($_POST["projectStatus"], " ");
    $projectComments = trim($_POST["projectComments"], " ");
    $projectIsFavorite = trim($_POST["projectIsFavorite"], " ");
    $projectCreatedDate = trim($_POST["projectCreatedDate"], " ");
    $projectModifiedDate = trim($_POST["projectModifiedDate"], " ");
    $vaultEnable = trim($_POST["vaultEnable"], " ");

    try {
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        // projectname is text column
        // userid is integer column
        // path is text column
        $query = 'INSERT INTO Projects (userid,
        projectname,
        type,
        comments,
        IsFavourite,
        description,
        path,
        status,
        createddate,
        modifieddate,
        vaultEnable) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
        $stmt = $dbh->prepare($query);

        $stmt->execute(array(
            $userid, 
            $projectName, 
            $projectType, 
            $projectComments, 
            $projectIsFavorite, 
            $projectDescription, 
            $path, 
            $projectStatus, 
            $projectCreatedDate, 
            $projectModifiedDate,
            $vaultEnable));
        // $_SESSION['ProjectId'] = $dbh->lastInsertId();
        $insertedId = $dbh->lastInsertId();
        if ($insertedId != 0 && $insertedId != -1) {
            $array = array(
                "projectid" => $dbh->lastInsertId(),
                "projectname" => $projectName,
                "type" => $projectType,
                "comments" => $projectComments,
                "IsFavourite" => $projectIsFavorite,
                "description" => $projectDescription,
                "path" => $path,
                "status" => $projectStatus,
                "createddate" => $projectCreatedDate,
                "modifieddate" => $projectModifiedDate,
                "vaultEnable" => $vaultEnable
            );
            echo json_encode($array);
        } else {
            $array = array(
                "projectid" => -1,
            );
            echo json_encode($array);
        }
        $dbh = null; //This is how you close a PDO connection
        return;
    } catch (Exception $e) {
        //echo 'Message: ' .$e->getMessage();
        $array = array(
            "projectid" => -1,
        );
        echo json_encode($array);
        return;
    }
}

/*
|
|   Deletes specific project from Main.db
|
*/
function DeleteProject()
{
    $projectid = trim($_POST["projectid"], " ");
    $projectname = trim($_POST["projectname"], " ");
    if ($projectid == "") {
        echo "Project Id cannot be empty";
        return;
    }
    try {
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query =  "Delete from Projects where projectid='" . $projectid . "';";
        $stmt = $dbh->prepare($query);
        $stmt->execute();
        echo $stmt->rowCount();
        $dbh = null;
        deleteFolder(getProjectDirectoryPath($projectname));
        return;
    } catch (Exception $e) {
        echo 'Message: ' . $e->getMessage();
        return;
    }
}

/*
|
|   Returns list of all projects for specific 'userid' from Main.db
|
*/

function GetProjects()
{
    $userid = trim($_POST["userid"], " ");
    if ($userid === -1) {
        echo 'fail';
        return;
    }
    $permission = GetUserPermission($userid);
    try {
        $privateprojects = array();
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        if (strcasecmp($permission, "checker") == 0 ||
            strcasecmp($permission, "admin") == 0) {
            $query = "select project.*, logininfo.alias from Projects as project INNER JOIN LoginInfo AS logininfo ON project.userid=logininfo.userid AND project.userid=" . $userid . " AND project.type= 'Private' COLLATE NOCASE";
            $stmt = $dbh->query($query);
            $privateprojects = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        $query = "select project.*, logininfo.alias from Projects as project INNER JOIN LoginInfo AS logininfo ON project.userid=logininfo.userid AND project.type= 'Public' COLLATE NOCASE";
        $stmt = $dbh->query($query);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $data = array_merge($privateprojects, $data);
        echo json_encode($data);
        $dbh = null;
    } catch (Exception $e) {
        echo 'fail';
        return;
    }
}

function SetProjectAsFavourite()
{
    $userid = trim($_POST["userid"], " ");
    $projectid = trim($_POST["ProjectId"], " ");
    $favourite = trim($_POST["Favourite"], " ");
    if ($projectid === -1) {
        echo 'fail';
        return;
    }
    try {
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query = "UPDATE Projects SET IsFavourite=? WHERE projectid=?";
        $dbh->prepare($query)->execute([$favourite, $projectid]);
        $dbh = null;
    } catch (Exception $e) {
        echo 'fail';
        return;
    }
}

function SetVaultEnable()
{
    // $userid = trim($_POST["userid"], " ");
    $projectid = trim($_POST["ProjectId"], " ");
    $vaultEnable = trim($_POST["vaultEnable"], " ");
    if ($projectid === -1) {
        echo 'fail';
        return;
    }
    try {
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query = "UPDATE Projects SET vaultEnable=? WHERE projectid=?";
        $dbh->prepare($query)->execute([$vaultEnable, $projectid]);
        $dbh = null;
    } catch (Exception $e) {
        echo 'fail';
        return;
    }

    echo 'success';
    return;
}

function UpdateProject()
{
    $projectid = trim($_POST["projectid"], " ");
    $userid = trim($_POST["userid"], " ");
    $projectName = trim($_POST["projectname"], " ");
    $projectDescription = trim($_POST["projectDescription"], " ");
    $projectType = trim($_POST["projectType"], " ");
    $projectStatus = trim($_POST["projectStatus"], " ");
    $projectComments = trim($_POST["projectComments"], " ");
    $projectIsFavorite = trim($_POST["projectIsFavorite"], " ");
    $projectModifiedDate = trim($_POST["projectModifiedDate"], " ");

    /*Rename the project directory now*/
    $oldprojectname = trim($_POST["oldprojectname"], " ");
    if (strcmp($oldprojectname, $projectName) != 0) {
        if (CheckIfProjectExists($projectName) == TRUE) {
            echo "Project with provided name already exists. Please try some other name.";
            return;
        }
        $status = renameFolder(getProjectDirectoryPath($oldprojectname), getProjectDirectoryPath($projectName));
        if ($status != TRUE) {
            echo "Failed to rename project directory. May be project directory is in use. Please try by closing the same.";
            return;
        }
    }

    /*Update the project details in database*/
    try {
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query = 'UPDATE Projects Set userid=?, projectname=?, type=?,comments=?,IsFavourite=?,description=?,status=?,modifieddate=? WHERE projectid=?';
        $stmt = $dbh->prepare($query);
        $response = $stmt->execute(array($userid, $projectName, $projectType, $projectComments, $projectIsFavorite, $projectDescription, $projectStatus, $projectModifiedDate, $projectid));
        echo json_encode($response);
        $dbh = null; //This is how you close a PDO connection
        return;
    } catch (Exception $e) {
        echo "failed";
        return;
    }
}

function GetNodeIdVsComponentId()
{
    if (
        !isset($_POST['ProjectName']) ||
        !isset($_POST['CheckName']) ||
        !isset($_POST['SourceId'])
    ) {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));

        return;
    }

    $nodeIdvsComponentIdList = array();
    try {
        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];
        $source = $_POST['SourceId'];

        // open database
        $dbPath = getCheckDatabasePath($projectName, $checkName);
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");

        $componentsTableName = null;
        if (strtolower($source) == "a") {
            $componentsTableName = "SourceAComponents";
        } else if (strtolower($source) == "b") {
            $componentsTableName = "SourceBComponents";
        } else if (strtolower($source) == "c") {
            $componentsTableName = "SourceCComponents";
        } else if (strtolower($source) == "d") {
            $componentsTableName = "SourceDComponents";
        } else {
            echo json_encode(array(
                "Msg" =>  "Failed",
                "MsgCode" => 0
            ));
            return;
        }

        // begin the transaction
        $dbh->beginTransaction();

        $selectResults = $dbh->query("SELECT * FROM " . $componentsTableName . ";");

        if ($selectResults) {
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) {
                $nodeIdvsComponentIdList[$row['nodeid']] = $row['id'];
            }
        }

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection                   

    } catch (Exception $e) {
        echo json_encode(array(
            "Msg" =>  "Failed",
            "MsgCode" => 0
        ));
        return;
    }

    echo json_encode(array(
        "Msg" =>  "Success",
        "Data" => $nodeIdvsComponentIdList,
        "MsgCode" => 1
    ));
}