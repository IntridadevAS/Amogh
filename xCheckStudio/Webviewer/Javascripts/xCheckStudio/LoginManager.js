function validateLogindetails(callbackfunction){
    $.ajax({
        data: {
            name: $('#usernametext').val(),
            password: $('#passwordtext').val()
        },
        type: "POST",
        url: "PHP/login.php",
        success: function(msg) {
            if (msg === "Failed") {
                window[callbackfunction](1);
            }
            else {
                var object = JSON.parse(msg);
                localStorage.setItem("userid", object.userid);
                localStorage.setItem("username", object.username);
                localStorage.setItem("alias", object.alias);
                localStorage.setItem("type", object.type);
                localStorage.setItem("permission", object.permission);
                window[callbackfunction](0);
            }
        }, 
        error: function() {
            window[callbackfunction](1);
        }
    });
}
