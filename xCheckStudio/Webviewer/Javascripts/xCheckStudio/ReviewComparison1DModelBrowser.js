function ReviewComparison1DModelBrowser(id,
    sourceFileName,
    checkData) {

    // call super constructor
    ReviewModelBrowser.call(this, id, sourceFileName);

    this.CheckData = checkData;
    this.ModelTreeData = [];

    this.CheckComponents;
}

// assign ReviewModelBrowser's method to this class
ReviewComparison1DModelBrowser.prototype = Object.create(ReviewModelBrowser.prototype);
ReviewComparison1DModelBrowser.prototype.constructor = ReviewComparison1DModelBrowser;

ReviewComparison1DModelBrowser.prototype.Is1D = function () {
    return true;
}

ReviewComparison1DModelBrowser.prototype.GetTableDivId = function () {
    return this.SourceFileName.replace(/\W/g, '') + "_" + this.Id + "_" + Comparison.MainReviewContainer;
}

ReviewComparison1DModelBrowser.prototype.GetSelectionManager = function () {
    var browser = model.checks["comparison"]["modelBrowsers"][this.SourceFileName];
    return browser["selectionManager"];
}

ReviewComparison1DModelBrowser.prototype.GetViewer = function () {
    var browser = model.checks["comparison"]["modelBrowsers"][this.SourceFileName];
    return browser["viewer"];
}

ReviewComparison1DModelBrowser.prototype.AddModelBrowser = function (comparisonComponents) {
    this.CheckComponents = comparisonComponents;

    var headers = this.CreateHeaders();


    for (var key in comparisonComponents) {
        this.CreateBrowserData(comparisonComponents[key])
    }

    this.LoadTable(headers);
}

