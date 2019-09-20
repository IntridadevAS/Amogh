
function ComplianceReviewManager(complianceCheckManager,
    viewerData,
    sourceComponents,
    mainReviewTableContainer,
    detailedReviewTableContainer,
    detailedReviewRowCommentDiv /*,
    componentsHierarchy*/) {

    this.ViewerData = viewerData;

    this.SourceComponents = sourceComponents;    

    this.ComplianceCheckManager = complianceCheckManager;

    this.MainReviewTableContainer = mainReviewTableContainer;
    this.DetailedReviewTableContainer = detailedReviewTableContainer;

    this.NodeIdStatusData = complianceCheckManager.ComponentsHierarchy;
    this.SourceAViewerCurrentSheetLoaded = undefined;
    this.SourceBViewerCurrentSheetLoaded = undefined;

    //ComponentIdVsComponentData = componentIdVsComponentData;
    //this.NodeIdVsComponentData = nodeIdVsComponentData;

    // this.SelectedComponentRowFromSheet;
    //this.SelectedComponentRowFromSheetA;
    // this.SelectedComponentRowFromSheetB;

    this.checkStatusArray = {};

    this.detailedReviewRowComments = {};
    this.DetailedReviewRowCommentDiv = detailedReviewRowCommentDiv;

    this.SourceNodeIdvsCheckComponent = {};
    this.SourceComponentIdvsNodeId = {};

    this.SourceViewerCurrentSheetLoaded = undefined;
}

ComplianceReviewManager.prototype.loadDatasource = function (containerId) {
    if (this.ViewerData["endPointUri"] !== undefined) {
        

        var viewerInterface  = new Review3DViewerInterface([containerId, this.ViewerData["endPointUri"]],
            this.ComponentIdVsComponentData,
            this.NodeIdVsComponentData,
            this);
        viewerInterface.NodeIdStatusData = this.NodeIdStatusData;

        viewerInterface.setupViewer(550, 300);

        model.checks["compliance"]["viewer"] = viewerInterface;
        // var viewerContainer = document.getElementById(containerId);
        // viewerContainer.style.height = "405px";
        // viewerContainer.style.top = "70px";
    }
    else if (this.SourceComponents !== undefined) {
        model.checks["compliance"]["viewer"] = new Review1DViewerInterface("a", this.SourceComponents);
    }
}

ComplianceReviewManager.prototype.unhighlightSelectedSheetRow = function (checkStatusArray, currentRow) {
    var rowIndex = currentRow.rowIndex;
    obj = Object.keys(checkStatusArray)
    var status = checkStatusArray[obj[0]][rowIndex]
    if (status !== undefined) {
        model.getCurrentSelectionManager().ChangeBackgroundColor(currentRow, status);
    }
    else {
        color = "#fffff"
        for (var j = 0; j < currentRow.cells.length; j++) {
            cell = currentRow.cells[j];
            cell.style.backgroundColor = color;
        }
    }
}

