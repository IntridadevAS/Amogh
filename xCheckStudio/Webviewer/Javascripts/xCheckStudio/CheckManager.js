// var comparisonCheckManager;
// var sourceAComplianceCheckManager;
// var sourceBComplianceCheckManager;

function CheckManager(name) {
    this.Name = name;

    this.CheckComponentsGroupsData = "";
    this.CheckComponentsGroups = {};
    this.SourceANotCheckedComponents = [];
    this.SourceBNotCheckedComponents = [];
    this.SourceANotMatchedComponents = [];
    this.SourceBNotMatchedComponents = [];


    CheckManager.prototype.restore = function (checkManagerData)
    {
        for (var property in checkManagerData.CheckComponentsGroups) {
            if (checkManagerData.CheckComponentsGroups.hasOwnProperty(property)) {
                var componentGroupData = checkManagerData.CheckComponentsGroups[property];
                var checkComponentGroup = new CheckComponentGroup(componentGroupData.ComponentClass);
                checkComponentGroup.restore(componentGroupData);

                this.CheckComponentsGroups[componentGroupData.ComponentClass] = checkComponentGroup;
            }
        }
        this.SourceANotCheckedComponents =checkManagerData.SourceANotCheckedComponents;
        this.SourceBNotCheckedComponents = checkManagerData.SourceBNotCheckedComponents;
        this.SourceANotMatchedComponents = checkManagerData.SourceANotMatchedComponents;
        this.SourceBNotMatchedComponents = checkManagerData.SourceBNotMatchedComponents;

    }

    CheckManager.prototype.performCheck = function (checkCaseType,
        comparisonCheck,
        interfaceObject,
        srcComponents) {

        return new Promise((resolve) => {
            // var $this = this;
            if (comparisonCheck) {

                // get datasource definition order in checkcase
                var dataSourceOrderInCheckCase =  getDataSourceOrderInCheckcase();
       
                // selected components
                var sourceManagerA = SourceManagers["a"];
                var sourceManagerB = SourceManagers["b"];               
                var sourceASelectedComponents = sourceManagerA.ModelTree.GetSelectedComponents();
                var sourceBSelectedComponents = sourceManagerB.ModelTree.GetSelectedComponents();
                var sourceCSelectedComponents = [];
                var sourceDSelectedComponents = [];
                if ("c" in SourceManagers)
                {
                    sourceCSelectedComponents = SourceManagers["c"].ModelTree.GetSelectedComponents();
                }
                if("d" in SourceManagers)
                {
                    sourceDSelectedComponents = SourceManagers["d"].ModelTree.GetSelectedComponents();
                }

                var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
                $.ajax({
                    url: 'PHP/checkDataSourceForComparison.php',
                    type: "POST",
                    async: false,
                    data: {
                        "CheckCaseType": JSON.stringify(checkCaseType),
                        "SourceASelectedComponents": JSON.stringify(sourceASelectedComponents),
                        "SourceBSelectedComponents": JSON.stringify(sourceBSelectedComponents),
                        "SourceCSelectedComponents": JSON.stringify(sourceCSelectedComponents),
                        "SourceDSelectedComponents": JSON.stringify(sourceDSelectedComponents),
                        "dataSourceOrderInCheckCase": JSON.stringify(dataSourceOrderInCheckCase),
                        "ProjectName": projectinfo.projectname,
                        'CheckName': checkinfo.checkname,
                        'SourceComponents' : JSON.stringify(srcComponents)
                    },
                    success: function (data) {
                        return resolve(true);

                    },
                    error: function (error) {
                        return resolve(false);
                    }
                });
            }
            else {

                // flatten an array of arrays
                var comps =  [].concat.apply([], Object.values(srcComponents['components']));
                srcComponents['components'] = comps;
                
                var SelectedCompoents = interfaceObject.ModelTree.GetSelectedComponents();
                var containerID = interfaceObject.GetViewerContainerID();
                var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
                var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
                $.ajax({
                    url: 'PHP/checkDataSourceForCompliance.php',
                    type: "POST",
                    async: false,
                    data: {
                        "CheckCaseType": JSON.stringify(checkCaseType),
                        "SelectedCompoents": JSON.stringify(SelectedCompoents),
                        "SourceId": interfaceObject.Id,
                        'ProjectName': projectinfo.projectname,
                        'CheckName': checkinfo.checkname,
                        'SourceComponents' : JSON.stringify(srcComponents)
                    },
                    success: function (data) {
                        return resolve(true);
                    }
                });

            }
        });
    }   
}


