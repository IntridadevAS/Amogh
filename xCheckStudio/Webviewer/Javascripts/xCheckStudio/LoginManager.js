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
            else if(msg === "Locked"){
                alert('User is already logged in some other session.');
            }
            else {
                var object = JSON.parse(msg);
                localStorage.setItem('userinfo', JSON.stringify(object));
                window[callbackfunction](0);
            }
        }, 
        error: function() {
            window[callbackfunction](1);
        }
    });
}
