let landingpagecontroller = {
    init: function () {
        this.permissions();
    },
    permissions: function () {
        var userinfo = JSON.parse(localStorage.getItem('userinfo'));
        if (userinfo.type !== "Admin") {
            if (userinfo.permission.toLowerCase() === 'checker') {
                var element = document.getElementById("prepmodule");
                element.classList.add("disabled");
            }
            else if (userinfo.permission.toLowerCase() === 'reviewer') {
                var element = document.getElementById("prepmodule");
                element.classList.add("disabled");
                element = document.getElementById("checkmodule");
                element.classList.add("disabled");
            }
        }

    }
}
landingpagecontroller.init();