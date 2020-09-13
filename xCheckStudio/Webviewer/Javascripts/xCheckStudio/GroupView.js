function GroupView(
    id,
    modelBrowserContainer,
    components
) {
    // call super constructor
    ModelBrowser.call(this, id, modelBrowserContainer);

    this.Components = components;

    this.ExistingColumnNames = [];
    this.Headers = [];
    this.TableData = [];

    this.HighlightedRow = {};
    this.SelectedRows = {};

    // this.GroupedData = {};

    // this.GroupViewTableInstance;
    this.GroupViewGrid = null;
    this.GroupViewTree = null;

    // this.SelectedRows = {};
    // this.HighlightedRow = {};

    // this.KeyVsTableItems = {};
    // this.NodeIdVsTableItems = {};
    // this.GroupKeysVsDataItems = {};

    // this.AvoidTableEvents = false;
    // this.AvoidViewerEvents = false;

    // var _this = this;
    // this.ViewerCallbackMap = {
    //     selectionArray: function (selections) {
    //         if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.Group ||
    //             _this.AvoidViewerEvents) {
    //             return;
    //         }

    //         _this.OnSelectionFromViewer(selections);
    //     }
    // };

    // // this.GroupProperties;
    this.GroupTemplate = null;

    // this.UndefinedHidden = false;

    this.ActiveGroupViewType = "Group";
    // this.RowWiseColors = {};
    // this.HighlightActive = false;

    // // this is for datachange view tree list only
    // this.RootNodeId = null;
    // this.NodeIdVsParentNodeIds = {};

    this.DataChangeGroupViewActive = false;
    this.DatabaseViewActive = false;
    this.RevisionCheckResults = null;
    this.CurrentDataChangeTemplate = null;
    this.DataChangeHighlightColors = {
        "property change": "#f9ffc7",
        "new item": "#c9ffcf",
        "deleted item": "#fad9d7",
        "ga new item": "#74B741",
        // "ga deleted item " : "#FF0000", // for now, we don't see any deleted item in ga so can't color
        "ga property change": "#fff729"
    };
    this.DisplayTablesForm = null;
    // this.ExcludeMembers = false;
    // this.Flat = false;

    this.DBViewTabPanel = null;
}
// assign ModelBrowser's method to this class
GroupView.prototype = Object.create(ModelBrowser.prototype);
GroupView.prototype.constructor = GroupView;

GroupView.prototype.Show = function () {
    this.Clear();

    document.getElementById("tableHeaderName" + this.Id).innerText = GlobalConstants.TableView.Group;
}

GroupView.prototype.IsHighlightByPropertyView = function () {
    if (this.ActiveGroupViewType.toLowerCase() === "highlight") {
        return true;
    }

    return false;
}

GroupView.prototype.IsPropertyGroupView = function () {
    if (this.ActiveGroupViewType.toLowerCase() === "group") {
        return true;
    }

    return false;
}

GroupView.prototype.IsDataChangeHighlightView = function () {
    if (this.ActiveGroupViewType.toLowerCase() === "data change highlight") {
        return true;
    }

    return false;
}

GroupView.prototype.GetFilter = function () {
    var groupProperties = this.GetGroupTemplateProperties();
    if (groupProperties === null) {
        return null;
    }

    var filter = [];
    if (groupProperties === null ||
        groupProperties.length > 0) {
        filter[0] = [];
    }

    for (var i = 0; i < groupProperties.length; i++) {
        var groupProperty = groupProperties[i];

        var filterCondition = [groupProperty.Name.replace(/\s/g, ''), "=", groupProperty.Value];
        filter[filter.length - 1].push(filterCondition);

        if (!groupProperty.Operator ||
            groupProperty.Operator.toLowerCase() === "and") {
            filter.push("or", []);
        }
        else {
            filter[filter.length - 1].push("and");
        }
    }

    return filter;
}

GroupView.prototype.GetGroupTemplateProperties = function () {
    if (this.GroupTemplate &&
        ("properties" in this.GroupTemplate)) {
        return this.GroupTemplate.properties;
    }

    return null;
}

