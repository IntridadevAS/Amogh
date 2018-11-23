function GenericProperties(name,
                           mainComponentClass, 
                           subComponentClass,
                           source,
                           destination,
                           ownerId,
                           nodeId)
{
    this.Name = name;
  
    this.MainComponentClass = mainComponentClass;
    this.SubComponentClass = subComponentClass;

    this.Source = source;
    this.Destination = destination;
    this.OwnerId = ownerId;
    
    this.NodeId = nodeId;

    this.properties=[];
    GenericProperties.prototype.addProperty = function(genericProperty)
    {
        this.properties.push(genericProperty);
    }

    GenericProperties.prototype.propertyExists = function(propertyName)
    {
        for (var i = 0; i < this.properties.length; i++) {           
            if (this.properties[i].Name === propertyName) {
                return true;
            }
        }

        return false;
    }

    GenericProperties.prototype.getProperty = function (propertyName) {
        for (var i = 0; i < this.properties.length; i++) {   
            if (this.properties[i].Name === propertyName) {
                return this.properties[i];
            }
        }
      
        return undefined;
    }
}

function GenericProperty(name, format, value)
{
    this.Name = name.replace('Intrida Data/','');
    //this.Name = name;
    this.Format = format;
    this.Value = value;
}