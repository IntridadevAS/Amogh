<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $InvokeFunction = trim($_POST["InvokeFunction"], " ");
    switch ($InvokeFunction) {
        case "CreateProject":
            CreateProject();
            break;
        case "AddProjectToMainDB":
            AddProjectToMainDB();
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
        case "SaveCheckModuleControlsState":
            SaveCheckModuleControlsState();
            break;
        case "SaveDatasourceInfo":
            SaveDatasourceInfo();
            break;  
        case "SaveSelectedComponents":
            SaveSelectedComponents();         
            break;  
        case "SaveCheckResultsToCheckSpaceDB":
            SaveCheckResultsToCheckSpaceDB();         
            break;
        case "SaveNotSelectedComponents":
            SaveNotSelectedComponents();         
            break;
        case "SaveComponentsToCheckSpaceDB":
            SaveComponentsToCheckSpaceDB();         
            break;
        case "CreateProjectDBonSaveInCheckModule":
            CreateProjectDBonSaveInCheckModule();         
            break;
        default:
            echo "No Function Found!";
    }
}

function CreateProjectDBonSaveInCheckModule()
{
    // get project name
    session_start();   
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

    try
    {   

        $dbPath = "../Projects/".$projectName."/".$projectName.".db";     
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

function SaveComponentsToCheckSpaceDB()
{
       // get project name
       session_start();   
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

       $dbPath = "../Projects/".$projectName."/".$projectName.".db";       
       $tempDBPath = "../Projects/".$projectName."/".$projectName."_temp.db";       
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
            SaveComponents( $tempDbh, $dbh, "SourceAComponents", "SourceAProperties");          
            SaveComponents( $tempDbh, $dbh, "SourceBComponents", "SourceBProperties");
            
            // save check case info 
            SaveCheckCaseInfo($tempDbh, $dbh);

            // commit update
            $dbh->commit();
            $tempDbh->commit();
            $dbh = null; //This is how you close a PDO connection                    
            $tempDbh = null; //This is how you close a PDO connection        

            // // now delete the temporary project db
            // if (!unlink($tempDBPath))
            // {
            //     echo "fail"; 
            //     return;
            // }
                

            echo 'success';
            return;
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        } 
}

function SaveCheckCaseInfo($tempDbh, $dbh)
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

function SaveComponents( $tempDbh, $dbh, $componentTable, $propertiesTable)
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

function SaveNotSelectedComponents()
{
        if(!isset($_POST['notSelectedComponentsTable']) ||
           !isset($_POST['selectedComponents']) ||
           !isset($_POST['componentsTable'] ))
        {
            echo 'fail';
            return;
        }
       
        $selectedComponents = json_decode($_POST['selectedComponents'], true);
        $componentsTable = $_POST['componentsTable'];
        $notSelectedComponentsTable = $_POST['notSelectedComponentsTable'];       

         // get project name
         session_start();   
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
        
        // get not selected components
        $components = getSourceComponents($projectName, $componentsTable);
        if($components === NULL)
        {
            echo 'fail';
            return;
        }
      
        $notCheckedComponents = array();
        foreach ($components as $id => $component)
        {          
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

        writeNotCheckedComponentsToDB($notCheckedComponents, 
                                      $notSelectedComponentsTable, 
                                      $projectName);
}

function writeNotCheckedComponentsToDB($notCheckedComponents,                                              
                                        $tableName,
                                        $projectName)
{        
        try
        {   
            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";            
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

            // begin the transaction
            $dbh->beginTransaction();

            // SourceANotCheckedComponents table
            
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
                else{                           
                    return true;
                }
        }                    
           
    }

    return false;
} 

 // get source components
 function getSourceComponents($projectName, $componentsTable)
 {           
     $components = array();        

     try{   
             // open database
             $dbPath = "../Projects/".$projectName."/".$projectName.".db";
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


/*
|
|   write all check results to checkspace DB from temporary db
|
*/ 
function SaveCheckResultsToCheckSpaceDB()
{
       // get project name
       session_start();   
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

       $dbh;
        try
            {        
                // open database
                //$tempDbPath = "../Projects/".$projectName."/CheckResults_temp.db";
                $tempDbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
                if(!file_exists ( $tempDbPath ))
                {
                    echo 'fail';
                    return;
                }

                $tempDbh = new PDO("sqlite:$tempDbPath") or die("cannot open the database");

                $dbPath = "../Projects/".$projectName."/".$projectName.".db";
                if(!file_exists ($dbPath ))
                { 
                    // create temporary project database          
                    $database = new SQLite3($dbPath);
                }

                $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");                 

                // begin the transaction
                $dbh->beginTransaction();
                $tempDbh->beginTransaction();

                // comparison result tables table                               
                SaveComponents( $tempDbh, $dbh, "SourceAComponents", "SourceAProperties");          
                SaveComponents( $tempDbh, $dbh, "SourceBComponents", "SourceBProperties");
                
                // save check case info 
                SaveCheckCaseInfo($tempDbh, $dbh);
               
                SaveCheckModuleControlsStateToCheckSpaceDB($tempDbh, $dbh);
                SaveDataSourceInfoToCheckSpaceDB($tempDbh, $dbh);              
                
                SaveVieweroptions($tempDbh, $dbh, "SourceAViewerOptions");
                SaveVieweroptions($tempDbh, $dbh, "SourceBViewerOptions");
                
                SaveSelectedComponentsToCheckSpaceDB($tempDbh, $dbh, "SourceASelectedComponents");
                SaveSelectedComponentsToCheckSpaceDB($tempDbh, $dbh, "SourceBSelectedComponents");

                SaveNotSelectedComponentsToCheckSpaceDB($tempDbh, $dbh, "SourceANotSelectedComponents");
                SaveNotSelectedComponentsToCheckSpaceDB($tempDbh, $dbh, "SourceBNotSelectedComponents");

                // comparison result tables table                               
                SaveComparisonCheckGroups( $tempDbh, $dbh);                 
                SaveComparisonCheckComponents( $tempDbh, $dbh);
                SaveComparisonCheckProperties( $tempDbh, $dbh);
                SaveNotMatchedComponentsToCheckSpaceDB($tempDbh, $dbh, "SourceANotMatchedComponents");
                SaveNotMatchedComponentsToCheckSpaceDB($tempDbh, $dbh, "SourceBNotMatchedComponents");
               
                // source a compliance result tables table     
                SaveSourceAComplianceCheckGroups($tempDbh, $dbh);
                SaveSourceAComplianceCheckComponents($tempDbh, $dbh);
                SaveSourceAComplianceCheckProperties($tempDbh, $dbh);

                // source b compliance result tables table          
                SaveSourceBComplianceCheckGroups($tempDbh, $dbh);
                SaveSourceBComplianceCheckComponents($tempDbh, $dbh);
                SaveSourceBComplianceCheckProperties($tempDbh, $dbh);               
                              
                // save check result statistics
                SaveCheckStatistics($tempDbh, $dbh);

                // save comparison check references
                SaveCheckReferences($tempDbh, $dbh, "ComparisonCheckReferences");
                SaveCheckReferences($tempDbh, $dbh, "SourceAComplianceCheckReferences");
                SaveCheckReferences($tempDbh, $dbh, "SourceBComplianceCheckReferences");
               
                // commit update
                $dbh->commit();
                $tempDbh->commit();
                $dbh = null; //This is how you close a PDO connection                    
                $tempDbh = null; //This is how you close a PDO connection        

                // now delete the temporary CheckResults_temp.db
                if (!unlink($tempDbPath))
                {
                    echo "fail"; 
                    return;
                }
                

                echo 'success';
                return;
            }
            catch(Exception $e) 
            {        
                echo "fail"; 
                return;
            } 

}

function  SaveCheckReferences($tempDbh, $dbh, $tableName)
{
    $selectResults = $tempDbh->query("SELECT * FROM ".$tableName.";");
    if($selectResults) 
    {
        // create table
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS '.$tableName.';';
        $dbh->exec($command);  
        
        $command = 'CREATE TABLE '.$tableName.'(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            webAddress TEXT,
            document TEXT,
            pic TEXT,
            users TEXT,
            parentComponent INTEGER NOT NULL    
          )';         
        $dbh->exec($command); 

        $insertStmt = $dbh->prepare("INSERT INTO ".$tableName."(id, webAddress, document, pic, 
                      users, parentComponent) VALUES(?,?,?,?,?,?)");
    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['webAddress'], 
                                       $row['document'],
                                       $row['pic'], 
                                       $row['users'], 
                                       $row['parentComponent']));
        }                    
    }
}

