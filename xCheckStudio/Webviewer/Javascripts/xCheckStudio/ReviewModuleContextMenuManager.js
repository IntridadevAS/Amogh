

function initializeComparisonContextMenus() {
    // components level
    $("#ComparisonMainReviewTbody").contextMenu({
        className: 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            var transpose = true;
            transpose = chooseRestoreTransposeForComponent(selectedRow[0]);
            accept = chooseActionForComparisonComponent(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            var transposeconditionalName = (transpose) ? 'Transpose' : 'Restore';
            highlightSelectedRowOnRightClick(selectedRow);
            return {
                callback: function (key, options) {
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    "acceptItem":
                    {
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                    "transposeItem": {
                        name: transposeconditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = disableContextMenuTransposeForComponent(this[0]);
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

    // property level
    $("#ComparisonDetailedReviewTbody").contextMenu({
        className: 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            var transpose = true;
            transpose = chooseRestoreTransposeForProperty(selectedRow[0]);
            accept = chooseActionForComparisonProperty(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            var transposeconditionalName = (transpose) ? 'Transpose' : 'Restore';
            return {
                callback: function (key, options) {
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    "acceptItem":
                    {
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                    "transposeItem": {
                        name: transposeconditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = disableContextMenuTransposeForProperty(this[0]);
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

    // group level
    $("#ComparisonMainReviewTbody").contextMenu({
        className: 'contextMenu_style',
        selector: 'BUTTON',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            var transpose = true;
            transpose = chooseRestoreTransposeForGroup(selectedRow[0]);
            accept = chooseActionForComparisonGroup(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            var transposeconditionalName = (transpose) ? 'Transpose' : 'Restore';
            return {
                callback: function (key, options) {
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    "acceptItem":
                    {
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                    "transposeItem": {
                        name: transposeconditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = disableContextMenuTransposeForGroup(this[0]);
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

function initializeSourceAComplianceContextMenus() {

    // components level
    $("#SourceAComplianceMainReviewTbody").contextMenu({
        className: 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            accept = chooseActionForComplianceComponent(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            highlightSelectedRowOnRightClick(selectedRow);
            return {
                callback: function (key, options) {
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    "acceptItem":
                    {
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
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

    // property level
    $("#ComplianceADetailedReviewTbody").contextMenu({
        className: 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            accept = chooseActionForComplianceProperty(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            return {
                callback: function (key, options) {
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    "acceptItem":
                    {
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                }
            };
        }
    });

    // group level
    $("#SourceAComplianceMainReviewTbody").contextMenu({
        className: 'contextMenu_style',
        selector: 'BUTTON',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            accept = chooseActionForComplianceAGroup(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            return {
                callback: function (key, options) {
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    "acceptItem":
                    {
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                }
            };
        }
    });

}

function initializeSourceBComplianceContextMenus() {
    // components level
    $("#SourceBComplianceMainReviewTbody").contextMenu({
        className: 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            accept = chooseActionForComplianceComponent(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            highlightSelectedRowOnRightClick(selectedRow);
            return {
                callback: function (key, options) {
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    "acceptItem":
                    {
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
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

    // property level
    $("#ComplianceBDetailedReviewTbody").contextMenu({
        className: 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            accept = chooseActionForComplianceProperty(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            return {
                callback: function (key, options) {
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    "acceptItem":
                    {
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                }
            };
        }
    });

    // group level
    $("#SourceBComplianceMainReviewTbody").contextMenu({
        className: 'contextMenu_style',
        selector: 'BUTTON',
        build: function ($triggerElement, e) {
            var selectedRow = $triggerElement;
            var accept = true;
            accept = chooseActionForComplianceBGroup(selectedRow[0]);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            return {
                callback: function (key, options) {
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    "acceptItem":
                    {
                        name: conditionalName,
                        disabled: function () {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                }
            };
        }
    });
}

function executeContextMenuClicked(key,
    options,
    selectedRow) {
    if (key === "acceptItem") {
        if (options.items[key].name == "Accept") {
            onAcceptClick(selectedRow);
        }
        else {
            onUnAcceptClick(selectedRow);
        }
    }
    if (key === "restoreItem") {
        if (options.items[key].name == "Restore") {
            onRestoreTranspose(selectedRow);
        }
    }
    else if (key === "lefttoright" ||
        key === "righttoleft") {
        onTransposeClick(key, selectedRow);
    }
    else if (key === "freeze") {
    }
    else if (key === "reference") {
        onReferenceClick(selectedRow);
    }
    else if (key === "isolate") {
        onIsolateClick();
    }
    else if (key === "showAll") {
        onShowAllClick();
    }
}

function onIsolateClick() {

}

function onShowAllClick() {

}

function chooseActionForComparisonComponent(selectedRow) {
    if (selectedRow.cells[ComparisonColumns.Status].innerHTML == "OK(A)" ||
        selectedRow.cells[ComparisonColumns.Status].innerHTML == 'OK(A)(T)') {
        return false;
    }
    else {
        return true;
    }
}

function chooseActionForComparisonProperty(selectedRow) {
    if (selectedRow.cells[4].innerHTML == "ACCEPTED") {
        return false;
    }

    return true;
}

function chooseActionForComparisonGroup(selectedRow) {
    var groupId = selectedRow.getAttribute("groupId");
    if (comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED' ||
        comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED(T)') {
        return false;
    }

    return true;
}

function chooseActionForComplianceComponent(selectedRow) {
    if (selectedRow.cells[ComplianceColumns.Status].innerHTML == "OK(A)" ||
        selectedRow.cells[ComplianceColumns.Status].innerHTML == 'OK(A)(T)') {
        return false;
    }
    else {
        return true;
    }
}

function chooseActionForComplianceProperty(selectedRow) {
    if (selectedRow.cells[2].innerHTML == "ACCEPTED") {
        return false;
    }

    return true;
}

function chooseActionForComplianceAGroup(selectedRow) {
    var groupId = selectedRow.getAttribute("groupId");
    if (sourceAComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED') {
        return false;
    }

    return true;
}

function chooseActionForComplianceBGroup(selectedRow) {
    var groupId = selectedRow.getAttribute("groupId");
    if (sourceBComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED') {
        return false;
    }

    return true;
}

function chooseRestoreTransposeForComponent(selectedRow) {
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


function chooseRestoreTransposeForProperty(selectedRow) {
    if (selectedRow.cells[4].innerHTML.includes('(T)')) {
        return false;
    }

    return true;
}


function chooseRestoreTransposeForGroup(selectedRow) {

    var groupId = selectedRow.getAttribute("groupId");
    if (comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'OK(T)') {
        return false;
    }

    return true;
}

function onAcceptClick(rowClicked) {
    var selectedRow = rowClicked;
    var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;

    if (rowClicked[0].nodeName == "BUTTON") {
        typeOfRow = selectedRow[0].offsetParent.id;
        if (typeOfRow == "ComparisonMainReviewTbody") {
            comparisonReviewManager.updateStatusOfCategory(rowClicked[0], comparisonReviewManager);
        }
        else if (typeOfRow == "SourceAComplianceMainReviewTbody") {
            sourceAComplianceReviewManager.updateStatusOfCategory(rowClicked[0]);
        }
        else if (typeOfRow == "SourceBComplianceMainReviewTbody") {
            sourceBComplianceReviewManager.updateStatusOfCategory(rowClicked[0]);
        }
    }
    else {
        if (typeOfRow == "ComparisonMainReviewTbody") {
            comparisonReviewManager.updateStatusForComponent(selectedRow);
        }
        else if (typeOfRow == "ComparisonDetailedReviewTbody") {
            comparisonReviewManager.updateStatusForProperty(selectedRow);
        }
        else if (typeOfRow == "SourceAComplianceMainReviewTbody" ||
            typeOfRow == "ComplianceADetailedReviewTbody") {
            sourceAComplianceReviewManager.updateStatusOfComplianceElement(selectedRow);
        }
        else if (typeOfRow == "SourceBComplianceMainReviewTbody" ||
            typeOfRow == "ComplianceBDetailedReviewTbody") {
            sourceBComplianceReviewManager.updateStatusOfComplianceElement(selectedRow);
        }
    }
}

function disableContextMenuTransposeForComponent(selectedRow) {
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

function disableContextMenuTransposeForProperty(selectedRow) {
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

function disableContextMenuTransposeForGroup(selectedRow) {
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

function onRestoreTranspose(selectedRow) {
    if(selectedRow[0].nodeName == "BUTTON") {
        var typeOfRow = selectedRow[0].offsetParent.id;
        comparisonReviewManager.RestoreCategoryTranspose(selectedRow[0]);
    }
    else {
        var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
        if(typeOfRow == "ComparisonMainReviewTbody") {
            comparisonReviewManager.RestoreComponentTranspose(selectedRow);
        }
        else if(typeOfRow == "ComparisonDetailedReviewTbody") {
            comparisonReviewManager.RestorePropertyTranspose(selectedRow, comparisonReviewManager);
        }
    }
}

function onTransposeClick(key, selectedRow) {
    if(selectedRow[0].nodeName == "BUTTON") {
        var typeOfRow = selectedRow[0].offsetParent.id;
        comparisonReviewManager.TransposeCategory(key, selectedRow[0]);
    }
    else {
        var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
        if(typeOfRow == "ComparisonMainReviewTbody") {
            comparisonReviewManager.TransposeComponent(key, selectedRow);
        }
        else if(typeOfRow == "ComparisonDetailedReviewTbody") {
            comparisonReviewManager.TransposeProperty(key, selectedRow);
        }
    }
}
