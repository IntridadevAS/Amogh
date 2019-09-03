function ComparisonReviewManager(comparisonCheckManager,
    sourceAViewerData,
    sourceBViewerData,
    sourceAComponents,
    sourceBComponents,
    mainReviewTableContainer,
    detailedReviewTableContainer,
    sourceAComponentsHierarchy,
    sourceBComponentsHierarchy) {

    this.SourceAViewerData = sourceAViewerData;
    this.SourceBViewerData = sourceBViewerData;

    this.SourceAComponents = sourceAComponents;
    this.SourceBComponents = sourceBComponents;

    this.MainReviewTableContainer = mainReviewTableContainer;
    this.DetailedReviewTableContainer = detailedReviewTableContainer;

    this.SourceANodeIdVsStatus = sourceAComponentsHierarchy;
    this.SourceBNodeIdVsStatus = sourceBComponentsHierarchy;

    this.ComparisonCheckManager = comparisonCheckManager;

    this.detailedReviewRowComments = {};

    this.SourceANodeIdvsCheckComponent = {};
    this.SourceBNodeIdvsCheckComponent = {};

    this.SourceAComponentIdvsNodeId = {};
    this.SourceBComponentIdvsNodeId = {};

    this.SourceAViewerCurrentSheetLoaded = undefined;
    this.SourceBViewerCurrentSheetLoaded = undefined;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    this.SelectionManager = new ReviewComparisonSelectionManager();

    // populate review table
    this.CheckResultsTable = new ComparisonCheckResultsTable(this, mainReviewTableContainer);   
    this.CheckResultsTable.populateReviewTable();

    this.CheckPropertiesTable = new ComparisonCheckPropertiesTable(this, detailedReviewTableContainer)

    this.SourceAReviewViewerInterface;
    this.SourceBReviewViewerInterface;
    this.SheetDataViewer;
}

ComparisonReviewManager.prototype.loadDatasources = function () {
    var modal = document.getElementById('maximizeViewerContainer');

    var viewer1 = document.getElementById("viewerContainer1");
    viewer1.style.height = "270px";
    viewer1.style.top = "0px";

    var viewer2 = document.getElementById("viewerContainer2");
    viewer2.style.height = "270px";
    viewer2.style.top = "0px";

    if (modal.style.display === "block") {
        viewer1.style.height = "405px";
        viewer2.style.height = "405px";
    }

    if (this.SourceAViewerData !== undefined) {
        this.SourceAReviewViewerInterface = new Review3DViewerInterface(["viewerContainer1", this.SourceAViewerData[0]],
            this.SourceAComponentIdVsComponentData,
            this.SourceANodeIdVsComponentData,
            this);
        this.SourceAReviewViewerInterface.NodeIdStatusData = this.SourceANodeIdVsStatus;
        this.SourceAReviewViewerInterface.setupViewer(550, 280);
    }

    if (this.SourceBViewerData !== undefined) {
        this.SourceBReviewViewerInterface = new Review3DViewerInterface(["viewerContainer2", this.SourceBViewerData[0]],
            this.SourceBComponentIdVsComponentData,
            this.SourceBNodeIdVsComponentData,
            this);
        this.SourceBReviewViewerInterface.NodeIdStatusData = this.SourceBNodeIdVsStatus;
        this.SourceBReviewViewerInterface.setupViewer(550, 280);
    }

    if(this.SourceAComponents !== undefined || this.SourceBComponents !== undefined) {
        this.SheetDataViewer = new Review1DViewerInterface(this, this.SourceAComponents, this.SourceBComponents);
    }
}

