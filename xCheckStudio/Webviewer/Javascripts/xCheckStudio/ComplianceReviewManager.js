
function ComplianceReviewManager(complianceCheckManager,
    viewerData,
    sourceComponents,
    mainReviewTableContainer,
    detailedReviewTableContainer,
    detailedReviewRowCommentDiv,
    componentsHierarchy) {

    this.ViewerData = viewerData;

    this.SourceComponents = sourceComponents;

    this.ReviewModuleViewerInterface;

    this.ComplianceCheckManager = complianceCheckManager;

    this.MainReviewTableContainer = mainReviewTableContainer;
    this.DetailedReviewTableContainer = detailedReviewTableContainer;

    this.NodeIdStatusData = componentsHierarchy;
    this.SourceAViewerCurrentSheetLoaded = undefined;
    this.SourceBViewerCurrentSheetLoaded = undefined;

    //ComponentIdVsComponentData = componentIdVsComponentData;
    //this.NodeIdVsComponentData = nodeIdVsComponentData;

    // this.SelectedComponentRowFromSheet;
    this.SelectedComponentRowFromSheetA;
    this.SelectedComponentRowFromSheetB;

    this.checkStatusArray = {};

    this.detailedReviewRowComments = {};
    this.DetailedReviewRowCommentDiv = detailedReviewRowCommentDiv;

    this.SourceNodeIdvsCheckComponent = {};
    this.SourceComponentIdvsNodeId = {};

    this.SourceViewerCurrentSheetLoaded = undefined;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    this.SelectionManager = new ReviewComplianceSelectionManager();

    this.CheckResultsTable = new ComplianceCheckResultsTable(this, mainReviewTableContainer);   
    this.CheckResultsTable.populateReviewTable();

    this.CheckPropertiesTable = new ComplianceCheckPropertiesTable(this, detailedReviewTableContainer)
}

ComplianceReviewManager.prototype.loadDatasource = function () {
    if (this.ViewerData !== undefined) {
        var containerId;
        if (this.MainReviewTableContainer === "SourceAComplianceMainReviewCell") {
            containerId = "viewerContainer1";
        }
        else if (this.MainReviewTableContainer === "SourceBComplianceMainReviewCell") {
            containerId = "viewerContainer2";
        }

        this.ReviewModuleViewerInterface = new Review3DViewerInterface([containerId, this.ViewerData[0]],
            this.ComponentIdVsComponentData,
            this.NodeIdVsComponentData,
            this);
        this.ReviewModuleViewerInterface.NodeIdStatusData = this.NodeIdStatusData;

        this.ReviewModuleViewerInterface.setupViewer(550, 300);

        var viewerContainer = document.getElementById(containerId);
        viewerContainer.style.height = "405px";
        viewerContainer.style.top = "70px";
    }

    if (this.SourceComponents !== undefined && this.MainReviewTableContainer == "SourceAComplianceMainReviewCell") {
        this.SheetDataViewer = new Review1DViewerInterface(this, this.SourceComponents, undefined);
    }

    if (this.SourceComponents !== undefined && this.MainReviewTableContainer == "SourceBComplianceMainReviewCell") {
        this.SheetDataViewer = new Review1DViewerInterface(this, undefined, this.SourceComponents);
    }
}

