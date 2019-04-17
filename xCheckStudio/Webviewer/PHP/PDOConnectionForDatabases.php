<?php
include 'importPDO.php';

    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
    ini_set('error_log', dirname(__FILE__) . '/error_log.txt');
    error_reporting(E_ALL);
    $databaseName = 'sqlsrv';
    $host = 'PTS-PC-52\SQLEXPRESS01';
    $schema = 'OGSTriningProject';
    $user = '';
    $password = '';
    
    $dsn = $databaseName . ':server=' . $host . ';Database=' . $schema;
    echo $dsn;

    $conn2 = new PDO($dsn, $user, $password);
    if( $conn2 ) {
        echo "success";
        importDataPDO($conn2, $schema);
   }else{
        echo "Connection could not be established.<br />";
        die( print_r( sqlsrv_errors(), true));
   }
    // try {
        
    //     echo "success";
    // } catch (PDOException $e) {
    //     echo 'Connection failed: ' . $e->getMessage();
    // }
?>