<?php
   $json = file_get_contents('ComponentClassesData.js');

    $json_data = json_decode($json);
    echo(json_encode((array)$json_data));
 ?>