var modelBrowserCheckColumn = 0;
var modelBrowserComponentColumn = 1;
var modelBrowserMainClassColumn = 2;
var modelBrowserSubClassColumn = 3;
// var modelBrowserSourceColumn = 4;
// var modelBrowserDestinationColumn = 5;
// var modelBrowserOwnerColumn = 6;
var modelBrowserNodeIdColumn = 4;

function SCModelBrowser(modelBrowserContainer,
    viewer,
    sourceType,
    nodeIdvsSelectedComponents) {

    // call super constructor
    ModelBrowser.call(this, modelBrowserContainer);

    this.Webviewer = viewer;
    this.SourceType = sourceType;

    this.NodeIdVsCellClassList = {};
    this.NodeIdVsRowClassList = {};
    this.modelTreeColumnHeaders = [];
    this.modelTreeRowData = [];

    this.NodeGroups = [];

    this.CreateHeaders();
    this.InitEvents();  

    // selectiion manager
    this.SelectionManager = new SCSelectionManager(nodeIdvsSelectedComponents);
}


// assign ModelBrowser's method to this class
SCModelBrowser.prototype = Object.create(ModelBrowser.prototype);
SCModelBrowser.prototype.constructor = SCModelBrowser;

SCModelBrowser.prototype.CreateHeaders = function () {
    var _this = this;

    // get container element Id 
    var containerElement = document.getElementById(this.ModelBrowserContainer);

    var size = new Communicator.Point2(556, 364);

    // create div element to hold model browser 
    var tableDiv = document.createElement("div");
    tableDiv.className = "scrollable";
    tableDiv.style.width = size.x + "px";
    tableDiv.style.height = size.y + "px";
    containerElement.appendChild(tableDiv);

    // create model browser table

    //create header for table
    columnHeader = {};
    columnHeader["title"] = "";
    columnHeader["name"] = "checkBox";
    columnHeader["type"] = "text";
    columnHeader["width"] = "20";
    columnHeader["filtering"] = "false";
    columnHeader["sorting"] = "false";
    _this.modelTreeColumnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["title"] = "Item";
    columnHeader["name"] = "Component";
    columnHeader["type"] = "text";
    columnHeader["width"] = "100";
    _this.modelTreeColumnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["title"] = "Category";
    columnHeader["name"] = "MainComponentClass";
    columnHeader["type"] = "text";
    columnHeader["width"] = "100";
    _this.modelTreeColumnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["title"] = "Item Class";
    columnHeader["name"] = "SubComponentClass";
    columnHeader["type"] = "text";
    columnHeader["width"] = "100";
    _this.modelTreeColumnHeaders.push(columnHeader);

    columnHeader = {};
    columnHeader["title"] = "NodeId";
    columnHeader["name"] = "NodeId";
    columnHeader["type"] = "text";
    columnHeader["width"] = "0";
    columnHeader["filtering"] = "false";
    columnHeader["sorting"] = "false";
    _this.modelTreeColumnHeaders.push(columnHeader);

};

SCModelBrowser.prototype.InitEvents = function () {
    var _this = this;
    this.Webviewer.setCallbacks({
        assemblyTreeReady: function () {
        },
        selectionArray: function (selectionEvents) {
            for (var _i = 0, selectionEvents_1 = selectionEvents; _i < selectionEvents_1.length; _i++) {
                var selectionEvent = selectionEvents_1[_i];
                var selection = selectionEvent.getSelection();
                if (selection.isNodeSelection()) {
                    var nodeId = selection.getNodeId();
                    var model = _this.Webviewer.model;
                    if (model.isNodeLoaded(nodeId)) {
                    }
                }
            }
        }
    });
};

