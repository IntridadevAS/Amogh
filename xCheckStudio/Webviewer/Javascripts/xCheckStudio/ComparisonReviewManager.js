function ComparisonReviewManager(comparisonCheckManager,
    sourceAViewerData,
    sourceBViewerData,
    sourceAComponents,
    sourceBComponents,
    mainReviewTableContainer,
    detailedReviewTableContainer,
    sourceAComponentsHierarchy,
    sourceBComponentsHierarchy) {

    this.SourceAViewerData = sourceAViewerData;
    this.SourceBViewerData = sourceBViewerData;

    this.SourceAComponents = sourceAComponents;
    this.SourceBComponents = sourceBComponents;

    this.MainReviewTableContainer = mainReviewTableContainer;
    this.DetailedReviewTableContainer = detailedReviewTableContainer;

    this.SourceANodeIdVsStatus = sourceAComponentsHierarchy;
    this.SourceBNodeIdVsStatus = sourceBComponentsHierarchy;

    this.ComparisonCheckManager = comparisonCheckManager;

    this.SelectedComponentRowFromSheetA;
    this.SelectedComponentRowFromSheetB;

    this.checkStatusArrayA = {};
    this.checkStatusArrayB = {};

    this.detailedReviewRowComments = {};

    this.SourceANodeIdvsCheckComponent = {};
    this.SourceBNodeIdvsCheckComponent = {};

    this.SourceAComponentIdvsNodeId = {};
    this.SourceBComponentIdvsNodeId = {};

    this.SourceAViewerCurrentSheetLoaded = undefined;
    this.SourceBViewerCurrentSheetLoaded = undefined;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    this.SelectionManager = new ReviewComparisonSelectionManager();

    // populate review table
    this.CheckResultsTable = new ComparisonCheckResultsTable(this, "ComparisonMainReviewCell");   
    this.CheckResultsTable.populateReviewTable();

    this.SourceAReviewViewerInterface;
    this.SourceBReviewViewerInterface;
}

ComparisonReviewManager.prototype.loadDatasources = function () {
    var modal = document.getElementById('maximizeViewerContainer');

    var viewer1 = document.getElementById("viewerContainer1");
    viewer1.style.height = "270px";
    viewer1.style.top = "0px";

    var viewer2 = document.getElementById("viewerContainer2");
    viewer2.style.height = "270px";
    viewer2.style.top = "0px";

    if (modal.style.display === "block") {
        viewer1.style.height = "405px";
        viewer2.style.height = "405px";
    }

    if (this.SourceAViewerData !== undefined) {
        this.SourceAReviewViewerInterface = new Review3DViewerInterface(this.SourceAViewerData,
            this.SourceAComponentIdVsComponentData,
            this.SourceANodeIdVsComponentData,
            this);
        this.SourceAReviewViewerInterface.NodeIdStatusData = this.SourceANodeIdVsStatus;
        this.SourceAReviewViewerInterface.setupViewer(550, 280);
    }

    if (this.SourceBViewerData !== undefined) {
        this.SourceBReviewViewerInterface = new Review3DViewerInterface(this.SourceBViewerData,
            this.SourceBComponentIdVsComponentData,
            this.SourceBNodeIdVsComponentData,
            this);
        this.SourceBReviewViewerInterface.NodeIdStatusData = this.SourceBNodeIdVsStatus;
        this.SourceBReviewViewerInterface.setupViewer(550, 280);
    }
}

ComparisonReviewManager.prototype.AddTableContentCount = function (containerId) {
    var modelBrowserData = document.getElementById(containerId);
    var categoryId = containerId + "System_table_container";
    // var gridDiv = modelBrowserData.getElementsByTagName(categoryId);


    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var modelBrowserDataTable = modelBrowserData.children[0];
    var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");

    // var countBox;
    var div2 = document.createElement("DIV");
    var id = containerId + "_child";
    div2.id = id;
    div2.style.fontSize = "13px";

    // var countBox = document.getElementById(id);
    // modelBrowserTableRows contains header and search bar row as row hence count is length-1
    var rowCount = modelBrowserTableRows.length - 2;
    div2.innerHTML = "Count :" + rowCount;
    modelBrowserDataTable.appendChild(div2);
}

ComparisonReviewManager.prototype.MaintainNodeIdVsCheckComponent = function (component, mainClass) {
    // maintain track of check components
    if (component.SourceANodeId) {
        this.SourceANodeIdvsCheckComponent[component.SourceANodeId] = {
            "Id": component.ID,
            "SourceAName": component.SourceAName,
            "SourceBName": component.SourceBName,
            "MainClass": mainClass,
            "SourceANodeId": component.SourceANodeId,
            "SourceBNodeId": component.SourceBNodeId,
        };
        // this.SourceAComponentIdvsNodeId[component.ID] = component.SourceANodeId;
    }
    if (component.SourceBNodeId) {
        this.SourceBNodeIdvsCheckComponent[component.SourceBNodeId] = {
            "Id": component.ID,
            "SourceAName": component.SourceAName,
            "SourceBName": component.SourceBName,
            "MainClass": mainClass,
            "SourceANodeId": component.SourceANodeId,
            "SourceBNodeId": component.SourceBNodeId,
        };
        // this.SourceBComponentIdvsNodeId[component.ID] = component.SourceBNodeId;
    }
}

ComparisonReviewManager.prototype.highlightMainReviewTableFromCheckStatus = function (containerId) {
    var mainReviewTableContainer = document.getElementById(containerId);
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var mainReviewTableRows = mainReviewTableContainer.children[0].getElementsByTagName("tr");

    for (var i = 1; i < mainReviewTableRows.length; i++) {
        var currentRow = mainReviewTableRows[i];
        if (currentRow.cells.length < 3) {
            return;
        }
        var status = currentRow.cells[ComparisonColumns.Status].innerText;
        this.SelectionManager.ChangeBackgroundColor(currentRow, status);
    }
}

ComparisonReviewManager.prototype.GetClasswiseComponentsBySheetName = function (viewerContainer, sheetName) {

    if (viewerContainer === "viewerContainer1" &&
        sheetName in this.SourceAComponents) {
        return this.SourceAComponents[sheetName];
    }
    else if (viewerContainer === "viewerContainer2" &&
        sheetName in this.SourceBComponents) {
        return this.SourceBComponents[sheetName];

    }

    return undefined;
}

ComparisonReviewManager.prototype.GetCurrentSheetInViewer = function (viewerContainer) {

    if (viewerContainer === "viewerContainer1") {
        return this.SourceAViewerCurrentSheetLoaded;
    }
    else if (viewerContainer === "viewerContainer2") {
        return this.SourceBViewerCurrentSheetLoaded;
    }

    return undefined;
}

