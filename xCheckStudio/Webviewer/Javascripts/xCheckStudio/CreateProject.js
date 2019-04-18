function setUserName() {
    $.ajax({
        data: { 'variable': 'name' },
        type: "POST",
        url: "PHP/GetSessionVariable.php"
    }).done(function (msg) {
        if (msg !== 'fail') {
            var pierrediv  = document.getElementById("pierre");
			 if (msg != "" && pierrediv != null)
                 pierrediv.innerHTML = msg;	
        }
    });
}

function setProjectName() {
    $.ajax({
        data: { 'variable': 'projectname' },
        type: "POST",
        url: "PHP/GetSessionVariable.php"
    }).done(function (msg) {
        if (msg !== 'fail') {
            var powerplantdiv = document.getElementById("powerplant");
            if (msg != "" && powerplantdiv != null)
                powerplant.innerHTML = msg;
        }
    });
}


function createProject(projectname, descriptionText, functionText) {
    $.ajax({
        data: {
            'projectName': projectname,
            'description': descriptionText,
            'function': functionText
        },
        type: "POST",
        url: "PHP/CreateProject.php"
    }).done(function (msg) {

        if (msg === 'success') {
                                   
            var path =  "Projects/"+ projectname + "/"+ projectname +".db";
           
            // add this project's entry in main DB
            $.ajax({
                data: {
                    'projectName': projectname,
                    'path': path                                
                },
                type: "POST",
                url: "PHP/AddProjectToMainDB.php"
            }).done(function (msg) {                           

                if (msg === 'success') {
                    //alert("Main.db record added.");
                    window.location.href = "/checkModule.html";
                }                            
            });
        }                    
    });
}