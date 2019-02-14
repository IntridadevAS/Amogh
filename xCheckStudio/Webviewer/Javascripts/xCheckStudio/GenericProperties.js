function GenericComponent(name,
                           mainComponentClass, 
                           subComponentClass,
                           //source,
                           //destination,
                           //ownerId,
                           nodeId,
                           /*ownerHandle*/)
{
    this.Name = name;  
    this.MainComponentClass = mainComponentClass;
    this.SubComponentClass = subComponentClass;

    // this.Source = source;
    // this.Destination = destination;
    // this.OwnerId = ownerId;
    
    this.NodeId = nodeId;

    //this.OwnerHandle = ownerHandle;
    
    this.properties=[];
    GenericComponent.prototype.addProperty = function(genericProperty)
    {
        this.properties.push(genericProperty);
    }

    GenericComponent.prototype.propertyExists = function(propertyName)
    {
        for (var i = 0; i < this.properties.length; i++) {           
            if (this.properties[i].Name.toLowerCase() === propertyName.toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    GenericComponent.prototype.getProperty = function (propertyName) {
        for (var i = 0; i < this.properties.length; i++) {   
            if (this.properties[i].Name.toLowerCase() === propertyName.toLowerCase()) {
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