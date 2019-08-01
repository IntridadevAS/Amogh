
window.onload = function () {

    var submitButton = document.getElementById('submitButton');

    submitButton.onclick = function () {
        var host = document.getElementById("hostInput").value;
        var port = document.getElementById("portInput").value;

        var url = "http://" + host + ":" + port + "/Webviewer";

        try {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.onreadystatechange = function () {
                if (request.readyState === 4) {

                    if (this.status == 200) {
                        window.location = url;
                    }
                    else {
                        alert("'" + url + "' does not exist.");
                    }
                }
            };

            request.send();
        }
        catch (err) {

            document.getElementById("hostInput").value = "";
            document.getElementById("portInput").value = "";

            alert("'" + url + "' Invalid Host and Port");
        }
    };
}