<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $sourceANodeIdVsComponentData = $_POST['SourceANodeIdVsComponentData'];
    $_SESSION['SourceANodeIdVsComponentData']  =$sourceANodeIdVsComponentData;
    echo($_SESSION['SourceANodeIdVsComponentData']);    
}
?>