<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $sourceAViewerData = $_POST['SourceAViewerData'];
    $_SESSION['sourceAViewerData1']  =$sourceAViewerData;
    echo($_SESSION['sourceAViewerData1']);    
}
?>