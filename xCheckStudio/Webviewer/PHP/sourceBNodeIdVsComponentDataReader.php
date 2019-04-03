<?php
session_start();
if(isset($_SESSION['SourceBNodeIdVsComponentData']))
{
    echo($_SESSION['SourceBNodeIdVsComponentData']); 
}
else{
    echo("not found");
}
  
?>