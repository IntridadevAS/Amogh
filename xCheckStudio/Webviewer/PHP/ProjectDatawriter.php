<?php

    include 'Utility.php';       

    if(!isset($_POST['SourceANodeIdvsComponentIdList']) ||
       //!isset($_POST['SourceBNodeIdvsComponentIdList']) ||
       !isset($_POST["SourceASelectedComponents"]) //||
       /*!isset($_POST["SourceBSelectedComponents"])*/)
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

       $SourceASelectedComponents =   json_decode($_POST['SourceASelectedComponents'],true);      
       $SourceANodeIdvsComponentIdList =  json_decode($_POST['SourceANodeIdvsComponentIdList'],true);

       $SourceBSelectedComponents =  json_decode($_POST['SourceBSelectedComponents'],true);
       $SourceBNodeIdvsComponentIdList =  json_decode($_POST['SourceBNodeIdvsComponentIdList'],true);  
      
        //var_dump( $SourceANodeIdvsComponentIdList);

        // write source a selected components
        writeSelectedComponents($projectName, 
                                'SourceASelectedComponents', 
                                $SourceASelectedComponents, 
                                $SourceANodeIdvsComponentIdList );
        
        // write source a selected components
        writeSelectedComponents($projectName, 
                                'SourceBSelectedComponents', 
                                $SourceBSelectedComponents, 
                                $SourceBNodeIdvsComponentIdList );

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
                $command = 'CREATE TABLE IF NOT EXISTS '. $selectedComponentsTable. '(
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
                    if($selectedComponent['NodeId'])
                    {
                        $nodeId = (int)$selectedComponent['NodeId'];
                    }

                    $mainCompId = null;
                    if($nodeIdvsComponentIdList[$nodeId])
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