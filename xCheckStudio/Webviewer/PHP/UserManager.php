<?php

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $InvokeFunction = trim($_POST["InvokeFunction"], " ");
        switch ($InvokeFunction) {
            case "GetAllUsersInfo":
                GetAllUsersInfo();
                break;  
            case "UpdateUserInfo":
                UpdateUserInfo();
                break;   
            case "AddNewUser":
                AddNewUser();
                break;    
            case "DeleteUser":
                DeleteUser();
                break; 
            case "UploadProfileImage":
                UploadProfileImage();
                break;                     
            default:
                echo "No Function Found!";
        }
    }

    function DeleteUser()
    { 
        if(!isset($_POST["userName"]))
        {
            echo "fail"; 
            return;
        }

        try
        {   
            $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");           

            $sql = 'DELETE FROM LoginInfo '
                . 'WHERE username = :username';
 
            $stmt = $dbh->prepare($sql);
            $stmt->bindValue(':username', $_POST["userName"]);
    
            $stmt->execute();          
            
            $dbh = null;
            echo "success"; 
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        }      
    }

    function GetAllUsersInfo()
    {      
        try
        {   
            $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");
            
            $query =  "select * from LoginInfo;";      
            
            $stmt = $dbh->query($query);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($data);
            $dbh = null;
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        }         
    }

    function AddNewUser()
    {      
        if(!isset($_POST["enable"]) ||
            !isset($_POST["type"])||
            !isset($_POST["userName"])||
            !isset($_POST["password"])||
            !isset($_POST["alias"])||
            !isset($_POST["permission"]) ||
            !isset($_POST["profileImage"]))
        {
            echo "fail"; 
            return;
        }

        try
        {   
            $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");           


            $qry = 'INSERT INTO LoginInfo(enable, type, username, password, alias, permission, profileImage) VALUES(?,?,?,?,?,?,?) ';                 
            $values =array(
                $_POST["enable"], 
                $_POST["type"], 
                $_POST["userName"], 
                $_POST["password"], 
                $_POST["alias"], 
                $_POST["permission"],
                $_POST["profileImage"]
            );
           
            $stmt = $dbh->prepare($qry);
            $stmt->execute($values);             
            
            $dbh = null;
            echo "success"; 
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        }         
    }

    function UpdateUserInfo()
    {      
        if(!isset($_POST["enable"]) ||
            !isset($_POST["type"])||
            !isset($_POST["userName"])||
            !isset($_POST["password"])||
            !isset($_POST["alias"])||
            !isset($_POST["permission"]))
        {
            echo "fail"; 
            return;
        }

        try
        {   
            $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");           

            // SQL statement to update status of a task to completed
            $sql = "UPDATE LoginInfo "
            . "SET enable = :enable, "
            . "type = :type,  "               
            . "password = :password,  "
            . "alias = :alias,  "
            . "permission = :permission "
            . "WHERE username = :username";

            $stmt = $dbh->prepare($sql);

            // passing values to the parameters
            $stmt->bindValue(':enable', $_POST["enable"]);
            $stmt->bindValue(':type', $_POST["type"]);
            $stmt->bindValue(':password', $_POST["password"]);
            $stmt->bindValue(':alias', $_POST["alias"]);
            $stmt->bindValue(':permission', $_POST["permission"]);
            $stmt->bindValue(':username', $_POST["userName"]);
            
            // execute the update statement
            $stmt->execute();
            
            $dbh = null;

            echo "success"; 
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        }         
    }

function UploadProfileImage()
{
    if (!isset($_POST["userName"])) {
        echo "fail";
        return;
    }

    $webViewerDirectory = dirname(__DIR__);
    $target_dir = $webViewerDirectory . "/Data/UserData";

    // create target directory if not exists
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    $filecount = 0;
    $files = glob($target_dir . "/*");
    if ($files) {
        $filecount = count($files);
    }
  
    $ext = pathinfo($_FILES["files"]["name"][0], PATHINFO_EXTENSION);
    $target_file = $target_dir . "/" . $filecount . "." . $ext;

    // Check if file already exists
    if (!file_exists($target_file)) {
        move_uploaded_file($_FILES["files"]["tmp_name"][0], $target_file);
    }

    // update in db
    try
        {   
            $dbh = new PDO("sqlite:../Data/Main.db") or die("cannot open the database");           

            // SQL statement to update status of a task to completed
            $sql = "UPDATE LoginInfo "
            . "SET profileImage = :profileImage "
            . "WHERE username = :username";

            $stmt = $dbh->prepare($sql);

            // passing values to the parameters       
            $stmt->bindValue(':profileImage',  "/Data/UserData/".$filecount . "." . $ext);
            $stmt->bindValue(':username', $_POST["userName"]);
            
            // execute the update statement
            $stmt->execute();
            
            $dbh = null;

            echo "success"; 
        }
        catch(Exception $e) 
        {        
            echo "fail"; 
            return;
        }     

    echo "/Data/UserData/".$filecount . "." . $ext;
}
?>