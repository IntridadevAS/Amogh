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
            _this.HighlightSelectedRowOnRightClick(selectedRow, _this.ComponentTableContainer);
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
                            disable = _this.DisableAcceptForComponent(this[0]);
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
                    "hide": {
                        name: "Hide",
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

ReviewComplianceContextMenuManager.prototype.DisableAcceptForComponent = function (selectedRow) {

    var selectedRowStatus = selectedRow.cells[ComplianceColumns.Status].innerHTML;
    if (selectedRowStatus.includes("OK") &&
        !selectedRowStatus.includes("(A)")) {
        return true;
    }

    return false;
}

ReviewComplianceContextMenuManager.prototype.DisableAcceptForProperty = function(selectedRow) {
    
    var selectedPropertiesKey = model.checks["compliance"]["detailedInfoTable"].SelectedProperties;
    var ignore = ['OK', 'No Value', 'OK(T)', 'ACCEPTED'];
    var accepted = false;

    if(selectedPropertiesKey.length == 0) {
        transpose = true;
        return transpose;
    }

    var detailInfoContainer =  model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items(); 

    for(var i = 0; i < selectedPropertiesKey.length; i++) {
        var rowIndex = dataGrid.getRowIndexByKey(selectedPropertiesKey[i]);
        var rowData = data[rowIndex];
        var index = ignore.indexOf(rowData[ComparisonPropertyColumnNames.Status]);
        if (index == -1) {
            accepted = true;
        }
    }

    return false;
}

ReviewComplianceContextMenuManager.prototype.DisableAcceptForGroup = function (selectedRow) {
    var groupData = model.getCurrentReviewTable().GetAccordionData(selectedRow.textContent);
    var groupId = groupData["groupId"];
    var checkGroup = complianceReviewManager.ComplianceCheckManager.results[groupId];

    // var selectedRowStatus = selectedRow.cells[ComparisonPropertyColumns.Status].innerHTML;
    if (checkGroup.categoryStatus == 'OK' ||
    checkGroup.ComponentClass == 'Undefined') {
        return true;
    }

    return false;
}


ReviewComplianceContextMenuManager.prototype.HaveSCOperations = function () {
    if (model.checks["compliance"]["viewer"].ViewerOptions) {
        return true;
    }

    return false;
}

ReviewComplianceContextMenuManager.prototype.InitPropertyLevelContextMenu = function (propertyTableContainer) {

    var _this = this;
    this.PropertyTableContainer = propertyTableContainer;

    $(propertyTableContainer).contextMenu({
        className: 'contextMenu_style',
        selector: 'tr',
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
                            disable = _this.DisableAcceptForProperty(this[0]);
                            return disable;
                        }
                    },
                }
            };
        }
    });

}

ReviewComplianceContextMenuManager.prototype.InitGroupLevelContextMenu = function (categoryTableContainer) {

    var _this = this;

    $("#" + categoryTableContainer).contextMenu({
        className: 'contextMenu_style',
        selector: 'div',
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
                            disable = _this.DisableAcceptForGroup(this[0]);
                            return disable;
                        }
                    },
                }
            };
        }
    });
}

ReviewComplianceContextMenuManager.prototype.ChooseActionForComplianceComponent = function (selectedRow) {
    var accept = false;
    var ignore = ['OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)'];
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if(selectedGroupIdsVsResultIds == undefined) {
        accept = true;
        return accept;
    }

    for(var groupId in selectedGroupIdsVsResultIds) {
        var componentIds = selectedGroupIdsVsResultIds[groupId];
        for(var componentId in componentIds) {
            var checkResultComponent = this.ComplianceReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            var index = ignore.indexOf(checkResultComponent.status);
            if (index == -1) {
                accept = true;
            }
        }
    }

    return accept;
    
}

