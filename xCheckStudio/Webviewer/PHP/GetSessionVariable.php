<?php
        $variableName = $_POST["variable"];

        session_start();
       
		if(isset($_SESSION[$variableName]))
		{
         $value =  $_SESSION[$variableName];                 
         echo  $value ;
        }
        else
        {
            echo 'fail';
        }		
?>