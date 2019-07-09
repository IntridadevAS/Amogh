function CheckGroups() 
{
    this.CheckGroups = {};

    CheckGroups.prototype.restore = function (checkResult, isCompliance = false) 
    {

        for (var id in checkResult) {
            if (checkResult.hasOwnProperty(id)) 
            {
              var checkGroupData = checkResult[id];

              var checkGroup = new CheckGroup(checkGroupData.id, checkGroupData.componentClass, checkGroupData.categoryStatus);
              checkGroup.restore(checkGroupData.components, isCompliance);

              this.CheckGroups[id] = checkGroup;
            }
        }       
    }
}

function CheckGroup(id, componentClass, categoryStatus) 
{
    this.ID = id;
    this.ComponentClass = componentClass;
    this.categoryStatus = categoryStatus;

    this.CheckComponents = {};

    CheckGroup.prototype.restore = function (componentsData, isCompliance) 
    {
        for (var id in componentsData) 
        {
            if (componentsData.hasOwnProperty(id)) 
            {
                var componentData = componentsData[id];
                var compId = componentData.id;
                var subComponentClass =  componentData.subComponentClass;
                var status =  componentData.status;

                var sourceAName = undefined;
                var sourceBName = undefined;
                var sourceANodeId = undefined;
                var sourceBNodeId = undefined;
                if (isCompliance)
                 {
                    sourceAName = componentData.name;
                    sourceANodeId = componentData.nodeId;
                }
                else 
                {
                     sourceAName = componentData.sourceAName;
                     sourceBName = componentData.sourceBName;
                     sourceANodeId =  componentData.sourceANodeId;
                     sourceBNodeId = componentData.sourceBNodeId;
                }
                var component =new  Component(compId, 
                                            sourceAName, 
                                            sourceBName, 
                                            subComponentClass, 
                                            status, 
                                            sourceANodeId, 
                                            sourceBNodeId) ;

                component.restore(componentData.properties, isCompliance);

                this.CheckComponents[id] = component;
            }
        }
    }
}

function Component(id, 
                   sourceAName, 
                   sourceBName, 
                   subComponentClass, 
                   status, 
                   sourceANodeId, 
                   sourceBNodeId) 
{
    this.ID = id;
    this.SourceAName = sourceAName;
    this.SourceBName = sourceBName;
    this.SubComponentClass = subComponentClass;
    this.Status = status;
    this.SourceANodeId = sourceANodeId;
    this.SourceBNodeId = sourceBNodeId;

    this.properties = [];  
    
    Component.prototype.restore = function (propertiesData, isCompliance) 
    {
        for (var i = 0; i < propertiesData.length; i++) 
        {
            var propertyData = propertiesData[i];
           
            var sourceAName = undefined;
            var sourceBName = undefined;
            var sourceAValue = undefined;
            var sourceBValue = undefined;
            var transpose = undefined;
            if (isCompliance) 
            {
                sourceAName = propertyData.name;
                sourceAValue = propertyData.value;;
            }
            else 
            {
                sourceAName = propertyData.sourceAName;
                sourceBName = propertyData.sourceBName;
                sourceAValue = propertyData.sourceAValue;
                sourceBValue = propertyData.sourceBValue;
                transpose = propertyData.transpose;
            }

            // parse bool values
            var performCheck = false;            
            if(propertyData.performCheck =="1")
            {
                performCheck = true;
            }

            var result = false;
            if(propertyData.result =="1")
            {
                result = true;
            }

            var property = new Property(propertyData.id,
                                        sourceAName,
                                        sourceBName,
                                        sourceAValue,
                                        sourceBValue,
                                        result,
                                        propertyData.severity,
                                        performCheck,
                                        propertyData.description,
                                        transpose) ;

            this.properties.push(property);
        }
    }
}

function Property(id,
                  sourceAName,
                  sourceBName,
                  sourceAValue,
                  sourceBValue,
                  result,
                  severity,
                  performCheck,
                  description,
                  transpose) 
{
    this.ID = id;
    this.SourceAName = sourceAName;
    this.SourceBName = sourceBName;
    this.SourceAValue = sourceAValue;
    this.SourceBValue = sourceBValue;
    this.Result = result;
    this.Severity = severity;
    this.PerformCheck = performCheck;
    this.Description = description;
    this.transpose = transpose;
}