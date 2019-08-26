function ReviewSelectionManager()
{
    this.HighlightedCheckComponentRow;
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

ReviewSelectionManager.prototype.ScrollToHighlightedCheckComponentRow = function (reviewTable, reviewRow, mainReviewTableContainerId) {

    if (!this.HighlightedCheckComponentRow ||
        !reviewTable) {
    }

    var top = (reviewRow.offsetTop - reviewRow.offsetHeight);

    var ContainerId = reviewTable.parentElement.id;
    $(function () {
        $("#" + ContainerId + "table_scroll").scrollTop = top;
    });

    var mainReviewTableContainer = document.getElementById("#" + ContainerId + "table_scroll");
    // if (!mainReviewTableContainer) {
    //     return;
    // }

    // var collapsibleClasses = mainReviewTableContainer.getElementsByClassName("collapsible");
    // for (var i = 0; i < collapsibleClasses.length; i++) {
    //     var collapsibleClass = collapsibleClasses[i];
    //     if (collapsibleClass.innerText !== reviewTable.previousElementSibling.innerText) {
    //         collapsibleClass.nextElementSibling.style.display = "none";
    //         collapsibleClass.className = "collapsible";
    //     }
    //     else {
    //         collapsibleClass.nextElementSibling.style.display = "block";
    //     }
    // }
}