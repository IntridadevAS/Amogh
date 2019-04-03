<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $ComparisonCheckManager = $_POST['ComparisonCheckManager'];
    $_SESSION['ComparisonCheckManager']  =$ComparisonCheckManager;
    echo($_SESSION['ComparisonCheckManager']);    
}
?>