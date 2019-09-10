var currentTabId;

let model = {
  activeTabs: 0,
  selectedTab: [],
  currentView: null,
  views: {
    a: {
      id: "a",
      used: false,
      viewPanel: document.getElementById("viewPanelA"),
      tableData: document.getElementById("tableDataA"),
      visualizer: document.getElementById("visualizerA"),
      fileName: ""
    },
    b: {
      id: "b",
      used: false,
      viewPanel: document.getElementById("viewPanelB"),
      tableData: document.getElementById("tableDataB"),
      visualizer: document.getElementById("visualizerB"),
      fileName: ""
    },
    c: {
      id: "c",
      used: false,
      viewPanel: document.getElementById("viewPanelC"),
      tableData: document.getElementById("tableDataC"),
      visualizer: document.getElementById("visualizerC"),
      fileName: ""
    },
    d: {
      id: "d",
      used: false,
      viewPanel: document.getElementById("viewPanelD"),
      tableData: document.getElementById("tableDataD"),
      visualizer: document.getElementById("visualizerD"),
      fileName: ""
    }
  }
}

let controller = {
  init: function () {
    viewTabs.init();
    viewPanels.init();
  },

  //Finds first available view that is not used.
  nextAvailableView: function () {
    let views = Object.values(model.views);
    for (view of views) {
      if (view.used == false) {
        return view.id;
      }
    }
  },


  // NOTE FOR PROTOTECH - run this after file is loaded.
  //It will find the first available "panel", create a tab for it, and select both.
  addNewFile: function (fileName) {
    const addedFile = model.views[this.nextAvailableView()];
    const table = addedFile.tableData; //NOTE FOR PROTOTECH - This will select the 'table' for this particular panel
    const visualizer = addedFile.visualizer; //NOTE FOR PROTOTECH - This will select the 'vizualizer' for this particular panel
    model.activeTabs++;
    //FOR PROTOTECH - SET FILENAME FOR TAB BELOW
    addedFile.fileName = fileName;
    // SET FILENAME FOR TAB ABOVE

    addedFile.used = true;
    viewTabs.createTab(addedFile);
    viewPanels.showPanel(addedFile.viewPanel);
    if (model.activeTabs >= 4) {
      viewTabs.hideAddTab();
    }

    return addedFile;
  },

  //clears data from deleted tab
  //NOTE TO PROTOTECH - MAY BE USED TO REMOVE MORE DATA FROM THE MODEL.VIEW IF PROVIDED IN addNewFile
  deleteTabData: function (id) {
    let tab = model.views[id];
    tab.fileName = "";
    tab.used = false;    
  },

  selectView: function (id) {
    let changeViewTo = model.views[id];
    viewPanels.showPanel(changeViewTo.viewPanel);
  }
}

let viewTabs = {
  init: function () {
    this.container = document.getElementById("tabContainer");
    this.addTab = document.getElementById("addTab");
    this.tabs = document.getElementsByClassName("tab");

    this.container.addEventListener("click", function () {
      let deleteTab = event.target.closest('.deleteTab');
      let changeTab = event.target.closest('.tab');
      if (deleteTab) {
        viewTabs.deleteTab(deleteTab.parentNode);
      } else if (changeTab) {
        viewTabs.selectTab(changeTab);
        controller.selectView(changeTab.dataset.id);
      } else { return };
    })

    this.addTab.addEventListener("click", viewPanels.showAddPanel);
  },

  createTab: function (view) {
    let newNode = document.createElement("div");
    newNode.classList.add("tab");
    newNode.setAttribute("data-id", view.id);
    newNode.innerHTML = view.fileName;
    let closeWin = document.createElement("div");
    closeWin.classList.add("deleteTab");
    newNode.appendChild(closeWin);
    this.container.insertBefore(newNode, this.addTab);
    this.selectTab(document.querySelector(`[data-id = ${view.id}]`));
  },

  deleteTab: function (tabItem) {
    let tabID = tabItem.dataset.id;
    controller.deleteTabData(tabID);

    if (tabItem.previousElementSibling) {
      tabItem.previousElementSibling.click();
    }
    else {
      this.addTab.click();
    }

    tabItem.remove();
    viewTabs.showAddTab();

    // remove source manager
     SourceManagers[tabID].ClearSource();
     delete SourceManagers[tabID];
  },

  selectTab: function (selectedTab) {
    let tabID = selectedTab.dataset.id; //get relevant ID from data-id in tab element
    this.unselectAllTabs();
    selectedTab.classList.add("selectedTab");

    // maintain currently active tab
    currentTabId = tabID;
  },

  unselectAllTabs: function () {
    for (tab of this.tabs) {
      tab.classList.remove("selectedTab");
    }
  },

  hideAddTab: function () {
    this.addTab.classList.add("hide");
  },

  showAddTab: function () {
    this.addTab.classList.remove("hide");
  }
}

let viewPanels = {
  init: function () {
    this.addFilesPanel = document.getElementById("addFiles");
    this.panels = document.getElementsByClassName("viewPanel");
  },

  showAddPanel: function () {
    viewPanels.addFilesPanel.classList.remove("hide");
  },

  hideAddPanel: function () {
    var senderElement = event.target;
    if ($(senderElement).is("input")) {
      return;
    }

    showLoadDataForm();
    //document.getElementById("fileInput").click();

    //this.addFilesPanel.classList.add("hide");
  },

  hideAllPanels: function () {
    for (panel of this.panels) {
      panel.classList.add("hide");
    }
  },

  showPanel: function (view) {
    this.hideAllPanels();
    view.classList.remove("hide");
  },

  maxMin: function (selected) {
    let parent = selected.parentNode;
    if (parent.classList.contains("maximize")) {
      parent.classList.remove("maximize");
    } else {
      parent.classList.add("maximize");
    }

    // resize canvas
    if (currentTabId in SourceManagers) {
      SourceManagers[currentTabId].ResizeViewer();
    }
  }
}

