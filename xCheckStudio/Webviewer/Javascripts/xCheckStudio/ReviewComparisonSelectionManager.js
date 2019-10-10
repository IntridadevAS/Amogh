function ReviewComparisonSelectionManager() {
    // call super constructor
    ReviewSelectionManager.call(this);
}

// assign SelectionManager's method to this class
ReviewComparisonSelectionManager.prototype = Object.create(ReviewSelectionManager.prototype);
ReviewComparisonSelectionManager.prototype.constructor = ReviewComparisonSelectionManager;

ReviewComparisonSelectionManager.prototype.HandleCheckComponentSelectFormCheckBox = function (currentRow, checkBoxState) {
    if (checkBoxState == "on" &&
        !this.SelectedCheckComponentRows.includes(currentRow)) {
        // if check component is selected and and selected 
        // component row doesn't exist already

        // highlight selected row
        this.ApplyHighlightColor(currentRow);

        // keep track of selected component row
        this.SelectedCheckComponentRows.push(currentRow);
    }
    else if (this.SelectedCheckComponentRows.includes(currentRow)) {

        // restore color
        this.RemoveHighlightColor(currentRow);

        // remove current row from selected rows array
        var index = this.SelectedCheckComponentRows.indexOf(currentRow);
        if (index !== -1) {
            this.SelectedCheckComponentRows.splice(index, 1);
        }
    }
}

ReviewComparisonSelectionManager.prototype.ApplyHighlightColor = function (row) {
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = "#B2BABB"
    }
}

ReviewComparisonSelectionManager.prototype.RemoveHighlightColor = function (row) {
    var Color = this.GetRowHighlightColor(row.cells[ComparisonColumns.Status].innerHTML);
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = Color;
    }
}

ReviewComparisonSelectionManager.prototype.MaintainHighlightedRow = function (currentReviewTableRow) {
    if (this.HighlightedCheckComponentRow === currentReviewTableRow) {
        return;
    }

    if (this.HighlightedCheckComponentRow &&
        !this.SelectedCheckComponentRows.includes(this.HighlightedCheckComponentRow)) {
        this.RemoveHighlightColor(this.HighlightedCheckComponentRow);
    }

    this.ApplyHighlightColor(currentReviewTableRow);
    this.HighlightedCheckComponentRow = currentReviewTableRow;
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

// After accept, transpose performed, Grid data changes and so as the rows 
// To keep track of highlighted row after grid update we take new rowKey for the componet 
// and save highlighted row again
ReviewComparisonSelectionManager.prototype.UpdateHighlightedCheckComponent = function(dataGridObject) {
    if(model.getCurrentSelectionManager().HighlightedComponentRowIndex && 
    model.getCurrentSelectionManager().HighlightedCheckComponentRow.rowIndex == -1) {
        var rowIndex = model.getCurrentSelectionManager().HighlightedComponentRowIndex;
        model.getCurrentSelectionManager().HighlightedCheckComponentRow = dataGridObject.getRowElement(rowIndex)[0];
        model.getCurrentSelectionManager().HighlightedComponentRowIndex = undefined;
    }
}