<?php
session_start();
if(isset($_SESSION['SourceAComplianceCheckManager']))
{
    echo($_SESSION['SourceAComplianceCheckManager']); 
}
else{
    echo("not found");
}
  
?>