function ModelBrowser(modelBrowserContainer) {
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