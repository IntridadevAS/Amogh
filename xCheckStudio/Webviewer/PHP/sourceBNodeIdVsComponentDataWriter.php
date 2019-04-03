<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $sourceBNodeIdVsComponentData = $_POST['SourceBNodeIdVsComponentData'];
    $_SESSION['SourceBNodeIdVsComponentData']  =$sourceBNodeIdVsComponentData;
    echo($_SESSION['SourceBNodeIdVsComponentData']);    
}
?>