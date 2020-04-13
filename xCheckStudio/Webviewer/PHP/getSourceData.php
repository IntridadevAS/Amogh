<?php
$FileCount = 0;
$ValidDataSources = ["xml", 
                     "xls", 
                     "rvm", 
                     "sldasm", 
                     "dwg", 
                     "dxf",
                     "dwf",
                     "dwfx",
                     "sldprt", 
                     "rvt", 
                     "rfa", 
                     "json", 
                     "ifc", 
                     "step", 
                     "stp", 
                     "ste", 
                     "igs",
                     "vsd",
                     "vsdx",
                     "jt",
                     "prt", "mf1", "arc", "unv", "pkg",
                     "model", "session", "dlv", "exp",
                     "catdrawing", "catpart", "catproduct", "catshape", "cgr",
                     "3dxml",
                     "obj",
                     "asm", "neu", "prt", "xas", "xpr",
                     "ipt", "iam",
                     "asm", "par", "pwd", "psm",
                     "3ds",
                     "u3d",
                     "sat", "sab"];

foreach($_FILES["files"]["tmp_name"] as $key=>$tmp_name)
{
    $FileCount++;
}

if($FileCount > 0)
{
    $xmlFiles = array();
    foreach($_FILES["files"]["name"] as $key=>$tmp_name)
    {
        $file = $tmp_name;
     
        $fileExtension = pathinfo($file, PATHINFO_EXTENSION);
        $fileExtension = strtolower($fileExtension);
        $isFound = in_array($fileExtension, $ValidDataSources);
        if($isFound)
        {
            if($fileExtension === "xml")
            {
                array_push($xmlFiles, $file);
            }
            else
            {
                echo json_encode(array($file));
                return;
            }
        }        
    }

    echo  json_encode($xmlFiles);
}
?>