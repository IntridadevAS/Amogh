function ReviewComparisonContextMenuManager() {
    // call super constructor
    ReviewModuleContextMenuManager.call(this);
}

// assign parent's method to this class
ReviewComparisonContextMenuManager.prototype = Object.create(ReviewModuleContextMenuManager.prototype);
ReviewComparisonContextMenuManager.prototype.constructor = ReviewComparisonContextMenuManager;

ReviewComparisonContextMenuManager.prototype.Init = function () {
    // components level
    this.InitComponentLevelContextMenu();

    // property level
    this.InitPropertyLevelContextMenu();

    // group level
    this.InitGroupLevelContextMenu();
}

ReviewComparisonContextMenuManager.prototype.InitComponentLevelContextMenu = function () {
    var _this = this;

    $("#ComparisonMainReviewTbody").contextMenu({
        className: 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
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
                        visible: function () { if (transposeconditionalName == 'Restore') { return true; } else { return false; } },
                    },
                    "reference": {
                        name: "Reference",
                    },
                    "isolate": {
                        name: "Isolate"
                    },
                    "showAll": {
                        name: "Show All"
                    }
                }
            };
        }
    });
}

ReviewComparisonContextMenuManager.prototype.InitPropertyLevelContextMenu = function () {
    var _this = this;
    $("#ComparisonDetailedReviewTbody").contextMenu({
        className: 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
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
    var componentId = selectedRow.cells[ComparisonColumns.ResultId].innerHTML;
    var groupId = selectedRow.cells[ComparisonColumns.GroupId].innerHTML;

    var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];
    var checkComponents = checkGroup["CheckComponents"];
    var component = checkComponents[componentId];

    if (component.transpose !== null ||
        selectedRow.cells[2].innerHTML == 'OK(A)(T)') {
        return false;
    }

    return true;
}

ReviewComparisonContextMenuManager.prototype.ChooseActionForComparisonComponent = function (selectedRow) {
    if (selectedRow.cells[ComparisonColumns.Status].innerHTML == "OK(A)" ||
        selectedRow.cells[ComparisonColumns.Status].innerHTML == 'OK(A)(T)') {
        return false;
    }
    else {
        return true;
    }
}

ReviewComparisonContextMenuManager.prototype.DisableContextMenuTransposeForComponent = function (selectedRow) {
    var selectedRowStatus = selectedRow.cells[ComparisonColumns.Status].innerHTML;
    if (selectedRowStatus === "undefined" ||
        selectedRowStatus === "No Match" ||
        selectedRowStatus === "No Match(A)" ||
        selectedRowStatus === "OK" ||
        selectedRowStatus === "OK(A)" ||
        selectedRowStatus === "OK(A)(T)") {
        return true;
    }

    return false;
}

ReviewComparisonContextMenuManager.prototype.ChooseRestoreTransposeForProperty = function (selectedRow) {
    if (selectedRow.cells[4].innerHTML.includes('(T)')) {
        return false;
    }

    return true;
}

ReviewComparisonContextMenuManager.prototype.ChooseActionForComparisonProperty = function (selectedRow) {
    if (selectedRow.cells[4].innerHTML == "ACCEPTED") {
        return false;
    }

    return true;
}

ReviewComparisonContextMenuManager.prototype.DisableContextMenuTransposeForProperty = function (selectedRow) {
    var selectedRowStatus = selectedRow.cells[ComparisonPropertyColumns.Status].innerHTML;
    if (selectedRowStatus == "OK" ||
        selectedRowStatus == "OK(T)" ||
        selectedRowStatus == "No Value" ||
        selectedRowStatus == "undefined" ||
        selectedRowStatus == "ACCEPTED") {
        return true;
    }
    else if (selectedRow.cells[ComparisonPropertyColumns.SourceAName].innerHTML == "" ||
        selectedRow.cells[ComparisonPropertyColumns.SourceBName].innerHTML == "") {
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
    else if (key === "restoreItem") {
        if (options.items[key].name == "Restore") {
            this.OnRestoreTranspose(selectedRow);
        }
    }
    else if (key === "lefttoright" ||
        key === "righttoleft") {
            this.OnTransposeClick(key, selectedRow);
    }
    else if (key === "freeze") {
    }
    else if (key === "reference") {
        onReferenceClick(selectedRow);
    }
    else if (key === "isolate") {
        this.OnIsolateClick();
    }
    else if (key === "showAll") {
        this.OnShowAllClick();
    }
}

ReviewComparisonContextMenuManager.prototype.OnAcceptComponent = function (rowClicked) {
    comparisonReviewManager.updateStatusForComponent(rowClicked);
}

ReviewComparisonContextMenuManager.prototype.OnAcceptProperty = function (rowClicked) {
    comparisonReviewManager.updateStatusForProperty(rowClicked);
}

ReviewComparisonContextMenuManager.prototype.OnAcceptGroup = function (rowClicked) {
    comparisonReviewManager.updateStatusOfCategory(rowClicked[0]);
}

ReviewComparisonContextMenuManager.prototype.OnUnAcceptComponent = function (rowClicked) {
    comparisonReviewManager.UnAcceptComponent(rowClicked);
}

ReviewComparisonContextMenuManager.prototype.OnUnAcceptProperty = function (rowClicked) {
    comparisonReviewManager.UnAcceptProperty(rowClicked);
}

ReviewComparisonContextMenuManager.prototype.OnUnAcceptGroup = function (rowClicked) {
    comparisonReviewManager.UnAcceptCategory(rowClicked[0]);
}

ReviewComparisonContextMenuManager.prototype.OnRestoreTranspose = function (selectedRow) {
    if (selectedRow[0].nodeName == "BUTTON") {
        var typeOfRow = selectedRow[0].offsetParent.id;
        comparisonReviewManager.RestoreCategoryTranspose(selectedRow[0]);
    }
    else {
        var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
        if (typeOfRow == "ComparisonMainReviewTbody") {
            comparisonReviewManager.RestoreComponentTranspose(selectedRow);
        }
        else if (typeOfRow == "ComparisonDetailedReviewTbody") {
            comparisonReviewManager.RestorePropertyTranspose(selectedRow, comparisonReviewManager);
        }
    }
}

ReviewComparisonContextMenuManager.prototype.OnTransposeClick = function (key, selectedRow) {
    if (selectedRow[0].nodeName == "BUTTON") {
        var typeOfRow = selectedRow[0].offsetParent.id;
        comparisonReviewManager.TransposeCategory(key, selectedRow[0]);
    }
    else {
        var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
        if (typeOfRow == "ComparisonMainReviewTbody") {
            comparisonReviewManager.TransposeComponent(key, selectedRow);
        }
        else if (typeOfRow == "ComparisonDetailedReviewTbody") {
            comparisonReviewManager.TransposeProperty(key, selectedRow);
        }
    }
}

ReviewComparisonContextMenuManager.prototype.OnIsolateClick = function () {
}

ReviewComparisonContextMenuManager.prototype.OnShowAllClick = function () {
}