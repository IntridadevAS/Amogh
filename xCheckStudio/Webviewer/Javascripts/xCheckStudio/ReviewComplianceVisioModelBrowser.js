function ReviewComplianceVisioModelBrowser(id,
    sourceFileName,
    checkData) {
    // call super constructor
    ReviewModelBrowser.call(this, id, sourceFileName);

    this.CheckData = checkData;
    this.ModelTreeData = [];

    this.NodeIdvsCheckComponent = {};
    this.NamevsCheckComponent = {};
    this.NodeParentList = {};

    this.TreeInstance;

    this.Components;
}

// assign ReviewModelBrowser's method to this class
ReviewComplianceVisioModelBrowser.prototype = Object.create(ReviewModelBrowser.prototype);
ReviewComplianceVisioModelBrowser.prototype.constructor = ReviewComplianceVisioModelBrowser;


ReviewComplianceVisioModelBrowser.prototype.IsVisio = function () {
    return true;
}

ReviewComplianceVisioModelBrowser.prototype.GetTableDivId = function () {
    return this.SourceFileName.replace(/\W/g, '') + "_" + Compliance.MainReviewContainer;
}

ReviewComplianceVisioModelBrowser.prototype.GetSelectionManager = function () {
    var browser = model.checks["compliance"]["modelBrowsers"][this.SourceFileName];
    return browser["selectionManager"];
}

ReviewComplianceVisioModelBrowser.prototype.GetViewer = function () {
    var browser = model.checks["compliance"]["modelBrowsers"][this.SourceFileName];
    return browser["viewer"];
}

ReviewComplianceVisioModelBrowser.prototype.AddModelBrowser = function (complianceComponents) {
    this.Components = complianceComponents;

    var headers = this.CreateHeaders();


    for (var key in complianceComponents) {
        this.CreateBrowserData(complianceComponents[key], 0)
    }

    this.LoadTable(headers);
}

