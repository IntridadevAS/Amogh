<?php
session_start();
if(isset($_SESSION['SourceASheetData']))
{
    echo($_SESSION['SourceASheetData']); 
}
else{
    echo("not found");
}
  
?>