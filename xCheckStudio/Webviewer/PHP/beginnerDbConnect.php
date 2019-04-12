<?php
include 'importFromDataBase.php';
include 'exportToData.php';

ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/error_log.txt');
error_reporting(E_ALL);
$conn = OpenCon();
CloseCon($conn);
function OpenCon()
{
$host="127.0.0.1";
$port=3306;
$socket="";
$user="Pooja123";
$password="ABCdsf@#12345";
$dbname="test";
$functionality = $_POST['functionality']; 
// $functionality = "exportData"; 

// $conn = new mysqli($host, $user, $password, $dbname, $port, $socket);

if($functionality == "importData")
{
    $conn = new mysqli($host, $user, $password, $dbname, $port, $socket);
    if($conn->connect_error)
        echo $conn->connect_error;
    else
        importData($conn, $dbname);
}

else
{
    $dbname1 = $_POST['dbname'];
    $tabledata = $_POST['tabledata'];
    $conn = new mysqli($host, $user, $password, "", $port, $socket);
    if($conn->connect_error)
        echo $conn->connect_error;
    else
        exportData($conn, $dbname1, $tabledata);
}
  
return $conn;
}
 
function CloseCon($conn)
 {
 $conn -> close();
 }
   
?>



