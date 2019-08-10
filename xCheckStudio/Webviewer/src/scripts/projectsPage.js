let model = {
  init: function () { },
  currentProject: null,
  myProjects: [],
  publicProjects: [],
  sortBy: "alpha",
  sortChecksBy: "alpha",
  currentCheck: null,
  currentReview: null,
  projectReviews: [],
  projectChecks: [],
  currentModule: "check",
}

let controller = {
  init: function () {
    this.fetchProjects();
    projectView.init();
    this.permissions();
  },

  permissions: function () {
    return true;//revert this later.
    if (userInformation.permissions == ("check" || "prep")) {
      return true;
    } else {
      return false;
    }
  },

  currentModule: function () {
    return model.currentModule;
  },

  setModule: function () {
    let projID = this.getCurrentProj();
    if (this.permissions()) {
      if (model.currentModule == "check") {
        model.currentModule = "review";
      } else if (model.currentModule == "review") {
        model.currentModule = "check";
      }
      this.fetchProjectInfo(projID.projectID);
    }
  },

  setSortBy: function (sortByValue) {
    model.sortBy = sortByValue;
    this.fetchProjects();
  },

  setSortChecksBy: function (sortByValue) {
    model.sortChecksBy = sortByValue;
    this.fetchProjectChecks();
  },

  getCurrentProj: function () {
    return model.currentProject;
  },

  setMyCurrentProj: function (projID) {
    let obj = model.myProjects.find(obj => obj.projectid == projID);
    model.currentProject = obj;

  },

  setPublicCurrentProj: function (projID) {
    let obj = model.publicProjects.find(obj => obj.projectid == projID);
    model.currentProject = obj;
  },

  editCheck: function (checkID) {
    event.stopPropagation();
    this.setCurrentCheck(checkID);
    editCheckView.init();
  },

  editReview: function (reviewID) {
    event.stopPropagation();
    this.setCurrentReview(reviewID);
    editReviewView.init();
  },

  setCurrentCheck: function (checkID) {
    for (check of model.projectChecks) {
      if (check.checkid == checkID) {
        model.currentCheck = check;
      }
    }
  },

  getCurrentCheck: function () {
    return model.currentCheck;
  },

  setCurrentReview: function (reviewID) {
    for (review of model.projectReviews) {
      if (review.checkid == reviewID) {
        model.currentReview = review;
      }
    }
  },

  getCurrentReview: function () {
    return model.currentReview;
  },

  createNewProject: function (projectname, projectDescription, projectType, projectStatus, projectComments, projectIsFavorite) {
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
            "projectIsFavorite": projectIsFavorite,
            "projectCreatedDate": xCheckStudio.Util.getCurrentDateTime()
          },
          type: "POST",
          url: "PHP/ProjectManager.php"
        }).done(function (msg) {
          var object = JSON.parse(msg);
          if (object.projectid !== -1) {
            localStorage.setItem('projectinfo', JSON.stringify(msg));
            newProjectView.closeNewProject();
            controller.fetchProjects();
          }
        });
      }
      else {
        alert(msg);
      }

    });
  },
  // ASSUMPTIONS FOR FETCH :
  //Authorization for authorization key for particular user
  // TODO: Prototech - where is this stored? Provided by server? In electronJS? How to access?
  // Sort header for how projects to be sorted in server provided JSON file.
  fetchProjects: function () {
    model.myProjects = [];
    model.publicProjects = [];
    $.ajax({
      data: {
        'InvokeFunction': 'GetProjects',
        'userid': localStorage.getItem('userid'),
      },
      type: "POST",
      url: "PHP/ProjectManager.php"
    }).done(function (msg) {
      var object = JSON.parse(msg);
      var array = [];
      for (var i in object) {
        var obj = object[i];
        if (obj.type === 'Private')
          model.myProjects.push(object[i]);
        else
          model.publicProjects.push(object[i]);
      }
      projectView.renderProjects();
    });
    /*fetch('../tests/allProjects.json', {
      method: 'GET',
      headers: {
        'Sort': model.sortBy
      }
    })
      .then(response => response.json())
      .then(data => [model.publicProjects, model.myProjects] = [data.publicProjects, data.myProjects])
      .then(function(){
        projectView.renderProjects();
      })*/
  },

  getMyProjects: function () {
    return model.myProjects;
  },

  getPublicProjects: function () {
    return model.publicProjects;
  },

  fetchProjectInfo: function (projID) {
    if (model.currentModule == "check") {
      this.fetchProjectChecks(projID);
    } else if (model.currentModule == "review") {
      this.fetchProjectReviews(projID);
    }
  },

  // TODO: Prototech, insert fetch URL to match server
  fetchProjectChecks: function (projID) {
    var currentProj = this.getCurrentProj();
    this.clearChecksReviews();
    $.ajax({
      data: {
        'InvokeFunction': 'GetCheckSpaces',
        'userid': localStorage.getItem('userid'),
        'ProjectId': currentProj.projectid,
        'ProjectName': currentProj.projectname,
      },
      type: "POST",
      url: "PHP/CheckSpaceManager.php"
    }).done(function (msg) {
      var objectArray = JSON.parse(msg);
      model.projectChecks = [...objectArray];
      checkView.init()
    });
  },

  getChecks: function () {
    return model.projectChecks;
  },

  getReviews: function () {
    return model.projectReviews;
  },

  clearChecksReviews: function () {
    model.projectChecks = [];
    model.projectReviews = [];
  },

  // TODO: Prototech, insert fetch URL to match server
  fetchProjectReviews: function (projID) {

    var currentProj = this.getCurrentProj();
    this.clearChecksReviews();
    $.ajax({
      data: {
        'InvokeFunction': 'GetCheckSpaces',
        'userid': localStorage.getItem('userid'),
        'ProjectId': currentProj.projectid,
        'ProjectName': currentProj.projectname,
      },
      type: "POST",
      url: "PHP/CheckSpaceManager.php"
    }).done(function (msg) {
      var objectArray = JSON.parse(msg);
      model.projectReviews = [...objectArray];
      checkView.init()
    });
  },

  getReviews: function () {
    return model.projectReviews;
  },

  // TODO: Prototech, insert fetch URL to match server
  setFavoriteProject: function (projID) {
    fetch(`exampleServer/project/${projID}`, {
      method: "POST"
    })
      .then(this.fetchProjects);
  },

  // TODO: Prototech, insert fetch URL to match server
  setFavoriteCheck: function (checkID) {
    fetch(`exampleServer/check/${checkID}`, {
      method: "POST"
    })
      .then(this.fetchProjectChecks);
  },

  // TODO: Prototech, insert fetch URL to match server
  setFavoriteReview: function (reviewID) {
    fetch(`exampleServer/check/${reviewID}`, {
      method: "POST"
    })
      .then(this.fetchProjectReviews);
  },

  // TODO: Prototech, insert fetch URL to match server
  deleteProject: function (projID) {
    var currentProj = controller.getCurrentProj();
    $.ajax({
      data: {
        'InvokeFunction': 'DeleteProject',
        'projectname': currentProj.projectname,
        'projectid': currentProj.projectid,
      },
      type: "POST",
      url: "PHP/ProjectManager.php"
    }).done(function (msg) {
      if (msg !== 0) {
        deleteItems.closeDeleteItems();
        controller.fetchProjects();
      }
    });
  },

  // TODO: Prototech, insert fetch URL to match server
  deleteCheck: function (checkID) {
    event.stopPropagation();
    var currentProj = controller.getCurrentProj();
    var currentCheck = controller.getCurrentCheck();
    $.ajax({
      data: {
        'InvokeFunction': 'DeleteCheckSpace',
        'ProjectName': currentProj.projectname,
        'CheckName': currentCheck.checkname,
        'CheckId': currentCheck.checkid,
      },
      type: "POST",
      url: "PHP/CheckSpaceManager.php"
    }).done(function (msg) {
      if (msg !== 0) {
        deleteItems.closeDeleteItems();
        controller.fetchProjectChecks();
      }
    });
  },

  deleteReview: function (reviewID) {
    fetch(`exampleServer/deleteReview/${reviewID}`, {
      method: "POST"
    })
      .then(deleteItems.closeDeleteItems())
      .then(this.fetchProjectReviews());
  },

  editProject(id, type) {
    console.log(id);
    console.log(type);
    if (type == "Public") {
      controller.setPublicCurrentProj(id);
    } else {
      console.log(2);
      controller.setMyCurrentProj(id);
    };
    editProjectView.init();
  }
}

