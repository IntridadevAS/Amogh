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
    if(!isset( $_POST["ConvertToSCS"]) ||
       !isset( $_POST["ConvertToSVG"]))
    {
        echo "fail";
        return;
    }
    $ConvertToSCS = $_POST["ConvertToSCS"];
    $ConvertToSVG = $_POST["ConvertToSVG"];

    $errors = array();
    $uploadedFiles = array();
    $extension = array("xml","rvm", "xls", "att", "sldasm", "dwg", "dxf",
    "dwf", "dwfx", "sldprt", "rvt", "rfa",  "ifc", "step", "stp", "ste", "json", "igs",
    "vsd", "vsdx", 
    "jt","prt", "mf1", "arc", "unv", "pkg", "model", "session", "dlv", "exp",
    "catdrawing", "catpart", "catproduct", "catshape", "cgr",
    "3dxml", "obj", "asm", "neu", "prt", "xas", "xpr",
    "ipt", "iam", "asm", "par", "pwd", "psm",
    "3ds", "u3d", "sat", "sab");
    $validSources = array("xml","rvm", "xls", "sldasm", "dwg", "dxf", "dwf", "dwfx", "sldprt", 
    "rvt", "rfa", "ifc", "step", "stp", "ste", "json", "igs",
    "vsd", "vsdx", 
    "jt","prt", "mf1", "arc", "unv", "pkg", "model", "session", "dlv", "exp",
    "catdrawing", "catpart", "catproduct", "catshape", "cgr",
    "3dxml", "obj", "asm", "neu", "prt", "xas", "xpr",
    "ipt", "iam", "asm", "par", "pwd", "psm",
    "3ds", "u3d", "sat", "sab");

    $UploadFolder = "UploadFolder";
    $counter = 0;

    $array = explode("\\", __DIR__);
    unset($array[sizeof($array)-1]);
    unset($array[sizeof($array)-1]);
    $studioPath = implode("/", $array);  
   
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

    if($uploadDirectory === NULL)
    {
        echo "fail";
        return;
    }

    foreach($_FILES["files"]["tmp_name"] as $key=>$tmp_name)
    {
        $temp = $_FILES["files"]["tmp_name"][$key];
        $name = $_FILES["files"]["name"][$key];

        // upload target file name
        $UploadFolder= $uploadDirectory."/".$name;
            
        if(empty($temp))
        {
            break;
        }
        
        $counter++;
        $UploadOk = true;   
        
        $ext = pathinfo($name, PATHINFO_EXTENSION);
        if(in_array(strtolower($ext), $extension) == false)
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
        if($ConvertToSCS !== "true" &&
           $ConvertToSVG !== "true")
        {    
            echo "fail"; 
            return; 
        }     

        $convertibleFiles = array();
        foreach($uploadedFiles as $fileName)
        {
            $ext = pathinfo($fileName, PATHINFO_EXTENSION);
            if(in_array(strtolower($ext), $validSources) == true)
            {
                $UploadedFile= $uploadDirectory."/".$fileName;    
                array_push($convertibleFiles, $UploadedFile);

                if(strtolower($ext) === 'xml')
                {
                    continue;
                }

                break;
            }
        }      
        if(count($convertibleFiles) === 0)
        {
            echo "fail";
            return;     
        }

        $launch_converter = "../xCheckFileReader/x64/Release/xCheckFileReader.exe";
        // check if source is visio
        $ext = pathinfo($convertibleFiles[0], PATHINFO_EXTENSION);
        if($ConvertToSVG === "true")
        {
            $launch_converter = "../xCheckFileReader/x64/Release/VisioReader.exe";
        }

        $command = '"'.$launch_converter. '"';
        for ($i = 0; $i < count($convertibleFiles); $i++) 
        {
            $command =   $command.' "'.$convertibleFiles[$i]. '"';
        }
        exec($command, $output);

        // echo $command;
        echo 'success';        
        return; 
    }
    else
    {
        echo "fail";    
    }

    ?>