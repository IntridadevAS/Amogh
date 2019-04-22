<?php
include 'importFromMySql.php';
include 'importFromMsSql.php';


    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
    ini_set('error_log', dirname(__FILE__) . '/error_log.txt');
    error_reporting(E_ALL);
    $databaseName = 'mysql';
    $host = '127.0.0.1';
    $schema = 'gregschema';
    $user = 'Pooja123';
    $password = 'ABCdsf@#12345';

    // $databaseName = 'sqlsrv';
    // $host = 'PTS-PC-52\SQLEXPRESS01';
    // $schema = 'OGSTriningProject';
    // $user = '';
    // $password = '';
    
    $dsn = $databaseName . ':server=' . $host . ';Database=' . $schema;

    $conn = new PDO($dsn, $user, $password);
    if( $conn ) {
        switch ($databaseName) {
            case "mysql":
                importFromMySql($conn, $schema);
                break;
            case "sqlsrv":
                importFromMsSql($conn, $schema);
                break;
            default:
                break;
        }
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