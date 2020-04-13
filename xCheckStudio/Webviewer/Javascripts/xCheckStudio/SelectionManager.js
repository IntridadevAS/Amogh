function SelectionManager()
{
    // maintain selected and highlighted component rows
    this.SelectedComponentNodeIds = [];
    this.HighlightedComponentRow;     
    this.HighlightedComponentRowKey;   
}

SelectionManager.prototype.SelectComponent = function (currentCheckBox) {   
}

SelectionManager.prototype.SelectedCompoentExists = function (componentRow) {   
    return false;
}

SelectionManager.prototype.RemoveFromselectedCompoents = function (componentRow) {   
}

/* 
   This function 
*/
SelectionManager.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}

/* 
   This function 
*/
SelectionManager.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = '#e6e8e8';
}