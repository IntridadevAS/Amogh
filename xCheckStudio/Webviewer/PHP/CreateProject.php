<?php
        $projectName = $_POST["projectName"];
        $description = $_POST["description"];
        $function = $_POST["function"];
        
       
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
?>