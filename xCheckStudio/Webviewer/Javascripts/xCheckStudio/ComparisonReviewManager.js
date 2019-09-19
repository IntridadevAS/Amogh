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

    // this.SourceAViewerCurrentSheetLoaded = undefined;
    // this.SourceBViewerCurrentSheetLoaded = undefined;

    // var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    // var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    // this.SelectionManager = new ReviewComparisonSelectionManager();

    // // populate review table
    // this.CheckResultsTable = new ComparisonCheckResultsTable(this, mainReviewTableContainer);   
    // this.CheckResultsTable.populateReviewTable();
    // model.checks["comparison"]["reviewTable"]  = this.CheckResultsTable;

    // this.CheckPropertiesTable = new ComparisonCheckPropertiesTable(this, detailedReviewTableContainer)
    // model.checks["comparison"]["detailedInfoTable"]  = this.CheckPropertiesTable;

    // this.SourceAReviewViewerInterface;
    // this.SourceBReviewViewerInterface;
    // this.SheetDataViewer;
}

ComparisonReviewManager.prototype.loadDatasources = function () {

    if (this.SourceAViewerData !== undefined) {
        var viewerInterface = new Review3DViewerInterface(["compare1", this.SourceAViewerData["endPointUri"]],
            this.SourceAComponentIdVsComponentData,
            this.SourceANodeIdVsComponentData);
        viewerInterface.NodeIdStatusData = this.SourceANodeIdVsStatus;
        viewerInterface.setupViewer(550, 280);

        model.checks["comparison"]["sourceAViewer"] = viewerInterface;
    }
    else if (this.SourceAComponents !== undefined) {
        var viewerInterface = new Review1DViewerInterface("a", this.SourceAComponents);
        model.checks["comparison"]["sourceAViewer"] = viewerInterface;
    }

    if (this.SourceBViewerData !== undefined) {
        var viewerInterface = new Review3DViewerInterface(["compare2", this.SourceBViewerData["endPointUri"]],
            this.SourceBComponentIdVsComponentData,
            this.SourceBNodeIdVsComponentData);
        viewerInterface.NodeIdStatusData = this.SourceBNodeIdVsStatus;
        viewerInterface.setupViewer(550, 280);

        model.checks["comparison"]["sourceBViewer"] = viewerInterface;
    }
    else if (this.SourceBComponents !== undefined) {
        var viewerInterface = new Review1DViewerInterface("b", this.SourceBComponents);
        model.checks["comparison"]["sourceBViewer"] = viewerInterface;
    }

    // if (this.SourceAComponents !== undefined ||
    //     this.SourceBComponents !== undefined) {
    //     this.SheetDataViewer = new Review1DViewerInterface(this, this.SourceAComponents, this.SourceBComponents);
    // }
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
    if (component.sourceANodeId) {
        this.SourceANodeIdvsCheckComponent[component.sourceANodeId] = {
            "Id": component.id,
            "SourceAName": component.sourceAName,
            "SourceBName": component.sourceBName,
            "MainClass": mainClass,
            "SourceANodeId": component.sourceANodeId,
            "SourceBNodeId": component.sourceBNodeId,
        };
        // this.SourceAComponentIdvsNodeId[component.ID] = component.SourceANodeId;
    }
    if (component.sourceBNodeId) {
        this.SourceBNodeIdvsCheckComponent[component.sourceBNodeId] = {
            "Id": component.id,
            "SourceAName": component.sourceAName,
            "SourceBName": component.sourceBName,
            "MainClass": mainClass,
            "SourceANodeId": component.sourceANodeId,
            "SourceBNodeId": component.sourceBNodeId,
        };
        // this.SourceBComponentIdvsNodeId[component.ID] = component.SourceBNodeId;
    }
}

