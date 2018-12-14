// // var XLSX = require('xlsx');

function ExcelReader(sourceType) {
    this.SourceType = sourceType;

    this.global_wb = "";
    this.containerId = "";
    this.sourceProperties = [];
    this.sourceDataSheet = {};
    
    this.excelModelBrowser = new ExcelModeBrowser();
}

ExcelReader.prototype.ReadFileData = function (file, containerId) {
    // removeAllOptions(dynamic_select);
    this.containerId = containerId;
    //var files = event.target.files;
    //var file = files[0];
    if (file) {
        var reader = new FileReader();
        var _this = this;
        reader.onload = function (readerEvt) {
            var data = readerEvt.target.result;
            data = new Uint8Array(data);
            _this.process_wb(XLSX.read(data, { type: 'array' }), containerId);
        };
        reader.readAsArrayBuffer(file);
    }
}

ExcelReader.prototype.process_wb = function (wb, containerId) {
    var _this = this;
    this.global_wb = wb;

    wb.SheetNames.forEach(function (sheetName) {
        _this.ReadSheetData(sheetName);
    });

    
    //add model Browser Table
    this.excelModelBrowser.createModelBrowserComponent(this.sourceDataSheet, containerId);
    
    // var sheetData = this.sourceDataSheet;
    // for (var sheetName in sheetData) {
    //     mainComponentClass = sheetName;
    //     var mainComponentClassData = sheetData[sheetName];
    //     for (var subcomponentClass in mainComponentClassData) {
    //         var subComponentClassData = mainComponentClassData[subcomponentClass];
    //         for (var i = 0; i < subComponentClassData.length; i++) {
    //             this.sourceProperties.push(subComponentClassData[i]);
    //         }
    //     }
    // }
};

ExcelReader.prototype.ChangeBackgroundColor = function (row) {
    row.style.backgroundColor = "#9999ff";
}

ExcelReader.prototype.RestoreBackgroundColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}

ExcelReader.prototype.ReadSheetData = function (sheetName) {
    if (this.containerId === "modelTree1") {
        formattedExcelData = this.getSheetData(sheetName);
    }
    else if (this.containerId === "modelTree2") {
        formattedExcelData = this.getSheetData(sheetName);
    }
    var sourcePropertiesTemp = {};
    for (var i = 0; i < formattedExcelData.length; i++) {
        var row = formattedExcelData[i];
        var name = row.Name;
        var mainComponentClass = sheetName;
        var subComponentClass = row.Class;
        var source = "";
        var destination = "";
        var ownerId = "";
        var nodeId = "";

        // create generic properties object
        var genericPropertiesObject = new GenericProperties(name,
            mainComponentClass,
            subComponentClass,
            source,
            destination,
            ownerId,
            nodeId);

        // add component class as generic property
        var componentClassPropertyObject = new GenericProperty("ComponentClass", "String", subComponentClass);
        genericPropertiesObject.addProperty(componentClassPropertyObject);

        // iterate node properties and add to generic properties object
        for (var key in row) {
            var genericPropertyObject = new GenericProperty(key, "String", row[key]);
            genericPropertiesObject.addProperty(genericPropertyObject);
        }

        // add genericProperties object to sourceproperties collection
        if (subComponentClass in sourcePropertiesTemp) {
            sourcePropertiesTemp[subComponentClass].push(genericPropertiesObject);
        }
        else {
            sourcePropertiesTemp[subComponentClass] = [genericPropertiesObject];
        }

        this.sourceProperties.push(genericPropertiesObject)
    }
    this.sourceDataSheet[sheetName] = sourcePropertiesTemp;
}

ExcelReader.prototype.getSheetData = function (sheetName) {
    var result = {};
    var roa = XLSX.utils.sheet_to_json(this.global_wb.Sheets[sheetName], { header: 1 });
    if (roa.length) result[sheetName] = roa;
    exceldata = roa;
    window.datatbl = exceldata;
    Object.keys(exceldata);
    arrayExcelData = exceldata;
    formattedExcelData = this.formatData(exceldata);
    return formattedExcelData;
}

ExcelReader.prototype.formatData = function (exceldata) {
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
