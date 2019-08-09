<?php
    require_once 'Utility.php';
    if(!isset($_POST['Source']) || !isset($_POST['ProjectName']) || !isset($_POST['CheckName']))
    {
        echo 'fail';
        return;
    }

    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];
    getMainClassWiseComponents('mainclass');

    function getMainClassWiseComponents($mainClassProperty)
    {      
        global $projectName;
        global $checkName;
        $dbh;
        try
        {        
            // open database
            $dbPath = getCheckDatabasePath($projectName, $checkName);
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();

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

            $ClasswiseComponents = array();   

            $mainClasses = $dbh->query("SELECT DISTINCT $mainClassProperty FROM  $componentsTableName;");
            if($mainClasses) 
            { 
                while ($mainClass = $mainClasses->fetch(\PDO::FETCH_ASSOC)) 
                {

                    //echo $mainClass[$mainClassProperty];               
                    $componetWiseProperties = array();

                    $ids = $dbh->query("SELECT id FROM ".$componentsTableName." where $mainClassProperty='".$mainClass[$mainClassProperty]."';");  
                    // echo    "SELECT id FROM ".$componentsTableName." where $mainClassProperty='".$mainClass[$mainClassProperty]."';";
                    // echo("      ");
                    // var_dump($ids );
                    // echo("      ");
                    // continue;               
                    while ($compIdResult = $ids->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        $id = (int)$compIdResult['id'];
                       
                        $propertyList = array();

                        $properties = $dbh->query("SELECT *FROM  $propertiesTableName where ownercomponent=".$id.';');                        
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

            echo json_encode($ClasswiseComponents);       

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