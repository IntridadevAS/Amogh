var XLSX;
if (typeof (require) !== 'undefined') {
    XLSX = require('xlsx');
}

class SourceMapping {
    constructor() {
        this.Name;
        this.Sources = {};
        this.AttributeLibrary = {};
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
        if (child.tagName.toLowerCase() != "select") {
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
        ".SLDASM", ".DWG", ".SLDPRT",
        ".RVT", ".RFA", ".IFC", ".STEP",
        ".JSON", ".IGS", "STE", "STP"];

    for (var i = 0; i < sourceTypes.length; i++) {
        var option = document.createElement("option");
        option.innerText = sourceTypes[i];
        sourceSelect.appendChild(option);
    }

    sourceSelect.value = sourceTypes[0];

    return sourceSelect;
}

function getValidSourceTypes() {
    var validSourceTypes = [];
    var linkSourceTypesDiv = document.getElementById("linkSourceTypesDiv");
    for (var i = 0; i < linkSourceTypesDiv.children.length; i++) {

        var child = linkSourceTypesDiv.children[i];
        if (child.tagName.toLowerCase() != "select") {
            continue;
        }

        if (child.value === undefined ||
            child.value === "") {
            continue;
        }

        var sourceMappingName = child.value;
        for (var key in sourceMappings) {
            var sourceMapping = sourceMappings[key];
            if (sourceMapping.Name != sourceMappingName) {
                continue;
            }

            for (var type in sourceMapping.Sources) {

                var sourceType = sourceMapping.Sources[type];
                var result = sourceType.replace(".", "");
                if (!validSourceTypes.includes(result.toLowerCase())) {
                    validSourceTypes.push(result.toLowerCase());
                }

                if (!validSourceTypes.includes(result.toUpperCase())) {
                    validSourceTypes.push(result.toUpperCase());
                }
            }
        }
    }

    return validSourceTypes;
}

function uploadDataSet(event) {

    // get valid source types
    var validSourceTypes = getValidSourceTypes();
    if (!validSourceTypes ||
        validSourceTypes.length === 0) {
        alert("Please select data source mapping with valid source types.");
        document.getElementById("uploadDataSetForm").reset();
        return;
    }

    var path = document.getElementById("loadSourceInput").value;
    var inputSourceType = path.split('.').pop();
    if (!validSourceTypes.includes(inputSourceType.toLowerCase())) {
        alert("Please select data source mapping with valid source types.");
        document.getElementById("uploadDataSetForm").reset();
        return;
    }

    if (inputSourceType.toLowerCase() === 'xls') {
        var file = event.target.files[0];   
        extractXLSAttributeData(file);

        // readXLSAttributeData(file).then(function(attributes){

        //     dataSetAttributes[file.name] = attributes;

        //     // add data source name to loadedDataSetSelect
        //     var loadedDataSetSelect = document.getElementById("loadedDataSetSelect");
        //     var option = document.createElement("option");
        //     option.innerText = file.name;
        //     loadedDataSetSelect.appendChild(option);
    
        //     document.getElementById("uploadDataSetForm").reset();
        // });      
    }
    else {

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "PHP/UploadAndProcessDataSet.php", true);
        xhr.onload = function (result) {
            document.getElementById("uploadDataSetForm").reset();

            if (result.target.response === "fail") {
                alert("Failed to upload data source.");
                return;
            }

            var attributes = JSON.parse(result.target.response);

            for (var fileName in attributes) {
                dataSetAttributes[fileName] = JSON.parse(attributes[fileName]);

                // add data source name to loadedDataSetSelect
                var loadedDataSetSelect = document.getElementById("loadedDataSetSelect");
                var option = document.createElement("option");
                option.innerText = fileName;
                loadedDataSetSelect.appendChild(option);
                break;
            }
        };

        var formData = new FormData(document.getElementById("uploadDataSetForm"));
        formData.append('Operation', "ExportAttributes");
        formData.append('ValidSourceTypes', JSON.stringify(validSourceTypes));
        xhr.send(formData);
    }
}

function extractXLSAttributeData(file) {
    readXLSAttributeData(file).then(function (attributes) {

        dataSetAttributes[file.name] = attributes;

        // add data source name to loadedDataSetSelect
        var loadedDataSetSelect = document.getElementById("loadedDataSetSelect");
        var option = document.createElement("option");
        option.innerText = file.name;
        loadedDataSetSelect.appendChild(option);

        document.getElementById("uploadDataSetForm").reset();
    });      
}