GroupView.prototype.GetGroupColor = function (groupKey) {

    var color = {
        parentColor: null,
        color: null
    };
    var groupProperties = this.GetGroupTemplateProperties();
    if (groupProperties === null) {
        return;
    }
    var groupPropertiesOrder = [];
    for (var j = 0; j < groupProperties.length; j++) {
        var groupProperty = groupProperties[j];
        if (groupPropertiesOrder.indexOf(groupProperty.Name) === -1) {
            groupPropertiesOrder.push(groupProperty.Name);
        }
    }

    var groupKeyArray = groupKey.split(",");
    // for(var i = 0; i < groupKeyArray.length; i++)
    // {
    for (var j = 0; j < groupProperties.length; j++) {
        var groupProperty = groupProperties[j];

        var index = groupPropertiesOrder.indexOf(groupProperty.Name);
        if (index === -1) {
            continue;
        }

        if (groupKeyArray[index] === groupProperty.Value) {
            if (index === groupKeyArray.length - 1 ||
                !groupProperty.Operator ||
                groupProperty.Operator.toLowerCase() === "and") {
                color.color = groupProperty.Color ? groupProperty.Color : null;
                break;
            }
            else {
                color.parentColor = groupProperty.Color;
            }
        }
    }

    if (color.color !== null) {
        return color.color;
    }
    return color.parentColor;
}

GroupView.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#B2BABB";
    // for (var j = 0; j < row.cells.length; j++) {
    //     cell = row.cells[j];
    //     cell.style.backgroundColor = "#B2BABB"
    // }
}

GroupView.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
    // for (var j = 0; j < row.cells.length; j++) {
    //     cell = row.cells[j];
    //     cell.style.backgroundColor = "#ffffff"
    // }
}

GroupView.prototype.CheckRevisions = function (template) {
    return new Promise((resolve) => {

        if (!("source" in template) ||
            !("target" in template)) {
            return resolve(null);
        }

        let _this = this;
        this.CurrentDataChangeTemplate = template;

        // check if types are correct
        let currentSourceType = SourceManagers[model.currentTabId].SourceType.toLowerCase();
        if (template["source"]["id"].toLowerCase() !== "current" &&
            template["source"]["dataSourceType"].toLowerCase() !== currentSourceType) {
            alert("Selected template is not compatible with active dataset.")
            return resolve(null);
        }

        if (template["target"]["id"].toLowerCase() !== "current" &&
            template["target"]["dataSourceType"].toLowerCase() !== currentSourceType) {
            alert("Selected template is not compatible with active dataset.")
            return resolve(null);
        }

        let components = {
            "source": null,
            "target": null
        };

        // Source revision
        let srcRevisionInfo = {};
        if (template["source"]["id"].toLowerCase() === "current") {
            srcRevisionInfo["revisionName"] = "Current";
            components["source"] = SourceManagers[model.currentTabId].GetAllComponents();
        }
        else {
            srcRevisionInfo["revisionName"] = template["source"]["name"];
            srcRevisionInfo["dataSourceType"] = template["source"]["dataSourceType"];
            srcRevisionInfo["dataSourceName"] = template["source"]["dataSourceName"];
        }

        // target revision
        let targetRevisionInfo = {};
        if (template["target"]["id"].toLowerCase() === "current") {
            targetRevisionInfo["revisionName"] = "Current";
            components["target"] = SourceManagers[model.currentTabId].GetAllComponents();
        }
        else {
            targetRevisionInfo["revisionName"] = template["target"]["name"];
            targetRevisionInfo["dataSourceType"] = template["target"]["dataSourceType"];
            targetRevisionInfo["dataSourceName"] = template["target"]["dataSourceName"];
        }

        // get options
        let options = null;
        if ("options" in template) {
            options = template["options"];
        }
        if (options === null) {
            return resolve(null);
        }

        // check if target revision is recent or not
        let isTargetNewer = "true";
        let isTargetCurrent = false;
        if (targetRevisionInfo["revisionName"] === "Current") {
            isTargetNewer = "true";
            isTargetCurrent = true;
        }
        else if (srcRevisionInfo["revisionName"] === "Current") {
            isTargetNewer = "false";
        }
        else {

            if (new Date(template.target.createdOn).getTime() >= new Date(template.source.createdOn).getTime()) {
                isTargetNewer = "true";
            }
            else {
                isTargetNewer = "false";
            }
        }


        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        $.ajax({
            data: {
                'InvokeFunction': 'CheckRevisions',
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname,
                'sourceRevisionData': JSON.stringify(srcRevisionInfo),
                'targetRevisionData': JSON.stringify(targetRevisionInfo),
                'options': JSON.stringify(options),
                "components": JSON.stringify(components),
                "isTargetNewer": isTargetNewer
            },
            type: "POST",
            url: "PHP/DataChangeRevisioning.php",
        }).done(function (msg) {
            var object = xCheckStudio.Util.tryJsonParse(msg);
            if (object === null ||
                object.MsgCode !== 1) {
                return resolve(null);
            }

            return resolve(object.Data);
        });
    });
}

