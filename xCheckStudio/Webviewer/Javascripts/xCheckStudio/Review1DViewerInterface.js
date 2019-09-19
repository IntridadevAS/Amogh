function Review1DViewerInterface(id,
    components) {

    // call super constructor
    ReviewViewerInterface.call(this, null, null, null);
    this.ActiveSheetName;
   
    // this.SourceAComponents = sourceAComponents;
    // this.SourceBComponents = sourceBComponents;
    this.Components = components;

    this.CheckStatusArray = {};
    // this.checkStatusArrayA = {};
    // this.checkStatusArrayB = {};

    // this.CheckManager = checkManager;
    // if (model.getCurrentReviewManager().ComparisonCheckManager) {
    //     this.CheckManager = model.getCurrentReviewManager().ComparisonCheckManager
    // }
    // else {
    //     this.CheckManager = this.ReviewManager.ComplianceCheckManager
    // }

    this.IsComparison = model.getCurrentReviewType() === "comparison" ? true : false;
    // this.ComparisonManager;
    // this.ComplianceManager;
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

    // this.ComparisonManager = this.IsComparisonReviewManager();
    // this.ComplianceManager = this.IsComplianceReviewManager();
    // get class wise components                                                                                    
    var classWiseComponents = this.GetClasswiseComponentsBySheetName(sheetName);
    if (!classWiseComponents) {
        return;
    }

    // current sheet in viewer
    var currentlyLoadedSheet = this.GetCurrentSheetInViewer();

    //check if sheet is already loaded       
    if (sheetName === currentlyLoadedSheet) {
        // if (this.IsComparison &&
        //     CurrentReviewTableRowData.Status === "No Match") {

        //     if (CurrentReviewTableRowData.SourceA === "") {
        //         if (this.SelectedSheetRow) {
        //             this.unhighlightSelectedSheetRowInviewer(this.CheckStatusArray,
        //                 this.SelectedSheetRow);
        //         }

        //         return;
        //     }
        //     // else if (CurrentReviewTableRowData.SourceB === "") {

        //     //     if (this.SelectedComponentRowFromSheetB) {
        //     //         this.unhighlightSelectedSheetRowInviewer(this.CheckStatusArray,
        //     //             this.SelectedComponentRowFromSheetB);
        //     //     }

        //     //     return;
        //     // }
        // }

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

        // if (viewerContainer === Comparison.ViewerAContainer) {            
        this.CheckStatusArray = {};
        this.SelectedSheetRow = undefined;

        this.LoadSheetTableData(columnHeaders, tableData, "#" + viewerContainer, CurrentReviewTableRowData, column, sheetName);
        //this.HighlightRowInSheetData(CurrentReviewTableRowData, viewerContainer);

        // keep track of currently loaded sheet data
        this.ActiveSheetName = sheetName;
        // model.getCurrentReviewManager().SourceAViewerCurrentSheetLoaded = sheetName;
        // }
        // else if (viewerContainer === Comparison.ViewerBContainer) {
        //     this.checkStatusArrayB = {};
        //     this.SelectedComponentRowFromSheetB = undefined;

        //     this.LoadSheetTableData(columnHeaders, tableData, "#" + Comparison.ViewerBContainer, CurrentReviewTableRowData, column, sheetName);
        //     this.HighlightRowInSheetData(CurrentReviewTableRowData, Comparison.ViewerBContainer);

        //     // keep track of currently loaded sheet data
        //     this.ActiveSheetName = sheetName;
        //     // model.getCurrentReviewManager().SourceBViewerCurrentSheetLoaded = sheetName;
        // }
    }
};

Review1DViewerInterface.prototype.LoadSheetTableData = function (columnHeaders,
    tableData,
    viewerContainer,
    CurrentReviewTableRowData,
    column,
    sheetName) {

    var _this = this;    
    // if (viewerContainer === "#viewerContainer1" || viewerContainer === "#viewerContainer2") {
    // // $(function () {
    // if (_this.IsComparison) {
    //     height = "270px";
    // }
    // else {
    //     height = "450px";
    // }
    if ($(viewerContainer).data("igGrid")) {
        $(viewerContainer).igGrid("destroy");
    }

    $(viewerContainer).igGrid({
        width: "100%",
        height: "100%",
        columns: columnHeaders,
        autofitLastColumn: false,
        autoGenerateColumns: false,
        dataSource: tableData,
        responseDataKey: "results",
        fixedHeaders: true,
        autoCommit: true,
        rendered: function (evt, ui) {
            this.SelectedSheetRow = undefined;
            _this.highlightSheetRowsFromCheckStatus(viewerContainer, CurrentReviewTableRowData, column, sheetName);
        },
        features: [
            {
                name: "Selection",
                mode: 'row',
                multipleSelection: false,
                rowSelectionChanging: function (evt, ui) {
                    _this.OnViewerRowClicked(ui.row.element[0], viewerContainer);
                }
            },
        ]
    });

    // });

    
    //}

    // var container = document.getElementById(viewerContainer.replace("#", ""));
    // container.style.margin = "0px";
    // container.style.top = "0px"

};

