function Review1DViewerInterface(id,
    components) {

    // call super constructor
    ReviewViewerInterface.call(this, null, null, null);
    this.ActiveSheetName;

    this.Components = components;

    this.CheckStatusArray = {};


    this.IsComparison = model.getCurrentReviewType() === "comparison" ? true : false;

    this.SelectedSheetRow;

    this.Id = id;
    
    this.RowWiseReviewRowData = {};
}

// assign SelectionManager's method to this class
Review1DViewerInterface.prototype = Object.create(ReviewViewerInterface.prototype);
Review1DViewerInterface.prototype.constructor = Review1DViewerInterface;

Review1DViewerInterface.prototype.Is1DViewer = function () {
    return true;
}

Review1DViewerInterface.prototype.highlightComponent = function (viewerContainer,
    sheetName,
    CurrentReviewTableRowData,
    nodeIdString) {

    // unhighlight last selected component
    this.unHighlightComponent();

    if ((this.Id === "a" &&
        (!CurrentReviewTableRowData.SourceAId || CurrentReviewTableRowData.SourceAId == "")) ||
        (this.Id === "b" &&
            (!CurrentReviewTableRowData.SourceBId || CurrentReviewTableRowData.SourceBId == "")) ||
        (this.Id === "c" &&
            (!CurrentReviewTableRowData.SourceCId || CurrentReviewTableRowData.SourceCId == "")) ||
        (this.Id === "d" &&
            (!CurrentReviewTableRowData.SourceDId || CurrentReviewTableRowData.SourceDId == ""))) {

        return;
    }

    this.ShowSheetDataInViewer(viewerContainer,
        sheetName,
        CurrentReviewTableRowData,
        nodeIdString);
}

Review1DViewerInterface.prototype.GetSourceViewerData = function () {
    let reviewManager = model.getCurrentReviewManager();
    if (model.currentCheck === "comparison") {
        if (this.Id === "a") {
            return reviewManager.SourceAViewerData;
        }
        else if (this.Id === "b") {
            return reviewManager.SourceBViewerData;
        }
        else if (this.Id === "c") {
            return reviewManager.SourceCViewerData;
        }
        else if (this.Id === "d") {
            return reviewManager.SourceDViewerData;
        }
    }
    else if (model.currentCheck === "compliance") {
        return reviewManager.ViewerData;
    }

    return null;
}

Review1DViewerInterface.prototype.GetIdentifierProperties = function () {
    let sourceViewerData = this.GetSourceViewerData();
    if (sourceViewerData === null) {
        return;
    }
    let ext = xCheckStudio.Util.getFileExtension(sourceViewerData.source);
    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(ext);

    return identifierProperties;
}

