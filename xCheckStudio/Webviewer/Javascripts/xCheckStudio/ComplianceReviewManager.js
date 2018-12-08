
function ComplianceReviewManager(complianceCheckManager,
    viewerData,
    mainReviewTableContainer,
    detailedReviewTableContainer,
    componentIdVsComponentData,
    nodeIdVsComponentData) {

    this.ViewerData = viewerData;
  
    this.ReviewModuleViewerInterface;
   
    this.ComplianceCheckManager = complianceCheckManager;

    this.MainReviewTableContainer = mainReviewTableContainer;
    this.DetailedReviewTableContainer = detailedReviewTableContainer;

    this.ComponentIdStatusData = {};

    this.ComponentIdVsComponentData = componentIdVsComponentData;
    this.NodeIdVsComponentData = nodeIdVsComponentData;

    ComplianceReviewManager.prototype.loadDatasource = function () {
        this.ReviewModuleViewerInterface = new ReviewModuleViewerInterface(this.ViewerData,
                                                                           this.ComponentIdVsComponentData,
                                                                           this.NodeIdVsComponentData);
        this.ReviewModuleViewerInterface.ComponentIdStatusData =  this.ComponentIdStatusData;

        this.ReviewModuleViewerInterface.setupViewer();      
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
            th.innerHTML = "Source"
            tr.appendChild(th);


            th = document.createElement("th");
            th.innerHTML = "Status"
            tr.appendChild(th);

            this.MainReviewTableStatusCell = tr.cells.length - 1;

            // if component groupd is PipingNetworkSegment, create two hidden columns at end for Source and destination
            if (componentsGroup.ComponentClass === "PipingNetworkSegment") {

                th = document.createElement("th");
                th.innerHTML = "Source"
                tr.appendChild(th);

                th = document.createElement("th");
                th.innerHTML = "Destination"
                tr.appendChild(th);

                th = document.createElement("th");
                th.innerHTML = "OwnerId"
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
                td.innerHTML = component.Status;
                tr.appendChild(td);

                // construct component identifier 
                var componentIdentifier = component.SourceAName;

                if (componentsGroup.ComponentClass === "PipingNetworkSegment") {
                    var checkPropertySource = component.getCheckProperty('Source', '', true);
                    var checkPropertyDestination = component.getCheckProperty('Destination', '', true);
                    var checkPropertyOwnerId = component.getCheckProperty('OwnerId', '', true);

                    td = document.createElement("td");
                    if (checkPropertySource != undefined) {
                        td.innerHTML = checkPropertySource.SourceAValue;

                        componentIdentifier += "_" + checkPropertySource.SourceAValue;
                    }
                    tr.appendChild(td);

                    td = document.createElement("td");
                    if (checkPropertyDestination != undefined) {
                        td.innerHTML = checkPropertyDestination.SourceAValue;

                        componentIdentifier += "_" + checkPropertyDestination.SourceAValue;
                    }
                    tr.appendChild(td);

                    td = document.createElement("td");
                    if (checkPropertyOwnerId != undefined) {
                        td.innerHTML = checkPropertyOwnerId.SourceAValue;

                        componentIdentifier += "_" + checkPropertyOwnerId.SourceAValue;
                    }
                    tr.appendChild(td);
                }

                 // keep track of component id vs table row and status         
                this.ComponentIdStatusData[componentIdentifier] = [tr, component.Status];               
            }

            this.bindEvents(table);
        }        
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

    ComplianceReviewManager.prototype.populateDetailedReviewTable = function (row) {

        var parentTable = document.getElementById(this.DetailedReviewTableContainer);
        parentTable.innerHTML = '';

        if (row.cells[this.MainReviewTableStatusCell].innerHTML.toLowerCase() === "no match") {


            return;
        }

        var reviewTableId = this.getReviewTableId(row);

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


    ComplianceReviewManager.prototype.addPropertyRowToDetailedTable = function (property) {
        var tr = document.createElement("tr");
        //tbody.appendChild(tr);

        var td = document.createElement("td");
        td.innerHTML = property.SourceAName;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = property.SourceAValue;
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


    ComplianceReviewManager.prototype.ChangeBackgroundColor = function (row) {
        row.style.backgroundColor = "#9999ff";
    }

    ComplianceReviewManager.prototype.RestoreBackgroundColor = function (row) {
        if (this.MainReviewTableStatusCell < 0) {
            return;
        }

        row.style.backgroundColor = this.getRowHighlightColor(row.cells[this.MainReviewTableStatusCell].innerHTML);
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

        return tableElement.id;
    }
}