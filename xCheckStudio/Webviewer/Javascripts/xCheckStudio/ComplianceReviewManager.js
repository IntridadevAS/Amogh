
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
            this.ViewerData["source"]);
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

ComplianceReviewManager.prototype.AddTableContentCount = function (containerId) {
    var countDiv = document.getElementById(containerId + "_child");
    if(countDiv) {
        return;
    }
    else {
        var modelBrowserData = document.getElementById(containerId);
        var categoryId = containerId + "System_table_container";
       
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


    model.checks["compliance"]["detailedInfoTable"].populateDetailedReviewTable(rowData, containerDiv.replace("#", ""));
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

ComplianceReviewManager.prototype.AcceptComponents = function (selectedGroupIdsVsResultIds, tableToUpdate) {
    var _this = this;
        
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            data: {
                'selectedGroupIdsVsResultsIds': JSON.stringify(selectedGroupIdsVsResultIds),
                'tabletoupdate': tableToUpdate,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = JSON.parse(msg);

                for(var groupId in results) {

                    var acceptedComponents = results[groupId];
                    
                    for(var componentId in acceptedComponents) {

                        var originalComponent = _this.GetCheckComponent(groupId, componentId);

                        var changedComponent = acceptedComponents[componentId]["component"];

                        originalComponent.accepted = changedComponent["accepted"];
                        originalComponent.status = "OK(A)";

                        for(var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["accepted"] = changedProperty["accepted"];

                           if(orginalProperty["accepted"] == "true") {
                                orginalProperty.severity = "ACCEPTED";
                           }
                        }

                        var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                        model.getCurrentReviewTable().UpdateGridData(componentId, tableContainer, originalComponent.status, true);
                    }
                }
            }
        });
    }
    catch (error) { }
}

ComplianceReviewManager.prototype.AcceptProperty = function (selectedPropertiesKey, tableToUpdate, componentId, groupId) {
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
                'propertyIds': JSON.stringify(selectedPropertiesKey),
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var results = JSON.parse(msg);

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);

                if(results[componentId].accepted == "true") {
                    checkResultComponent.status = "OK(A)";
                }
                else {
                    checkResultComponent.status = results[componentId].status + "(A)";
                }

                var properties = checkResultComponent["properties"];

                for (var i = 0; i < properties.length; i++) {

                    var property = properties[i];
                    if (property !== results[componentId]["properties"][i].accepted) {

                        property.accepted = results[componentId]["properties"][i].accepted;

                        if(property.accepted == "true") {
                            property["severity"] = "ACCEPTED";

                            model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), property)
                            // model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], "ACCEPTED");
                        }
                                            
                        continue;
                    }

                }

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);

                // var highlightedRow = model.getCurrentSelectionManager().GetHighlightedRow();
                // if (!highlightedRow) {
                //     return;
                // }

                // var originalstatus = _this.getStatusFromMainReviewRow(highlightedRow["row"]);

                // var checkResultComponent = _this.GetCheckComponent(groupId, componentId);

                // var properties = checkResultComponent["properties"];
                // var changedStatus = originalstatus;
                // if (!originalstatus.includes("(A)")) {
                //     changedStatus = originalstatus + "(A)";
                //     checkResultComponent["Status"] = changedStatus;
                // }
                // if (msg.trim() == "OK(A)") {
                //     var changedStatus = msg.trim();
                //     checkResultComponent["Status"] = changedStatus;
                //     model.getCurrentSelectionManager().GetRowHighlightColor(changedStatus);
                // }
                
                // for (var i = 0; i < properties.length; i++) {
                //     var property =  properties[i];
                //     var name = property["name"];
                //     if (!name) {
                //         name = "";
                //     }

                //     if (name == selectedRow[0].cells[CompliancePropertyColumns.PropertyName].innerText) {
                //         property["severity"] = "ACCEPTED";

                //         model.getCurrentDetailedInfoTable().UpdateGridData(selectedRow[0].rowIndex, property)
                //         // selectedRow[0].cells[CompliancePropertyColumns.Status].innerHTML = "ACCEPTED";
                //         model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], "ACCEPTED");
                //         break;
                //     }

                // }

                // model.checks[model.currentCheck]["reviewTable"].UpdateGridData(highlightedRow["row"],
                //     highlightedRow["tableId"],
                //     changedStatus,
                //     false);

            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComplianceReviewManager.prototype.UpdateStatusOfCategory = function (accordion, tableToUpdate) {
    var _this = this;

    var groupData = model.getCurrentReviewTable().GetAccordionData(accordion.textContent);
    var groupId = groupData["groupId"];
    var groupContainer = "#" + this.ComplianceCheckManager["results"][groupId]["componentClass"] + "_" + this.MainReviewTableContainer;
    var dataGrid =  $(groupContainer).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
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

                var compgroup = _this.ComplianceCheckManager["results"][groupId];
                if (compgroup.categoryStatus !== "ACCEPTED") {
                    compgroup.categoryStatus = "ACCEPTED";
                    for (var i = 0; i < rows.length; i++) {
                        var compId = rows[i]["data"]["ID"];
                        var component = compgroup["components"][compId];
                        component.status = "OK(A)";
                        for (var propertyId in component.properties) {
                            property = component.properties[propertyId];
                            if (property.severity !== 'No Value' && property.severity !== 'OK')
                                property.severity = 'ACCEPTED';
                        }

                        model.getCurrentReviewTable().UpdateGridData(compId, groupContainer, component.status, true);
                    }
                }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComplianceReviewManager.prototype.GetSheetName =  function(component, viewerContainerId) {
    var sheetName;
    sheetName = this.ComplianceCheckManager["ComponentsHierarchy"][component.sourceId].MainClass;
    return sheetName;
}

ComplianceReviewManager.prototype.UnAcceptComponents = function (selectedGroupIdsVsResultIds, tableToUpdate) {
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
                'selectedGroupIdsVsResultsIds': JSON.stringify(selectedGroupIdsVsResultIds),
                'tabletoupdate': tableToUpdate,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = msg;

                for(var groupId in results) {

                    var acceptedComponents = results[groupId];
                    
                    for(var componentId in acceptedComponents) {
                        var originalComponent = _this.GetCheckComponent(groupId, componentId);
                        var changedComponent = acceptedComponents[componentId]["component"];

                        originalComponent.accepted = changedComponent["accepted"];
                        originalComponent.status = changedComponent.status;

                        for(var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["accepted"] = changedProperty["accepted"];

                           if(orginalProperty["accepted"] == "false") {            
                                orginalProperty.severity = changedProperty.severity;
                           }
                        }

                        var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                        model.getCurrentReviewTable().UpdateGridData(componentId, tableContainer, originalComponent.status, true);
                    }
                }
            }
        });
    }
    catch (error) { }
}

