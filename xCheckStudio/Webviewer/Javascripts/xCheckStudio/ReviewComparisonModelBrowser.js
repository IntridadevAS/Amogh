function ReviewComparisonModelBrowser(sourceFileName, checkData) {
    // call super constructor
    ReviewModelBrowser.call(this, sourceFileName);

    this.CheckData = checkData;
    this.ModelTreeData = [];

    this.SelectionManager = new ReviewModelBrowserSelectionManager();
}

// assign ReviewModelBrowser's method to this class
ReviewComparisonModelBrowser.prototype = Object.create(ReviewModelBrowser.prototype);
ReviewComparisonModelBrowser.prototype.constructor = ReviewComparisonModelBrowser;

ReviewComparisonModelBrowser.prototype.GetTableDivId = function () {
    return this.SourceFileName.replace(/\W/g, '_') + "_" + Comparison.MainReviewContainer;
}

ReviewComparisonModelBrowser.prototype.AddModelBrowser = function (comparisonComponents) {
    var parentTable = document.getElementById(Comparison.MainReviewContainer);
    var btn = this.CreateCheckGroupButton(this.SourceFileName);
    parentTable.appendChild(btn);

    var div = document.createElement("DIV");
    div.className = "content scrollable";
    div.id = this.GetTableDivId();
    // div.id =  "Plant03";
    div.style.display = "none";
    parentTable.appendChild(div);

    var headers = this.CreateHeaders();


    for (var key in comparisonComponents) {
        this.CreateBrowserData(comparisonComponents[key], 0)
    }

    this.LoadTable(headers);
}

