function setUserName() {
    var pierrediv = document.getElementById("pierre");
    pierrediv.innerHTML = (JSON.parse(localStorage.getItem('userinfo'))).username;
}