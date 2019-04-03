<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $sourceAComponentIdVsComponentData = $_POST['sourceAComponentIdVsComponentData'];
    $_SESSION['sourceAComponentIdVsComponentData']  =$sourceAComponentIdVsComponentData;
    echo($_SESSION['sourceAComponentIdVsComponentData']);    
}
?>