GroupView.prototype.ShowTargetName = function () {
    if ("target" in this.CurrentDataChangeTemplate) {
        let targetRevision = this.CurrentDataChangeTemplate["target"];

        let revisionLabel = null;
        if (targetRevision.id.toLowerCase() === "current") {
            revisionLabel = "Current";
        }
        else {
            revisionLabel = targetRevision.name + "(" + targetRevision.dataSourceType + ":" + targetRevision.dataSourceName + ")";
        }
        document.getElementById("revisionName" + this.Id).innerText = revisionLabel;
    }
}

GroupView.prototype.ShowDatabaseViewer = function (show) {
    var _this = this;

    this.ClearDatabaseView();

    let databaseViewerEle = document.getElementById("databaseViewer" + this.Id);
    if (show) {
        databaseViewerEle.style.display = "block";

        document.getElementById("maxMinBtn" + this.Id).style.left = "30px";

        this.DatabaseViewActive = true;
    }
    else {
        databaseViewerEle.style.display = "none";

        document.getElementById("maxMinBtn" + this.Id).style.left = "5px";

        this.DatabaseViewActive = false;
    }
}

GroupView.prototype.ClearDatabaseView = function () {
    if (!this.DatabaseViewActive) {
        return;
    }

    var databaseViewer = document.getElementById("databaseViewer" + this.Id);
    var parent = databaseViewer.parentElement;

    $("#databaseViewer" + this.Id).dxTabPanel("dispose");
    $("#databaseViewer" + this.Id).remove();

    var databaseViewerDiv = document.createElement("div")
    databaseViewerDiv.id = "databaseViewer" + this.Id;
    databaseViewerDiv.setAttribute("class", "databaseViewer");
    parent.appendChild(databaseViewerDiv);
}

GroupView.prototype.OnGroupDatabaseViewClick = function () {
    if (!this.IsDataChangeHighlightView() ||
        !this.DataChangeGroupViewActive ||
        !this.DisplayTablesForm) {
        return;
    }
    let _this = this;

    if (!_this.DisplayTablesForm.Active) {
        _this.DisplayTablesForm.Open(Object.keys(this.RevisionCheckResults));
    }
    else {
        _this.DisplayTablesForm.Close();
    }
}

