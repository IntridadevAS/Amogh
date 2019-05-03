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
        default:
            echo "No Function Found!";
    }
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
    if( !isset($_SESSION['name']))
    {
        echo "fail";           
        return;
    }

    $userName  = $_SESSION['name'];
    $projectName = trim($_POST["projectName"], " ");      
    $path = trim($_POST["path"], " ");
    $description = trim($_POST["description"], " ");
    $function = trim($_POST["function"], " ");    
       
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
        $query = 'INSERT INTO Projects (userid, projectname, description, function, path) VALUES (?, ?, ?, ?, ?)';
        $stmt = $dbh->prepare($query);
        $stmt->execute(array( $userid, $projectName, $description, $function, $path));     

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
        echo "UserId cannot be empty";
        return;
    }
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        $query =  "select * from Projects where userid=".$userid.";";      
        $stmt = $dbh->query($query);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
        $dbh = null;
      }
      catch(Exception $e) {
        echo 'Message: ' .$e->getMessage();
        return;
      } 
}

?>