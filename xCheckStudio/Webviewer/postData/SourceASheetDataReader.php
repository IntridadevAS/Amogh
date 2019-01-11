<?php
    $myfile = fopen("sourceASheetData.js", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("sourceASheetData.js"));
    fclose($myfile);
 ?>