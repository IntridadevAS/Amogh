<?php 
    require_once '../PHP/Utility.php';
    // check if sourceA and sourceB paths are in session data
    if(!isset($_POST['CheckName']) || 
       !isset($_POST['ProjectName']))
    {
        echo 'fail';
        return; 
    }

    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];

    $array = explode("\\", __DIR__);
    unset($array[sizeof($array)-1]);
    unset($array[sizeof($array)-1]);
    $studioPath = implode("/", $array);     

    $mainFileName = $_POST['MainFile'];
    $uploadDirectory = NULL;
    $Source = $_POST['Source'];
    switch($Source){
        case "a":
        $uploadDirectory =  getCheckSourceAPath($projectName, $checkName);
        break;
        case "b":
        $uploadDirectory =  getCheckSourceBPath($projectName, $checkName);
        break;
        case "c":
        $uploadDirectory =  getCheckSourceCPath($projectName, $checkName);
        break;
        case "d":
        $uploadDirectory =  getCheckSourceDPath($projectName, $checkName);
        break;
    }
    $fileName=  $uploadDirectory."/".$mainFileName; 
    $file = fileExists($fileName, false);
    if (!$file) {
        echo "fail";
        return;
    } 

    $file = basename($file);     
    $inputFileName=  $uploadDirectory."/".$file;

    $launch_converter = "../xCheckFileReader/x64/Release/xCheckFileReader.exe";

    $fileNameLowerCase = strtolower($fileName);
    $file_parts = pathinfo($fileNameLowerCase);
    if (isset($file_parts['extension'])) {
        switch (strtolower($file_parts['extension'])) {
            case "vsd":
            case "vsdx":
                $launch_converter = "../xCheckFileReader/x64/Release/VisioReader.exe";
            break;
        }
    }

    $command = '"'.$launch_converter. '" "'. $inputFileName. '"';
    exec($command, $output);
    echo  trim($file);

function fileExists($fileName, $caseSensitive = true) {
    $hasExtension = true;
    $file_parts = pathinfo($fileName);
    if(!isset($file_parts['extension']))
    {
        $hasExtension = false;
    }
    else
    {
        switch($file_parts['extension'])
        {   
            case "":
            case NULL: // Handle no file extension
            $hasExtension = false;
            break;
        }
    }
    
    // Handle case insensitive requests            
    $directoryName = dirname($fileName);   
    $fileArray = glob($directoryName . '/*', GLOB_NOSORT);
    $fileNameLowerCase = strtolower($fileName);
      
    foreach($fileArray as $file) {
 
        if($hasExtension)
        {
            if(strtolower($file) == $fileNameLowerCase) {
                return $file;
            }
        }
        else
        {
            $filePathParts = pathinfo($file); 
            switch(strtolower($filePathParts['extension']))
            {
                case "step":               
                case "xml":
                case "rvm":               
                case "xls":
                case "sldasm":               
                case "dwg":
                case "dxf":
                case "dwf":
                case "dwfx":
                case "sldprt":               
                case "rvt":
                case "rfa":               
                case "ifc":
                case "step":
                case "stp":
                case "ste":
                case "igs":
                case "vsd":
                case "vsdx":
                case "jt":
                case "prt":
                case "mf1":
                case "arc":
                case "unv":
                case "pkg":
                case "model":
                case "session":
                case "dlv":
                case "exp":
                case "catdrawing":
                case "catpart":
                case "catproduct":
                case "catshape":
                case "cgr":
                case "3dxml":
                case "obj":
                case "asm":
                case "neu":
                case "xas":
                case "xpr":
                case "ipt":
                case "iam":
                case "asm":
                case "par":
                case "pwd":
                case "psm":
                case "3ds":
                case "u3d":
                case "sat":
                case "sab":
                if($filePathParts['filename'] ===  $file_parts['filename'])
                {                    
                    return $file;
                }
                break;             
            }
        }
    }
    return false;
    }
?>