SCModelBrowser.prototype.revisedRandId = function () {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

SCModelBrowser.prototype.addClassesToModelBrowser = function () {
    var modelBrowser = document.getElementById(this.ModelBrowserContainer);
    //var modelBrowserHeader = modelBrowser.children[0];
    var modelBrowserRowTable = modelBrowser.children[1].getElementsByTagName("table")[0];
    var modelBrowserRows = modelBrowserRowTable.getElementsByTagName("tr");
    for (var i = 0; i < modelBrowserRows.length; i++) {
        var currentRow = modelBrowserRows[i];

        if (currentRow.cells[4].innerHTML !== "") {
            var nodeId = currentRow.cells[4].innerHTML;
            var className = this.NodeIdVsCellClassList[nodeId];
            if (className !== undefined) {
                modelBrowserRows[i].cells[1].classList.add(className)
            }
        }

        var nodeId = currentRow.cells[4].innerHTML;
        var className = this.NodeIdVsRowClassList[nodeId];
        if (className !== undefined) {
            var classList = className.split(" ");
            for (var j = 0; j < classList.length; j++) {
                modelBrowserRows[i].classList.add(classList[j]);
            }

            this.SelectionManager.RestoreBackgroundColor(modelBrowserRows[i])
        }
    }
}

SCModelBrowser.prototype.addComponentRow = function (nodeId, styleList, componentStyleClass) {
    var _this = this;

    var model = this.Webviewer.model;
    //var componentName = model.getNodeName(nodeId);
    if (styleList !== undefined) {
        // row.classList = styleList;
        _this.NodeIdVsRowClassList[nodeId] = styleList;
    }

    //add node properties to model browser table
    var nodeData;
    if (this.Webviewer._params.containerId === "viewerContainer1") {
        nodeData = sourceManager1.SourceProperties[nodeId];
    }
    else if (this.Webviewer._params.containerId === "viewerContainer2") {
        nodeData = sourceManager2.SourceProperties[nodeId];
    }

    if (nodeData == undefined) {
        return;
    }

    tableRowContent = {};
    // if (nodeData != undefined) 
    // {
    var checkBox = document.createElement("INPUT");
    checkBox.setAttribute("type", "checkbox");

    var checked = false;
    if (_this.NodeIdvsSelectedComponents &&
        (nodeId in _this.NodeIdvsSelectedComponents)) {
        checked = true;
    }
    checkBox.checked = checked;

    tableRowContent[this.modelTreeColumnHeaders[0].name] = checkBox;

    // select component check box state change event
    checkBox.onchange = function () {
        _this.SelectionManager.HandleSelectFormCheckBox(this);
    }

    tableRowContent[this.modelTreeColumnHeaders[1].name] = nodeData.Name;
    var isAssemblyNodeType = this.isAssemblyNode(nodeId);
    if (isAssemblyNodeType) {
        if (this.NodeGroups.indexOf(componentStyleClass) === -1) {
            this.NodeIdVsCellClassList[nodeData.NodeId] = componentStyleClass;
        }
    }

    tableRowContent[this.modelTreeColumnHeaders[2].name] = (nodeData.MainComponentClass != undefined ? nodeData.MainComponentClass : "");
    tableRowContent[this.modelTreeColumnHeaders[3].name] = (nodeData.SubComponentClass != undefined ? nodeData.SubComponentClass : "");
    tableRowContent[this.modelTreeColumnHeaders[4].name] = (nodeData.NodeId != undefined ? nodeData.NodeId : "");
    // }
    //  else 
    //  {
    //      return;            

    //  }

    this.modelTreeRowData.push(tableRowContent);

    if (this.NodeGroups.indexOf(componentStyleClass) === -1) {
        this.NodeGroups.push(componentStyleClass);
    }

    if (this.Webviewer._params.containerId === "viewerContainer1") {
        sourceATotalItemCount = this.modelTreeRowData.length;
    }
    else if (this.Webviewer._params.containerId === "viewerContainer2") {
        sourceBTotalItemCount = this.modelTreeRowData.length;
    }


}

SCModelBrowser.prototype.SelectedCompoentExists = function (componentRow) {
    return this.SelectionManager.SelectedCompoentExists(componentRow);
}

SCModelBrowser.prototype.getComponentstyleClass = function (componentName) {
    var componentStyleClass = componentName.replace(" ", "");
    componentStyleClass = componentStyleClass.replace(":", "");
    if (this.Webviewer._params.containerId === "viewerContainer2") {
        componentStyleClass += "-viewer2";
    }
    else if (this.Webviewer._params.containerId === "viewerContainer1") {
        componentStyleClass += "-viewer1";
    }
    while (this.NodeGroups.includes(componentStyleClass)) {
        componentStyleClass += "-" + this.revisedRandId();
    }
    return componentStyleClass;
}

SCModelBrowser.prototype.addModelBrowser = function (nodeId, styleList) {
    this.addModelBrowserComponent(nodeId, styleList);

    if (this.modelTreeColumnHeaders === undefined ||
        this.modelTreeColumnHeaders.length === 0 ||
        this.modelTreeRowData === undefined ||
        this.modelTreeRowData.length === 0) {
        return;
    }

    this.loadModelBrowserTable();

    var modelBrowserData = document.getElementById(this.ModelBrowserContainer);
    var modelBrowserDataTable = modelBrowserData.children[1];

    var modelBrowserHeaderTable = modelBrowserData.children[0];
    modelBrowserHeaderTable.style.position = "fixed"
    modelBrowserHeaderTable.style.width = "543px";
    modelBrowserHeaderTable.style.overflowX = "hide";
    var modelBrowserHeaderTableRows = modelBrowserHeaderTable.getElementsByTagName("tr");
    for (var j = 0; j < modelBrowserHeaderTableRows.length; j++) {
        var currentRow = modelBrowserHeaderTableRows[j];
        for (var i = 0; i < currentRow.cells.length; i++) {
            if (i === 4 || i === 5 || i === 6 || i === 7) {
                currentRow.cells[i].style.display = "none";
            }
            if (j === 1 && i === 0) {
                currentRow.cells[i].innerHTML = ""
            }
        }
    }


    modelBrowserDataTable.style.position = "static"
    modelBrowserDataTable.style.width = "556px";
    modelBrowserDataTable.style.margin = "47px 0px 0px 0px"
};

SCModelBrowser.prototype.addModelBrowserComponent = function (nodeId, styleList) {

    if (nodeId !== null) {
        var model = this.Webviewer.model;
        var children = model.getNodeChildren(nodeId);

        if (children.length > 0) {
            var componentName = model.getNodeName(nodeId);

            var componentStyleClass = this.getComponentstyleClass(componentName);
            componentStyleClass = componentStyleClass.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
            componentStyleClass = componentStyleClass.replace(/\s/g, '');
            componentStyleClass = componentStyleClass.replace("^","");

            this.addComponentRow(nodeId, styleList, componentStyleClass);

            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                var child = children_1[_i];

                var collapsibleCellStyle;
                if (styleList !== undefined) {
                    collapsibleCellStyle = styleList + " " + componentStyleClass;
                }
                else {
                    collapsibleCellStyle = componentStyleClass;
                }

                collapsibleCellStyle = collapsibleCellStyle.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
                collapsibleCellStyle = collapsibleCellStyle.replace("^","");
                this.addModelBrowserComponent(child, collapsibleCellStyle);
            }
        }
    }

};

