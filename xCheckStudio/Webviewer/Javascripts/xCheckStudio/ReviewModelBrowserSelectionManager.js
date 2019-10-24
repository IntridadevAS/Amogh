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

ReviewModelBrowserSelectionManager.prototype.MaintainHighlightedRow = function (currentRow, tableId, rowKey) {
    var highlightedRow = this.GetHighlightedRow();
    if (highlightedRow &&
        highlightedRow["rowKey"] === rowKey) {
        return;
    }

    var modelBrowser = $(tableId).dxTreeList("instance")

    if (highlightedRow &&
        !this.ComponentSelected(highlightedRow["rowKey"], highlightedRow["tableId"])) {
        var rowIndex = modelBrowser.getRowIndexByKey(highlightedRow["rowKey"]);
        if (rowIndex != -1) {
            var row = modelBrowser.getRowElement(rowIndex)            
            this.RemoveHighlightColor(row[0]);
        }
    }

    this.ApplyHighlightColor(currentRow);
    this.SetHighlightedRow({       
        "tableId": tableId,
        "rowKey": rowKey
    });
}

ReviewModelBrowserSelectionManager.prototype.ComponentSelected = function (rowKey, tableId) {
    for (var i = 0; i < this.SelectedCheckComponentRows.length; i++) {
        var selectedCheckComponentRow = this.SelectedCheckComponentRows[i];
        if (selectedCheckComponentRow["rowKey"] === rowKey &&
            selectedCheckComponentRow["tableId"] === tableId) {
            return true;
        }
    }

    return false;
}


ReviewModelBrowserSelectionManager.prototype.ApplyHighlightColor = function (row) {
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = SelectedRowColor;
    }
}

ReviewModelBrowserSelectionManager.prototype.RemoveHighlightColor = function (row) {
    var Color = this.GetRowHighlightColor(row.cells[Comparison3DBrowserColumns.Status].innerHTML);
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = Color;
    }
}