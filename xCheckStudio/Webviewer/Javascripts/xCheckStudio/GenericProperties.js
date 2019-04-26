function GenericComponent(name,
                           mainComponentClass, 
                           subComponentClass,                          
                           nodeId,
                           parentNodeId)
{
    this.Name = name;  
    this.MainComponentClass = mainComponentClass;
    this.SubComponentClass = subComponentClass;
    this.ParentNodeId = parentNodeId;
   
    
    this.NodeId = nodeId;
   
    this.ID = undefined;

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