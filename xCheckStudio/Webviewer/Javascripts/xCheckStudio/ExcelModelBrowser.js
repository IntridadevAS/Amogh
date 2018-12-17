function ExcelModeBrowser() {

    this.sourceDataSheets = {};
    this.containerId;
    this.NodeGroups = [];
    this.SelectedComponentRow;
    this.SelectedComponentRowFromSheet;
    this.selectedCompoents = [];

    ExcelModeBrowser.prototype.createModelBrowserComponent = function (sheetsData, containerId) {
        this.conatinerId = containerId;
        this.sourceDataSheets = sheetsData;
        if (sheetsData !== null) {
            var _this = this;

            // get container element Id 
            var containerElement = document.getElementById(this.conatinerId);

            // create div element to hold model browser 
            var tableDiv = document.createElement("div");
            tableDiv.className = "scrollable";
            tableDiv.style.width = "700px";
            tableDiv.style.height = "620px";
            containerElement.appendChild(tableDiv);

            // create model browser table
            _this.ModelBrowserTable = document.createElement("Table");
            _this.ModelBrowserTable.style.width = "700px";
            _this.ModelBrowserTable.style.margin = "0%";
            tableDiv.appendChild(_this.ModelBrowserTable);

            //create header for table
            tableHeading = document.createElement("tr");
            tableHeading.style.backgroundColor = "#3498db";

            var td = document.createElement("td");
            td.innerHTML = "";
            td.style.fontSize = "14px";
            tableHeading.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = "Name";
            td.style.fontSize = "14px";
            tableHeading.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = "Category";
            td.style.fontSize = "14px";
            tableHeading.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = "Component Class";
            td.style.fontSize = "14px";
            tableHeading.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = "Description";
            td.style.fontSize = "14px";
            tableHeading.appendChild(td);

            this.ModelBrowserTable.appendChild(tableHeading);

            //add each sheet to model browser 
            // iterate over sheets from excel file
            for (var sheet in this.sourceDataSheets) {
                var mainComponentClass = sheet;
                var mainComponentStyleClass = mainComponentClass + "_" + this.conatinerId;
                var styleList = undefined;
                var componentStyleClass = this.getComponentstyleClass(mainComponentStyleClass);
                //set  row data 
                var rowData = [];
                rowData.push(mainComponentClass);
                rowData.push("");
                rowData.push("");
                rowData.push("");

                //add sheet names as 1st parent(collapsible row)
                // this.addComponentRow(styleList, componentStyleClass, rowData);
                var parentMainClassStyleList = componentStyleClass;

                //iterate over each component class in sheet
                for (var component in this.sourceDataSheets[mainComponentClass]) {
                    styleList = parentMainClassStyleList;
                    var subComponentClass = component;
                    var subComponentStyleClass = subComponentClass + "_" + this.conatinerId;
                    componentStyleClass = this.getComponentstyleClass(subComponentStyleClass);

                    //add component class as second level parent(collapsible row)
                    // this.addComponentRow(styleList, componentStyleClass, rowData);

                    //iterate over each component having same component class 
                    var children = this.sourceDataSheets[mainComponentClass][subComponentClass];
                    for (i = 0; i < children.length; i++) {
                        if (styleList !== undefined) {
                            styleList = styleList + " " + componentStyleClass;
                        }
                        else {
                            styleList = componentStyleClass;
                        }
                        var child = children[i];
                        var name = child.Name;
                        var rowData = [];
                        rowData.push(name);
                        rowData.push(mainComponentClass);
                        rowData.push(subComponentClass);
                        var description = "";
                        for (var j = 0; j < child.properties.length; j++) {
                            var childProperties = child.properties[j];
                            if (childProperties["Name"] === "Description") {
                                description = childProperties["Value"];
                                break;
                            }
                        }
                        rowData.push(description);

                        //add each component as child of component class
                        this.addComponentRow(styleList, "", rowData);
                    }
                }
            }

            for (var i = 0; i < _this.NodeGroups.length; i++) {
                this.CreateGroup(this.NodeGroups[i]);
            }

        }

    };

    ExcelModeBrowser.prototype.getComponentstyleClass = function (componentName) {
        var componentStyleClass = componentName.replace(" ", "");
        componentStyleClass = componentStyleClass.replace(":", "");
        componentStyleClass = componentStyleClass.replace(".", "");
        componentStyleClass = componentStyleClass.replace("/", "");
        while (this.NodeGroups.includes(componentStyleClass)) {
            componentStyleClass += "-" + this.revisedRandId();
        }
        return componentStyleClass;
    }

    ExcelModeBrowser.prototype.revisedRandId = function () {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
    }

    ExcelModeBrowser.prototype.addComponentRow = function (styleList, componentStyleClass, rowData) {
        var row = document.createElement("tr");
        row.style.backgroundColor = "#ffffff";
        if (styleList !== undefined) {
            row.classList = styleList;
        }

        var td = document.createElement("td");
        var checkBox = document.createElement("INPUT");
        checkBox.setAttribute("type", "checkbox");
        checkBox.checked = true;
        td.appendChild(checkBox);
        row.appendChild(td);

        // select component check box state change event
        checkBox.onchange = function () {
            _this.handleComponentCheck(this);
        }


        var td = document.createElement("td");
        td.innerHTML = rowData[0];
        if (componentStyleClass != "") {
            td.className = componentStyleClass;
        }
        td.style.fontSize = "13px";
        row.appendChild(td);

        var td = document.createElement("td");
        td.innerHTML = rowData[1];
        td.style.fontSize = "13px";
        row.appendChild(td);

        var td = document.createElement("td");
        td.innerHTML = rowData[2];
        td.style.fontSize = "13px";
        row.appendChild(td);

        var td = document.createElement("td");
        td.innerHTML = rowData[3];
        td.style.fontSize = "13px";
        row.appendChild(td);

        this.ModelBrowserTable.appendChild(row);

        // maintain track of selected components
        var checkedComponent = {
            'Name': row.cells[1].textContent,
            'Category': row.cells[2].textContent,
            'ComponentClass': row.cells[3].textContent,
            'Description': row.cells[4].textContent
        };
        this.selectedCompoents.push(checkedComponent);

        if (componentStyleClass != "") {
            if (this.NodeGroups.indexOf(componentStyleClass) === -1) {
                this.NodeGroups.push(componentStyleClass);
            }
        }

        // click event for each row
        var _this = this;
        row.onclick = function () {

            if (_this.SelectedComponentRow === this) {
                return;
            }

            if (_this.SelectedComponentRow) {
                _this.RestoreBackgroundColor(_this.SelectedComponentRow);
            }

            _this.BrowserItemClick(this);
            _this.SelectedComponentRow = this;


        };

        // row mouse hover event
        var createMouseHoverHandler = function (currentRow) {
            return function () {
                _this.ChangeBackgroundColor(currentRow);
            };
        };
        row.onmouseover = createMouseHoverHandler(row);

        // row mouse out event
        var createMouseOutHandler = function (currentRow) {
            return function () {
                if (_this.SelectedComponentRow !== currentRow) {
                    _this.RestoreBackgroundColor(currentRow);
                }
            };
        };
        row.onmouseout = createMouseOutHandler(row);
    }

    ExcelModeBrowser.prototype.selectedCompoentExists = function (componentRow) {
        for (var i = 0; i < this.selectedCompoents.length; i++) {
            var component = this.selectedCompoents[i];
            if (component['Name'] === componentRow.cells[1].textContent.trim() &&
                component['Category'] === componentRow.cells[2].textContent.trim() &&
                component['ComponentClass'] === componentRow.cells[3].textContent.trim() &&
                component['Description'] == componentRow.cells[4].textContent.trim() ) {
                return true;
            }
        }

        return false;
    }
    
    ExcelModeBrowser.prototype.isComponentSelected = function(componentProperties)
    {
        for (var i = 0; i < this.selectedCompoents.length; i++) {
            var component = this.selectedCompoents[i];
            if (component['Name'] ===componentProperties.Name &&
                component['Category'] === componentProperties.MainComponentClass &&
                component['ComponentClass'] === componentProperties.SubComponentClass)

                for(var j =0; j < componentProperties.properties.length; j++)
                {
                    if(componentProperties.properties[j].Name === "Description")
                    {
                        component['Description'] === componentProperties.properties[j].Value;
                        return true;
                    }
                }
                
                
            }              

        return false;
    }

    ExcelModeBrowser.prototype.removeFromselectedCompoents = function (componentRow) {
        for (var i = 0; i < this.selectedCompoents.length; i++) {
            var component = this.selectedCompoents[i];
            if (component['Name']  === componentRow.cells[1].textContent.trim() &&
                component['Category'] === componentRow.cells[2].textContent.trim() &&
                component['ComponentClass'] === componentRow.cells[3].textContent.trim() &&
                component['Description'] === componentRow.cells[4].textContent.trim()) {

                this.selectedCompoents.splice(i, 1);
                break;
            }
        }
    }

    ExcelModeBrowser.prototype.handleComponentCheck = function (currentCheckBox) {

        var currentCell = currentCheckBox.parentElement;
        if (currentCell.tagName.toLowerCase() !== 'td') {
            return;
        }

        var currentRow = currentCell.parentElement;
        if (currentRow.tagName.toLowerCase() !== 'tr' ||
            currentRow.cells.length < 2) {
            return;
        }

        // maintain track of selected/deselected components
        if (currentCheckBox.checked &&
            !this.selectedCompoentExists(currentRow)) {

            var checkedComponent = {
                'Name': currentRow.cells[1].textContent.trim(),
                'Category': currentRow.cells[2].textContent.trim(),
                'ComponentClass': currentRow.cells[3].textContent.trim(),
                'Description': currentRow.cells[4].textContent.trim()
            };

            this.selectedCompoents.push(checkedComponent);
        }
        else if (this.selectedCompoentExists(currentRow)) {
            this.removeFromselectedCompoents(currentRow);
        }

        var currentTable = currentRow.parentElement;
        if (currentTable.tagName.toLowerCase() !== 'table') {
            return;
        }

        var currentComponentCell = currentRow.cells[1];
        var currentRowStyle = currentComponentCell.className;

        //var currentClassList = currentRow.classList;
        var currentClassName = currentRow.className;
        var index = currentClassName.lastIndexOf(" ");

        // check/uncheck all child and further child rows
        var styleToCheck = currentClassName + " " + currentRowStyle;
        for (var i = 0; i < currentTable.rows.length; i++) {

            var row = currentTable.rows[i];
            if (row === currentRow) {
                continue;
            }

            if (row.className === styleToCheck) {

                var checkBox = row.cells[0].children[0];
                if (checkBox.checked === currentCheckBox.checked) {
                    continue;
                }

                checkBox.checked = currentCheckBox.checked;
                this.handleComponentCheck(checkBox);
            }
        }
    }

    ExcelModeBrowser.prototype.ChangeBackgroundColor = function (row) {
        row.style.backgroundColor = "#B2BABB";
    }

    ExcelModeBrowser.prototype.RestoreBackgroundColor = function (row) {
        row.style.backgroundColor = "#ffffff";
    }

    
    ExcelModeBrowser.prototype.LoadTableData = function(_this, gridName,columnHeaders, tableData, modelTree, viewerContainer ) {
        
        $(function() {
 
            $(viewerContainer).jsGrid({ 
                width: "780px" ,
                height: "620px",
                // filtering: true,
                // autosearch: true, 
                // sorting: true,  
                autoload: true,     
                data: tableData,
                fields: columnHeaders,
                margin: "0px",
                rowClick: function(args) { 
                    _this.HighlightRowInModelBrowser(args.event.currentTarget)
                }
            });
         
        });


        var container = document.getElementById(viewerContainer.replace("#", ""));
        container.style.width = "780px"
        container.style.height = "620px"
        container.style.overflowX = "scroll";
        container.style.overflowY = "scroll";
        container.style.margin = "0px"
    };

    ExcelModeBrowser.prototype.HighlightRowInModelBrowser = function (thisRow) {
        var viewerContainerData;
        if (this.conatinerId === "modelTree1") {
            viewerContainerData = document.getElementById("viewerContainer1")
        }
        else if (this.conatinerId === "modelTree2") {
            viewerContainerData = document.getElementById("viewerContainer2")
        }
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
            var modelBrowserData = document.getElementById(this.conatinerId);
            var modelBrowserRowsData = modelBrowserData.getElementsByTagName("tr");


            for (var i = 0; i < modelBrowserRowsData.length; i++) {
                rowData = modelBrowserRowsData[i];

                if (thisRow.cells[column.Name].innerText === rowData.cells[0].innerText &&
                    thisRow.cells[column.ComponentClass].innerText === rowData.cells[2].innerText &&
                    thisRow.cells[column.Description].innerText === rowData.cells[3].innerText) {
                    if (this.SelectedComponentRow === rowData) {
                        return;
                    }
        
                    if (this.SelectedComponentRow) {
                        this.RestoreBackgroundColor(_this.SelectedComponentRow);
                    }

                    this.ChangeBackgroundColor(rowData);
                    this.SelectedComponentRow = rowData;

                    if (this.SelectedComponentRowFromSheet) {
                        for (var j = 0; j < this.SelectedComponentRowFromSheet.cells.length; j++) {
                            cell = this.SelectedComponentRowFromSheet.cells[j];
                            cell.style.backgroundColor = "#ffffff"
                        }
                    }

                    for (var j = 0; j < thisRow.cells.length; j++) {
                        cell = thisRow.cells[j];
                        cell.style.backgroundColor = "#B2BABB"
                    }

                    this.SelectedComponentRowFromSheet = thisRow;


                }
            }
        }
    }

    ExcelModeBrowser.prototype.HighlightRowInSheetData = function (thisRow) {
        var viewerContainerData;
        if (this.conatinerId === "modelTree1") {
            viewerContainerData = document.getElementById("viewerContainer1")
        }
        else if (this.conatinerId === "modelTree2") {
            viewerContainerData = document.getElementById("viewerContainer2")
        }
        if (viewerContainerData != undefined) {
            var containerChildren = viewerContainerData.children;
            var columnHeaders = containerChildren[0].getElementsByTagName("th");
            var mainComponentClassDataTable = containerChildren[1].getElementsByTagName("tr");
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
            for (var i = 0; i < mainComponentClassDataTable.length; i++) {
                rowData = mainComponentClassDataTable[i];

                if (thisRow.cells[0].innerText === rowData.cells[column.Name].innerText &&
                    thisRow.cells[2].innerText === rowData.cells[column.ComponentClass].innerText &&
                    thisRow.cells[3].innerText === rowData.cells[column.Description].innerText) {
                    if (this.SelectedComponentRowFromSheet) {
                        for (var j = 0; j < this.SelectedComponentRowFromSheet.cells.length; j++) {
                            cell = this.SelectedComponentRowFromSheet.cells[j];
                            cell.style.backgroundColor = "#ffffff"
                        }
                    }

                    for (var j = 0; j < rowData.cells.length; j++) {
                        cell = rowData.cells[j];
                        cell.style.backgroundColor = "#B2BABB"
                    }

                    this.SelectedComponentRowFromSheet = rowData;


                }
            }
        }
    }

    ExcelModeBrowser.prototype.BrowserItemClick = function (browserRow) {

        var currentSheetName = browserRow.cells[0].innerText.trim();
        var mainComponentClasses = Object.keys(this.sourceDataSheets);

        if (mainComponentClasses.indexOf(currentSheetName) === -1) {
            currentSheetName = browserRow.cells[1].innerText.trim();
        }

        var viewerContainerData;
        if (this.conatinerId === "modelTree1") {
            viewerContainerData = document.getElementById("viewerContainer1")
        }
        else if (this.conatinerId === "modelTree2") {
            viewerContainerData = document.getElementById("viewerContainer2")
        }

        if (viewerContainerData.childElementCount > 1 && viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === currentSheetName) {
            this.HighlightRowInSheetData(browserRow);
            return;
        }
        
        var mainComponentClasseData = this.sourceDataSheets[currentSheetName];
        var properties = [];

        if (Object.keys(mainComponentClasseData).length > 0) {
            if (viewerContainerData.childElementCount > 1) {
                for (var subComponentClass in mainComponentClasseData) {
                    if (viewerContainerData.children[1].getElementsByTagName("td")[0].innerText === subComponentClass) {
                        this.HighlightRowInSheetData(browserRow);
                        return;
                    }
                }
            }
        }

        if (mainComponentClasseData !== {}) {
            if (browserRow.cells[1].innerText !== "" && browserRow.cells[2].innerText !== "") {
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
                    sheetProperties = mainComponentClasseData[browserRow.cells[2].innerText.trim()][0].properties;
                }
                var column = {};
                for (var i = 0; i < sheetProperties.length; i++) {
                    columnHeader = {};
                    // var temp = {};
                    // if(i === sheetProperties.length-1)
                    // {
                    //     temp["type"] = "control";
                    //     columnHeaders.push(temp);
                    // }
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


                if (this.conatinerId === "modelTree1") {
                    _this = this;
                    _this.LoadTableData(_this, currentSheetName, columnHeaders, tableData,  "modelTree1", "#viewerContainer1");
                    _this.HighlightRowInSheetData(browserRow);
                }
                else if (this.conatinerId === "modelTree2") {
                    _this = this;
                    _this.LoadTableData(_this, currentSheetName, columnHeaders, tableData, "modelTree2", "#viewerContainer2");
                    _this.HighlightRowInSheetData(browserRow);
                }

               
            }
        }
    };

    //to create collapsible table rows in model browser
    //https://jsfiddle.net/y4Mdy/1372/
    ExcelModeBrowser.prototype.CreateGroup = function (group_name) {
        var _this = this;
        // Create Button(Image)
        $('td.' + group_name).prepend("<img class='" + group_name + " button_closed'> ");
        // Add Padding to Data
        $('tr.' + group_name).each(function () {
            var first_td = $(this).children('td').first();
            var padding_left = parseInt($(first_td).css('padding-left'));
            $(first_td).css('padding-left', String(padding_left + 15) + 'px');
        });
        this.RestoreGroup(group_name);

        // Tie toggle function to the button
        $('img.' + group_name).click(function () {
            _this.ToggleGroup(group_name);
        });
    }

    //to create collapsible table rows in model browser
    //https://jsfiddle.net/y4Mdy/1372/
    ExcelModeBrowser.prototype.ToggleGroup = function (group_name) {
        this.ToggleButton($('img.' + group_name));
        this.RestoreGroup(group_name);
        if (this.containerId === "modelTree1") {
            var groupName = group_name.split("");
            var length = groupName.length;
            var temp = "";
            for (var i = 0; i < length; i++) {
                if (i < length - 1) {
                    temp += groupName[i];
                }
                else if (i == length - 1) {
                    temp += "2";
                }
            }
        }
        else if (this.containerId === "modelTree2") {
            var groupName = group_name.split("");
            var length = groupName.length;
            var temp = "";
            for (var i = 0; i < length; i++) {
                if (i < length - 1) {
                    temp += groupName[i];
                }
                else if (i == length - 1) {
                    temp += "1";
                }
            }
            this.ToggleButton($('img.' + temp));
            this.RestoreGroup(temp);
        }
    }

    ExcelModeBrowser.prototype.OpenGroup = function (group_name, child_groupName) {
        var _this = this;
        if ($('img.' + group_name).hasClass('button_open')) {
            // Open everything
            $('tr.' + group_name).show();

            // Close subgroups that been closed
            $('tr.' + group_name).find('img.button_closed').each(function () {
                if (sub_group_name != child_groupName) {
                    sub_group_name = $(this).attr('class').split(/\s+/)[0];
                    //console.log(sub_group_name);
                    _this.RestoreGroup(sub_group_name);
                }
            });
        }

        if ($('img.' + group_name).hasClass('button_closed')) {
            // Close everything
            $('tr.' + group_name).hide();
        }
    }

    //to create collapsible table rows in model browser
    //https://jsfiddle.net/y4Mdy/1372/
    ExcelModeBrowser.prototype.RestoreGroup = function (group_name) {
        var _this = this;
        if ($('img.' + group_name).hasClass('button_open')) {
            // Open everything
            $('tr.' + group_name).show();

            // Close subgroups that been closed
            $('tr.' + group_name).find('img.button_closed').each(function () {
                sub_group_name = $(this).attr('class').split(/\s+/)[0];
                //console.log(sub_group_name);
                _this.RestoreGroup(sub_group_name);
            });
        }

        if ($('img.' + group_name).hasClass('button_closed')) {
            // Close everything
            $('tr.' + group_name).hide();
        }
    }

    //to create collapsible table rows in model browser
    //https://jsfiddle.net/y4Mdy/1372/
    ExcelModeBrowser.prototype.ToggleButton = function (button) {
        $(button).toggleClass('button_open');
        $(button).toggleClass('button_closed');
    }

}
