<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name= $_POST['name'];
    $password= $_POST['password'];
    if($name == "" || $password == "")
    {
        echo "Enter Details";
        return;
    }
    try{
        $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");    
        $query =  "select * from LoginInfo where username='".$name."' and password='".$password."'";
        foreach ($dbh->query($query) as $row)
        {           
            if ($row["lock"] === "1"){                
                $dbh = null;
                echo "Locked";                
                return;
            }
            if($password == $row["password"])
            {
                $array = array(
                    "userid" => $row["userid"],
                    "username" => $row["username"],
                    "alias"   => $row["alias"],
                    "type"  => $row["type"],
                    "permission"  => $row["permission"],
                    "profileImage"  => $row["profileImage"],
                );
                InsertLock($dbh, $row["userid"]);
                echo json_encode($array);
                $dbh = null;
                return;
            }         
        }
        $dbh = null;
        echo "Failed";
        return;
    }
    catch(Exception $e) {
        echo 'Message: ' .$e->getMessage();
        return;
      }
  
}

function InsertLock($dbh, $userid){
    $sql = "UPDATE LoginInfo SET lock=? WHERE userid=?";
    $dbh->prepare($sql)->execute([1, $userid]);     
}
?>