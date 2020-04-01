<?php 

    require_once '../PHP/Utility.php';

    if(!isset($_POST['CheckName']) || !isset($_POST['ProjectName']))
    {
        echo 'Project Name or Check Name not set';
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
    $extension = array("xml","XML","rvm","RVM", "xls", "XLS", "att", "ATT", "sldasm", "SLDASM","DWG", "dwg", "DXF", "dxf",
    "DWF", "dwf", "DWFX", "dwfx", "sldprt", "SLDPRT", "rvt", "rfa", "IFC", "STEP", "STE", "STP", "ifc", "step", "stp", "ste", "json", "IGS", "igs");
    $validSources = array("xml","XML","rvm","RVM", "xls", "XLS", "sldasm", "SLDASM","DWG", "dwg", "DXF", "dxf", "sldprt", 
    "DWF", "dwf", "DWFX", "dwfx", "SLDPRT", "rvt", "rfa", "IFC", "STEP", "STE", "STP", "ifc", "step", "stp", "ste", "json", "IGS", "igs");

    $UploadFolder = "UploadFolder";
    $counter = 0;

    $array = explode("\\", __DIR__);
    unset($array[sizeof($array)-1]);
    unset($array[sizeof($array)-1]);
    $studioPath = implode("/", $array);
    //$launch_converter = $studioPath."/xCheckFileReader/x64/Release/xCheckFileReader.exe";
    $launch_converter = "../xCheckFileReader/x64/Release/xCheckFileReader.exe";

    foreach($_FILES["dataSouresName"]["tmp_name"] as $key=>$tmp_name)
    {
            $temp = $_FILES["dataSouresName"]["tmp_name"][$key];
            $name = $_FILES["dataSouresName"]["name"][$key];
    
            if($_POST['viewerContainer'] == "viewerContainer1")
            {
                $sourceADirectory =  getCheckSourceAPath($projectName, $checkName);
                $UploadFolder= $sourceADirectory."/".$name;
            }
            if($_POST['viewerContainer'] == "viewerContainer2")
            {
                $sourceBDirectory =  getCheckSourceBPath($projectName, $checkName);
                $UploadFolder= $sourceBDirectory."/".$name;
            }
        
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
        echo 'Model Has Been Uploaded !';
        echo "<br>";
        
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
        
                    if($_POST['viewerContainer'] == "viewerContainer1")
                    {
                        $sourceADirectory =  getCheckSourceAPath($projectName, $checkName);
                        $UploadFolder= $sourceADirectory."/".$fileName;  
                        $output_file_path= $sourceADirectory."/".$output_name[0];             
                    }
                    else if($_POST['viewerContainer'] == "viewerContainer2")
                    {
                        $sourceBDirectory =  getCheckSourceBPath($projectName, $checkName);
                        $UploadFolder= $sourceBDirectory."/".$fileName; 
                        $output_file_path=$sourceBDirectory."/".$output_name[0];              
                    }
                    
                    $command = '"'.$launch_converter. '" "'. $UploadFolder. '" "'.$output_file_path.'"';                  
                    exec($command, $output);
                    echo 'File Conversion Complete..You can load the model..';
        
                    break; 
                }
            }
        }	     
    }
    else
    {
        echo "Please, Select file(s) to upload.";
    }