/* This method is called when the check result row is clicked in table. This 
function loads the sheet data in viewer for selected component result.
Inputs :
     viewerContainer = container id in which the sheet data is to be loaded,
     sheetName = sheet name to load,
     CurrentReviewTableRow = current selected comparison result row 
*/
ComparisonReviewManager.prototype.LoadSelectedSheetDataInViewer = function (viewerContainer,
    sheetName,
    CurrentReviewTableRow) {

    // get class wise components                                                                                    
    var classWiseComponents = this.GetClasswiseComponentsBySheetName(viewerContainer, sheetName);
    if (!classWiseComponents) {
        return;
    }

    // current sheet in viewer
    var currentlyLoadedSheet = this.GetCurrentSheetInViewer(viewerContainer);

    //check if sheet is already loaded       
    if (sheetName === currentlyLoadedSheet) {
        if (CurrentReviewTableRow.cells[ComparisonColumns.Status].innerText === "No Match") {
            if (viewerContainer === "viewerContainer1" &&
                CurrentReviewTableRow.cells[ComparisonColumns.SourceAName].innerText === "") {
                if (this.SelectedComponentRowFromSheetA) {
                    this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayA,
                        this.SelectedComponentRowFromSheetA);
                }

                return;
            }
            else if (viewerContainer === "viewerContainer2" &&
                CurrentReviewTableRow.cells[ComparisonColumns.SourceBName].innerText === "") {

                if (this.SelectedComponentRowFromSheetB) {
                    this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayB, this.SelectedComponentRowFromSheetB);
                }

                return;
            }
        }

        this.HighlightRowInSheetData(CurrentReviewTableRow, viewerContainer);
        return;
    }

    if (classWiseComponents !== {}) {
        var componentProperties;
        for (var componentId in classWiseComponents) {
            componentProperties = classWiseComponents[componentId];
            break;
        }

        if (componentProperties === undefined) {
            return;
        }

        var column = {};
        columnHeaders = [];

        for (var i = 0; i < componentProperties.length; i++) {
            var compProperty = componentProperties[i];

            columnHeader = {};

            columnHeader["name"] = compProperty['name'];
            var type;
            if (compProperty['format'].toLowerCase() === "string") {
                type = "textarea";
            }
            else if (compProperty['format'].toLowerCase() === "number") {
                type = "number";
            }
            else {
                continue;
            }

            columnHeader["type"] = type;
            columnHeader["width"] = "90";
            columnHeaders.push(columnHeader);

            //tagnumber is for instruments XLS data sheet
            if (Object.keys(column).length <= 3) {
                if (compProperty['name'] === "ComponentClass" ||
                    compProperty['name'] === "Name" ||
                    compProperty['name'] === "Description" ||
                    compProperty['name'] === "Tagnumber") {
                    column[compProperty['name']] = i;
                }
            }
        }

        tableData = [];
        for (var componentId in classWiseComponents) {
            var component = classWiseComponents[componentId];

            tableRowContent = {};
            for (var i = 0; i < component.length; i++) {
                var compProperty = component[i];

                // get property value
                tableRowContent[compProperty['name']] = compProperty['value'];
            }

            tableData.push(tableRowContent);
        }


        if (CurrentReviewTableRow.tagName.toLowerCase() !== "tr") {
            return;
        }

        if (viewerContainer === "viewerContainer1") {
            this.checkStatusArrayA = {};
            this.SelectedComponentRowFromSheetA = undefined;

            this.LoadSheetTableData(columnHeaders, tableData, "#viewerContainer1", CurrentReviewTableRow, column, sheetName);
            this.HighlightRowInSheetData(CurrentReviewTableRow, "viewerContainer1");

            // keep track of currently loaded sheet data
            this.SourceAViewerCurrentSheetLoaded = sheetName;
        }
        else if (viewerContainer === "viewerContainer2") {
            this.checkStatusArrayB = {};
            this.SelectedComponentRowFromSheetB = undefined;

            this.LoadSheetTableData(columnHeaders, tableData, "#viewerContainer2", CurrentReviewTableRow, column, sheetName);
            this.HighlightRowInSheetData(CurrentReviewTableRow, "viewerContainer2");

            // keep track of currently loaded sheet data
            this.SourceBViewerCurrentSheetLoaded = sheetName;
        }
    }
};

/* This method returns the corresponding comparison 
   check result row for selected sheet row*/
ComparisonReviewManager.prototype.GetCheckComponentForSheetRow = function (sheetDataRow, viewerContainer) {
    var containerId = viewerContainer.replace("#", "");
    var viewerContainerData = document.getElementById(containerId)

    if (!viewerContainerData) {
        return undefined;
    }

    var containerChildren = viewerContainerData.children;
    var columnHeaders = containerChildren[0].getElementsByTagName("th");
    var column = {};
    for (var i = 0; i < columnHeaders.length; i++) {
        columnHeader = columnHeaders[i];
        //tagnumber is for instruments XLS data sheet
        if (columnHeader.innerHTML.trim() === "ComponentClass" ||
            columnHeader.innerHTML.trim() === "Name" ||
            columnHeader.innerHTML.trim() === "Description" ||
            columnHeader.innerHTML.trim() === "Tagnumber") {
            column[columnHeader.innerHTML.trim()] = i;
        }
        if (Object.keys(column).length === 3) {
            break;
        }
    }

    var reviewTableId = "ComparisonMainReviewCell";
    var reviewTableData = document.getElementById(reviewTableId);
    var reviewTableRowsData = reviewTableData.getElementsByTagName("tr");


    for (var i = 0; i < reviewTableRowsData.length; i++) {
        reviewTableRow = reviewTableRowsData[i];
        if (reviewTableRow.cells.length === 0) {
            continue;
        }

        var componentName;
        if (column.Name !== undefined) {
            componentName = sheetDataRow.cells[column.Name].innerText;
        }
        else if (column.Tagnumber !== undefined) {
            componentName = sheetDataRow.cells[column.Tagnumber].innerText;
        }

        if (componentName === reviewTableRow.cells[ComparisonColumns.SourceAName].innerText ||
            componentName === reviewTableRow.cells[ComparisonColumns.SourceBName].innerText) {

            return reviewTableRow;
        }
    }

    return undefined;
}

ComparisonReviewManager.prototype.HighlightRowInMainReviewTable = function (sheetDataRow,
    viewerContainer) {

    var reviewTableRow = this.GetCheckComponentForSheetRow(sheetDataRow, viewerContainer);
    if (!reviewTableRow) {
        return;
    }

    // component group id which is container div for check components table of given row
    var containerDiv = this.GetReviewTableId(reviewTableRow);
    this.OnCheckComponentRowClicked(reviewTableRow, containerDiv);

    var reviewTable = this.GetReviewTable(reviewTableRow);
    this.SelectionManager.ScrollToHighlightedCheckComponentRow(reviewTable, reviewTableRow, this.MainReviewTableContainer);
}

ComparisonReviewManager.prototype.LoadSheetTableData = function (columnHeaders,
    tableData,
    viewerContainer,
    CurrentReviewTableRow,
    column,
    sheetName) {

    var _this = this;
    if (viewerContainer === "#viewerContainer1" || viewerContainer === "#viewerContainer2") {
        $(function () {

            var width = "550px";
            var height = "270px";

            var modal = document.getElementById('maximizeViewerContainer');
            if (modal.style.display === "block") {
                width = "745px";
                height = "370px";
            }

            $(viewerContainer).jsGrid({
                height: height,
                width: width,
                autoload: true,
                data: tableData,
                fields: columnHeaders,
                margin: "0px",
                rowClick: function (args) {
                    _this.OnViewerRowClicked(args.event.currentTarget, viewerContainer);
                }
            });

        });

        _this.highlightSheetRowsFromCheckStatus(viewerContainer, CurrentReviewTableRow, column, sheetName);
    }

    var container = document.getElementById(viewerContainer.replace("#", ""));
    // container.style.width = "550px"
    // container.style.height = "270px"
    container.style.overflowX = "scroll";
    container.style.overflowY = "scroll";
    container.style.margin = "0px";
    container.style.top = "0px"

};

ComparisonReviewManager.prototype.IsFirstViewer = function (viewerContainer) {
    if (viewerContainer === "#viewerContainer1") {
        return true;
    }

    return false;
}
ComparisonReviewManager.prototype.IsSecondViewer = function (viewerContainer) {
    if (viewerContainer === "#viewerContainer2") {
        return true;
    }

    return false;
}

ComparisonReviewManager.prototype.FirstViewerExists = function () {
    if (document.getElementById("viewerContainer1").innerHTML !== "") {
        return true;
    }

    return false;
}

ComparisonReviewManager.prototype.SecondViewerExists = function () {
    if (document.getElementById("viewerContainer2").innerHTML !== "") {
        return true;
    }

    return false;
}

ComparisonReviewManager.prototype.SourceAComponentExists = function (row) {
    if (row.cells[ComparisonColumns.SourceAName].innerText !== "") {
        return true;
    }

    return false;
}

ComparisonReviewManager.prototype.SourceBComponentExists = function (row) {
    if (row.cells[ComparisonColumns.SourceBName].innerText !== "") {
        return true;
    }

    return false;
}

