function ReviewComparisonContextMenuManager(comparisonReviewManager) {
    // call super constructor
    ReviewModuleContextMenuManager.call(this);

    this.ComparisonReviewManager = comparisonReviewManager;

    this.ComponentTableContainer;
    this.PropertyTableContainer;
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
            // _this.ComponentTableContainer = componentTableContainer;
            transpose = _this.ChooseRestoreTransposeForComponent(selectedRow[0]);
            accept = _this.ChooseActionForComparisonComponent(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            var transposeconditionalName = (transpose) ? 'Transpose' : 'Restore';
            _this.HighlightSelectedRowOnRightClick(selectedRow, _this.ComponentTableContainer);
            return {
                callback: function (key, options) {
                    _this.ExecuteContextMenuClicked(key, options, this, "component");
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
                            "lefttoright": { name: "Left To Right" },
                            "righttoleft": { name: "Right To Left" }
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
            transpose = _this.ChooseRestoreTransposeForProperty(selectedRow[0]);
            accept = _this.ChooseActionForComparisonProperty(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            var transposeconditionalName = (transpose) ? 'Transpose' : 'Restore';
            return {
                callback: function (key, options) {
                    _this.ExecuteContextMenuClicked(key, options, this, "property");
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
                            "lefttoright": { name: "Left To Right" },
                            "righttoleft": { name: "Right To Left" }
                        }
                    },
                    "restoreItem": {
                        name: transposeconditionalName,
                        visible: function () { if (transposeconditionalName == 'Restore') { return true; } else { return false; } },
                    }
                }
            };
        }
    });
}

ReviewComparisonContextMenuManager.prototype.InitGroupLevelContextMenu = function (categoryTableContainer) {
    var _this = this;

    $("#" + categoryTableContainer).contextMenu({
        className: 'contextMenu_style',
        selector: 'div',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            var transpose = true;
            transpose = _this.ChooseRestoreTransposeForGroup(selectedRow[0]);
            accept = _this.ChooseActionForComparisonGroup(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            var transposeconditionalName = (transpose) ? 'Transpose' : 'Restore';
            return {
                callback: function (key, options) {
                    _this.ExecuteContextMenuClicked(key, options, this, "group");
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
                    "transposeItem": {
                        name: transposeconditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = _this.DisableContextMenuTransposeForGroup(this[0]);
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
                            "lefttoright": { name: "Left To Right" },
                            "righttoleft": { name: "Right To Left" }
                        }
                    },
                    "restoreItem": {
                        name: transposeconditionalName,
                        visible: function () { if (transposeconditionalName == 'Restore') { return true; } else { return false; } },
                    }
                }
            };
        }
    });
}

ReviewComparisonContextMenuManager.prototype.ChooseRestoreTransposeForComponent = function (selectedRow) {

    var transpose = false;
    var ignore = ['OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)'];
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if(selectedGroupIdsVsResultIds == undefined) {
        transpose = true;
        return transpose;
    }

    for(var groupId in selectedGroupIdsVsResultIds) {
        var componentIds = selectedGroupIdsVsResultIds[groupId];
        for(var componentId in componentIds) {
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
    var ignore = ['OK', 'OK(T)', 'OK(A)', 'No Value', 'OK(A)(T)'];
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if(selectedGroupIdsVsResultIds == undefined) {
        accept = true;
        return accept;
    }

    for(var groupId in selectedGroupIdsVsResultIds) {
        var componentIds = selectedGroupIdsVsResultIds[groupId];
        for(var componentId in componentIds) {
            var checkResultComponent = comparisonReviewManager.GetCheckComponent(groupId, componentIds[componentId]);
            var index = ignore.indexOf(checkResultComponent.status);
            if (index == -1) {
                accept = true;
            }
        }
    }

    return accept;
}

ReviewComparisonContextMenuManager.prototype.DisableContextMenuTransposeForComponent = function (selectedRow) {
    var containerId = this.ComponentTableContainer;
    var rowData = model.checks[model.currentCheck]["reviewTable"].GetDataForSelectedRow(selectedRow.rowIndex, containerId);

    var selectedRowStatus = rowData[ComparisonColumnNames.Status];
    if (selectedRowStatus === "undefined" ||
        selectedRowStatus === "No Match" ||
        selectedRowStatus === "No Match(A)" ||
        (selectedRowStatus.includes("OK") &&
            !selectedRowStatus.includes("(T)"))) {
        return true;
    }

    return false;
}

ReviewComparisonContextMenuManager.prototype.DisableAcceptForComponent = function (selectedRow) {
    var containerId = this.ComponentTableContainer;
    var rowData = model.checks[model.currentCheck]["reviewTable"].GetDataForSelectedRow(selectedRow.rowIndex, containerId);

    var selectedRowStatus = rowData[ComparisonColumnNames.Status];
    if (selectedRowStatus.includes("OK") &&
        !selectedRowStatus.includes("(A)")) {
        return true;
    }

    return false;
}

ReviewComparisonContextMenuManager.prototype.DisableAcceptForProperty = function (selectedRow) {
    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;
    var ignore = ['OK', 'No Value', 'OK(T)'];
    var accepted = true;

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
            accepted = false;
        }
    }

    return accepted;
}

