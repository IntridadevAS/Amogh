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

    if (checkBoxState == "on" &&
        !this.ComponentSelected(currentRow.rowIndex, tableId)) {
        // if check component is selected and and selected 
        // component row doesn't exist already

        // highlight selected row
        this.ApplyHighlightColor(currentRow["row"]);

        // keep track of selected component row
        this.AddSelectedComponent({
            "row": currentRow,
            "rowIndex": currentRow.rowIndex,
            "tableId": tableId
        });
    }
    else if (this.ComponentSelected(currentRow.rowIndex, tableId)) {

        // restore color
        this.RemoveHighlightColor(currentRow["row"]);

        // remove current row from selected rows array
        this.RemoveSelectedComponent(currentRow.rowIndex, tableId);
    }
}

ReviewComplianceSelectionManager.prototype.MaintainHighlightedRow = function (currentReviewTableRow, tableId) {
    var highlightedRow = this.GetHighlightedRow();
    if (highlightedRow &&
        highlightedRow["row"] === currentReviewTableRow) {
        return;
    }

    if (highlightedRow &&
        !this.ComponentSelected(highlightedRow.rowIndex, tableId)) {
        this.RemoveHighlightColor(highlightedRow["row"]);
    }

    this.ApplyHighlightColor(currentReviewTableRow["row"]);
    this.SetHighlightedRow({
        "row": currentReviewTableRow,
        "rowIndex": currentReviewTableRow.rowIndex,
        "tableId": tableId
    });
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