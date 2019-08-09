function ReviewComplianceSelectionManager() {
    // call super constructor
    ReviewSelectionManager.call(this);    
}

// assign SelectionManager's method to this class
ReviewComplianceSelectionManager.prototype = Object.create(ReviewSelectionManager.prototype);
ReviewComplianceSelectionManager.prototype.constructor = ReviewComplianceSelectionManager;

ReviewComplianceSelectionManager.prototype.ChangeBackgroundColor = function (row) {
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = "#B2BABB"
    }
}

ReviewComplianceSelectionManager.prototype.RestoreBackgroundColor = function (row) {
    var Color = this.GetRowHighlightColor(row.cells[1].innerHTML);
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = Color;
    }
}

ReviewComplianceSelectionManager.prototype.GetRowHighlightColor = function (status) {
    if (status.toLowerCase() === ("OK").toLowerCase()) {
        return SuccessColor;
    }
    else if(status.toLowerCase() === ("MATECHED").toLowerCase()) {
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
    else if (status.toLowerCase() === ("Accepted").toLowerCase()) {
        return AcceptedColor;
    }
    else if (status.toLowerCase() === ("Error(A)").toLowerCase() || status.toLowerCase() === ("Warning(A)").toLowerCase() 
    || status.toLowerCase() === ("No Match(A)").toLowerCase() || status.toLowerCase() === ("No Value(A)").toLowerCase()) {
        return PropertyAcceptedColor;
    }
    else if(status.toLowerCase() === ("OK(A)").toLowerCase()) {
        return AcceptedColor;
    }
    else {
        return "#ffffff";
    }
}