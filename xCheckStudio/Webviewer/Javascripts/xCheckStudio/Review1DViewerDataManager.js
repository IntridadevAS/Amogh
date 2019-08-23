function Review1DViewerDataManager(reviewManager) {
    this.ReviewManager = reviewManager;
    this.ActiveSheetName = "";
}

/* This method is called when the check result row is clicked in table. This 
function loads the sheet data in viewer for selected component result.
Inputs :
     viewerContainer = container id in which the sheet data is to be loaded,
     sheetName = sheet name to load,
     CurrentReviewTableRow = current selected comparison result row 
*/
Review1DViewerDataManager.prototype.LoadSelectedSheetDataInViewer = function (viewerContainer,
    sheetName,
    CurrentReviewTableRowData) {

    this.ActiveSheetName = sheetName;
    // get class wise components                                                                                    
    var classWiseComponents = this.GetClasswiseComponentsBySheetName(viewerContainer, sheetName);
    if (!classWiseComponents) {
        return;
    }

    // current sheet in viewer
    var currentlyLoadedSheet = this.GetCurrentSheetInViewer(viewerContainer);

    //check if sheet is already loaded       
    if (sheetName === currentlyLoadedSheet) {
        if (CurrentReviewTableRowData.status === "No Match") {
            if (viewerContainer === "viewerContainer1" &&
            CurrentReviewTableRowData.SourceAName === "") {
                if (this.ReviewManager.SelectedComponentRowFromSheetA) {
                    this.unhighlightSelectedSheetRowInviewer(this.ReviewManager.checkStatusArrayA,
                        this.ReviewManager.SelectedComponentRowFromSheetA);
                }

                return;
            }
            else if (viewerContainer === "viewerContainer2" &&
            CurrentReviewTableRowData.SourceBName === "") {

                if (this.ReviewManager.SelectedComponentRowFromSheetB) {
                    this.unhighlightSelectedSheetRowInviewer(this.ReviewManager.checkStatusArrayB, 
                        this.ReviewManager.SelectedComponentRowFromSheetB);
                }

                return;
            }
        }

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

            columnHeader["headerText"] = compProperty['name'];
            columnHeader["key"] = compProperty['name'];
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


        // if (CurrentReviewTableRow.tagName.toLowerCase() !== "tr") {
        //     return;
        // }

        if (viewerContainer === "viewerContainer1") {
            this.ReviewManager.checkStatusArrayA = {};
            this.ReviewManager.SelectedComponentRowFromSheetA = undefined;

            this.LoadSheetTableData(columnHeaders, tableData, "#viewerContainer1", CurrentReviewTableRowData, column, sheetName);
            this.HighlightRowInSheetData(CurrentReviewTableRowData, "viewerContainer1");

            // keep track of currently loaded sheet data
            this.ReviewManager.SourceAViewerCurrentSheetLoaded = sheetName;
        }
        else if (viewerContainer === "viewerContainer2") {
            this.ReviewManager.checkStatusArrayB = {};
            this.ReviewManager.SelectedComponentRowFromSheetB = undefined;

            this.LoadSheetTableData(columnHeaders, tableData, "#viewerContainer2", CurrentReviewTableRowData, column, sheetName);
            this.HighlightRowInSheetData(CurrentReviewTableRowData, "viewerContainer2");

            // keep track of currently loaded sheet data
            this.ReviewManager.SourceBViewerCurrentSheetLoaded = sheetName;
        }
    }
};

Review1DViewerDataManager.prototype.LoadSheetTableData = function (columnHeaders,
    tableData,
    viewerContainer,
    CurrentReviewTableRowData,
    column,
    sheetName) {

    var _this = this;
    if (viewerContainer === "#viewerContainer1" || viewerContainer === "#viewerContainer2") {
        $(function () {

            // var width = "550px";
            // var height = "270px";
            var table = JSON.stringify(tableData);
            // var modal = document.getElementById('maximizeViewerContainer');
            // if (modal.style.display === "block") {
            //     width = "745px";
            //     height = "370px";
            // }

            $(viewerContainer).igGrid({
                columns: columnHeaders,
                autofitLastColumn: false,
                autoGenerateColumns: false,
                dataSource : table,
                dataSourceType: "json",
                responseDataKey: "results",
                autoCommit: true,
                features: [
                    {
                        name: "Selection",
                        mode: 'row',
                        multipleSelection: false,
                        rowSelectionChanging : function(evt, ui) {
                            _this.OnViewerRowClicked(ui.row.element[0], viewerContainer);
                        }
                    },
                ]
            });

        });

        _this.highlightSheetRowsFromCheckStatus(viewerContainer, CurrentReviewTableRowData, column, sheetName);
    }

    var container = document.getElementById(viewerContainer.replace("#", ""));
    // container.style.width = "550px"
    // container.style.height = "270px"
    container.style.overflowX = "scroll";
    container.style.overflowY = "scroll";
    container.style.margin = "0px";
    container.style.top = "0px"

};

