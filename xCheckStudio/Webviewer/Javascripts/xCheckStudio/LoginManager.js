var validateLogindetails = function () {
    $.ajax({
        data: {
            name: $('#usernametext').val(),
            password: $('#passwordtext').val()
        },
        type: "POST",
        url: "index/login.php"
    }).done(function (msg) {
        if (msg == "correct match") {
            window.location.href = "/home.html";
        }
        else if (msg == "no match") {
            alert("Incorrect Password.\nPlease enter valid credentials.");
        }
        else if (msg == "no user found") {
            alert("Please enter valid credentials.");
        }
        else if (msg == "Enter Details") {
            alert("Please enter details.");

        }
    });

}
