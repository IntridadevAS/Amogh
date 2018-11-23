function ReviewManager(checkManager) {
    this.CheckManager = checkManager;
    this.SelectedComponentRow;
    ReviewManager.prototype.populateReviewTables = function () {       
        var parentTable = document.getElementById("mainReviewCell");

        for (var componentsGroupName in this.CheckManager.CheckComponentsGroups) {
            var componentsGroup = this.CheckManager.CheckComponentsGroups[componentsGroupName];            

            var btn = document.createElement("BUTTON");       // Create a <button> element
            btn.className = "collapsible";
            var t = document.createTextNode(componentsGroup.ComponentClass);       // Create a text node
            btn.appendChild(t);
            parentTable.appendChild(btn);

            var div = document.createElement("DIV");
            div.className = "content";
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
                td.innerHTML = component.SourceBName;
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = component.Status;
                tr.appendChild(td);
               
                 // construct component identifier 
                var componentIdentifier = component.SourceAName;

                if (componentsGroup.ComponentClass === "PipingNetworkSegment") {
                    var checkPropertySource = component.getCheckProperty('Source', 'Source');
                    var checkPropertyDestination = component.getCheckProperty('Destination', 'Destination');
                    var checkPropertyOwnerId = component.getCheckProperty('OwnerId', 'OwnerId');

                    td = document.createElement("td");
                    if (checkPropertySource != undefined) {
                        td.innerHTML = checkPropertySource.SourceAValue;

                        componentIdentifier += "_" +checkPropertySource.SourceAValue;
                    }
                    tr.appendChild(td);

                    td = document.createElement("td");
                    if (checkPropertyDestination != undefined) {
                    td.innerHTML = checkPropertyDestination.SourceAValue;

                    componentIdentifier += "_" +checkPropertyDestination.SourceAValue;
                    }
                    tr.appendChild(td);

                    td = document.createElement("td");
                    if (checkPropertyOwnerId != undefined) {
                    td.innerHTML = checkPropertyOwnerId.SourceAValue;

                    componentIdentifier += "_" +checkPropertyOwnerId.SourceAValue;
                    }
                    tr.appendChild(td); 
            }

             // highlight component with corresponding color after check performed            
             xCheckStudioInterface1.highlightManager.changeComponentColor(componentIdentifier, tr, component.Status);
             xCheckStudioInterface2.highlightManager.changeComponentColor(componentIdentifier, tr, component.Status);
            }

            this.bindEvents(table);
        }
    }

    ReviewManager.prototype.bindEvents = function (table) {
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
                        componentIdentifier += "_" + row.cells[3].innerHTML + "_" + row.cells[4].innerHTML + "_" + row.cells[5].innerHTML;
                    }
                    // highlight component in graphics view in both viewer
                    xCheckStudioInterface1.highlightComponent(componentIdentifier);
                    xCheckStudioInterface2.highlightComponent(componentIdentifier);

                    // highlight model browser table row in both viewer
                    xCheckStudioInterface1._modelTree.HighlightModelBrowserRow(componentIdentifier);
                    xCheckStudioInterface2._modelTree.HighlightModelBrowserRow(componentIdentifier);

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

    ReviewManager.prototype.ChangeBackgroundColor = function (row) {
        row.style.backgroundColor = "#9999ff";
    }

    ReviewManager.prototype.RestoreBackgroundColor = function (row) {        
        row.style.backgroundColor =this.getRowHighlightColor(row.cells[2].innerHTML);
    }
    
    ReviewManager.prototype.getRowHighlightColor = function (status)
    {        
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
        else 
        {
            return "#ffffff";
        }       
    }

    ReviewManager.prototype.getReviewTableId = function (row) {
        var tBodyElement = row.parentElement;
        if (!tBodyElement) {
            return;
        }
        var tableElement = tBodyElement.parentElement;

        return tableElement.id;
    }

    ReviewManager.prototype.populateDetailedReviewTable = function (row) {

        var reviewTableId = this.getReviewTableId(row);

        for (var componentsGroupName in this.CheckManager.CheckComponentsGroups) {

            // get the componentgroupd corresponding to selected component 
            var componentsGroup = this.CheckManager.CheckComponentsGroups[componentsGroupName];
            if (componentsGroup.ComponentClass != reviewTableId) {
                continue;
            }

            for (var i = 0; i < componentsGroup.Components.length; i++) {
                var component = componentsGroup.Components[i];

                var source1NameCell = row.getElementsByTagName("td")[0];
                var source2NameCell = row.getElementsByTagName("td")[1];

                if (component.SourceAName == source1NameCell.innerHTML &&
                    component.SourceBName == source2NameCell.innerHTML) {
                    // if component is PipingNetworkSegment, check if source and destination properties are same
                    // because they may have same tag names
                    if (componentsGroup.ComponentClass === "PipingNetworkSegment") {
                        var checkPropertySource = component.getCheckProperty('Source', 'Source');
                        var checkPropertyDestination = component.getCheckProperty('Destination', 'Destination');
                        var checkPropertyOwnerId = component.getCheckProperty('OwnerId', 'OwnerId');

                        if (checkPropertySource != undefined &&
                            checkPropertyDestination != undefined &&
                            checkPropertyOwnerId != undefined) {
                            if (checkPropertySource.SourceAValue !== row.getElementsByTagName("td")[3].innerHTML ||
                                checkPropertyDestination.SourceAValue !== row.getElementsByTagName("td")[4].innerHTML ||
                                checkPropertyOwnerId.SourceAValue !== row.getElementsByTagName("td")[5].innerHTML) {
                                continue;
                            }
                        }
                    }

                    var parentTable = document.getElementById("detailedReviewCell");
                    parentTable.innerHTML = '';

                    var div = document.createElement("DIV");
                    parentTable.appendChild(div);

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

                        //tr = document.createElement("tr");
                        tr = this.addPropertyRowToDetailedTable(property);
                        tbody.appendChild(tr);

                        // td = document.createElement("td");
                        // td.innerHTML = property.SourceAName;
                        // tr.appendChild(td);

                        // td = document.createElement("td");
                        // td.innerHTML = property.SourceAValue;
                        // tr.appendChild(td);

                        // td = document.createElement("td");
                        // td.innerHTML = property.SourceBName;
                        // tr.appendChild(td);

                        // td = document.createElement("td");
                        // td.innerHTML = property.SourceBValue;
                        // tr.appendChild(td);

                        // td = document.createElement("td");
                        // if (property.PerformCheck &&
                        //     property.Result) {
                        //     td.innerHTML = "OK";
                        // }
                        // else
                        // {
                        //     td.innerHTML = property.Severity;
                        // }

                        // tr.appendChild(td);

                        // // set row's background color according to status
                        // tr.style.backgroundColor =this.getRowHighlightColor(td.innerHTML);
                    }

                    break;
                }
            }
        }
    }
    
    ReviewManager.prototype.addPropertyRowToDetailedTable = function (property)
    {
        var tr = document.createElement("tr");
        //tbody.appendChild(tr);

        var td = document.createElement("td");
        td.innerHTML = property.SourceAName;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = property.SourceAValue;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML =  property.SourceBName;
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = property.SourceBValue;;
        tr.appendChild(td);

        td = document.createElement("td");
        if (property.PerformCheck &&
            property.Result) {
            td.innerHTML = "OK";
        }
        else
        {
            td.innerHTML = property.Severity;
        }
        tr.appendChild(td);

        // set row's background color according to status
        tr.style.backgroundColor =this.getRowHighlightColor(td.innerHTML); 
        
        return tr;
    }

    ReviewManager.prototype.HighlightReviewComponent = function (data) {
        var componentsGroupName = data["MainComponentClass"];
        var doc = document.getElementsByClassName("collapsible");
        for (var i = 0; i < doc.length; i++) {
            if (componentsGroupName.localeCompare(doc[i].innerHTML) == 0) {
                var nextSibling = doc[i].nextSibling;
                if (nextSibling.style.display != "block") {
                    nextSibling.style.display = "block";
                }
                var siblingCount = nextSibling.childElementCount;
                for (var j = 0; j < siblingCount; j++) {
                    var child = doc[i].nextSibling.children[j];
                    var childRows = child.getElementsByTagName("tr");
                    for (var k = 0; k < childRows.length; k++) {
                        
                        var childRow = childRows[k];
                        var childRowColumns = childRow.getElementsByTagName("td");
                        if (childRowColumns.length > 0) {
                            if (childRowColumns[0].innerHTML === data.Name) {
                                var componentIdentifier = data.Name;
                                var rowIdentifier = childRowColumns[0].innerHTML
                                if (data.MainComponentClass === "PipingNetworkSegment") {
                                    componentIdentifier += "_" + data.Source + "_" + data.Destination + "_" + data.OwnerId;
                                    rowIdentifier += "_" + childRowColumns[3].innerHTML + "_"
                                        + childRowColumns[4].innerHTML + "_" + childRowColumns[5].innerHTML;
                                    if (rowIdentifier === componentIdentifier) {
                                        if (this.SelectedComponentRow) {
                                            this.RestoreBackgroundColor(this.SelectedComponentRow);
                                        }
        
                                        this.ChangeBackgroundColor(childRow)
                                        this.populateDetailedReviewTable(childRow);
                                        this.SelectedComponentRow = childRow;
        
                                        break;
                                    }

                                }


                                if (this.SelectedComponentRow) {
                                    this.RestoreBackgroundColor(this.SelectedComponentRow);
                                }

                                this.ChangeBackgroundColor(childRow)
                                this.populateDetailedReviewTable(childRow);
                                this.SelectedComponentRow = childRow;
                            }
                        }
                    }
                }
            }
        }
    }
}