ComplianceReviewManager.prototype.UnAcceptProperty = function (selectedPropertiesKey, tableToUpdate, componentId, groupId) {

    var _this = this;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));    

    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: {
                'componentid': componentId,
                'tabletoupdate': tableToUpdate,
                'propertyIds': JSON.stringify(selectedPropertiesKey),
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = msg;

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);

                checkResultComponent.status = results[componentId].status;

                var properties = checkResultComponent["properties"];
                var isPropertyAccepted = false;

                for (var i = 0; i < properties.length; i++) {

                    var property = properties[i];
                    if (property !== results[componentId]["properties"][i].accepted) {

                        property.accepted = results[componentId]["properties"][i].accepted;

                        if(property.accepted == "false") {
                            property["severity"] = results[componentId]["properties"][i].severity;
                        }
                        else {
                            if(!isPropertyAccepted) {
                                isPropertyAccepted = true;
                                checkResultComponent.status = checkResultComponent.status + "(A)";
                            }
                        }

                        model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), property)
                                            
                        continue;
                    }

                }

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);


                // var status = new Array();
                // status = msg;
                // var changedStatus = status[0];

                // var checkResultComponent = _this.GetCheckComponent(groupId, componentId);
                // // var checkResultGroup = _this.ComplianceCheckManager["CheckGroups"][groupId];
                // // var checkResultComponent = checkResultGroup["CheckComponents"][componentId];
                // var properties = checkResultComponent["properties"];

                // checkResultComponent["Status"] = changedStatus;
                
                // for (var i = 0; i < properties.length; i++) {
                //     var property = properties[i];
                //     var name = property["name"];
                //     if (name == null) {
                //         name = ""
                //     };

                //     if (name == selectedRow[0].cells[CompliancePropertyColumns.PropertyName].innerText) {
                //         property["severity"] = status[1];

                //         model.getCurrentDetailedInfoTable().UpdateGridData(selectedRow[0].rowIndex, property);
                //         // selectedRow[0].cells[CompliancePropertyColumns.Status].innerHTML = status[1];
                //         model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], status[1]);
                //     }
                // }

                // var highlightedRow = model.getCurrentSelectionManager().GetHighlightedRow();
                // if (!highlightedRow) {
                //     return;
                // }

                // model.checks[model.currentCheck]["reviewTable"].UpdateGridData(highlightedRow["row"],
                //     highlightedRow["tableId"],
                //     changedStatus,
                //     false);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComplianceReviewManager.prototype.UnAcceptCategory = function (accordion, tableToUpdate) {
    var _this = this;

    var groupData = model.getCurrentReviewTable().GetAccordionData(accordion.textContent);
    var groupId = groupData["groupId"];
    var groupContainer = "#" + this.ComplianceCheckManager["results"][groupId]["componentClass"] + "_" + this.MainReviewTableContainer;
    var dataGrid =  $(groupContainer).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
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
                var compgroup = _this.ComplianceCheckManager["results"][groupId];
                compgroup.categoryStatus = "UNACCEPTED";
                for (var i = 0; i < rows.length; i++) {
                    var compId = rows[i]["data"]["ID"];
                    var component = compgroup["components"][compId];
                    component.status = componentStatus[i]['status'];
                    var propertyIndex = 0;
                    for (var propertyId in component.properties) {
                        property = component.properties[propertyId];
                        property.severity = propsStatus[i][propertyIndex]['severity'];
                        propertyIndex++;
                    }
                    // var rowElement = dataGrid.getRowElement(rows[i].rowIndex);
                    model.getCurrentReviewTable().UpdateGridData(compId, groupContainer, component.status, true);
                }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComplianceReviewManager.prototype.HighlightComponentInGraphicsViewer = function (currentReviewTableRowData) {    
    // highlight component in graphics view in both viewer
    var nodeId = currentReviewTableRowData.NodeId;
    model.checks["compliance"]["viewer"].highlightComponent(nodeId);
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

ComplianceReviewManager.prototype.GetNodeIdvsComponentData = function (viewerId) {   
        return this.SourceNodeIdvsCheckComponent;   
}