Review1DViewerDataManager.prototype.highlightSheetRowsFromCheckStatus = function (viewerContainer, reviewTableRowData, column, sheetName) {
    // var reviewTableElement = reviewTableRow.parentElement;
    // var reviewTableRows = reviewTableElement.getElementsByTagName("tr");

    var groupId = reviewTableRowData.GroupId;
    var checkGroup = this.ReviewManager.ComparisonCheckManager["CheckGroups"][groupId];
    var checkGroupComponents = checkGroup.CheckComponents;

    var id = viewerContainer.replace("#", "");
    var currentSheetDataTable = document.getElementById(id);
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var currentSheetRows = currentSheetDataTable.children[0].getElementsByTagName("tr");

    var checkStatusArray = {};
    for (var componentId in checkGroupComponents)
    {
        var CurrentReviewTableRowData = checkGroupComponents[componentId];
        for (var j = 1; j < currentSheetRows.length; j++) {
            currentSheetRow = currentSheetRows[j];
            var componentName;
            if (column['Name'] !== undefined) {
                componentName = currentSheetRow.cells[column['Name']].innerText;
            }
            else if (column['Tagnumber'] !== undefined) {
                componentName = currentSheetRow.cells[column['Tagnumber']].innerText;
            }

            var sourceComponentNames = {
                SourceAName: CurrentReviewTableRowData.SourceAName,
                SourceBName: CurrentReviewTableRowData.SourceBName
            }

            if (sourceComponentNames.SourceAName !== "" && sourceComponentNames.SourceAName === componentName) {
                var color = this.ReviewManager.SelectionManager.GetRowHighlightColor(CurrentReviewTableRowData.Status);
                for (var j = 0; j < currentSheetRow.cells.length; j++) {
                    cell = currentSheetRow.cells[j];
                    cell.style.backgroundColor = color;
                }
                checkStatusArray[currentSheetRow.rowIndex] = CurrentReviewTableRowData.Status;
                break;
            }
            else if (sourceComponentNames.SourceBName !== "" && sourceComponentNames.SourceBName === componentName) {
                var color = this.ReviewManager.SelectionManager.GetRowHighlightColor(CurrentReviewTableRowData.Status);
                for (var j = 0; j < currentSheetRow.cells.length; j++) {
                    cell = currentSheetRow.cells[j];
                    cell.style.backgroundColor = color;
                }
                checkStatusArray[currentSheetRow.rowIndex] = CurrentReviewTableRowData.Status;
                break;
            }
        }
    }

    if (viewerContainer === "#viewerContainer1") {
        this.ReviewManager.checkStatusArrayA = {};
        this.ReviewManager.checkStatusArrayA[sheetName] = checkStatusArray;
    }
    else if (viewerContainer === "#viewerContainer2") {
        this.ReviewManager.checkStatusArrayB = {};
        this.ReviewManager.checkStatusArrayB[sheetName] = checkStatusArray;
    }
}

