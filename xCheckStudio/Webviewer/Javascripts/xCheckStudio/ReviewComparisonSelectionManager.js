function ReviewComparisonSelectionManager() {
    // call super constructor
    ReviewSelectionManager.call(this);
}

// assign SelectionManager's method to this class
ReviewComparisonSelectionManager.prototype = Object.create(ReviewSelectionManager.prototype);
ReviewComparisonSelectionManager.prototype.constructor = ReviewComparisonSelectionManager;

ReviewComparisonSelectionManager.prototype.HandleCheckComponentSelectFormCheckBox = function (currentRow, tableId, checkBoxState) {

    var rowKey = this.GetSelectedRowKey(currentRow.rowIndex, tableId);

    if (checkBoxState == "on" &&
        !this.ComponentSelected(rowKey, tableId)) {
        // if check component is selected and and selected 
        // component row doesn't exist already

        // highlight selected row
        this.ApplyHighlightColor(currentRow);

        // keep track of selected component row
        this.AddSelectedComponent({
            "rowKey" : rowKey,
            "tableId" : tableId});
    }
    else if (this.ComponentSelected(rowKey, tableId)) {

        // restore color
        var grid =  $(tableId).dxDataGrid("instance");
        var data =  grid.getDataSource().items();
        var rowData = data[rowIndex];
        this.RemoveHighlightColor(currentRow, rowData[ComparisonColumnNames.Status]);

        // remove current row from selected rows array
        this.RemoveSelectedComponent (rowKey, tableId);        
    }
}

ReviewComparisonSelectionManager.prototype.ApplyHighlightColor = function (row) {
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = SelectedRowColor;
    }
}

ReviewComparisonSelectionManager.prototype.RemoveHighlightColor = function (row, status) {
    var Color = this.GetRowHighlightColor(status);
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = Color;
    }
}

ReviewComparisonSelectionManager.prototype.MaintainHighlightedRow = function (currentReviewTableRow, tableId) {
    var highlightedRow = this.GetHighlightedRow();
    var rowElement;

    if (highlightedRow) {
        var dataGrid =  $(highlightedRow["tableId"]).dxDataGrid("instance");
        var rowIndex = dataGrid.getRowIndexByKey(highlightedRow["rowKey"]);
        rowElement = dataGrid.getRowElement(rowIndex)[0];

        if(rowElement === currentReviewTableRow) {
            return;
        }
    }


    if (highlightedRow &&
        !this.ComponentSelected(highlightedRow["rowKey"], highlightedRow["tableId"])) {
        var dataGrid = $(highlightedRow["tableId"]).dxDataGrid("instance");
        var rowIndex = dataGrid.getRowIndexByKey(highlightedRow["rowKey"]);
        var data = dataGrid.getDataSource().items();
        var rowData = data[rowIndex];
        this.RemoveHighlightColor(rowElement, rowData[ComparisonColumnNames.Status]);
    }

    rowKey = this.GetSelectedRowKey(currentReviewTableRow.rowIndex, tableId);

    this.ApplyHighlightColor(currentReviewTableRow);
    this.SetHighlightedRow({
        "rowKey": rowKey,
        "tableId": tableId
    });   
}

ReviewComparisonSelectionManager.prototype.GetSelectedRowKey = function(rowIndex, tableId) {
    var dataGrid =  $(tableId).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();
    var rowData = rows[rowIndex];
    return rowData.key;
}

ReviewComparisonSelectionManager.prototype.MaintainHighlightedDetailedRow = function (currentDetailedTableRow, rowKey) {
    if (this.HighlightedDetailedComponentRow &&
        this.HighlightedDetailedComponentRow.rowKey === rowKey) {
        return;
    }

    if (this.HighlightedDetailedComponentRow) {
        var dataGrid =  $( this.HighlightedDetailedComponentRow["tableId"]).dxDataGrid("instance");
        var rowIndex = dataGrid.getRowIndexByKey(this.HighlightedDetailedComponentRow["rowKey"]);
        var row = dataGrid.getRowElement(rowIndex)[0];
        
        var data = dataGrid.getDataSource().items();
        var rowData = data[rowIndex];
        var Color = this.GetRowHighlightColor(rowData[ComparisonPropertyColumnNames.Status]);
        for (var j = 0; j < row.cells.length; j++) {
            cell = row.cells[j];
            cell.style.backgroundColor = Color;
        }
    }

    this.ApplyHighlightColor(currentDetailedTableRow);
    this.HighlightedDetailedComponentRow = {
        "rowKey" : rowKey,
        "tableId" : '#comparisonDetailInfo'
    };
}

ReviewComparisonSelectionManager.prototype.ChangeBackgroundColor = function (row, status) {
    var color = this.GetRowHighlightColor(status);
    for (var cell = 0; cell < row.cells.length; cell++) {
        row.cells[cell].style.backgroundColor = color;
    }
}
