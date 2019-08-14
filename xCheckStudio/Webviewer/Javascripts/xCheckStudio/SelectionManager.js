function SelectionManager()
{
    // maintain selected and highlighted component rows
    this.SelectedComponentRows = [];
    this.HighlightedComponentRow;    
}

SelectionManager.prototype.HandleSelectFormCheckBox = function (currentCheckBox) {   
}

SelectionManager.prototype.SelectedCompoentExists = function (componentRow) {   
    return false;
}

SelectionManager.prototype.RemoveFromselectedCompoents = function (componentRow) {   
}

/* 
   This function 
*/
SelectionManager.prototype.UnApplyHighlightColor = function (row) {
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = "#ffffff"
    }
}

/* 
   This function 
*/
SelectionManager.prototype.ApplyHighlightColor = function (row) {
    for (var j = 0; j < row.cells.length; j++) {
        cell = row.cells[j];
        cell.style.backgroundColor = "#B2BABB"
    }
}