SCModelBrowser.prototype.loadModelBrowserTable = function () {

    var _this = this;
    var viewerContainer = "#" + _this.ModelBrowserContainer;
    var columnHeaders = _this.modelTreeColumnHeaders;
    var tableData = _this.modelTreeRowData;

    $(function () {
        var db = {
            loadData: filter => {
                console.debug("Filter: ", filter);
                let Component = (filter.Component || "").toLowerCase();
                let MainComponentClass = (filter.MainComponentClass || "").toLowerCase();
                let SubComponentClass = (filter.SubComponentClass || "").toLowerCase();
                let dmy = parseInt(filter.dummy, 10);
                this.recalculateTotals = true;
                return $.grep(tableData, row => {
                    return (!Component || row.Component.toLowerCase().indexOf(Component) >= 0)
                        && (!MainComponentClass || row.MainComponentClass.toLowerCase().indexOf(MainComponentClass) >= 0)
                        && (!SubComponentClass || row.SubComponentClass.toLowerCase().indexOf(SubComponentClass) >= 0)
                        && (isNaN(dmy) || row.dummy === dmy);
                });
            }
        };

        $(viewerContainer).jsGrid({
            width: "556px",
            height: "364px",
            filtering: true,
            sorting: true,
            autoload: true,
            controller: db,
            data: tableData,
            fields: columnHeaders,
            margin: "0px",
            checked: true,
            onRefreshed: function (config) {
                _this.AddTableContentCount(this._container.context.id);
                var sorting = this.getSorting();
                if (sorting.field !== undefined || 
                    sorting.order !== undefined) {

                    _this.addClassesToModelBrowser();
                    for (var i = 0; i < _this.NodeGroups.length; i++) {
                        _this.CreateGroup(_this.NodeGroups[i]);
                    }
                }
            },
            onDataLoaded: function (args) {
                _this.addClassesToModelBrowser();
                for (var i = 0; i < _this.NodeGroups.length; i++) {
                    _this.CreateGroup(_this.NodeGroups[i]);
                } 
                
                // initialize the context menu
                var modelBrowserContextMenuManager = new ModelBrowserContextMenuManager();
                modelBrowserContextMenuManager.Init(_this);
            },
            rowClick: function (args) {
                _this.SelectionManager.HandleRowSelect(args.event.currentTarget, _this.Webviewer);                              
            }
        });

    });


    var container = document.getElementById(viewerContainer.replace("#", ""));

    container.style.width = "556px"
    container.style.height = "364px"
    container.style.margin = "0px"
    container.style.overflowX = "hide";
    container.style.overflowY = "scroll";
    container.style.padding = "0";
};

