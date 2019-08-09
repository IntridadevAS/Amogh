<?php
        require_once 'Utility.php';
        
        if(!isset($_POST['CheckName']) || !isset($_POST['ProjectName']))
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
        if(isset($_POST['viewerContainer']) && $_POST['viewerContainer'] == "viewerContainer1")
        {
            $sourceAPath = getCheckSourceAPath($projectName, $checkName);
            if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "3D")
            {
                echo $sourceAPath.'/'.$fileName.'.scs';
                return;
            }
            else if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "1D")
            {
                echo $sourceAPath.'/'.$fileName.'.json';
                return;
            }
                  
        }
        else if(isset($_POST['viewerContainer']) && $_POST['viewerContainer'] == "viewerContainer2" )
        {
            $sourceBPath = getCheckSourceBPath($projectName, $checkName);
            if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "3D" )
            {
                echo $sourceBPath.'/'.$fileName.'.scs';
                return;
            }
            else if(isset($_POST['dataSourceType']) && $_POST['dataSourceType'] == "1D")
            {
                echo $sourceBPath.'/'.$fileName.'.json';
                return;
            }          
        }

        echo "fail";

?>