ReviewComparisonContextMenuManager.prototype.ChooseRestoreTransposeForProperty = function (selectedRow) {
    var transpose = false;
    var ignore = ['OK', 'No Value', 'OK(T)'];
    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;

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
        var sourceAPropertyName = rowData[ComparisonPropertyColumnNames.SourceAName];
        var sourceBPropertyName = rowData[ComparisonPropertyColumnNames.SourceBName];

        var index = ignore.indexOf(rowData[ComparisonPropertyColumnNames.Status]);
        if (index == -1) {
            if((sourceAPropertyName !== "" && sourceBPropertyName !== "")) {
                transpose = true;
            }
        }
    }

    return transpose;
}

ReviewComparisonContextMenuManager.prototype.ChooseActionForComparisonProperty = function (selectedRow) {

    var accept = false;
    var ignore = ['OK', 'No Value', 'ACCEPTED',  'OK(T)'];
    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;

    if(selectedPropertiesKey.length == 0) {
        accept = true;
        return accept;
    }

    var detailInfoContainer =  model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var dataGrid = $("#" + detailInfoContainer).dxDataGrid("instance");
    var data = dataGrid.getDataSource().items(); 

    for(var i = 0; i < selectedPropertiesKey.length; i++) {
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
    var ignore = ['OK', 'No Value', 'OK(T)', 'ACCEPTED'];
    var selectedPropertiesKey = model.checks["comparison"]["detailedInfoTable"].SelectedProperties;

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
        var sourceAPropertyName = rowData[ComparisonPropertyColumnNames.SourceAName];
        var sourceBPropertyName = rowData[ComparisonPropertyColumnNames.SourceBName];

        var index = ignore.indexOf(rowData[ComparisonPropertyColumnNames.Status]);
        if (index == -1) {
            if((sourceAPropertyName !== "" && sourceBPropertyName !== "")) {
                transpose = false;
            }
        }
    }

    return transpose;
}

ReviewComparisonContextMenuManager.prototype.ChooseRestoreTransposeForGroup = function (selectedRow) {
    // var groupIndex = model.getCurrentReviewTable().GetAccordionIndex(selectedRow.textContext);
    var groupData = model.getCurrentReviewTable().GetAccordionData(selectedRow.textContent);
    var groupId = groupData["groupId"];
    
    if (comparisonReviewManager.ComparisonCheckManager["results"][groupId].categoryStatus == 'OK(T)') {
        return false;
    }

    return true;
}

ReviewComparisonContextMenuManager.prototype.ChooseActionForComparisonGroup = function (selectedRow) {
    var groupData = model.getCurrentReviewTable().GetAccordionData(selectedRow.textContent);
    var groupId = groupData["groupId"];

    if (comparisonReviewManager.ComparisonCheckManager["results"][groupId].categoryStatus == 'ACCEPTED' ||
        comparisonReviewManager.ComparisonCheckManager["results"][groupId].categoryStatus == 'ACCEPTED(T)') {
        return false;
    }

    return true;
}

ReviewComparisonContextMenuManager.prototype.DisableAcceptForGroup = function (selectedRow) {
    var groupData = model.getCurrentReviewTable().GetAccordionData(selectedRow.textContent);
    var groupId = groupData["groupId"];
    var checkGroup = comparisonReviewManager.ComparisonCheckManager.results[groupId];

    // var selectedRowStatus = selectedRow.cells[ComparisonPropertyColumns.Status].innerHTML;
    if (checkGroup.categoryStatus == 'OK' ||
    checkGroup.ComponentClass == 'Undefined') {
        return true;
    }

    return false;
}

