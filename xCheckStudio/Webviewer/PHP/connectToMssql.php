<?php 
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/error_log.txt');
error_reporting(E_ALL);

$serverName = "PTS-PC-52\SQLEXPRESS01";  
$connectionOptions = array("Database"=>"OGSTriningProject");  
  
/* Connect using Windows Authentication. */  
$conn = sqlsrv_connect( $serverName, $connectionOptions);  
if( $conn === false )  
die( FormatErrors( sqlsrv_errors() ) );
else
{
    $sql_query = "select * from dbo.CableCatalog";
    $result = sqlsrv_query($conn, $sql_query); 
    $Count = 0;
    while($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC))  
    {  
        echo json_encode($row);  
        $Count++;  
    }  
    sqlsrv_free_stmt($result);  
    sqlsrv_close($conn);  
}
?>