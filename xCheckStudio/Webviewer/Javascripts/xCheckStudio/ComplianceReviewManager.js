
function ComplianceReviewManager(complianceCheckManager) {
    this.ComplianceCheckManager = complianceCheckManager;


    ComplianceReviewManager.prototype.populateReviewTable = function (reviewTableContainer) {
        var parentTable = document.getElementById(reviewTableContainer);

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

            // if (!checkManager.ComplianceCheck) {

            // th = document.createElement("th");
            // th.innerHTML = "Source A"
            // tr.appendChild(th);

            // th = document.createElement("th");
            // th.innerHTML = "Source B"
            // tr.appendChild(th);
            // }
            // else {
                th = document.createElement("th");
                th.innerHTML = "Source"
                tr.appendChild(th);
            // }

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

                // if (!checkManager.ComplianceCheck) {
                // td = document.createElement("td");
                // td.innerHTML = component.SourceBName;
                // tr.appendChild(td);
                // }

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

                // highlight component row in main review table with corresponding color after check performed
                var highlightManager = new HighlightManager();
                highlightManager.changeComponentRowColor(tr, component.Status);
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

                    // if (!checkManager.ComplianceCheck) {
                        // if not compliance check

                        // highlight component in graphics view in both viewer
                        reviewModuleViewerInterface1.highlightComponent(componentIdentifier);
                        reviewModuleViewerInterface2.highlightComponent(componentIdentifier);

                        // highlight model browser table row in both viewer
                        // xCheckStudioInterface1._modelTree.HighlightModelBrowserRow(componentIdentifier);
                        // xCheckStudioInterface2._modelTree.HighlightModelBrowserRow(componentIdentifier);
                    // }
                    // else {
                    //     // if compliance check
                    //     if (reviewModuleViewerInterface1 !== undefined &&
                    //         reviewModuleViewerInterface1.Viewer._params.containerId === activeViewerContainer.id) {

                    //         // highlight component in graphics view in active viewer
                    //         reviewModuleViewerInterface1.highlightComponent(componentIdentifier);

                    //         // highlight model browser table row in active viewer
                    //         // reviewModuleInterface.reviewModuleViewerInterface1._modelTree.HighlightModelBrowserRow(componentIdentifier);
                    //     }
                    //     else if (reviewModuleViewerInterface2 !== undefined &&
                    //         reviewModuleViewerInterface2.Viewer._params.containerId === activeViewerContainer.id) {

                    //         // highlight component in graphics view in active viewer
                    //         reviewModuleViewerInterface2.highlightComponent(componentIdentifier);

                    //         // highlight model browser table row in active viewer
                    //         // reviewModuleInterface.reviewModuleViewerInterface2._modelTree.HighlightModelBrowserRow(componentIdentifier);
                    //     }
                    // }

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