function openProject() {

    getProjectsInfo().then(function (projects) {
        var loadProjectDiv = document.getElementById('loadProjectDiv');
        loadProjectDiv.innerHTML ="";
        // this is to keep trak of odd and even rows
        var i = 1;
        for (var key in projects) {
            var project = projects[key];
    
            if (!('projectname' in project) &&
                !('description' in project)) {
                continue;
            }
    
            // create div for project
            var projectDiv = document.createElement('div');
            projectDiv.style.width = "100%";
           
            if(i%2 === 0)
            {
                projectDiv.style.backgroundColor = '#98d0d2'
            }
            else 
            {
                projectDiv.style.backgroundColor = '#c6d298';
            }

            var projectNameDiv = document.createElement('div');
            projectNameDiv.innerText = project['projectname'];
            projectNameDiv.style.width = "100%";
            projectDiv.appendChild(projectNameDiv);
    
            var projectDescDiv = document.createElement('div');
            projectDescDiv.innerText = project['description'];
            projectDescDiv.style.width = "100%";          
            projectDiv.appendChild(projectDescDiv);
    
            var projectidDiv = document.createElement('div');
            projectidDiv.innerText = project['projectid'];
            projectidDiv .style.display = "none";                 
            projectDiv.appendChild(projectidDiv);

            projectDiv.onclick = function()
            {              
               var projectName = this.children[0].innerText;
               var projectId = this.children[2].innerText;
               loadProject(projectName, projectId);
            }
    
            loadProjectDiv.appendChild(projectDiv);

            i++;
        }
    
        showLoadProjectDiv();
    });
}

function loadProject(projectName, projectId) {
  
    $.ajax({
        data: {
            'InvokeFunction': 'CreateProjectSession',
            'projectName': projectName,
            'projectId': projectId,
            'loadProject' : 'TRUE',
            'sourceAPath' : "Projects/"+projectName+"/SourceA",
            'sourceBPath' : "Projects/"+projectName+"/SourceB"
        },
        type: "POST",
        url: "PHP/ProjectManager.php"
    }).done(function (msg) 
    {
        if(msg !=='fail')
        {
            window.location.href = "/checkModule.html";
        }
    });
}

function getProjectsInfo() {

    return new Promise((resolve) => {
        $.ajax({
            data: {
                'InvokeFunction': 'GetProjects',
                'userid': 2
            },
            type: "POST",
            url: "PHP/ProjectManager.php"
        }).done(function (msg) 
        {

            if (msg !== 'fail') {
                var projects = JSON.parse(msg);

                resolve(projects);
            }
            else 
            {
                resolve(undefined);
            }

        });
    });
}

function showLoadProjectDiv() {
    document.getElementById("loadProjectDiv").style.display = "block";
}

function closeLoadProjectDiv() {
    document.getElementById("loadProjectDiv").style.display = "none";
}