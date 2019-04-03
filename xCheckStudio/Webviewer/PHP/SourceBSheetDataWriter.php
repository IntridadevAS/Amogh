<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $sourceBSheetData = $_POST['SourceBSheetData'];
    $_SESSION['SourceBSheetData']  =$sourceBSheetData;
    echo($_SESSION['SourceBSheetData']);    
}
?>