function SaveSelectedComponentsToCheckSpaceDB($tempDbh, $dbh, $tableName)
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


function SaveVieweroptions($tempDbh, $dbh, $tableName)
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
                   containerId TEXT,
                   endpointUri TEXT)';            
       $dbh->exec($command);  

       $insertStmt = $dbh->prepare('INSERT INTO '.$tableName.'(id, containerId, endpointUri) VALUES(?, ?,?) ');                                        
      
       while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['containerId'], 
                                       $row['endpointUri']));
        }           
    }
}

function   SaveNotMatchedComponentsToCheckSpaceDB($tempDbh, $dbh, $tableName)
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

function SaveNotSelectedComponentsToCheckSpaceDB($tempDbh, $dbh, $tableName)
{
    $selectResults = $tempDbh->query("SELECT * FROM ".$tableName.";");
    if($selectResults) 
    {

        $command = 'DROP TABLE IF EXISTS '.$tableName.';';
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

function SaveDataSourceInfoToCheckSpaceDB($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM DatasourceInfo;");
    if($selectResults) 
    {

        $command = 'DROP TABLE IF EXISTS DatasourceInfo;';
        $command = 'CREATE TABLE DatasourceInfo(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    sourceAFileName TEXT,
                    sourceBFileName TEXT,
                    sourceAType TEXT,
                    sourceBType TEXT,
                    orderMaintained Text)';         
        $dbh->exec($command);      
        
        $insertStmt = $dbh->prepare("INSERT INTO DatasourceInfo(id, sourceAFileName, sourceBFileName, sourceAType, 
        sourceBType ,orderMaintained) VALUES(?,?,?,?,?,?)");    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['sourceAFileName'], 
                                       $row['sourceBFileName'],
                                       $row['sourceAType'], 
                                       $row['sourceBType'], 
                                       $row['orderMaintained']));
        } 
    }
}

