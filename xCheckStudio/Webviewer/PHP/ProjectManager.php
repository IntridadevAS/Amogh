<?php
    require_once 'Utility.php';
    require_once 'UserManagerUtility.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $InvokeFunction = trim($_POST["InvokeFunction"], " ");
    switch ($InvokeFunction) {
        case "CreateProject":
            CreateProject();
            break;
        case "AddProjectToMainDB":
            AddProjectToMainDB();
            break;
        case "AddNewProjectToMainDB":
            AddNewProjectToMainDB();
            break;
        case "SetProjectAsFavourite":
            SetProjectAsFavourite();
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
        case "IsLoadProject":
            IsLoadProject();
            break;
        case "CreateProjectSession":
            CreateProjectSession();
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
        case "SaveCheckCaseData":
            SaveCheckCaseData();
            break;
        // case "SaveCheckModuleControlsState":
        //     SaveCheckModuleControlsState();
        //     break;
        // case "SaveDatasourceInfo":
        //     SaveDatasourceInfo();
        //     break;  
        // case "SaveSelectedComponents":
        //     SaveSelectedComponents();         
        //     break;  
        // case "SaveCheckResults":
        //     SaveCheckResults();         
        //     break;
        // case "SaveNotSelectedComponents":
        //     SaveNotSelectedComponents();         
        //     break;
        case "SaveComponents":
            SaveComponents();         
            break;
        case "CreateCheckSpaceDBonSave":
             CreateCheckSpaceDBonSave();         
            break;
        // case "SaveVieweroptions":
        //     SaveVieweroptions();
        //     break;
        case "ClearTemporaryCheckSpaceDB":
            ClearTemporaryCheckSpaceDB();
            break;
        // case  "SaveHiddenItems":
        //     SaveHiddenItems();
        //     break;
        // case "SaveReferences":
        //     SaveReferences();         
        //     break;
        case "SaveAll":
            SaveAll();         
            break;            
        default:
            echo "No Function Found!";
    }
}

/* 
   Save all data
*/ 
function SaveAll()
{   
    if(!isset( $_POST['ProjectName']) ||
    !isset( $_POST['CheckName']) ||
    !isset( $_POST['Context']))
    {
        echo json_encode(array("Msg" =>  "Invalid input.",
        "MsgCode" => 0));  

        return;
    }

    // get project name
    $projectName = $_POST['ProjectName'];	
    $checkName = $_POST['CheckName'];
   
    $dbPath = getSavedCheckDatabasePath($projectName, $checkName);   
    $tempDBPath = getCheckDatabasePath($projectName, $checkName); 
    
    // create or rewrite the main check space db
    CreateCheckSpaceDBonSave();

    if(!file_exists ($dbPath ) || 
       !file_exists ($tempDBPath ))
    { 
        echo json_encode(array("Msg" =>  "DBs not found.",
        "MsgCode" => 0));  

        return;
    }       

    $context = $_POST['Context'];
    
    try
    {        
        // open database             
        $tempDbh = new PDO("sqlite:$tempDBPath") or die("cannot open the database");

        //$dbPath = "../Projects/".$projectName."/".$projectName.".db";
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");                 

        // begin the transaction
        $dbh->beginTransaction();
        $tempDbh->beginTransaction();  

         // this will save all sources components, properties                       
         SaveComponentsFromTemp( $tempDbh, $dbh, "SourceAComponents", "SourceAProperties"); 
         SaveComponentsFromTemp( $tempDbh, $dbh, "SourceBComponents", "SourceBProperties");
         // SaveComponents( $tempDbh, $dbh, "SourceCComponents", "SourceCProperties");          
         // SaveComponents( $tempDbh, $dbh, "SourceDComponents", "SourceDProperties");
        
         // save check case info 
         SaveCheckCaseInfoFromTemp($tempDbh, $dbh);        
       
         // 'check' context save needs to be changed for viewer opttions
        if($context === "check")
        {
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
            if(!SaveCheckStatistics($tempDbh, $dbh))
            {
                SaveCheckStatisticsFromTemp($tempDbh, $dbh);
            }
        }
        else
        {
            // save check module control state from temp check space db to main checkspace db
            SaveCheckModuleControlsStateFromTemp($tempDbh, $dbh);

            // save loaded data sources information
            SaveDataSourceInfoFromTemp($tempDbh, $dbh);

            // save viewer related information
            SaveVieweroptionsFromTemp($tempDbh, $dbh, "SourceAViewerOptions");
            SaveVieweroptionsFromTemp($tempDbh, $dbh, "SourceBViewerOptions");

            // save selected components
            SaveSelectedComponentsFromTemp($tempDbh, $dbh, "SourceASelectedComponents");
            SaveSelectedComponentsFromTemp($tempDbh, $dbh, "SourceBSelectedComponents");

            // // save not selected components
            SaveNotSelectedComponentsFromTemp($tempDbh, $dbh, "SourceANotSelectedComponents");
            SaveNotSelectedComponentsFromTemp($tempDbh, $dbh, "SourceBNotSelectedComponents");            

            // save hiddent items
            SaveHiddenItemsFromTemp($tempDbh, $dbh);     
            
            // save check result statistics
            SaveCheckStatisticsFromTemp($tempDbh, $dbh);
        }     
        
        // comparison result tables table                               
        SaveComparisonGroupsFromTemp( $tempDbh, $dbh);
        SaveComparisonComponentsFromTemp( $tempDbh, $dbh);                  
        SaveComparisonPropertiesFromTemp( $tempDbh, $dbh);                      
        SaveNotMatchedComponentsFromTemp($tempDbh, $dbh, "SourceANotMatchedComponents");
        SaveNotMatchedComponentsFromTemp($tempDbh, $dbh, "SourceBNotMatchedComponents");

        // source a compliance result tables table     
        SaveSourceAComplianceCheckGroupsFromTemp($tempDbh, $dbh);
        SaveSourceAComplianceCheckComponentsFromTemp($tempDbh, $dbh);
        SaveSourceAComplianceCheckPropertiesFromTemp($tempDbh, $dbh);

        // source b compliance result tables table     
        SaveSourceBComplianceCheckGroupsFromTemp($tempDbh, $dbh);
        SaveSourceBComplianceCheckComponentsFromTemp($tempDbh, $dbh);
        SaveSourceBComplianceCheckPropertiesFromTemp($tempDbh, $dbh);     

        // save references                
        SaveReferencesFromTemp( $tempDbh, $dbh, "a_References");          
        SaveReferencesFromTemp( $tempDbh, $dbh, "b_References");
        SaveReferencesFromTemp( $tempDbh, $dbh, "c_References");          
        SaveReferencesFromTemp( $tempDbh, $dbh, "d_References");

        // commit update
        $dbh->commit();
        $tempDbh->commit();
        $dbh = null; //This is how you close a PDO connection                    
        $tempDbh = null; //This is how you close a PDO connection                        

        echo json_encode(array("Msg" =>  "success",
        "MsgCode" => 1));  
        return;
    }
    catch(Exception $e) 
    {        
        echo json_encode(array("Msg" =>  "Failed to save data.",
        "MsgCode" => 0));  
        return;
    } 
}

// function SaveCheckResults()
// {
//     // get project name
//     $projectName = $_POST['ProjectName'];	
//     $checkName = $_POST['CheckName'];
   