ComplianceReviewManager.prototype.unhighlightSelectedSheetRow = function (checkStatusArray, currentRow) {
    var rowIndex = currentRow.rowIndex;
    obj = Object.keys(checkStatusArray)
    var status = checkStatusArray[obj[0]][rowIndex]
    if (status !== undefined) {
        this.SelectionManager.ChangeBackgroundColor(currentRow, status);
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

ComplianceReviewManager.prototype.CreateTableData = function (CheckComponents,
    groupId,
    mainClass) {

    var _this = this;
    var tableData = [];

    for (var componentId in CheckComponents) {
        if (!CheckComponents.hasOwnProperty(componentId)) {
            continue;
        }
        // for (var j = 0; j < componentsGroup.CheckComponents.length; j++) {

        component = CheckComponents[componentId];
        //var component = componentsGroup.Components[j];

        tableRowContent = {};

        var checkBox = document.createElement("INPUT");
        checkBox.setAttribute("type", "checkbox");
        checkBox.checked = false;
        // select component check box state change event
        checkBox.onchange = function () {
            _this.SelectionManager.HandleCheckComponentSelectFormCheckBox(this);
        }

        tableRowContent[ComplianceColumnNames.Select] = checkBox;
        tableRowContent[ComplianceColumnNames.SourceName] = component.SourceAName;
        tableRowContent[ComplianceColumnNames.Status] = component.Status;
        tableRowContent[ComplianceColumnNames.NodeId] = component.SourceANodeId;
        tableRowContent[ComplianceColumnNames.ResultId] = component.ID;
        tableRowContent[ComplianceColumnNames.GroupId] = groupId;

        tableData.push(tableRowContent);

        // maintain track of check components
        if (component.SourceANodeId) {
            this.SourceNodeIdvsCheckComponent[component.SourceANodeId] = {
                "Id": component.ID,
                "SourceAName": component.SourceAName,
                "MainClass": mainClass,
                "SourceANodeId": component.SourceANodeId
            };

            this.SourceComponentIdvsNodeId[component.ID] = component.SourceANodeId;
        }
    }
    return tableData;
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
        this.SelectionManager.ChangeBackgroundColor(currentRow, status);
    }
}

ComplianceReviewManager.prototype.OnCheckComponentRowClicked = function (rowData, containerDiv) {
    // var commentDiv = document.getElementById(this.DetailedReviewRowCommentDiv);
    // commentDiv.innerHTML = "";

    this.detailedReviewRowComments = {};


    this.CheckPropertiesTable.populateDetailedReviewTable(rowData);
    var tempString = "_" + this.MainReviewTableContainer;
    containerDiv = containerDiv.replace("#", "");
    var sheetName = containerDiv.replace(tempString, "");

    if (this.SourceComponents !== undefined) {

        var viewerContainer;
        if (this.MainReviewTableContainer === "SourceAComplianceMainReviewCell") {
            viewerContainer = "viewerContainer1";
        }
        else if (this.MainReviewTableContainer === "SourceBComplianceMainReviewCell") {
            viewerContainer = "viewerContainer2";
        }

        this.SheetDataViewer.LoadSelectedSheetDataInViewer(viewerContainer, sheetName, rowData);
    }
    else if (this.ViewerData !== undefined) {
        this.HighlightComponentInGraphicsViewer(rowData)
    }
}

ComplianceReviewManager.prototype.GetComplianceResultId = function (selectedRow) {
    return selectedRow.cells[ComplianceColumns.ResultId].innerHTML;
}

ComplianceReviewManager.prototype.GetComplianceResultGroupId = function (selectedRow) {
    return selectedRow.cells[ComplianceColumns.GroupId].innerHTML;
}

ComplianceReviewManager.prototype.UpdateStatusForComponent = function (selectedRow, tableToUpdate) {
    var _this = this;
    var tableToUpdate = tableToUpdate;
    var componentId = this.GetComplianceResultId(selectedRow[0]);
    var groupId = this.GetComplianceResultGroupId(selectedRow[0]);
    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'tabletoupdate': tableToUpdate,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var checkResultGroup = _this.ComplianceCheckManager["CheckGroups"][groupId];
                var checkResultComponent = checkResultGroup["CheckComponents"][componentId];
                var Properties = checkResultComponent["properties"];
                checkResultComponent.Status = "OK(A)";

                for (var propertyId in Properties) {
                    property = Properties[propertyId];
                    if (property.Severity !== "OK")
                        property.Severity = 'ACCEPTED';
                }
                _this.updateReviewComponentGridData(selectedRow[0], groupId, checkResultComponent.Status);
            }
        });
    }
    catch (error) { }
}

