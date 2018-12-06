<?php
    $myfile = fopen("SourceAViewerData.js", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("SourceAViewerData.js"));
    fclose($myfile);
 ?>