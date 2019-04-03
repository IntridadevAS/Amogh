<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $sourceBViewerData = $_POST['SourceBViewerData'];
    $_SESSION['sourceBViewerData1']  =$sourceBViewerData;
    echo($_SESSION['sourceBViewerData1']);    
}
?>