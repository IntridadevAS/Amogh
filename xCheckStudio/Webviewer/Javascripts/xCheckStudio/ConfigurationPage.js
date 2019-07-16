var sourceMappings;
var dataSetAttributes = {};
window.onload = function () {

    // alert("COnfiguration page loaed");
    var generalTab = document.getElementById("generalTab");
    generalTab.onclick = function () {
        onGeneralTabClicked();
    }

    var dataSourceTypeTab = document.getElementById("dataSourceTypeTab");
    dataSourceTypeTab.onclick = function () {
        onDataSourceTypeTabClicked();
    }

    var markupColorsTab = document.getElementById("markupColorsTab");
    markupColorsTab.onclick = function () {
        onMarkupColorsTabClicked();
    }

    var checkRulesTab = document.getElementById("checkRulesTab");
    checkRulesTab.onclick = function () {
        onCheckRulesTabClicked();
    }

    var checkCasesTab = document.getElementById("checkCasesTab");
    checkCasesTab.onclick = function () {
        onCheckCasesTabClicked();
    }
}

function onGeneralTabClicked() {
    openTabContentPage(this, "generalTabContent");
}

function onDataSourceTypeTabClicked() {
    openTabContentPage(this, "dataSourceTypeTabContent");

    populateSourceMappingTable();

    // create link source types select control
    var linkSourceTypesDiv = document.getElementById("linkSourceTypesDiv");
    linkSourceTypesDiv.innerHTML = "";
    var linkSourceTypeSelect = document.createElement("select");
    linkSourceTypeSelect.style.width = "200px";
    linkSourceTypeSelect.onchange = function () {
    }
    linkSourceTypesDiv.appendChild(linkSourceTypeSelect);

    // add new source mapping
    var addMappingButton = document.getElementById("addMappingButton");
    addMappingButton.onclick = function () {
        var tableRowContent = getNewSourceMappingRow();

        $("#sourceMappingDiv").jsGrid("insertItem", tableRowContent).done(function () {
            //console.log("insertion completed");

            // create source mapping object for current row

            //get source mapping table rows         
            var tableRows = getSourceMappingTableRows();

            // in sourceMappings index is row number within table
            const sourceMapping = new SourceMapping();
            sourceMappings[tableRows.length - 1] = sourceMapping;
        });
    }

    // update source library button clicked
    var updateDataSourceLibraryButton = document.getElementById("updateDataSourceLibraryButton");
    updateDataSourceLibraryButton.onclick = function () {
        onUpdateSourceLibrary();
    }

    // add link source type button
    var addLinkSourceTypeButton = document.getElementById("addLinkSourceTypeButton");
    addLinkSourceTypeButton.onclick = function () {
        var linkSourceTypesDiv = document.getElementById("linkSourceTypesDiv");
        var linkSourceTypeSelect = document.createElement("select");
        linkSourceTypeSelect.style.width = "200px";
        linkSourceTypesDiv.appendChild(linkSourceTypeSelect)

        for (var key in sourceMappings) {
            var sourceMapping = sourceMappings[key];
            if (sourceMapping.Name != undefined) {
                var option = document.createElement("option");
                option.innerText = sourceMapping.Name;
                linkSourceTypeSelect.appendChild(option);
            }
        }
    }
}


function getSourceMappingTableRows() {
    //get source mapping table div
    var sourceMappingDiv = document.getElementById("sourceMappingDiv");
    var tableBody = sourceMappingDiv.getElementsByClassName("jsgrid-grid-body")[0];
    var tableRows = tableBody.getElementsByTagName("TR");

    return tableRows;
}

function populateSourceMappingTable() {

    sourceMappings = {};
    var headers = createSourceMappingTableHeaders();

    var tableRowContent = getNewSourceMappingRow();
    var tableData = [];
    tableData.push(tableRowContent);

    // create source mapping object for current row
    // in sourceMappings index is row number within table
    const sourceMapping = new SourceMapping();
    sourceMappings[0] = sourceMapping;

    $("#sourceMappingDiv").jsGrid({
        width: "100%",
        height: "40%",
        filtering: false,
        sorting: false,
        autoload: false,
        data: tableData,
        fields: headers,
        margin: "5px",
        editing: true,
        // checked: true,
        onRefreshed: function (config) {

        },
        onDataLoaded: function (args) {

        },
        rowClick: function (args) {

        },
        onError: function (args) {

        }
    });
}

