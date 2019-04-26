<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
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
    $query =  "select projectname from Projects where projectname='". $projectName."';";      
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
?>