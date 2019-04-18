<?php
    include_once 'StoreDBdata.php';

    function importFromMySql($conn, $databaseName)
    {
        $sql1 = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '$databaseName'";
        $stmt = $conn->prepare($sql1);
        $stmt->execute();
        $tableNameArray = array();
        $index1 = 0;
        // $result = $stmt->fetch(PDO::FETCH_ASSOC); 
        while($row=$stmt->fetch()) {
            $tableNameArray[$index1] = $row;
            $index1++;
        }

        //echo json_encode($tableNameArray);

        $tableno = 0;
        $yourArray = array();
        $index = 0;
    
       while($tableno < count($tableNameArray))
        {
            $tablename = $databaseName . "." . $tableNameArray[$tableno]['TABLE_NAME'];
            $sql = "SELECT * FROM " . $tablename;
            $result = $conn->query($sql);
            $genericProp = new GenericComponent($tableNameArray[$tableno]['TABLE_NAME']);
            // echo $result;
            // output data of each row
            while($row = $result->fetch(PDO::FETCH_ASSOC)) {
                $genericProp->addProperty($row);   
            }

            $column_names = $conn->query("Describe " . $tablename);
            while ($column =  $column_names->fetch())
            {
                if($column['Field'] == "category")
                {                     
                    $genericProp->categoryPresent = true;
                }            
            }
            // echo json_encode($column_names->fetchAll());
                $yourArray[$index] = $genericProp;
                $index++;
                $tableno++;
        }
        echo json_encode($yourArray);
    }
?>