ComplianceReviewManager.prototype.UpdateStatusForProperty = function (selectedRow, tableToUpdate) {
    var _this = this;

    var tableToUpdate = tableToUpdate;
    var componentId = this.GetComplianceResultId(this.SelectionManager.HighlightedCheckComponentRow);
    var groupId = this.GetComplianceResultGroupId(this.SelectionManager.HighlightedCheckComponentRow);

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
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
                var originalstatus = _this.getStatusFromMainReviewRow(_this.SelectionManager.HighlightedCheckComponentRow);

                var checkResultGroup = _this.ComplianceCheckManager["CheckGroups"][groupId];
                var checkResultComponent = checkResultGroup["CheckComponents"][componentId];
                var Properties = checkResultComponent["properties"];
                var changedStatus = originalstatus;
                if (!originalstatus.includes("(A)")) {
                    changedStatus = originalstatus + "(A)";
                    checkResultComponent["Status"] = changedStatus;
                }
                if (msg.trim() == "OK(A)") {
                    var changedStatus = msg.trim();
                    checkResultComponent["Status"] = changedStatus;
                    _this.SelectionManager.GetRowHighlightColor(changedStatus);
                }
                var propertiesLen = Properties.length;
                for (var i = 0; i < propertiesLen; i++) {
                    var sourceAName = Properties[i]["SourceAName"];
                    if (sourceAName == null) {
                        sourceAName = "";
                    }

                    if (sourceAName == selectedRow[0].cells[CompliancePropertyColumns.PropertyName].innerText) {
                        Properties[i]["Severity"] = "ACCEPTED";
                        selectedRow[0].cells[CompliancePropertyColumns.Status].innerHTML = "ACCEPTED";
                        _this.SelectionManager.ChangeBackgroundColor(selectedRow[0], "ACCEPTED");
                        break;
                    }

                }
                _this.updateReviewComponentGridData(_this.SelectionManager.HighlightedCheckComponentRow, groupId, changedStatus);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComplianceReviewManager.prototype.updateReviewComponentGridData = function (selectedRow, groupId, changedStatus) {
    var row = selectedRow;
    var gridId = '#' + this.ComplianceCheckManager["CheckGroups"][groupId].ComponentClass + "_" + this.MainReviewTableContainer;
    var _this = this;

    var editedItem = {
        "SourceA": selectedRow.cells[ComplianceColumns.SourceName].innerText,
        "Status": changedStatus,
        "NodeId": selectedRow.cells[ComplianceColumns.NodeId].innerText,
        "ID": selectedRow.cells[ComplianceColumns.ResultId].innerText,
        "groupId": selectedRow.cells[ComplianceColumns.GroupId].innerText
    };

    $(gridId).jsGrid("updateItem", selectedRow, editedItem).done(function () {
        _this.SelectionManager.HighlightedCheckComponentRow.cells[ComplianceColumns.Status].innerHTML = changedStatus;
        _this.populateDetailedReviewTable(selectedRow);
        $(gridId).jsGrid("refresh");
    });
}

ComplianceReviewManager.prototype.UpdateStatusOfCategory = function (button, tableToUpdate) {
    var _this = this;
    var groupId = button.getAttribute("groupId");

    var categorydiv = document.getElementById(button.innerHTML + "_" + this.MainReviewTableContainer);
    var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;
    var tableToUpdate = tableToUpdate;
    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
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
            url: 'PHP/updateResultsStatusToAccept.php',
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

ComplianceReviewManager.prototype.UnAcceptComponent = function (selectedRow, tableToUpdate) {
    var _this = this;
    var componentId = this.GetComplianceResultId(selectedRow[0]);
    var groupId = this.GetComplianceResultGroupId(selectedRow[0]);
    var tableToUpdate = tableToUpdate;
    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
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
                var checkResultGroup = _this.ComplianceCheckManager["CheckGroups"][groupId];
                var checkResultComponent = checkResultGroup["CheckComponents"][componentId];
                checkResultComponent.Status = status[0];
                var index = 0;
                for (var propertyId in properties) {
                    checkResultComponent.properties[index].Severity = properties[propertyId]["severity"];
                    index++;
                }
                _this.updateReviewComponentGridData(selectedRow[0], groupId, checkResultComponent.Status);
            }
        });
    }
    catch (error) { }
}

ComplianceReviewManager.prototype.UnAcceptProperty = function (selectedRow, tableToUpdate) {
    var _this = this;
    var componentId = this.GetComplianceResultId(this.SelectionManager.HighlightedCheckComponentRow);
    var groupId = this.GetComplianceResultGroupId(this.SelectionManager.HighlightedCheckComponentRow);
    var tableToUpdate = tableToUpdate;

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
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

                var checkResultGroup = _this.ComplianceCheckManager["CheckGroups"][groupId];
                var checkResultComponent = checkResultGroup["CheckComponents"][componentId];
                var Properties = checkResultComponent["properties"];

                checkResultComponent["Status"] = changedStatus;

                var propertiesLen = Properties.length;
                for (var i = 0; i < propertiesLen; i++) {
                    var sourceAName = Properties[i]["SourceAName"];
                    if (sourceAName == null) {
                        sourceAName = ""
                    };

                    if (sourceAName == selectedRow[0].cells[CompliancePropertyColumns.PropertyName].innerText) {
                        Properties[i]["Severity"] = status[1];
                    }
                }
                _this.updateReviewComponentGridData(_this.SelectionManager.HighlightedCheckComponentRow, groupId, changedStatus);
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
            url: 'PHP/updateResultsStatusToAccept.php',
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
    this.ReviewModuleViewerInterface.highlightComponent(nodeId);
}

