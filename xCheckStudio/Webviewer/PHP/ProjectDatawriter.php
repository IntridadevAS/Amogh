<?php

    include 'Utility.php';       

    // if(!isset($_POST['SourceANodeIdvsComponentIdList']) ||       
    //    !isset($_POST["SourceASelectedComponents"]) ||      
    //    !isset($_POST["SourceAFileName"]))
    //    {
    //        echo 'fail at 9';
    //        return;
    //    }

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
                //$dbPath = getProjectDatabasePath($projectName);
                $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
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

            $dbh;
            try
            {        
                // open database
                //$dbPath = getProjectDatabasePath($projectName);
                $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
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

    
         
       if(isset($_POST['SourceASelectedComponents']) &&
          isset($_POST['SourceANodeIdvsComponentIdList']))
        {
        
        $SourceASelectedComponents =   json_decode($_POST['SourceASelectedComponents'],true);      
        $SourceANodeIdvsComponentIdList =  json_decode($_POST['SourceANodeIdvsComponentIdList'],true);      
        
            // write source a selected components
            writeSelectedComponents($projectName, 
                                    'SourceASelectedComponents', 
                                    $SourceASelectedComponents, 
                                    $SourceANodeIdvsComponentIdList );
            
            
            // write source A not selected components
            writeNotSelectedComponents($projectName,
                                        $SourceASelectedComponents,
                                        "SourceANotSelectedComponents",
                                        "SourceAComponents" );
        }

        if(isset($_POST['SourceBSelectedComponents']) &&
           isset($_POST['SourceBNodeIdvsComponentIdList']))
        {
            $SourceBSelectedComponents =  json_decode($_POST['SourceBSelectedComponents'],true);
            $SourceBNodeIdvsComponentIdList =  json_decode($_POST['SourceBNodeIdvsComponentIdList'],true);  

            // write source b selected components
            writeSelectedComponents($projectName, 
                                'SourceBSelectedComponents', 
                                $SourceBSelectedComponents, 
                                $SourceBNodeIdvsComponentIdList);

            // write source b not selected components
            writeNotSelectedComponents($projectName,
                                       $SourceBSelectedComponents,
                                       "SourceBNotSelectedComponents",
                                       "SourceBComponents");
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
                //$dbPath = getProjectDatabasePath($projectName);
                $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
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


    function writeNotSelectedComponents($projectName,
                                            $selectedComponents,
                                            $notSelectedComponentsTable,
                                            $componentsTable)
    {          

            $components = getSourceComponents($projectName, $componentsTable);
            if($components === NULL)
            {               
                return 'fail';
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
            //$dbPath = "../Projects/".$projectName."/".$projectName.".db";            
            $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
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

    // get source components
 function getSourceComponents($projectName, $componentsTable)
 {           
     $components = array();        

     try{   
             // open database
             //$dbPath = "../Projects/".$projectName."/".$projectName.".db";
             $dbPath = "../Projects/".$projectName."/".$projectName."_temp.db";
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
         echo "fail"; 
         return NULL;
     }   
     
     return $components ;
 }   
        
function isComponentSelected($component, $SelectedComponents)
{
           
    for($index = 0; $index < count($SelectedComponents); $index++)
    {
        $selectedComponent = $SelectedComponents[$index];              
        if($component['name']              ==  $selectedComponent['Name'] &&
            $component['mainclass']==  $selectedComponent['MainComponentClass'] && 
            $component['subclass']  ==  $selectedComponent['ComponentClass'])
            {                     
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
?>