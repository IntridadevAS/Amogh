function ReviewComparison3DModelBrowser(id,
    sourceFileName,
    checkData) {
    // call super constructor
    ReviewModelBrowser.call(this, id, sourceFileName);

    this.CheckData = checkData;
    this.ModelTreeData = [];  

    this.NodeIdvsCheckComponent = {};
    this.NodeParentList = {};
}

// assign ReviewModelBrowser's method to this class
ReviewComparison3DModelBrowser.prototype = Object.create(ReviewModelBrowser.prototype);
ReviewComparison3DModelBrowser.prototype.constructor = ReviewComparison3DModelBrowser;

ReviewComparison3DModelBrowser.prototype.GetTableDivId = function () {    
    return this.SourceFileName.replace(/\W/g, '_') + "_" + Comparison.MainReviewContainer;
}

ReviewComparison3DModelBrowser.prototype.GetSelectionManager = function () {
    var browser = model.checks["comparison"]["modelBrowsers"][this.SourceFileName];
    return browser["selectionManager"];    
}

ReviewComparison3DModelBrowser.prototype.GetViewer = function () {
    var browser = model.checks["comparison"]["modelBrowsers"][this.SourceFileName];
    return browser["viewer"];    
}

ReviewComparison3DModelBrowser.prototype.AddModelBrowser = function (comparisonComponents) {    

    var headers = this.CreateHeaders();


    for (var key in comparisonComponents) {
        this.CreateBrowserData(comparisonComponents[key], 0)
    }

    this.LoadTable(headers);
}