//     $dbPath = getSavedCheckDatabasePath($projectName, $checkName);   
//     $tempDBPath = getCheckDatabasePath($projectName, $checkName); 
//     if(!file_exists ($dbPath ) || 
//     !file_exists ($tempDBPath ))
//     { 
//         echo 'fail';
//         return;
//     }       

//     $dbh;
//     try
//     {        
//         // open database             
//         $tempDbh = new PDO("sqlite:$tempDBPath") or die("cannot open the database");

//         //$dbPath = "../Projects/".$projectName."/".$projectName.".db";
//         $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");                 

//         // begin the transaction
//         $dbh->beginTransaction();
//         $tempDbh->beginTransaction();            
    
//         // comparison result tables table                               
//         SaveComparisonComponentsFromTemp( $tempDbh, $dbh);          
//         SaveComparisonGroupsFromTemp( $tempDbh, $dbh);
//         SaveComparisonPropertiesFromTemp( $tempDbh, $dbh);              
//         SaveNotMatchedComponentsFromTemp($tempDbh, $dbh, "SourceANotMatchedComponents");
//         SaveNotMatchedComponentsFromTemp($tempDbh, $dbh, "SourceBNotMatchedComponents");

//         // source a compliance result tables table     
//         SaveSourceAComplianceCheckGroupsFromTemp($tempDbh, $dbh);
//         SaveSourceAComplianceCheckComponentsFromTemp($tempDbh, $dbh);
//         SaveSourceAComplianceCheckPropertiesFromTemp($tempDbh, $dbh);

//         // source b compliance result tables table          
//         SaveSourceBComplianceCheckGroupsFromTemp($tempDbh, $dbh);
//         SaveSourceBComplianceCheckComponentsFromTemp($tempDbh, $dbh);
//         SaveSourceBComplianceCheckPropertiesFromTemp($tempDbh, $dbh);       

//         // save check result statistics
//         SaveCheckStatistics($tempDbh, $dbh);

//         // commit update
//         $dbh->commit();
//         $tempDbh->commit();
//         $dbh = null; //This is how you close a PDO connection                    
//         $tempDbh = null; //This is how you close a PDO connection                        

//         echo 'success';
//         return;
//     }
//     catch(Exception $e) 
//     {        
//         echo "fail"; 
//         return;
//     } 
// }

function SaveComparisonPropertiesFromTemp( $tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM ComparisonCheckProperties;");  
    if($selectResults) 
    {

        // create table
        $command = 'DROP TABLE IF EXISTS ComparisonCheckProperties;';
        $dbh->exec($command);    
                  
        // $command = 'CREATE TABLE ComparisonCheckProperties(
        //     id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        //     sourceAName TEXT,
        //     sourceBName TEXT,
        //     sourceAValue TEXT,
        //     sourceBValue TEXT,
        //     result TEXT,
        //     severity TEXT,
        //     accepted TEXT,
        //     performCheck TEXT,
        //     description TEXT,
        //     ownerComponent INTEGER NOT NULL,
        //     transpose TEXT)';
        $command = CREATE_COMPARISONPROPERTIES_TABLE; 
        $dbh->exec($command);     

        //  $insertStmt = $dbh->prepare("INSERT INTO ComparisonCheckProperties(id, 
        //  sourceAName, 
        //  sourceBName, 
        //  sourceAValue,
        //  sourceBValue, 
        //  result, 
        //  severity,
        //  accepted, 
        //  performCheck, 
        //  description,
        //  ownerComponent,
        //  transpose) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)");
         $insertStmt = $dbh->prepare(INSERT_ALLCOMPARISONPROPERTIES_TABLE);
    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['sourceAName'], 
                                       $row['sourceBName'],
                                       $row['sourceAValue'],
                                       $row['sourceBValue'], 
                                       $row['result'], 
                                       $row['severity'],
                                       $row['accepted'],
                                       $row['performCheck'], 
                                       $row['description'], 
                                       $row['ownerComponent'],
                                       $row['transpose']));
        }  
    }
}

function SaveComparisonGroupsFromTemp( $tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM ComparisonCheckGroups;");  
    if($selectResults) 
    {

        // create table
        $command = 'DROP TABLE IF EXISTS ComparisonCheckGroups;';
        $dbh->exec($command);    
                  
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
    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['componentClass'], 
                                       $row['componentCount'],
                                       $row['categoryStatus']));
        }  
    }
}

function SaveComparisonComponentsFromTemp( $tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM ComparisonCheckComponents;");  
    if($selectResults) 
    {

        // create table
        $command = 'DROP TABLE IF EXISTS ComparisonCheckComponents;';
        $dbh->exec($command);    
                  
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
        $insertStmt = $dbh->prepare(INSERT_ALLCOMPARISONCOMPONETS_TABLE);
    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['sourceAName'], 
                                       $row['sourceBName'],
                                       $row['sourceASubComponentClass'], 
                                       $row['sourceBSubComponentClass'], 
                                       $row['status'],
                                       $row['accepted'], 
                                       $row['sourceANodeId'], 
                                       $row['sourceBNodeId'],
                                       $row['sourceAId'], 
                                       $row['sourceBId'], 
                                       $row['ownerGroup'],
                                       $row['transpose']));
        }  
    }
}

function ClearTemporaryCheckSpaceDB()
{     
    if(!isset($_POST['ProjectName']) ||
    !isset($_POST['CheckName']) ||
    !isset($_POST['ProjectId']))
    {
        echo 'fail';
        return;
    }

    try
    {   
         // get project name
        $projectName = $_POST['ProjectName'];	
        $checkName = $_POST['CheckName'];
        $projectId = $_POST['ProjectId'];
        
        $tempDBPath = getCheckDatabasePath($projectName, $checkName);           
        if(file_exists ($tempDBPath ))
        { 
            unlink($tempDBPath);            
        }     
        
        //   // check if checkspace db is saved. If not saved, then 
        // // delete the checkspace entry from project db
        // $dbPath = getSavedCheckDatabasePath($projectName, $checkName);   
        // if(!file_exists ($dbPath))
        // {           
        //     // remove checkspace entry from main project db 
        //     $projectDbPath = getProjectDatabasePath($projectName);
        //     $dbh = new PDO("sqlite:".$projectDbPath) or die("cannot open the database");            
        //     $query =  "Delete from CheckSpace where checkname='".$checkName."' and projectid='". $projectId."';";  
        //     $stmt = $dbh->prepare($query);      
        //     $stmt->execute();

        //     // delete checkspace directory
        //     $checkspaceDir = getCheckDirectoryPath($projectName, $checkName);
        //     deleteDirectory($checkspaceDir);           
        // }  
    }
    catch(Exception $e) 
    {        
        echo "fail"; 
        return;
    } 
}

function deleteDirectory($dir) {
    if (!file_exists($dir)) {
        return true;
    }

    if (!is_dir($dir)) {
        return unlink($dir);
    }

    foreach (scandir($dir) as $item) {
        if ($item == '.' || $item == '..') {
            continue;
        }

        if (!deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
            return false;
        }

    }

    return rmdir($dir);
}

