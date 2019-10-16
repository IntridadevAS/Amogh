function ReviewModuleContextMenuManager()
{

}

ReviewModuleContextMenuManager.prototype.HighlightSelectedRowOnRightClick = function(selectedRow, tableId) {    
        model.getCurrentSelectionManager().MaintainHighlightedRow(selectedRow[0], tableId);          
}