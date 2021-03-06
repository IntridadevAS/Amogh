var commentsCallout;
var openCallout;
let model = {
  selectedComparisons: [],
  selectedCompliance: "",
  //defaultView: "compliance",
  currentView: null,
  currentCheck: "comparison",
  checks: {
    "comparison": {
      reviewManager: null,
      reviewTable: null,
      detailedInfoTable: null,
      sourceAViewer: null,
      sourceBViewer: null,
      sourceCViewer: null,
      sourceDViewer: null,
      selectionManager: null,
      modelBrowsers: {},    
      measures: {
        a: {},
        b: {},
        c: {},
        d: {}
      },
      annotationOperator : null,      
      annotationOperatorId : null,
      menus: {
        a: {},
        b: {},
        c: {},
        d: {},
      },
      viewsOpen: false,
      measuresOpen : false,
      isViewsOpen: function () {
        return this.viewsOpen;
      },
      isMeasuresOpen: function () {
        return this.measuresOpen;
      },
      resizeViewers: function () {
        if (this.reviewManager) {
          if (this.sourceAViewer) {
            this.sourceAViewer.ResizeViewer();
          }
          if (this.sourceBViewer) {
            this.sourceBViewer.ResizeViewer();
          }
          if (this.sourceCViewer) {
            this.sourceCViewer.ResizeViewer();
          }
          if (this.sourceDViewer) {
            this.sourceDViewer.ResizeViewer();
          }
        }
        else {
          for (var browser in this.modelBrowsers) {
            this.modelBrowsers[browser]["viewer"].ResizeViewer();
          }
        }
      },
      updateAccordionDimensions: function () {
        if (this.reviewManager ||
          Object.keys(this.modelBrowsers).length > 0) {
          $("#" + Comparison.MainReviewContainer).dxAccordion("instance").updateDimensions()
        }
      }
    },
    "compliance": {
      reviewManager: null,
      reviewTable: null,
      detailedInfoTable: null,
      viewer: null,
      selectionManager: null,
      modelBrowsers: {},
      // markupViews: { a: {} },
      // bookmarks: { a: {} },
      // annotations: { a: {} },
      measures: { a: {} },
      annotationOperator : null,      
      annotationOperatorId : null,  
      menus: {
        a: {}
      },
      viewsOpen: false,
      measuresOpen : false,
      isViewsOpen: function () {
        return this.viewsOpen;
      },
      isMeasuresOpen: function () {
        return this.measuresOpen;
      },
      resizeViewers: function () {
        if (this.reviewManager) {
          if (this.viewer) {
            this.viewer.ResizeViewer();
          }
        }
        else {
          for (var browser in this.modelBrowsers) {
            this.modelBrowsers[browser]["viewer"].ResizeViewer();
          }
        }
      },
      updateAccordionDimensions: function () {
        if (this.reviewManager ||
          Object.keys(this.modelBrowsers).length > 0) {
          $("#" + Compliance.MainReviewContainer).dxAccordion("instance").updateDimensions()
        }
      }
    }
  },
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
  },
  markupViews: {
    "comparison": {
      a: {},
      b: {},
      c: {},
      d: {}
    },
    "compliance": {
      a: {},
      b: {},
      c: {},
      d: {}
    },
  },
  bookmarks: {
    "comparison": {
      a: {},
      b: {},
      c: {},
      d: {}
    },
    "compliance": {
      a: {},
      b: {},
      c: {},
      d: {}
    },
  },
  annotations: {
    "comparison": {
      a: {},
      b: {},
      c: {},
      d: {}
    },
    "compliance": {
      a: {},
      b: {},
      c: {},
      d: {}
    },
  },
  getCurrentReviewManager: function () {
    return this.checks[this.currentCheck]["reviewManager"];
  },
  getCurrentSelectionManager: function () {
    return this.checks[this.currentCheck]["selectionManager"];
  },
  getCurrentReviewType: function () {
    return this.currentCheck;
  },
  getCurrentReviewTable: function () {
    return this.checks[model.currentCheck]["reviewTable"];
  },
  getCurrentDetailedInfoTable: function () {
    return this.checks[model.currentCheck]["detailedInfoTable"];
  },
  getModelBrowsers: function () {
    return this.checks[model.currentCheck]["modelBrowsers"];
  },
  getModelBrowser: function (sourceName) {
    var browsers = this.getModelBrowsers();
    if (sourceName in browsers) {
      return browsers[sourceName];
    }

    return undefined;
  },
  getCurrentResultViewer: function (sourceName) {
    var reviewManager = this.getCurrentReviewManager();
    if (reviewManager) {
      return reviewManager;
    }

    var browsers = this.getModelBrowsers();
    if (sourceName in browsers) {
      return browsers[sourceName];
    }

    return undefined;
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
        // close of select files prompt is open
        if (changeTab.id === "comparisonTab" &&
          viewTabs.complianceArrow.classList.contains("invert")) {
          viewTabs.complianceArrow.click();
        }
        else if (changeTab.id === "complianceTab" &&
          viewTabs.comparisonArrow.classList.contains("invert")) {
          viewTabs.comparisonArrow.click();
        }

        controller.selectView(changeTab);
      } else { return };
    });

    this.comparisonArrow.addEventListener("click", function (event) {    
      if (viewTabs.complianceArrow.classList.contains("invert")) {
        viewTabs.complianceArrow.click();
      }

      if (!("Comparisons" in checkResults)) {
        return;
      }      
      if (event.target.classList.contains("invert")) {
        event.target.classList.remove("invert");
        viewTabs.closeSelectFiles();
      } else {
        event.target.classList.add("invert");
        viewTabs.populateComparisons();
      }
    });

    this.complianceArrow.addEventListener("click", function (event) { 
      if (viewTabs.comparisonArrow.classList.contains("invert")) {
        viewTabs.comparisonArrow.click();
      }

      if (!("Compliances" in checkResults)) {
        return;
      } 
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

  makeCardForComparison: function (file) {
    let newComparisonCard = document.createElement('DIV');
    newComparisonCard.classList.add('fileCard');
    newComparisonCard.innerHTML = file.fileName;
    newComparisonCard.id = file.id;

    newComparisonCard.setAttribute("onclick", "viewTabs.selectSourceForComparison()");

    for (var i = 0; i < model.selectedComparisons.length; i++) {
      if (model.selectedComparisons[i].id == file.id) {
        newComparisonCard.classList.add("fileCardSelected");
      }
    }

    return newComparisonCard;
  },

  makeCardForCompliance: function (file) {
    let newComplianceCard = document.createElement('DIV');
    newComplianceCard.classList.add('fileCard');
    newComplianceCard.innerHTML = file.fileName;
    newComplianceCard.id = file.id;

    if (model.selectedCompliance != null && model.selectedCompliance.id == file.id) {
      newComplianceCard.classList.add("fileCardSelected");
    }
    newComplianceCard.setAttribute("onclick", "viewTabs.selectSourceForCompliance()");

    return newComplianceCard;
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
      let newCard = this.makeCardForComparison(file);
      this.selectFiles.appendChild(newCard);
    };

    let enterComparisonBtn = document.createElement("div");
    enterComparisonBtn.classList.add("enterBtn");


    var browserImg = document.createElement("img");
    browserImg.src = "public/symbols/Model Explorer Icon.svg";
    browserImg.classList.add("ModelExplorerViewBtn");

    browserImg.setAttribute("onclick", "viewTabs.enterComparisonBrowser()");
    enterComparisonBtn.appendChild(browserImg);

    reviewTableImg = document.createElement("img");
    reviewTableImg.src = "public/symbols/FlatView.svg";
    reviewTableImg.classList.add("flatViewBtn");
    // reviewTableImg.style.position = "relative";
    // reviewTableImg.style.width = "25px";
    // reviewTableImg.style.height = "25px";
    // reviewTableImg.style.top = "24px";
    reviewTableImg.setAttribute("onclick", "viewTabs.enterComparison()");
    enterComparisonBtn.appendChild(reviewTableImg);

    this.selectFiles.appendChild(enterComparisonBtn);
  },

  enterComparison: function () {
    showBusyIndicator();
    // clear earlier data
    setTimeout(function () {
    clearData();

    // TODO set enter functionality for comparison here
    var requiredComparison = viewTabs.getComparison();

    if (requiredComparison) {
      // populate check results
      populateCheckResults(requiredComparison,
        undefined,
        sourceAComparisonHierarchy,
        sourceBComparisonHierarchy,
        sourceCComparisonHierarchy,
        sourceDComparisonHierarchy);

    }

    // close select files UI
    viewTabs.closeSelectFiles();
    hideBusyIndicator();
  }, 1000);
  },

  enterComparisonBrowser: function () {
    // clear earlier data
    clearData();

    var requiredComparison = viewTabs.getComparison();

    if (requiredComparison) {
      populateComparisonModelBrowser(requiredComparison);
    }

    // close select files UI
    viewTabs.closeSelectFiles();
  },

  getComparison: function () {
    if (!comparisons) {
      return null;
    }

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
        return comparison;
      }
    }

    return undefined;
  },

  populateCompliances: function () {
    // model.selectedCompliance = null;

    this.openSelectFiles();
    for (file of Object.values(model.files)) {
      if (file.compliance) {
        let newCard = this.makeCardForCompliance(file);
        this.selectFiles.appendChild(newCard);
      };
    }

    let enterComparisonBtn = document.createElement("div");
    enterComparisonBtn.classList.add("enterBtn");

    var browserImg = document.createElement("img");
    browserImg.src = "public/symbols/Model Explorer Icon.svg";
    browserImg.classList.add("ModelExplorerViewBtn");
    browserImg.setAttribute("onclick", "viewTabs.enterComplianceBrowser()");
    enterComparisonBtn.appendChild(browserImg);

    reviewTableImg = document.createElement("img");
    reviewTableImg.src = "public/symbols/FlatView.svg";
    reviewTableImg.classList.add("flatViewBtn");
    // reviewTableImg.style.position = "relative";
    // reviewTableImg.style.width = "25px";
    // reviewTableImg.style.height = "25px";
    // reviewTableImg.style.top = "24px";
    reviewTableImg.setAttribute("onclick", "viewTabs.enterCompliance()");
    enterComparisonBtn.appendChild(reviewTableImg);

    this.selectFiles.appendChild(enterComparisonBtn);
  },

  enterCompliance: function () {
    if (!compliances ||
      !model.selectedCompliance) {
      return;
    }
    showBusyIndicator();
    setTimeout(function () {
    // clear earlier data
    clearData();

    // get src index
    let srcId = model.selectedCompliance.id;
    let index = srcId === "a" ? 0 : (srcId === "b" ? 1 : (srcId === "c" ? 2 : (srcId === "d" ? 3 : null)));
    if (index === null) {
      return;
    }
    
    for(var i =0; i < compliances.length; i++)
    {
      var compliance = compliances[i];
      if(compliance.source === model.selectedCompliance.fileName &&
          compliance.sourceId === model.selectedCompliance.id)
          {
            // populate check results
            populateCheckResults(undefined,
              compliance,
              undefined,
              undefined,
              undefined,
              undefined,
              model.selectedCompliance.id);
            break;
          }
    }

    // var compliance = compliances[index];
    // if (compliance.source === model.selectedCompliance.fileName) {

    //   // populate check results
    //   populateCheckResults(undefined,
    //     compliance,
    //     undefined,
    //     undefined,
    //     undefined,
    //     undefined,
    //     model.selectedCompliance.id);

    //   // break;
    // }
    

    // close select files UI
    viewTabs.closeSelectFiles();
    hideBusyIndicator();
  }, 1000);
  },

  enterComplianceBrowser: function () {
    if (!model.selectedCompliance) {
      return;
    }

    // clear earlier data
    clearData();

    // get src index
    let srcId = model.selectedCompliance.id;
    let index = srcId === "a" ? 0 : (srcId === "b" ? 1 : (srcId === "c" ? 2 : (srcId === "d" ? 3 : null)));
    if (index === null) {
      return;
    }

    // for (var i = 0; i < compliances.length; i++) {
    var compliance = compliances[index];
    if (compliance.source === model.selectedCompliance.fileName) {

      // populate check results
      populateComplianceModelBrowser(compliance);

      // break;
    }
    // }

    // close select files UI
    viewTabs.closeSelectFiles();
  },

  selectSourceForComparison: function () {
    var source = model.files[event.target.id];
    if (!model.selectedComparisons.includes(source)) {
      model.selectedComparisons.push(source);

      event.target.classList.add("fileCardSelected");
    }
    else {
      var index = model.selectedComparisons.indexOf(source);
      if (index != -1) {
        model.selectedComparisons.splice(index, 1);
      }

      event.target.classList.remove("fileCardSelected");
    }
  },

  selectSourceForCompliance: function () {
    // remove background color of previously selected card, 
    // as only one source/file/card can be selected at a time
    var source = model.files[event.target.id];
    if (model.selectedCompliance !== source) {

      if (model.selectedCompliance != "") {
        document.getElementById(model.selectedCompliance.id).classList.remove("fileCardSelected");
      }
      model.selectedCompliance = source;
      event.target.classList.add("fileCardSelected");

    }
    else {
      model.selectedCompliance = "";
      event.target.classList.remove("fileCardSelected");
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

    // set current view
    model.currentView = comparisonReviewManager;
    model.currentCheck = "comparison";
  },

  showCompliance: function () {
    this.compliance.classList.remove("hide");
    this.comparison.classList.add("hide");

    // set current view
    model.currentView = complianceReviewManager;
    model.currentCheck = "compliance";
  },

  toggleDetailInfo: function (element) {
    let tableContainer = element.closest(".infoArea");
    tableContainer.classList.toggle("openInfoArea");
    element.classList.toggle("invert");

    if (tableContainer.classList.contains("openInfoArea")) {
      tableContainer.style.height = tableContainer.offsetParent.offsetHeight / 2 + "px";
    }
    else {
      tableContainer.style.height = "40px";
    }
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

      if (model.currentCheck === "comparison") {
        document.getElementById("tableDataComparison").classList.remove("hide");
      }
      else if (model.currentCheck === "compliance") {
        document.getElementById("tableDataCompliance").classList.remove("hide");
      }
    } else {
      parent.classList.add("maximize");

      if (model.currentCheck === "comparison") {
        document.getElementById("tableDataComparison").classList.add("hide");
      }
      else if (model.currentCheck === "compliance") {
        document.getElementById("tableDataCompliance").classList.add("hide");
      }
    }

    // resize 3D viewer
    model.checks[model.currentCheck].resizeViewers();
    model.checks[model.currentCheck].updateAccordionDimensions();
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

  onMouseOverPropertyCallout: function (checkType) {
    document.getElementById("propertyCalloutNameBar" + checkType).style.opacity = 1;
    document.getElementById("propertyCalloutContainer" + checkType).style.opacity = 1;

    if (checkType === 'comparison') {
      document.getElementById("propertyCalloutStatusBar" + checkType).style.opacity = 1;
    }
  },

  onMouseOutPropertyCallout: function (checkType) {
    document.getElementById("propertyCalloutNameBar" + checkType).style.opacity = 0.6;
    document.getElementById("propertyCalloutContainer" + checkType).style.opacity = 0.6;

    if (checkType === 'comparison') {
      document.getElementById("propertyCalloutStatusBar" + checkType).style.opacity = 0.6;
    }
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

    // resize 3D viewer   
    model.checks[model.currentCheck].resizeViewers();
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

function clearData() {
  var currentCheckData = model.checks[model.currentCheck];
  if (currentCheckData["reviewTable"]) {
    currentCheckData["reviewTable"].Destroy();
    currentCheckData["reviewTable"] = null;
  }

  if (currentCheckData["detailedInfoTable"]) {
    currentCheckData["detailedInfoTable"].Destroy();
    currentCheckData["detailedInfoTable"] = null;
  }

  // serialize views and tags
  if (currentCheckData["reviewManager"]) {    
    currentCheckData["reviewManager"].SerializeViewsAndTags(true);
  }
  currentCheckData["reviewManager"] = null;

  var modelBrowsers = model.getModelBrowsers();

  if (modelBrowsers) {
    for (var src in modelBrowsers) {
      modelBrowsers[src]["browser"].Destroy();
    }

    currentCheckData["modelBrowsers"] = {};
  }

  if (model.currentCheck === "comparison") {
    if (currentCheckData["sourceAViewer"]) {
      currentCheckData["sourceAViewer"].Destroy(Comparison.ViewerAContainer);
      currentCheckData["sourceAViewer"] = null;
    }
    if (currentCheckData["sourceBViewer"]) {
      currentCheckData["sourceBViewer"].Destroy(Comparison.ViewerBContainer);
      currentCheckData["sourceBViewer"] = null;
    }
    if (currentCheckData["sourceCViewer"]) {
      currentCheckData["sourceCViewer"].Destroy(Comparison.ViewerCContainer);
      currentCheckData["sourceCViewer"] = null;
    }
    if (currentCheckData["sourceDViewer"]) {
      currentCheckData["sourceDViewer"].Destroy(Comparison.ViewerDContainer);
      currentCheckData["sourceDViewer"] = null;
    }
  }
  else if (model.currentCheck === "compliance") {
    if (currentCheckData["viewer"]) {      
      currentCheckData["viewer"].Destroy(Compliance.ViewerContainer);
      currentCheckData["viewer"] = null;
    }
  }

  // Close open hovering machine
  closeAnyOpenMenu();  
}

function getDataSourceOrderInCheckcase() {
  var dataSourceOrderInCheckCase = {};

  var checkCaseData = xCheckStudio.Util.tryJsonParse(checkResults.checkcaseInfo.checkCaseData);
  var sourceTypesFromCheckCase = checkCaseData.CheckCase.SourceTypes;

  var sourcesTraversed = [];
  if ("sourceAType" in checkResults.sourceInfo &&
    checkResults.sourceInfo["sourceAType"]) {

    if ('sourceA' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceA') &&
      sourceTypesFromCheckCase['sourceA'].toLowerCase() === checkResults.sourceInfo["sourceAType"].toLowerCase()) {
      dataSourceOrderInCheckCase["a"] = 1;
      sourcesTraversed.push('sourceA');
    }
    else if ('sourceB' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceB') &&
      sourceTypesFromCheckCase['sourceB'].toLowerCase() === checkResults.sourceInfo["sourceAType"].toLowerCase()) {
      dataSourceOrderInCheckCase["a"] = 2;
      sourcesTraversed.push('sourceB');
    }
    else if ('sourceC' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceC') &&
      sourceTypesFromCheckCase['sourceC'].toLowerCase() === checkResults.sourceInfo["sourceAType"].toLowerCase()) {
      dataSourceOrderInCheckCase["a"] = 3;
      sourcesTraversed.push('sourceC');
    }
    else if ('sourceD' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceD') &&
      sourceTypesFromCheckCase['sourceD'].toLowerCase() === checkResults.sourceInfo["sourceAType"].toLowerCase()) {
      dataSourceOrderInCheckCase["a"] = 4;
      sourcesTraversed.push('sourceD');
    }
  }

  if ("sourceBType" in checkResults.sourceInfo &&
    checkResults.sourceInfo["sourceBType"]) {

    if ('sourceA' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceA') &&
      sourceTypesFromCheckCase['sourceA'].toLowerCase() === checkResults.sourceInfo["sourceBType"].toLowerCase()) {
      dataSourceOrderInCheckCase["b"] = 1;
      sourcesTraversed.push('sourceA');
    }
    else if ('sourceB' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceB') &&
      sourceTypesFromCheckCase['sourceB'].toLowerCase() === checkResults.sourceInfo["sourceBType"].toLowerCase()) {
      dataSourceOrderInCheckCase["b"] = 2;
      sourcesTraversed.push('sourceB');
    }
    else if ('sourceC' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceC') &&
      sourceTypesFromCheckCase['sourceC'].toLowerCase() === checkResults.sourceInfo["sourceBType"].toLowerCase()) {
      dataSourceOrderInCheckCase["b"] = 3;
      sourcesTraversed.push('sourceC');
    }
    else if ('sourceD' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceD') &&
      sourceTypesFromCheckCase['sourceD'].toLowerCase() === checkResults.sourceInfo["sourceBType"].toLowerCase()) {
      dataSourceOrderInCheckCase["b"] = 4;
      sourcesTraversed.push('sourceD');
    }

  }

  if ("sourceCType" in checkResults.sourceInfo &&
    checkResults.sourceInfo["sourceCType"]) {

    if ('sourceA' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceA') &&
      sourceTypesFromCheckCase['sourceA'].toLowerCase() === checkResults.sourceInfo["sourceCType"].toLowerCase()) {
      dataSourceOrderInCheckCase["c"] = 1;
      sourcesTraversed.push('sourceA');
    }
    else if ('sourceB' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceB') &&
      sourceTypesFromCheckCase['sourceB'].toLowerCase() === checkResults.sourceInfo["sourceCType"].toLowerCase()) {
      dataSourceOrderInCheckCase["c"] = 2;
      sourcesTraversed.push('sourceB');
    }
    else if ('sourceC' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceC') &&
      sourceTypesFromCheckCase['sourceC'].toLowerCase() === checkResults.sourceInfo["sourceCType"].toLowerCase()) {
      dataSourceOrderInCheckCase["c"] = 3;
      sourcesTraversed.push('sourceC');
    }
    else if ('sourceD' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceD') &&
      sourceTypesFromCheckCase['sourceD'].toLowerCase() === checkResults.sourceInfo["sourceCType"].toLowerCase()) {
      dataSourceOrderInCheckCase["c"] = 4;
      sourcesTraversed.push('sourceD');
    }

  }

  if ("sourceDType" in checkResults.sourceInfo &&
    checkResults.sourceInfo["sourceDType"]) {

    if ('sourceA' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceA') &&
      sourceTypesFromCheckCase['sourceA'].toLowerCase() === checkResults.sourceInfo["sourceDType"].toLowerCase()) {
      dataSourceOrderInCheckCase["d"] = 1;
      sourcesTraversed.push('sourceA');
    }
    else if ('sourceB' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceB') &&
      sourceTypesFromCheckCase['sourceB'].toLowerCase() === checkResults.sourceInfo["sourceDType"].toLowerCase()) {
      dataSourceOrderInCheckCase["d"] = 2;
      sourcesTraversed.push('sourceB');
    }
    else if ('sourceC' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceC') &&
      sourceTypesFromCheckCase['sourceC'].toLowerCase() === checkResults.sourceInfo["sourceDType"].toLowerCase()) {
      dataSourceOrderInCheckCase["d"] = 3;
      sourcesTraversed.push('sourceC');
    }
    else if ('sourceD' in sourceTypesFromCheckCase &&
      !sourcesTraversed.includes('sourceD') &&
      sourceTypesFromCheckCase['sourceD'].toLowerCase() === checkResults.sourceInfo["sourceDType"].toLowerCase()) {
      dataSourceOrderInCheckCase["d"] = 4;
      sourcesTraversed.push('sourceD');
    }

  }

  return dataSourceOrderInCheckCase;
}