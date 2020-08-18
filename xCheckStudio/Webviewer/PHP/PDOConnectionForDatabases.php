<?php
include 'ImportFromMySql.php';
include 'ImportFromMsSql.php';

if ($_SERVER["REQUEST_METHOD"] == "POST")
{
    $InvokeFunction = trim($_POST["InvokeFunction"], " ");
    switch ($InvokeFunction)
    {
        case "ReadByJSON":
            ReadByJSON();
            break;
        case "ReadByConnectionInfo":
            ReadByConnectionInfo();
            break;
        case "TestConnection":
            TestConnection();
            break;
        default:
            echo "No Function Found!";
    }
}

function ReadByConnectionInfo()
{
    if (!isset($_POST['connectionInfo']))
    {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));

        return;
    }
    $connectionInfo = json_decode($_POST['connectionInfo'], true);

    $serverType = $connectionInfo["serverType"];
    $server = $connectionInfo["serverName"];
    $database = $connectionInfo["database"];
    $user = $connectionInfo["userName"];
    $password = $connectionInfo["password"];
    $tables = $connectionInfo["tables"];

    // create connection
    $conn = CreateConnection(
        $serverType,
        $server,
        $database,
        $user,
        $password
    );

    $result = null;
    if ($conn)
    {
        $data = ReadFromDatabase(
            $conn,
            $serverType,
            $database,
            $tables
        );
        // add server type to result
        $result["data"] = $data;
        $result["serverType"] = $serverType;

        // now close the connection
        CloseConnection($conn);
    }
    else
    {
        echo json_encode(array(
            "Msg" =>  "Connection could not be established.<br />",
            "MsgCode" => 0
        ));

        die(print_r(sqlsrv_errors(), true));
    }

    echo json_encode(array(
        "Msg" =>  "Success",
        "Data" => $result,
        "MsgCode" => 1
    ));
}

function ReadByJSON()
{
    if (!isset($_POST['uri']))
    {
        echo json_encode(array(
            "Msg" =>  "Invalid input.",
            "MsgCode" => 0
        ));

        return;
    }
    $uri = $_POST['uri'];

    // if (isset($uri))
    // {
    $connectionfileuri = file_get_contents($uri);
    $json_a = json_decode($connectionfileuri, true);
    $connectionsArray = array();
    $index = 0;
    foreach ($json_a as $key => $value)
    {
        {
            foreach ($value as $key => $val)
            {
                $connectionsArray[$index] = $val;
                $index++;
            }
        }
    }

    $serverType = $connectionsArray[0];
    $server = $connectionsArray[1];
    $database = $connectionsArray[2];
    $user = $connectionsArray[3];
    $password = $connectionsArray[4];
    $tables = $connectionsArray[5];

    // create connection
    $conn = CreateConnection(
        $serverType,
        $server,
        $database,
        $user,
        $password
    );

    $result = null;
    if ($conn)
    {
        $data = ReadFromDatabase(
            $conn,
            $serverType,
            $database,
            $tables
        );

        // add server type to result
        $result["data"] = $data;
        $result["serverType"] = $serverType;

        // now close the connection
        CloseConnection($conn);
    }
    else
    {
        echo json_encode(array(
            "Msg" =>  "Connection could not be established.<br />",
            "MsgCode" => 0
        ));

        die(print_r(sqlsrv_errors(), true));
    }

    echo json_encode(array(
        "Msg" =>  "Success",
        "Data" => $result,
        "MsgCode" => 1
    ));
}

function TestConnection()
{
    if (
        !isset($_POST['serverType']) ||
        !isset($_POST['serverName']) ||
        !isset($_POST['database']) ||
        !isset($_POST['userName']) ||
        !isset($_POST['password'])
    )
    {
        echo json_encode(array(
            "Msg" =>  "Invalid input",
            "MsgCode" => 0
        ));

        return;
    }

    $serverType = $_POST['serverType'];
    $server = $_POST['serverName'];
    $database = $_POST['database'];
    $userName = $_POST['userName'];
    $password = $_POST['password'];
    $conn = CreateConnection(
        $serverType,
        $server,
        $database,
        $userName,
        $password
    );
   
    if ($conn)
    {
        // read all tables present in the db
        $data = null;
        switch ($serverType)
        {
            case "mysql":
                $data = getAllMYSQLTables($conn);              
                break;
            case "sqlsrv":
                $data = getAllMSSQLTables($conn);
                break;
            default:
                break;
        }

        echo json_encode(array(
            "Msg" =>  "Success",
            "Data" => $data,
            "MsgCode" => 1
        ));

        // now close the connection
        CloseConnection($conn);
    }
    else
    {
        echo json_encode(array(
            "Msg" =>  "Failed",
            "MsgCode" => 0
        ));
    }
}

function CreateConnection(
    $serverType,
    $server,
    $database,
    $user,
    $password
)
{
    $dsn = $serverType . ':server=' . $server . ';Database=' . $database;      
    $conn = null;
    try
    {
        $conn = new PDO($dsn, $user, $password);
    }
    catch(PDOException $e)
    {

    }      

    return $conn;
}

function CloseConnection($conn)
{
    $conn = null;
}


function ReadFromDatabase(
    $conn,
    $serverType,
    $database,
    $tables
)
{
    $data = null;
    switch ($serverType)
    {
        case "mysql":
            $data = importFromMySql($conn, $database, $tables);
            break;
        case "sqlsrv":
            $data = importFromMsSql($conn, $database, $tables);
            break;
        default:
            break;
    }

    return  $data;    
}    
?>