// // temp code for testing
// localStorage.setItem("name", "Tom");

// // set header
// let userName = document.getElementById("userName");
// userName.innerHTML = localStorage.getItem("name");


// // CODE BELOW FOR WHEN USERS RECEIVE PERSONALIZED IMGS
// // let userImage = document.getElementById("userImg");
// // userImage.src = localStorage.getItem("userImage");

function setUserName() {
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    document.getElementById("userName").innerHTML = userinfo.alias;
}

function setCheckSpaceName() {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    if(projectinfo !== null){
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        document.getElementById("checkSpaceName").innerHTML = projectinfo.projectname + " / " + checkinfo.checkname;
    }
}

function setPageTitle(){
    let pageName = document.getElementById("pageName");
    pageName.innerHTML = document.title;
}