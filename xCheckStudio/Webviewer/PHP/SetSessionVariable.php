<?php
        $variableName = $_POST["variableName"];
        $variableValue = $_POST["variableValue"];

        session_start();
        $_SESSION[$variableName]= $variableValue;   
        
        echo 'success';
?>