<?php

    function writeComparisonResultToDB()
    {
        global $CheckComponentsGroups;
        global $projectName;
        try
        {   
            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

            // begin the transaction
            $dbh->beginTransaction();

            // ComparisonCheckGroups table
            $command = 'CREATE TABLE IF NOT EXISTS ComparisonCheckGroups(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        componentClass TEXT NOT NULL,
                        componentCount Integer)'; 
            $dbh->exec($command);    

            // ComparisonCheckComponents table
            $command = 'CREATE TABLE IF NOT EXISTS ComparisonCheckComponents(
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
            $command = 'CREATE TABLE IF NOT EXISTS ComparisonCheckProperties(
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
        // global $SourceANotCheckedComponents;
        // global $SourceBNotCheckedComponents;

        //global $projectName;
        try
        {   
            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

            // begin the transaction
            $dbh->beginTransaction();

            // SourceANotCheckedComponents table
            $command = 'CREATE TABLE IF NOT EXISTS '.$tableName.'(
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
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

            // begin the transaction
            $dbh->beginTransaction();

            // SourceANotCheckedComponents table
            $command = 'CREATE TABLE IF NOT EXISTS '. $tableName.'(
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