function onUpdateSourceLibrary() {
    var loadedDataSetSelect = document.getElementById("loadedDataSetSelect");
    var dataSetName = loadedDataSetSelect.value;
    if (!(dataSetName in dataSetAttributes)) {
        return;
    }

    var inputSourceType = dataSetName.split('.').pop();
    inputSourceType = inputSourceType.toLowerCase();
    // get attributes
    var attributes = undefined;
    if (inputSourceType === "xls") {
        attributeCollection = Object.values(dataSetAttributes[dataSetName]);
        var index = 0;
        attributes = {};
        for(var key in attributeCollection)
        {
            for(var componentKey in attributeCollection[key])
            {
                var componentValue = attributeCollection[key][componentKey];
                attributes[index] = componentValue;
                index++;
            }
        }
    }
    else {
        attributes = dataSetAttributes[dataSetName];
    }
    if (!attributes) {
        return;
    }

    var linkSourceTypesDiv = document.getElementById("linkSourceTypesDiv");
    for (var i = 0; i < linkSourceTypesDiv.children.length; i++) {

        var child = linkSourceTypesDiv.children[i];
        if (child.tagName.toLowerCase() != "select") {
            continue;
        }

        var sourceMappingName = child.value;
        for (var key in sourceMappings) {
            var sourceMapping = sourceMappings[key];
            if (sourceMapping.Name != sourceMappingName) {
                continue;
            }

            // check if source type exists in sourceMapping
            var typeExists = false;
            for (var type in sourceMapping.Sources) {
                var sourceType = sourceMapping.Sources[type];
                if (sourceType.toLowerCase() === "." + inputSourceType) {
                    typeExists = true;
                    break;
                }
            }
            if (!typeExists) {
                continue;
            }

            var sourceAttributeLibrary = {};
            if (inputSourceType in sourceMapping.AttributeLibrary) {
                sourceAttributeLibrary = sourceMapping.AttributeLibrary[inputSourceType]
            }
            else {
                sourceMapping.AttributeLibrary[inputSourceType] = {};
            }

            // update source mapping with attributes
            for (var attributeKey in attributes) {
                var attributeList = attributes[attributeKey];
                for (var attributeName in attributeList) {

                    var attributeValue = attributeList[attributeName];

                    if (attributeName in sourceAttributeLibrary) {
                        if (!sourceAttributeLibrary[attributeName].includes(attributeValue)) {
                            sourceAttributeLibrary[attributeName].push(attributeValue);
                        }
                    }
                    else {
                        sourceAttributeLibrary[attributeName] = [attributeValue];
                    }
                }
            }

            sourceMapping.AttributeLibrary[inputSourceType] = sourceAttributeLibrary;

            alert('"' + sourceMapping.Name + '" : "' + inputSourceType + ' source library updated.')
        }
    }
}

function readXLSAttributeData(file) {
    return new Promise((resolve) => {
        if (file) {
            var reader = new FileReader();
            reader.onload = function (readerEvt) {
                var data = readerEvt.target.result;
                data = new Uint8Array(data);
                var result = processWorkBook(XLSX.read(data, { type: 'array' }));
                return resolve(result);
            };
            reader.readAsArrayBuffer(file);
        }
    });
}

function processWorkBook(wb) {
    this.WB = wb;
    this.attributes = {};

    wb.SheetNames.forEach(function (sheetName) {
        var sheetData = readSheetData(WB.Sheets[sheetName], sheetName);
        if (sheetData) {
            attributes[sheetName] = sheetData;
        }
    });

    return this.attributes;
};

function readSheetData(sheet, sheetName) {

    var excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (excelData.length === 0) {
        return undefined;
    }

    var formattedData = formatData(excelData);
    var sheetData = [];   

    // data rows
    for (var i = 0; i < formattedData.length; i++) {
        var row = formattedData[i];

        var rowData = {};    
        for (var key in row) {
            if (key === undefined ||
                key === "" ||
                key === "undefined") {
                continue;
            }

            var value = row[key];
            if (value === undefined) {
                value = "";
            }
            rowData[key] = value;
        }
        rowData["MainComponentClass"] = sheetName;
        sheetData.push(rowData);
    }

    return sheetData;
}

function formatData(exceldata) {
    var excelDataArray = [];
    var key;
    var obj;
    for (var i = 0; i < exceldata.length; i++) {
        let len = exceldata[i].length;
        if (exceldata[i][0] != null && key == null && obj == undefined) {
            key = exceldata[i];
            obj = new Object(key);
            var id = 0;
        }
        else if (exceldata[i][0] == null) {
            exceldata.splice(i, 1);
            i--;
        }
    }
    var i;
    for (i = 1; i < exceldata.length; i++) {
        var a = {};
        for (let j = 0; j < obj.length; j++) {
            a[obj[j]] = exceldata[i][j];
        }
        excelDataArray.push(a);
    }
    return excelDataArray;

}