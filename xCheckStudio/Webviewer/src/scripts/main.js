// // temp code for testing
// localStorage.setItem("name", "Tom");

// // set header
// let userName = document.getElementById("userName");
// userName.innerHTML = localStorage.getItem("name");


// // CODE BELOW FOR WHEN USERS RECEIVE PERSONALIZED IMGS
// // let userImage = document.getElementById("userImg");
// // userImage.src = localStorage.getItem("userImage");

// let pageName = document.getElementById("pageName");
// pageName.innerHTML = document.title;
setUserName();
setCheckSpaceName();

function setUserName() {
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    document.getElementById("userName").innerHTML = userinfo.alias;
}

function setCheckSpaceName() {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    document.getElementById("checkSpaceName").innerHTML = projectinfo.projectname + " / " + checkinfo.checkname;
}