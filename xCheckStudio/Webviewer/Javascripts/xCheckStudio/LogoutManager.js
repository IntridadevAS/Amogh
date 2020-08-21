function onLogoutUser(alluser) {

    return new Promise((resolve) => {      
        let userinfo = xCheckStudio.Util.tryJsonParse(localStorage.getItem('userinfo'));
        if (userinfo === null) {
            return;
        }
        
        $.ajax({
            data: {
                userid: userinfo.userid,
                "AllUser": alluser,
            },
            type: "POST",
            url: "PHP/Logout.php",
            success: function (msg) {               
                let object = xCheckStudio.Util.tryJsonParse(msg);

                if (object !== null &&
                    object.Msg === "Success") {
                    if (object.AllUser === "No")
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