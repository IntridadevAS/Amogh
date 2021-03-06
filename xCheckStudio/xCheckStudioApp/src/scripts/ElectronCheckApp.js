function isElectron() {
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }
    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
    }
    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }
    document.getElementById("loginInfo").style.display = "none";
    document.getElementById("electroncheckDiv").style.display = "block"; 
    document.getElementById("electroncheck").innerHTML = "Hey user,</br>We don't support running app in browser.</br>Please use installed version.";     
    return false;
}

function onclosewindow() {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    window.close();
}

function onminimizewindow() {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    window.minimize();
}

function onmaximizewindow() {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();
    } else {
        window.unmaximize();
    }
}