ReviewComparison1DModelBrowser.prototype.CreateHeaders = function () {
    var columnHeaders = [];
    for (var i = 0; i < Object.keys(Comparison1DBrowserColumns).length; i++) {

        var columnHeader = {};
        var caption;
        var dataField;
        var width;
        var visible = true


        if (i === Comparison1DBrowserColumns.Component) {
            caption = Comparison1DBrowserNames.Component;
            dataField = Comparison1DBrowserNames.Component;
            width = "30%";
        }
        else if (i === Comparison1DBrowserColumns.MainClass) {
            caption = Comparison1DBrowserNames.MainClass;
            dataField = Comparison1DBrowserNames.MainClass;
            width = "25%";
        }
        else if (i === Comparison1DBrowserColumns.SubClass) {
            caption = Comparison1DBrowserNames.SubClass;
            dataField = Comparison1DBrowserNames.SubClass;
            width = "25%";
        }
        else if (i === Comparison1DBrowserColumns.Status) {
            caption = Comparison1DBrowserNames.Status;
            dataField = Comparison1DBrowserNames.Status;
            width = "20%";
            visible = true;
        }
        else if (i === Comparison1DBrowserColumns.ResultId) {
            caption = Comparison1DBrowserNames.ResultId;
            dataField = Comparison1DBrowserNames.ResultId;
            width = "0%";
            visible = false;
        }
        else if (i === Comparison1DBrowserColumns.GroupId) {
            caption = Comparison1DBrowserNames.GroupId;
            dataField = Comparison1DBrowserNames.GroupId;
            width = "0%";
            visible = false;
        }
        else if (i === Comparison1DBrowserColumns.Parent) {
            caption = Comparison1DBrowserNames.Parent;
            dataField = Comparison1DBrowserNames.Parent;
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

ReviewComparison1DModelBrowser.prototype.CreateBrowserData = function (component) {
    tableRowContent = {};
    tableRowContent[Comparison1DBrowserNames.Component] = component.Name;
    tableRowContent[Comparison1DBrowserNames.MainClass] = component.MainClass;
    tableRowContent[Comparison1DBrowserNames.SubClass] = component.SubClass;
    tableRowContent[Comparison1DBrowserNames.Status] = component.Status;
    tableRowContent[Comparison1DBrowserNames.Id] = (component.Id && component.Id != "") ? Number(component.Id) : "";
    tableRowContent[Comparison1DBrowserNames.ResultId] = (component.ResultId && component.ResultId != "") ? Number(component.ResultId) : "";
    tableRowContent[Comparison1DBrowserNames.GroupId] = (component.GroupId && component.GroupId != "") ? Number(component.GroupId) : "";
    tableRowContent[Comparison1DBrowserNames.Parent] = 0;
    this.ModelTreeData.push(tableRowContent);
}

ReviewComparison1DModelBrowser.prototype.LoadTable = function (headers) {
    var _this = this;
    var container = "#" + this.GetTableDivId();
    $(container).dxTreeList({
        dataSource: _this.ModelTreeData,
        keyExpr: Comparison1DBrowserNames.Id,
        parentIdExpr: Comparison1DBrowserNames.Parent,
        columns: headers,
        columnAutoWidth: true,
        columnResizingMode: 'widget',
        wordWrapEnabled: false,
        showBorders: true,
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
            _this.AddTableContentCount(container.replace("#", ""));
        },
        onInitialized: function (e) {

        },
        onSelectionChanged: function (e) {

        },
        onRowClick: function (e) {
            _this.GetSelectionManager().MaintainHighlightedRow(e.rowElement[0], container, e.key);

            var tooltipText = e.component.getCellElement(e.rowIndex, 0)[0].getAttribute("title");

            _this.OnComponentRowClicked(e.data, tooltipText);
        },
        onRowPrepared: function (e) {
            if (e.rowType !== "data") {
                return;
            }

            // add tooltip to cells
            _this.AddTooltip(e);
            var selectionManager = _this.GetSelectionManager();
            var highlightedRow = selectionManager.GetHighlightedRow();
            if (highlightedRow &&
                highlightedRow["rowKey"] === e.key) {
                selectionManager.ApplyHighlightColor(e.rowElement[0]);
            }
            else {
                selectionManager.ChangeBackgroundColor(e.rowElement[0], e.data[Comparison3DBrowserNames.Status]);
            }
        }
    });
}

ReviewComparison1DModelBrowser.prototype.AddTooltip = function (e) {
    var anotherSource;
    var anotherComponent;
    var groupID = e.node.data.GroupId;
    var ResultId = e.node.data.ResultId;
    if (!groupID || groupID === "" ||
        !ResultId || ResultId === "") {
        for (var i = 0; i < e.rowElement[0].cells.length; i++) {
            var cell = e.rowElement[0].cells[i];
            cell.setAttribute("title", "Not Mapped");
        }
    }
    else {
        var group = this.CheckData.results[groupID];
        var component = group.components[ResultId];
        if (this.Id === "a") {
            anotherSource = this.CheckData.sources[1];
            anotherComponent = component.sourceBName;
        }
        else if (this.Id === "b") {
            anotherSource = this.CheckData.sources[0];
            anotherComponent = component.sourceAName;
        }
        if (anotherSource && anotherComponent && anotherComponent !== "") {
            for (var i = 0; i < e.rowElement[0].cells.length; i++) {
                var cell = e.rowElement[0].cells[i];
                cell.setAttribute("title", "Matched with : " + anotherSource + ">" + anotherComponent);
            }
        }
    }
}

ReviewComparison1DModelBrowser.prototype.AddTableContentCount = function (containerId) {
    var countDiv = document.getElementById(containerId + "_child");
    if (countDiv) {
        return;
    }
    else {
        var modelBrowserData = document.getElementById(containerId);

        var modelBrowserDataTable = modelBrowserData.children[0];
        // var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");

        // var countBox;
        var div2 = document.createElement("DIV");
        var id = containerId + "_child";
        div2.id = id;
        div2.style.fontSize = "13px";

        // var countBox = document.getElementById(id);
        // modelBrowserTableRows contains header and search bar row as row hence count is length-1
        var rowCount = this.ModelTreeData.length;
        div2.innerHTML = "Count :" + rowCount;
        modelBrowserDataTable.appendChild(div2);
    }
}

ReviewComparison1DModelBrowser.prototype.OnComponentRowClicked = function (rowData, tooltipText) {

    this.LoadDetailedTable(rowData);

    this.HighlightInViewer(rowData);

    // highlight in another browser
    this.HighlightInAnotherBrowser(rowData);
}

ReviewComparison1DModelBrowser.prototype.HighlightInAnotherBrowser = function (rowData) {
    if (rowData.GroupId in this.CheckData.results) {
        var group = this.CheckData.results[rowData.GroupId];
        var mainClasses = group.componentClass.split("-");
        if (mainClasses.length < 2) {
            return;
        }

        if (rowData.ResultId in group.components) {
            var checkComponent = group.components[rowData.ResultId];

            var browsers = model.getModelBrowsers();
            for (var src in browsers) {
                if (src === this.SourceFileName) {
                    continue;
                }            

                var browser = browsers[src]["browser"];
                
                // unhighlight previous highlighted row, if any
                browsers[src]["selectionManager"].UnHighlightRow();
                if (browser.Is1D()) {
                    browsers[src]["viewer"].UnhighlightSheetRow();
                }
                else if (browser.Is3D()) {
                    browsers[src]["viewer"].UnHighlightComponent();
                }

                var anotherBrowserRowData = {};
                if (browser.Id === "a") {
                    if (browser.Is1D()) {
                        anotherBrowserRowData.Item = checkComponent.sourceAName
                        anotherBrowserRowData.Class = checkComponent.sourceASubComponentClass
                        anotherBrowserRowData.Category = mainClasses[0];
                    }
                    else if (browser.Is3D()) {
                        anotherBrowserRowData.NodeId = Number(checkComponent.sourceANodeId);
                    }
                    else if (browser.IsVisio()) {
                        anotherBrowserRowData.NodeId = checkComponent.sourceANodeId;
                        anotherBrowserRowData.Item =  checkComponent.sourceAName;
                    }
                }
                else if (browser.Id === "b") {
                    if (browser.Is1D()) {
                        anotherBrowserRowData.Item = checkComponent.sourceBName
                        anotherBrowserRowData.Class = checkComponent.sourceBSubComponentClass
                        anotherBrowserRowData.Category = mainClasses[1];
                    }
                    else if (browser.Is3D()) {
                        anotherBrowserRowData.NodeId = Number(checkComponent.sourceBNodeId);
                    }
                    else if (browser.IsVisio()) {
                        anotherBrowserRowData.NodeId = checkComponent.sourceBNodeId;
                        anotherBrowserRowData.Item =  checkComponent.sourceBName;
                    }
                }
                else if (browser.Id === "c") {
                    if (browser.Is1D()) {
                        anotherBrowserRowData.Item = checkComponent.sourceCName
                        anotherBrowserRowData.Class = checkComponent.sourceCSubComponentClass
                        anotherBrowserRowData.Category = mainClasses[2];
                    }
                    else if (browser.Is3D()) {
                        anotherBrowserRowData.NodeId = Number(checkComponent.sourceCNodeId);
                    }
                    else if (browser.IsVisio()) {
                        anotherBrowserRowData.NodeId = checkComponent.sourceCNodeId;
                        anotherBrowserRowData.Item =  checkComponent.sourceCName;
                    }
                }
                else if (browser.Id === "d") {
                    if (browser.Is1D()) {
                        anotherBrowserRowData.Item = checkComponent.sourceDName
                        anotherBrowserRowData.Class = checkComponent.sourceDSubComponentClass
                        anotherBrowserRowData.Category = mainClasses[3];
                    }
                    else if (browser.Is3D()) {
                        anotherBrowserRowData.NodeId = Number(checkComponent.sourceDNodeId);
                    }
                    else if (browser.IsVisio()) {
                        anotherBrowserRowData.NodeId = checkComponent.sourceDNodeId;
                        anotherBrowserRowData.Item = checkComponent.sourceDName;
                    }
                }

                if (browser.Is1D()) {
                    if (anotherBrowserRowData.Item && anotherBrowserRowData.Class && anotherBrowserRowData.Category) {
                        browser.HighlightComponent(anotherBrowserRowData, false);
                        browser.HighlightInViewer(anotherBrowserRowData);
                    }
                }
                else if (browser.Is3D()) {
                    if (anotherBrowserRowData.NodeId) {
                        browser.HighlightBrowserComponentRow(anotherBrowserRowData.NodeId, false);
                        browser.HighlightInViewer(anotherBrowserRowData);
                    }
                }
                else if (browser.IsVisio()) {
                    browser.HighlightBrowserComponentRow(anotherBrowserRowData.NodeId, false);
                    browser.HighlightInViewer(anotherBrowserRowData);
                }
            }
        }
    }
}

ReviewComparison1DModelBrowser.prototype.HighlightComponent = function (rowData, highlightFurther) {
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

    if (highlightFurther) {
        expandModelBrowserAccordion(this.SourceFileName, "#" + Comparison.MainReviewContainer).then(function (result) {
            // scroll to row
            document.getElementById(Comparison.MainReviewContainer).scrollTop = rowElement[0].offsetTop - rowElement[0].offsetHeight;
        });

        // load detailed table
        this.LoadDetailedTable(completeRowData);

        // highlight in another browser
        this.HighlightInAnotherBrowser(completeRowData);
    }
    //  // scroll to row
    //  browserInstance.getScrollable().scrollTo({ top: rowElement[0].offsetTop - rowElement[0].offsetHeight });
}

ReviewComparison1DModelBrowser.prototype.LoadDetailedTable = function (rowData) {
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

ReviewComparison1DModelBrowser.prototype.GetCheckComponent = function (groupId, componentId) {
    var checkGroup = this.GetCheckGroup(groupId);
    var component = checkGroup.components[componentId];

    return component;
}

ReviewComparison1DModelBrowser.prototype.GetCheckGroup = function (groupId) {
    return this.CheckData.results[groupId];
}

ReviewComparison1DModelBrowser.prototype.CreatePropertiesTableHeader = function () {
    var columns = [];
    for (var i = 0; i < Object.keys(ComparisonBrowserDetailedColumns).length; i++) {

        var caption;
        var dataField;
        var width;
        if (i === ComparisonBrowserDetailedColumns.PropertyName) {
            caption = ComparisonBrowserDetailedNames.PropertyName;
            dataField = ComparisonBrowserDetailedNames.PropertyName;
            width = "30%";
        }
        else if (i === ComparisonBrowserDetailedColumns.PropertyValue) {
            caption = ComparisonBrowserDetailedNames.PropertyValue;
            dataField = ComparisonBrowserDetailedNames.PropertyValue;
            width = "30%";
        }
        else if (i === ComparisonBrowserDetailedColumns.Status) {
            caption = ComparisonBrowserDetailedNames.Status;
            dataField = ComparisonBrowserDetailedNames.Status;
            width = "15%";
        }
        else if (i === ComparisonBrowserDetailedColumns.Mapping) {
            caption = ComparisonBrowserDetailedNames.Mapping;
            dataField = ComparisonBrowserDetailedNames.Mapping;
            width = "25%";
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

ReviewComparison1DModelBrowser.prototype.CreateDetailedTableData = function (component) {

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
    for (var propertyId in component.properties) {
        property = component.properties[propertyId];

        var tableRowContent = {};

        if (src === "a") {
            tableRowContent[ComparisonBrowserDetailedNames.PropertyName] = property.sourceAName;
            tableRowContent[ComparisonBrowserDetailedNames.PropertyValue] = property.sourceAValue;

            if (!component.sourceBName || component.sourceBName === "") {
                tableRowContent[ComparisonBrowserDetailedNames.Mapping] = "Not Mapped";
            }
            else {
                tableRowContent[ComparisonBrowserDetailedNames.Mapping] = this.CheckData.sources[1] + "/" + component.sourceBName + "/" + property.sourceBName;
            }
        }
        else if (src === "b") {
            tableRowContent[ComparisonBrowserDetailedNames.PropertyName] = property.sourceBName;
            tableRowContent[ComparisonBrowserDetailedNames.PropertyValue] = property.sourceBValue;

            if (!component.sourceAName || component.sourceAName === "") {
                tableRowContent[ComparisonBrowserDetailedNames.Mapping] = "Not Mapped";
            }
            else {
                tableRowContent[ComparisonBrowserDetailedNames.Mapping] = this.CheckData.sources[0] + "/" + component.sourceAName + "/" + property.sourceAName;
            }
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

ReviewComparison1DModelBrowser.prototype.LoadDetailedInfoTable = function (columnHeaders, tableData) {
    var tableContainer = "#" + Comparison.DetailInfoContainer;
    var _this = this;

    // var height =  document.getElementById("tableDataComparison").offsetHeight / 2 + "px";
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

                _this.GetSelectionManager().ChangeBackgroundColor(e.rowElement[0], e.data[ComparisonBrowserDetailedNames.Status]);
            }
        });
    });
};

ReviewComparison1DModelBrowser.prototype.DestroyDetailedInfoTable = function () {

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


ReviewComparison1DModelBrowser.prototype.HighlightInViewer = function (rowData) {

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

ReviewComparison1DModelBrowser.prototype.Destroy = function () {

    $("#" + this.GetTableDivId()).remove()
    //Destroy accordion

    var comparisonTableData = document.getElementById(Comparison.MainReviewContainer).innerHTML;
    if (comparisonTableData !== "") {
        $("#" + Comparison.MainReviewContainer).dxAccordion("dispose");
        comparisonTableData = "";
    }

    this.DestroyDetailedInfoTable();
    var viewerInterface = this.GetViewer();
    viewerInterface.Destroy();
}