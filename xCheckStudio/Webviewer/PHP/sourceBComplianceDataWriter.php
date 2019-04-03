<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $SourceBComplianceCheckManager = $_POST['SourceBComplianceCheckManager'];
    $_SESSION['SourceBComplianceCheckManager']  =$SourceBComplianceCheckManager;
    echo($_SESSION['SourceBComplianceCheckManager']);    
}
?>