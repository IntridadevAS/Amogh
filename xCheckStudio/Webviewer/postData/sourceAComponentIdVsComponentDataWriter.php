 <?php   
   $script= $_POST; 
   $fileName="sourceAComponentIdVsComponentData.js";

   if (file_exists($fileName)) 
	{ 
		unlink($fileName);
	}
   file_put_contents($fileName, "var SourceAComponentIdVsComponentData = ");
   file_put_contents($fileName, $script, FILE_APPEND);
   file_put_contents($fileName, ";", FILE_APPEND);
?>;