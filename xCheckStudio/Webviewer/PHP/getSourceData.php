<?php
$FileCount = 0;
$ValidDataSources = ["xml", "xls", "rvm", "sldasm", "dwg", "sldprt", "rvt", "rfa", "json", "ifc", "step", "stp", "ste"];

foreach($_FILES["dataSouresName"]["tmp_name"] as $key=>$tmp_name)
{
    $FileCount++;
}

if($FileCount > 0)
{
    foreach($_FILES["dataSouresName"]["name"] as $key=>$tmp_name)
    {
        $file = $tmp_name;
     
        $fileExtension = pathinfo($file, PATHINFO_EXTENSION);
        $fileExtension = strtolower($fileExtension);
        $isFound = in_array($fileExtension, $ValidDataSources);
        if($isFound)
        {
            echo $file;
            return;
        }
        else{
            //echo "undefined";
        }
    }

    echo "undefined";
}
?>