<?php

        session_start();
        if(isset($_POST['viewerContainer']) && $_POST['viewerContainer'] == "viewerContainer1")
        {  
            if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "3D")
            {
                if(isset($_SESSION['SourceAPath']) && isset($_POST['fileName']))
                {
                    echo $_SESSION['SourceAPath'].'/'.$_POST['fileName'].'.scs';
                    return;
                } 
            }
            else if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "1D")
            {
                if(isset($_SESSION['SourceAPath']) && isset($_POST['fileName']))
                {
                    echo $_SESSION['SourceAPath'].'/'.$_POST['fileName'].'.json';
                    return;
                } 
            }
                  
        }
        else if(isset($_POST['viewerContainer']) && $_POST['viewerContainer'] == "viewerContainer2" )
        {
            if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "3D" )
            {
                if(isset($_SESSION['SourceBPath']) && isset($_POST['fileName']))
                {
                    echo $_SESSION['SourceBPath'].'/'.$_POST['fileName'].'.scs';
                    return;
                }
            }
            else if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "1D")
            {
                if(isset($_SESSION['SourceBPath']) && isset($_POST['fileName']))
                {
                    echo $_SESSION['SourceBPath'].'/'.$_POST['fileName'].'.json';
                    return;
                }
            }          
        }

        echo "fail";

?>