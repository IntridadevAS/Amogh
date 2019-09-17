function ReviewComplianceContextMenuManager(complianceReviewManager) {
    // call super constructor
    ReviewModuleContextMenuManager.call(this);

    //this.CheckGroups = checkGroups;
    // this.MainReviewTableDiv = mainReviewTableDiv;
    // this.DetailedReviewTableDiv = detailedReviewTableDiv;
    this.ComplianceReviewManager = complianceReviewManager;

    this.ComponentTableContainer;
    this.PropertyTableContainer;
}

// assign parent's method to this class
ReviewComplianceContextMenuManager.prototype = Object.create(ReviewModuleContextMenuManager.prototype);
ReviewComplianceContextMenuManager.prototype.constructor = ReviewComplianceContextMenuManager;

// ReviewComplianceContextMenuManager.prototype.Init = function () {
//     // components level
//     this.InitComponentLevelContextMenu();

//     // property level
//     this.InitPropertyLevelContextMenu();

//     // group level
//     this.InitGroupLevelContextMenu();
// }

ReviewComplianceContextMenuManager.prototype.InitComponentLevelContextMenu = function (componentTableContainer) {
    //"#SourceAComplianceMainReviewTbody"
    var _this = this;
    this.ComponentTableContainer = componentTableContainer;
    $(componentTableContainer).contextMenu({
        className: 'contextMenu_style',
        selector: 'tr',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            accept = _this.ChooseActionForComplianceComponent(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            _this.HighlightSelectedRowOnRightClick(selectedRow);
            return {
                callback: function (key, options) {
                    _this.ExecuteContextMenuClicked(key, options, this);
                },
                items: {
                    "acceptComponent":
                    {
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = _this.DisableContextMenuAccept(this);
                            return disable;
                        }
                    },
                    "reference": {
                        name: "Reference",
                    },
                    "isolate": {
                        name: "Isolate",
                        visible: function () {
                            if (_this.HaveSCOperations()) {
                                return true;
                            }

                            return false;
                        }
                    },
                    "show": {
                        name: "Show",
                        visible: function () {
                            if (_this.HaveSCOperations()) {
                                return true;
                            }

                            return false;
                        }
                    },
                    "startTranslucency": {
                        name: "Start Translucency",
                        visible: function () {
                            if (_this.HaveSCOperations()) {
                                return true;
                            }

                            return false;
                        }
                    },
                    "stopTranslucency": {
                        name: "Stop Translucency",
                        visible: function () {
                            if (_this.HaveSCOperations()) {
                                return true;
                            }

                            return false;
                        }
                    }
                }
            };
        }
    });
}

ReviewComplianceContextMenuManager.prototype.HaveSCOperations = function () {
    if (model.checks["compliance"]["viewer"]) {
        return true;
    }

    return false;
}

ReviewComplianceContextMenuManager.prototype.InitPropertyLevelContextMenu = function (propertyTableContainer) {

    var _this = this;
    this.PropertyTableContainer = propertyTableContainer;

    $(propertyTableContainer).contextMenu({
        className: 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            accept = _this.ChooseActionForComplianceProperty(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            return {
                callback: function (key, options) {
                    _this.ExecuteContextMenuClicked(key, options, this);
                },
                items: {
                    "acceptProperty":
                    {
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = _this.DisableContextMenuAccept(this);
                            return disable;
                        }
                    },
                }
            };
        }
    });

}

ReviewComplianceContextMenuManager.prototype.InitGroupLevelContextMenu = function () {

    var _this = this;
    var mainReviewTableDiv = "#" + this.MainReviewTableDiv;

    $(mainReviewTableDiv).contextMenu({
        className: 'contextMenu_style',
        selector: 'BUTTON',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            accept = _this.ChooseActionForComplianceGroup(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            return {
                callback: function (key, options) {
                    _this.ExecuteContextMenuClicked(key, options, this);
                },
                items: {
                    "acceptGroup":
                    {
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = _this.DisableContextMenuAccept(this);
                            return disable;
                        }
                    },
                }
            };
        }
    });
}

ReviewComplianceContextMenuManager.prototype.ChooseActionForComplianceComponent = function (selectedRow) {
    if (selectedRow.cells[ComplianceColumns.Status].innerHTML == "OK(A)" ||
        selectedRow.cells[ComplianceColumns.Status].innerHTML == 'OK(A)(T)') {
        return false;
    }
    else {
        return true;
    }
}

ReviewComplianceContextMenuManager.prototype.ChooseActionForComplianceProperty = function (selectedRow) {
    if (selectedRow.cells[2].innerHTML == "ACCEPTED") {
        return false;
    }

    return true;
}

