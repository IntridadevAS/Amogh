function GenericProperties(name, identifier, mainComponentClass, subComponentClass)
{
    this.Name = name;
    this.Identifier = identifier;
    this.MainComponentClass = mainComponentClass;
    this.SubComponentClass = subComponentClass;

    this.properties=[];
    GenericProperties.prototype.addProperty = function(genericProperty)
    {
        this.properties.push(genericProperty);
    }

    GenericProperties.prototype.propertyExists = function(propertyName)
    {
        for (var i = 0; i < this.properties.length; i++) {           
            if (this.properties[i].Name === 'Intrida Data/'+propertyName) {
                return true;
            }
        }

        return false;
    }

    GenericProperties.prototype.getProperty = function (propertyName) {
        for (var i = 0; i < this.properties.length; i++) {   
            if (this.properties[i].Name === 'Intrida Data/'+propertyName) {
                return this.properties[i];
            }
        }
      
        return undefined;
    }
}

function GenericProperty(name, format, value)
{
    this.Name = name;
    this.Format = format;
    this.Value = value;
}