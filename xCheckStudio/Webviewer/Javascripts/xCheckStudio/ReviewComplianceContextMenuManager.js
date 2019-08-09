function ReviewComplianceContextMenuManager(checkGroups,
    mainReviewTableDiv,
    detailedReviewTableDiv,
    complianceReviewManager) {
    // call super constructor
    ReviewModuleContextMenuManager.call(this);

    this.CheckGroups = checkGroups;
    this.MainReviewTableDiv = mainReviewTableDiv;
    this.DetailedReviewTableDiv = detailedReviewTableDiv;
    this.ComplianceReviewManager = complianceReviewManager;
}

// assign parent's method to this class
ReviewComplianceContextMenuManager.prototype = Object.create(ReviewModuleContextMenuManager.prototype);
ReviewComplianceContextMenuManager.prototype.constructor = ReviewComplianceContextMenuManager;

ReviewComplianceContextMenuManager.prototype.Init = function () {
    // components level
    this.InitComponentLevelContextMenu();

    // property level
    this.InitPropertyLevelContextMenu();

    // group level
    this.InitGroupLevelContextMenu();
}

ReviewComplianceContextMenuManager.prototype.InitComponentLevelContextMenu = function () {
    //"#SourceAComplianceMainReviewTbody"
    var _this = this;
    var mainReviewTableDiv = "#" + this.MainReviewTableDiv ;
    $(mainReviewTableDiv).contextMenu({
        className: 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
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

ReviewComplianceContextMenuManager.prototype.InitPropertyLevelContextMenu = function () {

    var _this = this;
    var detailedReviewTableDiv = "#" + this.DetailedReviewTableDiv;
    $(detailedReviewTableDiv).contextMenu({
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
            accept = ChooseActionForComplianceGroup(selectedRow[0]);
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

ReviewComplianceContextMenuManager.prototype.ChooseActionForComplianceGroup = function(selectedRow) {
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
    else if (key === "showAll") {
        this.OnShowAllClick();
    }
}

ReviewComplianceContextMenuManager.prototype.OnAcceptComponent= function (rowClicked)
{
    this.ComplianceReviewManager.UpdateStatusForComponent(rowClicked);
}

ReviewComplianceContextMenuManager.prototype.OnAcceptProperty= function (rowClicked)
{
    this.ComplianceReviewManager.UpdateStatusForProperty(rowClicked);
}

ReviewComplianceContextMenuManager.prototype.OnAcceptGroup= function (rowClicked)
{
    this.ComplianceReviewManager.UpdateStatusOfCategory(rowClicked[0]);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptComponent= function (rowClicked)
{
    this.ComplianceReviewManager.UnAcceptComponent(rowClicked);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptProperty= function (rowClicked)
{
    this.ComplianceReviewManager.UnAcceptProperty(rowClicked);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptGroup= function (rowClicked)
{
    this.ComplianceReviewManager.UnAcceptCategory(rowClicked[0]);
}

ReviewComplianceContextMenuManager.prototype.OnIsolateClick = function () {
}

ReviewComplianceContextMenuManager.prototype.OnShowAllClick = function () {
}