<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // collect value of input field
    $json = file_get_contents('UserInformation/loginInfo.json');
    $json_data = json_decode($json,true);

    $name= $_POST['name'];
    $password= $_POST['password'];

    // echo '<pre>' . print_r($json_data, true) . '</pre>';
    if($name != "" && $password != "")
    {
        foreach ($json_data['Users'] as $usersKey => $usersValue) {
            // Use $field and $value here
            $userIndex = 0;
            $usersCount = 0;
            foreach($usersValue as $userName => $userDetails)
            {
            //    print_r($field1."+".$value1."++");
                $usersCount = count($userDetails);
                $userIndex++;
               if($userName == $name)
               {
                    foreach($userDetails as $userDetailkey => $userDetailValue)
                    {
                        // print_r($userDetailkey."+".$userDetailValue."++");
                        if($userDetailkey == "Password" )
                        {
                            if($userDetailValue == $password)
                           {
                            echo "correct match";
                            break 3;
                           } 
                           else if($userDetailValue != $password)
                           {
                               echo "no match";
                               break 3;
                           }
                        }
                    
                    }
               }
               
            }
            if($userIndex == $usersCount)
            {
                echo "no user found";
            }
            
        }
    }
    else{
        echo "Enter Details";
    }
}
?>