ComparisonReviewManager.prototype.OnViewerRowClicked = function (row, viewerContainer) {

    if ((this.IsFirstViewer(viewerContainer) &&
        row === this.SelectedComponentRowFromSheetA) ||
        (this.IsSecondViewer(viewerContainer) &&
            row === this.SelectedComponentRowFromSheetB)) {
        return;
    }

    // highlight sheet data row
    this.SelectionManager.ApplyHighlightColor(row);

    // highlight check result component row
    this.HighlightRowInMainReviewTable(row, viewerContainer);

    // highlight corresponding component data in another viewer
    if (this.IsFirstViewer(viewerContainer)) {

        if (this.SecondViewerExists() &&
            this.SourceBComponentExists(this.SelectionManager.HighlightedCheckComponentRow)) {
            if (this.SourceBComponents !== undefined) {
                this.HighlightRowInSheetData(this.SelectionManager.HighlightedCheckComponentRow, "viewerContainer2");
            }
            else if (this.SourceBViewerData !== undefined) {
                this.HighlightComponentInGraphicsViewer(this.SelectionManager.HighlightedCheckComponentRow)
            }
        }

        //for "no match" case unhighlight component 
        if (!this.SourceBComponentExists(this.SelectionManager.HighlightedCheckComponentRow)) {

            if (this.SourceBReviewViewerInterface) {
                this.SourceBReviewViewerInterface.unHighlightComponent();
            }
            if (this.SelectedComponentRowFromSheetB) {
                this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayB, this.SelectedComponentRowFromSheetB)
            }

        }
    }
    else if (this.IsSecondViewer(viewerContainer)) {
        if (this.FirstViewerExists() &&
            this.SourceAComponentExists(this.SelectionManager.HighlightedCheckComponentRow)) {

            if (this.SourceAComponents !== undefined) {
                this.HighlightRowInSheetData(this.SelectionManager.HighlightedCheckComponentRow, "viewerContainer1");
            }
            else if (this.SourceAViewerData !== undefined) {
                this.HighlightComponentInGraphicsViewer(this.SelectionManager.HighlightedCheckComponentRow)
            }
        }
        //for "no match" case unhighlight component 
        if (!this.SourceAComponentExists(this.SelectionManager.HighlightedCheckComponentRow)) {
            if (this.SourceAReviewViewerInterface) {
                this.SourceAReviewViewerInterface.unHighlightComponent();
            }

            if (this.SelectionManager.HighlightedCheckComponentRow) {
                this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayA, this.SelectedComponentRowFromSheetA)
            }
        }

    }
}

ComparisonReviewManager.prototype.LoadReviewTableData = function (columnHeaders, tableData, containerDiv) {
    var _this = this;
    $(function () {
        var db = {
            loadData: filter => {
                //   console.debug("Filter: ", filter);
                let sourceA = (filter.SourceA || "").toLowerCase();
                let sourceB = (filter.SourceB || "").toLowerCase();
                let status = (filter.Status || "").toLowerCase();
                let dmy = parseInt(filter.dummy, 10);
                this.recalculateTotals = true;
                return $.grep(tableData, row => {
                    return (!sourceA || row.SourceA.toLowerCase().indexOf(sourceA) >= 0)
                        && (!sourceB || row.SourceB.toLowerCase().indexOf(sourceB) >= 0)
                        && (!status || row.Status.toLowerCase().indexOf(status) >= 0)
                        && (isNaN(dmy) || row.dummy === dmy);
                });
            }
        };

        $(containerDiv).jsGrid({
            height: "202px",
            width: "578px",
            filtering: true,
            autoload: true,
            controller: db,
            sorting: true,
            data: tableData,
            fields: columnHeaders,
            margin: "0px",
            onDataLoaded: function (args) {
                //initializeComparisonContextMenus();
                var reviewComparisonContextMenuManager = new ReviewComparisonContextMenuManager(_this);
                reviewComparisonContextMenuManager.Init();
            },
            onItemUpdated: function (args) {
                for (var index = 0; index < args.grid.data.length; index++) {
                    if (args.grid.data[index].ID == args.row[0].cells[ComparisonColumns.ResultId].innerHTML) {
                        if (args.grid.data[index].Status !== args.row[0].cells[ComparisonColumns.Status].innerHTML) {
                            args.grid.data[index].Status = args.row[0].cells[ComparisonColumns.Status].innerHTML;
                            break;
                        }
                    }
                }
            },
            onRefreshed: function (config) {
                var id = containerDiv.replace("#", "");
                // _this.AddTableContentCount(this._container.context.id);
                document.getElementById(id).style.width = "578px";
                _this.highlightMainReviewTableFromCheckStatus(id);

                // hide additional column cells
                var tableRows = this._container.context.getElementsByTagName("tr");
                for (var j = 0; j < tableRows.length; j++) {
                    var currentRow = tableRows[j];
                    for (var i = 0; i < currentRow.cells.length; i++) {
                        if (i > ComparisonColumns.Status) {
                            currentRow.cells[i].style.display = "none";
                        }
                    }
                }

            },
            rowClick: function (args) {
                _this.OnCheckComponentRowClicked(args.event.currentTarget, containerDiv);
            }
        });

    });

    var container = document.getElementById(containerDiv.replace("#", ""));
    container.style.width = "578px"
    container.style.height = "202px"
    container.style.margin = "0px"
    container.style.overflowX = "hidden";
    container.style.overflowY = "scroll";
    container.style.padding = "0";

};

ComparisonReviewManager.prototype.OnCheckComponentRowClicked = function (rowData, containerDiv) {
    //maintain highlighted row
    // this.SelectionManager.MaintainHighlightedRow(row);

    // populate property table
    this.populateDetailedReviewTable(rowData);
    var SheetDataViewer = new Review1DViewerDataManager(this);
    var sheetName = containerDiv.replace("#", "");

    if (this.SourceAComponents !== undefined &&
        this.SourceBComponents !== undefined) {

        var result = sheetName.split('-');

        if (rowData.SourceAName !== "") {
            SheetDataViewer.LoadSelectedSheetDataInViewer("viewerContainer1", result[0], rowData);
        }
        else {
            document.getElementById("viewerContainer1").innerHTML = "";
            this.SourceAViewerCurrentSheetLoaded = undefined;
        }

        if (rowData.SourceBName !== "") {
            SheetDataViewer.LoadSelectedSheetDataInViewer("viewerContainer2", result[1], rowData);
        }
        else {
            document.getElementById("viewerContainer2").innerHTML = "";
            this.SourceBViewerCurrentSheetLoaded = undefined;
        }
    }
    else if (this.SourceAViewerData !== undefined &&
        this.SourceBViewerData !== undefined) {
        this.HighlightComponentInGraphicsViewer(rowData)
    }
    else if (this.SourceAComponents !== undefined &&
        this.SourceBViewerData !== undefined) {
        var result = sheetName.split('-');

        if (rowData.SourceAName !== "") {
            SheetDataViewer.LoadSelectedSheetDataInViewer("viewerContainer1", result[0], rowData);
        } else {
            document.getElementById("viewerContainer1").innerHTML = "";
            this.SourceAViewerCurrentSheetLoaded = undefined;
        }

        this.HighlightComponentInGraphicsViewer(rowData)
    }
    else if (this.SourceAViewerData !== undefined &&
        this.SourceBComponents !== undefined) {
        var result = sheetName.split('-');

        if (rowData.SourceBName !== "") {
            SheetDataViewer.LoadSelectedSheetDataInViewer("viewerContainer2", result[1], rowData);
        }
        else {
            document.getElementById("viewerContainer2").innerHTML = "";
            this.SourceBViewerCurrentSheetLoaded = undefined;
        }

        this.HighlightComponentInGraphicsViewer(rowData)
    }
}

ComparisonReviewManager.prototype.SetComment = function (comment) {
    var commentDiv = document.getElementById("ComparisonDetailedReviewComment");
    commentDiv.innerHTML = comment;
}

ComparisonReviewManager.prototype.GetComparisonResultId = function (selectedRow) {
    return selectedRow.cells[ComparisonColumns.ResultId].innerHTML;
}

ComparisonReviewManager.prototype.GetComparisonResultGroupId = function (selectedRow) {
    return selectedRow.cells[ComparisonColumns.GroupId].innerHTML;
}

