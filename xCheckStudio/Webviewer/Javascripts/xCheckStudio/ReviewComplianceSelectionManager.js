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
        cell.style.backgroundColor = "#B2BABB"
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

ReviewComplianceSelectionManager.prototype.HandleCheckComponentSelectFormCheckBox = function (currentRow, checkBoxState) {
    // var currentCell = currentCheckBox.parentElement;
    // if (currentCell.tagName.toLowerCase() !== 'td') {
    //     return;
    // }

    // var currentRow = currentCell.parentElement;
    // if (currentRow.tagName.toLowerCase() !== 'tr' ||
    //     currentRow.cells.length < Object.keys(ComplianceColumns).length) {
    //     return;
    // }

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

ReviewComplianceSelectionManager.prototype.MaintainHighlightedRow = function (currentReviewTableRow) {
    if (this.HighlightedCheckComponentRow === currentReviewTableRow) {
        return false;
    }

    if (this.HighlightedCheckComponentRow &&
        !this.SelectedCheckComponentRows.includes(this.HighlightedCheckComponentRow)) {
        this.RemoveHighlightColor(this.HighlightedCheckComponentRow);
    }

    this.ApplyHighlightColor(currentReviewTableRow);
    this.HighlightedCheckComponentRow = currentReviewTableRow;

    return true;
}