ComplianceReviewManager.prototype.CreateMainTableHeaders = function () {
    var columnHeaders = [];
    for (var i = 0; i < Object.keys(ComplianceColumns).length; i++) {
        columnHeader = {};
        var title;
        if (i === ComplianceColumns.Select) {
            title = '';//"Source A";
            name = ComplianceColumnNames.Select;
            width = "20";
        }
        else if (i === ComplianceColumns.SourceName) {
            // if (this.MainReviewTableContainer === "SourceAComplianceMainReviewCell") {
            //     title = "Name";
            // }
            // if (this.MainReviewTableContainer === "SourceBComplianceMainReviewCell") {
            //title = AnalyticsData.SourceBName;
            title = "Name";
            // }
            // title = "Source A";
            name = ComplianceColumnNames.SourceName;
        }
        else if (i === ComplianceColumns.Status) {
            title = "Status";
            name = ComplianceColumnNames.Status;
        }
        else if (i === ComplianceColumns.NodeId) {
            title = "NodeId";
            name = ComplianceColumnNames.NodeId;
            width = "10";
        }
        else if (i === ComplianceColumns.ResultId) {
            title = "ID";
            name = ComplianceColumnNames.ResultId;
            width = "10";
        }
        else if (i === ComplianceColumns.GroupId) {
            title = "groupId";
            name = ComplianceColumnNames.GroupId;
            width = "10";
        }

        columnHeader["title"] = title;
        columnHeader["name"] = name;
        columnHeader["type"] = "text";
        columnHeader["width"] = "20";
        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}



ComplianceReviewManager.prototype.CreateCheckGroupButton = function (groupId, componentClass) {

    var btn = document.createElement("BUTTON");
    var att = document.createAttribute("groupId");
    att.value = groupId;
    btn.setAttributeNode(att);       // Create a <button> element
    btn.className = "collapsible";
    var t = document.createTextNode(componentClass);       // Create a text node
    btn.appendChild(t);

    return btn;
}

ComplianceReviewManager.prototype.highlightMainReviewTableFromCheckStatus = function (containerId) {
    var mainReviewTableContainer = document.getElementById(containerId);
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var mainReviewTableRows = mainReviewTableContainer.children[0].getElementsByTagName("tr");

    for (var i = 0; i < mainReviewTableRows.length; i++) {
        var currentRow = mainReviewTableRows[i];
        if (currentRow.cells.length === 1) {
            return;
        }
        var status = currentRow.cells[ComplianceColumns.Status].innerHTML;
        model.getCurrentSelectionManager().ChangeBackgroundColor(currentRow, status);
    }
}

ComplianceReviewManager.prototype.OnCheckComponentRowClicked = function (rowData, containerDiv) {
    // var commentDiv = document.getElementById(this.DetailedReviewRowCommentDiv);
    // commentDiv.innerHTML = "";

    this.detailedReviewRowComments = {};


    model.checks["compliance"]["detailedInfoTable"].populateDetailedReviewTable(rowData);
    var tempString = "_" + this.MainReviewTableContainer;
    containerDiv = containerDiv.replace("#", "");
    var sheetName = containerDiv.replace(tempString, "");

    if (this.SourceComponents !== undefined) {      

        model.checks["compliance"]["viewer"].ShowSheetDataInViewer(Compliance.ViewerContainer, sheetName, rowData);
    }
    else if (this.ViewerData["endPointUri"] !== undefined) {
        this.HighlightComponentInGraphicsViewer(rowData)
    }
}

ComplianceReviewManager.prototype.GetComplianceResultId = function (selectedRow) {
    return selectedRow.cells[ComplianceColumns.ResultId].innerHTML;
}

ComplianceReviewManager.prototype.GetComplianceResultGroupId = function (selectedRow) {
    return selectedRow.cells[ComplianceColumns.GroupId].innerHTML;
}

ComplianceReviewManager.prototype.AcceptComponent = function (selectedRow, tableContainer, tableToUpdate, componentId, groupId) {
    var _this = this;
        
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'tabletoupdate': tableToUpdate,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                // var checkResultGroup = _this.ComplianceCheckManager["CheckGroups"][groupId];
                // var checkResultComponent = checkResultGroup["CheckComponents"][componentId];
                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);

                var properties = checkResultComponent["properties"];
                checkResultComponent.status = "OK(A)";

                for (var propertyId in properties) {
                    property = properties[propertyId];
                    if (property.severity !== "OK")
                        property.severity = 'ACCEPTED';
                }
                _this.updateReviewComponentGridData(selectedRow[0], 
                                                   tableContainer, 
                                                   checkResultComponent.status, 
                                                   true, 
                                                   ComplianceColumns.Status);
            }
        });
    }
    catch (error) { }
}

