// temp code for testing
localStorage.setItem("name", "Tom");

// set header
let userName = document.getElementById("userName");
userName.innerHTML = localStorage.getItem("name");


// CODE BELOW FOR WHEN USERS RECEIVE PERSONALIZED IMGS
// let userImage = document.getElementById("userImg");
// userImage.src = localStorage.getItem("userImage");

let pageName = document.getElementById("pageName");
pageName.innerHTML = document.title;
