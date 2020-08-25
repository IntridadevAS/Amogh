function GroupView(
    id,
    modelBrowserContainer,
    components,
    viewer) {
    // call super constructor
    ModelBrowser.call(this, id, modelBrowserContainer);

    this.Components = components;
    this.Webviewer = viewer;

    this.ExistingColumnNames = [];
    this.Headers = [];
    this.TableData = [];

    this.GroupedData = {};

    this.GroupViewTableInstance;
    this.GroupViewGrid = null;
    this.GroupViewTree = null;

    this.SelectedRows = {};
    this.HighlightedRow = {};

    this.KeyVsTableItems = {};
    this.NodeIdVsTableItems = {};
    this.GroupKeysVsDataItems = {};

    this.AvoidTableEvents = false;
    this.AvoidViewerEvents = false;

    var _this = this;
    this.ViewerCallbackMap = {
        selectionArray: function (selections) {
            if (model.views[_this.Id].activeTableView !== GlobalConstants.TableView.Group ||
                _this.AvoidViewerEvents) {
                return;
            }

            _this.OnSelectionFromViewer(selections);
        }
    };

    // this.GroupProperties;
    this.GroupTemplate;

    this.UndefinedHidden = false;

    this.ActiveGroupViewType = "Group";
    this.RowWiseColors = {};
    this.HighlightActive = false;

    // this is for datachange view tree list only
    this.RootNodeId = null;
    this.NodeIdVsParentNodeIds = {};

    this.DataChangeGroupViewActive = false;
    this.DatabaseViewActive = false;
    this.RevisionCheckResults = null;
    this.CurrentDataChangeTemplate = null;
    this.DataChangeHighlightColors = {
        "property change": "#f9ffc7",
        "new item": "#c9ffcf",
        "deleted item": "#fad9d7",
        "ga new item" : "#74B741",
        // "ga deleted item " : "#FF0000", // for now, we don't see any deleted item in ga so can't color
        "ga property change" : "#fff729"
    }
    this.DisplayTablesForm = null;
    this.ExcludeMembers = false;
    this.Flat = false;
}
// assign ModelBrowser's method to this class
GroupView.prototype = Object.create(ModelBrowser.prototype);
GroupView.prototype.constructor = GroupView;

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

    for (var nodeId in componentsData) {
        var componentData = componentsData[nodeId];

        // Update all components from this class
        if (nodeId in this.Components) {
            var component = this.Components[nodeId];
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
        sourceManager.SourceProperties[nodeId] = this.Components[nodeId];
    }

    // Sourcemanagers all components as well
    sourceManager.AllComponents = this.Components;
}

GroupView.prototype.Show = function () {
    this.Clear();

    document.getElementById("tableHeaderName" + this.Id).innerText = GlobalConstants.TableView.Group;
}