Review1DViewerInterface.prototype.ShowSheetDataInViewer = function (viewerContainer,
    sheetName,
    CurrentReviewTableRowData) {
    let reviewManager  = model.getCurrentReviewManager();
    
    // get class wise components 
    // If component group is undefined, get its sheetName using mainclass and then get class wise components
    if (!sheetName ||
        sheetName.toLowerCase() === "undefined") {
        var component = reviewManager.GetCheckComponent(CurrentReviewTableRowData.groupId, CurrentReviewTableRowData.ID);
        sheetName =reviewManager.GetSheetName(component, viewerContainer);
    }

    var classWiseComponents = this.GetClasswiseComponentsBySheetName(sheetName, false);
    if (!classWiseComponents) {
        return;
    }

    // current sheet in viewer
    var currentlyLoadedSheet = this.GetCurrentSheetInViewer();

    //check if sheet is already loaded       
    if (sheetName === currentlyLoadedSheet) {

        this.HighlightRowInSheetData(CurrentReviewTableRowData, viewerContainer);
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

        // get identifier properties
        let identifierProperties = this.GetIdentifierProperties();
        if (identifierProperties === null ||
            !identifierProperties.name ||
            !identifierProperties.subClass) {
            return;
        }

        let column = {};
        let columnHeaders = [];

        let traversedColumns = [];
        for (var i = 0; i < componentProperties.length; i++) {
            var compProperty = componentProperties[i];

            let columnHeader = {};
            columnHeader["caption"] = compProperty['name'];
            columnHeader["dataField"] = compProperty['name'];
            var type;
            if (compProperty['format'].toLowerCase() === "string") {
                type = "string";
            }
            else if (compProperty['format'].toLowerCase() === "number") {
                type = "number";
            }
            else {
                continue;
            }
            columnHeader["dataType"] = type;
            columnHeader["width"] = "90";
            columnHeaders.push(columnHeader);

            //tag number is for instruments XLS data sheet           
            // if (Object.keys(column).length <= 3) {
            if (compProperty['name'] === identifierProperties.name) {
                column["Name"] = i;
            }
            // }

            traversedColumns.push(compProperty['name']);
        }

        let tableData = [];
        for (var componentId in classWiseComponents) {
            var component = classWiseComponents[componentId];

            tableRowContent = {};
            for (var i = 0; i < component.length; i++) {
                var compProperty = component[i];

                // get property value
                tableRowContent[compProperty['name']] = compProperty['value'];

                if(traversedColumns.indexOf(compProperty['name']) === -1)
                {
                    let columnHeader = {};
                    columnHeader["caption"] = compProperty['name'];
                    columnHeader["dataField"] = compProperty['name'];
                    var type;
                    if (compProperty['format'].toLowerCase() === "string") {
                        type = "string";
                    }
                    else if (compProperty['format'].toLowerCase() === "number") {
                        type = "number";
                    }
                    else {
                        continue;
                    }
                    columnHeader["dataType"] = type;
                    columnHeader["width"] = "90";

                    columnHeaders.push(columnHeader);
                    traversedColumns.push(compProperty['name']);
                }
            }

            tableData.push(tableRowContent);
        }

        this.CheckStatusArray = {};
        this.SelectedSheetRow = undefined;

        this.LoadSheetTableData(
            columnHeaders, 
            tableData, 
            "#" + viewerContainer, 
            CurrentReviewTableRowData, 
            column, 
            sheetName);

        // keep track of currently loaded sheet data
        this.ActiveSheetName = sheetName;
    }
};


Review1DViewerInterface.prototype.unHighlightComponent = function () {
    if (this.SelectedSheetRow) {
        this.unhighlightSelectedSheetRowInviewer(this.CheckStatusArray,
            this.SelectedSheetRow);
        this.SelectedSheetRow = null;
    }
}

Review1DViewerInterface.prototype.LoadSheetTableData = function (columnHeaders,
    tableData,
    viewerContainer,
    CurrentReviewTableRowData,
    column,
    sheetName) {

    var _this = this;

    this.Destroy(viewerContainer.replace("#", ""));

    // $(function () {

    $(viewerContainer).dxDataGrid({
        dataSource: tableData,
        columns: columnHeaders,
        showBorders: true,
        showRowLines: true,
        allowColumnResizing: true,
        height: "100%",
        width: "100%",
        hoverStateEnabled: true,
        filterRow: {
            visible: true
        },
        scrolling: {
            mode: "standard"
        },
        paging: { enabled: false },
        deferRendering: true,
        onContentReady: function (e) {
            this.SelectedSheetRow = undefined;
            _this.highlightSheetRowsFromCheckStatus(
                viewerContainer,
                CurrentReviewTableRowData,
                column,
                sheetName
            );
        },
        onRowClick: function (e) {
            _this.OnViewerRowClicked(e.rowElement[0], viewerContainer);
        }

    });
    // });
};