GroupView.prototype.LoadDatabaseViewTabs =function(showTables){
    if (!showTables ||
        showTables.length === 0) {
        return;
    }
    let _this = this;
   
    this.ShowDatabaseViewer(true);

    let source = [];
    for (let group in this.RevisionCheckResults) {
        if (showTables.indexOf(group) === -1) {
            continue;
        }

        let tabId = "tab_" + this.Id + "_" + group;
        let templateDiv = document.createElement('div');
        templateDiv.setAttribute("data-options", "dxTemplate : { name: '" + tabId + "' } ")
        let gridDiv = document.createElement('div');
        gridDiv.id = xCheckStudio.Util.createValidHTMLId("tabGrid_" + this.Id + "_" + group);
        templateDiv.appendChild(gridDiv);
        document.getElementById("databaseViewer" + this.Id).appendChild(templateDiv);

        source.push({ title: group, template: tabId });
    }
   
    let loadingTabPanel = true;
    this.DBViewTabPanel = $("#databaseViewer" + this.Id).dxTabPanel({
        dataSource: source,
        deferRendering: false,
        showNavButtons: true,
        selectedIndex : 0,
        onContentReady: function (e) {
            if (!loadingTabPanel) {
                return;
            }
            loadingTabPanel = false;        

            // populate first grid
            let tabs = e.component.getDataSource().items();
            if (tabs.length > 0) {
                _this.LoadDatabaseViewTables([tabs[0].title]);
            }
        },
        onSelectionChanged: function (e) {

            // dispose old grid
            let gridDivId = xCheckStudio.Util.createValidHTMLId("tabGrid_" + _this.Id + "_" + e.removedItems[0].title);
            let gridDiv = document.getElementById(gridDivId)
            var parent = gridDiv.parentElement;

            $("#" + gridDivId).dxDataGrid("dispose");
            $("#" + gridDivId).remove();

            var newDiv = document.createElement("div")
            newDiv.id = gridDivId;
            parent.appendChild(newDiv);

            // populate new grid
            _this.LoadDatabaseViewTables([e.addedItems[0].title]);
        },
        onDisposing: function (e) {
            _this.DBViewTabPanel = null;
        }
    }).dxTabPanel("instance");
}

GroupView.prototype.LoadDatabaseViewTables = function (showTables) {
    let _this = this;

    showBusyIndicator();

    let allPromises = [];
    for (let groupName in _this.RevisionCheckResults) {
        if (showTables.indexOf(groupName) === -1) {
            continue;
        }

        allPromises.push(_this.LoadDatabaseViewTable(groupName, _this.RevisionCheckResults[groupName]));
    }

    xCheckStudio.Util.waitUntilAllPromises(allPromises).then(function (res) {
        hideBusyIndicator();
    });
}

