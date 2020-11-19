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

    let projectInfo = xCheckStudio.Util.getProjectInfo();
    let checkspaceInfo = xCheckStudio.Util.getCheckspaceInfo();
    let checkspacePath = "../Projects/" + projectInfo.projectname + "/CheckSpaces/" + checkspaceInfo.checkname;

    // Source A
    if (this.SourceAViewerData &&
        this.SourceAViewerData["endPointUri"] !== undefined) {

        let pathToDataset = checkspacePath + "/SourceA/" + this.SourceAViewerData["endPointUri"];
        if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(this.SourceAViewerData["source"]))) {
            var viewerInterface = new Review3DViewerInterface(["compare1", pathToDataset],
                this.SourceAComponentIdVsComponentData,
                this.SourceANodeIdVsComponentData,
                this.SourceAViewerData["source"],
                "a");
            viewerInterface.NodeIdStatusData = this.SourceANodeIdVsStatus;
            viewerInterface.setupViewer(550, 280);

            model.checks["comparison"]["sourceAViewer"] = viewerInterface;
        }
        else if (xCheckStudio.Util.isSourceVisio(xCheckStudio.Util.getFileExtension(this.SourceAViewerData["source"]))) {

            var viewerInterface = new ReviewVisioViewerInterface(["compare1", pathToDataset],
                this.SourceAComponentIdVsComponentData,
                this.SourceANodeIdVsComponentData,
                this.SourceAViewerData["source"]);
            viewerInterface.NodeIdStatusData = this.SourceANodeIdVsStatus;
            viewerInterface.setupViewer("a", false);

            model.checks["comparison"]["sourceAViewer"] = viewerInterface;
        }
    }
    else if (this.SourceAComponents !== undefined) {
        var viewerInterface = new Review1DViewerInterface("a", this.SourceAComponents);
        model.checks["comparison"]["sourceAViewer"] = viewerInterface;
    }

    // Source B
    if (this.SourceBViewerData && this.SourceBViewerData["endPointUri"] !== undefined) {

        let pathToDataset = checkspacePath + "/SourceB/" + this.SourceBViewerData["endPointUri"];
        if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(this.SourceBViewerData["source"]))) {           
            var viewerInterface = new Review3DViewerInterface(["compare2", pathToDataset],
                this.SourceBComponentIdVsComponentData,
                this.SourceBNodeIdVsComponentData,
                this.SourceBViewerData["source"],
                "b");
            viewerInterface.NodeIdStatusData = this.SourceBNodeIdVsStatus;
            viewerInterface.setupViewer(550, 280);

            model.checks["comparison"]["sourceBViewer"] = viewerInterface;
        }
        else if (xCheckStudio.Util.isSourceVisio(xCheckStudio.Util.getFileExtension(this.SourceBViewerData["source"]))) {          
            var viewerInterface = new ReviewVisioViewerInterface(["compare2", pathToDataset],
                this.SourceBComponentIdVsComponentData,
                this.SourceBNodeIdVsComponentData,
                this.SourceBViewerData["source"]);
            viewerInterface.NodeIdStatusData = this.SourceBNodeIdVsStatus;
            viewerInterface.setupViewer("b", false);

            model.checks["comparison"]["sourceBViewer"] = viewerInterface;
        }
    }
    else if (this.SourceBComponents !== undefined) {
        var viewerInterface = new Review1DViewerInterface("b", this.SourceBComponents);
        model.checks["comparison"]["sourceBViewer"] = viewerInterface;
    }


    // Source C
    if (this.SourceCViewerData && this.SourceCViewerData["endPointUri"] !== undefined) {

        let pathToDataset = checkspacePath + "/SourceC/" + this.SourceCViewerData["endPointUri"];
        if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(this.SourceCViewerData["source"]))) {

            var viewerInterface = new Review3DViewerInterface(["compare3", pathToDataset],
                this.SourceCComponentIdVsComponentData,
                this.SourceCNodeIdVsComponentData,
                this.SourceCViewerData["source"],
                "c");
            viewerInterface.NodeIdStatusData = this.SourceCNodeIdVsStatus;
            viewerInterface.setupViewer(550, 280);

            model.checks["comparison"]["sourceCViewer"] = viewerInterface;
        }
        else if (xCheckStudio.Util.isSourceVisio(xCheckStudio.Util.getFileExtension(this.SourceCViewerData["source"]))) {
           
            var viewerInterface = new ReviewVisioViewerInterface(["compare3", pathToDataset],
                this.SourceCComponentIdVsComponentData,
                this.SourceCNodeIdVsComponentData,
                this.SourceCViewerData["source"]);
            viewerInterface.NodeIdStatusData = this.SourceCNodeIdVsStatus;
            viewerInterface.setupViewer("c", false);

            model.checks["comparison"]["sourceCViewer"] = viewerInterface;
        }
    }
    else if (this.SourceCComponents !== undefined) {
        var viewerInterface = new Review1DViewerInterface("c", this.SourceCComponents);
        model.checks["comparison"]["sourceCViewer"] = viewerInterface;
    }

    // Source D
    if (this.SourceDViewerData && this.SourceDViewerData["endPointUri"] !== undefined) {

        let pathToDataset = checkspacePath + "/SourceD/" + this.SourceDViewerData["endPointUri"];
        if (xCheckStudio.Util.isSource3D(xCheckStudio.Util.getFileExtension(this.SourceDViewerData["source"]))) {
            var viewerInterface = new Review3DViewerInterface(["compare4", pathToDataset],
                this.SourceDComponentIdVsComponentData,
                this.SourceDNodeIdVsComponentData,
                this.SourceDViewerData["source"],
                "d");
            viewerInterface.NodeIdStatusData = this.SourceDNodeIdVsStatus;
            viewerInterface.setupViewer(550, 280);

            model.checks["comparison"]["sourceDViewer"] = viewerInterface;
        }
        else if (xCheckStudio.Util.isSourceVisio(xCheckStudio.Util.getFileExtension(this.SourceDViewerData["source"]))) {
            var viewerInterface = new ReviewVisioViewerInterface(["compare4", pathToDataset],
                this.SourceDComponentIdVsComponentData,
                this.SourceDNodeIdVsComponentData,
                this.SourceDViewerData["source"]);
            viewerInterface.NodeIdStatusData = this.SourceDNodeIdVsStatus;
            viewerInterface.setupViewer("d", false);

            model.checks["comparison"]["sourceDViewer"] = viewerInterface;
        }
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
            "status": component.status
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
            "status": component.status
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
            "status": component.status
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
            "status": component.status
        };
    }
}