ComparisonReviewManager.prototype.updateStatusForProperty = function (selectedRow) {
    var _this = this;

    var componentId = this.GetComparisonResultId(this.SelectionManager.HighlightedCheckComponentRow);
    var groupId = this.GetComparisonResultGroupId(this.SelectionManager.HighlightedCheckComponentRow);

    var propertiesNames = this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]);

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'tabletoupdate': "comparisonDetailed",
                'sourceAPropertyName': propertiesNames.SourceAName,
                'sourceBPropertyName': propertiesNames.SourceBName,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var originalstatus = _this.getStatusFromMainReviewRow(_this.SelectionManager.HighlightedCheckComponentRow);
                var changedStatus = originalstatus;
                if (!originalstatus.includes("(A)")) {
                    changedStatus = originalstatus + "(A)";
                    _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
                }
                if (msg.trim() == "OK(A)" || msg.trim() == "OK(A)(T)") {
                    changedStatus = msg.trim();
                    _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
                }

                var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];
                var checkComponents = checkGroup["CheckComponents"];
                var component = checkComponents[componentId];
                var properties = component["properties"];

                var propertiesLen = properties.length;

                for (var i = 0; i < propertiesLen; i++) {
                    var sourceAName = properties[i]["SourceAName"];
                    if (sourceAName == null) {
                        sourceAName = "";
                    }
                    var sourceBName = properties[i]["SourceBName"];
                    if (sourceBName == null) {
                        sourceBName = "";
                    }

                    if (sourceAName == propertiesNames.SourceAName &&
                        sourceBName == propertiesNames.SourceBName) {
                        selectedRow[0].cells[ComparisonPropertyColumns.Status].innerHTML = "ACCEPTED";
                        _this.SelectionManager.ChangeBackgroundColor(selectedRow[0], 'ACCEPTED');
                        properties[i]["Severity"] = "ACCEPTED";
                    }

                }
                _this.updateReviewComponentGridData(_this.SelectionManager.HighlightedCheckComponentRow, groupId, changedStatus);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.updateStatusForComponent = function (selectedRow) {

    var _this = this;
    var componentId = this.GetComparisonResultId(selectedRow[0]);
    var groupId = this.GetComparisonResultGroupId(selectedRow[0]);

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'tabletoupdate': "comparison",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var component = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                component.status = "OK(A)";
                _this.SelectionManager.ChangeBackgroundColor(selectedRow[0], component.status);
                for (var propertyId in component.properties) {
                    property = component.properties[propertyId];
                    if (property.Severity !== "OK" && property.Severity !== "No Value") {
                        if ((property.transpose == 'lefttoright' || property.transpose == 'righttoleft')
                            && property.Severity !== 'No Value') {
                            component.properties[propertyId].Severity = 'ACCEPTED';
                            component.status = "OK(A)(T)";
                            component.properties[propertyId].transpose = property.transpose;
                        }
                        else {
                            component.properties[propertyId].Severity = 'ACCEPTED';
                        }
                    }
                }
                _this.updateReviewComponentGridData(selectedRow[0], groupId, component.status);
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.updateReviewComponentGridData = function (selectedRow, groupId, changedStatus) {

    var gridId = '#' + this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;
    var _this = this;

    var editedItem = {
        "SourceA": selectedRow.cells[ComparisonColumns.SourceAName].innerText,
        "SourceB": selectedRow.cells[ComparisonColumns.SourceBName].innerText,
        "Status": changedStatus,
        "SourceANodeId": selectedRow.cells[ComparisonColumns.SourceANodeId].innerText,
        "SourceBNodeId": selectedRow.cells[ComparisonColumns.SourceBNodeId].innerText,
        "ID": this.GetComparisonResultId(selectedRow),
        "groupId": this.GetComparisonResultGroupId(selectedRow)
    };

    $(gridId).jsGrid("updateItem", selectedRow, editedItem).done(function () {
        _this.SelectionManager.HighlightedCheckComponentRow.cells[ComparisonColumns.Status].innerText = changedStatus;
        _this.populateDetailedReviewTable(selectedRow);
        $(gridId).jsGrid("refresh");
    });
}

ComparisonReviewManager.prototype.toggleAcceptAllComparedComponents = function (tabletoupdate) {
    var tabletoupdate = tabletoupdate;
    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            data: { 'tabletoupdate': tabletoupdate, 'ProjectName': projectinfo.projectname, 'CheckName': checkinfo.checkname },
            success: function (msg) {
                var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
                $.ajax({
                    url: 'PHP/CheckResultsReader.php',
                    type: "POST",
                    async: true,
                    data: {
                        'ProjectName': projectinfo.projectname,
                        'CheckName': checkinfo.checkname
                    },
                    success: function (msg) {
                        $("#ComparisonMainReviewCell").empty();
                        $("#ComparisonDetailedReviewCell").empty();
                        $("#SourceBComplianceMainReviewCell").empty();
                        $("#SourceBComplianceDetailedReviewCell").empty();
                        $("#SourceAComplianceMainReviewCell").empty();
                        $("#SourceAComplianceDetailedReviewCell").empty();
                        var checkResults = JSON.parse(msg);

                        var comparisonCheckGroups = undefined;
                        var sourceAComplianceCheckGroups = undefined;
                        var sourceBComplianceCheckGroups = undefined;

                        for (var key in checkResults) {
                            if (!checkResults.hasOwnProperty(key)) {
                                continue;
                            }


                            if (key == 'Comparison') {
                                comparisonCheckGroups = new CheckGroups();
                                comparisonCheckGroups.restore(checkResults[key], false);
                            }
                            else if (key == 'SourceACompliance') {
                                sourceAComplianceCheckGroups = new CheckGroups();
                                sourceAComplianceCheckGroups.restore(checkResults[key], true);
                            }
                            else if (key == 'SourceBCompliance') {
                                sourceBComplianceCheckGroups = new CheckGroups();
                                sourceBComplianceCheckGroups.restore(checkResults[key], true);
                            }
                        }

                        // populate check results
                        populateCheckResults(comparisonCheckGroups,
                            sourceAComplianceCheckGroups,
                            sourceBComplianceCheckGroups);

                        // load analytics data
                        document.getElementById("analyticsContainer").innerHTML = '<object type="text/html" data="analyticsModule.html" style="height: 100%; width: 100%" ></object>';
                    }
                });
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.updateStatusOfCategory = function (button) {
    var _this = this;

    var groupId = button.attributes[0].value;
    var categorydiv = document.getElementById(button.innerHTML);
    var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            data: { 'groupid': groupId, 'tabletoupdate': "category", 'ProjectName': projectinfo.projectname, 'CheckName': checkinfo.checkname },
            success: function (msg) {
                for (var i = 0; i < noOfComponents; i++) {
                    if (categorydiv.children[1].children[0].children[0].children[i].children[2].innerHTML !== "OK") {
                        var compgroup = _this.ComparisonCheckManager["CheckGroups"][groupId];
                        compgroup.categoryStatus = "ACCEPTED";
                        for (var compId in compgroup["CheckComponents"]) {
                            var component = compgroup["CheckComponents"][compId];
                            component.status = "OK(A)";
                            for (var propertyId in component.properties) {
                                property = component.properties[propertyId];
                                if (property.Severity !== 'No Value' && property.Severity !== 'OK')
                                    property.Severity = 'ACCEPTED';

                            }
                        }
                        var row = categorydiv.children[1].children[0].children[0].children[i];
                        var gridId = '#' + _this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;

                        var editedItem = {
                            "SourceA": row.cells[ComparisonColumns.SourceAName].innerText,
                            "SourceB": row.cells[ComparisonColumns.SourceBName].innerText,
                            "Status": component.status,
                            "SourceANodeId": row.cells[ComparisonColumns.SourceANodeId].innerText,
                            "SourceBNodeId": row.cells[ComparisonColumns.SourceBNodeId].innerText,
                            "ID": row.cells[ComparisonColumns.ResultId].innerText,
                            "groupId": row.cells[ComparisonColumns.GroupId].innerText
                        };

                        $(gridId).jsGrid("updateItem", row, editedItem).done(function () {
                            if (i == noOfComponents - 1) {
                                selectedRow = categorydiv.children[1].children[0].children[0].children[0];
                                _this.populateDetailedReviewTable(selectedRow);
                                $(gridId).jsGrid("refresh");
                            }
                        });
                    }
                }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.UnAcceptComponent = function (selectedRow) {
    var _this = this;
    var componentId = this.GetComparisonResultId(selectedRow[0]);
    var groupId = this.GetComparisonResultGroupId(selectedRow[0]);

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            dataType: 'JSON',
            async: true,
            data: {
                'componentid': componentId,
                'tabletoupdate': "rejectComponentFromComparisonTab",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var properties = status[1];

                var component = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                component.status = status[0];
                if (component.transpose != null) {
                    if (!status[0].includes("(T)"))
                        component.status = status[0] + "(T)";
                }

                _this.SelectionManager.ChangeBackgroundColor(selectedRow[0], component.status);

                var index = 0;
                for (var propertyId in properties) {
                    property = properties[propertyId];
                    if ((property.transpose == 'lefttoright' || property.transpose == 'righttoleft')
                        && property.severity !== 'No Value') {
                        component.properties[index].Severity = 'OK(T)';
                        component.properties[index].transpose = property.transpose;
                    }
                    else {
                        component.properties[index].Severity = property.severity;
                    }
                    index++;
                }
                _this.updateReviewComponentGridData(selectedRow[0], groupId, component.status);
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.UnAcceptProperty = function (selectedRow) {
    var _this = this;

    var componentId = this.GetComparisonResultId(this.SelectionManager.HighlightedCheckComponentRow);
    var groupId = this.GetComparisonResultGroupId(this.SelectionManager.HighlightedCheckComponentRow);

    var propertiesNames = this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]);

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: {
                'componentid': componentId,
                'tabletoupdate': "rejectPropertyFromComparisonTab",
                'sourceAPropertyName': propertiesNames.SourceAName,
                'sourceBPropertyName': propertiesNames.SourceBName,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var changedStatus = status[0];
                var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];
                var checkComponents = checkGroup["CheckComponents"];
                var component = checkComponents[componentId];
                var properties = component["properties"];

                var propertiesLen = properties.length;

                if (component["transpose"] !== null && !status[0].includes("(T)")) {
                    changedStatus = status[0] + "(T)";
                }
                component["Status"] = changedStatus;
                for (var i = 0; i < propertiesLen; i++) {
                    var sourceAName = properties[i]["SourceAName"];
                    if (sourceAName == null) {
                        sourceAName = "";
                    }
                    var sourceBName = properties[i]["SourceBName"];
                    if (sourceBName == null) {
                        sourceBName = "";
                    }

                    if (sourceAName == propertiesNames.SourceAName &&
                        sourceBName == propertiesNames.SourceBName) {
                        properties[i]["Severity"] = status[1];
                    }

                }
                _this.updateReviewComponentGridData(_this.SelectionManager.HighlightedCheckComponentRow, groupId, changedStatus);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.UnAcceptCategory = function (button) {
    var _this = this;

    var groupId = button.attributes[0].value;
    var categorydiv = document.getElementById(button.innerHTML);
    var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: {
                'groupid': groupId,
                'tabletoupdate': "rejectCategoryFromComparisonTab",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var componentStatus = status[0];
                var propsStatus = status[1];
                var index = 0
                for (var i = 0; i < noOfComponents; i++) {
                    var j = 0;
                    var compgroup = _this.ComparisonCheckManager["CheckGroups"][groupId];
                    compgroup.categoryStatus = "UNACCEPTED";
                    for (var compId in compgroup["CheckComponents"]) {
                        var component = compgroup["CheckComponents"][compId];
                        component.status = componentStatus[index]['status'];
                        var propindex = 0;
                        for (var propertyId in component.properties) {
                            property = component.properties[propertyId];
                            property.Severity = propsStatus[j][propindex]['severity'];
                            propindex++;
                        }
                        j++;
                    }

                    var row = categorydiv.children[1].children[0].children[0].children[i];
                    var gridId = '#' + _this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;

                    var editedItem = {
                        "SourceA": row.cells[ComparisonColumns.SourceAName].innerText,
                        "SourceB": row.cells[ComparisonColumns.SourceBName].innerText,
                        "Status": component.status,
                        "SourceANodeId": row.cells[ComparisonColumns.SourceANodeId].innerText,
                        "SourceBNodeId": row.cells[ComparisonColumns.SourceBNodeId].innerText,
                        "ID": row.cells[ComparisonColumns.ResultId].innerText,
                        "groupId": row.cells[ComparisonColumns.GroupId].innerText
                    };

                    $(gridId).jsGrid("updateItem", row, editedItem).done(function () {
                        if (i == noOfComponents - 1) {
                            selectedRow = categorydiv.children[1].children[0].children[0].children[0];
                            _this.populateDetailedReviewTable(selectedRow);
                            $(gridId).jsGrid("refresh");
                        }
                    });
                    index++;
                }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.GetCellValue = function(currentReviewTableRow, cell) {
    return currentReviewTableRow.cells[cell].childNodes[0].data.trim();
}

ComparisonReviewManager.prototype.HighlightComponentInGraphicsViewer = function (currentReviewTableRowData) {
    var sourceANodeId;
    if (this.SourceAViewerData !== undefined &&
        currentReviewTableRowData.SourceANodeId !== "") {
        sourceANodeId = currentReviewTableRowData.SourceANodeId;
    }

    var sourceBNodeId;
    if (this.SourceBViewerData !== undefined &&
        currentReviewTableRowData.SourceBNodeId !== "") {
        sourceBNodeId = currentReviewTableRowData.SourceBNodeId;
    }

    // highlight component in graphics view in both viewer
    if (this.SourceAViewerData != undefined) {
        if (sourceANodeId !== undefined && sourceANodeId !== "") {
            this.SourceAReviewViewerInterface.highlightComponent(sourceANodeId);
        }
        else {
            // unhighlight previous component
            this.SourceAReviewViewerInterface.unHighlightComponent();
        }
    }
    if (this.SourceBViewerData != undefined) {

        if (sourceBNodeId !== undefined && sourceBNodeId !== "") {
            this.SourceBReviewViewerInterface.highlightComponent(sourceBNodeId);
        }
        else {
            // unhighlight previous component
            this.SourceBReviewViewerInterface.unHighlightComponent();
        }
    }
}

ComparisonReviewManager.prototype.TransposeProperty = function (key, selectedRow) {
    var _this = this;
    var transposeType = key;

    var componentId = this.GetComparisonResultId(this.SelectionManager.HighlightedCheckComponentRow);
    var groupId = this.GetComparisonResultGroupId(this.SelectionManager.HighlightedCheckComponentRow);
    var propertiesNames = this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]);

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'transposeType': transposeType,
                'sourceAPropertyName': propertiesNames.SourceAName,
                'sourceBPropertyName': propertiesNames.SourceBName,
                'transposeLevel': 'propertyLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var originalstatus = _this.getStatusFromMainReviewRow(_this.SelectionManager.HighlightedCheckComponentRow);
                var changedStatus = originalstatus;

                var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];
                var checkComponents = checkGroup["CheckComponents"];
                var component = checkComponents[componentId];
                var properties = component["properties"];

                if (!originalstatus.includes("(T)")) {
                    changedStatus = originalstatus + "(T)";
                    component.Status = changedStatus;
                }
                if (msg.trim() == "OK(T)" || msg.trim() == "OK(A)(T)") {
                    changedStatus = msg.trim();
                    component.Status = changedStatus;
                    component.transpose = transposeType;
                }

                _this.SelectionManager.ChangeBackgroundColor(_this.SelectionManager.HighlightedCheckComponentRow, changedStatus);

                var SourceAValue = selectedRow[0].cells[ComparisonPropertyColumns.SourceAValue].innerHTML;
                var SourceBValue = selectedRow[0].cells[ComparisonPropertyColumns.SourceBValue].innerHTML;

                _this.SelectionManager.ChangeBackgroundColor(selectedRow[0], 'OK(T)');

                var propertiesLen = properties.length;

                for (var i = 0; i < propertiesLen; i++) {
                    var sourceAName = properties[i]["SourceAName"];
                    if (sourceAName == null) {
                        sourceAName = "";
                    }
                    var sourceBName = properties[i]["SourceBName"];
                    if (sourceBName == null) {
                        sourceBName = "";
                    }

                    if (sourceAName == propertiesNames.SourceAName &&
                        sourceBName == propertiesNames.SourceBName) {
                        properties[i]["Severity"] = 'OK(T)';
                        properties[i]['transpose'] = transposeType;
                        selectedRow[0].cells[ComparisonPropertyColumns.Status].innerHTML = 'OK(T)';
                        if (transposeType == "lefttoright") {
                            selectedRow[0].cells[ComparisonPropertyColumns.SourceBValue].innerHTML = SourceAValue;
                        }
                        else if (transposeType == "righttoleft") {
                            selectedRow[0].cells[ComparisonPropertyColumns.SourceAValue].innerHTML = SourceBValue;
                        }

                    }

                    if (properties[i]["Severity"] != 'OK' && properties[i]["Severity"] !== 'No Match') {
                        if (properties[i]['transpose'] !== null) {
                            if (i == propertiesLen - 1) {
                                component["Status"] = 'OK(T)';
                                component["transpose"] = transposeType;
                            }
                        }
                    }
                }
                _this.updateReviewComponentGridData(_this.SelectionManager.HighlightedCheckComponentRow, groupId, changedStatus);
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestorePropertyTranspose = function (selectedRow) {
    var _this = this;
    var transposeType = 'restoreProperty';

    var componentId = this.GetComparisonResultId(this.SelectionManager.HighlightedCheckComponentRow);
    var groupId = this.GetComparisonResultGroupId(this.SelectionManager.HighlightedCheckComponentRow);

    var propertiesNames = this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]);
    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: {
                'componentid': componentId,
                'transposeType': transposeType,
                'sourceAPropertyName': propertiesNames.SourceAName,
                'sourceBPropertyName': propertiesNames.SourceBName,
                'transposeLevel': 'propertyLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var changedStatus = status[0];

                var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];
                var checkComponents = checkGroup["CheckComponents"];
                var component = checkComponents[componentId];
                var properties = component["properties"];

                var propertiesLen = properties.length;

                for (var i = 0; i < propertiesLen; i++) {
                    var sourceAName = properties[i]["SourceAName"];
                    if (sourceAName == null) {
                        sourceAName = "";
                    }
                    var sourceBName = properties[i]["SourceBName"];
                    if (sourceBName == null) {
                        sourceBName = "";
                    }

                    if (sourceAName == selectedRow[0].cells[ComparisonPropertyColumns.SourceAName].innerText &&
                        sourceBName == selectedRow[0].cells[ComparisonPropertyColumns.SourceBName].innerText) {
                        properties[i]["Severity"] = status[1];
                        properties[i]["transpose"] = null;
                    }
                    else if (properties[i]["transpose"] !== null && !status[0].includes("(T)")) {
                        changedStatus = status[0] + "(T)";
                    }

                }

                component["Status"] = changedStatus;
                component["transpose"] = null;
                _this.updateReviewComponentGridData(_this.SelectionManager.HighlightedCheckComponentRow, groupId, changedStatus);
            }

        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestoreComponentTranspose = function (selectedRow) {
    var _this = this;
    var componentId = this.GetComparisonResultId(selectedRow[0]);
    var groupId = this.GetComparisonResultGroupId(selectedRow[0]);

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            dataType: 'JSON',
            async: true,
            data: {
                'componentid': componentId,
                'transposeType': 'restoreComponent',
                'transposeLevel': 'componentLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var properties = status[1];
                var component = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                component.status = status[0];
                component.transpose = null;
                var index = 0;
                for (var propertyId in properties) {
                    property = properties[propertyId];
                    if (property.accepted == 'false') {
                        component.properties[index].Severity = property.severity;
                        component.properties[index].transpose = null;
                    }
                    else if (property.accepted == 'true') {
                        if (!status[0].includes("(A)"))
                            component.status = status[0] + "(A)";
                    }
                    index++;
                }
                _this.updateReviewComponentGridData(selectedRow[0], groupId, component.status);
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.TransposeComponent = function (key, selectedRow) {
    var _this = this;

    var componentId = this.GetComparisonResultId(selectedRow[0]);
    var groupId = this.GetComparisonResultGroupId(selectedRow[0]);
    var transposeType = key;

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'transposeType': transposeType,
                'transposeLevel': 'componentLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var component = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                component.transpose = transposeType;
                component.status = 'OK(T)';
                for (var propertyId in component.properties) {
                    property = component.properties[propertyId];
                    if (property.Severity !== "OK" && property.Severity !== "No Value") {
                        if (property.Severity == 'ACCEPTED') {
                            component.status = 'OK(A)(T)';
                        }
                        else if ((transposeType == 'lefttoright' || transposeType == 'righttoleft')
                            && (property.SourceAName !== "" && property.SourceBName !== "")) {
                            property.Severity = 'OK(T)';
                            property.transpose = transposeType;
                        }
                        else {
                            if ((property.Severity == 'Error' || property.Severity == 'No Match') && property.transpose == null &&
                                component.status == 'OK(T)') {
                                if (!(component.Status).includes('(T)'))
                                    component.status = component.Status + "(T)";
                            }
                        }
                    }

                }
                _this.updateReviewComponentGridData(selectedRow[0], groupId, component.status);
            },
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestoreCategoryTranspose = function (button) {
    var _this = this;

    var groupId = button.getAttribute("groupId");
    var categorydiv = document.getElementById(button.innerHTML);
    var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: { 'groupid': groupId, 'transposeType': 'restoreCategory', 'transposeLevel': 'categorylevel', 'ProjectName': projectinfo.projectname, 'CheckName': checkinfo.checkname },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var componentStatus = status[0];
                var propsStatus = status[1];
                var index = 0
                for (var i = 0; i < noOfComponents; i++) {
                    var j = 0;
                    var compgroup = _this.ComparisonCheckManager["CheckGroups"][groupId];
                    compgroup.categoryStatus = "UNACCEPTED";
                    for (var compId in compgroup["CheckComponents"]) {
                        var component = compgroup["CheckComponents"][compId];
                        component.status = componentStatus[index]['status'];
                        component.transpose = null;
                        var propindex = 0;
                        for (var propertyId in component.properties) {
                            property = component.properties[propertyId];
                            property.Severity = propsStatus[j][propindex]['severity'];
                            property.transpose = null;
                            propindex++;
                        }
                        j++;
                    }
                    var row = categorydiv.children[1].children[0].children[0].children[i];
                    var gridId = '#' + _this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;

                    var editedItem = {
                        "SourceA": row.cells[ComparisonColumns.SourceAName].innerText,
                        "SourceB": row.cells[ComparisonColumns.SourceBName].innerText,
                        "Status": component.status,
                        "SourceANodeId": row.cells[ComparisonColumns.SourceANodeId].innerText,
                        "SourceBNodeId": row.cells[ComparisonColumns.SourceBNodeId].innerText,
                        "ID": row.cells[ComparisonColumns.ResultId].innerText,
                        "groupId": row.cells[ComparisonColumns.GroupId].innerText
                    };

                    $(gridId).jsGrid("updateItem", row, editedItem).done(function () {
                        if (i == noOfComponents - 1) {
                            selectedRow = categorydiv.children[1].children[0].children[0].children[0];
                            _this.populateDetailedReviewTable(selectedRow);
                            $(gridId).jsGrid("refresh");
                        }
                    });
                    index++;
                }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.TransposeCategory = function (key, button) {
    var _this = this;

    var groupId = button.getAttribute("groupId");
    var categorydiv = document.getElementById(button.innerHTML);
    var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;
    var transposeType = key;

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            data: { 'groupid': groupId, 'transposeType': transposeType, 'transposeLevel': 'categorylevel', 'ProjectName': projectinfo.projectname, 'CheckName': checkinfo.checkname },
            success: function (msg) {

                var compgroup = _this.ComparisonCheckManager["CheckGroups"][groupId];
                compgroup.categoryStatus = "OK(T)";
                var index = 0;
                for (var compId in compgroup["CheckComponents"]) {
                    var component = compgroup["CheckComponents"][compId];
                    component.status = component.Status;
                    if (component.Status !== 'No Match' && component.Status !== 'OK') {
                        for (var propertyId in component.properties) {
                            property = component.properties[propertyId];
                            if (property.Severity !== 'OK' && property.Severity !== 'No Value') {
                                if ((transposeType == 'lefttoright' || transposeType == 'righttoleft')
                                    && (property.SourceAName !== "" && property.SourceBName !== "")) {
                                    property.Severity = 'OK(T)';
                                    property.transpose = transposeType;
                                    component.status = "OK(T)";
                                    component.transpose = transposeType;
                                }
                                else {
                                    if ((property.Severity == 'Error' || property.Severity == 'No Match') && property.transpose == null &&
                                        component.status == 'OK(T)') {
                                        if (!(component.Status).includes('(T)'))
                                            component.status = component.Status + "(T)";
                                    }
                                }
                            }
                        }
                    }
                    var row = categorydiv.children[1].children[0].children[0].children[index];
                    var gridId = '#' + _this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;

                    var editedItem = {
                        "SourceA": row.cells[ComparisonColumns.SourceAName].innerText,
                        "SourceB": row.cells[ComparisonColumns.SourceBName].innerText,
                        "Status": component.status,
                        "SourceANodeId": row.cells[ComparisonColumns.SourceANodeId].innerText,
                        "SourceBNodeId": row.cells[ComparisonColumns.SourceBNodeId].innerText,
                        "ID": row.cells[ComparisonColumns.ResultId].innerText,
                        "groupId": row.cells[ComparisonColumns.GroupId].innerText
                    };

                    $(gridId).jsGrid("updateItem", row, editedItem).done(function () {
                        if (index == noOfComponents - 1) {
                            selectedRow = categorydiv.children[1].children[0].children[0].children[0];
                            _this.populateDetailedReviewTable(selectedRow);
                            $(gridId).jsGrid("refresh");
                        }
                    });
                    index++;
                }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.LoadDetailedReviewTableData = function (_this, columnHeaders, tableData, viewerContainer) {
    //var _this = this;

    $(function () {
        var db = {
            loadData: filter => {
                //   console.debug("Filter: ", filter);
                let A_property = (filter.A_Property || "").toLowerCase();
                let A_value = (filter.A_Value || "").toLowerCase();
                let B_property = (filter.B_Property || "").toLowerCase();
                let B_value = (filter.B_Value || "").toLowerCase();
                let status = (filter.Status || "").toLowerCase();
                let dmy = parseInt(filter.dummy, 10);
                this.recalculateTotals = true;
                return $.grep(tableData, row => {
                    return (!A_property || row.A_Property.toLowerCase().indexOf(A_property) >= 0)
                        && (!A_value || row.A_Value.toLowerCase().indexOf(A_value) >= 0)
                        && (!B_value || row.B_Value.toLowerCase().indexOf(B_value) >= 0)
                        && (!B_property || row.B_Property.toLowerCase().indexOf(B_property) >= 0)
                        && (!status || row.Status.toLowerCase().indexOf(status) >= 0)
                        && (isNaN(dmy) || row.dummy === dmy);
                });
            }

        };

        $(viewerContainer).jsGrid({
            width: "576px",
            height: "180px",
            filtering: true,
            autoload: true,
            controller: db,
            sorting: true,
            data: tableData,
            headerRowRenderer: function () {
                var fields = $(viewerContainer).jsGrid("option", "fields");
                var result = $("<tr>").height(0).append($("<th>").width(120))
                    .append($("<th>").width(110))
                    .append($("<th>").width(120))
                    .append($("<th>").width(110));

                result = result.add($("<tr>")
                    .append($("<th>").attr("colspan", 2).text("SourceA"/*AnalyticsData.SourceAName*/))
                    .append($("<th>").attr("colspan", 2).text("SourceB"/*AnalyticsData.SourceBName*/)))


                var tr = $("<tr class='jsgrid-header-row'>");
                var grid = this;

                grid._eachField(function (field, index) {
                    var th = $("<th>").text(field.title).width(field.width).appendTo(tr);

                    if (grid.sorting && field.sorting) {
                        th.on("click", function () {
                            grid.sort(index);
                        });
                    }
                });

                return result.add(tr);
            },
            fields: columnHeaders,
            margin: "0px",
            onRefreshed: function (config) {
                var id = viewerContainer.replace("#", "");
                document.getElementById(id).style.width = "579px";
                _this.highlightDetailedReviewTableFromCheckStatus(id);
            },
            rowClick: function (args) {
                var comment = _this.detailedReviewRowComments[args.event.currentTarget.rowIndex];
                var commentDiv = document.getElementById("ComparisonDetailedReviewComment");
                if (comment) {
                    commentDiv.innerHTML = "Comment : <br>" + comment;
                }
                else {
                    commentDiv.innerHTML = "Comment : <br>";
                }
            }
        });
    });

    var container = document.getElementById(viewerContainer.replace("#", ""));
    container.style.width = "579px"
    container.style.height = "180px"
    container.style.margin = "0px"
    container.style.overflowX = "hidden";
    container.style.overflowY = "scroll";

};

ComparisonReviewManager.prototype.highlightSheetRowsFromCheckStatus = function (viewerContainer, reviewTableRow, column, sheetName) {
    var reviewTableElement = reviewTableRow.parentElement;
    var reviewTableRows = reviewTableElement.getElementsByTagName("tr");

    var id = viewerContainer.replace("#", "");
    var currentSheetDataTable = document.getElementById(id);
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var currentSheetRows = currentSheetDataTable.children[jsGridTbodyTableIndex].getElementsByTagName("tr");

    var checkStatusArray = {};
    for (var i = 0; i < reviewTableRows.length; i++) {
        var CurrentReviewTableRow = reviewTableRows[i];
        for (var j = 0; j < currentSheetRows.length; j++) {
            currentSheetRow = currentSheetRows[j];
            var componentName;
            if (column['Name'] !== undefined) {
                componentName = currentSheetRow.cells[column['Name']].innerText;
            }
            else if (column['Tagnumber'] !== undefined) {
                componentName = currentSheetRow.cells[column['Tagnumber']].innerText;
            }

            var sourceComponentNames = this.getSourceNamesFromMainReviewRow(CurrentReviewTableRow);

            if (sourceComponentNames.SourceAName !== "" && 
               sourceComponentNames.SourceAName === componentName) {
                var color = CurrentReviewTableRow.cells[0].style.backgroundColor;
                for (var j = 0; j < currentSheetRow.cells.length; j++) {
                    cell = currentSheetRow.cells[j];
                    cell.style.backgroundColor = color;
                }
                checkStatusArray[currentSheetRow.rowIndex] = this.getStatusFromMainReviewRow(CurrentReviewTableRow);
                break;
            }
            else if (sourceComponentNames.SourceBName !== "" && 
                    sourceComponentNames.SourceBName === componentName) {
                var color = CurrentReviewTableRow.cells[0].style.backgroundColor;
                for (var j = 0; j < currentSheetRow.cells.length; j++) {
                    cell = currentSheetRow.cells[j];
                    cell.style.backgroundColor = color;
                }
                checkStatusArray[currentSheetRow.rowIndex] = this.getStatusFromMainReviewRow(CurrentReviewTableRow);
                break;
            }
        }
    }

    if (viewerContainer === "#viewerContainer1") {
        this.checkStatusArrayA = {};
        this.checkStatusArrayA[sheetName] = checkStatusArray;
    }
    else if (viewerContainer === "#viewerContainer2") {
        this.checkStatusArrayB = {};
        this.checkStatusArrayB[sheetName] = checkStatusArray;
    }
}

ComparisonReviewManager.prototype.HighlightRowInSheetData = function (CurrentReviewTableRow, viewerContainer) {
    var containerId = viewerContainer.replace("#", "");
    var viewerContainerData = document.getElementById(containerId);

    if (viewerContainerData != undefined) {
        var containerChildren = viewerContainerData.children;
        // 0 index jsGrid header table
        var columnHeaders = containerChildren[0].getElementsByTagName("th");
        //1 index jsGrid table body
        var sheetDataTable = containerChildren[1].getElementsByTagName("table")[0];
        var sourceDataViewTableRows = sheetDataTable.getElementsByTagName("tr");
        var column = {};
        for (var i = 0; i < columnHeaders.length; i++) {
            columnHeader = columnHeaders[i];
            //tagnumber is for instruments XLS data sheet
            if (columnHeader.innerHTML.trim() === "ComponentClass" ||
                columnHeader.innerHTML.trim() === "Name" ||
                columnHeader.innerHTML.trim() === "Description" ||
                columnHeader.innerHTML.trim() === "Tagnumber") {
                column[columnHeader.innerHTML.trim()] = i;
            }
            if (Object.keys(column).length === 3) {
                break;
            }
        }
        for (var i = 0; i < sourceDataViewTableRows.length; i++) {
            currentRowInSourceTable = sourceDataViewTableRows[i];

            var componentName;
            if (column.Name !== undefined) {
                componentName = currentRowInSourceTable.cells[column.Name].innerText;
            }
            else if (column.Tagnumber !== undefined) {
                componentName = currentRowInSourceTable.cells[column.Tagnumber].innerText;
            }
            if (CurrentReviewTableRow.cells[ComparisonColumns.SourceAName].innerText === componentName ||
                CurrentReviewTableRow.cells[ComparisonColumns.SourceBName].innerText === componentName) {
                if (containerId === "viewerContainer1") {
                    if (this.SelectedComponentRowFromSheetA) {
                        this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayA, this.SelectedComponentRowFromSheetA);
                    }

                    this.SelectedComponentRowFromSheetA = currentRowInSourceTable;

                    this.SelectionManager.ApplyHighlightColor(this.SelectedComponentRowFromSheetA);

                    var sheetDataTable1 = containerChildren[1].getElementsByTagName("table")[0];
                    sheetDataTable1.focus();
                    sheetDataTable1.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
                }
                if (containerId === "viewerContainer2") {

                    if (this.SelectedComponentRowFromSheetB) {
                        this.unhighlightSelectedSheetRowInviewer(this.checkStatusArrayB, this.SelectedComponentRowFromSheetB);
                    }

                    this.SelectedComponentRowFromSheetB = currentRowInSourceTable;

                    this.SelectionManager.ApplyHighlightColor(this.SelectedComponentRowFromSheetB);

                    var sheetDataTable2 = containerChildren[1].getElementsByTagName("table")[0];
                    sheetDataTable2.focus();
                    sheetDataTable2.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
                }

                break;
            }
        }
    }
}

ComparisonReviewManager.prototype.unhighlightSelectedSheetRowInviewer = function (checkStatusArray,
    currentRow) {
    var rowIndex = currentRow.rowIndex;
    obj = Object.keys(checkStatusArray)
    var status = checkStatusArray[obj[0]][rowIndex]
    if (status !== undefined) {
        this.SelectionManager.ChangeBackgroundColor(currentRow, status);
    }
    else {
        color = "#fffff"
        for (var j = 0; j < currentRow.cells.length; j++) {
            cell = currentRow.cells[j];
            cell.style.backgroundColor = color;
        }
    }
}

ComparisonReviewManager.prototype.populateDetailedReviewTable = function (rowData) {
    // clear comment
    this.SetComment("");

    this.detailedReviewRowComments = {};

    var parentTable = document.getElementById("ComparisonDetailedReviewCell");
    parentTable.innerHTML = '';

    var tableData = [];
    var columnHeaders = [];

    var componentId = rowData.ResultId;
    var groupId = rowData.GroupId;

    for (var componentsGroupID in this.ComparisonCheckManager) {

        // get the componentgroupd corresponding to selected component 
        var componentsGroupList = this.ComparisonCheckManager[componentsGroupID];

        if (componentsGroupList && componentsGroupID != "restore") {
            var component = componentsGroupList[groupId].CheckComponents[componentId];

            var div = document.createElement("DIV");
            parentTable.appendChild(div);

            div.innerHTML = "Check Details :";
            div.style.fontSize = "20px";
            div.style.fontWeight = "bold";

            for (var i = 0; i < Object.keys(ComparisonPropertyColumns).length; i++) {
                columnHeader = {};
                var title;
                if (i === ComparisonPropertyColumns.SourceAName) {
                    title = "Property";
                    name = ComparisonPropertyColumnNames.SourceAName;
                }
                else if (i === ComparisonPropertyColumns.SourceAValue) {
                    title = "Value";
                    name = ComparisonPropertyColumnNames.SourceAValue;
                }
                else if (i === ComparisonPropertyColumns.SourceBValue) {
                    title = "Value";
                    name = ComparisonPropertyColumnNames.SourceBValue;
                }
                else if (i === ComparisonPropertyColumns.SourceBName) {
                    title = "Property";
                    name = ComparisonPropertyColumnNames.SourceBName;
                }
                else if (i === ComparisonPropertyColumns.Status) {
                    title = "Status";
                    name = ComparisonPropertyColumnNames.Status;
                }

                columnHeader["title"] = title;
                columnHeader["name"] = name;
                columnHeader["type"] = "textarea";
                columnHeader["width"] = "27";
                columnHeader["filtering"] = "true";
                columnHeaders.push(columnHeader);
            }

            // show component class name as property in detailed review table    

            var property;

            for (var propertyId in component.properties) {
                property = component.properties[propertyId];
                tableRowContent = this.addPropertyRowToDetailedTable(property, columnHeaders);

                this.detailedReviewRowComments[Object.keys(this.detailedReviewRowComments).length] = property.Description;

                tableData.push(tableRowContent);
            }

            var id = "#ComparisonDetailedReviewCell";
            this.LoadDetailedReviewTableData(this, columnHeaders, tableData, id);
            this.highlightDetailedReviewTableFromCheckStatus("ComparisonDetailedReviewCell")

            var modelBrowserData = document.getElementById("ComparisonDetailedReviewCell");

            var modelBrowserHeaderTable = modelBrowserData.children[jsGridHeaderTableIndex];
            modelBrowserHeaderTable.style.position = "fixed"
            modelBrowserHeaderTable.style.width = "565px";
            modelBrowserHeaderTable.style.backgroundColor = "white";
            modelBrowserHeaderTable.style.overflowX = "hide";
            var modelBrowserHeaderTableRows = modelBrowserHeaderTable.getElementsByTagName("tr");
            for (var j = 0; j < modelBrowserHeaderTableRows.length; j++) {
                var currentRow = modelBrowserHeaderTableRows[j];
                for (var i = 0; i < currentRow.cells.length; i++) {
                    if (i === 5 || i === 6 || i === 7) {
                        currentRow.cells[i].style.display = "none";
                    }

                }
            }

            // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
            var modelBrowserDataTable = modelBrowserData.children[jsGridTbodyTableIndex]
            modelBrowserDataTable.style.position = "static"
            modelBrowserDataTable.style.width = "579px";
            modelBrowserDataTable.style.margin = "52px 0px 0px 0px"
        }
    }
}

ComparisonReviewManager.prototype.highlightDetailedReviewTableFromCheckStatus = function (containerId) {
    var detailedReviewTableContainer = document.getElementById(containerId);
    if (detailedReviewTableContainer === null) {
        return;
    }
    if (detailedReviewTableContainer.children.length === 0) {
        return;
    }
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var detailedReviewTableRows = detailedReviewTableContainer.children[jsGridTbodyTableIndex].getElementsByTagName("tr");

    // var mainReviewTableRows = mainReviewTable.getElementsByTagName("tr");

    for (var i = 0; i < detailedReviewTableRows.length; i++) {
        var currentRow = detailedReviewTableRows[i];
        if (currentRow.cells.length > 1) {
            var status = currentRow.cells[ComparisonPropertyColumns.Status].innerHTML;
            this.SelectionManager.ChangeBackgroundColor(currentRow, status);
        }
    }
}

ComparisonReviewManager.prototype.addPropertyRowToDetailedTable = function (property, columnHeaders) {

    tableRowContent = {};
    tableRowContent[columnHeaders[0].name] = property.SourceAName;
    tableRowContent[columnHeaders[1].name] = property.SourceAValue;
    tableRowContent[columnHeaders[2].name] = property.SourceBValue;
    tableRowContent[columnHeaders[3].name] = property.SourceBName;
    tableRowContent[columnHeaders[4].name] = property.Severity;

    if (property.transpose == 'lefttoright' && property.Severity !== 'No Value') {
        tableRowContent[columnHeaders[4].name] = 'OK(T)';
        tableRowContent[columnHeaders[2].name] = property.SourceAValue;
    }
    else if (property.transpose == 'righttoleft' && property.Severity !== 'No Value') {
        tableRowContent[columnHeaders[4].name] = 'OK(T)';
        tableRowContent[columnHeaders[1].name] = property.SourceBValue;
    }
    // if (property.PerformCheck &&
    //     property.Result) {
    //     tableRowContent[columnHeaders[4].name] = "OK";
    // }
    // else {

    // }
    return tableRowContent;
}

ComparisonReviewManager.prototype.GetReviewTableId = function (row) {
    var tBodyElement = row.parentElement;
    if (!tBodyElement) {
        return;
    }
    var tableElement = tBodyElement.parentElement;

    return tableElement.parentElement.parentElement.id;
}

ComparisonReviewManager.prototype.GetReviewTable = function (row) {
    var tBodyElement = row.parentElement;
    if (!tBodyElement) {
        return;
    }
    var tableElement = tBodyElement.parentElement;

    return tableElement.parentElement.parentElement;
}

ComparisonReviewManager.prototype.getSourceNamesFromMainReviewRow = function (row) {
    return {
        SourceAName: row.cells[ComparisonColumns.SourceAName].innerText,
        SourceBName: row.cells[ComparisonColumns.SourceBName].innerText
    };
}

ComparisonReviewManager.prototype.getStatusFromMainReviewRow = function (row) {
    return row.cells[ComparisonColumns.Status].innerText;
}

ComparisonReviewManager.prototype.getSourcePropertiesNamesFromDetailedReview = function (row) {
    return {
        SourceAName: row.cells[ComparisonPropertyColumns.SourceAName].innerText,
        SourceBName: row.cells[ComparisonPropertyColumns.SourceBName].innerText
    }
}