ComplianceReviewManager.prototype.AcceptProperty = function (selectedRow, 
                                                             tableContainer, 
                                                             tableToUpdate, 
                                                             componentId, 
                                                             groupId) {
    var _this = this;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    // var tableToUpdate = tableToUpdate;
    // var componentId = this.GetComplianceResultId(this.SelectionManager.HighlightedCheckComponentRow);
    // var groupId = this.GetComplianceResultGroupId(this.SelectionManager.HighlightedCheckComponentRow);

    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'tabletoupdate': tableToUpdate,
                'sourcePropertyName': _this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]),
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var originalstatus = _this.getStatusFromMainReviewRow(model.getCurrentSelectionManager().HighlightedCheckComponentRow);

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);
                // var checkResultGroup = _this.ComplianceCheckManager["CheckGroups"][groupId];
                // var checkResultComponent = checkResultGroup["CheckComponents"][componentId];
                var properties = checkResultComponent["properties"];
                var changedStatus = originalstatus;
                if (!originalstatus.includes("(A)")) {
                    changedStatus = originalstatus + "(A)";
                    checkResultComponent["Status"] = changedStatus;
                }
                if (msg.trim() == "OK(A)") {
                    var changedStatus = msg.trim();
                    checkResultComponent["Status"] = changedStatus;
                    model.getCurrentSelectionManager().GetRowHighlightColor(changedStatus);
                }
                
                for (var i = 0; i < properties.length; i++) {
                    var property =  properties[i];
                    var name = property["name"];
                    if (!name) {
                        name = "";
                    }

                    if (name == selectedRow[0].cells[CompliancePropertyColumns.PropertyName].innerText) {
                        property["severity"] = "ACCEPTED";
                        selectedRow[0].cells[CompliancePropertyColumns.Status].innerHTML = "ACCEPTED";
                        model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], "ACCEPTED");
                        break;
                    }

                }

                _this.updateReviewComponentGridData(model.getCurrentSelectionManager().HighlightedCheckComponentRow, 
                    tableContainer, 
                    changedStatus, 
                    false, 
                    ComplianceColumns.Status);

            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComplianceReviewManager.prototype.updateReviewComponentGridData = function (selectedRow,
    tableContainer,    
    changedStatus,
    populateDetailedTable,
    statusColumnId) {

    var data = $(tableContainer).data("igGrid").dataSource.dataView();
    var rowData = data[selectedRow.rowIndex];
    rowData.Status = changedStatus;
    
    selectedRow.cells[statusColumnId].innerText = changedStatus;
    if (populateDetailedTable) {
        model.checks["compliance"]["detailedInfoTable"].populateDetailedReviewTable(rowData);    
    }
    // else
    // {
    //     if (model.getCurrentSelectionManager().HighlightedCheckComponentRow) {
    //         model.getCurrentSelectionManager().HighlightedCheckComponentRow.cells[ComplianceColumns.Status].innerText = changedStatus;
    //     }
    // }

    // var row = selectedRow;

    // var gridId = '#' + this.ComplianceCheckManager["CheckGroups"][groupId].ComponentClass + "_" + this.MainReviewTableContainer;
    // var _this = this;

    // var editedItem = {
    //     "SourceA": selectedRow.cells[ComplianceColumns.SourceName].innerText,
    //     "Status": changedStatus,
    //     "NodeId": selectedRow.cells[ComplianceColumns.NodeId].innerText,
    //     "ID": selectedRow.cells[ComplianceColumns.ResultId].innerText,
    //     "groupId": selectedRow.cells[ComplianceColumns.GroupId].innerText
    // };

    // $(gridId).jsGrid("updateItem", selectedRow, editedItem).done(function () {
    //     _this.SelectionManager.HighlightedCheckComponentRow.cells[ComplianceColumns.Status].innerHTML = changedStatus;
    //     _this.populateDetailedReviewTable(selectedRow);
    //     $(gridId).jsGrid("refresh");
    // });
}