ReviewComplianceContextMenuManager.prototype.ChooseActionForComplianceGroup = function (selectedRow) {
    var groupId = selectedRow.getAttribute("groupId");
    if (this.CheckGroups[groupId].categoryStatus == 'ACCEPTED') {
        return false;
    }

    return true;
}

ReviewComplianceContextMenuManager.prototype.ExecuteContextMenuClicked = function (key,
    options,
    selectedRow) {
    if (key === "acceptComponent") {
        if (options.items[key].name == "Accept") {
            this.OnAcceptComponent(selectedRow);
        }
        else {
            this.OnUnAcceptComponent(selectedRow);
        }
    }
    else if (key === "acceptProperty") {
        if (options.items[key].name == "Accept") {
            this.OnAcceptProperty(selectedRow);
        }
        else {
            this.OnUnAcceptProperty(selectedRow);
        }
    }
    else if (key === "acceptGroup") {
        if (options.items[key].name == "Accept") {
            this.OnAcceptGroup(selectedRow);
        }
        else {
            this.OnUnAcceptGroup(selectedRow);
        }
    }
    else if (key === "freeze") {
    }
    else if (key === "reference") {
        onReferenceClick(selectedRow);
    }
    else if (key === "isolate") {
        this.OnIsolateClick();
    }
    else if (key === "show") {
        this.OnShowClick();
    }
    else if (key === "startTranslucency") {
        this.OnStartTranslucency();
    }
    else if (key === "stopTranslucency") {
        this.OnStopTranslucency();
    }
}

ReviewComplianceContextMenuManager.prototype.OnAcceptComponent = function (rowClicked) {
    var tableToUpdate = this.GetTableNameToAcceptComponent();

    var rowsData = $(this.ComponentTableContainer).data("igGrid").dataSource.dataView();
    var rowData = rowsData[rowClicked[0].rowIndex];
    
    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    this.ComplianceReviewManager.AcceptComponent(rowClicked, this.ComponentTableContainer, tableToUpdate, componentId, groupId);
}

ReviewComplianceContextMenuManager.prototype.OnAcceptProperty = function (rowClicked) {
    var tableToUpdate = this.GetTableNameToAcceptProperty();
    this.ComplianceReviewManager.UpdateStatusForProperty(rowClicked, tableToUpdate);
}

