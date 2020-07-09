function ReviewComparisonContextMenuManager(comparisonReviewManager) {
    // call super constructor
    ReviewModuleContextMenuManager.call(this);

    this.ComparisonReviewManager = comparisonReviewManager;

    this.ComponentTableContainer;
    this.PropertyTableContainer;
    this.GroupTableContainer;

    this.TranslucencyActive = false;
}

// assign parent's method to this class
ReviewComparisonContextMenuManager.prototype = Object.create(ReviewModuleContextMenuManager.prototype);
ReviewComparisonContextMenuManager.prototype.constructor = ReviewComparisonContextMenuManager;


ReviewComparisonContextMenuManager.prototype.InitComponentLevelContextMenu = function (componentTableContainer) {
    var _this = this;

    this.ComponentTableContainer = componentTableContainer;
    $(componentTableContainer).contextMenu({
        className: 'contextMenu_style',
        selector: 'tr',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;

            let transposed = _this.AreSelectedComponentsTransposed();
            let accepted = _this.AreSelecteComponentsAccepted();

            var transposeSubMenu = [];
            if (transposed === false) {
                transposeSubMenu = _this.TransposeSubMenuItems();
            }

            _this.HighlightSelectedRowOnRightClick(selectedRow, _this.ComponentTableContainer);
            return {
                callback: function (key, options) {
                    var optionName = ""
                    if(options.items[key]) {
                        optionName = options.items[key].name;
                    }
                    _this.ExecuteContextMenuClicked(key, optionName, "", "component");
                },
                items: {
                    "acceptComponent":
                    {
                        name: accepted === false ? 'Accept' : 'Unaccept',
                        disabled: function () {
                            if (accepted === true) {
                                return false
                            }

                            if (!_this.AreComponentsValidForAccept()) {
                                return true;
                            }

                            return false;
                        }
                    },
                    "transposeItem": {
                        name: (transposed === false ? 'Transpose' : 'Restore'),
                        disabled: function () {
                            if (transposed === true) {
                                return false;
                            }

                            if (!_this.AreComponentsValidForTranspose()) {
                                return true;
                            }

                            return false;
                        }, 
                        items: transposed === true ? null : {
                            "FromDataSource1":
                            {
                                name: transposeSubMenu.length >= 2 ? transposeSubMenu[0] : "",
                                visible: function () {
                                    if (transposeSubMenu.length >= 2) {
                                        return true;
                                    }

                                    return false;

                                }
                            },
                            "FromDataSource2":
                            {
                                name:  transposeSubMenu.length >= 2 ? transposeSubMenu[1] : "",
                                visible: function () {
                                    if (transposeSubMenu.length >= 2) {
                                        return true;
                                    }

                                    return false;
                                }
                            },
                            "FromDataSource3":
                            {
                                name: function () {
                                    if (transposeSubMenu.length > 2)
                                        return transposeSubMenu[2];
                                    else
                                        return "";
                                },
                                visible: function () {
                                    if (transposeSubMenu.length > 2) {
                                        return true;
                                    }

                                    return false;
                                }
                            },
                            "FromDataSource4":
                            {
                                name: function () {
                                    if (transposeSubMenu.length > 3)
                                        return transposeSubMenu[3];

                                    return "";
                                },
                                visible: function () {
                                    if (transposeSubMenu.length > 3) {
                                        return true;
                                    }

                                    return false;
                                }
                            },
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

ReviewComparisonContextMenuManager.prototype.HaveSCOperations = function () {
    if (model.checks["comparison"]["sourceAViewer"].Is3DViewer() ||
        model.checks["comparison"]["sourceBViewer"].Is3DViewer()) {
        return true;
    }

    if (model.checks["comparison"]["sourceCViewer"] &&
        model.checks["comparison"]["sourceCViewer"].Is3DViewer()) {
        return true;
    }

    if (model.checks["comparison"]["sourceDViewer"] &&
        model.checks["comparison"]["sourceDViewer"].Is3DViewer()) {
        return true;
    }

    return false;
}

ReviewComparisonContextMenuManager.prototype.InitPropertyLevelContextMenu = function (propertyTableContainer) {
    var _this = this;
    this.PropertyTableContainer = propertyTableContainer;

    $(propertyTableContainer).contextMenu({
        className: 'contextMenu_style',
        selector: 'tr',
        build: function ($triggerElement, e) {
           
            let transposed = _this.AreSelectedPropertiesTransposed();
            let accepted = _this.AreSelectedPropertiesAccepted();

            var transposeSubMenu = [];
            if (transposed === false) {
                transposeSubMenu = _this.TransposeSubMenuItems();
            }

            return {
                callback: function (key, options) {
                    var optionName = ""
                    if(options.items[key]) {
                        optionName = options.items[key].name;
                    }
                    _this.ExecuteContextMenuClicked(key, optionName, "", "property");
                },
                items: {
                    "acceptProperty":
                    {
                        name: (accepted === true ? 'Unaccept' : 'Accept'),
                        disabled: function () {
                            if (accepted === true) {
                                return false
                            }

                            if (!_this.ArePropertiesValidForAccept()) {
                                return true;
                            }

                            return false;
                        }
                    },
                    "transposeItem": {
                        name: (transposed === true ? 'Restore' : 'Transpose'),
                        disabled: function () {
                            if (transposed === true) {
                                return false;
                            }

                            if (!_this.ArePropertiesValidForTranspose()) {
                                return true;
                            }

                            return false;
                        },                      
                        items:  transposed === true ? null : {
                            "FromDataSource1":
                            {
                                name: (transposeSubMenu.length >= 2 ? transposeSubMenu[0] : ""),
                                visible: function () {
                                    if (transposeSubMenu.length >= 2) {
                                        return true;
                                    }

                                    return false;
                                }
                            },
                            "FromDataSource2":
                            {
                                name: (transposeSubMenu.length >= 2 ? transposeSubMenu[1] : ""),
                                visible: function () {
                                    if (transposeSubMenu.length >= 2) {
                                        return true;
                                    }

                                    return false;
                                }
                            },
                            "FromDataSource3":
                            {
                                name: function () {
                                    if (transposeSubMenu.length > 2) {
                                        return transposeSubMenu[2];
                                    }

                                    return "";
                                },
                                visible: function () {
                                    if (transposeSubMenu.length > 2) {
                                        return true;
                                    }

                                    return false;
                                }
                            },
                            "FromDataSource4":
                            {
                                name: function () {
                                    if (transposeSubMenu.length > 3) {
                                        return transposeSubMenu[3];
                                    }

                                    return "";
                                },
                                visible: function () {
                                    if (transposeSubMenu.length > 3) {
                                        return true;
                                    }

                                    return false;
                                }
                            },
                        }
                    },                    
                }
            };
        }
    });
}

ReviewComparisonContextMenuManager.prototype.InitGroupLevelContextMenu = function (selectedGroupData) {
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
        onItemClick: function(e) {
            _this.ExecuteContextMenuClicked(e.itemData["id"], e.itemData["text"], selectedGroupData.itemData, "group");
        },
        onHidden: function(e){
            $("#contextMenu_" + selectedGroupData.itemElement[0].id).remove(); 
        }
    }); 
}

ReviewComparisonContextMenuManager.prototype.GetGroupContextMenuItems = function(groupId) {
    var acceptItem = this.ChooseActionForComparisonGroup(groupId);
    var acceptconditionalName = (acceptItem) ? 'Accept' : 'Unaccept';
    var disableAccept = this.DisableAcceptForGroup(groupId);

    var transposeItem = this.ChooseRestoreTransposeForGroup(groupId);
    var transposeconditionalName = (transposeItem) ? 'Transpose' : 'Restore';
    var disableTranspose  = this.DisableContextMenuTransposeForGroup(groupId)

    var dataSource = [];

    dataSource[0] = {
        "text" : acceptconditionalName,
        "disabled": disableAccept,
        "id": "acceptGroup"
    }

    if(transposeconditionalName == "Restore") {
        dataSource[1] = {
            "text" : transposeconditionalName,
            "id": "restoreItem"
        }
    }
    else {
        var transposeMenu = this.GetTransposeSubMenu();
        dataSource[1] = {
            "text" : transposeconditionalName,
            "disabled" : disableTranspose,
            "items" : transposeMenu,
            "id": "transposeItem"
        }
    }

    // select all
    // dataSource[dataSource.length] = {
    //     "text": "Select All",
    //     "id": "selectAll"
    // }

    // // deselect all
    // dataSource[dataSource.length] = {
    //     "text": "DeSelect All",
    //     "id": "deSelectAll"
    // }

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

ReviewComparisonContextMenuManager.prototype.GetTransposeSubMenu = function() {
    var transposeItems = [];
    transposeSubMenu = this.TransposeSubMenuItems();

    transposeItems[0] = {
        "text" : transposeSubMenu[0],
        "disabled": false,
        "id": "FromDataSource1"
    }

    transposeItems[1] = {
        "text" : transposeSubMenu[1],
        "disabled": false,
        "id": "FromDataSource2"
    }

    if(transposeSubMenu.length > 2) {
        transposeItems[2] = {
            "text" : transposeSubMenu[2],
            "disabled": false,
            "id": "FromDataSource3"
        }
    }

    if(transposeSubMenu.length > 3) {
        transposeItems[3] = {
            "text" : transposeSubMenu[3],
            "disabled": false,
            "id": "FromDataSource4"
        }
    }

    return transposeItems;

}

/* This function checks if selected check  components are transposed or not. 
   It returns true, even if few components out of all selected are transposed and others are not */
ReviewComparisonContextMenuManager.prototype.AreSelectedComponentsTransposed = function () {
  
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();
    if (selectedGroupIdsVsResultIds == undefined) {    
        return false;
    }

    for (var groupId in selectedGroupIdsVsResultIds) {
        var componentIds = selectedGroupIdsVsResultIds[groupId];
        for (var componentId in componentIds) {
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            if (checkResultComponent.status.includes("(T)")) {
                return true;
            }
        }
    }

    return false;
}

/* This function checks if selected check  components are accepted or not. 
   It returns true, even if few components out of all selected are accepted and others are not */
ReviewComparisonContextMenuManager.prototype.AreSelecteComponentsAccepted = function () {
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();
    if (selectedGroupIdsVsResultIds == undefined) {        
        return false;
    }

    for (var groupId in selectedGroupIdsVsResultIds) {
        var componentIds = selectedGroupIdsVsResultIds[groupId];
        for (var componentId in componentIds) {
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            if (checkResultComponent.status.includes("(A)")) {
                return true;
            }
        }
    }

    return false;
}

ReviewComparisonContextMenuManager.prototype.TransposeSubMenuItems = function () {
    var files = model.files;
    var transposeSubMenu = [];
    for (var file in files) {
        var name = "From " + files[file].fileName;
        transposeSubMenu.push(name);
    }

    return transposeSubMenu;
}

/* This function checks if selected check component components are valid for accept or not. 
   It returns true, even if few components out of all selected are valid for accept and others are not */
ReviewComparisonContextMenuManager.prototype.AreComponentsValidForTranspose = function () {

    var ignore = ['OK', 'OK(A)', 'OK(A)(T)', 'No Match', 'undefined'];
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();
    if (selectedGroupIdsVsResultIds == undefined) {
        return false;
    }

    for (var groupId in selectedGroupIdsVsResultIds) {
        var componentIds = selectedGroupIdsVsResultIds[groupId];
        for (var componentId in componentIds) {
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            var index = ignore.indexOf(checkResultComponent.status);
            if (index == -1 &&
                checkResultComponent.transpose == null) {
                return true;
            }
        }
    }

    return false;
}

/* This function checks if selected check components  are valid for accept or not. 
   It returns true, even if few components out of all selected are valid for accept and others are not */
ReviewComparisonContextMenuManager.prototype.AreComponentsValidForAccept = function () {

    var ignore = ['OK', 'OK(T)', 'No Match', 'undefined'];

    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();
    if (selectedGroupIdsVsResultIds == undefined) {
        return false;
    }

    for (var groupId in selectedGroupIdsVsResultIds) {
        var componentIds = selectedGroupIdsVsResultIds[groupId];
        for (var componentId in componentIds) {
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            var index = ignore.indexOf(checkResultComponent.status);
            if (index == -1) {
                return true;
            }
        }
    }

    return false;
}

/* This function checks if selected check component properties are valid for accept or not. 
   It returns true, even if few properties out of all selected are valid for accept and others are not */
ReviewComparisonContextMenuManager.prototype.ArePropertiesValidForAccept = function () {

    var ignore = ['OK', 'No Value', 'No Value(T)', 'OK(T)', 'Missing Property(s)', ' ', 'undefined'];
    
    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;
    if (selectedPropertiesKey.length == 0) {
        return false;
    }

    var detailInfoContainer = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();

    for (var i = 0; i < selectedPropertiesKey.length; i++) {
        var rowIndex = dataGrid.getRowIndexByKey(selectedPropertiesKey[i]);
        var rowData = data[rowIndex];
        var index = ignore.indexOf(rowData[ComparisonPropertyColumnNames.Status]);
        if (index == -1) {
            return true;
        }
    }

    return false;
}

/* This function checks if selected check component properties are transposed or not. 
   It returns true, even if few properties out of all selected are transposed and others are not */
ReviewComparisonContextMenuManager.prototype.AreSelectedPropertiesTransposed = function () {   
    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;
    if (selectedPropertiesKey.length == 0) {
        return false;
    }

    var detailInfoContainer = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();

    for (var i = 0; i < selectedPropertiesKey.length; i++) {
        var rowIndex = dataGrid.getRowIndexByKey(selectedPropertiesKey[i]);
        var rowData = data[rowIndex];

        if (rowData[ComparisonPropertyColumnNames.Status].includes("(T)")) {
            return true;
        }
    }

    return false;
}

/* This function checks if selected check component properties are accepted or not. 
   It returns true, even if few properties out of all selected are accepted and others are not */
ReviewComparisonContextMenuManager.prototype.AreSelectedPropertiesAccepted = function () {
    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;
    if (selectedPropertiesKey.length == 0) {
        return false;
    }

    var detailInfoContainer = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();

    for (var i = 0; i < selectedPropertiesKey.length; i++) {
        var rowIndex = dataGrid.getRowIndexByKey(selectedPropertiesKey[i]);
        var rowData = data[rowIndex];
        
        if (rowData[ComparisonPropertyColumnNames.Status].includes("ACCEPTED")) {
            return true;
        }
    }

    return false;
}

/* This function checks if selected check component properties are valid for transposed or not. 
   It returns true, even if few properties out of all selected are valid for transposed and others are not */
ReviewComparisonContextMenuManager.prototype.ArePropertiesValidForTranspose = function () {  
    var ignore = ['OK', 'No Value', 'No Value(T)', 'OK(T)', 'ACCEPTED', 'Missing Property(s)', 'undefined'];

    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;
    if (selectedPropertiesKey.length == 0) {
        return false;
    }

    var detailInfoContainer = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();

    for (var i = 0; i < selectedPropertiesKey.length; i++) {
        var rowIndex = dataGrid.getRowIndexByKey(selectedPropertiesKey[i]);
        var rowData = data[rowIndex];

        var index = ignore.indexOf(rowData[ComparisonPropertyColumnNames.Status]);
        if (index === -1) {
            return true;
        }
    }

    return false;
}

ReviewComparisonContextMenuManager.prototype.ChooseRestoreTransposeForGroup = function (groupId) {
    // var groupIndex = model.getCurrentReviewTable().GetAccordionIndex(selectedRow.textContext);
    // var groupData = model.getCurrentReviewTable().GetAccordionData(selectedRow.textContent);
    // var groupId = groupData["groupId"];

    if (comparisonReviewManager.ComparisonCheckManager["results"][groupId].categoryStatus == 'OK(T)') {
        return false;
    }

    return true;
}

ReviewComparisonContextMenuManager.prototype.ChooseActionForComparisonGroup = function (groupId) {
    // var groupData = model.getCurrentReviewTable().GetAccordionData(selectedRow.textContent);
    // var groupId = groupData["groupId"];

    if (comparisonReviewManager.ComparisonCheckManager["results"][groupId].categoryStatus == 'ACCEPTED' ||
        comparisonReviewManager.ComparisonCheckManager["results"][groupId].categoryStatus == 'ACCEPTED(T)') {
        return false;
    }

    return true;
}

ReviewComparisonContextMenuManager.prototype.DisableAcceptForGroup = function (groupId) {
    // var groupData = model.getCurrentReviewTable().GetAccordionData(selectedRow.textContent);
    // var groupId = groupData["groupId"];
    var checkGroup = comparisonReviewManager.ComparisonCheckManager.results[groupId];

    // var selectedRowStatus = selectedRow.cells[ComparisonPropertyColumns.Status].innerHTML;
    if (checkGroup.categoryStatus == 'OK' ||
        checkGroup.ComponentClass == 'Undefined') {
        return true;
    }

    return false;
}

ReviewComparisonContextMenuManager.prototype.DisableContextMenuTransposeForGroup = function (groupId) {
    // var groupData = model.getCurrentReviewTable().GetAccordionData(selectedRow.textContent);
    // var groupId = groupData["groupId"];
    var checkGroup = comparisonReviewManager.ComparisonCheckManager.results[groupId];

    if (checkGroup.categoryStatus == 'OK' ||
        checkGroup.categoryStatus == 'No Match' ||
        checkGroup.categoryStatus == 'OK(T)' ||
        checkGroup.categoryStatus == 'ACCEPTED' ||
        checkGroup.ComponentClass == 'Undefined') {
        return true;
    }

    return false;
}

ReviewComparisonContextMenuManager.prototype.ExecuteContextMenuClicked = function (key,
    optionName,
    accordionData,
    source) {

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
    else if (optionName == "Restore") {
        this.OnRestoreTranspose(accordionData, source);
    }
    else if (key === "FromDataSource1" ||
        key === "FromDataSource2" ||
        key === "FromDataSource3" ||
        key === "FromDataSource4") {
        this.OnTransposeClick(key, accordionData, source);
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

ReviewComparisonContextMenuManager.prototype.OnHideGroup = function (accordionData) {
    var _this = this;

    var groupId = accordionData["groupId"];
    comparisonReviewManager.SelectAllGroupItems(groupId).then(function (rows) {

        var sourceANodeIds = [];
        var sourceBNodeIds = [];
        var sourceCNodeIds = [];
        var sourceDNodeIds = [];
        var selectedComponentRows = [];
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var rowData = row.data;

            //node ids
            // source A        
            if (rowData.SourceANodeId !== "" && rowData.SourceANodeId !== null) {
                sourceANodeIds.push(Number(rowData.SourceANodeId));
            }
            // source B        
            if (rowData.SourceBNodeId !== "" && rowData.SourceBNodeId !== null) {
                sourceBNodeIds.push(Number(rowData.SourceBNodeId));
            }
            // source C        
            if (rowData.SourceCNodeId !== "" && rowData.SourceCNodeId !== null) {
                sourceCNodeIds.push(Number(rowData.SourceCNodeId));
            }
            // source D        
            if (rowData.SourceDNodeId !== "" && rowData.SourceDNodeId !== null) {
                sourceDNodeIds.push(Number(rowData.SourceDNodeId));
            }

            // rowkeys
            selectedComponentRows.push({
                "rowKey": row.key,
                "tableId": _this.ComponentTableContainer
            });
        }
        var nodes = {
            "SourceA": sourceANodeIds,
            "SourceB": sourceBNodeIds,
            "SourceC": sourceCNodeIds,
            "SourceD": sourceDNodeIds
        };

        _this.HideItems(nodes, selectedComponentRows);
    });
}

ReviewComparisonContextMenuManager.prototype.OnIsolateGroup = function (accordionData) {
    var _this = this;

    var groupId = accordionData["groupId"];
    comparisonReviewManager.SelectAllGroupItems(groupId).then(function (rows) {
        var tableId = "#" + accordionData.template + "_" + this.MainReviewTableContainer;

        var sourceANodeIds = [];
        var sourceBNodeIds = [];
        var sourceCNodeIds = [];
        var sourceDNodeIds = [];
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var rowData = row.data;

            //node ids
            // source A        
            if (rowData.SourceANodeId !== "" && rowData.SourceANodeId !== null) {
                sourceANodeIds.push(Number(rowData.SourceANodeId));
            }
            // source B        
            if (rowData.SourceBNodeId !== "" && rowData.SourceBNodeId !== null) {
                sourceBNodeIds.push(Number(rowData.SourceBNodeId));
            }
            // source C        
            if (rowData.SourceCNodeId !== "" && rowData.SourceCNodeId !== null) {
                sourceCNodeIds.push(Number(rowData.SourceCNodeId));
            }
            // source D        
            if (rowData.SourceDNodeId !== "" && rowData.SourceDNodeId !== null) {
                sourceDNodeIds.push(Number(rowData.SourceDNodeId));
            }
        }
        var nodes = {
            "SourceA": sourceANodeIds,
            "SourceB": sourceBNodeIds,
            "SourceC": sourceCNodeIds,
            "SourceD": sourceDNodeIds
        };

        _this.IsolateItems(nodes);
    });
}

ReviewComparisonContextMenuManager.prototype.OnShowGroup = function (accordionData) {
    var _this = this;

    var groupId = accordionData["groupId"];
    comparisonReviewManager.SelectAllGroupItems(groupId).then(function(rows){       
      
        var sourceANodeIds = [];
        var sourceBNodeIds = [];
        var sourceCNodeIds = [];
        var sourceDNodeIds = [];
        var selectedComponentRows = [];
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var rowData = row.data;

            //node ids
            // source A        
            if (rowData.SourceANodeId !== "" && rowData.SourceANodeId !== null) {
                sourceANodeIds.push(Number(rowData.SourceANodeId));
            }
            // source B        
            if (rowData.SourceBNodeId !== "" && rowData.SourceBNodeId !== null) {
                sourceBNodeIds.push(Number(rowData.SourceBNodeId));
            }
            // source C        
            if (rowData.SourceCNodeId !== "" && rowData.SourceCNodeId !== null) {
                sourceCNodeIds.push(Number(rowData.SourceCNodeId));
            }
            // source D        
            if (rowData.SourceDNodeId !== "" && rowData.SourceDNodeId !== null) {
                sourceDNodeIds.push(Number(rowData.SourceDNodeId));
            }

            // rowkeys
            selectedComponentRows.push({
                "rowKey": row.key,
                "tableId": _this.ComponentTableContainer
            });
        }
        var nodes = {
            "SourceA": sourceANodeIds,
            "SourceB": sourceBNodeIds,
            "SourceC": sourceCNodeIds,
            "SourceD": sourceDNodeIds
        };

        _this.ShowItems(nodes, selectedComponentRows);
    });    
}

ReviewComparisonContextMenuManager.prototype.OnModelViewsClicked = function () {
    // Close other menus open
    closeAnyOpenMenu();

    var menus = model.checks[model.currentCheck].menus;
    for (var viewerId in menus) {
        if ("ModelViewsMenu" in menus[viewerId]) {
            menus[viewerId]["ModelViewsMenu"].Open();

            var sourceName;
            if (viewerId == "a") {
                sourceName = model.checks[model.currentCheck].reviewManager.ComparisonCheckManager.sources[0];
            }
            else if (viewerId == "b") {
                sourceName = model.checks[model.currentCheck].reviewManager.ComparisonCheckManager.sources[1];
            }
            else if (viewerId == "c") {
                sourceName = model.checks[model.currentCheck].reviewManager.ComparisonCheckManager.sources[2];
            }
            else if (viewerId == "d") {
                sourceName = model.checks[model.currentCheck].reviewManager.ComparisonCheckManager.sources[3];
            }

            if (sourceName) {
                DevExpress.ui.notify(
                    "Hovering menus enabled for " + "'" + sourceName + "'",
                    "success",
                    1500);
            }

            break;
        }
    }
}

ReviewComparisonContextMenuManager.prototype.OnAcceptComponents = function () {
    var ignore = ['OK', 'OK(T)', 'OK(A)', 'No Value', 'No Value(T)', 'OK(A)(T)', 'No Match'];

    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if (selectedGroupIdsVsResultIds == undefined) {
        return;
    }

    // Filter elements to perform accept on. If component is already accepted or transposed dont perform anything on it.
    // No match, OK, No Value components should not get accepted or transposed
    var groupIdVsComponentId = {};
    for (var groupId in selectedGroupIdsVsResultIds) {
        for (var componentId in selectedGroupIdsVsResultIds[groupId]) {
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, selectedGroupIdsVsResultIds[groupId][componentId]);
            var index = ignore.indexOf(checkResultComponent.status);
            if (index !== -1) {
                continue;
            }
            else {
                if (groupId in groupIdVsComponentId) {
                    groupIdVsComponentId[groupId].push(Number(selectedGroupIdsVsResultIds[groupId][componentId]));
                }
                else {
                    groupIdVsComponentId[groupId] = [];
                    groupIdVsComponentId[groupId].push(Number(selectedGroupIdsVsResultIds[groupId][componentId]));
                }
            }
        }
    }

    if (Object.keys(groupIdVsComponentId).length == 0) {
        return;
    }

    comparisonReviewManager.AcceptComponents(groupIdVsComponentId);
}

ReviewComparisonContextMenuManager.prototype.OnAcceptProperty = function () {

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

    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;

    if (selectedPropertiesKey.length == 0) {
        return;
    }

    // Filter elements to perform accept on. If component is already accepted or transposed dont perform anything on it.
    // No match, OK, No Value components should not get accepted or transposed
    var ignore = ['OK', 'OK(T)', 'ACCEPTED', 'No Value', 'No Value(T)', 'No Match', 'Missing Property(s)', ' '];
    var selectedProperties = []
    for (var key in selectedPropertiesKey) {
        var property = comparisonReviewManager.GetcheckProperty(componentId, groupId, Number(selectedPropertiesKey[key]));
        var index = ignore.indexOf(property.severity);
        if (index !== -1) {
            continue;
        }
        else {
            selectedProperties.push(Number(selectedPropertiesKey[key]));
        }
    }

    if (selectedProperties.length == 0) {
        return;
    }

    comparisonReviewManager.AcceptProperty(selectedProperties, componentId, groupId);
}

ReviewComparisonContextMenuManager.prototype.OnAcceptGroup = function (accordionData) {
    comparisonReviewManager.updateStatusOfCategory(accordionData);
}

ReviewComparisonContextMenuManager.prototype.OnUnAcceptComponents = function () {
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if (selectedGroupIdsVsResultIds == undefined) {
        return;
    }

    var ignore = ['OK', 'OK(T)', 'No Value', 'No Value(T)', 'No Match'];
    // Filter elements to perform accept on. If component is already accepted or transposed dont perform anything on it.
    // No match, OK, No Value components should not get accepted or transposed
    var groupIdVsComponentId = {};
    for (var groupId in selectedGroupIdsVsResultIds) {
        for (var componentId in selectedGroupIdsVsResultIds[groupId]) {
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, selectedGroupIdsVsResultIds[groupId][componentId]);
            var index = ignore.indexOf(checkResultComponent.status);
            if (index !== -1) {
                continue;
            }
            else {
                if (groupId in groupIdVsComponentId) {
                    groupIdVsComponentId[groupId].push(Number(selectedGroupIdsVsResultIds[groupId][componentId]));
                }
                else {
                    groupIdVsComponentId[groupId] = [];
                    groupIdVsComponentId[groupId].push(Number(selectedGroupIdsVsResultIds[groupId][componentId]));
                }
            }
        }
    }

    if (Object.keys(groupIdVsComponentId).length == 0) {
        return;
    }

    comparisonReviewManager.UnAcceptComponents(groupIdVsComponentId);
}

ReviewComparisonContextMenuManager.prototype.OnUnAcceptProperty = function (rowClicked) {

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

    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;

    if (selectedPropertiesKey.length == 0) {
        return;
    }

    // Filter elements to perform accept on. If component is already accepted or transposed dont perform anything on it.
    // No match, OK, No Value components should not get accepted or transposed
    var ignore = ['OK', 'OK(T)', 'No Value', 'No Value(T)', 'No Match', 'Missing Property(s)', ' '];
    var selectedProperties = []
    for (var key in selectedPropertiesKey) {
        var property = comparisonReviewManager.GetcheckProperty(componentId, groupId, Number(selectedPropertiesKey[key]));
        var index = ignore.indexOf(property.severity);
        if (index !== -1) {
            continue;
        }
        else {
            selectedProperties.push(Number(selectedPropertiesKey[key]));
        }
    }

    if (selectedProperties.length == 0) {
        return;
    }

    comparisonReviewManager.UnAcceptProperty(selectedProperties, componentId, groupId);
}

ReviewComparisonContextMenuManager.prototype.OnUnAcceptGroup = function (accordionData) {
    comparisonReviewManager.UnAcceptCategory(accordionData);
}

ReviewComparisonContextMenuManager.prototype.OnRestoreTranspose = function (accordionData, source) {

    if (source.toLowerCase() === "component") {
        var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();
        if (selectedGroupIdsVsResultIds == undefined) {
            return;
        }

        var ignore = ['OK', 'OK(A)', 'No Value', 'No Match'];
        // Filter elements to perform accept on. If component is already accepted or transposed dont perform anything on it.
        // No match, OK, No Value components should not get accepted or transposed
        var groupIdVsComponentId = {};
        for (var groupId in selectedGroupIdsVsResultIds) {
            for (var componentId in selectedGroupIdsVsResultIds[groupId]) {
                var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, selectedGroupIdsVsResultIds[groupId][componentId]);
                var index = ignore.indexOf(checkResultComponent.status);
                if (index !== -1) {
                    continue;
                }
                else {
                    if (groupId in groupIdVsComponentId) {
                        groupIdVsComponentId[groupId].push(Number(selectedGroupIdsVsResultIds[groupId][componentId]));
                    }
                    else {
                        groupIdVsComponentId[groupId] = [];
                        groupIdVsComponentId[groupId].push(Number(selectedGroupIdsVsResultIds[groupId][componentId]));
                    }
                }
            }
        }

        if (Object.keys(groupIdVsComponentId).length == 0) {
            return;
        }

        comparisonReviewManager.RestoreComponentTranspose(groupIdVsComponentId);
    }
    else if (source.toLowerCase() === "property") {
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

        // get component ids in datasets
        let sourceCompIds = {};
        sourceCompIds["a"] = Number(rowData.SourceAId);
        sourceCompIds["b"] = Number(rowData.SourceBId);
        if (rowData.SourceCId && rowData.SourceCId !== "") {
            sourceCompIds["c"] = Number(rowData.SourceCId);
        }
        if (rowData.SourcDId && rowData.SourceDId !== "") {
            sourceCompIds["d"] = Number(rowData.SourceDId);
        }

        var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;
        if (selectedPropertiesKey.length == 0) {
            return;
        }

        // Filter elements to perform accept on. If component is already accepted or transposed dont perform anything on it.
        // No match, OK, No Value components should not get accepted or transposed
        var ignore = ['OK', 'OK(A)', 'No Value', 'No Match', 'Missing Property(s)', ' ', 'ACCEPTED'];
        var selectedProperties = []
        let sourceProps = [];
        for (var key in selectedPropertiesKey) {
            var property = comparisonReviewManager.GetcheckProperty(componentId, groupId, Number(selectedPropertiesKey[key]));
            var index = ignore.indexOf(property.severity);
            if (index !== -1) {
                continue;
            }

            selectedProperties.push(Number(selectedPropertiesKey[key]));

            // get data set properties data
            let sourceProp = {};               
            if (property.sourceAName && property.sourceAName !== "") {
                sourceProp["aName"] = property.sourceAName;
                sourceProp["aValue"] = property.sourceAValue;
            }
            if (property.sourceBName && property.sourceBName !== "") {
                sourceProp["bName"] = property.sourceBName;
                sourceProp["bValue"] = property.sourceBValue;
            }
            if (property.sourceCName && property.sourceCName !== "") {
                sourceProp["cName"] = property.sourceCName;
                sourceProp["cValue"] = property.sourceCValue;
            }
            if (property.sourceDName && property.sourceDName !== "") {
                sourceProp["dName"] = property.sourceDName;
                sourceProp["dValue"] = property.sourceDValue;
            }

            sourceProps.push(sourceProp);
        }

        comparisonReviewManager.RestorePropertyTranspose(
            selectedProperties, 
            componentId, 
            groupId, 
            sourceCompIds,
            sourceProps);
    }
    else if (source.toLowerCase() === "group") {
        comparisonReviewManager.RestoreCategoryTranspose(accordionData);
    }
}

ReviewComparisonContextMenuManager.prototype.OnTransposeClick = function (key, accordionData, source) {

    if (source.toLowerCase() === "component") {
        var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();
        if (selectedGroupIdsVsResultIds == undefined) {
            return;
        }

        var ignore = ['OK', 'OK(T)', 'OK(A)', 'No Value', 'No Value(T)', 'OK(A)(T)', 'No Match'];
        // Filter elements to perform accept on. If component is already accepted or transposed dont perform anything on it.
        // No match, OK, No Value components should not get accepted or transposed
        var groupIdVsComponentId = {};        
        for (var groupId in selectedGroupIdsVsResultIds) {
            for (var componentId in selectedGroupIdsVsResultIds[groupId]) {
                var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, selectedGroupIdsVsResultIds[groupId][componentId]);
                var index = ignore.indexOf(checkResultComponent.status);
                if (index !== -1) {
                    continue;
                }

                if (groupId in groupIdVsComponentId) {
                    groupIdVsComponentId[groupId].push(Number(selectedGroupIdsVsResultIds[groupId][componentId]));
                }
                else {
                    groupIdVsComponentId[groupId] = [];
                    groupIdVsComponentId[groupId].push(Number(selectedGroupIdsVsResultIds[groupId][componentId]));
                }
            }
        }
        if (Object.keys(groupIdVsComponentId).length == 0) {
            return;
        }

        comparisonReviewManager.TransposeComponent(key, groupIdVsComponentId);
    }
    else if (source.toLowerCase() === "property") {
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

        // get component ids in datasets
        let sourceCompIds = {};
        sourceCompIds["a"] = Number(rowData.SourceAId);
        sourceCompIds["b"] = Number(rowData.SourceBId);
        if (rowData.SourceCId && rowData.SourceCId !== "") {
            sourceCompIds["c"] = Number(rowData.SourceCId);
        }
        if (rowData.SourcDId && rowData.SourceDId !== "") {
            sourceCompIds["d"] = Number(rowData.SourceDId);
        }

        var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;
        if (selectedPropertiesKey.length == 0) {
            return;
        }

        // Filter elements to perform accept on. If component is already accepted or transposed dont perform anything on it.
        // No match, OK, No Value components should not get accepted or transposed
        var ignore = ['OK', 'OK(T)', 'ACCEPTED', 'No Value', 'No Value(T)', 'No Match', 'Missing Property(s)', ' '];
        var selectedProperties = [];
        let sourceProps = [];
        for (var i = 0; i < selectedPropertiesKey.length; i++) {
            // for (var propertyKey in selectedPropertiesKey) {
            var checkPropId = selectedPropertiesKey[i];
            var property = comparisonReviewManager.GetcheckProperty(componentId, groupId, Number(checkPropId));
            var index = ignore.indexOf(property.severity);
            if (index !== -1) {
                continue;
            }

            selectedProperties.push(Number(checkPropId));

            // get data set properties data
            let sourceProp = {};

            // get transposed value           
            if (key.toLowerCase() === "fromdatasource1") {
                sourceProp["transposedValue"] = property.sourceAValue;
            }
            else if (key.toLowerCase() === "fromdatasource2") {
                sourceProp["transposedValue"] = property.sourceBValue;
            }
            else if (key.toLowerCase() === "fromdatasource3") {
                sourceProp["transposedValue"] = property.sourceCValue;
            }
            else if (key.toLowerCase() === "fromdatasource4") {
                sourceProp["transposedValue"] = property.sourceDValue;
            }

            if (property.sourceAName && property.sourceAName !== "") {
                sourceProp["a"] = property.sourceAName;
            }
            if (property.sourceBName && property.sourceBName !== "") {
                sourceProp["b"] = property.sourceBName;
            }
            if (property.sourceCName && property.sourceCName !== "") {
                sourceProp["c"] = property.sourceCName;
            }
            if (property.sourceDName && property.sourceDName !== "") {
                sourceProp["d"] = property.sourceDName;
            }

            sourceProps.push(sourceProp);
        }
        if (selectedProperties.length == 0) {
            return;
        }

        comparisonReviewManager.TransposeProperty(
            key, 
            selectedProperties, 
            componentId, 
            groupId, 
            sourceCompIds,
            sourceProps);
    }
    else if (source.toLowerCase() === "group") {
        comparisonReviewManager.TransposeCategory(key, accordionData);
    }

}

ReviewComparisonContextMenuManager.prototype.OnIsolateClick = function () {

    // get selected source A and B node ids
    var nodes = this.GetNodeIdsFormComponentRow();
    if (!nodes) {
        return;
    }

    this.IsolateItems(nodes);
}

ReviewComparisonContextMenuManager.prototype.IsolateItems = function (nodes) {
    // source a isolate
    var sourceANodeIds = nodes["SourceA"];
    var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];

    if (sourceANodeIds.length > 0 &&
        sourceAViewerInterface) {

        // perform isolate
        var isolateManager = new IsolateManager(sourceAViewerInterface.Viewer);
        isolateManager.Isolate(sourceANodeIds).then(function (affectedNodes) {

        });

    }

    // source b isolate
    var sourceBNodeIds = nodes["SourceB"];
    var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];

    if (sourceBNodeIds.length > 0 &&
        sourceBViewerInterface) {

        // perform isolate
        var isolateManager = new IsolateManager(sourceBViewerInterface.Viewer);
        isolateManager.Isolate(sourceBNodeIds).then(function (affectedNodes) {

        });
    }

    // source c isolate
    var sourceCNodeIds = nodes["SourceC"];
    var sourceCViewerInterface = model.checks["comparison"]["sourceCViewer"];

    if (sourceCNodeIds.length > 0 &&
        sourceCViewerInterface) {
        // perform isolate
        var isolateManager = new IsolateManager(sourceCViewerInterface.Viewer);
        isolateManager.Isolate(sourceCNodeIds).then(function (affectedNodes) {

        });
    }

    // source d isolate
    var sourceDNodeIds = nodes["SourceD"];
    var sourceDViewerInterface = model.checks["comparison"]["sourceDViewer"];

    if (sourceDNodeIds.length > 0 &&
        sourceDViewerInterface) {
        // perform isolate
        var isolateManager = new IsolateManager(sourceDViewerInterface.Viewer);
        isolateManager.Isolate(sourceDNodeIds).then(function (affectedNodes) {

        });
    }
}

