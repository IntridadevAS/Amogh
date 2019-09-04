
window.onload = function () {

    var submitButton = document.getElementById('submitButton');

    submitButton.onclick = function () {
        event.preventDefault();
        var host = document.getElementById("hostInput").value;
        var port = document.getElementById("portInput").value;
        var url = "http://" + host + ":" + port ;

        try {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.onreadystatechange = function () {
                if (request.readyState === 4) {

                    if (this.status == 200) {
                        window.location = url;
                    }
                    else {
                        //alert("'" + url + "' does not exist.");
                        document.getElementById("errorMsgContainer").style.display = "block";
                    }
                }
                else {
                    //alert("'" + url + "' does not exist.");
                    document.getElementById("errorMsgContainer").style.display = "block";
                }
            };

            request.send();
        }
        catch (err) {

            document.getElementById("hostInput").value = "";
            document.getElementById("portInput").value = "";
            document.getElementById("errorMsgContainer").style.display = "block";
        }
    };
}