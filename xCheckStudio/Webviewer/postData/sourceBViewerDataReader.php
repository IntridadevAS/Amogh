<?php
    $myfile = fopen("SourceBViewerData.js", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("SourceBViewerData.js"));
    fclose($myfile);
 ?>