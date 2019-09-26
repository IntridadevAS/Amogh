function ComplianceCheckResultsTable(mainReviewTableContainer) {
    this.MainReviewTableContainer = mainReviewTableContainer;

    this.CheckTableIds = {};
}

ComplianceCheckResultsTable.prototype.CreateCheckGroupButton = function (componentClass) {

    var btn = document.createElement("BUTTON");
    btn.className = "accordion";
    btn.style.justifyContent = "left";
    var t = document.createTextNode(componentClass);       // Create a text node
    btn.appendChild(t);

    return btn;
}

ComplianceCheckResultsTable.prototype.CreateTableData = function (CheckComponents,
    groupId,
    mainClass) {

    // var _this = this;
    var tableData = [];

    for (var componentId in CheckComponents) {
        if (!CheckComponents.hasOwnProperty(componentId)) {
            continue;
        }
        // for (var j = 0; j < componentsGroup.CheckComponents.length; j++) {

        component = CheckComponents[componentId];

        tableRowContent = {};
        tableRowContent[ComplianceColumnNames.SourceName] = component.name;
        tableRowContent[ComplianceColumnNames.Status] = component.status;
        tableRowContent[ComplianceColumnNames.NodeId] = component.nodeId;
        tableRowContent[ComplianceColumnNames.ResultId] = component.id;
        tableRowContent[ComplianceColumnNames.GroupId] = groupId;

        tableData.push(tableRowContent);

        // maintain track of check components
        if (component.nodeId) {
            model.getCurrentReviewManager().SourceNodeIdvsCheckComponent[component.nodeId] = {
                "Id": component.id,
                "SourceAName": component.name,
                "MainClass": mainClass,
                "SourceANodeId": component.nodeId
            };

            model.getCurrentReviewManager().SourceComponentIdvsNodeId[component.id] = component.nodeId;
        }
    }

    return tableData;
}

