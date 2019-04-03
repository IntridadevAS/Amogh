<?php
session_start();
if(isset($_SESSION['sourceBComponentIdVsComponentData']))
{
    echo($_SESSION['sourceBComponentIdVsComponentData']); 
}
else{
    echo("not found");
}
  
?>