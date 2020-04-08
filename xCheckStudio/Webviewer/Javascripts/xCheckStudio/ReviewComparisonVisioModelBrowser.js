function ReviewComparisonVisioModelBrowser(id,
    sourceFileName,
    checkData) {
    // call super constructor
    ReviewModelBrowser.call(this, id, sourceFileName);

    this.CheckData = checkData;
    this.ModelTreeData = [];

    this.NodeIdvsCheckComponent = {};
    this.NodeParentList = {};

    this.TreeInstance;

    this.Components;
}

// assign ReviewModelBrowser's method to this class
ReviewComparisonVisioModelBrowser.prototype = Object.create(ReviewModelBrowser.prototype);
ReviewComparisonVisioModelBrowser.prototype.constructor = ReviewComparisonVisioModelBrowser;

ReviewComparisonVisioModelBrowser.prototype.IsVisio = function () {
    return true;
}

ReviewComparisonVisioModelBrowser.prototype.GetTableDivId = function () {
    return this.SourceFileName.replace(/\W/g, '_') + "_" + Comparison.MainReviewContainer;
}

ReviewComparisonVisioModelBrowser.prototype.GetSelectionManager = function () {
    var browser = model.checks["comparison"]["modelBrowsers"][this.SourceFileName];
    return browser["selectionManager"];
}

ReviewComparisonVisioModelBrowser.prototype.GetViewer = function () {
    var browser = model.checks["comparison"]["modelBrowsers"][this.SourceFileName];
    return browser["viewer"];
}
ReviewComparisonVisioModelBrowser.prototype.AddModelBrowser = function (comparisonComponents) {
    this.Components = comparisonComponents;

    var headers = this.CreateHeaders();


    for (var key in comparisonComponents) {
        this.CreateBrowserData(comparisonComponents[key], 0)
    }

    this.LoadTable(headers);
}

