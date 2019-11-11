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
}

ComparisonReviewManager.prototype.loadDatasources = function () {

    if (this.SourceAViewerData["endPointUri"] !== undefined) {
        var viewerInterface = new Review3DViewerInterface(["compare1", this.SourceAViewerData["endPointUri"]],
            this.SourceAComponentIdVsComponentData,
            this.SourceANodeIdVsComponentData,
            this.SourceAViewerData["source"]);
        viewerInterface.NodeIdStatusData = this.SourceANodeIdVsStatus;
        viewerInterface.setupViewer(550, 280);

        model.checks["comparison"]["sourceAViewer"] = viewerInterface;
    }
    else if (this.SourceAComponents !== undefined) {
        var viewerInterface = new Review1DViewerInterface("a", this.SourceAComponents);
        model.checks["comparison"]["sourceAViewer"] = viewerInterface;
    }

    if (this.SourceBViewerData["endPointUri"] !== undefined) {
        var viewerInterface = new Review3DViewerInterface(["compare2", this.SourceBViewerData["endPointUri"]],
            this.SourceBComponentIdVsComponentData,
            this.SourceBNodeIdVsComponentData,
            this.SourceBViewerData["source"]);
        viewerInterface.NodeIdStatusData = this.SourceBNodeIdVsStatus;
        viewerInterface.setupViewer(550, 280);

        model.checks["comparison"]["sourceBViewer"] = viewerInterface;
    }
    else if (this.SourceBComponents !== undefined) {
        var viewerInterface = new Review1DViewerInterface("b", this.SourceBComponents);
        model.checks["comparison"]["sourceBViewer"] = viewerInterface;
    }
}

