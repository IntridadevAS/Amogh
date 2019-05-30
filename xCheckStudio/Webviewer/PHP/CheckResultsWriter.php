<?php
    
    function createTempDB()
    {
        global $projectName;
        $tempCheckDB = "../Projects/".$projectName."/CheckResults_temp.db";
        if(!file_exists ($tempCheckDB ))
        {        
          // create temporary project database          
          $database = new SQLite3($tempCheckDB);	
        }
    }
    

    function writeComplianceResultToDB($checkGroupsTable, 
                                       $checkComponentsTable,
                                       $checkPropertiesTable)
    {
        global $CheckComponentsGroups;
        global $projectName;

        try
        {   
            // open database
            //$dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbPath = "../Projects/".$projectName."/CheckResults_temp.db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

            // begin the transaction
            $dbh->beginTransaction();
          
            // CheckGroups table
            
            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '. $checkGroupsTable. ';';
            $dbh->exec($command);   

            $command = 'CREATE TABLE '.$checkGroupsTable.'(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                componentClass TEXT NOT NULL,
                componentCount Integer)'; 
            $dbh->exec($command);  

            // CheckComponents table
            
            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '. $checkComponentsTable. ';';
            $dbh->exec($command);

             $command = 'CREATE TABLE '.$checkComponentsTable.'(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,                
                subComponentClass TEXT,
                status TEXT,
                nodeId TEXT,
                ownerGroup INTEGER NOT NULL)'; 
            $dbh->exec($command);    
            
             // ComparisonCheckProperties table

            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '. $checkPropertiesTable. ';';
            $dbh->exec($command);

             $command = 'CREATE TABLE '.$checkPropertiesTable.'(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,              
                value TEXT,
                result TEXT,
                severity TEXT,
                performCheck TEXT,
                description TEXT,
                ownerComponent INTEGER NOT NULL)'; 
            $dbh->exec($command);    


            foreach($CheckComponentsGroups as $mainClass => $checkComponentGroup)
            {
                // Insert group to database

                $componentClass = $checkComponentGroup->ComponentClass;
                $componentCount =  count(  $checkComponentGroup->Components );

                $insertGroupQuery = 'INSERT INTO '.$checkGroupsTable.'(componentClass, componentCount) VALUES(?,?) ';                                        
                $groupValues = array($componentClass,  $componentCount);

                $insertGroupStmt = $dbh->prepare($insertGroupQuery);
                $insertGroupStmt->execute($groupValues);  

                // get group id for recently added row
                $qry = 'SELECT id FROM '.$checkGroupsTable.' where rowid='.$dbh->lastInsertId();                
                $stmt =  $dbh->query($qry); 
                $groupId = -1;
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $groupId = $row['id'];
                    break;                    
                }

                // Insert Components to database

                foreach($checkComponentGroup->Components as $key => $checkComponent)
                {
                    $insertComponentQuery = 'INSERT INTO '.$checkComponentsTable.'(
                        name, 
                        subComponentClass, 
                        status, 
                        nodeId,
                        ownerGroup) VALUES(?,?,?,?,?) ';                                        
                    $componentValues = array($checkComponent->SourceAName, 
                                             $checkComponent->SubComponentClass,
                                             $checkComponent->Status,
                                             $checkComponent->SourceANodeId,
                                             $groupId);

                    $insertComponentStmt = $dbh->prepare($insertComponentQuery);
                    $insertComponentStmt->execute($componentValues);

                    // get component id for recently added row
                    $qry1 = 'SELECT id FROM '.$checkComponentsTable.' where rowid='.$dbh->lastInsertId();                
                    $stmt1 =  $dbh->query($qry1); 
                    $componentId=-1;
                    while ($row1 = $stmt1->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $componentId = $row1['id'];
                        break;                    
                    }

                    // insert CheckProperties to database

                    foreach($checkComponent->CheckProperties as $key => $checkProperty)
                    {
                        $insertPropertyQuery = 'INSERT INTO '.$checkPropertiesTable.'(
                                                name,
                                                value, 
                                                result, 
                                                severity,
                                                performCheck,
                                                description,
                                                ownerComponent) VALUES(?,?,?,?,?,?,?) ';                                        
                        $propertyValues = array($checkProperty->SourceAName,
                                                $checkProperty->SourceAValue,
                                                $checkProperty->Result,
                                                $checkProperty->Severity,
                                                $checkProperty->PerformCheck,
                                                $checkProperty->Description,
                                                $componentId);
                        
                        $insertPropertyStmt = $dbh->prepare($insertPropertyQuery);
                        $insertPropertyStmt->execute($propertyValues);
                    }
                }
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
    
    function writeComparisonResultToDB()
    {
        global $CheckComponentsGroups;
        global $projectName;
        try
        {   
            // open database
            //$dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbPath = "../Projects/".$projectName."/CheckResults_temp.db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

            // begin the transaction
            $dbh->beginTransaction();

            // ComparisonCheckGroups table
            
            // drop table if exists
            $command = 'DROP TABLE IF EXISTS ComparisonCheckGroups;';
            $dbh->exec($command);

            $command = 'CREATE TABLE ComparisonCheckGroups(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        componentClass TEXT NOT NULL,
                        componentCount Integer)'; 
            $dbh->exec($command);    

            // ComparisonCheckComponents table
            
            // drop table if exists
            $command = 'DROP TABLE IF EXISTS ComparisonCheckComponents;';
            $dbh->exec($command);

            $command = 'CREATE TABLE ComparisonCheckComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                sourceAName TEXT,
                sourceBName TEXT,
                subComponentClass TEXT,
                status TEXT,
                sourceANodeId TEXT,
                sourceBNodeId TEXT,
                ownerGroup INTEGER NOT NULL)'; 
            $dbh->exec($command);    

            // ComparisonCheckProperties table

            // drop table if exists
            $command = 'DROP TABLE IF EXISTS ComparisonCheckProperties;';
            $dbh->exec($command);

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
            $dbh->exec($command);    

            foreach($CheckComponentsGroups as $mainClass => $checkComponentGroup)
            {
                // Insert group to database

                $componentClass = $checkComponentGroup->ComponentClass;
                $componentCount =  count(  $checkComponentGroup->Components );

                $insertGroupQuery = 'INSERT INTO ComparisonCheckGroups(componentClass, componentCount) VALUES(?,?) ';                                        
                $groupValues = array($componentClass,  $componentCount);

                $insertGroupStmt = $dbh->prepare($insertGroupQuery);
                $insertGroupStmt->execute($groupValues);  

                // get group id for recently added row
                $qry = 'SELECT id FROM ComparisonCheckGroups where rowid='.$dbh->lastInsertId();                
                $stmt =  $dbh->query($qry); 
                $groupId = -1;
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $groupId = $row['id'];
                    break;                    
                }

                // Insert Components to database

                foreach($checkComponentGroup->Components as $key => $checkComponent)
                {
                    $insertComponentQuery = 'INSERT INTO ComparisonCheckComponents(
                        sourceAName, 
                        sourceBName, 
                        subComponentClass, 
                        status, 
                        sourceANodeId, 
                        sourceBNodeId,
                        ownerGroup) VALUES(?,?,?,?,?,?,?) ';                                        
                    $componentValues = array($checkComponent->SourceAName,  
                                             $checkComponent->SourceBName,
                                             $checkComponent->SubComponentClass,
                                             $checkComponent->Status,
                                             $checkComponent->SourceANodeId,
                                             $checkComponent->SourceBNodeId,
                                             $groupId);

                    $insertComponentStmt = $dbh->prepare($insertComponentQuery);
                    $insertComponentStmt->execute($componentValues);
                    
                    // get component id for recently added row
                    $qry1 = 'SELECT id FROM ComparisonCheckComponents where rowid='.$dbh->lastInsertId();                
                    $stmt1 =  $dbh->query($qry1); 
                    $componentId=-1;
                    while ($row1 = $stmt1->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $componentId = $row1['id'];
                        break;                    
                    }

                    // insert CheckProperties to database

                    foreach($checkComponent->CheckProperties as $key => $checkProperty)
                    {
                        $insertPropertyQuery = 'INSERT INTO ComparisonCheckProperties(
                            sourceAName, 
                            sourceBName, 
                            sourceAValue, 
                            sourceBValue, 
                            result, 
                            severity,
                            performCheck,
                            description,
                            ownerComponent) VALUES(?,?,?,?,?,?,?,?,?) ';                                        
                        $propertyValues = array($checkProperty->SourceAName,  
                                                 $checkProperty->SourceBName,
                                                 $checkProperty->SourceAValue,
                                                 $checkProperty->SourceBValue,
                                                 $checkProperty->Result,
                                                 $checkProperty->Severity,
                                                 $checkProperty->PerformCheck,
                                                 $checkProperty->Description,
                                                 $componentId);
    
                        $insertPropertyStmt = $dbh->prepare($insertPropertyQuery);
                        $insertPropertyStmt->execute($propertyValues);
                    }
                }            
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

    function writeNotCheckedComponentsToDB($notCheckedComponents,                                              
                                           $tableName,
                                           $projectName)
    {        
        try
        {   
            // open database
            //$dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbPath = "../Projects/".$projectName."/CheckResults_temp.db";
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
    
    function writeNotMatchedComponentsToDB($notMatchedComponents,                                              
                                            $tableName,
                                            $projectName)
    {        
        try
        {   
            // open database
            //$dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbPath = "../Projects/".$projectName."/CheckResults_temp.db";
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

            foreach($notMatchedComponents as $key =>$value)            
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

                $insertQuery = 'INSERT INTO '. $tableName.'(name, mainClass, subClass, nodeId, mainTableId) VALUES(?,?,?,?,?) ';                                        
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
?>