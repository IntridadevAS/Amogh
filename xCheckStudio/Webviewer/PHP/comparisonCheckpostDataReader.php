<?php
session_start();
if(isset($_SESSION['ComparisonCheckManager']))
{
    echo($_SESSION['ComparisonCheckManager']); 
}
else{
    echo("not found");
}
  
?>