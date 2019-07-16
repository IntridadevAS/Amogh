
window.onload = function () {

    // set window size
    var w = screen.width * 75 / 100;
    var h = screen.height * 75 / 100;
    window.resizeTo(w, h);
    window.moveTo(screen.width * 12.5 / 100, screen.height * 12.5 / 100);

    // home drop down item click listners
    document.getElementById("configurationBtn").onclick = function () {        
        document.getElementById("contentSpace").innerHTML ="";
        //$('#contentSpace').load("configurationPage.html");
        // load analytics data
        //document.getElementById("contentSpace").innerHTML = '<object type="text/html" data="configurationPage.html" style="height: 100%; width: 100%" ></object>';
         window.open("configurationPage.html");
        toggleDropdown();
    }

    document.getElementById("dbSettingsBtn").onclick = function () {
        document.getElementById("contentSpace").innerHTML ="";
        toggleDropdown();
    }

    document.getElementById("summaryBtn").onclick = function () {
        document.getElementById("contentSpace").innerHTML ="";
        toggleDropdown();
    }

    document.getElementById("outputBtn").onclick = function () {
        document.getElementById("contentSpace").innerHTML ="";
        toggleDropdown();
    }

    document.getElementById("exitBtn").onclick = function () {
        window.close();
    }
}

function toggleDropdown() {
    document.getElementById("homeDropdown").classList.toggle("show");
}

