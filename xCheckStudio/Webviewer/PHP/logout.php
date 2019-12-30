<?php
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $AllUser = trim($_POST["AllUser"], " ");
        $userid= $_POST['userid'];
        try{
            $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
            $result; $alluser;
            
            if(strcmp($AllUser, "Yes") == 0)
                $result = RemoveLock($dbh, $userid, TRUE);
            else
                $result = RemoveLock($dbh, $userid, FALSE);
            if($result)
                echo json_encode(array("Msg" =>  "Success","AllUser" => $AllUser));  
            else
                echo json_encode(array("Msg" =>  "Failed","AllUser" => $AllUser));  
            $dbh = null;
            
            return;
        }
        catch(Exception $e){
            echo "Failed";
            return;
        }
    }

    function RemoveLock($dbh, $userid, $all){
        $sql="";
        if($all == TRUE) { 
            $sql = "UPDATE LoginInfo SET lock=? WHERE userid!=?";
        }
        else {
            $sql = "UPDATE LoginInfo SET lock=? WHERE userid=?";
        }
        return $dbh->prepare($sql)->execute([0, $userid]);  
    }
?>