GroupView.prototype.GetGroupTemplateProperties = function () {
    if (this.GroupTemplate &&
        ("properties" in this.GroupTemplate)) {
        return this.GroupTemplate.properties;
    }

    return null;
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

GroupView.prototype.OnGroupTemplateChanged = function (groupName) {
    this.Clear();
    if (!groupName ||
        groupName.toLowerCase() === "clear") {
        return;
    }

    if (this.IsHighlightByPropertyView()) {
        if (!(groupName in model.propertyHighlightTemplates)) {
            return;
        }
        // this.GroupProperties = model.propertyHighlightTemplates[groupName].properties;
        this.GroupTemplate = model.propertyHighlightTemplates[groupName];
    }
    else if (this.IsPropertyGroupView()) {
        if (!(groupName in model.propertyGroups)) {
            return;
        }
        // this.GroupProperties = model.propertyGroups[groupName].properties;
        this.GroupTemplate = model.propertyGroups[groupName];
    }
    else if (this.IsDataChangeHighlightView()) {
        if (!(groupName in model.dataChangeHighlightTemplates)) {
            return;
        }

        // init display tables form
        this.DisplayTablesForm = new DisplayTablesForm(this.Id);

        this.LoadDataChangeView(model.dataChangeHighlightTemplates[groupName]);
        return;
    }

    this.ExistingColumnNames = [];
    this.Headers = [];
    var column = {};
    column["caption"] = "Item";
    column["dataField"] = "componentName";
    column["visible"] = true;
    column["showInColumnChooser"] = false;
    this.Headers.push(column);

    column = {};
    column["caption"] = "NodeId";
    column["dataField"] = "NodeId";
    column["visible"] = false;
    column["showInColumnChooser"] = false;
    this.Headers.push(column);

    // get table data
    this.TableData = [];
    this.GenerateTableDataForGroupByProperty();
    if (this.TableData === undefined ||
        this.TableData.length === 0) {
        return;
    }

    // Load table
    this.LoadTable();
}

GroupView.prototype.LoadDataChangeView = function (template) {
    if (!("source" in template) ||
        !("target" in template)) {
        return;
    }
    let _this = this;
    this.CurrentDataChangeTemplate = template;

    // check if types are correct
    let currentSourceType = SourceManagers[model.currentTabId].SourceType.toLowerCase();
    if (template["source"]["id"].toLowerCase() !== "current" &&
        template["source"]["dataSourceType"].toLowerCase() !== currentSourceType) {
        alert("Selected template is not compatible with active dataset.")
        return;
    }

    if (template["target"]["id"].toLowerCase() !== "current" &&
        template["target"]["dataSourceType"].toLowerCase() !== currentSourceType) {
        alert("Selected template is not compatible with active dataset.")
        return;
    }

    let components = {
        "source": null,
        "target": null
    };

    // Source revision
    let srcRevInfo = {};
    if (template["source"]["id"].toLowerCase() === "current") {
        srcRevInfo["revisionName"] = "Current";
        components["source"] = SourceManagers[model.currentTabId].AllComponents;
    }
    else {
        srcRevInfo["revisionName"] = template["source"]["name"];
        srcRevInfo["dataSourceType"] = template["source"]["dataSourceType"];
        srcRevInfo["dataSourceName"] = template["source"]["dataSourceName"];
    }

    // target revision
    let targetRevInfo = {};
    if (template["target"]["id"].toLowerCase() === "current") {
        targetRevInfo["revisionName"] = "Current";
        components["target"] = SourceManagers[model.currentTabId].AllComponents;
    }
    else {
        targetRevInfo["revisionName"] = template["target"]["name"];
        targetRevInfo["dataSourceType"] = template["target"]["dataSourceType"];
        targetRevInfo["dataSourceName"] = template["target"]["dataSourceName"];
    }

    // get options
    let options = null;
    if ("options" in template) {
        options = template["options"];
    }
    if (options === null) {
        return;
    }

    // check if target revision is recent or not
    let isTargetNewer = "true";
    let isTargetCurrent = false;
    if (targetRevInfo["revisionName"] === "Current") {
        isTargetNewer = "true";
        isTargetCurrent = true;
    }
    else if (srcRevInfo["revisionName"] === "Current") {
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

    showBusyIndicator();
    this.CheckRevisions(srcRevInfo, targetRevInfo, options, components, isTargetNewer).then(function (checkResults) {
        hideBusyIndicator();
        if (!checkResults) {
            return;
        }
        _this.RevisionCheckResults = checkResults;

        showBusyIndicator();
        let headers = _this.CreateDataChangeViewHeaders();
        let tableData = _this.GetDataChangeViewData(checkResults);
        hideBusyIndicator();

        _this.LoadDataChangeViewTable(headers, tableData, isTargetCurrent);
    });
}

GroupView.prototype.LoadDataChangeViewTable = function (headers, tableData, isTargetCurrent) {
    var _this = this;
    showBusyIndicator();
    this.DataChangeGroupViewActive = true;

    var loadingBrower = true;
    var containerDiv = "#" + _this.ModelBrowserContainer;

    let keyExpr = "NodeId";
    let parentIdExpr = "ParentNodeId";
    // if (this.Flat) {
    //     parentIdExpr = "notexistingproperty";
    // }

    $(function () {
        _this.GroupViewTree = $(containerDiv).dxTreeList({
            columns: headers,
            dataSource: tableData,
            // dataStructure: 'tree',
            keyExpr: keyExpr,
            parentIdExpr:parentIdExpr,
            rootValue: _this.RootNodeId,
            columnAutoWidth: true,
            columnResizingMode: 'widget',
            wordWrapEnabled: false,
            showBorders: true,
            showRowLines: true,
            height: "100%",
            width: "100%",
            allowColumnResizing: true,
            hoverStateEnabled: true,
            filterRow: {
                visible: true
            },
            scrolling: {
                mode: "standard"
            },
            selection: {
                mode: "multiple",
                recursive: true,
            },
            headerFilter: {
                visible: true
            },
            onContentReady: function (e) {
                if (loadingBrower === false) {
                    return;
                }
                loadingBrower = false;

                _this.ShowItemCount(e.component.getDataSource().totalCount());
                _this.ShowTargetName();

                hideBusyIndicator();
            },
            onInitialized: function (e) {
                model.views[_this.Id].tableViewInstance = e.component;
                model.views[_this.Id].tableViewWidget = "treelist";

                if (isTargetCurrent === true) {
                    // enable events                
                    _this.InitEvents();
                }
            },
            onSelectionChanged: function (e) {               
            },
            onRowClick: function (e) {
                if (e.rowType !== "data" ||
                    e.event.target.tagName.toLowerCase() === "span") {
                    return;
                }
                if (Object.keys(_this.HighlightedRow).length > 0) {
                    var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                    if (oldRowKey === e.key) {
                        return;
                    }

                    _this.UnHighlightRow();
                }

                _this.HighlightRow(e.key, e.data.NodeId, isTargetCurrent);
            },
            onRowPrepared: function (e) {
                if (e.rowType !== "data") {
                    return;
                }

                let color = null;
                if (e.data.Status.toLowerCase() === "new item") {
                    color = _this.DataChangeHighlightColors["new item"];
                }
                else if (e.data.Status.toLowerCase() === "deleted item") {
                    color = _this.DataChangeHighlightColors["deleted item"];
                }
                else if (e.data.Status.toLowerCase() === "changed property" ||
                    e.data.Status.toLowerCase() === "new property" ||
                    e.data.Status.toLowerCase() === "deleted property" ||
                    e.data.Status.toLowerCase() === "new/deleted property" ||
                    e.data.Status.toLowerCase() === "new/changed property" ||
                    e.data.Status.toLowerCase() === "deleted/changed property" ||
                    e.data.Status.toLowerCase() === "new/deleted/changed property") {
                    color = _this.DataChangeHighlightColors["property change"];
                }
                if (color) {
                    e.rowElement[0].cells[3].style.backgroundColor = color;
                    _this.RowWiseColors[e.key] = color;
                }
            },
            onContextMenuPreparing: function (e) {
                if (e.row.rowType === "header") {
                    e.items = [
                        {
                            text: _this.ExcludeMembers ? "Include Members" : "Exclude Members",
                            disabled: _this.Flat,
                            onItemClick: function () {
                                e.component.option("selection.recursive", _this.ExcludeMembers);
                                _this.ExcludeMembers = !_this.ExcludeMembers;                                
                            }
                        },
                        {
                            text: "Flat/Nested",
                            onItemClick: function () {
                                _this.Flat = !_this.Flat;
                                if (_this.Flat) {
                                    e.component.option("parentIdExpr", "notexistingproperty");
                                }
                                else {
                                    e.component.option("parentIdExpr", "ParentNodeId");
                                }
                            }
                        }
                    ];
                }
            },
            onDisposing: function (e) {
                // disable events
                _this.TerminateEvents();

                if (_this.HighlightActive) {
                    _this.ResetViewerColors();
                    // change icon of btn
                    document.getElementById("highlightSelectionBtn" + _this.Id).src = "public/symbols/Highlight Selection-Off.svg";
                }
                _this.HighlightActive = false;

                model.views[_this.Id].tableViewInstance = null;
                model.views[_this.Id].tableViewWidget = null;

                _this.Webviewer.selectionManager.clear();

                _this.GroupViewTree = null;

                _this.SelectedRows = {};
                _this.HighlightedRow = {};

                _this.NodeIdVsTableItems = {};
                _this.NodeIdVsParentNodeIds = {};

                _this.RowWiseColors = {};

                _this.ShowDatabaseViewer(false);
                _this.DataChangeGroupViewActive = false;

                _this.RevisionCheckResults = null;
                _this.CurrentDataChangeTemplate = null;

                _this.DisplayTablesForm = null;
                
                document.getElementById("revisionName" + _this.Id).innerText = "";

                _this.ExcludeMembers = false;
                _this.Flat = false;
            }
        }).dxTreeList("instance");
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

GroupView.prototype.GetDataChangeViewData = function (checkResults) {
    let tableData = [];
    for (let groupName in checkResults) {
        let group = checkResults[groupName];

        for (let i = 0; i < group.length; i++) {
            let item = group[i];

            let tableRowContent = {};
            tableRowContent["Status"] = item.status;

            let itemData = null;
            if ("target" in item) {
                itemData = item["target"];
            }
         
            if (itemData) {
                tableRowContent["Item"] = itemData.Name;
                tableRowContent["Category"] = (itemData.MainComponentClass ? itemData.MainComponentClass : "");
                tableRowContent["Class"] = (itemData.SubComponentClass ? itemData.SubComponentClass : "");
                tableRowContent["NodeId"] = (itemData.NodeId !== undefined ? Number(itemData.NodeId) : "");
                tableRowContent["ParentNodeId"] = ((itemData.ParentNodeId !== undefined && itemData.ParentNodeId !== null) ? Number(itemData.ParentNodeId) : -4);

                if (this.RootNodeId === null) {
                    this.RootNodeId = tableRowContent["ParentNodeId"]
                }
                else if (tableRowContent["ParentNodeId"] < this.RootNodeId) {
                    this.RootNodeId = tableRowContent["ParentNodeId"]
                }

                tableData.push(tableRowContent);

                // maintain NodeId Vs TableItems(rowkeys)
                this.NodeIdVsTableItems[tableRowContent["NodeId"]] = tableRowContent["NodeId"];

                // maintain NodeId Vs Parent NodeIds
                this.NodeIdVsParentNodeIds[tableRowContent["NodeId"]] = tableRowContent["ParentNodeId"];
            }
        }
    }

    // let items = Object.values(tableData);
    // for (var i = 0; i < items.length; i++) {
    //     let item = items[i];
    //     if (!(item.ParentNodeId in tableData)) {
    //         item.ParentNodeId = this.RootNodeId;
    //     }
    // }

    return tableData;
}

GroupView.prototype.CreateDataChangeViewHeaders = function () {
    var columnHeaders = [];

    let columnHeader = {};
    columnHeader["caption"] = "Item";
    columnHeader["dataField"] = "Item";
    columnHeader["width"] = "25%";
    columnHeader["visible"] = true;
    columnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["caption"] = "Category";
    columnHeader["dataField"] = "Category";
    columnHeader["width"] = "25%";
    columnHeader["visible"] = true;
    columnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["caption"] = "Class";
    columnHeader["dataField"] = "Class";
    columnHeader["width"] = "25%";
    columnHeader["visible"] = true;
    columnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["caption"] = "Status";
    columnHeader["dataField"] = "Status";
    columnHeader["width"] = "25%";
    columnHeader["visible"] = true;
    columnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["caption"] = "NodeId";
    columnHeader["dataField"] = "NodeId";
    columnHeader["visible"] = false;
    columnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["caption"] = "ParentNodeId";
    columnHeader["dataField"] = "ParentNodeId";
    columnHeader["visible"] = false;
    columnHeaders.push(columnHeader);

    return columnHeaders;
}

GroupView.prototype.CheckRevisions = function (
    srcRevisionInfo,
    targetRevisionInfo,
    options,
    components,
    isTargetNewer) {
    return new Promise((resolve) => {

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

GroupView.prototype.GenerateTableDataForGroupByProperty = function () {

    for (var nodeId in this.Components) {
        var component = this.Components[nodeId];

        var rowData = {};
        rowData["componentName"] = component.Name;
        rowData["NodeId"] = Number(component.NodeId);
        for (var i = 0; i < component.properties.length; i++) {
            var property = component.properties[i];

            var columnDataField = property.Name.replace(/\s/g, '');
            rowData[columnDataField] = property.Value;

            if (this.ExistingColumnNames.indexOf(property.Name) === -1 &&
                !this.IsPropertyInGroupProperties(property.Name)) {
                var column = {};
                column["caption"] = property.Name;
                column["dataField"] = columnDataField;

                column["visible"] = false;
                if (("visibleColumns" in this.GroupTemplate) &&
                    this.GroupTemplate.visibleColumns.indexOf(columnDataField) !== -1) {
                    column["visible"] = true;
                }

                this.Headers.push(column);
                this.ExistingColumnNames.push(property.Name)
            }
        }

        this.TableData.push(rowData);
    }
}

GroupView.prototype.IsPropertyInGroupProperties = function (property) {
    var groupProperties = this.GetGroupTemplateProperties();
    if (groupProperties === null) {
        return false;
    }

    if (this.IsHighlightByPropertyView()) {
        for (var i = 0; i < groupProperties.length; i++) {
            var groupProperty = groupProperties[i];
            if (groupProperty.Name == property) {
                return true;
            }
        }
    }
    else if (this.IsPropertyGroupView()) {
        if (groupProperties.indexOf(property) !== -1) {
            return true;
        }
    }
    else if (this.IsDataChangeHighlightView()) {
    }

    return false;
}

GroupView.prototype.LoadTable = function () {
    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;

    // this.Clear();

    var groupProperties = this.GetGroupTemplateProperties();
    if (!groupProperties ||
        groupProperties.length === 0) {
        return;
    }

    var filter = [];
    if (this.IsHighlightByPropertyView()) {

        filter = this.GetFilter();

        var currentGroupIndex = 0;
        for (var i = 0; i < groupProperties.length; i++) {
            var groupProperty = groupProperties[i];
            if (this.ExistingColumnNames.indexOf(groupProperty.Name) === -1) {
                column = {};
                column["caption"] = groupProperty.Name;

                var dataField = groupProperty.Name.replace(/\s/g, '');
                column["dataField"] = dataField;

                column["visible"] = false;
                if (("visibleColumns" in this.GroupTemplate) &&
                    this.GroupTemplate.visibleColumns.indexOf(dataField) !== -1) {
                    column["visible"] = true;
                }

                column["groupIndex"] = currentGroupIndex;
                this.Headers.push(column);

                if (!groupProperty.Operator ||
                    groupProperty.Operator.toLowerCase() === "and") {
                    currentGroupIndex = 1;
                }
                else {
                    currentGroupIndex++;
                }

                this.ExistingColumnNames.push(groupProperty.Name);
            }
        }
    }
    else if (this.IsPropertyGroupView()) {

        for (var i = 0; i < groupProperties.length; i++) {
            var groupProperty = groupProperties[i];

            if (this.ExistingColumnNames.indexOf(groupProperty) === -1) {

                column = {};
                column["caption"] = groupProperty;

                var dataField = groupProperty.replace(/\s/g, '');
                column["dataField"] = dataField;

                column["visible"] = false;
                if (("visibleColumns" in this.GroupTemplate) &&
                    this.GroupTemplate.visibleColumns.indexOf(dataField) !== -1) {
                    column["visible"] = true;
                }

                column["groupIndex"] = i;
                this.Headers.push(column);

                this.ExistingColumnNames.push(groupProperty);
            }
        }
    }

    // set value NULL to properties which donot belong to component
    for (var i = 0; i < this.TableData.length; i++) {
        var rowData = this.TableData[i];

        for (var j = 0; j < this.ExistingColumnNames.length; j++) {
            var columnField = this.ExistingColumnNames[j].replace(/\s/g, '');
            if (!(columnField in rowData)) {
                rowData[columnField] = "NULL";
            }
        }
    }

    var loadingBrowser = true;
    this.GroupViewGrid = $(containerDiv).dxDataGrid({
        columns: this.Headers,
        dataSource: this.TableData,
        keyExpr: "NodeId",
        height: "100%",
        width: "100%",
        columnAutoWidth: true,
        allowColumnResizing: true,
        columnResizingMode: 'widget',
        showBorders: true,
        showRowLines: true,
        paging: { enabled: false },
        grouping: {
            autoExpandAll: true,
        },
        groupPanel: {
            visible: false,
            allowColumnDragging: false
        },
        selection: {
            mode: "multiple",
            showCheckBoxesMode: "always",
        },
        scrolling: {
            mode: "standard",
            rowRenderingMode: 'standard'
        },
        filterRow: {
            visible: true
        },
        columnChooser: {
            enabled: false,
            allowSearch: true,
            mode: "select",
            title: "Property Columns",
        },
        summary: {
            groupItems: [{
                column: "componentName",
                summaryType: "count",
                displayFormat: "Count: {0}",
                alignByColumn: true
            }],
            totalItems: []
        },
        headerFilter: {
            visible: true
        },
        filterValue: filter,
        onContentReady: function (e) {
            if (!loadingBrowser) {
                return;
            }
            loadingBrowser = false;

            _this.CacheItems(e.component.getVisibleRows());

            _this.ShowItemCount(e.component.getDataSource().totalCount());            

            e.component.option("grouping.autoExpandAll", false);
        },
        onInitialized: function (e) {
            model.views[_this.Id].tableViewInstance = e.component;
            model.views[_this.Id].tableViewWidget = "datagrid";

            // enable events
            _this.InitEvents();
        },
        onSelectionChanged: function (e) {
            if (_this.AvoidTableEvents) {
                return;
            }

            // disable events
            _this.AvoidViewerEvents = true;

            if (e.currentSelectedRowKeys.length > 0) {
                for (var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                    // var rowKey = Number(e.currentSelectedRowKeys[i]);
                    var rowKey = e.currentSelectedRowKeys[i];
                    var rowIndex = e.component.getRowIndexByKey(rowKey);
                    if (rowIndex === -1) {
                        e.component.byKey(rowKey).done(function (dataObject) {
                            var nodeId = Number(dataObject.NodeId);
                            _this.SelectedRows[rowKey] = nodeId;
                            _this.Webviewer.selectionManager.selectNode(nodeId, Communicator.SelectionMode.Add);
                        });
                    }
                    else {
                        var visibleRows = e.component.getVisibleRows();
                        var nodeId = Number(visibleRows[rowIndex].data.NodeId);

                        _this.SelectedRows[rowKey] = nodeId;

                        _this.Webviewer.selectionManager.selectNode(nodeId, Communicator.SelectionMode.Add);
                    }
                }
            }
            else if (e.currentDeselectedRowKeys.length > 0) {
                // if (e.currentDeselectedRowKeys.length === e.component.getDataSource().totalCount()) {
                //     // expand all
                //     e.component.expandAll();

                for (var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                    // var rowKey = Number(e.currentDeselectedRowKeys[i]);
                    var rowKey = e.currentDeselectedRowKeys[i];

                    if (rowKey in _this.SelectedRows) {
                        delete _this.SelectedRows[rowKey];
                    }
                }
                //now manage selection in viewer
                _this.Webviewer.selectionManager.clear();
                for (var rowKey in _this.SelectedRows) {
                    _this.Webviewer.selectionManager.selectNode(Number(_this.SelectedRows[rowKey]),
                        Communicator.SelectionMode.Add);
                }
                // }
            }

            if (model.views[_this.Id].editUserPropertiesForm.Active) {
                model.views[_this.Id].editUserPropertiesForm.LoadData();
            }

            // enable events
            _this.AvoidViewerEvents = false;
        },
        onRowClick: function (e) {
            if (e.rowType !== "data") {
                return;
            }

            if (Object.keys(_this.HighlightedRow).length > 0) {
                var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                if (oldRowKey === e.key) {
                    return;
                }

                _this.UnHighlightRow();
            }

            _this.HighlightRow(e.key, e.data.NodeId);
        },
        onDisposing: function (e) {
            // save table view
            _this.SaveTableView();

            // disable events
            _this.TerminateEvents();

            model.views[_this.Id].tableViewInstance = null;
            model.views[_this.Id].tableViewWidget = null;

            _this.Webviewer.selectionManager.clear();

            _this.GroupViewGrid = null;

            _this.SelectedRows = {};
            _this.HighlightedRow = {};

            _this.KeyVsTableItems = {};
            _this.NodeIdVsTableItems = {};
            _this.GroupKeysVsDataItems = {};

            _this.UndefinedHidden = false;
            _this.RowWiseColors = {};

            if (_this.HighlightActive) {
                _this.ResetViewerColors();
                // change icon of btn
                document.getElementById("highlightSelectionBtn" + _this.Id).src = "public/symbols/Highlight Selection-Off.svg";
            }
            _this.HighlightActive = false;

            _this.ExistingColumnNames = [];
        },
        onRowPrepared: function (e) {
            if (e.rowType == "group") {
                var rowElement = e.rowElement[0];

                for (var i = 0; i < e.rowElement[0].children.length; i++) {
                    var childElement = e.rowElement[0].children[i];
                    if (childElement.classList.contains("dx-group-cell")) {
                        var resultArray = childElement.innerText.split(":");
                        if (resultArray.length >= 2) {

                            var resArray = resultArray[1].split("(");

                            var displayText = null;
                            if (resArray[0].trim() === "") {
                                var displayText = resultArray[0] + ": UNASSIGNED";
                            }
                            else if (resArray[0].trim() === "NULL") {
                                var displayText = resultArray[0] + ": UNDEFINED";
                            }
                            if (displayText !== null) {
                                if (resultArray.length >= 3) {
                                    displayText += "(Count:" + resultArray[2];
                                }
                                childElement.innerText = displayText;
                            }
                        }
                    }
                }
            }
            else if (e.rowType === "data") {
                if (SourceManagers[_this.Id].HiddenNodeIds.includes(Number(e.data.NodeId))) {
                    var selectedRows = [e.rowElement[0]];
                    _this.HighlightHiddenRows(true, selectedRows);
                }

                // set row colors
                if (e.key in _this.RowWiseColors) {
                    e.rowElement[0].cells[0].style.backgroundColor = _this.RowWiseColors[e.key];
                }
            }
        },
        onContextMenuPreparing: function (e) {
            if (e.row.rowType === "data") {
                e.items = [
                    {
                        text: "Hide",
                        onItemClick: function () {
                            _this.OnHideClicked();
                        }
                    },
                    {
                        text: "Isolate",
                        onItemClick: function () {
                            _this.OnIsolateClicked();
                        }
                    },
                    {
                        text: "Show",
                        onItemClick: function () {
                            _this.OnShowClicked();
                        }
                    },
                    {
                        text: "Reference",
                        onItemClick: function () {
                            _this.OnReferenceClicked();
                        }
                    },
                ]
            }
            else if (e.row.rowType === "group") {
                e.items = [{
                    text: "Select All",
                    onItemClick: function () {
                        if (_this.IsHighlightByPropertyView()) {
                            _this.OnPropertyHighlightGroupSelectClicked(e.row.key, true);
                        }
                        else if (_this.IsPropertyGroupView()) {
                            _this.OnGroupSelectClicked(e.row.key, true);
                        }
                        else if (_this.IsDataChangeHighlightView()) {
                        }
                    }
                },
                {
                    text: "DeSelect All",
                    onItemClick: function () {
                        if (_this.IsHighlightByPropertyView()) {
                            _this.OnPropertyHighlightGroupSelectClicked(e.row.key, false);
                        }
                        else if (_this.IsPropertyGroupView()) {
                            _this.OnGroupSelectClicked(e.row.key, false);
                        }
                        else if (_this.IsDataChangeHighlightView()) {
                        }
                    }
                },
                {
                    text: "Hide",
                    onItemClick: function () {
                        if (_this.IsHighlightByPropertyView()) {
                            _this.OnPropertyHighlightGroupShowClicked(e.row.key, false);
                        }
                        else if (_this.IsPropertyGroupView()) {
                            _this.OnGroupShowClicked(e.row.key, false);
                        }
                        else if (_this.IsDataChangeHighlightView()) {
                        }
                    }
                },
                {
                    text: "Isolate",
                    onItemClick: function () {
                        model.views[_this.Id].isolateManager.IsolatedNodes = [];
                        if (_this.IsHighlightByPropertyView()) {
                            _this.OnPropertyHighlightGroupIsolateClicked(e.row.key);
                        }
                        else if (_this.IsPropertyGroupView()) {
                            _this.OnGroupIsolateClicked(e.row.key);
                        }
                        else if (_this.IsDataChangeHighlightView()) {
                        }
                    }
                },
                {
                    text: "Show",
                    onItemClick: function () {
                        if (_this.IsHighlightByPropertyView()) {
                            _this.OnPropertyHighlightGroupShowClicked(e.row.key, true);
                        }
                        else if (_this.IsPropertyGroupView()) {
                            _this.OnGroupShowClicked(e.row.key, true);
                        }
                        else if (_this.IsDataChangeHighlightView()) {
                        }
                    }
                },
                ]
            }
            else if (e.row.rowType === "header") {
                e.items = [
                    {
                        text: "Edit Columns",
                        onItemClick: function () {
                            e.component.showColumnChooser();
                        }
                    },
                    {
                        text: _this.UndefinedHidden ? "Show Undefined" : "Hide Undefined",
                        disabled: (_this.IsHighlightByPropertyView() || _this.IsDataChangeHighlightView()),
                        onItemClick: function () {

                            if (!_this.UndefinedHidden) {
                                var filterValue = [];
                                for (var i = 0; i < _this.GroupTemplate.properties.length; i++) {
                                    filterValue.push(["!", [_this.GroupTemplate.properties[i], "=", "NULL"]]);
                                    if (i < (_this.GroupTemplate.properties.length - 1)) {
                                        filterValue.push("and");
                                    }
                                }
                                if (filterValue.length > 0) {
                                    e.component.filter(filterValue);
                                }
                            }
                            else {
                                e.component.clearFilter();
                            }

                            _this.UndefinedHidden = !_this.UndefinedHidden;
                        }
                    },
                    {
                        text: "Summary",
                        items: [
                            {
                                text: "Sum",
                                onItemClick: function () {

                                    _this.AddGroupSummary(e, "sum", "Total: {0}");
                                    _this.AddGlobalSummary(e, "sum", "Total: {0}");
                                }
                            },
                            {
                                text: "Count",
                                onItemClick: function () {
                                    _this.AddGroupSummary(e, "count", "Count: {0}");
                                    _this.AddGlobalSummary(e, "count", "Count: {0}");
                                }
                            },
                            {
                                text: "Max",
                                disabled: true,
                                onItemClick: function () {
                                    _this.AddGroupSummary(e, "max", "Max: {0}");
                                    _this.AddGlobalSummary(e, "max", "Max: {0}");
                                }
                            },
                            {
                                text: "Min",
                                onItemClick: function () {
                                    _this.AddGroupSummary(e, "min", "Min: {0}");
                                    _this.AddGlobalSummary(e, "min", "Min: {0}");
                                }
                            },
                            {
                                text: "Avg",
                                onItemClick: function () {
                                    _this.AddGroupSummary(e, "avg", "Avg: {0}");
                                    _this.AddGlobalSummary(e, "avg", "Avg: {0}");
                                }
                            }
                        ],
                        onItemClick: function () {

                        }
                    }]
            }
        }
    }).dxDataGrid("instance");
}

GroupView.prototype.HighlightRow = function (rowKey, nodeId, highlightInGA = true) {

    this.HighlightedRow[rowKey] = Number(nodeId);

    let rowElement = null;
    if (this.IsDataChangeHighlightView()) {
        let rowIndex = this.GroupViewTree.getRowIndexByKey(rowKey);
        rowElement = this.GroupViewTree.getRowElement(rowIndex)[0];
    }
    else {
        let rowIndex = this.GroupViewGrid.getRowIndexByKey(rowKey);
        rowElement = this.GroupViewGrid.getRowElement(rowIndex)[0];
    }
    this.SetRowColor(rowElement, GlobalConstants.TableRowHighlightedColor);

    // disable events
    this.AvoidViewerEvents = true;

    if (highlightInGA === true) {
        if (!(rowKey in this.SelectedRows)) {

            //now manage selection in viewer
            this.Webviewer.selectionManager.clear();
            for (var rowKey in this.SelectedRows) {
                this.Webviewer.selectionManager.selectNode(
                    Number(this.SelectedRows[rowKey]),
                    Communicator.SelectionMode.Add);
            }

            this.Webviewer.selectionManager.selectNode(
                Number(nodeId),
                Communicator.SelectionMode.Add);
        }
        this.Webviewer.view.fitNodes([Number(nodeId)]);
    }

    // property callout                
    if (nodeId in this.Components) {
        SourceManagers[this.Id].OpenPropertyCallout(this.Components[nodeId].Name, nodeId);
    }

    // enable events
    this.AvoidViewerEvents = false;
}

GroupView.prototype.UnHighlightRow = function () {
    var oldRowKey = Number(Object.keys(this.HighlightedRow)[0]);

    let rowElement = null;
    if (this.IsDataChangeHighlightView()) {
        let rowIndex = this.GroupViewTree.getRowIndexByKey(oldRowKey);
        rowElement = this.GroupViewTree.getRowElement(rowIndex)[0];
    }
    else {
        let rowIndex = this.GroupViewGrid.getRowIndexByKey(oldRowKey);
        rowElement = this.GroupViewGrid.getRowElement(rowIndex)[0];
    }
    this.SetRowColor(rowElement, GlobalConstants.TableRowNormalColor);

    if (this.HighlightActive &&
        (oldRowKey in this.RowWiseColors)) {

        let cell;
        if (this.IsDataChangeHighlightView()) {
            cell = rowElement.cells[3];
        }
        else {
            cell = rowElement.cells[0];
        }
        cell.style.backgroundColor = this.RowWiseColors[oldRowKey];
    }

    delete this.HighlightedRow[oldRowKey];
}

GroupView.prototype.OnReferenceClicked = function () {
    var title = model.views[this.Id].fileName;
    ReferenceManager.showReferenceDiv(title);
}

GroupView.prototype.SaveTableView = function () {
    if (!this.GroupViewGrid ||
        !this.GroupTemplate) {
        return;
    }

    this.GroupTemplate['visibleColumns'] = [];
    var columns = this.GroupViewGrid.getVisibleColumns();
    for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        if (column.type === "selection" ||
            column.type === "groupExpand" ||
            (("dataField" in column) && column.dataField.toLowerCase() === "componentname")) {
            continue;
        }

        this.GroupTemplate['visibleColumns'].push(column.dataField);
    }
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

GroupView.prototype.CacheItems = function (rows) {
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];

        if (row.rowType === "group") {
            this.KeyVsTableItems[row.key] = {
                "rowType": "group",
                "groupIndex": row.groupIndex,
                "values": row.values
            };
        }
        else if (row.rowType === "data") {
            this.NodeIdVsTableItems[row.data.NodeId] = row.key;
            this.KeyVsTableItems[row.key] = {
                "item": row.data.componentName,
                "nodeId": row.data.NodeId
            };

            var groupProperties = this.GetGroupTemplateProperties();
            if (groupProperties === null) {
                continue;
            }
            if (this.IsHighlightByPropertyView()) {

                var traversedGroupProperties = [];
                var groupKey = [];
                for (var j = 0; j < groupProperties.length; j++) {
                    var groupProperty = groupProperties[j];

                    var groupPropertyField = groupProperty.Name.replace(/\s/g, '');
                    if (traversedGroupProperties.indexOf(groupPropertyField) === -1) {
                        traversedGroupProperties.push(groupPropertyField);

                        if (groupPropertyField in row.data) {
                            groupKey.push(row.data[groupPropertyField]);
                        }
                        else {
                            groupKey.push("");
                        }

                        this.KeyVsTableItems[row.key][groupPropertyField] = groupKey[groupKey.length - 1];
                    }
                }

                if (!(groupKey in this.GroupKeysVsDataItems)) {
                    this.GroupKeysVsDataItems[groupKey] = [];
                }
                this.GroupKeysVsDataItems[groupKey].push(row.key);
            }
            else if (this.IsPropertyGroupView()) {
                var groupKey = [];
                for (var j = 0; j < groupProperties.length; j++) {
                    var groupPropertyField = groupProperties[j].replace(/\s/g, '');
                    this.KeyVsTableItems[row.key][groupPropertyField] = row.data[groupProperties[j]];
                    groupKey.push(row.data[groupPropertyField]);
                }

                if (!(groupKey in this.GroupKeysVsDataItems)) {
                    this.GroupKeysVsDataItems[groupKey] = [];
                }
                this.GroupKeysVsDataItems[groupKey].push(row.key);
            }
            else if (this.IsPropertyGroupView()) {
            }
        }
    }
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

GroupView.prototype.InitEvents = function () {
    this.Webviewer.setCallbacks(this.ViewerCallbackMap);
}

GroupView.prototype.TerminateEvents = function () {
    this.Webviewer.unsetCallbacks(this.ViewerCallbackMap);
}

GroupView.prototype.HighlightHiddenRows = function (isHide, selectedRows) {

    for (var i = 0; i < selectedRows.length; i++) {
        var selectedRow = selectedRows[i];

        for (var j = 0; j < selectedRow.cells.length; j++) {
            var cell = selectedRow.cells[j];
            if (isHide) {
                cell.style.color = "#b3b5b5";
            }
            else {
                cell.style.color = "black";
            }
        }
    }
}

GroupView.prototype.HighlightHiddenRowsFromNodeIds = function (isHide, nodeIds) {
    // var selectedNodeIds =  this.GetSelectedNodes();
    var selectedRows = this.GetSelectedRowsFromNodeIds(nodeIds);
    this.HighlightHiddenRows(isHide, selectedRows);
}

GroupView.prototype.GetSelectedRowsFromNodeIds = function (selectedNodeIds) {
    var selectedRows = [];

    for (var i = 0; i < selectedNodeIds.length; i++) {
        var nodeId = Number(selectedNodeIds[i]);
        if (!(nodeId in this.NodeIdVsTableItems)) {
            continue;
        }
        var rowKey = this.NodeIdVsTableItems[nodeId];
        var rowIndex = this.GroupViewGrid.getRowIndexByKey(rowKey);

        if (rowIndex !== -1) {
            var row = this.GroupViewGrid.getRowElement(rowIndex);
            selectedRows.push(row[0]);
        }
    }

    return selectedRows;
}

GroupView.prototype.ShowAllHiddenRows = function () {
    var sourceManager = SourceManagers[this.Id];
    this.HighlightHiddenRowsFromNodeIds(false, sourceManager.HiddenNodeIds)

    sourceManager.HiddenNodeIds = [];
}


GroupView.prototype.GetSelectedNodeIds = function () {
    return Object.values(this.SelectedRows);
}

GroupView.prototype.GetSelectedComponents = function () {
    var selectedNodeIds = this.GetSelectedNodes();

    var selected = {};
    for (var i = 0; i < selectedNodeIds.length; i++) {
        var nodeId = selectedNodeIds[i];
        selected[nodeId] = this.Components[nodeId];
    }

    return selected;
}

GroupView.prototype.GetSelectedComponentIds = function () {
    var nodeIds = this.GetSelectedNodeIds();
    var selectedCompIds = [];

    var sourceManager = SourceManagers[this.Id];
    for (var i = 0; i < nodeIds.length; i++) {
        var nodeId = nodeIds[i];

        selectedCompIds.push(sourceManager.GetCompIdByNodeId(nodeId));
    }

    return selectedCompIds;
}

GroupView.prototype.SetRowColor = function (row, color) {
    row.style.backgroundColor = color;
}

GroupView.prototype.OnSelectionFromViewer = function (selections) {
    for (var i = 0; i < selections.length; i++) {
        var selection = selections[i];
        var sel = selection.getSelection();

        var selectedNodeId = sel.getNodeId();

        if (!(selectedNodeId in this.NodeIdVsTableItems)) {

            // disable events
            this.AvoidViewerEvents = true;

            // reset selection in viewer
            this.Webviewer.selectionManager.clear();
            for (var rowKey in this.SelectedRows) {
                this.Webviewer.selectionManager.selectNode(Number(this.SelectedRows[rowKey]),
                    Communicator.SelectionMode.Add);
            }

            selectedNodeId = this.SelectValidNode(selectedNodeId);

            // enable events again
            this.AvoidViewerEvents = false;

            if (selectedNodeId === null ||
                !(selectedNodeId in this.NodeIdVsTableItems)) {
                continue;
            }
        }

        var rowKey = this.NodeIdVsTableItems[selectedNodeId];
        this.GoToRow(rowKey, selectedNodeId);
    }
}

GroupView.prototype.SelectValidNode = function (nodeId) {
    nodeId = this.Webviewer.model.getNodeParent(nodeId);
    if (nodeId === null) {
        return null;
    }

    if (nodeId in this.NodeIdVsTableItems) {
        // disable events
        this.AvoidViewerEvents = true;

        this.Webviewer.selectionManager.selectNode(nodeId, Communicator.SelectionMode.Add);

        // enable events
        this.AvoidViewerEvents = false;

        return nodeId;
    }

    return this.SelectValidNode(nodeId);
}

GroupView.prototype.GoToRow = function (rowKey, nodeId) {
    var _this = this;

    var rowData = _this.KeyVsTableItems[rowKey];

    // expand group
    if (this.IsHighlightByPropertyView()) {
        for (var key in this.GroupKeysVsDataItems) {
            if (this.GroupKeysVsDataItems[key].indexOf(rowKey) !== -1) {
                this.OpenGroup(key.split(",")).then(function (result) {

                    // highlight row                   
                    if (Object.keys(_this.HighlightedRow).length > 0) {
                        var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                        if (oldRowKey === rowKey) {
                            return;
                        }

                        _this.UnHighlightRow();
                    }

                    _this.HighlightRow(rowKey, nodeId);
                    _this.GroupViewGrid.navigateToRow(rowKey);
                });
            }
        }
    }
    else if (this.IsPropertyGroupView()) {
        var groupProperties = _this.GetGroupTemplateProperties();
        if (groupProperties === null) {
            return;
        }

        var groupKeys = [];
        for (var i = 0; i < groupProperties.length; i++) {
            var prop = groupProperties[i]
            if (prop in rowData) {
                var propValue = rowData[prop];
                if (!propValue) {
                    propValue = "";
                }

                if (i === 0 && (propValue in _this.KeyVsTableItems)) {
                    groupKeys.push(_this.KeyVsTableItems[propValue].values);
                }
                else {
                    groupKeys.push(_this.KeyVsTableItems[groupKeys[i - 1] + "," + propValue].values);
                }
            }
        }

        for (var i = 0; i < groupKeys.length; i++) {
            var key = groupKeys[i];

            if (!_this.GroupViewGrid.isRowExpanded(key)) {
                _this.GroupViewGrid.expandRow(key).then(function (res) {
                    // highlight row                   
                    if (Object.keys(_this.HighlightedRow).length > 0) {
                        var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                        if (oldRowKey === rowKey) {
                            return;
                        }

                        _this.UnHighlightRow();
                    }

                    _this.HighlightRow(rowKey, nodeId);
                    _this.GroupViewGrid.navigateToRow(rowKey);
                });
            }
            else {
                if (i === groupKeys.length - 1) {
                    // highlight row                   
                    if (Object.keys(_this.HighlightedRow).length > 0) {
                        var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                        if (oldRowKey === rowKey) {
                            return;
                        }

                        _this.UnHighlightRow();
                    }

                    _this.HighlightRow(rowKey, nodeId);
                    _this.GroupViewGrid.navigateToRow(rowKey);
                }
            }
        }
    }
    else if (this.IsDataChangeHighlightView()) {

        if (nodeId in _this.NodeIdVsParentNodeIds) {
            let path = [nodeId];
            let parent = _this.NodeIdVsParentNodeIds[nodeId];
            while (parent !== null) {
                path.push(parent);

                if (parent in _this.NodeIdVsParentNodeIds) {
                    parent = _this.NodeIdVsParentNodeIds[parent];
                }
                else {
                    parent = null;
                }
            }
            path = path.reverse();

            for (var i = 0; i < path.length; i++) {
                let key = path[i];

                if (!_this.GroupViewTree.isRowExpanded(key)) {
                    _this.GroupViewTree.expandRow(key).then(function (res) {
                        // highlight row                   
                        if (Object.keys(_this.HighlightedRow).length > 0) {
                            var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                            if (oldRowKey === rowKey) {
                                return;
                            }

                            _this.UnHighlightRow();
                        }

                        _this.HighlightRow(rowKey, nodeId);
                        _this.GroupViewTree.navigateToRow(rowKey);
                    });
                }
                else {
                    if (i === path.length - 1) {
                        // highlight row                   
                        if (Object.keys(_this.HighlightedRow).length > 0) {
                            var oldRowKey = Number(Object.keys(_this.HighlightedRow)[0]);
                            if (oldRowKey === rowKey) {
                                return;
                            }

                            _this.UnHighlightRow();
                        }

                        _this.HighlightRow(rowKey, nodeId);
                        _this.GroupViewTree.navigateToRow(rowKey);
                    }
                }
            }
        }
    }
}

GroupView.prototype.SelectRow = function (rowKey) {
    var _this = this;

    if (!_this.GroupViewGrid.isRowSelected(rowKey)) {
        _this.AvoidTableEvents = true;
        _this.GroupViewGrid.selectRows([rowKey], true).then(function () {
            _this.GroupViewGrid.navigateToRow(rowKey);
            _this.AvoidTableEvents = false;
        });

        var rowData = _this.KeyVsTableItems[rowKey];
        _this.SelectedRows[rowKey] = rowData.nodeId;
    }

    // _this.GroupViewGrid.navigateToRow(rowKey);
}

GroupView.prototype.GetSelectedNodes = function () {
    var selectedNodes = [];
    for (var rowKey in this.SelectedRows) {
        selectedNodes.push(Number(this.SelectedRows[rowKey]));
    }

    return selectedNodes;
}

GroupView.prototype.OpenGroup = function (rowKey) {
    var _this = this;

    return new Promise((resolve) => {
        var allPromises = []
        for (var key in this.GroupKeysVsDataItems) {
            var keyArray = key.split(",");
            if (keyArray.length < rowKey.length) {
                continue;
            }

            var expand = true;
            for (var i = 0; i < rowKey.length; i++) {
                if (keyArray[i] !== rowKey[i]) {
                    expand = false;
                    break;
                }
            }

            if (expand) {
                for (var i = 0; i < keyArray.length; i++) {
                    // if (!this.GroupViewGrid.isRowExpanded(keyArray.slice(0, i + 1))) {
                    this.GroupViewGrid.expandRow(keyArray.slice(0, i + 1)).then(function (result) {
                        return resolve(result);
                    });
                    // }
                }
            }
        }
    });
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

GroupView.prototype.OnPropertyHighlightGroupShowClicked = function (rowKey, show) {
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
                var dataRowKeys = _this.GroupKeysVsDataItems[key];
                var nodeIds = [];
                for (var i = 0; i < dataRowKeys.length; i++) {
                    if ("nodeId" in _this.KeyVsTableItems[dataRowKeys[i]]) {
                        nodeIds.push(Number(_this.KeyVsTableItems[dataRowKeys[i]].nodeId));
                    }
                }
                _this.SetNodesVisibility(nodeIds, show);

                // Handle hidden elements nodeIds list 
                SourceManagers[_this.Id].HandleHiddenNodeIdsList(!show, nodeIds);

                //Grey out the text of hidden element rows
                _this.HighlightHiddenRowsFromNodeIds(!show, nodeIds);
            }
        }
    });
}

GroupView.prototype.OnPropertyHighlightGroupIsolateClicked = function (rowKey) {
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
                var dataRowKeys = _this.GroupKeysVsDataItems[key];
                var nodeIds = [];
                for (var i = 0; i < dataRowKeys.length; i++) {
                    if ("nodeId" in _this.KeyVsTableItems[dataRowKeys[i]]) {
                        nodeIds.push(Number(_this.KeyVsTableItems[dataRowKeys[i]].nodeId));
                    }
                }
                _this.IsolateNodes(nodeIds, true);
            }
        }
    });
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

GroupView.prototype.OnGroupShowClicked = function (rowKey, show) {
    var _this = this;

    this.GroupViewGrid.expandRow(rowKey).then(function (refa) {
        var parentRowKey = rowKey;

        var groupProperties = _this.GetGroupTemplateProperties();
        if (groupProperties === null) {
            return;
        }
        if (parentRowKey.length === groupProperties.length) {
            if (parentRowKey in _this.GroupKeysVsDataItems) {

                var dataRowKeys = _this.GroupKeysVsDataItems[parentRowKey];
                var nodeIds = [];
                for (var i = 0; i < dataRowKeys.length; i++) {
                    if ("nodeId" in _this.KeyVsTableItems[dataRowKeys[i]]) {
                        nodeIds.push(Number(_this.KeyVsTableItems[dataRowKeys[i]].nodeId));
                    }
                }
                _this.SetNodesVisibility(nodeIds, show);

                // Handle hidden elements nodeIds list 
                SourceManagers[_this.Id].HandleHiddenNodeIdsList(!show, nodeIds);

                //Grey out the text of hidden element rows
                _this.HighlightHiddenRowsFromNodeIds(!show, nodeIds);
            }

        }
        else {

            var rows = _this.GroupViewGrid.getVisibleRows();
            if (!rows || rows.length === 0) {
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
                    _this.OnGroupShowClicked(row.key, show);
                }
            }
        }
    });
}