function CreateCheckSpaceDBonSave()
{
    // get project name
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
    try
    {   
        $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
        if(file_exists ($dbPath ))
        { 
            unlink($dbPath);
        }

        // create project database          
        $database = new SQLite3($dbPath);
    }
    catch(Exception $e) 
    {        
        echo "fail"; 
        return;
    } 

    echo "success"; 
    return;
}

/* 
   Save references on components
*/
function SaveReferencesFromTemp($tempDbh, $dbh, $referenceTable)
{
    $selectResults = $tempDbh->query("SELECT * FROM ".$referenceTable.";");  
    if($selectResults) 
    {

        // create table
        $command = 'DROP TABLE IF EXISTS '.$referenceTable.';';
        $dbh->exec($command);    
                  
        $command = 'CREATE TABLE IF NOT EXISTS '. $referenceTable. '(
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        webAddress TEXT,
        document TEXT,
        pic TEXT,
        comment TEXT,
        component INTEGER NOT NULL       
        )';               
        $dbh->exec($command);    

         $insertReferenceStmt = $dbh->prepare("INSERT INTO ".$referenceTable."(id, webAddress, document, pic, comment, 
         component) VALUES(?,?,?,?,?,?)");
    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertReferenceStmt->execute(array($row['id'], 
                                       $row['webAddress'], 
                                       $row['document'],
                                       $row['pic'], 
                                       $row['comment'], 
                                       $row['component']));
        }  
    }   
}

// function SaveReferences()
// {
//     // get project name
//     $projectName = $_POST['ProjectName'];	
//     $checkName = $_POST['CheckName'];
//     $dbPath = getSavedCheckDatabasePath($projectName, $checkName);   
//     $tempDBPath = getCheckDatabasePath($projectName, $checkName); 
//     if(!file_exists ($dbPath ) || 
//        !file_exists ($tempDBPath ))
//     { 
//          echo 'fail';
//          return;
//     }       

//     $dbh;
//      try
//      {        
//          // open database             
//          $tempDbh = new PDO("sqlite:$tempDBPath") or die("cannot open the database");

//          //$dbPath = "../Projects/".$projectName."/".$projectName.".db";
//          $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");                 

//          // begin the transaction
//          $dbh->beginTransaction();
//          $tempDbh->beginTransaction();            
       
//          // references on components               
//          SaveReferencesFromTemp( $tempDbh, $dbh, "a_References");          
//          SaveReferencesFromTemp( $tempDbh, $dbh, "b_References");
//          SaveReferencesFromTemp( $tempDbh, $dbh, "c_References");          
//          SaveReferencesFromTemp( $tempDbh, $dbh, "d_References");

//          // commit update
//          $dbh->commit();
//          $tempDbh->commit();
//          $dbh = null; //This is how you close a PDO connection                    
//          $tempDbh = null; //This is how you close a PDO connection                        

//          echo 'success';
//          return;
//      }
//      catch(Exception $e) 
//      {        
//          echo "fail"; 
//          return;
//      } 
// }

/* 
   Save hidden items in model browser
*/
function SaveHiddenItemsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM hiddenComponents;");  
    if($selectResults) 
    {
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS hiddenComponents;';
        $dbh->exec($command);

        $command = 'CREATE TABLE hiddenComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                hiddenComponents TEXT,
                visibleComponents TEXT)'; 
        $dbh->exec($command);

        $insertStmt = $dbh->prepare("INSERT INTO hiddenComponents(id, hiddenComponents, visibleComponents) VALUES(?,?,?)");
    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['hiddenComponents'], 
                                       $row['visibleComponents']));
        }  
       
    }
}

function SaveHiddenItems( $dbh)
{
    if(!isset($_POST['hiddenItems']))
    {
        return false;
    }

    $hiddenItems = json_decode($_POST['hiddenItems'],true);

    if(!array_key_exists("hiddenComponents",$hiddenItems) ||
        !array_key_exists("visibleComponents",$hiddenItems))
    {
        return false;
    }

    $hiddenComponents = $hiddenItems['hiddenComponents'];
    $visibleComponents = $hiddenItems["visibleComponents"];

    try
    {         
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
    
    }                
    catch(Exception $e)
    {   
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
function SaveComponentsFromTemp( $tempDbh, $dbh, $componentTable, $propertiesTable)
{
    $selectResults = $tempDbh->query("SELECT * FROM ".$componentTable.";");  
    if($selectResults) 
    {

        // create table
        $command = 'DROP TABLE IF EXISTS '.$componentTable.';';
        $dbh->exec($command);    

         // ischecked can have values 'true' or 'false'
         $command = 'CREATE TABLE '.$componentTable.'(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT NOT NULL,
            mainclass TEXT NOT NULL,
            subclass TEXT NOT NULL,
            nodeid INTEGER,
            ischecked TEXT,
            parentid INTEGER
          )';         
         $dbh->exec($command);    

         $insertComponentStmt = $dbh->prepare("INSERT INTO ".$componentTable."(id, name, mainclass, subclass, nodeid, 
                       ischecked, parentid) VALUES(?,?,?,?,?,?,?)");
    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertComponentStmt->execute(array($row['id'], 
                                       $row['name'], 
                                       $row['mainclass'],
                                       $row['subclass'], 
                                       $row['nodeid'], 
                                       $row['ischecked'],
                                       $row['parentid']));
        }  
        
        // save properties
        $selectPropertiesResults = $tempDbh->query("SELECT * FROM ".$propertiesTable.";");  
        if($selectPropertiesResults) 
        {
            // create table
            $command = 'DROP TABLE IF EXISTS '.$propertiesTable.';';
            $dbh->exec($command);    

            // create properties table
            $command = 'CREATE TABLE '.$propertiesTable.'(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        name TEXT NOT NULL,
                        format TEXT,
                        value TEXT,                
                        ownercomponent INTEGER NOT NULL               
              )';         
             $dbh->exec($command);  
             
             $insertPropertiesStmt = $dbh->prepare("INSERT INTO  ".$propertiesTable."(id, name, format, value, 
                      ownercomponent) VALUES(?,?,?,?,?)");
    
    
            while ($row = $selectPropertiesResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertPropertiesStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['format'],
                                        $row['value'], 
                                        $row['ownercomponent']));
            }  
        }
    }   
}

function SaveComponents()
{
       // get project name
       $projectName = $_POST['ProjectName'];	
       $checkName = $_POST['CheckName'];
       $dbPath = getSavedCheckDatabasePath($projectName, $checkName);   
       $tempDBPath = getCheckDatabasePath($projectName, $checkName); 
       if(!file_exists ($dbPath ) || 
          !file_exists ($tempDBPath ))
       { 
            echo 'fail';
            return;
       }       

       $dbh;
        try
        {        
            // open database             
            $tempDbh = new PDO("sqlite:$tempDBPath") or die("cannot open the database");

            //$dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");                 

            // begin the transaction
            $dbh->beginTransaction();
            $tempDbh->beginTransaction();            
          
            // comparison result tables table                               
            SaveComponentsFromTemp( $tempDbh, $dbh, "SourceAComponents", "SourceAProperties");          
            SaveComponentsFromTemp( $tempDbh, $dbh, "SourceBComponents", "SourceBProperties");
            // SaveComponents( $tempDbh, $dbh, "SourceCComponents", "SourceCProperties");          
            // SaveComponents( $tempDbh, $dbh, "SourceDComponents", "SourceDProperties");

            // save check case info 
            SaveCheckCaseInfoFromTemp($tempDbh, $dbh);

            // commit update
            $dbh->commit();
            $tempDbh->commit();
            $dbh = null; //This is how you close a PDO connection                    
            $tempDbh = null; //This is how you close a PDO connection                        

            echo 'success';
            return;
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        } 
}

