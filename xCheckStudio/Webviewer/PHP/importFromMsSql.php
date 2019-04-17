<?php
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
        $responce = array();
        $fieldpresent = false;
    
       while($tableno < count($tableNameArray))
        {
            $tablename = $tableNameArray[$tableno]['TABLE_NAME'];
            $sql = "SELECT * FROM " . $tablename;
            $result = $conn->query($sql);
            $genericProp = new GenericComponent($tableNameArray[$tableno]['TABLE_NAME']);
            // echo $tablename;
            // output data of each row

            while($row = $result->fetch()) {
                $genericProp->addProperty($row);   
            }
 
            // $sql = "select column_name from information_schema.columns where table_name = '$tablename'";
            // $stmt1 = $conn->prepare($sql);
            // echo $stmt1->execute();
            // $column_names = $stmt1->fetch();
            // while ($column =  )
            // {
            //     if($column['column_name'] == "category")
            //     {                     
            //         $fieldpresent = true;
            //     }            
            // }
            // echo json_encode($column_names);
            $yourArray[$index] = $genericProp;
            $index++;
            $tableno++;
        }
        $responce = [$yourArray, false];
        echo json_encode($responce);
    }
?>