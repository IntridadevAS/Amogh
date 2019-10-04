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
}

// assign SelectionManager's method to this class
Review1DViewerInterface.prototype = Object.create(ReviewViewerInterface.prototype);
Review1DViewerInterface.prototype.constructor = Review1DViewerInterface;

Review1DViewerInterface.prototype.Is1DViewer = function () {
    return true;
}

Review1DViewerInterface.prototype.IsFirstViewer = function (viewerContainer) {
    if (viewerContainer === "#compare1") {
        return true;
    }

    return false;
}
Review1DViewerInterface.prototype.IsSecondViewer = function (viewerContainer) {
    if (viewerContainer === "#compare2") {
        return true;
    }

    return false;
}

Review1DViewerInterface.prototype.FirstViewerExists = function () {
    if (document.getElementById("compare1").innerHTML !== "") {
        return true;
    }

    return false;
}

Review1DViewerInterface.prototype.ShowSheetDataInViewer = function (viewerContainer,
    sheetName,
    CurrentReviewTableRowData) {

    // get class wise components                                                                                    
    var classWiseComponents = this.GetClasswiseComponentsBySheetName(sheetName);
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

        var column = {};

        columnHeaders = [];

        for (var i = 0; i < componentProperties.length; i++) {
            var compProperty = componentProperties[i];

            columnHeader = {};

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



        this.CheckStatusArray = {};
        this.SelectedSheetRow = undefined;

        this.LoadSheetTableData(columnHeaders, tableData, "#" + viewerContainer, CurrentReviewTableRowData, column, sheetName);


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

    $(function () {

        $(viewerContainer).dxDataGrid({
            dataSource: tableData,
            columns: columnHeaders,
            showBorders: true,
            showRowLines: true,
            allowColumnResizing : true,
            height: "100%",
            width: "100%",
            filterRow: {
                visible: true
            },
            scrolling: {
                mode: "standard"
            },
            paging: { enabled: false },
            onContentReady: function(e) {
                this.SelectedSheetRow = undefined;
                _this.highlightSheetRowsFromCheckStatus(viewerContainer, CurrentReviewTableRowData, column, sheetName);
            },
            onRowClick: function(e) {
                _this.OnViewerRowClicked(e.rowElement[0], viewerContainer);
            }

        });
    });

    // $(viewerContainer).igGrid({
    //     width: "100%",
    //     height: "100%",
    //     columns: columnHeaders,
    //     autofitLastColumn: false,
    //     autoGenerateColumns: false,
    //     dataSource: tableData,
    //     responseDataKey: "results",
    //     fixedHeaders: true,
    //     autoCommit: true,
    //     rendered: function (evt, ui) {
    //         this.SelectedSheetRow = undefined;
    //         _this.highlightSheetRowsFromCheckStatus(viewerContainer, CurrentReviewTableRowData, column, sheetName);
    //     },
    //     features: [
    //         {
    //             name: "Selection",
    //             mode: 'row',
    //             multipleSelection: false,
    //             rowSelectionChanging: function (evt, ui) {
    //                 _this.OnViewerRowClicked(ui.row.element[0], viewerContainer);
    //             }
    //         },
    //     ]
    // });

};

Review1DViewerInterface.prototype.highlightSheetRowsFromCheckStatus = function (viewerContainer,
    reviewTableRowData,
    column,
    sheetName) {

    var selectedComponentName;
    if (this.Id === "a") {
        selectedComponentName = reviewTableRowData.SourceA;
    }
    else if (this.Id === "b") {
        selectedComponentName = reviewTableRowData.SourceB;
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

            var componentName;
            if (column['Name'] !== undefined) {
                componentName = row.cells[column['Name']].innerText;
            }
            else if (column['Tagnumber'] !== undefined) {
                componentName = row.cells[column['Tagnumber']].innerText;
            }

            if (sourceComponentName === componentName) {

                if (componentName === selectedComponentName) {
                    // highlight sheet data row
                    model.getCurrentSelectionManager().ApplyHighlightColor(row);
                    this.SelectedSheetRow = row;

                    // var id = viewerContainer.replace("#", "");
                    dataGrid.getScrollable().scrollTo(row.offsetTop - row.offsetHeight);
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

Review1DViewerInterface.prototype.OnViewerRowClicked = function (row, viewerContainer) {

    if (this.SelectedSheetRow === row) {
        return;
    }

    // highlight check result component row
    this.HighlightRowInMainReviewTable(row, viewerContainer);

    this.HighlightSheetDataRow(viewerContainer, row);
}

/* This method returns the corresponding comparison 
   check result row for selected sheet row*/
Review1DViewerInterface.prototype.GetCheckComponentRow = function (sheetDataRow, viewerContainer) {

    var dataGrid = $(viewerContainer).dxDataGrid("instance");
    var columnHeaders = dataGrid.getVisibleColumns();
    var column = {};
    for (var i = 0; i < columnHeaders.length; i++) {
        var columnHeader = columnHeaders[i];
        //tagnumber is for instruments XLS data sheet
        if (columnHeader["caption"] === "ComponentClass" ||
            columnHeader["caption"] === "Name" ||
            columnHeader["caption"] === "Description" ||
            columnHeader["caption"] === "Tagnumber") {
            column[columnHeader["caption"]] = i;
        }
        if (Object.keys(column).length === 3) {
            break;
        }
    }

    //var rows = $("#" + viewerContainer).igGrid("rows");

    var componentName;
    if (column.Name !== undefined) {
        componentName = sheetDataRow.cells[column.Name].innerText;
    }
    else if (column.Tagnumber !== undefined) {
        componentName = sheetDataRow.cells[column.Tagnumber].innerText;
    }

    var checkTableIds = model.checks[model.currentCheck]["reviewTable"].CheckTableIds;
    // for (var groupId in checkTableIds) {
        var checkTableId = model.checks[model.currentCheck]["reviewTable"].CurrentTableId;
        var checkDataGrid = $("#" + checkTableId).dxDataGrid("instance");
        var rows = checkDataGrid.getVisibleRows();

        for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            var row = checkDataGrid.getRowElement(rows[rowIndex].rowIndex)[0];

            var name;
            if (this.IsComparison) {
                if (this.Id === "a") {
                    name = row.cells[ComparisonColumns.SourceAName].innerText;
                }
                else if (this.Id === "b") {
                    name = row.cells[ComparisonColumns.SourceBName].innerText;
                }
            }
            else {
                name = row.cells[ComplianceColumns.SourceName].innerText;
            }

            if (componentName === name) {
                return row;
            }
        }
    // }
    return undefined;
}

Review1DViewerInterface.prototype.HighlightRowInMainReviewTable = function (sheetDataRow,
    viewerContainer) {

    var reviewTableRow = this.GetCheckComponentRow(sheetDataRow, viewerContainer);
    if (!reviewTableRow) {
        return;
    }

    var reviewManager = model.getCurrentReviewManager();

    // component group id which is container div for check components table of given row
    // var containerDiv = reviewManager.GetReviewTableId(reviewTableRow);
    var containerDiv = model.checks[model.currentCheck]["reviewTable"].CurrentTableId;

    var rowData;
    if (this.IsComparison) {
        rowData = this.GetComparisonCheckComponentData(reviewTableRow);
    }
    else {
        rowData = this.GetComplianceCheckComponentData(reviewTableRow);
    }

    // reviewManager.OnCheckComponentRowClicked(rowData, containerDiv);
    this.HighlightMatchedComponent(containerDiv, rowData)
    model.checks[model.currentCheck]["detailedInfoTable"].populateDetailedReviewTable(rowData);
    
    model.getCurrentSelectionManager().MaintainHighlightedRow(reviewTableRow);

    var dataGrid = $("#" + containerDiv).dxDataGrid("instance");

    // var rowElement = dataGrid.getRowElement(reviewTableRow.rowIndex)
    // scroll to rowElement
    dataGrid.getScrollable().scrollTo(reviewTableRow.offsetTop - reviewTableRow.offsetHeight);
}

Review1DViewerInterface.prototype.GetClasswiseComponentsBySheetName = function (sheetName) {

    return this.Components[sheetName];
}

Review1DViewerInterface.prototype.GetCurrentSheetInViewer = function () {

    return this.ActiveSheetName;
}

Review1DViewerInterface.prototype.unhighlightSelectedSheetRowInviewer = function (checkStatusArray,
    currentRow) {
    var rowIndex = currentRow.rowIndex;
    obj = Object.keys(checkStatusArray)
    var status = checkStatusArray[obj[0]][rowIndex]
    if (status !== undefined) {
        model.getCurrentSelectionManager().ChangeBackgroundColor(currentRow, status);
    }
    else {
        color = "#fffff"
        for (var j = 0; j < currentRow.cells.length; j++) {
            cell = currentRow.cells[j];
            cell.style.backgroundColor = color;
        }
    }
}

Review1DViewerInterface.prototype.HighlightRowInSheetData = function (currentReviewTableRowData, viewerContainer) {
    var selectedComponentName;
    if (this.Id === "a") {
        selectedComponentName = currentReviewTableRowData.SourceA;
    }
    else if (this.Id === "b") {
        selectedComponentName = currentReviewTableRowData.SourceB;
    }

    //var checkGroup = model.getCurrentReviewManager().GetCheckGroup(reviewTableRowData.groupId);

    var dataGrid = $("#" + viewerContainer).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();

    // var headers = dataGrid.getVisibleColumns();
    var columnHeaders = dataGrid.getVisibleColumns();
    var column = {};
    for (var i = 0; i < columnHeaders.length; i++) {
        var columnHeader = columnHeaders[i];
        //tagnumber is for instruments XLS data sheet
        if (columnHeader["caption"] === "ComponentClass" ||
            columnHeader["caption"] === "Name" ||
            columnHeader["caption"] === "Description" ||
            columnHeader["caption"] === "Tagnumber") {
            column[columnHeader["caption"]] = i;
        }
        if (Object.keys(column).length === 3) {
            break;
        }
    }

    for (var i = 0; i < rows.length; i++) {
        var row = dataGrid.getRowElement(rows[i].rowIndex)[0];

        var componentName;
        if (column.Name !== undefined) {
            componentName = row.cells[column.Name].innerText;
        }
        else if (column.Tagnumber !== undefined) {
            componentName = row.cells[column.Tagnumber].innerText;
        }

        if (selectedComponentName === componentName) {
            this.HighlightSheetDataRow(viewerContainer, row);
            // scroll to rowElement
            dataGrid.getScrollable().scrollTo(row.offsetTop - row.offsetHeight);
        }
    }
}

Review1DViewerInterface.prototype.HighlightSheetDataRow = function (viewerContainer, row) {
    // if (containerId === Comparison.ViewerAContainer) {
    if (this.SelectedSheetRow) {
        this.unhighlightSelectedSheetRowInviewer(this.CheckStatusArray,
            this.SelectedSheetRow);
    }

    this.SelectedSheetRow = row;

    model.getCurrentSelectionManager().ApplyHighlightColor(this.SelectedSheetRow);

    var containerId = viewerContainer;
    if(!viewerContainer.includes("#")) {
        containerId = "#" + viewerContainer;
    }
    $(containerId).dxDataGrid("instance").getScrollable().scrollTo(row.offsetTop - row.offsetHeight);
    //var sheetDataTable1 = containerChildren[0];
    // var scrollTable = document.getElementById(viewerContainer + "_table_scroll");
    // if (scrollTable) {
    //     scrollTable.scrollTop = row.offsetTop - row.offsetHeight;
    // }
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


