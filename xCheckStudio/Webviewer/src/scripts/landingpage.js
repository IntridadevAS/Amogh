let landingpagecontroller = {
    init: function () {
        this.permissions();
    },
    permissions: function () {
        var userinfo = JSON.parse(localStorage.getItem('userinfo'));
        if (userinfo.type !== "Admin") {
            if (userinfo.permission === 'check') {
                var element = document.getElementById("prepmodule");
                element.classList.add("disabled");
            }
            else if (userinfo.permission === 'review') {
                var element = document.getElementById("prepmodule");
                element.classList.add("disabled");
                element = document.getElementById("checkmodule");
                element.classList.add("disabled");
            }
        }

    }
}
landingpagecontroller.init();