SCModelBrowser.prototype.AddTableContentCount = function (containerId) {
    var modelBrowserData = document.getElementById(containerId);
    var modelBrowserDataTable = modelBrowserData.children[1];
    var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");

    var countBox;
    if (containerId === "modelTree1") {
        countBox = document.getElementById("SourceAComponentCount");
    }
    if (containerId === "modelTree2") {
        countBox = document.getElementById("SourceBComponentCount");
    }
    countBox.innerText = "Count: " + modelBrowserTableRows.length;
}

SCModelBrowser.prototype.isAssemblyNode = function (nodeId) {
    var nodeType = this.Webviewer.model.getNodeType(nodeId);
    if (nodeType == Communicator.NodeType.AssemblyNode) {
        return true;
    }
    else {
        return false;
    }
};

//to create collapsible table rows in model browser
//https://jsfiddle.net/y4Mdy/1372/
SCModelBrowser.prototype.CreateGroup = function (group_name) {
    var _this = this;

    var imageClass = group_name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    imageClass = imageClass.replace(/\s/g, '');
    imageClass = imageClass.replace("^","");

    // Create Button(Image)
    $('td.' + group_name).prepend("<img class='" + imageClass + " button_closed'> ");
    // Add Padding to Data
    $('tr.' + group_name).each(function () {
        //var first_td = $(this).children('td').first();
        var collapsibleButtonTd = $(this).find("td:eq(1)");

        var padding_left = parseInt($(collapsibleButtonTd).css('padding-left'));
        $(collapsibleButtonTd).css('padding-left', String(padding_left + 25) + 'px');
    });
    this.RestoreGroup(group_name);

    // Tie toggle function to the button
    $('img.' + imageClass).click(function () {
        _this.ToggleGroup(group_name);
    });
}

//to create collapsible table rows in model browser
//https://jsfiddle.net/y4Mdy/1372/
SCModelBrowser.prototype.ToggleGroup = function (group_name) {
    this.ToggleButton($('img.' + group_name));
    this.RestoreGroup(group_name);
    if (this.Webviewer._params.containerId === "viewerContainer1") {
        var groupName = group_name.split("");
        var length = groupName.length;
        var temp = "";
        for (var i = 0; i < length; i++) {
            if (i < length - 1) {
                temp += groupName[i];
            }
            else if (i == length - 1) {
                temp += "2";
            }
        }
    }
    else if (this.Webviewer._params.containerId === "viewerContaine2") {
        var groupName = group_name.split("");
        var length = groupName.length;
        var temp = "";
        for (var i = 0; i < length; i++) {
            if (i < length - 1) {
                temp += groupName[i];
            }
            else if (i == length - 1) {
                temp += "1";
            }
        }
        this.ToggleButton($('img.' + temp));
        this.RestoreGroup(temp);
    }
}

SCModelBrowser.prototype.OpenGroup = function (group_name,
    child_groupName) {
    var _this = this;
    if ($('img.' + group_name).hasClass('button_open')) {
        // Open everything
        $('tr.' + group_name).show();

        // Close subgroups that been closed
        $('tr.' + group_name).find('img.button_closed').each(function () {
            if (sub_group_name != child_groupName) {
                sub_group_name = $(this).attr('class').split(/\s+/)[0];
                //console.log(sub_group_name);
                _this.RestoreGroup(sub_group_name);
            }
        });
    }

    if ($('img.' + group_name).hasClass('button_closed')) {
        // Close everything
        $('tr.' + group_name).hide();
    }
}

//to create collapsible table rows in model browser
//https://jsfiddle.net/y4Mdy/1372/
SCModelBrowser.prototype.RestoreGroup = function (group_name) {
    var _this = this;
    if ($('img.' + group_name).hasClass('button_open')) {
        // Open everything
        $('tr.' + group_name).show();

        // Close subgroups that been closed
        $('tr.' + group_name).find('img.button_closed').each(function () {
            sub_group_name = $(this).attr('class').split(/\s+/)[0];
            //console.log(sub_group_name);
            _this.RestoreGroup(sub_group_name);
        });
    }

    if ($('img.' + group_name).hasClass('button_closed')) {
        // Close everything
        $('tr.' + group_name).hide();
    }
}