ComparisonReviewManager.prototype.SecondViewerExists = function () {
    if (document.getElementById(ViewerBContainer.ViewerBContainer).innerHTML !== "") {
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

ComparisonReviewManager.prototype.OnCheckComponentRowClicked = function (rowData, containerDiv) {

    // populate property table
    model.checks["comparison"]["detailedInfoTable"].populateDetailedReviewTable(rowData);
    //this.CheckPropertiesTable.populateDetailedReviewTable(rowData);

    var sheetName = containerDiv.replace("#", "");
    sheetName = sheetName.split('_')[0];

    if (this.SourceAComponents !== undefined &&
        this.SourceBComponents !== undefined) {

        var result = sheetName.split('-');

        if (rowData.SourceA && rowData.SourceA !== "") {
            model.checks["comparison"]["sourceAViewer"].ShowSheetDataInViewer(Comparison.ViewerAContainer, result[0], rowData);
        }
        else {

            if ($("#" + Comparison.ViewerAContainer).data("igGrid")) {
                $("#" + Comparison.ViewerAContainer).igGrid("destroy");
            }

            model.checks["comparison"]["sourceAViewer"].ActiveSheetName = undefined;
        }

        if (rowData.SourceB && rowData.SourceB !== "") {
            model.checks["comparison"]["sourceBViewer"].ShowSheetDataInViewer(Comparison.ViewerBContainer, result[1], rowData);
        }
        else {
            if ($("#" + Comparison.ViewerBContainer).data("igGrid")) {
                $("#" + Comparison.ViewerBContainer).igGrid("destroy");
            }

            model.checks["comparison"]["sourceBViewer"].ActiveSheetName = undefined;
        }
    }
    else if (this.SourceAViewerData !== undefined &&
        this.SourceBViewerData !== undefined) {
        this.HighlightComponentInGraphicsViewer(rowData)
    }
    else if (this.SourceAComponents !== undefined &&
        this.SourceBViewerData !== undefined) {
        var result = sheetName.split('-');

        if (rowData.SourceA && rowData.SourceA !== "") {
            model.checks["comparison"]["sourceAViewer"].ShowSheetDataInViewer(Comparison.ViewerAContainer, result[0], rowData);
        } else {

            if ($("#" + Comparison.ViewerAContainer).data("igGrid")) {
                $("#" + Comparison.ViewerAContainer).igGrid("destroy");
            }

            model.checks["comparison"]["sourceAViewer"].ActiveSheetName = undefined;
        }

        this.HighlightComponentInGraphicsViewer(rowData)
    }
    else if (this.SourceAViewerData !== undefined &&
        this.SourceBComponents !== undefined) {
        var result = sheetName.split('-');

        if (rowData.SourceB && rowData.SourceB !== "") {
            model.checks["comparison"]["sourceBViewer"].ShowSheetDataInViewer(Comparison.ViewerBContainer, result[1], rowData);
        }
        else {

            if ($("#" + Comparison.ViewerBContainer).data("igGrid")) {
                $("#" + Comparison.ViewerBContainer).igGrid("destroy");
            }


            model.checks["comparison"]["sourceBViewer"].ActiveSheetName = undefined;
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

ComparisonReviewManager.prototype.AcceptProperty = function (selectedRow, tableContainer, componentId, groupId) {
    var _this = this;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    var propertiesNames = this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]);

    try {
        $.ajax({
            url: 'PHP/Accept.php',
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
                var component = _this.GetCheckComponent(groupId, componentId);

                var originalstatus = _this.getStatusFromMainReviewRow(model.getCurrentSelectionManager().HighlightedCheckComponentRow);
                var changedStatus = originalstatus;                
                if (!originalstatus.includes("(A)")) {
                    changedStatus = originalstatus + "(A)";
                    component["status"] = changedStatus;
                }
                if (msg.trim() == "OK(A)" || msg.trim() == "OK(A)(T)") {
                    changedStatus = msg.trim();
                    component["status"] = changedStatus;
                }

                // var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];
                // var checkComponents = checkGroup["CheckComponents"];
                // var component = checkComponents[componentId];
                var properties = component["properties"];

                //var propertiesLen = properties.length;

                for (var i = 0; i < properties.length; i++) {
                    var property = properties[i];
                    var sourceAName = property["sourceAName"];
                    if (!sourceAName) {
                        sourceAName = "";
                    }
                    var sourceBName = property["sourceBName"];
                    if (!sourceBName) {
                        sourceBName = "";
                    }

                    if (sourceAName == propertiesNames.SourceAName &&
                        sourceBName == propertiesNames.SourceBName) {
                        selectedRow[0].cells[ComparisonPropertyColumns.Status].innerHTML = "ACCEPTED";
                        model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], 'ACCEPTED');
                        property["severity"] = "ACCEPTED";
                    }

                }
                _this.updateReviewComponentGridData(model.getCurrentSelectionManager().HighlightedCheckComponentRow, 
                tableContainer, 
                groupId, 
                changedStatus, 
                false, 
                ComparisonColumns.Status);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.AcceptComponent = function (selectedRow, tableContainer, componentId, groupId) {

    var _this = this;
    // var componentId = this.GetComparisonResultId(selectedRow[0]);
    // var groupId = this.GetComparisonResultGroupId(selectedRow[0]);
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'tabletoupdate': "comparison",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var component = _this.GetCheckComponent(groupId, componentId);
                component.status = "OK(A)";
                model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], component.status);
                for (var propertyId in component.properties) {
                    property = component.properties[propertyId];
                    if (property.severity !== "OK" && property.severity !== "No Value") {
                        if ((property.transpose == 'lefttoright' || property.transpose == 'righttoleft')
                            && property.severity !== 'No Value') {
                            component.properties[propertyId].severity = 'ACCEPTED';
                            component.status = "OK(A)(T)";
                            component.properties[propertyId].transpose = property.transpose;
                        }
                        else {
                            component.properties[propertyId].severity = 'ACCEPTED';
                        }
                    }
                }
                _this.updateReviewComponentGridData(selectedRow[0], tableContainer, groupId, component.status, true, ComparisonColumns.Status);
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
   
    var data = $(tableContainer).data("igGrid").dataSource.dataView();
    var rowData = data[selectedRow.rowIndex];
    rowData.Status = changedStatus;

    selectedRow.cells[statusColumnId].innerText = changedStatus;
    
    if (populateDetailedTable) {
        model.checks["comparison"]["detailedInfoTable"].populateDetailedReviewTable(rowData);    
    }
    // else {
    //     if (model.getCurrentSelectionManager().HighlightedCheckComponentRow) {
    //         model.getCurrentSelectionManager().HighlightedCheckComponentRow.cells[ComparisonColumns.Status].innerText = changedStatus;
    //     }
    // }    
}

ComparisonReviewManager.prototype.toggleAcceptAllComparedComponents = function (tabletoupdate) {
    var tabletoupdate = tabletoupdate;
    try {
        $.ajax({
            url: 'PHP/Accept.php',
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
            url: 'PHP/Accept.php',
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

ComparisonReviewManager.prototype.UnAcceptComponent = function (selectedRow, tableContainer, componentId, groupId) {
    var _this = this;
    // var componentId = this.GetComparisonResultId(selectedRow[0]);
    // var groupId = this.GetComparisonResultGroupId(selectedRow[0]);
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
                'tabletoupdate': "rejectComponentFromComparisonTab",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var status = new Array();
                status = msg;
                var properties = status[1];

                var component = model.getCurrentReviewManager().GetCheckComponent(groupId, componentId);
                component.status = status[0];
                if (component.transpose != null) {
                    if (!status[0].includes("(T)"))
                        component.status = status[0] + "(T)";
                }

                model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], component.status);

                var index = 0;
                for (var propertyId in properties) {
                    property = properties[propertyId];
                    if ((property.transpose == 'lefttoright' || property.transpose == 'righttoleft')
                        && property.severity !== 'No Value') {
                        component.properties[index].severity = 'OK(T)';
                        component.properties[index].transpose = property.transpose;
                    }
                    else {
                        component.properties[index].severity = property.severity;
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

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    var propertiesNames = this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]);

    try {
        $.ajax({
            url: 'PHP/Accept.php',
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
                
                var component = model.getCurrentReviewManager().GetCheckComponent(groupId, componentId);
                var properties = component["properties"];               

                if (component["transpose"] !== null && !status[0].includes("(T)")) {
                    changedStatus = status[0] + "(T)";
                }
                component["status"] = changedStatus;
                for (var i = 0; i < properties.length; i++) {
                    var property = properties[i];
                    var sourceAName = property["sourceAName"];
                    if (!sourceAName) {
                        sourceAName = "";
                    }
                    var sourceBName = property["sourceBName"];
                    if (!sourceBName) {
                        sourceBName = "";
                    }

                    if (sourceAName == propertiesNames.SourceAName &&
                        sourceBName == propertiesNames.SourceBName) {
                        property["severity"] = status[1];

                        selectedRow[0].cells[ComparisonPropertyColumns.Status].innerHTML = status[1];
                        model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], status[1]);

                    }

                }
                _this.updateReviewComponentGridData(model.getCurrentSelectionManager().HighlightedCheckComponentRow, 
                tableContainer, 
                groupId, 
                changedStatus, 
                false, 
                ComparisonColumns.Status);                
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
            url: 'PHP/Accept.php',
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

ComparisonReviewManager.prototype.GetCellValue = function (currentReviewTableRow, cell) {
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
            model.checks["comparison"]["sourceAViewer"].highlightComponent(sourceANodeId);
        }
        else {
            // unhighlight previous component
            model.checks["comparison"]["sourceAViewer"].unHighlightComponent();
        }
    }
    if (this.SourceBViewerData != undefined) {

        if (sourceBNodeId !== undefined && sourceBNodeId !== "") {
            model.checks["comparison"]["sourceBViewer"].highlightComponent(sourceBNodeId);
        }
        else {
            // unhighlight previous component
            model.checks["comparison"]["sourceBViewer"].unHighlightComponent();
        }
    }
}

ComparisonReviewManager.prototype.TransposeProperty = function (key, selectedRow, tableContainer, componentId, groupId) {
    var _this = this;
    var transposeType = key;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

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
                var originalstatus = _this.getStatusFromMainReviewRow(model.getCurrentSelectionManager().HighlightedCheckComponentRow);
                var changedStatus = originalstatus;

                var component = model.getCurrentReviewManager().GetCheckComponent(groupId, componentId);
                // var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];
                // var checkComponents = checkGroup["CheckComponents"];
                // var component = checkComponents[componentId];
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

                model.getCurrentSelectionManager().ChangeBackgroundColor(model.getCurrentSelectionManager().HighlightedCheckComponentRow, changedStatus);

                var SourceAValue = selectedRow[0].cells[ComparisonPropertyColumns.SourceAValue].innerHTML;
                var SourceBValue = selectedRow[0].cells[ComparisonPropertyColumns.SourceBValue].innerHTML;

                model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], 'OK(T)');
               

                for (var i = 0; i < properties.length; i++) {
                    var property = properties[i];
                    var sourceAName = property["sourceAName"];
                    if (!sourceAName) {
                        sourceAName = "";
                    }
                    var sourceBName = property["sourceBName"];
                    if (!sourceBName) {
                        sourceBName = "";
                    }

                    if (sourceAName == propertiesNames.SourceAName &&
                        sourceBName == propertiesNames.SourceBName) {
                        property["severity"] = 'OK(T)';
                        property['transpose'] = transposeType;
                        selectedRow[0].cells[ComparisonPropertyColumns.Status].innerHTML = 'OK(T)';
                        if (transposeType == "lefttoright") {
                            selectedRow[0].cells[ComparisonPropertyColumns.SourceBValue].innerHTML = SourceAValue;
                        }
                        else if (transposeType == "righttoleft") {
                            selectedRow[0].cells[ComparisonPropertyColumns.SourceAValue].innerHTML = SourceBValue;
                        }

                    }

                    // if (property["severity"] != 'OK' && 
                    //    property["severity"] !== 'No Match') {
                       
                        // if (properties[i]['transpose'] !== null) {
                        //     if (i == propertiesLen - 1) {
                        //         component["Status"] = 'OK(T)';
                        //         component["transpose"] = transposeType;
                        //     }
                        // }
                    //}
                }
                _this.updateReviewComponentGridData(model.getCurrentSelectionManager().HighlightedCheckComponentRow, 
                tableContainer, 
                groupId, 
                changedStatus, 
                false, 
                ComparisonColumns.Status);
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestorePropertyTranspose = function (selectedRow, tableContainer, componentId, groupId) {
    var _this = this;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    // var transposeType = 'restoreProperty';

    // var componentId = this.GetComparisonResultId(model.getCurrentSelectionManager().HighlightedCheckComponentRow);
    // var groupId = this.GetComparisonResultGroupId(model.getCurrentSelectionManager().HighlightedCheckComponentRow);

    var propertiesNames = this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]);
    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: {
                'componentid': componentId,
                'transposeType': 'restoreProperty',
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

                var component = model.getCurrentReviewManager().GetCheckComponent(groupId, componentId);
                // var checkGroup = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId];
                // var checkComponents = checkGroup["CheckComponents"];
                // var component = checkComponents[componentId];
                var properties = component["properties"];                

                for (var i = 0; i < properties.length; i++) {
                    var property = properties[i];
                    var sourceAName = property["sourceAName"];
                    if (!sourceAName) {
                        sourceAName = "";
                    }
                    var sourceBName = property["sourceBName"];
                    if (!sourceBName) {
                        sourceBName = "";
                    }

                    if (sourceAName == selectedRow[0].cells[ComparisonPropertyColumns.SourceAName].innerText &&
                        sourceBName == selectedRow[0].cells[ComparisonPropertyColumns.SourceBName].innerText) {

                        selectedRow[0].cells[ComparisonPropertyColumns.Status].innerHTML = status[1];
                        // if (property["transpose"] == "lefttoright") {
                        selectedRow[0].cells[ComparisonPropertyColumns.SourceAValue].innerHTML = property["sourceAValue"];
                        // }
                        // else if (property["transpose"] == "righttoleft") {
                        selectedRow[0].cells[ComparisonPropertyColumns.SourceBValue].innerHTML = property["sourceBValue"];
                        // }
                        model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], status[1]);

                        property["severity"] = status[1];
                        property["transpose"] = null;
                    }
                    else if (property["transpose"] !== null && !status[0].includes("(T)")) {
                        changedStatus = status[0] + "(T)";
                    }

                }

                component["Status"] = changedStatus;
                component["transpose"] = null;

                _this.updateReviewComponentGridData(model.getCurrentSelectionManager().HighlightedCheckComponentRow,
                    tableContainer,
                    groupId,
                    changedStatus,
                    false,
                    ComparisonColumns.Status);
                
                model.getCurrentSelectionManager().ChangeBackgroundColor(model.getCurrentSelectionManager().HighlightedCheckComponentRow, changedStatus);
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
                var component = model.getCurrentReviewManager().GetCheckComponent(groupId, componentId);
                component.status = status[0];
                component.transpose = null;
                var index = 0;
                for (var propertyId in properties) {
                    property = properties[propertyId];
                    if (property.accepted == 'false') {
                        component.properties[index].severity = property.severity;
                        component.properties[index].transpose = null;
                    }
                    else if (property.accepted == 'true') {
                        if (!status[0].includes("(A)"))
                            component.status = status[0] + "(A)";
                    }
                    index++;
                }
                _this.updateReviewComponentGridData(selectedRow[0], tableContainer, groupId, component.status, true, ComparisonColumns.Status);
                model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], component.status);
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
                var component = model.getCurrentReviewManager().GetCheckComponent(groupId, componentId);
                component.transpose = transposeType;
                component.status = 'OK(T)';
                for (var propertyId in component.properties) {
                    property = component.properties[propertyId];
                    if (property.severity !== "OK" && property.severity !== "No Value") {
                        if (property.severity == 'ACCEPTED') {
                            component.status = 'OK(A)(T)';
                        }
                        else if ((transposeType == 'lefttoright' || transposeType == 'righttoleft')
                            && (property.sourceAName !== "" && property.sourceBName !== "")) {
                            property.severity = 'OK(T)';
                            property.transpose = transposeType;
                        }
                        else {
                            if ((property.severity == 'Error' || property.severity == 'No Match') && property.transpose == null &&
                                component.status == 'OK(T)') {
                                if (!(component.status).includes('(T)'))
                                    component.status = component.Status + "(T)";
                            }
                        }
                    }

                }
                _this.updateReviewComponentGridData(selectedRow[0], tableContainer, groupId, component.status, true, ComparisonColumns.Status);
                model.getCurrentSelectionManager().ChangeBackgroundColor(selectedRow[0], component.status);
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

