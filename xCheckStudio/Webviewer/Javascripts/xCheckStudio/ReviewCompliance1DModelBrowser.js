function ReviewCompliance1DModelBrowser(id,
    sourceFileName,
    checkData) {
    // call super constructor
    ReviewModelBrowser.call(this, id, sourceFileName);

    this.CheckData = checkData;
    this.ModelTreeData = [];

    this.TreeInstance;

    this.CheckComponents;
}

// assign ReviewModelBrowser's method to this class
ReviewCompliance1DModelBrowser.prototype = Object.create(ReviewModelBrowser.prototype);
ReviewCompliance1DModelBrowser.prototype.constructor = ReviewCompliance1DModelBrowser;

ReviewCompliance1DModelBrowser.prototype.Is1D = function () {
    return true;
}

ReviewCompliance1DModelBrowser.prototype.GetTableDivId = function () {
    return this.SourceFileName.replace(/\W/g, '_') + "_" + Compliance.MainReviewContainer;
}

ReviewCompliance1DModelBrowser.prototype.GetSelectionManager = function () {
    var browser = model.checks["compliance"]["modelBrowsers"][this.SourceFileName];
    return browser["selectionManager"];
}

ReviewCompliance1DModelBrowser.prototype.GetViewer = function () {
    var browser = model.checks["compliance"]["modelBrowsers"][this.SourceFileName];
    return browser["viewer"];
}

ReviewCompliance1DModelBrowser.prototype.AddModelBrowser = function (complianceComponents) {
    this.CheckComponents = complianceComponents;

    var headers = this.CreateHeaders();


    for (var key in complianceComponents) {
        this.CreateBrowserData(complianceComponents[key])
    }

    this.LoadTable(headers);
}