GroupView.prototype.LoadDatabaseViewTable = function (groupName, group) {
    let _this = this;
    return new Promise((resolve) => {
        // Create grid        
        let columns = [];
        let allColumns = ["_Status", "Item", "Source Revision", "Target Revision"];

        var column = {};
        column["caption"] = "Status";
        column["dataField"] = "_Status";
        column["width"] = "100px";
        column["fixed"] = true;
        column["fixedPosition"] = "left";
        columns.push(column);

        column = {};
        column["caption"] = "Item";
        column["dataField"] = "Item";
        column["width"] = "100px";
        column["fixed"] = true;
        column["fixedPosition"] = "left";
        columns.push(column);

        column = {};
        column["caption"] = "Target Revision";
        column["dataField"] = "TargetRevision";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Source Revision";
        column["dataField"] = "SourceRevision";
        column["width"] = "100px";
        columns.push(column);

        var rowsData = [];
        for (let i = 0; i < group.length; i++) {
            let item = group[i];

            let itemData = null;
            if ("target" in item) {
                itemData = item["target"];
            }
            else if ("source" in item) {
                itemData = item["source"];
            }
            if (itemData) {
                var rowData = {};
                rowData["_Status"] = item['_status'];
                rowData["Item"] = itemData['Name'];

                if ("target" in item &&
                    "target" in _this.CurrentDataChangeTemplate) {
                    let targetRev = _this.CurrentDataChangeTemplate["target"];
                    if (targetRev["id"].toLowerCase() === "current") {
                        rowData["TargetRevision"] = "Current";
                    }
                    else {
                        rowData["TargetRevision"] = targetRev.name + "(" + targetRev.dataSourceType + ":" + targetRev.dataSourceName + ")";
                    }
                }
                if ("source" in item &&
                    "source" in _this.CurrentDataChangeTemplate) {
                    let sourceRev = _this.CurrentDataChangeTemplate["source"];
                    if (sourceRev["id"].toLowerCase() === "current") {
                        rowData["SourceRevision"] = "Current";
                    }
                    else {
                        rowData["SourceRevision"] = sourceRev.name + "(" + sourceRev.dataSourceType + ":" + sourceRev.dataSourceName + ")";
                    }
                }

                if ("checkProperties" in item) {
                    let checkProperties = item["checkProperties"];
                    let changedProperties = [];
                    let deletedProperties = [];
                    let newProperties = [];
                    for (let j = 0; j < checkProperties.length; j++) {
                        let checkProperty = checkProperties[j];

                        let propName = null;
                        let propValue = null;
                        if ("targetName" in checkProperty &&
                            "targetValue" in checkProperty) {
                            propName = checkProperty["targetName"];
                            propValue = checkProperty["targetValue"];
                        }
                        else if ("sourceName" in checkProperty &&
                            "sourceValue" in checkProperty) {
                            propName = checkProperty["sourceName"];
                            propValue = checkProperty["sourceValue"];
                        }
                        else {
                            continue;
                        }

                        if (allColumns.indexOf(propName) === -1) {
                            column = {};
                            column["caption"] = propName;
                            column["dataField"] = propName.replace(/\s/g, '');
                            column["width"] = "100px";
                            columns.push(column);

                            allColumns.push(propName);
                        }
                        if (propValue === undefined ||
                            propValue === null) {
                            propValue = "";
                        }
                        rowData[propName.replace(/\s/g, '')] = propValue;

                        let checkStatus = checkProperty["status"].toLowerCase();
                        if (checkStatus === "changed property") {
                            changedProperties.push(propName.replace(/\s/g, ''));
                        }
                        else if (checkStatus === "deleted property") {
                            deletedProperties.push(propName.replace(/\s/g, ''));
                        }
                        else if (checkStatus === "new property") {
                            newProperties.push(propName.replace(/\s/g, ''));
                        }
                    }
                    rowData["changedProperties"] = changedProperties;
                    rowData["deletedProperties"] = deletedProperties;
                    rowData["newProperties"] = newProperties;
                }
                else if ("properties" in itemData) {
                    let properties = itemData["properties"];

                    for (let j = 0; j < properties.length; j++) {
                        let property = properties[j];

                        let propName = property["Name"];
                        let propValue = property["Value"];
                        if (allColumns.indexOf(propName) === -1) {
                            column = {};
                            column["caption"] = propName;
                            column["dataField"] = propName.replace(/\s/g, '');;
                            column["width"] = "100px";
                            columns.push(column);

                            allColumns.push(propName);
                        }
                        if (propValue === undefined ||
                            propValue === null) {
                            propValue = "";
                        }
                        rowData[propName] = propValue;
                    }
                }

                rowsData.push(rowData);
            }
        }

        // set "NULL" for properties donot exist
        for (let i = 0; i < rowsData.length; i++) {
            let rowData = rowsData[i];
            for (let j = 0; j < columns.length; j++) {
                let column = columns[j];
                if (!(column.dataField in rowData)) {
                    rowData[column.dataField] = "NULL";
                }
            }
        }

        // load grid
        let loadingBrowser = true;
        let gridDivId = xCheckStudio.Util.createValidHTMLId("tabGrid_" + _this.Id + "_" + groupName);
        $("#" + gridDivId).dxDataGrid({
            columns: columns,
            dataSource: rowsData,
            width: "100%",
            height: "100%",
            allowColumnResizing: true,            
            hoverStateEnabled: true,
            showBorders: true,
            showRowLines: true,
            paging: { enabled: false },
            filterRow: {
                visible: true
            },
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always",
            },
            scrolling: {
                mode: "virtual",
                rowRenderingMode: 'virtual',
                columnRenderingMode: 'virtual'
            },
            headerFilter: {
                visible: true
            },
            onContentReady: function (e) {
                if (!loadingBrowser) {
                    return;
                }
                loadingBrowser = false;

                return resolve(true);
            },
            onRowPrepared: function (e) {
                if (e.rowType !== "data") {
                    return;
                }

                if (e.data._Status.toLowerCase() === "new item") {
                    e.rowElement[0].style.backgroundColor = _this.DataChangeHighlightColors["new item"];
                }
                else if (e.data._Status.toLowerCase() === "deleted item") {
                    e.rowElement[0].style.backgroundColor = _this.DataChangeHighlightColors["deleted item"];
                }
                else if (e.data._Status.toLowerCase() === "changed property" ||
                    e.data._Status.toLowerCase() === "new property" ||
                    e.data._Status.toLowerCase() === "deleted property" ||
                    e.data._Status.toLowerCase() === "new/deleted property" ||
                    e.data._Status.toLowerCase() === "new/changed property" ||
                    e.data._Status.toLowerCase() === "deleted/changed property" ||
                    e.data._Status.toLowerCase() === "new/deleted/changed property") {
                    e.rowElement[0].cells[1].style.backgroundColor = _this.DataChangeHighlightColors["property change"];
                }
            },
            onCellPrepared: function (e) {
                if (e.rowType !== "data") {
                    return;
                }

                if ("changedProperties" in e.data &&
                    e.data["changedProperties"].length > 0 &&
                    e.data["changedProperties"].indexOf(e.column.dataField) !== -1) {
                    e.cellElement.css("background-color", _this.DataChangeHighlightColors["property change"]);
                }
                if ("deletedProperties" in e.data &&
                    e.data["deletedProperties"].length > 0 &&
                    e.data["deletedProperties"].indexOf(e.column.dataField) !== -1) {
                    e.cellElement.css("background-color", _this.DataChangeHighlightColors["deleted item"]);
                }
                if ("newProperties" in e.data &&
                    e.data["newProperties"].length > 0 &&
                    e.data["newProperties"].indexOf(e.column.dataField) !== -1) {
                    e.cellElement.css("background-color", _this.DataChangeHighlightColors["new item"]);
                }
            }
        });
    });
}

