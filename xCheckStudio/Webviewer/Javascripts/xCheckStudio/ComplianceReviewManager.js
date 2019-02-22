
function ComplianceReviewManager(complianceCheckManager,
    viewerData,
    sourceProperties,
    mainReviewTableContainer,
    detailedReviewTableContainer,
    componentIdVsComponentData,
    nodeIdVsComponentData,
    detailedReviewRowCommentDiv) {

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

    this.detailedReviewRowComments = {};
    this.DetailedReviewRowCommentDiv = detailedReviewRowCommentDiv;

    ComplianceReviewManager.prototype.loadDatasource = function () {
        if (this.ViewerData !== undefined) {
            this.ReviewModuleViewerInterface = new ReviewModuleViewerInterface(this.ViewerData,
                this.ComponentIdVsComponentData,
                this.NodeIdVsComponentData,
                this);
            this.ReviewModuleViewerInterface.ComponentIdStatusData = this.ComponentIdStatusData;

            this.ReviewModuleViewerInterface.setupViewer(550, 300);

            var viewerContainer = document.getElementById(this.ViewerData[0]);
            viewerContainer.style.height = "405px";
            viewerContainer.style.top= "70px";
        }
    }

    ComplianceReviewManager.prototype.unhighlightSelectedSheetRow = function (checkStatusArray, currentRow) {
        var rowIndex = currentRow.rowIndex;
        obj = Object.keys(checkStatusArray)
        var status = checkStatusArray[obj[0]][rowIndex]
        if (status !== undefined) {
            var color = this.getRowHighlightColor(status);
            for (var j = 0; j < currentRow.cells.length; j++) {
                cell = currentRow.cells[j];
                cell.style.backgroundColor = color;
            }
        }
        else {
            color = "#fffff"
            for (var j = 0; j < currentRow.cells.length; j++) {
                cell = currentRow.cells[j];
                cell.style.backgroundColor = color;
            }
        }
    }

    ComplianceReviewManager.prototype.populateReviewTable = function () {
        var parentTable = document.getElementById(this.MainReviewTableContainer);

        for (var componentsGroupName in this.ComplianceCheckManager.CheckComponentsGroups) {
            var componentsGroup = this.ComplianceCheckManager.CheckComponentsGroups[componentsGroupName];
            if(componentsGroup.Components.length === 0)
            {
                continue;
            }
            
            var btn = document.createElement("BUTTON");       // Create a <button> element
            btn.className = "collapsible";
            var t = document.createTextNode(componentsGroup.ComponentClass);       // Create a text node
            btn.appendChild(t);
            parentTable.appendChild(btn);

            var div = document.createElement("DIV");
            div.className = "content scrollable";
            div.id = componentsGroup.ComponentClass.replace(/\s/g,'') + "_" + this.MainReviewTableContainer;
            parentTable.appendChild(div);

            var tableData = [];
            var columnHeaders = [];

            for (var i = 0; i < 3; i++) {
                columnHeader = {};
                var title;
                if (i === 0) {
                    if(this.MainReviewTableContainer === "SourceAComplianceMainReviewCell"){
                        title = AnalyticsData.SourceAName;
                    }
                    if(this.MainReviewTableContainer === "SourceBComplianceMainReviewCell"){
                        title = AnalyticsData.SourceBName;
                    }
                    // title = "Source A";
                    name = "SourceA"
                }
                else if (i === 1) {
                    title = "Status";
                    name = "Status"
                }
                else if (i === 2) {
                    title = "NodeId";
                    name = "NodeId"
                    width = "10";
                }

                columnHeader["title"] = title;
                columnHeader["name"] = name;
                columnHeader["type"] = "text";
                columnHeader["width"] = "20";
                columnHeaders.push(columnHeader);
            }
    
            for (var j = 0; j < componentsGroup.Components.length; j++) {
                tableRowContent = {};

                var component = componentsGroup.Components[j];

                tableRowContent[columnHeaders[0].name] = component.SourceAName;
                tableRowContent[columnHeaders[1].name] = component.Status;  
                tableRowContent[columnHeaders[2].name] = component.SourceANodeId;           
      
                tableData.push(tableRowContent);
            }

            var id = "#" + div.id;
            this.LoadReviewTableData(this, columnHeaders, tableData, id);
            this.highlightMainReviewTableFromCheckStatus(div.id);

            var modelBrowserData = document.getElementById(div.id);
            // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
            var modelBrowserDataTable = modelBrowserData.children[jsGridTbodyTableIndex];
            var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");

            var modelBrowserHeaderTable = modelBrowserData.children[jsGridHeaderTableIndex];
            modelBrowserHeaderTable.style.position = "fixed"
            modelBrowserHeaderTable.style.width = "578px";
            modelBrowserHeaderTable.style.overflowX = "hidden";
            var modelBrowserHeaderTableRows = modelBrowserHeaderTable.getElementsByTagName("tr");
            for (var j = 0; j < modelBrowserHeaderTableRows.length; j++) {
                var currentRow = modelBrowserHeaderTableRows[j];
                for (var i = 0; i < currentRow.cells.length; i++) {
                    if (i > 1) {
                        currentRow.cells[i].style.display = "none";
                    }
                }

            }

            // keep track of component id vs table row and status   
            // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1  
            var modelBrowserDataTable = modelBrowserData.children[jsGridTbodyTableIndex];
            var modelBrowserDataRows = modelBrowserDataTable.getElementsByTagName("tr");
            for (var j = 0; j < modelBrowserDataRows.length; j++) {
                var currentRow = modelBrowserDataRows[j];

                for (var i = 0; i < currentRow.cells.length; i++) {
                    if (i > 1) {
                        currentRow.cells[i].style.display = "none";
                    }
                }

                var componentIdentifier = currentRow.cells[0].innerText;
                // if (componentsGroup.ComponentClass === "PipingNetworkSegment") {
                //     componentIdentifier += "_" + currentRow.cells[2].innerText;
                //     componentIdentifier += "_" + currentRow.cells[3].innerText;
                //     componentIdentifier += "_" + currentRow.cells[4].innerText;
                // }

                var status = currentRow.cells[1].innerText;
                this.ComponentIdStatusData[componentIdentifier] = [currentRow, status];
            }

            modelBrowserDataTable.style.position = "static"
            modelBrowserDataTable.style.width = "578px";
            modelBrowserDataTable.style.margin = "45px 0px 0px 0px"

            var div2 = document.createElement("DIV");
            div2.id = componentsGroup.ComponentClass + "_child";
            div2.innerText = "Count :" + modelBrowserTableRows.length;
            div2.style.fontSize = "10px";
            div.appendChild(div2);
        }
    }

    ComplianceReviewManager.prototype.highlightMainReviewTableFromCheckStatus = function (containerId) {
        var mainReviewTableContainer = document.getElementById(containerId);
        // jsGridHeaderTableIndex = 0 
        // jsGridTbodyTableIndex = 1
        var mainReviewTableRows = mainReviewTableContainer.children[jsGridTbodyTableIndex].getElementsByTagName("tr");

        for (var i = 0; i < mainReviewTableRows.length; i++) {
            var currentRow = mainReviewTableRows[i];
            if (currentRow.cells.length === 1) {
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
                width: "592px",
                height: "202px",
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

                      // hide additional column cells
                      var tableRows = this._container.context.getElementsByTagName("tr");
                      for (var j = 0; j < tableRows.length; j++) {
                          var currentRow = tableRows[j];
                          for (var i = 0; i < currentRow.cells.length; i++) {
                              if (i > 1) {
                                  currentRow.cells[i].style.display = "none";
                              }
                          }
                      }
                },
                rowClick: function (args) {
                    var commentDiv = document.getElementById(_this.DetailedReviewRowCommentDiv);
                    commentDiv.innerHTML = "";

                    _this.detailedReviewRowComments = {};


                    _this.populateDetailedReviewTable(args.event.currentTarget);
                    var tempString = "_" + _this.MainReviewTableContainer;
                    viewerContainer = viewerContainer.replace("#", "");
                    var sheetName = viewerContainer.replace(tempString, "");

                    if (_this.SourceProperties !== undefined) {
                        if (_this.MainReviewTableContainer === "SourceAComplianceMainReviewCell") {

                            _this.showSelectedSheetData("viewerContainer1", sheetName, args.event.currentTarget);
                        }
                        else if (_this.MainReviewTableContainer === "SourceBComplianceMainReviewCell") {

                            _this.showSelectedSheetData("viewerContainer2", sheetName, args.event.currentTarget);
                        }
                    }
                    else if (_this.ViewerData !== undefined) {
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

        //var reviewTableId = this.getReviewTableId(currentReviewTableRow);

        //var componentIdentifier = currentReviewTableRow.cells[0].innerHTML;
        //var result = reviewTableId.split('-');
        // if (result[0] === "PipingNetworkSegment") {
        //     var source = currentReviewTableRow.cells[2].innerHTML;
        //     var destination = currentReviewTableRow.cells[3].innerHTML;
        //     var ownerId = currentReviewTableRow.cells[4].innerHTML;

        //     if (source !== undefined && source !== "" &&
        //         destination !== undefined && destination !== "" &&
        //         ownerId !== undefined && ownerId !== "") {
        //         componentIdentifier += "_" + source + "_" + destination + "_" + ownerId;
        //     }
        // }

        // highlight component in graphics view in both viewer
        var nodeId = currentReviewTableRow.cells[2].innerHTML;
        this.ReviewModuleViewerInterface.highlightComponent(nodeId);
    }

    ComplianceReviewManager.prototype.showSelectedSheetData = function (viewerContainer, sheetName, thisRow) {
        var currentSheetName = sheetName;//thisRow.cells[0].innerText.trim();
        var mainComponentClasseData;
        var viewerContainerData = document.getElementById(viewerContainer);
        mainComponentClasseData = this.SourceProperties[currentSheetName];

        if (viewerContainerData === null) {
            return;
        }
        // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
        if (viewerContainerData.childElementCount > 1 &&
            viewerContainerData.children[jsGridTbodyTableIndex].getElementsByTagName("td")[0].innerText === currentSheetName) {
            if (_this.SelectedComponentRowFromSheetA) {
                _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetA);
            }
            if (_this.SelectedComponentRowFromSheetB) {
                _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetB);
            }
            if (_this.SelectedComponentRow) {
                _this.RestoreBackgroundColor(_this.SelectedComponentRow);
            }
            this.HighlightRowInSheetData(thisRow, viewerContainer);
            return;
        }

        var properties = [];

        if (Object.keys(mainComponentClasseData).length > 0) {
            if (viewerContainerData.childElementCount > 1) {
                for (var subComponentClass in mainComponentClasseData) {
                    // jsGridHeaderTableIndex = 0 
                    // jsGridTbodyTableIndex = 1
                    if (viewerContainerData.children[jsGridTbodyTableIndex].getElementsByTagName("td")[0].innerText === subComponentClass) {
                        if (_this.SelectedComponentRowFromSheetA) {
                            _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetA);
                        }
                        if (_this.SelectedComponentRowFromSheetB) {
                            _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetB);
                        }
                        if (_this.SelectedComponentRow) {
                            _this.RestoreBackgroundColor(_this.SelectedComponentRow);
                        }
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
            var sheetProperties = properties[0].properties;

            // if (mainComponentClasseData[currentSheetName] !== undefined) {
            //     sheetProperties = mainComponentClasseData[currentSheetName][0]["properties"];
            // }
            // else {
            //     for (var subComponent in mainComponentClasseData) {
            //         if (mainComponentClasseData[subComponent][0].Name === thisRow.cells[0].innerText.trim()) {
            //             sheetProperties = mainComponentClasseData[subComponent][0].properties;
            //         }
            //     }
            // }
            var column = {};
            if (sheetProperties !== undefined) {
                for (var i = 0; i < sheetProperties.length; i++) {
                    columnHeader = {};
                    columnHeader["name"] = sheetProperties[i].Name;
                    var type;
                    if (typeof (sheetProperties[i].Name) === "string") {
                        type = "textarea";
                    }
                    else if (typeof (sheetProperties[i].Name) === "number") {
                        type = "number";
                    }
                    columnHeader["type"] = type;
                    columnHeader["width"] = "80";
                    columnHeaders.push(columnHeader);
                    //tagnumber is for instruments XLS data sheet
                    if (Object.keys(column).length <= 3) {
                        if (sheetProperties[i].Name === "ComponentClass" ||
                            sheetProperties[i].Name === "Name" ||
                            sheetProperties[i].Name === "Description" ||
                            sheetProperties[i].Name === "Tagnumber") {
                            column[sheetProperties[i].Name] = i;
                        }
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
                if (_this.SelectedComponentRowFromSheetA) {
                    _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetA);
                }
                if (_this.SelectedComponentRow) {
                    _this.RestoreBackgroundColor(_this.SelectedComponentRow);
                }

                _this.checkStatusArray = {};
                _this.LoadSheetTableData(_this, columnHeaders, tableData, "#viewerContainer1", thisRow, column, sheetName);
                _this.HighlightRowInSheetData(thisRow, "viewerContainer1");
            }
            else if (viewerContainer === "viewerContainer2") {
                _this = this;
                if (_this.SelectedComponentRowFromSheetB) {
                    _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetB);
                }
                if (_this.SelectedComponentRow) {
                    _this.RestoreBackgroundColor(_this.SelectedComponentRow);
                }
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
                    width: "550px",
                    height: "450px",
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
        container.style.width = "550px"
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
                //tagnumber is for instruments XLS data sheet
                if (columnHeader.innerHTML.trim() === "ComponentClass" ||
                    columnHeader.innerHTML.trim() === "Name" ||
                    columnHeader.innerHTML.trim() === "Description" ||
                    columnHeader.innerHTML.trim() === "Tagnumber") {
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

                var componentName;
                if (column.Name !== undefined) {
                    componentName = sheetDataRow.cells[column.Name].innerText;
                }
                else if (column.Tagnumber !== undefined) {
                    componentName = sheetDataRow.cells[column.Tagnumber].innerText;
                }
                if (componentName === modelBrowserRow.cells[0].innerText) {
                    if (this.SelectedComponentRow === modelBrowserRow) {
                        return;
                    }

                    if (this.SelectedComponentRow) {
                        this.RestoreBackgroundColor(_this.SelectedComponentRow);
                    }

                    this.ChangeBackgroundColor(modelBrowserRow);
                    this.SelectedComponentRow = modelBrowserRow;

                    if (containerId === "viewerContainer1") {
                        if (this.SelectedComponentRowFromSheetA) {
                            this.unhighlightSelectedSheetRow(this.checkStatusArray, this.SelectedComponentRowFromSheetA);
                            // var rowIndex = this.SelectedComponentRowFromSheetA.rowIndex;
                            // obj = Object.keys(this.checkStatusArray)
                            // var status = this.checkStatusArray[obj[0]][rowIndex]
                            // var color = this.getRowHighlightColor(status);
                            // for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                            //     cell = this.SelectedComponentRowFromSheetA.cells[j];
                            //     cell.style.backgroundColor = color;
                            // }
                        }

                        this.SelectedComponentRowFromSheetA = sheetDataRow;

                        this.ChangeBackgroundColor(this.SelectedComponentRowFromSheetA);
                        // for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                        //     cell = this.SelectedComponentRowFromSheetA.cells[j];
                        //     cell.style.backgroundColor = "#B2BABB"
                        // }
                    }
                    if (containerId === "viewerContainer2") {
                        if (this.SelectedComponentRowFromSheetB) {
                            this.unhighlightSelectedSheetRow(this.checkStatusArray, this.SelectedComponentRowFromSheetB);
                            // var rowIndex = this.SelectedComponentRowFromSheetB.rowIndex;
                            // obj = Object.keys(this.checkStatusArray)
                            // var status = this.checkStatusArray[obj[0]][rowIndex]
                            // var color = this.getRowHighlightColor(status);
                            // for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                            //     cell = this.SelectedComponentRowFromSheetB.cells[j];
                            //     cell.style.backgroundColor = color;
                            // }
                        }

                        this.SelectedComponentRowFromSheetB = sheetDataRow;

                        this.ChangeBackgroundColor(this.SelectedComponentRowFromSheetB);
                        // for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                        //     cell = this.SelectedComponentRowFromSheetB.cells[j];
                        //     cell.style.backgroundColor = "#B2BABB"
                        // }
                    }

                    this.populateDetailedReviewTable(modelBrowserRow);

                    var reviewTable = _this.SelectedComponentRow.offsetParent.offsetParent;
                    reviewTable.scrollTop = modelBrowserRow.offsetTop - modelBrowserRow.offsetHeight;


                    var mainReviewTableContainer = document.getElementById(_this.MainReviewTableContainer);
                    if (!mainReviewTableContainer) {
                        return;
                    }

                    var collapsibleClasses = mainReviewTableContainer.getElementsByClassName("collapsible");
                    for (var i = 0; i < collapsibleClasses.length; i++) {
                        var collapsibleClass = collapsibleClasses[i];
                        if (collapsibleClass.innerText !== reviewTable.previousElementSibling.innerText) {
                            collapsibleClass.nextElementSibling.style.display = "none";
                            collapsibleClass.className = "collapsible";
                        }
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
        // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
        var currentSheetRows = currentSheetDataTable.children[jsGridTbodyTableIndex].getElementsByTagName("tr");

        var currentCheckStatusArray = {};
        for (var i = 0; i < modelBrowserRows.length; i++) {
            var modelBrowserRow = modelBrowserRows[i];
            for (var j = 0; j < currentSheetRows.length; j++) {
                currentSheetRow = currentSheetRows[j];
                var componentName;
                if (column.Name !== undefined) {
                    componentName = currentSheetRow.cells[column.Name].innerText;
                }
                else if (column.Tagnumber !== undefined) {
                    componentName = currentSheetRow.cells[column.Tagnumber].innerText;
                }
                if (modelBrowserRow.cells[0].innerText !== "" && modelBrowserRow.cells[0].innerText === componentName) {
                    var color = modelBrowserRow.cells[0].style.backgroundColor;
                    for (var j = 0; j < currentSheetRow.cells.length; j++) {
                        cell = currentSheetRow.cells[j];
                        cell.style.backgroundColor = color;
                        cell.style.height = "10px"
                    }
                    currentCheckStatusArray[currentSheetRow.rowIndex] = modelBrowserRow.cells[1].innerHTML;
                    break;
                }
                else if (modelBrowserRow.cells[1].innerText !== "" && modelBrowserRow.cells[1].innerText === componentName) {
                    var color = modelBrowserRow.cells[0].style.backgroundColor;
                    for (var j = 0; j < currentSheetRow.cells.length; j++) {
                        cell = currentSheetRow.cells[j];
                        cell.style.backgroundColor = color;
                    }
                    currentCheckStatusArray[currentSheetRow.rowIndex] = modelBrowserRow.cells[1].innerHTML;
                    break;
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
            // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
            var columnHeaders = containerChildren[jsGridHeaderTableIndex].getElementsByTagName("th");
            var sheetDataTable = containerChildren[jsGridTbodyTableIndex].getElementsByTagName("table")[0];
            var mainComponentClassDataTable = sheetDataTable.getElementsByTagName("tr");
            var column = {};
            for (var i = 0; i < columnHeaders.length; i++) {
                columnHeader = columnHeaders[i];
                //tagnumber is for instruments XLS data sheet
                if (columnHeader.innerHTML.trim() === "ComponentClass" ||
                    columnHeader.innerHTML.trim() === "Name" ||
                    columnHeader.innerHTML.trim() === "Description" ||
                    columnHeader.innerHTML.trim() === "Tagnumber") {
                    column[columnHeader.innerHTML.trim()] = i;
                }
                if (Object.keys(column).length === 3) {
                    break;
                }
            }
            for (var i = 0; i < mainComponentClassDataTable.length; i++) {
                rowData = mainComponentClassDataTable[i];

                var componentName;
                if (column.Name !== undefined) {
                    componentName = rowData.cells[column.Name].innerText;
                }
                else if (column.Tagnumber !== undefined) {
                    componentName = rowData.cells[column.Tagnumber].innerText;
                }
                if (thisRow.cells[0].innerText === componentName) {

                    if (containerId === "viewerContainer1") {

                        this.SelectedComponentRowFromSheetA = rowData;

                        this.ChangeBackgroundColor(this.SelectedComponentRowFromSheetA);
                        // for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                        //     cell = this.SelectedComponentRowFromSheetA.cells[j];
                        //     cell.style.backgroundColor = "#B2BABB"
                        // }
                    }
                    if (containerId === "viewerContainer2") {

                        this.SelectedComponentRowFromSheetB = rowData;
                        this.ChangeBackgroundColor(this.SelectedComponentRowFromSheetB);
                        // for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                        //     cell = this.SelectedComponentRowFromSheetB.cells[j];
                        //     cell.style.backgroundColor = "#B2BABB"
                        // }
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
            if (componentsGroup.ComponentClass.replace(/\s/g,'') != reviewTableId) {
                continue;
            }

            for (var i = 0; i < componentsGroup.Components.length; i++) {
                var component = componentsGroup.Components[i];

                if (component.Status.toLowerCase() === "no match") {
                    continue;
                }              
       
                if (this.ViewerData !== undefined) {
                    var sourceNodeIdCell = row.getElementsByTagName("td")[2];
                    if (component.SourceANodeId !== Number(sourceNodeIdCell.innerText)) {
                        continue;
                    }
                }
                else if (this.SourceProperties !== undefined) {
                    var sourceNodeNameCell = row.getElementsByTagName("td")[0];
                    if (component.SourceAName !== sourceNodeNameCell.innerText) {
                        continue;
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
                        title = "Property";
                        name = "Property";
                    }
                    else if (i === 1) {
                        title = "Value";
                        name = "Value";
                    }
                    else if (i === 2) {
                        title = "Status";
                        name = "Status";
                    }

                    columnHeader["name"] = name;
                    columnHeader["title"] = title;
                    columnHeader["type"] = "textarea";
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
                    "Match");

                this.detailedReviewRowComments[0] = property.Description;

                tableRowContent = this.addPropertyRowToDetailedTable(property, columnHeaders);
                tableData.push(tableRowContent);
                // tbody.appendChild(tr);

                for (var j = 0; j < component.CheckProperties.length; j++) {
                    property = component.CheckProperties[j];

                    this.detailedReviewRowComments[Object.keys(this.detailedReviewRowComments).length] = property.Description;

                    tableRowContent = this.addPropertyRowToDetailedTable(property, columnHeaders);
                    tableData.push(tableRowContent);
                }

                var id = "#" + this.DetailedReviewTableContainer;
                this.LoadDetailedReviewTableData(this, columnHeaders, tableData, id);
                this.highlightDetailedReviewTableFromCheckStatus(this.DetailedReviewTableContainer)

                var modelBrowserData = document.getElementById(this.DetailedReviewTableContainer);
                // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
                var modelBrowserHeaderTable = modelBrowserData.children[jsGridHeaderTableIndex];
                modelBrowserHeaderTable.style.position = "fixed"
                modelBrowserHeaderTable.style.width = "565px";
                modelBrowserHeaderTable.style.backgroundColor = "white";
                modelBrowserHeaderTable.style.overflowX = "hidden";

                // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
                var modelBrowserDataTable = modelBrowserData.children[jsGridTbodyTableIndex]
                modelBrowserDataTable.style.position = "static"
                modelBrowserDataTable.style.width = "579px";
                modelBrowserDataTable.style.margin = "55px 0px 0px 0px"

                break;
            }
        }
    }

    ComplianceReviewManager.prototype.highlightDetailedReviewTableFromCheckStatus = function (containerId) {
        var detailedReviewTableContainer = document.getElementById(containerId);
        if (detailedReviewTableContainer === null) {
            return;
        }
        if (detailedReviewTableContainer.children.length === 0) {
            return;
        }
        // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
        var detailedReviewTableRows = detailedReviewTableContainer.children[jsGridTbodyTableIndex].getElementsByTagName("tr");

        for (var i = 0; i < detailedReviewTableRows.length; i++) {
            var currentRow = detailedReviewTableRows[i];
            if (currentRow.cells.length < 2) {
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
                width: "579px",
                height: "180px",
                sorting: true,
                filtering: true,
                autoload: true,
                controller: db,
                data: tableData,
                headerRowRenderer: function() {
                    var fields = $(viewerContainer).jsGrid("option", "fields");
                    var result = $("<tr>").height(0).append($("<th>").width(194))
                    .append($("<th>").width(190));

                    result = result.add($("<tr>")
                    .append($("<th>").attr("colspan", 2).text(AnalyticsData.SourceAName)))


                    var tr = $("<tr class='jsgrid-header-row'>");
                    var grid = this;

                    grid._eachField(function (field, index) {
                        var th = $("<th>").text(field.title).width(field.width).appendTo(tr);

                        if (grid.sorting && field.sorting) {
                            th.on("click", function () {
                                grid.sort(index);
                            });
                        }
                    });

                    return result.add(tr);
                },
                fields: columnHeaders,
                margin: "0px",
                onRefreshed: function (config) {
                    var id = viewerContainer.replace("#", "");
                    document.getElementById(id).style.width = "579px";
                    _this.highlightDetailedReviewTableFromCheckStatus(id);
                },
                rowClick: function (args) {
                    var comment = _this.detailedReviewRowComments[args.event.currentTarget.rowIndex];
                    var commentDiv = document.getElementById(_this.DetailedReviewRowCommentDiv);
                    if (comment) {
                        commentDiv.innerHTML = "Comment : <br>" + comment;
                    }
                    else {
                        commentDiv.innerHTML = "Comment : <br>";
                    }
                }
            });

        });

        var container = document.getElementById(viewerContainer.replace("#", ""));
        container.style.width = "579px"
        container.style.height = "180px"
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