ComplianceReviewManager.prototype.UpdateStatusOfCategory = function (button, tableToUpdate) {
    var _this = this;
    var groupId = button.getAttribute("groupId");

    var categorydiv = document.getElementById(button.innerHTML + "_" + this.MainReviewTableContainer);
    var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;
    var tableToUpdate = tableToUpdate;
    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            data: {
                'groupid': groupId,
                'tabletoupdate': tableToUpdate,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var index = 0;
                var compgroup = _this.ComplianceCheckManager["CheckGroups"][groupId];
                compgroup.categoryStatus = "ACCEPTED";
                for (var compId in compgroup["CheckComponents"]) {
                    var component = compgroup["CheckComponents"][compId];
                    component.status = component.Status;
                    if (component.Status !== 'OK') {
                        component.status = "OK(A)";
                        for (var propertyId in component.properties) {
                            property = component.properties[propertyId];
                            if (property.Severity !== 'OK') {
                                property.Severity = 'ACCEPTED';
                            }
                        }
                    }

                    var row = categorydiv.children[1].children[0].children[0].children[index];
                    var gridId = '#' + _this.ComplianceCheckManager["CheckGroups"][groupId].ComponentClass + "_" + _this.MainReviewTableContainer;

                    var editedItem = {
                        "SourceA": row.cells[ComplianceColumns.SourceName].innerText,
                        "Status": component.status,
                        "NodeId": row.cells[ComplianceColumns.NodeId].innerText,
                        "ID": row.cells[ComplianceColumns.ResultId].innerText,
                        "groupId": row.cells[ComplianceColumns.GroupId].innerText
                    };

                    $(gridId).jsGrid("updateItem", row, editedItem).done(function () {
                        if (index == noOfComponents - 1) {
                            selectedRow = categorydiv.children[1].children[0].children[0].children[0];
                            _this.populateDetailedReviewTable(selectedRow);
                            $(gridId).jsGrid("refresh");
                        }
                    });
                    index++;
                }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComplianceReviewManager.prototype.toggleAcceptAllComparedComponents = function (tabletoupdate) {
    var tabletoupdate = tabletoupdate;
    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            data: {
                'tabletoupdate': tabletoupdate,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
                $.ajax({
                    url: 'PHP/CheckResultsReader.php',
                    type: "POST",
                    async: true,
                    data: {
                        'ProjectName': projectinfo.projectname,
                        'CheckName': checkinfo.checkname
                    },
                    success: function (msg) {
                        $("#SourceAComplianceMainReviewCell").empty();
                        $("#SourceAComplianceDetailedReviewCell").empty();
                        $("#SourceBComplianceMainReviewCell").empty();
                        $("#SourceBComplianceDetailedReviewCell").empty();
                        $("#ComparisonMainReviewCell").empty();
                        $("#ComparisonDetailedReviewCell").empty();

                        var checkResults = JSON.parse(msg);

                        var comparisonCheckGroups = undefined;
                        var sourceAComplianceCheckGroups = undefined;
                        var sourceBComplianceCheckGroups = undefined;

                        for (var key in checkResults) {
                            if (!checkResults.hasOwnProperty(key)) {
                                continue;
                            }


                            if (key == 'Comparison') {
                                comparisonCheckGroups = new CheckGroups();
                                comparisonCheckGroups.restore(checkResults[key], false);
                            }
                            else if (key == 'SourceACompliance') {
                                sourceAComplianceCheckGroups = new CheckGroups();
                                sourceAComplianceCheckGroups.restore(checkResults[key], true);
                            }
                            else if (key == 'SourceBCompliance') {
                                sourceBComplianceCheckGroups = new CheckGroups();
                                sourceBComplianceCheckGroups.restore(checkResults[key], true);
                            }
                        }

                        // populate check results
                        populateCheckResults(comparisonCheckGroups,
                            sourceAComplianceCheckGroups,
                            sourceBComplianceCheckGroups);

                        // load analytics data
                        document.getElementById("analyticsContainer").innerHTML = '<object type="text/html" data="analyticsModule.html" style="height: 100%; width: 100%" ></object>';
                    }
                });
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComplianceReviewManager.prototype.UnAcceptComponent = function (selectedRow, 
                                                                tableToUpdate,
                                                                tableContainer, 
                                                                componentId, 
                                                                groupId) {
    var _this = this;
    // var componentId = this.GetComplianceResultId(selectedRow[0]);
    // var groupId = this.GetComplianceResultGroupId(selectedRow[0]);
    // var tableToUpdate = tableToUpdate;
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            dataType: 'JSON',
            async: true,
            data: {
                'componentid': componentId,
                'tabletoupdate': tableToUpdate,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var properties = status[1];
                
                var checkResultComponent = model.getCurrentReviewManager().GetCheckComponent(groupId, componentId);;               
                checkResultComponent.status = status[0];
                var index = 0;
               
                for (var propertyId in properties) {
                    checkResultComponent.properties[index].severity = properties[propertyId]["severity"];
                    index++;
                }               
                
                _this.updateReviewComponentGridData(selectedRow[0], 
                    tableContainer, 
                    checkResultComponent.status, 
                    true, 
                    ComplianceColumns.Status);
            }
        });
    }
    catch (error) { }
}

ComplianceReviewManager.prototype.UnAcceptProperty = function (selectedRow, 
    tableContainer, 
    tableToUpdate, 
    componentId, 
    groupId) {

    var _this = this;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    // var tableToUpdate = tableToUpdate;
    // var componentId = this.GetComplianceResultId(this.SelectionManager.HighlightedCheckComponentRow);
    // var groupId = this.GetComplianceResultGroupId(this.SelectionManager.HighlightedCheckComponentRow);

    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: {
                'componentid': componentId,
                'tabletoupdate': tableToUpdate,
                'sourcePropertyName': _this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]),
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var changedStatus = status[0];

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);
                // var checkResultGroup = _this.ComplianceCheckManager["CheckGroups"][groupId];
                // var checkResultComponent = checkResultGroup["CheckComponents"][componentId];
                var properties = checkResultComponent["properties"];

                checkResultComponent["Status"] = changedStatus;
                
                for (var i = 0; i < properties.length; i++) {
                    var property = properties[i];
                    var name = property["name"];
                    if (name == null) {
                        name = ""
                    };

                    if (name == selectedRow[0].cells[CompliancePropertyColumns.PropertyName].innerText) {
                        property["severity"] = status[1];
                        selectedRow[0].cells[CompliancePropertyColumns.Status].innerHTML = status[1];
                        model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], status[1]);
                    }
                }
               
                _this.updateReviewComponentGridData(model.getCurrentSelectionManager().HighlightedCheckComponentRow, 
                tableContainer, 
                changedStatus, 
                false, 
                ComplianceColumns.Status);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComplianceReviewManager.prototype.UnAcceptCategory = function (button, tableToUpdate) {
    var groupId = button.getAttribute("groupId");
    var _this = this;
    var categorydiv = document.getElementById(button.innerHTML + "_" + this.MainReviewTableContainer);
    var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;
    var tableToUpdate = tableToUpdate;
    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: {
                'groupid': groupId,
                'tabletoupdate': tableToUpdate,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var componentStatus = status[0];
                var propsStatus = status[1];

                var index = 0
                var j = 0;

                var compgroup = _this.ComplianceCheckManager["CheckGroups"][groupId];
                compgroup.categoryStatus = "UNACCEPTED";

                for (var compId in compgroup["CheckComponents"]) {
                    var component = compgroup["CheckComponents"][compId];
                    component.status = componentStatus[index]['status'];
                    var propindex = 0;

                    for (var propertyId in component.properties) {
                        property = component.properties[propertyId];
                        property.Severity = propsStatus[j][propindex]['severity'];
                        propindex++;
                    }

                    j++;
                    var row = categorydiv.children[1].children[0].children[0].children[index];
                    var gridId = '#' + _this.ComplianceCheckManager["CheckGroups"][groupId].ComponentClass + "_" + _this.MainReviewTableContainer;

                    var editedItem = {
                        "SourceA": row.cells[ComplianceColumns.SourceName].innerText,
                        "Status": component.status,
                        "NodeId": row.cells[ComplianceColumns.NodeId].innerText,
                        "ID": row.cells[ComplianceColumns.ResultId].innerText,
                        "groupId": row.cells[ComplianceColumns.GroupId].innerText
                    };

                    $(gridId).jsGrid("updateItem", row, editedItem).done(function () {
                        if (index == noOfComponents - 1) {
                            selectedRow = categorydiv.children[1].children[0].children[0].children[0];
                            _this.populateDetailedReviewTable(selectedRow);
                            $(gridId).jsGrid("refresh");
                        }
                    });
                    index++;
                }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComplianceReviewManager.prototype.HighlightComponentInGraphicsViewer = function (currentReviewTableRowData) {
    // if (!this.SelectionManager.MaintainHighlightedRow(currentReviewTableRow)) {
    //     return;
    // }

    // highlight component in graphics view in both viewer
    var nodeId = currentReviewTableRowData.NodeId;
    model.checks["compliance"]["viewer"].highlightComponent(nodeId);
}


ComplianceReviewManager.prototype.populateDetailedReviewTable = function (rowData) {

    var parentTable = document.getElementById(this.DetailedReviewTableContainer);
    parentTable.innerHTML = '';


    var tableData = [];
    var columnHeaders = [];

    var componentId = rowData.ResultId;
    var groupId = rowData.GroupId;
    for (var componentsGroupID in this.ComplianceCheckManager) {

        // get the componentgroupd corresponding to selected component 
        var componentsGroupList = this.ComplianceCheckManager[componentsGroupID];
        if (componentsGroupList && componentsGroupID != "restore") {

            var component = componentsGroupList[groupId].CheckComponents[componentId];


            var div = document.createElement("DIV");
            parentTable.appendChild(div);

            div.innerHTML = "Check Details :";
            div.style.fontSize = "20px";
            div.style.fontWeight = "bold";

            for (var i = 0; i < Object.keys(CompliancePropertyColumns).length; i++) {
                columnHeader = {};
                var title;
                if (i === CompliancePropertyColumns.PropertyName) {
                    title = "Property";
                    name = CompliancePropertyColumnNames.PropertyName;
                }
                else if (i === CompliancePropertyColumns.PropertyValue) {
                    title = "Value";
                    name = CompliancePropertyColumnNames.PropertyValue;
                }
                else if (i === CompliancePropertyColumns.Status) {
                    title = "Status";
                    name = CompliancePropertyColumnNames.Status;
                }

                columnHeader["name"] = name;
                columnHeader["title"] = title;
                columnHeader["type"] = "textarea";
                columnHeader["width"] = "30";
                columnHeaders.push(columnHeader);
            }

            // // show component class name as property in detailed review table               

            for (var propertyId in component.properties) {
                property = component.properties[propertyId];

                this.detailedReviewRowComments[Object.keys(this.detailedReviewRowComments).length] = property.Description;

                tableRowContent = this.addPropertyRowToDetailedTable(property, columnHeaders);
                tableData.push(tableRowContent);
            }

            var id = "#" + this.DetailedReviewTableContainer;
            this.LoadDetailedReviewTableData(this, columnHeaders, tableData, id);
            this.highlightDetailedReviewTableFromCheckStatus(this.DetailedReviewTableContainer)

            var modelBrowserData = document.getElementById(this.DetailedReviewTableContainer);
            // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
            var modelBrowserHeaderTable = modelBrowserData.children[jsGridHeaderTableIndex];
            modelBrowserHeaderTable.style.position = "fixed"
            modelBrowserHeaderTable.style.width = "565px";
            modelBrowserHeaderTable.style.backgroundColor = "white";
            modelBrowserHeaderTable.style.overflowX = "hidden";

            // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
            var modelBrowserDataTable = modelBrowserData.children[jsGridTbodyTableIndex]
            modelBrowserDataTable.style.position = "static"
            modelBrowserDataTable.style.width = "579px";
            modelBrowserDataTable.style.margin = "55px 0px 0px 0px"

            break;
            //}
        }
    }
}

ComplianceReviewManager.prototype.highlightDetailedReviewTableFromCheckStatus = function (containerId) {
    var detailedReviewTableContainer = document.getElementById(containerId);
    if (detailedReviewTableContainer === null) {
        return;
    }
    if (detailedReviewTableContainer.children.length === 0) {
        return;
    }
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var detailedReviewTableRows = detailedReviewTableContainer.children[jsGridTbodyTableIndex].getElementsByTagName("tr");

    for (var i = 0; i < detailedReviewTableRows.length; i++) {
        var currentRow = detailedReviewTableRows[i];
        if (currentRow.cells.length < 2) {
            return;
        }
        var status = currentRow.cells[CompliancePropertyColumns.Status].innerHTML;
        model.getCurrentSelectionManager().ChangeBackgroundColor(currentRow, status);
    }
}

ComplianceReviewManager.prototype.LoadDetailedReviewTableData = function (_this, columnHeaders, tableData, viewerContainer) {
    $(function () {

        var db = {
            loadData: filter => {
                //   console.debug("Filter: ", filter);
                let property = (filter.Property || "").toLowerCase();
                let value = (filter.Value || "").toLowerCase();
                let status = (filter.Status || "").toLowerCase();
                let dmy = parseInt(filter.dummy, 10);
                this.recalculateTotals = true;
                return $.grep(tableData, row => {
                    return (!property || row.Property.toLowerCase().indexOf(property) >= 0)
                        && (!value || row.Value.toLowerCase().indexOf(value) >= 0)
                        && (!status || row.Status.toLowerCase().indexOf(status) >= 0)
                        && (isNaN(dmy) || row.dummy === dmy);
                });
            }
        };

        $(viewerContainer).jsGrid({
            width: "579px",
            height: "180px",
            sorting: true,
            filtering: true,
            autoload: true,
            controller: db,
            data: tableData,
            headerRowRenderer: function () {
                var fields = $(viewerContainer).jsGrid("option", "fields");
                var result = $("<tr>").height(0).append($("<th>").width(194))
                    .append($("<th>").width(190));

                result = result.add($("<tr>")
                    .append($("<th>").attr("colspan", 2).text('Source'/*AnalyticsData.SourceAName*/)))


                var tr = $("<tr class='jsgrid-header-row'>");
                var grid = this;

                grid._eachField(function (field, index) {
                    var th = $("<th>").text(field.title).width(field.width).appendTo(tr);

                    if (grid.sorting && field.sorting) {
                        th.on("click", function () {
                            grid.sort(index);
                        });
                    }
                });

                return result.add(tr);
            },
            fields: columnHeaders,
            margin: "0px",
            onRefreshed: function (config) {
                var id = viewerContainer.replace("#", "");
                document.getElementById(id).style.width = "579px";
                _this.highlightDetailedReviewTableFromCheckStatus(id);
            },
            rowClick: function (args) {
                var comment = _this.detailedReviewRowComments[args.event.currentTarget.rowIndex];
                var commentDiv = document.getElementById(_this.DetailedReviewRowCommentDiv);
                if (comment) {
                    commentDiv.innerHTML = "Comment : <br>" + comment;
                }
                else {
                    commentDiv.innerHTML = "Comment : <br>";
                }
            }
        });

    });

    var container = document.getElementById(viewerContainer.replace("#", ""));
    container.style.width = "579px"
    container.style.height = "180px"
    container.style.margin = "0px"
    container.style.overflowX = "hidden";
    container.style.overflowY = "scroll";

};

ComplianceReviewManager.prototype.addPropertyRowToDetailedTable = function (property, columnHeaders) {

    tableRowContent = {};
    tableRowContent[columnHeaders[0].name] = property.SourceAName;
    tableRowContent[columnHeaders[1].name] = property.SourceAValue;
    if (property.PerformCheck &&
        property.Result) {
        tableRowContent[columnHeaders[2].name] = "OK";
    }
    else {
        tableRowContent[columnHeaders[2].name] = property.Severity;
    }
    return tableRowContent;
}

ComplianceReviewManager.prototype.GetReviewTableId = function (row) {
    var tBodyElement = row.parentElement;
    if (!tBodyElement) {
        return;
    }
    var tableElement = tBodyElement.parentElement;

    return tableElement.parentElement.parentElement.parentElement.id;
}

ComplianceReviewManager.prototype.GetReviewTable = function (row) {
    var tBodyElement = row.parentElement;
    if (!tBodyElement) {
        return;
    }
    var tableElement = tBodyElement.parentElement;

    return tableElement.parentElement.parentElement;
}

ComplianceReviewManager.prototype.getSourceNameFromMainReviewRow = function (row) {
    return row.cells[ComplianceColumns.SourceName].innerText;
}

ComplianceReviewManager.prototype.getStatusFromMainReviewRow = function (row) {
    return row.cells[ComplianceColumns.Status].innerText;
}

ComplianceReviewManager.prototype.getSourcePropertiesNamesFromDetailedReview = function (row) {
    return row.cells[CompliancePropertyColumns.PropertyName].innerText;
}

ComplianceReviewManager.prototype.ResizeViewers = function () {
    if (model.checks["compliance"]["viewer"]) {
        model.checks["compliance"]["viewer"].ResizeViewer();
    }
}

ComplianceReviewManager.prototype.GetCheckComponent = function (groupId, componentId) {
    var checkGroup = this.ComplianceCheckManager.results[groupId];   
    var component = checkGroup.components[componentId];

    return component;
}

ComplianceReviewManager.prototype.GetCheckComponetDataByNodeId = function (viewerId, selectedNode) {
    var checkComponentData;
    if (this.SourceNodeIdvsCheckComponent !== undefined &&
        selectedNode in this.SourceNodeIdvsCheckComponent) {
        checkComponentData = this.SourceNodeIdvsCheckComponent[selectedNode];
    }

    return checkComponentData;
}

ComplianceReviewManager.prototype.GetFileName = function () {
    return this.ComplianceCheckManager.source;
}

ComplianceReviewManager.prototype.GetCheckComponent = function (groupId, componentId) {
    var checkGroup = this.GetCheckGroup(groupId);
    var component = checkGroup.components[componentId];

    return component;
}

ComplianceReviewManager.prototype.GetCheckGroup = function (groupId) {
    return this.ComplianceCheckManager.results[groupId];
}