Review1DViewerInterface.prototype.highlightSheetRowsFromCheckStatus = function (viewerContainer, 
    reviewTableRowData, 
    column, 
    sheetName) {
    // var reviewTableElement = reviewTableRow.parentElement;
    // var reviewTableRows = reviewTableElement.getElementsByTagName("tr");
    var selectedComponentName;
    if (this.Id === "a") {
        selectedComponentName = reviewTableRowData.SourceA;
    }
    else if (this.Id === "b") {
        selectedComponentName = reviewTableRowData.SourceB;
    }

    var checkGroup = model.getCurrentReviewManager().GetCheckGroup(reviewTableRowData.groupId);

    var rows = $(viewerContainer).igGrid("rows");

    // get rowIndex vs status array
    var checkStatusArray = {};
    for (var componentId in checkGroup.components) {
        var currentReviewTableRowData = checkGroup.components[componentId];

        var sourceComponentName;
        if (this.Id === "a") {
            sourceComponentName = currentReviewTableRowData.sourceAName;
        }
        else if (this.Id === "b") {
            sourceComponentName = currentReviewTableRowData.sourceBName;
        }

        if (!sourceComponentName ||
            sourceComponentName === "") {
            continue;
        }

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];

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

                    var id = viewerContainer.replace("#","");
                    var scrollTable =  document.getElementById(id+ "_table_scroll");
                    if (scrollTable) {
                        scrollTable.scrollTop = row.offsetTop - row.offsetHeight;
                    }                    
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

    // //////////////////////////////////////////////
    // var groupId = reviewTableRowData.groupId;
    // var checkGroup = this.CheckManager["CheckGroups"][groupId];
    // var checkGroupComponents = checkGroup.CheckComponents;

    // var id = viewerContainer.replace("#", "");
    // var currentSheetDataTable = document.getElementById(id);
    // // jsGridHeaderTableIndex = 0 
    // // jsGridTbodyTableIndex = 1
    // var currentSheetRows = currentSheetDataTable.children[0].getElementsByTagName("tr");

    // var checkStatusArray = {};
    // for (var componentId in checkGroupComponents) {
    //     var CurrentReviewTableRowData = checkGroupComponents[componentId];
    //     for (var j = 1; j < currentSheetRows.length; j++) {
    //         currentSheetRow = currentSheetRows[j];
    //         var componentName;
    //         if (column['Name'] !== undefined) {
    //             componentName = currentSheetRow.cells[column['Name']].innerText;
    //         }
    //         else if (column['Tagnumber'] !== undefined) {
    //             componentName = currentSheetRow.cells[column['Tagnumber']].innerText;
    //         }

    //         var sourceComponentNames = {
    //             SourceAName: CurrentReviewTableRowData.SourceAName,
    //             SourceBName: CurrentReviewTableRowData.SourceBName
    //         }

    //         if (sourceComponentNames.SourceAName !== "" && sourceComponentNames.SourceAName === componentName) {
    //             var color = model.getCurrentSelectionManager().GetRowHighlightColor(CurrentReviewTableRowData.Status);
    //             for (var j = 0; j < currentSheetRow.cells.length; j++) {
    //                 cell = currentSheetRow.cells[j];
    //                 cell.style.backgroundColor = color;
    //             }
    //             checkStatusArray[currentSheetRow.rowIndex] = CurrentReviewTableRowData.Status;
    //             break;
    //         }
    //         else if (sourceComponentNames.SourceBName !== "" && sourceComponentNames.SourceBName === componentName) {
    //             var color = model.getCurrentSelectionManager().GetRowHighlightColor(CurrentReviewTableRowData.Status);
    //             for (var j = 0; j < currentSheetRow.cells.length; j++) {
    //                 cell = currentSheetRow.cells[j];
    //                 cell.style.backgroundColor = color;
    //             }
    //             checkStatusArray[currentSheetRow.rowIndex] = CurrentReviewTableRowData.Status;
    //             break;
    //         }
    //     }
    // }

    // if (viewerContainer === "#viewerContainer1") {
    //     this.CheckStatusArray = {};
    //     this.CheckStatusArray[sheetName] = checkStatusArray;
    // }
    // else if (viewerContainer === "#viewerContainer2") {
    //     this.CheckStatusArray = {};
    //     this.CheckStatusArray[sheetName] = checkStatusArray;
    // }
}

