<?php
 ini_set('display_errors', 1);
 ini_set('log_errors', 1);
 ini_set('error_log', dirname(__FILE__) . '/error_log.txt');
 error_reporting(E_ALL);
    include_once 'StoreDBdata.php';
    // ini_set('memory_limit','32M');
    function importFromMsSql($conn, $databaseName)
    {
        $sql1 = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_CATALOG = '$databaseName' ORDER BY TABLE_NAME";
        $stmt = $conn->prepare($sql1);
        $stmt->execute();
        $tableNameArray = array();
        $index1 = 0;
        // $result = $stmt->fetch(PDO::FETCH_ASSOC); 
        while($row=$stmt->fetch()) {
            $tableNameArray[$index1] = $row;
            $index1++;
        }

        // echo json_encode($tableNameArray);

        $tableno = 0;
        $yourArray = array();
        $index = 0;
    
    //    while($tableno < 20)
    //     {
    //         $tablename = $tableNameArray[$tableno]['TABLE_NAME'];
            $tablename = "DeviceCatalog";
            $sql = "SELECT * FROM " . $tablename;
            $result = $conn->query($sql);
            $selected_data = $result->fetchAll(PDO::FETCH_ASSOC);
            // $genericProp = new GenericComponent($tableNameArray[$tableno]['TABLE_NAME']);
            $genericProp = new GenericComponent($tablename);

            // echo $tablename;
            // output data of each row

            // while($row = $result->fetch(PDO::FETCH_ASSOC)) {
            //     $genericProp->addProperty($row);   
            // }
            foreach ($selected_data as $row) {
                $genericProp->addProperty($row);
            }

            // echo json_encode($genericProp);
 
            $sql = "select column_name from information_schema.columns where table_name = '$tablename'";
            $result = $conn->query($sql);
            // $column_names = $stmt1->fetchAll();
            $column_names = $result->fetchAll();
            foreach ($column_names as $value)
            {
                if($value['column_name'] == "category")
                {                     
                    $genericProp->categoryPresent = true;
                }            
            }
            // echo json_encode($column_names);
            $yourArray[$index] = $genericProp;
            // echo json_encode($yourArray);
            $index++;
        //     $tableno++;
        // }
        echo json_encode($yourArray);
    }
?>