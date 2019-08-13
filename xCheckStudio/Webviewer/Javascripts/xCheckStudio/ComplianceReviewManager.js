
function ComplianceReviewManager(complianceCheckManager,
    viewerData,
    sourceComponents,
    mainReviewTableContainer,
    detailedReviewTableContainer,   
    detailedReviewRowCommentDiv,
    componentsHierarchy) {

    this.ViewerData = viewerData;

    this.SourceComponents = sourceComponents;

    this.ReviewModuleViewerInterface;

    this.ComplianceCheckManager = complianceCheckManager;

    this.MainReviewTableContainer = mainReviewTableContainer;
    this.DetailedReviewTableContainer = detailedReviewTableContainer;

    this.NodeIdStatusData = componentsHierarchy;

    //ComponentIdVsComponentData = componentIdVsComponentData;
    //this.NodeIdVsComponentData = nodeIdVsComponentData;

    this.SelectedComponentRowFromSheet;
    this.SelectedComponentRowFromSheetA;
    this.SelectedComponentRowFromSheetB;

    this.checkStatusArray = {};

    this.detailedReviewRowComments = {};
    this.DetailedReviewRowCommentDiv = detailedReviewRowCommentDiv;

    this.SourceNodeIdvsCheckComponent = {};
    this.SourceComponentIdvsNodeId = {};

    this.SourceViewerCurrentSheetLoaded = undefined;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    this.SelectionManager = new ReviewComplianceSelectionManager();

    ComplianceReviewManager.prototype.loadDatasource = function () {
        if (this.ViewerData !== undefined) {
            this.ReviewModuleViewerInterface = new ReviewModuleViewerInterface(this.ViewerData,
                this.ComponentIdVsComponentData,
                this.NodeIdVsComponentData,
                this);
            this.ReviewModuleViewerInterface.NodeIdStatusData = this.NodeIdStatusData;

            this.ReviewModuleViewerInterface.setupViewer(550, 300);

            var viewerContainer = document.getElementById(this.ViewerData[0]);
            viewerContainer.style.height = "405px";
            viewerContainer.style.top = "70px";
        }
    }

    ComplianceReviewManager.prototype.unhighlightSelectedSheetRow = function (checkStatusArray, currentRow) {
        var rowIndex = currentRow.rowIndex;
        obj = Object.keys(checkStatusArray)
        var status = checkStatusArray[obj[0]][rowIndex]
        if (status !== undefined) {
            var color = this.SelectionManager.GetRowHighlightColor(status);
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

        for (var key in this.ComplianceCheckManager) {
            if (!this.ComplianceCheckManager.hasOwnProperty(key)) {
                continue;
            }
            var checkGroups = this.ComplianceCheckManager[key];

            for (var groupId in checkGroups) {
                if (!checkGroups.hasOwnProperty(groupId)) {
                    continue;
                }

                var componentsGroup = checkGroups[groupId];

                // for (var componentsGroupName in this.ComplianceCheckManager.CheckComponentsGroups) {
                //var componentsGroup = this.ComplianceCheckManager.CheckComponentsGroups[componentsGroupName];
                if (componentsGroup.CheckComponents.length === 0) {
                    continue;
                }

                var btn = document.createElement("BUTTON");
                var att = document.createAttribute("groupId");
                att.value = groupId;
                btn.setAttributeNode(att);     // Create a <button> element
                btn.className = "collapsible";
                var t = document.createTextNode(componentsGroup.ComponentClass);       // Create a text node
                btn.appendChild(t);
                parentTable.appendChild(btn);

                var div = document.createElement("DIV");
                div.className = "content scrollable";
                div.id = componentsGroup.ComponentClass.replace(/\s/g, '') + "_" + this.MainReviewTableContainer;
                parentTable.appendChild(div);

                var columnHeaders = [];
                for (var i = 0; i < 5; i++) {
                    columnHeader = {};
                    var title;
                    if (i === 0) {
                        // if (this.MainReviewTableContainer === "SourceAComplianceMainReviewCell") {
                        //     title = "Name";
                        // }
                        // if (this.MainReviewTableContainer === "SourceBComplianceMainReviewCell") {
                        //title = AnalyticsData.SourceBName;
                        title = "Name";
                        // }
                        // title = "Source A";
                        name = "SourceA";
                    }
                    else if (i === 1) {
                        title = "Status";
                        name = "Status";
                    }
                    else if (i === 2) {
                        title = "NodeId";
                        name = "NodeId";
                        width = "10";
                    }
                    else if (i === 3) {
                        title = "ID";
                        name = "ID";
                        width = "10";
                    }
                    else if (i === 4) {
                        title = "groupId";
                        name = "groupId";
                        width = "10";
                    }

                    columnHeader["title"] = title;
                    columnHeader["name"] = name;
                    columnHeader["type"] = "text";
                    columnHeader["width"] = "20";
                    columnHeaders.push(columnHeader);
                }

                var tableData = [];
                for (var componentId in componentsGroup.CheckComponents) {
                    if (!componentsGroup.CheckComponents.hasOwnProperty(componentId)) {
                        continue;
                    }
                    // for (var j = 0; j < componentsGroup.CheckComponents.length; j++) {

                    component = componentsGroup.CheckComponents[componentId];
                    //var component = componentsGroup.Components[j];

                    tableRowContent = {};
                    tableRowContent[columnHeaders[0].name] = component.SourceAName;
                    tableRowContent[columnHeaders[1].name] = component.Status;
                    tableRowContent[columnHeaders[2].name] = component.SourceANodeId;
                    tableRowContent[columnHeaders[3].name] = component.ID;
                    tableRowContent[columnHeaders[4].name] = groupId;

                    tableData.push(tableRowContent);

                    // maintain track of check components
                    if (component.SourceANodeId) {
                        this.SourceNodeIdvsCheckComponent[component.SourceANodeId] = {
                            "Id": component.ID,
                            "SourceAName": component.SourceAName,
                            "MainClass": componentsGroup.ComponentClass,
                            "SourceANodeId": component.SourceANodeId
                        };

                        this.SourceComponentIdvsNodeId[component.ID] = component.SourceANodeId;
                    }
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
                var modelBrowserDataTable = modelBrowserData.children[jsGridTbodyTableIndex];
                var modelBrowserDataRows = modelBrowserDataTable.getElementsByTagName("tr");
                for (var j = 0; j < modelBrowserDataRows.length; j++) {
                    var currentRow = modelBrowserDataRows[j];

                    for (var i = 0; i < currentRow.cells.length; i++) {
                        if (i > 1) {
                            currentRow.cells[i].style.display = "none";
                        }
                    }

                    // var status = currentRow.cells[1].innerText;
                    // if (currentRow.cells.length === 3) {
                    //     if (currentRow.cells[2].innerText !== undefined &&
                    //         currentRow.cells[2].innerText !== "") {
                    //         var nodeId = currentRow.cells[2].innerText;
                    //         this.NodeIdStatusData[nodeId] = [currentRow, status];
                    //     }
                    // }
                }

                modelBrowserDataTable.style.position = "static"
                modelBrowserDataTable.style.width = "578px";
                modelBrowserDataTable.style.margin = "45px 0px 0px 0px"

                var jsgriddiv = $('#' + componentsGroup.ComponentClass.replace(/\s/g, '') + "_" + this.MainReviewTableContainer).find('.jsgrid-grid-body');
                var div2 = document.createElement("DIV");
                div2.id = componentsGroup.ComponentClass + "_child";
                div2.innerText = "Count :" + modelBrowserTableRows.length;
                div2.style.fontSize = "10px";
                jsgriddiv[0].appendChild(div2);
            }
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
            var color = this.SelectionManager.GetRowHighlightColor(status);
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
                onDataLoaded: function (args) {
                    var checkGroups = _this.ComplianceCheckManager["CheckGroups"];
                    var mainReviewTableDiv;
                    var detailedReviewTableDiv;
                    if (_this.MainReviewTableContainer === "SourceAComplianceMainReviewCell") {                       
                        mainReviewTableDiv = "SourceAComplianceMainReviewTbody";
                        detailedReviewTableDiv = "ComplianceADetailedReviewTbody";                        
                        //initializeSourceAComplianceContextMenus();
                    }
                    else if (_this.MainReviewTableContainer === "SourceBComplianceMainReviewCell") {
                        mainReviewTableDiv = "SourceBComplianceMainReviewTbody";
                        detailedReviewTableDiv = "ComplianceBDetailedReviewTbody";       
                        //initializeSourceBComplianceContextMenus();
                    }
                    var reviewComplianceContextMenuManager = new ReviewComplianceContextMenuManager(checkGroups,mainReviewTableDiv,detailedReviewTableDiv, _this);
                    reviewComplianceContextMenuManager.Init();
                },
                onItemUpdated: function(args) {
                    for(var index = 0; index < args.grid.data.length; index++) {
                        if(args.grid.data[index].ID == args.row[0].cells[3].innerHTML)
                        {
                            if(args.grid.data[index].Status !== args.row[0].cells[1].innerHTML)
                            {
                                args.grid.data[index].Status = args.row[0].cells[1].innerHTML;
                                break;
                            }
                        }
                    }
                },
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

                    if (_this.SourceComponents !== undefined) {
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

    ComplianceReviewManager.prototype.UpdateStatusForComponent = function (selectedRow) {
        var _this = this;
        if (selectedRow[0].cells[ComplianceColumns.Status].innerHTML === "OK") {
            return;
        }
       
        var componentId = Number(selectedRow[0].cells[ComplianceColumns.ResultId].innerText)
        var groupId = Number(selectedRow[0].cells[ComplianceColumns.GroupId].innerText)

        var tableToUpdate;
        if (selectedRow[0].offsetParent.offsetParent.offsetParent.id == "SourceAComplianceMainReviewTbody") {
            tableToUpdate = "complianceSourceA";
        }
        else if (selectedRow[0].offsetParent.offsetParent.offsetParent.id == "SourceBComplianceMainReviewTbody") {
            tableToUpdate = "complianceSourceB";
        }
        else {
            return;
        }

        try {
            $.ajax({
                url: 'PHP/updateResultsStatusToAccept.php',
                type: "POST",
                async: true,
                data: { 'componentid': componentId, 'tabletoupdate': tableToUpdate, 'ProjectName' : projectinfo.projectname, 'CheckName': checkinfo.checkname },
                success: function (msg) {
                    _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId].Status = "OK(A)";
                    var component = _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                    component.status = "OK(A)";
                    for (var propertyId in component.properties) {
                        property = component.properties[propertyId];
                        if(property.Severity !== "OK")
                            property.Severity = 'ACCEPTED';
                    }
                    _this.updateReviewComponentGridData(selectedRow[0], groupId, component.status);
                }
            });   
        }
        catch(error) {}    
    }

    ComplianceReviewManager.prototype.UpdateStatusForProperty = function (selectedRow) {
        var _this = this;

        if (selectedRow[0].cells[ComplianceColumns.Status].innerHTML !== "OK" ||
            selectedRow[0].cells[ComplianceColumns.Status].innerHTML !== "ACCEPTED") {
            return;
        }

        selectedRow[0].cells[2].innerHTML = "ACCEPTED";
        var cell = 0;
        for (cell = 0; cell < selectedRow[0].cells.length; cell++) {
            selectedRow[0].cells[cell].style.backgroundColor = "rgb(203, 242, 135)";
        }
        var tableToUpdate;
        if (selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComplianceADetailedReviewTbody") {
            tableToUpdate = "ComplianceADetailedReview";
        }
        else if (selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComplianceBDetailedReviewTbody") {
            tableToUpdate = "ComplianceBDetailedReview";
        }
        else {
            return;
        }
        
        var componentId = this.SelectedComponentRow.cells[ComplianceColumns.ResultId].innerHTML;
        var groupId = this.SelectedComponentRow.cells[ComplianceColumns.GroupId].innerHTML;

        try {
            $.ajax({
                url: 'PHP/updateResultsStatusToAccept.php',
                type: "POST",
                async: true,
                data: {'componentid' : componentId, 
                        'tabletoupdate': tableToUpdate, 
                        'sourcePropertyName': selectedRow[0].cells[0].innerText, 
                        'ProjectName' : projectinfo.projectname, 
                        'CheckName': checkinfo.checkname},
                success: function (msg) {
                    var originalstatus = _this.SelectedComponentRow.cells[1].innerHTML;
                    if (!originalstatus.includes("(A)")) {
                        var changedStatus = originalstatus + "(A)";
                        _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
                        // _this.SelectedComponentRow.cells[2] = changedStatus;
                    }
                    if (msg.trim() == "OK(A)") {
                        var changedStatus = msg.trim();
                        _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
                        _this.SelectionManager.GetRowHighlightColor(changedStatus);
                    }
                    var propertiesLen = _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"].length;
                    for (var i = 0; i < propertiesLen; i++) {
                        var sourceAName = _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceAName"];
                        if (sourceAName == null) { sourceAName = "" };

                        if (sourceAName == selectedRow[0].cells[0].innerText) {
                            _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["Severity"] = "ACCEPTED";
                            break;
                        }

                    }
                    _this.updateReviewComponentGridData(_this.SelectedComponentRow, groupId, changedStatus);
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    // ComplianceReviewManager.prototype.updateStatusOfComplianceElement = function (selectedRow) {
    //     _this = this;
    //     if ((selectedRow[0].offsetParent.offsetParent.offsetParent.id == "SourceAComplianceMainReviewTbody" || 
    //          selectedRow[0].offsetParent.offsetParent.offsetParent.id == "SourceBComplianceMainReviewTbody")
    //         && selectedRow[0].cells[1].innerHTML !== "OK") {
    //         // var tableToUpdate;
    //         // var componentId = Number(selectedRow[0].cells[3].innerText)
    //         // var groupId = Number(selectedRow[0].cells[4].innerText)
    //         // if (selectedRow[0].offsetParent.offsetParent.offsetParent.id == "SourceAComplianceMainReviewTbody") {
    //         //     tableToUpdate = "complianceSourceA";
    //         // }
    //         // else if (selectedRow[0].offsetParent.offsetParent.offsetParent.id == "SourceBComplianceMainReviewTbody") {
    //         //     tableToUpdate = "complianceSourceB";
    //         // }
    //         // else { return; }
    //         // try {
    //         //     $.ajax({
    //         //         url: 'PHP/updateResultsStatusToAccept.php',
    //         //         type: "POST",
    //         //         async: true,
    //         //         data: { 'componentid': componentId, 'tabletoupdate': tableToUpdate, 'ProjectName' : projectInfoObject.projectname },
    //         //         success: function (msg) {
    //         //             _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId].Status = "OK(A)";
    //         //             var component = _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
    //         //             component.status = "OK(A)";
    //         //             for (var propertyId in component.properties) {
    //         //                 property = component.properties[propertyId];
    //         //                 if(property.Severity !== "OK")
    //         //                     property.Severity = 'ACCEPTED';
    //         //             }
    //         //             _this.updateReviewComponentGridData(selectedRow[0], groupId, component.status);
    //         //         }
    //         //     });   
    //         // }
    //         // catch(error) {}        
    //     }
    //     if(selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComplianceADetailedReviewTbody" || 
    //        selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComplianceBDetailedReviewTbody") {
    //         if(selectedRow[0].cells[2].innerHTML !== "OK" && selectedRow[0].cells[2].innerHTML !== "ACCEPTED") {
    //             // selectedRow[0].cells[2].innerHTML = "ACCEPTED";
    //             // var cell = 0;
    //             // for(cell = 0; cell < selectedRow[0].cells.length; cell++) {
    //             //     selectedRow[0].cells[cell].style.backgroundColor = "rgb(203, 242, 135)";
    //             // }
    //             // var tableToUpdate;
    //             // if(selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComplianceADetailedReviewTbody") {
    //             //     tableToUpdate = "ComplianceADetailedReview";
    //             // }
    //             // else if(selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComplianceBDetailedReviewTbody") {
    //             //     tableToUpdate = "ComplianceBDetailedReview";
    //             // }
    //             // else { return; }
    //             // var componentId = this.SelectedComponentRow.cells[3].innerHTML;
    //             // var groupId = this.SelectedComponentRow.cells[4].innerHTML;
    //             // try{
    //             //     $.ajax({
    //             //         url: 'PHP/updateResultsStatusToAccept.php',
    //             //         type: "POST",
    //             //         async: true,
    //             //         data: {'componentid' : componentId, 'tabletoupdate': tableToUpdate, 'sourcePropertyName': selectedRow[0].cells[0].innerText, 'ProjectName' : projectInfoObject.projectname},
    //             //         success: function (msg) {
    //             //             var originalstatus = _this.SelectedComponentRow.cells[1].innerHTML;
    //             //             if(!originalstatus.includes("(A)")) {
    //             //                 var changedStatus = originalstatus + "(A)";
    //             //                 _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
    //             //                 // _this.SelectedComponentRow.cells[2] = changedStatus;
    //             //             }
    //             //             if(msg.trim() == "OK(A)") {
    //             //                 var changedStatus = msg.trim();
    //             //                 _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
    //             //                 _this.SelectionManager.GetRowHighlightColor(changedStatus);
    //             //             }
    //             //             var propertiesLen = _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"].length;
    //             //             for(var i = 0; i < propertiesLen; i++) {
    //             //                 var sourceAName = _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceAName"];
    //             //                 if(sourceAName == null) { sourceAName = ""}; 

    //             //                 if(sourceAName == selectedRow[0].cells[0].innerText) {
    //             //                     _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["Severity"] = "ACCEPTED";
    //             //                     break;
    //             //                 }
                               
    //             //             }
    //             //             _this.updateReviewComponentGridData(_this.SelectedComponentRow, groupId, changedStatus);
    //             //         }
    //             //     });   
    //             // }
    //             // catch(error) {
    //             //     console.log(error);}  
    //         }
    //     }
    // }

    ComplianceReviewManager.prototype.updateReviewComponentGridData = function(selectedRow, groupId, changedStatus) {
        var row = selectedRow;
        var gridId = '#' + this.ComplianceCheckManager["CheckGroups"][groupId].ComponentClass + "_" + this.MainReviewTableContainer;
        _this = this;

        var editedItem = {"SourceA" : selectedRow.cells[0].innerText, 
        "Status" : changedStatus, 
        "NodeId" : selectedRow.cells[2].innerText, 
        "ID" : selectedRow.cells[3].innerText, 
        "groupId" : selectedRow.cells[4].innerText};

        $(gridId).jsGrid("updateItem", selectedRow, editedItem).done(function() {
            _this.populateDetailedReviewTable(selectedRow);
            $(gridId).jsGrid("refresh");
        });
    } 

    ComplianceReviewManager.prototype.changeReviewTableStatus = function(changedStatus) {
        var children;
        if(this.MainReviewTableContainer == "SourceAComplianceMainReviewCell") {
            var SourceAComplianceMainReviewCell = document.getElementById("SourceAComplianceMainReviewTbody");
            children = SourceAComplianceMainReviewCell.children[0].children;
        }
        else if(this.MainReviewTableContainer == "SourceBComplianceMainReviewCell") {
            var SourceBComplianceMainReviewCell = document.getElementById("SourceBComplianceMainReviewTbody");
            children = SourceBComplianceMainReviewCell.children[0].children;
        }

        outer_loop:
        for(var child in children) {
            if(children[child].className == "collapsible active") {
                 var elementCategorydiv = document.getElementById(children[child].innerHTML);
                 var tableData = $('#' + children[child].innerHTML + '_' + this.MainReviewTableContainer).find('.jsgrid-grid-body');
                 for(var i = 0; i < tableData[0].children[0].children[0].children.length; i++) {
                    if(this.SelectedComponentRow == tableData[0].children[0].children[0].children[i]) {
                        tableData[0].children[0].children[0].children[i].cells[1].innerHTML = changedStatus;
                        break outer_loop;
                    }
                 }
            }
        }
    }

    ComplianceReviewManager.prototype.UpdateStatusOfCategory = function(button) {
        _this = this;
        var groupId = button.attributes[0].value;

        var categorydiv = document.getElementById(button.innerHTML + "_" + this.MainReviewTableContainer);
        var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;
        var tableToUpdate;
        if(this.MainReviewTableContainer == "SourceAComplianceMainReviewCell") {
            tableToUpdate = "categoryComplianceA";
        }
        else if(this.MainReviewTableContainer == "SourceBComplianceMainReviewCell") {
            tableToUpdate = "categoryComplianceB";
        }
        try{
            $.ajax({
                url: 'PHP/updateResultsStatusToAccept.php',
                type: "POST",
                async: true,
                data: {'groupid' : groupId, 'tabletoupdate': tableToUpdate, 'ProjectName' : projectinfo.projectname, 'CheckName': checkinfo.checkname},
                success: function (msg) {
                var index = 0;
                    var compgroup = _this.ComplianceCheckManager["CheckGroups"][groupId];
                    compgroup.categoryStatus = "ACCEPTED";
                    for(var compId in compgroup["CheckComponents"]) {
                        var component = compgroup["CheckComponents"][compId];
                        component.status = component.Status;
                        if(component.Status !== 'OK') {
                            component.status = "OK(A)";
                            for (var propertyId in component.properties) {
                                property = component.properties[propertyId];
                                if(property.Severity !== 'OK') {
                                    property.Severity = 'ACCEPTED';
                                }
                            }
                        }
                        var row = categorydiv.children[1].children[0].children[0].children[index];
                        var gridId = '#' + _this.ComplianceCheckManager["CheckGroups"][groupId].ComponentClass + "_" + _this.MainReviewTableContainer;

                        var editedItem = {"SourceA" : row.cells[0].innerText, 
                                        "Status" : component.status, 
                                        "NodeId" : row.cells[2].innerText, 
                                        "ID" : row.cells[3].innerText, 
                                        "groupId" : row.cells[4].innerText};

                        $(gridId).jsGrid("updateItem", row, editedItem).done(function() {
                            if(index == noOfComponents-1) {
                                selectedRow = categorydiv.children[1].children[0].children[0].children[0];
                                _this.populateDetailedReviewTable(selectedRow);    
                                $(gridId).jsGrid("refresh");
                            }
                        });
                        index++;
                    }
                }
            });   
        }
        catch(error) {
            console.log(error);}  
    }

    ComplianceReviewManager.prototype.toggleAcceptAllComparedComponents = function(tabletoupdate) {
        var tabletoupdate = tabletoupdate;
        try{
            $.ajax({
                url: 'PHP/updateResultsStatusToAccept.php',
                type: "POST",
                async: true,
                data: {'tabletoupdate': tabletoupdate, 'ProjectName' : projectinfo.projectname, 'CheckName': checkinfo.checkname},
                success: function (msg) {
                    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
                    $.ajax({
                        url: 'PHP/CheckResultsReader.php',
                        type: "POST",
                        async: true,
                        data: {
                            'ProjectName': projectinfo.projectname,
                            'CheckName': checkinfo.checkname
                        },
                        success: function (msg) {
                                $("#SourceAComplianceMainReviewCell").empty();
                                $("#SourceAComplianceDetailedReviewCell").empty();
                                $("#SourceBComplianceMainReviewCell").empty();
                                $("#SourceBComplianceDetailedReviewCell").empty();
                                $("#ComparisonMainReviewCell").empty();
                                $("#ComparisonDetailedReviewCell").empty();

                            var checkResults = JSON.parse(msg);
        
                            var comparisonCheckGroups = undefined;
                            var sourceAComplianceCheckGroups = undefined;
                            var sourceBComplianceCheckGroups = undefined;
        
                            for (var key in checkResults) {
                                if (!checkResults.hasOwnProperty(key)) {
                                    continue;
                                }
        
        
                                if (key == 'Comparison') {
                                    comparisonCheckGroups = new CheckGroups();
                                    comparisonCheckGroups.restore(checkResults[key], false);
                                }
                                else if (key == 'SourceACompliance') {
                                    sourceAComplianceCheckGroups = new CheckGroups();
                                    sourceAComplianceCheckGroups.restore(checkResults[key], true);
                                }
                                else if (key == 'SourceBCompliance') {
                                    sourceBComplianceCheckGroups = new CheckGroups();
                                    sourceBComplianceCheckGroups.restore(checkResults[key], true);
                                }
                            }
        
                            // populate check results
                            populateCheckResults(comparisonCheckGroups,
                                sourceAComplianceCheckGroups,
                                sourceBComplianceCheckGroups);
        
                            // load analytics data
                            document.getElementById("analyticsContainer").innerHTML = '<object type="text/html" data="analyticsModule.html" style="height: 100%; width: 100%" ></object>';
                        }
                    });        
                }
            });
        }
        catch(error) {
            console.log(error);
        }   
    }

    ComplianceReviewManager.prototype.UnAcceptComponent = function (selectedRow) {
        var _this = this;

        var componentId = selectedRow[0].cells[ComplianceColumns.ResultId].innerHTML;
        var groupId = selectedRow[0].cells[ComplianceColumns.GroupId].innerHTML;

        var tableToUpdate;
        if (selectedRow[0].offsetParent.offsetParent.offsetParent.id == "SourceAComplianceMainReviewTbody") {
            tableToUpdate = "rejectComponentFromComplianceATab";
        }
        else if (selectedRow[0].offsetParent.offsetParent.offsetParent.id == "SourceBComplianceMainReviewTbody") {
            tableToUpdate = "rejectComponentFromComplianceBTab";
        }
        else { return; }
        try {
            $.ajax({
                url: 'PHP/updateResultsStatusToAccept.php',
                type: "POST",
                dataType: 'JSON',
                async: true,
                data: {'componentid' : componentId, 'tabletoupdate': tableToUpdate, 'ProjectName' : projectinfo.projectname, 'CheckName': checkinfo.checkname },
                success: function (msg) {
                    var status = new Array();
                    status = msg;
                    var properties = status[1];
                    var component = _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                    component.status = status[0];
                    var index = 0;
                    for (var propertyId in properties) {
                        component.properties[index].Severity = properties[propertyId]["severity"];
                        index++;
                    }
                    _this.updateReviewComponentGridData(selectedRow[0], groupId, component.status);
                }
            });
        }
        catch (error) { }
    }

    ComplianceReviewManager.prototype.UnAcceptProperty = function (selectedRow) {
        var _this = this;

        var componentId = selectedRow[0].cells[ComplianceColumns.ResultId].innerHTML;
        var groupId = selectedRow[0].cells[ComplianceColumns.GroupId].innerHTML;

        var tableToUpdate;
        if (selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComplianceADetailedReviewTbody") {
            tableToUpdate = "rejectPropertyFromComplianceATab";
        }
        else if (selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComplianceBDetailedReviewTbody") {
            tableToUpdate = "rejectPropertyFromComplianceBTab";
        }
        else { return; }
        try {
            $.ajax({
                url: 'PHP/updateResultsStatusToAccept.php',
                type: "POST",
                async: true,
                dataType: 'JSON',
                data: {'componentid' : componentId, 'tabletoupdate': tableToUpdate, 'sourcePropertyName': selectedRow[0].cells[0].innerText, 'ProjectName' : projectinfo.projectname, 'CheckName': checkinfo.checkname},
                success: function (msg) {
                    var status = new Array();
                    status = msg;
                    var changedStatus = status[0];
                    _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;

                    var propertiesLen = _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"].length;
                    for (var i = 0; i < propertiesLen; i++) {
                        var sourceAName = _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceAName"];
                        if (sourceAName == null) { sourceAName = "" };

                        if (sourceAName == selectedRow[0].cells[0].innerText) {
                            _this.ComplianceCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["Severity"] = status[1];
                        }

                    }
                    _this.updateReviewComponentGridData(_this.SelectedComponentRow, groupId, changedStatus);

                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    ComplianceReviewManager.prototype.UnAcceptCategory = function(button) {
        var _this = this;
        var groupId = Number(button.attributes[0].value);

        var categorydiv = document.getElementById(button.innerHTML + "_" + this.MainReviewTableContainer);
        var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;
        var tableToUpdate;
        if(this.MainReviewTableContainer == "SourceAComplianceMainReviewCell") {
            tableToUpdate = "rejectCategoryFromComplianceATab";
        }
        else if(this.MainReviewTableContainer == "SourceBComplianceMainReviewCell") {
            tableToUpdate = "rejectCategoryFromComplianceBTab";
        }

        try{
            $.ajax({
                url: 'PHP/updateResultsStatusToAccept.php',
                type: "POST",
                async: true,
                dataType: 'JSON',
                data: {'groupid' : groupId, 'tabletoupdate': tableToUpdate, 'ProjectName' : projectinfo.projectname, 'CheckName': checkinfo.checkname},
                success: function (msg) {
                    var status = new Array();
                    status = msg;
                    var componentStatus = status[0];
                    var propsStatus = status[1];
                    var index = 0
                        var j = 0;
                        var compgroup = _this.ComplianceCheckManager["CheckGroups"][groupId];
                        compgroup.categoryStatus = "UNACCEPTED";
                        for(var compId in compgroup["CheckComponents"]) {
                            var component = compgroup["CheckComponents"][compId];
                            component.status = componentStatus[index]['status'];
                            var propindex = 0;
                            for (var propertyId in component.properties) {
                                property = component.properties[propertyId];
                                property.Severity = propsStatus[j][propindex]['severity'];
                                propindex++;
                            }
                            j++;
                            var row = categorydiv.children[1].children[0].children[0].children[index];
                            var gridId = '#' + _this.ComplianceCheckManager["CheckGroups"][groupId].ComponentClass + "_" + _this.MainReviewTableContainer;
    
                            var editedItem = {"SourceA" : row.cells[0].innerText, 
                                            "Status" : component.status, 
                                            "NodeId" : row.cells[2].innerText, 
                                            "ID" : row.cells[3].innerText, 
                                            "groupId" : row.cells[4].innerText};
    
                            $(gridId).jsGrid("updateItem", row, editedItem).done(function() {
                                if(index == noOfComponents-1) {
                                    selectedRow = categorydiv.children[1].children[0].children[0].children[0];
                                    _this.populateDetailedReviewTable(selectedRow);    
                                    $(gridId).jsGrid("refresh");
                                }
                            });
                            index++;  
                        }  
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) { 
                    console.log("A");
                }
            });   
        }
        catch(error) {
            console.log(error);}  
    }

    ComplianceReviewManager.prototype.HighlightComponentInGraphicsViewer = function (currentReviewTableRow) {
        if (this.SelectedComponentRow === currentReviewTableRow) {
            return;
        }

        if (this.SelectedComponentRow) {
            this.SelectionManager.RestoreBackgroundColor(this.SelectedComponentRow);
        }

        this.SelectionManager.ChangeBackgroundColor(currentReviewTableRow);
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
        //var currentSheetName = sheetName;//thisRow.cells[0].innerText.trim();
        
        var viewerContainerData = document.getElementById(viewerContainer);
        var classWiseComponents = this.SourceComponents[sheetName];

        if (viewerContainerData === null) 
        {
            return;
        }
        // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
        if (viewerContainerData.childElementCount > 1 &&
            this.SourceViewerCurrentSheetLoaded  === sheetName) 
        {
            if (_this.SelectedComponentRowFromSheetA) 
            {
                _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetA);
            }
            
            if (_this.SelectedComponentRowFromSheetB) 
            {
                _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetB);
            }
           
            if (_this.SelectedComponentRow) 
            {
                _this.SelectionManager.RestoreBackgroundColor(_this.SelectedComponentRow);
            }
            
            this.HighlightRowInSheetData(thisRow, viewerContainer);
            return;
        }

        if (classWiseComponents !== {}) 
        {
            var componentProperties;
            for (var componentId in classWiseComponents) 
            {
                componentProperties = classWiseComponents[componentId];
                break;
                // for (var i = 0; i < mainComponentClasseData[subComponentClass].length; i++) 
                // {
                //     properties.push(mainComponentClasseData[subComponentClass][i]);
                // }
            }
            if (componentProperties === undefined) {
                return;
            }

           
           // var sheetProperties = properties[0].properties;

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
            columnHeaders = [];
            //if (sheetProperties !== undefined) {
                for (var i = 0; i < componentProperties.length; i++) 
                {
                    var compProperty = componentProperties[i];
                    
                    columnHeader = {};
                    columnHeader["name"] = compProperty['name'];
                    var type;
                    if (compProperty['format'].toLowerCase() === "string") {
                        type = "textarea";
                    }
                    else if (compProperty['format'].toLowerCase() === "number") {
                        type = "number";
                    }

                    columnHeader["type"] = type;
                    columnHeader["width"] = "80";
                    columnHeaders.push(columnHeader);

                    //tagnumber is for instruments XLS data sheet
                    if (Object.keys(column).length <= 3) {
                        if (compProperty['name'] === "ComponentClass" ||
                            compProperty['name'] === "Name" ||
                            compProperty['name'] === "Description" ||
                            compProperty['name'] === "Tagnumber") 
                        {
                            column[compProperty['name']] = i;
                        }
                    }
                }
            //}

            tableData = [];
            for (var componentId in classWiseComponents) 
            {
                var component = classWiseComponents[componentId];

                tableRowContent = {};
                for (var i = 0; i < component.length; i++) 
                {
                    var compProperty = component[i];

                    // get property value
                    tableRowContent[compProperty['name']] = compProperty['value'];
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
                    _this.SelectionManager.RestoreBackgroundColor(_this.SelectedComponentRow);
                }

                _this.checkStatusArray = {};
                _this.LoadSheetTableData(_this, columnHeaders, tableData, "#viewerContainer1", thisRow, column, sheetName);
                _this.HighlightRowInSheetData(thisRow, "viewerContainer1");

                   // keep track of currently loaded sheet data
                   this.SourceViewerCurrentSheetLoaded = sheetName;
            }
            else if (viewerContainer === "viewerContainer2") {
                _this = this;
                if (_this.SelectedComponentRowFromSheetB) {
                    _this.unhighlightSelectedSheetRow(_this.checkStatusArray, _this.SelectedComponentRowFromSheetB);
                }
                if (_this.SelectedComponentRow) {
                    _this.SelectionManager.RestoreBackgroundColor(_this.SelectedComponentRow);
                }
                _this.checkStatusArray = {};
                _this.LoadSheetTableData(_this, columnHeaders, tableData, "#viewerContainer2", thisRow, column, sheetName);
                _this.HighlightRowInSheetData(thisRow, "viewerContainer2");

                // keep track of currently loaded sheet data
                this.SourceViewerCurrentSheetLoaded = sheetName;
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
                        this.SelectionManager.RestoreBackgroundColor(_this.SelectedComponentRow);
                    }

                    this.SelectionManager.ChangeBackgroundColor(modelBrowserRow);
                    this.SelectedComponentRow = modelBrowserRow;

                    if (containerId === "viewerContainer1") {
                        if (this.SelectedComponentRowFromSheetA) {
                            this.unhighlightSelectedSheetRow(this.checkStatusArray, this.SelectedComponentRowFromSheetA);                            
                        }

                        this.SelectedComponentRowFromSheetA = sheetDataRow;

                        this.SelectionManager.ChangeBackgroundColor(this.SelectedComponentRowFromSheetA);                       
                    }
                    if (containerId === "viewerContainer2") {
                        if (this.SelectedComponentRowFromSheetB) {
                            this.unhighlightSelectedSheetRow(this.checkStatusArray, this.SelectedComponentRowFromSheetB);                            
                        }

                        this.SelectedComponentRowFromSheetB = sheetDataRow;

                        this.SelectionManager.ChangeBackgroundColor(this.SelectedComponentRowFromSheetB);                        
                    }

                    this.populateDetailedReviewTable(modelBrowserRow);

                    if (_this.SelectedComponentRow &&
                        _this.SelectedComponentRow.offsetParent &&
                        _this.SelectedComponentRow.offsetParent.offsetParent) {
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
                if (this.getSourceNameFromMainReviewRow(modelBrowserRow) !== "" &&
                    this.getSourceNameFromMainReviewRow(modelBrowserRow) === componentName) {
                    var color = modelBrowserRow.cells[0].style.backgroundColor;
                    for (var j = 0; j < currentSheetRow.cells.length; j++) {
                        cell = currentSheetRow.cells[j];
                        cell.style.backgroundColor = color;
                        cell.style.height = "10px"
                    }
                    currentCheckStatusArray[currentSheetRow.rowIndex] = this.getStatusFromMainReviewRow(modelBrowserRow);
                    break;
                }
                // else if (modelBrowserRow.cells[1].innerText !== "" && modelBrowserRow.cells[1].innerText === componentName) {
                //     var color = modelBrowserRow.cells[0].style.backgroundColor;
                //     for (var j = 0; j < currentSheetRow.cells.length; j++) {
                //         cell = currentSheetRow.cells[j];
                //         cell.style.backgroundColor = color;
                //     }
                //     currentCheckStatusArray[currentSheetRow.rowIndex] = modelBrowserRow.cells[1].innerHTML;
                //     break;
                // }
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

                        this.SelectionManager.ChangeBackgroundColor(this.SelectedComponentRowFromSheetA);
                        // for (var j = 0; j < this.SelectedComponentRowFromSheetA.cells.length; j++) {
                        //     cell = this.SelectedComponentRowFromSheetA.cells[j];
                        //     cell.style.backgroundColor = "#B2BABB"
                        // }
                    }
                    if (containerId === "viewerContainer2") {

                        this.SelectedComponentRowFromSheetB = rowData;
                        this.SelectionManager.ChangeBackgroundColor(this.SelectedComponentRowFromSheetB);
                        // for (var j = 0; j < this.SelectedComponentRowFromSheetB.cells.length; j++) {
                        //     cell = this.SelectedComponentRowFromSheetB.cells[j];
                        //     cell.style.backgroundColor = "#B2BABB"
                        // }
                    }


                    if (this.SelectedComponentRow === thisRow) {
                        return;
                    }
                    if (this.SelectedComponentRow) {
                        this.SelectionManager.RestoreBackgroundColor(this.SelectedComponentRow);
                    }
                    this.SelectedComponentRow = thisRow;
                    this.SelectionManager.ChangeBackgroundColor(this.SelectedComponentRow);

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


        var tableData = [];
        var columnHeaders = [];

        var componentId =  Number(row.cells[3].innerText);
        var groupId = Number(row.cells[4].innerText);
        for (var componentsGroupID in this.ComplianceCheckManager) {

            // get the componentgroupd corresponding to selected component 
            var componentsGroupList = this.ComplianceCheckManager[componentsGroupID];
            if(componentsGroupList && componentsGroupID != "restore") {
          
            var component = componentsGroupList[groupId].CheckComponents[componentId];


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

                // // show component class name as property in detailed review table               
            
                for (var propertyId in component.properties) {
                    property = component.properties[propertyId];
            
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
            //}
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
            var color = this.SelectionManager.GetRowHighlightColor(status);
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
                    .append($("<th>").attr("colspan", 2).text('Source'/*AnalyticsData.SourceAName*/)))


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

    ComplianceReviewManager.prototype.getReviewTableId = function (row) {
        var tBodyElement = row.parentElement;
        if (!tBodyElement) {
            return;
        }
        var tableElement = tBodyElement.parentElement;

        return tableElement.parentElement.parentElement.id;
    }

    ComplianceReviewManager.prototype.getSourceNameFromMainReviewRow = function(row) {
         return row.cells[ComplianceColumns.SourceName].innerText;
    }

    ComplianceReviewManager.prototype.getStatusFromMainReviewRow =  function(row) {
        return row.cells[ComplianceColumns.Status].innerText;
    }
}