ComplianceReviewManager.prototype.LoadSheetDataForSelectedComponent = function (viewerContainer, sheetName, thisRow) {

    var viewerContainerData = document.getElementById(viewerContainer);
    var classWiseComponents = this.SourceComponents[sheetName];

    if (viewerContainerData === null) {
        return;
    }
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    if (viewerContainerData.childElementCount > 1 &&
        this.SourceViewerCurrentSheetLoaded === sheetName) {
        if (_this.SelectedComponentRowFromSheetA) {
            _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetA);
        }

        if (_this.SelectedComponentRowFromSheetB) {
            _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetB);
        }

        if (_this.SelectionManager.HighlightedCheckComponentRow) {
            _this.SelectionManager.RemoveHighlightColor(_this.SelectionManager.HighlightedCheckComponentRow);
        }

        this.HighlightRowInSheetData(thisRow, viewerContainer);
        return;
    }

    if (classWiseComponents !== {}) {
        var componentProperties;
        for (var componentId in classWiseComponents) {
            componentProperties = classWiseComponents[componentId];
            break;
        }
        if (componentProperties === undefined) {
            return;
        }

        var column = {};
        columnHeaders = [];
        //if (sheetProperties !== undefined) {
        for (var i = 0; i < componentProperties.length; i++) {
            var compProperty = componentProperties[i];

            columnHeader = {};
            columnHeader["name"] = compProperty['name'];
            var type;
            if (compProperty['format'].toLowerCase() === "string") {
                type = "textarea";
            }
            else if (compProperty['format'].toLowerCase() === "number") {
                type = "number";
            }

            columnHeader["type"] = type;
            columnHeader["width"] = "80";
            columnHeaders.push(columnHeader);

            //tagnumber is for instruments XLS data sheet
            if (Object.keys(column).length <= 3) {
                if (compProperty['name'] === "ComponentClass" ||
                    compProperty['name'] === "Name" ||
                    compProperty['name'] === "Description" ||
                    compProperty['name'] === "Tagnumber") {
                    column[compProperty['name']] = i;
                }
            }
        }
        //}

        tableData = [];
        for (var componentId in classWiseComponents) {
            var component = classWiseComponents[componentId];

            tableRowContent = {};
            for (var i = 0; i < component.length; i++) {
                var compProperty = component[i];

                // get property value
                tableRowContent[compProperty['name']] = compProperty['value'];
            }

            tableData.push(tableRowContent);
        }


        if (thisRow.tagName.toLowerCase() !== "tr") {
            return;
        }

        if (viewerContainer === "viewerContainer1") {
            _this = this;
            if (_this.SelectedComponentRowFromSheetA) {
                _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetA);
            }
            if (_this.SelectionManager.HighlightedCheckComponentRow) {
                _this.SelectionManager.RemoveHighlightColor(_this.SelectionManager.HighlightedCheckComponentRow);
            }

            _this.checkStatusArray = {};
            _this.LoadSheetTableData(_this, columnHeaders, tableData, "#viewerContainer1", thisRow, column, sheetName);
            _this.HighlightRowInSheetData(thisRow, "viewerContainer1");

            // keep track of currently loaded sheet data
            this.SourceViewerCurrentSheetLoaded = sheetName;
        }
        else if (viewerContainer === "viewerContainer2") {
            _this = this;
            if (_this.SelectedComponentRowFromSheetB) {
                _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetB);
            }
            if (_this.SelectionManager.HighlightedCheckComponentRow) {
                _this.SelectionManager.RemoveHighlightColor(_this.SelectionManager.HighlightedCheckComponentRow);
            }
            _this.checkStatusArray = {};
            _this.LoadSheetTableData(_this, columnHeaders, tableData, "#viewerContainer2", thisRow, column, sheetName);
            _this.HighlightRowInSheetData(thisRow, "viewerContainer2");

            // keep track of currently loaded sheet data
            this.SourceViewerCurrentSheetLoaded = sheetName;
        }
    }
};

