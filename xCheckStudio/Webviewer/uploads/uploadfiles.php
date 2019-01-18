<?php 

$errors = array();
$uploadedFiles = array();
$extension = array("xml","XML","rvm","RVM", "xls", "XLS", "att", "ATT", "sldasm", "SLDASM");
$validSources = array("xml","XML","rvm","RVM", "xls", "XLS", "sldasm", "SLDASM");
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

foreach($_FILES["dataSouresName"]["tmp_name"] as $key=>$tmp_name)
{
        $temp = $_FILES["dataSouresName"]["tmp_name"][$key];
        $name = $_FILES["dataSouresName"]["name"][$key];
	 
		$UploadFolder=__DIR__."/scs/".$name;	

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
	echo 'Starting File Conversion....';
	echo "<br>";

	foreach($uploadedFiles as $fileName)
	{
		$ext = pathinfo($fileName, PATHINFO_EXTENSION);
		if(in_array($ext, $validSources) == true)
		{
			$UploadFolder=__DIR__."/scs/".$fileName;		
			$output_name=explode(".",$fileName);
			$output_file_path=__DIR__."/scs/"."$output_name[0]";
			
			$command = '"'.$launch_converter. '" "'. $UploadFolder. '" "'.$output_file_path.'"';
			echo "Command : ".$command;
			print_r($command);
			//'$command';
			
			exec($command, $output);
			print_r($output);
			
			//`$launch_converter $dest $output_file_path`;
			echo "<br>";
			echo 'File Conversion Complete..You can load the model..';

			break; 
		}
	}     
}
else
{
    echo "Please, Select file(s) to upload.";
}