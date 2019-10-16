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

// After accept, transpose performed, Grid data changes and so as the rows 
// To keep track of highlighted row after grid update we take new rowKey for the componet 
// and save highlighted row again
ReviewComplianceSelectionManager.prototype.UpdateHighlightedCheckComponent = function(dataGridObject) {
    if(model.getCurrentSelectionManager().HighlightedComponentRowIndex >= 0 && 
    model.getCurrentSelectionManager().HighlightedCheckComponentRow.rowIndex == -1) {
        var rowIndex = model.getCurrentSelectionManager().HighlightedComponentRowIndex;
        model.getCurrentSelectionManager().HighlightedCheckComponentRow = dataGridObject.getRowElement(rowIndex)[0];
        model.getCurrentSelectionManager().HighlightedComponentRowIndex = undefined;
    }
}