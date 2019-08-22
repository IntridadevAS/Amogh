<?php 
    require_once '../PHP/Utility.php';

    if(!isset($_POST['CheckName']) || 
       !isset($_POST['ProjectName']))
    {
        echo 'fail';
        return; 
    }
    
    $projectName = $_POST['ProjectName'];
    $checkName = $_POST['CheckName'];

    // check if sourceA and sourceB paths are in session data
    if(!isset( $_POST["ConvertToSCS"]))
    {
        echo "fail";
        return;
    }
    $ConvertToSCS = $_POST["ConvertToSCS"];

    $errors = array();
    $uploadedFiles = array();
    $extension = array("xml","XML","rvm","RVM", "xls", "XLS", "att", "ATT", "sldasm", "SLDASM","DWG", "dwg", 
    "sldprt", "SLDPRT", "rvt", "rfa", "IFC", "STEP", "STE", "STP", "ifc", "step", "stp", "ste", "json", "IGS", "igs");
    $validSources = array("xml","XML","rvm","RVM", "xls", "XLS", "sldasm", "SLDASM","DWG", "dwg", "sldprt", 
    "SLDPRT", "rvt", "rfa", "IFC", "STEP", "STE", "STP", "ifc", "step", "stp", "ste", "json", "IGS", "igs");

    $UploadFolder = "UploadFolder";
    $counter = 0;

    $array = explode("\\", __DIR__);
    unset($array[sizeof($array)-1]);
    unset($array[sizeof($array)-1]);
    $studioPath = implode("/", $array);
    //$launch_converter = $studioPath."/xCheckFileReader/x64/Release/xCheckFileReader.exe";
    $launch_converter = "../xCheckFileReader/x64/Release/xCheckFileReader.exe";


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

    if($uploadDirectory === NULL)
    {
        echo "fail";
        return;
    }

    foreach($_FILES["dataSouresName"]["tmp_name"] as $key=>$tmp_name)
    {
        $temp = $_FILES["dataSouresName"]["tmp_name"][$key];
        $name = $_FILES["dataSouresName"]["name"][$key];

        // upload target file name
        $UploadFolder= $uploadDirectory."/".$name;
            
        if(empty($temp))
        {
            break;
        }
        
        $counter++;
        $UploadOk = true;   
        
        $ext = pathinfo($name, PATHINFO_EXTENSION);
        if(in_array($ext, $extension) == false)
        {
            $UploadOk = false;
            array_push($errors, $name." is invalid file type.");
        }     
        
        if($UploadOk == true)
        {
            move_uploaded_file($temp, $UploadFolder);
            array_push($uploadedFiles, $name);
        }
    }    

    if($counter>0)
    { 
        if($ConvertToSCS === "true" )
        {
            // echo 'Starting File Conversion....';
            // echo "<br>";
        
            foreach($uploadedFiles as $fileName)
            {
                $ext = pathinfo($fileName, PATHINFO_EXTENSION);
                if(in_array($ext, $validSources) == true)
                {
                    $output_name=explode(".",$fileName);
        

                    $UploadFolder= $uploadDirectory."/".$fileName;  
                    $output_file_path= $uploadDirectory."/".$output_name[0];                    
                    
                    $command = '"'.$launch_converter. '" "'. $UploadFolder. '" "'.$output_file_path.'"';                  
                    exec($command, $output);
                   
                    echo 'success';
        
                    break; 
                }
            }
        }
    }
    else
    {
        echo "fail";    
    }

    ?>