var validateLogindetails = function () {
    $.ajax({
        data: {
            name: $('#usernametext').val(),
            password: $('#passwordtext').val()
        },
        type: "POST",
        url: "PHP/login.php"
    }).done(function (msg) {
        if (msg == "correct match") {
            window.location.href = "/home.html";
        }
        else {
            alert("Incorrect Username/Password.");
        }
    });

}