Review1DViewerDataManager.prototype.OnViewerRowClicked = function (row, viewerContainer) {

    if ((this.ReviewManager.IsFirstViewer(viewerContainer) &&
        row === this.ReviewManager.SelectedComponentRowFromSheetA) ||
        (this.ReviewManager.IsSecondViewer(viewerContainer) &&
            row === this.ReviewManager.SelectedComponentRowFromSheetB)) {
        return;
    }

    // highlight sheet data row
    this.ReviewManager.SelectionManager.ApplyHighlightColor(row);

    // highlight check result component row
    this.HighlightRowInMainReviewTable(row, viewerContainer);

    // highlight corresponding component data in another viewer
    if (this.ReviewManager.IsFirstViewer(viewerContainer)) {

        if (this.ReviewManager.SecondViewerExists() &&
            this.ReviewManager.SourceBComponentExists(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow)) {
            if (this.SourceBComponents !== undefined) {
                this.HighlightRowInSheetData(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow, "viewerContainer2");
            }
            else if (this.SourceBViewerData !== undefined) {
                this.HighlightComponentInGraphicsViewer(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow)
            }
        }

        //for "no match" case unhighlight component 
        if (!this.ReviewManager.SourceBComponentExists(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow)) {

            if (this.ReviewManager.SourceBReviewViewerInterface) {
                this.ReviewManager.SourceBReviewViewerInterface.unHighlightComponent();
            }
            if (this.ReviewManager.SelectedComponentRowFromSheetB) {
                this.unhighlightSelectedSheetRowInviewer(this.ReviewManager.checkStatusArrayB, this.ReviewManager.SelectedComponentRowFromSheetB)
            }

        }
    }
    else if (this.ReviewManager.IsSecondViewer(viewerContainer)) {
        if (this.ReviewManager.FirstViewerExists() &&
            this.ReviewManager.SourceAComponentExists(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow)) {

            if (this.SourceAComponents !== undefined) {
                this.HighlightRowInSheetData(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow, "viewerContainer1");
            }
            else if (this.SourceAViewerData !== undefined) {
                this.HighlightComponentInGraphicsViewer(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow)
            }
        }
        //for "no match" case unhighlight component 
        if (!this.ReviewManager.SourceAComponentExists(this.ReviewManager.SelectionManager.HighlightedCheckComponentRow)) {
            if (this.ReviewManager.SourceAReviewViewerInterface) {
                this.ReviewManager.SourceAReviewViewerInterface.unHighlightComponent();
            }

            if (this.ReviewManager.SelectionManager.HighlightedCheckComponentRow) {
                this.unhighlightSelectedSheetRowInviewer(this.ReviewManager.checkStatusArrayA, this.ReviewManager.SelectedComponentRowFromSheetA)
            }
        }

    }
}

/* This method returns the corresponding comparison 
   check result row for selected sheet row*/
Review1DViewerDataManager.prototype.GetCheckComponentForSheetRow = function (sheetDataRow, viewerContainer) {
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
        if (columnHeader.innerText.trim() === "ComponentClass" ||
            columnHeader.innerText.trim() === "Name" ||
            columnHeader.innerText.trim() === "Description" ||
            columnHeader.innerText.trim() === "Tagnumber") {
            column[columnHeader.innerText.trim()] = i;
        }
        if (Object.keys(column).length === 3) {
            break;
        }
    }

    var reviewTableId = "ComparisonMainReviewCell";
    var reviewTableData = document.getElementById(reviewTableId);
    var reviewTableRowsData = reviewTableData.getElementsByTagName("tr");

    // $(function () {
    //     reviewTableRowsData = $(reviewTableId).igGrid("rows");
    // });

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
            var rowData = this.GetCheckComponentData(reviewTableRow);
            // var selectedComponentGroupId = reviewTableRow.cells[ComparisonColumns.GroupId].innerText
            this.highlightSheetRowsFromCheckStatus(viewerContainer, rowData, column, this.ActiveSheetName);
            return reviewTableRow;
        }
    }

    return undefined;
}

Review1DViewerDataManager.prototype.GetCheckComponentData = function(reviewTableRow) {
    var _this = this;
    var SourceA = reviewTableRow.cells[ComparisonColumns.SourceAName].innerText;
    var SourceB = reviewTableRow.cells[ComparisonColumns.SourceBName].innerText;
    var rowData = {};
    var ContainerDiv = this.ReviewManager.GetReviewTableId(reviewTableRow);
    $(function () {
        var data = $("#" + ContainerDiv).data("igGrid").dataSource.dataView();
        for (var id in data)
        {
            if(data[id].SourceA.trim() == SourceA.trim() && 
            data[id].SourceB.trim() == SourceB.trim())
            {        
                rowData['Status'] = data[id].Status;
                rowData['SourceBName'] = data[id].SourceB;
                rowData['SourceAName'] = data[id].SourceA;
                rowData['ResultId'] = data[id].ID;
                rowData['GroupId'] = data[id].groupId;
                rowData['SourceANodeId'] = data[id].SourceANodeId;
                rowData['SourceBNodeId'] = data[id].SourceBNodeId;
                break;
            }
        }
    });
    return rowData;
}

Review1DViewerDataManager.prototype.HighlightRowInMainReviewTable = function (sheetDataRow,
    viewerContainer) {

    var reviewTableRow = this.GetCheckComponentForSheetRow(sheetDataRow, viewerContainer);
    if (!reviewTableRow) {
        return;
    }

    // component group id which is container div for check components table of given row
    var containerDiv = this.ReviewManager.GetReviewTableId(reviewTableRow);
    var rowData = this.GetCheckComponentData(reviewTableRow);
    this.ReviewManager.OnCheckComponentRowClicked(rowData, containerDiv);
    this.ReviewManager.SelectionManager.MaintainHighlightedRow(reviewTableRow);

    var reviewTable = this.ReviewManager.GetReviewTable(reviewTableRow);
    this.ReviewManager.SelectionManager.ScrollToHighlightedCheckComponentRow(reviewTable, reviewTableRow, this.MainReviewTableContainer);
}

