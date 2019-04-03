<?php
session_start();
if(isset($_SESSION['SourceBSheetData']))
{
    echo($_SESSION['SourceBSheetData']); 
}
else{
    echo("not found");
}
  
?>