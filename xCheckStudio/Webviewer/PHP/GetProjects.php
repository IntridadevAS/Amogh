<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
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
      }
      catch(Exception $e) {
        echo 'Message: ' .$e->getMessage();
        return;
      } 
}
?>