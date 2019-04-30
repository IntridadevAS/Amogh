var modelBrowserCheckColumn = 0;
var modelBrowserComponentColumn = 1;
var modelBrowserMainClassColumn = 2;
var modelBrowserSubClassColumn = 3;
// var modelBrowserSourceColumn = 4;
// var modelBrowserDestinationColumn = 5;
// var modelBrowserOwnerColumn = 6;
var modelBrowserNodeIdColumn = 4;

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
                this.NodeIdVsRowClassList = {};
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

                // columnHeader = {};
                // columnHeader["title"] = "Source";
                // columnHeader["name"] = "Source";
                // columnHeader["type"] = "text";
                // columnHeader["width"] = "0";
                // columnHeader["filtering"] = "false";
                // columnHeader["sorting"] = "false";
                // _this.modelTreeColumnHeaders.push(columnHeader);

                // columnHeader = {};
                // columnHeader["title"] = "Destination";
                // columnHeader["name"] = "Destination";
                // columnHeader["type"] = "text";
                // columnHeader["width"] = "0";
                // columnHeader["filtering"] = "false";
                // columnHeader["sorting"] = "false";
                // _this.modelTreeColumnHeaders.push(columnHeader);

                // columnHeader = {};
                // columnHeader["title"] = "OwnerId";
                // columnHeader["name"] = "OwnerId";
                // columnHeader["type"] = "text";
                // columnHeader["width"] = "0";
                // columnHeader["filtering"] = "false";
                // columnHeader["sorting"] = "false";
                // _this.modelTreeColumnHeaders.push(columnHeader);

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

                        this.RestoreBackgroundColor(modelBrowserRows[i])
                    }
                }
            }

            ModelTree.prototype.addComponentRow = function (nodeId, styleList, componentStyleClass) 
            {
                var _this = this;

                var model = this._viewer.model;
                //var componentName = model.getNodeName(nodeId);
                if (styleList !== undefined) {
                    // row.classList = styleList;
                    _this.NodeIdVsRowClassList[nodeId] = styleList;
                }

                //add node properties to model browser table
                var nodeData;
                if (this._viewer._params.containerId === "viewerContainer1") {
                    nodeData = xCheckStudioInterface1.sourceProperties[nodeId];
                }
                else if (this._viewer._params.containerId === "viewerContainer2") {
                    nodeData = xCheckStudioInterface2.sourceProperties[nodeId];
                }

                if (nodeData == undefined) 
                {
                    return;
                }

                tableRowContent = {};              
                // if (nodeData != undefined) 
                // {
                    var checkBox = document.createElement("INPUT");
                    checkBox.setAttribute("type", "checkbox");
                    checkBox.checked = false;

                    tableRowContent[this.modelTreeColumnHeaders[0].name] = checkBox;

                    // select component check box state change event
                    checkBox.onchange = function () 
                    {
                        _this.handleComponentCheck(this);
                    }

                    tableRowContent[this.modelTreeColumnHeaders[1].name] = nodeData.Name;
                    var isAssemblyNodeType = this.isAssemblyNode(nodeId);
                    if (isAssemblyNodeType) 
                    {
                        if (this.NodeGroups.indexOf(componentStyleClass) === -1)
                         {
                            this.NodeIdVsCellClassList[nodeData.NodeId]  = componentStyleClass;
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

                if (this._viewer._params.containerId === "viewerContainer1") {
                    sourceATotalItemCount = this.modelTreeRowData.length;
                }
                else if (this._viewer._params.containerId === "viewerContainer2") {
                    sourceBTotalItemCount = this.modelTreeRowData.length;
                }

              
            }


            ModelTree.prototype.selectedCompoentExists = function (componentRow) {
                for (var i = 0; i < this.selectedCompoents.length; i++) {
                    var component = this.selectedCompoents[i];
                    if (component['Name'] === componentRow.cells[1].textContent.trim() &&
                        component['MainComponentClass'] === componentRow.cells[2].textContent.trim() &&
                        component['ComponentClass'] === componentRow.cells[3].textContent.trim() ) {
                        if ("NodeId" in component) {
                            if (component["NodeId"] === componentRow.cells[4].textContent.trim()) {
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

            ModelTree.prototype.isComponentSelected = function (componentProperties) {
                for (var i = 0; i < this.selectedCompoents.length; i++) {
                    var component = this.selectedCompoents[i];
                    if (component['Name'] === componentProperties.Name &&
                        component['MainComponentClass'] === componentProperties.MainComponentClass &&
                        component['ComponentClass'] === componentProperties.SubComponentClass) {

                        if ("NodeId" in component) {
                            if (component["NodeId"] === componentProperties.NodeId.toString()) {
                                return true;
                            }
                        }
                        else {
                            return true;
                        }

                        // if (this.SourceType.toLowerCase() === "xml") {
                        //     // if source is xml check for addition identifying properties
                        //     if ((componentProperties.Source === undefined ||
                        //         component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegSourceProperty] == componentProperties.Source) &&
                        //         (componentProperties.Destination === undefined ||
                        //             component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegDestinationProperty] == componentProperties.Destination) &&
                        //         (componentProperties.OwnerId === undefined ||
                        //             component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegOwnerProperty] == componentProperties.OwnerId)) {
                        //         return true;
                        //     }
                        // }
                        // else {
                        //return true;
                        //}
                    }
                }

                return false;
            }

            ModelTree.prototype.removeFromselectedCompoents = function (componentRow) {
                for (var i = 0; i < this.selectedCompoents.length; i++) {
                    var component = this.selectedCompoents[i];
                    if (component['Name'] === componentRow.cells[1].textContent.trim() &&
                        component['MainComponentClass'] === componentRow.cells[2].textContent.trim() &&
                        component['ComponentClass'] === componentRow.cells[3].textContent.trim() /*&&
                        component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegSourceProperty] == componentRow.cells[4].textContent.trim() &&
                        component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegDestinationProperty] == componentRow.cells[5].textContent.trim() &&
                        component[xCheckStudio.ComponentIdentificationManager.XMLPipingNWSegOwnerProperty] == componentRow.cells[6].textContent.trim()*/) {

                        if ("NodeId" in component) {
                            if (component["NodeId"] === componentRow.cells[4].textContent.trim()) {
                                this.selectedCompoents.splice(i, 1);
                            }
                        }
                        else {
                            this.selectedCompoents.splice(i, 1);
                        }

                        // this.selectedCompoents.splice(i, 1);
                        break;
                    }
                }
            }

            ModelTree.prototype.getClassWiseCheckedComponents = function () 
            {
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
                    !this.selectedCompoentExists(currentRow)) 
                {

                    var checkedComponent = {};
                    checkedComponent['Name'] = currentRow.cells[modelBrowserComponentColumn].textContent.trim();
                    checkedComponent['MainComponentClass'] = currentRow.cells[modelBrowserMainClassColumn].textContent.trim();
                    checkedComponent['ComponentClass'] = currentRow.cells[modelBrowserSubClassColumn].textContent.trim();                  
                    checkedComponent["NodeId"] = currentRow.cells[modelBrowserNodeIdColumn].textContent.trim();

                    this.selectedCompoents.push(checkedComponent);
                }
                else if (this.selectedCompoentExists(currentRow)) 
                {
                    this.removeFromselectedCompoents(currentRow);
                }

                var currentTable = currentRow.parentElement;
                if (currentTable.tagName.toLowerCase() !== 'tbody') {
                    return;
                }

                var currentComponentCell = currentRow.cells[1];
                //var currentRowStyle = currentComponentCell.className;              
                
                var currentClassList = currentRow.classList;
                var styleToCheck ="";
                for (var i = 0; i < currentClassList.length; i++) {
                    var styleClass = currentClassList[i];
                    if (styleClass.includes("jsgrid")) {
                        continue;
                    }

                    if (styleToCheck == "") {
                        styleToCheck = styleClass;
                    }
                    else {
                        styleToCheck += " " + styleClass;
                    }
                }

                var currentRowClassList = currentComponentCell.classList;
                var hasChild = false;
                for (var i = 0; i < currentRowClassList.length; i++) {
                    var styleClass = currentRowClassList[i];
                    if (styleClass.includes("jsgrid")) {
                        continue;
                    }

                    hasChild = true;
                    if (styleToCheck == "") {
                        styleToCheck = styleClass;
                    }
                    else {
                        styleToCheck += " " + styleClass;
                    }
                }

                // select the child component rows
                if (hasChild) {
                    for (var i = 0; i < currentTable.rows.length; i++) {

                        var row = currentTable.rows[i];
                        if (row === currentRow) {
                            continue;
                        }

                        var rowClassList = row.classList;                       
                        var rowStyleCheck = "";
                        for (var j = 0; j < rowClassList.length; j++) {
                            var styleClass = rowClassList[j];
                            if (styleClass.includes("jsgrid")) {
                                continue;
                            }

                            if (rowStyleCheck == "") {
                                rowStyleCheck = styleClass;
                            }
                            else {
                                rowStyleCheck += " " + styleClass;
                            }
                        }

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

            ModelTree.prototype.addModelBrowser = function (nodeId, styleList) 
            {
                this.addModelBrowserComponent(nodeId, styleList);

                if (this.modelTreeColumnHeaders === undefined ||
                    this.modelTreeColumnHeaders.length === 0 ||
                    this.modelTreeRowData === undefined ||
                    this.modelTreeRowData.length === 0) 
                {
                    return;
                }

                this.loadModelBrowserTable();

                var modelBrowserData = document.getElementById(this._elementId);
                var modelBrowserDataTable = modelBrowserData.children[1];

                var modelBrowserHeaderTable = modelBrowserData.children[0];
                modelBrowserHeaderTable.style.position = "fixed"
                modelBrowserHeaderTable.style.width= "543px";
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
                modelBrowserDataTable.style.margin = "47px 0px 0px 0px"
            };

            ModelTree.prototype.addModelBrowserComponent = function (nodeId, styleList) 
            {
                
                if (nodeId !== null) {
                    var model = this._viewer.model;
                    var children = model.getNodeChildren(nodeId);

                    if (children.length > 0) 
                    {
                        var componentName = model.getNodeName(nodeId);

                        var componentStyleClass = this.getComponentstyleClass(componentName);
                        componentStyleClass = componentStyleClass.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
                        componentStyleClass = componentStyleClass.replace(/\s/g,'');

                        this.addComponentRow(nodeId, styleList, componentStyleClass);

                        for (var _i = 0, children_1 = children; _i < children_1.length; _i++)
                         {
                            var child = children_1[_i];

                            var collapsibleCellStyle;
                            if (styleList !== undefined) 
                            {
                                collapsibleCellStyle = styleList + " " + componentStyleClass;
                            }
                            else 
                            {
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
                        onRefreshed: function(config) {  
                            _this.AddTableContentCount(this._container.context.id);
                            var sorting = this.getSorting();
                            if(sorting.field !== undefined || sorting.order !== undefined )
                            {
                                if(config.grid._container[0].id === "modelTree1")
                                {
                                    xCheckStudioInterface1._modelTree.addClassesToModelBrowser();
                                    for (var i = 0; i < xCheckStudioInterface1._modelTree.NodeGroups.length; i++) {
                                        xCheckStudioInterface1._modelTree.CreateGroup(xCheckStudioInterface1._modelTree.NodeGroups[i]);
                                    }
                                }
                                else if(config.grid._container[0].id === "modelTree2")
                                {
                                    xCheckStudioInterface2._modelTree.addClassesToModelBrowser();
                                    for (var i = 0; i < xCheckStudioInterface2._modelTree.NodeGroups.length; i++) {
                                        xCheckStudioInterface2._modelTree.CreateGroup(xCheckStudioInterface2._modelTree.NodeGroups[i]);
                                    }
                                }
                            }
                        },
                        onDataLoaded: function(args) {
                            if(args.grid._container[0].id === "modelTree1")
                            {
                                xCheckStudioInterface1._modelTree.addClassesToModelBrowser();
                                for (var i = 0; i < xCheckStudioInterface1._modelTree.NodeGroups.length; i++) {
                                    xCheckStudioInterface1._modelTree.CreateGroup(xCheckStudioInterface1._modelTree.NodeGroups[i]);
                                }
                            }
                            else if(args.grid._container[0].id === "modelTree2")
                            {
                                xCheckStudioInterface2._modelTree.addClassesToModelBrowser();
                                for (var i = 0; i < xCheckStudioInterface2._modelTree.NodeGroups.length; i++) {
                                    xCheckStudioInterface2._modelTree.CreateGroup(xCheckStudioInterface2._modelTree.NodeGroups[i]);
                                }
                            }
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

                                var nodeId = args.event.currentTarget.cells[modelBrowserNodeIdColumn].innerText
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
    
    
            var container = document.getElementById(viewerContainer.replace("#", ""));

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
                    'NodeId': row.cells[modelBrowserNodeIdColumn].textContent
                    //'Source': row.cells[modelBrowserSourceColumn].textContent,
                    //'Destination': row.cells[modelBrowserDestinationColumn].textContent,
                    //'Owner': row.cells[modelBrowserOwnerColumn].textContent
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
                imageClass = imageClass.replace(/\s/g,'');

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


            ModelTree.prototype.HighlightModelBrowserRow = function (selectedNodeId)
            {
                // if (checkManager != undefined) {
                var modelBrowser = document.getElementById(this._elementId);
               // var modelBrowserHeader = modelBrowser.children[0];
                var modelBrowserRowTable = modelBrowser.children[1].getElementsByTagName("table")[0];
                var browserTableRows = modelBrowserRowTable.getElementsByTagName("tr");
                for (var i = 0; i < browserTableRows.length; i++) 
                {
                    var childRow = browserTableRows[i];
                    var childRowColumns = childRow.cells;
                    var nodeIdString = childRowColumns[modelBrowserNodeIdColumn].innerText;
                    
                    var nodeId = parseInt(nodeIdString.trim());
                    if (childRowColumns.length > 0) 
                    {                                              
                        if (selectedNodeId === nodeId) 
                        {
                            if (this.SelectedComponentRow) 
                            {
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
               
                // remove first class-name i.e. "jsgrid-row" or "jsgrid-alt-row " 
                var secondClassNameindex = currentClassName.indexOf(" ");               
                var inheritedStyle = currentClassName.substr(secondClassNameindex+1);
               
                var lastClassNameindex = inheritedStyle.lastIndexOf(" ");
               
                // get parent's own style name
                var parentsStyle = inheritedStyle.substr(lastClassNameindex+1);     
                
                // remove last class name
                inheritedStyle = inheritedStyle.substr(0, lastClassNameindex);
               
                parentsStyle = "jsgrid-cell " + parentsStyle ;
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

            return ModelTree;
        }());
        Ui.ModelTree = ModelTree;
    })(Ui = xCheckStudio.Ui || (xCheckStudio.Ui = {}));
})(xCheckStudio || (xCheckStudio = {}));
