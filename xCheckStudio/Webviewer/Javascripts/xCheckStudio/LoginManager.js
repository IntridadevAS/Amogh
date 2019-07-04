function validateLogindetails(callbackfunction){
    $.ajax({
        data: {
            name: $('#usernametext').val(),
            password: $('#passwordtext').val()
        },
        type: "POST",
        url: "PHP/login.php",
        success: function(msg) {
            if (msg == "correct match") {
                window[callbackfunction](0);
            }
            else {
                window[callbackfunction](1);
            }
        }, 
        error: function() {
            window[callbackfunction](1);
        }
    });
}