/* 
   Save viewer options
*/
function SaveVieweroptionsFromTemp($tempDbh, $dbh, $tableName)
{
    $selectResults = $tempDbh->query("SELECT * FROM ".$tableName.";");
    if($selectResults) 
    {
        // create table
        // drop table if exists
       // drop table if exists
       $command = 'DROP TABLE IF EXISTS '.$tableName. ';';
       $dbh->exec($command);

       $command = 'CREATE TABLE '.$tableName.'(
                   id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, 
                   endpointUri TEXT)';            
       $dbh->exec($command);  

       $insertStmt = $dbh->prepare('INSERT INTO '.$tableName.'(id, endpointUri) VALUES(?,?) ');                                        
      
       while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['endpointUri']));
        }           
    }
}

function SaveVieweroptions($dbh)
{

    if(!isset($_POST["viewerOptions"]))
    {
        return;
    }

    try
    {   

        $viewerOptions = json_decode($_POST['viewerOptions'],true);
        foreach ($viewerOptions as $sourceViewerOptionsTable => $sourceViewerOptions) {
                
                // // open database          
                // $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");                 

                // // begin the transaction
                // $dbh->beginTransaction();                     

                $command = 'CREATE TABLE '.$sourceViewerOptionsTable.'(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,                    
                    endpointUri TEXT)';            
                    $dbh->exec($command);  
        
                $insertStmt = $dbh->prepare("INSERT INTO ".$sourceViewerOptionsTable."(endpointUri) VALUES(?)");
                $insertStmt->execute(array($sourceViewerOptions[0]));
            
            
        }        
    }
    catch(Exception $e) 
    { 
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
    if($selectResults) 
    {

        $command = 'DROP TABLE IF EXISTS CheckCaseInfo;';
        $dbh->exec($command);

        $command = 'CREATE TABLE CheckCaseInfo(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    checkCaseData TEXT)';         
        $dbh->exec($command);      

        $insertStmt = $dbh->prepare("INSERT INTO CheckCaseInfo(id, checkCaseData) VALUES(?,?)");
    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['checkCaseData']));
        }  
    }
}

/*
   Save not selected components
*/
function SaveNotSelectedComponentsFromTemp($tempDbh, $dbh, $tableName)
{
    $selectResults = $tempDbh->query("SELECT * FROM ".$tableName.";");
    if($selectResults) 
    {

        $command = 'DROP TABLE IF EXISTS '.$tableName.';';
        $dbh->exec($command);    
        $command = 'CREATE TABLE '.$tableName.'(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,
            mainClass TEXT,
            subClass TEXT,
            nodeId TEXT,
            mainTableId TEXT)'; 
        $dbh->exec($command);   

        $insertStmt = $dbh->prepare("INSERT INTO ".$tableName."(id, name, mainClass, subClass, nodeId ,mainTableId) VALUES(?,?,?,?,?,?)");
    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['name'], 
                                       $row['mainClass'],
                                       $row['subClass'], 
                                       $row['nodeId'], 
                                       $row['mainTableId']));
        } 
    }
}

function SaveNotSelectedComponents($dbh)
{    
    if(!isset($_POST['notSelectedComponents']))
    {
        echo 'fail';
        return;
    }

    $notSelectedComponentsObject = json_decode($_POST['notSelectedComponents'], true);
    
    foreach($notSelectedComponentsObject as $notSelectedComponentsTable =>$componentsList)            
    {
        if(!array_key_exists("selectedComponents",$componentsList) ||
           !array_key_exists("componentsTable",$componentsList))
        {
            continue;
        }

        $selectedComponents = $componentsList['selectedComponents'];
        $componentsTable = $componentsList['componentsTable'];

        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];        
        $components = getSourceComponents($projectName, $checkName, $componentsTable);

        if($components === NULL)
        {           
            continue;
        }
     
        // echo "components : ";
        // var_dump($components);
        // echo "  ";

        $notCheckedComponents = array();
        foreach ($components as $id => $component)
        {    
            // echo "component : ";
            // var_dump($component);
            // echo "  ";
    
            // echo "selectedComponents : ";
            // var_dump($selectedComponents);
            // echo "  ";      

            // return;
            // check is component is selected or not for performing check
            if(!isComponentSelected($component, $selectedComponents)) 
            {
                    
                    //source A component not checked    
                    $compKey = $component['id'];                            
                    if(!array_key_exists($compKey, $notCheckedComponents))
                    {
                        $notCheckedComponents[$compKey] = $component;                                                   
                    }

                //continue;
            }
        }     

        writeNotCheckedComponentsToDB($dbh,
                                      $notCheckedComponents, 
                                      $notSelectedComponentsTable);
    }    
}

function writeNotCheckedComponentsToDB($dbh,
                                       $notCheckedComponents,                                              
                                       $tableName)
{        
        try
        {             
            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '.$tableName.';';
            $dbh->exec($command);

            $command = 'CREATE TABLE '.$tableName.'(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    name TEXT,
                    mainClass TEXT,
                    subClass TEXT,
                    nodeId TEXT,
                    mainTableId TEXT)'; 
            $dbh->exec($command);    

            foreach($notCheckedComponents as $key =>$value)            
            {               
                $name = $value["name"];
                $mainclass = $value["mainclass"];
                $subclass =  $value["subclass"];               

                $nodeId = NULL;
                if(array_key_exists("nodeid", $value))
                { 
                    $nodeId = $value["nodeid"];
                }

                $mainTableId = $value["id"];

                $insertQuery = 'INSERT INTO '.$tableName.'(name, mainClass, subClass, nodeId, mainTableId) VALUES(?,?,?,?,?) ';                                        
                $values = array( $name,  $mainclass, $subclass, $nodeId ,$mainTableId);

                $insertStmt = $dbh->prepare($insertQuery);
                $insertStmt->execute($values);  
            }            
        }                
        catch(Exception $e)
        {   
            return false;
        }

        return true;
}