ReviewComplianceVisioModelBrowser.prototype.CreateHeaders = function () {
    var columnHeaders = [];
    for (var i = 0; i < Object.keys(ComplianceVisioBrowserColumns).length; i++) {

        var columnHeader = {};
        var caption;
        var dataField;
        var width;
        var visible = true


        if (i === ComplianceVisioBrowserColumns.Component) {
            caption = ComplianceVisioBrowserNames.Component;
            dataField = ComplianceVisioBrowserNames.Component;
            width = "30%";
        }
        else if (i === ComplianceVisioBrowserColumns.MainClass) {
            caption = ComplianceVisioBrowserNames.MainClass;
            dataField = ComplianceVisioBrowserNames.MainClass;
            width = "25%";
        }
        else if (i === ComplianceVisioBrowserColumns.SubClass) {
            caption = ComplianceVisioBrowserNames.SubClass;
            dataField = ComplianceVisioBrowserNames.SubClass;
            width = "25%";
        }
        else if (i === ComplianceVisioBrowserColumns.Status) {
            caption = ComplianceVisioBrowserNames.Status;
            dataField = ComplianceVisioBrowserNames.Status;
            width = "20%";
            visible = true;
        }
        else if (i === ComplianceVisioBrowserColumns.NodeId) {
            caption = ComplianceVisioBrowserNames.NodeId;
            dataField = ComplianceVisioBrowserNames.NodeId;
            width = "0%";
            visible = false;
        }
        else if (i === ComplianceVisioBrowserColumns.ResultId) {
            caption = ComplianceVisioBrowserNames.ResultId;
            dataField = ComplianceVisioBrowserNames.ResultId;
            width = "0%";
            visible = false;
        }
        else if (i === ComplianceVisioBrowserColumns.GroupId) {
            caption = ComplianceVisioBrowserNames.GroupId;
            dataField = ComplianceVisioBrowserNames.GroupId;
            width = "0%";
            visible = false;
        }
        else if (i === ComplianceVisioBrowserColumns.Parent) {
            caption = ComplianceVisioBrowserNames.Parent;
            dataField = ComplianceVisioBrowserNames.Parent;
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

ReviewComplianceVisioModelBrowser.prototype.CreateBrowserData = function (component, parentNode) {
    tableRowContent = {};
    tableRowContent[ComplianceVisioBrowserNames.Component] = component.Name;
    tableRowContent[ComplianceVisioBrowserNames.MainClass] = component.MainClass;
    tableRowContent[ComplianceVisioBrowserNames.SubClass] = component.SubClass;
    tableRowContent[ComplianceVisioBrowserNames.Status] = component.Status;
    tableRowContent[ComplianceVisioBrowserNames.NodeId] = (component.NodeId && component.NodeId != "") ? component.NodeId : "";
    tableRowContent[ComplianceVisioBrowserNames.ResultId] = (component.Id && component.Id != "") ? Number(component.Id) : "";
    tableRowContent[ComplianceVisioBrowserNames.GroupId] = (component.GroupId && component.GroupId != "") ? Number(component.GroupId) : "";
    tableRowContent[ComplianceVisioBrowserNames.Parent] = parentNode;
    this.ModelTreeData.push(tableRowContent);

    // maintain nodeId vs component data
    this.CacheCheckComponent(component);

    // maintain node id vs parent node
    this.NodeParentList[component.Name] = parentNode;

    if (component.Children && component.Children.length > 0) {
        for (var i = 0; i < component.Children.length; i++) {
            this.CreateBrowserData(component.Children[i], component.Name);
        }
    }
}

ReviewComplianceVisioModelBrowser.prototype.LoadTable = function (headers) {
    var _this = this;
    var container = "#" + this.GetTableDivId();
    $(container).dxTreeList({
        dataSource: _this.ModelTreeData,
        keyExpr: ComplianceVisioBrowserNames.Component,
        parentIdExpr: ComplianceVisioBrowserNames.Parent,
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
                selectionManager.ChangeBackgroundColor(e.rowElement[0], e.data[Compliance3DBrowserNames.Status]);
            }
        }
    });
}

ReviewComplianceVisioModelBrowser.prototype.AddTableContentCount = function (containerId) {
    var countDiv = document.getElementById(containerId + "_child");
    if (countDiv) {
        return;
    }
    else {
        var modelBrowserData = document.getElementById(containerId);

        var modelBrowserDataTable = modelBrowserData.children[0];

        var div2 = document.createElement("DIV");
        var id = containerId + "_child";
        div2.id = id;
        div2.style.fontSize = "13px";

        var rowCount = this.ModelTreeData.length;
        div2.innerHTML = "Count :" + rowCount;
        modelBrowserDataTable.appendChild(div2);
    }
}

ReviewComplianceVisioModelBrowser.prototype.CacheCheckComponent = function (component) {

    // maintain track of check components
    if (component.Name) {
        this.NamevsCheckComponent[component.Name] = {
            "ResultId": component.Id,
            "Name": component.Name,
            "MainClass": component.MainClass,
            "SubClass": component.SubClass,
            "Status": component.Status,
            "NodeId": component.NodeId,
            "GroupId": component.GroupId,
        };
    }

    if (component.NodeId) {
        this.NodeIdvsCheckComponent[component.NodeId] = {
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

ReviewComplianceVisioModelBrowser.prototype.OnComponentRowClicked = function (rowData) {

    this.LoadDetailedTable(rowData);

    this.HighlightInViewer(rowData);
}

ReviewComplianceVisioModelBrowser.prototype.LoadDetailedTable = function (rowData) {
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

ReviewComplianceVisioModelBrowser.prototype.CreatePropertiesTableHeader = function () {
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

ReviewComplianceVisioModelBrowser.prototype.CreateDetailedTableData = function (component) {
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

ReviewComplianceVisioModelBrowser.prototype.LoadDetailedInfoTable = function (columnHeaders, tableData) {
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

ReviewComplianceVisioModelBrowser.prototype.HighlightInViewer = function (rowData) {

    var viewerInterface = this.GetViewer();

    if (viewerInterface) {
         //get all component ids       
         let treeNode = this.TreeInstance.getNodeByKey(rowData.Item);
         let allIds = this.GetAllChildIds(treeNode);
 
         if (allIds && allIds.length > 0) {
             viewerInterface.HighlightComponent(allIds);
         }
    }
}

ReviewComplianceVisioModelBrowser.prototype.HighlightBrowserComponentRow = function (selectedNodeId, originalComponent) {
    var _this = this;
    
    if (!(selectedNodeId in this.NodeIdvsCheckComponent)) {
        return;
    }
    let checkComponent = this.NodeIdvsCheckComponent[selectedNodeId];

    var path = {};
    path['path'] = [checkComponent.Name];
    this.GetTopMostParentNode(checkComponent.Name, path);

    this.HighlightRow(path, checkComponent.Name);

    expandModelBrowserAccordion(this.SourceFileName, "#" + Compliance.MainReviewContainer).then(function (result) {
        var rowIndex = _this.TreeInstance.getRowIndexByKey(checkComponent.Name);
        var row = _this.TreeInstance.getRowElement(rowIndex);
        document.getElementById(Compliance.MainReviewContainer).scrollTop = row[0].offsetTop - row[0].offsetHeight;
    });

    // load detailed table
    var rowIndex = _this.TreeInstance.getRowIndexByKey(checkComponent.Name);
    var rows = _this.TreeInstance.getVisibleRows();
    if (rowIndex in rows) {
        this.LoadDetailedTable(rows[rowIndex].data);
    }
}

ReviewComplianceVisioModelBrowser.prototype.HighlightRow = function (path, itemName) {

    _this = this;
    if (!('path' in path)) {
        return;
    }

    var nodeList = path['path'];
    nodeList = nodeList.reverse();

    var container = "#" + _this.GetTableDivId();
    var treeList = $(container).dxTreeList("instance");

    // expand tree if not expanded else select row using key
    for (var i = 0; i < nodeList.length; i++) {
        var node = nodeList[i];

        if (!treeList.isRowExpanded(node)) {
            treeList.expandRow(node).done(function () {
                _this.HighlightBrowserRowByKey(itemName, container);
            });
        }
        else {
            if (i == nodeList.length - 1) {
                _this.HighlightBrowserRowByKey(itemName, container);
            }
        }
    }
}

ReviewComplianceVisioModelBrowser.prototype.HighlightBrowserRowByKey = function (key, containerDiv) {
    var _this = this;

    var rowIndex = this.TreeInstance.getRowIndexByKey(key);
    var row = this.TreeInstance.getRowElement(rowIndex);

    _this.GetSelectionManager().MaintainHighlightedRow(row[0], containerDiv, key);
}

ReviewComplianceVisioModelBrowser.prototype.GetTopMostParentNode = function (item, path) {

    if (item in this.NodeParentList) {

        if (this.NodeParentList[item] === 0) {
            return;
        }
        path['path'].push(this.NodeParentList[item])

        this.GetTopMostParentNode(this.NodeParentList[item], path);
    }
}


ReviewComplianceVisioModelBrowser.prototype.GetAllChildIds = function (treeNode) {
    let ids = [];
    if (treeNode && 
        treeNode.data.NodeId) {
        ids.push(treeNode.data.NodeId);
    }

    for (let i = 0; i < treeNode.children.length; i++) {
        let childIds = this.GetAllChildIds(treeNode.children[i]);
        ids = ids.concat(childIds);
    }

    return ids;
}

ReviewComplianceVisioModelBrowser.prototype.GetCheckComponent = function (groupId, componentId) {
    var checkGroup = this.GetCheckGroup(groupId);
    var component = checkGroup.components[componentId];

    return component;
}

ReviewComplianceVisioModelBrowser.prototype.GetCheckGroup = function (groupId) {
    return this.CheckData.results[groupId];
}

ReviewComplianceVisioModelBrowser.prototype.Destroy = function () {

    $("#" + this.GetTableDivId()).remove()
    //Destroy accordion

    var complianceTableData = document.getElementById(Compliance.MainReviewContainer).innerHTML;
    if (complianceTableData !== "") {
        $("#" + Compliance.MainReviewContainer).dxAccordion("dispose");
        complianceTableData = "";
    }

    this.DestroyDetailedInfoTable();

    //clear view
    this.GetViewer().Clear();
}

ReviewComplianceVisioModelBrowser.prototype.DestroyDetailedInfoTable = function () {

    var table = document.getElementById(Compliance.DetailInfoContainer);
    //Destroy dxDataGrid
    if (table.children.length > 0) {
        var tableContainer = "#" + Compliance.DetailInfoContainer;
        $(tableContainer).dxDataGrid("dispose");
        $(tableContainer).remove()
    }

    var complianceDetailInfoContainer = document.getElementById("complianceDetailInfoContainer");
    var tableDiv = document.createElement("div");
    tableDiv.id = Compliance.DetailInfoContainer;
    complianceDetailInfoContainer.appendChild(tableDiv);
}