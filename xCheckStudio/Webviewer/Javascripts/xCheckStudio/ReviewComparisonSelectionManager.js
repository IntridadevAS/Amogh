function ReviewComparisonSelectionManager() {
    // call super constructor
    ReviewSelectionManager.call(this);
}

// assign SelectionManager's method to this class
ReviewComparisonSelectionManager.prototype = Object.create(ReviewSelectionManager.prototype);
ReviewComparisonSelectionManager.prototype.constructor = ReviewComparisonSelectionManager;

ReviewComparisonSelectionManager.prototype.HandleCheckComponentSelectFormCheckBox = function (currentRow, tableId, checkBoxState) {
    
    
    if (checkBoxState == "on" &&
        !this.ComponentSelected(currentRow.rowIndex, tableId)) {
        // if check component is selected and and selected 
        // component row doesn't exist already

        // highlight selected row
        this.ApplyHighlightColor(currentRow["row"]);

        // keep track of selected component row
        this.AddSelectedComponent({
            "row" : currentRow,
            "rowIndex" : currentRow.rowIndex,
            "tableId" : tableId});
    }
    else if (this.ComponentSelected(currentRow.rowIndex, tableId)) {

        // restore color
        this.RemoveHighlightColor(currentRow["row"]);

        // remove current row from selected rows array
        this.RemoveSelectedComponent (currentRow.rowIndex, tableId);        
    }
}

ReviewComparisonSelectionManager.prototype.ApplyHighlightColor = function (row) {
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = SelectedRowColor;
    }
}

ReviewComparisonSelectionManager.prototype.RemoveHighlightColor = function (row) {
    var Color = this.GetRowHighlightColor(row.cells[ComparisonColumns.Status].innerHTML);
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = Color;
    }
}

ReviewComparisonSelectionManager.prototype.MaintainHighlightedRow = function (currentReviewTableRow, tableId) {
    var highlightedRow = this.GetHighlightedRow();
    if (highlightedRow &&
        highlightedRow["row"] === currentReviewTableRow) {
        return;
    }

    if (highlightedRow &&
        !this.ComponentSelected(highlightedRow["rowIndex"], highlightedRow["tableId"])) {
        this.RemoveHighlightColor(highlightedRow["row"]);
    }

    this.ApplyHighlightColor(currentReviewTableRow["row"]);
    this.SetHighlightedRow({
        "row": currentReviewTableRow,
        "rowIndex": currentReviewTableRow.rowIndex,
        "tableId": tableId
    });   
}

ReviewComparisonSelectionManager.prototype.MaintainHighlightedDetailedRow = function (currentDetailedTableRow) {
    if (this.HighlightedDetailedComponentRow === currentDetailedTableRow) {
        return;
    }

    if (this.HighlightedDetailedComponentRow) {
        var row = this.HighlightedDetailedComponentRow;
        var Color = this.GetRowHighlightColor(row.cells[ComparisonPropertyColumns.Status].innerHTML);
        for (var j = 0; j < row.cells.length; j++) {
            cell = row.cells[j];
            cell.style.backgroundColor = Color;
        }
    }

    this.ApplyHighlightColor(currentDetailedTableRow);
    this.HighlightedDetailedComponentRow = currentDetailedTableRow;
}

ReviewComparisonSelectionManager.prototype.ChangeBackgroundColor = function (row, status) {
    var color = this.GetRowHighlightColor(status);
    for (var cell = 0; cell < row.cells.length; cell++) {
        row.cells[cell].style.backgroundColor = color;
    }
}
