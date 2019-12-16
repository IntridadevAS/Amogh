
window.onload = function () {

    // set window size
    var w = screen.width * 75 / 100;
    var h = screen.height * 75 / 100;
    window.resizeTo(w, h);
    window.moveTo(screen.width * 12.5 / 100, screen.height * 12.5 / 100);

    var userRolesTab = document.getElementById("userRolesTab");
    userRolesTab.onclick = function () {
        onUserRolesTabClicked();
    }
}

function onUserRolesTabClicked() {
    openTabContentPage(this, "userRolesContent");

    populateUserInfo();

    var addUserButton = document.getElementById("addUserButton");
    addUserButton.onclick = function () {
        onNewUserButtonClicked();
    }
}

function onNewUserButtonClicked() {
    showNewUserOverlay();
}

var showNewUserOverlay = function () {
    document.getElementById("uiBlockingOverlay").style.display = "block";
    document.getElementById("newUserPopup").style.display = "block";

    document.getElementById("addNewUserButton").onclick = function () {
        addNewUser();
    }

    document.getElementById("cancelAddNewUser").onclick = function () {
        closeNewUserOverlay();
    }
}

var closeNewUserOverlay = function () {
    // reset fields
    document.getElementById("userNameInput").value = "";
    document.getElementById("passwordInput").value = "";
    document.getElementById("aliasInput").value = "";
    document.getElementById("newUserTypeSelect").value = "User";
    document.getElementById("newUserPermissionSelect").value = "Reviewer";
    document.getElementById("newUserEnableCheck").checked = true;

    document.getElementById("uiBlockingOverlay").style.display = "none";
    document.getElementById("newUserPopup").style.display = "none";
}

function addNewUser() {
    var userNameInput = document.getElementById("userNameInput");
    var passwordInput = document.getElementById("passwordInput");
    var aliasInput = document.getElementById("aliasInput");
    var newUserTypeSelect = document.getElementById("newUserTypeSelect");
    var newUserPermissionSelect = document.getElementById("newUserPermissionSelect");
    var newUserEnableCheck = document.getElementById("newUserEnableCheck");

    var userName = userNameInput.value;
    var password = passwordInput.value;
    var alias = aliasInput.value;
    var type = newUserTypeSelect.value;
    var permission = newUserPermissionSelect.value;
    var enable = newUserEnableCheck.checked ? "true" : "false";

    if (userName === "") {
        alert("User name can't be empty./nPlease enter valid user name.");
        return;
    }
    if (password === "") {
        alert("Password can't be empty./nPlease enter valid password.");
        return;
    }
    if (alias === "") {
        alert("Alias can't be empty./nPlease enter valid alias.");
        return;
    }

    var userDetails = {
        'enable': enable,
        'type': type,
        'userName': userName,
        'password': password,
        'alias': alias,
        'permission': permission
    };

    addUser(userDetails).then(function (result) {
        if (result) {
            alert("New user added.");        
            closeNewUserOverlay();

            // refresh user details table
            onUserRolesTabClicked();
        }
        else {
            alert("Error while adding new user.");
        }
    });
}

function addUser(userDetails) {    // var usersInfo;

    return new Promise((resolve) => {

        $.ajax({
            url: 'PHP/UserManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "AddNewUser",
                'enable': userDetails["enable"],
                'type': userDetails["type"],
                'userName': userDetails["userName"],
                'password': userDetails["password"],
                'alias': userDetails["alias"],
                'permission': userDetails["permission"]
            },
            success: function (msg) {
                if (msg === 'success') {
                    return resolve(true);
                }

                return resolve(false);
            }
        });
    });
}

