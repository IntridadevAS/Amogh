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

function setProfileImage(){
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    document.getElementById("userImg").src = userinfo.profileImage;      
  }

function setCheckSpaceName(moduleName, isVault = false) {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    if (projectinfo === null) {
        return;
    }

    if (isVault) {
        document.getElementById("checkSpaceName").innerHTML = projectinfo.projectname + " / Vault"; 

        // document.getElementById("returnToProjectMessage").innerText = "Ensure your dataset(s) have been saved before returning to the Project.";

        document.getElementById("checkSpaceName").onclick = function () {

            var fromInfo = {
                "proj": projectinfo,
                "fromModule": moduleName
            };
            localStorage.setItem("fromInfo", JSON.stringify(fromInfo));
    
            var overlay = document.getElementById("uiBlockingOverlay");
            var popup = document.getElementById("returnToProjectFromVaultPopup");
    
            overlay.style.display = 'block';
            popup.style.display = 'block';
    
            popup.style.width = "581px";
            popup.style.height = "155px";
            popup.style.overflow = "hidden";
    
            popup.style.top = ((window.innerHeight / 2) - 139) + "px";
            popup.style.left = ((window.innerWidth / 2) - 290) + "px";
        }
    }
    else {
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        document.getElementById("checkSpaceName").innerHTML = projectinfo.projectname + " / " + checkinfo.checkname;
       
        // document.getElementById("returnToProjectMessage").innerText = "Save before Returning to the Project?";

        document.getElementById("checkSpaceName").onclick = function () {

            var fromInfo = {
                "proj": projectinfo,
                "fromModule": moduleName
            };
            localStorage.setItem("fromInfo", JSON.stringify(fromInfo));
    
            var overlay = document.getElementById("uiBlockingOverlay");
            var popup = document.getElementById("returnToProjectPopup");
    
            overlay.style.display = 'block';
            popup.style.display = 'block';
    
            popup.style.width = "581px";
            popup.style.height = "155px";
            popup.style.overflow = "hidden";
    
            popup.style.top = ((window.innerHeight / 2) - 139) + "px";
            popup.style.left = ((window.innerWidth / 2) - 290) + "px";
        }
    }

  
}

function setPageTitle() {
    let pageName = document.getElementById("pageName");
    pageName.innerHTML = document.title;
}