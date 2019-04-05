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

echo $studioPath;
echo $launch_converter;

if($_POST['viewerContainer'] == "viewerContainer1")
{
    $filename=  $scriptParentDirectory."/".$sourceADirectory."/".$mainFileName;               
}
if($_POST['viewerContainer'] == "viewerContainer2")
{
    $filename= $scriptParentDirectory."/".$sourceBDirectory."/".$mainFileName;               
}

//$filename = __DIR__."/scs/".$mainFileName;
echo $filename;

$file = fileExists($filename, false);
if ($file) {
    echo "The file $file exists";    
} 
else 
{
    echo "The file $file does not exist";
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

//$inputFileName = __DIR__."/scs/".$file;
echo "inputFileName : ".$inputFileName;

$output_name=explode(".",$file);
if($_POST['viewerContainer'] == "viewerContainer1")
{
    $output_file_path=  $scriptParentDirectory."/".$sourceADirectory."/".$output_name[0];               
}
if($_POST['viewerContainer'] == "viewerContainer2")
{
    $output_file_path= $scriptParentDirectory."/".$sourceBDirectory."/".$output_name[0];              
}

//$output_file_path=__DIR__."/scs/"."$output_name[0]";
echo "output_file_path : ".$output_file_path;

$command = '"'.$launch_converter. '" "'. $inputFileName. '" "'.$output_file_path.'"';
			echo "Command : ".$command;
			//print_r($command);
			//'$command';
			
			exec($command, $output);
			//print_r($output);
			
			//`$launch_converter $dest $output_file_path`;
			echo "<br>";
			echo 'File Conversion Complete..You can load the model..';


function fileExists($fileName, $caseSensitive = true) {

    // if(file_exists($fileName)) {
    //     return $fileName;
    // }
    // if($caseSensitive) return false;
    
    // Handle case insensitive requests            
    $directoryName = dirname($fileName);
    echo "<br>";
    echo "dir name : ".$directoryName ;
    echo "<br>";

    $fileArray = glob($directoryName . '/*', GLOB_NOSORT);
    $fileNameLowerCase = strtolower($fileName);
    echo "<br>";
    echo "fileNameLowerCase : ".$fileNameLowerCase ;
    echo "<br>";
    
    foreach($fileArray as $file) {
        echo "<br>";
    echo "file : ".$file ;
    echo "<br>";

        if(strtolower($file) == $fileNameLowerCase) {
            return $file;
        }
    }
    return false;
    }

?>





