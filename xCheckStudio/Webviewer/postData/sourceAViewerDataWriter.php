<?php   
   $script= $_POST; 
   $fileName="SourceAViewerData.js";

   if (file_exists($fileName)) 
	{ 
		unlink($fileName);
	}
   file_put_contents($fileName, "var SourceAViewerData = ");
   file_put_contents($fileName, $script, FILE_APPEND);
   file_put_contents($fileName, ";", FILE_APPEND);
?>;