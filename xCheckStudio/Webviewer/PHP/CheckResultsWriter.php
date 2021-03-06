<?php
    require_once 'GlobalConstants.php';

    function writeComplianceResultToDB($checkGroupsTable, 
                                       $checkComponentsTable,
                                       $checkPropertiesTable)
    {
        global $CheckComponentsGroups;
        global $projectName;
        global $checkName;

        try
        {   
            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
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
                componentCount Integer,
                categoryStatus TEXT NOT NULL)'; 
            $dbh->exec($command);  

            // CheckComponents table
            
            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '. $checkComponentsTable. ';';
            $dbh->exec($command);

             $command = 'CREATE TABLE '.$checkComponentsTable.'(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT,     
                mainComponentClass TEXT,           
                subComponentClass TEXT,            
                status TEXT,
                accepted TEXT,
                nodeId TEXT,
                sourceId INTEGER,
                ownerGroup INTEGER NOT NULL)'; 
            $ss = $dbh->exec($command);    
            
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
                accepted TEXT,
                performCheck TEXT,
                description TEXT,
                ownerComponent INTEGER NOT NULL,
                rule TEXT)'; 
            $dbh->exec($command);    


            foreach($CheckComponentsGroups as $mainClass => $checkComponentGroup)
            {
                // Insert group to database

                $componentClass = $checkComponentGroup->ComponentClass;
                $componentCount =  count(  $checkComponentGroup->Components );
                $categoryStatus = 'OK';

                foreach($checkComponentGroup->Components as $key => $checkComponent)
                { 
                    if($checkComponent->Status !== 'OK') {
                        $categoryStatus = 'UNACCEPTED';
                        break;
                    }
                }

                $insertGroupQuery = 'INSERT INTO '.$checkGroupsTable.'(componentClass, componentCount, categoryStatus) VALUES(?,?,?) ';                                        
                $groupValues = array($componentClass,  $componentCount, $categoryStatus);

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
                        mainComponentClass,
                        subComponentClass, 
                        status, 
                        accepted,
                        nodeId,
                        sourceId,
                        ownerGroup) VALUES(?,?,?,?,?,?,?,?) ';                                                                          

                    $componentValues = array($checkComponent->SourceAName, 
                                             $checkComponent->SourceAMainComponentClass,
                                             $checkComponent->SourceASubComponentClass,
                                             $checkComponent->Status,
                                             'false',
                                             $checkComponent->SourceANodeId,
                                             $checkComponent->SourceAId,
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
                                                accepted,
                                                performCheck,
                                                description,
                                                ownerComponent,
                                                rule) VALUES(?,?,?,?,?,?,?,?,?) ';                                        
                        $propertyValues = array($checkProperty->SourceAName,
                                                $checkProperty->SourceAValue,
                                                $checkProperty->Result,
                                                $checkProperty->Severity,
                                                'false',
                                                $checkProperty->PerformCheck,
                                                $checkProperty->Description,
                                                $componentId,
                                                $checkProperty->Rule);
                        
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
    
    function writeComparisonResultsToDB()
    {
        global $CheckComponentsGroups;
        global $projectName;
        global $checkName;
        try
        {   
            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
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
                        componentCount Integer, 
                        categoryStatus TEXT NOT NULL)'; 
            $dbh->exec($command);    

            // ComparisonCheckComponents table
            
            // drop table if exists
            $command = 'DROP TABLE IF EXISTS ComparisonCheckComponents;';
            $dbh->exec($command);

            // $command = 'CREATE TABLE ComparisonCheckComponents(
            //     id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            //     sourceAName TEXT,
            //     sourceBName TEXT,
            //     sourceCName TEXT,
            //     sourceDName TEXT,
            //     sourceAMainClass TEXT,
            //     sourceBMainClass TEXT,
            //     sourceCMainClass TEXT,
            //     sourceDMainClass TEXT,
            //     sourceASubComponentClass TEXT,
            //     sourceBSubComponentClass TEXT,
            //     sourceCSubComponentClass TEXT,
            //     sourceDSubComponentClass TEXT,
            //     status TEXT,
            //     accepted TEXT,
            //     sourceANodeId TEXT,
            //     sourceBNodeId TEXT,
            //     sourceCNodeId TEXT,
            //     sourceDNodeId TEXT,
            //     sourceAId TEXT,
            //     sourceBId TEXT,
            //     sourceCId TEXT,
            //     sourceDId TEXT,
            //     ownerGroup INTEGER NOT NULL,
            //     transpose TEXT)'; 
            $command = CREATE_COMPARISONCOMPONETS_TABLE;
            $dbh->exec($command);    

            // ComparisonCheckProperties table

            // drop table if exists
            $command = 'DROP TABLE IF EXISTS ComparisonCheckProperties;';
            $dbh->exec($command);
             
            $command = CREATE_COMPARISONPROPERTIES_TABLE;
            $dbh->exec($command);    

            foreach($CheckComponentsGroups as $mainClass => $checkComponentGroup)
            {
                // Insert group to database

                $componentClass = $checkComponentGroup->ComponentClass;
                $componentCount =  count(  $checkComponentGroup->Components );
                $categoryStatus = 'OK';               

                $groupcomponentcount = count($checkComponentGroup->Components);
                $compcount = 0;
                foreach($checkComponentGroup->Components as $key => $checkComponent)
                { 
                    if($checkComponentGroup->ComponentClass == 'undefined') {
                        $categoryStatus = 'UNACCEPTED';
                        break;
                    }
                    else if($checkComponent->Status == 'No Match') {
                        $compcount++;
                        if($compcount == $groupcomponentcount) {
                            $categoryStatus = 'No Match';
                        }
                        continue;
                    }
                    else if($checkComponent->Status !== 'OK') {
                        $categoryStatus = 'UNACCEPTED';
                        break;
                    }
                }

                $insertGroupQuery = 'INSERT INTO ComparisonCheckGroups(componentClass, componentCount, categoryStatus) VALUES(?,?,?) ';                                        
                $groupValues = array($componentClass,  $componentCount, $categoryStatus);

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
                    // $insertComponentQuery = 'INSERT INTO ComparisonCheckComponents(
                    //     sourceAName, 
                    //     sourceBName, 
                    //     sourceCName, 
                    //     sourceDName,
                    //     sourceAMainClass,
                    //     sourceBMainClass,
                    //     sourceCMainClass,
                    //     sourceDMainClass, 
                    //     sourceASubComponentClass, 
                    //     sourceBSubComponentClass,
                    //     sourceCSubComponentClass, 
                    //     sourceDSubComponentClass,
                    //     status,
                    //     accepted, 
                    //     sourceANodeId, 
                    //     sourceBNodeId,
                    //     sourceCNodeId, 
                    //     sourceDNodeId,
                    //     sourceAId, 
                    //     sourceBId,
                    //     sourceCId, 
                    //     sourceDId,
                    //     ownerGroup,
                    //     transpose) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';     
                    $insertComponentQuery = INSERT_ALLCOMPARISONCOMPONETS_TABLE;                                   
                    $componentValues = array($checkComponent->SourceAName,  
                                             $checkComponent->SourceBName,
                                             $checkComponent->SourceCName,  
                                             $checkComponent->SourceDName,
                                             $checkComponent->SourceAMainComponentClass,
                                             $checkComponent->SourceBMainComponentClass,
                                             $checkComponent->SourceCMainComponentClass,
                                             $checkComponent->SourceDMainComponentClass,
                                             $checkComponent->SourceASubComponentClass,
                                             $checkComponent->SourceBSubComponentClass,
                                             $checkComponent->SourceCSubComponentClass,
                                             $checkComponent->SourceDSubComponentClass,
                                             $checkComponent->Status,
                                             'false',
                                             $checkComponent->SourceANodeId,
                                             $checkComponent->SourceBNodeId,
                                             $checkComponent->SourceCNodeId,
                                             $checkComponent->SourceDNodeId,
                                             $checkComponent->SourceAId,
                                             $checkComponent->SourceBId,
                                             $checkComponent->SourceCId,
                                             $checkComponent->SourceDId,
                                             $groupId,
                                             null,
                                             $checkComponent->ClassMappingInfo);

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
                        // $insertPropertyQuery = 'INSERT INTO ComparisonCheckProperties(
                        //     sourceAName, 
                        //     sourceBName,
                        //     sourceCName, 
                        //     sourceDName,  
                        //     sourceAValue, 
                        //     sourceBValue, 
                        //     sourceCValue, 
                        //     sourceDValue, 
                        //     result, 
                        //     severity,
                        //     accepted,
                        //     performCheck,
                        //     description,
                        //     ownerComponent,
                        //     transpose) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';                                        
                        $insertPropertyQuery = INSERT_ALLCOMPARISONPROPERTIES_TABLE;
                        $propertyValues = array($checkProperty->SourceAName,  
                                                 $checkProperty->SourceBName,
                                                 $checkProperty->SourceCName,  
                                                 $checkProperty->SourceDName,
                                                 $checkProperty->SourceAValue,
                                                 $checkProperty->SourceBValue,
                                                 $checkProperty->SourceCValue,
                                                 $checkProperty->SourceDValue,
                                                 $checkProperty->Result,
                                                 $checkProperty->Severity,
                                                 'false',
                                                 $checkProperty->PerformCheck,
                                                 $checkProperty->Description,
                                                 $componentId,
                                                 null);
    
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

    // function writeComparisonCheckStatistics()
    // {
    //     global $projectName;
    //     global $checkName;
    //     try
    //     {   
    //         // open database
    //         $dbPath = getCheckDatabasePath($projectName, $checkName);
    //         $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

    //         // begin the transaction
    //         $dbh->beginTransaction();           
          
    //         $statistics = getCheckStatistics($dbh, 'ComparisonCheckComponents');
                       
    //         // read class wise check results counts
    //         $checkGroups = getCheckGroupsInfo($dbh, "ComparisonCheckComponents", "ComparisonCheckGroups");
    //         $checkGroupsString = json_encode($checkGroups);

    //         $command = 'CREATE TABLE ComparisonCheckStatistics(
    //             id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
    //             comparisonOK INTEGER default 0,
    //             comparisonError INTEGER default 0,
    //             comparisonWarning INTEGER default 0,
    //             comparisonNoMatch INTEGER default 0,
    //             comparisonUndefined INTEGER default 0,
    //             comparisonCheckGroupsInfo TEXT)'; 
    //         $dbh->exec($command); 

    //         $qry = 'INSERT INTO ComparisonCheckStatistics(comparisonOK, comparisonError, comparisonWarning, comparisonNoMatch, 
    //                comparisonUndefined, comparisonCheckGroupsInfo) VALUES(?,?,?,?,?,?) ';                                         
    //         $stmt = $dbh->prepare($qry);
    //         $stmt->execute(array($statistics['ok'], 
    //                              $statistics['error'], 
    //                              $statistics['warning'], 
    //                              $statistics['nomatch'], 
    //                              $statistics['undefined'], 
    //                              $checkGroupsString ));  
            
    //         // commit update
    //         $dbh->commit();
    //         $dbh = null; //This is how you close a PDO connection
    //      }                
    //      catch(Exception $e)
    //      {        
    //          echo "fail"; 
    //          return;
    //      }   
    // }

    function getCheckStatistics($dbh, $table)
    {
        // get ok components count
        $okCount = 0;
        $results = $dbh->query("SELECT COUNT(*) FROM $table where status='OK';");                
        if($results)
        {
            $okCount = $results->fetchColumn();
        }

         // get error components count
         $errorCount = 0;
         $results = $dbh->query("SELECT COUNT(*) FROM $table where status='Error';");     
         if($results)
         {
             $errorCount = $results->fetchColumn();
         }
        
         // get Warning components count
         $warningCount = 0;
         $results = $dbh->query("SELECT COUNT(*) FROM $table where status='Warning';");     
         if($results)
         {             
             $warningCount = $results->fetchColumn();
         }
       
         // get No Match components count
         $nomatchCount = 0;
         $results = $dbh->query("SELECT COUNT(*) FROM $table where status='No Match';");     
         if($results)
         {
             $nomatchCount = $results->fetchColumn();
         }         

         $undefinedCount = 0;
         $results = $dbh->query("SELECT COUNT(*) FROM $table where status='undefined';");     
         if($results)
         {
             $undefinedCount = $results->fetchColumn();
         }
         
         $statistics = array();
         $statistics['ok'] =  $okCount;
         $statistics['error'] =  $errorCount;
         $statistics['warning'] =  $warningCount;
         $statistics['nomatch'] =  $nomatchCount;
         $statistics['undefined'] =  $undefinedCount;

         return  $statistics;
    }

    function getCheckGroupsInfo($dbh, $componentsTable, $groupsTable)
    {
            $checkGroups = array();
            $groups = $dbh->query("SELECT DISTINCT ownerGroup FROM $componentsTable;");                
            if($groups)
            {
                while ($group = $groups->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $ownerGroupId = $group['ownerGroup'];

                    $groupNameResults = $dbh->query("SELECT componentClass FROM   $groupsTable where id=$ownerGroupId;");     
                    if($groupNameResults)
                    {
                        $groupName= $groupNameResults->fetchColumn();

                        // ok components
                        $oks = 0;
                        $okResults = $dbh->query("SELECT COUNT(*) FROM $componentsTable where ownerGroup= $ownerGroupId AND status='OK';");       
                        if( $okResults)
                        {
                            $oks = $okResults->fetchColumn();
                        }

                         // Error components
                         $errors = 0;
                         $errorResults = $dbh->query("SELECT COUNT(*) FROM $componentsTable where ownerGroup= $ownerGroupId AND status='Error';");       
                         if( $errorResults)
                         {
                             $errors = $errorResults->fetchColumn();
                         }

                        // Warning components
                        $warnings = 0;
                        $warningResults = $dbh->query("SELECT COUNT(*) FROM $componentsTable where ownerGroup= $ownerGroupId AND status='Warning';");       
                        if( $warningResults)
                        {
                            $warnings = $warningResults->fetchColumn();
                        }

                         // Warning components
                         $noMatches = 0;
                         $nomatchResults = $dbh->query("SELECT COUNT(*) FROM $componentsTable where ownerGroup= $ownerGroupId AND status='No Match';");       
                         if( $nomatchResults)
                         {
                             $noMatches = $nomatchResults->fetchColumn();
                         }    
                         
                         $undefinedItem = 0;
                         $results = $dbh->query("SELECT COUNT(*) FROM $componentsTable where ownerGroup= $ownerGroupId AND status='undefined';");     
                         if($results)
                         {
                             $undefinedItem = $results->fetchColumn();
                         }
                         // keep track of check groups and corresponding stastics
                         $checkGroups[$groupName] =   array('OK'=>$oks, 'Error'=>$errors, 'Warning'=>$warnings, 'No Match'=>$noMatches, 'undefined Item'=>$undefinedItem);
                    }
                }              
            }

            return $checkGroups;
    }

    function writeSourceAComplianceCheckStatistics()
    {
        global $projectName;
        global $checkName;
        try
        {   
            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

            // begin the transaction
            $dbh->beginTransaction();                     
            
            $statistics = getCheckStatistics($dbh, "SourceAComplianceCheckComponents");
                      

            // read class wise check results counts
            $checkGroups = getCheckGroupsInfo($dbh, "SourceAComplianceCheckComponents", "SourceAComplianceCheckGroups");
            $checkGroupsString = json_encode($checkGroups);

            $command = 'CREATE TABLE SourceAComplianceCheckStatistics(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                sourceAComplianceOK INTEGER default 0,
                sourceAComplianceError INTEGER default 0,
                sourceAComplianceWarning INTEGER default 0,
                sourceAComplianceCheckGroupsInfo TEXT)'; 
            $dbh->exec($command); 

            $qry = 'INSERT INTO SourceAComplianceCheckStatistics(sourceAComplianceOK, sourceAComplianceError, sourceAComplianceWarning, 
                    sourceAComplianceCheckGroupsInfo) VALUES(?,?,?,?) ';                                         
            $stmt = $dbh->prepare($qry);
            $stmt->execute(array($statistics['ok'], 
                                 $statistics['error'], 
                                 $statistics['warning'],
                                 $checkGroupsString ));  

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

   function writeSourceBComplianceCheckStatistics()
    {
        global $projectName;
        global $checkName;
        try
        {   
            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

            // begin the transaction
            $dbh->beginTransaction();                     
            
            $statistics = getCheckStatistics($dbh, "SourceBComplianceCheckComponents");
           
            // read class wise check results counts
            $checkGroups = getCheckGroupsInfo($dbh, "SourceBComplianceCheckComponents", "SourceBComplianceCheckGroups");
            $checkGroupsString = json_encode($checkGroups);

            $command = 'CREATE TABLE SourceBComplianceCheckStatistics(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,                
                sourceBComplianceOK INTEGER default 0,
                sourceBComplianceError INTEGER default 0,
                sourceBComplianceWarning INTEGER default 0,
                sourceBComplianceCheckGroupsInfo TEXT)'; 
            $dbh->exec($command); 

            $qry = 'INSERT INTO SourceBComplianceCheckStatistics(sourceBComplianceOK, sourceBComplianceError, sourceBComplianceWarning, 
                    sourceBComplianceCheckGroupsInfo) VALUES(?,?,?,?) ';                                         
            $stmt = $dbh->prepare($qry);
            $stmt->execute(array($statistics['ok'], 
                                 $statistics['error'], 
                                 $statistics['warning'],                                 
                                 $checkGroupsString ));  

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

   function writeSourceCComplianceCheckStatistics()
   {
        global $projectName;
        global $checkName;
        try
        {   
            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

            // begin the transaction
            $dbh->beginTransaction();                     
            
            $statistics = getCheckStatistics($dbh, "SourceCComplianceCheckComponents");
            
            // read class wise check results counts
            $checkGroups = getCheckGroupsInfo($dbh, "SourceCComplianceCheckComponents", "SourceCComplianceCheckGroups");
            $checkGroupsString = json_encode($checkGroups);

            $command = 'CREATE TABLE SourceCComplianceCheckStatistics(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,                
                sourceCComplianceOK INTEGER default 0,
                sourceCComplianceError INTEGER default 0,
                sourceCComplianceWarning INTEGER default 0,
                sourceCComplianceCheckGroupsInfo TEXT)'; 
            $dbh->exec($command); 

            $qry = 'INSERT INTO SourceCComplianceCheckStatistics(sourceCComplianceOK, sourceCComplianceError, sourceCComplianceWarning, 
                    sourceCComplianceCheckGroupsInfo) VALUES(?,?,?,?) ';                                         
            $stmt = $dbh->prepare($qry);
            $stmt->execute(array($statistics['ok'], 
                                    $statistics['error'], 
                                    $statistics['warning'],                                 
                                    $checkGroupsString ));  

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

    function writeSourceDComplianceCheckStatistics()
   {
        global $projectName;
        global $checkName;
        try
        {   
            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

            // begin the transaction
            $dbh->beginTransaction();                     
            
            $statistics = getCheckStatistics($dbh, "SourceDComplianceCheckComponents");
            
            // read class wise check results counts
            $checkGroups = getCheckGroupsInfo($dbh, "SourceDComplianceCheckComponents", "SourceDComplianceCheckGroups");
            $checkGroupsString = json_encode($checkGroups);

            $command = 'CREATE TABLE SourceDComplianceCheckStatistics(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,                
                sourceDComplianceOK INTEGER default 0,
                sourceDComplianceError INTEGER default 0,
                sourceDComplianceWarning INTEGER default 0,
                sourceDComplianceCheckGroupsInfo TEXT)'; 
            $dbh->exec($command); 

            $qry = 'INSERT INTO SourceDComplianceCheckStatistics(sourceDComplianceOK, sourceDComplianceError, sourceDComplianceWarning, 
                    sourceDComplianceCheckGroupsInfo) VALUES(?,?,?,?) ';                                         
            $stmt = $dbh->prepare($qry);
            $stmt->execute(array($statistics['ok'], 
                                    $statistics['error'], 
                                    $statistics['warning'],                                 
                                    $checkGroupsString ));  

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

    
    // function writeNotMatchedComponentsToDB($notMatchedComponents,                                              
    //                                         $tableName,
    //                                         $projectName,$checkName)
    // {        
    //     try
    //     {   
    //         // open database
    //         $dbPath = getCheckDatabasePath($projectName, $checkName);
    //         $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database");         

    //         // begin the transaction
    //         $dbh->beginTransaction();

    //         // SourceANotCheckedComponents table
            
    //         // drop table if exists
    //         $command = 'DROP TABLE IF EXISTS '.$tableName.';';
    //         $dbh->exec($command);

    //         $command = 'CREATE TABLE '.$tableName.'(
    //                 id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
    //                 name TEXT,
    //                 mainClass TEXT,
    //                 subClass TEXT,
    //                 nodeId TEXT,
    //                 mainTableId TEXT)'; 
    //         $dbh->exec($command);    

    //         foreach($notMatchedComponents as $key =>$value)            
    //         {               
    //             $name = $value["name"];
    //             $mainclass = $value["mainclass"];
    //             $subclass =  $value["subclass"];               

    //             $nodeId = NULL;
    //             if(array_key_exists("nodeid", $value))
    //             { 
    //                 $nodeId = $value["nodeid"];
    //             }

    //             $mainTableId = $value["id"];

    //             $insertQuery = 'INSERT INTO '. $tableName.'(name, mainClass, subClass, nodeId, mainTableId) VALUES(?,?,?,?,?) ';                                        
    //             $values = array( $name,  $mainclass, $subclass, $nodeId ,$mainTableId);

    //             $insertStmt = $dbh->prepare($insertQuery);
    //             $insertStmt->execute($values);  
    //         }

    //         // commit update
    //         $dbh->commit();
    //         $dbh = null; //This is how you close a PDO connection
    //     }
    //     catch(Exception $e)
    //     {        
    //         echo "fail"; 
    //         return;
    //     }
    // }
?>