//var currentTabId;
var commentsCallout;
var openCallout;
let model = {
  activeTabs: 0,
  selectedTab: [],
  currentView: null,
  currentTabId: null,
  loadSavedCheckspace: false,
  datasetTypes: undefined, // used when loadSavedCheckspace is true. This is an array of loaded dataset types from saved data
  checkcaseSupportedTypes: undefined, // currently used when loadSavedCheckspace is true. This is an array of dataset types supported by selected checkcase
  propertyGroups: {},
  propertyHighlightTemplates: {},
  views: {
    a: {
      id: "a",
      used: false,
      viewPanel: document.getElementById("viewPanelA"),
      tableData: document.getElementById("tableDataA"),
      visualizer: document.getElementById("visualizerA"),
      fileName: "",
      type: undefined,
      complianceSwitchChecked: false,
      displayMenu: null,
      annotationOperator: null,
      annotationOperatorId: null,
      markupViews: {},
      bookmarks: {},
      annotations: {},
      measures: {},
      listView: null,
      groupView: null,
      activeTableView: null,
      tableViewInstance: null,
      tableViewWidget: null,
      dataDefinitionMenu: null,
      userPropertiesForm: null,
      activeMenu: null,
      editUserPropertiesForm: null,
      defineGroupsForm: null,
      isolateManager: null,
      definePropertyHighlightsForm: null,
      activeSelection: "Single Select",
      viewerContextMenu: null
    },
    b: {
      id: "b",
      used: false,
      viewPanel: document.getElementById("viewPanelB"),
      tableData: document.getElementById("tableDataB"),
      visualizer: document.getElementById("visualizerB"),
      fileName: "",
      type: undefined,
      complianceSwitchChecked: false,
      displayMenu: null,
      annotationOperator: null,
      annotationOperatorId: null,
      markupViews: {},
      bookmarks: {},
      annotations: {},
      measures: {},
      listView: null,
      groupView: null,
      activeTableView: null,
      tableViewInstance: null,
      tableViewWidget: null,
      dataDefinitionMenu: null,
      userPropertiesForm: null,
      activeMenu: null,
      editUserPropertiesForm: null,
      defineGroupsForm: null,
      isolateManager: null,
      definePropertyHighlightsForm: null,
      activeSelection: "Single Select",
      viewerContextMenu: null
    },
    c: {
      id: "c",
      used: false,
      viewPanel: document.getElementById("viewPanelC"),
      tableData: document.getElementById("tableDataC"),
      visualizer: document.getElementById("visualizerC"),
      fileName: "",
      type: undefined,
      complianceSwitchChecked: false,
      displayMenu: null,
      annotationOperator: null,
      annotationOperatorId: null,
      markupViews: {},
      bookmarks: {},
      annotations: {},
      measures: {},
      listView: null,
      groupView: null,
      activeTableView: null,
      tableViewInstance: null,
      tableViewWidget: null,
      dataDefinitionMenu: null,
      userPropertiesForm: null,
      activeMenu: null,
      editUserPropertiesForm: null,
      defineGroupsForm: null,
      isolateManager: null,
      definePropertyHighlightsForm: null,
      activeSelection: "Single Select",
      viewerContextMenu: null
    },
    d: {
      id: "d",
      used: false,
      viewPanel: document.getElementById("viewPanelD"),
      tableData: document.getElementById("tableDataD"),
      visualizer: document.getElementById("visualizerD"),
      fileName: "",
      type: undefined,
      complianceSwitchChecked: false,
      displayMenu: null,
      annotationOperator: null,
      annotationOperatorId: null,
      markupViews: {},
      bookmarks: {},
      annotations: {},
      measures: {},
      listView: null,
      groupView: null,
      activeTableView: null,
      tableViewInstance: null,
      tableViewWidget: null,
      dataDefinitionMenu: null,
      userPropertiesForm: null,
      activeMenu: null,
      editUserPropertiesForm: null,
      defineGroupsForm: null,
      isolateManager: null,
      definePropertyHighlightsForm: null,
      activeSelection: "Single Select",
      viewerContextMenu: null
    }
  },
  onDataSourceTabChanged: function (tabID) {
    this.currentTabId = tabID;

    // manage state of compliance switch
    if (this.currentTabId in this.views) {
      var complianceSwitch = document.getElementById("complianceSwitch");
      complianceSwitch.checked = this.views[this.currentTabId].complianceSwitchChecked;
    }

    if (this.currentTabId in SourceManagers) {
      SourceManagers[this.currentTabId].ResizeViewer();
    }

    // // manage list view speed dial action menus
    // for (var srcId in SourceManagers) {
    //   if (!SourceManagers[srcId].Is3DSource()) {
    //     continue;
    //   }

    //   if (srcId === this.currentTabId) {
    //     SourceManagers[srcId].ShowListViewFloatingMenu(true);
    //   }
    //   else {
    //     SourceManagers[srcId].ShowListViewFloatingMenu(false);
    //   }
    // }
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
    // const table = addedFile.tableData; //NOTE FOR PROTOTECH - This will select the 'table' for this particular panel
    // const visualizer = addedFile.visualizer; //NOTE FOR PROTOTECH - This will select the 'vizualizer' for this particular panel
    // model.activeTabs++;
    //FOR PROTOTECH - SET FILENAME FOR TAB BELOW
    addedFile.fileName = fileName;
    addedFile.type = xCheckStudio.Util.getFileExtension(fileName.toLowerCase());

    // SET FILENAME FOR TAB ABOVE
    addedFile.used = true;
    model.activeTabs++;

    // hide add new source tab
    if ((model.loadSavedCheckspace &&
      model.checkcaseSupportedTypes &&
      model.checkcaseSupportedTypes.length === model.activeTabs) ||
      model.activeTabs >= 4) {
      viewTabs.hideAddTab();
    }

    return addedFile;
  },

  //clears data from deleted tab
  //NOTE TO PROTOTECH - MAY BE USED TO REMOVE MORE DATA FROM THE MODEL.VIEW IF PROVIDED IN addNewFile
  deleteTabData: function (id) {
    let tab = model.views[id];
    tab.fileName = "";
    tab.type = undefined;
    tab.used = false;
    tab.complianceSwitchChecked = false;
  },

  selectView: function (id) {
    let changeViewTo = model.views[id];

    if (!viewPanels.addFilesPanel.classList.contains("hide") &&
      changeViewTo.fileName !== "") {
      viewPanels.addFilesPanel.classList.add("hide");
    }
    else if (viewPanels.addFilesPanel.classList.contains("hide") &&
      changeViewTo.fileName == "") {
      viewPanels.addFilesPanel.classList.remove("hide");
    }

    viewPanels.showPanel(changeViewTo.viewPanel);
  }
}