function SaveCheckModuleControlsStateToCheckSpaceDB($tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM CheckModuleControlsState;");
    if($selectResults) 
    {

        $command = 'DROP TABLE IF EXISTS CheckModuleControlsState;';
        $command = 'CREATE TABLE CheckModuleControlsState(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    comparisonSwith TEXT,
                    sourceAComplianceSwitch TEXT,
                    sourceBComplianceSwitch TEXT,
                    sourceACheckAllSwitch TEXT,
                    sourceBCheckAllSwitch TEXT)';         
        $dbh->exec($command);    
        
        $insertStmt = $dbh->prepare("INSERT INTO CheckModuleControlsState(id, comparisonSwith, sourceAComplianceSwitch, sourceBComplianceSwitch, 
        sourceACheckAllSwitch ,sourceBCheckAllSwitch) VALUES(?,?,?,?,?,?)");    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                       $row['comparisonSwith'], 
                                       $row['sourceAComplianceSwitch'],
                                       $row['sourceBComplianceSwitch'], 
                                       $row['sourceACheckAllSwitch'], 
                                       $row['sourceBCheckAllSwitch']));
        } 
    }
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

}

function SaveSourceBComplianceCheckGroups($tempDbh, $dbh)
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

function SaveSourceBComplianceCheckComponents($tempDbh, $dbh)
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
            ownerGroup INTEGER NOT NULL)'; 
        $dbh->exec($command);    

        $insertStmt = $dbh->prepare("INSERT INTO SourceBComplianceCheckComponents(id, name, subComponentClass, status,
                                    accepted, nodeId, ownerGroup) VALUES(?,?,?,?,?,?,?)");
        
        
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                    $row['name'], 
                                    $row['subComponentClass'],
                                    $row['status'], 
                                    $row['accepted'], 
                                    $row['nodeId'], 
                                    $row['ownerGroup']));
        }   
    }  
}

function SaveSourceBComplianceCheckProperties($tempDbh, $dbh)
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
            ownerComponent INTEGER NOT NULL)'; 
        $dbh->exec($command);    

        $insertStmt = $dbh->prepare("INSERT INTO SourceBComplianceCheckProperties(id, name, value, result,
                                    severity, accepted, performCheck, description, ownerComponent) VALUES(?,?,?,?,?,?,?,?,?)");
        
        
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
                                    $row['ownerComponent']));
        }   
    }
}

function SaveSourceAComplianceCheckGroups($tempDbh, $dbh)
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

function SaveSourceAComplianceCheckComponents($tempDbh, $dbh)
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
            ownerGroup INTEGER NOT NULL)'; 
        $dbh->exec($command);    

        $insertStmt = $dbh->prepare("INSERT INTO SourceAComplianceCheckComponents(id, name, subComponentClass, status,
                                    accepted, nodeId, ownerGroup) VALUES(?,?,?,?,?,?,?)");
        
        
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                    $row['name'], 
                                    $row['subComponentClass'],
                                    $row['status'], 
                                    $row['accepted'], 
                                    $row['nodeId'], 
                                    $row['ownerGroup']));
        }   
    }  
}

