function ReviewComparisonContextMenuManager(comparisonReviewManager) {
    // call super constructor
    ReviewModuleContextMenuManager.call(this);

    this.ComparisonReviewManager = comparisonReviewManager;

    this.ComponentTableContainer;
    this.PropertyTableContainer;
    this.GroupTableContainer;
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
            var accept = true;
            var transpose = true;
            var transposeSubMenu = [];
            // _this.ComponentTableContainer = componentTableContainer;
            transpose = _this.ChooseRestoreTransposeForComponent(selectedRow[0]);
            accept = _this.ChooseActionForComparisonComponent(selectedRow[0]);
            transposeSubMenu = _this.TransposeSubMenuItems();
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            var transposeconditionalName = (transpose) ? 'Transpose' : 'Restore';
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
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = _this.DisableAcceptForComponent(this[0]);
                            return disable;
                        }
                    },
                    "transposeItem": {
                        name: transposeconditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = _this.DisableContextMenuTransposeForComponent(this[0]);
                            return disable;
                        },
                        visible: function () {
                            if (transposeconditionalName == 'Restore') {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        items: {
                            "FromDataSource1": { name: transposeSubMenu[0] },
                            "FromDataSource2": { name: transposeSubMenu[1] },
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
                                    else {
                                        return false;
                                    }
                                }
                            },
                            "FromDataSource4":
                            {
                                name: function () {
                                    if (transposeSubMenu.length > 3)
                                        return transposeSubMenu[3];
                                    else
                                        return "";
                                },
                                visible: function () {
                                    if (transposeSubMenu.length > 3) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }
                                }
                            },
                        }
                    },
                    "restoreItem": {
                        name: transposeconditionalName,
                        visible: function () {
                            if (transposeconditionalName == 'Restore') {
                                return true;
                            }
                            else {
                                return false;
                            }
                        },
                        disabled: function () {
                            var disable = false;
                            disable = _this.DisableContextMenuRestoreForComponent(this[0]);
                            return disable;
                        },
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

ReviewComparisonContextMenuManager.prototype.HaveSCOperations = function () {
    if (model.checks["comparison"]["sourceAViewer"].ViewerOptions ||
        model.checks["comparison"]["sourceBViewer"].ViewerOptions) {
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
            var selectedRow = $triggerElement;
            var accept = true;
            var transpose = true;
            var transposeSubMenu = [];
            transpose = _this.ChooseRestoreTransposeForProperty(selectedRow[0]);
            accept = _this.ChooseActionForComparisonProperty(selectedRow[0]);
            transposeSubMenu = _this.TransposeSubMenuItems();
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            var transposeconditionalName = (transpose) ? 'Transpose' : 'Restore';
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
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = _this.DisableAcceptForProperty(this[0]);
                            return disable;
                        }
                    },
                    "transposeItem": {
                        name: transposeconditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = _this.DisableContextMenuTransposeForProperty(this[0]);
                            return disable;
                        },
                        visible: function () {
                            if (transposeconditionalName == 'Restore') {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        items: {
                            "FromDataSource1": { name: transposeSubMenu[0] },
                            "FromDataSource2": { name: transposeSubMenu[1] },
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
                                    else {
                                        return false;
                                    }
                                }
                            },
                            "FromDataSource4":
                            {
                                name: function () {
                                    if (transposeSubMenu.length > 3)
                                        return transposeSubMenu[3];
                                    else
                                        return "";
                                },
                                visible: function () {
                                    if (transposeSubMenu.length > 3) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }
                                }
                            },
                        }
                    },
                    "restoreItem": {
                        name: transposeconditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = _this.DisableContextMenuRestoreForProperty(this[0]);
                            return disable;
                        },
                        visible: function () { if (transposeconditionalName == 'Restore') { return true; } else { return false; } },
                    }
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

