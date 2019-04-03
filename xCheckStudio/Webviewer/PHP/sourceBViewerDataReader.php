<?php
session_start();
if(isset($_SESSION['sourceBViewerData1']))
{
    echo($_SESSION['sourceBViewerData1']); 
}
else{
    echo("not found");
}
  
?>