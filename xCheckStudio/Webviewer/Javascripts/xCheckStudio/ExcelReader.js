var XLSX;
if (typeof (require) !== 'undefined') {
    XLSX = require('xlsx');
}

function ExcelReader() {

    this.SheetData = {};

    ExcelReader.prototype.ReadFileData = function (file, sourceType) {
        return new Promise((resolve) => {
            if (file) {

                var reader = new FileReader();
                var _this = this;
                reader.onload = function (readerEvt) {
                    var data = readerEvt.target.result;
                    data = new Uint8Array(data);
                    var sourceProperties = _this.ProcessWorkbook(XLSX.read(data, { type: 'array' }), sourceType);
                    return resolve(sourceProperties);
                };
                reader.readAsArrayBuffer(file);
            }
        });
    }

    ExcelReader.prototype.ProcessWorkbook = function (workbook, sourceType) {
        var _this = this;

        var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceType);
        if (identifierProperties === null) {
            return {};
        }

        var wb = workbook;
        var sourceProperties = {};
        workbook.SheetNames.forEach(function (sheetName) {
            var properties = _this.ReadSheetData(sheetName, wb.Sheets[sheetName], identifierProperties);          
            if (properties.length > 0) {
                for (var i = 0; i < properties.length; i++) {
                    properties[i]["ID"] = Object.keys(sourceProperties).length + 1;
                    sourceProperties[Object.keys(sourceProperties).length + 1] = properties[i];
                }
            }
        });

        return sourceProperties;
    }

    ExcelReader.prototype.ReadSheetData = function (sheetName, sheetData, identifierProperties) {
        // if (this.containerId === "modelTree1") {         
        var formattedExcelData = this.GetSheetData(sheetData);
        //}
        // else if (this.containerId === "modelTree2") {
        //     formattedExcelData = this.getSheetData(sheetName);
        // }
        var sourceProperties = [];
        // var sourcePropertiesTemp = {};      
        for (var i = 0; i < formattedExcelData.length; i++) {
            var row = formattedExcelData[i];
            // var name;
            // if (property.name.toLowerCase() === identifierProperties.name.toLowerCase()) {
            //     name = property.value;
            // }
            // if (row.Name !== undefined) {
            //     name = row.Name;
            // }
            // else if (row.Tagnumber !== undefined) {
            //     name = row.Tagnumber;
            // }

            // if (name === undefined) {
            //     continue;
            // }
            if (!identifierProperties.name in row) {
                continue;
            }
            let name = row[identifierProperties.name];
            if (!name) {
                continue;
            }

            // add main component class property to row item
            row[identifierProperties.mainCategory] = sheetName;

            let mainComponentClass = null;
            if (identifierProperties.mainCategory in row) {
                mainComponentClass = row[identifierProperties.mainCategory];
            }

            let subComponentClass = null;
            if (identifierProperties.subClass in row) {
                subComponentClass = row[identifierProperties.subClass];
            }

            // var mainComponentClass = sheetName;
            // var subComponentClass;          


            // if (row["Component Class"]) {
            //     subComponentClass = row["Component Class"];
            // }
            // else if (row["Component class"]) {
            //     subComponentClass = row["Component class"];
            // }
            // else if (row.Class) {
            //     subComponentClass = row.Class;
            // }

            // if (subComponentClass === undefined) {
            //     continue;
            // }

            // create generic properties object
            var compObject = new GenericComponent(
                name,
                mainComponentClass,
                subComponentClass);

            // // add component class as generic property
            // var componentClassPropertyObject = new GenericProperty("ComponentClass", "String", subComponentClass);
            // genericPropertiesObject.addProperty(componentClassPropertyObject);

            // iterate node properties and add to generic properties object
            for (var key in row) {
                var value = row[key];
                if (value === undefined) {
                    value = "";
                }
                var genericPropertyObject = new GenericProperty(key, "String", value);
                compObject.addProperty(genericPropertyObject);
            }

            // add genericProperties object to sourceproperties collection
            if (mainComponentClass &&
                mainComponentClass !== "" &&
                subComponentClass &&
                subComponentClass !== "") {
                if (!(mainComponentClass in this.SheetData)) {
                    this.SheetData[mainComponentClass] = {};
                }

                if (!(subComponentClass in this.SheetData[mainComponentClass])) {
                    this.SheetData[mainComponentClass][subComponentClass] = [];
                }

                this.SheetData[mainComponentClass][subComponentClass].push(compObject);
                sourceProperties.push(compObject);
            }
        }
        // if (Object.entries(sourcePropertiesTemp).length > 0 && sourcePropertiesTemp.constructor === Object) {
        //     this.SheetData[sheetName] = sourcePropertiesTemp;
        // }

        return sourceProperties;
    }

    ExcelReader.prototype.GetSheetData = function (sheetData) {
        var data = XLSX.utils.sheet_to_json(sheetData, { header: 1 });
        return this.FormatData(data);
    }

    ExcelReader.prototype.FormatData = function (exceldata) {
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

    ExcelReader.prototype.RestoreSheetData = function (classWiseComponents, sourceType) {
        var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceType);
        if (identifierProperties === null) {
            return {};
        }

        var sourceProperties = {};
        for (var mainClass in classWiseComponents) {

            var components = classWiseComponents[mainClass];

            for (var compId in components) {
                var component = components[compId];

                var componentObject = new GenericComponent();
                componentObject.ID = compId;

                let name = null;
                let mainComponentClass = mainClass;
                let subClass = null;
                for (var propId in component) {
                    var property = component[propId];
                    
                    let userDefined = false;
                    if (property.userDefined === "1") {
                        userDefined = true;
                    }
                    var genericPropertyObject = new GenericProperty(
                        property.name,
                        "String",
                        property.value,
                        userDefined
                    );
                    componentObject.addProperty(genericPropertyObject);

                    if (property.name === identifierProperties.name) {
                        name = property.value;
                    }
                    // else if (property.name === identifierProperties.mainCategory) {
                    //     mainComponentClass = null;
                    // }
                    else if (property.name === identifierProperties.subClass) {
                        subClass = property.value;
                    }
                }
                componentObject.Name = name;
                componentObject.MainComponentClass = mainComponentClass;
                componentObject.SubComponentClass = subClass;

                if (mainComponentClass &&
                    mainComponentClass !== "" &&
                    subClass &&
                    subClass !== "") {

                    if (!(mainComponentClass in this.SheetData)) {
                        this.SheetData[mainComponentClass] = {};
                    }

                    if (!(subClass in this.SheetData[mainComponentClass])) {
                        this.SheetData[mainComponentClass][subClass] = [];
                    }

                    this.SheetData[mainComponentClass][subClass].push(componentObject);

                    sourceProperties[componentObject.ID] = componentObject;
                }
            }
        }

        return sourceProperties;
    }
}

