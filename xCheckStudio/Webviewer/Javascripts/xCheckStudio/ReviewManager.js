function ReviewManager() {

    // this.ComparisonCheckManager = comparisonCheckManager;
    // this.SourceAComplianceCheckManager = sourceAComplianceCheckManager;
    // this.SourceBComplianceCheckManager = sourceBComplianceCheckManager;

    this.SelectedComponentRow;
    this.MainReviewTableStatusCell = -1;

    this.ComaprisonReviewManager;
    this.SourceAComplianceReviewManager;
    this.SourceBComplianceReviewManager;

    ReviewManager.prototype.populateReviewTables = function (comparisonCheckManager, 
                                                             sourceAComplianceCheckManager, 
                                                             sourceBComplianceCheckManager ) {
        if (comparisonCheckManager) {
            this.ComaprisonReviewManager = new ComparisonReviewManager(comparisonCheckManager);
            this.ComaprisonReviewManager.populateReviewTable("ComparisonMainReviewCell");
        }

        if (sourceAComplianceCheckManager) {
            this.SourceAComplianceReviewManager = new ComplianceReviewManager(sourceAComplianceCheckManager);
            this.SourceAComplianceReviewManager.populateReviewTable("SourceAComplianceMainReviewCell");
        }

        if (sourceBComplianceCheckManager) {
            this.SourcebBComplianceReviewManager = new ComplianceReviewManager(sourceBComplianceCheckManager);
            this.SourcebBComplianceReviewManager.populateReviewTable("SourceBComplianceMainReviewCell");
        }
    } 
    
    // ReviewManager.prototype.populateDetailedReviewTable = function (row) {

    //     var reviewTableId = this.getReviewTableId(row);

    //     for (var componentsGroupName in this.CheckManager.CheckComponentsGroups) {

    //         // get the componentgroupd corresponding to selected component 
    //         var componentsGroup = this.CheckManager.CheckComponentsGroups[componentsGroupName];
    //         if (componentsGroup.ComponentClass != reviewTableId) {
    //             continue;
    //         }

    //         for (var i = 0; i < componentsGroup.Components.length; i++) {
    //             var component = componentsGroup.Components[i];

    //             if(component.Status.toLowerCase() === "no match")
    //             {
    //                 return;
    //             }
    //             var source1NameCell = row.getElementsByTagName("td")[0];
    //             var source2NameCell = row.getElementsByTagName("td")[1];

    //             if (component.SourceAName == source1NameCell.innerHTML) {
    //                 if (!checkManager.ComplianceCheck &&
    //                     component.SourceBName !== source2NameCell.innerHTML) {
    //                     continue;
    //                 }

    //                 // if component is PipingNetworkSegment, check if source and destination properties are same
    //                 // because they may have same tag names
    //                 if (componentsGroup.ComponentClass === "PipingNetworkSegment") {
    //                     var checkPropertySource = component.getCheckProperty('Source', 'Source', checkManager.ComplianceCheck);
    //                     var checkPropertyDestination = component.getCheckProperty('Destination', 'Destination', checkManager.ComplianceCheck);
    //                     var checkPropertyOwnerId = component.getCheckProperty('OwnerId', 'OwnerId', checkManager.ComplianceCheck);

    //                     if (checkPropertySource != undefined &&
    //                         checkPropertyDestination != undefined &&
    //                         checkPropertyOwnerId != undefined) {

    //                         var source = row.cells[this.MainReviewTableStatusCell + 1].innerHTML;
    //                         var destination = row.cells[this.MainReviewTableStatusCell + 2].innerHTML;
    //                         var ownerId = row.cells[this.MainReviewTableStatusCell + 3].innerHTML;

    //                         if (checkPropertySource.SourceAValue !== source ||
    //                             checkPropertyDestination.SourceAValue !== destination ||
    //                             checkPropertyOwnerId.SourceAValue !== ownerId) {
    //                             continue;
    //                         }
    //                     }
    //                 }

    //                 var parentTable = document.getElementById("detailedReviewCell");
    //                 parentTable.innerHTML = '';

    //                 var div = document.createElement("DIV");
    //                 parentTable.appendChild(div);

    //                 div.innerHTML = "Check Details :";
    //                 div.style.fontSize = "20px";
    //                 div.style.fontWeight = "bold";

    //                 var table = document.createElement("TABLE");
    //                 div.appendChild(table);

    //                 // thead
    //                 var thead = document.createElement("thead");
    //                 table.appendChild(thead);

    //                 var tr = document.createElement("tr");
    //                 thead.appendChild(tr);

    //                 var th = document.createElement("th");
    //                 th.innerHTML = "Source A Name"
    //                 tr.appendChild(th);

    //                 var th = document.createElement("th");
    //                 th.innerHTML = "Source A Value"
    //                 tr.appendChild(th);

    //                 if (!checkManager.ComplianceCheck) {
    //                     th = document.createElement("th");
    //                     th.innerHTML = "Source B Name"
    //                     tr.appendChild(th);

    //                     th = document.createElement("th");
    //                     th.innerHTML = "Source B Value"
    //                     tr.appendChild(th);
    //                 }

    //                 th = document.createElement("th");
    //                 th.innerHTML = "Status"
    //                 tr.appendChild(th);

    //                 var tbody = document.createElement("tbody");
    //                 table.appendChild(tbody);

    //                 // show component class name as property in detailed review table               
    //                 var property = new CheckProperty("ComponentClass",
    //                     component.SubComponentClass,
    //                     "ComponentClass",
    //                     component.SubComponentClass,
    //                     "",
    //                     true,
    //                     "");
    //                 tr = this.addPropertyRowToDetailedTable(property);
    //                 tbody.appendChild(tr);

    //                 for (var j = 0; j < component.CheckProperties.length; j++) {
    //                     property = component.CheckProperties[j];

    //                     tr = this.addPropertyRowToDetailedTable(property);
    //                     tbody.appendChild(tr);
    //                 }

    //                 break;
    //             }
    //         }
    //     }
    // }

    // ReviewManager.prototype.addPropertyRowToDetailedTable = function (property) {
    //     var tr = document.createElement("tr");
    //     //tbody.appendChild(tr);

    //     var td = document.createElement("td");
    //     td.innerHTML = property.SourceAName;
    //     tr.appendChild(td);

    //     td = document.createElement("td");
    //     td.innerHTML = property.SourceAValue;
    //     tr.appendChild(td);

    //     if (!checkManager.ComplianceCheck) {
    //         td = document.createElement("td");
    //         td.innerHTML = property.SourceBName;
    //         tr.appendChild(td);

    //         td = document.createElement("td");
    //         td.innerHTML = property.SourceBValue;;
    //         tr.appendChild(td);
    //     }

    //     td = document.createElement("td");
    //     if (property.PerformCheck &&
    //         property.Result) {
    //         td.innerHTML = "OK";
    //     }
    //     else {
    //         td.innerHTML = property.Severity;
    //     }
    //     tr.appendChild(td);

    //     // set row's background color according to status
    //     tr.style.backgroundColor = this.getRowHighlightColor(td.innerHTML);

    //     return tr;
    // }

    // ReviewManager.prototype.HighlightReviewComponent = function (data) {
    //     var componentsGroupName = data["MainComponentClass"];
    //     var doc = document.getElementsByClassName("collapsible");
    //     for (var i = 0; i < doc.length; i++) {
    //         if (componentsGroupName.localeCompare(doc[i].innerHTML) == 0) {
    //             var nextSibling = doc[i].nextSibling;
    //             if (nextSibling.style.display != "block") {
    //                 nextSibling.style.display = "block";
    //             }
    //             var siblingCount = nextSibling.childElementCount;
    //             for (var j = 0; j < siblingCount; j++) {
    //                 var child = doc[i].nextSibling.children[j];
    //                 var childRows = child.getElementsByTagName("tr");
    //                 for (var k = 0; k < childRows.length; k++) {

    //                     var childRow = childRows[k];
    //                     var childRowColumns = childRow.getElementsByTagName("td");
    //                     if (childRowColumns.length > 0) {
    //                         if (childRowColumns[0].innerHTML === data.Name) {
    //                             var componentIdentifier = data.Name;
    //                             var rowIdentifier = childRowColumns[0].innerHTML
    //                             if (data.MainComponentClass === "PipingNetworkSegment") {
    //                                 componentIdentifier += "_" + data.Source + "_" + data.Destination + "_" + data.OwnerId;

    //                                 var source = row.cells[this.MainReviewTableStatusCell + 1].innerHTML;
    //                                 var destination = row.cells[this.MainReviewTableStatusCell + 2].innerHTML;
    //                                 var ownerId = row.cells[this.MainReviewTableStatusCell + 3].innerHTML;

    //                                 rowIdentifier += "_" + source + "_" + destination + "_" + ownerId;

    //                                 if (rowIdentifier === componentIdentifier) {
    //                                     if (this.SelectedComponentRow) {
    //                                         this.RestoreBackgroundColor(this.SelectedComponentRow);
    //                                     }

    //                                     this.ChangeBackgroundColor(childRow)
    //                                     this.populateDetailedReviewTable(childRow);
    //                                     this.SelectedComponentRow = childRow;

    //                                     break;
    //                                 }

    //                             }


    //                             if (this.SelectedComponentRow) {
    //                                 this.RestoreBackgroundColor(this.SelectedComponentRow);
    //                             }

    //                             this.ChangeBackgroundColor(childRow)
    //                             this.populateDetailedReviewTable(childRow);
    //                             this.SelectedComponentRow = childRow;
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }
}