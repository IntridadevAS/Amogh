// <reference path="../hoops_web_viewer.d.ts"/>
// <reference path="../common/Example.ts"/>
var xCheckStudio;
(function (xCheckStudio) {
    var Ui;
    (function (Ui) {
        var ModelTree = /** @class */ (function () {
            function ModelTree(elementId, viewer) {
                this._size = new Communicator.Point2(768, 570);
                this._elementId = elementId;
                this._viewer = viewer;

                this.NodeGroups = [];

                this._createElements();
                this._initEvents();

                this.selectedCompoents = [];
            }
            ModelTree.prototype._createElements = function () {
                var _this = this;

                // get container element Id 
                var containerElement = document.getElementById(this._elementId);

                // create div element to hold model browser 
                var tableDiv = document.createElement("div");
                tableDiv.className = "scrollable";
                tableDiv.style.width = this._size.x + "px";
                tableDiv.style.height = this._size.y + "px";
                containerElement.appendChild(tableDiv);

                // create model browser table
                _this.ModelBrowserTable = document.createElement("Table");
                _this.ModelBrowserTable.style.width = this._size.x + "px";
                tableDiv.appendChild(_this.ModelBrowserTable);

                //create header for table
                tableHeading = document.createElement("tr");
                tableHeading.style.backgroundColor = "#3498db";

                var td = document.createElement("td");
                td.innerHTML = "Check";
                td.style.fontSize = "12px";
                tableHeading.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = "Component";
                td.style.fontSize = "12px";
                tableHeading.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = "MainComponentClass";
                td.style.fontSize = "12px";
                tableHeading.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = "SubComponentClass";
                td.style.fontSize = "12px";
                tableHeading.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = "Source"
                td.style.fontSize = "12px";
                tableHeading.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = "Destination"
                td.style.fontSize = "12px";
                tableHeading.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = "OwnerId"
                td.style.fontSize = "12px";
                tableHeading.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = "NodeId "
                td.style.fontSize = "12px";
                tableHeading.appendChild(td);

                this.ModelBrowserTable.appendChild(tableHeading);

            };

            ModelTree.prototype._initEvents = function () {
                var _this = this;
                this._viewer.setCallbacks({
                    assemblyTreeReady: function () {
                        // _this.viewNode(_this._viewer.model.getAbsoluteRootNode());
                    },
                    selectionArray: function (selectionEvents) {
                        for (var _i = 0, selectionEvents_1 = selectionEvents; _i < selectionEvents_1.length; _i++) {
                            var selectionEvent = selectionEvents_1[_i];
                            var selection = selectionEvent.getSelection();
                            if (selection.isNodeSelection()) {
                                var nodeId = selection.getNodeId();
                                var model = _this._viewer.model;
                                if (model.isNodeLoaded(nodeId)) {
                                    //_this.viewNode(nodeId);
                                }
                            }
                        }
                    }
                });
            };


            ModelTree.prototype.revisedRandId = function () {
                return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
            }

            ModelTree.prototype.addComponentRow = function (nodeId, styleList, componentStyleClass) {
                var _this = this;

                var model = this._viewer.model;
                var componentName = model.getNodeName(nodeId);

                var row = document.createElement("tr");
                row.style.backgroundColor = "#ffffff";
                if (styleList !== undefined) {
                    row.classList = styleList;
                }
                this.ModelBrowserTable.appendChild(row);

                //add node properties to model browser table
                var nodeData;
                if (this._viewer._params.containerId === "viewerContainer1") {
                    nodeData = xCheckStudioInterface1.nodeIdVsComponentData[nodeId];
                }
                else if (this._viewer._params.containerId === "viewerContainer2") {
                    nodeData = xCheckStudioInterface2.nodeIdVsComponentData[nodeId];
                }

                var td = document.createElement("td");
                var checkBox = document.createElement("INPUT");
                checkBox.setAttribute("type", "checkbox");
                checkBox.checked = true;
                td.appendChild(checkBox);
                row.appendChild(td);

                // select component check box state change event
                checkBox.onchange = function () {
                    _this.handleComponentCheck(this);
                }

                td = document.createElement("td");
                if (nodeData != undefined) {

                    td.innerHTML = componentName;
                    td.style.fontSize = "12px";
                    var isAssemblyNodeType = this.isAssemblyNode(nodeId);
                    if (isAssemblyNodeType) {

                        td.className = componentStyleClass;
                    }

                    td.style.cursor = "pointer";
                    row.appendChild(td);

                    td = document.createElement("td");
                    td.innerHTML = (nodeData.MainComponentClass != undefined ? nodeData.MainComponentClass : "");
                    td.style.fontSize = "12px";
                    row.appendChild(td);

                    td = document.createElement("td");
                    td.innerHTML = (nodeData.SubComponentClass != undefined ? nodeData.SubComponentClass : "");
                    td.style.fontSize = "12px";
                    row.appendChild(td);

                    td = document.createElement("td");
                    td.innerHTML = (nodeData.Source != undefined ? nodeData.Source : "");
                    td.style.fontSize = "12px";
                    row.appendChild(td);

                    td = document.createElement("td");
                    td.innerHTML = (nodeData.Destination != undefined ? nodeData.Destination : "");
                    td.style.fontSize = "12px";
                    row.appendChild(td);

                    td = document.createElement("td");
                    td.innerHTML = (nodeData.OwnerId != undefined ? nodeData.OwnerId : "");
                    td.style.fontSize = "12px";
                    row.appendChild(td);

                    td = document.createElement("td");
                    td.innerHTML = (nodeData.NodeId != undefined ? nodeData.NodeId : "");
                    td.style.fontSize = "12px";
                    row.appendChild(td);
                }
                else {

                    td.innerHTML = componentName;
                    td.style.fontSize = "12px";
                    var isAssemblyNodeType = this.isAssemblyNode(nodeId);
                    if (isAssemblyNodeType) {

                        td.className = componentStyleClass;
                    }
                    td.style.cursor = "pointer";
                    row.appendChild(td);

                    td = document.createElement("td");
                    td.innerHTML = "";
                    td.style.fontSize = "12px";
                    row.appendChild(td);

                    td = document.createElement("td");
                    td.innerHTML = ""
                    td.style.fontSize = "12px";
                    row.appendChild(td);

                    td = document.createElement("td");
                    td.innerHTML = ""
                    td.style.fontSize = "12px";
                    row.appendChild(td);

                    td = document.createElement("td");
                    td.innerHTML = ""
                    td.style.fontSize = "12px";
                    row.appendChild(td);

                    td = document.createElement("td");
                    td.innerHTML = ""
                    td.style.fontSize = "12px";
                    row.appendChild(td);

                    td = document.createElement("td");
                    td.innerHTML = ""
                    td.style.fontSize = "12px";
                    row.appendChild(td);
                }

                // maintain track of selected components
                var checkedComponent = {
                    'Name': row.cells[1].textContent,
                    'MainComponentClass': row.cells[2].textContent,
                    'SubComponentClass': row.cells[3].textContent,
                    'Source': row.cells[4].textContent,
                    'Destination': row.cells[5].textContent,
                    'Owner': row.cells[6].textContent
                };
                this.selectedCompoents.push(checkedComponent);

                if (this.NodeGroups.indexOf(componentStyleClass) === -1) {
                    this.NodeGroups.push(componentStyleClass);
                }

                // click event for each row               
                row.onclick = function () {

                    if (_this.SelectedComponentRow === this) {
                        return;
                    }

                    if (_this.SelectedComponentRow) {
                        _this.RestoreBackgroundColor(_this.SelectedComponentRow);
                    }

                    _this.BrowserItemClick(nodeId, this);
                    _this.SelectedComponentRow = this;

                    if (checkManager != undefined) {
                        componentIdentifier = this.children[0].innerText.trim();
                        if (this.children[1].innerHTML === "PipingNetworkSegment") {
                            componentIdentifier += "_" + this.children[3].innerHTML + "_" + this.children[4].innerHTML + "_" + this.children[5].innerHTML;
                        }
                        //to select component row in other viewer
                        _this.selectComponentRow(componentIdentifier);
                    }
                };

                // row mouse hover event
                var createMouseHoverHandler = function (currentRow) {
                    return function () {
                        _this.ChangeBackgroundColor(currentRow);
                    };
                };
                row.onmouseover = createMouseHoverHandler(row);

                // row mouse out event
                var createMouseOutHandler = function (currentRow) {
                    return function () {
                        if (_this.SelectedComponentRow !== currentRow) {
                            _this.RestoreBackgroundColor(currentRow);
                        }
                    };
                };
                row.onmouseout = createMouseOutHandler(row);
            }


            ModelTree.prototype.selectedCompoentExists = function (componentRow) {
                for (var i = 0; i < this.selectedCompoents.length; i++) {
                    var component = this.selectedCompoents[i];
                    if (component['Name'] === componentRow.cells[1].textContent.trim() &&
                        component['MainComponentClass'] === componentRow.cells[2].textContent.trim() &&
                        component['SubComponentClass'] === componentRow.cells[3].textContent.trim() &&
                        component['Source'] == componentRow.cells[4].textContent.trim() &&
                        component['Destination'] === componentRow.cells[5].textContent.trim() &&
                        component['Owner'] === componentRow.cells[6].textContent.trim()) {
                        return true;
                    }
                }

                return false;
            }
            
            ModelTree.prototype.isComponentSelected = function(componentProperties)
            {
                for (var i = 0; i < this.selectedCompoents.length; i++) {
                    var component = this.selectedCompoents[i];
                    if (component['Name'] ===componentProperties.Name &&
                        component['MainComponentClass'] === componentProperties.MainComponentClass &&
                        component['SubComponentClass'] === componentProperties.SubComponentClass &&                        
                        (componentProperties.Source === undefined  || component['Source'] == componentProperties.Source) &&
                        (componentProperties.Destination === undefined  || component['Destination'] == componentProperties.Destination) &&
                        (componentProperties.OwnerId === undefined  || component['Owner'] == componentProperties.OwnerId))
                        return true;
                    }              

                return false;
            }

            ModelTree.prototype.removeFromselectedCompoents = function (componentRow) {
                for (var i = 0; i < this.selectedCompoents.length; i++) {
                    var component = this.selectedCompoents[i];
                    if (component['Name']  === componentRow.cells[1].textContent.trim() &&
                        component['MainComponentClass'] === componentRow.cells[2].textContent.trim() &&
                        component['SubComponentClass'] === componentRow.cells[3].textContent.trim() &&
                        component['Source'] === componentRow.cells[4].textContent.trim() &&
                        component['Destination'] === componentRow.cells[5].textContent.trim() &&
                        component['Owner'] === componentRow.cells[6].textContent.trim()) {

                        this.selectedCompoents.splice(i, 1);
                        break;
                    }
                }
            }

            ModelTree.prototype.handleComponentCheck = function (currentCheckBox) {

                var currentCell = currentCheckBox.parentElement;
                if (currentCell.tagName.toLowerCase() !== 'td') {
                    return;
                }

                var currentRow = currentCell.parentElement;
                if (currentRow.tagName.toLowerCase() !== 'tr' ||
                    currentRow.cells.length < 2) {
                    return;
                }

                // maintain track of selected/deselected components
                if (currentCheckBox.checked &&
                    !this.selectedCompoentExists(currentRow)) {

                    var checkedComponent = {
                        'Name': currentRow.cells[1].textContent.trim(),
                        'MainComponentClass': currentRow.cells[2].textContent.trim(),
                        'SubComponentClass': currentRow.cells[3].textContent.trim(),
                        'Source': currentRow.cells[4].textContent.trim(),
                        'Destination': currentRow.cells[5].textContent.trim(),
                        'Owner': currentRow.cells[6].textContent.trim()
                    };

                    this.selectedCompoents.push(checkedComponent);
                }
                else if (this.selectedCompoentExists(currentRow)) {
                    this.removeFromselectedCompoents(currentRow);
                }

                var currentTable = currentRow.parentElement;
                if (currentTable.tagName.toLowerCase() !== 'table') {
                    return;
                }

                var currentComponentCell = currentRow.cells[1];
                var currentRowStyle = currentComponentCell.className;

                //var currentClassList = currentRow.classList;
                var currentClassName = currentRow.className;
                var index = currentClassName.lastIndexOf(" ");

                // check/uncheck all child and further child rows
                var styleToCheck = currentClassName + " " + currentRowStyle;
                for (var i = 0; i < currentTable.rows.length; i++) {

                    var row = currentTable.rows[i];
                    if (row === currentRow) {
                        continue;
                    }

                    if (row.className === styleToCheck) {

                        var checkBox = row.cells[0].children[0];
                        if (checkBox.checked === currentCheckBox.checked) {
                            continue;
                        }

                        checkBox.checked = currentCheckBox.checked;
                        this.handleComponentCheck(checkBox);
                    }
                }
            }

            ModelTree.prototype.selectComponentRow = function (componentIdentifier) {
                if (this._viewer._params.containerId == "viewerContainer2") {
                    children = xCheckStudioInterface1._modelTree.ModelBrowserTable.children;
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if (child.childElementCount > 0) {
                            childCell = child.children[0];
                            childComponentIdentifier = childCell.textContent.trim();
                            if (child.children[1].innerHTML === "PipingNetworkSegment") {
                                childComponentIdentifier += "_" + child.children[3].innerHTML + "_" + child.children[4].innerHTML + "_" + child.children[5].innerHTML
                            }
                            if (childComponentIdentifier === componentIdentifier) {
                                if (xCheckStudioInterface1._modelTree.SelectedComponentRow !== undefined) {
                                    this.RestoreBackgroundColor(xCheckStudioInterface1._modelTree.SelectedComponentRow);
                                }

                                xCheckStudioInterface1._modelTree.SelectedComponentRow = child;
                                xCheckStudioInterface1._modelTree.SelectedComponentRow.style.backgroundColor = "#9999ff";
                            }
                        }
                    }
                }
                else if (this._viewer._params.containerId == "viewerContainer1") {
                    children = xCheckStudioInterface2._modelTree.ModelBrowserTable.children;
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if (child.childElementCount > 0) {
                            childCell = child.children[0];
                            childComponentIdentifier = childCell.textContent;
                            if (child.children[1].innerHTML === "PipingNetworkSegment") {
                                childComponentIdentifier += "_" + child.children[3].innerHTML + "_" + child.children[4].innerHTML + "_" + child.children[5].innerHTML
                            }
                            if (childComponentIdentifier === componentIdentifier) {
                                if (xCheckStudioInterface2._modelTree.SelectedComponentRow !== undefined) {
                                    this.RestoreBackgroundColor(xCheckStudioInterface2._modelTree.SelectedComponentRow);
                                }

                                xCheckStudioInterface2._modelTree.SelectedComponentRow = child;
                                xCheckStudioInterface2._modelTree.SelectedComponentRow.style.backgroundColor = "#9999ff";
                            }
                        }
                    }
                }
            };


            ModelTree.prototype.BrowserItemClick = function (nodeId, thisRow) {

                this._viewer.selectPart(nodeId);
                this._viewer.view.fitNodes([nodeId]);
                if (checkManager != undefined) {
                    if (this._viewer._params.containerId == "viewerContainer2") {
                        xCheckStudioInterface1._modelTree._viewer.selectPart(nodeId);
                        xCheckStudioInterface1._firstViewer.view.fitNodes([nodeId]);
                    }
                    else if (this._viewer._params.containerId == "viewerContainer1") {
                        xCheckStudioInterface2._modelTree._viewer.selectPart(nodeId);
                        xCheckStudioInterface2._firstViewer.view.fitNodes([nodeId]);
                    }
                }

            };

            ModelTree.prototype.ChangeBackgroundColor = function (row) {
                row.style.backgroundColor = "#B2BABB";
            }

            ModelTree.prototype.RestoreBackgroundColor = function (row) {
                row.style.backgroundColor = "#ffffff";
            }

            ModelTree.prototype.getComponentstyleClass = function (componentName) {
                var componentStyleClass = componentName.replace(" ", "");
                componentStyleClass = componentStyleClass.replace(":", "");
                if (this._viewer._params.containerId === "viewerContainer2") {
                    componentStyleClass += "-viewer2";
                }
                else if (this._viewer._params.containerId === "viewerContainer1") {
                    componentStyleClass += "-viewer1";
                }
                while (this.NodeGroups.includes(componentStyleClass)) {
                    componentStyleClass += "-" + this.revisedRandId();
                }
                return componentStyleClass;
            }

            ModelTree.prototype.addModelBrowserComponent = function (nodeId, styleList) {
                if (nodeId !== null) {
                    var model = this._viewer.model;
                    var children = model.getNodeChildren(nodeId);

                    if (children.length > 0) {
                        var componentName = model.getNodeName(nodeId);

                        var componentStyleClass = this.getComponentstyleClass(componentName);

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
                            this.addModelBrowserComponent(child, collapsibleCellStyle);
                        }
                    }
                }

            };

            ModelTree.prototype.isAssemblyNode = function (nodeId) {
                var nodeType = this._viewer.model.getNodeType(nodeId);
                if (nodeType == Communicator.NodeType.AssemblyNode) {
                    return true;
                }
                else {
                    return false;
                }
            };

            //to create collapsible table rows in model browser
            //https://jsfiddle.net/y4Mdy/1372/
            ModelTree.prototype.CreateGroup = function (group_name) {
                var _this = this;
                // Create Button(Image)
                $('td.' + group_name).prepend("<img class='" + group_name + " button_closed'> ");
                // Add Padding to Data
                $('tr.' + group_name).each(function () {
                    var first_td = $(this).children('td').first();
                    var padding_left = parseInt($(first_td).css('padding-left'));
                    $(first_td).css('padding-left', String(padding_left + 15) + 'px');
                });
                this.RestoreGroup(group_name);

                // Tie toggle function to the button
                $('img.' + group_name).click(function () {
                    _this.ToggleGroup(group_name);
                });
            }

            //to create collapsible table rows in model browser
            //https://jsfiddle.net/y4Mdy/1372/
            ModelTree.prototype.ToggleGroup = function (group_name) {
                this.ToggleButton($('img.' + group_name));
                this.RestoreGroup(group_name);
                if (this._viewer._params.containerId === "viewerContainer1") {
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
                else if (this._viewer._params.containerId === "viewerContaine2") {
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
                    xCheckStudioInterface1._modelTree.ToggleButton($('img.' + temp));
                    xCheckStudioInterface1._modelTree.RestoreGroup(temp);
                }
            }

            ModelTree.prototype.OpenGroup = function (group_name, child_groupName) {
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
            ModelTree.prototype.RestoreGroup = function (group_name) {
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
            ModelTree.prototype.ToggleButton = function (button) {
                $(button).toggleClass('button_open');
                $(button).toggleClass('button_closed');
            }


            ModelTree.prototype.HighlightModelBrowserRow = function (componentIdentifier) {
                // if (checkManager != undefined) {
                browserTableRows = this.ModelBrowserTable.getElementsByTagName("tr");
                for (var i = 0; i < browserTableRows.length; i++) {
                    var childRow = browserTableRows[i];
                    var childRowColumns = childRow.cells;
                    var rowIdentifier = childRowColumns[0].innerText;
                    /*
                    add comment
                    */
                    rowIdentifier = rowIdentifier.trim();
                    if (childRowColumns.length > 0) {
                        if (childRowColumns[1].innerHTML === "PipingNetworkSegment") {
                            for (var j = 1; j < childRowColumns.length; j++) {
                                if ((j == 3 || j == 4 || j == 5) && childRowColumns[j].innerText != undefined) {
                                    inner_Text = (childRowColumns[j].innerText);
                                    inner_Text = inner_Text.trim();
                                    rowIdentifier += "_" + inner_Text;
                                }
                            }
                        }
                        if (componentIdentifier === rowIdentifier) {
                            if (this.SelectedComponentRow) {
                                this.RestoreBackgroundColor(this.SelectedComponentRow);
                            }

                            this.ChangeBackgroundColor(childRow)
                            this.SelectedComponentRow = childRow;

                            break;
                        }

                    }

                }
                // }
            }

            return ModelTree;
        }());
        Ui.ModelTree = ModelTree;
    })(Ui = xCheckStudio.Ui || (xCheckStudio.Ui = {}));
})(xCheckStudio || (xCheckStudio = {}));
