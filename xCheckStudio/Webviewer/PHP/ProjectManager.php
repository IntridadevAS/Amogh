<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $InvokeFunction = trim($_POST["InvokeFunction"], " ");
    switch ($InvokeFunction) {
        case "CreateProject":
            CreateProject();
            break;
        case "AddProjectToMainDB":
            AddProjectToMainDB();
            break;
        case "DeleteProject":
            DeleteProject();
            break;
        case "GetProjects":
            GetProjects();
            break;
        case "IsLoadProject":
            IsLoadProject();
            break;
        case "CreateProjectSession":
            CreateProjectSession();
            break;
        case "ReadSelectedComponents":
            ReadSelectedComponents();
           break;
        case "ReadCheckModuleControlsState":
            ReadCheckModuleControlsState();
            break;
        case "DeleteComparisonResults":
            DeleteComparisonResults();
            break;
        case "DeleteSourceAComplianceResults":
            DeleteSourceAComplianceResults();
            break;
        case "DeleteSourceBComplianceResults":
            DeleteSourceBComplianceResults();
            break;
        default:
            echo "No Function Found!";
    }
}


/*
|
|   Deletes all tables which store comparison check results
|
*/  
function DeleteComparisonResults()
{
    // get project name
    session_start();   
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

    $dbh;
    try
    {    
        // open database
        $dbPath = "../Projects/".$projectName."/".$projectName.".db";
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

        // begin the transaction
        $dbh->beginTransaction();  

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS ComparisonCheckComponents;';
        $dbh->exec($command);      

         // drop table if exists
         $command = 'DROP TABLE IF EXISTS ComparisonCheckGroups;';
         $dbh->exec($command);     

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS ComparisonCheckProperties;';
        $dbh->exec($command);     

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceANotSelectedComponents;';
        $dbh->exec($command);     
     
             // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceBNotSelectedComponents;';
        $dbh->exec($command);    

        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection    
    }
    catch(Exception $e) 
    {        
        return "fail";         
    } 

    return "success"; 
}

/*
|
|   Deletes all tables which store source A compliance check results
|
*/  
function DeleteSourceAComplianceResults()
{
    // get project name
    session_start();   
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

    $dbh;
    try
    {    
        // open database
        $dbPath = "../Projects/".$projectName."/".$projectName.".db";
        $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

        // begin the transaction
        $dbh->beginTransaction();  

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckComponents;';
        $dbh->exec($command);      

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckGroups;';
        $dbh->exec($command);     

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceAComplianceCheckProperties;';
        $dbh->exec($command);     

        // drop table if exists
        $command = 'DROP TABLE IF EXISTS SourceAComplianceNotCheckedComponents;';
        $dbh->exec($command);           
     
        // commit update
        $dbh->commit();
        $dbh = null; //This is how you close a PDO connection    
    }
    catch(Exception $e) 
    {        
        return "fail";         
    } 

    return "success"; 
}

/*
|
|   Deletes all tables which store source B compliance check results
|
*/ 
function DeleteSourceBComplianceResults()
{
     // get project name
     session_start();   
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
 
     $dbh;
     try
     {    
         // open database
         $dbPath = "../Projects/".$projectName."/".$projectName.".db";
         $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 
 
         // begin the transaction
         $dbh->beginTransaction();  
 
         // drop table if exists
         $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckComponents;';
         $dbh->exec($command);      
 
         // drop table if exists
         $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckGroups;';
         $dbh->exec($command);     
 
         // drop table if exists
         $command = 'DROP TABLE IF EXISTS SourceBComplianceCheckProperties;';
         $dbh->exec($command);     
 
         // drop table if exists
         $command = 'DROP TABLE IF EXISTS SourceBComplianceNotCheckedComponents;';
         $dbh->exec($command);           
      
         // commit update
         $dbh->commit();
         $dbh = null; //This is how you close a PDO connection    
     }
     catch(Exception $e) 
     {        
         return "fail";         
     } 
 
     return "success"; 
}

function ReadCheckModuleControlsState()
{
    // get project name
    session_start();   
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

    $dbh;
        try
        {        
            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();  
            
            $results = $dbh->query("SELECT *FROM  CheckModuleControlsState;");   
            
            $checkModuleControlsState = array();
            if($results)
            {
                while ($record = $results->fetch(\PDO::FETCH_ASSOC)) 
                {
                    $checkModuleControlsState = array('comparisonSwith'=>$record['comparisonSwith'], 
                                                      'sourceAComplianceSwitch'=>$record['sourceAComplianceSwitch'],  
                                                      'sourceBComplianceSwitch'=>$record['sourceBComplianceSwitch'],
                                                      'sourceACheckAllSwitch'=>$record['sourceACheckAllSwitch'],
                                                      'sourceBCheckAllSwitch'=>$record['sourceBCheckAllSwitch']);
                    break;
                }
            }
            
            echo json_encode($checkModuleControlsState);

            // commit update
            $dbh->commit();
            $dbh = null; //This is how you close a PDO connection    
        }
        catch(Exception $e) 
        {        
            return "fail"; 
            //return;
        } 
}

