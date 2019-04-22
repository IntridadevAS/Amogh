<?php
function importData($conn, $dbname)
{
    // echo "in connection";
    $sql1 = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '$dbname'";
    $tableNameResult = mysqli_query($conn, $sql1);
    $tableNameArray = array();
    $index1 = 0;
    if (mysqli_num_rows($tableNameResult) > 0) {
        // output data of each row
        while($row = mysqli_fetch_assoc($tableNameResult)) {
            $tableNameArray[$index1] = $row;
            $index1++;     
        }
    }
    // echo json_encode($tableNameArray);

    $tableno = 0;
    $yourArray = array();
    $index = 0;
    $responce = array();
    $fieldpresent = false;

   while($tableno < count($tableNameArray))
    {
        $tablename = $dbname . "." . $tableNameArray[$tableno]['TABLE_NAME'];
        $sql = "SELECT * FROM " . $tablename;
        $result = mysqli_query($conn, $sql);
        // echo $result;
        if (mysqli_num_rows($result) > 0) {
            // output data of each row
            while($row = mysqli_fetch_assoc($result)) {
               $yourArray[$index] = $row;
               $index++;       
            }

            

            while ($fieldinfo=mysqli_fetch_field($result))
            {
                if($fieldinfo->name == "AreaID")
                {
                    
                    $fieldpresent = true;
                }
                    
            }
        } else {
            echo "0 results";
        }
        $tableno++;
    }
    $responce = [$yourArray, $fieldpresent];
    echo json_encode($responce);
}
?>