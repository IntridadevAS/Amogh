//var modelBrowserCheckColumn = 0;
//var modelBrowserComponentColumn = 1;
//var modelBrowserMainClassColumn = 2;
//var modelBrowserSubClassColumn = 3;
// var modelBrowserSourceColumn = 4;
// var modelBrowserDestinationColumn = 5;
// var modelBrowserOwnerColumn = 6;
//var modelBrowserNodeIdColumn = 4;

function SCModelBrowser(modelBrowserContainer,
    viewer,
    sourceType,
    nodeIdvsSelectedComponents) {

    // call super constructor
    ModelBrowser.call(this, modelBrowserContainer);

    this.Components;
    this.Webviewer = viewer;
    this.SourceType = sourceType;

    //this.NodeIdVsCellClassList = {};
    //this.NodeIdVsRowClassList = {};
    //this.modelTreeColumnHeaders = [];
    this.modelTreeRowData = [];

    this.ModelBrowserAddedNodes = [];
    this.NodeParentList = {};
    //this.NodeGroups = [];

    // this.CreateHeaders();
    this.InitEvents();

    // selectiion manager
    this.SelectionManager = new SCSelectionManager(nodeIdvsSelectedComponents);
}


// assign ModelBrowser's method to this class
SCModelBrowser.prototype = Object.create(ModelBrowser.prototype);
SCModelBrowser.prototype.constructor = SCModelBrowser;

