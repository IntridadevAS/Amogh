function DBReader(sourceType)
{
    this.SourceType = sourceType;

    this.global_wb = "";
    this.containerId = "";
    this.sourceProperties = [];
    this.dbdata = {}
    this.dbmodelbrowser = new DBModelBrowser();
}

DBReader.prototype.ReadDBData = function(fileName, Db_data, containerId, categoryPresent)
{
    this.containerId = containerId;
    this.ProcessDbData(fileName, Db_data, categoryPresent);
    this.dbmodelbrowser.createModelBrowserTable(fileName, this.dbdata, containerId, categoryPresent);
}

DBReader.prototype.ProcessDbData = function (fileName, Db_data, categoryPresent) {
    for (var i = 0; i < Db_data.length; i++) {
        var sourcePropertiesTemp = {};
        var rows = Db_data[i].properties;
        for(var j = 0; j < rows.length; j++)
        {
            var row = rows[j];
            var name = undefined;
            if(row.EquipmentNo !== undefined)
            {
                name = row.EquipmentNo;
            }
            else if(row.Name !== undefined)
            {
                name = row.Name;
            }
            if(name === undefined)
            {
                continue;
            }

            var mainComponentClass;
            if(categoryPresent)
            {
                mainComponentClass = row.category.split('.')[0].charAt(0).toUpperCase() + row.category.split('.')[0].slice(1);
            }
            else
            {
                mainComponentClass = Db_data[i].TableName.split('.')[0].charAt(0).toUpperCase() + Db_data[i].TableName.split('.')[0].slice(1);
            }
        
            var subComponentClass = " ";
            if(row["EqType"])
            {
                subComponentClass = row["EqType"];
            }
            else if(row["EqType"])
            {
                subComponentClass = row["EqType"];
            }
            else if(row.EqType)
            {
                subComponentClass = row.EqType;
            }
            else if(row.Class)
            {
                subComponentClass = row.Class;
            }
        
            if(subComponentClass === undefined)
            {
                continue;
            }        
            // var source = "";
            // var destination = "";
            // var ownerId = "";
            // var nodeId = "";

            // create generic properties object
            var genericPropertiesObject = new GenericComponent(name,
                mainComponentClass,
                subComponentClass/*,
                source,
                destination,
                ownerId,
                nodeId*/);

            // add component class as generic property
            var componentClassPropertyObject = new GenericProperty("ComponentClass", "String", subComponentClass);
            genericPropertiesObject.addProperty(componentClassPropertyObject);

            // iterate node properties and add to generic properties object
            for (var key in row) {
                var value = row[key];
                if(value === undefined)
                {
                    value = "";
                }
                var genericPropertyObject = new GenericProperty(key, "String",value);
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
        this.dbdata[mainComponentClass] = sourcePropertiesTemp;
    }
}
