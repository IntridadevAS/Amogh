function validateLogindetails(callbackfunction) {
    $.ajax({
        data: {
            name: $('#usernametext').val(),
            password: $('#passwordtext').val()
        },
        type: "POST",
        url: "PHP/login.php",
        success: function (msg) {
            if (msg === "Failed") {
                window[callbackfunction](1);
            }
            else if (msg === "Locked") {
                showUserLoggedInPrompt();
            }
            else {
                var object = JSON.parse(msg);
                localStorage.setItem('userinfo', JSON.stringify(object));
                window[callbackfunction](0);
            }
        },
        error: function () {
            window[callbackfunction](1);
        }
    });
}

function showUserLoggedInPrompt() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("userLoggedInPopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

function onUserLoggedInOk() {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("userLoggedInPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}