function SaveSourceAComplianceCheckProperties($tempDbh, $dbh)
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
            ownerComponent INTEGER NOT NULL)'; 
        $dbh->exec($command);    

        $insertStmt = $dbh->prepare("INSERT INTO SourceAComplianceCheckProperties(id, name, value, result,
                                    severity, accepted, performCheck, description, ownerComponent) VALUES(?,?,?,?,?,?,?,?,?)");
        
        
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
                                    $row['ownerComponent']));
        }   
    }
}

// function SaveSourceBNotSelectedComponents( $tempDbh, $dbh)
// {
//     $selectResults = $tempDbh->query("SELECT * FROM SourceBNotSelectedComponents");
//     if($selectResults) 
//     {

//         $command = 'DROP TABLE IF EXISTS SourceBNotSelectedComponents;';
//         $command = 'CREATE TABLE SourceBNotSelectedComponents(
//             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
//             name TEXT,
//             mainClass TEXT,
//             subClass TEXT,
//             nodeId TEXT,
//             mainTableId TEXT)'; 
//         $dbh->exec($command);  
        
//         $insertStmt = $dbh->prepare("INSERT INTO SourceBNotSelectedComponents(id, name, mainClass, subClass, nodeId ,mainTableId) VALUES(?,?,?,?,?,?)");
    
    
//         while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
//         {           
//             $insertStmt->execute(array($row['id'], 
//                                        $row['name'], 
//                                        $row['mainClass'],
//                                        $row['subClass'], 
//                                        $row['nodeId'], 
//                                        $row['mainTableId']));
//         }   
//     }
// }

// function SaveSourceANotSelectedComponents( $tempDbh, $dbh)
// {
//     $selectResults = $tempDbh->query("SELECT * FROM SourceANotSelectedComponents");
//     if($selectResults) 
//     {

//         $command = 'DROP TABLE IF EXISTS SourceANotSelectedComponents;';
//         $command = 'CREATE TABLE SourceANotSelectedComponents(
//             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
//             name TEXT,
//             mainClass TEXT,
//             subClass TEXT,
//             nodeId TEXT,
//             mainTableId TEXT)'; 
//         $dbh->exec($command);  
        
//         $insertStmt = $dbh->prepare("INSERT INTO SourceANotSelectedComponents(id, name, mainClass, subClass, nodeId ,mainTableId) VALUES(?,?,?,?,?,?)");
    
    
//         while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
//         {           
//             $insertStmt->execute(array($row['id'], 
//                                        $row['name'], 
//                                        $row['mainClass'],
//                                        $row['subClass'], 
//                                        $row['nodeId'], 
//                                        $row['mainTableId']));
//         } 
//     }
// }

// function SaveSourceBNotMatchedComponents( $tempDbh, $dbh)
// {
//     $selectResults = $tempDbh->query("SELECT * FROM SourceBNotMatchedComponents");
//     if($selectResults) 
//     {
   
//         $command = 'DROP TABLE IF EXISTS SourceBNotMatchedComponents;';
//         $command = 'CREATE TABLE SourceBNotMatchedComponents(
//             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
//             name TEXT,
//             mainClass TEXT,
//             subClass TEXT,
//             nodeId TEXT,
//             mainTableId TEXT)'; 
//         $dbh->exec($command);  

//         $insertStmt = $dbh->prepare("INSERT INTO SourceBNotMatchedComponents(id, name, mainClass, subClass, nodeId ,mainTableId) VALUES(?,?,?,?,?,?)");
    
    
//         while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
//         {           
//             $insertStmt->execute(array($row['id'], 
//                                        $row['name'], 
//                                        $row['mainClass'],
//                                        $row['subClass'], 
//                                        $row['nodeId'], 
//                                        $row['mainTableId']));
//         } 
//     }
// }

// function SaveSourceANotMatchedComponents( $tempDbh, $dbh)
// {   
//     $selectResults = $tempDbh->query("SELECT * FROM SourceANotMatchedComponents");
//     if($selectResults) 
//     {
    
//         $command = 'DROP TABLE IF EXISTS SourceANotMatchedComponents;';
//         $command = 'CREATE TABLE SourceANotMatchedComponents(
//             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
//             name TEXT,
//             mainClass TEXT,
//             subClass TEXT,
//             nodeId TEXT,
//             mainTableId TEXT)'; 
//         $dbh->exec($command);  