ReviewComparisonContextMenuManager.prototype.OnShowClick = function () {
    // get selected source A and B node ids
    var nodes = this.GetNodeIdsFormComponentRow();
    if (!nodes) {
        return;
    }

    var SelectedComponentRows = model.getCurrentSelectionManager().GetSelectedComponents();

    this.ShowItems(nodes, SelectedComponentRows);
}

ReviewComparisonContextMenuManager.prototype.ShowItems = function(nodes, SelectedComponentRows){
        // source A
        var sourceANodeIds = nodes["SourceA"];
        var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
    
        if (sourceANodeIds.length > 0 &&
            sourceAViewerInterface) {
            sourceAViewerInterface.Viewer.model.setNodesVisibility(sourceANodeIds, true).then(function () {
                sourceAViewerInterface.Viewer.view.fitWorld();
            });
            //Remove resultId on show
            sourceAViewerInterface.RemoveHiddenResultId(SelectedComponentRows);
        }
    
        // source b
        var sourceBNodeIds = nodes["SourceB"];
        var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
        if (sourceBNodeIds.length > 0 &&
            sourceBViewerInterface) {
            sourceBViewerInterface.Viewer.model.setNodesVisibility(sourceBNodeIds, true).then(function () {
                sourceBViewerInterface.Viewer.view.fitWorld();
            });
    
            //Remove resultId on show
            sourceBViewerInterface.RemoveHiddenResultId(SelectedComponentRows);
        }

        // source c
        var sourceCNodeIds = nodes["SourceC"];
        var sourceCViewerInterface = model.checks["comparison"]["sourceCViewer"];
        if (sourceCNodeIds.length > 0 &&
            sourceCViewerInterface) {
            sourceCViewerInterface.Viewer.model.setNodesVisibility(sourceCNodeIds, true).then(function () {
                sourceCViewerInterface.Viewer.view.fitWorld();
            });

            //Remove resultId on show
            sourceCViewerInterface.RemoveHiddenResultId(SelectedComponentRows);
        }

        // source d
        var sourceDNodeIds = nodes["SourceD"];
        var sourceDViewerInterface = model.checks["comparison"]["sourceDViewer"];
        if (sourceDNodeIds.length > 0 &&
            sourceDViewerInterface) {
            sourceDViewerInterface.Viewer.model.setNodesVisibility(sourceDNodeIds, true).then(function () {
                sourceDViewerInterface.Viewer.view.fitWorld();
            });

            //Remove resultId on show
            sourceDViewerInterface.RemoveHiddenResultId(SelectedComponentRows);
        }
    
        var rows = [];
        for (var i = 0; i < SelectedComponentRows.length; i++) {
            var dataGrid = $(SelectedComponentRows[i]["tableId"]).dxDataGrid("instance");
            var rowIndex = dataGrid.getRowIndexByKey(SelectedComponentRows[i]["rowKey"]);
            var row = dataGrid.getRowElement(rowIndex)[0];
            rows.push(row);
        }
    
        model.checks[model.currentCheck]["reviewTable"].HighlightHiddenRows(false, rows);
}