ReviewCompliance1DModelBrowser.prototype.CreateHeaders = function () {
    var columnHeaders = [];
    for (var i = 0; i < Object.keys(Compliance1DBrowserColumns).length; i++) {

        var columnHeader = {};
        var caption;
        var dataField;
        var width;
        var visible = true


        if (i === Compliance1DBrowserColumns.Component) {
            caption = Compliance1DBrowserNames.Component;
            dataField = Compliance1DBrowserNames.Component;
            width = "30%";
        }
        else if (i === Compliance1DBrowserColumns.MainClass) {
            caption = Compliance1DBrowserNames.MainClass;
            dataField = Compliance1DBrowserNames.MainClass;
            width = "25%";
        }
        else if (i === Compliance1DBrowserColumns.SubClass) {
            caption = Compliance1DBrowserNames.SubClass;
            dataField = Compliance1DBrowserNames.SubClass;
            width = "25%";
        }
        else if (i === Compliance1DBrowserColumns.Status) {
            caption = Compliance1DBrowserNames.Status;
            dataField = Compliance1DBrowserNames.Status;
            width = "20%";
            visible = true;
        }
        else if (i === Compliance1DBrowserColumns.ResultId) {
            caption = Compliance1DBrowserNames.ResultId;
            dataField = Compliance1DBrowserNames.ResultId;
            width = "0%";
            visible = false;
        }
        else if (i === Compliance1DBrowserColumns.GroupId) {
            caption = Compliance1DBrowserNames.GroupId;
            dataField = Compliance1DBrowserNames.GroupId;
            width = "0%";
            visible = false;
        }
        else if (i === Compliance1DBrowserColumns.Parent) {
            caption = Compliance1DBrowserNames.Parent;
            dataField = Compliance1DBrowserNames.Parent;
            width = "0%";
            visible = false;
        }
        else if (i === Compliance1DBrowserColumns.Id) {
            caption = Compliance1DBrowserNames.Id;
            dataField = Compliance1DBrowserNames.Id;
            width = "0%";
            visible = false;
        }

        columnHeader["caption"] = caption;
        columnHeader["dataField"] = dataField;
        columnHeader["width"] = width;

        if (visible == false) {
            columnHeader["visible"] = visible;
        }
        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}

ReviewCompliance1DModelBrowser.prototype.CreateBrowserData = function (component) {
    tableRowContent = {};
    tableRowContent[Compliance1DBrowserNames.Component] = component.Name;
    tableRowContent[Compliance1DBrowserNames.MainClass] = component.MainClass;
    tableRowContent[Compliance1DBrowserNames.SubClass] = component.SubClass;
    tableRowContent[Compliance1DBrowserNames.Status] = component.Status;
    tableRowContent[Compliance1DBrowserNames.Id] = (component.Id && component.Id != "") ? Number(component.Id) : "";
    tableRowContent[Compliance1DBrowserNames.ResultId] = (component.ResultId && component.ResultId != "") ? Number(component.ResultId) : "";
    tableRowContent[Compliance1DBrowserNames.GroupId] = (component.GroupId && component.GroupId != "") ? Number(component.GroupId) : "";
    tableRowContent[Compliance1DBrowserNames.Parent] = 0;
    this.ModelTreeData.push(tableRowContent);
}

ReviewCompliance1DModelBrowser.prototype.LoadTable = function (headers) {
    var _this = this;
    var container = "#" + this.GetTableDivId();
    $(container).dxTreeList({
        dataSource: _this.ModelTreeData,
        keyExpr: Compliance1DBrowserNames.Id,
        parentIdExpr: Compliance1DBrowserNames.Parent,
        columns: headers,
        columnAutoWidth: true,
        columnResizingMode: 'widget',
        wordWrapEnabled: false,
        showBorders: true,
        // height: "100%",
        // width: "100%",
        scrolling: "standard",
        allowColumnResizing: true,
        hoverStateEnabled: true,
        filterRow: {
            visible: true
        },
        selection: {
            mode: "multiple",
            recursive: true
        },
        onContentReady: function (e) {
            _this.TreeInstance = e.component;
            _this.AddTableContentCount(container.replace("#", ""));
        },
        onRowClick: function (e) {
            _this.GetSelectionManager().MaintainHighlightedRow(e.rowElement[0], container, e.key);

            _this.OnComponentRowClicked(e.data);
        },
        onRowPrepared: function (e) {
            if (e.rowType !== "data") {
                return;
            }

            var selectionManager = _this.GetSelectionManager();
            var highlightedRow = selectionManager.GetHighlightedRow();
            if (highlightedRow &&
                highlightedRow["rowKey"] === e.key) {
                selectionManager.ApplyHighlightColor(e.rowElement[0]);
            }
            else {
                selectionManager.ChangeBackgroundColor(e.rowElement[0], e.data[Compliance1DBrowserNames.Status]);
            }
        }
    });
}

ReviewCompliance1DModelBrowser.prototype.AddTableContentCount = function (containerId) {
    var countDiv = document.getElementById(containerId + "_child");
    if (countDiv) {
        return;
    }
    else {
        var modelBrowserData = document.getElementById(containerId);

        var modelBrowserDataTable = modelBrowserData.children[0];

        // var countBox;
        var div2 = document.createElement("DIV");
        var id = containerId + "_child";
        div2.id = id;
        div2.style.fontSize = "13px";

        var rowCount = this.ModelTreeData.length;
        div2.innerHTML = "Count :" + rowCount;
        modelBrowserDataTable.appendChild(div2);
    }
}

ReviewCompliance1DModelBrowser.prototype.OnComponentRowClicked = function (rowData) {

    this.LoadDetailedTable(rowData);

    this.HighlightInViewer(rowData);
}

ReviewCompliance1DModelBrowser.prototype.LoadDetailedTable = function (rowData) {
    var componentId = rowData.ResultId;
    var groupId = rowData.GroupId;
    if (!componentId || componentId === "" ||
        !groupId || groupId === "") {
        this.DestroyDetailedInfoTable();
        return;
    }

    var component = this.GetCheckComponent(groupId, componentId);

    var columnHeaders = this.CreatePropertiesTableHeader();

    // show component class name as property in detailed review table    
    var tableData = this.CreateDetailedTableData(component);
    if (!tableData) {
        return;
    }

    this.LoadDetailedInfoTable(columnHeaders, tableData);
}

ReviewCompliance1DModelBrowser.prototype.DestroyDetailedInfoTable = function () {

    var table = document.getElementById(Compliance.DetailInfoContainer);

    //Destroy dxDataGrid
    if (table.children.length > 0) {
        var tableContainer = "#" + Compliance.DetailInfoContainer;
        $(tableContainer).dxDataGrid("dispose");
        $(tableContainer).remove()
    }

    var detailInfoContainer = document.getElementById("complianceDetailInfoContainer");
    var tableDiv = document.createElement("div");
    tableDiv.id = Compliance.DetailInfoContainer;
    detailInfoContainer.appendChild(tableDiv);
}

ReviewCompliance1DModelBrowser.prototype.CreatePropertiesTableHeader = function () {
    var columns = [];
    for (var i = 0; i < Object.keys(ComplianceBrowserDetailedColumns).length; i++) {

        var caption;
        var dataField;
        var width;
        if (i === ComplianceBrowserDetailedColumns.PropertyName) {
            caption = ComplianceBrowserDetailedNames.PropertyName;
            dataField = ComplianceBrowserDetailedNames.PropertyName;
            width = "35%";
        }
        else if (i === ComplianceBrowserDetailedColumns.PropertyValue) {
            caption = ComplianceBrowserDetailedNames.PropertyValue;
            dataField = ComplianceBrowserDetailedNames.PropertyValue;
            width = "35%";
        }
        else if (i === ComplianceBrowserDetailedColumns.Status) {
            caption = ComplianceBrowserDetailedNames.Status;
            dataField = ComplianceBrowserDetailedNames.Status;
            width = "30%";
        }

        var headerGroupComp = {}
        headerGroupComp["caption"] = caption;
        headerGroupComp["dataField"] = dataField;
        headerGroupComp["width"] = width;

        columns.push(headerGroupComp);
    }

    var columnHeaders = [];
    var columnHeader = {}
    columnHeader["caption"] = this.SourceFileName;
    columnHeader["columns"] = columns;
    columnHeaders.push(columnHeader)

    return columnHeaders;
}

ReviewCompliance1DModelBrowser.prototype.CreateDetailedTableData = function (component) {
    var property;
    var tableData = [];
    for (var propertyId in component.properties) {
        property = component.properties[propertyId];

        var tableRowContent = {};

        tableRowContent[ComplianceBrowserDetailedNames.PropertyName] = property.name;
        tableRowContent[ComplianceBrowserDetailedNames.PropertyValue] = property.value;
        tableRowContent[ComplianceBrowserDetailedNames.Status] = property.severity;

        tableData.push(tableRowContent);
    }

    return tableData;
}

ReviewCompliance1DModelBrowser.prototype.LoadDetailedInfoTable = function (columnHeaders, tableData) {
    var tableContainer = "#" + Compliance.DetailInfoContainer;
    var _this = this;

    $(function () {
        $(tableContainer).dxDataGrid({
            dataSource: tableData,
            columns: columnHeaders,
            columnAutoWidth: true,
            columnResizingMode: 'widget',
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            allowColumnResizing: true,
            hoverStateEnabled: true,
            filterRow: {
                visible: true
            },
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always",
                recursive: true
            },
            scrolling: {
                mode: "standard"
            },
            paging: {
                enabled: false
            },
            onContentReady: function (e) {

            },
            onInitialized: function (e) {

            },
            onCellPrepared: function (e) {
                if (e.rowType == "header") {
                    e.cellElement.css("text-align", "center");
                    e.cellElement.css("color", "black");
                    e.cellElement.css("font-weight", "bold");
                }
            },
            onSelectionChanged: function (e) {

            },
            onRowClick: function (e) {
            },
            onRowPrepared: function (e) {
                if (e.rowType !== "data") {
                    return;
                }

                _this.GetSelectionManager().ChangeBackgroundColor(e.rowElement[0], e.data[ComplianceBrowserDetailedNames.Status]);
            }
        });
    });
};

