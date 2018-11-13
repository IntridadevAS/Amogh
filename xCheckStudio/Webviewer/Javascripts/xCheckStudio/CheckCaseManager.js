function CheckCaseManager() {
    this.CheckCases = [];

    CheckCaseManager.prototype.addCheckCase = function (checkCase) {
        this.CheckCases.push(checkCase);
    }
}

function CheckCase(name) {
    this.Name = name;

    this.ComponentGroups = [];

    CheckCase.prototype.addComponentGroup = function (componentGroup) {
        this.ComponentGroups.push(componentGroup);
    }

    CheckCase.prototype.componentGroupExists = function (componentClass) {
        for (var i = 0; i < this.ComponentGroups.length; i++) {
            if (this.ComponentGroups[i].Name === componentClass) {
                return true;
            }            
        }

        return false;
    }

    CheckCase.prototype.getComponentGroup = function (componentClass) {
        for (var i = 0; i < this.ComponentGroups.length; i++) {
            if (this.ComponentGroups[i].Name === componentClass) {
                return this.ComponentGroups[i];
            }            
        }
        
        return undefined;
    }
}

function CheckCaseComponentGroup(name) {
    this.Name = name;

    this.ComponentClasses = [];

    CheckCaseComponentGroup.prototype.addComponent = function (componentClass) {
        this.ComponentClasses.push(componentClass);
    }   

    CheckCaseComponentGroup.prototype.componentClassExists = function (className) {
        for (var i = 0; i < this.ComponentClasses.length; i++) {
            if (this.ComponentClasses[i].ClassName === className) {
                return true;
            }            
        }

        return false;
    }

    CheckCaseComponentGroup.prototype.getComponentClass = function (className) {
        for (var i = 0; i < this.ComponentClasses.length; i++) {
            if (this.ComponentClasses[i].ClassName === className) {
                return this.ComponentClasses[i];
            }            
        }
        
        return undefined;
    }
}

function CheckCaseComponentClass(className) {
    this.ClassName = className;

    this.MappingProperties = [];

    CheckCaseComponentClass.prototype.addMappingProperty = function (mappingProperty) {
        this.MappingProperties.push(mappingProperty);
    }

    CheckCaseComponentClass.prototype.propertyExists = function (sourceApropertyName, sourceBpropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {           
            if (this.MappingProperties[i].SourceAName === sourceApropertyName.replace('Intrida Data/','') &&
                this.MappingProperties[i].SourceBName === sourceBpropertyName.replace('Intrida Data/','')) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentClass.prototype.sourceAPropertyExists = function (sourceApropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {           
            if (this.MappingProperties[i].SourceAName === sourceApropertyName.replace('Intrida Data/','')) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentClass.prototype.sourceBPropertyExists = function (sourceBpropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {           
            if (this.MappingProperties[i].SourceBName === sourceBpropertyName.replace('Intrida Data/','')) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentClass.prototype.getProperty = function (sourceApropertyName, sourceBpropertyName) {
        for (var i = 0; i < this.MappingProperties.length; i++) {
            if (this.MappingProperties[i].SourceAName === sourceApropertyName.replace('Intrida Data/','') &&
                this.MappingProperties[i].SourceBName === sourceBpropertyName.replace('Intrida Data/','')) {
                return this.MappingProperties[i];
            }
        }
      
        return undefined;
    }
}

function CheckCaseMappingProperty(sourceAName, sourceBName, severity) {
    this.SourceAName = sourceAName;
    this.SourceBName = sourceBName;
    this.Severity = severity;
}