ReviewComparisonContextMenuManager.prototype.OnHideClick = function () {
    // get selected source A and B node ids
    var nodes = this.GetNodeIdsFormComponentRow();
    if (!nodes) {
        return;
    }

    var SelectedComponentRows = model.getCurrentSelectionManager().GetSelectedComponents();

    this.HideItems(nodes, SelectedComponentRows);
}

ReviewComparisonContextMenuManager.prototype.HideItems = function(nodes, SelectedComponentRows){
    // source A
    var sourceANodeIds = nodes["SourceA"];
    var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];

    if (sourceANodeIds.length > 0 &&
        sourceAViewerInterface) {
        sourceAViewerInterface.Viewer.model.setNodesVisibility(sourceANodeIds, false).then(function () {
            sourceAViewerInterface.Viewer.view.fitWorld();
        });
        //Store resultId of hidden elements
        sourceAViewerInterface.StoreHiddenResultId(SelectedComponentRows);
    }

    // source b
    var sourceBNodeIds = nodes["SourceB"];
    var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
    if (sourceBNodeIds.length > 0 &&
        sourceBViewerInterface) {
        sourceBViewerInterface.Viewer.model.setNodesVisibility(sourceBNodeIds, false).then(function () {
            sourceBViewerInterface.Viewer.view.fitWorld();
        });
        //Store resultId of hidden elements
        sourceBViewerInterface.StoreHiddenResultId(SelectedComponentRows);
    }

    // source C
    var sourceCNodeIds = nodes["SourceC"];
    var sourceCViewerInterface = model.checks["comparison"]["sourceCViewer"];

    if (sourceCNodeIds.length > 0 &&
        sourceCViewerInterface) {
            sourceCViewerInterface.Viewer.model.setNodesVisibility(sourceCNodeIds, false).then(function () {
                sourceCViewerInterface.Viewer.view.fitWorld();
        });
        //Store resultId of hidden elements
        sourceCViewerInterface.StoreHiddenResultId(SelectedComponentRows);
    }

    // source D
    var sourceDNodeIds = nodes["SourceD"];
    var sourceDViewerInterface = model.checks["comparison"]["sourceDViewer"];

    if (sourceDNodeIds.length > 0 &&
        sourceDViewerInterface) {
            sourceDViewerInterface.Viewer.model.setNodesVisibility(sourceDNodeIds, false).then(function () {
                sourceDViewerInterface.Viewer.view.fitWorld();
        });
        //Store resultId of hidden elements
        sourceDViewerInterface.StoreHiddenResultId(SelectedComponentRows);
    }

    var rows = [];
    for (var i = 0; i < SelectedComponentRows.length; i++) {
        var dataGrid = $(SelectedComponentRows[i]["tableId"]).dxDataGrid("instance");
        var rowIndex = dataGrid.getRowIndexByKey(SelectedComponentRows[i]["rowKey"]);
        var row = dataGrid.getRowElement(rowIndex)[0];
        rows.push(row);
    }

    model.checks[model.currentCheck]["reviewTable"].HighlightHiddenRows(true, rows);
}