function isComponentSelected($component, $SelectedComponents){
           
    for($index = 0; $index < count($SelectedComponents); $index++)
    {
        $selectedComponent = $SelectedComponents[$index];              
        if($component['name']              ==  $selectedComponent['Name'] &&
           $component['mainclass']==  $selectedComponent['MainComponentClass'] && 
           $component['subclass']  ==  $selectedComponent['ComponentClass']){
               
                 if(isset($selectedComponent['NodeId']))
                {                          
                    if($selectedComponent['NodeId'] == $component['nodeid'])
                    {                               
                        return true;
                    }                           
                }
                else
                {                           
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

     try{   
             // open database
             $dbPath = getCheckDatabasePath($projectName, $checkName);
             $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

             // begin the transaction
             $dbh->beginTransaction();
              
             // fetch source omponents
             $stmt =  $dbh->query('SELECT *FROM '.$componentsTable.';');
            
             if($stmt)
             {
                 while ($componentRow = $stmt->fetch(\PDO::FETCH_ASSOC)) 
                {
                        $values2 =array('id'=>$componentRow['id'], 'name'=>$componentRow['name'],  'mainclass'=>$componentRow['mainclass'], 'subclass'=>$componentRow['subclass']);
                        if (array_key_exists("nodeid",$componentRow))
                        {
                            $values2["nodeid"] =  $componentRow['nodeid'];                               
                        }

                        //$values2 = array($row['name'],  $row['mainclass'], $row['subclass'], $row['nodeid']);
                        $components[$componentRow['id']] = $values2;   
                    
                }   
            }                  

            // commit update
             $dbh->commit();
             $dbh = null; //This is how you close a PDO connection
         }                
     catch(Exception $e) {        
         //echo "fail"; 
         echo 'Message: ' .$e->getMessage();
         return NULL;
     }   
     
     return $components ;
 }   


function   SaveNotMatchedComponentsFromTemp($tempDbh, $dbh, $tableName)
{
    $selectResults = $tempDbh->query("SELECT * FROM ".$tableName.";");
    if($selectResults) 
    {

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS '.$tableName.';';
        $dbh->exec($command);

        $command = 'CREATE TABLE '.$tableName.'(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,
                mainClass TEXT,
                subClass TEXT,
                nodeId TEXT,
                mainTableId TEXT)'; 
        $dbh->exec($command);    

        $insertStmt = $dbh->prepare('INSERT INTO '.$tableName.'(id, name, mainClass, subClass, nodeId, mainTableId) VALUES(?, ?, ?, ?, ?, ?) ');                                        
      
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
         {           
             $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['mainClass'],
                                        $row['subClass'], 
                                        $row['nodeId'], 
                                        $row['mainTableId']));
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

/* 
    Save check statistics
*/
function  SaveCheckStatisticsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM CheckStatistics");
    if($selectResults) 
    {

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


        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
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
                                    $row['sourceBComplianceCheckGroupsInfo']));
        }   


        return true;
    }

    return false;
}

function  SaveCheckStatistics($tempDbh, $dbh)
{
    
    $comparisonOK =NULL;
    $comparisonError =NULL;
    $comparisonWarning =NULL;
    $comparisonNoMatch =NULL;
    $comparisonUndefined =NULL;
    $comparisonCheckGroupsInfo =NULL;

    $comparisonResults = $tempDbh->query("SELECT * FROM ComparisonCheckStatistics");
    if($comparisonResults)
    {
        while ($row = $comparisonResults->fetch(\PDO::FETCH_ASSOC)) 
        {  
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
    if($sourceAComplianceResults)
    {
        while ($row = $sourceAComplianceResults->fetch(\PDO::FETCH_ASSOC)) 
        {  
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
    if($sourceBComplianceResults)
    {
        while ($row = $sourceBComplianceResults->fetch(\PDO::FETCH_ASSOC)) 
        {  
            $sourceBComplianceOK = $row['sourceBComplianceOK'];
            $sourceBComplianceError = $row['sourceBComplianceError'];
            $sourceBComplianceWarning = $row['sourceBComplianceWarning'];
            $sourceBComplianceCheckGroupsInfo = $row['sourceBComplianceCheckGroupsInfo'];
           
            break;
        }   
    }


    if($comparisonResults || 
       $sourceAComplianceResults || 
       $sourceBComplianceResults)
    {


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
        $insertStmt->execute(array($comparisonOK, 
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
                                    $sourceBComplianceCheckGroupsInfo));

        return true;
    }

    return false;
}

function SaveSourceBComplianceCheckGroupsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceBComplianceCheckGroups");
    if($selectResults) 
    {

        $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckGroups;';
        $command = 'CREATE TABLE SourceBComplianceCheckGroups(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            componentClass TEXT NOT NULL,
            componentCount Integer,
            categoryStatus TEXT NOT NULL)'; 
        $dbh->exec($command);  

        $insertStmt = $dbh->prepare("INSERT INTO SourceBComplianceCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");
        
        
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                    $row['componentClass'], 
                                    $row['componentCount'],
                                    $row['categoryStatus']));
        }   
    }
}

function SaveSourceBComplianceCheckComponentsFromTemp($tempDbh, $dbh)
{  
    $selectResults = $tempDbh->query("SELECT * FROM SourceBComplianceCheckComponents");
    if($selectResults) 
    {
 
        $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckComponents;';
        $command = 'CREATE TABLE SourceBComplianceCheckComponents(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,                
            subComponentClass TEXT,
            status TEXT,
            accepted TEXT,
            nodeId TEXT,
            sourceId TEXT,
            ownerGroup INTEGER NOT NULL)'; 
        $dbh->exec($command);    

        $insertStmt = $dbh->prepare("INSERT INTO SourceBComplianceCheckComponents(id, name, subComponentClass, status,
                                    accepted, nodeId, sourceId, ownerGroup) VALUES(?,?,?,?,?,?,?,?)");
        
        
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                    $row['name'], 
                                    $row['subComponentClass'],
                                    $row['status'], 
                                    $row['accepted'], 
                                    $row['nodeId'], 
                                    $row['sourceId'], 
                                    $row['ownerGroup']));
        }   
    }  
}

function SaveSourceBComplianceCheckPropertiesFromTemp($tempDbh, $dbh)
{   
    $selectResults = $tempDbh->query("SELECT * FROM SourceBComplianceCheckProperties");
    if($selectResults) 
    {
  
        $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckProperties;';
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
        
        
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                    $row['name'], 
                                    $row['value'],
                                    $row['result'], 
                                    $row['severity'], 
                                    $row['accepted'], 
                                    $row['performCheck'], 
                                    $row['description'], 
                                    $row['ownerComponent'],
                                    $row['rule']));
        }   
    }
}

function SaveSourceAComplianceCheckGroupsFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM SourceAComplianceCheckGroups");
    if($selectResults) 
    {

        $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckGroups;';
        $command = 'CREATE TABLE SourceAComplianceCheckGroups(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            componentClass TEXT NOT NULL,
            componentCount Integer,
            categoryStatus TEXT NOT NULL)'; 
        $dbh->exec($command);  

        $insertStmt = $dbh->prepare("INSERT INTO SourceAComplianceCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?, ?,?,?)");
        
        
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                    $row['componentClass'], 
                                    $row['componentCount'],
                                    $row['categoryStatus']));
        }   
    }
}

function SaveSourceAComplianceCheckComponentsFromTemp($tempDbh, $dbh)
{  
    $selectResults = $tempDbh->query("SELECT * FROM SourceAComplianceCheckComponents");
    if($selectResults) 
    {
 
        $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckComponents;';
        $command = 'CREATE TABLE SourceAComplianceCheckComponents(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT,                
            subComponentClass TEXT,
            status TEXT,
            accepted TEXT,
            nodeId TEXT,
            sourceId TEXT,
            ownerGroup INTEGER NOT NULL)'; 
        $dbh->exec($command);    

        $insertStmt = $dbh->prepare("INSERT INTO SourceAComplianceCheckComponents(id, name, subComponentClass, status,
                                    accepted, nodeId, sourceId, ownerGroup) VALUES(?,?,?,?,?,?,?,?)");
        
        
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                    $row['name'], 
                                    $row['subComponentClass'],
                                    $row['status'], 
                                    $row['accepted'], 
                                    $row['nodeId'], 
                                    $row['sourceId'],
                                    $row['ownerGroup']));
        }   
    }  
}