ReviewComparison3DModelBrowser.prototype.CreateHeaders = function () {
    var columnHeaders = [];
    for (var i = 0; i < Object.keys(Comparison3DBrowserColumns).length; i++) {

        var columnHeader = {};
        var caption;
        var dataField;
        var width;
        var visible = true

        if (i === Comparison3DBrowserColumns.Select) {
            continue;
        }
        else if (i === Comparison3DBrowserColumns.Component) {
            caption = Comparison3DBrowserNames.Component;
            dataField = Comparison3DBrowserNames.Component;
            width = "30%";
        }
        else if (i === Comparison3DBrowserColumns.MainClass) {
            caption = Comparison3DBrowserNames.MainClass;
            dataField = Comparison3DBrowserNames.MainClass;
            width = "25%";
        }
        else if (i === Comparison3DBrowserColumns.SubClass) {
            caption = Comparison3DBrowserNames.SubClass;
            dataField = Comparison3DBrowserNames.SubClass;
            width = "25%";
        }
        else if (i === Comparison3DBrowserColumns.Status) {
            caption = Comparison3DBrowserNames.Status;
            dataField = Comparison3DBrowserNames.Status;
            width = "20%";
            visible = true;
        }
        else if (i === Comparison3DBrowserColumns.NodeId) {
            caption = Comparison3DBrowserNames.NodeId;
            dataField = Comparison3DBrowserNames.NodeId;
            width = "0%";
            visible = false;
        }
        else if (i === Comparison3DBrowserColumns.ResultId) {
            caption = Comparison3DBrowserNames.ResultId;
            dataField = Comparison3DBrowserNames.ResultId;
            width = "0%";
            visible = false;
        }
        else if (i === Comparison3DBrowserColumns.GroupId) {
            caption = Comparison3DBrowserNames.GroupId;
            dataField = Comparison3DBrowserNames.GroupId;
            width = "0%";
            visible = false;
        }
        else if (i === Comparison3DBrowserColumns.Parent) {
            caption = Comparison3DBrowserNames.Parent;
            dataField = Comparison3DBrowserNames.Parent;
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

ReviewComparison3DModelBrowser.prototype.CreateBrowserData = function (component, parentNode) {
    tableRowContent = {};
    tableRowContent[Comparison3DBrowserNames.Component] = component.Name;
    tableRowContent[Comparison3DBrowserNames.MainClass] = component.MainClass;
    tableRowContent[Comparison3DBrowserNames.SubClass] = component.SubClass;
    tableRowContent[Comparison3DBrowserNames.Status] = component.Status;
    tableRowContent[Comparison3DBrowserNames.NodeId] = (component.NodeId && component.NodeId != "") ? Number(component.NodeId) : "";
    tableRowContent[Comparison3DBrowserNames.ResultId] = (component.Id  && component.Id != "") ? Number(component.Id) : ""; 
    tableRowContent[Comparison3DBrowserNames.GroupId] = (component.GroupId  && component.GroupId != "") ? Number(component.GroupId) : "";
    tableRowContent[Comparison3DBrowserNames.Parent] = Number(parentNode);
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

ReviewComparison3DModelBrowser.prototype.LoadTable = function (headers) {
    var _this = this;
    var container = "#" + this.GetTableDivId();
    $(container).dxTreeList({
        dataSource: _this.ModelTreeData,
        keyExpr: Comparison3DBrowserNames.NodeId,
        parentIdExpr: Comparison3DBrowserNames.Parent,
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
            _this.GetSelectionManager().MaintainHighlightedRow(e.rowElement[0], container, e.key);

            _this.OnComponentRowClicked(e.data);
        },
        onRowPrepared: function (e) {
            if (e.rowType !== "data") {
                return;
            }           

            // add tooltip to cells
            _this.AddTooltip(e);

            var selectionManager=  _this.GetSelectionManager();
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

ReviewComparison3DModelBrowser.prototype.AddTooltip = function (e) {
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
                cell.setAttribute("title", anotherSource + ">" + anotherComponent);
            }
        }
    }
}

ReviewComparison3DModelBrowser.prototype.CreateCheckGroupButton = function (title) {

    var btn = document.createElement("BUTTON");
    btn.className = "accordion";
    btn.style.justifyContent = "center";
    btn.style.color = "white";
    btn.style.width = "100%";
    var t = document.createTextNode(title);       // Create a text node
    btn.appendChild(t);
    return btn;
}

ReviewComparison3DModelBrowser.prototype.OnComponentRowClicked = function (rowData) {

    this.LoadDetailedTable(rowData);

    this.HighlightInViewer(rowData);
}

ReviewComparison3DModelBrowser.prototype.HighlightInViewer = function (rowData) {

    var viewerInterface = this.GetViewer();   

    if (viewerInterface) {
        viewerInterface.highlightComponent(rowData.NodeId);
    }
}

ReviewComparison3DModelBrowser.prototype.LoadDetailedTable = function (rowData) {
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

ReviewComparison3DModelBrowser.prototype.GetCheckComponent = function (groupId, componentId) {
    var checkGroup = this.GetCheckGroup(groupId);
    var component = checkGroup.components[componentId];

    return component;
}

ReviewComparison3DModelBrowser.prototype.GetCheckGroup = function (groupId) {
    return this.CheckData.results[groupId];
}

ReviewComparison3DModelBrowser.prototype.CreatePropertiesTableHeader = function () {
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

ReviewComparison3DModelBrowser.prototype.CreateDetailedTableData = function (component) {

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

ReviewComparison3DModelBrowser.prototype.LoadDetailedInfoTable = function (columnHeaders, tableData) {
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

ReviewComparison3DModelBrowser.prototype.DestroyDetailedInfoTable = function () {

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

ReviewComparisonModelBrowser.prototype.DestroyModelBrowserTable = function () {

    $("#" + this.GetTableDivId()).remove()
    //Destroy accordion

    var comparisonTableData = document.getElementById(Comparison.MainReviewContainer).innerHTML;
    if(comparisonTableData !== "") {
        $("#" + Comparison.MainReviewContainer).dxAccordion("dispose");
        comparisonTableData = "";
    }
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

ReviewComparison3DModelBrowser.prototype.GetCheckComponetDataByNodeId = function (viewerId, selectedNode) {
    var checkComponentData;

    if (this.NodeIdvsCheckComponent !== undefined &&
        selectedNode in this.NodeIdvsCheckComponent) {
        checkComponentData = this.NodeIdvsCheckComponent[selectedNode];
    }

    return checkComponentData;
}

ReviewComparison3DModelBrowser.prototype.HighlightBrowserComponentRow = function (selectedNodeId) {
    var path = {};
    path['path'] = [selectedNodeId];
    this.GetTopMostParentNode(selectedNodeId, path);

    this.OpenHighlightedRow(path, selectedNodeId);
}

ReviewComparison3DModelBrowser.prototype.GetTopMostParentNode = function (rowKey, path) {

    if (rowKey in this.NodeParentList) {

        if (this.NodeParentList[rowKey] === 0) {
            return;
        }
        path['path'].push(this.NodeParentList[rowKey])

        this.GetTopMostParentNode(this.NodeParentList[rowKey], path);
    }
}

ReviewComparison3DModelBrowser.prototype.OpenHighlightedRow = function (path, selectedNodeId) {

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


ReviewComparison3DModelBrowser.prototype.GetBrowserRowFromNodeId = function (selectedNodeId, containerDiv) {

    var _this = this;
    var treeList = $(containerDiv).dxTreeList("instance");

    //navigate scrollbar to specified row using key
    treeList.navigateToRow(selectedNodeId).done(function () {

         var rowIndex = treeList.getRowIndexByKey(selectedNodeId);
         var row = treeList.getRowElement(rowIndex);

        _this.GetSelectionManager().MaintainHighlightedRow(row[0], containerDiv, selectedNodeId);             
    });
}

ReviewComparison3DModelBrowser.prototype.GetBrowserRow = function (rowKey, containerDiv) {
    var modelBrowser = $(containerDiv).dxTreeList("instance");

    var rowIndex = modelBrowser.getRowIndexByKey(rowKey);
    if (rowIndex != -1) {
        return modelBrowser.getRowElement(rowIndex);        
    }
}

ReviewComparison3DModelBrowser.prototype.AddTableContentCount = function (containerId) {
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

