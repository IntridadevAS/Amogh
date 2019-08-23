<?php
include 'ImportFromMySql.php';
include 'ImportFromMsSql.php';


    // ini_set('display_errors', 1);
    // ini_set('log_errors', 1);
    // ini_set('error_log', dirname(__FILE__) . '/error_log.txt');
    // error_reporting(E_ALL);


    $uri = $_POST['uri'];
    // $uri = "../Projects/12/SourceA/DBConnectionJson.json";

    if(isset($uri))
    {
        $connectionfileuri = file_get_contents($uri);
        $json_a=json_decode($connectionfileuri,true);
        $connectionsArray = array();
        $index = 0;
        foreach ($json_a as $key => $value) {
            {
                foreach ($value as $key => $val) {
                    $connectionsArray[$index] = $val;
                    $index++;
                }
            }
        }
 
        $databaseName = $connectionsArray[0];
        $host = $connectionsArray[1];
        $schema = $connectionsArray[2];
        $user = $connectionsArray[3];
        $password = $connectionsArray[4];
        $listoftables = $connectionsArray[5];
        
        $dsn = $databaseName . ':server=' . $host . ';Database=' . $schema;
    
        $conn = new PDO($dsn, $user, $password);
        if( $conn ) {
            switch ($databaseName) {
                case "mysql":
                    importFromMySql($conn, $schema, $listoftables);
                    break;
                case "sqlsrv":
                    importFromMsSql($conn, $schema, $listoftables);
                    break;
                default:
                    break;
            }
        }else{
            echo "Connection could not be established.<br />";
            die( print_r( sqlsrv_errors(), true));
        }
    }
    else
    {
        echo "Connection could not be established.<br />";
            die( print_r( sqlsrv_errors(), true));
    }
   
    // try {
        
    //     echo "success";
    // } catch (PDOException $e) {
    //     echo 'Connection failed: ' . $e->getMessage();
    // }
?>