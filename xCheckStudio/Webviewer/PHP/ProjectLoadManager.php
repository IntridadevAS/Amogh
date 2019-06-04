<?php

    if ($_SERVER["REQUEST_METHOD"] == "POST") 
    {
        $InvokeFunction = trim($_POST["InvokeFunction"], " ");
        switch ($InvokeFunction) 
        {
            case "CreateTempCheckSpaceDB":
                CreateTempCheckSpaceDB();
                break;        
            default:
                echo "No Function Found!";
        }
    }

    function CreateTempCheckSpaceDB()
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
            // project DB
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";           
            if(!file_exists ($dbPath ))
            { 
                echo 'fail';
                return;
            }       

            // create temp db
            $tempDBPath = "../Projects/".$projectName."/".$projectName."_temp.db";   
            if(file_exists ($tempDBPath ))
            { 
                unlink($tempDBPath);
            }

            // create project database          
            $database = new SQLite3($tempDBPath); 

            // open database                        
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");                 
            $tempDbh = new PDO("sqlite:$tempDBPath") or die("cannot open the database");

            // begin the transaction
            $dbh->beginTransaction();
            $tempDbh->beginTransaction();            
          
            // copy data tables to temp DB
            // comparison result tables table                               
            CopyComponents( $dbh, $tempDbh, "SourceAComponents", "SourceAProperties");          
            CopyComponents( $dbh, $tempDbh, "SourceBComponents", "SourceBProperties");

            // save check case info 
            CopyCheckCaseInfo($dbh, $tempDbh);

            CopyCheckModuleControlsStateToCheckSpaceDB($dbh, $tempDbh);
            CopyDataSourceInfoToCheckSpaceDB($dbh, $tempDbh);              

            CopyVieweroptions($dbh, $tempDbh, "SourceAViewerOptions");
            CopyVieweroptions($dbh, $tempDbh, "SourceBViewerOptions");

            CopySelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceASelectedComponents");
            CopySelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceBSelectedComponents");

            CopyNotSelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceANotSelectedComponents");
            CopyNotSelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceBNotSelectedComponents");

            // comparison result tables table                               
            CopyComparisonCheckGroups( $dbh, $tempDbh);                 
            CopyComparisonCheckComponents( $dbh, $tempDbh);
            CopyComparisonCheckProperties( $dbh, $tempDbh);
            CopyNotMatchedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceANotMatchedComponents");
            CopyNotMatchedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceBNotMatchedComponents");

            // source a compliance result tables table     
            CopySourceAComplianceCheckGroups($dbh, $tempDbh);
            CopySourceAComplianceCheckComponents($dbh, $tempDbh);
            CopySourceAComplianceCheckProperties($dbh, $tempDbh);

            // source b compliance result tables table          
            CopySourceBComplianceCheckGroups($dbh, $tempDbh);
            CopySourceBComplianceCheckComponents($dbh, $tempDbh);
            CopySourceBComplianceCheckProperties($dbh, $tempDbh);               

            // save check result statistics
            CopyCheckStatistics($dbh, $tempDbh);

            // commit update
            $dbh->commit();
            $tempDbh->commit();
            $dbh = null; //This is how you close a PDO connection                    
            $tempDbh = null; //This is how you close a PDO connection        
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        } 

        echo "success"; 
        return;
    }

    function  CopyCheckStatistics($fromDbh, $toDbh)
    {     
        $results = $fromDbh->query("SELECT * FROM CheckStatistics");
        if($results)
        {

            $command = 'DROP TABLE IF EXISTS CheckStatistics;';
            $toDbh->exec($command);  
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
            $toDbh->exec($command);  
    
            $insertStmt = $toDbh->prepare("INSERT INTO CheckStatistics(id, comparisonOK, comparisonError, comparisonWarning, comparisonNoMatch,
            comparisonUndefined,comparisonCheckGroupsInfo, sourceAComplianceOK, sourceAComplianceError, sourceAComplianceWarning, sourceAComplianceCheckGroupsInfo,
            sourceBComplianceOK, sourceBComplianceError, sourceBComplianceWarning, sourceBComplianceCheckGroupsInfo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"); 

           

            while ($row = $results->fetch(\PDO::FETCH_ASSOC)) 
            {  
                $insertStmt->execute(array($row['id'], 
                                    $$row['comparisonOK'], 
                                    $row['comparisonError'],
                                    $row['comparisonWarning'], 
                                    $$row['comparisonNoMatch'], 
                                    $row['comparisonUndefined'],
                                    $row['comparisonCheckGroupsInfo'], 
                                    $$row['sourceAComplianceOK'], 
                                    $row['sourceAComplianceError'],
                                    $row['sourceAComplianceWarning'], 
                                    $row['sourceAComplianceCheckGroupsInfo'], 
                                    $row['sourceBComplianceOK'],
                                    $row['sourceBComplianceError'], 
                                    $row['sourceBComplianceWarning'],
                                    $row['sourceBComplianceCheckGroupsInfo']));
            }   
        }     
    }

    function CopySourceBComplianceCheckGroups($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM SourceBComplianceCheckGroups");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckGroups;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE SourceBComplianceCheckGroups(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                componentClass TEXT NOT NULL,
                componentCount Integer)'; 
            $toDbh->exec($command);  

            $insertStmt = $toDbh->prepare("INSERT INTO SourceBComplianceCheckGroups(id, componentClass, componentCount) VALUES(?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['componentClass'], 
                                        $row['componentCount']));
            }   
        }
    }

    function CopySourceBComplianceCheckComponents($fromDbh, $toDbh)
    {  
        $selectResults = $fromDbh->query("SELECT * FROM SourceBComplianceCheckComponents");
        if($selectResults) 
        {
    
            $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckComponents;';
            $toDbh->exec($command);    
            $command = 'CREATE TABLE SourceBComplianceCheckComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,                
                subComponentClass TEXT,
                status TEXT,
                nodeId TEXT,
                ownerGroup INTEGER NOT NULL)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceBComplianceCheckComponents(id, name, subComponentClass, status,
                                        nodeId, ownerGroup) VALUES(?,?,?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['subComponentClass'],
                                        $row['status'], 
                                        $row['nodeId'], 
                                        $row['ownerGroup']));
            }   
        }  
    }

    function CopySourceBComplianceCheckProperties($fromDbh, $toDbh)
    {   
        $selectResults = $fromDbh->query("SELECT * FROM SourceBComplianceCheckProperties");
        if($selectResults) 
        {
    
            $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckProperties;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE SourceBComplianceCheckProperties(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,              
                value TEXT,
                result TEXT,
                severity TEXT,
                performCheck TEXT,
                description TEXT,
                ownerComponent INTEGER NOT NULL)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceBComplianceCheckProperties(id, name, value, result,
                                        severity, performCheck, description, ownerComponent) VALUES(?,?,?,?,?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['value'],
                                        $row['result'], 
                                        $row['severity'], 
                                        $row['performCheck'], 
                                        $row['description'], 
                                        $row['ownerComponent']));
            }   
        }
    }

    function CopySourceAComplianceCheckGroups($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM SourceAComplianceCheckGroups");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckGroups;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE SourceAComplianceCheckGroups(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                componentClass TEXT NOT NULL,
                componentCount Integer)'; 
            $toDbh->exec($command);  

            $insertStmt = $toDbh->prepare("INSERT INTO SourceAComplianceCheckGroups(id, componentClass, componentCount) VALUES(?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['componentClass'], 
                                        $row['componentCount']));
            }   
        }
    }

    function CopySourceAComplianceCheckComponents($fromDbh, $toDbh)
    {  
        $selectResults = $fromDbh->query("SELECT * FROM SourceAComplianceCheckComponents");
        if($selectResults) 
        {
    
            $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckComponents;';
            $toDbh->exec($command);   
            $command = 'CREATE TABLE SourceAComplianceCheckComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,                
                subComponentClass TEXT,
                status TEXT,
                nodeId TEXT,
                ownerGroup INTEGER NOT NULL)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceAComplianceCheckComponents(id, name, subComponentClass, status,
                                        nodeId, ownerGroup) VALUES(?,?,?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['subComponentClass'],
                                        $row['status'], 
                                        $row['nodeId'], 
                                        $row['ownerGroup']));
            }   
        }  
    }

    function CopySourceAComplianceCheckProperties($fromDbh, $toDbh)
    {   
        $selectResults = $fromDbh->query("SELECT * FROM SourceAComplianceCheckProperties");
        if($selectResults) 
        {
    
            $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckProperties;';
            $toDbh->exec($command);   
            $command = 'CREATE TABLE SourceAComplianceCheckProperties(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,              
                value TEXT,
                result TEXT,
                severity TEXT,
                performCheck TEXT,
                description TEXT,
                ownerComponent INTEGER NOT NULL)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceAComplianceCheckProperties(id, name, value, result,
                                        severity, performCheck, description, ownerComponent) VALUES(?,?,?,?,?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['name'], 
                                        $row['value'],
                                        $row['result'], 
                                        $row['severity'], 
                                        $row['performCheck'], 
                                        $row['description'], 
                                        $row['ownerComponent']));
            }   
        }
    }

    function   CopyNotMatchedComponentsToCheckSpaceDB($fromDbh, $toDbh, $tableName)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ".$tableName.";");
        if($selectResults) 
        {

            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '.$tableName.';';
            $toDbh->exec($command);

            $command = 'CREATE TABLE '.$tableName.'(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                    name TEXT,
                    mainClass TEXT,
                    subClass TEXT,
                    nodeId TEXT,
                    mainTableId TEXT)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare('INSERT INTO '.$tableName.'(id, name, mainClass, subClass, nodeId, mainTableId) VALUES(?, ?, ?, ?, ?, ?) ');                                        
        
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

    function CopyComparisonCheckComponents($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ComparisonCheckComponents");
        if($selectResults) 
        {
            // create table
            $command = 'DROP TABLE IF EXISTS ComparisonCheckComponents;';
            $toDbh->exec($command); 
            $command = 'CREATE TABLE ComparisonCheckComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                sourceAName TEXT,
                sourceBName TEXT,
                subComponentClass TEXT,
                status TEXT,
                sourceANodeId TEXT,
                sourceBNodeId TEXT,
                ownerGroup INTEGER NOT NULL)'; 
            $toDbh->exec($command);    
        
            $insertStmt = $toDbh->prepare("INSERT INTO ComparisonCheckComponents(id, 
                        sourceAName, sourceBName, subComponentClass, status, sourceANodeId, sourceBNodeId, ownerGroup) VALUES(?,?,?,?,?,?,?,?)");
        
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                    $row['sourceAName'], 
                                    $row['sourceBName'],
                                    $row['subComponentClass'], 
                                    $row['status'], 
                                    $row['sourceANodeId'],
                                    $row['sourceBNodeId'], 
                                    $row['ownerGroup']));
            }                    
        } 
    }

    function CopyComparisonCheckProperties($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ComparisonCheckProperties");
        if($selectResults) 
        {
            // create table
            $command = 'DROP TABLE IF EXISTS ComparisonCheckProperties;';
            $toDbh->exec($command); 
            $command = 'CREATE TABLE ComparisonCheckProperties(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                sourceAName TEXT,
                sourceBName TEXT,
                sourceAValue TEXT,
                sourceBValue TEXT,
                result TEXT,
                severity TEXT,
                performCheck TEXT,
                description TEXT,
                ownerComponent INTEGER NOT NULL)'; 
            $toDbh->exec($command); 
            
            $insertStmt = $toDbh->prepare("INSERT INTO ComparisonCheckProperties(id, sourceAName, sourceBName,
                        sourceAValue, sourceBValue, result, severity, performCheck, description, ownerComponent) VALUES(?,?,?,?,?,?,?,?,?,?)");
        
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['sourceAName'], 
                                        $row['sourceBName'],
                                        $row['sourceAValue'], 
                                        $row['sourceBValue'], 
                                        $row['result'],
                                        $row['severity'], 
                                        $row['performCheck'], 
                                        $row['description'],
                                        $row['ownerComponent']));
            }                    
        }  
    }

    function CopyComparisonCheckGroups($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ComparisonCheckGroups");
        if($selectResults) 
        {
            // create table
            $command = 'DROP TABLE IF EXISTS ComparisonCheckGroups;';
            $toDbh->exec($command);    
            $command = 'CREATE TABLE ComparisonCheckGroups(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                componentClass TEXT NOT NULL,
                componentCount Integer)'; 
            $toDbh->exec($command);    
            
            $insertStmt = $toDbh->prepare("INSERT INTO ComparisonCheckGroups(id, componentClass, componentCount) VALUES(?,?,?)");
        
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], $row['componentClass'], $row['componentCount']));
            }                    
        }      
    }

    function CopyNotSelectedComponentsToCheckSpaceDB($fromDbh, $toDbh, $tableName)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ".$tableName.";");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS '.$tableName.';';
            $toDbh->exec($command); 
            $command = 'CREATE TABLE '.$tableName.'(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,
                mainClass TEXT,
                subClass TEXT,
                nodeId TEXT,
                mainTableId TEXT)'; 
            $toDbh->exec($command);  
            
            $insertStmt = $toDbh->prepare("INSERT INTO ".$tableName."(id, name, mainClass, subClass, nodeId ,mainTableId) VALUES(?,?,?,?,?,?)");
        
        
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

    function CopySelectedComponentsToCheckSpaceDB($fromDbh, $toDbh, $tableName)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ".$tableName.";");
        if($selectResults) 
        {
            // create table
            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '.$tableName. ';';
            $toDbh->exec($command);

            $command = 'CREATE TABLE '. $tableName. '(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT NOT NULL,
                mainClass TEXT NOT NULL,
                subClass TEXT NOT NULL,
                nodeId INTEGER,
                mainComponentId INTEGER
                )';         
            $toDbh->exec($command);   
            
            $insertStmt = $toDbh->prepare("INSERT INTO ". $tableName. "(id, name, mainClass, subClass, 
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

    function CopyVieweroptions($fromDbh, $toDbh, $tableName)
    {
        $selectResults = $fromDbh->query("SELECT * FROM ".$tableName.";");
        if($selectResults) 
        {
            // create table
            // drop table if exists
        // drop table if exists
        $command = 'DROP TABLE IF EXISTS '.$tableName. ';';
        $toDbh->exec($command);

        $command = 'CREATE TABLE '.$tableName.'(
                    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,                
                    containerId TEXT,
                    endpointUri TEXT)';            
        $toDbh->exec($command);  

        $insertStmt = $toDbh->prepare('INSERT INTO '.$tableName.'(id, containerId, endpointUri) VALUES(?, ?,?) ');                                        
        
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['containerId'], 
                                        $row['endpointUri']));
            }           
        }
    }

    function CopyDataSourceInfoToCheckSpaceDB($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM DatasourceInfo;");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS DatasourceInfo;';
            $toDbh->exec($command);      
            $command = 'CREATE TABLE DatasourceInfo(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        sourceAFileName TEXT,
                        sourceBFileName TEXT,
                        sourceAType TEXT,
                        sourceBType TEXT,
                        orderMaintained Text)';         
            $toDbh->exec($command);      
            
            $insertStmt = $toDbh->prepare("INSERT INTO DatasourceInfo(id, sourceAFileName, sourceBFileName, sourceAType, 
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

    function CopyCheckModuleControlsStateToCheckSpaceDB($fromDbh, $toDbh)
    {
        $selectResults = $fromDbh->query("SELECT * FROM CheckModuleControlsState;");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS CheckModuleControlsState;';
            $toDbh->exec($command); 
            $command = 'CREATE TABLE CheckModuleControlsState(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        comparisonSwith TEXT,
                        sourceAComplianceSwitch TEXT,
                        sourceBComplianceSwitch TEXT,
                        sourceACheckAllSwitch TEXT,
                        sourceBCheckAllSwitch TEXT)';         
            $toDbh->exec($command);    
            
            $insertStmt = $toDbh->prepare("INSERT INTO CheckModuleControlsState(id, comparisonSwith, sourceAComplianceSwitch, sourceBComplianceSwitch, 
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

    function CopyCheckCaseInfo($dbh, $tempDbh)
    {
        $selectResults = $dbh->query("SELECT * FROM CheckCaseInfo");
        if($selectResults) 
        {

            $command = 'DROP TABLE IF EXISTS CheckCaseInfo;';
            $tempDbh->exec($command);

            $command = 'CREATE TABLE CheckCaseInfo(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        checkCaseData TEXT)';         
            $tempDbh->exec($command);      

            $insertStmt = $tempDbh->prepare("INSERT INTO CheckCaseInfo(id, checkCaseData) VALUES(?,?)");
        
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['checkCaseData']));
            }  
        }
    }

    function CopyComponents( $dbh, $tempDbh, $componentTable, $propertiesTable)
    {
        $selectResults = $dbh->query("SELECT * FROM ".$componentTable.";");  
        if($selectResults) 
        {

            // create table
            $command = 'DROP TABLE IF EXISTS '.$componentTable.';';
            $tempDbh->exec($command);    

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
            $tempDbh->exec($command);    

            $insertComponentStmt = $tempDbh->prepare("INSERT INTO ".$componentTable."(id, name, mainclass, subclass, nodeid, 
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
            $selectPropertiesResults = $dbh->query("SELECT * FROM ".$propertiesTable.";");  
            if($selectPropertiesResults) 
            {
                // create table
                $command = 'DROP TABLE IF EXISTS '.$propertiesTable.';';
                $tempDbh->exec($command);    

                // create properties table
                $command = 'CREATE TABLE '.$propertiesTable.'(
                            id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                            name TEXT NOT NULL,
                            format TEXT,
                            value TEXT,                
                            ownercomponent INTEGER NOT NULL               
                )';         
                $tempDbh->exec($command);  
                
                $insertPropertiesStmt = $tempDbh->prepare("INSERT INTO  ".$propertiesTable."(id, name, format, value, 
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
?>