let projectView = {
  init: function () {
    this.projects = document.getElementById("projects");
    this.publicProjectsCont = document.getElementById("pubProjectsContainer");
    this.checks = document.getElementById("checks");
    let myProjDropDown = document.getElementById("dropDownMyProj");
    let publicProjDropDown = document.getElementById("dropDownPublicProj");
    let publicProjectsCont = this.publicProjectsCont;


    // Event Listeners

    myProjDropDown.addEventListener("click", function () {
      projects.classList.toggle("hideProjects");
      this.classList.toggle("rotateArrows");
    });

    publicProjDropDown.addEventListener("click", function () {
      publicProjectsCont.classList.toggle("hideProjects");
      this.classList.toggle("rotateArrows");
    });

    projects.addEventListener("click", function (event) {
      let selected = event.target.closest('.card');
      if (selected.classList.contains('newProjectCard')) {
        newProjectView.init();
      } else if (event.target.closest('.projectButtons')) {
      } else {
        controller.setMyCurrentProj(selected.id);
        controller.fetchProjectInfo(selected.id);
      }
    });

    publicProjectsCont.addEventListener("click", function (event) {
      let selected = event.target.closest('.card');
      if (selected.classList.contains('newProjectCard')) {
        newProjectView.init();
      } else if (event.target.closest('.projectButtons')) {
      } else {
        controller.setPublicCurrentProj(selected.id);
        controller.fetchProjectInfo(selected.id);
      }
    });
    // End Event Listeners
  },

  // all rendering functions
  renderProjects: function () {
    this.clearProjects();
    this.renderMyProjects();
    this.renderPublicProjects();
  },

  hoverProject: function (subject) {
    subject.classList.add("hovered");
  },

  leaveProject: function (subject) {
    subject.classList.remove("hovered");
  },

  clearProjects: function () {
    let newProjectCard = "";
    if (controller.permissions()) {
      newProjectCard += `
        <div class="card newProjectCard">\
            <div class="plusBtn"></div>
        </div>`
    }

    this.projects.innerHTML = newProjectCard;
    this.publicProjectsCont.innerHTML = newProjectCard;
  },

  infoDeleteButtons: function () {
    if (controller.permissions()) {

    }
  },

  createCard: function (project) {
    let newDiv = document.createElement('DIV');
    newDiv.classList.add('card');
    newDiv.setAttribute("onmouseenter", "projectView.hoverProject(this);");
    newDiv.setAttribute("onmouseleave", "projectView.leaveProject(this);");
    if (project.favorite) {
      newDiv.classList.add('favorite');
    }
    newDiv.setAttribute("id", project.projectid);
    let htmlInner = `<div class="projectButtons">\
      <div class="star" onclick="controller.setFavoriteProject(${project.projectid})"></div>`
    if (controller.permissions()) {
      htmlInner +=
        `<div class="btnSymbol hiddenBtn" onclick="console.log('works');">\
          <img class="btnSymbol" src="../public/symbols/infoMenu.svg"\
          onclick="controller.editProject(${project.projectid}, '${project.type}');">\
        </div>\
        <div class="btnSymbol hiddenBtn" onclick="deleteItems.init('project', ${project.projectid});">\
          <img src="../public/symbols/TrashDelete.svg">\
        </div>`
    }
    htmlInner += `</div>`;
    htmlInner += `<div class="projectName">`;
    htmlInner += `<h2>${project.projectname}</h2>`;
    htmlInner += `<p class="status">${project.status}</p></div>`;
    newDiv.innerHTML = htmlInner;
    return newDiv
  },

  renderMyProjects: function () {
    let myProjects = Object.values(controller.getMyProjects());
    for (project of myProjects) {
      let newCard = this.createCard(project);

      this.projects.appendChild(newCard);
    }
  },

  renderPublicProjects: function () {
    let publicProjects = Object.values(controller.getPublicProjects());
    for (project of publicProjects) {
      let newCard = this.createCard(project);
      this.publicProjectsCont.appendChild(newCard);
    }
  },
}

