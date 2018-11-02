<?php 
if ($_SERVER['REQUEST_METHOD'] == 'POST') 
{
	//count of files selected to upload
	$countfiles = count($_FILES['dataSouresName']['name']);
	for($i=0; $i<$countfiles; $i++)
	{
		$ext = pathinfo($_FILES['dataSouresName']['name'][$i], PATHINFO_EXTENSION);
		print_r($ext);
		if($ext == 'scs')
		{
			if (is_uploaded_file($_FILES['dataSouresName']['tmp_name'][$i])) 
			{ 

				//First, Validate the file name
				if(empty($_FILES['dataSouresName']['tmp_name'][$i]))
				{
					echo " File name is empty! ";
					exit;
				}
			
				//name of file from array of selected files to load 
				$upload_file_name = $_FILES['dataSouresName']['name'][$i];
				$dest=__DIR__.'/scs/'.$upload_file_name;
				if (move_uploaded_file($_FILES['dataSouresName']['tmp_name'][$i], $dest)) 
				{
					echo nl2br("Model Has Been Uploaded !\n");
				}
			}
		    else{echo 'Failed 6';}
		}
		else{echo 'Failed 7: file is not in SCS format';}
	}  
}