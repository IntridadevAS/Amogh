function ReviewComparisonSelectionManager() {
    // call super constructor
    ReviewSelectionManager.call(this);
}

// assign SelectionManager's method to this class
ReviewComparisonSelectionManager.prototype = Object.create(ReviewSelectionManager.prototype);
ReviewComparisonSelectionManager.prototype.constructor = ReviewComparisonSelectionManager;

ReviewComparisonSelectionManager.prototype.HandleCheckComponentSelectFormCheckBox = function (currentCheckBox) {
    var currentCell = currentCheckBox.parentElement;
    if (currentCell.tagName.toLowerCase() !== 'td') {
        return;
    }

    var currentRow = currentCell.parentElement;
    if (currentRow.tagName.toLowerCase() !== 'tr' ||
        currentRow.cells.length < Object.keys(ComparisonColumns).length) {
        return;
    }

    if (currentCheckBox.checked &&
        !this.SelectedCheckComponentRows.includes(currentRow)) {
        // if check component is selected and and selected 
        // component row doesn't exist already

        // highlight selected row
        this.ChangeBackgroundColor(currentRow);

        // keep track of selected component row
        this.SelectedCheckComponentRows.push(currentRow);
    }
    else if (this.SelectedCheckComponentRows.includes(currentRow)) {

        // restore color
        this.RestoreBackgroundColor(currentRow);

        // remove current row from selected rows array
        var index = this.SelectedCheckComponentRows.indexOf(currentRow);
        if (index !== -1) {
            this.SelectedCheckComponentRows.splice(index, 1);
        }
    }
}

ReviewComparisonSelectionManager.prototype.ChangeBackgroundColor = function (row) {
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = "#B2BABB"
    }
}

ReviewComparisonSelectionManager.prototype.RestoreBackgroundColor = function (row) {
    var Color = this.GetRowHighlightColor(row.cells[ComparisonColumns.Status].innerHTML);
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = Color;
    }
}

ReviewComparisonSelectionManager.prototype.GetRowHighlightColor = function (status) {
    if (status.toLowerCase() === ("OK").toLowerCase()) {
        return SuccessColor;
    }
    else if (status.toLowerCase() === ("MATCHED").toLowerCase()) {
        return MatchedColor;
    }
    else if (status.toLowerCase() === ("Error").toLowerCase()) {
        return ErrorColor;
    }
    else if (status.toLowerCase() === ("Warning").toLowerCase()) {
        return WarningColor;
    }
    else if (status.toLowerCase() === ("No Match").toLowerCase()) {
        return NoMatchColor;
    }
    else if (status.toLowerCase() === ("No Value").toLowerCase()) {
        return NoValueColor;
    }
    else if (status.toLowerCase() === ("Accepted").toLowerCase() ||
        status.toLowerCase() === ("Accepted(T)").toLowerCase()) {
        return AcceptedColor;
    }
    else if (status.toLowerCase() === ("Error(A)").toLowerCase() ||
        status.toLowerCase() === ("Warning(A)").toLowerCase() ||
        status.toLowerCase() === ("No Match(A)").toLowerCase() ||
        status.toLowerCase() === ("No Value(A)").toLowerCase()) {
        return PropertyAcceptedColor;
    }
    else if (status.toLowerCase() === ("Error(T)").toLowerCase() ||
        status.toLowerCase() === ("Warning(T)").toLowerCase()) {
        return PropertyAcceptedColor;
    }
    else if (status.toLowerCase() === ("OK(A)(T)").toLowerCase() || status.toLowerCase() === ("OK(T)(A)").toLowerCase()) {
        return AcceptedColor;
    }
    else if (status.includes("(A)(T)") || status.includes("(T)(A)")) {
        return PropertyAcceptedColor;
    }
    else if (status.toLowerCase() === ("OK(T)").toLowerCase() || status.toLowerCase() === ("OK(A)").toLowerCase()) {
        return AcceptedColor;
    }
    else {
        return "#ffffff";
    }
}

ReviewComparisonSelectionManager.prototype.MaintainHighlightedRow = function (currentReviewTableRow) {
    if (this.HighlightedCheckComponentRow === currentReviewTableRow) {
        return;
    }

    if (this.HighlightedCheckComponentRow &&
        !this.SelectedCheckComponentRows.includes(this.HighlightedCheckComponentRow)) {
        this.RestoreBackgroundColor(this.HighlightedCheckComponentRow);
    }

    this.ChangeBackgroundColor(currentReviewTableRow);
    this.HighlightedCheckComponentRow = currentReviewTableRow;
}

ReviewComparisonSelectionManager.prototype.ScrollToHighlightedCheckComponentRow = function (reviewTable, mainReviewTableContainerId) {
    if (!this.HighlightedCheckComponentRow ||
        !reviewTable) {
    }

    reviewTable.scrollTop = reviewTableRow.offsetTop - reviewTableRow.offsetHeight;

    var mainReviewTableContainer = document.getElementById(mainReviewTableContainerId);
    if (!mainReviewTableContainer) {
        return;
    }

    var collapsibleClasses = mainReviewTableContainer.getElementsByClassName("collapsible");
    for (var i = 0; i < collapsibleClasses.length; i++) {
        var collapsibleClass = collapsibleClasses[i];
        if (collapsibleClass.innerText !== reviewTable.previousElementSibling.innerText) {
            collapsibleClass.nextElementSibling.style.display = "none";
            collapsibleClass.className = "collapsible";
        }
    }
}  