let checkView = {

  init: function () {
    this.checkCardContainer = document.getElementById("checkCardContainer");
    this.checkSpaceProjectName = document.getElementById("checkSpaceProjectName");
    this.checkSpaceProjectDescription = document.getElementById("projectDescription");
    this.checkSpaceOpen = document.getElementById("checkSpaceOverlay");
    this.cProject = controller.getCurrentProj();
    this.checkTitle = document.getElementById("checkSpaceTitle");
    this.checkDescription = document.getElementById("checkDescription");
    this.checkSpaceOpen.classList.add("open"); // opens checkspace overlay
    this.editProject = document.getElementById("editProjectFromCheck");

    this.toggle = document.getElementById("checkReviewToggle");
    // this.toggle.addEventListener("click", function(){
    //   controller.setModule(checkView.cProject.projectID);
    // })
    this.setToggleBtn();

    this.renderProject();
    if (controller.currentModule() == "check") {
      this.selectedChecks = controller.getChecks();
      this.renderChecks();
    } else if (controller.currentModule() == "review") {
      this.selectedReviews = controller.getReviews();
      this.renderReviews();
    }

    document.getElementById("refreshChecks").onclick = function () {
      controller.fetchProjectInfo(checkView.cProject.projectID)
    };

    //starts Edit Project View overlay - accessed by onclick from button
    this.editProject.addEventListener("click", function () {
      editProjectView.init();
    });

    //REMOVED FOR BETA-1. POTENTIAL RETURN BETA-2. ALLOWS SELECTING OF A CHECK TO SEE MORE INFORMATION
    // this.checkCardContainer.addEventListener("click", function(event){
    //   let selectedCard = event.target.closest(".checkSpaceCard");
    //   if (selectedCard.id !== controller.getCurrentCheck()){
    //     controller.setCurrentCheck(selectedCard.id);
    //     checkView.renderCurrentCheck();
    //   }
    // })

    // this.renderChecks();
  },

  renderProject: function () {
    this.checkSpaceProjectName.innerHTML = `${this.cProject.projectname} - ${this.cProject.status}`;
    this.checkSpaceProjectDescription.innerHTML = `${this.cProject.description}`;
  },

  setToggleBtn: function () {
    if (!controller.permissions()) {
      this.toggle.remove();
    } else if (controller.permissions()) {
      if (controller.currentModule() == "review") {
        this.toggle.innerHTML = "<h2>ENTER CHECKS</h2>";
        this.toggle.classList.add("chkRevBorderBlue");
        this.toggle.classList.remove("chkRevBorderRed");
      } else if (controller.currentModule() == "check") {
        this.toggle.innerHTML = "<h2>ENTER REVIEWS</h2>";
        this.toggle.classList.add("chkRevBorderRed");
        this.toggle.classList.remove("chkRevBorderBlue");
      }
    }
  },

  hoverCheck: function (subject) {
    subject.classList.add("hovered");
  },

  checkClicked: function (subject) {
    var proj = model.currentProject;
    localStorage.setItem('projectinfo', JSON.stringify(proj));
    controller.setCurrentCheck(subject.id);
    var check = model.currentCheck;
    localStorage.setItem('checkinfo', JSON.stringify(check));
    window.location.href = "checkModule.html";
  },

  leaveCheck: function (subject) {
    subject.classList.remove("hovered");
  },

  renderChecks: function () {
    if (controller.permissions()) {
      let newCheckCard = `
        <div class="checkSpaceCard" onclick="newCheckView.init()">\
          <div class="checkCardInfo checkCardInfoNew"><div class="plusBtn"></div></div>\
          <div class="checkCardTitle checkCardTitleNew"><h2>New Check</h2></div>\
        </div>`;
      this.checkCardContainer.innerHTML = newCheckCard;
    }

    //let selectedChecks = Object.values(this.selectedChecks.checks);
    for (check of this.selectedChecks) {

      let newDiv = document.createElement('DIV');
      newDiv.classList.add('checkSpaceCard');
      newDiv.setAttribute("id", check.checkid);
      newDiv.setAttribute("onmouseenter", "checkView.hoverCheck(this)");
      newDiv.setAttribute("onmouseleave", "checkView.leaveCheck(this)");
      newDiv.setAttribute("onclick", "checkView.checkClicked(this)");
      if (project.favorite) {
        newDiv.classList.add('favorite');
      }
      let htmlInner = `<div class="checkCardInfo">`
      htmlInner += `<p>${check.checkdate}</p>`;
      htmlInner += `<ul>`;
      /*for (li of check.datasets) {
        htmlInner += `<li>${li}</li>`
      }*/
      htmlInner += "</ul></div>"
      htmlInner += `<div class='checkCardTitle'><h2>${check.checkname}<h2>`;
      htmlInner += `<p>${check.checkstatus}</p></div>`
      htmlInner += `<div class="projectButtons">`;
      htmlInner += `<div class="star" onclick="controller.setFavoriteCheck(${check.checkid})"></div>`;
      if (controller.permissions()) {
        htmlInner += `
            <div class="btnSymbol hiddenBtn" onclick="controller.editCheck(${check.checkid});">\
              <img class="btnSymbol" src="../public/symbols/infoMenu.svg">\
            </div>\
            <div class="btnSymbol hiddenBtn" onclick="deleteItems.init('check', ${check.checkid});">\
              <img src="../public/symbols/TrashDelete.svg">\
            </div>`;
      }
      htmlInner += `</div>`
      newDiv.innerHTML = htmlInner;
      this.checkCardContainer.appendChild(newDiv);
    }
  },

  reviewClicked: function(subject){
    controller.setCurrentReview(subject.id);
    var currentProj = controller.getCurrentProj();
    var currentReview = controller.getCurrentReview();
  
    $.ajax({
      data: {
        'InvokeFunction': 'CreateTempCheckSpaceDBByCopy',
        'ProjectName': currentProj.projectname,
        'CheckName': currentReview.checkname,
      },
      type: "POST",
      url: "PHP/ProjectLoadManager.php"
    }).done(function (msg) {
      if (msg === 'success') {
        localStorage.setItem('reviewinfo', JSON.stringify(currentReview));
        window.location.href = "module2.html";
      }
    });
  },


  renderReviews: function () {

    let newCheckCard = "";
    this.checkCardContainer.innerHTML = newCheckCard;
    //let selectedReviews = Object.values(this.selectedReviews.reviews);
    /* This code is from Alex. For now, we don't have mechanism to save Reviews with specified name and rest things. So commenting it...Rahul K][10 Aug 2019]
      for (review of this.selectedReviews) {
      let newDiv = document.createElement('DIV');
      newDiv.classList.add('checkSpaceCard');
      newDiv.setAttribute("id", review.reviewID);
      newDiv.setAttribute("onmouseenter", "checkView.hoverCheck(this)");
      newDiv.setAttribute("onmouseleave", "checkView.leaveCheck(this)");
      if (project.favorite) {
        newDiv.classList.add('favorite');
      }
      let htmlInner = `<a href=${review.url}><div class="checkCardInfo reviewCardInfo">`
      htmlInner += `<p>${review.createDate}</p>`;
      htmlInner += `<ul>`;
      
      htmlInner += "</ul></div>"
      htmlInner += `<div class='checkCardTitle'><h2>${review.name}<h2>`;
      htmlInner += `<p>${review.status}</p></div></a>`
      htmlInner += `<div class="projectButtons">`;
      htmlInner += `<div class="star" onclick="controller.setFavoriteReview(${review.reviewID})"></div>`;
      if (controller.permissions()) {
        htmlInner += `
        <div class="btnSymbol hiddenBtn" onclick="controller.editReview(${review.reviewID});">\
          <img class="btnSymbol" src="../public/symbols/infoMenu.svg">\
        </div>\
        <div class="btnSymbol hiddenBtn" onclick="deleteItems.init('review', ${review.reviewID});">\
          <img src="../public/symbols/TrashDelete.svg">\
        </div>`
      }
      htmlInner += `</div>`
      newDiv.innerHTML = htmlInner;
      this.checkCardContainer.appendChild(newDiv);
  }*/
    for (review of this.selectedReviews) {
      let newDiv = document.createElement('DIV');
      newDiv.classList.add('checkSpaceCard');
      newDiv.setAttribute("id", review.checkid);
      newDiv.setAttribute("onmouseenter", "checkView.hoverCheck(this)");
      newDiv.setAttribute("onmouseleave", "checkView.leaveCheck(this)");
      newDiv.setAttribute("onclick", "checkView.reviewClicked(this)");
      if (project.favorite) {
        newDiv.classList.add('favorite');
      }
      let htmlInner;// = `<a href=${review.url}><div class="checkCardInfo reviewCardInfo">`
      htmlInner += `<p>${review.checkdate}</p>`;
      htmlInner += `<ul>`;

      htmlInner += "</ul></div>"
      htmlInner += `<div class='checkCardTitle'><h2>${review.checkname}<h2>`;
      htmlInner += `<p>${review.checkstatus}</p></div></a>`
      htmlInner += `<div class="projectButtons">`;
      htmlInner += `<div class="star" onclick="controller.setFavoriteReview(${review.checkid})"></div>`;
      if (controller.permissions()) {
        htmlInner += `
      <div class="btnSymbol hiddenBtn" onclick="controller.editReview(${review.checkid});">\
        <img class="btnSymbol" src="../public/symbols/infoMenu.svg">\
      </div>\
      <div class="btnSymbol hiddenBtn" onclick="deleteItems.init('review', ${review.checkid});">\
        <img src="../public/symbols/TrashDelete.svg">\
      </div>`
      }
      htmlInner += `</div>`
      newDiv.innerHTML = htmlInner;
      this.checkCardContainer.appendChild(newDiv);
    }
  },

  // REMOVED FOR BETA-1. POTENTIAL RETURN IN BETA-2
  // renderCurrentCheck: function(){
  //   let thisCheck = controller.getCurrentCheck();
  //   this.checkTitle.innerHTML = `${thisCheck.name} - ${thisCheck.status}`;
  //   this.checkDescription.innerHTML = `${thisCheck.description}`;
  // },

  closeCheckSpace: function () {
    this.checkSpaceOpen.classList.remove("open");
    controller.clearChecksReviews();
  }
}

