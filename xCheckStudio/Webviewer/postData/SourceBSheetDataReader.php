<?php
    $myfile = fopen("sourceBSheetData.js", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("sourceBSheetData.js"));
    fclose($myfile);
 ?>