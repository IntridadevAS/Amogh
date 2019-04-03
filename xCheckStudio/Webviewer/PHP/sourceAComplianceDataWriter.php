<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $SourceAComplianceCheckManager = $_POST['SourceAComplianceCheckManager'];
    $_SESSION['SourceAComplianceCheckManager']  =$SourceAComplianceCheckManager;
    echo($_SESSION['SourceAComplianceCheckManager']);    
}
?>