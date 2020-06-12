function PropertyCallout(id) {
    this.Id = id;

    this.SelectedRowKey = {
        "properties": undefined,
        "references": undefined,
        "comments": undefined
    }
}

PropertyCallout.prototype.Init = function () {
    var _this = this;

    document.getElementById("propertyCalloutNameBar" + _this.Id).children[0].innerText = "";

    document.getElementById("propertyCallout" + this.Id).onclick = function () {
        if (this.classList.contains("propertyCalloutOpen")) {
            _this.Close();
        }
        else {
            _this.Open();
        }
    }
}

PropertyCallout.prototype.Open = function () {
    if (openCallout) {
        openCallout.Close();
    }
    openCallout = this;

    document.getElementById("propertyCallout" + this.Id).classList.add("propertyCalloutOpen");

    var element = document.getElementById("propertyCalloutContainer" + this.Id);
    element.setAttribute('style', 'display:block !important');

    document.getElementById("propertyCalloutNameBar" + this.Id).style.display = "block";
}

PropertyCallout.prototype.Close = function () {
    openCallout = undefined;

    document.getElementById("propertyCallout" + this.Id).classList.remove("propertyCalloutOpen");

    var element = document.getElementById("propertyCalloutContainer" + this.Id);
    element.setAttribute('style', 'display:none !important');

    document.getElementById("propertyCalloutNameBar" + this.Id).style.display = "none";
}