ReviewComparisonContextMenuManager.prototype.GetNodeIdsFormComponentRow = function () {
    var selectedComponents = model.getCurrentSelectionManager().GetSelectedComponents();
    if (selectedComponents.length === 0) {
        return undefined;
    }

    var sourceANodeIds = [];
    var sourceBNodeIds = [];
    var sourceCNodeIds = [];
    var sourceDNodeIds = [];
    for (var i = 0; i < selectedComponents.length; i++) {
        var selectedRow = selectedComponents[i];

        var dataGrid = $(selectedRow["tableId"]).dxDataGrid("instance");
        var rowsData = dataGrid.getDataSource().items();

        var rowIndex = dataGrid.getRowIndexByKey(selectedRow["rowKey"]);
        var rowData = rowsData[rowIndex];
        // source A        
        if (rowData.SourceANodeId !== "" && rowData.SourceANodeId !== null) {
            sourceANodeIds.push(Number(rowData.SourceANodeId));
        }

        // source B        
        if (rowData.SourceBNodeId !== "" && rowData.SourceBNodeId !== null) {
            sourceBNodeIds.push(Number(rowData.SourceBNodeId));
        }

         // source C        
         if (rowData.SourceCNodeId !== "" && rowData.SourceCNodeId !== null) {
            sourceCNodeIds.push(Number(rowData.SourceCNodeId));
        }

         // source D        
         if (rowData.SourceDNodeId !== "" && rowData.SourceDNodeId !== null) {
            sourceDNodeIds.push(Number(rowData.SourceDNodeId));
        }
    }

    return {
        "SourceA": sourceANodeIds,
        "SourceB": sourceBNodeIds,
        "SourceC": sourceCNodeIds,
        "SourceD": sourceDNodeIds
    };
}

