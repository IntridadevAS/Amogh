<?php
    $myfile = fopen("sourceBComponentIdVsComponentData.js", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("sourceBComponentIdVsComponentData.js"));
    fclose($myfile);
 ?>