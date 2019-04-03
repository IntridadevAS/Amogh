<?php
session_start();
if(isset($_SESSION['SourceANodeIdVsComponentData']))
{
    echo($_SESSION['SourceANodeIdVsComponentData']); 
}
else{
    echo("not found");
}
  
?>