<?php

    include 'GenericComponent.php';

    if(!isset($_POST['Components']) ||
       !isset($_POST['Source']))
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
    $ComponentsList = restoreProperties( $Components);  
    
    //var_dump($ComponentsList);
    // return;

    addComponentsToDB($ComponentsList);
    
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
?>