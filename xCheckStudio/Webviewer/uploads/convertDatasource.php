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

//    $scriptParentDirectory = dirname ( __DIR__ );

    $array = explode("\\", __DIR__);
    unset($array[sizeof($array)-1]);
    unset($array[sizeof($array)-1]);
    $studioPath = implode("/", $array);
    //$launch_converter = $studioPath."/xCheckFileReader/x64/Release/xCheckFileReader.exe";
    $launch_converter = "../xCheckFileReader/x64/Release/xCheckFileReader.exe";

    $mainFileName = $_POST['MainFile'];

    $uploadDirectory = NULL;

    if($_POST['Source'] == "a")
    {
        $uploadDirectory =  getCheckSourceAPath($projectName, $checkName);
    }
    else if($_POST['Source'] == "b")
    {
        $uploadDirectory =  getCheckSourceBPath($projectName, $checkName);
    }
    else if($_POST['Source'] == "c")
    {
        $uploadDirectory =  getCheckSourceCPath($projectName, $checkName);      
    }
    else if($_POST['Source'] == "d")
    {
        $uploadDirectory =  getCheckSourceDPath($projectName, $checkName); 
    }

    if($_POST['Source'] == "a")
    {
        $filename=  $uploadDirectory."/".$mainFileName;          
    }
    else if($_POST['Source'] == "b")
    {
        $filename=  $uploadDirectory."/".$mainFileName;              
    }
    else if($_POST['Source'] == "c")
    {
        $filename=  $uploadDirectory."/".$mainFileName;     
    }
    else if($_POST['Source'] == "d")
    {
        $filename=  $uploadDirectory."/".$mainFileName;      
    }


    $file = fileExists($filename, false);
    if ($file) {
        //echo "The file $file exists";    
    } 
    else 
    {
    //   echo "The file $file does not exist";
        echo "fail";
        return;
    }

    $file = basename($file);     

    if($_POST['Source'] == "a")
    {
        $inputFileName=  $uploadDirectory."/".$file;          
    }
    else if($_POST['Source'] == "b")
    {
        $inputFileName=  $uploadDirectory."/".$file;               
    }
    else if($_POST['Source'] == "c")
    {
        $inputFileName=  $uploadDirectory."/".$file;       
    }
    else if($_POST['Source'] == "d")
    {
        $inputFileName=  $uploadDirectory."/".$file;       
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
                case "sldprt":               
                case "rvt":
                case "rfa":               
                case "ifc":
                case "step":
                case "stp":
                case "ste":               
                case "igs":
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