GroupView.prototype.OnGroupIsolateClicked = function (rowKey) {
    var _this = this;

    this.GroupViewGrid.expandRow(rowKey).then(function (refa) {
        var parentRowKey = rowKey;

        var groupProperties = _this.GetGroupTemplateProperties();
        if (groupProperties === null) {
            return;
        }
        if (parentRowKey.length === groupProperties.length) {
            if (parentRowKey in _this.GroupKeysVsDataItems) {

                var dataRowKeys = _this.GroupKeysVsDataItems[parentRowKey];
                var nodeIds = [];
                for (var i = 0; i < dataRowKeys.length; i++) {
                    if ("nodeId" in _this.KeyVsTableItems[dataRowKeys[i]]) {
                        nodeIds.push(Number(_this.KeyVsTableItems[dataRowKeys[i]].nodeId));
                    }
                }
                _this.IsolateNodes(nodeIds, true);
            }
        }
        else {
            var rows = _this.GroupViewGrid.getVisibleRows();
            if (!rows || rows.length === 0) {
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
                    _this.OnGroupIsolateClicked(row.key);
                }
            }
        }
    });
}

GroupView.prototype.OnHideClicked = function () {
    if (!this.Webviewer) {
        return;
    }

    var selectedNodeIds = this.GetSelectedNodes();
    if (!selectedNodeIds ||
        selectedNodeIds.length === 0) {
        return;
    }

    this.SetNodesVisibility(selectedNodeIds, false);

    // Handle hidden elements nodeIds list 
    SourceManagers[this.Id].HandleHiddenNodeIdsList(true, selectedNodeIds);

    //Grey out the text of hidden element rows
    this.HighlightHiddenRowsFromNodeIds(true, selectedNodeIds);
}

