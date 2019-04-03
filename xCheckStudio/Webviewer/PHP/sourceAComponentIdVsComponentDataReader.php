<?php
session_start();
if(isset($_SESSION['sourceAComponentIdVsComponentData']))
{
    echo($_SESSION['sourceAComponentIdVsComponentData']); 
}
else{
    echo("not found");
}
  
?>