PropertyCallout.prototype.Update = function (componentName,
    componentId,
    properties,
    references,
    commentsData) {

    var _this = this;

    // if callout is not open. OPen it while data loading to avoid
    // issues with size
    var calloutOpen = true;
    var propertyCalloutBtn = document.getElementById("propertyCallout" + this.Id);
    if (!propertyCalloutBtn.classList.contains("propertyCalloutOpen")) {
        var element = document.getElementById("propertyCalloutContainer" + this.Id);
        element.setAttribute('style', 'display:block !important');

        calloutOpen = false;
    }

    $("#propertyCalloutContainer" + this.Id).dxTabPanel({
        dataSource: [
            { title: "Properties", template: "tab1" },
            { title: "References", template: "tab2" },
            { title: "Comments", template: "tab3" },
        ],
        deferRendering: false
    });

    // properties grid
    var propertiesColumns = [];

    var column = {};
    column["caption"] = "Name";
    column["dataField"] = "Name";
    column["width"] = "50%";
    column["visible"] = true;
    propertiesColumns.push(column);

    column = {};
    column["caption"] = "Value";
    column["dataField"] = "Value";
    column["width"] = "50%";
    column["visible"] = true;
    propertiesColumns.push(column);

    $("#propertyCalloutPropGrid" + this.Id).dxDataGrid({
        columns: propertiesColumns,
        dataSource: properties,
        height: "100%",
        // columnAutoWidth: true,
        allowColumnResizing: true,
        columnResizingMode: 'widget',
        showBorders: true,
        showRowLines: true,
        paging: { enabled: false },
        filterRow: {
            visible: true
        },
        onRowClick: function (e) {
            if (_this.SelectedRowKey["properties"] === e.key) {
                return;
            }

            if (_this.SelectedRowKey["properties"]) {
                var rowIndex = e.component.getRowIndexByKey(_this.SelectedRowKey["properties"]);
                var rowElement = e.component.getRowElement(rowIndex)[0];
                _this.RemoveHighlightColor(rowElement);
            }

            _this.SelectedRowKey["properties"] = e.key;

            _this.ApplyHighlightColor(e.rowElement[0]);
        }
    });

    // Reference grid
    var referencesColumns = [];

    var column = {};
    column["caption"] = "Type";
    column["dataField"] = "Type";
    column["width"] = "25%";
    column["visible"] = true;
    referencesColumns.push(column);

    column = {};
    column["caption"] = "Value";
    column["dataField"] = "Value";
    column["width"] = "75%";
    column["visible"] = true;
    column["cellTemplate"] = function (container, options) {
        var value = options.data.Value;
        var type = options.data.Type;
        $('<a/>').addClass('dx-link')
            .text(options.data.Value)
            .on('dxclick', function () {
                // open reference                             
                if (type.toLowerCase() === "web address") {
                    win.loadURL(value);
                }
                else if (type.toLowerCase() === "image" ||
                    type.toLowerCase() === "document") {
                    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

                    const path = require("path");
                    var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, value);
                    if (type.toLowerCase() === "document") {

                        var fileExtension = xCheckStudio.Util.getFileExtension(value);
                        if (fileExtension.toLowerCase() === "pdf") {
                            const PDFWindow = require('electron-pdf-window');
                            PDFWindow.addSupport(win);
                        }
                        else if (fileExtension.toLowerCase() === "doc" ||
                            fileExtension.toLowerCase() === "docx" ||
                            fileExtension.toLowerCase() === "xls" ||
                            fileExtension.toLowerCase() === "xlsx" ||
                            fileExtension.toLowerCase() === "ppt" ||
                            fileExtension.toLowerCase() === "pptx" ||
                            fileExtension.toLowerCase() === "csv" ||
                            fileExtension.toLowerCase() === "txt") {

                            const { shell } = require('electron');
                            const { ipcRenderer } = require("electron");

                            var executed = false;
                            ipcRenderer.on("download complete", (event, file) => {
                                if (executed === true) {
                                    // this is to avoid issue when "download complete" gets called multiple times    
                                    return;
                                }

                                shell.openExternal(file);
                                executed = true;
                            });
                            ipcRenderer.send("download", {
                                url: docUrl
                            });

                            return;
                        }
                    }


                    win.loadURL(docUrl);

                }
            })
            .appendTo(container);
    }
    referencesColumns.push(column);

    $("#propertyCalloutRefGrid" + this.Id).dxDataGrid({
        columns: referencesColumns,
        dataSource: references,
        height: "100%",
        // columnAutoWidth: true,
        allowColumnResizing: true,
        columnResizingMode: 'widget',
        showBorders: true,
        showRowLines: true,
        paging: { enabled: false },
        filterRow: {
            visible: true
        },
        onRowClick: function (e) {
            if (_this.SelectedRowKey["references"] === e.key) {
                return;
            }

            if (_this.SelectedRowKey["references"]) {
                var rowIndex = e.component.getRowIndexByKey(_this.SelectedRowKey["references"]);
                var rowElement = e.component.getRowElement(rowIndex)[0];
                _this.RemoveHighlightColor(rowElement);
            }

            _this.SelectedRowKey["references"] = e.key;

            _this.ApplyHighlightColor(e.rowElement[0]);
        }
    });

    // Comments page
    $("#commentInput" + this.Id).dxTextArea({
        height: "60px",
        valueChangeEvent: "keyup",
        onChange: function (e) {
        },
        onEnterKey: function (e) {           
            if(!e.jQueryEvent.shiftKey)
            {
                _this.AddComment(componentId);
            }
        },
        onKeyDown: function (e) {
            if (e.jQueryEvent.which == 13 && 
                !e.jQueryEvent.shiftKey) {
                e.jQueryEvent.preventDefault();
            }
        }
    });

    document.getElementById("addCommentBtn" + this.Id).onclick = function () {
        _this.AddComment(componentId);
    }

    // restore comments
    if (commentsData && commentsData.length > 0) {
        for (var i = 0; i < commentsData.length; i++) {
            this.ShowComment(commentsData[i]);
        }
    }

    //Create search control
    $("#propertyCalloutSearchText" + this.Id).dxTextArea({
        height: "30px",
        valueChangeEvent: "keyup",
        onChange: function (e) {
        },
        onEnterKey: function (e) {
            if (!e.jQueryEvent.shiftKey) {
                _this.Search();
            }
        },
        onKeyDown: function (e) {
            if (e.jQueryEvent.which == 13 &&
                !e.jQueryEvent.shiftKey) {
                e.jQueryEvent.preventDefault();
            }
        }
    });

    document.getElementById("propertyCalloutSearchBtn" + this.Id).onclick = function () {
        _this.Search();
    }

    document.getElementById("propertyCalloutNameBar" + _this.Id).children[0].textContent = componentName;

    // hide callout if it was open to avoid
    // issues with size
    if (!calloutOpen) {
        var element = document.getElementById("propertyCalloutContainer" + this.Id);
        element.setAttribute('style', 'display:none !important');
    }
}