ComplianceCheckResultsTable.prototype.CreateMainTableHeaders = function (source) {
    var columnHeaders = [];
    for (var i = 1; i < Object.keys(ComplianceColumns).length; i++) {
        columnHeader = {};
        var headerText;
        var hidden = false;
        if (i === ComplianceColumns.SourceName) {
            headerText = source;
            key = ComplianceColumnNames.SourceName;
            hidden = false;
        }
        else if (i === ComplianceColumns.Status) {
            headerText = "Status";
            key = ComplianceColumnNames.Status;
            hidden = false;
        }
        else if (i === ComplianceColumns.NodeId) {
            headerText = "NodeId";
            key = ComplianceColumnNames.NodeId;
            width = "0";
            hidden = true;
        }
        else if (i === ComplianceColumns.ResultId) {
            headerText = "ID";
            key = ComplianceColumnNames.ResultId;
            width = "0";
            hidden = true;
        }
        else if (i === ComplianceColumns.GroupId) {
            headerText = "groupId";
            key = ComplianceColumnNames.GroupId;
            width = "0";
            hidden = true;
        }

        columnHeader["headerText"] = headerText;
        columnHeader["key"] = key;
        columnHeader["dataType"] = "string";
        columnHeader["hidden"] = hidden;
        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}

ComplianceCheckResultsTable.prototype.populateReviewTable = function () {
    var parentTable = document.getElementById(this.MainReviewTableContainer);
    var ComplianceData = model.getCurrentReviewManager().ComplianceCheckManager;

    if (!("results" in ComplianceData)) {
        return;
    }
    var checkGroups = ComplianceData["results"];

    for (var groupId in checkGroups) {
        if (!checkGroups.hasOwnProperty(groupId)) {
            continue;
        }

        var componentsGroup = checkGroups[groupId];
        if (componentsGroup.components.length === 0) {
            continue;
        }

        var btn = this.CreateCheckGroupButton(componentsGroup.componentClass);
        parentTable.appendChild(btn);

        var div = document.createElement("DIV");
        div.className = "content scrollable";
        div.id = componentsGroup.componentClass.replace(/\s/g, '') + "_" + this.MainReviewTableContainer;
        parentTable.appendChild(div);

        var columnHeaders = this.CreateMainTableHeaders(ComplianceData.source);

        var tableData = this.CreateTableData(componentsGroup.components, groupId, componentsGroup.componentClass);;

        var id = "#" + div.id;
        this.LoadReviewTableData(columnHeaders, tableData, id);
        this.highlightMainReviewTableFromCheckStatus(div.id);

        // maintain table ids
        this.CheckTableIds[groupId] = id;
    }

}

ComplianceCheckResultsTable.prototype.highlightMainReviewTableFromCheckStatus = function (containerId) {
    var mainReviewTableContainer = document.getElementById(containerId);
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var mainReviewTableRows = mainReviewTableContainer.children[0].getElementsByTagName("tr");

    for (var i = 2; i < mainReviewTableRows.length; i++) {
        var currentRow = mainReviewTableRows[i];
        if (currentRow.cells.length === 1) {
            return;
        }
        var status = currentRow.cells[ComplianceColumns.Status].innerHTML;
        model.getCurrentSelectionManager().ChangeBackgroundColor(currentRow, status);
    }
}

ComplianceCheckResultsTable.prototype.LoadReviewTableData = function (columnHeaders, tableData, viewerContainer) {
    var _this = this;

    $(function () {
        var isFiredFromCheckbox = false;
        $(viewerContainer).igGrid({
            height: "202px",
            columns: columnHeaders,
            autofitLastColumn: false,
            autoGenerateColumns: false,
            dataSource: tableData,
            responseDataKey: "results",
            fixedHeaders: true,
            autoCommit: true,
            rendered: function (evt, ui) {
                var reviewComplianceContextMenuManager = new ReviewComplianceContextMenuManager(model.getCurrentReviewManager());
                reviewComplianceContextMenuManager.InitComponentLevelContextMenu(viewerContainer);
            },
            features: [
                {
                    name: "Sorting",
                    sortingDialogContainment: "window"
                },
                {
                    name: "Filtering",
                    type: "local",
                    // dataFiltered: function (evt, ui) {
                    //         var filteredData = evt.target.rows;
                    //     _this.RestoreBackgroundColorOfFilteredRows(filteredData);
                    // }
                },
                {
                    name: "Selection",
                    mode: 'row',
                    multipleSelection: true,
                    activation: true,
                    rowSelectionChanging: function (evt, ui) {

                        if (isFiredFromCheckbox) {
                            isFiredFromCheckbox = false;
                        } else {
                            var id = viewerContainer.replace("#", "");
                            var rowData = _this.GetDataForSelectedRow(ui.row.index, viewerContainer);
                            model.getCurrentSelectionManager().MaintainHighlightedRow(ui.row.element[0]);
                            model.getCurrentReviewManager().OnCheckComponentRowClicked(rowData, id)
                            return false;
                        }
                    }
                },
                {
                    name: "RowSelectors",
                    enableCheckBoxes: true,
                    enableRowNumbering: false,
                    enableSelectAllForPaging: true, // this option is true by default
                    checkBoxStateChanging: function (evt, ui) {
                        //we use this variable as a flag whether the selection is coming from a checkbox
                        isFiredFromCheckbox = true;
                    },
                    checkBoxStateChanged: function (evt, ui) {
                        model.getCurrentSelectionManager().HandleCheckComponentSelectFormCheckBox(ui.row[0], ui.state);
                    }
                },
                {
                    name: "Resizing"
                },
            ]

        });

        var container = document.getElementById(viewerContainer.replace("#", ""));
        container.style.margin = "0px"
        container.style.padding = "0";
    });
};

ComplianceCheckResultsTable.prototype.GetDataForSelectedRow = function (rowIndex, containerDiv) {
    var data = $(containerDiv).data("igGrid").dataSource.dataView();
    var rowData = data[rowIndex];
    return rowData;

    // var rowData = {};
    // var rowIndex = rowIndex;
    // $(function () {
    // var data = $(containerDiv).data("igGrid").dataSource.dataView();
    // var resultId = data[rowIndex].ID;
    // var groupId = data[rowIndex].groupId;
    // var nodeId = data[rowIndex].NodeId;
    // var status = data[rowIndex].Status;
    // var sourceName = data[rowIndex].SourceA;

    // rowData['Status'] = status;
    // rowData['SourceName'] = sourceName;
    // rowData['ResultId'] = resultId;
    // rowData['GroupId'] = groupId;
    // rowData['NodeId'] = nodeId;
    // });

    // return rowData;
}

ComplianceCheckResultsTable.prototype.Destroy = function () {

    for (var groupId in this.CheckTableIds) {
        var id = this.CheckTableIds[groupId];
        // clear previous grid
        if ($(id).data("igGrid") != null) {
            $(id).igGrid("destroy");
        }
    }

    document.getElementById(this.MainReviewTableContainer).innerHTML = "";
}

function ComplianceCheckPropertiesTable(detailedReviewTableContainer) {
    this.DetailedReviewTableContainer = detailedReviewTableContainer;
    // this.detailedReviewRowComments = reviewManager.detailedReviewRowComments;
}

ComplianceCheckPropertiesTable.prototype.CreatePropertiesTableHeader = function (source) {

    var group = [];
    var columnHeader = {}
    var columnHeaders = [];
    for (var i = 1; i < Object.keys(CompliancePropertyColumns).length; i++) {
        var headerGroupComp = {}
        var headerText;
        if (i === CompliancePropertyColumns.PropertyName) {
            headerText = "Property";
            key = CompliancePropertyColumnNames.PropertyName;
        }
        else if (i === CompliancePropertyColumns.PropertyValue) {
            headerText = "Value";
            key = CompliancePropertyColumnNames.PropertyValue;
        }
        else if (i === CompliancePropertyColumns.Status) {
            headerText = "Status";
            key = CompliancePropertyColumnNames.Status;
        }

        headerGroupComp["headerText"] = headerText;
        headerGroupComp["key"] = key;
        headerGroupComp["dataType"] = "string";
        group.push(headerGroupComp);
    }

    columnHeader["headerText"] = source;
    columnHeader["group"] = group;

    columnHeaders.push(columnHeader)
    return columnHeaders;
}

ComplianceCheckPropertiesTable.prototype.addPropertyRowToDetailedTable = function (property, columnHeaders) {

    tableRowContent = {};
    tableRowContent[CompliancePropertyColumnNames.PropertyName] = property.name;
    tableRowContent[CompliancePropertyColumnNames.PropertyValue] = property.value;
    if (property.performCheck === "1" &&
        property.result === "1") {
        tableRowContent[ComparisonPropertyColumnNames.Status] = "OK";
    }
    else {
        tableRowContent[ComparisonPropertyColumnNames.Status] = property.severity;
    }
    return tableRowContent;
}


ComplianceCheckPropertiesTable.prototype.populateDetailedReviewTable = function (rowData) {

    // var tableData = [];
    // var columnHeaders = [];

    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    var component = model.getCurrentReviewManager().GetCheckComponent(groupId, componentId);

    var columnHeaders = this.CreatePropertiesTableHeader(model.getCurrentReviewManager().ComplianceCheckManager.source);

    var tableData = [];
    for (var propertyId in component.properties) {
        property = component.properties[propertyId];

        //this.detailedReviewRowComments[Object.keys(this.detailedReviewRowComments).length] = property.Description;

        tableRowContent = this.addPropertyRowToDetailedTable(property, columnHeaders);
        tableData.push(tableRowContent);
    }

    var id = "#" + this.DetailedReviewTableContainer;
    this.LoadDetailedReviewTableData(columnHeaders, tableData, id);
    this.highlightDetailedReviewTableFromCheckStatus(this.DetailedReviewTableContainer)

    // for (var componentsGroupID in this.ReviewManager.ComplianceCheckManager) {

    //     // get the componentgroupd corresponding to selected component 
    //     var componentsGroupList = this.ReviewManager.ComplianceCheckManager[componentsGroupID];
    //     if (componentsGroupList && componentsGroupID != "restore") {

    //         var component = componentsGroupList[groupId].CheckComponents[componentId];


    //         // var div = document.createElement("DIV");
    //         // parentTable.appendChild(div);

    //         // div.innerHTML = "Check Details :";
    //         // div.style.fontSize = "20px";
    //         // div.style.fontWeight = "bold";

    //         var columnHeaders = this.CreatePropertiesTableHeader()

    //         // // show component class name as property in detailed review table               

    //         for (var propertyId in component.properties) {
    //             property = component.properties[propertyId];

    //             this.detailedReviewRowComments[Object.keys(this.detailedReviewRowComments).length] = property.Description;

    //             tableRowContent = this.addPropertyRowToDetailedTable(property, columnHeaders);
    //             tableData.push(tableRowContent);
    //         }

    //         var id = "#" + this.DetailedReviewTableContainer;
    //         this.LoadDetailedReviewTableData(columnHeaders, tableData, id);
    //         this.highlightDetailedReviewTableFromCheckStatus(this.DetailedReviewTableContainer)

    //         // var modelBrowserData = document.getElementById(this.DetailedReviewTableContainer);
    //         // // jsGridHeaderTableIndex = 0 
    //         // // jsGridTbodyTableIndex = 1
    //         // var modelBrowserHeaderTable = modelBrowserData.children[jsGridHeaderTableIndex];
    //         // modelBrowserHeaderTable.style.position = "fixed"
    //         // modelBrowserHeaderTable.style.width = "565px";
    //         // modelBrowserHeaderTable.style.backgroundColor = "white";
    //         // modelBrowserHeaderTable.style.overflowX = "hidden";

    //         // // jsGridHeaderTableIndex = 0 
    //         // // jsGridTbodyTableIndex = 1
    //         // var modelBrowserDataTable = modelBrowserData.children[jsGridTbodyTableIndex]
    //         // modelBrowserDataTable.style.position = "static"
    //         // modelBrowserDataTable.style.width = "579px";
    //         // modelBrowserDataTable.style.margin = "55px 0px 0px 0px"

    //         break;
    //         //}
    //     }
    // }
}

ComplianceCheckPropertiesTable.prototype.LoadDetailedReviewTableData = function (columnHeaders, tableData, viewerContainer) {
    var _this = this;

    // clear previous grid
    if ($(viewerContainer).data("igGrid") != null) {
        $(viewerContainer).igGrid("destroy");
    }

    $(function () {
        $(viewerContainer).igGrid({
            // width: "100%",
            height: "100%",
            columns: columnHeaders,
            autoGenerateColumns: false,
            dataSource: tableData,
            responseDataKey: "results",
            fixedHeaders: true,
            rendered: function (evt, ui) {
                var reviewComplianceContextMenuManager = new ReviewComplianceContextMenuManager(model.getCurrentReviewManager());
                reviewComplianceContextMenuManager.InitPropertyLevelContextMenu(viewerContainer);
            },
            features: [
                {
                    name: 'MultiColumnHeaders'
                },
                {
                    name: "Sorting",
                    sortingDialogContainment: "window"
                },
                {
                    name: "Filtering",
                    type: "local",
                    // dataFiltered: function (evt, ui) {
                    //         var filteredData = evt.target.rows;
                    //     // _this.RestoreBackgroundColorOfFilteredRows(filteredData);
                    // }
                },
                {
                    name: "Selection",
                    mode: 'row',
                    multipleSelection: true,
                    activation: true,
                    rowSelectionChanging: function (evt, ui) {
                        //var comment = _this.detailedReviewRowComments[ui.row.index];
                        var commentDiv = document.getElementById("ComparisonDetailedReviewComment");
                        if (comment) {
                            commentDiv.innerHTML = "Comment : <br>" + comment;
                        }
                        else {
                            commentDiv.innerHTML = "Comment : <br>";
                        }
                    }
                },
                {
                    name: "RowSelectors",
                    enableCheckBoxes: true,
                    enableRowNumbering: false,
                    enableSelectAllForPaging: true, // this option is true by default
                },
                {
                    name: "Resizing"
                },
            ]

        });
    });

    var container = document.getElementById(viewerContainer.replace("#", ""));
    container.style.margin = "0px";
};

ComplianceCheckPropertiesTable.prototype.highlightDetailedReviewTableFromCheckStatus = function (containerId) {
    var detailedReviewTableContainer = document.getElementById(containerId);
    if (detailedReviewTableContainer === null) {
        return;
    }
    if (detailedReviewTableContainer.children.length === 0) {
        return;
    }
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var detailedReviewTableRows = detailedReviewTableContainer.children[0].getElementsByTagName("tr");

    for (var i = 3; i < detailedReviewTableRows.length; i++) {
        var currentRow = detailedReviewTableRows[i];
        if (currentRow.cells.length < 2) {
            return;
        }
        var status = currentRow.cells[CompliancePropertyColumns.Status].innerHTML;
        model.getCurrentSelectionManager().ChangeBackgroundColor(currentRow, status);
    }
}

ComplianceCheckPropertiesTable.prototype.Destroy = function () {

    var viewerContainer = "#" + this.DetailedReviewTableContainer;
    // clear previous grid
    if ($(viewerContainer).data("igGrid") != null) {
        $(viewerContainer).igGrid("destroy");
    }
}