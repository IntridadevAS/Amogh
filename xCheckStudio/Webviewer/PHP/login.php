<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    //$json = file_get_contents('UserInformation/loginInfo.json');
    //$json_data = json_decode($json, true);

    // collect value of input field
    $name= $_POST['name'];
    $password= $_POST['password'];
    if($name == "" ||
       $password == "")
    {
        echo "Enter Details";
        return;
    }
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
        //$query =  "select *from LoginInfo where username='". $name."';";        
        $query =  "select * from LoginInfo where username='".$name."' and password='".$password."'";
        
        foreach ($dbh->query($query) as $row)
        {
            if($password == $row[2])
            {
             // set session variables   
             //session_start();
            //  $_SESSION['Name']= $name;
            //  $_SESSION['UserId']= $row[0];
             $array = array(
                "userid" => $row[0],
                "username" => $row[1],
                "alias"   => $row[4],
                "type"  => $row[3],
                "permission"  => $row[5],
            );
             echo json_encode($array);
            return;
            }            
        }
        $dbh = null; //This is how you close a PDO connection

        echo "Failed";
        return;
    }
    catch(Exception $e) {
        echo 'Message: ' .$e->getMessage();
        return;
      }
  
}
?>