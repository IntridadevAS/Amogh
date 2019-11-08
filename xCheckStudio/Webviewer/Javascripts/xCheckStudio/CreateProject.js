function setUserName() {
    var pierrediv = document.getElementById("pierre");
    pierrediv.innerHTML = localStorage.getItem("username");
}

function setProjectName() {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var powerplantdiv = document.getElementById("powerplant");
    powerplant.innerHTML = projectinfo.projectname;
}


function createProject(projectname, descriptionText, functionText, projectScope) {
    $.ajax({
        data: {
            'InvokeFunction': 'CreateProject',
            'projectName': projectname,
            'description': descriptionText,
            'function': functionText
        },
        type: "POST",
        url: "PHP/ProjectManager.php"
    }).done(function (msg) {

        if (msg === 'success') {

            var path = "Projects/" + projectname + "/" + projectname + ".db";

            // add this project's entry in main DB
            $.ajax({
                data: {
                    'InvokeFunction': 'AddProjectToMainDB',
                    'projectName': projectname,
                    'description': descriptionText,
                    'function': functionText,
                    'path': path,
                    "projectScope": projectScope
                },
                type: "POST",
                url: "PHP/ProjectManager.php"
            }).done(function (msg) {

                if (msg === 'success') {
                    //alert("Main.db record added.");
                    window.location.href = "checkModule.html";
                }
            });
        }
        else {
            alert(msg);
        }

    });
}

function createNewProject(projectname, projectDescription, projectType, projectStatus, projectComments, projectIsFavorite) {
    $.ajax({
        data: {
            'InvokeFunction': 'CreateProject',
            'projectName': projectname
            /*'description': projectDescription,
            'function': functionText*/
        },
        type: "POST",
        url: "PHP/ProjectManager.php"
    }).done(function (msg) {

        if (msg === 'success') {

            var path = "Projects/" + projectname + "/" + projectname + ".db";

            // add this project's entry in main DB
            $.ajax({
                data: {
                    'InvokeFunction': 'AddNewProjectToMainDB',
                    'userid': localStorage.getItem('userid'),
                    'projectname': projectname,
                    'projectDescription': projectDescription,
                    'projectType': projectType,
                    'path': path,
                    "projectStatus": projectStatus,
                    "projectComments": projectComments,
                    "projectIsFavorite": projectIsFavorite
                },
                type: "POST",
                url: "PHP/ProjectManager.php"
            }).done(function (msg) {
                var object = JSON.parse(msg);
                if (object.projectid !== -1) {
                    localStorage.setItem('projectinfo', JSON.stringify(msg));
                    //CreateNewCheckCase();
                }
            });
        }
        else {
            alert(msg);
        }

    });
}


function cancelCancelProjectCreation() {
    hideCancelProjectCreationForm();
}

function hideCancelProjectCreationForm()
{
    var overlay = document.getElementById("cancelProjectCreationOverlay");
    var popup = document.getElementById("cancelProjectCreationPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function cancelProjectCreation() {
    newProjectView.closeNewProject();
    hideCancelProjectCreationForm();
}


function cancelCancelCheckSpaceCreation() {
    hideCancelCheckSpaceCreationForm();
}

function hideCancelCheckSpaceCreationForm()
{
    var overlay = document.getElementById("cancelCheckSpaceCreationOverlay");
    var popup = document.getElementById("cancelCheckSpaceCreationPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function cancelCheckSpaceCreation() {
    newCheckView.closeNewCheck();
    hideCancelCheckSpaceCreationForm();
}

