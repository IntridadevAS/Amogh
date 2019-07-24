<?php 

session_start();
// check if sourceA and sourceB paths are in session data
if(!isset( $_SESSION["SourceAPath"]) ||
   !isset( $_SESSION["SourceBPath"]) ||
   !isset($_POST['viewerContainer']))
   {
       echo "fail";
       return;
   }

   $sourceADirectory =  $_SESSION["SourceAPath"];
   $sourceBDirectory =  $_SESSION["SourceBPath"];

   $scriptParentDirectory = dirname ( __DIR__ );

    $array = explode("\\", __DIR__);
    unset($array[sizeof($array)-1]);
    unset($array[sizeof($array)-1]);
    $studioPath = implode("/", $array);
    $launch_converter = $studioPath."/xCheckFileReader/x64/Release/xCheckFileReader.exe";

    $mainFileName = $_POST['MainFile'];


    if($_POST['viewerContainer'] == "viewerContainer1")
    {
        $filename=  $scriptParentDirectory."/".$sourceADirectory."/".$mainFileName;               
    }
    if($_POST['viewerContainer'] == "viewerContainer2")
    {
        $filename= $scriptParentDirectory."/".$sourceBDirectory."/".$mainFileName;               
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

    if($_POST['viewerContainer'] == "viewerContainer1")
    {
        $inputFileName=  $scriptParentDirectory."/".$sourceADirectory."/".$file;               
    }
    if($_POST['viewerContainer'] == "viewerContainer2")
    {
        $inputFileName= $scriptParentDirectory."/".$sourceBDirectory."/".$file;               
    }
   
    $output_name=explode(".",$file);
    if($_POST['viewerContainer'] == "viewerContainer1")
    {
        $output_file_path=  $scriptParentDirectory."/".$sourceADirectory."/".$output_name[0];               
    }
    if($_POST['viewerContainer'] == "viewerContainer2")
    {
        $output_file_path= $scriptParentDirectory."/".$sourceBDirectory."/".$output_name[0];              
    }   

    $command = '"'.$launch_converter. '" "'. $inputFileName. '" "'.$output_file_path.'"';
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