ReviewComplianceContextMenuManager.prototype.ChooseActionForComplianceProperty = function (selectedRow) {
    var accept = false;
    var ignore = ['OK', 'No Value', 'ACCEPTED', 'OK(T)'];
    var selectedPropertiesKey = model.checks["compliance"]["detailedInfoTable"].SelectedProperties;

    
    if(selectedPropertiesKey.length == 0) {
        transpose = true;
        return transpose;
    }

    var detailInfoContainer =  model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items(); 

    for(var i = 0; i < selectedPropertiesKey.length; i++) {
        var rowIndex = dataGrid.getRowIndexByKey(selectedPropertiesKey[i]);
        var rowData = data[rowIndex];
        var index = ignore.indexOf(rowData[CompliancePropertyColumnNames.Status]);
        if (index == -1) {
            accept = true;
        }
    }

    return accept;
}

ReviewComplianceContextMenuManager.prototype.ChooseActionForComplianceGroup = function (selectedRow) {
    var groupData = model.getCurrentReviewTable().GetAccordionData(selectedRow.textContent);
    var groupId = groupData["groupId"];
    if (this.ComplianceReviewManager.ComplianceCheckManager["results"][groupId].categoryStatus == 'ACCEPTED') {
        return false;
    }

    return true;
}

ReviewComplianceContextMenuManager.prototype.ExecuteContextMenuClicked = function (key,
    options,
    selectedRow) {
    if (key === "acceptComponent") {
        if (options.items[key].name == "Accept") {
            this.OnAcceptComponents();
        }
        else {
            this.OnUnAcceptComponents();
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
        this.onReferenceClick(selectedRow);
    }
    else if (key === "isolate") {
        this.OnIsolateClick();
    }
    else if (key === "show") {
        this.OnShowClick();
    }
    else if (key === "hide") {
        this.OnHideClick();
    }
    else if (key === "startTranslucency") {
        this.OnStartTranslucency();
    }
    else if (key === "stopTranslucency") {
        this.OnStopTranslucency();
    }
}

ReviewComplianceContextMenuManager.prototype.OnAcceptComponents = function () {
    var ActionToPerform = this.GetTableNameToAcceptComponent();

    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if(selectedGroupIdsVsResultIds == undefined) {
        return;
    }

    this.ComplianceReviewManager.AcceptComponents(selectedGroupIdsVsResultIds, ActionToPerform);
}

ReviewComplianceContextMenuManager.prototype.OnAcceptProperty = function (rowClicked) {
   
    var highlightedRow = model.getCurrentSelectionManager().GetHighlightedRow();
    if (!highlightedRow) {
        return;
    }
    
    var dataGrid = $(highlightedRow["tableId"]).dxDataGrid("instance");
    var rowsData = dataGrid.getDataSource().items(); 
    var rowIndex = dataGrid.getRowIndexByKey(highlightedRow["rowKey"]);
    var rowData = rowsData[rowIndex];

    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    var ActionToPerform = this.GetTableNameToAcceptProperty();
    var selectedPropertiesKey = model.checks["compliance"]["detailedInfoTable"].SelectedProperties;

    if(selectedPropertiesKey.length == 0) {
        return;
    }

    this.ComplianceReviewManager.AcceptProperty(selectedPropertiesKey, ActionToPerform, componentId, groupId)
}

ReviewComplianceContextMenuManager.prototype.OnAcceptGroup = function (rowClicked) {
    var ActionToPerform = this.GetTableNameToAcceptGroup();
    this.ComplianceReviewManager.UpdateStatusOfCategory(rowClicked[0], ActionToPerform);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptComponents = function () {
    var ActionToPerform = this.GetTableNameToUnAcceptComponent();
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if(selectedGroupIdsVsResultIds == undefined) {
        return;
    }

    this.ComplianceReviewManager.UnAcceptComponents(selectedGroupIdsVsResultIds, ActionToPerform);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptProperty = function (rowClicked) {
    var highlightedRow = model.getCurrentSelectionManager().GetHighlightedRow();
    if (!highlightedRow) {
        return;
    }
    
    var dataGrid = $(highlightedRow["tableId"]).dxDataGrid("instance");
    var rowsData = dataGrid.getDataSource().items(); 
    var rowIndex = dataGrid.getRowIndexByKey(highlightedRow["rowKey"]);
    var rowData = rowsData[rowIndex];

    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    var ActionToPerform = this.GetTableNameToUnAcceptProperty();
    var selectedPropertiesKey = model.checks["compliance"]["detailedInfoTable"].SelectedProperties;
    if(selectedPropertiesKey.length == 0) {
        return;
    }
    this.ComplianceReviewManager.UnAcceptProperty(selectedPropertiesKey, ActionToPerform, componentId, groupId)
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptGroup = function (rowClicked) {
    var ActionToPerform = this.GetTableNameToUnAcceptGroup();
    this.ComplianceReviewManager.UnAcceptCategory(rowClicked[0], ActionToPerform);
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToAcceptComponent = function () {
    var ActionToPerform;
    var fileName = this.ComplianceReviewManager.GetFileName();
    if ('a' in model.files &&
        model.files['a'].fileName === fileName) {
        ActionToPerform = "acceptComplianceSourceAComponent";
    }
    else if ('b' in model.files &&
        model.files['b'].fileName === fileName) {
        ActionToPerform = "acceptComplianceSourceBComponent";
    }

    return ActionToPerform;
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToAcceptProperty = function () {
    var ActionToPerform;
    var fileName = this.ComplianceReviewManager.GetFileName();
    if ('a' in model.files &&
        model.files['a'].fileName === fileName) {
        ActionToPerform = "acceptComplianceSourceAProperty";
    }
    else if ('b' in model.files &&
        model.files['b'].fileName === fileName) {
        ActionToPerform = "acceptComplianceSourceBProperty";
    }

    return ActionToPerform;   
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToAcceptGroup = function () {
    var ActionToPerform;
    var fileName = this.ComplianceReviewManager.GetFileName();
    if ('a' in model.files &&
        model.files['a'].fileName === fileName) {
        ActionToPerform = "acceptComplianceSourceACategory";
    }
    else if ('b' in model.files &&
        model.files['b'].fileName === fileName) {
        ActionToPerform = "acceptComplianceSourceBCategory";
    }
    return ActionToPerform;
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToUnAcceptComponent = function () {
   
    var ActionToPerform;
    var fileName = this.ComplianceReviewManager.GetFileName();
    if ('a' in model.files &&
        model.files['a'].fileName === fileName) {
        ActionToPerform = "unAcceptComplianceSourceAComponent";
    }
    else if ('b' in model.files &&
        model.files['b'].fileName === fileName) {
        ActionToPerform = "unAcceptComplianceSourceBComponent";
    }

    return ActionToPerform;    
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToUnAcceptProperty = function () {
    var ActionToPerform;
    var fileName = this.ComplianceReviewManager.GetFileName();
    if ('a' in model.files &&
        model.files['a'].fileName === fileName) {
        ActionToPerform = "unAcceptComplianceSourceAProperty";
    }
    else if ('b' in model.files &&
        model.files['b'].fileName === fileName) {
        ActionToPerform = "unAcceptComplianceSourceBProperty";
    }

    return ActionToPerform;   
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToUnAcceptGroup = function () {
    var ActionToPerform;

    var fileName = this.ComplianceReviewManager.GetFileName();
    if ('a' in model.files &&
        model.files['a'].fileName === fileName) {
        ActionToPerform = "unAcceptComplianceSourceACategory";
    }
    else if ('b' in model.files &&
        model.files['b'].fileName === fileName) {
        ActionToPerform = "unAcceptComplianceSourceBCategory";
    }

    return ActionToPerform;
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

        var SelectedComponentRows = model.getCurrentSelectionManager().GetSelectedComponents();
        
        //Remove resultId on show
        viewerInterface.RemoveHiddenResultId(SelectedComponentRows);


        var rows = [];
        for (var i = 0; i < SelectedComponentRows.length; i++) {
            var dataGrid = $(SelectedComponentRows[i]["tableId"]).dxDataGrid("instance");
            var rowIndex = dataGrid.getRowIndexByKey(SelectedComponentRows[i]["rowKey"]);
            var row = dataGrid.getRowElement(rowIndex)[0];
            rows.push(row);
        }

        model.checks[model.currentCheck]["reviewTable"].HighlightHiddenRows(false, rows);
    }
}


ReviewComplianceContextMenuManager.prototype.OnHideClick = function () {
    var viewerInterface = model.checks["compliance"]["viewer"];

    if (viewerInterface) {

        var nodes = this.GetNodeIdsFormComponentRow();
        if (!nodes ||
            nodes.length === 0) {
            return;
        }

        viewerInterface.Viewer.model.setNodesVisibility(nodes, false).then(function () {
            viewerInterface.Viewer.view.fitWorld();
        });

        var SelectedComponentRows = model.getCurrentSelectionManager().GetSelectedComponents();
       
        viewerInterface.StoreHiddenResultId(SelectedComponentRows);
        
        var rows = [];
        for (var i = 0; i < SelectedComponentRows.length; i++) {
            var dataGrid = $(SelectedComponentRows[i]["tableId"]).dxDataGrid("instance");
            var rowIndex = dataGrid.getRowIndexByKey(SelectedComponentRows[i]["rowKey"]);
            var row = dataGrid.getRowElement(rowIndex)[0];
            rows.push(row);
        }

        model.checks[model.currentCheck]["reviewTable"].HighlightHiddenRows(true, rows);
    }
}

ReviewComplianceContextMenuManager.prototype.GetNodeIdsFormComponentRow = function () {
    var selectedComponents = model.getCurrentSelectionManager().GetSelectedComponents();
    if (selectedComponents.length === 0) {
        return undefined;
    }

    var dataGrid = $(this.ComponentTableContainer).dxDataGrid("instance");
    var rowsData = dataGrid.getDataSource().items(); 

    var sourceNodeIds = [];
    for (var i = 0; i < selectedComponents.length; i++) {
        var selectedRow = selectedComponents[i];

        var dataGrid = $(selectedRow["tableId"]).dxDataGrid("instance");
        var rowsData = dataGrid.getDataSource().items();

        var rowIndex = dataGrid.getRowIndexByKey(selectedRow["rowKey"]);
        var rowData = rowsData[rowIndex];

        if (rowData.NodeId &&
            rowData.NodeId !== "") {
            sourceNodeIds.push(Number(rowData.NodeId));
        }
    }

    return sourceNodeIds;
}

ReviewComplianceContextMenuManager.prototype.GetSelectedGroupIdsVsResultsIds = function() {
    var selectedComponents = model.getCurrentSelectionManager().GetSelectedComponents();
    if (selectedComponents.length === 0) {
        return undefined;
    }

    var selectedGroupIdsVsResultIds = {};
    // var selectedResultIdsVsRowElements = {};
    for(var i = 0; i < selectedComponents.length; i++) {
        var selectedRow = selectedComponents[i];
        // var dataGrid = $(selectedRow["tableId"]).dxDataGrid("instance");
        // var rowsData = dataGrid.getDataSource().items();
        // var rowIndex = dataGrid.getRowIndexByKey(selectedRow["rowKey"]);

        var tableIds = model.getCurrentReviewTable().CheckTableIds;
        var groupId = Object.keys(tableIds).find(key => tableIds[key] === selectedRow["tableId"]);
        var resultId = selectedRow["rowKey"];

        // selectedResultIdsVsRowElements[resultId] = selectedRow["row"];

        if(groupId in selectedGroupIdsVsResultIds) {
            selectedGroupIdsVsResultIds[groupId].push(Number(resultId));
        }
        else {
            selectedGroupIdsVsResultIds[groupId] = [];
            selectedGroupIdsVsResultIds[groupId].push(Number(resultId));
        }
    }
    
    return  selectedGroupIdsVsResultIds;
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

ReviewComplianceContextMenuManager.prototype.onReferenceClick = function () {
    var componentIds = model.checks[model.currentCheck].reviewTable.GetComponentIds(this.ComponentTableContainer);
    var title = undefined;
    for (var src in componentIds) {
        var file;
        if (src === "a") {
            file = checkResults.sourceInfo.sourceAFileName;
        }
        else if (src === "b") {
            file = checkResults.sourceInfo.sourceBFileName;
        }

        if (!title) {
            title = file;
        }
        else {
            title += " | " + file;
        }
    }

    ReferenceManager.showReferenceDiv(componentIds, title);
}