Review1DViewerInterface.prototype.highlightSheetRowsFromCheckStatus = function (
    viewerContainer,
    reviewTableRowData,
    column,
    sheetName) {
    if (!column['Name']) {
        return;
    }

    var selectedComponentName;
    if (this.Id === "a") {
        selectedComponentName = reviewTableRowData.SourceA;
    }
    else if (this.Id === "b") {
        selectedComponentName = reviewTableRowData.SourceB;
    }
    else if (this.Id === "c") {
        selectedComponentName = reviewTableRowData.SourceC;
    }
    else if (this.Id === "d") {
        selectedComponentName = reviewTableRowData.SourceD;
    }

    var checkGroup = model.getCurrentReviewManager().GetCheckGroup(reviewTableRowData.groupId);

    var dataGrid = $(viewerContainer).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();

    // get rowIndex vs status array
    var checkStatusArray = {};
    for (var componentId in checkGroup.components) {
        var currentReviewTableRowData = checkGroup.components[componentId];        

        var sourceComponentName;
        if (this.IsComparison) {
            if (this.Id === "a") {
                sourceComponentName = currentReviewTableRowData.sourceAName;
            }
            else if (this.Id === "b") {
                sourceComponentName = currentReviewTableRowData.sourceBName;
            }
            else if (this.Id === "c") {
                sourceComponentName = currentReviewTableRowData.sourceCName;
            }
            else if (this.Id === "d") {
                sourceComponentName = currentReviewTableRowData.sourceDName;
            }
        }
        else {
            sourceComponentName = currentReviewTableRowData.name;
        }

        if (!sourceComponentName ||
            sourceComponentName === "") {
            continue;
        }

        for (var i = 0; i < rows.length; i++) {
            var row = dataGrid.getRowElement(rows[i].rowIndex)[0];

            let componentName = row.cells[column['Name']].textContent;
            if (sourceComponentName === componentName) {
                // maintain rowwise review row data
                this.RowWiseReviewRowData[row.rowIndex] = currentReviewTableRowData;

                if (componentName === selectedComponentName) {
                    // highlight sheet data row
                    model.getCurrentSelectionManager().ApplyHighlightColor(row);
                    this.SelectedSheetRow = row;

                    // var id = viewerContainer.replace("#", "");
                    dataGrid.getScrollable().scrollTo({ top: row.offsetTop - row.offsetHeight });
                }
                else {

                    var color = model.getCurrentSelectionManager().GetRowHighlightColor(currentReviewTableRowData.status);
                    for (var j = 0; j < row.cells.length; j++) {
                        cell = row.cells[j];
                        cell.style.backgroundColor = color;
                    }
                }
                checkStatusArray[row.rowIndex] = currentReviewTableRowData.status;
                break;
            }
        }
    }

    this.CheckStatusArray = {};
    this.CheckStatusArray[sheetName] = checkStatusArray;
}

Review1DViewerInterface.prototype.ChangeComponentColorOnStatusChange =  function(checkComponent, srcId) {
    
}

Review1DViewerInterface.prototype.OnViewerRowClicked = function (row, viewerContainer) {

    if (this.SelectedSheetRow === row) {
        return;
    }

    // unhighlight last selected component
    this.unHighlightComponent();

    // highlight check result component row
    this.HighlightRowInMainReviewTable(row, viewerContainer);

    this.HighlightSheetDataRow(viewerContainer, row);
}

/* This method returns the corresponding comparison 
   check result row for selected sheet row*/
Review1DViewerInterface.prototype.GetCheckComponentRow = function (sheetDataRow, viewerContainer) {

    var dataGrid = $(viewerContainer).dxDataGrid("instance");
    var columnHeaders = dataGrid.getVisibleColumns();

    // get identifier properties
    let identifierProperties = this.GetIdentifierProperties();
    if (identifierProperties === null) {
        return;
    }

    var column = {};
    for (var i = 0; i < columnHeaders.length; i++) {
        var columnHeader = columnHeaders[i];
        //tag number is for instruments XLS data sheet
        if (columnHeader["caption"] === identifierProperties.name) {
            column["Name"] = i;
            break;
        }
    }
    if (!column["Name"]) {
        return;
    }

    let componentName = sheetDataRow.cells[column["Name"]].textContent;
   
    var checkTableIds = model.getCurrentReviewTable().CheckTableIds;
    //var componentsGroupName = sheetDataRow.cells[column.ComponentClass].textContent;
    // check if sheet row is in RowWiseReviewRowData. If it is not, 
    // then it is undefined component
    var componentsGroupName;
    if (sheetDataRow.rowIndex in this.RowWiseReviewRowData) {
        componentsGroupName = this.ActiveSheetName;
    }
    else {
        componentsGroupName = "Undefined";
    }

    // remove the special characters and whitespaces from componentgroup name
    // to have propert check in table ids
    let groupNameToSearch = xCheckStudio.Util.createValidHTMLId(componentsGroupName);

    var checkTableIdFound = false;
    var undefinedGroupId;
    for (var groupId in checkTableIds) {
        if (!checkTableIds[groupId].toLowerCase().includes(groupNameToSearch.toLowerCase())) {
            if(checkTableIds[groupId].toLowerCase().includes("undefined")) {
                undefinedGroupId = groupId;
            }
            continue;
        }

        checkTableIdFound = true;
        return this.GetRowAndExpandAccordion(groupId, componentsGroupName, componentName);
    }

    if(!checkTableIdFound && undefinedGroupId) {
        return this.GetRowAndExpandAccordion(undefinedGroupId, "Undefined", componentName);
    }

    return undefined;
}

