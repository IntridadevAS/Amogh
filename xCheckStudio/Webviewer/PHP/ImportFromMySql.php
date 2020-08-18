<?php
    include_once 'StoreDBdata.php';

    function importFromMySql($conn, $databaseName, $listoftables)
    {
        // $sql1 = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '$databaseName'";
        // $stmt = $conn->prepare($sql1);
        // $stmt->execute();
        // $tableNameArray = array();
        // $index1 = 0;
        // // $result = $stmt->fetch(PDO::FETCH_ASSOC); 
        // while($row=$stmt->fetch()) {
        //     $tableNameArray[$index1] = $row;
        //     $index1++;
        // }

        //echo json_encode($tableNameArray);

        $tableno = 0;
        $yourArray = array();
        $index = 0;
    
       while($tableno < count($listoftables))
        {
            $tablename = $databaseName . "." . $listoftables[$tableno];
            $sql = "SELECT * FROM " . $tablename;
            $result = $conn->query($sql);
            $genericProp = new GenericComponent($listoftables[$tableno]);
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
        // echo json_encode($yourArray);
        return $yourArray;
    }

    function getAllMYSQLTables($conn)
    {
        try
        {
            $sql = "SHOW TABLES FROM testdb";           
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_NUM);
           
            $tableNames = array();
            foreach($results as $result){                
                array_push($tableNames, $result[0]);
            }

            return $tableNames;
        }
        catch (PDOException $e)
        {
        }

        return null;
    }
?>