GroupView.prototype.OnIsolateClicked = function () {
    if (!this.Webviewer) {
        return;
    }

    var selectedNodeIds = this.GetSelectedNodes();
    if (!selectedNodeIds ||
        selectedNodeIds.length === 0) {
        return;
    }

    this.IsolateNodes(selectedNodeIds, false);
}

GroupView.prototype.IsolateNodes = function (selectedNodeIds, add) {
    // perform isolate      
    model.views[this.Id].isolateManager.Isolate(selectedNodeIds, add).then(function (affectedNodes) {

    });

    // maintain hidden elements
    // if (model.currentTabId in SourceManagers) {
    var sourceManager = SourceManagers[this.Id];
    sourceManager.HiddenNodeIds = [];

    var allNodeIds = Object.keys(this.NodeIdVsTableItems);
    for (var i = 0; i < Object.keys(allNodeIds).length; i++) {
        var nodeId = Number(allNodeIds[i]);
        if (!selectedNodeIds.includes(nodeId)) {
            sourceManager.HiddenNodeIds.push(nodeId);
        }
    }

    //Grey out the text of hidden element rows
    this.HighlightHiddenRowsFromNodeIds(true, sourceManager.HiddenNodeIds);

    // unhighlight the hidden rows made visible
    this.HighlightHiddenRowsFromNodeIds(false, model.views[this.Id].isolateManager.IsolatedNodes);
}

