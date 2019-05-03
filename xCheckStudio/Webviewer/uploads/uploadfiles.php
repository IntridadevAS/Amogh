<?php 

session_start();

// check if sourceA and sourceB paths are in session data
if(!isset( $_SESSION["SourceAPath"]) ||
   !isset( $_SESSION["SourceBPath"]) ||
   !isset( $_POST["ConvertToSCS"]))
   {
       echo "fail";
       return;
   }

   $sourceADirectory =  $_SESSION["SourceAPath"];
   $sourceBDirectory =  $_SESSION["SourceBPath"];
   $ConvertToSCS = $_POST["ConvertToSCS"];
//    var_dump($ConvertToSCS);
//    echo $ConvertToSCS;

$errors = array();
$uploadedFiles = array();
$extension = array("xml","XML","rvm","RVM", "xls", "XLS", "att", "ATT", "sldasm", "SLDASM","DWG", "dwg", "sldprt", "SLDPRT", "rvt", "rfa", "IFC", "STEP", "STE", "STP", "ifc", "step", "stp", "ste", "json");
$validSources = array("xml","XML","rvm","RVM", "xls", "XLS", "sldasm", "SLDASM","DWG", "dwg", "sldprt", "SLDPRT", "rvt", "rfa", "IFC", "STEP", "STE", "STP", "ifc", "step", "stp", "ste", "json");
// $bytes = 1024;
// $KB = 1024;
// $totalBytes = $bytes * $KB;
$UploadFolder = "UploadFolder";
$counter = 0;

$array = explode("\\", __DIR__);
unset($array[sizeof($array)-1]);
unset($array[sizeof($array)-1]);
$studioPath = implode("/", $array);
$launch_converter = $studioPath."/xCheckFileReader/x64/Release/xCheckFileReader.exe";

$scriptParentDirectory = dirname ( __DIR__ );

foreach($_FILES["dataSouresName"]["tmp_name"] as $key=>$tmp_name)
{
        $temp = $_FILES["dataSouresName"]["tmp_name"][$key];
        $name = $_FILES["dataSouresName"]["name"][$key];
     
       
        if($_POST['viewerContainer'] == "viewerContainer1")
        {
            $UploadFolder= $scriptParentDirectory."/".$sourceADirectory."/".$name;
            //$UploadFolder=__DIR__."/scs/SourceA/".$name;	
        }
        if($_POST['viewerContainer'] == "viewerContainer2")
        {
            $UploadFolder= $scriptParentDirectory."/".$sourceBDirectory."/".$name;
            //$UploadFolder=__DIR__."/scs/SourceB/".$name;
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
    if(count($errors)>0)
    {
        echo "<b>Errors:</b>";
        echo "<br/><ul>";
        foreach($errors as $error)
        {
            echo "<li>".$error."</li>";
        }
        echo "</ul><br/>";
    }
     
    if(count($uploadedFiles)>0){
        echo "<b>Uploaded Files:</b>";
        echo "<br/><ul>";
        foreach($uploadedFiles as $fileName)
        {
            echo "<li>".$fileName."</li>";
        }
        echo "</ul><br/>";
         
        echo count($uploadedFiles)." file(s) are successfully uploaded.";
	}    
	
	
	echo 'Model Has Been Uploaded !';
    echo "<br>";
    
    if($ConvertToSCS === "true" )
    {
        echo 'Starting File Conversion....';
        echo "<br>";
    
        foreach($uploadedFiles as $fileName)
        {
            $ext = pathinfo($fileName, PATHINFO_EXTENSION);
            if(in_array($ext, $validSources) == true)
            {
    
                if($_POST['viewerContainer'] == "viewerContainer1")
                {
                    $UploadFolder=  $scriptParentDirectory."/".$sourceADirectory."/".$fileName;               
                }
                if($_POST['viewerContainer'] == "viewerContainer2")
                {
                    $UploadFolder= $scriptParentDirectory."/".$sourceBDirectory."/".$fileName;               
                }
    
                // $UploadFolder=__DIR__."/scs/".$fileName;		
                $output_name=explode(".",$fileName);
                
                if($_POST['viewerContainer'] == "viewerContainer1")
                {
                    $output_file_path= $scriptParentDirectory."/".$sourceADirectory."/"."$output_name[0]";
                }
                if($_POST['viewerContainer'] == "viewerContainer2")
                {
                    $output_file_path=$scriptParentDirectory."/".$sourceBDirectory."/"."$output_name[0]";
                }
    
                // $output_file_path=__DIR__."/scs/"."$output_name[0]";
                
                $command = '"'.$launch_converter. '" "'. $UploadFolder. '" "'.$output_file_path.'"';
                echo "Command : ".$command;
                //print_r($command);
                //'$command';
                
                exec($command, $output);
                //print_r($output);
                
                //`$launch_converter $dest $output_file_path`;
                echo "<br>";
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