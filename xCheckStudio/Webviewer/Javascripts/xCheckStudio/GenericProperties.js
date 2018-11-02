function GenericProperties(name, mainComponentClass, subComponentClass)
{
    this.Name = name;
    this.MainComponentClass = mainComponentClass;
    this.SubComponentClass = subComponentClass;

    this.properties=[];
    GenericProperties.prototype.addProperty = function(genericProperty)
    {
        this.properties.push(genericProperty);
    }
}

function GenericProperty(name, format, value)
{
    this.Name = name;
    this.Format = format;
    this.Value = value;
}