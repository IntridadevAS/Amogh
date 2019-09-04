let model = {
  selectedComparisons: [],
  selectedCompliance: "",
  defaultView: "compliance",
  currentView: null,
  files: {
    // for testing only, delete below after controller.populateFiles is complete
    // a:{
    //   id:"a",
    //   compliance: false,
    //   fileName: "exampleA.wtvr"
    // },
    // b:{
    //   id:"b",
    //   compliance: true,
    //   fileName: "exampleB.wtvr"
    // },
    // c:{
    //   id:"c",
    //   compliance: false,
    //   fileName: "exampleC.wtvr"
    // },
    // d:{
    //   id:"d",
    //   compliance: false,
    //   fileName: "exampleD.wtvr"
    // }
    // for testing only, delete above after controller.populateFiles is complete
  }
}

let controller = {
  init: function () {
    viewTabs.init();
    viewPanels.init();
    this.comparisonCompliance();
    this.populateFiles();
  },

  populateFiles: function () {
    // TODO - PROTOTECH
    // fill in model.files in the format above.
    // Do not populate for files not selected (ie if there are 3 files, a,b,c ONLY should be present)
    // model.files = {};
  },

  comparisonCompliance: function () {
    // TODO - PROTOTECH
    // Set compliance/comparison.
    // If review does not feature either comparison or compliance, set that to false
    let compliance = true;
    let comparison = true;
    if (comparison == false) {
      viewTabs.removeTab("comparison");
    }
    if (compliance == false) {
      viewTabs.removeTab("compliance");
    }
  },

  selectView: function (selectedTab) {
    let tabID = selectedTab.dataset.id;
    viewTabs.selectTab(selectedTab);
    if (tabID === 'comparison') {
      viewPanels.showComparison();
    } else if (tabID === 'compliance') {
      viewPanels.showCompliance();
    }
  }
}

let viewTabs = {
  init: function () {
    this.container = document.getElementById("tabContainer");
    this.tabs = document.getElementsByClassName("tab");
    this.comparisonTab = document.getElementById("comparisonTab");
    this.complianceTab = document.getElementById("complianceTab");
    this.comparisonArrow = document.getElementById("comparisonArrow");
    this.complianceArrow = document.getElementById("complianceArrow");
    this.selectFiles = document.getElementById("selectFiles");

    this.container.addEventListener("click", function () {
      let changeTab = event.target.closest('.tab');
      if (changeTab) {
        controller.selectView(changeTab);
      } else { return };
    });

    this.comparisonArrow.addEventListener("click", function (event) {
      viewTabs.complianceArrow.classList.remove("invert");
      if (event.target.classList.contains("invert")) {
        event.target.classList.remove("invert");
        viewTabs.closeSelectFiles();
      } else {
        event.target.classList.add("invert");
        viewTabs.populateComparisons();
      }
    });

    this.complianceArrow.addEventListener("click", function (event) {
      viewTabs.comparisonArrow.classList.remove("invert");
      if (event.target.classList.contains("invert")) {
        event.target.classList.remove("invert");
        viewTabs.closeSelectFiles();
      } else {
        event.target.classList.add("invert");
        viewTabs.populateCompliances();
      }
    });

  },

  selectTab: function (selectedTab) {
    this.unselectAllTabs();
    selectedTab.classList.add("selectedTab");
  },

  unselectAllTabs: function () {
    for (tab of this.tabs) {
      tab.classList.remove("selectedTab");
    }
  },

  removeTab: function (tab) {
    if (tab == "comparison") {
      this.comparisonTab.remove();
    } else if (tab == "compliance") {
      this.complianceTab.remove();
    } else {
      return;
    }
  },

  makeCard: function (file) {
    let newComparisonCard = document.createElement('DIV');
    newComparisonCard.classList.add('fileCard');
    newComparisonCard.innerHTML = file.fileName;
    newComparisonCard.id = file.id;

    newComparisonCard.setAttribute("onclick", "viewTabs.selectSourceForComparison()");

    return newComparisonCard;
  },

  openSelectFiles: function () {
    this.selectFiles.classList.add("selectFilesContainerOpen");
    this.clearSelectFiles();
  },

  closeSelectFiles: function () {
    this.selectFiles.classList.remove("selectFilesContainerOpen");
    this.clearSelectFiles();
  },

  clearSelectFiles: function () {
    this.selectFiles.innerHTML = "";
  },

  populateComparisons: function () {
    this.openSelectFiles();
    for (file of Object.values(model.files)) {
      let newCard = this.makeCard(file);
      this.selectFiles.appendChild(newCard);
    };

    let enterBtn = document.createElement("div");
    enterBtn.classList.add("enterBtn");
    enterBtn.setAttribute("onclick", "viewTabs.enterComparison()");
    this.selectFiles.appendChild(enterBtn);
  },

  enterComparison: function () {
    // TODO set enter functionality for comparison here
    var requiredComparison;
    for (var i = 0; i < comparisons.length; i++) {
      var comparison = comparisons[i];

      if (comparison.sources.length != model.selectedComparisons.length) {
        continue;
      }

      var validComparison = false;
      for (var j = 0; j < model.selectedComparisons.length; j++) {
        var selectedComparison = model.selectedComparisons[i];
        if (!comparison.sources.includes(selectedComparison.fileName)) {
          validComparison = false;
          break;
        }

        validComparison = true;
      }

      if (validComparison) {
        requiredComparison = comparison;
        break;
      }
    }

    if (requiredComparison) {
      // populate check results
      populateCheckResults(requiredComparison,
        undefined,
        undefined,
        sourceAComparisonHierarchy,
        sourceBComparisonHierarchy,
        undefined,
        undefined);
    }

    // close select files UI
    viewTabs.closeSelectFiles();
  },

  populateCompliances: function () {
    this.openSelectFiles();
    for (file of Object.values(model.files)) {
      if (file.compliance) {
        let newCard = this.makeCard(file);
        this.selectFiles.appendChild(newCard);
      };
    }
    let enterBtn = document.createElement("div");
    enterBtn.classList.add("enterBtn");
    enterBtn.setAttribute("onclick", "viewTabs.enterCompliance()");
    this.selectFiles.appendChild(enterBtn);
  },

  enterCompliance: function () {
    // TODO set enter functionality for compliance here
  },

  selectSourceForComparison: function () {
    var source = model.files[event.target.id];
    if (!model.selectedComparisons.includes(source)) {
      model.selectedComparisons.push(source);

      event.target.style.borderColor = '#15b9f9';
    }
    else {
      var index = model.selectedComparisons.indexOf(source);
      if (index != -1) {
        model.selectedComparisons.splice(index, 1);
      }

      event.target.style.removeProperty('border');
    }
  }
}

let viewPanels = {
  init: function () {
    this.comparison = document.getElementById("viewPanelComparison");
    this.compliance = document.getElementById("viewPanelCompliance");
    this.panels = document.getElementsByClassName("viewPanel");
  },

  showComparison: function () {
    this.comparison.classList.remove("hide");
    this.compliance.classList.add("hide");
  },

  showCompliance: function () {
    this.compliance.classList.remove("hide");
    this.comparison.classList.add("hide");
  },

  toggleDetailInfo: function (element) {
    // let tableContainer = element.closest(".tableContainer");
    // tableContainer.classList.toggle("showDetailInfo");
    // element.classList.toggle("invert");

    let tableContainer = element.closest(".infoArea");
    tableContainer.classList.toggle("openInfoArea");
    element.classList.toggle("invert");
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