let newProjectView = {
  init: function () {
    this.newProjectOverlay = document.getElementById("newProject");
    this.newProjectOverlay.classList.add("projectOverlaysOpen");
  },
  closeNewProject: function () {
    this.newProjectOverlay.classList.remove("projectOverlaysOpen");
  }
}

let newCheckView = {
  init: function (projectID) {
    this.currentProject = controller.getCurrentProj();
    console.log(this.currentProject);
    this.newCheckOverlay = document.getElementById("newCheck");
    this.newCheckOverlay.classList.add("projectOverlaysOpen");

  },
  closeNewCheck: function () {
    this.newCheckOverlay.classList.remove("projectOverlaysOpen");
  },

  createNewCheck: function (checkspace) {
    var currentProj = controller.getCurrentProj();
    $.ajax({
      data: {
        'InvokeFunction': 'CreateCheckSpace',
        'ProjectName': currentProj.projectname,
        'ProjectId': currentProj.projectid,
        'userid': localStorage.getItem('userid'),
        'CheckSpaceInfo': JSON.stringify(checkspace)
      },
      type: "POST",
      url: "PHP/CheckSpaceManager.php"
    }).done(function (msg) {
      var object = JSON.parse(msg);
      if (object.checkid === 0) {
        alert('Check Space with provided name already exists');
      }
      else if (object.checkid === -1) {
        alert('Failed to create check space');
      }
      else {
        controller.fetchProjectChecks(controller.getCurrentProj().projectid);
        newCheckView.closeNewCheck();
      }
    });
  }
}

