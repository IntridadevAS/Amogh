<?php
        session_start();
       
		if(isset($_SESSION['name']))
		{
         $name =  $_SESSION['name'];
        
         session_unset();
         
         echo  $name ;
        }
        else
        {
            echo 'fail';
        }		
?>