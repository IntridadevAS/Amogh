function DBReader(sourceType)
{
    this.SourceType = sourceType;

    this.global_wb = "";
    this.containerId = "";
    this.sourceProperties = [];
    this.dbdata = {}
    this.dbmodelbrowser = new DBModelBrowser();
}

DBReader.prototype.ReadDBData = function(Db_data, containerId, viewerContainer)
{
    this.containerId = containerId;
    this.ProcessDbData(Db_data);
    this.addComponentsToDB(viewerContainer);
    this.dbmodelbrowser.createModelBrowserTable(this.dbdata, containerId);
}

DBReader.prototype.addComponentsToDB = function (viewerContainer) {

    var source = undefined;
    if( viewerContainer.toLowerCase() == "viewercontainer1")
    {
        source = "SourceA"
    }
    else if(viewerContainer.toLowerCase()== "viewercontainer2")
    {
        source = "SourceB"
    }         

    $.ajax({
        data: { 'Components': JSON.stringify(this.sourceProperties), 'Source' : source , 'DataSourceType' : '1D'},
        type: "POST",
        url: "PHP/AddComponentsToDB.php"
       }).done(function (data) {
        console.log(data);
        // remove busy spinner
        var busySpinner = document.getElementById("divLoading");
        busySpinner.classList.remove('show')
    });

}

DBReader.prototype.ProcessDbData = function (Db_data) {
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
            else if(row.CatalogNo != undefined)
            {
                name = row.CatalogNo;
            }
            if(name === undefined)
            {
                continue;
            }

            var mainComponentClass;
            if(Db_data[i].categoryPresent)
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
            else if(row["Class"])
            {
                subComponentClass = row["Class"];
            }
            else if(row["Component Class"])
            {
                subComponentClass = row["Component Class"];
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