function populateUserInfo() {
    getUserInfo().then(function (allUsersDetails) {
        if (allUsersDetails === undefined) {
            return;
        }

        var headers = [];
        var tableData = [];

        //create header for table
        var columnHeader = {};
        columnHeader["title"] = "Enable";
        columnHeader["name"] = "enable";
        columnHeader["type"] = "text";
        columnHeader["width"] = "8%";
        headers.push(columnHeader);

        columnHeader = {};
        columnHeader["title"] = "Type";
        columnHeader["name"] = "type";
        columnHeader["type"] = "text";
        columnHeader["width"] = "8%";
        headers.push(columnHeader);

        columnHeader = {};
        columnHeader["title"] = "User Name";
        columnHeader["name"] = "userName";
        columnHeader["type"] = "text";
        columnHeader["width"] = "25%";
        headers.push(columnHeader);

        columnHeader = {};
        columnHeader["title"] = "Password";
        columnHeader["name"] = "password";
        columnHeader["type"] = "text";
        columnHeader["width"] = "25%";
        headers.push(columnHeader);

        columnHeader = {};
        columnHeader["title"] = "Alias";
        columnHeader["name"] = "alias";
        columnHeader["type"] = "text";
        columnHeader["width"] = "8%";
        headers.push(columnHeader);

        columnHeader = {};
        columnHeader["title"] = "Permission";
        columnHeader["name"] = "permission";
        columnHeader["type"] = "text";
        columnHeader["width"] = "10%";
        headers.push(columnHeader);

        columnHeader = {};
        columnHeader["title"] = "";
        columnHeader["name"] = "update";
        columnHeader["type"] = "text";
        columnHeader["width"] = "8%";
        headers.push(columnHeader);

        columnHeader = {};
        columnHeader["title"] = "";
        columnHeader["name"] = "delete";
        columnHeader["type"] = "text";
        columnHeader["width"] = "8%";
        headers.push(columnHeader);

        // table contents
        for (var i = 0; i < allUsersDetails.length; i++) {
            var userDetails = allUsersDetails[i];

            tableRowContent = {};

            // enable field
            var checkBox = document.createElement("INPUT");
            checkBox.setAttribute("type", "checkbox");
            var checked = false;
            if (userDetails["enable"].toLowerCase() === "true") {
                checked = true;
            }
            checkBox.checked = checked;
            checkBox.onchange = function () {
                var userRow = this.parentElement.parentElement;
                enableUpdateButton(userRow);
            }

            tableRowContent[headers[0].name] = checkBox;

            // type field
            var typeSelect = document.createElement("select");
            var option = document.createElement("option");
            option.innerText = "Admin";
            typeSelect.appendChild(option);
            option = document.createElement("option");
            option.innerText = "User";
            typeSelect.appendChild(option);

            // set value
            var type = userDetails["type"];
            if (type.toLowerCase() === "admin") {
                typeSelect.value = "Admin";
            }
            else //if(type.toLowerCase ==="User")
            {
                typeSelect.value = "User";
            }
            typeSelect.onchange = function () {
                var userRow = this.parentElement.parentElement;
                enableUpdateButton(userRow);
            }

            tableRowContent[headers[1].name] = typeSelect;

            // username field
            var userNameInput = document.createElement("INPUT");
            userNameInput.setAttribute("type", "text");
            userNameInput.value = userDetails["username"];
            userNameInput.classList.add("inputTextCell");
            userNameInput.disabled = true;
            tableRowContent[headers[2].name] = userNameInput;

            // password field
            var passwordInput = document.createElement("INPUT");
            passwordInput.setAttribute("type", "text");
            passwordInput.value = userDetails["password"];
            passwordInput.classList.add("inputTextCell");
            passwordInput.onchange = function () {
                var userRow = this.parentElement.parentElement;
                enableUpdateButton(userRow);
            }
            tableRowContent[headers[3].name] = passwordInput;

            // alias field
            var aliasInput = document.createElement("INPUT");
            aliasInput.setAttribute("type", "text");
            aliasInput.value = userDetails["alias"];
            aliasInput.classList.add("inputTextCell");
            aliasInput.onchange = function () {
                var userRow = this.parentElement.parentElement;
                enableUpdateButton(userRow);
            }
            tableRowContent[headers[4].name] = aliasInput;

            // permission field
            var permissionSelect = document.createElement("select");
            var option = document.createElement("option");
            option.innerText = "Admin";
            permissionSelect.appendChild(option);
            option = document.createElement("option");
            option.innerText = "Checker";
            permissionSelect.appendChild(option);
            option = document.createElement("option");
            option.innerText = "Reviewer";
            permissionSelect.appendChild(option);

            // set value
            var permission = userDetails["permission"];
            if (permission.toLowerCase() === "admin") {
                permissionSelect.value = "Admin";
            }
            else if (permission.toLowerCase() === "checker") {
                permissionSelect.value = "Checker";
            }
            else //if(type.toLowerCase ==="reviewer")
            {
                permissionSelect.value = "Reviewer";
            }
            permissionSelect.onchange = function () {
                var userRow = this.parentElement.parentElement;
                enableUpdateButton(userRow);
            }
            tableRowContent[headers[5].name] = permissionSelect;

            // update field
            var updateBtn = document.createElement("button");
            updateBtn.innerText = "Update";
            updateBtn.onclick = function () {

                onUpdateUserDetails(this).then(function (result) {
                    if (result) {
                        this.disabled = true;
                    }
                });
            }
            updateBtn.disabled = true;
            tableRowContent[headers[6].name] = updateBtn;


            // delete field
            var deleteBtn = document.createElement("button");
            deleteBtn.innerText = "Delete";
            deleteBtn.onclick = function () {
                onDeleteUserDetails(this);
            }
            tableRowContent[headers[7].name] = deleteBtn;

            tableData.push(tableRowContent);
        }

        $("#usersInfoDiv").jsGrid({
            width: "90%",
            height: "90%",
            filtering: false,
            sorting: false,
            autoload: false,
            data: tableData,
            fields: headers,
            margin: "5px",
            editing: true,
            // checked: true,
            onRefreshed: function (config) {

            },
            onDataLoaded: function (args) {

            },
            rowClick: function (args) {

            },
            onError: function (args) {

            }

        });
    });
}

