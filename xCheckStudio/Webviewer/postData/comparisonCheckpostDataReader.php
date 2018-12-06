<?php
    $myfile = fopen("comparisonCheckData.js", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("comparisonCheckData.js"));
    fclose($myfile);
 ?>