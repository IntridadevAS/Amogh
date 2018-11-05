function ReviewManager(checkManager) {
    this.CheckManager = checkManager;
    this.SelectedComponentRow;
    ReviewManager.prototype.populateReviewTables = function () {
        //var parentTable = document.getElementById("comparisonTable");
        var parentTable = document.getElementById("mainReviewCell");

        for (var componentsGroupName in this.CheckManager.ComponentsGroups) {
            var componentsGroup = this.CheckManager.ComponentsGroups[componentsGroupName];

            //var component = componentsGroup.Components[j];

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

            var th = document.createElement("th");
            th.innerHTML = "ID"
            tr.appendChild(th);

            th = document.createElement("th");
            th.innerHTML = "Source A"
            tr.appendChild(th);

            th = document.createElement("th");
            th.innerHTML = "Source B"
            tr.appendChild(th);

            th = document.createElement("th");
            th.innerHTML = "Status"
            tr.appendChild(th);

            var tbody = document.createElement("tbody");
            tbody.className = "hide";
            table.appendChild(tbody);

            for (var j = 0; j < componentsGroup.Components.length; j++) {
                var component = componentsGroup.Components[j];

                tr = document.createElement("tr");
                tbody.appendChild(tr);

                td = document.createElement("td");
                td.innerHTML = component.Identifier;
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = component.SourceAName;
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = component.SourceBName;
                tr.appendChild(td);

                td = document.createElement("td");
                // td.innerHTML = property1.Value;;
                tr.appendChild(td);

                for (var k = 0; k < component.CheckProperties.length; k++) {
                    var property = component.CheckProperties[j];
                }
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
            var createClickHandler = function (row) 
            {
                return function () 
                {
                    if(_this.SelectedComponentRow)
                     {
                        _this.RestoreBackgroundColor(_this.SelectedComponentRow);
                     }

                    _this.populateDetailedReviewTable(row);  
                    
                    xCheckStudioInterface1.highlightNode(row.cells[0].innerText);
                    xCheckStudioInterface2.highlightNode(row.cells[0].innerText);

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
                    if(_this.SelectedComponentRow !== row)
                     {
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
        row.style.backgroundColor = "#ffffff";
    }

    ReviewManager.prototype.populateDetailedReviewTable = function (row) {      
        var tBodyElement = row.parentElement;
        if(!tBodyElement)
        {
            return;
        }
        var tableElement = tBodyElement.parentElement;       
        for (var componentsGroupName in this.CheckManager.ComponentsGroups) {
            var componentsGroup = this.CheckManager.ComponentsGroups[componentsGroupName];
            if (componentsGroup.ComponentClass != tableElement.id) {
                continue;
            }
            for (var i = 0; i < componentsGroup.Components.length; i++) {
                var component = componentsGroup.Components[i];
                var idCell = row.getElementsByTagName("td")[0];

                // var sourceACell = row.getElementsByTagName("td")[0];
                // var sourceBCell = row.getElementsByTagName("td")[1];

                if(component.Identifier == idCell.innerHTML /*&&
                   component.SourceBName == sourceBCell.innerHTML*/ )
                   {
                    var parentTable = document.getElementById("detailedReviewCell");
                    parentTable.innerHTML = '';

                    var div = document.createElement("DIV");
                    //div.className = "content";
                    parentTable.appendChild(div);

                    var table = document.createElement("TABLE");
                    table.id = component.Identifier;
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

                    for (var j = 0; j < component.CheckProperties.length; j++) 
                    {
                        var property = component.CheckProperties[j];

                        tr = document.createElement("tr");
                        tbody.appendChild(tr);

                        td = document.createElement("td");
                        td.innerHTML = property.SourceAName;
                        tr.appendChild(td);

                        td = document.createElement("td");
                        td.innerHTML = property.SourceAValue;
                        tr.appendChild(td);

                        td = document.createElement("td");
                        td.innerHTML = property.SourceBName;
                        tr.appendChild(td);

                        td = document.createElement("td");
                        td.innerHTML = property.SourceBValue;
                        tr.appendChild(td);

                        td = document.createElement("td");
                        td.innerHTML = property.Result;
                        tr.appendChild(td);
                    }
                      
                    break;
                   }                   
            }
        }        
    }
}