ComparisonReviewManager.prototype.AddTableContentCount = function (containerId) {
    var modelBrowserData = document.getElementById(containerId);
    var categoryId = containerId + "System_table_container";
    // var gridDiv = modelBrowserData.getElementsByTagName(categoryId);


    // jsGridHeaderTableIndex = 0 
    // jsGridTbodyTableIndex = 1
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

ComparisonReviewManager.prototype.MaintainNodeIdVsCheckComponent = function (component, mainClass) {
    // maintain track of check components
    if (component.SourceANodeId) {
        this.SourceANodeIdvsCheckComponent[component.SourceANodeId] = {
            "Id": component.ID,
            "SourceAName": component.SourceAName,
            "SourceBName": component.SourceBName,
            "MainClass": mainClass,
            "SourceANodeId": component.SourceANodeId,
            "SourceBNodeId": component.SourceBNodeId,
        };
        // this.SourceAComponentIdvsNodeId[component.ID] = component.SourceANodeId;
    }
    if (component.SourceBNodeId) {
        this.SourceBNodeIdvsCheckComponent[component.SourceBNodeId] = {
            "Id": component.ID,
            "SourceAName": component.SourceAName,
            "SourceBName": component.SourceBName,
            "MainClass": mainClass,
            "SourceANodeId": component.SourceANodeId,
            "SourceBNodeId": component.SourceBNodeId,
        };
        // this.SourceBComponentIdvsNodeId[component.ID] = component.SourceBNodeId;
    }
}

ComparisonReviewManager.prototype.SecondViewerExists = function () {
    if (document.getElementById("viewerContainer2").innerHTML !== "") {
        return true;
    }

    return false;
}

ComparisonReviewManager.prototype.SourceAComponentExists = function (row) {
    if (row.cells[ComparisonColumns.SourceAName].innerText !== "") {
        return true;
    }

    return false;
}

ComparisonReviewManager.prototype.SourceBComponentExists = function (row) {
    if (row.cells[ComparisonColumns.SourceBName].innerText !== "") {
        return true;
    }

    return false;
}

// ComparisonReviewManager.prototype.LoadReviewTableData = function (columnHeaders, tableData, containerDiv) {
//     var _this = this;
//     $(function () {
//         var db = {
//             loadData: filter => {
//                 //   console.debug("Filter: ", filter);
//                 let sourceA = (filter.SourceA || "").toLowerCase();
//                 let sourceB = (filter.SourceB || "").toLowerCase();
//                 let status = (filter.Status || "").toLowerCase();
//                 let dmy = parseInt(filter.dummy, 10);
//                 this.recalculateTotals = true;
//                 return $.grep(tableData, row => {
//                     return (!sourceA || row.SourceA.toLowerCase().indexOf(sourceA) >= 0)
//                         && (!sourceB || row.SourceB.toLowerCase().indexOf(sourceB) >= 0)
//                         && (!status || row.Status.toLowerCase().indexOf(status) >= 0)
//                         && (isNaN(dmy) || row.dummy === dmy);
//                 });
//             }
//         };

//         $(containerDiv).jsGrid({
//             height: "202px",
//             width: "578px",
//             filtering: true,
//             autoload: true,
//             controller: db,
//             sorting: true,
//             data: tableData,
//             fields: columnHeaders,
//             margin: "0px",
//             onDataLoaded: function (args) {
//                 //initializeComparisonContextMenus();
//                 var reviewComparisonContextMenuManager = new ReviewComparisonContextMenuManager(_this);
//                 reviewComparisonContextMenuManager.Init();
//             },
//             onItemUpdated: function (args) {
//                 for (var index = 0; index < args.grid.data.length; index++) {
//                     if (args.grid.data[index].ID == args.row[0].cells[ComparisonColumns.ResultId].innerHTML) {
//                         if (args.grid.data[index].Status !== args.row[0].cells[ComparisonColumns.Status].innerHTML) {
//                             args.grid.data[index].Status = args.row[0].cells[ComparisonColumns.Status].innerHTML;
//                             break;
//                         }
//                     }
//                 }
//             },
//             onRefreshed: function (config) {
//                 var id = containerDiv.replace("#", "");
//                 // _this.AddTableContentCount(this._container.context.id);
//                 document.getElementById(id).style.width = "578px";
//                 _this.highlightMainReviewTableFromCheckStatus(id);

//                 // hide additional column cells
//                 var tableRows = this._container.context.getElementsByTagName("tr");
//                 for (var j = 0; j < tableRows.length; j++) {
//                     var currentRow = tableRows[j];
//                     for (var i = 0; i < currentRow.cells.length; i++) {
//                         if (i > ComparisonColumns.Status) {
//                             currentRow.cells[i].style.display = "none";
//                         }
//                     }
//                 }

//             },
//             rowClick: function (args) {
//                 _this.OnCheckComponentRowClicked(args.event.currentTarget, containerDiv);
//             }
//         });

//     });

//     var container = document.getElementById(containerDiv.replace("#", ""));
//     container.style.width = "578px"
//     container.style.height = "202px"
//     container.style.margin = "0px"
//     container.style.overflowX = "hidden";
//     container.style.overflowY = "scroll";
//     container.style.padding = "0";

// };

ComparisonReviewManager.prototype.OnCheckComponentRowClicked = function (rowData, containerDiv) {
    //maintain highlighted row
    // this.SelectionManager.MaintainHighlightedRow(row);

    // populate property table
    this.CheckPropertiesTable.populateDetailedReviewTable(rowData);
    
    var sheetName = containerDiv.replace("#", "");

    if (this.SourceAComponents !== undefined &&
        this.SourceBComponents !== undefined) {

        var result = sheetName.split('-');

        if (rowData.SourceAName !== "") {
            this.SheetDataViewer.LoadSelectedSheetDataInViewer("viewerContainer1", result[0], rowData);
        }
        else {
            // document.getElementById("viewerContainer1").innerHTML = "";
            this.SourceAViewerCurrentSheetLoaded = undefined;
        }

        if (rowData.SourceBName !== "") {
            this.SheetDataViewer.LoadSelectedSheetDataInViewer("viewerContainer2", result[1], rowData);
        }
        else {
            // document.getElementById("viewerContainer2").innerHTML = "";
            this.SourceBViewerCurrentSheetLoaded = undefined;
        }
    }
    else if (this.SourceAViewerData !== undefined &&
        this.SourceBViewerData !== undefined) {
        this.HighlightComponentInGraphicsViewer(rowData)
    }
    else if (this.SourceAComponents !== undefined &&
        this.SourceBViewerData !== undefined) {
        var result = sheetName.split('-');

        if (rowData.SourceAName !== "") {
            this.SheetDataViewer.LoadSelectedSheetDataInViewer("viewerContainer1", result[0], rowData);
        } else {
            // document.getElementById("viewerContainer1").innerHTML = "";
            this.SourceAViewerCurrentSheetLoaded = undefined;
        }

        this.HighlightComponentInGraphicsViewer(rowData)
    }
    else if (this.SourceAViewerData !== undefined &&
        this.SourceBComponents !== undefined) {
        var result = sheetName.split('-');

        if (rowData.SourceBName !== "") {
            this.SheetDataViewer.LoadSelectedSheetDataInViewer("viewerContainer2", result[1], rowData);
        }
        else {
            // document.getElementById("viewerContainer2").innerHTML = "";
            this.SourceBViewerCurrentSheetLoaded = undefined;
        }

        this.HighlightComponentInGraphicsViewer(rowData)
    }
}

ComparisonReviewManager.prototype.GetComparisonResultId = function (selectedRow) {
    return selectedRow.cells[ComparisonColumns.ResultId].innerHTML;
}

ComparisonReviewManager.prototype.GetComparisonResultGroupId = function (selectedRow) {
    return selectedRow.cells[ComparisonColumns.GroupId].innerHTML;
}

ComparisonReviewManager.prototype.updateStatusForProperty = function (selectedRow, tableContainer, componentId, groupId)  {
    var _this = this;

    // var componentId = this.GetComparisonResultId(this.SelectionManager.HighlightedCheckComponentRow);
    // var groupId = this.GetComparisonResultGroupId(this.SelectionManager.HighlightedCheckComponentRow);
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    var propertiesNames = this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]);

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'tabletoupdate': "comparisonDetailed",
                'sourceAPropertyName': propertiesNames.SourceAName,
                'sourceBPropertyName': propertiesNames.SourceBName,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var originalstatus = _this.getStatusFromMainReviewRow(_this.SelectionManager.HighlightedCheckComponentRow);
                var changedStatus = originalstatus;
                if (!originalstatus.includes("(A)")) {
                    changedStatus = originalstatus + "(A)";
                    _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
                }
                if (msg.trim() == "OK(A)" || msg.trim() == "OK(A)(T)") {
                    changedStatus = msg.trim();
                    _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
                }

                var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];
                var checkComponents = checkGroup["CheckComponents"];
                var component = checkComponents[componentId];
                var properties = component["properties"];

                var propertiesLen = properties.length;

                for (var i = 0; i < propertiesLen; i++) {
                    var sourceAName = properties[i]["SourceAName"];
                    if (sourceAName == null) {
                        sourceAName = "";
                    }
                    var sourceBName = properties[i]["SourceBName"];
                    if (sourceBName == null) {
                        sourceBName = "";
                    }

                    if (sourceAName == propertiesNames.SourceAName &&
                        sourceBName == propertiesNames.SourceBName) {
                        selectedRow[0].cells[ComparisonPropertyColumns.Status].innerHTML = "ACCEPTED";
                        _this.SelectionManager.ChangeBackgroundColor(selectedRow[0], 'ACCEPTED');
                        properties[i]["Severity"] = "ACCEPTED";
                    }

                }
                _this.updateReviewComponentGridData(_this.SelectionManager.HighlightedCheckComponentRow, tableContainer, groupId, changedStatus, false, ComparisonColumns.Status);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.updateStatusForComponent = function (selectedRow, tableContainer, componentId, groupId) {

    var _this = this;
    // var componentId = this.GetComparisonResultId(selectedRow[0]);
    // var groupId = this.GetComparisonResultGroupId(selectedRow[0]);
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'tabletoupdate': "comparison",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var component = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                component.status = "OK(A)";
                _this.SelectionManager.ChangeBackgroundColor(selectedRow[0], component.status);
                for (var propertyId in component.properties) {
                    property = component.properties[propertyId];
                    if (property.Severity !== "OK" && property.Severity !== "No Value") {
                        if ((property.transpose == 'lefttoright' || property.transpose == 'righttoleft')
                            && property.Severity !== 'No Value') {
                            component.properties[propertyId].Severity = 'ACCEPTED';
                            component.status = "OK(A)(T)";
                            component.properties[propertyId].transpose = property.transpose;
                        }
                        else {
                            component.properties[propertyId].Severity = 'ACCEPTED';
                        }
                    }
                }
                _this.updateReviewComponentGridData(selectedRow[0], tableContainer, groupId, component.status, true,  ComparisonColumns.Status);
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.updateReviewComponentGridData = function (selectedRow, 
                                                                            tableContainer, 
                                                                            groupId, 
                                                                            changedStatus,
                                                                            populateDetailedTable,
                                                                            statusColumnId) {


    //$(tableContainer).igGridUpdating("updateRow", selectedRow.rowIndex, {Status: changedStatus});
    //$(tableContainer).igGridUpdating("updateRow", selectedRow.getAttribute("data-id"), {Status: changedStatus});
    var data = $(tableContainer).data("igGrid").dataSource.dataView();
    var rowData = data[selectedRow.rowIndex];
    rowData.Status = changedStatus;

    selectedRow.cells[statusColumnId].innerText = changedStatus;

    //var gridId = '#' + this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;


    // var editedItem = {
    //     "SourceA": selectedRow.cells[ComparisonColumns.SourceAName].innerText,
    //     "SourceB": selectedRow.cells[ComparisonColumns.SourceBName].innerText,
    //     "Status": changedStatus,
    //     "SourceANodeId": selectedRow.cells[ComparisonColumns.SourceANodeId].innerText,
    //     "SourceBNodeId": selectedRow.cells[ComparisonColumns.SourceBNodeId].innerText,
    //     "ID": this.GetComparisonResultId(selectedRow),
    //     "groupId": this.GetComparisonResultGroupId(selectedRow)
    // };

    //var _this = this;
    //$(gridId).jsGrid("updateItem", selectedRow, editedItem).done(function () {    
    if(populateDetailedTable)
    {
        this.CheckPropertiesTable.populateDetailedReviewTable(rowData);
    }
    else
    {
        if(this.SelectionManager.HighlightedCheckComponentRow)
        {
            this.SelectionManager.HighlightedCheckComponentRow.cells[ComparisonColumns.Status].innerText = changedStatus;
        }
    }
    //$(gridId).jsGrid("refresh");
    //});
}

ComparisonReviewManager.prototype.toggleAcceptAllComparedComponents = function (tabletoupdate) {
    var tabletoupdate = tabletoupdate;
    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            data: { 'tabletoupdate': tabletoupdate, 'ProjectName': projectinfo.projectname, 'CheckName': checkinfo.checkname },
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
                        $("#ComparisonMainReviewCell").empty();
                        $("#ComparisonDetailedReviewCell").empty();
                        $("#SourceBComplianceMainReviewCell").empty();
                        $("#SourceBComplianceDetailedReviewCell").empty();
                        $("#SourceAComplianceMainReviewCell").empty();
                        $("#SourceAComplianceDetailedReviewCell").empty();
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

ComparisonReviewManager.prototype.updateStatusOfCategory = function (button) {
    var _this = this;

    var groupId = button.attributes[0].value;
    var categorydiv = document.getElementById(button.innerHTML);
    var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            data: { 'groupid': groupId, 'tabletoupdate': "category", 'ProjectName': projectinfo.projectname, 'CheckName': checkinfo.checkname },
            success: function (msg) {
                for (var i = 0; i < noOfComponents; i++) {
                    if (categorydiv.children[1].children[0].children[0].children[i].children[2].innerHTML !== "OK") {
                        var compgroup = _this.ComparisonCheckManager["CheckGroups"][groupId];
                        compgroup.categoryStatus = "ACCEPTED";
                        for (var compId in compgroup["CheckComponents"]) {
                            var component = compgroup["CheckComponents"][compId];
                            component.status = "OK(A)";
                            for (var propertyId in component.properties) {
                                property = component.properties[propertyId];
                                if (property.Severity !== 'No Value' && property.Severity !== 'OK')
                                    property.Severity = 'ACCEPTED';

                            }
                        }
                        var row = categorydiv.children[1].children[0].children[0].children[i];
                        var gridId = '#' + _this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;

                        var editedItem = {
                            "SourceA": row.cells[ComparisonColumns.SourceAName].innerText,
                            "SourceB": row.cells[ComparisonColumns.SourceBName].innerText,
                            "Status": component.status,
                            "SourceANodeId": row.cells[ComparisonColumns.SourceANodeId].innerText,
                            "SourceBNodeId": row.cells[ComparisonColumns.SourceBNodeId].innerText,
                            "ID": row.cells[ComparisonColumns.ResultId].innerText,
                            "groupId": row.cells[ComparisonColumns.GroupId].innerText
                        };

                        $(gridId).jsGrid("updateItem", row, editedItem).done(function () {
                            if (i == noOfComponents - 1) {
                                selectedRow = categorydiv.children[1].children[0].children[0].children[0];
                                _this.populateDetailedReviewTable(selectedRow);
                                $(gridId).jsGrid("refresh");
                            }
                        });
                    }
                }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.UnAcceptComponent = function (selectedRow, tableContainer, componentId, groupId){
    var _this = this;
    // var componentId = this.GetComparisonResultId(selectedRow[0]);
    // var groupId = this.GetComparisonResultGroupId(selectedRow[0]);
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            dataType: 'JSON',
            async: true,
            data: {
                'componentid': componentId,
                'tabletoupdate': "rejectComponentFromComparisonTab",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var properties = status[1];

                var component = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                component.status = status[0];
                if (component.transpose != null) {
                    if (!status[0].includes("(T)"))
                        component.status = status[0] + "(T)";
                }

                _this.SelectionManager.ChangeBackgroundColor(selectedRow[0], component.status);

                var index = 0;
                for (var propertyId in properties) {
                    property = properties[propertyId];
                    if ((property.transpose == 'lefttoright' || property.transpose == 'righttoleft')
                        && property.severity !== 'No Value') {
                        component.properties[index].Severity = 'OK(T)';
                        component.properties[index].transpose = property.transpose;
                    }
                    else {
                        component.properties[index].Severity = property.severity;
                    }
                    index++;
                }
                _this.updateReviewComponentGridData(selectedRow[0], tableContainer, groupId, component.status, true, ComparisonColumns.Status);
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.UnAcceptProperty = function (selectedRow, tableContainer, componentId, groupId) {
    var _this = this;

    // var componentId = this.GetComparisonResultId(this.SelectionManager.HighlightedCheckComponentRow);
    // var groupId = this.GetComparisonResultGroupId(this.SelectionManager.HighlightedCheckComponentRow);
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    var propertiesNames = this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]);

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: {
                'componentid': componentId,
                'tabletoupdate': "rejectPropertyFromComparisonTab",
                'sourceAPropertyName': propertiesNames.SourceAName,
                'sourceBPropertyName': propertiesNames.SourceBName,
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var changedStatus = status[0];
                var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];
                var checkComponents = checkGroup["CheckComponents"];
                var component = checkComponents[componentId];
                var properties = component["properties"];

                var propertiesLen = properties.length;

                if (component["transpose"] !== null && !status[0].includes("(T)")) {
                    changedStatus = status[0] + "(T)";
                }
                component["Status"] = changedStatus;
                for (var i = 0; i < propertiesLen; i++) {
                    var sourceAName = properties[i]["SourceAName"];
                    if (sourceAName == null) {
                        sourceAName = "";
                    }
                    var sourceBName = properties[i]["SourceBName"];
                    if (sourceBName == null) {
                        sourceBName = "";
                    }

                    if (sourceAName == propertiesNames.SourceAName &&
                        sourceBName == propertiesNames.SourceBName) {
                        properties[i]["Severity"] = status[1];

                        selectedRow[0].cells[ComparisonPropertyColumns.Status].innerHTML = status[1];
                        _this.SelectionManager.ChangeBackgroundColor(selectedRow[0], status[1]);
                        
                    }

                }
                _this.updateReviewComponentGridData(_this.SelectionManager.HighlightedCheckComponentRow, tableContainer, groupId, changedStatus, false, ComparisonColumns.Status);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.UnAcceptCategory = function (button) {
    var _this = this;

    var groupId = button.attributes[0].value;
    var categorydiv = document.getElementById(button.innerHTML);
    var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;

    try {
        $.ajax({
            url: 'PHP/updateResultsStatusToAccept.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: {
                'groupid': groupId,
                'tabletoupdate': "rejectCategoryFromComparisonTab",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var componentStatus = status[0];
                var propsStatus = status[1];
                var index = 0
                for (var i = 0; i < noOfComponents; i++) {
                    var j = 0;
                    var compgroup = _this.ComparisonCheckManager["CheckGroups"][groupId];
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
                    }

                    var row = categorydiv.children[1].children[0].children[0].children[i];
                    var gridId = '#' + _this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;

                    var editedItem = {
                        "SourceA": row.cells[ComparisonColumns.SourceAName].innerText,
                        "SourceB": row.cells[ComparisonColumns.SourceBName].innerText,
                        "Status": component.status,
                        "SourceANodeId": row.cells[ComparisonColumns.SourceANodeId].innerText,
                        "SourceBNodeId": row.cells[ComparisonColumns.SourceBNodeId].innerText,
                        "ID": row.cells[ComparisonColumns.ResultId].innerText,
                        "groupId": row.cells[ComparisonColumns.GroupId].innerText
                    };

                    $(gridId).jsGrid("updateItem", row, editedItem).done(function () {
                        if (i == noOfComponents - 1) {
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

ComparisonReviewManager.prototype.GetCellValue = function(currentReviewTableRow, cell) {
    return currentReviewTableRow.cells[cell].childNodes[0].data.trim();
}

ComparisonReviewManager.prototype.HighlightComponentInGraphicsViewer = function (currentReviewTableRowData) {
    var sourceANodeId;
    if (this.SourceAViewerData !== undefined &&
        currentReviewTableRowData.SourceANodeId !== "") {
        sourceANodeId = currentReviewTableRowData.SourceANodeId;
    }

    var sourceBNodeId;
    if (this.SourceBViewerData !== undefined &&
        currentReviewTableRowData.SourceBNodeId !== "") {
        sourceBNodeId = currentReviewTableRowData.SourceBNodeId;
    }

    // highlight component in graphics view in both viewer
    if (this.SourceAViewerData != undefined) {
        if (sourceANodeId !== undefined && sourceANodeId !== "") {
            this.SourceAReviewViewerInterface.highlightComponent(sourceANodeId);
        }
        else {
            // unhighlight previous component
            this.SourceAReviewViewerInterface.unHighlightComponent();
        }
    }
    if (this.SourceBViewerData != undefined) {

        if (sourceBNodeId !== undefined && sourceBNodeId !== "") {
            this.SourceBReviewViewerInterface.highlightComponent(sourceBNodeId);
        }
        else {
            // unhighlight previous component
            this.SourceBReviewViewerInterface.unHighlightComponent();
        }
    }
}

ComparisonReviewManager.prototype.TransposeProperty = function (key, selectedRow, tableContainer, componentId, groupId) {
    var _this = this;
    var transposeType = key;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    // var componentId = this.GetComparisonResultId(this.SelectionManager.HighlightedCheckComponentRow);
    // var groupId = this.GetComparisonResultGroupId(this.SelectionManager.HighlightedCheckComponentRow);
    var propertiesNames = this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]);

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'transposeType': transposeType,
                'sourceAPropertyName': propertiesNames.SourceAName,
                'sourceBPropertyName': propertiesNames.SourceBName,
                'transposeLevel': 'propertyLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var originalstatus = _this.getStatusFromMainReviewRow(_this.SelectionManager.HighlightedCheckComponentRow);
                var changedStatus = originalstatus;

                var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];
                var checkComponents = checkGroup["CheckComponents"];
                var component = checkComponents[componentId];
                var properties = component["properties"];

                if (!originalstatus.includes("(T)")) {
                    changedStatus = originalstatus + "(T)";
                    component.Status = changedStatus;
                }
                if (msg.trim() == "OK(T)" || msg.trim() == "OK(A)(T)") {
                    changedStatus = msg.trim();
                    component.Status = changedStatus;
                    component.transpose = transposeType;
                }

                _this.SelectionManager.ChangeBackgroundColor(_this.SelectionManager.HighlightedCheckComponentRow, changedStatus);

                var SourceAValue = selectedRow[0].cells[ComparisonPropertyColumns.SourceAValue].innerHTML;
                var SourceBValue = selectedRow[0].cells[ComparisonPropertyColumns.SourceBValue].innerHTML;

                _this.SelectionManager.ChangeBackgroundColor(selectedRow[0], 'OK(T)');

                var propertiesLen = properties.length;

                for (var i = 0; i < propertiesLen; i++) {
                    var sourceAName = properties[i]["SourceAName"];
                    if (sourceAName == null) {
                        sourceAName = "";
                    }
                    var sourceBName = properties[i]["SourceBName"];
                    if (sourceBName == null) {
                        sourceBName = "";
                    }

                    if (sourceAName == propertiesNames.SourceAName &&
                        sourceBName == propertiesNames.SourceBName) {
                        properties[i]["Severity"] = 'OK(T)';
                        properties[i]['transpose'] = transposeType;
                        selectedRow[0].cells[ComparisonPropertyColumns.Status].innerHTML = 'OK(T)';
                        if (transposeType == "lefttoright") {
                            selectedRow[0].cells[ComparisonPropertyColumns.SourceBValue].innerHTML = SourceAValue;
                        }
                        else if (transposeType == "righttoleft") {
                            selectedRow[0].cells[ComparisonPropertyColumns.SourceAValue].innerHTML = SourceBValue;
                        }

                    }

                    if (properties[i]["Severity"] != 'OK' && properties[i]["Severity"] !== 'No Match') {
                        if (properties[i]['transpose'] !== null) {
                            if (i == propertiesLen - 1) {
                                component["Status"] = 'OK(T)';
                                component["transpose"] = transposeType;
                            }
                        }
                    }
                }
                _this.updateReviewComponentGridData(_this.SelectionManager.HighlightedCheckComponentRow, tableContainer, groupId, changedStatus, false, ComparisonColumns.Status);
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestorePropertyTranspose = function (selectedRow) {
    var _this = this;
    var transposeType = 'restoreProperty';

    var componentId = this.GetComparisonResultId(this.SelectionManager.HighlightedCheckComponentRow);
    var groupId = this.GetComparisonResultGroupId(this.SelectionManager.HighlightedCheckComponentRow);

    var propertiesNames = this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]);
    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: {
                'componentid': componentId,
                'transposeType': transposeType,
                'sourceAPropertyName': propertiesNames.SourceAName,
                'sourceBPropertyName': propertiesNames.SourceBName,
                'transposeLevel': 'propertyLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var changedStatus = status[0];

                var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];
                var checkComponents = checkGroup["CheckComponents"];
                var component = checkComponents[componentId];
                var properties = component["properties"];

                var propertiesLen = properties.length;

                for (var i = 0; i < propertiesLen; i++) {
                    var sourceAName = properties[i]["SourceAName"];
                    if (sourceAName == null) {
                        sourceAName = "";
                    }
                    var sourceBName = properties[i]["SourceBName"];
                    if (sourceBName == null) {
                        sourceBName = "";
                    }

                    if (sourceAName == selectedRow[0].cells[ComparisonPropertyColumns.SourceAName].innerText &&
                        sourceBName == selectedRow[0].cells[ComparisonPropertyColumns.SourceBName].innerText) {
                        properties[i]["Severity"] = status[1];
                        properties[i]["transpose"] = null;
                    }
                    else if (properties[i]["transpose"] !== null && !status[0].includes("(T)")) {
                        changedStatus = status[0] + "(T)";
                    }

                }

                component["Status"] = changedStatus;
                component["transpose"] = null;
                _this.updateReviewComponentGridData(_this.SelectionManager.HighlightedCheckComponentRow, groupId, changedStatus, false, ComparisonColumns.Status);
            }

        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestoreComponentTranspose = function (selectedRow, tableContainer, componentId, groupId) {
    var _this = this;
    // var componentId = this.GetComparisonResultId(selectedRow[0]);
    // var groupId = this.GetComparisonResultGroupId(selectedRow[0]);
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            dataType: 'JSON',
            async: true,
            data: {
                'componentid': componentId,
                'transposeType': 'restoreComponent',
                'transposeLevel': 'componentLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var properties = status[1];
                var component = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                component.status = status[0];
                component.transpose = null;
                var index = 0;
                for (var propertyId in properties) {
                    property = properties[propertyId];
                    if (property.accepted == 'false') {
                        component.properties[index].Severity = property.severity;
                        component.properties[index].transpose = null;
                    }
                    else if (property.accepted == 'true') {
                        if (!status[0].includes("(A)"))
                            component.status = status[0] + "(A)";
                    }
                    index++;
                }
                _this.updateReviewComponentGridData(selectedRow[0], tableContainer, groupId, component.status, true, ComparisonColumns.Status);
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.TransposeComponent = function (key, selectedRow, tableContainer, componentId, groupId) {
    var _this = this;
    
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    // var componentId = this.GetComparisonResultId(selectedRow[0]);
    // var groupId = this.GetComparisonResultGroupId(selectedRow[0]);
    var transposeType = key;

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'transposeType': transposeType,
                'transposeLevel': 'componentLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var component = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                component.transpose = transposeType;
                component.status = 'OK(T)';
                for (var propertyId in component.properties) {
                    property = component.properties[propertyId];
                    if (property.Severity !== "OK" && property.Severity !== "No Value") {
                        if (property.Severity == 'ACCEPTED') {
                            component.status = 'OK(A)(T)';
                        }
                        else if ((transposeType == 'lefttoright' || transposeType == 'righttoleft')
                            && (property.SourceAName !== "" && property.SourceBName !== "")) {
                            property.Severity = 'OK(T)';
                            property.transpose = transposeType;
                        }
                        else {
                            if ((property.Severity == 'Error' || property.Severity == 'No Match') && property.transpose == null &&
                                component.status == 'OK(T)') {
                                if (!(component.Status).includes('(T)'))
                                    component.status = component.Status + "(T)";
                            }
                        }
                    }

                }
                _this.updateReviewComponentGridData(selectedRow[0], tableContainer, groupId, component.status, true, ComparisonColumns.Status);
            },
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestoreCategoryTranspose = function (button) {
    var _this = this;

    var groupId = button.getAttribute("groupId");
    var categorydiv = document.getElementById(button.innerHTML);
    var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: { 'groupid': groupId, 'transposeType': 'restoreCategory', 'transposeLevel': 'categorylevel', 'ProjectName': projectinfo.projectname, 'CheckName': checkinfo.checkname },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var componentStatus = status[0];
                var propsStatus = status[1];
                var index = 0
                for (var i = 0; i < noOfComponents; i++) {
                    var j = 0;
                    var compgroup = _this.ComparisonCheckManager["CheckGroups"][groupId];
                    compgroup.categoryStatus = "UNACCEPTED";
                    for (var compId in compgroup["CheckComponents"]) {
                        var component = compgroup["CheckComponents"][compId];
                        component.status = componentStatus[index]['status'];
                        component.transpose = null;
                        var propindex = 0;
                        for (var propertyId in component.properties) {
                            property = component.properties[propertyId];
                            property.Severity = propsStatus[j][propindex]['severity'];
                            property.transpose = null;
                            propindex++;
                        }
                        j++;
                    }
                    var row = categorydiv.children[1].children[0].children[0].children[i];
                    var gridId = '#' + _this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;

                    var editedItem = {
                        "SourceA": row.cells[ComparisonColumns.SourceAName].innerText,
                        "SourceB": row.cells[ComparisonColumns.SourceBName].innerText,
                        "Status": component.status,
                        "SourceANodeId": row.cells[ComparisonColumns.SourceANodeId].innerText,
                        "SourceBNodeId": row.cells[ComparisonColumns.SourceBNodeId].innerText,
                        "ID": row.cells[ComparisonColumns.ResultId].innerText,
                        "groupId": row.cells[ComparisonColumns.GroupId].innerText
                    };

                    $(gridId).jsGrid("updateItem", row, editedItem).done(function () {
                        if (i == noOfComponents - 1) {
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

ComparisonReviewManager.prototype.TransposeCategory = function (key, button) {
    var _this = this;

    var groupId = button.getAttribute("groupId");
    var categorydiv = document.getElementById(button.innerHTML);
    var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;
    var transposeType = key;

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            data: { 'groupid': groupId, 'transposeType': transposeType, 'transposeLevel': 'categorylevel', 'ProjectName': projectinfo.projectname, 'CheckName': checkinfo.checkname },
            success: function (msg) {

                var compgroup = _this.ComparisonCheckManager["CheckGroups"][groupId];
                compgroup.categoryStatus = "OK(T)";
                var index = 0;
                for (var compId in compgroup["CheckComponents"]) {
                    var component = compgroup["CheckComponents"][compId];
                    component.status = component.Status;
                    if (component.Status !== 'No Match' && component.Status !== 'OK') {
                        for (var propertyId in component.properties) {
                            property = component.properties[propertyId];
                            if (property.Severity !== 'OK' && property.Severity !== 'No Value') {
                                if ((transposeType == 'lefttoright' || transposeType == 'righttoleft')
                                    && (property.SourceAName !== "" && property.SourceBName !== "")) {
                                    property.Severity = 'OK(T)';
                                    property.transpose = transposeType;
                                    component.status = "OK(T)";
                                    component.transpose = transposeType;
                                }
                                else {
                                    if ((property.Severity == 'Error' || property.Severity == 'No Match') && property.transpose == null &&
                                        component.status == 'OK(T)') {
                                        if (!(component.Status).includes('(T)'))
                                            component.status = component.Status + "(T)";
                                    }
                                }
                            }
                        }
                    }
                    var row = categorydiv.children[1].children[0].children[0].children[index];
                    var gridId = '#' + _this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;

                    var editedItem = {
                        "SourceA": row.cells[ComparisonColumns.SourceAName].innerText,
                        "SourceB": row.cells[ComparisonColumns.SourceBName].innerText,
                        "Status": component.status,
                        "SourceANodeId": row.cells[ComparisonColumns.SourceANodeId].innerText,
                        "SourceBNodeId": row.cells[ComparisonColumns.SourceBNodeId].innerText,
                        "ID": row.cells[ComparisonColumns.ResultId].innerText,
                        "groupId": row.cells[ComparisonColumns.GroupId].innerText
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

ComparisonReviewManager.prototype.GetReviewTableId = function (row) {
    var tBodyElement = row.parentElement;
    if (!tBodyElement) {
        return;
    }
    var tableElement = tBodyElement.parentElement;

    return tableElement.parentElement.parentElement.parentElement.id;
}

ComparisonReviewManager.prototype.GetReviewTable = function (row) {
    var tBodyElement = row.parentElement;
    if (!tBodyElement) {
        return;
    }
    var tableElement = tBodyElement.parentElement;

    return tableElement.parentElement.parentElement;
}

ComparisonReviewManager.prototype.getSourceNamesFromMainReviewRow = function (row) {
    return {
        SourceAName: row.cells[ComparisonColumns.SourceAName].innerText,
        SourceBName: row.cells[ComparisonColumns.SourceBName].innerText
    };
}

ComparisonReviewManager.prototype.getStatusFromMainReviewRow = function (row) {
    return row.cells[ComparisonColumns.Status].innerText;
}

ComparisonReviewManager.prototype.getSourcePropertiesNamesFromDetailedReview = function (row) {
    return {
        SourceAName: row.cells[ComparisonPropertyColumns.SourceAName].innerText.trim(),
        SourceBName: row.cells[ComparisonPropertyColumns.SourceBName].innerText.trim()
    }
}
