
<?php
    $myfile = fopen("sourceBNodeIdVsComponentData.js", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("sourceBNodeIdVsComponentData.js"));
    fclose($myfile);
 ?>