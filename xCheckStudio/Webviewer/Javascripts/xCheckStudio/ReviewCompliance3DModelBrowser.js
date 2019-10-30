function ReviewCompliance3DModelBrowser(id,
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
ReviewCompliance3DModelBrowser.prototype = Object.create(ReviewModelBrowser.prototype);
ReviewCompliance3DModelBrowser.prototype.constructor = ReviewCompliance3DModelBrowser;


ReviewCompliance3DModelBrowser.prototype.Is3D = function () {
    return true;
}

ReviewCompliance3DModelBrowser.prototype.GetTableDivId = function () {
    return this.SourceFileName.replace(/\W/g, '_') + "_" + Compliance.MainReviewContainer;
}

ReviewCompliance3DModelBrowser.prototype.GetSelectionManager = function () {
    var browser = model.checks["compliance"]["modelBrowsers"][this.SourceFileName];
    return browser["selectionManager"];
}

ReviewCompliance3DModelBrowser.prototype.GetViewer = function () {
    var browser = model.checks["compliance"]["modelBrowsers"][this.SourceFileName];
    return browser["viewer"];
}

ReviewCompliance3DModelBrowser.prototype.AddModelBrowser = function (complianceComponents) {
    this.Components = complianceComponents;

    var headers = this.CreateHeaders();


    for (var key in complianceComponents) {
        this.CreateBrowserData(complianceComponents[key], 0)
    }

    this.LoadTable(headers);
}

ReviewCompliance3DModelBrowser.prototype.CreateHeaders = function () {
    var columnHeaders = [];
    for (var i = 0; i < Object.keys(Compliance3DBrowserColumns).length; i++) {

        var columnHeader = {};
        var caption;
        var dataField;
        var width;
        var visible = true


        if (i === Compliance3DBrowserColumns.Component) {
            caption = Compliance3DBrowserNames.Component;
            dataField = Compliance3DBrowserNames.Component;
            width = "30%";
        }
        else if (i === Compliance3DBrowserColumns.MainClass) {
            caption = Compliance3DBrowserNames.MainClass;
            dataField = Compliance3DBrowserNames.MainClass;
            width = "25%";
        }
        else if (i === Compliance3DBrowserColumns.SubClass) {
            caption = Compliance3DBrowserNames.SubClass;
            dataField = Compliance3DBrowserNames.SubClass;
            width = "25%";
        }
        else if (i === Compliance3DBrowserColumns.Status) {
            caption = Compliance3DBrowserNames.Status;
            dataField = Compliance3DBrowserNames.Status;
            width = "20%";
            visible = true;
        }
        else if (i === Compliance3DBrowserColumns.NodeId) {
            caption = Compliance3DBrowserNames.NodeId;
            dataField = Compliance3DBrowserNames.NodeId;
            width = "0%";
            visible = false;
        }
        else if (i === Compliance3DBrowserColumns.ResultId) {
            caption = Compliance3DBrowserNames.ResultId;
            dataField = Compliance3DBrowserNames.ResultId;
            width = "0%";
            visible = false;
        }
        else if (i === Compliance3DBrowserColumns.GroupId) {
            caption = Compliance3DBrowserNames.GroupId;
            dataField = Compliance3DBrowserNames.GroupId;
            width = "0%";
            visible = false;
        }
        else if (i === Compliance3DBrowserColumns.Parent) {
            caption = Compliance3DBrowserNames.Parent;
            dataField = Compliance3DBrowserNames.Parent;
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

ReviewCompliance3DModelBrowser.prototype.CreateBrowserData = function (component, parentNode) {
    tableRowContent = {};
    tableRowContent[Compliance3DBrowserNames.Component] = component.Name;
    tableRowContent[Compliance3DBrowserNames.MainClass] = component.MainClass;
    tableRowContent[Compliance3DBrowserNames.SubClass] = component.SubClass;
    tableRowContent[Compliance3DBrowserNames.Status] = component.Status;
    tableRowContent[Compliance3DBrowserNames.NodeId] = (component.NodeId && component.NodeId != "") ? Number(component.NodeId) : "";
    tableRowContent[Compliance3DBrowserNames.ResultId] = (component.Id && component.Id != "") ? Number(component.Id) : "";
    tableRowContent[Compliance3DBrowserNames.GroupId] = (component.GroupId && component.GroupId != "") ? Number(component.GroupId) : "";
    tableRowContent[Compliance3DBrowserNames.Parent] = Number(parentNode);
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

ReviewCompliance3DModelBrowser.prototype.LoadTable = function (headers) {
    var _this = this;
    var container = "#" + this.GetTableDivId();
    $(container).dxTreeList({
        dataSource: _this.ModelTreeData,
        keyExpr: Compliance3DBrowserNames.NodeId,
        parentIdExpr: Compliance3DBrowserNames.Parent,
        columns: headers,
        columnAutoWidth: true,
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
                selectionManager.ChangeBackgroundColor(e.rowElement[0], e.data[Compliance3DBrowserNames.Status]);
            }
        }
    });
}


ReviewCompliance3DModelBrowser.prototype.OnComponentRowClicked = function (rowData) {

    this.LoadDetailedTable(rowData);

    this.HighlightInViewer(rowData);
}

ReviewCompliance3DModelBrowser.prototype.HighlightInViewer = function (rowData) {

    var viewerInterface = this.GetViewer();

    if (viewerInterface) {
        viewerInterface.HighlightComponent(rowData.NodeId);
    }
}

ReviewCompliance3DModelBrowser.prototype.AddTableContentCount = function (containerId) {
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

        var rowCount = this.ModelTreeData.length;
        div2.innerHTML = "Count :" + rowCount;
        modelBrowserDataTable.appendChild(div2);
    }
}

ReviewCompliance3DModelBrowser.prototype.MaintainNodeIdVsCheckComponent = function (component) {

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

ReviewCompliance3DModelBrowser.prototype.HighlightBrowserComponentRow = function (selectedNodeId, originalComponent) {
    var _this = this;

    var path = {};
    path['path'] = [selectedNodeId];
    this.GetTopMostParentNode(selectedNodeId, path);

    this.HighlightRow(path, selectedNodeId);

    expandModelBrowserAccordion(this.SourceFileName, "#" + Compliance.MainReviewContainer).then(function (result) {
        var rowIndex = _this.TreeInstance.getRowIndexByKey(selectedNodeId);
        var row = _this.TreeInstance.getRowElement(rowIndex);
        document.getElementById(Compliance.MainReviewContainer).scrollTop = row[0].offsetTop - row[0].offsetHeight;
    });

    // load detailed table
    var rowIndex = _this.TreeInstance.getRowIndexByKey(selectedNodeId);
    var rows = _this.TreeInstance.getVisibleRows();
    if (rowIndex in rows) {
        this.LoadDetailedTable(rows[rowIndex].data);
    }
}

ReviewCompliance3DModelBrowser.prototype.HighlightRow = function (path, selectedNodeId) {

    _this = this;
    if (!('path' in path)) {
        return;
    }

    var nodeList = path['path'];
    nodeList = nodeList.reverse();

    // expand tree if not expanded else select row using key
    for (var i = 0; i < nodeList.length; i++) {
        var node = nodeList[i];

        if (!this.TreeInstance.isRowExpanded(node)) {
            this.TreeInstance.expandRow(node).done(function () {
                _this.HighlightBrowserRowFromNodeId(selectedNodeId);
            });
        }
        else {
            if (i == nodeList.length - 1) {
                _this.HighlightBrowserRowFromNodeId(selectedNodeId);
            }
        }
    }
}

ReviewCompliance3DModelBrowser.prototype.HighlightBrowserRowFromNodeId = function (selectedNodeId) {

    var _this = this;
  
    var rowIndex = this.TreeInstance.getRowIndexByKey(selectedNodeId);
    var row = this.TreeInstance.getRowElement(rowIndex);

    _this.GetSelectionManager().MaintainHighlightedRow(row[0], "#" + _this.GetTableDivId(), selectedNodeId);
    // });
}

ReviewCompliance3DModelBrowser.prototype.GetTopMostParentNode = function (rowKey, path) {

    if (rowKey in this.NodeParentList) {

        if (this.NodeParentList[rowKey] === 0) {
            return;
        }
        path['path'].push(this.NodeParentList[rowKey])

        this.GetTopMostParentNode(this.NodeParentList[rowKey], path);
    }
}

ReviewCompliance3DModelBrowser.prototype.LoadDetailedTable = function (rowData) {
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

ReviewCompliance3DModelBrowser.prototype.GetCheckComponent = function (groupId, componentId) {
    var checkGroup = this.GetCheckGroup(groupId);
    var component = checkGroup.components[componentId];

    return component;
}

ReviewCompliance3DModelBrowser.prototype.GetCheckGroup = function (groupId) {
    return this.CheckData.results[groupId];
}

ReviewCompliance3DModelBrowser.prototype.Destroy = function () {

    $("#" + this.GetTableDivId()).remove()
    //Destroy accordion

    var complianceTableData = document.getElementById(Compliance.MainReviewContainer).innerHTML;
    if (complianceTableData !== "") {
        $("#" + Compliance.MainReviewContainer).dxAccordion("dispose");
        complianceTableData = "";
    }

    this.DestroyDetailedInfoTable();

}

ReviewCompliance3DModelBrowser.prototype.DestroyDetailedInfoTable = function () {

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

ReviewCompliance3DModelBrowser.prototype.CreatePropertiesTableHeader = function () {
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

ReviewCompliance3DModelBrowser.prototype.CreateDetailedTableData = function (component) {
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

ReviewCompliance3DModelBrowser.prototype.LoadDetailedInfoTable = function (columnHeaders, tableData) {
    var tableContainer = "#" + Compliance.DetailInfoContainer;
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