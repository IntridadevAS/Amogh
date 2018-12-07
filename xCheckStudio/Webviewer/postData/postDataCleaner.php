 <?php 
// foreach (glob('*.js') as $filename) {
//     unlink($fileName);

// }

$files = glob('*.js'); // get all file names
foreach($files as $file){ // iterate files
  if(is_file($file))
    unlink($file); // delete file
}
?>;