function SaveSourceAComplianceCheckPropertiesFromTemp($tempDbh, $dbh)
{   
    $selectResults = $tempDbh->query("SELECT * FROM SourceAComplianceCheckProperties");
    if($selectResults) 
    {
  
        $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckProperties;';
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
        
        
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                    $row['name'], 
                                    $row['value'],
                                    $row['result'], 
                                    $row['severity'], 
                                    $row['accepted'], 
                                    $row['performCheck'], 
                                    $row['description'], 
                                    $row['ownerComponent'],
                                    $row['rule']));
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
    $selectResults = $tempDbh->query("SELECT * FROM ".$tableName.";");
    if($selectResults) 
    {
        // create table
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS '.$tableName. ';';
        $dbh->exec($command);

        $command = 'CREATE TABLE '. $tableName. '(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            name TEXT NOT NULL,
            mainClass TEXT NOT NULL,
            subClass TEXT NOT NULL,
            nodeId INTEGER,
            mainComponentId INTEGER
            )';         
        $dbh->exec($command);          
        
        $insertStmt = $dbh->prepare("INSERT INTO ". $tableName. "(id, name, mainClass, subClass, 
                      nodeId, mainComponentId) VALUES(?,?,?,?,?,?)");
    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['name'], 
                                       $row['mainClass'],
                                       $row['subClass'], 
                                       $row['nodeId'], 
                                       $row['mainComponentId']));
        }                    
    }  
}

function SaveSelectedComponents($dbh)
    {
        if(!isset($_POST['selectedComponents']))
        {
            return false;
        }

        try
        { 

        // $selectedComponentsTable = $_POST['selectedComponentsTableName'];       
        $selectedComponentsObject = json_decode($_POST['selectedComponents'], true);
        foreach($selectedComponentsObject as $selectedComponentsTable =>$componentsList)            
        {
            if(!array_key_exists("selectedCompoents",$componentsList))
            {
                continue;
            }

            $nodeIdvsComponentIdList = NULL;
            if(array_key_exists("nodeIdvsComponentIdList",$componentsList))
            {
                $nodeIdvsComponentIdList = $componentsList['nodeIdvsComponentIdList'];
            }

            $selectedComponents = $componentsList['selectedCompoents'];

          
                // create selected components table

                // drop table if exists
                $command = 'DROP TABLE IF EXISTS '.$selectedComponentsTable. ';';
                $dbh->exec($command);

                $command = 'CREATE TABLE '. $selectedComponentsTable. '(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    name TEXT NOT NULL,
                    mainClass TEXT NOT NULL,
                    subClass TEXT NOT NULL,
                    nodeId INTEGER,
                    mainComponentId INTEGER
                    )';         
                $dbh->exec($command);    

                for($index = 0; $index < count($selectedComponents); $index++)
                {
                    $selectedComponent = $selectedComponents[$index];     
                   

                    $name = $selectedComponent['Name'];
                    $mainClass =  $selectedComponent['MainComponentClass'];
                    $subClass =$selectedComponent['ComponentClass'];
                    $nodeId = null;
                    if(isset($selectedComponent['NodeId']))
                    {
                        $nodeId = (int)$selectedComponent['NodeId'];
                    }

                    $mainCompId = null;
                    if($nodeId !== NULL && 
                       $nodeIdvsComponentIdList &&
                       $nodeIdvsComponentIdList[$nodeId])
                    {
                        $mainCompId = (int)$nodeIdvsComponentIdList[$nodeId];
                    }

                    $insertQuery = 'INSERT INTO '.  $selectedComponentsTable.'(name, mainClass, subClass, nodeId, mainComponentId) VALUES(?,?,?,?,?) ';
                    $values = array($name,  $mainClass, $subClass,  $nodeId, $mainCompId);
                    
                    $stmt = $dbh->prepare($insertQuery);                    
                    $stmt->execute($values);   
                }  
            }       
        }
        catch(Exception $e) 
        { 
            return false;
        } 

        return true;
        // $nodeIdvsComponentIdList = NULL;
        // if(isset($_POST['nodeIdvsComponentIdList']))
        // {
        //     $nodeIdvsComponentIdList = json_decode($_POST['nodeIdvsComponentIdList'], true);
        // }

        // $projectName = $_POST['ProjectName'];
        // $checkName = $_POST['CheckName'];
        // $dbh;
        // try
        //     {        
        //         // open database
        //         $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
        //         $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
                
        //         // begin the transaction
        //         $dbh->beginTransaction();

        //         // create selected components table

        //         // drop table if exists
        //         $command = 'DROP TABLE IF EXISTS '.$selectedComponentsTable. ';';
        //         $dbh->exec($command);

        //         $command = 'CREATE TABLE '. $selectedComponentsTable. '(
        //             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        //             name TEXT NOT NULL,
        //             mainClass TEXT NOT NULL,
        //             subClass TEXT NOT NULL,
        //             nodeId INTEGER,
        //             mainComponentId INTEGER
        //             )';         
        //         $dbh->exec($command);    

        //         for($index = 0; $index < count($selectedComponents); $index++)
        //         {
        //             $selectedComponent = $selectedComponents[$index];     
                   

        //             $name = $selectedComponent['Name'];
        //             $mainClass =  $selectedComponent['MainComponentClass'];
        //             $subClass =$selectedComponent['ComponentClass'];
        //             $nodeId = null;
        //             if(isset($selectedComponent['NodeId']))
        //             {
        //                 $nodeId = (int)$selectedComponent['NodeId'];
        //             }

        //             $mainCompId = null;
        //             if($nodeId !== NULL && 
        //                $nodeIdvsComponentIdList &&
        //                $nodeIdvsComponentIdList[$nodeId])
        //             {
        //                 $mainCompId = (int)$nodeIdvsComponentIdList[$nodeId];
        //             }

        //             $insertQuery = 'INSERT INTO '.  $selectedComponentsTable.'(name, mainClass, subClass, nodeId, mainComponentId) VALUES(?,?,?,?,?) ';
        //             $values = array($name,  $mainClass, $subClass,  $nodeId, $mainCompId);
                    
        //             $stmt = $dbh->prepare($insertQuery);                    
        //             $stmt->execute($values);   
        //         }
                
        //         // commit update
        //         $dbh->commit();
        //         $dbh = null; //This is how you close a PDO connection                    
                              
        //         return;
        //     }
        //     catch(Exception $e) 
        //     {        
        //         echo "fail"; 
        //         return;
        //     } 
        }

/*
|
|   write data sources info
|
*/ 
function SaveDataSourceInfoFromTemp($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM DatasourceInfo;");
    if($selectResults) 
    {

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
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['sourceAFileName'], 
                                       $row['sourceBFileName'],
                                       $row['sourceCFileName'], 
                                       $row['sourceDFileName'], 
                                       $row['sourceAType'],
                                       $row['sourceBType'],
                                       $row['sourceCType'], 
                                       $row['sourceDType'], 
                                       $row['orderMaintained']));
        } 
    }
}

