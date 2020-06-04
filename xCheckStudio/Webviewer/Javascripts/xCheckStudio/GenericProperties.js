function GenericComponent(name,
    mainComponentClass,
    subComponentClass,
    nodeId,
    parentNodeId,
    componentId) {
    this.Name = name;
    this.MainComponentClass = mainComponentClass;
    this.SubComponentClass = subComponentClass;
    this.ParentNodeId = parentNodeId;


    this.NodeId = nodeId;

    this.ID = componentId;

    this.properties = [];
    GenericComponent.prototype.addProperty = function (genericProperty) {
        this.properties.push(genericProperty);
    }
    
    GenericComponent.prototype.removeProperty = function (propertyName) {
        var index = -1;
        for (var i = 0; i < this.properties.length; i++) {
            if (this.properties[i].Name.toLowerCase() === propertyName.toLowerCase() &&
                this.properties[i].UserDefined) {
                index = i;
                break;
            }
        }

        if (index !== -1) {
            this.properties.splice(index, 1);
        }

        return undefined;
    }

    GenericComponent.prototype.updateProperty = function (oldPropertyName, newPropertyName, newPropertyValue) {
        for (var i = 0; i < this.properties.length; i++) {
            if (this.properties[i].Name.toLowerCase() === oldPropertyName.toLowerCase() &&
                this.properties[i].UserDefined) {
                  this.properties[i].Name = newPropertyName;
                  this.properties[i].Value = newPropertyValue;
                break;
            }
        }      
        return undefined;
    }

    GenericComponent.prototype.propertyExists = function (propertyName) {
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

function GenericProperty(
    name,
    format,
    value,
    userDefined = false) {
    this.Name = name.replace('Intrida Data/', '');
    this.Format = format;
    this.Value = value;
    this.UserDefined = userDefined;
}