let viewTabs = {
  tabToDelete: undefined,
  init: function () {
    this.container = document.getElementById("tabContainer");
    this.addTab = document.getElementById("addTab");
    this.tabs = document.getElementsByClassName("tab");   
    this.container.addEventListener("click", function () {
      let deleteTab = event.target.closest('.deleteTab');
      let changeTab = event.target.closest('.tab');
      let addTab = event.target.closest('.addTab');
      if (deleteTab) {
        viewTabs.tabToDelete = deleteTab.parentNode;
        viewTabs.onClearDataSource();
        // viewTabs.deleteTab(deleteTab.parentNode);
      } else if (changeTab) {
        controller.selectView(changeTab.dataset.id);
        viewTabs.selectTab(changeTab);
      }
      else if(addTab){
        model.currentTabId = null;

        // // hide all list view speed dial action menus
        // for (var srcId in SourceManagers) {
        //   if (!SourceManagers[srcId].Is3DSource()) {
        //     continue;
        //   }
        //   SourceManagers[srcId].ShowListViewFloatingMenu(false);
        // }

        return
      };
    })

    this.addTab.addEventListener("click", viewPanels.showAddPanel);
  },

  createTab: function (view) {
    let newNode = document.createElement("div");
    newNode.id = "tab_" + view.id;
    newNode.classList.add("tab");
    newNode.setAttribute("data-id", view.id);
    newNode.classList.add("tooltipHov");

    // create text span
    var spanText = document.createElement("span");
    spanText.innerHTML = xCheckStudio.Util.getFileNameWithoutExtension(view.fileName);
    spanText.style.overflow = "hidden";
    spanText.style.textOverflow = "ellipsis"
    newNode.appendChild(spanText);

    var spanTextExtension = document.createElement("span");
    var extension = ".";
    spanTextExtension.innerHTML = extension.concat(xCheckStudio.Util.getFileExtension(view.fileName));
    spanTextExtension.style.overflow = "none";
    newNode.appendChild(spanTextExtension);

    // create tool-tip
    var spanTooltip = document.createElement("span");
    spanTooltip.setAttribute("data-tooltip", view.fileName);
    spanTooltip.style.textAlign = "center";
    spanTooltip.classList.add("tooltip");
    newNode.appendChild(spanTooltip);

    // spanText.onmouseover = function()
    // {
    //   spanTooltip.style.display = "block";
    // }

    // spanText.onmouseleave = function()
    // {
    //   spanTooltip.style.display = "none";
    // }
    // let tooltipNode = document.createElement("div");
    // tooltipNode.id = "tooltip" + view.id;
    // tooltipNode.innerText = view.fileName;
    // newNode.appendChild(tooltipNode);
    // $("#tooltip" + view.id).dxTooltip({
    //   target: "#" + newNode.id,
    //   showEvent: "mouseenter",
    //   hideEvent: "mouseleave",
    //   closeOnOutsideClick: false
    // });



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
      tabItem.remove();
    }
    else if (tabItem.nextElementSibling && tabItem.nextElementSibling.classList.contains("tab")) {
      tabItem.nextElementSibling.click();
      tabItem.remove();
    }
    else {
      // this.addTab.click();
      tabItem.remove();
      viewPanels.addFilesPanel.classList.remove("hide");
    }

    // tabItem.remove();
    viewTabs.showAddTab();

    // remove source manager
    SourceManagers[tabID].ClearSource();
    delete SourceManagers[tabID];

    model.activeTabs--;
  },

  selectTab: function (selectedTab) {
    let tabID = selectedTab.dataset.id; //get relevant ID from data-id in tab element
    this.unselectAllTabs();
    selectedTab.classList.add("selectedTab");

    // maintain currently active tab
    model.onDataSourceTabChanged(tabID);
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
  },

  onClearDataSource: function () {
    var overlay = document.getElementById("uiBlockingOverlay");
    var popup = document.getElementById("clearDataSourcePopup");

    overlay.style.display = 'block';
    popup.style.display = 'block';

    popup.style.width = "581px";
    popup.style.height = "154px";

    popup.style.top = ((window.innerHeight / 2) - 139) + "px";
    popup.style.left = ((window.innerWidth / 2) - 290) + "px";
  }
}