controller.init();

// Setup for grab bar controls
let grabBarControl = function (element) {
  var m_pos;
  function resize(event) {
    var previous = element.previousElementSibling;
    var dx = m_pos - event.x;
    m_pos = event.x;
    previous.style.width = previous.offsetWidth - dx + "px";

    // resize canvas
    if (currentTabId in SourceManagers) {
      SourceManagers[currentTabId].ResizeViewer();
    }
  }

  element.addEventListener("mousedown", function (event) {
    m_pos = event.x;
    document.addEventListener("mousemove", resize, false);
  }, false);
  document.addEventListener("mouseup", function () {
    document.removeEventListener("mousemove", resize, false), false
  }
  );
}

let grabBars = document.getElementsByClassName("grabBar");

for (grabBar of grabBars) {
  grabBarControl(grabBar);
}

function cancelReturnHome() {
  var overlay = document.getElementById("returnHomeOverlay");
  var popup = document.getElementById("returnHomePopup");

  overlay.style.display = 'none';
  popup.style.display = 'none';
}

function returnHome() {
  window.location = "landingPage.html";
}

function onHomeClick() {

  var overlay = document.getElementById("returnHomeOverlay");
  var popup = document.getElementById("returnHomePopup");

  overlay.style.display = 'block';
  popup.style.display = 'block';

  popup.style.width = "581px";
  popup.style.height = "155px";
  popup.style.overflow = "hidden";
}

function showBusyIndicator() {
  //document.getElementById("busyIndicator").style.display = "block";
  // show busy loader
  //  var busySpinner = document.getElementById("divLoading");
  //  if (busySpinner !== undefined) {
  //      busySpinner.className = 'show';
  //  }

  var overlay = document.getElementById("busyIndicatorOverlay");
  var popup = document.getElementById("busyIndicatorPopup");

  overlay.style.display = 'block';
  popup.style.display = 'block';

  popup.style.width = "311px";
  popup.style.height = "308px";
}

function hideBusyIndicator() {
  // var busySpinner = document.getElementById("divLoading");
  // busySpinner.classList.remove('show');
  //document.getElementById("busyIndicator").style.display = "none";

  var overlay = document.getElementById("busyIndicatorOverlay");
  var popup = document.getElementById("busyIndicatorPopup");

  overlay.style.display = 'none';
  popup.style.display = 'none';
}


let menu = {

  onProjectsClicked: function () {
    var menu = document.getElementById("menuList");
    menu.style.display = "none";

    var overlay = document.getElementById("returnProjectCenterOverlay");
    var popup = document.getElementById("returnProjectCenterPopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";
  },

  onCheckClicked: function () {
    var menu = document.getElementById("menuList");
    menu.style.display = "none";
  },

  onPREPClicked: function () {
    var menu = document.getElementById("menuList");
    menu.style.display = "none";

    var overlay = document.getElementById("returnPREPOverlay");
    var popup = document.getElementById("returnPREPPopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";
  },

  onHelpClicked: function () {
    var menu = document.getElementById("menuList");
    menu.style.display = "none";
  },

  onSettingsClicked: function () {
    var menu = document.getElementById("menuList");
    menu.style.display = "none";
  },

  onSignOutClicked: function () {
    var menu = document.getElementById("menuList");
    menu.style.display = "none";

    var overlay = document.getElementById("signOutOverlay");
    var popup = document.getElementById("signOutPopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "155px";
    popup.style.overflow = "hidden";
    // if (confirm("You will be signed out.\nAre you sure?")) {
    //    localStorage.removeItem("userinfo");
    //    window.location.href = "index.html";
    // }
  }
}

function cancelReturnProjectCenter() {
  var overlay = document.getElementById("returnProjectCenterOverlay");
  var popup = document.getElementById("returnProjectCenterPopup");

  overlay.style.display = 'none';
  popup.style.display = 'none';
}

function returnProjectCenter() {
  window.location = "projectsPage.html";
}

function cancelReturnPREP() {
  var overlay = document.getElementById("signOutOverlay");
  var popup = document.getElementById("signOutPopup");

  overlay.style.display = 'none';
  popup.style.display = 'none';
}

function returnToPREP() {
  window.location = "prephomepage.html";
}


function cancelSignOut() {
  var overlay = document.getElementById("returnPREPOverlay");
  var popup = document.getElementById("returnPREPPopup");

  overlay.style.display = 'none';
  popup.style.display = 'none';
}

function signOut() {
  onLogoutUser().then(function (status) {
    if (status) {
      window.location.href = "index.html";
    }
  });
}

function showLoadDataForm() {
  var overlay = document.getElementById("loadDataOverlay");
  var popup = document.getElementById("loadDataPopup");

  overlay.style.display = 'block';
  popup.style.display = 'block';

  popup.style.width = "581px";
  popup.style.height = "278px";
  // popup.style.overflow = "hidden";
}

function closeLoadDataForm()
{
    var overlay = document.getElementById("loadDataOverlay");
    var popup = document.getElementById("loadDataPopup");
  
    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function loadDataSet() {
  closeLoadDataForm();

  document.getElementById("uploadDatasourceForm").reset();

  document.getElementById("fileInput").click();

  viewPanels.addFilesPanel.classList.add("hide");
}