Review1DViewerDataManager.prototype.GetClasswiseComponentsBySheetName = function (viewerContainer, sheetName) {

    if (viewerContainer === "viewerContainer1" &&
        sheetName in this.ReviewManager.SourceAComponents) {
        return this.ReviewManager.SourceAComponents[sheetName];
    }
    else if (viewerContainer === "viewerContainer2" &&
        sheetName in this.ReviewManager.SourceBComponents) {
        return this.ReviewManager.SourceBComponents[sheetName];

    }

    return undefined;
}

Review1DViewerDataManager.prototype.GetCurrentSheetInViewer = function (viewerContainer) {

    if (viewerContainer === "viewerContainer1") {
        return this.ReviewManager.SourceAViewerCurrentSheetLoaded;
    }
    else if (viewerContainer === "viewerContainer2") {
        return this.ReviewManager.SourceBViewerCurrentSheetLoaded;
    }

    return undefined;
}

Review1DViewerDataManager.prototype.unhighlightSelectedSheetRowInviewer = function (checkStatusArray,
    currentRow) {
    var rowIndex = currentRow.rowIndex;
    obj = Object.keys(checkStatusArray)
    var status = checkStatusArray[obj[0]][rowIndex]
    if (status !== undefined) {
        this.ReviewManager.SelectionManager.ChangeBackgroundColor(currentRow, status);
    }
    else {
        color = "#fffff"
        for (var j = 0; j < currentRow.cells.length; j++) {
            cell = currentRow.cells[j];
            cell.style.backgroundColor = color;
        }
    }
}

Review1DViewerDataManager.prototype.HighlightRowInSheetData = function (CurrentReviewTableRowData, viewerContainer) {
    var containerId = viewerContainer.replace("#", "");
    var viewerContainerData = document.getElementById(containerId);

    if (viewerContainerData != undefined) {
        var containerChildren = viewerContainerData.children;
        // 0 index jsGrid header table
        var columnHeaders = containerChildren[0].getElementsByTagName("th");
        //1 index jsGrid table body
        var sheetDataTable = containerChildren[0].getElementsByTagName("table")[0];
        var sourceDataViewTableRows = sheetDataTable.getElementsByTagName("tr");
        var column = {};
        for (var i = 0; i < columnHeaders.length; i++) {
            columnHeader = columnHeaders[i];
            //tagnumber is for instruments XLS data sheet
            if (columnHeader.innerText.trim() === "ComponentClass" ||
                columnHeader.innerText.trim() === "Name" ||
                columnHeader.innerText.trim() === "Description" ||
                columnHeader.innerText.trim() === "Tagnumber") {
                column[columnHeader.innerText.trim()] = i;
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
            if (CurrentReviewTableRowData.SourceAName === componentName ||
                CurrentReviewTableRowData.SourceBName === componentName) {
                if (containerId === "viewerContainer1") {
                    if (this.ReviewManager.SelectedComponentRowFromSheetA) {
                        this.ReviewManager.unhighlightSelectedSheetRowInviewer(this.ReviewManager.checkStatusArrayA, 
                            this.ReviewManager.SelectedComponentRowFromSheetA);
                    }

                    this.ReviewManager.SelectedComponentRowFromSheetA = currentRowInSourceTable;

                    this.ReviewManager.SelectionManager.ApplyHighlightColor(this.ReviewManager.SelectedComponentRowFromSheetA);

                    var sheetDataTable1 = containerChildren[0].getElementsByTagName("table")[0];
                    sheetDataTable1.focus();
                    sheetDataTable1.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
                }
                if (containerId === "viewerContainer2") {

                    if (this.ReviewManager.SelectedComponentRowFromSheetB) {
                        this.unhighlightSelectedSheetRowInviewer(this.ReviewManager.checkStatusArrayB, this.ReviewManager.SelectedComponentRowFromSheetB);
                    }

                    this.ReviewManager.SelectedComponentRowFromSheetB = currentRowInSourceTable;

                    this.ReviewManager.SelectionManager.ApplyHighlightColor(this.ReviewManager.SelectedComponentRowFromSheetB);

                    var sheetDataTable2 = containerChildren[0].getElementsByTagName("table")[0];
                    sheetDataTable2.focus();
                    sheetDataTable2.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
                }

                break;
            }
        }
    }
}