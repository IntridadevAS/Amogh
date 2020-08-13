function onLogoutUser(alluser) {

    return new Promise((resolve) => {
        var userinfo = JSON.parse(localStorage.getItem('userinfo'));
        $.ajax({
            data: {
                userid: userinfo.userid,
                "AllUser": alluser,
            },
            type: "POST",
            url: "PHP/Logout.php",
            success: function (msg) {
                var object = JSON.parse(msg);
                if (object.Msg === "Success") {
                    if(object.AllUser === "No")
                        localStorage.clear();
                    return resolve(true);                  
                }
                return resolve(false);              
            },
            error: function () {
                console.log("Failed to logout");
                return resolve(false);         
            }
        });
    });
}