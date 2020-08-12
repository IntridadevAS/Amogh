function PropertyCallout(checkType) {
    this.CheckType = checkType;

    this.SelectedRowKey = {
        "properties": undefined,
        "references": undefined,
        "comments": undefined
    }
}

PropertyCallout.prototype.Init = function () {
    var _this = this;

    document.getElementById("propertyCallout" + this.CheckType).onclick = function () {
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

    document.getElementById("propertyCallout" + this.CheckType).classList.add("propertyCalloutOpen");

    var element = document.getElementById("propertyCalloutContainer" + this.CheckType);
    element.setAttribute('style', 'display:block !important');

    document.getElementById("propertyCalloutNameBar" + this.CheckType).style.display = "block";

    if (this.CheckType.toLowerCase() === "comparison") {
        document.getElementById("propertyCalloutStatusBar" + this.CheckType).style.display = "block";
    }
}

PropertyCallout.prototype.Close = function () {
    openCallout = undefined;

    document.getElementById("propertyCallout" + this.CheckType).classList.remove("propertyCalloutOpen");

    var element = document.getElementById("propertyCalloutContainer" + this.CheckType);
    element.setAttribute('style', 'display:none !important');

    document.getElementById("propertyCalloutNameBar" + this.CheckType).style.display = "none";

    if (this.CheckType.toLowerCase() === "comparison") {
        document.getElementById("propertyCalloutStatusBar" + this.CheckType).style.display = "none";
    }
}

PropertyCallout.prototype.UpdateForComparison = function (
    propertyCalloutData) {

    var _this = this;

    // if callout is not open. OPen it while data loading to avoid
    // issues with size
    var calloutOpen = true;
    var propertyCalloutBtn = document.getElementById("propertyCallout" + this.CheckType);
    if (!propertyCalloutBtn.classList.contains("propertyCalloutOpen")) {
        var element = document.getElementById("propertyCalloutContainer" + this.CheckType);
        element.setAttribute('style', 'display:block !important');

        calloutOpen = false;
    }

    $("#propertyCalloutContainer" + this.CheckType).dxTabPanel({
        dataSource: [
            { title: "Properties", template: "tab1" },
            { title: "References", template: "tab2" },
            { title: "Comments", template: "tab3" },
        ],
        deferRendering: false
    });

    // remove dataset buttons
    var firstSourceDiv = document.getElementById("firstSource");
    if (firstSourceDiv) {
        $("#firstSource").dxButton("dispose");
        $("#firstSource").remove();
    }
    var secondSourceDiv = document.getElementById("secondSource");
    if (secondSourceDiv) {
        $("#secondSource").dxButton("dispose");
        $("#secondSource").remove();
    }
    var thirdSourceDiv = document.getElementById("thirdSource");
    if (thirdSourceDiv) {
        $("#thirdSource").dxButton("dispose");
        $("#thirdSource").remove();
    }
    var fourthSourceDiv = document.getElementById("fourthSource");
    if (fourthSourceDiv) {
        $("#fourthSource").dxButton("dispose");
        $("#fourthSource").remove();
    }

    var isFirst = true;
    if ("a" in propertyCalloutData) {
        var sourceDiv = document.createElement("div");
        sourceDiv.id = "firstSource";
        document.getElementById("propertyCalloutStatusBar" + _this.CheckType).appendChild(sourceDiv);

        let loading = true;
        var firstSourceBtn = $("#firstSource").dxButton({
            // icon: "chevrondown",
            text: "1",
            width: "50px",
            height: "30px",
            onContentReady: function (e) {
                if (loading !== true) {
                    return;
                }
                loading = false;

                _this.LoadData(propertyCalloutData, "a");               
            },
            onClick: function (e) {
                _this.LoadData(propertyCalloutData, "a");
                // _this.LoadProperties(propertyCalloutData["a"].properties);
                // _this.LoadReferences(propertyCalloutData["a"].references);
                // _this.LoadComments(propertyCalloutData["a"].comments, propertyCalloutData["a"].componentId, "a");
                // document.getElementById("propertyCalloutNameBar" + _this.CheckType).children[0].textContent = propertyCalloutData['a'].name;
            }
        }).dxButton("instance");

        // firstSourceBtn["_$element"].click();
        // isFirst = false;
    }
    if ("b" in propertyCalloutData) {
        var sourceDiv = document.createElement("div");
        sourceDiv.id = "secondSource";
        document.getElementById("propertyCalloutStatusBar" + _this.CheckType).appendChild(sourceDiv);

        let loading = true;
        var secondSourceBtn = $("#secondSource").dxButton({
            // icon: "chevrondown",
            text: "2",
            width: "50px",
            height: "30px",
            onContentReady: function (e) {
                if (loading !== true) {
                    return;
                }
                loading = false;
                
                if (!("a" in propertyCalloutData)) {
                    _this.LoadData(propertyCalloutData, "b");
                    // e.component["_$element"].click();
                }
            },
            onClick: function (e) {
                _this.LoadData(propertyCalloutData, "b");
                // _this.LoadProperties(propertyCalloutData["b"].properties);
                // _this.LoadReferences(propertyCalloutData["b"].references);
                // _this.LoadComments(propertyCalloutData["b"].comments, propertyCalloutData["b"].componentId, "b");
                // document.getElementById("propertyCalloutNameBar" + _this.CheckType).children[0].textContent = propertyCalloutData['b'].name;
            }
        }).dxButton("instance");

        // if (isFirst) {
        //     secondSourceBtn["_$element"].click();
        //     isFirst = false;
        // }
    }
    if ("c" in propertyCalloutData) {
        var sourceDiv = document.createElement("div");
        sourceDiv.id = "thirdSource";
        document.getElementById("propertyCalloutStatusBar" + _this.CheckType).appendChild(sourceDiv);

        let loading = true;
        var thirdSourceBtn = $("#thirdSource").dxButton({
            // icon: "chevrondown",
            text: "3",
            width: "50px",
            height: "30px",
            onContentReady: function (e) {
                if (loading !== true) {
                    return;
                }
                loading = false;

                if (!("a" in propertyCalloutData) &&
                    !("b" in propertyCalloutData)) {
                    _this.LoadData(propertyCalloutData, "c");
                    // e.component["_$element"].click();
                }
            },
            onClick: function (e) {
                _this.LoadData(propertyCalloutData, "c");
                // _this.LoadProperties(propertyCalloutData["c"].properties);
                // _this.LoadReferences(propertyCalloutData["c"].references);
                // _this.LoadComments(propertyCalloutData["c"].comments, propertyCalloutData["c"].componentId, "c");
                // document.getElementById("propertyCalloutNameBar" + _this.CheckType).children[0].textContent = propertyCalloutData['c'].name;
            }
        }).dxButton("instance");

        // if (isFirst) {
        //     thirdSourceBtn["_$element"].click();;
        //     isFirst = false;
        // }
    }
    if ("d" in propertyCalloutData) {
        var sourceDiv = document.createElement("div");
        sourceDiv.id = "fourthSource";
        document.getElementById("propertyCalloutStatusBar" + _this.CheckType).appendChild(sourceDiv);

        let loading = true;
        var fourthSourceBtn = $("#fourthSource").dxButton({
            // icon: "chevrondown",
            text: "4",
            width: "50px",
            height: "30px",
            onContentReady: function (e) {
                if (loading !== true) {
                    return;
                }
                loading = false;

                if (!("a" in propertyCalloutData) &&
                    !("b" in propertyCalloutData) &&
                    !("c" in propertyCalloutData)) {
                    // e.component["_$element"].click();
                    _this.LoadData(propertyCalloutData, "d");
                }
            },
            onClick: function (e) {
                _this.LoadData(propertyCalloutData, "d");
                // _this.LoadProperties(propertyCalloutData["d"].properties);
                // _this.LoadReferences(propertyCalloutData["d"].references);
                // _this.LoadComments(propertyCalloutData["d"].comments, propertyCalloutData["d"].componentId, "d");
                // document.getElementById("propertyCalloutNameBar" + _this.CheckType).children[0].textContent = propertyCalloutData['d'].name;
            }
        }).dxButton("instance");

        // if (isFirst) {
        //     fourthSourceBtn["_$element"].click();
        //     isFirst = false;
        // }
    }

    // hide callout if it was open to avoid
    // issues with size
    if (!calloutOpen) {
        var element = document.getElementById("propertyCalloutContainer" + this.CheckType);
        element.setAttribute('style', 'display:none !important');
    }
}

PropertyCallout.prototype.LoadData = function (propertyCalloutData, srcId) {
    this.LoadProperties(propertyCalloutData[srcId].properties);
    this.LoadReferences(propertyCalloutData[srcId].references);
    this.LoadComments(propertyCalloutData[srcId].comments, propertyCalloutData[srcId].componentId, srcId);
    document.getElementById("propertyCalloutNameBar" + this.CheckType).children[0].textContent = propertyCalloutData[srcId].name;
}

PropertyCallout.prototype.UpdateForCompliance = function (
    propertyCalloutData) {
    var _this = this;

    // if callout is not open. OPen it while data loading to avoid
    // issues with size
    var calloutOpen = true;
    var propertyCalloutBtn = document.getElementById("propertyCallout" + this.CheckType);
    if (!propertyCalloutBtn.classList.contains("propertyCalloutOpen")) {
        var element = document.getElementById("propertyCalloutContainer" + this.CheckType);
        element.setAttribute('style', 'display:block !important');

        calloutOpen = false;
    }

    $("#propertyCalloutContainer" + this.CheckType).dxTabPanel({
        dataSource: [
            { title: "Properties", template: "tab1" },
            { title: "References", template: "tab2" },
            { title: "Comments", template: "tab3" },
        ],
        deferRendering: false
    });

    this.LoadProperties(propertyCalloutData.properties);
    this.LoadReferences(propertyCalloutData.references);
    this.LoadComments(propertyCalloutData.comments, propertyCalloutData.componentId, propertyCalloutData.src);
    document.getElementById("propertyCalloutNameBar" + this.CheckType).children[0].textContent = propertyCalloutData.name;

    // hide callout if it was open to avoid
    // issues with size
    if (!calloutOpen) {
        var element = document.getElementById("propertyCalloutContainer" + this.CheckType);
        element.setAttribute('style', 'display:none !important');
    }
}

PropertyCallout.prototype.LoadProperties = function (properties) {
    var _this = this;
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

    $("#propertyCalloutPropGrid" + this.CheckType).dxDataGrid({
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
}

PropertyCallout.prototype.LoadReferences = function (references) {
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
                const BrowserWindow = require('electron').remote.BrowserWindow;                            
                const path = require("path");
                
                // document url
                var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
                var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, value);

                if (type.toLowerCase() === "web address") {
                    win = new BrowserWindow({ title: 'xCheckStudio', frame: true, show: true, icon: 'public/symbols/XcheckLogoIcon.png' });
                    win.loadURL(value);
                }
                else if (type.toLowerCase() === "document") {               
                  
                    // if (type.toLowerCase() === "document") {
                        var fileExtension = xCheckStudio.Util.getFileExtension(value);                    
                        if (fileExtension.toLowerCase() === "doc" ||
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
                    // }
                   
                    win = new BrowserWindow({ title: 'xCheckStudio', frame: true, show: true, icon: 'public/symbols/XcheckLogoIcon.png' });
                    if (fileExtension.toLowerCase() === "pdf") {
                        const PDFWindow = require('electron-pdf-window');
                        PDFWindow.addSupport(win);
                    }
                    win.loadURL(docUrl);
                }
                else if(type.toLowerCase() === "image"){
                    // var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, value);

                    let win = new BrowserWindow({ title: 'xCheckStudio', frame: true, show: true, icon: 'public/symbols/XcheckLogoIcon.png' });                   
                    win.loadURL(docUrl);
                }
            })
            .appendTo(container);
    }
    referencesColumns.push(column);

    $("#propertyCalloutRefGrid" + this.CheckType).dxDataGrid({
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
}

PropertyCallout.prototype.LoadComments = function (comments, componentId, currentSrc) {
    var _this = this;

    document.getElementById("commentsArea" + this.CheckType).innerHTML = "";

    // Comments page
    $("#commentInput" + this.CheckType).dxTextArea({
        height: "60px",
        valueChangeEvent: "keyup",
        onChange: function (e) {
        },
        onEnterKey: function (e) {           
            if(!e.jQueryEvent.shiftKey)
            {
                _this.AddComment(componentId, currentSrc, comments);
            }
        },
        onKeyDown: function (e) {
            if (e.jQueryEvent.which == 13 && 
                !e.jQueryEvent.shiftKey) {
                e.jQueryEvent.preventDefault();
            }
        }
    });

    document.getElementById("addCommentBtn" + this.CheckType).onclick = function () {
        _this.AddComment(componentId, currentSrc, comments);
    }

    // restore comments
    if (comments && comments.length > 0) {
        for (var i = 0; i < comments.length; i++) {
            this.ShowComment(comments[i]);
        }
    }

    //Create search control
    $("#propertyCalloutSearchText" + this.CheckType).dxTextArea({
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

    document.getElementById("propertyCalloutSearchBtn" + this.CheckType).onclick = function () {
        _this.Search();
    }
}

PropertyCallout.prototype.AddComment = function (componentId, currentSrc, comments) {
    if (!componentId) {
        return;
    }

    var _this = this;

    var commentInput = $('#commentInput' + this.CheckType).dxTextArea('instance');
    var value = commentInput.option('value');
    commentInput.reset();
    if (!value || value === "") {
        return;
    }

    ReferenceManager.processCommentForComponentIds(value, [componentId], currentSrc).then(function (commentData) {
        if (!commentData) {
            return;
        }

        _this.ShowComment(commentData);

        if (_this.CheckType.toLowerCase() === "comparison") {
            comments.push(commentData);
        }
    });
}

PropertyCallout.prototype.ShowComment = function (commentData) {

    var commentsArea = document.getElementById("commentsArea" + this.CheckType);

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

PropertyCallout.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#e6e8e8";
}

PropertyCallout.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}

PropertyCallout.prototype.Search = function () {

    var searchInput = $('#propertyCalloutSearchText' + this.CheckType).dxTextArea('instance');
    var searchText = searchInput.option('value');

    var targetDiv = document.getElementById("commentsArea" + this.CheckType);
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