function enableUpdateButton(userRow) {
    userRow.children[6].children[0].disabled = false;
}

function onUpdateUserDetails(inputItem) {
    return new Promise((resolve) => {
        var userDetailsRow = inputItem.parentElement.parentElement;
        var userName = userDetailsRow.children[2].innerText;

        // enable value
        var enableCell = inputItem.parentElement.parentElement.children[0]
        var enableValue = enableCell.children[0].checked;
        var enable = "false";
        if (enableValue) {
            enable = "true";
        }

        // type value
        var typeCell = inputItem.parentElement.parentElement.children[1]
        var type = typeCell.children[0].value;

        // username value
        var userNameCell = inputItem.parentElement.parentElement.children[2]
        var userName = userNameCell.children[0].value;

        // password value
        var passwordCell = inputItem.parentElement.parentElement.children[3]
        var password = passwordCell.children[0].value;

        // alias value
        var aliasCell = inputItem.parentElement.parentElement.children[4]
        var alias = aliasCell.children[0].value;

        // permission value
        var permissionCell = inputItem.parentElement.parentElement.children[5]
        var permission = permissionCell.children[0].value;


        var userDetails = {
            'enable': enable,
            'type': type,
            'userName': userName,
            'password': password,
            'alias': alias,
            'permission': permission
        };

        updateUserInfo(userDetails).then(function (result) {
            if (result) {
                alert("User updated.");

                // refresh user details table
                onUserRolesTabClicked();
                return resolve(true);
            }
            else {
                alert("Error while updating user.");
                return resolve(false);
            }
        });
    });
}

function updateUserInfo(userDetails) {    // var usersInfo;

    return new Promise((resolve) => {

        $.ajax({
            url: 'PHP/UserManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "UpdateUserInfo",
                'enable': userDetails["enable"],
                'type': userDetails["type"],
                'userName': userDetails["userName"],
                'password': userDetails["password"],
                'alias': userDetails["alias"],
                'permission': userDetails["permission"]
            },
            success: function (msg) {
                if (msg === 'success') {
                    return resolve(true);
                }

                return resolve(false);
            }
        });
    });
}

function onDeleteUserDetails(inputItem) {
    var userDetailsRow = inputItem.parentElement.parentElement;
    var userName = userDetailsRow.children[2].children[0].value;

    deleteUser(userName).then(function (result) {
        if (result) {
            alert("User deleted.");

            // refresh user details table
            onUserRolesTabClicked();
        }
        else {
            alert("Error while deleting user.");
        }
    });
}

function deleteUser(userName) {
    return new Promise((resolve) => {

        $.ajax({
            url: 'PHP/UserManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "DeleteUser",
                'userName': userName
            },
            success: function (msg) {
                if (msg === 'success') {
                    return resolve(true);
                }

                return resolve(false);
            }
        });
    });
}

function getUserInfo() {    // var usersInfo;

    return new Promise((resolve) => {

        $.ajax({
            url: 'PHP/UserManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "GetAllUsersInfo"
            },
            success: function (msg) {
                if (msg != 'fail') {
                    var usersInfo = JSON.parse(msg);
                    return resolve(usersInfo);
                }

                return resolve(undefined);
            }
        });
    });

    // return usersInfo;
}

function openTabContentPage(inputElement, contentPage) {

    var tabContentPages = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabContentPages.length; i++) {
        tabContentPages[i].style.display = "none";
    }
    var tabButtons = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    document.getElementById(contentPage).style.display = "block";
    inputElement.className += " active";
}