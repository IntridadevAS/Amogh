function ComparisonCheckResultsTable(reviewManager,
    mainReviewTableContainer) {

    
    this.MainReviewTableContainer = mainReviewTableContainer;
    this.ReviewManager = reviewManager;
    
}

ComparisonCheckResultsTable.prototype.CreateCheckGroupButton = function(groupId, componentClass)
{
    
    // var btn = document.createElement("BUTTON");
    // var att = document.createAttribute("groupId");
    // att.value = groupId;
    // btn.setAttributeNode(att);       // Create a <button> element
    // btn.className = "collapsible";
    // var t = document.createTextNode(componentClass);       // Create a text node
    // btn.appendChild(t);

    var btn = document.createElement("BUTTON");
    btn.className = "accordion";
    var t = document.createTextNode(componentClass);       // Create a text node
    btn.appendChild(t);
    return btn;
}

ComparisonCheckResultsTable.prototype.CreateMainTableHeaders = function()
{
    var columnHeaders = [];
    for (var i = 1; i < Object.keys(ComparisonColumns).length; i++) {
        columnHeader = {};
        var headerText;
        var hidden = false;
        if (i === ComparisonColumns.Select) {
            continue;
        }
        else if (i === ComparisonColumns.SourceAName) {
            headerText = 'SourceA';
            key = ComparisonColumnNames.SourceAName;
            hidden = false;
            width = "35%";
        }
        else if (i === ComparisonColumns.SourceBName) {
            headerText = "SourceB";
            key = ComparisonColumnNames.SourceBName;
            hidden = false;
            width = "35%";
        }
        else if (i === ComparisonColumns.Status) {
            headerText = "Status";
            key = ComparisonColumnNames.Status;
            hidden = false;
            width = "30%";
        }
        else if (i === ComparisonColumns.SourceANodeId) 
        {
            headerText = "SourceANodeId";
            key = ComparisonColumnNames.SourceANodeId;
            hidden = true;
            width = "0%";
        }
        else if (i === ComparisonColumns.SourceBNodeId) 
        {
            headerText = "SourceBNodeId";
            key = ComparisonColumnNames.SourceBNodeId;
            hidden = true;
            width = "0%";
        }
        else if (i === ComparisonColumns.ResultId) 
        {
            headerText = "ID";
            key = ComparisonColumnNames.ResultId;
            hidden = true;
            width = "0%";
        }
        else if (i === ComparisonColumns.GroupId) 
        {
            headerText = "groupId";
            key = ComparisonColumnNames.GroupId;
            hidden = true;
            width = "0%";
        }

        columnHeader["headerText"] = headerText;
        columnHeader["key"] = key;
        columnHeader["dataType"] = "string";
        columnHeader["hidden"] = hidden;
        // columnHeader["width"] = width;
        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}

ComparisonCheckResultsTable.prototype.CreateTableData =function(checkComponents, 
    groupId,
    mainClass)
{

    var _this = this;
    var tableData = [];
        for (var componentId in checkComponents)
        {

        component = checkComponents[componentId];            

        tableRowContent = {};
            
        tableRowContent[ComparisonColumnNames.SourceAName] = component.sourceAName;
        tableRowContent[ComparisonColumnNames.SourceBName] = component.sourceBName;
        tableRowContent[ComparisonColumnNames.Status] = component.status;
        tableRowContent[ComparisonColumnNames.SourceANodeId] = component.sourceANodeId;
        tableRowContent[ComparisonColumnNames.SourceBNodeId] = component.sourceBNodeId;
        tableRowContent[ComparisonColumnNames.ResultId] = component.id;
        tableRowContent[ComparisonColumnNames.GroupId] = component.ownerGroup;

        tableData.push(tableRowContent);

        this.ReviewManager.MaintainNodeIdVsCheckComponent(component, mainClass);
    }

    return tableData;   
}

ComparisonCheckResultsTable.prototype.highlightMainReviewTableFromCheckStatus = function (containerId) {
    var mainReviewTableContainer = document.getElementById(containerId);
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var mainReviewTableRows = mainReviewTableContainer.children[0].getElementsByTagName("tr");

    for (var i = 1; i < mainReviewTableRows.length; i++) {
        var currentRow = mainReviewTableRows[i];
        if (currentRow.cells.length < 3) {
            return;
        }
        var status = currentRow.cells[ComparisonColumns.Status].innerText;
        this.ReviewManager.SelectionManager.ChangeBackgroundColor(currentRow, status);
    }
}


ComparisonCheckResultsTable.prototype.populateReviewTable = function () {
    var ComparisonTableData = this.ReviewManager.ComparisonCheckManager;
    var parentTable = document.getElementById(this.MainReviewTableContainer);

    if (!("results" in ComparisonTableData)) {
        return;
    }
    // for (var key in ComparisonTableData) {
    //     if (!ComparisonTableData.hasOwnProperty(key)) {
    //         continue;
    //     }

    var checkGroups = ComparisonTableData["results"];
    for (var groupId in checkGroups) {
        if (!checkGroups.hasOwnProperty(groupId)) {
            continue;
        }

        // get check group
        var componentsGroup = checkGroups[groupId];
        if (componentsGroup.components.length === 0) {
            continue;
        }

        // create check group button
        var btn = this.CreateCheckGroupButton(groupId, componentsGroup.componentClass);
        parentTable.appendChild(btn);

        var div = document.createElement("DIV");
        div.className = "content scrollable";
        div.id = componentsGroup.componentClass.replace(/\s/g, '');
        parentTable.appendChild(div);

        // create column headers
        var columnHeaders = this.CreateMainTableHeaders();

        // create table data
        var tableData = this.CreateTableData(componentsGroup.components, groupId, componentsGroup.componentClass);

        var id = "#" + div.id;

        // Create table for category results
        this.LoadReviewTableData(columnHeaders, tableData, id);

        // highlight table rows as per their severity status
        this.highlightMainReviewTableFromCheckStatus(div.id);

        // Add category check results count 
        this.ReviewManager.AddTableContentCount(div.id);
    }
    //}
}

ComparisonCheckResultsTable.prototype.RestoreBackgroundColorOfFilteredRows = function(filteredData) {
    for(var row = 0; row < filteredData.length; row++) {
        var status = this.ReviewManager.GetCellValue(filteredData[row], ComparisonColumns.Status);
        this.ReviewManager.SelectionManager.ChangeBackgroundColor(filteredData[row], status);            
    }
}

ComparisonCheckResultsTable.prototype.LoadReviewTableData = function (columnHeaders, 
                                                                      tableData, 
                                                                      containerDiv) {
    var _this = this;
    
    $(function () {
        var isFiredFromCheckbox = false;
        $(containerDiv).igGrid({
            // width : "575px",
            height : "202px",
            columns: columnHeaders,
            autofitLastColumn: false,
            autoGenerateColumns: false,
            dataSource : tableData,
            responseDataKey: "results",
            fixedHeaders : true,
            autoCommit: true,            
            rendered: function (evt, ui) {                
                //reviewComparisonContextMenuManager.Init();
                var reviewComparisonContextMenuManager = new ReviewComparisonContextMenuManager(_this.ReviewManager);
                reviewComparisonContextMenuManager.InitComponentLevelContextMenu(containerDiv);
                // ReviewComparisonContextMenuManagers[containerDiv] = reviewComparisonContextMenuManager;
            },  
            features: [
                {
                    name: "Sorting",
                    sortingDialogContainment: "window"
                },
                {
                    name: "Filtering",
                    type: "local",
                    dataFiltered: function (evt, ui) {
                            var filteredData = evt.target.rows;
                        _this.RestoreBackgroundColorOfFilteredRows(filteredData);
                    }
                },
                {
                    name: "Selection",
                    mode: 'row',
                    multipleSelection: true,
                    activation: true,
                    rowSelectionChanging : function(evt, ui) {
                        
                        if (isFiredFromCheckbox) {
                            isFiredFromCheckbox = false;
                        } else {
                            var id = containerDiv.replace("#", "");
                            var rowData = _this.GetDataForSelectedRow(ui.row.index, containerDiv);
                            _this.ReviewManager.SelectionManager.MaintainHighlightedRow(ui.row.element[0]); 
                            _this.ReviewManager.OnCheckComponentRowClicked(rowData, id)
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
                        _this.ReviewManager.SelectionManager.HandleCheckComponentSelectFormCheckBox(ui.row[0], ui.state);
                    }
                },
                {
                    name: "Resizing"
                },
            ]

        });
    });
    
    var container = document.getElementById(containerDiv.replace("#", ""));
    container.style.margin = "0px"
    container.style.padding = "0";

};

ComparisonCheckResultsTable.prototype.GetDataForSelectedRow = function(rowIndex, containerDiv) {
    // var rowData = {};
    // var rowIndex = rowIndex;
    // $(function () {
    // var data = $(containerDiv).data("igGrid").dataSource.dataView();
    // var ResultId = data[rowIndex].ID;
    // var GroupId = data[rowIndex].groupId;
    // var SourceANodeId = data[rowIndex].SourceANodeId;
    // var SourceBNodeId = data[rowIndex].SourceBNodeId;
    // var Status = data[rowIndex].Status;
    // var SourceBName = data[rowIndex].SourceB;
    // var SourceAName = data[rowIndex].SourceA;

    // rowData['Status'] = Status;
    // rowData['SourceBName'] = SourceBName;
    // rowData['SourceAName'] = SourceAName;
    // rowData['ResultId'] = ResultId;
    // rowData['GroupId'] = GroupId;
    // rowData['SourceANodeId'] = SourceANodeId;
    // rowData['SourceBNodeId'] = SourceBNodeId;
    // });

    var data = $(containerDiv).data("igGrid").dataSource.dataView();
    var rowData = data[rowIndex];
    return rowData;
}

function ComparisonCheckPropertiesTable(reviewManager, detailedReviewTableContainer) {
    this.ReviewManager = reviewManager;
    this.DetailedReviewTableContainer = detailedReviewTableContainer;
}

ComparisonCheckPropertiesTable.prototype.CreatePropertiesTableHeader = function() {
    var columnHeaders = [];

    for(var i = 0; i < 3; i++) {
        columnHeader = {}
        var headerText;
        var headerGroup;
        var dataType;
        if(i == 0) {
            var group  = [];
            for(var j = 1; j < Object.keys(ComparisonPropertyColumns).length; j++) {
                var headerGroupComp = {}
                if (j === ComparisonPropertyColumns.SourceAName) {
                    headerText = "Property";
                    key = ComparisonPropertyColumnNames.SourceAName;

                    headerGroupComp["headerText"] = headerText;
                    headerGroupComp["key"] = key;
                    headerGroupComp["dataType"] = "string";
                    // headerGroupComp["width"] = "27%";

                    group[0] = headerGroupComp;
                }
                else if (j === ComparisonPropertyColumns.SourceAValue) {
                    headerText = "Value";
                    key = ComparisonPropertyColumnNames.SourceAValue;
                    headerGroupComp["headerText"] = headerText;
                    headerGroupComp["key"] = key;
                    headerGroupComp["dataType"] = "string";
                    // headerGroupComp["width"] = "27%";
                    
                    group[1] = headerGroupComp;
                }
            }
            headerText = "SourceA";
            key = null;
            headerGroup = group;
        }

        if(i == 1) {
            var group  = [];
            for(var j = 1; j < Object.keys(ComparisonPropertyColumns).length; j++) {
                var headerGroupComp = {}
                if (j === ComparisonPropertyColumns.SourceBValue) {
                    headerText = "Value";
                    key = ComparisonPropertyColumnNames.SourceBValue;
                    headerGroupComp["headerText"] = headerText;
                    headerGroupComp["key"] = key;
                    headerGroupComp["dataType"] = "string";
                    // headerGroupComp["width"] = "27%";

                    group[0] = headerGroupComp;
                }
                else if (j === ComparisonPropertyColumns.SourceBName) {
                    headerText = "Property";
                    key = ComparisonPropertyColumnNames.SourceBName;

                    headerGroupComp["headerText"] = headerText;
                    headerGroupComp["key"] = key;
                    headerGroupComp["dataType"] = "string";
                    // headerGroupComp["width"] = "27%";

                    group[1] = headerGroupComp;
                }
            }
            headerText = "SourceB";
            key = null;
            headerGroup = group;
        }

        if(i == 2) {
            headerText = "Status";
            key = ComparisonPropertyColumnNames.Status;
            dataType = "string";
            headerGroup = []
        }

        columnHeader["headerText"] = headerText;
        if(key !== null) {
            columnHeader["key"] = key;
        }
        
        if(headerGroup.length > 1 && headerGroup !== undefined){
            columnHeader["group"] = headerGroup;
        }

        if(dataType)
            columnHeader["dataType"] = dataType;
        columnHeaders.push(columnHeader);
    }
    
    return columnHeaders;
}

ComparisonCheckPropertiesTable.prototype.CreateTableData = function (properties) {

    var property;
    var tableData = [];
    for (var propertyId in properties) {
        property = properties[propertyId];
        tableRowContent = {};
        tableRowContent[ComparisonPropertyColumnNames.SourceAName] = property.sourceAName;
        tableRowContent[ComparisonPropertyColumnNames.SourceAValue] = property.sourceAValue;
        tableRowContent[ComparisonPropertyColumnNames.SourceBValue] = property.sourceBValue;
        tableRowContent[ComparisonPropertyColumnNames.SourceBName] = property.sourceBName;
        tableRowContent[ComparisonPropertyColumnNames.Status] = property.severity;

        if (property.transpose == 'lefttoright' && property.severity !== 'No Value') {
            tableRowContent[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            tableRowContent[ComparisonPropertyColumnNames.sourceBValue] = property.sourceAValue;
        }
        else if (property.transpose == 'righttoleft' && property.severity !== 'No Value') {
            tableRowContent[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            tableRowContent[ComparisonPropertyColumnNames.sourceAValue] = property.sourceBValue;
        }

        this.ReviewManager.detailedReviewRowComments[Object.keys(this.ReviewManager.detailedReviewRowComments).length] = property.description;

        tableData.push(tableRowContent);
    }

    return tableData;
}

ComparisonCheckPropertiesTable.prototype.populateDetailedReviewTable = function (rowData) {
    // clear comment
    this.SetComment("");

    this.detailedReviewRowComments = {};

    var tableData = [];
    var columnHeaders = [];

    var componentId = rowData.ID;
    var groupId = rowData.groupId;

    var results = this.ReviewManager.ComparisonCheckManager["results"];
    if (!(groupId in results)) {
        return;
    }

    // get the componentgroupd corresponding to selected component 
    var componentsGroup = results[groupId];
    if (!(componentId in componentsGroup.components)) {
        return;
    }

    var component = componentsGroup.components[componentId];

    var columnHeaders = this.CreatePropertiesTableHeader();

    // show component class name as property in detailed review table    
    var tableData = this.CreateTableData(component.properties);

    this.LoadDetailedReviewTableData(columnHeaders, tableData);
    this.highlightDetailedReviewTableFromCheckStatus(this.DetailedReviewTableContainer)

}

ComparisonCheckPropertiesTable.prototype.LoadDetailedReviewTableData = function (columnHeaders, tableData) {
    var viewerContainer = "#" + this.DetailedReviewTableContainer;
    var _this = this;

    $(function () {
        $(viewerContainer).igGrid({
            // width: "100%",
            height : "100%",
            columns: columnHeaders,
            autoGenerateColumns: false,
            dataSource : tableData,
            responseDataKey: "results",
            fixedHeaders : true,
            autofitLastColumn: true,
            rendered: function (evt, ui) {                
                //reviewComparisonContextMenuManager.Init();
                var reviewComparisonContextMenuManager = new ReviewComparisonContextMenuManager( _this.ReviewManager);
                reviewComparisonContextMenuManager.InitPropertyLevelContextMenu(viewerContainer);
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
                    rowSelectionChanging : function(evt, ui) {
                        var comment = _this.ReviewManager.detailedReviewRowComments[ui.row.index];
                        var commentDiv = document.getElementById("ComparisonDetailedReviewComment");
                        if (comment) {
                            commentDiv.innerHTML = "Comment : <br>" + comment;
                        }
                        else {
                            commentDiv.innerHTML = "Comment : <br>";
                        }
                        // console.log(_this.ReviewManager.detailedReviewRowComments)
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

    // var container = document.getElementById(viewerContainer.replace("#", ""));
    // container.style.margin = "0px";
};

ComparisonCheckPropertiesTable.prototype.highlightDetailedReviewTableFromCheckStatus = function (containerId) {
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

    // skip header and filter textbox, hence i = 3
    for (var i = 3; i < detailedReviewTableRows.length; i++) {
        var currentRow = detailedReviewTableRows[i];
        if (currentRow.cells.length > 1) {
            var status = currentRow.cells[ComparisonPropertyColumns.Status].innerHTML;
            this.ReviewManager.SelectionManager.ChangeBackgroundColor(currentRow, status);
        }
    }
}

ComparisonCheckPropertiesTable.prototype.SetComment = function (comment) {
    // var commentDiv = document.getElementById("ComparisonDetailedReviewComment");
    // commentDiv.innerHTML = comment;
}
