<?php
        session_start();
        if( !isset($_SESSION['name']))
        {
            echo "fail";           
            return;
        }

        $userName  = $_SESSION['name'];
        $projectName = $_POST["projectName"];      
        $path = $_POST["path"];    
       
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
            $query = 'INSERT INTO Projects (projectname, userid, path) VALUES (?, ?, ?)';
            $stmt = $dbh->prepare($query);
            $stmt->execute(array("test",  $userid, $path));     
    
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
?>