ReviewComparisonContextMenuManager.prototype.GetSelectedGroupIdsVsResultsIds = function () {
    var selectedComponents = model.getCurrentSelectionManager().GetSelectedComponents();
    if (selectedComponents.length === 0) {
        return undefined;
    }

    var selectedGroupIdsVsResultIds = {};
    // var selectedResultIdsVsRowElements = {};
    for (var i = 0; i < selectedComponents.length; i++) {
        var selectedRow = selectedComponents[i];
        // var dataGrid = $(selectedRow["tableId"]).dxDataGrid("instance");
        // var rowsData = dataGrid.getDataSource().items();
        // var rowIndex = dataGrid.getRowIndexByKey(selectedRow["rowKey"]);

        var tableIds = model.getCurrentReviewTable().CheckTableIds;
        var groupId = Object.keys(tableIds).find(key => tableIds[key] === selectedRow["tableId"]);
        var resultId = selectedRow["rowKey"];

        // selectedResultIdsVsRowElements[resultId] = selectedRow["row"];

        if (groupId in selectedGroupIdsVsResultIds) {
            selectedGroupIdsVsResultIds[groupId].push(Number(resultId));
        }
        else {
            selectedGroupIdsVsResultIds[groupId] = [];
            selectedGroupIdsVsResultIds[groupId].push(Number(resultId));
        }
    }

    return selectedGroupIdsVsResultIds;
}