let editProjectView = {
  init: function () {
    this.editProjectOverlay = document.getElementById("editProject");
    let currentProjectName = document.getElementById("currentProjectName");
    let editProjectName = document.getElementById("editProjectName");
    let editCreator = document.getElementById("editCreator");
    let editDateCreated = document.getElementById("editDateCreated");
    let editProjectWin = document.getElementById("editProject");
    let editComments = document.getElementById("editComments");
    let editProjectForm = document.getElementById("editProjectForm");

    editProjectWin.classList.add("projectOverlaysOpen");

    this.editProjectOverlay.classList.add("projectOverlaysOpen");

    this.currentProject = controller.getCurrentProj();
    console.log(this.currentProject);
    currentProjectName.innerHTML = this.currentProject.projectname;
    editProjectName.value = this.currentProject.projectname;
    editCreator.innerHTML = this.currentProject.creator;
    editDateCreated.innerHTML = this.currentProject.createddate;
    editProjectDescription.innerHTML = this.currentProject.description;
    editComments.value = this.currentProject.comments;
  },

  closeEditProject: function () {
    //document.getElementById("editProjectForm").submit();
    this.editProjectOverlay.classList.remove("projectOverlaysOpen");
    controller.fetchProjects();
  }
}

let editCheckView = {
  init: function () {
    this.editCheckOverlay = document.getElementById("editCheck");
    let currentCheckName = document.getElementById("currentCheckName");
    let editCheckName = document.getElementById("editCheckName");
    let editCreator = document.getElementById("editCreator");
    let editDateCreated = document.getElementById("editDateCreated");
    let editCheckComments = document.getElementById("editCheckComments");

    this.editCheckOverlay.classList.add("projectOverlaysOpen");

    this.editCheckOverlay.classList.add("projectOverlaysOpen");

    this.currentCheck = controller.getCurrentCheck();
    console.log(this.currentProject);
    currentCheckName.innerHTML = this.currentCheck.checkname;
    editCheckName.value = this.currentCheck.checkname;
    editCreator.innerHTML = this.currentCheck.creator;
    editDateCreated.innerHTML = this.currentCheck.checkdate;
    editCheckDescription.innerHTML = this.currentCheck.checkdescription;
    editComments.value = this.currentCheck.checkcomments;

  },

  // switchChecksReviews: function(){
  //   controller.setModule();
  //   if(controller.)
  // },

  closeEditCheck: function () {
    //document.getElementById("editCheckForm").submit();
    this.editCheckOverlay.classList.remove("projectOverlaysOpen");
    controller.fetchProjectChecks();
  }
}