ReviewCompliance1DModelBrowser.prototype.GetCheckComponent = function (groupId, componentId) {
    var checkGroup = this.GetCheckGroup(groupId);
    var component = checkGroup.components[componentId];

    return component;
}

ReviewCompliance1DModelBrowser.prototype.GetCheckGroup = function (groupId) {
    return this.CheckData.results[groupId];
}

ReviewCompliance1DModelBrowser.prototype.Destroy = function () {

    $("#" + this.GetTableDivId()).remove()
    //Destroy accordion

    var complianceTableData = document.getElementById(Compliance.MainReviewContainer).innerHTML;
    if (complianceTableData !== "") {
        $("#" + Compliance.MainReviewContainer).dxAccordion("dispose");
        complianceTableData = "";
    }

    this.DestroyDetailedInfoTable();

    var viewerInterface = this.GetViewer();
    viewerInterface.Destroy();
}

ReviewCompliance1DModelBrowser.prototype.HighlightInViewer = function (rowData) {

    var viewerInterface = this.GetViewer();

    if (viewerInterface) {
        var componentStatusList = {};
        for (var componentId in viewerInterface.SourceComponents[rowData.Category]) {
            if (componentId in this.CheckComponents) {
                var checkComponent = this.CheckComponents[componentId];
                componentStatusList[checkComponent.Name] = checkComponent.Status;
            }
        }

        viewerInterface.HighlightComponent(rowData, componentStatusList);
    }
}

ReviewCompliance1DModelBrowser.prototype.HighlightComponent = function (rowData, highlightFurther) {
    var browserInstance = $("#" + this.GetTableDivId()).dxTreeList("instance");
    var rows = browserInstance.getVisibleRows()

    var rowIndex = -1;
    var rowKey = -1
    var completeRowData;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.data.Item === rowData.Item &&
            row.data.Category === rowData.Category &&
            row.data.Class === rowData.Class) {

            rowIndex = row.rowIndex;
            rowKey = row.key;
            completeRowData = row.data;
            break;
        }
    }
    if (!completeRowData ||
        rowIndex === -1 ||
        rowKey === -1) {
        return;
    }

    var rowElement = browserInstance.getRowElement(rowIndex);

    this.GetSelectionManager().MaintainHighlightedRow(rowElement[0], "#" + this.GetTableDivId(), rowKey);


    expandModelBrowserAccordion(this.SourceFileName, "#" + Compliance.MainReviewContainer).then(function (result) {
        // scroll to row
        document.getElementById(Compliance.MainReviewContainer).scrollTop = rowElement[0].offsetTop - rowElement[0].offsetHeight;
    });

    // load detailed table
    this.LoadDetailedTable(completeRowData);
}