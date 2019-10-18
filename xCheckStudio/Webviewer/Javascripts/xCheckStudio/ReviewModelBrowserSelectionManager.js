function ReviewModelBrowserSelectionManager() {
    // call super constructor
    ReviewSelectionManager.call(this);
}

// assign SelectionManager's method to this class
ReviewModelBrowserSelectionManager.prototype = Object.create(ReviewSelectionManager.prototype);
ReviewModelBrowserSelectionManager.prototype.constructor = ReviewModelBrowserSelectionManager;

ReviewModelBrowserSelectionManager.prototype.ChangeBackgroundColor = function (row, status) {
    var color = this.GetRowHighlightColor(status);
    for (var cell = 0; cell < row.cells.length; cell++) {
        row.cells[cell].style.backgroundColor = color;
    }
}