Review1DViewerInterface.prototype.OnViewerRowClicked = function (row, viewerContainer) {

    if(this.SelectedSheetRow === row)
    {
        return;
    }

    // this.HighlightSheetDataRow(viewerContainer, row);

    // highlight check result component row
    this.HighlightRowInMainReviewTable(row, viewerContainer);

    this.HighlightSheetDataRow(viewerContainer, row);
    // ////////////////////////////////////////
    // if ((this.IsFirstViewer(viewerContainer) &&
    //     row === this.SelectedSheetRow) ||
    //     (this.IsSecondViewer(viewerContainer) &&
    //         row === this.SelectedComponentRowFromSheetB)) {
    //     return;
    // }

    // // highlight sheet data row
    // model.getCurrentSelectionManager().ApplyHighlightColor(row);

    // // highlight check result component row
    // this.HighlightRowInMainReviewTable(row, viewerContainer);
}

/* This method returns the corresponding comparison 
   check result row for selected sheet row*/
Review1DViewerInterface.prototype.GetCheckComponentRow = function (sheetDataRow, viewerContainer) {
    
    var headers = $(viewerContainer).igGrid("headersTable")[0];
    var columnHeaders = headers.getElementsByTagName("th");
    var column = {};
    for (var i = 0; i < columnHeaders.length; i++) {
        var columnHeader = columnHeaders[i];
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

    //var rows = $("#" + viewerContainer).igGrid("rows");

    var componentName;
    if (column.Name !== undefined) {
        componentName = sheetDataRow.cells[column.Name].innerText;
    }
    else if (column.Tagnumber !== undefined) {
        componentName = sheetDataRow.cells[column.Tagnumber].innerText;
    }

    var checkTableIds = model.checks[model.currentCheck]["reviewTable"].CheckTableIds;
    for (var groupId in checkTableIds) {
        var checkTableId = checkTableIds[groupId];

        var rows = $(checkTableId).igGrid("rows");

        for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            var row = rows[rowIndex];
            
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

            }

            if(componentName === name)
            {
                return row;
            }
        }
    }

//    ////////////////////////////////////////////
//     var containerId = viewerContainer.replace("#", "");
//     var viewerContainerData = document.getElementById(containerId)

//     if (!viewerContainerData) {
//         return undefined;
//     }

//     var containerChildren = viewerContainerData.children;
//     var columnHeaders = containerChildren[0].getElementsByTagName("th");
//     var column = {};
//     for (var i = 0; i < columnHeaders.length; i++) {
//         columnHeader = columnHeaders[i];
//         //tagnumber is for instruments XLS data sheet
//         if (columnHeader.innerText.trim() === "ComponentClass" ||
//             columnHeader.innerText.trim() === "Name" ||
//             columnHeader.innerText.trim() === "Description" ||
//             columnHeader.innerText.trim() === "Tagnumber") {
//             column[columnHeader.innerText.trim()] = i;
//         }
//         if (Object.keys(column).length === 3) {
//             break;
//         }
//     }

//     var reviewTableId;

//     if (this.IsComparison) {
//         reviewTableId = "ComparisonMainReviewCell";
//     }
//     else {
//         if (this.IsFirstViewer(viewerContainer)) {
//             reviewTableId = "SourceAComplianceMainReviewCell";
//         }
//         else {
//             reviewTableId = "SourceBComplianceMainReviewCell";
//         }
//     }

//     var reviewTableData = document.getElementById(reviewTableId);
//     var reviewTableRowsData = reviewTableData.getElementsByTagName("tr");

//     for (var i = 0; i < reviewTableRowsData.length; i++) {
//         reviewTableRow = reviewTableRowsData[i];
//         if (reviewTableRow.cells.length === 0) {
//             continue;
//         }