ComparisonReviewManager.prototype.OnCheckComponentRowClicked = function (rowData, containerDiv) {

    // populate property table
    model.checks["comparison"]["detailedInfoTable"].populateDetailedReviewTable(rowData, containerDiv.replace("#", ""));   

    if (model.checks["comparison"]["sourceAViewer"]) {

        // var sheetName = result[0];
        let sheetName = this.GetSheetName(rowData, Comparison.ViewerAContainer);

        model.checks["comparison"]["sourceAViewer"].highlightComponent(Comparison.ViewerAContainer,
            sheetName,
            rowData,
            rowData.SourceANodeId);
    }
    if (model.checks["comparison"]["sourceBViewer"]) {
        // var sheetName = result[1];
        let sheetName = this.GetSheetName(rowData, Comparison.ViewerBContainer);

        model.checks["comparison"]["sourceBViewer"].highlightComponent(Comparison.ViewerBContainer,
            sheetName,
            rowData,
            rowData.SourceBNodeId);
    }
    if (model.checks["comparison"]["sourceCViewer"]) {
        // var sheetName = result[2];
        let sheetName = this.GetSheetName(rowData, Comparison.ViewerCContainer);

        model.checks["comparison"]["sourceCViewer"].highlightComponent(Comparison.ViewerCContainer,
            sheetName,
            rowData,
            rowData.
                SourceCNodeId);
    }
    if (model.checks["comparison"]["sourceDViewer"]) {
        // var sheetName = result[3];
        let sheetName = this.GetSheetName(rowData, Comparison.ViewerDContainer);

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
                var results = xCheckStudio.Util.tryJsonParse(msg);
                if (results === null) {
                    return;
                }

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
                // refresh detailed info table
                model.getCurrentDetailedInfoTable().Refresh();

                checkResultComponent.status = results[componentId]["status"];

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);
                model.checks[model.currentCheck]["reviewTable"].Refresh([tableContainer]);

                _this.UpdateInViewerOnStatusChange(checkResultComponent); 
                
                // call components accepted
                _this.OnComponentsAccepted([checkResultComponent], "property");
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
                var results = xCheckStudio.Util.tryJsonParse(msg);
                if (results === null) {
                    return;
                }

                let tableIds = [];
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
                        if (tableIds.indexOf(tableContainer) === -1) {
                            tableIds.push(tableContainer);
                        }

                        _this.UpdateInViewerOnStatusChange(changedComponent);                       
                    }
                }

                // refresh comparison review tables
                model.getCurrentReviewTable().Refresh(tableIds);                

                // call components accepted
                _this.OnComponentsAccepted(Object.values(results), "component");
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.UpdateInViewerOnStatusChange = function (
  changedComponent
) {
  var srcs = {
    a: {
      nameProp: "sourceAName",
      mainClassProp: "sourceAMainClass",
      viewerProp: "sourceAViewer",
    },
    b: {
      nameProp: "sourceBName",
      mainClassProp: "sourceBMainClass",
      viewerProp: "sourceBViewer",
    },
    c: {
      nameProp: "sourceCName",
      mainClassProp: "sourceCMainClass",
      viewerProp: "sourceCViewer",
    },
    d: {
      nameProp: "sourceDName",
      mainClassProp: "sourceDMainClass",
      viewerProp: "sourceDViewer",
    },
  };

  for (var srcId in srcs) {
    if (changedComponent[srcs[srcId].nameProp]) {
      var viewerInterface = model.checks["comparison"][srcs[srcId].viewerProp];
      viewerInterface.ChangeComponentColorOnStatusChange(
        changedComponent,
        srcId,
        changedComponent[srcs[srcId].mainClassProp]
      );
    }
  }
};

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
                var results = xCheckStudio.Util.tryJsonParse(msg);
                if (results === null) {
                    return;
                }

                let tableIds = [];
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
                        if (tableIds.indexOf(tableContainer) === -1) {
                            tableIds.push(tableContainer);
                        }

                        _this.UpdateInViewerOnStatusChange(changedComponent); 
                    }

                    // call components accepted
                   _this.OnComponentsAccepted(Object.values(acceptedComponents), "group");
                }

                // refresh comparison review tables
                model.getCurrentReviewTable().Refresh(tableIds);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.OnComponentsAccepted = function (components, source) {
}

ComparisonReviewManager.prototype.OnComponentsUnAccepted = function (components) {
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
                var results = xCheckStudio.Util.tryJsonParse(msg);
                if (results === null) {
                    return;
                }

                let  tableIds = [];
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
                        if (tableIds.indexOf(tableContainer) === -1) {
                            tableIds.push(tableContainer);
                        }

                        _this.UpdateInViewerOnStatusChange(changedComponent);
                    }
                }

                // refresh comparison review tables
                model.getCurrentReviewTable().Refresh(tableIds);
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
                var results = xCheckStudio.Util.tryJsonParse(msg);
                if (results === null) {
                    return;
                }
                let resultComponent = results[componentId];
                let resultProperties = results[componentId]["properties"];

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);
                checkResultComponent.accepted = resultComponent.accepted;

                var properties = checkResultComponent["properties"];
                // var isPropertyTransposed = false;
                // var isPropertyAccepted = false;

                for (var i = 0; i < properties.length; i++) {
                    var property = properties[i];
                   
                    if (property.accepted == "true" && 
                        resultProperties[i].accepted == "false" &&
                        property.transpose == null) {
                        property.accepted = resultProperties[i].accepted;

                        property["severity"] = resultProperties[i].severity;
                        model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), property);
                    }
                }
                model.getCurrentDetailedInfoTable().Refresh();

                checkResultComponent.status = resultComponent["status"];

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);                    
                model.checks[model.currentCheck]["reviewTable"].Refresh([tableContainer]);

                _this.UpdateInViewerOnStatusChange(checkResultComponent);
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
                var results = xCheckStudio.Util.tryJsonParse(msg);
                if (results === null) {
                    return;
                }

                let tableIds = [];
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
                        if (tableIds.indexOf(tableContainer) === -1) {
                            tableIds.push(tableContainer);
                        }

                        _this.UpdateInViewerOnStatusChange(changedComponent);
                    }
                }

                model.getCurrentReviewTable().Refresh(tableIds);
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
    var sheetName = null;

    if (viewerContainerId == Comparison.ViewerAContainer &&
        component.SourceAId in sourceAComparisonHierarchy) {
        sheetName = sourceAComparisonHierarchy[component.SourceAId].MainClass;
    }
    else if (viewerContainerId == Comparison.ViewerBContainer &&
        component.SourceBId in sourceBComparisonHierarchy) {
        sheetName = sourceBComparisonHierarchy[component.SourceBId].MainClass;
    }
    else if (viewerContainerId == Comparison.ViewerCContainer &&
        component.SourceCId in sourceCComparisonHierarchy) {
        sheetName = sourceCComparisonHierarchy[component.SourceCId].MainClass;
    }
    else if (viewerContainerId == Comparison.ViewerDContainer &&
        component.SourceDId in sourceDComparisonHierarchy) {
        sheetName = sourceDComparisonHierarchy[component.SourceDId].MainClass;
    }

    return sheetName;
}

ComparisonReviewManager.prototype.GetSourceComponentFromNodeId = function (sourceComponents, nodeId) {
    for (var i = 0; i < sourceComponents.length; i++) {

    }
}

