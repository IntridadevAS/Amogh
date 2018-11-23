<?php 

//phpinfo();
if ($_SERVER['REQUEST_METHOD'] == 'POST') 
{
	//$key='4BQ32gQ_5Fi2ChYP0DeVxQN21wiz5CYRvSaLvANu3C3x0zazqWhLjDNnBCYX1vMj4yFo8yV1CU1FjAIRxgmH2EuWwuZ86eUG1w72DUjbCgARCUzywDN1BQJmwSQJASR32TJq5iN36jiP2CJlBheZAAIJ4UUQ0RNr3uE02zbr4vf59yvt0QUS9BazCwQ37SZ49ya41SA84hNl1CY8DyYJ4yJlBwV$BhZv9xbnxQEL4EZE0fIT4vb6wD9Oj7EMxxfs5rLFjDbo8w9Gj7DFDgYW3Y9Jj7EJ1SqNRrTFjBJxBg6TEeFsAyNw5ybw8Fnt3CR75TNbxziMvAJxAxa80i2S8S35CEAGBuY3wCmQ7UuP7UeH0DM29gZc5jb39iuS9Drc5sQYzyYgj7DFqNHFjEV7AeZmvUrmvRiUCfNq3BfcBi6ZDga52EI_DyBz8SR55uN7wCNq5RYYBjf32gUY4iEX0TJw9xmG5jns5AE7Ai6GCRR5wBR3wwVa5CFa4RYMzSiHAfU6xFiK9jjlwRVzAEmM3fmT3Sja1wB54CIH1yaQwuY_2yQ_0gmIxy7$8iVdBhjqwEbvzUAW8TQ_ByFz7Sz0BxMJByq71CA6CDJ49vnq5Bnp9AI_1uNbARjyAjaI5fU_Ayv68zbrxBQNByiM8waN8Sjr8hf80SeN5hRb5CEW0QV3xSvn9RVpASMR2yByEeYzAiqQCyUzCCYH4Rfl8SFrCimSCVeJCgq1wgY01QEYAgU08yRrwfe5DuRu5heGUrLFjEJ42SYhj7DFwfm4wDNlxeJovBnpxxRk8hVpwuE49eI2xuUzx7Fo7QJnwUazxAJnvAM68ve89hM2xAJpxRflwBe68hQ68eZm8uY5xAU6wfnkxDZlxRnoxuU7xhJn9eY88hQ0wQI78QRmxQFovAQ1xTVk9fe59hJnwAJk9eM57QJo9ibkxQI39eI59hY0wRjkwQJl9hM08DZlxuFlvDY38hNoxeFmxuU08uE5wANk8TJm7TM7weJlvAUz9eVl8eVo9hNpwDI4vQI0xQZmxDM6vQVkxibmxeZpxuRnwTZpvTVnvAY0vTJm7TM6vQM28QJowARoxhU88BnpvRi6wDQ8weU2vDUzwhI28Rjk9eU3weM3xAM6wDRnvQE78uQz8Rjk8uNkwvfovTNm7TVmwAZpwuJnvAY8vQNnxhQ3wfm4wuMzw7E0CyIQ';
	print_r("PHP Directory : ".__DIR__);
	print_r("<br>");
	
	$array = explode("\\", __DIR__);
    unset($array[sizeof($array)-1]);
	unset($array[sizeof($array)-1]);
    $studioPath = implode("/", $array);

	print_r("Studio Path : ".$studioPath);
	print_r("<br>");
	
	$launch_converter = $studioPath."/xCheckFileReader/x64/Release/xCheckFileReader.exe";
	print_r("FileReader Exe Path : ".$launch_converter);
	print_r("<br>");
	
	$input_file_name=$_FILES['dataSouresName']['name'];
	//print_r($_FILES['dataSouresName']['name']);
	$output_name=explode(".",$input_file_name);
	//print_r($output_name[0].".scs");
	
	$input_file_path=__DIR__."/scs/".$input_file_name;
	print_r("Input File Path: ".$input_file_path);
	print_r("<br>");
	
	$output_file_path=__DIR__."/scs/"."$output_name[0]";
	print_r("Ouput File Path: ".$output_file_path);
	print_r("<br>");
	
	//$input_file_path="D:/Intrida/Source Code/xCheckStudioViewer.git/trunk/xCheckStudio/Webviewer/uploads/scs/"."$input_file_name";
	//$input_file_path="/scs/"."$input_file_name";
    //$output_file_path="D:/Intrida/Source Code/xCheckStudioViewer.git/trunk/xCheckStudio/Webviewer/uploads/scs/"."$output_name[0]";
	//$output_file_path=__DIR__."/scs/"."$output_name[0]";
	//$launch_converter="D:/Intrida/Source Code/xCheckFileReader.git/trunk/xCheckFileReader/x64/Debug/xCheckFileReader.exe";	
	//print_r($_FILES);
  if (is_uploaded_file($_FILES['dataSouresName']['tmp_name'])) 
  { 

  	//First, Validate the file name
  	if(empty($_FILES['dataSouresName']['name']))
  	{
  		echo " File name is empty! ";
  		exit;
  	}	
 
  	$upload_file_name = $_FILES['dataSouresName']['name'];
     
	//$dest="D:/Intrida/Source Code/xCheckStudioViewer.git/trunk/xCheckStudio/Webviewer/uploads/scs/".$upload_file_name;
	 $dest=$input_file_path;
	 print_r("Destination Path to move uploaded file: ".$dest);
	 print_r("<br>");
	
    if (move_uploaded_file($_FILES['dataSouresName']['tmp_name'], $dest)) 
    {		
    	echo 'Model Has Been Uploaded !';
		echo "<br>";
		echo 'Starting File Conversion....';
		echo "<br>";
		
		//$dest = $dest.".xml";
		$command = '"'.$launch_converter. '" "'. $dest. '" "'.$output_file_path.'"';
		print_r($command);
		//'$command';
		
		exec($command, $output);
		print_r($output);
		
		//`$launch_converter $dest $output_file_path`;
		echo "<br>";
		echo 'File Conversion Complete..You can load the model..';	
		
    }
	
  }
  else{echo 'Failed 6';}
}
