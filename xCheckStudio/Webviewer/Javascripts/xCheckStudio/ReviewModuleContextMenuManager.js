function ReviewModuleContextMenuManager()
{

}

ReviewModuleContextMenuManager.prototype.HighlightSelectedRowOnRightClick = function(selectedRow) {
    // var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
    // if(typeOfRow == "ComparisonMainReviewTbody") { 
        model.getCurrentSelectionManager().MaintainHighlightedRow(selectedRow[0]);       
    // }
    // else if(typeOfRow == "SourceAComplianceMainReviewTbody") {
    //     model.getCurrentSelectionManager().MaintainHighlightedRow(selectedRow[0]);
    // }
    // else if(typeOfRow == "SourceBComplianceMainReviewTbody") {
    //     model.getCurrentSelectionManager().MaintainHighlightedRow(selectedRow[0]);
    // }
}

// ReviewModuleContextMenuManager.prototype.DisableContextMenuAccept= function(selectedRow) {
       // if(selectedRow[0].nodeName == "BUTTON") { 
    //     var typeOfRow = selectedRow[0].offsetParent.id;
    //     var groupId = selectedRow[0].attributes[0].value;
    //     if(typeOfRow == "ComparisonMainReviewTbody" || typeOfRow == "ComparisonDetailedReviewTbody") { 
    //         if(comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'OK' ||
    //         comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass == 'Undefined') {
    //             return true;
    //         }
    //     }
    //     else if(typeOfRow == "SourceAComplianceMainReviewTbody" || typeOfRow == "ComplianceADetailedReviewTbody") { 
    //         if(sourceAComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].categoryStatus == 'OK' ||
    //         sourceAComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].ComponentClass == 'Undefined') {
    //             return true;
    //         }
    //     }
    //     else if(typeOfRow == "SourceBComplianceMainReviewTbody" || typeOfRow == "ComplianceBDetailedReviewTbody") {
    //         if(sourceBComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].categoryStatus == 'OK' ||
    //         sourceBComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].ComponentClass == 'Undefined') {
    //             return true;
    //         }
    //     }
    // }
    // else {
    //     var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
    //     if(typeOfRow == "ComparisonMainReviewTbody" || 
    //        typeOfRow == "ComparisonDetailedReviewTbody") {
    //         if(selectedRow[0].cells[2].innerHTML == "OK" || selectedRow[0].cells[4].innerHTML == "OK" || 
    //         selectedRow[0].cells[2].innerHTML == "OK(T)" || selectedRow[0].cells[4].innerHTML == "OK(T)" ||
    //         selectedRow[0].cells[2].innerHTML == "undefined" || selectedRow[0].cells[4].innerHTML == "undefined") {
    //             return true;
    //         }
    //     }
    //     else if(typeOfRow == "SourceAComplianceMainReviewTbody" || typeOfRow == "ComplianceADetailedReviewTbody" || 
    //     typeOfRow == "SourceBComplianceMainReviewTbody" || typeOfRow == "ComplianceBDetailedReviewTbody") {
    //         if(selectedRow[0].cells[1].innerHTML == "OK" || selectedRow[0].cells[2].innerHTML == "OK" ||
    //         selectedRow[0].cells[1].innerHTML == "undefined" || selectedRow[0].cells[2].innerHTML == "undefined") {
    //             return true;
    //         }
    //     }   
    // }
// }