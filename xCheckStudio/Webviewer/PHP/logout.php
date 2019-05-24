<?php
        session_start();
       
		if(isset($_SESSION['Name']))
		{
         $name =  $_SESSION['Name'];
        
         session_unset();
         
         echo  $name ;
        }
        else
        {
            echo 'fail';
        }		
?>