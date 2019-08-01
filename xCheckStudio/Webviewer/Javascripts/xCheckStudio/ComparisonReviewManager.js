function ComparisonReviewManager(comparisonCheckManager,
    sourceAViewerData,
    sourceBViewerData,
    sourceAComponents,
    sourceBComponents,
    mainReviewTableContainer,
    detailedReviewTableContainer,
    sourceAComponentsHierarchy,
    sourceBComponentsHierarchy) 
    {
        
    this.MainReviewTableColumns = 6;   
    this.MainReviewTableIdColumn = 5; 

    this.SourceAViewerData = sourceAViewerData;
    this.SourceBViewerData = sourceBViewerData;

    this.SourceAComponents = sourceAComponents; 
    this.SourceBComponents = sourceBComponents; 

    this.SourceAReviewModuleViewerInterface;
    this.SourceBReviewModuleViewerInterface;

    this.MainReviewTableContainer = mainReviewTableContainer;
    this.DetailedReviewTableContainer = detailedReviewTableContainer;
  
   this.SourceANodeIdVsStatus = sourceAComponentsHierarchy;
   this.SourceBNodeIdVsStatus = sourceBComponentsHierarchy;

    this.ComparisonCheckManager = comparisonCheckManager;    

    this.SelectedComponentRowFromSheetA;
    this.SelectedComponentRowFromSheetB;
    this.SelectedComponentRow;

    this.complianceA;
    this.complianceB;
    this.checkStatusArrayA = {};
    this.checkStatusArrayB = {};

    this.detailedReviewRowComments = {};

    this.SourceANodeIdvsCheckComponent = {};
    this.SourceBNodeIdvsCheckComponent= {};

    this.SourceAComponentIdvsNodeId = {};
    this.SourceABComponentIdvsNodeId = {};

    this.SourceAViewerCurrentSheetLoaded = undefined;
    this.SourceBViewerCurrentSheetLoaded = undefined;

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var projectInfoObject = JSON.parse(projectinfo);

    ComparisonReviewManager.prototype.populateReviewTable = function () 
    {

         var parentTable = document.getElementById(this.MainReviewTableContainer);


        for (var key in this.ComparisonCheckManager) {
            if (!this.ComparisonCheckManager.hasOwnProperty(key)) {
                continue;
            }

            var checkGroups = this.ComparisonCheckManager[key];
            for (var groupId in checkGroups) {
                if (!checkGroups.hasOwnProperty(groupId)) {
                    continue;
                }

                var componentsGroup = checkGroups[groupId];

                //var componentsGroup = this.ComparisonCheckManager.CheckComponentsGroups[componentsGroupName];
                if (componentsGroup.CheckComponents.length === 0) {
                    continue;
                }

                var btn = document.createElement("BUTTON");
                var att = document.createAttribute("groupId");
                att.value = groupId;
                btn.setAttributeNode(att);       // Create a <button> element
                btn.className = "collapsible";
                var t = document.createTextNode(componentsGroup.ComponentClass);       // Create a text node
                btn.appendChild(t);
                parentTable.appendChild(btn);

                var div = document.createElement("DIV");
                div.className = "content scrollable";
                div.id = componentsGroup.ComponentClass.replace(/\s/g, '');
                parentTable.appendChild(div);

                // var div2 = document.createElement("DIV");
                // div2.id = componentsGroup.ComponentClass + "_child";
                // div2.style.fontSize = "10px";
                // div.appendChild(div2);

                // create column headers
                var columnHeaders = [];
                for (var i = 0; i < 7; i++) {
                    columnHeader = {};
                    var title;
                    if (i === 0) {
                        title = 'SourceA';//"Source A";
                        name = "SourceA";
                        width = "35";
                    }
                    else if (i === 1) {
                        title = "SourceB";//"Source B";
                        name = "SourceB";
                        width = "34";
                    }
                    else if (i === 2) {
                        title = "Status";
                        name = "Status"
                        width = "34";
                    }
                    else if (i === 3) 
                    {
                        title = "SourceANodeId";
                        name = "SourceANodeId"
                        width = "10";
                    }
                    else if (i === 4) 
                    {
                        title = "SourceBNodeId";
                        name = "SourceBNodeId"
                        width = "10";
                    }
                    else if (i === 5) 
                    {
                        title = "ID";
                        name = "ID"
                        width = "10";
                    }
                    else if (i === 6) 
                    {
                        title = "groupId";
                        name = "groupId"
                        width = "10";
                    }

                    columnHeader["title"] = title;
                    columnHeader["name"] = name;
                    columnHeader["type"] = "text";
                    columnHeader["width"] = width;
                    columnHeaders.push(columnHeader);
                }

                // create table data
                var tableData = [];
                for (var componentId in componentsGroup.CheckComponents)
                {
                    if (!componentsGroup.CheckComponents.hasOwnProperty(componentId)) {
                        continue;
                    }

                    component = componentsGroup.CheckComponents[componentId];            
                                      
                    tableRowContent = {};
                    tableRowContent[columnHeaders[0].name] = component.SourceAName;
                    tableRowContent[columnHeaders[1].name] = component.SourceBName;
                    tableRowContent[columnHeaders[2].name] = component.Status;
                    tableRowContent[columnHeaders[3].name] = component.SourceANodeId;
                    tableRowContent[columnHeaders[4].name] = component.SourceBNodeId;
                    tableRowContent[columnHeaders[5].name] = component.ID;
                    tableRowContent[columnHeaders[6].name] = groupId;

                    tableData.push(tableRowContent);

                    // maintain track of check components
                    if (component.SourceANodeId ) 
                    {
                        this.SourceANodeIdvsCheckComponent[component.SourceANodeId] = { "Id" :component.ID, 
                                                                                     "SourceAName": component.SourceAName,
                                                                                     "SourceBName": component.SourceBName,
                                                                                     "MainClass": componentsGroup.ComponentClass,
                                                                                     "SourceANodeId": component.SourceANodeId,
                                                                                     "SourceBNodeId": component.SourceBNodeId,};
                        this.SourceAComponentIdvsNodeId[component.ID] = component.SourceANodeId;
                    }
                    if(component.SourceBNodeId)
                    {
                        this.SourceBNodeIdvsCheckComponent[component.SourceBNodeId] = { "Id" :component.ID, 
                                                                                    "SourceAName": component.SourceAName,
                                                                                    "SourceBName": component.SourceBName,
                                                                                    "MainClass": componentsGroup.ComponentClass,
                                                                                    "SourceANodeId": component.SourceANodeId,
                                                                                    "SourceBNodeId": component.SourceBNodeId,};                       
                        this.SourceABComponentIdvsNodeId[component.ID] = component.SourceBNodeId;
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
                modelBrowserHeaderTable.style.width = "565px";
                modelBrowserHeaderTable.style.overflowX = "hide";
                var modelBrowserHeaderTableRows = modelBrowserHeaderTable.getElementsByTagName("tr");
                for (var j = 0; j < modelBrowserHeaderTableRows.length; j++) {
                    var currentRow = modelBrowserHeaderTableRows[j];
                    for (var i = 0; i < currentRow.cells.length; i++) {
                        if (i > 2) {
                            currentRow.cells[i].style.display = "none";
                        }
                    }
                }


                // keep track of component id vs table row and status                
                var modelBrowserDataTable = modelBrowserData.children[jsGridTbodyTableIndex];
                var modelBrowserDataRows = modelBrowserDataTable.getElementsByTagName("tr");
                for (var j = 0; j < modelBrowserDataRows.length; j++) {
                    var currentRow = modelBrowserDataRows[j];

                    // var status = currentRow.cells[2].innerText;
                    // if (currentRow.cells.length === 7) {
                    //     if (currentRow.cells[3].innerText !== undefined &&
                    //         currentRow.cells[3].innerText !== "") {

                    //         //var sourceANodeId = currentRow.cells[3].innerText;                            
                    //     }
                    //     if (currentRow.cells[4].innerText !== undefined &&
                    //         currentRow.cells[4].innerText !== "") {

                    //         var sourceBNodeId = currentRow.cells[4].innerText;                            
                    //     }
                    // }

                    // hide additional columns
                    for (var i = 0; i < currentRow.cells.length; i++) {
                        if (i > 2) {
                            currentRow.cells[i].style.display = "none";
                        }
                    }
                }

                modelBrowserDataTable.style.position = "static"
                modelBrowserDataTable.style.width = "578px";
                modelBrowserDataTable.style.margin = "45px 0px 0px 0px"

                var jsgriddiv = $('#' + componentsGroup.ComponentClass.replace(/\s/g, '')).find('.jsgrid-grid-body');
                var div2 = document.createElement("DIV");
                div2.id = componentsGroup.ComponentClass + "_child";
                div2.innerText = "Count :" + modelBrowserTableRows.length;
                div2.style.fontSize = "10px";
                jsgriddiv[0].appendChild(div2);
            }
        }
    }

    ComparisonReviewManager.prototype.loadDatasources = function () {
        var modal = document.getElementById('maximizeViewerContainer');              

        var viewer1 = document.getElementById("viewerContainer1");
        viewer1.style.height = "270px";
        viewer1.style.top= "0px";
       
        var viewer2 = document.getElementById("viewerContainer2");
        viewer2.style.height = "270px";
        viewer2.style.top= "0px";

        if(modal.style.display === "block")
        {
            viewer1.style.height = "405px";
            viewer2.style.height = "405px";
        }

        if (this.SourceAViewerData !== undefined) {
            this.SourceAReviewModuleViewerInterface = new ReviewModuleViewerInterface(this.SourceAViewerData,
                this.SourceAComponentIdVsComponentData,
                this.SourceANodeIdVsComponentData,
                this);
            this.SourceAReviewModuleViewerInterface.NodeIdStatusData =  this.SourceANodeIdVsStatus;
            this.SourceAReviewModuleViewerInterface.setupViewer(550, 280);            
        }        

        if (this.SourceBViewerData !== undefined) {
            this.SourceBReviewModuleViewerInterface = new ReviewModuleViewerInterface(this.SourceBViewerData,
                this.SourceBComponentIdVsComponentData,
                this.SourceBNodeIdVsComponentData,
                this);
            this.SourceBReviewModuleViewerInterface.NodeIdStatusData =  this.SourceBNodeIdVsStatus;
            this.SourceBReviewModuleViewerInterface.setupViewer(550, 280);
        }
    }

    ComparisonReviewManager.prototype.checkComponentGroupCategory = function (componentGroupClassName, categoryToCheck) {
        var componentClassArray = componentGroupClassName.split("-");
        for (var i = 0; i < componentClassArray.length; i++) {
            if (componentClassArray[i].toLowerCase() === categoryToCheck.toLowerCase()) {
                return true;
            }
        }

        return false;
    }    

    ComparisonReviewManager.prototype.AddTableContentCount = function (containerId) {
        var modelBrowserData = document.getElementById(containerId);

        // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
        var modelBrowserDataTable = modelBrowserData.children[jsGridTbodyTableIndex];
        var modelBrowserTableRows = modelBrowserDataTable.getElementsByTagName("tr");

        // var countBox;
        var id = containerId + "_child";
        var countBox = document.getElementById(id);
        countBox.innerText = "Count :" + modelBrowserTableRows.length;
    }

    ComparisonReviewManager.prototype.highlightMainReviewTableFromCheckStatus = function (containerId) {
        var mainReviewTableContainer = document.getElementById(containerId);
        // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
        var mainReviewTableRows = mainReviewTableContainer.children[jsGridTbodyTableIndex].getElementsByTagName("tr");

        for (var i = 0; i < mainReviewTableRows.length; i++) {
            var currentRow = mainReviewTableRows[i];
            if (currentRow.cells.length < 3) {
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

    ComparisonReviewManager.prototype.showSelectedSheetData = function (viewerContainer, sheetName, CurrentReviewTableRow) {
        //var currentSheetName = sheetName;
        var classWiseComponents;
        var viewerContainerData = document.getElementById(viewerContainer);
       
        var currentlyLoadedSheet = undefined;
        if (viewerContainer === "viewerContainer1" &&
             sheetName in this.SourceAComponents ) 
        {
            classWiseComponents = this.SourceAComponents[sheetName];
            
            currentlyLoadedSheet  =this.SourceAViewerCurrentSheetLoaded;
        }
        else if (viewerContainer === "viewerContainer2" &&
                 sheetName in this.SourceBComponents ) 
        {
            classWiseComponents = this.SourceBComponents[sheetName];

            currentlyLoadedSheet  =this.SourceBViewerCurrentSheetLoaded;
        }

        if (classWiseComponents === undefined) 
        {
            return;
        }
                
        if (viewerContainerData.childElementCount > 1 &&
            sheetName === currentlyLoadedSheet) 
            {
                if (CurrentReviewTableRow.cells[2].innerText === "No Match") 
                {
                    if (viewerContainer === "viewerContainer1" && CurrentReviewTableRow.cells[0].innerText === "") 
                    {
                    if(this.SelectedComponentRowFromSheetA)
                    {
                        this.unhighlightSelectedSheetRow(this.checkStatusArrayA, this.SelectedComponentRowFromSheetA);
                    }
                    
                        return;
                    }
                    else if (viewerContainer === "viewerContainer2" && 
                            CurrentReviewTableRow.cells[1].innerText === "") 
                    {

                        if(this.SelectedComponentRowFromSheetB)
                    {
                            this.unhighlightSelectedSheetRow(this.checkStatusArrayB, this.SelectedComponentRowFromSheetB);
                    }

                        return;
                    }
                }

            this.HighlightRowInSheetData(CurrentReviewTableRow, viewerContainer);
            return;
        }

        if (classWiseComponents !== {}) 
        {           
            var componentProperties;
            for (var componentId in classWiseComponents) {
                componentProperties = classWiseComponents[componentId];
                break;
            }

            if (componentProperties === undefined) {
                return;
            }

            var column = {};
            columnHeaders = [];
          
            for (var i = 0; i < componentProperties.length; i++) 
            {
                var compProperty = componentProperties[i];

                columnHeader = {};
                
                columnHeader["name"] = compProperty['name'];
                var type;
                if ( compProperty['format'].toLowerCase() === "string") 
                {
                    type = "textarea";
                }
                else if (compProperty['format'].toLowerCase()=== "number") 
                {
                    type = "number";
                }
                else
                {
                    continue;
                }

                columnHeader["type"] = type;
                columnHeader["width"] = "90";
                columnHeaders.push(columnHeader);

                //tagnumber is for instruments XLS data sheet
                if (Object.keys(column).length <= 3) 
                {
                    if (compProperty['name'] === "ComponentClass" ||
                        compProperty['name'] === "Name" ||
                        compProperty['name'] === "Description" ||
                        compProperty['name'] === "Tagnumber") 
                    {
                        column[ compProperty['name']] = i;
                    }
                }
            }

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

          
            if (CurrentReviewTableRow.tagName.toLowerCase() !== "tr") 
            {
                return;
            }

            if (viewerContainer === "viewerContainer1") 
            {
                _this = this;
                _this.checkStatusArrayA = {};
                _this.SelectedComponentRowFromSheetA = undefined;
            
                _this.LoadSheetTableData(_this, columnHeaders, tableData, "#viewerContainer1", CurrentReviewTableRow, column, sheetName);
                _this.HighlightRowInSheetData(CurrentReviewTableRow, "viewerContainer1");

                // keep track of currently loaded sheet data
                this.SourceAViewerCurrentSheetLoaded = sheetName;
            }
            else if (viewerContainer === "viewerContainer2") 
            {
                _this = this;
                _this.checkStatusArrayB = {};
                _this.SelectedComponentRowFromSheetB = undefined;
               
                _this.LoadSheetTableData(_this, columnHeaders, tableData, "#viewerContainer2", CurrentReviewTableRow, column, sheetName);
                _this.HighlightRowInSheetData(CurrentReviewTableRow, "viewerContainer2");

                 // keep track of currently loaded sheet data
                 this.SourceBViewerCurrentSheetLoaded = sheetName;
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

            var reviewTableId = "ComparisonMainReviewCell";
            var reviewTableData = document.getElementById(reviewTableId);
            var reviewTableRowsData = reviewTableData.getElementsByTagName("tr");


            for (var i = 0; i < reviewTableRowsData.length; i++) {
                reviewTableRow = reviewTableRowsData[i];

                if (reviewTableRow.cells.length > 0) {
                    var componentName;
                    if (column.Name !== undefined) {
                        componentName = sheetDataRow.cells[column.Name].innerText;
                    }
                    else if (column.Tagnumber !== undefined) {
                        componentName = sheetDataRow.cells[column.Tagnumber].innerText;
                    }

                    if (componentName === reviewTableRow.cells[0].innerText ||
                        componentName === reviewTableRow.cells[1].innerText) {
                        if (containerId === "viewerContainer1") {
                            if (this.SelectedComponentRowFromSheetA) {
                                this.unhighlightSelectedSheetRow(this.checkStatusArrayA, this.SelectedComponentRowFromSheetA);
                            }

                            this.SelectedComponentRowFromSheetA = sheetDataRow;

                        }
                        if (containerId === "viewerContainer2") {
                            if (this.SelectedComponentRowFromSheetB) {
                                this.unhighlightSelectedSheetRow(this.checkStatusArrayB, this.SelectedComponentRowFromSheetB);
                            }

                            this.SelectedComponentRowFromSheetB = sheetDataRow;
                        }

                        if (this.SelectedComponentRow === reviewTableRow) {
                            return;
                        }

                        if (this.SelectedComponentRow) 
                        {
                            this.RestoreBackgroundColor(_this.SelectedComponentRow);
                        }

                        this.ChangeBackgroundColor(reviewTableRow);
                        this.SelectedComponentRow = reviewTableRow;

                        for (var j = 0; j < sheetDataRow.cells.length; j++) {
                            cell = sheetDataRow.cells[j];
                            cell.style.backgroundColor = "#B2BABB"
                        }

                        if (_this.SelectedComponentRow &&
                            _this.SelectedComponentRow.offsetParent &&
                            _this.SelectedComponentRow.offsetParent.offsetParent) {
                            var reviewTable = _this.SelectedComponentRow.offsetParent.offsetParent;
                            reviewTable.scrollTop = reviewTableRow.offsetTop - reviewTableRow.offsetHeight;

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
           
                var width ="550px";
                var height = "270px";

                var modal = document.getElementById('maximizeViewerContainer');
                if (modal.style.display === "block") {
                    width = "745px";
                    height = "370px";
                }                                          

                $(viewerContainer).jsGrid({
                    height: height,
                    width: width,
                    autoload: true,
                    data: tableData,
                    fields: columnHeaders,
                    margin: "0px",
                    rowClick: function (args) {
                        if ((viewerContainer === "#viewerContainer1" && args.event.currentTarget === _this.SelectedComponentRowFromSheetA) ||
                            (viewerContainer === "#viewerContainer2" && args.event.currentTarget === _this.SelectedComponentRowFromSheetB)) {
                            return;
                        }

                        _this.HighlightRowInMainReviewTable(args.event.currentTarget, viewerContainer);

                        if (viewerContainer === "#viewerContainer1") {
                            if (document.getElementById("viewerContainer2").innerHTML !== "" &&
                                _this.SelectedComponentRow.cells[1].innerText !== "") {
                                if (_this.SourceBComponents !== undefined) {
                                    _this.HighlightRowInSheetData(_this.SelectedComponentRow, "viewerContainer2");
                                }
                                else if (_this.SourceBViewerData !== undefined) {
                                    _this.HighlightComponentInGraphicsViewer(_this.SelectedComponentRow)
                                }
                            }
                            //for "no match" case unhighlight component 
                            if( _this.SelectedComponentRow.cells[1].innerText === "")
                            {
                                if(_this.SourceBReviewModuleViewerInterface)
                                {
                                    _this.SourceBReviewModuleViewerInterface.unHighlightComponent();
                                }
                                if(_this.SelectedComponentRowFromSheetB)
                                {
                                    _this.unhighlightSelectedSheetRow(_this.checkStatusArrayB, _this.SelectedComponentRowFromSheetB)
                                }
                                
                            }
                        }
                        else if (viewerContainer === "#viewerContainer2") {
                            if (document.getElementById("viewerContainer1").innerHTML !== "" 
                                && _this.SelectedComponentRow.cells[0].innerText !== "") {
                                if (_this.SourceAComponents !== undefined)
                                {
                                    _this.HighlightRowInSheetData(_this.SelectedComponentRow, "viewerContainer1");
                                }
                                else if (_this.SourceAViewerData !== undefined) 
                                {
                                    _this.HighlightComponentInGraphicsViewer(_this.SelectedComponentRow)
                                }
                            }
                            //for "no match" case unhighlight component 
                            if( _this.SelectedComponentRow.cells[0].innerText === "")
                            {
                                if(_this.SourceAReviewModuleViewerInterface)
                                {
                                    _this.SourceAReviewModuleViewerInterface.unHighlightComponent();
                                }
                                
                                if(_this.SelectedComponentRowFromSheetA)
                                {
                                    _this.unhighlightSelectedSheetRow(_this.checkStatusArrayA, _this.SelectedComponentRowFromSheetA)
                                }
                            }

                        }

                    }
                });

            });
           
            _this.highlightSheetRowsFromCheckStatus(viewerContainer, CurrentReviewTableRow, column, sheetName);
        }
        
        var container = document.getElementById(viewerContainer.replace("#", ""));
        // container.style.width = "550px"
        // container.style.height = "270px"
         container.style.overflowX = "scroll";
         container.style.overflowY = "scroll";
         container.style.margin = "0px";
         container.style.top = "0px"

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
                height: "202px",
                width: "578px",
                filtering: true,
                autoload: true,
                controller: db,
                sorting: true,
                data: tableData,
                fields: columnHeaders,
                margin: "0px",
                onItemUpdated: function(args) {
                    for(var index = 0; index < args.grid.data.length; index++) {
                        if(args.grid.data[index].ID == args.row[0].cells[5].innerHTML)
                        {
                            if(args.grid.data[index].Status !== args.row[0].cells[2].innerHTML)
                            {
                                args.grid.data[index].Status = args.row[0].cells[2].innerHTML;
                                break;
                            }
                        }
                    }
                },
                onRefreshed: function (config) {
                    var id = viewerContainer.replace("#", "");
                    // _this.AddTableContentCount(this._container.context.id);
                    document.getElementById(id).style.width = "578px";
                    _this.highlightMainReviewTableFromCheckStatus(id);

                    // hide additional column cells
                    var tableRows = this._container.context.getElementsByTagName("tr");
                    for (var j = 0; j < tableRows.length; j++) {
                        var currentRow = tableRows[j];
                        for (var i = 0; i < currentRow.cells.length; i++) {
                            if (i > 2) {
                                currentRow.cells[i].style.display = "none";
                            }
                        }
                    }

                },
                rowClick: function (args) {
                    var commentDiv = document.getElementById("ComparisonDetailedReviewComment");
                    commentDiv.innerHTML = "";

                    _this.detailedReviewRowComments = {};

                    _this.populateDetailedReviewTable(args.event.currentTarget);
                    var sheetName = viewerContainer.replace("#", "");

                    if (_this.SourceAComponents !== undefined && _this.SourceBComponents !== undefined) 
                    {
                        this.checkStatusArrayA = {};
                        this.checkStatusArrayB = {};
                        var result = sheetName.split('-');
                        var CurrentReviewTableRow = args.event.currentTarget;
                        
                        if (CurrentReviewTableRow.cells[0].innerText !== "")
                        {
                            _this.showSelectedSheetData("viewerContainer1", result[0], args.event.currentTarget);
                        }
                        else 
                        {
                            document.getElementById("viewerContainer1").innerHTML = "";
                        }

                        if (CurrentReviewTableRow.cells[1].innerText !== "") 
                        {
                            _this.showSelectedSheetData("viewerContainer2", result[1], args.event.currentTarget);
                        }
                        else 
                        {
                            document.getElementById("viewerContainer2").innerHTML = "";
                        }
                    }
                    else if (_this.SourceAViewerData !== undefined &&
                             _this.SourceBViewerData !== undefined) 
                    {
                        _this.HighlightComponentInGraphicsViewer(args.event.currentTarget)
                    }
                    else if (_this.SourceAComponents !== undefined &&
                             _this.SourceBViewerData !== undefined) 
                    {

                        this.checkStatusArrayA = {};
                        this.checkStatusArrayB = {};
                        var result = sheetName.split('-');

                        _this.showSelectedSheetData("viewerContainer1", result[0], args.event.currentTarget);
                        
                        _this.HighlightComponentInGraphicsViewer(args.event.currentTarget)
                    }
                    else if (_this.SourceAViewerData !== undefined &&
                             _this.SourceBComponents !== undefined) 
                    {

                        this.checkStatusArrayA = {};
                        this.checkStatusArrayB = {};
                        var result = sheetName.split('-');
                        
                        _this.showSelectedSheetData("viewerContainer2", result[1], args.event.currentTarget);
                        
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

    ComparisonReviewManager.prototype.updateStatus = function(selectedRow, _this) {
        if(selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComparisonMainReviewTbody") {
            if(selectedRow[0].cells[2].innerHTML !== "OK") {
                var componentId = selectedRow[0].cells[5].innerHTML;
                var groupId = selectedRow[0].cells[6].innerHTML;
               
                try{
                    $.ajax({
                        url: 'PHP/updateResultsStatusToAccept.php',
                        type: "POST",
                        async: true,
                        data: {'componentid' : componentId, 'tabletoupdate': "comparison", 'ProjectName' : projectInfoObject.projectname },
                        success: function (msg) {
                            var cell = 0;
                            for(cell = 0; cell < selectedRow[0].cells.length; cell++) {
                                selectedRow[0].cells[cell].style.backgroundColor = "rgb(203, 242, 135)";
                            }
                            var component = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                            component.status = "OK(A)";
                            for (var propertyId in component.properties) {
                                property = component.properties[propertyId];
                                if(property.Severity !== "OK" && property.Severity !== "No Value") {
                                    if(property.transpose == 'lefttoright' && property.Severity !== 'No Value') {
                                        component.properties[propertyId].Severity = 'ACCEPTED';
                                        component.status = "OK(A)(T)";
                                        component.properties[propertyId].transpose = property.transpose;
                                    }
                                    else if(property.transpose == 'righttoleft' && property.Severity !== 'No Value') {
                                        component.properties[propertyId].Severity = 'ACCEPTED';
                                        component.status = "OK(A)(T)";
                                        component.properties[propertyId].transpose = property.transpose;
                                    }
                                    else {
                                        component.properties[propertyId].Severity = 'ACCEPTED';
                                    }
                                }
                            }
                            _this.SelectedComponentRow.cells[2].innerText = component.status;
                            _this.updateReviewComponentGridData(selectedRow[0], groupId, component.status);
                        }
                    });   
                }
                catch(error) {}        
                // $("#ComparisonDetailedReviewCell").empty();
            }
        }
        if(selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComparisonDetailedReviewTbody") {
            if(selectedRow[0].cells[4].innerHTML !== "OK" && selectedRow[0].cells[4].innerHTML !== "ACCEPTED" &&  _this.SelectedComponentRow.cells[2].innerHTML !== 'OK') {
                selectedRow[0].cells[4].innerHTML = "ACCEPTED";
                var cell = 0;
                for(cell = 0; cell < selectedRow[0].cells.length; cell++) {
                    selectedRow[0].cells[cell].style.backgroundColor = "rgb(203, 242, 135)";
                }
    
                var componentId = this.SelectedComponentRow.cells[5].innerHTML;
                var groupId = this.SelectedComponentRow.cells[6].innerHTML;
                try{
                    $.ajax({
                        url: 'PHP/updateResultsStatusToAccept.php',
                        type: "POST",
                        async: true,
                        data: {'componentid' : componentId, 'tabletoupdate': "comparisonDetailed", 'sourceAPropertyName': selectedRow[0].cells[0].innerText, 'sourceBPropertyName': selectedRow[0].cells[3].innerText,
                        'ProjectName' : projectInfoObject.projectname },
                        success: function (msg) {
                            var originalstatus = _this.SelectedComponentRow.cells[2].innerHTML;
                            var changedStatus = originalstatus;
                            if(!originalstatus.includes("(A)")) {
                                changedStatus = originalstatus + "(A)";
                                _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
                            }
                            if(msg.trim() == "OK(A)" || msg.trim() == "OK(A)(T)") {
                                changedStatus = msg.trim();
                                _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
                            }
                            var propertiesLen = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"].length;
                            for(var i = 0; i < propertiesLen; i++) {
                                var sourceAName = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceAName"];
                                if(sourceAName == null) { sourceAName = ""; }
                                var sourceBName = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceBName"];
                                if(sourceBName == null) { sourceBName = ""; }

                                if(sourceAName == selectedRow[0].cells[0].innerText && sourceBName == selectedRow[0].cells[3].innerText) {
                                    _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["Severity"] = "ACCEPTED";
                                }
                               
                            }
                            _this.SelectedComponentRow.cells[2].innerText = changedStatus;
                            _this.updateReviewComponentGridData(_this.SelectedComponentRow, groupId, changedStatus);
                        }
                    });   
                }
                catch(error) {
                    console.log(error);}  
            }
        }
    }

    ComparisonReviewManager.prototype.updateReviewComponentGridData = function(selectedRow, groupId, changedStatus) {
        var row = selectedRow;
        var gridId = '#' + this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;
        _this = this;

        var editedItem = {"SourceA" : selectedRow.cells[0].innerText, 
        "SourceB" : selectedRow.cells[1].innerText,
        "Status" : changedStatus, 
        "SourceANodeId" : selectedRow.cells[3].innerText, 
        "SourceBNodeId" : selectedRow.cells[4].innerText,
        "ID" : selectedRow.cells[5].innerText, 
        "groupId" : selectedRow.cells[6].innerText};

        $(gridId).jsGrid("updateItem", selectedRow, editedItem).done(function() {
            _this.populateDetailedReviewTable(selectedRow);
            $(gridId).jsGrid("refresh");
        });
    } 

    ComparisonReviewManager.prototype.toggleAcceptAllComparedComponents = function(tabletoupdate) {
        var tabletoupdate = tabletoupdate;
        try{
            $.ajax({
                url: 'PHP/updateResultsStatusToAccept.php',
                type: "POST",
                async: true,
                data: {'tabletoupdate': tabletoupdate, 'ProjectName' : projectInfoObject.projectname},
                success: function (msg) {
                    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                    var object = JSON.parse(projectinfo);
                    $.ajax({
                        url: 'PHP/CheckResultsReader.php',
                        type: "POST",
                        async: true,
                        data: {
                            'ProjectName': object.projectname
                        },
                        success: function (msg) {
                            $("#ComparisonMainReviewCell").empty();
                            $("#ComparisonDetailedReviewCell").empty();
                            $("#SourceBComplianceMainReviewCell").empty();
                            $("#SourceBComplianceDetailedReviewCell").empty();
                            $("#SourceAComplianceMainReviewCell").empty();
                            $("#SourceAComplianceDetailedReviewCell").empty();
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

    ComparisonReviewManager.prototype.updateStatusOfCategory = function(button, _this) {
        var groupId = button.attributes[0].value;
        var categorydiv = document.getElementById(button.innerHTML);
        var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;

        try{
            $.ajax({
                url: 'PHP/updateResultsStatusToAccept.php',
                type: "POST",
                async: true,
                data: {'groupid' : groupId, 'tabletoupdate': "category", 'ProjectName' : projectInfoObject.projectname},
                success: function (msg) {
                    for(var i = 0; i < noOfComponents; i++) {
                        if(categorydiv.children[1].children[0].children[0].children[i].children[2].innerHTML !== "OK") {
                            var compgroup = _this.ComparisonCheckManager["CheckGroups"][groupId];
                            compgroup.categoryStatus = "ACCEPTED";
                            for(var compId in compgroup["CheckComponents"]) {
                                var component = compgroup["CheckComponents"][compId];
                                component.status = "OK(A)";
                                for (var propertyId in component.properties) {
                                    property = component.properties[propertyId];
                                    if(property.Severity !== 'No Value' && property.Severity !== 'OK')
                                        property.Severity = 'ACCEPTED';

                                }
                            }                            
                            var row = categorydiv.children[1].children[0].children[0].children[i];
                            var gridId = '#' + _this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;

                            var editedItem = {"SourceA" : row.cells[0].innerText, 
                            "SourceB" : row.cells[1].innerText,
                            "Status" : component.status, 
                            "SourceANodeId" : row.cells[3].innerText, 
                            "SourceBNodeId" : row.cells[4].innerText,
                            "ID" : row.cells[5].innerText, 
                            "groupId" : row.cells[6].innerText};

                            $(gridId).jsGrid("updateItem", row, editedItem).done(function() {
                                if(i == noOfComponents-1) {
                                    selectedRow = categorydiv.children[1].children[0].children[0].children[0];
                                    _this.populateDetailedReviewTable(selectedRow);    
                                    $(gridId).jsGrid("refresh");
                                }
                            });
                        }
                    }
                }
            });   
        }
        catch(error) {
            console.log(error);}  
    }

    ComparisonReviewManager.prototype.unAcceptStatus = function(selectedRow, _this) {
        if(selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComparisonMainReviewTbody") { 
            var componentId = selectedRow[0].cells[5].innerHTML;
            var groupId = selectedRow[0].cells[6].innerHTML;
            try{
                $.ajax({
                    url: 'PHP/updateResultsStatusToAccept.php',
                    type: "POST",
                    dataType: 'JSON',
                    async: true,
                    data: {'componentid' : componentId, 'tabletoupdate': "rejectComponentFromComparisonTab", 'ProjectName' : projectInfoObject.projectname },
                    success: function (msg) {
                        var status = new Array();
                        status = msg;
                        var properties = status[1];
                        var cell = 0;
                        for(cell = 0; cell < selectedRow[0].cells.length; cell++) {
                            selectedRow[0].cells[cell].style.backgroundColor = _this.getRowHighlightColor(status[0]);
                        }
                        var component = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                        component.status = status[0];
                        if(component.transpose != null) {
                            if(!status[0].includes("(T)")) 
                                component.status = status[0] + "(T)";
                        }
                        var index = 0;
                        for(var propertyId in properties) {
                            property = properties[propertyId];
                            if(property.transpose == 'lefttoright' && property.severity !== 'No Value') {
                                component.properties[index].Severity = 'OK(T)';
                                component.properties[index].transpose = property.transpose;
                            }
                            else if(property.transpose == 'righttoleft' && property.severity !== 'No Value') {
                                component.properties[index].Severity = 'OK(T)';
                                component.properties[index].transpose = property.transpose;
                            }
                            else {
                                component.properties[index].Severity = property.severity;
                            }
                            index++;
                        }
                        _this.SelectedComponentRow.cells[2].innerText = component.status;
                        _this.updateReviewComponentGridData(selectedRow[0], groupId, component.status);
                    }
                });   
            }
            catch(error) {}        
        }
        else if(selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComparisonDetailedReviewTbody") {
            var componentId = this.SelectedComponentRow.cells[5].innerHTML;
            var groupId = this.SelectedComponentRow.cells[6].innerHTML;
            try{
                $.ajax({
                    url: 'PHP/updateResultsStatusToAccept.php',
                    type: "POST",
                    async: true,
                    dataType: 'JSON',
                    data: {'componentid' : componentId, 'tabletoupdate': "rejectPropertyFromComparisonTab", 'sourceAPropertyName': selectedRow[0].cells[0].innerText, 'sourceBPropertyName': selectedRow[0].cells[3].innerText, 'ProjectName' : projectInfoObject.projectname },
                    success: function (msg) {
                        var status = new Array();
                        status = msg;
                        var changedStatus = status[0];
                        _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
                                      
                        var propertiesLen = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"].length;
                        for(var i = 0; i < propertiesLen; i++) {
                            var sourceAName = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceAName"];
                            if(sourceAName == null) { sourceAName = ""; }
                            var sourceBName = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceBName"];
                            if(sourceBName == null) { sourceBName = ""; }

                            if(sourceAName == selectedRow[0].cells[0].innerText && sourceBName == selectedRow[0].cells[3].innerText) {
                                _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["Severity"] = status[1];
                            }
                           
                        }
                        _this.SelectedComponentRow.cells[2].innerText = changedStatus;
                        _this.updateReviewComponentGridData(_this.SelectedComponentRow, groupId, changedStatus);
                    }
                });   
            }
            catch(error) {
                console.log(error);}  
        }
    }

    ComparisonReviewManager.prototype.unAcceptCategory = function(button, _this) {
        var groupId = button.attributes[0].value;
        var categorydiv = document.getElementById(button.innerHTML);
        var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;

        try{
            $.ajax({
                url: 'PHP/updateResultsStatusToAccept.php',
                type: "POST",
                async: true,
                dataType: 'JSON',
                data: {'groupid' : groupId, 'tabletoupdate': "rejectCategoryFromComparisonTab", 'ProjectName' : projectInfoObject.projectname},
                success: function (msg) {
                    var status = new Array();
                    status = msg;
                    var componentStatus = status[0];
                    var propsStatus = status[1];
                    var index = 0
                    for(var i = 0; i < noOfComponents; i++) {
                        var j = 0;
                        var compgroup = _this.ComparisonCheckManager["CheckGroups"][groupId];
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
                        }

                        var row = categorydiv.children[1].children[0].children[0].children[i];
                        var gridId = '#' + _this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;

                        var editedItem = {"SourceA" : row.cells[0].innerText, 
                        "SourceB" : row.cells[1].innerText,
                        "Status" : component.status, 
                        "SourceANodeId" : row.cells[3].innerText, 
                        "SourceBNodeId" : row.cells[4].innerText,
                        "ID" : row.cells[5].innerText, 
                        "groupId" : row.cells[6].innerText};

                        $(gridId).jsGrid("updateItem", row, editedItem).done(function() {
                            if(i == noOfComponents-1) {
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

    ComparisonReviewManager.prototype.HighlightComponentInGraphicsViewer = function (currentReviewTableRow) {
        //var reviewTableId = this.getReviewTableId(currentReviewTableRow);

        var sourceANodeId;       
        if (this.SourceAViewerData !== undefined &&
            currentReviewTableRow.cells[3].innerHTML !== "") {
                sourceANodeId = currentReviewTableRow.cells[3].innerHTML;
        }

        var sourceBNodeId;
        if (this.SourceBViewerData !== undefined &&
            currentReviewTableRow.cells[4].innerHTML !== "") {
            sourceBNodeId = currentReviewTableRow.cells[4].innerHTML;
        }

        //var result = reviewTableId.split('-');
        // if (result[0] === "PipingNetworkSegment") {
        //     var source = currentReviewTableRow.cells[3].innerHTML;
        //     var destination = currentReviewTableRow.cells[4].innerHTML;
        //     var ownerId = currentReviewTableRow.cells[5].innerHTML;

        //     if (source !== undefined && source !== "" &&
        //         destination !== undefined && destination !== "" &&
        //         ownerId !== undefined && ownerId !== "") {
        //         componentIdentifier += "_" + source + "_" + destination + "_" + ownerId;
        //     }
        // }


        // highlight component in graphics view in both viewer
        if (this.SourceAViewerData != undefined) {
            if (sourceANodeId !== undefined && sourceANodeId !== "") {
                this.SourceAReviewModuleViewerInterface.highlightComponent(sourceANodeId);
            }
            else {
                // unhighlight previous component
                this.SourceAReviewModuleViewerInterface.unHighlightComponent();
            }
        }
        if (this.SourceBViewerData != undefined) {

            if (sourceBNodeId !== undefined && sourceBNodeId !== "") {
                this.SourceBReviewModuleViewerInterface.highlightComponent(sourceBNodeId);
            }
            else {
                // unhighlight previous component
                this.SourceBReviewModuleViewerInterface.unHighlightComponent();
            }
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

    ComparisonReviewManager.prototype.transposePropertyValue = function(key, selectedRow, comparisonReviewManager) {
        _this = comparisonReviewManager;
        var transposeType = key;
        var componentId = _this.SelectedComponentRow.cells[5].innerHTML;
        var groupId = this.SelectedComponentRow.cells[6].innerHTML;

        if((selectedRow[0].cells[0].innerHTML !== "" && selectedRow[0].cells[0].innerHTML !== "") && 
        (selectedRow[0].cells[2].innerHTML !== "" || selectedRow[0].cells[1].innerHTML !== "")) {
            try{
                $.ajax({
                    url: 'PHP/TransposeProperties.php',
                    type: "POST",
                    async: true,
                    data: {'componentid' : componentId, 'transposeType' : transposeType, 'sourceAPropertyName': selectedRow[0].cells[0].innerText, 'sourceBPropertyName': selectedRow[0].cells[3].innerText, 'transposeLevel' : 'propertyLevel', 'ProjectName' : projectInfoObject.projectname },
                    success: function (msg) {
                        var originalstatus = _this.SelectedComponentRow.cells[2].innerHTML;
                        var changedStatus = originalstatus;
                        if(!originalstatus.includes("(T)")) {
                             changedStatus = originalstatus + "(T)";
                            _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
                        }
                        if(msg.trim() == "OK(T)" || msg.trim() == "OK(A)(T)") {
                             changedStatus = msg.trim();
                            _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
                            _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["transpose"] = transposeType;
                        }

                        var compcolor = _this.getRowHighlightColor(changedStatus);
                        for (var j = 0; j <  _this.SelectedComponentRow.cells.length; j++) {
                            cell =  _this.SelectedComponentRow.cells[j];
                            cell.style.backgroundColor = compcolor;
                        }

                        var SourceAValue = selectedRow[0].cells[1].innerHTML;
                        var SourceBValue = selectedRow[0].cells[2].innerHTML;

                        var color = _this.getRowHighlightColor('OK(T)');
                        for (var j = 0; j < selectedRow[0].cells.length; j++) {
                            cell = selectedRow[0].cells[j];
                            cell.style.backgroundColor = color;
                        }

                        if(transposeType == "lefttoright") {
                            selectedRow[0].cells[2].innerHTML = SourceAValue;
                            selectedRow[0].cells[4].innerHTML = 'OK(T)';
                            var propertiesLen = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"].length;
                            for(var i = 0; i < propertiesLen; i++) {
                                var sourceAName = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceAName"];
                                if(sourceAName == null) { sourceAName = ""; }
                                var sourceBName = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceBName"];
                                if(sourceBName == null) { sourceBName = ""; }
                                if(sourceAName == selectedRow[0].cells[0].innerText && sourceBName == selectedRow[0].cells[3].innerText) {
                                    _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["Severity"] = 'OK(T)';
                                    _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]['transpose'] = transposeType;
                                } 
                                if(_this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceAValue"] != 'OK' &&
                                _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceBValue"] !== 'No Match') {
                                    if(_this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]['transpose'] !== null) {
                                        if(i == propertiesLen-1) {
                                            _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = 'OK(T)';
                                            _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["transpose"] = transposeType;
                                        }
                                    }
                                }  
                            }
        
                        }
                        else if(transposeType == "righttoleft") {
                            selectedRow[0].cells[1].innerHTML  = SourceBValue;
                            selectedRow[0].cells[4].innerHTML = 'OK(T)';
                            var propertiesLen = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"].length;
                            for(var i = 0; i < propertiesLen; i++) {
                                var sourceAName = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceAName"];
                                if(sourceAName == null) { sourceAName = ""; }
                                var sourceBName = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceBName"];
                                if(sourceBName == null) { sourceBName = ""; }

                                if(sourceAName == selectedRow[0].cells[0].innerText && sourceBName == selectedRow[0].cells[3].innerText) {
                                    _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["Severity"] = 'OK(T)';
                                    _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]['transpose'] = transposeType;
                                }  

                                if(_this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceAValue"] != 'OK' &&
                                _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceBValue"] !== 'No Match') {
                                    if(_this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]['transpose'] !== null) {
                                        if(i == propertiesLen-1) {
                                            _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = 'OK(T)';
                                            _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["transpose"] = transposeType;
                                        }
                                    }
                                }
                            }
                        }
                        _this.SelectedComponentRow.cells[2].innerText = changedStatus;
                        _this.updateReviewComponentGridData(_this.SelectedComponentRow, groupId, changedStatus);
                    }
                });   
            }
            catch(error) {}        
        }
     }

    ComparisonReviewManager.prototype.restoreTransposePropertyValue = function(selectedRow, comparisonReviewManager) {
        _this = comparisonReviewManager;
        var transposeType = 'restoreProperty';
        var componentId = _this.SelectedComponentRow.cells[5].innerHTML;
        var groupId = this.SelectedComponentRow.cells[6].innerHTML;
        try{
            $.ajax({
                url: 'PHP/TransposeProperties.php',
                type: "POST",
                async: true,
                dataType : 'JSON',
                data: {'componentid' : componentId, 'transposeType' : transposeType, 'sourceAPropertyName': selectedRow[0].cells[0].innerText, 'sourceBPropertyName': selectedRow[0].cells[3].innerText, 'transposeLevel' : 'propertyLevel', 'ProjectName' : projectInfoObject.projectname },
                success: function (msg) {
                    var status = new Array();
                    status = msg;
                    var changedStatus = status[0];
                    _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["Status"] = changedStatus;
                    _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["transpose"] = null;
                    var propertiesLen = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"].length;
                    for(var i = 0; i < propertiesLen; i++) {
                        var sourceAName = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceAName"];
                        if(sourceAName == null) { sourceAName = ""; }
                        var sourceBName = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["SourceBName"];
                        if(sourceBName == null) { sourceBName = ""; }

                        if(sourceAName == selectedRow[0].cells[0].innerText && sourceBName == selectedRow[0].cells[3].innerText) {
                            _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["Severity"] = status[1];
                            _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId]["properties"][i]["transpose"] = null;
                        }
                        
                    }
                    _this.SelectedComponentRow.cells[2].innerText = changedStatus;
                    _this.updateReviewComponentGridData(_this.SelectedComponentRow, groupId, changedStatus);
                }
                    
            });   
        }
        catch(error) {}
    }

    ComparisonReviewManager.prototype.restoreTransposeComponentLevel = function(selectedRow, comparisonReviewManager) {
            _this = comparisonReviewManager;
            var componentId = selectedRow[0].cells[5].innerHTML;
            var groupId = selectedRow[0].cells[6].innerHTML;
            try{
                $.ajax({
                    url: 'PHP/TransposeProperties.php',
                    type: "POST",
                    dataType: 'JSON',
                    async: true,
                    data: {'componentid' : componentId, 'transposeType' : 'restoreComponent', 'transposeLevel' : 'componentLevel', 'ProjectName' : projectInfoObject.projectname  },
                    success: function (msg) {
                        var status = new Array();
                        status = msg;
                        var properties = status[1];
                        var component = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                        component.status = status[0];
                        component.transpose = null;
                        var index = 0;
                        for(var propertyId in properties) {
                            property = properties[propertyId];     
                            if(property.accepted == 'false') {
                                component.properties[index].Severity = property.severity;
                                component.properties[index].transpose = null;
                            }
                            else if(property.accepted == 'true') {
                                if(!status[0].includes("(A)")) 
                                    component.status = status[0] + "(A)";
                            }                
                            index++;
                        }
                        _this.SelectedComponentRow.cells[2].innerText = component.status;
                        _this.updateReviewComponentGridData(selectedRow[0], groupId, component.status);
                    }
                });   
            }
            catch(error) {}        
    }

    ComparisonReviewManager.prototype.transposePropertyValueComponentLevel = function(key, selectedRow, comparisonReviewManager) {
        _this = comparisonReviewManager;
        if(selectedRow[0].offsetParent.offsetParent.offsetParent.id == "ComparisonMainReviewTbody") {
            if(selectedRow[0].cells[2].innerHTML !== "OK") {
                var componentId = selectedRow[0].cells[5].innerHTML;
                var groupId = selectedRow[0].cells[6].innerHTML;
                var transposeType = key;
 
                try{
                    $.ajax({
                        url: 'PHP/TransposeProperties.php',
                        type: "POST",
                        async: true,
                        data: {'componentid' : componentId, 'transposeType' : transposeType, 'transposeLevel' : 'componentLevel', 'ProjectName' : projectInfoObject.projectname },
                        success: function (msg) {
                            var component = _this.ComparisonCheckManager["CheckGroups"][groupId]["CheckComponents"][componentId];
                            component.transpose = transposeType;
                            component.status = 'OK(T)';
                            for (var propertyId in component.properties) {
                                property = component.properties[propertyId];
                                if(property.Severity !== "OK" &&  property.Severity !== "No Value") {
                                    if(property.Severity == 'ACCEPTED') {
                                        component.status = 'OK(A)(T)';
                                    }
                                    else if(transposeType == 'lefttoright' && (property.SourceAName !== "" && property.SourceBName !== "")) {
                                        property.Severity = 'OK(T)';
                                        property.transpose = transposeType;
                                    }
                                    else if(transposeType == 'righttoleft'&& (property.SourceAName !== "" && property.SourceBName !== "")) {
                                        property.Severity = 'OK(T)';
                                        property.transpose = transposeType;
                                    }
                                    else {
                                        if((property.Severity == 'Error' || property.Severity == 'No Match') && property.transpose == null && 
                                        component.status == 'OK(T)') {
                                            if(!(component.Status).includes('(T)'))
                                                component.status = component.Status + "(T)";                                   
                                        }
                                    }
                                }
                                    
                            }
                            _this.SelectedComponentRow.cells[2].innerText = component.status;
                            _this.updateReviewComponentGridData(selectedRow[0], groupId, component.status);
                        }
                    });   
                }
                catch(error) {}        
            }
        }
    }

    ComparisonReviewManager.prototype.restoreTransposeCategoryLevel = function(button, comparisonReviewManager) {
        _this = comparisonReviewManager;
        var groupId = button.attributes[0].value;
        var categorydiv = document.getElementById(button.innerHTML);
        var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;

        try{
            $.ajax({
                url: 'PHP/TransposeProperties.php',
                type: "POST",
                async: true,
                dataType: 'JSON',
                data: {'groupid' : groupId, 'transposeType' : 'restoreCategory', 'transposeLevel' : 'categorylevel', 'ProjectName' : projectInfoObject.projectname},
                success: function (msg) {
                    var status = new Array();
                    status = msg;
                    var componentStatus = status[0];
                    var propsStatus = status[1];
                    var index = 0
                    for(var i = 0; i < noOfComponents; i++) {
                        var j = 0;
                        var compgroup = _this.ComparisonCheckManager["CheckGroups"][groupId];
                        compgroup.categoryStatus = "UNACCEPTED";
                        for(var compId in compgroup["CheckComponents"]) {
                            var component = compgroup["CheckComponents"][compId];
                            component.status = componentStatus[index]['status'];
                            component.transpose = null;
                            var propindex = 0;
                            for (var propertyId in component.properties) {
                                property = component.properties[propertyId];
                                property.Severity = propsStatus[j][propindex]['severity'];
                                property.transpose = null;
                                propindex++;
                            }
                            j++;
                        }
                            var row = categorydiv.children[1].children[0].children[0].children[i];
                            var gridId = '#' + _this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;

                            var editedItem = {"SourceA" : row.cells[0].innerText, 
                            "SourceB" : row.cells[1].innerText,
                            "Status" : component.status, 
                            "SourceANodeId" : row.cells[3].innerText, 
                            "SourceBNodeId" : row.cells[4].innerText,
                            "ID" : row.cells[5].innerText, 
                            "groupId" : row.cells[6].innerText};

                            $(gridId).jsGrid("updateItem", row, editedItem).done(function() {
                                if(i == noOfComponents-1) {
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

    ComparisonReviewManager.prototype.transposePropertyValueCategoryLevel =  function(key, button, comparisonReviewManager) {
        _this = comparisonReviewManager;
        var groupId = button.attributes[0].value;
        var categorydiv = document.getElementById(button.innerHTML);
        var noOfComponents = categorydiv.children[1].children[0].children[0].children.length;
        var transposeType = key;

        try{
            $.ajax({
                url: 'PHP/TransposeProperties.php',
                type: "POST",
                async: true,
                data: {'groupid' : groupId, 'transposeType' : transposeType, 'transposeLevel' : 'categorylevel', 'ProjectName' : projectInfoObject.projectname},
                success: function (msg) {
                    var compgroup = _this.ComparisonCheckManager["CheckGroups"][groupId];
                    compgroup.categoryStatus = "OK(T)";
                    var index = 0;
                    for(var compId in compgroup["CheckComponents"]) {
                        var component = compgroup["CheckComponents"][compId];
                        component.status = component.Status;
                        if(component.Status !== 'No Match' && component.Status !== 'OK') {
                            for (var propertyId in component.properties) {
                                property = component.properties[propertyId];
                                if(property.Severity !== 'OK' && property.Severity !== 'No Value' ) {
                                    if(transposeType == 'lefttoright' && (property.SourceAName !== "" && property.SourceBName !== "")) {
                                        property.Severity = 'OK(T)';
                                        property.transpose = transposeType;
                                        component.status = "OK(T)";
                                        component.transpose = transposeType;
                                    }
                                    else if(transposeType == 'righttoleft' && (property.SourceAName !== "" && property.SourceBName !== "")) {
                                        property.Severity = 'OK(T)';
                                        property.transpose = transposeType;
                                        component.status = "OK(T)";
                                        component.transpose = transposeType;
                                    }
                                    else {
                                        if((property.Severity == 'Error' || property.Severity == 'No Match') && property.transpose == null && 
                                        component.status == 'OK(T)') {
                                            if(!(component.Status).includes('(T)'))
                                                component.status = component.Status + "(T)";                                   
                                        }
                                    }
                                }
                            }  
                        }
                        var row = categorydiv.children[1].children[0].children[0].children[index];
                        var gridId = '#' + _this.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass;

                        var editedItem = {"SourceA" : row.cells[0].innerText, 
                        "SourceB" : row.cells[1].innerText,
                        "Status" : component.status, 
                        "SourceANodeId" : row.cells[3].innerText, 
                        "SourceBNodeId" : row.cells[4].innerText,
                        "ID" : row.cells[5].innerText, 
                        "groupId" : row.cells[6].innerText};

                        $(gridId).jsGrid("updateItem", row, editedItem).done(function() {
                            if(index == noOfComponents -1 ) {
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
    
    ComparisonReviewManager.prototype.LoadDetailedReviewTableData = function (_this, columnHeaders, tableData, viewerContainer) {
        //var _this = this;

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
                width: "576px",
                height: "180px",
                filtering: true,
                autoload: true,
                controller: db,
                sorting: true,
                data: tableData,
                headerRowRenderer: function() {
                    var fields = $(viewerContainer).jsGrid("option", "fields");
                    var result = $("<tr>").height(0).append($("<th>").width(120))
                    .append($("<th>").width(110))
                    .append($("<th>").width(120))
                    .append($("<th>").width(110));

                    result = result.add($("<tr>")
                    .append($("<th>").attr("colspan", 2).text("SourceA"/*AnalyticsData.SourceAName*/))
                    .append($("<th>").attr("colspan", 2).text("SourceB"/*AnalyticsData.SourceBName*/)))


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
                    var commentDiv = document.getElementById("ComparisonDetailedReviewComment");
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

    ComparisonReviewManager.prototype.highlightSheetRowsFromCheckStatus = function (viewerContainer, reviewTableRow, column, sheetName) {
        var reviewTableElement = reviewTableRow.parentElement;
        var reviewTableRows = reviewTableElement.getElementsByTagName("tr");

        var id = viewerContainer.replace("#", "");
        var currentSheetDataTable = document.getElementById(id);
        // jsGridHeaderTableIndex = 0 
            // jsGridTbodyTableIndex = 1
        var currentSheetRows = currentSheetDataTable.children[jsGridTbodyTableIndex].getElementsByTagName("tr");

        var checkStatusArray = {};
        for (var i = 0; i < reviewTableRows.length; i++) {
            var CurrentReviewTableRow = reviewTableRows[i];
            for (var j = 0; j < currentSheetRows.length; j++) {
                currentSheetRow = currentSheetRows[j];
                var componentName;
                if (column['Name'] !== undefined) {
                    componentName = currentSheetRow.cells[column['Name']].innerText;
                }
                else if (column['Tagnumber'] !== undefined) {
                    componentName = currentSheetRow.cells[column['Tagnumber']].innerText;
                }
                if (CurrentReviewTableRow.cells[0].innerText !== "" && CurrentReviewTableRow.cells[0].innerText === componentName) 
                {
                    var color = CurrentReviewTableRow.cells[0].style.backgroundColor;
                    for (var j = 0; j < currentSheetRow.cells.length; j++) {
                        cell = currentSheetRow.cells[j];
                        cell.style.backgroundColor = color;
                    }
                    checkStatusArray[currentSheetRow.rowIndex] = CurrentReviewTableRow.cells[2].innerHTML;
                    break;
                }
                else if (CurrentReviewTableRow.cells[1].innerText !== "" && CurrentReviewTableRow.cells[1].innerText === componentName) 
                {
                    var color = CurrentReviewTableRow.cells[0].style.backgroundColor;
                    for (var j = 0; j < currentSheetRow.cells.length; j++) {
                        cell = currentSheetRow.cells[j];
                        cell.style.backgroundColor = color;
                    }
                    checkStatusArray[currentSheetRow.rowIndex] = CurrentReviewTableRow.cells[2].innerHTML;
                    break;
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
            // 0 index jsGrid header table
            var columnHeaders = containerChildren[0].getElementsByTagName("th");
            //1 index jsGrid table body
            var sheetDataTable = containerChildren[1].getElementsByTagName("table")[0];
            var sourceDataViewTableRows = sheetDataTable.getElementsByTagName("tr");
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
            for (var i = 0; i < sourceDataViewTableRows.length; i++) {
                currentRowInSourceTable = sourceDataViewTableRows[i];

                var componentName;
                if (column.Name !== undefined) {
                    componentName = currentRowInSourceTable.cells[column.Name].innerText;
                }
                else if (column.Tagnumber !== undefined) {
                    componentName = currentRowInSourceTable.cells[column.Tagnumber].innerText;
                }
                if (CurrentReviewTableRow.cells[0].innerText === componentName ||
                    CurrentReviewTableRow.cells[1].innerText === componentName) {
                    if (containerId === "viewerContainer1") {
                        if (this.SelectedComponentRowFromSheetA) {
                            this.unhighlightSelectedSheetRow(this.checkStatusArrayA, this.SelectedComponentRowFromSheetA);
                        }

                        this.SelectedComponentRowFromSheetA = currentRowInSourceTable;

                        this.ChangeBackgroundColor(this.SelectedComponentRowFromSheetA);

                        var sheetDataTable1 = containerChildren[1].getElementsByTagName("table")[0];
                        sheetDataTable1.focus();
                        sheetDataTable1.parentNode.parentNode.scrollTop = currentRowInSourceTable.offsetTop - currentRowInSourceTable.offsetHeight;
                    }
                    if (containerId === "viewerContainer2") {

                        if (this.SelectedComponentRowFromSheetB) {
                            this.unhighlightSelectedSheetRow(this.checkStatusArrayB, this.SelectedComponentRowFromSheetB);
                        }

                        this.SelectedComponentRowFromSheetB = currentRowInSourceTable;

                        this.ChangeBackgroundColor(this.SelectedComponentRowFromSheetB);

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

    ComparisonReviewManager.prototype.unhighlightSelectedSheetRow = function (checkStatusArray, currentRow) {
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

    ComparisonReviewManager.prototype.populateDetailedReviewTable = function (row) {

        var parentTable = document.getElementById("ComparisonDetailedReviewCell");
        parentTable.innerHTML = '';

        var reviewTableId = this.getReviewTableId(row);

        var tableData = [];
        var columnHeaders = [];

        var componentId =  Number(row.cells[5].innerText)
        var groupId =  Number(row.cells[6].innerText)
        for (var componentsGroupID in this.ComparisonCheckManager) {

            // get the componentgroupd corresponding to selected component 
            var componentsGroupList = this.ComparisonCheckManager[componentsGroupID];
        
            if(componentsGroupList && componentsGroupID != "restore") {
            var component = componentsGroupList[groupId].CheckComponents[componentId];

                var div = document.createElement("DIV");
                parentTable.appendChild(div);

                div.innerHTML = "Check Details :";
                div.style.fontSize = "20px";
                div.style.fontWeight = "bold";

                for (var i = 0; i < 5; i++) {
                    columnHeader = {};
                    var title;
                    if (i === 0) {
                        title = "Property";
                        name = "A_Property";
                    }
                    else if (i === 1) {
                        title = "Value";
                        name = "A_Value";
                    }
                    else if (i === 2) {
                        title = "Value";
                        name = "B_Value";
                    }
                    else if (i === 3) {
                        title = "Property";
                        name = "B_Property";
                    }
                    else if (i === 4) {
                        title = "Status";
                        name = "Status";
                    }

                    columnHeader["title"] = title;
                    columnHeader["name"] = name;
                    columnHeader["type"] = "textarea";
                    columnHeader["width"] = "27";
                    columnHeader["filtering"] = "true";
                    columnHeaders.push(columnHeader);
                }

                // show component class name as property in detailed review table    

                var property;

                for (var propertyId in component.properties) {
                    property = component.properties[propertyId];
                    tableRowContent = this.addPropertyRowToDetailedTable(property, columnHeaders);

                    this.detailedReviewRowComments[Object.keys(this.detailedReviewRowComments).length] = property.Description;

                    tableData.push(tableRowContent);
                }

                var id = "#ComparisonDetailedReviewCell";
                this.LoadDetailedReviewTableData(this, columnHeaders, tableData, id);
                this.highlightDetailedReviewTableFromCheckStatus("ComparisonDetailedReviewCell")

                var modelBrowserData = document.getElementById("ComparisonDetailedReviewCell");

                var modelBrowserHeaderTable = modelBrowserData.children[jsGridHeaderTableIndex];
                modelBrowserHeaderTable.style.position = "fixed"
                modelBrowserHeaderTable.style.width = "565px";
                modelBrowserHeaderTable.style.backgroundColor = "white";
                modelBrowserHeaderTable.style.overflowX = "hide";
                var modelBrowserHeaderTableRows = modelBrowserHeaderTable.getElementsByTagName("tr");
                for (var j = 0; j < modelBrowserHeaderTableRows.length; j++) {
                    var currentRow = modelBrowserHeaderTableRows[j];
                    for (var i = 0; i < currentRow.cells.length; i++) {
                        if (i === 5 || i === 6 || i === 7) {
                            currentRow.cells[i].style.display = "none";
                        }

                    }
                }

                // jsGridHeaderTableIndex = 0 
                // jsGridTbodyTableIndex = 1
                var modelBrowserDataTable = modelBrowserData.children[jsGridTbodyTableIndex]
                modelBrowserDataTable.style.position = "static"
                modelBrowserDataTable.style.width = "579px";
                modelBrowserDataTable.style.margin = "52px 0px 0px 0px"
            }
        }
    }

    ComparisonReviewManager.prototype.highlightDetailedReviewTableFromCheckStatus = function (containerId) {
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

        // var mainReviewTableRows = mainReviewTable.getElementsByTagName("tr");

        for (var i = 0; i < detailedReviewTableRows.length; i++) {
            var currentRow = detailedReviewTableRows[i];
            if (currentRow.cells.length > 1) {
                var status = currentRow.cells[4].innerHTML;
                var color = this.getRowHighlightColor(status);
                for (var j = 0; j < currentRow.cells.length; j++) {
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
        tableRowContent[columnHeaders[4].name] = property.Severity;

        if(property.transpose == 'lefttoright' && property.Severity !== 'No Value') {
            tableRowContent[columnHeaders[4].name]= 'OK(T)';
            tableRowContent[columnHeaders[2].name] = property.SourceAValue;
        }
        else if(property.transpose == 'righttoleft' && property.Severity !== 'No Value') {
            tableRowContent[columnHeaders[4].name] = 'OK(T)';
            tableRowContent[columnHeaders[1].name] = property.SourceBValue;
        }
        // if (property.PerformCheck &&
        //     property.Result) {
        //     tableRowContent[columnHeaders[4].name] = "OK";
        // }
        // else {
            
        // }
        return tableRowContent;
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
        else if(status.toLowerCase() === ("MATCHED").toLowerCase()) {
            return MatchedColor;
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
        else if (status.toLowerCase() === ("Accepted").toLowerCase() || status.toLowerCase() === ("Accepted(T)").toLowerCase()) {
            return AcceptedColor;
        }
        else if (status.toLowerCase() === ("Error(A)").toLowerCase() || status.toLowerCase() === ("Warning(A)").toLowerCase() 
        || status.toLowerCase() === ("No Match(A)").toLowerCase() || status.toLowerCase() === ("No Value(A)").toLowerCase()) {
            return PropertyAcceptedColor;
        }
        else if(status.toLowerCase() === ("Error(T)").toLowerCase() || status.toLowerCase() === ("Warning(T)").toLowerCase()) {
            return PropertyAcceptedColor;
        }
        else if(status.toLowerCase() === ("OK(A)(T)").toLowerCase() || status.toLowerCase() === ("OK(T)(A)").toLowerCase()) {
            return AcceptedColor;
        }
        else if(status.includes("(A)(T)") || status.includes("(T)(A)")) {
            return PropertyAcceptedColor;
        }
        else if(status.toLowerCase() === ("OK(T)").toLowerCase() || status.toLowerCase() === ("OK(A)").toLowerCase()) {
            return AcceptedColor;
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