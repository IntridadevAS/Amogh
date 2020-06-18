function ReviewComplianceContextMenuManager(complianceReviewManager) {
    // call super constructor
    ReviewModuleContextMenuManager.call(this);

    //this.CheckGroups = checkGroups;
    // this.MainReviewTableDiv = mainReviewTableDiv;
    // this.DetailedReviewTableDiv = detailedReviewTableDiv;
    this.ComplianceReviewManager = complianceReviewManager;

    this.ComponentTableContainer;
    this.PropertyTableContainer;

    this.TranslucencyActive = false;
}

// assign parent's method to this class
ReviewComplianceContextMenuManager.prototype = Object.create(ReviewModuleContextMenuManager.prototype);
ReviewComplianceContextMenuManager.prototype.constructor = ReviewComplianceContextMenuManager;

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
                    var optionName = ""
                    if(options.items[key]) {
                        optionName = options.items[key].name;
                    }
                    _this.ExecuteContextMenuClicked(key, optionName, "");
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
                    "hide": {
                        name: "Hide",
                        visible: function () {
                            if (_this.HaveSCOperations()) {
                                return true;
                            }

                            return false;
                        }
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
                    "modelViews": {
                        name: "Model Views",
                        icon: "modelViews",
                        visible: function () {
                            if (_this.HaveSCOperations()) {
                                return true;
                            }

                            return false;
                        }
                    },                   
                    "translucency": {
                        name: "Translucency",
                        visible: function () {
                            if (_this.HaveSCOperations()) {
                                return true;
                            }

                            return false;
                        }
                    },
                    "reference": {
                        name: "Reference",
                    },
                }
            };
        }
    });
}

ReviewComplianceContextMenuManager.prototype.DisableAcceptForComponent = function (selectedRow) {

    var selectedRowStatus = selectedRow.cells[ComplianceColumns.Status].innerHTML;
    if (
        (selectedRowStatus.includes("OK") && !selectedRowStatus.includes("(A)")) ||
        selectedRowStatus.includes("undefined")
    ) {
        return true;
    }

    return false;
}

ReviewComplianceContextMenuManager.prototype.DisableAcceptForProperty = function(selectedRow) {
    
    var selectedPropertiesKey = model.checks["compliance"]["detailedInfoTable"].SelectedProperties;
    var ignore = ['OK', 'No Value', 'OK(T)', 'undefined'];
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
        if (index > 0) {
            accepted = true;
        }
    }

    return accepted;
}

ReviewComplianceContextMenuManager.prototype.DisableAcceptForGroup = function (groupId) {
    // var groupData = model.getCurrentReviewTable().GetAccordionData(selectedRow.textContent);
    // var groupId = groupData["groupId"];
    var checkGroup = complianceReviewManager.ComplianceCheckManager.results[groupId];

    // var selectedRowStatus = selectedRow.cells[ComparisonPropertyColumns.Status].innerHTML;
    if (checkGroup.categoryStatus == 'OK' ||
    checkGroup.ComponentClass == 'Undefined') {
        return true;
    }

    return false;
}


