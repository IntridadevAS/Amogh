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
    var tableToUpdate = this.GetTableNameToAcceptComponent();
    this.ComplianceReviewManager.UpdateStatusForComponent(rowClicked, tableToUpdate);
}

ReviewComplianceContextMenuManager.prototype.OnAcceptProperty= function (rowClicked)
{
    var tableToUpdate = this.GetTableNameToAcceptProperty();
    this.ComplianceReviewManager.UpdateStatusForProperty(rowClicked, tableToUpdate);
}

ReviewComplianceContextMenuManager.prototype.OnAcceptGroup= function (rowClicked)
{
    var tableToUpdate = this.GetTableNameToAcceptGroup();
    this.ComplianceReviewManager.UpdateStatusOfCategory(rowClicked[0], tableToUpdate);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptComponent= function (rowClicked)
{
    var tableToUpdate = this.GetTableNameToUnAcceptComponent();
    this.ComplianceReviewManager.UnAcceptComponent(rowClicked, tableToUpdate);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptProperty= function (rowClicked)
{
    var tableToUpdate = this.GetTableNameToUnAcceptProperty();
    this.ComplianceReviewManager.UnAcceptProperty(rowClicked, tableToUpdate);
}

ReviewComplianceContextMenuManager.prototype.OnUnAcceptGroup= function (rowClicked)
{
    var tableToUpdate = this.GetTableNameToUnAcceptGroup();
    this.ComplianceReviewManager.UnAcceptCategory(rowClicked[0], tableToUpdate);
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToAcceptComponent = function() {
    var tableToUpdate = "";
    if(this.MainReviewTableDiv == "SourceAComplianceMainReviewTbody") {
        tableToUpdate = "complianceSourceA";
    }
    else if(this.MainReviewTableDiv == "SourceBComplianceMainReviewTbody") {
        tableToUpdate = "complianceSourceB";
    }
    return tableToUpdate;
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToAcceptProperty = function() {
    var tableToUpdate = "";
    if(this.DetailedReviewTableDiv == "ComplianceADetailedReviewTbody") {
        tableToUpdate = "ComplianceADetailedReview";
    }
    else if(this.DetailedReviewTableDiv == "ComplianceBDetailedReviewTbody") {
        tableToUpdate = "ComplianceBDetailedReview";
    }
    return tableToUpdate;
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToAcceptGroup = function() {
    var tableToUpdate = "";
    if (this.MainReviewTableDiv == "SourceAComplianceMainReviewTbody") {
        tableToUpdate = "categoryComplianceA";
    }
    else if (this.MainReviewTableDiv == "SourceBComplianceMainReviewTbody") {
        tableToUpdate = "categoryComplianceB";
    }
    return tableToUpdate;
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToUnAcceptComponent = function() {
    var tableToUpdate = "";
    if(this.MainReviewTableDiv == "SourceAComplianceMainReviewTbody") {
        tableToUpdate = "rejectComponentFromComplianceATab";
    }
    else if(this.MainReviewTableDiv == "SourceBComplianceMainReviewTbody") {
        tableToUpdate = "rejectComponentFromComplianceBTab";
    }
    return tableToUpdate;
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToUnAcceptProperty = function() {
    var tableToUpdate = "";
    if(this.DetailedReviewTableDiv == "ComplianceADetailedReviewTbody") {
        tableToUpdate = "rejectPropertyFromComplianceATab";
    }
    else if(this.DetailedReviewTableDiv == "ComplianceBDetailedReviewTbody") {
        tableToUpdate = "rejectPropertyFromComplianceBTab";
    }
    return tableToUpdate;
}

ReviewComplianceContextMenuManager.prototype.GetTableNameToUnAcceptGroup = function() {
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
 
     // source isolate   /
     var viewerInterface =  this.ComplianceReviewManager.ReviewModuleViewerInterface;
 
     if (viewerInterface) {
 
         // perform isolate
         var isolateManager = new IsolateManager(viewerInterface.Viewer);
         isolateManager.Isolate(nodes).then(function (affectedNodes) {
 
         }); 
     }    
}

ReviewComplianceContextMenuManager.prototype.OnShowAllClick = function () {
    var viewerInterface =  this.ComplianceReviewManager.ReviewModuleViewerInterface;
 
     if (viewerInterface) {
        viewerInterface.Viewer.model.setNodesVisibility([viewerInterface.Viewer.model.getAbsoluteRootNode()], true).then(function () {
            viewerInterface.Viewer.view.fitWorld();
         });
     }
}

ReviewComplianceContextMenuManager.prototype.GetNodeIdsFormComponentRow = function () {
    var selectionManager = this.ComplianceReviewManager.SelectionManager;
    if (selectionManager.SelectedCheckComponentRows.length === 0) {
        return undefined;
    }

    var sourceNodeIds = [];  
    for (var i = 0; i < selectionManager.SelectedCheckComponentRows.length; i++) {
        var selectedRow = selectionManager.SelectedCheckComponentRows[i];

      
        var sourceNodeIdCell = selectedRow.cells[ComplianceColumns.NodeId];
        if (sourceNodeIdCell.innerText !== "") {
            sourceNodeIds.push(Number(sourceNodeIdCell.innerText));
        }      
    }

    return sourceNodeIds;
}