PropertyCallout.prototype.AddComment = function (componentId) {
    if (!componentId) {
        return;
    }

    var _this = this;

    var commentInput = $('#commentInput' + this.Id).dxTextArea('instance');
    var value = commentInput.option('value');
    commentInput.reset();
    if (!value || value === "") {
        return;
    }

    ReferenceManager.processCommentForComponentIds(value, [componentId]).then(function (commentData) {
        if (!commentData) {
            return;
        }

        _this.ShowComment(commentData);
    });
}

PropertyCallout.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#e6e8e8";
}

PropertyCallout.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}

PropertyCallout.prototype.ShowComment = function (commentData) {

    var commentsArea = document.getElementById("commentsArea" + this.Id);

    var card = document.createElement("Div");
    card.className = "commentCard";

    var dataContainer = document.createElement("Div");
    dataContainer.className = "commentContainer";

    var commentorDiv = document.createElement("div");
    commentorDiv.textContent = commentData.user;
    commentorDiv.style.fontSize = "10px";
    commentorDiv.style.textAlign = "left";
    commentorDiv.style.color = "gray";
    dataContainer.appendChild(commentorDiv);

    var commentDiv = document.createElement("div");
    commentDiv.textContent = commentData.value;
    commentDiv.style.fontSize = "11px";
    dataContainer.appendChild(commentDiv);

    var timeDiv = document.createElement("div");
    timeDiv.textContent = commentData.date;
    timeDiv.style.fontSize = "10px";
    timeDiv.style.textAlign = "right";
    timeDiv.style.color = "gray";
    dataContainer.appendChild(timeDiv);

    // var commentValue = document.createElement("h3");
    // var bold = document.createElement("b");
    // bold.textContent = commentData.value;
    // commentValue.appendChild(bold);
    // dataContainer.appendChild(commentValue);

    // var userValue = document.createElement("p");
    // userValue.textContent = commentData.user;
    // dataContainer.appendChild(userValue);

    // var timeValue = document.createElement("p");
    // timeValue.textContent = commentData.date;
    // dataContainer.appendChild(timeValue);

    card.appendChild(dataContainer);

    commentsArea.appendChild(card);

    // scroll to bottom
    commentsArea.scrollTop = commentsArea.scrollHeight;

    card.onclick = function () {
        // select this list item
        // ReferenceManager.select(this);
    }

    card.ondblclick = function () {
    }

    card.onmouseover = function () {
        ReferenceManager.Highlight(this);
    }

    card.onmouseout = function () {
        ReferenceManager.UnHighlight(this);
    }
}

PropertyCallout.prototype.Search = function () {

    var searchInput = $('#propertyCalloutSearchText'+ this.Id).dxTextArea('instance');
    var searchText = searchInput.option('value');

    var targetDiv = document.getElementById("commentsArea"+ this.Id);
    var commentCards = targetDiv.getElementsByClassName('commentCard');

    if (!searchText ||
        searchText === "") {
        // show all

        for (i = 0; i < commentCards.length; i++) {
            var card = commentCards[i];
            card.style.display = "block";
        }
    }
    {
        var filter = searchText.toLowerCase();

        for (i = 0; i < commentCards.length; i++) {
            var card = commentCards[i];
            card.style.display = "none";
            for (var j = 0; j < card.children.length; j++) {
                if (card.children[j].innerText.toLowerCase().includes(filter)) {
                    card.style.display = "block";
                }
            }
        }
    }
}