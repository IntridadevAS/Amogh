<?php
        require_once 'Utility.php';
        
        if(!isset($_POST['CheckName']) || 
           !isset($_POST['ProjectName']))
        {
            echo 'Project Name or Check Name not set';
            return; 
        }
        if(!isset($_POST['fileName']))
        {
            echo 'File Name not set';
            return;
        }
        $fileName = $_POST['fileName'];
        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];

        $sourceDirectory = NULL;
        if(isset($_POST['Source']) && $_POST['Source'] == "a")
        {
            $sourceDirectory = getCheckSourceAPath($projectName, $checkName);
            // if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "3D")
            // {
            //     echo $sourceAPath.'/'.$fileName.'.scs';
            //     return;
            // }
            // else if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "1D")
            // {
            //     echo $sourceAPath.'/'.$fileName.'.json';
            //     return;
            // }
                  
        }
        else if(isset($_POST['Source']) && $_POST['Source'] == "b" )
        {
            $sourceDirectory = getCheckSourceBPath($projectName, $checkName);
            // if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "3D" )
            // {
            //     echo $sourceBPath.'/'.$fileName.'.scs';
            //     return;
            // }
            // else if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "1D")
            // {
            //     echo $sourceBPath.'/'.$fileName.'.json';
            //     return;
            // }          
        }
        else if(isset($_POST['Source']) && $_POST['Source'] == "c" )
        {
            $sourceDirectory = getCheckSourceCPath($projectName, $checkName);
        }
        else if(isset($_POST['Source']) && $_POST['Source'] == "d" )
        {
            $sourceDirectory = getCheckSourceDPath($projectName, $checkName);
        }


        if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "3D")
        {
            echo $sourceDirectory.'/'.$fileName.'.scs';
            return;
        }
        else if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "1D")
        {
            echo $sourceDirectory.'/'.$fileName.'.json';
            return;
        }

        echo "fail";

?>