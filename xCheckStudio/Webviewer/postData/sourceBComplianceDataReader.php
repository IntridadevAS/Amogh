<?php
    $myfile = fopen("sourceBComplianceData.js", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("sourceBComplianceData.js"));
    fclose($myfile);
 ?>