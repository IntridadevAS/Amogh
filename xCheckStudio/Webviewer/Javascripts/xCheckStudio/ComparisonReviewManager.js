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
            this.SourceAReviewModuleViewerInterface.setupViewer();
        }

        if (this.SourceBViewerData !== undefined) {
            this.SourceBReviewModuleViewerInterface = new ReviewModuleViewerInterface(this.SourceBViewerData,
                this.SourceBComponentIdVsComponentData,
                this.SourceBNodeIdVsComponentData);
            this.SourceBReviewModuleViewerInterface.ComponentIdStatusData = this.ComponentIdStatusData;
            this.SourceBReviewModuleViewerInterface.setupViewer();
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
            parentTable.appendChild(div);

            var table = document.createElement("TABLE");
            table.id = componentsGroup.ComponentClass;
            div.appendChild(table);

            // thead
            var thead = document.createElement("thead");
            table.appendChild(thead);

            var tr = document.createElement("tr");
            thead.appendChild(tr);

            th = document.createElement("th");
            th.innerHTML = "Source A"
            tr.appendChild(th);

            th = document.createElement("th");
            th.innerHTML = "Source B"
            tr.appendChild(th);

            th = document.createElement("th");
            th.innerHTML = "Status"
            tr.appendChild(th);

            this.MainReviewTableStatusCell = tr.cells.length - 1;

            // if component groupd is PipingNetworkSegment, create hidden columns at end for Source, destination and ownerid
            if (componentsGroup.ComponentClass === "PipingNetworkSegment") {

                th = document.createElement("th");
                th.innerHTML = "Source"
                th.style.display = "none"
                tr.appendChild(th);

                th = document.createElement("th");
                th.innerHTML = "Destination"
                th.style.display = "none"
                tr.appendChild(th);

                th = document.createElement("th");
                th.innerHTML = "OwnerId"
                th.style.display = "none"
                tr.appendChild(th);
            }

            var tbody = document.createElement("tbody");
            tbody.className = "hide";
            table.appendChild(tbody);

            for (var j = 0; j < componentsGroup.Components.length; j++) {
                var component = componentsGroup.Components[j];

                tr = document.createElement("tr");
                tbody.appendChild(tr);

                td = document.createElement("td");
                td.innerHTML = component.SourceAName;
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = component.SourceBName;
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = component.Status;
                tr.appendChild(td);

                // construct component identifier 
                var componentIdentifier = component.SourceAName;

                if (componentsGroup.ComponentClass === "PipingNetworkSegment") {
                    var checkPropertySource = component.getCheckProperty('Source', 'Source', false);
                    var checkPropertyDestination = component.getCheckProperty('Destination', 'Destination', false);
                    var checkPropertyOwnerId = component.getCheckProperty('OwnerId', 'OwnerId', false);

                    td = document.createElement("td");
                    if (checkPropertySource != undefined) {
                        td.innerHTML = checkPropertySource.SourceAValue;

                        componentIdentifier += "_" + checkPropertySource.SourceAValue;
                    }
                    td.style.display = "none"
                    tr.appendChild(td);

                    td = document.createElement("td");
                    if (checkPropertyDestination != undefined) {
                        td.innerHTML = checkPropertyDestination.SourceAValue;

                        componentIdentifier += "_" + checkPropertyDestination.SourceAValue;
                    }
                    td.style.display = "none"
                    tr.appendChild(td);

                    td = document.createElement("td");
                    if (checkPropertyOwnerId != undefined) {
                        td.innerHTML = checkPropertyOwnerId.SourceAValue;

                        componentIdentifier += "_" + checkPropertyOwnerId.SourceAValue;
                    }
                    td.style.display = "none"
                    tr.appendChild(td);
                }

                //set row background color according to check result
                var hexColor = xCheckStudio.Util.getComponentHexColor(component.Status);
                if (hexColor === undefined) {
                    continue;
                }
                tr.style.backgroundColor = hexColor;

                // keep track of component id vs table row and status               
                this.ComponentIdStatusData[componentIdentifier] = [tr, component.Status];
            }

            this.bindEvents(table);
        }
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
                            var source = row.cells[_this.MainReviewTableStatusCell + 1].innerHTML;
                            var destination = row.cells[_this.MainReviewTableStatusCell + 2].innerHTML;
                            var ownerId = row.cells[_this.MainReviewTableStatusCell + 3].innerHTML;
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

    ComparisonReviewManager.prototype.highlightSheetRowsFromCheckStatus = function (viewerContainer, modelBrowserRow, column){
        var modelBrowserTable = modelBrowserRow.parentElement;
        var modelBrowserRows = modelBrowserTable.getElementsByTagName("tr");

        var currentSheetDataTable = viewerContainer//document.getElementById(viewerContainer);
        var currentSheetRows = currentSheetDataTable.children[1].getElementsByTagName("tr");

        for(var i =0; i < modelBrowserRows.length; i++)
        {
            var modelBrowserRow = modelBrowserRows[i];
            for(var j =0; j < currentSheetRows.length ; j++)
            {
                currentSheetRow = currentSheetRows[j];
                if(modelBrowserRow.cells[0].innerText !== "" && modelBrowserRow.cells[0].innerText === currentSheetRow.cells[column.Name].innerText)
                {
                    var color = modelBrowserRow.style.backgroundColor;
                    for (var j = 0; j < currentSheetRow.cells.length; j++) {
                        cell = currentSheetRow.cells[j];
                        cell.style.backgroundColor = color;
                    }

                    if(viewerContainer.id === "viewerContainer1")
                    {
                        this.checkStatusArrayA[currentSheetRow.rowIndex] = modelBrowserRow.cells[2].innerHTML;
                    }
                    else if(viewerContainer.id === "viewerContainer2")
                    {
                        this.checkStatusArrayB[currentSheetRow.rowIndex] = modelBrowserRow.cells[2].innerHTML;
                    }
                    
                }
            }
        }

    }

    ComparisonReviewManager.prototype.showSelectedSheetData = function (viewerContainer, sheetName, modelBrowserRow) {
        var currentSheetName = sheetName;//thisRow.cells[0].innerText.trim();
        var mainComponentClasseData;
        var viewerContainerData = document.getElementById(viewerContainer);
        if (viewerContainer === "viewerContainer1") {
            mainComponentClasseData = this.SourceAProperties[currentSheetName];
        }
        else if (viewerContainer === "viewerContainer2") {
            mainComponentClasseData = this.SourceBProperties[currentSheetName];
        }

        if (viewerContainerData.childElementCount > 1 && 
            viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === currentSheetName) {
            this.HighlightRowInSheetData(modelBrowserRow, viewerContainer);
            return;
        }

        //var mainComponentClasseData = this.SourceAProperties[currentSheetName];
        var properties = [];

        if (Object.keys(mainComponentClasseData).length > 0) {
            if (viewerContainerData.childElementCount > 1) {
                for (var subComponentClass in mainComponentClasseData) {
                    if (viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === subComponentClass) {
                        this.HighlightRowInSheetData(modelBrowserRow, viewerContainer);
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
                for(var subComponent in mainComponentClasseData)
                {
                    if(mainComponentClasseData[subComponent][0].Name === modelBrowserRow.cells[1].innerText.trim())
                    {
                        sheetProperties = mainComponentClasseData[subComponent][0].properties;
                    }
                }
            }
            var column = {};
            for (var i = 0; i < sheetProperties.length; i++) {
                columnHeader = {};
                columnHeader["name"] = sheetProperties[i].Name;
                var type ;
                if(typeof(sheetProperties[i].Name) === "string")
                {
                    type = "text";
                }
                else if(typeof(sheetProperties[i].Name) === "number")
                {
                    type = "number";
                }
                columnHeader["type"] = type;
                columnHeader["width"] = "100";
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

            //createGridView(properties, viewerContainer, 0, 0);

            if (modelBrowserRow.tagName.toLowerCase() !== "tr") {
                return;
            }

            if (viewerContainer === "viewerContainer1") {
                _this = this;
                _this.LoadTableData(_this, columnHeaders, tableData, "#viewerContainer1", modelBrowserRow, column);
                _this.HighlightRowInSheetData(modelBrowserRow, "viewerContainer1");
               
            }
            else if (viewerContainer === "viewerContainer2") {
                _this = this;
                _this.LoadTableData(_this, columnHeaders, tableData, "#viewerContainer2", modelBrowserRow, column);
                _this.HighlightRowInSheetData(modelBrowserRow, "viewerContainer2");
            }
        }
    };

    ComparisonReviewManager.prototype.HighlightRowInMainReviewTable = function (sheetDataRow, viewerContainer) {
        var containerId  = viewerContainer.replace("#", "");
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
            var modelBrowserData = document.getElementById(reviewTableId);
            var modelBrowserRowsData = modelBrowserData.getElementsByTagName("tr");


            for (var i = 0; i < modelBrowserRowsData.length; i++) {
                modelBrowserRow = modelBrowserRowsData[i];

                if (sheetDataRow.cells[column.Name].innerText === modelBrowserRow.cells[1].innerText ||
                    sheetDataRow.cells[column.Name].innerText === modelBrowserRow.cells[0].innerText) {
                    if(containerId === "viewerContainer1")
                    {
                        

                    if (this.SelectedComponentRowFromSheetA) {
                        var rowIndex = this.SelectedComponentRowFromSheetA.rowIndex;
                        var status = this.checkStatusArrayA[rowIndex];
                        if (status === undefined) {
                                
                        }
                        else {
                            var color = this.getRowHighlightColor(status);
                            for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                                cell = this.SelectedComponentRowFromSheetA.cells[j];
                                cell.style.backgroundColor = color;
                            }
                        }
                    }

                    this.SelectedComponentRowFromSheetA = sheetDataRow;
                    if (this.SelectedComponentRow === modelBrowserRow) {
                        return;
                    }
        
                    if (this.SelectedComponentRow) {
                        this.RestoreBackgroundColor(_this.SelectedComponentRow);
                    }

                    this.ChangeBackgroundColor(modelBrowserRow);
                    this.SelectedComponentRow = modelBrowserRow;
                    
                }
                if(containerId === "viewerContainer2")
                {
                    if (this.SelectedComponentRowFromSheetB) {
                        var rowIndex = this.SelectedComponentRowFromSheetB.rowIndex;
                        var status = this.checkStatusArrayB[rowIndex];
                        if (status === undefined) {
                                
                        }
                        else {
                            var color = this.getRowHighlightColor(status);
                            for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                                cell = this.SelectedComponentRowFromSheetB.cells[j];
                                cell.style.backgroundColor = color;
                            }
                        }
                    }

                    this.SelectedComponentRowFromSheetB = sheetDataRow;
                }

                    for (var j = 0; j < sheetDataRow.cells.length; j++) {
                        cell = sheetDataRow.cells[j];
                        cell.style.backgroundColor = "#B2BABB"
                    }

                    if(containerId === "viewerContainer1")
                    {
                        this.HighlightRowInSheetData(modelBrowserRow, "viewerContainer2");
                    }
                    else if(containerId === "viewerContainer2")
                    {
                        this.HighlightRowInSheetData(modelBrowserRow, "viewerContainer1");
                    }

                    var table = modelBrowserRow.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
                    table.focus();
                    table.scrollTop = modelBrowserRow.offsetTop - modelBrowserRow.offsetHeight;

                    this.populateDetailedReviewTable(modelBrowserRow);
                    break;
                }
               
            }
        }
    }

    ComparisonReviewManager.prototype.LoadTableData = function(_this, columnHeaders, tableData,  viewerContainer, modelBrowserRow, column ) {
        
        $(function() {
 
            $(viewerContainer).jsGrid({ 
                width: "780px" ,
                height: "620px",
                // sorting: true,  
                autoload: true,     
                data: tableData,
                fields: columnHeaders,
                margin: "0px",
                rowClick: function(args) { 
                    _this.HighlightRowInMainReviewTable(args.event.currentTarget, viewerContainer)
                }
            });
         
        });


        var container = document.getElementById(viewerContainer.replace("#", ""));
        container.style.width = "780px"
        container.style.height = "620px"
        container.style.overflowX = "scroll";
        container.style.overflowY = "scroll";
        container.style.margin = "0px"

        _this.highlightSheetRowsFromCheckStatus(container,  modelBrowserRow , column);
    };

    ComparisonReviewManager.prototype.HighlightRowInSheetData = function (modelBrowserRow, viewerContainer) {
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

                if (modelBrowserRow.cells[0].innerText === currentRowInSourceTable.cells[column.Name].innerText ||
                    modelBrowserRow.cells[1].innerText === currentRowInSourceTable.cells[column.Name].innerText ) {
                    if(containerId === "viewerContainer1")
                    {
                        if (this.SelectedComponentRowFromSheetA) {
                            var rowIndex = this.SelectedComponentRowFromSheetA.rowIndex;
                            var status = this.checkStatusArrayA[rowIndex];
                            if (status === undefined) {
                                
                            }
                            else {
                                var color = this.getRowHighlightColor(status);
                                for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                                    cell = this.SelectedComponentRowFromSheetA.cells[j];
                                    cell.style.backgroundColor = color;
                                }
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
                    if(containerId === "viewerContainer2")
                    {
                        
                        if (this.SelectedComponentRowFromSheetB) {
                            var rowIndex = this.SelectedComponentRowFromSheetB.rowIndex;
                            var status = this.checkStatusArrayB[rowIndex];
                            if (status === undefined) {
                                
                            }
                            else {
                                var color = this.getRowHighlightColor(status);
                                for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                                    cell = this.SelectedComponentRowFromSheetB.cells[j];
                                    cell.style.backgroundColor = color;
                                }
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

                    if (this.SelectedComponentRow === modelBrowserRow) {
                        return;
                    }
                    if(this.SelectedComponentRow)
                    {
                        this.RestoreBackgroundColor(this.SelectedComponentRow);
                    }
                    this.SelectedComponentRow = modelBrowserRow;
                    this.ChangeBackgroundColor(this.SelectedComponentRow);

                    break;
                }
            }
        }
        
    }

    ComparisonReviewManager.prototype.populateDetailedReviewTable = function (row) {

        var parentTable = document.getElementById("ComparisonDetailedReviewCell");
        parentTable.innerHTML = '';

        if (row.cells[this.MainReviewTableStatusCell].innerHTML.toLowerCase() === "no match") {

            return;
        }

        var reviewTableId = this.getReviewTableId(row);

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

                if (source1NameCell !== undefined ||
                    source2NameCell !== undefined )
                    {
                        if(component.SourceAName !== source1NameCell.innerHTML &&
                    component.SourceBName !== source2NameCell.innerHTML) {
                    continue;
                    }
                    
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

                        var source = row.cells[this.MainReviewTableStatusCell + 1].innerHTML;
                        var destination = row.cells[this.MainReviewTableStatusCell + 2].innerHTML;
                        var ownerId = row.cells[this.MainReviewTableStatusCell + 3].innerHTML;

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

                var table = document.createElement("TABLE");
                div.appendChild(table);

                // thead
                var thead = document.createElement("thead");
                table.appendChild(thead);

                var tr = document.createElement("tr");
                thead.appendChild(tr);

                var th = document.createElement("th");
                th.innerHTML = "Source A Name"
                tr.appendChild(th);

                var th = document.createElement("th");
                th.innerHTML = "Source A Value"
                tr.appendChild(th);

                th = document.createElement("th");
                th.innerHTML = "Source B Name"
                tr.appendChild(th);

                th = document.createElement("th");
                th.innerHTML = "Source B Value"
                tr.appendChild(th);

                th = document.createElement("th");
                th.innerHTML = "Status"
                tr.appendChild(th);

                var tbody = document.createElement("tbody");
                table.appendChild(tbody);

                // show component class name as property in detailed review table               
                var property = new CheckProperty("ComponentClass",
                    component.SubComponentClass,
                    "ComponentClass",
                    component.SubComponentClass,
                    "",
                    true,
                    "");
                tr = this.addPropertyRowToDetailedTable(property);
                tbody.appendChild(tr);

                for (var j = 0; j < component.CheckProperties.length; j++) {
                    property = component.CheckProperties[j];

                    tr = this.addPropertyRowToDetailedTable(property);
                    tbody.appendChild(tr);
                }

                break;
            }
        }
    }


    ComparisonReviewManager.prototype.addPropertyRowToDetailedTable = function (property) {
        var tr = document.createElement("tr");

        var td = document.createElement("td");
        td.innerHTML = property.SourceAName;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = property.SourceAValue;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = property.SourceBName;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = property.SourceBValue;;
        tr.appendChild(td);

        td = document.createElement("td");
        if (property.PerformCheck &&
            property.Result) {
            td.innerHTML = "OK";
        }
        else {
            td.innerHTML = property.Severity;
        }
        tr.appendChild(td);

        // set row's background color according to status
        tr.style.backgroundColor = this.getRowHighlightColor(td.innerHTML);

        return tr;
    }

    ComparisonReviewManager.prototype.ChangeBackgroundColor = function (row) {
        row.style.backgroundColor = "#B2BABB";
    }

    ComparisonReviewManager.prototype.RestoreBackgroundColor = function (row) {
        if (this.MainReviewTableStatusCell < 0) {
            return;
        }

        row.style.backgroundColor = this.getRowHighlightColor(row.cells[this.MainReviewTableStatusCell].innerHTML);
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

        return tableElement.id;
    }
}