function ReadSelectedComponents()
{
    if(!isset($_POST['source']))
    {
        echo "fail";
        return;
    }
    $source = $_POST['source'];

    // get project name
    session_start();   
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

    $dbh;
        try
        {        
            // open database
            $dbPath = "../Projects/".$projectName."/".$projectName.".db";
            $dbh = new PDO("sqlite:$dbPath") or die("cannot open the database"); 

            // begin the transaction
            $dbh->beginTransaction();  
            
            // source a selected components
            $sourceAIdwiseComponents = NULL;
            $sourceANodeIdwiseComponents = NULL;
            if(strtolower($source) === 'sourcea' || strtolower($source) === 'both')
            {
                $results = $dbh->query("SELECT *FROM  SourceASelectedComponents;");     
                if($results)
                {
                    while ($component = $results->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        // id wise components
                        $sourceAIdwiseComponents[$component['id']] = array('id'=>$component['id'], 
                                                                             'name'=>$component['name'],  
                                                                             'mainClass'=>$component['mainClass'],
                                                                             'subClass'=>$component['subClass'],
                                                                             'nodeId'=>$component['nodeId'],
                                                                             'mainComponentId'=>$component['mainComponentId']);
                        // node id wise components
                        $sourceANodeIdwiseComponents[$component['nodeId']] = array('id'=>$component['id'], 
                                                                            'name'=>$component['name'],  
                                                                             'mainClass'=>$component['mainClass'],
                                                                             'subClass'=>$component['subClass'],
                                                                             'nodeId'=>$component['nodeId'],
                                                                             'mainComponentId'=>$component['mainComponentId']); 
                    }    
                }
            }
            
            // source b selected components
            $sourceBIdwiseComponents = NULL;
            $sourceBNodeIdwiseComponents = NULL;
            if(strtolower($source) === 'sourceb' || strtolower($source) === 'both')
            {
                $results = $dbh->query("SELECT *FROM  SourceBSelectedComponents;");       
                if($results)
                {
                    while ($component = $results->fetch(\PDO::FETCH_ASSOC)) 
                    {
                        // id wise components
                        $sourceBIdwiseComponents[$component['id']] = array('id'=>$component['id'], 
                                                                             'name'=>$component['name'],  
                                                                             'mainClass'=>$component['mainClass'],
                                                                             'subClass'=>$component['subClass'],
                                                                             'nodeId'=>$component['nodeId'],
                                                                             'mainComponentId'=>$component['mainComponentId']);
                        // node id wise components
                        $sourceBNodeIdwiseComponents[$component['nodeId']] = array('id'=>$component['id'], 
                                                                            'name'=>$component['name'],  
                                                                             'mainClass'=>$component['mainClass'],
                                                                             'subClass'=>$component['subClass'],
                                                                             'nodeId'=>$component['nodeId'],
                                                                             'mainComponentId'=>$component['mainComponentId']); 
                    }    
                }
            }
           
            $selectedComponents =array();

            if( $sourceAIdwiseComponents !== NULL && 
                $sourceANodeIdwiseComponents !== NULL)
            {
                $selectedComponents['SourceAIdwiseSelectedComps'] = $sourceAIdwiseComponents;
                $selectedComponents['SourceANodeIdwiseSelectedComps'] = $sourceANodeIdwiseComponents;
            }

            if( $sourceBIdwiseComponents !== NULL && 
                $sourceBNodeIdwiseComponents !== NULL)
            {
                $selectedComponents['SourceABwiseSelectedComps'] = $sourceBIdwiseComponents;
                $selectedComponents['SourceBNodeIdwiseSelectedComps'] = $sourceBNodeIdwiseComponents;
            }

            echo json_encode($selectedComponents);

             // commit update
             $dbh->commit();
             $dbh = null; //This is how you close a PDO connection    
        }
        catch(Exception $e) 
        {        
            return "fail"; 
            //return;
        } 
}

function CreateProjectSession()
{
    if(!isset($_POST['projectName']) || 
       !isset($_POST['loadProject']) ||
       !isset($_POST['sourceAPath']) ||
       !isset($_POST['sourceBPath']) ||
       !isset($_POST['projectId']))
       {
           echo "fail";
           return;
       }

    session_start();

    $_SESSION['ProjectName'] = $_POST['projectName'];
    $_SESSION['LoadProject'] = $_POST['loadProject'];
    $_SESSION['ProjectId'] =  $_POST['projectId'];
    $_SESSION['SourceAPath'] =  $_POST['sourceAPath'];
    $_SESSION['SourceBPath'] =  $_POST['sourceBPath'];
       
    echo 'success';
}

