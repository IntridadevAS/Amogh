function ComparisonReviewManager(comparisonCheckManager,
    sourceAViewerData,
    sourceBViewerData,
    sourceAProperties,
    sourceBProperties,
    mainReviewTableContainer,
    detailedReviewTableContainer,
    sourceAComponentIdVsComponentData,
    sourceANodeIdVsComponentData,
    sourceBComponentIdVsComponentData,
    sourceBNodeIdVsComponentData) {

    this.SourceAViewerData = sourceAViewerData;
    this.SourceBViewerData = sourceBViewerData;

    this.SourceAProperties = sourceAProperties;
    this.SourceBProperties = sourceBProperties;

    this.SourceAReviewModuleViewerInterface;
    this.SourceBReviewModuleViewerInterface;

    this.MainReviewTableContainer = mainReviewTableContainer;
    this.DetailedReviewTableContainer = detailedReviewTableContainer;

    this.ComponentIdStatusData = {};

    this.ComparisonCheckManager = comparisonCheckManager;

    this.SourceAComponentIdVsComponentData = sourceAComponentIdVsComponentData;
    this.SourceANodeIdVsComponentData = sourceANodeIdVsComponentData;
    this.SourceBComponentIdVsComponentData = sourceBComponentIdVsComponentData;
    this.SourceBNodeIdVsComponentData = sourceBNodeIdVsComponentData;

    this.SelectedComponentRowFromSheetA;
    this.SelectedComponentRowFromSheetB;
    this.SelectedComponentRow;

    this.checkStatusArrayA = {};
    this.checkStatusArrayB = {};

    ComparisonReviewManager.prototype.loadDatasources = function () {
        if (this.SourceAViewerData !== undefined) {
            this.SourceAReviewModuleViewerInterface = new ReviewModuleViewerInterface(this.SourceAViewerData,
                this.SourceAComponentIdVsComponentData,
                this.SourceANodeIdVsComponentData);
            this.SourceAReviewModuleViewerInterface.ComponentIdStatusData = this.ComponentIdStatusData;
            this.SourceAReviewModuleViewerInterface.setupViewer(550, 280);
        }

        if (this.SourceBViewerData !== undefined) {
            this.SourceBReviewModuleViewerInterface = new ReviewModuleViewerInterface(this.SourceBViewerData,
                this.SourceBComponentIdVsComponentData,
                this.SourceBNodeIdVsComponentData);
            this.SourceBReviewModuleViewerInterface.ComponentIdStatusData = this.ComponentIdStatusData;
            this.SourceBReviewModuleViewerInterface.setupViewer(550, 280);
        }
    }

    ComparisonReviewManager.prototype.populateReviewTable = function () {

        var parentTable = document.getElementById(this.MainReviewTableContainer);


        for (var componentsGroupName in this.ComparisonCheckManager.CheckComponentsGroups) {
            var componentsGroup = this.ComparisonCheckManager.CheckComponentsGroups[componentsGroupName];

            var btn = document.createElement("BUTTON");       // Create a <button> element
            btn.className = "collapsible";
            var t = document.createTextNode(componentsGroup.ComponentClass);       // Create a text node
            btn.appendChild(t);
            parentTable.appendChild(btn);

            var div = document.createElement("DIV");
            div.className = "content scrollable";
            div.id = componentsGroup.ComponentClass;
            parentTable.appendChild(div);

            var div2 = document.createElement("DIV");
            div2.id = componentsGroup.ComponentClass+"_child";
            div2.style.fontSize = "10px";
            div.appendChild(div2);

            var tableData = [];
            var columnHeaders = [];

            for (var i = 0; i < 3; i++) {
                columnHeader = {};
                var title;
                if (i === 0) {
                    title = "Source A";
                    name = "SourceA";
                    width = "30";
                }
                else if (i === 1) {
                    title = "Source B";
                    name = "SourceB";
                    width= "30";
                }
                else if (i === 2) {
                    title = "Status";
                    name = "Status"
                    width = "30";
                }
                columnHeader["title"] = title;
                columnHeader["name"] = name;
                columnHeader["type"] = "text";
                columnHeader["width"] = width;
                columnHeaders.push(columnHeader);
            }

            // if component groupd is PipingNetworkSegment, create hidden columns at end for Source, destination and ownerid
            if (componentsGroup.ComponentClass === "PipingNetworkSegment") {

                for (var i = 0; i < 3; i++) {
                    columnHeader = {};
                    var title;
                    if (i === 0) {
                        title = "Source";
                    }
                    else if (i === 1) {
                        title = "Destination";
                    }
                    else if (i === 2) {
                        title = "OwnerId";
                    }
                    columnHeader["name"] = title;
                    columnHeader["type"] = "text";
                    columnHeader["width"] = "0";
                    columnHeaders.push(columnHeader);
                }
            }

            for (var j = 0; j < componentsGroup.Components.length; j++) {

                tableRowContent = {};

                var component = componentsGroup.Components[j];

                tableRowContent[columnHeaders[0].name] = component.SourceAName;
                tableRowContent[columnHeaders[1].name] = component.SourceBName;
                tableRowContent[columnHeaders[2].name] = component.Status;

                // construct component identifier 
                //var componentIdentifier = component.SourceAName;

                if (componentsGroup.ComponentClass === "PipingNetworkSegment") {
                    var checkPropertySource = component.getCheckProperty('Source', 'Source', false);
                    var checkPropertyDestination = component.getCheckProperty('Destination', 'Destination', false);
                    var checkPropertyOwnerId = component.getCheckProperty('OwnerId', 'OwnerId', false);

                    if (checkPropertySource != undefined) {
                        tableRowContent[columnHeaders[3].name] = checkPropertySource.SourceAValue;

                        //componentIdentifier += "_" + checkPropertySource.SourceAValue;
                    }
                    if (checkPropertyDestination != undefined) {
                        tableRowContent[columnHeaders[4].name] = checkPropertyDestination.SourceAValue;

                        //componentIdentifier += "_" + checkPropertyDestination.SourceAValue;
                    }

                    if (checkPropertyOwnerId != undefined) {
                        tableRowContent[columnHeaders[5].name] = checkPropertyOwnerId.SourceAValue;

                        //componentIdentifier += "_" + checkPropertyOwnerId.SourceAValue;
                    }
                }

                tableData.push(tableRowContent);

                //  // keep track of component id vs table row and status         
                //  this.ComponentIdStatusData[componentIdentifier] = [tr, component.Status];
            }

            var id = "#" + div.id;
            // this.LoadTableData(this, columnHeaders, tableData, id);
            this.LoadReviewTableData(this, columnHeaders, tableData, id);
            this.highlightMainReviewTableFromCheckStatus(div.id);

            var modelBrowserData = document.getElementById(div.id);
            var modelBrowserDataTable = modelBrowserData.children[1];
            var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");

            var modelBrowserHeaderTable = modelBrowserData.children[0];
            modelBrowserHeaderTable.style.position = "fixed"
            modelBrowserHeaderTable.style.width = "578px";
            modelBrowserHeaderTable.style.overflowX = "hide";
            var modelBrowserHeaderTableRows = modelBrowserHeaderTable.getElementsByTagName("tr");
            for (var j = 0; j < modelBrowserHeaderTableRows.length; j++) {
                var currentRow = modelBrowserHeaderTableRows[j];
                for (var i = 0; i < currentRow.cells.length; i++) {
                    if (i === 4 || i === 5 ||  i === 3) {
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
                 if(currentRow.cells.length === 6)
                 {                  
                  componentIdentifier += "_" + currentRow.cells[3].innerText;
                  componentIdentifier += "_" + currentRow.cells[4].innerText;
                  componentIdentifier += "_" + currentRow.cells[5].innerText;
                 }           
                 
                 var status = currentRow.cells[2].innerText;
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

    ComparisonReviewManager.prototype.AddTableContentCount = function(containerId){
        var modelBrowserData = document.getElementById(containerId);
        var modelBrowserDataTable = modelBrowserData.children[1];
        var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");
       
        // var countBox;
        var id = containerId+"_child";
        var countBox = document.getElementById(id);
        // if (containerId === "modelTree1") {
        //     countBox = document.getElementById("SourceAComponentCount");
        // }
        // if (containerId === "modelTree2") {
        //     countBox = document.getElementById("SourceBComponentCount");
        // }
        countBox.innerText = "Count :" + modelBrowserTableRows.length;
    }

    ComparisonReviewManager.prototype.bindEvents = function (table) {
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

                    if (_this.SourceAReviewModuleViewerInterface !== undefined && _this.SourceBReviewModuleViewerInterface !== undefined) {
                        var reviewTableId = _this.getReviewTableId(row);

                        var componentIdentifier = row.cells[0].innerHTML;
                        if (reviewTableId === "PipingNetworkSegment") {
                            var source = row.cells[3].innerHTML ===  ""? "undefined" : row.cells[3].innerHTML;
                            var destination = row.cells[4].innerHTML ===  ""? "undefined" : row.cells[3].innerHTML;;
                            var ownerId = row.cells[5].innerHTML ===  ""? "undefined" : row.cells[3].innerHTML;;
                            componentIdentifier += "_" + source + "_" + destination + "_" + ownerId;
                        }

                        _this.SelectedComponentRow = row;

                        // highlight component in graphics view in both viewer
                        _this.SourceAReviewModuleViewerInterface.highlightComponent(componentIdentifier);
                        _this.SourceBReviewModuleViewerInterface.highlightComponent(componentIdentifier);
                    }
                    else {
                        var sheetName = row.parentElement.parentElement.id;
                        this.checkStatusArrayA = {};
                        this.checkStatusArrayB = {};
                        _this.showSelectedSheetData("viewerContainer1", sheetName, row);
                        _this.showSelectedSheetData("viewerContainer2", sheetName, row);
                    }

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

    ComparisonReviewManager.prototype.highlightMainReviewTableFromCheckStatus = function (containerId) {
        var mainReviewTableContainer = document.getElementById(containerId);
        var mainReviewTableRows = mainReviewTableContainer.children[1].getElementsByTagName("tr");

        // var mainReviewTableRows = mainReviewTable.getElementsByTagName("tr");

        for(var i = 0; i < mainReviewTableRows.length; i++)
        {
            var currentRow = mainReviewTableRows[i];
            if(currentRow.cells.length < 3)
            {
                return;
            }
            var status = currentRow.cells[2].innerHTML;
            var color = this.getRowHighlightColor(status);
            for(var j =0; j < currentRow.cells.length; j++)
            {
                cell = currentRow.cells[j];
                cell.style.backgroundColor = color;
            }
        }
    }

    ComparisonReviewManager.prototype.showSelectedSheetData = function (viewerContainer, sheetName, CurrentReviewTableRow) {
        var currentSheetName = sheetName;//thisRow.cells[0].innerText.trim();
        var mainComponentClasseData;
        var viewerContainerData = document.getElementById(viewerContainer);
        if (viewerContainer === "viewerContainer1") {
            mainComponentClasseData = this.SourceAProperties[currentSheetName];
        }
        else if (viewerContainer === "viewerContainer2") {
            mainComponentClasseData = this.SourceBProperties[currentSheetName];
        }

        if(mainComponentClasseData === undefined)
        {
            return;
        }
        if (viewerContainerData.childElementCount > 1 &&
            viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === currentSheetName) {
               
            this.HighlightRowInSheetData(CurrentReviewTableRow, viewerContainer);
            return;
        }

        //var mainComponentClasseData = this.SourceAProperties[currentSheetName];
        var properties = [];

        if (Object.keys(mainComponentClasseData).length > 0) {
            if (viewerContainerData.childElementCount > 1) {
                for (var subComponentClass in mainComponentClasseData) {
                    if (viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === subComponentClass) {
                        this.HighlightRowInSheetData(CurrentReviewTableRow, viewerContainer);
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
                    if (mainComponentClasseData[subComponent][0].Name === CurrentReviewTableRow.cells[0].innerText.trim() ||
                    mainComponentClasseData[subComponent][0].Name === CurrentReviewTableRow.cells[1].innerText.trim()) {
                        sheetProperties = mainComponentClasseData[subComponent][0].properties;
                    }
                    if (sheetProperties === undefined) {
                        for(var j =0; j < mainComponentClasseData[subComponent].length; j++)
                        {
                         if(mainComponentClasseData[subComponent][j].Name === CurrentReviewTableRow.cells[0].innerText.trim() ||
                         mainComponentClasseData[subComponent][0].Name === CurrentReviewTableRow.cells[1].innerText.trim())
                             {
                                 sheetProperties = mainComponentClasseData[subComponent][0].properties;
                             }
                        }
                 
                     }
                }
            }
            if(sheetProperties === undefined)
            {
                return;
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
                columnHeader["width"] = "90";
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

            if (CurrentReviewTableRow.tagName.toLowerCase() !== "tr") {
                return;
            }

            if (viewerContainer === "viewerContainer1") {
                _this = this;
                _this.checkStatusArrayA = {};
                _this.SelectedComponentRowFromSheetA = undefined;
                _this.LoadSheetTableData(_this, columnHeaders, tableData, "#viewerContainer1", CurrentReviewTableRow, column, sheetName);
                _this.HighlightRowInSheetData(CurrentReviewTableRow, "viewerContainer1");

            }
            else if (viewerContainer === "viewerContainer2") {
                _this = this;
                _this.checkStatusArrayB = {};
                _this.SelectedComponentRowFromSheetB = undefined;
                _this.LoadSheetTableData(_this, columnHeaders, tableData, "#viewerContainer2", CurrentReviewTableRow, column, sheetName);
                _this.HighlightRowInSheetData(CurrentReviewTableRow, "viewerContainer2");
            }
        }
    };

    ComparisonReviewManager.prototype.HighlightRowInMainReviewTable = function (sheetDataRow, viewerContainer) {
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

            var reviewTableId = "ComparisonMainReviewCell";
            var reviewTableData = document.getElementById(reviewTableId);
            var reviewTableRowsData = reviewTableData.getElementsByTagName("tr");


            for (var i = 0; i < reviewTableRowsData.length; i++) {
                reviewTableRow = reviewTableRowsData[i];

                if(reviewTableRow.cells.length > 0)
                {
                    if (sheetDataRow.cells[column.Name].innerText === reviewTableRow.cells[0].innerText ||
                        sheetDataRow.cells[column.Name].innerText === reviewTableRow.cells[1].innerText) {
                        if (containerId === "viewerContainer1") {
                            if (this.SelectedComponentRowFromSheetA) {
                                var rowIndex = this.SelectedComponentRowFromSheetA.rowIndex;
                                obj = Object.keys(this.checkStatusArrayA)
                                var status = this.checkStatusArrayA[obj[0]][rowIndex]
                                var color = this.getRowHighlightColor(status);
                                for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                                    cell = this.SelectedComponentRowFromSheetA.cells[j];
                                    cell.style.backgroundColor = color;
                                }
                            }
    
                            this.SelectedComponentRowFromSheetA = sheetDataRow;
    
                        }
                        if (containerId === "viewerContainer2") {
                            if (this.SelectedComponentRowFromSheetB) {
                                var rowIndex = this.SelectedComponentRowFromSheetB.rowIndex;
                                obj = Object.keys(this.checkStatusArrayA)
                                var status = this.checkStatusArrayA[obj[0]][rowIndex]
                                var color = this.getRowHighlightColor(status);
                                    for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                                        cell = this.SelectedComponentRowFromSheetB.cells[j];
                                        cell.style.backgroundColor = color;
                                    }
                            }
    
                            this.SelectedComponentRowFromSheetB = sheetDataRow;
                        }
    
                        if (this.SelectedComponentRow === reviewTableRow) {
                                return;
                            }
    
                            if (this.SelectedComponentRow) {
                                this.RestoreBackgroundColor(_this.SelectedComponentRow);
                            }
    
                            this.ChangeBackgroundColor(reviewTableRow);
                            this.SelectedComponentRow = reviewTableRow;
    
                        for (var j = 0; j < sheetDataRow.cells.length; j++) {
                            cell = sheetDataRow.cells[j];
                            cell.style.backgroundColor = "#B2BABB"
                        }
                       
                        var table = document.getElementById("ComparisonMainReviewTbody");
                        table.focus();
                        table.scrollTop = reviewTableRow.offsetTop - reviewTableRow.offsetHeight;                
    
                        this.populateDetailedReviewTable(reviewTableRow);
    
                        break;
                    }
                }

            }
        }
    }

    ComparisonReviewManager.prototype.LoadSheetTableData = function (_this, columnHeaders, tableData, viewerContainer, CurrentReviewTableRow, column, sheetName) {

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
            _this.highlightSheetRowsFromCheckStatus(viewerContainer,  CurrentReviewTableRow , column, sheetName);
        }        
        
        var container = document.getElementById(viewerContainer.replace("#", ""));
        container.style.width = "560px"
        container.style.height = "450px"
        container.style.overflowX = "scroll";
        container.style.overflowY = "scroll";
        container.style.margin = "0px";
        container.style.top = "50px"

    };

    ComparisonReviewManager.prototype.LoadReviewTableData = function (_this, columnHeaders, tableData, viewerContainer) {
            $(function () {
                var db = {
                    loadData: filter => {
                    //   console.debug("Filter: ", filter);
                      let sourceA = (filter.SourceA || "").toLowerCase();
                      let sourceB = (filter.SourceB || "").toLowerCase();
                      let status = (filter.Status || "").toLowerCase();
                      let dmy = parseInt(filter.dummy, 10);
                      this.recalculateTotals = true;
                      return $.grep(tableData, row => {
                        return (!sourceA || row.SourceA.toLowerCase().indexOf(sourceA) >= 0)
                        && (!sourceB || row.SourceB.toLowerCase().indexOf(sourceB) >= 0)
                        && (!status || row.Status.toLowerCase().indexOf(status) >= 0)
                        && (isNaN(dmy) || row.dummy === dmy);
                      });
                    }
                  };

                $(viewerContainer).jsGrid({
                    filtering: true,
                    autoload: true,
                    controller: db,
                    sorting: true,  
                    data: tableData,
                    fields: columnHeaders,
                    margin: "0px",
                    onRefreshed: function(config) {
                        var id = viewerContainer.replace("#", "");
                        // _this.AddTableContentCount(this._container.context.id);
                        document.getElementById(id).style.width = "578px";
                        _this.highlightMainReviewTableFromCheckStatus(id);
                        
                    },
                    rowClick: function (args) {
                        _this.populateDetailedReviewTable(args.event.currentTarget);
                        var sheetName = viewerContainer.replace("#", "");
                        
                        if (_this.SourceAProperties !== undefined && _this.SourceBProperties !== undefined) {
                            this.checkStatusArrayA = {};
                            this.checkStatusArrayB = {};
                            _this.showSelectedSheetData("viewerContainer1", sheetName, args.event.currentTarget);
                            _this.showSelectedSheetData("viewerContainer2", sheetName, args.event.currentTarget);
                        }
                        else if (_this.SourceAViewerData !== undefined &&
                            _this.SourceBViewerData !== undefined) {
                            _this.HighlightComponentInGraphicsViewer(args.event.currentTarget)
                        }
                        else if (_this.SourceAProperties !== undefined && _this.SourceBViewerData !== undefined) {
                            this.checkStatusArrayA = {};
                            this.checkStatusArrayB = {};
                            _this.showSelectedSheetData("viewerContainer1", sheetName, args.event.currentTarget);
                            _this.HighlightComponentInGraphicsViewer(args.event.currentTarget)
                        }
                    }
                });

            });

        var container = document.getElementById(viewerContainer.replace("#", ""));
        container.style.width = "578px"
        container.style.height = "202px"
        container.style.margin = "0px"
        container.style.overflowX = "hidden";
        container.style.overflowY = "scroll";
        container.style.padding = "0";

    };

    ComparisonReviewManager.prototype.HighlightComponentInGraphicsViewer = function (currentReviewTableRow) {
        var reviewTableId = this.getReviewTableId(currentReviewTableRow);
        
        var componentIdentifier ;
        if(this.SourceAViewerData !== undefined && currentReviewTableRow.cells[0].innerHTML !== "")
        {
            componentIdentifier = currentReviewTableRow.cells[0].innerHTML;
        }
        else if(this.SourceBViewerData !== undefined && currentReviewTableRow.cells[1].innerHTML !== "")
        {
            componentIdentifier = currentReviewTableRow.cells[1].innerHTML;
        }
        
        if (reviewTableId.indexOf("PipingNetworkSegment") !== -1) {
            var source = currentReviewTableRow.cells[3].innerHTML ===  ""? "undefined" : currentReviewTableRow.cells[3].innerHTML;
            var destination = currentReviewTableRow.cells[4].innerHTML ===  ""? "undefined" : currentReviewTableRow.cells[4].innerHTML;;
            var ownerId = currentReviewTableRow.cells[5].innerHTML ===  ""? "undefined" : currentReviewTableRow.cells[5].innerHTML;;
            componentIdentifier += "_" + source + "_" + destination + "_" + ownerId;
        }

        // highlight component in graphics view in both viewer
        if(this.SourceAViewerData != undefined)
        {
            this.SourceAReviewModuleViewerInterface.highlightComponent(componentIdentifier);
        }
        if(this.SourceBViewerData != undefined)
        {
            this.SourceBReviewModuleViewerInterface.highlightComponent(componentIdentifier);    
        }
        
        if (this.SelectedComponentRow === currentReviewTableRow) {
            return;
        }

        if (this.SelectedComponentRow) {
            this.RestoreBackgroundColor(this.SelectedComponentRow);
        }

        this.ChangeBackgroundColor(currentReviewTableRow);
        this.SelectedComponentRow = currentReviewTableRow;        
    }


    ComparisonReviewManager.prototype.LoadDetailedReviewTableData = function (_this, columnHeaders, tableData, viewerContainer) {
        $(function () {
            var db = {
                loadData: filter => {
                //   console.debug("Filter: ", filter);
                  let A_property = (filter.A_Property || "").toLowerCase();
                  let A_value = (filter.A_Value || "").toLowerCase();
                  let B_property = (filter.B_Property || "").toLowerCase();
                  let B_value = (filter.B_Value || "").toLowerCase();
                  let status = (filter.Status || "").toLowerCase();
                  let dmy = parseInt(filter.dummy, 10);
                  this.recalculateTotals = true;
                  return $.grep(tableData, row => {
                    return (!A_property || row.A_Property.toLowerCase().indexOf(A_property) >= 0)
                    && (!A_value || row.A_Value.toLowerCase().indexOf(A_value) >= 0)
                    && (!B_value || row.B_Value.toLowerCase().indexOf(B_value) >= 0)
                    && (!B_property || row.B_Property.toLowerCase().indexOf(B_property) >= 0)
                    && (!status || row.Status.toLowerCase().indexOf(status) >= 0)
                    && (isNaN(dmy) || row.dummy === dmy);
                  });
                }
                
              };

            $(viewerContainer).jsGrid({
                filtering: true,
                autoload: true,
                controller: db,
                sorting: true,
                data: tableData,
                fields: columnHeaders,
                margin: "0px",
                onRefreshed: function(config) {
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

    ComparisonReviewManager.prototype.highlightSheetRowsFromCheckStatus = function (viewerContainer, CurrentReviewTableRow, column, sheetName){
        var modelBrowserTable = CurrentReviewTableRow.parentElement;
        var modelBrowserRows = modelBrowserTable.getElementsByTagName("tr");

        var id = viewerContainer.replace("#", "");
        var currentSheetDataTable = document.getElementById(id);
        var currentSheetRows = currentSheetDataTable.children[1].getElementsByTagName("tr");

        var checkStatusArray = {};
        for(var i =0; i < modelBrowserRows.length; i++)
        {
            var CurrentReviewTableRow = modelBrowserRows[i];
            for(var j =0; j < currentSheetRows.length ; j++)
            {
                currentSheetRow = currentSheetRows[j];
                if(CurrentReviewTableRow.cells[0].innerText !== "" && CurrentReviewTableRow.cells[0].innerText === currentSheetRow.cells[column.Name].innerText)
                {
                    var color = CurrentReviewTableRow.cells[0].style.backgroundColor;
                    for (var j = 0; j < currentSheetRow.cells.length; j++) {
                        cell = currentSheetRow.cells[j];
                        cell.style.backgroundColor = color;
                    }
                    checkStatusArray[currentSheetRow.rowIndex] = CurrentReviewTableRow.cells[2].innerHTML;
                }
                else if(CurrentReviewTableRow.cells[1].innerText !== "" && CurrentReviewTableRow.cells[1].innerText === currentSheetRow.cells[column.Name].innerText)
                {
                    var color = CurrentReviewTableRow.cells[0].style.backgroundColor;
                    for (var j = 0; j < currentSheetRow.cells.length; j++) {
                        cell = currentSheetRow.cells[j];
                        cell.style.backgroundColor = color;
                    }
                    checkStatusArray[currentSheetRow.rowIndex] = CurrentReviewTableRow.cells[2].innerHTML;
                }
            }
        }

        if (viewerContainer === "#viewerContainer1") {
            this.checkStatusArrayA[sheetName] = checkStatusArray;
        }
        else if (viewerContainer === "#viewerContainer2") {
            this.checkStatusArrayB[sheetName] = checkStatusArray;
        }

    }

    ComparisonReviewManager.prototype.HighlightRowInSheetData = function (CurrentReviewTableRow, viewerContainer) {
        var containerId = viewerContainer.replace("#", "");
        var viewerContainerData = document.getElementById(containerId);

        if (viewerContainerData != undefined) {
            var containerChildren = viewerContainerData.children;
            var columnHeaders = containerChildren[0].getElementsByTagName("th");
            var sheetDataTable = containerChildren[1].getElementsByTagName("table")[0];
            var sourceDataViewTableRows = sheetDataTable.getElementsByTagName("tr");
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
            for (var i = 0; i < sourceDataViewTableRows.length; i++) {
                currentRowInSourceTable = sourceDataViewTableRows[i];

                if (CurrentReviewTableRow.cells[0].innerText === currentRowInSourceTable.cells[column.Name].innerText ||
                    CurrentReviewTableRow.cells[1].innerText === currentRowInSourceTable.cells[column.Name].innerText) {
                    if (containerId === "viewerContainer1") {
                        if (this.SelectedComponentRowFromSheetA) {
                            var rowIndex = this.SelectedComponentRowFromSheetA.rowIndex;
                            obj = Object.keys(this.checkStatusArrayA)
                            var status = this.checkStatusArrayA[obj[0]][rowIndex]
                            var color = this.getRowHighlightColor(status);
                            for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                                cell = this.SelectedComponentRowFromSheetA.cells[j];
                                cell.style.backgroundColor = color;
                            }
                        }

                        this.SelectedComponentRowFromSheetA = currentRowInSourceTable;

                        for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                            cell = this.SelectedComponentRowFromSheetA.cells[j];
                            cell.style.backgroundColor = "#B2BABB"
                        }

                        var sheetDataTable1 = containerChildren[1].getElementsByTagName("table")[0];
                        sheetDataTable1.focus();
                        sheetDataTable1.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
                    }
                    if (containerId === "viewerContainer2") {

                        if (this.SelectedComponentRowFromSheetB) {
                            var rowIndex = this.SelectedComponentRowFromSheetB.rowIndex;
                            obj = Object.keys(this.checkStatusArrayA)
                            var status = this.checkStatusArrayA[obj[0]][rowIndex]
                            var color = this.getRowHighlightColor(status);
                            for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                                cell = this.SelectedComponentRowFromSheetB.cells[j];
                                cell.style.backgroundColor = color;
                            }
                        }

                        this.SelectedComponentRowFromSheetB = currentRowInSourceTable;


                        for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                            cell = this.SelectedComponentRowFromSheetB.cells[j];
                            cell.style.backgroundColor = "#B2BABB"
                        }

                        var sheetDataTable2 = containerChildren[1].getElementsByTagName("table")[0];
                        sheetDataTable2.focus();
                        sheetDataTable2.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
                    }

                    if (this.SelectedComponentRow === CurrentReviewTableRow) {
                        return;
                    }
                    if (this.SelectedComponentRow) {
                        this.RestoreBackgroundColor(this.SelectedComponentRow);
                    }
                    this.SelectedComponentRow = CurrentReviewTableRow;
                    this.ChangeBackgroundColor(this.SelectedComponentRow);

                    break;
                }
            }
        }

    }

    ComparisonReviewManager.prototype.populateDetailedReviewTable = function (row) {

        var parentTable = document.getElementById("ComparisonDetailedReviewCell");
        parentTable.innerHTML = '';

        if (row.cells[2].innerHTML.toLowerCase() === "no match") {

            return;
        }

        var reviewTableId = this.getReviewTableId(row);

        var tableData = [];
        var columnHeaders = [];


        for (var componentsGroupName in this.ComparisonCheckManager.CheckComponentsGroups) {

            // get the componentgroupd corresponding to selected component 
            var componentsGroup = this.ComparisonCheckManager.CheckComponentsGroups[componentsGroupName];
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
                    var checkPropertySource = component.getCheckProperty('Source', 'Source', false);
                    var checkPropertyDestination = component.getCheckProperty('Destination', 'Destination', false);
                    var checkPropertyOwnerId = component.getCheckProperty('OwnerId', 'OwnerId', false);

                    if (checkPropertySource != undefined &&
                        checkPropertyDestination != undefined &&
                        checkPropertyOwnerId != undefined) {

                        var source = row.cells[3].innerHTML;
                        var destination = row.cells[4].innerHTML;
                        var ownerId = row.cells[5].innerHTML;

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

                for (var i = 0; i < 5; i++) {
                    columnHeader = {};
                    var title;
                    if (i === 0) {
                        title = "Source A Property";
                        name = "A_Property";
                    }
                    else if (i === 1) {
                        title = "Source A Value";
                        name = "A_Value";
                    }
                    else if (i === 2) {
                        title = "Source B Value";
                        name = "B_Value";
                    }
                    else if (i === 3) {
                        title = "Source B Property";
                        name = "A_Property";
                    }
                    else if (i === 4) {
                        title = "Status";
                        name = "Status";
                    }
                    columnHeader["title"] = title;
                    columnHeader["name"] = name;
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

                for (var j = 0; j < component.CheckProperties.length; j++) {
                    property = component.CheckProperties[j];
                    tableRowContent = this.addPropertyRowToDetailedTable(property, columnHeaders);
                    tableData.push(tableRowContent);
                }

                var id = "#ComparisonDetailedReviewCell";
                this.LoadDetailedReviewTableData(this, columnHeaders, tableData, id);
                this.highlightDetailedReviewTableFromCheckStatus("ComparisonDetailedReviewCell")

                var modelBrowserData = document.getElementById("ComparisonDetailedReviewCell");
                var modelBrowserHeaderTable = modelBrowserData.children[0];
                modelBrowserHeaderTable.style.position = "fixed"
                modelBrowserHeaderTable.style.width= "579px";
                modelBrowserHeaderTable.style.overflowX = "hide";
                var modelBrowserHeaderTableRows = modelBrowserHeaderTable.getElementsByTagName("tr");
                for(var j =0; j < modelBrowserHeaderTableRows.length; j++)
                {
                    var currentRow = modelBrowserHeaderTableRows[j];
                    for(var i = 0; i < currentRow.cells.length; i++)
                    {
                        if(i === 5 || i === 6 || i === 7)
                        {
                            currentRow.cells[i].style.display = "none";
                        }
                        
                    }
                }

                var modelBrowserDataTable = modelBrowserData.children[1]
                modelBrowserDataTable.style.position = "static"
                modelBrowserDataTable.style.width= "579px";
                modelBrowserDataTable.style.margin = "45px 0px 0px 0px"
                
                break;
            }
        }
    }

    ComparisonReviewManager.prototype.highlightDetailedReviewTableFromCheckStatus = function (containerId) {
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

        // var mainReviewTableRows = mainReviewTable.getElementsByTagName("tr");

        for(var i = 0; i < detailedReviewTableRows.length; i++)
        {
            var currentRow = detailedReviewTableRows[i];
            if(currentRow.cells.length > 1)
            {
                var status = currentRow.cells[4].innerHTML;
            var color = this.getRowHighlightColor(status);
            for(var j =0; j < currentRow.cells.length; j++)
            {
                cell = currentRow.cells[j];
                cell.style.backgroundColor = color;
            }
            }
        }
    }

    ComparisonReviewManager.prototype.addPropertyRowToDetailedTable = function (property, columnHeaders) {

        tableRowContent = {};
                    tableRowContent[columnHeaders[0].name] = property.SourceAName;
                    tableRowContent[columnHeaders[1].name] = property.SourceAValue;
                    tableRowContent[columnHeaders[2].name] = property.SourceBValue;
                    tableRowContent[columnHeaders[3].name] = property.SourceBName;
                    if (property.PerformCheck &&
                        property.Result) {
                            tableRowContent[columnHeaders[4].name] = "OK";
                    }
                    else {
                        tableRowContent[columnHeaders[4].name] = property.Severity;
                    }
            return tableRowContent;
        // var tr = document.createElement("tr");

        // var td = document.createElement("td");
        // td.innerHTML = property.SourceAName;
        // tr.appendChild(td);

        // td = document.createElement("td");
        // td.innerHTML = property.SourceAValue;
        // tr.appendChild(td);

        // td = document.createElement("td");
        // td.innerHTML = property.SourceBName;
        // tr.appendChild(td);

        // td = document.createElement("td");
        // td.innerHTML = property.SourceBValue;;
        // tr.appendChild(td);

        // td = document.createElement("td");
        // if (property.PerformCheck &&
        //     property.Result) {
        //     td.innerHTML = "OK";
        // }
        // else {
        //     td.innerHTML = property.Severity;
        // }
        // tr.appendChild(td);

        // // set row's background color according to status
        // tr.style.backgroundColor = this.getRowHighlightColor(td.innerHTML);

        // return tr;
    }

    ComparisonReviewManager.prototype.ChangeBackgroundColor = function (row) {
        for (var j = 0; j < row.cells.length; j++) {
            cell = row.cells[j];
            cell.style.backgroundColor = "#B2BABB"
        }
    }

    ComparisonReviewManager.prototype.RestoreBackgroundColor = function (row) {
        var Color = this.getRowHighlightColor(row.cells[2].innerHTML);
        for (var j = 0; j < row.cells.length; j++) {
            cell = row.cells[j];
            cell.style.backgroundColor = Color;
        }
    }


    ComparisonReviewManager.prototype.getRowHighlightColor = function (status) {
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


    ComparisonReviewManager.prototype.getReviewTableId = function (row) {
        var tBodyElement = row.parentElement;
        if (!tBodyElement) {
            return;
        }
        var tableElement = tBodyElement.parentElement;

        return tableElement.parentElement.parentElement.id;
    }
}