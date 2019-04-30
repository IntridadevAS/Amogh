<?php

    include 'GenericComponent.php';

    if(!isset($_POST['Components']) ||
       !isset($_POST['Source']) ||
       !isset($_POST['DataSourceType']))
    {
        echo 'fail';
        return;
    }

    session_start();
    
    // get project name
    $projectName = NULL;
    if(isset($_SESSION['projectname']))
    {
        $projectName =  $_SESSION['projectname'];              
    }
    else
    {
        echo 'fail';
        return;
    }	
   
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
    else if(strtolower($DataSourceType) == '3d') {
        addComponentsToDB($ComponentsList);
    }
    else {
            echo 'fail';
            return;
    }
    
    function addComponentsToDB($ComponentsList)
    {
        global $projectName;
        $dbh;
        try{
        
            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
            
            // create Components table
            $source = $_POST['Source'];   
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
                echo 'fail';
                return;
            }

             // begin the transaction
             $dbh->beginTransaction();

            // ischecked can have values 'true' or 'false'
            $command = 'CREATE TABLE IF NOT EXISTS '. $componentsTableName. '(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT NOT NULL,
                mainclass TEXT NOT NULL,
                subclass TEXT NOT NULL,
                nodeid INTEGER,
                ischecked TEXT,
                parentid INTEGER
              )';         
             $dbh->exec($command);                                                            

             // create properties table
             $command = 'CREATE TABLE IF NOT EXISTS '.  $propertiesTableName.'(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        name TEXT NOT NULL,
                        format TEXT,
                        value TEXT,                
                        ownercomponent INTEGER NOT NULL               
              )';         
             $dbh->exec($command);     

             
             $nodeIdvsComponentIdList = NULL;
            for ($i = 0; $i < count($ComponentsList); $i++) 
            {
                $component = $ComponentsList[$i];

                $qry = 'INSERT INTO '.$componentsTableName. '(name, mainclass, subclass, nodeid, ischecked, parentid) VALUES(?,?,?,?,?,?) ';    
               
                $name = $component->Name;
                $mainComponentClass = $component->MainComponentClass;
                $subComponentClass = $component->SubComponentClass;
                $nodeId = $component->NodeId;
                $parentNodeId = $component->ParentNodeId;
                $values = array($name,  $mainComponentClass, $subComponentClass, $nodeId, 'true', $parentNodeId);
               
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
        $dbh;
        try{
        
            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
            
            // create Components table
            $source = $_POST['Source'];   
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
                echo 'fail';
                return;
            }

             // begin the transaction
             $dbh->beginTransaction();

            // ischecked can have values 'true' or 'false'
            $command = 'CREATE TABLE IF NOT EXISTS '. $componentsTableName. '(
                id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                name TEXT NOT NULL,
                mainclass TEXT NOT NULL,
                subclass TEXT NOT NULL,
                ischecked TEXT
              )';         
             $dbh->exec($command);                                                            

             // create properties table
             $command = 'CREATE TABLE IF NOT EXISTS '.  $propertiesTableName.'(
                        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                        name TEXT NOT NULL,
                        format TEXT,
                        value TEXT,                
                        ownercomponent INTEGER NOT NULL               
              )';         
             $dbh->exec($command);     

             //$qry = 'INSERT INTO '.$componentsTableName. '(name, mainclass, subclass, nodeid, ischecked, parentid) VALUES ';           
             //$values = array();

        for ($i = 0; $i < count($ComponentsList); $i++) {
                $component = $ComponentsList[$i];

                $qry = 'INSERT INTO '.$componentsTableName. '(name, mainclass, subclass, ischecked) VALUES(?,?,?,?) ';    
               
                $name = $component->Name;
                $mainComponentClass = $component->MainComponentClass;
                $subComponentClass = $component->SubComponentClass;
                $values = array($name,  $mainComponentClass, $subComponentClass, 'true');
               
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

                ////////////////////////////////////////////
                // $qry .= "(?,?,?,?,?,?), ";
                
                // $name = $component->Name;
                // $mainComponentClass = $component->MainComponentClass;
                // $subComponentClass = $component->SubComponentClass;
                // $nodeId = $component->NodeId;
                // $parentNodeId = $component->ParentNodeId;

                // $values2 = array($name,  $mainComponentClass, $subComponentClass, $nodeId, 'true', $parentNodeId);
                // $values = array_merge($values,$values2);

                // // insert 150 records at once
                // // otherwose pdo fails to prepare query
                // if($i%150 ==0 ||  $i == count($ComponentsList)-1)
                // {
                //     $qry = substr($qry, 0, strlen($qry)-2);       
                //     $stmt = $dbh->prepare($qry);
                //     $stmt->execute($values);   

                //     // reset query string and values array
                //     $qry = 'INSERT INTO '.$componentsTableName. '(name, mainclass, subclass, nodeid, ischecked, parentid) VALUES ';
                //     $values = array();
                // }  
                
                // // add properties to DB
                // $insertPropertyQuery = 'INSERT INTO '.  $propertiesTableName.'(name, format, value,  ownercomponent) VALUES ';
                // $propertyValues = array();
                // for ($j = 0; $j < count($component->properties); $j++) {
                //     $property = $component->properties[$j];
                   
                //     $name = $property->Name;
                //     $format = $property->Format;
                //     $value = $property->Value;
                   
                //     $insertPropertyQuery .= "(?,?,?,?), ";
                //     $values2 = array($name,  $format, $value,  $nodeId);
                //     $propertyValues = array_merge($propertyValues, $values2);                  
                 
                // }

                // if( count($propertyValues) == 150 || count($ComponentsList)-1)
                // {
                //     $insertPropertyQuery = substr($insertPropertyQuery, 0, strlen($insertPropertyQuery)-2); 
                //     $stmt = $dbh->prepare($insertPropertyQuery);                    
                //     $stmt->execute($propertyValues);   

                //     // reset query string and values array
                //     $insertPropertyQuery = 'INSERT INTO '.  $propertiesTableName.'(name,  format, value, ownercomponent) VALUES ';
                //     $propertyValues = array();
                // }
            }          
            
            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection
                
            echo 'success';               
            return;
        }
        catch(Exception $e) {        
            echo "fail"; 
            return;
        } 
    }
?>