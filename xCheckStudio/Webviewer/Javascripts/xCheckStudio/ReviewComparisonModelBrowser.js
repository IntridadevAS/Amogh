function ReviewComparisonModelBrowser(id,
    sourceFileName,
    checkData) {
    // call super constructor
    ReviewModelBrowser.call(this, id, sourceFileName);

    this.CheckData = checkData;
    this.ModelTreeData = [];

    this.SelectionManager = new ReviewModelBrowserSelectionManager();

    this.NodeIdvsCheckComponent = {};
    this.NodeParentList = {};
}

// assign ReviewModelBrowser's method to this class
ReviewComparisonModelBrowser.prototype = Object.create(ReviewModelBrowser.prototype);
ReviewComparisonModelBrowser.prototype.constructor = ReviewComparisonModelBrowser;

ReviewComparisonModelBrowser.prototype.GetTableDivId = function () {
    return this.SourceFileName.replace(/\W/g, '_') + "_" + Comparison.MainReviewContainer;
}

ReviewComparisonModelBrowser.prototype.AddModelBrowser = function (comparisonComponents) {
    // var parentTable = document.getElementById(Comparison.MainReviewContainer);
    // var btn = this.CreateCheckGroupButton(this.SourceFileName);
    // parentTable.appendChild(btn);

    // var div = document.createElement("DIV");
    // div.className = "content scrollable";
    // div.id = this.GetTableDivId();
    // // div.id =  "Plant03";
    // div.style.display = "none";
    // parentTable.appendChild(div);

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
    tableRowContent[ComparisonBrowserNames.NodeId] = (component.NodeId && component.NodeId != "") ? Number(component.NodeId) : "";
    tableRowContent[ComparisonBrowserNames.ResultId] = (component.Id  && component.Id != "") ? Number(component.Id) : ""; 
    tableRowContent[ComparisonBrowserNames.GroupId] = (component.GroupId  && component.GroupId != "") ? Number(component.GroupId) : "";
    tableRowContent[ComparisonBrowserNames.Parent] = Number(parentNode);
    this.ModelTreeData.push(tableRowContent);

    // maintain nodeId vs component data
    this.MaintainNodeIdVsCheckComponent(component);

    // maintain node id vs parent node
    this.NodeParentList[Number(component.NodeId)] = Number(parentNode);

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
        // height: "100%",
        // width: "100%",
        scrolling : "standard",
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
            _this.SelectionManager.MaintainHighlightedRow(e.rowElement[0], container, e.key);

            _this.OnComponentRowClicked(e.data);
        },
        onRowPrepared: function (e) {
            if (e.rowType !== "data") {
                return;
            }           

            // add tooltip to cells
            _this.AddTooltip(e);

            var highlightedRow = _this.SelectionManager.GetHighlightedRow();
            if (highlightedRow &&
                highlightedRow["rowKey"] === e.key) {
                _this.SelectionManager.ApplyHighlightColor(e.rowElement[0]);
            }
            else {
                _this.SelectionManager.ChangeBackgroundColor(e.rowElement[0], e.data[ComparisonBrowserNames.Status]);
            }
        }
    });
}

ReviewComparisonModelBrowser.prototype.AddTooltip = function (e) {
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
                cell.setAttribute("title", anotherSource + "/" + anotherComponent);
            }
        }
    }
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

    this.HighlightInViewer(rowData);
}