SCModelBrowser.prototype.CreateHeaders = function () {
    var columnHeaders = [];
    for (var i = 0; i < Object.keys(ModelBrowserColumns3D).length; i++) {
        var columnHeader = {};
        var headerText;
        var key;
        var width;
        var dataType;
        if (i === ModelBrowserColumns3D.Select) {
            continue;
        }
        else if (i === ModelBrowserColumns3D.Component) {
            headerText = ModelBrowserColumnNames3D.Component;
            key = ModelBrowserColumnNames3D.Component.replace(/\s/g, '');
            width = "40%";
            dataType = "string";
        }
        else if (i === ModelBrowserColumns3D.MainClass) {
            headerText = ModelBrowserColumnNames3D.MainClass;
            key = ModelBrowserColumnNames3D.MainClass.replace(/\s/g, '');
            width = "30%";
            dataType = "string";
        }
        else if (i === ModelBrowserColumns3D.SubClass) {
            headerText = ModelBrowserColumnNames3D.SubClass;
            key = ModelBrowserColumnNames3D.SubClass.replace(/\s/g, '');
            width = "30%";
            dataType = "string";
        }
        else if (i === ModelBrowserColumns3D.NodeId) {
            headerText = ModelBrowserColumnNames3D.NodeId;
            key = ModelBrowserColumnNames3D.NodeId.replace(/\s/g, '');
            width = "0%";
            dataType = "number";
        }

        columnHeader["headerText"] = headerText;
        columnHeader["key"] = key;
        columnHeader["dataType"] = dataType;
        columnHeader["width"] = width;
        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}

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

SCModelBrowser.prototype.addComponentRow = function (nodeId, parentNode) {
    //var _this = this;
    if (!(nodeId in this.Components)) {
        return;
    }

    if (!this.ModelBrowserAddedNodes.includes(parentNode)) {
        parentNode = -1;
    }
    this.ModelBrowserAddedNodes.push(nodeId);

    this.NodeParentList[nodeId] = parentNode;
    // if (styleList !== undefined) {
    //     this.NodeIdVsRowClassList[nodeId] = styleList;
    // }

    //add node properties to model browser table
    var nodeData = this.Components[nodeId];


    tableRowContent = {};

    tableRowContent[ModelBrowserColumnNames3D.Component.replace(/\s/g, '')] = nodeData.Name;
    tableRowContent[ModelBrowserColumnNames3D.MainClass.replace(/\s/g, '')] = (nodeData.MainComponentClass != undefined ? nodeData.MainComponentClass : "");
    tableRowContent[ModelBrowserColumnNames3D.SubClass.replace(/\s/g, '')] = (nodeData.SubComponentClass != undefined ? nodeData.SubComponentClass : "");
    tableRowContent[ModelBrowserColumnNames3D.NodeId.replace(/\s/g, '')] = (nodeData.NodeId != undefined ? nodeData.NodeId : "");
    tableRowContent["parent"] = parentNode;

    this.modelTreeRowData.push(tableRowContent);
}

SCModelBrowser.prototype.SelectedCompoentExists = function (componentRow) {
    //return this.SelectionManager.SelectedCompoentExists(componentRow);
}

SCModelBrowser.prototype.addModelBrowser = function (components) {
    if (!components) {
        return;
    }

    this.Components = components;

    var headers = this.CreateHeaders();

    var rootNode = this.Webviewer.model.getAbsoluteRootNode();
    this.addModelBrowserComponent(rootNode, -1);

    if (headers === undefined ||
        headers.length === 0 ||
        this.modelTreeRowData === undefined ||
        this.modelTreeRowData.length === 0) {
        return;
    }

    this.loadModelBrowserTable(headers);
};

SCModelBrowser.prototype.addModelBrowserComponent = function (nodeId, parentNode) {

    if (nodeId !== null) {
        var model = this.Webviewer.model;
        var children = model.getNodeChildren(nodeId);

        if (children.length > 0) {

            this.addComponentRow(nodeId, parentNode);

            for (var i = 0; i < children.length; i++) {
                var child = children[i];

                this.addModelBrowserComponent(child, nodeId);
            }
        }
    }

};

SCModelBrowser.prototype.Clear = function () {
    var containerDiv = "#" + this.ModelBrowserContainer;
    $(containerDiv).igTreeGrid("destroy");

    // clear count
    this.GetItemCountDiv().innerHTML = "";
}

SCModelBrowser.prototype.loadModelBrowserTable = function (columnHeaders) {

    var _this = this;
    var containerDiv = "#" + _this.ModelBrowserContainer;
    $(function () {
        //var table = JSON.stringify(_this.modelTreeRowData);
        var isFiredFromCheckbox = false;
        $(containerDiv).igTreeGrid({
            columns: columnHeaders,
            dataSource: _this.modelTreeRowData,
            primaryKey: ModelBrowserColumnNames3D.NodeId.replace(/\s/g, ''),
            foreignKey: "parent",
            autofitLastColumn: true,
            autoGenerateColumns: false,
            // dataSourceType: "json",
            //responseDataKey: "results",
            //autoCommit: true,
            height: "96%",
            width: "100%",
            initialExpandDepth: 0,
            alternateRowStyles: false,
            rendered: function (evt, ui) {
                //return reference to igTreeGrid
                //ui.owner;
                // initialize the context menu
                var modelBrowserContextMenu = new ModelBrowserContextMenu();
                modelBrowserContextMenu.Init(_this);

                _this.ShowItemCount(_this.modelTreeRowData.length);
            },
            features: [
                {
                    name: "Sorting",
                    sortingDialogContainment: "window"
                },
                {
                    name: "Filtering",
                    type: "local",
                    dataFiltered: function (evt, ui) {
                        //  var filteredData = evt.target.rows;
                        // _this.RestoreBackgroundColorOfFilteredRows(filteredData);
                    }
                },
                {
                    name: "Selection",
                    mode: 'row',
                    multipleSelection: true,
                    activation: true,
                    rowSelectionChanging: function (evt, ui) {

                        if (isFiredFromCheckbox) {
                            isFiredFromCheckbox = false;
                        } else {

                            var rowData = _this.GetDataFromSelectedRow(ui.row.id, containerDiv);
                            _this.SelectionManager.HandleRowSelect(ui.row.element[0], _this.Webviewer, rowData["nodeId"]);
                            return false;
                        }

                    },
                },
                {
                    name: "RowSelectors",
                    enableCheckBoxes: true,
                    enableRowNumbering: false,
                    //enableSelectAllForPaging: true, // this option is true by default
                    checkBoxStateChanging: function (evt, ui) {
                        //we use this variable as a flag whether the selection is coming from a checkbox
                        isFiredFromCheckbox = true;
                    },
                    checkBoxStateChanged: function (evt, ui) {

                        if (ui.isHeader) {

                            var data = $(containerDiv).data("igTreeGrid").dataSource.dataView();
                            if (data.length === 0) {
                                return;
                            }

                            for (var rowIndex in data) {
                                var record = data[rowIndex];

                                var rowKey = parseInt(record[ModelBrowserColumnNames3D.NodeId.replace(/\s/g, '')]);
                                if (rowKey === NaN) {
                                    continue;
                                }
                                var rowData = _this.GetDataFromSelectedRow(rowKey, containerDiv, true);
                                var row = $(containerDiv).igTreeGrid("rowById", rowKey);

                                _this.SelectionManager.HandleSelectFormCheckBox(row[0], ui.state, rowData, containerDiv);
                            }
                        }
                        else {
                            var rowKey = parseInt(ui.rowKey);
                            var rowData = _this.GetDataFromSelectedRow(rowKey, containerDiv, true);

                            _this.SelectionManager.HandleSelectFormCheckBox(ui.row[0], ui.state, rowData, containerDiv);
                        }
                    }
                },
                // {
                //     name: "Resizing"
                // },
                {
                    name: 'Hiding',
                    columnSettings: [
                        { columnKey: ModelBrowserColumns3D.NodeId, allowHiding: true, hidden: true },
                    ]
                },
            ]
        });
    });
}

SCModelBrowser.prototype.AddTableContentCount = function (containerId) {
    // var modelBrowserData = document.getElementById(containerId);
    // var modelBrowserDataTable = modelBrowserData.children[1];
    // var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");

    // var countBox;
    // if (containerId === "modelTree1") {
    //     countBox = document.getElementById("SourceAComponentCount");
    // }
    // if (containerId === "modelTree2") {
    //     countBox = document.getElementById("SourceBComponentCount");
    // }
    // countBox.innerText = "Count: " + modelBrowserTableRows.length;
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
    imageClass = imageClass.replace("^", "");

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
    if (this.Webviewer._params.containerId === "visualizerA") {
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
    else if (this.Webviewer._params.containerId === "visualizerB") {
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

    var path = {};
    path['path'] = [selectedNodeId];
    this.GetTopMostParentNode(selectedNodeId, path);
    // if (!topMostParent ||
    //     topMostParent === -1) {
    //     return;
    // }

    this.OpenHighlightedRow(path);

    var row = this.GetBrowserRowFromNodeId(selectedNodeId, this.ModelBrowserContainer);
    if (!row) {
        return;
    }

    // scroll to that row
    document.getElementById(this.ModelBrowserContainer + "_table_scroll").scrollTop = row.offsetTop - row.offsetHeight;

    this.SelectionManager.HandleRowSelect(row, undefined);
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

SCModelBrowser.prototype.OpenHighlightedRow = function (path) {

    if (!('path' in path)) {
        return;
    }
    var nodeList = path['path'];
    nodeList = nodeList.reverse();

    for (var i = 0; i < nodeList.length; i++) {
        var node = nodeList[i];
        // expand current row
        $("#" + this.ModelBrowserContainer).igTreeGrid("expandRow", node, function () {

        });
    }

    // // expand current row
    // $(containerDiv).igTreeGrid( "expandRow", componentHierarchy.nodeId, function(){

    // });

    // // traverse children
    // for(var i = 0; i < componentData.children.length; i++)
    // {
    //     var childComponent = componentData.children[i];     
    //     this.OpenHighlightedRow(childComponent);
    // }

    // var componentHierarchy = this.GetHierarchyToRow(selectedNodeId);
    // $(currentRow).show();

    // var currentClassName = currentRow.className;

    // // remove first class-name i.e. "jsgrid-row" or "jsgrid-alt-row " 
    // var secondClassNameindex = currentClassName.indexOf(" ");
    // var inheritedStyle = currentClassName.substr(secondClassNameindex + 1);

    // var lastClassNameindex = inheritedStyle.lastIndexOf(" ");

    // // get parent's own style name
    // var parentsStyle = inheritedStyle.substr(lastClassNameindex + 1);

    // // remove last class name
    // inheritedStyle = inheritedStyle.substr(0, lastClassNameindex);

    // parentsStyle = "jsgrid-cell " + parentsStyle;
    // var rows = document.getElementsByClassName("jsgrid-row " + inheritedStyle);

    // for (var i = 0; i < rows.length; i++) {
    //     if (parentsStyle === rows[i].cells[ModelBrowserColumns3D.Component].className) {
    //         if (rows[i].cells[ModelBrowserColumns3D.Component].children.length > 0 &&
    //             rows[i].cells[ModelBrowserColumns3D.Component].children[0].localName === "img" &&
    //             rows[i].cells[ModelBrowserColumns3D.Component].children[0].classList.contains('button_closed')) {
    //             // remove colsed button and add opened button image
    //             rows[i].cells[ModelBrowserColumns3D.Component].children[0].classList.remove("button_closed");
    //             rows[i].cells[ModelBrowserColumns3D.Component].children[0].classList.add("button_open");
    //         }

    //         $(rows[i]).show();
    //         rows[i].cells[ModelBrowserColumns3D.Component].children[0].local
    //         this.OpenHighlightedRow(rows[i]);
    //         return;
    //     }
    // }

    // // if not found check in alternate rows
    // rows = document.getElementsByClassName("jsgrid-alt-row " + inheritedStyle);
    // for (var i = 0; i < rows.length; i++) {
    //     if (parentsStyle === rows[i].cells[ModelBrowserColumns3D.Component].className) {
    //         if (rows[i].cells[ModelBrowserColumns3D.Component].children.length > 0 &&
    //             rows[i].cells[ModelBrowserColumns3D.Component].children[0].localName === "img" &&
    //             rows[i].cells[ModelBrowserColumns3D.Component].children[0].classList.contains('button_closed')) {
    //             // remove colsed button and add opened button image
    //             rows[i].cells[ModelBrowserColumns3D.Component].children[0].classList.remove("button_closed");
    //             rows[i].cells[ModelBrowserColumns3D.Component].children[0].classList.add("button_open");
    //         }

    //         $(rows[i]).show();
    //         this.OpenHighlightedRow(rows[i]);
    //         return;
    //     }
    // }
}

SCModelBrowser.prototype.GetTopMostParentNode = function (rowKey, path) {
    // if(rowKey !== -1 &&
    //    !path['path'].includes(rowKey))
    // {
    //     path['path'].push(rowKey);
    // }

    if (rowKey in this.NodeParentList) {

        if (this.NodeParentList[rowKey] === -1) {
            return;
        }
        path['path'].push(this.NodeParentList[rowKey])

        this.GetTopMostParentNode(this.NodeParentList[rowKey], path);
        // if (!parent ||
        //     parent === -1) {
        //         return rowKey;
        // }        
    }

    //return undefined;

    // var record = $(containerDiv).igTreeGrid("findRecordByKey", rowKey);

    // var rowData = {};
    // rowData['component'] = record[ModelBrowserColumnNames3D.Component.replace(/\s/g, '')];
    // rowData['mainClass'] = record[ModelBrowserColumnNames3D.MainClass.replace(/\s/g, '')];
    // rowData['subClass'] = record[ModelBrowserColumnNames3D.SubClass.replace(/\s/g, '')];
    // rowData['nodeId'] = record[ModelBrowserColumnNames3D.NodeId.replace(/\s/g, '')];

    // if (record.parent !== -1) {
    //     var result = this.GetHierarchyToRow(record.parent,
    //         containerDiv);

    //     if (result) {
    //         result['children'].push(rowData);
    //         return result;
    //     }
    // }

    // return rowData;
}

SCModelBrowser.prototype.GetDataFromSelectedRow = function (rowKey,
    containerDiv,
    iterateChilds) {

    var record = $(containerDiv).igTreeGrid("findRecordByKey", rowKey);

    var rowData = {};
    rowData['component'] = record[ModelBrowserColumnNames3D.Component.replace(/\s/g, '')];
    rowData['mainClass'] = record[ModelBrowserColumnNames3D.MainClass.replace(/\s/g, '')];
    rowData['subClass'] = record[ModelBrowserColumnNames3D.SubClass.replace(/\s/g, '')];
    rowData['nodeId'] = record[ModelBrowserColumnNames3D.NodeId.replace(/\s/g, '')];

    if (iterateChilds && record.childData) {
        rowData['children'] = [];

        for (var i = 0; i < record.childData.length; i++) {
            var child = record.childData[i];

            var result = this.GetDataFromSelectedRow(child[ModelBrowserColumnNames3D.NodeId.replace(/\s/g, '')],
                containerDiv,
                iterateChilds);
            if (result) {
                rowData['children'].push(result);
            }
        }
    }
    // $(function () {

    //     var data = $(containerDiv).data("igTreeGrid").dataSource.dataView();
    //     var component = data[rowIndex][ModelBrowserColumnNames3D.Component.replace(/\s/g, '')];
    //     var mainClass = data[rowIndex][ModelBrowserColumnNames3D.MainClass.replace(/\s/g, '')];
    //     var subClass = data[rowIndex][ModelBrowserColumnNames3D.SubClass.replace(/\s/g, '')];
    //     var nodeId = data[rowIndex][ModelBrowserColumnNames3D.NodeId.replace(/\s/g, '')];


    //     rowData['component'] = component;
    //     rowData['mainClass'] = mainClass;
    //     rowData['subClass'] = subClass;
    //     rowData['nodeId'] = nodeId;

    // });

    return rowData;
}

SCModelBrowser.prototype.GetBrowserRowFromNodeId = function (selectedNodeId, containerDiv) {

    //var dataSource = $("#"+containerDiv).data("igTreeGrid").dataSource.dataView();
    //var selectedRecord = $("#"+containerDiv).igTreeGrid("findRecordByKey", selectedNodeId);

    var browserTable = document.getElementById(containerDiv);
    var rows = browserTable.getElementsByTagName("tr");

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];

        var columns = row.cells;
        if (columns.length === 0) {
            continue;
        }

        var nodeIdString = columns[ModelBrowserColumns3D.NodeId].innerHTML;
        //var nodeIdString = dataSource[row.rowIndex].NodeId;
        // var nodeIdString = selectedRecord.NodeId;
        var nodeId = parseInt(nodeIdString.trim());

        if (selectedNodeId === nodeId) {

            return row;
            // this.SelectionManager.HandleRowSelect(row, undefined);

            // this.OpenHighlightedRow(childRow);

            // // scroll to selected row
            // browserTable.parentElement.parentElement.focus();
            // browserTable.parentElement.parentElement.scrollTop = childRow.offsetTop - childRow.offsetHeight;
            // break;
        }
    }

    return undefined;
}