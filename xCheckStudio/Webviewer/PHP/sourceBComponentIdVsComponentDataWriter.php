<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $sourceBComponentIdVsComponentData = $_POST['sourceBComponentIdVsComponentData'];
    $_SESSION['sourceBComponentIdVsComponentData']  =$sourceBComponentIdVsComponentData;
    echo($_SESSION['sourceBComponentIdVsComponentData']);    
}
?>