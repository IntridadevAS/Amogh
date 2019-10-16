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
            transpose = _this.ChooseRestoreTransposeForComponent(selectedRow[0]);
            accept = _this.ChooseActionForComparisonComponent(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            var transposeconditionalName = (transpose) ? 'Transpose' : 'Restore';
            _this.HighlightSelectedRowOnRightClick(selectedRow);
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

ReviewComparisonContextMenuManager.prototype.InitGroupLevelContextMenu = function () {
    var _this = this;

    $("#ComparisonMainReviewTbody").contextMenu({
        className: 'contextMenu_style',
        selector: 'BUTTON',
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
                    _this.ExecuteContextMenuClicked(key, options, this, group);
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

    var rowData = model.getCurrentReviewTable().GetDataForSelectedRow(selectedRow.rowIndex, this.ComponentTableContainer);

    var componentId = rowData.ID;
    var groupId = rowData.groupId;
    var component = model.getCurrentReviewManager().GetCheckComponent(groupId, componentId);

    if (component.transpose !== null ||
        rowData.Status == 'OK(A)(T)') {
        return false;
    }

    return true;
}

ReviewComparisonContextMenuManager.prototype.ChooseActionForComparisonComponent = function (selectedRow) {

    var rowData = model.getCurrentReviewTable().GetDataForSelectedRow(selectedRow.rowIndex, this.ComponentTableContainer);

    if (rowData.Status == "OK(A)" ||
        rowData.Status == 'OK(A)(T)') {
        return false;
    }
    else {
        return true;
    }
}

ReviewComparisonContextMenuManager.prototype.DisableContextMenuTransposeForComponent = function (selectedRow) {
    var componentTableId = model.getCurrentReviewTable().CurrentTableId;
    var containerId = "#" + componentTableId;
    var rowData = model.getCurrentReviewTable().GetDataForSelectedRow(selectedRow.rowIndex, containerId);

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
    var componentTableId = model.getCurrentReviewTable().CurrentTableId;
    var containerId = "#" + componentTableId;
    var rowData = model.getCurrentReviewTable().GetDataForSelectedRow(selectedRow.rowIndex, containerId);

    var selectedRowStatus = rowData[ComparisonColumnNames.Status];
    if (selectedRowStatus.includes("OK") &&
        !selectedRowStatus.includes("(A)")) {
        return true;
    }

    return false;
}

ReviewComparisonContextMenuManager.prototype.DisableAcceptForProperty = function (selectedRow) {
    var componentTableId = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var containerId = "#" + componentTableId;
    var rowData = model.getCurrentDetailedInfoTable().GetDataForSelectedRow(selectedRow.rowIndex, containerId);

    var selectedRowStatus = rowData[ComparisonPropertyColumnNames.Status];

    // var selectedRowStatus = selectedRow.cells[ComparisonPropertyColumns.Status].innerHTML;
    if (selectedRowStatus.includes("OK")) {
        return true;
    }

    return false;
}

ReviewComparisonContextMenuManager.prototype.ChooseRestoreTransposeForProperty = function (selectedRow) {
    var componentTableId = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var containerId = "#" + componentTableId;
    var rowData = model.getCurrentDetailedInfoTable().GetDataForSelectedRow(selectedRow.rowIndex, containerId);

    var selectedRowStatus = rowData[ComparisonPropertyColumnNames.Status];

    if (selectedRowStatus.includes('(T)')) {
        return false;
    }

    return true;
}

ReviewComparisonContextMenuManager.prototype.ChooseActionForComparisonProperty = function (selectedRow) {

    var componentTableId = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var containerId = "#" + componentTableId;
    var rowData = model.getCurrentDetailedInfoTable().GetDataForSelectedRow(selectedRow.rowIndex, containerId);

    var selectedRowStatus = rowData[ComparisonPropertyColumnNames.Status];

    if (selectedRowStatus == "ACCEPTED") {
        return false;
    }

    return true;
}

ReviewComparisonContextMenuManager.prototype.DisableContextMenuTransposeForProperty = function (selectedRow) {
    var componentTableId = model.getCurrentDetailedInfoTable()["DetailedReviewTableContainer"];
    var containerId = "#" + componentTableId;
    var rowData = model.getCurrentDetailedInfoTable().GetDataForSelectedRow(selectedRow.rowIndex, containerId);

    var selectedRowStatus = rowData[ComparisonPropertyColumnNames.Status];
    var sourceAPropertyName = rowData[ComparisonPropertyColumnNames.SourceAName];
    var sourceBPropertyName = rowData[ComparisonPropertyColumnNames.SourceBName];

    // var selectedRowStatus = selectedRow.cells[ComparisonPropertyColumns.Status].innerHTML;
    if (selectedRowStatus === "OK" ||
        selectedRowStatus === "OK(T)" ||
        selectedRowStatus === "No Value" ||
        selectedRowStatus === "No Match" ||
        selectedRowStatus === "undefined" ||
        selectedRowStatus === "ACCEPTED") {
        return true;
    }
    else if (sourceAPropertyName == "" || sourceBPropertyName == "") {
        return true;
    }

    return false;
}

ReviewComparisonContextMenuManager.prototype.ChooseRestoreTransposeForGroup = function (selectedRow) {

    var groupId = selectedRow.getAttribute("groupId");
    if (comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'OK(T)') {
        return false;
    }

    return true;
}

ReviewComparisonContextMenuManager.prototype.ChooseActionForComparisonGroup = function (selectedRow) {
    var groupId = selectedRow.getAttribute("groupId");
    if (comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED' ||
        comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED(T)') {
        return false;
    }

    return true;
}

ReviewComparisonContextMenuManager.prototype.DisableContextMenuTransposeForGroup = function (selectedRow) {
    var groupId = selectedRow.getAttribute("groupId");
    var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];

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

ReviewComparisonContextMenuManager.prototype.OnAcceptComponent = function (rowClicked) {

    var rowData = model.getCurrentReviewTable().GetDataForSelectedRow(rowClicked[0].rowIndex, this.ComponentTableContainer);


    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    comparisonReviewManager.AcceptComponent(rowClicked, this.ComponentTableContainer, componentId, groupId);
}

ReviewComparisonContextMenuManager.prototype.OnAcceptProperty = function (rowClicked) {

    var highlightedRow = model.getCurrentSelectionManager().HighlightedCheckComponentRow;
    if (!highlightedRow) {
        return;
    }

    var componentTableId = model.getCurrentReviewTable().CurrentTableId;

    var containerId = "#" + componentTableId;
    var rowData = model.getCurrentReviewTable().GetDataForSelectedRow(highlightedRow.rowIndex, containerId);

    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    comparisonReviewManager.AcceptProperty(rowClicked, "#" + componentTableId, componentId, groupId);
}

ReviewComparisonContextMenuManager.prototype.OnAcceptGroup = function (rowClicked) {
    comparisonReviewManager.updateStatusOfCategory(rowClicked[0]);
}

ReviewComparisonContextMenuManager.prototype.OnUnAcceptComponent = function (rowClicked) {

    var rowData = model.getCurrentReviewTable().GetDataForSelectedRow(rowClicked[0].rowIndex, this.ComponentTableContainer);

    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    comparisonReviewManager.UnAcceptComponent(rowClicked,
        this.ComponentTableContainer,
        componentId,
        groupId);
}

ReviewComparisonContextMenuManager.prototype.OnUnAcceptProperty = function (rowClicked) {
    var highlightedRow = model.getCurrentSelectionManager().HighlightedCheckComponentRow;
    if (!highlightedRow) {
        return;
    }

    var componentTableId = model.getCurrentReviewTable().CurrentTableId;

    var containerId = "#" + componentTableId;
    var rowData = model.getCurrentReviewTable().GetDataForSelectedRow(highlightedRow.rowIndex, containerId);

    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    comparisonReviewManager.UnAcceptProperty(rowClicked,
        "#" + componentTableId,
        componentId,
        groupId);
}

ReviewComparisonContextMenuManager.prototype.OnUnAcceptGroup = function (rowClicked) {
    comparisonReviewManager.UnAcceptCategory(rowClicked[0]);
}

ReviewComparisonContextMenuManager.prototype.OnRestoreTranspose = function (selectedRow, source) {

    var highlightedRow = model.getCurrentSelectionManager().HighlightedCheckComponentRow;
    if (!highlightedRow) {
        return;
    }

    var componentTableId = model.getCurrentReviewTable().CurrentTableId;

    var containerId = "#" + componentTableId;
    var rowData = model.getCurrentReviewTable().GetDataForSelectedRow(highlightedRow.rowIndex, containerId);

    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    if (source.toLowerCase() === "group") {
        comparisonReviewManager.RestoreCategoryTranspose(selectedRow[0],
            this.ComponentTableContainer,
            componentId,
            groupId);
    }
    else if (source.toLowerCase() === "component") {
        comparisonReviewManager.RestoreComponentTranspose(selectedRow,
            this.ComponentTableContainer,
            componentId,
            groupId);
    }
    else if (source.toLowerCase() === "property") {
        comparisonReviewManager.RestorePropertyTranspose(selectedRow, "#" + componentTableId, componentId, groupId);
    }
}

ReviewComparisonContextMenuManager.prototype.OnTransposeClick = function (key, selectedRow, source) {
    // if (selectedRow[0].nodeName == "BUTTON") {
    var highlightedRow = model.getCurrentSelectionManager().HighlightedCheckComponentRow;
    if (!highlightedRow) {
        return;
    }

    var componentTableId = model.getCurrentReviewTable().CurrentTableId;

    var containerId = "#" + componentTableId;
    var rowData = model.getCurrentReviewTable().GetDataForSelectedRow(highlightedRow.rowIndex, containerId);

    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    if (source.toLowerCase() === "group") {
        comparisonReviewManager.TransposeCategory(key,
            selectedRow[0],
            this.ComponentTableContainer,
            componentId,
            groupId);
    }
    else if (source.toLowerCase() === "component") {
        comparisonReviewManager.TransposeComponent(key,
            selectedRow,
            this.ComponentTableContainer,
            componentId,
            groupId);
    }
    else if (source.toLowerCase() === "property") {
        comparisonReviewManager.TransposeProperty(key,
            selectedRow,
            "#" + componentTableId,
            componentId,
            groupId);
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

    var SelectedCheckComponentRows = model.getCurrentSelectionManager().SelectedCheckComponentRows;
    var containerId = this.ComponentTableContainer.replace("#", "");
    // source A
    var sourceANodeIds = nodes["SourceA"];
    var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];

    if (sourceANodeIds.length > 0 &&
        sourceAViewerInterface) {
        sourceAViewerInterface.Viewer.model.setNodesVisibility(sourceANodeIds, true).then(function () {
            sourceAViewerInterface.Viewer.view.fitWorld();
        });
        //Remove resultId on show
        sourceAViewerInterface.RemoveHiddenResultId(containerId, SelectedCheckComponentRows);
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
        sourceBViewerInterface.RemoveHiddenResultId(containerId, SelectedCheckComponentRows);
    }

    model.getCurrentReviewTable().HighlightHiddenRows(false, SelectedCheckComponentRows);
}

ReviewComparisonContextMenuManager.prototype.OnHideClick = function () {
    // get selected source A and B node ids
    var nodes = this.GetNodeIdsFormComponentRow();
    if (!nodes) {
        return;
    }

    var containerId = this.ComponentTableContainer.replace("#", "");
    var SelectedCheckComponentRows = model.getCurrentSelectionManager().SelectedCheckComponentRows;
    // source A
    var sourceANodeIds = nodes["SourceA"];
    var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];

    if (sourceANodeIds.length > 0 &&
        sourceAViewerInterface) {
        sourceAViewerInterface.Viewer.model.setNodesVisibility(sourceANodeIds, false).then(function () {
            sourceAViewerInterface.Viewer.view.fitWorld();
        });
        //Store resultId of hidden elements
        sourceAViewerInterface.StoreHiddenResultId(containerId, SelectedCheckComponentRows);
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
        sourceBViewerInterface.StoreHiddenResultId(containerId, SelectedCheckComponentRows);
    }

    model.getCurrentReviewTable().HighlightHiddenRows(true, SelectedCheckComponentRows);
}

ReviewComparisonContextMenuManager.prototype.GetNodeIdsFormComponentRow = function () {
    var selectionManager = model.getCurrentSelectionManager();
    if (selectionManager.SelectedCheckComponentRows.length === 0) {
        return undefined;
    }

    var dataGrid = $(this.ComponentTableContainer).dxDataGrid("instance");
    var rowsData = dataGrid.getDataSource().items();

    var sourceANodeIds = [];
    var sourceBNodeIds = [];
    for (var i = 0; i < selectionManager.SelectedCheckComponentRows.length; i++) {
        var selectedRow = selectionManager.SelectedCheckComponentRows[i];

        var rowData = rowsData[selectedRow.rowIndex];
        // source A
        //var sourceANodeIdCell = selectedRow.cells[ComparisonColumns.SourceANodeId];
        if (rowData.SourceANodeId !== "" && rowData.SourceANodeId !== null) {
            sourceANodeIds.push(Number(rowData.SourceANodeId));
        }

        // source B
        //var sourceBNodeIdCell = selectedRow.cells[ComparisonColumns.SourceBNodeId];
        if (rowData.SourceBNodeId !== "" && rowData.SourceBNodeId !== null) {
            sourceBNodeIds.push(Number(rowData.SourceBNodeId));
        }
    }

    return {
        "SourceA": sourceANodeIds,
        "SourceB": sourceBNodeIds
    };
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