ComparisonReviewManager.prototype.ResizeViewers = function () {
    if (model.checks["comparison"]["sourceAViewer"]) {
        model.checks["comparison"]["sourceAViewer"].ResizeViewer();
    }
    if (model.checks["comparison"]["sourceBViewer"]) {
        model.checks["comparison"]["sourceBViewer"].ResizeViewer();
    }
}

ComparisonReviewManager.prototype.GetCheckComponent = function (groupId, componentId) {
    var checkGroup = this.GetCheckGroup(groupId);
    var component = checkGroup.components[componentId];

    return component;
}

ComparisonReviewManager.prototype.GetCheckGroup = function (groupId) {
    return this.ComparisonCheckManager.results[groupId];    
}


ComparisonReviewManager.prototype.GetCheckComponetDataByNodeId = function (viewerId, selectedNode) {
    var checkComponentData;
    if (viewerId === Comparison.ViewerAContainer) {

        if (this.SourceANodeIdvsCheckComponent !== undefined &&
            selectedNode in this.SourceANodeIdvsCheckComponent) {
            checkComponentData = this.SourceANodeIdvsCheckComponent[selectedNode];
        }        
    }
    else if (viewerId === Comparison.ViewerBContainer) {
        if (this.SourceBNodeIdvsCheckComponent !== undefined &&
            selectedNode in this.SourceBNodeIdvsCheckComponent) {
            checkComponentData = this.SourceBNodeIdvsCheckComponent[selectedNode];
        }        
    }
    else if (viewerId=== Comparison.ViewerCContainer) {
    }
    else if (viewerId === Comparison.ViewerDContainer) {

    }

    return checkComponentData;
}