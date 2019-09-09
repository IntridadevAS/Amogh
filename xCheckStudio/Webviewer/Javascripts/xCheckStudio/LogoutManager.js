function onLogoutUser() {

    return new Promise((resolve) => {
        var userinfo = JSON.parse(localStorage.getItem('userinfo'));
        $.ajax({
            data: {
                userid: userinfo.userid,
            },
            type: "POST",
            url: "PHP/logout.php",
            success: function (msg) {
                if (msg === "Success") {
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