ComparisonReviewManager.prototype.TransposeProperty = function (
    key, 
    selectedPropertiesKey, 
    componentId, 
    groupId, 
    sourceCompIds,
    sourceProps) {

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
                'CheckName': checkinfo.checkname,
                "sourceCompIds" : JSON.stringify(sourceCompIds),
                "sourceProps" : JSON.stringify(sourceProps),
            },
            success: function (msg) {
                var results = xCheckStudio.Util.tryJsonParse(msg);
                if (results === null) {
                    return;
                }

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);
                var properties = checkResultComponent["properties"];
                for (var i = 0; i < properties.length; i++) {
                    var orginalProperty = properties[i];

                    orginalProperty.transpose = results[componentId]["properties"][i].transpose;

                    if (orginalProperty.severity !== "OK" && orginalProperty.severity !== "No Value") {

                        if (orginalProperty.transpose !== null) {

                            // if empty value is transposed, then show status as "No Value(T)"
                            var transposeFunc = orginalProperty.transpose.toLowerCase();
                            if (transposeFunc === "fromdatasource1" &&
                                (!orginalProperty.sourceAValue || orginalProperty.sourceAValue === "")) {
                                orginalProperty.severity = "No Value(T)";
                            }
                            else if (transposeFunc === "fromdatasource2" &&
                                (!orginalProperty.sourceBValue || orginalProperty.sourceBValue === "")) {
                                orginalProperty.severity = "No Value(T)";
                            }
                            else if (transposeFunc === "fromdatasource3" &&
                                (!orginalProperty.sourceCValue || orginalProperty.sourceCValue === "")) {
                                orginalProperty.severity = "No Value(T)";
                            }
                            else if (transposeFunc === "fromdatasource4" &&
                                (!orginalProperty.sourceDValue || orginalProperty.sourceDValue === "")) {
                                orginalProperty.severity = "No Value(T)";
                            }
                            else {
                                orginalProperty.severity = "OK(T)";
                            }                            

                            model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), orginalProperty)
                        }
                    }
                }
                model.getCurrentDetailedInfoTable().Refresh();

                checkResultComponent.status = results[componentId]["status"];

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);
                model.checks[model.currentCheck]["reviewTable"].Refresh([tableContainer]);

                _this.UpdateInViewerOnStatusChange(checkResultComponent);

                // Update original dataset properties               
                if ("a" in sourceCompIds) {
                    let compId = sourceCompIds['a'];

                    let allCompsA = null;
                    if ("allComponents" in checkResults &&
                        "a" in checkResults.allComponents) {
                        allCompsA = JSON.parse(checkResults.allComponents["a"]);
                    }

                    for (let i = 0; i < checkResults.sourceAComponents.length; i++) {
                        let comp = checkResults.sourceAComponents[i];
                        if (compId != comp.id) {
                            continue;
                        }

                        for (let j = 0; j < comp.properties.length; j++) {
                            let prop = comp.properties[j];
                            for (let k = 0; k < sourceProps.length; k++) {
                                let transposedProp = sourceProps[k];
                                if (transposedProp["a"] !== prop.name) {
                                    continue;
                                }

                                prop.value = transposedProp["transposedValue"];
                            }
                        }

                        // update all components                       
                        if (allCompsA &&
                            comp.nodeid in allCompsA) {
                            let props = allCompsA[comp.nodeid].properties;
                            for (let propIndex = 0; propIndex < props.length; propIndex++) {

                                for (let k = 0; k < sourceProps.length; k++) {
                                    let transposedProp = sourceProps[k];
                                    if (props[propIndex].Name === transposedProp["a"]) {
                                        props[propIndex].Value = transposedProp["transposedValue"];
                                    }
                                }
                            }
                        }
                    }

                    // update all components
                    if (allCompsA) {
                        checkResults.allComponents["a"] = JSON.stringify(allCompsA);
                    }
                }
                if ("b" in sourceCompIds) {
                    let compId = sourceCompIds['b'];

                    let allCompsB;
                    if ("allComponents" in checkResults &&
                        "b" in checkResults.allComponents) {
                        allCompsB = JSON.parse(checkResults.allComponents["b"]);
                    }

                    for (var i = 0; i < checkResults.sourceBComponents.length; i++) {
                        var comp = checkResults.sourceBComponents[i];
                        if (compId != comp.id) {
                            continue;
                        }

                        for (let j = 0; j < comp.properties.length; j++) {
                            let prop = comp.properties[j];
                            for (let k = 0; k < sourceProps.length; k++) {
                                let transposedProp = sourceProps[k];
                                if (transposedProp["b"] !== prop.name) {
                                    continue;
                                }

                                prop.value = transposedProp["transposedValue"];
                            }
                        }

                        // update all components                       
                        if (allCompsB &&
                            comp.nodeid in allCompsB) {
                            let props = allCompsB[comp.nodeid].properties;
                            for (let propIndex = 0; propIndex < props.length; propIndex++) {

                                for (let k = 0; k < sourceProps.length; k++) {
                                    let transposedProp = sourceProps[k];
                                    if (props[propIndex].Name === transposedProp["b"]) {
                                        props[propIndex].Value = transposedProp["transposedValue"];
                                    }
                                }
                            }
                        }
                    }

                    // update all components
                    if (allCompsB) {
                        checkResults.allComponents["b"] = JSON.stringify(allCompsB);
                    }
                }
                if ("c" in sourceCompIds) {
                    let compId = sourceCompIds['c'];

                    let allCompsC;
                    if ("allComponents" in checkResults &&
                        "c" in checkResults.allComponents) {
                        allCompsC = JSON.parse(checkResults.allComponents["c"]);
                    }

                    for (var i = 0; i < checkResults.sourceCComponents.length; i++) {
                        var comp = checkResults.sourceCComponents[i];
                        if (compId != comp.id) {
                            continue;
                        }

                        for (let j = 0; j < comp.properties.length; j++) {
                            let prop = comp.properties[j];
                            for (let k = 0; k < sourceProps.length; k++) {
                                let transposedProp = sourceProps[k];
                                if (transposedProp["c"] !== prop.name) {
                                    continue;
                                }

                                prop.value = transposedProp["transposedValue"];
                            }
                        }

                        // update all components                       
                        if (allCompsC &&
                            comp.nodeid in allCompsC) {
                            let props = allCompsC[comp.nodeid].properties;
                            for (let propIndex = 0; propIndex < props.length; propIndex++) {

                                for (let k = 0; k < sourceProps.length; k++) {
                                    let transposedProp = sourceProps[k];
                                    if (props[propIndex].Name === transposedProp["c"]) {
                                        props[propIndex].Value = transposedProp["transposedValue"];
                                    }
                                }
                            }
                        }
                    }

                    // update all components
                    if (allCompsC) {
                        checkResults.allComponents["c"] = JSON.stringify(allCompsC);
                    }
                }
                if ("d" in sourceCompIds) {
                    let compId = sourceCompIds['d'];

                    let allCompsD;
                    if ("allComponents" in checkResults &&
                        "d" in checkResults.allComponents) {
                        allCompsD = JSON.parse(checkResults.allComponents["d"]);
                    }

                    for (var i = 0; i < checkResults.sourceDComponents.length; i++) {
                        var comp = checkResults.sourceDComponents[i];
                        if (compId != comp.id) {
                            continue;
                        }

                        for (let j = 0; j < comp.properties.length; j++) {
                            let prop = comp.properties[j];
                            for (let k = 0; k < sourceProps.length; k++) {
                                let transposedProp = sourceProps[k];
                                if (transposedProp["d"] !== prop.name) {
                                    continue;
                                }

                                prop.value = transposedProp["transposedValue"];
                            }
                        }

                        // update all components                       
                        if (allCompsD &&
                            comp.nodeid in allCompsD) {
                            let props = allCompsD[comp.nodeid].properties;
                            for (let propIndex = 0; propIndex < props.length; propIndex++) {

                                for (let k = 0; k < sourceProps.length; k++) {
                                    let transposedProp = sourceProps[k];
                                    if (props[propIndex].Name === transposedProp["d"]) {
                                        props[propIndex].Value = transposedProp["transposedValue"];
                                    }
                                }
                            }
                        }
                    }

                    // update all components
                    if (allCompsD) {
                        checkResults.allComponents["d"] = JSON.stringify(allCompsD);
                    }
                }
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.RestorePropertyTranspose = function (
    selectedPropertiesKey, 
    componentId, 
    groupId, 
    sourceCompIds,
    sourceProps) {        
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
                'CheckName': checkinfo.checkname,
                "sourceCompIds" : JSON.stringify(sourceCompIds),
                "sourceProps" : JSON.stringify(sourceProps),
            },
            success: function (msg) {
                var results = xCheckStudio.Util.tryJsonParse(msg);
                if (results === null) {
                    return;
                }

                var checkResultComponent = _this.GetCheckComponent(groupId, componentId);

                var properties = checkResultComponent["properties"];
                // var isPropertyAccepted = false;
                // var isPropertyTransposed = false;

                for (var i = 0; i < properties.length; i++) {
                    var orginalProperty = properties[i];
                    var changedProperty = results[componentId]["properties"][i];                   

                    if (orginalProperty.transpose) {
                        orginalProperty.transpose = changedProperty.transpose;
                        orginalProperty.severity = changedProperty.severity;
                        model.getCurrentDetailedInfoTable().UpdateGridData(i.toString(), orginalProperty);
                    }
                }
                model.getCurrentDetailedInfoTable().Refresh();

                checkResultComponent.status = results[componentId]["status"];

                var tableContainer = model.getCurrentReviewTable().CheckTableIds[groupId];
                model.checks[model.currentCheck]["reviewTable"].UpdateGridData(componentId,
                    tableContainer,
                    checkResultComponent.status,
                    false);
                model.checks[model.currentCheck]["reviewTable"].Refresh([tableContainer]);

                _this.UpdateInViewerOnStatusChange(checkResultComponent);

                 // Update original dataset properties               
                if ("a" in sourceCompIds) {
                    let compId = sourceCompIds['a'];

                    let allCompsA;
                    if ("allComponents" in checkResults &&
                        "a" in checkResults.allComponents) {
                        allCompsA = JSON.parse(checkResults.allComponents["a"]);
                    }

                    for (let i = 0; i < checkResults.sourceAComponents.length; i++) {
                        let comp = checkResults.sourceAComponents[i];
                        if (compId != comp.id) {
                            continue;
                        }

                        for (let j = 0; j < comp.properties.length; j++) {
                            let prop = comp.properties[j];
                            for (let k = 0; k < sourceProps.length; k++) {
                                let transposedProp = sourceProps[k];
                                if (transposedProp["aName"] !== prop.name) {
                                    continue;
                                }

                                prop.value = transposedProp["aValue"];
                            }
                        }

                        // update all components                       
                        if (allCompsA &&
                            comp.nodeid in allCompsA) {
                            let props = allCompsA[comp.nodeid].properties;
                            for (let propIndex = 0; propIndex < props.length; propIndex++) {

                                for (let k = 0; k < sourceProps.length; k++) {
                                    let transposedProp = sourceProps[k];
                                    if (props[propIndex].Name === transposedProp["aName"]) {
                                        props[propIndex].Value = transposedProp["aValue"];
                                    }
                                }
                            }
                        }
                    }

                    // update all components
                    if (allCompsA) {
                        checkResults.allComponents["a"] = JSON.stringify(allCompsA);
                    }
                }
                if ("b" in sourceCompIds) {
                    let compId = sourceCompIds['b'];

                    let allCompsB;
                    if ("allComponents" in checkResults &&
                        "b" in checkResults.allComponents) {
                        allCompsB = JSON.parse(checkResults.allComponents["b"]);
                    }

                    for (var i = 0; i < checkResults.sourceBComponents.length; i++) {
                        var comp = checkResults.sourceBComponents[i];
                        if (compId != comp.id) {
                            continue;
                        }

                        for (let j = 0; j < comp.properties.length; j++) {
                            let prop = comp.properties[j];
                            for (let k = 0; k < sourceProps.length; k++) {
                                let transposedProp = sourceProps[k];
                                if (transposedProp["bName"] !== prop.name) {
                                    continue;
                                }

                                prop.value = transposedProp["bValue"];
                            }
                        }

                        // update all components                       
                        if (allCompsB &&
                            comp.nodeid in allCompsB) {
                            let props = allCompsB[comp.nodeid].properties;
                            for (let propIndex = 0; propIndex < props.length; propIndex++) {

                                for (let k = 0; k < sourceProps.length; k++) {
                                    let transposedProp = sourceProps[k];
                                    if (props[propIndex].Name === transposedProp["bName"]) {
                                        props[propIndex].Value = transposedProp["bValue"];
                                    }
                                }
                            }
                        }
                    }

                    // update all components
                    if (allCompsB) {
                        checkResults.allComponents["b"] = JSON.stringify(allCompsB);
                    }
                }
                if ("c" in sourceCompIds) {
                    let compId = sourceCompIds['c'];

                    let allCompsC;
                    if ("allComponents" in checkResults &&
                        "c" in checkResults.allComponents) {
                        allCompsC = JSON.parse(checkResults.allComponents["c"]);
                    }

                    for (var i = 0; i < checkResults.sourceCComponents.length; i++) {
                        var comp = checkResults.sourceCComponents[i];
                        if (compId != comp.id) {
                            continue;
                        }

                        for (let j = 0; j < comp.properties.length; j++) {
                            let prop = comp.properties[j];
                            for (let k = 0; k < sourceProps.length; k++) {
                                let transposedProp = sourceProps[k];
                                if (transposedProp["cName"] !== prop.name) {
                                    continue;
                                }

                                prop.value = transposedProp["cValue"];
                            }
                        }

                        // update all components                       
                        if (allCompsC &&
                            comp.nodeid in allCompsC) {
                            let props = allCompsC[comp.nodeid].properties;
                            for (let propIndex = 0; propIndex < props.length; propIndex++) {

                                for (let k = 0; k < sourceProps.length; k++) {
                                    let transposedProp = sourceProps[k];
                                    if (props[propIndex].Name === transposedProp["cName"]) {
                                        props[propIndex].Value = transposedProp["cValue"];
                                    }
                                }
                            }
                        }
                    }

                    // update all components
                    if (allCompsC) {
                        checkResults.allComponents["c"] = JSON.stringify(allCompsC);
                    }
                }
                if ("d" in sourceCompIds) {
                    let compId = sourceCompIds['d'];
                    
                    let allCompsD;
                    if ("allComponents" in checkResults &&
                        "d" in checkResults.allComponents) {
                        allCompsD = JSON.parse(checkResults.allComponents["d"]);
                    }

                    for (var i = 0; i < checkResults.sourceDComponents.length; i++) {
                        var comp = checkResults.sourceDComponents[i];
                        if (compId != comp.id) {
                            continue;
                        }

                        for (let j = 0; j < comp.properties.length; j++) {
                            let prop = comp.properties[j];
                            for (let k = 0; k < sourceProps.length; k++) {
                                let transposedProp = sourceProps[k];
                                if (transposedProp["dName"] !== prop.name) {
                                    continue;
                                }

                                prop.value = transposedProp["dValue"];
                            }
                        }

                        // update all components                       
                        if (allCompsD &&
                            comp.nodeid in allCompsD) {
                            let props = allCompsD[comp.nodeid].properties;
                            for (let propIndex = 0; propIndex < props.length; propIndex++) {

                                for (let k = 0; k < sourceProps.length; k++) {
                                    let transposedProp = sourceProps[k];
                                    if (props[propIndex].Name === transposedProp["dName"]) {
                                        props[propIndex].Value = transposedProp["dValue"];
                                    }
                                }
                            }
                        }                        
                    }

                     // update all components
                     if (allCompsD) {
                        checkResults.allComponents["d"] = JSON.stringify(allCompsD);
                    }
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
                var results = xCheckStudio.Util.tryJsonParse(msg);
                if (results === null) {
                    return;
                }

                let tableIds = [];
                for (var groupId in results) {

                    var transpoedComponents = results[groupId];

                    for (var componentId in transpoedComponents) {

                        var originalComponent = _this.GetCheckComponent(groupId, componentId);

                        var changedComponent = transpoedComponents[componentId]["component"];

                        originalComponent.transpose = changedComponent["transpose"];
                        originalComponent.status = "OK";

                        // var isPropertyAccepted = false;
                        // var isPropertyTransposed = false;

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
                        if (tableIds.indexOf(tableContainer) === -1) {
                            tableIds.push(tableContainer);
                        }

                        _this.UpdateInViewerOnStatusChange(changedComponent);

                        // Update original dataset properties 
                        let affectedComponents = [];
                        let resValues = Object.values(results);
                        for (let i = 0; i < resValues.length; i++) {
                            let resComps = Object.values(resValues[i]);
                            for (j = 0; j < resComps.length; j++) {
                                affectedComponents = affectedComponents.concat(Object.values(resComps[j]));
                            }
                        }                        
                        _this.UpdateSourcePropertiesAfterTranspose(affectedComponents, false);
                    }
                }

                model.getCurrentReviewTable().Refresh(tableIds);
            }
        });
    }
    catch (error) { }
}