ComplianceReviewManager.prototype.LoadSheetTableData = function (_this, columnHeaders, tableData, viewerContainer, modelBrowserRow, column, sheetName) {

    if (viewerContainer === "#viewerContainer1" || viewerContainer === "#viewerContainer2") {
        $(function () {

            $(viewerContainer).jsGrid({
                width: "550px",
                height: "450px",
                autoload: true,
                data: tableData,
                fields: columnHeaders,
                margin: "0px",
                rowClick: function (args) {
                    _this.HighlightRowInMainReviewTable(args.event.currentTarget, viewerContainer);
                }
            });

        });
        _this.highlightSheetRowsFromCheckStatus(viewerContainer, modelBrowserRow, column, sheetName);
    }

    var container = document.getElementById(viewerContainer.replace("#", ""));
    container.style.width = "550px"
    container.style.height = "450px"
    container.style.overflowX = "scroll";
    container.style.overflowY = "scroll";
    container.style.margin = "0px";
    container.style.top = "50px"


};


/* This method returns the corresponding compliance 
   check result row for selected sheet row*/
ComplianceReviewManager.prototype.GetCheckComponentForSheetRow = function (sheetDataRow, viewerContainer) {
    var containerId = viewerContainer.replace("#", "");
    var viewerContainerData = document.getElementById(containerId)

    if (viewerContainerData === undefined) {
        return undefined;
    }

    var containerChildren = viewerContainerData.children;
    var columnHeaders = containerChildren[0].getElementsByTagName("th");
    var column = {};
    for (var i = 0; i < columnHeaders.length; i++) {
        columnHeader = columnHeaders[i];
        //tagnumber is for instruments XLS data sheet
        if (columnHeader.innerHTML.trim() === "ComponentClass" ||
            columnHeader.innerHTML.trim() === "Name" ||
            columnHeader.innerHTML.trim() === "Description" ||
            columnHeader.innerHTML.trim() === "Tagnumber") {
            column[columnHeader.innerHTML.trim()] = i;
        }
        if (Object.keys(column).length === 3) {
            break;
        }
    }

    var reviewTableId;
    if (containerId === "viewerContainer1") {
        reviewTableId = "SourceAComplianceMainReviewCell";
    }
    else if (containerId === "viewerContainer2") {
        reviewTableId = "SourceBComplianceMainReviewCell";
    }

    var modelBrowserData = document.getElementById(reviewTableId);
    var modelBrowserRowsData = modelBrowserData.getElementsByTagName("tr");


    for (var i = 0; i < modelBrowserRowsData.length; i++) {
        modelBrowserRow = modelBrowserRowsData[i];

        var componentName;
        if (column.Name !== undefined) {
            componentName = sheetDataRow.cells[column.Name].innerText;
        }
        else if (column.Tagnumber !== undefined) {
            componentName = sheetDataRow.cells[column.Tagnumber].innerText;
        }
        if (componentName === modelBrowserRow.cells[ComplianceColumns.SourceName].innerText) {

            return modelBrowserRow;
        }
    }

    return undefined;
}

ComplianceReviewManager.prototype.HighlightRowInMainReviewTable = function (sheetDataRow, viewerContainer) {
    var reviewTableRow = this.GetCheckComponentForSheetRow(sheetDataRow, viewerContainer);
    if (!reviewTableRow) {
        return;
    }

    // component group id which is container div for check components table of given row
    var containerDiv = this.GetReviewTableId(reviewTableRow);
    this.OnCheckComponentRowClicked(reviewTableRow, containerDiv);

    var reviewTable = this.GetReviewTable(reviewTableRow);
    this.SelectionManager.ScrollToHighlightedCheckComponentRow(reviewTable, reviewTableRow, this.MainReviewTableContainer);
}