//to create collapsible table rows in model browser
//https://jsfiddle.net/y4Mdy/1372/
SCModelBrowser.prototype.ToggleButton = function (button) {
    $(button).toggleClass('button_open');
    $(button).toggleClass('button_closed');
}


SCModelBrowser.prototype.HighlightModelBrowserRow = function (selectedNodeId) {
  
    var modelBrowser = document.getElementById(this.ModelBrowserContainer);   
    var modelBrowserRowTable = modelBrowser.children[1].getElementsByTagName("table")[0];
    var browserTableRows = modelBrowserRowTable.getElementsByTagName("tr");
    for (var i = 0; i < browserTableRows.length; i++) {
        var childRow = browserTableRows[i];
        var childRowColumns = childRow.cells;
        if (childRowColumns.length === 0) {
            continue;
        }

        var nodeIdString = childRowColumns[modelBrowserNodeIdColumn].innerText;
        var nodeId = parseInt(nodeIdString.trim());
        
            if (selectedNodeId === nodeId) {

                this.SelectionManager.HandleRowSelect(childRow, undefined);
                
                this.OpenHighlightedRow(childRow);

                // scroll to selected row
                modelBrowserRowTable.parentElement.parentElement.focus();
                modelBrowserRowTable.parentElement.parentElement.scrollTop = childRow.offsetTop - childRow.offsetHeight;
                break;
            }    
    }   
}

SCModelBrowser.prototype.GetSelectedComponents = function () {
    return this.SelectionManager.GetSelectedComponents();
}

SCModelBrowser.prototype.AddSelectedComponent = function (checkedComponent) {   
    this.SelectionManager.AddSelectedComponent(checkedComponent);
}

SCModelBrowser.prototype.ClearSelectedComponent = function (checkedComponent) {
    this.SelectionManager.ClearSelectedComponent();
}

SCModelBrowser.prototype.OpenHighlightedRow = function (currentRow) {
    $(currentRow).show();

    var currentClassName = currentRow.className;

    // remove first class-name i.e. "jsgrid-row" or "jsgrid-alt-row " 
    var secondClassNameindex = currentClassName.indexOf(" ");
    var inheritedStyle = currentClassName.substr(secondClassNameindex + 1);

    var lastClassNameindex = inheritedStyle.lastIndexOf(" ");

    // get parent's own style name
    var parentsStyle = inheritedStyle.substr(lastClassNameindex + 1);

    // remove last class name
    inheritedStyle = inheritedStyle.substr(0, lastClassNameindex);

    parentsStyle = "jsgrid-cell " + parentsStyle;
    var rows = document.getElementsByClassName("jsgrid-row " + inheritedStyle);

    for (var i = 0; i < rows.length; i++) {
        if (parentsStyle === rows[i].cells[modelBrowserComponentColumn].className) {
            if (rows[i].cells[modelBrowserComponentColumn].children.length > 0 &&
                rows[i].cells[modelBrowserComponentColumn].children[0].localName === "img" &&
                rows[i].cells[modelBrowserComponentColumn].children[0].classList.contains('button_closed')) {
                // remove colsed button and add opened button image
                rows[i].cells[modelBrowserComponentColumn].children[0].classList.remove("button_closed");
                rows[i].cells[modelBrowserComponentColumn].children[0].classList.add("button_open");
            }

            $(rows[i]).show();
            rows[i].cells[modelBrowserComponentColumn].children[0].local
            this.OpenHighlightedRow(rows[i]);
            return;
        }
    }

    // if not found check in alternate rows
    rows = document.getElementsByClassName("jsgrid-alt-row " + inheritedStyle);
    for (var i = 0; i < rows.length; i++) {
        if (parentsStyle === rows[i].cells[modelBrowserComponentColumn].className) {
            if (rows[i].cells[modelBrowserComponentColumn].children.length > 0 &&
                rows[i].cells[modelBrowserComponentColumn].children[0].localName === "img" &&
                rows[i].cells[modelBrowserComponentColumn].children[0].classList.contains('button_closed')) {
                // remove colsed button and add opened button image
                rows[i].cells[modelBrowserComponentColumn].children[0].classList.remove("button_closed");
                rows[i].cells[modelBrowserComponentColumn].children[0].classList.add("button_open");
            }

            $(rows[i]).show();
            this.OpenHighlightedRow(rows[i]);
            return;
        }
    }
}

