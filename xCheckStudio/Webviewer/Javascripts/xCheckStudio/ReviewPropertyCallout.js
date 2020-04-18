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
            this.classList.remove("propertyCalloutOpen");

            document.getElementById("propertyCalloutContainer" + _this.CheckType).style.display = "none";
            document.getElementById("propertyCalloutContainer" + _this.CheckType).style.width = "0%";

            if (_this.CheckType.toLowerCase() === "comparison") {
                document.getElementById("propertyCalloutStatusBar" + _this.CheckType).style.display = "none";
                document.getElementById("propertyCalloutStatusBar" + _this.CheckType).style.width = "0%";
            }
        } else {
            this.classList.add("propertyCalloutOpen");

            document.getElementById("propertyCalloutContainer" + _this.CheckType).style.display = "block";
            document.getElementById("propertyCalloutContainer" + _this.CheckType).style.width = "25%";

            if (_this.CheckType.toLowerCase() === "comparison") {
                document.getElementById("propertyCalloutStatusBar" + _this.CheckType).style.display = "block";
                document.getElementById("propertyCalloutStatusBar" + _this.CheckType).style.width = "25%";
            }
        }
    }
}

PropertyCallout.prototype.UpdateForComparison = function (
    propertyCalloutData) {

    var _this = this;


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

        var firstSourceBtn = $("#firstSource").dxButton({
            // icon: "chevrondown",
            text: "1",
            width: "50px",
            height: "30px",
            onClick: function (e) {
                _this.LoadProperties(propertyCalloutData["a"].properties);
                _this.LoadReferences(propertyCalloutData["a"].references);
                _this.LoadComments(propertyCalloutData["a"].comments, propertyCalloutData["a"].componentId, "a");
                document.getElementById("propertyCalloutNameBar" + _this.CheckType).children[0].textContent = propertyCalloutData['a'].name;
            }
        }).dxButton("instance");

        firstSourceBtn["_$element"].click();
        isFirst = false;
    }
    if ("b" in propertyCalloutData) {
        var sourceDiv = document.createElement("div");
        sourceDiv.id = "secondSource";
        document.getElementById("propertyCalloutStatusBar" + _this.CheckType).appendChild(sourceDiv);

        var secondSourceBtn = $("#secondSource").dxButton({
            // icon: "chevrondown",
            text: "2",
            width: "50px",
            height: "30px",
            onClick: function (e) {
                _this.LoadProperties(propertyCalloutData["b"].properties);
                _this.LoadReferences(propertyCalloutData["b"].references);
                _this.LoadComments(propertyCalloutData["b"].comments, propertyCalloutData["b"].componentId, "b");
                document.getElementById("propertyCalloutNameBar" + _this.CheckType).children[0].textContent = propertyCalloutData['b'].name;
            }
        }).dxButton("instance");

        if (isFirst) {
            secondSourceBtn["_$element"].click();
            isFirst = false;
        }
    }
    if ("c" in propertyCalloutData) {
        var sourceDiv = document.createElement("div");
        sourceDiv.id = "thirdSource";
        document.getElementById("propertyCalloutStatusBar" + _this.CheckType).appendChild(sourceDiv);

        var thirdSourceBtn = $("#thirdSource").dxButton({
            // icon: "chevrondown",
            text: "3",
            width: "50px",
            height: "30px",
            onClick: function (e) {
                _this.LoadProperties(propertyCalloutData["c"].properties);
                _this.LoadReferences(propertyCalloutData["c"].references);
                _this.LoadComments(propertyCalloutData["c"].comments, propertyCalloutData["c"].componentId, "c");
                document.getElementById("propertyCalloutNameBar" + _this.CheckType).children[0].textContent = propertyCalloutData['c'].name;
            }
        }).dxButton("instance");

        if (isFirst) {
            thirdSourceBtn["_$element"].click();;
            isFirst = false;
        }
    }
    if ("d" in propertyCalloutData) {
        var sourceDiv = document.createElement("div");
        sourceDiv.id = "fourthSource";
        document.getElementById("propertyCalloutStatusBar" + _this.CheckType).appendChild(sourceDiv);

        var fourthSourceBtn = $("#fourthSource").dxButton({
            // icon: "chevrondown",
            text: "4",
            width: "50px",
            height: "30px",
            onClick: function (e) {
                _this.LoadProperties(propertyCalloutData["d"].properties);
                _this.LoadReferences(propertyCalloutData["d"].references);
                _this.LoadComments(propertyCalloutData["d"].comments, propertyCalloutData["d"].componentId, "d");
                document.getElementById("propertyCalloutNameBar" + _this.CheckType).children[0].textContent = propertyCalloutData['d'].name;
            }
        }).dxButton("instance");

        if (isFirst) {
            fourthSourceBtn["_$element"].click();
            isFirst = false;
        }
    }
}

PropertyCallout.prototype.UpdateForCompliance = function (
    propertyCalloutData) {
    var _this = this;


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
                win = new BrowserWindow({ title: 'xCheckStudio', frame: true, show: true, icon: 'public/symbols/XcheckLogoIcon.png' });
                if (type.toLowerCase() === "web address") {
                    win.loadURL(value);
                }
                else if (type.toLowerCase() === "image" ||
                    type.toLowerCase() === "document") {
                    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

                    const path = require("path");
                    var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, value);
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

PropertyCallout.prototype.LoadComments =function (comments, componentId, currentSrc)
{    
    var _this = this;

    document.getElementById("commentsArea" + this.CheckType).innerHTML = "";

    // Comments page
    $("#commentInput" + this.CheckType).dxTextArea({
        height: "60px",
        onChange: function (e) {
        }
    });

    document.getElementById("addCommentBtn" + this.CheckType).onclick = function () {
        if (!componentId) {
            return;
        }

        var commentInput = $('#commentInput' + _this.CheckType).dxTextArea('instance');
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

    // restore comments
    if (comments && comments.length > 0) {
        for (var i = 0; i < comments.length; i++) {
            this.ShowComment(comments[i]);
        }
    }   
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
    commentorDiv.style.textAlign = "right";
    dataContainer.appendChild(commentorDiv);

    var commentDiv = document.createElement("div");
    commentDiv.textContent = commentData.value;
    commentDiv.style.fontSize = "11px";
    dataContainer.appendChild(commentDiv);

    var timeDiv = document.createElement("div");
    timeDiv.textContent = commentData.date;
    timeDiv.style.fontSize = "10px";
    timeDiv.style.textAlign = "right";
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