Review1DViewerInterface.prototype.GetRowAndExpandAccordion = function(groupId, componentsGroupName, componentName) {
    var checkTableIds = model.getCurrentReviewTable().CheckTableIds;

    var categoryTable = document.getElementById(checkTableIds[groupId].replace('#', ''));

    var checkTableId = categoryTable.id;          
    var checkDataGrid = $("#" + checkTableId).dxDataGrid("instance");
    var rows = checkDataGrid.getVisibleRows();

    for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        var row = checkDataGrid.getRowElement(rows[rowIndex].rowIndex)[0];

        var name;
        if (this.IsComparison) {
            if (this.Id === "a") {
                name = row.cells[ComparisonColumns.SourceAName].textContent;
            }
            else if (this.Id === "b") {
                name = row.cells[ComparisonColumns.SourceBName].textContent;
            }
            else if (this.Id === "c") {
                name = row.cells[ComparisonColumns.SourceCName].textContent;
            }
            else if (this.Id === "d") {
                name = row.cells[ComparisonColumns.SourceDName].textContent;
            }
        }
        else {
            name = row.cells[ComplianceColumns.SourceName].textContent;
        }

        if (componentName === name) {
            //Expand Accordion and Scroll to Row
            model.getCurrentReviewTable().ExpandAccordionScrollToRow(row, componentsGroupName);
            
            return { "row": row, "tableId": "#" + checkTableId };
        }
    }
}

Review1DViewerInterface.prototype.HighlightRowInMainReviewTable = function (sheetDataRow,
    viewerContainer) {

    var reviewTableRowData = this.GetCheckComponentRow(sheetDataRow, viewerContainer);
    if (!reviewTableRowData) {
        return;
    }
    var reviewTableRow = reviewTableRowData["row"];
    var containerDiv = reviewTableRowData["tableId"];         

    var rowData;
    if (this.IsComparison) {
        rowData = this.GetComparisonCheckComponentData(reviewTableRow, containerDiv);
    }
    else {
        rowData = this.GetComplianceCheckComponentData(reviewTableRow, containerDiv);
    }

    this.HighlightMatchedComponent(containerDiv, rowData)
    model.getCurrentDetailedInfoTable().populateDetailedReviewTable(rowData, viewerContainer.replace("#", ""));
    
    model.getCurrentSelectionManager().MaintainHighlightedRow(reviewTableRow, containerDiv);

    var dataGrid = $(containerDiv).dxDataGrid("instance");
 
    // scroll to rowElement
    dataGrid.getScrollable().scrollTo({top: reviewTableRow.offsetTop - reviewTableRow.offsetHeight});

    // open property callout
    model.getCurrentReviewManager().OpenPropertyCallout(rowData);
}

Review1DViewerInterface.prototype.GetClasswiseComponentsBySheetName = function (sheetName, caseInsensitiveSearch) {
    var sheet = sheetName;

    if(caseInsensitiveSearch) {
        var keys = Object.keys(this.Components);
        for(var i = 0; i < keys.length; i++){
            if(keys[i].toLowerCase() == sheetName.toLowerCase()) {
                sheet = keys[i];
                break;
            }
        }
    }
    return this.Components[sheet];
}