//         var componentName;
//         if (column.Name !== undefined) {
//             componentName = sheetDataRow.cells[column.Name].innerText;
//         }
//         else if (column.Tagnumber !== undefined) {
//             componentName = sheetDataRow.cells[column.Tagnumber].innerText;
//         }

//         if (this.IsComparison) {
//             if (componentName === reviewTableRow.cells[ComparisonColumns.SourceAName].innerText ||
//                 componentName === reviewTableRow.cells[ComparisonColumns.SourceBName].innerText) {
//                 var rowData = this.GetComparisonCheckComponentData(reviewTableRow);
//                 // var selectedComponentGroupId = reviewTableRow.cells[ComparisonColumns.GroupId].innerText
//                 this.highlightSheetRowsFromCheckStatus(viewerContainer, rowData, column, this.ActiveSheetName);
//                 return reviewTableRow;
//             }
//         }
//         else {
//             if (componentName === reviewTableRow.cells[ComplianceColumns.SourceName].innerText) {
//                 var rowData = this.GetComplianceCheckComponentData(reviewTableRow);
//                 this.highlightSheetRowsFromCheckStatus(viewerContainer, rowData, column, this.ActiveSheetName);
//                 return reviewTableRow;
//             }
//         }
//     }

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
    var containerDiv = reviewManager.GetReviewTableId(reviewTableRow);
    var rowData;
    if (this.IsComparison) {
        rowData = this.GetComparisonCheckComponentData(reviewTableRow);
    }
    else {
        rowData = this.GetComplianceCheckComponentData(reviewTableRow);
    }

    reviewManager.OnCheckComponentRowClicked(rowData, containerDiv);
    model.getCurrentSelectionManager().MaintainHighlightedRow(reviewTableRow);

    var reviewTable = reviewManager.GetReviewTable(reviewTableRow);
    model.getCurrentSelectionManager().ScrollToHighlightedCheckComponentRow(reviewTable, reviewTableRow, reviewManager.MainReviewTableContainer);
}

Review1DViewerInterface.prototype.GetClasswiseComponentsBySheetName = function (sheetName) {

    return this.Components[sheetName];
    // if (viewerContainer === Comparison.ViewerAContainer &&
    //     sheetName in this.SourceAComponents) {
    //     return this.SourceAComponents[sheetName];
    // }
    // else if (viewerContainer === Comparison.ViewerBContainer &&
    //     sheetName in this.SourceBComponents) {
    //     return this.SourceBComponents[sheetName];

    // }

    // return undefined;
}

Review1DViewerInterface.prototype.GetCurrentSheetInViewer = function () {

    return  this.ActiveSheetName;
    // var reviewManager = model.getCurrentReviewManager();
    // if (viewerContainer === Comparison.ViewerAContainer) {
    //     return reviewManager.SourceAViewerCurrentSheetLoaded;
    // }
    // else if (viewerContainer === Comparison.ViewerBContainer) {
    //     return reviewManager.SourceBViewerCurrentSheetLoaded;
    // }

    // return undefined;
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

    var rows = $("#" + viewerContainer).igGrid("rows");

    
    var headers = $("#" + viewerContainer).igGrid("headersTable")[0];
    var columnHeaders = headers.getElementsByTagName("th");
    var column = {};
    for (var i = 0; i < columnHeaders.length; i++) {
        var columnHeader = columnHeaders[i];
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

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];

        var componentName;
        if (column.Name !== undefined) {
            componentName = row.cells[column.Name].innerText;
        }
        else if (column.Tagnumber !== undefined) {
            componentName = row.cells[column.Tagnumber].innerText;
        }

        if (selectedComponentName === componentName) {
            this.HighlightSheetDataRow(viewerContainer, row);
        }
    }

    ///////////////////////////////////////////////////////
    // var containerId = viewerContainer.replace("#", "");
    // var viewerContainerData = document.getElementById(containerId);

    // if (viewerContainerData != undefined) {
    //     var containerChildren = viewerContainerData.children;
    //     // 0 index jsGrid header table
    //     var columnHeaders = containerChildren[0].getElementsByTagName("th");
    //     //1 index jsGrid table body
    //     var sheetDataTable = containerChildren[0];
    //     var sourceDataViewTableRows = sheetDataTable.getElementsByTagName("tr");
    //     var column = {};
    //     for (var i = 0; i < columnHeaders.length; i++) {
    //         columnHeader = columnHeaders[i];
    //         //tagnumber is for instruments XLS data sheet
    //         if (columnHeader.innerText.trim() === "ComponentClass" ||
    //             columnHeader.innerText.trim() === "Name" ||
    //             columnHeader.innerText.trim() === "Description" ||
    //             columnHeader.innerText.trim() === "Tagnumber") {
    //             column[columnHeader.innerText.trim()] = i;
    //         }
    //         if (Object.keys(column).length === 3) {
    //             break;
    //         }
    //     }
    //     for (var i = 0; i < sourceDataViewTableRows.length; i++) {
    //         currentRowInSourceTable = sourceDataViewTableRows[i];

    //         var componentName;
    //         if (column.Name !== undefined) {
    //             componentName = currentRowInSourceTable.cells[column.Name].innerText;
    //         }
    //         else if (column.Tagnumber !== undefined) {
    //             componentName = currentRowInSourceTable.cells[column.Tagnumber].innerText;
    //         }

    //         if (this.IsComparison) {
    //             if (CurrentReviewTableRowData.SourceA === componentName ||
    //                 CurrentReviewTableRowData.SourceB === componentName) {
    //                 this.HighlightSheetDataRow(containerId, currentRowInSourceTable, containerChildren)
    //                 break;
    //             }
    //         }
    //         else {
    //             if (CurrentReviewTableRowData.SourceName === componentName) {
    //                 this.HighlightComplianceViewerSheetDataRow(containerId, currentRowInSourceTable, containerChildren)
    //                 break;
    //             }
    //         }
    //     }
    // }
}