GroupView.prototype.OnShowClicked = function () {
    if (!this.Webviewer) {
        return;
    }

    var selectedNodeIds = this.GetSelectedNodes();
    if (!selectedNodeIds ||
        selectedNodeIds.length === 0) {
        return;
    }

    this.SetNodesVisibility(selectedNodeIds, true);

    // Handle hidden elements nodeIds list 
    SourceManagers[this.Id].HandleHiddenNodeIdsList(false, selectedNodeIds);

    //Grey out the text of hidden element rows
    this.HighlightHiddenRowsFromNodeIds(false, selectedNodeIds);
}

GroupView.prototype.SetNodesVisibility = function (nodeIds, visible) {
    var map = {};
    for (var i = 0; i < nodeIds.length; i++) {
        var nodeId = nodeIds[i];
        map[nodeId] = visible;
    }

    this.Webviewer.model.setNodesVisibilities(map);
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

GroupView.prototype.ResetViewerColors = function () {
    this.Webviewer.model.resetNodesColor(this.Webviewer.model.getAbsoluteRootNode());
}

GroupView.prototype.Highlight = function () {
    this.GroupViewGrid.expandAll();

    for (var groupKey in this.GroupKeysVsDataItems) {
        var color = this.GetGroupColor(groupKey);
        if (!color) {
            continue;
        }

        for (var i = 0; i < this.GroupKeysVsDataItems[groupKey].length; i++) {
            var rowKey = this.GroupKeysVsDataItems[groupKey][i];
            var rowIndex = this.GroupViewGrid.getRowIndexByKey(rowKey);
            var rowElement = this.GroupViewGrid.getRowElement(rowIndex)[0];

            rowElement.cells[0].style.backgroundColor = color;

            this.RowWiseColors[rowKey] = color;

            // set nodes face and line colors from status of compoentns
            var nodeId = Number(this.KeyVsTableItems[rowKey].nodeId);

            var rgbColor = xCheckStudio.Util.hexToRgb(color);
            var communicatorColor = new Communicator.Color(rgbColor.r, rgbColor.g, rgbColor.b);
            this.Webviewer.model.setNodesFaceColor([nodeId], communicatorColor);
            this.Webviewer.model.setNodesLineColor([nodeId], communicatorColor);
        }
    }
}

GroupView.prototype.UnHighlight = function () {
    this.GroupViewGrid.expandAll();

    for (var rowKey in this.RowWiseColors) {
        var rowIndex = this.GroupViewGrid.getRowIndexByKey(rowKey);
        var rowElement = this.GroupViewGrid.getRowElement(rowIndex)[0];

        if (rowKey in this.SelectedRows) {
            // this.SetRowColor(rowElement, GlobalConstants.TableRowSelectedColor);
            rowElement.cells[0].style.backgroundColor = GlobalConstants.TableRowSelectedColor;
        }
        else {
            // this.SetRowColor(rowElement, GlobalConstants.TableRowNormalColor);
            rowElement.cells[0].style.backgroundColor = GlobalConstants.TableRowNormalColor;
        }
    }
    this.RowWiseColors = {};
}

GroupView.prototype.ApplyPropertyHighlightColor = function () {
    if ((this.GroupViewGrid === null ||
        !this.IsHighlightByPropertyView()) &&
        (!this.IsDataChangeHighlightView() ||
        !this.DataChangeGroupViewActive)) {
        return;
    }
  
    if (this.HighlightActive) {
        this.HighlightActive = false;

        this.ResetViewerColors();

        if (this.IsHighlightByPropertyView()) {
            this.UnHighlight();
        }

        // change icon of btn
        document.getElementById("highlightSelectionBtn" + this.Id).src = "public/symbols/Highlight Selection-Off.svg";
    }
    else {
        this.HighlightActive = true;

        // set one color to entire model
        var rootNode = this.Webviewer.model.getAbsoluteRootNode();
        var communicatorColor = new Communicator.Color(255, 255, 255);
        this.Webviewer.model.setNodesFaceColor([rootNode], communicatorColor);
        this.Webviewer.model.setNodesLineColor([rootNode], communicatorColor);

        if (this.IsHighlightByPropertyView()) {
            this.Highlight();
        }
        else if (this.IsDataChangeHighlightView()) {
            this.HighlightGAByDataChangeColors();
        }

        // change icon of btn
        document.getElementById("highlightSelectionBtn" + this.Id).src = "public/symbols/Highlight Selection-On.svg";
    }
}

GroupView.prototype.HighlightGAByDataChangeColors = function () {
    if (this.CurrentDataChangeTemplate.target.id.toLowerCase() !== "current") {
        return;
    }

    let selectedRowKeys = this.GroupViewTree.getSelectedRowKeys()
    if (selectedRowKeys.length === 0) {
        return;
    }
   
    for (let i = 0; i < selectedRowKeys.length; i++) {
        let rowKey = selectedRowKeys[i];
        let rowNode = this.GroupViewTree.getNodeByKey(rowKey);
        this.ApplyDataChangeColorToGA(rowNode);
    }
}

GroupView.prototype.ApplyDataChangeColorToGA = function (rowNode) {

    let applyColor = true;
    if (this.ExcludeMembers &&
        !this.GroupViewTree.isRowSelected(rowNode.key)) {
        applyColor = false;
    }

    if (applyColor === true) {
        let color = this.GetDataChangeColor(rowNode.data.Status);

        if (color) {
            let nodeId = Number(rowNode.data.NodeId);

            let rgbColor = xCheckStudio.Util.hexToRgb(color);
            let communicatorColor = new Communicator.Color(rgbColor.r, rgbColor.g, rgbColor.b);
            this.Webviewer.model.setNodesFaceColor([nodeId], communicatorColor);
            this.Webviewer.model.setNodesLineColor([nodeId], communicatorColor);
        }
    }

    if (rowNode.hasChildren) {
        for (let i = 0; i < rowNode.children.length; i++) {
            this.ApplyDataChangeColorToGA(rowNode.children[i]);
        }
    }
}

GroupView.prototype.GetDataChangeColor = function (status) {
    let color = null;
    if (status.toLowerCase() === "new item") {
        color = this.DataChangeHighlightColors["ga new item"];
    }
    else if (status.toLowerCase() === "deleted item") {
        color = this.DataChangeHighlightColors["ga deleted item"];
    }
    else if (status.toLowerCase() === "changed property" ||
        status.toLowerCase() === "new property" ||
        status.toLowerCase() === "deleted property" ||
        status.toLowerCase() === "new/deleted property" ||
        status.toLowerCase() === "new/changed property" ||
        status.toLowerCase() === "deleted/changed property" ||
        status.toLowerCase() === "new/deleted/changed property") {
        color = this.DataChangeHighlightColors["ga property change"];
    }

    return color;
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

GroupView.prototype.LoadDatabaseViewTabs =function(showTables){
    if (!showTables ||
        showTables.length === 0) {
        return;
    }
    let _this = this;

    // _this.ClearDatabaseView();
    // this.ShowDatabaseViewer(!this.DatabaseViewActive);
    // if (!this.DatabaseViewActive) {
    //     return;
    // }
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
        gridDiv.id = "tabGrid_" + this.Id + "_" + group;
        templateDiv.appendChild(gridDiv);
        document.getElementById("databaseViewer" + this.Id).appendChild(templateDiv);

        source.push({ title: group, template: tabId });
    }
   
    let loadingTabPanel = true;
    let dbViewTabPanel = $("#databaseViewer" + this.Id).dxTabPanel({
        dataSource: source,
        deferRendering: false,
        showNavButtons: true,
        selectedIndex : 0,
        onContentReady: function (e) {
            if (!loadingTabPanel) {
                return;
            }
            loadingTabPanel = false;

            // // populate grids
            // _this.LoadDatabaseViewTables(showTables);

            // populate first grid
            let tabs = e.component.getDataSource().items();
            if (tabs.length > 0) {
                _this.LoadDatabaseViewTables([tabs[0].title]);
            }
        },
        onSelectionChanged: function (e) {

            // dispose old grid
            let gridDivId = "tabGrid_" + _this.Id + "_" + e.removedItems[0].title;
            let gridDiv = document.getElementById(gridDivId)
            var parent = gridDiv.parentElement;

            $("#" + gridDivId).dxDataGrid("dispose");
            $("#" + gridDivId).remove();

            var newDiv = document.createElement("div")
            newDiv.id = gridDivId;
            parent.appendChild(newDiv);

            // populate new grid
            _this.LoadDatabaseViewTables([e.addedItems[0].title]);
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
        let allColumns = ["Status", "Item", "Source Revision", "Target Revision"];

        var column = {};
        column["caption"] = "Status";
        column["dataField"] = "Status";
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
                rowData["Status"] = item['status'];
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
        let gridDivId = "tabGrid_" + _this.Id + "_" + groupName;
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

                if (e.data.Status.toLowerCase() === "new item") {
                    e.rowElement[0].style.backgroundColor = _this.DataChangeHighlightColors["new item"];
                }
                else if (e.data.Status.toLowerCase() === "deleted item") {
                    e.rowElement[0].style.backgroundColor = _this.DataChangeHighlightColors["deleted item"];
                }
                else if (e.data.Status.toLowerCase() === "changed property" ||
                    e.data.Status.toLowerCase() === "new property" ||
                    e.data.Status.toLowerCase() === "deleted property" ||
                    e.data.Status.toLowerCase() === "new/deleted property" ||
                    e.data.Status.toLowerCase() === "new/changed property" ||
                    e.data.Status.toLowerCase() === "deleted/changed property" ||
                    e.data.Status.toLowerCase() === "new/deleted/changed property") {
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