function ComparisonReviewManager(comparisonCheckManager,
    sourceAViewerData,
    sourceBViewerData,
    sourceCViewerData,
    sourceDViewerData,
    sourceAComponents,
    sourceBComponents,
    sourceCComponents,
    sourceDComponents,
    mainReviewTableContainer,
    detailedReviewTableContainer,
    sourceAComponentsHierarchy,
    sourceBComponentsHierarchy,
    sourceCComponentsHierarchy,
    sourceDComponentsHierarchy) {

    this.SourceAViewerData = sourceAViewerData;
    this.SourceBViewerData = sourceBViewerData;
    this.SourceCViewerData = sourceCViewerData;
    this.SourceDViewerData = sourceDViewerData;

    this.SourceAComponents = sourceAComponents;
    this.SourceBComponents = sourceBComponents;
    this.SourceCComponents = sourceCComponents;
    this.SourceDComponents = sourceDComponents;

    this.MainReviewTableContainer = mainReviewTableContainer;
    this.DetailedReviewTableContainer = detailedReviewTableContainer;

    this.SourceANodeIdVsStatus = sourceAComponentsHierarchy;
    this.SourceBNodeIdVsStatus = sourceBComponentsHierarchy;
    this.SourceCNodeIdVsStatus = sourceCComponentsHierarchy;
    this.SourceDNodeIdVsStatus = sourceDComponentsHierarchy;

    this.ComparisonCheckManager = comparisonCheckManager;

    this.detailedReviewRowComments = {};

    this.SourceANodeIdvsCheckComponent = {};
    this.SourceBNodeIdvsCheckComponent = {};
    this.SourceCNodeIdvsCheckComponent = {};
    this.SourceDNodeIdvsCheckComponent = {};
}

