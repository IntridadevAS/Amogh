<?php
    function GetUserPermission($userid) {
        try{
            $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");    
            $query =  "select * from LoginInfo where userid=".$userid;
            foreach ($dbh->query($query) as $row)
            {
                $permission = $row[5];
                $db = null;
                return $permission;
            }
        }
        catch(Exception $e) {
            echo 'Message: ' .$e->getMessage();
            return;
        }
    }
?>