<?php
        require_once 'Utility.php';
        
        if(!isset($_POST['CheckName']) || 
           !isset($_POST['ProjectName']) || 
           !isset($_POST['fileName']) || 
           !isset($_POST['Source']) || 
           !isset($_POST['dataSourceType']) ||
           !isset($_POST['isDataVault']))
        {
            echo 'Input argument not found';
            return; 
        }
       
        $fileName = $_POST['fileName'];
        $projectName = $_POST['ProjectName'];
        $checkName = $_POST['CheckName'];
        $source = $_POST['Source'];
        $isDataVault = $_POST['isDataVault'];

        $sourceDirectory = NULL;
        if (strtolower($isDataVault) === "true") {
            switch ($source) {
                case "a":
                    $sourceDirectory =  getVaultSourceAPath($projectName);
                    break;
                case "b":
                    $sourceDirectory =  getVaultSourceBPath($projectName);
                    break;
                case "c":
                    $sourceDirectory =  getVaultSourceCPath($projectName);
                    break;
                case "d":
                    $sourceDirectory =  getVaultSourceDPath($projectName);
                    break;
            }
        } 
        else if ($checkName !== null) {
            switch ($source) {
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
        }
        if($sourceDirectory === NULL)
        {
            echo "fail";
            return;
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
        else if($_POST['dataSourceType'] == "Visio")
        {
            echo $sourceDirectory.'/'.$fileName.'.svg';
            return;
        }

        echo "fail";

?>