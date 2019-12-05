var XLSX;
if (typeof (require) !== 'undefined') {
    XLSX = require('xlsx');
}

function ExcelReader() {

    this.SheetData = {};

    ExcelReader.prototype.ReadFileData = function (file) {
        return new Promise((resolve) => {
            if (file) {
                var reader = new FileReader();
                var _this = this;
                reader.onload = function (readerEvt) {
                    var data = readerEvt.target.result;
                    data = new Uint8Array(data);
                    var sourceProperties = _this.ProcessWorkbook(XLSX.read(data, { type: 'array' }));
                    return resolve(sourceProperties);
                };
                reader.readAsArrayBuffer(file);
            }
        });
    }

    ExcelReader.prototype.ProcessWorkbook = function (workbook) {
        var _this = this;
        //this.global_wb = wb;
        var wb = workbook;
        var sourceProperties = {};
        workbook.SheetNames.forEach(function (sheetName) {
            var properties = _this.ReadSheetData(sheetName, wb.Sheets[sheetName]);
            if(properties.length > 0)
            {
                for(var i = 0; i < properties.length; i++)
                {
                    properties[i]["ID"] = Object.keys(sourceProperties).length + 1;
                    sourceProperties[Object.keys(sourceProperties).length + 1] = properties[i];                   
                }                
            }
        });

        return sourceProperties;
    }

    ExcelReader.prototype.ReadSheetData = function (sheetName, sheetData) {
        // if (this.containerId === "modelTree1") {         
        var formattedExcelData = this.GetSheetData(sheetData);
        //}
        // else if (this.containerId === "modelTree2") {
        //     formattedExcelData = this.getSheetData(sheetName);
        // }
        var sourceProperties = [];
        var sourcePropertiesTemp = {};
        for (var i = 0; i < formattedExcelData.length; i++) {
            var row = formattedExcelData[i];
            var name;
            if (row.Name !== undefined) {
                name = row.Name;
            }
            else if (row.Tagnumber !== undefined) {
                name = row.Tagnumber;
            }

            if (name === undefined) {
                continue;
            }

            var mainComponentClass = sheetName;
            var subComponentClass;
            if (row["Component Class"]) {
                subComponentClass = row["Component Class"];
            }
            else if (row["Component class"]) {
                subComponentClass = row["Component class"];
            }
            else if (row.Class) {
                subComponentClass = row.Class;
            }

            if (subComponentClass === undefined) {
                continue;
            }

            // create generic properties object
            var genericPropertiesObject = new GenericComponent(name,
                mainComponentClass,
                subComponentClass);

            // add component class as generic property
            var componentClassPropertyObject = new GenericProperty("ComponentClass", "String", subComponentClass);
            genericPropertiesObject.addProperty(componentClassPropertyObject);

            // iterate node properties and add to generic properties object
            for (var key in row) {
                var value = row[key];
                if (value === undefined) {
                    value = "";
                }
                var genericPropertyObject = new GenericProperty(key, "String", value);
                genericPropertiesObject.addProperty(genericPropertyObject);
            }

            // add genericProperties object to sourceproperties collection
            if (subComponentClass in sourcePropertiesTemp) {
                sourcePropertiesTemp[subComponentClass].push(genericPropertiesObject);
            }
            else {
                sourcePropertiesTemp[subComponentClass] = [genericPropertiesObject];
            }

            sourceProperties.push(genericPropertiesObject)
        }
        if (Object.entries(sourcePropertiesTemp).length > 0 && sourcePropertiesTemp.constructor === Object) {
            this.SheetData[sheetName] = sourcePropertiesTemp;
        }

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

    ExcelReader.prototype.RestoreSheetData = function (classWiseComponents) {

        var sourceProperties = {};
        for (var mainClass in classWiseComponents) {
            var sourcePropertiesTemp = {};

            var components = classWiseComponents[mainClass];

            for (var compId in components) {
                var component = components[compId];

                var genericPropertiesObject = new GenericComponent();
                genericPropertiesObject.ID = compId;

                for (var propId in component) {
                    var property = component[propId];

                    var genericPropertyObject = new GenericProperty(property.name, "String", property.value);
                    genericPropertiesObject.addProperty(genericPropertyObject);

                    if ((property.name === "Name") ||
                        (genericPropertiesObject.Name === undefined &&
                            property.name === "Tagnumber")) {
                        genericPropertiesObject.Name = property.value;
                    }
                    else if (property.name === "ComponentClass") {
                        genericPropertiesObject.MainComponentClass = property.value;
                    }
                    else if (property.name.toLowerCase() === "component class" ||
                        property.name.toLowerCase() === "class") {
                        genericPropertiesObject.SubComponentClass = property.value;
                    }
                }

                // add genericProperties object to sourceproperties collection
                if (genericPropertiesObject.SubComponentClass in sourcePropertiesTemp) {
                    sourcePropertiesTemp[genericPropertiesObject.SubComponentClass].push(genericPropertiesObject);
                }
                else {
                    sourcePropertiesTemp[genericPropertiesObject.SubComponentClass] = [genericPropertiesObject];
                }

                sourceProperties[genericPropertiesObject.ID] = genericPropertiesObject;
            }

            this.SheetData[mainClass] = sourcePropertiesTemp;
        }

        return sourceProperties;
    }
}