GroupView.prototype.OnReferenceClicked = function () {
    var title = model.views[this.Id].fileName;
    ReferenceManager.showReferenceDiv(title);
}

GroupView.prototype.OnGroupSelectClicked = function (rowKey, select) {
    var _this = this;

    // return new Promise((resolve) => {

    this.GroupViewGrid.expandRow(rowKey).then(function (refa) {
        var parentRowKey = rowKey;

        var groupProperties = _this.GetGroupTemplateProperties();
        if (groupProperties === null) {
            return;
        }

        if (parentRowKey.length === groupProperties.length) {
            if (parentRowKey in _this.GroupKeysVsDataItems) {
                if (select) {
                    _this.GroupViewGrid.selectRows(_this.GroupKeysVsDataItems[parentRowKey], true);
                }
                else {
                    _this.GroupViewGrid.deselectRows(_this.GroupKeysVsDataItems[parentRowKey]);
                }
            }

            // return  resolve(true);
        }
        else {

            var rows = _this.GroupViewGrid.getVisibleRows();
            if (!rows || rows.length === 0) {
                // return resolve(true);
                return;
            }

            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.rowType !== "group" ||
                    ((parentRowKey.length + 1) !== row.key.length)) {
                    continue;
                }

                var isChild = true;
                for (var j = 0; j < parentRowKey.length; j++) {
                    if (parentRowKey[j] !== row.key[j]) {
                        isChild = false;
                        break;
                    }
                }
                if (isChild) {
                    _this.OnGroupSelectClicked(row.key, select);
                }
            }

            // return resolve(true);
        }
    });
    // });
}

GroupView.prototype.AddGlobalSummary = function (e, summaryType, displayFormat) {
    var globalSummaryItems = e.component.option("summary.totalItems");

    var found = false;
    for (var i = 0; i < globalSummaryItems.length; i++) {
        var globalSummaryItem = globalSummaryItems[i];
        if (globalSummaryItem.column === e.column.dataField &&
            globalSummaryItem.summaryType === summaryType) {
            globalSummaryItems.splice(i, 1);
            found = true;
            break;
        }
    }

    if (found === false) {
        var summaryDefinition = {
            column: e.column.dataField,
            summaryType: summaryType,
            displayFormat: displayFormat,
            showInGroupFooter: true,
            alignByColumn: true
        };
        globalSummaryItems.push(summaryDefinition);
    }

    e.component.option("summary.totalItems", globalSummaryItems);
}