//         $insertStmt = $dbh->prepare("INSERT INTO SourceANotMatchedComponents(id, name, mainClass, subClass, nodeId ,mainTableId) VALUES(?,?,?,?,?,?)");
    
    
//         while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
//         {           
//             $insertStmt->execute(array($row['id'], 
//                                        $row['name'], 
//                                        $row['mainClass'],
//                                        $row['subClass'], 
//                                        $row['nodeId'], 
//                                        $row['mainTableId']));
//         } 
//     }
// }

function SaveComparisonCheckComponents( $tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM ComparisonCheckComponents");
    if($selectResults) 
    {
        // create table
        $command = 'DROP TABLE IF EXISTS ComparisonCheckComponents;';
        $command = 'CREATE TABLE ComparisonCheckComponents(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            sourceAName TEXT,
            sourceBName TEXT,
            subComponentClass TEXT,
            status TEXT,
            accepted TEXT,
            sourceANodeId TEXT,
            sourceBNodeId TEXT,
            ownerGroup INTEGER NOT NULL)'; 
        $dbh->exec($command);    
      
        $insertStmt = $dbh->prepare("INSERT INTO ComparisonCheckComponents(id, 
                    sourceAName, sourceBName, subComponentClass, status, accepted, sourceANodeId, sourceBNodeId, ownerGroup) VALUES(?,?,?,?,?,?,?,?,?)");
    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], 
                                 $row['sourceAName'], 
                                 $row['sourceBName'],
                                 $row['subComponentClass'], 
                                 $row['status'], 
                                 $row['accepted'], 
                                 $row['sourceANodeId'],
                                 $row['sourceBNodeId'], 
                                 $row['ownerGroup']));
        }                    
    } 
}

function SaveComparisonCheckProperties( $tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM ComparisonCheckProperties");
    if($selectResults) 
    {
        // create table
        $command = 'DROP TABLE IF EXISTS ComparisonCheckProperties;';
        $command = 'CREATE TABLE ComparisonCheckProperties(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            sourceAName TEXT,
            sourceBName TEXT,
            sourceAValue TEXT,
            sourceBValue TEXT,
            result TEXT,
            severity TEXT,
            accepted TEXT,
            performCheck TEXT,
            description TEXT,
            ownerComponent INTEGER NOT NULL,
            transpose TEXT)'; 
        $dbh->exec($command); 
        
        $insertStmt = $dbh->prepare("INSERT INTO ComparisonCheckProperties(id, sourceAName, sourceBName,
                      sourceAValue, sourceBValue, result, severity, accepted, performCheck, description, ownerComponent, transpose) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)");
    
    
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
                                       $row['ownerComponent']));
        }                    
    }  
}

function SaveComparisonCheckGroups( $tempDbh, $dbh)
{
    $selectResults = $tempDbh->query("SELECT * FROM ComparisonCheckGroups");
    if($selectResults) 
    {
        // create table
        $command = 'DROP TABLE IF EXISTS ComparisonCheckGroups;';
        $command = 'CREATE TABLE ComparisonCheckGroups(
            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            componentClass TEXT NOT NULL,
            componentCount Integer,
            categoryStatus TEXT NOT NULL)'; 
        $dbh->exec($command);    
        
        $insertStmt = $dbh->prepare("INSERT INTO ComparisonCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");
    
    
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
        {           
            $insertStmt->execute(array($row['id'], $row['componentClass'], $row['componentCount'], $row['categoryStatus']));
        }                    
    }      
}

/*
|
|   write selected components
|
*/ 
function SaveSelectedComponents()
    {
        if(!isset($_POST['selectedComponentsTableName']) ||
           !isset($_POST['nodeIdvsComponentIdList']) ||
           !isset($_POST['selectedComponents']))
        {
            echo 'fail';
            return;
        }

        $selectedComponentsTable = $_POST['selectedComponentsTableName'];
        $nodeIdvsComponentIdList = json_decode($_POST['nodeIdvsComponentIdList'], true);
        $selectedComponents = json_decode($_POST['selectedComponents'], true);

         // get project name
         session_start();   
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

        $dbh;
        try
            {        
                // open database
                $dbPath = "../Projects/".$projectName."/".$projectName.".db";
                $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
                
                // begin the transaction
                $dbh->beginTransaction();

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
                    if($nodeId !== NULL && $nodeIdvsComponentIdList[$nodeId])
                    {
                        $mainCompId = (int)$nodeIdvsComponentIdList[$nodeId];
                    }

                    $insertQuery = 'INSERT INTO '.  $selectedComponentsTable.'(name, mainClass, subClass, nodeId, mainComponentId) VALUES(?,?,?,?,?) ';
                    $values = array($name,  $mainClass, $subClass,  $nodeId, $mainCompId);
                    
                    $stmt = $dbh->prepare($insertQuery);                    
                    $stmt->execute($values);   
                }
                
                // commit update
                $dbh->commit();
                $dbh = null; //This is how you close a PDO connection                    
                              
                return;
            }
            catch(Exception $e) 
            {        
                echo "fail"; 
                return;
            } 
        }

