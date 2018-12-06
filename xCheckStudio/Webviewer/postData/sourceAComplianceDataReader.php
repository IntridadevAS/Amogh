<?php
    $myfile = fopen("sourceAComplianceData.js", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("sourceAComplianceData.js"));
    fclose($myfile);
 ?>