ReviewComparisonContextMenuManager.prototype.OnStartTranslucency = function () {

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
    var sourceANodeIds = nodes["SourceA"];
    var sourceBNodeIds = nodes["SourceB"];
    var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
    var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];

    var viewers = [];
    var selectedNodes = {};
    if (sourceANodeIds.length > 0 && sourceAViewerInterface) {
        viewers.push(sourceAViewerInterface.Viewer);
        selectedNodes[sourceAViewerInterface.Viewer._params.containerId] = sourceANodeIds;
    }
    if (sourceBNodeIds.length > 0 && sourceBViewerInterface) {
        viewers.push(sourceBViewerInterface.Viewer);
        selectedNodes[sourceBViewerInterface.Viewer._params.containerId] = sourceBNodeIds;
    }

    var translucencyControls = {};
    translucencyControls["slider"] = "translucencySlider2"
    translucencyControls["output"] = "translucencyValue2";
    translucencyControls["overlay"] = "translucencyOverlay2";

    var translucencyManager = new TranslucencyManager(viewers, selectedNodes, translucencyControls);
    translucencyManager.Start();

    translucencyManagers["both"] = translucencyManager;
}

ReviewComparisonContextMenuManager.prototype.OnStopTranslucency = function () {
    if (!("both" in translucencyManagers)) {
        return;
    }
    this.TranslucencyActive = false;

    translucencyManagers["both"].Stop();
    delete translucencyManagers["both"];
}

ReviewComparisonContextMenuManager.prototype.onReferenceClick = function () {

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