ComparisonReviewManager.prototype.AddTableContentCount = function (containerId) {
    var countDiv = document.getElementById(containerId + "_child");
    if (countDiv) {
        return;
    }
    else {
        var modelBrowserData = document.getElementById(containerId);
        // var categoryId = containerId + "System_table_container";

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


ComparisonReviewManager.prototype.OnCheckComponentRowClicked = function (rowData, containerDiv) {

    // populate property table
    model.checks["comparison"]["detailedInfoTable"].populateDetailedReviewTable(rowData, containerDiv.replace("#", ""));

    var sheetName = containerDiv.replace("#", "");
    sheetName = sheetName.split('_')[0];

    if (this.SourceAComponents !== undefined &&
        this.SourceBComponents !== undefined) {

        var result = sheetName.split('-');

        if (rowData.SourceA && rowData.SourceA !== "") {
            model.checks["comparison"]["sourceAViewer"].ShowSheetDataInViewer(Comparison.ViewerAContainer, result[0], rowData);
        }
        else {
            model.checks["comparison"]["sourceAViewer"].Destroy(Comparison.ViewerAContainer);
            model.checks["comparison"]["sourceAViewer"].ActiveSheetName = undefined;
        }

        if (rowData.SourceB && rowData.SourceB !== "") {
            model.checks["comparison"]["sourceBViewer"].ShowSheetDataInViewer(Comparison.ViewerBContainer, result[1], rowData);
        }
        else {
            model.checks["comparison"]["sourceBViewer"].Destroy(Comparison.ViewerBContainer);
            model.checks["comparison"]["sourceBViewer"].ActiveSheetName = undefined;
        }
    }
    else if (this.SourceAViewerData["endPointUri"] !== undefined &&
        this.SourceBViewerData["endPointUri"] !== undefined) {
        this.HighlightComponentInGraphicsViewer(rowData)
    }
    else if (this.SourceAComponents !== undefined &&
        this.SourceBViewerData["endPointUri"] !== undefined) {
        var result = sheetName.split('-');

        if (rowData.SourceA && rowData.SourceA !== "") {
            model.checks["comparison"]["sourceAViewer"].ShowSheetDataInViewer(Comparison.ViewerAContainer, result[0], rowData);
        } else {

            model.checks["comparison"]["sourceAViewer"].Destroy(Comparison.ViewerAContainer);
            model.checks["comparison"]["sourceAViewer"].ActiveSheetName = undefined;
        }

        this.HighlightComponentInGraphicsViewer(rowData)
    }
    else if (this.SourceAViewerData["endPointUri"] !== undefined &&
        this.SourceBComponents !== undefined) {
        var result = sheetName.split('-');

        if (rowData.SourceB && rowData.SourceB !== "") {
            model.checks["comparison"]["sourceBViewer"].ShowSheetDataInViewer(Comparison.ViewerBContainer, result[1], rowData);
        }
        else {
            model.checks["comparison"]["sourceBViewer"].Destroy(Comparison.ViewerBContainer);
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

ComparisonReviewManager.prototype.AcceptProperty = function (selectedPropertiesKey, componentId, groupId) {
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
                'tabletoupdate': "comparisonDetailed",
                'propertyIds': JSON.stringify(selectedPropertiesKey),
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = JSON.parse(msg);

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);

                var properties = checkResultComponent["properties"];
                var isPropertyAccepted = false;
                var isPropertyTransposed = false;
                var isComponentOK = true;

                for (var i = 0; i < properties.length; i++) {

                    var orginalProperty = properties[i];

                    orginalProperty.accepted = results[componentId]["properties"][i].accepted;

                    if(orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value") {
                        if(orginalProperty.accepted == "true") {
                            orginalProperty["severity"] = "ACCEPTED";
                            model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), orginalProperty)

                            if(!isPropertyAccepted)
                                isPropertyAccepted = true;
                        }
                        else if(orginalProperty.transpose !== null) {
                            if(!isPropertyTransposed)
                                    isPropertyTransposed = true;
                        }
                        else {
                            if(isComponentOK)
                                isComponentOK = false;
                        }
                    }

                }

                if(isComponentOK) {
                    checkResultComponent.status = "OK";
                }
                else {
                    if(checkResultComponent.status !== results[componentId].status)
                        checkResultComponent.status = results[componentId].status;
                }

                if(isPropertyAccepted) {
                    checkResultComponent.status = checkResultComponent.status + "(A)";
                }

                if(isPropertyTransposed) {
                    checkResultComponent.status = checkResultComponent.status + "(T)";
                }

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.AcceptComponents = function (selectedGroupIdsVsResultsIds) {

    var _this = this;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            data: {
                'selectedGroupIdsVsResultsIds': JSON.stringify(selectedGroupIdsVsResultsIds),
                'tabletoupdate': "comparison",
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
                           else if(orginalProperty["transpose"] !== null){
                                originalComponent.status = "OK(A)(T)";
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

ComparisonReviewManager.prototype.updateStatusOfCategory = function (accordion) {
    var _this = this;

    var groupData = model.getCurrentReviewTable().GetAccordionData(accordion.textContent);
    var groupId = groupData["groupId"];
    var groupContainer = "#" + this.ComparisonCheckManager["results"][groupId]["componentClass"] + "_" + this.MainReviewTableContainer;
    var dataGrid =  $(groupContainer).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            data: { 'groupid': groupId, 
            'tabletoupdate': "category", 
            'ProjectName': projectinfo.projectname,
            'CheckName': checkinfo.checkname },
            success: function (msg) {
                var compgroup = _this.ComparisonCheckManager["results"][groupId];
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
                            // var rowElement = dataGrid.getRowElement(rows[i].rowIndex);
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

ComparisonReviewManager.prototype.UnAcceptComponents = function (selectedGroupIdsVsResultsIds) {
    var _this = this;
    
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            dataType: 'JSON',
            async: true,
            data: {
                'selectedGroupIdsVsResultsIds': JSON.stringify(selectedGroupIdsVsResultsIds),
                'tabletoupdate': "rejectComponentFromComparisonTab",
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

                        var isPropertyTransposed = false;

                        for(var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["accepted"] = changedProperty["accepted"];

                           if(orginalProperty["accepted"] == "false" && orginalProperty["transpose"] == null) {            
                                orginalProperty.severity = changedProperty.severity;
                           }
                           else if(orginalProperty["transpose"] !== null) {
                                if(!isPropertyTransposed) {
                                    isPropertyTransposed = true;
                                }
                           }
                        }

                        if(isPropertyTransposed) {
                            originalComponent.status = originalComponent.status + "(T)";
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

ComparisonReviewManager.prototype.UnAcceptProperty = function (selectedPropertiesKey, componentId, groupId) {
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
                'tabletoupdate': "rejectPropertyFromComparisonTab",
                'propertyIds': JSON.stringify(selectedPropertiesKey),
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = msg;

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);
                checkResultComponent.accepted = results[componentId].accepted;

                checkResultComponent.status = results[componentId].status;
                

                var properties = checkResultComponent["properties"];
                var isPropertyTransposed = false;
                var isPropertyAccepted = false;

                for (var i = 0; i < properties.length; i++) {

                    var property = properties[i];
                    
                    property.accepted = results[componentId]["properties"][i].accepted;

                    if(property.accepted == "false" && property.transpose == null) {

                        property["severity"] = results[componentId]["properties"][i].severity;
                        model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), property)

                    }
                    else if(property.accepted == "true") {
                        if(!isPropertyAccepted) {
                            isPropertyAccepted = true;
                        }
                    }
                    else if(property.transpose != null) {

                        if(!isPropertyTransposed) {
                            isPropertyTransposed = true;
                        }
                    }

                }

                if(isPropertyAccepted) {
                    checkResultComponent.status = checkResultComponent.status + "(A)";
                }

                if(isPropertyTransposed) {
                    checkResultComponent.status = checkResultComponent.status + "(T)";
                }

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.UnAcceptCategory = function (accordion) {
    var _this = this;

    var groupData = model.getCurrentReviewTable().GetAccordionData(accordion.textContent);
    var groupId = groupData["groupId"];
    var groupContainer = "#" + this.ComparisonCheckManager["results"][groupId]["componentClass"] + "_" + this.MainReviewTableContainer;
    var dataGrid =  $(groupContainer).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
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
                var compgroup = _this.ComparisonCheckManager["results"][groupId];
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
                    model.getCurrentReviewTable().UpdateGridData(compId, groupContainer, component.status, true);
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
    if (this.SourceAViewerData["endPointUri"] !== undefined &&
        currentReviewTableRowData.SourceANodeId !== "") {
        sourceANodeId = currentReviewTableRowData.SourceANodeId;
    }

    var sourceBNodeId;
    if (this.SourceBViewerData["endPointUri"] !== undefined &&
        currentReviewTableRowData.SourceBNodeId !== "") {
        sourceBNodeId = currentReviewTableRowData.SourceBNodeId;
    }

    // highlight component in graphics view in both viewer
    if (this.SourceAViewerData["endPointUri"] != undefined) {
        if (sourceANodeId !== undefined && sourceANodeId !== "") {
            model.checks["comparison"]["sourceAViewer"].highlightComponent(sourceANodeId);
        }
        else {
            // unhighlight previous component
            model.checks["comparison"]["sourceAViewer"].unHighlightComponent();
        }
    }
    if (this.SourceBViewerData["endPointUri"] != undefined) {

        if (sourceBNodeId !== undefined && sourceBNodeId !== "") {
            model.checks["comparison"]["sourceBViewer"].highlightComponent(sourceBNodeId);
        }
        else {
            // unhighlight previous component
            model.checks["comparison"]["sourceBViewer"].unHighlightComponent();
        }
    }
}

ComparisonReviewManager.prototype.GetSheetName = function(component, viewerContainerId) {
    var sheetName; 

    if(viewerContainerId == Comparison.ViewerAContainer) {
        sheetName = sourceAComparisonHierarchy[component.sourceAId].MainClass;
    }
    else if(viewerContainerId == Comparison.ViewerBContainer) {
        sheetName = sourceBComparisonHierarchy[component.sourceBId].MainClass;
    }

    return sheetName;
}

ComparisonReviewManager.prototype.TransposeProperty = function (key, selectedPropertiesKey, componentId, groupId) {
    var _this = this;
    var transposeType = key;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'transposeType': transposeType,
                'propertyIds': JSON.stringify(selectedPropertiesKey),
                'transposeLevel': 'propertyLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = JSON.parse(msg);

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);

                var properties = checkResultComponent["properties"];
                var isPropertyAccepted = false;
                var isPropertyTransposed = false;
                var isComponentOK = true;

                for (var i = 0; i < properties.length; i++) {

                    var orginalProperty = properties[i];

                    orginalProperty.transpose = results[componentId]["properties"][i].transpose;

                    if(orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value") {
                        if(orginalProperty.accepted == "true") {                         
                            if(!isPropertyAccepted)
                                isPropertyAccepted = true;
                        }
                        else if(orginalProperty.transpose !== null) {

                            orginalProperty.severity = "OK(T)";
                            model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), orginalProperty)

                            if(!isPropertyTransposed)
                                    isPropertyTransposed = true;
                        }
                        else {
                            if(isComponentOK)
                                isComponentOK = false;
                        }
                    }

                }

                if(isComponentOK) {
                    checkResultComponent.status = "OK";
                }
                else {
                    if(checkResultComponent.status !== results[componentId].status)
                        checkResultComponent.status = results[componentId].status;
                }

                if(isPropertyAccepted) {
                    checkResultComponent.status = checkResultComponent.status + "(A)";
                }

                if(isPropertyTransposed) {
                    checkResultComponent.status = checkResultComponent.status + "(T)";
                }

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestorePropertyTranspose = function (selectedPropertiesKey, componentId, groupId) {
    var _this = this;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    // var propertiesNames = this.getSourcePropertiesNamesFromDetailedReview(selectedRow[0]);
    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            dataType: 'JSON',
            data: {
                'componentid': componentId,
                'transposeType': 'restoreProperty',
                'propertyIds': JSON.stringify(selectedPropertiesKey),
                'transposeLevel': 'propertyLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = msg;

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);

                var properties = checkResultComponent["properties"];
                var isPropertyAccepted = false;
                var isPropertyTransposed = false;
                var isComponentOK = true;

                for (var i = 0; i < properties.length; i++) {

                    var orginalProperty = properties[i];
                    var changedProperty = results[componentId]["properties"][i];

                    orginalProperty.transpose = changedProperty.transpose;

                    if(orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value") {
                        if(orginalProperty.accepted == "true") {                         
                            if(!isPropertyAccepted)
                                isPropertyAccepted = true;
                        }
                        else if(orginalProperty.transpose !== null) {
                            if(!isPropertyTransposed)
                                    isPropertyTransposed = true;
                        }
                        else {

                            orginalProperty.severity = changedProperty.severity;
                            model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), orginalProperty)

                            if(isComponentOK)
                                isComponentOK = false;
                        }
                    }

                }

                if(isComponentOK) {
                    checkResultComponent.status = "OK";
                }
                else {
                    if(checkResultComponent.status !== results[componentId].status)
                        checkResultComponent.status = results[componentId].status;
                }

                if(isPropertyAccepted) {
                    checkResultComponent.status = checkResultComponent.status + "(A)";
                }

                if(isPropertyTransposed) {
                    checkResultComponent.status = checkResultComponent.status + "(T)";
                }

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);
            }

        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestoreComponentTranspose = function (selectedGroupIdsVsResultIds) {
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
                'selectedGroupIdsVsResultsIds': JSON.stringify(selectedGroupIdsVsResultIds),
                'transposeType': 'restoreComponent',
                'transposeLevel': 'componentLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                
                var results = msg;

                for(var groupId in results) {

                    var transpoedComponents = results[groupId];
                    
                    for(var componentId in transpoedComponents) {

                        var originalComponent = _this.GetCheckComponent(groupId, componentId);

                        var changedComponent = transpoedComponents[componentId]["component"];

                        originalComponent.transpose = changedComponent["transpose"];
                        originalComponent.status = "OK";

                        var isPropertyAccepted = false;
                        var isPropertyTransposed = false;

                        for(var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["transpose"] = changedProperty["transpose"];
                            if(orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value") {
                                if(orginalProperty.accepted == "true") {

                                    if(!isPropertyAccepted)
                                        isPropertyAccepted = true;
                                }
                                else if(orginalProperty.transpose !== null) {    
                                    if(!isPropertyTransposed)
                                            isPropertyTransposed = true;
                                }
                                else {

                                    orginalProperty["severity"] = changedProperty["severity"];
                                    if(originalComponent.status !== changedComponent.status)
                                        originalComponent.status = changedComponent.status;
                                }
                            }
                        }

                        if(isPropertyAccepted) {
                            originalComponent.status = originalComponent.status + "(A)";
                        }

                        if(isPropertyTransposed) {
                            originalComponent.status = originalComponent.status + "(T)";
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

ComparisonReviewManager.prototype.TransposeComponent = function (key, selectedGroupIdsVsResultIds) {
    var _this = this;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    var transposeType = key;

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            data: {
                'selectedGroupIdsVsResultsIds': JSON.stringify(selectedGroupIdsVsResultIds),
                'transposeType': transposeType,
                'transposeLevel': 'componentLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = JSON.parse(msg);

                for(var groupId in results) {

                    var transpoedComponents = results[groupId];
                    
                    for(var componentId in transpoedComponents) {

                        var originalComponent = _this.GetCheckComponent(groupId, componentId);

                        var changedComponent = transpoedComponents[componentId]["component"];

                        originalComponent.transpose = changedComponent["transpose"];
                        originalComponent.status = "OK";

                        var isPropertyAccepted = false;
                        var isPropertyTransposed = false;

                        for(var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["transpose"] = changedProperty["transpose"];
                            if(orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value") {
                                if(orginalProperty.accepted == "true") {

                                    if(!isPropertyAccepted)
                                        isPropertyAccepted = true;
                                }
                                else if(orginalProperty.transpose !== null) {
                                    orginalProperty.severity = "OK(T)";
    
                                    if(!isPropertyTransposed)
                                            isPropertyTransposed = true;
                                }
                                else {
    
                                    if(originalComponent.status !== changedComponent.status)
                                        originalComponent.status = changedComponent.status;
                                }
                            }
                        }

                        if(isPropertyAccepted) {
                            originalComponent.status = originalComponent.status + "(A)";
                        }

                        if(isPropertyTransposed) {
                            originalComponent.status = originalComponent.status + "(T)";
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

ComparisonReviewManager.prototype.RestoreCategoryTranspose = function (accordion) {
    var _this = this;

    var groupData = model.getCurrentReviewTable().GetAccordionData(accordion.textContent);
    var groupId = groupData["groupId"];
    var groupContainer = "#" + this.ComparisonCheckManager["results"][groupId]["componentClass"] + "_" + this.MainReviewTableContainer;
    var dataGrid =  $(groupContainer).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

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

                var compgroup = _this.ComparisonCheckManager["results"][groupId];
                compgroup.categoryStatus = "UNACCEPTED";
                for (var i = 0; i < rows.length; i++) {
                    var compId = rows[i]["data"]["ID"];
                    var component = compgroup["components"][compId];
                    component.status = componentStatus[i]['status'];;
                    component.transpose = null;
                    var propindex = 0;
                    for (var propertyId in component.properties) {
                        property = component.properties[propertyId];
                        property.severity = propsStatus[i][propindex]['severity'];
                        property.transpose = null;
                        propindex++;
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

ComparisonReviewManager.prototype.TransposeCategory = function (key, accordion) {
    var _this = this;

    var groupData = model.getCurrentReviewTable().GetAccordionData(accordion.textContent);
    var groupId = groupData["groupId"];
    var groupContainer = "#" + this.ComparisonCheckManager["results"][groupId]["componentClass"] + "_" + this.MainReviewTableContainer;
    var dataGrid =  $(groupContainer).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    var transposeType = key;

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            data: { 'groupid': groupId, 'transposeType': transposeType, 'transposeLevel': 'categorylevel', 'ProjectName': projectinfo.projectname, 'CheckName': checkinfo.checkname },
            success: function (msg) {

                var compgroup = _this.ComparisonCheckManager["results"][groupId];
                compgroup.categoryStatus = "OK(T)";

                for (var i = 0; i < rows.length; i++) {
                    var compId = rows[i]["data"]["ID"];
                    var component = compgroup["components"][compId];
                    var originalstatus = component.status;
                    if (component.status !== 'No Match' && component.status !== 'OK') {
                        component.status = "OK(T)";
                        component.transpose = transposeType;
                        for (var propertyId in component.properties) {
                            property = component.properties[propertyId];
                            if (property.severity !== 'OK' && property.severity !== 'No Value') {
                                if ((transposeType == 'lefttoright' || transposeType == 'righttoleft')
                                    && (property.sourceAName !== "" && property.sourceBName !== "")) {
                                    property.severity = 'OK(T)';
                                    property.transpose = transposeType;
                                }
                                else {
                                    if ((property.severity == 'Error' || property.severity == 'No Match') && property.transpose == null &&
                                        component.status == 'OK(T)') {
                                        if (!(originalstatus).includes('(T)'))
                                            component.status = originalstatus + "(T)";
                                    }
                                }
                            }
                        }
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
    else if (viewerId === Comparison.ViewerCContainer) {
    }
    else if (viewerId === Comparison.ViewerDContainer) {

    }

    return checkComponentData;
}

ComparisonReviewManager.prototype.GetNodeIdvsComponentData = function (viewerId) {
    if (viewerId === Comparison.ViewerAContainer) {
        return this.SourceANodeIdvsCheckComponent;
    }
    else if (viewerId === Comparison.ViewerBContainer) {
        return this.SourceBNodeIdvsCheckComponent;
    }

    return undefined;
}