GroupView.prototype.AddGroupSummary = function (e, summaryType, displayFormat) {
    var groupSummaryItems = e.component.option("summary.groupItems");

    // check if summary already exists for column
    var found = false;
    for (var i = 0; i < groupSummaryItems.length; i++) {
        var groupSummaryItem = groupSummaryItems[i];
        if (groupSummaryItem.column === e.column.dataField &&
            groupSummaryItem.summaryType === summaryType) {
            groupSummaryItems.splice(i, 1);
            found = true;
            break;
        }
    }

    if (found === false) {
        var summaryDefinition = {
            column: e.column.dataField,
            summaryType: summaryType,
            displayFormat: displayFormat,
            showInGroupFooter: true,
            alignByColumn: true
        };

        groupSummaryItems.push(summaryDefinition);
    }

    e.component.option("summary.groupItems", groupSummaryItems);
}

GroupView.prototype.OnPropertyHighlightGroupSelectClicked = function (rowKey, select) {
    var _this = this;

    this.OpenGroup(rowKey).then(function (result) {

        for (var key in _this.GroupKeysVsDataItems) {
            var keyArray = key.split(",");

            if (keyArray.length < rowKey.length) {
                continue;
            }

            var groupFound = true;
            for (var i = 0; i < rowKey.length; i++) {
                if (keyArray[i] !== rowKey[i]) {
                    groupFound = false;
                    break;
                }
            }

            if (groupFound) {
                if (select) {
                    _this.GroupViewGrid.selectRows(_this.GroupKeysVsDataItems[key], true);
                }
                else {
                    _this.GroupViewGrid.deselectRows(_this.GroupKeysVsDataItems[key]);
                }
            }
        }
    });
}

GroupView.prototype.UpdateComponents = function (componentsData) {
    var needsUpdate = false;

    var sourceManager = SourceManagers[this.Id];
    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceManager.SourceType);
    var nameProperty = "";
    var categoryProperty = "";
    var classProperty = "";
    if (identifierProperties !== null) {
        nameProperty = identifierProperties.name.replace("Intrida Data/", "");
        categoryProperty = identifierProperties.mainCategory.replace("Intrida Data/", "");
        classProperty = identifierProperties.subClass.replace("Intrida Data/", "");
    }

    for (var id in componentsData) {
        var componentData = componentsData[id];

        // Update all components from this class
        if (id in this.Components) {
            var component = this.Components[id];
            if (componentData.name &&
                component.Name !== componentData.name) {
                component.Name = componentData.name;

                needsUpdate = true;
            }
            if (componentData.category) {
                component.MainComponentClass = componentData.category;

                needsUpdate = true;
            }
            if (componentData.componentClass) {
                component.SubComponentClass = componentData.componentClass;

                needsUpdate = true;
            }

            // if component is new component, then add properties from
            // allcomponents to new component being added.
            if (componentData["newComponent"] === true) {
                for (let i = 0; i < component.properties.length; i++) {
                    let prop = component.properties[i];
                    componentData.properties.push({
                        "property": prop.Name,
                        "value": prop.Value,
                        "action": "add",
                        "userdefined": "false"
                    });
                }
            }

            // add properties to components
            for (var i = 0; i < componentData.properties.length; i++) {
                var prop = componentData.properties[i];

                if (prop.action.toLowerCase() === "add" &&
                    prop["userdefined"] !== "false") {
                    var genericPropertyObject = new GenericProperty(prop.property, "String", prop.value, true);
                    component.addProperty(genericPropertyObject);
                }
                else if (prop.action.toLowerCase() === "remove") {
                    if (prop.property.toLowerCase() === categoryProperty.toLowerCase()) {
                        component.MainComponentClass = null;
                        needsUpdate = true;
                    }
                    if (prop.property.toLowerCase() === classProperty.toLowerCase()) {
                        component.SubComponentClass = null;
                        needsUpdate = true;
                    }

                    component.removeProperty(prop.property);
                }
                else if (prop.action.toLowerCase() === "update") {
                    if (prop.oldProperty.toLowerCase() === categoryProperty.toLowerCase()) {
                        if (prop.property.toLowerCase() !== categoryProperty.toLowerCase()) {
                            component.MainComponentClass = null;
                        }
                        else {
                            component.MainComponentClass = prop.value;
                        }

                        needsUpdate = true;
                    }
                    if (prop.oldProperty.toLowerCase() === classProperty.toLowerCase()) {
                        if (prop.property.toLowerCase() !== classProperty.toLowerCase()) {
                            component.SubComponentClass = null;
                        }
                        else {
                            component.SubComponentClass = prop.value;
                        }
                        needsUpdate = true;
                    }
                    component.updateProperty(prop.oldProperty, prop.property, prop.value)
                }
            }
        }

        // Update SourceProperty components from SCManager which are shown in modelbrowser        
        sourceManager.SourceProperties[id] = this.Components[id];
    }

    // Update Sourcemanagers all components as well
    if (sourceManager.Is3DSource()) {
        sourceManager.AllComponents = this.Components;
    }
}

