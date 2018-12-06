<?php
    $myfile = fopen("sourceANodeIdVsComponentData.js", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("sourceANodeIdVsComponentData.js"));
    fclose($myfile);
 ?>