function ModelBrowser(id, modelBrowserContainer) {
    this.Id = id;
    this.ModelBrowserContainer = modelBrowserContainer;
}

ModelBrowser.prototype.ShowItemCount = function (count) {

    var itemCountDiv = this.GetItemCountDiv();
    if (!itemCountDiv) {
        return;
    }

    itemCountDiv.innerHTML = "Count : "+ count;
}

ModelBrowser.prototype.GetItemCountDiv = function () {
    if (this.ModelBrowserContainer.toLowerCase() === "tabledataa") {
        return document.getElementById("itemCountA");
    }
    else if (this.ModelBrowserContainer.toLowerCase() === "tabledatab") {
        return document.getElementById("itemCountB");
    }
    else if (this.ModelBrowserContainer.toLowerCase() === "tabledatac") {
        return document.getElementById("itemCountC");
    }
    else if (this.ModelBrowserContainer.toLowerCase() === "tabledatad") {
        return document.getElementById("itemCountD");
    }

    return undefined;
}

ModelBrowser.prototype.Clear = function (tableControl) {
    if (model.views[this.Id].tableViewInstance) {
        var containerDiv = "#" + this.ModelBrowserContainer;

        var browserContainer = document.getElementById(this.ModelBrowserContainer);
        var parent = browserContainer.parentElement;

        //remove html element which holds grid
        //devExtreme does not have destroy method. We have to remove the html element and add it again to create another table
        if (tableControl.toLowerCase() === "treelist") {
            $(containerDiv).dxTreeList("dispose");
        }
        else if (tableControl.toLowerCase() === "datagrid") {
            $(containerDiv).dxDataGrid("dispose");
        }
        $(containerDiv).remove();

        //Create and add div with same id to add grid again
        var browserContainerDiv = document.createElement("div")
        browserContainerDiv.id = this.ModelBrowserContainer;
        var styleRule = ""
        styleRule = "position: relative";
        browserContainerDiv.setAttribute("style", styleRule);
        parent.appendChild(browserContainerDiv);

        model.views[this.Id].tableViewInstance = null;

        // disable list view switches
        if (SourceManagers[this.Id].IncludeMemberItemsSwitch) {
            SourceManagers[this.Id].IncludeMemberItemsSwitch.option("disabled", true);
        }
        if (SourceManagers[this.Id].ListTypeSwitch) {
            SourceManagers[this.Id].ListTypeSwitch.option("disabled", true);
        }
    }

    // clear count
    this.GetItemCountDiv().innerHTML = "";
}