ComparisonReviewManager.prototype.TransposeComponent = function (
    key,
    selectedGroupIdsVsResultIds) {
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
                var results = xCheckStudio.Util.tryJsonParse(msg);
                if (results === null) {
                    return;
                }
               
                var tableIds = [];
                for (var groupId in results) {

                    var transpoedComponents = results[groupId];

                    for (var componentId in transpoedComponents) {

                        var originalComponent = _this.GetCheckComponent(groupId, componentId);

                        var changedComponent = transpoedComponents[componentId]["component"];

                        originalComponent.transpose = changedComponent["transpose"];
                        originalComponent.status = "OK";

                        // var isPropertyAccepted = false;
                        // var isPropertyTransposed = false;

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
                        if (tableIds.indexOf(tableContainer) === -1) {
                            tableIds.push(tableContainer);
                        }

                        _this.UpdateInViewerOnStatusChange(changedComponent);
                    }
                }
                model.getCurrentReviewTable().Refresh(tableIds);

                // Update original dataset properties 
                let affectedComponents = [];
                let resValues = Object.values(results);
                for (let i = 0; i < resValues.length; i++) {
                    let resComps = Object.values(resValues[i]);
                    for (j = 0; j < resComps.length; j++) {
                        affectedComponents = affectedComponents.concat(Object.values(resComps[j]));
                    }
                }
                _this.UpdateSourcePropertiesAfterTranspose(affectedComponents, true);
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
                var results = xCheckStudio.Util.tryJsonParse(msg);
                if (results === null) {
                    return;
                }

                let tableIds = [];
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
                        if (tableIds.indexOf(tableContainer) === -1) {
                            tableIds.push(tableContainer);
                        }

                        _this.UpdateInViewerOnStatusChange(changedComponent);

                        // Update original dataset properties 
                        let affectedComponents = [];
                        let resValues = Object.values(results);
                        for (let i = 0; i < resValues.length; i++) {
                            let resComps = Object.values(resValues[i]);
                            for (j = 0; j < resComps.length; j++) {
                                affectedComponents = affectedComponents.concat(Object.values(resComps[j]));
                            }
                        }
                        _this.UpdateSourcePropertiesAfterTranspose(affectedComponents, false);
                    }
                }

                model.getCurrentReviewTable().Refresh(tableIds);
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
            data: {
                'groupid': groupId,
                'transposeType': transposeType,
                'transposeLevel': 'categorylevel',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            success: function (msg) {
                var results = xCheckStudio.Util.tryJsonParse(msg);
                if (results === null) {
                    return;
                }

                var tableIds = [];
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
                        if (tableIds.indexOf(tableContainer) === -1) {
                            tableIds.push(tableContainer);
                        }

                        _this.UpdateInViewerOnStatusChange(changedComponent);
                    }
                }
                model.getCurrentReviewTable().Refresh(tableIds);

                // Update original dataset properties 
                let affectedComponents = [];
                let resValues = Object.values(results);
                for (let i = 0; i < resValues.length; i++) {
                    let resComps = Object.values(resValues[i]);
                    for (j = 0; j < resComps.length; j++) {
                        affectedComponents = affectedComponents.concat(Object.values(resComps[j]));
                    }
                }
                _this.UpdateSourcePropertiesAfterTranspose(affectedComponents, true);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

