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
    else if (status.toLowerCase() === ("Error").toLowerCase() ||
    status.toLowerCase() === ("Error(A)").toLowerCase() ||
    status.toLowerCase() === ("Error(T)").toLowerCase() ||
    status.toLowerCase() === ("Error(A)(T)").toLowerCase()) {
        return ErrorColor;
    }
    else if (status.toLowerCase() === ("Warning").toLowerCase() ||
    status.toLowerCase() === ("Warning(A)").toLowerCase() ||
    status.toLowerCase() === ("Warning(T)").toLowerCase() ||
    status.toLowerCase() === ("Warning(A)(T)").toLowerCase()) {
        return WarningColor;
    }
    else if (status.toLowerCase() === ("No Match").toLowerCase() ||
    status.toLowerCase() === ("No Match(A)").toLowerCase()) {
        return NoMatchColor;
    }
    else if (status.toLowerCase() === ("No Value").toLowerCase()) {
        return NoValueColor;
    }
    else if (status.toLowerCase() === ("Accepted").toLowerCase() ||
        status.toLowerCase() === ("Accepted(T)").toLowerCase()) {
        return AcceptedColor;
    }
    else if (status.toLowerCase() === ("OK(A)(T)").toLowerCase() || status.toLowerCase() === ("OK(T)(A)").toLowerCase()) {
        return AcceptedColor;
    }
    else if (status.toLowerCase() === ("OK(T)").toLowerCase() || status.toLowerCase() === ("OK(A)").toLowerCase()) {
        return AcceptedColor;
    }
    else {
        return "#ffffff";
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

ReviewSelectionManager.prototype.ComponentSelected = function (rowKey, tableId) {
    for(var i = 0; i < this.SelectedCheckComponentRows.length; i++)
    {
        var selectedCheckComponentRow = this.SelectedCheckComponentRows[i];
        if(selectedCheckComponentRow["rowKey"] === rowKey &&
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

ReviewSelectionManager.prototype.RemoveSelectedComponent = function (rowKey, tableId) {
    
    var index = -1;
    for(var i = 0; i < this.SelectedCheckComponentRows.length; i++)
    {
        var selectedCheckComponentRow = this.SelectedCheckComponentRows[i];
        if(selectedCheckComponentRow["rowKey"] === rowKey &&
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