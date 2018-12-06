<?php
    $myfile = fopen("sourceAComponentIdVsComponentData.js", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("sourceAComponentIdVsComponentData.js"));
    fclose($myfile);
 ?>