Review1DViewerInterface.prototype.HighlightSheetDataRow = function (viewerContainer, row) {
    // if (containerId === Comparison.ViewerAContainer) {
    if (this.SelectedSheetRow) {
        this.unhighlightSelectedSheetRowInviewer(this.CheckStatusArray,
            this.SelectedSheetRow);
    }

    this.SelectedSheetRow = row;

    model.getCurrentSelectionManager().ApplyHighlightColor(this.SelectedSheetRow);

    //var sheetDataTable1 = containerChildren[0];
    var scrollTable = document.getElementById(viewerContainer + "_table_scroll");
    if (scrollTable) {
        scrollTable.scrollTop = row.offsetTop - row.offsetHeight;
    }
       // sheetDataTable1.focus();
       // sheetDataTable1.parentNode.parentNode.scrollTop = row.offsetTop - row.offsetHeight;
    // }
    // if (containerId === Comparison.ViewerBContainer) {

    //     if (this.SelectedComponentRowFromSheetB) {
    //         this.unhighlightSelectedSheetRowInviewer(this.checkStatusArray, this.SelectedComponentRowFromSheetB);
    //     }

    //     this.SelectedComponentRowFromSheetB = currentRowInSourceTable;

    //     model.getCurrentSelectionManager().ApplyHighlightColor(this.SelectedComponentRowFromSheetB);

    //     var sheetDataTable2 = containerChildren[0];
    //     sheetDataTable2.focus();
    //     sheetDataTable2.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
    // }
}

// Review1DViewerInterface.prototype.HighlightComplianceViewerSheetDataRow = function (containerId, currentRowInSourceTable, containerChildren) {
//     if (containerId === Comparison.ViewerAContainer) {
//         if (this.SelectedSheetRow) {
//             this.unhighlightSelectedSheetRowInviewer(this.CheckStatusArray,
//                 this.SelectedSheetRow);
//         }
//         this.SelectedSheetRow = currentRowInSourceTable;
//         model.getCurrentSelectionManager().ApplyHighlightColor(this.SelectedSheetRow);
//     }
//     else if (containerId === Comparison.ViewerBContainer) {
//         if (this.SelectedComponentRowFromSheetB) {
//             this.unhighlightSelectedSheetRowInviewer(this.checkStatusArray,
//                 this.SelectedComponentRowFromSheetB);
//         }
//         this.SelectedComponentRowFromSheetB = currentRowInSourceTable;
//         model.getCurrentSelectionManager().ApplyHighlightColor(this.SelectedComponentRowFromSheetB);
//     }

//     var sheetDataTable = containerChildren[0];
//     sheetDataTable.focus();
//     sheetDataTable.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
// }