ReviewComparisonModelBrowser.prototype.CreateHeaders = function () {
    var columnHeaders = [];
    for (var i = 0; i < Object.keys(ComparisonBrowserColumns).length; i++) {

        var columnHeader = {};
        var caption;
        var dataField;
        var width;
        var visible = true

        if (i === ComparisonBrowserColumns.Select) {
            continue;
        }
        else if (i === ComparisonBrowserColumns.Component) {
            caption = ComparisonBrowserNames.Component;
            dataField = ComparisonBrowserNames.Component;
            width = "30%";
        }
        else if (i === ComparisonBrowserColumns.MainClass) {
            caption = ComparisonBrowserNames.MainClass;
            dataField = ComparisonBrowserNames.MainClass;
            width = "25%";
        }
        else if (i === ComparisonBrowserColumns.SubClass) {
            caption = ComparisonBrowserNames.SubClass;
            dataField = ComparisonBrowserNames.SubClass;
            width = "25%";
        }
        else if (i === ComparisonBrowserColumns.Status) {
            caption = ComparisonBrowserNames.Status;
            dataField = ComparisonBrowserNames.Status;
            width = "20%";
            visible = true;
        }
        else if (i === ComparisonBrowserColumns.NodeId) {
            caption = ComparisonBrowserNames.NodeId;
            dataField = ComparisonBrowserNames.NodeId;
            width = "0%";
            visible = false;
        }
        else if (i === ComparisonBrowserColumns.ResultId) {
            caption = ComparisonBrowserNames.ResultId;
            dataField = ComparisonBrowserNames.ResultId;
            width = "0%";
            visible = false;
        }
        else if (i === ComparisonBrowserColumns.GroupId) {
            caption = ComparisonBrowserNames.GroupId;
            dataField = ComparisonBrowserNames.GroupId;
            width = "0%";
            visible = false;
        }
        else if (i === ComparisonBrowserColumns.Parent) {
            caption = ComparisonBrowserNames.Parent;
            dataField = ComparisonBrowserNames.Parent;
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

ReviewComparisonModelBrowser.prototype.CreateBrowserData = function (component, parentNode) {
    tableRowContent = {};
    tableRowContent[ComparisonBrowserNames.Component] = component.Name;
    tableRowContent[ComparisonBrowserNames.MainClass] = component.MainClass;
    tableRowContent[ComparisonBrowserNames.SubClass] = component.SubClass;
    tableRowContent[ComparisonBrowserNames.Status] = component.Status;
    tableRowContent[ComparisonBrowserNames.NodeId] = (component.NodeId != undefined && component.NodeId != "") ? component.NodeId : "";
    tableRowContent[ComparisonBrowserNames.ResultId] = component.Id;
    tableRowContent[ComparisonBrowserNames.GroupId] = component.GroupId;
    tableRowContent[ComparisonBrowserNames.Parent] = parentNode;
    this.ModelTreeData.push(tableRowContent);

    if (component.Children && component.Children.length > 0) {
        for (var i = 0; i < component.Children.length; i++) {
            this.CreateBrowserData(component.Children[i], component.NodeId);
        }
    }
}

ReviewComparisonModelBrowser.prototype.LoadTable = function (headers) {
    var _this = this;
    var container = "#" + this.GetTableDivId();
    $(container).dxTreeList({
        dataSource: _this.ModelTreeData,
        keyExpr: ComparisonBrowserNames.NodeId,
        parentIdExpr: ComparisonBrowserNames.Parent,
        columns: headers,
        columnAutoWidth: true,
        wordWrapEnabled: false,
        showBorders: true,
        height: "100%",
        width: "100%",
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
            // _this.HighlightRowByCheckStatus(container);
        },
        onInitialized: function (e) {

        },
        onSelectionChanged: function (e) {

        },
        onRowClick: function (e) {
            _this.OnComponentRowClicked(e.data);
        },
        onRowPrepared: function (e) {
            if (e.rowType !== "data") {
                return;
            }

            _this.SelectionManager.ChangeBackgroundColor(e.rowElement[0], e.data[ComparisonBrowserNames.Status]);
            // _this.HighlightRowByCheckStatus(container);
        }
    });
}

ReviewComparisonModelBrowser.prototype.CreateCheckGroupButton = function (title) {

    var btn = document.createElement("BUTTON");
    btn.className = "accordion";
    btn.style.justifyContent = "center";
    btn.style.color = "white";
    btn.style.width = "100%";
    var t = document.createTextNode(title);       // Create a text node
    btn.appendChild(t);
    return btn;
}

ReviewComparisonModelBrowser.prototype.OnComponentRowClicked = function (rowData) {
    this.LoadDetailedTable(rowData);
}

ReviewComparisonModelBrowser.prototype.LoadDetailedTable = function (rowData) {
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
    var tableData = this.CreateTableData(component.properties);
    if (!tableData) {
        return;
    }

    this.LoadDetailedInfoTable(columnHeaders, tableData);
}

ReviewComparisonModelBrowser.prototype.GetCheckComponent = function (groupId, componentId) {
    var checkGroup = this.GetCheckGroup(groupId);
    var component = checkGroup.components[componentId];

    return component;
}

ReviewComparisonModelBrowser.prototype.GetCheckGroup = function (groupId) {
    return this.CheckData.results[groupId];
}

ReviewComparisonModelBrowser.prototype.CreatePropertiesTableHeader = function () {
    var columns = [];
    for (var i = 0; i < Object.keys(ComparisonBrowserDetailedColumns).length; i++) {

        var caption;
        var dataField;
        var width;
        if (i === ComparisonBrowserDetailedColumns.PropertyName) {
            caption = ComparisonBrowserDetailedNames.PropertyName;
            dataField = ComparisonBrowserDetailedNames.PropertyName;
            width = "35%";
        }
        else if (i === ComparisonBrowserDetailedColumns.PropertyValue) {
            caption = ComparisonBrowserDetailedNames.PropertyValue;
            dataField = ComparisonBrowserDetailedNames.PropertyValue;
            width = "35%";
        }
        else if (i === ComparisonBrowserDetailedColumns.Status) {
            caption = ComparisonBrowserDetailedNames.Status;
            dataField = ComparisonBrowserDetailedNames.Status;
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

ReviewComparisonModelBrowser.prototype.CreateTableData = function (properties) {

    var src;
    if (this.SourceFileName === this.CheckData.sources[0]) {
        src = "a";
    }
    else if (this.SourceFileName === this.CheckData.sources[1]) {
        src = "b";
    }
    else {
        return undefined;
    }

    var property;
    var tableData = [];
    for (var propertyId in properties) {
        property = properties[propertyId];

        var tableRowContent = {};

        if (src === "a") {
            tableRowContent[ComparisonBrowserDetailedNames.PropertyName] = property.sourceAName;
            tableRowContent[ComparisonBrowserDetailedNames.PropertyValue] = property.sourceAValue;
        }
        else if (src === "b") {
            tableRowContent[ComparisonBrowserDetailedNames.PropertyName] = property.sourceBName;
            tableRowContent[ComparisonBrowserDetailedNames.PropertyValue] = property.sourceBValue;
        }

        if (!tableRowContent[ComparisonBrowserDetailedNames.PropertyName] ||
            tableRowContent[ComparisonBrowserDetailedNames.PropertyName] === "") {
            continue;
        }

        tableRowContent[ComparisonBrowserDetailedNames.Status] = property.severity;

        tableData.push(tableRowContent);
    }

    return tableData;
}

ReviewComparisonModelBrowser.prototype.LoadDetailedInfoTable = function (columnHeaders, tableData) {
    var tableContainer = "#" + Comparison.DetailInfoContainer;
    var _this = this;

    // var height =  document.getElementById("tableDataComparison").offsetHeight / 2 + "px";
    $(function () {
        $(tableContainer).dxDataGrid({
            dataSource: tableData,
            columns: columnHeaders,
            columnAutoWidth: true,
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
                // _this.highlightDetailedReviewTableFromCheckStatus(_this.DetailedReviewTableContainer)
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
                // model.getCurrentSelectionManager().MaintainHighlightedDetailedRow(e.rowElement[0]);
            },
            onRowPrepared: function (e) {
                if (e.rowType !== "data") {
                    return;
                }

                _this.SelectionManager.ChangeBackgroundColor(e.rowElement[0], e.data[ComparisonBrowserDetailedNames.Status]);
            }
        });
    });
};

ReviewComparisonModelBrowser.prototype.DestroyDetailedInfoTable = function () {
    
    var table = document.getElementById(Comparison.DetailInfoContainer);
    //Destroy dxDataGrid
    if (table.children.length > 0) {
        var tableContainer = "#" + Comparison.DetailInfoContainer;
        $(tableContainer).dxDataGrid("dispose");
        $(tableContainer).remove()
    }

    var comparisonDetailInfoContainer = document.getElementById("comparisonDetailInfoContainer");
    var tableDiv = document.createElement("div");
    tableDiv.id = Comparison.DetailInfoContainer;
    comparisonDetailInfoContainer.appendChild(tableDiv);
}
// ReviewComparisonModelBrowser.prototype.HighlightRowByCheckStatus = function (containerId) {
//     var modelTree = $(containerId).dxTreeList("instance");
//     var rows = modelTree.getVisibleRows();

//     for (var i = 0; i < rows.length; i++) {
//         var currentRow = modelTree.getRowElement(rows[i].rowIndex);
//         // if (currentRow[0].cells.length < 3) {
//         //     return;
//         // }

//         var status = modelTree.cellValue(rows[i].rowIndex, ComparisonBrowserNames.Status)
//         this.SelectionManager.ChangeBackgroundColor(currentRow[0], status);
//     }
// }