function createSourceMappingTableHeaders() {
    var headers = [];

    //create header for table
    var columnHeader = {};
    columnHeader["title"] = "Mapping Name";
    columnHeader["name"] = "mappingName";
    columnHeader["type"] = "text";
    columnHeader["width"] = "20%";
    headers.push(columnHeader);

    columnHeader = {};
    columnHeader["title"] = "Source A";
    columnHeader["name"] = "sourceA";
    columnHeader["type"] = "text";
    columnHeader["width"] = "18.75%";
    headers.push(columnHeader);

    columnHeader = {};
    columnHeader["title"] = "Source B";
    columnHeader["name"] = "sourceB";
    columnHeader["type"] = "text";
    columnHeader["width"] = "18.75%";
    headers.push(columnHeader);

    columnHeader = {};
    columnHeader["title"] = "Source C";
    columnHeader["name"] = "sourceC";
    columnHeader["type"] = "text";
    columnHeader["width"] = "18.75%";
    headers.push(columnHeader);

    columnHeader = {};
    columnHeader["title"] = "Source D";
    columnHeader["name"] = "sourceD";
    columnHeader["type"] = "text";
    columnHeader["width"] = "18.75%";
    headers.push(columnHeader);

    columnHeader = {};
    columnHeader["title"] = "";
    columnHeader["name"] = "add";
    columnHeader["type"] = "text";
    columnHeader["width"] = "5%";
    headers.push(columnHeader);

    return headers;
}

function onSourceMappingNameChanged(mappingRow, value) {
    // get source mapping object and update
    var sourceMapping = sourceMappings[mappingRow.rowIndex];
    sourceMapping.Name = value;

    // add mapping name to sourceMappingSelect
    var linkSourceTypesDiv = document.getElementById("linkSourceTypesDiv");
    for (var i = 0; i < linkSourceTypesDiv.children.length; i++) {
        var child = linkSourceTypesDiv.children[i];
        if(child.tagName.toLowerCase() != "select")
        {
            continue;
        }

        var option = document.createElement("option");
        option.innerText = value;
        child.appendChild(option);
    }   
}

function onSourceAChanged(mappingRow, value) {
    // get source mapping object and update
    var sourceMapping = sourceMappings[mappingRow.rowIndex];
    sourceMapping.Sources["sourceA"] = value;
}

function onSourceBChanged(mappingRow, value) {
    // get source mapping object and update
    var sourceMapping = sourceMappings[mappingRow.rowIndex];
    sourceMapping.Sources["sourceB"] = value;
}

function onSourceCChanged(mappingRow, value) {
    // get source mapping object and update
    var sourceMapping = sourceMappings[mappingRow.rowIndex];
    sourceMapping.Sources["sourceC"] = value;
}

function onSourceDChanged(mappingRow, value) {
    // get source mapping object and update
    var sourceMapping = sourceMappings[mappingRow.rowIndex];
    sourceMapping.Sources["sourceD"] = value;
}

function onAddSourceTypeClicked(mappingRow) {
    // check if 2 data sources are selected
    // get source mapping object and update
    var sourceMapping = sourceMappings[mappingRow.rowIndex];
    if (!('sourceA' in sourceMapping.Sources) ||
        !('sourceB' in sourceMapping.Sources)) {
        alert("Please select Source A and Source B types before you add Source C.");
        return;
    }

    var sourceCCell = mappingRow.children[3];

    if (sourceCCell.children[0].disabled) {
        sourceCCell.children[0].disabled = false;
        return;
    }

    // check if source c is selected before adding source D
    if (!('sourceC' in sourceMapping.Sources)) {
        alert("Please select Source A, Source B and Source C types before you add Source D.");
        return;
    }

    var sourceDCell = mappingRow.children[4];
    if (sourceDCell.children[0].disabled) {
        sourceDCell.children[0].disabled = false;
    }
}

function getNewSourceMappingRow() {
    // data row
    tableRowContent = {};

    // name field
    var nameInput = document.createElement("INPUT");
    nameInput.setAttribute("type", "text");
    nameInput.classList.add("inputTextCell");
    nameInput.onchange = function () {
        var mappingRow = this.parentElement.parentElement;

        onSourceMappingNameChanged(mappingRow, this.value);
    }
    tableRowContent["mappingName"] = nameInput;

    // source a field
    var sourceASelect = getSourceSelectElement();
    sourceASelect.onchange = function () {
        var mappingRow = this.parentElement.parentElement;

        onSourceAChanged(mappingRow, this.value);
    }
    tableRowContent["sourceA"] = sourceASelect;

    // source b field
    var sourceBSelect = getSourceSelectElement();
    sourceBSelect.onchange = function () {
        var mappingRow = this.parentElement.parentElement;

        onSourceBChanged(mappingRow, this.value);
    }
    tableRowContent["sourceB"] = sourceBSelect;

    // source c field
    var sourceCSelect = getSourceSelectElement();
    sourceCSelect.onchange = function () {
        var mappingRow = this.parentElement.parentElement;

        onSourceCChanged(mappingRow, this.value);
    }
    sourceCSelect.disabled = true;
    tableRowContent["sourceC"] = sourceCSelect;

    // source d field
    var sourceDSelect = getSourceSelectElement();
    sourceDSelect.onchange = function () {
        var mappingRow = this.parentElement.parentElement;

        onSourceDChanged(mappingRow, this.value);
    }
    sourceDSelect.disabled = true;
    tableRowContent["sourceD"] = sourceDSelect;

    // add source button
    var addSourceBtn = document.createElement("button");
    addSourceBtn.innerText = "+";
    addSourceBtn.onclick = function () {
        var mappingRow = this.parentElement.parentElement;

        onAddSourceTypeClicked(mappingRow);
    }
    tableRowContent["add"] = addSourceBtn;

    return tableRowContent;
}

