<?php
        require_once 'Utility.php';
        
        if(!isset($_POST['CheckName']) || !isset($_POST['ProjectName']) || !isset($_POST['fileName']) || !isset($_POST['Source']) || !isset($_POST['dataSourceType']))
        {
            echo 'Input argument not found';
            return; 
        }
       
        $fileName = $_POST['fileName'];
        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];
        $source = $_POST['Source'];
        $sourceDirectory = NULL;

        switch($source) {
            case "a":
                $sourceDirectory = getCheckSourceAPath($projectName, $checkName);
                break;
            case "b":
                $sourceDirectory = getCheckSourceBPath($projectName, $checkName);
                break;
            case "c":
                $sourceDirectory = getCheckSourceCPath($projectName, $checkName);
              break;
            case "d":
                $sourceDirectory = getCheckSourceDPath($projectName, $checkName);
              break;
        }

        if($_POST['dataSourceType'] == "3D")
        {
            echo $sourceDirectory.'/'.$fileName.'.scs';
            return;
        }
        else if($_POST['dataSourceType'] == "1D")
        {
            echo $sourceDirectory.'/'.$fileName.'.json';
            return;
        }

        echo "fail";

?>