ReviewComparisonContextMenuManager.prototype.ChooseRestoreTransposeForComponent = function (selectedRow) {

    var transpose = false;
    var ignore = ['OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'No Match'];
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if (selectedGroupIdsVsResultIds == undefined) {
        transpose = true;
        return transpose;
    }

    for (var groupId in selectedGroupIdsVsResultIds) {
        var componentIds = selectedGroupIdsVsResultIds[groupId];
        for (var componentId in componentIds) {
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            var index = ignore.indexOf(checkResultComponent.status);
            if (index == -1 && checkResultComponent.transpose == null) {
                transpose = true;
            }
        }
    }

    return transpose;
}

ReviewComparisonContextMenuManager.prototype.ChooseActionForComparisonComponent = function (selectedRow) {

    var accept = false;
    var ignore = ['OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'No Match'];
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if (selectedGroupIdsVsResultIds == undefined) {
        accept = true;
        return accept;
    }

    for (var groupId in selectedGroupIdsVsResultIds) {
        var componentIds = selectedGroupIdsVsResultIds[groupId];
        for (var componentId in componentIds) {
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            var index = ignore.indexOf(checkResultComponent.status);
            if (index == -1) {
                accept = true;
            }
        }
    }

    return accept;
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

ReviewComparisonContextMenuManager.prototype.DisableContextMenuTransposeForComponent = function (selectedRow) {

    var transpose = true;
    var ignore = ['OK', 'OK(A)', 'OK(A)(T)', 'No Match'];
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if (selectedGroupIdsVsResultIds == undefined) {
        return transpose;
    }

    for (var groupId in selectedGroupIdsVsResultIds) {
        var componentIds = selectedGroupIdsVsResultIds[groupId];
        for (var componentId in componentIds) {
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            var index = ignore.indexOf(checkResultComponent.status);
            if (index == -1 && checkResultComponent.transpose == null) {
                transpose = false;
            }
        }
    }
    return transpose;
}

ReviewComparisonContextMenuManager.prototype.DisableContextMenuRestoreForComponent = function() {
    var restore = true;
    var ignore = ['OK', 'OK(T)', 'OK(A)(T)', 'No Match'];
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if (selectedGroupIdsVsResultIds == undefined) {
        return restore;
    }

    for (var groupId in selectedGroupIdsVsResultIds) {
        var componentIds = selectedGroupIdsVsResultIds[groupId];
        for (var componentId in componentIds) {
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            var index = ignore.indexOf(checkResultComponent.status);
            if (index > 0 && checkResultComponent.transpose !== null) {
                restore = false;
            }
        }
    }
    return restore;
}

ReviewComparisonContextMenuManager.prototype.DisableAcceptForComponent = function (selectedRow) {

    var accept = true;
    var ignore = ['OK', 'OK(T)', 'No Match'];
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if (selectedGroupIdsVsResultIds == undefined) {
        return accept;
    }

    for (var groupId in selectedGroupIdsVsResultIds) {
        var componentIds = selectedGroupIdsVsResultIds[groupId];
        for (var componentId in componentIds) {
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            var index = ignore.indexOf(checkResultComponent.status);
            if (index == -1) {
                accept = false;
            }
        }
    }

    return accept;
}

ReviewComparisonContextMenuManager.prototype.DisableAcceptForProperty = function (selectedRow) {
    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;
    var ignore = ['OK', 'No Value', 'OK(T)', 'Missing Property(s)', ' '];
    var accepted = true;

    if (selectedPropertiesKey.length == 0) {
        accepted = true;
        return accepted;
    }

    var detailInfoContainer = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();

    for (var i = 0; i < selectedPropertiesKey.length; i++) {
        var rowIndex = dataGrid.getRowIndexByKey(selectedPropertiesKey[i]);
        var rowData = data[rowIndex];
        var index = ignore.indexOf(rowData[ComparisonPropertyColumnNames.Status]);
        if (index == -1) {
            accepted = false;
        }
    }

    return accepted;
}

ReviewComparisonContextMenuManager.prototype.ChooseRestoreTransposeForProperty = function (selectedRow) {
    var transpose = false;
    var ignore = ['OK', 'No Value', 'OK(T)', 'Missing Property(s)'];
    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;

    if (selectedPropertiesKey.length == 0) {
        transpose = true;
        return transpose;
    }

    var detailInfoContainer = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();

    for (var i = 0; i < selectedPropertiesKey.length; i++) {
        var rowIndex = dataGrid.getRowIndexByKey(selectedPropertiesKey[i]);
        var rowData = data[rowIndex];
        var sourceAPropertyName = rowData[ComparisonPropertyColumnNames.SourceAName];
        var sourceBPropertyName = rowData[ComparisonPropertyColumnNames.SourceBName];

        var index = ignore.indexOf(rowData[ComparisonPropertyColumnNames.Status]);
        if (index == -1) {
            if ((sourceAPropertyName !== "" && sourceBPropertyName !== "")) {
                transpose = true;
            }
        }
    }

    return transpose;
}

ReviewComparisonContextMenuManager.prototype.ChooseActionForComparisonProperty = function (selectedRow) {

    var accept = false;
    var ignore = ['OK', 'No Value', 'ACCEPTED', 'OK(T)', 'Missing Property(s)', ' '];
    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;

    if (selectedPropertiesKey.length == 0) {
        accept = true;
        return accept;
    }

    var detailInfoContainer = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();

    for (var i = 0; i < selectedPropertiesKey.length; i++) {
        var rowIndex = dataGrid.getRowIndexByKey(selectedPropertiesKey[i]);
        var rowData = data[rowIndex];
        var index = ignore.indexOf(rowData[ComparisonPropertyColumnNames.Status]);
        if (index == -1) {
            accept = true;
        }
    }

    return accept;
}

ReviewComparisonContextMenuManager.prototype.DisableContextMenuTransposeForProperty = function (selectedRow) {

    var transpose = true;
    var ignore = ['OK', 'No Value', 'OK(T)', 'ACCEPTED', 'Missing Property(s)'];
    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;

    if (selectedPropertiesKey.length == 0) {
        transpose = true;
        return transpose;
    }

    var detailInfoContainer = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();

    for (var i = 0; i < selectedPropertiesKey.length; i++) {
        var rowIndex = dataGrid.getRowIndexByKey(selectedPropertiesKey[i]);
        var rowData = data[rowIndex];
        var sourceAPropertyName = rowData[ComparisonPropertyColumnNames.SourceAName];
        var sourceBPropertyName = rowData[ComparisonPropertyColumnNames.SourceBName];

        var index = ignore.indexOf(rowData[ComparisonPropertyColumnNames.Status]);
        if (index == -1) {
            if ((sourceAPropertyName !== "" && sourceBPropertyName !== "")) {
                transpose = false;
            }
        }
    }

    return transpose;
}

ReviewComparisonContextMenuManager.prototype.DisableContextMenuRestoreForProperty = function () {
    var restore = true;
    var ignore = ['OK', 'No Value', 'OK(T)', 'Missing Property(s)'];
    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;

    if (selectedPropertiesKey.length == 0) {
        restore = true;
        return restore;
    }

    var detailInfoContainer = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items();

    for (var i = 0; i < selectedPropertiesKey.length; i++) {
        var rowIndex = dataGrid.getRowIndexByKey(selectedPropertiesKey[i]);
        var rowData = data[rowIndex];

        var index = ignore.indexOf(rowData[ComparisonPropertyColumnNames.Status]);
        if (index > 0) {
            restore = false;
        }
    }

    return restore;
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
    else if (key === "restoreItem") {
        if (optionName == "Restore") {
            this.OnRestoreTranspose(accordionData, source);
        }
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
    else if (key === "startTranslucency") {
        this.OnStartTranslucency();
    }
    else if (key === "stopTranslucency") {
        this.OnStopTranslucency();
    }
}

ReviewComparisonContextMenuManager.prototype.OnAcceptComponents = function () {
    var ignore = ['OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'No Match'];

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
    var ignore = ['OK', 'OK(T)', 'ACCEPTED', 'No Value', 'No Match', 'Missing Property(s)', ' '];
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

    var ignore = ['OK', 'OK(T)', 'No Value', 'No Match'];
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
    var ignore = ['OK', 'OK(T)', 'No Value', 'No Match', 'Missing Property(s)', ' '];
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

        var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;

        if (selectedPropertiesKey.length == 0) {
            return;
        }

        // Filter elements to perform accept on. If component is already accepted or transposed dont perform anything on it.
        // No match, OK, No Value components should not get accepted or transposed
        var ignore = ['OK', 'OK(A)', 'No Value', 'No Match', 'Missing Property(s)', ' ', 'ACCEPTED'];
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

        comparisonReviewManager.RestorePropertyTranspose(selectedProperties, componentId, groupId);
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

        var ignore = ['OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)', 'No Match'];
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

        var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;
        if (selectedPropertiesKey.length == 0) {
            return;
        }

        // Filter elements to perform accept on. If component is already accepted or transposed dont perform anything on it.
        // No match, OK, No Value components should not get accepted or transposed
        var ignore = ['OK', 'OK(T)', 'ACCEPTED', 'No Value', 'No Match', 'Missing Property(s)', ' '];
        var selectedProperties = []
        for (var propertyKey in selectedPropertiesKey) {
            var property = comparisonReviewManager.GetcheckProperty(componentId, groupId, Number(selectedPropertiesKey[propertyKey]));
            var index = ignore.indexOf(property.severity);
            if (index !== -1) {
                continue;
            }
            else {
                selectedProperties.push(Number(selectedPropertiesKey[propertyKey]));
            }
        }

        if (selectedProperties.length == 0) {
            return;
        }

        comparisonReviewManager.TransposeProperty(key, selectedProperties, componentId, groupId);
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
}

ReviewComparisonContextMenuManager.prototype.OnShowClick = function () {
    // get selected source A and B node ids
    var nodes = this.GetNodeIdsFormComponentRow();
    if (!nodes) {
        return;
    }

    var SelectedComponentRows = model.getCurrentSelectionManager().GetSelectedComponents();

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
    }

    return {
        "SourceA": sourceANodeIds,
        "SourceB": sourceBNodeIds
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