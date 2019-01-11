
function ComplianceReviewManager(complianceCheckManager,
    viewerData,
    sourceProperties,
    mainReviewTableContainer,
    detailedReviewTableContainer,
    componentIdVsComponentData,
    nodeIdVsComponentData) {

    this.ViewerData = viewerData;

    this.SourceProperties = sourceProperties;

    this.ReviewModuleViewerInterface;

    this.ComplianceCheckManager = complianceCheckManager;

    this.MainReviewTableContainer = mainReviewTableContainer;
    this.DetailedReviewTableContainer = detailedReviewTableContainer;

    this.ComponentIdStatusData = {};

    this.ComponentIdVsComponentData = componentIdVsComponentData;
    this.NodeIdVsComponentData = nodeIdVsComponentData;

    this.SelectedComponentRowFromSheet;
    this.SelectedComponentRowFromSheetA;
    this.SelectedComponentRowFromSheetB;

    this.checkStatusArray = {};

    ComplianceReviewManager.prototype.loadDatasource = function () {
        if (this.ViewerData !== undefined) {
            this.ReviewModuleViewerInterface = new ReviewModuleViewerInterface(this.ViewerData,
                this.ComponentIdVsComponentData,
                this.NodeIdVsComponentData);
            this.ReviewModuleViewerInterface.ComponentIdStatusData = this.ComponentIdStatusData;

            this.ReviewModuleViewerInterface.setupViewer(550, 300);
        }

    }

    ComplianceReviewManager.prototype.populateReviewTable = function () {
        var parentTable = document.getElementById(this.MainReviewTableContainer);

        for (var componentsGroupName in this.ComplianceCheckManager.CheckComponentsGroups) {
            var componentsGroup = this.ComplianceCheckManager.CheckComponentsGroups[componentsGroupName];

            var btn = document.createElement("BUTTON");       // Create a <button> element
            btn.className = "collapsible";
            var t = document.createTextNode(componentsGroup.ComponentClass);       // Create a text node
            btn.appendChild(t);
            parentTable.appendChild(btn);

            var div = document.createElement("DIV");
            div.className = "content scrollable";
            div.id = componentsGroup.ComponentClass + "_" + this.MainReviewTableContainer;
            parentTable.appendChild(div);

            var tableData = [];
            var columnHeaders = [];

            for (var i = 0; i < 2; i++) {
                columnHeader = {};
                var title;
                if (i === 0) {
                    title = "Source A";
                    name = "SourceA"
                }
                else if (i === 1) {
                    title = "Status";
                    name = "Status"
                }
                columnHeader["title"] = title;
                columnHeader["name"] = name;
                columnHeader["type"] = "text";
                columnHeader["width"] = "20";
                columnHeaders.push(columnHeader);
            }

            // if component groupd is PipingNetworkSegment, create hidden columns at end for Source, destination and ownerid
            if (componentsGroup.ComponentClass === "PipingNetworkSegment") {

                for (var i = 0; i < 3; i++) {
                    columnHeader = {};
                    var title;
                    if (i === 0) {
                        title = "Source";
                        name = "Source";
                    }
                    else if (i === 1) {
                        title = "Destination";
                        name = "Destination";
                    }
                    else if (i === 2) {
                        title = "OwnerId";
                        name = "OwnerId";
                    }
                    columnHeader["title"] = title;
                    columnHeader["name"] = name;
                    columnHeader["type"] = "text";
                    columnHeader["width"] = "0";
                    columnHeaders.push(columnHeader);
                }
            }

            for (var j = 0; j < componentsGroup.Components.length; j++) {
                tableRowContent = {};

                var component = componentsGroup.Components[j];

                tableRowContent[columnHeaders[0].name] = component.SourceAName;
                tableRowContent[columnHeaders[1].name] = component.Status;

                // construct component identifier 
                //var componentIdentifier = component.SourceAName;

                if (componentsGroup.ComponentClass === "PipingNetworkSegment") {
                    var checkPropertySource = component.getCheckProperty('Source', '', true);
                    var checkPropertyDestination = component.getCheckProperty('Destination', '', true);
                    var checkPropertyOwnerId = component.getCheckProperty('OwnerId', '', true);

                    if (checkPropertySource != undefined) {
                        tableRowContent[columnHeaders[2].name] = checkPropertySource.SourceAValue;

                        // componentIdentifier += "_" + checkPropertySource.SourceAValue;
                    }
                    if (checkPropertyDestination != undefined) {
                        tableRowContent[columnHeaders[3].name] = checkPropertyDestination.SourceAValue;

                        //componentIdentifier += "_" + checkPropertyDestination.SourceAValue;
                    }

                    if (checkPropertyOwnerId != undefined) {
                        tableRowContent[columnHeaders[4].name] = checkPropertyOwnerId.SourceAValue;

                        //componentIdentifier += "_" + checkPropertyOwnerId.SourceAValue;
                    }
                }

                tableData.push(tableRowContent);

                // // keep track of component id vs table row and status         
                //  this.ComponentIdStatusData[componentIdentifier] = [tr, component.Status];
            }

            var id = "#" + div.id;
            this.LoadReviewTableData(this, columnHeaders, tableData, id);
            this.highlightMainReviewTableFromCheckStatus(div.id);

            var modelBrowserData = document.getElementById(div.id);
            var modelBrowserDataTable = modelBrowserData.children[1];
            var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");

            var modelBrowserData = document.getElementById(div.id);
            var modelBrowserDataTable = modelBrowserData.children[1];
            var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");

            var modelBrowserHeaderTable = modelBrowserData.children[0];
            modelBrowserHeaderTable.style.position = "fixed"
            modelBrowserHeaderTable.style.width = "578px";
            modelBrowserHeaderTable.style.overflowX = "hidden";
            var modelBrowserHeaderTableRows = modelBrowserHeaderTable.getElementsByTagName("tr");
            for (var j = 0; j < modelBrowserHeaderTableRows.length; j++) {
                var currentRow = modelBrowserHeaderTableRows[j];
                for (var i = 0; i < currentRow.cells.length; i++) {
                    if (i === 2 || i === 3 || i === 4 ) {
                        currentRow.cells[i].style.display = "none";
                    }
                }               
               
            }

             // keep track of component id vs table row and status     
            var modelBrowserDataTable = modelBrowserData.children[1];
            var modelBrowserDataRows = modelBrowserDataTable.getElementsByTagName("tr");
            for (var j = 0; j < modelBrowserDataRows.length; j++) {
                var currentRow = modelBrowserDataRows[j];

                var componentIdentifier = currentRow.cells[0].innerText;
                if(currentRow.cells.length === 5)
                {
                 componentIdentifier += "_" + currentRow.cells[2].innerText;
                 componentIdentifier += "_" + currentRow.cells[3].innerText;
                 componentIdentifier += "_" + currentRow.cells[4].innerText;
                }  

                var status = currentRow.cells[1].innerText;
                this.ComponentIdStatusData[componentIdentifier] = [currentRow, status];
            }

            modelBrowserDataTable.style.position = "static"
            modelBrowserDataTable.style.width = "578px";
            modelBrowserDataTable.style.margin = "45px 0px 0px 0px"

            var div2 = document.createElement("DIV");
            div2.id = componentsGroup.ComponentClass+"_child";
            div2.innerText =  "Count :" + modelBrowserTableRows.length;
            div2.style.fontSize = "10px";
            div.appendChild(div2);
        }
    }

    ComplianceReviewManager.prototype.highlightMainReviewTableFromCheckStatus = function (containerId) {
        var mainReviewTableContainer = document.getElementById(containerId);
        var mainReviewTableRows = mainReviewTableContainer.children[1].getElementsByTagName("tr");

        for (var i = 0; i < mainReviewTableRows.length; i++) {
            var currentRow = mainReviewTableRows[i];
            if(currentRow.cells.length === 1)
            {
                return;
            }
            var status = currentRow.cells[1].innerHTML;
            var color = this.getRowHighlightColor(status);
            for (var j = 0; j < currentRow.cells.length; j++) {
                cell = currentRow.cells[j];
                cell.style.backgroundColor = color;
            }
        }
    }

    ComplianceReviewManager.prototype.LoadReviewTableData = function (_this, columnHeaders, tableData, viewerContainer) {
        $(function () {
            var db = {
                loadData: filter => {
                //   console.debug("Filter: ", filter);
                  let source = (filter.Source || "").toLowerCase();
                  let status = (filter.Status || "").toLowerCase();
                  let dmy = parseInt(filter.dummy, 10);
                  this.recalculateTotals = true;
                  return $.grep(tableData, row => {
                    return (!source || row.Source.toLowerCase().indexOf(source) >= 0)
                    && (!status || row.Status.toLowerCase().indexOf(status) >= 0)
                    && (isNaN(dmy) || row.dummy === dmy);
                  });
                }
              };

            $(viewerContainer).jsGrid({
                sorting: true,
                filtering: true,
                autoload: true,
                controller: db,
                data: tableData,
                fields: columnHeaders,
                margin: "0px",
                onRefreshed: function (config) {
                    var id = viewerContainer.replace("#", "");
                    document.getElementById(id).style.width = "578px";
                    _this.highlightMainReviewTableFromCheckStatus(id);
                },
                rowClick: function (args) {
                    _this.populateDetailedReviewTable(args.event.currentTarget);
                    var tempString = "_" + _this.MainReviewTableContainer;
                    viewerContainer = viewerContainer.replace("#", "");
                    var sheetName = viewerContainer.replace(tempString, "");

                    if(_this.SourceProperties !== undefined)
                    {
                        if (_this.MainReviewTableContainer === "SourceAComplianceMainReviewCell") {
                           
                            _this.showSelectedSheetData("viewerContainer1", sheetName, args.event.currentTarget);
                        }
                        else if (_this.MainReviewTableContainer === "SourceBComplianceMainReviewCell") {
                          
                            _this.showSelectedSheetData("viewerContainer2", sheetName, args.event.currentTarget);
                        }
                    }
                    else if(_this.ViewerData !== undefined){
                        _this.HighlightComponentInGraphicsViewer(args.event.currentTarget)
                    }
                }
            });

        });

        var container = document.getElementById(viewerContainer.replace("#", ""));
        container.style.width = "592px"
        container.style.height = "202px"
        container.style.margin = "0px"
        container.style.overflowX = "hidden";
        container.style.overflowY = "scroll";
        container.style.padding = "0";
    };

    ComplianceReviewManager.prototype.HighlightComponentInGraphicsViewer = function (currentReviewTableRow) {
        if (this.SelectedComponentRow === currentReviewTableRow) {
            return;
        }

        if (this.SelectedComponentRow) {
            this.RestoreBackgroundColor(this.SelectedComponentRow);
        }

        this.ChangeBackgroundColor(currentReviewTableRow);
        this.SelectedComponentRow = currentReviewTableRow;
        
        var reviewTableId = this.getReviewTableId(currentReviewTableRow);

        var componentIdentifier = currentReviewTableRow.cells[0].innerHTML;
        if (reviewTableId.indexOf("PipingNetworkSegment") !== -1) {
            var source = currentReviewTableRow.cells[2].innerHTML;
            var destination = currentReviewTableRow.cells[3].innerHTML;
            var ownerId = currentReviewTableRow.cells[4].innerHTML;
            componentIdentifier += "_" + source + "_" + destination + "_" + ownerId;
        }

        // highlight component in graphics view in both viewer
        this.ReviewModuleViewerInterface.highlightComponent(componentIdentifier);
    }

    ComplianceReviewManager.prototype.bindEvents = function (table) {
        var _this = this;

        // add row click event handler                
        var rows = table.getElementsByTagName("tr");
        for (i = 0; i < rows.length; i++) {
            var currentRow = table.rows[i];
            var createClickHandler = function (row) {
                return function () {
                    if (_this.SelectedComponentRow === row) {
                        return;
                    }

                    if (_this.SelectedComponentRow) {
                        _this.RestoreBackgroundColor(_this.SelectedComponentRow);
                    }

                    _this.populateDetailedReviewTable(row);

                    if (_this.ReviewModuleViewerInterface !== undefined) {
                        var reviewTableId = _this.getReviewTableId(row);

                        var componentIdentifier = row.cells[0].innerHTML;
                        if (reviewTableId === "PipingNetworkSegment") {
                            var source = row.cells[_this.MainReviewTableStatusCell + 1].innerHTML;
                            var destination = row.cells[_this.MainReviewTableStatusCell + 2].innerHTML;
                            var ownerId = row.cells[_this.MainReviewTableStatusCell + 3].innerHTML;
                            componentIdentifier += "_" + source + "_" + destination + "_" + ownerId;
                        }

                        // highlight component in graphics view in both viewer
                        _this.ReviewModuleViewerInterface.highlightComponent(componentIdentifier);
                    }
                    else {
                        var sheetName = row.parentElement.parentElement.id;
                        this.checkStatusArray = {};

                        if (typeof SourceAProperties !== 'undefined') {
                            _this.showSelectedSheetData("viewerContainer1", sheetName, row);
                        }
                        if (typeof SourceBProperties !== 'undefined') {
                            _this.showSelectedSheetData("viewerContainer2", sheetName, row);
                        }

                    }

                    _this.SelectedComponentRow = row;
                };
            };
            currentRow.onclick = createClickHandler(currentRow);

            // row mouse hover event
            var createMouseHoverHandler = function (row) {
                return function () {
                    _this.ChangeBackgroundColor(row);
                };
            };
            currentRow.onmouseover = createMouseHoverHandler(currentRow);

            // row mouse out event
            var createMouseOutHandler = function (row) {
                return function () {
                    if (_this.SelectedComponentRow !== row) {
                        _this.RestoreBackgroundColor(row);
                    }
                };
            };
            currentRow.onmouseout = createMouseOutHandler(currentRow);
        }
    }

    ComplianceReviewManager.prototype.showSelectedSheetData = function (viewerContainer, sheetName, thisRow) {
        var currentSheetName = sheetName;//thisRow.cells[0].innerText.trim();
        var mainComponentClasseData;
        var viewerContainerData = document.getElementById(viewerContainer);
        mainComponentClasseData = this.SourceProperties[currentSheetName];

        if (viewerContainerData === null) {
            return;
        }
        if (viewerContainerData.childElementCount > 1 &&
            viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === currentSheetName) {
            this.HighlightRowInSheetData(thisRow, viewerContainer);
            return;
        }

        var properties = [];

        if (Object.keys(mainComponentClasseData).length > 0) {
            if (viewerContainerData.childElementCount > 1) {
                for (var subComponentClass in mainComponentClasseData) {
                    if (viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === subComponentClass) {
                        this.HighlightRowInSheetData(thisRow, viewerContainer);
                        return;
                    }
                }
            }
        }

        if (mainComponentClasseData !== {}) {
            for (var subComponentClass in mainComponentClasseData) {
                for (var i = 0; i < mainComponentClasseData[subComponentClass].length; i++) {
                    properties.push(mainComponentClasseData[subComponentClass][i]);
                }
            }

            columnHeaders = [];
            var sheetProperties;
            if (mainComponentClasseData[currentSheetName] !== undefined) {
                sheetProperties = mainComponentClasseData[currentSheetName][0]["properties"];
            }
            else {
                for (var subComponent in mainComponentClasseData) {
                    if (mainComponentClasseData[subComponent][0].Name === thisRow.cells[0].innerText.trim()) {
                        sheetProperties = mainComponentClasseData[subComponent][0].properties;
                    }
                }
            }
            var column = {};
            for (var i = 0; i < sheetProperties.length; i++) {
                columnHeader = {};
                columnHeader["name"] = sheetProperties[i].Name;
                var type;
                if (typeof (sheetProperties[i].Name) === "string") {
                    type = "text";
                }
                else if (typeof (sheetProperties[i].Name) === "number") {
                    type = "number";
                }
                columnHeader["type"] = type;
                columnHeader["width"] = "80";
                columnHeaders.push(columnHeader);
                if (Object.keys(column).length <= 3) {
                    if (sheetProperties[i].Name === "ComponentClass" || sheetProperties[i].Name === "Name" || sheetProperties[i].Name === "Description") {
                        column[sheetProperties[i].Name] = i;
                    }
                }
            }

            tableData = [];
            for (var i = 0; i < properties.length; i++) {
                tableRowContent = {};
                property = properties[i].properties;
                for (var j = 0; j < property.length; j++) {
                    tableRowContent[columnHeaders[j].name] = property[j].Value;
                }
                tableData.push(tableRowContent);

            }

            if (thisRow.tagName.toLowerCase() !== "tr") {
                return;
            }

            if (viewerContainer === "viewerContainer1") {
                _this = this;
                _this.checkStatusArray = {};
                _this.LoadSheetTableData(_this, columnHeaders, tableData, "#viewerContainer1", thisRow, column, sheetName);
                _this.HighlightRowInSheetData(thisRow, "viewerContainer1");
            }
            else if (viewerContainer === "viewerContainer2") {
                _this = this;
                _this.checkStatusArray = {};
                _this.LoadSheetTableData(_this, columnHeaders, tableData, "#viewerContainer2", thisRow, column, sheetName);
                _this.HighlightRowInSheetData(thisRow, "viewerContainer2");
            }
        }
    };

    ComplianceReviewManager.prototype.LoadSheetTableData = function (_this, columnHeaders, tableData, viewerContainer, modelBrowserRow, column, sheetName) {

        if (viewerContainer === "#viewerContainer1" || viewerContainer === "#viewerContainer2") {
            $(function () {

                $(viewerContainer).jsGrid({
                    autoload: true,
                    data: tableData,
                    fields: columnHeaders,
                    margin: "0px",
                    rowClick: function (args) {
                        _this.HighlightRowInMainReviewTable(args.event.currentTarget, viewerContainer);
                    }
                });

            });
            _this.highlightSheetRowsFromCheckStatus(viewerContainer, modelBrowserRow, column, sheetName);
        }

        var container = document.getElementById(viewerContainer.replace("#", ""));
        container.style.width = "560px"
        container.style.height = "450px"
        container.style.overflowX = "scroll";
        container.style.overflowY = "scroll";
        container.style.margin = "0px";
        container.style.top = "50px"
        

    };

    ComplianceReviewManager.prototype.HighlightRowInMainReviewTable = function (sheetDataRow, viewerContainer) {
        var containerId = viewerContainer.replace("#", "");
        var viewerContainerData = document.getElementById(containerId)

        if (viewerContainerData != undefined) {
            var containerChildren = viewerContainerData.children;
            var columnHeaders = containerChildren[0].getElementsByTagName("th");
            var column = {};
            for (var i = 0; i < columnHeaders.length; i++) {
                columnHeader = columnHeaders[i];
                if (columnHeader.innerHTML.trim() === "ComponentClass" || columnHeader.innerHTML.trim() === "Name" || columnHeader.innerHTML.trim() === "Description") {
                    column[columnHeader.innerHTML.trim()] = i;
                }
                if (Object.keys(column).length === 3) {
                    break;
                }
            }

            var reviewTableId;
            if (containerId === "viewerContainer1") {
                reviewTableId = "SourceAComplianceMainReviewCell";
            }
            else if (containerId === "viewerContainer2") {
                reviewTableId = "SourceBComplianceMainReviewCell";
            }

            var modelBrowserData = document.getElementById(reviewTableId);
            var modelBrowserRowsData = modelBrowserData.getElementsByTagName("tr");


            for (var i = 0; i < modelBrowserRowsData.length; i++) {
                modelBrowserRow = modelBrowserRowsData[i];

                if (sheetDataRow.cells[column.Name].innerText === modelBrowserRow.cells[0].innerText) {
                    if (this.SelectedComponentRow === modelBrowserRow) {
                        return;
                    }

                    if (this.SelectedComponentRow) {
                        this.RestoreBackgroundColor(_this.SelectedComponentRow);
                    }

                    this.ChangeBackgroundColor(modelBrowserRow);
                    this.SelectedComponentRow = modelBrowserRow;

                    if(containerId === "viewerContainer1")
                    {
                        if (this.SelectedComponentRowFromSheetA) {
                            var rowIndex = this.SelectedComponentRowFromSheetA.rowIndex;
                            obj = Object.keys(this.checkStatusArray)
                            var status = this.checkStatusArray[obj[0]][rowIndex]
                            var color = this.getRowHighlightColor(status);
                            for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                                cell = this.SelectedComponentRowFromSheetA.cells[j];
                                cell.style.backgroundColor = color;
                            }
                        }
    
                        this.SelectedComponentRowFromSheetA = sheetDataRow;
    
                        for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                            cell = this.SelectedComponentRowFromSheetA.cells[j];
                            cell.style.backgroundColor = "#B2BABB"
                        }
                    }
                    if(containerId === "viewerContainer2")
                    {
                        if (this.SelectedComponentRowFromSheetB) {
                            var rowIndex = this.SelectedComponentRowFromSheetB.rowIndex;
                            obj = Object.keys(this.checkStatusArray)
                            var status = this.checkStatusArray[obj[0]][rowIndex]
                            var color = this.getRowHighlightColor(status);
                            for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                                cell = this.SelectedComponentRowFromSheetB.cells[j];
                                cell.style.backgroundColor = color;
                            }
                        }
    
                        this.SelectedComponentRowFromSheetB = sheetDataRow;
    
                        for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                            cell = this.SelectedComponentRowFromSheetB.cells[j];
                            cell.style.backgroundColor = "#B2BABB"
                        }
                    }
                    var table = modelBrowserRow.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
                    table.focus();
                    table.scrollTop = modelBrowserRow.offsetTop - modelBrowserRow.offsetHeight;

                    this.populateDetailedReviewTable(modelBrowserRow);

                    var table;
                    if (reviewTableId === "SourceAComplianceMainReviewCell") {
                        table = document.getElementById("SourceAComplianceMainReviewTbody");
                        table.focus();
                        table.scrollTop = modelBrowserRow.offsetTop - modelBrowserRow.offsetHeight;

                    }
                    else if (reviewTableId === "SourceBComplianceMainReviewCell") {
                        table = document.getElementById("SourceBComplianceMainReviewTbody");
                        table.focus();
                        table.scrollTop = modelBrowserRow.offsetTop - modelBrowserRow.offsetHeight;

                    }

                    break;


                }
            }
        }
    }

    ComplianceReviewManager.prototype.highlightSheetRowsFromCheckStatus = function (viewerContainer, modelBrowserRow, column, sheetName) {
        var modelBrowserTable = modelBrowserRow.parentElement;
        var modelBrowserRows = modelBrowserTable.getElementsByTagName("tr");

        var id = viewerContainer.replace("#", "");
        var currentSheetDataTable = document.getElementById(id);
        var currentSheetRows = currentSheetDataTable.children[1].getElementsByTagName("tr");

        var currentCheckStatusArray = {};
        for (var i = 0; i < modelBrowserRows.length; i++) {
            var modelBrowserRow = modelBrowserRows[i];
            for (var j = 0; j < currentSheetRows.length; j++) {
                currentSheetRow = currentSheetRows[j];
                if (modelBrowserRow.cells[0].innerText !== "" && modelBrowserRow.cells[0].innerText === currentSheetRow.cells[column.Name].innerText) {
                    var color = modelBrowserRow.cells[0].style.backgroundColor;
                    for (var j = 0; j < currentSheetRow.cells.length; j++) {
                        cell = currentSheetRow.cells[j];
                        cell.style.backgroundColor = color;
                        cell.style.height = "10px"
                    }
                    currentCheckStatusArray[currentSheetRow.rowIndex] = modelBrowserRow.cells[1].innerHTML;
                }
                else if (modelBrowserRow.cells[1].innerText !== "" && modelBrowserRow.cells[1].innerText === currentSheetRow.cells[column.Name].innerText) {
                    var color = modelBrowserRow.cells[0].style.backgroundColor;
                    for (var j = 0; j < currentSheetRow.cells.length; j++) {
                        cell = currentSheetRow.cells[j];
                        cell.style.backgroundColor = color;
                    }
                    currentCheckStatusArray[currentSheetRow.rowIndex] = modelBrowserRow.cells[1].innerHTML;
                }
            }
        }

        this.checkStatusArray[sheetName] = currentCheckStatusArray;


    }

    ComplianceReviewManager.prototype.HighlightRowInSheetData = function (thisRow, viewerContainer) {
        var containerId = viewerContainer.replace("#", "");
        var viewerContainerData = document.getElementById(containerId);

        if (viewerContainerData != undefined) {
            var containerChildren = viewerContainerData.children;
            var columnHeaders = containerChildren[0].getElementsByTagName("th");
            var sheetDataTable = containerChildren[1].getElementsByTagName("table")[0];
            var mainComponentClassDataTable = sheetDataTable.getElementsByTagName("tr");
            var column = {};
            for (var i = 0; i < columnHeaders.length; i++) {
                columnHeader = columnHeaders[i];
                if (columnHeader.innerHTML.trim() === "ComponentClass" || columnHeader.innerHTML.trim() === "Name" || columnHeader.innerHTML.trim() === "Description") {
                    column[columnHeader.innerHTML.trim()] = i;
                }
                if (Object.keys(column).length === 3) {
                    break;
                }
            }
            for (var i = 0; i < mainComponentClassDataTable.length; i++) {
                rowData = mainComponentClassDataTable[i];

                if (thisRow.cells[0].innerText === rowData.cells[column.Name].innerText) {

                    if(containerId === "viewerContainer1")
                    {
                        if (this.SelectedComponentRowFromSheetA) {
                            var rowIndex = this.SelectedComponentRowFromSheetA.rowIndex;
                            obj = Object.keys(this.checkStatusArray)
                            var status = this.checkStatusArray[obj[0]][rowIndex]
                            var color = this.getRowHighlightColor(status);
                            for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                                cell = this.SelectedComponentRowFromSheetA.cells[j];
                                cell.style.backgroundColor = color;
                            }
                        }
    
                        this.SelectedComponentRowFromSheetA = rowData;
    
                        for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                            cell = this.SelectedComponentRowFromSheetA.cells[j];
                            cell.style.backgroundColor = "#B2BABB"
                        }
                    }
                    if(containerId === "viewerContainer2")
                    {
                        if (this.SelectedComponentRowFromSheetB) {
                            var rowIndex = this.SelectedComponentRowFromSheetB.rowIndex;
                            obj = Object.keys(this.checkStatusArray)
                            var status = this.checkStatusArray[obj[0]][rowIndex]
                            var color = this.getRowHighlightColor(status);
                            for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                                cell = this.SelectedComponentRowFromSheetB.cells[j];
                                cell.style.backgroundColor = color;
                            }
                        }
    
                        this.SelectedComponentRowFromSheetB = rowData;
    
                        for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                            cell = this.SelectedComponentRowFromSheetB.cells[j];
                            cell.style.backgroundColor = "#B2BABB"
                        }
                    }


                    if (this.SelectedComponentRow === thisRow) {
                        return;
                    }
                    if (this.SelectedComponentRow) {
                        this.RestoreBackgroundColor(this.SelectedComponentRow);
                    }
                    this.SelectedComponentRow = thisRow;
                    this.ChangeBackgroundColor(this.SelectedComponentRow);

                    sheetDataTable.focus();
                    sheetDataTable.parentNode.parentNode.scrollTop = rowData.offsetTop - rowData.offsetHeight;

                    break;
                }


            }
        }
    }

    ComplianceReviewManager.prototype.populateDetailedReviewTable = function (row) {

        var parentTable = document.getElementById(this.DetailedReviewTableContainer);
        parentTable.innerHTML = '';

        if (row.cells[1].innerHTML.toLowerCase() === "no match") {


            return;
        }

        var reviewTableId = this.getReviewTableId(row);
        var tempString = "_" + this.MainReviewTableContainer;
        reviewTableId = reviewTableId.replace(tempString, "");

        var tableData = [];
        var columnHeaders = [];

        for (var componentsGroupName in this.ComplianceCheckManager.CheckComponentsGroups) {

            // get the componentgroupd corresponding to selected component 
            var componentsGroup = this.ComplianceCheckManager.CheckComponentsGroups[componentsGroupName];
            if (componentsGroup.ComponentClass != reviewTableId) {
                continue;
            }

            for (var i = 0; i < componentsGroup.Components.length; i++) {
                var component = componentsGroup.Components[i];

                if (component.Status.toLowerCase() === "no match") {
                    continue;
                }

                var source1NameCell = row.getElementsByTagName("td")[0];
                var source2NameCell = row.getElementsByTagName("td")[1];

                if (component.SourceAName !== source1NameCell.innerHTML &&
                    component.SourceBName !== source2NameCell.innerHTML) {
                    continue;
                }

                // if component is PipingNetworkSegment, check if source and destination properties are same
                // because they may have same tag names
                if (componentsGroup.ComponentClass === "PipingNetworkSegment") {
                    var checkPropertySource = component.getCheckProperty('Source', '', true);
                    var checkPropertyDestination = component.getCheckProperty('Destination', '', true);
                    var checkPropertyOwnerId = component.getCheckProperty('OwnerId', '', true);

                    if (checkPropertySource != undefined &&
                        checkPropertyDestination != undefined &&
                        checkPropertyOwnerId != undefined) {

                        var source = row.cells[2].innerHTML;
                        var destination = row.cells[3].innerHTML;
                        var ownerId = row.cells[4].innerHTML;

                        if (checkPropertySource.SourceAValue !== source ||
                            checkPropertyDestination.SourceAValue !== destination ||
                            checkPropertyOwnerId.SourceAValue !== ownerId) {
                            continue;
                        }
                    }
                }

                var div = document.createElement("DIV");
                parentTable.appendChild(div);

                div.innerHTML = "Check Details :";
                div.style.fontSize = "20px";
                div.style.fontWeight = "bold";

                for (var i = 0; i < 3; i++) {
                    columnHeader = {};
                    var title;
                    if (i === 0) {
                        title = "Source A Property";
                        name =  "Property";
                    }
                    else if (i === 1) {
                        title = "Source A Value";
                        name ="Value";
                    }
                    else if (i === 2) {
                        title = "Status";
                        name = "Status";
                    }

                    columnHeader["name"] = name;
                    columnHeader["title"] = title;
                    columnHeader["type"] = "text";
                    columnHeader["width"] = "30";
                    columnHeaders.push(columnHeader);
                }

                // show component class name as property in detailed review table               
                var property = new CheckProperty("ComponentClass",
                    component.SubComponentClass,
                    "ComponentClass",
                    component.SubComponentClass,
                    "",
                    true,
                    "");
                tableRowContent = this.addPropertyRowToDetailedTable(property, columnHeaders);
                tableData.push(tableRowContent);
                // tbody.appendChild(tr);

                for (var j = 0; j < component.CheckProperties.length; j++) {
                    property = component.CheckProperties[j];

                    tableRowContent = this.addPropertyRowToDetailedTable(property, columnHeaders);
                    tableData.push(tableRowContent);
                }

                var id = "#" + this.DetailedReviewTableContainer;
                this.LoadDetailedReviewTableData(this, columnHeaders, tableData, id);
                this.highlightDetailedReviewTableFromCheckStatus(this.DetailedReviewTableContainer)

                var modelBrowserData = document.getElementById(this.DetailedReviewTableContainer);
                var modelBrowserHeaderTable = modelBrowserData.children[0];
                modelBrowserHeaderTable.style.position = "fixed"
                modelBrowserHeaderTable.style.width= "579px";
                modelBrowserHeaderTable.style.overflowX = "hidden";

                var modelBrowserDataTable = modelBrowserData.children[1]
                modelBrowserDataTable.style.position = "static"
                modelBrowserDataTable.style.width= "579px";
                modelBrowserDataTable.style.margin = "45px 0px 0px 0px"
                
                break;
            }
        }
    }

    ComplianceReviewManager.prototype.highlightDetailedReviewTableFromCheckStatus = function (containerId) {
        var detailedReviewTableContainer = document.getElementById(containerId);
        if(detailedReviewTableContainer === null)
        {
            return;
        }
        if(detailedReviewTableContainer.children.length === 0)
        {
            return;
        }
        var detailedReviewTableRows = detailedReviewTableContainer.children[1].getElementsByTagName("tr");

        for (var i = 0; i < detailedReviewTableRows.length; i++) {
            var currentRow = detailedReviewTableRows[i];
            if(currentRow.cells.length < 2)
            {
                return;
            }
            var status = currentRow.cells[2].innerHTML;
            var color = this.getRowHighlightColor(status);
            for (var j = 0; j < currentRow.cells.length; j++) {
                cell = currentRow.cells[j];
                cell.style.backgroundColor = color;
            }
        }
    }

    ComplianceReviewManager.prototype.LoadDetailedReviewTableData = function (_this, columnHeaders, tableData, viewerContainer) {
        $(function () {

            var db = {
                loadData: filter => {
                //   console.debug("Filter: ", filter);
                  let property = (filter.Property || "").toLowerCase();
                  let value = (filter.Value || "").toLowerCase();
                  let status = (filter.Status || "").toLowerCase();
                  let dmy = parseInt(filter.dummy, 10);
                  this.recalculateTotals = true;
                  return $.grep(tableData, row => {
                    return (!property || row.Property.toLowerCase().indexOf(property) >= 0)
                    && (!value || row.Value.toLowerCase().indexOf(value) >= 0)
                    && (!status || row.Status.toLowerCase().indexOf(status) >= 0)
                    && (isNaN(dmy) || row.dummy === dmy);
                  });
                }
              };

            $(viewerContainer).jsGrid({
                sorting: true,
                filtering: true,
                autoload: true,
                controller: db,
                data: tableData,
                fields: columnHeaders,
                margin: "0px",
                onRefreshed: function (config) {
                    var id = viewerContainer.replace("#", "");
                    document.getElementById(id).style.width = "579px";
                    _this.highlightDetailedReviewTableFromCheckStatus(id);
                }
            });

        });

        var container = document.getElementById(viewerContainer.replace("#", ""));
        container.style.width = "579px"
        container.style.height = "202px"
        container.style.margin = "0px"
        container.style.overflowX = "hidden";
        container.style.overflowY = "scroll";

    };

    ComplianceReviewManager.prototype.addPropertyRowToDetailedTable = function (property, columnHeaders) {

        tableRowContent = {};
        tableRowContent[columnHeaders[0].name] = property.SourceAName;
        tableRowContent[columnHeaders[1].name] = property.SourceAValue;
        if (property.PerformCheck &&
            property.Result) {
            tableRowContent[columnHeaders[2].name] = "OK";
        }
        else {
            tableRowContent[columnHeaders[2].name] = property.Severity;
        }
        return tableRowContent;
    }


    ComplianceReviewManager.prototype.ChangeBackgroundColor = function (row) {
        for (var j = 0; j < row.cells.length; j++) {
            cell = row.cells[j];
            cell.style.backgroundColor = "#B2BABB"
        }
    }

    ComplianceReviewManager.prototype.RestoreBackgroundColor = function (row) {
        var Color = this.getRowHighlightColor(row.cells[1].innerHTML);
        for (var j = 0; j < row.cells.length; j++) {
            cell = row.cells[j];
            cell.style.backgroundColor = Color;
        }
    }


    ComplianceReviewManager.prototype.getRowHighlightColor = function (status) {
        if (status.toLowerCase() === ("OK").toLowerCase()) {
            return SuccessColor;
        }
        else if (status.toLowerCase() === ("Error").toLowerCase()) {
            return ErrorColor;
        }
        else if (status.toLowerCase() === ("Warning").toLowerCase()) {
            return WarningColor;
        }
        else if (status.toLowerCase() === ("No Match").toLowerCase()) {
            return NoMatchColor;
        }
        else if (status.toLowerCase() === ("No Value").toLowerCase()) {
            return NoValueColor;
        }
        else {
            return "#ffffff";
        }
    }


    ComplianceReviewManager.prototype.getReviewTableId = function (row) {
        var tBodyElement = row.parentElement;
        if (!tBodyElement) {
            return;
        }
        var tableElement = tBodyElement.parentElement;

        return tableElement.parentElement.parentElement.id;
    }
}