ComparisonReviewManager.prototype.loadDatasources = function () {

    // Source A
    if (this.SourceAViewerData && this.SourceAViewerData["endPointUri"] !== undefined) {
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

    // Source B
    if (this.SourceBViewerData && this.SourceBViewerData["endPointUri"] !== undefined) {
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


    // Source C
    if (this.SourceCViewerData && this.SourceCViewerData["endPointUri"] !== undefined) {
        var viewerInterface = new Review3DViewerInterface(["compare3", this.SourceCViewerData["endPointUri"]],
            this.SourceCComponentIdVsComponentData,
            this.SourceCNodeIdVsComponentData,
            this.SourceCViewerData["source"]);
        viewerInterface.NodeIdStatusData = this.SourceCNodeIdVsStatus;
        viewerInterface.setupViewer(550, 280);

        model.checks["comparison"]["sourceCViewer"] = viewerInterface;
    }
    else if (this.SourceCComponents !== undefined) {
        var viewerInterface = new Review1DViewerInterface("c", this.SourceCComponents);
        model.checks["comparison"]["sourceCViewer"] = viewerInterface;
    }

    // Source D
    if (this.SourceDViewerData && this.SourceDViewerData["endPointUri"] !== undefined) {
        var viewerInterface = new Review3DViewerInterface(["compare4", this.SourceDViewerData["endPointUri"]],
            this.SourceDComponentIdVsComponentData,
            this.SourceDNodeIdVsComponentData,
            this.SourceDViewerData["source"]);
        viewerInterface.NodeIdStatusData = this.SourceDNodeIdVsStatus;
        viewerInterface.setupViewer(550, 280);

        model.checks["comparison"]["sourceDViewer"] = viewerInterface;
    }
    else if (this.SourceDComponents !== undefined) {
        var viewerInterface = new Review1DViewerInterface("d", this.SourceDComponents);
        model.checks["comparison"]["sourceDViewer"] = viewerInterface;
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
        div2.style.color = "white";

        // var countBox = document.getElementById(id);
        // modelBrowserTableRows contains header, search bar row and freespace row as row hence count is length-3
        var rowCount = modelBrowserTableRows.length - 3;
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
            "SourceCName": component.sourceCName,
            "SourceDName": component.sourceDName,
            "MainClass": mainClass,
            "SourceANodeId": component.sourceANodeId,
            "SourceBNodeId": component.sourceBNodeId,
            "SourceCNodeId": component.sourceCNodeId,
            "SourceDNodeId": component.sourceDNodeId,
            "sourceAId": component.sourceAId,
            "sourceBId": component.sourceBId,
            "sourceCId": component.sourceCId,
            "sourceDId": component.sourceDId,
        };
    }
    if (component.sourceBNodeId) {
        this.SourceBNodeIdvsCheckComponent[component.sourceBNodeId] = {
            "Id": component.id,
            "SourceAName": component.sourceAName,
            "SourceBName": component.sourceBName,
            "SourceCName": component.sourceCName,
            "SourceDName": component.sourceDName,
            "MainClass": mainClass,
            "SourceANodeId": component.sourceANodeId,
            "SourceBNodeId": component.sourceBNodeId,
            "SourceCNodeId": component.sourceCNodeId,
            "SourceDNodeId": component.sourceDNodeId,
            "sourceAId": component.sourceAId,
            "sourceBId": component.sourceBId,
            "sourceCId": component.sourceCId,
            "sourceDId": component.sourceDId,
        };
    }

    if (component.sourceCNodeId) {
        this.SourceCNodeIdvsCheckComponent[component.sourceCNodeId] = {
            "Id": component.id,
            "SourceAName": component.sourceAName,
            "SourceBName": component.sourceBName,
            "SourceCName": component.sourceCName,
            "SourceDName": component.sourceDName,
            "MainClass": mainClass,
            "SourceANodeId": component.sourceANodeId,
            "SourceBNodeId": component.sourceBNodeId,
            "SourceCNodeId": component.sourceCNodeId,
            "SourceDNodeId": component.sourceDNodeId,
            "sourceAId": component.sourceAId,
            "sourceBId": component.sourceBId,
            "sourceCId": component.sourceCId,
            "sourceDId": component.sourceDId,
        };
    }

    if (component.sourceDNodeId) {
        this.SourceDNodeIdvsCheckComponent[component.sourceDNodeId] = {
            "Id": component.id,
            "SourceAName": component.sourceAName,
            "SourceBName": component.sourceBName,
            "SourceCName": component.sourceCName,
            "SourceDName": component.sourceDName,
            "MainClass": mainClass,
            "SourceANodeId": component.sourceANodeId,
            "SourceBNodeId": component.sourceBNodeId,
            "SourceCNodeId": component.sourceCNodeId,
            "SourceDNodeId": component.sourceDNodeId,
            "sourceAId": component.sourceAId,
            "sourceBId": component.sourceBId,
            "sourceCId": component.sourceCId,
            "sourceDId": component.sourceDId,
        };
    }
}


ComparisonReviewManager.prototype.OnCheckComponentRowClicked = function (rowData, containerDiv) {

    // populate property table
    model.checks["comparison"]["detailedInfoTable"].populateDetailedReviewTable(rowData, containerDiv.replace("#", ""));

    var sheetNameArray = containerDiv.replace("#", "");
    sheetNameArray = sheetNameArray.split('_')[0];
    var result = sheetNameArray.split('-');

    if (model.checks["comparison"]["sourceAViewer"]) {

        var sheetName = result[0];

        model.checks["comparison"]["sourceAViewer"].highlightComponent(Comparison.ViewerAContainer,
            sheetName,
            rowData,
            rowData.SourceANodeId);
    }
    if (model.checks["comparison"]["sourceBViewer"]) {
        var sheetName = result[1];

        model.checks["comparison"]["sourceBViewer"].highlightComponent(Comparison.ViewerBContainer,
            sheetName,
            rowData,
            rowData.SourceBNodeId);
    }
    if (model.checks["comparison"]["sourceCViewer"]) {
        var sheetName = result[2];

        model.checks["comparison"]["sourceCViewer"].highlightComponent(Comparison.ViewerCContainer,
            sheetName,
            rowData,
            rowData.
                SourceCNodeId);
    }
    if (model.checks["comparison"]["sourceDViewer"]) {
        var sheetName = result[3];

        model.checks["comparison"]["sourceDViewer"].highlightComponent(Comparison.ViewerDContainer,
            sheetName,
            rowData,
            rowData.SourceDNodeId);
    }
}

ComparisonReviewManager.prototype.GetComparisonResultId = function (selectedRow) {
    return selectedRow.cells[ComparisonColumns.ResultId].innerHTML;
}

ComparisonReviewManager.prototype.GetComparisonResultGroupId = function (MainClass) {
    var checkTableIds = model.getCurrentReviewTable().CheckTableIds;
    for (var groupId in checkTableIds) {
        if (!checkTableIds[groupId].toLowerCase().includes(MainClass.toLowerCase())) {
            continue;
        }
        else {
            return groupId;
        }
    }
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
                'ActionToPerform': "acceptComparisonProperty",
                'propertyIds': JSON.stringify(selectedPropertiesKey),
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = JSON.parse(msg);

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);

                var properties = checkResultComponent["properties"];
                for (var i = 0; i < properties.length; i++) {

                    var orginalProperty = properties[i];

                    orginalProperty.accepted = results[componentId]["properties"][i].accepted;

                    if (orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value") {
                        if (orginalProperty.accepted == "true") {
                            orginalProperty["severity"] = "ACCEPTED";
                            model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), orginalProperty)


                        }
                    }
                }

                checkResultComponent.status = results[componentId]["status"];


                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);

                if (results[componentId]["sourceANodeId"] !== null) {
                    var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
                    sourceAViewerInterface.ChangeComponentColorOnStatusChange(checkResultComponent, true);
                }
                if (results[componentId]["sourceBNodeId"] !== null) {
                    var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
                    sourceBViewerInterface.ChangeComponentColorOnStatusChange(checkResultComponent, false);
                }
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
                'ActionToPerform': "acceptComparisonComponent",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = JSON.parse(msg);

                for (var groupId in results) {

                    var acceptedComponents = results[groupId];

                    for (var componentId in acceptedComponents) {

                        var originalComponent = _this.GetCheckComponent(groupId, componentId);

                        var changedComponent = acceptedComponents[componentId]["component"];

                        originalComponent.accepted = changedComponent["accepted"];

                        // if (originalComponent.status.toLowerCase() !== 'ok') {
                            originalComponent.status = changedComponent["status"];
                        // }

                        for (var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["accepted"] = changedProperty["accepted"];

                            if (orginalProperty["accepted"] == "true") {
                                orginalProperty.severity = "ACCEPTED";
                            }
                            // else if (orginalProperty["transpose"] !== null) {
                            //     originalComponent.status = "OK(A)(T)";
                            // }
                        }

                        var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                        model.getCurrentReviewTable().UpdateGridData(componentId, tableContainer, originalComponent.status, true);

                        if (changedComponent["sourceANodeId"] !== null) {
                            var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
                            sourceAViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, true);
                        }
                        if (changedComponent["sourceBNodeId"] !== null) {
                            var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
                            sourceBViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, false);
                        }
                    }
                }
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.GetWorstSeverityStatusOfComponent = function (properties) {

    var worstSeverity = "OK";
    for (var i = 0; i < properties.length; i++) {

        var property = properties[i];

        if (property.severity !== "OK" && property.severity !== "No Value") {
            if (property.severity.toLowerCase() == "accepted" || property.severity.toLowerCase() == "ok(t)" ||
                property.accepted == "true" || property.transpose !== null) {
                continue;
            }
            else {
                if (property.severity.toLowerCase() == "error") {
                    worstSeverity = property.severity;
                }
                else if (property.severity.toLowerCase() == "warning" && worstSeverity.toLowerCase() !== "error") {
                    worstSeverity = property.severity;
                }
                else if (property.severity.toLowerCase() == "no match" &&
                    (worstSeverity.toLowerCase() !== "error" && worstSeverity.toLowerCase() !== "warning")) {
                    worstSeverity = property.severity;
                }
            }
        }
    }

    return worstSeverity;
}

