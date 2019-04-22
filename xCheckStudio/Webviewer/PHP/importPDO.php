<?php
    function importDataPDO($conn2, $databaseName)
    {
        $sql1 = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_CATALOG = '$databaseName'";
        $stmt = $conn2->prepare($sql1);
        $stmt->execute();
        $tableNameArray = array();
        $index1 = 0;
        // $result = $stmt->fetch(PDO::FETCH_ASSOC); 
        while($row=$stmt->fetch(PDO::FETCH_OBJ)) {
            $tableNameArray[$index1] = $row;
            $index1++;
        }

        echo json_encode($tableNameArray);

    $tableno = 0;
    $yourArray = array();
    $index = 0;
    $responce = array();
    $fieldpresent = false;

   
    }
?>