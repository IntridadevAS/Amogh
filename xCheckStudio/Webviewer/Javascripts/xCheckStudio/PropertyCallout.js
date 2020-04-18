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

    document.getElementById("propertyCalloutStatusBar" + _this.Id).children[0].innerText = "";
    
    document.getElementById("propertyCallout" + this.Id).onclick = function () {
        if (this.classList.contains("propertyCalloutOpen")) {
            this.classList.remove("propertyCalloutOpen");

            document.getElementById("propertyCalloutContainer" + _this.Id).style.display = "none";
            document.getElementById("propertyCalloutContainer" + _this.Id).style.width = "0%";
        } else {
            this.classList.add("propertyCalloutOpen");

            document.getElementById("propertyCalloutContainer" + _this.Id).style.display = "block";
            document.getElementById("propertyCalloutContainer" + _this.Id).style.width = "25%";        }
    }
}

PropertyCallout.prototype.Update = function (componentName,
                                             componentId,
                                             properties, 
                                             references,
                                             commentsData) {

    var _this = this;  
       
   
    $("#propertyCalloutContainer" + this.Id).dxTabPanel({
        dataSource: [
            { title: "Properties", template: "tab1" },
            { title: "References", template: "tab2"  },
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
         var value =options.data.Value;
         var type =options.data.Type;
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
        onChange: function (e) {          
        }
    });

    document.getElementById("addCommentBtn" + this.Id).onclick = function () {
        if (!componentId) {
            return;
        }

        var commentInput = $('#commentInput' + _this.Id).dxTextArea('instance');
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

    // restore comments
    if (commentsData && commentsData.length > 0) {
        for (var i = 0; i < commentsData.length; i++) {
            this.ShowComment(commentsData[i]);
        }
    }

    document.getElementById("propertyCalloutStatusBar" + _this.Id).children[0].textContent = componentName;
}

PropertyCallout.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#e6e8e8";
}

PropertyCallout.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}

PropertyCallout.prototype.ShowComment = function (commentData) {
    // var referenceIFrame = document.getElementById("referenceIFrame");
    // if (!referenceIFrame) {
    //     return;
    // }

    // var commentsList = referenceIFrame.contentDocument.getElementById("commentsList");
    // if (!commentsList) {
    //     return;
    // }

    var commentsArea = document.getElementById("commentsArea" + this.Id);

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