ReviewComparisonVisioModelBrowser.prototype.CreateHeaders = function () {
    var columnHeaders = [];
    for (var i = 0; i < Object.keys(ComparisonVisioBrowserColumns).length; i++) {

        var columnHeader = {};
        var caption;
        var dataField;
        var width;
        var visible = true

        if (i === ComparisonVisioBrowserColumns.Select) {
            continue;
        }
        else if (i === ComparisonVisioBrowserColumns.Component) {
            caption = ComparisonVisioBrowserNames.Component;
            dataField = ComparisonVisioBrowserNames.Component;
            width = "30%";
        }
        else if (i === ComparisonVisioBrowserColumns.MainClass) {
            caption = ComparisonVisioBrowserNames.MainClass;
            dataField = ComparisonVisioBrowserNames.MainClass;
            width = "25%";
        }
        else if (i === ComparisonVisioBrowserColumns.SubClass) {
            caption = ComparisonVisioBrowserNames.SubClass;
            dataField = ComparisonVisioBrowserNames.SubClass;
            width = "25%";
        }
        else if (i === ComparisonVisioBrowserColumns.Status) {
            caption = ComparisonVisioBrowserNames.Status;
            dataField = ComparisonVisioBrowserNames.Status;
            width = "20%";
            visible = true;
        }
        else if (i === ComparisonVisioBrowserColumns.NodeId) {
            caption = ComparisonVisioBrowserNames.NodeId;
            dataField = ComparisonVisioBrowserNames.NodeId;
            width = "0%";
            visible = false;
        }
        else if (i === ComparisonVisioBrowserColumns.ResultId) {
            caption = ComparisonVisioBrowserNames.ResultId;
            dataField = ComparisonVisioBrowserNames.ResultId;
            width = "0%";
            visible = false;
        }
        else if (i === ComparisonVisioBrowserColumns.GroupId) {
            caption = ComparisonVisioBrowserNames.GroupId;
            dataField = ComparisonVisioBrowserNames.GroupId;
            width = "0%";
            visible = false;
        }
        else if (i === ComparisonVisioBrowserColumns.Parent) {
            caption = ComparisonVisioBrowserNames.Parent;
            dataField = ComparisonVisioBrowserNames.Parent;
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

ReviewComparisonVisioModelBrowser.prototype.CreateBrowserData = function (component, parentName) {
    tableRowContent = {};
    tableRowContent[ComparisonVisioBrowserNames.Component] = component.Name;
    tableRowContent[ComparisonVisioBrowserNames.MainClass] = component.MainClass;
    tableRowContent[ComparisonVisioBrowserNames.SubClass] = component.SubClass;
    tableRowContent[ComparisonVisioBrowserNames.Status] = component.Status;
    tableRowContent[ComparisonVisioBrowserNames.NodeId] = (component.NodeId && component.NodeId != "") ? component.NodeId : "";
    tableRowContent[ComparisonVisioBrowserNames.ResultId] = (component.Id && component.Id != "") ? Number(component.Id) : "";
    tableRowContent[ComparisonVisioBrowserNames.GroupId] = (component.GroupId && component.GroupId != "") ? Number(component.GroupId) : "";
    tableRowContent[ComparisonVisioBrowserNames.Parent] = parentName;
    this.ModelTreeData.push(tableRowContent);

    // maintain nodeId vs component data
    this.MaintainNameVsCheckComponent(component);

    // maintain node id vs parent node
    this.NodeParentList[component.Name] = parentName;

    if (component.Children && component.Children.length > 0) {
        for (var i = 0; i < component.Children.length; i++) {
            this.CreateBrowserData(component.Children[i], component.Name);
        }
    }
}

ReviewComparisonVisioModelBrowser.prototype.MaintainNameVsCheckComponent = function (component) {

    // maintain track of check components
    if (component.Name) {
        this.NodeIdvsCheckComponent[component.Name] = {
            "ResultId": component.Id,
            "Name": component.Name,
            "MainClass": component.MainClass,
            "SubClass": component.SubClass,
            "Status": component.Status,
            "NodeId": component.NodeId,
            "GroupId": component.GroupId,
        };
    }
}

ReviewComparisonVisioModelBrowser.prototype.LoadTable = function (headers) {
    var _this = this;
    var container = "#" + this.GetTableDivId();
    $(container).dxTreeList({
        dataSource: _this.ModelTreeData,
        keyExpr: ComparisonVisioBrowserNames.Component,
        parentIdExpr: ComparisonVisioBrowserNames.Parent,
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
        onInitialized: function (e) {

        },
        onSelectionChanged: function (e) {

        },
        onRowClick: function (e) {
            _this.GetSelectionManager().MaintainHighlightedRow(e.rowElement[0], container, e.key);

            _this.OnComponentRowClicked(e.data);
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

ReviewComparisonVisioModelBrowser.prototype.AddTooltip = function (e) {
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

ReviewComparisonVisioModelBrowser.prototype.AddTableContentCount = function (containerId) {
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

        // var countBox = document.getElementById(id);
        // modelBrowserTableRows contains header and search bar row as row hence count is length-1
        var rowCount = this.ModelTreeData.length;
        div2.innerHTML = "Count :" + rowCount;
        modelBrowserDataTable.appendChild(div2);
    }
}

ReviewComparisonVisioModelBrowser.prototype.OnComponentRowClicked = function (rowData) {

    this.LoadDetailedTable(rowData);

    this.HighlightInViewer(rowData);

    // highlight in another browser
    this.HighlightInAnotherBrowser(rowData);
}

ReviewComparisonVisioModelBrowser.prototype.HighlightInViewer = function (rowData) {

    var viewerInterface = this.GetViewer();

    if (viewerInterface) {
        viewerInterface.HighlightComponent(rowData.NodeId);
    }
}

ReviewComparisonVisioModelBrowser.prototype.HighlightInAnotherBrowser = function (rowData) {
    if (rowData.GroupId in this.CheckData.results) {
        var group = this.CheckData.results[rowData.GroupId];

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
                else if (browser.Is3D() ||
                         browser.IsVisio()) {
                    browsers[src]["viewer"].UnHighlightComponent();
                }

                var anotherBrowserRowData = {};
                if (browser.Id === "a") {
                    if (browser.Is3D()) {
                        anotherBrowserRowData.NodeId = Number(checkComponent.sourceANodeId);
                    }
                    else if (browser.IsVisio()) {
                        anotherBrowserRowData.NodeId = checkComponent.sourceANodeId;
                    }
                    else if (browser.Is1D()) {
                        var mainClasses = group.componentClass.split("-");
                        if (mainClasses.length !== 1) {
                            return;
                        }

                        anotherBrowserRowData.Item = checkComponent.sourceAName
                        anotherBrowserRowData.Class = checkComponent.sourceASubComponentClass
                        anotherBrowserRowData.Category = mainClasses[0];
                    }
                }
                else if (browser.Id === "b") {
                    if (browser.Is3D()) {
                        anotherBrowserRowData.NodeId = Number(checkComponent.sourceBNodeId);
                    }
                    else if (browser.IsVisio()) {
                        anotherBrowserRowData.NodeId = checkComponent.sourceBNodeId;
                    }
                    else if (browser.Is1D()) {
                        var mainClasses = group.componentClass.split("-");
                        if (mainClasses.length !== 2) {
                            return;
                        }

                        anotherBrowserRowData.Item = checkComponent.sourceBName
                        anotherBrowserRowData.Class = checkComponent.sourceBSubComponentClass
                        anotherBrowserRowData.Category = mainClasses[2];
                    }
                }
                else if (browser.Id === "c") {
                    if (browser.Is3D()) {
                        anotherBrowserRowData.NodeId = Number(checkComponent.sourceCNodeId);
                    }
                    else if (browser.IsVisio()) {
                        anotherBrowserRowData.NodeId = checkComponent.sourceCNodeId;
                    }
                    else if (browser.Is1D()) {
                        var mainClasses = group.componentClass.split("-");
                        if (mainClasses.length !== 3) {
                            return;
                        }

                        anotherBrowserRowData.Item = checkComponent.sourceCName
                        anotherBrowserRowData.Class = checkComponent.sourceCSubComponentClass
                        anotherBrowserRowData.Category = mainClasses[2];
                    }
                }
                else if (browser.Id === "d") {
                    if (browser.Is3D()) {
                        anotherBrowserRowData.NodeId = Number(checkComponent.sourceDNodeId);
                    }
                    else if (browser.IsVisio()) {
                        anotherBrowserRowData.NodeId = checkComponent.sourceDNodeId;
                    }
                    else if (browser.Is1D()) {
                        var mainClasses = group.componentClass.split("-");
                        if (mainClasses.length !== 4) {
                            return;
                        }

                        anotherBrowserRowData.Item = checkComponent.sourceDName
                        anotherBrowserRowData.Class = checkComponent.sourceDSubComponentClass
                        anotherBrowserRowData.Category = mainClasses[3];
                    }
                }

                if (browser.Is3D()) {
                    if (anotherBrowserRowData.NodeId) {
                        browser.HighlightBrowserComponentRow(anotherBrowserRowData.NodeId, false);
                        browser.HighlightInViewer(anotherBrowserRowData);
                    }
                }
                else if (browser.Is1D()) {
                    if (anotherBrowserRowData.Item && anotherBrowserRowData.Class && anotherBrowserRowData.Category) {
                        browser.HighlightComponent(anotherBrowserRowData, false);
                        browser.HighlightInViewer(anotherBrowserRowData);
                    }
                }
                else if (browser.IsVisio()) {
                    browser.HighlightInViewer(anotherBrowserRowData);
                }
            }
        }
    }
}

// ReviewComparisonVisioModelBrowser.prototype.HighlightBrowserComponentRow = function (selectedNodeId, originalComponent) {
//     var _this = this;

//     var path = {};
//     path['path'] = [selectedNodeId];
//     this.GetTopMostParentNode(selectedNodeId, path);

//     this.HighlightRow(path, selectedNodeId);


//     if (originalComponent) {
//         expandModelBrowserAccordion(this.SourceFileName, "#" + Comparison.MainReviewContainer).then(function (result) {
//             var rowIndex = _this.TreeInstance.getRowIndexByKey(selectedNodeId);
//             var row = _this.TreeInstance.getRowElement(rowIndex);
//             document.getElementById(Comparison.MainReviewContainer).scrollTop = row[0].offsetTop - row[0].offsetHeight;
//             // _this.TreeInstance.navigateToRow(selectedNodeId).done(function () {
//             // });
//         });

//         // load detailed table
//         var rowIndex = _this.TreeInstance.getRowIndexByKey(selectedNodeId);
//         var rows = _this.TreeInstance.getVisibleRows();
//         if (rowIndex in rows) {
//             this.LoadDetailedTable(rows[rowIndex].data);
//         }

//         // highlight in another browser
//         var rows = this.TreeInstance.getVisibleRows();
//         var rowIndex = this.TreeInstance.getRowIndexByKey(selectedNodeId);
//         if (rowIndex != -1 && (rowIndex in rows)) {
//             var rowData = rows[rowIndex];
//             this.HighlightInAnotherBrowser(rowData.data);
//         }
//     }
//     // this.OpenHighlightedRow(path, selectedNodeId);
// }

ReviewComparisonVisioModelBrowser.prototype.LoadDetailedTable = function (rowData) {
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

ReviewComparisonVisioModelBrowser.prototype.CreatePropertiesTableHeader = function () {
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

ReviewComparisonVisioModelBrowser.prototype.CreateDetailedTableData = function (component) {

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

ReviewComparisonVisioModelBrowser.prototype.LoadDetailedInfoTable = function (columnHeaders, tableData) {
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

ReviewComparisonVisioModelBrowser.prototype.GetCheckComponent = function (groupId, componentId) {
    var checkGroup = this.GetCheckGroup(groupId);
    var component = checkGroup.components[componentId];

    return component;
}

ReviewComparisonVisioModelBrowser.prototype.GetCheckGroup = function (groupId) {
    return this.CheckData.results[groupId];
}

ReviewComparisonVisioModelBrowser.prototype.Destroy = function () {

    $("#" + this.GetTableDivId()).remove()
    //Destroy accordion

    var comparisonTableData = document.getElementById(Comparison.MainReviewContainer).innerHTML;
    if (comparisonTableData !== "") {
        $("#" + Comparison.MainReviewContainer).dxAccordion("dispose");
        comparisonTableData = "";
    }

    this.DestroyDetailedInfoTable();

     //clear view
     this.GetViewer().Clear();
}

ReviewComparisonVisioModelBrowser.prototype.DestroyDetailedInfoTable = function () {

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