Review1DViewerInterface.prototype.GetCurrentSheetInViewer = function () {

    return this.ActiveSheetName;
}

Review1DViewerInterface.prototype.unhighlightSelectedSheetRowInviewer = function (checkStatusArray,
    currentRow) {
   
    obj = Object.keys(checkStatusArray)
    if (obj.length === 0 || !(obj[0] in checkStatusArray)) {
        return;
    }

    var rowIndex = currentRow.rowIndex;
    var status = checkStatusArray[obj[0]][rowIndex]
    // if (status !== undefined) {
        model.getCurrentSelectionManager().ChangeBackgroundColor(currentRow, status);
    // }
    // else {
    //     color = "#fffff"
    //     for (var j = 0; j < currentRow.cells.length; j++) {
    //         cell = currentRow.cells[j];
    //         cell.style.backgroundColor = color;
    //     }
    // }
}

Review1DViewerInterface.prototype.HighlightRowInSheetData = function (currentReviewTableRowData, viewerContainer) {
    var selectedComponentName;
    if (this.Id === "a") {
        selectedComponentName = currentReviewTableRowData.SourceA;
    }
    else if (this.Id === "b") {
        selectedComponentName = currentReviewTableRowData.SourceB;
    }
    else if (this.Id === "c") {
        selectedComponentName = currentReviewTableRowData.SourceC;
    }
    else if (this.Id === "d") {
        selectedComponentName = currentReviewTableRowData.SourceD;
    }
    else {
        return;
    }

    //var checkGroup = model.getCurrentReviewManager().GetCheckGroup(reviewTableRowData.groupId);

    var dataGrid = $("#" + viewerContainer).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();

     // get identifier properties
     let identifierProperties = this.GetIdentifierProperties();
     if (identifierProperties === null) {
         return;
     }

    // var headers = dataGrid.getVisibleColumns();
    var columnHeaders = dataGrid.getVisibleColumns();
    var column = {};
    for (var i = 0; i < columnHeaders.length; i++) {
        var columnHeader = columnHeaders[i];
        //tag number is for instruments XLS data sheet
        if (columnHeader["caption"] === identifierProperties.name) {
            column["Name"] = i;
        }
    }
    if (!column["Name"]) {
        return;
    }

    for (var i = 0; i < rows.length; i++) {
        var row = dataGrid.getRowElement(rows[i].rowIndex)[0];

        var componentName = row.cells[column["Name"]].textContent;
        
        if (selectedComponentName === componentName) {
            if(this.SelectedSheetRow) {
                model.getCurrentSelectionManager().ChangeBackgroundColor(this.SelectedSheetRow, currentReviewTableRowData.Status);
            }
            this.HighlightSheetDataRow(viewerContainer, row);
            // scroll to rowElement
            dataGrid.getScrollable().scrollTo({top : row.offsetTop - row.offsetHeight});

            break;
        }
    }
}

Review1DViewerInterface.prototype.HighlightSheetDataRow = function (viewerContainer, row) { 
    this.SelectedSheetRow = row;

    model.getCurrentSelectionManager().ApplyHighlightColor(this.SelectedSheetRow);

    var containerId = viewerContainer;
    if(!viewerContainer.includes("#")) {
        containerId = "#" + viewerContainer;
    }
    $(containerId).dxDataGrid("instance").getScrollable().scrollTo({top: row.offsetTop - row.offsetHeight});
}

Review1DViewerInterface.prototype.Destroy = function (viewerContainer) {
  this.ActiveSheetName = undefined;
  var containerDiv = "#" + viewerContainer;
  var viewerContainerElement = document.getElementById(viewerContainer);
  var parent = viewerContainerElement.parentElement;

  $(containerDiv).remove();

  var viewerContainerDiv = document.createElement("div")
  viewerContainerDiv.id = viewerContainer;
  viewerContainerDiv.className = "tempContainer";

  parent.appendChild(viewerContainerDiv); 
}