ComparisonReviewManager.prototype.UpdateSourcePropertiesAfterTranspose = function (affectedComponents, transpose = true) {
    let allCompsA
    let allCompsB
    let allCompsC
    let allCompsD
    if ("allComponents" in checkResults) {
        if ("a" in checkResults.allComponents) {
            allCompsA = JSON.parse(checkResults.allComponents["a"]);
        }
        if ("b" in checkResults.allComponents) {
            allCompsB = JSON.parse(checkResults.allComponents["b"]);
        }
        if ("c" in checkResults.allComponents) {
            allCompsC = JSON.parse(checkResults.allComponents["c"]);
        }
        if ("d" in checkResults.allComponents) {
            allCompsD = JSON.parse(checkResults.allComponents["d"]);
        }
    }

    for (let ii = 0; ii < affectedComponents.length; ii++) {
        let affectedComponent = affectedComponents[ii];      

        if (affectedComponent.sourceAId &&
            affectedComponent.sourceAId !== "") {
            for (let i = 0; i < checkResults.sourceAComponents.length; i++) {
                let comp = checkResults.sourceAComponents[i];
                if (affectedComponent.sourceAId != comp.id) {
                    continue;
                }

                for (let j = 0; j < comp.properties.length; j++) {
                    let prop = comp.properties[j];
                    for (let k = 0; k < affectedComponent.properties.length; k++) {
                        let transposedProp = affectedComponent.properties[k];
                        if (transposedProp["sourceAName"] !== prop.name) {
                            continue;
                        }

                        if (transpose === true) {
                            if (!transposedProp["transpose"] ||
                                transposedProp["transpose"] == "") {
                                continue;
                            }

                            if (transposedProp["transpose"].toLowerCase() === "fromdatasource2") {
                                prop.value = transposedProp["sourceBValue"];
                            }
                            else if (transposedProp["transpose"].toLowerCase() === "fromdatasource3") {
                                prop.value = transposedProp["sourceCValue"];
                            }
                            else if (transposedProp["transpose"].toLowerCase() === "fromdatasource4") {
                                prop.value = transposedProp["sourceDValue"];
                            }
                        }
                        else {
                            prop.value = transposedProp["sourceAValue"];
                        }

                        // update all components                       
                        if (allCompsA &&
                            affectedComponent.sourceANodeId in allCompsA) {
                            let props = allCompsA[affectedComponent.sourceANodeId].properties;
                            for (let propIndex = 0; propIndex < props.length; propIndex++) {
                                if (props[propIndex].Name === transposedProp["sourceAName"]) {
                                    props[propIndex].Value = prop.value;
                                }
                            }
                        }
                    }
                }
            }           
        }
        if (affectedComponent.sourceBId &&
            affectedComponent.sourceBId !== "") {
            for (let i = 0; i < checkResults.sourceBComponents.length; i++) {
                let comp = checkResults.sourceBComponents[i];
                if (affectedComponent.sourceBId != comp.id) {
                    continue;
                }

                for (let j = 0; j < comp.properties.length; j++) {
                    let prop = comp.properties[j];
                    for (let k = 0; k < affectedComponent.properties.length; k++) {
                        let transposedProp = affectedComponent.properties[k];
                        if (transposedProp["sourceBName"] !== prop.name) {
                            continue;
                        }

                        if (transpose === true) {
                            if (!transposedProp["transpose"] ||
                                transposedProp["transpose"] == "") {
                                continue;
                            }
                            if (transposedProp["transpose"].toLowerCase() === "fromdatasource1") {
                                prop.value = transposedProp["sourceAValue"];
                            }
                            else if (transposedProp["transpose"].toLowerCase() === "fromdatasource3") {
                                prop.value = transposedProp["sourceCValue"];
                            }
                            else if (transposedProp["transpose"].toLowerCase() === "fromdatasource4") {
                                prop.value = transposedProp["sourceDValue"];
                            }
                        }
                        else {
                            prop.value = transposedProp["sourceBValue"];
                        }

                        
                        // update all components                    
                        if (allCompsB &&
                            affectedComponent.sourceBNodeId in allCompsB) {
                            let props = allCompsB[affectedComponent.sourceBNodeId].properties;
                            for (let propIndex = 0; propIndex < props.length; propIndex++) {
                                if (props[propIndex].Name === transposedProp["sourceBName"]) {
                                    props[propIndex].Value = prop.value;
                                }
                            }
                        }
                    }
                }
            }            
        }
        if (affectedComponent.sourceCId &&
            affectedComponent.sourceCId !== "") {
            for (let i = 0; i < checkResults.sourceCComponents.length; i++) {
                let comp = checkResults.sourceCComponents[i];
                if (affectedComponent.sourceCId != comp.id) {
                    continue;
                }

                for (let j = 0; j < comp.properties.length; j++) {
                    let prop = comp.properties[j];
                    for (let k = 0; k < affectedComponent.properties.length; k++) {
                        let transposedProp = affectedComponent.properties[k];
                        if (transposedProp["sourceCName"] !== prop.name) {
                            continue;
                        }

                        if (transpose === true) {
                            if (!transposedProp["transpose"] ||
                                transposedProp["transpose"] == "") {
                                continue;
                            }
                            if (transposedProp["transpose"].toLowerCase() === "fromdatasource1") {
                                prop.value = transposedProp["sourceAValue"];
                            }
                            else if (transposedProp["transpose"].toLowerCase() === "fromdatasource2") {
                                prop.value = transposedProp["sourceBValue"];
                            }
                            else if (transposedProp["transpose"].toLowerCase() === "fromdatasource4") {
                                prop.value = transposedProp["sourceDValue"];
                            }
                        }
                        else {
                            prop.value = transposedProp["sourceCValue"];
                        }

                        // update all components
                        if (allCompsC &&
                            affectedComponent.sourceCNodeId in allCompsC) {
                            let props = allCompsC[affectedComponent.sourceCNodeId].properties;
                            for (let propIndex = 0; propIndex < props.length; propIndex++) {
                                if (props[propIndex].Name === transposedProp["sourceCName"]) {
                                    props[propIndex].Value = prop.value;
                                }
                            }
                        }
                    }
                }
            }
        }
        if (affectedComponent.sourceDId &&
            affectedComponent.sourceDId !== "") {
            for (let i = 0; i < checkResults.sourceDComponents.length; i++) {
                let comp = checkResults.sourceDComponents[i];
                if (affectedComponent.sourceDId != comp.id) {
                    continue;
                }

                for (let j = 0; j < comp.properties.length; j++) {
                    let prop = comp.properties[j];
                    for (let k = 0; k < affectedComponent.properties.length; k++) {
                        let transposedProp = affectedComponent.properties[k];
                        if (transposedProp["sourceDName"] !== prop.name) {
                            continue;
                        }

                        if (transpose === true) {
                            if (!transposedProp["transpose"] ||
                                transposedProp["transpose"] == "") {
                                continue;
                            }
                            if (transposedProp["transpose"].toLowerCase() === "fromdatasource1") {
                                prop.value = transposedProp["sourceAValue"];
                            }
                            else if (transposedProp["transpose"].toLowerCase() === "fromdatasource2") {
                                prop.value = transposedProp["sourceBValue"];
                            }
                            else if (transposedProp["transpose"].toLowerCase() === "fromdatasource3") {
                                prop.value = transposedProp["sourceCValue"];
                            }
                        }
                        else {
                            prop.value = transposedProp["sourceDValue"];
                        }

                        // update all components
                        if (allCompsD &&
                            affectedComponent.sourceDNodeId in allCompsD) {
                            let props = allCompsD[affectedComponent.sourceDNodeId].properties;
                            for (let propIndex = 0; propIndex < props.length; propIndex++) {
                                if (props[propIndex].Name === transposedProp["sourceDName"]) {
                                    props[propIndex].Value = prop.value;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // update all components
    if (allCompsA) {
        checkResults.allComponents["a"] = JSON.stringify(allCompsA);
    }
    if (allCompsB) {
        checkResults.allComponents["b"] = JSON.stringify(allCompsB);
    }
    if (allCompsC) {
        checkResults.allComponents["c"] = JSON.stringify(allCompsC);
    }
    if (allCompsD) {
        checkResults.allComponents["d"] = JSON.stringify(allCompsD);
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

ComparisonReviewManager.prototype.GetComponentData = function (checkComponentData, srcId) {

    var ComponentData;
    if (srcId === "a") {
        var id = Number(checkComponentData.sourceAId);
        ComponentData = model.checks[model.currentCheck]["SourceAcomponentIdVsComponentData"][id];
    }
    else if (srcId === "b") {
        var id = Number(checkComponentData.sourceBId);
        ComponentData = model.checks[model.currentCheck]["SourceBcomponentIdVsComponentData"][id];
    }
    else if (srcId === "c") {
        var id = Number(checkComponentData.sourceCId);
        ComponentData = model.checks[model.currentCheck]["SourceCcomponentIdVsComponentData"][id];
    }
    else if (srcId === "d") {
        var id = Number(checkComponentData.sourceDId);
        ComponentData = model.checks[model.currentCheck]["SourceDcomponentIdVsComponentData"][id];
    }

    var sourceComponentData = {};

    sourceComponentData["Name"] = ComponentData.name;
    sourceComponentData["Status"] = checkComponentData.status;
    sourceComponentData["accepted"] = checkComponentData.accepted;
    sourceComponentData["transpose"] = checkComponentData.transpose;
    sourceComponentData["NodeId"] = ComponentData.nodeid;
    sourceComponentData["MainClass"] = ComponentData.mainclass;

    return sourceComponentData;
}

ComparisonReviewManager.prototype.OpenPropertyCallout = function (rowData) {

    var propertyCalloutData = {};

    if (rowData.SourceAId &&
        rowData.SourceAId != "" &&
        checkResults.sourceAComponents) {
        // var sourceAId = Number(rowData.SourceAId);

        for (var i = 0; i < checkResults.sourceAComponents.length; i++) {
            var component = checkResults.sourceAComponents[i];
            if (component.id != rowData.SourceAId) {
                continue;
            }


            propertyCalloutData["a"] = {
                name: component.name,
                componentId : rowData.SourceAId,
                properties: [],
                references: [],
                comments: []
            };

            // properties
            for (var i = 0; i < component.properties.length; i++) {
                var property = {};
                property["Name"] = component.properties[i].name;
                property["Value"] = component.properties[i].value;
                propertyCalloutData["a"].properties.push(property);
            }

            // references
            var referncesData = this.GetReferencesData(component.id, "a");
            propertyCalloutData["a"]["references"] = referncesData["references"];
            propertyCalloutData["a"]["comments"] = referncesData["comments"];

            break;
        }
    }

    if (rowData.SourceBId &&
        rowData.SourceBId != "" &&
        checkResults.sourceBComponents) {
        for (var i = 0; i < checkResults.sourceBComponents.length; i++) {
            var component = checkResults.sourceBComponents[i];
            if (component.id != rowData.SourceBId) {
                continue;
            }

            propertyCalloutData["b"] = {
                name: component.name,
                componentId : rowData.SourceBId,
                properties: [],
                references: [],
                comments: []
            };
            for (var i = 0; i < component.properties.length; i++) {
                var property = {};
                property["Name"] = component.properties[i].name;
                property["Value"] = component.properties[i].value;
                propertyCalloutData["b"].properties.push(property);
            }

            // references
            var referncesData = this.GetReferencesData(component.id, "b");
            propertyCalloutData["b"]["references"] = referncesData["references"];
            propertyCalloutData["b"]["comments"] = referncesData["comments"];

            break;
        }
    }

    if (rowData.SourceCId &&
        rowData.SourceCId != "" &&
        checkResults.sourceCComponents) {
        for (var i = 0; i < checkResults.sourceCComponents.length; i++) {
            var component = checkResults.sourceCComponents[i];
            if (component.id != rowData.SourceCId) {
                continue;
            }

            propertyCalloutData["c"] = {
                name: component.name,
                componentId : rowData.SourceCId,
                properties: [],
                references: [],
                comments: []
            };
            for (var i = 0; i < component.properties.length; i++) {
                var property = {};
                property["Name"] = component.properties[i].name;
                property["Value"] = component.properties[i].value;
                propertyCalloutData["c"].properties.push(property);
            }

            // references
            var referncesData = this.GetReferencesData(component.id, "c");
            propertyCalloutData["c"]["references"] = referncesData["references"];
            propertyCalloutData["c"]["comments"] = referncesData["comments"];


            break;
        }
    }

    if (rowData.SourceDId &&
        rowData.SourceDId != "" &&
        checkResults.sourceDComponents) {
        for (var i = 0; i < checkResults.sourceDComponents.length; i++) {
            var component = checkResults.sourceDComponents[i];
            if (component.id != rowData.SourceDId) {
                continue;
            }

            propertyCalloutData["d"] = {
                name: component.name,
                componentId : rowData.SourceDId,
                properties: [],
                references: [],
                comments: []
            };
            for (var i = 0; i < component.properties.length; i++) {
                var property = {};
                property["Name"] = component.properties[i].name;
                property["Value"] = component.properties[i].value;
                propertyCalloutData["d"].properties.push(property);
            }

            // references
            var referncesData = this.GetReferencesData(component.id, "d");
            propertyCalloutData["d"]["references"] = referncesData["references"];
            propertyCalloutData["d"]["comments"] = referncesData["comments"];

            break;
        }
    }

    model.checks["comparison"].PropertyCallout.UpdateForComparison(propertyCalloutData);
}

ComparisonReviewManager.prototype.GetReferencesData = function (componentId, src) {
    var _this = this;
    var allData = {
        references: [],
        comments: [],
    };

    var references = ReferenceManager.getReferences([componentId], src, false);
    // ReferenceManager.getReferences([componentId], src, false).then(function (references) {        
        var referencesData = [];
        var commentsData = [];

        if (references) {

            if (references && src in references) {
                if ("webAddress" in references[src]) {
                    for (var i = 0; i < references[src]["webAddress"].length; i++) {
                        // index++;

                        var referenceData = {};
                        // referenceData["id"] = index;
                        referenceData["Value"] = references[src]["webAddress"][i];
                        referenceData["Type"] = "Web Address";

                        referencesData.push(referenceData);
                    }
                }

                if ("image" in references[src]) {
                    for (var i = 0; i < references[src]["image"].length; i++) {
                        // index++;

                        var referenceData = {};
                        // referenceData["id"] = index;
                        referenceData["Value"] = references[src]["image"][i];
                        referenceData["Type"] = "Image";

                        referencesData.push(referenceData);
                    }
                }

                if ("document" in references[src]) {
                    for (var i = 0; i < references[src]["document"].length; i++) {
                        // index++;

                        var referenceData = {};
                        // referenceData["id"] = index;
                        referenceData["Value"] = references[src]["document"][i];
                        referenceData["Type"] = "Document";

                        referencesData.push(referenceData);
                    }
                }

                if ("comment" in references[src]) {
                    for (var i = 0; i < references[src]["comment"].length; i++) {
                        commentsData.push(JSON.parse(references[src]["comment"][i]));
                    }
                }
            }

            allData["references"] = referencesData;
            allData["comments"] = commentsData;
        }
    // });

    return allData;
}

ComparisonReviewManager.prototype.SelectAllGroupItems = function (groupId) {
    return new Promise((resolve) => {

        var groupContainer = "#" + this.ComparisonCheckManager["results"][groupId]["componentClass"] + "_" + this.MainReviewTableContainer;
        var dataGrid = $(groupContainer).dxDataGrid("instance");
        var rows = dataGrid.getVisibleRows();

        var rowKeys = [];
        for (var i = 0; i < rows.length; i++) {
            rowKeys.push(rows[i].key);
        }

        if (rowKeys.length > 0) {
            dataGrid.selectRows(rowKeys).then(function (result) {
                return resolve(rows);
            });
        }
    });
}

ComparisonReviewManager.prototype.SerializeViewsAndTags = function (clear = false) {

    let comparisonMarkupViews = model.markupViews["comparison"];
    let comparisonBookmarks = model.bookmarks["comparison"];
    let comparisonAnnotations = model.annotations["comparison"];

    // source a
    var sourceAViewer = model.checks["comparison"]["sourceAViewer"];
    if (sourceAViewer &&
        sourceAViewer.Is3DViewer()) {

        // markup views
        let markupViews = comparisonMarkupViews["a"];
        let markupViewsSerialized = sourceAViewer.SerializeViews(markupViews);
        comparisonMarkupViews["a" + "_serialized"] = markupViewsSerialized;
        if (clear === true) {
            comparisonMarkupViews["a"] = {};
        }

        // bookmark views
        let bookmarks = comparisonBookmarks["a"];
        let bookmarksSerialized = sourceAViewer.SerializeViews(bookmarks);
        comparisonBookmarks["a" + "_serialized"] = bookmarksSerialized;
        if (clear === true) {
            comparisonBookmarks["a"] = {};
        }

        // annotations
        let annotations = comparisonAnnotations["a"];
        let annotationsSerialized = sourceAViewer.SerializeAnnotations(annotations);
        comparisonAnnotations["a" + "_serialized"] = annotationsSerialized;
        if (clear === true) {
            comparisonAnnotations["a"] = {};
        }
    }

    // source b
    var sourceBViewer = model.checks["comparison"]["sourceBViewer"];
    if (sourceBViewer &&
        sourceBViewer.Is3DViewer()) {

        // markup views
        let markupViews = comparisonMarkupViews["b"];
        let markupViewsSerialized = sourceBViewer.SerializeViews(markupViews);
        comparisonMarkupViews["b" + "_serialized"] = markupViewsSerialized;
        if (clear === true) {
            comparisonMarkupViews["b"] = {};
        }

        // bookmark views
        let bookmarks = comparisonBookmarks["b"];
        let bookmarksSerialized = sourceBViewer.SerializeViews(bookmarks);
        comparisonBookmarks["b" + "_serialized"] = bookmarksSerialized;
        if (clear === true) {
            comparisonBookmarks["b"] = {};
        }

        // annotations
        let annotations = comparisonAnnotations["b"];
        let annotationsSerialized = sourceBViewer.SerializeAnnotations(annotations);
        comparisonAnnotations["b" + "_serialized"] = annotationsSerialized;
        if (clear === true) {
            comparisonAnnotations["b"] = {};
        }
    }

    // source c
    var sourceCViewer = model.checks["comparison"]["sourceCViewer"];
    if (sourceCViewer &&
        sourceCViewer.Is3DViewer()) {

        // markup views
        let markupViews = comparisonMarkupViews["c"];
        let markupViewsSerialized = sourceCViewer.SerializeViews(markupViews);
        comparisonMarkupViews["c" + "_serialized"] = markupViewsSerialized;
        if (clear === true) {
            comparisonMarkupViews["c"] = {};
        }

        // bookmark views
        let bookmarks = comparisonBookmarks["c"];
        let bookmarksSerialized = sourceCViewer.SerializeViews(bookmarks);
        comparisonBookmarks["c" + "_serialized"] = bookmarksSerialized;
        if (clear === true) {
            comparisonBookmarks["c"] = {};
        }

        // annotations
        let annotations = comparisonAnnotations["c"];
        let annotationsSerialized = sourceCViewer.SerializeAnnotations(annotations);
        comparisonAnnotations["c" + "_serialized"] = annotationsSerialized;
        if (clear === true) {
            comparisonAnnotations["c"] = {};
        }
    }

    // source d
    var sourceDViewer = model.checks["comparison"]["sourceDViewer"];
    if (sourceDViewer &&
        sourceDViewer.Is3DViewer()) {

        // markup views
        let markupViews = comparisonMarkupViews["d"];
        let markupViewsSerialized = sourceDViewer.SerializeViews(markupViews);
        comparisonMarkupViews["d" + "_serialized"] = markupViewsSerialized;
        if (clear === true) {
            comparisonMarkupViews["d"] = {};
        }

        // bookmark views
        let bookmarks = comparisonBookmarks["d"];
        let bookmarksSerialized = sourceDViewer.SerializeViews(bookmarks);
        comparisonBookmarks["d" + "_serialized"] = bookmarksSerialized;
        if (clear === true) {
            comparisonMarkupViews["d"] = {};
        }

        // annotations
        let annotations = comparisonAnnotations["d"];
        let annotationsSerialized = sourceDViewer.SerializeAnnotations(annotations);
        comparisonAnnotations["d" + "_serialized"] = annotationsSerialized;
        if (clear === true) {
            comparisonMarkupViews["d"] = {};
        }
    }
}

ComparisonReviewManager.prototype.RestoreViewsAndTags = function (sourceViewer, dataSourceId) {
    let comparisonMarkupViews = model.markupViews["comparison"];
    let comparisonBookmarks = model.bookmarks["comparison"];
    let comparisonAnnotations = model.annotations["comparison"];

    // source a
    // var sourceAViewer = model.checks["comparison"]["sourceAViewer"];
    if (sourceViewer &&
        sourceViewer.Is3DViewer()) {

        // markup views
        let markupViews = comparisonMarkupViews[dataSourceId + "_serialized"];
        if (markupViews && markupViews.length > 0) {
            let markupViewsStr = sourceViewer.RestoreViews(JSON.stringify({ "views": markupViews }));
            var markupViewsData = JSON.parse(markupViewsStr).views;
            for (var i = 0; i < markupViewsData.length; i++) {
                comparisonMarkupViews[dataSourceId][markupViewsData[i].name] = markupViewsData[i].uniqueId;
            }

            comparisonMarkupViews[dataSourceId + "_serialized"] = [];
        }

        // bookmark views
        let bookmarks = comparisonBookmarks[dataSourceId + "_serialized"];
        if (bookmarks && bookmarks.length > 0) {
            let bookmarksStr = sourceViewer.RestoreViews(JSON.stringify({ "views": bookmarks }));
            var bookmarksStrData = JSON.parse(bookmarksStr).views;
            for (var i = 0; i < bookmarksStrData.length; i++) {
                comparisonBookmarks[dataSourceId][bookmarksStrData[i].name] = bookmarksStrData[i].uniqueId;
            }

            comparisonBookmarks[dataSourceId + "_serialized"] = [];
        }

        // annotations
        let annotations = comparisonAnnotations[dataSourceId + "_serialized"];
        if (annotations && annotations.length > 0) {
            let restoredAnnotations = sourceViewer.RestoreAnnotations(JSON.stringify(annotations));
            for (var markupHandle in restoredAnnotations) {
                comparisonAnnotations[dataSourceId][markupHandle] = restoredAnnotations[markupHandle];
            }
            model.checks['comparison'].annotationOperator._annotationCount = Object.keys(comparisonAnnotations[dataSourceId]).length + 1;

            comparisonAnnotations[dataSourceId + "_serialized"] = [];
        }
    }
}