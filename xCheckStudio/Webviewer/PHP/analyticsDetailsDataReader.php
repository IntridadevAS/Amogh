<?php
session_start();
if(isset($_SESSION['AnalyticsDetailsData']))
{
    echo($_SESSION['AnalyticsDetailsData']); 
}
else{
    echo("not found");
}
  
?>