function SaveDatasourceInfo( $dbh)
{
    
    if(!isset($_POST["dataSourceInfo"]))
    {
        return false;
    }

    $dataSourceInfo = json_decode($_POST['dataSourceInfo'],true);

    $sourceAName  = NULL;
    $sourceBName  = NULL;
    $sourceCName  = NULL;
    $sourceDName  = NULL;
    $sourceAType  = NULL;
    $sourceBType  = NULL;
    $sourceCType  = NULL;
    $sourceDType  = NULL;
    $orderMaintained  = 'true';

    if (array_key_exists("SourceAFileName",$dataSourceInfo))
    {
        $sourceAName =  $dataSourceInfo['SourceAFileName'];  
    }
    if (array_key_exists("SourceBFileName",$dataSourceInfo))
    {
        $sourceBName =  $dataSourceInfo['SourceBFileName'];  
    }
    if (array_key_exists("SourceCFileName",$dataSourceInfo))
    {
        $sourceCName =  $dataSourceInfo['SourceCFileName'];  
    }
    if (array_key_exists("SourceDFileName",$dataSourceInfo))
    {
        $sourceDName =  $dataSourceInfo['SourceDFileName'];  
    }

    if(array_key_exists("SourceAType",$dataSourceInfo))
    {
        $sourceAType =  $dataSourceInfo['SourceAType'];    
    }
    if(array_key_exists("SourceBType",$dataSourceInfo))
    {
        $sourceBType =  $dataSourceInfo['SourceBType'];                 
    }
    if(array_key_exists("SourceCType",$dataSourceInfo))
    {
        $sourceCType =  $dataSourceInfo['SourceCType'];                 
    }
    if(array_key_exists("SourceDType",$dataSourceInfo))
    {
        $sourceDType =  $dataSourceInfo['SourceDType'];                 
    }

    if(array_key_exists("orderMaintained",$dataSourceInfo))
    {
        $orderMaintained  = $dataSourceInfo['orderMaintained'];          
    } 
       
        // if(isset($_POST["SourceAFileName"]))
        // {
        //     $sourceAName =  $_POST['SourceAFileName'];   
        // }
        // if(isset($_POST["SourceBFileName"]))
        // {
        //     $sourceBName =  $_POST['SourceBFileName'];   
        // }
        // if(isset($_POST["SourceCFileName"]))
        // {
        //     $sourceCName =  $_POST['SourceCFileName'];   
        // }
        // if(isset($_POST["SourceDFileName"]))
        // {
        //     $sourceDName =  $_POST['SourceDFileName'];   
        // }

        // if(isset($_POST["SourceAType"]))
        // {
        //     $sourceAType =  $_POST['SourceAType'];   
        // }
        // if(isset($_POST["SourceBType"]))
        // {
        //     $sourceBType =  $_POST['SourceBType'];   
        // }
        // if(isset($_POST["SourceCType"]))
        // {
        //     $sourceCType =  $_POST['SourceCType'];   
        // }
        // if(isset($_POST["SourceDType"]))
        // {
        //     $sourceDType =  $_POST['SourceDType'];   
        // }  

        // if(isset($_POST["orderMaintained"]))
        // {
        //     $orderMaintained  = $_POST['orderMaintained'];   
        // } 

        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];

    //  $dbh;
     try
     {  
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
         $values = array($sourceAName,
         $sourceBName, 
         $sourceCName,  
         $sourceDName, 
         $sourceAType,  
         $sourceBType, 
         $sourceCType,  
         $sourceDType, 
         $orderMaintained);
         
         $stmt = $dbh->prepare($insertQuery);                    
         $stmt->execute($values);               
     }
     catch(Exception $e) 
     {   
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
    try
    { 
        $selectResults = $tempDbh->query("SELECT * FROM CheckModuleControlsState;");
        if($selectResults) 
        {

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

            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                            $row['comparisonSwith'], 
                                            $row['sourceAComplianceSwitch'],
                                            $row['sourceBComplianceSwitch'], 
                                            $row['sourceCComplianceSwitch'], 
                                            $row['sourceDComplianceSwitch'],
                                            $row['selectedDataSetTab'],
                                            $row['selectedCheckCase']));
            } 
        }
    }
    catch(Exception $e) 
    {       
      return false;
    } 

    return true;
}

