<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $AnalyticsDetailsData = $_POST['AnalyticsDetailsData'];
    $_SESSION['AnalyticsDetailsData']  =$AnalyticsDetailsData;
    echo($_SESSION['AnalyticsDetailsData']);    
}
?>