ComplianceReviewManager.prototype.highlightSheetRowsFromCheckStatus = function (viewerContainer, modelBrowserRow, column, sheetName) {
    var modelBrowserTable = modelBrowserRow.parentElement;
    var modelBrowserRows = modelBrowserTable.getElementsByTagName("tr");

    var id = viewerContainer.replace("#", "");
    var currentSheetDataTable = document.getElementById(id);
    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
    var currentSheetRows = currentSheetDataTable.children[jsGridTbodyTableIndex].getElementsByTagName("tr");

    var currentCheckStatusArray = {};
    for (var i = 0; i < modelBrowserRows.length; i++) {
        var modelBrowserRow = modelBrowserRows[i];
        for (var j = 0; j < currentSheetRows.length; j++) {
            currentSheetRow = currentSheetRows[j];
            var componentName;
            if (column.Name !== undefined) {
                componentName = currentSheetRow.cells[column.Name].innerText;
            }
            else if (column.Tagnumber !== undefined) {
                componentName = currentSheetRow.cells[column.Tagnumber].innerText;
            }
            if (this.getSourceNameFromMainReviewRow(modelBrowserRow) !== "" &&
                this.getSourceNameFromMainReviewRow(modelBrowserRow) === componentName) {
                var color = modelBrowserRow.cells[0].style.backgroundColor;
                for (var j = 0; j < currentSheetRow.cells.length; j++) {
                    cell = currentSheetRow.cells[j];
                    cell.style.backgroundColor = color;
                    cell.style.height = "10px"
                }
                currentCheckStatusArray[currentSheetRow.rowIndex] = this.getStatusFromMainReviewRow(modelBrowserRow);
                break;
            }
            // else if (modelBrowserRow.cells[1].innerText !== "" && modelBrowserRow.cells[1].innerText === componentName) {
            //     var color = modelBrowserRow.cells[0].style.backgroundColor;
            //     for (var j = 0; j < currentSheetRow.cells.length; j++) {
            //         cell = currentSheetRow.cells[j];
            //         cell.style.backgroundColor = color;
            //     }
            //     currentCheckStatusArray[currentSheetRow.rowIndex] = modelBrowserRow.cells[1].innerHTML;
            //     break;
            // }
        }
    }

    this.checkStatusArray[sheetName] = currentCheckStatusArray;


}

ComplianceReviewManager.prototype.HighlightRowInSheetData = function (thisRow, viewerContainer) {
    var containerId = viewerContainer.replace("#", "");
    var viewerContainerData = document.getElementById(containerId);

    if (viewerContainerData != undefined) {
        var containerChildren = viewerContainerData.children;
        // jsGridHeaderTableIndex = 0 
        // jsGridTbodyTableIndex = 1
        var columnHeaders = containerChildren[jsGridHeaderTableIndex].getElementsByTagName("th");
        var sheetDataTable = containerChildren[jsGridTbodyTableIndex].getElementsByTagName("table")[0];
        var mainComponentClassDataTable = sheetDataTable.getElementsByTagName("tr");
        var column = {};
        for (var i = 0; i < columnHeaders.length; i++) {
            columnHeader = columnHeaders[i];
            //tagnumber is for instruments XLS data sheet
            if (columnHeader.innerHTML.trim() === "ComponentClass" ||
                columnHeader.innerHTML.trim() === "Name" ||
                columnHeader.innerHTML.trim() === "Description" ||
                columnHeader.innerHTML.trim() === "Tagnumber") {
                column[columnHeader.innerHTML.trim()] = i;
            }
            if (Object.keys(column).length === 3) {
                break;
            }
        }
        for (var i = 0; i < mainComponentClassDataTable.length; i++) {
            rowData = mainComponentClassDataTable[i];

            var componentName;
            if (column.Name !== undefined) {
                componentName = rowData.cells[column.Name].innerText;
            }
            else if (column.Tagnumber !== undefined) {
                componentName = rowData.cells[column.Tagnumber].innerText;
            }
            if (thisRow.cells[ComplianceColumns.SourceName].innerText === componentName) {

                if (containerId === "viewerContainer1") {

                    this.SelectedComponentRowFromSheetA = rowData;

                    this.SelectionManager.ApplyHighlightColor(this.SelectedComponentRowFromSheetA);
                }
                else if (containerId === "viewerContainer2") {

                    this.SelectedComponentRowFromSheetB = rowData;
                    this.SelectionManager.ApplyHighlightColor(this.SelectedComponentRowFromSheetB);
                }

                if (!this.SelectionManager.MaintainHighlightedRow(thisRow)) {
                    return;
                }

                sheetDataTable.focus();
                sheetDataTable.parentNode.parentNode.scrollTop = rowData.offsetTop - rowData.offsetHeight;

                break;
            }


        }
    }
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
        this.SelectionManager.ChangeBackgroundColor(currentRow, status);
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
