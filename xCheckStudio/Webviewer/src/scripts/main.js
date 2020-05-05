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

function setCheckSpaceName(moduleName) {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    if(projectinfo !== null){
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        
        // var projectNameSpan = document.createElement("span");
        // projectNameSpan.innerText = projectinfo.projectname;
        // projectNameSpan.onclick = function () {
        //     // localStorage.removeItem("checkinfo");

        //     var fromInfo = {
        //         "proj": projectinfo,
        //         "fromModule": moduleName
        //     };
        //     localStorage.setItem("fromInfo", JSON.stringify(fromInfo));

        //     var overlay = document.getElementById("uiBlockingOverlay");
        //     var popup = document.getElementById("returnProjectCenterPopup");

        //     overlay.style.display = 'block';
        //     popup.style.display = 'block';

        //     popup.style.width = "581px";
        //     popup.style.height = "155px";
        //     popup.style.overflow = "hidden";

        //     popup.style.top = ((window.innerHeight / 2) - 139) + "px";
        //     popup.style.left = ((window.innerWidth / 2) - 290) + "px";
        // }
        // projectNameSpan.onmouseover = function () {
        //     this.style.color = "gray";
        // }
        // projectNameSpan.onmouseout = function () {
        //     this.style.color = "white";
        // }

        // var checkspaceNameSpan = document.createElement("span");
        // checkspaceNameSpan.innerText = " / " + checkinfo.checkname;
        
        // var span = document.createElement('span');
        // span.appendChild(projectNameSpan);
        // span.appendChild(checkspaceNameSpan);
        // document.getElementById("checkSpaceName").appendChild(span);
        document.getElementById("checkSpaceName").innerHTML = projectinfo.projectname + " / " + checkinfo.checkname;
        document.getElementById("checkSpaceName").onclick = function () {
            // localStorage.removeItem("checkinfo");

            var fromInfo = {
                "proj": projectinfo,
                "fromModule": moduleName
            };
            localStorage.setItem("fromInfo", JSON.stringify(fromInfo));

            var overlay = document.getElementById("uiBlockingOverlay");
            var popup = document.getElementById("returnProjectCenterPopup");

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

function setPageTitle(){
    let pageName = document.getElementById("pageName");
    pageName.innerHTML = document.title;
}