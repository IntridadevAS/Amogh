<?php
session_start();
if(isset($_SESSION['sourceAViewerData1']))
{
    echo($_SESSION['sourceAViewerData1']); 
}
else{
    echo("not found");
}
  
?>