ReviewComplianceContextMenuManager.prototype.OnAcceptGroup = function (rowClicked) {
    var tableToUpdate = this.GetTableNameToAcceptGroup();
    this.ComplianceReviewManager.UpdateStatusOfCategory(rowClicked[0], tableToUpdate);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptComponent = function (rowClicked) {
    var tableToUpdate = this.GetTableNameToUnAcceptComponent();

    var rowsData = $(this.ComponentTableContainer).data("igGrid").dataSource.dataView();
    var rowData = rowsData[rowClicked[0].rowIndex];
    
    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    this.ComplianceReviewManager.UnAcceptComponent(rowClicked, 
        tableToUpdate, 
        this.ComponentTableContainer, 
        componentId, 
        groupId);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptProperty = function (rowClicked) {
    var tableToUpdate = this.GetTableNameToUnAcceptProperty();
    this.ComplianceReviewManager.UnAcceptProperty(rowClicked, tableToUpdate);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptGroup = function (rowClicked) {
    var tableToUpdate = this.GetTableNameToUnAcceptGroup();
    this.ComplianceReviewManager.UnAcceptCategory(rowClicked[0], tableToUpdate);
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToAcceptComponent = function () {
    var tableToUpdate;
    var fileName = this.ComplianceReviewManager.GetFileName();
    if ('a' in model.files &&
        model.files['a'].fileName === fileName) {
        tableToUpdate = "complianceSourceA";
    }
    else if ('b' in model.files &&
        model.files['b'].fileName === fileName) {
        tableToUpdate = "complianceSourceB";
    }

    return tableToUpdate;
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToAcceptProperty = function () {
    var tableToUpdate = "";
    if (this.DetailedReviewTableDiv == "ComplianceADetailedReviewTbody") {
        tableToUpdate = "ComplianceADetailedReview";
    }
    else if (this.DetailedReviewTableDiv == "ComplianceBDetailedReviewTbody") {
        tableToUpdate = "ComplianceBDetailedReview";
    }
    return tableToUpdate;
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToAcceptGroup = function () {
    var tableToUpdate = "";
    if (this.MainReviewTableDiv == "SourceAComplianceMainReviewTbody") {
        tableToUpdate = "categoryComplianceA";
    }
    else if (this.MainReviewTableDiv == "SourceBComplianceMainReviewTbody") {
        tableToUpdate = "categoryComplianceB";
    }
    return tableToUpdate;
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToUnAcceptComponent = function () {
   
    var tableToUpdate;
    var fileName = this.ComplianceReviewManager.GetFileName();
    if ('a' in model.files &&
        model.files['a'].fileName === fileName) {
        tableToUpdate = "rejectComponentFromComplianceATab";
    }
    else if ('b' in model.files &&
        model.files['b'].fileName === fileName) {
        tableToUpdate = "rejectComponentFromComplianceBTab";
    }

    return tableToUpdate;    
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToUnAcceptProperty = function () {
    var tableToUpdate = "";
    if (this.DetailedReviewTableDiv == "ComplianceADetailedReviewTbody") {
        tableToUpdate = "rejectPropertyFromComplianceATab";
    }
    else if (this.DetailedReviewTableDiv == "ComplianceBDetailedReviewTbody") {
        tableToUpdate = "rejectPropertyFromComplianceBTab";
    }
    return tableToUpdate;
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToUnAcceptGroup = function () {
    var tableToUpdate = "";
    if (this.MainReviewTableDiv == "SourceAComplianceMainReviewTbody") {
        tableToUpdate = "rejectCategoryFromComplianceATab";
    }
    else if (this.MainReviewTableDiv == "SourceBComplianceMainReviewTbody") {
        tableToUpdate = "rejectCategoryFromComplianceBTab";
    }
    return tableToUpdate;
}

ReviewComplianceContextMenuManager.prototype.OnIsolateClick = function () {
    // get selected source A and B node ids
    var nodes = this.GetNodeIdsFormComponentRow();
    if (!nodes ||
        nodes.length === 0) {
        return;
    }

    // source isolate
    var viewerInterface = model.checks["compliance"]["viewer"];

    if (viewerInterface) {

        // perform isolate
        var isolateManager = new IsolateManager(viewerInterface.Viewer);
        isolateManager.Isolate(nodes).then(function (affectedNodes) {

        });
    }
}

ReviewComplianceContextMenuManager.prototype.OnShowClick = function () {
    var viewerInterface = model.checks["compliance"]["viewer"];

    if (viewerInterface) {

        var nodes = this.GetNodeIdsFormComponentRow();
        if (!nodes ||
            nodes.length === 0) {
            return;
        }

        viewerInterface.Viewer.model.setNodesVisibility(nodes, true).then(function () {
            viewerInterface.Viewer.view.fitWorld();
        });
    }
}

ReviewComplianceContextMenuManager.prototype.GetNodeIdsFormComponentRow = function () {
    var selectionManager = model.getCurrentSelectionManager();
    if (selectionManager.SelectedCheckComponentRows.length === 0) {
        return undefined;
    }

    var rowsData = $(this.ComponentTableContainer).data("igGrid").dataSource.dataView();

    var sourceNodeIds = [];
    for (var i = 0; i < selectionManager.SelectedCheckComponentRows.length; i++) {
        var selectedRow = selectionManager.SelectedCheckComponentRows[i];

        var rowData = rowsData[selectedRow.rowIndex];

        if (rowData.NodeId &&
            rowData.NodeId !== "") {
            sourceNodeIds.push(Number(rowData.NodeId));
        }
    }

    return sourceNodeIds;
}

ReviewComplianceContextMenuManager.prototype.OnStartTranslucency = function () {
    if (translucencyActive()) {
        alert("Can't activate translucency.");
        return;
    }

    // get selected source A and B node ids
    var nodes = this.GetNodeIdsFormComponentRow();
    if (!nodes) {
        return;
    }

    // activate translucency 
    var viewerInterface = model.checks["compliance"]["viewer"];

    var selectedNodes = {};
    selectedNodes[viewerInterface.Viewer._params.containerId] = nodes;

    // // get slider id
    // var sliderId = getSliderId(viewerInterface.Viewer._params.containerId);
    // if (!sliderId) {
    //     return;
    // }
    var translucencyControls = {};
    translucencyControls["slider"] = "translucencySlider5"
    translucencyControls["output"] = "translucencyValue5";
    translucencyControls["overlay"] = "translucencyOverlay5";


    var translucencyManager = new TranslucencyManager([viewerInterface.Viewer], selectedNodes, translucencyControls);
    translucencyManager.Start();

    translucencyManagers[viewerInterface.Viewer._params.containerId] = translucencyManager;
}

ReviewComplianceContextMenuManager.prototype.OnStopTranslucency = function () {
    var viewerInterface = model.checks["compliance"]["viewer"];
    if (!(viewerInterface.Viewer._params.containerId in translucencyManagers)) {
        return;
    }

    translucencyManagers[viewerInterface.Viewer._params.containerId].Stop();
    delete translucencyManagers[viewerInterface.Viewer._params.containerId];
}