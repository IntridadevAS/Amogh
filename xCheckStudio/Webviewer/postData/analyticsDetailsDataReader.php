<?php
    $myfile = fopen("analyticsData.js", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("analyticsData.js"));
    fclose($myfile);
 ?>