ReviewComplianceContextMenuManager.prototype.HaveSCOperations = function () {
    if (model.checks["compliance"]["viewer"].Is3DViewer()) {
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
                    var optionName = ""
                    if(options.items[key]) {
                        optionName = options.items[key].name;
                    }
                    _this.ExecuteContextMenuClicked(key, optionName, "");
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

ReviewComplianceContextMenuManager.prototype.InitGroupLevelContextMenu = function (selectedGroupData) {
    var _this = this;

    var divID;
    $("#contextMenu_" + selectedGroupData.itemElement[0].id).remove();
    var div = document.createElement("DIV");
    div.id = "contextMenu_" + selectedGroupData.itemElement[0].id;

    document.documentElement.appendChild(div);
    divID = div.id;

    var contextMenuItems = this.GetGroupContextMenuItems(selectedGroupData.itemData["groupId"]);


    new DevExpress.ui.dxContextMenu(document.getElementById(divID), {
        "dataSource": contextMenuItems,
        width: 200,
        visible: false,
        onItemClick: function (e) {
            _this.ExecuteContextMenuClicked(e.itemData["id"], e.itemData["text"], selectedGroupData.itemData);
        },
        onHidden: function (e) {
            $("#contextMenu_" + selectedGroupData.itemElement[0].id).remove();
        }
    });
}

ReviewComplianceContextMenuManager.prototype.GetGroupContextMenuItems = function(groupId) {
    var acceptItem = this.ChooseActionForComplianceGroup(groupId);
    var acceptconditionalName = (acceptItem) ? 'Accept' : 'Unaccept';
    var disableAccept = this.DisableAcceptForGroup(groupId);

    var dataSource = [];

    dataSource[0] = {
        "text" : acceptconditionalName,
        "disabled": disableAccept,
        "id": "acceptGroup"
    }

    if (this.HaveSCOperations()) {
        // hide
        dataSource[dataSource.length] = {
            "text": "Hide",
            "id": "hideGroup"
        }

        // isolate
        dataSource[dataSource.length] = {
            "text": "Isolate",
            "id": "isolateGroup"
        }

        // show
        dataSource[dataSource.length] = {
            "text": "Show",
            "id": "showGroup"
        }
    } 

    return dataSource;

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

ReviewComplianceContextMenuManager.prototype.ChooseActionForComplianceGroup = function (groupId) {
    // var groupData = model.getCurrentReviewTable().GetAccordionData(selectedRow.textContent);
    // var groupId = groupData["groupId"];
    if (this.ComplianceReviewManager.ComplianceCheckManager["results"][groupId].categoryStatus == 'ACCEPTED') {
        return false;
    }

    return true;
}

ReviewComplianceContextMenuManager.prototype.ExecuteContextMenuClicked = function (key,
    optionName,
    accordionData) {
    if (key === "acceptComponent") {
        if (optionName == "Accept") {
            this.OnAcceptComponents();
        }
        else {
            this.OnUnAcceptComponents();
        }
    }
    else if (key === "acceptProperty") {
        if (optionName == "Accept") {
            this.OnAcceptProperty();
        }
        else {
            this.OnUnAcceptProperty();
        }
    }
    else if (key === "acceptGroup") {
        if (optionName == "Accept") {
            this.OnAcceptGroup(accordionData);
        }
        else {
            this.OnUnAcceptGroup(accordionData);
        }
    }
    else if (key === "freeze") {
    }
    else if (key === "reference") {
        this.onReferenceClick();
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
    else if (key.toLowerCase() === "translucency") {

        if (!this.TranslucencyActive) {
            this.OnStartTranslucency();
        }
        else {
            this.OnStopTranslucency();
        }
    }
    else if (key.toLowerCase() === "modelviews") {
        this.OnModelViewsClicked();
    }
    else if(key.toLowerCase() === "hidegroup"){
        this.OnHideGroup(accordionData);
    }
    else if(key.toLowerCase() === "isolategroup"){
        this.OnIsolateGroup(accordionData);
    }
    else if(key.toLowerCase() === "showgroup"){
        this.OnShowGroup(accordionData);
    }
}

ReviewComplianceContextMenuManager.prototype.OnHideGroup = function (accordionData) {
    var _this = this;

    var groupId = accordionData["groupId"];
    this.ComplianceReviewManager.SelectAllGroupItems(groupId).then(function (rows) {
        var nodes = [];
        var selectedComponentRows = [];
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var rowData = row.data;

            //node ids          
            if (rowData.NodeId !== "" && rowData.NodeId !== null) {
                nodes.push(Number(rowData.NodeId));
            }

            // rowkeys
            selectedComponentRows.push({
                "rowKey": row.key,
                "tableId": _this.ComponentTableContainer
            });
        }

        _this.HideItems(nodes, selectedComponentRows);
    });
}

ReviewComplianceContextMenuManager.prototype.OnIsolateGroup = function (accordionData) {
    var _this = this;

    var groupId = accordionData["groupId"];
    this.ComplianceReviewManager.SelectAllGroupItems(groupId).then(function (rows) {
        var nodes = [];
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var rowData = row.data;

            //node ids          
            if (rowData.NodeId !== "" && rowData.NodeId !== null) {
                nodes.push(Number(rowData.NodeId));
            }
        }

        _this.IsolateItems(nodes);
    });
}

ReviewComplianceContextMenuManager.prototype.OnShowGroup = function (accordionData) {
    var _this = this;

    var groupId = accordionData["groupId"];
    this.ComplianceReviewManager.SelectAllGroupItems(groupId).then(function (rows) {
        var nodes = [];
        var selectedComponentRows = [];
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var rowData = row.data;

            //node ids          
            if (rowData.NodeId !== "" && rowData.NodeId !== null) {
                nodes.push(Number(rowData.NodeId));
            }

            // rowkeys
            selectedComponentRows.push({
                "rowKey": row.key,
                "tableId": _this.ComponentTableContainer
            });
        }

        _this.ShowItems(nodes, selectedComponentRows);
    });
}

ReviewComplianceContextMenuManager.prototype.OnModelViewsClicked = function () {
    var menus = model.checks[model.currentCheck].menus;
    for (var viewerId in menus) {
        if ("ModelViewsMenu" in menus[viewerId]) {
            menus[viewerId]["ModelViewsMenu"].Open();

            var sourceName = model.checks[model.currentCheck].reviewManager.ComplianceCheckManager.source;

            if (sourceName) {
                DevExpress.ui.notify(
                    "Hovering menus enabled for " + "'" + sourceName + "'",
                    "success",
                    1500);
            }
        }

        break;
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

ReviewComplianceContextMenuManager.prototype.OnAcceptProperty = function () {
   
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

ReviewComplianceContextMenuManager.prototype.OnAcceptGroup = function (accordionData) {
    var ActionToPerform = this.GetTableNameToAcceptGroup();
    this.ComplianceReviewManager.UpdateStatusOfCategory(accordionData, ActionToPerform);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptComponents = function () {
    var ActionToPerform = this.GetTableNameToUnAcceptComponent();
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if(selectedGroupIdsVsResultIds == undefined) {
        return;
    }

    this.ComplianceReviewManager.UnAcceptComponents(selectedGroupIdsVsResultIds, ActionToPerform);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptProperty = function () {
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

ReviewComplianceContextMenuManager.prototype.OnUnAcceptGroup = function (accordionData) {
    var ActionToPerform = this.GetTableNameToUnAcceptGroup();
    this.ComplianceReviewManager.UnAcceptCategory(accordionData, ActionToPerform);
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
    else if ('c' in model.files &&
        model.files['c'].fileName === fileName) {
        ActionToPerform = "acceptComplianceSourceCComponent";
    }
    else if ('d' in model.files &&
        model.files['d'].fileName === fileName) {
        ActionToPerform = "acceptComplianceSourceDComponent";
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
    else if ('c' in model.files &&
        model.files['c'].fileName === fileName) {
        ActionToPerform = "acceptComplianceSourceCProperty";
    }
    else if ('d' in model.files &&
        model.files['d'].fileName === fileName) {
        ActionToPerform = "acceptComplianceSourceDProperty";
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
    else if ('c' in model.files &&
        model.files['c'].fileName === fileName) {
        ActionToPerform = "acceptComplianceSourceCCategory";
    }
    else if ('d' in model.files &&
        model.files['d'].fileName === fileName) {
        ActionToPerform = "acceptComplianceSourceDCategory";
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
    else if ('c' in model.files &&
        model.files['c'].fileName === fileName) {
        ActionToPerform = "unAcceptComplianceSourceCComponent";
    }
    else if ('d' in model.files &&
        model.files['d'].fileName === fileName) {
        ActionToPerform = "unAcceptComplianceSourceDComponent";
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
    else if ('c' in model.files &&
        model.files['c'].fileName === fileName) {
        ActionToPerform = "unAcceptComplianceSourceCProperty";
    }
    else if ('d' in model.files &&
        model.files['d'].fileName === fileName) {
        ActionToPerform = "unAcceptComplianceSourceDProperty";
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
    else if ('c' in model.files &&
        model.files['c'].fileName === fileName) {
        ActionToPerform = "unAcceptComplianceSourceCCategory";
    }
    else if ('d' in model.files &&
        model.files['d'].fileName === fileName) {
        ActionToPerform = "unAcceptComplianceSourceDCategory";
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
    this.IsolateItems(nodes);
}

ReviewComplianceContextMenuManager.prototype.IsolateItems = function (nodes) {
    var viewerInterface = model.checks["compliance"]["viewer"];
    if (viewerInterface) {
        // perform isolate
        var isolateManager = new IsolateManager(viewerInterface.Viewer);
        isolateManager.Isolate(nodes).then(function (affectedNodes) {

        });
    }
}

ReviewComplianceContextMenuManager.prototype.OnShowClick = function () {
    // var viewerInterface = model.checks["compliance"]["viewer"];
    // if (viewerInterface) {
        var nodes = this.GetNodeIdsFormComponentRow();
        if (!nodes ||
            nodes.length === 0) {
            return;
        }
        var selectedComponentRows = model.getCurrentSelectionManager().GetSelectedComponents();

        this.ShowItems(nodes, selectedComponentRows);
    // }
}

ReviewComplianceContextMenuManager.prototype.ShowItems = function (nodes, selectedComponentRows) {
    var viewerInterface = model.checks["compliance"]["viewer"];
    if (!viewerInterface) {
        return;
    }

    viewerInterface.Viewer.model.setNodesVisibility(nodes, true).then(function () {
        viewerInterface.Viewer.view.fitWorld();
    });      
    
    //Remove resultId on show
    viewerInterface.RemoveHiddenResultId(selectedComponentRows);

    var rows = [];
    for (var i = 0; i < selectedComponentRows.length; i++) {
        var dataGrid = $(selectedComponentRows[i]["tableId"]).dxDataGrid("instance");
        var rowIndex = dataGrid.getRowIndexByKey(selectedComponentRows[i]["rowKey"]);
        var row = dataGrid.getRowElement(rowIndex)[0];
        rows.push(row);
    }

    model.checks[model.currentCheck]["reviewTable"].HighlightHiddenRows(false, rows);
}

ReviewComplianceContextMenuManager.prototype.OnHideClick = function () {
    // var viewerInterface = model.checks["compliance"]["viewer"];
    // if (viewerInterface) {
    var nodes = this.GetNodeIdsFormComponentRow();
    if (!nodes ||
        nodes.length === 0) {
        return;
    }

    var selectedComponentRows = model.getCurrentSelectionManager().GetSelectedComponents();

    this.HideItems(nodes, selectedComponentRows);
    // }
}

ReviewComplianceContextMenuManager.prototype.HideItems = function(nodes, selectedComponentRows){
    var viewerInterface = model.checks["compliance"]["viewer"];
    if (!viewerInterface) {
        return;
    }

    viewerInterface.Viewer.model.setNodesVisibility(nodes, false).then(function () {
        viewerInterface.Viewer.view.fitWorld();
    });

    viewerInterface.StoreHiddenResultId(selectedComponentRows);

    var rows = [];
    for (var i = 0; i < selectedComponentRows.length; i++) {
        var dataGrid = $(selectedComponentRows[i]["tableId"]).dxDataGrid("instance");
        var rowIndex = dataGrid.getRowIndexByKey(selectedComponentRows[i]["rowKey"]);
        var row = dataGrid.getRowElement(rowIndex)[0];
        rows.push(row);
    }
    model.checks[model.currentCheck]["reviewTable"].HighlightHiddenRows(true, rows);
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
    this.TranslucencyActive = true;

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
    this.TranslucencyActive = false;

    translucencyManagers[viewerInterface.Viewer._params.containerId].Stop();
    delete translucencyManagers[viewerInterface.Viewer._params.containerId];
}

ReviewComplianceContextMenuManager.prototype.onReferenceClick = function () {
    model.checks[model.currentCheck].reviewTable.GetComponentIds().then(function (componentIds) {
        if (!componentIds) {
            return;
        }

        var title = undefined;
        for (var src in componentIds) {
            var file;
            if (src === "a") {
                file = checkResults.sourceInfo.sourceAFileName;
            }
            else if (src === "b") {
                file = checkResults.sourceInfo.sourceBFileName;
            }
            else if (src === "c") {
                file = checkResults.sourceInfo.sourceCFileName;
            }
            else if (src === "d") {
                file = checkResults.sourceInfo.sourceDFileName;
            }

            if (!title) {
                title = file;
            }
            else {
                title += " | " + file;
            }
        }

        ReferenceManager.showReferenceDiv(componentIds, title);
    });
}