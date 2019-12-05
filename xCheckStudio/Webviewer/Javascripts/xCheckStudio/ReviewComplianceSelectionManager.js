function ReviewComplianceSelectionManager() {
    // call super constructor
    ReviewSelectionManager.call(this);    
}

// assign SelectionManager's method to this class
ReviewComplianceSelectionManager.prototype = Object.create(ReviewSelectionManager.prototype);
ReviewComplianceSelectionManager.prototype.constructor = ReviewComplianceSelectionManager;

ReviewComplianceSelectionManager.prototype.ApplyHighlightColor = function (row) {
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = SelectedRowColor;
    }
}

ReviewComplianceSelectionManager.prototype.RemoveHighlightColor = function (row) {
    var Color = this.GetRowHighlightColor(row.cells[ComplianceColumns.Status].innerHTML);
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = Color;
    }
}

ReviewComplianceSelectionManager.prototype.ChangeBackgroundColor =  function(row, status) {
    var color = this.GetRowHighlightColor(status);
    for(var cell = 0; cell < row.cells.length; cell++) {
        row.cells[cell].style.backgroundColor = color;
    }
}

ReviewComplianceSelectionManager.prototype.HandleCheckComponentSelectFormCheckBox = function (currentRow, tableId, checkBoxState) {

    var rowKey = this.GetSelectedRowKey(currentRow.rowIndex, tableId);

    if (checkBoxState == "on" &&
        !this.ComponentSelected(rowKey, tableId)) {
        // if check component is selected and and selected 
        // component row doesn't exist already


        // keep track of selected component row
        this.AddSelectedComponent({
            "rowKey" : rowKey,
            "tableId": tableId
        });
    }
    else if (this.ComponentSelected(rowKey, tableId)) {



        // remove current row from selected rows array
        this.RemoveSelectedComponent(rowKey, tableId);
    }
}

ReviewComplianceSelectionManager.prototype.MaintainHighlightedRow = function (currentReviewTableRow, tableId) {
    var highlightedRow = this.GetHighlightedRow();
    var rowElement;

    if (highlightedRow) {
        var dataGrid =  $(tableId).dxDataGrid("instance");
        var rowIndex = dataGrid.getRowIndexByKey(highlightedRow["rowKey"]);
        rowElement = dataGrid.getRowElement(rowIndex)[0];

        if(rowElement === currentReviewTableRow) {
            return;
        }
    }

    if (highlightedRow) {
        this.RemoveHighlightColor(rowElement);
    }

    this.ApplyHighlightColor(currentReviewTableRow);

    rowKey = this.GetSelectedRowKey(currentReviewTableRow.rowIndex, tableId);

    this.SetHighlightedRow({
        "rowKey": rowKey,
        "tableId": tableId
    });
}

ReviewComplianceSelectionManager.prototype.GetSelectedRowKey = function(rowIndex, tableId) {
    var dataGrid =  $(tableId).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();
    var rowData = rows[rowIndex];
    return rowData.key;
}

ReviewComplianceSelectionManager.prototype.MaintainHighlightedDetailedRow = function (currentDetailedTableRow) {
    if (this.HighlightedDetailedComponentRow === currentDetailedTableRow) {
        return;
    }

    if (this.HighlightedDetailedComponentRow) {
        var row = this.HighlightedDetailedComponentRow;
        var Color = this.GetRowHighlightColor(row.cells[CompliancePropertyColumns.Status].innerHTML);
        for (var j = 0; j < row.cells.length; j++) {
            cell = row.cells[j];
            cell.style.backgroundColor = Color;
        }
    }

    this.ApplyHighlightColor(currentDetailedTableRow);
    this.HighlightedDetailedComponentRow = currentDetailedTableRow;
}