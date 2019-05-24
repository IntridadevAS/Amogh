<?php

    include 'Utility.php';       

    if(!isset($_POST['SourceANodeIdvsComponentIdList']) ||       
       !isset($_POST["SourceASelectedComponents"]) ||      
       !isset($_POST["SourceAFileName"]) ||       
       !isset($_POST["CheckCaseManager"]))
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

       // save checkmodele control states
       writeCheckModuleControlsState($projectName);
       function writeCheckModuleControlsState($projectName)
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

           $dbh;
            try
            {        
                // open database
                $dbPath = getProjectDatabasePath($projectName);
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

       // write Source A file name, source B file name
       writeDatasourceInfo($projectName);
       function writeDatasourceInfo($projectName)
       {
        
            $sourceAName  = NULL;
            $sourceBName  = NULL;
            $sourceAType  = NULL;
            $sourceBType  = NULL;
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
          
            $dbh;
            try
            {        
                // open database
                $dbPath = getProjectDatabasePath($projectName);
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
                    sourceBType TEXT)';         
                $dbh->exec($command);    

                $insertQuery = 'INSERT INTO DatasourceInfo(sourceAFileName, sourceBFileName, sourceAType, sourceBType) VALUES(?,?,?,?) ';
                $values = array($sourceAName,  $sourceBName,  $sourceAType,  $sourceBType);
                
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

       // write check case data(as JSON string)     
       writeCheckCaseData($projectName);
       function writeCheckCaseData($projectName)
       {            
            $checkCaseData =  $_POST['CheckCaseManager'];   
            
            $dbh;
            try
            {        
                // open database
                $dbPath = getProjectDatabasePath($projectName);
                $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
                
                // begin the transaction
                $dbh->beginTransaction();

                // create selected components table
                
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
       
       $SourceASelectedComponents =   json_decode($_POST['SourceASelectedComponents'],true);      
       $SourceANodeIdvsComponentIdList =  json_decode($_POST['SourceANodeIdvsComponentIdList'],true);      
      
        //var_dump( $SourceANodeIdvsComponentIdList);

        // write source a selected components
        writeSelectedComponents($projectName, 
                                'SourceASelectedComponents', 
                                $SourceASelectedComponents, 
                                $SourceANodeIdvsComponentIdList );
        
        if(isset($_POST['SourceBSelectedComponents']) &&
           isset($_POST['SourceBNodeIdvsComponentIdList']))
        {
            $SourceBSelectedComponents =  json_decode($_POST['SourceBSelectedComponents'],true);
            $SourceBNodeIdvsComponentIdList =  json_decode($_POST['SourceBNodeIdvsComponentIdList'],true);  

            // write source b selected components
            writeSelectedComponents($projectName, 
                                'SourceBSelectedComponents', 
                                $SourceBSelectedComponents, 
                                $SourceBNodeIdvsComponentIdList );
        }

        function writeSelectedComponents($projectName, 
                                        $selectedComponentsTable, 
                                        $SelectedComponents, 
                                        $nodeIdvsComponentIdList)
        {
            $dbh;
            try
            {        
                // open database
                $dbPath = getProjectDatabasePath($projectName);
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

                for($index = 0; $index < count($SelectedComponents); $index++)
                {
                    $selectedComponent = $SelectedComponents[$index];     

                    
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
?>