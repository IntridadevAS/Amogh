<?php

        session_start();
        if(isset($_POST['viewerContainer']) && $_POST['viewerContainer'] == "viewerContainer1")
        {    
            if(isset($_SESSION['SourceAPath']) && isset($_POST['fileName']))
            {
                echo $_SESSION['SourceAPath'].'/'.$_POST['fileName'].'.scs';
                return;
            }
            
        }
        else if(isset($_POST['viewerContainer']) && $_POST['viewerContainer'] == "viewerContainer2" )
        {
            if(isset($_SESSION['SourceBPath']) && isset($_POST['fileName']))
            {
                echo $_SESSION['SourceBPath'].'/'.$_POST['fileName'].'.scs';
                return;
            }
        }

        echo "fail";

?>