ComparisonReviewManager.prototype.updateStatusOfCategory = function (accordionData) {
    var _this = this;

    var groupId = accordionData["groupId"];
    var groupContainer = "#" + this.ComparisonCheckManager["results"][groupId]["componentClass"] + "_" + this.MainReviewTableContainer;
    var dataGrid = $(groupContainer).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            data: {
                'groupid': groupId,
                'ActionToPerform': "acceptComparisonCategory",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var results = JSON.parse(msg);
                for (var groupId in results) {
                    _this.ComparisonCheckManager["results"][groupId].categoryStatus = "ACCEPTED"

                    var acceptedComponents = results[groupId];

                    for (var componentId in acceptedComponents) {

                        var originalComponent = _this.GetCheckComponent(groupId, componentId);

                        var changedComponent = acceptedComponents[componentId]["component"];

                        originalComponent.accepted = changedComponent["accepted"];
                        originalComponent.status = changedComponent["status"];

                        for (var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["accepted"] = changedProperty["accepted"];
                        }

                        var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                        model.getCurrentReviewTable().UpdateGridData(componentId, tableContainer, originalComponent.status, true);

                        if (changedComponent["sourceANodeId"] !== null) {
                            var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
                            sourceAViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, true);
                        }
                        if (changedComponent["sourceBNodeId"] !== null) {
                            var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
                            sourceBViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, false);
                        }
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
            async: true,
            data: {
                'selectedGroupIdsVsResultsIds': JSON.stringify(selectedGroupIdsVsResultsIds),
                'ActionToPerform': "unAcceptComparisonComponent",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = JSON.parse(msg);

                for (var groupId in results) {

                    var acceptedComponents = results[groupId];

                    for (var componentId in acceptedComponents) {
                        var originalComponent = _this.GetCheckComponent(groupId, componentId);
                        var changedComponent = acceptedComponents[componentId]["component"];

                        originalComponent.accepted = changedComponent["accepted"];
                        originalComponent.status = changedComponent.status;

                        var isPropertyTransposed = false;

                        for (var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["accepted"] = changedProperty["accepted"];

                            if (orginalProperty["accepted"] == "false" && orginalProperty["transpose"] == null) {
                                orginalProperty.severity = changedProperty.severity;
                            }
                        }

                        var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                        model.getCurrentReviewTable().UpdateGridData(componentId, tableContainer, originalComponent.status, true);

                        if (changedComponent["sourceANodeId"] !== null) {
                            var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
                            sourceAViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, true);
                        }
                        if (changedComponent["sourceBNodeId"] !== null) {
                            var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
                            sourceBViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, false);
                        }
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
            data: {
                'componentid': componentId,
                'ActionToPerform': "unAcceptComparisonProperty",
                'propertyIds': JSON.stringify(selectedPropertiesKey),
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = JSON.parse(msg);;

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);
                checkResultComponent.accepted = results[componentId].accepted;

                var properties = checkResultComponent["properties"];
                var isPropertyTransposed = false;
                var isPropertyAccepted = false;

                for (var i = 0; i < properties.length; i++) {

                    var property = properties[i];

                    property.accepted = results[componentId]["properties"][i].accepted;

                    if (property.accepted == "false" && property.transpose == null) {

                        property["severity"] = results[componentId]["properties"][i].severity;
                        model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), property)

                    }
                }

                checkResultComponent.status = results[componentId]["status"];

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);

                if (results[componentId]["sourceANodeId"] !== null) {
                    var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
                    sourceAViewerInterface.ChangeComponentColorOnStatusChange(checkResultComponent, true);
                }
                if (results[componentId]["sourceBNodeId"] !== null) {
                    var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
                    sourceBViewerInterface.ChangeComponentColorOnStatusChange(checkResultComponent, false);
                }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.UnAcceptCategory = function (accordionData) {
    var _this = this;

    var groupId = accordionData["groupId"];
    var groupContainer = "#" + this.ComparisonCheckManager["results"][groupId]["componentClass"] + "_" + this.MainReviewTableContainer;
    var dataGrid = $(groupContainer).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    try {
        $.ajax({
            url: 'PHP/Accept.php',
            type: "POST",
            async: true,
            data: {
                'groupid': groupId,
                'ActionToPerform': "unAcceptComparisonCategory",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var results = JSON.parse(msg);;

                for (var groupId in results) {

                    _this.ComparisonCheckManager["results"][groupId].categoryStatus = "UNACCEPTED"

                    var acceptedComponents = results[groupId];

                    for (var componentId in acceptedComponents) {
                        var originalComponent = _this.GetCheckComponent(groupId, componentId);
                        var changedComponent = acceptedComponents[componentId]["component"];

                        originalComponent.accepted = changedComponent["accepted"];
                        originalComponent.status = changedComponent.status;

                        for (var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["accepted"] = changedProperty["accepted"];

                            if (orginalProperty["accepted"] == "false" && orginalProperty["transpose"] == null) {
                                orginalProperty.severity = changedProperty.severity;
                            }
                        }

                        var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                        model.getCurrentReviewTable().UpdateGridData(componentId, tableContainer, originalComponent.status, true);

                        if (changedComponent["sourceANodeId"] !== null) {
                            var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
                            sourceAViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, true);
                        }
                        if (changedComponent["sourceBNodeId"] !== null) {
                            var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
                            sourceBViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, false);
                        }
                    }
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

ComparisonReviewManager.prototype.GetSheetName = function (component, viewerContainerId) {
    var sheetName;

    if (viewerContainerId == Comparison.ViewerAContainer) {
        sheetName = sourceAComparisonHierarchy[component.sourceAId].MainClass;
    }
    else if (viewerContainerId == Comparison.ViewerBContainer) {
        sheetName = sourceBComparisonHierarchy[component.sourceBId].MainClass;
    }
    else if (viewerContainerId == Comparison.ViewerCContainer) {
        sheetName = sourceCComparisonHierarchy[component.sourceCId].MainClass;
    }
    else if (viewerContainerId == Comparison.ViewerDContainer) {
        sheetName = sourceDComparisonHierarchy[component.sourceDId].MainClass;
    }

    return sheetName;
}

ComparisonReviewManager.prototype.GetMainClassOfUndefinedComponent = function (groupName, nodeId, isSourceA) {
    if (groupName !== "undefined") {
        var result = groupName.split('-');
        if (isSourceA) {
            MainClassName = result[0];
        }
        else {
            MainClassName = result[1];
        }
    }
    else {
        var souceCompponents;
        if (isSourceA) {
            souceCompponents = this.SourceAComponents;
        }
        else {
            souceCompponents = this.SourceAComponents;
        }

        this.GetSourceComponentFromNodeId(souceCompponents, nodeId);
    }

}

ComparisonReviewManager.prototype.GetSourceComponentFromNodeId = function (sourceComponents, nodeId) {
    for (var i = 0; i < sourceComponents.length; i++) {

    }
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

                for (var i = 0; i < properties.length; i++) {

                    var orginalProperty = properties[i];

                    orginalProperty.transpose = results[componentId]["properties"][i].transpose;

                    if (orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value") {

                        if (orginalProperty.transpose !== null) {

                            orginalProperty.severity = "OK(T)";
                            model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), orginalProperty)
                        }
                    }
                }

                checkResultComponent.status = results[componentId]["status"];

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);

                if (results[componentId]["sourceANodeId"] !== null) {
                    var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
                    sourceAViewerInterface.ChangeComponentColorOnStatusChange(checkResultComponent, true);
                }
                if (results[componentId]["sourceBNodeId"] !== null) {
                    var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
                    sourceBViewerInterface.ChangeComponentColorOnStatusChange(checkResultComponent, false);
                }
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestorePropertyTranspose = function (selectedPropertiesKey, componentId, groupId) {
    var _this = this;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            data: {
                'componentid': componentId,
                'transposeType': 'restoreProperty',
                'propertyIds': JSON.stringify(selectedPropertiesKey),
                'transposeLevel': 'propertyLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = JSON.parse(msg);;

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);

                var properties = checkResultComponent["properties"];
                var isPropertyAccepted = false;
                var isPropertyTransposed = false;

                for (var i = 0; i < properties.length; i++) {

                    var orginalProperty = properties[i];
                    var changedProperty = results[componentId]["properties"][i];

                    orginalProperty.transpose = changedProperty.transpose;

                    if (orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value" && orginalProperty.accepted == "false") {
                        orginalProperty.severity = changedProperty.severity;
                        model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), orginalProperty);
                    }

                }

                checkResultComponent.status = results[componentId]["status"];

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);

                if (results[componentId]["sourceANodeId"] !== null) {
                    var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
                    sourceAViewerInterface.ChangeComponentColorOnStatusChange(checkResultComponent, true);
                }
                if (results[componentId]["sourceBNodeId"] !== null) {
                    var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
                    sourceBViewerInterface.ChangeComponentColorOnStatusChange(checkResultComponent, false);
                }
            }

        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestoreComponentTranspose = function (selectedGroupIdsVsResultIds) {
    var _this = this;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            data: {
                'selectedGroupIdsVsResultsIds': JSON.stringify(selectedGroupIdsVsResultIds),
                'transposeType': 'restoreComponent',
                'transposeLevel': 'componentLevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {

                var results = JSON.parse(msg);;

                for (var groupId in results) {

                    var transpoedComponents = results[groupId];

                    for (var componentId in transpoedComponents) {

                        var originalComponent = _this.GetCheckComponent(groupId, componentId);

                        var changedComponent = transpoedComponents[componentId]["component"];

                        originalComponent.transpose = changedComponent["transpose"];
                        originalComponent.status = "OK";

                        var isPropertyAccepted = false;
                        var isPropertyTransposed = false;

                        for (var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["transpose"] = changedProperty["transpose"];
                            if (orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value") {

                                orginalProperty["severity"] = changedProperty["severity"];
                            }
                        }


                        originalComponent.status = changedComponent.status;

                        var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                        model.getCurrentReviewTable().UpdateGridData(componentId, tableContainer, originalComponent.status, true);

                        if (changedComponent["sourceANodeId"] !== null) {
                            var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
                            sourceAViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, true);
                        }
                        if (changedComponent["sourceBNodeId"] !== null) {
                            var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
                            sourceBViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, false);
                        }

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

                for (var groupId in results) {

                    var transpoedComponents = results[groupId];

                    for (var componentId in transpoedComponents) {

                        var originalComponent = _this.GetCheckComponent(groupId, componentId);

                        var changedComponent = transpoedComponents[componentId]["component"];

                        originalComponent.transpose = changedComponent["transpose"];
                        originalComponent.status = "OK";

                        var isPropertyAccepted = false;
                        var isPropertyTransposed = false;

                        for (var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["transpose"] = changedProperty["transpose"];
                            if (orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value") {

                                if (orginalProperty.transpose !== null) {
                                    orginalProperty.severity = "OK(T)";

                                }
                            }
                        }


                        originalComponent.status = changedComponent["status"];

                        var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                        model.getCurrentReviewTable().UpdateGridData(componentId, tableContainer, originalComponent.status, true);

                        if (changedComponent["sourceANodeId"] !== null) {
                            var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
                            sourceAViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, true);
                        }
                        if (changedComponent["sourceBNodeId"] !== null) {
                            var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
                            sourceBViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, false);
                        }

                    }
                }
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestoreCategoryTranspose = function (accordionData) {
    var _this = this;

    var groupId = accordionData["groupId"];
    var groupContainer = "#" + this.ComparisonCheckManager["results"][groupId]["componentClass"] + "_" + this.MainReviewTableContainer;
    var dataGrid = $(groupContainer).dxDataGrid("instance");
    var rows = dataGrid.getVisibleRows();

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    try {
        $.ajax({
            url: 'PHP/TransposeProperties.php',
            type: "POST",
            async: true,
            data: { 'groupid': groupId, 'transposeType': 'restoreCategory', 'transposeLevel': 'categorylevel', 'ProjectName': projectinfo.projectname, 'CheckName': checkinfo.checkname },
            success: function (msg) {
                var results = JSON.parse(msg);;

                for (var groupId in results) {

                    _this.ComparisonCheckManager["results"][groupId].categoryStatus = "UNACCEPTED";

                    var transpoedComponents = results[groupId];

                    for (var componentId in transpoedComponents) {

                        var originalComponent = _this.GetCheckComponent(groupId, componentId);

                        var changedComponent = transpoedComponents[componentId]["component"];

                        originalComponent.transpose = changedComponent["transpose"];
                        originalComponent.status = "OK";

                        var isPropertyAccepted = false;
                        var isPropertyTransposed = false;

                        for (var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["transpose"] = changedProperty["transpose"];
                            if (orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value") {
                                if (orginalProperty.transpose !== null) {
                                    orginalProperty.severity = "OK(T)";
                                }
                            }
                        }


                        originalComponent.status = changedComponent["status"];

                        var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                        model.getCurrentReviewTable().UpdateGridData(componentId, tableContainer, originalComponent.status, true);

                        if (changedComponent["sourceANodeId"] !== null) {
                            var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
                            sourceAViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, true);
                        }
                        if (changedComponent["sourceBNodeId"] !== null) {
                            var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
                            sourceBViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, false);
                        }

                    }
                }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.TransposeCategory = function (key, accordionData) {
    var _this = this;

    var groupId = accordionData["groupId"];
    var groupContainer = "#" + this.ComparisonCheckManager["results"][groupId]["componentClass"] + "_" + this.MainReviewTableContainer;
    var dataGrid = $(groupContainer).dxDataGrid("instance");
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

                var results = JSON.parse(msg);

                for (var groupId in results) {

                    _this.ComparisonCheckManager["results"][groupId].categoryStatus = "OK(T)";

                    var transpoedComponents = results[groupId];

                    for (var componentId in transpoedComponents) {

                        var originalComponent = _this.GetCheckComponent(groupId, componentId);

                        var changedComponent = transpoedComponents[componentId]["component"];

                        originalComponent.transpose = changedComponent["transpose"];

                        var isPropertyAccepted = false;
                        var isPropertyTransposed = false;

                        for (var propertyId in originalComponent.properties) {

                            var orginalProperty = originalComponent.properties[propertyId];
                            var changedProperty = changedComponent["properties"][propertyId];
                            orginalProperty["transpose"] = changedProperty["transpose"];
                            if (orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value") {
                                if (orginalProperty.transpose !== null) {
                                    orginalProperty.severity = "OK(T)";
                                }
                            }
                        }

                        originalComponent.status = changedComponent["status"];

                        var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                        model.getCurrentReviewTable().UpdateGridData(componentId, tableContainer, originalComponent.status, true);

                        if (changedComponent["sourceANodeId"] !== null) {
                            var sourceAViewerInterface = model.checks["comparison"]["sourceAViewer"];
                            sourceAViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, true);
                        }
                        if (changedComponent["sourceBNodeId"] !== null) {
                            var sourceBViewerInterface = model.checks["comparison"]["sourceBViewer"];
                            sourceBViewerInterface.ChangeComponentColorOnStatusChange(changedComponent, false);
                        }

                    }
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

ComparisonReviewManager.prototype.GetcheckProperty = function (componentId, groupId, propertyId) {
    var component = this.GetCheckComponent(groupId, componentId);
    var properties = component.properties;
    return properties[propertyId];
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
        if (this.SourceCNodeIdvsCheckComponent !== undefined &&
            selectedNode in this.SourceCNodeIdvsCheckComponent) {
            checkComponentData = this.SourceCNodeIdvsCheckComponent[selectedNode];
        }
    }
    else if (viewerId === Comparison.ViewerDContainer) {
        if (this.SourceDNodeIdvsCheckComponent !== undefined &&
            selectedNode in this.SourceDNodeIdvsCheckComponent) {
            checkComponentData = this.SourceDNodeIdvsCheckComponent[selectedNode];
        }

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
    else if (viewerId === Comparison.ViewerCContainer) {
        return this.SourceCNodeIdvsCheckComponent;
    }
    else if (viewerId === Comparison.ViewerDContainer) {
        return this.SourceDNodeIdvsCheckComponent;
    }

    return undefined;
}

ComparisonReviewManager.prototype.GetComponentData = function (checkComponentData, isSourceA) {

    var ComponentData;
    if (isSourceA) {
        var sourceAId = Number(checkComponentData.sourceAId);
        ComponentData = model.checks[model.currentCheck]["SourceAcomponentIdVsComponentData"][sourceAId];
    }
    else {
        var sourceBId = Number(checkComponentData.sourceBId);
        ComponentData = model.checks[model.currentCheck]["SourceBcomponentIdVsComponentData"][sourceBId];
    }

    var sourceComponentData = {};

    sourceComponentData["Status"] = checkComponentData.status;
    sourceComponentData["accepted"] = checkComponentData.accepted;
    sourceComponentData["transpose"] = checkComponentData.transpose;
    sourceComponentData["NodeId"] = ComponentData.nodeid;
    sourceComponentData["MainClass"] = ComponentData.mainclass;

    return sourceComponentData;
}