let viewPanels = {
  init: function () {
    this.addFilesPanel = document.getElementById("addFiles");
    this.panels = document.getElementsByClassName("viewPanel");
  },

  showAddPanel: function () {
    viewTabs.unselectAllTabs();
    viewTabs.addTab.classList.add("selectedTab");
    viewPanels.addFilesPanel.classList.remove("hide");
  },


  hideAddPanel: function () {
    var senderElement = event.target;
    if (senderElement.id == "plusFileButtonId" ||
      senderElement.parentElement.id == "plusFileButtonId") {
      showLoadDataForm();
    }


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
    if (model.currentTabId in SourceManagers) {
      SourceManagers[model.currentTabId].ResizeViewer();
    }
  },

  onMouseOverMaxMin: function (selected) {
    selected.style.opacity = 1;
  },

  onMouseOutMaxMin: function (selected) {
    selected.style.opacity = 0.2;
  },

  onMouseOverCalloutBtn: function (selected) {
    selected.style.opacity = 1;
  },

  onMouseOutCalloutBtn: function (selected) {
    selected.style.opacity = 0.2;
  },

  onMouseOverPropertyCallout: function (id) {
    document.getElementById("propertyCalloutContainer" + id).style.opacity = 1;
    document.getElementById("propertyCalloutNameBar" + id).style.opacity = 1;
  },

  onMouseOutPropertyCallout: function (id) {
    document.getElementById("propertyCalloutContainer" + id).style.opacity = 0.6;
    document.getElementById("propertyCalloutNameBar" + id).style.opacity = 0.6;
  },

  onMouseOverCommentsCallout: function () {
    document.getElementById("commentsCalloutContainer").style.opacity = 1;
    document.getElementById("commentsCalloutNameBar").style.opacity = 1;
  },

  onMouseOutCommentsCallout: function () {
    document.getElementById("commentsCalloutContainer").style.opacity = 0.6;
    document.getElementById("commentsCalloutNameBar").style.opacity = 0.6;
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
    if (model.currentTabId in SourceManagers) {
      SourceManagers[model.currentTabId].ResizeViewer();
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


function showLoadDataForm() {
  var overlay = document.getElementById("uiBlockingOverlay");
  var popup = document.getElementById("loadDataPopup");

  overlay.style.display = 'block';
  popup.style.display = 'block';

  popup.style.width = "581px";
  popup.style.height = "278px";

  popup.style.top = ((window.innerHeight / 2) - 139) + "px";
  popup.style.left = ((window.innerWidth / 2) - 290) + "px";

  // popup.style.overflow = "hidden";
}

function closeLoadDataForm() {
  var overlay = document.getElementById("uiBlockingOverlay");
  var popup = document.getElementById("loadDataPopup");

  overlay.style.display = 'none';
  popup.style.display = 'none';
}

function loadDataSet() {
  document.getElementById("uploadDatasourceForm").reset();

  // document.getElementById("file-uploader").click();
  var fileUploader = $('#file-uploader').dxFileUploader('instance');
  fileUploader._isCustomClickEvent = true;
  fileUploader._$fileInput.click();

  closeLoadDataForm();

  // viewPanels.addFilesPanel.classList.add("hide");
}

function onComplianceSwitchStateChanged(checkBox) {
  if (!model.currentTabId ||
    !model.currentTabId in model.views) {
    return;
  }

  model.views[model.currentTabId].complianceSwitchChecked = checkBox.checked;
}

function cancelClearDataSource() {
  hideClearDataSourceForm();
}

function clearDataSource() {
  if (!viewTabs.tabToDelete) {
    hideClearDataSourceForm();
    return;
  }

  if (isDataVault()) {
    removeTempDataFromVault().then(function(status){
       viewTabs.deleteTab(viewTabs.tabToDelete);
       hideClearDataSourceForm();
    });
  }
  else {
    removeDataSourceFromDB().then(function (result) {
      removeSourceFilesFromDirectory().then(function (result) {
        //var tabToDelete = document.getElementById("tab_" + model.currentTabId)
        viewTabs.deleteTab(viewTabs.tabToDelete);

        // filter checkcases again
        checkCaseFilesData.FilteredCheckCaseDataList = [];
        filterCheckCases(false);

        hideClearDataSourceForm();
      })
    });
  }
}

function removeTempDataFromVault() {
  return new Promise((resolve) => {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));

    $.ajax({
      url: 'PHP/DataVault.php',
      type: "POST",
      async: false,
      data:
      {
        'InvokeFunction': "ClearTempVaultData",
        'ProjectName': projectinfo.projectname,
        'SrcId': model.currentTabId
      },
      success: function (msg) {
        return resolve(true);
      }
    });

  });
}

function removeSourceFilesFromDirectory() {
  return new Promise((resolve) => {
    // clean up all temporary files and variables
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    var tabId = viewTabs.tabToDelete.getAttribute("data-id");
    $.ajax({
      url: 'PHP/ProjectManager.php',
      type: "POST",
      async: false,
      data:
      {
        'InvokeFunction': "RemoveSourceFromDirecory",
        'ProjectName': projectinfo.projectname,
        'CheckName': checkinfo.checkname,
        'SourceId': tabId
      },
      success: function (msg) {
        return resolve(true);
      }
    });
  });
}


function hideClearDataSourceForm() {
  viewTabs.tabToDelete = undefined;

  var overlay = document.getElementById("uiBlockingOverlay");
  var popup = document.getElementById("clearDataSourcePopup");

  overlay.style.display = 'none';
  popup.style.display = 'none';
}

function removeDataSourceFromDB() {
  return new Promise((resolve) => {
    // clean up all temporary files and variables
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    var tabId = viewTabs.tabToDelete.getAttribute("data-id");

    $.ajax({
      url: 'PHP/ProjectManager.php',
      type: "POST",
      async: false,
      data:
      {
        'InvokeFunction': "RemoveSource",
        'ProjectName': projectinfo.projectname,
        'CheckName': checkinfo.checkname,
        'SourceId': tabId
      },
      success: function (msg) {
        return resolve(true);
      }
    });
  });
}

function browseInVault() {
  DataVault.show();

  closeLoadDataForm();
}