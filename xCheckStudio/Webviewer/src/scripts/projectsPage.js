let model = {
  init: function () { },
  currentProject: null,
  myProjects: [],
  publicProjects: [],
  sortBy: "name",
  sortChecksBy: "name",
  currentCheck: null,
  currentReview: null,
  projectReviews: [],
  projectChecks: [],
  currentModule: "",
}

let controller = {
  init: function () {
    this.fetchProjects();
    projectView.init();
    this.permissions();
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    if (userinfo.permission === "check" || userinfo.permission === "prep" || userinfo.permission === "Admin")
      model.currentModule = "check";
    else
      model.currentModule = "review";
  },

  permissions: function () {
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    if (userinfo.permission === ("check" || "prep" || "Admin")) {
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
    if (model.currentModule == "check") {
      this.fetchProjectChecks();
    } else if (model.currentModule == "review") {
      this.fetchProjectReviews();
    }
  },

  sortProjects: function () {
    if (model.sortBy === "name") {
      model.myProjects.sort(function (a, b) {
        var nameA = a.projectname.toLowerCase(), nameB = b.projectname.toLowerCase()
        if (nameA < nameB) //sort string ascending
          return -1
        if (nameA > nameB)
          return 1
        return 0 //default return value (no sorting)
      })

      model.publicProjects.sort(function (a, b) {
        var nameA = a.projectname.toLowerCase(), nameB = b.projectname.toLowerCase()
        if (nameA < nameB) //sort string ascending
          return -1
        if (nameA > nameB)
          return 1
        return 0 //default return value (no sorting)
      })
    }
    else if (model.sortBy === "nameReverse") {
      model.myProjects.sort(function (a, b) {
        var nameA = a.projectname.toLowerCase(), nameB = b.projectname.toLowerCase()
        if (nameA > nameB) //sort string descending
          return -1
        if (nameA < nameB)
          return 1
        return 0 //default return value (no sorting)
      })

      model.publicProjects.sort(function (a, b) {
        var nameA = a.projectname.toLowerCase(), nameB = b.projectname.toLowerCase()
        if (nameA > nameB) //sort string descending
          return -1
        if (nameA < nameB)
          return 1
        return 0 //default return value (no sorting)
      })
    }
    if (model.sortBy === "status") {
      model.myProjects.sort(function (a, b) {
        var nameA = a.status.toLowerCase(), nameB = b.status.toLowerCase()
        if (nameA < nameB) //sort string ascending
          return -1
        if (nameA > nameB)
          return 1
        return 0 //default return value (no sorting)
      })

      model.publicProjects.sort(function (a, b) {
        var nameA = a.status.toLowerCase(), nameB = b.status.toLowerCase()
        if (nameA < nameB) //sort string ascending
          return -1
        if (nameA > nameB)
          return 1
        return 0 //default return value (no sorting)
      })
    }
    else if (model.sortBy === "statusReverse") {
      model.myProjects.sort(function (a, b) {
        var nameA = a.status.toLowerCase(), nameB = b.status.toLowerCase()
        if (nameA > nameB) //sort string descending
          return -1
        if (nameA < nameB)
          return 1
        return 0 //default return value (no sorting)
      })

      model.publicProjects.sort(function (a, b) {
        var nameA = a.status.toLowerCase(), nameB = b.status.toLowerCase()
        if (nameA > nameB) //sort string descending
          return -1
        if (nameA < nameB)
          return 1
        return 0 //default return value (no sorting)
      })
    }
    else if (model.sortBy === "date") {
      model.myProjects.sort(function (a, b) {
        return new Date(a.createddate).getTime() - new Date(b.createddate).getTime()
      })

      model.publicProjects.sort(function (a, b) {
        return new Date(a.createddate).getTime() - new Date(b.createddate).getTime()
      })
    }
    else if (model.sortBy === "dateReverse") {
      model.myProjects.sort(function (a, b) {
        return new Date(b.createddate).getTime() - new Date(a.createddate).getTime()
      })

      model.publicProjects.sort(function (a, b) {
        return new Date(b.createddate).getTime() - new Date(a.createddate).getTime()
      })
    }
  },

  sortChecks: function () {
    if (model.sortChecksBy === "name") {
      model.projectChecks.sort(function (a, b) {
        var nameA = a.checkname.toLowerCase(), nameB = b.checkname.toLowerCase()
        if (nameA < nameB) //sort string ascending
          return -1
        if (nameA > nameB)
          return 1
        return 0 //default return value (no sorting)
      })
    }
    else if (model.sortChecksBy === "nameReverse") {
      model.projectChecks.sort(function (a, b) {
        var nameA = a.checkname.toLowerCase(), nameB = b.checkname.toLowerCase()
        if (nameA > nameB) //sort string descending
          return -1
        if (nameA < nameB)
          return 1
        return 0 //default return value (no sorting)
      })
    }
    if (model.sortChecksBy === "status") {
      model.projectChecks.sort(function (a, b) {
        var nameA = a.checkstatus.toLowerCase(), nameB = b.checkstatus.toLowerCase()
        if (nameA < nameB) //sort string ascending
          return -1
        if (nameA > nameB)
          return 1
        return 0 //default return value (no sorting)
      })
    }
    else if (model.sortChecksBy === "statusReverse") {
      model.projectChecks.sort(function (a, b) {
        var nameA = a.checkstatus.toLowerCase(), nameB = b.checkstatus.toLowerCase()
        if (nameA > nameB) //sort string descending
          return -1
        if (nameA < nameB)
          return 1
        return 0 //default return value (no sorting)
      })
    }
    else if (model.sortChecksBy === "date") {
      model.projectChecks.sort(function (a, b) {
        return new Date(a.checkdate).getTime() - new Date(b.checkdate).getTime()
      })
    }
    else if (model.sortChecksBy === "dateReverse") {
      model.projectChecks.sort(function (a, b) {
        return new Date(b.checkdate).getTime() - new Date(a.checkdate).getTime()
      })
    }
  },

  sortReviews: function () {
    if (model.sortChecksBy === "name") {
      model.projectReviews.sort(function (a, b) {
        var nameA = a.checkname.toLowerCase(), nameB = b.checkname.toLowerCase()
        if (nameA < nameB) //sort string ascending
          return -1
        if (nameA > nameB)
          return 1
        return 0 //default return value (no sorting)
      })
    }
    else if (model.sortChecksBy === "nameReverse") {
      model.projectReviews.sort(function (a, b) {
        var nameA = a.checkname.toLowerCase(), nameB = b.checkname.toLowerCase()
        if (nameA > nameB) //sort string descending
          return -1
        if (nameA < nameB)
          return 1
        return 0 //default return value (no sorting)
      })
    }
    if (model.sortChecksBy === "status") {
      model.projectReviews.sort(function (a, b) {
        var nameA = a.checkstatus.toLowerCase(), nameB = b.checkstatus.toLowerCase()
        if (nameA < nameB) //sort string ascending
          return -1
        if (nameA > nameB)
          return 1
        return 0 //default return value (no sorting)
      })
    }
    else if (model.sortChecksBy === "statusReverse") {
      model.projectReviews.sort(function (a, b) {
        var nameA = a.checkstatus.toLowerCase(), nameB = b.checkstatus.toLowerCase()
        if (nameA > nameB) //sort string descending
          return -1
        if (nameA < nameB)
          return 1
        return 0 //default return value (no sorting)
      })
    }
    else if (model.sortChecksBy === "date") {
      model.projectReviews.sort(function (a, b) {
        return new Date(a.checkdate).getTime() - new Date(b.checkdate).getTime()
      })
    }
    else if (model.sortChecksBy === "dateReverse") {
      model.projectReviews.sort(function (a, b) {
        return new Date(b.checkdate).getTime() - new Date(a.checkdate).getTime()
      })
    }
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
        var userinfo = JSON.parse(localStorage.getItem('userinfo'));
        // add this project's entry in main DB
        $.ajax({
          data: {
            'InvokeFunction': 'AddNewProjectToMainDB',
            'userid': userinfo.userid,
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
        // alert(msg);
        showAlertForm(msg);
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
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    $.ajax({
      data: {
        'InvokeFunction': 'GetProjects',
        'userid': userinfo.userid,
      },
      type: "POST",
      url: "PHP/ProjectManager.php"
    }).done(function (msg) {
      var object = JSON.parse(msg);
      var array = [];
      for (var i in object) {
        var obj = object[i];
        if (obj.type.toLowerCase() === 'private')
          model.myProjects.push(object[i]);
        else
          model.publicProjects.push(object[i]);
      }
      controller.sortProjects();
      projectView.renderProjects();
      onToggleOverlayDisplayForCheckSpaces(false);
    });
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
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    this.clearChecksReviews();
    $.ajax({
      data: {
        'InvokeFunction': 'GetCheckSpaces',
        'userid': userinfo.userid,
        'ProjectId': currentProj.projectid,
        'ProjectName': currentProj.projectname,
      },
      type: "POST",
      url: "PHP/CheckSpaceManager.php"
    }).done(function (msg) {
      var objectArray = JSON.parse(msg);
      model.projectChecks = [...objectArray];
      controller.sortChecks();
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
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    var currentProj = this.getCurrentProj();
    this.clearChecksReviews();
    $.ajax({
      data: {
        'InvokeFunction': 'GetCheckSpaces',
        'userid': userinfo.userid,
        'ProjectId': currentProj.projectid,
        'ProjectName': currentProj.projectname,
      },
      type: "POST",
      url: "PHP/CheckSpaceManager.php"
    }).done(function (msg) {
      var objectArray = JSON.parse(msg);
      model.projectReviews = [...objectArray];
      controller.sortReviews();
      checkView.init()
    });
  },

  getReviews: function () {
    return model.projectReviews;
  },


  setFavoriteProject: function (projID) {
    var obj = model.myProjects.find(obj => obj.projectid == projID);
    if (obj === undefined) {
      obj = model.publicProjects.find(obj => obj.projectid == projID);
    }
    if (obj === undefined) {
      console.log("No project found to mark as favourite");
      return;
    }
    var newFav = 0;
    if (obj.IsFavourite === "0") {
      newFav = 1;
    }
    else {
      newFav = 0;
    }
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    $.ajax({
      data: {
        'InvokeFunction': 'SetProjectAsFavourite',
        'userid': userinfo.userid,
        'ProjectId': projID,
        'Favourite': newFav,
      },
      type: "POST",
      url: "PHP/ProjectManager.php"
    }).done(function (msg) {
      if (msg === "") {
        controller.fetchProjects();
      }
    });
  },

  setFavoriteCheck: function (checkID) {
    event.stopPropagation();
    var obj = model.projectChecks.find(obj => obj.checkid == checkID);
    if (obj === undefined) {
      console.log("No check found to mark as favourite");
      return;
    }
    var newFav = 0;
    if (obj.checkisfavourite === "0") {
      newFav = 1;
    }
    else {
      newFav = 0;
    }
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    var projectinfo = controller.getCurrentProj();
    $.ajax({
      data: {
        'InvokeFunction': 'SetCheckAsFavourite',
        'userid': userinfo.userid,
        'CheckId': checkID,
        'ProjectName': projectinfo.projectname,
        'Favourite': newFav,
      },
      type: "POST",
      url: "PHP/CheckSpaceManager.php"
    }).done(function (msg) {
      if (msg === "true") {
        controller.fetchProjectChecks();
      }
    });
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
    if (type.toLowerCase() === "public") {
      controller.setPublicCurrentProj(id);
    } else {
      controller.setMyCurrentProj(id);
    };
    editProjectView.init();
    editProjectView.disableEditProjectForm();
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
      if (selected === null)
        return;
      onToggleOverlayDisplayForCheckSpaces(true);
      if (selected.classList.contains('newProjectCard')) {
        newProjectView.init("Private");
      } else if (event.target.closest('.projectButtons')) {
      } else {
        controller.setMyCurrentProj(selected.id);
        controller.fetchProjectInfo(selected.id);
      }
    });

    publicProjectsCont.addEventListener("click", function (event) {
      let selected = event.target.closest('.card');
      if (selected === null)
        return;
      onToggleOverlayDisplayForCheckSpaces(true);
      if (selected.classList.contains('newProjectCard')) {
        newProjectView.init("Public");
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
    if (project.IsFavourite === "1") {
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
    if (!controller.permissions() && this.toggle != null) {
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
    //window.location.href = "checkModule.html";
    // var fromCheckClick = localStorage.getItem('FromCheckClick')
    // // localStorage.clear();
    // if (fromCheckClick.toLowerCase() === 'true') {
    window.location.href = "checkPage.html";
    // }
    // else if (fromCheckClick.toLowerCase() === 'false') {
    // window.location.href = "reviewPage.html";
    // }
    //localStorage.setItem("loadSavedProject",true);
  },

  leaveCheck: function (subject) {
    subject.classList.remove("hovered");
  },

  renderChecks: function () {
    scrollContentDivToTop();
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
      newDiv.setAttribute("onclick", "showEnterCheckForm(this)");
      if (check.checkisfavourite === "1") {
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

  reviewClicked: function (subject) {
    var proj = model.currentProject;
    localStorage.setItem('projectinfo', JSON.stringify(proj));

    controller.setCurrentReview(subject.id);
    localStorage.setItem('checkinfo', JSON.stringify(model.currentReview));

    window.location.href = "reviewPage.html";
  },


  renderReviews: function () {
    scrollContentDivToTop();
    let newCheckCard = "";
    this.checkCardContainer.innerHTML = newCheckCard;

    for (review of this.selectedReviews) {
      if (review.review !== "1") {
        continue;
      }

      let newDiv = document.createElement('DIV');
      newDiv.classList.add('checkSpaceCard');
      newDiv.setAttribute("id", review.checkid);
      newDiv.setAttribute("onmouseenter", "checkView.hoverCheck(this)");
      newDiv.setAttribute("onmouseleave", "checkView.leaveCheck(this)");
      newDiv.setAttribute("onclick", "showEnterReviewForm(this)");
      if (review.checkisfavourite === "1") {
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
    onToggleOverlayDisplayForCheckSpaces(false);
    this.checkSpaceOpen.classList.remove("open");
    controller.clearChecksReviews();
  }
}

let newProjectView = {
  active: false,
  init: function (type) {
    this.newProjectOverlay = document.getElementById("newProject");
    onToggleOverlayDisplay(true);
    this.newProjectOverlay.classList.add("projectOverlaysOpen");
    let projectType = document.getElementById("inputprojecttype");
    projectType.value = type;

    this.active = true;
  },
  closeNewProject: function () {
    onToggleOverlayDisplay(false);
    this.newProjectOverlay.classList.remove("projectOverlaysOpen");

    this.active = false;
  },
  onCloseNewProject: function () {
    var overlay = document.getElementById("cancelProjectCreationOverlay");
    var popup = document.getElementById("cancelProjectCreationPopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
  }
}

let newCheckView = {
  active: false,

  init: function (projectID) {
    this.currentProject = controller.getCurrentProj();
    console.log(this.currentProject);
    this.newCheckOverlay = document.getElementById("newCheck");
    onToggleOverlayDisplay(true);
    this.newCheckOverlay.classList.add("projectOverlaysOpen");

    this.active = true;
  },
  closeNewCheck: function () {
    onToggleOverlayDisplay(false);
    this.newCheckOverlay.classList.remove("projectOverlaysOpen");

    this.active = false;
  },

  onCloseNewCheck: function () {
    var overlay = document.getElementById("cancelCheckSpaceCreationOverlay");
    var popup = document.getElementById("cancelCheckSpaceCreationPopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
  },

  createNewCheck: function (checkspace) {
    var currentProj = controller.getCurrentProj();
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    $.ajax({
      data: {
        'InvokeFunction': 'CreateCheckSpace',
        'ProjectName': currentProj.projectname,
        'ProjectId': currentProj.projectid,
        'userid': userinfo.userid,
        'CheckSpaceInfo': JSON.stringify(checkspace)
      },
      type: "POST",
      url: "PHP/CheckSpaceManager.php"
    }).done(function (msg) {
      var object = JSON.parse(msg);
      if (object.checkid === 0) {
        //alert('Check Space with provided name already exists');
        showAlertForm('Check Space with provided name already exists');
      }
      else if (object.checkid === -1) {
        // alert('Failed to create check space');
        showAlertForm('Failed to create check space');
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
    let editProjectStatus = document.getElementById("editProjectStatus");
    let editProjectType = document.getElementById("editProjectType");
    let editProjectDescription = document.getElementById("editProjectDescription");

    editProjectWin.classList.add("projectOverlaysOpen");
    onToggleOverlayDisplay(true);
    this.editProjectOverlay.classList.add("projectOverlaysOpen");

    this.currentProject = controller.getCurrentProj();
    currentProjectName.innerHTML = this.currentProject.projectname;
    editProjectName.value = this.currentProject.projectname;
    editCreator.innerHTML = this.currentProject.creator;
    editDateCreated.innerHTML = this.currentProject.createddate;
    editProjectDescription.value = this.currentProject.description;
    editComments.value = this.currentProject.comments;
    editProjectStatus.value = this.currentProject.status;
    editProjectType.value = this.currentProject.type;
  },

  disableEditProjectForm: function() {
    document.getElementById("editProjectName").disabled = true;
    document.getElementById("editComments").disabled = true;
    document.getElementById("editProjectStatus").disabled = true;
    document.getElementById("editProjectType").disabled = true;
    document.getElementById("editProjectDescription").disabled = true;
    document.getElementById("favoriteCheck").disabled = true;
  },

  editProjectInfo: function() {
    this.cancelEditProject(false);
    document.getElementById("editProjectName").disabled = false;
    document.getElementById("editComments").disabled = false;
    document.getElementById("editProjectStatus").disabled = false;
    document.getElementById("editProjectType").disabled = false;
    document.getElementById("editProjectDescription").disabled = false;
    document.getElementById("favoriteCheck").disabled = false;
  },

  cancelEditProject: function(closeProjectOverlay) {
    var overlay = document.getElementById("editProjectOverlay");
    var popup = document.getElementById("editProjectPopup");

    overlay.style.display = 'none';
    popup.style.display = 'none';

    if(closeProjectOverlay) {
      onToggleOverlayDisplay(false);
      document.getElementById("editProject").classList.remove("projectOverlaysOpen");
    }
  },

  openEditProjectOverlay: function() {
    var overlay = document.getElementById("editProjectOverlay");
    var popup = document.getElementById("editProjectPopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';
  },

  SaveEditedProjectInfo: function () {
    this.onUpdateProject();
  },

  onUpdateProject: function () {
    var _this = this;
    let editComments = document.getElementById("editComments").value;
    let editProjectStatus = document.getElementById("editProjectStatus").value;
    let editProjectType = document.getElementById("editProjectType").value;
    let editProjectDescription = document.getElementById("editProjectDescription").value;
    this.currentProject = controller.getCurrentProj();
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    // add this project's entry in main DB
    $.ajax({
      data: {
        'InvokeFunction': 'UpdateProject',
        'userid': userinfo.userid,
        'projectid': this.currentProject.projectid,
        'projectname': this.currentProject.projectname,
        'projectDescription': editProjectDescription,
        'projectType': editProjectType,
        "projectStatus": editProjectStatus,
        "projectComments": editComments,
        "projectIsFavorite": this.currentProject.IsFavourite,
      },
      type: "POST",
      url: "PHP/ProjectManager.php"
    }).done(function (msg) {
      onToggleOverlayDisplay(false);
      document.getElementById("editProject").classList.remove("projectOverlaysOpen");
      _this.cancelEditProject(true);
      if (msg === "true") {
        controller.fetchProjects();
      }
    });
  }
}

let editCheckView = {
  init: function () {
    this.editCheckOverlay = document.getElementById("editCheck");
    let currentCheckName = document.getElementById("currentCheckName");
    let editCheckName = document.getElementById("editCheckName");
    let editCreator = document.getElementById("editCheckCreator");
    let editDateCreated = document.getElementById("editCheckDateCreated");
    let editCheckConfig = document.getElementById("editCheckConfig");
    let editCheckStatus = document.getElementById("editCheckStatus");
    let editCheckComments = document.getElementById("editCheckComments");
    let editCheckDescription = document.getElementById("editCheckDescription");

    onToggleOverlayDisplay(true);
    this.editCheckOverlay.classList.add("projectOverlaysOpen");

    this.currentCheck = controller.getCurrentCheck();
    console.log(this.currentProject);
    currentCheckName.innerHTML = this.currentCheck.checkname;
    editCheckName.value = this.currentCheck.checkname;
    editCreator.innerHTML = this.currentCheck.creator;
    editDateCreated.innerHTML = this.currentCheck.checkdate;
    editCheckDescription.value = this.currentCheck.checkdescription;
    editCheckComments.value = this.currentCheck.checkcomments;
    editCheckConfig.value = this.currentCheck.checkconfiguration;
    editCheckStatus.value = this.currentCheck.checkstatus;
  },

  closeEditCheck: function () {
    this.onUpdateCheck();
  },

  onUpdateCheck: function () {
    let editCheckConfig = document.getElementById("editCheckConfig").value;
    let editCheckStatus = document.getElementById("editCheckStatus").value;
    let editCheckComments = document.getElementById("editCheckComments").value;
    let editCheckDescription = document.getElementById("editCheckDescription").value;

    var currentProject = controller.getCurrentProj();
    var currentCheck = controller.getCurrentCheck();
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));
    // add this project's entry in main DB
    $.ajax({
      data: {
        'InvokeFunction': 'UpdateCheck',
        'userid': userinfo.userid,
        'CheckId': currentCheck.checkid,
        'projectname': currentProject.projectname,
        'checkdescription': editCheckDescription,
        'checkstatus': editCheckStatus,
        "checkconfiguration": editCheckConfig,
        "checkcomments": editCheckComments,
        "checkIsFavorite": currentCheck.checkisfavourite,
      },
      type: "POST",
      url: "PHP/CheckSpaceManager.php"
    }).done(function (msg) {
      onToggleOverlayDisplay(false);
      document.getElementById("editCheck").classList.remove("projectOverlaysOpen");
      if (msg === "true") {
        controller.fetchProjectChecks();
      }
    });
  }
}

let editReviewView = {
  init: function () {
    this.editReviewOverlay = document.getElementById("editReview");
    let currentReviewName = document.getElementById("currentReviewName");
    let editReviewName = document.getElementById("editReviewName");
    let editCreator = document.getElementById("editCreator");
    let editReviewDateCreated = document.getElementById("editReviewDateCreated");
    let editReviewComments = document.getElementById("editReviewComments");
    let lastEditedBy = document.getElementById("lastEditedBy");
    let lastEditedDate = document.getElementById("lastEditedDate");
    let reviewCheckConfig = document.getElementById("reviewCheckConfig");
    let reviewCheckStatus = document.getElementById("reviewCheckStatus");

    this.editReviewOverlay.classList.add("projectOverlaysOpen");

    this.currentReview = controller.getCurrentReview();

    currentReviewName.innerHTML = this.currentReview.checkname;
    editReviewName.value = this.currentReview.checkname;
    editCreator.innerHTML = this.currentReview.creator;
    editReviewDateCreated.innerHTML = this.currentReview.checkdate;
    editReviewDescription.innerHTML = this.currentReview.checkdescription;
    editReviewComments.value = this.currentReview.checkcomments;
    lastEditedBy.innerHTML = this.currentReview.editedBy;
    lastEditedDate.innerHTML = this.currentReview.editDate;
    reviewCheckConfig.value = this.currentReview.checkconfiguration;
    reviewCheckStatus.value = this.currentReview.checkstatus;
  },

  closeEditReview: function () {
    //document.getElementById("editReviewForm").submit();
    this.editReviewOverlay.classList.remove("projectOverlaysOpen");
    controller.fetchProjectReviews();
  }
}

let deleteItems = {
  init: function (type, id) {
    event.stopPropagation();

    showDeleteForm();

    //this.deleteBox = document.getElementById("delete");
    // let closeDelete = document.getElementById("deleteCancel");
    let message = document.getElementById("deleteMsg");
    // let cancel = document.getElementById("deleteCancel");
    let delType = document.getElementById("deleteType");
    // this.deleteBox.classList.add("deleteOpen");

    // this.deleteBox.children[0].style.top = ((window.innerHeight / 2) - 139) + "px";
    // this.deleteBox.children[0].style.left = ((window.innerWidth / 2) - 290) + "px";

    let deleteBtn = document.getElementById("deleteBtn");
    deleteBtn.elementid = id;
    deleteBtn.itemtype = type;
    delType.innerHTML = type;
    deleteBtn.onclick = this.deleteItem;

    if (type == "project") {
      delType.innerHTML = "Project";
      message.innerHTML = "Delete this Project and all associated CheckSpaces?";
      let obj = model.myProjects.find(obj => obj.projectid == id);
      if (obj === undefined) {
        controller.setPublicCurrentProj(id);
      }
      else {
        controller.setMyCurrentProj(id);
      }
    } else if (type == "check") {
      delType.innerHTML = "CheckSpace";
      message.innerHTML = "Delete this CheckSpace and all associated checks?";
      controller.setCurrentCheck(id);
    } else if (type == "review") {
      delType.innerHTML = "Review";
      message.innerHTML = "Delete this Review and all associated data?";
    }
  },

  deleteItem: function () {
    if (this.itemtype == "project") {
      controller.deleteProject(this.elementid);
      deleteItems.closeDeleteItems();
    } else if (this.itemtype == "check") {
      controller.deleteCheck(this.elementid);
      deleteItems.closeDeleteItems();
    }
  },

  closeDeleteItems: function () {
    //this.deleteBox.classList.remove("deleteOpen");
    hideDeleteForm();
  }
}

controller.init();

function onToggleOverlayDisplay(show) {
  if (show === true) {
    document.getElementById("overlaymy").style.display = "block";
    scrollContentDivToTop();
    document.getElementById("content").style.overflowY = "hidden";
  }
  else {
    document.getElementById("overlaymy").style.display = "none";
    document.getElementById("content").style.overflowY = "auto";
  }
}

function onToggleOverlayDisplayForCheckSpaces(show) {
  if (show === true) {
    scrollContentDivToTop();
    document.getElementById("content").style.overflowY = "hidden";
  }
  else {
    document.getElementById("content").style.overflowY = "auto";
  }
}
function scrollContentDivToTop() {
  var contentDiv = document.getElementById("content");
  contentDiv.scrollTop = 0;
}


function cancelEnterCheck() {
  var checkCardContainer = document.getElementById("checkCardContainer");
  if (checkCardContainer) {

    for (var i = 0; i < checkCardContainer.children.length; i++) {
      var checkCard = checkCardContainer.children[i];
      if (checkCard.classList.contains("checkSpaceCard") &&
        checkCard.classList.contains("selected")) {
        checkCard.classList.remove("selected");
        break;
      }
    }
  }

  hideEnterCheckForm();
}

function enterCheck() {

  var checkCardContainer = document.getElementById("checkCardContainer");
  if (!checkCardContainer) {
    return;
  }

  for (var i = 0; i < checkCardContainer.children.length; i++) {
    var checkCard = checkCardContainer.children[i];
    if (checkCard.classList.contains("checkSpaceCard") &&
      checkCard.classList.contains("selected")) {
      checkView.checkClicked(checkCard);
      break;
    }
  }

  hideEnterCheckForm();
}

function showEnterCheckForm(subject) {
  subject.classList.add("selected");

  var overlay = document.getElementById("enterCheckOverlay");
  var popup = document.getElementById("enterCheckPopup");

  overlay.style.display = 'block';
  popup.style.display = 'block';

  popup.style.width = "581px";
  popup.style.height = "155px";
  popup.style.overflow = "hidden";

  popup.style.top = ((window.innerHeight / 2) - 139) + "px";
  popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

function hideEnterCheckForm() {
  var overlay = document.getElementById("enterCheckOverlay");
  var popup = document.getElementById("enterCheckPopup");

  overlay.style.display = 'none';
  popup.style.display = 'none';
}

function cancelEnterReview() {
  var checkCardContainer = document.getElementById("checkCardContainer");
  if (checkCardContainer) {

    for (var i = 0; i < checkCardContainer.children.length; i++) {
      var checkCard = checkCardContainer.children[i];
      if (checkCard.classList.contains("checkSpaceCard") &&
        checkCard.classList.contains("selected")) {
        checkCard.classList.remove("selected");
        break;
      }
    }
  }

  hideEnterReviewForm();
}

function enterReview() {
  var checkCardContainer = document.getElementById("checkCardContainer");
  if (!checkCardContainer) {
    return;
  }

  for (var i = 0; i < checkCardContainer.children.length; i++) {
    var checkCard = checkCardContainer.children[i];
    if (checkCard.classList.contains("checkSpaceCard") &&
      checkCard.classList.contains("selected")) {
      checkView.reviewClicked(checkCard);
      break;
    }
  }

  hideEnterReviewForm();
}

function showEnterReviewForm(subject) {
  subject.classList.add("selected");

  var overlay = document.getElementById("enterReviewOverlay");
  var popup = document.getElementById("enterReviewPopup");

  overlay.style.display = 'block';
  popup.style.display = 'block';

  popup.style.width = "581px";
  popup.style.height = "155px";
  popup.style.overflow = "hidden";

  popup.style.top = ((window.innerHeight / 2) - 139) + "px";
  popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

function hideEnterReviewForm() {
  var overlay = document.getElementById("enterReviewOverlay");
  var popup = document.getElementById("enterReviewPopup");

  overlay.style.display = 'none';
  popup.style.display = 'none';
}

function showDeleteForm() {
  var overlay = document.getElementById("deleteOverlay");
  var popup = document.getElementById("deletePopup");

  overlay.style.display = 'block';
  popup.style.display = 'block';

  popup.style.width = "581px";
  popup.style.height = "155px";
  popup.style.overflow = "hidden";

  popup.style.top = ((window.innerHeight / 2) - 139) + "px";
  popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}

function hideDeleteForm() {
  var overlay = document.getElementById("deleteOverlay");
  var popup = document.getElementById("deletePopup");

  overlay.style.display = 'none';
  popup.style.display = 'none';
}


function onAlertOk() {
  hideAlertForm();
}

function hideAlertForm() {
  var overlay = document.getElementById("alertOverlay");
  var popup = document.getElementById("alertPopup");

  overlay.style.display = 'none';
  popup.style.display = 'none';
}


function showAlertForm(alertMsg) {
  var alertMsgHolder = document.getElementById("createProjectErrorMsg");
  alertMsgHolder.innerText = alertMsg;

  var overlay = document.getElementById("alertOverlay");
  var popup = document.getElementById("alertPopup");

  overlay.style.display = 'block';
  popup.style.display = 'block';

  popup.style.width = "581px";
  popup.style.height = "155px";
  popup.style.overflow = "hidden";

  popup.style.top = ((window.innerHeight / 2) - 139) + "px";
  popup.style.left = ((window.innerWidth / 2) - 290) + "px";
}


document.addEventListener("keydown", function (event) {
  
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();

    
    if (newProjectView.active) {
      OnCreateProject();
    }
    else if(newCheckView.active)
    {
      OnCreateNewCheckCase();
    } 
    
    return false;
  }
});

