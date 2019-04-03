var LogoutUser = function(){
    $.ajax({
        data: {
        },
        type: "POST",
        url: "PHP/logout.php"
    }).done(function (msg) {
        var int = 0;
        window.location = "/index.html";
    });
}