ReviewComparisonContextMenuManager.prototype.DisableContextMenuTransposeForGroup = function (selectedRow) {
    var groupData = model.getCurrentReviewTable().GetAccordionData(selectedRow.textContent);
    var groupId = groupData["groupId"];
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
    options,
    selectedRow,
    source) {

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
    else if (key === "restoreItem") {
        if (options.items[key].name == "Restore") {
            this.OnRestoreTranspose(selectedRow, source);
        }
    }
    else if (key === "lefttoright" ||
        key === "righttoleft") {
        this.OnTransposeClick(key, selectedRow, source);
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

ReviewComparisonContextMenuManager.prototype.OnAcceptComponents = function () {
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if(selectedGroupIdsVsResultIds == undefined) {
        return;
    }

    comparisonReviewManager.AcceptComponents(selectedGroupIdsVsResultIds);
}

ReviewComparisonContextMenuManager.prototype.OnAcceptProperty = function (rowClicked) {

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

    if(selectedPropertiesKey.length == 0) {
        return;
    }

    comparisonReviewManager.AcceptProperty(selectedPropertiesKey, componentId, groupId);
}

ReviewComparisonContextMenuManager.prototype.OnAcceptGroup = function (rowClicked) {
    comparisonReviewManager.updateStatusOfCategory(rowClicked[0]);
}

ReviewComparisonContextMenuManager.prototype.OnUnAcceptComponents = function () {
    var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();

    if(selectedGroupIdsVsResultIds == undefined) {
        return;
    }

    comparisonReviewManager.UnAcceptComponents(selectedGroupIdsVsResultIds);
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

    if(selectedPropertiesKey.length == 0) {
        return;
    }

    comparisonReviewManager.UnAcceptProperty(selectedPropertiesKey, componentId, groupId);
}

ReviewComparisonContextMenuManager.prototype.OnUnAcceptGroup = function (rowClicked) {
    comparisonReviewManager.UnAcceptCategory(rowClicked[0]);
}

ReviewComparisonContextMenuManager.prototype.OnRestoreTranspose = function (selectedRow, source) {

    if(source.toLowerCase() === "component") {
        var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();
        if(selectedGroupIdsVsResultIds == undefined) {
            return;
        }
        comparisonReviewManager.RestoreComponentTranspose(selectedGroupIdsVsResultIds);
    }
    else if(source.toLowerCase() === "property") {
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

        if(selectedPropertiesKey.length == 0) {
            return;
        }
        
        comparisonReviewManager.RestorePropertyTranspose(selectedPropertiesKey, componentId, groupId);
    }
    else if (source.toLowerCase() === "group") {
        comparisonReviewManager.RestoreCategoryTranspose(selectedRow[0]);
    }
}

ReviewComparisonContextMenuManager.prototype.OnTransposeClick = function (key, selectedRow, source) {

    if(source.toLowerCase() === "component") {
        var selectedGroupIdsVsResultIds = this.GetSelectedGroupIdsVsResultsIds();
        if(selectedGroupIdsVsResultIds == undefined) {
            return;
        }
        comparisonReviewManager.TransposeComponent(key, selectedGroupIdsVsResultIds);
    }
    else if(source.toLowerCase() === "property") {
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
        if(selectedPropertiesKey.length == 0) {
            return;
        }
        comparisonReviewManager.TransposeProperty(key, selectedPropertiesKey, componentId, groupId);
    }
    else if (source.toLowerCase() === "group") {
    comparisonReviewManager.TransposeCategory(key,
        selectedRow[0]);
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

ReviewComparisonContextMenuManager.prototype.GetSelectedGroupIdsVsResultsIds = function() {
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
    // // get selected source A and B node ids
    // var nodes = this.GetNodeIdsFormComponentRow();
    // if (!nodes) {
    //     return;
    // }    
    // var title = "";

    // // source A
    // var srcAIds = [];
    // var sourceANodeIds = nodes["SourceA"];
    // var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
    // if (sourceANodeIds.length > 0 &&
    //     sourceAViewerInterface) {

    //         // comonent ids
    //     for (var i = 0; i < checkResults.sourceAComponents.length; i++) {
    //         var component = checkResults.sourceAComponents[i];
            
    //         for(var j = 0; j < sourceANodeIds.length; j++)
    //         {
    //             var nodeid = sourceANodeIds[j];
    //             if(Number(component.nodeid) === nodeid)
    //             {
    //                 srcAIds.push(Number(component.id));
    //             }
    //         }
    //     }

    //     // source name
    //     title = checkResults.sourceInfo["sourceAFileName"];
    // }


    // // source B
    // var srcBIds = [];
    // var sourceBNodeIds = nodes["SourceB"];
    // var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
    // if (sourceBNodeIds.length > 0 &&
    //     sourceBViewerInterface) {

    //          // comonent ids
    //         for (var i = 0; i < checkResults.sourceBComponents.length; i++) {
    //             var component = checkResults.sourceBComponents[i];
                
    //             for(var j = 0; j < sourceBNodeIds.length; j++)
    //             {
    //                 var nodeid = sourceBNodeIds[j];
    //                 if(Number(component.nodeid) === nodeid)
    //                 {
    //                     srcBIds.push(Number(component.id));
    //                 }
    //             }
    //         }

    //     // source name
    //     title += " | " + checkResults.sourceInfo["sourceBFileName"];
    // }

    //var componentIds = { "a" : srcAIds, "b" : srcBIds};

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