ReviewComparisonModelBrowser.prototype.HighlightInViewer = function (rowData) {

    var viewerInterface;
    if (this.Id === "a" &&
        model.checks["comparison"].sourceAViewer) {
        viewerInterface = model.checks["comparison"].sourceAViewer;

    }
    else if (this.Id === "b" &&
        model.checks["comparison"].sourceBViewer) {
        viewerInterface = model.checks["comparison"].sourceBViewer;
    }

    if (viewerInterface) {
        viewerInterface.highlightComponent(rowData.NodeId);
    }
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
    var tableData = this.CreateDetailedTableData(component);
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

ReviewComparisonModelBrowser.prototype.CreateDetailedTableData = function (component) {

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

ReviewComparisonModelBrowser.prototype.MaintainNodeIdVsCheckComponent = function (component) {

    // maintain track of check components
    if (component.NodeId) {
        this.NodeIdvsCheckComponent[Number(component.NodeId)] = {
            "ResultId": component.Id,
            "Name": component.Name,
            "MainClass": component.MainClass,
            "SubClass": component.SubClass,
            "Status": component.Status,
            "NodeId": Number(component.NodeId),
            "GroupId": component.GroupId,
        };
    }
}

ReviewComparisonModelBrowser.prototype.GetCheckComponetDataByNodeId = function (viewerId, selectedNode) {
    var checkComponentData;

    if (this.NodeIdvsCheckComponent !== undefined &&
        selectedNode in this.NodeIdvsCheckComponent) {
        checkComponentData = this.NodeIdvsCheckComponent[selectedNode];
    }

    return checkComponentData;
}

ReviewComparisonModelBrowser.prototype.HighlightBrowserComponentRow = function (selectedNodeId) {
    var path = {};
    path['path'] = [selectedNodeId];
    this.GetTopMostParentNode(selectedNodeId, path);

    this.OpenHighlightedRow(path, selectedNodeId);
}

ReviewComparisonModelBrowser.prototype.GetTopMostParentNode = function (rowKey, path) {

    if (rowKey in this.NodeParentList) {

        if (this.NodeParentList[rowKey] === 0) {
            return;
        }
        path['path'].push(this.NodeParentList[rowKey])

        this.GetTopMostParentNode(this.NodeParentList[rowKey], path);
    }
}

ReviewComparisonModelBrowser.prototype.OpenHighlightedRow = function (path, selectedNodeId) {

    _this = this;
    if (!('path' in path)) {
        return;
    }

    expandModelBrowserAccordion(this.SourceFileName).then(function (result) {

        var nodeList = path['path'];
        nodeList = nodeList.reverse();

        var container = "#" + _this.GetTableDivId();
        var treeList = $(container).dxTreeList("instance");

        // expand tree if not expanded else select row using key
        for (var i = 0; i < nodeList.length; i++) {
            var node = nodeList[i];

            if (!treeList.isRowExpanded(node)) {
                treeList.expandRow(node).done(function () {
                    _this.GetBrowserRowFromNodeId(selectedNodeId, container);
                });
            }
            else {
                if (i == nodeList.length - 1) {
                    _this.GetBrowserRowFromNodeId(selectedNodeId, container);
                }
            }
        }
    });
}


ReviewComparisonModelBrowser.prototype.GetBrowserRowFromNodeId = function (selectedNodeId, containerDiv) {

    var _this = this;
    var treeList = $(containerDiv).dxTreeList("instance");

    //navigate scrollbar to specified row using key
    treeList.navigateToRow(selectedNodeId).done(function () {

         var rowIndex = treeList.getRowIndexByKey(selectedNodeId);
         var row = treeList.getRowElement(rowIndex);

        _this.SelectionManager.MaintainHighlightedRow(row[0], containerDiv, selectedNodeId);             
    });
}

ReviewComparisonModelBrowser.prototype.GetBrowserRow = function (rowKey, containerDiv) {
    var modelBrowser = $(containerDiv).dxTreeList("instance");

    var rowIndex = modelBrowser.getRowIndexByKey(rowKey);
    if (rowIndex != -1) {
        return modelBrowser.getRowElement(rowIndex);        
    }
}

ReviewComparisonModelBrowser.prototype.AddTableContentCount = function (containerId) {
    var countDiv = document.getElementById(containerId + "_child");
    if (countDiv) {
        return;
    }
    else {
        var modelBrowserData = document.getElementById(containerId);
        
        var modelBrowserDataTable = modelBrowserData.children[0];
        var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");

        // var countBox;
        var div2 = document.createElement("DIV");
        var id = containerId + "_child";
        div2.id = id;
        div2.style.fontSize = "13px";

        // var countBox = document.getElementById(id);
        // modelBrowserTableRows contains header and search bar row as row hence count is length-1
        var rowCount = modelBrowserTableRows.length - 2;
        div2.innerHTML = "Count :" + rowCount;
        modelBrowserDataTable.appendChild(div2);
    }
}

