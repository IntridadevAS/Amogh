<?php 
phpinfo();

if(isset($_FILES['files']['name'][0]))
{
    foreach($_FILES['files']['name'] as $keys => $values)
    {       
        $sourcePath = $_FILES["files"]["tmp_name"][$keys];
        $targetPath = $_FILES["files"]["name"][$keys];
	 
        $UploadFolder=__DIR__."/scs/".$targetPath;	
        
        if(move_uploaded_file($sourcePath, $UploadFolder))
        {
            echo 'Upload Successful.';
            echo "Source : ".$sourcePath;
            echo "Target : ".$targetPath;
            echo "Upload Folder : ".$UploadFolder;            
        }
    }
}
else
{
    echo "Error";
}


// $name = $_FILES['file']['name'];
// echo "Name: ".$name;
// // echo '<br>'
// echo "Temp Name: ".$_FILES['file']['tmp_name'];
// // echo '\n'
// $UploadFolder=__DIR__."/scs/".$name;	
// echo "Upload Folder:".$UploadFolder;
// move_uploaded_file($_FILES['file']['tmp_name'], $UploadFolder);

