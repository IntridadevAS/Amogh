<?php
    require_once 'Utility.php';
    require_once 'GlobalConstants.php';
    
    if(!isset($_POST["ProjectName"]) || !isset($_POST['CheckName']))
    {
        echo 'fail';
        return;
    }

    if ($_SERVER["REQUEST_METHOD"] == "POST") 
    {
        $InvokeFunction = trim($_POST["InvokeFunction"], " ");
        switch ($InvokeFunction) 
        {
            case "InitTempCheckSpaceDB":
                 InitTempCheckSpaceDB();
                break;
            case "CreateTempCheckSpaceDBByCopy":
            CreateTempCheckSpaceDBByCopy();
                break;     
            default:
                echo "No Function Found!";
        }
    }

    function CreateTempCheckSpaceDBByCopy(){
        $projectName = $_POST["ProjectName"];
        $checkName = $_POST['CheckName'];
        try{
            $destinationPath = getCheckDatabasePath($projectName, $checkName);
            $sourcePath = getSavedCheckDatabasePath($projectName, $checkName);
            if (CopyFile($sourcePath, $destinationPath) === true){
                echo "success"; 
                return;
            }
            else{
                echo 'Fail';
                return;
            }
            
        }
        catch(Exception $e){
            echo 'Fail';
            return;
        }
    }

    function InitTempCheckSpaceDB()
    {
        if(!isset($_POST['ProjectName']) ||
        !isset($_POST['CheckName']))
        {
            echo json_encode(array("Msg" =>  "Invalid input.",
            "MsgCode" => 0));  
            return;
        }

        // get project name       
        $projectName = $_POST["ProjectName"];
        $checkName = $_POST['CheckName'];

        $results;
        try
        {
            // project DB
            $dbPath = getSavedCheckDatabasePath($projectName, $checkName);    
            if(!file_exists ($dbPath ))
            { 
                echo json_encode(array("Msg" =>  "Saved data not found",
                "MsgCode" => 0));  

                // create temp checkspace db
                $tempDBPath = getCheckDatabasePath($projectName, $checkName);
                if(!file_exists ($tempDBPath ))
                { 
                    $database = new SQLite3($tempDBPath);
                } 
                return;
            }       

            // create temp checkspace db
            $tempDBPath = getCheckDatabasePath($projectName, $checkName);
            if(file_exists ($tempDBPath ))
            { 
                unlink($tempDBPath);
            }              
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
            // CopyComponents( $dbh, $tempDbh, "SourceCComponents", "SourceCProperties");          
            // CopyComponents( $dbh, $tempDbh, "SourceDComponents", "SourceDProperties");

            // save check case info 
            CopyCheckCaseInfo($dbh, $tempDbh);

            CopyCheckModuleControlsStateToCheckSpaceDB($dbh, $tempDbh);
            CopyDataSourceInfoToCheckSpaceDB($dbh, $tempDbh);              

            CopyVieweroptions($dbh, $tempDbh, "SourceAViewerOptions");
            CopyVieweroptions($dbh, $tempDbh, "SourceBViewerOptions");
            // CopyVieweroptions($dbh, $tempDbh, "SourceCViewerOptions");
            // CopyVieweroptions($dbh, $tempDbh, "SourceDViewerOptions");

            CopySelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceASelectedComponents");
            CopySelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceBSelectedComponents");
            // CopySelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceCSelectedComponents");
            // CopySelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceDSelectedComponents");

            CopyNotSelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceANotSelectedComponents");
            CopyNotSelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceBNotSelectedComponents");
            // CopyNotSelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceCNotSelectedComponents");
            // CopyNotSelectedComponentsToCheckSpaceDB($dbh, $tempDbh, "SourceDNotSelectedComponents");

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

            // save refrences
            CopyCheckReferences($dbh, $tempDbh, "a_References");
            CopyCheckReferences($dbh, $tempDbh, "b_References");
            CopyCheckReferences($dbh, $tempDbh, "c_References");
            CopyCheckReferences($dbh, $tempDbh, "d_References");            
            
            // copy hidden components
            CopyHiddenComponents($dbh, $tempDbh);

            // read data to load checkspace
            $results = ReadCheckSpaceData($tempDbh);

            // commit update
            $dbh->commit();
            $tempDbh->commit();
            $dbh = null; //This is how you close a PDO connection                    
            $tempDbh = null; //This is how you close a PDO connection        
        }
        catch(Exception $e) 
        {     
            echo json_encode(array("Msg" =>  "Failed",
            "MsgCode" => 0));               
            return;
        } 

        echo json_encode(array("Msg" =>  "success",
        "Data" => $results,
        "MsgCode" => 1));                      
        return;
    } 
    
    function  CopyHiddenComponents($fromDbh, $toDbh)
    {     
        $results = $fromDbh->query("SELECT * FROM hiddenComponents;");
        if($results)
        {

            $command = 'DROP TABLE IF EXISTS hiddenComponents;';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE hiddenComponents(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                hiddenComponents TEXT,
                visibleComponents TEXT)'; 
            $toDbh->exec($command);
           
            $insertStmt = $toDbh->prepare("INSERT INTO hiddenComponents(id, hiddenComponents, visibleComponents) VALUES(?,?,?)");            

            while ($row = $results->fetch(\PDO::FETCH_ASSOC)) 
            {  
                $insertStmt->execute(array($row['id'], 
                                    $row['hiddenComponents'],
                                    $row['visibleComponents']));
            }   
        }     
    }

    function ReadCheckSpaceData($tempDbh)
    {
        $results = array();
        try
        {
           $controlsStates = ReadCheckModuleControlStates($tempDbh);
           $results["controlStates"] = $controlsStates;

           $checkCaseInfo = ReadCheckCaseInfo($tempDbh);
           $results["checkCaseInfo"] = $checkCaseInfo;

           $sourceViewerOptions = ReadSourceViewerOptions($tempDbh);
           $results["sourceViewerOptions"] = $sourceViewerOptions;

           $classWiseComponents = ReadClassWiseComponents($tempDbh, 'mainclass');
           $results["classWiseComponents"] = $classWiseComponents;

           $selectedComponents = ReadSelectedComponents($tempDbh);
           $results["selectedComponents"] = $selectedComponents;

           $hiddenComponents = ReadHiddenComponents($tempDbh);
           $results["hiddenComponents"] = $hiddenComponents;
        }
        catch(Exception $e) 
        {              
            return NULL;
        } 

        return $results;
    }

    function ReadHiddenComponents($tempDbh)
    {
        try
        {               
            $results = $tempDbh->query("SELECT *FROM hiddenComponents;");     

            if($results)
            {
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
                {
                    return array('hiddenComponents' => $record['hiddenComponents'],
                    'visibleComponents' => $record['visibleComponents']);                                 
                } 
            }            
        }
        catch(Exception $e) 
        {              
        }    
        
        return NULL;
    }

    function ReadSelectedComponents($tempDbh)
    {
        $selectedComponents = array();   

        $srcA = ReadSelectedComponentsForSource($tempDbh, "SourceA");
        $srcB = ReadSelectedComponentsForSource($tempDbh, "SourceB");

        $selectedComponents["SourceA"] = $srcA;
        $selectedComponents["SourceB"] = $srcB;

        return $selectedComponents;
    }

    function ReadSelectedComponentsForSource($tempDbh, $source)
    {           
        try
        { 
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

            return ReadSelectedComponentsFromDB($tempDbh, $table);
        }
        catch(Exception $e) 
        {   
        } 
           
        return NULL;
    }

    function ReadSelectedComponentsFromDB($tempDbh, $table)
    {
        $idwiseComponents = NULL;
        $nodeIdwiseComponents = [];

        $results = $tempDbh->query("SELECT *FROM  ".$table);     
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
                    // // node id wise components             
                    // if(array_key_exists($component['nodeId'], $nodeIdwiseComponents))
                    // {
                    //     array_push($nodeIdwiseComponents[$component['nodeId']], $comp );
                    // }
                    // else
                    // {
                        // $nodeIdwiseComponents[$component['nodeId']] = array( $comp );
                    // }                            
                    $nodeIdwiseComponents[$component['nodeId']] =  $comp;
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

    function ReadClassWiseComponents($tempDbh, $mainClassProperty)
    { 
        $ClasswiseComponents = array();   

        $srcA = ReadClassWiseComponentsForSource($tempDbh, $mainClassProperty, "SourceA");
        $srcB = ReadClassWiseComponentsForSource($tempDbh, $mainClassProperty, "SourceB");

        $ClasswiseComponents["SourceA"] = $srcA;
        $ClasswiseComponents["SourceB"] = $srcB;

        return $ClasswiseComponents;
    }

    function ReadClassWiseComponentsForSource($tempDbh, $mainClassProperty, $source)
    { 
        $ClasswiseComponents = array();   
        try
        {  
            // Components table
            // $source = $_POST['Source'];   
            $componentsTableName;
            $propertiesTableName;         
            if(strtolower($source) == "sourcea")
            {
                $componentsTableName = "SourceAComponents";
                $propertiesTableName = "SourceAProperties";
            }
            else if(strtolower($source) == "sourceb")
            {
                $componentsTableName = "SourceBComponents";
                $propertiesTableName = "SourceBProperties";
            }
            else
            {                
                return NULL;
            }  

            $mainClasses = $tempDbh->query("SELECT DISTINCT $mainClassProperty FROM  $componentsTableName;");
            if($mainClasses) 
            { 
                while ($mainClass = $mainClasses->fetch(\PDO::FETCH_ASSOC)) 
                {                     
                    $componetWiseProperties = array();

                    $ids = $tempDbh->query("SELECT id FROM ".$componentsTableName." where $mainClassProperty='".$mainClass[$mainClassProperty]."';");  
                    while ($compIdResult = $ids->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $id = (int)$compIdResult['id'];
                       
                        $propertyList = array();

                        $properties = $tempDbh->query("SELECT *FROM  $propertiesTableName where ownercomponent=".$id.';');                        
                        while ($property = $properties->fetch(\PDO::FETCH_ASSOC)) 
                        {
                            $propertyArray = array('id' => $property['id'], 'name'=> $property['name'], 'format'=>$property['format'], 'value'=>$property['value']);   
                            
                            array_push($propertyList, $propertyArray);
                        }

                        $componetWiseProperties[$id] =  $propertyList;
                    }

                    $ClasswiseComponents[$mainClass[$mainClassProperty]] = $componetWiseProperties;
                }              
              
            } 
            else
            {
                // Properties table doesn't exist                
                return NULL;                
            }
            
         }
         catch(Exception $e) 
         {        
            return NULL;          
         } 

         return $ClasswiseComponents;
    }

    function ReadSourceViewerOptions($tempDbh)
    {      
        $sourceViewerOptions = array();
            try
            {    
                // read sources
                $sourceA;
                $sourceB;
                $results = $tempDbh->query("SELECT *FROM  DatasourceInfo;");                     
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
                {
                    if($record['sourceAFileName'] !== NULL &&
                       $record['sourceAType'] !== NULL)
                    {
                        $sourceViewerOptions['a']  = array();
                        $sourceViewerOptions['a']['source'] =  $record['sourceAFileName'];                   
                        $sourceViewerOptions['a']['sourceType'] =  $record['sourceAType'];                   
                    }
                   
                    if($record['sourceBFileName'] !== NULL &&
                        $record['sourceBType'] !== NULL)
                    {
                        $sourceViewerOptions['b']  = array();
                        $sourceViewerOptions['b']['source'] = $record['sourceBFileName']; 
                        $sourceViewerOptions['b']['sourceType'] = $record['sourceBType'];   
                    }
                }

                // read sourceAViewerOptions
                $sourceAViewerOptions = $tempDbh->query("SELECT *FROM SourceAViewerOptions;");
                if($sourceAViewerOptions) 
                {
                    while ($viewerOptions = $sourceAViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {                        
                        $sourceViewerOptions['a']['endPointUri'] = $viewerOptions['endpointUri'];                     
                        break;
                    }
                }               

                 // read sourceBViewerOptions
                 $sourceBViewerOptions = $tempDbh->query("SELECT *FROM SourceBViewerOptions;");
                 if($sourceBViewerOptions) 
                 {
                    while ($viewerOptions = $sourceBViewerOptions->fetch(\PDO::FETCH_ASSOC)) 
                    {  
                        $sourceViewerOptions['b']['endPointUri'] = $viewerOptions['endpointUri'];                      
                        break;
                    }
                 } 
            }                
            catch(Exception $e)
            {  
                return NULL;
            }  
            
            return $sourceViewerOptions;
    }

    function ReadCheckCaseInfo($tempDbh)
    {       
        try
        {               
            $results = $tempDbh->query("SELECT *FROM CheckCaseInfo;");     

            if($results)
            {
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
                {
                    return array('checkCaseData' => $record['checkCaseData']);                                 
                }  
            }          
        }
        catch(Exception $e) 
        {              
        }    
        
        return NULL;
    }

    function ReadCheckModuleControlStates($tempDbh)
    {
        $checkModuleControlsState = array();
        // $projectName = $_POST['ProjectName'];
        // $checkName = $_POST['CheckName'];
        // $dbh;
        try
        {   
            // // open database
            // $dbPath = getCheckDatabasePath($projectName, $checkName);
            // if(!CheckIfFileExists($dbPath)){
            //     echo 'fail';
            //     return;
            // }

            // $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // // begin the transaction
            // $dbh->beginTransaction();  
            
            $results = $tempDbh->query("SELECT *FROM  CheckModuleControlsState;");  
            
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

            // // commit update
            // $dbh->commit();
            // $dbh = null; //This is how you close a PDO connection    
        }
        catch(Exception $e) 
        {        
            return NULL;
        } 

        return $checkModuleControlsState;
    }

    function  CopyCheckReferences($fromDbh, $toDbh, $tableName)
    {     
        $results = $fromDbh->query("SELECT * FROM ".$tableName.";");
        if($results)
        {

            $command = 'DROP TABLE IF EXISTS '.$tableName.';';
            $toDbh->exec($command);  
            $command = 'CREATE TABLE '.$tableName.'(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                webAddress TEXT,
                document TEXT,
                pic TEXT,
                comment TEXT,
                component INTEGER NOT NULL    
              )';         
            $toDbh->exec($command);  
    
            $insertStmt = $toDbh->prepare("INSERT INTO ".$tableName."(id, webAddress, document, pic, comment,
            component) VALUES(?,?,?,?,?,?)");            

            while ($row = $results->fetch(\PDO::FETCH_ASSOC)) 
            {  
                $insertStmt->execute(array($row['id'], 
                                    $row['webAddress'], 
                                    $row['document'],
                                    $row['pic'], 
                                    $row['comment'], 
                                    $row['component']));
            }   
        }     
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
                componentCount Integer,
                categoryStatus TEXT NOT NULL)'; 
            $toDbh->exec($command);  

            $insertStmt = $toDbh->prepare("INSERT INTO SourceBComplianceCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['componentClass'], 
                                        $row['componentCount'], 
                                        $row['categoryStatus']));
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
                accepted TEXT,
                nodeId TEXT,
                sourceId TEXT,
                ownerGroup INTEGER NOT NULL)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceBComplianceCheckComponents(id, name, subComponentClass, status,
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
                accepted TEXT,
                performCheck TEXT,
                description TEXT,
                ownerComponent INTEGER NOT NULL,
                rule TEXT)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceBComplianceCheckProperties(id, name, value, result,
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
                componentCount Integer,
                categoryStatus TEXT NOT NULL)'; 
            $toDbh->exec($command);  

            $insertStmt = $toDbh->prepare("INSERT INTO SourceAComplianceCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");
            
            
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], 
                                        $row['componentClass'], 
                                        $row['componentCount'],
                                        $row['categoryStatus']));
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
                accepted TEXT,
                nodeId TEXT,
                sourceId INTEGER,
                ownerGroup INTEGER NOT NULL)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceAComplianceCheckComponents(id, name, subComponentClass, status, accepted,
                                        nodeId, sourceId, ownerGroup) VALUES(?,?,?,?,?,?,?,?)");
            
            
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
                accepted TEXT,
                performCheck TEXT,
                description TEXT,
                ownerComponent INTEGER NOT NULL,
                rule TEXT)'; 
            $toDbh->exec($command);    

            $insertStmt = $toDbh->prepare("INSERT INTO SourceAComplianceCheckProperties(id, name, value, result,
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
            // $command = 'CREATE TABLE ComparisonCheckComponents(
            //     id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
            //     sourceAName TEXT,
            //     sourceBName TEXT,
            //     sourceCName TEXT,
            //     sourceDName TEXT,
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
            $toDbh->exec($command);    
        
            // $insertStmt = $toDbh->prepare("INSERT INTO ComparisonCheckComponents(id, 
            //             sourceAName, 
            //             sourceBName, 
            //             sourceASubComponentClass, 
            //             sourceBSubComponentClass,
            //             status, 
            //             accepted, 
            //             sourceANodeId, 
            //             sourceBNodeId, 
            //             sourceAId,
            //             sourceBId,
            //             ownerGroup, 
            //             transpose) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)");
            $insertStmt = $toDbh->prepare(INSERT_ALLCOMPARISONCOMPONETS_TABLE);
        
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
                                    $row['transpose'],));
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
            $toDbh->exec($command); 
            
            // $insertStmt = $toDbh->prepare("INSERT INTO ComparisonCheckProperties(id, sourceAName, sourceBName,
            //             sourceAValue, sourceBValue, result, severity, accepted, performCheck, description, ownerComponent, transpose) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)");
            $insertStmt = $toDbh->prepare(INSERT_ALLCOMPARISONPROPERTIES_TABLE);        
        
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
                componentCount Integer,
                categoryStatus TEXT NOT NULL)'; 
            $toDbh->exec($command);    
            
            $insertStmt = $toDbh->prepare("INSERT INTO ComparisonCheckGroups(id, componentClass, componentCount, categoryStatus) VALUES(?,?,?,?)");
        
        
            while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'], $row['componentClass'], $row['componentCount'], $row['categoryStatus']));
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
                    endpointUri TEXT)';            
        $toDbh->exec($command);  

        $insertStmt = $toDbh->prepare('INSERT INTO '.$tableName.'(id, endpointUri) VALUES(?,?) ');                                        
        
        while ($row = $selectResults->fetch(\PDO::FETCH_ASSOC)) 
            {           
                $insertStmt->execute(array($row['id'],                                        
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
                        sourceCFileName TEXT,
                        sourceDFileName TEXT,
                        sourceAType TEXT,
                        sourceBType TEXT,
                        sourceCType TEXT,
                        sourceDType TEXT,
                        orderMaintained Text)';         
            $toDbh->exec($command);      
            
            $insertStmt = $toDbh->prepare("INSERT INTO DatasourceInfo(id, sourceAFileName, sourceBFileName, 
            sourceCFileName, sourceDFileName, sourceAType, sourceBType , sourceCType, sourceDType , orderMaintained) VALUES(?,?,?,?,?,?,?,?,?,?)");    
        
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
                        sourceCComplianceSwitch TEXT,
                        sourceDComplianceSwitch TEXT,
                        selectedDataSetTab TEXT,
                        selectedCheckCase TEXT)';         
            $toDbh->exec($command);    
            
            $insertStmt = $toDbh->prepare("INSERT INTO CheckModuleControlsState(id, comparisonSwith, sourceAComplianceSwitch, sourceBComplianceSwitch, 
            sourceCComplianceSwitch ,sourceDComplianceSwitch, selectedDataSetTab ,selectedCheckCase) VALUES(?,?,?,?,?,?,?,?)");    
        
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