// Select display tables 
function DisplayTablesForm(id) {
    this.Id = id;

    this.Active = false;
    this.DisplayTablesTagBox = null;
}

DisplayTablesForm.prototype.GetHtmlElementId = function () {
    return "selectDisplayTablesForm" + this.Id;
}

DisplayTablesForm.prototype.Open = function (allTables) {
    this.Active = true;

    var form = document.getElementById(this.GetHtmlElementId());
    form.style.display = "block";

    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(form,
        document.getElementById("selectDisplayTablesCaptionBar" + this.Id));

    this.Init(allTables);
}

DisplayTablesForm.prototype.Close = function () {
    this.Active = false;

    var form = document.getElementById(this.GetHtmlElementId());
    form.style.display = "none";

    this.DisplayTablesTagBox.reset();
}

DisplayTablesForm.prototype.Init = function (allTables) {
    var _this = this;

    this.DisplayTablesTagBox = $("#selectDisplayTablesTagBox" + this.Id).dxTagBox({
        items: allTables,
        searchEnabled: true,
        hideSelectedItems: true,
        placeholder: "Select Tables..."
    }).dxTagBox("instance");

    $("#DisplayTablesSelectAllCB" + this.Id).dxCheckBox({
        value: false,
        text: "Select All",
        onValueChanged: function (data) {
            if (data.value === true) {
                // _this.DisplayTablesTagBox.option("value", _this.DisplayTablesTagBox.getDataSource().items());
                _this.DisplayTablesTagBox.option("value", allTables);
            }
            else {
                _this.DisplayTablesTagBox.reset();
            }
        }
    });


    // Handle btns   
    document.getElementById("selectDisplayTablesCloseBtn" + this.Id).onclick = function () {
        _this.Close();
    }

    document.getElementById("selectDisplayTablesApplyBtn" + this.Id).onclick = function () {
        _this.OnApply();
    };

    if (model.views[model.currentTabId].groupView.DatabaseViewActive) {
        document.getElementById("closeDisplayBtn" + this.Id).style.display = "block";
        document.getElementById("closeDisplayBtn" + this.Id).onclick = function () {
            model.views[model.currentTabId].groupView.ShowDatabaseViewer(false);
            document.getElementById("closeDisplayBtn" + _this.Id).style.display = "none";
        };
    }
    else {
        document.getElementById("closeDisplayBtn" + this.Id).style.display = "none";
    }
}

DisplayTablesForm.prototype.OnApply = function () {
    let showTables = this.DisplayTablesTagBox.option("value");
    model.views[model.currentTabId].groupView.LoadDatabaseViewTabs(showTables);
    this.Close();
}
