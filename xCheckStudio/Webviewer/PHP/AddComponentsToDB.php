<?php
    require_once 'Utility.php';
    include 'GenericComponent.php';

    if(!isset($_POST['Components']) ||
       !isset($_POST['Source']) ||
       !isset($_POST['DataSourceType']) ||
       !isset($_POST['CheckName']) ||
       !isset($_POST['ProjectName']))
    {
        echo 'fail';
        return;
    }

    // get project name
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
   
    $Components = json_decode($_POST['Components'],false);
    // var_dump($Components);
    // return;
    $ComponentsList = restoreProperties( $Components);  
    $DataSourceType = $_POST['DataSourceType']; 
    
    // var_dump($ComponentsList);
    // return;

    if(strtolower($DataSourceType) == '1d')
    {
        add1DComponentsToDB($ComponentsList);
    }     
    else if(strtolower($DataSourceType) == '3d' ||
            strtolower($DataSourceType) == 'visio') {
        addComponentsToDB($ComponentsList);
    }
    else {
            echo 'fail';
            return;
    }
    
    function addComponentsToDB($ComponentsList)
    {
        global $projectName;
        global $checkName;
        //global $SourceDataSheets;

        $dbh = null;
        try{
        
            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
            
            // create Components table
            $source = $_POST['Source'];   
            $componentsTableName= null;
            $propertiesTableName= null;        
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
            else if(strtolower($source) == "sourcec")
            {
                $componentsTableName = "SourceCComponents";
                $propertiesTableName = "SourceCProperties";
            }
            else if(strtolower($source) == "sourced")
            {
                $componentsTableName = "SourceDComponents";
                $propertiesTableName = "SourceDProperties";
            }
            else
            {
                echo 'fail';
                return;
            }

             // begin the transaction
             $dbh->beginTransaction();

            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '. $componentsTableName. ';';
            $dbh->exec($command);      

            // ischecked can have values 'true' or 'false'
            $command = 'CREATE TABLE '. $componentsTableName. '(
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
                       
            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '. $propertiesTableName. ';';
            $dbh->exec($command);    

            // create properties table
            $command = 'CREATE TABLE '.  $propertiesTableName.'(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        name TEXT NOT NULL,
                        format TEXT,
                        value TEXT,                
                        ownercomponent INTEGER NOT NULL,
                        userdefined INTEGER default 0
              )';         
             $dbh->exec($command);     

             
            $nodeIdvsComponentIdList = NULL;
            for ($i = 0; $i < count($ComponentsList); $i++) 
            {
                $component = $ComponentsList[$i];

                $qry = 'INSERT INTO '.$componentsTableName. '(name, mainclass, subclass, nodeid, ischecked, parentid, componentid) VALUES(?,?,?,?,?,?,?) ';    
               
                $name = $component->Name;
                $mainComponentClass = $component->MainComponentClass;
                $subComponentClass = $component->SubComponentClass;
                $nodeId = $component->NodeId;
                $parentNodeId = $component->ParentNodeId;
                
                $values = array($name,  $mainComponentClass, $subComponentClass, $nodeId, 'true', $parentNodeId, NULL);
               
                $stmt = $dbh->prepare($qry);
                $stmt->execute($values);  

                // get component id for recently added row
                $qry = 'SELECT id FROM '.$componentsTableName. ' where rowid='.$dbh->lastInsertId();                
                $stmt =  $dbh->query($qry); 
                $componentId = NULL;
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $componentId = $row['id'];
                    break;                    
                }                 
                if( $componentId == NULL)
                {
                    continue;
                }

                // add properties to DB
                for ($j = 0; $j < count($component->properties); $j++) 
                {
                    $property = $component->properties[$j];
                   
                    $name = $property->Name;
                    $format = $property->Format;
                    $value = $property->Value;

                    $insertPropertyQuery = 'INSERT INTO '.  $propertiesTableName.'(name, format, value,  ownercomponent) VALUES(?,?,?,?) ';
                    $propertyValues = array($name,  $format, $value,  $componentId);
                    
                    $stmt = $dbh->prepare($insertPropertyQuery);                    
                    $stmt->execute($propertyValues);   
                } 
                
                // keep track of Node id vs component id
                $nodeIdvsComponentIdList[$nodeId]= (int)$componentId ;
            }          
            
            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection
                
            echo json_encode($nodeIdvsComponentIdList);               
            return;
        }
        catch(Exception $e) {        
            echo "fail"; 
            return;
        } 
    }

    function add1DComponentsToDB($ComponentsList)
    {      
        global $projectName;
        global $checkName;
        $dbh = null;
        try{
        
            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
            
            // create Components table
            $source = $_POST['Source'];
            $componentsTableName = null;
            $propertiesTableName = null;        
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
            else if(strtolower($source) == "sourcec")
            {
                $componentsTableName = "SourceCComponents";
                $propertiesTableName = "SourceCProperties";
            }
            else if(strtolower($source) == "sourced")
            {
                $componentsTableName = "SourceDComponents";
                $propertiesTableName = "SourceDProperties";
            }
            else
            {
                echo 'fail';
                return;
            }

             // begin the transaction
             $dbh->beginTransaction();

            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '. $componentsTableName. ';';
            $dbh->exec($command);    

            // ischecked can have values 'true' or 'false'
            $command = 'CREATE TABLE '. $componentsTableName. '(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT NOT NULL,
                mainclass,
                subclass,
                nodeid INTEGER,
                ischecked TEXT,
                parentid INTEGER,
                componentid INTEGER
              )';         
             $dbh->exec($command);                                                            

            // drop table if exists
            $command = 'DROP TABLE IF EXISTS '. $propertiesTableName. ';';
            $dbh->exec($command);   

             // create properties table
             $command = 'CREATE TABLE '.  $propertiesTableName.'(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        name TEXT NOT NULL,
                        format TEXT,
                        value TEXT,                
                        ownercomponent INTEGER NOT NULL,
                        userdefined INTEGER default 0               
              )';         
             $dbh->exec($command);     

             //$qry = 'INSERT INTO '.$componentsTableName. '(name, mainclass, subclass, nodeid, ischecked, parentid) VALUES ';           
             //$values = array();
             $componentIdvsDataList = array();
            for ($i = 0; $i < count($ComponentsList); $i++) {
                $component = $ComponentsList[$i];
                // var_dump($component);

                $qry = 'INSERT INTO '.$componentsTableName. '(name, mainclass, subclass, nodeid, ischecked, parentid, componentid) VALUES(?,?,?,?,?,?,?) ';    
               
                $name = $component->Name;
                $mainComponentClass = $component->MainComponentClass;
                $subComponentClass = $component->SubComponentClass;
                $componentId = $component->ComponentId;
                $values = array($name,  $mainComponentClass, $subComponentClass, NULL, 'true', NULL, $componentId);
               
                $stmt = $dbh->prepare($qry);
                $stmt->execute($values);  

                // get component id for recently added row
                $qry = 'SELECT id FROM '.$componentsTableName. ' where rowid='.$dbh->lastInsertId();                
                $stmt =  $dbh->query($qry); 
                $componentId;
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $componentId = $row['id'];
                    break;                    
                }                 

                // add properties to DB
                for ($j = 0; $j < count($component->properties); $j++) 
                {
                    $property = $component->properties[$j];
                   
                    $name = $property->Name;
                    $format = $property->Format;
                    $value = $property->Value;

                    $insertPropertyQuery = 'INSERT INTO '.  $propertiesTableName.'(name, format, value,  ownercomponent) VALUES(?,?,?,?) ';
                    $propertyValues = array($name,  $format, $value,  $componentId);
                    
                    $stmt = $dbh->prepare($insertPropertyQuery);                    
                    $stmt->execute($propertyValues);   
                }  

                 // keep track of component id vs component data
                 $componentIdvsDataList[$componentId]= array("name" => $component->Name, 
                 "mainClass" => $component->MainComponentClass, 
                 "subClass" => $component->SubComponentClass) ;              
            }          
            
            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection
                
            echo json_encode($componentIdvsDataList);           
            return;
        }
        catch(Exception $e) {        
            echo "fail"; 
            return;
        } 
    }
?>