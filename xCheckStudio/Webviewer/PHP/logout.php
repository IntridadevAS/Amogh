<?php
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $userid= $_POST['userid'];
        try{
            $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
            $result = RemoveLock($dbh, $userid);
            if($result)
                echo "Success";
            else
                echo "Failed";
            $dbh = null;
            return;
        }
        catch(Exception $e){
        }
    }
    function RemoveLock($dbh, $userid){
        $sql = "UPDATE LoginInfo SET lock=? WHERE userid=?";
        return $dbh->prepare($sql)->execute([0, $userid]);  
    }
?>