function SaveCheckModuleControlsState($dbh)
{   

    if(!isset($_POST["checkModuleControlState"]))
    {
        return false;
    }

    $checkModuleControlState = json_decode($_POST['checkModuleControlState'],true);

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
     try
     {        
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
         $values = array($checkModuleControlState["comparisonSwithOn"],  
                         $checkModuleControlState["sourceAComplianceSwitchOn"],  
                         $checkModuleControlState["sourceBComplianceSwitchOn"],  
                         $checkModuleControlState["sourceCComplianceSwitchOn"],
                         $checkModuleControlState["sourceDComplianceSwitchOn"],
                         $checkModuleControlState["selectedDataSetTab"],
                         $checkModuleControlState["selectedCheckCase"]);
         
         $stmt = $dbh->prepare($insertQuery);                    
         $stmt->execute($values); 

        //  // commit update
        //  $dbh->commit();
        //  $dbh = null; //This is how you close a PDO connection                 
     }
     catch(Exception $e) 
     {        
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
    if(!isset($_POST['CheckCaseManager']))
    {
        echo 'fail';
        return;
    }
    $checkCaseData =  $_POST['CheckCaseManager'];   

    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
                
    $dbh;
    try
    {        
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
    }
    catch(Exception $e) 
    {        
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
    try
    {    
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
    }
    catch(Exception $e) 
    {        
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
    try
    {    
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
    }
    catch(Exception $e) 
    {        
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
 
     $dbh;
     try
     {    
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
     }
     catch(Exception $e) 
     {        
         return "fail";         
     } 
 
     return "success"; 
}

function ReadCheckModuleControlsState()
{
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
    $dbh;
        try
        {   
            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            if(!CheckIfFileExists($dbPath)){
                echo 'fail';
                return;
            }

            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();  
            
            $results = $dbh->query("SELECT *FROM  CheckModuleControlsState;");   
            
            $checkModuleControlsState = array();
            if($results)
            {
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $checkModuleControlsState = array('comparisonSwith'=>$record['comparisonSwith'], 
                                                      'sourceAComplianceSwitch'=>$record['sourceAComplianceSwitch'],  
                                                      'sourceBComplianceSwitch'=>$record['sourceBComplianceSwitch'],
                                                      'sourceCComplianceSwitch'=>$record['sourceCComplianceSwitch'],
                                                      'sourceDComplianceSwitch'=>$record['sourceDComplianceSwitch'],
                                                      'selectedDataSetTab'=>$record['selectedDataSetTab'],
                                                      'selectedCheckCase'=>$record['selectedCheckCase']);
                    break;
                }
            }
            
            echo json_encode($checkModuleControlsState);

            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection    
        }
        catch(Exception $e) 
        {        
            echo "Fail"; 
            return;
        } 
}

function ReadSelectedComponents()
{
    if(!isset($_POST['source']))
    {
        echo "fail";
        return;
    }
    $source = $_POST['source'];

    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
    $dbh;
        try
        {        
            // open database
            $dbPath = getSavedCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();  
            
            $table;
            if(strtolower($source) === 'sourcea')
            {
                $table = "SourceASelectedComponents";
            }
            else if(strtolower($source) === 'sourceb')
            {
                $table = "SourceBSelectedComponents";
            }
            else if(strtolower($source) === 'sourcec')
            {
                $table = "SourceCSelectedComponents";
            }
            else if(strtolower($source) === 'sourced')
            {
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
        }
        catch(Exception $e) 
        {        
            return "fail"; 
            //return;
        } 
}

function ReadSelectedComponentsFromDB($dbh, $table)
{
    $idwiseComponents = NULL;
    $nodeIdwiseComponents = [];

    $results = $dbh->query("SELECT *FROM  ".$table);     
    if($results)
    {
        while ($component = $results->fetch(\PDO::FETCH_ASSOC)) 
        {
            $comp = array('id'=>$component['id'], 
                        'name'=>$component['name'],  
                        'mainClass'=>$component['mainClass'],
                        'subClass'=>$component['subClass'],
                        'nodeId'=>$component['nodeId'],
                        'mainComponentId'=>$component['mainComponentId']);

            // id wise components
            $idwiseComponents[$component['id']] = $comp;                       

            if($component['nodeId'] !== NULL)
            {                           
                // node id wise components             
                if(array_key_exists($component['nodeId'], $nodeIdwiseComponents))
                {
                    array_push($nodeIdwiseComponents[$component['nodeId']], $comp );
                }
                else
                {
                    $nodeIdwiseComponents[$component['nodeId']] = array( $comp );
                }                            
               
            }
            else
            {
                // class wise components             
                if(array_key_exists($component['mainClass'], $nodeIdwiseComponents))
                {
                    array_push($nodeIdwiseComponents[$component['mainClass']], $comp );
                }
                else
                {
                    $nodeIdwiseComponents[$component['mainClass']] = array( $comp );
                }
            }
        }    
    }

    $selectedComponents =array();
    if( $idwiseComponents !== NULL && 
        $nodeIdwiseComponents !== NULL)    
      {
        $selectedComponents['IdwiseSelectedComps'] = $idwiseComponents;
        $selectedComponents['NodeIdwiseSelectedComps'] = $nodeIdwiseComponents;
      }  
      
      return $selectedComponents;
}

function CreateProjectSession()
{
    if(!isset($_POST['projectName']) || 
       !isset($_POST['loadProject']) ||
       !isset($_POST['sourceAPath']) ||
       !isset($_POST['sourceBPath']) ||
       !isset($_POST['projectId']))
       {
           echo "fail";
           return;
       }

    session_start();

    $_SESSION['ProjectName'] = $_POST['projectName'];
    $_SESSION['LoadProject'] = $_POST['loadProject'];
    $_SESSION['ProjectId'] =  $_POST['projectId'];
    $_SESSION['SourceAPath'] =  $_POST['sourceAPath'];
    $_SESSION['SourceBPath'] =  $_POST['sourceBPath'];
       
    echo 'success';
}

function IsLoadProject()
{
    session_start();
    if(isset($_SESSION['LoadProject'] ))
    {
        echo $_SESSION['LoadProject'];
        return;
    }
    
    echo 'false';    
}

/*
|
|   Creates new project in Main.db
|
*/   
function CreateProject()
{
    $projectName = trim($_POST["projectName"], " ");
    if($projectName == "")
    {
        echo "Project Name cannot be empty";
        return;
    }
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query =  "select projectname from Projects where projectname='". $projectName."' COLLATE NOCASE;";      
        $count=0;
        foreach ($dbh->query($query) as $row)
        {
            $count = $count+1;
        }
        if ($count != 0)
        {
        echo "Project with provided name already exists. Please try some other name.";
        $dbh = null; //This is how you close a PDO connection
        return;
        }
    }
    catch(Exception $e) {
        echo 'Message: ' .$e->getMessage();
        return;
    } 
    
    $path = "../Projects/".$projectName;
    if (!file_exists($path)) {
        
        // create directory
        if(mkdir($path, 0777, true))
        {
            // create project database           
            $database = new SQLite3($path."/Project.db");	
        }
    }              	
    echo "success";
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
    
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");        
        // projectname is text column
        // userid is integer column
        // path is text column
        $query = 'INSERT INTO Projects (userid,projectname,type,comments,IsFavourite,description,path,status,createddate) VALUES (?,?,?,?,?,?,?,?,?)';
        $stmt = $dbh->prepare($query);
        $stmt->execute(array( $userid, $projectName, $projectType, $projectComments, $projectIsFavorite, $projectDescription, $path, $projectStatus,$projectCreatedDate));     
        $_SESSION['ProjectId'] = $dbh->lastInsertId();
        $insertedId = $dbh->lastInsertId();
        if($insertedId !=0 && $insertedId !=-1){
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
            );
         echo json_encode($array);
        }
        else{
            $array = array(
                "projectid" => -1,
            );
            echo json_encode($array);
        }
        $dbh = null; //This is how you close a PDO connection
        return;      
    }
    catch(Exception $e) {
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
    if($projectid == "")
    {
        echo "Project Id cannot be empty";
        return;
    }
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query =  "Delete from Projects where projectid='". $projectid."';";  
        $stmt = $dbh->prepare($query);      
        $stmt->execute();
        echo $stmt->rowCount();
        $dbh = null;
        deleteFolder(getProjectDirectoryPath($projectname));
        return;
    }
    catch(Exception $e) {
        echo 'Message: ' .$e->getMessage();
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
    if($userid === -1)
    {
        echo 'fail';
        return;
    }
    $permission = GetUserPermission($userid);
    try{
        $privateprojects = array();
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        if(strcasecmp ($permission, "check") == 0) {
            $query = "select * from Projects where userid=".$userid." and type= 'Private' COLLATE NOCASE";
            $stmt = $dbh->query($query);
            $privateprojects = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        $query = "select * from Projects where type = 'Public' COLLATE NOCASE";
        $stmt = $dbh->query($query);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $data = array_merge($privateprojects, $data);  
        echo json_encode($data);
        $dbh = null;
      }
      catch(Exception $e) {
        echo 'fail';
        return;
    } 
}

function SetProjectAsFavourite()
{
    $userid = trim($_POST["userid"], " ");
    $projectid = trim($_POST["ProjectId"], " ");
    $favourite = trim($_POST["Favourite"], " ");
    if($projectid === -1)
    {
        echo 'fail';
        return;
    }
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query = "UPDATE Projects SET IsFavourite=? WHERE projectid=?";
        $dbh->prepare($query)->execute([$favourite, $projectid]);
        $dbh = null;
      }
      catch(Exception $e) {
        echo 'fail';
        return;
    } 
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
    
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query = 'UPDATE Projects Set type=?,comments=?,IsFavourite=?,description=?,status=? WHERE projectid=?';
        $stmt = $dbh->prepare($query);
        $response = $stmt->execute(array( $projectType, $projectComments, $projectIsFavorite, $projectDescription, $projectStatus, $projectid));     
        echo json_encode($response);
        $dbh = null; //This is how you close a PDO connection
        return;      
    }
    catch(Exception $e) {
        echo "failed";
        return;
    } 
}
?>