let editReviewView = {
  init: function () {
    this.editReviewOverlay = document.getElementById("editReview");
    let currentReviewName = document.getElementById("currentReviewName");
    let editReviewName = document.getElementById("editReviewName");
    let editCreator = document.getElementById("editCreator");
    let editDateCreated = document.getElementById("editDateCreated");
    let editReviewComments = document.getElementById("editReviewComments");
    let lastEditedBy = document.getElementById("lastEditedBy");
    let lastEditedDate = document.getElementById("lastEditedDate");

    this.editReviewOverlay.classList.add("projectOverlaysOpen");

    this.editReviewOverlay.classList.add("projectOverlaysOpen");

    this.currentReview = controller.getCurrentReview();
    console.log(this.currentReview);

    currentReviewName.innerHTML = this.currentReview.checkname;
    editReviewName.value = this.currentReview.checkname;
    editCreator.innerHTML = this.currentReview.creator;
    editDateCreated.innerHTML = this.currentReview.checkdate;
    editReviewDescription.innerHTML = this.currentReview.checkdescription;
    editComments.value = this.currentReview.checkcomments;
    lastEditedBy.innerHTML = this.currentReview.editedBy;
    lastEditedDate.innerHTML = this.currentReview.editDate;

  },

  closeEditReview: function () {
    //document.getElementById("editReviewForm").submit();
    this.editReviewOverlay.classList.remove("projectOverlaysOpen");
    controller.fetchProjectReviews();
  }
}

