<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $sourceASheetData = $_POST['SourceASheetData'];
    $_SESSION['SourceASheetData']  =$sourceASheetData;
    echo($_SESSION['SourceASheetData']);    
}
?>