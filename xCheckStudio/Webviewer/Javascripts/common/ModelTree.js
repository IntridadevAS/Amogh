var modelBrowserCheckColumn = 0;
var modelBrowserComponentColumn = 1;
var modelBrowserMainClassColumn = 2;
var modelBrowserSubClassColumn = 3;
var modelBrowserSourceColumn = 4;
var modelBrowserDestinationColumn = 5;
var modelBrowserOwnerColumn = 6;
var modelBrowserNodeIdColumn = 7;

var xCheckStudio;
(function (xCheckStudio) {
    var Ui;
    (function (Ui) {
        var ModelTree = /** @class */ (function () {
            function ModelTree(elementId, viewer, sourceType) {
                this._size = new Communicator.Point2(556, 364);
                this._elementId = elementId;
                this._viewer = viewer;
                this.SourceType = sourceType;

                this.NodeIdVsCellClassList = {};
                this.RowIndexVsRowClassList = {};
                this.modelTreeColumnHeaders = [];
                this.modelTreeRowData = [];

                this.selectedCompoents = [];

                this.NodeGroups = [];

                this._createElements();
                this._initEvents();

                
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
                columnHeader["title"] = "Source";
                columnHeader["name"] = "Source";
                columnHeader["type"] = "text";
                columnHeader["width"] = "0";
                columnHeader["filtering"] = "false";
                columnHeader["sorting"] = "false";
                _this.modelTreeColumnHeaders.push(columnHeader);

                columnHeader = {};
                columnHeader["title"] = "Destination";
                columnHeader["name"] = "Destination";
                columnHeader["type"] = "text";
                columnHeader["width"] = "0";
                columnHeader["filtering"] = "false";
                columnHeader["sorting"] = "false";
                _this.modelTreeColumnHeaders.push(columnHeader);

                columnHeader = {};
                columnHeader["title"] = "OwnerId";
                columnHeader["name"] = "OwnerId";
                columnHeader["type"] = "text";
                columnHeader["width"] = "0";
                columnHeader["filtering"] = "false";
                columnHeader["sorting"] = "false";
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

            ModelTree.prototype._initEvents = function () {
                var _this = this;
                this._viewer.setCallbacks({
                    assemblyTreeReady: function () {
                    },
                    selectionArray: function (selectionEvents) {
                        for (var _i = 0, selectionEvents_1 = selectionEvents; _i < selectionEvents_1.length; _i++) {
                            var selectionEvent = selectionEvents_1[_i];
                            var selection = selectionEvent.getSelection();
                            if (selection.isNodeSelection()) {
                                var nodeId = selection.getNodeId();
                                var model = _this._viewer.model;
                                if (model.isNodeLoaded(nodeId)) {
                                }
                            }
                        }
                    }
                });
            };


            ModelTree.prototype.revisedRandId = function () {
                return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
            }
            
            ModelTree.prototype.addClassesToModelBrowser = function(){
                var modelBrowser = document.getElementById(this._elementId);
                var modelBrowserHeader = modelBrowser.children[0];
                var modelBrowserRowTable = modelBrowser.children[1].getElementsByTagName("table")[0];
                var modelBrowserRows = modelBrowserRowTable.getElementsByTagName("tr");
                for(var i = 0; i < modelBrowserRows.length; i++)
                {
                    var currentRow = modelBrowserRows[i];
                    if(currentRow.cells[7].innerHTML !== "")
                    {
                        var nodeId = currentRow.cells[7].innerHTML
                            var className = this.NodeIdVsCellClassList[nodeId] ;
                            if(className !== undefined)
                            { 
                                modelBrowserRows[i].cells[1].className = className;
                            }
                    }
                        var className = this.RowIndexVsRowClassList[currentRow.rowIndex]
                        if(className !== undefined)
                        {
                            var classList = className.split(" ");
                            for(var j =0; j < classList.length; j++)
                            {
                                modelBrowserRows[i].classList.add(classList[j]);
                            }
                            
                            this.RestoreBackgroundColor(modelBrowserRows[i])
                        } 
                }
            }

            ModelTree.prototype.addComponentRow = function (nodeId, styleList, componentStyleClass) {
                var _this = this;

                var model = this._viewer.model;
                var componentName = model.getNodeName(nodeId);
                if (styleList !== undefined) {
                    // row.classList = styleList;
                    _this.RowIndexVsRowClassList[_this.modelTreeRowData.length] = styleList;
                }

                //add node properties to model browser table
                var nodeData;
                if (this._viewer._params.containerId === "viewerContainer1") {
                    nodeData = xCheckStudioInterface1.nodeIdVsComponentData[nodeId];
                }
                else if (this._viewer._params.containerId === "viewerContainer2") {
                    nodeData = xCheckStudioInterface2.nodeIdVsComponentData[nodeId];
                }

                tableRowContent = {};
                var checkBox = document.createElement("INPUT");
                checkBox.setAttribute("type", "checkbox");
                checkBox.checked = false;

                tableRowContent[this.modelTreeColumnHeaders[0].name] = checkBox;

                // select component check box state change event
                checkBox.onchange = function () {
                    _this.handleComponentCheck(this);
                }

                if (nodeData != undefined) {

                    tableRowContent[this.modelTreeColumnHeaders[1].name] = componentName;
                    var isAssemblyNodeType = this.isAssemblyNode(nodeId);
                    if (isAssemblyNodeType) {
                        if (this.NodeGroups.indexOf(componentStyleClass) === -1) {
                            this.NodeIdVsCellClassList[nodeData.NodeId]  = componentStyleClass;
                        }
                    }

                    tableRowContent[this.modelTreeColumnHeaders[2].name] = (nodeData.MainComponentClass != undefined ? nodeData.MainComponentClass : "");

                    tableRowContent[this.modelTreeColumnHeaders[3].name] = (nodeData.SubComponentClass != undefined ? nodeData.SubComponentClass : "");

                    // extra cells for row item identification
                    tableRowContent[this.modelTreeColumnHeaders[4].name] = (nodeData.Source != undefined ? nodeData.Source : "");

                    tableRowContent[this.modelTreeColumnHeaders[5].name] = (nodeData.Destination != undefined ? nodeData.Destination : "");

                    tableRowContent[this.modelTreeColumnHeaders[6].name] = (nodeData.OwnerId != undefined ? nodeData.OwnerId : nodeData.OwnerHandle != undefined ? nodeData.OwnerHandle : "");

                    tableRowContent[this.modelTreeColumnHeaders[7].name] = (nodeData.NodeId != undefined ? nodeData.NodeId : "");
                }
                else {

                    tableRowContent[this.modelTreeColumnHeaders[1].name] = componentName;
                    var isAssemblyNodeType = this.isAssemblyNode(nodeId);
                    if (isAssemblyNodeType) {
                        this.NodeIdVsCellClassList[componentName]  = componentStyleClass;
                    }

                    tableRowContent[this.modelTreeColumnHeaders[2].name] = "";

                    tableRowContent[this.modelTreeColumnHeaders[3].name] = "";

                    // extra cells for row item identification
                    tableRowContent[this.modelTreeColumnHeaders[4].name] = "";

                    tableRowContent[this.modelTreeColumnHeaders[5].name] = "";

                    tableRowContent[this.modelTreeColumnHeaders[6].name] = "";

                    tableRowContent[this.modelTreeColumnHeaders[7].name] = "";
                }

                this.modelTreeRowData.push(tableRowContent);

                if (this.NodeGroups.indexOf(componentStyleClass) === -1) {
                    this.NodeGroups.push(componentStyleClass);
                }

                if (this._viewer._params.containerId === "viewerContainer1") {
                    sourceATotalItemCount = this.modelTreeRowData.length;
                }
                else if (this._viewer._params.containerId === "viewerContainer2") {
                    sourceBTotalItemCount = this.modelTreeRowData.length;
                }

              
            }


            ModelTree.prototype.selectedCompoentExists = function (componentRow) {
                var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(this.SourceType, 
                                                                                                                            componentRow.cells[2].textContent.trim());
                for (var i = 0; i < this.selectedCompoents.length; i++) {
                    var component = this.selectedCompoents[i];
                    if (component[identifierProperties.name] === componentRow.cells[1].textContent.trim() &&
                        component[identifierProperties.mainCategory] === componentRow.cells[2].textContent.trim() &&
                        component[identifierProperties.subClass] === componentRow.cells[3].textContent.trim() &&
                        component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegSourceProperty] == componentRow.cells[4].textContent.trim() &&
                        component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegDestinationProperty] == componentRow.cells[5].textContent.trim() &&
                        component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegOwnerProperty] == componentRow.cells[6].textContent.trim() &&
                        component[xCheckStudio.ComponentIdentificationManager.XMLEquipmentOwnerProperty] == componentRow.cells[6].textContent.trim()) {
                        return true;
                    }
                }

                return false;
            }

            ModelTree.prototype.isComponentSelected = function (componentProperties) {
                var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(this.SourceType, componentProperties.MainComponentClass);

                for (var i = 0; i < this.selectedCompoents.length; i++) {
                    var component = this.selectedCompoents[i];
                    if (component[identifierProperties.name] === componentProperties.Name &&
                        component[identifierProperties.mainCategory] === componentProperties.MainComponentClass &&
                        component[identifierProperties.subClass] === componentProperties.SubComponentClass) {

                        if (this.SourceType.toLowerCase() === "xml") {
                            // if source is xml check for addition identifying properties
                            if ((componentProperties.Source === undefined ||
                                component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegSourceProperty] == componentProperties.Source) &&
                                (componentProperties.Destination === undefined ||
                                    component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegDestinationProperty] == componentProperties.Destination) &&
                                (componentProperties.OwnerId === undefined ||
                                    component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegOwnerProperty] == componentProperties.OwnerId) ||
                                (componentProperties.OwnerId === undefined ||
                                        component[xCheckStudio.ComponentIdentificationManager.XMLEquipmentOwnerProperty] == componentProperties.OwnerId)) {
                                return true;
                            }
                        }
                        else {
                            return true;
                        }

                    }
                }

                return false;
            }

            ModelTree.prototype.removeFromselectedCompoents = function (componentRow) {

                var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(this.SourceType, componentRow.cells[2].textContent.trim());
                for (var i = 0; i < this.selectedCompoents.length; i++) {
                    var component = this.selectedCompoents[i];
                    if (component[identifierProperties.name] === componentRow.cells[1].textContent.trim() &&
                        component[identifierProperties.mainCategory] === componentRow.cells[2].textContent.trim() &&
                        component[identifierProperties.subClass] === componentRow.cells[3].textContent.trim() &&
                        component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegSourceProperty] == componentRow.cells[4].textContent.trim() &&
                        component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegDestinationProperty] == componentRow.cells[5].textContent.trim() &&
                        component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegOwnerProperty] == componentRow.cells[6].textContent.trim()) {
                        this.selectedCompoents.splice(i, 1);
                        break;
                    }
                }
            }

            ModelTree.prototype.getClassWiseCheckedComponents = function () {
                var classwiseCheckedComponents = {};
                var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(this.SourceType);
                var mainCategoryPropertyName = identifierProperties['mainCategory'];
                for (var i = 0; i < this.selectedCompoents.length; i++) {
                    var selectedComponent = this.selectedCompoents[i];
                    if(selectedComponent[mainCategoryPropertyName] === "")
                    {
                        continue;
                    }
                    if (selectedComponent[mainCategoryPropertyName] in classwiseCheckedComponents) {
                        // increment count of checked components for this main category
                        classwiseCheckedComponents[selectedComponent[mainCategoryPropertyName]] += 1;
                    }
                    else {
                        // add checked components count for this main category
                        classwiseCheckedComponents[selectedComponent[mainCategoryPropertyName]] = 1;
                    }
                }
                return classwiseCheckedComponents;
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

                    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(this.SourceType, 
                                                                                                                                currentRow.cells[modelBrowserMainClassColumn].textContent.trim());
                    var checkedComponent = {};
                    checkedComponent[identifierProperties.name] = currentRow.cells[modelBrowserComponentColumn].textContent.trim();
                    checkedComponent[identifierProperties.mainCategory] = currentRow.cells[modelBrowserMainClassColumn].textContent.trim();
                    checkedComponent[identifierProperties.subClass] = currentRow.cells[modelBrowserSubClassColumn].textContent.trim();
                    checkedComponent[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegSourceProperty] = currentRow.cells[modelBrowserSourceColumn].textContent.trim();
                    checkedComponent[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegDestinationProperty] = currentRow.cells[modelBrowserDestinationColumn].textContent.trim();
                    checkedComponent[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegOwnerProperty] = currentRow.cells[modelBrowserOwnerColumn].textContent.trim();

                    this.selectedCompoents.push(checkedComponent);
                }
                else if (this.selectedCompoentExists(currentRow)) {
                    this.removeFromselectedCompoents(currentRow);
                }

                var currentTable = currentRow.parentElement;
                if (currentTable.tagName.toLowerCase() !== 'tbody') {
                    return;
                }

                var currentComponentCell = currentRow.cells[1];
                var currentRowStyle = currentComponentCell.className;

                var currentClassList = currentRow.classList;
                // var currentClassName = currentRow.className;
                // var index = currentClassName.lastIndexOf(" ");

                // check/uncheck all child and further child rows
                // var styleToCheck = currentClassName + " " + currentRowStyle;

                //index 1 and 2 for class names from parent row
                var styleToCheck = currentClassList[1] + " " + currentClassList[2]+ " "+ currentRowStyle;
                for (var i = 0; i < currentTable.rows.length; i++) {

                    var row = currentTable.rows[i];
                    if (row === currentRow) {
                        continue;
                    }

                    var rowClassList = row.classList;

                    //index 1 and 2 for class names inherited from parent row 
                    // rowClassList[rowClassList.length -1] is for class applied for current row
                    var rowStyleCheck = rowClassList[1] + " "+ rowClassList[2]+ " "+ rowClassList[rowClassList.length -1];
                    // if (row.className === styleToCheck) {
                    if (rowStyleCheck === styleToCheck) {

                        var checkBox = row.cells[0].children[0];
                        if (checkBox.checked === currentCheckBox.checked) {
                            continue;
                        }

                        checkBox.checked = currentCheckBox.checked;
                        this.handleComponentCheck(checkBox);
                    }
                }
            }
             

            ModelTree.prototype.BrowserItemClick = function (nodeId, thisRow) {
                var nodeID = parseInt(nodeId)
                if (isNaN(nodeID)) {
                    return;
                }

                // keep track of graphically selected node
                if (this._viewer._params.containerId === "viewerContainer1") {
                    xCheckStudioInterface1._selectedNodeId = nodeID;
                }
                else if (this._viewer._params.containerId === "viewerContainer2") {
                    xCheckStudioInterface2._selectedNodeId = nodeID;
                }

                this._viewer.selectPart(nodeID);
                this._viewer.view.fitNodes([nodeID]);
            };

            ModelTree.prototype.ChangeBackgroundColor = function (row) {
                for (var j = 0; j < row.cells.length; j++) {
                    cell = row.cells[j];
                    cell.style.backgroundColor = "#B2BABB"
                }
            }
        
            ModelTree.prototype.RestoreBackgroundColor = function (row) {
                for (var j = 0; j < row.cells.length; j++) {
                    cell = row.cells[j];
                    cell.style.backgroundColor = "#ffffff"
                }
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

            ModelTree.prototype.addModelBrowser = function (nodeId, styleList) {
                this.addModelBrowserComponent(nodeId, styleList);

                this.loadModelBrowserTable();

                var modelBrowserData = document.getElementById(this._elementId);
                var modelBrowserDataTable = modelBrowserData.children[1];
                // var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");
                // var  countBox;
                // if (this._elementId === "modelTree1") {
                //     countBox = document.getElementById("totalComponentCount1");
                // }
                // if (this._elementId === "modelTree2") {
                //     countBox = document.getElementById("totalComponentCount2");
                // }
                // // countBox.innerText =  "Count :" + modelBrowserTableRows.length;
                // // countBox.style.fontSize = "20px";


                var modelBrowserHeaderTable = modelBrowserData.children[0];
                modelBrowserHeaderTable.style.position = "fixed"
                modelBrowserHeaderTable.style.width= "554px";
                modelBrowserHeaderTable.style.overflowX = "hide";
                var modelBrowserHeaderTableRows = modelBrowserHeaderTable.getElementsByTagName("tr");
                for(var j =0; j < modelBrowserHeaderTableRows.length; j++)
                {
                    var currentRow = modelBrowserHeaderTableRows[j];
                    for(var i = 0; i < currentRow.cells.length; i++)
                    {
                        if(i === 4 || i === 5 || i === 6 || i === 7)
                        {
                            currentRow.cells[i].style.display = "none";
                        }
                        if( j === 1 && i === 0)
                        {
                            currentRow.cells[i].innerHTML = ""
                        }
                    }
                }

    
                modelBrowserDataTable.style.position = "static"
                modelBrowserDataTable.style.width= "556px";
                modelBrowserDataTable.style.margin = "45px 0px 0px 0px"
            };

            ModelTree.prototype.addModelBrowserComponent = function (nodeId, styleList) {
                if (nodeId !== null) {
                    var model = this._viewer.model;
                    var children = model.getNodeChildren(nodeId);

                    if (children.length > 0) {
                        var componentName = model.getNodeName(nodeId);

                        var componentStyleClass = this.getComponentstyleClass(componentName);
                        componentStyleClass = componentStyleClass.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

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
                            this.addModelBrowserComponent(child, collapsibleCellStyle);
                        }
                    }
                  
                }

            };

            ModelTree.prototype.loadModelBrowserTable = function () {

                var _this = this;
                var viewerContainer = "#" + _this._elementId;
                var columnHeaders = _this.modelTreeColumnHeaders;
                var tableData = _this.modelTreeRowData;

                $(function () {
                    var db = {
                        loadData: filter => {
                        //  if(filter.Component === "" && filter.MainComponentClass === "" && filter.SubComponentClass === "")
                        //  {
                        //      if(xCheckStudioInterface1 !== undefined && xCheckStudioInterface1._modelTree !== undefined)
                        //      {
                        //         // xCheckStudioInterface1._modelTree.addModelBrowser(xCheckStudioInterface1._firstViewer.model.getAbsoluteRootNode(), undefined);
                        //         // xCheckStudioInterface1._modelTree.addClassesToModelBrowser();
                        //         // for (var i = 0; i < xCheckStudioInterface1._modelTree.NodeGroups.length; i++) {
                        //         //     xCheckStudioInterface1._modelTree.CreateGroup(xCheckStudioInterface1._modelTree.NodeGroups[i]);
                        //         // }
                        //      }
                        //      else if(xCheckStudioInterface2 !== undefined && xCheckStudioInterface2._modelTree !== undefined)
                        //      {
                        //         // xCheckStudioInterface2._modelTree.addModelBrowser(xCheckStudioInterface2._firstViewer.model.getAbsoluteRootNode(), undefined);
                        //         // xCheckStudioInterface2._modelTree.addClassesToModelBrowser();
                        //         // for (var i = 0; i < xCheckStudioInterface2._modelTree.NodeGroups.length; i++) {
                        //         //     xCheckStudioInterface2._modelTree.CreateGroup(xCheckStudioInterface2._modelTree.NodeGroups[i]);
                        //         // }
                        //      }
                            
                        //  }
                        //  else{
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
                        //  }
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
                        onRefreshed: function(config) {      
                            _this.AddTableContentCount(this._container.context.id);
                        },
                        rowClick: function (args) {
                            if (args.event.target.type === "checkbox") {
                                checkBox = args.event.target;
                                // select component check box state change event
                                checkBox.onchange = function () {
                                    _this.handleComponentCheck(this);
                                }
                            }
                            else {
                                if (_this.SelectedComponentRow === args.event.currentTarget) {
                                    return;
                                }

                                if (_this.SelectedComponentRow) {
                                    _this.RestoreBackgroundColor(_this.SelectedComponentRow);
                                }

                                var nodeId = args.event.currentTarget.cells[7].innerText
                               if(nodeId !== undefined)
                               {
                                    _this.BrowserItemClick(nodeId, args.event.currentTarget);
                               }
                                _this.SelectedComponentRow = args.event.currentTarget;
                                _this.ChangeBackgroundColor(_this.SelectedComponentRow );
                            }                               
                        }
                        
                    });
    
                });
    
                //add all rows to this.selectedComponents array
                // this.addselectedRowsToArray(viewerContainer)
    
    
            var container = document.getElementById(viewerContainer.replace("#", ""));

            // var modelBrowser = container;
            // var modelBrowserHeader = modelBrowser.children[0];
            // var headers = modelBrowserHeader.getElementsByTagName("th");
            // for(var i =0; i < headers.length; i++)
            // {
            //     var currentHeader = headers[i];
            //     if(i===0)
            //     {
            //         currentHeader.style.position = "fixed";
            //     }
            //     else{
            //         currentHeader.style.position = "relative";
            //     }
                
                
            // }
            container.style.width = "556px"
            container.style.height = "364px"
            container.style.margin = "0px"
            container.style.overflowX = "hide";
            container.style.overflowY = "scroll";
            container.style.padding = "0";
        };

        ModelTree.prototype.AddTableContentCount = function(containerId){
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

        ModelTree.prototype.addselectedRowsToArray = function (viewerContainer){
            var container = document.getElementById(viewerContainer.replace("#", ""));
            var modelTreeContainerElement = container;
    
            var modelTreeHeaderDiv = modelTreeContainerElement.children[0];
    
            var modelBrowserTable = modelTreeContainerElement.children[1];
            var modelBrowserTableRows = modelBrowserTable.getElementsByTagName("tr");
    
            for(var i =0; i < modelBrowserTableRows.length; i++)
            {
                var row = modelBrowserTableRows[i];
    
                 var checkedComponent = {
                    'Name': row.cells[modelBrowserComponentColumn].textContent,
                    'MainComponentClass': row.cells[modelBrowserMainClassColumn].textContent,
                    'SubComponentClass': row.cells[modelBrowserSubClassColumn].textContent,
                    'Source': row.cells[modelBrowserSourceColumn].textContent,
                    'Destination': row.cells[modelBrowserDestinationColumn].textContent,
                    'Owner': row.cells[modelBrowserOwnerColumn].textContent
                };
                this.selectedCompoents.push(checkedComponent);
            }
    
           
        }
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

                var imageClass = group_name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

                // Create Button(Image)
                $('td.' + group_name).prepend("<img class='" + imageClass + " button_closed'> ");
                // Add Padding to Data
                $('tr.' + group_name).each(function () {
                    //var first_td = $(this).children('td').first();
                    var collapsibleButtonTd = $(this).find("td:eq(1)");

                    var padding_left = parseInt($(collapsibleButtonTd).css('padding-left'));
                    $(collapsibleButtonTd).css('padding-left', String(padding_left + 15) + 'px');
                });
                this.RestoreGroup(group_name);

                // Tie toggle function to the button
                $('img.' + imageClass).click(function () {
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

            ModelTree.prototype.OpenGroup = function (group_name, 
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
                var modelBrowser = document.getElementById(this._elementId);
                var modelBrowserHeader = modelBrowser.children[0];
                var modelBrowserRowTable = modelBrowser.children[1].getElementsByTagName("table")[0];
                var browserTableRows = modelBrowserRowTable.getElementsByTagName("tr");
                for (var i = 0; i < browserTableRows.length; i++) {
                    var childRow = browserTableRows[i];
                    var childRowColumns = childRow.cells;
                    var rowIdentifier = childRowColumns[modelBrowserComponentColumn].innerText;
                    /*
                    add comment
                    */
                    rowIdentifier = rowIdentifier.trim();
                    if (childRowColumns.length > 0) {
                        if (childRowColumns[2].innerText.trim() === "PipingNetworkSegment") {
                            for (var j = 1; j < childRowColumns.length; j++) {
                                if ((j == modelBrowserSourceColumn || j == modelBrowserDestinationColumn || j == modelBrowserOwnerColumn) && 
                                     childRowColumns[j].innerText != undefined) {
                                    
                                    inner_Text = (childRowColumns[j].innerText);
                                    inner_Text = inner_Text.trim();
                                    if(inner_Text === "")
                                    {
                                        inner_Text = "undefined"
                                    }
                                    rowIdentifier += "_" + inner_Text;
                                }
                            }
                        }
                        else if (childRowColumns[2].innerText.trim() === "Equipment") {
                            inner_Text = (childRowColumns[modelBrowserOwnerColumn].innerText);
                            inner_Text = inner_Text.trim();
                            if(inner_Text === "")
                            {
                                inner_Text = "undefined"
                            }
                            rowIdentifier += "_" + inner_Text;                
                        }

                        if (componentIdentifier === rowIdentifier) {
                            if (this.SelectedComponentRow) {
                                this.RestoreBackgroundColor(this.SelectedComponentRow);
                            }

                            this.ChangeBackgroundColor(childRow)
                            this.SelectedComponentRow = childRow;
                            
                            this.OpenHighlightedRow(childRow);

                            // scroll to selected row
                            modelBrowserRowTable.parentElement.parentElement.focus();
                            modelBrowserRowTable.parentElement.parentElement.scrollTop = childRow.offsetTop - childRow.offsetHeight;        
                            break;
                        }

                    }

                }
                // }
            }

            ModelTree.prototype.OpenHighlightedRow = function (currentRow) {
                $(currentRow).show();

                var currentClassName = currentRow.className;
                var index = currentClassName.lastIndexOf(" ");

                var inheritedStyle = currentClassName.substr(0, index);
                var parentsStyle = currentClassName.substr(index+1);     
                
                var rows = document.getElementsByClassName(inheritedStyle);
                for(var i = 0; i < rows.length; i++)
                {
                     if(parentsStyle === rows[i].cells[modelBrowserComponentColumn].className)
                     {                         
                         $(rows[i]).show();
                         this.OpenHighlightedRow(rows[i]);
                         break;
                     }
               }
            }

            return ModelTree;
        }());
        Ui.ModelTree = ModelTree;
    })(Ui = xCheckStudio.Ui || (xCheckStudio.Ui = {}));
})(xCheckStudio || (xCheckStudio = {}));