function IsLoadProject()
{
    session_start();
    if(isset($_SESSION['LoadProject'] ))
    {
        echo $_SESSION['LoadProject'];
        return;
    }
    
    echo 'false';    
}

/*
|
|   Creates new project in Main.db
|
*/   
function CreateProject()
{
    $projectName = trim($_POST["projectName"], " ");
    $description = trim($_POST["description"], " ");
    $function = trim($_POST["function"], " ");

    if($projectName == "")
    {
        echo "Project Name cannot be empty";
        return;
    }
    if($description == "")
    {
        echo "Project description cannot be empty";
        return;
    }
    if($function == "")
    {
        echo "Project function cannot be empty";
        return;
    }
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query =  "select projectname from Projects where projectname='". $projectName."' COLLATE NOCASE;";      
        $count=0;
        foreach ($dbh->query($query) as $row)
        {
        $count = $count+1;
        }
        if ($count != 0)
        {
        echo "Project with provided name already exists. Please try some other name.";
        $dbh = null; //This is how you close a PDO connection
        return;
        }
    }
    catch(Exception $e) {
        echo 'Message: ' .$e->getMessage();
        return;
    } 
    
    $path = "../Projects/".$projectName;
    if (!file_exists($path)) {
        
        // create directory
        if(mkdir($path, 0777, true))
        {
        // create project database           
        $database = new SQLite3($path."/".$projectName.".db");	
        
        // create SourceA and SourceB directories
        mkdir($path."/SourceA", 0777, true);
        mkdir($path."/SourceB", 0777, true);
        
        // set session variables for sourceA and sourceB directory paths relative to index.html
        session_start();
        $_SESSION['SourceAPath']= "Projects/".$projectName."/SourceA";             
        $_SESSION['SourceBPath']= "Projects/".$projectName."/SourceB";
        }
    }              	
    echo "success";
}

/*
|
|   Adds new project in Main.db
|
*/
function AddProjectToMainDB()
{
    session_start();
    if( !isset($_SESSION['Name']))
    {
        echo "fail";           
        return;
    }

    $userName  = $_SESSION['Name'];
    $projectName = trim($_POST["projectName"], " ");      
    $path = trim($_POST["path"], " ");
    $description = trim($_POST["description"], " ");
    $function = trim($_POST["function"], " ");    
    
    $projectScope = $_POST["projectScope"];    
    if(strtolower($projectScope) === 'true')
    {
        $projectScope = "public";
    }
    else
    {
        $projectScope = "private";
    }

    try{
    $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");        
    // first get user id from userName
    $query =  "select userid from LoginInfo where username='". $userName."';";        

    foreach ($dbh->query($query) as $row)
    {         
        $userid = $row[0];            
      
        // projectname is text column
        // userid is integer column
        // path is text column
        $query = 'INSERT INTO Projects (userid, projectname, description, function, path, projectscope) VALUES (?, ?, ?, ?, ?,?)';
        $stmt = $dbh->prepare($query);
        $stmt->execute(array( $userid, $projectName, $description, $function, $path, $projectScope));     
      
        
        // get project id for recently added row and write it into session variable
        $qry = 'SELECT projectid FROM Projects where rowid='.$dbh->lastInsertId();    
        $stmt =  $dbh->query($qry);       
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) 
        {
            $_SESSION['ProjectId'] = $row['projectid'];
            break;                    
        }

        $dbh = null; //This is how you close a PDO connection
        echo 'success';                
        
        return;
    }
    
        $dbh = null; //This is how you close a PDO connection
        echo 'fail';            
    }
    catch(Exception $e) {
        //echo 'Message: ' .$e->getMessage();
        echo "fail"; 
        return;
    } 
}

/*
|
|   Deletes specific project from Main.db
|
*/
function DeleteProject()
{
    $projectid = trim($_POST["projectid"], " ");
    if($projectid == "")
    {
        echo "Project Id cannot be empty";
        return;
    }
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query =  "Delete from Projects where projectid='". $projectid."';";      ;
        $stmt = $dbh->prepare($query);      
        $stmt->execute();
        echo $stmt->rowCount();
        $dbh = null;
        return;
        }
    catch(Exception $e) {
        echo 'Message: ' .$e->getMessage();
        return;
    } 
}

/*
|
|   Returns list of all projects for specific 'userid' from Main.db
|
*/ 

function GetProjects()
{
    $userid = trim($_POST["userid"], " ");
    if($userid == "")
    {
        echo 'fail';
        return;
    }
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query =  "select * from Projects where userid=".$userid." OR projectscope='public';";      
        $stmt = $dbh->query($query);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
        $dbh = null;
      }
      catch(Exception $e) {
        echo 'fail';
        return;
      } 
}

?>