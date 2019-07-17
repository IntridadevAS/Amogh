<?php

    if(!isset( $_POST["Operation"]) ||
       !isset( $_POST["ValidSourceTypes"]))
    {
        echo "fail";
        return;
    }
    
    $operation = $_POST["Operation"];

    $validSources = json_decode($_POST['ValidSourceTypes'],true);    
    // $validSources = array("xml","XML","rvm","RVM", "xls", "XLS", "sldasm", "SLDASM","DWG", "dwg", "sldprt", 
    // "SLDPRT", "rvt", "rfa", "IFC", "STEP", "STE", "STP", "ifc", "step", "stp", "ste", "json", "IGS", "igs");
    $counter = 0;
    $uploadedFiles = array();

    $webViewerDirectory = dirname ( __DIR__ );

    foreach($_FILES["dataSoures"]["tmp_name"] as $key=>$tmp_name)
    {
        $temp = $_FILES["dataSoures"]["tmp_name"][$key];
        $name = $_FILES["dataSoures"]["name"][$key];
    
        $ext = pathinfo($name, PATHINFO_EXTENSION);
        if(in_array($ext, $validSources) == false)
        {
            continue;
        }

        $UploadFolder= $webViewerDirectory."/configurations/temp";

        if (!file_exists( $UploadFolder)) {
            mkdir($UploadFolder, 0777, true);
        }
        $UploadPath=  $UploadFolder."/".$name;        
    
        if(empty($temp))
        {
            break;
        }               
                
        move_uploaded_file($temp, $UploadPath);
        array_push($uploadedFiles, $name);

        $counter++;
    }

    if($counter>0)
    {             
        if(strtolower($operation) === "converttoscs" )
        {
            foreach($uploadedFiles as $fileName)
            {
                $ext = pathinfo($fileName, PATHINFO_EXTENSION);
                if(in_array($ext, $validSources) == true)
                {
        
                    $UploadPath= $webViewerDirectory."/configurations/temp/".$fileName;                    
	
                    $output_name=explode(".",$fileName);                    
                    $output_file_path = $webViewerDirectory."/configurations/temp/".$output_name[0];                   
                    
                    $array = explode("\\", __DIR__);
                    unset($array[sizeof($array)-1]);
                    unset($array[sizeof($array)-1]);
                    $studioPath = implode("/", $array);
                    $launch_converter = $studioPath."/xCheckFileReader/x64/Release/xCheckFileReader.exe";

                    $command = '"'.$launch_converter. '" "'. $UploadPath. '" "'.$output_file_path.'"';                         
                    exec($command, $output);
   
                    echo 'success';   
                    break;                         
                }
            }
        }
        else if(strtolower($operation) === "exportattributes" )
        {
            foreach($uploadedFiles as $fileName)
            {
                $ext = pathinfo($fileName, PATHINFO_EXTENSION);
                if(in_array($ext, $validSources) == true)
                {
                    $array = explode("\\", __DIR__);
                    unset($array[sizeof($array)-1]);
                    unset($array[sizeof($array)-1]);
                    $studioPath = implode("/", $array);
                    $launch_converter = $studioPath."/xCheckFileReader/x64/Release/xCheckFileReader.exe";

                    $UploadPath= $webViewerDirectory."/configurations/temp/".$fileName;    
                    $output_name=explode(".",$fileName);  
                    $output_file_path = $webViewerDirectory."/configurations/temp/".$output_name[0].".json"; 

                    $command = '"'.$launch_converter. '" "'. $UploadPath. '" "$export_attributes_only$" "'.$output_file_path.'"';                                    
                    exec($command, $output);

                    // read attributes data in json form
                    $jsonFileContents = file_get_contents($output_file_path);
                    $data = array();
                    $data [$fileName]=$jsonFileContents;
                    echo json_encode( $data );

                    // delete all files in directory uploaded source
                    $files = glob($webViewerDirectory."/configurations/temp/*"); // get all file names                                        
                    foreach($files as $file)
                    {
                        if(is_file($file))
                       {
                            unlink($file); // delete file
                       }
                    } 
                    rmdir($webViewerDirectory."/configurations/temp"); 

                    break;                    
                }
            }
        }
    }
    else
    {
        echo 'fail';
        return;
    }
?>