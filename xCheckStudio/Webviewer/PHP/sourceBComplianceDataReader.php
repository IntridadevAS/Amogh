<?php
session_start();
if(isset($_SESSION['SourceBComplianceCheckManager']))
{
    echo($_SESSION['SourceBComplianceCheckManager']); 
}
else{
    echo("not found");
}
  
?>