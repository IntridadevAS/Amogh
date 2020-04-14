function PropertyCallout(id) {
    this.Id = id;

    this.Init();

    this.SelectedRowKey = {
        "properties": undefined,
        "references": undefined,
        "comments": undefined
    }
}

PropertyCallout.prototype.Init = function () {
    var _this = this;
    document.getElementById("propertyCallout" + this.Id).onclick = function () {
        if (this.classList.contains("propertyCalloutOpen")) {
            this.classList.remove("propertyCalloutOpen");

            document.getElementById("propertyCalloutContainer" + _this.Id).style.display = "none";
            document.getElementById("propertyCalloutContainer" + _this.Id).style.width = "0%";
        } else {
            this.classList.add("propertyCalloutOpen");

            document.getElementById("propertyCalloutContainer" + _this.Id).style.display = "block";
            document.getElementById("propertyCalloutContainer" + _this.Id).style.width = "25%";
        }
    }
}

PropertyCallout.prototype.Update = function (properties, references) {

    var _this = this;

    $("#propertyCalloutContainer" + this.Id).dxTabPanel({
        dataSource: [
            { title: "Properties", template: "tab1" },
            { title: "References", template: "tab2" },
        ],
        deferRendering: false
    });

    $("#propertyCalloutPropGrid" + this.Id).dxDataGrid({
        dataSource: properties,
        height: "100%",
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

    $("#propertyCalloutRefGrid" + this.Id).dxDataGrid({
        dataSource: references,
        height: "100%",
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

            // open reference
            const BrowserWindow = require('electron').remote.BrowserWindow;
            win = new BrowserWindow({ title: 'xCheckStudio', frame: true, show: true, icon: 'public/symbols/XcheckLogoIcon.png' });
            if (e.data.type.toLowerCase() === "web address") {
                win.loadURL(e.data.value);
            }
            else if (e.data.type.toLowerCase() === "image" ||
                e.data.type.toLowerCase() === "document") {
                var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

                const path = require("path");
                var docUrl = path.join(window.location.origin, "Projects", projectinfo.projectname, "CheckSpaces", checkinfo.checkname, e.data.value);
                win.loadURL(docUrl);
            }
        }
    });
}

PropertyCallout.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#e6e8e8";
}

PropertyCallout.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}