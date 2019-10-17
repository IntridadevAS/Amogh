function ReviewSelectionManager()
{
    this.HighlightedCheckComponentRow = undefined;
    this.SelectedCheckComponentRows = [];    
}

ReviewSelectionManager.prototype.GetRowHighlightColor = function (status) {
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

// After accept, transpose performed, Grid data changes and so as the rows 
// To keep track of highlighted row after grid update we take new rowKey for the componet 
// and save highlighted row again
ReviewSelectionManager.prototype.UpdateHighlightedCheckComponent = function (dataGridObject) {
    var highlightedRow = this.GetHighlightedRow();

    if (highlightedRow && highlightedRow["row"].rowIndex === -1) {
        
        var rowIndex = highlightedRow["rowIndex"];
        highlightedRow["row"] = dataGridObject.getRowElement(rowIndex)[0];
        this.SetHighlightedRow(highlightedRow);       
    }    
}

ReviewSelectionManager.prototype.GetHighlightedRow = function () {
    return this.HighlightedCheckComponentRow;
}

ReviewSelectionManager.prototype.SetHighlightedRow = function (row) {
    this.HighlightedCheckComponentRow = row;
}

ReviewSelectionManager.prototype.GetSelectedComponents = function () {
    return this.SelectedCheckComponentRows;
}

ReviewSelectionManager.prototype.AddSelectedComponent = function (row) {
    this.SelectedCheckComponentRows.push(row);
}

ReviewSelectionManager.prototype.ComponentSelected = function (rowIndex, tableId) {
    for(var i = 0; i < this.SelectedCheckComponentRows.length; i++)
    {
        var selectedCheckComponentRow = this.SelectedCheckComponentRows[i];
        if(selectedCheckComponentRow["rowIndex"] === rowIndex &&
        selectedCheckComponentRow["tableId"] === tableId )
        {
            return true;
        }
    }

    return false;
}

ReviewSelectionManager.prototype.GetSelectedComponent = function (rowIndex, tableId) {
    for(var i = 0; i < this.SelectedCheckComponentRows.length; i++)
    {
        var selectedCheckComponentRow = this.SelectedCheckComponentRows[i];
        if(selectedCheckComponentRow["rowIndex"] === rowIndex &&
        selectedCheckComponentRow["tableId"] === tableId )
        {
            return selectedCheckComponentRow;
        }
    }

    return undefined;
}

ReviewSelectionManager.prototype.RemoveSelectedComponent = function (rowIndex, tableId) {
    
    var index = -1;
    for(var i = 0; i < this.SelectedCheckComponentRows.length; i++)
    {
        var selectedCheckComponentRow = this.SelectedCheckComponentRows[i];
        if(selectedCheckComponentRow["rowIndex"] === rowIndex &&
        selectedCheckComponentRow["tableId"] === tableId )
        {
            index = i;
            break;
        }
    }

    if(index !== -1)
    {
        this.SelectedCheckComponentRows.splice(index, 1);
    }    
}