/*
|
|   write data sources info
|
*/ 
function SaveDatasourceInfo()
{
    
        $sourceAName  = NULL;
        $sourceBName  = NULL;
        $sourceAType  = NULL;
        $sourceBType  = NULL;
        $orderMaintained  = 'true';
        if(isset($_POST["SourceAFileName"]))
        {
            $sourceAName =  $_POST['SourceAFileName'];   
        }
        if(isset($_POST["SourceBFileName"]))
        {
            $sourceBName =  $_POST['SourceBFileName'];   
        }

        if(isset($_POST["SourceAType"]))
        {
            $sourceAType =  $_POST['SourceAType'];   
        }
        if(isset($_POST["SourceBType"]))
        {
            $sourceBType =  $_POST['SourceBType'];   
        }           
        if(isset($_POST["orderMaintained"]))
        {
            $orderMaintained  = $_POST['orderMaintained'];   
        } 

        // get project name
        session_start();   
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

     $dbh;
     try
     {        
         // open database
         $dbPath = "../Projects/".$projectName."/".$projectName.".db";
         $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
         
         // begin the transaction
         $dbh->beginTransaction();

         // create selected components table

         // drop table if exists
         $command = 'DROP TABLE IF EXISTS DatasourceInfo;';
         $dbh->exec($command);

         $command = 'CREATE TABLE DatasourceInfo(
             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
             sourceAFileName TEXT,
             sourceBFileName TEXT,
             sourceAType TEXT,
             sourceBType TEXT,
             orderMaintained Text)';         
         $dbh->exec($command);    

         $insertQuery = 'INSERT INTO DatasourceInfo(sourceAFileName, sourceBFileName, sourceAType, sourceBType, orderMaintained) VALUES(?,?,?,?,?) ';
         $values = array($sourceAName,  $sourceBName,  $sourceAType,  $sourceBType, $orderMaintained);
         
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
|   write check module controls state
|
*/  
function SaveCheckModuleControlsState()
{
    if(!isset($_POST["comparisonSwithOn"]) ||
    !isset($_POST["sourceAComplianceSwitchOn"]) ||
    !isset($_POST["sourceBComplianceSwitchOn"]) ||
    !isset($_POST["sourceACheckAllSwitchOn"]) ||
    !isset($_POST["sourceBCheckAllSwitchOn"]))
    {
         echo "fail"; 
         return;
    }

    // get project name
    session_start();   
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

    $dbh;
     try
     {        
         // open database
         $dbPath = "../Projects/".$projectName."/".$projectName.".db";
         $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
         
         // begin the transaction
         $dbh->beginTransaction();

         // drop table if exists
         $command = 'DROP TABLE IF EXISTS CheckModuleControlsState;';
         $dbh->exec($command);

         $command = 'CREATE TABLE CheckModuleControlsState(
             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
             comparisonSwith TEXT,
             sourceAComplianceSwitch TEXT,
             sourceBComplianceSwitch TEXT,
             sourceACheckAllSwitch TEXT,
             sourceBCheckAllSwitch TEXT)';         
         $dbh->exec($command);    

         $insertQuery = 'INSERT INTO CheckModuleControlsState(comparisonSwith, sourceAComplianceSwitch, sourceBComplianceSwitch, sourceACheckAllSwitch, sourceBCheckAllSwitch) VALUES(?,?,?,?,?) ';
         $values = array($_POST["comparisonSwithOn"],  
                         $_POST["sourceAComplianceSwitchOn"],  
                         $_POST["sourceBComplianceSwitchOn"],  
                         $_POST["sourceACheckAllSwitchOn"],
                         $_POST["sourceBCheckAllSwitchOn"]);
         
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

     // get project name
     session_start();   
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

                
    $dbh;
    try
    {        
        // open database
        $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
                    
        // begin the transaction
        $dbh->beginTransaction();

        // create CheckCaseInfo table
                    
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS CheckCaseInfo;';
        $dbh->exec($command);

        $command = 'CREATE TABLE CheckCaseInfo(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    checkCaseData TEXT)';         
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
    session_start();   
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

    $dbh;
    try
    {    
        // open database
        $dbPath = "../Projects/".$projectName."/".$projectName.".db";
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
    // get project name
    session_start();   
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

    $dbh;
    try
    {    
        // open database
        $dbPath = "../Projects/".$projectName."/".$projectName.".db";
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
     // get project name
     session_start();   
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
 
     $dbh;
     try
     {    
         // open database
         $dbPath = "../Projects/".$projectName."/".$projectName.".db";
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
    // get project name
    session_start();   
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

    $dbh;
        try
        {        
            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
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
                                                      'sourceACheckAllSwitch'=>$record['sourceACheckAllSwitch'],
                                                      'sourceBCheckAllSwitch'=>$record['sourceBCheckAllSwitch']);
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
            return "fail"; 
            //return;
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

    // get project name
    session_start();   
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

    $dbh;
        try
        {        
            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();  
            
            // source a selected components
            $sourceAIdwiseComponents = NULL;
            $sourceANodeIdwiseComponents = [];
            if(strtolower($source) === 'sourcea' || strtolower($source) === 'both')
            {
                $results = $dbh->query("SELECT *FROM  SourceASelectedComponents;");     
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
                        $sourceAIdwiseComponents[$component['id']] = $comp;                       

                        if($component['nodeId'] !== NULL)
                        {                           
                            // node id wise components             
                            if(array_key_exists($component['nodeId'], $sourceANodeIdwiseComponents))
                            {
                                array_push($sourceANodeIdwiseComponents[$component['nodeId']], $comp );
                            }
                            else
                            {
                                $sourceANodeIdwiseComponents[$component['nodeId']] = array( $comp );
                            }

                                       
                            // $sourceANodeIdwiseComponents[$component['nodeId']] = array('id'=>$component['id'], 
                            //                                                     'name'=>$component['name'],  
                            //                                                     'mainClass'=>$component['mainClass'],
                            //                                                     'subClass'=>$component['subClass'],
                            //                                                     'nodeId'=>$component['nodeId'],
                            //                                                     'mainComponentId'=>$component['mainComponentId']); 
                        }
                        else
                        {
                              // class wise components             
                              if(array_key_exists($component['mainClass'], $sourceANodeIdwiseComponents))
                              {
                                  array_push($sourceANodeIdwiseComponents[$component['mainClass']], $comp );
                              }
                              else
                              {
                                  $sourceANodeIdwiseComponents[$component['mainClass']] = array( $comp );
                              }

                            //  // class wise components                        
                            //  $sourceANodeIdwiseComponents[$component['mainClass']] = array('id'=>$component['id'], 
                            //  'name'=>$component['name'],  
                            //  'mainClass'=>$component['mainClass'],
                            //  'subClass'=>$component['subClass'],
                            //  'nodeId'=>$component['nodeId'],
                            //  'mainComponentId'=>$component['mainComponentId']); 
                        }
                    }    
                }
            }
            
            // source b selected components
            $sourceBIdwiseComponents = [];
            $sourceBNodeIdwiseComponents = [];
            if(strtolower($source) === 'sourceb' || strtolower($source) === 'both')
            {
                $results = $dbh->query("SELECT *FROM  SourceBSelectedComponents;");       
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
                        $sourceBIdwiseComponents[$component['id']] = $comp;     
                      
                        if($component['nodeId'] !== NULL)
                        {
                             // node id wise components             
                             if(array_key_exists($component['nodeId'], $sourceBNodeIdwiseComponents))
                             {
                                 array_push($sourceBNodeIdwiseComponents[$component['nodeId']], $comp );
                             }
                             else
                             {
                                 $sourceBNodeIdwiseComponents[$component['nodeId']] = array( $comp );
                             }

                            // // node id wise components
                            // $sourceBNodeIdwiseComponents[$component['nodeId']] = array('id'=>$component['id'], 
                            //                                                     'name'=>$component['name'],  
                            //                                                     'mainClass'=>$component['mainClass'],
                            //                                                     'subClass'=>$component['subClass'],
                            //                                                     'nodeId'=>$component['nodeId'],
                            //                                                     'mainComponentId'=>$component['mainComponentId']); 
                        }
                        else
                        {
                            // class wise components             
                            if(array_key_exists($component['mainClass'], $sourceBNodeIdwiseComponents))
                            {
                                array_push($sourceBNodeIdwiseComponents[$component['mainClass']], $comp );
                            }
                            else
                            {
                                $sourceBNodeIdwiseComponents[$component['mainClass']] = array( $comp );
                            }


                            //  // node id wise components
                            //  $sourceBNodeIdwiseComponents[$component['mainClass']] = array('id'=>$component['id'], 
                            //                                                                 'name'=>$component['name'],  
                            //                                                                 'mainClass'=>$component['mainClass'],
                            //                                                                 'subClass'=>$component['subClass'],
                            //                                                                 'nodeId'=>$component['nodeId'],
                            //                                                                 'mainComponentId'=>$component['mainComponentId']); 
                        }
                    }    
                }
            }
           
            $selectedComponents =array();

            if( $sourceAIdwiseComponents !== NULL && 
                $sourceANodeIdwiseComponents !== NULL)
            {
                $selectedComponents['SourceAIdwiseSelectedComps'] = $sourceAIdwiseComponents;
                $selectedComponents['SourceANodeIdwiseSelectedComps'] = $sourceANodeIdwiseComponents;
            }

            if( $sourceBIdwiseComponents !== NULL && 
                $sourceBNodeIdwiseComponents !== NULL)
            {
                $selectedComponents['SourceBIDwiseSelectedComps'] = $sourceBIdwiseComponents;
                $selectedComponents['SourceBNodeIdwiseSelectedComps'] = $sourceBNodeIdwiseComponents;
            }

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
    $description = trim($_POST["description"], " ");
    $function = trim($_POST["function"], " ");

    if($projectName == "")
    {
        echo "Project Name cannot be empty";
        return;
    }
    if($description == "")
    {
        echo "Project description cannot be empty";
        return;
    }
    if($function == "")
    {
        echo "Project function cannot be empty";
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
            //$database = new SQLite3($path."/".$projectName.".db");	
            $database = new SQLite3($path."/".$projectName."_temp.db");	
            
            // create SourceA and SourceB directories
            mkdir($path."/SourceA", 0777, true);
            mkdir($path."/SourceB", 0777, true);
            
            // set session variables for sourceA and sourceB directory paths relative to index.html
            session_start();
            $_SESSION['SourceAPath']= "Projects/".$projectName."/SourceA";             
            $_SESSION['SourceBPath']= "Projects/".$projectName."/SourceB";
        }
    }              	
    echo "success";
}

/*
|
|   Adds new project in Main.db
|
*/
function AddProjectToMainDB()
{
    session_start();
    if( !isset($_SESSION['Name']))
    {
        echo "fail";           
        return;
    }

    $userName  = $_SESSION['Name'];
    $projectName = trim($_POST["projectName"], " ");      
    $path = trim($_POST["path"], " ");
    $description = trim($_POST["description"], " ");
    $function = trim($_POST["function"], " ");    
    
    $projectScope = $_POST["projectScope"];    
    if(strtolower($projectScope) === 'true')
    {
        $projectScope = "public";
    }
    else
    {
        $projectScope = "private";
    }

    try{
    $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");        
    // first get user id from userName
    $query =  "select userid from LoginInfo where username='". $userName."';";        

    foreach ($dbh->query($query) as $row)
    {         
        $userid = $row[0];            
      
        // projectname is text column
        // userid is integer column
        // path is text column
        $query = 'INSERT INTO Projects (userid, projectname, description, function, path, projectscope) VALUES (?, ?, ?, ?, ?,?)';
        $stmt = $dbh->prepare($query);
        $stmt->execute(array( $userid, $projectName, $description, $function, $path, $projectScope));     
      
        
        // get project id for recently added row and write it into session variable
        $qry = 'SELECT projectid FROM Projects where rowid='.$dbh->lastInsertId();    
        $stmt =  $dbh->query($qry);       
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) 
        {
            $_SESSION['ProjectId'] = $row['projectid'];
            break;                    
        }

        $dbh = null; //This is how you close a PDO connection
        echo 'success';                
        
        return;
    }
    
        $dbh = null; //This is how you close a PDO connection
        echo 'fail';            
    }
    catch(Exception $e) {
        //echo 'Message: ' .$e->getMessage();
        echo "fail"; 
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
    if($projectid == "")
    {
        echo "Project Id cannot be empty";
        return;
    }
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query =  "Delete from Projects where projectid='". $projectid."';";      ;
        $stmt = $dbh->prepare($query);      
        $stmt->execute();
        echo $stmt->rowCount();
        $dbh = null;
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
    if($userid == "")
    {
        echo 'fail';
        return;
    }
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query =  "select * from Projects where userid=".$userid." OR projectscope='public';";      
        $stmt = $dbh->query($query);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
        $dbh = null;
      }
      catch(Exception $e) {
        echo 'fail';
        return;
      } 
}

?>
