function DBReader() {

    this.DBData = {};

    DBReader.prototype.ReadDBData = function (uri, connectionInfo) {
        return new Promise((resolve) => {

            if (uri) {
                this.ReadDataByJson(uri).then(function (result) {
                    return resolve(result);
                });
            }
            else if (connectionInfo) {
                this.ReadDataByConnectionInfo(connectionInfo).then(function (result) {
                    return resolve(result);
                });
            }
            else {
                return resolve(null);
            }
        });
    }

    DBReader.prototype.ReadDataByConnectionInfo = function (connectionInfo) {
        return new Promise((resolve) => {
            var _this = this;

            $.ajax({
                url: 'PHP/PDOConnectionForDatabases.php',
                type: 'POST',
                // dataType: 'JSON',
                data: ({
                    "InvokeFunction": "ReadByConnectionInfo",
                    "connectionInfo": JSON.stringify(connectionInfo)
                }),
                async: false,
                success: function (msg) {                  
                    var result = xCheckStudio.Util.tryJsonParse(msg);
                    if (result === null || result.MsgCode !== 1) {
                        return resolve(null);
                    }
                    
                    var sourceData = result.Data;
                    var sourceProperties = _this.ProcessDBData(
                        sourceData["data"], 
                        sourceData["serverType"]
                        );

                    return resolve(sourceProperties);
                },
                error: function (xhr, status, error) {
                    return resolve(undefined);
                },
            });
        });
    }

    DBReader.prototype.ReadDataByJson = function (uri) {       
        return new Promise((resolve) => {
            var _this = this;

            $.ajax({
                url: 'PHP/PDOConnectionForDatabases.php',
                type: 'POST',
                // dataType: 'JSON',
                data: ({
                    "InvokeFunction": "ReadByJSON",
                    uri: uri
                }),
                async: false,
                success: function (msg) {
                    var result = xCheckStudio.Util.tryJsonParse(msg);
                    if (result === null || result.MsgCode !== 1) {
                        return resolve(null);
                    }
                   
                    var sourceData = result.Data;
                    var sourceProperties = _this.ProcessDBData(
                        sourceData["data"],
                        sourceData["serverType"]);

                    return resolve(sourceProperties);
                },
                error: function (xhr, status, error) {
                    return resolve(undefined);
                },
            });
        });
    }

    DBReader.prototype.RestoreDBData = function (classWiseComponents, sourceType) {       
        var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(sourceType);
        if (identifierProperties === null) {
            return [];
        }

        var sourceProperties = {};
        for (var mainClass in classWiseComponents) {
            var sourcePropertiesTemp = {};
    
            var components = classWiseComponents[mainClass];
    
            for (var compId in components) {
                var component = components[compId];
    
                var genericPropertiesObject = new GenericComponent();
                genericPropertiesObject.ID = compId;
    
                // iterate over properties
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
                        userDefined);
                    genericPropertiesObject.addProperty(genericPropertyObject);

                    if (property.name.toLowerCase() === identifierProperties.name.toLowerCase()) {
                        genericPropertiesObject.Name = property.value;
                    }
                    if (property.name.toLowerCase() === identifierProperties.mainCategory.toLowerCase()) {
                        genericPropertiesObject.MainComponentClass = property.value;
                    }
                    if (property.name.toLowerCase() === identifierProperties.subClass.toLowerCase()) {
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
    
                sourceProperties[compId] = genericPropertiesObject;
            }
    
            this.DBData[mainClass] = sourcePropertiesTemp;
        }
    
        return sourceProperties;        
    }

    DBReader.prototype.ProcessDBData = function (dbData, serverType) {
        let extension = null;
        if (serverType === "sqlsrv") {
            extension = "MSSQL";
        }
        else if (serverType === "mysql") {
            extension = "MYSQL";
        }
        var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(extension);
        if (identifierProperties === null) {
            return [];
        }

        var sourceProperties = {};
        var componentId = 1;
        for (var i = 0; i < dbData.length; i++) {

            var rows = dbData[i].properties;
            var dbTable = dbData[i].TableName;

            // var subClassWiseComponents = {};
            for (var j = 0; j < rows.length; j++) {
                let row = rows[j];
                if (!identifierProperties.name in row) {
                    continue;
                }
                let name = row[identifierProperties.name];
                if (!name) {
                    continue;
                }

                // add main component class property to row item
                row["MainComponentClass"] = dbTable;

                let mainComponentClass = null;
                if (identifierProperties.mainCategory in row) {
                    mainComponentClass = row[identifierProperties.mainCategory];
                }

                let subComponentClass = null;
                if (identifierProperties.subClass in row) {
                    subComponentClass = row[identifierProperties.subClass];
                }

                // create generic properties object
                var componentObject = new GenericComponent(
                    name,
                    mainComponentClass,
                    subComponentClass,
                    undefined,
                    undefined,
                    componentId);               

                // iterate node properties and add to generic properties object
                for (var key in row) {
                    var value = row[key];
                    if (value === undefined ||
                        value === null) {
                        value = "";
                    }
                    var propObj = new GenericProperty(key, "String", value);
                    componentObject.addProperty(propObj);
                }

                if (mainComponentClass &&
                    mainComponentClass !== "" &&
                    subComponentClass &&
                    subComponentClass !== "") {

                    if (!(mainComponentClass in this.DBData)) {
                        this.DBData[mainComponentClass] = {};
                    }

                    if (!(subComponentClass in this.DBData[mainComponentClass])) {
                        this.DBData[mainComponentClass][subComponentClass] = [];
                    }
                    this.DBData[mainComponentClass][subComponentClass].push(componentObject);

                    sourceProperties[componentId] = componentObject;
                }

                componentId++;
            }
        }

        return sourceProperties;
    }
}