let deleteItems = {
  init: function (type, id) {
    this.deleteBox = document.getElementById("delete");
    let closeDelete = document.getElementById("deleteCancel");
    let message = document.getElementById("deleteMsg");
    let cancel = document.getElementById("deleteCancel");
    let delType = document.getElementById("deleteType");
    this.deleteBox.classList.add("deleteOpen");

    let deleteBtn = document.getElementById("deleteBtn");
    this.id = id;
    this.type = type;

    delType.innerHTML = this.type;

    deleteBtn.onclick = this.deleteItem;

    if (type == "project") {
      message.innerHTML = "Project and all associated Checks and Reviews?";
      let obj = model.myProjects.find(obj => obj.projectid == id);
      if (obj === undefined) {
        controller.setPublicCurrentProj(id);
      }
      else {
        controller.setMyCurrentProj(id);
      }
    } else if (type == "check") {
      message.innerHTML = "Check and all association Reviews?";
      controller.setCurrentCheck(id);
    } else if (type == "review") {
      message.innerHTML = "Review?";
    }
    this.deleteItem();
  },

  deleteItem: function () {
    if (this.type == "project") {
      controller.deleteProject(this.id);
      deleteItems.closeDeleteItems();
    } else if (this.type == "check") {
      controller.deleteCheck(this.id);
      deleteItems.closeDeleteItems();
    }
  },

  closeDeleteItems: function () {
    this.deleteBox.classList.remove("deleteOpen");
  }
}

controller.init();
