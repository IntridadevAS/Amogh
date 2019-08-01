function setUserName() {
    var pierrediv = document.getElementById("pierre");
    pierrediv.innerHTML = localStorage.getItem("username");
}