function getSourceSelectElement() {
    var sourceSelect = document.createElement("select");

    var sourceTypes = ["", ".XML", ".RVM", ".XLS",
        ".SLDASM", ".DWG", ".SLDPRT", ".RVT", ".RFA", ".IFC", ".STEP", ".JSON", ".IGS"];

    for (var i = 0; i < sourceTypes.length; i++) {
        var option = document.createElement("option");
        option.innerText = sourceTypes[i];
        sourceSelect.appendChild(option);
    }

    sourceSelect.value = sourceTypes[0];

    return sourceSelect;
}

function onMarkupColorsTabClicked() {
    openTabContentPage(this, "markupColorsTabContent");
}

function onCheckRulesTabClicked() {
    openTabContentPage(this, "checkRulesTabContent");
}

function onCheckCasesTabClicked() {
    openTabContentPage(this, "checkCasesTabContent");
}

function openTabContentPage(inputElement, contentPage) {

    var tabContentPages = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabContentPages.length; i++) {
        tabContentPages[i].style.display = "none";
    }
    var tabButtons = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    document.getElementById(contentPage).style.display = "block";
    inputElement.className += " active";
}

function uploadDataSet() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "PHP/UploadAndProcessDataSet.php", true);
    xhr.onload = function (event) {
        var attributes = JSON.parse(event.target.response);
     
        for (var fileName in attributes) {
            dataSetAttributes[fileName] = JSON.parse(attributes[fileName]);

            // add data source name to loadedDataSetSelect
            var loadedDataSetSelect = document.getElementById("loadedDataSetSelect");
            var option = document.createElement("option");
            option.innerText = fileName;
            loadedDataSetSelect.appendChild(option);
            break;
        }

        document.getElementById("uploadDataSetForm").reset();
    };

    var formData = new FormData(document.getElementById("uploadDataSetForm"));
    //formData.append('Operation', "ConvertToSCS");
    formData.append('Operation', "ExportAttributes");
    xhr.send(formData);
}

function onUpdateSourceLibrary() {
    var loadedDataSetSelect = document.getElementById("loadedDataSetSelect");
    var dataSetName = loadedDataSetSelect.value;
    if (!(dataSetName in dataSetAttributes)) {
        return;
    }

    var inputSourceType = dataSetName.split('.').pop();

    var attributes = dataSetAttributes[dataSetName];
   
    var linkSourceTypesDiv = document.getElementById("linkSourceTypesDiv");
    for (var i = 0; i < linkSourceTypesDiv.children.length; i++) {

        var child = linkSourceTypesDiv.children[i];
        if(child.tagName.toLowerCase() != "select")
        {
            continue;
        }

        var sourceMappingName = child.value;
        for(var key in sourceMappings)
        {
            var sourceMapping = sourceMappings[key];
            if(sourceMapping.Name != sourceMappingName)
            {
                continue;
            }

            // check if source type exists in sourceMapping
            var typeExists = false;
            for (var type in sourceMapping.Sources) {
                var sourceType = sourceMapping.Sources[type];                
                if(sourceType.toLowerCase() === "."+inputSourceType.toLowerCase())
                {
                    typeExists = true;
                    break;
                }
            }
            if(!typeExists)
            {
                continue;
            }

            var sourceAttributeLibrary = {};
            if (inputSourceType in sourceMapping.AttributeLibrary) 
            {
                sourceAttributeLibrary = sourceMapping.AttributeLibrary[inputSourceType]
            }
            else
            {
                sourceMapping.AttributeLibrary[inputSourceType] = {};
            }

            // update source mapping with attributes
            for (var attributeKey in attributes) {
                var attributeList = attributes[attributeKey];
                for (var attributeName in attributeList) {

                    var attributeValue = attributeList[attributeName];

                    if (attributeName in sourceAttributeLibrary) 
                    {
                        if(!sourceAttributeLibrary[attributeName].includes(attributeValue))
                        {
                            sourceAttributeLibrary[attributeName].push(attributeValue);
                        }
                    }
                    else 
                    {
                        sourceAttributeLibrary[attributeName] = [attributeValue];
                    }
                }
            }  
        
            sourceMapping.AttributeLibrary[inputSourceType] = sourceAttributeLibrary;
            
            alert('"'+ sourceMapping.Name +'" : "' + inputSourceType +' source library updated.' )
        }
    }
}