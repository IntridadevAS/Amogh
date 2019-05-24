var LogoutUser = function(){
    $.ajax({
        data: {
        },
        type: "POST",
        url: "PHP/logout.php"
    }).done(function (msg) {       
        window.location = "index.html";
    });
}