function CheckComponentGroup(componentClass) {
    this.ComponentClass = componentClass;

    this.Components = [];
    CheckComponentGroup.prototype.AddCheckComponent = function (Component) {
        this.Components.push(Component);
    }

    CheckComponentGroup.prototype.restore = function (componentGroupData) {
        //this.ComponentClass = componentGroupData.ComponentClass;
        for (var i = 0; i < componentGroupData.Components.length; i++) {
            var componentData = componentGroupData.Components[i];

            var checkComponent = new CheckComponent(componentData.SourceAName,
                componentData.SourceBName,
                componentData.SourceASubComponentClass,
                componentData.SourceBSubComponentClass,
                componentData.SourceANodeId,
                componentData.SourceBNodeId);

            checkComponent.restore(componentData);
            this.Components.push(checkComponent);
        }
    }
}

function CheckComponent(sourceAName,
    sourceBName,  
    sourceASubComponentClass,
    sourceBSubComponentClass,
    sourceANodeId,
    sourceBNodeId) {

    //this.Identifier = identifier;
    this.SourceAName = sourceAName;
    this.SourceBName = sourceBName;
    this.SourceASubComponentClass = sourceASubComponentClass;
    this.SourceBSubComponentClass = sourceBSubComponentClass;

    this.Status = "OK";
    this.CheckProperties = [];

    this.SourceANodeId = sourceANodeId;
    this.SourceBNodeId = sourceBNodeId;

    CheckComponent.prototype.AddCheckProperty = function (property) {
        this.CheckProperties.push(property);

        if (!property.PerformCheck) {          
            if (property.Severity.toLowerCase() === ("Error").toLowerCase()) {
                this.Status = "Error";
            }
        }
        else {
            if (!property.Result) {
                if (property.Severity.toLowerCase() === ("Error").toLowerCase()) {
                    this.Status = "Error";
                }
                else if (property.Severity.toLowerCase() === ("Warning").toLowerCase() &&
                    this.Status.toLowerCase() !== ("Error").toLowerCase()) {
                    this.Status = "Warning";
                }
            }
        }
    }

    CheckComponent.prototype.getCheckProperty = function (sourceAPropertyName,
        sourceBPropertyName,
        complianceCheck) {
        for (var i = 0; i < this.CheckProperties.length; i++) {
            if (this.CheckProperties[i].SourceAName === sourceAPropertyName) {
                if (!complianceCheck) {
                    if (this.CheckProperties[i].SourceBName !== sourceBPropertyName) {
                        continue;
                    }
                }

                return this.CheckProperties[i];
            }
        }

        return undefined;
    }

    CheckComponent.prototype.restore = function (componentData) {
        for (var i = 0; i < componentData.CheckProperties.length; i++) {
            var checkPropertyData = componentData.CheckProperties[i];

            var checkProperty = new CheckProperty(checkPropertyData.SourceAName,
                checkPropertyData.SourceAValue,
                checkPropertyData.SourceBName,
                checkPropertyData.SourceBValue,
                checkPropertyData.Severity,
                checkPropertyData.PerformCheck,
                checkPropertyData.Description);

            checkProperty.Result = checkPropertyData.Result;
            this.AddCheckProperty(checkProperty);
        }

        if (componentData.Status.toLowerCase() === "no match") {
            // if component data having status as No match, there is no need 
            // restore properties for this component
            this.Status = "No Match";
        }
    }
}

function CheckProperty(sourceAName,
    sourceAValue,
    sourceBName,
    sourceBValue,
    severity,
    performCheck,
    description) {
    
    this.SourceAName = sourceAName;
    this.SourceAValue = sourceAValue;
    this.SourceBName = sourceBName;
    this.SourceBValue = sourceBValue;

    this.Result = sourceAValue === sourceBValue;

    this.Severity = severity;

    this.PerformCheck = performCheck;

    this.Description = description;
}


